import { DATA } from "./data.js";
import { Entity } from "./entity.js";
import { ACTIONS } from "./actions.js";

export const EXP_PER_LEVEL = 1;

export class Player extends Entity {
  constructor(options = {}) {
    super({
      archetype: DATA.archetypes.HERO,
      spice: 0,
      ...options
    });

    this.exp = 0;
    this.equipment = { hp: 0, atk: 0, def: 0, spd: 0 };

    this.gold = 0;
    this.kills = 0;
    this.deaths = 0;
    this.inventory = {};
  }

  nextAction() {
    return ACTIONS.ATTACK;
  }

  getLevel() {
    return Math.floor(this.exp / EXP_PER_LEVEL) + 1;
  }

  levelUp() {
    this.setLevel(this.getLevel());
  }
}
