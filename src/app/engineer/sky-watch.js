        // ===== NGẮM SAO + NGẮM MƯA — tự chủ đợt 2 (G 18/10 "ngắm sao, ngắm mưa") =====
        //  NGẮM SAO (pha 'stars', lịch 20:42–21:42 — 1 tiếng trước giờ ngủ 21:45 — hoặc việc tự chủ khi trời tối hẳn): mặt trời < −8°, không mưa, mây < 60%, tới 21:43. Kỹ sư lấy
        //  tấm thảm xốp cuộn dựng ở góc bạt (cạnh cửa lùa) → xách ra bãi cỏ trống phía nam bếp lửa (dò 1 lần: đất phẳng dưới cả tấm thảm, cách vật cản
        //  ≥ 1,3, cách cây ≥ 5 cho thoáng trời, chân quay ra xa lửa) → cúi đặt cuộn ở đầu thảm, đẩy cho cuộn lăn trải ra → bước lên giữa thảm → ngồi xổm
        //  → ngồi bệt (2 tay chống sau) → ngả lưng nằm ngửa, 2 tay gối sau đầu, gối trái co, ~40 s đổi chân co → đảo mắt khắp trời, thở chậm; SAO BĂNG
        //  (core/night-sky.js meteors) đủ sáng ⇒ quay đầu theo vệt + giơ tay phải chỉ, "Sao băng kìa!" → hết giờ / mây kéo tới / mưa: ngồi dậy, đứng lên,
        //  bước ra đầu thảm, cúi cuộn thảm lại, xách về dựng chỗ cũ. Đang nằm mà lịch đổi việc thì engWantAct giữ 'stars' tới khi cất thảm xong.
        //  Tư thế nằm: kỹ sư xoay thứ tự YXZ (instance-gait) ⇒ rotation.x = −π/2 là ngửa mặt lên trời quanh trục ngang thân; gốc toạ độ tính ngược từ
        //  điểm hông (hông = điểm xoay của dáng ngồi / nằm) để ngồi xuống, ngả lưng quanh hông như người thật.
        //  KÍNH THIÊN VĂN + MÀN HÌNH + THIÊN HÀ MINI + CHÓ (G 19/10 "add glb telescope và gắn thêm ipad size screen at the back so engineer vừa nằm vừa xem,
        //  khi nằm xem thì trên đầu engineer hiện lên miniature galaxy rotate, zoom in and out slowly như đang dò tìm ngôi sao cho đến khi hết ngắm sao; khi
        //  ngắm sao thì chó cũng ra nằm bên cạnh"): mẫu "Telescope" (sieminskaola, CC-BY-4.0) dựng lại bằng src/tools/stargaze/ → models/telescope.glb 59 KB
        //  (kính khúc xạ trên chân ba càng cao 1,40 m, 3,9k tam giác màu đỉnh, điểm neo trong extras), ×1,1 đv/m — G 20/10 "cất kính, khi nào ngắm sao mới đem ra": cất trong
        //  xe; lấy thảm ở cửa xe thì cầm luôn kính tay phải, xách chéo (ống trước, chân ra sau) → đặt xuống chỗ dựng → trải thảm … cuộn thảm → nhấc kính → xách về cất ('tset' / 'tgo' / 'tget'); chỗ dựng cạnh đầu thảm phía trống hơn,
        //  đuôi ống (chỗ thị kính) quay về mặt người nằm. Màn hình cỡ iPad 11" (24,8 × 17,9 cm) trên tay đỡ từ đuôi ống, mặt màn hướng về mắt người nằm: ảnh
        //  kính đang dò (trường sao trôi, ô ngắm đỏ chế độ đêm, thiên hà đích nét dần khi khoá) — canvas 256 × 176 vẽ 8 lần/giây lúc nằm, thôi thì tắt màn.
        //  Nằm thì cứ vài nhịp đảo mắt lại quay đầu xem màn hình. THIÊN HÀ MINI: mẫu "Need some space?" (Loïc Norgeot, CC-BY-4.0) → models/galaxy.glb 76 KB
        //  (10k điểm màu; tâm lõi, mặt đĩa XZ, bán kính 90% = 1) — đám điểm cộng sáng trên đầu kỹ sư khi nằm: tự quay; cứ ~15 s chọn 1 sao trong nhánh xoắn,
        //  phóng to chậm quanh nó (sao đích dời về giữa khối cầu cắt), dừng ngắm, thu nhỏ về toàn cảnh — như đang dò tìm; màn hình kính dò theo cùng nhịp.
        //  CHÓ: kỹ sư bước lên thảm ⇒ chó (kể cả đang ngủ trong xe) ra nằm sát thảm phía bên kia, song song chủ, lim dim; sao băng thì ngẩng nhìn theo;
        //  chủ ngồi dậy thì về chỗ (đêm: vào xe) — animals/dog-brain.js 'stars'.
        //  NGẮM MƯA (pha 'rainwatch'): đang trú mưa dưới hiên, cứ 4–7 phút đứng dậy ra mép trước bạt (trong vùng khô) đứng 70–110 s: nhìn mưa ngoài
        //  hồ, ngẩng nhìn mép bạt nhỏ giọt, ngửa tay hứng mưa, khoanh tay; rồi về ghế. Cũng là việc tự chủ khi mưa (lấp Giải trí) ----
        const skyWatch = (() => {
          const ML = 1.75, MW = 0.85, R0 = 0.07, RMIN = 0.012, HY = ENG_HIP_Y * engObj.g.scale.y;   // thảm xốp (đv): dài · rộng · bán kính cuộn · hông trên gốc khi đứng
          const S = { st: 'idle', k: 0, u: 0, roll: 'home', spot: null, stop: false, done: -1e9, seen: new WeakSet(), pt: null, gz: { y: 0, p: 0.15, t: 0 }, leg: 1, legT: 0, spin: 0 };
          const UP = new THREE.Vector3(0, 1, 0), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
          // ---- thảm: tấm sọc xanh (canvas 16 × 64) + cuộn trụ ----
          const cv = document.createElement('canvas'); cv.width = 16; cv.height = 64; const cx = cv.getContext('2d');
          for (let i = 0; i < 64; i += 8) { cx.fillStyle = i % 16 ? '#3d6f90' : '#2c5877'; cx.fillRect(0, i, 16, 8); }
          cx.fillStyle = '#d8c9a2'; cx.fillRect(0, 0, 1, 64); cx.fillRect(15, 0, 1, 64);   // viền may 2 mép dọc
          const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
          const mat = new THREE.Group(); mat.name = 'Thảm ngắm sao'; scene.add(mat);
          const sheetGeo = new THREE.PlaneGeometry(MW, ML); sheetGeo.rotateX(-Math.PI / 2); sheetGeo.translate(0, 0, ML / 2);   // đầu thảm ở gốc, trải theo +z
          const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshLambertMaterial({ map: tex })); sheet.position.y = 0.012; sheet.receiveShadow = true; mat.add(sheet); mat.visible = false;
          const roll = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, MW, 14), new THREE.MeshLambertMaterial({ color: 0x35627f })); roll.name = 'Thảm ngắm sao (cuộn)'; roll.castShadow = true; scene.add(roll);
          for (const o of [mat, sheet, roll]) o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true;
          // chỗ dựng cuộn thảm: sát vách xe, bên trái cửa lùa, dưới bạt · chỗ đứng lấy (0,55 trước cuộn)
          const HOME = vanPt(-0.62, 0, 1.22), HOME_ST = vanPt(-0.62, 0, 1.8); HOME.y = cowY(HOME.x, HOME.z);
          const homeRoll = () => { roll.position.set(HOME.x, HOME.y + MW / 2, HOME.z); roll.quaternion.identity(); roll.scale.set(R0, 1, R0); roll.visible = true; };
          homeRoll(); ENG_PROPS.push({ x: HOME.x, z: HOME.z, r: 0.12 });
          // ---- kính thiên văn + màn hình + thiên hà mini (xem đầu tệp) ----
          const TEL = { g: null, scr: null, holo: null, an: null, sd: 1, out: false, lift: 0, mv: 0, sc: new THREE.Vector3(), dog: null, scrOn: false, scrT: 0, op: 0, ph: 'out', pk: 0, e: 0, sl: 1, z: 1, tgt: new THREE.Vector3(), from: new THREE.Vector3(), v: [1.5, 1, 1.5, 1], n: 0 };
          const scv = document.createElement('canvas'); scv.width = 256; scv.height = 176; const scx = scv.getContext('2d'), scTex = new THREE.CanvasTexture(scv); scTex.colorSpace = THREE.SRGBColorSpace; scTex.userData.live = 1;
          const SCR_ST = Array.from({ length: 170 }, () => [Math.random() * 3, Math.random() * 2, Math.pow(Math.random(), 3.2)]);   // trường sao ảo 3 × 2 màn (x, y, độ sáng)
          function screenDraw(t) {   // màn kính: tắt = đen bóng · bật = trường sao trôi theo hướng kính, ô ngắm đỏ, thiên hà đích, chữ trạng thái
            const W = 256, H = 176; scTex.needsUpdate = true;
            if (!TEL.scrOn) { scx.fillStyle = '#121418'; scx.fillRect(0, 0, W, H); scx.fillStyle = 'rgba(255,255,255,0.05)'; scx.fillRect(0, 0, W * 0.55, H * 0.4); return; }
            const bg = scx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.62); bg.addColorStop(0, '#16285a'); bg.addColorStop(1, '#070d24'); scx.fillStyle = bg; scx.fillRect(0, 0, W, H);
            const V = TEL.v, k = TEL.sl, vx = V[0] + (V[2] - V[0]) * k, vy = V[1] + (V[3] - V[1]) * k, z = 1 + (TEL.z - 1) * 0.9, sc = W * 0.55 * z;
            const wr = (a, m) => a - m * Math.round(a / m);
            for (const [x, y, b] of SCR_ST) { const px = W / 2 + wr(x - vx, 3) * sc, py = H / 2 + wr(y - vy, 2) * sc; if (px < -4 || px > W + 4 || py < -4 || py > H + 4) continue;
              scx.globalAlpha = 0.35 + 0.65 * b; scx.fillStyle = b > 0.6 ? '#fff4dc' : '#dfe8ff'; scx.beginPath(); scx.arc(px, py, (0.9 + 2.2 * b) * Math.sqrt(z), 0, TAU); scx.fill(); }
            const gx = W / 2 + wr(V[2] - vx, 3) * sc, gy = H / 2 + wr(V[3] - vy, 2) * sc, gr = 9 * z;   // thiên hà đích: lõi sáng + đĩa nghiêng mờ
            scx.save(); scx.translate(gx, gy); scx.rotate(0.6 + t * 0.02); scx.scale(1, 0.45); const gd = scx.createRadialGradient(0, 0, 0, 0, 0, gr * 2.2);
            gd.addColorStop(0, 'rgba(255,246,222,0.95)'); gd.addColorStop(0.18, 'rgba(220,214,255,0.45)'); gd.addColorStop(1, 'rgba(120,130,200,0)'); scx.globalAlpha = 1; scx.fillStyle = gd; scx.beginPath(); scx.arc(0, 0, gr * 2.2, 0, TAU); scx.fill(); scx.restore();
            scx.globalAlpha = 1; scx.strokeStyle = scx.fillStyle = '#ff5a48'; scx.lineWidth = 2; const lk = TEL.ph === 'lock';
            scx.beginPath(); scx.arc(W / 2, H / 2, lk ? 13 + Math.sin(t * 6) : 18, 0, TAU); scx.stroke();
            for (const [a, b, c, d] of [[-34, 0, -8, 0], [8, 0, 34, 0], [0, -34, 0, -8], [0, 8, 0, 34]]) { scx.beginPath(); scx.moveTo(W / 2 + a, H / 2 + b); scx.lineTo(W / 2 + c, H / 2 + d); scx.stroke(); }
            scx.font = 'bold 13px monospace'; scx.fillText(lk ? 'TRACKING  NGC ' + (1000 + TEL.n * 377 % 7000) : TEL.ph === 'in' ? 'GOTO  ' + Math.round(k * 100) + '%' : 'SCAN', 8, 16); scx.fillText('x' + (z * 40).toFixed(0), W - 38, H - 9);
          }
          screenDraw(0);
          const holoU = { uZ: { value: 1 }, uC: { value: new THREE.Vector3() }, uQ: { value: new THREE.Vector4(0, 0, 0, 1) }, uR: { value: 1.15 }, uPx: { value: 1 }, uOp: { value: 0 } };
          const holoMat = new THREE.ShaderMaterial({ uniforms: holoU, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `uniform float uZ, uR, uPx, uOp; uniform vec3 uC; uniform vec4 uQ; varying vec3 vC; varying float vA;
              void main() { vec3 p = (position * uQ.w + uQ.xyz - uC) * uZ; vA = uOp * (1.0 - smoothstep(uR * 0.72, uR, length(p))); vC = color.rgb;
                vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
                float ps = uPx * sqrt(uZ) * projectionMatrix[1][1] * (projectionMatrix[2][3] < -0.5 ? 1.0 / -mv.z : 1.0); gl_PointSize = max(1.0, ps); vA *= min(1.0, ps * ps);   // điểm nhỏ hơn 1 px: mờ theo diện tích phủ
                if (vA < 0.003) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }`,
            fragmentShader: `varying vec3 vC; varying float vA; void main() { vec2 q = gl_PointCoord - 0.5; float r = dot(q, q); if (r > 0.25) discard; gl_FragColor = vec4(vC, vA * (1.0 - 3.2 * r)); }` });
          function telPlace() {   // dựng kính cạnh đầu thảm (phía trống hơn), màn hình hướng về mắt người nằm, chỗ nằm của chó phía bên kia
            const P = spot(), A = TEL.an; if (!P || !TEL.g) return;
            const head = P.c.clone().addScaledVector(P.f, -0.72), clr = sd => { const x = head.x + P.f.x * 0.12 + P.side.x * sd, z = head.z + P.f.z * 0.12 + P.side.z * sd; let m = 9; for (const o of obstacleCoords) m = Math.min(m, Math.hypot(o.x - x, o.z - z) - o.r); for (const o of ENG_PROPS) m = Math.min(m, Math.hypot(o.x - x, o.z - z) - o.r); return m; };
            TEL.sd = clr(1) >= clr(-1) ? 1 : -1;
            const base = head.clone().addScaledVector(P.f, 0.12).addScaledVector(P.side, TEL.sd), yaw = Math.atan2(head.x - base.x, head.z - base.z), g = TEL.g;
            g.rotation.y = yaw; g.scale.setScalar(1.1); const ob = new THREE.Vector3(...A.base).multiplyScalar(1.1).applyAxisAngle(UP, yaw);
            g.position.set(base.x - ob.x, cowY(base.x, base.z), base.z - ob.z); g.updateMatrixWorld(true);
            ENG_PROPS.push({ x: base.x, z: base.z, r: 0.45 }); obstacleCoords.push({ x: base.x, y: g.position.y, z: base.z, r: 0.5, h: 1.7 });
            const back = g.localToWorld(new THREE.Vector3(...A.back)), eye = head.clone(); eye.y = P.c.y + 0.17;
            // màn: tay đỡ từ đuôi ống chúc xuống, tâm màn cao 0,72 cách chân kính 0,45 về phía đầu người nằm; mặt màn quay về đầu, chúc 6° (người nằm nghiêng
            //  đầu sang là xem được; camera nhìn từ trên vẫn thấy mặt màn — hướng thẳng vào mắt thì màn chúc gần như úp xuống, nhìn từ trên chỉ thấy lưng)
            TEL.sc.set(base.x + (head.x - base.x) * 0.45, P.c.y + 0.72, base.z + (head.z - base.z) * 0.45);
            const scr = TEL.scr; scr.position.copy(TEL.sc); scr.lookAt(_a.set(head.x, TEL.sc.y - 0.1 * Math.hypot(head.x - TEL.sc.x, head.z - TEL.sc.z), head.z)); scene.add(scr); scr.updateMatrixWorld(true);
            TEL.p0 = g.position.clone(); TEL.q0 = g.quaternion.clone(); TEL.grip = new THREE.Vector3(A.base[0], 0.9, A.base[2]).multiplyScalar(1.1); TEL.base = base.clone();   // đầu chân kính (chỗ cầm)
            TEL.drop = base.clone().add(_a.subVectors(head, base).setY(0).normalize().multiplyScalar(0.6)); g.visible = false;   // chỗ đứng đặt / nhấc kính (giữa kính và đầu thảm) · cất trong xe tới khi ngắm sao
            const arm = scr.getObjectByName('arm'), bl = scr.worldToLocal(back.clone()); arm.scale.y = bl.length(); arm.quaternion.setFromUnitVectors(UP, bl.clone().normalize()); arm.position.copy(bl).multiplyScalar(0.5); g.attach(scr);   // tay đỡ: sau lưng màn → đuôi ống · màn đi theo kính khi xách
            TEL.dog = null; dogSpotOf();
          }
          function dogSpotOf() {   // chỗ nằm của chó: sát mép thảm phía không có kính, ngang ngực chủ, đầu về phía đầu thảm, hơi quay vào chủ
            const P = spot(); if (!P) return null;
            return TEL.dog || (TEL.dog = { x: P.c.x - P.side.x * TEL.sd * 0.82 - P.f.x * 0.15, z: P.c.z - P.side.z * TEL.sd * 0.82 - P.f.z * 0.15, yaw: Math.atan2(-P.f.x, -P.f.z) - TEL.sd * 0.25 });
          }
          {   // màn hình iPad: khung nhôm tối + mặt kính (canvas) + tay đỡ (trụ cao 1, kéo dài tới đuôi ống)
            const scr = new THREE.Group(); scr.name = 'Màn hình kính thiên văn';
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.272, 0.196, 0.008), new THREE.MeshLambertMaterial({ color: 0x2a2c30 })); scr.add(body);
            const face = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.174), new THREE.MeshBasicMaterial({ map: scTex, toneMapped: false })); face.position.z = 0.0045; scr.add(face);
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 6), new THREE.MeshLambertMaterial({ color: 0x1c1d20 })); arm.name = 'arm'; scr.add(arm);
            scr.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; if (o.isMesh) o.castShadow = true; });
            TEL.scr = scr;
          }
          { const TEL_GLB = window.__teleGlb || 'https://michaeltran75.github.io/3d-garden/models/telescope.glb', GAL_GLB = window.__galGlb || 'https://michaeltran75.github.io/3d-garden/models/galaxy.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
            Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
              .then(([{ GLTFLoader }, { MeshoptDecoder }]) => { const L = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder); return Promise.all([L.loadAsync(TEL_GLB), L.loadAsync(GAL_GLB)]); })
              .then(([tg, gg]) => {
                const g = new THREE.Group(); g.name = 'Kính thiên văn (Telescope)'; TEL.an = tg.scene.getObjectByName('telescope').userData; g.add(tg.scene);
                g.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; if (o.isMesh) { o.material = new THREE.MeshLambertMaterial({ vertexColors: true }); o.castShadow = true; } });
                scene.add(g); TEL.g = g; telPlace();
                let pts = null; gg.scene.traverse(o => { if (o.isPoints) pts = o; });
                holoU.uQ.value.set(pts.position.x, pts.position.y, pts.position.z, pts.scale.x);   // phép giải lượng tử (int16 chuẩn hoá → toạ độ mẫu) làm trong shader
                const H = new THREE.Points(pts.geometry, holoMat); H.name = 'Thiên hà mini'; H.frustumCulled = false; H.visible = false; H.scale.setScalar(0.3); H.rotation.x = 0.42; H.userData.noBatch = H.userData.noCollide = true;
                scene.add(H); TEL.holo = H;
              }).catch(err => console.warn('kính thiên văn / thiên hà:', err));
          }
          function telTick(e, dt, t) {   // mỗi khung: kính xách / đặt theo bàn tay phải, màn kính bật khi nằm, thiên hà mini trên đầu (tự quay + nhịp dò tìm), màn kính dò theo
            if (!TEL.g || !TEL.p0) return;
            const G = TEL.g; G.visible = TEL.out;
            if (TEL.out && TEL.lift > 0.001) {   // TEL.lift: 0 đứng trên chỗ dựng · 1 xách chéo trong tay phải (ống trước, chân ra sau)
              e.wrists[0].updateWorldMatrix(true, false); e.wrists[0].localToWorld(_b.set(0, -0.02, 0.05));
              _q.setFromAxisAngle(UP, e.g.rotation.y + Math.PI).multiply(_q2.setFromAxisAngle(_c.set(1, 0, 0), -0.95)); G.quaternion.copy(TEL.q0).slerp(_q, TEL.lift);
              _c.copy(TEL.grip).applyQuaternion(TEL.q0).add(TEL.p0).lerp(_b, TEL.lift); G.position.copy(_c).sub(_a.copy(TEL.grip).applyQuaternion(G.quaternion)); TEL.mv = 1;
            } else if (TEL.mv) { TEL.mv = 0; G.position.copy(TEL.p0); G.quaternion.copy(TEL.q0); }
            const lying = S.st === 'down' || S.st === 'lie', on = S.st === 'lie' && S.k > 1.5;
            if (lying !== TEL.scrOn) { TEL.scrOn = lying; screenDraw(t); }
            TEL.op += ((on ? 1 : 0) - TEL.op) * (1 - Math.exp(-dt * (on ? 0.7 : 2.2)));
            const H = TEL.holo; if (!H) return; H.visible = TEL.op > 0.01; if (!H.visible) { TEL.ph = 'out'; TEL.pk = 0; TEL.e = 0; TEL.z = 1; return; }
            e.head.getWorldPosition(H.position); H.position.y += 0.62; H.rotation.y += dt * 0.14;
            TEL.pk += dt; const sm2 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
            if (TEL.ph === 'out' && TEL.pk > 3.5) {   // chọn sao đích trong nhánh xoắn (0,3 – 0,9 bán kính)
              const P = H.geometry.attributes.position, Q = holoU.uQ.value;
              for (let i = 0; i < 40; i++) { const j = (Math.random() * P.count) | 0; TEL.tgt.set(P.getX(j), P.getY(j), P.getZ(j)).multiplyScalar(Q.w).add(_a.set(Q.x, Q.y, Q.z)); const r = Math.hypot(TEL.tgt.x, TEL.tgt.z); if (r > 0.3 && r < 0.9) break; }
              TEL.ph = 'in'; TEL.pk = 0; TEL.n++; TEL.v[0] = TEL.v[2]; TEL.v[1] = TEL.v[3]; TEL.v[2] = Math.random() * 3; TEL.v[3] = Math.random() * 2;
            } else if (TEL.ph === 'in' && TEL.pk > 6.5) { TEL.ph = 'lock'; TEL.pk = 0; }
            else if (TEL.ph === 'lock' && TEL.pk > 3.2) { TEL.ph = 'back'; TEL.pk = 0; }
            else if (TEL.ph === 'back' && TEL.pk > 5) { TEL.ph = 'out'; TEL.pk = 0; }
            TEL.e = TEL.ph === 'in' ? sm2(TEL.pk / 6.5) : TEL.ph === 'lock' ? 1 : TEL.ph === 'back' ? 1 - sm2(TEL.pk / 5) : 0; TEL.sl = TEL.ph === 'in' ? sm2(TEL.pk / 4.5) : 1;   // màn kính: lia tới đích rồi giữ đích khi thu nhỏ
            TEL.z = 1 + 2.4 * TEL.e; holoU.uZ.value = TEL.z; holoU.uC.value.copy(TEL.tgt).multiplyScalar(TEL.e);   // sao đích dời dần về giữa khi phóng to
            holoU.uOp.value = 0.5 * TEL.op; holoU.uPx.value = 0.0042 * renderer.domElement.height / 2;
            if (TEL.scrOn && (TEL.scrT -= dt) <= 0) { TEL.scrT = 0.12; screenDraw(t); }
          }
          // ---- chỗ trải thảm: bãi cỏ trống quanh bếp lửa (dò 1 lần) ----
          function findSpot() {
            let best = null, bs = -1e9;
            for (let a = 0; a < 72; a++) for (let r = 4; r <= 8; r += 0.5) {
              const an = a / 72 * TAU, x = pf.x + Math.cos(an) * r, z = pf.z + Math.sin(an) * r, yaw = Math.atan2(x - pf.x, z - pf.z), fx = Math.sin(yaw), fz = Math.cos(yaw), y0 = cowY(x, z);
              let ok = true;
              for (let u = -1.15; u <= 1.15 && ok; u += 0.23) for (let v = -0.55; v <= 0.55; v += 0.275) { const px = x + fx * u + fz * v, pz = z + fz * u - fx * v; if (Math.abs(cowY(px, pz) - y0) > 0.02 || isWater(Math.round(x2gi(px)), Math.round(z2gj(pz)))) { ok = false; break; } }
              if (!ok || rxDry(_a.set(x, y0, z))) continue;
              let clr = 99; for (const o of obstacleCoords) clr = Math.min(clr, Math.hypot(o.x - x, o.z - z) - o.r); for (const o of ENG_PROPS) clr = Math.min(clr, Math.hypot(o.x - x, o.z - z) - o.r);
              let tr = 99; for (const t of treeCoords) tr = Math.min(tr, Math.hypot(t.x - x, t.z - z)); for (const t of appleTrees) tr = Math.min(tr, Math.hypot(t.position.x - x, t.position.z - z));
              if (clr < 1.3 || tr < 5) continue;
              const s = Math.min(clr, 2.6) - 0.35 * Math.abs(r - 4.5); if (s > bs) { bs = s; best = { c: new THREE.Vector3(x, y0, z), yaw, f: new THREE.Vector3(fx, 0, fz) }; }
            }
            if (!best) return null;
            const c = best.c, f = best.f; best.head = c.clone().addScaledVector(f, -ML / 2); best.unroll = c.clone().addScaledVector(f, -ML / 2 - 0.42); best.on = c.clone().addScaledVector(f, 0.18);
            best.side = new THREE.Vector3(f.z, 0, -f.x); return best;
          }
          const spot = () => S.spot === null ? (S.spot = findSpot() || false) : S.spot;
          const cloud = () => { const w = liveWeather.state, c = w.fresh ? w.data?.current : null; return c && Number.isFinite(c.cloud_cover) ? c.cloud_cover / 100 : 0.3; };
          const ok = hh => hh >= 18 && hh < ENG_SLEEP_H - 0.03 && sunElevSin < -0.139 && !liveWeather.state.raining && cloud() < 0.6 && !!spot();   // tối hẳn (mặt trời < −8°), trời quang
          // ---- tư thế đứng → ngồi xổm → ngồi bệt → nằm ngửa theo s (0 – 1): khoá [hông trên đất, gập thân rx, hông phải/trái, gối phải/trái, dời hông dọc thảm] ----
          const KEY = [[0, HY - ENG_FEET, 0, 0, 0, 0, 0, 0.18], [0.3, 0.36, 0.32, -1.75, -1.75, 2.25, 2.25, 0.18], [0.6, 0.1, -0.32, -1.25, -1.3, 1.6, 1.7, 0.1], [1, 0.125, -Math.PI / 2, -0.04, -0.95, 0.08, 1.55, 0.1]];   // nằm: hông lệch 0,1 về phía chân ⇒ cả người nằm gọn trên thảm 1,75
          const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          function pose(e, s) {   // đặt gốc, xoay, khớp chân theo s; trả lại [i khoá, tỉ lệ trong đoạn]
            let i = 0; while (i < KEY.length - 2 && s > KEY[i + 1][0]) i++;
            const A = KEY[i], B = KEY[i + 1], u = sm((s - A[0]) / (B[0] - A[0])), L = j => A[j] + (B[j] - A[j]) * u;
            const P = S.spot, g = e.g, rx = L(2), yaw = P.yaw, h = L(1), al = L(7);
            g.rotation.set(rx, yaw, 0);
            const hip = _a.copy(P.c).addScaledVector(P.f, al); hip.y = P.c.y + h + (s > 0.6 ? 0.012 * (1 - Math.abs(rx + Math.PI / 2) / 1.25) : 0);
            g.position.set(hip.x - Math.sin(yaw) * HY * Math.sin(rx), hip.y - HY * Math.cos(rx), hip.z - Math.cos(yaw) * HY * Math.sin(rx));
            const kL = S.legK ?? 0, legs = [L(3), L(4)], knees = [L(5), L(6)];   // nằm lâu: đổi chân co (S.legK 0 → 1 mượt)
            if (s >= 0.999) { legs[0] = -0.04 + (-0.95 + 0.04) * kL; legs[1] = -0.95 + (0.95 - 0.04) * kL; knees[0] = 0.08 + (1.55 - 0.08) * kL; knees[1] = 1.55 - (1.55 - 0.08) * kL; }
            for (let j = 0; j < 2; j++) { e.legs[j].rotation.x = legs[j]; e.knees[j].rotation.x = knees[j]; }
            e.noFootIK = true; e.seatCtl = true; e.armsBusy = true; e.vel = 0;
            return [i, u];
          }
          function hands(e, s, t) {   // tay: buông → chống sau lưng trên thảm → gối sau đầu (+ chỉ sao băng tay phải)
            if (s < 0.3) return;
            const P = S.spot, ax = engAxesW(e), wPlant = sm((s - 0.32) / 0.2) * (1 - sm((s - 0.66) / 0.24)), wHead = sm((s - 0.72) / 0.26);
            for (let i = 0; i < 2; i++) {
              const sd = i ? 1 : -1;   // tay phải (0) bên phải thân = −side
              let p = null, q = null;
              if (wHead > 0.001) {   // 2 tay đan sau gáy: bàn tay sau đầu, khuỷu xoè ra hai bên
                p = engBodyW(e, sd * 0.15, 2.0, -0.17, i ? _b : _c); p.y = Math.max(p.y, P.c.y + 0.05 + 0.4 * (1 - wHead)); q = aimQ(i ? _q2 : _q, _a.copy(ax.r).multiplyScalar(sd), ax.f);   // lót dưới gáy, không lún xuống đất
                (e.elbowPole || (e.elbowPole = [null, null]))[i] = (S.poles || (S.poles = [new THREE.Vector3(-1, 0.25, 0.55), new THREE.Vector3(1, 0.25, 0.55)]))[i];
              }
              if (wPlant > 0.001) {   // chống tay trên thảm phía sau hông, ngón chỉ về đầu thảm
                const pp = _a.copy(P.c).addScaledVector(P.f, -0.38).addScaledVector(P.side, -sd * 0.28); pp.y = P.c.y + 0.035;
                if (p) p.lerp(pp, wPlant); else p = (i ? _b : _c).copy(pp);
                const qq = aimQ(_q3, _a.set(0, -1, 0), P.f); q = q ? q.slerp(qq, wPlant) : qq;
              }
              if (p) { if (i === 0 && S.pt && S.pt.w > 0.01) continue; engHandSet(e, i, p, q); }
            }
          }
          function gaze(e, dt, t) {   // nằm: đảo mắt quanh trời mỗi 5–11 s, ~45% số lần quay sang xem màn hình kính 7–13 s · sao băng: quay theo vệt
            const G = S.gz; G.t -= dt;
            if (G.t <= 0 && !S.pt) { G.scr = !!TEL.g && Math.random() < 0.45; G.t = G.scr ? 7 + 6 * Math.random() : 5 + 6 * Math.random(); G.ty = (Math.random() - 0.5) * 1.3; G.tp = 0.22 + 0.35 * Math.random(); }
            let ty = G.ty ?? 0, tp = G.tp ?? 0.35;   // nằm: cằm hơi thu (tay lót gáy, mũ không cấn đất)
            const dir = S.pt && S.pt.dir ? S.pt.dir : G.scr && TEL.g ? _c.subVectors(TEL.sc, e.head.getWorldPosition(_b)).normalize() : null;
            if (dir) {   // hướng vệt sao băng / màn hình trong khung thân (thân ngửa: +z thân = trời)
              e.spine.getWorldQuaternion(_q2).invert(); const d = _a.copy(dir).applyQuaternion(_q2);
              ty = Math.max(-0.9, Math.min(0.9, Math.atan2(d.x, d.z))); tp = Math.max(0.2, Math.min(0.7, 0.3 + Math.atan2(-d.y, Math.hypot(d.x, d.z))));
            }
            G.y += (ty - G.y) * (1 - Math.exp(-dt * 2.2)); G.p += (tp - G.p) * (1 - Math.exp(-dt * 2.2));
            e.headYawT = G.y; e.head.rotation.x = G.p;
          }
          function meteors(e, dt, t) {   // sao băng mới đủ sáng ⇒ chỉ tay theo vệt 2,6 s
            const M = nightSky.meteors;
            if (!S.pt) for (const m of M) {
              if (S.seen.has(m)) continue; S.seen.add(m);
              if (m.m > nightSky.lim - 0.8 || m.t > m.dur * 0.6) continue;   // mờ quá / sắp tắt: mắt kịp thấy cũng không kịp chỉ
              const arm = clock.elapsedTime - (S.ptAt ?? -1e9) > 45; if (arm) S.ptAt = clock.elapsedTime;   // chỉ tay tối đa 1 lần / 45 s; vệt khác chỉ quay đầu nhìn theo
              S.pt = { m, k: 0, w: 0, arm, dir: new THREE.Vector3() }; S.nMet = (S.nMet || 0) + 1;
              if (arm) { rxSay('meteor', ['Sao băng kìa!', 'Sao băng! Ước kịp không nhỉ…', 'Thêm một vệt sao băng nữa.'], 'Ngắm sao', true); envNeed(5, 4); } break;
            }
            const P = S.pt; if (!P) return;
            P.k += dt; const m = P.m, kk = Math.min(1, (m.t || 0) / m.dur); P.dir.copy(m.d0).lerp(m.d1, Math.min(1, kk + 0.15)).normalize();
            P.w = P.arm ? sm(P.k / 0.45) * (1 - sm((P.k - 2.1) / 0.5)) : 0;
            if (P.w > 0.01) {   // tay phải rời gáy, duỗi chỉ theo vệt
              e.arms[0].getWorldPosition(_a); const d = P.dir, palm = _b.set(0, -1, 0).addScaledVector(d, d.y); if (palm.lengthSq() < 1e-4) palm.copy(S.spot.f); palm.normalize();
              const head = engBodyW(e, -0.15, 2.0, -0.17, _c), tip = _a.clone().addScaledVector(d, 0.45 * e.g.scale.y / 0.79);
              engHandSet(e, 0, head.lerp(tip, P.w), aimQ(_q, palm, _a.copy(d).negate()));
            }
            if (P.k > 2.6) S.pt = null;
          }
          const fields = new Map(), fieldOf = p => { let f = fields.get(p); if (!f) fields.set(p, f = buildFlowField(p.x, p.z)); return f; };   // bảng dẫn đường tới từng đích (dựng lần đầu cần)
          function walkTo(e, p, dt, t) { return engStep(e, p, dt, t, pf, FIRE_AVOID_R, rxDry(e.g.position) || rxDry(p) ? null : fieldOf(p)); }   // dưới bạt: né cục bộ (ô lưới quanh xe bị chặn)
          function crouch(e, sq, at) {   // cúi / ngồi xổm nhặt – đặt (như hái táo): hạ hông, gập gối, cúi người, nhìn chỗ tay
            e.noFootIK = true; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.22 * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -0.95 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.6 * sq; e.lean = 0.12 * sq; e.spineT = { x: 0.35 * sq, y: 0 };
            if (at) { e.g.rotation.y += Math.atan2(Math.sin(Math.atan2(at.x - e.g.position.x, at.z - e.g.position.z) - e.g.rotation.y), Math.cos(Math.atan2(at.x - e.g.position.x, at.z - e.g.position.z) - e.g.rotation.y)) * 0.15; rxLook('job', 3.5, 0.3, at); }
          }
          const go = st => { S.st = st; S.k = 0; };
          function setRoll(u) {   // cuộn đang trải: u = phần đã trải (0 – 1); cuộn lăn dọc thảm, bán kính nhỏ dần
            const P = S.spot; S.u = u; mat.visible = u > 0.002; sheet.scale.z = Math.max(0.002, u);
            const r = Math.sqrt(RMIN * RMIN + (R0 * R0 - RMIN * RMIN) * (1 - u)), p = _a.copy(P.head).addScaledVector(P.f, u * ML);
            S.spin = u * ML / Math.max(r, 0.02);
            roll.position.set(p.x, P.c.y + r + 0.004, p.z); roll.scale.set(r, 1, r); roll.visible = u < 0.995;
            roll.quaternion.setFromUnitVectors(UP, P.side).premultiply(_q.setFromAxisAngle(P.side, S.spin));
          }
          function telHand(e) {   // trước IK: tay phải cầm đầu chân kính — bên hông khi xách, đưa ra chỗ dựng khi đặt / nhấc
            if (!TEL.p0 || !TEL.out || TEL.lift <= 0.001) return;
            const p = engBodyW(e, -0.36, 1.05, 0.1, _b); if (TEL.lift < 1) p.lerp(_c.copy(TEL.grip).applyQuaternion(TEL.q0).add(TEL.p0), 1 - TEL.lift);
            engHandSet(e, 0, p, aimQ(_q, _a.set(Math.sin(e.g.rotation.y), 0, Math.cos(e.g.rotation.y)), UP)); e.armsBusy = true;
          }
          function update(e, dt, t) {   // pha 'stars' · xong (thảm đã cất) thì đặt S.done
            const P = spot(); if (!P) { S.st = 'idle'; return true; }
            S.k += dt; const k = S.k; telHand(e);
            if (S.st === 'idle') { S.stop = false; S.nMet = 0; mat.position.copy(P.head); mat.rotation.y = P.yaw; go(S.roll === 'home' ? 'fetch' : 'go'); }
            if (S.roll === 'hand' && (S.st === 'go' || S.st === 'back')) { e.arms[1].rotation.x = 0.06; (e.armRollT || (e.armRollT = [0, 0]))[1] = 0.14; e.armsBusy = true; }
            switch (S.st) {
              case 'fetch': if (S.stop) { go('idle'); return true; } if (walkTo(e, HOME_ST, dt, t)) go('pick'); else if (k > 60) { go('idle'); return true; } break;
              case 'pick': case 'put': {   // cúi lấy / dựng cuộn thảm ở góc bạt
                engStandStill(e); const sq = sm(k / 0.6) * (1 - sm((k - 0.9) / 0.6)); crouch(e, sq, HOME); e.armsBusy = true;
                engHandSet(e, 1, _b.set(HOME.x, HOME.y + MW * 0.55, HOME.z), aimQ(_q, _a.subVectors(HOME, e.g.position).setY(0).normalize(), UP));
                if (k > 0.8) { if (S.st === 'pick') { S.roll = 'hand'; if (TEL.p0 && !TEL.out) { TEL.out = true; TEL.lift = 1; } } else { TEL.out = false; TEL.lift = 0; if (S.roll === 'hand') { S.roll = 'home'; homeRoll(); } } }   // lấy kính trong cửa xe cùng cuộn thảm · cất cả 2
                if (k > 1.5) { if (S.st === 'pick') go('go'); else { go('idle'); S.done = clock.elapsedTime; return true; } }
                break;
              }
              case 'go': { const tc = TEL.out && TEL.lift > 0.5 && !S.stop; if (walkTo(e, S.stop ? HOME_ST : tc ? TEL.drop : P.unroll, dt, t)) go(S.stop ? 'put' : tc ? 'tset' : 'unroll'); else if (k > 90) go('back'); break; }   // xách kính: đặt kính trước rồi mới trải thảm
              case 'tset': case 'tget': {   // đặt kính xuống chỗ dựng / nhấc kính lên: quay về phía kính, khuỵu nhẹ, tay phải đưa đầu chân kính
                engStandStill(e); const yt = Math.atan2(TEL.base.x - e.g.position.x, TEL.base.z - e.g.position.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 5);
                const u = sm((k - 0.3) / 1.1); TEL.lift = S.st === 'tset' ? 1 - u : u; crouch(e, 0.3 * Math.sin(Math.PI * Math.min(1, k / 1.7)), null);
                if (k > 1.7) go(S.st === 'tset' ? 'go' : 'back');
                break;
              }
              case 'tgo': if (walkTo(e, TEL.drop, dt, t) || k > 30) go('tget'); break;
              case 'unroll': case 'roll': {   // cúi ở đầu thảm: đặt cuộn đẩy cho lăn trải ra · cuộn lại kéo về tay
                engStandStill(e); const yt = P.yaw, dy = Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 5);
                const sq = sm(k / 0.6) * (1 - sm((k - 2.5) / 0.6)); crouch(e, sq, null); e.armsBusy = true; rxLook('job', 3.5, 0.3, _a.copy(P.c));
                if (S.st === 'unroll') { if (k > 0.55) { if (S.roll !== 'mat') for (let u = -0.8; u <= 0.81; u += 0.32) meadow.cutAt(P.c.x + P.f.x * u, P.c.z + P.f.z * u, 0.5);   // cỏ dưới thảm rạp xuống (không đâm xuyên thảm)
                  S.roll = 'mat'; setRoll(sm((k - 0.7) / 1.8)); } }
                else { setRoll(1 - sm((k - 0.5) / 1.8)); if (k > 2.4) { S.roll = 'hand'; mat.visible = false; } }
                if (S.roll === 'mat' && S.u < 0.35) { const rp = roll.position; engHandSet(e, 0, _b.set(rp.x, rp.y + roll.scale.x + 0.03, rp.z), aimQ(_q, _a.set(0, -1, 0), P.f)); engHandSet(e, 1, _c.copy(_b).addScaledVector(P.side, 0.18), aimQ(_q2, _a.set(0, -1, 0), P.f)); }
                if (k > 3.1) go(S.st === 'unroll' ? (S.stop ? 'roll' : 'step') : TEL.out && TEL.lift < 0.5 ? 'tgo' : 'back');
                break;
              }
              case 'step': if (S.stop) { go('roll'); break; } if (walkTo(e, P.on, dt, t)) go('turn'); else if (k > 20) go('turn'); break;
              case 'turn': {   // đứng giữa thảm quay mặt về phía chân thảm
                engStandStill(e); const dy = Math.atan2(Math.sin(P.yaw - e.g.rotation.y), Math.cos(P.yaw - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 4);
                e.g.position.x += (P.on.x - e.g.position.x) * Math.min(1, dt * 4); e.g.position.z += (P.on.z - e.g.position.z) * Math.min(1, dt * 4);
                if (k > 0.9 && Math.abs(dy) < 0.05) { go('down'); S.legK = 0; S.leg = 1; }
                break;
              }
              case 'down': case 'up': {
                const s = S.st === 'down' ? Math.min(1, k / 5) : Math.max(0, 1 - k / 4.5);
                pose(e, s); hands(e, s, t); e.head.rotation.x = s < 0.3 ? 0.3 * sm(s / 0.3) : s < 0.6 ? 0.3 - 0.4 * sm((s - 0.3) / 0.3) : -0.1 + 0.4 * sm((s - 0.6) / 0.4); e.headYawT = 0;   // ngồi → nằm: cằm thu dần
                if (S.st === 'down' && s >= 1) { go('lie'); S.gz.y = 0; S.gz.p = 0.3; S.gz.t = 2; S.gz.ty = 0; S.gz.tp = 0.35; S.legT = 30 + 20 * Math.random(); }
                if (S.st === 'up' && s <= 0) { e.g.rotation.x = 0; e.seatCtl = false; go('off'); }
                break;
              }
              case 'lie': {
                pose(e, 1); hands(e, 1, t); gaze(e, dt, t); meteors(e, dt, t);
                S.legT -= dt; if (S.legT <= 0) { S.leg = -S.leg; S.legT = 35 + 25 * Math.random(); }   // đổi chân co
                S.legK = (S.legK ?? 0) + ((S.leg < 0 ? 1 : 0) - (S.legK ?? 0)) * (1 - Math.exp(-dt * 1.6));
                const U = e.g.userData, br = Math.sin(t * 0.21 * TAU); if (U.torso) U.torso.scale.set(1 + 0.01 * br, 1, 1 + 0.025 * br);   // thở chậm
                const why = S.stop ? 'việc khác' : !ok(liveWeather.localHour) ? 'trời' : (e.actLeft || 0) < 60 ? 'hết giờ' : k > 3900 ? 'đủ lâu' : '';
                if (why) { if (U.torso) U.torso.scale.set(1, 1, 1); S.pt = null; S.why = why; e.headYawT = 0; go('up'); S.stop = true; }
                break;
              }
              case 'off': if (walkTo(e, P.unroll, dt, t)) go('roll'); else if (k > 20) go('roll'); break;
              case 'back': if (walkTo(e, HOME_ST, dt, t)) go('put'); else if (k > 90) { S.roll = 'home'; homeRoll(); TEL.out = false; TEL.lift = 0; go('idle'); S.done = clock.elapsedTime; return true; } break;
            }
            return false;
          }
          function tick(e, dt, t) {   // sau IK tay: kính / màn / thiên hà mini · cuộn thảm theo bàn tay trái khi xách
            telTick(e, dt, t);
            if (S.roll !== 'hand') return;
            e.wrists[1].updateWorldMatrix(true, false); const p = e.wrists[1].localToWorld(_a.set(0, -0.01, 0.05));
            const f = _b.set(Math.sin(e.g.rotation.y), 0, Math.cos(e.g.rotation.y));
            roll.position.copy(p); roll.scale.set(R0, 1, R0); roll.quaternion.setFromUnitVectors(UP, f); roll.visible = true; mat.visible = false;
          }
          function idle(e) {   // pha bị cắt ngang (ngủ 21:00, mở trang…): thảm về chỗ, dáng đứng
            if (S.st === 'idle') return;
            const lay = S.st === 'down' || S.st === 'lie' || S.st === 'up';
            S.st = 'idle'; S.roll = 'home'; S.pt = null; S.stop = false; homeRoll(); mat.visible = false; S.done = clock.elapsedTime; TEL.out = false; TEL.lift = 0;
            if (lay && e) { e.g.rotation.x = 0; if (e.pose) e.pose.rawRX = 0; const U = e.g.userData; if (U.torso) U.torso.scale.set(1, 1, 1); }
          }
          // ---- NGẮM MƯA ----
          const RW = { st: 'go', k: 0, dur: 90, act: null, at: 0 };
          const rwSpot = (() => { const z = RX_AW ? RX_AW.z1 - 0.3 : 2.95; return vanPt(0.0, 0, z); })(), rwYaw = caravanObj.rotation.y;   // trước cửa lùa, cách đèn lồng treo (x 1,1) 1,1 đv
          function rainStart() { RW.st = 'go'; RW.k = 0; RW.act = null; RW.at = 0; }
          function rain(e, dt, t) {   // pha 'rainwatch': true = xong (tạnh / đủ giờ)
            if (!liveWeather.state.raining) return true;
            RW.k += dt;
            if (RW.st === 'go') { if (walkTo(e, rwSpot, dt, t)) { RW.st = 'watch'; RW.k = 0; RW.dur = 70 + 40 * Math.random(); RW.at = 0; } else if (RW.k > 40) return true; return false; }
            engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET;
            const dy = Math.atan2(Math.sin(rwYaw + (RW.yo || 0) - e.g.rotation.y), Math.cos(rwYaw + (RW.yo || 0) - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 2);
            if (RW.k >= RW.at) {   // việc vặt kế tiếp: nhìn mưa ngoài hồ · ngẩng nhìn mép bạt nhỏ giọt · hứng mưa · khoanh tay
              const r = Math.random(); RW.act = r < 0.35 ? 'look' : r < 0.55 ? 'drip' : r < 0.75 ? 'palm' : 'fold'; RW.at = RW.k + (RW.act === 'fold' ? 9 : 5 + 3 * Math.random()); RW.yo = (Math.random() - 0.5) * 0.7;
              const yw = rwYaw + RW.yo, h = e.g.position;
              if (RW.act === 'look') rxLook('rain', 2.8, 5, _a.set(h.x + Math.sin(yw) * 7, h.y + 1.2, h.z + Math.cos(yw) * 7));
              else if (RW.act === 'drip') rxLook('rain', 2.8, 3, vanPt((Math.random() - 0.5) * 0.8, 2.25, RX_AW ? RX_AW.z1 + 0.12 : 3.4));
              else if (RW.act === 'palm' && rxHands(e)[0]) rxGest('palm', 2.8);
              if (RW.act !== 'fold' && Math.random() < 0.3) rxSay('rainwatch', ['Mưa rơi lộp độp trên bạt, nghe vui tai.', 'Mặt hồ sủi bọt li ti dưới mưa.', 'Đất ướt thơm mùi ngai ngái.', 'Nước nhỏ giọt từ mép bạt thành hàng.'], 'Ngắm mưa', false);
            }
            if (RW.act === 'fold' && !RX.gest) {   // khoanh tay trước ngực
              const ax = engAxesW(e), w = sm((RW.k - (RW.at - 9)) / 0.6) * (1 - sm((RW.k - RW.at + 0.6) / 0.6));
              if (w > 0.02) { e.armsBusy = true; engHandSet(e, 0, engBodyW(e, 0.15, 1.46, 0.21, _a), aimQ(_q, _b.copy(ax.f).negate(), ax.r)); engHandSet(e, 1, engBodyW(e, -0.15, 1.5, 0.23, _c), aimQ(_q2, _b.copy(ax.f).negate(), _a.copy(ax.r).negate())); }
            }
            return RW.k > RW.dur;
          }
          return { update, tick, idle, rain, rainStart, ok, want: hh => ok(hh) && clock.elapsedTime - S.done > 1800, busy: () => S.st !== 'idle', stop() { S.stop = true; }, goal: () => (S.spot && S.spot.unroll) || HOME_ST, rwSpot, state: S, findSpot: () => (S.spot = null, spot()),
            dogWant: () => engObj.phase === 'stars' && (S.st === 'step' || S.st === 'turn' || S.st === 'down' || S.st === 'lie') && !!dogSpotOf(), dogSpot: dogSpotOf, tel: TEL };   // chó ra nằm cạnh khi chủ lên thảm (animals/dog-brain.js 'stars')
        })();
