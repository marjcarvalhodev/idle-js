import { resolveAction, resolveStatus } from "./actions.js";

const MAX_DELAY = 2000;
const MAX_ACTIONS = 4;
const SPEED_FACTOR = 0.01;
const MIN_DELAY = MAX_DELAY / MAX_ACTIONS;
const decay = (spd, level) => Math.exp((-SPEED_FACTOR * spd) / Math.sqrt(level));
const actionDelay = (spd, level) => MIN_DELAY + (MAX_DELAY - MIN_DELAY) * decay(spd, level);

const actionResult = { result: null, log: null, uiMsg: null, effect: null };

export class Battle {
  constructor(actors = [], atbMode = "auto") {
    this.atbMode = atbMode;
    this.actors = actors;
    this.phase = "fight";
    this.turns = 0;
    this.log = "battle started";

    this.battleTick = MAX_DELAY;

    this.damagePopups = [];

    this.actors.forEach((actor) => {
      actor.delay = actionDelay(actor.stats.spd, actor.level);
      actor.status = [];
    });

    this.runningEffects = [];
  }

  player = () => this.actors.find((a) => a.archetype === "hero");
  enemy = () => this.actors.find((a) => a.archetype !== "hero");
  loser = () => this.actors.find((a) => a.stats.hp <= 0);
  targetOf = (a) => this.actors.find((o) => o !== a && o.stats.hp > 0);

  update(dt) {
    if (this.battleEnded()) {
      this.phase = "ended";
      return;
    }

    this.battleTick -= dt;
    if (this.battleTick <= 0) {
      this.handleEffect();
      this.battleTick += MIN_DELAY;

      if (this.battleEnded()) {
        this.phase = "ended";
        return;
      }
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

  playerTurn(a) {
    return this.phase === "fight" && a.archetype === "hero";
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

    const target = this.targetOf(actor);
    const actionResult = resolveAction(actor.nextAction(), actor, target);

    if (actionResult.effect) {
      this.runningEffects.push({ ...actionResult.effect, target: target });
    }

    this.toLog(actionResult.log);
    this.updateUi(actor, actionResult.uiMsg);

    actor.delay += actionDelay(actor.stats.spd, actor.level);
  }

  updateUi(target, value) {
    this.damagePopups.push({ target: target, value: value, life: 500 });
  }

  handleEffect() {
    for (const ae of this.runningEffects) {
      if (!ae.target.alive) continue;

      const r = resolveStatus(ae);
      this.toLog(r);
      this.updateUi(ae.target, `-${ae.value || ae.percent}`);
      ae.duration--;
    }

    this.runningEffects = this.runningEffects.filter((ae) => ae.duration > 0 && ae.target.alive);
  }

  toLog(message) {
    this.log = `[TURN ${this.turns}] ${message}`;
  }
}
