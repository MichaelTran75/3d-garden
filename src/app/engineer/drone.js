        // ===== DRONE ĐỒ CHƠI CỦA KỸ SƯ (G 17/10) — drone + tay cầm là MẪU GLB "DJI Mini 3 Drone with Remote Controller" (Marco Workspace, CC-BY-4.0;
        //  G 17/10 "lấy 100% ra sử dụng, ko phải vẽ lại"): src/models/dji-mini3.glb — đã tách phần (thân drone · 4 cánh quạt quanh đúng trục mô-tơ ·
        //  thân tay cầm · 2 cần · ô màn hình), giảm lưới giữ ảnh vân + pháp tuyến 433k → 96k tam giác (tay cầm 40k, 2 cần nguyên lưới gốc), lượng tử hoá +
        //  nén meshopt, ảnh JPEG (27 MB → 1,4 MB), tải sau khi cảnh chạy.
        //  Đơn vị m: drone mũi +z, gốc ở đáy càng (càng mở sẵn — mẫu không gập được); tay cầm (DJI RC: 2 CẦN Ở TRÊN, MÀN Ở DƯỚI — ảnh trên màn gốc chỉ
        //  đứng thẳng theo chiều này): mặt +Y, phía cần −Z (xa người cầm), phía màn +Z (gần người), PHẢI người cầm = +X, gốc giữa mặt ở đáy lưng =====
        //  Nghiên cứu cách điều khiển (tay cầm Mode 2 — mặc định phổ biến): cần TRÁI = ga (đẩy lên: lên cao) + xoay đầu (yaw); cần PHẢI = tới / lui
        //  (pitch) + nghiêng trái / phải (roll). Quy trình: đặt drone trên nền phẳng, bật drone (đèn nháy) rồi tay cầm, chờ định vị vệ tinh + ghi ĐIỂM NHÀ;
        //  khởi động mô-tơ bằng gạt 2 cần chụm xuống-vào (CSC) → cánh quạt quay không tải; đẩy ga: cất cánh treo ~1,2 m rồi bay. Khi bay: drone NGHIÊNG
        //  theo gia tốc (tới thì chúi mũi, sang ngang thì nghiêng cánh), có gió thì nghiêng vào gió để đứng yên, gimbal giữ camera thăng bằng (chỉ đổi góc
        //  ngẩng / cúi); tầm mắt — người điều khiển đứng yên, 2 tay giữ tay cầm trước ngực, ngón cái trên 2 cần, mắt dõi theo drone, thỉnh thoảng cúi xem
        //  màn hình tay cầm. Hạ cánh: về điểm nhà, xuống 1,2 m, kéo ga xuống tới khi chạm đất, giữ thêm 2 s → mô-tơ tắt. Không bay khi mưa hay gió
        //  > 9 m/s (giới hạn của loại drone 249 g ~10,7 m/s).
        //  Lịch: 15:20 lấy drone + tay cầm trên bàn trà → ra bãi cỏ trống (bãi chó chạy vòng) → đặt → lùi 2,8 m → cất cánh → lên 40 m → bay 1 VÒNG
        //  QUANH ĐẢO (G 17/10 "drone bay 1 vòng quanh land", ngoài mép 18 m, camera hướng tâm đảo) → về hạ cánh → cất về bàn. Nhãn + đường dẫn chỉ xuống drone.
        //  Ảnh camera (FPV, 768 × 320 = đúng tỉ lệ màn tay cầm, ống kính ~82° ngang như Mini 3) hiện trên MÀN TAY CẦM và trên KHUNG TAY CẦM lơ lửng trên đầu
        //  kỹ sư (G 17/10: ban đầu khung nằm trong bong bóng suy nghĩ; sau đó bỏ mây + 3 chấm, chỉ để khung, to gấp đôi — màn = 4 × màn laptop) ----
        const droneToy = (() => {
          const S = 1.3;   // cỡ đồ chơi: thật × 1,3 (nhân vật kiểu LEGO to tay)
          const DRONE_GLB = window.__droneGlb || 'https://michaeltran75.github.io/3d-garden/models/dji-mini3.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          const g = new THREE.Group(); g.name = 'Drone đồ chơi'; g.scale.setScalar(S);
          const core = new THREE.Group(); core.position.y = 0.039; g.add(core);   // thân nghiêng theo gia tốc quanh tâm này (giữa chiều cao mẫu)
          const gim = new THREE.Group(); core.add(gim);   // gimbal (ngẩng / cúi) — dời tới mặt ống kính khi mẫu nạp xong
          const fpv = new THREE.PerspectiveCamera(41, 2.4, 0.1, 900); fpv.rotation.y = Math.PI; gim.add(fpv);
          const props = [], blurs = [], leds = [], blurM = new THREE.MeshBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
          const tail = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffb030 })); tail.position.set(0, 0.004, -0.092); tail.visible = false; core.add(tail);
          scene.add(g);
          const rc = new THREE.Group(); rc.name = 'Tay cầm điều khiển drone'; rc.scale.setScalar(S); scene.add(rc);
          const sticks = [new THREE.Object3D(), new THREE.Object3D()];   // 2 cần của mẫu thay vào khi nạp xong
          const rt = new THREE.WebGLRenderTarget(768, 320, { depthBuffer: true }); rt.texture.name = 'Ảnh camera drone';
          const phoneM = new THREE.MeshBasicMaterial({ map: rt.texture, color: 0x000000, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 });
          let SCR = { w: 0.1248, h: 0.0521 }, rcSrc = null, rcScr = null;
          let RoomEnv = null;
          import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js').then(async ({ GLTFLoader }) => {
            const { MeshoptDecoder } = await import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js');
            RoomEnv = (await import('https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js')).RoomEnvironment;
            attach((await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(DRONE_GLB)).scene);
          }).catch(err => console.warn('Drone GLB:', err));
          function attach(src) {
            // cảnh không có ảnh môi trường ⇒ kim loại PBR thành đen: hạ hệ số kim loại (ảnh độ nhám / kim loại của mẫu vẫn giữ)
            src.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material.metalness = 0.25; } o.userData.noBatch = true; });
            const dn = src.getObjectByName('Drone'), rn = src.getObjectByName('RC');
            dn.position.y = -core.position.y; core.add(dn);
            ['PropFL', 'PropFR', 'PropRL', 'PropRR'].forEach((nm, i) => {   // nút cánh: trục y = trục mô-tơ ⇒ quay nhóm con quanh y
              const n = dn.getObjectByName(nm), sp = new THREE.Group(); [...n.children].forEach(c => sp.add(c)); n.add(sp); props[i] = sp;
              const bd = new THREE.Mesh(new THREE.CircleGeometry(n.userData.r || 0.072, 24), blurM); bd.rotation.x = -Math.PI / 2; bd.position.y = 0.003; n.add(bd); blurs[i] = bd;
              if (i < 2) { const led = new THREE.Mesh(new THREE.SphereGeometry(0.003, 6, 4), new THREE.MeshBasicMaterial({ color: 0x40ff60 })); led.position.set(n.position.x, 0.006, n.position.z); led.visible = false; dn.add(led); leds.push(led); }
            });
            const cam = dn.getObjectByName('Camera'); gim.position.set(cam.position.x, cam.position.y + dn.position.y, cam.position.z);
            rc.add(rn); sticks[0] = rn.getObjectByName('StickL'); sticks[1] = rn.getObjectByName('StickR');
            const sn = rn.getObjectByName('Screen'); SCR = { w: sn.userData.w, h: sn.userData.h }; rcScr = sn;
            const live = new THREE.Mesh(new THREE.PlaneGeometry(SCR.w, SCR.h), phoneM); live.name = 'ScreenLive'; live.rotation.x = -Math.PI / 2; live.position.copy(sn.position); live.position.y += 0.0004; rn.add(live);
            rcSrc = rn; buildFrame(); if (D.st === 'idle') park();
          }
          // ---- KHUNG TAY CẦM trên đầu kỹ sư khi điều khiển drone (G 17/10: bỏ đám mây + 3 chấm suy nghĩ — "chỉ để remote control frame", to gấp đôi):
          //      ảnh tay cầm của mẫu · màn camera đúng ô màn tay cầm (rộng = 4 × màn laptop thế giới) · OSD. Khung vẽ RIÊNG ra 1 ảnh (cảnh nhỏ: bản sao tay cầm
          //      + đèn + camera trực giao úp mặt) rồi dán như tranh quay về camera ⇒ không bị cây che, không tranh độ sâu với cảnh; vẽ lại cùng nhịp ảnh
          //      camera (2 cần trong khung nghiêng theo lệnh). Khung to gấp đôi ⇒ ảnh khung 1024 × 678, ảnh camera 768 × 320, OSD ×2 điểm ảnh cho nét ----
          const bub = new THREE.Group(); bub.name = 'Khung tay cầm drone (trên đầu kỹ sư)'; bub.visible = false; scene.add(bub);
          const osdC = document.createElement('canvas'); osdC.width = 1024; osdC.height = 428; const ox = osdC.getContext('2d'), osdT = new THREE.CanvasTexture(osdC); osdT.colorSpace = THREE.SRGBColorSpace;
          const FRW = 1024, FRH = 678, frameRT = new THREE.WebGLRenderTarget(FRW, FRH, { samples: matchMedia('(pointer: coarse)').matches ? 2 : 4 }), fScene = new THREE.Scene(), fCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 3);
          fScene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a3, 1.2)); { const l = new THREE.DirectionalLight(0xffffff, 1.2); l.position.set(0.4, 1, 0.8); fScene.add(l); }   // + ảnh môi trường phòng studio (buildFrame) ⇒ nhựa trắng sạch, cần / nút ánh kim nhẹ như ảnh sản phẩm
          const mk = (map, ro) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, depthTest: false })); m.renderOrder = ro; bub.add(m); return m; };
          const frame = mk(frameRT.texture, 990.5), scr = mk(rt.texture, 991), osd = mk(osdT, 992);
          frame.visible = false;
          let SW = 0.7, SH = 0.3, FW = 1, FH = 0.66, frameRC = null, fSticks = null, fOff = [0, 0], frameDirty = true;
          const fAsp = FRW / FRH; frame.material.premultipliedAlpha = true;   // ảnh vẽ trên nền trong suốt: mép khử răng cưa đã nhân alpha
          function buildFrame() {   // bản sao tay cầm nhìn đúng như người cầm (phải = +X, phía cần −Z lên trên, màn ở dưới, mặt +Y về camera); đo ô màn trong khung
            frameRC = rcSrc.clone(true); frameRC.rotation.set(Math.PI / 2, 0, 0); fScene.add(frameRC); frameRC.getObjectByName('ScreenLive').visible = false;
            if (RoomEnv) { const pm = new THREE.PMREMGenerator(renderer), room = new RoomEnv(); fScene.environment = pm.fromScene(room, 0.04).texture; pm.dispose(); room.dispose?.(); }   // chỉ cảnh khung, cảnh chính giữ nguyên
            fSticks = [frameRC.getObjectByName('StickL'), frameRC.getObjectByName('StickR')];
            frameRC.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(frameRC, true), c = bb.getCenter(new THREE.Vector3());
            let fw = (bb.max.x - bb.min.x) * 1.04, fh = (bb.max.y - bb.min.y) * 1.04; if (fw / fh > fAsp) fh = fw / fAsp; else fw = fh * fAsp;
            Object.assign(fCam, { left: -fw / 2, right: fw / 2, top: fh / 2, bottom: -fh / 2 }); fCam.position.set(c.x, c.y, bb.max.z + 1); fCam.lookAt(c); fCam.updateProjectionMatrix();
            const sp = frameRC.getObjectByName('Screen').getWorldPosition(new THREE.Vector3()); fOff = [(sp.x - c.x) / fw, (sp.y - c.y) / fh];
            frame.userData.k = fw / SCR.w; frame.visible = true; sizeBubble();
          }
          function sizeBubble() {   // màn laptop thế giới: rộng MBP.SW × tỉ lệ laptop (bàn học × xe) ⇒ màn tay cầm = 4 × (bản có mây: 2 ×; G 17/10 khung to gấp đôi)
            const kL = studyLaptop.group ? studyLaptop.group.getWorldScale(new THREE.Vector3()).x / LAP_K : 1; SW = 4 * MBP.SW * kL;   // laptop to thêm 30% (LAP_K) nhưng khung giữ cỡ cũ SH = SW * SCR.h / SCR.w;
            FW = frameRC ? SW * frame.userData.k : SW * 1.25; FH = FW / fAsp;
            scr.scale.set(SW, SH, 1); osd.scale.set(SW, SH, 1); frame.scale.set(FW, FH, 1); scr.position.set(fOff[0] * FW, fOff[1] * FH, 0); osd.position.copy(scr.position);
          }
          // ---- trạng thái ----
          const D = { st: 'idle', k: 0, home: new THREE.Vector3(), stand: new THREE.Vector3(), table: new THREE.Vector3(), pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, gp: -0.3, wp: [], wi: 0,
            spin: 0, fold: 0, bat: 100, rec: 0, orbit: null, tilt: new THREE.Vector2(), stick: [0, 0, 0, 0], frame: 0, held: null, heldE: null, lookDown: 0, rcSpot: new THREE.Vector3(), standT: new THREE.Vector3(), reachP: new THREE.Vector3(), tableMid: new THREE.Vector3() };
          const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
          // chỗ trên MẶT bàn trà theo toạ độ của bàn (x dọc bàn, z ngang; ghế cắm trại phía +z, đầu tây): drone mẫu GLB càng mở (~0,42 × 0,44 m) chiếm nửa ĐÔNG,
          // mũi dọc bàn; tay cầm nằm ngửa ở góc tây mép −z (phía cần quay ra xa người đứng lấy, màn ở gần); ca nấu, chảo, gói khoai tây ở nửa tây gần ghế. Kỹ sư đi tới
          // (0; −W/2 − 0,55) phía −z (vòng né bàn không cho lại gần hơn) rồi tableReach() bước sát (0; −W/2 − 0,32) + gập eo. Bản cũ lấy đỉnh hộp bao cả nhóm bàn
          // (gồm ca nấu, làn hơi) ⇒ drone lơ lửng; góc "đầu bàn" theo hộp bao trục thế giới (bàn xoay 27°) rơi ra ngoài mép (G 17/10 "đặt drone lên bàn correctly")
          const tableLay = () => { const t = scene.getObjectByName('Bàn trà (Camp Table)'); t.updateMatrixWorld(true); const top = t.userData.top ?? 0.45, W = (t.userData.size || [0.66, 0.48])[1];
            const stand = t.localToWorld(new THREE.Vector3(0, 0, -W / 2 - 0.55)), reach = t.localToWorld(new THREE.Vector3(0, 0, -W / 2 - 0.32));
            return { yaw: t.rotation.y, dr: t.localToWorld(new THREE.Vector3(0.2, top, -0.01)), rc: t.localToWorld(new THREE.Vector3(-0.2, top, -0.19)), stand, reach, mid: t.localToWorld(new THREE.Vector3(0, top, 0)) }; };
          const layOut = T => { D.table.copy(T.dr); D.rcSpot.copy(T.rc); D.standT.copy(T.stand); D.reachP.copy(T.reach); D.tableMid.copy(T.mid); };
          const _bb = new THREE.Box3();
          function restOn(o, y) { o.updateMatrixWorld(true); _bb.setFromObject(o, true); if (_bb.isEmpty()) return; o.position.y += y + 0.001 - _bb.min.y; o.updateMatrixWorld(true); }   // đáy thật của lưới (đỉnh đã xoay) chạm mặt y
          function park() {   // trên mặt bàn trà: drone nửa đông (mũi dọc bàn), tay cầm ngửa góc tây — đáy lưới thật chạm mặt bàn
            const T = tableLay(); layOut(T); D.held = null;
            scene.add(g); g.position.copy(T.dr); g.rotation.set(0, T.yaw + Math.PI / 2, 0); core.rotation.set(0, 0, 0); setFold(0); spinTo(0, 1); restOn(g, T.dr.y);
            scene.add(rc); rc.position.copy(T.rc); rc.rotation.set(0, T.yaw + Math.PI, 0); restOn(rc, T.rc.y);   // cần quay ra xa người đứng lấy, màn gần bub.visible = false; phoneM.color.setScalar(0);
          }
          function setFold(f) { D.fold = f; }   // mẫu GLB càng mở cố định (không gập) — giữ nhịp gập / mở của lịch cho tay kỹ sư
          function spinTo(w, dt) { D.spin += (w - D.spin) * Math.min(1, dt * 2.5); }
          const ground = (x, z) => cowY(x, z);
          // đường bay QUANH ĐẢO (G 17/10 "drone bay 1 vòng quanh land"): hình chữ nhật của đảo nở ra m mét — 4 cạnh thẳng + 4 góc cung tròn bán kính m
          // (luôn cách mép đảo đúng m), tham số theo độ dài cung s. Bay NGOÀI mép: 6 tua-bin gió đứng sát mép bắc, đỉnh cánh tới y 72, cánh thò ra
          // ngoài mép ~5 m ⇒ m = 18 m còn cách ≥ 13 m. Mặt + camera hướng tâm đảo (kiểu POI quay phim) ⇒ màn tay cầm thấy cả đảo xoay dần
          function rimPath(cx, cz, a, b, m) {
            const q = Math.PI / 2 * m, L = [2 * b, q, 2 * a, q, 2 * b, q, 2 * a, q], tot = 4 * a + 4 * b + 4 * q;
            const at = (s, out) => {   // cạnh đông (đi +z) → góc → cạnh nam (−x) → góc → cạnh tây (−z) → góc → cạnh bắc (+x) → góc
              s = ((s % tot) + tot) % tot; let i = 0; while (i < 7 && s > L[i]) { s -= L[i]; i++; }
              let x, z;
              if (i === 0) { x = a + m; z = -b + s; } else if (i === 2) { x = a - s; z = b + m; } else if (i === 4) { x = -a - m; z = b - s; } else if (i === 6) { x = -a + s; z = -b - m; }
              else { const f = (i - 1) * Math.PI / 4 + s / m; x = (i === 1 || i === 7 ? a : -a) + m * Math.cos(f); z = (i < 4 ? b : -b) + m * Math.sin(f); }
              return out.set(cx + x, 0, cz + z);
            };
            const near = p => { let bs = 0, bd = 1e9; for (let s = 0; s < tot; s += 2) { at(s, _w); const d = Math.hypot(_w.x - p.x, _w.z - p.z); if (d < bd) { bd = d; bs = s; } } return bs; };
            return { cx, cz, tot, at, near };
          }
          function plan() {   // điểm bay (toạ độ ghim + X0/Z0), độ cao tương đối điểm nhà, góc gimbal, kiểu (đi / vòng quanh đảo / treo), tên hiện trên OSD
            const H = D.home, P = (x, z, alt, gp, o = {}) => Object.assign({ p: new THREE.Vector3(X0 + x, H.y + alt, Z0 + z), gp }, o), hx = H.x - X0, hz = H.z - Z0;
            const tb = new THREE.Box3(); terrainMeshes.forEach(m => tb.expandByObject(m));   // mép đảo thật (thế giới: x ±122,4 · z ±110,4)
            const rim = rimPath((tb.min.x + tb.max.x) / 2, (tb.min.z + tb.max.z) / 2, (tb.max.x - tb.min.x) / 2, (tb.max.z - tb.min.z) / 2, 18);
            // cất cánh treo 1,2 m (tự động) → 12 m → lên thẳng 40 m (cao hơn đồi 31 m, dưới mây ~82 m) → lùi ra mép đảo (camera vẫn nhìn tâm) → 1 vòng ~1 km
            // ở 10 m/s (chế độ thường của Mini 3) → về điểm nhà ở 40 m → xuống thẳng 14 m → 1,2 m treo 2 s → hạ
            D.wp = [P(hx, hz, 1.2, -0.2, { hover: 2, v: 1.5, name: 'Cất cánh' }), P(hx, hz, 12, -0.35, { hover: 1, name: 'Lên 12 m' }), P(hx, hz, 40, -0.35, { hover: 1, v: 4.5, name: 'Lên 40 m' }),
              P(hx, hz, 40, -0.38, { loop: rim, v: 10, name: 'Vòng quanh đảo' }), P(hx, hz, 40, -0.35, { hover: 1, v: 10, name: 'Về điểm nhà' }),
              P(hx, hz, 14, -0.35, { hover: 1, v: 3, name: 'Xuống 14 m' }), P(hx, hz, 1.2, -0.2, { hover: 2, v: 1.2, name: 'Hạ cánh' })];
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
            } else if (W.loop) {   // 1 vòng quanh đảo: điểm dẫn chạy dọc đường với tốc độ v khi drone đã bám kịp (≤ 20 m; bám ổn định cách ~14 m), mặt hướng tâm đảo
              const R = W.loop; if (W.s === undefined) { W.s = R.near(p); W.n = 0; }
              R.at(W.s, _q2); if (Math.hypot(p.x - _q2.x, p.z - _q2.z) < 20) { W.s += vmax * dt; W.n += vmax * dt; }
              tx = _q2.x; tz = _q2.z; faceX = R.cx; faceZ = R.cz;
              if (W.n >= R.tot) D.wi++;
            } else if (W.look) { faceX = X0 + W.look[0]; faceZ = Z0 + W.look[1]; }
            _v.set(tx - p.x, ty - p.y, tz - p.z); const dist = _v.length();
            if (!W.orbit && !W.loop && dist < 1.2) { W.hold = (W.hold || 0) + dt; if (W.hold > (W.hover || 0)) D.wi++; }
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
            rc.position.copy(sp.localToWorld(_v.set(0, 0.36, 0.44))); rc.quaternion.copy(sp.getWorldQuaternion(_q)); rc.rotateY(Math.PI); rc.rotateX(0.75 + 0.35 * D.lookDown);   // cần ra xa, màn gần người; mặt ngửa về phía mắt
            stickPose(sticks);
            rc.updateMatrixWorld(true);
            const R = e.reachT || (e.reachT = [null, null]);   // cổ tay ôm 2 đầu tay cầm ở nửa gần người, ngón cái vươn tới 2 cần (người cầm: phải = +X)
            R[0] = rc.localToWorld(new THREE.Vector3(0.104, 0.02, 0.03)); R[1] = rc.localToWorld(new THREE.Vector3(-0.104, 0.02, 0.03));   // bàn tay to (kiểu LEGO): nắm hẳn ra ngoài 2 đầu cho khỏi che màn
          }
          // cần mẫu (Mode 2): StickL bên TRÁI người cầm (−X) = ga (đẩy ra xa = −Z) + xoay đầu; StickR bên phải = tới / lui + nghiêng ngang
          function stickPose(st) { st[0].rotation.set(-0.45 * D.stick[1], 0, 0.45 * D.stick[0]); st[1].rotation.set(-0.45 * D.stick[3], 0, 0.45 * D.stick[2]); }
          // xách: chỉ GHI LẠI ở đây — cổ tay lúc update() còn ở dáng đầu khung (tay đung đưa, IK chạy sau) ⇒ đặt vật theo cổ tay ở placeHeld(), đầu render() (dáng cuối khung)
          function hold(e, which) { D.held = Object.assign(D.held || {}, which); D.heldE = e; }
          function placeHeld() {   // xách lúc đi: drone tay trái dựng đứng (bụng quay vào đùi, mũi tới trước — càng mở không chạm chân), tay cầm tay phải nắm đầu phải, buông dọc thân
            const which = D.held, e = D.heldE; if (!which) return;
            const yaw = e.g.rotation.y; e.wrists[1].updateWorldMatrix(true, false); e.wrists[0].updateWorldMatrix(true, false);
            if (which.drone) { e.wrists[1].getWorldPosition(g.position); g.position.add(_v.set(-0.039 * S, -0.05, 0).applyAxisAngle(UP, yaw)); g.rotation.set(0, yaw, -Math.PI / 2); core.rotation.set(0, 0, 0); }
            if (which.rc) { e.wrists[0].getWorldPosition(rc.position); rc.position.add(_v.set(0.03 * S, -0.04 - 0.088 * S, 0).applyAxisAngle(UP, yaw)); rc.rotation.set(0, yaw, Math.PI / 2); }   // nắm đầu phải (+X) ở trên, mặt quay ra ngoài
          }
          function tableReach(e, dt, k) {   // vai cao hơn mặt bàn ~0,73 m mà tay dài 0,57 m ⇒ bước sát bàn (vòng né bàn giữ người cách tâm bàn ~0,85 m) rồi gập eo (e.lean lớn → lớp tư thế gập ở eo)
            const p = e.g.position, dx = D.reachP.x - p.x, dz = D.reachP.z - p.z, d = Math.hypot(dx, dz);
            if (d > 0.005) { const st = Math.min(d, 0.7 * dt); p.x += dx / d * st; p.z += dz / d * st; e.vel = 0.7; engGait(e, st); e.walking = true; }
            p.y = cowY(p.x, p.z) - ENG_FEET; e.lean = 0.65 * k;
          }
          const nearPt = (p, e, d, h) => _w.set(e.g.position.x - p.x, 0, e.g.position.z - p.z).normalize().multiplyScalar(d).add(p).setY(p.y + h).clone();   // mép vật phía người (tay với tới)
          function look(e, p) { _v.copy(e.g.position); _v.y += 1.6; const dy = p.y - _v.y, dh = Math.hypot(p.x - _v.x, p.z - _v.z); e.head.rotation.x = Math.max(-1.0, Math.min(0.6, -Math.atan2(dy, dh))); }
          function face(e, p) { e.g.rotation.y = Math.atan2(p.x - e.g.position.x, p.z - e.g.position.z); }
          function crouch(e, sq) { e.noFootIK = true; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.24 * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * sq; e.lean = 0.12 * sq; e.spineT = { x: 0.45 * sq, y: 0 }; }
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          function go(st) { D.st = st; D.k = 0; }
          function osdDraw(t) {   // chữ OSD kiểu app drone: REC, pin, vệ tinh, sóng · H, D, tốc độ · tâm ngắm
            const x = ox, W = 512, H = 214; x.setTransform(2, 0, 0, 2, 0, 0); x.clearRect(0, 0, W, H);   // vẽ ở toạ độ 512 × 214, canvas ×2 điểm ảnh
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
            T((D.wp[D.wi] || {}).name || 'Hạ cánh', W - 14, 48, 'right', 14, '#ffd34a');
            osdT.needsUpdate = true;
          }
          // ---- mỗi khung trong pha 'drone' của kỹ sư: trả true khi xong việc ----
          function update(e, dt, t) {
            D.k += dt; D.held = null; const H = e.hold || (e.hold = {});
            if (D.st === 'idle' && !rcSrc) return true;
            if (D.st === 'idle') { sizeBubble(); layOut(tableLay()); const z = dogBrain.zoomSpot(); D.home.set(z.x, cowY(z.x, z.z) + 0.003, z.z);
              _v.set(D.table.x - D.home.x, 0, D.table.z - D.home.z).normalize(); D.stand.copy(D.home).addScaledVector(_v, 2.8); D.stand.y = cowY(D.stand.x, D.stand.z); go('toTable'); }
            if (D.st === 'toTable') { if (engStep(e, D.standT, dt, t, pf, FIRE_AVOID_R) || D.k > 90) go('grab'); }   // đứng phía −z của bàn, ngoài vòng né bàn trà
            else if (D.st === 'grab') {   // bước sát bàn, gập eo, tay trái lấy drone (nửa đông) + tay phải lấy tay cầm (góc tây) rồi đứng thẳng
              engStandStill(e); tableReach(e, dt, ease((D.k - 0.3) / 0.6) * (1 - ease((D.k - 1.3) / 0.5))); face(e, D.tableMid); look(e, D.tableMid);
              if (D.k < 1.2) { const R = e.reachT || (e.reachT = [null, null]); R[1] = nearPt(g.position, e, 0.14, 0.05); R[0] = nearPt(rc.position, e, 0.06, 0.03); }
              else hold(e, { drone: 1, rc: 1 });
              if (D.k > 1.8) go('carry');
            }
            else if (D.st === 'carry') { hold(e, { drone: 1, rc: 1 }); if (engStep(e, _w.copy(D.home).addScaledVector(_v.set(D.stand.x - D.home.x, 0, D.stand.z - D.home.z).normalize(), 0.5), dt, t, pf, FIRE_AVOID_R) || D.k > 120) go('place'); }
            else if (D.st === 'place') {   // ngồi xổm đặt drone xuống bãi
              engStandStill(e); face(e, D.home); const sq = Math.min(ease(D.k / 0.7), 1 - ease((D.k - 3.4) / 0.7)); crouch(e, sq); hold(e, { rc: 1 });
              const R = e.reachT || (e.reachT = [null, null]); look(e, D.home);
              if (D.k < 0.8) hold(e, { drone: 1 }); else { g.position.copy(D.home); g.rotation.set(0, Math.atan2(D.home.x - D.stand.x, D.home.z - D.stand.z), 0); core.rotation.set(0, 0, 0); setFold(ease((D.k - 0.9) / 2)); R[1] = D.home.clone().setY(D.home.y + 0.1); }
              if (D.k > 4.2) { e.noFootIK = false; go('back'); }
            }
            else if (D.st === 'back') { hold(e, { rc: 1 }); if (engStep(e, D.stand, dt, t, pf, FIRE_AVOID_R) || D.k > 30) { go('ready'); D.pos.copy(D.home); D.yaw = g.rotation.y; D.vel.set(0, 0, 0); D.bat = 100; D.rec = 0; plan(); } }
            else if (D.st === 'ready' || D.st === 'arm' || D.st === 'flying' || D.st === 'land') {
              engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; face(e, D.pos); rcPose(e);
              D.lookDown += (((t % 23) < 3 && D.st === 'flying' ? 1 : 0) - D.lookDown) * Math.min(1, dt * 3);   // thỉnh thoảng cúi xem màn tay cầm
              if (D.lookDown > 0.5) e.head.rotation.x = 0.55; else look(e, D.pos);
              if (D.st === 'ready') { D.stick = [0, -1, 0, -1].map(v => v * Math.min(1, D.k)); if (D.k > 5) go('arm'); }   // bật máy, chờ vệ tinh (đèn nháy)
              else if (D.st === 'arm') { D.stick = [-1, -1, 1, -1]; spinTo(0.3, dt); if (D.k > 2) go('flying'); }   // CSC: 2 cần chụm xuống-vào → cánh quạt quay không tải
              else if (D.st === 'flying') { spinTo(0.62 + 0.2 * Math.min(1, D.vel.length() / 5), dt); D.rec += dt; D.bat = Math.max(5, D.bat - dt * 100 / 1860); if (fly(dt, t) || D.k > 420) go('land'); }
              else {   // hạ: kéo ga xuống tới khi chạm đất, giữ 2 s → mô-tơ tắt
                const gy = cowY(D.pos.x, D.pos.z) + 0.003; D.pos.y = Math.max(gy, D.pos.y - 0.55 * dt); D.vel.set(0, 0, 0); D.tilt.multiplyScalar(0.9);
                D.landT = D.pos.y - gy < 0.01 ? (D.landT || 0) + dt : 0; D.stick = [0, D.landT > 2 ? -1 : -0.5, 0, 0]; spinTo(D.landT > 2 ? 0 : 0.5, dt);
                if (D.landT > 4.5 || D.k > 40) { D.landT = 0; go('fetch'); }
              }
              bub.visible = D.st === 'flying' || (D.st === 'arm' && D.k > 1) || (D.st === 'land' && D.landT < 2); phoneM.color.setScalar(D.st === 'ready' ? 0.15 : 1);   // màn tay cầm sáng khi có ảnh
            }
            else if (D.st === 'fetch') { bub.visible = false; if (engStep(e, _w.copy(D.home).addScaledVector(_v.set(D.stand.x - D.home.x, 0, D.stand.z - D.home.z).normalize(), 0.5), dt, t, pf, FIRE_AVOID_R) || D.k > 40) go('pick'); else hold(e, { rc: 1 }); }
            else if (D.st === 'pick') {   // ngồi xổm nhặt drone
              engStandStill(e); face(e, D.pos); const sq = Math.min(ease(D.k / 0.7), 1 - ease((D.k - 2.6) / 0.7)); crouch(e, sq); hold(e, { rc: 1 }); look(e, D.pos);
              setFold(1 - ease((D.k - 0.7) / 1.5)); const R = e.reachT || (e.reachT = [null, null]); R[1] = D.pos.clone().setY(D.pos.y + 0.1);
              if (D.k > 2.4) hold(e, { drone: 1 });
              if (D.k > 3.4) { e.noFootIK = false; go('home'); }
            }
            else if (D.st === 'home') { hold(e, { drone: 1, rc: 1 }); if (engStep(e, D.standT, dt, t, pf, FIRE_AVOID_R) || D.k > 120) go('park'); }
            else if (D.st === 'park') {   // bước sát bàn, gập eo đặt drone + tay cầm về chỗ cũ, đứng thẳng
              engStandStill(e); tableReach(e, dt, ease((D.k - 0.2) / 0.6) * (1 - ease((D.k - 1.2) / 0.5))); face(e, D.tableMid); look(e, D.tableMid);
              if (D.k < 1.0) { hold(e, { drone: 1, rc: 1 }); const R = e.reachT || (e.reachT = [null, null]); R[1] = nearPt(D.table, e, 0.14, 0.05); R[0] = nearPt(D.rcSpot, e, 0.06, 0.05); }
              else if (!D.parked) { park(); D.parked = true; }
              if (D.k > 1.8) { D.parked = false; go('done'); }
            }
            if (D.st === 'done') { D.st = 'idle'; return true; }
            if (D.st !== 'grab' && D.st !== 'park' && D.st !== 'toTable' && !(D.st === 'place' && D.k > 0.8) && D.st !== 'pick') e.armsBusy = true;
            if (D.st === 'flying' || D.st === 'arm' || D.st === 'land') pose(dt, t); else if (D.st === 'place' || D.st === 'pick' || D.st === 'ready' || D.st === 'back') { D.pos.copy(g.position); pose(dt, t); }
            if (bub.visible && (D.frame++ % 4) === 0) osdDraw(t);
            return false;
          }
          function abort() { if (D.st !== 'idle') { D.st = 'idle'; park(); } }
          // ---- NHÃN + ĐƯỜNG DẪN chỉ xuống drone (G 17/10 "leader line và label chỉ xuống trên drone để dễ xác định vị trí"): đúng kiểu nhãn của cảnh
          //      (addLabel: thẻ bo màu be, chấm màu, đường dẫn mảnh, vẽ đè lên mọi thứ) nhưng GIỮ CỠ CỐ ĐỊNH TRÊN MÀN HÌNH — drone chỉ 0,5 m, zoom xa vẫn thấy;
          //      chữ = độ cao so với điểm nhà; chấm tròn đánh dấu đúng chỗ drone khi nó nhỏ hơn ~14 px. Hiện từ lúc đặt drone xuống cỏ tới lúc nhặt lên; nằm
          //      trong labelGroup ⇒ nút "Nhãn" tắt cùng các nhãn khác. Tạo ở lần cần đầu tiên (labels-controls.js chạy SAU tệp này) ----
          let tag = null, tagK = 1;
          const TAG_PX = 24, TAG_LEAD_PX = 60, TAG_OUT = new Set(['back', 'ready', 'arm', 'flying', 'land', 'fetch']);
          function tagUpdate() {
            const out = TAG_OUT.has(D.st) || (D.st === 'place' && D.k > 0.8) || (D.st === 'pick' && D.k < 2.4);
            if (!tag) {
              if (!out) return;
              tag = addLabel('Drone DJI Mini 3', '#e0662b', new THREE.Vector3(), new THREE.Vector3(), true);
              const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
              x.beginPath(); x.arc(32, 32, 26, 0, TAU); x.fillStyle = 'rgba(226,214,192,0.55)'; x.fill(); x.lineWidth = 5; x.strokeStyle = 'rgba(58,53,48,0.75)'; x.stroke();
              x.beginPath(); x.arc(32, 32, 10, 0, TAU); x.fillStyle = '#e0662b'; x.fill();
              tag.dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false, depthWrite: false })); tag.dot.renderOrder = 20; labelGroup.add(tag.dot);
            }
            tag.sprite.visible = tag.line.visible = out; if (!out) { tag.dot.visible = false; return; }
            const txt = 'Drone DJI Mini 3 · ' + Math.max(0, Math.round(g.position.y - D.home.y)) + ' m';
            if (txt !== tag.text) { tag.update(txt); tagK = tag.sprite.scale.x / tag.sprite.scale.y; }
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), h = TAG_PX * upp, lead = TAG_LEAD_PX * upp;   // đơn vị thế giới / 1 px CSS (camera trực giao)
            core.getWorldPosition(_p);
            tag.sprite.scale.set(h * tagK, h, 1); tag.sprite.position.set(_p.x, _p.y + lead + h / 2, _p.z);
            const pa = tag.line.geometry.attributes.position; pa.setXYZ(0, _p.x, _p.y + lead, _p.z); pa.setXYZ(1, _p.x, _p.y + 6 * upp, _p.z); pa.needsUpdate = true; tag.line.geometry.computeBoundingSphere();
            tag.dot.visible = 0.5 / upp < 14; tag.dot.position.copy(_p); tag.dot.scale.setScalar(11 * upp);
          }
          // ---- trước lượt vẽ chính: khung tay cầm bám đầu (quay về camera) + dựng ảnh camera drone (cách 1 khung, chỉ khi khung trên màn hình) ----
          let rtK = 0; const _p = new THREE.Vector3(), _cc = new THREE.Color(), COARSE = matchMedia('(pointer: coarse)').matches;
          function renderFrame() {   // ảnh khung tay cầm (cảnh riêng, nền trong suốt), 2 cần nghiêng theo lệnh
            stickPose(fSticks); renderer.getClearColor(_cc); const ca = renderer.getClearAlpha(), auto = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; renderer.setClearColor(0x000000, 0);
            renderer.setRenderTarget(frameRT); renderer.render(fScene, fCam); renderer.setRenderTarget(null); renderer.setClearColor(_cc, ca); renderer.shadowMap.autoUpdate = auto; frameDirty = false;
          }
          function render() {
            placeHeld(); tagUpdate(); if (!bub.visible) return;
            const e = engObj; e.head.getWorldPosition(_p);
            bub.position.set(_p.x, _p.y + 0.42 + FH * 0.5 + 0.25, _p.z); bub.quaternion.copy(camera.quaternion);   // đáy khung cách đỉnh mũ ~0,25
            if (frameDirty && frameRC) renderFrame();   // khung luôn có ảnh kể cả khi còn nhỏ trên màn hình (bản có mây: khung trống tới khi màn đủ 50 px)
            // ảnh camera tốn ~8 ms / lần (vẽ lại cả cảnh) ⇒ 1/3 khung (máy cảm ứng 1/5), và chỉ khi 1 trong 2 màn (khung trên đầu · tay cầm trong tay)
            // nằm trong khung nhìn và cao ≥ 40 px — không thì giữ ảnh cũ (bản trước chỉ xét khung ⇒ zoom thẳng vào tay kỹ sư thì màn tay cầm đứng hình / đen)
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W());
            const seen = (p, px) => { _v.copy(p).project(camera); return px >= 40 && Math.abs(_v.x) < 1.1 && Math.abs(_v.y) < 1.1 && _v.z < 1; };
            if (!seen(bub.position, SH / upp) && !(rcScr && seen(rcScr.getWorldPosition(_w), SCR.h * S / upp))) return;
            if ((rtK++ % (COARSE ? 5 : 3))) return;
            g.updateMatrixWorld(true);
            const auto = renderer.shadowMap.autoUpdate, lgv = labelGroup.visible; renderer.shadowMap.autoUpdate = false; bub.visible = false; g.visible = false; rc.visible = false;   // ẩn cả tay cầm: màn tay cầm đọc chính ảnh đang vẽ (vòng lặp khung)
            labelGroup.visible = false;   // ống kính thật không thấy nhãn (nhãn năng lượng, nhãn drone vẽ đè mọi thứ)
            renderer.setRenderTarget(rt); renderer.render(scene, fpv); renderer.setRenderTarget(null);
            if (frameRC) renderFrame();
            renderer.shadowMap.autoUpdate = auto; labelGroup.visible = lgv; bub.visible = true; g.visible = true; rc.visible = true;
          }
          park();
          return { update, abort, render, park, ready: () => !!rcSrc, state: D, g, rc, bub, rt, osdC, frame: { rt: frameRT, scene: fScene, cam: fCam, draw: () => renderFrame() } };
        })();
