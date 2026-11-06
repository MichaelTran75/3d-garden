# Học từ game engine — vườn 3D cần cải thiện gì

Nghiên cứu 06/11/2026 theo yêu cầu G: "Do research and study about game engine, find out what we need to improve our garden".
Hai phần: (1) đo vườn thật (bản dựng 06/11 06:30, 178 mảnh mã) trên Mac mini M4 của G; (2) tra cứu 93 nguồn: three.js r187, Unity, Unreal, Godot,
Safari/WebKit, Wix. Bản tra cứu đầy đủ (tiếng Anh) ở `game-engine-study-web.md`; số [n] trong bài là số nguồn ở đó. Bộ đo ở `perf-probe/`.

## Tóm tắt

- **Giữ three.js + WebGL.** Không đổi engine, chưa sang WebGPU (mục 6).
- **Trên M4, khung hình nghẽn ở GPU vì ba thứ nhân với nhau:**
  - cây rừng có hàng trăm nghìn tam giác nhỏ hơn 1 điểm ảnh;
  - bóng nắng vẽ lại mỗi khung;
  - 10 đèn điểm/chiếu nằm trong shader của mọi vật.

  Số điểm ảnh và số draw call **không** phải nút thắt.
- **Ba việc nhỏ có lợi lớn nhất:**
  - LOD cây rừng theo nấc zoom: ẩn hẳn rừng nhanh hơn 25%.
  - Bóng nắng vẽ thưa: tắt hẳn bóng nhanh hơn 23%.
  - Bể đèn cố định: ẩn cả 10 đèn nhanh hơn 16%.
- **Mở trang mất 4,5 s, trong đó 2,1 s là rải nấm bằng raycast vét cạn.** Đổi sang bản đồ độ cao là gần như hết khoản này.
- **Vườn đã có khá nhiều kỹ thuật của engine (mục 4).** Phần còn thiếu chủ yếu là LOD cho vật lớn, cache bóng, ngân sách đèn và bậc chất lượng.

## 1. Đo thế nào

- **Bản đo:** bản dựng mới nhất, chạy trên M4 bằng Chromium headless + ANGLE Metal.
  - Khung 1280×800 @2x; trần pixel ratio 1,42 ⇒ 2,2 MP, MSAA 4×.
  - Safari dùng cùng lớp ANGLE → Metal, nên phía GPU tương tự. Chi phí CPU mỗi lệnh vẽ của Safari chưa đo (mục 7).
- **Đo khung hình thật:** requestAnimationFrame tự chạy. Bộ đo gắn vào:
  - từng lượt worldTick, renderer.render, lượt bóng và cập nhật ma trận;
  - từng lệnh vẽ: loại, cỡ trên màn hình, số tam giác;
  - hồ sơ CPU (CDP) và dấu vết cấp phát mảng lớn.
- **Độ tin cậy:**
  - Lúc đo có trình duyệt headless của phiên khác chạy song song, nên số tuyệt đối lệch ±20%. Vì vậy A/B đo theo cặp liền nhau, camera đứng yên, lấy trung vị.
  - Đồng hồ GPU (timer query) của ANGLE-Metal cho số vô lý (GPU ms > khung ms), nên em thay bằng A/B tắt từng phần.
  - Với three.js r160, `renderer.info` bị xoá sau lượt bóng, nên lệnh vẽ của lượt bóng được đếm riêng.

## 2. Số đo chính (toàn cảnh 10:00, camera đứng yên)

| Hạng mục | Số đo |
|---|---|
| Thời gian khung (bỏ khoá 60 fps) | ~14,5 ms (≈ 69 fps). Khi camera tự xoay, có lúc p95 33 ms, p99 50 ms |
| Toàn bộ AI + thú + côn trùng (mọi lượt worldTick) | 0,8–1,7 ms/khung. Nặng nhất: bò 0,3 · ong 0,2 · bướm 0,13 · chim sẻ 0,13 ms |
| CPU ra lệnh vẽ (renderer.render) | 9–15 ms/khung, gồm lượt bóng 2–7,6 ms và cập nhật ma trận ~1 ms |
| Draw call | 1.120 lượt chính + 428 lượt bóng |
| Thành phần lượt chính | 426 mesh đơn · 285 mesh trong suốt · 173 instanced · 109 lô gộp · 83 nét · 46 sprite |
| Lượt vẽ mesh nhỏ hơn 1 điểm ảnh | 508 ở lượt chính, 143 ở lượt bóng |
| Tam giác | 2,6 triệu lượt chính + 1,56 triệu lượt bóng |
| Vật trong cảnh | 5.913 Object3D, trong đó 3.515 đứng yên 10 s vẫn tính lại ma trận · 1.522 vật liệu (2.761 mesh Lambert) · 161–189 chương trình shader |
| Đèn | 1 nắng (đổ bóng) + 7 đèn điểm + 3 đèn chiếu, luôn có trong mọi shader. Ban ngày 5 đèn cường độ 0 vẫn được tính |
| Mở trang | ~4,5 s CPU tới khung đầu. Nấm (nature/fungi.js) 2,08 s · sky-shade 0,40 · thảm rêu 0,27 · đồng cỏ patchK 0,26 |
| Heap JS | ~300 MB lúc nạp → ~390 MB khi chạy. Mảng ≥ 256 KB còn sống 56 MB (đã cấp tổng 136 MB) |
| GPU (Apple Silicon: VRAM = RAM) | hình học ~106 MB, thêm bản sao CPU 61 MB · texture ~82 MB (204 cái, không nén) · bộ đệm MSAA 4× ~71 MB · bóng 2048² |
| Ngân sách mã | app.js 714/750 KB gzip, tổng 736/775. Kỹ sư 208 · thú 172 · thiên nhiên 105 · core 88 · xe 83 · thế giới 71 KB |

## 3. A/B: tắt từng phần thì thời gian khung đổi bao nhiêu

| Tắt / đổi | Toàn cảnh | Cận trại ×16 |
|---|---|---|
| Ẩn cây rừng instanced (12 kiểu, 141 cây, ~3.000 tam giác/cây) | −25% (14,8 → 11 ms) | — |
| Tắt bóng nắng | −23% | −22% |
| Ẩn 10 đèn điểm/chiếu | −16% | −5% |
| Pixel ratio 1,42 → 1,0 | 0% | 0% |
| Ẩn 671 vật nhỏ hơn 1 px (draw call −41%) | 0% | — |
| Tắt bóng của cây rừng | ~0% | — |
| Vẽ bóng mỗi 2 khung | CPU lượt bóng 5,2 → 1,1 ms (mỗi 4 khung: 0,5 ms) | 2,6 → 1,45 ms |

**Đọc số đo:**

- **Rừng.**
  - Ẩn rừng được −25%, nhưng tắt bóng của rừng ~0% và hạ độ phân giải 0%. Vậy chi phí nằm ở việc tô màu từng tam giác nhỏ bằng shader đầy đủ (10 đèn, bóng mềm, vân vỏ).
  - GPU tô màu theo ô 2×2 điểm ảnh, nên tam giác dưới 1 điểm ảnh vẫn tốn trọn một ô. Lượt bóng dùng shader độ sâu rẻ, nên gần như không tốn.
  - Rừng lại trong suốt 50%, nên không loại sớm được theo độ sâu.
- **Ba chi phí nhân với nhau.** Số ô 2×2 (tức số tam giác) × số đèn trong vòng lặp × số mẫu bóng mềm. Giảm thừa số nào cũng có lợi.
- **Draw call.**
  - CPU ra lệnh vẽ chạy song song với GPU, nên bớt 41% draw call không đổi khung trên M4.
  - Khi GPU nhẹ đi (5.1–5.3), CPU (~10 ms) sẽ thành nút thắt. Lúc đó mới đến lượt gộp hay ẩn đồ nhỏ.
  - Điện thoại có CPU yếu hơn nên sẽ gặp nút thắt này sớm hơn.
- **AI rẻ.** AI + thú chỉ 0,8–1,7 ms, còn rộng chỗ cho hành vi mới.

## 4. Vườn đã có gì giống engine

| Kỹ thuật engine | Trong vườn |
|---|---|
| Vòng lặp hệ thống theo thứ tự (Unity PlayerLoop, UE tick groups) | `worldTick` theo lượt: thú, đèn, côn trùng, gió, con trỏ, âm thanh… (core/world.js) |
| Subsystem / service locator | `worldJoin` / `worldServe`: va chạm, ngày đêm, lô vẽ, flow field, bay, hover, việc |
| Smart object (một phần) | `worldPlace(name, {face, tick, join, hover, job})` |
| Static batching | core/draw-batch.js: gộp mảnh tĩnh thành SkinnedMesh, mỗi mảnh 1 xương |
| LOD theo cỡ trên màn hình, có trễ | Vật tròn nhỏ đổi sang bản nhiều cạnh khi bán kính > 13 px, lùi < 9 px thì trả lại (loop/close-up.js mục 2) |
| Shadow LOD | Dương xỉ + nấm chỉ đổ bóng khi zoom gần (close-up.js mục 4, `smallShadow`) |
| Khung bóng ôm vùng nhìn | Nấc ×1,25, tâm bám lưới điểm bóng (close-up.js mục 1) |
| Dynamic resolution | Dưới ~45 fps thì hạ ×0,85; nếu không nhanh lên thì trả lại và thôi thử 60 s (close-up.js mục 3) |
| Dừng vẽ khi khuất | `visibilitychange` + IntersectionObserver (loop/lifecycle.js) |
| Biên dịch shader trước | `compileAsync` + KHR_parallel_shader_compile trước khung đầu (loop/main-loop-rest.js) |
| Mô phỏng trên luồng phụ | Gió Navier–Stokes → texture `uWMap` mà cây, cỏ, khói cùng đọc (nature/wind-field.js, nature/fluids.js); mây + mưa |
| Vật lý / dẫn đường | Bước cố định 120 Hz, va chạm voxel kiểu Recast, flow field, đuôi XPBD |
| Quản lý bộ nhớ | core/mem-trim.js đã thả 664 thuộc tính CPU sau khi đưa lên GPU |
| Thời gian thật | Giờ Sydney, thời tiết thật, lịch kỹ sư theo thứ trong tuần |

## 5. Việc nên làm, xếp theo lợi ích ÷ công sức

Công: S = nhỏ (≤ 1 buổi) · M = vừa (1–2 ngày) · L = lớn. "Đo" = A/B ở mục 3; "ước" = suy ra, chưa đo.

| # | Việc | Học từ | Lợi | Công | Tệp chính |
|---|---|---|---|---|---|
| 1 | LOD cây rừng theo nấc zoom | Unity LOD Group, Godot visibility range, UE HLOD | Đo: ẩn hẳn rừng −25%. Ước: −15–20% | S–M | nature/forest.js |
| 2 | Bóng nắng vẽ thưa + bóng đĩa cho thú nhỏ | HDRP shadow update mode, UE cached shadows, capsule shadows | Đo: CPU lượt bóng 5,2 → 1,1 ms. Ước: −5–10% khung | S | loop/close-up.js, core/boot.js |
| 3 | Bể 3–4 đèn cố định; ban ngày 0 đèn | Giới hạn đèn mỗi vật (Unity, Godot) | Đo: ẩn 10 đèn −16% toàn cảnh, −5% trại | M | 6 tệp tạo đèn (5.3) |
| 4 | Nấm: raycast → bản đồ độ cao | BVH / height field | Đo: −2,1 s trên 4,5 s mở trang | S | nature/fungi.js |
| 5 | RAM: thả lưới tạm, bản sao CPU; texture ASTC | Unity "Read/Write" tắt; KTX2 | ~30–90 MB heap; texture từ tệp nhẹ 4–8 lần | S / M | nature/moss-lawn.js, nature/ferns.js, core/mem-trim.js |
| 6 | HUD đo `?prof` | Unity Profiler, UE `stat unit` | Công cụ cho mọi việc khác | S | src/tools/debug |
| 7 | Bậc chất lượng tự chọn | UE Scalability, Animation Budget Allocator | Quyết định độ mượt trên điện thoại | S–M (sau 1–3) | loop/close-up.js |
| 8 | Safari trong iframe Wix: kiểm 30 fps, lớp "chạm để vào" | Đặc thù web | 30 → 60 fps nếu đúng | S | loop/lifecycle.js |
| 9 | Ẩn đồ nhỏ hơn 1 px ở zoom xa | Godot visibility range, UE cull distance | M4: 0%. Có lợi sau 1–3 và trên điện thoại | S–M | loop/close-up.js |
| 10 | Đồ chắc chắn tĩnh thì không tính lại ma trận | Cờ Static | ~1 ms CPU | S | nhiều tệp |
| 11 | Âm thanh nền theo mô phỏng | Ambient bed theo sim | Sống động | M | mới |
| 12 | Lưu dấu vườn + chạy bù giờ | Animal Crossing, Stardew | Vườn liên tục giữa các lần ghé | S–M | mới |
| 13 | Smart object có slot + bus tín hiệu | The Sims, UE Smart Objects, UE AI Perception | Sống động | M | core/world.js |
| 14 | Inertialization; IK chân cho thú gần camera | GDC 2018 Inertialization | Chuyển động mượt | S–M | animals/* |
| 15 | Neutral/AgX + LUT; lưới probe SH × màu trời | Khronos PBR Neutral, Unity APV | Màu và ánh sáng đẹp hơn | M, sau khi nâng three.js | core/boot.js |

### 5.1 LOD cây rừng theo nấc zoom

- **Hiện tại:**
  - 141 cây rừng gồm 12 biến thể `recTree` (nature/forest.js, `vegPools['recbranch0–11']`), mỗi cây 2.400–3.400 tam giác.
  - Vỏ cây là Lambert trong suốt 50%, có gió và vân vỏ.
  - Ở toàn cảnh mỗi cây chỉ vài chục điểm ảnh.
- **Engine:** Unity LOD Group; Godot visibility range (khoảng bắt đầu/kết thúc, vùng trễ, "visibility parent" cho HLOD) [28]; Unreal HLOD.
- **Cách làm:**
  - Camera chính là camera trực giao (core/boot.js), nên ở một mức zoom mọi cây có cùng cỡ trên màn hình. Không cần tính riêng từng cây.
  - Dựng thêm 12 bản thấp: cùng khung cành nhưng `taperTube` ít cạnh và ít đốt hơn, khoảng 300–500 tam giác.
  - Đổi geometry của 12 InstancedMesh theo nấc zoom, có trễ như close-up.js mục 2.
  - Nếu sau này có camera phối cảnh thì mới cần chia từng cây theo khoảng cách.
- **Rủi ro:** lúc đổi bản có thể thấy giật hình. Ngưỡng nên đặt ở cỡ cây còn nhỏ trên màn hình, và cần chụp ảnh so sánh.

### 5.2 Bóng nắng vẽ thưa

- **Hiện tại:**
  - Bóng 2048² ôm vùng nhìn và được vẽ lại mỗi khung. `renderer.shadowMap.autoUpdate` chỉ tạm tắt trong các lượt vẽ phụ (lens, mây, drone).
  - Mặt trời đi 0,25° mỗi phút.
- **Engine:** HDRP Shadow Update Mode (Every Frame / On Enable / On Demand) [32]; Unreal cache trang bóng tĩnh [33]; bóng capsule cho nhân vật [34]. Trong three.js: `autoUpdate = false` + `needsUpdate` [35].
- **Cách làm:**
  - Tắt `autoUpdate`. Chỉ vẽ lại khi:
    - khung bóng đổi nấc hoặc dời ô (lúc đó vẽ ngay để bóng không lệch);
    - mặt trời lệch quá ngưỡng;
    - có vật đổ bóng đang động trong khung (bò, chó, kỹ sư, cây lay): vẽ mỗi 2 khung, trễ ≤ 1 khung, mắt không thấy.
  - Thú nhỏ (gà, chim sẻ, ong, bướm) dùng bóng đĩa mờ thay vì đổ bóng thật, tiếp nối `smallShadow`.
  - Thử thêm `PCFShadowMap` thay `PCFSoftShadowMap`. Từ r182 three.js cho PCFSoft ngừng dùng (deprecated) vì PCF cũng đã mềm [7]. Cần ảnh so sánh.
- **Lợi:**
  - Đo: CPU lượt bóng giảm hơn một nửa.
  - Ước GPU: tắt hẳn bóng được −23%, nhưng con số đó gồm cả phần lấy mẫu bóng trong shader, mà phần này vẫn còn khi vẽ thưa. Vì vậy chỉ ước −5–10%.

### 5.3 Bể đèn cố định

- **Hiện tại:**
  - Có 10 đèn: lồng đèn (core/axes-pin-bake.js); đèn bàn học, đèn chiếu và quầng laptop trong caravan (van/interior/caravan.js); đèn đường (world/street-lamps.js); lửa trại (camp/chairs-lantern-fire.js); bóng đèn chuồng bò (animals/cows/herd-hut.js); lò chiminea (camp/chiminea.js).
  - three.js đưa **mọi** đèn đang hiện, kể cả đèn cường độ 0, vào vòng lặp shader của mọi vật Lambert/Phong/Standard.
- **Engine:** forward rendering giới hạn số đèn tính theo điểm ảnh cho mỗi vật (Unity: Pixel Light Count / URP Per Object Limit; Godot Mobile cũng có giới hạn). Đèn ít quan trọng thì tính rẻ hoặc làm giả.
- **Cách làm:**
  - Bể 3–4 PointLight luôn hiện. Mỗi khung gán chúng cho các nguồn gần tâm nhìn hoặc sáng nhất.
  - Nguồn còn lại làm giả bằng emissive + quầng sprite.
  - Ban ngày bể có 0 đèn.
- **Rủi ro:**
  - Đổi số đèn làm three.js biên dịch lại shader của mọi vật liệu, gây khựng lúc chạng vạng.
  - Cách tránh: lúc mở trang, biên dịch trước cả bộ ngày lẫn bộ đêm bằng `compileAsync`. Mỗi vật liệu giữ được cả hai chương trình, nên đổi qua lại không phải biên dịch lại.
  - Đổi lại: số chương trình shader gần gấp đôi.

### 5.4 Nấm: raycast → bản đồ độ cao

- **Hiện tại:**
  - `ground()` trong nature/fungi.js raycast thẳng xuống `base` (thân, rễ cổ thụ, đá; hàng trăm nghìn tam giác, không có BVH).
  - `spots()` thử tới 500 lần mỗi đợt. Tổng 2,08 s CPU lúc mở trang.
- **Engine:** truy vấn va chạm luôn đi qua cấu trúc tăng tốc (BVH, height field).
- **Cách làm:**
  - Chụp bản đồ độ cao của `base` một lần: camera trực giao nhìn xuống, đặt đúng độ cao xuất phát của tia (C.y + 1,2, tầm xa 2), nên kết quả trùng với raycast.
  - Hoặc rasterize tam giác vào lưới ~1 cm.
  - Pháp tuyến lấy từ chênh lệch giữa các ô lân cận.
  - Không cần thêm thư viện BVH; ngân sách mã chỉ còn 36 KB.

### 5.5 RAM

- **Thả bộ nhớ tạm sau khi dựng:**
  - Thảm rêu giữ lại lưới voxel 180×50×18 (Q, D, T, S ≈ 21 MB). Cần kiểm lúc chạy không còn dùng rồi thả.
  - Dương xỉ giữ ~11 MB mảng hình học phía CPU.
- **Mở rộng core/mem-trim.js:** thả nốt bản sao hình học CPU (61 MB) của các mesh không cần raycast, va chạm hay sửa đỉnh.
- **Texture 82 MB (204 cái, không nén):**
  - Phần từ tệp GLB (gà, gấu mèo, drone, tuabin, dương xỉ, sách) nén được ASTC trong KTX2:
    - r160 nạp thẳng ASTC, không cần Basis (527 KB wasm); chỉ cần zstddec 17 KB gzip [91][93];
    - 97,8% phiên Safari có ASTC [61];
    - nhẹ hơn trên GPU 4–8 lần [59].
  - Phần vẽ bằng mã (canvas) không nén trước được. Khi được thì dùng 1 kênh hoặc cỡ nhỏ hơn.
- **Bối cảnh:**
  - WebKit bắt đầu dọn bộ nhớ quanh 1–1,5 GB trên macOS [63].
  - iPhone chưa có số chính thức; theo kinh nghiệm khoảng 1,5–3 GB [64].
  - iframe Wix có thể dùng chung tiến trình với trang Wix (chưa chắc) [65].

### 5.6 HUD đo hiệu năng (`?prof`)

- **Nội dung:** draw call lượt chính/bóng, tam giác, ms từng lượt worldTick (trung bình 60 khung), `renderer.info.memory`, heap. Lấy từ `perf-probe/prof-instr.js`.
- **Đo GPU trên Safari:**
  - Timer GPU gần như không có: chỉ 0,22% phiên có `EXT_disjoint_timer_query_webgl2` [54]. Vì vậy đo kiểu A/B như ở đây.
  - Trên máy G có thể bật cờ "WebGL Timer Queries" của Safari [55].

### 5.7 Bậc chất lượng

- **Hiện có:** độ phân giải tự điều chỉnh. Đúng kiểu dynamic resolution, nhưng trên M4 vườn không nghẽn ở điểm ảnh.
- **Engine:** UE Scalability gồm bóng, hậu kỳ, texture, hiệu ứng, cây cỏ [48]; Animation Budget Allocator giới hạn ms cho hoạt ảnh [49].
- **Cách làm:**
  - Chọn 3 bậc sau 2–3 s đo khung, vì Safari không cho biết GPU hay RAM [50][51].
  - Núm vặn: LOD rừng, nhịp bóng, số đèn trong bể, mật độ cỏ, số thú/côn trùng, nhịp AI của thú ở xa (10–15 Hz).

### 5.8 Safari trong iframe Wix

- **Vấn đề:**
  - WebKit giữ requestAnimationFrame ở 30 fps cho iframe khác nguồn cho tới khi người xem chạm vào khung [53]. Vườn (github.io) nhúng trong Wix chính là iframe khác nguồn.
  - Âm thanh cũng chỉ mở sau lần chạm đầu [68].
- **Cách làm:**
  - Đo trước trên trang Wix thật bằng Safari: nhịp rAF trước và sau khi bấm.
  - Nếu đúng: thêm lớp "chạm để vào", hoặc gợi ý kéo xoay ngay từ đầu. Lần chạm đó mở luôn âm thanh (5.11).

### 5.9–5.10 Đồ nhỏ và đồ tĩnh

- **Ẩn đồ nhỏ hơn 1 px ở zoom xa:**
  - Có 671 vật như vậy. Ẩn chúng bớt 41% draw call nhưng khung trên M4 không đổi.
  - Chỉ có lợi sau 5.1–5.3 và trên điện thoại.
  - Dùng lại khung LOD vật tròn của close-up.js, có trễ.
  - Cần ảnh so sánh có đối chứng (lần thử hôm nay chưa có).
- **Không tính lại ma trận cho đồ tĩnh:**
  - 3.515 vật đứng yên vẫn tính lại ma trận mỗi khung, tốn ~1 ms.
  - Rủi ro: vật bị dời bằng mã mà quên `updateMatrix()` sẽ đứng sai chỗ. Vì vậy chỉ áp cho nhóm chắc chắn tĩnh (nhà, hàng rào, đá), không áp tự động.

### 5.11 Âm thanh nền theo mô phỏng

- **Hiện có:** chỉ radio dùng Web Audio.
- **Cách làm:**
  - Tiếng gió theo bản đồ `uWMap`, mưa theo thời tiết thật, tiếng nước theo khoảng cách tới sông.
  - HRTF chỉ cho 2–3 nguồn gần; còn lại dùng equal-power [67].
  - Tránh tệp PCM dài: một phút stereo giải nén ~23 MB [67]. Dùng âm tổng hợp hoặc vòng lặp ngắn.
- **Điều kiện:**
  - Cần 5.8 để mở âm thanh.
  - Trên iOS, công tắc im lặng tắt Web Audio trừ khi đặt `audioSession.type = 'playback'` [72][73].

### 5.12 Lưu dấu vườn giữa các lần ghé

- **Ràng buộc:**
  - Safari chia riêng và xoá storage của iframe bên thứ ba ("partitioned … ephemeral") [86].
  - Storage do script ghi bị xoá sau 7 ngày không tương tác [86].
  - Vì vậy không dựa vào localStorage.
- **Cách làm:**
  - Trạng thái = seed + giờ thật + thời tiết + vài thay đổi nhỏ (luống đã gieo, táo đã hái, cỏ đã cắt).
  - Mở trang thì chạy bù phần thời gian người xem vắng mặt (catch-up).
  - Thay đổi nào cần giữ lâu thì gửi Wix Velo qua `postMessage` [89].
- **Engine:** Animal Crossing cho thời gian trôi khi người chơi vắng [87]; lịch Stardew đi từ giờ → bản đồ → ô → hoạt ảnh [88].

### 5.13–5.15 Sống động hơn, đẹp hơn

- **Smart object + bus tín hiệu:**
  - Đồ vật quảng cáo nhu cầu nó đáp ứng (bếp, ghế, máng, thùng rác) và có chỗ đặt trước, để hai con không tranh một chỗ.
  - Bus tín hiệu (chó sủa, bước chân, máy cắt cỏ) có bán kính và phai dần. Nhờ đó chim bay lên, hươu ngẩng đầu, gà chạy.
  - Học từ: The Sims [74], UE Smart Objects [75], UE AI Perception (hearing / noise event) [76].
- **Chuyển động:**
  - Inertialization: chuyển tư thế bằng cách tắt dần độ lệch, thay vì trộn hai tư thế [78].
  - IK chân chỉ cho thú gần camera.
- **Màu (cần nâng three.js):**
  - Neutral tone mapping (r162) giữ đúng màu gốc [43].
  - AgX của r160 thiếu bước gamut mapping, bước này có từ r161 [8].
  - LUT 3D theo giờ trong ngày.
- **Ánh sáng gián tiếp (r186):**
  - `LightProbeGridWebGL`: nướng lưới probe SH một lần dưới trời trắng, mỗi khung nhân với màu trời. Đây là mẹo sky occlusion của Unity APV [4][37].
  - Nhờ đó thú, người, xe nhận ánh trời đúng với chỗ đứng.
- **Khử răng cưa:** giữ MSAA 4×. TAA của WebGLRenderer không có vector chuyển động, nên cỏ lay sẽ bị bóng mờ [7].

## 6. Không nên làm lúc này

- **Đổi engine (xuất web từ Unity / Godot / Unreal):**
  - Bỏ 178 mảnh mã đang chạy.
  - Bản xuất web của Unity và Godot nặng hơn nhiều so với 750 KB hiện tại, không hợp iframe Wix. Unreal đã bỏ xuất HTML5 chính thức từ bản 4.24.
  - Godot vẫn hợp với app Jade trên máy; đó là chuyện khác.
- **WebGPURenderer:**
  - Vẫn còn "experimental" [2].
  - Với nhiều mesh, CPU chậm hơn WebGL khoảng 2 lần: 4.000 mesh mất 9,7 ms thay vì 4,5 ms [14][15].
  - `onBeforeCompile` (vườn dùng 28 chỗ) và `ShaderMaterial` (22 chỗ) phải viết lại bằng TSL [2][7].
  - Safari chỉ có WebGPU từ macOS / iOS 26. Máy cũ hơn sẽ chạy đường dự phòng chậm nhất [17][18].
- **Nâng three.js r160 → r187 ngay:** nên làm một đợt riêng, có ảnh so sánh trước/sau. Những chỗ phải sửa [7]:
  - bản vá shader chạm vào bóng/env (r182);
  - `envMapIntensity` → `environmentIntensity` (r163);
  - `setViewport` của render target đổi cách tính (r187), đụng tới lens DOF;
  - `Sky` mất gamma cũ (r183).
- **Instancing thú / BatchedMesh** (hai mục đầu bảng trong bản tra cứu web):
  - Draw call không phải nút thắt trên M4: ẩn 41% draw call vẫn 0%.
  - Thú + AI chỉ tốn 0,8–1,7 ms.
  - core/draw-batch.js đã gộp đồ tĩnh.
  - Xét lại khi có số đo trên iPhone.
- **Đa luồng bằng SharedArrayBuffer:**
  - Cần cả chuỗi khung được cross-origin isolated, kể cả trang Wix, nên không làm được [81].
  - Cách hiện tại (chuyển ArrayBuffer qua lại với luồng phụ, như fluids và mây) là đúng.

## 7. Chưa biết, cần đo thêm

- Safari thật: chi phí mỗi draw call; có bị giữ ở 30 fps trong iframe Wix không.
- iPhone: thời gian khung, trần RAM.
- Texture: bao nhiêu MB đến từ tệp (nén ASTC được), bao nhiêu MB vẽ bằng mã.
- Bóng vẽ thưa: thời gian khung đổi bao nhiêu (mới đo phần CPU).
- Ẩn vật nhỏ hơn 1 px: ảnh so sánh có đối chứng.

## 8. Bộ đo (`perf-probe/`)

Xem `perf-probe/README.md`. Chính là `prof.cjs` + `prof-instr.js`: đo khung thật, ms từng lượt, draw call theo loại và cỡ, A/B theo cặp, thống kê RAM.
Có thể đưa vào src/tools/debug làm HUD `?prof` (5.6).

## Nguồn chính

Số giữ theo `game-engine-study-web.md` (93 nguồn).

- [2] three.js WebGPURenderer manual — https://threejs.org/manual/pages/webgpurenderer.html
- [4] LightProbeGridWebGL — https://threejs.org/docs/pages/LightProbeGridWebGL.html
- [7] three.js Migration Guide — https://github.com/mrdoob/three.js/wiki/Migration-Guide
- [8] AgX r160 thiếu gamut mapping — https://discourse.threejs.org/t/is-agx-tonemapping-implemented-correctly/60609
- [14] WebGPU chậm hơn WebGL khi nhiều mesh — https://github.com/mrdoob/three.js/issues/30560
- [15] Đo 4.000 mesh r183 — https://discourse.threejs.org/t/webgpurenderer-2x-slower-cpu-and-5-10x-slower-first-frame-than-webglrenderer-on-many-mesh-scenes-r183-same-on-both-backends/91904
- [17] Safari 26 WebGPU — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
- [28] Godot visibility ranges (HLOD) — https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html
- [32] HDRP shadow update mode — https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@16.0/manual/shadow-update-mode.html
- [34] UE capsule shadows — https://dev.epicgames.com/documentation/en-us/unreal-engine/capsule-shadows-overview-in-unreal-engine
- [35] three.js LightShadow — https://threejs.org/docs/pages/LightShadow.html
- [37] Unity APV sky occlusion — https://docs.unity.com/en-us/engine/current/manual/lighting-overview/lighting/probevolumes/probe-volumes-change-lighting-at-runtime/skyocclusion
- [43] Khronos PBR Neutral — https://www.khronos.org/news/press/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products
- [48] UE Scalability — https://dev.epicgames.com/documentation/en-us/unreal-engine/scalability-reference-for-unreal-engine
- [49] UE Animation Budget Allocator — https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-budget-allocator-in-unreal-engine
- [53] WebKit: rAF 30 fps trong iframe khác nguồn chưa chạm — https://bugs.webkit.org/show_bug.cgi?id=170534
- [59] Định dạng texture cho web — https://www.donmccurdy.com/2024/02/11/web-texture-formats/
- [61] ASTC trên Safari — https://web3dsurvey.com/webgl2/extensions/WEBGL_compressed_texture_astc
- [63] WebKit MemoryPressureHandler — https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WTF/wtf/MemoryPressureHandler.cpp
- [67] Hiệu năng Web Audio — https://padenot.github.io/web-audio-perf/
- [74] AI của The Sims — https://gameindustrylibrary.com/documents/gmtk-the-genius-ai-behind-the-sims
- [75] UE Smart Objects — https://dev.epicgames.com/documentation/en-us/unreal-engine/smart-objects-in-unreal-engine---overview
- [76] UE AI Perception — https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine
- [78] Inertialization (GDC 2018) — https://gdcvault.com/play/1025165/Inertialization-High-Performance-Animation-Transitions
- [81] COOP/COEP — https://web.dev/articles/coop-coep
- [86] WebKit tracking prevention (storage) — https://webkit.org/tracking-prevention/
- [89] Wix HTML component onMessage — https://dev.wix.com/docs/velo/api-reference/$w/html-component/on-message
- [91] KTX2Loader r160 (nạp thẳng ASTC) — https://unpkg.com/three@0.160.0/examples/jsm/loaders/KTX2Loader.js
