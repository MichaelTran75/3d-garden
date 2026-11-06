#!/usr/bin/env python3
"""TRANG DEBUG cho đầu dò Playwright (dựng lại 05/11 — bản cũ ở scratchpad bị hệ thống dọn).

  python3 src/tools/debug/mkdbg.py <thư mục 3d-garden đã build> <trang ra.html>

Lấy index.html (bản Pages của build.py), nhúng thẳng js/weather.js, js/flight-nav.js, js/app.js, chèn dbg-hook.js (window.__ev = eval trong phạm vi cảnh,
window.__dbg: view / frames / snap / clock…) sau dòng window.__info, và window.__tBuilt trước startLoop, giờ ép window.__hourOverride vào weather.js (đầu dò chờ biến này). Mẫu GLB đầu dò tự trỏ
về máy (ev2.cjs: __racGlb, __droneGlb…).
"""
import pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
root, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
html = (root / 'index.html').read_text(encoding='utf-8')
hook = (HERE / 'dbg-hook.js').read_text(encoding='utf-8')

def inline(m):
    src = (root / m.group(1)).read_text(encoding='utf-8')
    if m.group(1) == 'js/app.js':
        a = '        window.__info = () => renderer.info.render;\n'
        assert src.count(a) == 1, 'không thấy dòng window.__info'
        src = src.replace(a, a + hook)
        b = re.search(r'\n( *)const startLoop = \(\) =>', src)
        assert b, 'không thấy startLoop'
        src = src[:b.start() + 1] + b.group(1) + 'window.__tBuilt = performance.now();\n' + src[b.start() + 1:]
    if m.group(1) == 'js/weather.js':   # giờ ép của đầu dò (ev2.cjs: window.__hourOverride)
        a = 'get localHour() { return localHour; }'
        assert src.count(a) == 1, 'không thấy localHour'
        src = src.replace(a, 'get localHour() { return window.__hourOverride ?? localHour; }')
        a = 'get wildlifeAwake() { return localHour >= 6 && localHour < 18.5; }'
        assert src.count(a) == 1, 'không thấy wildlifeAwake'
        src = src.replace(a, 'get wildlifeAwake() { const h = window.__hourOverride ?? localHour; return h >= 6 && h < 18.5; }')
    return '<script>' + src + '</script>'

html, n = re.subn(r'<script src="(js/[\w.-]+\.js)(?:\?v=\w+)?"></script>', lambda m: inline(m), html)
assert n == 3, n
out.write_text(html, encoding='utf-8')
print('ok', out, len(html))
