# Dựng lại `src/models/books.glb`

Mẫu gốc: ["Books and magazines"](https://sketchfab.com/3d-models/books-and-magazines-d0b76eada5bd495abcdfb2b20e6f7ee6) của Naira, giấy phép CC-BY-4.0 (trong thư viện `3D Assets/interior/books-and-magazines.glb`, 5,3 MB, 8 lưới, 19 ảnh PNG).

Dùng ở `app/van/interior/bookshelf.js`: kệ sách nhỏ treo cạnh màn hình phụ trên bàn học.

## Giữ, bỏ, sửa

- Mỗi cuốn là 1 nút riêng, tên theo vật liệu gốc (`book002` … `book006`, `book01`, `magaz1`, `magazstack1`). Gốc nút ở giữa đáy cuốn, nên cảnh xếp từng cuốn tuỳ ý.
- Tệp gốc Z-lên, đơn vị cm ⇒ đổi sang Y-lên, mét. Bỏ tiếp tuyến.
- Chỉ giữ ảnh màu, WebP: sách 256 × 256, chồng tạp chí 512 × 512. Bỏ ảnh pháp tuyến, AO, độ nhám, specular.
- Kết quả 192 KB.

## Chạy lại

```bash
python3 -I bookpack.py "<3D Assets>/interior/books-and-magazines.glb" ../../models/books.glb
```

Cần numpy + Pillow ở site-packages của người dùng.

**Nén:** tệp dựng ra chưa nén. Chạy `src/tools/glb-compress` (`node compress.mjs <tệp dựng> <tệp nén>`) rồi mới chép vào `src/models/`.
