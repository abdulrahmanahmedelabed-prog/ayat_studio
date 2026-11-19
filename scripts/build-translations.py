#!/usr/bin/env python3
"""يبني public/data/tr/<code>.json من ترجمات QuranEnc (عبر risan/quran-json) دون أي تعديل على النص.
usage: build-translations.py <quranenc_dir> <out_dir>"""
import json, os, sys
src, out = sys.argv[1:3]
LANGS = {'en': 'english_saheeh', 'fr': 'french_montada', 'id': 'indonesian_affairs', 'tr': 'turkish_rwwad', 'ur': 'urdu_junagarhi'}
os.makedirs(out, exist_ok=True)
for code, name in LANGS.items():
    d = json.load(open(f'{src}/{name}.json'))
    surahs = []
    for s in range(1, 115):
        vs = sorted(d[str(s)], key=lambda v: v['verse'])
        surahs.append([[v['text'], v['footnotes']] if v.get('footnotes') else [v['text']] for v in vs])
    assert sum(len(x) for x in surahs) == 6236, code
    json.dump(surahs, open(f'{out}/{code}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(code, name, os.path.getsize(f'{out}/{code}.json') // 1024, 'KB')
