#!/usr/bin/env python3
# Độ mờ hiệu dụng theo hàng: với mỗi dải 16 hàng (biến môi trường BAND=8 ⇒ 8 hàng), tìm σ Gauss sao cho năng lượng cạnh của ảnh TẮT làm mờ σ bằng năng lượng cạnh của ảnh BẬT
# (chuẩn hoá độ sáng trung bình từng dải trước). Ra: bảng y% · σ · tỉ lệ năng lượng; số liệu "diện tích mờ" + dốc lớn nhất của σ(y).
# Cách gọi: lb-prof.py <thư mục ảnh> <tên> [<tên> …]   (đọc <tên>_on.png / <tên>_off.png)
import os, sys, json, numpy as np
from PIL import Image, ImageFilter

SIG = [0, 0.35, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20]
BAND = int(os.environ.get("BAND", 16))

def lum(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32) / 255.0
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]

def ge(L):   # năng lượng cạnh từng điểm (h-1, w-1)
    gx = np.diff(L, axis=1)[:-1, :]; gy = np.diff(L, axis=0)[:, :-1]
    return gx * gx + gy * gy

def prof(d, nm):
    on, off = Image.open(f'{d}/{nm}_on.png'), Image.open(f'{d}/{nm}_off.png')
    Lon, Loff = lum(on), lum(off)
    Eon = ge(Lon)
    Es = [ge(Loff if s == 0 else lum(off.filter(ImageFilter.GaussianBlur(s)))) for s in SIG]
    h = Eon.shape[0]; rows = []
    for y0 in range(0, h - BAND + 1, BAND):
        sl = slice(y0, y0 + BAND)
        k = Loff[sl].mean() / max(1e-6, Lon[sl].mean())
        e = Eon[sl].mean() * k * k; es = [E[sl].mean() for E in Es]
        if es[0] < 1e-7: rows.append((y0 + BAND / 2, None, None)); continue
        r = e / es[0]
        if e >= es[0]: sg = 0.0
        elif e <= es[-1]: sg = SIG[-1]
        else:
            i = next(i for i in range(1, len(SIG)) if es[i] <= e)
            a, b = np.log(es[i - 1]), np.log(es[i]); t = (np.log(e) - a) / (b - a) if b != a else 0
            sg = SIG[i - 1] + t * (SIG[i] - SIG[i - 1])
        rows.append((y0 + BAND / 2, sg, r))
    H = Lon.shape[0]
    ys = [y / H for y, s, r in rows if s is not None]; ss = [s for y, s, r in rows if s is not None]
    smax = max(ss) if ss else 0
    fr = lambda th: sum(1 for s in ss if s >= th) / max(1, len(ss))
    slope = max((abs(ss[i + 1] - ss[i]) / ((ys[i + 1] - ys[i]) * 100) for i in range(len(ss) - 1)), default=0)   # σ đổi / 1 % chiều cao
    return {'rows': [(round(y / H * 100, 1), None if s is None else round(s, 2), None if r is None else round(r, 3)) for y, s, r in rows],
            'smax': round(smax, 2), 'area_s1': round(fr(1.0), 3), 'area_half': round(fr(smax / 2), 3) if smax else 0, 'slope_max': round(slope, 3)}

if __name__ == '__main__':
    d = sys.argv[1]; res = {nm: prof(d, nm) for nm in sys.argv[2:]}
    json.dump(res, open(f'{d}/prof.json', 'w'), default=float)
    for nm, p in res.items():
        print(f"{nm}: σmax {p['smax']} · diện tích σ≥1 px {p['area_s1']*100:.0f}% · σ≥½max {p['area_half']*100:.0f}% · dốc σ lớn nhất {p['slope_max']} px / 1% cao")
        print('   ' + ' '.join(f"{y:.0f}:{'-' if s is None else s}" for y, s, r in p['rows']))
