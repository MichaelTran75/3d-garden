# Dựng lại `src/models/turbine.glb`

Gốc: ["Hydrogenerator | Old work"](https://sketchfab.com/3d-models/hydrogenerator-old-work-630a3b2be6904bb1a5ec813a2c0a848f), TadenStar, CC-BY-4.0; `3D Assets/industrial/hydro-generator.glb` (ngoài repo). Đơn vị gốc mét × 0,1457 → dựng về mét.

- Số đo tổ máy + buồng xoắn, ống áp lực, ống hút (trang tự dựng): `app/world/hydro-turbine.js`.
- Lấy `Rotor_Collect`, không `Rotor_Cut` (rotor khuyết 130° ⇒ quay lộ khe). Bỏ `Cut`, `Obmotka_rotora_1`, `Obmotka_statora`, bu-lông / chốt < 0,3 m trong thân tua-bin.
- `rotor` = `Rotor_Full` + `Obmotka_rotora_2` + `Rotor_turbine` + vành đai bánh xe công tác (trong `turbina`).
- `vane` = 1 cánh hướng nước (mở lớn nhất), gốc = trục xoay cánh; extras `r`, `a0`, `n`, `pitch`, `closeDir`, `closeDeg` (đóng kín 46,5°); trang nhân bằng `InstancedMesh`.
- `stat` = phần đứng yên.
- ~18k tam giác, màu đỉnh (bảng 17 màu), bỏ ảnh; không pháp tuyến ⇒ trang vẽ `flatShading`; `KHR_mesh_quantization` (vị trí int16, màu uint8) ⇒ 232 KB. Tỉ lệ giảm lưới, cách lấy màu: đầu `turbine_blender.py`, `turbinepack.py`.

```bash
SRC="<3D Assets>/industrial/hydro-generator.glb"
BL=blender   # lệnh Blender (hoặc đường dẫn tới Blender.app/Contents/MacOS/Blender)
"$BL" -b --factory-startup --python turbine_blender.py -- "$SRC" /tmp/parts.npz
python3 -I turbinepack.py /tmp/parts.npz ../../models/turbine.glb
```

Nén: `src/tools/glb-compress` `node compress.mjs <tệp dựng> <tệp nén>`, rồi chép vào `src/models/`.
