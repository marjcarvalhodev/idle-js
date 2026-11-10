import { DATA } from "./entity/data.js";
import { UTILS } from "./utils.js";
import { Enemy } from "./entity/enemy.js";
import { Battle } from "./battle/battle.js";

const explorationStates = {
  EXPLORING: "exploring",
  FIGHTING: "fighting",
  IDLE: "idle"
};

const DEBUG = true;

const IDLE_TICK = 100;

export const dungeonEvents = {
  NOTHING: "nothing",
  FIGHT: "fight",
  LOOT: "loot"
};

export class Dungeon {
  constructor(player, biome = null, level = 1) {
    this.player = player;
    this.biome = DATA.biomes[biome] ?? UTILS.pickRandom(DATA.biomes);
    this.level = level;

    this.eventWeights = {
      nothing: 5,
      fight: 3,
      loot: 2
    };
    this.event = dungeonEvents.NOTHING;
    this.eventData = null;

    this.idleTick = IDLE_TICK;
    this.idleCounter = 0;
    this.patience = 3;

    this.explorationState = explorationStates.IDLE;
    this.battle = null;

    this.msg = `[${this.biome.ui.title}]? this place looks fun!`;
    this.log = [this.msg];
    console.log(this.msg);
  }

  update(dt) {
    switch (this.explorationState) {
      case explorationStates.EXPLORING: {
        this.handleExploration();
        break;
      }

      case explorationStates.FIGHTING: {
        this.handleFighting(dt);
        break;
      }

      case explorationStates.IDLE: {
        this.handleIdle(dt);
        break;
      }

      default: {
        break;
      }
    }
  }

  rollExploration() {
    const event = UTILS.weightedRoll(this.eventWeights);

    switch (event) {
      case dungeonEvents.NOTHING: {
        this.logMsg(`[${event}] nah neverming..`);
        break;
      }
      case dungeonEvents.FIGHT: {
        this.rollEnemy();
        this.logMsg(`[${event}] ${this.eventData.name} is lurking..`);
        break;
      }
      case dungeonEvents.LOOT: {
        // this.rollLoot();
        // this.log = `[${event}] found ${this.eventData}!`;
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

  handleIdle(dt) {
    if (this.idleCounter > this.patience) {
      this.logMsg("time for some trouble!");

      this.explorationState = explorationStates.EXPLORING;
      this.patience = Math.random() * 10;
      this.idleCounter = 0;

      return;
    }

    this.idleTick -= dt;
    if (this.idleTick <= 0) {
      this.logMsg("mopping around..");

      this.idleTick += IDLE_TICK;
      this.idleCounter++;
    }
  }

  handleExploration() {
    this.rollExploration();
    const event = this.event;

    switch (event) {
      case dungeonEvents.NOTHING: {
        this.explorationState = explorationStates.IDLE;
        break;
      }
      case dungeonEvents.FIGHT: {
        this.explorationState = explorationStates.FIGHTING;
        break;
      }
      case dungeonEvents.LOOT: {
        this.explorationState = explorationStates.IDLE;
        break;
      }

      default: {
        break;
      }
    }
  }

  handleFighting(dt) {
    if (!this.battle) {
      this.startBattle();
    }

    if (this.battle.phase === "waiting") {
      this.logMsg("Player turn");
    }

    if (this.battle.phase === "fight" || this.battle.phase === "move") {
      this.battle.update(dt);
    }

    if (this.battle.log) {
      this.logMsg(this.battle.log);
      this.battle.log = null;
    }

    if (this.battle.phase === "ended") {
      this.battleResult();
      this.cleanUpBattle();
    }
  }

  startBattle() {
    const enemy = this.eventData;
    this.battle = new Battle([this.player, enemy], "auto");
  }

  battleResult() {
    this.logMsg("battle ended");

    if (this.battle.loser().archetype !== "hero") {
      this.logMsg("player won");

      this.player.kills += 1;
      this.player.exp += 1;

      if (Math.random() > 0.5) {
        const randCoin = Math.random() * this.battle.enemy().level;
        this.player.gold += Math.max(1, Math.floor(randCoin));
      }

      if (this.player.getLevel() > this.player.level) {
        this.player.level++;
        this.player.levelUp();
        this.player.recover();
        this.logMsg("*** PLAYER LEVEL UP!!! ***");
      }
    } else {
      this.player.deaths += 1;
      this.logMsg("player lost");
    }
  }

  cleanUpBattle() {
    this.battle = null;
    this.explorationState = explorationStates.IDLE;
    if (this.player.stats.hp <= 0) {
      this.player.recover();
      this.patience = 10;
    }
  }

  logMsg(message) {
    if (DEBUG) console.log(message);
    this.log.unshift(message);
    this.log = this.log.slice(0, 3);
  }

  // rollLoot() {
  //   this.eventData = "item";
  // }
}
