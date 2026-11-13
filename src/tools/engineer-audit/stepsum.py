#!/usr/bin/env python3
"""TÓM TẮT ĐẦU DÒ BƯỚC ĐI (stepprobe.js): python3 stepsum.py <out>/step [<out khác>/step]
 1 thư mục: tổng theo con vật, cụm lấn vật (vật × trạng thái × phần thân), sự kiện xuyên / nhảy vị trí.
 2 thư mục: thêm bảng so trước / sau. So bằng số ĐIỂM LƯỚI lọt trong vật (thân / chân / tay / đồ cầm / đuôi) — không phụ thuộc cách lấy
 mẫu dấu chân; cột fp (dấu chân) đo bằng chính hàm của app nên đổi nghĩa khi app đổi cách lấy mẫu.
 Tiếp xúc có chủ ý (ngồi ghế, chó nhảy lên đống củi) tách riêng: không tính là lỗi."""
import json, os, re, sys

PARTS = ['body', 'leg', 'arm', 'item', 'tail']
MEANT = re.compile(r'\[ngồi\]|\[nhảy\]|ghế:(turn|back|sit|seated|rise|stood)|^perch')   # trạng thái chạm vật có chủ ý


def load(d):
    S = []
    for f in sorted(os.listdir(d)):
        if f.endswith('.json'):
            R = json.load(open(os.path.join(d, f), encoding='utf-8'))
            if 'actors' in R: S.append((f[:-5], R))
    return S


def total(S, name):
    T = dict(out=0, mov=0, sm=0, ghostEv=0, ghostFr=0, stuckFr=0, jumps=0, fp15=0, fp40=0)
    W = {p: 0 for p in PARTS}; M = {p: 0 for p in PARTS}; smW = smM = 0
    for _, R in S:
        A = R['actors'].get(name)
        if not A: continue
        for k in ('out', 'mov', 'ghostEv', 'ghostFr', 'stuckFr', 'jumps', 'fp15', 'fp40'): T[k] += A['tot'].get(k, 0)
        for b in A['by']:
            meant = bool(MEANT.search(b['st']))
            if meant: smM += b['sm']
            else: smW += b['sm']
            for p in PARTS: (M if meant else W)[p] += b.get(p, 0)
    T.update(walk=W, meant=M, smWalk=smW, smMeant=smM)
    return T


def clusters(S, name):
    C = {}
    for seg, R in S:
        A = R['actors'].get(name)
        if not A: continue
        for c in A['runs']:
            if c['k'] in ('fp', 'pair'): continue
            obj = (c.get('obj') or ['?'])[0].split(' › ')[0] if c.get('obj') else '?'
            st = re.sub(r' ghế:\w+', '', c['st0'])
            k = (bool(MEANT.search(c['st0'])), obj, st, c['k'])
            e = C.setdefault(k, dict(n=0, dur=0, mx=0, gh=0, ex=None))
            e['n'] += 1; e['dur'] += c.get('dur', 0); e['gh'] += 1 if c.get('gh') else 0
            if c['mx'] >= e['mx']: e['mx'] = c['mx']; e['ex'] = f"{seg} {c['t']} ({c['atMax'][0]:.1f}, {c['atMax'][1]:.1f})" + (f" ảnh {seg}-{c['shot']}" if c.get('shot') else '')
    return C


def pct(a, b): return f"{100 * a / b:5.2f}%" if b else '   – '


def show(d):
    S = load(d); print(f"== {d}: {len(S)} đoạn ({', '.join(s for s, _ in S)})")
    out = {}
    for name in ('eng', 'dog'):
        T = out[name] = total(S, name); W, M = T['walk'], T['meant']
        print(f"\n-- {name}: khung ngoài trời {T['out']} · đang đi {T['mov']} · lần xuyên (ghost) {T['ghostEv']} ({T['ghostFr']} khung) · khung kẹt {T['stuckFr']} · nhảy vị trí {T['jumps']}")
        print(f"   lượt đo lưới: đi / đứng {T['smWalk']} · chạm có chủ ý {T['smMeant']}   (fp>15% {T['fp15']} · fp>40% {T['fp40']} khung đang đi — đo bằng hàm của app)")
        print('   lượt có ≥ 2 điểm lưới trong vật:  ' + ' · '.join(f"{p} {W[p]} ({pct(W[p], T['smWalk']).strip()})" for p in PARTS if W[p] or p in ('body', 'leg')))
        if any(M.values()): print('   (chạm có chủ ý: ' + ' · '.join(f"{p} {M[p]}" for p in PARTS if M[p]) + ')')
        C = clusters(S, name)
        rows = sorted(((k, e) for k, e in C.items() if not k[0]), key=lambda r: -r[1]['dur'])
        print(f"   cụm lấn khi đi / đứng: {len(rows)} (vật · trạng thái · phần thân → số lần, tổng giây, nhiều điểm nhất, ví dụ)")
        for k, e in rows[:40]: print(f"     {k[1][:34]:34} {k[2][:34]:34} {k[3]:5} ×{e['n']:<3} {e['dur']:6.1f} s  max {e['mx']:<4}{' xuyên' if e['gh'] else ''}  {e['ex']}")
        if len(rows) > 40: print(f"     … còn {len(rows) - 40} cụm")
        ev = [(seg, v) for seg, R in S for v in (R['actors'].get(name) or {}).get('ev', [])]
        if ev:
            print(f"   sự kiện: {len(ev)}")
            for seg, v in ev[:30]: print(f"     {seg} {v['t']} {v['k']:6} {v['st'][:40]:40} tại ({v['at'][0]:.1f}, {v['at'][1]:.1f}) {('· ' + v['obj'][0].split(' › ')[0]) if v.get('obj') else ''}")
    return out


def main():
    dirs = [a for a in sys.argv[1:] if os.path.isdir(a)]
    if not dirs: print(__doc__); return 1
    R = [show(d) for d in dirs]
    if len(R) == 2:
        print('\n== SO TRƯỚC → SAU (lượt có ≥ 2 điểm lưới trong vật khi đi / đứng, % số lượt đo)')
        for name in ('eng', 'dog'):
            a, b = R[0][name], R[1][name]
            print(f"-- {name}: lượt đo {a['smWalk']} → {b['smWalk']} · xuyên {a['ghostEv']} → {b['ghostEv']} · khung kẹt {a['stuckFr']} → {b['stuckFr']} · nhảy {a['jumps']} → {b['jumps']}")
            for p in PARTS:
                if a['walk'][p] or b['walk'][p]: print(f"     {p:5} {a['walk'][p]:6} ({pct(a['walk'][p], a['smWalk']).strip()}) → {b['walk'][p]:6} ({pct(b['walk'][p], b['smWalk']).strip()})")
    return 0


if __name__ == '__main__':
    sys.exit(main())
