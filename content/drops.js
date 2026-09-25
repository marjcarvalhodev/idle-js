const TABLES = {
  slime: [
    { itemId: "slime_gel", chance: 0.25, min: 1, max: 2 }
  ],

  bat: [
    { itemId: "bat_wing", chance: 0.20, min: 1, max: 1 }
  ],

  goblin: [
    { itemId: "coin_pouch", chance: 0.15, min: 1, max: 1 }
  ],

  mushroom: [
    { itemId: "mushroom_cap", chance: 0.30, min: 1, max: 1 }
  ]
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rollDrops(enemyId) {
  const table = TABLES[enemyId] ?? [];
  const result = [];

  for (const drop of table) {
    if (Math.random() <= drop.chance) {
      result.push({
        itemId: drop.itemId,
        amount: randomInt(drop.min, drop.max)
      });
    }
  }

  return result;
}
