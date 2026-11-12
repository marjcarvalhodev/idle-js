import { Game } from "./game.js";
import { saveOnClose, loadState, deleteState, snapshot, clearAppCache } from "./save.js";

import { UIController } from "./uiController.js";
import { Input } from "./input.js";
import { Balance } from "./battle/balance.js";

const GAME_SPEED = 0.5;
const viewContainer = document.querySelector("#view-container");
export const uic = new UIController(viewContainer);
export const input = new Input();
let game = new Game(loadState());
let lastFrame = performance.now();

saveOnClose(game);

function frame(now) {
  const realDt = Math.min(100, now - lastFrame);
  lastFrame = now;

  game.update(realDt * GAME_SPEED);
  uic.updateView(realDt, game.state);

  snapshot(realDt, game.state);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

input.addActions({
  home: () => uic.loadView("home"),
  world: () => uic.loadView("world"),
  bag: () => uic.loadView("bag"),
  settings: () => uic.loadView("settings")
});

input.addActions({
  reset: () => {
    deleteState();
    game = new Game();
    uic.loadView("home");
  },

  clearcache: () => clearAppCache(),
  runBench: () => new Balance()
});
