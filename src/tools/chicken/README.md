# Dựng lại `src/models/chicken.glb`

Gốc: ["Chicken - rigged"](https://sketchfab.com/3d-models/chicken-rigged-6e3b93c078114c52bfe4cfa08b9843eb), Maf'j Alvarez, CC-BY-4.0; ngoài repo.

1. `study.html` + `devserver.py` của `../transit/`; mẫu trong thư mục riêng, vd `dl-chicken/chicken_-_rigged.glb`.
2. Mở `http://localhost:8777/study.html?f=dl-chicken/chicken_-_rigged.glb`, console:

```js
{ const s = document.createElement('script'); s.src = '/chickbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await chickBuild({ height: 0.4 });   // gộp 7 lưới → 1 (màu đỉnh), khớp/trọng số uint8, bỏ 'rest', lược khung (5.710 → 1.411), bỏ rãnh đứng yên ở tư thế nghỉ
await chickWrite('chicken.glb');     // → shots/chicken.glb (~152 KB, GLTFExporter + ghi công trong asset.extras)
```

3. Nén (`src/tools/glb-compress`: `node compress.mjs <tệp dựng> <tệp nén>`), chép vào `src/models/`.

- Nút gốc `chicken` (đầu +Z, mét, chân chạm y = 0), 1 SkinnedMesh `Chicken`, hoạt cảnh `walking` · `pecking` · `idle` · `sitting-down` · `sitting-idle` · `standing-up`.
- `walking` còn chuyển động gốc (0,23 m / 1,583 s): `src/app/animals/chickens/chickens.js` lúc nạp trừ dời tuyến tính khỏi rãnh vị trí, tự đẩy gà 0,145 m/s × tốc độ phát.
