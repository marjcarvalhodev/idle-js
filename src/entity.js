import { DATA } from "./data.js";
import { UTILS } from "./utils.js";

export class Entity {
  constructor({
    biome = null,
    level = 1,
    spice = 0,
    race = null,
    archetype = null,
    damageType = null
  } = {}) {
    this.biome = biome;
    this.level = level;

    this.race = race ?? this.rollRace();
    this.archetype = archetype ?? this.rollArchetype();
    this.damageType = damageType ?? this.rollDamageType();

    this.name = `${this.race} ${this.archetype} ${this.damageType}`;

    this.statRolls = Object.fromEntries(
      Object.keys(DATA.archStatBias[this.archetype]).map((stat) => [
        stat,
        spice > 0 ? UTILS.rollRandom(spice) : 0
      ])
    );

    this.setBaseStats();
    this.recover();

    this.traits = [];
    this.actions = [];
  }

  setBaseStats() {
    const bias = DATA.archStatBias[this.archetype];

    this.baseStats = Object.fromEntries(
      Object.entries(bias).map(([stat, value]) => [
        stat,
        (value + this.statRolls[stat]) * this.level * (stat === "hp" ? DATA.HP_FACTOR : 1)
      ])
    );
  }

  recover() {
    this.stats = {
      ...this.baseStats,
      natRes: this.level,
      magRes: this.level
    };
  }

  setLevel(level) {
    this.level = level;
    this.setBaseStats();
    this.recover();
  }

  statTotal() {
    return (
      this.baseStats.hp / DATA.HP_FACTOR +
      this.baseStats.atk +
      this.baseStats.def +
      this.baseStats.spd
    );
  }

  get power() {
    return this.statTotal() / (10 * this.level) - 1;
  }

  rollRace() {
    return this.biome ? UTILS.weightedRoll(this.biome.raceBias) : UTILS.pickRandom(DATA.races);
  }

  rollArchetype() {
    return this.biome ? UTILS.weightedRoll(this.biome.archetypeBias) : DATA.archetypes.HERO;
  }

  rollDamageType() {
    return this.biome ? UTILS.weightedRoll(this.biome.damageBias) : UTILS.pickRandom(DATA.damageTypes);
  }

  get alive() {
    return this.stats.hp > 0;
  }
}
