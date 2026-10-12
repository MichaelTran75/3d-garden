        // ---- fish in the downstream river ----
        const fishies = [];
        // phân sắc tố cho đàn koi: 2 con đầu ĐEN · con thứ 3 ĐỎ-ĐEN lẫn · còn lại ĐỎ (tổng 10 con)
        let _koiN = 0;
        const koiPattern = () => { const i = _koiN++; return i < 2 ? 'black' : i === 2 ? 'mixed' : 'red'; };
        function fish(s, pattern) {   // KOI realistic: thân fusiform quét mượt (30 đốt × 18 cạnh) · đuôi quạt chẻ thùy nhẹ · vây màng 2 lớp · hoa văn Kohaku/Sumi vertex-color · bơi = sóng chạy dọc sống lưng (CPU vertex wave)
          s *= 0.9;   // Cá koi nhỏ đi 10%
          const g = new THREE.Group();
          const L = 1.1, SL = s * L;   // giữ tỉ lệ thân DÀI thêm 10% như bản cũ

          // --- profile thân (Catmull-Rom qua control points): nửa-cao h · nửa-rộng w · tâm dọc yc ---
          const CPu = [0, 0.06, 0.16, 0.32, 0.50, 0.68, 0.84, 0.94, 1.0];
          const CPh = [0.075, 0.140, 0.205, 0.245, 0.235, 0.180, 0.110, 0.075, 0.068];
          const CPw = [0.062, 0.115, 0.165, 0.195, 0.180, 0.130, 0.072, 0.045, 0.040];
          const CPy = [-0.012, 0.000, 0.018, 0.032, 0.028, 0.008, -0.006, -0.008, -0.008];
          function prof(arr, u) {
            let i = 0; while (i < CPu.length - 2 && u > CPu[i + 1]) i++;
            const t = Math.min(1, Math.max(0, (u - CPu[i]) / (CPu[i + 1] - CPu[i])));
            const p0 = arr[Math.max(0, i - 1)], p1 = arr[i], p2 = arr[i + 1], p3 = arr[Math.min(arr.length - 1, i + 2)];
            const t2 = t * t, t3 = t2 * t;
            return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
          }

          // --- hoa văn Kohaku/Sumi: đốm ellipse trong không gian (u dọc thân, góc-từ-sống-lưng) — bụng luôn trắng, mép pha mềm ---
          const spots = [];
          const nSpot = 2 + (Math.random() * 3 | 0);
          for (let k = 0; k < nSpot; k++) spots.push({
            u: 0.04 + Math.random() * 0.68,
            f: (Math.random() - 0.5) * 1.5,
            ru: 0.13 + Math.random() * 0.13,
            rf: 0.70 + Math.random() * 0.50,
            col: pattern === 'red' ? _koiC.red : pattern === 'black' ? _koiC.black : (k === 0 ? _koiC.red : k === 1 ? _koiC.black : (Math.random() < 0.5 ? _koiC.red : _koiC.black))
          });
          const vCol = (u, phi) => {
            const c = _koiC.white.clone();
            if (Math.abs(phi) < 2.0) for (const sp of spots) {
              const du = (u - sp.u) / sp.ru, df = (phi - sp.f) / sp.rf;
              const d = Math.sqrt(du * du + df * df);
              if (d < 1.05) { const k = Math.min(1, (1.05 - d) / 0.18); c.lerp(sp.col, k); if (k >= 1) break; }
            }
            return c;
          };

          // --- ống thân: NS vòng × M đỉnh, tiết diện lưng gồ sống · bụng tròn đầy ---
          const NS = 30, M = 18;
          const pos = [], col = [], idx = [];
          const xNose = 0.52 * SL, bodyLen = 1.30 * SL, xT = xNose - bodyLen;
          function ring(x, yc, h, w, u, xOfSin) {   // 1 vòng tiết diện; xOfSin ≠ null → đuôi quạt (x lùi theo |sin|)
            const i0 = pos.length / 3;
            for (let j = 0; j < M; j++) {
              const a = j / M * Math.PI * 2, sn = Math.sin(a), cs = Math.cos(a);
              const wj = w * (sn > 0 ? 1 - 0.30 * sn * sn : 1 + 0.07 * sn * sn);
              let phi = a - Math.PI / 2; if (phi > Math.PI) phi -= Math.PI * 2;
              pos.push(xOfSin ? xOfSin(sn) : x, yc + h * sn, wj * cs);
              const c = vCol(u, phi); col.push(c.r, c.g, c.b);
            }
            return i0;
          }
          function tube(r0, r1) {
            for (let j = 0; j < M; j++) { const j1 = (j + 1) % M; idx.push(r0 + j, r0 + j1, r1 + j, r0 + j1, r1 + j1, r1 + j); }
          }
          let prev = -1;
          for (let i = 0; i < NS; i++) {
            const u = i / (NS - 1);
            const r = ring(xNose - u * bodyLen, prof(CPy, u) * s, prof(CPh, u) * s, prof(CPw, u) * s, u, null);
            if (prev >= 0) tube(prev, r); prev = r;
          }
          // mũi cá bo tròn (nắp quạt)
          const tip = pos.length / 3;
          pos.push(xNose + 0.022 * SL, prof(CPy, 0) * s, 0);
          { const c = vCol(0.02, 0.5); col.push(c.r, c.g, c.b); }
          for (let j = 0; j < M; j++) idx.push(tip, (j + 1) % M, j);

          // --- đuôi quạt xòe rộng chẻ thùy NHẸ kiểu koi: tiếp ống, dẹt theo z, xòe theo y, mép sau lùi theo |sin| ---
          const finStart = pos.length / 3;   // từ đây trở đi toàn màng vây → ép pháp tuyến hướng lên cho sáng
          for (const fd of [
            { dx: 0.05, h: 0.090, w: 0.020, sp: 0 },
            { dx: 0.14, h: 0.180, w: 0.013, sp: 0.05 },
            { dx: 0.22, h: 0.260, w: 0.008, sp: 0.16 }]) {
            const r = ring(0, -0.008 * s, fd.h * s, fd.w * s, 2, sn => xT - (fd.dx + fd.sp * Math.pow(Math.abs(sn), 1.2)) * SL);
            tube(prev, r); prev = r;
          }

          // --- màng vây mỏng 2 LỚP (±δ, mặt ngược chiều) → nhìn phía nào cũng front-face, vây luôn sáng trắng ---
          const W = _koiC.white;
          function plate(vp, vt) {
            const b0 = pos.length / 3, n = vp.length / 3, d = 0.006 * s;
            for (const zo of [d, -d]) for (let i = 0; i < n; i++) { pos.push(vp[i * 3], vp[i * 3 + 1], vp[i * 3 + 2] + zo); col.push(W.r, W.g, W.b); }
            for (let i = 0; i < vt.length; i += 3) idx.push(b0 + vt[i], b0 + vt[i + 1], b0 + vt[i + 2], b0 + n + vt[i + 2], b0 + n + vt[i + 1], b0 + n + vt[i]);
          }
          // vây LƯNG thấp kiểu koi (cao trước thấp sau, ngả nhẹ về sau)
          {
            const vp = [], vt = [], DD = 6;
            for (let i = 0; i < DD; i++) {
              const q = i / (DD - 1), u = 0.44 + q * 0.40;
              const x = xNose - u * bodyLen, yb = (prof(CPy, u) + prof(CPh, u)) * s - 0.012 * s;
              vp.push(x, yb, 0, x - 0.06 * SL * (1 - 0.4 * q), yb + (0.092 - 0.058 * q) * s, 0);
              if (i) { const a = (i - 1) * 2; vt.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }   // lớp +δ quay mặt về +z để pháp tuyến ép không bị lật
            }
            plate(vp, vt);
          }
          // vây HẬU MÔN nhỏ dưới bụng sau
          {
            const vp = [], vt = [], AN = 3;
            for (let i = 0; i < AN; i++) {
              const q = i / (AN - 1), u = 0.80 + q * 0.13;
              const x = xNose - u * bodyLen, yb = (prof(CPy, u) - prof(CPh, u)) * s + 0.01 * s;
              vp.push(x, yb, 0, x - 0.05 * SL, yb - (0.07 - 0.035 * q) * s, 0);
              if (i) { const a = (i - 1) * 2; vt.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }   // lật chiều so với vây lưng (đỉnh vây nằm dưới)
            }
            plate(vp, vt);
          }
          // cặp vây BỤNG (tam giác nhỏ chếch ra sau-dưới)
          for (const sz of [-1, 1]) {
            const u = 0.56, x = xNose - u * bodyLen, yb = (prof(CPy, u) - prof(CPh, u) * 0.72) * s, zb = sz * prof(CPw, u) * 0.6 * s;
            plate([x, yb, zb, x - 0.10 * SL, yb - 0.01 * s, zb, x - 0.14 * SL, yb - 0.09 * s, zb + sz * 0.10 * s], [0, 1, 2]);
          }

          const bodyGeo = new THREE.BufferGeometry();
          bodyGeo.setIndex(idx);
          bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
          bodyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3));
          bodyGeo.computeVertexNormals();
          // màng vây dựng đứng bị Lambert chiếu cạnh → xám; ép pháp tuyến vây hướng lên để màng luôn sáng
          { const nrm = bodyGeo.attributes.normal; for (let i = finStart; i < pos.length / 3; i++) nrm.setXYZ(i, 0, 1, 0); }
          const body = new THREE.Mesh(bodyGeo, koiSkinM);
          body.castShadow = true; body.userData.noBake = true; g.add(body);

          // --- cặp vây NGỰC quạt màng 2 lớp, vỗ riêng ---
          const pects = [];
          for (const sz of [-1, 1]) {
            const NP = 5, R = 0.26 * s, d = 0.006 * s, pp = [], pi = [], off = NP + 2;
            for (const zo of [d, -d]) { pp.push(0, 0, zo); for (let i = 0; i <= NP; i++) { const b = -0.15 + i / NP * 1.15; pp.push(-R * Math.cos(b), -R * Math.sin(b), zo); } }
            for (let i = 1; i <= NP; i++) pi.push(0, i, i + 1, off, off + i + 1, off + i);
            const pg = new THREE.BufferGeometry();
            pg.setIndex(pi); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pp), 3));
            const pn = new Float32Array(off * 2 * 3); for (let i = 0; i < off * 2; i++) pn[i * 3 + 2] = sz;   // pháp tuyến ép hướng lên sau khi xoay nằm ngang
            pg.setAttribute('normal', new THREE.BufferAttribute(pn, 3));
            const pec = new THREE.Mesh(pg, koiWhiteM);
            pec.position.set(0.18 * SL, -0.06 * s, sz * 0.175 * s);
            pec.rotation.set(-sz * 1.25, sz * 0.5, 0.3);
            pec.userData.noBake = true; pec.userData.sz = sz; pec.userData.rx0 = -sz * 1.25;
            g.add(pec); pects.push(pec);
          }

          // --- mắt sẫm 2 bên đầu ---
          for (const sz of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.036 * s, 8, 6), koiEyeM); eye.position.set(0.335 * SL, 0.055 * s, sz * 0.132 * s); g.add(eye); }
          bakeStatic(g);   // gộp 2 mắt → 1 mesh (thân + vây ngực noBake giữ nguyên)

          // --- bơi: sóng ngang chạy đầu→đuôi, biên độ tăng dần về đuôi + uốn thân theo hướng rẽ (wob) ---
          const rest = Float32Array.from(pos), posAttr = bodyGeo.attributes.position, nV = rest.length / 3;
          const swPh = Math.random() * Math.PI * 2;
          const mouth = new THREE.Vector3(xNose, CPy[0] * s, 0);
          function swim(t, wob) {
            const w1 = t * 6.5 + swPh;
            mouth.z = s * .012 * Math.sin(w1 - 2.6 * .52);
            for (let i = 0; i < nV; i++) {
              const xr = rest[i * 3], p = Math.min(1, Math.max(0, (0.30 - xr / SL) / 1.42));
              posAttr.array[i * 3 + 2] = rest[i * 3 + 2] + s * (0.012 + 0.13 * p * p) * Math.sin(w1 - 2.6 * (xr / SL)) + wob * 0.30 * s * p * p;
            }
            posAttr.needsUpdate = true;
            for (const pec of pects) pec.rotation.x = pec.userData.rx0 + pec.userData.sz * Math.sin(t * 3.1 + swPh + pec.userData.sz * 1.3) * 0.16;
          }
          return { g, swim, mouth };
        }
        const fishOrigin = new THREE.Vector3(X0 + 73, lakeY - 0.62, Z0 + 113);   // đàn cá về tọa độ góc (73, _, 113)
        for (let n = 0; n < 7; n++) {
          const f = fish(0.58 + Math.random() * 0.18, koiPattern());
          f.g.position.copy(fishOrigin); scene.add(f.g);
          fishies.push(Object.assign(f, { base: fishOrigin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.2, 0, (Math.random() - 0.5) * 1.8)), rx: 2.1 + Math.random() * 1.8, rz: 1.2 + Math.random() * 1.1, ph: Math.random() * Math.PI * 2, sp: 0.12 + Math.random() * 0.06 }));
        }
        // ---- 3 con cá thêm ở tọa độ góc (88, 6, 44) — dưới nước hồ thượng lưu ----
        const fishSpot = new THREE.Vector3(X0 + 88, 6, Z0 + 44);
        for (let n = 0; n < 3; n++) {
          const f = fish(0.58 + Math.random() * 0.18, koiPattern());
          f.g.position.copy(fishSpot); scene.add(f.g);
          fishies.push(Object.assign(f, { base: fishSpot.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.2, 0, (Math.random() - 0.5) * 1.8)), rx: 2.1 + Math.random() * 1.8, rz: 1.2 + Math.random() * 1.1, ph: Math.random() * Math.PI * 2, sp: 0.12 + Math.random() * 0.06 }));
        }


        // ---- CÁ ĐỚP LÁ: lá/cánh hoa đang chìm (hoặc thỉnh thoảng đang nổi) gần cá → con rảnh gần nhất cùng mặt nước quay lại, tăng tốc,
        //      đổi độ sâu (ngóc/chúi đầu) để miệng tới đúng chỗ lá rồi đớp: 70% nuốt (lá biến mất, sủi bọt), 30% nhả ra (lá văng nhẹ, chìm tiếp).
        //      Đớp ở mặt nước thì gợn vòng. Xong việc cá bơi về vùng quen, độ sâu & góc ngóc trả dần về như cũ; nghỉ vài giây mới để ý lá khác ----
        const _fcM = new THREE.Vector3(), _fcD = new THREE.Vector3(), FISH_SNAPPED = { st: -1 };
        const fishFree = f => f.ang !== undefined && f !== angling.fish && f !== returningFishingFish && !f.leafT && !(f.leafCool > 0);
        function fishAlertLeaf(q, radius, chance) {
          const lvl = waterBaseY(Math.round(z2gj(q.p.z))) - 0.62; let best = null, bd = radius;
          for (const f of fishies) {
            if (!fishFree(f) || Math.abs(f.base.y - lvl) > 0.8) continue;   // chỉ cá cùng mặt nước (hồ trên / sông dưới)
            const d = Math.hypot(f.cx - q.p.x, f.cz - q.p.z); if (d < bd) { bd = d; best = f; }
          }
          if (!best || Math.random() >= chance) return null;
          best.leafT = q; best.leafChase = 0; best.snap = 0; best.chaseV = best.vmag; q.fish = (q.fish || 0) + 1;
          return best;
        }
        function endLeafChase(f) { const q = f.leafT; if (q && q.fish) q.fish--; f.leafT = null; f.leafCool = 6 + Math.random() * 6; f.snap = 0; }
        function fishSwimStep(f, dt, t, yTarget, pitchTarget) {   // tiến theo hướng f.ang với f.chaseV, giữ trong nước; độ sâu & góc ngóc tiến dần tới đích
          const nx = f.cx + Math.cos(f.ang) * f.chaseV * dt, nz = f.cz + Math.sin(f.ang) * f.chaseV * dt;
          if (waterCell(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { f.cx = nx; f.cz = nz; }
          const top = waterSurfaceY(f.cx, f.cz) - 0.1, bot = riverBedY(Math.round(x2gi(f.cx)), Math.round(z2gj(f.cz))) + 0.2, y0 = f.g.position.y;
          const y = y0 + (Math.max(bot, Math.min(top, yTarget)) - y0) * Math.min(1, dt * 2.5);
          f.dy = y - (f.base.y + Math.sin(t * 0.9 + f.ph) * 0.05);
          f.pitch = (f.pitch || 0) + (pitchTarget - (f.pitch || 0)) * Math.min(1, dt * 3);
          f.g.position.set(f.cx, y, f.cz); f.g.rotation.set(0, -f.ang, f.pitch);
          f.swT = (f.swT ?? t) + dt * (1 + f.chaseV * 0.9); f.swim(f.swT, f.wob);   // quẫy đuôi nhanh theo tốc độ
        }
        function fishChaseLeaf(f, dt, t) {
          if (f.leafT === FISH_SNAPPED) {   // nhịp lao tới sau cú đớp: đi thẳng, chậm dần rồi thôi
            f.snap -= dt; f.chaseV *= Math.exp(-dt * 2.5); f.wob *= Math.exp(-dt * 4);
            fishSwimStep(f, dt, t, f.g.position.y, 0);
            if (f.snap <= 0) { f.leafT = null; f.leafCool = 6 + Math.random() * 6; }
            return true;
          }
          const q = f.leafT;
          if (!(q.st === 3 || q.st === 4) || (f.leafChase += dt) > 14) { endLeafChase(f); return false; }   // lá đã chạm đáy / bị đớp mất / đuổi mãi không tới
          f.g.updateWorldMatrix(true, false); f.g.localToWorld(_fcM.copy(f.mouth));
          const dx = q.p.x - _fcM.x, dz = q.p.z - _fcM.z, dy = q.p.y - _fcM.y, dh = Math.hypot(dx, dz), d = Math.hypot(dh, dy);
          let da = Math.atan2(dz, dx) - f.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
          const turn = Math.max(-2.6 * dt, Math.min(2.6 * dt, da)); f.ang += turn;
          f.wob += (Math.max(-1.1, Math.min(1.1, turn / Math.max(dt, 1e-3) * 0.4)) - f.wob) * Math.min(1, dt * 6);   // thân uốn theo cú rẽ
          const vT = Math.min(1.7, 0.3 + dh * 0.9) * (Math.abs(da) > 1.2 ? 0.45 : 1);                                 // xa thì lao nhanh, gần thì rón rén
          f.chaseV += (vT - f.chaseV) * Math.min(1, dt * 3);
          fishSwimStep(f, dt, t, f.g.position.y + dy, Math.max(-0.5, Math.min(0.5, Math.atan2(dy, Math.max(0.25, dh)))));
          if (d < 0.16 + f.chaseV * 0.05) {   // ĐỚP
            const eat = Math.random() < 0.7;
            if (q.st === 3) waterFx.ring(q.p.x, waterSurfaceY(q.p.x, q.p.z), q.p.z, 0.4);   // đớp ngay mặt nước: gợn vòng
            waterFx.bubbles(_fcM.x, _fcM.y, _fcM.z, eat ? 4 : 2);
            if (q.fish) q.fish--;
            if (eat) q.st = 0;
            else {   // nhả ra: lá văng tới trước, ngấm thêm nước rồi chìm tiếp chậm hơn
              q.p.addScaledVector(_fcD.set(Math.cos(f.ang), 0, Math.sin(f.ang)), 0.25); q.p.y = Math.min(q.p.y, waterSurfaceY(q.p.x, q.p.z) - 0.05);
              if (q.st === 3) { q.st = 4; q.sinkV = 0.04; q.ph = 0; } else q.sinkV *= 0.7;
              q.look = 4;
            }
            f.leafT = FISH_SNAPPED; f.snap = 0.45; f.chaseV += 0.5;   // lao tới một nhịp
          }
          return true;
        }

