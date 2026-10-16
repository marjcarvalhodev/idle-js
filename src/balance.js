import { DATA } from "./data.js";
import { Enemy } from "./enemy.js";
import { Player } from "./player.js";
import { Battle } from "./battle.js";

const values = (o) => Object.values(o);
const DEFAULT_LEVELS = [1, 5, 10, 20, 40];
const MAX_BATTLE_MS = 120_000;
const DT_MS = 1000 / 30;

export class Balance {
  constructor() {
    this.running = false;
    this.results = null;
  }

  async run() {
    if (this.running) return;
    this.results = await this.runBalance({
      levels: [1, 5, 10, 20, 40],
      runs: 20,
      onProgress: ({ percent }) => console.log(`${percent}%`)
    });

    console.table(this.summarizeBalance(this.results, "level", "enemyArchetype"));

    this.downloadCsv(this.results);

    return this.results;
  }

  createHero(race, damageType, level) {
    return new Player({
      race,
      damageType,
      level
    });
  }

  createEnemy(race, damageType, archetype, level) {
    return new Enemy(null, level, {
      race,
      damageType,
      archetype
    });
  }

  simulate(hero, enemy, maxBattleMs, dtMs, reverseOrder) {
    const battle = new Battle(reverseOrder ? [enemy, hero] : [hero, enemy], "auto");

    const metrics = {
      playerDamage: 0,
      enemyDamage: 0,

      playerAttempts: 0,
      enemyAttempts: 0,

      playerHits: 0,
      enemyHits: 0,

      playerDodges: 0,
      enemyDodges: 0,

      playerOverkill: 0,
      enemyOverkill: 0
    };

    const originalAttack = battle.attack.bind(battle);

    battle.attack = (actor) => {
      const target = battle.targetOf(actor);
      const before = target.stats.hp;

      const isHero = actor.archetype === "hero";
      const prefix = isHero ? "player" : "enemy";

      metrics[`${prefix}Attempts`]++;

      const result = originalAttack(actor);

      const raw = Math.max(0, before - target.stats.hp);

      if (raw > 0) {
        metrics[`${prefix}Hits`]++;
        metrics[`${prefix}Damage`] += Math.min(before, raw);
        metrics[`${prefix}Overkill`] += Math.max(0, raw - before);
      } else {
        // A successful dodge by the defending actor.
        const defender = isHero ? "enemy" : "player";
        metrics[`${defender}Dodges`]++;
      }

      battle.damagePopups.length = 0;

      return result;
    };

    const limit = Math.ceil(maxBattleMs / dtMs);
    let ticks = 0;

    while (!battle.battleEnded() && ticks < limit) {
      battle.update(dtMs);
      ticks++;
    }

    const timeout = !battle.battleEnded();

    return {
      outcome: timeout ? "timeout" : hero.stats.hp > 0 ? "win" : "loss",

      turns: battle.turns,
      durationMs: ticks * dtMs,

      ...metrics
    };
  }

  createAggregate(level, pRace, pDamage, eRace, eDamage, eArch) {
    return {
      level,
      playerRace: pRace,
      playerDamageType: pDamage,
      enemyRace: eRace,
      enemyDamageType: eDamage,
      enemyArchetype: eArch,

      battles: 0,
      wins: 0,
      losses: 0,
      timeouts: 0,

      turnsTotal: 0,
      durationTotalMs: 0,

      playerDamageTotal: 0,
      enemyDamageTotal: 0,

      playerHitsTotal: 0,
      enemyHitsTotal: 0,

      enemyPowerTotal: 0,
      playerAttemptsTotal: 0,
      enemyAttemptsTotal: 0,

      playerDodgesTotal: 0,
      enemyDodgesTotal: 0
    };
  }

  finalize(a) {
    const completed = a.wins + a.losses;

    return {
      level: a.level,
      playerRace: a.playerRace,
      playerDamageType: a.playerDamageType,
      enemyRace: a.enemyRace,
      enemyDamageType: a.enemyDamageType,
      enemyArchetype: a.enemyArchetype,
      battles: a.battles,
      wins: a.wins,
      losses: a.losses,
      timeouts: a.timeouts,
      winRate: completed ? a.wins / completed : null,
      timeoutRate: a.timeouts / a.battles,
      avgTurns: a.turnsTotal / a.battles,
      avgDurationSec: a.durationTotalMs / a.battles / 1000,
      avgPlayerDamage: a.playerDamageTotal / a.battles,
      avgEnemyDamage: a.enemyDamageTotal / a.battles,
      playerDamagePerHit: a.playerHitsTotal ? a.playerDamageTotal / a.playerHitsTotal : 0,
      enemyDamagePerHit: a.enemyHitsTotal ? a.enemyDamageTotal / a.enemyHitsTotal : 0,
      avgPlayerHits: a.playerHitsTotal / a.battles,
      avgEnemyHits: a.enemyHitsTotal / a.battles,
      avgEnemyPower: a.enemyPowerTotal / a.battles,
      avgPlayerAttempts: a.playerAttemptsTotal / a.battles,
      avgEnemyAttempts: a.enemyAttemptsTotal / a.battles,
      avgPlayerDodges: a.playerDodgesTotal / a.battles,
      avgEnemyDodges: a.enemyDodgesTotal / a.battles,
      playerHitRate: a.playerAttemptsTotal ? a.playerHitsTotal / a.playerAttemptsTotal : 0,
      enemyHitRate: a.enemyAttemptsTotal ? a.enemyHitsTotal / a.enemyAttemptsTotal : 0,
      playerDodgeRate: a.enemyAttemptsTotal ? a.playerDodgesTotal / a.enemyAttemptsTotal : 0,
      enemyDodgeRate: a.playerAttemptsTotal ? a.enemyDodgesTotal / a.playerAttemptsTotal : 0
    };
  }

  /**
   * Runs all 16 player combinations against 64 enemy
   * combinations at each selected level.
   *
   * @param {{
   *   levels?: number[],
   *   runs?: number,
   *   dtMs?: number,
   *   maxBattleMs?: number,
   *   batchSize?: number,
   *   onProgress?: Function
   * }} options
   */
  async runBalance({
    levels = DEFAULT_LEVELS,
    runs = 100,
    dtMs = DT_MS,
    maxBattleMs = MAX_BATTLE_MS,
    batchSize = 1500,
    onProgress = () => {}
  } = {}) {
    if (!Number.isInteger(runs) || runs < 1) {
      throw new Error("runs must be a positive integer");
    }

    if (levels.some((l) => !Number.isInteger(l) || l < 1)) {
      throw new Error("levels must be positive integers");
    }

    if (!(dtMs > 0 && maxBattleMs > 0 && batchSize > 0)) {
      throw new Error("invalid timing/batch settings");
    }

    const races = values(DATA.races);
    const damageTypes = values(DATA.damageTypes);
    const archetypes = values(DATA.archetypes).slice(0,4);

    const total =
      levels.length * races.length ** 2 * damageTypes.length ** 2 * archetypes.length * runs;

    const rows = [];
    let completed = 0;

    for (const level of levels) {
      for (const pRace of races) {
        for (const pDamage of damageTypes) {
          for (const eRace of races) {
            for (const eDamage of damageTypes) {
              for (const eArch of archetypes) {
                const agg = this.createAggregate(level, pRace, pDamage, eRace, eDamage, eArch);

                for (let i = 0; i < runs; i++) {
                  const hero = this.createHero(pRace, pDamage, level);

                  console.assert(hero.stats.natRes && hero.stats.natRes === level);
                  console.assert(hero.stats.magRes && hero.stats.magRes === level);

                  const enemy = this.createEnemy(eRace, eDamage, eArch, level);

                  const result = this.simulate(hero, enemy, maxBattleMs, dtMs, i % 2 === 1);

                  agg.battles++;

                  if (result.outcome === "win") {
                    agg.wins++;
                  } else if (result.outcome === "loss") {
                    agg.losses++;
                  } else {
                    agg.timeouts++;
                  }

                  agg.turnsTotal += result.turns;
                  agg.durationTotalMs += result.durationMs;

                  agg.playerDamageTotal += result.playerDamage;
                  agg.enemyDamageTotal += result.enemyDamage;

                  agg.playerHitsTotal += result.playerHits;
                  agg.enemyHitsTotal += result.enemyHits;

                  agg.enemyPowerTotal += enemy.power;

                  agg.playerAttemptsTotal += result.playerAttempts;
                  agg.enemyAttemptsTotal += result.enemyAttempts;

                  agg.playerDodgesTotal += result.playerDodges;
                  agg.enemyDodgesTotal += result.enemyDodges;

                  completed++;

                  if (completed % batchSize === 0) {
                    onProgress({
                      completed,
                      total,
                      percent: +((100 * completed) / total).toFixed(1)
                    });

                    // Yield to the browser between batches.
                    await new Promise((resolve) => setTimeout(resolve, 0));
                  }
                }

                rows.push(this.finalize(agg));
              }
            }
          }
        }
      }
    }

    onProgress({ completed, total, percent: 100 });

    return rows;
  }

  /**
   * Aggregate results across selected dimensions.
   *
   * Examples:
   * summarizeBalance(rows, "level")
   * summarizeBalance(rows, "level", "enemyArchetype")
   * summarizeBalance(rows, "playerRace", "enemyRace")
   */
  summarizeBalance(rows, ...dimensions) {
    const groups = new Map();

    for (const row of rows) {
      const key = JSON.stringify(dimensions.map((d) => row[d]));

      let g = groups.get(key);

      if (!g) {
        g = {
          ...Object.fromEntries(dimensions.map((d) => [d, row[d]])),

          battles: 0,
          wins: 0,
          losses: 0,
          timeouts: 0,

          turns: 0,
          duration: 0,

          playerDamage: 0,
          enemyDamage: 0,

          playerHits: 0,
          enemyHits: 0,

          playerAttempts: 0,
          enemyAttempts: 0,
          playerDodges: 0,
          enemyDodges: 0
        };

        groups.set(key, g);
      }

      const n = row.battles;

      g.battles += n;
      g.wins += row.wins;
      g.losses += row.losses;
      g.timeouts += row.timeouts;

      g.turns += row.avgTurns * n;
      g.duration += row.avgDurationSec * n;

      g.playerDamage += row.avgPlayerDamage * n;
      g.enemyDamage += row.avgEnemyDamage * n;

      g.playerHits += row.avgPlayerHits * n;
      g.enemyHits += row.avgEnemyHits * n;

      g.playerAttempts += row.avgPlayerAttempts * n;
      g.enemyAttempts += row.avgEnemyAttempts * n;

      g.playerDodges += row.avgPlayerDodges * n;
      g.enemyDodges += row.avgEnemyDodges * n;
    }

    return Array.from(groups.values(), (g) => ({
      ...Object.fromEntries(dimensions.map((d) => [d, g[d]])),

      battles: g.battles,
      winRate: g.wins + g.losses ? g.wins / (g.wins + g.losses) : null,
      timeoutRate: g.timeouts / g.battles,
      avgTurns: g.turns / g.battles,
      avgDurationSec: g.duration / g.battles,
      avgPlayerDamage: g.playerDamage / g.battles,
      avgEnemyDamage: g.enemyDamage / g.battles,
      playerDamagePerHit: g.playerHits ? g.playerDamage / g.playerHits : 0,
      enemyDamagePerHit: g.enemyHits ? g.enemyDamage / g.enemyHits : 0,
      playerHitRate: g.playerAttempts ? g.playerHits / g.playerAttempts : 0,
      enemyHitRate: g.enemyAttempts ? g.enemyHits / g.enemyAttempts : 0,
      playerDodgeRate: g.enemyAttempts ? g.playerDodges / g.enemyAttempts : 0,
      enemyDodgeRate: g.playerAttempts ? g.enemyDodges / g.playerAttempts : 0,
      avgPlayerDodges: g.playerDodges / g.battles,
      avgEnemyDodges: g.enemyDodges / g.battles
    }));
  }

  /**
   * Export results to CSV from the browser.
   */
  downloadCsv(rows, filename = "idle-js-balance.csv") {
    if (!rows.length) return;

    const keys = Object.keys(rows[0]);

    const escape = (v) => (v == null ? "" : `"${String(v).replaceAll('"', '""')}"`);

    const csv = [
      keys.map(escape).join(","),
      ...rows.map((r) => keys.map((k) => escape(r[k])).join(","))
    ].join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
