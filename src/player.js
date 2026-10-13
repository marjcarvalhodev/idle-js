import { UTILS } from "./utils.js";
import { DATA } from "./data.js";

export const EXP_PER_LEVEL = 1;

export class Player {
  constructor() {
    this.race = UTILS.pickRandom(DATA.races);
    this.archetype = "hero";
    this.damageType = UTILS.pickRandom(DATA.damageTypes);
    this.name = `Hero ${this.race} ${this.damageType} `;
    this.initialStats = { hp: 5 * DATA.HP_FACTOR, atk: 5, def: 5, spd: 5 };
    this.baseStats = { ...this.initialStats };
    this.gold = 0;
    this.kills = 0;
    this.deaths = 0;
    this.inventory = {};

    this.exp = 0;
    this.level = this.getLevel();
    this.levelUp();
    this.stats = { ...this.baseStats, natRes: this.level, magRes: this.level };
    this.equipment = { hp: 0, atk: 0, def: 0, spd: 0 };
  }

  recover() {
    this.stats = { ...this.baseStats, natRes: this.level, magRes: this.level };
  }

  getLevel = () => Math.floor(this.exp / EXP_PER_LEVEL) + 1;

  levelUp() {
    this.baseStats = Object.fromEntries(
      Object.entries(this.initialStats).map(([stat, value]) => [stat, value * this.level])
    );

    this.stats = { ...this.baseStats, natRes: this.level, magRes: this.level };
  }
}
