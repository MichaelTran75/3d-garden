# Nén mẫu 3D `src/models/`

Node + glTF-Transform 4.5.1 (MIT) + meshoptimizer.

```bash
cd src/tools/glb-compress
npm install
node compress.mjs ../../models/raccoon.glb /tmp/raccoon.glb
```

- In dung lượng trước → sau + sai lệch; xem xong mới chép đè vào `src/models/`.
- Cấu hình từng mẫu: `CFG` đầu `compress.mjs`.
- `.bin` (GLB XOR, như `transit.bin`): bỏ XOR → nén → XOR lại.
- Ra tệp chưa nén, phải nén trước khi chép: `books/bookpack.py`, `fern/fernpack.py`, `turbine/turbinepack.py`, `chicken/chickbuild.js`.
- Mã nạp phải gọi `setMeshoptDecoder(MeshoptDecoder)` (mọi chỗ nạp GLB trong `app/` đã có).

## Bước (không đổi hình)

- Bỏ accessor mồ côi, hoạt cảnh không dùng (`raccoon`: RunAnim).
- Lượng tử hoá pháp tuyến 10 bit, UV 12 bit, trọng số skin 8 bit; vị trí giữ nguyên khi mã đọc thẳng toạ độ mét của đỉnh: `app/animals/raccoon/glb.js`, `app/animals/chickens/chickens.js`, `app/van/interior/bookshelf.js`.
- JPEG → WebP (drone: màu q88, kim loại/nhám q92); ảnh pháp tuyến giữ JPEG (WebP lớn hơn: 94 → 118 KB).
- meshopt reorder → `EXT_meshopt_compression` QUANTIZE (không mất dữ liệu).

## Kết quả (KB)

- `raccoon.glb` 333 → 66 · `turbine.glb` 232 → 84 · `fern.glb` 164 → 107 · `chicken.glb` 152 → 95 · `books.glb` 192 → 155 · `dji-mini3.glb` 1 364 → 1 279 · cả `models/` 3 864 → 3 214.
- Không nén lại (đã meshopt, chỉ giảm 0–1%): `chassis`, `engine`, `galaxy`, `pump`, `telescope`, `tinyliving`, `trimmer`, `transit.bin`, `fungi.bin`.
- Sai lệch lớn nhất: pháp tuyến ≤ 0,001, UV ≤ 0,00013, trọng số ≤ 0,003; PSNR ảnh drone 42,8 dB (màu), 39 dB (kim loại/nhám).
- Ảnh dựng trước / sau (cùng camera, trang thử): lệch trung bình ≤ 0,23 / 255 mỗi điểm ảnh.
