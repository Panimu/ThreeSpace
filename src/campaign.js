// Campaign: the FreeSpace 2 war fought from a capital ship's bridge.
//
// The mission graph, locations, force compositions and objectives follow the
// retail single-player campaign structure (30 main missions plus two optional
// SOC loops). Because ThreeSpace commands capitals rather than fighters, each
// mission is rebuilt around the warships actually present in it: the
// engagement, the opposition and the stakes are the mission's, the briefing
// prose is ours.
//
// Mission shape:
//   id/title/act/where  identity and campaign placement
//   brief               operational orders, our words
//   enemy               hostile capital keys (SHIPS)
//   attach              ships lent to you for this mission only — they fight
//                       under your command but never join the roster
//   objective           { kind: 'destroy' | 'survive' | 'protect', ... }
//   reward              hull permanently added to your task force after a win
//   loopOffer           id of the optional branch offered on completion
//
// `names` overrides the individual ship names so canon vessels — the Iceni,
// the Ravana Beleth, the Repulse — appear by name.

export const MISSIONS = [
  // ---- Act I: the NTF rebellion, and what was waiting behind it ----
  {
    id: 'SM1-01', title: 'Surrender, Belisarius!', act: 'ACT I', where: 'Deneb — Cygnus Prime',
    brief: 'Vasudan refugee transports are limping out of Cygnus Prime with rebel '
      + 'colours closing on them. The NTF corvette Belisarius has ignored three '
      + 'orders to stand down. Take the Vigilant in and make the fourth order '
      + 'unnecessary.',
    enemy: ['deimos'], names: { B: ['Belisarius'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-02', title: 'The Place of Chariots', act: 'ACT I', where: 'Deneb asteroid belt',
    brief: 'Intelligence puts an NTF supply depot inside the Deneb belt. Break its '
      + 'escort and put the installation out of the war. Expect the rebels to '
      + 'have sited their pickets well.',
    enemy: ['aeolus', 'deimos'], names: { B: ['Glorious', 'Sunder'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-03', title: 'The Romans Blunder', act: 'ACT I', where: 'Deneb–Sirius jump route',
    brief: 'Bosch is running for the Sirius node aboard the Iceni with a covering '
      + 'force between him and us. You will not catch the Iceni — nobody will '
      + 'today. Hold the route open and survive the covering force.',
    enemy: ['deimos', 'fenris', 'leviathan'], names: { B: ['Iceni', 'Impervious', 'Repulse'] },
    objective: { kind: 'survive', seconds: 150 },
    reward: 'leviathan',
  },
  {
    id: 'SM1-04', title: 'A Lion at the Door', act: 'ACT I', where: 'Gamma Draconis node',
    brief: 'A Shivan strike has burned through Capella and a new portal has opened '
      + 'at Gamma Draconis. The GTD Orion holds the node. Whatever comes through, '
      + 'it does not get past you to her.',
    enemy: ['rakshasa', 'cain'], attach: [{ key: 'sobek', name: 'Iaru' }],
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-05', title: 'Mystery of the Trinity', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'Sweep the nebula for the freighter Trinity. Sensors are close to '
      + 'useless in this soup — you will be inside gun range before you have a '
      + 'firing solution. Shivan pickets are confirmed.',
    enemy: ['cain', 'cain'], names: { B: ['Charon', 'Styx'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-06', title: 'The Great Hunt', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'Search and destroy with the corvettes Actium and Lysander. Command '
      + 'expects cruisers. Command has been wrong before — if something bigger '
      + 'comes out of the murk, break off and keep your hull.',
    enemy: ['cain', 'rakshasa', 'ravana'], names: { B: ['Iblis', 'Azrael', 'Beleth'] },
    attach: [{ key: 'deimos', name: 'Actium' }],
    objective: { kind: 'survive', seconds: 180 },
    reward: 'deimos',
  },
  {
    id: 'SM1-07', title: 'Slaying Ravana', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'The destroyer that gutted the Actium is the SD Ravana Beleth, and it is '
      + 'still in the nebula. Every hull we can spare is yours. Kill it, and the '
      + 'Alliance learns that their capitals can die too.',
    enemy: ['ravana'], names: { B: ['Beleth'] },
    attach: [{ key: 'mentu', name: 'Kehnmu' }, { key: 'sobek', name: 'Nefertari' }],
    objective: { kind: 'destroy' },
    reward: 'mentu',
  },
  {
    id: 'SM1-08', title: 'The Sixth Wonder', act: 'ACT I', where: 'Epsilon Pegasi — Enif Station',
    brief: 'The NTF is hitting Enif Station and its evacuation traffic. Hold the '
      + 'station. The Colossus makes its combat debut over this rock today; try '
      + 'to leave it something to shoot at.',
    enemy: ['leviathan', 'leviathan', 'deimos'], names: { B: ['Hawkwood', 'Ashanti', 'Boadicea'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-09', title: 'Into the Maelstrom', act: 'ACT I', where: 'Epsilon Pegasi asteroid field',
    brief: 'Escort the convoy through the belt to the Colossus rendezvous. The NTF '
      + 'cruiser Maelstrom is sited in the rocks with a heavy beam and good '
      + 'firing lanes. Silence it.',
    enemy: ['fenris', 'cain'], names: { B: ['Maelstrom', 'Nagari'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-10', title: 'Feint! Parry! Riposte!', act: 'ACT I', where: 'Epsilon Pegasi',
    brief: 'Bait. Hit the rebel cruisers hard enough that the NTD Repulse commits '
      + 'to saving them — then hold until the Colossus closes the trap. The '
      + 'Repulse will not surrender. Its captain has already decided how this ends.',
    enemy: ['orion', 'fenris', 'fenris'], names: { B: ['Repulse', 'Vindicator', 'Zealot'] },
    objective: { kind: 'survive', seconds: 200 },
    reward: 'aeolus',
    loopOffer: 'LOOP1-1',
  },

  // ---- SOC Loop I (optional) ----
  {
    id: 'LOOP1-1', title: 'Rebels & Renegades', act: 'SOC LOOP I', where: 'NTF-controlled space', loop: 1,
    brief: 'Special Operations Command wants eyes inside the rebellion. Your hull '
      + 'wears NTF colours for this one. Vasudan ships loyal to Bosch hold this '
      + 'station and they do not know you are lying.',
    enemy: ['mentu', 'sobek'], names: { B: ['Hinton', 'Sekhem'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'LOOP1-2', title: 'Love the Treason...', act: 'SOC LOOP I', where: 'NTF-controlled space', loop: 1,
    brief: 'The cover holds until it does not. Two NTF flak cruisers are escorting '
      + 'the prize. When the deception collapses you will be inside their '
      + 'anti-fighter envelope with no line of retreat.',
    enemy: ['aeolus', 'aeolus'], names: { B: ['Sunder', 'Hamako'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'LOOP1-3', title: '...But Hate the Traitor', act: 'SOC LOOP I', where: 'GTVA cargo depot', loop: 1,
    brief: 'Extraction. The rebel wing you have been flying with is about to hit a '
      + 'GTVA depot, and you are about to stop being one of them. Cover the '
      + 'extraction and get clear.',
    enemy: ['aeolus', 'deimos'], names: { B: ['Anvil', 'Belisarius II'] },
    objective: { kind: 'survive', seconds: 150 },
    reward: 'deimos',
  },

  // ---- Act II: the rebellion ends, something worse begins ----
  {
    id: 'SM2-01', title: 'Battle of the Wilderness', act: 'ACT II', where: 'Nebula beyond Gamma Draconis',
    brief: 'First operational deployment of the Lucidity AWACS platform. It sees '
      + 'further than anything else we have out here, which makes it the only '
      + 'thing the Shivans will want to kill.',
    enemy: ['cain', 'rakshasa'], names: { B: ['Erinpura', 'Vauban'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM2-03', title: 'Proving Grounds', act: 'ACT II', where: 'Nebula proving ground',
    brief: 'A weapons exercise has become a live engagement. The Shivan corvette '
      + 'Tiamat is between the Aquitaine and open space, and the Aquitaine is not '
      + 'in a condition to argue with it.',
    enemy: ['moloch'], names: { B: ['Tiamat'] },
    attach: [{ key: 'hecate', name: 'Aquitaine' }],
    objective: { kind: 'protect', ship: 'Aquitaine' },
  },
  {
    id: 'SM2-04', title: "The King's Gambit", act: 'ACT II', where: 'Capella blockade route',
    brief: 'The NTF is running the Capella blockade in strength. Break the convoy '
      + 'escort. Keep ordnance in reserve — the Perseverance arrives late and it '
      + 'is the only one of them that can hurt you.',
    enemy: ['orion', 'deimos', 'aeolus'], names: { B: ['Perseverance', 'Carthage', 'Vigil'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM2-05', title: 'The Sicilian Defense', act: 'ACT II', where: 'Gamma Draconis',
    brief: 'The rebels are massing at a rally point in Gamma Draconis and Bosch is '
      + 'not with them. Destroy what he left behind. The NTF ends here or it ends '
      + 'in Capella, and Capella has other problems.',
    enemy: ['orion', 'deimos', 'leviathan', 'aeolus'],
    names: { B: ['Ravenous', 'Belisarius III', 'Tenacious', 'Wrath'] },
    objective: { kind: 'destroy' },
    reward: 'hecate',
  },
  {
    id: 'SM2-06', title: 'Endgame', act: 'ACT II', where: 'Gamma Draconis — Knossos',
    brief: 'Bosch is at the Knossos portal and the Colossus has been sabotaged. The '
      + 'Iceni will reach the portal — that is beyond our reach now. Destroy the '
      + 'force he leaves to cover it.',
    enemy: ['deimos', 'aeolus', 'fenris'], names: { B: ['Iceni', 'Vindicta', 'Loyalist'] },
    objective: { kind: 'survive', seconds: 200 },
    reward: 'orion',
  },
  {
    id: 'SM2-07', title: 'The Fog of War', act: 'ACT II', where: 'Nebula resource field',
    brief: 'Shivan gas-mining operation in the resource field. Straightforward work '
      + '— until it is not. If something the size of a moon comes out of the '
      + 'nebula, identify it and get the imagery home. That is the mission.',
    enemy: ['sathanas'], names: { B: ['Apocalypse'] },
    objective: { kind: 'survive', seconds: 170 },
  },
  {
    id: 'SM2-09', title: 'Speaking in Tongues', act: 'ACT II', where: 'Nebula',
    brief: 'Hit the Shivan picket hard enough to pull the juggernaut off station. '
      + 'The plan requires the Sathanas to move. It does not require any of us to '
      + 'still be here when it does.',
    enemy: ['moloch', 'rakshasa', 'cain'], names: { B: ['Nemesis', 'Baal', 'Moloch'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM2-10', title: 'A Flaming Sword', act: 'ACT II', where: 'Gamma Draconis — Knossos',
    brief: 'Meson bombs, placed by hand, on a structure older than our species. '
      + 'Close the portal. The Sathanas is in system and will come when it '
      + 'notices — hold the blast zone until the charges are set.',
    enemy: ['sathanas', 'cain'], names: { B: ['Apocalypse', 'Sekhmet'] },
    objective: { kind: 'survive', seconds: 210 },
  },

  // ---- Act III: Capella ----
  {
    id: 'SM3-01', title: 'Bearbaiting', act: 'ACT III', where: 'Gamma Draconis–Capella route',
    brief: 'The Sathanas is running for Capella. Its four forward beam cannons are '
      + 'the reason nothing has stopped it. Cripple the battery before it makes '
      + 'the node and the Colossus gets a fight instead of a funeral.',
    enemy: ['sathanas', 'demon'], names: { B: ['Apocalypse', 'Beleth II'] },
    objective: { kind: 'survive', seconds: 200 },
  },
  {
    id: 'SM3-02', title: 'High Noon', act: 'ACT III', where: 'Capella',
    brief: 'The Colossus against a crippled juggernaut at knife range. Six '
      + 'kilometres of Alliance shipbuilding against everything the Shivans are. '
      + 'Support the flagship and stay out of the beam lanes.',
    enemy: ['sathanas'], names: { B: ['Apocalypse'] },
    attach: [{ key: 'colossus', name: 'Colossus' }],
    objective: { kind: 'destroy' },
    reward: 'colossus',
  },
  {
    id: 'SM3-03', title: 'Return to Babel', act: 'ACT III', where: 'Knossos/nebula route',
    brief: 'We have finally caught the Iceni — and Bosch is talking to the Shivans. '
      + 'Take the escorts apart. Whatever he has learned out there, Command wants '
      + 'him alive to explain it.',
    enemy: ['cain', 'rakshasa'], names: { B: ['Sammael', 'Azmedaj'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM3-04', title: 'Straight, No Chaser', act: 'ACT III', where: 'Uncharted nebula',
    brief: 'Follow the Shivan transport into uncharted space. The Psamtik is '
      + 'jumping in behind you as heavy cover. Be advised: a second juggernaut is '
      + 'unaccounted for, and the Psamtik does not know that.',
    enemy: ['sathanas', 'cain', 'rakshasa'], names: { B: ['Eumenides', 'Dahaka', 'Sephiroth'] },
    attach: [{ key: 'hatshepsut', name: 'Psamtik' }],
    objective: { kind: 'survive', seconds: 190 },
  },
  {
    id: 'SM3-05', title: 'Argonautica', act: 'ACT III', where: 'Nebula near Gamma Draconis node',
    brief: 'The Aquitaine is disabled and under tow with repair crews aboard. Shivan '
      + 'waves are inbound and she cannot manoeuvre, cannot run, and cannot '
      + 'defend her own flanks. That is your job.',
    enemy: ['moloch', 'cain'], names: { B: ['Tiamat II', 'Nagari'] },
    attach: [{ key: 'hecate', name: 'Aquitaine' }],
    objective: { kind: 'protect', ship: 'Aquitaine' },
    loopOffer: 'LOOP2-1',
  },

  // ---- SOC Loop II (optional) ----
  {
    id: 'LOOP2-1', title: 'As Lightning Fall', act: 'SOC LOOP II', where: 'Nebula', loop: 2,
    brief: 'A GTVA operative is alive in Shivan-held nebula and the beacon trail '
      + 'that leads to her is being watched. Run the beacons, find the Grall, '
      + 'bring her home.',
    enemy: ['rakshasa', 'cain'], names: { B: ['Grall Watcher', 'Nachash'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'LOOP2-2', title: "Into the Lion's Den", act: 'SOC LOOP II', where: 'Beyond the second Knossos', loop: 2,
    brief: 'Through the second portal, into whatever the Shivans call home. Destroy '
      + 'the subspace devices, record what is massing there, and get back through '
      + 'the node. Nothing about this is a fight you can win.',
    enemy: ['sathanas', 'sathanas', 'ravana'], names: { B: ['Ashtaroth', 'Belial', 'Nahema'] },
    objective: { kind: 'survive', seconds: 160 },
    reward: 'hades',
  },

  // ---- Act III: the evacuation ----
  {
    id: 'SM3-06', title: 'Exodus', act: 'ACT III', where: 'Capella',
    brief: 'Capella is being abandoned. Escort the evacuation convoy and the '
      + 'hospital ship Vesalius clear of the system. Every transport you lose is '
      + 'counted in thousands.',
    enemy: ['moloch', 'cain'], names: { B: ['Aggressor', 'Sekhmet II'] },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM3-07', title: 'Dunkerque', act: 'ACT III', where: 'Capella — 3rd Fleet HQ',
    brief: 'Third Fleet headquarters is evacuating under fire. Transports are '
      + 'launching in waves and a Shivan destroyer is working through them. Hold '
      + 'the corridor open as long as there are people still in it.',
    enemy: ['ravana', 'sathanas'], names: { B: ['Rakshasa', 'Eumenides'] },
    objective: { kind: 'survive', seconds: 200 },
  },
  {
    id: 'SM3-08', title: 'Their Finest Hour', act: 'ACT III', where: 'Capella — Gamma Draconis node',
    brief: 'A feint, to buy the evacuation hours. The Colossus stays behind to sell '
      + 'it. Command has been honest with you about the odds, which should tell '
      + 'you what Command expects.',
    enemy: ['sathanas', 'sathanas', 'ravana', 'cain'],
    names: { B: ['Apocalypse', 'Ashtaroth', 'Beleth III', 'Nachash'] },
    objective: { kind: 'survive', seconds: 220 },
  },
  {
    id: 'SM3-09', title: 'Clash of the Titans II', act: 'ACT III', where: 'Capella — Epsilon Pegasi node',
    brief: 'The Bastion is carrying meson bombs to the node and cannot be allowed '
      + 'to die before she gets there. Heavy Shivan opposition all the way. '
      + 'Whatever is left of your task force after this goes straight into the last one.',
    enemy: ['sathanas', 'sathanas', 'rakshasa'],
    names: { B: ['Eumenides', 'Ashtaroth', 'Baal'] },
    attach: [{ key: 'orion', name: 'Bastion' }],
    objective: { kind: 'protect', ship: 'Bastion' },
  },
  {
    id: 'SM3-10', title: 'Apocalypse', act: 'ACT III', where: 'Capella — Vega node',
    brief: 'Capella is going supernova. The node is open and the withdrawal has '
      + 'twelve minutes. Cover it. Then run — and be through the node when the '
      + 'star lets go, because nothing behind you is going to survive it.',
    enemy: ['sathanas', 'sathanas', 'cain', 'rakshasa'],
    names: { B: ['Ashtaroth', 'Eumenides', 'Nachash', 'Baal'] },
    objective: { kind: 'survive', seconds: 240 },
  },
];

// The main line, in order. Optional SOC loops hang off `loopOffer` and rejoin
// the main line when they finish.
export const MAIN_LINE = MISSIONS.filter((m) => !m.loop).map((m) => m.id);

export function missionById(id) {
  return MISSIONS.find((m) => m.id === id) ?? null;
}

// Where the campaign goes after `id` completes: the next loop mission while a
// loop is running, otherwise the next main-line mission.
export function nextMissionId(id) {
  const m = missionById(id);
  if (!m) return MAIN_LINE[0];
  if (m.loop) {
    const loopIds = MISSIONS.filter((x) => x.loop === m.loop).map((x) => x.id);
    const at = loopIds.indexOf(id);
    if (at >= 0 && at < loopIds.length - 1) return loopIds[at + 1];
    // Loop finished — rejoin the main line after the mission that offered it.
    const offer = MISSIONS.find((x) => x.loopOffer === loopIds[0]);
    const back = MAIN_LINE.indexOf(offer?.id);
    return MAIN_LINE[back + 1] ?? null;
  }
  const at = MAIN_LINE.indexOf(id);
  return at >= 0 ? MAIN_LINE[at + 1] ?? null : null;
}

// Your first command.
export const STARTING_FLEET = [{ key: 'fenris', name: 'Vigilant' }];
