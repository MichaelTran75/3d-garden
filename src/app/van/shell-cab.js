        // ---- mobile home van (xe nhà di động): cabin lái + thân ở + cửa lùa MỞ + nội thất ----
        const caravanBody = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.5, depthWrite: false }), caravanRoofM = new THREE.MeshLambertMaterial({ color: 0xd8d3c6 }),
          caravanStripe = new THREE.MeshLambertMaterial({ color: 0xc0744a }), caravanDark = new THREE.MeshLambertMaterial({ color: 0x6f7a85 }),
          tyreMat = new THREE.MeshLambertMaterial({ color: 0x2b2925 }), rimMat = new THREE.MeshLambertMaterial({ color: 0xb9b3a6 }),
          awningMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), chairFrame = new THREE.MeshLambertMaterial({ color: 0x8b9197 }),
          chairFabric = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }),
          campFabricYellow = new THREE.MeshLambertMaterial({ color: 0xf5e2a3 }), // vàng nhạt
          campFrameWood = new THREE.MeshLambertMaterial({ color: 0x8b6f47 }); // màu gỗ (cùng tông cọc gỗ)
        // ---- CABIN LÁI, 4 BÁNH (bánh sau đôi) & TỦ BẾP — dựng hoàn toàn bằng code, không nhúng lưới ngoài ----
        // Khung xe (đv xe): mũi xe ở −x, cửa hông ở +z, cầu trước x = −2,097, cầu sau x = 1,888, tâm bánh y = 0,506.
        // Cabin xe tải nhẹ đầu bằng kiểu thập niên 80: mũi bo 2 góc, hông phình ở giữa rồi khum vào ở thắt lưng và chân cửa, kính chắn gió cong
        // ôm góc nghiêng 44°, mui vòm nằm ngay dưới khoang ngủ, cụm ga-lăng + đèn vuông lõm trong khung đen. Tay lái bên trái (+z), cột lái
        // nghiêng 19°, bàn đạp bản lề sàn như xe tải. Biên dạng là các điểm khống chế tự đặt theo kích thước tổng thể (dài, rộng, cao từng mức).
        // Vỏ & kính bán trong suốt như thân xe ở; trong x-ray vỏ (kể cả táp-lô, ốp cửa) ẩn, ghế + vô-lăng + sàn + bánh + tủ bếp giữ nguyên.
        const CAB = { xc: -3.22, xr: -1.32, floorY: 0.956, axleF: -2.096956, axleR: 1.888478, wheelY: 0.50561 };
        function motorhomeCab(parent) {
          const C = CAB, V3 = (x, y, z) => new THREE.Vector3(x, y, z), T = .04;   // T: vỏ 2 lớp dày 40 mm ⇒ đậm như tôn thật dù vật liệu bán trong suốt
          const lam = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o }), two = { side: THREE.DoubleSide };
          const M = {
            body: lam(0xE2D6C0, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }),
            glass: lam(0x8fc1e3, { transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
            trim: lam(0x42474a), matte: lam(0x30383a, two), bumper: lam(0x50585b), grille: lam(0x404a4b), handle: lam(0x777b7a),
            lamp: lam(0xfff3c4), lampBox: lam(0x858d8c), mirror: lam(0xb3ccd0),
            under: lam(0x665d4b, two), mat: lam(0x43494b), dash: lam(0x958776), dashTrim: lam(0x777166),
            seat: lam(0xc5b596), seatBand: lam(0x857962), seatDark: lam(0x42494a), switchCap: lam(0xb8afa0),
            tyre: lam(0x2b2925), rim: lam(0xb9b3a6, two), rimDark: lam(0x4c5355, two), hub: lam(0x92958e, two),
            cabinet: lam(0xa58e69), front: lam(0xd0ccc0)
          };
          const cab = new THREE.Group(); cab.name = 'Cabin lái, bánh xe & tủ bếp'; cab.userData.noBake = true;
          const shell = new THREE.Group(); shell.name = 'Vỏ cabin'; shell.userData.xray = 'shell';
          const inner = new THREE.Group(); inner.name = 'Nội thất cabin'; inner.userData.xray = 'keep';
          const wheels = new THREE.Group(); wheels.name = 'Bánh xe'; wheels.userData.xray = 'keep';
          cab.add(shell, inner, wheels);
          const mesh = (geo, mat, par, name, outline = null) => {
            const m = new THREE.Mesh(geo, mat); m.name = name; m.castShadow = mat !== M.glass; m.receiveShadow = true;
            if (outline) edge(m, geo, outline); par.add(m); return m;
          };
          const box = (par, name, w, h, d, x, y, z, mat, outlined = false) => { const m = bx(w, h, d, mat, true, outlined, lineDark); m.name = name; m.position.set(x, y, z); par.add(m); return m; };
          // thanh nối 2 điểm (khung kính, tay gạt, cột lái…): hộp tiết diện t×t, hoặc trụ tròn khi round
          const bar = (par, name, a, b, t, mat, round = false) => {
            const v = new THREE.Vector3().subVectors(b, a), len = v.length();
            const m = round ? cyl(t, t, len, mat, true, false, null, 8) : bx(t, len, t, mat, true, false);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); m.position.copy(a).add(b).multiplyScalar(.5);
            m.name = name; par.add(m); return m;
          };
          const polyline = (par, name, pts, t, mat) => { for (let i = 0; i < pts.length - 1; i++) bar(par, name, pts[i], pts[i + 1], t, mat); };
          // đa giác phẳng từ các đỉnh 3D (quạt tam giác)
          const facets = (polys) => {
            const p = [];
            for (const poly of polys) for (let i = 1; i < poly.length - 1; i++) p.push(...poly[0], ...poly[i], ...poly[i + 1]);
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.length / 3 * 2), 2)); geo.computeVertexNormals(); return geo;   // uv rỗng để gộp được với hình khác
          };
          const mirrorZ = polys => [...polys, ...polys.map(poly => poly.map(([x, y, z]) => [x, y, -z]).reverse())];   // lật z thì đảo thứ tự đỉnh để giữ chiều pháp tuyến
          // hình 2D đặt lên mặt phẳng (gốc o, trục u, v; đùn theo u×v)
          const onPlane = (geo, o, u, v) => geo.applyMatrix4(new THREE.Matrix4().makeBasis(u, v, new THREE.Vector3().crossVectors(u, v)).setPosition(o));
          const shapeOf = pts => new THREE.Shape(pts.map(p => new THREE.Vector2(...p)));
          const roundRect = (x0, y0, x1, y1, r) => { const s = new THREE.Shape(); s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s; };
          const lerpTab = (tab, t) => { if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) { const [a, va] = tab[i - 1], [b, vb] = tab[i]; return va + (vb - va) * (t - a) / (b - a); } return tab[tab.length - 1][1]; };
          const seam = [], seamLine = pts => { for (let i = 0; i < pts.length - 1; i++) seam.push(...pts[i], ...pts[i + 1]); };

          // ===== VỎ =====
          // hông xe: nửa bề rộng theo độ cao — khum vào dưới chân cửa, phẳng ở giữa, thắt ở vai rồi nghiêng vào dọc dải kính (2,10 → 2,84)
          const SIDE = [[.60, 1.22], [.95, 1.29], [1.15, 1.335], [1.78, 1.335], [1.92, 1.30], [2.03, 1.24], [2.10, 1.22], [2.84, 1.06]];
          const sideZ = y => lerpTab(SIDE, y), xWin = y => C.xc + (y - 2.10) / .74 * .56;   // mép trước dải kính hông (chân trụ A → nóc)
          // kính chắn gió: từng hàng (y, x giữa, nửa rộng, độ lùi ở mép) — cong ôm góc nhiều ở chân, gần phẳng ở đỉnh
          const WS = [[2.03, -3.62, 1.12, .24], [2.25, -3.41, 1.10, .20], [2.50, -3.235, 1.05, .15], [2.70, -3.04, .99, .09], [2.88, -2.78, .93, .03]];
          const wsRow = y => { let i = 1; while (i < WS.length - 1 && y > WS[i][0]) i++; const a = WS[i - 1], b = WS[i], k = (y - a[0]) / (b[0] - a[0]); return a.map((v, j) => v + (b[j] - v) * k); };
          const wsX = (y, z) => { const [, c, w, e] = wsRow(y); return c + e * Math.pow(Math.min(1, Math.abs(z) / w), 3.2); };
          // mũi xe: mặt bằng nửa phải (z, x) ở từng mức; cùng 8 điểm mỗi mức để dựng lưới; mức trên cùng = chân kính chắn gió
          const PLAN_MID = [[0, -3.80], [.45, -3.795], [.75, -3.77], [.92, -3.66], [1.06, -3.54], [1.20, -3.40], [1.29, -3.30], [1.335, C.xc]];
          const NOSE = [
            [.60, [[0, -3.645], [.45, -3.60], [.70, -3.555], [.86, -3.50], [.98, -3.44], [1.08, -3.37], [1.16, -3.30], [1.22, C.xc]]],
            [.95, [[0, -3.71], [.45, -3.69], [.72, -3.655], [.88, -3.61], [1.02, -3.55], [1.14, -3.46], [1.24, -3.35], [1.29, C.xc]]],
            [1.15, PLAN_MID], [1.21, PLAN_MID], [1.62, PLAN_MID], [1.78, PLAN_MID],
            [1.92, [[0, -3.71], [.45, -3.70], [.75, -3.68], [.92, -3.58], [1.06, -3.47], [1.17, -3.38], [1.25, -3.30], [1.30, C.xc]]],
            [2.03, [...[0, .45, .75, .92, 1.06, 1.12].map(z => [z, wsX(2.03, z)]), [1.19, -3.287], [1.24, C.xc]]]
          ];
          const GRILLE = [1.21, 1.62], GJ = 4;   // ô ga-lăng: khoét các đoạn mặt bằng 0…3 (|z| ≤ 1,06) giữa 2 mức này
          const noseX = (y, z) => {   // x mặt mũi xe tại độ cao y, bề ngang z (nội suy giữa các mức) — để đồ bên trong không đâm xuyên vỏ
            const at = plan => lerpTab(plan, Math.abs(z));
            for (let i = 1; i < NOSE.length; i++) if (y <= NOSE[i][0]) { const [ya, pa] = NOSE[i - 1], [yb, pb] = NOSE[i], k = Math.max(0, (y - ya) / (yb - ya)); return at(pa) * (1 - k) + at(pb) * k; }
            return at(NOSE[NOSE.length - 1][1]);
          };
          const behindNose = (geo, gap = T + .01) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const lim = noseX(p.getY(i), p.getZ(i)) + gap; if (p.getX(i) < lim) p.setX(i, lim); } geo.computeVertexNormals(); return geo; };
          const inset = (plan, d) => plan.map((p, j) => {   // lùi mặt bằng vào trong d (pháp tuyến trong mặt phẳng z–x)
            const a = plan[Math.max(0, j - 1)], b = plan[Math.min(plan.length - 1, j + 1)], tz = b[0] - a[0], tx = b[1] - a[1], l = Math.hypot(tz, tx);
            return [Math.max(0, p[0] - tx / l * d), p[1] + tz / l * d];
          });
          for (const d of [0, T]) {
            const polys = [];
            for (let i = 0; i < NOSE.length - 1; i++) {
              const [y0, a] = NOSE[i], [y1, b] = NOSE[i + 1], p0 = d ? inset(a, d) : a, p1 = d ? inset(b, d) : b, hole = y0 >= GRILLE[0] && y1 <= GRILLE[1];
              for (let j = 0; j < p0.length - 1; j++) if (!(hole && j < GJ)) polys.push([[p0[j][1], y0, p0[j][0]], [p0[j + 1][1], y0, p0[j + 1][0]], [p1[j + 1][1], y1, p1[j + 1][0]], [p1[j][1], y1, p1[j][0]]]);
            }
            mesh(facets(mirrorZ(polys)), M.body, shell, 'Mũi cabin bo góc', d ? null : lineDark);
          }
          // hông dưới & vai: các dải phẳng giữa các mức của SIDE, khoét hốc bánh trước (vòm hình thang đỉnh bằng)
          const ARCH = [[-2.72, .60], [-2.64, .92], [-2.52, 1.06], [-2.32, 1.155], [-1.88, 1.16], [-1.72, 1.08], [-1.60, .96], [-1.53, .74], [-1.51, .60]];
          const archL = ARCH.slice(0, 5), archR = ARCH.slice(4), archTop = 1.16;
          const archX = (br, y) => { for (let i = 0; i < br.length - 1; i++) { const [xa, ya] = br[i], [xb, yb] = br[i + 1]; if ((y - ya) * (y - yb) <= 0 && ya !== yb) return xa + (xb - xa) * (y - ya) / (yb - ya); } return br[br.length - 1][0]; };
          const bandPolys = (y0, y1) => {
            const xa = C.xc, xb = C.xr, inL = archL.filter(p => p[1] > y0 && p[1] < y1), inR = ARCH.slice(5).filter(p => p[1] > y0 && p[1] < y1);
            if (y0 >= archTop) return [[[xa, y0], [xb, y0], [xb, y1], [xa, y1]]];
            if (y1 < archTop) return [[[xa, y0], [archX(archL, y0), y0], ...inL, [archX(archL, y1), y1], [xa, y1]], [[archX(archR, y1), y1], ...inR, [archX(archR, y0), y0], [xb, y0], [xb, y1]]];
            return [[[xa, y0], [archX(archL, y0), y0], ...inL, ...inR, [archX(archR, y0), y0], [xb, y0], [xb, y1], [xa, y1]]];
          };
          for (let i = 0; i < 6; i++) {
            const [y0, z0] = SIDE[i], [y1, z1] = SIDE[i + 1];
            for (const d of [0, T]) for (const poly of bandPolys(y0, y1)) for (const s of [-1, 1]) {
              const g = new THREE.ShapeGeometry(shapeOf(poly)), pos = g.attributes.position;
              for (let k = 0; k < pos.count; k++) pos.setZ(k, s * (z0 + (z1 - z0) * (pos.getY(k) - y0) / (y1 - y0) - d));
              g.computeVertexNormals(); mesh(g, M.body, shell, 'Hông cabin');
            }
          }
          // dải kính hông (phẳng, nghiêng vào trong): kính gió tam giác cụt + kính cửa lớn bo góc sau–trên, khung đen
          const sv = Math.hypot(.74, .16), sOf = y => (y - 2.10) / .74 * sv;
          const winS = shapeOf([[C.xc, 0], [C.xr, 0], [C.xr, sv], [xWin(2.84), sv]]);
          const ventF = y => -3.00 + (y - 2.30) * .70;
          const vent = new THREE.Path(); vent.moveTo(ventF(2.14), sOf(2.14)); vent.lineTo(-2.56, sOf(2.14)); vent.lineTo(-2.56, sOf(2.80)); vent.lineTo(ventF(2.80), sOf(2.80)); vent.closePath();
          const main = new THREE.Path(); main.moveTo(-2.50, sOf(2.12)); main.lineTo(-1.50, sOf(2.12)); main.lineTo(-1.50, sOf(2.82) - .08); main.quadraticCurveTo(-1.50, sOf(2.82), -1.58, sOf(2.82)); main.lineTo(-2.50, sOf(2.82)); main.closePath();
          winS.holes.push(vent, main);
          for (const s of [-1, 1]) {
            const o = V3(0, 2.10, s * 1.22), u = V3(1, 0, 0), v = V3(0, .74, -s * .16).normalize(), nOut = new THREE.Vector3().crossVectors(u, v).multiplyScalar(s);
            mesh(onPlane(new THREE.ShapeGeometry(winS, 8), o, u, v), M.body, shell, 'Dải kính hông', lineDark);
            mesh(onPlane(new THREE.ShapeGeometry(winS, 8), o.clone().addScaledVector(nOut, -T), u, v), M.body, shell, 'Dải kính hông');
            for (const hole of [vent, main]) {
              mesh(onPlane(new THREE.ShapeGeometry(new THREE.Shape(hole.getPoints(6)), 6), o.clone().addScaledVector(nOut, -.012), u, v), M.glass, shell, 'Kính cửa cabin');   // kính lùi vào 12 mm
              const pts = hole.getPoints(3).map(p => o.clone().addScaledVector(u, p.x).addScaledVector(v, p.y));
              for (let i = 0; i < pts.length; i++) { const q = pts[(i + 1) % pts.length]; if (q.distanceTo(pts[i]) > .005) bar(shell, 'Khung kính cửa', pts[i], q, .03, M.matte); }
            }
          }
          // kính chắn gió cong: lưới hàng × cột, khung đen chạy quanh mép
          const WT = [-1, -.95, -.85, -.7, -.5, -.25, 0, .25, .5, .7, .85, .95, 1], wsPt = (y, t) => { const w = wsRow(y)[2]; return [wsX(y, t * w), y, t * w]; };
          const wsPos = [], wsIdx = [];
          for (const [y] of WS) for (const t of WT) wsPos.push(...wsPt(y, t));
          for (let r = 0; r < WS.length - 1; r++) for (let c = 0; c < WT.length - 1; c++) { const a = r * WT.length + c, b = a + WT.length; wsIdx.push(a, a + 1, b + 1, a, b + 1, b); }
          const wsGeo = new THREE.BufferGeometry(); wsGeo.setAttribute('position', new THREE.Float32BufferAttribute(wsPos, 3));
          wsGeo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(wsPos.length / 3 * 2), 2)); wsGeo.setIndex(wsIdx); wsGeo.computeVertexNormals();
          mesh(wsGeo, M.glass, shell, 'Kính chắn gió');
          polyline(shell, 'Khung kính chắn gió', WT.map(t => V3(...wsPt(2.03, t))), .035, M.matte);
          polyline(shell, 'Khung kính chắn gió', WT.map(t => V3(...wsPt(2.88, t))), .035, M.matte);
          polyline(shell, 'Ốp chân kính', WT.map(t => { const [x, , z] = wsPt(2.03, t); return V3(x - .025, 2.045, z); }), .04, M.matte);
          for (const t of [-1, 1]) polyline(shell, 'Khung kính chắn gió', WS.map(([y]) => V3(...wsPt(y, t))), .035, M.matte);
          // trụ A: nối mép kính chắn gió với mép trước hông / dải kính; mui vòm + đầu mui phía trên kính
          const PY = [2.03, 2.10, 2.25, 2.50, 2.70, 2.84, 2.88];
          const sideFront = y => y <= 2.10 ? [C.xc, y, sideZ(y)] : y <= 2.84 ? [xWin(y), y, sideZ(y)] : [-2.70, 2.885, 1.02];
          const pil = []; for (let i = 0; i < PY.length - 1; i++) pil.push([wsPt(PY[i], 1), sideFront(PY[i]), sideFront(PY[i + 1]), wsPt(PY[i + 1], 1)]);
          mesh(facets(mirrorZ(pil)), M.body, shell, 'Trụ kính chắn gió', lineDark);
          const ROOF = [[1.06, 2.84], [1.02, 2.885], [.95, 2.905], [.88, 2.925], [.70, 2.945], [.42, 2.965], [0, 2.98]], roofY = z => lerpTab([...ROOF].reverse(), Math.abs(z));
          const roofX = z => lerpTab([[0, -2.75], [.80, -2.75], [.95, -2.74], [1.02, -2.70], [1.06, xWin(2.84)]], Math.abs(z));
          const roofZ = [...ROOF.map(p => -p[0]), ...ROOF.slice(0, -1).reverse().map(p => p[0])];
          for (const d of [0, T]) {
            const polys = []; for (let k = 0; k < roofZ.length - 1; k++) { const a = roofZ[k], b = roofZ[k + 1]; polys.push([[roofX(a), roofY(a) - d, a], [C.xr, roofY(a) - d, a], [C.xr, roofY(b) - d, b], [roofX(b), roofY(b) - d, b]]); }
            mesh(facets(polys), M.body, shell, 'Mui vòm cabin', d ? null : lineDark);
          }
          const HZ = [0, .25, .50, .80, .93], head = [];
          for (let k = 0; k < HZ.length - 1; k++) { const a = HZ[k], b = HZ[k + 1]; head.push([wsPt(2.88, a / .93), [roofX(a), roofY(a), a], [roofX(b), roofY(b), b], wsPt(2.88, b / .93)]); }
          head.push([wsPt(2.88, 1), [roofX(.93), roofY(.93), .93], [-2.70, 2.885, 1.02]]);
          mesh(facets(mirrorZ(head)), M.body, shell, 'Đầu mui trên kính', lineDark);
          // gạt mưa nằm sát chân kính
          for (const z0 of [.09, -.75]) {
            bar(shell, 'Cần gạt mưa', V3(wsX(2.05, z0) - .02, 2.05, z0), V3(wsX(2.13, z0 + .70) - .015, 2.13, z0 + .70), .016, M.trim);
            const pv = cyl(.02, .02, .03, M.trim, true, false); pv.position.set(wsX(2.04, z0) - .03, 2.045, z0); shell.add(pv);
          }
          // gương chiếu hậu: hộp bo góc + mặt gương quay về sau, giá dẹt dưới + thanh chéo trên
          for (const s of [-1, 1]) {
            const hg = onPlane(new THREE.ExtrudeGeometry(roundRect(-.12, -.248, .12, .248, .045), { depth: .141, bevelEnabled: false, curveSegments: 3 }), V3(-3.051, 2.309, s * 1.5585), V3(0, 0, 1), V3(0, 1, 0));
            mesh(hg, M.trim, shell, 'Hộp gương chiếu hậu', lineDark);
            const mg = new THREE.Mesh(new THREE.PlaneGeometry(.20, .43), M.mirror); mg.rotation.y = Math.PI / 2; mg.position.set(-3.049, 2.309, s * 1.5585); mg.name = 'Mặt gương'; shell.add(mg);
            box(shell, 'Giá gương', .097, .086, .26, -3.155, 2.135, s * 1.324, M.matte);
            bar(shell, 'Thanh gương', V3(-2.99, 2.346, s * 1.165), V3(-3.17, 2.346, s * 1.45), .044, M.matte, true);
            box(shell, 'Tay nắm cửa', .21, .045, .03, -1.575, 1.765, s * (sideZ(1.765) + .015), M.handle, true);
          }
          // đường ron cửa (cửa ôm qua hốc bánh), gân vai, viền hốc bánh — vẽ bằng nét
          for (const s of [-1, 1]) {
            const on = (x, y) => [x, y, s * (y <= 2.10 ? sideZ(y) + .003 : sideZ(y) + .003)];
            const up = x => [.92, .95, 1.15, 1.78, 1.92, 2.03, 2.10].map(y => on(x, y));
            seamLine(up(-3.215)); seamLine(up(-1.40)); seamLine([on(-1.40, 2.10), on(-1.40, 2.84)]);
            seamLine([on(-3.215, .92), on(archX(archL, .92), .92)]); seamLine([on(archX(archR, .92), .92), on(-1.40, .92)]);
            seamLine(ARCH.map(([x, y]) => on(x, y)));
            for (const y of [1.78, 1.92, 2.03]) seamLine([on(C.xc, y), on(C.xr, y)]);
          }
          const seamL = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(seam, 3)), lineDark); seamL.name = 'Ron cửa cabin'; shell.add(seamL);
          // cụm ga-lăng lõm sâu: khung đen bám mặt mũi xe (gờ trên/dưới cao 4 cm), lưới tản nhiệt lùi tới x = −3,60, 2 hộp đèn vuông lùi tới −3,54
          // (mỗi hộp 2 đèn tròn), vách ngăn đen giữa lưới và hộp đèn nhô ra −3,70 — mép nhô trước nhất của cụm khi nhìn ngang
          const xGr = -3.60, xLp = -3.54, zDiv = .79, zO = PLAN_MID[GJ][0], xMid = z => lerpTab(PLAN_MID, Math.abs(z)), gTop = 1.585, gBot = 1.25;
          const railPlan = inset(PLAN_MID, -.012).slice(0, GJ + 1), rails = [];
          for (const [y0, y1] of [[gTop, 1.625], [1.205, gBot]]) for (let j = 0; j < GJ; j++)
            rails.push([[railPlan[j][1], y0, railPlan[j][0]], [railPlan[j + 1][1], y0, railPlan[j + 1][0]], [railPlan[j + 1][1], y1, railPlan[j + 1][0]], [railPlan[j][1], y1, railPlan[j][0]]]);
          mesh(facets(mirrorZ(rails)), M.matte, shell, 'Khung ga-lăng', lineDark);
          const curve = [...PLAN_MID.slice(1, GJ + 1).reverse().map(([z]) => -z), ...PLAN_MID.slice(0, GJ + 1).map(([z]) => z)];   // −1,06 … 1,06
          const tunnel = shapeOf([...curve.map(z => [xMid(z), z]), [xLp, zDiv], [xGr, zDiv], [xGr, -zDiv], [xLp, -zDiv]]);   // mặt bằng lòng ga-lăng (x, z)
          for (const y of [gTop, gBot]) mesh(new THREE.ShapeGeometry(tunnel).rotateX(Math.PI / 2).translate(0, y, 0), M.matte, shell, 'Lòng ga-lăng');
          const facePlane = (w, h, x, y, z, mat, name) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.rotation.y = -Math.PI / 2; p.position.set(x, y, z); p.name = name; shell.add(p); return p; };
          const gMid = (gTop + gBot) / 2, gH = gTop - gBot;
          facePlane(2 * zDiv, gH, xGr - .001, gMid, 0, M.grille, 'Nền lưới tản nhiệt');
          for (let i = 0; i < 5; i++) box(shell, 'Nan lưới tản nhiệt', .012, .022, 2 * zDiv - .04, xGr - .008, 1.29 + i * .065, 0, M.lampBox);
          for (const s of [-1, 1]) {
            box(shell, 'Vách ngăn ga-lăng', .15, gH, .03, -3.625, gMid, s * zDiv, M.matte, true);
            facePlane(zO - zDiv, gH, xLp - .001, gMid, s * (zO + zDiv) / 2, M.lampBox, 'Hộp đèn pha');
            for (const [y, r] of [[1.505, .062], [1.345, .078]]) {
              const lens = new THREE.Mesh(new THREE.CircleGeometry(r, 18), M.lamp); lens.rotation.y = -Math.PI / 2; lens.position.set(xLp - .005, y, s * .9175); lens.name = 'Đèn pha'; shell.add(lens);
              const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .009, 5, 18), M.handle); ring.rotation.y = Math.PI / 2; ring.position.copy(lens.position); shell.add(ring);
            }
          }
          // cản trước cong theo mũi xe: mép trên ngả ra trước (nhiều nhất ở 2 góc), mép dưới cao dần về 2 bên, ôm vào hông tới trước hốc bánh
          const BUMP = [   // [z ngoài, x mép trên, x mép dưới, z trong, x trong]
            [0, -3.88, -3.80, 0, -3.68], [.50, -3.84, -3.72, .50, -3.64], [.80, -3.80, -3.68, .78, -3.61], [.92, -3.79, -3.62, .88, -3.57],
            [1.00, -3.70, -3.53, .96, -3.50], [1.12, -3.56, -3.42, 1.06, -3.42], [1.20, -3.47, -3.37, 1.15, -3.34], [1.26, -3.40, -3.34, 1.22, -3.28],
            [1.33, -3.31, -3.28, 1.29, -3.18], [1.364, -3.18, -3.18, 1.305, -3.08], [1.364, -2.66, -2.66, 1.305, -2.66]];
          const bFull = [...BUMP.slice(1).reverse().map(([zo, xt, xb, zi, xi]) => [-zo, xt, xb, -zi, xi]), ...BUMP], bumper = [];
          const bBot = z => lerpTab([[0, .647], [.88, .638], [1.1, .628], [1.2, .62], [1.3, .615]], Math.abs(z)), bTopY = z => .925 - .025 * (z / 1.364) ** 2;
          const bq = n => { const [zo, xt, xb, zi, xi] = bFull[n]; return { OT: [xt, bTopY(zo), zo], OB: [xb, bBot(zo), zo], IB: [xi, bBot(zi), zi], IT: [xi, bTopY(zi), zi] }; };
          for (let n = 0; n < bFull.length - 1; n++) { const a = bq(n), b = bq(n + 1); bumper.push([a.OT, a.OB, b.OB, b.OT], [a.OB, a.IB, b.IB, b.OB], [a.IB, a.IT, b.IT, b.IB], [a.IT, a.OT, b.OT, b.IT]); }
          for (const n of [0, bFull.length - 1]) { const a = bq(n); bumper.push([a.OT, a.OB, a.IB, a.IT]); }
          mesh(facets(bumper), M.bumper, shell, 'Cản trước', lineDark);
          // biển số "Jade" lõm trong giá có viền, treo dưới tâm cản
          box(shell, 'Giá biển số', .128, .257, .53, -3.776, .6465, 0, M.trim, true);
          for (const [h, d, y, z] of [[.025, .53, .7625, 0], [.025, .53, .5305, 0], [.257, .025, .6465, .2525], [.257, .025, .6465, -.2525]]) box(shell, 'Viền biển số', .031, h, d, -3.8555, y, z, M.trim);
          const pc = document.createElement('canvas'); pc.width = 256; pc.height = 128; const pk = pc.getContext('2d');
          pk.fillStyle = '#e4dbc5'; pk.fillRect(0, 0, 256, 128); pk.strokeStyle = '#243240'; pk.lineWidth = 6; pk.strokeRect(6, 6, 244, 116);
          pk.font = '700 84px Arial, sans-serif'; pk.textAlign = 'center'; pk.textBaseline = 'middle'; pk.fillStyle = '#243240'; pk.fillText('Jade', 128, 68);
          const plateTex = new THREE.CanvasTexture(pc); plateTex.colorSpace = THREE.SRGBColorSpace;
          facePlane(.42, .21, -3.842, .6465, 0, new THREE.MeshLambertMaterial({ map: plateTex }), 'Biển số trước · Jade');
          // ốp trong cửa: hộc, tay vịn, tay nắm phía sau (thuộc cửa ⇒ ẩn khi xem xuyên)
          for (const s of [-1, 1]) {
            box(shell, 'Hộc cửa', .573, .306, .088, -2.8965, 1.182, s * 1.252, M.trim);
            box(shell, 'Tay vịn cửa', .567, .126, .10, -2.9325, 1.676, s * 1.267, M.trim);
            box(shell, 'Tay nắm trong cửa', .269, .111, .089, -2.1925, 1.6725, s * 1.2535, M.trim);
            box(shell, 'Tấm che nắng', .16, .019, .637, -2.691, 2.8415, s * .5595, M.dashTrim);
          }

          // ===== NỘI THẤT =====
          // sàn: thảm (y 0,956) đặt trên khung, gầm chỉ là tấm mỏng (khay trước + tấm giữa); 2 bên thảm chỉ có phần trước/sau hốc bánh;
          // hốc bánh trong là vòm hình thang chạy từ z 0,56 ra vách
          box(inner, 'Tấm sàn gầm', 1.30, .01, 1.90, -1.97, .535, 0, M.under);   // tấm mỏng dưới ghế, nằm lọt giữa 2 bánh trước
          const trayPlan = inset(NOSE[0][1], T), tray = [...trayPlan.map(([z, x]) => [x, z]), [-2.72, trayPlan[trayPlan.length - 1][0]], [-2.72, -trayPlan[trayPlan.length - 1][0]], ...trayPlan.slice(1).reverse().map(([z, x]) => [x, -z])];   // đáy mũi (+z) → góc sau → đáy mũi (−z)
          mesh(new THREE.ExtrudeGeometry(shapeOf(tray), { depth: .045, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, .60, 0), M.under, inner, 'Khay gầm trước');
          box(inner, 'Tấm ốp sàn sau cabin', .086, .01, 2.844, -1.265, .529, 0, M.under);   // nẹp sàn chỗ cabin nối thân ở, nhô 8 cm mỗi bên
          box(inner, 'Thảm sàn', 1.85, .029, 1.12, -2.294, .9415, 0, M.mat);
          for (const s of [-1, 1]) {
            box(inner, 'Thảm sàn', .584, .029, .69, -2.927, .9415, s * .905, M.mat);
            box(inner, 'Thảm sàn', .211, .029, .69, -1.4745, .9415, s * .905, M.mat);
            const tub = [[-2.73, .54], ...ARCH, [-1.50, .54]], rib = []; for (let i = 0; i < tub.length - 1; i++) { const [xa, ya] = tub[i], [xb, yb] = tub[i + 1]; rib.push([[xa, ya, s * .56], [xb, yb, s * .56], [xb, yb, s * 1.30], [xa, ya, s * 1.30]]); }
            mesh(facets(rib), M.under, inner, 'Hốc bánh trước');
            mesh(new THREE.ShapeGeometry(shapeOf(tub)).translate(0, 0, s * .56), M.under, inner, 'Vách trong hốc bánh');
          }
          // ghế lái + ghế phụ: đệm bo mép trước, lõm giữa; tựa lưng bo 2 góc trên, mặt trước lõm, ngả 15,6°; đai viền, núm chỉnh răng cưa; 4 chân + 2 ray trượt
          const shaped = (w, h, d, segs, fn) => { const g = new THREE.BoxGeometry(w, h, d, ...segs), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; };
          const roundCorner = (v, a, b, ca, cb, r) => { const da = v[a] * Math.sign(ca) - Math.abs(ca), db = v[b] * Math.sign(cb) - Math.abs(cb); if (da > 0 && db > 0) { const l = Math.hypot(da, db); if (l > r * .999) { v[a] = Math.sign(ca) * (Math.abs(ca) + da / l * r); v[b] = Math.sign(cb) * (Math.abs(cb) + db / l * r); } } };
          const cushionGeo = shaped(.90, .304, .96, [12, 4, 12], v => {
            roundCorner(v, 'x', 'y', -(.45 - .08), .152 - .08, .08);   // mép trên phía trước bo tròn
            const k = Math.min(1, Math.max(0, (v.y - .06) / .09)); v.y -= .032 * k * Math.max(0, 1 - (v.z / .38) ** 2);   // lõm giữa, 2 má ghế nhô
          });
          const backGeo = shaped(.16, .96, .96, [2, 10, 12], v => {
            for (const s of [-1, 1]) roundCorner(v, 'z', 'y', s * (.48 - .12), .48 - .12, .12);
            if (v.x < 0) v.x += .04 * Math.max(0, 1 - (v.z / .40) ** 2);   // mặt tựa lõm, 2 má ôm lưng
          });
          const gear = new THREE.Shape(); for (let i = 0; i <= 28; i++) { const t = i / 28 * Math.PI * 2, r = i % 2 ? .085 : .098; i ? gear.lineTo(Math.cos(t) * r, Math.sin(t) * r) : gear.moveTo(r, 0); }
          const gearGeo = new THREE.ExtrudeGeometry(gear, { depth: .06, bevelEnabled: false }).translate(0, 0, -.03);
          for (const s of [-1, 1]) {
            const zc = s * .64;
            mesh(cushionGeo, M.seat, inner, 'Đệm ngồi', lineDark).position.set(-2.15, 1.368, zc);
            box(inner, 'Hộp sau ghế', .378, .444, 1.104, -1.725, 1.361, s * .696, M.dashTrim);   // hộp che chân tựa lưng, nối đệm với sàn
            const back = mesh(backGeo, M.seat, inner, 'Tựa lưng', lineDark); back.position.set(-1.65, 1.985, zc); back.rotation.z = -.272;
            const band = box(back, 'Đai tựa lưng', .18, .07, .98, 0, -.40, 0, M.seatBand); band.castShadow = false;
            mesh(gearGeo, M.seatDark, inner, 'Núm chỉnh tựa', lineDark).position.set(-1.77, 1.385, s * 1.15);
            for (const x of [-2.472, -1.697]) for (const zl of [.282, 1.025]) box(inner, 'Chân ghế', .166, .224, .074, x, 1.039, s * zl, M.seatDark);
            for (const zl of [.282, 1.031]) box(inner, 'Ray trượt ghế', .951, .046, .106, -2.0805, 1.174, s * zl, M.mat);
          }
          // táp-lô: hõm gối + gờ, mặt đứng, mặt nghiêng 31° lên chân kính; mặt trước là vách lửa nghiêng từ chân kính xuống sàn (ẩn khi xem xuyên)
          const dash = new THREE.Group(); dash.name = 'Táp-lô'; dash.userData.xray = 'shell'; inner.add(dash);
          const dashGeo = new THREE.ExtrudeGeometry(shapeOf([[-3.25, C.floorY], [-3.20, C.floorY], [-3.27, 1.18], [-3.05, 1.46], [-3.11, 1.50], [-3.12, 1.78], [-3.55, 2.035], [-3.60, 2.035], [-3.32, 1.60], [-3.30, 1.20]]), { depth: 2.5, steps: 25, bevelEnabled: false }).translate(0, 0, -1.25);
          behindNose(dashGeo);
          mesh(dashGeo, M.dash, dash, 'Táp-lô', lineDark);
          const incl = new THREE.Vector2(-3.55 - -3.12, 2.035 - 1.78).normalize(), inclAng = Math.atan2(incl.y, incl.x), onIncl = (t, lift) => V3(-3.12 + incl.x * t + incl.y * lift, 1.78 + incl.y * t - incl.x * lift, 0);
          // cụm đồng hồ trước ghế lái: hộp có mái che, mặt 3 đồng hồ chữ nhật lõm sâu (vẽ canvas)
          const binGeo = new THREE.ExtrudeGeometry(shapeOf([[-3.27, 1.869], [-3.27, 2.12], [-3.10, 2.13], [-3.10, 2.18], [-3.30, 2.18], [-3.50, 2.10], [-3.55, 2.035]]), { depth: .74, steps: 8, bevelEnabled: false }).translate(0, 0, .24);
          behindNose(binGeo);
          mesh(binGeo, M.dashTrim, dash, 'Hộp đồng hồ', lineDark);
          const gc = document.createElement('canvas'); gc.width = 256; gc.height = 96; const gk = gc.getContext('2d');
          gk.fillStyle = '#20292b'; gk.fillRect(0, 0, 256, 96);
          for (let i = 0; i < 3; i++) {
            const x0 = 8 + i * 84; gk.fillStyle = '#e3d9a8'; gk.fillRect(x0, 10, 72, 76);
            gk.strokeStyle = '#2b2a26'; gk.lineWidth = 2; gk.beginPath(); gk.arc(x0 + 36, 60, 28, Math.PI * 1.1, Math.PI * 1.9); gk.stroke();
            for (let k = 0; k <= 6; k++) { const t = Math.PI * (1.1 + k * .8 / 6); gk.beginPath(); gk.moveTo(x0 + 36 + Math.cos(t) * 24, 60 + Math.sin(t) * 24); gk.lineTo(x0 + 36 + Math.cos(t) * 30, 60 + Math.sin(t) * 30); gk.stroke(); }
            const t = Math.PI * (1.25 + i * .22); gk.strokeStyle = '#c0392b'; gk.lineWidth = 3; gk.beginPath(); gk.moveTo(x0 + 36, 60); gk.lineTo(x0 + 36 + Math.cos(t) * 26, 60 + Math.sin(t) * 26); gk.stroke();
          }
          const gaugeTex = new THREE.CanvasTexture(gc); gaugeTex.colorSpace = THREE.SRGBColorSpace;
          const gauge = new THREE.Mesh(new THREE.PlaneGeometry(.56, .21), new THREE.MeshLambertMaterial({ map: gaugeTex })); gauge.name = 'Mặt đồng hồ';
          gauge.rotation.y = Math.PI / 2; gauge.position.set(-3.268, 1.995, .61); dash.add(gauge);
          // giữa táp-lô: cửa gió nan ngang trên mặt nghiêng, 5 núm ở mặt đứng; hộc đựng đồ nhô ra bên phụ; 2 loa; cửa gió đứng 2 đầu; 2 khe sấy kính
          const vMid = onIncl(.23, .004), vent2 = box(dash, 'Cửa gió giữa', .235, .006, .29, vMid.x, vMid.y, .0685, M.matte); vent2.rotation.z = inclAng;
          for (let i = 0; i < 12; i++) { const p = onIncl(.125 + i * .019, .012); const s2 = box(dash, 'Nan cửa gió', .006, .01, .27, p.x, p.y, .0685, M.dashTrim); s2.rotation.z = inclAng; }
          for (const z of [.035, .095, .155, .216, .283]) { const k = cyl(.02, .02, .035, M.switchCap, true, false, null, 10); k.rotation.z = Math.PI / 2; k.position.set(-3.10, 1.688, z); dash.add(k); }
          const gbGeo = new THREE.ExtrudeGeometry(shapeOf([[-3.12, 1.784], [-3.04, 1.784], [-3.04, 1.93], [-3.09, 1.96], [-3.39, 1.96], [-3.39, 1.940]]), { depth: .632, bevelEnabled: false }).translate(0, 0, -.758);
          mesh(gbGeo, M.dashTrim, dash, 'Hộc đựng đồ', lineDark);
          box(dash, 'Khoá hộc', .012, .03, .07, -3.034, 1.87, -.44, M.matte);
          for (const s of [-1, 1]) {
            const spk = cyl(.095, .103, .07, M.matte, true, false, null, 16); spk.rotation.z = -Math.PI / 2; spk.position.set(-3.07, 1.64, s * .934); spk.name = 'Loa'; dash.add(spk);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(.09, .008, 5, 16), M.dashTrim); rim.rotation.y = Math.PI / 2; rim.position.set(-3.034, 1.64, s * .934); dash.add(rim);
            box(dash, 'Cửa gió đầu táp-lô', .25, .356, .096, -3.216, 1.947, s * 1.049, M.dashTrim, true);
            for (let i = 0; i < 6; i++) box(dash, 'Lá cửa gió', .012, .012, .085, -3.088, 1.87 + i * .04, s * 1.049, M.matte);
            const d = onIncl(.47, .004), slot = box(dash, 'Khe sấy kính', .045, .006, .68, d.x, d.y, s * .37, M.matte); slot.rotation.z = inclAng;
          }
          // cột lái nghiêng 19° kiểu xe tải + vô-lăng 12 cạnh, 3 chấu chữ T, vuông góc cột lái
          const hubP = V3(-2.768, 2.05, .6145), colDir = V3(Math.sin(.332), Math.cos(.332), 0), colA = hubP.clone().addScaledVector(colDir, -(2.05 - .93) / colDir.y);
          bar(inner, 'Cột lái', colA, hubP.clone().addScaledVector(colDir, -.02), .03, M.matte, true);
          const wheel = new THREE.Group(); wheel.name = 'Vô-lăng'; wheel.position.copy(hubP); wheel.quaternion.setFromUnitVectors(V3(0, 0, 1), colDir); inner.add(wheel);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(.23, .02, 6, 12), M.mat); ring.castShadow = true; wheel.add(ring);
          for (const t of [0, Math.PI / 2, -Math.PI / 2]) bar(wheel, 'Chấu vô-lăng', V3(0, 0, .005), V3(Math.cos(t) * .22, Math.sin(t) * .22, 0), .022, M.mat);
          const hubCap = cyl(.045, .045, .03, M.matte, true, true, lineDark, 12); hubCap.rotation.x = Math.PI / 2; wheel.add(hubCap);
          // cần số giữa 2 ghế (chụp cao su + cần + núm), 3 bàn đạp bản lề sàn nghiêng 45°
          const bootM = cyl(.05, .087, .127, M.matte, true, false, null, 10); bootM.position.set(-2.906, C.floorY + .04, .1225); inner.add(bootM);
          bar(inner, 'Cần số', V3(-2.94, 1.04, .1225), V3(-2.70, 1.83, .1225), .013, M.mat, true);
          const gearKnob = sph(.035, M.seat, true, false); gearKnob.position.set(-2.694, 1.846, .1225); inner.add(gearKnob);
          for (const [z, l] of [[.392, .33], [.504, .29], [.80, .29]]) { const pad = box(inner, 'Bàn đạp', l, .018, .06, -3.195, 1.035, z, M.trim); pad.rotation.z = 2.38; }

          // ===== BÁNH XE: lốp tiện theo biên dạng (vai vuông bo nhẹ), mâm thép: vành, lòng chảo, đáy chảo, bệ trục tối, nắp trục, 6 ốc =====
          const lathe = (pts, n = 28) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(...p)), n);
          const tyreGeo = lathe([[.31, -.19], [.40, -.199], [.46, -.193], [.495, -.176], [.506, -.152], [.506, .152], [.495, .176], [.46, .193], [.40, .199], [.31, .19]]);
          const rimGeo = lathe([[.316, .152], [.30, .157], [.28, .150], [.25, .12]]), dishGeo = lathe([[.25, .12], [.20, .12]]);
          const bossGeo = lathe([[.20, .12], [.196, .165], [.07, .17]]), capGeo = lathe([[.07, .17], [.06, .185], [0, .188]], 16);
          const backDisc = new THREE.CircleGeometry(.315, 24);
          for (const g of [tyreGeo, rimGeo, dishGeo, bossGeo, capGeo]) g.rotateX(Math.PI / 2);   // trục tiện (y) → trục bánh (z); phía +z là mặt ngoài
          const nutGeo = new THREE.CylinderGeometry(.017, .017, .022, 6); nutGeo.rotateX(Math.PI / 2);
          function roadWheel(x, z, outward, name) {
            const w = new THREE.Group(); w.name = name; w.position.set(x, C.wheelY, z); if (outward < 0) w.rotation.y = Math.PI;
            const t = new THREE.Mesh(tyreGeo, M.tyre); t.castShadow = t.receiveShadow = true; edge(t, tyreGeo, lineDark); w.add(t);
            for (const [g, m] of [[rimGeo, M.rim], [dishGeo, M.hub], [bossGeo, M.rimDark], [capGeo, M.hub]]) { const p = new THREE.Mesh(g, m); p.castShadow = true; w.add(p); }
            const bk = new THREE.Mesh(backDisc, M.rimDark); bk.position.z = -.19; bk.rotation.y = Math.PI; w.add(bk);
            for (let k = 0; k < 6; k++) { const n = new THREE.Mesh(nutGeo, M.tyre); n.position.set(Math.cos(k * Math.PI / 3) * .13, Math.sin(k * Math.PI / 3) * .13, .175); w.add(n); }
            wheels.add(w);
          }
          for (const sd of [-1, 1]) {
            roadWheel(C.axleF, sd * 1.198, sd, 'Bánh trước');
            roadWheel(C.axleR, sd * 1.368, sd, 'Bánh sau ngoài'); roadWheel(C.axleR, sd * .9575, sd, 'Bánh sau trong');
          }

          // ===== TỦ BẾP dọc vách cửa hông (toạ độ cục bộ: mặt cánh tủ quay về −x, nóc tủ 1,795 ngay dưới mặt đá) =====
          const galley = new THREE.Group(); galley.name = 'Bếp dọc vách cửa hông'; galley.userData.xray = 'keep'; galley.userData.noBake = true;
          galley.rotation.y = -Math.PI / 2; galley.position.set(1.92, 0, -1.57);   // xoay quanh tâm mặt bếp (1,92; 1,1): mặt cánh tủ hướng ra lối đi
          const cabinets = new THREE.Group(); cabinets.name = 'Thân tủ & cánh tủ';
          box(cabinets, 'Thân tủ bếp', .51, .725, 1.82, 2.665, 1.4325, 0, M.cabinet, true);
          // theo mẫu bếp: trái → phải (nhìn từ lối đi) = tủ chậu (1 cánh) · tủ giữa (1 cánh lớn, trên là bàn sơ chế) · khối bếp + lò nướng tách riêng
          for (const [name, h, d, y, z] of [['Cánh tủ chậu', .505, .398, 1.3325, -.69], ['Cánh tủ giữa', .65, .68, 1.405, -.11], ['Cửa lò nướng', .5, .52, 1.37, .59], ['Ngăn kéo', .13, .35, 1.685, -.677]])
            box(cabinets, name, .012, h, d, 2.403, y, z, M.front, true);
          box(cabinets, 'Ô kính cửa lò', .006, .2, .34, 2.396, 1.42, .59, M.matte);
          for (const z of [-.53, .19, .8]) box(cabinets, 'Tay nắm tủ', .018, .11, .05, 2.39, 1.42, z, M.trim);   // tay nắm dọc sát mép phải mỗi cánh
          box(cabinets, 'Khe tách khối bếp', .58, .76, .014, 2.68, 1.45, .263, M.matte);
          for (let i = 0; i < 4; i++) {   // 4 núm vặn ga trên mặt trước khối bếp
            const k = cyl(.027, .027, .03, M.matte, true, false, null, 12); k.rotation.z = Math.PI / 2; k.position.set(2.386, 1.722, .395 + i * .13); cabinets.add(k);
            const ring = cyl(.036, .036, .006, M.trim, false, false, null, 12); ring.rotation.z = Math.PI / 2; ring.position.set(2.398, 1.722, .395 + i * .13); cabinets.add(ring);
          }
          const gasPipe = cyl(.016, .016, .08, M.handle, true, false, null, 8); gasPipe.rotation.x = Math.PI / 2; gasPipe.position.set(2.8, 1.2, .95); gasPipe.name = 'Ống ga'; cabinets.add(gasPipe);
          const gasNut = cyl(.022, .022, .02, M.handle, true, false, null, 6); gasNut.rotation.x = Math.PI / 2; gasNut.position.set(2.8, 1.2, .985); cabinets.add(gasNut);
          bakeStatic(cabinets); galley.add(cabinets); cab.add(galley);

          bakeStatic(cab);
          parent.add(cab);
          return galley;
        }

