import { Game } from "./game.js";
import { loadState, saveOnClose, snapshot, clearAppCache } from "./save.js";

import { UIController } from "./uiController.js";
import { Input } from "./input.js";
import { Balance } from "./battle/balance.js";

saveOnClose();

const GAME_SPEED = 0.5;
const viewContainer = document.querySelector("#view-container");
export const uic = new UIController(viewContainer);
export const input = new Input();
let game = new Game(loadState());
let lastFrame = performance.now();

function frame(now) {
  const realDt = Math.min(100, now - lastFrame);
  lastFrame = now;
  const gameDt = realDt * GAME_SPEED;

  game.update(gameDt);
  uic.updateView(realDt);

  snapshot(realDt, game.state);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

input.addActions({
  home: () => uic.loadView("home"),
  world: () => uic.loadView("world"),
  bag: () => uic.loadView("bag"),
  settings: () => uic.loadView("settings"),

  reset: () => {
    game = new Game();
    uic.loadView("home");
  },

  clearcache: () => {
    clearAppCache();
    uic.loadView("home");
  },

  runBench: () => {
    const balance = new Balance();
    balance.run();
  }
});
