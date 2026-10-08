import { EXP_PER_LEVEL } from "./player.js";

const W = 420;
const H = 380;

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

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function rect(gfx, x, y, w, h, color) {
  gfx.fillStyle = color;
  gfx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export class Renderer {
  constructor(canvas, game) {
    this.gfx = canvas.getContext("2d");
    this.gfx.imageSmoothingEnabled = false;

    this.game = game;

    this.hud = Object.fromEntries(
      Object.entries(HUD_ELEMENTS).map(([key, id]) => [key, document.getElementById(id)])
    );
  }

  render(now) {
    const state = this.game.state;
    const battle = state.battle;
    const stats = state.player.stats;

    this.renderCanvas(now, state, battle);
    this.updateHud(state, battle, stats);
  }

  updateHud(state, battle, stats) {
    const currentHp = battle ? Math.max(0, stats.hp) : state.player.baseStats.hp;
    const hpRatio = clamp01(currentHp / state.player.baseStats.hp);
    const expInLevel = state.player.exp % EXP_PER_LEVEL;
    const expRatio = clamp01(expInLevel / EXP_PER_LEVEL);

    this.hud.playerLevel.textContent = state.player.currentLevel;
    this.hud.hpText.textContent = `${Math.ceil(currentHp)} / ${state.player.baseStats.hp}`;
    this.hud.hpFill.style.height = `${hpRatio * 100}%`;
    this.hud.expText.textContent = `${expInLevel} / ${EXP_PER_LEVEL}`;
    this.hud.expFill.style.setProperty("--exp", `${expRatio * 100}%`);

    this.hud.atk.textContent = state.player.baseStats.atk;
    this.hud.def.textContent = state.player.baseStats.def;
    this.hud.spd.textContent = state.player.baseStats.spd;
    this.hud.gold.textContent = state.player.gold;
    this.hud.kills.textContent = state.player.kills;
    this.hud.deaths.textContent = state.player.deaths;
    this.hud.enemyName.textContent = battle
      ? `${battle.enemy().name} LV${battle.enemy().level}`
      : "—";
    this.hud.battleState.textContent = battle?.phase?.toUpperCase() ?? "IDLE";
    this.hud.battleLog.textContent = state.log.join("\n");
  }

  renderCanvas(now, state, battle) {
    this.drawBackground();

    if (state.paused) {
      this.text("PAUSED...", W / 2, H / 2, 20);
      return;
    }

    if (!battle) {
      this.text("LOADING...", W / 2, H / 2, 20);
      return;
    }

    this.drawBattle(now, battle);
  }

  drawBackground() {
    const gfx = this.gfx;

    const colorsDefault = { primary: "#152315", secondary: "#192919" };
    const colors = this.game.state.dungeon?.biome.ui.bgColor ?? colorsDefault;

    rect(gfx, 0, 0, W, H, colors.primary);

    for (let y = 0; y < H; y += 20) {
      for (let x = 0; x < W; x += 20) {
        if ((x / 20 + y / 20) % 2 === 0) {
          rect(gfx, x, y, 20, 20, colors.secondary);
        }
      }
    }
  }

  drawBattle(now, battle) {
    const enemy = battle.enemy();

    this.text(`${this.game.state.dungeon.biome.ui.title}`, W / 2, 32, 18);
    this.text(`${enemy.name}  LV${enemy.level}`, W / 2, 64, 18);

    this.bar(115, 78, 190, 16, enemy.stats.hp / enemy.baseStats.hp);
    this.text(`${enemy.stats.hp} / ${enemy.baseStats.hp}`, W / 2, 87, 12);

    this.drawEnemy(W / 2, 150, now);
    this.drawPlayer(W / 2, 287, now);

    const loser = battle.loser();

    if (loser) {
      if (loser.name !== "Hero") {
        this.text("VICTORY!", W / 2, 220, 24);
      } else {
        this.text("DEFEATED", W / 2, 220, 24);
      }
    }

    this.drawDamagePopups(now);
  }

  bar(x, y, w, h, ratio) {
    const gfx = this.gfx;
    ratio = clamp01(ratio);

    rect(gfx, x, y, w, h, "#101010");
    rect(gfx, x + 2, y + 2, (w - 4) * ratio, h - 4, "#771320");
  }

  text(value, x, y, size = 16, crit = false) {
    const gfx = this.gfx;

    gfx.fillStyle = !crit ? "#fff" : "#d24";
    gfx.font = `bold ${size}px monospace`;
    gfx.textAlign = "center";
    gfx.textBaseline = "middle";

    gfx.fillText(value, Math.round(x), Math.round(y));
  }

  drawEnemy(x, y, now) {
    const bob = Math.sin(now / 250) * 2;

    rect(this.gfx, x - 32, y + 31 + bob, 64, 8, "#0e180e");

    rect(this.gfx, x - 25, y - 25 + bob, 50, 50, "#6da94f");

    rect(this.gfx, x - 29, y - 23 + bob, 12, 16, "#6da94f");

    rect(this.gfx, x + 17, y - 23 + bob, 12, 16, "#6da94f");

    rect(this.gfx, x - 15, y - 8 + bob, 8, 10, "#111");

    rect(this.gfx, x + 7, y - 8 + bob, 8, 10, "#111");

    rect(this.gfx, x - 10, y + 12 + bob, 20, 5, "#111");
  }

  drawPlayer(x, y, now) {
    const bob = Math.sin(now / 250) * 2;

    rect(this.gfx, x - 30, y + 30 + bob, 60, 8, "#0e180e");

    rect(this.gfx, x - 20, y - 15 + bob, 40, 45, "#476db0");

    rect(this.gfx, x - 22, y - 48 + bob, 44, 34, "#d5a77a");

    rect(this.gfx, x - 22, y - 48 + bob, 44, 10, "#39291f");

    rect(this.gfx, x - 13, y - 30 + bob, 7, 7, "#111");

    rect(this.gfx, x + 6, y - 30 + bob, 7, 7, "#111");

    rect(this.gfx, x + 25, y - 5 + bob, 7, 48, "#ccc");

    rect(this.gfx, x + 18, y + 5 + bob, 20, 6, "#9a743f");
  }

  drawDamagePopups() {
    const battle = this.game.state.battle;

    if (!battle?.damagePopups) return;

    const keep = [];

    for (const popup of battle.damagePopups) {
      const age = 500 - popup.life;
      const x = W / 2;
      const baseY = popup.target === "enemy" ? 135 : 285;

      const y = baseY - age * 0.05;

      this.text(`${popup.value}`, x, y, 18);

      popup.life -= 16.7;

      if (popup.life > 0) {
        keep.push(popup);
      }
    }

    battle.damagePopups = keep;
  }
}
