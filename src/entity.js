const SPICE = 5;

export class Entity {
  constructor(enums, level = 1) {
    function rollRandom(range) {
      return Math.floor(Math.random() * range);
    }

    function pickRandom(object) {
      const values = Object.values(object);
      return values[rollRandom(values.length)];
    }

    function rollStats(enums, archetype, level) {
      const statBias = enums.archStatBias[archetype];

      return {
        hp: (rollRandom(SPICE) + statBias.hp) * level,
        atk: (rollRandom(SPICE) + statBias.atk) * level,
        def: (rollRandom(SPICE) + statBias.def) * level,
        spd: (rollRandom(SPICE) + statBias.spd) * level
      };
    }

    this.level = level;

    this.race = pickRandom(enums.races);
    this.archetype = pickRandom(enums.archetypes);
    this.damageType = pickRandom(enums.damageTypes);

    this.name = `${this.race} ${this.archetype} ${this.damageType}`;

    this.stats = rollStats(enums, this.archetype, this.level);

    this.traits = [];
  }

  onTurn(ctx) {
    ctx.attack();
  }
}
