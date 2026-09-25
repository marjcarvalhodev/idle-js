export class Input {
  constructor(game) {
    this.game = game;

    document.querySelectorAll("[data-action]").forEach(button => {
      const action = button.dataset.action;

      const press = event => {
        event.preventDefault();
        button.classList.add("pressed");
        this.handle(action);
      };

      const release = () => {
        button.classList.remove("pressed");
      };

      button.addEventListener("pointerdown", press);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("pointerleave", release);
    });

    window.addEventListener("keydown", event => {
      const key = event.key.toLowerCase();
      const map = {
        arrowup: "up",
        arrowdown: "down",
        arrowleft: "left",
        arrowright: "right",
        z: "a",
        enter: "a",
        x: "b",
        escape: "b"
      };

      const action = map[key];
      if (action) {
        event.preventDefault();
        this.handle(action);
      }
    });
  }

  handle(action) {
    if (action === "a") {
      this.game.pause();
    } else if (action === "b") {
      this.game.reset();
    }
  }
}
