#!/usr/bin/env python3
"""Dựng trang từ mã nguồn src/ (nơi sửa mã).

  src/page.html            khung trang (head, giao diện) với 4 chỗ trống @@CSS@@ @@WEATHER@@ @@FLIGHT@@ @@APP@@
  src/css/app.css          kiểu giao diện
  src/js/weather.js        thời tiết Open-Meteo + đồng hồ Pleiku (window.gardenWeather)
  src/js/flight-nav.js     dẫn đường bay cho ong/bướm (createFlightNavigator)
  src/app/manifest.txt     thứ tự ghép các mảnh mã cảnh chính src/app/**.js
  src/models/              mẫu 3D dùng nguyên (G 17/10: drone + tay cầm DJI Mini 3 — dji-mini3.glb; G 18/10: xe Ford Transit — transit.bin = GLB đã XOR), chép nguyên byte sang models/

Đầu ra:
  index.html, css/app.css, js/weather.js, js/flight-nav.js, js/app.js   — trang nhiều tệp cho GitHub Pages (js/app.js bỏ dòng chú thích)
                                                                          (mỗi tệp đóng dấu ?v=<băm>: tệp nào không đổi thì trình duyệt giữ bản đã lưu)
  models/*.glb, *.bin, *.jpg                                            — mẫu 3D / ảnh trang tải sau khi cảnh chạy (bản một tệp tải từ địa chỉ Pages tuyệt đối)
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
MODELS_KB = 2200                         # trần dung lượng THÔ của models/ (KB) — mẫu tải sau, không tính vào ngân sách gzip bên dưới (18/10: 1500 → 2200 khi thêm xe Transit GLB transit.bin ~550 KB)
BUDGET_KB = {'js/app.js': 440, 'tổng': 460}   # ngân sách dung lượng NÉN gzip (KB) người xem phải tải — vượt thì --check báo lỗi (14/10: 380 → 400 khi thêm chim sẻ + thuyền; 15/10: G nâng 420/440; 16/10: bỏ cả chú thích cuối dòng ⇒ app.js 420 → 359 KB, còn trống ~60 KB; 17/10 khuya: G nâng 440/460 để dựng lại xe theo Ford Transit L3H2)
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
# trang web: bỏ chú thích // (cả dòng lẫn cuối dòng) trong mã cảnh — người xem tải nhẹ hơn; src/ và bản một tệp (để thử, gỡ lỗi) giữ nguyên chú thích.
# Bộ tách từ tối giản (G 16/10): theo dõi chuỗi '…' "…", template `…${…}…` (KHÔNG đụng gì bên trong phần chữ của template — shader GLSL), regex /…/
# (đoán theo ký tự đứng trước), chú thích khối /* */ giữ nguyên. Kiểm 2 lớp: chuỗi token (bỏ khoảng trắng + chú thích) trước = sau, và Node phân tích được.
REGEX_AFTER = set('(,=:[!&|?{};+-*%~^<>')
REGEX_KW = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof'}
def js_scan(src, keep_comments):
    out, toks, stack = [], [], []   # stack: 'T' = trong chữ template · số = độ sâu ngoặc { } trong ${ … }
    i, n, last, word = 0, len(src), '', ''
    while i < n:
        c = src[i]
        if stack and stack[-1] == 'T':   # chữ template
            if c == '\\': out.append(src[i:i + 2]); i += 2; continue
            if c == '`': stack.pop(); out.append(c); toks.append('`'); i += 1; last = '`'; continue
            if src.startswith('${', i): stack.append(0); out.append('${'); toks.append('${'); i += 2; last = '{'; continue
            out.append(c); toks[-1:] = [toks[-1] + c] if toks and toks[-1].startswith('t:') else toks[-1:] + ['t:' + c]; i += 1; continue
        if src.startswith('//', i):
            j = src.find('\n', i); j = n if j < 0 else j
            if keep_comments: out.append(src[i:j])
            else:
                while out and out[-1] in (' ', '\t'): out.pop()
                out.append('\x01')
            i = j; continue
        if src.startswith('/*', i):
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2; out.append(src[i:j]); i = j; continue
        if c in '"\'':
            j = i + 1
            while j < n and src[j] != c and src[j] != '\n': j += 2 if src[j] == '\\' else 1
            out.append(src[i:j + 1]); toks.append(src[i:j + 1]); i = j + 1; last = 'a'; word = ''; continue
        if c == '`': stack.append('T'); out.append(c); toks.append('`'); i += 1; continue
        if c == '/' and (last == '' or last in REGEX_AFTER or word in REGEX_KW):
            j, cls = i + 1, False
            while j < n and src[j] != '\n':
                if src[j] == '\\': j += 2; continue
                if src[j] == '[': cls = True
                elif src[j] == ']': cls = False
                elif src[j] == '/' and not cls: break
                j += 1
            j += 1
            while j < n and (src[j].isalnum() or src[j] == '_'): j += 1
            out.append(src[i:j]); toks.append(src[i:j]); i = j; last = 'a'; word = ''; continue
        if c.isspace(): out.append(c); i += 1; continue
        if c.isalnum() or c in '_$':
            j = i
            while j < n and (src[j].isalnum() or src[j] in '_$'): j += 1
            word = src[i:j]; out.append(word); toks.append(word); i = j; last = 'a'; continue
        if stack and isinstance(stack[-1], int):
            if c == '{': stack[-1] += 1
            elif c == '}':
                if stack[-1] == 0: stack.pop(); out.append(c); toks.append('}'); i += 1; last = 'a'; continue
                stack[-1] -= 1
        out.append(c); toks.append(c); i += 1; last = c; word = ''
    return ''.join(out), toks
def strip_js_comments(src):
    txt, toks = js_scan(src, False)
    lines = [l.replace('\x01', '') for l in txt.split('\n') if l.strip() != '\x01']
    res = '\n'.join(lines)
    if js_scan(res, True)[1] != toks: die('bỏ chú thích làm đổi mã (chuỗi token khác) — xem lại js_scan trong build.py')
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as tf: tf.write(res)
    try:
        r = subprocess.run(['node', '--check', tf.name], capture_output=True, text=True)
        if r.returncode != 0: die('mã sau khi bỏ chú thích không phân tích được:\n' + r.stderr[:2000])
    except FileNotFoundError: pass   # máy không có Node: chỉ dựa vào kiểm chuỗi token
    finally: pathlib.Path(tf.name).unlink(missing_ok=True)
    return res
web_app = strip_js_comments(app)
files = {'css/app.css': css + '\n', 'js/weather.js': weather.strip('\n') + '\n', 'js/flight-nav.js': flight.strip('\n') + '\n', 'js/app.js': web_app.strip('\n') + '\n'}
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

# ---- mẫu 3D: src/models/ → models/ (chép nguyên byte, xoá mẫu đã bỏ) ----
msrc, mout = SRC / 'models', HERE / 'models'
models = sorted(p for p in msrc.iterdir() if p.is_file() and not p.name.startswith('.')) if msrc.is_dir() else []
if models: mout.mkdir(exist_ok=True)
for p in models:
    q, b = mout / p.name, p.read_bytes()
    if not q.exists() or q.read_bytes() != b: q.write_bytes(b)
if mout.is_dir():
    for q in mout.iterdir():
        if q.is_file() and not (msrc / q.name).is_file(): q.unlink()
models_kb = sum(p.stat().st_size for p in models) / 1024

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
    if models_kb > MODELS_KB: die('models/ %.0f KB > %d KB (sửa MODELS_KB nếu thật sự cần)' % (models_kb, MODELS_KB))
    print('Ngân sách gzip: app.js %.0f/%d KB · tổng %.0f/%d KB' % (gz['js/app.js'], BUDGET_KB['js/app.js'], gz['tổng'], BUDGET_KB['tổng']))

total = sum(len(t.encode('utf-8')) for t in files.values()) + len(index.encode('utf-8'))
print('Đã dựng từ src/ (%d mảnh mã) → %d tệp, tổng %.2f MB' % (len(parts), len(files) + 1, total / 1e6))
for rel in ['index.html'] + list(files) + ['models/' + p.name for p in models]:
    print('  %-18s %8.1f KB' % (rel, (HERE / rel).stat().st_size / 1024))
