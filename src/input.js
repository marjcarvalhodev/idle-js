export class Input {
  constructor(actions) {
    this.actions = actions;

    document.querySelectorAll("[data-action]").forEach((button) => {
      const action = button.dataset.action;

      const press = (event) => {
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
  }

  handle(action) {
    this.actions[action]?.();
  }
}
