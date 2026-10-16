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
  SWIFT: "swift",
  HERO: "hero"
};

const damageTypes = {
  NATURAL: "natural",
  MAGICAL: "magical",
  SPIRIT: "spirit",
  COSMIC: "cosmic"
};

const raceDamageMods = {
  human: { beast: 1.2, demi: 1.0, monster: 0.8, human: 1.0 },
  beast: { demi: 1.2, monster: 1.0, human: 0.8, beast: 1.0 },
  demi: { monster: 1.2, human: 1.0, beast: 0.8, demi: 1.0 },
  monster: { human: 1.2, beast: 1.0, demi: 0.8, monster: 1.0 }
};

const archStatBias = {
  balanced: { hp: 2, atk: 3, def: 3, spd: 2 },
  tank: { hp: 4, atk: 1, def: 4, spd: 1 },
  burst: { hp: 2, atk: 5, def: 1, spd: 2 },
  swift: { hp: 1, atk: 3, def: 1, spd: 5 },
  hero: { hp: 5, atk: 5, def: 5, spd: 5 }
};

const damageTypeMods = {
  natural: { def: 1.0, natRes: 1.0, magRes: 0.0 },
  magical: { def: 1.0, natRes: 0.0, magRes: 1.0 },
  spirit: { def: 1.0, natRes: 0.5, magRes: 0.5 },
  cosmic: { def: 1.5, natRes: 0.0, magRes: 0.0 }
};

const biomes = {
  howlingPlains: {
    archetypeBias: { balanced: 40, tank: 15, burst: 20, swift: 25, hero: 0 },
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
    archetypeBias: { balanced: 40, tank: 15, burst: 20, swift: 25, hero: 0 },
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
    archetypeBias: { balanced: 40, tank: 15, burst: 20, swift: 25, hero: 0 },
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
    archetypeBias: { balanced: 40, tank: 15, burst: 20, swift: 25, hero: 0 },
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
    archetypeBias: { balanced: 40, tank: 15, burst: 20, swift: 25, hero: 0 },
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

const HP_FACTOR = 3;

export const DATA = {
  races,
  archetypes,
  damageTypes,
  raceDamageMods,
  archStatBias,
  damageTypeMods,
  biomes,
  traits,
  HP_FACTOR
};
