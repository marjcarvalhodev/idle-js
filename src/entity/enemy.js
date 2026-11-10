import { Entity } from "./entity.js";
import { ACTIONS } from "./actions.js";

const SPICE = 6;

export class Enemy extends Entity {
  constructor(biome = null, level = 1, options = {}) {
    super({
      biome,
      level,
      spice: 6,
      ...options
    });
  }

  nextAction() {
    if (Math.random() < 0.33) {
      return ACTIONS.BITE;
    }

    return ACTIONS.ATTACK;
  }
}
