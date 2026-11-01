# Dựng lại `src/models/fern.glb`

Mẫu gốc: ["Realistic HD Common polypody fern (25/55)"](https://sketchfab.com/3d-models/realistic-hd-common-polypody-fern-2555-899bc51fa8b6440c87f7e74e60c16ef7) của PlantCatalog, giấy phép CC-BY-4.0.

- 6,5 MB, 4 lưới: thân rễ `Polypodium root` (8 889 tam giác) + 3 lưới lá `01a` (3 360), `01b` (6 432), `01c` (432).
- 8 ảnh PNG; lá dùng alpha BLEND.
- Tệp gốc không nằm trong repo.

Loài: dương xỉ đa túc *Polypodium vulgare*, mọc trên tường đá, vách đất, gốc cây ẩm. Thân rễ bò sát mặt vách, lá lẻ cánh mọc rải dọc thân rễ, cuống ngắn, lá rủ chĩa ra ngoài. Mẫu dựng đúng dáng đó: gốc cuống nằm trên mặt phẳng lưng, nên đặt lên vách bờ đứng (`app/nature/ferns.js`).

Từ 31/10 tối, cảnh không đặt nguyên cụm nữa. Lúc nạp, `app/nature/ferns.js` tách mẫu thành 213 lá rời (mỗi lá là 1 mảnh lưới liền) rồi rải từng lá lên vách như cỏ. Tệp GLB giữ nguyên, không cần dựng lại.

## Giữ, bỏ, sửa

**Bỏ:** thân rễ. Nó nằm khuất sát vách nên không thấy, mà chiếm gần nửa số tam giác.

**Giảm lưới lá:** Blender DECIMATE (COLLAPSE, tỉ lệ 0,45, tam giác hoá). Còn 4 600 tam giác, 4 262 đỉnh, ~220 lá.

**Ảnh:** 3 ảnh lá có cùng mặt nạ alpha, nên chỉ giữ 1 ảnh WebP 512 × 512 dùng chung. Mép trong suốt được loang màu lá ra (khỏi viền đen khi lọc mipmap). Màu riêng của từng lưới lá thành màu đỉnh, cộng thêm sắc lệch nhẹ từng lá.

**Hệ toạ độ:** đưa về tâm theo bề ngang và bề cao. Mặt phẳng lưng (gốc cuống) ở z ≈ −0,05…0, lá chĩa ra +z tới 0,34 m. Mẫu ngang 1,33 m, cao 0,96 m.

**Nén:** KHR_mesh_quantization (vị trí int16, pháp tuyến int8, UV uint16, màu uint8) + EXT_texture_webp. Kết quả 164 KB.

## Chạy lại

```bash
SRC=~/Downloads/realistic_hd_common_polypody_fern_2555.glb
BL="$HOME/Library/Application Support/Steam/steamapps/common/Blender/Blender.app/Contents/MacOS/Blender"
"$BL" -b --factory-startup --python fern_blender.py -- "$SRC" /tmp/fronds.npz 0.45
python3 -I fernpack.py /tmp/fronds.npz <ảnh lá 01a.png> ../../models/fern.glb
```

- `fern_blender.py`: nạp GLB, bỏ thân rễ, giảm lưới, xuất mảng từng lưới lá (vị trí, pháp tuyến, UV, chỉ số) ra `.npz`.
- `fernpack.py`: tô màu đỉnh, lượng tử hoá, ảnh WebP, ghi GLB (cần numpy + Pillow ở site-packages của người dùng).
- Ảnh lá lấy từ tệp gốc (ảnh màu của vật liệu `Polypodium_01a`).
