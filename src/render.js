import { playerStats, EXP_PER_LEVEL } from "./game.js";

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
    const stats = playerStats(state);

    this.renderCanvas(now, state, battle, stats);
    this.updateHud(state, battle, stats);
  }

  updateHud(state, battle, stats) {
    const currentHp = battle ? Math.max(0, battle.playerHp) : stats.hp;
    const hpRatio = clamp01(currentHp / stats.hp);
    const expInLevel = state.player.exp % EXP_PER_LEVEL;
    const expRatio = clamp01(expInLevel / EXP_PER_LEVEL);

    this.hud.playerLevel.textContent = stats.level;
    this.hud.hpText.textContent = `${Math.ceil(currentHp)} / ${stats.hp}`;
    this.hud.hpFill.style.height = `${hpRatio * 100}%`;
    this.hud.expText.textContent = `${expInLevel} / ${EXP_PER_LEVEL}`;
    this.hud.expFill.style.setProperty("--exp", `${expRatio * 100}%`);
    this.hud.atk.textContent = stats.atk;
    this.hud.def.textContent = stats.def;
    this.hud.gold.textContent = state.player.gold;
    this.hud.kills.textContent = state.player.kills;
    this.hud.deaths.textContent = state.player.deaths;
    this.hud.enemyName.textContent = battle ? `${battle.enemy.name} LV${battle.enemy.level}` : "—";
    this.hud.battleState.textContent = battle?.phase?.toUpperCase() ?? "IDLE";
    this.hud.battleLog.textContent = state.log.join("\n");
  }

  updateDialog(state) {
    const dialog = this.hud.dialog;

    if (!dialog) return;

    if (state.paused && !dialog.open) {
      dialog.showModal();
    } else if (!state.paused && dialog.open) {
      dialog.close();
    }
  }

  renderCanvas(now, state, battle, stats) {
    this.drawBackground();

    this.text("IDLE RPG", W / 2, 22, 14);
    this.text(`LV ${stats.level}`, W / 2, 41, 12);

    if (state.paused) {
      this.text("PAUSED...", W / 2, H / 2, 20);
      return;
    }

    if (!battle) {
      this.text("LOADING...", W / 2, H / 2, 20);
      return;
    }

    this.drawBattle(now, battle, stats);
  }

  drawBackground() {
    const gfx = this.gfx;

    rect(gfx, 0, 0, W, H, "#152315");

    for (let y = 0; y < H; y += 20) {
      for (let x = 0; x < W; x += 20) {
        if ((x / 20 + y / 20) % 2 === 0) {
          rect(gfx, x, y, 20, 20, "#192919");
        }
      }
    }
  }

  drawBattle(now, battle, stats) {
    this.text(`${battle.enemy.name}  LV${battle.enemy.level}`, W / 2, 64, 18);

    this.bar(115, 78, 190, 16, battle.enemy.hp / battle.enemy.maxHp);
    this.text(`${battle.enemy.hp} / ${battle.enemy.maxHp}`, W / 2, 87, 12);

    this.drawEnemy(W / 2, 150, now);
    this.drawPlayer(W / 2, 287, now);

    this.text(`HP ${Math.max(0, Math.ceil(battle.playerHp))}/${stats.hp}`, W / 2, 342, 13);

    if (battle.phase === "won") {
      this.text("VICTORY!", W / 2, 220, 24);
    } else if (battle.phase === "lost") {
      this.text("DEFEATED", W / 2, 220, 24);
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

      this.text(`-${popup.value}`, x, y, 18);

      popup.life -= 16.7;

      if (popup.life > 0) {
        keep.push(popup);
      }
    }

    battle.damagePopups = keep;
  }
}
