        // ---- chú chó nhỏ sưởi ấm bên bếp lửa ----
        function dogModel(s) {
          const g = new THREE.Group();
          const dogFur = new THREE.MeshLambertMaterial({ color: 0xc19a6b });
          const dogDark = new THREE.MeshLambertMaterial({ color: 0x4a3621 });
          const dogNose = new THREE.MeshLambertMaterial({ color: 0x111111 });
          const body = bx(0.55 * s, 0.24 * s, 0.32 * s, dogFur, true, true, lineDark); body.position.y = 0.12 * s; g.add(body);
          const head = bx(0.24 * s, 0.24 * s, 0.24 * s, dogFur, true, true, lineDark); head.position.set(0.22 * s, 0.26 * s, 0); g.add(head);
          const snout = bx(0.14 * s, 0.12 * s, 0.14 * s, dogFur, true, true, lineDark); snout.position.set(0.36 * s, 0.22 * s, 0); g.add(snout);
          const nose = bx(0.04 * s, 0.04 * s, 0.05 * s, dogNose, false, false); nose.position.set(0.44 * s, 0.23 * s, 0); g.add(nose);
          for (const sz of [-1, 1]) { const ear = bx(0.06 * s, 0.16 * s, 0.08 * s, dogDark, true, false); ear.position.set(0.18 * s, 0.24 * s, sz * 0.14 * s); g.add(ear); }
          const frontPaws = [];
          for (const sz of [-1, 1]) { const paw = bx(0.18 * s, 0.08 * s, 0.1 * s, dogFur, true, false); paw.position.set(0.28 * s, 0.04 * s, sz * 0.11 * s); g.add(paw); frontPaws.push(paw); }
          const rearPaws = [];
          for (const sz of [-1, 1]) { const paw = bx(0.18 * s, 0.12 * s, 0.1 * s, dogFur, true, false); paw.position.set(-0.2 * s, 0.06 * s, sz * 0.14 * s); g.add(paw); rearPaws.push(paw); }
          const tail = bx(0.18 * s, 0.06 * s, 0.06 * s, dogDark, true, false); tail.position.set(-0.3 * s, 0.08 * s, 0); tail.rotation.z = -0.2; g.add(tail);
          g.userData = { frontPaws, rearPaws, tail, body, head };
          return g;
        }
        const dogObj = dogModel(1.1); dogObj.scale.multiplyScalar(CAMP_SCALE * 1.1);   // to thêm 10% dogObj.name = 'Chó (Dog)';
        const dogP = worldCell(FIRE_CELL[0], FIRE_CELL[1]).add(new THREE.Vector3(0.9, 0.04 * CAMP_SCALE, 0.3));
        dogObj.position.copy(dogP); dogObj.rotation.y = Math.atan2(-0.3, -0.9); scene.add(dogObj);
        // ---- ĐUÔI MỀM = chuỗi hạt XPBD (vật lý dựa trên vị trí, tích phân Verlet): hạt gốc gắn thân; ràng buộc ĐỘ DÀI đoạn (cứng) và lực kéo mềm
        //      về DÁNG NGHỈ (mềm dần từ gốc ra ngọn) ⇒ đuôi có quán tính thật: chạy thì bị kéo về sau, dừng/quay thì vung theo, vẫy thành sóng
        //      từ gốc ra ngọn, gió thổi lệch nhẹ. 4 bước con mỗi khung; nhảy vị trí xa (dịch chuyển tức thời) thì đặt lại về dáng nghỉ ----
        const _stA = new THREE.Vector3(), _stB = new THREE.Vector3(), _stD = new THREE.Vector3(), _stX = new THREE.Vector3(1, 0, 0), _stW = new THREE.Vector3(), _stE = new THREE.Euler();
        function makeSoftTail(host, o) {   // o: base (cục bộ), dir (hướng nghỉ cục bộ, đơn vị), n đoạn, len (dài mỗi đoạn, cục bộ), w (bề dày), mat, stiff [gốc, ngọn]
          const segs = [], P = [], Q = [], R = [];
          for (let i = 0; i < o.n; i++) { const k = 1 - 0.35 * i / o.n, m = bx(o.len * 1.2, o.w * k, o.w * k, o.mat, true, false); m.castShadow = true; host.add(m); segs.push(m); }
          for (let i = 0; i <= o.n; i++) { P.push(new THREE.Vector3()); Q.push(new THREE.Vector3()); R.push(new THREE.Vector3()); }
          return { host, o, segs, P, Q, R, init: false, last: new THREE.Vector3() };
        }
        function updateSoftTail(T, dt, wag, curl) {
          const o = T.o, h = Math.min(dt, 0.05) / 4, M = T.host.matrixWorld; T.host.updateMatrixWorld(true);
          const S = new THREE.Vector3().setFromMatrixScale(M).x, segW = o.len * S;
          for (let i = 0; i <= o.n; i++) {   // dáng nghỉ (thế giới): hướng nghỉ quay theo lệnh vẫy (quanh trục đứng) + cuộn dần về một bên khi ngủ
            _stE.set(0, wag + curl * 0.45 * i, -curl * 0.35 * i * 0.5); _stD.copy(o.dir).applyEuler(_stE);
            if (i === 0) T.R[0].copy(o.base); else T.R[i].copy(T.R[i - 1]).sub(T.R[0]).add(o.base).addScaledVector(_stD, o.len);
          }
          for (let i = 0; i <= o.n; i++) T.R[i].applyMatrix4(M);
          if (!T.init || T.R[0].distanceTo(T.last) > 0.8) { for (let i = 0; i <= o.n; i++) { T.P[i].copy(T.R[i]); T.Q[i].copy(T.R[i]); } T.init = true; }
          T.last.copy(T.R[0]);
          windAt(T.R[0].x, T.R[0].y, T.R[0].z, 0.4, _stW);
          for (let sub = 0; sub < 4; sub++) {
            for (let i = 1; i <= o.n; i++) {   // Verlet: quán tính (tắt dần nhẹ) + trọng lực + kéo theo gió
              const p = T.P[i], q = T.Q[i];
              _stA.copy(p).sub(q).multiplyScalar(0.985); q.copy(p);
              p.add(_stA); p.y -= 2.5 * h * h; p.addScaledVector(_stW, 0.02 * h);
            }
            T.P[0].copy(T.R[0]); T.Q[0].copy(T.R[0]);   // gốc gắn chặt vào thân
            for (let i = 1; i <= o.n; i++) {   // kéo mềm về dáng nghỉ (gốc cứng hơn ngọn)
              const k = o.stiff[0] + (o.stiff[1] - o.stiff[0]) * (i - 1) / Math.max(1, o.n - 1);
              T.P[i].lerp(T.R[i], k);
            }
            for (let it = 0; it < 2; it++) for (let i = 1; i <= o.n; i++) {   // giữ đúng độ dài từng đoạn (hạt gốc khối lượng vô hạn)
              _stA.copy(T.P[i]).sub(T.P[i - 1]); const L = _stA.length() || 1e-6, c = (L - segW) / L;
              if (i === 1) T.P[i].addScaledVector(_stA, -c); else { T.P[i].addScaledVector(_stA, -c * 0.5); T.P[i - 1].addScaledVector(_stA, c * 0.5); }
            }
          }
          for (let i = 0; i < o.n; i++) {   // vẽ: mỗi đoạn là hộp nối 2 hạt (về hệ cục bộ của thân)
            const m = T.segs[i]; T.host.worldToLocal(_stA.copy(T.P[i])); T.host.worldToLocal(_stB.copy(T.P[i + 1]));
            m.position.copy(_stA).add(_stB).multiplyScalar(0.5); _stD.copy(_stB).sub(_stA).normalize(); m.quaternion.setFromUnitVectors(_stX, _stD);
          }
        }
        const dogTail = makeSoftTail(dogObj, { base: new THREE.Vector3(-0.26 * 1.1, 0.17 * 1.1, 0), dir: new THREE.Vector3(-Math.cos(0.5), Math.sin(0.5), 0), n: 4, len: 0.055 * 1.1, w: 0.06 * 1.1, mat: dogObj.userData.tail.material, stiff: [0.22, 0.07] });
        dogObj.userData.tail.visible = false;   // đuôi cứng cũ chỉ còn giữ "lệnh vẫy" (rotation.y) cho đuôi mềm đọc
        let dogGaitPh = 0; const _dogPrev = new THREE.Vector3().copy(dogObj.position);   // nhịp chân chó theo QUÃNG ĐƯỜNG (1 chu kỳ = 0,36 đv) → chân không trượt

        // ---- Chú gấu mèo Raccoon voxel chạy lung tung rồi chui vào khúc gỗ ----
        function createRaccoon(s) {
          const rc = new THREE.Group();
          const furGrey = new THREE.MeshLambertMaterial({ color: 0x8f939a, flatShading: true });
          const furDark = new THREE.MeshLambertMaterial({ color: 0x2d2f33, flatShading: true });
          const furWhite = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, flatShading: true });

          // Thân (Body)
          const body = bx(0.46 * s, 0.2 * s, 0.26 * s, furGrey, true, true, lineDark);
          body.position.set(0, 0.1 * s, 0); rc.add(body);

          // Đầu (Head)
          const headGroup = new THREE.Group();
          headGroup.position.set(0.22 * s, 0.16 * s, 0);
          const head = bx(0.18 * s, 0.16 * s, 0.2 * s, furGrey, true, true, lineDark); headGroup.add(head);

          // Mặt nạ đen quanh mắt (Mask)
          const maskL = bx(0.02 * s, 0.08 * s, 0.07 * s, furDark, false, false); maskL.position.set(0.091 * s, -0.01 * s, 0.05 * s);
          const maskR = bx(0.02 * s, 0.08 * s, 0.07 * s, furDark, false, false); maskR.position.set(0.091 * s, -0.01 * s, -0.05 * s);
          headGroup.add(maskL, maskR);

          // Mõm (Muzzle) & Mũi (Nose)
          const muzzle = bx(0.07 * s, 0.07 * s, 0.09 * s, furWhite, true, false); muzzle.position.set(0.11 * s, -0.03 * s, 0);
          const nose = bx(0.035 * s, 0.035 * s, 0.035 * s, furDark, false, false); nose.position.set(0.135 * s, -0.01 * s, 0);
          headGroup.add(muzzle, nose);

          // Tai viền trắng (Ears)
          for (const sz of [-1, 1]) {
            const ear = bx(0.03 * s, 0.07 * s, 0.05 * s, furWhite, true, false);
            ear.position.set(-0.03 * s, 0.1 * s, sz * 0.08 * s); ear.rotation.y = sz * 0.15;
            headGroup.add(ear);
          }
          rc.add(headGroup);

          // Bốn chân thon đen (Legs & Paws)
          const legs = [];
          for (const sx of [-0.14, 0.14]) {
            for (const sz of [-0.09, 0.09]) {
              const leg = bx(0.07 * s, 0.12 * s, 0.07 * s, furGrey, true, false);
              leg.position.set(sx * s, -0.03 * s, sz * s);
              const foot = bx(0.08 * s, 0.03 * s, 0.08 * s, furDark, false, false);
              foot.position.y = -0.07 * s; leg.add(foot);
              rc.add(leg);
              legs.push(leg);
            }
          }

          // Đuôi sọc xám đen cong lên siêu đặc trưng (Striped Tail)
          const tail = new THREE.Group();
          tail.position.set(-0.22 * s, 0.14 * s, 0); tail.rotation.z = 0.65;
          const segLen = 0.1 * s;
          for (let i = 0; i < 5; i++) {
            const segMat = (i % 2 === 0) ? furDark : furGrey;
            const seg = bx(segLen, 0.11 * s, 0.11 * s, segMat, true, false);
            seg.position.set(-i * segLen, 0, 0); tail.add(seg);
          }
          rc.add(tail);

          rc.userData = { legs, tail, headGroup };
          return rc;
        }
        const raccoonObj = createRaccoon(0.99);
        raccoonObj.scale.multiplyScalar(NATURE_SCALE);
        raccoonObj.visible = false;
        scene.add(raccoonObj);
        // ---- toạ độ khúc gỗ + trạng thái gấu mèo (state machine thay đồng hồ t%360 cũ) ----
        const racMouth = { x: X0 + 102, y: 7.15, z: Z0 + 102 }, racInside = { x: X0 + 100, y: 7.55, z: Z0 + 108 };
        const racApproach = { x: X0 + 103, z: Z0 + 98 }, racHome = { x: X0 + 101, z: Z0 + 105 };
        const rac = { state: 'exit', tmr: 5, x: racInside.x, z: racInside.z, ang: 0, wob: 0, want: 0, stopTmr: 0, jumpTmr: 0, jumpCount: 0, wasChasing: false, roamState: 'walk', roamTmr: 3.0 };
        function racAvoidLog(px, pz) {   // đẩy 1 điểm ra khỏi trục khúc gỗ (bán kính 1.0) — trước đây logic này bị chép đôi 2 lần
          const k = 1 / Math.sqrt(40), dxd = 2 * k, dzd = -6 * k;
          const tp = THREE.MathUtils.clamp((px - racHome.x) * dxd + (pz - racHome.z) * dzd, -3.8, 3.8);
          const cx2 = racHome.x + tp * dxd, cz2 = racHome.z + tp * dzd;
          const ddx = px - cx2, ddz = pz - cz2, dd = Math.hypot(ddx, ddz);
          if (dd >= 1.0) return null;
          return [cx2 + ddx / (dd || 0.001), cz2 + ddz / (dd || 0.001)];
        }

        /* ===== FLOW FIELD (Dijkstra map / DP): bảng khoảng-cách-BFS tới từng ĐÍCH CỐ ĐỊNH trên lưới voxel.
           Địa hình tĩnh → tabulate 1 LẦN lúc build (memoization); mỗi frame agent chỉ đọc gradient 8 ô quanh mình
           rồi bước xuống dốc → tự luồn lách qua vật cản theo đường ngắn nhất, không còn kẹt loop.
           Chỉ áp cho agent CÓ ĐÍCH (kỹ sư · gấu mèo); thú wander (bò · thỏ · cá · bướm) giữ né cục bộ như cũ. ===== */
        const FF_N = GX * GZ, ffBlocked = new Uint8Array(FF_N);
        for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) ffBlocked[i + j * GX] = (isWater(i, j) || padH(i, j) !== null) ? 1 : 0;
        for (const ob of obstacleCoords) {   // rasterize vòng tròn vật cản vào lưới cấm
          const rr = ob.r + 0.3, i0 = Math.max(0, Math.floor(x2gi(ob.x - rr))), i1 = Math.min(GX - 1, Math.ceil(x2gi(ob.x + rr)));
          const j0 = Math.max(0, Math.floor(z2gj(ob.z - rr))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(ob.z + rr)));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (Math.hypot(wx(i) - ob.x, wz(j) - ob.z) < rr) ffBlocked[i + j * GX] = 1;
        }
        { const r = cowHutRect, i0 = Math.max(0, Math.floor(x2gi(r.x0))), i1 = Math.min(GX - 1, Math.ceil(x2gi(r.x1))), j0 = Math.max(0, Math.floor(z2gj(r.z0))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(r.z1)));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) ffBlocked[i + j * GX] = 1; }   // chuồng bò: không ai đi xuyên vách (bò vào ô đi thẳng từ cửa)
        function buildFlowField(tx, tz, blocked = ffBlocked) {   // BFS 8 hướng loang từ đích: dist[ô] = số bước ngắn nhất tới đích (65535 = không tới được)
          const dist = new Uint16Array(FF_N).fill(65535), q = new Int32Array(FF_N); let qh = 0, qt = 0;
          let unblockR = 0.9;   // quanh đích luôn mở 1 vòng nhỏ (đích có thể nằm trong vòng cấm của chính nó, vd cột khí tượng)
          for (const ob of obstacleCoords) { const d = Math.hypot(tx - ob.x, tz - ob.z); if (d < ob.r + 0.3) unblockR = Math.max(unblockR, ob.r + 0.45); }
          const s0 = Math.round(x2gi(tx)) + Math.round(z2gj(tz)) * GX; dist[s0] = 0; q[qt++] = s0;
          while (qh < qt) {
            const c = q[qh++], ci = c % GX, cj = (c / GX) | 0, dc = dist[c] + 1;
            for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
              if (!di && !dj) continue;
              const ni = ci + di, nj = cj + dj;
              if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue;
              const n = ni + nj * GX;
              if (dist[n] !== 65535) continue;
              if (blocked[n] && Math.hypot(wx(ni) - tx, wz(nj) - tz) > unblockR) continue;
              dist[n] = dc; q[qt++] = n;
            }
          }
          return dist;
        }
        const _ffV = new THREE.Vector3();
        function ffDir(field, x, z) {   // gradient dốc-xuống của bảng DP tại (x,z): so 8 ô quanh mình, cộng vector về các ô rẻ hơn
          const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z));
          if (gi < 1 || gj < 1 || gi >= GX - 1 || gj >= GZ - 1) return null;
          const here = field[gi + gj * GX];
          if (here >= 65535) {   // lỡ cắt góc vào ô cấm (hoặc đang đứng trong chuồng): hướng về ô đi được gần nhất có giá rẻ nhất
            let best = 65535, bi = 0, bj = 0;
            for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const ni = gi + di, nj = gj + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue; const v = field[ni + nj * GX]; if (v < best) { best = v; bi = di; bj = dj; } }
            if (best >= 65535) return null; const L = Math.hypot(bi, bj); return _ffV.set(bi / L, 0, bj / L);
          }
          let vx = 0, vz = 0;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            if (!di && !dj) continue;
            const d = field[(gi + di) + (gj + dj) * GX];
            if (d >= here) continue;
            const w = (here - d) / Math.hypot(di, dj);
            vx += di * w; vz += dj * w;
          }
          const L = Math.hypot(vx, vz); if (L < 1e-4) return null;
          return _ffV.set(vx / L, 0, vz / L);
        }
