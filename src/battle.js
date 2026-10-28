import { DATA } from "./data.js";
import { resolveAction } from "./actions.js";

const MAX_DELAY = 2000;
const MAX_ACTIONS = 4;
const SPEED_FACTOR = 0.01;
const MIN_DELAY = MAX_DELAY / MAX_ACTIONS;
const decay = (spd, level) => Math.exp((-SPEED_FACTOR * spd) / Math.sqrt(level));
const actionDelay = (spd, level) => MIN_DELAY + (MAX_DELAY - MIN_DELAY) * decay(spd, level);

export class Battle {
  constructor(actors = [], atbMode = "auto") {
    this.atbMode = atbMode;
    this.actors = actors;
    this.phase = "fight";
    this.turns = 0;
    this.log = "battle started";

    this.damagePopups = [];

    this.actors.forEach((actor) => {
      actor.delay = actionDelay(actor.stats.spd, actor.level);
      actor.nextAction = () => this.attack(actor);
    });

    this.effects = [];
  }

  update(dt) {
    if (this.battleEnded()) {
      this.phase = "ended";
      return;
    }

    for (const actor of this.actors) {
      if (actor.stats.hp <= 0) continue;

      this.takeTurn(dt, actor);

      if (this.phase === "waiting") {
        break;
      }

      if (this.battleEnded()) {
        this.phase = "ended";
        break;
      }
    }
  }

  playerAction() {
    if (this.phase === "waiting") {
      this.phase = "move";
    }
  }

  battleEnded() {
    return !this.actors.every((actor) => actor.stats.hp > 0);
  }

  takeTurn(dt, actor) {
    actor.delay -= dt;

    if (actor.delay > 0) {
      return;
    }

    if (this.atbMode === "manual" && this.playerTurn(actor)) {
      this.phase = "waiting";
      return;
    }

    if (this.phase === "move") {
      this.phase = "fight";
    }

    this.turns++;

    const result = resolveAction(actor.actions[0], actor, this.targetOf(actor));
    if (result) {
      console.log(`resolveAction: ${actor.actions[0]}`);
    } else {
      console.log(`default action`);
      const res = actor.nextAction();
      this.log = `[TURN ${this.turns}] ${res}`;
    }

    actor.delay += actionDelay(actor.stats.spd, actor.level);
  }

  playerTurn(a) {
    return this.phase === "fight" && a.archetype === "hero";
  }

  attack(actor) {
    const target = this.targetOf(actor);
    if (this.dodge(actor)) {
      this.updateUi(actor.archetype === "hero" ? "enemy" : "player", `MISS`);
      return `${actor.name} attacks ${target.name}... but misses.`;
    }

    const damage = Math.max(1, this.damage(actor));
    target.stats.hp -= damage;

    this.updateUi(actor.archetype === "hero" ? "enemy" : "player", `-${damage}`);
    return `${actor.name} attacks ${target.name} for ${damage} damage.`;
  }

  heal(actor) {
    const amount = Math.min(1, actor.baseStats.hp * 0.1);
    actor.stats.hp = Math.max(target.stats.hp + amount, actor.baseStats.hp);

    this.updateUi(actor.archetype !== "hero" ? "enemy" : "player", `${damage}`);

    return `${actor.name} heals for ${amount} hp.`;
  }

  damage(actor) {
    const target = this.targetOf(actor);

    const raceBonus = DATA.raceDamageMods[actor.race][target.race];
    const dmgTypeBonus = DATA.damageTypeMods[actor.damageType];

    const tdmg = actor.stats.atk;

    const tred = Object.entries(dmgTypeBonus).reduce(
      (sum, [stat, multiplier]) => sum + (target.stats[stat] ?? 0) * multiplier,
      0
    );

    const baseDamage = (tdmg * tdmg) / (tdmg + tred);
    const damage = Math.max(1, Math.round(baseDamage * raceBonus));
    return damage;
  }

  dodge(actor) {
    const target = this.targetOf(actor);

    const atkSpd = actor.stats.spd;
    const defSpd = target.stats.spd;

    const advantage = (defSpd - atkSpd) / Math.max(1, defSpd + atkSpd);

    const chance = Math.max(0, Math.min(0.35, advantage));

    return Math.random() < chance;
  }

  player = () => this.actors.find((a) => a.archetype === "hero");
  enemy = () => this.actors.find((a) => a.archetype !== "hero");
  loser = () => this.actors.find((a) => a.stats.hp <= 0);
  targetOf = (a) => this.actors.find((o) => o !== a && o.stats.hp > 0);

  updateUi(target, value) {
    this.damagePopups.push({ target: target, value: value, life: 500 });
  }

  handleEffect() {
    while (this.effects.lenght > 0) {
      const [type, source, target, valueFlat, valuePercent, turns] = this.effects.pop();

      switch (type) {
        case BLEED: {
          bleed();
          break;
        }

        default:
          break;
      }

      if (turns > 1) {
        this.effects.push = {
          type: type,
          source: source,
          target: target,
          valueFlat: valueFlat,
          valuePercent: valuePercent,
          turns: turns--
        };
      }
    }
  }
}
