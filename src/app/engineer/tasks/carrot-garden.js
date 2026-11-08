        // ===== KỸ SƯ CHĂM LUỐNG CÀ RỐT — tự chủ đợt 2 (luống: camp/carrot-bed.js · thỏ ra luống ăn: animals/bunny/carrots.js) =====
        //  KỸ SƯ (pha 'garden'): luống có ≥ 2 hố trống, hoặc 3 giờ chưa tưới / chưa mưa, trong giờ rảnh ngoài trời ban ngày ⇒ ra luống: ngồi xổm cạnh
        //  từng hố, bay xới 3 nhát, đặt cây con, vỗ đất · lấy bình tưới ở đầu luống, tưới dọc 2 chỗ, cất bình. Thỏ đang ăn ở luống mà kỹ sư đang rảnh ngoài
        //  trời ⇒ ra cách 2,4 đv ngồi xổm xem (không lại gần), "Thỏ ăn cà rốt mình trồng kìa" · xem xong thì trồng lại hố thỏ vừa ăn.
        //  BẤM "Farming" ở bảng Tools (engForceAct 'garden'): trồng hố trống; luống không còn
        //  hố thì NHỔ ≤ 2 củ chín (nắm gốc lá giật lên, củ trồi khỏi đất, cầm củ bỏ túi) rồi trồng cây con thay; luôn tưới luống trước khi về ----
        // thỏ đang ở luống — nhìn mặt bầy thỏ (worldSee('bunnies')): con nào, đã tới luống (ngửi / nhổ / gặm) chưa
        const gardenBunny = () => worldSee('bunnies')?.atBed ?? null, gardenEating = () => !!worldSee('bunnies')?.bedEating();
        // ---- KỸ SƯ CHĂM LUỐNG: trồng lại hố trống · tưới · xem thỏ ăn ----
        function gardenWant(e, hh, sched) {   // engWantAct: 'garden' hoặc null
          if (gardenJob.busy()) return 'garden';
          if (engForceAct || !engHourOk('garden', hh) || liveWeather.state.raining || !GARDEN_SLOT.has(sched) || clock.elapsedTime < gardenJob.next) return null;
          const CB = worldSee('carrotBed');
          if (gardenEating() && Math.hypot(CB.pos.x - e.g.position.x, CB.pos.z - e.g.position.z) < 18) return 'garden';
          return CB.empty().length >= 2 || CB.dry() ? 'garden' : null;
        }
        const GARDEN_SLOT = new Set(['outdoor', 'rest', 'fish']);
        const gardenJob = (() => {
          const J = { st: 'idle', k: 0, list: [], cur: null, n: 0, stand: new THREE.Vector3(), can: 'home', trowel: false, pour: 0, watched: false, route: null, rq: new THREE.Vector3() }, next = { v: 0 };
          const CB = worldSee('carrotBed'), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
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
          const hcar = new THREE.Group(); hcar.add(...CB.sample()); for (const o of hcar.children) { o.position.set(0, 0, 0); o.scale.setScalar(1); } hcar.visible = false; scene.add(hcar);   // củ vừa nhổ trong tay phải
          for (const o of [can, trowel, drops, hcar]) o.traverse(m => { m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; });
          const CAN_HOME = new THREE.Vector3(CB.pos.x + CB.length / 2 + 0.3, CB.pos.y, CB.pos.z + 0.15), CAN_ST = CAN_HOME.clone().add(_a.set(0.5, 0, 0.2));
          const homeCan = () => { can.position.set(CAN_HOME.x, CAN_HOME.y + 0.31, CAN_HOME.z); can.rotation.set(0, -Math.PI / 2, 0); };
          homeCan(); PROPS.push({ x: CAN_HOME.x, z: CAN_HOME.z, r: 0.14 });
          const go = st => { J.st = st; J.k = 0; J.route = null; };
          function bedRoute(p, q) {   // đường thẳng p → q cắt luống (nới 0,3) ⇒ vòng qua đầu luống gần hơn: góc phía mình → góc phía đích → đích
            const hx = CB.length / 2 + 0.3, hz = CB.width / 2 + 0.3, ax = p.x - CB.pos.x, az = p.z - CB.pos.z, bx = q.x - CB.pos.x, bz = q.z - CB.pos.z;
            let hit = false; for (let i = 1; i < 16 && !hit; i++) { const u = i / 16, x = ax + (bx - ax) * u, z = az + (bz - az) * u; hit = Math.abs(x) < hx && Math.abs(z) < hz; }
            if (!hit) return [q.clone()];
            const ex = CB.pos.x + (ax + bx >= 0 ? 1 : -1) * (CB.length / 2 + 0.6), zs = v => CB.pos.z + (v >= 0 ? 1 : -1) * (CB.width / 2 + 0.5);
            return [new THREE.Vector3(ex, 0, zs(az)), new THREE.Vector3(ex, 0, zs(bz)), q.clone()];
          }
          const bedCross = (p, q, m) => {   // đoạn p → q cắt luống nới m?
            const hx = CB.length / 2 + m, hz = CB.width / 2 + m, ax = p.x - CB.pos.x, az = p.z - CB.pos.z, bx = q.x - CB.pos.x, bz = q.z - CB.pos.z;
            for (let i = 1; i < 16; i++) { const u = i / 16; if (Math.abs(ax + (bx - ax) * u) < hx && Math.abs(az + (bz - az) * u) < hz) return true; } return false;
          };
          function goTo(e, q, dt, t) {   // đi tới q (vòng qua đầu luống nếu cần); true = tới nơi
            const p = e.g.position;
            if (!J.route || J.rq.distanceToSquared(q) > 1e-6 || bedCross(p, J.route[0], 0.12)) { J.rq.copy(q); J.route = bedRoute(p, q); }   // đường cũ lập từ chỗ khác (vd còn trong xe) cắt luống ⇒ lập lại
            while (J.route.length > 1 && !bedCross(p, J.route[1], 0.2)) J.route.shift();   // thẳng tới mốc sau được rồi thì bỏ góc này
            const w = J.route[0]; if (J.route.length > 1 && Math.hypot(w.x - p.x, w.z - p.z) < 0.45) { J.route.shift(); return false; }
            const far = J.route.length === 1 && Math.hypot(CB.pos.x - e.g.position.x, CB.pos.z - e.g.position.z) > 3.5 && !rxDry(e.g.position);   // xa luống, ngoài bạt: theo bảng dẫn đường (dưới bạt ô lưới bị vật cản xe chặn — bảng chỉ sai hướng)
            if (engStep(e, w, dt, t, pf, FIRE_AVOID_R, far ? CB.field() : null)) { if (J.route.length > 1) { J.route.shift(); return false; } J.route = null; return true; }
            return false;
          }
          const standFor = (sl, out) => out.set(CB.pos.x + sl.x, CB.pos.y, CB.pos.z + (sl.row ? 1 : -1) * (CB.width / 2 + 0.36));   // đứng mép luống phía hàng của khóm, ngay ngang khóm
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
              go(gardenEating() ? 'toWatch' : J.list.length ? 'toSlot' : 'toCan');
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
                engStandStill(e); const sl = J.cur, sp = CB.slotPos(sl, _a), sq = sm(k / 0.6) * (1 - sm((k - 4.2) / 0.6)); crouch(e, sq, sp);
                J.trowel = k > 0.4 && k < 2.6; const ax = engAxesW(e);
                if (k < 2.6) { const dig = Math.max(0, Math.sin(Math.max(0, k - 0.6) * Math.PI * 1.5)); engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.05 + 0.12 * (1 - dig)).addScaledVector(ax.r, 0.04), aimQ(_q, _c.copy(ax.f).addScaledVector(UP, -1.2).normalize(), ax.f)); }
                else if (k < 3.4) { engHandSet(e, 1, _b.copy(sp).addScaledVector(UP, 0.06 + 0.1 * (1 - sm((k - 2.6) / 0.4))), aimQ(_q2, _c.set(0, -1, 0), ax.f)); if (k > 3.0 && sl.st !== 'grow') CB.plant(sl); }
                else if (k < 4.2) { const pat = Math.abs(Math.sin((k - 3.4) * Math.PI * 2.5)); engHandSet(e, 0, _b.copy(sp).addScaledVector(ax.r, 0.07).addScaledVector(UP, 0.04 + 0.08 * pat), aimQ(_q, _c.set(0, -1, 0), ax.f)); engHandSet(e, 1, _b.copy(sp).addScaledVector(ax.r, -0.07).addScaledVector(UP, 0.04 + 0.08 * (1 - pat)), aimQ(_q2, _c.set(0, -1, 0), ax.f)); }
                if (k > 4.8) { J.n++; envNeed(2, 2); go(J.n < J.list.length ? 'toSlot' : 'toCan'); }
                break;
              }
              case 'pull': {   // nhổ củ chín: nắm gốc lá, giật lên (củ trồi khỏi đất) · cầm củ đưa về túi bên hông · hố trống ⇒ trồng cây con (vào 'plant' khi đã ngồi xổm sẵn)
                engStandStill(e); const sl = J.cur, sp = CB.slotPos(sl, _a), ax = engAxesW(e), u = sm((k - 0.6) / 0.9); crouch(e, sm(k / 0.6), sp);
                if (k < 1.6) { CB.tug(sl, 0.02 + 0.15 * u * u, Math.sin(t * 20) * 0.1 * (1 - u)); engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.12 + 0.17 * u), aimQ(_q, _c.set(0, -1, 0), ax.f)); }
                else { if (sl.st === 'grow') { CB.harvest(sl); J.hc = true; } engHandSet(e, 0, _b.copy(sp).addScaledVector(UP, 0.29).lerp(engBodyW(e, -0.2, 1.05, 0.12, _c), sm((k - 1.6) / 0.6)), aimQ(_q, _c.set(0, -1, 0), ax.f)); }
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
                const x = J.n ? 0.45 : -0.45; if (goTo(e, _b.set(CB.pos.x + x * CB.length / 2 * 1.1, CB.pos.y, CB.pos.z + CB.width / 2 + 0.42), dt, t)) go('pour'); else if (k > 40) go('toCanBack');
                break;
              }
              case 'pour': {   // nghiêng bình: hoa sen chúc xuống luống, nước rơi 3,4 s
                engStandStill(e); const yt = Math.atan2(-CB.side.x, -CB.side.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 4);
                J.pour = sm(k / 0.6) * (1 - sm((k - 3.6) / 0.5)); e.lean = 0.08 * J.pour; rxLook('job', 3.5, 0.3, _b.set(e.g.position.x, CB.pos.y + CB.rimH, CB.pos.z));
                const ax = engAxesW(e); engHandSet(e, 0, engBodyW(e, -0.16, 1.5 + 0.06 * J.pour, 0.42, _b), aimQ(_q, ax.r, _c.copy(ax.f).negate()));
                if (k > 4.2) { CB.water(); J.pour = 0; J.n++; go(J.n < 2 ? 'toPour' : 'toCanBack'); }
                break;
              }
              case 'toCanBack': if (goTo(e, CAN_ST, dt, t)) go('putCan'); else if (k > 40) { J.can = 'home'; homeCan(); return finish(); } break;
              case 'toWatch': {   // thỏ đang ăn ở luống: ra chỗ cách 2,4 đv, ngồi xổm xem
                if (!gardenEating() && k > 1) { go(J.list.length ? 'toSlot' : CB.dry() || engForceAct === 'garden' ? 'toCan' : 'done'); break; }
                const b = gardenBunny(); if (!b) { go('done'); break; }
                const dx = e.g.position.x - b.x, dz = e.g.position.z - b.z, d = Math.hypot(dx, dz) || 1;
                if (d < 2.6 || engStep(e, _b.set(b.x + dx / d * 2.4, 0, b.z + dz / d * 2.4), dt, t, pf, FIRE_AVOID_R, CB.field())) { go('watch'); rxSay('bunnyBed', ['Thỏ ăn cà rốt mình trồng kìa.', 'Củ cà rốt to nhất bị thỏ chọn rồi.'], 'Luống cà rốt', false); }
                else if (k > 40) go('done');
                break;
              }
              case 'watch': {
                engStandStill(e); const b = gardenBunny(); if (!b && J.k0 === undefined) J.k0 = k;
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
              for (let i = 0; i < 18; i++) { dropT[i] = (dropT[i] + dt * 2.4) % 1; const u = dropT[i], gy = CB.pos.y + CB.soilY + 0.01;
                _b.set(src.x + Math.sin(i * 2.3) * 0.04 + Math.sin(e.g.rotation.y) * 0.18 * u, src.y - (src.y - gy) * u * u, src.z + Math.cos(i * 1.7) * 0.04 + Math.cos(e.g.rotation.y) * 0.18 * u);
                _m.makeTranslation(_b.x, _b.y, _b.z); drops.setMatrixAt(i, _m); }
              drops.instanceMatrix.needsUpdate = true;
            }
          }
          function idle() { if (J.st === 'idle') return; if (J.st === 'pull' && J.cur.st === 'grow') CB.tug(J.cur, 0); J.st = 'idle'; J.trowel = false; J.pour = 0; J.hc = false; trowel.visible = hcar.visible = false; drops.count = 0; if (J.can === 'hand') { J.can = 'home'; homeCan(); } next.v = clock.elapsedTime + 300; }
          return { update, tick, idle, crouch, busy: () => J.st !== 'idle', get next() { return next.v; }, goal: () => CB.pos, state: J };
        })();
