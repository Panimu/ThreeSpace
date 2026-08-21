# Sprite sheet index

Eight FS2-style sheets, user-provided (fan-made art in the FreeSpace 2 idiom,
uploaded 2026-08-19; the support and Vasudan plates re-issued 2026-08-21).
These are labeled reference plates, not packed atlases:
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

## vasudan-capitals.png (1024×1536, RGB — re-issued 2026-08-21)
Vasudan capital plate, orthographic top view, two bands each to its own scale.
- Destroyers (0–2.25 km): GVD Typhon 2,153 m · GVD Hatshepsut 2,126 m.
- Corvette and cruisers (0–650 m): GVCv Sobek 608 m · GVC Mentu 322 m ·
  GVC Aten 230 m.
Replaces the earlier plate, which had lower-detail hulls and a magnified
Mentu/Aten strip. Ship labels sit in a left-hand column (x < 262) and each
band carries a scale bar; both are erased before keying.

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

## support-and-installations.png (1536×1024, RGB — re-issued 2026-08-21)
Support craft, logistics and installations in three bands, each to its own
scale, with lengths printed under every hull.
- Band 1 — large installations and unique craft: GTI Arcadia 3,792 m ·
  GTI Ganymede 1,348 m · NTF Iceni 998 m · NTF Boadicea 982 m ·
  Shivan Comm Node 748 m · Ancient Knossos 659 m.
- Band 2 — logistics, science, mining and AWACS:
  - Terran: GTM Hippocrates 546 · GTFr Triton 313 · GTG Zephyrus 250 ·
    GTA Charybdis 181 · GTT Argo 171 · GTSC Faustus 162 · GTFr Poseidon 67 ·
    GTT Elysium 32.
  - Vasudan: GVG Anuket 347 · GVA Setekh 190 · GVFr Satis 107 · GVFr Bes 56 ·
    PVFr Ma'at 56 · GVT Isis 27.
  - Shivan: SFr Dis 317 · SSG Rahu 211 · SFr Asmodeus 123 · SFr Mephisto 54 ·
    ST Azrael 46.
- Band 3 — small support and emplacements: GTSG Mjolnir 108 ·
  GVS Nephthys 34 · GTS Hygeia 32.
This plate is the length authority for every non-combatant. Note the NTF
Iceni is drawn **nose-up** and has to be rotated 90° so its length runs along
the sprite's width, and the Boadicea is an asteroid installation rather than
the Deimos-class corvette it was previously taken for.
Superseded hulls kept from the earlier 864×1821 plate, which is no longer in
the repository: GTFr Chronos, GVSG Ankh, SSG Belial, SSG Trident, SAC 3, and
the red-trim NTF variants Belisarius/Repulse/Carthage/Glorious/Impervious.

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
range/type table. Bolt cores and the flak burst are sliced and loaded at
runtime. The beam samples are palette/shape reference only, not loaded:
each is a short (150-330 px) hand-shaded render, and stretching one 5-15x
to a beam's actual 950-2200 range smears its shading into visible seams —
in-game beams are procedural gradient strips instead, tinted per faction
and sized off each weapon's `beamWidth`.

## Extraction notes (next step)
- Chart-background sheets: background is near-uniform dark navy with faint
  grid. Key against a whole-sheet median (the border is title/footer text, not
  background), then drop speckle by connected-component size and erase the
  chart's thin measurement rules as near-full-width lone rows.
- Caption text, band titles and faction labels must be blanked to background
  by explicit rects before keying — a bounding box alone cannot separate a
  caption from the hull sitting a few pixels above it.
- hardware-terran-vasudan.png needs checkerboard-pattern removal (regular
  8-ish px grey/white grid) — scriptable.
- Slice output goes to `assets/ships/<faction>/<name>.png` (upright, alpha,
  tight-cropped) and `assets/hardware/<faction>/<part>.png`; the printed
  lengths feed `ships.js` scale so relative ship sizes become canon-accurate.
