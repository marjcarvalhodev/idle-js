import { UTILS } from "./utils.js";
import { Input } from "./input.js";
import { Player } from "./entity/player.js";
import { Dungeon } from "./dungeon.js";
import { uic } from "./main.js";

const gameStates = {
  IDLE: "idle"
};

const DEFAULT_STATE = {
  version: 1,
  gameState: gameStates.IDLE,
  autoBattle: false,
  paused: false,
  dungeons: [],
  atbMode: "auto",
  log: [],
  lastSavedAt: Date.now()
};

function loadPlayer(savedPlayer) {
  const player = new Player();

  if (savedPlayer) {
    Object.assign(player, savedPlayer);

    player.baseStats = {
      ...player.baseStats,
      ...(savedPlayer.baseStats ?? {})
    };

    player.stats = {
      ...player.stats,
      ...(savedPlayer.stats ?? {})
    };

    player.equipment = {
      ...player.equipment,
      ...(savedPlayer.equipment ?? {})
    };

    player.inventory = {
      ...player.inventory,
      ...(savedPlayer.inventory ?? {})
    };
  }

  return player;
}

export class Game {
  constructor(input, savedState) {
    this.input = input;
    this.inputHandler();

    this.state = {
      ...UTILS.clone(DEFAULT_STATE),
      ...(savedState ? UTILS.clone(savedState) : {}),
      dungeons: []
    };

    this.state.gameState = gameStates.IDLE;

    this.state.log = Array.isArray(this.state.log) ? this.state.log : [];

    const savedPlayer = this.state.player;
    this.state.player = loadPlayer(savedPlayer);
  }

  update(dt) {
    if (this.state.paused) {
      return;
    }

    this.state.dungeons?.forEach((dungeon) => {
      dungeon?.update(dt);
    });
  }

  startExploration() {
    const d = new Dungeon(this.state.player, "howlingPlains", this.state.player.level);
    this.state.dungeons.push(d);
  }

  pause() {
    this.state.paused = !this.state.paused;
  }

  autoBattle() {
    this.state.autoBattle = !this.state.autoBattle;
    if (this.state.paused) {
      this.state.paused = false;
    }
  }

  atbMode() {
    if (this.state.atbMode === "manual") {
      this.state.atbMode = "auto";
    } else {
      this.state.atbMode = "manual";
    }

    this.state.battle.atbMode = this.state.atbMode;
  }

  battleAction() {
    this.state.battle?.playerAction();
  }

  inputHandler() {
    this.input.addActions({
      atbMode: () => this.atbMode(),
      battleAction: () => this.battleAction(),
      startExploration: () => this.startExploration(),
      autobattle: () => this.autoBattle()
    });
  }
}
