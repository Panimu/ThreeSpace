// Audits src/campaign.js against scripts/fs2-campaign-source.json.
//
// The campaign drifted off canon once already — briefs were written from a
// summary rather than the roster, and twenty missions quietly lost the allied
// capital that fought in them. This is the guard against that happening again.
//
//   node scripts/check-campaign.mjs           report and exit non-zero on drift
//   node scripts/check-campaign.mjs --verbose  also list what was trimmed
//
// Rules:
//   INVENTED  a hull in campaign.js that canon does not field in that mission
//             — an error, because it is exactly how the drift started. A
//             mission may carry a `canonNote` string saying why it deviates;
//             that downgrades its inventions to a printed note.
//   TRIMMED   a canon hull we left out to keep a side readable on a phone
//             — allowed, reported, and worth re-reading now and then.
// Retail's Neutral IFF covers both the NTF corvette shooting at you and the
// civilian transport you are covering, so neutral hulls may line up on either
// side.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const verbose = process.argv.includes('--verbose');
const source = JSON.parse(readFileSync(resolve(here, 'fs2-campaign-source.json'), 'utf8'));
const { MISSIONS } = await import(pathToFileURL(resolve(here, '../src/campaign.js')).href);

// Source mission ids are file stems ("SM1-01.fs2"); campaign ids are upper-case.
const byId = new Map(source.missions.map((m) => [m.file.replace('.fs2', '').toUpperCase(), m]));

const bag = (list) => {
  const counts = new Map();
  for (const key of list) counts.set(key, (counts.get(key) ?? 0) + 1);
  return counts;
};
const diff = (mine, canon) => {
  const invented = [], trimmed = [];
  for (const [key, n] of mine) {
    const extra = n - (canon.get(key) ?? 0);
    for (let i = 0; i < extra; i++) invented.push(key);
  }
  for (const [key, n] of canon) {
    const missing = n - (mine.get(key) ?? 0);
    for (let i = 0; i < missing; i++) trimmed.push(key);
  }
  return { invented, trimmed };
};

let errors = 0, trims = 0;
for (const mission of MISSIONS) {
  const canon = byId.get(mission.id.toUpperCase());
  if (!canon) {
    console.error(`✗ ${mission.id}: no canon entry in the source roster`);
    errors += 1;
    continue;
  }
  const noted = !!mission.canonNote;
  const lines = [];
  const check = (label, mine, canonList) => {
    const { invented, trimmed } = diff(bag(mine), bag(canonList));
    if (invented.length) {
      if (noted) lines.push(`    documented deviation — ${label} +${invented.join(', ')}`);
      else { lines.push(`  ✗ ${label} INVENTED ${invented.join(', ')}`); errors += 1; }
    }
    if (trimmed.length) { trims += trimmed.length; if (verbose) lines.push(`    trimmed ${label}: ${trimmed.join(', ')}`); }
  };
  // Our `enemy` merges canon's Hostile and Neutral capitals: an NTF corvette
  // that shoots at you is Neutral IFF in retail, and still the enemy here.
  check('enemy', mission.enemy.map((e) => e.key),
    [...canon.caps.hostile, ...canon.caps.neutral].map((e) => e.key));
  check('attach', (mission.attach ?? []).map((e) => e.key), canon.caps.friendly.map((e) => e.key));
  check('civilians.A', (mission.civilians?.A ?? []).map((e) => e.key),
    [...canon.civ.friendly, ...canon.civ.neutral].map((e) => e.key));
  check('civilians.B', (mission.civilians?.B ?? []).map((e) => e.key),
    [...canon.civ.hostile, ...canon.civ.neutral].map((e) => e.key));

  // Names should be canon where canon has one.
  const canonNames = new Set([...canon.caps.friendly, ...canon.caps.hostile, ...canon.caps.neutral,
    ...canon.civ.friendly, ...canon.civ.hostile, ...canon.civ.neutral].map((e) => e.name.toLowerCase()));
  const mineNames = [...mission.enemy, ...(mission.attach ?? []),
    ...(mission.civilians?.A ?? []), ...(mission.civilians?.B ?? [])].map((e) => e.name);
  const offCanon = mineNames.filter((n) => n && !canonNames.has(String(n).toLowerCase()));
  if (offCanon.length && verbose) lines.push(`    off-canon names: ${offCanon.join(', ')}`);

  // A protect objective needs a charge that actually spawns on your side, and
  // a raid needs marks that actually spawn on theirs.
  if (mission.objective.kind === 'protect') {
    const onside = [...(mission.attach ?? []), ...(mission.civilians?.A ?? [])]
      .some((e) => e.name === mission.objective.ship);
    if (!onside) { lines.push(`  ✗ protect charge "${mission.objective.ship}" is not in the line-up`); errors += 1; }
  }
  if (mission.objective.kind === 'raid') {
    const hostiles = [...mission.enemy, ...(mission.civilians?.B ?? [])].map((e) => e.name);
    for (const mark of mission.objective.targets) {
      if (!hostiles.includes(mark)) { lines.push(`  ✗ raid target "${mark}" is not on the hostile side`); errors += 1; }
    }
  }
  if (lines.length) console.log(`${mission.id}  ${mission.title}\n${lines.join('\n')}`);
}

const missingIds = [...byId.keys()].filter((id) => !MISSIONS.some((m) => m.id.toUpperCase() === id));
if (missingIds.length) console.log(`\nnot in the campaign: ${missingIds.join(', ')}`);
console.log(`\n${MISSIONS.length} missions checked · ${errors} error${errors === 1 ? '' : 's'} · ${trims} canon hull${trims === 1 ? '' : 's'} trimmed for scale`);
process.exit(errors ? 1 : 0);
