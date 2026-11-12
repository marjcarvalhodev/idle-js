import { UTILS } from "./utils.js";

const W = 420;
const H = 380;

function rect(gfx, x, y, w, h, color) {
  gfx.fillStyle = color;
  gfx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export class Renderer {
  constructor(canvas) {
    this.gfx = canvas.getContext("2d");
    this.gfx.imageSmoothingEnabled = false;
  }

  render(now, state) {
    const dungeon = state;
    const battle = dungeon?.battle;

    this.renderCanvas(now, dungeon, battle);
  }

  renderCanvas(now, dungeon, battle) {
    this.drawBackground(dungeon);

    if (!battle) {
      this.text("LOADING...", W / 2, H / 2, 20);
      return;
    }

    this.drawBattle(now, dungeon);
  }

  drawBackground(dungeon) {
    const gfx = this.gfx;

    const colorsDefault = { primary: "#152315", secondary: "#192919" };
    const colors = dungeon?.biome.ui.bgColor ?? colorsDefault;

    rect(gfx, 0, 0, W, H, colors.primary);

    for (let y = 0; y < H; y += 20) {
      for (let x = 0; x < W; x += 20) {
        if ((x / 20 + y / 20) % 2 === 0) {
          rect(gfx, x, y, 20, 20, colors.secondary);
        }
      }
    }
  }

  drawBattle(now, dungeon) {
    const battle = dungeon.battle;
    const player = battle.player();
    const enemy = battle.enemy();

    this.text(`${dungeon.biome.ui.title}`, W / 2, 32, 18);
    this.text(`${enemy.name}  LV${enemy.level}`, W / 2, 64, 18);

    this.bar(115, 78, 190, 16, enemy.stats.hp / enemy.baseStats.hp);
    this.text(`${enemy.stats.hp} / ${enemy.baseStats.hp}`, W / 2, 87, 12);

    this.drawEnemy(W / 2, 150, now);
    this.drawPlayer(W / 2, 287, now);
    this.text(`${player.name}  LV${player.level}`, W / 2, 348, 12);

    const loser = battle.loser();

    if (loser) {
      if (loser.archetype !== "hero") {
        this.text("VICTORY!", W / 2, 220, 24);
      } else {
        this.text("DEFEATED", W / 2, 220, 24);
      }
    }

    this.drawDamagePopups(battle);
  }

  bar(x, y, w, h, ratio) {
    const gfx = this.gfx;
    ratio = UTILS.clamp01(ratio);

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

  drawDamagePopups(battle) {
    if (!battle?.damagePopups) return;

    const keep = [];

    for (const popup of battle.damagePopups) {
      const isHero = popup.target.archetype === "hero";

      const age = 500 - popup.life;
      const x = W / 2 + (isHero ? 50 : -50);
      const baseY = isHero ? 285 : 135;

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
