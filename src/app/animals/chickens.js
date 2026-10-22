        // ===== GÀ MÁI THẢ VƯỜN × 3 (G 18/10 "add 3 chickens" + mẫu GLB; "add chicken behaviour and back to chuồng gà khi mặt trời lặn, và ra ngoài kiếm ăn khi
        //  mặt trời mọc, biết kiếm chỗ tránh mưa near by under cover") =====
        //  Mẫu "Chicken - rigged" (Maf'j Alvarez, CC-BY-4.0) dựng lại bằng src/tools/chicken/ → src/models/chicken.glb 152 KB: 1 lưới da màu đỉnh (736 tam giác,
        //  17 xương), mét, đầu về +Z, 6 hoạt cảnh (walking · pecking · idle · sitting-down · sitting-idle · standing-up). Mỗi con 1 bản sao (SkeletonUtils) + 1 bộ trộn.
        //  ĐI KHÔNG TRƯỢT CHÂN: hoạt cảnh 'walking' của mẫu có sẵn chuyển động gốc (cả thân tiến 0,23 m mỗi chu kỳ 1,58 s) ⇒ trừ dời tuyến tính khỏi các rãnh vị
        //  trí cho vòng lặp tại chỗ, rồi đẩy con gà tiến đúng 0,145 m/s × tốc độ phát ⇒ bàn chân trụ đứng yên trên đất như hoạt cảnh gốc.
        //  TẬP TÍNH (gà thả vườn: kiếm ăn = đi vài bước – dừng mổ – ngó quanh; đàn giữ gần nhau; sợ người lại gần, sợ tiếng máy; trú mưa; ngủ sớm):
        //   · KIẾM ĂN (G 18/10 "mổ xuống đất chỉ nên 1 hoặc 2 cái mỗi lần"; nghiên cứu): gà kiếm ăn = CÀO đất (chuỗi 4 nhát cố định, 2 chân xen kẽ — preprint
        //     Research Square rs-10362834 "fixed four-stroke scratching sequence") → LÙI 1 bước → CÚI NHÌN chỗ vừa bới → MỔ; hễ mổ được mồi là NGẨNG đầu nuốt /
        //     canh chừng (Cresswell & cs. 2003, Proc R Soc B 270: chim kiếm ăn dưới đất gần như lần nào nhặt được hạt cũng ngẩng đầu) và xác suất ngẩng sau mỗi
        //     cú mổ là hằng số, đàn càng nhỏ càng hay ngẩng (Caraco 1982, Condor 84) ⇒ đàn 3 con: mỗi lượt chỉ 1 cú (60%) hoặc 2 cú (40%), rồi ngẩng 0,7–2,2 s.
        //     Kiếm ăn ~61% thời gian thức (ACES, Alabama Extension); đàn canh gác luân phiên — không con nào đang ngẩng thì con vừa ngẩng đứng canh lâu hơn.
        //     Hoạt cảnh 'pecking' của mẫu = 1 cú mổ / vòng 0,875 s (mỏ hạ từ 0,3 s, chạm đất 0,47 và 0,62 s, ngẩng lại 0,875 s — đo) ⇒ phát đúng 1–2 vòng.
        //     Cào: xương chân mẫu (đùi · cẳng · bàn) quay quanh trục x cục bộ (đo: +0,6 rad đùi ⇒ bàn chân lùi 6 cm), cộng sau bộ trộn hoạt cảnh; đất văng ra sau.
        //   · NGÀY: kiếm ăn trên bãi cỏ trước CHUỒNG (camp/chicken-coop.js — tâm vùng cách cửa chuồng 3,5 m, bán kính 4 m): phần lớn thời gian kiếm ăn (chu trình
        //     cào – lùi – nhìn – mổ 1–2 cú – ngẩng ở trên), mỗi lượt đi 0,3–1,6 m chậm 0,12–0,22 m/s; xa đàn > 2,6 m thì đi về phía đàn; cách nhau ≥ 0,35 m; né
        //     vật cản, bếp lửa, mép nước; chui được gầm chuồng (chỉ né 4 chân). Sau mưa (đất ướt, giun lên) mổ nhiều hơn; cỏ vừa phát thì ra chỗ đã cắt;
        //   · SỢ: người < 1,4 m (đứng yên 1,0), máy cắt cỏ nổ < 4,5 m quanh người và < 3,2 m quanh lưỡi, chó chạy < 2 m, gấu mèo < 2,5 m ⇒ chạy tránh;
        //   · MẶT TRỜI LẶN (độ cao mặt trời < ~3,4° buổi chiều): lần lượt về chân cầu thang (con trước lên xong con sau mới lên), leo ván, chui cửa, nhảy lên sào,
        //     ngồi ngủ; cả 3 lên sào thì cửa tự động hạ. MẶT TRỜI MỌC (> ~1,7° buổi sáng): cửa mở, từng con (cách nhau ~4 s) đứng dậy, nhảy xuống sàn, ra cửa,
        //     xuống ván rồi đi kiếm ăn. Mở trang lúc đêm thì gà đã ở trên sào;
        //   · MƯA (ban ngày): mỗi con chạy tới chỗ TRÚ gần nhất — gầm chuồng, gốc 2 cây táo (tán che); bạt hiên xe thôi (18/10: bàn ghế trà dời vào dưới bạt, hết chỗ đứng ngoài vòng né đồ đạc) — đứng / ngồi xù lông chờ tạnh rồi ra;
        //   · trưa 12:00–13:30 ra gầm chuồng (bóng mát) ngồi nghỉ.
        //  Mỗi khung: chickens.update (loop/main-loop-rest.js) ----
        const chickens = (() => {
          const CHICK_GLB = window.__chickGlb || 'https://michaeltran75.github.io/3d-garden/models/chicken.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          const C = { list: [], ready: false }, CO = chickenCoop;
          const HOME = new THREE.Vector3(CO.g.position.x + Math.sin(CO.YAW) * 3.5, 0, CO.g.position.z + Math.cos(CO.YAW) * 3.5), HOME_R = 4.0, V_CLIP = 0.23 / 1.583;   // V_CLIP: m/s ở tốc độ phát 1
          const LOOPS = ['walking', 'pecking', 'idle', 'sitting-idle'], ONCE = ['sitting-down', 'standing-up'];
          const PECK_T = 0.875, PECK_LOW = 0.3, STROKE = 0.3, _X = new THREE.Vector3(1, 0, 0), _qa = new THREE.Quaternion();   // vòng mổ (s) · lúc mỏ bắt đầu hạ · 1 nhát cào (s)
          const _a = new THREE.Vector3(), rnd = mulberry32(2718);
          function free(x, z, pad = 0.25) {   // chỗ đứng được: không nước, không trong vật cản / đồ đạc / bếp lửa (gầm chuồng thì được)
            if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z)))) return false;
            if (Math.hypot(x - pf.x, z - pf.z) < FIRE_AVOID_R + 0.2) return false;
            for (const o of obstacleCoords) if (!o.coop && Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
            for (const o of ENG_PROPS) if (Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
            return true;
          }
          function pick(h, cx, cz, r0, r1, tries = 12) {   // điểm ngẫu nhiên đi được trong vành r0–r1 quanh (cx, cz)
            for (let i = 0; i < tries; i++) { const a = rnd() * 6.2832, r = r0 + (r1 - r0) * rnd(), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
              if (free(x, z) && Math.hypot(x - HOME.x, z - HOME.z) < HOME_R + 2.5) return h.tgt.set(x, 0, z); }
            return h.tgt.set(h.g.position.x, 0, h.g.position.z);
          }
          let COVERS = null;
          function covers() {   // chỗ trú mưa: [tên, [3 điểm]] — gầm chuồng · gốc mỗi cây táo (cách thân 0,75 m, chỗ đứng được)
            if (COVERS) return COVERS; COVERS = [['gầm chuồng', CO.under]];
            for (const T of appleTrees) { const p = T.getWorldPosition(new THREE.Vector3()), pts = [];
              for (let k = 0; k < 12 && pts.length < 3; k++) { const a = k / 12 * 6.2832, x = p.x + Math.cos(a) * 0.75, z = p.z + Math.sin(a) * 0.75; if (free(x, z, 0.05)) pts.push(new THREE.Vector3(x, 0, z)); }
              if (pts.length === 3) COVERS.push(['gốc táo', pts]); }
            return COVERS;
          }
          function nearestCover(h) { let best = null, bd = Infinity; for (const [, pts] of covers()) { const q = pts[h.i % pts.length], d = Math.hypot(q.x - h.g.position.x, q.z - h.g.position.z); if (d < bd) { bd = d; best = q; } } return best; }
          const roostTime = () => { const hh = liveWeather.localHour; return hh >= 12 ? sunElevSin < 0.06 : sunElevSin < 0.03; };   // chiều: mặt trời thấp ~3,4° là về · sáng: lên ~1,7° mới ra
          Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/utils/SkeletonUtils.js')])
            .then(([{ GLTFLoader }, SU]) => new GLTFLoader().loadAsync(CHICK_GLB).then(gl => [gl, SU])).then(([gl, SU]) => {
              const walk = gl.animations.find(a => a.name === 'walking');
              for (const tr of walk.tracks) if (tr.name.endsWith('.position') && tr.times.length > 1) {   // bỏ chuyển động gốc: trừ dời tuyến tính đầu → cuối
                const n = tr.times.length, T0 = tr.times[0], T1 = tr.times[n - 1], d = [0, 1, 2].map(q => tr.values[(n - 1) * 3 + q] - tr.values[q]);
                for (let i = 0; i < n; i++) { const u = (tr.times[i] - T0) / (T1 - T0); for (let q = 0; q < 3; q++) tr.values[i * 3 + q] -= d[q] * u; }
              }
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
              for (let i = 0; i < 3; i++) {
                const body = SU.clone(gl.scene); body.traverse(o => { if (o.isSkinnedMesh) { o.material = mat; o.castShadow = true; o.frustumCulled = false; } });
                const g = new THREE.Group(); g.name = 'Gà mái #' + (i + 1); g.userData.noBatch = true; g.add(body); g.scale.setScalar((0.92 + 0.12 * rnd()) * 1.1); scene.add(g);   // G 18/10: to thêm 10% (cao 0,40 → 0,44 m)
                const mixer = new THREE.AnimationMixer(body), A = {}, W = {};
                for (const c of gl.animations) { const a = A[c.name] = mixer.clipAction(c); W[c.name] = 0; a.setEffectiveWeight(0); if (ONCE.includes(c.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } else a.play(); a.time = rnd() * c.duration; }
                const h = { g, mixer, A, W, anim: 'idle', st: 'look', k: 0, dur: 1 + 2 * rnd(), tgt: new THREE.Vector3(), spd: 0, v: 0, yaw: rnd() * 6.2832, i, sit: 0, gy: 0, level: 'ground', path: null, pi: 0, seg0: new THREE.Vector3(), segT: 0, np: 1, kick: 0 };
                const bn = {}; body.traverse(o => { if (o.isBone) bn[o.name] = o; });
                h.legs = [['left-thigh_03', 'left-thigh001_04', 'left-shin_05', 'left-foot_end_015'], ['right-thigh_07', 'right-thigh001_08', 'right-shin_09', 'right-foot_end_012']].map(L => L.map(n => bn[n]));   // xương chân để cào đất
                const a = i / 3 * 6.2832; g.position.set(HOME.x + Math.cos(a) * 0.8, 0, HOME.z + Math.sin(a) * 0.8); h.gy = g.position.y = cowY(g.position.x, g.position.z);
                C.list.push(h);
              }
              if (roostTime()) for (const h of C.list) { const P = CO.perch[h.i]; h.g.position.copy(P.on); h.yaw = P.yaw; h.st = 'roost'; h.level = 'perch'; h.sit = 1; h.anim = 'sitting-idle'; h.k = 99; }   // mở trang lúc đêm: gà đã lên sào
              C.ready = true;
            }).catch(err => console.warn('Chicken GLB:', err));
          function play(h, name, ts = 1) {   // hoạt cảnh chính: lặp ⇒ hoà trọng số; 1 lần ⇒ phát lại từ đầu, giữ khung cuối
            if (h.anim !== name) { h.anim = name; if (ONCE.includes(name)) { const a = h.A[name]; a.reset(); a.play(); } }
            h.A[name].timeScale = ts;
          }
          // ---- chu trình kiếm ăn: cào 4 nhát → lùi 1 bước → cúi nhìn → mổ 1–2 cú → ngẩng (nuốt, canh chừng) ----
          function peckStart(h, from) {   // from: 'inspect' (mỏ đã hạ nửa chừng) hoặc vào thẳng
            h.st = 'peck'; h.k = 0; h.np = rnd() < 0.6 ? 1 : 2; h.ts = 1.15 + 0.25 * rnd();
            const t0 = from === 'inspect' ? PECK_LOW : 0; h.A.pecking.time = t0; h.dur = (PECK_T - t0 + (h.np - 1) * PECK_T) / h.ts;
          }
          function lookStart(h, heads, extra = 0) {   // ngẩng: nuốt mồi + canh chừng; cả đàn đang cúi thì con này canh lâu hơn (canh gác luân phiên)
            h.st = 'look'; h.k = 0; h.dur = (0.7 + 1.5 * rnd()) * (heads ? 1 : 1.6) + extra;
          }
          function forageNext(h, wet) {   // sau khi ngẩng: cào tiếp · mổ lại chỗ cũ · đi chỗ khác (đất ướt: giun lên ⇒ cào / mổ nhiều hơn)
            const r = rnd();
            if (r < (wet ? 0.38 : 0.3)) { h.st = 'scratch'; h.k = 0; h.dur = 4 * STROKE + 0.15; h.side = rnd() < 0.5 ? 0 : 1; return true; }
            if (r < (wet ? 0.66 : 0.5)) { h.st = 'inspect'; h.k = 0; h.dur = 0.35 + 0.4 * rnd(); return true; }
            return false;
          }
          function scratchLegs(h) {   // cộng góc cào vào xương chân (sau bộ trộn): nhát n dùng chân (side + n) % 2 — với trước–lên · cào lùi sát đất · thu về
            const u = h.k / STROKE, n = Math.floor(u); if (n > 3) return; const p = u - n, L = h.legs[(h.side + n) % 2];
            const s = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
            let a, b, c;
            if (p < 0.3) { const k = s(p / 0.3); a = -0.35 * k; b = -0.9 * k; c = 1.8 * k; }
            else if (p < 0.75) { const k = s((p - 0.3) / 0.45); a = -0.35 + 0.95 * k; b = -0.9 * (1 - k); c = 1.8 * (1 - k); }
            else { const k = s((p - 0.75) / 0.25); a = 0.6 * (1 - k); b = -0.3 * Math.sin(Math.PI * k); c = 0.6 * Math.sin(Math.PI * k); }
            L[0].quaternion.multiply(_qa.setFromAxisAngle(_X, a)); L[1].quaternion.multiply(_qa.setFromAxisAngle(_X, b)); L[2].quaternion.multiply(_qa.setFromAxisAngle(_X, c));
            if (p > 0.45 && p < 0.7 && h.kick !== n + 1) { h.kick = n + 1; h.g.updateMatrixWorld(true); dirtKick(L[3].getWorldPosition(_a), h.yaw); }   // giữa nhát cào: đất văng ra sau
          }
          // đất văng khi cào: 24 hạt dùng chung cả đàn, bay ngược hướng gà nhìn, rơi theo trọng lực 0,45 s
          const dirt = new THREE.InstancedMesh(new THREE.SphereGeometry(0.009, 4, 3), new THREE.MeshLambertMaterial({ color: 0x5a4330 }), 24); dirt.name = 'Đất gà bới'; dirt.frustumCulled = false; dirt.count = 24;
          dirt.userData.noBatch = dirt.userData.noBake = dirt.userData.noCollide = true; scene.add(dirt);
          const DP = Array.from({ length: 24 }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), t: 9 })), _dm = new THREE.Matrix4(), _dz = new THREE.Matrix4().makeScale(0, 0, 0);
          let dirtI = 0;
          function dirtKick(p, yaw) { for (let k = 0; k < 3; k++) { const d = DP[dirtI++ % 24]; d.p.copy(p); d.t = 0; const s = 0.35 + 0.3 * rnd(), sp = (rnd() - 0.5) * 0.8; d.v.set(-Math.sin(yaw + sp) * s, 0.5 + 0.4 * rnd(), -Math.cos(yaw + sp) * s); } }
          function dirtTick(dt) {
            for (let k = 0; k < 24; k++) { const d = DP[k]; if (d.t < 0.45) { d.t += dt; d.v.y -= 6 * dt; d.p.addScaledVector(d.v, dt); _dm.makeTranslation(d.p.x, d.p.y, d.p.z); dirt.setMatrixAt(k, _dm); } else dirt.setMatrixAt(k, _dz); }
            dirt.instanceMatrix.needsUpdate = true;
          }
          function threat(h) {   // vật đáng sợ gần nhất (người, máy cắt cỏ đang nổ, lưỡi cắt, chó chạy, gấu mèo)
            const p = h.g.position, e = engObj, out = [];
            if (e.g.parent === scene && !e.inVan) out.push([e.g.position, trimKit.eng.on ? 4.5 : e.walking ? 1.4 : 1.0]);
            if (trimKit.eng.on && trimKit.shaftMode === 'pose') out.push([trimKit.bladeW(_a), 3.2]);   // lưỡi đang quay: sợ chính cái lưỡi (người đứng sau, lưỡi lia trước mặt)
            if (dogObj.visible !== false) out.push([dogObj.position, C.dogV > 0.6 ? 2.0 : 0.8]);   // chó chạy lại gần mới sợ
            if (raccoonObj.visible) out.push([raccoonObj.position, 2.5]);
            let best = null, bd = Infinity; for (const [q, r] of out) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < r && d < bd) { bd = d; best = q; } }
            return best;
          }
          let CIRC = null;
          function circles() {   // vật cản tròn quanh vùng gà đi (xe, cây, lò, đống củi, ghế, bàn, bếp lửa, 4 chân chuồng…) — gom 1 lần; vòng của chuồng bỏ (gà chui gầm)
            if (CIRC) return CIRC; CIRC = [];
            for (const o of [...obstacleCoords, ...ENG_PROPS]) if (!o.coop && Math.hypot(o.x - HOME.x, o.z - HOME.z) < 18) CIRC.push([o.x, o.z, o.r]);
            CIRC.push([pf.x, pf.z, FIRE_AVOID_R], ...CO.legs); return CIRC;
          }
          function steer(h, dt, turn) {   // quay dần về đích, né đàn / vật cản (đẩy ra + trượt vòng quanh), tiến theo hướng thân; không bao giờ lọt vào trong vật cản
            const p = h.g.position; let dx = h.tgt.x - p.x, dz = h.tgt.z - p.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; const gx = dx, gz = dz;
            for (const o of C.list) if (o !== h && o.level === 'ground') { const ox = p.x - o.g.position.x, oz = p.z - o.g.position.z, od = Math.hypot(ox, oz); if (od < 0.35 && od > 1e-4) { dx += ox / od * 1.5 * (0.35 - od) / 0.35; dz += oz / od * 1.5 * (0.35 - od) / 0.35; } }
            for (const [x, z, r] of circles()) { const ox = p.x - x, oz = p.z - z, od = Math.hypot(ox, oz), rr = r + 0.45; if (od >= rr || od < 1e-4) continue;
              const k = (rr - od) / 0.45, nx = ox / od, nz = oz / od, side = (gx * -nz + gz * nx) >= 0 ? 1 : -1;   // đích lệch phía nào thì vòng phía đó
              dx += nx * k * 2.2 - nz * side * k * 2.6; dz += nz * k * 2.2 + nx * side * k * 2.6; }
            const want = Math.atan2(dx, dz); let dy = Math.atan2(Math.sin(want - h.yaw), Math.cos(want - h.yaw)); h.yaw += Math.max(-turn * dt, Math.min(turn * dt, dy));
            h.v += (h.spd * Math.max(0, Math.cos(dy)) - h.v) * Math.min(1, dt * 5);
            let nx = p.x + Math.sin(h.yaw) * h.v * dt, nz = p.z + Math.cos(h.yaw) * h.v * dt;
            if (isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { h.v = 0; return true; }   // mép nước: coi như tới
            for (const [x, z, r] of circles()) { const ox = nx - x, oz = nz - z, od = Math.hypot(ox, oz), rr = r + 0.14; if (od < rr && od > 1e-4) { nx = x + ox / od * rr; nz = z + oz / od * rr; } }   // chặn cứng
            p.x = nx; p.z = nz; return d < 0.15;
          }
          // ---- đi theo lối định sẵn (cầu thang, trong chuồng, lên / xuống sào): quay xong mới bước, đi thẳng 0,16 m/s, độ cao nội suy (ván dốc), đoạn hop = nhảy vồng 0,4 s ----
          function startPath(h, pts, then) { h.path = pts; h.pi = 0; h.seg0.copy(h.g.position); h.segT = 0; h.st = 'path'; h.then = then; h.level = 'path'; }
          function followPath(h, dt) {
            const P = h.path[h.pi], p = h.g.position;
            if (P.hop) { h.segT += dt / 0.4; const u = Math.min(1, h.segT); p.lerpVectors(h.seg0, P.p, u); p.y += 0.1 * Math.sin(Math.PI * u); play(h, 'idle'); if (P.yaw !== undefined) h.yaw = P.yaw; }
            else {
              const want = Math.atan2(P.p.x - h.seg0.x, P.p.z - h.seg0.z), dy = Math.atan2(Math.sin(want - h.yaw), Math.cos(want - h.yaw)); h.yaw += Math.max(-6 * dt, Math.min(6 * dt, dy));
              const L = Math.max(0.01, Math.hypot(P.p.x - h.seg0.x, P.p.z - h.seg0.z)), go = Math.abs(dy) < 0.6 ? 0.16 : 0;
              h.segT += dt * go / L; p.lerpVectors(h.seg0, P.p, Math.min(1, h.segT)); play(h, go ? 'walking' : 'idle', Math.max(0.35, go / (V_CLIP * h.g.scale.x)));
            }
            if (h.segT >= 1) { h.pi++; h.seg0.copy(p); h.segT = 0; if (h.pi >= h.path.length) { h.path = null; h.k = 0; h.then(h); } }
          }
          const intoCoop = h => [{ p: CO.rampTop }, { p: CO.entry }, { p: CO.perch[h.i].below }, { p: CO.perch[h.i].on, hop: true, yaw: CO.perch[h.i].yaw }];
          const outOfCoop = h => [{ p: CO.perch[h.i].below, hop: true }, { p: CO.entry }, { p: CO.rampTop }, { p: CO.rampFoot }];
          const toRoost = q => { q.level = 'perch'; q.st = 'sitDown'; q.k = 0; };
          function update(dt, t) {
            if (!C.ready) { CO.tick(dt); return; } dt = Math.min(dt, 0.05);
            const dp = C.dogP || (C.dogP = dogObj.position.clone()); C.dogV = Math.hypot(dogObj.position.x - dp.x, dogObj.position.z - dp.z) / Math.max(dt, 1e-3); dp.copy(dogObj.position);
            if (!(t < C.mownT)) { C.mownT = t + 30; C.mownK = !trimJob.busy() && meadow.cutFrac(HOME.x, HOME.z, 0, HOME_R) > 0.3; }   // cỏ quanh vùng kiếm ăn đã phát? (30 s kiểm 1 lần)
            const mown = !!C.mownK, hh = liveWeather.localHour, rain = liveWeather.state.raining, roost = roostTime(), nap = hh >= 12 && hh < 13.5 && !roost;
            const wet = sceneWet > 0.05 || footprints.soil > 0.3, ground = C.list.filter(h => h.level === 'ground');
            const cx = ground.reduce((s, h) => s + h.g.position.x, 0) / Math.max(1, ground.length), cz = ground.reduce((s, h) => s + h.g.position.z, 0) / Math.max(1, ground.length);
            const rampBusy = C.list.some(h => h.st === 'path' && h.pi < 2);   // đang có con trên ván / ở cửa
            CO.want = roost && C.list.every(h => h.st === 'roost') ? 0 : 1; CO.tick(dt);   // cả đàn lên sào ⇒ cửa hạ
            for (const h of C.list) {
              const p = h.g.position; h.k += dt;
              // ---- chọn việc theo giờ / thời tiết / mối đe doạ (chỉ khi đang ở dưới đất) ----
              if (h.level === 'ground') {
                const th = h.st === 'sit' || h.st === 'sitDown' ? null : threat(h);
                if (th && h.st !== 'flee') { const ax = p.x - th.x, az = p.z - th.z, ad = Math.hypot(ax, az) || 1, fd = trimKit.eng.on ? 3.5 + rnd() : 2.5 + rnd();
                  h.tgt.set(p.x + ax / ad * fd, 0, p.z + az / ad * fd); if (!free(h.tgt.x, h.tgt.z)) pick(h, p.x + ax / ad * fd, p.z + az / ad * fd, 0, 1.5);
                  h.st = 'flee'; h.k = 0; h.spd = 0.42 + 0.08 * rnd(); }
                else if (roost && !['flee', 'toCoop', 'queue', 'standUp'].includes(h.st)) { if (h.sit) { h.st = 'standUp'; h.k = 0; } else { h.st = 'toCoop'; h.k = 0; h.tgt.copy(CO.rampFoot); h.spd = 0.24; } }
                else if (!roost && rain && !['flee', 'toCover', 'cover', 'sitDown', 'sit', 'standUp'].includes(h.st)) { const q = nearestCover(h); h.tgt.set(q.x, 0, q.z); h.st = 'toCover'; h.k = 0; h.spd = 0.34; }
                else if (!roost && !rain && (h.st === 'cover' || (h.st === 'sit' && !nap))) { h.st = h.sit ? 'standUp' : 'look'; h.k = 0; h.dur = 1 + rnd(); }
              } else if (h.st === 'roost' && !roost) { h.wk = (h.wk || 0) + dt; if (h.wk > 4 * h.i + 1.5) { h.st = 'wake'; h.k = 0; h.wk = 0; } }   // sáng: cửa mở rồi từng con một (cách ~4 s)
              switch (h.st) {
                case 'look': play(h, 'idle'); h.spd = 0; steer(h, dt, 0);
                  if (h.k > h.dur) { h.k = 0; if (nap && !h.sit && rnd() < 0.5) { const q = CO.under[h.i]; h.tgt.set(q.x, 0, q.z); h.st = 'toCover'; h.spd = 0.16; h.napGo = 1; }
                    else if (forageNext(h, wet)) { /* cào / cúi nhìn rồi mổ */ } else { h.st = 'walk'; const far = Math.hypot(p.x - cx, p.z - cz) > 2.6 || Math.hypot(p.x - HOME.x, p.z - HOME.z) > HOME_R;
                    if (far) pick(h, (cx + HOME.x) / 2, (cz + HOME.z) / 2, 0, 1.0); else pick(h, p.x, p.z, 0.4, 1.6);
                    if (mown) for (let k = 0; k < 6 && meadow.cutFrac(h.tgt.x, h.tgt.z, 0, 0.45) < 0.5; k++) pick(h, p.x, p.z, 0.6, 2.8);   // cỏ vừa phát: ra chỗ đã cắt bới sâu bọ
                    h.spd = 0.12 + 0.1 * rnd(); } }
                  break;
                case 'peck': play(h, 'pecking', h.ts); h.spd = 0; steer(h, dt, 0);   // đúng 1–2 vòng hoạt cảnh = 1–2 cú mổ
                  if (h.k > h.dur) lookStart(h, ground.some(o => o !== h && o.st === 'look'));   // ngẩng nuốt mồi, canh chừng
                  break;
                case 'inspect': play(h, 'pecking', 0); if (h.k < 0.05) h.A.pecking.time = PECK_LOW; h.spd = 0; steer(h, dt, 0);   // cúi nhìn chỗ đất vừa bới (mỏ dừng nửa chừng)
                  if (h.k > h.dur) peckStart(h, 'inspect');
                  break;
                case 'scratch': play(h, 'idle', 0.5); h.spd = 0; steer(h, dt, 0);   // chân cào ở scratchLegs (sau bộ trộn)
                  if (h.k > h.dur) { h.st = 'back'; h.k = 0; h.kick = 0; }
                  break;
                case 'back': {   // lùi 1 bước (~7 cm) để nhìn chỗ vừa bới
                  play(h, 'walking', -0.55); const nx = p.x - Math.sin(h.yaw) * 0.16 * dt, nz = p.z - Math.cos(h.yaw) * 0.16 * dt; if (free(nx, nz, 0.15)) { p.x = nx; p.z = nz; }
                  if (h.k > 0.45) { h.st = 'inspect'; h.k = 0; h.dur = 0.4 + 0.4 * rnd(); }
                  break;
                }
                case 'walk': case 'flee': case 'toCover': case 'toCoop': {
                  const turn = h.st === 'flee' ? 8 : 3.5, done = steer(h, dt, turn); play(h, 'walking', Math.max(0.35, h.v / (V_CLIP * h.g.scale.x)));   // sải theo cỡ con
                  if (h.st === 'toCoop') { if (done || h.k > 40) { if (rampBusy) { h.st = 'queue'; h.k = 0; } else startPath(h, intoCoop(h), toRoost); } break; }
                  if (h.st === 'toCover') { if (done || h.k > 30) { h.k = 0; h.st = h.napGo || rnd() < 0.4 ? 'sitDown' : 'cover'; h.napGo = 0; } break; }
                  if (done || h.k > (h.st === 'flee' ? 6 : 14)) { if (h.st === 'flee') lookStart(h, true, 0.5); else if (!forageNext(h, wet)) lookStart(h, true); }   // tới chỗ mới: cào / cúi nhìn ngay, hoặc ngẩng ngó quanh
                  break;
                }
                case 'queue': { const q = h.k % 4; if (q < dt * 1.5) h.A.pecking.time = 0; play(h, q < PECK_T / 1.2 ? 'pecking' : 'idle', 1.2); } h.spd = 0;   // chờ lượt: 4 s mổ 1 cú steer(h, dt, 0); if (!rampBusy && h.k > 0.8 * h.i) startPath(h, intoCoop(h), toRoost); break;   // chờ con trước lên xong
                case 'cover': play(h, 'idle', 0.7); h.spd = 0; steer(h, dt, 0); break;   // đứng xù lông dưới chỗ trú, chờ tạnh
                case 'path': followPath(h, dt); break;
                case 'sitDown': play(h, 'sitting-down'); h.spd = 0; if (h.level === 'ground') steer(h, dt, 0); if (h.k > 1.15) { h.st = h.level === 'perch' ? 'roost' : 'sit'; h.sit = 1; h.k = 0; } break;
                case 'sit': play(h, 'sitting-idle', 0.6); if (nap && !rain && h.k > 300 + 400 * rnd()) { h.st = 'standUp'; h.k = 0; } break;
                case 'roost': play(h, 'sitting-idle', 0.4); break;
                case 'wake': play(h, 'standing-up'); if (h.k > 1.25) { h.sit = 0; startPath(h, outOfCoop(h), q => { q.level = 'ground'; q.gy = q.g.position.y; q.st = 'look'; q.dur = 1 + rnd(); }); } break;
                case 'standUp': play(h, 'standing-up'); if (h.k > 1.25) { h.st = 'look'; h.sit = 0; h.k = 0; h.dur = 1 + rnd(); } break;
              }
              // ---- hoà hoạt cảnh lặp · đặt thân (dưới đất: độ cao địa hình làm mượt — bậc voxel 0,6 m thành cú nhảy ngắn) ----
              const kw = Math.min(1, dt * 7);
              for (const n of LOOPS) { h.W[n] += ((h.anim === n ? 1 : 0) - h.W[n]) * kw; h.A[n].setEffectiveWeight(h.W[n]); }
              for (const n of ONCE) { h.W[n] += ((h.anim === n ? 1 : 0) - h.W[n]) * kw; h.A[n].setEffectiveWeight(h.W[n]); }
              h.mixer.update(dt);
              if (h.st === 'scratch') scratchLegs(h);
              if (h.level === 'ground') { h.gy += (cowY(p.x, p.z) - h.gy) * Math.min(1, dt * 12); p.y = h.gy; }
              h.g.rotation.y = h.yaw;
            }
          }
          return Object.assign(C, { update(dt, t) { update(dt, t); if (C.ready) dirtTick(Math.min(dt, 0.05)); }, roostTime });
        })();
