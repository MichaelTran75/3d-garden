#!/usr/bin/env python3
# Từ prof.json (lb-prof.py): vùng thấy mờ (σ ≥ 0,3 px, liền từ mép trên / dưới vào) + bề rộng dải chuyển (σ 0,15 → 0,6) ở mỗi mép, theo % chiều cao
import sys, json
for d in sys.argv[1:]:
    P = json.load(open(f'{d}/prof.json'))
    for nm, p in P.items():
        rows = [(y, s) for y, s, r in p['rows'] if s is not None]; n = len(rows); bh = 100 / n
        def side(seq):   # seq: từ mép vào giữa
            k = 0
            while k < len(seq) and seq[k][1] >= 0.3: k += 1
            # dải chuyển: từ giữa ra mép, hàng đầu σ ≥ 0,15 tới hàng đầu σ ≥ 0,6
            inv = seq[::-1]; a = next((i for i, (y, s) in enumerate(inv) if s >= 0.15), None); b = next((i for i, (y, s) in enumerate(inv) if s >= 0.6), None)
            return k * bh, (None if a is None or b is None else (b - a + 1) * bh)
        h2 = n // 2; top, bot = side(rows[:h2]), side(rows[h2:][::-1])
        print(f"{d.rstrip('/').split('/')[-1]:5s} {nm:4s}: thấy mờ trên {top[0]:4.0f}% dưới {bot[0]:4.0f}% tổng {top[0]+bot[0]:4.0f}% · dải chuyển σ 0,15→0,6: trên {top[1] or 0:.0f}% dưới {bot[1] or 0:.0f}%")
