import { MISSIONS, MAIN_LINE, missionById, nextMissionId, STARTING_FLEET } from './campaign.js';
import { SHIPS } from './ships.js';
import { assignName } from './names.js';

// Campaign save state. Your task force is persistent: hull damage and shot-off
// mounts carry between missions, ships lost are gone for good, and a dockyard
// refit between operations only puts back so much.
const KEY = 'threespace-campaign-v1';

// What a refit between missions restores.
const REFIT_HULL = 0.35;  // fraction of maximum hull
const REFIT_MOUNTS = 3;   // hardpoints put back in service

export function newCampaign() {
  return {
    version: 1,
    missionId: MAIN_LINE[0],
    completed: [],
    pendingLoop: null,
    fleet: STARTING_FLEET.map((s) => makeShip(s.key, s.name)),
    lost: [],
    lastRefit: null,
  };
}

// A hull joining the force takes a name no ship of yours has carried,
// including the ones you have already lost.
function rewardName(state, key) {
  const taken = new Set([...state.fleet.map((s) => s.name), ...state.lost.map((s) => s.name)]);
  return assignName(SHIPS[key], taken);
}

function makeShip(key, name) {
  return {
    key,
    name,
    hull: SHIPS[key].hull,
    deadMounts: [],
    missions: 0,
    dealt: 0,
  };
}

export function loadCampaign() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    // Drop saves from an incompatible shape or a since-renamed hull.
    if (state?.version !== 1 || !Array.isArray(state.fleet)) return null;
    // A finished campaign legitimately has no current mission.
    if (state.missionId !== null && !missionById(state.missionId)) return null;
    state.fleet = state.fleet.filter((s) => SHIPS[s.key]);
    return state;
  } catch {
    return null;
  }
}

export function saveCampaign(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota: the campaign still plays this session.
  }
}

export function clearCampaign() {
  try {
    localStorage.removeItem(KEY);
  } catch { /* nothing to do */ }
}

// A ship is combat-worthy if it has hull left and any working mount.
export function shipReady(ship) {
  const total = SHIPS[ship.key].hardpoints.length;
  return ship.hull > 0 && ship.deadMounts.length < total;
}

export function hullPct(ship) {
  return Math.max(0, Math.round((ship.hull / SHIPS[ship.key].hull) * 100));
}

// Fold a battle report back into the campaign: damage sticks, losses are
// permanent, a won mission advances the line and may add a hull to the force.
export function applyResult(state, report) {
  const byName = new Map(state.fleet.map((s) => [s.name, s]));
  for (const row of report.fleets.A) {
    const ship = byName.get(row.shipName);
    if (!ship) continue; // attached ships never join the roster
    ship.missions += 1;
    ship.dealt += Math.round(row.dealt);
    if (row.survived) {
      ship.hull = Math.max(1, row.hullEnd ?? ship.hull);
      ship.deadMounts = row.deadMounts ?? ship.deadMounts;
    } else {
      ship.lostAt = report.missionId;
    }
  }
  const lost = state.fleet.filter((s) => s.lostAt);
  state.lost.push(...lost.map((s) => ({ key: s.key, name: s.name, at: s.lostAt })));
  state.fleet = state.fleet.filter((s) => !s.lostAt);

  if (!report.won) return state;

  const mission = missionById(report.missionId);
  state.completed.push(report.missionId);
  if (mission?.reward && !state.fleet.some((s) => s.key === mission.reward)) {
    state.fleet.push(makeShip(mission.reward, rewardName(state, mission.reward)));
  }
  // A finished mission may offer an optional SOC branch before continuing.
  state.pendingLoop = mission?.loopOffer ?? null;
  state.missionId = state.pendingLoop ? report.missionId : nextMissionId(report.missionId);
  state.lastRefit = refit(state);
  return state;
}

// Take or decline an offered SOC loop.
export function resolveLoop(state, accept) {
  const offered = state.pendingLoop;
  state.pendingLoop = null;
  state.missionId = accept ? offered : nextMissionId(state.missionId);
  return state;
}

// Dockyard time between operations: a slice of hull back and a few mounts
// re-crewed. Never enough to undo a bad battle.
function refit(state) {
  const notes = [];
  for (const ship of state.fleet) {
    const spec = SHIPS[ship.key];
    const before = ship.hull;
    ship.hull = Math.min(spec.hull, ship.hull + spec.hull * REFIT_HULL);
    const fixed = ship.deadMounts.splice(0, REFIT_MOUNTS).length;
    const gained = Math.round(ship.hull - before);
    if (gained > 0 || fixed > 0) {
      notes.push(`${ship.name}: +${gained} hull${fixed ? `, ${fixed} mounts restored` : ''}`);
    }
  }
  return notes;
}

// Progress through the main line, for the campaign header.
export function progress(state) {
  const done = state.completed.filter((id) => MAIN_LINE.includes(id)).length;
  return { done, total: MAIN_LINE.length };
}

export { MISSIONS, missionById };
