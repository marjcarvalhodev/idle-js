const MAX_DELAY = 5000;
const MAX_ACTIONS = 4;
const MIN_DELAY = MAX_DELAY / MAX_ACTIONS;
const SPEED_FACTOR = 0.05;

const decay = (spd) => Math.E ** (-SPEED_FACTOR * spd);
const actionDelay = (spd) => MIN_DELAY + (MAX_DELAY - MIN_DELAY) * decay(spd);

export class Battle {
  constructor(actors = []) {
    this.flow = "manual";
    this.actors = actors;
    this.phase = "fight";
    this.turns = 0;

    this.damagePopups = [];

    this.actors.forEach((actor) => {
      actor.delay = actionDelay(actor.stats.spd);
      actor.nextAction = () => this.attack(actor);
    });

    console.log("battle started");
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

    if (this.flow === "manual" && this.playerTurn(actor)) {
      this.phase = "waiting";
      return;
    }

    if (this.phase === "move") {
      this.phase = "fight";
    }

    this.turns++;

    const result = actor.nextAction();
    console.log(`[TURN ${this.turns}] ${result}`);

    actor.delay += actionDelay(actor.stats.spd);
  }

  playerTurn(a) {
    return this.phase === "fight" && a.name === "Hero";
  }

  attack(actor) {
    const target = this.target(actor);
    const damage = Math.max(1, actor.stats.atk - target.stats.def);
    target.stats.hp -= damage;

    this.updateUi(actor.name === "Hero" ? "enemy" : "player", `-${damage}`);

    return `${actor.name} attacks ${target.name} for ${damage} damage.`;
  }

  heal(actor) {
    const amount = Math.min(1, actor.baseStats.hp * 0.1);
    actor.stats.hp = Math.max(target.stats.hp + amount, actor.baseStats.hp);

    this.updateUi(actor.name !== "Hero" ? "enemy" : "player", `${damage}`);

    return `${actor.name} heals for ${amount} hp.`;
  }

  sim() {
    while (!this.battleEnded()) {
      this.update(16);
    }
    this.battleResult();
  }

  player = () => this.actors.find((a) => a.name === "Hero");
  enemy = () => this.actors.find((a) => a.name !== "Hero");
  loser = () => this.actors.find((a) => a.stats.hp <= 0);
  target = (a) => this.actors.find((o) => o !== a && o.stats.hp > 0);

  updateUi(target, value) {
    this.damagePopups.push({
      target: target,
      value: value,
      life: 500
    });
  }
}
