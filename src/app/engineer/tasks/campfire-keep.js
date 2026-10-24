        // ===== GIỮ LỬA TRẠI THEO NHIỆT ĐỘ (G 24/10 "trời nóng quá trên 30 độ thì engineer ra tắt lửa trại, kể cả buổi đêm, chỉ mở lại nếu dưới 28, hoặc
        //      bắt lửa (nhỏ) để nướng cá") — trạng thái bếp: campFire (camp/chairs-lantern-fire.js) =====
        //  Ngưỡng có độ trễ: > 30 °C dập · < 28 °C nhóm lại · 28–30 °C giữ nguyên (nhiệt độ dao động quanh 1 ngưỡng thì khỏi bật tắt liên tục).
        //  Cá đang nướng mà bếp đã dập ⇒ nhóm lửa NHỎ (campFire.small: tối đa 30%) đủ than cho cá chín (cá chỉ chín khi còn than — meal-read.js);
        //  cá chín mà vẫn > 30 °C ⇒ dập tiếp. Buổi tối (lửa lớn nhất) cũng dập nếu > 30 °C, kể cả lúc chuẩn bị ngủ; đang ngủ thì để sáng dậy làm.
        //  Dập theo hướng dẫn an toàn lửa trại của Smokey Bear "dội – đảo – dội lại – sờ" (drown, stir, drown, feel): xô nước + que cời để sẵn cạnh bếp ⇒ xách ra mép
        //  bếp, dội nửa xô (hơi nước bốc, than xèo đen lại), ngồi xổm lấy que cời đảo tro cho nước ngấm hết, dội nốt, cúi sát chọc thử tro (bản gốc: hơ bàn tay trần
        //  trên tro ướt — 2 tay đang cầm xô + que nên chọc bằng que) → cất xô, que về chỗ.
        //  Nhóm lửa: đống củi lấy 3 que mồi → ngồi xổm sát vòng đá (bếp đã nguội mới vào gần được) → xếp que mồi giữa lòng bếp → quẹt diêm → châm → cúi thổi
        //  nhẹ → lửa bắt (nhỏ trước, lớn dần theo lịch giờ). Mưa: không làm (mưa tự dập; củi ướt không nhóm được, đất ráo bớt mới nhóm) ----
        // đang dở việc (trong xe, đang ăn, đang cầm dụng cụ việc khác): làm xong mới ra — ban ngày lửa chỉ còn 5% than, chờ vài phút không sao
        const FIRE_WAIT = new Set(['sleep', 'shower', 'toilet', 'cook', 'breakfast', 'lunch', 'snack', 'dinner', 'eatApple', 'drone', 'engine', 'trim', 'garden', 'apples', 'wood']);
        function fireNeed() {   // 'douse' · 'light' · 'small' · null
          const T = liveWeather.state.temperature ?? 24, cooking = grill.st === 'cooking';
          if (!campFire.out && campRain.heat > 0.15 && T > 30 && !cooking) return 'douse';
          if (campFire.out && sceneWet < 0.6 && (T < 28 || cooking)) return T < 28 ? 'light' : 'small';
          if (campFire.small && T < 28) campFire.small = false;   // mát lại: lửa nhỏ nướng cá thành lửa thường
          return null;
        }
        function fireWant(e, hh, sched) {   // engWantAct (engineer/mind/schedule.js): 'fire' hoặc null
          if (fireJob.busy()) return 'fire';
          if (engForceAct || liveWeather.state.raining || !engAwake(hh) || FIRE_WAIT.has(sched) || FIRE_WAIT.has(e.act)) return null;
          return fireNeed() ? 'fire' : null;
        }
        const fireJob = (() => {
          const J = { st: 'idle', k: 0, mode: null, held: { b: false, p: false, s: false, m: false }, pour: 0, water: 1 };
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0), DN = new THREE.Vector3(0, -1, 0);
          const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const tag = o => o.traverse(m => { m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; });
          // ---- xô tôn (gốc toạ độ = đỉnh quai, chỗ nắm) · nước trong xô · que cời (gốc = chỗ cầm, thân theo +z) · 3 que mồi · que diêm ----
          const bucket = new THREE.Group(); bucket.name = 'Xô nước dập lửa'; scene.add(bucket);
          const tin = new THREE.MeshLambertMaterial({ color: 0xa3abb0, side: THREE.DoubleSide, flatShading: true });
          const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.105, 0.26, 16, 1, true), tin); wall.position.y = -0.26; bucket.add(wall);
          const floor = new THREE.Mesh(new THREE.CircleGeometry(0.105, 16), tin); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.389; bucket.add(floor);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.006, 4, 20), tin); rim.rotation.x = Math.PI / 2; rim.position.y = -0.13; bucket.add(rim);
          const bail = new THREE.Group(); bail.position.y = -0.13; bucket.add(bail);   // quai: nằm rạp khi xô để đất, dựng khi xách
          const bailM = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.004, 4, 16, Math.PI), new THREE.MeshLambertMaterial({ color: 0x5d6266 })); bail.add(bailM);
          const water = new THREE.Mesh(new THREE.CircleGeometry(0.124, 16), new THREE.MeshLambertMaterial({ color: 0x5f8fa6, transparent: true, opacity: 0.85 })); water.rotation.x = -Math.PI / 2; water.position.y = -0.17; bucket.add(water);
          const poker = new THREE.Group(); poker.name = 'Que cời'; scene.add(poker);
          const pk = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.014, 1.2, 6), new THREE.MeshLambertMaterial({ color: 0x6e4f33 })); pk.rotation.x = Math.PI / 2; pk.position.z = 0.52; poker.add(pk);   // dài 1,2 m: ngồi ngoài vòng né lửa vẫn với tới lòng bếp
          const pkTip = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.14, 6), new THREE.MeshLambertMaterial({ color: 0x1f1b18 })); pkTip.rotation.x = Math.PI / 2; pkTip.position.z = 1.16; poker.add(pkTip);   // đầu cháy đen
          const sticks = new THREE.Group(); sticks.name = 'Que mồi'; sticks.visible = false; scene.add(sticks);
          for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.3, 5), new THREE.MeshLambertMaterial({ color: 0x8a6a46 })); s.rotation.set(Math.PI / 2, 0, (i - 1) * 0.35); s.position.set((i - 1) * 0.02, 0.012 * i, 0); sticks.add(s); }
          const match = new THREE.Group(); match.name = 'Que diêm'; match.visible = false; scene.add(match);
          match.add(new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 4).translate(0, 0.025, 0), new THREE.MeshLambertMaterial({ color: 0xd9c08a })));
          const flame = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.026, 6).translate(0, 0.063, 0), new THREE.MeshBasicMaterial({ color: 0xffb347 })); match.add(flame);
          const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 5, 4), new THREE.MeshBasicMaterial({ color: 0xa9d4e8, transparent: true, opacity: 0.8 }), 30);
          drops.frustumCulled = false; drops.count = 0; scene.add(drops); const dT = new Float32Array(30).map(() => Math.random()), dO = Array.from({ length: 30 }, () => [(Math.random() - 0.5) * 0.4 * CAMP_PIT, (Math.random() - 0.5) * 0.4 * CAMP_PIT]);
          for (const o of [bucket, poker, sticks, match, drops]) tag(o);
          // ---- chỗ để xô + que cời: vòng FIRE_AVOID_R + 0,45 … + 0,7 quanh bếp (bếp nhỏ 50%: ~1,2–1,4 m), trống, gần phía đống củi ----
          const pile = scene.getObjectByName('Đống củi (Woodpile)'), PP = pile ? pile.position : pf, KIT = new THREE.Vector3(), aPile = Math.atan2(PP.z - pf.z, PP.x - pf.x);
          { let best = 1e9; for (const r of [FIRE_AVOID_R + 0.45, FIRE_AVOID_R + 0.7]) for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, x = pf.x + Math.cos(a) * r, z = pf.z + Math.sin(a) * r;   // bếp nhỏ 30% (G 24/10): xô gần lại theo vòng né
              if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || obstacleCoords.some(o => Math.hypot(o.x - x, o.z - z) < (o.r > 1.5 ? o.r + 0.2 : o.r + 0.4)) || ENG_PROPS.some(o => Math.hypot(o.x - x, o.z - z) < o.r + 0.35)) continue;
              const d = Math.abs(Math.atan2(Math.sin(a - aPile - 0.6), Math.cos(a - aPile - 0.6))); if (d < best) { best = d; KIT.set(x, cowY(x, z), z); } } }
          const out = _a.subVectors(KIT, pf).setY(0).normalize().clone(), side = new THREE.Vector3(-out.z, 0, out.x);
          // chỗ đứng dội nước / nhóm lửa: lệch khỏi hướng xô ~29° (cùng hướng thì chỉ cách xô 0,34 m — vòng đẩy quanh xô đẩy kỹ sư qua lại, kẹt 60 s)
          const PIT_R = 0.75 * CAMP_SCALE * CAMP_PIT;   // mép ngoài vòng đá (~0,24 m — bếp nhỏ 50%)
          const LIGHT_D = FIRE_AVOID_R + 0.05;   // chỗ ngồi nhóm lửa: ngoài 4 chân giá treo (bếp nhỏ 50%: sát vòng đá thì cúi thổi đầu chúi qua ấm reo) — tay vươn vào lòng bếp
          const rot = a => new THREE.Vector3(out.x * Math.cos(a) - out.z * Math.sin(a), 0, out.x * Math.sin(a) + out.z * Math.cos(a));
          // bếp nhỏ 50% (G 24/10 tối): vòng né chỉ 0,72 m < 1,5 ⇒ bỏ chính vòng bếp khỏi phép thử vật cản · chỗ nhóm lửa (sát vòng đá) né 4 chân giá treo ≥ 0,32 m
          let pd = rot(0.5); for (const a of [0.5, -0.5, 0.8, -0.8, 1.1, -1.1]) { const d = rot(a), p = _b.copy(pf).addScaledVector(d, FIRE_AVOID_R + 0.12), q = _c.copy(pf).addScaledVector(d, LIGHT_D);
            if (Math.hypot(p.x - KIT.x, p.z - KIT.z) > 0.75 && !obstacleCoords.some(o => o.r < 1.5 && Math.hypot(o.x - pf.x, o.z - pf.z) > 0.01 && Math.hypot(o.x - p.x, o.z - p.z) < o.r + 0.4) && !ENG_PROPS.some(o => Math.hypot(o.x - p.x, o.z - p.z) < o.r + 0.35)
              && HANGER_FEET.every(f => Math.hypot(f.x - q.x, f.z - q.z) > 0.32 && Math.hypot(f.x - p.x, f.z - p.z) > 0.32)) { pd = d; break; } }
          const KIT_ST = KIT.clone().addScaledVector(out, 0.5), POUR_ST = pf.clone().addScaledVector(pd, FIRE_AVOID_R + 0.12), LIGHT_ST = pf.clone().addScaledVector(pd, LIGHT_D);
          const PK_HOME = KIT.clone().addScaledVector(side, 0.28);
          let PICK_ST = PP.clone(); { let bd = 1e9; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, x = PP.x + Math.cos(a) * 1.2, z = PP.z + Math.sin(a) * 1.2, d = Math.hypot(x - LIGHT_ST.x, z - LIGHT_ST.z);
            if (d < bd && Math.hypot(x - pf.x, z - pf.z) > FIRE_AVOID_R + 0.15 && obstacleCoords.every(o => Math.hypot(o.x - x, o.z - z) > o.r + 0.35)) { bd = d; PICK_ST.set(x, PP.y, z); } } }
          const pileTop = pile ? new THREE.Box3().setFromObject(pile).max.y : pf.y + 0.4;
          ENG_PROPS.push({ x: KIT.x, z: KIT.z, r: 0.18 });
          function home() {   // xô đầy nước, quai nằm rạp · que cời nằm cạnh, đầu cháy chĩa ra ngoài
            bucket.position.set(KIT.x, KIT.y + 0.39, KIT.z); bucket.rotation.set(0, Math.atan2(out.x, out.z), 0); bail.rotation.set(1.35, 0, 0); water.visible = true; water.scale.setScalar(1); J.water = 1;
            poker.position.set(PK_HOME.x, PK_HOME.y + 0.015, PK_HOME.z); poker.rotation.set(0, Math.atan2(out.x, out.z), 0); poker.rotateX(-0.02);
          }
          home();
          const go = st => { J.st = st; J.k = 0; };
          function finish() { J.st = 'idle'; J.mode = null; J.held.b = J.held.p = J.held.s = J.held.m = false; J.pour = 0; drops.count = 0; match.visible = false; home(); return true; }
          const face = (e, p, dt) => { const yt = Math.atan2(p.x - e.g.position.x, p.z - e.g.position.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 4); };
          // xô theo khung: tâm xô ở c, nghiêng về trước tilt (rad) quanh trục ngang người
          const bucketAt = (e, c, tilt) => { bucket.rotation.set(0, e.g.rotation.y, 0); bucket.rotateX(tilt); bucket.updateMatrix(); bucket.position.copy(c).sub(_c.set(0, -0.26, 0).applyQuaternion(bucket.quaternion)); bail.rotation.set(0, 0, 0); };
          function pourPose(e, u) {   // 2 tay: phải nắm quai, trái đỡ đáy; xô nâng ra trước rồi lật về phía bếp
            const c = engBodyW(e, -0.04, 1.08 + 0.16 * u, 0.36 + 0.2 * u, _b); bucketAt(e, c, 1.95 * u);
            bucket.updateMatrixWorld(true); const ax = engAxesW(e);
            engHandSet(e, 0, bucket.localToWorld(_a.set(0, 0, 0)), aimQ(_q, ax.f, UP)); engHandSet(e, 1, bucket.localToWorld(_a.set(0, -0.38, -0.04)), aimQ(_q2, ax.f, UP));
          }
          function update(e, dt, t) {   // pha 'fire' · true = xong
            J.k += dt; const k = J.k;
            if (J.st === 'idle') { J.mode = fireNeed(); if (!J.mode) return finish();
              rxSay(J.mode === 'douse' ? 'fireOut' : 'fireOn', J.mode === 'douse' ? ['Hơn 30 độ rồi, dập lửa trại cho mát.', 'Nóng quá, tắt bếp thôi.'] : J.mode === 'small' ? ['Nhóm lửa nhỏ cho cá chín.', 'Cần ít than nướng cá.'] : ['Mát rồi, nhóm lại lửa trại.', 'Dưới 28 độ, đốt lại bếp.'], 'Lửa trại', false);
              go(J.mode === 'douse' ? 'toKit' : 'toPile'); }
            e.armsBusy = J.held.b || J.held.p || J.held.s || J.held.m || /grab|put|pick|lay|strike|light|blow|pour|stir|check/.test(J.st);
            switch (J.st) {
              // ---- DẬP: dội – đảo – dội – kiểm ----
              case 'toKit': if (engStep(e, KIT_ST, dt, t, pf, FIRE_AVOID_R)) go('grab'); else if (k > 60) return finish(); break;
              case 'grab': case 'put': {   // ngồi xổm: tay phải nắm quai xô, tay trái cầm que cời
                engStandStill(e); const sq = sm(k / 0.5) * (1 - sm((k - 0.9) / 0.5)); gardenJob.crouch(e, sq * 0.8, KIT);
                if (!J.held.b || J.st === 'put') { const ax = engAxesW(e); engHandSet(e, 0, _b.set(KIT.x, KIT.y + 0.36 + 0.08 * (1 - sq), KIT.z), aimQ(_q, ax.f, UP)); engHandSet(e, 1, _c.set(PK_HOME.x, PK_HOME.y + 0.06 + 0.08 * (1 - sq), PK_HOME.z), aimQ(_q2, ax.f, UP)); }
                if (k > 0.7) { if (J.st === 'grab') { J.held.b = J.held.p = true; } else if (J.held.b) { J.held.b = J.held.p = false; home(); } }
                if (k > 1.4) { if (J.st === 'grab') go('toFire'); else return finish(); }
                break;
              }
              case 'toFire': if (engStep(e, POUR_ST, dt, t, pf, FIRE_AVOID_R) || k > 15 && Math.hypot(e.g.position.x - pf.x, e.g.position.z - pf.z) < 2.6) go('pour'); else if (k > 40) go('toKitBack'); break;   // vướng mà đã sát bếp: dội tại chỗ
              case 'pour': case 'pour2': {   // dội nước: lửa tắt trong ~2 s, hơi nước bốc (campFire.douse) · lần 1 dội nửa xô, lần 2 dội nốt
                engStandStill(e); face(e, pf, dt); const L = J.st === 'pour' ? 1.8 : 1.6; J.pour = sm(k / 0.55) * (1 - sm((k - L + 0.45) / 0.45)); pourPose(e, J.pour);
                e.lean = 0.1 * J.pour; rxLook('job', 3.5, 0.3, pf);
                if (J.pour > 0.6) { campFire.douse = 1; campFire.out = true; campFire.small = false; J.water = Math.max(J.st === 'pour' ? 0.5 : 0, J.water - dt * 0.45); }
                if (k > L) { J.pour = 0; go(J.st === 'pour' ? 'stir' : 'check'); }
                break;
              }
              case 'stir': {   // ngồi xổm, que cời đảo tro thành vòng nhỏ cho nước ngấm hết (xô hạ xuống cạnh chân phải)
                engStandStill(e); face(e, pf, dt); const sq = sm(k / 0.5) * (1 - sm((k - 2.6) / 0.5)); gardenJob.crouch(e, sq * 0.85, pf);
                const ax = engAxesW(e); engHandSet(e, 1, engBodyW(e, 0.1 + 0.04 * Math.cos(k * 7), 1.0 + 0.03 * Math.sin(k * 7), 0.48, _b), aimQ(_q, ax.f, UP));
                engHandSet(e, 0, engBodyW(e, -0.3, 0.72, 0.18, _c), aimQ(_q2, ax.f, UP));
                campFire.douse = Math.max(campFire.douse, 0.35);
                if (k > 3.1) go('pour2');
                break;
              }
              case 'check': {   // cúi sát, chọc thử tro vài cái: nguội hẳn mới đi
                engStandStill(e); face(e, pf, dt); const sq = sm(k / 0.5) * (1 - sm((k - 1.6) / 0.5)); gardenJob.crouch(e, sq * 0.9, pf); e.lean = Math.max(e.lean, 0.36 * sq);
                const ax = engAxesW(e); engHandSet(e, 1, engBodyW(e, 0.12, 0.95 + 0.06 * Math.max(0, Math.sin(k * 9)), 0.5, _b), aimQ(_q, ax.f, UP));
                if (k > 1.2 && J.k0 === undefined) { J.k0 = k; rxSay('fireCold', ['Tro nguội hẳn rồi.', 'Tắt hẳn rồi, yên tâm.'], 'Lửa trại', false); }
                if (k > 2.1) { J.k0 = undefined; go('toKitBack'); }
                break;
              }
              case 'toKitBack': if (engStep(e, KIT_ST, dt, t, pf, FIRE_AVOID_R)) go('put'); else if (k > 60) return finish(); break;
              // ---- NHÓM: que mồi · diêm · thổi ----
              case 'toPile': if (engStep(e, PICK_ST, dt, t, pf, FIRE_AVOID_R)) go('pick'); else if (k > 60) return finish(); break;
              case 'pick': {   // cúi lấy 3 que mồi trên mặt đống củi
                engStandStill(e); const u = sm(k / 0.8) * (1 - sm((k - 1.0) / 0.7)), tp = _a.copy(PICK_ST).lerp(PP, 0.6); tp.y = pileTop - 0.04;
                gardenJob.crouch(e, 0.3 * u, tp); const ax = engAxesW(e); engHandSet(e, 1, engBodyW(e, 0.15, 1.15, 0.3, _b).lerp(tp, u), aimQ(_q, ax.f, UP));
                if (k > 0.9) J.held.s = true; if (k > 1.8) go('toLight');
                break;
              }
              case 'toLight': if (engStep(e, LIGHT_ST, dt, t, pf, PIT_R + 0.1) || k > 15 && Math.hypot(e.g.position.x - pf.x, e.g.position.z - pf.z) < 1.6) go('lay'); else if (k > 40) return finish(); break;   // bếp đã nguội: vào sát vòng đá
              case 'lay': case 'strike': case 'light': case 'blow': {
                engStandStill(e); face(e, pf, dt); gardenJob.crouch(e, 0.9 * (J.st === 'lay' ? sm(k / 0.5) : J.st === 'blow' ? 1 - sm((k - 2.1) / 0.5) : 1), pf); const ax = engAxesW(e), mid = _c.copy(LIGHT_ST).lerp(pf, 0.78); mid.y = pf.y + 0.1;   // thổi xong thì đứng dậy dần
                if (J.st === 'lay') {   // tay trái đặt bó que mồi vào lòng bếp
                  const u = sm((k - 0.3) / 0.8); engHandSet(e, 1, engBodyW(e, 0.12, 1.0, 0.35, _b).lerp(mid, u), aimQ(_q, ax.f, UP));
                  if (k > 1.1 && J.held.s) { J.held.s = false; sticks.position.copy(mid); sticks.rotation.set(0, e.g.rotation.y + 0.5, 0); sticks.visible = true; }
                  if (k > 1.6) go('strike');
                } else if (J.st === 'strike') {   // quẹt diêm trước ngực
                  engHandSet(e, 0, engBodyW(e, -0.08 + 0.1 * sm(k / 0.3), 1.12, 0.32, _b), aimQ(_q, ax.f, UP)); if (k > 0.35) J.held.m = true;
                  if (k > 0.9) go('light');
                } else if (J.st === 'light') {   // châm diêm vào que mồi
                  const u = sm(k / 0.8); engHandSet(e, 0, engBodyW(e, 0.02, 1.1, 0.32, _b).lerp(mid, u), aimQ(_q, ax.f, UP));
                  if (k > 1.0) { campFire.out = false; campFire.small = J.mode === 'small'; campRain.heat = Math.max(campRain.heat, 0.62); campRain.smolder = Math.max(campRain.smolder, 0.8); J.held.m = false; go('blow'); }
                } else {   // cúi thổi nhẹ cho lửa bắt
                  e.lean = 0.42 * sm(k / 0.4) * (1 - sm((k - 2.2) / 0.4)); rxLook('job', 3.5, 0.3, mid);
                  if (k > 2.6) { rxSay('fireLit', J.mode === 'small' ? ['Lửa nhỏ vừa đủ nướng cá.', 'Bắt lửa rồi, để than đỏ là được.'] : ['Bắt lửa rồi.', 'Lửa lên rồi, ấm hẳn.'], 'Lửa trại', false); return finish(); }
                }
                break;
              }
            }
            return false;
          }
          function tick(e, dt, t) {   // sau IK tay: xô · que cời · que mồi · diêm theo bàn tay; tia nước; que mồi cháy hết thì ẩn
            if (sticks.visible && !J.held.s && (campRain.heat > 0.8 || campFire.out)) sticks.visible = false;
            if (J.held.s) { sticks.visible = true; e.wrists[1].updateWorldMatrix(true, false); sticks.position.copy(e.wrists[1].localToWorld(_a.set(0, 0, 0.05))); sticks.rotation.set(0, e.g.rotation.y, 0); }
            match.visible = J.held.m; if (J.held.m) { e.wrists[0].updateWorldMatrix(true, false); match.position.copy(e.wrists[0].localToWorld(_a.set(0, 0.02, 0.06))); match.rotation.set(0.3, e.g.rotation.y, 0); flame.scale.set(1, 0.8 + 0.3 * Math.sin(t * 31), 1); }
            const pouring = J.st === 'pour' || J.st === 'pour2';
            if (J.held.b && !pouring) {   // xách: xô treo dưới bàn tay phải, quai dựng · đang đảo tro: xô hạ cạnh chân
              e.wrists[0].updateWorldMatrix(true, false); bucket.position.copy(e.wrists[0].localToWorld(_a.set(0, 0, 0.03))); bucket.rotation.set(0, e.g.rotation.y, 0); bail.rotation.set(0, 0, 0);
            }
            if (J.held.p) {   // que cời: từ bàn tay trái chĩa xuống trước · đảo / chọc tro: đầu que vào lòng bếp
              e.wrists[1].updateWorldMatrix(true, false); poker.position.copy(e.wrists[1].localToWorld(_a.set(0, 0, 0.04)));
              const tip = J.st === 'stir' || J.st === 'check' ? _b.set(pf.x + 0.23 * CAMP_PIT * Math.cos(J.k * 7), pf.y + 0.115 * CAMP_PIT, pf.z + 0.23 * CAMP_PIT * Math.sin(J.k * 7)) : _b.copy(poker.position).addScaledVector(engAxesW(e).f, 0.5).add(_c.set(0, -0.9, 0));
              poker.lookAt(tip);
            }
            water.visible = J.water > 0.02 && J.pour < 0.3; water.position.y = -0.17 - 0.2 * (1 - J.water); water.scale.setScalar(1 - 0.18 * (1 - J.water));   // đang lật xô: mặt nước nghiêng theo xô trông sai ⇒ ẩn
            const on = pouring && J.pour > 0.6; drops.count = on ? 30 : 0;
            if (on) {   // tia nước: từ miệng xô theo đường cong xuống lòng bếp
              bucket.updateMatrixWorld(true); const lip = bucket.localToWorld(_a.set(0, -0.13, 0.13));
              for (let i = 0; i < 30; i++) { dT[i] = (dT[i] + dt * 2.2) % 1; const u = dT[i], ex = pf.x + dO[i][0], ez = pf.z + dO[i][1], ey = pf.y + 0.12;
                _b.set(lip.x + (ex - lip.x) * u, lip.y + (ey - lip.y) * u + 0.3 * 4 * u * (1 - u), lip.z + (ez - lip.z) * u); _m.makeTranslation(_b.x, _b.y, _b.z); drops.setMatrixAt(i, _m); }
              drops.instanceMatrix.needsUpdate = true;
            }
          }
          function idle() { if (J.st === 'idle') return; finish(); }   // bị cắt ngang (mưa, giờ ngủ…): xô, que về chỗ
          return { update, tick, idle, busy: () => J.st !== 'idle', state: J, kit: KIT };
        })();
