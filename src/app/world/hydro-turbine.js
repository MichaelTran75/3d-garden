        // ===== TỔ MÁY THỦY ĐIỆN TRONG NHÀ MÁY ĐẬP (G 31/10 tối "research + study: đặt turbine vào đập nước, simulate cách turbine chạy; chỗ building structure để
        //  turbine: làm cho vùng đó 75% transparent"). Mẫu "Hydrogenerator | Old work" — TadenStar (Sketchfab), CC BY 4.0: tổ máy FRANCIS TRỤC ĐỨNG, máy phát kiểu
        //  Ô (ổ đỡ chặn dưới rotor): bánh xe công tác 15 cánh Ø 5,86 m, 18 cánh hướng nước (bước 20°, trục xoay r 3,64 m), rotor 54 cực ⇒ 50 Hz: n = 120·50/54 =
        //  111,1 vòng/phút; cao 19 m, stator Ø 15,4 m. Mẫu gốc 20,6 MB (2 bản: cắt nửa + lắp đủ, 29 ảnh PNG) ⇒ src/tools/turbine/ (Blender: chỉ bản lắp đủ, bỏ nắp mặt
        //  cắt + cuộn dây trùng, 1 cánh hướng nước mẫu, giảm lưới, màu ảnh → màu đỉnh; turbinepack.py: lượng tử hoá, không pháp tuyến ⇒ models/turbine.glb 232 KB → nén meshopt 84 KB (src/tools/glb-compress, 04/11)).
        //  Đặt: tâm trục giữa khoang nhà máy, tỉ lệ 0,2914 (Ø 4,5 vừa gian máy 4,9 × 5,0; sàn máy phát = sàn gian máy 4,14; bánh xe dưới mặt nước hạ lưu 3,0).
        //  Phần mẫu không có ⇒ dựng thêm: ỐNG ÁP LỰC (miệng loe ở lưới chắn rác → tròn), BUỒNG XOẮN nửa vòng xoắn ốc (vào tiếp tuyến phía +x, nước xoáy CÙNG
        //  chiều quay: nhìn từ trên xuống thuận chiều kim đồng hồ — đúng chiều cánh hướng nước + cánh bánh xe của mẫu), ỐNG HÚT côn → khuỷu → loe rộng dâng lên 2 cửa
        //  chìm dưới nước hạ lưu (world/hydro-dam.js).
        //  XEM XUYÊN: vỏ nhà máy mờ 25% (world/hydro-dam.js); đất / đáy sông / mặt nước trong khối nhà máy bỏ, thay vách đất + đáy hố; vỏ máy phát + tua-bin bị
        //  MẶT CẮT ĐỨNG qua trục, luôn quay theo camera (bỏ nửa phía người xem) ⇒ thấy rotor, trục, bánh xe công tác quay bên trong; ống dẫn nước mờ, hạt nước chảy.
        //  MÔ PHỎNG (nghiên cứu: USBR EM-20, ESHA small hydro guide, mô hình HYGOV / Kundur; số liệu 1 đơn vị tương đối, đầu nước 3,48 m, Qđm 5,5 m³/s, Pđm ≈ 157 kW
        //  — cỡ cách điệu theo đập trong cảnh):
        //   servo cánh hướng ≤ 10%/s · cột nước h = (q/a)², dq/dt = (1 − h)/Tw (Tw 1,5 s — mở cánh thì công suất hụt trước rồi mới lên) · mô-men tua-bin
        //   q(1,885√h − 0,805ω), tổn hao 0,08ω² + 0,005 · rotor dω/dt = (Mt − Mtổn − Mphanh)/Tm (Tm 5,6 s) · khởi động: mở 18% → 90% tốc độ thì điều tốc PI giữ
        //   tốc độ không tải (cánh ~7%), kích từ ở 95% → hoà lưới khi lệch < 1% trong 1,5 s → nhận tải 2%/s tới mức nước cho phép (mùa khô / mưa như trạm
        //   bơm + cống) → dừng khi nước < 35% Qđm: giảm tải, cắt máy, đóng cánh, chạy đà, phanh ở 20% tốc độ.
        //   Quay hiển thị CHẬM ×0,15 (16,7 vòng/phút) và ≤ 1,6°/khung: 54 cực bước 6,7° — quay nhanh hơn ¼ bước mỗi khung là mắt thấy quay ngược / đứng (hiệu ứng bánh xe).
        //  Bấm nhà máy ⇒ camera tới gần + bảng số; bấm lần nữa khi đang xem ⇒ dừng / khởi động lại tổ máy (xem cả chu trình) ----
        const hydroTurbine = (() => {
          if (!damPH) return null;
          const { g: damG, ph, xa, xb, xm, zAx, faceZ, subTop, outY, outZ, outX, z0: phZ0, z1: phZ1 } = damPH;
          const HT_GLB = window.__turbineGlb || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'models/turbine.glb' : 'https://michaeltran75.github.io/3d-garden/models/turbine.glb');   // G 03/11: mở tệp (file://) thì trình duyệt chặn fetch tệp cục bộ ⇒ lấy bản Pages như các mẫu khác
          const SC = 0.29136, Y0 = 1.6, YS = 2.745;   // mét thật → cảnh · đáy cụm (miệng côn ống hút) · tâm buồng xoắn = giữa chiều cao cánh hướng nước
          const RPM = 3000 / 27, QR = 5.5, HG = 3.48, PR = 157, SLOW = 0.15;
          const U = new THREE.Group(); U.name = 'Tổ máy thủy điện (Hydro Turbine)'; U.position.set(xm, 0, zAx); damG.add(U);
          U.userData.noBake = U.userData.noBatch = U.userData.noCollide = U.userData.noFlight = U.userData.noRainOcc = true;
          const M = new THREE.Group(); M.position.y = Y0; M.scale.setScalar(SC); U.add(M);   // hệ mẫu (mét thật), trục = (0, y, 0)
          // ---- mặt cắt quay theo camera: bỏ nửa vỏ phía người xem ----
          const clip = new THREE.Plane(), _cA = new THREE.Vector3(), _cD = new THREE.Vector3();
          renderer.localClippingEnabled = true;
          const bodyM = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide, clippingPlanes: [clip] });
          const rotorM = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
          // ---- ống dẫn nước (cục bộ đập): quét mặt cắt elip theo đường tâm ----
          const pipeM = new THREE.MeshLambertMaterial({ color: 0x8fa9bd, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z), UP = V3(0, 1, 0);
          function sweep(st, n = 18) {   // st: [{p, rx (ngang), ry (dọc)}] dày; mặt cắt vuông góc đường tâm
            const P = [], I = [], T = new THREE.Vector3(), Sd = new THREE.Vector3(), B = new THREE.Vector3();
            st.forEach((s, k) => {
              T.subVectors(st[Math.min(st.length - 1, k + 1)].p, st[Math.max(0, k - 1)].p).normalize();
              Sd.crossVectors(T, UP); if (Sd.lengthSq() < 1e-4) Sd.set(1, 0, 0); Sd.normalize(); B.crossVectors(Sd, T).normalize();
              for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; P.push(s.p.x + Sd.x * s.rx * Math.cos(a) + B.x * s.ry * Math.sin(a), s.p.y + Sd.y * s.rx * Math.cos(a) + B.y * s.ry * Math.sin(a), s.p.z + Sd.z * s.rx * Math.cos(a) + B.z * s.ry * Math.sin(a)); }
              if (k) for (let i = 0; i < n; i++) { const a = (k - 1) * n + i, b = (k - 1) * n + (i + 1) % n; I.push(a, b, a + n, b, b + n, a + n); }
            });
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
          }
          function spline(ctrl, n) {   // điểm điều khiển {p, rx, ry} → n trạm (Catmull-Rom vị trí, nội suy bán kính theo độ dài)
            const c = new THREE.CatmullRomCurve3(ctrl.map(q => q.p), false, 'centripetal'), L = [0]; for (let k = 1; k < ctrl.length; k++) L.push(L[k - 1] + ctrl[k].p.distanceTo(ctrl[k - 1].p));
            return Array.from({ length: n }, (_, k) => { const u = k / (n - 1), d = u * L[L.length - 1]; let j = 1; while (j < L.length - 1 && L[j] < d) j++;
              const f = (d - L[j - 1]) / Math.max(1e-6, L[j] - L[j - 1]); return { p: c.getPointAt(u), rx: ctrl[j - 1].rx + (ctrl[j].rx - ctrl[j - 1].rx) * f, ry: ctrl[j - 1].ry + (ctrl[j].ry - ctrl[j - 1].ry) * f }; });
          }
          const RS = 1.24, A0 = 0.65;   // bán kính vòng cánh tĩnh (mép ngoài cánh hướng nước 1,19) · bán kính miệng buồng xoắn
          const spA = th => A0 * Math.sqrt(Math.max(0.01, 1 - th / (Math.PI * 2) * 0.97));   // tiết diện giảm đều theo lưu lượng còn lại
          const spP = th => { const a = spA(th), r = RS + a; return { p: V3(xm + r * Math.cos(th), YS, zAx + r * Math.sin(th)), rx: a, ry: Math.min(a, 0.12 + 0.8 * a) }; };
          const xIn = xm + RS + A0;   // ống áp lực vào buồng xoắn tiếp tuyến phía +x, chảy theo +z
          const penCtrl = [{ p: V3(xm, 3.9, phZ0 - 0.02), rx: 1.9, ry: 1.7 }, { p: V3(xm + 0.45, 3.35, phZ0 + 1.1), rx: 1.15, ry: 1.0 }, { p: V3(xIn - 0.15, 2.85, faceZ - 0.6), rx: 0.75, ry: 0.72 },
            { p: V3(xIn, YS, faceZ + 0.6), rx: 0.66, ry: 0.66 }, { p: V3(xIn, YS, zAx - 0.02), rx: 0.65, ry: 0.65 }];
          const SPN = 56, spSt = Array.from({ length: SPN + 1 }, (_, k) => spP(k / SPN * Math.PI * 2 * 0.96));
          const pen = new THREE.Mesh(sweep([...spline(penCtrl, 22), ...spSt]), pipeM); pen.name = 'Ống áp lực + buồng xoắn (Penstock + Spiral Case)';
          // ống hút: côn (dưới bánh xe) → khuỷu 90° dẹt dần → đoạn loe ngang dâng lên → chia đôi bởi trụ giữa → 2 cửa chìm
          const dtCtrl = [{ p: V3(xm, Y0 + 0.02, zAx), rx: 0.9, ry: 0.9 }, { p: V3(xm, 1.12, zAx), rx: 0.95, ry: 0.95 }, { p: V3(xm, 0.72, zAx + 0.3), rx: 1.05, ry: 0.75 },
            { p: V3(xm, 0.6, zAx + 0.85), rx: 1.2, ry: 0.55 }, { p: V3(xm, 0.85, zAx + 1.75), rx: 1.55, ry: 0.5 }];
          const dtSt = spline(dtCtrl, 20), dtEnd = dtSt[dtSt.length - 1];
          const dt = new THREE.Mesh(sweep(dtSt), pipeM); dt.name = 'Ống hút (Draft Tube)';
          const bores = [-1, 1].map(sx => { const s = spline([{ p: V3(xm + sx * 0.62, dtEnd.p.y, dtEnd.p.z - 0.05), rx: 0.78, ry: 0.5 }, { p: V3(xm + sx * 1.0, 1.35, (dtEnd.p.z + outZ) / 2), rx: 0.82, ry: 0.5 },
            { p: V3(xm + sx * outX, outY, outZ - 0.02), rx: 0.84, ry: 0.49 }], 12); const m = new THREE.Mesh(sweep(s), pipeM); m.name = 'Ống hút: nhánh cửa xả'; return { m, s }; });
          for (const m of [pen, dt, ...bores.map(b => b.m)]) { m.renderOrder = 2; m.castShadow = false; m.raycast = () => {}; U.parent.add(m); m.position.set(0, 0, 0); }
          // ---- hạt nước theo đường dòng: lưới chắn rác → ống áp lực → buồng xoắn (ra ở góc θe) → cánh hướng → bánh xe (xoáy xuống) → ống hút → 1 trong 2 cửa ----
          const NV = 24, paths = [];
          for (let v = 0; v < NV; v++) {
            const th = (0.12 + 0.82 * ((v * 7) % NV) / NV) * Math.PI * 2, sx = v % 2 ? 1 : -1, pts = [];
            for (const s of spline(penCtrl, 22)) pts.push([s.p, s.rx]);
            for (let k = 0; k <= SPN && k / SPN * Math.PI * 2 * 0.96 <= th; k++) { const q = spP(k / SPN * Math.PI * 2 * 0.96); pts.push([q.p, q.rx * 0.7]); }
            for (let k = 1; k <= 6; k++) { const f = k / 6, r = RS + spA(th) * (1 - f) - 0.45 * f, a = th + 0.5 * f; pts.push([V3(xm + r * Math.cos(a), YS - 0.05 * f, zAx + r * Math.sin(a)), 0.1]); }   // qua cánh hướng: vào trong + xoáy
            for (let k = 1; k <= 10; k++) { const f = k / 10, r = 0.79 - 0.38 * f, a = th + 0.5 + 1.6 * f; pts.push([V3(xm + r * Math.cos(a), YS - 0.1 - 1.05 * f, zAx + r * Math.sin(a)), 0.2]); }   // trong bánh xe: xoáy xuống
            const a1 = th + 2.1; pts.push([V3(xm + 0.4 * Math.cos(a1), Y0 - 0.05, zAx + 0.4 * Math.sin(a1)), 0.5]);
            for (const s of dtSt.slice(2)) pts.push([s.p.clone().add(V3(sx * s.rx * 0.35, 0, 0)), s.rx * 0.5]);
            for (const s of bores[sx > 0 ? 1 : 0].s) pts.push([s.p, s.rx * 0.6]);
            pts.push([V3(xm + sx * outX, outY + 0.25, outZ + 0.9), 0.7]);
            const L = [0]; for (let k = 1; k < pts.length; k++) L.push(L[k - 1] + pts[k][0].distanceTo(pts[k - 1][0]));
            paths.push({ pts, L, len: L[L.length - 1] });
          }
          const NP = 260, dropM = new THREE.MeshBasicMaterial({ color: 0x9fe0ff }), drops = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), dropM, NP);
          drops.name = 'Dòng nước trong tổ máy'; drops.frustumCulled = false; drops.raycast = () => {}; drops.userData.noBatch = drops.userData.noBake = true; damG.add(drops);
          const rnd = mulberry32(19021), P = Array.from({ length: NP }, (_, i) => ({ v: i % NV, s: rnd() * paths[i % NV].len, j: V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5), k: 0.85 + 0.3 * rnd() }));
          const _pA = new THREE.Vector3(), _pB = new THREE.Vector3(), _pM = new THREE.Matrix4(), _pQ = new THREE.Quaternion(), _pS = new THREE.Vector3(), _pX = V3(1, 0, 0);
          function dropsTick(dt, q) {
            for (let i = 0; i < NP; i++) {
              const d = P[i], pa = paths[d.v]; let j = 1; while (j < pa.L.length - 1 && pa.L[j] < d.s) j++;
              const r0 = pa.pts[j - 1][1], r1 = pa.pts[j][1], rr = Math.max(0.12, (r0 + r1) / 2);
              d.s += dt * q * d.k * Math.min(3.2, Math.max(0.5, 0.36 / (rr * rr))) * 1.1;   // vận tốc ∝ Q / tiết diện
              if (d.s >= pa.len) { d.s -= pa.len; d.v = (d.v + 5) % NV; continue; }
              const f = (d.s - pa.L[j - 1]) / Math.max(1e-6, pa.L[j] - pa.L[j - 1]);
              _pA.lerpVectors(pa.pts[j - 1][0], pa.pts[j][0], f); _pB.subVectors(pa.pts[j][0], pa.pts[j - 1][0]).normalize();
              _pA.addScaledVector(d.j, (r0 + (r1 - r0) * f) * 0.9);
              _pQ.setFromUnitVectors(_pX, _pB); const len = q > 0.01 ? 0.07 + 0.16 * Math.min(1.2, q) : 0.05;
              _pM.compose(_pA, _pQ, _pS.set(len, 0.032, 0.032)); drops.setMatrixAt(i, _pM);
            }
            drops.instanceMatrix.needsUpdate = true;
          }
          // ---- xem xuyên: bỏ đất / đáy sông / hoa cỏ / mặt nước trong khối nhà máy (ô có tâm trong khối), dựng vách đất + đáy hố ----
          const inPH = (x, z) => { const lx = x - damG.position.x, lz = z - damG.position.z; return lx > xa && lx < xb && lz > phZ0 && lz < phZ1; };
          const cut = { tops: 0, water: 0 };
          {
            const cells = new Set(), bedTop = new Map();
            const ims = scene.children.filter(o => o.isInstancedMesh && [grassMat, shoreMat, dirtMat, sandMat].includes(o.material));
            for (const im of [...new Set([...ims, ...terrainMeshes.filter(o => o.isInstancedMesh)])]) {
              const Ar = im.instanceMatrix.array; let hit = 0;
              for (let k = 0; k < im.count; k++) { const o = k * 16, x = Ar[o + 12], z = Ar[o + 14], i = Math.round(x2gi(x)), j = Math.round(z2gj(z));
                if (im.material === sandMat) { const top = Ar[o + 13] + 0.5 * Math.hypot(Ar[o + 4], Ar[o + 5], Ar[o + 6]) * BLOCK; bedTop.set(i + j * 9973, Math.max(bedTop.get(i + j * 9973) ?? -9, top)); }
                if (!inPH(x, z)) continue; cells.add(i + ',' + j); Ar.fill(0, o, o + 11); hit++; }   // thu về 1 điểm, giữ vị trí (cỏ / bảng tra theo ô vẫn đúng ô)
              if (hit) { im.instanceMatrix.needsUpdate = true; cut.tops += hit; }
            }
            const fm = ['stem', 'petal', 'fcen', 'fcube', 'blade'].map(k => vegPools[k] && vegPools[k].mat).filter(Boolean);
            for (const im of scene.children.filter(o => o.isInstancedMesh && fm.includes(o.material))) { const Ar = im.instanceMatrix.array; let hit = 0;
              for (let k = 0; k < im.count; k++) { const o = k * 16; if (inPH(Ar[o + 12], Ar[o + 14])) { Ar.fill(0, o, o + 11); hit++; } } if (hit) im.instanceMatrix.needsUpdate = true; }
            if (waterSurfMesh) {   // mặt nước: mỗi ô 1 tứ giác riêng ⇒ thu tứ giác có tâm trong khối về 1 điểm
              const pa = waterSurfMesh.geometry.attributes.position, A = pa.array;
              for (let q = 0; q < pa.count; q += 4) { const cx = (A[q * 3] + A[q * 3 + 9]) / 2, cz = (A[q * 3 + 2] + A[q * 3 + 11]) / 2;
                if (!inPH(cx, cz)) continue; for (let v = 1; v < 4; v++) { A[(q + v) * 3] = A[q * 3]; A[(q + v) * 3 + 1] = A[q * 3 + 1]; A[(q + v) * 3 + 2] = A[q * 3 + 2]; } cut.water++; }
              if (cut.water) pa.needsUpdate = true;
            }
            const wall = [], _s = new THREE.Matrix4(), Mx = () => new THREE.Matrix4();
            const face = (x, yc, z, h, f) => { if (h > 0.005) wall.push(Mx().makeTranslation(x, yc, z).multiply(_s.makeScale(1, h / BLOCK, 1)).multiply(FACE_R[f])); };
            const NB = [[1, 0, 1], [-1, 0, 0], [0, 1, 5], [0, -1, 4]];   // (di, dj, mặt của ô bên quay về phía hố)
            for (const key of cells) {
              const [i, j] = key.split(',').map(Number), x = wx(i), z = wz(j); face(x, -BLOCK / 2, z, BLOCK, 2);   // đáy hố (y = 0)
              for (const [di, dj, f] of NB) { const ni = i + di, nj = j + dj; if (cells.has(ni + ',' + nj)) continue;
                const top = isWater(ni, nj) ? (bedTop.get(ni + nj * 9973) ?? 0) : surfaceY(ni, nj); if (top > 0.01) face(wx(ni), top / 2, wz(nj), top, f); }
            }
            const wm = new THREE.MeshLambertMaterial({ map: dirtMat.map, color: 0x8f8072 }); if (typeof wetMats !== 'undefined') wetMats.push([wm, wm.color.clone()]);
            const im = new THREE.InstancedMesh(flatTopGeo, wm, Math.max(1, wall.length)); wall.forEach((m, k) => im.setMatrixAt(k, m)); im.count = wall.length;
            im.name = 'Vách đất quanh nhà máy (xem xuyên)'; im.receiveShadow = true; im.userData.noBatch = im.userData.noBake = im.userData.noCollide = im.userData.noFlight = true; im.computeBoundingSphere(); scene.add(im);
            cut.cells = cells.size; cut.walls = wall.length;
          }
          // ---- mô phỏng ----
          const S = { st: 'stopped', a: 0, aCmd: 0, q: 0, w: 0, P: 0, brk: false, exc: false, ig: 0, syncT: 0, hold: 4, qa: 0, rq: 0, want: true, ang: 0, vaneA: -1 };
          function avail(dt) {   // nước cho phép (đv tương đối Qđm): mùa (như trạm bơm) + mưa (trễ như cống thoát)
            const d = new Date(), doy = (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5;
            S.rq += ((typeof rainK === 'number' ? rainK : 0) - S.rq) * Math.min(1, dt / ((typeof rainK === 'number' ? rainK : 0) > S.rq ? 15 : 90));
            return S.qa = Math.min(1.15, 0.55 + 0.33 * Math.cos(Math.PI * 2 * (doy - 258) / 365.25) + 0.6 * S.rq);
          }
          function step(dt) {
            const qa = avail(dt), aT = Math.min(1, Math.max(0.35, qa));
            if (S.st === 'generating' && (qa < 0.35 || !S.want)) S.st = 'unloading';
            if (S.st === 'stopped' && S.want && qa > 0.45 && (S.hold -= dt) <= 0) { S.st = 'starting'; S.ig = 0; }
            if ((S.st === 'starting' || S.st === 'speedno' || S.st === 'loading') && !S.want) S.st = S.brkOn ? 'unloading' : 'stopping';
            switch (S.st) {
              case 'starting': S.aCmd = 0.18; if (S.w >= 0.9) S.st = 'speedno'; break;
              case 'speedno': { const e = 1 - S.w; S.ig = Math.max(-0.3, Math.min(0.3, S.ig + e * dt)); S.aCmd = Math.max(0, Math.min(0.3, 0.074 + 1.2 * e + 0.3 * S.ig)); S.exc = S.w > 0.95;
                S.syncT = Math.abs(e) < 0.01 ? S.syncT + dt : 0; if (S.syncT > 1.5) { S.brkOn = true; S.st = 'loading'; } break; }
              case 'loading': S.aCmd = Math.min(aT, S.aCmd + 0.02 * dt); if (S.aCmd >= aT - 1e-3) S.st = 'generating'; break;
              case 'generating': S.aCmd += Math.max(-0.01 * dt, Math.min(0.01 * dt, aT - S.aCmd)); break;
              case 'unloading': S.aCmd = Math.max(0.074, S.aCmd - 0.02 * dt); if (S.a <= 0.08) { S.brkOn = false; S.exc = false; S.st = 'stopping'; } break;
              case 'stopping': S.aCmd = 0; if (S.w < 0.2) S.st = 'braking'; break;
              case 'braking': S.aCmd = 0; if (S.w < 0.004) { S.w = 0; S.st = 'stopped'; S.hold = 6; } break;
              default: S.aCmd = 0;
            }
            S.a += Math.max(-0.1, Math.min(0.1, (S.aCmd - S.a) / 0.5)) * dt; S.a = Math.max(0, Math.min(1, S.a));
            let h = 0;
            if (S.a < 0.01) S.q += (0 - S.q) * Math.min(1, dt / 0.3); else { h = Math.min(2.5, (S.q / S.a) ** 2); S.q = Math.max(0, S.q + dt * (1 - h) / 1.5); }
            const Mt = S.q * (1.885 * Math.sqrt(h) - 0.805 * S.w), loss = 0.08 * S.w * S.w + (S.w > 0 ? 0.005 : 0), brake = S.st === 'braking' ? 0.04 : 0;
            if (S.brkOn) { S.w = 1; S.P = Math.max(0, Mt - loss); } else { S.w = Math.max(0, S.w + dt * (Mt - loss - brake) / 5.6); S.P = 0; }
            S.h = h;
          }
          // ---- nạp mẫu ----
          const parts = { rotor: null, vanes: null, VX: null, vm: [] };
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js'),   // mẫu nén EXT_meshopt_compression (src/tools/glb-compress, G 04/11)
            fetch(HT_GLB).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status))), ldGate]).then(([{ GLTFLoader }, { MeshoptDecoder }, buf]) => {
            new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(buf, '', gl => {
              const rotor = gl.scene.getObjectByName('rotor'), stat = gl.scene.getObjectByName('stat'), vane = gl.scene.getObjectByName('vane');
              rotor.traverse(o => { if (o.isMesh) o.material = rotorM; }); stat.traverse(o => { if (o.isMesh) o.material = bodyM; });
              for (const o of [rotor, stat]) { o.traverse(c => { c.castShadow = false; c.receiveShadow = false; c.raycast = () => {}; }); M.add(o); }
              const VX = vane.userData, vmesh = vane.children[0]; vmesh.updateMatrix(); const vg = vmesh.geometry.clone(); vg.applyMatrix4(vmesh.matrix);   // hệ trục xoay cánh (mét, y tuyệt đối)
              const vanes = new THREE.InstancedMesh(vg, bodyM, VX.n || 18); vanes.name = 'Cánh hướng nước (Wicket Gates)'; vanes.raycast = () => {}; M.add(vanes);
              Object.assign(parts, { rotor, vanes, VX }); S.vaneA = -1;
            });
          }).catch(err => console.warn('Turbine GLB:', err)));
          const _vM = new THREE.Matrix4(), _vR = new THREE.Matrix4(), _vT = new THREE.Matrix4();
          function vanesTick() {   // cánh mẫu ở độ mở lớn nhất (a = 1); đóng = xoay quanh trục cánh closeDeg theo chiều closeDir (hướng tiếp tuyến, khít cánh kề)
            const X = parts.VX; if (!parts.vanes || Math.abs(S.a - S.vaneA) < 0.002) return; S.vaneA = S.a;
            const d = -X.closeDir * X.closeDeg * (1 - S.a) * Math.PI / 180, r = X.r, a0 = X.a0 * Math.PI / 180;
            for (let k = 0; k < (X.n || 18); k++) {
              const ak = (X.pitch || 20) * k * Math.PI / 180;   // xoay cả cánh quanh trục máy (atan2(z, x) tăng ⇒ rotation.y âm)
              _vM.makeRotationY(-ak).multiply(_vT.makeTranslation(r * Math.cos(a0), 0, r * Math.sin(a0))).multiply(_vR.makeRotationY(d));
              parts.vanes.setMatrixAt(k, _vM);
            }
            parts.vanes.instanceMatrix.needsUpdate = true;
          }
          // ---- mỗi khung ----
          function tick(dt, t) {
            if (!(dt > 0)) return; dt = Math.min(dt, 0.1);
            for (let n = Math.ceil(dt / 0.02), k = 0; k < n; k++) step(dt / n);
            for (const j of tailJets) { if (j.x0 === undefined) j.x0 = j.sc; }
            for (let n = 12; n < tailJets.length; n++) tailJets[n].sc = tailJets[n].x0 * Math.min(1.2, S.q);   // bọt nước ở 2 cửa ống hút theo lưu lượng
            U.getWorldPosition(_cA); camera.getWorldDirection(_cD); _cD.y = 0; if (_cD.lengthSq() < 1e-6) _cD.set(0, 0, -1); _cD.normalize(); clip.setFromNormalAndCoplanarPoint(_cD, _cA);
            const near = camera.zoom > 5 && _cA.distanceTo(target) < 40 / Math.sqrt(camera.zoom / 5);
            if (parts.rotor) { const wv = S.w * RPM / 60 * Math.PI * 2 * SLOW; parts.rotor.rotation.y -= Math.min(0.028, wv * dt); vanesTick(); }
            if (near) dropsTick(dt, S.q); drops.visible = near;
          }
          function focus() { camFollow(U, 16, { off: V3(0, 4.2, 0) }); }
          function click() { if (CAMF.o === U && camera.zoom > 8) { S.want = !S.want; S.hold = 1; } else focus(); }
          return { g: U, ph, inPH, tick, click, focus, state: S, cut, parts, setRun: on => { S.want = on; S.hold = 0.5; } };
        })();
