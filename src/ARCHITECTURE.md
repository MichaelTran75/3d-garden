# Kiến trúc 3D garden — đọc trước khi sửa

Ghi chú khái niệm cho người (và AI) đọc lại mã sau một thời gian: cảnh chạy thế nào mỗi khung, vật lý, gộp lượt vẽ,
cận cảnh, hiệu năng, cách thử và các bẫy đã dính. Chi tiết từng tệp: `README.md` (bảng thư mục) và `src/app/manifest.txt`.

## 1. Mã nguồn và dựng trang

- Chỉ sửa trong `src/`. `src/app/**.js` được **nối nguyên văn** theo `src/app/manifest.txt` thành một hàm `build()` duy nhất:
  mọi tệp dùng chung một phạm vi biến, không `import`/`export`. Tệp sau dùng được hằng/hàm của tệp trước; khai báo hàm (`function f`)
  được kéo lên đầu nên gọi được từ tệp đứng trước. **Trùng tên biến giữa hai tệp = lỗi cú pháp** → đặt tên nháp có tiền tố riêng
  (`_aV`, `_rfE`, `_cuX`…).
- `python3 build.py --check`: dựng `index.html` + `css/` + `js/` (trang GitHub Pages) và `../3D garden.html` (bản một tệp để thử/gỡ lỗi),
  kiểm cú pháp bằng node, kiểm **ngân sách gzip** (`BUDGET_KB`: app.js 380 KB, tổng 400 KB).
- `js/app.js` trên web **bỏ mọi dòng chỉ có chú thích** (`// …`) → nhẹ hơn ~13%. Chú thích cuối dòng vẫn giữ. Bản một tệp giữ nguyên.
  ⇒ Đừng chèn `//` vào GIỮA một dòng có nhiều lệnh (phần sau bị nuốt) và đừng để dòng dữ liệu bắt đầu bằng `//` trong chuỗi `` ` ` ``.
- `./publish.sh "mô tả"`: kéo bản mới, dựng, commit, push; GitHub Actions dựng lại Pages. Wix nhúng trang Pages bằng iframe.

## 2. Một khung hình (loop/main-loop.js → main-loop-rest.js)

1. `dt = min(getDelta, 0.05) || 1/60` — khung đầu `Clock.getDelta()` trả 0; **không hệ nào được nhận dt = 0**.
2. `adaptResolution(ts)` (chỉ khi khung do rAF gọi), camera theo `theta/phi/radius/target`, gió cảnh, mây, nước…
3. Kỹ sư (engineer/loop-update.js): pha việc ghi **góc tay thẳng** → `engPoseEnd` (làm mượt) → `engFootIK` → `engSeatPost` →
   `updateFishingBite` (câu cá) → `engArmPost` (IK khuỷu/cổ tay) → `applePick.tick`.
4. Thú, côn trùng, `updateDrawBatches`, `fluids.update` (Worker).
5. `updateSky()` (mặt trời/trăng thật) → `nightSky.update` (nền trời đêm) → `fitSunShadow()` → `updateCloseLod()` → `renderer.render`.

## 3. Vật lý và thời gian

- **Bước cố định** (`core/fixed-step.js`, "Fix Your Timestep"): `fixedSteps(S, dt, h, step)` dồn dt vào `S.acc`, đủ `h` thì gọi
  `step(h)`; trả `alpha = dư / h` để **vẽ nội suy** giữa trạng thái bước trước và bước mới. Trần 0,1 s/khung (máy quá chậm thì
  cảnh chậm lại, không tính bù vô tận). Kết quả giống nhau ở 15, 60, 144 hình/giây (đã đo: phao treo 0,42 · lực dây 0,178 ở cả 3).
- Hệ đang dùng bước cố định:
  - Câu cá 120 Hz (`anglingPhysStep`): cần uốn → ngọn vật lý `_aTip` → cá giằng co → phao + mồi Verlet → lực dây `A.T`.
    Vẽ: `rodFlexPose(alpha)` (góc đoạn cần nội suy `X.thp → X.th`), `_aTipR` (ngọn để vẽ), `_dF/_dB` (phao/mồi = `Fp→F`, `Bp→B`),
    `_dM` (miệng cá `Mp→M`). Quán tính gốc cần `rodFlexAcc(rod, dt)` tính theo khung vì tay chỉ đổi dáng mỗi khung.
  - Đuôi chó/gấu mèo 240 Hz (`updateSoftTail`, vẽ `Q→P`), tai thỏ 120 Hz (`bunnyEars`).
  - Nước nông + khói ở Worker có bước riêng (60 bước/s) — xem README mục "Chất lỏng".
- Mẫu khi thêm hệ mới: giữ "trạng thái trước" (Verlet có sẵn `prev`), bước vật lý chỉ đọc trạng thái vật lý, phần vẽ đọc bản nội suy;
  đừng chia cho dt ở chỗ dt có thể = 0; gặp NaN thì tự đặt lại (như khối "NaN lọt vào" đầu `updateFishingBite`).
- Làm mượt tư thế dùng `engSpring` (dạng SmoothDamp, ổn định ở mọi dt) — không cần bước cố định.
- Vật lý "giả" cho rẻ: gió cây/cỏ trong shader (`nature/wind-physics.js`), lò xo cho chuyển động phụ, IK cho tay chân.

## 4. Tay kỹ sư (IK)

- Mọi pha ghi góc vai của **tay thẳng** (tâm bàn tay cách vai 0,66). `engArmSolve(e, i, dt)` giải IK 2 khớp chính xác cho 1 tay,
  mỗi khung 1 lần (`e.armDone`), `engArmPost` giải tay còn lại. Đích: `e.reachT[i]` (điểm thế giới), hướng bàn tay `e.handQ[i]`.
- **Đọc vị trí đồ cầm tay giữa khung chỉ đúng sau khi tay đó đã giải** (câu cá gọi `engArmSolve(e, 1)` trước khi đọc ngọn cần —
  thiếu bước này dây câu lệch khỏi cần 0,74 đv). Hoặc dùng `e.handW[i]` (tâm bàn tay cuối khung trước).
- Vector đích phải là vùng nhớ riêng (vd `A.rh`), không dùng biến nháp dùng chung bị ghi đè sau trong khung.

## 5. Vẽ và hiệu năng

- **Gộp lượt vẽ** (`core/draw-batch.js`): mảnh tĩnh và mảnh chuyển động cứng được gộp theo loại vật liệu thành `SkinnedMesh`
  (mỗi mảnh gốc = 1 xương); mảnh gốc ẩn ở lớp 31. Đổi màu/vật liệu/hình lúc chạy → mảnh tự tách ra vẽ riêng.
  - Vật dựng sẵn mà bị **mang đi xa** (que cá) → `userData.noBatch = true` (lô bị loại theo khung nhìn ở chỗ cũ).
  - Vật liệu có `onBeforeCompile` riêng thì không được gộp (tốn thêm lượt vẽ).
  - Mảnh có `userData.lodHi` (cận cảnh) được đổi hình tạm: tự vẽ khi dùng bản nhiều cạnh, lùi xa thì về lại lô.
- Lớp: 0 = cảnh; 2 = nền trời đêm (camera chính bật, camera phụ như bản đồ mặt chắn mưa không thấy); 31 = mảnh gốc đã gộp.
- Ngân sách tham khảo: ~250–450 lượt vẽ, ~1,8–2,4 triệu tam giác ở toàn cảnh; mật độ điểm ảnh tối đa 1,6.
- **Độ phân giải tự điều chỉnh** (`loop/close-up.js`, `DRES`): khung chậm (> 22 ms) 1,5 s → hạ mật độ điểm ảnh ×0,85; nhanh
  (< 17,8 ms) 4 s → nâng ×1,1; sàn 0,6. Hạ mà không nhanh lên ≥ 8% (màn 30 Hz, nghẽn CPU) → trả lại, thôi thử 60 s.
  Trang thử đặt `window.__resLock = true` để ảnh chụp giữ cỡ.
- Shader biên dịch song song trước khung đầu (`compileAsync`); vật tạo lúc dựng với `visible = true` thì được biên dịch sẵn.
- GitHub Pages không đặt được header COOP/COEP → **không có SharedArrayBuffer**. Worker trao dữ liệu bằng chuyển giao ArrayBuffer.

## 6. Cận cảnh

- `fitSunShadow()`: khung chụp bóng nắng ôm vùng đất đang thấy (cỡ theo zoom và góc chúc, nấc ×1,25, tâm bám lưới điểm bóng,
  độ lệch bias co theo cỡ điểm bóng). Toàn cảnh: 116 đv như cũ; zoom 22: ~10–16 đv ⇒ bóng sắc gấp ~10 lần.
  **Hướng nắng = `sun.position − sun.target.position`** — đích nắng di chuyển, đừng coi `sun.position` là hướng.
- `updateCloseLod()`: ~300 vật tròn (trụ, nón, cầu, xuyến, tiện, viên nang) quanh kỹ sư, khu cắm trại, xe đổi sang bản ×3 cạnh
  khi bán kính > 13 điểm ảnh (< 9 thì trả). Chỉ nhận hình còn nguyên như lúc tạo (so đỉnh với bản dựng lại từ `.parameters`),
  bỏ vật liệu `flatShading`. Thêm vùng mới: gọi `registerCloseLod(root)`.

## 7. Bầu trời

- `core/sky-sun-moon.js`: mặt trời/mặt trăng vị trí thật Pleiku, là vật 3D trên "vòm" bán kính 150 quanh đảo + đường chấm quỹ đạo
  trong ngày. `sceneDay/sunEq/moonEq/hourAngle/horiz/skyDir` dùng chung.
- `core/night-sky.js`: nền trời đêm vẽ trước cảnh, chiếu nổi tâm ở chân trời theo hướng camera (không theo zoom); sao Yale BSC5
  (`core/star-catalog.js`) quay theo giờ sao; Ngân Hà, chạng vạng, trăng, mây thật, sao băng + lịch mưa sao băng.
  API gỡ lỗi: `nightSky.U`, `nightSky.lim`, `nightSky.meteors`, `nightSky.spawn(row|null)`.

## 8. Thử và gỡ lỗi

- Bản gỡ lỗi: `make_debug.py` chèn `window.__dbg` (view, frames, snap, xray, engObj, clock…) và `window.__ev(code)` (đánh giá
  trong phạm vi `build()`). Tua nhanh: vá `clock.getDelta` trả `clock.__dt` (mặc định 1/20) + `window.__hourOverride` cho giờ cảnh.
  Các công cụ này nằm ở thư mục nháp của phiên làm việc (bị xoá giữa các phiên — dựng lại từ lịch sử phiên).
- `__dbg.frames(1)` gọi thẳng `loop()` (không có ts ⇒ bỏ qua bộ điều chỉnh độ phân giải). Pane trình duyệt ẩn ⇒ rAF dừng.
- Mẫu kiểm: chạy câu cá 150 s và so `fishLinePos` với vị trí khoen/ngọn thật (sai số phải = 0), đặt `clock.__dt = 0` một khung để thử
  NaN, đổi `clock.__dt` = 1/15, 1/60, 1/144 để thử tính độc lập tốc độ khung.
- `node --test ../tests/garden-flight.test.cjs`: mốc 14 đạt / 5 lỗi có sẵn từ trước.

## 9. Bẫy đã dính

- dt = 0 ở khung đầu → chia cho dt → NaN lan vĩnh viễn (mất đầu, mất thân cần).
- `new THREE.Color(hex)` ở r160 đã đổi sRGB → tuyến tính; đừng gọi thêm `convertSRGBToLinear()`.
- Đọc vị trí đồ cầm tay trước khi giải IK tay → lệch.
- Vật bị mang đi xa nhưng vẫn nằm trong lô gộp → biến mất khi lô bị loại theo khung nhìn.
- Dời đích nắng mà vẫn coi `sun.position` là hướng → sai hướng bóng/ánh vàng ngọn cỏ.
