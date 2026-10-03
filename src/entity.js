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
        hp: (rollRandom(5) + statBias.hp) * level,
        atk: (rollRandom(5) + statBias.atk) * level,
        def: (rollRandom(5) + statBias.def) * level,
        spd: (rollRandom(5) + statBias.spd) * level
      };
    }

    this.level = level;

    this.race = pickRandom(enums.races);
    this.archetype = pickRandom(enums.archetypes);
    this.damageType = pickRandom(enums.damageTypes);

    this.name = `${this.damageType} ${this.race} ${this.archetype}`;

    this.stats = rollStats(enums, this.archetype, this.level);

    this.traits = [];
  }

  onTurn(ctx) {
    ctx.attack();
  }
}
