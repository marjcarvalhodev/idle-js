function clone(value) {
  return structuredClone(value);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rollRandom(range) {
  return Math.floor(Math.random() * range);
}

function pickRandom(object) {
  const values = Object.values(object);
  return values[rollRandom(values.length)];
}

function weightedRoll(weights) {
  const entries = Object.entries(weights);

  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let roll = Math.random() * total;

  for (const [value, weight] of entries) {
    roll -= weight;

    if (roll < 0) {
      return value;
    }
  }

  return entries.at(-1)[0];
}

function simulation(weights, n = 10000) {
  const results = Object.fromEntries(Object.keys(weights).map((key) => [key, 0]));

  for (let i = 0; i < n; i++) {
    const result = weightedRoll(weights);
    results[result]++;
  }

  Object.entries(results).forEach(([key, count]) => {
    const actual = (count / n) * 100;
    const expected = (weights[key] / Object.values(weights).reduce((a, b) => a + b, 0)) * 100;

    console.log(`${key}: ${actual.toFixed(2)}% (expected: ${expected.toFixed(2)}%)`);
  });

  return results;
}

export const UTILS = {
  clone,
  rollRandom,
  pickRandom,
  weightedRoll,
  simulation
};
