const KEY = "idle-rpg-save-v1";

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
    localStorage.setItem(
      KEY,
      JSON.stringify({
        ...state,
        lastSavedAt: Date.now()
      })
    );
  } catch {
    // Storage can be unavailable in private/restricted contexts.
  }
}
