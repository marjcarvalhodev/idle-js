import { DATA } from "./data.js";
import { UTILS } from "./utils.js";

export const effects = {
  damage: (a, t) => damage(a, t),
  dodge: (a, t) => dodge(a, t),
  statBoost: (a, s, v, p) => mutateStat(a, s, v, p),
  bleed: (t, v, p) => bleed(t, v, p),
  regen: (t, v, p) => regen(t, v, p)
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

function mutateStat(actor, stat, value, percent, sign = "pos") {
  if (!value && !percent) return;
  
  const mod = value ? value : (100 + percent) / 100;

  actor.stats[stat] += sign === "pos" ? mod : -mod;
}

function bleed(target, value, percent) {
  mutateStat(target, "hp", BLEED.value, BLEED.percent, "pos");
}

function regen(target, value, percent) {
  mutateStat(target, "hp", REGEN.value, REGEN.percent, "neg");
}

export const STATUS = {
  BLEED: { type: bleed, duration: 3, trigger: "tick", value: 5, percent: null },
  REGEN: { type: regen, duration: 5, trigger: "tick", value: null, percent: 5 }
};
