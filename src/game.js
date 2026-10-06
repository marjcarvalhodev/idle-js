import { rollDrops } from "../content/drops.js";
import { enums } from "./enums.js";
import { Entity } from "./entity.js";

export const GAME_TICK = 16;

export const EXP_PER_LEVEL = 10;

const BASE = { hp: 10, atk: 5, def: 5, spd: 2 };
const MOD = { hp: 3, atk: 3, def: 3, spd: 3 };

const DEFAULT_STATE = {
  version: 1,
  player: {
    name: "HERO",
    exp: 0,
    gold: 0,
    kills: 0,
    deaths: 0,
    equipment: { hp: 0, atk: 0, def: 0, spd: 0 },
    inventory: {}
  },
  autoBattle: true,
  paused: false,
  battle: null,
  log: [],
  lastSavedAt: Date.now()
};

const playerLevel = (exp) => Math.floor(exp / EXP_PER_LEVEL) + 1;

function clone(value) {
  return structuredClone(value);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function playerStats(state) {
  const level = playerLevel(state.player.exp);
  const eq = state.player.equipment ?? {};

  return {
    level,
    hp: BASE.hp + MOD.hp * level + (eq.hp ?? 0),
    atk: BASE.atk + MOD.atk * level + (eq.atk ?? 0),
    def: BASE.def + MOD.def * level + (eq.def ?? 0),
    spd: BASE.spd + MOD.spd * level + (eq.spd ?? 0)
  };
}

export class Game {
  constructor(savedState) {
    this.state = {
      ...clone(DEFAULT_STATE),
      ...(savedState ? clone(savedState) : {})
    };

    this.state.player = {
      ...clone(DEFAULT_STATE.player),
      ...(this.state.player ?? {})
    };

    this.state.player.equipment = {
      ...clone(DEFAULT_STATE.player.equipment),
      ...(this.state.player.equipment ?? {})
    };

    this.state.player.inventory = {
      ...(this.state.player.inventory ?? {})
    };

    this.state.log = Array.isArray(this.state.log) ? this.state.log : [];

    this.state.player.hp = Math.max(
      1,
      Math.min(this.state.player.hp ?? playerStats(this.state).hp, playerStats(this.state).hp)
    );

    this.startBattle();
  }

  update(dt) {
    if (this.state.paused) {
      return;
    }

    if (!this.state.battle) {
      this.startBattle();
      return;
    }

    const battle = this.state.battle;
    battle.elapsedMs += dt;

    if (battle.phase === "fighting") {
      while (battle.elapsedMs >= battle.tickMs) {
        battle.elapsedMs -= battle.tickMs;
        this.battleTick();
        if (!this.state.battle || this.state.battle.phase !== "fighting") {
          break;
        }
      }
    } else if (battle.elapsedMs >= 450) {
      this.startBattle();
    }
  }

  addExp(amount) {
    const oldLevel = playerLevel(this.state.player.exp);
    this.state.player.exp += amount;
    const newLevel = playerLevel(this.state.player.exp);

    if (newLevel > oldLevel) {
      this.state.player.hp = playerStats(this.state).hp;
      this.log(`LEVEL UP! You reached LV ${newLevel}!`);
    }
  }

  log(message) {
    this.state.log.unshift(message);
    this.state.log = this.state.log.slice(0, 3);
  }

  pause() {
    this.state.paused = !this.state.paused;
  }

  reset() {
    this.state = {
      ...clone(DEFAULT_STATE)
    };
  }

  autoBattle() {
    this.state.autoBattle = !this.state.autoBattle;
    if (this.state.paused) {
      this.state.paused = false;
    }
  }

  offlineSim() {
    this.state.paused = false;

    const iterations = 100_000;

    const startKills = this.state.player.kills;
    const startDeaths = this.state.player.deaths;
    const startExp = this.state.player.exp;
    const startInventory = structuredClone(this.state.player.inventory);

    const archetypeStats = {};
    const raceResults = {};
    const damageTypeResults = {};

    const ensureResultBucket = (map, key) => {
      map[key] ??= {
        wins: 0,
        losses: 0
      };

      return map[key];
    };

    const ensureArchetypeBucket = (archetype) => {
      archetypeStats[archetype] ??= {
        spawned: 0,
        wins: 0,
        losses: 0,

        hp: 0,
        atk: 0,
        def: 0,
        spd: 0
      };

      return archetypeStats[archetype];
    };

    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      const battle = this.state.battle;

      if (battle.phase === "fighting") {
        const enemy = battle.enemy;

        const killsBefore = this.state.player.kills;
        const deathsBefore = this.state.player.deaths;

        this.battleTick();

        const playerWon = this.state.player.kills > killsBefore;
        const playerLost = this.state.player.deaths > deathsBefore;

        if (playerWon || playerLost) {
          const archetype = enemy.archetype ?? "unknown";
          const race = enemy.race ?? "unknown";
          const damageType = enemy.damageType ?? "unknown";

          const archBucket = ensureArchetypeBucket(archetype);

          if (playerWon) {
            archBucket.wins++;
            ensureResultBucket(raceResults, race).wins++;
            ensureResultBucket(damageTypeResults, damageType).wins++;
          }

          if (playerLost) {
            archBucket.losses++;
            ensureResultBucket(raceResults, race).losses++;
            ensureResultBucket(damageTypeResults, damageType).losses++;
          }
        }
      } else {
        this.startBattle();

        const enemy = this.state.battle?.enemy;

        if (enemy) {
          const archetype = enemy.archetype ?? "unknown";
          const bucket = ensureArchetypeBucket(archetype);

          bucket.spawned++;
          bucket.hp += enemy.hp ?? 0;
          bucket.atk += enemy.atk ?? 0;
          bucket.def += enemy.def ?? 0;
          bucket.spd += enemy.spd ?? 0;
        }
      }
    }

    const elapsedMs = performance.now() - start;
    const elapsedSec = elapsedMs / 1000;

    const kills = this.state.player.kills - startKills;
    const deaths = this.state.player.deaths - startDeaths;
    const exp = this.state.player.exp - startExp;

    const resolvedBattles = kills + deaths;
    const winRate = resolvedBattles > 0 ? (kills / resolvedBattles) * 100 : 0;

    const inventoryDelta = {};

    for (const [item, amount] of Object.entries(this.state.player.inventory)) {
      const before = startInventory[item] ?? 0;
      const gained = amount - before;

      if (gained > 0) {
        inventoryDelta[item] = gained;
      }
    }

    const totalDrops = Object.values(inventoryDelta).reduce((sum, amount) => sum + amount, 0);

    const archetypeSummary = Object.fromEntries(
      Object.entries(archetypeStats).map(([archetype, data]) => {
        const resolved = data.wins + data.losses;

        return [
          archetype,
          {
            spawned: data.spawned,
            wins: data.wins,
            losses: data.losses,

            winRatePct: resolved > 0 ? Number(((data.wins / resolved) * 100).toFixed(2)) : 0,

            avgStats:
              data.spawned > 0
                ? {
                    hp: Number((data.hp / data.spawned).toFixed(2)),
                    atk: Number((data.atk / data.spawned).toFixed(2)),
                    def: Number((data.def / data.spawned).toFixed(2)),
                    spd: Number((data.spd / data.spawned).toFixed(2))
                  }
                : {}
          }
        ];
      })
    );

    const summarizeResults = (map) =>
      Object.fromEntries(
        Object.entries(map).map(([key, data]) => {
          const resolved = data.wins + data.losses;

          return [
            key,
            {
              wins: data.wins,
              losses: data.losses,
              winRatePct: resolved > 0 ? Number(((data.wins / resolved) * 100).toFixed(2)) : 0
            }
          ];
        })
      );

    console.log({
      simulation: {
        iterations,
        resolvedBattles
      },

      performance: {
        elapsedMs: Number(elapsedMs.toFixed(2)),
        iterationsPerSec: Math.round(iterations / elapsedSec),
        resolvedBattlesPerSec: resolvedBattles
          ? Number((resolvedBattles / elapsedSec).toFixed(2))
          : 0
      },

      battles: {
        kills,
        deaths,
        winRatePct: Number(winRate.toFixed(2)),
        lossRatePct: Number((100 - winRate).toFixed(2))
      },

      balance: {
        byArchetype: archetypeSummary,
        byRace: summarizeResults(raceResults),
        byDamageType: summarizeResults(damageTypeResults)
      },

      progression: {
        exp,
        expPerKill: kills > 0 ? Number((exp / kills).toFixed(2)) : 0
      },

      loot: {
        totalDrops,
        dropsPerKill: kills > 0 ? Number((totalDrops / kills).toFixed(3)) : 0,
        items: inventoryDelta
      }
    });
  }
}
