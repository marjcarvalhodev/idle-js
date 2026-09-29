import { Game } from "./game.js";
import { loadState, saveState } from "./save.js";
import { Renderer } from "./render.js";
import { UIController } from "./uiController.js";
import { Input } from "./input.js";

const viewContainer = document.querySelector("#view-container");

const nav = {
  bag: () => loadView("bag"),
  battle: () => loadView("battle"),
  home: () => loadView("home"),
  settings: () => loadView("settings")
};

const actions = {
  ...nav,

  pause: () => game.pause(),
  autobattle: () => game.autoBattle(),
  reset: () => game.reset(),
  back: () => ui.closeOverlay()
};

new Input(actions);

const game = new Game(loadState());
const ui = new UIController();
let renderer = null;

async function loadView(viewName) {
  const response = await fetch(`./views/${viewName}.html`);
  const html = await response.text();

  viewContainer.innerHTML = html;

  const canvas = viewContainer.querySelector("#canvas");

  const gfx = canvas.getContext("2d") ?? null;
  renderer = new Renderer(gfx, game, ui);
}

loadView("home");

let lastFrame = performance.now();
let saveAccumulator = 0;

function frame(now) {
  const dt = Math.min(100, now - lastFrame);
  lastFrame = now;

  game.update(dt);
  renderer.render(now);

  saveAccumulator += dt;
  if (saveAccumulator >= 3000) {
    saveState(game.state);
    saveAccumulator = 0;
  }

  requestAnimationFrame(frame);
}

window.addEventListener("beforeunload", () => {
  saveState(game.state);
});

// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("./sw.js").catch(() => {
//     // Running from file:// or another unsupported context: ignore.
//   });
// }

requestAnimationFrame(frame);
