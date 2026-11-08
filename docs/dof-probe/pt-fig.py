#!/usr/bin/env python3
# Ảnh so sánh mờ theo độ sâu: hàng = trước / sau, cột = các góc (ảnh bật ống kính + bản đồ vòng nhoè thu nhỏ ở góc)
# Cách gọi: pt-fig.py <thư mục cũ> <thư mục mới> <ảnh ra> <tên:nhãn> [<tên:nhãn> …]
import sys
from PIL import Image, ImageDraw, ImageFont
o, n, dst = sys.argv[1:4]; V = [a.split(':', 1) for a in sys.argv[4:]]
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 22); f2 = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 16)
except Exception: F = f2 = ImageFont.load_default()
fw, fh, pad, top = 632, 400, 6, 34
rows = [(o, 'Trước (06/11 sáng)'), (n, 'Sau (06/11 trưa)')]
W = len(V) * (fw + pad) + pad; H = top + len(rows) * (fh + pad + 26) + pad
out = Image.new('RGB', (W, H), (250, 250, 247)); dr = ImageDraw.Draw(out)
for j, (nm, lab) in enumerate(V):
    x0 = pad + j * (fw + pad); dr.text((x0 + 4, 6), lab, fill=(30, 30, 30), font=F)
    for i, (d, rl) in enumerate(rows):
        y0 = top + i * (fh + pad + 26); dr.text((x0 + 4, y0 + 2), rl, fill=(30, 30, 30), font=f2)
        im = Image.open(f'{d}/{nm}_on.png').convert('RGB').resize((fw, fh), Image.LANCZOS); out.paste(im, (x0, y0 + 24))
        c = Image.open(f'{d}/{nm}_coc.png').convert('RGB').resize((fw // 4, fh // 4), Image.NEAREST)
        out.paste(c, (x0 + fw - fw // 4 - 4, y0 + 24 + 4)); dr.rectangle([x0 + fw - fw // 4 - 5, y0 + 27, x0 + fw - 4, y0 + 24 + 4 + fh // 4], outline=(255, 255, 255))
out.save(dst, quality=86); print(out.size)
