        // ---- CHÓ (G 13/10: "research and improve dog behaviour and movement") — mô hình khớp thật (toạ độ cục bộ: +x mũi, +y lên, ±z hai bên):
        //      thân = khung ngực + hông trên khớp THÂN (cao, chúc/ngóc quanh trục ngang) · CỔ (ngẩng/cúi, quay) → đầu, mõm, mũi, mắt, 2 TAI cụp (lò xo) ·
        //      4 chân 2 đoạn (vai/hông → khuỷu/gối → bàn chân): chân trước khớp gập chĩa RA SAU (khuỷu), chân sau chĩa RA TRƯỚC (gối) như chó thật;
        //      bàn chân giữ phẳng. Toàn bộ dáng (đứng · ngồi · nằm sấp · cúi chào vươn vai · đánh hơi) do animals/dog-brain.js đặt bằng IK bàn chân ----
        function dogModel(s) {
          const g = new THREE.Group();
          const fur = new THREE.MeshLambertMaterial({ color: 0xc19a6b }), furL = new THREE.MeshLambertMaterial({ color: 0xe0c49a }), dark = new THREE.MeshLambertMaterial({ color: 0x4a3621 }), black = new THREE.MeshLambertMaterial({ color: 0x111111 });
          const torso = new THREE.Group(); torso.position.y = 0.32 * s; g.add(torso);
          const chest = bx(0.27 * s, 0.22 * s, 0.25 * s, fur, true, true, lineDark); chest.position.x = 0.1 * s; torso.add(chest);
          const rear = bx(0.29 * s, 0.2 * s, 0.23 * s, fur, true, true, lineDark); rear.position.set(-0.14 * s, 0.005 * s, 0); torso.add(rear);
          const belly = bx(0.4 * s, 0.04 * s, 0.18 * s, furL, false, false); belly.position.set(-0.01 * s, -0.1 * s, 0); torso.add(belly);
          const neck = new THREE.Group(); neck.position.set(0.21 * s, 0.07 * s, 0); torso.add(neck);
          const neckM = bx(0.12 * s, 0.15 * s, 0.13 * s, fur, true, false); neckM.position.set(0.03 * s, 0.05 * s, 0); neckM.rotation.z = -0.35; neck.add(neckM);
          const head = new THREE.Group(); head.position.set(0.08 * s, 0.13 * s, 0); neck.add(head);
          const skull = bx(0.2 * s, 0.19 * s, 0.2 * s, fur, true, true, lineDark); head.add(skull);
          const snout = bx(0.13 * s, 0.1 * s, 0.12 * s, furL, true, true, lineDark); snout.position.set(0.15 * s, -0.04 * s, 0); head.add(snout);
          const nose = bx(0.04 * s, 0.04 * s, 0.05 * s, black, false, false); nose.position.set(0.22 * s, -0.02 * s, 0); head.add(nose);
          const eyes = [];   // mắt: scale.y = độ mở (chớp, nhắm khi ngủ — animals/dog-brain.js)
          for (const sz of [-1, 1]) { const eye = bx(0.015 * s, 0.03 * s, 0.03 * s, black, false, false); eye.position.set(0.1 * s, 0.03 * s, sz * 0.055 * s); head.add(eye); eyes.push(eye); }
          const tongue = bx(0.06 * s, 0.012 * s, 0.045 * s, new THREE.MeshLambertMaterial({ color: 0xd9788a }), false, false); tongue.position.set(0.2 * s, -0.085 * s, 0); tongue.visible = false; head.add(tongue);   // lưỡi: liếm mép
          const ears = [];
          for (const sz of [-1, 1]) { const ep = new THREE.Group(); ep.position.set(-0.02 * s, 0.09 * s, sz * 0.1 * s); head.add(ep); const ear = bx(0.07 * s, 0.14 * s, 0.035 * s, dark, true, false); ear.position.y = -0.06 * s; ep.add(ear); ears.push(ep); }
          const legs = [];   // thứ tự: trước-trái, trước-phải, sau-trái, sau-phải (trái = +z)
          for (const [fx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const hip = new THREE.Group(); hip.position.set(fx > 0 ? 0.17 * s : -0.2 * s, -0.08 * s, sz * 0.09 * s); torso.add(hip);
            const up = bx(0.075 * s, 0.13 * s, 0.075 * s, fur, true, false); up.position.y = -0.06 * s; hip.add(up);
            const knee = new THREE.Group(); knee.position.y = -0.12 * s; hip.add(knee);
            const lo = bx(0.06 * s, 0.11 * s, 0.06 * s, fur, true, false); lo.position.y = -0.05 * s; knee.add(lo);
            const pawG = new THREE.Group(); pawG.position.y = -0.105 * s; knee.add(pawG);
            const paw = bx(0.09 * s, 0.035 * s, 0.07 * s, furL, true, false); paw.position.x = 0.015 * s; pawG.add(paw);
            legs.push({ hip, knee, paw: pawG, front: fx > 0, side: sz });
          }
          const tail = bx(0.18 * s, 0.06 * s, 0.06 * s, dark, true, false); tail.position.set(-0.3 * s, 0.08 * s, 0); tail.visible = false; torso.add(tail);   // giữ "lệnh vẫy" (rotation.y) cho đuôi mềm đọc
          g.userData = { torso, neck, head, ears, eyes, tongue, legs, tail, body: chest, s, L1: 0.12 * s, L2: 0.1225 * s, H0: 0.32 * s };
          return g;
        }
        const dogObj = dogModel(1.1); dogObj.scale.multiplyScalar(CAMP_SCALE * 1.1); dogObj.name = 'Chó (Dog)';
        const dogP = worldCell(FIRE_CELL[0], FIRE_CELL[1]).add(new THREE.Vector3(0.9, 0, 0.3));
        dogObj.position.copy(dogP); dogObj.rotation.y = Math.atan2(-0.3, -0.9); scene.add(dogObj);
        // ---- ĐUÔI MỀM = chuỗi hạt XPBD (vật lý dựa trên vị trí, tích phân Verlet): hạt gốc gắn thân; ràng buộc ĐỘ DÀI đoạn (cứng) và lực kéo mềm
        //      về DÁNG NGHỈ (mềm dần từ gốc ra ngọn) ⇒ đuôi có quán tính thật: chạy thì bị kéo về sau, dừng/quay thì vung theo, vẫy thành sóng
        //      từ gốc ra ngọn, gió thổi lệch nhẹ. Bước cố định 240 Hz + vẽ nội suy; nhảy vị trí xa (dịch chuyển tức thời) thì đặt lại về dáng nghỉ ----
        const _stA = new THREE.Vector3(), _stB = new THREE.Vector3(), _stD = new THREE.Vector3(), _stX = new THREE.Vector3(1, 0, 0), _stW = new THREE.Vector3(), _stE = new THREE.Euler();
        function makeSoftTail(host, o) {   // o: base (cục bộ), dir (hướng nghỉ cục bộ, đơn vị), n đoạn, len (dài mỗi đoạn, cục bộ), w (bề dày), mat, stiff [gốc, ngọn]
          const segs = [], P = [], Q = [], R = [];
          for (let i = 0; i < o.n; i++) { const k = 1 - 0.35 * i / o.n, m = bx(o.len * 1.2, o.w * k, o.w * k, o.mat, true, false); m.castShadow = true; host.add(m); segs.push(m); }
          for (let i = 0; i <= o.n; i++) { P.push(new THREE.Vector3()); Q.push(new THREE.Vector3()); R.push(new THREE.Vector3()); }
          return { host, o, segs, P, Q, R, init: false, last: new THREE.Vector3() };
        }
        function updateSoftTail(T, dt, wag, curl) {
          const o = T.o, M = T.host.matrixWorld; T.host.updateMatrixWorld(true);
          const S = new THREE.Vector3().setFromMatrixScale(M).x, segW = o.len * S;
          for (let i = 0; i <= o.n; i++) {   // dáng nghỉ (thế giới): hướng nghỉ quay theo lệnh vẫy (quanh trục đứng) + cuộn dần về một bên khi ngủ
            _stE.set(0, wag + curl * 0.45 * i, -curl * 0.35 * i * 0.5); _stD.copy(o.dir).applyEuler(_stE);
            if (i === 0) T.R[0].copy(o.base); else T.R[i].copy(T.R[i - 1]).sub(T.R[0]).add(o.base).addScaledVector(_stD, o.len);
          }
          for (let i = 0; i <= o.n; i++) T.R[i].applyMatrix4(M);
          if (!T.init || T.R[0].distanceTo(T.last) > 0.8) { for (let i = 0; i <= o.n; i++) { T.P[i].copy(T.R[i]); T.Q[i].copy(T.R[i]); } T.init = true; }
          T.last.copy(T.R[0]);
          windAt(T.R[0].x, T.R[0].y, T.R[0].z, 0.4, _stW);
          const al = fixedSteps(T, dt, 1 / 240, (h) => {   // bước cố định 240 Hz (core/fixed-step.js) = đúng nhịp cũ ở 60 hình/giây × 4 bước con, giờ như nhau ở mọi tốc độ khung
            if (T.kick) { for (let i = 1; i <= o.n; i++) T.Q[i].addScaledVector(T.kick, -h * i / o.n); T.kick = null; }   // cú hất (vd bò phẩy ruồi): cộng vận tốc, ngọn nhiều hơn gốc
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
          });
          for (let i = 0; i < o.n; i++) {   // vẽ: hạt nội suy bước trước (Q) → bước mới (P); mỗi đoạn là hộp nối 2 hạt (về hệ cục bộ của thân)
            const m = T.segs[i]; T.host.worldToLocal(i ? _stA.copy(T.Q[i]).lerp(T.P[i], al) : _stA.copy(T.P[0])); T.host.worldToLocal(_stB.copy(T.Q[i + 1]).lerp(T.P[i + 1], al));
            m.position.copy(_stA).add(_stB).multiplyScalar(0.5); _stD.copy(_stB).sub(_stA).normalize(); m.quaternion.setFromUnitVectors(_stX, _stD);
          }
        }
        const dogTail = makeSoftTail(dogObj.userData.torso, { base: new THREE.Vector3(-0.28 * 1.1, 0.07 * 1.1, 0), dir: new THREE.Vector3(-Math.cos(0.5), Math.sin(0.5), 0), n: 4, len: 0.055 * 1.1, w: 0.06 * 1.1, mat: dogObj.userData.tail.material, stiff: [0.22, 0.07] });

        // ---- Chú gấu mèo Raccoon voxel chạy lung tung rồi chui vào khúc gỗ ----
        // ---- GẤU MÈO (Procyon lotor) — hình thái: chân sau dài hơn chân trước ⇒ mông cao, lưng gù; đi bằng cả bàn chân (bàn chân sau dài, đen);
        //      tay trước 5 ngón rất khéo; mặt nạ đen quanh mắt + lông mày trắng, mõm trắng, tai viền trắng; đuôi rậm 5–7 khoanh đen–xám buông THẤP
        //      (không cong vểnh). Khớp như chó (thân · cổ · 4 chân 2 đoạn) để dùng chung bộ chân IK; mắt phản quang ban đêm (lớp tapetum lucidum) ----
        //  G 15/10 "study and improve racoon" — hình khối theo mẫu "Low-poly Racoon Run Animation" (avatrass, Sketchfab, CC-BY-4.0; chỉ đo): thân tròn khối
        //  gù (mông to + cao hơn ngực), đầu tròn mõm nhọn trắng, mặt nạ đen quanh mắt + mày trắng, tai tròn viền trắng, cẳng + bàn chân sẫm ("găng tay"),
        //  đuôi rậm 7 khoanh ngọn đen. Chạy kiểu phi nhảy: lưng cong lại khi gom 4 chân, duỗi ra khi vươn (gập cột sống ở ngực ↔ mông).
        function createRaccoon(s) {
          const rc = new THREE.Group();
          const grey = new THREE.MeshLambertMaterial({ color: 0x8f939a, flatShading: true }), greyD = new THREE.MeshLambertMaterial({ color: 0x5c6068, flatShading: true });
          const dark = new THREE.MeshLambertMaterial({ color: 0x2d2f33, flatShading: true }), white = new THREE.MeshLambertMaterial({ color: 0xe2d6c0, flatShading: true });
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), C = new THREE.Color();
          const blob = (rx, ry, rz, f, w = 9, h = 7) => { const geo = new THREE.SphereGeometry(1, w, h); geo.scale(rx * s, ry * s, rz * s); const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { C.setHex(f(p.getX(i) / s, p.getY(i) / s, p.getZ(i) / s)); c.push(C.r, C.g, C.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); const m = new THREE.Mesh(geo, vc); m.castShadow = true; return m; };
          const fur = (x, y) => y > 0.05 ? 0x6c7077 : y < -0.04 ? 0xb4b4ae : 0x8f939a;   // lưng sẫm hoa râm · sườn xám · bụng nhạt
          const torso = new THREE.Group(); torso.position.y = 0.2 * s; rc.add(torso);
          const fore = new THREE.Group(), aft = new THREE.Group(); fore.position.y = aft.position.y = 0.02 * s; torso.add(fore, aft);   // 2 nửa thân gập quanh giữa lưng
          const chest = blob(0.12, 0.092, 0.105, fur); chest.position.set(0.09 * s, -0.025 * s, 0); fore.add(chest);
          const rump = blob(0.155, 0.125, 0.13, fur); rump.position.set(-0.1 * s, 0.005 * s, 0); aft.add(rump);   // mông to + cao ⇒ lưng gù
          const neck = new THREE.Group(); neck.position.set(0.18 * s, 0.03 * s, 0); torso.add(neck);
          const head = new THREE.Group(); head.position.set(0.07 * s, 0.05 * s, 0); neck.add(head);
          head.add(blob(0.072, 0.062, 0.078, (x, y) => y > 0.035 ? 0x7a7e85 : 0x9a9ea4));   // sọ tròn
          const mz = new THREE.Mesh(new THREE.ConeGeometry(0.038 * s, 0.085 * s, 7), white); mz.rotation.z = -Math.PI / 2; mz.position.set(0.09 * s, -0.022 * s, 0); head.add(mz);   // mõm nhọn trắng
          const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014 * s, 6, 5), dark); nose.position.set(0.133 * s, -0.022 * s, 0); head.add(nose);
          for (const sz of [-1, 1]) {
            const mask = blob(0.026, 0.02, 0.034, () => 0x26282c, 7, 5); mask.position.set(0.052 * s, 0.006 * s, sz * 0.036 * s); mask.rotation.y = sz * 0.5; head.add(mask);   // mặt nạ đen quanh mắt
            const brow = blob(0.02, 0.008, 0.03, () => 0xeee6d6, 6, 4); brow.position.set(0.05 * s, 0.032 * s, sz * 0.034 * s); head.add(brow);   // mày trắng
            const cheek = blob(0.03, 0.022, 0.026, () => 0xe2d6c0, 6, 4); cheek.position.set(0.045 * s, -0.03 * s, sz * 0.045 * s); head.add(cheek);   // má trắng
          }
          const eyeM = new THREE.MeshBasicMaterial({ color: 0xd9f2a2 }), eyes = [];   // mắt phản quang (chỉ hiện khi trời tối)
          for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.011 * s, 6, 4), eyeM); e.position.set(0.075 * s, 0.008 * s, sz * 0.038 * s); e.visible = false; head.add(e); eyes.push(e); }
          const ears = [];
          for (const sz of [-1, 1]) {
            const ep = new THREE.Group(); ep.position.set(-0.025 * s, 0.055 * s, sz * 0.05 * s); head.add(ep);
            const rim = new THREE.Mesh(new THREE.ConeGeometry(0.03 * s, 0.05 * s, 6), white); rim.position.y = 0.022 * s; ep.add(rim);   // viền tai trắng
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.024 * s, 0.044 * s, 6), greyD); ear.position.set(-0.006 * s, 0.022 * s, 0); ep.add(ear);
            ep.rotation.x = -sz * 0.22; ears.push(ep);
          }
          const legs = [];   // trước-T, trước-P, sau-T, sau-P (trái = +z) · chân trước ngắn (0,08 + 0,075), chân sau dài (0,1 + 0,1)
          for (const [fx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const fr = fx > 0, l1 = (fr ? 0.08 : 0.1) * s, l2 = (fr ? 0.075 : 0.1) * s;
            const hip = new THREE.Group(); hip.position.set(fr ? 0.12 * s : -0.15 * s, fr ? -0.06 * s : -0.04 * s, sz * (fr ? 0.075 : 0.085) * s); torso.add(hip);
            const up = new THREE.Mesh(new THREE.CylinderGeometry((fr ? 0.026 : 0.034) * s, (fr ? 0.034 : 0.044) * s, l1 * 1.15, 7), grey); up.position.y = -l1 / 2; up.castShadow = true; hip.add(up);   // đùi / cánh tay to ở gốc
            const knee = new THREE.Group(); knee.position.y = -l1; hip.add(knee);
            const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * s, 0.024 * s, l2 * 0.95, 6), greyD); lo.position.y = -l2 * 0.45; lo.castShadow = true; knee.add(lo);   // cẳng sẫm
            const pawG = new THREE.Group(); pawG.position.y = -l2 + 0.012 * s; knee.add(pawG);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 4, 0, TAU, 0, Math.PI / 2), dark); paw.scale.set((fr ? 0.034 : 0.055) * s, 0.02 * s, 0.03 * s); paw.position.set((fr ? 0.012 : 0.028) * s, -0.012 * s, 0); pawG.add(paw);   // bàn đen, chân sau dài (đi cả bàn)
            legs.push({ hip, knee, paw: pawG, front: fr, side: sz, L1: l1, L2: l2 });
          }
          const tailHost = new THREE.Group(); tailHost.position.set(-0.22 * s, 0.05 * s, 0); torso.add(tailHost);
          rc.userData = { torso, fore, aft, neck, head, headGroup: head, ears, eyes, legs, tailHost, ringA: dark, ringB: grey, s, H0: 0.2 * s };
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
        function buildFlowField(tx, tz, blocked = ffBlocked, unR) {   // BFS 8 hướng loang từ đích: dist[ô] = số bước ngắn nhất tới đích (65535 = không tới được)
          const dist = new Uint16Array(FF_N).fill(65535), q = new Int32Array(FF_N); let qh = 0, qt = 0;
          let unblockR = unR ?? 0.9;   // quanh đích luôn mở 1 vòng nhỏ (đích có thể nằm trong vòng cấm của chính nó, vd cột khí tượng) · unR: lưới cấm dựng từ va chạm thật thì chỉ mở vòng nhỏ
          if (unR === undefined) for (const ob of obstacleCoords) { const d = Math.hypot(tx - ob.x, tz - ob.z); if (d < ob.r + 0.3) unblockR = Math.max(unblockR, ob.r + 0.45); }
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
          if (here >= 65535) {   // lỡ cắt góc vào ô cấm (hoặc đang đứng trong chuồng): hướng về ô đi được gần nhất có giá rẻ nhất — ô KỀ trước (vòng 2 chỉ khi
            // quanh mình không còn ô nào đi được): trước đây lấy ô rẻ nhất trong 5×5 ⇒ chó kẹt sát lò chiminea bị chỉ thẳng qua đống củi sang ô rẻ phía sau, xoay mãi
            let best = 65535, bi = 0, bj = 0;
            for (let rr = 1; rr <= 2 && best >= 65535; rr++) for (let dj = -rr; dj <= rr; dj++) for (let di = -rr; di <= rr; di++) { const ni = gi + di, nj = gj + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue; const v = field[ni + nj * GX]; if (v < best) { best = v; bi = di; bj = dj; } }
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
