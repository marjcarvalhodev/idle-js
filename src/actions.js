import { DATA } from "./data.js";
import { UTILS } from "./utils.js";

export const actions = {
  attack: (a, t) => attack(a, t),
  defend: (a, t) => defend(a, t),
  heal: (a, t) => heal(a, t)
};

export function attack(actor, target) {
  if (dodge(actor, target)) {
    console.log(`attack failed`);
    return;
  }

  target.stats.hp -= damage(actor, target);
}

export function defend(actor) {
  statBoost(actor, "def", 0, 20);
}

export function heal(actor, target) {
  actor.stats.hp += damage(actor, target);
}

export function bite(actor, target) {
  damage(actor, target);

  if (Math.random() < 0.333) {
    battle.effects.push = {
      type: BLEED,
      target: target,
      valuePercent: 5,
      turns: 3
    };
  }
}
