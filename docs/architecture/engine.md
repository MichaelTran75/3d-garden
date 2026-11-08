# Khung mã (engine)

<!-- toc -->
- Mã · 0.7 KB
- Đơn vị và mặt · 1.7 KB
- Sổ tick và dịch vụ · 0.8 KB
- worldPlace · 0.8 KB
- Bẫy · 2.3 KB
<!-- /toc -->

## Mã

- `core/world.js`: API dưới
- Mặt: `grep -rn "worldFace('"` (`van/face.js`, cuối `camp/chairs-lantern-fire.js`); chú thích cuối dòng = nghĩa trường
- Chung: `core/helpers.js` (`TAU`, `aimQ`, `x2gi` / `z2gj`, `worldCell`, `obstacleCoords`…) · `core/ground.js` `cowY` · `core/flow-field.js` · `core/site.js` mặt bằng trại · `core/view.js` tầm nhìn
- Vòng lặp = 1 hàm `loop()`: `loop/main-loop.js` → lượt kỹ sư `engineer/mind/loop-update.js` → `loop/main-loop-rest.js`; chỉ gọi `worldRun(lượt…)` + hàm môi trường
- `src/tools/boundaries/check.py` + `baseline.json`: chạy trong `build.py --check`; `--list` in tệp:dòng; `--update` ghi baseline

## Đơn vị và mặt

- Đơn vị = tiền tố dài nhất khớp `UNITS` (check.py): `agent` `engineer/`, `animals/<loài>/` · `thing` `van/`, `camp/`, `camp/carrot-bed.js`, `camp/biogas.js` · `env` `core/`, `nature/`, `world/` · `lib` `animals/_lib/`, `props/` · `shell` `loop/`, `ui/`
- Engine (`core/` `loop/` `ui/` `animals/_lib/` `src/tools/`) không sửa khi thêm nội dung (sửa trong đơn vị mình), trừ dữ liệu `core/site.js`, `core/palette.js`, `core/star-catalog.js`, `core/constellation-lines.js`
- Song song: mỗi phiên 1 đơn vị
- Tên cấp tệp agent / thing / shell chỉ dùng trong đơn vị; env, lib dùng chung
- Đọc đơn vị khác: `worldSee('tên')` (null ⇒ tự lo) hoặc tay cầm `worldLazy` `VAN` `ENGINEER` `DRONE` `CAMP` `CHIMINEA` `TRIMMER` `COOP`; getter = trạng thái thật
- Chỉ cử động thân mình; đổi vật đơn vị khác = chỗ chạm trên mặt nó (`CAMP.light(small)`, `VAN.kitchen.knob(i, v)`)
- Tương tác: bên mời nêu ý định trên mặt mình, bên kia tự quyết rồi nêu lại; rút tuỳ ý; trễ ≤ 1 khung (`callPat` → chó `patReady`)
- Tin `worldTell` / `worldHear` (bên báo không biết ai nghe): `navMarks`, `leafOnWater`, `grillReset`, `appleTreeTap`, `gardenGone`, `engNeeds`
- `PROPS` {x, z, r}: đồ trên đất, ai đi qua cũng bị đẩy vòng
- `NAV_MARKS` {x, z, r, nav}: chỉ chặn lối; lưới đường riêng cộng vào ô cấm (cả `PROPS` `nav: true`)
- `ui/` chỉ vẽ + giao việc qua mặt: `ENGINEER.offer(k)` (`plan()` / `why()`, `engineer/mind/offers.js`), `ENGINEER.ask(k)`, xem xuyên `VAN.setXray(on)` (`van/body/xray.js`)

## Sổ tick và dịch vụ

- `worldTick(lượt, thứ tự, fn)` cạnh `xxxTick(dt, t)`; vòng lặp gọi `worldRun(lượt, dt, t, x)`, không sửa khi thêm
- Lượt theo khung: `beasts` `lamps` `things` `awake` (lượt kỹ sư, khi thức) `late` `insects` (x = trời cho côn trùng ra) `glow` `wild` `pointer` `tools` `ground` `viewer` `sound` `afterRender`
- Ai ở lượt nào (mảng: `worldPlace`): `grep -rnE "worldTick\('wild'|\['wild'," src/app`
- `worldJoin(dịch vụ, thứ tự, fn)`; dịch vụ dựng xong gọi `worldServe(dịch vụ, api)`; xin muộn ⇒ chạy ngay
- Dịch vụ: `collide`, `dayNight`, `drawBatch`, `flowField`, `flight` (móc mỗi con `reroute()` khi kẹt, `navReset()`), `hover` (`ui/hover-select.js`), `jobs` (`ui/xray-lifecycle.js`), `smallShadow`, `groundContact`, `skyShade`. API: grep `worldServe('tên'`

## worldPlace

- `worldPlace(tên, { face, tick, join, hover, job })` cuối tệp vật (mẫu `camp/chiminea.js`): `tick: [[lượt, thứ tự, fn]]`, `join: [[dịch vụ, thứ tự, fn]]`, `hover: { root, … }` → viền trắng, `job: { objs | box, title, act | choices, msg, go, vis, van, pick, close, popAt, dock }` → bảng việc khi bấm
- `act` = khoá `ENG_OFFERS`; kỹ sư tự quyết (`ENGINEER.offer(act).why()`)
- `box`: hộp bấm vô hình cho lưới đã gộp lượt vẽ
- Khả năng mới cho mọi vật: sửa `worldPlace` + dịch vụ 1 lần
- Vật còn khai ở `ui/` (`TOOLS` `ui/xray-lifecycle.js`, `ui/tools-panel.js`; `hovAdd` `ui/hover-select.js`): sửa tới thì chuyển sang `worldPlace`
- Lúc chạy: `__ev('[...WORLD_PLACES.keys()]')`

## Bẫy

- Gán vào tay cầm (`TRIMMER.pull = 1`) ⇒ ném "chỉ để đọc"; dùng chỗ chạm `TRIMMER.cord(k)`. Proxy chỉ bắt gán cấp 1, sâu hơn: check.py
- check.py bắt: tên cấp tệp đơn vị khác; thò qua mặt (`X.object.userData / getObjectByName / traverse / children / add…`); ghi vật con lấy qua mặt (`VAN.x`, `worldSee('x').y`, `const c = CAMP.x`: gán, `.copy / .set…`, `lookAt`, `add / remove`) hay nhận vào cây mình. Trừ `SURFACES` (`VAN.laptop.ctx`)
- check.py không bắt ghi qua đối số hàm, for…of, destructuring
- `baseline.json` rỗng: chỗ dính mới ⇒ build dừng; sửa bằng mặt / chỗ chạm, không `--update`
- Đổi / bỏ trường mặt ⇒ sửa mọi bên đọc (`worldSee('tên')`, `VAN.`, `CAMP.`…); thêm trường: an toàn
- Số thứ tự lượt / dịch vụ giữ dãy `Math.random`, thứ tự con trong nhóm, thứ tự dựng lô: chèn giữa dùng số trung gian (15), không đánh lại
- Manifest: `core/helpers.js` sau `core/sky-sun-moon.js` (`S`, `BLOCK`, `wx`, `surfaceY`…); `core/ground.js` sau `world/solar-buildings-road.js` (sớm hơn ⇒ TDZ `damDeckY`, đường chưa dựng); `core/flow-field.js` sau tệp cuối đăng ký vật cản (`camp/chicken-coop.js`)
- Tệp mới đặt đúng chỗ dựng cũ (giữ thứ tự tạo vật)
- Tiện ích dùng chung → `core/helpers.js`, không để trong tệp tính năng
- `function` kéo lên đầu `build()`; `const` / `let` TDZ ⇒ tệp trước chỉ đọc trong tick
- Tách khối khỏi `loop()`: biến cục bộ (`dt`, `t`, `insectsAwake`) thành tham số cùng tên; `return` trong `loop()` thoát cả khung, trong hàm mới thì không — soát cả `continue`
- `NAV_MARKS` / `PROPS` nav thêm sau lưới kỹ sư ⇒ `worldTell('navMarks')` (`engNavBuild` dựng lại)
- Vật mảnh (chân chống bạt, đèn lồng treo) lọt 5 điểm mẫu va chạm ⇒ `PROPS` + `nav: true` (`engineer/body/seats.js`)
- Đồ còn tới lấy (máy cắt cỏ cất) ⇒ `NAV_MARKS`, không `PROPS`
- Dời mã thuần: đa tập token bằng nhau (`js_scan` build.py); cùng hạt ngẫu nhiên + đồng hồ ảo ⇒ mọi vật giống hệt; giao thức mặt lệch 1 khung (testing.md)
