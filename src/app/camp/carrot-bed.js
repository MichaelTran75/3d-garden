        // ===== LUỐNG CÀ RỐT — vật riêng (dời 01/11 khỏi engineer/tasks/carrot-garden.js; G 18/10 "trồng carot để thu hút thỏ về ăn") =====
        //  Luống gỗ nâng 2,0 × 0,62 (x65,6 z97,4 — bãi phẳng phía bắc bạt, giữa xe và cây táo, nhìn thấy từ ghế cắm trại), 2 hàng × 4 khóm. Mỗi khóm lớn
        //  dần theo giờ thật (40 phút từ cây con tới củ lớn, tưới / mưa trong 30 phút thì nhanh ×1,4): lá lông chim cao dần, củ đủ lớn thì vai cam nhô khỏi đất.
        //  Mở trang: các khóm đã trồng sẵn, lớn ngẫu nhiên 40–110%.
        //  Luống chỉ lo thân nó: khóm lớn, đất ướt, khóm đổi dáng khi bị CHẠM (giữ chỗ, rung lá, giật, nhổ — claim / release / rustle / tug / bite). Ai tới luống
        //  (thỏ: animals/bunny/carrots.js · kỹ sư: engineer/tasks/carrot-garden.js) nhìn mặt công khai worldSee('carrotBed') rồi tự quyết ----
        // G 31/10 "chỗ trồng cà rốt thấp xuống 1/2, thành thấp xuống 1/2": thành luống 16 → 8 cm (H), mặt đất trong luống 13 → 6,5 cm (SOIL)
        const carrotBed = (() => {
          const C = new THREE.Vector3(X0 + 65.6, 0, Z0 + 97.4); C.y = cowY(C.x, C.z);
          const L = 2.0, W = 0.62, H = 0.08, SOIL = H - 0.015, ROW = 0.14, N = 4, AX = new THREE.Vector3(1, 0, 0), SD = new THREE.Vector3(0, 0, 1);   // dọc luống theo +x, mặt bên ±z
          const GROW_T = 2400, WET_T = 1800, rnd = mulberry32(5150);
          const g = new THREE.Group(); g.name = 'Luống cà rốt'; g.position.copy(C); scene.add(g);
          const wood = new THREE.MeshLambertMaterial({ color: 0x8d6440 }), soil = new THREE.MeshLambertMaterial({ color: 0x4a3426 }), wetSoil = new THREE.MeshLambertMaterial({ color: 0x34241a });
          const leafM = new THREE.MeshLambertMaterial({ color: 0x4f9a3a, side: THREE.DoubleSide }), rootM = new THREE.MeshLambertMaterial({ color: 0xe8762c }), holeM = new THREE.MeshLambertMaterial({ color: 0x23170f });
          for (const [sx, sz, lx, lz] of [[0, -1, L, 0.045], [0, 1, L, 0.045], [-1, 0, 0.045, W], [1, 0, 0.045, W]]) {   // 4 ván khung
            const p = new THREE.Mesh(new THREE.BoxGeometry(lx, H, lz), wood); p.position.set(sx * (L / 2 - 0.0225), H / 2, sz * (W / 2 - 0.0225)); p.castShadow = p.receiveShadow = true; g.add(p);
          }
          const top = new THREE.Mesh(new THREE.BoxGeometry(L - 0.09, SOIL, W - 0.09), soil); top.position.y = SOIL / 2; top.receiveShadow = true; g.add(top);
          // khóm cà rốt: 5 lá lông chim (mặt phẳng hình thoi xẻ) + vai củ (nón cam chúc xuống) + hố
          const leafGeo = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0.03, 0.12); s.lineTo(0.012, 0.13); s.lineTo(0.028, 0.22); s.lineTo(0, 0.3); s.lineTo(-0.028, 0.22); s.lineTo(-0.012, 0.13); s.lineTo(-0.03, 0.12); s.lineTo(0, 0); return new THREE.ShapeGeometry(s); })();
          const rootGeo = new THREE.ConeGeometry(0.03, 0.17, 8); rootGeo.rotateX(Math.PI); rootGeo.translate(0, -0.085 + 0.02, 0);
          const holeGeo = new THREE.CircleGeometry(0.035, 10); holeGeo.rotateX(-Math.PI / 2);
          const slots = [];
          for (let r = 0; r < 2; r++) for (let i = 0; i < N; i++) {
            const x = (i - (N - 1) / 2) * (L - 0.3) / (N - 1), z = (r ? 1 : -1) * ROW, s = new THREE.Group(); s.position.set(x, SOIL, z); g.add(s);
            const tuft = new THREE.Group(); s.add(tuft);
            for (let k = 0; k < 5; k++) { const lf = new THREE.Mesh(leafGeo, leafM); lf.rotation.set(-0.22 - 0.2 * rnd(), k / 5 * TAU + rnd() * 0.5, 0, 'YXZ'); lf.scale.setScalar(0.8 + 0.4 * rnd()); tuft.add(lf); }
            const root = new THREE.Mesh(rootGeo, rootM); s.add(root);
            const hole = new THREE.Mesh(holeGeo, holeM); hole.position.y = 0.002; s.add(hole);
            slots.push({ s, tuft, root, hole, x, z, row: r, i, g: 0.4 + 0.7 * rnd(), st: 'grow', wob: 0 });
          }
          g.traverse(o => { if (o.isMesh) o.userData.noBatch = o.userData.noBake = true; });
          for (const sl of slots) for (const o of [sl.tuft, sl.root, sl.hole]) o.traverse(m => { m.userData.noCollide = true; });
          // vật cản (2 vòng dọc luống): người, gà, chim đáp đất né · chỗ đứng chăm luống đã cách mép luống
          for (const sx of [-0.25, 0.25]) { obstacleCoords.push({ x: C.x + sx * L, y: C.y, z: C.z, r: 0.56, h: 0.3 }); PROPS.push({ x: C.x + sx * L, z: C.z, r: 0.32 }); }   // 2 vòng ở ¼ và ¾ chiều dài phủ kín luống (vòng đẩy người 0,64 < chỗ đứng chăm 0,67)
          for (let u = -0.8; u <= 0.81; u += 0.4) meadow.cutAt(C.x + u, C.z, 0.45);   // cỏ dưới luống cắt sát (không lòi lên mặt đất luống)
          const B = { lastWater: -1e9 };   // lần tưới / mưa cuối (nhịp thỏ ăn giờ ở bầy thỏ: animals/bunny/carrots.js BUN_BED)
          const world = (sl, out) => out.set(C.x + sl.x, C.y + SOIL, C.z + sl.z);
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
          // ---- CHẠM VÀO KHÓM (thỏ ngửi / nhổ / gặm — animals/bunny/carrots.js gọi qua mặt công khai): luống tự đổi khóm của nó rồi vẽ lại ----
          const claim = sl => { sl.taken = true; }, release = sl => { sl.taken = false; };   // giữ chỗ khóm / thôi giữ
          const rustle = (sl, w) => { sl.wob = w; };   // lá rung (update() tắt dần, vẽ lại)
          function tug(sl, pull, wob) { sl.pull = pull; if (wob !== undefined) sl.wob = wob; show(sl); }   // giật lá: củ trồi lên pull (m) · 0 = thả về
          function bite(sl) { sl.st = 'eaten'; sl.pull = 0; sl.taken = false; show(sl); }   // củ nhổ hẳn ra: khóm thành hố
          // ---- NGƯỜI CHĂM LUỐNG (kỹ sư: engineer/tasks/carrot-garden.js gọi qua mặt công khai) ----
          function plant(sl) { sl.st = 'grow'; sl.g = 0.05; show(sl); }   // đặt cây con vào hố
          function harvest(sl) { sl.st = 'empty'; sl.pull = 0; show(sl); }   // nhổ hẳn củ: khóm thành hố trống
          const water = () => { B.lastWater = clock.elapsedTime; };   // tưới: đất ướt, khóm lớn nhanh ×1,4 trong 30 phút
          return { C, L, W, H, SOIL, AX, SD, slots, B, world, show, update, ripe, field: fieldTo, claim, release, rustle, tug, bite, plant, harvest, water,
            empty: () => slots.filter(s => s.st === 'empty' || s.st === 'eaten'), dry: () => clock.elapsedTime - B.lastWater > 10800 && !liveWeather.state.raining };   // 3 giờ chưa tưới / chưa mưa
        })();
        worldFace('carrotBed', {   // luống cà rốt nhìn từ ngoài: tâm, mặt đất trong luống, thành gỗ, bề ngang · lần tưới cuối · khóm chín, chỗ khóm, đường tới luống · chạm vào khóm · người chăm: trồng, nhổ, tưới
          get pos() { return carrotBed.C; }, get soilY() { return carrotBed.SOIL; }, get rimH() { return carrotBed.H; }, get width() { return carrotBed.W; },
          get lastWater() { return carrotBed.B.lastWater; },
          ripe: () => carrotBed.ripe(), slotPos: (sl, out) => carrotBed.world(sl, out), field: () => carrotBed.field(),   // khóm { x, z, row, st, g, pull, taken } — đọc, không ghi
          claim: sl => carrotBed.claim(sl), release: sl => carrotBed.release(sl), rustle: (sl, w) => carrotBed.rustle(sl, w), tug: (sl, p, w) => carrotBed.tug(sl, p, w), bite: sl => carrotBed.bite(sl),
          get length() { return carrotBed.L; }, get side() { return carrotBed.SD; }, get slots() { return carrotBed.slots; },   // dài dọc +x · hướng mặt bên (+z) · mọi khóm (đọc, không ghi)
          empty: () => carrotBed.empty(), dry: () => carrotBed.dry(),   // hố trống (chưa trồng / thỏ ăn) · đất khô (3 giờ chưa tưới, không mưa)
          plant: sl => carrotBed.plant(sl), harvest: sl => carrotBed.harvest(sl), water: () => carrotBed.water(),   // người chăm: trồng cây con · nhổ củ · tưới
          sample: () => [carrotBed.slots[0].root.clone(), carrotBed.slots[0].tuft.clone()],   // bản sao củ + lá (đồ cầm tay của người nhổ — không thuộc luống)
        });
        worldTick('late', 30, (dt, t) => carrotBed.update(dt, t));   // MỖI KHUNG (sổ tick core/world.js): luống cà rốt lớn dần, đất ướt sau tưới / mưa
