# Kiến trúc 3D garden — chỉ mục (đọc trước khi sửa)

Tệp này là **chỉ mục ngắn** (≤ 300 dòng — `build.py --check` báo khi vượt). Chi tiết từng khu ở `docs/architecture/<khu>.md` (mỗi tệp ≤ 40 KB, mục lục tự sinh
ghi cỡ từng mục). Bảng thư mục: `README.md`; thứ tự nối mã: `src/app/manifest.txt`. Tài liệu ghi hiện trạng + bẫy; lịch sử ở git.

## Cách đọc (người và AI) — tiết kiệm ngữ cảnh

1. Đọc hết tệp này.
2. Tra **Bản đồ** → mở ĐÚNG 1 tệp khu, đừng đọc cả thư mục `docs/architecture/`. Đọc mục lục đầu tệp rồi chỉ đọc mục cần
   (`grep -n "^## " docs/architecture/<khu>.md` → đọc từ dòng đó).
3. Thư mục mã có README thì đọc trước khi mở tệp mã: `src/app/engineer/README.md`, `src/app/van/README.md` (muốn sửa gì → mở tệp nào).
4. Gặp `mục "X"` trong mã / tài liệu: `grep -rn "^## X" docs/architecture src/ARCHITECTURE.md`.
5. Việc có tài liệu thiết kế riêng (bảng dưới Bản đồ) → đọc tài liệu đó trước, đừng đoán từ mã.

## Bản đồ: khu → mã → tài liệu

| Khu | Mã chính (`src/app/`) | Tài liệu | Mở khi |
|---|---|---|---|
| Khung mã | `core/world.js`, `core/helpers.js`, `loop/`, `src/tools/boundaries/` | [engine.md](../docs/architecture/engine.md) | thêm tác tử / vật mới; `worldSee` / `worldFace` / `worldPlace` / `worldTick`; build báo "chỗ dính MỚI" |
| Vẽ, hiệu năng, RAM, bóng, chất liệu | `core/boot.js`, `core/draw-batch.js`, `core/mem-trim.js`, `core/ao-bake.js`, `core/surface-style.js`, `van/interior/env-map.js`, `camp/realism.js` | [render.md](../docs/architecture/render.md) | RAM, lượt vẽ, bóng, độ phân giải, bóng góc nướng sẵn, ảnh môi trường, chất liệu |
| Ống kính điện ảnh và cận cảnh | `core/lens.js`, `loop/close-up.js` (thiết kế + nghiên cứu: `docs/cinematic-closeup-dof.md`) | [lens.md](../docs/architecture/lens.md) | mờ tiền / hậu cảnh, lấy nét tự động, sa bàn, cận cảnh sắc nét |
| Đi lại | `animals/_lib/quadruped.js`, `engineer/body/pose-ik-walk.js`, `core/collide.js`, `core/ground.js` | [walking.md](../docs/architecture/walking.md) | bàn chân trượt, bước bậc voxel, né vật, va chạm |
| Kỹ sư | `engineer/body/`, `engineer/mind/`, `engineer/tasks/` — bản đồ tệp: `src/app/engineer/README.md` | [engineer.md](../docs/architecture/engineer.md) | tay IK, nét mặt, nấu / ăn / trà / ngủ / laptop, phản ứng, thời tiết, tự chủ |
| Drone đồ chơi | `engineer/tasks/drone.js` | [drone.md](../docs/architecture/drone.md) | drone bay, tay cầm, bám camera |
| Xe nhà | `van/body/`, `van/interior/`, `van/face.js` — bản đồ tệp: `src/app/van/README.md` | [van.md](../docs/architecture/van.md) | vỏ xe GLB, nội thất, bàn học, laptop, radio, khói bếp |
| Động cơ xe, khung gầm, hình nổi kiểm tra máy | `van/engine/`, `van/body/chassis.js`, `engineer/tasks/engine-check.js` | [van-engine.md](../docs/architecture/van-engine.md) | khung gầm, động cơ chạy, hình nổi kiểm tra máy |
| Khu trại | `camp/` (biogas: `docs/biogas-design.md`) | [camp.md](../docs/architecture/camp.md) | bàn ghế, lửa trại, lò chiminea, lò nướng, đèn lồng |
| Gió và cây | `nature/wind-field.js`, `nature/wind-physics.js`, `nature/flowers-trees.js`, `nature/forest.js`, `nature/old-tree*.js`, `core/sky-shade.js` | [trees-wind.md](../docs/architecture/trees-wind.md) | gió, cây, cành, lá, vỏ, cây táo, cổ thụ, khói / nước ở Worker (`nature/fluids.js`) |
| Mặt đất | `nature/moss-lawn.js`, `nature/fungi.js`, `nature/ferns.js`, `nature/meadow.js`, `nature/bank-moss.js`, `nature/dam-moss.js`, `nature/grass-scatter.js` | [ground-moss.md](../docs/architecture/ground-moss.md) | rêu, nấm, cỏ, dương xỉ, đá |
| Hạ tầng | `world/` | [world-infra.md](../docs/architecture/world-infra.md) | cột điện, trạm bơm + tháp nước, ống ngầm, đập thủy điện, cống |
| Bò, gà, chó | `animals/cows/`, `animals/chickens/`, `animals/dog/`, `camp/chicken-coop.js` | [animals-farm.md](../docs/architecture/animals-farm.md) | bò, bê, chuồng bò, gà, chuồng gà, chó |
| Chim | `animals/storks/`, `animals/sparrows/` | [birds.md](../docs/architecture/birds.md) | cò, chim sẻ |
| Côn trùng, ong, gấu mèo, thỏ, hươu, cá, bướm | `animals/insects/`, `animals/bees/`, `animals/raccoon/`, `animals/bunny/` (thêm `docs/bunny-movement.md`), `animals/deer-crab/`, `animals/fish/` | [animals-wild.md](../docs/architecture/animals-wild.md) | ong, côn trùng, gấu mèo, thỏ, hươu, cá, bướm |
| Bầu trời, ngắm sao, kính thiên văn | `core/night-sky.js`, `core/sky-sun-moon.js`, `core/day-night.js`, `core/constellations.js`, `core/star-catalog.js`, `engineer/tasks/sky-watch.js`, `nature/clouds-rain.js` | [sky-stars.md](../docs/architecture/sky-stars.md) | mặt trời / trăng, trời đêm, ngắm sao, kính thiên văn |
| Giao diện | `ui/`, `core/labels.js`, `core/html-text.js` (lớp chữ: `docs/html-text-layer.md`) | [ui.md](../docs/architecture/ui.md) | thanh tổng quan, bảng Tools / Kỹ sư, nhãn, bong bóng |
| Thử, gỡ lỗi, kiểm tra hành vi | `src/tools/`, `tests/`, `docs/*-probe/` | [testing.md](../docs/architecture/testing.md) | trang gỡ lỗi, kiểm tra cả ngày của kỹ sư |

**Tài liệu thiết kế riêng** (`docs/`, mỗi việc lớn 1 tệp; bộ đo kèm theo ở `docs/<tên>-probe/`, mỗi thư mục có README):

| Tệp | Về |
|---|---|
| [biogas-design.md](../docs/biogas-design.md) | hệ biogas ở trại: bể, đường ống, bảng + hologram |
| [html-text-layer.md](../docs/html-text-layer.md) | lớp chữ HTML: nhãn, bong bóng, chữ nổi trong cảnh |
| [cinematic-closeup-dof.md](../docs/cinematic-closeup-dof.md) | ống kính điện ảnh, mờ theo độ sâu, sa bàn |
| [bunny-movement.md](../docs/bunny-movement.md) | thỏ né vật, nhảy |
| [game-engine-study.md](../docs/game-engine-study.md) | nghiên cứu game engine: chỗ nghẽn GPU, thứ tự cải tiến |

## Thêm tác tử / vật mới (tóm tắt — đủ ở `docs/architecture/engine.md`)

- Mỗi tác tử (kỹ sư, mỗi loài thú) và mỗi vật có trạng thái (xe, trại, luống) là 1 **đơn vị**. Đơn vị khác chỉ đọc nó qua mặt công khai `worldSee('tên')`
  (đăng ký `worldFace`); muốn đổi vật thì gọi "chỗ chạm" trên mặt, không ghi trường / gọi hàm riêng của nó. `build.py --check` chặn chỗ dính mới.
- Engine (`core/`, `loop/`, `ui/`, `animals/_lib/`) là nền — thêm nội dung thì không sửa ở đó; khai báo mỗi vật 1 chỗ bằng `worldPlace`, nhịp mỗi khung đăng
  ký bằng `worldTick(lượt, …)` — vòng lặp chỉ gọi.

## Mã nguồn và dựng trang

- Chỉ sửa trong `src/`. `src/app/**.js` được **nối nguyên văn** theo `src/app/manifest.txt` thành một hàm `build()` duy nhất:
  mọi tệp dùng chung một phạm vi biến, không `import`/`export`. Tệp sau dùng được hằng/hàm của tệp trước; khai báo hàm (`function f`)
  được kéo lên đầu nên gọi được từ tệp đứng trước. **Trùng tên biến giữa hai tệp = lỗi cú pháp** → đặt tên nháp có tiền tố riêng
  (`_aV`, `_rfE`, `_cuX`…).
- `python3 build.py --check`: dựng `index.html` + `css/` + `js/` (trang GitHub Pages) và `../3D garden.html` (bản một tệp để thử/gỡ lỗi),
  kiểm cú pháp bằng node, kiểm **ngân sách gzip** (`BUDGET_KB` đầu `build.py` — số hiện hành ghi ở đó, đừng chép số sang đây).
- `js/app.js` trên web **bỏ mọi dòng chỉ có chú thích** (`// …`) → nhẹ hơn ~13%. Chú thích cuối dòng vẫn giữ. Bản một tệp giữ nguyên.
  ⇒ Đừng chèn `//` vào GIỮA một dòng có nhiều lệnh (phần sau bị nuốt) và đừng để dòng dữ liệu bắt đầu bằng `//` trong chuỗi `` ` ` ``.
- `./publish.sh "mô tả"`: kéo bản mới, dựng, commit, push; GitHub Actions dựng lại Pages. Wix nhúng trang Pages bằng iframe.
- **Kỹ sư chia 3 thư mục**: `engineer/body/` thân thể + chuyển động · `engineer/mind/` chọn việc
  (giờ giấc `hours.js`, lịch `schedule.js`, nhu cầu `autonomy.js`, bảng việc dụng cụ `task-table.js`, bộ điều phối mỗi khung `loop-update.js`, suy nghĩ, phản ứng) ·
  `engineer/tasks/` mỗi tệp một việc. Bản đồ "muốn sửa gì thì mở tệp nào" + lịch cả ngày: `src/app/engineer/README.md`.
- **Xe van chia 3 thư mục**: `van/body/` vỏ + cửa + khung gầm · `van/interior/` nội thất, bếp, radio, Zzz · `van/engine/`
  động cơ chạy + hình nổi. Bản đồ: `src/app/van/README.md`. Hình nổi lúc hiện giấu mọi nhãn khác (declutter: Sprite / Line depthTest false + userData.label → lớp 31).

## Một khung hình (loop/main-loop.js → main-loop-rest.js)

1. `dt = min(getDelta, 0.05) || 1/60` — khung đầu `Clock.getDelta()` trả 0; **không hệ nào được nhận dt = 0**.
2. `adaptResolution(ts)` (chỉ khi khung do rAF gọi), tầm nhìn `viewTick(dt)` (core/view.js — camera theo `theta/phi/radius/target`), gió cảnh, nước, lượt `beasts` (thú lớn) của sổ tick (`docs/architecture/engine.md`),
   cỏ, lá rơi, đèn đường → lượt `lamps`…
3. Cuối main-loop.js: lượt `things` — đồ quanh trại (khói ca trà, lửa trại, lò chiminea, đèn lồng) rồi `vanFrameTick` (xe: đèn bạt hiên tự sáng, đèn bàn +
   laptop, cửa lùa + nắp bồn cầu phòng tắm). Rồi kỹ sư
   (engineer/mind/loop-update.js): chọn việc theo giờ → lượt `awake` (đồ chạy theo giờ thức của người: cá nướng của trại) → pha việc ghi **góc tay thẳng** → `engPoseEnd` (làm mượt) → `engFootIK` → `engSeatPost` →
   `updateFishingBite` (câu cá) → `engArmPost` (IK khuỷu/cổ tay) → `applePick.tick`. Ngay sau lượt kỹ sư (đầu main-loop-rest.js): lượt `late` — trước tiên
   `vanLateTick`, xe đi sau người: bếp (lửa nhảy, hơi nồi + tô udon, đèn + quạt hút, khói ống bếp) rồi vòi sen; rồi cá, luống, thỏ.
4. Lượt `insects` (côn trùng ban ngày), `glow` (đom đóm), mây, mưa, cống, `wild` (chim, chó, gấu mèo…), `pointer` (ô toạ độ), `updateDrawBatches`, `fluids.update` (Worker).
5. `updateSky()` (mặt trời/trăng thật, khi `skyOn`) → `nightSky.update` (nền trời đêm) → `fitSunShadow()` → `updateCloseLod()` → lượt `tools`, `ground`,
   `viewer` (người xem), `sound` → `renderer.render` → lượt `afterRender` (% zoom, bảng Tools, nhu cầu, động cơ).

## Vật lý và thời gian

- **Bước cố định** (`core/fixed-step.js`, "Fix Your Timestep"): `fixedSteps(S, dt, h, step)` dồn dt vào `S.acc`, đủ `h` thì gọi
  `step(h)`; trả `alpha = dư / h` để **vẽ nội suy** giữa trạng thái bước trước và bước mới. Trần 0,1 s/khung (máy quá chậm thì
  cảnh chậm lại, không tính bù vô tận). Kết quả giống nhau ở 15, 60, 144 hình/giây (đã đo: phao treo 0,42 · lực dây 0,178 ở cả 3).
- Hệ đang dùng bước cố định:
  - Câu cá 120 Hz (`anglingPhysStep`): cần uốn → ngọn vật lý `_aTip` → cá giằng co → phao + mồi Verlet → lực dây `A.T`.
    Vẽ: `rodFlexPose(alpha)` (góc đoạn cần nội suy `X.thp → X.th`), `_aTipR` (ngọn để vẽ), `_dF/_dB` (phao/mồi = `Fp→F`, `Bp→B`),
    `_dM` (miệng cá `Mp→M`). Quán tính gốc cần `rodFlexAcc(rod, dt)` tính theo khung vì tay chỉ đổi dáng mỗi khung.
  - Đuôi chó/gấu mèo 240 Hz (`updateSoftTail`, vẽ `Q→P`), tai thỏ 120 Hz (`bunnyEars`).
  - Nước nông + khói ở Worker có bước riêng (60 bước/s) — `nature/fluids.js`, `docs/architecture/trees-wind.md`.
- Mẫu khi thêm hệ mới: giữ "trạng thái trước" (Verlet có sẵn `prev`), bước vật lý chỉ đọc trạng thái vật lý, phần vẽ đọc bản nội suy;
  đừng chia cho dt ở chỗ dt có thể = 0; gặp NaN thì tự đặt lại (như khối "NaN lọt vào" đầu `updateFishingBite`).
- Làm mượt tư thế dùng `engSpring` (dạng SmoothDamp, ổn định ở mọi dt) — không cần bước cố định.
- Vật lý "giả" cho rẻ: gió cây/cỏ trong shader (`nature/wind-physics.js`), lò xo cho chuyển động phụ, IK cho tay chân.

## Thử và gỡ lỗi (tóm tắt — đủ ở `docs/architecture/testing.md`)

- `python3 build.py --check` (trong `3d-garden/`): dựng + cú pháp + ngân sách gzip + ranh giới đơn vị + cỡ tài liệu. Test: `node --test tests/garden-flight.test.cjs`
  (chạy từ thư mục chứa `3d-garden/` và `tests/`).
- Trang gỡ lỗi: `python3 src/tools/debug/mkdbg.py <3d-garden đã dựng> <thư mục phục vụ>/dbg.html` → `window.__dbg` + `window.__ev(mã)`; cạnh trang cần symlink
  `css` → `3d-garden/css`; phục vụ tĩnh cổng 8778. Chạy bộ đo: `src/tools/debug/ev4.cjs` + `src/tools/engineer-audit/harness.js` (`simSetup`, `runFor`, `envTo`)
  — lệnh mẫu: `docs/html-text-probe/README.md`. Bộ đo theo việc: `docs/*-probe/`. Cả ngày của kỹ sư: `src/tools/engineer-audit/README.md`.

## Bẫy đã dính

- dt = 0 ở khung đầu → chia cho dt → NaN lan vĩnh viễn (mất đầu, mất thân cần).
- Khói NS lưới ô nhỏ (ống khói 3,2 cm, ống bếp 1,8 cm): khuếch tán HIỆN chỉ ổn định khi dt·ν/H² ≤ ~0,2 — ν rối chạm trần 0,045 thì trường
  khói nổ (±60) sau ~100 bước. Nguồn có `inlet` kẹp `nuMax = 0,18·H²·30`; lửa trại (ô 8 cm) giữ trần cũ. Ống nhỏ: khói vào miền phải là NỒNG ĐỘ
  của khí thải (max), cộng dồn theo dt thì gần như không thấy khói.
- Rải cỏ / hoa theo toạ độ tay không biết có vật nằm đè ⇒ cụm lưới 7×7 quanh (X0 + 102, Z0 + 105) từng mọc xuyên khúc gỗ chết. Mọi chỗ rải
  trong `nature/grass-scatter.js` giờ qua `deadLogOut(x, z, lề)` (trục thân gỗ `deadLog` tính từ chính ma trận nhóm khúc gỗ, `nature/forest.js`):
  điểm dưới thân gỗ → dời ra sát chân gỗ hoặc bỏ. Thêm cụm rải mới gần vật nằm trên đất thì làm tương tự.
- `new THREE.Color(hex)` ở r160 đã đổi sRGB → tuyến tính; đừng gọi thêm `convertSRGBToLinear()`.
- Đọc vị trí đồ cầm tay trước khi giải IK tay → lệch.
  Cùng họ (ăn cơm chảo ở ghế cắm trại): `engEatRice` đọc lòng chảo bằng `P.handPan.localToWorld` lúc tay trái còn ở góc ước lượng
  trước IK (loop-update đặt `arms[1].rotation.x = −0,9`) ⇒ "lòng chảo" ngang miệng, thìa không bao giờ xuống chảo, tay phải kẹt trên mặt.
  Đúng: tính từ ĐÍCH của tay kia trong cùng khung (chảo ngang tại `pan`, hướng `qPan`).
- Khung cổ tay đặt bằng `aimQ(dir, up)`: +y cổ tay = hướng tay → KHUỶU. Lấy `up` = trời khi khuỷu ở dưới tay (đưa thìa lên miệng) ⇒ bàn tay lật
  gập ngược 120–172°. Dùng `engWristUp(e, i, dir)` (ngược `e.foreW[i]` = hướng cẳng tay của lần giải IK trước): cổ tay còn 10–50°.
  Lưới tay xoay β quanh lỗ tay (`docs/architecture/engineer.md` mục "Tay") nên khung lệch xa cẳng tay không làm bàn tay văng khỏi tay áo — vẫn nên đặt vòng tay quanh đúng
  thanh cầm (trục x cổ tay dọc thanh) để β nắn được hết.
- Đọc ma trận thế giới của đồ ĐANG GẮN vào cổ tay giữa khung (trước `engArmPost`) = đọc tư thế vừa bị `engPoseBegin` trả về ⇒ đích tay lệch
  0,55 m rồi kẹt luôn (đích = chính vị trí sai). Cốc trà: chỉ đọc cốc khi nó còn nằm trong vòng tay vịn; lúc cầm dùng đích lưu khi nắm
  (`e.teaG0`/`e.teaQ0`) hoặc tư thế dự định (hướng quai khi đặt xuống tính từ `qL`, không từ ma trận cốc).
- Vòng tay chữ C dựng đứng quanh quai đòi cẳng tay ⊥ trục cốc; cực khuỷu mặc định (chĩa xuống) làm khuỷu tụt dưới bàn tay ⇒ cổ tay gập 137°;
  ép cổ tay thẳng tuyệt đối thì khuỷu giơ ngang đầu lúc uống. `teaElbow` chọn điểm khuỷu trên vòng IK sát hướng +y cổ tay chúc ~40° theo trục cốc
  (khuỷu buông thấp, cổ tay gập vừa phải), cực trượt mượt để khuỷu không giật khi đổi pha.
- IK tay kẹp khoảng vai–tay ≥ 0,3 đv (~25 cm): đường thẳng tay vịn → môi lướt cách vai 16 cm ⇒ tay đứng lại rồi giật bắt kịp. Cho đường phình ra trước.
- Vật bị mang đi xa nhưng vẫn nằm trong lô gộp → biến mất khi lô bị loại theo khung nhìn.
- Dời đích nắng mà vẫn coi `sun.position` là hướng → sai hướng bóng/ánh vàng ngọn cỏ.
- Bản đồ gió giải theo tốc độ thật rồi chia cho gió tự do lúc đó → khi gió đổi tốc độ, luồng khí trong lưới chưa kịp theo (vài chục giây) ⇒ tỉ số sai (> 1 khắp nơi). Giải theo đơn vị chuẩn hoá.
- Biên của bộ giải: áp suất ở mép gió vào phải ∂p/∂n = 0 (mép gió ra p = 0) + vùng đệm vài ô, không thì sọc số dọc mép.
- Chân duỗi gần thẳng khi đứng (hông cao ≈ tổng chiều dài chân) ⇒ không còn tầm với cho sải ⇒ IK bị kẹp, bàn chân trụ trượt. Hạ thân / nâng khớp
  hông vào trong thân / rút sải cho tới khi chân còn ~5% chùng ở đầu–cuối pha trụ (đo: khoảng cách hông → điểm đặt so với L1 + L2).
- IK chân bỏ qua lắc ngang của thân / không cho dạng hông ⇒ bàn chân trượt ngang theo nhịp lắc. Nhánh "nhích bàn chân về chỗ" (settle) phải chạy
  cả khi đang đi, không thì chân duỗi dài ra sau lúc bắt đầu đi.
- **Chú thích // chèn giữa dòng nuốt câu lệnh phía sau**: `…setScalar(1.1);   // ghi chú scene.add(g);` ⇒ gà không bao giờ vào cảnh. Từng mất theo kiểu này:
  xù lông chim sẻ, tắt màn tay cầm drone khi đậu, tỉ lệ khung camera drone, sự kiện "cá rỉa mồi". build.py DỪNG khi chú thích cuối dòng kết thúc bằng
  1 câu lệnh ASCII (`swallowed()`: `a.b(…);` / `a = …;`, ngoặc cân; chữ Việt có dấu nên văn xuôi không bị bắt nhầm). Thêm ghi chú thì đặt SAU câu lệnh cuối cùng của dòng.

## Ghi chép sau mỗi việc (giữ chỉ mục ngắn)

- Việc mới → sửa mục cùng chủ đề trong đúng tệp khu, hoặc thêm 1 mục `## Tên ngắn` cạnh nó: hiện trạng (tệp, hàm, số đo) + bẫy. Rồi `python3 src/tools/docs/doc_index.py`.
- Không ghi ngày, không ghi lời người yêu cầu, không ghi "bản cũ → bản mới" (lịch sử ở git). Mục cũ sai thì sửa tại chỗ, đừng ghi nối.
- KHÔNG ghi nối vào tệp này. Chỉ sửa chỉ mục khi: thêm khu (thêm dòng Bản đồ), đổi khung mã / vòng lặp, hoặc có bẫy dùng chung (mục Bẫy).
- Tệp khu > 40 KB → tách 2 khu và sửa Bản đồ. Việc lớn có thiết kế riêng → `docs/<tên>.md` (+ `docs/<tên>-probe/`) và 1 dòng ở bảng Tài liệu thiết kế riêng.
- Số hay đổi (ngân sách gzip, số test đạt) để ở nguồn của nó (`build.py`, test); tài liệu chỉ trỏ tới.
