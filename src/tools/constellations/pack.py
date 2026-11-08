# Đóng gói nét nối 88 chòm sao (d3-celestial, BSD-3-Clause) → app/core/constellation-lines.js
#  python3 -I pack.py <constellations.lines.json> <constellations.json> <app/core/star-catalog.js> <app/core/constellation-lines.js>
#  · mỗi đỉnh nét nối khớp sao gần nhất trong STAR_BSC5 (≤ 0,15°) ⇒ lấy đúng toạ độ đã lượng tử của sao đó (nét chạm đúng tâm chấm sao trên trang) + cấp sao (khe hở quanh sao);
#    không khớp (sao mờ hơn 5,5 ngoài danh mục) ⇒ giữ toạ độ của d3-celestial, cấp 6
#  · nhị phân: mỗi chòm 1 byte số đường gấp khúc; mỗi đường 1 byte số đỉnh rồi từng đỉnh 4 byte (little-endian): xích kinh 14 bit (360°/16384) · xích vĩ 13 bit
#    (180°/8191, từ −90°) · cấp sao 4 bit (0,5 từ −1,5)
#  · tên: Hán Việt theo bảng "Danh sách chòm sao" của Wikipedia tiếng Việt (cột Tên Hán Việt), trừ Thiên Bình (bảng ghi Thiên Xứng, liên kết tới bài Thiên Bình) và
#    Nhân Mã (bảng ghi Cung Thủ; bài về chòm Sagittarius lấy tên Nhân Mã) · tên La-tinh + điểm đặt nhãn + hạng (1 sáng / dễ thấy … 3) theo constellations.json
import base64, json, math, re, sys
lines_p, info_p, cat_p, out_p = sys.argv[1:5]
VI = {'And': 'Tiên Nữ', 'Ant': 'Tức Đồng', 'Aps': 'Thiên Yến', 'Aqr': 'Bảo Bình', 'Aql': 'Thiên Ưng', 'Ara': 'Thiên Đàn', 'Ari': 'Bạch Dương', 'Aur': 'Ngự Phu',
      'Boo': 'Mục Phu', 'Cae': 'Điêu Cụ', 'Cam': 'Lộc Báo', 'Cnc': 'Cự Giải', 'CVn': 'Lạp Khuyển', 'CMa': 'Đại Khuyển', 'CMi': 'Tiểu Khuyển', 'Cap': 'Ma Kết',
      'Car': 'Thuyền Để', 'Cas': 'Tiên Hậu', 'Cen': 'Bán Nhân Mã', 'Cep': 'Tiên Vương', 'Cet': 'Kình Ngư', 'Cha': 'Yển Diên', 'Cir': 'Viên Quy', 'Col': 'Thiên Cáp',
      'Com': 'Hậu Phát', 'CrA': 'Nam Miện', 'CrB': 'Bắc Miện', 'Crv': 'Ô Nha', 'Crt': 'Cự Tước', 'Cru': 'Nam Thập Tự', 'Cyg': 'Thiên Nga', 'Del': 'Hải Đồn',
      'Dor': 'Kiếm Ngư', 'Dra': 'Thiên Long', 'Equ': 'Tiểu Mã', 'Eri': 'Ba Giang', 'For': 'Thiên Lô', 'Gem': 'Song Tử', 'Gru': 'Thiên Hạc', 'Her': 'Vũ Tiên',
      'Hor': 'Thời Chung', 'Hya': 'Trường Xà', 'Hyi': 'Thủy Xà', 'Ind': 'Ấn Đệ An', 'Lac': 'Hiết Hổ', 'Leo': 'Sư Tử', 'LMi': 'Tiểu Sư', 'Lep': 'Thiên Thố',
      'Lib': 'Thiên Bình', 'Lup': 'Sài Lang', 'Lyn': 'Thiên Miêu', 'Lyr': 'Thiên Cầm', 'Men': 'Sơn Án', 'Mic': 'Hiển Vi Kính', 'Mon': 'Kỳ Lân', 'Mus': 'Thương Dăng',
      'Nor': 'Củ Xích', 'Oct': 'Nam Cực', 'Oph': 'Xà Phu', 'Ori': 'Lạp Hộ', 'Pav': 'Khổng Tước', 'Peg': 'Phi Mã', 'Per': 'Anh Tiên', 'Phe': 'Phượng Hoàng',
      'Pic': 'Hội Giá', 'Psc': 'Song Ngư', 'PsA': 'Nam Ngư', 'Pup': 'Thuyền Vĩ', 'Pyx': 'La Bàn', 'Ret': 'Võng Cổ', 'Sge': 'Thiên Tiễn', 'Sgr': 'Nhân Mã',
      'Sco': 'Thiên Yết', 'Scl': 'Ngọc Phu', 'Sct': 'Thuẫn Bài', 'Ser': 'Cự Xà', 'Sex': 'Lục Phân Nghi', 'Tau': 'Kim Ngưu', 'Tel': 'Viễn Vọng Kính', 'Tri': 'Tam Giác',
      'TrA': 'Nam Tam Giác', 'Tuc': 'Đỗ Quyên', 'UMa': 'Đại Hùng', 'UMi': 'Tiểu Hùng', 'Vel': 'Thuyền Phàm', 'Vir': 'Xử Nữ', 'Vol': 'Phi Ngư', 'Vul': 'Hồ Ly'}
assert len(VI) == 88

# ---- danh mục sao của trang (giải mã giống app/core/night-sky.js) ----
src = open(cat_p, encoding='utf-8').read()
raw = base64.b64decode(''.join(re.findall(r"'([^']*)'", re.search(r"STAR_BSC5 = (.*?);", src, re.S).group(1))))   # chuỗi chia nhiều dòng '…' +
stars, p, q = [], 0, 0   # (xích kinh lượng tử 0..16383, xích vĩ 13 bit, cấp sao, vector đơn vị)
while p < len(raw):
    dl = sh = 0
    while True:
        c = raw[p]; p += 1; dl |= (c & 127) << sh; sh += 7
        if not c & 128: break
    q += dl; y = int.from_bytes(raw[p:p + 4], 'little'); p += 4
    ra = q / 16384 * 2 * math.pi; de = math.radians((y & 8191) / 8191 * 180 - 90)
    stars.append((q % 16384, y & 8191, (y >> 13 & 255) * 0.05 - 1.5, (math.cos(de) * math.cos(ra), math.cos(de) * math.sin(ra), math.sin(de))))
print('danh mục:', len(stars), 'sao')

def unit(ra_deg, de_deg):
    a, d = math.radians(ra_deg), math.radians(de_deg); return (math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d))
TOL = math.cos(math.radians(0.15))
lines = {f['id']: f['geometry']['coordinates'] for f in json.load(open(lines_p, encoding='utf-8'))['features']}
info = {f['id']: f for f in json.load(open(info_p, encoding='utf-8'))['features']}
assert set(lines) == set(VI) == set(info), (set(VI) ^ set(lines), set(VI) ^ set(info))
blob, rows, nv, miss, worst = bytearray(), [], 0, [], 0.0
for cid in sorted(VI, key=lambda k: info[k]['properties']['name']):
    polys = lines[cid]; assert len(polys) < 256; blob.append(len(polys))
    for poly in polys:
        assert 2 <= len(poly) < 256; blob.append(len(poly))
        for ra, de in poly:
            v = unit(ra % 360, de); best = max(stars, key=lambda s: s[3][0] * v[0] + s[3][1] * v[1] + s[3][2] * v[2])
            cs = sum(a * b for a, b in zip(best[3], v))
            if cs >= TOL:
                rq, dq, m = best[0], best[1], best[2]; worst = max(worst, math.degrees(math.acos(min(1, cs))))
            else:
                rq, dq, m = round((ra % 360) / 360 * 16384) % 16384, round((de + 90) / 180 * 8191), 6.0; miss.append((cid, ra, de, round(math.degrees(math.acos(min(1, cs))), 2)))
            mk = max(0, min(15, round((m + 1.5) / 0.5)))
            blob += (rq | dq << 14 | mk << 27).to_bytes(4, 'little'); nv += 1
    pr = info[cid]['properties']; lra, lde = info[cid]['geometry']['coordinates']
    rows.append(f"['{cid}', '{VI[cid]}', '{pr['name']}', {int(pr['rank'])}, {round(lra % 360, 1)}, {round(lde, 1)}]")
print('đỉnh:', nv, '· khớp sao trong danh mục (lệch xa nhất %.3f°)' % worst, '· không khớp:', len(miss))
for m in miss: print('  ', m)
b64 = base64.b64encode(bytes(blob)).decode()
lic = [l.rstrip() for l in open(lines_p.rsplit('/', 1)[0] + '/LICENSE', encoding='utf-8').read().strip().split('\n') if l.strip()]
out = ['        // ---- NÉT NỐI 88 CHÒM SAO: hình chòm theo bản đồ IAU / Sky & Telescope, dữ liệu constellations.lines.json + constellations.json của d3-celestial (Olaf Frohn,',
       '        //      github.com/ofrohn/d3-celestial, BSD-3-Clause — thông báo bản quyền trong khối /* */ dưới đây, build.py giữ nguyên khối này ở trang web); tên Hán Việt theo',
       '        //      Wikipedia tiếng Việt. Đóng gói bằng src/tools/constellations/pack.py: mỗi chòm 1 byte số đường gấp khúc; mỗi đường 1 byte số đỉnh rồi từng đỉnh 4 byte:',
       '        //      xích kinh 14 bit (360°/16384) · xích vĩ 13 bit (180°/8191, từ −90°) · cấp sao 4 bit (0,5 từ −1,5). Đỉnh trùng sao trong STAR_BSC5 mang đúng toạ độ',
       '        //      đã lượng tử của sao đó.',
       '        /* d3-celestial constellation data (constellations.lines.json, constellations.json), modified: packed, vertices snapped to the Yale BSC5 stars of this page.',
       *['           ' + l for l in lic], '        */',
       f"        const CONST_LINES = '{b64}';",
       '        const CONST_INFO = [   // [mã IAU, tên Hán Việt, tên La-tinh, hạng 1–3 (1 = chòm lớn, dễ thấy), xích kinh nhãn °, xích vĩ nhãn °] — cùng thứ tự với CONST_LINES',
       *['          ' + r + ',' for r in rows],
       '        ];', '']
open(out_p, 'w', encoding='utf-8').write('\n'.join(out))
print(out_p, len(b64), 'ký tự base64 ·', len('\n'.join(out)), 'B')
