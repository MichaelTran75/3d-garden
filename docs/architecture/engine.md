# Khung mã (engine)

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.1 KB
- Đơn vị và mặt · 1.8 KB
- Sổ tick và dịch vụ · 1.0 KB
- worldPlace · 0.8 KB
- Bẫy · 3.0 KB
<!-- /toc -->

## Mã

- `core/world.js` — mặt `worldFace` / `worldSee`; tay cầm chỉ-đọc (`worldLazy`) `VAN`, `ENGINEER`, `DRONE`, `CAMP`, `CHIMINEA`, `TRIMMER`, `COOP`; tin `worldTell` / `worldHear`; sổ tick `worldTick` / `worldRun`; dịch vụ `worldJoin` / `worldServe`; `worldPlace`; `PROPS`, `NAV_MARKS`.
- Mặt từng đơn vị: `grep -rn "worldFace('"` (vd `van/face.js`, cuối `camp/chairs-lantern-fire.js`) — chú thích cuối dòng = nghĩa từng trường. Mẫu `worldPlace`: `camp/chiminea.js`.
- Dùng chung: `core/helpers.js` (`TAU`, `aimQ`, `x2gi` / `z2gj`, `worldCell`, `obstacleCoords`…) · `core/ground.js` (`cowY`) · `core/flow-field.js` · mặt bằng trại `core/site.js` · tầm nhìn `core/view.js`.
- Vòng lặp = MỘT hàm `loop()`: mở ở `loop/main-loop.js`, giữa là lượt kỹ sư `engineer/mind/loop-update.js`, đóng ở `loop/main-loop-rest.js`; chỉ gọi `worldRun(lượt…)` + hàm môi trường.
- `src/tools/boundaries/check.py` + `baseline.json` — bộ kiểm ranh giới (chạy trong `build.py --check`); `--list` in tệp:dòng, `--update` ghi baseline.

## Đơn vị và mặt

- Đơn vị = tiền tố trong `UNITS` của check.py (dài nhất thắng): `agent` `engineer/`, mỗi `animals/<loài>/` · `thing` `van/`, `camp/` (riêng `camp/carrot-bed.js`, `camp/biogas.js`) · `env` `core/`, `nature/`, `world/` · `lib` `animals/_lib/`, `props/` · `shell` `loop/`, `ui/`.
- Engine (`core/`, `loop/`, `ui/`, `animals/_lib/`, `src/tools/`): thêm nội dung thì KHÔNG sửa — trừ dữ liệu `core/site.js`, `core/palette.js`, `core/star-catalog.js`, `core/constellation-lines.js`. Nội dung sửa trong đơn vị mình; song song thì mỗi phiên một đơn vị.
- Tên cấp tệp của agent / thing / shell chỉ dùng trong đơn vị đó (env, lib ai cũng dùng). Bên ngoài đọc qua `worldSee('tên')` (null khi chưa có ⇒ tự lo lúc vắng) hoặc tay cầm; getter đọc trạng thái thật.
- Mỗi đơn vị chỉ cử động thân mình; đổi vật đơn vị khác = gọi chỗ chạm trên mặt nó (`CAMP.light(small)`, `VAN.kitchen.knob(i, v)`), vật tự đổi dáng.
- Tương tác: bên mời nêu ý định trên mặt mình, bên kia tự quyết rồi nêu lại, bên nào cũng rút được, trễ ≤ 1 khung. Mẫu: kỹ sư `callPat` → chó `patReady`.
- Tin (bên báo không biết ai nghe): `navMarks`, `leafOnWater`, `grillReset`, `appleTreeTap`, `gardenGone`, `engNeeds`.
- `PROPS` {x, z, r}: đồ trên đất, ai đi qua cũng bị đẩy vòng. `NAV_MARKS` {x, z, r, nav}: chỉ chặn lối, không đẩy; ai có lưới đường riêng cộng vào ô cấm (cùng `PROPS` có `nav: true`).
- `ui/` chỉ vẽ + giao việc qua mặt: `ENGINEER.offer(k)` (`plan()` / `why()`, `engineer/mind/offers.js`), `ENGINEER.ask(k)`, xem xuyên `VAN.setXray(on)` (của xe: `van/body/xray.js`).

## Sổ tick và dịch vụ

- `worldTick(lượt, thứ tự, fn)` viết cạnh hàm tick; vòng lặp gọi `worldRun(lượt, dt, t, x)`. Lượt theo thứ tự khung: `beasts` · `lamps` · `things` · [kỹ sư: `awake`, chỉ khi thức] · `late` · `insects` (x = trời cho côn trùng ra) · `glow` · `wild` · `pointer` · `tools` · `ground` · `viewer` · `sound` · `afterRender`.
- Ai ở lượt nào: `grep -rnE "worldTick\('wild'|\['wild'," src/app` (`worldPlace` ghi dạng mảng).
- `worldJoin(dịch vụ, thứ tự, fn)`; dịch vụ dựng xong gọi `worldServe(dịch vụ, api)`, xin muộn ⇒ chạy ngay. Có: `collide`, `dayNight`, `drawBatch`, `flowField`, `flight` (móc mỗi con: `reroute()` khi kẹt, `navReset()`), `hover` (`ui/hover-select.js`), `jobs` (`ui/xray-lifecycle.js`), `smallShadow`, `groundContact`, `skyShade` — API: tìm `worldServe('tên'`.
- Hoạt cảnh mới: hàm `xxxTick(dt, t)` trong tệp tính năng + 1 dòng `worldTick` cạnh nó; vòng lặp không đổi.

## worldPlace

- `worldPlace(tên, { face, tick, join, hover, job })` cuối tệp của vật: `tick: [[lượt, thứ tự, fn]]`, `join: [[dịch vụ, thứ tự, fn]]`, `hover: { root, … }` → viền trắng, `job: { objs | box, title, act | choices, msg, go, vis, van, pick, close, popAt, dock }` → bảng việc khi bấm.
- Vật nêu việc (`act` = khoá `ENG_OFFERS`), kỹ sư tự quyết (`ENGINEER.offer(act).why()`), giao diện chỉ vẽ. `box`: engine dựng hộp bấm vô hình cho lưới đã gộp lượt vẽ.
- Khả năng mới cho mọi vật = sửa engine MỘT lần (`worldPlace` + dịch vụ). Vật còn khai trong `ui/` (`TOOLS` ở `ui/xray-lifecycle.js`, `ui/tools-panel.js`; `hovAdd` ở `ui/hover-select.js`): chuyển sang `worldPlace` khi sửa tới. Lúc chạy: `__ev('[...WORLD_PLACES.keys()]')`.

## Bẫy

- Gán vào tay cầm (`TRIMMER.pull = 1`) ⇒ ném "mặt … chỉ để đọc" — gọi chỗ chạm (`TRIMMER.cord(k)`). Proxy chỉ bắt gán cấp 1, sâu hơn do check.py bắt.
- check.py tính chỗ dính: tên cấp tệp đơn vị khác; thò vào vật qua mặt (`X.object.userData / getObjectByName / traverse / children / add…`); ghi vào vật con mặt trả ra (`VAN.x`, `worldSee('x').y`, bí danh `const c = CAMP.x`: gán, `.copy / .set…`, `lookAt`, `add / remove`) hay nhận nó vào cây mình. Trừ mặt vẽ `SURFACES` (`VAN.laptop.ctx`).
- check.py KHÔNG thấy ghi qua đối số hàm, phần tử for…of, destructuring — tự giữ luật.
- `baseline.json` rỗng: chỗ dính mới nào cũng làm build dừng ⇒ sửa bằng mặt / chỗ chạm, đừng `--update` để nuốt.
- Đổi nghĩa / bỏ trường mặt ⇒ tìm mọi `worldSee('tên')` + tay cầm (`VAN.`, `CAMP.`…) sửa bên đọc; thêm trường thì an toàn.
- Số thứ tự trong lượt / dịch vụ giữ dãy `Math.random`, thứ tự con trong nhóm, thứ tự dựng lô: chèn giữa dùng số trung gian (15), đừng đánh số lại.
- Thứ tự manifest: `core/helpers.js` sau `core/sky-sun-moon.js` (`S`, `BLOCK`, `wx`, `surfaceY`…); `core/ground.js` sau `world/solar-buildings-road.js` (sớm hơn ⇒ TDZ `damDeckY`, đường chưa dựng); `core/flow-field.js` sau tệp cuối đăng ký vật cản (`camp/chicken-coop.js`; sớm hơn ⇒ lưới thiếu vật cản). Tệp mới đặt đúng chỗ dựng cũ ⇒ thứ tự tạo vật không đổi.
- Hằng / hàm trong tệp tính năng thành "thư viện" cả cảnh (bỏ tệp là gãy tệp khác) ⇒ tiện ích dùng chung đặt ở `core/helpers.js`.
- `function` được kéo lên đầu `build()` ⇒ tệp đứng trước gọi được; `const` / `let` thì không (TDZ) — trong tick chỉ đọc tên lúc chạy khung.
- Tách khối khỏi thân `loop()` thành hàm: biến cục bộ (`dt`, `t`, `insectsAwake`) thành tham số cùng tên; `return` trong `loop()` thoát cả khung, trong hàm mới thì không — soát cả `continue`.
- Thêm `NAV_MARKS` / `PROPS` nav sau khi lưới kỹ sư đã dựng ⇒ phải `worldTell('navMarks')` (`engNavBuild` dựng lại).
- Vật mảnh (chân chống bạt, đèn lồng treo) lọt 5 điểm lấy mẫu va chạm ⇒ `PROPS` + `nav: true` (`engineer/body/seats.js`), không thì kỹ sư đi xuyên. Đồ còn phải tới lấy (máy cắt cỏ đang cất) ⇒ `NAV_MARKS`, không `PROPS`. Đừng thêm vật nhỏ `obstacleCoords` (đống củi, lò) vào lưới kỹ sư: lối cạnh bếp lửa hẹp, kẹt.
- Dời mã thuần: đa tập token cả khối phải bằng nhau (`js_scan` của build.py); cùng hạt ngẫu nhiên + đồng hồ ảo, vị trí / dáng mọi vật phải giống hệt bản trước; đổi sang giao thức mặt chỉ lệch nhịp 1 khung (công cụ: testing.md).
