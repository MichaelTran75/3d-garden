#!/usr/bin/env python3
# tóm tắt kết quả kiểm tra hành vi kỹ sư: python3 summary.py <thư mục aud> [tên đoạn ...] [--tr] [--info]
import json, sys, pathlib, collections
d = pathlib.Path(sys.argv[1]); names = [a for a in sys.argv[2:] if not a.startswith('--')]; flags = {a for a in sys.argv[2:] if a.startswith('--')}
hm = lambda h: '%d:%02d:%02d' % (int(h), int(h * 60) % 60, int(h * 3600) % 60)
for f in sorted(d.glob('*.json')):
    if names and f.stem not in names: continue
    A = json.load(open(f)); S = A['seg']
    print('=' * 100); print(f"{f.stem}: {S['h0']} → {S['h1']}  khung {A['frames']}  {A['wallSec']} s  wx {S.get('wx')}  at {[a[0] for a in S.get('at', [])]}")
    c = collections.Counter(a['type'] for a in A['an']); print('  lỗi theo loại:', dict(c))
    for a in A['an']:
        extra = {k: v for k, v in a.items() if k not in ('t', 'h', 'type', 'key')}
        print(f"  {a['t']:>9} {a['type']:<15} {a.get('key', '')[:70]:<70} {json.dumps(extra, ensure_ascii=False)[:150]}")
    cons = [c for c in A['console'] if c[1] != 'warning' or 'GL Driver' not in c[2] and 'KHR_parallel' not in c[2]]
    if cons: print('  console:'); [print('   ', c) for c in cons[:15]]
    if '--info' in flags:
        print('  info:'); [print('   ', i) for i in A['info']]
    if '--tr' in flags:
        print('  chuyển:'); [print('   ', hm(t[0]), t[1], t[2:]) for t in A['tr']]
