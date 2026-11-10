import { UTILS } from "./utils.js";
import { Enemy } from "./entity/enemy.js";

export const dungeonEvents = {
  NOTHING: "nothing",
  FIGHT: "fight",
  LOOT: "loot"
};

export class Dungeon {
  constructor(biome = null, level = 1) {
    this.biome = biome;
    this.level = level;

    this.eventWeights = {
      nothing: 5,
      fight: 3,
      loot: 2
    };
    this.event = dungeonEvents.NOTHING;
    this.eventData = null;

    this.log = `[${this.biome.ui.title}]? this place looks fun!`;
  }

  rollExploration() {
    const event = UTILS.weightedRoll(this.eventWeights);

    switch (event) {
      case dungeonEvents.NOTHING: {
        this.log = `[${event}] nah neverming...`;
        break;
      }
      case dungeonEvents.FIGHT: {
        this.rollEnemy();
        this.log = `[${event}] ${this.eventData.name} is lurking...`;
        break;
      }
      case dungeonEvents.LOOT: {
        this.rollLoot();
        this.log = `[${event}] found ${this.eventData}!`;
        break;
      }

      default: {
        break;
      }
    }

    this.event = event;
  }

  rollEnemy() {
    this.eventData = new Enemy(this.biome, this.level);
  }

  rollLoot() {
    this.eventData = "item";
  }
}
