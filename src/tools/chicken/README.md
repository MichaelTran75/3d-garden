# Dựng lại `src/models/chicken.glb`

Mẫu gốc: ["Chicken - rigged"](https://sketchfab.com/3d-models/chicken-rigged-6e3b93c078114c52bfe4cfa08b9843eb) của Maf'j Alvarez, giấy phép CC-BY-4.0
(gà mái low-poly: 7 lưới da, 736 tam giác, 7 màu phẳng, 17 xương, 7 hoạt cảnh; 306 KB). Tệp gốc không nằm trong repo.

1. Dùng `study.html` + `devserver.py` của `../transit/`; đặt mẫu gốc trong một thư mục riêng, vd `dl-chicken/chicken_-_rigged.glb`.
2. Mở `http://localhost:8777/study.html?f=dl-chicken/chicken_-_rigged.glb`, trong console:

```js
{ const s = document.createElement('script'); s.src = '/chickbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await chickBuild({ height: 0.4 });   // gộp 7 lưới → 1 (màu đỉnh), khớp/trọng số uint8, bỏ 'rest', lược khung (5.710 → 1.411), bỏ rãnh đứng yên ở tư thế nghỉ
await chickWrite('chicken.glb');     // → shots/chicken.glb (~152 KB, GLTFExporter + ghi công trong asset.extras)
```

3. Chép `shots/chicken.glb` vào `src/models/`.

Kết quả: nút gốc `chicken` (đầu về +Z, mét, chân chạm y = 0), 1 SkinnedMesh `Chicken`, 6 hoạt cảnh `walking` · `pecking` · `idle` · `sitting-down` ·
`sitting-idle` · `standing-up`. Hoạt cảnh `walking` CÒN chuyển động gốc (thân tiến 0,23 m / 1,583 s) — trang (`src/app/animals/chickens.js`) trừ dời tuyến
tính khỏi các rãnh vị trí lúc nạp rồi tự đẩy con gà đi 0,145 m/s × tốc độ phát.
