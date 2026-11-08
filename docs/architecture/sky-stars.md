# Bầu trời, ngắm sao

<!-- toc -->
- Trời · 0.7 KB
- Chòm sao · 0.8 KB
- Số % mở trang · 0.4 KB
- Ngắm sao · 1.0 KB
- Kính, màn, laser · 1.8 KB
<!-- /toc -->

## Trời
- `core/sky-sun-moon.js`: mặt trời/trăng thật trên vòm `ORB`; chung `sceneDay`, `sunEq`, `moonEq`, `hourAngle`, `horiz`, `skyDir`.
- Trăng: tấm quay về camera, shader dựng bán cầu (`uPsi`, `uLi`, `uNo`, `uShine`); ảnh: kinh độ 0 giữa, phải = đông, trên = bắc.
- `core/night-sky.js` `nightSky`: nền chiếu nổi, sao `STAR_BSC5` (`core/star-catalog.js`), Ngân Hà, sao băng; gỡ lỗi `U`, `lim`, `meteors`, `spawn`.
- Chân trời neo góc đáy đảo `islandBase` (đo 1 lần từ `terrainMeshes`); camera trực giao ⇒ dời đảo chỉ khớp 1 mức zoom.
- Mây thật `uCloud` chỉ mờ sao + Ngân Hà; mây khối: `nature/clouds-rain.js`.

## Chòm sao
- `core/constellations.js` + `core/constellation-lines.js`: nét 88 chòm, tên khi rê; `list`, `pickAt`, `overIsland`, `hover`. Đóng gói: `src/tools/constellations/pack.py`.
- Lớp `nightSky.mk` thứ tự −1002,5, chung ma trận giờ sao `uEq`; hiện theo cấp sao giới hạn 2,8 → 4,8.
- Rê chỉ khi trời tối, trỏ nền trời, không chọn vật, nút Nhãn bật.
- `overIsland` dò tia trên `surfaceY`, không raycast lưới.
- `gl.LINES` 1 px ⇒ nét = dải dựng ở shader đỉnh; bỏ phần sau lưng (chiếu nổi phóng vô hạn).
- Đóng gói lại: đỉnh nét = toạ độ lượng tử của sao `STAR_BSC5` (nét chạm tâm chấm).
- Giữ khối `/* */` BSD-3 trong `core/constellation-lines.js` (build.py giữ) + dòng ghi công `src/page.html`.

## Số % mở trang
- `#loading`, `window.__ld` (`src/page.html`); `ldGate`, `ldTrack`, `ldStep` (`core/boot.js`); `LD_LAST` (`build.py`).
- Chuỗi nạp mẫu chờ `ldGate` ngay trước khi gắn vào cảnh (`.then(ldAfter)` / `await ldGate`); gắn sớm ⇒ biến tệp sau chưa khai báo (ReferenceError, vd `VPART`).
- Không nhường luồng sau `LD_LAST`.

## Ngắm sao
- `engineer/tasks/sky-watch.js`: `skyWatch`, kính `TEL`; giờ `ENG_HOURS.stars` (`engineer/mind/hours.js`).
- Giờ ngủ/việc chỉ đọc `ENG_SLEEP_H`/`ENG_HOURS`, không viết số.
- `ok()`: trong giờ, mặt trời < −8°, không mưa, mây < 60%, có chỗ trải thảm.
- `S.st`: fetch → pick (thảm + chân kính từ xe) → go → tset → lắp `asmStep` (tlvl → tcw → tfe/tpk/tca bê ống → tota → tbal → tpol → tfnd) → unroll → … → lie → up → off → roll → tgo → tget → back → put.
- Lệnh 'stars': `actLeft` cố định 900 ⇒ nhánh 'hết giờ' không chạy; lệnh xoá khi `update` trả true (chỉ sau khi cất thảm + kính); ngoài giờ còn idle ⇒ true ngay.
- Dừng lúc lắp ⇒ `telMount()` rồi cất; cất ở 'put'/idle ⇒ `TEL.tubeOn = false`.
- Chó `animals/dog/brain.js` 'stars' (`dogWant`, `dogSpot`): ra khỏi xe cả đêm, nằm sát thảm phía không kính; chủ dậy ⇒ về xe.

## Kính, màn, laser
- `telSplit`: khớp `TEL.azJ` (phương vị) → `TEL.tube` (độ cao, đỉnh cột nối `TUBE_R`) → `TEL.tubeS` (quanh `TUBE_MNT`).
- `TUBE_R` > độ sụt đuôi ống khi chĩa 80°, không thì ống đập chân.
- `telPlace`: cạnh thảm `TEL_OFF`; `TEL.propR` → `PROPS`, `TEL.obsR` → `obstacleCoords`.
- `findSpot()` gỡ `TEL.propR`/`TEL.obsR` trước khi dò, không thì né chân kính (thảm dời, kính xa).
- Nằm: `scrHand` kéo màn trước mặt; chạm màn ⇒ `telGoto` (độ cao 75–80°, `TEL_V`, `TEL_A`); pha out → in → lock → back; ảnh mw → bh → jup → gal, bỏ ảnh chưa tải.
- Dậy: đẩy màn về trước rồi mới ngồi dậy.
- `scrHand` chép đích tay vào `C.p` (`_b` bị ghi đè khi tính lòng bàn tay); vào 'pull' ⇒ `return false` (k từ 0, màn khỏi giật).
- Màn nghỉ chúc 6° về đầu (chúc thẳng mắt ⇒ nhìn trên chỉ thấy lưng màn).
- Hướng nhìn màn/sao băng: khung `e.spine`.
- Canvas màn `userData.live` ⇒ `core/mem-trim.js` bỏ qua.
- Laser bật khi pha in/lock, `nightFactor` > 0,4, `TEL.tubeOn`; `DoubleSide` (chiều quấn đổi theo tia); tia dưới chân trời ⇒ tắt (`uOn`).
- Trục quang = `TUBE_AX`; neo 'front' − 'back' của mẫu lệch 4° ⇒ laser chệch ~5 m ở 70 m.
- ShaderMaterial không có `PI` (tự `#define`).
- Ngân Hà `u = atan(−x, z)` + `textureGrad` (không gãy mép ảnh).
- Jupiter: mép trên ảnh = cực nam; `jupMat` ghi độ sâu (che trăng sau hành tinh).
- Điểm thiên hà < 1 px mờ theo diện tích phủ, không thì cháy trắng.
- Kính thiên văn (engineer/tasks/sky-watch.js): `telHand` trước IK, `telTick` sau IK; màn `attach` vào kính
