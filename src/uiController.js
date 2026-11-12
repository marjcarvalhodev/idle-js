import { Renderer } from "./render.js";
import { UTILS } from "./utils.js";
import { EXP_PER_LEVEL } from "./entity/player.js";

const HUD_ELEMENTS = {
  playerLevel: "player-level",
  hpText: "hp-text",
  hpFill: "hp-fill",
  expText: "exp-text",
  expFill: "exp-fill",
  atk: "atk",
  def: "def",
  spd: "spd",
  gold: "gold",
  kills: "kills",
  deaths: "deaths",
  enemyName: "enemy-name",
  battleState: "battle-state",
  battleLog: "battle-log",
  dialog: "dialog"
};

export class UIController {
  constructor(viewContainer) {
    this.viewContainer = viewContainer;
    this.currentView = null;
    this.renderer = null;
    this.renderState = null;

    this.scene = "battle";
    this.overlay = null;

    this.hud = null;

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
    this.hud = null;
    this.renderer = null;
    this.renderState = null;

    this.currentView = viewName;

    const response = await fetch(`./views/${viewName}.html`);
    const html = await response.text();

    if (this.currentView !== viewName) return;

    this.viewContainer.innerHTML = html;

    if (viewName === "home") {
      this.setHud();
    }

    if (viewName === "battle") {
      this.setHud();
      this.setCanvas();
    }
  }

  updateView(dt, state) {
    switch (this.currentView) {
      case "home":
        this.updatePlayerInfo(state);
        break;

      case "battle":
        this.renderer?.render(dt, this.renderState);
        this.updatePlayerInfo(state);
        this.updateBattleInfo(state);
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

  setHud() {
    this.hud = Object.fromEntries(
      Object.entries(HUD_ELEMENTS).map(([key, id]) => [
        key,
        this.viewContainer.querySelector(`#${id}`)
      ])
    );
  }

  setCanvas() {
    const canvas = this.viewContainer.querySelector("#canvas");
    this.renderer = new Renderer(canvas);
  }

  updatePlayerInfo(state) {
    if (!this.hud) return;

    const player = state.player;
    const baseStats = player.baseStats;

    const currentHp = Math.max(0, player.stats?.hp ?? 0);
    const hpRatio = UTILS.clamp01(currentHp / baseStats.hp);
    const expInLevel = player.exp % EXP_PER_LEVEL;
    const expRatio = UTILS.clamp01(expInLevel / EXP_PER_LEVEL);

    this.hud.playerLevel.textContent = player.level;
    this.hud.hpText.textContent = `${Math.ceil(currentHp)} / ${baseStats.hp}`;
    this.hud.hpFill.style.height = `${hpRatio * 100}%`;
    this.hud.expText.textContent = `${expInLevel} / ${EXP_PER_LEVEL}`;
    this.hud.expFill.style.setProperty("--exp", `${expRatio * 100}%`);

    this.hud.atk.textContent = baseStats.atk;
    this.hud.def.textContent = baseStats.def;
    this.hud.spd.textContent = baseStats.spd;
    this.hud.gold.textContent = player.gold;
    this.hud.kills.textContent = player.kills;
    this.hud.deaths.textContent = player.deaths;
  }

  updateBattleInfo(state) {
    if (!this.hud) return;
    const dungeon = state.dungeons[0];
    const battle = dungeon?.battle;
    const log = dungeon?.log;

    this.hud.enemyName.textContent = battle
      ? `${battle.enemy().name} LV${battle.enemy().level}`
      : "—";
    this.hud.battleState.textContent = battle?.phase?.toUpperCase() ?? "IDLE";
    this.hud.battleLog.textContent = log?.join("\n");
  }
}
