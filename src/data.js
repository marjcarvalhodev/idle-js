const races = {
  HUMAN: "human",
  BEAST: "beast",
  DEMI: "demi",
  MONSTER: "monster"
};

const archetypes = {
  BALANCED: "balanced",
  TANK: "tank",
  BURST: "burst",
  SWIFT: "swift"
};

const damageTypes = {
  NATURAL: "natural",
  MAGICAL: "magical",
  SPIRIT: "spirit",
  COSMIC: "cosmic"
};

const archStatBias = {
  balanced: { hp: 2, atk: 3, def: 3, spd: 2 },
  tank: { hp: 4, atk: 1, def: 4, spd: 1 },
  burst: { hp: 2, atk: 4, def: 2, spd: 2 },
  swift: { hp: 1, atk: 3, def: 1, spd: 5 }
};

const raceDamageMods = {
  human: { beast: 2.0, demi: 1.0, monster: 0.25, human: 0.5 },
  beast: { demi: 2.0, monster: 1.0, human: 0.25, beast: 0.5 },
  demi: { monster: 2.0, human: 1.0, beast: 0.25, demi: 0.5 },
  monster: { human: 2.0, beast: 1.0, demi: 0.25, monster: 0.5 }
};

const biomes = {
  howlingPlains: {
    raceBias: { human: 25, beast: 25, demi: 25, monster: 25 },
    damageBias: { natural: 25, magical: 25, spirit: 25, cosmic: 25 },
    ui: {
      title: "Howling Plains",
      bgColor: {
        primary: "rgb(33, 52, 37)",
        secondary: "rgb(42, 64, 45)"
      }
    }
  },

  empireFortress: {
    raceBias: { human: 40, beast: 10, demi: 35, monster: 15 },
    damageBias: { natural: 40, magical: 30, spirit: 20, cosmic: 10 },
    ui: {
      title: "Empire Fortress",
      bgColor: {
        primary: "rgb(57, 39, 38)",
        secondary: "rgb(72, 49, 46)"
      }
    }
  },

  weepingWoods: {
    raceBias: { human: 10, beast: 40, demi: 20, monster: 30 },
    damageBias: { natural: 15, magical: 25, spirit: 40, cosmic: 20 },
    ui: {
      title: "Weeping Woods",
      bgColor: {
        primary: "rgb(43, 39, 56)",
        secondary: "rgb(55, 50, 70)"
      }
    }
  },

  crunchingPeaks: {
    raceBias: { human: 15, beast: 25, demi: 40, monster: 20 },
    damageBias: { natural: 35, magical: 25, spirit: 20, cosmic: 20 },
    ui: {
      title: "Crunching Peaks",
      bgColor: {
        primary: "rgb(58, 49, 38)",
        secondary: "rgb(72, 61, 46)"
      }
    }
  },

  chaosDesert: {
    raceBias: { human: 10, beast: 30, demi: 15, monster: 45 },
    damageBias: { natural: 10, magical: 30, spirit: 20, cosmic: 40 },
    ui: {
      title: "Chaos Desert",
      bgColor: {
        primary: "rgb(66, 48, 59)",
        secondary: "rgb(82, 58, 73)"
      }
    }
  }
};

const traits = [];

export const DATA = {
  races,
  archetypes,
  damageTypes,
  archStatBias,
  raceDamageMods,
  biomes,
  traits
};
