import { ENEMIES } from "../content/enemies.js";
import { rollDrops } from "../content/drops.js";

export const GAME_TICK = 160;

export const EXP_PER_LEVEL = 20;

const BASE = { hp: 20, atk: 3, def: 1 };
const MOD = { hp: 5, atk: 1, def: 1 };

const DEFAULT_STATE = {
  version: 1,
  player: {
    name: "HERO",
    exp: 0,
    gold: 0,
    kills: 0,
    deaths: 0,
    equipment: { hp: 0, atk: 0, def: 0 },
    inventory: {}
  },
  autoBattle: true,
  paused: true,
  battle: null,
  log: [],
  lastSavedAt: Date.now()
};

function clone(value) {
  return structuredClone(value);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function playerLevel(exp) {
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
}

export function playerStats(state) {
  const p = state.player;
  const level = playerLevel(p.exp);
  const eq = p.equipment ?? {};

  return {
    level,
    hp: BASE.hp + level * MOD.hp + (eq.hp ?? 0),
    atk: BASE.atk + level * MOD.atk + (eq.atk ?? 0),
    def: BASE.def + level * MOD.def + (eq.def ?? 0)
  };
}

function getActorAndTarget(game, actor) {
  const battle = game.state.battle;
  if (!battle) return null;

  const player = playerStats(game.state);

  return actor === "player"
    ? {
        actorStats: player,
        targetStats: battle.enemy,
        actorHp: () => battle.playerHp,
        setActorHp: (value) => (battle.playerHp = value),
        targetHp: () => battle.enemy.hp,
        setTargetHp: (value) => (battle.enemy.hp = value),
        actorName: "You",
        targetName: battle.enemy.name,
        actorId: "player",
        targetId: "enemy"
      }
    : {
        actorStats: battle.enemy,
        targetStats: player,
        actorHp: () => battle.enemy.hp,
        setActorHp: (value) => (battle.enemy.hp = value),
        targetHp: () => battle.playerHp,
        setTargetHp: (value) => (battle.playerHp = value),
        actorName: battle.enemy.name,
        targetName: "You",
        actorId: "enemy",
        targetId: "player"
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

  startBattle() {
    const battle = this.state.battle ?? {};

    if (battle.phase === "lost") {
      this.state.battle.playerHp = playerStats(this.state).hp;
    }

    const playerHp = (this.state.battle ?? {}).playerHp ?? playerStats(this.state).hp;
    const level = playerStats(this.state).level;
    const candidates = Object.values(ENEMIES);
    const nearby = candidates.filter((e) => Math.abs(e.level - level) <= 3);
    const pool = nearby.length ? nearby : candidates;
    const template = pool[randomInt(0, pool.length - 1)];

    const enemy = {
      id: template.id,
      name: template.name,
      level: template.level,
      hp: template.hp,
      maxHp: template.hp,
      atk: template.atk,
      def: template.def,
      exp: template.exp ?? 1
    };

    this.state.battle = {
      enemy,
      playerHp: playerHp,
      phase: "fighting",
      elapsedMs: 0,
      tickMs: GAME_TICK,
      flash: 0,
      damagePopups: []
    };

    this.log(`A wild ${enemy.name} appeared!`);
  }

  battleTick() {
    const battle = this.state.battle;
    if (!battle || battle.phase !== "fighting") return;

    const p = playerStats(this.state);
    const enemy = battle.enemy;
    const enemyScript = ENEMIES[enemy.id];

    const ctx = this.createContext("player");
    ctx.attack();

    if (enemy.hp <= 0) {
      this.winBattle();
      return;
    }

    enemyScript?.onTurn?.(this.createContext("enemy"));

    if (battle.playerHp <= 0) {
      this.loseBattle();
      return;
    }
  }

  createContext(actor) {
    const game = this;

    return {
      actor,

      attack() {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const damage = Math.max(1, combat.actorStats.atk - combat.targetStats.def);

        combat.setTargetHp(combat.targetHp() - damage);

        game.state.battle.damagePopups.push({
          target: combat.targetId,
          value: damage,
          life: 500
        });

        game.state.battle.flash = 120;

        game.log(
          actor === "player"
            ? `You hit ${combat.targetName} for ${damage}.`
            : `${combat.actorName} hits you for ${damage}.`
        );

        return damage;
      },

      heal(amount) {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const heal = Math.max(0, amount);
        const maxHp = combat.actorStats.hp ?? combat.actorStats.maxHp;

        const before = combat.actorHp();
        const after = Math.min(maxHp, before + heal);

        combat.setActorHp(after);

        return after - before;
      },

      damage(amount) {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const damage = Math.max(0, amount);

        combat.setTargetHp(combat.targetHp() - damage);

        game.state.battle.damagePopups.push({
          target: combat.targetId,
          value: damage,
          life: 500
        });

        return damage;
      },

      addExp(amount) {
        game.addExp(amount);
      },

      addGold(amount) {
        game.state.player.gold = Math.max(0, game.state.player.gold + amount);
      },

      addItem(itemId, amount = 1) {
        const inv = game.state.player.inventory;
        inv[itemId] = (inv[itemId] ?? 0) + amount;
        game.log(`Found ${amount}x ${itemId}.`);
      },

      setFlag(name, value) {
        game.state.flags ??= {};
        game.state.flags[name] = value;
      },

      spawnEnemy(enemyId) {
        if (!ENEMIES[enemyId]) return;
        const e = ENEMIES[enemyId];
        game.state.battle = {
          enemy: {
            id: e.id,
            name: e.name,
            level: e.level,
            hp: e.hp,
            maxHp: e.hp,
            atk: e.atk,
            def: e.def
          },
          playerHp: playerStats(game.state).hp,
          phase: "fighting",
          elapsedMs: 0,
          tickMs: 700,
          flash: 0,
          damagePopups: []
        };
      },

      applyStatus(statusId, turns) {
        game.state.statuses ??= {};
        game.state.statuses[statusId] = {
          turns: Math.max(0, turns)
        };
      }
    };
  }

  winBattle() {
    const battle = this.state.battle;
    if (!battle) return;

    const enemy = battle.enemy;
    battle.phase = "won";
    battle.elapsedMs = 0;

    this.log(`${enemy.name} defeated! +1 EXP`);

    this.addExp(enemy.exp);

    const drops = rollDrops(enemy.id);
    for (const drop of drops) {
      this.state.player.inventory[drop.itemId] =
        (this.state.player.inventory[drop.itemId] ?? 0) + drop.amount;

      this.log(`Drop: ${drop.amount}x ${drop.itemId}`);
    }

    this.state.player.gold += enemy.level;
    this.state.player.kills += 1;

    if (!this.state.autoBattle) {
      this.pause();
    }
  }

  loseBattle() {
    const battle = this.state.battle;
    if (!battle) return;

    battle.phase = "lost";
    battle.elapsedMs = 0;

    this.log("You were defeated. Recovering...");

    this.state.player.hp = playerStats(this.state).hp;
    this.state.player.deaths += 1;
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
}
