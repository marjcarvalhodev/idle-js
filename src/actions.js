import { DATA } from "./data.js";
import { UTILS } from "./utils.js";
import { effects } from "./effects.js";

const actions = {
  attack: (a, t) => attack(a, t),
  defend: (a, t) => defend(a, t),
  heal: (a, t) => heal(a, t)
};

function attack(actor, target) {
  console.log("2");

  if (effects.dodge(actor, target)) {
    console.log(`attack failed`);
    return;
  }
  console.log("5");

  const dmg = effects.damage(actor, target);
  target.stats.hp -= dmg;
  return dmg;
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
  console.log("1");
  return actions[action]?.(actor, target);
}
