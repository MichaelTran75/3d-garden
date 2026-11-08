# Thỏ nhảy né vật

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../src/ARCHITECTURE.md). Bộ đo: [bunny-probe](bunny-probe/README.md).

## Mã

- `animals/bunny/hop.js` — `bunHop(b, dt, want, v, hz, o)`: 1 khung nhảy theo hướng muốn, trả độ nhấc thân (`o.dd`: còn bao xa · `o.free`: bỏ va chạm); `bunAir(b)`: đang bay; hằng `BHOP`. Gọi từ `body.js`, `life.js`, `burrow.js`, `shelter.js`, `carrots.js` (cùng thư mục).
- `body.js` `bunnyTick`: đếm `b.fr`, đo lại mặt đứng `b.sy` khi không bay, `bunnyFall`, `bunnyYaw` (≤ 15 rad/s); `b.col` mặt nạ 7, bỏ lớp xe chỉ trong 1,2 m cuối tới chỗ trú (bỏ cả quãng thì chui qua bánh, bậc xe).
- Lõi: `core/collide.js` (`colSub` ô con 3,1 cm, lớp 4 riêng thỏ, `colWalkY`), `core/flow-field.js` (`buildFlowField` tham số `X`: bậc + cạnh chặn).

## Cách nhảy

- Mỗi cú: pha chạm đất (gập người, xoay `BHOP.YAW` 7 → 14 rad/s) rồi pha bay đạn đạo. Gọi liền mỗi khung: hụt 1 khung (`b.fr`) là lấy đà lại.
- Chỉ lập kế hoạch lúc chạm đất (`bunPlan`): 31 hướng quanh `want`, ưu tiên hướng mà xoay, đường bay, chỗ đáp và cú sau đều thoáng. Không được thì lùi ra, rồi trụ mông → trụ đầu → cuộn người.
- Thân = viên nang mông → đầu (`bunFree`, `BHOP.A/B/R` × `b.g.scale`) thử từng ô con. Mặt đứng `bunSup`: đất hoặc đỉnh vật lớp 0/2/4; lên ≤ 0,65 m, xuống ≤ 1,25 m, khe ≤ 0,45 m bay qua; `bunArc` vọt qua mép bậc / vật thấp, trần thấp thì hạ đỉnh.
- `bunNav()` dựng 1 lần khi `COL.ready` (hộp ±30 m quanh hang + chỗ trú): `BUN_NAV` (1 cấm · 2 vật thấp phủ kín: đi vòng, không đứng) + `BUN_NX` (cao đất, cạnh cắt vật lớp 4) ⇒ ghi đè tại chỗ `bunnyField`, `bunnyBurrow.field`.
- Nằm trong vật: `bunDepen` bò ≤ 0,4 m/s ra phía ngược vật (về chỗ thoáng gần nhất thì có lúc xuyên ống mảnh); không bật được liền 8 s ⇒ `b.col.ghost = 2`. `b.hp.stuck` còn là luật "coi như tới" của `life.js`, `shelter.js`.

## Bẫy

- Đừng dùng dấu chân chung `colFootHits` / `colSlide` cho thỏ (5 điểm cách 12–16 cm: cọc 4 cm lọt, đầu / mông ngoài dấu chân), cũng đừng thử từng bước mỗi khung (lao vào vật rồi quay ngoắt).
- Lái bằng `want` / `b.want`, đừng xoay thẳng `b.ang`: giằng co với kế hoạch, thân xoay giữa không trung.
- Đổi trạng thái chỉ khi `!bunAir(b)` (đừng cắt ngang cú bay).
- Bảng gốc (`ffBlocked`) thiếu hệ biogas, khối xe ⇒ ngõ cụt: gọi `bunNav()` trước `ffDir`.
- `colBuildTick` bỏ mặt ngang sát đất ⇒ cột giữa hộp chỉ còn mặt trên: ngưỡng `gr` 0,49 trong `bunSup` phải ≥ vật đứng lên được (hạ là hết đứng lên hộp). Vì vậy vật 0,5–0,65 m không đứng được; mặt bàn, sàn chuồng gà cố ý không.
- Dời thỏ bằng mã phải đặt `b.sy = undefined`: không thì mang mặt đứng chỗ cũ, tưởng đứng trên vật, lấn rồi bò.
- `BHOP.R` phải phủ hết lưới thỏ (đùi). Cuộn người chỉ là cách cuối: lưới không cuộn theo viên nang ⇒ đầu / mông lấn.
- Vật < 12 cm nằm dưới dải viên nang: chỉ đáp khi 4 chân cùng mặt (`BHOP.lv`), `bunArc` bay qua đỉnh, vật rộng (luống, lòng bếp) là ô 2.
- Lớp 4 chỉ thỏ dùng: con khác vẫn xuyên vách trong suốt, dây rào, ống biogas. Thỏ vẫn xuyên dây néo cột khí tượng (nét kẻ), đồ `noCollide` ngoài biogas.
- Cố ý bỏ va chạm: 0,5 m cuối tới chỗ ngồi ăn (`free`, chỗ ngồi cách ván luống 17 cm), đoạn chui vào hang (cửa trong vách bậc).
- Chỗ trú `bunnyShelter` phải thoáng mọi hướng cho viên nang (dò bằng `bunny-probe/bun-shmap.js`).
- Đứng im lâu gần luống thường do chó (`bunnyDogNear`: bỏ luống, hoãn 40 s), không phải kẹt.
- Chưa làm: bảng dẫn đường tới gốc cây / gầm chuồng gà (chạy trốn vẫn lao thẳng); tai cụp khi chui gầm (tai chạm sàn chuồng gà).
