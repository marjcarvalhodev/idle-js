import { playerStats } from "./game.js";

const W = 420;
const H = 380;

const HUD_ELEMENTS = {
  playerName: "player-name",
  playerHp: "player-level",
  hpText: "hp-text",
  hpFill: "hp-fill",
  expText: "exp-text",
  expFill: "exp-fill",
  atk: "atk",
  def: "def",
  gold: "gold",
  enemyName: "enemy-name",
  battleState: "battle-state",
  battleLog: "battle-log"
};

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.game = game;
    this.ctx.imageSmoothingEnabled = false;

    this.hud = {};

    for (const [key, id] of Object.entries(HUD_ELEMENTS)) {
      this.hud[key] = document.getElementById(id);
    }
  }

  render(now) {
    const ctx = this.ctx;
    const state = this.game.state;
    const battle = state.battle;
    const stats = playerStats(state);

    rect(ctx, 0, 0, W, H, "#152315");

    for (let y = 0; y < H; y += 20) {
      for (let x = 0; x < W; x += 20) {
        if (((x / 20) + (y / 20)) % 2 === 0) {
          rect(ctx, x, y, 20, 20, "#192919");
        }
      }
    }

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

    this.text(`${battle.enemy.name}  LV${battle.enemy.level}`, W / 2, 64, 18);
    this.bar(115, 78, 190, 14, battle.enemy.hp / battle.enemy.maxHp);

    this.drawEnemy(W / 2, 150, now);

    this.drawPlayer(W / 2, 287, now);

    this.text(
      `HP ${Math.max(0, Math.ceil(battle.playerHp))}/${stats.hp}`,
      W / 2,
      342,
      13
    );

    if (battle.phase === "won") {
      this.text("VICTORY!", W / 2, 220, 24);
    } else if (battle.phase === "lost") {
      this.text("DEFEATED", W / 2, 220, 24);
    }

    this.drawDamagePopups(now);

    this.updateHud(state, battle, stats);
  }

  bar(x, y, w, h, ratio) {
    const ctx = this.ctx;
    ratio = Math.max(0, Math.min(1, ratio));
    rect(ctx, x, y, w, h, "#101010");
    rect(ctx, x + 2, y + 2, (w - 4) * ratio, h - 4, "#5ab454");
  }

  text(value, x, y, size = 16) {
    const ctx = this.ctx;
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${size}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, Math.round(x), Math.round(y));
  }

  drawEnemy(x, y, now) {
    const bob = Math.sin(now / 250) * 2;

    rect(this.ctx, x - 32, y + 31 + bob, 64, 8, "#0e180e");

    rect(this.ctx, x - 25, y - 25 + bob, 50, 50, "#6da94f");
    rect(this.ctx, x - 29, y - 23 + bob, 12, 16, "#6da94f");
    rect(this.ctx, x + 17, y - 23 + bob, 12, 16, "#6da94f");

    rect(this.ctx, x - 15, y - 8 + bob, 8, 10, "#111");
    rect(this.ctx, x + 7, y - 8 + bob, 8, 10, "#111");
    rect(this.ctx, x - 10, y + 12 + bob, 20, 5, "#111");
  }

  drawPlayer(x, y, now) {
    const bob = Math.sin(now / 250) * 2;

    rect(this.ctx, x - 30, y + 30 + bob, 60, 8, "#0e180e");

    rect(this.ctx, x - 20, y - 15 + bob, 40, 45, "#476db0");
    rect(this.ctx, x - 22, y - 48 + bob, 44, 34, "#d5a77a");
    rect(this.ctx, x - 22, y - 48 + bob, 44, 10, "#39291f");

    rect(this.ctx, x - 13, y - 30 + bob, 7, 7, "#111");
    rect(this.ctx, x + 6, y - 30 + bob, 7, 7, "#111");

    rect(this.ctx, x + 25, y - 5 + bob, 7, 48, "#ccc");
    rect(this.ctx, x + 18, y + 5 + bob, 20, 6, "#9a743f");
  }

  drawDamagePopups(now) {
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
      if (popup.life > 0) keep.push(popup);
    }

    battle.damagePopups = keep;
  }

  updateHud(state, battle, stats) {
    this.hud.playerName.textContent = state.player.name;
    this.hud.playerHp.textContent = `LV ${stats.level}`;

    const currentHp = battle
      ? Math.max(0, battle.playerHp)
      : stats.hp;

    const hpRatio = currentHp / stats.hp;

    this.hud.hpText.textContent =
      `${Math.ceil(currentHp)} / ${stats.hp}`;

    this.hud.hpFill.style.width =
      `${Math.max(0, Math.min(1, hpRatio)) * 100}%`;

    const expInLevel = state.player.exp % 10;
    const expRatio = expInLevel / 10;

    this.hud.expText.textContent =
      `${expInLevel} / 10`;

    this.hud.expFill.style.width =
      `${expRatio * 100}%`;

    this.hud.atk.textContent = stats.atk;
    this.hud.def.textContent = stats.def;
    this.hud.gold.textContent = state.player.gold;

    this.hud.enemyName.textContent = battle ? `${battle.enemy.name} LV${battle.enemy.level}` : "";

    this.hud.battleState.textContent = battle?.phase ?? "";

    this.hud.battleLog.textContent = state.log.join("\n");
  }
}
