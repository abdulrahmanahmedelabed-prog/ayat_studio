#!/usr/bin/env python3
"""بديل بسيط لـ zipalign: يعيد كتابة الأرشيف بحيث تبدأ بيانات الملفات غير المضغوطة عند مضاعفات 4 بايت."""
import struct, sys, zipfile
src, dst = sys.argv[1:3]
STORE = ('.arsc', '.png', '.woff', '.woff2')
with zipfile.ZipFile(src) as zi, zipfile.ZipFile(dst, 'w') as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        ni = zipfile.ZipInfo(it.filename, date_time=(2026, 1, 1, 0, 0, 0))
        ni.external_attr = it.external_attr
        ni.compress_type = zipfile.ZIP_STORED if it.filename.endswith(STORE) else zipfile.ZIP_DEFLATED
        if ni.compress_type == zipfile.ZIP_STORED:
            off = zo.fp.tell() + 30 + len(ni.filename.encode())
            pad = (4 - (off + 4) % 4) % 4
            ni.extra = struct.pack('<HH', 0xD935, pad) + b'\0' * pad
        zo.writestr(ni, data, compresslevel=9)
