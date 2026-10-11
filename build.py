#!/usr/bin/env python3
"""Tách "../3D garden.html" (bản gốc 1 file, nơi sửa mã + chạy test) thành trang nhiều file cho GitHub Pages.

  index.html          khung trang + giao diện
  css/app.css         kiểu giao diện
  js/weather.js       thời tiết Open-Meteo + đồng hồ Pleiku (window.gardenWeather)
  js/flight-nav.js    dẫn đường bay cho ong/bướm (createFlightNavigator)
  js/app.js           dựng cảnh three.js + toàn bộ hoạt cảnh

Mỗi tệp được đóng dấu ?v=<băm nội dung> trong index.html: tệp nào không đổi thì trình duyệt giữ bản đã lưu.
"""
import hashlib, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / '3D garden.html'

def die(msg):
    sys.exit('build.py: ' + msg)

src = SRC.read_text(encoding='utf-8')

head = re.search(r'^(.*?)\n  <style>\n(.*?)\n  </style>\n</head>\n', src, re.S)
if not head: die('không tìm thấy <style> trong <head>')
head_top, css = head.group(1), head.group(2) + '\n'

body = re.search(r'<body>\n(.*?)\n  <script id="garden-weather-controller">', src, re.S)
if not body: die('không tìm thấy phần thân trang')
markup = body.group(1)

def script(pattern, name):
    m = re.search(pattern, src, re.S)
    if not m: die('không tìm thấy script ' + name)
    return m.group(1).strip('\n') + '\n'

weather = script(r'<script id="garden-weather-controller">\n(.*?)\n  </script>', 'thời tiết')
flight = script(r'<script id="garden-flight-navigation">\n(.*?)\n  </script>', 'dẫn đường bay')
app = script(r'</script>\n  <script>\n(.*?)\n  </script>\n</body>', 'cảnh chính')

files = {'css/app.css': css, 'js/weather.js': weather, 'js/flight-nav.js': flight, 'js/app.js': app}
for rel, text in files.items():
    p = HERE / rel; p.parent.mkdir(parents=True, exist_ok=True); p.write_text(text, encoding='utf-8')
ver = {rel: hashlib.sha1(text.encode('utf-8')).hexdigest()[:10] for rel, text in files.items()}

index = (head_top + '\n'
         + '  <link rel="stylesheet" href="css/app.css?v=' + ver['css/app.css'] + '">\n'
         + '</head>\n\n<body>\n' + markup + '\n\n'
         + '  <!-- thời tiết + đồng hồ Pleiku · dẫn đường bay côn trùng · dựng cảnh (giữ đúng thứ tự) -->\n'
         + ''.join('  <script src="' + rel + '?v=' + ver[rel] + '"></script>\n' for rel in ('js/weather.js', 'js/flight-nav.js', 'js/app.js'))
         + '</body>\n\n</html>\n')
(HERE / 'index.html').write_text(index, encoding='utf-8')

total = sum(len(t.encode('utf-8')) for t in files.values()) + len(index.encode('utf-8'))
print('Đã tách %s → %d tệp, tổng %.2f MB' % (SRC.name, len(files) + 1, total / 1e6))
for rel in ['index.html'] + list(files):
    print('  %-18s %8.1f KB' % (rel, (HERE / rel).stat().st_size / 1024))
