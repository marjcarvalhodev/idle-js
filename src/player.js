export const EXP_PER_LEVEL = 10;

export class Player {
  constructor() {
    this.name = "Hero";
    this.baseStats = { hp: 10, atk: 5, def: 5, spd: 5 };
    this.stats = { ...this.baseStats };
    this.exp = 0;
    this.gold = 0;
    this.kills = 0;
    this.deaths = 0;
    this.equipment = { hp: 0, atk: 0, def: 0, spd: 0 };
    this.inventory = {};
    this.lastLevel = this.level();
  }

  recover() {
    this.stats = { ...this.baseStats };
  }

  level = () => Math.floor(this.exp / EXP_PER_LEVEL) + 1;
}
