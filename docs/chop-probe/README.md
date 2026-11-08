# Bộ đo thái hành

Đo dao kỹ sư ở pha `chop` (`src/app/engineer/tasks/cooking.js`) so với tay trái; bó hành, đường cắt ở `src/app/van/interior/kitchen.js` (`VAN.kitchen`).

## Chạy

1. Ở repo: `python3 build.py`, rồi `python3 src/tools/debug/mkdbg.py . <thư mục phục vụ>/dbg.html`.
2. Thư mục phục vụ: liên kết `3d-garden` → repo, `css` → `3d-garden/css`; chạy `python3 -m http.server 8778 --bind 127.0.0.1`.
3. Playwright (`src/tools/debug/ev4.cjs`): tự lấy bản mới nhất trong `~/.npm/_npx`, hoặc đặt `PLAYWRIGHT_PATH`.
4. Từ thư mục phục vụ (JSON ra stdout, ảnh vào `$SHOTS`):

```bash
SHOTS=shots/chop MODELS_DIR=3d-garden/models node 3d-garden/src/tools/debug/ev4.cjs dbg.html 3d-garden/src/tools/engineer-audit/harness.js 12.6 3d-garden/docs/chop-probe/chop.js
```

## Probe

- `chop.js`: cả lượt thái (~40 s), lưỡi dao ↔ đỉnh lưới tay trái gần nhất (cm người thật), số khung < 4 mm, theo từng 4 s; 3 góc chụp ở mỗi giây trong `window.__SNAP` (mặc định 3 / 20 / 38).
- `edge.js`: cạnh lưỡi cao hơn mặt thớt (toạ độ tủ bếp) + hướng lưỡi.

Đạt: `framesBladeInsideHand` = 0.
