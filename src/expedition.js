const EXPEDITION_GOAL = {
  FARMING: "farming",
  TRAINING: "training",
  CONQUEST: "conquest",
  SCOUTING: "scouting"
};

const EXPEDITION_EVENTS = {
  BATTLE: "battle",
  COLLECT: "collect",
  DISCOVER: "discover"
};

const EXPEDITION_FAILURE = {
  WIPEOUT: "wipeout",
  TIMEOUT: "timeout",
  HUNGER: "hunger"
};

const EXPEDITION_SUCCESS = {
  DUNGEON_LEVEL: "dungeonLevel",
  PARTY_LEVEL: "partyLevel",
  FULL_BAG: "fullBag"
};

const expeditionLayout = {
  farming: {
    success: EXPEDITION_SUCCESS.FULL_BAG,
    failure: EXPEDITION_FAILURE.TIMEOUT,
    odds: { battle: 1, collect: 7, discover: 2 },
    pace: { restHp: 50, retreatHp: 10, restFood: 50, retreatFood: 10 }
  },
  training: {
    success: EXPEDITION_SUCCESS.PARTY_LEVEL,
    failure: EXPEDITION_FAILURE.HUNGER,
    odds: { battle: 7, collect: 1, discover: 2 },
    pace: { restHp: 50, retreatHp: 10, restFood: 50, retreatFood: 10 }
  },
  conquest: {
    success: EXPEDITION_SUCCESS.DUNGEON_LEVEL,
    failure: EXPEDITION_FAILURE.DEFEAT,
    odds: { battle: 5, collect: 2, discover: 3 },
    pace: { restHp: 50, retreatHp: 10, restFood: 50, retreatFood: 10 }
  },
  scouting: {
    success: EXPEDITION_SUCCESS.DUNGEON_LEVEL,
    failure: EXPEDITION_FAILURE.TIMEOUT,
    odds: { battle: 3, collect: 3, discover: 4 },
    pace: { restHp: 50, retreatHp: 10, restFood: 50, retreatFood: 10 }
  }
};

export class Expedition {
  constructor(goal) {
    this.goal = goal ?? EXPEDITION_GOAL.SCOUTING;
    this.layout = expeditionLayout[this.goal];
    this.party = [];
  }

  shouldRest() {
    const p = this.layout.pace;
    return this.partyHp() <= p.restHp || this.partyFood() <= p.restFood;
  }

  shouldRetreat() {
    const p = this.layout.pace;
    return this.partyHp() <= p.retreatHp || this.partyFood() <= p.retreatFood;
  }

  partyHp() {
    const hpTotal = this.party.reduce((h0, h) => (h0 += h));
    return hpTotal / this.party.length;
  }

  partyFood() {
    this.party.reduce((f0, f) => (f0 += f));
  }
}
