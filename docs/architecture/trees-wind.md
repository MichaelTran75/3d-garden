# Gió và cây

<!-- toc -->
- Mã · 1.1 KB
- Gió và cây · 0.8 KB
- Cành và vỏ · 1.3 KB
- Cổ thụ: rễ, bóng trời · 1.3 KB
- Táo, khói · 1.0 KB
- Bẫy · 1.2 KB
- Gỡ lỗi · 0.2 KB
<!-- /toc -->

## Mã

- `nature/wind-physics.js`: `sceneWind`, `updateSceneWind`, `windAt`, `windVec` (`WIND_GLSL_COMMON`), `windMap`, `windMapSample`, `makeTreeWind`, `treeWindAt`, `windShader`, `grassWindShader`, `forestWindShader`, `flowerWindShader`, `leafHexGeo`
- `nature/wind-field.js`: vật cản, độ phơi → `fluids.initWind`; `forestLeafCtl` lá rừng rụng theo cơn giật
- `nature/fluids.js`: Worker `fluidKernel` (gió NS 2D, khói `addSmoke`, nước nông); vào Worker qua `toString()` ⇒ không đọc biến ngoài hàm
- `nature/flowers-trees.js`: `recTree` (`natural` → `natTree`), `barkTubes`, `barkMesh`, `ropeChain`, `ropeAt`, `bkAttr`
- `nature/forest.js`: rừng (`recbranch*`), `fruitTree` (`ft1`–`ft3`), anh đào, khúc gỗ chết
- `nature/old-tree.js`: cổ thụ, cây con, `oldTreeRoots`, `stoneRing` (ground-moss.md) · `nature/old-tree-shade.js`: `OT_SHADE`
- `core/sky-shade.js`: `skyShadeMat`, `skyAt`, `skyOnLayer` · `core/surface-style.js`: `surfaceStyle(mat, 'bark')` · `nature/water-leaves.js`: `makeLeafFall`, `updateLeafFall`

## Gió và cây

- Gió = NS `uWMap` (ô 2,4 đv, Worker, gió tự do = 1) × profile log + 6 mode Fourier trôi
- Bản đồ về bất đồng bộ: thử ⇒ `await` giữa khung (`sim2` đồng bộ ⇒ đứng yên); không vật cản (drag 0, expo 1) phải = gió tự do
- wind-field.js sau mọi công trình, rừng trong manifest (vật cản dựng 1 lần); tán cản thưa ≤ 0,3 / đv
- Cây có thân (cổ thụ, anh đào): lò xo 2 chiều + 3 cành, 120 Hz → `uBend`, `uBr`; `tw.shake`, `tw.F` bứt lá (`o.shake0`)
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
- `fluids.addSmoke(cfg, look)` → `id` theo manifest (0 lửa trại · 1 chiminea · 2 bếp xe); Worker chỉ tính `on` (`SMS[id]`); nón ống khói `cfg.lid` = ô đặc (`lidZero`); mưa: `campRainTick` (camp.md)
- Hơi dập, khói âm ỉ nhân cỡ lửa theo giờ (không ⇒ ban ngày trùm khung); đèn chiminea tắt = cường độ 0, không bỏ đèn (số đèn đổi ⇒ biên dịch lại tất cả)
- Khói NS ô nhỏ (ống khói 3,2 cm, ống bếp 1,8 cm): khuếch tán hiện chỉ ổn khi dt·ν/H² ≤ ~0,2 (ν 0,045 ⇒ nổ ±60 sau ~100 bước) ⇒ `inlet` kẹp `nuMax = 0,18·H²·30` (lửa trại ô 8 cm giữ trần cũ). Ống nhỏ: khói vào = nồng độ khí thải (max), không cộng dồn theo dt.

## Bẫy

- `windShader` GHI ĐÈ `onBeforeCompile` ⇒ gọi trước `surfaceStyle`, `skyShadeMat`, `mossCoat` (nối tiếp)
- Khớp CPU ⇄ GPU: `windAt` ⇄ `windVec`, `treeWindAt` ⇄ `treeWind` (cò, bướm đậu đọc CPU), `appleRidge` ⇄ `sfARidge` (vỏ táo, băm số nguyên 32 bit, `core/surface-style.js`): sửa cả hai
- Tìm vật theo tên (`SOLID`, `getObjectByName`, regex core/collide.js): đổi tên ⇒ grep tên cũ
- Giữ chuỗi `rnd()` dựng cây (táo, hoa, hộp tổ, chỗ đậu theo nó): ngẫu nhiên mới ⇒ RNG riêng (gai 7791); mắt cành băm theo chiều dài; `crookedLimb` theo độ dài danh nghĩa (`ln * 0.52202`)
- Texture tạo lúc chạy lệch `Math.random` (uuid) ⇒ bọc như `skyLayer` (`SKY.rnd`)
- Cành con: không qua tâm đầu mẹ (chữ S), không trồi cùng độ cao (vệt vòng)
- Vỏ trong suốt (táo, anh đào): cần lượt chỉ độ sâu `barkMesh`; clone vật liệu vỏ ⇒ gỡ userData trước (vòng `treeWind` ⇄ `depthMat`)
- `core/mem-trim.js` bỏ mảng CPU lưới `aBk`: sau `COL.ready` `getX` lỗi null ⇒ chụp lúc dựng (`aoVoxNow`) / trước `COL.ready`
- `freeTree` (`nature/flowers-trees.js`) né đường + mặt đập.

## Gỡ lỗi

- `fluids.windCfg()`, `windMap` (half-float `halfF`), `oldTreeWind.shake`, `SKY.stat`; ép mưa `__ev('rainTarget = () => 0.8')`; soi chuỗi cành: vá `barkTubes` qua `__ev`; dò cổ thụ `docs/co-thu-probe/` (testing.md)
