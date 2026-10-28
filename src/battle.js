import { DATA } from "./data.js";
import { resolveAction } from "./actions.js";

const MAX_DELAY = 2000;
const MAX_ACTIONS = 4;
const SPEED_FACTOR = 0.01;
const MIN_DELAY = MAX_DELAY / MAX_ACTIONS;
const decay = (spd, level) => Math.exp((-SPEED_FACTOR * spd) / Math.sqrt(level));
const actionDelay = (spd, level) => MIN_DELAY + (MAX_DELAY - MIN_DELAY) * decay(spd, level);

const actionResult = { result: null, log: null, uiMsg: null };

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

    const actionResult = resolveAction(actor.nextAction(), actor, this.targetOf(actor));

    this.log = `[TURN ${this.turns}] ${actionResult.log}`;
    this.updateUi(actor, actionResult.uiMsg);

    actor.delay += actionDelay(actor.stats.spd, actor.level);
  }

  playerTurn(a) {
    return this.phase === "fight" && a.archetype === "hero";
  }

  player = () => this.actors.find((a) => a.archetype === "hero");
  enemy = () => this.actors.find((a) => a.archetype !== "hero");
  loser = () => this.actors.find((a) => a.stats.hp <= 0);
  targetOf = (a) => this.actors.find((o) => o !== a && o.stats.hp > 0);

  updateUi(actor, value) {
    const target = actor.archetype === "hero" ? "enemy" : "player";
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
