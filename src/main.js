import { Game } from "./game.js";
import { loadState, saveState, clearAppCache } from "./save.js";
import { Renderer } from "./render.js";
import { UIController } from "./uiController.js";
import { Input } from "./input.js";

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

  pause: () => game.pause(),
  autobattle: () => game.autoBattle(),
  reset: () => {
    game.reset();
    nav.home();
  },
  clearcache: () => clearAppCache()
};

const input = new Input(actions);
const game = new Game(loadState());

let renderer = null;
let currentView = "";
let saveAccumulator = 0;
let lastFrame = performance.now();

function frame(now) {
  const dt = Math.min(100, now - lastFrame);
  lastFrame = now;

  game.update(dt);
  updateView(currentView, now);

  saveAccumulator += dt;

  if (saveAccumulator >= 3_000) {
    saveState(game.state);
    saveAccumulator = 0;
  }

  requestAnimationFrame(frame);
}

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

      if (container) {
        container.textContent = JSON.stringify(game.state.player.inventory, null, 2);
      }

      break;
    }
  }
}

await loadView("battle");
requestAnimationFrame(frame);
