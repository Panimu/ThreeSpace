#!/usr/bin/env python3
"""Distil the campaign reconstruction into the roster ThreeSpace models.

Reads docs/fs2-campaign-reconstruction.md and writes fs2-campaign-source.json:
per mission, which capital ships and non-combatants were present, their canon
names, their IFF, and the goal list. That file is what scripts/check-campaign.mjs
audits src/campaign.js against.

Ship classes with no ThreeSpace hull (cargo containers, escape pods, nav buoys,
training drones) are dropped. Training missions are dropped too — they have no
capital fight. Run after editing either the reconstruction or the class maps:

    python3 scripts/build-campaign-source.py
    node scripts/check-campaign.mjs --verbose
"""
import json, re, os
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
F = os.path.join(HERE, '..', 'docs', 'fs2-campaign-reconstruction.md')
OUT = os.path.join(HERE, 'fs2-campaign-source.json')

# Capital hulls we model, keyed by the reconstruction's class strings.
CAPS = {
 'GTC Fenris':'fenris','GTC Leviathan':'leviathan','GTC Aeolus':'aeolus','GTCv Deimos':'deimos',
 'GTD Orion':'orion','GTD Orion#2 (Bastion)':'orion','GTD Hecate':'hecate','GTVA Colossus':'colossus',
 'GVC Aten':'aten','GVC Mentu':'mentu','GVCv Sobek':'sobek','GVD Typhon':'typhon','GVD Hatshepsut':'hatshepsut',
 'SC Cain':'cain','SC Lilith':'lilith','SC Rakshasa':'rakshasa','SCv Moloch':'moloch',
 'SD Demon':'demon','SD Ravana':'ravana','SJ Sathanas':'sathanas','SJD Sathanas':'sathanas',
 'NTF Iceni':'iceni',
}

# Non-combatants. A few classes share a hull where the plates do not draw them
# separately; the support plate is the length and identity authority.
CIV = {
 'GTA Charybdis':'charybdis','GTVA Charybdis':'charybdis','GTSC Faustus':'faustus',
 'GTFr Chronos':'chronos','GTFr Poseidon':'poseidon','GTFR Poseidon':'poseidon',
 'GTFr Triton':'triton','GTFR Triton':'triton','GTT Argo':'argo','GTT Elysium':'elysium',
 'GTG Zephyrus':'zephyrus','GTM Hippocrates':'hippocrates','GTS Hygeia':'hygeia',
 'GTI Ganymede':'ganymede','GTI Arcadia':'arcadia',
 'GTSG Mjolnir':'mjolnir','GTSG Alastor':'mjolnir',
 'GVA Setekh':'setekh','GVG Anuket':'anuket','GVFr Bes':'bes','GVFr Satis':'satis',
 "PVFR Ma'at":'maat','GVT Isis':'isis','GVS Nephthys':'nephthys','GVSG Ankh':'ankh',
 'ST Azrael':'azraeltr','SFr Dis':'dis','SFr Mephisto':'mephisto','SFr Asmodeus':'asmodeus',
 'SSG Rahu':'rahu','SSG Belial':'belial','SSG Trident':'trident',
 'SAC 3':'sac3','SAC 2':'sac3','SC 5':'sac3','VAC 4':'sac3',
 'Shivan Comm Node':'commnode','Knossos':'knossos','NTF Boadicea':'boadicea',
}

text = open(F).read()


# Split into mission chapters: "## 04. Surrender, Belisarius! (`SM1-01.fs2`)"
chapters = re.split(r'\n## (\d+)\. (.+?) \(`(.+?)`\)\n', text)
missions = []
for i in range(1, len(chapters), 4):
    num, title, fname, body = chapters[i], chapters[i+1], chapters[i+2], chapters[i+3]
    m = re.search(r'\*\*(.+?) · (.+?) · (.+?)\*\*', body)
    act, route, location = (m.group(1), m.group(2), m.group(3)) if m else ('?', '?', '?')
    # Summary paragraph after the act line
    summ = ''
    if m:
        after = body[m.end():].strip()
        summ = after.split('\n\n')[0].strip()
    # Ship/object manifest rows
    sec = re.search(r'### Ship and object manifest\n(.*?)\n### ', body, re.S)
    objects = []
    if sec:
        for line in sec.group(1).split('\n'):
            if not line.startswith('| ') or line.startswith('| ---') or line.startswith('| Object'):
                continue
            cols = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cols) < 6: continue
            objects.append({'name': cols[0], 'cls': cols[1], 'origin': cols[2],
                            'role': cols[3], 'iff': cols[4], 'dyn': cols[5]})
    # Goals
    gsec = re.search(r'### Mission goals\n(.*?)\n### ', body, re.S)
    goals = []
    if gsec:
        for line in gsec.group(1).split('\n'):
            if not line.startswith('| ') or line.startswith('| ---') or line.startswith('| ID'):
                continue
            cols = [c.strip() for c in line.strip().strip('|').split('|')]
            if len(cols) < 4: continue
            goals.append({'type': cols[1], 'name': cols[2]})
    missions.append({'num': int(num), 'title': title, 'file': fname, 'act': act,
                     'route': route, 'location': location, 'summary': summ,
                     'objects': objects, 'goals': goals})

out = []
for m in missions:
    if m['act'] == 'Training':
        continue                      # simulator missions have no capital fight
    buckets = {'caps': {'friendly': [], 'hostile': [], 'neutral': []},
               'civ':  {'friendly': [], 'hostile': [], 'neutral': []}}
    for o in m['objects']:
        cls = o['cls']
        kind, key = ('caps', CAPS[cls]) if cls in CAPS else (('civ', CIV[cls]) if cls in CIV else (None, None))
        if not key:
            continue
        iff = o['iff'] if o['iff'] in ('Friendly', 'Hostile', 'Neutral') else 'Neutral'
        # One entry per hull. Numbered ships ("SJD Sathanas 3", "Iota 1") keep
        # their group name but stay separate entries, because six juggernauts
        # are six juggernauts — collapsing them once cost this file its counts.
        buckets[kind][iff.lower()].append({'key': key, 'name': re.sub(r'\s+\d+$', '', o['name'].strip())})
    out.append(OrderedDict([
        ('file', m['file']), ('num', m['num']), ('title', m['title']),
        ('act', m['act']), ('route', m['route']), ('where', m['location']),
        ('caps', buckets['caps']), ('civ', buckets['civ']),
        ('goals', [{'type': g['type'], 'name': g['name']} for g in m['goals']]),
    ]))

doc = OrderedDict([
    ('note',
     'Canonical force composition for the FreeSpace 2 single-player campaign, '
     'distilled to the hulls ThreeSpace models. Generated by '
     'scripts/build-campaign-source.py from docs/fs2-campaign-reconstruction.md: '
     'per mission it records which capital ships and non-combatants were '
     'present, their canon names, their IFF, and the mission goal list. '
     'src/campaign.js is audited against this file by '
     'scripts/check-campaign.mjs — edit the reconstruction or the class maps in '
     'the generator, not this file, or the campaign drifts off the record. '
     'Briefing prose is ours and lives in src/campaign.js.'),
    ('missions', out),
])
json.dump(doc, open(OUT, 'w'), indent=1)
print(f'{len(out)} missions -> {OUT} ({os.path.getsize(OUT)} bytes)')
