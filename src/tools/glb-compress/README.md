# Nén mẫu 3D `src/models/`

Nén các mẫu 3D cho trang nhẹ hơn, chạy bằng Node. Công cụ: [glTF-Transform](https://gltf-transform.dev) 4.5.1 (MIT) + meshoptimizer, chạy bằng Node.

## Chạy

```bash
cd src/tools/glb-compress
npm install
node compress.mjs ../../models/raccoon.glb /tmp/raccoon.glb
```

Script in dung lượng trước → sau và các sai lệch đo được. Xem xong mới chép tệp ra đè lên `src/models/`. Cấu hình từng mẫu nằm ở bảng `CFG` đầu `compress.mjs`. Tệp `.bin` (GLB đã XOR, như `transit.bin`) được bỏ XOR trước khi nén, nén xong XOR lại.

## Làm gì (không đổi hình)

- Bỏ accessor mồ côi. Bỏ hoạt cảnh không dùng (`raccoon`: đoạn RunAnim, gấu mèo chạy bằng khung hành vi riêng).
- Lượng tử hoá pháp tuyến (10 bit), UV (12 bit), trọng số skin (8 bit). **Không** lượng tử hoá vị trí ở mẫu mà mã trang đọc thẳng toạ độ mét của đỉnh: gấu mèo (`app/animals/raccoon/glb.js`), gà (`app/animals/chickens/chickens.js`), sách (`app/van/interior/bookshelf.js`).
- Ảnh JPEG → WebP (drone: ảnh màu q88, ảnh kim loại/nhám q92). Ảnh pháp tuyến giữ JPEG vì bản WebP lớn hơn (94 → 118 KB).
- Sắp lại đỉnh / tam giác (meshopt reorder), rồi nén `EXT_meshopt_compression` kiểu QUANTIZE (không mất dữ liệu).

Mã nạp mẫu phải gọi `setMeshoptDecoder(MeshoptDecoder)`. Mọi chỗ nạp GLB trong `app/` đã gọi.

## Kết quả

| Mẫu | Trước | Sau |
| --- | ---: | ---: |
| `raccoon.glb` | 333 KB | 66 KB |
| `turbine.glb` | 232 KB | 84 KB |
| `fern.glb` | 164 KB | 107 KB |
| `chicken.glb` | 152 KB | 95 KB |
| `books.glb` | 192 KB | 155 KB |
| `dji-mini3.glb` | 1 364 KB | 1 279 KB |

Cả thư mục `models/`: 3 864 → 3 214 KB.

Không nén lại `chassis`, `engine`, `galaxy`, `pump`, `telescope`, `tinyliving`, `trimmer`, `transit.bin`, `fungi.bin`: các tệp này đã nén meshopt từ trước, chạy lại chỉ giảm 0–1%.

Kiểm tra:
- Sai lệch lớn nhất: pháp tuyến ≤ 0,001, UV ≤ 0,00013, trọng số ≤ 0,003.
- PSNR ảnh drone: 42,8 dB (ảnh màu), 39 dB (kim loại/nhám).
- So ảnh dựng từng mẫu trước / sau, cùng camera trong trang thử: khác trung bình ≤ 0,23 / 255 mỗi điểm ảnh.

## Khi dựng lại một mẫu

Các script dựng (`books/bookpack.py`, `fern/fernpack.py`, `turbine/turbinepack.py`, `chicken/chickbuild.js`) ra tệp chưa nén. Chạy `compress.mjs` lên tệp đó trước khi chép vào `src/models/`.
