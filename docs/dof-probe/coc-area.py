#!/usr/bin/env python3
# Diện tích mờ theo từng điểm ảnh, đọc bản đồ vòng nhoè của pt2.js (thang 16 px nửa độ phân giải; kênh G = 255·(1 − |CoC|/16))
# Ra: % điểm ảnh có |CoC| ≥ 0,3 / 1 / 3 px nửa phân giải (0,3 ≈ σ 0,3 px ảnh đủ), tách nửa trên / nửa dưới + phía sau (đỏ) / phía trước (xanh)
# Cách gọi: coc-area.py <thư mục cũ> <thư mục mới> <tên> [<tên> …]
import sys, numpy as np
from PIL import Image
def area(d, nm):
    a = np.asarray(Image.open(f'{d}/{nm}_coc.png').convert('RGB'), dtype=np.float32)
    c = 16 * (1 - a[..., 1] / 255); far = a[..., 0] > a[..., 2]
    h = c.shape[0]; r = {}
    for th in (0.3, 1, 3): r[th] = (100 * (c >= th).mean(), 100 * (c[:h // 2] >= th).mean(), 100 * (c[h // 2:] >= th).mean())
    return r, 100 * ((c >= 0.3) & far).mean(), 100 * ((c >= 0.3) & ~far).mean()
o, n = sys.argv[1], sys.argv[2]
for nm in sys.argv[3:]:
    for lab, d in (('cũ', o), ('mới', n)):
        r, f, b = area(d, nm)
        print(f"{nm:4s} {lab:3s} " + ' · '.join(f"≥{th}: {t:4.0f}% (trên {u:3.0f} dưới {l:3.0f})" for th, (t, u, l) in r.items()) + f" · sau {f:3.0f}% trước {b:3.0f}%")
