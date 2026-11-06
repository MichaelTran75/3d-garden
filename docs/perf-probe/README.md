# Bộ đo hiệu năng vườn (06/11/2026)

Dùng cho `../game-engine-study.md`. Chạy trên trang debug (`src/tools/debug/mkdbg.py <thư mục 3d-garden> gN.html`).
Server tĩnh phục vụ thư mục chứa trang ở `http://localhost:8794/`. Thư mục mẫu GLB đặt bằng `MODELS_DIR` (mặc định `N/3d-garden/models`).
Các tệp .cjs đọc trang ở `__dirname/../<trang>` ⇒ đặt thư mục này cạnh trang (vd. `<gốc>/p/` và `<gốc>/gN.html`).
Playwright lấy từ `~/.npm/_npx/0b9ff77863cb6e9f/node_modules/playwright`; khác máy thì sửa dòng `require` đầu tệp.

| Tệp | Làm gì | Chạy |
|---|---|---|
| prof.cjs + prof-instr.js | Khung thật (rAF), ms từng lượt worldTick, CPU renderer.render, lượt bóng, cập nhật ma trận, draw call theo loại / cỡ màn hình / tam giác, thống kê cảnh (đèn, vật liệu, texture, RAM), hồ sơ CPU | `node prof.cjs gN.html 10 out.json` |
| alloc-trace.js | Mảng ≥ 256 KB: chỗ tạo (dòng:cột trong trang), còn sống bao nhiêu | `ALLOC=1 node prof.cjs …` |
| boot.cjs | Hồ sơ CPU lúc mở trang tới `__tBuilt`, thời gian gộp theo hàm | `node boot.cjs gN.html 10` |
| cull.cjs | Ẩn vật nhỏ hơn 1 / 2 px: tốc độ + ảnh (`../shots/`) | `node cull.cjs gN.html 10` |
| veg.cjs + vegid.js | Nhận diện cây rừng instanced, A/B ẩn / tắt bóng | `node veg.cjs gN.html 10` |
| smthr.cjs | Vẽ bóng mỗi 1 / 2 / 4 khung | `node smthr.cjs gN.html 10 overview` |
| where.py | Dòng trong trang dựng → mảnh mã nguồn | `python3 where.py gN.html <thư mục src/app>` |

Biến môi trường của prof.cjs:

- `VIEWS=overview,camp-x16`: các góc nhìn; `overview` cố định camera.
- `UNCAP=1`: bỏ khoá 60 fps.
- `AB=1`: A/B theo cặp xen kẽ. Đi kèm `SEQ`, `WARM`, `SETTLE`, `MEAS`.
- `HEAP=1`: hồ sơ heap.
- `ALLOC=1`: dấu vết mảng lớn.
- `STATICS=1`: vật đứng yên.
- `TINY=1`: vật nhỏ theo cỡ màn hình.

Lưu ý khi đo:

- Đo A/B theo cặp, camera đứng yên, lấy trung vị.
- Đồng hồ GPU của ANGLE-Metal không đáng tin.
- Trong r160, `renderer.info` bị xoá sau lượt bóng. prof-instr.js đếm lượt bóng riêng.
- Đừng bật/tắt bóng bằng `material.needsUpdate`: làm vậy sẽ tách mảnh khỏi lô gộp (core/draw-batch.js). Hãy đổi `sun.castShadow`.
