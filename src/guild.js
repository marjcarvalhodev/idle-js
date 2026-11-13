export class Guild {
  constructor() {
    this.roster = [];
    this.expeditions = [];
    this.resources = {
      gold: 0,
      food: 0,
      materials: {}
    };

    this.worldstats = {
      howlingPlains: { maxLevel: 0, totalExpeditions: 0 },
      weepingWoods: { maxLevel: 0, totalExpeditions: 0 },
      crunchingPeaks: { maxLevel: 0, totalExpeditions: 0 },
      empireFortress: { maxLevel: 0, totalExpeditions: 0 },
      chaosDesert: { maxLevel: 0, totalExpeditions: 0 }
    };
  }
}
