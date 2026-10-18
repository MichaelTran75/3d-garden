        // ===== GÀ MÁI THẢ VƯỜN × 3 (G 18/10 "add 3 chickens" + mẫu GLB; "add chicken behaviour and back to chuồng gà khi mặt trời lặn, và ra ngoài kiếm ăn khi
        //  mặt trời mọc, biết kiếm chỗ tránh mưa near by under cover") =====
        //  Mẫu "Chicken - rigged" (Maf'j Alvarez, CC-BY-4.0) dựng lại bằng src/tools/chicken/ → src/models/chicken.glb 152 KB: 1 lưới da màu đỉnh (736 tam giác,
        //  17 xương), mét, đầu về +Z, 6 hoạt cảnh (walking · pecking · idle · sitting-down · sitting-idle · standing-up). Mỗi con 1 bản sao (SkeletonUtils) + 1 bộ trộn.
        //  ĐI KHÔNG TRƯỢT CHÂN: hoạt cảnh 'walking' của mẫu có sẵn chuyển động gốc (cả thân tiến 0,23 m mỗi chu kỳ 1,58 s) ⇒ trừ dời tuyến tính khỏi các rãnh vị
        //  trí cho vòng lặp tại chỗ, rồi đẩy con gà tiến đúng 0,145 m/s × tốc độ phát ⇒ bàn chân trụ đứng yên trên đất như hoạt cảnh gốc.
        //  TẬP TÍNH (gà thả vườn: kiếm ăn = đi vài bước – dừng mổ – ngó quanh; đàn giữ gần nhau; sợ người lại gần, sợ tiếng máy; trú mưa; ngủ sớm):
        //   · NGÀY: kiếm ăn trên bãi cỏ trước CHUỒNG (camp/chicken-coop.js — tâm vùng cách cửa chuồng 3,5 m, bán kính 4 m): phần lớn thời gian đứng mổ (3–8 s / lượt,
        //     1,3–1,6 lần mổ / giây), xen ngó quanh 1–3 s, mỗi lượt đi 0,3–1,6 m chậm 0,12–0,22 m/s; xa đàn > 2,6 m thì đi về phía đàn; cách nhau ≥ 0,35 m; né
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
                const h = { g, mixer, A, W, anim: 'idle', st: 'look', k: 0, dur: 1 + 2 * rnd(), tgt: new THREE.Vector3(), spd: 0, v: 0, yaw: rnd() * 6.2832, i, sit: 0, gy: 0, level: 'ground', path: null, pi: 0, seg0: new THREE.Vector3(), segT: 0 };
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
                    else if (rnd() < (wet ? 0.78 : 0.62)) { h.st = 'peck'; h.dur = 3 + 5 * rnd(); } else { h.st = 'walk'; const far = Math.hypot(p.x - cx, p.z - cz) > 2.6 || Math.hypot(p.x - HOME.x, p.z - HOME.z) > HOME_R;
                    if (far) pick(h, (cx + HOME.x) / 2, (cz + HOME.z) / 2, 0, 1.0); else pick(h, p.x, p.z, 0.4, 1.6);
                    if (mown) for (let k = 0; k < 6 && meadow.cutFrac(h.tgt.x, h.tgt.z, 0, 0.45) < 0.5; k++) pick(h, p.x, p.z, 0.6, 2.8);   // cỏ vừa phát: ra chỗ đã cắt bới sâu bọ
                    h.spd = 0.12 + 0.1 * rnd(); } }
                  break;
                case 'peck': play(h, 'pecking', 1.25 + 0.3 * Math.sin(h.i * 7)); h.spd = 0; steer(h, dt, 0);   // mổ 1,3–1,6 lần / giây
                  if (h.k > h.dur) { h.k = 0; h.st = rnd() < 0.55 ? 'look' : 'walk'; h.dur = 1 + 2 * rnd(); if (h.st === 'walk') { pick(h, p.x, p.z, 0.3, 1.0); h.spd = 0.12 + 0.08 * rnd(); } }   // mổ xong: ngó quanh hoặc bước vài bước
                  break;
                case 'walk': case 'flee': case 'toCover': case 'toCoop': {
                  const turn = h.st === 'flee' ? 8 : 3.5, done = steer(h, dt, turn); play(h, 'walking', Math.max(0.35, h.v / (V_CLIP * h.g.scale.x)));   // sải theo cỡ con
                  if (h.st === 'toCoop') { if (done || h.k > 40) { if (rampBusy) { h.st = 'queue'; h.k = 0; } else startPath(h, intoCoop(h), toRoost); } break; }
                  if (h.st === 'toCover') { if (done || h.k > 30) { h.k = 0; h.st = h.napGo || rnd() < 0.4 ? 'sitDown' : 'cover'; h.napGo = 0; } break; }
                  if (done || h.k > (h.st === 'flee' ? 6 : 14)) { h.k = 0; h.dur = 0.8 + 1.5 * rnd(); h.st = h.st === 'flee' ? 'look' : rnd() < 0.78 ? 'peck' : 'look'; if (h.st === 'peck') h.dur = 3 + 5 * rnd(); }
                  break;
                }
                case 'queue': play(h, h.k % 6 < 3 ? 'idle' : 'pecking'); h.spd = 0; steer(h, dt, 0); if (!rampBusy && h.k > 0.8 * h.i) startPath(h, intoCoop(h), toRoost); break;   // chờ con trước lên xong
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
              if (h.level === 'ground') { h.gy += (cowY(p.x, p.z) - h.gy) * Math.min(1, dt * 12); p.y = h.gy; }
              h.g.rotation.y = h.yaw;
            }
          }
          return Object.assign(C, { update, roostTime });
        })();
