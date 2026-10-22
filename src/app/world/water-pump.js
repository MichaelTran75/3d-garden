        // ===== TRẠM BƠM + ĐƯỜNG ỐNG LÊN THÁP NƯỚC (G 21/10 "lấy 1 số kết cấu ra làm máy bơm x66 z58 và làm đường ống nước tới water tank, sau đó cho
        //  water tank 50% transparent, add water level theo mùa") =====
        //  Máy bơm: mẫu "P-0301 B" (athar_faz, CC-BY-4.0) — chỉ lấy bơm ly tâm vỏ tách đôi + chụp khớp nối + động cơ điện + 1 van tay (src/tools/pump/ →
        //  models/pump.glb 45 KB, 3,5k tam giác, màu đỉnh). Đặt ở mép hồ thượng lưu (x66 z58; hồ bắt đầu từ x67): bệ bê-tông + khung thép, trục bơm dọc
        //  bắc–nam (động cơ phía nam), họng hút +X ra hồ — ống hút chúc xuống nước, rọ hút ngập ~0,5; họng đẩy −X → côn thu → van tay → ống DN75 (G 21/10 tối "cho
        //  ống nước nhỏ lại 1/2 đi dưới đất rồi trồi lên gần water tank": trước DN150 nổi trên gối kê 25 m) cắm thẳng xuống đất ngay ngoài bệ, ĐI NGẦM (không vẽ),
        //  trồi lên ngoài ban công tháp nước phía đông, dựng thẳng lên đỉnh, vắt qua mái nón, cắm vào mái (22/10 — trước: chữ T vào ống đứng giữa tháp). Chỗ ống chui xuống / trồi lên có
        //  vòng bê-tông. Ống ngầm ⇒ hết chắn đường bò, hươu (bản nổi phải hạ sát đất cho chúng bước qua).
        //  CHẠY THEO NẮNG (điện mặt trời): 8:00–16:30 khi mặt trời trên chân trời và bồn chưa đầy — động cơ rung nhẹ, đèn báo trên hộp động cơ xanh.
        //  MỰC BỒN (tháp nước 50% trong suốt — world/solar-buildings-road.js): nền theo mùa Gia Lai (mưa tháng 5–10, khô 11–4) 55% ± 33%, cao nhất ~15/9,
        //  thấp nhất ~15/3; trong ngày bơm lên +5% tới 16:30, chiều tối – đêm dùng nước tụt về −5% lúc 8:00 ----
        const waterPump = (() => {
          const P0 = new THREE.Vector3(X0 + 66, 0, Z0 + 58); P0.y = cowY(P0.x, P0.z);
          const silo = scene.getObjectByName('Bồn chứa nước (Water Silo)'), SS = silo.scale.x;
          const g = new THREE.Group(); g.name = 'Trạm bơm nước (Water Pump)'; g.position.copy(P0); scene.add(g);
          const steel = new THREE.MeshLambertMaterial({ color: 0x4b5157 }), pipeM = new THREE.MeshLambertMaterial({ color: 0x3a6f9a }), dark = new THREE.MeshLambertMaterial({ color: 0x23282c });
          const add = (m, x, y, z, par = g) => { m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
          const B = (w, h, d, mat, x, y, z, par) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat), x, y, z, par);
          // ---- bệ bê-tông + khung thép (2 thanh U dọc, 3 thanh ngang) · gốc mẫu bơm = mặt trên khung (Y_B) ----
          const Y_B = 0.22, RP = 0.0375, A = { inX: [0.3192, 0.1821, 0.36], outX: [-0.3082, 0.2961, 0.4029], len: 1.7751 };   // điểm neo mẫu (tools/pump/README.md) — đọc lại từ extras khi nạp
          B(1.05, 0.18, 2.3, concreteMat, 0, 0.05, 0);
          for (const s of [-1, 1]) B(0.07, 0.08, 2.0, steel, s * 0.24, 0.18, 0);
          for (const z of [-0.75, 0, 0.75]) B(0.55, 0.06, 0.07, steel, 0, 0.17, z);
          for (const z of [0.2, 0.58]) B(0.42, 0.08, 0.1, steel, 0, Y_B + 0.04, z);   // bệ kê 2 chân vỏ bơm (đáy vỏ cao hơn khung 8 cm)
          obstacleCoords.push({ x: P0.x, y: P0.y, z: P0.z, r: 1.15, h: 0.9 });
          // ---- ống: TubeGeometry theo chuỗi điểm, góc bo cong (bán kính ≤ 0,28, ≤ nửa 2 đoạn kề) · mặt bích · gối đỡ — gom 1 nhóm, gộp lưới theo vật liệu ----
          const pg = new THREE.Group(); pg.name = 'Đường ống nước (Water Pipeline)';
          const put = (o, p) => { if (p) o.position.copy(p); o.castShadow = o.receiveShadow = true; pg.add(o); return o; };
          function run(pts, r = RP, mat = pipeM) {   // pts: điểm thế giới → 1 lưới ống
            const path = new THREE.CurvePath(); let cur = pts[0];
            for (let i = 1; i < pts.length - 1; i++) {
              const p = pts[i], la = p.distanceTo(pts[i - 1]), lb = p.distanceTo(pts[i + 1]), rr = Math.min(0.28, la / 2, lb / 2);
              const a = p.clone().lerp(pts[i - 1], rr / la), b = p.clone().lerp(pts[i + 1], rr / lb);
              if (cur.distanceTo(a) > 1e-4) path.add(new THREE.LineCurve3(cur, a));
              path.add(new THREE.QuadraticBezierCurve3(a, p, b)); cur = b;
            }
            path.add(new THREE.LineCurve3(cur, pts[pts.length - 1]));
            put(new THREE.Mesh(new THREE.TubeGeometry(path, Math.max(8, Math.round(path.getLength() * 6)), r, 10, false), mat));
            return path;
          }
          const _pY = new THREE.Vector3(), _pD = new THREE.Vector3();
          const ring = (p, dir, r = RP + 0.03, h = 0.035, mat = steel, r2 = r) => { const o = put(new THREE.Mesh(new THREE.CylinderGeometry(r2, r, h, 12), mat), p); o.quaternion.setFromUnitVectors(_pY.set(0, 1, 0), dir); return o; };
          const reducer = (p, dir) => ring(p.clone().addScaledVector(dir, 0.06), dir, 0.08, 0.12, steel, RP + 0.004);   // côn thu: mặt bích họng bơm (r 0,08) → ống DN75
          const W = (x, y, z) => new THREE.Vector3(P0.x + x, P0.y + y, P0.z + z);   // điểm theo gốc trạm
          // ---- ống hút: họng +X → ngang ra mép hồ → chúc 45° xuống nước → rọ hút ----
          const ws = waterSurfaceY(P0.x + 1.6, P0.z + A.inX[2]), hin = W(A.inX[0], Y_B + A.inX[1], A.inX[2]);
          const s1 = W(1.1, Y_B + A.inX[1], A.inX[2]), dz = Math.max(0.3, s1.y - (ws - 0.5)), s2 = new THREE.Vector3(s1.x + dz, ws - 0.5, s1.z), s3 = s2.clone().add(_pD.set(0.3, 0, 0));
          run([hin, s1, s2, s3]); reducer(hin, new THREE.Vector3(1, 0, 0));
          put(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 12), dark), s3.clone().add(_pD.set(0.11, 0, 0))).rotation.z = Math.PI / 2;   // rọ hút (ngập nước)
          B(0.3, s1.y - P0.y - RP, 0.3, concreteMat, 0.95, (s1.y - P0.y - RP) / 2, A.inX[2]);   // gối đỡ ống hút ở mép bờ
          // ---- họng đẩy −X → côn thu → van tay → cắm xuống đất · trồi lên cạnh tháp → chữ T vào ống đứng (đoạn ngầm không vẽ) ----
          const d0 = W(A.outX[0], Y_B + A.outX[1], A.outX[2]), vX = d0.x - 0.32, d1 = new THREE.Vector3(d0.x - 0.82, d0.y, d0.z), gD = cowY(d1.x, d1.z);   // tâm van cách họng 0,32
          // ỐNG LÊN ĐỈNH BỒN (G 22/10 "cho đường ống nước đưa lên đỉnh water tank, vậy nó mới logic"): bồn tháp cấp nước bằng trọng lực ⇒ nước bơm vào từ TRÊN (ống
          //  đứng giữa tháp là ống xả xuống). Trồi lên ngoài ban công (r RD + 0,15 hướng +X, ngoài lan can, xa thang 45° và thước đo −20°), dựng thẳng qua mép mái,
          //  cút 90° ngang trên mái nón, cút xuống cắm vào mái ở r 0,55 (cách ống thông hơi đỉnh); bích ở cửa vào, 2 đai ôm: mép ban công + đai bồn
          const T = silo.position, SD = silo.userData.dims, W2 = (x, y, z) => new THREE.Vector3(T.x + x * SS, T.y + y * SS, T.z + z * SS);
          const xL = SD.RD + 0.15, xU = T.x + xL * SS, gU = cowY(xU, T.z), yH = SD.yTop + 0.62, rIn = 0.55;   // chỗ trồi lên · độ cao ống ngang trên mái
          const pump = run([d0, d1, new THREE.Vector3(d1.x, gD - 0.3, d1.z), new THREE.Vector3(d1.x - 0.5, gD - 0.3, d1.z)]);
          const tower = run([new THREE.Vector3(xU + 0.5, gU - 0.3, T.z), new THREE.Vector3(xU, gU - 0.3, T.z), W2(xL, yH, 0), W2(rIn, yH, 0), W2(rIn, SD.roofY(rIn) - 0.02, 0)]);
          for (const [x, z, gy] of [[d1.x, d1.z, gD], [xU, T.z, gU]]) put(new THREE.Mesh(new THREE.CylinderGeometry(RP + 0.05, RP + 0.08, 0.08, 14), concreteMat), _pD.set(x, gy + 0.015, z));   // vòng bê-tông chỗ ống chui xuống / trồi lên
          ring(W2(rIn, SD.roofY(rIn) + 0.02, 0), _pY.set(0, 1, 0), RP + 0.035, 0.04);   // bích cửa vào trên mái
          for (const [y, r0] of [[SD.TH + 0.06, SD.RD], [SD.yTop - 0.35, SD.R + 0.03]]) { const a = W2(r0, y, 0), b = W2(xL, y, 0); const m = put(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, a.distanceTo(b), 5), steel), a.clone().lerp(b, 0.5)); m.rotation.z = Math.PI / 2; ring(b, _pY.set(0, 1, 0), RP + 0.012, 0.035); }   // đai ôm ống: thanh ngang về mép ban công / thành bồn
          // ---- ĐOẠN NGẦM (G 21/10 "cho đoạn voxel quanh ống nước ngầm transparent 50%"): sâu 0,3 m dưới mặt đất, nối 2 đoạn chui / trồi — từ chỗ ống chui xuống
          //  đi nam 1,4 m (né bệ bơm) rồi thẳng tây dọc hàng ô z = tháp nước (né gò 8,4 m phía bắc); bậc đất 6,6 → 7,2 thì ống đứng lên ngay trong ô cao (2 cút 90°).
          //  Ô đất có ống đi qua thành KHỐI ĐẤT TRONG SUỐT 50%: mặt trên + mặt bên lộ (cùng màu ô) vẽ lại bằng vật liệu mờ, bản đặc thu về 0; trong khối là RÃNH
          //  cắt: tường đất 2 bên + đáy ngay dưới ống (vẫn đặc) ⇒ nhìn từ trên thấy ống xanh nằm trong rãnh, không thủng xuống khoảng trống dưới mặt đất.
          //  Dựng ở khung hình đầu (sau thảm cỏ nature/meadow.js: cỏ dọc dải cắt sát, màu ô đã tô) ----
          const deep = [new THREE.Vector3(d1.x - 0.5, 0, d1.z), new THREE.Vector3(d1.x - 0.5, 0, T.z), new THREE.Vector3(xU + 0.5, 0, T.z)], buried = [];
          { const cellY = (x, z) => surfaceY(Math.round(x2gi(x)), Math.round(z2gj(z))); let y = cellY(deep[0].x, deep[0].z) - 0.3; buried.push(deep[0].clone().setY(y));
            for (let k = 1; k < deep.length; k++) { const a = deep[k - 1], b = deep[k], L = a.distanceTo(b), n = Math.ceil(L / 0.05);
              for (let q = 1; q <= n; q++) { const x = a.x + (b.x - a.x) * q / n, z = a.z + (b.z - a.z) * q / n, yn = cellY(x, z) - 0.3; if (Math.abs(yn - y) < 0.01) continue;
                const u = (q - 0.5) / n, up = yn > y, w = up ? Math.min(1, u + 0.3 / L) : Math.max(0, u - 0.3 / L);   // ống đứng nằm trong ô CAO hơn, cách ranh ô 0,3 (giữa ô)
                const r = new THREE.Vector3(a.x + (b.x - a.x) * w, y, a.z + (b.z - a.z) * w); buried.push(r, r.clone().setY(yn)); y = yn; }
              buried.push(b.clone().setY(y)); } }
          const under = run(buried);
          const main = { pump, under, tower };
          reducer(d0, new THREE.Vector3(-1, 0, 0)); scene.add(bakeStatic(pg)); bakeStatic(g);
          const ditch = { done: false, cells: 0 };
          function ditchBuild() {   // dải ô trong suốt + rãnh — 1 lần, khung hình đầu
            ditch.done = true;
            const line = [new THREE.Vector3(d1.x, 0, d1.z), ...deep, new THREE.Vector3(xU, 0, T.z)], keys = new Map();   // cả đoạn chui xuống / trồi lên
            const segD = (x, z, a, b) => { const dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz, u = l2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2)) : 0; return Math.hypot(x - a.x - dx * u, z - a.z - dz * u); };
            for (let k = 1; k < line.length; k++) { const a = line[k - 1], b = line[k];
              for (let i = Math.floor(x2gi(Math.min(a.x, b.x) - 0.6)); i <= Math.ceil(x2gi(Math.max(a.x, b.x) + 0.6)); i++) for (let j = Math.floor(z2gj(Math.min(a.z, b.z) - 0.6)); j <= Math.ceil(z2gj(Math.max(a.z, b.z) + 0.6)); j++)
                if (i >= 0 && j >= 0 && i < GX && j < GZ && !isWater(i, j) && segD(wx(i), wz(j), a, b) < 0.42) keys.set(i + j * GX, { i, j, s: surfaceY(i, j), fl: Infinity }); }
            for (const c of keys.values()) { const x = wx(c.i), z = wz(c.j);   // đáy rãnh: dưới điểm ống thấp nhất trong ô 0,1 m
              for (let k = 1; k < buried.length; k++) { const a = buried[k - 1], b = buried[k]; if (Math.max(Math.abs(x - a.x), Math.abs(x - b.x)) > 0.3 + Math.abs(a.x - b.x) || Math.max(Math.abs(z - a.z), Math.abs(z - b.z)) > 0.3 + Math.abs(a.z - b.z)) continue;
                for (let q = 0, n = Math.max(8, Math.ceil(a.distanceTo(b) / 0.1)); q <= n; q++) { const px = a.x + (b.x - a.x) * q / n, pz = a.z + (b.z - a.z) * q / n; if (Math.abs(px - x) <= 0.3 && Math.abs(pz - z) <= 0.3) c.fl = Math.min(c.fl, a.y + (b.y - a.y) * q / n - RP - 0.1); } }
              if (!isFinite(c.fl)) c.fl = c.s - 0.45; }
            for (const c of keys.values()) for (let u = -0.2; u <= 0.21; u += 0.2) meadow.cutAt(wx(c.i) + u, wz(c.j), 0.3);   // cỏ dọc dải cắt sát (cả màu đất ô "vừa phát")
            // bản đặc: thu các mặt khối đỉnh của ô trong dải về 0, giữ màu ô cho bản mờ
            const TMs = terrainMeshes.filter(im => im.isInstancedMesh && im.instanceColor && (im.material === grassMat || im.material === shoreMat)), _m = new THREE.Matrix4(), _p = new THREE.Vector3(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
            for (const im of TMs) { let hit = false; for (let k = 0; k < im.count; k++) { im.getMatrixAt(k, _m); _p.setFromMatrixPosition(_m); const c = keys.get(Math.round(x2gi(_p.x)) + Math.round(z2gj(_p.z)) * GX);
              if (!c || Math.abs(_p.y - (c.s - BLOCK / 2)) > 0.05) continue; if (!c.col) { c.col = new THREE.Color(); im.getColorAt(k, c.col); } im.setMatrixAt(k, Z); hit = true; } if (hit) im.instanceMatrix.needsUpdate = true; }
            const see = [], wall = [], M = () => new THREE.Matrix4(), _s = new THREE.Matrix4();
            const face = (L, x, yc, z, h, f, col) => { if (h > 0.005) L.push([M().makeTranslation(x, yc, z).multiply(_s.makeScale(1, h / BLOCK, 1)).multiply(FACE_R[f]), col]); };
            const NB = [[1, 0, 0, 1], [-1, 0, 1, 0], [0, 1, 4, 5], [0, -1, 5, 4]];   // (di, dj, mặt của ô mình hướng sang, mặt ô bên hướng về mình)
            for (const c of keys.values()) { const x = wx(c.i), z = wz(c.j), col = c.col || new THREE.Color(0x4a842e);
              see.push([M().makeTranslation(x, c.s - BLOCK / 2, z).multiply(FACE_R[2]), col]);   // mặt trên mờ
              face(wall, x, c.fl - BLOCK / 2, z, BLOCK, 2, null);   // đáy rãnh = mặt trên của khối dưới đáy
              for (const [di, dj, fMine, fNb] of NB) { const ni = c.i + di, nj = c.j + dj; if (isWater(ni, nj)) continue; const n = keys.get(ni + nj * GX), ns = surfaceY(ni, nj), nx = wx(ni), nz = wz(nj);
                if (ns < c.s) face(see, x, (c.s + Math.max(ns, c.fl)) / 2, z, c.s - Math.max(ns, c.fl), fMine, col);   // mặt bên lộ (ô bên thấp hơn) — mờ
                const top = n ? n.fl : Math.min(ns, c.s); if (top > c.fl) face(wall, nx, (top + c.fl) / 2, nz, top - c.fl, fNb, null);   // tường đất ô bên (cắt) quay vào rãnh
                const lo = Math.max(ns, c.s - BLOCK); if (!n && lo < c.fl) face(wall, x, (lo + c.fl) / 2, z, c.fl - lo, fMine, null); } }   // ô bên thấp hơn đáy rãnh: phần khối đỉnh dưới đáy (dưới nữa là thân cột đất sẵn có)
            const mk = (L, mat, name) => { const im = new THREE.InstancedMesh(flatTopGeo, mat, L.length); L.forEach(([m, col], k) => { im.setMatrixAt(k, m); if (col) im.setColorAt(k, col); });
              im.name = name; im.castShadow = false; im.receiveShadow = true; im.userData.noBatch = im.userData.noBake = im.userData.noCollide = true; im.computeBoundingSphere(); scene.add(im); return im; };
            const seeM = new THREE.MeshLambertMaterial({ map: grassMat.map, transparent: true, opacity: 0.5, depthWrite: false }); wetMats.push([seeM, seeM.color.clone()]);
            const ditchM = new THREE.MeshLambertMaterial({ map: dirtMat.map, color: 0x8f8072 }); wetMats.push([ditchM, ditchM.color.clone()]);
            const glass = mk(see, seeM, 'Đất trong suốt trên ống ngầm'); glass.renderOrder = 1; terrainMeshes.push(glass);   // tia rê chuột / toạ độ vẫn chạm mặt đất ở dải này
            mk(wall, ditchM, 'Rãnh ống ngầm (tường + đáy)');
            ditch.cells = keys.size;
          }
          // ---- mẫu GLB: bơm + van; đèn báo chạy trên hộp động cơ ----
          const P = { pump: null, valve: null, lamp: null, on: false, L: 0.6, t: 0 };
          const lampM = new THREE.MeshBasicMaterial({ color: 0x1d3a22 });
          const PUMP_GLB = window.__pumpGlb || 'https://michaeltran75.github.io/3d-garden/models/pump.glb';
          Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
            .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(PUMP_GLB)).then(gl => {
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
              gl.scene.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = o.receiveShadow = true; } });
              const pump = gl.scene.getObjectByName('pump'), valve = gl.scene.getObjectByName('valve'), X = pump.userData;
              pump.position.set(0, Y_B, 0); g.add(pump); P.pump = pump;
              const vs = 0.1 / valve.userData.half; valve.scale.setScalar(vs); valve.position.set(vX - P0.x, d0.y - P0.y - (valve.userData.bodyY || 0) * vs, d0.z - P0.z); g.add(valve); P.valve = valve;   // tâm thân van trùng tâm ống
              g.updateMatrixWorld(true); const lz = (X.motorZ ? X.motorZ[1] : -0.21) - 0.12, rc = new THREE.Raycaster(_pY.set(P0.x + 0.1, P0.y + 2, P0.z + lz), _pD.set(0, -1, 0)), hit = rc.intersectObject(pump, true)[0];   // đèn báo: chiếu tia xuống nóc hộp động cơ
              P.lamp = add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), lampM), 0.1, (hit ? hit.point.y - P0.y : Y_B + 0.45) + 0.02, lz);
              if (Math.hypot(X.outX[0] - A.outX[0], X.outX[1] - A.outX[1], X.outX[2] - A.outX[2]) > 0.01) console.warn('pump.glb: điểm neo họng bơm đã đổi — cập nhật A trong world/water-pump.js');
            }).catch(err => console.warn('Pump GLB:', err));
          // ---- mực bồn theo mùa + nhịp ngày; bơm chạy theo nắng ----
          function level() {
            const d = new Date(), doy = (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5, hh = liveWeather.localHour;
            const day = hh >= 8 && hh < 16.5 ? -1 + 2 * (hh - 8) / 8.5 : 1 - 2 * ((hh - 16.5 + 24) % 24) / 15.5;
            return Math.max(0.06, Math.min(0.95, 0.55 + 0.33 * Math.cos(TAU * (doy - 258) / 365.25) + 0.05 * day));
          }
          function tick(dt, t) {   // mỗi khung (loop/main-loop-rest.js): mực bồn 1 lần / 2 s · rung + đèn khi bơm chạy
            if (!ditch.done && dt > 0) ditchBuild();
            if (t - P.t > 2) { P.t = t; P.L = level(); silo.userData.level(P.L); const hh = liveWeather.localHour; P.on = hh >= 8 && hh < 16.5 && sunElevSin > 0.02 && P.L < 0.95; lampM.color.setHex(P.on ? 0x3cff6a : 0x1d3a22); }
            if (P.pump) { const a = P.on ? 0.0015 : 0; P.pump.position.set(a * Math.sin(t * 157), Y_B + a * Math.sin(t * 211), 0); }
          }
          tick(0, 9);
          return { g, tick, level, state: P, pipe: main, ditch };
        })();
