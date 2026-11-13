# Bộ đo RAM

Trang: `src/tools/debug/mkdbg.py <build> gN.html`. Playwright: bản mới nhất trong `~/.npm/_npx`, hoặc `PLAYWRIGHT_PATH`.

- `AUD=<repo> VW=1512 VH=860 DSF=2 node ramshot.cjs gN.html <giờ> inv.js <thư mục ra>` ⇒ dòng `{"shots"…}` trên stdout
- `ramshot.cjs`: nạp `hook.js` trước trang, chạy thân hàm đầu dò, GC × 2 qua CDP, rồi `heap` (`usedSize` = JS heap, `backingStorageSize` = ArrayBuffer), `samp` (lấy mẫu heap, chỉ vật còn sống: MB theo `hàm:dòng < hàm gọi:dòng`), `gpu`, `arr`
- `hook.js`: bọc WebGL (bộ đệm, ảnh, renderbuffer: `__gpuSum()`); Proxy trên hàm tạo mảng kiểu + ArrayBuffer ghi cấp phát ≥ 64 KB kèm WeakRef + dòng ngăn xếp (`__arr`, `__arrSum()`)
- `inv.js`: hình học theo tên lưới (GPU / bản CPU còn giữ), ảnh, canvas đã thu / chưa thu, `memTrim.n`, lá rêu đã bỏ mảng
- `terr.js`: InstancedMesh, `terrainMeshes`, mảng dài bội số `GX × GZ` hoặc lưới có lề, DataTexture
- Số dòng = dòng của trang debug (`sed -n 'Np' gN.html`)

Bẫy: canvas đã thu (`__mt`) vẫn báo cỡ gốc; `ps` theo tiến trình lẫn tiến trình khác ⇒ không dùng; Worker nằm ngoài số đo; mảng < 64 KB chỉ vào tổng `backingStorageSize`; so trước / sau: cùng cỡ khung, cùng giờ, cùng số khung chạy.
