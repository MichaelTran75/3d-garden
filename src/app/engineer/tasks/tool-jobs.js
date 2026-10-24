        // ===== VIỆC THEO LỆNH: bảng Tools (ui/tools-panel.js) hoặc bấm vật trong cảnh (G 20/10 khuya) =====
        //  BỎ CỦI VÀO LÒ (pha 'wood' — "khi click vào chiminea thì bỏ thêm củi"): ra đống củi (cách lò 1 m, đứng phía lò) → với tay lên mặt đống ôm 2 khúc
        //  → mang tới trước cửa lò (cửa quay về ghế cắm trại) → ngồi xổm, 2 tay đẩy củi vào cửa → chiminea.addWood() (camp/chiminea.js: lửa bùng ~8 s, cháy
        //  ~10 phút cả khi không mưa, khúc củi mới cháy nhỏ dần) → đứng dậy, về lịch.
        //  GHẾ CẮM TRẠI (việc 'chair' → pha 'read' — "khi click thì ra ngồi đọc sách uống trà"): ngồi ghế (engChairPhase), đọc sách ~45 s (engRead) ⇄ úp sách
        //  mở lên đùi, nhấp trà 2 ngụm (1 vòng engTea ~21 s, cốc ở vòng tay vịn) — 10 phút rồi về lịch ----
        const woodJob = (() => {
          chiminea.g.updateMatrixWorld(true); const J = { st: 'idle', k: 0, held: false }, pile = scene.getObjectByName('Đống củi (Woodpile)'), P = pile.position, top = new THREE.Box3().setFromObject(pile).max.y;
          const door = chiminea.door(new THREE.Vector3()), F = new THREE.Vector3(Math.sin(chiminea.g.rotation.y), 0, Math.cos(chiminea.g.rotation.y));
          const feedSt = door.clone().addScaledVector(F, 0.55); let pickSt = P.clone(), bd = 1e9;   // chỗ đứng lấy củi: vòng 1,2 quanh đống, trống (cách vật cản ≥ r + 0,35, ngoài vòng né bếp lửa), gần cửa lò nhất
          for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, x = P.x + Math.cos(a) * 1.2, z = P.z + Math.sin(a) * 1.2, d = Math.hypot(x - feedSt.x, z - feedSt.z);
            if (d < bd && Math.hypot(x - pf.x, z - pf.z) > FIRE_AVOID_R + 0.15 && obstacleCoords.every(o => Math.hypot(o.x - x, o.z - z) > o.r + 0.35)) { bd = d; pickSt.set(x, P.y, z); } }
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
          const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const logs = new THREE.Group(); logs.name = 'Củi ôm'; logs.visible = false; scene.add(logs);   // 2 khúc dọc trục x (ngang người)
          for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.36, 8), new THREE.MeshLambertMaterial({ color: 0x6b4a2e })); m.rotation.z = Math.PI / 2; m.position.set(s * 0.025, (s > 0 ? 0.075 : 0), s * 0.03); m.castShadow = true; logs.add(m); }
          logs.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; });
          const go = st => { J.st = st; J.k = 0; }, done = () => { go('idle'); J.held = false; logs.visible = false; return true; };
          function hands(e, u, at) {   // 2 tay: ôm củi trước bụng (u 0) ⇄ tới điểm at (u 1)
            if (!J.held && u < 0.01) return; e.armsBusy = true; const ax = engAxesW(e);
            for (const i of [0, 1]) { const s = i ? 1 : -1, p = engBodyW(e, 0.15 * s, 1.2, 0.3, _b); if (at && u > 0) p.lerp(_c.copy(at).addScaledVector(ax.r, -0.08 * s), u); engHandSet(e, i, p, aimQ(_q, ax.f, UP)); }
          }
          function update(e, dt, t) {   // pha 'wood' · true = xong
            J.k += dt; const k = J.k;
            if (J.st === 'idle') go('toPile');
            switch (J.st) {
              case 'toPile': if (engStep(e, pickSt, dt, t, pf, FIRE_AVOID_R)) go('pick'); else if (k > 60) return done(); break;
              case 'pick': {   // cúi người với lên mặt đống củi, ôm 2 khúc về trước bụng
                engStandStill(e); const u = sm(k / 0.8) * (1 - sm((k - 1.0) / 0.7)), tp = _a.copy(pickSt).lerp(P, 0.6); tp.y = top - 0.04;
                gardenJob.crouch(e, 0.3 * u, tp); hands(e, u, tp); if (k > 0.9) J.held = true; if (k > 1.8) go('carry');
                break;
              }
              case 'carry': if (engStep(e, feedSt, dt, t, pf, FIRE_AVOID_R)) go('feed'); else if (k > 60) return done(); break;
              case 'feed': {   // ngồi xổm trước cửa lò, đẩy củi vào lòng lò
                engStandStill(e); const sq = sm(k / 0.6) * (1 - sm((k - 2.7) / 0.6)), u = sm((k - 0.5) / 0.8) * (1 - sm((k - 1.9) / 0.6));
                gardenJob.crouch(e, sq, door); hands(e, u, door); if (k > 1.5 && J.held) { J.held = false; logs.visible = false; chiminea.addWood(); }
                if (k > 3.4) return done();
                break;
              }
            }
            if (J.held && J.st === 'carry') hands(e, 0, null);
            return false;
          }
          function tick(e) {   // sau IK tay: 2 khúc củi giữa 2 bàn tay
            logs.visible = J.held; if (!J.held) return;
            const a = e.wrists[0].getWorldPosition(_a), b = e.wrists[1].getWorldPosition(_b); logs.position.addVectors(a, b).multiplyScalar(0.5); logs.rotation.set(0, e.g.rotation.y, 0);
          }
          return { update, tick, idle() { if (J.st !== 'idle') done(); }, busy: () => J.st !== 'idle', state: J };
        })();
        function chairTea(e, dt, t) {   // pha 'read' khi việc là 'chair' · hết e.timer (10 phút, lúc đang đọc) thì xoá lệnh ⇒ đứng dậy về lịch
          e.timer -= dt; e.rtK += dt;
          if (e.rtTea) {   // sách úp mở trên đùi (gáy ngang người), tay trái nâng cốc nhấp 2 ngụm, tay phải ôm cốc / đặt trên đùi
            const B = e.props.book; e.hold.book = true; B.position.set(0, 0.02, 0.44); B.rotation.set(0, Math.PI / 2, Math.PI);
            if (engTea(e, dt, t) && e.rtK > 5) { e.rtTea = false; e.rtK = 0; }
          } else {
            e.arms[0].rotation.x = e.arms[1].rotation.x = -1.2; engRead(e, dt, t);
            if (e.rtK > 45 && e.timer > 25) { e.rtTea = true; e.rtK = 0; e.teaT = TEA_T - 0.5; } else if (e.timer <= 0 && engForceAct === 'chair') engForceAct = null;
          }
        }
