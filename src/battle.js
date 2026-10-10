import { DATA } from "./data.js";

const MAX_DELAY = 2000;
const MAX_ACTIONS = 4;
const SPEED_FACTOR = 0.05;
const MIN_DELAY = MAX_DELAY / MAX_ACTIONS;
const decay = (spd) => Math.E ** (-SPEED_FACTOR * spd);
const actionDelay = (spd) => MIN_DELAY + (MAX_DELAY - MIN_DELAY) * decay(spd);

export class Battle {
  constructor(actors = [], atbMode = "auto") {
    this.atbMode = atbMode;
    this.actors = actors;
    this.phase = "fight";
    this.turns = 0;
    this.log = "battle started";

    this.damagePopups = [];

    this.actors.forEach((actor) => {
      actor.delay = actionDelay(actor.stats.spd);
      actor.nextAction = () => this.attack(actor);
    });
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

    const result = actor.nextAction();
    if (result) this.log = `[TURN ${this.turns}] ${result}`;

    actor.delay += actionDelay(actor.stats.spd);
  }

  playerTurn(a) {
    return this.phase === "fight" && a.archetype === "hero";
  }

  attack(actor) {
    const target = this.targetOf(actor);
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

  sim() {
    while (!this.battleEnded()) {
      this.update(16);
    }
    this.battleResult();
  }

  damage(actor) {
    const target = this.targetOf(actor);

    const raceBonus = DATA.raceDamageMods[actor.race][target.race];
    const dmgTypeBonus = DATA.damageTypeMods[actor.damageType];

    const totalDmg = actor.stats.atk * raceBonus;

    const totalReduction = Object.entries(dmgTypeBonus).reduce(
      (sum, [stat, multiplier]) => sum + (target.stats[stat] ?? 0) * multiplier,
      0
    );

    const damage = Math.max(1, Math.round(totalDmg - totalReduction));
    return damage;
  }

  player = () => this.actors.find((a) => a.archetype === "hero");
  enemy = () => this.actors.find((a) => a.archetype !== "hero");
  loser = () => this.actors.find((a) => a.stats.hp <= 0);
  targetOf = (a) => this.actors.find((o) => o !== a && o.stats.hp > 0);

  updateUi(target, value) {
    this.damagePopups.push({ target: target, value: value, life: 500 });
  }
}
