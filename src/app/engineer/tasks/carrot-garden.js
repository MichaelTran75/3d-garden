        // ===== LUỐNG CÀ RỐT DỤ THỎ — tự chủ đợt 2 (G 18/10 "trồng carot để thu hút thỏ về ăn") =====
        //  Luống gỗ nâng 2,0 × 0,62 (x65,6 z97,4 — bãi phẳng phía bắc bạt, giữa xe và cây táo, nhìn thấy từ ghế cắm trại), 2 hàng × 4 khóm. Mỗi khóm lớn
        //  dần theo giờ thật (40 phút từ cây con tới củ lớn, tưới / mưa trong 30 phút thì nhanh ×1,4): lá lông chim cao dần, củ đủ lớn thì vai cam nhô khỏi đất.
        //  Mở trang: các khóm đã trồng sẵn, lớn ngẫu nhiên 40–110%.
        //  THỎ (animals/deer-crab-bunny.js · loop/main-loop-rest.js): ban ngày, không mưa, có khóm chín, đã 4–7 phút từ củ trước (củ đầu: 1 phút), người không ở luống ⇒ bỏ đào cà rốt hoang,
        //  nhảy theo bảng dẫn đường tới mép luống cạnh khóm chín, ngửi, nhổ củ (lá rung, củ trồi lên) rồi ngồi ôm gặm 12 s — khóm thành hố trống. Người đi sát (< 1,6) thì bỏ củ nhảy đi.
        //  KỸ SƯ (pha 'garden'): luống có ≥ 2 hố trống, hoặc 3 giờ chưa tưới / chưa mưa, trong giờ rảnh ngoài trời ban ngày ⇒ ra luống: ngồi xổm cạnh
        //  từng hố, bay xới 3 nhát, đặt cây con, vỗ đất · lấy bình tưới ở đầu luống, tưới dọc 2 chỗ, cất bình. Thỏ đang ăn ở luống mà kỹ sư đang rảnh ngoài
        //  trời ⇒ ra cách 2,4 đv ngồi xổm xem (không lại gần), "Thỏ ăn cà rốt mình trồng kìa" · xem xong thì trồng lại hố thỏ vừa ăn.
        //  BẤM "Farming" ở bảng Tools (G 20/10 "add vào tool 'Farming' để khi click thì ra trồng carot" — engForceAct 'garden'): trồng hố trống; luống không còn
        //  hố thì NHỔ ≤ 2 củ chín (nắm gốc lá giật lên, củ trồi khỏi đất, cầm củ bỏ túi) rồi trồng cây con thay; luôn tưới luống trước khi về ----
        const carrotBed = (() => {
          const C = new THREE.Vector3(X0 + 65.6, 0, Z0 + 97.4); C.y = cowY(C.x, C.z);
          const L = 2.0, W = 0.62, H = 0.16, ROW = 0.14, N = 4, AX = new THREE.Vector3(1, 0, 0), SD = new THREE.Vector3(0, 0, 1);   // dọc luống theo +x, mặt bên ±z
          const GROW_T = 2400, WET_T = 1800, rnd = mulberry32(5150);
          const g = new THREE.Group(); g.name = 'Luống cà rốt'; g.position.copy(C); scene.add(g);
          const wood = new THREE.MeshLambertMaterial({ color: 0x8d6440 }), soil = new THREE.MeshLambertMaterial({ color: 0x4a3426 }), wetSoil = new THREE.MeshLambertMaterial({ color: 0x34241a });
          const leafM = new THREE.MeshLambertMaterial({ color: 0x4f9a3a, side: THREE.DoubleSide }), rootM = new THREE.MeshLambertMaterial({ color: 0xe8762c }), holeM = new THREE.MeshLambertMaterial({ color: 0x23170f });
          for (const [sx, sz, lx, lz] of [[0, -1, L, 0.045], [0, 1, L, 0.045], [-1, 0, 0.045, W], [1, 0, 0.045, W]]) {   // 4 ván khung
            const p = new THREE.Mesh(new THREE.BoxGeometry(lx, H, lz), wood); p.position.set(sx * (L / 2 - 0.0225), H / 2, sz * (W / 2 - 0.0225)); p.castShadow = p.receiveShadow = true; g.add(p);
          }
          const top = new THREE.Mesh(new THREE.BoxGeometry(L - 0.09, H - 0.03, W - 0.09), soil); top.position.y = (H - 0.03) / 2; top.receiveShadow = true; g.add(top);
          // khóm cà rốt: 5 lá lông chim (mặt phẳng hình thoi xẻ) + vai củ (nón cam chúc xuống) + hố
          const leafGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.03, 0.12); s.lineTo(0.012, 0.13); s.lineTo(0.028, 0.22); s.lineTo(0, 0.3); s.lineTo(-0.028, 0.22); s.lineTo(-0.012, 0.13); s.lineTo(-0.03, 0.12); s.lineTo(0, 0); return new THREE.ShapeGeometry(s); })();
          const rootGeo = new THREE.ConeGeometry(0.03, 0.17, 8); rootGeo.rotateX(Math.PI); rootGeo.translate(0, -0.085 + 0.02, 0);
          const holeGeo = new THREE.CircleGeometry(0.035, 10); holeGeo.rotateX(-Math.PI / 2);
          const slots = [];
          for (let r = 0; r < 2; r++) for (let i = 0; i < N; i++) {
            const x = (i - (N - 1) / 2) * (L - 0.3) / (N - 1), z = (r ? 1 : -1) * ROW, s = new THREE.Group(); s.position.set(x, H - 0.03, z); g.add(s);
            const tuft = new THREE.Group(); s.add(tuft);
            for (let k = 0; k < 5; k++) { const lf = new THREE.Mesh(leafGeo, leafM); lf.rotation.set(-0.22 - 0.2 * rnd(), k / 5 * TAU + rnd() * 0.5, 0, 'YXZ'); lf.scale.setScalar(0.8 + 0.4 * rnd()); tuft.add(lf); }
            const root = new THREE.Mesh(rootGeo, rootM); s.add(root);
            const hole = new THREE.Mesh(holeGeo, holeM); hole.position.y = 0.002; s.add(hole);
            slots.push({ s, tuft, root, hole, x, z, row: r, i, g: 0.4 + 0.7 * rnd(), st: 'grow', wob: 0 });
          }
          g.traverse(o => { if (o.isMesh) o.userData.noBatch = o.userData.noBake = true; });
          for (const sl of slots) for (const o of [sl.tuft, sl.root, sl.hole]) o.traverse(m => { m.userData.noCollide = true; });
          // vật cản (2 vòng dọc luống): người, gà, chim đáp đất né · chỗ đứng chăm luống đã cách mép luống
          for (const sx of [-0.25, 0.25]) { obstacleCoords.push({ x: C.x + sx * L, y: C.y, z: C.z, r: 0.56, h: 0.3 }); ENG_PROPS.push({ x: C.x + sx * L, z: C.z, r: 0.32 }); }   // 2 vòng ở ¼ và ¾ chiều dài phủ kín luống (vòng đẩy người 0,64 < chỗ đứng chăm 0,67)
          for (let u = -0.8; u <= 0.81; u += 0.4) meadow.cutAt(C.x + u, C.z, 0.45);   // cỏ dưới luống cắt sát (không lòi lên mặt đất luống)
          const B = { lastWater: -1e9, eatAt: -1e9, gap: 60, bunny: null };   // gap: 4–7 phút giữa 2 củ (củ đầu sau 1 phút)
          const engNear = (p, r, v = -1) => { const e = engObj; return !!e && !e.inVan && e.g.parent === scene && (e.vel || 0) > v && Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z) < r; };
          const world = (sl, out) => out.set(C.x + sl.x, C.y + H - 0.03, C.z + sl.z);
          function show(sl) {   // dáng khóm theo trạng thái + độ lớn
            const gr = Math.min(1, sl.g), on = sl.st !== 'empty';
            sl.tuft.visible = on && sl.st !== 'eaten'; sl.root.visible = on && sl.st !== 'eaten'; sl.hole.visible = sl.st === 'empty' || sl.st === 'eaten';
            sl.tuft.scale.setScalar(0.2 + 0.8 * gr); sl.tuft.rotation.z = sl.wob;
            sl.root.scale.setScalar(0.35 + 0.65 * gr); sl.root.position.y = sl.pull || (gr > 0.7 ? 0.012 * (gr - 0.7) / 0.3 : -0.02);
          }
          slots.forEach(show);
          // ---- dẫn đường cho thỏ tới luống (bảng DP 1 lần) ----
          let field = null; const fieldTo = () => field || (field = buildFlowField(C.x, C.z + W / 2 + 0.6));
          function update(dt, t) {   // mỗi khung: lớn dần, đất ướt
            const wet = liveWeather.state.raining || clock.elapsedTime - B.lastWater < WET_T;
            if (wet && liveWeather.state.raining) B.lastWater = clock.elapsedTime;
            top.material = wet ? wetSoil : soil;
            for (const sl of slots) {
              if (sl.st === 'grow' && sl.g < 1.1) sl.g += dt / GROW_T * (wet ? 1.4 : 1);
              sl.wob *= Math.exp(-dt * 3); if (Math.abs(sl.wob) > 1e-3 || sl.st === 'grow') show(sl);
            }
          }
          const ripe = () => slots.filter(s => s.st === 'grow' && s.g >= 1 && !s.taken);
          // ---- THỎ ĂN CÀ RỐT Ở LUỐNG (gọi trong vòng thỏ, sau bunnyRain): true = đang lo dáng thỏ ----
          function bunny(b, dt, t) {
            let J = b.bed;
            if (!J) {
              if (b.state === 'dig' || b.state === 'eatCarrot' || !daytimeAnimals.visible || clock.elapsedTime - B.eatAt < B.gap) return false;
              const R = ripe(); if (!R.length || engNear(C, 3)) return false;   // người đang ở luống: chưa tới
              const sl = R.sort((p, q) => Math.hypot(C.x + p.x - b.x, C.z + p.z - b.z) - Math.hypot(C.x + q.x - b.x, C.z + q.z - b.z))[0], side = sl.row ? 1 : -1;
              J = b.bed = { sl, st: 'go', k: 0, at: new THREE.Vector3(C.x + sl.x, 0, C.z + side * (W / 2 + 0.17)) }; sl.taken = true; B.bunny = b;
            }
            J.k += dt; const sl = J.sl;
            if (J.st !== 'go' && J.st !== 'quit' && engNear(b.g.position, 1.6, 0.3)) {   // người đi lại sát: bỏ củ, nhảy đi
              if (J.st === 'eat') { b.carrot.visible = false; b.carrot.position.y = -0.1; B.eatAt = clock.elapsedTime; } else if (sl.pull) { sl.pull = 0; show(sl); }
              J.st = 'quit';
            }
            if (J.st === 'go') {
              const dx = J.at.x - b.x, dz = J.at.z - b.z, dd = Math.hypot(dx, dz);
              if (dd < 0.08 || J.k > 120) { J.st = dd < 0.5 ? 'sniff' : 'quit'; J.k = 0; b.hop = 0; }
              else {
                let ux = dx / dd, uz = dz / dd; if (dd > 1.6) { const f = ffDir(fieldTo(), b.x, b.z); if (f) { ux = f.x; uz = f.z; } }
                let da = Math.atan2(uz, ux) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += dd < 0.6 ? da * Math.min(1, dt * 8) : da * Math.min(1, dt * 5);
                b.hop = (b.hop + dt * 3.2) % 1; const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5, step = Math.min(dd, b.spd * dt * (0.5 + lift));
                const mv = b.col && dd > 0.5 ? colSlide(b.col, b.x, b.z, b.ang, step, dt) : [b.x + Math.cos(b.ang) * step, b.z + Math.sin(b.ang) * step]; if (mv) { b.x = mv[0]; b.z = mv[1]; }
                b.g.position.set(b.x, cowY(b.x, b.z) + lift, b.z); b.g.rotation.y = -b.ang; b.paws[0].rotation.z = b.paws[1].rotation.z = -0.45 - lift * 0.4; b.head.rotation.z = 0;
              }
            } else if (J.st === 'quit') { sl.taken = false; b.bed = null; B.bunny = null; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0; b.state = 'hop'; b.tmr = 2.5; b.ang += Math.PI * (0.7 + 0.6 * Math.random()); return false; }
            else {
              const sp = world(sl, _cgA), ta = Math.atan2(sp.z - b.z, sp.x - b.x); let da = ta - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += da * Math.min(1, dt * 6);
              b.g.position.set(b.x, cowY(b.x, b.z), b.z); b.g.rotation.y = -b.ang;
              if (J.st === 'sniff') {   // ngửi khóm lá: đầu gật, lá rung
                b.head.rotation.z = -0.25 + Math.sin(t * 16) * 0.08; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; sl.wob = Math.sin(t * 9) * 0.15;
                if (J.k > 1.6) { J.st = 'pull'; J.k = 0; }
              } else if (J.st === 'pull') {   // ngoạm lá, giật lùi: củ trồi lên khỏi đất
                const u = Math.min(1, J.k / 1.6); b.head.rotation.z = -0.35 + 0.25 * u; b.paws[0].rotation.z = b.paws[1].rotation.z = 0.5 * u;
                sl.pull = 0.02 + 0.13 * u * u; sl.wob = Math.sin(t * 22) * 0.12 * (1 - u); show(sl);
                if (J.k > 1.7) { J.st = 'eat'; J.k = 0; sl.st = 'eaten'; sl.pull = 0; sl.taken = false; show(sl); b.carrot.visible = true; b.carrot.scale.setScalar(1); b.carrot.position.y = -0.1 + 0.3; }
              } else if (J.st === 'eat') {   // ôm củ gặm (như đào cà rốt hoang)
                const ep = Math.min(1, J.k / 12); b.carrot.scale.setScalar(Math.max(0.06, 1 - ep * ep)); b.paws[0].rotation.z = b.paws[1].rotation.z = 0.9; b.head.rotation.z = -0.28 + Math.sin(t * 14) * 0.12;
                if (J.k > 12) { b.carrot.visible = false; b.carrot.position.y = -0.1; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0; b.bed = null; B.bunny = null; B.eatAt = clock.elapsedTime; B.gap = 240 + 180 * Math.random(); b.state = 'sniff'; b.tmr = 3 + 3 * Math.random(); b.digTmr = Math.max(b.digTmr, 90); return false; }
              }
            }
            return true;
          }
          function bunnyCancel(b) { if (b.bed) { b.bed.sl.taken = false; if (b.bed.sl.pull) { b.bed.sl.pull = 0; show(b.bed.sl); } b.bed = null; B.bunny = null; } }   // mưa / tối: bỏ dở
          const _cgA = new THREE.Vector3();
          return { C, L, W, H, AX, SD, slots, B, world, show, update, bunny, bunnyCancel, ripe, field: fieldTo,
            empty: () => slots.filter(s => s.st === 'empty' || s.st === 'eaten'), dry: () => clock.elapsedTime - B.lastWater > 10800 && !liveWeather.state.raining,   // 3 giờ chưa tưới / chưa mưa
            eating: () => !!B.bunny && !!B.bunny.bed && B.bunny.bed.st !== 'go' };
        })();
        // ---- KỸ SƯ CHĂM LUỐNG: trồng lại hố trống · tưới · xem thỏ ăn ----
        function gardenWant(e, hh, sched) {   // engWantAct: 'garden' hoặc null
          if (gardenJob.busy()) return 'garden';
          if (engForceAct || !engHourOk('garden', hh) || liveWeather.state.raining || !GARDEN_SLOT.has(sched) || clock.elapsedTime < gardenJob.next) return null;
          if (carrotBed.eating() && Math.hypot(carrotBed.C.x - e.g.position.x, carrotBed.C.z - e.g.position.z) < 18) return 'garden';
          return carrotBed.empty().length >= 2 || carrotBed.dry() ? 'garden' : null;
        }
        const GARDEN_SLOT = new Set(['outdoor', 'rest', 'fish']);
        const gardenJob = (() => {
          const J = { st: 'idle', k: 0, list: [], cur: null, n: 0, stand: new THREE.Vector3(), can: 'home', trowel: false, pour: 0, watched: false, route: null, rq: new THREE.Vector3() }, next = { v: 0 };
          const CB = carrotBed, _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
          const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          // bình tưới xanh (gốc toạ độ = chỗ nắm quai trên, +z = hướng vòi) · bay xới
          const can = new THREE.Group(); can.name = 'Bình tưới'; scene.add(can);
          const canM = new THREE.MeshLambertMaterial({ color: 0x3f8f5a }), dk = new THREE.MeshLambertMaterial({ color: 0x2c2c2c });
          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.22, 14), canM); body.position.set(0, -0.2, 0.0); can.add(body);
          const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.3, 6), canM); spout.rotation.x = 1.0; spout.position.set(0, -0.18, 0.22); can.add(spout);
          const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.014, 0.04, 8), canM); rose.rotation.x = 1.0; rose.position.set(0, -0.09, 0.355); can.add(rose);
          const handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.011, 5, 12, Math.PI), canM); handle.rotation.y = Math.PI / 2; handle.position.set(0, -0.09, -0.02); can.add(handle);
          const trowel = new THREE.Group(); trowel.name = 'Bay xới'; scene.add(trowel); trowel.visible = false;
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.11), new THREE.MeshLambertMaterial({ color: 0xa8adb2 })); blade.position.z = 0.12; trowel.add(blade);
          const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), dk); grip.rotation.x = Math.PI / 2; grip.position.z = 0.02; trowel.add(grip);
          // giọt nước tưới: 18 hạt rơi từ hoa sen xuống đất
          const dropGeo = new THREE.SphereGeometry(0.008, 4, 3), dropM = new THREE.MeshBasicMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.8 }), drops = new THREE.InstancedMesh(dropGeo, dropM, 18);
          drops.frustumCulled = false; drops.count = 0; scene.add(drops); const dropT = new Float32Array(18).map(() => Math.random()), _m = new THREE.Matrix4();
          const hcar = new THREE.Group(); hcar.add(CB.slots[0].root.clone(), CB.slots[0].tuft.clone()); for (const o of hcar.children) { o.position.set(0, 0, 0); o.scale.setScalar(1); } hcar.visible = false; scene.add(hcar);   // củ vừa nhổ trong tay phải
          for (const o of [can, trowel, drops, hcar]) o.traverse(m => { m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; });
          const CAN_HOME = new THREE.Vector3(CB.C.x + CB.L / 2 + 0.3, CB.C.y, CB.C.z + 0.15), CAN_ST = CAN_HOME.clone().add(_a.set(0.5, 0, 0.2));
          const homeCan = () => { can.position.set(CAN_HOME.x, CAN_HOME.y + 0.31, CAN_HOME.z); can.rotation.set(0, -Math.PI / 2, 0); };
          homeCan(); ENG_PROPS.push({ x: CAN_HOME.x, z: CAN_HOME.z, r: 0.14 });
          const go = st => { J.st = st; J.k = 0; J.route = null; };
          function bedRoute(p, q) {   // đường thẳng p → q cắt luống (nới 0,3) ⇒ vòng qua đầu luống gần hơn: góc phía mình → góc phía đích → đích
            const hx = CB.L / 2 + 0.3, hz = CB.W / 2 + 0.3, ax = p.x - CB.C.x, az = p.z - CB.C.z, bx = q.x - CB.C.x, bz = q.z - CB.C.z;
            let hit = false; for (let i = 1; i < 16 && !hit; i++) { const u = i / 16, x = ax + (bx - ax) * u, z = az + (bz - az) * u; hit = Math.abs(x) < hx && Math.abs(z) < hz; }
            if (!hit) return [q.clone()];
            const ex = CB.C.x + (ax + bx >= 0 ? 1 : -1) * (CB.L / 2 + 0.6), zs = v => CB.C.z + (v >= 0 ? 1 : -1) * (CB.W / 2 + 0.5);
            return [new THREE.Vector3(ex, 0, zs(az)), new THREE.Vector3(ex, 0, zs(bz)), q.clone()];
          }
          function goTo(e, q, dt, t) {   // đi tới q (vòng qua đầu luống nếu cần); true = tới nơi
            if (!J.route || J.rq.distanceToSquared(q) > 1e-6) { J.rq.copy(q); J.route = bedRoute(e.g.position, q); }
            const w = J.route[0]; if (J.route.length > 1 && Math.hypot(w.x - e.g.position.x, w.z - e.g.position.z) < 0.45) { J.route.shift(); return false; }
            const far = J.route.length === 1 && Math.hypot(CB.C.x - e.g.position.x, CB.C.z - e.g.position.z) > 3.5 && !rxDry(e.g.position);   // xa luống, ngoài bạt: theo bảng dẫn đường (dưới bạt ô lưới bị vật cản xe chặn — bảng chỉ sai hướng)
            if (engStep(e, w, dt, t, pf, FIRE_AVOID_R, far ? CB.field() : null)) { if (J.route.length > 1) { J.route.shift(); return false; } J.route = null; return true; }
            return false;
          }
          const standFor = (sl, out) => out.set(CB.C.x + sl.x, CB.C.y, CB.C.z + (sl.row ? 1 : -1) * (CB.W / 2 + 0.36));   // đứng mép luống phía hàng của khóm, ngay ngang khóm
          function crouch(e, sq, at) {
            e.noFootIK = true; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.24 * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * sq; e.lean = 0.28 * sq; e.spineT = { x: 0.32 * sq, y: 0 };
            if (at) { const yt = Math.atan2(at.x - e.g.position.x, at.z - e.g.position.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * 0.2; rxLook('job', 3.5, 0.3, at); }
          }
          function update(e, dt, t) {   // pha 'garden' · true = xong
            J.k += dt; const k = J.k;
            if (J.st === 'idle') {
              J.list = CB.empty().sort((p, q) => p.row !== q.row ? q.row - p.row : (p.row ? p.x - q.x : q.x - p.x)); J.n = 0; J.watched = false;   // hàng nam (phía trại) trước, vòng sang hàng bắc đi ngược lại
              if (!J.list.length && engForceAct === 'garden') J.list = CB.slots.filter(s => s.st === 'grow' && s.g >= 1 && !s.taken).sort((p, q) => q.g - p.g).slice(0, 2);   // bấm Farming, không còn hố: nhổ ≤ 2 củ chín
              go(CB.eating() ? 'toWatch' : J.list.length ? 'toSlot' : 'toCan');
            }
            if (J.can === 'hand' && (J.st === 'toPour' || J.st === 'toCanBack')) { e.arms[1].rotation.x = 0.05; (e.armRollT || (e.armRollT = [0, 0]))[1] = 0.16; }
            e.armsBusy = J.st !== 'toSlot' && J.st !== 'toCan' && J.st !== 'toWatch';
            switch (J.st) {
              case 'toSlot': {
                J.cur = J.list[J.n]; if (!J.cur) { go('toCan'); break; }
                if (goTo(e, standFor(J.cur, J.stand), dt, t)) go(J.cur.st === 'grow' ? 'pull' : 'plant'); else if (k > 40) go('toCan');
                break;
              }
              case 'plant': {   // ngồi xổm: bay xới 3 nhát · đặt cây con · vỗ đất
                engStandStill(e); const sl = J.cur, sp = CB.world(sl, _a), sq = sm(k / 0.6) * (1 - sm((k - 4.2) / 0.6)); crouch(e, sq, sp);
                J.trowel = k > 0.4 && k < 2.6; const ax = engAxesW(e);
                if (k < 2.6) { const dig = Math.max(0, Math.sin(Math.max(0, k - 0.6) * Math.PI * 1.5)); engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.05 + 0.12 * (1 - dig)).addScaledVector(ax.r, 0.04), aimQ(_q, _c.copy(ax.f).addScaledVector(UP, -1.2).normalize(), ax.f)); }
                else if (k < 3.4) { engHandSet(e, 1, _b.copy(sp).addScaledVector(UP, 0.06 + 0.1 * (1 - sm((k - 2.6) / 0.4))), aimQ(_q2, _c.set(0, -1, 0), ax.f)); if (k > 3.0 && sl.st !== 'grow') { sl.st = 'grow'; sl.g = 0.05; CB.show(sl); } }
                else if (k < 4.2) { const pat = Math.abs(Math.sin((k - 3.4) * Math.PI * 2.5)); engHandSet(e, 0, _b.copy(sp).addScaledVector(ax.r, 0.07).addScaledVector(UP, 0.04 + 0.08 * pat), aimQ(_q, _c.set(0, -1, 0), ax.f)); engHandSet(e, 1, _b.copy(sp).addScaledVector(ax.r, -0.07).addScaledVector(UP, 0.04 + 0.08 * (1 - pat)), aimQ(_q2, _c.set(0, -1, 0), ax.f)); }
                if (k > 4.8) { J.n++; envNeed(2, 2); go(J.n < J.list.length ? 'toSlot' : 'toCan'); }
                break;
              }
              case 'pull': {   // nhổ củ chín: nắm gốc lá, giật lên (củ trồi khỏi đất) · cầm củ đưa về túi bên hông · hố trống ⇒ trồng cây con (vào 'plant' khi đã ngồi xổm sẵn)
                engStandStill(e); const sl = J.cur, sp = CB.world(sl, _a), ax = engAxesW(e), u = sm((k - 0.6) / 0.9); crouch(e, sm(k / 0.6), sp);
                if (k < 1.6) { sl.pull = 0.02 + 0.15 * u * u; sl.wob = Math.sin(t * 20) * 0.1 * (1 - u); CB.show(sl); engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.12 + 0.17 * u), aimQ(_q, _c.set(0, -1, 0), ax.f)); }
                else { if (sl.st === 'grow') { sl.st = 'empty'; sl.pull = 0; CB.show(sl); J.hc = true; } engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.29).lerp(engBodyW(e, -0.2, 1.05, 0.12, _c), sm((k - 1.6) / 0.6)), aimQ(_q, _c.set(0, -1, 0), ax.f)); }
                if (k > 2.3) { J.hc = false; go('plant'); J.k = 0.6; }
                break;
              }
              case 'toCan': if (goTo(e, CAN_ST, dt, t)) go('pickCan'); else if (k > 40) return finish(); break;
              case 'pickCan': case 'putCan': {
                engStandStill(e); const sq = sm(k / 0.5) * (1 - sm((k - 0.9) / 0.5)); crouch(e, sq * 0.8, CAN_HOME);
                if (J.can !== 'hand' || J.st === 'putCan') engHandSet(e, 0, _b.set(CAN_HOME.x, CAN_HOME.y + 0.32 + 0.1 * (1 - sq), CAN_HOME.z), aimQ(_q, _c.set(0, -1, 0), engAxesW(e).f));
                if (k > 0.7) { if (J.st === 'pickCan') J.can = 'hand'; else if (J.can === 'hand') { J.can = 'home'; homeCan(); } }
                if (k > 1.4) { if (J.st === 'pickCan') { J.n = 0; go('toPour'); } else return finish(); }
                break;
              }
              case 'toPour': {   // 2 chỗ tưới dọc mép nam luống
                const x = J.n ? 0.45 : -0.45; if (goTo(e, _b.set(CB.C.x + x * CB.L / 2 * 1.1, CB.C.y, CB.C.z + CB.W / 2 + 0.42), dt, t)) go('pour'); else if (k > 40) go('toCanBack');
                break;
              }
              case 'pour': {   // nghiêng bình: hoa sen chúc xuống luống, nước rơi 3,4 s
                engStandStill(e); const yt = Math.atan2(-CB.SD.x, -CB.SD.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 4);
                J.pour = sm(k / 0.6) * (1 - sm((k - 3.6) / 0.5)); e.lean = 0.08 * J.pour; rxLook('job', 3.5, 0.3, _b.set(e.g.position.x, CB.C.y + CB.H, CB.C.z));
                const ax = engAxesW(e); engHandSet(e, 0, engBodyW(e, -0.16, 1.5 + 0.06 * J.pour, 0.42, _b), aimQ(_q, ax.r, _c.copy(ax.f).negate()));
                if (k > 4.2) { CB.B.lastWater = clock.elapsedTime; J.pour = 0; J.n++; go(J.n < 2 ? 'toPour' : 'toCanBack'); }
                break;
              }
              case 'toCanBack': if (goTo(e, CAN_ST, dt, t)) go('putCan'); else if (k > 40) { J.can = 'home'; homeCan(); return finish(); } break;
              case 'toWatch': {   // thỏ đang ăn ở luống: ra chỗ cách 2,4 đv, ngồi xổm xem
                if (!CB.eating() && k > 1) { go(J.list.length ? 'toSlot' : CB.dry() || engForceAct === 'garden' ? 'toCan' : 'done'); break; }
                const b = CB.B.bunny; if (!b) { go('done'); break; }
                const dx = e.g.position.x - b.x, dz = e.g.position.z - b.z, d = Math.hypot(dx, dz) || 1;
                if (d < 2.6 || engStep(e, _b.set(b.x + dx / d * 2.4, 0, b.z + dz / d * 2.4), dt, t, pf, FIRE_AVOID_R, CB.field())) { go('watch'); rxSay('bunnyBed', ['Thỏ ăn cà rốt mình trồng kìa.', 'Củ cà rốt to nhất bị thỏ chọn rồi.'], 'Luống cà rốt', false); }
                else if (k > 40) go('done');
                break;
              }
              case 'watch': {
                engStandStill(e); const b = CB.B.bunny; if (!b && J.k0 === undefined) J.k0 = k;
                const sq = sm(k / 1.6) * (b ? 1 : 1 - sm((k - J.k0) / 0.8)); crouch(e, sq * 0.85, b ? b.g.position : null); e.armsBusy = false;
                if ((!b && k - J.k0 > 0.9) || k > 40) { J.k0 = undefined; envNeed(6, 6); for (const q of CB.empty()) if (!J.list.includes(q)) J.list.push(q); go(J.list.length ? 'toSlot' : CB.dry() || engForceAct === 'garden' ? 'toCan' : 'done'); J.watched = true; }   // trồng lại cả hố thỏ vừa ăn
                break;
              }
              case 'done': return finish();
            }
            return false;
          }
          function finish() { J.st = 'idle'; J.trowel = false; J.pour = 0; next.v = clock.elapsedTime + 900; return true; }
          function tick(e, dt, t) {   // sau IK tay: bay theo tay phải · bình theo tay (xách: tay trái; tưới: tay phải nghiêng) · giọt nước · củ vừa nhổ
            trowel.visible = J.st === 'plant' && J.trowel; hcar.visible = !!J.hc;
            if (J.hc) { e.wrists[0].updateWorldMatrix(true, false); hcar.position.copy(e.wrists[0].localToWorld(_a.set(0, 0, 0.06))); hcar.rotation.set(0, e.g.rotation.y, 0); }
            if (trowel.visible) { e.wrists[0].updateWorldMatrix(true, false); trowel.position.copy(e.wrists[0].localToWorld(_a.set(0, 0, 0.03))); e.wrists[0].getWorldQuaternion(trowel.quaternion).multiply(_q.setFromAxisAngle(_b.set(1, 0, 0), Math.PI / 2)); }
            if (J.can === 'hand') {
              const pouring = J.st === 'pour', w = e.wrists[pouring ? 0 : 1]; w.updateWorldMatrix(true, false); can.position.copy(w.localToWorld(_a.set(0, 0, 0.03)));
              const yaw = e.g.rotation.y; can.rotation.set(0, yaw, 0); if (pouring) can.rotateX(0.85 * J.pour);
            }
            const on = J.st === 'pour' && J.pour > 0.6; drops.count = on ? 18 : 0;
            if (on) {
              can.updateMatrixWorld(true); const src = can.localToWorld(_a.set(0, -0.11, 0.37));
              for (let i = 0; i < 18; i++) { dropT[i] = (dropT[i] + dt * 2.4) % 1; const u = dropT[i], gy = CB.C.y + CB.H - 0.02;
                _b.set(src.x + Math.sin(i * 2.3) * 0.04 + Math.sin(e.g.rotation.y) * 0.18 * u, src.y - (src.y - gy) * u * u, src.z + Math.cos(i * 1.7) * 0.04 + Math.cos(e.g.rotation.y) * 0.18 * u);
                _m.makeTranslation(_b.x, _b.y, _b.z); drops.setMatrixAt(i, _m); }
              drops.instanceMatrix.needsUpdate = true;
            }
          }
          function idle() { if (J.st === 'idle') return; if (J.st === 'pull' && J.cur.st === 'grow') { J.cur.pull = 0; CB.show(J.cur); } J.st = 'idle'; J.trowel = false; J.pour = 0; J.hc = false; trowel.visible = hcar.visible = false; drops.count = 0; if (J.can === 'hand') { J.can = 'home'; homeCan(); } next.v = clock.elapsedTime + 300; }
          return { update, tick, idle, crouch, busy: () => J.st !== 'idle', get next() { return next.v; }, goal: () => CB.C, state: J };
        })();
