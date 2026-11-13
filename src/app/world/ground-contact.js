        // ===== BÓNG TIẾP ĐẤT (như gốc cây chết:
        //  1 chút lún + 1 chút shadow line) — DỊCH VỤ 'groundContact': vật tự xin ở tệp của nó, worldJoin('groundContact', thứ tự, S => S.add(gốc, tuỳ chọn))
        //  · Chờ mẫu 3D tải xong (ldGate + ldTrack, tối đa 8 s) rồi CẮT LÁT lưới của vật ở 2 mặt phẳng ngang sát đất (+3 cm, +10 cm) → đường viền chân vật
        //    (thân cây, chân cột, chân tường, vỏ lốp chạm đất); mặt gần nằm ngang sát đất thì tô cả mặt
        //  · Biến đổi khoảng cách (chamfer) → ảnh độ mờ: đường bóng sát chân (đậm, tắt sau ~6 cm) + bóng mờ quanh chân (tắt sau w) + tuỳ chọn body:
        //    bóng gầm (chiếu mọi mặt dưới độ cao body xuống đất, mờ rộng 0,5 m — gầm xe van)
        //  · Tấm phủ rải lưới ô theo mặt đất thật (cowY + 1,5 cm), ô lệch bậc voxel > 0,3 m so với chân vật thì trong suốt (không lơ lửng trên bậc thấp)
        //  · Tuỳ chọn: { w: 0,35 bề rộng bóng mờ (m), line: 0,6 độ đậm đường sát chân, ao: 0,35 độ đậm bóng mờ, body: 0 (m, 0 = không), bodyA: 0,4,
        //    y: cao độ chân (mặc định cowY tại gốc), inst: false (gồm InstancedMesh — cánh hoa rụng thì không) }
        //  · S.drape({ px, NX, NZ, ps, x0, x1, z0, z1, g0, name }): chỉ rải 1 ảnh độ mờ có sẵn thành tấm phủ (bóng góc mặt đất khu trại — camp/realism.js)
        //  · Lưới vỏ cây bỏ mảng đỉnh sau khi lên GPU (core/mem-trim.js) ⇒ memTrim chờ idle() (hàng đợi đã cắt xong); vật xin sau đó: lưới mất mảng bị bỏ qua
        //    (đếm ở made[].miss), 1 vật lỗi không chặn các vật sau
        //  · Cây cổ thụ + rễ THÔI dùng dịch vụ này: quầng mờ đều quanh rễ nhìn giả ⇒ bóng trời dưới tán + bóng góc kẽ rễ (core/sky-shade.js, nature/old-tree-shade.js)
        const groundContact = (() => {
          const Q = [], made = []; let ready = false, miss = 0;
          const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _bx = new THREE.Box3(), _im = new THREE.Matrix4(), _wm = new THREE.Matrix4();
          function triangles(roots, yMax, inst, each) {   // mọi tam giác (toạ độ thế giới) của lưới hiện có đáy ≤ yMax
            for (const R of roots) { R.updateMatrixWorld(true); R.traverseVisible(m => {
              if (!m.isMesh || !m.geometry || !m.geometry.attributes.position || (m.isInstancedMesh && !inst)) return;
              const G = m.geometry; if (!G.boundingBox) G.computeBoundingBox();
              const P = G.attributes.position, I = G.index, nI = m.isInstancedMesh ? m.count : 1, nT = I ? I.count / 3 : P.count / 3;
              if (!P.array || (I && !I.array)) { miss++; return; }   // mảng đã bỏ sau khi lên GPU: không còn tam giác để cắt
              for (let k = 0; k < nI; k++) {
                _wm.copy(m.matrixWorld); if (m.isInstancedMesh) { m.getMatrixAt(k, _im); _wm.multiply(_im); }
                if (_bx.copy(G.boundingBox).applyMatrix4(_wm).min.y > yMax) continue;
                for (let t = 0; t < nT; t++) {
                  const i0 = I ? I.getX(t * 3) : t * 3, i1 = I ? I.getX(t * 3 + 1) : t * 3 + 1, i2 = I ? I.getX(t * 3 + 2) : t * 3 + 2;
                  _a.fromBufferAttribute(P, i0).applyMatrix4(_wm); _b.fromBufferAttribute(P, i1).applyMatrix4(_wm); _c.fromBufferAttribute(P, i2).applyMatrix4(_wm);
                  if (Math.min(_a.y, _b.y, _c.y) <= yMax) each(_a, _b, _c);
                }
              }
            }); }
          }
          function build(E) {
            const t0 = performance.now(), m0 = miss, R = E.roots, o = E.o, r0 = R[0].getWorldPosition(_v), g0 = o.y !== undefined ? o.y : cowY(r0.x, r0.z);
            const W = o.w || 0.35, LINE = o.line !== undefined ? o.line : 0.6, AO = o.ao !== undefined ? o.ao : 0.35, BODY = o.body || 0, BA = o.bodyA || 0.4;
            const PL = [g0 + 0.03, g0 + 0.10], seg = [], flat = [], body = [];
            triangles(R, BODY ? g0 + BODY : g0 + 0.12, !!o.inst, (a, b, c) => {
              const lo = Math.min(a.y, b.y, c.y), hi = Math.max(a.y, b.y, c.y);
              if (lo > g0 - 0.05 && hi < g0 + 0.12) { flat.push(a.x, a.z, b.x, b.z, c.x, c.z); return; }
              for (const y of PL) { if (lo > y || hi < y) continue; const q = [];   // cắt lát: 2 cạnh vượt mặt phẳng → 1 đoạn
                for (const [p, s] of [[a, b], [b, c], [c, a]]) if ((p.y - y) * (s.y - y) < 0) { const f = (y - p.y) / (s.y - p.y); q.push(p.x + (s.x - p.x) * f, p.z + (s.z - p.z) * f); }
                if (q.length === 4) seg.push(q[0], q[1], q[2], q[3]); }
              if (BODY && lo > g0 + 0.02 && hi < g0 + BODY) body.push(a.x, a.z, b.x, b.z, c.x, c.z);
            });
            if (!seg.length && !flat.length) { if (miss > m0) made.push({ of: R[0].name, miss: miss - m0 }); return; }
            let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
            for (const L of [seg, flat, body]) for (let i = 0; i < L.length; i += 2) { x0 = Math.min(x0, L[i]); x1 = Math.max(x1, L[i]); z0 = Math.min(z0, L[i + 1]); z1 = Math.max(z1, L[i + 1]); }
            const pad = Math.max(0.5, W * 3, BODY ? 0.9 : 0); x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
            const ext = Math.max(x1 - x0, z1 - z0), ps = Math.max(0.03, ext / 256), NX = Math.ceil((x1 - x0) / ps), NZ = Math.ceil((z1 - z0) / ps);
            const mk = () => new Uint8Array(NX * NZ), M = mk(), MB = mk();
            const dot = (A, x, z) => { const i = (x - x0) / ps | 0, j = (z - z0) / ps | 0; if (i >= 0 && j >= 0 && i < NX && j < NZ) A[j * NX + i] = 1; };
            for (let k = 0; k < seg.length; k += 4) { const n = Math.max(1, Math.ceil(Math.hypot(seg[k + 2] - seg[k], seg[k + 3] - seg[k + 1]) / (ps * 0.5)));
              for (let s = 0; s <= n; s++) dot(M, seg[k] + (seg[k + 2] - seg[k]) * s / n, seg[k + 1] + (seg[k + 3] - seg[k + 1]) * s / n); }
            const fill = (A, T) => { for (let k = 0; k < T.length; k += 6) {   // tô hình chiếu tam giác (quét hộp bao, hàm cạnh)
              const ax = T[k], az = T[k + 1], bx = T[k + 2], bz = T[k + 3], cx = T[k + 4], cz = T[k + 5], d = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
              if (Math.abs(d) < 1e-9) continue;
              const i0 = Math.max(0, (Math.min(ax, bx, cx) - x0) / ps | 0), i1 = Math.min(NX - 1, (Math.max(ax, bx, cx) - x0) / ps | 0), j0 = Math.max(0, (Math.min(az, bz, cz) - z0) / ps | 0), j1 = Math.min(NZ - 1, (Math.max(az, bz, cz) - z0) / ps | 0);
              for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const px = x0 + (i + 0.5) * ps, pz = z0 + (j + 0.5) * ps;
                const u = ((bx - px) * (cz - pz) - (bz - pz) * (cx - px)) / d, v = ((cx - px) * (az - pz) - (cz - pz) * (ax - px)) / d;
                if (u >= 0 && v >= 0 && u + v <= 1) A[j * NX + i] = 1; }
              dot(A, ax, az); dot(A, bx, bz); dot(A, cx, cz); } };
            fill(M, flat); if (BODY) fill(MB, body);
            const dist = A => { const D = new Float32Array(NX * NZ), K = 1.4142;   // chamfer 2 lượt (ô) → mét
              for (let p = 0; p < D.length; p++) D[p] = A[p] ? 0 : 1e6;
              for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const p = j * NX + i; let d = D[p];
                if (i > 0) d = Math.min(d, D[p - 1] + 1); if (j > 0) { d = Math.min(d, D[p - NX] + 1); if (i > 0) d = Math.min(d, D[p - NX - 1] + K); if (i < NX - 1) d = Math.min(d, D[p - NX + 1] + K); } D[p] = d; }
              for (let j = NZ - 1; j >= 0; j--) for (let i = NX - 1; i >= 0; i--) { const p = j * NX + i; let d = D[p];
                if (i < NX - 1) d = Math.min(d, D[p + 1] + 1); if (j < NZ - 1) { d = Math.min(d, D[p + NX] + 1); if (i < NX - 1) d = Math.min(d, D[p + NX + 1] + K); if (i > 0) d = Math.min(d, D[p + NX - 1] + K); } D[p] = d; }
              for (let p = 0; p < D.length; p++) D[p] *= ps; return D; };
            const DM = dist(M), DB = BODY ? dist(MB) : null, px = new Uint8Array(NX * NZ * 4);
            for (let p = 0; p < NX * NZ; p++) { const d = DM[p];
              let keep = (1 - LINE * Math.exp(-d / 0.06)) * (1 - AO * Math.exp(-d / W));
              if (DB) keep *= 1 - BA * Math.exp(-DB[p] / 0.5);
              px[p * 4] = px[p * 4 + 1] = px[p * 4 + 2] = 255; px[p * 4 + 3] = Math.round(255 * (1 - keep)); }
            const sh = drape({ px, NX, NZ, ps, x0, x1, z0, z1, g0, name: 'Bóng tiếp đất · ' + (R[0].name || 'vật') });
            made.push({ of: R[0].name, mesh: sh, seg: seg.length / 4, flat: flat.length / 6, body: body.length / 6, miss: miss - m0, px: NX + '×' + NZ, ms: Math.round(performance.now() - t0) });
          }
          function drape(F) {   // tấm phủ: ảnh độ mờ F.px (RGBA, NX × NZ ô cỡ ps từ x0, z0) rải theo mặt đất thật trong [x0, x1] × [z0, z1]; ô lệch cao độ g0 > 0,3 m trong suốt
            const { px, NX, NZ, ps, x0, x1, z0, z1, g0 } = F, ext = Math.max(x1 - x0, z1 - z0);
            const tex = new THREE.DataTexture(px, NX, NZ, THREE.RGBAFormat); tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.needsUpdate = true;
            const gs = Math.max(0.15, ext / 90), GXn = Math.ceil((x1 - x0) / gs), GZn = Math.ceil((z1 - z0) / gs), P = [], U = [], C = [], I = [];
            for (let j = 0; j <= GZn; j++) for (let i = 0; i <= GXn; i++) { const x = Math.min(x1, x0 + i * gs), z = Math.min(z1, z0 + j * gs), y = cowY(x, z);
              P.push(x, y + 0.015, z); U.push((x - x0) / (NX * ps), (z - z0) / (NZ * ps)); C.push(1, 1, 1, Math.abs(y - g0) < 0.3 ? 1 : 0); }
            for (let j = 0; j < GZn; j++) for (let i = 0; i < GXn; i++) { const p = j * (GXn + 1) + i, q = p + GXn + 1;
              if (C[p * 4 + 3] + C[(p + 1) * 4 + 3] + C[q * 4 + 3] + C[(q + 1) * 4 + 3] === 0) continue; I.push(p, q, p + 1, p + 1, q, q + 1); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
            geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 4)); geo.setIndex(I); geo.computeBoundingSphere();
            const mat = new THREE.MeshBasicMaterial({ color: 0x16120b, map: tex, vertexColors: true, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
            const sh = new THREE.Mesh(geo, mat); sh.name = F.name; sh.renderOrder = 1; sh.userData.noBake = sh.userData.noBatch = true; sh.raycast = () => {};
            scene.add(sh); return sh;
          }
          const go = () => { if (ready) return; ready = true; const step = () => { const E = Q.shift(); if (!E) return; setTimeout(step, 0); build(E); }; step(); };   // mỗi vật 1 lượt (≤ 50 ms) — không khựng 1 lần; hẹn lượt sau TRƯỚC khi cắt ⇒ 1 vật lỗi không chặn hàng đợi
          ldGate.then(() => Promise.race([Promise.all(ldNeed), new Promise(r => setTimeout(r, 8000))])).then(go);
          worldServe('groundContact', { drape, add: (root, o = {}) => { const E = { roots: [].concat(root).filter(Boolean), o }; if (!E.roots.length) return; ready ? build(E) : Q.push(E); } });
          return { made, idle: () => ready && !Q.length };
        })();
