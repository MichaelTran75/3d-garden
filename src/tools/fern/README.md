# Dựng lại `src/models/fern.glb`

Gốc: ["Realistic HD Common polypody fern (25/55)"](https://sketchfab.com/3d-models/realistic-hd-common-polypody-fern-2555-899bc51fa8b6440c87f7e74e60c16ef7), PlantCatalog, CC-BY-4.0; ngoài repo. Lưới: thân rễ `Polypodium root`, lá `01a`, `01b`, `01c`.

- Bỏ thân rễ. Lá: Blender DECIMATE COLLAPSE 0,45 ⇒ 4 600 tam giác, 4 262 đỉnh, ~220 lá.
- 1 ảnh lá WebP 512² chung, mép loang màu lá (mipmap khỏi viền đen); màu từng lưới lá → màu đỉnh + lệch sắc nhẹ từng lá.
- Gốc toạ độ = tâm bề ngang + bề cao; mặt phẳng lưng (gốc cuống) z ≈ −0,05…0, lá chĩa +z ≤ 0,34 m; ngang 1,33 m, cao 0,96 m ⇒ đặt lên vách bờ đứng.
- `app/nature/ferns.js` lúc nạp tách → 213 lá rời (1 lá = 1 mảnh lưới liền), rải lên vách; GLB không cần dựng lại.
- KHR_mesh_quantization (vị trí int16, pháp tuyến int8, UV uint16, màu uint8) + EXT_texture_webp ⇒ 164 KB.

```bash
SRC=realistic_hd_common_polypody_fern_2555.glb   # tệp tải từ Sketchfab
BL=blender   # lệnh Blender (hoặc đường dẫn tới Blender.app/Contents/MacOS/Blender)
"$BL" -b --factory-startup --python fern_blender.py -- "$SRC" /tmp/fronds.npz 0.45
python3 -I fernpack.py /tmp/fronds.npz <ảnh lá 01a.png> ../../models/fern.glb
```

- `fern_blender.py` → `.npz`; `fernpack.py` → GLB (cần numpy + Pillow ở site-packages người dùng).
- Ảnh lá: ảnh màu vật liệu `Polypodium_01a` trong tệp gốc.
- Nén: `src/tools/glb-compress` `node compress.mjs <tệp dựng> <tệp nén>`, rồi chép vào `src/models/`.
