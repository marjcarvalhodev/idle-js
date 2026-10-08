import { UTILS } from "./utils.js";
import { DATA } from "./data.js";
import { Player } from "./player.js";
import { Dungeon, dungeonEvents } from "./dungeon.js";
import { Battle } from "./battle.js";

const gameStates = {
  EXPLORING: "exploring",
  FIGHTING: "fighting",
  IDLE: "idle"
};

const DEBUG = true;

const IDLE_TICK = 100;

const DEFAULT_STATE = {
  version: 1,
  gameState: gameStates.IDLE,
  autoBattle: false,
  paused: true,
  battle: null,
  dungeon: null,
  log: [],
  lastSavedAt: Date.now()
};

export class Game {
  constructor(savedState) {
    this.state = {
      ...UTILS.clone(DEFAULT_STATE),
      ...(savedState ? UTILS.clone(savedState) : {})
    };

    this.state.player = { ...(this.state.player ?? new Player()) };

    this.state.log = Array.isArray(this.state.log) ? this.state.log : [];

    this.idleTick = IDLE_TICK;
    this.idleCounter = 0;
    this.patience = 3;
  }

  update(dt) {
    if (this.state.paused) {
      return;
    }

    switch (this.state.gameState) {
      case gameStates.EXPLORING: {
        this.handleExploration();
        break;
      }

      case gameStates.FIGHTING: {
        this.handleFighting(dt);
        break;
      }

      case gameStates.IDLE: {
        this.handleIdle(dt);
        break;
      }

      default: {
        break;
      }
    }
  }

  handleIdle(dt) {
    if (this.idleCounter > this.patience) {
      this.log("time for some trouble!");

      this.state.gameState = gameStates.EXPLORING;
      this.patience = Math.random() * 10;
      this.idleCounter = 0;

      return;
    }

    this.idleTick -= dt;
    if (this.idleTick <= 0) {
      this.log("mopping around...");

      this.idleTick += IDLE_TICK;
      this.idleCounter++;
    }
  }

  handleExploration() {
    if (!this.state.dungeon) {
      this.findDungeon();
    }

    this.state.dungeon.rollExploration();
    const event = this.state.dungeon.event;

    switch (event) {
      case dungeonEvents.NOTHING: {
        this.state.gameState = gameStates.IDLE;
        break;
      }
      case dungeonEvents.FIGHT: {
        this.state.gameState = gameStates.FIGHTING;
        break;
      }
      case dungeonEvents.LOOT: {
        this.state.gameState = gameStates.IDLE;
        break;
      }

      default: {
        break;
      }
    }
  }

  handleFighting(dt) {
    if (!this.state.battle) {
      this.startBattle();
    }

    if (this.state.battle.phase === "waiting") {
      this.log("Player turn");
    }

    if (this.state.battle.phase === "fight" || this.state.battle.phase === "move") {
      this.state.battle.update(dt);
    }

    if (this.state.battle.phase === "ended") {
      this.battleResult();
      this.cleanUpBattle();
    }
  }

  findDungeon() {
    const biome = UTILS.pickRandom(DATA.biomes);
    this.state.dungeon = new Dungeon(biome, this.state.player.level());
  }

  startBattle() {
    const enemy = this.state.dungeon.eventData;
    this.state.battle = new Battle([{ ...this.state.player }, enemy]);
  }

  battleResult() {
    this.log("battle ended");

    if (this.state.battle.loser().name !== "Hero") {
      this.log("player won");

      this.state.player.exp += 1;

      if (this.state.player.level() > this.state.player.lastLevel) {
        this.state.player.lastLevel++;
        this.log("*** PLAYER LEVEL UP!!! ***");
      }
    } else {
      this.log("player lost");
    }
  }

  cleanUpBattle() {
    this.state.battle = null;
    this.state.dungeon = null;
    this.state.gameState = gameStates.IDLE;
    if (this.state.player.stats.hp <= 0) {
      this.state.player.recover();
      this.patience = 10;
    }
  }

  battleAction() {
    this.state.battle?.playerAction();
  }

  log(message) {
    if (DEBUG) console.log(message);
    this.state.log.unshift(message);
    this.state.log = this.state.log.slice(0, 3);
  }

  pause() {
    this.state.paused = !this.state.paused;
  }

  reset() {
    this.state = {
      ...UTILS.clone(DEFAULT_STATE)
    };
  }

  autoBattle() {
    this.state.autoBattle = !this.state.autoBattle;
    if (this.state.paused) {
      this.state.paused = false;
    }
  }
}
