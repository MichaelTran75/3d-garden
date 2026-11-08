# Dựng lại `src/models/books.glb`

Gốc: ["Books and magazines"](https://sketchfab.com/3d-models/books-and-magazines-d0b76eada5bd495abcdfb2b20e6f7ee6), Naira, CC-BY-4.0; `3D Assets/interior/books-and-magazines.glb`. Dùng ở `app/van/interior/bookshelf.js`.

- 1 cuốn = 1 nút, tên theo vật liệu gốc (`book002` … `book006`, `book01`, `magaz1`, `magazstack1`), gốc giữa đáy cuốn.
- Z-lên cm → Y-lên mét; bỏ tiếp tuyến.
- Chỉ ảnh màu, WebP: sách 256², chồng tạp chí 512².
- Ra 192 KB.

```bash
python3 -I bookpack.py "<3D Assets>/interior/books-and-magazines.glb" ../../models/books.glb
```

Cần numpy + Pillow ở site-packages người dùng. Nén: `src/tools/glb-compress` `node compress.mjs <tệp dựng> <tệp nén>`, rồi chép vào `src/models/`.
