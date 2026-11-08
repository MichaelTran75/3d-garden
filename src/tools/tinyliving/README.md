# Dựng lại `src/models/tinyliving.glb` (bồn cầu + kệ treo ấm trà)

Tham khảo: `tinylivingpack.glb` ("TinyLivingPack", Irene, Sketchfab, ghi CC-BY-4.0). Lưới tách từ The Sims 4 (`s4studio_mesh`) ⇒ chỉ đo kích thước + màu trên hình chiếu thẳng lưới 10 cm (CompactLavatory, OpenShelf); `tinyliving.glb` dựng hoàn toàn bằng khối của mình (lăng trụ chữ nhật bo góc côn, vành đùn, hộp, tiện tròn), không chép đỉnh / ảnh mẫu.

1. `devserver.py` (gốc = thư mục có `tlbuild.js`), mở 1 trang bất kỳ, console:

```js
{ const s = document.createElement('script'); s.src = '/tlbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await tlBuild();   // lav 724 · lid 156 · shelf 936 tam giác
await tlWrite();   // → shots/tinyliving.glb (~20 KB)
```

2. `shots/tinyliving.glb` → `src/models/`.

Nút: `lav` (gốc giữa đáy sát sàn, trước −X, két +X, ngang Z), `lid` (gốc = bản lề, nắp úp về −X), `shelf` (gốc giữa mép sau đáy tầng dưới, lưng z = 0, trước +Z). Đặt vào xe: `src/app/van/interior/tiny-living.js`.
