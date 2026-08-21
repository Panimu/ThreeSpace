// Deferred updates: notice a new build quietly, apply it only when the player
// is somewhere it costs nothing.
//
// A battle lives entirely in memory. The campaign only writes to localStorage
// when a mission *ends*, so a reload mid-action throws away the fight and the
// sortie that set it up. That makes "there is a new version" and "now is a
// good time to take it" two different questions, and this module only answers
// the first: it polls, it sets a flag, and it never prompts, never reloads,
// never touches the scene. TitleScene — the one screen with nothing in
// progress — is what offers the update. See its create().
//
// Nothing is lost by waiting. By the time the offer appears the new bundle has
// already been pulled into the HTTP cache, so taking it is a fast reload
// rather than a re-download.

// Compile-time constant from vite.config.js — no runtime lookup, no fetch, no
// package.json import. 'dev build' when the stamp could not be trusted.
export const BUILD_VERSION = __BUILD_VERSION__;
export const IS_DEV_BUILD = BUILD_VERSION === 'dev build';

const POLL_MS = 15 * 60 * 1000;

let pending = null;   // the newer version string, once one has been seen

// The version waiting to be applied, or null. Cheap enough to call in create().
export function updateReady() {
  return pending;
}

// Looks once, now. Exported so a safe point can check on arrival rather than
// waiting up to POLL_MS — a deploy that lands during a long session should be
// on offer the moment the player next reaches the title screen. Never throws.
export async function checkForUpdate() {
  if (IS_DEV_BUILD || pending) return;   // nothing to compare, or already found
  try {
    const res = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.version || data.version === BUILD_VERSION) return;
    pending = data.version;
    // Warm the new bundle so applying the update is a reload, not a download.
    // Skipped when the player has asked their browser to save data — a game
    // they are already running is not worth a surprise 1.6 MB on a metered
    // connection.
    if (data.bundle && !navigator.connection?.saveData) {
      fetch(data.bundle).catch(() => {});
    }
  } catch {
    // Offline, or a build with no version.json beside it (the single-file
    // artifact). Either way there is nothing to report; try again later.
  }
}

// Starts the background watch. Safe to call once at boot and then forget.
export function watchForUpdates() {
  // A working copy has nothing meaningful to compare against, and polling from
  // one would mean the dev server nags about its own build forever.
  if (IS_DEV_BUILD) return;
  checkForUpdate();
  setInterval(checkForUpdate, POLL_MS);
  // Coming back to the tab is the cheapest moment to spot a deploy that landed
  // while the game was in the background — which, on a phone, is most of them.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
}

// Only ever called from a safe point, in response to a deliberate tap.
export function applyUpdate() {
  window.location.reload();
}
