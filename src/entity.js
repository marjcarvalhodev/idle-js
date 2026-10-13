import { DATA } from "./data.js";
import { UTILS } from "./utils.js";

export class Entity {
  constructor({ biome, level, baseStats }) {
    this.race = this.rollRace();
    this.damageType = this.rollDamageType();
    this.archetype = this.rollArchetype();
    this.level = level;
    this.name = `${this.race} ${this.archetype} ${this.damageType}`;

    this.baseStats = { ...baseStats };

    this.stats = {
      ...this.baseStats,
      natRes: level,
      magRes: level
    };

    this.traits = [];
    this.statusEffects = [];
    this.actions = [];
  }

  recover() {
    this.stats = {
      ...this.baseStats,
      natRes: this.level,
      magRes: this.level
    };
  }

  setBaseStats(stats) {
    this.baseStats = { ...stats };
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

  rollRace() {
    if (!this.biome) {
      return UTILS.pickRandom(DATA.races);
    }

    return UTILS.weightedRoll(this.biome.raceBias);
  }

  rollArchetype() {
    if (!this.biome) {
      return "hero";
    }
    return UTILS.pickRandom(DATA.archetypes);
  }

  rollDamageType() {
    if (!this.biome) {
      return UTILS.pickRandom(DATA.damageTypes);
    }

    return UTILS.weightedRoll(this.biome.damageBias);
  }

  get alive() {
    return this.stats.hp > 0;
  }
}
