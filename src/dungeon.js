import { UTILS } from "./utils.js";
import { Entity } from "./entity.js";

export const dungeonEvents = {
  NOTHING: "nothing",
  FIGHT: "fight",
  LOOT: "loot",
};

export class Dungeon {
  constructor(biome = null, level = 1) {
    this.biome = biome;
    this.level = level;

    this.eventWeights = {
      nothing: 5,
      fight: 3,
      loot: 2,
    };
    this.event = dungeonEvents.NOTHING;
    this.eventData = null;

    console.log(`[${this.biome.ui.title}]? this place looks fun!`);
  }

  rollExploration() {
    const event = UTILS.weightedRoll(this.eventWeights);

    switch (event) {
      case dungeonEvents.NOTHING: {
        console.log(`[${event}] nah neverming...`);
        break;
      }
      case dungeonEvents.FIGHT: {
        this.rollEnemy();
        console.log(`[${event}] ${this.eventData.name} is lurking...`);
        break;
      }
      case dungeonEvents.LOOT: {
        this.rollLoot();
        console.log(`[${event}] found ${this.eventData}!`);
        break;
      }

      default: {
        break;
      }
    }

    this.event = event;
  }

  rollEnemy() {
    this.eventData = new Entity(this.biome, this.level);
  }

  rollLoot() {
    this.eventData = "item";
  }

  sim() {
    // UTILS.simulation(this.eventWeights);

    const races = {
      human: 0,
      beast: 0,
      demi: 0,
      monster: 0,
    };

    const damage = {
      natural: 0,
      magical: 0,
      spirit: 0,
      cosmic: 0,
    };

    const n = 10000;

    for (let i = 0; i < n; i++) {
      this.rollEnemy();

      races[this.eventData.race]++;
      damage[this.eventData.damageType]++;
    }

    console.log(races);
    console.log(damage);
  }
}
