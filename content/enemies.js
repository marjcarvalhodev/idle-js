export const ENEMIES = {
  slime: {
    id: "slime",
    name: "SLIME",
    level: 1,
    hp: 13,
    atk: 3,
    def: 1,

    onTurn(ctx) {
      ctx.attack();
    }
  },

  bat: {
    id: "bat",
    name: "BAT",
    level: 1,
    hp: 11,
    atk: 4,
    def: 1,

    onTurn(ctx) {
      ctx.attack();
    }
  },

  goblin: {
    id: "goblin",
    name: "GOBLIN",
    level: 2,
    hp: 18,
    atk: 5,
    def: 2,

    onTurn(ctx) {
      ctx.attack();
    }
  },

  mushroom: {
    id: "mushroom",
    name: "MUSHROOM",
    level: 2,
    hp: 20,
    atk: 3,
    def: 3,

    onTurn(ctx) {
      // Demonstrates scripted behavior.
      ctx.attack();
    }
  },

  boss: {
    id: "boss",
    name: "BOSS",
    level: 10,
    hp: 200,
    atk: 10,
    def: 5,

    onTurn(ctx) {
      // Demonstrates scripted behavior.
      const roll = Math.random();

      if (roll < 0.95) {
        ctx.attack();
      }
      else {
        ctx.damage(10);
      }
    }                                                                                   
  },

};
