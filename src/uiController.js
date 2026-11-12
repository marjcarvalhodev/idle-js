import { Renderer } from "./render.js";

export class UIController {
  constructor(viewContainer) {
    this.viewContainer = viewContainer;
    this.currentView = null;
    this.renderer = null;

    this.scene = "battle";
    this.overlay = null;

    this.loadView();
  }

  setScene(scene) {
    this.scene = scene;
  }

  openOverlay(name) {
    this.overlay = name;
  }

  closeOverlay() {
    this.overlay = null;
  }

  toggleOverlay(name) {
    this.overlay = this.overlay === name ? null : name;
  }

  async loadView(viewName = "home") {
    this.currentView = viewName;

    const response = await fetch(`./views/${viewName}.html`);
    this.viewContainer.innerHTML = await response.text();

    if (viewName === "battle") {
      const canvas = this.viewContainer.querySelector("#canvas");
      // this.renderer = new Renderer(canvas, game);
    } else {
      this.renderer = null;
    }
  }

  updateView(dt) {
    switch (this.currentView) {
      case "battle":
        // renderer?.render(dt);
        break;

      case "bag": {
        const container = this.viewContainer.querySelector("#inventory");
        // const bag = game.state.player?.inventory ?? {};

        if (container) {
          // container.textContent = JSON.stringify(bag, null, 2);
        }

        break;
      }
    }
  }
}
