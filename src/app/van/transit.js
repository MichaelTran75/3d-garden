        // ==== FORD TRANSIT L3H2 (Mk8, 2014+) làm nhà di động — vỏ thân, cabin lái, bánh xe dựng hoàn toàn bằng code (G 17/10) ====
        // Số đo lấy từ GLB "Ford Transit L2H2" (geyges, Sketchfab Standard — CHỈ ĐO, không nhúng lưới): bắn tia quanh mẫu lấy mặt cắt thân, biên dạng
        // mũi xe theo từng mức cao, kính chắn gió, kính cửa cabin, hốc bánh, mui cao H2. Đổi đơn vị: 1,1 đv/m (kỹ sư 1,95 đv kể cả mũ ≈ người 1,75 m),
        // GLB (x ngang, y cao, z dọc tới) → xe: X = 0,0272 − 1,1·z, Y = 0,1128 + 1,1·y (+ nâng mui 6 cm để khoang cao 1,88 m đúng H2), Z = 1,1·x.
        // Thân L3 = L2 + 0,45 m chèn giữa cửa lùa và hốc bánh sau ⇒ dài 5,98 m · cơ sở 3,77 m · rộng thân 2,06 m · cao ~2,7 m (lốp AT, nâng gầm 7 cm).
        // Khung xe (đv): mũi xe ở −x, cửa lùa ở +z (tay lái nghịch kiểu Úc: vô-lăng bên phải = −z), mặt sàn khoang y = 0,83.
        const TR = { yIn: 0.83, xP: -0.58, xF: -2.12, xR: 2.03, wr: 0.44, wz: 0.955, front: -3.264, rear: 3.05, rc: 0.12, sill: 0.608, T: 0.035,
          door: [-0.55, 0.83, 0.83, 2.72], archR: 0.535, archY: 0.52, inW: 0.98, ceil: 2.90 };
        const TR_SEC = [[0.608, 1.018], [0.718, 1.06], [1.015, 1.063], [1.30, 1.065], [1.543, 1.065], [1.631, 1.044], [1.72, 1.034], [1.763, 1.030], [2.093, 1.022],
          [2.319, 1.007], [2.572, 1.001], [2.697, 0.985], [2.813, 0.949]];   // y → nửa bề ngang vỏ khoang (gờ vai ở 1,54–1,63; trên vai hơi khum vào)
        const TR_ROOF = [[-1.513, 2.431], [-1.458, 2.487], [-1.348, 2.579], [-1.238, 2.665], [-1.128, 2.733], [-1.018, 2.786], [-0.908, 2.827], [-0.798, 2.858],
          [-0.578, 2.899], [-0.358, 2.921], [-0.028, 2.931], [0.52, 2.95], [1.6, 2.957], [3.1, 2.957]];   // x → đỉnh mui giữa: từ mép trên kính chắn gió lên mui cao
        const TR_DROP = [[0, 0], [0.33, 0.0123], [0.55, 0.0341], [0.715, 0.0576], [0.825, 0.08], [0.902, 0.106], [0.949, 0.143]];   // mui khum + bo góc: z → độ hạ
        const trLerp = (tab, t) => { if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) { const [a, va] = tab[i - 1], [b, vb] = tab[i]; return va + (vb - va) * (t - a) / (b - a); } return tab[tab.length - 1][1]; };
        const trSS = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
        const trS = x => 0.5 + 0.5 * trSS(-1.513, -0.9, x);                  // mui trên cabin bo góc nửa mức mui khoang
        const trRoofY = x => trLerp(TR_ROOF, x), trTop = x => trRoofY(x) - 0.143 * trS(x);   // trTop: mép trên vách hông (chân góc bo mui)
        const trSideZ = (x, y) => { const yt = trTop(x); return trLerp(TR_SEC, y) + (0.949 - trLerp(TR_SEC, yt)) * trSS(yt - 0.3, yt, y); };   // khung cửa cabin khum vào dưới mui
        const trArchFront = y => TR.xF - Math.sqrt(Math.max(0, TR.archR ** 2 - (y - TR.archY) ** 2));
        const trXh = z => -1.513 + 0.10 * (z / 0.949) ** 2;                   // mép trên kính chắn gió cong lùi ra 2 bên
        const TR_ROOF_X = [-1.30, -1.20, -1.10, -1.0, -0.9, -0.8, -0.6, -0.35, 0.0, 0.5, 1.0, 1.6, 2.2, 2.93];
        // mũi xe: từng mức cao Y (đv) → X mặt trước tại z = 0 · 0,33 · 0,55 · 0,715 · 0,88 · 0,99 (cột cuối = mép vách hông, tính theo hốc bánh / chân trụ A)
        const TR_NOSE = [[0.575, [-3.128, -3.129, -3.183, -3.149, -3.054, -2.886]], [0.663, [-3.236, -3.218, -3.221, -3.185, -3.064, -2.92]], [0.773, [-3.264, -3.257, -3.241, -3.202, -3.059, -2.926]],
          [0.883, [-3.216, -3.205, -3.218, -3.164, -3.076, -2.962]], [0.993, [-3.199, -3.188, -3.153, -3.112, -3.015, -2.823]], [1.103, [-3.213, -3.176, -3.155, -3.09, -3.001, -2.809]],
          [1.213, [-3.169, -3.154, -3.131, -3.03, -2.93, -2.729]], [1.323, [-3.151, -3.133, -3.081, -2.986, -2.89, -2.694]], [1.433, [-3.031, -3.009, -2.966, -2.909, -2.814, -2.621]],
          [1.488, [-2.904, -2.875, -2.843, -2.777, -2.743, -2.589]], [1.543, [-2.75, -2.723, -2.67, -2.637, -2.592, -2.483]], [1.598, [-2.592, -2.568, -2.541, -2.5, -2.451, -2.41]],
          [1.642, [-2.393, -2.385, -2.339, -2.304, -2.258, -2.252]]];
        const TR_NZ = [0, 0.33, 0.55, 0.715, 0.88, 0.99];
        const trNoseEnd = y => y < 0.98 ? trArchFront(y) : y < 1.62 ? -2.393 : -2.24;
        // kính chắn gió + trụ A: hàng Y → X tại z = 0 · 0,33 · 0,55 · 0,715 · 0,825 · 0,902, cột cuối = trụ A (mép trước vách hông)
        const TR_WS = [[[-2.393, -2.385, -2.339, -2.304, -2.275, -2.258], 1.642, [-2.24, 1.642]], [[-2.137, -2.117, -2.086, -2.054, -2.025, -2.005], 1.873, [-1.98, 1.873]],
          [[-1.88, -1.861, -1.834, -1.804, -1.778, -1.758], 2.093, [-1.735, 2.093]], [[-1.57, -1.555, -1.53, -1.505, -1.48, -1.46], [2.36, 2.36, 2.355, 2.35, 2.34, 2.33], [-1.44, 2.33]]];
        const TR_WZ = [0, 0.33, 0.55, 0.715, 0.825, 0.902];
        const trNoseX = (z, y) => {   // X mặt trước mũi xe tại (|z|, y) — để gắn đèn, lưới, biển số đúng mặt cong
          const at = (row, end) => { const zs = [...TR_NZ, trSideZ(end, row[0])], xs = [...row[1], end]; z = Math.abs(z); for (let i = 1; i < zs.length; i++) if (z <= zs[i]) return xs[i - 1] + (xs[i] - xs[i - 1]) * (z - zs[i - 1]) / (zs[i] - zs[i - 1]); return xs[xs.length - 1]; };
          for (let i = 1; i < TR_NOSE.length; i++) if (y <= TR_NOSE[i][0]) { const a = TR_NOSE[i - 1], b = TR_NOSE[i], k = Math.max(0, (y - a[0]) / (b[0] - a[0])); return at(a, trNoseEnd(a[0])) * (1 - k) + at(b, trNoseEnd(b[0])) * k; }
          return at(TR_NOSE[TR_NOSE.length - 1], -2.24);
        };

        function transitBody(g) {
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z), V2 = (x, y) => new THREE.Vector2(x, y), lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }), two = { side: THREE.DoubleSide };
          const M = { body: lam(0xE2D6C0, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }), glass: lam(0x8fc1e3, { transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
            frost: lam(0xdfe9ec, { transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }), black: lam(0x3a3f41, two), grille: lam(0x24292b, two), lamp: lam(0xdde4e6, two),
            chrome: lam(0xc9cdd0), red: lam(0xb8322a, two), amber: lam(0xe39a32, two), mirror: lam(0xb3ccd0), blue: lam(0x1f3f7a), dark: lam(0x4a5052) };
          const shell = new THREE.Group(); shell.name = 'Vỏ Ford Transit L3H2'; shell.userData.xray = 'shell'; g.add(shell);
          const T = TR.T, IN = V3(0.4, 1.6, 0), seam = [];
          const triGeo = (p, n) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); if (n) geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); else geo.computeVertexNormals(); geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.length / 3 * 2), 2)); return geo; };
          const mesh = (geo, mat, name, outline = false, par = shell) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.castShadow = mat !== M.glass && mat !== M.frost; m.receiveShadow = true; if (outline) edge(m, geo, lineDark); par.add(m); return m; };
          const box = (name, w, h, d, x, y, z, mat, out = false, par = shell) => { const m = bx(w, h, d, mat, true, out, lineDark); m.name = name; m.position.set(x, y, z); par.add(m); return m; };
          const bar = (name, a, b, t, mat, round = false, par = shell) => { const v = new THREE.Vector3().subVectors(b, a), len = v.length(); const m = round ? cyl(t, t, len, mat, true, false, null, 8) : bx(t, len, t, mat, true, false);
            m.quaternion.setFromUnitVectors(V3(0, 1, 0), v.normalize()); m.position.copy(a).add(b).multiplyScalar(0.5); m.name = name; par.add(m); return m; };
          const loop = (name, pts, t, mat, closed = true) => { for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) { const q = pts[(i + 1) % pts.length]; if (q.distanceTo(pts[i]) > 0.004) bar(name, pts[i], q, t, mat); } };
          const outward = (p, n) => (n.x * (p.x - IN.x) + n.y * (p.y - IN.y) + n.z * (p.z - IN.z) < 0 ? -1 : 1);
          // lớp trong của vỏ (tôn 2 lớp như vỏ cabin cũ: đậm hơn dù vật liệu bán trong suốt): lùi T theo pháp tuyến, hướng vào lòng xe
          const insetGeo = geo => { const p = geo.attributes.position, n = geo.attributes.normal, q = new Float32Array(p.count * 3), a = V3(), b = V3();
            for (let i = 0; i < p.count; i++) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(n, i); a.addScaledVector(b, -T * outward(a, b)); a.toArray(q, i * 3); }
            return triGeo(q, Array.from(n.array)); };
          // lưới hàng × cột → mỗi vật liệu 1 hình (pháp tuyến mịn tính trên cả lưới); key(r, c) = tên vật liệu của ô, null = bỏ ô
          function gridMeshes(P, key, name, inner = true) {
            const R = P.length, C = P[0].length, pos = new Float32Array(R * C * 3), idx = [];
            P.forEach((row, r) => row.forEach((p, c) => p.toArray(pos, (r * C + c) * 3)));
            for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) if (key(r, c)) { const a = r * C + c, b = a + C; idx.push(a, b, a + 1, a + 1, b, b + 1); }
            const full = new THREE.BufferGeometry(); full.setAttribute('position', new THREE.BufferAttribute(pos, 3)); full.setIndex(idx); full.computeVertexNormals();
            const N = full.attributes.normal.array, out = {};
            for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) { const k = key(r, c); if (!k) continue; const o = out[k] || (out[k] = { p: [], n: [] }), a = r * C + c, b = a + C;
              for (const v of [a, b, a + 1, a + 1, b, b + 1]) { o.p.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); o.n.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]); } }
            full.dispose();
            for (const k in out) { const geo = triGeo(out[k].p, out[k].n); mesh(geo, M[k], name, k === 'body' || k === 'black'); if (inner && k === 'body') mesh(insetGeo(geo), M[k], name); }
          }
          const full = (half, mk) => [...half.slice(1).reverse().map(p => mk(p, -1)), ...half.map(p => mk(p, 1))];   // nửa phải (z ≥ 0, từ giữa ra) → cả bề ngang

          // ===== MŨI XE: cản dưới đen · ga-lăng 3 nan · đèn pha vuốt ngược lên vè · nắp ca-pô · hốc gạt mưa đen =====
          const noseRows = TR_NOSE.map(([y, xs]) => { const xe = trNoseEnd(y), half = [...TR_NZ.map((z, i) => [z, Math.min(xs[i], xe - 0.012)]), [trSideZ(xe, y), xe]]; return full(half, ([z, x], s) => V3(x, y, s * z)); });
          const NC = TR_NZ.length + 1, nKey = (r, c) => { const h = Math.abs(c - (NC - 1) + 0.5) - 0.5;   // h: cột tính từ giữa ra (0 … 6)
            if (r <= 2 || r === 11) return 'black'; if (r <= 6 && h <= 1) return 'grille'; if (r >= 5 && r <= 7 && h >= 2) return 'lamp'; return 'body'; };
          gridMeshes(noseRows, nKey, 'Mũi xe');
          // ===== KÍNH CHẮN GIÓ + TRỤ A + mép trên kính (hàng cuối = mặt cắt đầu tiên của mui) =====
          const roofSec = (x, z) => trRoofY(x) - trLerp(TR_DROP, Math.abs(z)) * trS(x), RZ = [...TR_WZ, 0.949];
          const wsRows = [...TR_WS.map(([xs, ys, end]) => full([...TR_WZ.map((z, i) => [z, xs[i], Array.isArray(ys) ? ys[i] : ys]), [trSideZ(end[0], end[1]), end[0], end[1]]], ([z, x, y], s) => V3(x, y, s * z))),
            full(RZ.map(z => [z, trXh(z), roofSec(trXh(z), z)]), ([z, x, y], s) => V3(x, y, s * z))];
          const WC = RZ.length, wKey = (r, c) => { const h = Math.abs(c - (WC - 1) + 0.5) - 0.5; return r < 3 && h < 4 ? 'glass' : 'body'; };
          gridMeshes(wsRows, wKey, 'Kính chắn gió & trụ A');
          // ===== MUI CAO H2: khum ngang, bo góc 2 bên; từ mép kính chắn gió lên mui khoang rồi phẳng ra tới đuôi =====
          const roofRows = [wsRows[wsRows.length - 1], ...TR_ROOF_X.map(x => full(RZ.map(z => [z, roofSec(x, z)]), ([z, y], s) => V3(x, y, s * z)))];
          gridMeshes(roofRows, () => 'body', 'Mui cao');
          // gân dọc mui (tôn mui H2 có gân chạy dọc) — trên đoạn mui phẳng
          for (const z of [-0.6, -0.3, 0.3, 0.6]) box('Gân mui', 2.3, 0.014, 0.05, 1.7, roofSec(1.7, z) + 0.006, z, M.body);

          // ===== VÁCH HÔNG (mỗi bên 1 tấm): viền theo mũi/trụ A/mui/đuôi, khoét hốc bánh, kính cửa cabin, cửa lùa (+z), cửa sổ nhà xe =====
          //  Tấm phẳng (x, y) chia tam giác có điểm lưới phụ (Steiner) rồi uốn theo mặt cắt thân z = trSideZ(x, y) ⇒ giữ được gờ vai và khum trên
          const arc = (cx, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + TR.archR * Math.cos(a), TR.archY + TR.archR * Math.sin(a)]; });
          const aS = Math.asin((TR.sill - TR.archY) / TR.archR), aP0 = Math.atan2(0.98 - TR.archY, -2.393 - TR.xF);
          const SY = TR_SEC.map(p => p[0]), xhE = trXh(0.949);
          // (2 hốc bánh: đi từ sau ra trước theo đáy vách ⇒ cung hốc sau quét π − aS → aS ngược chiều kim đồng hồ khi nhìn từ +z)
          const archRear = arc(TR.xR, Math.PI - aS, aS, 14), archFront = arc(TR.xF, aS, aP0, 12);
          const CONT = [[-2.393, 0.98], ...[1.0, 1.15, 1.3, 1.45, 1.543, 1.598].map(y => [-2.393, y]), [-2.24, 1.642], [-1.98, 1.873], [-1.735, 2.093], [-1.44, 2.33],
            [xhE, trTop(xhE)], ...TR_ROOF_X.map(x => [x, trTop(x)]), ...SY.slice(0, -1).reverse().map(y => [2.93, y]),
            ...archRear.slice().reverse(), ...archFront.slice(0, -1)];
          const DOOR_GLASS = [[-0.935, 2.26], [-0.941, 1.73], [-1.073, 1.642], [-1.293, 1.565], [-1.513, 1.521], [-1.733, 1.488], [-1.854, 1.499], [-1.862, 1.93], [-1.685, 2.093], [-1.535, 2.215], [-1.45, 2.285], [-1.02, 2.295]];
          const rr = (x0, y0, x1, y1, r = 0.06) => { const p = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let k = 0; k <= 3; k++) { const a = a0 + k * Math.PI / 6; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
          const WIN = { 1: [rr(2.42, 2.04, 2.82, 2.44)], [-1]: [rr(-0.30, 1.86, 1.22, 2.46), rr(1.52, 1.98, 2.16, 2.46)] };   // cửa sổ nhà xe: +z phòng tắm (kính mờ) · −z trên giường, trên bàn học
          const DOOR = TR.door, doorHole = [[DOOR[0], DOOR[2]], [DOOR[1], DOOR[2]], [DOOR[1], DOOR[3]], [DOOR[0], DOOR[3]]];
          const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
          const segD = (x, y, P) => { let d = 9; for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx2, by] = P[(i + 1) % P.length], vx = bx2 - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1))); d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t)); } return d; };
          const sideRefs = {};
          for (const s of [1, -1]) {
            const holes = [DOOR_GLASS, ...WIN[s], ...(s > 0 ? [doorHole] : [])], steiner = [];
            const YS = [0.66, 0.718, 0.85, 1.0, 1.15, 1.3, 1.45, 1.543, 1.587, 1.631, 1.70, 1.763, 1.9, 2.093, 2.2, 2.319, 2.45, 2.572, 2.697, 2.765];
            for (let x = -2.33; x < 2.92; x += 0.16) for (const y of YS) if (inPoly(x, y, CONT) && !holes.some(h => inPoly(x, y, h)) && segD(x, y, CONT) > 0.035 && holes.every(h => segD(x, y, h) > 0.035)) steiner.push([x, y]);
            const flat = [CONT, ...holes, ...steiner.map(p => [p])], faces = THREE.ShapeUtils.triangulateShape(CONT.map(p => V2(...p)), [...holes, ...steiner.map(p => [p])].map(h => h.map(p => V2(...p))));
            const P2 = flat.flat(), pos = [], idx = [];
            for (const [x, y] of P2) pos.push(x, y, s * trSideZ(x, y));
            for (const f of faces) idx.push(...f);
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(P2.length * 2), 2));
            mesh(geo, M.body, s > 0 ? 'Vách hông bên cửa lùa' : 'Vách hông bên tài', true);
            const ig = insetGeo(geo.toNonIndexed()); mesh(ig, M.body, 'Lớp trong vách hông');
            // gờ dày quanh ô kính, cửa, hốc bánh (nối lớp ngoài với lớp trong)
            const N = geo.attributes.normal, PA = geo.attributes.position, rim = [], a = V3(), n = V3();
            const inner = i => { a.fromBufferAttribute(PA, i); n.fromBufferAttribute(N, i); return a.clone().addScaledVector(n, -T * outward(a, n)); };
            const ring = (i0, len, closed) => { for (let k = 0; k < len - (closed ? 0 : 1); k++) { const i = i0 + k, j = i0 + (k + 1) % len, A = V3().fromBufferAttribute(PA, i), B = V3().fromBufferAttribute(PA, j), Ai = inner(i), Bi = inner(j); rim.push(...A.toArray(), ...B.toArray(), ...Bi.toArray(), ...A.toArray(), ...Bi.toArray(), ...Ai.toArray()); } };
            let o = CONT.length; for (const h of holes) { ring(o, h.length, true); o += h.length; }
            const bot = CONT.length - archRear.length - archFront.length + 1; ring(bot - 1, CONT.length - bot + 1, false);   // đáy vách + 2 hốc bánh
            mesh(triGeo(rim), M.body, 'Gờ vách hông');
            sideRefs[s] = { holes };
            // kính: cửa cabin (kính thường) · cửa sổ nhà xe (kính + viền cao su đen); lùi vào 1,2 cm
            const pane = (P, mat, name, frame) => { const sg = new THREE.ShapeGeometry(new THREE.Shape(P.map(p => V2(...p))), 6), q = sg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, s * (trSideZ(q.getX(i), q.getY(i)) - 0.012)); sg.computeVertexNormals(); mesh(sg, mat, name);
              if (frame) loop('Viền cao su cửa sổ', P.map(([x, y]) => V3(x, y, s * (trSideZ(x, y) + 0.004))), 0.03, M.black); };
            pane(DOOR_GLASS, M.glass, 'Kính cửa cabin', true);
            WIN[s].forEach((P, i) => pane(P, s > 0 && i === 0 ? M.frost : M.glass, 'Cửa sổ nhà xe', true));
            // ron cửa: cửa cabin (trước/sau/dưới), gân vai dọc thân
            const on = (x, y) => [x, y, s * (trSideZ(x, y) + 0.003)], ln = pts => { for (let i = 0; i < pts.length - 1; i++) seam.push(...pts[i], ...pts[i + 1]); };
            ln([0.98, 1.2, 1.5, 1.7].map(y => on(-2.03, y)).concat([on(-1.88, 1.92), on(-1.70, 2.11), on(-1.52, 2.36)]));
            ln([0.62, 1.0, 1.5, 2.0, 2.4].map(y => on(-0.70, y)).concat([on(-0.70, 2.62)])); ln([on(-2.03, 0.98), on(-1.59, 0.98)]); ln([on(-1.59, 0.62), on(-0.70, 0.62)]);
            ln([-2.3, -1.6, -0.9, -0.55].map(x => on(x, 1.587))); ln([0.83, 1.5, 2.2, 2.93].map(x => on(x, 1.587)));
            if (s < 0) ln([-0.55, 0.2, 0.83].map(x => on(x, 1.587)));
            // ốp nhựa đen chân thân (xe Transit bản thường): dải giữa 2 hốc bánh + sau hốc sau; bên cửa lùa chừa ô cửa (tấm cửa mang dải riêng)
            const band = (x0, x1, y0, y1, name) => { const g2 = new THREE.PlaneGeometry(x1 - x0, y1 - y0, Math.max(1, Math.round((x1 - x0) / 0.3)), 3); g2.translate((x0 + x1) / 2, (y0 + y1) / 2, 0); const r2 = g2.attributes.position;
              for (let i = 0; i < r2.count; i++) r2.setZ(i, s * (trSideZ(r2.getX(i), r2.getY(i)) + 0.014)); g2.computeVertexNormals(); mesh(g2, M.black, name, true); };
            const xa = TR.xF + Math.sqrt(TR.archR ** 2 - (TR.sill - TR.archY) ** 2), xb = TR.xR - Math.sqrt(TR.archR ** 2 - (TR.sill - TR.archY) ** 2), xc = TR.xR + (TR.xR - xb);
            if (s > 0) { band(xa, DOOR[0], TR.sill, 0.95, 'Ốp chân thân'); band(DOOR[0], DOOR[1], TR.sill, DOOR[2] - 0.005, 'Ốp chân thân'); band(DOOR[1], xb, TR.sill, 0.95, 'Ốp chân thân'); }
            else band(xa, xb, TR.sill, 0.95, 'Ốp chân thân');
            band(xc, 2.93, TR.sill, 1.0, 'Ốp góc đuôi');
            // ốp vòm bánh (nhựa đen) theo cung hốc, nổi 2 cm
            for (const [cx, a1] of [[TR.xF, aP0], [TR.xR, Math.PI - aS]]) { const rg = new THREE.RingGeometry(TR.archR, TR.archR + 0.075, 22, 1, aS, a1 - aS); rg.translate(cx, TR.archY, 0); const r2 = rg.attributes.position;
              for (let i = 0; i < r2.count; i++) r2.setZ(i, s * (trSideZ(r2.getX(i), Math.max(TR.sill, r2.getY(i))) + 0.02)); rg.computeVertexNormals(); mesh(rg, M.black, 'Ốp vòm bánh', true); }
            // gương chiếu hậu lớn kiểu xe tải (gắn góc trước cửa cabin): chân + hộp gương + mặt gương quay về sau; tay nắm cửa cabin
            const mz = s * 1.30, base = V3(-1.84, 1.56, s * (trSideZ(-1.84, 1.56) + 0.01));
            box('Chân gương', 0.12, 0.06, 0.16, -1.86, 1.56, s * 1.13, M.black); bar('Tay gương', base, V3(-1.9, 1.62, mz - s * 0.12), 0.035, M.black, true);
            const hg = box('Hộp gương chiếu hậu', 0.11, 0.40, 0.26, -1.92, 1.72, mz, M.black, true); hg.rotation.y = s * 0.12;
            const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.34), M.mirror); mg.rotation.y = Math.PI / 2 + s * 0.12; mg.position.set(-1.862, 1.72, mz); mg.name = 'Mặt gương'; shell.add(mg);
            box('Tay nắm cửa cabin', 0.17, 0.045, 0.03, -1.05, 1.62, s * (trSideZ(-1.05, 1.62) + 0.016), M.black);
          }
          // ===== ĐUÔI XE: góc bo đứng (r 12 cm) + mép mui sau bo tròn → mặt sau phẳng có 2 cánh cửa mở (kính mờ phòng tắm), đèn hậu đứng ở 2 góc =====
          const SEC_HALF = [...SY.map(y => [trLerp(TR_SEC, y), y]), ...[0.902, 0.825, 0.715, 0.55, 0.33].map(z => [z, roofSec(2.93, z)]), [0, roofSec(2.93, 0)]];   // từ đáy vách +z lên, qua mui tới giữa
          const SEC = [...SEC_HALF, ...SEC_HALF.slice(0, -1).reverse().map(([z, y]) => [-z, y])];
          const SN = SEC.map((p, i) => { const a = SEC[Math.max(0, i - 1)], b = SEC[Math.min(SEC.length - 1, i + 1)]; let nz = b[1] - a[1], ny = -(b[0] - a[0]); const l = Math.hypot(nz, ny) || 1; nz /= l; ny /= l; if (nz * p[0] + ny * (p[1] - 1.6) < 0) { nz = -nz; ny = -ny; } return [nz, ny]; });
          const capRows = []; for (let j = 0; j <= 5; j++) { const f = j / 5 * Math.PI / 2, d = TR.rc * (1 - Math.cos(f)), x = 2.93 + TR.rc * Math.sin(f); capRows.push(SEC.map(([z, y], i) => V3(x, y - SN[i][1] * d, z - SN[i][0] * d))); }
          const nS = SY.length, L = SEC.length, cKey = (r, c) => {   // ô ở góc đứng: chân đen · đèn hậu đỏ / hổ phách / đỏ (bọc góc) · còn lại vỏ
            if (c >= nS - 1 && c < L - nS) return 'body'; const y = (SEC[c][1] + SEC[c + 1][1]) / 2; return y < 1.015 ? 'black' : y < 1.30 ? 'red' : y < 1.543 ? 'amber' : y < 1.72 ? 'red' : 'body'; };
          gridMeshes(capRows, cKey, 'Góc bo đuôi xe');
          const back = capRows[capRows.length - 1].map(p => [p.z, p.y]);   // viền mặt sau (z, y)
          const RW = [rr(0.14, 2.06, 0.62, 2.52), rr(-0.62, 2.06, -0.14, 2.52)];   // kính mờ 2 cánh cửa sau
          {
            const faces = THREE.ShapeUtils.triangulateShape(back.map(p => V2(...p)), RW.map(h => h.map(p => V2(...p)))), P2 = [...back, ...RW.flat()], p = [];
            for (const f of faces) for (const v of f) p.push(TR.rear, P2[v][1], P2[v][0]);
            const geo = triGeo(p); mesh(geo, M.body, 'Mặt sau (2 cánh cửa)', true);
            const q = p.slice(); for (let i = 0; i < q.length; i += 3) q[i] -= T; mesh(triGeo(q), M.body, 'Lớp trong cửa sau');
            for (const h of RW) { const sg = new THREE.ShapeGeometry(new THREE.Shape(h.map(([z, y]) => V2(z, y))), 4); sg.rotateY(-Math.PI / 2); sg.translate(TR.rear + 0.006, 0, 0); mesh(sg, M.frost, 'Kính mờ cửa sau'); loop('Viền kính cửa sau', h.map(([z, y]) => V3(TR.rear + 0.01, y, z)), 0.028, M.black); }
            const lnB = pts => { for (let i = 0; i < pts.length - 1; i++) seam.push(...pts[i], ...pts[i + 1]); };
            lnB([[TR.rear + 0.003, 0.64, 0], [TR.rear + 0.003, 2.86, 0]]);
            for (const s of [-1, 1]) {
              lnB([[TR.rear + 0.003, 0.64, s * 0.86], [TR.rear + 0.003, 2.80, s * 0.86]]);
              for (const [y0, y1, mat] of [[1.015, 1.30, M.red], [1.30, 1.543, M.amber], [1.543, 1.72, M.red]]) box('Đèn hậu', 0.02, y1 - y0 - 0.008, 0.12, TR.rear + 0.008, (y0 + y1) / 2, s * 0.88, mat);
              box('Phản quang sau', 0.015, 0.04, 0.14, TR.rear + 0.006, 0.80, s * 0.84, M.red);
            }
            box('Tay nắm cửa sau', 0.04, 0.05, 0.2, TR.rear + 0.02, 1.62, 0.13, M.black);
            box('Đèn phanh trên cao', 0.04, 0.05, 0.36, TR.rear + 0.015, 2.86, 0, M.red);
            // cản sau đen có bậc giẫm giữa
            box('Cản sau', 0.27, 0.22, 1.98, TR.rear + 0.12, 0.56, 0, M.black, true);
            box('Bậc giẫm cản sau', 0.2, 0.02, 0.8, TR.rear + 0.15, 0.68, 0, M.dark);
          }
          // ===== CHI TIẾT ĐẦU XE: 3 nan ga-lăng mạ, logo bầu dục xanh, đèn sương mù, biển số "Jade", gạt mưa, viền hốc gạt mưa =====
          for (const y of [1.04, 1.15, 1.26]) loop('Nan ga-lăng mạ', [-0.56, -0.42, -0.2, 0, 0.2, 0.42, 0.56].map(z => V3(trNoseX(z, y) - 0.018, y, z)), 0.035, M.chrome, false);
          const badge = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), M.blue); badge.scale.set(1, 0.48, 1); badge.rotation.y = -Math.PI / 2; badge.position.set(trNoseX(0, 1.2) - 0.03, 1.2, 0); badge.name = 'Logo bầu dục'; shell.add(badge);
          for (const s of [-1, 1]) {
            const fz = s * 0.80, fx = trNoseX(0.8, 0.72) - 0.006, fog = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), M.lamp); fog.rotation.y = -Math.PI / 2 + s * 0.35; fog.position.set(fx, 0.72, fz); fog.name = 'Đèn sương mù'; shell.add(fog);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 5, 16), M.chrome); ring.rotation.y = Math.PI / 2 + s * 0.35; ring.position.copy(fog.position); shell.add(ring);
          }
          const pc = document.createElement('canvas'); pc.width = 256; pc.height = 128; const pk = pc.getContext('2d');
          pk.fillStyle = '#e4dbc5'; pk.fillRect(0, 0, 256, 128); pk.strokeStyle = '#243240'; pk.lineWidth = 6; pk.strokeRect(6, 6, 244, 116);
          pk.font = '700 84px Arial, sans-serif'; pk.textAlign = 'center'; pk.textBaseline = 'middle'; pk.fillStyle = '#243240'; pk.fillText('Jade', 128, 68);
          const plateTex = new THREE.CanvasTexture(pc); plateTex.colorSpace = THREE.SRGBColorSpace; const plateM = new THREE.MeshLambertMaterial({ map: plateTex });
          for (const [x, y, ry] of [[trNoseX(0, 0.75) - 0.012, 0.75, -Math.PI / 2], [TR.rear + 0.012, 0.86, Math.PI / 2]]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.2), plateM); pl.rotation.y = ry; pl.position.set(x, y, 0); pl.name = 'Biển số · Jade'; shell.add(pl); }
          for (const z0 of [0.06, -0.78]) bar('Cần gạt mưa', V3(-2.37, 1.66, z0), V3(-2.12, 1.86, z0 + 0.66), 0.016, M.black);
          // đường ron: viền ca-pô · ray cửa lùa (lộ sau cửa đã mở)
          const hood = [[0, 1.433], [0.55, 1.433], [0.88, 1.40], [0.99, 1.43], [1.03, 1.55], [1.04, 1.62]].map(([z, y]) => [trNoseX(z, y) + 0.004, y + 0.004, z]);
          for (let i = 0; i < hood.length - 1; i++) for (const s of [-1, 1]) seam.push(hood[i][0], hood[i][1], s * hood[i][2], hood[i + 1][0], hood[i + 1][1], s * hood[i + 1][2]);
          box('Ray cửa lùa', 1.9, 0.045, 0.03, (DOOR[1] + 2.75) / 2, 1.80, trSideZ(1.8, 1.80) + 0.012, M.black);
          const seamL = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(seam, 3)), lineDark); seamL.name = 'Ron vỏ xe'; shell.add(seamL);

          // ===== CỬA LÙA (đang mở: trượt về sau ngoài vách, trên 3 ray) có cửa sổ + ốp chân đen + tay nắm =====
          const sd = new THREE.Group(); sd.name = 'Cửa lùa (mở)'; shell.add(sd);
          {
            const L = DOOR[1] - DOOR[0] + 0.06, x0 = DOOR[1] + 0.03, y0 = 0.70, y1 = DOOR[3] + 0.03, off = 0.065, hole = rr(x0 + 0.2, 1.86, x0 + L - 0.28, 2.46);
            const sh = new THREE.Shape([V2(x0, y0), V2(x0 + L, y0), V2(x0 + L, y1), V2(x0, y1)]); sh.holes.push(new THREE.Path(hole.map(p => V2(...p))));
            for (const d of [0, T]) { const sg = new THREE.ShapeGeometry(sh, 4), q = sg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, trSideZ(q.getX(i), q.getY(i)) + off - d); sg.computeVertexNormals(); mesh(sg, M.body, 'Tấm cửa lùa', !d, sd); }
            const pg = new THREE.ShapeGeometry(new THREE.Shape(hole.map(p => V2(...p))), 4), q = pg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, trSideZ(q.getX(i), q.getY(i)) + off - 0.015); pg.computeVertexNormals(); mesh(pg, M.glass, 'Kính cửa lùa', false, sd);
            loop('Viền kính cửa lùa', hole.map(([x, y]) => V3(x, y, trSideZ(x, y) + off + 0.004)), 0.03, M.black);
            const cg = new THREE.PlaneGeometry(L, 0.95 - y0, 4, 2); cg.translate(x0 + L / 2, (y0 + 0.95) / 2, 0); const c2 = cg.attributes.position; for (let i = 0; i < c2.count; i++) c2.setZ(i, trSideZ(c2.getX(i), c2.getY(i)) + off + 0.012); cg.computeVertexNormals(); mesh(cg, M.black, 'Ốp chân cửa lùa', true, sd);
            box('Tay nắm cửa lùa', 0.045, 0.2, 0.03, x0 + 0.08, 1.62, trSideZ(x0, 1.62) + off + 0.02, M.black, false, sd);
            const ky = [0.75, 1.80, 2.70]; for (const y of ky) box('Giá trượt cửa lùa', 0.05, 0.04, off, x0 + 0.04, y, trSideZ(x0, y) + off / 2, M.black, false, sd);
          }
          bakeStatic(shell);
          return { shell, M };
        }

        // ==== CABIN LÁI (tay lái nghịch: vô-lăng −z), 4 BÁNH (lốp AT 31", mâm thép đen) & TỦ BẾP — trả về nhóm tủ bếp (van/kitchen.js dựng mặt bếp lên đó) ====
        function transitCab(parent) {
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z), lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }), two = { side: THREE.DoubleSide };
          const M = { mat: lam(0x43494b), dash: lam(0x5d6163), dashTop: lam(0x46494b), trim: lam(0x8a8c88), seat: lam(0x6f706c), seatBand: lam(0x55575a), seatDark: lam(0x2e3133),
            screen: lam(0x1d2326), tyre: lam(0x2b2925), tread: lam(0x232120), rim: lam(0x2f3335, two), hub: lam(0x92958e, two), cabinet: lam(0xa58e69), front: lam(0xd0ccc0), matte: lam(0x30383a, two), handle: lam(0x777b7a) };
          const cab = new THREE.Group(); cab.name = 'Cabin lái, bánh xe & tủ bếp'; cab.userData.noBake = true;
          const inner = new THREE.Group(); inner.name = 'Nội thất cabin'; inner.userData.xray = 'keep';
          const dash = new THREE.Group(); dash.name = 'Táp-lô'; dash.userData.xray = 'shell';
          const wheels = new THREE.Group(); wheels.name = 'Bánh xe'; wheels.userData.xray = 'keep';
          cab.add(inner, dash, wheels);
          const box = (par, name, w, h, d, x, y, z, mat, out = false) => { const m = bx(w, h, d, mat, true, out, lineDark); m.name = name; m.position.set(x, y, z); par.add(m); return m; };
          const bar = (par, name, a, b, t, mat, round = false) => { const v = new THREE.Vector3().subVectors(b, a), len = v.length(); const m = round ? cyl(t, t, len, mat, true, false, null, 8) : bx(t, len, t, mat, true, false);
            m.quaternion.setFromUnitVectors(V3(0, 1, 0), v.normalize()); m.position.copy(a).add(b).multiplyScalar(0.5); m.name = name; par.add(m); return m; };
          const shaped = (w, h, d, segs, fn) => { const g = new THREE.BoxGeometry(w, h, d, ...segs), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; };
          const Y0 = TR.yIn;
          // sàn cabin: thảm đen trên tấm sàn (tấm sàn khoang ở van/caravan.js)
          box(inner, 'Thảm sàn cabin', 1.62, 0.012, 1.86, -1.43, Y0 + 0.006, 0, M.mat);
          // táp-lô kiểu Transit 2014+: vách lửa dưới chân kính, mặt trên rộng phẳng, cụm đồng hồ có mái che trước ghế lái, cụm giữa có màn hình + cần số gắn táp-lô
          const prof = [[-2.33, 1.64], [-2.05, 1.715], [-1.93, 1.70], [-1.87, 1.62], [-1.85, 1.44], [-1.93, 1.26], [-2.04, 1.08], [-2.16, Y0], [-2.36, Y0]];
          const dg = new THREE.ExtrudeGeometry(new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 1.84, bevelEnabled: false }).translate(0, 0, -0.92);
          const dm = new THREE.Mesh(dg, M.dash); dm.name = 'Táp-lô'; dm.castShadow = dm.receiveShadow = true; edge(dm, dg, lineDark); dash.add(dm);
          box(dash, 'Mặt trên táp-lô', 0.30, 0.012, 1.80, -2.0, 1.712, 0, M.dashTop);
          box(dash, 'Mái che đồng hồ', 0.20, 0.08, 0.44, -1.98, 1.745, -0.48, M.dashTop, true);
          const gc = document.createElement('canvas'); gc.width = 192; gc.height = 64; const gk = gc.getContext('2d'); gk.fillStyle = '#15191b'; gk.fillRect(0, 0, 192, 64);
          for (const cx of [48, 144]) { gk.strokeStyle = '#d9dee0'; gk.lineWidth = 3; gk.beginPath(); gk.arc(cx, 34, 24, Math.PI * 0.8, Math.PI * 2.2); gk.stroke(); gk.strokeStyle = '#e5533b'; gk.beginPath(); gk.moveTo(cx, 34); gk.lineTo(cx + 18, 22); gk.stroke(); }
          const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
          const gauge = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.12), new THREE.MeshLambertMaterial({ map: gt })); gauge.rotation.y = Math.PI / 2; gauge.rotation.z = 0.25; gauge.position.set(-1.92, 1.66, -0.48); gauge.name = 'Cụm đồng hồ'; dash.add(gauge);
          box(dash, 'Màn hình giữa', 0.012, 0.13, 0.22, -1.862, 1.55, 0.0, M.screen);
          for (const z of [-0.85, -0.16, 0.16, 0.85]) box(dash, 'Cửa gió', 0.02, 0.07, 0.13, -1.875, 1.64, z, M.seatDark);
          bar(inner, 'Cần số trên táp-lô', V3(-1.86, 1.40, -0.2), V3(-1.76, 1.47, -0.2), 0.015, M.trim, true);
          const knob = sph(0.032, M.seatDark, true, false); knob.position.set(-1.755, 1.475, -0.2); inner.add(knob);
          // vô-lăng 3 chấu (bên phải xe = −z), cột lái nghiêng ~25°
          const hubP = V3(-1.70, 1.56, -0.48), colDir = V3(Math.sin(1.08), Math.cos(1.08), 0);
          bar(inner, 'Cột lái', hubP.clone().addScaledVector(colDir, -0.30), hubP.clone().addScaledVector(colDir, -0.02), 0.03, M.seatDark, true);
          const wheel = new THREE.Group(); wheel.name = 'Vô-lăng'; wheel.position.copy(hubP); wheel.quaternion.setFromUnitVectors(V3(0, 0, 1), colDir); inner.add(wheel);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.019, 6, 18), M.seatDark); ring.castShadow = true; wheel.add(ring);
          for (const t of [0, Math.PI, -Math.PI / 2]) bar(wheel, 'Chấu vô-lăng', V3(0, 0, 0.005), V3(Math.cos(t) * 0.18, Math.sin(t) * 0.18, 0), 0.03, M.seatDark);
          const cap = cyl(0.06, 0.06, 0.04, M.seatDark, true, true, lineDark, 12); cap.rotation.x = Math.PI / 2; wheel.add(cap);
          for (const [z, l] of [[-0.36, 0.08], [-0.50, 0.07], [-0.62, 0.07]]) { const pad = box(inner, 'Bàn đạp', l, 0.015, 0.06, -2.1, 0.97, z, M.seatDark); pad.rotation.z = -1.0; }
          box(inner, 'Gương chiếu hậu trong', 0.03, 0.06, 0.24, -1.60, 2.28, 0, M.seatDark);
          for (const s of [-1, 1]) { const v = box(inner, 'Tấm che nắng', 0.24, 0.018, 0.40, -1.52, 2.31, s * 0.45, M.trim); v.rotation.z = 0.2; }
          // 2 ghế đơn xoay (captain chair): đệm bo mép trước, tựa lưng ngả, gối đầu, đế xoay, tay vịn trong
          const cushion = shaped(0.52, 0.13, 0.52, [6, 2, 6], v => { if (v.x < -0.18 && v.y > 0) v.y -= (v.x + 0.18) * (v.x + 0.18) * 1.5; const k = Math.max(0, v.y) / 0.065; v.y -= 0.02 * k * Math.max(0, 1 - (v.z / 0.2) ** 2); });
          const backG = shaped(0.12, 0.66, 0.52, [2, 6, 6], v => { if (v.x < 0) v.x += 0.03 * Math.max(0, 1 - (v.z / 0.2) ** 2); if (v.y > 0.2) v.z *= 1 - (v.y - 0.2) * 0.12; });
          for (const s of [-1, 1]) {
            const zc = s * 0.46, sg = new THREE.Group(); sg.name = s < 0 ? 'Ghế lái' : 'Ghế phụ'; sg.position.set(-1.12, Y0, zc); inner.add(sg);
            box(sg, 'Đế xoay ghế', 0.34, 0.26, 0.34, 0, 0.13, 0, M.seatDark);
            const cu = new THREE.Mesh(cushion, M.seat); cu.position.set(0.0, 0.40, 0); cu.castShadow = true; edge(cu, cushion, lineDark); cu.name = 'Đệm ghế'; sg.add(cu);
            const bk = new THREE.Mesh(backG, M.seat); bk.position.set(0.30, 0.78, 0); bk.rotation.z = 0.24; bk.castShadow = true; edge(bk, backG, lineDark); bk.name = 'Tựa lưng'; sg.add(bk);
            box(sg, 'Gối đầu', 0.10, 0.18, 0.30, 0.40, 1.22, 0, M.seat, true).rotation.z = 0.24;
            box(sg, 'Đai tựa lưng', 0.125, 0.06, 0.53, 0.2, 0.55, 0, M.seatBand).rotation.z = 0.24;
            box(sg, 'Tay vịn ghế', 0.40, 0.05, 0.06, 0.02, 0.62, -s * 0.29, M.seatDark);
          }
          // ===== BÁNH: lốp AT tiện theo biên dạng (vai vuông) + 2 hàng gai so le · mâm thép đen 16" có lòng chảo, 6 ốc, nắp trục =====
          const lathe = (pts, n = 30) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(...p)), n);
          const R = TR.wr, tyreGeo = lathe([[0.23, -0.13], [0.33, -0.134], [0.405, -0.128], [0.43, -0.11], [R - 0.012, -0.09], [R - 0.012, 0.09], [0.43, 0.11], [0.405, 0.128], [0.33, 0.134], [0.23, 0.13]]);
          const rimGeo = lathe([[0.232, 0.118], [0.222, 0.124], [0.205, 0.112], [0.175, 0.085]]), dishGeo = lathe([[0.175, 0.085], [0.11, 0.09]]), capGeo = lathe([[0.11, 0.09], [0.07, 0.115], [0, 0.118]], 16);
          for (const g of [tyreGeo, rimGeo, dishGeo, capGeo]) g.rotateX(Math.PI / 2);
          const lug = new THREE.BoxGeometry(0.075, 0.024, 0.09), nutGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6); nutGeo.rotateX(Math.PI / 2);
          const back = new THREE.CircleGeometry(0.232, 24);
          for (const [x, s, nm] of [[TR.xF, 1, 'Bánh trước'], [TR.xF, -1, 'Bánh trước'], [TR.xR, 1, 'Bánh sau'], [TR.xR, -1, 'Bánh sau']]) {
            const w = new THREE.Group(); w.name = nm; w.position.set(x, R, s * TR.wz); if (s < 0) w.rotation.y = Math.PI;
            const t = new THREE.Mesh(tyreGeo, M.tyre); t.castShadow = t.receiveShadow = true; edge(t, tyreGeo, lineDark); w.add(t);
            for (let k = 0; k < 24; k++) for (const side of [-1, 1]) { const a = (k + (side > 0 ? 0.5 : 0)) / 24 * Math.PI * 2, l = new THREE.Mesh(lug, M.tread); l.position.set(Math.cos(a) * (R - 0.004), Math.sin(a) * (R - 0.004), side * 0.05); l.rotation.z = a + Math.PI / 2; w.add(l); }
            for (const [g, m] of [[rimGeo, M.rim], [dishGeo, M.rim], [capGeo, M.hub]]) { const p = new THREE.Mesh(g, m); p.castShadow = true; w.add(p); }
            const bk = new THREE.Mesh(back, M.rim); bk.position.z = -0.12; bk.rotation.y = Math.PI; w.add(bk);
            for (let k = 0; k < 6; k++) { const n = new THREE.Mesh(nutGeo, M.hub); n.position.set(Math.cos(k * Math.PI / 3) * 0.09, Math.sin(k * Math.PI / 3) * 0.09, 0.098); w.add(n); }
            wheels.add(w);
          }
          // ===== TỦ BẾP dọc vách cửa lùa (toạ độ cục bộ như bản cũ: mặt cánh tủ quay về −x, nóc tủ 1,795 ngay dưới mặt đá) =====
          const galley = new THREE.Group(); galley.name = 'Bếp dọc vách cửa hông'; galley.userData.xray = 'keep'; galley.userData.noBake = true;
          galley.rotation.y = -Math.PI / 2;
          const cabinets = new THREE.Group(); cabinets.name = 'Thân tủ & cánh tủ';
          box(cabinets, 'Thân tủ bếp', .51, .725, 1.82, 2.665, 1.4325, 0, M.cabinet, true);
          for (const [name, h, d, y, z] of [['Cánh tủ chậu', .505, .398, 1.3325, -.69], ['Cánh tủ giữa', .65, .68, 1.405, -.11], ['Cửa lò nướng', .5, .52, 1.37, .59], ['Ngăn kéo', .13, .35, 1.685, -.677]])
            box(cabinets, name, .012, h, d, 2.403, y, z, M.front, true);
          box(cabinets, 'Ô kính cửa lò', .006, .2, .34, 2.396, 1.42, .59, M.matte);
          for (const z of [-.53, .19, .8]) box(cabinets, 'Tay nắm tủ', .018, .11, .05, 2.39, 1.42, z, M.mat);
          box(cabinets, 'Khe tách khối bếp', .58, .76, .014, 2.68, 1.45, .263, M.matte);
          for (let i = 0; i < 4; i++) {
            const k = cyl(.027, .027, .03, M.matte, true, false, null, 12); k.rotation.z = Math.PI / 2; k.position.set(2.386, 1.722, .395 + i * .13); cabinets.add(k);
            const rg = cyl(.036, .036, .006, M.mat, false, false, null, 12); rg.rotation.z = Math.PI / 2; rg.position.set(2.398, 1.722, .395 + i * .13); cabinets.add(rg);
          }
          const gasPipe = cyl(.016, .016, .08, M.handle, true, false, null, 8); gasPipe.rotation.x = Math.PI / 2; gasPipe.position.set(2.8, 1.2, .95); gasPipe.name = 'Ống ga'; cabinets.add(gasPipe);
          bakeStatic(cabinets); galley.add(cabinets); cab.add(galley);
          bakeStatic(inner); bakeStatic(dash); bakeStatic(wheels);   // gai lốp 192 mảnh: gộp sẵn theo vật liệu (để bộ gộp lượt vẽ không tách ra)
          parent.add(cab);
          return galley;
        }
