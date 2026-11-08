# Bộ đo hiệu năng

Trang: `src/tools/debug/mkdbg.py <build> gN.html` ở `localhost:8794`, thư mục này cạnh trang. Playwright: tự lấy bản mới nhất trong `~/.npm/_npx`, hoặc đặt `PLAYWRIGHT_PATH`.

- `node prof.cjs gN.html <giờ> out.json` (env `MODELS_DIR`…).
- `boot`, `cull`, `veg`, `smthr.cjs`: `node <tệp> gN.html <giờ>`; `where.py`: dòng trang → nguồn.

Bẫy: A/B theo cặp, camera đứng yên, trung vị; đồng hồ GPU ANGLE-Metal sai; r160 xoá `renderer.info` sau lượt bóng; tắt bóng: `sun.castShadow`, đừng `material.needsUpdate` (tách lô gộp).
