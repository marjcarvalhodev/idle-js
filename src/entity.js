import { UTILS } from "./utils.js";
import { DATA } from "./data.js";

const SPICE = 6;

export class Entity {
  constructor(biome = null, level = 1) {
    this.level = level;
    this.biome = biome;

    this.race = this.rollRace();
    this.damageType = this.rollDamageType();
    this.archetype = this.rollArchetype();

    this.name = `${this.race} ${this.archetype} ${this.damageType}`;

    this.baseStats = this.rollStats(DATA, this.archetype, this.level);
    this.stats = { ...this.baseStats, natRes: this.level, magRes: this.level };

    this.traits = [];

    this.statTotal = Object.values(this.stats).reduce((a, c) => (a += c));
    this.power = this.statTotal / (10 * this.level) - 1;
    console.log(
      `avg: ${this.statTotal}(${10 * this.level}) | power: ${(this.power * 100).toFixed(2)}%`
    );
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
