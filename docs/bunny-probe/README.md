# Bộ đo thỏ

> Đo cho [bunny-movement](../bunny-movement.md).

## Chạy

- Gốc repo (đã build): `python3 src/tools/debug/mkdbg.py . dbg.html`, rồi `python3 -m http.server 8795` (cổng khác: đặt `PORT=` cho `run.cjs`).
- Playwright: `run.cjs` tự lấy bản mới nhất trong `~/.npm/_npx`, hoặc đặt biến `PLAYWRIGHT_PATH`.
- Ở đây: `node run.cjs dbg.html 9 1280 800 bun-setup.js <probe>.js …` — mở lúc 9 giờ, chạy lần lượt trên cùng trang, in `#i {json}`.
- `bun-setup.js`: dựng xong lớp va chạm, tắt tập tính, cài `window.__B`. Đo theo ô con + lớp 4 (`bun-measure2`, `bun-objs`, `bun-map2`, `bun-routes3`, `bun-diag-coop`) thì dùng `bun-setup2.js` thay.

## Probe

- Va chạm: `bun-measure` (21 cọc rào biogas + lang thang), `bun-objs`, `bun-stuck`, `bun-low`, `bun-lowwho`.
- Có đích, bật lại tập tính: `bun-routes2/3`, `bun-flee` (32 lượt), `bun-flee2` (16, in từng lượt), `bun-bedwho`, `bun-coopin`.
- Dáng: `bun-gait`, `bun-gait3` · đứng trên vật: `bun-stand`, `bun-standdbg` · ảnh: `bun-map2` · chỗ trú: `bun-shmap`.

## Bẫy

- Dời thỏ phải đặt `b.sy = undefined`.
- Chỗ xuất phát theo hạt giống cố định, nhưng tập tính dùng `Math.random` ⇒ mỗi lần chạy lệch vài lượt.
- `bun-stand*` dựng lại lớp va chạm, thiếu lưới đã thả mảng đỉnh ⇒ chạy cuối.
- Lấn theo ô 12,5 cm (`B.penCell`) báo giả sát ván mỏng: dùng `B.penVerts` của `bun-setup2.js`.
