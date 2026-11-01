# Dựng lại `src/models/turbine.glb`

Mẫu gốc: ["Hydrogenerator | Old work"](https://sketchfab.com/3d-models/hydrogenerator-old-work-630a3b2be6904bb1a5ec813a2c0a848f) của TadenStar, giấy phép CC-BY-4.0.
Tệp gốc nằm ở `3D Assets/industrial/hydro-generator.glb` (20,6 MB, 34 lưới, ~103k tam giác, 29 ảnh PNG 1024², không có hoạt cảnh), không nằm trong repo.

Tổ máy Francis trục đứng, máy phát kiểu ô (ổ đỡ chặn nằm dưới rotor). Đơn vị gốc là mét × 0,1457 (trang nhân lại về mét):
- bánh xe công tác 15 cánh, Ø 5,86 m;
- 18 cánh hướng nước, bước 20°, trục xoay ở r 3,64 m;
- rotor 54 cực ⇒ 111,1 vòng/phút ở 50 Hz;
- stator Ø 15,4 m, cả cụm cao 19 m.

Mẫu không có buồng xoắn, ống áp lực, ống hút: trang tự dựng (`app/world/hydro-turbine.js`).

## Giữ, bỏ, sửa

- **Chỉ lấy `Rotor_Collect`** (bản lắp đủ). `Rotor_Cut` là bản cắt nửa, rotor khuyết 130° nên quay sẽ lộ khe.
- **Bỏ:**
  - nắp mặt cắt `Cut`;
  - `Obmotka_rotora_1` (231°, trùng `Obmotka_rotora_2`);
  - `Obmotka_statora` (nửa vòng);
  - bu-lông, chốt nhỏ hơn 0,3 m trong thân tua-bin (giảm lưới thành cục méo).
- **Tách 3 nút:**
  - `rotor`: `Rotor_Full` + `Obmotka_rotora_2` + `Rotor_turbine` + vành đai bánh xe công tác (mảnh 360° nằm trong `turbina`);
  - `vane`: 1 cánh hướng nước mẫu, gốc = trục xoay cánh, extras: `r`, `a0`, `n`, `pitch`, `closeDir`, `closeDeg` (góc đóng kín 46,5°, thử chồng lấn với cánh kề). Cánh của mẫu đang mở lớn nhất. 26 mảnh cánh còn lại bị bỏ, trang nhân lại bằng `InstancedMesh`;
  - `stat`: mọi phần đứng yên.
- **Giảm lưới (Blender):** gộp mặt phẳng (1°) rồi collapse theo tỉ lệ từng phần: stator 0,17, ổ đỡ 0,15, thân tua-bin 0,5, còn lại 0,2. Ra ~18k tam giác.
- **Màu:** ảnh màu vật liệu lấy mẫu ở tâm UV từng tam giác, gộp thành bảng 17 màu, màu đỉnh = màu nhiều nhất quanh đỉnh. Bỏ hết ảnh.
- **Không pháp tuyến:** trang vẽ `flatShading`. Đỉnh hàn theo vị trí, ít gấp 3 so với tách theo pháp tuyến / màu.
- **Nén:** `KHR_mesh_quantization` (vị trí int16, màu uint8). Kết quả 232 KB.

## Chạy lại

```bash
SRC="…/3D Assets/industrial/hydro-generator.glb"
BL="$HOME/Library/Application Support/Steam/steamapps/common/Blender/Blender.app/Contents/MacOS/Blender"
"$BL" -b --factory-startup --python turbine_blender.py -- "$SRC" /tmp/parts.npz
python3 -I turbinepack.py /tmp/parts.npz ../../models/turbine.glb
```
