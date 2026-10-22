# Dựng lại `src/models/telescope.glb`, `galaxy.glb`, `moon.jpg`

Mẫu gốc (không nằm trong repo, mỗi mẫu 1 thư mục riêng):

- ["Telescope"](https://sketchfab.com/3d-models/telescope-fd6863dd22874707b99b00af620fdfcc) của sieminskaola, CC-BY-4.0 — 2 lưới 9,6k tam giác: lưới ảnh màu (ánh sáng nướng sẵn, unlit) + vỏ viền đen phồng ra, ảnh 1024² 440 KB.
- ["Need some space?"](https://sketchfab.com/3d-models/need-some-space-d6521362b37b48e3a82bce4911409303) của Loïc Norgeot, CC-BY-4.0 — đám 50k điểm màu (POINTS).
- ["Moon"](https://sketchfab.com/3d-models/moon-4db2273f6dd943b8ad7fa5e3b1b2431a) của Akshat, CC-BY-4.0 — chỉ dùng ảnh bề mặt 1024 × 512 (bản đồ trụ đẳng chữ nhật).

1. Chạy `devserver.py` (gốc = thư mục chứa các mẫu + `skybuild.js`), mở 1 trang bất kỳ của server (vd `treeview.html`), trong console:

```js
{ const s = document.createElement('script'); s.src = '/skybuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await skyBuild({ tele: '/telescope-2-glb/telescope-2.glb', gal: '/galaxy-glb/galaxy.glb', ratio: 0.4, err: 0.004, n: 10000 });
await skyWrite();   // → shots/telescope.glb (~57 KB, 3,9k tam giác) + shots/galaxy.glb (~74 KB, 10k điểm)
```

2. Ảnh trăng: tách ảnh nhúng trong GLB, thu 512 × 256 xám, JPEG chất lượng 82 (~32 KB) → `moon.jpg`.
3. Chép 3 tệp vào `src/models/`.

Điểm neo kính (mét, hệ mẫu) nằm trong `extras` của nút `telescope`: `base` (tâm chân trên đất), `back` (đuôi ống — chỗ thị kính), `front` (miệng kính vật), `axis`, `top`.
Đọc ở `src/app/engineer/sky-watch.js` (đặt kính cạnh đầu thảm, màn hình trên tay đỡ từ `back`). Thiên hà: tâm lõi ở gốc, mặt đĩa XZ, bán kính 90% điểm = 1;
vị trí int16 chuẩn hoá — phép giải lượng tử làm trong shader (`uQ`).
