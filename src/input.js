export class Input {
  constructor(actions) {
    this.actions = actions;

    document.addEventListener("pointerdown", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;

      event.preventDefault();
      button.classList.add("pressed");

      this.handle(button.dataset.action);
    });

    document.addEventListener("pointerup", (event) => {
      const button = event.target.closest("[data-action]");
      button?.classList.remove("pressed");
    });

    document.addEventListener("pointercancel", (event) => {
      const button = event.target.closest("[data-action]");
      button?.classList.remove("pressed");
    });
  }

  handle(action) {
    this.actions[action]?.();
  }
}