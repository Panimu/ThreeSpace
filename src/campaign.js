// Campaign: the FreeSpace 2 war fought from a capital ship's bridge.
//
// Force composition is canon. Every mission's friendly hulls, opposition and
// non-combatants — and their names — come from `scripts/fs2-campaign-source.json`,
// the distilled retail roster; `scripts/check-campaign.mjs` audits this file
// against it and fails on drift. What is *ours* is the briefing prose, the
// difficulty caps (a side is trimmed to keep a battle readable on a phone) and
// the reward/loop progression.
//
// Where canon and the format disagree, canon wins on presence and loses on
// scale: if retail fields seven friendly capitals, we field the three that
// matter and say so. Two deliberate exceptions are marked `// canon note`.
//
// Mission shape:
//   id/title/act/where  identity and campaign placement
//   brief               operational orders, our words
//   enemy               opposition, as { key, name } records
//   attach              ships lent to you for this operation only — they fight
//                       under your command but never join the roster
//   civilians           non-combatants present: A fights with you, B against
//   objective           what winning means:
//                         destroy  — every hostile warship
//                         survive  — hold the action for `seconds`
//                         protect  — named `ship` must live
//                         raid     — named `targets` must die, then withdraw
//   canonNote           why this mission deviates from the canon roster;
//                       `scripts/check-campaign.mjs` reads it and stops
//                       treating the deviation as an error
//   reward              hull permanently added to your task force after a win
//   loopOffer           id of the optional branch offered on completion

export const MISSIONS = [
  // ---- Act I: the NTF rebellion, and what was waiting behind it ----
  {
    id: 'SM1-01', title: 'Surrender, Belisarius!', act: 'ACT I', where: 'Deneb — Cygnus Prime',
    brief: 'Vasudan freighters of the Iota group are limping out of Cygnus Prime '
      + 'with rebel colours closing on them. The NTF corvette Belisarius has '
      + 'ignored three orders to stand down. The Psamtik is on station and will '
      + 'not fire first. Get between the Belisarius and the Iota group.',
    enemy: [{ key: 'deimos', name: 'Belisarius' }],
    attach: [{ key: 'hatshepsut', name: 'Psamtik' }],
    civilians: { A: [{ key: 'bes', name: 'Iota' }] },
    objective: { kind: 'protect', ship: 'Iota' },
  },
  {
    id: 'SM1-02', title: 'The Place of Chariots', act: 'ACT I', where: 'Deneb asteroid belt',
    brief: 'Intelligence puts an NTF supply depot inside the Deneb belt — Capricorn '
      + 'freighters under sentry cover, with a corvette riding escort. Kill the '
      + 'depot. You are not here to win a fleet action against a Deimos and you '
      + 'will not be given a second chance to learn that.',
    enemy: [{ key: 'deimos' }],
    civilians: {
      B: [{ key: 'triton', name: 'Capricorn' }, { key: 'poseidon', name: 'Capricorn' },
        { key: 'mjolnir', name: 'Sentry' }, { key: 'mjolnir', name: 'Sentry' }],
    },
    objective: { kind: 'raid', targets: ['Capricorn', 'Sentry'] },
  },
  {
    id: 'SM1-03', title: 'The Romans Blunder', act: 'ACT I', where: 'Deneb–Sirius jump route',
    brief: 'Bosch is running for the Sirius node aboard the Iceni with the Glorious '
      + 'and the Impervious between him and us. You will not catch the Iceni — '
      + 'nobody will today. Hold the route open and survive the covering force.',
    enemy: [{ key: 'iceni', name: 'Iceni' }, { key: 'fenris', name: 'Glorious' },
      { key: 'leviathan', name: 'Impervious' }],
    attach: [{ key: 'hatshepsut', name: 'Psamtik' }],
    civilians: { B: [{ key: 'triton', name: 'Capricorn' }] },
    objective: { kind: 'survive', seconds: 150 },
    reward: 'deimos',
  },
  {
    id: 'SM1-04', title: 'A Lion at the Door', act: 'ACT I', where: 'Gamma Draconis node',
    brief: 'A new portal has opened at Gamma Draconis and the GTD Carthage holds the '
      + 'node with the Dahshor in support. Whatever comes through, it does not get '
      + 'past you to her.',
    enemy: [{ key: 'rakshasa', name: 'Behemoth' }, { key: 'cain', name: 'Goliath' }],
    attach: [{ key: 'orion', name: 'Carthage' }, { key: 'sobek', name: 'Dahshor' }],
    civilians: {
      A: [{ key: 'knossos', name: 'Subspace Portal' }],
      B: [{ key: 'asmodeus', name: 'Neqael' }, { key: 'mephisto', name: 'Maul' }],
    },
    objective: { kind: 'protect', ship: 'Carthage' },
  },
  {
    id: 'SM1-05', title: 'Mystery of the Trinity', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'Sweep the nebula for the cruiser Trinity and the transport Discovery. '
      + 'Sensors are close to useless in this soup — you will be inside gun range '
      + 'before you have a firing solution. The Aquitaine is running the search '
      + 'with you. Shivan pickets are confirmed.',
    enemy: [{ key: 'fenris', name: 'Trinity' }, { key: 'cain', name: 'Charon' }],
    attach: [{ key: 'hecate', name: 'Aquitaine' }],
    civilians: { A: [{ key: 'elysium', name: 'Discovery' }] },
    canonNote: 'Retail sends only Shivan fighters into the nebula sweep; one '
      + 'cruiser stands in for them so the capital layer has an opponent.',
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM1-06', title: 'The Great Hunt', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'Search and destroy with the corvettes Actium and Lysander. Command '
      + 'expects cruisers. Command has been wrong before — if something bigger '
      + 'comes out of the murk, break off and keep your hull. The corvettes have '
      + 'the same orders. Whether they follow them is their captains\u2019 business.',
    enemy: [{ key: 'cain', name: 'Asuras' }, { key: 'rakshasa', name: 'Iblis' },
      { key: 'ravana', name: 'Beleth' }],
    attach: [{ key: 'deimos', name: 'Actium' }, { key: 'deimos', name: 'Lysander' }],
    canonNote: 'Retail\u2019s primary is "Protect Corvettes" — but the Ravana '
      + 'kills them and the next operation is named for it. The cruisers named '
      + 'in retail\u2019s secondaries are the objective; the corvettes are the cost.',
    objective: { kind: 'raid', targets: ['Asuras', 'Iblis'] },
    reward: 'mentu',
  },
  {
    id: 'SM1-07', title: 'Slaying Ravana', act: 'ACT I', where: 'Nebula beyond Gamma Draconis',
    brief: 'The destroyer that mauled the corvette screen is the SD Ravana Beleth, '
      + 'and it is still in the nebula. Every hull we can spare is yours. Kill it, '
      + 'and the Alliance learns that their capitals can die too.',
    enemy: [{ key: 'ravana', name: 'Beleth' }],
    attach: [{ key: 'sobek', name: 'Khenmu' }, { key: 'mentu', name: 'Somtus' },
      { key: 'deimos', name: 'Yakiba' }],
    objective: { kind: 'destroy' },
    reward: 'sobek',
  },
  {
    id: 'SM1-08', title: 'The Sixth Wonder', act: 'ACT I', where: 'Epsilon Pegasi — Enif Station',
    brief: 'The NTF is hitting Enif Station and its evacuation traffic. Hold the '
      + 'station. The Colossus makes its combat debut over this rock today; try to '
      + 'leave it something to shoot at.',
    enemy: [{ key: 'deimos', name: 'Hawkwood' }, { key: 'leviathan', name: 'Cato' },
      { key: 'leviathan', name: 'Conquest' }],
    attach: [{ key: 'colossus', name: 'Colossus' }],
    civilians: {
      A: [{ key: 'arcadia', name: 'Enif Station' }, { key: 'triton', name: 'Calypso' },
        { key: 'elysium', name: 'Mannheim' }],
    },
    objective: { kind: 'protect', ship: 'Enif Station' },
  },
  {
    id: 'SM1-09', title: 'Into the Maelstrom', act: 'ACT I', where: 'Epsilon Pegasi asteroid field',
    brief: 'Escort the convoy through the belt to the Colossus rendezvous. The NTF '
      + 'cruiser Maelstrom is sited in the rocks behind a picket of sentry guns '
      + 'with good firing lanes. The Parracombe cannot outrun any of it.',
    enemy: [{ key: 'fenris', name: 'Maelstrom' }],
    attach: [{ key: 'colossus', name: 'Colossus' }, { key: 'deimos', name: 'Parapet' }],
    civilians: {
      A: [{ key: 'triton', name: 'Parracombe' }, { key: 'zephyrus', name: 'Avila' },
        { key: 'elysium', name: 'Hauler' }],
      B: [{ key: 'mjolnir', name: 'Gun One' }, { key: 'mjolnir', name: 'Gun Two' },
        { key: 'mjolnir', name: 'Gun Three' }, { key: 'mjolnir', name: 'Gun Four' },
        { key: 'mjolnir', name: 'Gun Five' }, { key: 'mjolnir', name: 'Gun Six' }],
    },
    objective: { kind: 'protect', ship: 'Parracombe' },
  },
  {
    id: 'SM1-10', title: 'Feint! Parry! Riposte!', act: 'ACT I', where: 'Epsilon Pegasi',
    brief: 'Bait. Hit the rebel cruisers hard enough that the NTD Repulse commits to '
      + 'saving them — then finish it with the Colossus and the Rampart. The '
      + 'Repulse will not surrender. Its captain has already decided how this ends.',
    enemy: [{ key: 'orion', name: 'Repulse' }, { key: 'fenris', name: 'Majestic' },
      { key: 'fenris', name: 'Refute' }],
    attach: [{ key: 'colossus', name: 'Colossus' }, { key: 'leviathan', name: 'Rampart' }],
    objective: { kind: 'destroy' },
    reward: 'typhon',
    loopOffer: 'LOOP1-1',
  },

  // ---- SOC Loop I (optional) ----
  {
    id: 'LOOP1-1', title: 'Rebels & Renegades', act: 'SOC LOOP I', where: 'NTF-controlled space', loop: 1,
    brief: 'Special Operations Command wants eyes inside the rebellion. Your hull '
      + 'wears NTF colours for this one and the Iceni herself is your cover. '
      + 'Vasudan ships loyal to nobody hold this station, and the science vessel '
      + 'Hinton is the reason you are here. Hold until the scan completes.',
    enemy: [{ key: 'mentu', name: 'Yaaru' }, { key: 'sobek', name: 'Asar' }],
    attach: [{ key: 'iceni', name: 'Iceni' }],
    civilians: { A: [{ key: 'faustus', name: 'Hinton' }] },
    objective: { kind: 'survive', seconds: 150 },
  },
  {
    id: 'LOOP1-2', title: 'Love the Treason...', act: 'SOC LOOP I', where: 'NTF-controlled space', loop: 1,
    brief: 'The cover holds until it does not. Two NTF flak cruisers are escorting '
      + 'the prize. When the deception collapses you will be inside their '
      + 'anti-fighter envelope with the transport Sunder alongside and no line of '
      + 'retreat.',
    enemy: [{ key: 'aeolus', name: 'Mylae' }, { key: 'aeolus', name: 'Hellespont' }],
    attach: [{ key: 'deimos', name: 'Naxos' }, { key: 'deimos', name: 'Sevrin' }],
    civilians: {
      A: [{ key: 'argo', name: 'Sunder' }, { key: 'charybdis', name: 'Hamako' },
        { key: 'hygeia', name: 'Centaur' }],
    },
    objective: { kind: 'protect', ship: 'Sunder' },
  },
  {
    id: 'LOOP1-3', title: '...But Hate the Traitor', act: 'SOC LOOP I', where: 'GTVA cargo depot', loop: 1,
    brief: 'Extraction. The rebel wing you have been flying with is about to hit a '
      + 'GTVA depot, and you are about to stop being one of them. Cover the '
      + 'transport Omega and get clear.',
    enemy: [{ key: 'aeolus', name: 'Saharan' }],
    civilians: {
      A: [{ key: 'elysium', name: 'Omega' }],
      B: [{ key: 'mjolnir', name: 'Alastor' }],
    },
    objective: { kind: 'survive', seconds: 150 },
    reward: 'aten',
  },

  // ---- Act II: the rebellion ends, something worse begins ----
  {
    id: 'SM2-01', title: 'Battle of the Wilderness', act: 'ACT II', where: 'Nebula beyond Gamma Draconis',
    brief: 'First operational deployment of the Lucidity AWACS platform, with the '
      + 'Vauban and the Erinpura carrying its support crews. It sees further than '
      + 'anything else out here, which makes it the only thing the Shivans want.',
    enemy: [{ key: 'cain', name: 'Malor' }],
    attach: [{ key: 'deimos', name: 'Warspite' }],
    civilians: {
      A: [{ key: 'charybdis', name: 'Lucidity' }, { key: 'triton', name: 'Vauban' },
        { key: 'triton', name: 'Erinpura' }],
    },
    objective: { kind: 'protect', ship: 'Vauban' },
  },
  {
    id: 'SM2-02', title: 'A Game of TAG', act: 'ACT II', where: 'Nebula beyond Gamma Draconis',
    brief: 'Live trial of the TAG targeting missile with the Lucidity painting for '
      + 'you and the Warspite riding shotgun. The trial ends the moment the '
      + 'Shivans work out what the Lucidity is.',
    enemy: [{ key: 'cain', name: 'Ashmedai' }],
    canonNote: 'Retail fields no Shivan capital here — the trial is fought by '
      + 'fighters. A single cruiser stands in as the threat to the Lucidity.',
    attach: [{ key: 'deimos', name: 'Warspite' }],
    civilians: { A: [{ key: 'charybdis', name: 'Lucidity' }] },
    objective: { kind: 'protect', ship: 'Lucidity' },
  },
  {
    id: 'SM2-03', title: 'Proving Grounds', act: 'ACT II', where: 'Nebula proving ground',
    brief: 'A weapons exercise has become a live engagement. The Shivan corvette '
      + 'Tiamat is between the Aquitaine and open space, and the Aquitaine is not '
      + 'in a condition to argue with it.',
    enemy: [{ key: 'moloch', name: 'Tiamat' }],
    attach: [{ key: 'hecate', name: 'Aquitaine' }, { key: 'fenris', name: 'Oberon' }],
    objective: { kind: 'protect', ship: 'Aquitaine' },
  },
  {
    id: 'SM2-04', title: "The King's Gambit", act: 'ACT II', where: 'Capella blockade route',
    brief: 'The NTF is running the Capella blockade in strength. Break the convoy '
      + 'escort. Keep ordnance in reserve — the Perseverance arrives late and it '
      + 'is the only one of them that can hurt you.',
    enemy: [{ key: 'orion', name: 'Uhuru' }, { key: 'deimos', name: 'Perseverance' },
      { key: 'aeolus', name: 'Liberty' }, { key: 'leviathan', name: 'Undaunted' }],
    attach: [{ key: 'typhon', name: 'Hedetet' }, { key: 'mentu', name: 'Unut' },
      { key: 'deimos', name: 'York' }],
    civilians: {
      A: [{ key: 'mjolnir', name: 'Mjolnir' }],
      B: [{ key: 'argo', name: 'Inspiration' }],
    },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM2-05', title: 'The Sicilian Defense', act: 'ACT II', where: 'Gamma Draconis',
    brief: 'The rebels are massing at a rally point in Gamma Draconis and Bosch is '
      + 'not with them. Destroy what he left behind. The NTF ends here or it ends '
      + 'in Capella, and Capella has other problems.',
    enemy: [{ key: 'orion', name: 'Vindicator' }, { key: 'deimos', name: 'Yoshitomo' },
      { key: 'leviathan', name: 'Alba' }, { key: 'aeolus', name: 'Epigoni' }],
    attach: [{ key: 'sobek', name: 'Hyksos' }, { key: 'deimos', name: 'Diomedes' }],
    civilians: { B: [{ key: 'argo', name: 'Venture' }] },
    objective: { kind: 'destroy' },
    reward: 'hecate',
  },
  {
    id: 'SM2-06', title: 'Endgame', act: 'ACT II', where: 'Gamma Draconis — Knossos',
    brief: 'Bosch is at the Knossos portal and the Colossus has been sabotaged. The '
      + 'Iceni will reach the portal — that is beyond our reach now. Keep the '
      + 'portal intact and destroy the force he leaves to cover him.',
    enemy: [{ key: 'iceni', name: 'Iceni' }, { key: 'aeolus', name: 'Loyola' },
      { key: 'deimos', name: 'Danton' }],
    attach: [{ key: 'colossus', name: 'Colossus' }, { key: 'deimos', name: 'Monitor' },
      { key: 'fenris', name: 'Fortune' }],
    civilians: { A: [{ key: 'knossos', name: 'Knossos' }] },
    objective: { kind: 'protect', ship: 'Knossos' },
    reward: 'orion',
  },
  {
    id: 'SM2-07', title: 'The Fog of War', act: 'ACT II', where: 'Nebula resource field',
    brief: 'Shivan gas-mining operation in the resource field, with the Tatenen and '
      + 'the Junit working the survey. Straightforward — until it is not. If '
      + 'something the size of a moon comes out of the nebula, identify it and get '
      + 'the imagery home. That is the mission.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }],
    attach: [{ key: 'sobek', name: 'Tatenen' }],
    civilians: {
      A: [{ key: 'setekh', name: 'Junit' }],
      B: [{ key: 'rahu', name: 'Rahu' }, { key: 'belial', name: 'Belial' }],
    },
    objective: { kind: 'raid', targets: ['Rahu', 'Belial'] },
  },
  {
    id: 'SM2-08', title: 'A Monster in the Mist', act: 'ACT II', where: 'Nebula',
    brief: 'Get close enough to the juggernaut to read its subsystems and live to '
      + 'file it. The Maahes will hold the scanning line as long as it can. Nobody '
      + 'has ever been this close to one and come back with a hull.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }],
    attach: [{ key: 'sobek', name: 'Maahes' }],
    objective: { kind: 'survive', seconds: 160 },
  },
  {
    id: 'SM2-09', title: 'Speaking in Tongues', act: 'ACT II', where: 'Nebula',
    brief: 'Hit the Shivan picket hard enough to pull the juggernaut off station. '
      + 'The Iceni is here too, and Bosch is talking to them — but your orders '
      + 'name Shivan hulls only, and Command was very clear about that.',
    enemy: [{ key: 'moloch', name: 'Golab' }, { key: 'rakshasa', name: 'Rephaim' },
      { key: 'cain', name: 'Thaumiel' }],
    attach: [{ key: 'sobek', name: 'Thutmose' }],
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM2-10', title: 'A Flaming Sword', act: 'ACT II', where: 'Gamma Draconis — Knossos',
    brief: 'Meson bombs, placed by hand, on a structure older than our species. '
      + 'Close the portal. The Sathanas is in system and will come when it '
      + 'notices — hold the blast zone until the charges are set.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }],
    attach: [{ key: 'sobek', name: 'Renenet' }],
    civilians: {
      A: [{ key: 'triton', name: 'Lambda' }],
      B: [{ key: 'knossos', name: 'Knossos Portal' }],
    },
    objective: { kind: 'raid', targets: ['Knossos Portal'] },
  },

  // ---- Act III: Capella ----
  {
    id: 'SM3-01', title: 'Bearbaiting', act: 'ACT III', where: 'Gamma Draconis–Capella route',
    brief: 'The Sathanas is running for Capella. Its four forward beam cannons are '
      + 'the reason nothing has stopped it. Cripple the battery with the Phoenicia '
      + 'and the Thebes before it makes the node, and the Colossus gets a fight '
      + 'instead of a funeral.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }, { key: 'demon', name: 'Beleth' }],
    attach: [{ key: 'hecate', name: 'Phoenicia' }, { key: 'sobek', name: 'Thebes' }],
    objective: { kind: 'survive', seconds: 200 },
  },
  {
    id: 'SM3-02', title: 'High Noon', act: 'ACT III', where: 'Capella',
    brief: 'The Colossus against a crippled juggernaut at knife range. Six '
      + 'kilometres of Alliance shipbuilding against everything the Shivans are. '
      + 'Support the flagship and stay out of the beam lanes.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }],
    attach: [{ key: 'colossus', name: 'Colossus' }],
    objective: { kind: 'destroy' },
    reward: 'colossus',
  },
  {
    id: 'SM3-03', title: 'Return to Babel', act: 'ACT III', where: 'Knossos/nebula route',
    brief: 'We have finally caught the Iceni — and Bosch is talking to the Shivans. '
      + 'Take the escorts apart and leave the Iceni afloat. Whatever he has '
      + 'learned out there, Command wants him alive to explain it.',
    enemy: [{ key: 'cain', name: 'Azmedaj' }, { key: 'rakshasa', name: 'Sammael' }],
    civilians: {
      A: [{ key: 'argo', name: 'Qeb' }],
      B: [{ key: 'azraeltr', name: 'Azrael' }],
    },
    objective: { kind: 'destroy' },
  },
  {
    id: 'SM3-04', title: 'Straight, No Chaser', act: 'ACT III', where: 'Uncharted nebula',
    brief: 'Follow the Shivan transport into uncharted space. The Psamtik is jumping '
      + 'in behind you as heavy cover. Be advised: a second juggernaut is '
      + 'unaccounted for, and the Psamtik does not know that.',
    enemy: [{ key: 'sathanas', name: 'Eumenides' }, { key: 'cain', name: 'Dahaka' },
      { key: 'rakshasa', name: 'Sephiroth' }],
    attach: [{ key: 'hatshepsut', name: 'Psamtik' }],
    civilians: { B: [{ key: 'knossos', name: 'Knossos' }] },
    objective: { kind: 'survive', seconds: 190 },
  },
  {
    id: 'SM3-05', title: 'Argonautica', act: 'ACT III', where: 'Nebula near Gamma Draconis node',
    brief: 'The Aquitaine is disabled and under tow with repair crews aboard, the '
      + 'Agrippa screening and the transport Argo working her hull. Shivan waves '
      + 'are inbound and she cannot manoeuvre, cannot run, and cannot defend her '
      + 'own flanks. That is your job.',
    enemy: [{ key: 'moloch', name: 'Abaddon' }],
    attach: [{ key: 'hecate', name: 'Aquitaine' }, { key: 'aeolus', name: 'Agrippa' }],
    civilians: { A: [{ key: 'argo', name: 'Argo' }] },
    objective: { kind: 'protect', ship: 'Aquitaine' },
    loopOffer: 'LOOP2-1',
  },

  // ---- SOC Loop II (optional) ----
  {
    id: 'LOOP2-1', title: 'As Lightning Fall', act: 'SOC LOOP II', where: 'Nebula', loop: 2,
    brief: 'A GTVA operative is alive in Shivan-held nebula aboard the transport '
      + 'Grall, and the beacon trail that leads to her is being watched. Run the '
      + 'beacons, reach the Grall, bring her home.',
    enemy: [{ key: 'rakshasa', name: 'Nachash' }, { key: 'cain', name: 'Watcher' }],
    civilians: {
      A: [{ key: 'argo', name: 'Grall' }, { key: 'elysium', name: 'Lambda' }],
    },
    canonNote: 'Retail flies this one against fighters, and IFFs the Grall '
      + 'hostile while she is in Shivan hands. Here she starts on your side as '
      + 'the charge, and two cruisers stand in for the patrol.',
    objective: { kind: 'protect', ship: 'Grall' },
  },
  {
    id: 'LOOP2-2', title: "Into the Lion's Den", act: 'SOC LOOP II', where: 'Beyond the second Knossos', loop: 2,
    brief: 'Through the second portal, into whatever the Shivans call home. Record '
      + 'what is massing there and get back through the node. Nothing about this '
      + 'is a fight you can win.',
    enemy: [{ key: 'sathanas', name: 'Ashtaroth' },
      { key: 'ravana', name: 'Nebiros' }, { key: 'rakshasa', name: 'Orcus' }],
    civilians: {
      B: [{ key: 'commnode', name: 'Comm Node' }, { key: 'knossos', name: 'Knossos' }],
    },
    objective: { kind: 'survive', seconds: 75 },
    reward: 'hades',
  },

  // ---- Act III: the evacuation ----
  {
    id: 'SM3-06', title: 'Exodus', act: 'ACT III', where: 'Capella',
    brief: 'Capella is being abandoned. Escort the Lambda transports and the '
      + 'hospital ship Vesalius clear of the system. Every transport you lose is '
      + 'counted in thousands.',
    enemy: [{ key: 'moloch', name: 'Abraxis' }, { key: 'cain', name: 'Gibborim' }],
    attach: [{ key: 'sobek', name: 'Nebtuu' }],
    civilians: {
      A: [{ key: 'hippocrates', name: 'Vesalius' }, { key: 'argo', name: 'Lambda' },
        { key: 'triton', name: 'Sulla' }],
    },
    objective: { kind: 'protect', ship: 'Vesalius' },
  },
  {
    id: 'SM3-07', title: 'Dunkerque', act: 'ACT III', where: 'Capella — 3rd Fleet HQ',
    brief: 'Third Fleet headquarters is evacuating under fire. Transports are '
      + 'launching in waves, the Messana is covering the corridor and a Shivan '
      + 'destroyer is working through them. Hold as long as there are people '
      + 'still in it.',
    enemy: [{ key: 'ravana', name: 'Nebiros' }, { key: 'sathanas', name: 'Eumenides' }],
    attach: [{ key: 'orion', name: 'Messana' }],
    civilians: {
      A: [{ key: 'arcadia', name: '3rd Fleet HQ' }, { key: 'hippocrates', name: 'Galen' },
        { key: 'argo', name: 'Lambda' }],
    },
    objective: { kind: 'survive', seconds: 200 },
  },
  {
    id: 'SM3-08', title: 'Their Finest Hour', act: 'ACT III', where: 'Capella — Gamma Draconis node',
    brief: 'A feint, to buy the evacuation hours. The Colossus stays behind to sell '
      + 'it, with the Stalwart and the Khepri alongside. Command has been honest '
      + 'with you about the odds, which should tell you what Command expects.',
    enemy: [{ key: 'sathanas', name: 'Apocalypse' }, { key: 'ravana', name: 'Beast' },
      { key: 'lilith', name: 'Hela' }, { key: 'rakshasa', name: 'Orcus' }],
    attach: [{ key: 'colossus', name: 'Colossus' }, { key: 'aeolus', name: 'Stalwart' },
      { key: 'sobek', name: 'Khepri' }],
    civilians: {
      B: [{ key: 'asmodeus', name: 'Asmodeus' }, { key: 'mephisto', name: 'Mephisto' }],
    },
    objective: { kind: 'survive', seconds: 220 },
  },
  {
    id: 'SM3-09', title: 'Clash of the Titans II', act: 'ACT III', where: 'Capella — Epsilon Pegasi node',
    brief: 'The Bastion is carrying meson bombs to the node and cannot be allowed to '
      + 'die before she gets there. The Malta and the Ertanax screen for her. '
      + 'Whatever is left of your task force after this goes straight into the '
      + 'last one.',
    enemy: [{ key: 'sathanas', name: 'Ashtaroth' }, { key: 'sathanas', name: 'Eumenides' }],
    attach: [{ key: 'orion', name: 'Bastion' }, { key: 'aeolus', name: 'Malta' },
      { key: 'aeolus', name: 'Ertanax' }],
    objective: { kind: 'protect', ship: 'Bastion' },
  },
  {
    id: 'SM3-10', title: 'Apocalypse', act: 'ACT III', where: 'Capella — Vega node',
    brief: 'Capella is going supernova. The node is open, the last convoy is running '
      + 'for it and the withdrawal has twelve minutes. Cover it. Then run — and be '
      + 'through the node when the star lets go, because nothing behind you is '
      + 'going to survive it.',
    enemy: [{ key: 'sathanas', name: 'Ashtaroth' }, { key: 'rakshasa', name: 'Thanatos' },
      { key: 'cain', name: 'Bane' }, { key: 'cain', name: 'Melchom' }],
    attach: [{ key: 'aeolus', name: 'Malta' }, { key: 'aeolus', name: 'Ertanax' },
      { key: 'mentu', name: 'Ptah-Nu' }],
    civilians: {
      A: [{ key: 'hippocrates', name: 'Sydenham' }, { key: 'triton', name: 'Io' },
        { key: 'argo', name: 'Notus' }],
    },
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

// Your first command: a light cruiser division. One Fenris is not a task
// force — retail's second operation puts an NTF corvette over the Deneb depot
// with no friendly capital in the system, and a lone 260-metre hull loses that
// fight every time. Three hulls fills the sortie limit from the start, so the
// campaign's growth is in what you command, not how much. The Aeolus is in
// there because two Fenris and a Leviathan is a coin flip against the Deimos,
// and operation two is too early for a coin flip.
export const STARTING_FLEET = [
  { key: 'fenris', name: 'Vigilant' },
  { key: 'leviathan', name: 'Hood' },
  { key: 'aeolus', name: 'Krios' },
];
