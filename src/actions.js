import { DATA } from "./data.js";
import { UTILS } from "./utils.js";
import { effects, STATUS } from "./effects.js";

export const ACTIONS = {
  ATTACK: "attack",
  DEFEND: "defend",
  HEAL: "heal",
  BITE: "bite"
};

const actionResult = { result: null, log: null, uiMsg: null, effect: null };

const actionsMap = {
  attack: (a, t) => attack(a, t),
  defend: (a, t) => defend(a, t),
  heal: (a, t) => heal(a, t),
  bite: (a, t) => bite(a, t),
  regen: (a, t) => regen(a, t)
};

function attack(actor, target) {
  if (effects.dodge(actor, target)) {
    const log = `${actor.name} attacks ${target.name}... but misses.`;
    return { result: false, log: log, uiMsg: "MISS" };
  }

  const dmg = effects.damage(actor, target);
  target.stats.hp -= dmg;

  const log = `${actor.name} attacks ${target.name} for ${dmg} damage.`;
  return { result: true, log: log, uiMsg: `-${dmg}` };
}

function defend(actor, target) {
  effects.statBoost(actor, "def", 0, 10);
}

function heal(actor, target) {
  const max = target.baseStats.hp;
  const dmg = effects.damage(actor, target);
  target.stats.hp = Math.max(max, target.stats.hp + dmg);
}

function bite(actor, target) {
  const status = STATUS.BLEED;
  const chance = 0.33;

  const at = resolveAction(ACTIONS.ATTACK, actor, target);

  if (!at.result) {
    return at;
  }

  if (target.status.find((st) => st.type === status.type)) {
    return at;
  }

  if (Math.random() > chance) {
    at.effect = status;
  }

  return at;
}

function regen(actor, target) {
  STATUS;
  // return actionResult.map(r => r.effect = )
}

export function resolveAction(action, actor, target) {
  const handler = actionsMap[action];

  if (!handler) {
    console.log(`${action} invalid`);
    return null;
  }

  return handler(actor, target);
}

export function resolveStatus(status) {
  effects[status.type]?.(status.target, status.value, status.percent);
  return `${status.target.name} affected by ${status.type}`;
}
