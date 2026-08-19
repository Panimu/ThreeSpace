# Sprite sheet index

Eight FS2-style sheets, user-provided (fan-made art in the FreeSpace 2 idiom,
uploaded 2026-08-19). These are labeled reference plates, not packed atlases:
each sprite sits on a chart background with caption text, so individual ships
must be **sliced out** before game use (see Extraction notes at the bottom).

## terran-capitals.png (1552×1013, RGB)
Top-down Terran capital scale plate, 1 km grid, lengths printed per ship.
Contents (as labeled): GTVA Colossus 6,000 m · GTO Hades 3,404 m ·
GTO Hecate 2,174 m · GTO Orion 2,100 m · GTOV Deimos 717 m ·
GTO Aeolus 272 m · GTO Fenris 260 m · GTO Leviathan 253 m.
Label quirks: prefixes are "GTO" (canon uses GTD/GTC/GTCv) and some class
captions are scrambled (Hecate marked "corvette", Orion "gunship",
Leviathan "courier"). Trust the ship names + lengths, not the class captions.
Bonus: includes the GTD Hades, which our catalog doesn't have yet.

## vasudan-capitals.png (1024×1536, RGB)
Vasudan capital scale plate with metre/km ruler.
GVD Hatshepsut 2,126 m · GVD Typhon 2,153 m · GVCv Sobek 608 m ·
GVC Mentu 322 m · GVC Aten 230 m, plus a magnified strip re-rendering
Mentu and Aten at higher detail (prefer the magnified versions when slicing).

## shivan-capitals.png (1024×1536, RGB)
Shivan capital scale plate.
SJ Sathanas 5,978 m · SD Lucifer 2,777 m · SD Ravana 2,346 m ·
SD Demon 2,139 m · SCv Moloch 724 m · SC Rakshasa ~349 m ·
SC Lilith 190 m · SC Cain 190 m · Shivan Comm Node 748 m, plus a magnified
strip with ST Azrael 46 m and SSG Trident 11 m.

## fighters-bombers.png (1024×1536, RGB)
Full strike-craft roster, three columns, 0–150 m scale ruler.
- Terran fighters: Apollo, Angel, Valkyrie, Hercules, Hercules Mk II, Ulysses,
  Loki, Myrmidon, Perseus, Pegasus, Ares, Erinyes.
  Terran bombers: Athena, Medusa, Ursa, Zeus, Boanerges, Artemis, Artemis D.H.
- Vasudan fighters: Anubis, Seth, Horus, Thoth, Serapis, Tauret, Ptah.
  Vasudan bombers: Amun, Osiris, Bakha, Sekhmet.
- Shivan fighters: Scorpion, Basilisk, Manticore, Dragon, Mara, Astaroth, Aeshma.
  Shivan bombers: Shaitan, Nephilim, Seraphim, Nahema, Taurvi.

## support-and-installations.png (864×1821, RGB)
Support craft, logistics, NTF variants, and installations, with lengths.
- GTVA: Charybdis (AWACS), Faustus, Chronos, Poseidon, Triton, Argo, Elysium,
  Zephyrus, Hippocrates, Hygeia, Ganymede (drydock ring 1,348 m),
  Arcadia (3,792 m), Mjolnir sentry.
- Vasudan: Setekh, Anuket, Bes, Nephthys, Ankh sentry.
- NTF named variants: Iceni, Belisarius (Deimos-class), Repulse and
  Carthage (Orion-class), Glorious, Impervious (cruisers) — red-trim hulls.
- Shivan: Azrael, Dis, Mephisto, Asmodeus, Rahu, Trident, Belial, Comm Node,
  SAC 3 cargo.
- Other: Knossos portal. Small-hardware strip (10× magnified): Hermes escape
  pod, Pharos buoy, TC 2 cargo.

## hardware-terran-vasudan.png (1536×1024, RGB — checkerboard baked, NO alpha)
Hardpoint/refit component art, labeled, two halves:
- Terran/GTVA: PD/twin/triple/low-profile/medium-heavy/huge laser turrets;
  AAAf, AAAh/ULTRA, small green, BGreen beam emitters; standard/heavy/
  long-range flak; missile launcher/pods/racks/torpedo launcher; bomb-bay,
  sockets, turret rings; blank hardpoint, sensor dish, antenna mast, radiator,
  vent cluster, damaged-variant base.
- Vasudan: the same taxonomy in Vasudan style (faceted PD, curved energy
  turrets, beam emitters, flak pod/drum, missile hardware, collars, sockets,
  sensor eye, capital weapon collar, damaged base).
Caution: the checkerboard "transparency" is baked into the pixels — slicing
requires checkerboard removal, not just cropping.

## hardware-shivan.png (1536×1024, **RGBA — real transparency**)
Shivan hardpoint components on true alpha: turret lasers, Megafunk turret,
Super Laser emitter, SAAA/S-AAA-Weak, SRed/LRed/BFRed beam emitters, flak
emitters, swarmer/FighterKiller/cluster/torpedo launchers, PD sockets,
spine/ribbed/claw turrets, weapon sockets, beam collars, sensor node/spine,
reactor vent, damaged base. Only caption text needs cropping away.

## ordnance-weapons-beams.png (1536×1024, RGB)
Effects reference: missiles/bombs at model scale (Rockeye→Helios→Shivan
cluster etc.), primary shot cores (Subach, Prometheus, Maxim, Kayser, faction
lasers…), turret projectiles, flak bursts, and ~20 beam samples at a 100 m
pulse reference — SRed/LRed/BFRed, SGreen/BGreen/BFGreen/LRBGreen, slash
beams, AAA beams, Mjolnir beams, Vasudan beams, Shivan Super Laser — with
range/type table. Use as the palette/shape reference for in-game projectile
and beam rendering (our beams are procedural; match them to these samples).

## Extraction notes (next step)
- Chart-background sheets: background is near-uniform dark navy with faint
  grid — flood-fill/chroma keying from the edges should lift sprites cleanly;
  caption text must be excluded by bounding-box, not color.
- hardware-terran-vasudan.png needs checkerboard-pattern removal (regular
  8-ish px grey/white grid) — scriptable.
- Slice output goes to `assets/ships/<faction>/<name>.png` (upright, alpha,
  tight-cropped) and `assets/hardware/<faction>/<part>.png`; the printed
  lengths feed `ships.js` scale so relative ship sizes become canon-accurate.
