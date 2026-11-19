#!/usr/bin/env python3
"""Builds public/data/*.json from the Tanzil Uthmani text and Tafsir al-Muyassar.
usage: build-data.py <tanzil_dir> <muyassar_dir> <out_dir>"""
import json, sys, os, re
tz, muy, out = sys.argv[1:4]
uth = json.load(open(f'{tz}/uthmani.json'))
cln = json.load(open(f'{tz}/simple-clean.json'))
chs = json.load(open(f'{tz}/chapters.json'))['chapters']
def verses(d, s):
    v = d[str(s)]
    if isinstance(v, dict): v = v.get('verses', v)
    if isinstance(v, dict): v = [v[str(i)] for i in range(1, len(v) + 1)]
    return [x['text'] if isinstance(x, dict) else x for x in v]
Q, C, T = [], [], []
total = 0
for ch in chs:
    s = ch['id']
    u, c = verses(uth, s), verses(cln, s)
    assert len(u) == len(c) == ch['total_verses'], s
    m = json.load(open(f'{muy}/{s}.json'))
    m = {e['ayah']: e['text'] for e in m}
    t = []
    for a in range(1, len(u) + 1):
        x = m.get(a, '')
        if '[التفسير]' in x: x = x.split('[التفسير]', 1)[1]
        t.append(re.sub(r'\s*\n\s*', ' ', x).strip())
    Q.append(u); C.append(c); T.append(t); total += len(u)
assert total == 6236, total
os.makedirs(out, exist_ok=True)
dump = lambda n, o: json.dump(o, open(f'{out}/{n}', 'w'), ensure_ascii=False, separators=(',', ':'))
dump('quran.json', Q); dump('clean.json', C); dump('tafsir.json', T)
dump('chapters.json', [{'id': c['id'], 'name': c['name'], 'type': c['type'], 'n': c['total_verses']} for c in chs])
print('ok', total, 'ayat; missing tafsir:', sum(1 for s in T for x in s if not x))
