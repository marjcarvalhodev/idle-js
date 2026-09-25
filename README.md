# Idle RPG

Tiny offline-first incremental RPG prototype.

## Run on Windows

Double-click `run.bat`.

Or:

```cmd
python -m http.server 8000 --bind 0.0.0.0
```

Then open:

```text
http://localhost:8000
```

For a phone on the same LAN:

```text
http://YOUR-PC-IP:8000
```

## Run directly on Android

With Termux:

```sh
pkg install python
cd /path/to/idle-rpg
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`.

The project is plain web code, so the same files can later be wrapped as a PWA or Android app.

## Structure

```text
engine/
  game.js       state + simulation + battle
  save.js       localStorage save/load
  render.js     420x380 canvas renderer
  input.js      keyboard + virtual buttons

content/
  enemies.js    enemy scripts/data
  drops.js      drop tables
  items.js      item definitions
  mechanics.js  reusable scripted mechanics

src/
  main.js       bootstrap

assets/         future sprites/audio/etc.
```

## Stat formula

```text
final = base + (level * modifier) + equipment
```

Current leveling:

```text
every 10 EXP => +1 level
level up      => +5 HP, +1 ATK, +1 DEF
win           => +1 EXP
```

## Content scripting

Enemy behavior gets a context object:

```js
onTurn(ctx) {
  ctx.attack();
}
```

Available context methods are intentionally small:

```text
ctx.attack()
ctx.heal(amount)
ctx.damage(amount)
ctx.addExp(amount)
ctx.addGold(amount)
ctx.addItem(itemId, amount)
ctx.setFlag(name, value)
ctx.spawnEnemy(enemyId)
ctx.applyStatus(statusId, turns)
```

That is the seam where we can grow the game without stuffing content-specific `if` statements into the engine.

## Saving

The current prototype stores the game state in browser `localStorage`.

The state includes a timestamp so the next step can add offline/away simulation cleanly.
