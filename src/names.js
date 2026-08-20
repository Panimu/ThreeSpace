// Individual ship names. Classes live in ships.js; this gives each hull in a
// battle its own identity ("GTD Orion  BASTION"), which the after-action
// report keys off and the campaign will use for a persistent fleet roster.
//
// Terran and Vasudan names are FS2-flavored; the Shivans don't name their
// ships, so the GTVA assigns Greek tracking designations to hostile contacts.
const POOLS = {
  GTVA: ['Aquitaine', 'Bastion', 'Galatea', 'Hood', 'Krios', 'Legion', 'Orff',
    'Phoenicia', 'Sirius', 'Eisenhower', 'Actium', 'Vigilant', 'Sparta',
    'Repulse', 'Amazon', 'Nelson', 'Valiant', 'Intrepid', 'Ashanti', 'Meridian'],
  Vasudan: ['Psamtik', 'Karnak', 'Thebes', 'Memphis', 'Amenhotep', 'Setekh',
    'Khonsu', 'Ramses', 'Luxor', 'Nekhbet', 'Maat', 'Sobekhotep', 'Edfu', 'Saqqara'],
  Shivan: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Sigma'],
};

function poolFor(spec) {
  if (spec.faction === 'Shivan') return POOLS.Shivan;
  if (spec.faction.startsWith('Vasudan')) return POOLS.Vasudan;
  return POOLS.GTVA;
}

// Draws an unused name for this hull, remembering picks in `used` so no two
// ships in a battle share one.
export function assignName(spec, used = new Set()) {
  const pool = poolFor(spec).filter((n) => !used.has(n));
  const name = pool.length
    ? pool[(Math.random() * pool.length) | 0]
    : `${spec.faction === 'Shivan' ? 'Contact' : 'Hull'} ${100 + ((Math.random() * 800) | 0)}`;
  used.add(name);
  return name;
}
