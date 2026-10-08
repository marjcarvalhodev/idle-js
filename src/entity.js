import { UTILS } from "./utils.js";
import { DATA } from "./data.js";

const SPICE = 5;

export class Entity {
  constructor(biome = null, level = 1) {
    this.level = level;
    this.biome = biome;

    this.race = this.rollRace();
    this.archetype = this.rollArchetype();
    this.damageType = this.rollDamageType();

    this.name = `${this.race} ${this.archetype} ${this.damageType}`;

    this.baseStats = this.rollStats(DATA, this.archetype, this.level);

    this.stats = { ...this.baseStats };

    this.traits = [];
  }

  onTurn(ctx) {
    ctx.attack();
  }

  rollStats(DATA, archetype, level) {
    const statBias = DATA.archStatBias[archetype];

    return {
      hp: (UTILS.rollRandom(SPICE) + statBias.hp) * level,
      atk: (UTILS.rollRandom(SPICE) + statBias.atk) * level,
      def: (UTILS.rollRandom(SPICE) + statBias.def) * level,
      spd: (UTILS.rollRandom(SPICE) + statBias.spd) * level
    };
  }

  rollRace() {
    if (!this.biome) {
      return UTILS.pickRandom(DATA.races);
    }

    return UTILS.weightedRoll(this.biome.raceBias);
  }

  rollArchetype() {
    return UTILS.pickRandom(DATA.archetypes);
  }

  rollDamageType() {
    if (!this.biome) {
      return UTILS.pickRandom(DATA.damageTypes);
    }

    return UTILS.weightedRoll(this.biome.damageBias);
  }
}
