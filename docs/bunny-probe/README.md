# Bộ đo thỏ

## Chạy
- Gốc repo (đã build): `python3 src/tools/debug/mkdbg.py . dbg.html` rồi `python3 -m http.server 8795` (cổng khác: `PORT=` cho `run.cjs`).
- Playwright: `run.cjs` lấy bản mới nhất trong `~/.npm/_npx`, hoặc `PLAYWRIGHT_PATH`.
- Ở đây: `node run.cjs dbg.html 9 1280 800 bun-setup.js <probe>.js …`: mở lúc 9 giờ, chạy lần lượt trên cùng trang, in `#i {json}`.
- `bun-setup.js`: dựng xong lớp va chạm, tắt tập tính, cài `window.__B`. Đo theo ô con + lớp 4 (`bun-measure2`, `bun-objs`, `bun-map2`, `bun-routes3`, `bun-diag-coop`) ⇒ thay bằng `bun-setup2.js`.

## Probe
- Va chạm: `bun-measure` (21 cọc rào biogas + lang thang), `bun-objs`, `bun-stuck`, `bun-low`, `bun-lowwho`.
- Có đích, bật lại tập tính: `bun-routes2/3`, `bun-flee` (32 lượt), `bun-flee2` (16, in từng lượt), `bun-bedwho`, `bun-coopin`.
- Dáng `bun-gait`, `bun-gait3` · đứng trên vật `bun-stand`, `bun-standdbg` · ảnh `bun-map2` · chỗ trú `bun-shmap`.

## Bẫy
- Dời thỏ ⇒ `b.sy = undefined`.
- Xuất phát theo hạt giống cố định nhưng tập tính dùng `Math.random` ⇒ mỗi lần lệch vài lượt.
- `bun-stand*` dựng lại lớp va chạm, thiếu lưới đã thả mảng đỉnh ⇒ chạy cuối.
- `B.penCell` (lấn theo ô 12,5 cm) báo giả sát ván mỏng ⇒ dùng `B.penVerts` của `bun-setup2.js`.
