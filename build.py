#!/usr/bin/env python3
"""Dựng trang từ mã nguồn src/ (nơi sửa mã).

  src/page.html            khung trang (head, giao diện) với 4 chỗ trống @@CSS@@ @@WEATHER@@ @@FLIGHT@@ @@APP@@
  src/css/app.css          kiểu giao diện
  src/js/weather.js        thời tiết Open-Meteo + đồng hồ Pleiku (window.gardenWeather)
  src/js/flight-nav.js     dẫn đường bay cho ong/bướm (createFlightNavigator)
  src/app/manifest.txt     thứ tự ghép các mảnh mã cảnh chính src/app/**.js

Đầu ra:
  index.html, css/app.css, js/weather.js, js/flight-nav.js, js/app.js   — trang nhiều tệp cho GitHub Pages
                                                                          (mỗi tệp đóng dấu ?v=<băm>: tệp nào không đổi thì trình duyệt giữ bản đã lưu)
  ../3D garden.html                                                     — bản một tệp tự chứa (chỉ khi chạy trên máy, cạnh thư mục tests/)

  python3 build.py           dựng
  python3 build.py --check   dựng + kiểm tra cú pháp JS bằng node + NGÂN SÁCH dung lượng nén gzip (dùng trên GitHub Actions)
  python3 build.py --force   ghi đè "../3D garden.html" kể cả khi tệp đó đã bị sửa tay
"""
import gzip, hashlib, pathlib, re, subprocess, sys, tempfile

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / 'src'
SINGLE = HERE.parent / '3D garden.html'
STAMP = HERE / '.single-stamp'          # băm của bản một tệp dựng lần trước (không đưa lên git)
BUDGET_KB = {'js/app.js': 380, 'tổng': 400}   # ngân sách dung lượng NÉN gzip (KB) người xem phải tải — vượt thì --check báo lỗi
args = set(sys.argv[1:])

def die(msg):
    sys.exit('build.py: ' + msg)

def read(rel):
    p = SRC / rel
    if not p.exists(): die('thiếu tệp src/' + rel)
    t = p.read_text(encoding='utf-8')
    return t[:-1] if t.endswith('\n') else t   # mỗi tệp nguồn kết thúc bằng 1 dấu xuống dòng

# ---- ghép mã cảnh chính theo manifest ----
parts = []
for line in (SRC / 'app' / 'manifest.txt').read_text(encoding='utf-8').splitlines():
    rel = line.split('#', 1)[0].strip()
    if rel: parts.append(rel)
if len(parts) != len(set(parts)): die('manifest có tệp trùng')
listed = {'app/' + r for r in parts}
stray = sorted(str(p.relative_to(SRC)) for p in (SRC / 'app').rglob('*.js') if str(p.relative_to(SRC)) not in listed)
if stray: die('có tệp chưa ghi trong src/app/manifest.txt: ' + ', '.join(stray))
app = '\n'.join(read('app/' + r) for r in parts)

css, weather, flight = read('css/app.css'), read('js/weather.js'), read('js/flight-nav.js')
page = (SRC / 'page.html').read_text(encoding='utf-8')
for key in ('CSS', 'WEATHER', 'FLIGHT', 'APP'):
    if page.count('@@' + key + '@@') != 1: die('src/page.html phải có đúng một chỗ @@' + key + '@@')
single = page.replace('@@CSS@@', css).replace('@@WEATHER@@', weather).replace('@@FLIGHT@@', flight).replace('@@APP@@', app)

# ---- bản nhiều tệp cho GitHub Pages ----
head = re.search(r'^(.*?)\n  <style>\n(.*?)\n  </style>\n</head>\n', single, re.S)
body = re.search(r'<body>\n(.*?)\n  <script id="garden-weather-controller">', single, re.S)
if not head or not body: die('khung trang src/page.html sai cấu trúc')
files = {'css/app.css': css + '\n', 'js/weather.js': weather.strip('\n') + '\n', 'js/flight-nav.js': flight.strip('\n') + '\n', 'js/app.js': app.strip('\n') + '\n'}
for rel, text in files.items():
    p = HERE / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')
ver = {rel: hashlib.sha1(text.encode('utf-8')).hexdigest()[:10] for rel, text in files.items()}
index = (head.group(1) + '\n'
         + '  <link rel="stylesheet" href="css/app.css?v=' + ver['css/app.css'] + '">\n'
         + '</head>\n\n<body>\n' + body.group(1) + '\n\n'
         + '  <!-- thời tiết + đồng hồ Pleiku · dẫn đường bay côn trùng · dựng cảnh (giữ đúng thứ tự) -->\n'
         + ''.join('  <script src="' + rel + '?v=' + ver[rel] + '"></script>\n' for rel in ('js/weather.js', 'js/flight-nav.js', 'js/app.js'))
         + '</body>\n\n</html>\n')
(HERE / 'index.html').write_text(index, encoding='utf-8')

# ---- bản một tệp cạnh thư mục tests/ (trên máy) — không ghi đè nếu tệp đó bị sửa tay sau lần dựng trước ----
if (HERE.parent / 'tests').is_dir():
    sha = lambda t: hashlib.sha1(t.encode('utf-8')).hexdigest()
    if SINGLE.exists() and STAMP.exists() and '--force' not in args:
        cur = sha(SINGLE.read_text(encoding='utf-8'))
        if cur != STAMP.read_text().strip() and cur != sha(single):
            die('"%s" đã bị sửa tay sau lần dựng trước — hãy sửa trong src/ (hoặc chạy lại với --force để ghi đè)' % SINGLE.name)
    SINGLE.write_text(single, encoding='utf-8'); STAMP.write_text(sha(single) + '\n')

if '--check' in args:   # kiểm tra cú pháp 3 tệp JS + ngân sách dung lượng
    for rel in ('js/weather.js', 'js/flight-nav.js', 'js/app.js'):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(files[rel])
        r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
        if r.returncode: die('lỗi cú pháp trong ' + rel + ':\n' + r.stderr)
    gz = {rel: len(gzip.compress(text.encode('utf-8'), 9)) / 1024 for rel, text in list(files.items()) + [('index.html', index)]}
    gz['tổng'] = sum(gz.values())
    over = ['%s %.0f KB > %d KB' % (k, gz[k], v) for k, v in BUDGET_KB.items() if gz[k] > v]
    if over: die('vượt ngân sách dung lượng nén (sửa BUDGET_KB nếu thật sự cần): ' + '; '.join(over))
    print('Ngân sách gzip: app.js %.0f/%d KB · tổng %.0f/%d KB' % (gz['js/app.js'], BUDGET_KB['js/app.js'], gz['tổng'], BUDGET_KB['tổng']))

total = sum(len(t.encode('utf-8')) for t in files.values()) + len(index.encode('utf-8'))
print('Đã dựng từ src/ (%d mảnh mã) → %d tệp, tổng %.2f MB' % (len(parts), len(files) + 1, total / 1e6))
for rel in ['index.html'] + list(files):
    print('  %-18s %8.1f KB' % (rel, (HERE / rel).stat().st_size / 1024))
