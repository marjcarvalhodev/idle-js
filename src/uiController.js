export class UIController {
  constructor() {
    this.scene = "battle";
    this.overlay = null;
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
}
