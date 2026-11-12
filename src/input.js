export class Input {
  constructor() {
    this.actions = {};

    document.addEventListener("click", (event) => {
      const button = this.button(event);
      if (!button) return;

      this.handle(button);
    });
  }

  addActions(newActions) {
    this.actions = { ...this.actions, ...newActions };
  }

  handle(button) {
    const action = this.buttonAction(button);
    const arg = this.buttonArg(button);

    if (arg) this.actions[action]?.(arg);
    else this.actions[action]?.();
  }

  button(event) {
    return event.target.closest('[data-action^="btn-"]');
  }

  buttonAction(button) {
    return button.dataset.action.slice(4);
  }

  buttonArg(button) {
    return button.dataset.arg;
  }
}
