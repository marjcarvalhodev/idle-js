export const EXP_PER_LEVEL = 1;

export class Player {
  constructor() {
    this.name = "Hero";
    this.initialStats = { hp: 10, atk: 5, def: 5, spd: 5 };
    this.baseStats = { hp: 10, atk: 5, def: 5, spd: 5 };
    this.stats = { ...this.baseStats };
    this.exp = 0;
    this.gold = 0;
    this.kills = 0;
    this.deaths = 0;
    this.equipment = { hp: 0, atk: 0, def: 0, spd: 0 };
    this.inventory = {};
    this.currentLevel = this.level();
  }

  recover() {
    this.stats = { ...this.baseStats };
  }

  level = () => Math.floor(this.exp / EXP_PER_LEVEL) + 1;

  levelUp() {
    this.baseStats = Object.fromEntries(
      Object.entries(this.initialStats).map(([stat, value]) => [stat, value * this.currentLevel])
    );

    this.stats = { ...this.baseStats };
  }
}
