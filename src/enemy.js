import { Entity } from "./entity.js";

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

  onTurn(ctx) {
    ctx.attack();
  }
}
