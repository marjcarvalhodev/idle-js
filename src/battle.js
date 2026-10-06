import { playerStats, EXP_PER_LEVEL } from "./game.js";

export class Battle {
  constructor(game) {
    this.state = game.state;
  }

  startBattle() {
    const battle = this.state.battle ?? {};

    if (battle.phase === "lost") {
      this.state.battle.playerHp = playerStats(this.state).hp;
    }

    const playerHp = (this.state.battle ?? {}).playerHp ?? playerStats(this.state).hp;
    const level = playerStats(this.state).level;
    const template = new Entity(enums, level);

    const enemy = {
      name: template.name,
      race: template.race,
      archetype: template.archetype,
      damageType: template.damageType,
      level: template.level,
      hp: template.stats.hp,
      maxHp: template.stats.hp,
      atk: template.stats.atk,
      def: template.stats.def,
      onTurn: template.onTurn,
      exp: template.exp ?? 1
    };

    this.state.battle = {
      enemy,
      playerHp: playerHp,
      phase: "fighting",
      elapsedMs: 0,
      tickMs: GAME_TICK,
      flash: 0,
      damagePopups: []
    };

    this.log(`A wild ${enemy.name} appeared!`);
  }

  battleTick() {
    const battle = this.state.battle;
    if (!battle || battle.phase !== "fighting") return;

    const p = playerStats(this.state);
    const enemy = battle.enemy;

    const ctx = this.createContext("player");
    ctx.attack();

    if (enemy.hp <= 0) {
      this.winBattle();
      return;
    }

    enemy?.onTurn(this.createContext("enemy"));

    if (battle.playerHp <= 0) {
      this.loseBattle();
      return;
    }
  }

  winBattle() {
    const battle = this.state.battle;
    if (!battle) return;

    const enemy = battle.enemy;
    battle.phase = "won";
    battle.elapsedMs = 0;

    this.log(`${enemy.name} defeated! +1 EXP`);

    this.addExp(enemy.exp);

    // const drops = rollDrops(enemy.id);
    // for (const drop of drops) {
    //   this.state.player.inventory[drop.itemId] =
    //     (this.state.player.inventory[drop.itemId] ?? 0) + drop.amount;

    //   this.log(`Drop: ${drop.amount}x ${drop.itemId}`);
    // }

    this.state.player.gold += enemy.level;
    this.state.player.kills += 1;

    if (!this.state.autoBattle) {
      this.pause();
    }
  }

  loseBattle() {
    const battle = this.state.battle;
    if (!battle) return;

    battle.phase = "lost";
    battle.elapsedMs = 0;

    this.log("You were defeated. Recovering...");

    this.state.player.hp = playerStats(this.state).hp;
    this.state.player.deaths += 1;
  }

  createContext(actor) {
    const game = this;

    return {
      actor,

      attack() {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const damage = Math.max(1, combat.actorStats.atk - combat.targetStats.def);

        combat.setTargetHp(combat.targetHp() - damage);

        game.state.battle.damagePopups.push({
          target: combat.targetId,
          value: damage,
          life: 500
        });

        game.state.battle.flash = 120;

        game.log(
          actor === "player"
            ? `You hit ${combat.targetName} for ${damage}.`
            : `${combat.actorName} hits you for ${damage}.`
        );

        return damage;
      },

      heal(amount) {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const heal = Math.max(0, amount);
        const maxHp = combat.actorStats.hp ?? combat.actorStats.maxHp;

        const before = combat.actorHp();
        const after = Math.min(maxHp, before + heal);

        combat.setActorHp(after);

        return after - before;
      },

      damage(amount) {
        const combat = getActorAndTarget(game, actor);
        if (!combat) return 0;

        const damage = Math.max(0, amount);

        combat.setTargetHp(combat.targetHp() - damage);

        game.state.battle.damagePopups.push({
          target: combat.targetId,
          value: damage,
          life: 500
        });

        return damage;
      },

      addExp(amount) {
        game.addExp(amount);
      },

      addGold(amount) {
        game.state.player.gold = Math.max(0, game.state.player.gold + amount);
      },

      addItem(itemId, amount = 1) {
        const inv = game.state.player.inventory;
        inv[itemId] = (inv[itemId] ?? 0) + amount;
        game.log(`Found ${amount}x ${itemId}.`);
      },

      applyStatus(statusId, turns) {
        game.state.statuses ??= {};
        game.state.statuses[statusId] = {
          turns: Math.max(0, turns)
        };
      }
    };
  }

  getActorAndTarget(game, actor) {
    const battle = game.state.battle;
    if (!battle) return null;

    const player = playerStats(game.state);

    return actor === "player"
      ? {
          actorStats: player,
          targetStats: battle.enemy,
          actorHp: () => battle.playerHp,
          setActorHp: (value) => (battle.playerHp = value),
          targetHp: () => battle.enemy.hp,
          setTargetHp: (value) => (battle.enemy.hp = value),
          actorName: "You",
          targetName: battle.enemy.name,
          actorId: "player",
          targetId: "enemy"
        }
      : {
          actorStats: battle.enemy,
          targetStats: player,
          actorHp: () => battle.enemy.hp,
          setActorHp: (value) => (battle.enemy.hp = value),
          targetHp: () => battle.playerHp,
          setTargetHp: (value) => (battle.playerHp = value),
          actorName: battle.enemy.name,
          targetName: "You",
          actorId: "enemy",
          targetId: "player"
        };
  }
}
