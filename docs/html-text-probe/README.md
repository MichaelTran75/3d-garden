# Bộ đo lớp chữ HTML

Playwright: tự lấy bản mới nhất trong `~/.npm/_npx`, hoặc đặt `PLAYWRIGHT_PATH`.

- `python3 src/tools/debug/mkdbg.py <bản build> <S>/dbg.html`; trong `<S>` symlink `3d-garden` và `css` → `3d-garden/css`.
- Trong `<S>`: `python3 -m http.server 8778 --bind 127.0.0.1`

```bash
DSF=2 MODELS_DIR=3d-garden/models node 3d-garden/src/tools/debug/ev4.cjs dbg.html 3d-garden/src/tools/engineer-audit/harness.js 12.6 3d-garden/docs/html-text-probe/ht-views.js
```

- Probe khác: `ht-cost.js`, `ht-zoom.js`. `DSF=2` bắt buộc; chỉ ảnh `__pshot` có lớp DOM.
