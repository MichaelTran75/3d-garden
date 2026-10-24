        // ===== MÁY CẮT CỎ ĐEO LƯNG (G 18/10 "sau trời mưa em cho engineer grass trimming quanh chỗ camping" + mẫu GLB anh gửi) =====
        //  Mẫu "Grass Trimmer Machine" (Xorshift, CC-BY-4.0) dựng lại bằng src/tools/trimmer/ → src/models/trimmer.glb 74 KB (5,3 nghìn tam giác, màu đỉnh,
        //  đơn vị mét): 4 bộ phận chuyển động riêng — ba lô máy (gốc = mặt đệm lưng, +Z về lưng người đeo), tay giật nổ máy, cần (gốc = đầu sau ống, +Z dọc ống),
        //  lưỡi (quay quanh +Z cục bộ, ngược chiều kim đồng hồ nhìn từ trên). Điểm cầm nắm đọc từ extras của nút (tay ga, đỉnh tay cầm vòng, quai vai, thanh khung…).
        //  ỐNG MỀM truyền động từ máy ra đầu ống vẽ lại bằng code mỗi khung: đường Bézier ra khỏi máy theo hướng cổng, vào ống theo trục ống, võng theo trọng lực
        //  (16 vòng × 6 cạnh) ⇒ luôn nối đúng dù người lia cần. Chỗ để: ba lô đứng trên cỏ phía đông đống củi (đệm lưng quay về bếp lửa), cần dựa lên đống củi, lưỡi
        //  chạm cỏ. Máy chạy: rung nhẹ, khói xả từng cụm; LY HỢP LY TÂM — ga nhỏ lưỡi đứng yên, ga lớn lưỡi quay; quay nhanh thì hiện đĩa mờ (mắt không theo kịp
        //  cánh lưỡi). Dây giật kéo ra theo tay phải. Vụn cỏ văng sang trái lưỡi, rơi xuống cỏ nằm vài giây rồi tan. Điều khiển: engineer/tasks/trim-grass.js ----
        const trimKit = (() => {
          const TRIM_GLB = window.__trimGlb || 'https://michaeltran75.github.io/3d-garden/models/trimmer.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          const g = new THREE.Group(); g.name = 'Máy cắt cỏ đeo lưng (Backpack Brush Cutter)'; g.userData.noBatch = true; scene.add(g);
          const K = { ready: false, g, pack: null, shaft: null, blade: null, starter: null, A: { pack: {}, shaft: {} }, packU: 0, packMode: 'home', shaftMode: 'home',
            sA: new THREE.Vector3(), sDir: new THREE.Vector3(0, 0, 1), eng: { on: false, thr: 0, t: 0, spin: 0, rpm: 0 }, pull: 0, hold: false, e: null };
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), _s = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
          // ---- chỗ để: cạnh đống củi (G 24/10 đống củi dời ra cạnh lò chiminea ⇒ đặt theo khung đống củi, không theo bếp lửa nữa) ----
          const pile = scene.getObjectByName('Đống củi (Woodpile)'), pileBox = pile ? new THREE.Box3().setFromObject(pile) : null;
          const homePack = new THREE.Matrix4(), homeA = new THREE.Vector3(), homeDir = new THREE.Vector3();
          function planHome() {   // gọi sau khi nạp mẫu (cần độ cao đáy khung)
            // khung đống củi: x cục bộ × WOOD_SIDE = hướng ra sau lưng (ngược cửa lò), z cục bộ = dọc dãy, ra xa lò (đống xoay CHIM_YAW + WOOD_SIDE·π/2). Máy đặt đất sau
            //  lưng đống (0,75; 0,6), đệm lưng quay về +Z; cần: đầu sau gác lên mặt đầu xa của đống (0; 0,28), ống chĩa ra phía trại (cục bộ 0,35; 0,94), lưỡi chạm cỏ
            //  — cách máy 0,6 m, không chạm lò, luống
            if (pile) pile.updateMatrixWorld(true);
            const pp = pile ? pile.localToWorld(_a.set(0.75 * WOOD_SIDE, 0, 0.6)) : _a.set(pf.x + 2.05, 0, pf.z - 2.5);
            homePack.makeTranslation(pp.x, cowY(pp.x, pp.z) - K.A.pack.base[1], pp.z);
            const ra = pile ? pile.localToWorld(_c.set(0, 0, 0.28)) : _c.set(pf.x + 0.59, 0, pf.z - 2.78);
            homeA.set(ra.x, (pileBox ? pileBox.max.y : cowY(ra.x, ra.z) + 0.68) - 0.05, ra.z);
            const h = pile ? _b.set(0.35 * WOOD_SIDE, 0, 0.94).applyQuaternion(pile.quaternion).setY(0).normalize() : _b.set(0.45, 0, -0.89).normalize(), BL = K.A.shaft.blade[2]; let th = 0.4;
            for (let it = 0; it < 4; it++) { const c = Math.cos(th); th = Math.asin(Math.max(0.05, Math.min(0.9, (homeA.y - cowY(homeA.x + h.x * c * BL, homeA.z + h.z * c * BL) - 0.07) / BL))); }
            homeDir.set(h.x * Math.cos(th), -Math.sin(th), h.z * Math.cos(th));
          }
          // ---- ống mềm truyền động (vẽ lại mỗi khung) ----
          const CN = 16, CS = 6, CR = 0.017, cPos = new Float32Array(CN * CS * 3), cNrm = new Float32Array(CN * CS * 3), cIdx = [];
          for (let i = 0; i < CN - 1; i++) for (let s = 0; s < CS; s++) { const a = i * CS + s, b = i * CS + (s + 1) % CS; cIdx.push(a, a + CS, b, b, a + CS, b + CS); }
          const cGeo = new THREE.BufferGeometry(); cGeo.setAttribute('position', new THREE.BufferAttribute(cPos, 3).setUsage(THREE.DynamicDrawUsage)); cGeo.setAttribute('normal', new THREE.BufferAttribute(cNrm, 3).setUsage(THREE.DynamicDrawUsage)); cGeo.setIndex(cIdx);
          const cable = new THREE.Mesh(cGeo, new THREE.MeshLambertMaterial({ color: 0x1d1d1d })); cable.name = 'Ống mềm truyền động'; cable.frustumCulled = false; cable.castShadow = true; cable.visible = false; g.add(cable);
          const P0 = new THREE.Vector3(), P1 = new THREE.Vector3(), P2 = new THREE.Vector3(), P3 = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _bn = new THREE.Vector3(), _p = new THREE.Vector3(), _ref = new THREE.Vector3();
          function cableUpdate() {
            K.pack.updateWorldMatrix(true, false); K.pack.localToWorld(P0.fromArray(K.A.pack.outlet)); K.pack.localToWorld(P1.fromArray(K.A.pack.outlet).add(_a.set(-0.16, -0.12, 0.06)));   // ra khỏi máy sang phải, chúc xuống
            K.shaft.updateWorldMatrix(true, false); K.shaft.localToWorld(P3.set(0, 0, 0)); K.shaft.localToWorld(P2.set(0, 0, -0.3));   // vào ống theo trục ống
            const sag = 0.18 * Math.min(1, P0.distanceTo(P3)); P1.y -= sag; P2.y -= sag * 0.7;
            for (let i = 0; i < CN; i++) {
              const u = i / (CN - 1), v = 1 - u;
              _p.copy(P0).multiplyScalar(v * v * v).addScaledVector(P1, 3 * v * v * u).addScaledVector(P2, 3 * v * u * u).addScaledVector(P3, u * u * u);
              _t.copy(P1).sub(P0).multiplyScalar(3 * v * v).addScaledVector(_a.copy(P2).sub(P1), 6 * v * u).addScaledVector(_b.copy(P3).sub(P2), 3 * u * u).normalize();
              _ref.copy(Math.abs(_t.y) > 0.9 ? _a.set(1, 0, 0) : UP); _n.crossVectors(_t, _ref).normalize(); _bn.crossVectors(_t, _n);
              for (let s = 0; s < CS; s++) { const an = s / CS * Math.PI * 2, cx = Math.cos(an), sy = Math.sin(an), o = (i * CS + s) * 3;
                const nx = _n.x * cx + _bn.x * sy, ny = _n.y * cx + _bn.y * sy, nz = _n.z * cx + _bn.z * sy;
                cNrm[o] = nx; cNrm[o + 1] = ny; cNrm[o + 2] = nz; cPos[o] = _p.x + nx * CR; cPos[o + 1] = _p.y + ny * CR; cPos[o + 2] = _p.z + nz * CR; }
            }
            cGeo.attributes.position.needsUpdate = cGeo.attributes.normal.needsUpdate = true; cGeo.computeBoundingSphere(); cGeo.computeBoundingBox();   // hộp bao mới cho bộ chọn rê chuột
          }
          // ---- dây giật nổ máy ----
          const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 5).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ color: 0xd8d4c8 }));   // dây dù trắng ngà
          rope.name = 'Dây giật nổ máy'; rope.frustumCulled = false; rope.visible = false; rope.userData.noHov = true; g.add(rope);   // không tính vào hộp rê chuột (ẩn ở gốc toạ độ khi không giật)
          // ---- vụn cỏ: 220 mảnh lá dẹt, văng → rơi → nằm trên cỏ vài giây → teo đi ----
          const NCL = 220, clipGeo = new THREE.PlaneGeometry(0.045, 0.014), clipMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          const clips = new THREE.InstancedMesh(clipGeo, clipMat, NCL); clips.name = 'Vụn cỏ'; clips.frustumCulled = false; clips.count = 0; clips.userData.noBatch = true; scene.add(clips);
          const cP = new Float32Array(NCL * 3), cV = new Float32Array(NCL * 3), cL = new Float32Array(NCL), cR = new Float32Array(NCL * 3), cW = new Float32Array(NCL * 3); let cHead = 0, cAlive = 0;
          { const cols = [0xa6c95e, 0xbcd877, 0x93bb4f, 0xc9df8e, 0xb1cf68], c = new THREE.Color(); for (let i = 0; i < NCL; i++) clips.setColorAt(i, c.setHex(cols[i % cols.length])); clips.instanceColor.needsUpdate = true; }
          function emit(p, left, fwd, n) {   // n mảnh từ lưỡi (p): văng sang trái + lên, toả theo hướng tới
            for (let k = 0; k < n; k++) { const i = cHead; cHead = (cHead + 1) % NCL;
              const sp = 1.4 + Math.random() * 2.2, up = 0.6 + Math.random() * 1.6, fw = (Math.random() - 0.3) * 1.4;
              cP[i * 3] = p.x + (Math.random() - 0.5) * 0.15; cP[i * 3 + 1] = p.y + 0.02; cP[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.15;
              cV[i * 3] = left.x * sp + fwd.x * fw; cV[i * 3 + 1] = up; cV[i * 3 + 2] = left.z * sp + fwd.z * fw;
              cL[i] = 5 + Math.random() * 4; for (let a = 0; a < 3; a++) { cR[i * 3 + a] = Math.random() * 6.28; cW[i * 3 + a] = (Math.random() - 0.5) * 30; } }
            cAlive = NCL;
          }
          const _cq = new THREE.Quaternion(), _ce = new THREE.Euler(), _cs = new THREE.Vector3();
          function clipsTick(dt) {
            if (!cAlive) return; let live = 0, top = 0;
            for (let i = 0; i < NCL; i++) {
              if (cL[i] <= 0) { _m.makeScale(0, 0, 0); clips.setMatrixAt(i, _m); continue; }
              cL[i] -= dt; live++; top = i + 1;
              const gy = cowY(cP[i * 3], cP[i * 3 + 2]) + 0.012; let flying = cP[i * 3 + 1] > gy + 1e-3;
              if (flying) { const dr = Math.exp(-dt * 2.6); cV[i * 3] *= dr; cV[i * 3 + 2] *= dr; cV[i * 3 + 1] = cV[i * 3 + 1] * dr - 9.8 * dt;   // lá nhẹ: cản gió lớn, rơi chậm
                for (let a = 0; a < 3; a++) { cP[i * 3 + a] += cV[i * 3 + a] * dt; cR[i * 3 + a] += cW[i * 3 + a] * dt; }
                if (cP[i * 3 + 1] <= gy) { cP[i * 3 + 1] = gy; cR[i * 3] = -Math.PI / 2; cR[i * 3 + 2] = 0; flying = false; } }
              const sc = Math.min(1, cL[i] / 1.5);   // 1,5 s cuối: teo dần
              _ce.set(cR[i * 3], cR[i * 3 + 1], cR[i * 3 + 2]); _cq.setFromEuler(_ce); _m.compose(_c.set(cP[i * 3], cP[i * 3 + 1], cP[i * 3 + 2]), _cq, _cs.set(sc, sc, sc)); clips.setMatrixAt(i, _m);
            }
            clips.count = top; clips.instanceMatrix.needsUpdate = true; if (!live) { cAlive = 0; clips.count = 0; }
          }
          // ---- khói xả: 8 cụm xám, phồng to và nhạt dần ----
          const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
            gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
          const puffs = Array.from({ length: 8 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, color: 0x9a9a96, transparent: true, opacity: 0, depthWrite: false }));
            s.visible = false; s.userData = { life: 0, max: 1, v: new THREE.Vector3() }; s.name = 'Khói xả máy cắt cỏ'; g.add(s); return s; });
          let puffI = 0;
          function puff(big) {   // 1 cụm khói từ ống xả (sau máy, phía phải)
            if (!K.pack) return; const s = puffs[puffI]; puffI = (puffI + 1) % puffs.length; K.pack.localToWorld(s.position.set(-0.13, -0.02, -0.5));
            s.userData.life = s.userData.max = big ? 1.8 : 0.9; s.userData.big = big ? 1 : 0.45; s.userData.v.set((Math.random() - 0.5) * 0.15, 0.22, (Math.random() - 0.5) * 0.15); s.visible = true;
          }
          function puffsTick(dt) {
            for (const s of puffs) { const U = s.userData; if (!s.visible) continue; U.life -= dt; if (U.life <= 0) { s.visible = false; continue; }
              const k = 1 - U.life / U.max; s.position.addScaledVector(U.v, dt); s.position.x += sceneWind.dir.x * sceneWind.ms * 0.15 * dt; s.position.z += sceneWind.dir.z * sceneWind.ms * 0.15 * dt;
              s.scale.setScalar((0.07 + 0.3 * k) * U.big); s.material.opacity = 0.45 * U.big * (1 - k) * Math.min(1, k * 6); }
          }
          // ---- nạp mẫu ----
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
            .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(TRIM_GLB)).then(ldAfter).then(gl => {
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
              gl.scene.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = true; } });
              const pack = gl.scene.getObjectByName('pack'), shaft = gl.scene.getObjectByName('shaft'), blade = gl.scene.getObjectByName('blade'), starter = gl.scene.getObjectByName('starter');
              Object.assign(K.A.pack, pack.userData); Object.assign(K.A.shaft, shaft.userData);
              // lưỡi: nhóm quay chen giữa nút lưỡi và lưới; vật liệu riêng để làm mờ khi quay nhanh + đĩa mờ (vệt lưỡi)
              const spin = new THREE.Group(); spin.name = 'Lưỡi cắt (quay)'; const bm = blade.children[0]; blade.add(spin); spin.add(bm);
              bm.material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true });
              const disc = new THREE.Mesh(new THREE.CircleGeometry(0.226, 28), new THREE.MeshBasicMaterial({ color: 0x2a2a28, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
              disc.name = 'Vệt lưỡi quay'; disc.position.z = -0.003; disc.visible = false; blade.add(disc);
              blade.quaternion.multiply(_q.setFromAxisAngle(_a.set(1, 0, 0), -0.24));   // lưỡi gần nằm ngang khi ống nghiêng ~45° (tay LEGO ngắn ⇒ cầm ống dốc hơn người thật)
              for (const o of [pack, shaft]) { o.matrixAutoUpdate = false; g.add(o); }
              Object.assign(K, { pack, shaft, blade, bladeSpin: spin, bladeMesh: bm, disc, starter });
              starter.userData.home = starter.position.clone();
              planHome(); K.ready = true; K.setHome(); cable.visible = true;
              { const tip = homeA.clone().addScaledVector(homeDir, K.A.shaft.blade[2] * 0.6), pk = new THREE.Vector3().setFromMatrixPosition(homePack);   // máy đang cất: ba lô dưới đất + cần chĩa ngang gối ⇒ lưới cấm đường đi riêng của kỹ sư
                ENG_NAV.extra.push({ x: pk.x, z: pk.z, r: 0.3, nav: true }, { x: tip.x, z: tip.z, r: 0.3, nav: true }); if (ENG_NAV.blk) engNavBuild(); }   // (G 24/10 kiểm tra cả ngày: dạo trại vấp cần 5 lần 6:19–7:11)
              hovAdd(g, { pad: 0.03, skip: m => !!m.userData.noHov, on: () => !trimJob.busy(), picks: [{ o: pack }, { o: shaft }] });   // rê chuột: viền trắng (ui/hover-select.js) — dò theo hộp riêng ba lô / cần
            }).catch(err => console.warn('Trimmer GLB:', err)));
          // ---- tư thế các bộ phận (job ghi trạng thái, tick đặt sau khi tay đã giải IK) ----
          K.setHome = () => { K.packMode = 'home'; K.shaftMode = 'home'; K.packU = 0; K.eng.on = false; K.eng.thr = 0; K.pull = 0; K.e = null; };
          K.homeA = homeA; K.homeDir = homeDir; K.homePack = homePack;
          const mount = new THREE.Matrix4(), _mp = new THREE.Vector3(), _mq = new THREE.Quaternion(), _ms = new THREE.Vector3(), _hp = new THREE.Vector3(), _hq = new THREE.Quaternion(), _hs = new THREE.Vector3();
          K.backMatrix = (e, out) => {   // ba lô trên lưng: mặt đệm áp lưng áo (eo + 0,28, sau 0,16 — đv kỹ sư), đơn vị mét (bù tỉ lệ người)
            e.spine.updateWorldMatrix(true, false); const s = 1 / e.g.scale.x;
            return out.multiplyMatrices(e.spine.matrixWorld, mount.compose(_mp.set(0, 0.28, -0.165), _mq.identity(), _ms.set(s, s, s)));
          };
          K.shaftPose = (A, dir) => { K.sA.copy(A); K.sDir.copy(dir); K.shaftMode = 'pose'; };
          K.shaftMatrix = (A, dir, out) => { aimQ(_q2, dir, UP); return out.compose(A, _q2, _s.set(1, 1, 1)); };
          K.anchorW = (part, name, out) => { const o = part === 'pack' ? K.pack : K.shaft; o.updateWorldMatrix(true, false); return o.localToWorld(out.fromArray(K.A[part][name])); };
          K.shaftPt = (A, dir, local, out) => { aimQ(_q2, dir, UP); return out.copy(local).applyQuaternion(_q2).add(A); };   // điểm hệ cần theo tư thế (A, dir) chưa áp
          K.bladeW = out => { K.blade.updateWorldMatrix(true, false); return K.blade.getWorldPosition(out); };
          // ---- mỗi khung, trước khi vẽ (loop/main-loop-rest.js) ----
          let puffT = 0;
          K.tick = (dt, t) => {
            clipsTick(dt); puffsTick(dt);
            if (!K.ready) return; const E = K.eng, e = K.e;
            // máy: ga mượt, vòng tua, ly hợp ly tâm (ga > 0,35 mới đóng), lưỡi quán tính
            E.rpm += ((E.on ? 0.25 + 0.75 * E.thr : 0) - E.rpm) * Math.min(1, dt * (E.on ? 6 : 1.5));
            const want = E.on && E.thr > 0.35 ? (E.thr - 0.35) / 0.65 * 95 : 0; E.spin += (want - E.spin) * Math.min(1, dt * (want > E.spin ? 2.5 : 0.9));
            K.bladeSpin.rotation.z = (K.bladeSpin.rotation.z + E.spin * dt) % (Math.PI * 2);
            const blur = Math.min(1, Math.max(0, (E.spin - 18) / 30)); K.disc.visible = blur > 0.01; K.disc.material.opacity = 0.32 * blur; K.bladeMesh.material.opacity = 1 - 0.75 * blur;
            if (E.on && (puffT -= dt) < 0) { puff(false); puffT = 0.5 + Math.random() * 0.7 - 0.35 * E.thr; }
            // ba lô
            if (K.packMode === 'home') K.pack.matrix.copy(homePack);
            else if (e) { K.backMatrix(e, _m);
              if (K.packMode === 'don' && K.packU < 1) { homePack.decompose(_hp, _hq, _hs); _m.decompose(_mp, _mq, _ms); const u = K.packU, lift = Math.sin(Math.PI * u) * 0.12;
                _mp.lerp(_hp, 1 - u); _mp.y += lift; _mq.slerp(_hq, 1 - u); _m.compose(_mp, _mq, _ms.set(1, 1, 1)); }
              K.pack.matrix.copy(_m); }
            if (E.on) { const j = 0.0012 + 0.0022 * E.rpm; K.pack.matrix.elements[12] += (Math.random() - 0.5) * j; K.pack.matrix.elements[13] += (Math.random() - 0.5) * j; }   // máy rung
            K.pack.matrixWorldNeedsUpdate = true;
            // cần
            if (K.shaftMode === 'home') K.shaftMatrix(homeA, homeDir, K.shaft.matrix); else K.shaftMatrix(K.sA, K.sDir, K.shaft.matrix);
            if (E.on && K.shaftMode !== 'home') { const j = 0.001 + 0.0018 * E.rpm; K.shaft.matrix.elements[12] += (Math.random() - 0.5) * j; K.shaft.matrix.elements[13] += (Math.random() - 0.5) * j; }
            K.shaft.matrixWorldNeedsUpdate = true; g.updateMatrixWorld(true);
            // tay giật: theo tay phải khi đang giật, nhả ra thì cuộn dây về
            if (e && K.pull > 0.01) { e.wrists[0].getWorldPosition(_a); K.starter.position.copy(K.pack.worldToLocal(_a)); }
            else K.starter.position.copy(K.starter.userData.home);
            K.starter.updateMatrixWorld(true);
            const rl = K.starter.position.distanceTo(K.starter.userData.home); rope.visible = rl > 0.015;
            if (rope.visible) { K.pack.localToWorld(_b.fromArray(K.A.pack.port)); K.starter.getWorldPosition(_c); _c.sub(_b); const L = _c.length();   // ống trụ 1 m kéo dài theo 2 đầu
              rope.position.copy(_b); rope.quaternion.setFromUnitVectors(UP, _c.divideScalar(L || 1)); rope.scale.set(1, L, 1); }
            cableUpdate();
          };
          K.emit = emit; K.puff = puff;
          return K;
        })();
