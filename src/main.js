import { Game } from "./game.js";
import { loadState, saveState, clearAppCache } from "./save.js";
import { Renderer } from "./render.js";
import { UIController } from "./uiController.js";
import { Input } from "./input.js";

const GAME_SPEED = 0.1;

const viewContainer = document.querySelector("#view-container");

const nav = {
  bag: () => loadView("bag"),
  battle: () => loadView("battle"),
  home: () => loadView("home"),
  settings: () => loadView("settings"),
  world: () => loadView("world")
};

const actions = {
  ...nav,

  atbMode: () => game.atbMode(),
  battleAction: () => game.battleAction(),

  pause: () => game.pause(),
  autobattle: () => game.autoBattle(),

  reset: () => {
    game = new Game();
    nav.home();
  },

  clearcache: () => {
    clearAppCache();
    nav.home();
  }
};

const input = new Input(actions);
let game = new Game(loadState());

let renderer = null;
let currentView = "";
let saveAccumulator = 0;
let lastFrame = performance.now();

function frame(now) {
  const realDt = Math.min(100, now - lastFrame);
  lastFrame = now;

  const gameDt = realDt * GAME_SPEED;

  game.update(gameDt);
  updateView(currentView, now);

  saveAccumulator += realDt;

  if (saveAccumulator >= 3_000) {
    saveState(game.state);
    saveAccumulator = 0;
  }

  requestAnimationFrame(frame);
};

window.addEventListener("beforeunload", () => {
  saveState(game.state);
});

async function loadView(viewName) {
  currentView = viewName;

  const response = await fetch(`./views/${viewName}.html`);
  viewContainer.innerHTML = await response.text();

  if (viewName === "battle") {
    const canvas = viewContainer.querySelector("#canvas");
    renderer = new Renderer(canvas, game);
  } else {
    renderer = null;
  }
}

function updateView(viewName, now) {
  switch (viewName) {
    case "battle":
      renderer?.render(now);
      break;

    case "bag": {
      const container = viewContainer.querySelector("#inventory");
      const bag = game.state.player?.inventory ?? {};

      if (container) {
        container.textContent = JSON.stringify(bag, null, 2);
      }

      break;
    }
  }
}

await loadView("battle");
requestAnimationFrame(frame);
