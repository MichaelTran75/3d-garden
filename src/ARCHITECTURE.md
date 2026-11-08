# 3d-garden — chỉ mục

Đọc: tệp này → 1 tệp khu `docs/architecture/<khu>.md` (mục lục đầu tệp có cỡ mục; chỉ đọc mục cần). `mục "X"` → `grep -rn "^## X" docs/architecture src/ARCHITECTURE.md`.
Đọc trước: README thư mục mã (`src/app/engineer/`, `src/app/van/`); tài liệu thiết kế `docs/<tên>.md` của việc.

## Bản đồ (khu → mã `src/app/`)
- engine.md — khung mã, `worldSee`/`worldFace`/`worldPlace`/`worldTick`, ranh giới: `core/world.js`, `core/helpers.js`, `loop/`, `src/tools/boundaries/`
- render.md — vẽ, RAM, lượt vẽ, bóng, độ phân giải, AO nướng sẵn, ảnh môi trường, chất liệu: `core/boot.js`, `core/draw-batch.js`, `core/mem-trim.js`, `core/ao-bake.js`, `core/surface-style.js`, `van/interior/env-map.js`, `camp/realism.js` (+ `docs/game-engine-study.md`)
- lens.md — DOF, lấy nét, sa bàn, cận cảnh: `core/lens.js`, `loop/close-up.js` (+ `docs/cinematic-closeup-dof.md`)
- walking.md — chân trượt, bậc voxel, né vật, va chạm: `animals/_lib/quadruped.js`, `engineer/body/pose-ik-walk.js`, `core/collide.js`, `core/ground.js`
- engineer.md — kỹ sư: tay IK, mặt, nấu / ăn / trà / ngủ / laptop, câu cá, phản ứng, thời tiết, tự chủ: `engineer/{body,mind,tasks}/`
- drone.md — `engineer/tasks/drone.js`
- van.md — xe nhà: vỏ GLB, nội thất, bàn học, laptop, radio, khói bếp: `van/body/`, `van/interior/`, `van/face.js`
- van-engine.md — khung gầm, động cơ, hình nổi kiểm tra máy: `van/engine/`, `van/body/chassis.js`, `engineer/tasks/engine-check.js`
- camp.md — bàn ghế, lửa trại, chiminea, lò nướng, đèn lồng: `camp/` (+ `docs/biogas-design.md`)
- trees-wind.md — gió, cây, lá, vỏ, cổ thụ, khói / nước Worker: `nature/{wind-field,wind-physics,flowers-trees,forest,fluids}.js`, `nature/old-tree*.js`, `core/sky-shade.js`
- ground-moss.md — rêu, nấm, cỏ, dương xỉ, đá: `nature/{moss-lawn,fungi,ferns,meadow,bank-moss,dam-moss,grass-scatter}.js`
- world-infra.md — cột điện, trạm bơm, tháp nước, ống ngầm, đập, tổ máy, đường, cống, mẫu GLB ngoài localhost: `world/`
- animals-farm.md — bò, gà, chó, chuồng bò, chó lùa bò: `animals/{cows,chickens,dog}/`, `camp/chicken-coop.js`
- birds.md — cò, chim sẻ: `animals/{storks,sparrows}/`
- animals-wild.md — ong, côn trùng, gấu mèo, thỏ, hươu, cá, bướm: `animals/{insects,bees,raccoon,bunny,deer-crab,fish}/` (+ `docs/bunny-movement.md`)
- sky-stars.md — mặt trời / trăng, trời đêm, sao, kính thiên văn, mây mưa: `core/{night-sky,sky-sun-moon,day-night,constellations,star-catalog}.js`, `engineer/tasks/sky-watch.js`, `nature/clouds-rain.js`
- ui.md — thanh tổng quan, bảng Tools / Kỹ sư, nhãn, bong bóng: `ui/`, `core/labels.js`, `core/html-text.js` (+ `docs/html-text-layer.md`)
- testing.md — trang gỡ lỗi, bộ đo, kiểm cả ngày kỹ sư: `src/tools/`, `tests/`, `docs/*-probe/`
- Khác: `src/page.html` + `src/css/` khung trang · `src/js/weather.js` (Open-Meteo, giờ Pleiku), `src/js/flight-nav.js` (đường bay ong / bướm) · `src/app/props/` đồ vật, hàm thuần · `src/models/` mẫu dùng nguyên, nạp sau khi cảnh chạy · `src/tools/<tên>/` dựng lại mẫu

## Đơn vị (đủ: engine.md)
- Tác tử (kỹ sư, mỗi loài) / vật có trạng thái (xe, trại, luống) = 1 đơn vị; đơn vị khác chỉ đọc qua `worldSee('tên')` (mặt `worldFace`), đổi vật qua chỗ chạm trên mặt. Vật khai 1 chỗ `worldPlace`; nhịp khung `worldTick(lượt, …)`. Thêm nội dung không sửa engine (`core/`, `loop/`, `ui/`, `animals/_lib/`). `build.py --check` chặn chỗ dính mới.
- Vật dựng lúc mở trang tự gộp lượt vẽ; biến dạng mỗi khung / bị mang xa ⇒ `userData.noBatch = true`. Chạm nước ⇒ `fluids.splash(x, z, bánKính, cườngĐộ)`.

## Mã, dựng, thử
- Chỉ sửa `src/`. `src/app/**.js` nối nguyên văn theo `src/app/manifest.txt` → 1 hàm `build()`: chung phạm vi, không import/export, `function f` kéo lên đầu; trùng tên giữa 2 tệp = lỗi cú pháp ⇒ tên nháp có tiền tố (`_aV`, `_rfE`).
- `python3 build.py --check` → `index.html`, `css/`, `js/` (Pages) + `../3D garden.html` (1 tệp, cho test); kiểm cú pháp, gzip `BUDGET_KB`, ranh giới, cỡ tài liệu. `./publish.sh "mô tả"` → push → Actions → Pages.
- `//` giữa dòng nuốt lệnh / nhánh `else { … }` phía sau (`…setScalar(1.1);   // ghi chú scene.add(g);` ⇒ gà không vào cảnh) ⇒ ghi chú đặt SAU lệnh cuối dòng; build.py `swallowed()` (`SWALLOW`, `CLOSE`, `TAIL`) chặn phần lớn, sót câu bắt đầu `M[k]`.
- `js/app.js` bỏ dòng chỉ có `//` ⇒ dòng trong chuỗi `` ` `` không bắt đầu bằng `//`. Chú thích mã tiếng Việt; chữ trên màn hình gọi kỹ sư là "Engineer".
- Test: `node --test tests/garden-flight.test.cjs` từ thư mục chứa `3d-garden/` + `tests/`. Gỡ lỗi, bộ đo, cả ngày kỹ sư: testing.md.

## Một khung (`loop/main-loop.js` → `main-loop-rest.js`)
`dt = min(getDelta, 0.05) || 1/60` → `adaptResolution` → `viewTick` (`core/view.js`) → gió, nước → `beasts` → cỏ, lá, đèn đường → `lamps` → `things` (khói trà, lửa, chiminea, đèn lồng) → `vanFrameTick` → kỹ sư (`engineer/mind/loop-update.js`, thứ tự: `src/app/engineer/README.md`) → `late` (`vanLateTick`: bếp, khói, vòi sen; cá, luống, thỏ) → `insects` → `glow` → mây, mưa, cống → `wild` → `pointer` → `updateDrawBatches` → `fluids.update` → `updateSky` → `nightSky.update` → `fitSunShadow` → `updateCloseLod` → `tools`, `ground`, `viewer`, `sound` → `renderer.render` → `afterRender`.

## Vật lý và thời gian
- `core/fixed-step.js` `fixedSteps(S, dt, h, step)`: dồn dt vào `S.acc`, gọi `step(h)`, trả `alpha = dư / h` để vẽ nội suy; trần 0,1 s/khung; như nhau 15 / 60 / 144 fps.
- Dùng: câu cá 120 Hz `anglingPhysStep` (engineer.md), đuôi chó / gấu mèo 240 Hz `updateSoftTail`, tai thỏ 120 Hz `bunnyEars`, nước nông + khói Worker 60 bước/s `nature/fluids.js`.
- Hệ mới: giữ `prev`; bước vật lý chỉ đọc trạng thái vật lý, vẽ đọc bản nội suy; khung đầu dt = 0 ⇒ không chia dt (NaN lan mãi); NaN ⇒ tự đặt lại (mẫu: đầu `updateFishingBite`).
- Tư thế mượt `engSpring` (SmoothDamp, ổn mọi dt). Rẻ: gió cây / cỏ trong shader (`nature/wind-physics.js`), lò xo, IK.

## Bẫy chung
- `new THREE.Color(hex)` (r160) đã sRGB → tuyến tính; không gọi thêm `convertSRGBToLinear()`.
- Đọc vị trí đồ cầm / đồ gắn cổ tay trước IK tay (`engArmPost`) ⇒ đích lệch; tính từ đích cùng khung hoặc đích lưu khi nắm (engineer.md).

## Ghi chép sau việc
- Sửa / thêm `## Tên ngắn` trong đúng tệp khu: hiện trạng (tệp, hàm, số) + bẫy, kiểu điện tín; không ngày, không trích lời, không người yêu cầu, không "cũ → mới". Rồi `python3 src/tools/docs/doc_index.py`.
- Tệp này chỉ sửa khi thêm khu, đổi khung mã / vòng lặp, có bẫy chung. Tệp khu > 40 KB → tách. Việc lớn → `docs/<tên>.md` (+ `<tên>-probe/`), ghi vào dòng khu. Số hay đổi (ngân sách, số test) để ở nguồn.
