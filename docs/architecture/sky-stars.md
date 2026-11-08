# Bầu trời, ngắm sao, kính thiên văn

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.0 KB
- Trời đêm · 0.4 KB
- Ngắm sao · 1.1 KB
- Bẫy · 2.8 KB
<!-- /toc -->

## Mã

- `core/sky-sun-moon.js` — mặt trời / trăng thật trên vòm `ORB`; dùng chung `sceneDay`, `sunEq`, `moonEq`, `hourAngle`, `horiz`, `skyDir`; trăng = tấm quay về camera, shader dựng bán cầu (`uPsi`, `uLi`, `uNo`, `uShine`).
- `core/night-sky.js` — `nightSky`: nền trời chiếu nổi, sao `STAR_BSC5` (`core/star-catalog.js`), Ngân Hà, sao băng; gỡ lỗi `U`, `lim`, `meteors`, `spawn`.
- `core/constellations.js` + `core/constellation-lines.js` — nét 88 chòm, tên khi rê; `list`, `pickAt`, `overIsland`, `hover`. Đóng gói: `src/tools/constellations/pack.py`.
- `engineer/tasks/sky-watch.js` — `skyWatch` + kính `TEL`; giờ `ENG_HOURS.stars` (`engineer/mind/hours.js`). Chó nằm cạnh: `animals/dog/brain.js` 'stars' (`dogWant`, `dogSpot`).
- Số % mở trang: `#loading`, `window.__ld` (`src/page.html`); `ldGate`, `ldTrack`, `ldStep` (`core/boot.js`); `LD_LAST` (`build.py`).
- Cò lượn: `animals/storks/storks.js` (`STK_T`, `stkLift`, `stkC1`).

## Trời đêm

- Chân trời neo vào góc đáy khối đảo (`islandBase`, đo 1 lần từ `terrainMeshes`).
- Mây thật `uCloud` chỉ làm mờ sao + Ngân Hà; mây là khối 3D (`nature/clouds-rain.js`).
- Chòm sao: lớp `nightSky.mk` thứ tự −1002,5, cùng ma trận giờ sao `uEq`; hiện theo cấp sao giới hạn 2,8 → 4,8; rê chuột chỉ khi trời tối, trỏ nền trời, không đang chọn vật, nút Nhãn bật.

## Ngắm sao

- `ok()`: trong giờ, mặt trời < −8°, không mưa, mây < 60%, có chỗ trải thảm.
- `S.st`: fetch → pick (thảm + chân kính từ xe) → go → tset → lắp `asmStep` (tlvl → tcw → tfe / tpk / tca bê ống → tota → tbal → tpol → tfnd) → unroll → … → lie → up → off → roll → tgo → tget → back → put.
- `telSplit` tách ống ⇒ khớp `TEL.azJ` (phương vị) → `TEL.tube` (độ cao, đỉnh cột nối `TUBE_R`) → `TEL.tubeS` (quanh `TUBE_MNT`). `telPlace`: cạnh thảm `TEL_OFF`, thêm `TEL.propR` vào `PROPS`, `TEL.obsR` vào `obstacleCoords`.
- Nằm: `scrHand` kéo màn ra trước mặt; chạm màn ⇒ `telGoto` (độ cao 75–80°, `TEL_V`, `TEL_A`). Pha out → in → lock → back; ảnh mw → bh → jup → gal, bỏ ảnh chưa tải. Laser bật khi pha in / lock, `nightFactor` > 0,4, `TEL.tubeOn`.
- Dậy: đẩy màn về trước rồi mới ngồi dậy. Chó: `dogWant()` ⇒ ra khỏi xe cả đêm, nằm sát thảm phía không có kính; chủ dậy ⇒ về xe.

## Bẫy

- Camera trực giao không có điểm tụ: dời đảo cho khớp chân trời chỉ đúng 1 mức zoom ⇒ neo `islandBase`.
- `gl.LINES` chỉ rộng 1 px ⇒ nét chòm là dải dựng trong shader đỉnh; bỏ phần sau lưng người nhìn (chiếu nổi phóng vô hạn).
- Đóng gói lại nét chòm: đỉnh mang toạ độ đã lượng tử của sao `STAR_BSC5` (nét chạm tâm chấm). Giữ khối `/* */` bản quyền BSD-3 trong `core/constellation-lines.js` (build.py giữ) + dòng ghi công trong `src/page.html`.
- `overIsland` dò tia trên bản đồ độ cao `surfaceY`, không raycast lưới.
- Mọi chuỗi nạp mẫu chờ `ldGate` ngay trước bước gắn vào cảnh (`.then(ldAfter)` / `await ldGate`): gắn sớm ⇒ tệp sau chưa khai báo biến (ReferenceError, vd `VPART`). Không nhường luồng sau `LD_LAST`.
- Trục quang là `TUBE_AX`; neo 'front' − 'back' của mẫu lệch 4° ⇒ laser chệch ~5 m ở 70 m.
- `TUBE_R` phải lớn hơn độ sụt đuôi ống khi chĩa 80°, không thì ống đập chân.
- Laser `DoubleSide` (chiều quấn tam giác đổi theo hướng tia); tắt khi tia dưới chân trời (`uOn`).
- Điểm thiên hà < 1 px mờ theo diện tích phủ, không thì cháy trắng.
- ShaderMaterial không có `PI` (tự `#define`). Ngân Hà `u = atan(−x, z)` + `textureGrad` (không gãy mép ảnh). Ảnh Jupiter: mép trên = cực nam; `jupMat` ghi độ sâu để trăng sau hành tinh bị che.
- Ảnh trăng: kinh độ 0 giữa ảnh, phải = đông, trên = bắc.
- Canvas màn kính mang `userData.live` để `core/mem-trim.js` bỏ qua.
- `scrHand`: chép đích tay vào `C.p` (vectơ tạm `_b` bị ghi đè khi tính lòng bàn tay); vào 'pull' thì `return false` để khung sau tính k từ 0, màn khỏi giật.
- Màn nghỉ chỉ chúc 6° về đầu: chúc thẳng vào mắt thì nhìn từ trên chỉ thấy lưng màn.
- Hướng nhìn màn / sao băng đổi sang khung `e.spine`.
- Dừng lúc đang lắp ⇒ `telMount()` rồi cất như thường; cất ở 'put' / idle ⇒ `TEL.tubeOn = false`.
- `findSpot()` gỡ `TEL.propR` / `TEL.obsR` trước khi dò, không thì né chính chân kính ⇒ thảm dời, kính đứng xa.
- Lệnh 'stars': `actLeft` cố định 900 nên nhánh 'hết giờ' không chạy; lệnh xoá khi `update` trả true, chỉ sau khi đã cất thảm + kính. Ngoài giờ mà còn idle ⇒ trả true ngay.
- Cò: gần cột (< 2,6 R) bay xoắn tiếp tuyến cùng chiều cột (nhắm thẳng tâm ⇒ rẽ ngược rồi lật); vào 'circle' ở 1,35 R (R + 1,5 thì kẹt vòng ngoài vì lái trễ).
- Giờ ngủ / giờ việc chỉ đọc `ENG_SLEEP_H` / `ENG_HOURS`, đừng viết số.
