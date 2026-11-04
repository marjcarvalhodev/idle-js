import { DATA } from "./data.js";
import { UTILS } from "./utils.js";

export const effects = {
  damage: (a, t) => damage(a, t),
  dodge: (a, t) => dodge(a, t),
  statBoost: (a, s, v = 0, p = 1) => statBoost(a, s, v, p),
  bleed: (t, v, p) => bleed(t, v, p)
};

function damage(actor, target) {
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

function dodge(actor, target) {
  const atkSpd = actor.stats.spd;
  const defSpd = target.stats.spd;

  const advantage = (defSpd - atkSpd) / Math.max(1, defSpd + atkSpd);

  const chance = Math.max(0, Math.min(0.35, advantage));
  return Math.random() < chance;
}

function statBoost(actor, stat, value, percent) {
  actor.stats[stat] += value;
  actor.stats[stat] *= (100 + percent) / 100;
}

function bleed(target, value, percent) {
  if (value > 0) {
    target.stats.hp -= value;
    return;
  }

  if (percent > 0) {
    target.stats.hp -= (percent * target.stats.hp) / 100;
    return;
  }
}

export const STATUS = {
  BLEED: { type: bleed, duration: 3, value: null, percent: 5 }
};
