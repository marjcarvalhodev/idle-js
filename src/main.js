import { Game } from "./game.js";
import { loadState, saveState } from "./save.js";
import { Renderer } from "./render.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#game");
const game = new Game(loadState());

const renderer = new Renderer(canvas, game);
const input = new Input(game);

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
