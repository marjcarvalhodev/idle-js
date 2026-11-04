import { DATA } from "./data.js";
import { UTILS } from "./utils.js";
import { effects, STATUS } from "./effects.js";

export const ACTIONS = {
  ATTACK: "attack",
  DEFEND: "defend",
  HEAL: "heal",
  BITE: "bite"
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
  effects.statBoost(actor, "def", 0, 10);
}

function heal(actor, target) {
  actor.stats.hp += effects.damage(actor, target);
}

function bite(actor, target) {
  const status = BLEED;
  const chance = 0.33;

  const attack = attack(actor, target);

  if (!attack.result) {
    return attack;
  }

  if (find.target.status.find(status)) {
    return attack;
  }

  applyStatusEffect(target, status, chance);
}

function applyStatusEffect(target, chance, status) {
  if (Math.random() > chance) return;

  const st = STATUS[status];

  target.status.push = { type: st.type, turns: st.duration };
}

export function resolveAction(action, actor, target) {
  const handler = actionsMap[action];

  if (!handler) {
    console.log(`${action} invalid`);
    return null;
  }

  return handler(actor, target);
}

export function resolveStatus(target, status) {
  const st = STATUS[status];

  effects[st.type]?.(target, st.value, st.percent);
  target.status[status].turns--;

  if (target.status[status].turns < 1) {
    target.status[status] = delete;
  }
}
