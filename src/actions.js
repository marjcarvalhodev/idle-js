import { DATA } from "./data.js";
import { UTILS } from "./utils.js";
import { effects } from "./effects.js";

export const ACTIONS = {
  ATTACK: "attack",
  DEFEND: "defend",
  heal: "heal"
};

const actionResult = { result: null, log: null, uiMsg: null };

const actionsMap = {
  attack: (a, t) => attack(a, t),
  defend: (a, t) => defend(a, t),
  heal: (a, t) => heal(a, t)
};

function attack(actor, target) {
  if (effects.dodge(actor, target)) {
    const log = `${actor.name} attacks ${target.name}... but misses.`;
    return { result: true, log: log, uiMsg: "MISS" };
  }

  const dmg = effects.damage(actor, target);
  target.stats.hp -= dmg;

  const log = `${actor.name} attacks ${target.name} for ${dmg} damage.`;
  return { result: true, log: log, uiMsg: `-${dmg}` };
}

function defend(actor, target) {
  effects.statBoost(actor, "def", 0, 20);
}

function heal(actor, target) {
  actor.stats.hp += effects.damage(actor, target);
}

function bite(actor, target) {
  effects.damage(actor, target);

  if (Math.random() < 0.333) {
    battle.effects.push = {
      type: BLEED,
      target: target,
      valuePercent: 5,
      turns: 3
    };
  }
}

export function resolveAction(action, actor, target) {
  const handler = actionsMap[action];

  if (!handler) {
    console.log(`${action} invalid`);
    return null;
  }

  return handler(actor, target);
}
