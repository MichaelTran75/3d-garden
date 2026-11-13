# Gió và cây

<!-- toc -->
- Mã · 1.8 KB
- Gió và cây · 6.3 KB
- Cành và vỏ · 1.3 KB
- Cổ thụ: tán kiểu bonsai · 3.0 KB
- Cổ thụ: rễ, bóng trời · 1.3 KB
- Táo, khói · 1.8 KB
- Nước, mây · 2.7 KB
- Bẫy · 1.4 KB
- Gỡ lỗi · 0.2 KB
<!-- /toc -->

## Mã

- `nature/wind-physics.js`: `sceneWind`, `updateSceneWind`, `windAt`, `windVec` (`WIND_GLSL_COMMON`), `windMap`, `windMapSample`, `makeTreeWind`, `treeWindAt`, `windShader`, `grassWindShader`, `forestWindShader`, `flowerWindShader`, `leafHexGeo`
- `world/weather-mast.js` `weatherMastTick`: chén đo gió + chong chóng cột quay tỉ lệ tốc độ gió tại trục (`sceneWind.ms` × gió giật `windAt`): ω = k·(V − 0,3 m/s), k chén 1,75 / chong chóng 3,5; quán tính ngắn dần khi gió mạnh; trần 0,42 × góc đối xứng / dt (quá ⇒ trông đứng / quay ngược). Đo ở bước 1/20 s chạm trần sớm (chén 17,6 rad/s)
- `nature/wind-field.js`: vật cản, độ phơi → `fluids.initWind`; `forestLeafCtl` lá rừng rụng theo cơn giật
- Lá rơi chỉ theo gió: rừng + táo `(gió/WIND_SREF)^2,6 × giật^1,5` (táo × 0,9, điểm từ `appleFrom`); anh đào `rate0F` ⇒ nền `rate0 × min(2, F)`, lặng gió không rụng
- `nature/fluids.js`: Worker `fluidKernel` (gió NS 2D, khói `addSmoke`, nước nông); vào Worker qua `toString()` ⇒ chỉ đọc tên được chèn đầu Blob (`GRAV`); tên ngoài khác ⇒ Worker dừng, `onerror` chuyển nhân về luồng chính (`fluids.threaded()` = false, +1,5 ms / khung)
- `nature/flowers-trees.js`: `recTree` (`natural` → `natTree`), `barkTubes`, `barkMesh`, `ropeChain`, `ropeAt`, `bkAttr`
- `nature/forest.js`: rừng (`recbranch*`), `fruitTree` (`ft1`–`ft3`), anh đào, khúc gỗ chết
- `nature/old-tree.js`: cổ thụ, cây con, `oldTreeRoots`, `stoneRing` (ground-moss.md) · `nature/old-tree-shade.js`: `OT_SHADE`
- `core/sky-shade.js`: `skyShadeMat`, `skyAt`, `skyOnLayer` · `core/surface-style.js`: `surfaceStyle(mat, 'bark')` · `nature/water-leaves.js`: `makeLeafFall`, `updateLeafFall`

## Gió và cây

- Gió = NS `uWMap` (ô 2,4 đv, Worker, gió tự do = 1) × profile log + 6 mode Fourier trôi
- Bản đồ về bất đồng bộ: thử ⇒ `await` giữa khung (`sim2` đồng bộ ⇒ đứng yên); không vật cản (drag 0, expo 1) phải = gió tự do
- wind-field.js sau mọi công trình, rừng trong manifest (vật cản dựng 1 lần); tán cản thưa ≤ 0,3 / đv
- Cây có thân (cổ thụ, anh đào): lò xo 2 chiều + 3 cành, 120 Hz → `uBend`, `uBr`; `tw.shake`, `tw.F` bứt lá (`o.shake0`)
- Cổ thụ: gió theo từng cành (`makeTreeWind({ bough, spray })`, `boughSetup` / `boughDrive` / `boughStep` / `boughOut`). Mỗi cành chính 2 dao động (ngang ⟂ trục `h`, `n` = h × trục), gió lấy tại ngọn cành, tần số 6 / dài (0,45–2,2 Hz), kích bằng nhiễu trắng + gia tốc thân; ra `uBgh[8]` (dịch chuyển ngọn, thế giới), đỉnh nhận × `boughW(s)` = s²(1,5 − 0,5 s)
- Dữ liệu đỉnh `aBr` (4 byte chuẩn hoá): số cành 1…8 · s dọc cành · pha chùm 1…255 · k / 1,5. Vỏ (`barkTubes` `o.br`) + lá (thuộc tính theo bản thể) cùng công thức ⇒ lá bám nhánh. Nhánh con thừa hưởng s tại chỗ mọc; `spray` cấp 1 = 1 chùm (pha riêng), k tăng dọc chùm, uốn theo k²: đẩy xuôi gió + phẩy (`uBghT` z, w; pha `uBghT.y` quấn ở 2π·100)
- `uBghT.x` = cờ bật (thuộc tính chung không có mặc định tin được ⇒ cây khác đọc `aBr` rác nhưng cờ 0). Cây có cành: `uBr` = 0, 3 thuỳ vẫn tích phân cho `tw.shake`
- `treeWindAt` (cò, bướm đậu): thân + `boughAt` (cành gần nhất, không có phần chùm). `tw.bghOff = true` ⇒ về 3 thuỳ (so sánh trong 1 trang)
- Số cổ thụ: 7 cành (dài 3,3–17,2 đv, cành sông + phần nối = 1 cành); ngọn cành lệch ≤ 0,19 đv ở 25 km/h, ≤ 0,28 ở 40; +2 KB gzip, lượt vẽ / chương trình không đổi, thời gian khung trong nhiễu đo (bật / tắt trong 1 trang lệch < 0,1 ms)
- Anh đào: xương từng cành (`makeTreeWind({ rig })`, `rigSetup` / `rigDrive` / `rigStep` / `rigOut`). Mỗi chi của `recTree` = 1 xương (161, trần 256, cha đứng trước con; xương 0 = thân, đứng yên, thân vẫn uốn bằng `uBend`). Mỗi xương 2 góc dao động tại gốc chi (trục `h` = trục chi × phương đứng, `n` = h × trục), gió lấy tại ngọn chi, tần số `freq` / dài (kẹp 0,6–3 Hz), biên độ `amp` × `grow`^(cấp − 1), thêm nhiễu trắng + gia tốc khớp cha (`RIG_KAPPA`); góc kẹp `RIG_QMAX` 0,35 rad
- Động học xuôi trên CPU: Q = Q cha · δq, ghi vào bảng `uRig` 256 × 2 RGBA32F (hàng 0 quaternion, hàng 1 tịnh tiến), shader đọc bằng `texelFetch`. `aBr` của cây có xương: xương · trọng số s(2 − s) dọc chi · xương cha · 0; đỉnh trộn cha → mình theo trọng số ⇒ khớp liền, không hở. Hoa / lá (thuộc tính theo bản thể) mang xương của chi mọc ra ⇒ đi theo cành
- Chương trình riêng `treeWind4r` (`#define TREE_RIG`); cây khác giữ `treeWind4`. `tw.rigOff = true` ⇒ về cành mềm theo công thức (`uTreeDim.w` + 3 thuỳ), bỏ cả `rigDrive` / `rigStep`; `?rig=off` ⇒ không dựng xương, không `aBr`, chương trình cũ
- Số anh đào: ngọn nhánh lệch trung bình 0,06 đv / lớn nhất 0,34 ở 25 km/h, 0,11 / 0,51 ở 40; tần số theo cấp 1,0 / 1,4 / 1,9 / 2,3 Hz; +2 KB gzip, +3–4 chương trình, lượt vẽ không đổi, CPU 0,03 ms / khung, thời gian khung bật / tắt trong nhiễu đo
- Táo `ft1`–`ft3`: bộ xương gọn `recTree({ rig, rigDepth: 2 })` — thân + cành cấp 1–2 có xương riêng (26 / 16 / 39 xương), cành sâu hơn đi cứng theo xương tổ tiên (trọng số 1). `makeTreeWind({ lean: 0, branchAmp: 0, sway: 0.5, rig: { amp: 0.09, grow: 1.5, freq: 2.2 } })`. Chùm lá đầu cành theo `tipW`, chùm giữa tán theo `bindAt(x, y, z)` (điểm trục cành gần nhất → [xương, trọng số, xương mẹ])
- Bản CPU `rigAt(tw, bind, p, out)` = `rigMove` của shader: quả táo (`apple-drop.js`, `a.bind`), móc hộp tổ chim (`songbird.js`) đi theo cành, lệch 0 mm so với lưới. `userData.rigBind`, `rigLimbs` trên cây
- `treeRigHold(tree, sec)`: có người hái / gấu mèo trèo / quả còn lắc ⇒ xương về tư thế nghỉ trong 0,35 s, hết giữ thì đung đưa lại (đường trèo `raccoonRoute` + tầm tay hái tính trên tư thế nghỉ)
- Số táo: +2 chương trình, +0 lưới, +0,15–0,19 ms / khung (3 cây)
- Cổ thụ (nature/old-tree.js): 56 xương = thân + 7 cành chính + 48 chùm cấp 1 (`spray`). `makeTreeWind({ lean: 0.45, branchAmp: 0.07, sway: 0.5, rig: { amp: 0.085, grow: 2.6, freq: 6 } })`, chùm `fq: 2.5` (tần số riêng của xương, thay `rig.freq`). Chùm mọc lệch tim cành mẹ ⇒ xương mang `pw` = 1 − độ lệch: phần quay + tịnh tiến của cha nhân `pw` (`rigStep` / `rigOut`); byte thứ 4 của `aBr` = độ lệch, shader + `rigAt` nhân (1 − w) vào phần cha. `barkTubes({ rig })` ghi `rigBytes` thay `brBytes`. `userData.rigLines` = đường tim cành → `rigNear` (đoạn gần nhất, ≤ 8 m) trong `treeWindAt` ⇒ cò / bướm đậu đi theo xương
- `?rig=off` ⇒ cổ thụ về gió theo cành `bough` + `spray` (mục trên); `tw.rigOff` trong trang ⇒ chỉ 3 thuỳ + uốn thân, không về `bough`
- Số cổ thụ có xương: ngọn 7 cành lệch lớn nhất 0,08–0,22 đv ở 25 km/h (bản `bough` 0,06–0,20), hiệu dụng 0,034–0,080 (0,035–0,099); chương trình 180 → 178, +1 lưới, +1 KB gzip, thời gian khung trong nhiễu đo
- Giới hạn xương: anh đào + táo `treeWindAt` chỉ thân ⇒ chim / bướm đậu không theo xương (cổ thụ có `rigNear`); cây khác không xương; đổi `recTree` ⇒ số xương đổi, quá 256 phải tăng bảng
- Rừng, cỏ, hoa tựa tĩnh tại chỗ; rễ không gió
- Bản đồ gió giải theo đơn vị chuẩn hoá (giải theo tốc độ thật rồi chia gió tự do ⇒ tỉ số > 1 khi gió đổi). Biên: mép gió vào ∂p/∂n = 0, mép ra p = 0, + vài ô đệm (thiếu ⇒ sọc mép).

## Cành và vỏ

- `barkTubes(L, o)`: L `{ P, R, par, kids, atEnd, root, pr, pT }`; con ở ngọn lệch < 60° nối 1 ống Catmull–Rom
- Đầu chuỗi: 0 gốc (`sink`, `flare`, `lobes`) · 1 ngọn mẹ (lùi 1,4 r) · 2 ngang (từ tim mẹ, cổ +30 %)
- Ra: `aBk` (vân; phần lẻ z = bán kính), `aBd` (0 · ≤ 1 sợi bện · ≤ 1,49 hốc), `segs[8–10]` (chim đậu), `userData.flightBounds` (cần từng đoạn cả cây, thiếu ⇒ ong, bướm không tới hoa dưới tán)
- `bkAttr` phải ghi `aBd` = 0 (thiếu ⇒ `bakeStatic` gộp `barkTubes` lỗi `mergeGeometries`)
- `o.rope`: sợi bện khi r·`wS` ≥ `minR`
- `mat.userData`: `sfOld` (cổ thụ, cây con, cành chết, rễ; cổ thụ `nodes: false`) · `sfApple` (táo, camp.md) · `sfTex` (anh đào `src/models/bark-scan.jpg`; lỗi ⇒ thủ tục) · `sfL` địa y (tần số dọc thân cao)
- Rêu: `sfMoss` chân thân · `sfTop` mặt trên (mặc định 1 nếu `sfOld`; rễ 1,6 · gỗ chết 1,8 · `ft3` 0,5 · anh đào 0,15) · `sfTopW` hạt theo toạ độ thế giới, chỉ vật đứng yên (gió ⇒ hạt trôi)
- `sfNw` tuần hoàn chu kỳ nguyên (không ⇒ đường may); hạt rêu theo vân chu kỳ 18·bm
- Không hạ độ phân giải lá (`leafHexGeo` 4 tam giác, lá sen, lá rụng)

## Cổ thụ: tán kiểu bonsai

- Thân nghiêng (`rotation.z` 0,62) ⇒ tán dựng trong hệ thẳng đứng W, đổi về hệ nhóm qua `toL` / `toW`
- Ngọn dẫn `AX` uốn chữ S, cành chính (`bough`) mọc so le ở mặt ngoài mỗi khúc cong, gần ngang, hơi rủ, ngắn dần lên đỉnh; cành thấp nhất mọc từ thân, ngược phía nghiêng; đỉnh = vòm 5 nhánh + 1 nhánh ngọn
- `spray`: chẻ đôi 2 cấp, mỗi đầu nhánh 1 mục `pads` (tâm, bán kính ngang `rh`, dày `rv`)
- Tán lá kiểu tán táo: mỗi `pads` = 1 đám lá rải đều TRONG KHỐI bầu dục (1 khối chính 56 % + 2 khối con lệch tâm 22 %), tâm nhô trên ngọn cành; ngang `CLOUD` (1,6) × `rh`, cao = ngang × min(1,15, 0,8 + 0,6 × `rv` / `rh`) (đám gần tròn), tâm nâng lệch nhau 0,15–0,55 × cao. Đám kề nhau chồng thành khối u tròn dọc cành chính ⇒ dáng bonsai do thân + cành, tán không thành tầng dẹt. Tổng lá ≤ `LEAF_MAX` (14 500), chia theo `rh`² × `rv`
- Cành sông: đoạn to dựng tay giữ nguyên (cò đậu: `storkBranchPieces` đoạn 2, 3) → `RV`; nối liền 1 `bough` (`atEnd`) ra mặt nước + 1 nhánh ở phía khuất; không tầng lá trên chỗ cò đứng
- `mainBranches`: [0] cành sông, [1…] cành chính tán (`crownLines`), cuối = phần nối cành sông; bướm trú mưa dùng [1]–[4]
- Hạt giống: 7777 thân + cành sông + cành chết · 7801 cành tán (`bR`) · 7811 lá · 7791 chồi · 1234 cây con · 4242 rễ. Cành sông đứng đầu vòng cành ⇒ chỗ cò không đổi khi sửa tán
- `L.clean`: cành tán không mọc chồi gai
- Gió theo cành: mỗi cành `L.bg` (số), `L.sp` (cấp chùm), `L.W[j]` = [cành, s, pha, k, ks] tính sau khi dựng xong `LB`; `twigs` / `pads` mang `L` + chỉ số điểm để lá lấy đúng `W`; `userData.boughs` = đường tim cành cho `boughSetup`. Thêm cành chính thứ 9 ⇒ tăng cỡ `uBgh`
- Bẫy: nhánh bên không qua tim đầu cành mẹ, không mọc cùng độ cao (vệt vòng); cành nối `atEnd` vào chuỗi sợi bện ⇒ cả chuỗi dày vòng (r đầu ≥ 0,121)
- Lá lẻ (`twigs`): `TW` (2000) lá trong ống quanh cành chính + nhánh chẻ, chia theo chiều dài; bỏ điểm gần cành chết (`nearDead`). 1 lưới lá, 14 406 lá
- Bẫy tán: cụm dẹt (mặt vòm + đáy phẳng) nhìn ngang thành đĩa; đám cao < 0,7 × ngang + tâm cùng độ cao dọc cành ngang ⇒ vẫn thành tầng dẹt; > 17 000 lá ⇒ tán đặc
- Biên độ gió riêng từng cây: `makeTreeWind({ sway })` nhân vào `lean`, `branchAmp`, `bough`, `spray`, `rig.amp`, rung + ngả lá (`windShader`); cổ thụ + anh đào 0,5, cây khác 1. CPU (`treeWindAt`) đọc cùng trường ⇒ cò / bướm đậu vẫn khớp. Đo: `tw.bx` / `tw.bz`, `tw.bgh[i].d` sau 700 khung gió 25
- Đo: lá thấp nhất cách đất 3,2 m; cột thân 3 cò 0 lá; 6 chỗ bướm đều trúng vỏ

## Cổ thụ: rễ, bóng trời

- `oldTreeRoots`: rễ chính từ múi bạnh, lách `OBST` (`oldTreeStones` + gốc cây con); rễ con từ tim mẹ; đoạn lộ gặp rễ khác ⇒ vắt trên
- Rễ bắt đầu trong lòng thân (`pr`, `pT` như cành kind 2), độ lộ giảm đơn điệu rồi cắm dốc; lặn rồi trồi / chui dưới đá ⇒ khúc rời lơ lửng
- `ground()` (rễ), `groundAt` (đá) +0,12 đĩa đất dưới mặt đất quanh gốc: để nguyên
- Bóng trời chỉ nhân `reflectedLight.indirectDiffuse`, không tấm phủ / quầng (`groundContact`); A tán: ô 0,5 m từ điểm lá, mặt đứng nhận 75 % (đủ ⇒ thân chiều đen); B sát đất: `aoBake` floor ô 5 cm, chắn chụp lúc dựng (`aoVoxNow`), nướng lần đầu zoom ≥ ×4 gần gốc; `OT_SHADE`
- `skyShadeMat(mat, tag, { cav, cavP, vtx, skA })`; module khác: `skyOnLayer` + `skyAt` tính sẵn theo lớp ≤ 4 ms / khung
- Shader vỏ nặng: không thêm đọc ảnh / điểm ảnh (bóng trời ở đỉnh `vtx`, hốc dùng lại `sfCv`); lá rêu tính sẵn CPU (`aSk`)
- Lớp bóng hiện khi tính sẵn xong (`SKY.pend`); chụp thử chờ `SKY.pre.length + SKY.pend.length` = 0; mất ngữ cảnh không nướng lại (`doneB`)

## Táo, khói

- `ft1`, `ft2` cạnh trại, hái được; `ft3` táo già: `noPick`, cản r 0,75, `colR` 1 (giữ rễ choãi), `FT3_X/Z/YAW` (dời ⇒ đo lại khe cành cụt gỗ chết); dời `ft1` ⇒ mọi thứ đọc `ft1` dựng sau dòng dời
- Táo rụng `nature/apple-drop.js` (`appleFall`, tick 'wild' 60): quả rời cành theo nhịp `RATE0` (+ cơn giật `RATE_K`), nghỉ `GAP` s / cây, hạn mức / ngày theo số quả (3–8). Thân = `looseBody` (`walking.md`), quả vẫn là con của cây ⇒ 0 lưới, 0 lượt vẽ thêm
- Chỉ rụng quả: đường rơi hở cành ≥ `CLEAR`, dưới là đất trống (`UNDER`), kỹ sư không với tới (`a.pick`), không con nào đứng dưới, cây trong khung + quả ≥ `PX_MIN` px. Kỹ sư / chó / thú đi ngang đá quả lăn (`kicks`); gấu mèo + hái táo bỏ qua quả đã rụng (`ap.on`)
- Quả nằm tới 05:00 giờ cảnh rồi về cành (`back`), hạn mức đặt lại. Ép rụng khi đo: `appleFall.force(cây, quả)`
- `fluids.addSmoke(cfg, look)` → `id` theo manifest (0 lửa trại · 1 chiminea · 2 bếp xe); Worker chỉ tính `on` (`SMS[id]`); nón ống khói `cfg.lid` = ô đặc (`lidZero`); mưa: `campRainTick` (camp.md)
- Hơi dập, khói âm ỉ nhân cỡ lửa theo giờ (không ⇒ ban ngày trùm khung); đèn chiminea tắt = cường độ 0, không bỏ đèn (số đèn đổi ⇒ biên dịch lại tất cả)
- Khói NS ô nhỏ (ống khói 3,2 cm, ống bếp 1,8 cm): khuếch tán hiện chỉ ổn khi dt·ν/H² ≤ ~0,2 (ν 0,045 ⇒ nổ ±60 sau ~100 bước) ⇒ `inlet` kẹp `nuMax = 0,18·H²·30` (lửa trại ô 8 cm giữ trần cũ). Ống nhỏ: khói vào = nồng độ khí thải (max), không cộng dồn theo dt.

## Nước, mây

- Nước nông trong `fluidKernel`: ma sát đáy Manning `cf = g·n²/h^⅓` (`MANNING` 0,035; tính lại mỗi 8 bước, sâu kẹp ≥ 5 cm), nhớt xoáy Elder `ν = 0,6·u*·h` (`ELDER`), gió kéo mặt nước theo ô từ bản đồ gió (`windOnWater`)
- Cú chạm `splashWater`: hố + gờ cùng thể tích (tổng mực = 0); mưa không làm hụt mực
- Mưa → bể chứa `fluids.runoff` (lên 40 s, rút 240 s): gửi Worker `flood` ⇒ cửa xả mạnh hơn (`jetK`), mực đích cao hơn (`rise`); mặt nước ngả màu phù sa `WATER_SILT` × 0,3 (`updateWaterLook(rain, dt)`, `core/sky-sun-moon.js`)
- Mặt nước: mảng gió giật trôi theo gió (`uWDrift`, `uWMap`) ⇒ gợn dày chỗ gió mạnh
- Mây `nature/clouds-rain.js` `cloudAirNow()` → `cloudAir { base, conv, lean }`: đáy mây = mực ngưng tụ từ nhiệt độ + điểm sương (Magnus), kẹp `CLOUD_Y0`–`CLOUD_Y1`; `conv` đối lưu theo giờ (đỉnh 14:30, sàn 0,45, mưa ⇒ 1); `lean` nghiêng theo gió, tăng theo độ cao
- Tháp mây (`c.tw[]`): mỗi tháp 1 luồng khí, chu kỳ 90–200 s (lớn ⅓, tan ⅔); `cloudForm` kéo tháp 0,65–1,2 lần theo sức luồng, ngọn tan khi yếu; chiếu sáng lại chỉ khi đổi > 0,1 (`reform`)
- Bẫy: Laplace nhớt đọc ô kề ⇒ hàng / cột biên lưới phải chặn chỉ số (sông ra khỏi bản đồ ở 2 đầu z: đọc ngoài mảng = NaN, mặt nước biến mất, không báo lỗi)
- Đo: `docs/physics-probe/unit.cjs` (3 phép thử nước: tên trong Blob, thể tích cú chạm, sông chạm biên lưới)
- Cây thuỷ sinh `nature/water-plants.js` (sau `nature/lotus.js`): 17 cụm quanh khu cá koi, 5 kiểu (`val` rong lá hẹ dải dài ngả theo dòng, `horn` rong đuôi chồn, `lud` rau dừa đỏ lá mọc đối, `cryp` ráy nước hoa thị sát đáy, `grass` cỏ nền). 1 lưới 'Cây thuỷ sinh' + 1 vật liệu Lambert màu đỉnh; đung đưa trong shader đỉnh theo `aSw` (độ mềm, pha, số cụm, cao trên gốc), sóng chạy gốc → ngọn, tần số thời gian bội 0,1 (đồng hồ gió quay vòng); `uNudge[20]` = cú rung từng cụm khi cá rỉa (`S.nudge(k)`, tắt dần trong `update`)
- Chỗ đặt: nước sâu 0,6–1,2 m (mặt nước gần đục ⇒ sâu hơn không thấy), ngọn dưới mặt nước, ngoài lá sen. Mỗi cụm không phải thảm báo cho cá qua mặt `spot({ x, z, r, top, kind: 'plant', nudge })`, lá sen báo `kind: 'pad'`. Thêm cụm: trần 20 (`NCL`)
- Số cây thuỷ sinh: +1 lưới, +1 chương trình, +3 KB gzip, thời gian khung trong nhiễu đo

## Bẫy

- `windShader` GHI ĐÈ `onBeforeCompile` ⇒ gọi trước `surfaceStyle`, `skyShadeMat`, `mossCoat` (nối tiếp)
- Khớp CPU ⇄ GPU: `windAt` ⇄ `windVec`, `treeWindAt` ⇄ `treeWind` (cò, bướm đậu đọc CPU), `appleRidge` ⇄ `sfARidge` (vỏ táo, băm số nguyên 32 bit, `core/surface-style.js`): sửa cả hai
- Tìm vật theo tên (`SOLID`, `getObjectByName`, regex core/collide.js): đổi tên ⇒ grep tên cũ
- Giữ chuỗi `rnd()` dựng cây (táo, hoa, hộp tổ, chỗ đậu theo nó): ngẫu nhiên mới ⇒ RNG riêng (gai 7791); mắt cành băm theo chiều dài; `crookedLimb` theo độ dài danh nghĩa (`ln * 0.52202`)
- Texture tạo lúc chạy lệch `Math.random` (uuid) ⇒ bọc như `skyLayer` (`SKY.rnd`)
- Cành con: không qua tâm đầu mẹ (chữ S), không trồi cùng độ cao (vệt vòng)
- Lượt độ sâu `barkMesh` lùi `polygonOffset` 1 / 2: độ sâu 2 lượt không trùng từng bit (Metal) ⇒ không lùi thì vỏ lốm đốm khi camera trượt
- Vỏ trong suốt (táo, anh đào): cần lượt chỉ độ sâu `barkMesh`; clone vật liệu vỏ ⇒ gỡ userData trước (vòng `treeWind` ⇄ `depthMat`)
- `core/mem-trim.js` bỏ mảng CPU lưới `aBk`: sau `COL.ready` `getX` lỗi null ⇒ chụp lúc dựng (`aoVoxNow`) / trước `COL.ready`
- `freeTree` (`nature/flowers-trees.js`) né đường + mặt đập.

## Gỡ lỗi

- `fluids.windCfg()`, `windMap` (half-float `halfF`), `oldTreeWind.shake`, `SKY.stat`; ép mưa `__ev('rainTarget = () => 0.8')`; soi chuỗi cành: vá `barkTubes` qua `__ev`; dò cổ thụ `docs/co-thu-probe/` (testing.md)
