        // ==== BÓNG GÓC NƯỚNG SẴN (ambient occlusion theo đỉnh — hạ tầng; nội thất xe thật hơn, tốn ít RAM nhất, bước 1) ====
        //  Đơn vị gọi aoBake(gốc, { box, skip }) khi cần (xe: lần đầu xem xuyên / nhìn cận — van/interior/caravan.js); chạy 1 lần, chia nhỏ mỗi khung ≤ AO_MS ms.
        //  Nhiều vật rời (khu trại — camp/realism.js): aoBake(scene, { key, roots: [các gốc], box (toạ độ thế giới), ground: true }) — vật chắn + mảnh nhận chỉ lấy
        //  trong roots; ground: ô dưới mặt đất thật (cowY) cũng chắn ⇒ chân đồ đạc tối dần sát đất (chỉ gốc đứng thẳng: lưới ô theo cột dọc).
        //  floor: { r, k, max, ps, fade, done } (chỉ gốc = scene): thêm BÓNG GÓC MẶT ĐẤT — độ che bầu trời tại điểm đất (cowY) mỗi ô ps, tia dài r, suy giảm tuyến tính,
        //  độ mờ = k × độ che (≤ max), mờ dần về mép hộp trong fade m; ô xa mọi vật quá r (lưới cột giãn) bỏ qua tia. Xong ⇒ done({ px RGBA, NX, NZ, ps, x0, x1, z0, z1, g0 })
        //  trong dãy ngẫu nhiên riêng (bên gọi rải thành tấm phủ — dịch vụ groundContact.drape).
        //  vox: cỡ ô (mặc định AO_VOX) — hộp rộng (gốc cổ thụ ~11 × 10 m) dùng ô 5 cm cho nhẹ RAM · recv: false = chỉ tính bóng góc mặt đất, không nhận bóng theo
        //  đỉnh (vỏ cây, đá có shader riêng — nature/old-tree-shade.js) · occ: bitset ô vật chắn chụp sẵn bằng aoVoxNow({ roots, box, vox }) lúc dựng cảnh — lưới vỏ
        //  cây bị bỏ bản RAM ngay sau khi lên GPU (core/mem-trim.js) nên lúc nướng không còn tam giác để rải (lưới đã bỏ bản RAM: aoVox bỏ qua, không lỗi).
        //  · Lưới ô AO_VOX trong hộp box (toạ độ của gốc): rải điểm trên mọi tam giác vật chắn (kể cả vỏ đang ẩn khi xem xuyên — vách vẫn có thật), đánh dấu ô có
        //    mặt — 1 byte / ô, xong thì bỏ. Kính / mặt trong suốt không chắn.
        //  · Độ che 1 điểm: AO_N tia nửa cầu phân bố cos quanh pháp tuyến (xoắn ốc tỉ lệ vàng, cố định ⇒ tất định), bước 0,75 ô tới AO_R; trúng ở khoảng t ⇒
        //    (1 − t/R)²; ra khỏi hộp = trống. Gốc tia nhích 1,5 ô theo pháp tuyến (khỏi trúng chính mặt mình).
        //  · Mặt lớn ít đỉnh (sàn, mặt bàn — hộp 24 đỉnh) không chứa được dải tối: CHẺ tam giác thích nghi — cạnh > AO_MAX, hoặc độ che giữa cạnh / tâm tam giác lệch
        //    > AO_TOL / độ sáng vật liệu (√ độ chói: mặt tối lệch nhiều mới thấy) so với trung bình các đỉnh thì chẻ (cạnh ≤ AO_MIN thôi). Đánh dấu theo CẠNH, khoá
        //    theo vị trí ⇒ hai tam giác chung cạnh chẻ cùng nhau, không hở. Chỉ dày ở góc, chân đồ đạc; giữa mặt trống giữ thưa. Không chẻ theo AO_MAX: tam giác
        //    khuất hẳn (đỉnh + giữa cạnh đều che > AO_HID — mặt hộp chìm trong vách), vật liệu tối (√ độ chói < 0,3). Mặt úp hẳn xuống (không bao giờ thấy) không tự chẻ.
        //  · Mảnh trong lô gộp vẽ (core/draw-batch.js): hình chẻ + hệ số sáng (thuộc tính 'ao') → lô dựng lại nhân hệ số vào màu đỉnh ⇒ không thêm lượt vẽ,
        //    không đổi shader; lô lên GPU xong thì bỏ hình chẻ (bản RAM của lô cũng đã bỏ), hình gốc giữ nguyên cho tia chọn / va chạm. Mất ngữ cảnh WebGL ⇒
        //    lô dựng lại từ hình gốc (mất bóng) ⇒ nướng lại phần trong lô. Mảnh tự vẽ: chỉ nhận khi MỌI lưới dùng vật liệu đó đều được nướng và không lưới
        //    nào trong lô (bật vertexColors ⇒ vật liệu đổi version ⇒ lô tách mảnh) — hình chẻ thay hình cũ, hệ số vào thuộc tính 'color' (userData.aoOwn).
        //  · Hình mới dựng bằng dãy ngẫu nhiên RIÊNG (uuid three.js lấy từ Math.random — giữ dãy chung của cảnh tất định, như batchClear).
        //  · Số đo 05/11 (xe, xem xuyên): xem docs/architecture/render.md mục "Bóng góc nướng sẵn".
        const AO_VOX = 0.03, AO_R = 0.25, AO_N = 48, AO_K = 0.7, AO_TOL = 0.075, AO_MIN = 0.08, AO_MAX = 0.4, AO_HID = 0.75, AO_MS = 6;
        const AO_DIRS = new Float32Array(AO_N * 3);
        for (let i = 0; i < AO_N; i++) { const u = (i + 0.5) / AO_N, r = Math.sqrt(u), t = i * 2.39996; AO_DIRS.set([r * Math.cos(t), r * Math.sin(t), Math.sqrt(1 - u)], i * 3); }
        const AOB = { job: null, q: [], done: new Map(), stat: null, rs: 0x5EED0A0 };   // done: khoá (opt.key hoặc gốc) → [gốc, opt] (để nướng lại) · rs: dãy ngẫu nhiên riêng
        function aoBake(root, opt) { const k = opt.key || root; if (AOB.done.has(k)) return; AOB.done.set(k, [root, opt]); AOB.q.push(k); }
        worldTick('afterRender', 95, () => {   // việc nướng chạy dần sau khi vẽ, ≤ AO_MS ms / khung
          if (!AOB.job) { if (!AOB.q.length) return; const [r, o] = AOB.done.get(AOB.q.shift()); AOB.job = aoJob(r, o); }
          const t0 = performance.now();
          while (performance.now() - t0 < AO_MS) if (AOB.job.next().done) { AOB.job = null; break; }
        });
        listen(renderer.domElement, 'webglcontextrestored', () => { AOB.job = null; AOB.q = [...AOB.done.keys()]; });   // lô vừa dựng lại từ hình gốc (core/draw-batch.js) ⇒ nướng lại; mảnh tự vẽ giữ hình đã nướng
        function aoRnd(f) {   // chạy f với dãy ngẫu nhiên riêng (mulberry32)
          const R0 = Math.random;
          Math.random = () => { const s = AOB.rs = AOB.rs + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          try { return f(); } finally { Math.random = R0; }
        }
        function aoGeoOf(own, lp, ln, uv, cl, ao, tris) {   // hình chẻ: vị trí, pháp tuyến 8 bit, uv, màu 8 bit (tự vẽ: × hệ số sáng) / hệ số sáng 'ao' (trong lô)
          const n = ao.length, geo = new THREE.BufferGeometry(), nr = new Int8Array(n * 3), lt = new Float32Array(n);
          for (let i = 0; i < n * 3; i++) nr[i] = Math.round(Math.max(-1, Math.min(1, ln[i])) * 127);
          for (let i = 0; i < n; i++) lt[i] = Math.max(0.15, 1 - AO_K * ao[i]);
          geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
          geo.setAttribute('normal', new THREE.BufferAttribute(nr, 3, true));
          if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
          geo.setIndex(new THREE.BufferAttribute(n > 65535 ? new Uint32Array(tris) : new Uint16Array(tris), 1));
          if (own || cl) { const col = new Uint8Array(n * 3); for (let i = 0; i < n * 3; i++) col[i] = Math.round((own ? lt[(i / 3) | 0] : 1) * (cl ? cl[i] : 1) * 255); geo.setAttribute('color', new THREE.BufferAttribute(col, 3, true)); }
          if (!own) geo.setAttribute('ao', new THREE.BufferAttribute(Uint8Array.from(lt, v => Math.round(v * 255)), 1, true));
          geo.computeBoundingBox(); if (own) geo.computeBoundingSphere(); return geo;
        }
        function* aoVox(root, meshes, B, V, occ, nx, ny, nz) {   // ô có vật chắn: rải điểm trên mọi tam giác (lưới đã bỏ bản RAM thì bỏ qua) trong hộp B (toạ độ của gốc)
          const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), x0 = B.min.x, y0 = B.min.y, z0 = B.min.z; let busy = 0;
          const cell = (x, y, z) => { const i = Math.floor((x - x0) / V), j = Math.floor((y - y0) / V), k = Math.floor((z - z0) / V); return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? -1 : (k * ny + j) * nx + i; };
          const M = new THREE.Matrix4(), Mi = new THREE.Matrix4(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), bb = new THREE.Box3();
          const shown = o => { for (let p = o; p && p !== root.parent; p = p.parent) if (!p.visible) return false; return true; };
          const baseMat = o => { const m = o.userData.xrayMaterial || o.material; return Array.isArray(m) ? m[0] : m; };   // đang xem xuyên: vật liệu thật của vỏ
          for (const o of meshes) {
            const m = baseMat(o), g = o.geometry, P = g.attributes.position, I = g.index;
            if (!P || !P.array || (I && !I.array) || !m || !m.visible || (m.transparent && (m.opacity < 0.9 || !m.depthWrite)) || !shown(o)) continue;   // lửa, khói, quầng sáng (không ghi chiều sâu) không chắn
            if (!g.boundingBox) g.computeBoundingBox();
            for (let r = 0, reps = o.isInstancedMesh ? o.count : 1; r < reps; r++) {
              M.multiplyMatrices(inv, o.matrixWorld); if (o.isInstancedMesh) { o.getMatrixAt(r, Mi); M.multiply(Mi); }
              if (!bb.copy(g.boundingBox).applyMatrix4(M).intersectsBox(B)) continue;
              for (let t = 0, n = I ? I.count : P.count; t < n; t += 3) {
                a.fromBufferAttribute(P, I ? I.getX(t) : t).applyMatrix4(M); b.fromBufferAttribute(P, I ? I.getX(t + 1) : t + 1).applyMatrix4(M); c.fromBufferAttribute(P, I ? I.getX(t + 2) : t + 2).applyMatrix4(M);
                if (Math.max(a.x, b.x, c.x) < x0 || Math.min(a.x, b.x, c.x) > B.max.x || Math.max(a.y, b.y, c.y) < y0 || Math.min(a.y, b.y, c.y) > B.max.y || Math.max(a.z, b.z, c.z) < z0 || Math.min(a.z, b.z, c.z) > B.max.z) continue;
                const s = Math.max(1, Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / (V * 0.6)));
                for (let i = 0; i <= s; i++) for (let j = 0; j <= s - i; j++) {
                  const u = i / s, w = j / s, q = cell(a.x + (b.x - a.x) * u + (c.x - a.x) * w, a.y + (b.y - a.y) * u + (c.y - a.y) * w, a.z + (b.z - a.z) * u + (c.z - a.z) * w);
                  if (q >= 0) occ[q] = 1;
                }
                if ((busy += s * s / 2 + 8) > 6e4) { busy = 0; yield; }
              }
            }
          }
        }
        function aoVoxNow(opt) {   // ô vật chắn NGAY, đồng bộ (gốc = scene, hộp thế giới) → bitset cho opt.occ — gọi lúc dựng cảnh, trước khi core/mem-trim.js bỏ bản RAM lưới vỏ
          const B = opt.box, V = opt.vox || AO_VOX, nx = Math.ceil((B.max.x - B.min.x) / V), ny = Math.ceil((B.max.y - B.min.y) / V), nz = Math.ceil((B.max.z - B.min.z) / V), occ = new Uint8Array(nx * ny * nz), meshes = [];
          scene.updateWorldMatrix(true, false); for (const r of opt.roots) { r.updateMatrixWorld(true); r.traverse(o => { if (o.isMesh) meshes.push(o); }); }
          const it = aoVox(scene, meshes, B, V, occ, nx, ny, nz); while (!it.next().done);
          const bits = new Uint8Array((occ.length + 7) >> 3); for (let q = 0; q < occ.length; q++) if (occ[q]) bits[q >> 3] |= 1 << (q & 7); return bits;
        }
        function* aoJob(root, opt) {
          const T0 = performance.now(), roots = opt.roots || [root]; let busy = 0; root.updateWorldMatrix(true, false); for (const r of roots) r.updateMatrixWorld(true);
          const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), up = new THREE.Vector3(0, 1, 0).transformDirection(inv), B = opt.box, V = opt.vox || AO_VOX, x0 = B.min.x, y0 = B.min.y, z0 = B.min.z;
          const nx = Math.ceil((B.max.x - x0) / V), ny = Math.ceil((B.max.y - y0) / V), nz = Math.ceil((B.max.z - z0) / V), occ = new Uint8Array(nx * ny * nz);
          const cell = (x, y, z) => { const i = Math.floor((x - x0) / V), j = Math.floor((y - y0) / V), k = Math.floor((z - z0) / V); return i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz ? -1 : (k * ny + j) * nx + i; };
          const M = new THREE.Matrix4(), Mi = new THREE.Matrix4(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), bb = new THREE.Box3(), N3 = new THREE.Matrix3();
          const meshes = []; for (const r of roots) r.traverse(o => { if (o.isMesh) meshes.push(o); });
          const shown = o => { for (let p = o; p && p !== root.parent; p = p.parent) if (!p.visible) return false; return true; };
          const baseMat = o => { const m = o.userData.xrayMaterial || o.material; return Array.isArray(m) ? m[0] : m; };   // đang xem xuyên: vật liệu thật của vỏ
          // (1) ô có vật chắn — hoặc bitset chụp sẵn lúc dựng cảnh (aoVoxNow: lưới vỏ cây bị bỏ bản RAM sau khi lên GPU — core/mem-trim.js)
          if (opt.occ) { const O = opt.occ; for (let q = 0; q < occ.length; q++) occ[q] = (O[q >> 3] >> (q & 7)) & 1; }
          else yield* aoVox(root, meshes, B, V, occ, nx, ny, nz);
          let near = null;
          if (opt.floor) {   // cột có vật (trước khi tô đất) giãn r theo x rồi z ⇒ near[ô cột] > 0: trong tầm tia của ít nhất 1 vật
            const c0 = new Uint8Array(nx * nz), r = Math.ceil(opt.floor.r / V), dil = (A, s1, n1, s2, n2) => { const O = new Uint8Array(A.length);
              for (let b = 0; b < n2; b++) { let c = 0; for (let a = -r; a < n1 + r; a++) { if (a + r < n1 && A[(a + r) * s1 + b * s2]) c++; if (a - r - 1 >= 0 && A[(a - r - 1) * s1 + b * s2]) c--; if (a >= 0 && a < n1 && c > 0) O[a * s1 + b * s2] = 1; } } return O; };
            for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (occ[(k * ny + j) * nx + i]) c0[k * nx + i] = 1;
            near = dil(dil(c0, 1, nx, nx, nz), nx, nz, 1, nx);
          }
          if (opt.ground) for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) {   // ô có tâm dưới mặt đất thật = vật chắn
            a.set(x0 + (i + 0.5) * V, y0, z0 + (k + 0.5) * V).applyMatrix4(root.matrixWorld); const g = cowY(a.x, a.z), dy = root.matrixWorld.elements[5] * V;
            for (let j = 0; j < ny && a.y + (j + 0.5) * dy < g; j++) occ[(k * ny + j) * nx + i] = 1;
          }
          const tVox = performance.now() - T0;
          // độ che tại điểm p, pháp tuyến n (toạ độ gốc)
          function aoAt(px, py, pz, ex, ey, ez, RR = AO_R, lin = false) {   // RR, lin: tia dài + suy giảm tuyến tính (bóng góc mặt đất)
            let tx, ty, tz, sx, sy, sz;   // khung tiếp tuyến (Frisvad)
            if (ez < -0.9999) { tx = 0; ty = -1; tz = 0; sx = -1; sy = 0; sz = 0; }
            else { const k = 1 / (1 + ez), q = -ex * ey * k; tx = 1 - ex * ex * k; ty = q; tz = -ex; sx = q; sy = 1 - ey * ey * k; sz = -ey; }
            const ox = px + ex * 1.5 * V, oy = py + ey * 1.5 * V, oz = pz + ez * 1.5 * V; let sum = 0;
            for (let d = 0; d < AO_N * 3; d += 3) {
              const D0 = AO_DIRS[d], D1 = AO_DIRS[d + 1], D2 = AO_DIRS[d + 2], wx = tx * D0 + sx * D1 + ex * D2, wy = ty * D0 + sy * D1 + ey * D2, wz = tz * D0 + sz * D1 + ez * D2;
              for (let s = 0.5 * V; s < RR; s += 0.75 * V) {
                const q = cell(ox + wx * s, oy + wy * s, oz + wz * s); if (q < 0) break;
                if (occ[q]) { const f = 1 - s / RR; sum += lin ? f : f * f; break; }
              }
            }
            busy += AO_N * 6; return sum / AO_N;
          }
          let floor = null;
          if (opt.floor) {   // (1b) bóng góc mặt đất (gốc = scene: hộp là toạ độ thế giới)
            const F = opt.floor, ps = F.ps || 0.05, NX = Math.ceil((B.max.x - x0) / ps), NZ = Math.ceil((B.max.z - z0) / ps), px = new Uint8Array(NX * NZ * 4), fade = F.fade || 0.4;
            for (let k = 0; k < NZ; k++) {
              for (let i = 0; i < NX; i++) {
                const x = x0 + (i + 0.5) * ps, z = z0 + (k + 0.5) * ps, ci = Math.min(nx - 1, Math.floor((x - x0) / V)), ck = Math.min(nz - 1, Math.floor((z - z0) / V)), p = (k * NX + i) * 4;
                px[p] = px[p + 1] = px[p + 2] = 255; if (!near[ck * nx + ci]) continue;
                const w = Math.min(1, Math.min(x - x0, B.max.x - x, z - z0, B.max.z - z) / fade), oc = aoAt(x, cowY(x, z) + 0.01, z, 0, 1, 0, F.r, true);
                px[p + 3] = Math.round(255 * Math.min(F.max || 1, F.k * oc) * w * w * (3 - 2 * w));
              }
              if (busy > 4e4) { busy = 0; yield; }
            }
            floor = { px, NX, NZ, ps, x0, x1: x0 + NX * ps, z0, z1: z0 + NZ * ps, g0: cowY((x0 + B.max.x) / 2, (z0 + B.max.z) / 2) };
          }
          // (2) mảnh nhận bóng: mặt sáng (Lambert / Phong / Standard), đục, không phát sáng, 1 vật liệu, hình đứng yên, tâm hộp bao trong hộp
          const users = new Map(); scene.traverse(o => { if (o.isMesh) for (const m of [].concat(o.material)) { const L = users.get(m); if (L) L.push(o); else users.set(m, [o]); } });
          const lit = m => m && (m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshStandardMaterial) && !m.transparent && !(m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0);
          const cand = opt.recv === false ? [] : meshes.filter(o => {
            if (o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || !lit(o.material) || o.userData.noBatch || o.userData.aoOwn || o.userData.lodHi !== undefined || (opt.skip && opt.skip(o))) return false;
            const g = o.geometry, P = g.attributes.position; if (!P || P.isInterleavedBufferAttribute || g.morphAttributes.position || !shown(o)) return false;
            if (!g.boundingBox) g.computeBoundingBox(); M.multiplyMatrices(inv, o.matrixWorld); return B.containsPoint(bb.copy(g.boundingBox).applyMatrix4(M).getCenter(a));
          });
          const candSet = new Set(cand);
          const recs = cand.filter(o => o.userData.batched || users.get(o.material).every(u => candSet.has(u) && !u.userData.batched));
          const made = [], top = []; let vIn = 0, vOut = 0, tOut = 0;
          for (const o of recs) {
            const g = o.geometry, P = g.attributes.position, I = g.index, U = g.attributes.uv, C = o.material.vertexColors ? g.attributes.color : null;
            let Nn = g.attributes.normal; if (!Nn) { const t = g.clone(); t.computeVertexNormals(); Nn = t.attributes.normal; }
            M.multiplyMatrices(inv, o.matrixWorld); N3.getNormalMatrix(M);
            const lp = [], ln = [], uv = U ? [] : null, cl = C ? [] : null, gp = [], gn = [], key = [], ao = [];
            const addV = (p, n, u0, u1, c0, c1, c2, oc) => {   // p, n: Vector3 cục bộ (đã chép)
              const i = ln.length / 3; lp.push(p.x, p.y, p.z); ln.push(n.x, n.y, n.z); if (uv) uv.push(u0, u1); if (cl) cl.push(c0, c1, c2);
              b.copy(p).applyMatrix4(M); gp.push(b.x, b.y, b.z); c.copy(n).applyMatrix3(N3).normalize(); gn.push(c.x, c.y, c.z);
              key.push(Math.round(b.x * 1e4) + ',' + Math.round(b.y * 1e4) + ',' + Math.round(b.z * 1e4)); ao.push(oc); return i;
            };
            for (let i = 0; i < P.count; i++) addV(a.fromBufferAttribute(P, i), b.fromBufferAttribute(Nn, i).clone(), U ? U.getX(i) : 0, U ? U.getY(i) : 0, C ? C.getX(i) : 1, C ? C.getY(i) : 1, C ? C.getZ(i) : 1, -1);
            vIn += P.count;
            let tris = []; for (let t = 0, n = I ? I.count : P.count; t < n; t++) tris.push(I ? I.getX(t) : t);
            const aoV = i => ao[i] >= 0 ? ao[i] : (ao[i] = aoAt(gp[i * 3], gp[i * 3 + 1], gp[i * 3 + 2], gn[i * 3], gn[i * 3 + 1], gn[i * 3 + 2]));
            const ek = (i, j) => key[i] < key[j] ? key[i] + '/' + key[j] : key[j] + '/' + key[i];
            const len = (i, j) => Math.hypot(gp[i * 3] - gp[j * 3], gp[i * 3 + 1] - gp[j * 3 + 1], gp[i * 3 + 2] - gp[j * 3 + 2]);
            const inBox = (i, j) => B.containsPoint(a.set((gp[i * 3] + gp[j * 3]) / 2, (gp[i * 3 + 1] + gp[j * 3 + 1]) / 2, (gp[i * 3 + 2] + gp[j * 3 + 2]) / 2));
            const midAo = new Map(), mid = new Map();
            const mAo = (i, j) => {   // độ che giữa cạnh (pháp tuyến trung bình)
              const k = i < j ? i + '_' + j : j + '_' + i; let v = midAo.get(k); if (v !== undefined) return v;
              let ex = gn[i * 3] + gn[j * 3], ey = gn[i * 3 + 1] + gn[j * 3 + 1], ez = gn[i * 3 + 2] + gn[j * 3 + 2], l = Math.hypot(ex, ey, ez);
              if (l < 1e-3) { ex = gn[i * 3]; ey = gn[i * 3 + 1]; ez = gn[i * 3 + 2]; l = 1; }
              v = aoAt((gp[i * 3] + gp[j * 3]) / 2, (gp[i * 3 + 1] + gp[j * 3 + 1]) / 2, (gp[i * 3 + 2] + gp[j * 3 + 2]) / 2, ex / l, ey / l, ez / l); midAo.set(k, v); return v;
            };
            const midOf = (i, j) => {   // đỉnh giữa cạnh (tạo khi chẻ; 2 tam giác chung cặp đỉnh dùng chung)
              const k = i < j ? i + '_' + j : j + '_' + i; let v = mid.get(k); if (v !== undefined) return v;
              a.set((lp[i * 3] + lp[j * 3]) / 2, (lp[i * 3 + 1] + lp[j * 3 + 1]) / 2, (lp[i * 3 + 2] + lp[j * 3 + 2]) / 2);
              const n = new THREE.Vector3(ln[i * 3] + ln[j * 3], ln[i * 3 + 1] + ln[j * 3 + 1], ln[i * 3 + 2] + ln[j * 3 + 2]); if (n.lengthSq() < 1e-6) n.set(ln[i * 3], ln[i * 3 + 1], ln[i * 3 + 2]); n.normalize();
              v = addV(a.clone(), n, uv ? (uv[i * 2] + uv[j * 2]) / 2 : 0, uv ? (uv[i * 2 + 1] + uv[j * 2 + 1]) / 2 : 0,
                cl ? (cl[i * 3] + cl[j * 3]) / 2 : 1, cl ? (cl[i * 3 + 1] + cl[j * 3 + 1]) / 2 : 1, cl ? (cl[i * 3 + 2] + cl[j * 3 + 2]) / 2 : 1, mAo(i, j));
              mid.set(k, v); return v;
            };
            const cr = o.material.color, alb = Math.sqrt(0.2126 * cr.r + 0.7152 * cr.g + 0.0722 * cr.b), tol = AO_TOL / Math.max(0.2, alb), mx = alb < 0.3 ? Infinity : AO_MAX;
            const unseen = (v0, v1, v2) => {   // mặt úp hẳn xuống, 1 mặt: camera vườn kéo tới phi 1,45 vẫn nhìn từ trên (ui/labels-controls.js) ⇒ không bao giờ thấy
              if (o.material.side === THREE.DoubleSide) return false;
              const x = gn[v0 * 3] + gn[v1 * 3] + gn[v2 * 3], y = gn[v0 * 3 + 1] + gn[v1 * 3 + 1] + gn[v2 * 3 + 1], z = gn[v0 * 3 + 2] + gn[v1 * 3 + 2] + gn[v2 * 3 + 2];
              return x * up.x + y * up.y + z * up.z < -0.99 * Math.hypot(x, y, z);
            };
            for (let pass = 0; pass < 7; pass++) {
              const split = new Set();
              for (let t = 0; t < tris.length; t += 3) {
                const v0 = tris[t], v1 = tris[t + 1], v2 = tris[t + 2], E = [[v0, v1], [v1, v2], [v2, v0]];
                if (unseen(v0, v1, v2)) continue;   // chỉ chẻ theo cạnh chung với mặt bên cạnh (khỏi hở)
                const L = E.map(([i, j]) => len(i, j)), ok = E.map(([i, j], e) => L[e] > AO_MIN && inBox(i, j));
                let far = Math.max(L[0], L[1], L[2]), mark = false, dark = aoV(v0) > AO_HID && aoV(v1) > AO_HID && aoV(v2) > AO_HID;   // khuất hẳn: không chẻ theo AO_MAX
                for (let e = 0; e < 3 && dark; e++) if (ok[e] && mAo(E[e][0], E[e][1]) <= AO_HID) dark = false;
                for (let e = 0; e < 3; e++) {
                  if (!ok[e]) continue;
                  const [i, j] = E[e], k = ek(i, j); if (split.has(k)) { mark = true; continue; }
                  if ((L[e] > mx && !dark) || Math.abs(mAo(i, j) - (aoV(i) + aoV(j)) / 2) > tol) { split.add(k); mark = true; }
                }
                if (!mark && far > 2 * AO_MIN) {   // tâm tam giác: bóng nhỏ lọt giữa 3 đỉnh (chân ghế giữa sàn)
                  let ex = gn[v0 * 3] + gn[v1 * 3] + gn[v2 * 3], ey = gn[v0 * 3 + 1] + gn[v1 * 3 + 1] + gn[v2 * 3 + 1], ez = gn[v0 * 3 + 2] + gn[v1 * 3 + 2] + gn[v2 * 3 + 2]; const l = Math.hypot(ex, ey, ez) || 1;
                  const oc = aoAt((gp[v0 * 3] + gp[v1 * 3] + gp[v2 * 3]) / 3, (gp[v0 * 3 + 1] + gp[v1 * 3 + 1] + gp[v2 * 3 + 1]) / 3, (gp[v0 * 3 + 2] + gp[v1 * 3 + 2] + gp[v2 * 3 + 2]) / 3, ex / l, ey / l, ez / l);
                  if (Math.abs(oc - (aoV(v0) + aoV(v1) + aoV(v2)) / 3) > tol) for (const [i, j] of E) if (len(i, j) > AO_MIN && inBox(i, j)) split.add(ek(i, j));
                }
                if (busy > 4e4) { busy = 0; yield; }
              }
              if (!split.size) break;
              const nt = [];
              for (let t = 0; t < tris.length; t += 3) {
                const p0 = tris[t], p1 = tris[t + 1], p2 = tris[t + 2], s01 = split.has(ek(p0, p1)), s12 = split.has(ek(p1, p2)), s20 = split.has(ek(p2, p0)), k = s01 + s12 + s20;
                if (!k) { nt.push(p0, p1, p2); continue; }
                if (k === 3) { const m1 = midOf(p0, p1), m2 = midOf(p1, p2), m3 = midOf(p2, p0); nt.push(p0, m1, m3, m1, p1, m2, m3, m2, p2, m1, m2, m3); continue; }
                if (k === 1) {
                  if (s01) { const m = midOf(p0, p1); nt.push(p0, m, p2, m, p1, p2); }
                  else if (s12) { const m = midOf(p1, p2); nt.push(p0, p1, m, p0, m, p2); }
                  else { const m = midOf(p2, p0); nt.push(p0, p1, m, m, p1, p2); }
                  continue;
                }
                const [p, q, r] = s01 && s12 ? [p0, p1, p2] : s12 && s20 ? [p1, p2, p0] : [p2, p0, p1];   // 2 cạnh chẻ: (p,q) và (q,r)
                const m1 = midOf(p, q), m2 = midOf(q, r); nt.push(m1, q, m2, p, m1, m2, p, m2, r);
                if (busy > 4e4) { busy = 0; yield; }
              }
              tris = nt;
            }
            for (let i = 0; i < ao.length; i++) { aoV(i); if (busy > 4e4) { busy = 0; yield; } }
            made.push({ o, geo: aoRnd(() => aoGeoOf(!o.userData.batched, lp, ln, uv, cl, ao, tris)) }); vOut += ao.length; tOut += tris.length / 3;   // mảng tạm của mảnh này bỏ luôn
            top.push([o.name || (o.parent && o.parent.name) || '?', P.count, ao.length]);
          }
          // (3) gắn vào cảnh một lượt: mảnh tự vẽ thay hình (vật liệu bật vertexColors), lô chứa mảnh dựng lại rồi bỏ hình chẻ
          const inBatch = [], vc = new Set();
          for (const { o, geo } of made) {
            if (o.userData.batched) { o.userData.aoGeo = geo; inBatch.push(o); continue; }
            const old = o.geometry; o.geometry = geo; o.userData.aoOwn = true; if (!(users.get(o.material) || []).some(u => u !== o && u.geometry === old)) old.dispose();
            vc.add(o.material);
          }
          for (const m of vc) { m.vertexColors = true; m.needsUpdate = true; }
          aoRnd(() => batchAoRefresh(inBatch));
          if (floor && opt.floor.done) aoRnd(() => opt.floor.done(floor));
          AOB.stat = { ms: Math.round(performance.now() - T0), vox: Math.round(tVox), cells: occ.length, receivers: recs.length, batched: inBatch.length, own: vc.size, vIn, vOut, tris: tOut,
            top: top.sort((p, q) => q[2] - q[1] - p[2] + p[1]).slice(0, 12) };
        }
