# Gió và cây

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.1 KB
- Gió và cây · 0.5 KB
- Cành và vỏ · 1.0 KB
- Cổ thụ: rễ, bóng trời · 0.6 KB
- Táo, khói · 0.5 KB
- Bẫy · 3.5 KB
- Gỡ lỗi · 0.2 KB
<!-- /toc -->

## Mã

- `nature/wind-physics.js` — `sceneWind`, `updateSceneWind`; `windAt` (CPU) = `windVec` (GPU, `WIND_GLSL_COMMON`); `windMap`, `windMapSample`; cây có thân `makeTreeWind`, `treeWindAt`; shader `windShader`, `grassWindShader`, `forestWindShader`, `flowerWindShader`; lá `leafHexGeo`.
- `nature/wind-field.js` — vật cản + độ phơi gió → `fluids.initWind`; lá rừng rụng theo cơn giật `forestLeafCtl`.
- `nature/fluids.js` — Worker `fluidKernel`: bản đồ gió NS 2D, khói `addSmoke`, nước nông.
- `nature/flowers-trees.js` — `recTree` (`natural` → `natTree`), `barkTubes`, `barkMesh`, `ropeChain`, `ropeAt`, `bkAttr`.
- `nature/forest.js` — cây rừng (vegPools `recbranch*`), `fruitTree` (`ft1`–`ft3`), anh đào, khúc gỗ chết.
- `nature/old-tree.js` — cổ thụ, cây con, `oldTreeRoots` (đá `stoneRing`: ground-moss.md). `nature/old-tree-shade.js` — bóng dưới tán (`OT_SHADE`).
- `core/sky-shade.js` — `skyShadeMat`, `skyAt`, `skyOnLayer`. `core/surface-style.js` — vỏ `surfaceStyle(mat, 'bark')`. `nature/water-leaves.js` — `makeLeafFall`, `updateLeafFall`.

## Gió và cây

- Gió = bản đồ NS (`uWMap`, ô 2,4 đv, giải ở Worker với gió tự do = 1) × profile log + nhiễu 6 mode Fourier trôi theo gió.
- Vật cản dựng 1 lần ⇒ wind-field.js đứng sau mọi công trình, rừng trong manifest; tán = cản thưa ≤ 0,3 / đv.
- Cây có thân (cổ thụ, anh đào): lò xo 2 chiều + 3 cành ghép, bước 120 Hz → `uBend`, `uBr`; `tw.shake`, `tw.F` bứt lá (ngưỡng `o.shake0`). Rừng, cỏ, hoa: tựa tĩnh theo gió tại chỗ. Rễ không gắn gió.

## Cành và vỏ

- `barkTubes(L, o)`: L = bản ghi cành `{ P, R, par, kids, atEnd, root, pr, pT }`; cành con ở ngọn lệch < 60° nối thành 1 ống Catmull–Rom. Đầu chuỗi: 0 gốc (`sink`, `flare`, `lobes`) · 1 ở ngọn mẹ (lùi 1,4 r vào lòng mẹ, vân + pháp tuyến hoà từ mẹ) · 2 mọc ngang (từ tim mẹ, cổ cành +30 %).
- Ra: `aBk` (vân; phần lẻ của z = bán kính), `aBd` (0 cành thường · ≤ 1 rãnh sợi bện · ≤ 1,49 lòng hốc), `userData.flightBounds`, `segs[8–10]` (điểm giữa thật cho chim đậu). `o.rope`: sợi bện xoắn khi r·`wS` ≥ `minR`.
- `mat.userData` vỏ: `sfOld` (cổ thụ, cây con, cành chết, rễ) · `sfApple` (táo — camp.md) · `sfTex` (anh đào: `src/models/bark-scan.jpg`, tải lỗi ⇒ vân thủ tục) · `sfL` địa y. Rêu: `sfMoss` chân thân, `sfTop` mặt trên (mặc định 1 nếu `sfOld`; rễ 1,6, khúc gỗ chết 1,8, `ft3` 0,5, anh đào 0,15), `sfTopW` hạt theo toạ độ thế giới.

## Cổ thụ: rễ, bóng trời

- `oldTreeRoots`: rễ chính mọc từ múi bạnh (đo trên lưới vỏ), lách vòng ôm `OBST` (`oldTreeStones` + gốc cây con); rễ con mọc từ tim rễ mẹ; gặp rễ khác ở đoạn lộ thì vắt qua trên.
- Bóng trời chỉ nhân `reflectedLight.indirectDiffuse`. Lớp A tán: ô 0,5 m từ điểm lá thật. Lớp B sát đất: `aoBake` floor ô 5 cm, ô vật chắn chụp lúc dựng (`aoVoxNow`), nướng lần đầu zoom ≥ ×4 gần gốc. Thông số `OT_SHADE`.
- `skyShadeMat(mat, tag, { cav, cavP, vtx, skA })`; module khác tính sẵn theo lớp qua `skyOnLayer` + `skyAt`, ≤ 4 ms / khung.

## Táo, khói

- `ft1`, `ft2` cạnh trại (hái được) · `ft3` táo già (`noPick`, vật cản r 0,75, `colR` 1 để lớp va chạm giữ rễ choãi) đặt theo `FT3_X/Z/YAW` — dời thì đo lại khe với cành cụt khúc gỗ chết.
- `fluids.addSmoke(cfg, look)` → `id` theo thứ tự manifest (0 lửa trại · 1 chiminea · 2 bếp xe); Worker chỉ tính nguồn `on` (`SMS[id]`). Nón ống khói: `cfg.lid` = ô đặc (`lidZero`). Lửa khi mưa: `campRainTick` (camp.md).

## Bẫy

- `windShader` GHI ĐÈ `onBeforeCompile` ⇒ gọi trước; `surfaceStyle`, `skyShadeMat`, `mossCoat` nối tiếp ⇒ gọi sau.
- Cặp CPU ⇄ GPU phải khớp: `windAt` ⇄ `windVec`, `treeWindAt` ⇄ `treeWind` (cò, bướm đậu đọc bản CPU), `appleRidge` ⇄ `sfARidge`.
- `fluidKernel` vào Worker bằng `toString()`: không đọc biến ngoài hàm.
- Bản đồ gió về bất đồng bộ: thử thì `await` giữa các khung (tua đồng bộ `sim2` ⇒ bản đồ đứng yên); không vật cản (drag 0, expo 1) phải ra đúng gió tự do.
- Vật được tìm theo tên (`SOLID`, `getObjectByName`, regex ở core/collide.js): đổi tên thì grep tên cũ.
- Dựng cây giữ nguyên chuỗi `rnd()` (táo, hoa, hộp tổ, chỗ đậu theo nó): ngẫu nhiên mới dùng RNG riêng (gai 7791), mắt cành băm theo chiều dài, `crookedLimb` chia theo độ dài danh nghĩa (`ln * 0.52202`).
- Cành con: đừng ép qua tâm đầu cành mẹ (chữ S lòi gờ), đừng cho nhiều cành con trồi cùng 1 độ cao (vệt vòng).
- Vỏ trong suốt (táo, anh đào) cần lượt chỉ ghi độ sâu của `barkMesh` (thiếu ⇒ đoạn lồng nhau đậm lên); clone vật liệu vỏ thì gỡ userData trước (vòng `treeWind` ⇄ `depthMat`).
- Lưới vỏ cả cây cần `flightBounds` từng đoạn (thiếu ⇒ ong, bướm không tới hoa dưới tán); `bkAttr` phải ghi `aBd` = 0 (thiếu ⇒ `bakeStatic` gộp với `barkTubes` lỗi `mergeGeometries`).
- Nhiễu quanh thân phải tuần hoàn chu kỳ nguyên (`sfNw`), không thì lộ đường may; hạt rêu theo vân chu kỳ 18·bm; địa y cần tần số dọc thân cao (thấp ⇒ vệt dọc).
- `sfTopW` chỉ cho vật đứng yên: cây có gió thì hạt rêu trôi khi cành lắc.
- Cổ thụ giữ `sfOld`, `nodes: false` (ảnh quét trên cổ thụ trông giả). Không hạ độ phân giải lá (`leafHexGeo` 4 tam giác, lá sen, lá rụng): lá không dùng ảnh, số tam giác là độ chi tiết.
- Rễ phải bắt đầu trong lòng thân (`pr`, `pT` như cành kind 2), độ lộ giảm đơn điệu rồi cắm dốc: lặn rồi trồi, chui dưới đá ⇒ khúc rời lơ lửng.
- `core/mem-trim.js` bỏ mảng CPU lưới có `aBk` khi lên GPU: việc sau `COL.ready` đọc `getX` lỗi null ⇒ chụp lúc dựng (`aoVoxNow`) hoặc chạy trước `COL.ready`.
- Shader vỏ rất nặng: đừng thêm đọc ảnh mỗi điểm ảnh (bóng trời trên vỏ tính ở đỉnh `vtx`, hốc dùng lại `sfCv`); lá rêu tính sẵn trên CPU (`aSk`).
- Bóng quanh gốc: không thêm tấm phủ / quầng (`groundContact` cho thân + rễ trông như bóng dán), chỉ nhân hệ số ánh trời; mặt đứng chỉ nhận 75 % lớp A — nhận đủ thì thân chiều tối đen.
- Lớp bóng chỉ hiện khi mọi việc tính sẵn xong (`SKY.pend`); chụp thử: chờ `SKY.pre.length + SKY.pend.length` = 0. Mất ngữ cảnh WebGL: không nướng lại (`doneB`).
- Tạo texture lúc chạy làm lệch `Math.random` chung (uuid): bọc như `skyLayer` (`SKY.rnd`).
- `ground()` (rễ), `groundAt` (đá) cộng 0,12 của đĩa đất dưới mặt đất quanh gốc — để nguyên.
- Đèn chiminea tắt = cường độ 0, không bỏ đèn (đổi số đèn ⇒ mọi vật liệu biên dịch lại). Hơi dập, khói âm ỉ nhân cỡ lửa theo giờ, không thì ban ngày trùm khung.

## Gỡ lỗi

- `fluids.windCfg()`, `windMap` (half-float, `halfF`), `oldTreeWind.shake`, `SKY.stat`; ép mưa `__ev('rainTarget = () => 0.8')`; soi chuỗi cành: vá `barkTubes` qua `__ev`. Dò cổ thụ: `docs/co-thu-probe/` (testing.md).
