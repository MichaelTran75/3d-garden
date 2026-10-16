        // ===== DRONE ĐỒ CHƠI CỦA KỸ SƯ (G 17/10; GLB "Drone" — Kira, CC-BY-4.0 — chỉ đo dáng: drone gập cánh ~249 g kiểu DJI Mini, thân xám thuôn,
        //  4 càng gập, cánh quạt 2 lá, càng đáp dưới 2 mô-tơ trước, gimbal camera dưới mũi) =====
        //  Nghiên cứu cách điều khiển (tay cầm Mode 2 — mặc định phổ biến): cần TRÁI = ga (đẩy lên: lên cao) + xoay đầu (yaw); cần PHẢI = tới / lui
        //  (pitch) + nghiêng trái / phải (roll). Quy trình: đặt drone trên nền phẳng, MỞ CÀNG (2 càng trước xoè ra trước, 2 càng sau xoay ra sau), bật drone
        //  (đèn nháy) rồi tay cầm, chờ định vị vệ tinh + ghi ĐIỂM NHÀ; khởi động mô-tơ bằng gạt 2 cần chụm xuống-vào (CSC) → cánh quạt quay không tải;
        //  đẩy ga: cất cánh treo ~1,2 m rồi bay. Khi bay: drone NGHIÊNG theo gia tốc (tới thì chúi mũi, sang ngang thì nghiêng cánh), có gió thì nghiêng vào gió
        //  để đứng yên, gimbal giữ camera thăng bằng (chỉ đổi góc ngẩng / cúi); tầm mắt — người điều khiển đứng yên, 2 tay giữ tay cầm trước ngực, ngón cái
        //  trên 2 cần, mắt dõi theo drone, thỉnh thoảng cúi xem màn hình điện thoại kẹp trên tay cầm. Hạ cánh: về điểm nhà, xuống 1,2 m, kéo ga xuống tới
        //  khi chạm đất, giữ thêm 2 s → mô-tơ tắt. Không bay khi mưa hay gió > 9 m/s (giới hạn của loại drone 249 g ~10,7 m/s).
        //  Lịch: 15:20 lấy drone + tay cầm trên bàn trà → ra bãi cỏ trống (bãi chó chạy vòng) → đặt, mở càng → lùi 2,8 m → cất cánh → khảo sát: đầm sen →
        //  bay ngang cánh đồng pin (camera chúc thẳng xuống) → đập thủy điện → vòng quanh tua-bin #3 → chuồng bò → về hạ cánh → gập càng → cất về bàn.
        //  Màn hình camera (FPV) hiện trong BONG BÓNG SUY NGHĨ trên đầu, cỡ 2× màn laptop: ảnh dựng từ camera trên gimbal (288 × 186, 10 hình/giây — điện thoại 6 — khi bong
        //  bóng trên màn hình; dùng lại bóng đổ của khung chính) + lớp chữ OSD (REC, pin, vệ tinh, độ cao H, khoảng cách D, tốc độ). Điện thoại trên tay
        //  cầm cũng chiếu cùng ảnh đó ----
        const droneToy = (() => {
          const S = 1.3;   // cỡ đồ chơi: thật × 1,3 (nhân vật kiểu LEGO to tay)
          const grey = new THREE.MeshPhongMaterial({ color: 0x8e9399, specular: 0x555555, shininess: 55 }), dark = new THREE.MeshLambertMaterial({ color: 0x2a2c30 }), black = new THREE.MeshLambertMaterial({ color: 0x141518 });
          const chrome = new THREE.MeshPhongMaterial({ color: 0xd9dbe0, specular: 0xffffff, shininess: 120 }), lensM = new THREE.MeshPhongMaterial({ color: 0x0b1428, specular: 0xffffff, shininess: 180 });
          const B = (w, h, d, m, x, y, z, par) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
          const C = (r1, r2, h, m, x, y, z, par, n = 12) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, n), m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
          // ---- drone (mũi +z, gốc ở đáy càng) ----
          const g = new THREE.Group(); g.name = 'Drone đồ chơi'; g.scale.setScalar(S);
          const core = new THREE.Group(); core.position.y = 0.035; g.add(core);   // thân nghiêng theo gia tốc quanh tâm này
          B(0.075, 0.042, 0.12, grey, 0, 0, 0, core); B(0.062, 0.016, 0.1, grey, 0, 0.026, -0.005, core);                 // thân + nắp trên
          const nose = B(0.06, 0.034, 0.035, grey, 0, -0.002, 0.07, core); nose.rotation.x = 0.28;                         // mũi vát
          B(0.066, 0.036, 0.04, dark, 0, 0.002, -0.07, core);                                                                // pin sau
          const gim = new THREE.Group(); gim.position.set(0, -0.026, 0.078); core.add(gim);                                // gimbal (ngẩng / cúi)
          B(0.03, 0.026, 0.026, black, 0, -0.006, 0.004, gim); const lens = C(0.0085, 0.0085, 0.008, lensM, 0, -0.006, 0.019, gim, 14); lens.rotation.x = Math.PI / 2;
          const fpv = new THREE.PerspectiveCamera(48, MBP.CW / MBP.CH, 0.1, 900); fpv.position.set(0, -0.006, 0.03); fpv.rotation.y = Math.PI; gim.add(fpv);
          const arms = [], props = [], blurs = [], leds = [];
          const propGeo = new THREE.BoxGeometry(0.062, 0.0025, 0.013), blurM = new THREE.MeshBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
          for (const [sx, front] of [[1, 1], [-1, 1], [1, 0], [-1, 0]]) {
            const piv = new THREE.Group(); piv.position.set(sx * 0.034, front ? 0.004 : -0.01, front ? 0.04 : -0.045); core.add(piv);
            const L = front ? 0.088 : 0.094, arm = B(0.012, 0.01, L, grey, 0, 0, L / 2, piv);
            const tip = new THREE.Group(); tip.position.z = L; piv.add(tip);
            C(0.013, 0.013, 0.018, dark, 0, 0.006, 0, tip); C(0.011, 0.012, 0.005, chrome, 0, 0.017, 0, tip);              // mô-tơ + nắp mạ
            if (front) { B(0.005, 0.034, 0.005, grey, 0, -0.02, 0.004, tip); const led = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 4), new THREE.MeshBasicMaterial({ color: 0x40ff60 })); led.position.set(0, -0.004, 0.012); tip.add(led); leds.push(led); }
            const pr = new THREE.Group(); pr.position.y = 0.021; tip.add(pr);
            for (const k of [0, 1]) { const bl = new THREE.Mesh(propGeo, black); bl.position.x = (k ? -1 : 1) * 0.031; bl.rotation.x = (k ? -1 : 1) * 0.12; pr.add(bl); }
            const bd = new THREE.Mesh(new THREE.CircleGeometry(0.066, 20), blurM); bd.rotation.x = -Math.PI / 2; bd.position.y = 0.022; tip.add(bd);
            arms.push({ piv, front, sx, open: front ? sx * 0.62 : Math.PI - sx * 0.62, fold: front ? sx * 2.75 : sx * 0.3 }); props.push(pr); blurs.push(bd);
          }
          const tail = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffb030 })); tail.position.set(0, 0.012, -0.091); core.add(tail);
          g.traverse(o => { o.userData.noBatch = true; }); scene.add(g);
          // ---- tay cầm (cần trái / phải, điện thoại kẹp trên chiếu ảnh camera) — gốc ở giữa thân ----
          const rc = new THREE.Group(); rc.name = 'Tay cầm điều khiển drone'; rc.scale.setScalar(S * 1.15);
          B(0.15, 0.03, 0.085, dark, 0, 0, 0, rc); for (const sx of [-1, 1]) { const gp = C(0.019, 0.017, 0.075, dark, sx * 0.068, -0.012, -0.028, rc); gp.rotation.x = 0.9; }
          const sticks = [];
          for (const sx of [-1, 1]) { const pv = new THREE.Group(); pv.position.set(sx * 0.042, 0.016, 0.004); rc.add(pv); C(0.0035, 0.0035, 0.016, black, 0, 0.008, 0, pv, 6); C(0.009, 0.008, 0.005, black, 0, 0.017, 0, pv, 10); sticks.push(pv); }
          const clamp = B(0.07, 0.07, 0.012, dark, 0, 0.04, -0.038, rc); clamp.rotation.x = -0.35;
          const phone = new THREE.Group(); phone.position.set(0, 0.085, -0.052); phone.rotation.set(0.35, Math.PI, 0); rc.add(phone);   // màn điện thoại quay về người cầm (−z)
          B(0.152, 0.074, 0.008, black, 0, 0, 0, phone);
          const rt = new THREE.WebGLRenderTarget(288, 186, { depthBuffer: true }); rt.texture.name = 'Ảnh camera drone';
          const phoneM = new THREE.MeshBasicMaterial({ map: rt.texture, color: 0x000000 }), phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(0.142, 0.066), phoneM); phoneScr.position.z = 0.0045; phone.add(phoneScr);
          rc.traverse(o => { o.userData.noBatch = true; }); scene.add(rc);
          // ---- bong bóng suy nghĩ có màn hình camera: màn = 2 × màn laptop (đo theo thế giới lúc dựng) · mây trắng · 3 chấm nối xuống đầu ----
          const bub = new THREE.Group(); bub.name = 'Bong bóng màn hình drone'; bub.visible = false; scene.add(bub);
          const cloudC = document.createElement('canvas'); cloudC.width = 512; cloudC.height = 400;
          { const x = cloudC.getContext('2d'); x.fillStyle = '#fff'; x.strokeStyle = 'rgba(70,80,95,0.55)'; x.lineWidth = 6;
            const blobs = [[256, 200, 205, 150], [120, 150, 95, 80], [390, 145, 100, 82], [110, 270, 90, 75], [400, 268, 92, 74], [256, 70, 110, 60], [256, 335, 120, 58]];
            for (const pass of [0, 1]) for (const [bx2, by, rx, ry] of blobs) { x.beginPath(); x.ellipse(bx2, by, rx, ry, 0, 0, TAU); pass ? x.fill() : x.stroke(); } }
          const cloudT = new THREE.CanvasTexture(cloudC); cloudT.colorSpace = THREE.SRGBColorSpace;
          const osdC = document.createElement('canvas'); osdC.width = 512; osdC.height = 331; const ox = osdC.getContext('2d'), osdT = new THREE.CanvasTexture(osdC); osdT.colorSpace = THREE.SRGBColorSpace;
          const scrM = new THREE.MeshBasicMaterial({ map: rt.texture, depthWrite: false, depthTest: false, transparent: true }), cloudM = new THREE.MeshBasicMaterial({ map: cloudT, transparent: true, depthWrite: false, depthTest: false, opacity: 0.96 });
          const osdM = new THREE.MeshBasicMaterial({ map: osdT, transparent: true, depthWrite: false, depthTest: false });
          let SW = 0.7, SH = 0.45;
          const cloud = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cloudM), scr = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), scrM), osd = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), osdM);
          cloud.renderOrder = 990; scr.renderOrder = 991; osd.renderOrder = 992; bub.add(cloud, scr, osd);
          const dots = [0.07, 0.05, 0.034].map((r, i) => { const d = new THREE.Mesh(new THREE.CircleGeometry(r, 16), cloudM); d.renderOrder = 990; bub.add(d); return d; });
          function sizeBubble() {   // màn laptop thế giới: rộng MBP.SW × tỉ lệ laptop (bàn học × xe) ⇒ màn bong bóng gấp đôi
            const k = studyLaptop.group ? studyLaptop.group.getWorldScale(new THREE.Vector3()).x : 1; SW = 2 * MBP.SW * k; SH = 2 * MBP.SH * k;
            scr.scale.set(SW, SH, 1); osd.scale.set(SW, SH, 1); cloud.scale.set(SW * 1.5, SH * 1.75, 1);
          }
          // ---- trạng thái ----
          const D = { st: 'idle', k: 0, home: new THREE.Vector3(), stand: new THREE.Vector3(), table: new THREE.Vector3(), pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, gp: -0.3, wp: [], wi: 0,
            spin: 0, fold: 0, bat: 100, rec: 0, orbit: null, tilt: new THREE.Vector2(), stick: [0, 0, 0, 0], frame: 0, hold: null, lookDown: 0 };
          const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
          const tableSpot = () => { const t = scene.getObjectByName('Bàn trà (Camp Table)'); t.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(t); return new THREE.Vector3(b.min.x + 0.2, b.max.y + 0.005, (b.min.z + b.max.z) / 2 + 0.13); };   // đầu bàn phía tây (giữa bàn để chảo cơm tối, cốc)
          function park() {   // trên bàn trà: drone gập càng, tay cầm đặt cạnh
            const p = tableSpot(); D.table.copy(p);
            scene.add(g); g.position.copy(p); g.rotation.set(0, 0.6, 0); setFold(0); spinTo(0, 1);
            scene.add(rc); rc.position.set(p.x + 0.04, p.y + 0.02 * S, p.z - 0.33); rc.rotation.set(0, 1.35, 0); bub.visible = false; phoneM.color.setScalar(0);
          }
          function setFold(f) { D.fold = f; arms.forEach((a, i) => { a.piv.rotation.y = a.fold + (a.open - a.fold) * f; if (D.spin < 0.05) props[i].rotation.y = Math.PI / 2 * (1 - f); }); }   // gập: lá cánh xếp dọc càng
          function spinTo(w, dt) { D.spin += (w - D.spin) * Math.min(1, dt * 2.5); }
          const ground = (x, z) => cowY(x, z);
          function plan() {   // điểm khảo sát (toạ độ ghim + X0/Z0), độ cao tương đối điểm nhà, góc gimbal, kiểu (đi / vòng quanh / treo)
            const H = D.home, P = (x, z, alt, gp, o = {}) => Object.assign({ p: new THREE.Vector3(X0 + x, H.y + alt, Z0 + z), gp }, o);
            // cất cánh treo 1,2 m (tự động) → 12 m → đầm sen → cánh đồng pin (camera chúc thẳng) → đập (treo phía hạ lưu, nhìn ngược vào mặt tràn) → vòng tua-bin #3 ở 26 m (dưới tầm quét cánh thấp nhất ~32 m
            // trên bệ, cách trụ 24 m) → chuồng bò → về điểm nhà 14 m → xuống 1,2 m treo 2 s → hạ
            D.wp = [P(H.x - X0, H.z - Z0, 1.2, -0.2, { hover: 2, v: 1.5 }), P(H.x - X0, H.z - Z0, 12, -0.35, { hover: 1 }), P(73.8, 113, 12, -0.6, { look: [73.8, 114.7] }), P(118, 100, 30, -0.9), P(176, 100.5, 30, -1.5, { v: 4 }),
              P(150, 88, 32, -1.2), P(94, 93, 18, -0.42, { look: [93.3, 73.3], hover: 5 }), P(85.5, 25.3, 26, -0.15, { orbit: 24 }), P(54, 55, 18, -0.55, { look: [54, 49.1] }),
              P(H.x - X0, H.z - Z0, 14, -0.35, { hover: 1 }), P(H.x - X0, H.z - Z0, 1.2, -0.2, { hover: 2, v: 1.2 })];
            D.wi = 0;
          }
          function fly(dt, t) {   // bám điểm: vận tốc mong muốn → gia tốc giới hạn 3 m/s² → nghiêng thân theo gia tốc (+ nghiêng vào gió) · xoay đầu ≤ 1,2 rad/s
            const W = D.wp[D.wi]; if (!W) return true;
            // 4,5 m/s ~ chế độ quay phim (Cine) — quay khảo sát mượt
            const p = D.pos, vmax = W.v || 4.5; let tx = W.p.x, tz = W.p.z, ty = W.p.y, faceX = null, faceZ = null;
            if (W.orbit) {   // vòng quanh tâm (camera nhìn vào tâm), 1 vòng rồi đi tiếp
              const O = D.orbit || (D.orbit = { a: Math.atan2(p.z - W.p.z, p.x - W.p.x), n: 0 });
              const r = Math.hypot(p.x - W.p.x, p.z - W.p.z);
              if (Math.abs(r - W.orbit) < 3) { const da = (vmax * 0.8 / W.orbit) * dt; O.a += da; O.n += da; }
              tx = W.p.x + Math.cos(O.a) * W.orbit; tz = W.p.z + Math.sin(O.a) * W.orbit; faceX = W.p.x; faceZ = W.p.z;
              if (O.n > TAU) { D.orbit = null; D.wi++; }
            } else if (W.look) { faceX = X0 + W.look[0]; faceZ = Z0 + W.look[1]; }
            _v.set(tx - p.x, ty - p.y, tz - p.z); const dist = _v.length();
            if (!W.orbit && dist < 1.2) { W.hold = (W.hold || 0) + dt; if (W.hold > (W.hover || 0)) D.wi++; }
            const sp = Math.min(vmax, dist * 0.7); if (dist > 1e-3) _v.multiplyScalar(sp / dist);
            _w.subVectors(_v, D.vel); const al = _w.length(), amax = 3 * dt; if (al > amax) _w.multiplyScalar(amax / al);
            D.vel.add(_w); p.addScaledVector(D.vel, dt);
            const gmin = ground(p.x, p.z) + 0.02; if (p.y < gmin) { p.y = gmin; D.vel.y = Math.max(0, D.vel.y); }
            // hướng mũi: theo tâm cần nhìn, không thì theo hướng bay (đủ nhanh)
            let yt = D.yaw; if (faceX !== null) yt = Math.atan2(faceX - p.x, faceZ - p.z); else if (Math.hypot(D.vel.x, D.vel.z) > 0.8) yt = Math.atan2(D.vel.x, D.vel.z);
            let dy = Math.atan2(Math.sin(yt - D.yaw), Math.cos(yt - D.yaw)); const yr = Math.max(-1.2 * dt, Math.min(1.2 * dt, dy)); D.yaw += yr;
            // nghiêng: gia tốc trong hệ thân (tới / ngang) + gió (m/s thật → nghiêng giữ chỗ)
            const ws = liveWeather.state, wv = (ws.windSpeed || 0) / 3.6, wa = (ws.windDirection ?? 180) * Math.PI / 180, wx2 = -Math.sin(wa) * wv, wz2 = -Math.cos(wa) * wv;
            const ax = _w.x / dt * 0.12 - wx2 * 0.022, az = _w.z / dt * 0.12 - wz2 * 0.022, cy = Math.cos(D.yaw), sy = Math.sin(D.yaw);
            const fwd = ax * sy + az * cy, side = ax * cy - az * sy;
            D.tilt.x += (Math.max(-0.4, Math.min(0.4, fwd + D.vel.dot(_v.set(sy, 0, cy)) * 0.035)) - D.tilt.x) * Math.min(1, dt * 4);
            D.tilt.y += (Math.max(-0.4, Math.min(0.4, side + D.vel.dot(_v.set(cy, 0, -sy)) * 0.035)) - D.tilt.y) * Math.min(1, dt * 4);
            D.gp += (W.gp - D.gp) * Math.min(1, dt * 1.5);
            // cần điều khiển (Mode 2): trái = [xoay, ga] · phải = [ngang, tới]
            const vf = D.vel.x * sy + D.vel.z * cy, vs = D.vel.x * cy - D.vel.z * sy;
            D.stick = [yr / dt / 1.2, D.vel.y / 2, vs / vmax, vf / vmax].map(v => Math.max(-1, Math.min(1, v)));
            return false;
          }
          function pose(dt, t) {   // vị trí / dáng drone + cánh quạt + đèn
            g.position.copy(D.pos); g.rotation.set(0, D.yaw, 0);
            core.rotation.set(D.tilt.x, 0, -D.tilt.y);
            gim.rotation.x = -D.gp - D.tilt.x;   // gimbal bù nghiêng thân (giữ chân trời thẳng), chỉ đổi góc cúi
            const spd = D.spin * 140; props.forEach((pr, i) => { pr.rotation.y += (i % 3 ? 1 : -1) * spd * dt; pr.visible = D.spin < 0.55; });
            blurs.forEach(b => { b.material.opacity = Math.max(0, Math.min(0.32, (D.spin - 0.35) * 0.9)); });
            const on = D.st !== 'idle' && D.st !== 'grab' && D.st !== 'carry' && D.st !== 'park';
            leds.forEach(l => { l.visible = on && (D.spin > 0.2 || (t % 1) < 0.5); }); tail.visible = on && (t % 1.4) < 0.25;
          }
          function rcPose(e) {   // tay cầm trước ngực (hệ eo), 2 tay nắm 2 tay cầm, cần nghiêng theo lệnh
            const sp = e.spine; sp.updateWorldMatrix(true, false);
            rc.position.copy(sp.localToWorld(_v.set(0, 0.36, 0.44))); rc.quaternion.copy(sp.getWorldQuaternion(_q)); rc.rotateX(-0.6 - 0.35 * D.lookDown);   // mặt tay cầm ngửa về phía mắt
            sticks[0].rotation.set(-0.45 * D.stick[1], 0, -0.45 * D.stick[0]); sticks[1].rotation.set(-0.45 * D.stick[3], 0, -0.45 * D.stick[2]);
            rc.updateMatrixWorld(true);
            const R = e.reachT || (e.reachT = [null, null]);
            R[0] = rc.localToWorld(new THREE.Vector3(-0.075, -0.015, -0.02)); R[1] = rc.localToWorld(new THREE.Vector3(0.075, -0.015, -0.02));
          }
          function hold(e, which) {   // xách: drone tay trái, tay cầm tay phải (đi bộ)
            e.wrists[1].updateWorldMatrix(true, false); e.wrists[0].updateWorldMatrix(true, false);
            if (which.drone) { e.wrists[1].getWorldPosition(g.position); g.position.y -= 0.04; g.rotation.set(0, e.g.rotation.y, 0); core.rotation.set(0, 0, 0); }
            if (which.rc) { e.wrists[0].getWorldPosition(rc.position); rc.position.y += 0.02; rc.rotation.set(0.9, e.g.rotation.y, 0); }
          }
          function look(e, p) { _v.copy(e.g.position); _v.y += 1.6; const dy = p.y - _v.y, dh = Math.hypot(p.x - _v.x, p.z - _v.z); e.head.rotation.x = Math.max(-1.0, Math.min(0.6, -Math.atan2(dy, dh))); }
          function face(e, p) { e.g.rotation.y = Math.atan2(p.x - e.g.position.x, p.z - e.g.position.z); }
          function crouch(e, sq) { e.noFootIK = true; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.24 * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * sq; e.lean = 0.12 * sq; e.spineT = { x: 0.45 * sq, y: 0 }; }
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          function go(st) { D.st = st; D.k = 0; }
          function osdDraw(t) {   // chữ OSD kiểu app drone: REC, pin, vệ tinh, sóng · H, D, tốc độ · tâm ngắm
            const x = ox, W = 512, H = 331; x.clearRect(0, 0, W, H);
            const T = (s, X, Y, al = 'left', sz = 15, col = '#fff') => { x.font = 'bold ' + sz + 'px Arial, sans-serif'; x.textAlign = al; x.lineWidth = 3.5; x.strokeStyle = 'rgba(0,0,0,0.65)'; x.strokeText(s, X, Y); x.fillStyle = col; x.fillText(s, X, Y); };
            x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(0, 0, W, 26);
            if (t % 1 < 0.6) { x.fillStyle = '#ff3b30'; x.beginPath(); x.arc(16, 13, 6, 0, TAU); x.fill(); }
            const rs = Math.floor(D.rec); T('REC ' + String(Math.floor(rs / 60)).padStart(2, '0') + ':' + String(rs % 60).padStart(2, '0'), 28, 18);
            T('GPS 17', 300, 18, 'left', 13); for (let i = 0; i < 4; i++) { x.fillStyle = '#fff'; x.fillRect(360 + i * 6, 18 - 4 - i * 3, 4, 4 + i * 3); }
            x.strokeStyle = '#fff'; x.lineWidth = 2; x.strokeRect(420, 7, 30, 13); x.fillRect(450, 10, 3, 7); x.fillStyle = D.bat > 25 ? '#5fe07a' : '#ff5a4a'; x.fillRect(422, 9, 26 * D.bat / 100, 9);
            T(Math.round(D.bat) + '%', 498, 18, 'right', 13);
            const p = D.pos, hgt = p.y - D.home.y, dist = Math.hypot(p.x - D.home.x, p.z - D.home.z), hs = Math.hypot(D.vel.x, D.vel.z);
            x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(0, H - 30, W, 30);
            T('H ' + hgt.toFixed(1) + ' m', 16, H - 10); T('D ' + dist.toFixed(0) + ' m', 140, H - 10); T('H.S ' + hs.toFixed(1) + ' m/s', 250, H - 10); T('V.S ' + D.vel.y.toFixed(1) + ' m/s', 392, H - 10);
            x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(W / 2 - 14, H / 2); x.lineTo(W / 2 - 5, H / 2); x.moveTo(W / 2 + 5, H / 2); x.lineTo(W / 2 + 14, H / 2); x.moveTo(W / 2, H / 2 - 5); x.lineTo(W / 2, H / 2 + 5); x.stroke();
            T(['Cất cánh', 'Lên 12 m', 'Đầm sen', 'Cánh đồng pin', 'Cánh đồng pin', 'Cánh đồng pin', 'Đập thủy điện', 'Tua-bin #3', 'Chuồng bò', 'Về điểm nhà', 'Hạ cánh'][Math.min(10, D.wi)] || 'Hạ cánh', W - 14, 48, 'right', 14, '#ffd34a');
            osdT.needsUpdate = true;
          }
          // ---- mỗi khung trong pha 'drone' của kỹ sư: trả true khi xong việc ----
          function update(e, dt, t) {
            D.k += dt; const H = e.hold || (e.hold = {});
            if (D.st === 'idle') { sizeBubble(); D.table.copy(tableSpot()); const z = dogBrain.zoomSpot(); D.home.set(z.x, cowY(z.x, z.z) + 0.003, z.z);
              _v.set(D.table.x - D.home.x, 0, D.table.z - D.home.z).normalize(); D.stand.copy(D.home).addScaledVector(_v, 2.8); D.stand.y = cowY(D.stand.x, D.stand.z); go('toTable'); }
            if (D.st === 'toTable') { if (engStep(e, _w.set(D.table.x - 0.1, 0, D.table.z - 1.0), dt, t, pf, FIRE_AVOID_R) || D.k > 90) go('grab'); }   // đứng ngoài vòng né bàn trà (0,92 m)
            else if (D.st === 'grab') {   // với 2 tay lấy drone + tay cầm trên bàn
              engStandStill(e); face(e, D.table); look(e, D.table); const R = e.reachT || (e.reachT = [null, null]);
              R[1] = g.position.clone().setY(g.position.y + 0.03); R[0] = rc.position.clone().setY(rc.position.y + 0.03);
              if (D.k > 1.2) go('carry');
            }
            else if (D.st === 'carry') { hold(e, { drone: 1, rc: 1 }); if (engStep(e, _w.copy(D.home).addScaledVector(_v.set(D.stand.x - D.home.x, 0, D.stand.z - D.home.z).normalize(), 0.5), dt, t, pf, FIRE_AVOID_R) || D.k > 120) go('place'); }
            else if (D.st === 'place') {   // ngồi xổm đặt drone xuống bãi, mở 4 càng
              engStandStill(e); face(e, D.home); const sq = Math.min(ease(D.k / 0.7), 1 - ease((D.k - 3.4) / 0.7)); crouch(e, sq); hold(e, { rc: 1 });
              const R = e.reachT || (e.reachT = [null, null]); look(e, D.home);
              if (D.k < 0.8) hold(e, { drone: 1 }); else { g.position.copy(D.home); g.rotation.set(0, Math.atan2(D.home.x - D.stand.x, D.home.z - D.stand.z), 0); core.rotation.set(0, 0, 0); setFold(ease((D.k - 0.9) / 2)); R[1] = D.home.clone().setY(D.home.y + 0.1); }
              if (D.k > 4.2) { e.noFootIK = false; go('back'); }
            }
            else if (D.st === 'back') { hold(e, { rc: 1 }); if (engStep(e, D.stand, dt, t, pf, FIRE_AVOID_R) || D.k > 30) { go('ready'); D.pos.copy(D.home); D.yaw = g.rotation.y; D.vel.set(0, 0, 0); D.bat = 100; D.rec = 0; plan(); } }
            else if (D.st === 'ready' || D.st === 'arm' || D.st === 'flying' || D.st === 'land') {
              engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; face(e, D.pos); rcPose(e);
              D.lookDown += (((t % 23) < 3 && D.st === 'flying' ? 1 : 0) - D.lookDown) * Math.min(1, dt * 3);   // thỉnh thoảng cúi xem điện thoại
              if (D.lookDown > 0.5) e.head.rotation.x = 0.55; else look(e, D.pos);
              if (D.st === 'ready') { D.stick = [0, -1, 0, -1].map(v => v * Math.min(1, D.k)); if (D.k > 5) go('arm'); }   // bật máy, chờ vệ tinh (đèn nháy)
              else if (D.st === 'arm') { D.stick = [-1, -1, 1, -1]; spinTo(0.3, dt); if (D.k > 2) go('flying'); }   // CSC: 2 cần chụm xuống-vào → cánh quạt quay không tải
              else if (D.st === 'flying') { spinTo(0.62 + 0.2 * Math.min(1, D.vel.length() / 5), dt); D.rec += dt; D.bat = Math.max(5, D.bat - dt * 100 / 1860); if (fly(dt, t) || D.k > 420) go('land'); }
              else {   // hạ: kéo ga xuống tới khi chạm đất, giữ 2 s → mô-tơ tắt
                const gy = cowY(D.pos.x, D.pos.z) + 0.003; D.pos.y = Math.max(gy, D.pos.y - 0.55 * dt); D.vel.set(0, 0, 0); D.tilt.multiplyScalar(0.9);
                D.landT = D.pos.y - gy < 0.01 ? (D.landT || 0) + dt : 0; D.stick = [0, D.landT > 2 ? -1 : -0.5, 0, 0]; spinTo(D.landT > 2 ? 0 : 0.5, dt);
                if (D.landT > 4.5 || D.k > 40) { D.landT = 0; go('fetch'); }
              }
              bub.visible = D.st === 'flying' || (D.st === 'arm' && D.k > 1) || (D.st === 'land' && D.landT < 2); phoneM.color.setScalar(D.st === 'ready' ? 0.15 : 1);   // điện thoại sáng khi có ảnh
            }
            else if (D.st === 'fetch') { bub.visible = false; if (engStep(e, _w.copy(D.home).addScaledVector(_v.set(D.stand.x - D.home.x, 0, D.stand.z - D.home.z).normalize(), 0.5), dt, t, pf, FIRE_AVOID_R) || D.k > 40) go('pick'); else hold(e, { rc: 1 }); }
            else if (D.st === 'pick') {   // ngồi xổm gập càng, nhặt drone
              engStandStill(e); face(e, D.pos); const sq = Math.min(ease(D.k / 0.7), 1 - ease((D.k - 2.6) / 0.7)); crouch(e, sq); hold(e, { rc: 1 }); look(e, D.pos);
              setFold(1 - ease((D.k - 0.7) / 1.5)); const R = e.reachT || (e.reachT = [null, null]); R[1] = D.pos.clone().setY(D.pos.y + 0.1);
              if (D.k > 2.4) hold(e, { drone: 1 });
              if (D.k > 3.4) { e.noFootIK = false; go('home'); }
            }
            else if (D.st === 'home') { hold(e, { drone: 1, rc: 1 }); if (engStep(e, _w.set(D.table.x - 0.1, 0, D.table.z - 1.0), dt, t, pf, FIRE_AVOID_R) || D.k > 120) go('park'); }
            else if (D.st === 'park') { engStandStill(e); face(e, D.table); look(e, D.table); const R = e.reachT || (e.reachT = [null, null]); R[1] = D.table.clone().setY(D.table.y + 0.05); R[0] = D.table.clone().add(_v.set(0.04, 0.05, -0.33));
              if (D.k > 1.0) { park(); go('done'); } }
            if (D.st === 'done') { D.st = 'idle'; return true; }
            if (D.st !== 'grab' && D.st !== 'park' && D.st !== 'toTable' && !(D.st === 'place' && D.k > 0.8) && D.st !== 'pick') e.armsBusy = true;
            if (D.st === 'flying' || D.st === 'arm' || D.st === 'land') pose(dt, t); else if (D.st === 'place' || D.st === 'pick' || D.st === 'ready' || D.st === 'back') { D.pos.copy(g.position); pose(dt, t); }
            if (bub.visible && (D.frame++ % 4) === 0) osdDraw(t);
            return false;
          }
          function abort() { if (D.st !== 'idle') { D.st = 'idle'; park(); } }
          // ---- trước lượt vẽ chính: bong bóng bám đầu (quay về camera) + dựng ảnh camera drone (cách 1 khung, chỉ khi bong bóng trên màn hình) ----
          let rtK = 0; const _p = new THREE.Vector3(), COARSE = matchMedia('(pointer: coarse)').matches;
          function render() {
            if (!bub.visible) return;
            const e = engObj; e.head.getWorldPosition(_p); const top = SH * 0.875 + 0.32;
            bub.position.set(_p.x, _p.y + 0.42 + top, _p.z); bub.quaternion.copy(camera.quaternion);
            dots.forEach((d, i) => d.position.set(0.05 + i * 0.04, -SH * 0.875 - 0.12 - i * 0.17, 0));   // 3 chấm to → nhỏ dần từ mép mây xuống đầu
            _v.copy(bub.position).project(camera); if (Math.abs(_v.x) > 1.2 || Math.abs(_v.y) > 1.2 || _v.z > 1) return;
            // ảnh camera tốn ~8 ms / lần (vẽ lại cả cảnh) ⇒ 1/3 khung (máy cảm ứng 1/5), bong bóng < 50 px trên màn hình thì giữ ảnh cũ
            _w.copy(bub.position); _w.y += SH * 0.5; _w.project(camera); if (Math.abs(_w.y - _v.y) * 0.5 * renderer.domElement.height < 50) return;
            if ((rtK++ % (COARSE ? 5 : 3))) return;
            g.updateMatrixWorld(true);
            const auto = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; bub.visible = false; g.visible = false; rc.visible = false;   // ẩn cả tay cầm: màn điện thoại đọc chính ảnh đang vẽ (vòng lặp khung)
            renderer.setRenderTarget(rt); renderer.render(scene, fpv); renderer.setRenderTarget(null);
            renderer.shadowMap.autoUpdate = auto; bub.visible = true; g.visible = true; rc.visible = true;
          }
          park();
          return { update, abort, render, park, state: D, g, rc, bub, rt, osdC };
        })();
