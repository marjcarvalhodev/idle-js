const KEY = "idle-rpg-save-v1";

let saveAccumulator = 0;

export function snapshot(dt, state) {
  saveAccumulator += dt;

  if (saveAccumulator >= 3_000) {
    saveState(state);
    saveAccumulator = 0;
  }
}

export function saveOnClose(game) {
  window.addEventListener("beforeunload", () => {
    saveState(game.state);
  });
}

export function deleteState() {
  localStorage.removeItem(KEY);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    const data = JSON.stringify({ ...state, lastSavedAt: Date.now() });
    localStorage.setItem(KEY, data);
  } catch {
    // Storage can be unavailable in private/restricted contexts.
  }
}

export async function clearAppCache() {
  const keys = await caches.keys();

  await Promise.all(keys.map((key) => caches.delete(key)));

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  location.reload();
}
