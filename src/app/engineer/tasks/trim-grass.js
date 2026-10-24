        // ===== KỸ SƯ PHÁT CỎ QUANH TRẠI SAU MƯA (G 18/10 "sau trời mưa em cho engineer grass trimming quanh chỗ camping") =====
        //  KHI NÀO: mưa ≥ 2 phút rồi tạnh ⇒ cỏ lên nhanh (TRIM.pend). Kỹ sư đợi CỎ RÁO (độ ướt mặt đất sceneWet < 0,15 — cỏ ướt bết lưỡi, nặng máy, trơn chân)
        //  và trời sáng (6:40–17:20) rồi chen vào giờ rảnh / giờ nghiên cứu (không chen bữa ăn, tắm, ngủ); tạnh sau 17:20 thì để sáng hôm sau. Vòng cỏ quanh trại đã
        //  cắt ≥ 60% thì thôi. Người xem bấm máy cắt cỏ ⇒ bảng "▶ Cắt cỏ" (ui/xray-lifecycle.js) gọi làm ngay.
        //  QUY TRÌNH (thao tác máy cắt cỏ đeo lưng an toàn): ra chỗ để máy cạnh đống củi → ngồi xổm cạnh máy, tay trái đè thanh khung, tay phải giật dây
        //  (lần 1 máy hắt hơi, lần 2 nổ) → quay lưng vào ba lô, ngồi xuống, 2 tay nắm quai, đứng lên (ba lô lên lưng), kéo quai → đi tới đầu cần, cúi nhấc
        //  cần (tay phải tay ga, tay trái tay cầm vòng) → đi theo các VÒNG quanh bếp lửa (bán kính 3,5 → 6,8 m, cách nhau 1,1 m, chừa vật cản ≥ 0,6 m, mép
        //  nước, chỗ không có cỏ), chậm 0,22 m/s, LIA lưỡi phải → trái sát đất (lượt cắt 1 s, ga lớn) rồi nhấc nhẹ quay về (0,7 s): người vặn eo theo, mắt
        //  nhìn lưỡi; ô cỏ dưới lưỡi còn 4–6 cm (meadow.cutAt), vụn cỏ văng sang trái. Con vật (chó, gấu mèo, hươu) trong 1,6 m quanh lưỡi ⇒ nhả ga, nhấc lưỡi,
        //  đợi (≤ 6 s rồi bỏ đoạn đó) → hết vòng: về chỗ để, bấm tắt máy, dựa cần vào đống củi, ngồi xuống tháo ba lô, lau mồ hôi trán.
        //  Tay LEGO ngắn (vai → tâm bàn tay 0,54 m) ⇒ tay ga cầm cao trước bụng, tay trái nắm góc trên–trái tay cầm vòng, ống dốc ~45° (người thật ~35°).
        //  Bị cắt ngang (giờ ngủ, việc khác): máy về chỗ ngay (idle). Mưa lại giữa chừng: tự thôi cắt, mang máy về cất đúng quy trình ----
        const TRIM = { pend: false, rainS: 0 };
        const TRIM_SLOT = new Set(['outdoor', 'rest', 'read', 'music', 'fish', 'research', 'drone', 'apples']);
        function trimWatch(dt) { if (liveWeather.state.raining) TRIM.rainS += dt; else { if (TRIM.rainS > 120) TRIM.pend = true; TRIM.rainS = 0; } }
        function trimWant(e, hh, sched) {   // engWantAct (engineer/mind/schedule.js): 'trim' hoặc null
          if (trimJob.busy()) return 'trim';   // đang làm dở: làm cho xong (kể cả mưa lại: tự cất máy)
          if (!TRIM.pend || !trimKit.ready || engForceAct) return null;
          if (!engHourOk('trim', hh) || liveWeather.state.raining || sceneWet > 0.15 || !TRIM_SLOT.has(sched)) return null;
          if (trimJob.cutFrac() > 0.6) { TRIM.pend = false; return null; }
          return 'trim';
        }
        const trimJob = (() => {
          const J = { st: 'idle', k: 0, segs: null, si: 0, wi: 0, ph: 0, wait: 0, pulls: 0, sq: 0, rain: false, A0: new THREE.Vector3(), D0: new THREE.Vector3() };
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _l = new THREE.Vector3(), _f = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const go = st => { J.st = st; J.k = 0; };
          const K = trimKit, A = () => K.A, R_GRIP = [-0.06, 1.58, 0.12];   // tay ga: toạ độ kỹ sư theo eo (đv mẫu người; eo 1,255, vai 1,86)
          // ---- vòng cắt: các vòng tròn quanh bếp lửa, chia đoạn theo vật cản / nước / chỗ không có cỏ; nối đoạn gần nhất kế tiếp ----
          function plan() {
            const segs = [], a0 = Math.atan2(caravanObj.position.z - pf.z, caravanObj.position.x - pf.x);   // bắt đầu mỗi vòng ở phía xe (luôn bị chặn) ⇒ đoạn không bị cắt đôi ở góc 0
            const y0 = cowY(pf.x, pf.z), clear = (x, z) => { if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || Math.abs(cowY(x, z) - y0) > ENG_STEP_MAX) return false;   // khác mặt bằng trại > 1 voxel (dốc xuống hồ): bỏ — trước: bước hụt xuống dốc 2,4 m
              for (const o of obstacleCoords) if (Math.hypot(x - o.x, z - o.z) < o.r + 0.6) return false;
              for (const o of ENG_PROPS) if (Math.hypot(x - o.x, z - o.z) < o.r + 0.55) return false;
              return meadow.grassNear(x, z, 1.25); };
            [3.5, 4.6, 5.7, 6.8].forEach((r, ri) => { const n = Math.ceil(2 * Math.PI * r / 0.45); let cur = [];
              for (let k = 0; k <= n; k++) { const a = a0 + (ri % 2 ? -1 : 1) * k / n * 2 * Math.PI, x = pf.x + Math.cos(a) * r, z = pf.z + Math.sin(a) * r;
                const ok = clear(x, z) && (!cur.length || Math.abs(cowY(x, z) - cowY(cur[cur.length - 1].x, cur[cur.length - 1].z)) <= ENG_STEP_MAX);   // 2 điểm liền chênh > 1 voxel: ngắt đoạn
                if (ok) cur.push(new THREE.Vector3(x, 0, z)); else { if (cur.length >= 4) segs.push(cur); cur = clear(x, z) ? [new THREE.Vector3(x, 0, z)] : []; } }
              if (cur.length >= 4) segs.push(cur); });
            const out = [], p = new THREE.Vector3().copy(K.homeA).setY(0), L = segs.slice();
            while (L.length) { let bi = 0, bd = Infinity, rev = false;
              L.forEach((s, i) => { const d0 = s[0].distanceTo(p), d1 = s[s.length - 1].distanceTo(p); if (d0 < bd) { bd = d0; bi = i; rev = false; } if (d1 < bd) { bd = d1; bi = i; rev = true; } });
              const s = L.splice(bi, 1)[0]; if (rev) s.reverse(); out.push(s); p.copy(s[s.length - 1]); }
            return out;
          }
          // ---- tư thế cần theo người: tay phải ở tay ga (theo eo — vặn eo thì cả tay + cần quay theo), ống chĩa theo hướng ngực + yawRel, dốc sao cho lưỡi cách đất hb ----
          function tube(e, yawRel, hb, outA, outDir) {
            const G = engBodyW(e, R_GRIP[0], R_GRIP[1], R_GRIP[2], _a), f = engAxesW(e).f, yaw = Math.atan2(f.x, f.z) + yawRel, hx = Math.sin(yaw), hz = Math.cos(yaw);
            const L = A().shaft.blade[2] - A().shaft.grip[2]; let th = 0.75;
            for (let it = 0; it < 3; it++) { const c = Math.cos(th); th = Math.asin(Math.max(0.15, Math.min(0.97, (G.y - cowY(G.x + hx * c * L, G.z + hz * c * L) - hb) / L))); }
            outDir.set(hx * Math.cos(th), -Math.sin(th), hz * Math.cos(th)); return outA.copy(G).addScaledVector(outDir, -A().shaft.grip[2]);
          }
          const GRIP_L = new THREE.Vector3(), LOOP_L = new THREE.Vector3();   // tay ga (trên trục ống) · góc trên–trái tay cầm vòng (đặt khi mẫu nạp xong)
          function grips(e, Ap, Dp) {   // đích 2 bàn tay trên cần ở tư thế (Ap, Dp)
            const R = e.reachT || (e.reachT = [null, null]);
            if (!GRIP_L.lengthSq()) { GRIP_L.set(0, 0.012, A().shaft.grip[2]); const lp = A().shaft.loop; LOOP_L.set(0.094, lp[1] - 0.04, lp[2]); }
            R[0] = K.shaftPt(Ap, Dp, GRIP_L, new THREE.Vector3()); R[1] = K.shaftPt(Ap, Dp, LOOP_L, new THREE.Vector3());
          }
          function crouch(e, sq, depth = 0.24) {   // ngồi xổm sâu theo sq (0–1)
            e.noFootIK = sq > 0.02; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - depth * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -1.0 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.65 * sq;
          }
          const packPt = (x, y, z) => { K.pack.updateWorldMatrix(true, false); return K.pack.localToWorld(new THREE.Vector3(x, y, z)); };   // điểm hệ ba lô (−X = phải người đeo)
          function stand(e) { engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; }
          function face(e, yaw, dt) { const d = Math.atan2(Math.sin(yaw - e.g.rotation.y), Math.cos(yaw - e.g.rotation.y)); e.g.rotation.y += d * Math.min(1, dt * 5); }
          function look(e, p) { e.head.getWorldPosition(_c); e.head.rotation.x = Math.max(-0.7, Math.min(0.85, -Math.atan2(p.y - _c.y, Math.hypot(p.x - _c.x, p.z - _c.z)) - 0.8 * (e.lean || 0))); }
          const animalNear = (p, r) => { for (const o of [dogObj, raccoonObj, stag && stag.g, ...chickens.list.map(c => c.g)]) if (o && o.visible !== false && hovShown(o) && Math.hypot(o.position.x - p.x, o.position.z - p.z) < r) return o; return null; };
          const _z = new THREE.Vector3(), zone = e => _z.set(e.g.position.x + Math.sin(e.g.rotation.y), 0, e.g.position.z + Math.cos(e.g.rotation.y));   // vùng lưỡi lia: 1 m trước mặt (không theo nhịp lia ⇒ không chập chờn)
          const F = { kit: null, grab: null, seg: [] };   // bảng dẫn đường (BFS né vật cản) tới chỗ để máy / chỗ nhấc cần / đầu từng đoạn
          // chỗ đứng: giật máy (hông +X của ba lô — phía tay giật), đeo / tháo (trước đệm lưng, quay lưng vào ba lô), nhấc / đặt cần (bên phải ống, cạnh tay ga)
          const spot = { start: new THREE.Vector3(), don: new THREE.Vector3(), grab: new THREE.Vector3(), grabYaw: 0 };
          function spots() {
            K.homePack.decompose(_a, _q, _b); spot.start.set(_a.x + 0.62, 0, _a.z + 0.05); spot.don.set(_a.x, 0, _a.z + 0.34);
            const hd = K.homeDir, gp = _c.copy(K.homeA).addScaledVector(hd, A().shaft.grip[2]), right = _d.set(-hd.z, 0, hd.x).normalize();   // phải của ống (nhìn dọc ống)
            spot.grab.set(gp.x + right.x * 0.5 + hd.x * 0.1, 0, gp.z + right.z * 0.5 + hd.z * 0.1); spot.grabYaw = Math.atan2(hd.x, hd.z);
          }
          function update(e, dt, t) {   // pha 'trim' của kỹ sư (engineer/mind/loop-update.js): true = xong
            if (!K.ready) return true;
            if (J.st === 'idle') { J.segs = plan(); J.si = 0; J.wi = 0; J.pulls = 0; J.rain = false; spots(); K.e = e; go('toStart');
              K.homePack.decompose(_a, _q, _b); F.kit = buildFlowField(_a.x, _a.z); F.grab = buildFlowField(spot.grab.x, spot.grab.z); F.seg = []; idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 12000); }
            J.k += dt; const k = J.k, E = K.eng, H = e.hold || (e.hold = {}); H.pole = J.st !== 'toStart' && J.st !== 'start' && J.st !== 'toDon' && J.st !== 'don' && J.st !== 'doff' && J.st !== 'wipe' && J.st !== 'done';
            if (liveWeather.state.raining && !J.rain && ['go', 'go2', 'cut', 'wait'].includes(J.st)) { J.rain = true; go('back'); }   // mưa lại: thôi cắt, cất máy
            const R = e.reachT || (e.reachT = [null, null]);
            switch (J.st) {
              case 'toStart': if (engStep(e, spot.start, dt, t, pf, FIRE_AVOID_R, F.kit)) { e.g.position.x = spot.start.x; e.g.position.z = spot.start.z; go('start'); } break;
              case 'start': {   // ngồi xổm cạnh máy: tay trái đè thanh khung, tay phải giật dây (lần 1 hắt hơi, lần 2 nổ)
                stand(e); face(e, Math.atan2(-1, 0), dt); const sq = ease(k / 0.6) * (1 - ease((k - 4.6) / 0.7)); crouch(e, sq, 0.2); e.lean = 0.28 * sq; e.spineT = { x: 0.25 * sq, y: 0.15 * sq };
                R[1] = K.anchorW('pack', 'top', new THREE.Vector3()); const port = K.anchorW('pack', 'starter', new THREE.Vector3()); look(e, port);
                const T0 = 0.9, T1 = 2.6, pullAt = tt => { const x = (k - tt); return x < 0 ? 0 : x < 0.32 ? ease(x / 0.32) : x < 0.45 ? 1 : 1 - ease((x - 0.45) / 0.7); };   // giật nhanh 0,32 s · giữ · thả dây cuộn về 0,7 s
                const pl = Math.max(pullAt(T0), pullAt(T1)); K.pull = pl;
                R[0] = port.clone().add(_b.set(0.42 * pl, 0.3 * pl, 0.06 * pl)); e.elbowFlexT = [0.05 * pl, 0];
                if (k > T0 + 0.3 && J.pulls === 0) { J.pulls = 1; K.puff(false); }   // lần 1: máy hắt hơi
                if (k > T1 + 0.3 && J.pulls === 1) { J.pulls = 2; E.on = true; E.thr = 0.1; K.puff(true); K.puff(true); }   // lần 2: nổ
                if (k > 5.3) { K.pull = 0; e.noFootIK = false; go('toDon'); }
                break;
              }
              case 'toDon': if (engStep(e, spot.don, dt, t, pf, FIRE_AVOID_R, F.kit)) { e.g.position.x = spot.don.x; e.g.position.z = spot.don.z; go('don'); } break;
              case 'don': {   // quay lưng vào ba lô, ngồi xuống, 2 tay nắm quai, đứng lên (ba lô lên lưng), kéo quai trước ngực
                stand(e); face(e, 0, dt); K.packMode = 'don';
                const down = ease(k / 0.8), up = ease((k - 1.3) / 1.1), sq = down * (1 - up); crouch(e, sq, 0.3); e.lean = 0.22 * sq; K.packU = up;
                if (k < 1.25) { R[0] = packPt(-0.13, 0.2, 0.04); R[1] = packPt(0.13, 0.2, 0.04); }   // với ra sau nắm 2 quai
                else { const tug = k > 2.5 ? Math.sin(Math.min(1, (k - 2.5) / 0.9) * Math.PI) : 0; R[0] = engBodyW(e, -0.13, 1.72 - 0.06 * tug, 0.2, new THREE.Vector3()); R[1] = engBodyW(e, 0.13, 1.72 - 0.06 * tug, 0.2, new THREE.Vector3()); }   // tay giữ quai trước ngực, đứng lên rồi kéo quai
                if (k > 2.4) { K.packMode = 'back'; K.packU = 1; } if (k > 3.5) { e.noFootIK = false; go('toGrab'); }
                break;
              }
              case 'toGrab': if (engStep(e, spot.grab, dt, t, pf, FIRE_AVOID_R, F.grab)) { e.g.position.x = spot.grab.x; e.g.position.z = spot.grab.z; go('grab'); } break;
              case 'grab': case 'lay': {   // cúi nhấc cần khỏi đống củi về tư thế mang (hoặc ngược lại: đặt cần lên đống củi)
                stand(e); face(e, spot.grabYaw, dt); const lift = J.st === 'grab' ? ease((k - 0.6) / 1.2) : 1 - ease((k - 0.3) / 1.2), bend = J.st === 'grab' ? Math.min(ease(k / 0.6), 1 - ease((k - 1.2) / 0.8)) : Math.min(ease(k / 0.5), 1 - ease((k - 1.4) / 0.7));
                crouch(e, 0.45 * bend, 0.2); e.lean = 0.3 * bend; e.spineT = { x: 0.3 * bend, y: 0 };
                tube(e, 0.05, 0.38, _a, _b); _c.copy(K.homeA).lerp(_a, lift); _q.setFromUnitVectors(UP, K.homeDir); _q2.setFromUnitVectors(UP, _b); _q.slerp(_q2, lift); _d.copy(UP).applyQuaternion(_q);
                K.shaftPose(_c, _d); grips(e, _c, _d); look(e, K.shaftPt(_c, _d, LOOP_L, _l));
                if (J.st === 'grab' && k > 2.0) { e.noFootIK = false; go(J.segs.length ? 'go' : 'back'); }
                if (J.st === 'lay' && k > 1.55) K.shaftMode = 'home';
                if (J.st === 'lay' && k > 2.1) { e.noFootIK = false; go('toDoff'); }
                break;
              }
              case 'go': {   // mang cần (lưỡi nhấc cao ~0,35 m, ga nhỏ) tới đầu đoạn cắt kế tiếp
                const seg = J.segs[J.si]; E.thr = 0.12; e.spd = 0.75; tube(e, 0.05, 0.36, _a, _b); K.shaftPose(_a, _b); grips(e, _a, _b); e.spineT = { x: 0.04, y: 0 };
                if (!F.seg[J.si]) F.seg[J.si] = buildFlowField(seg[0].x, seg[0].z);
                if (engStep(e, seg[0], dt, t, pf, FIRE_AVOID_R, F.seg[J.si])) { J.wi = 1; J.ph = 0; go('cut'); }
                break;
              }
              case 'go2': {   // bỏ qua chỗ có con vật: mang cần (lưỡi nhấc) tới điểm kế tiếp của đoạn rồi cắt tiếp
                const wp = J.segs[J.si][J.wi]; E.thr = 0.15; e.spd = 0.6; tube(e, 0.05, 0.3, _a, _b); K.shaftPose(_a, _b); grips(e, _a, _b); e.spineT = { x: 0.04, y: 0 };
                if (engStep(e, wp, dt, t, pf, FIRE_AVOID_R)) go('cut');
                break;
              }
              case 'cut': case 'wait': {   // đi chậm theo đoạn + lia lưỡi; con vật lại gần lưỡi ⇒ đợi
                const seg = J.segs[J.si], cyc = 1.7; let s, hb;
                if (J.st === 'cut') { J.ph = (J.ph + dt) % cyc; const p = J.ph;
                  if (p < 1.0) { s = -1 + 2 * ease(p / 1.0); hb = 0.05; E.thr = 1; } else { const r = (p - 1.0) / 0.7; s = 1 - 2 * ease(r); hb = 0.05 + 0.07 * Math.sin(Math.PI * r); E.thr = 0.6; }
                } else { s = 0; hb = 0.3; E.thr = 0.15; }
                e.spineT = { x: 0.1, y: 0.42 * (s || 0) - 0.04 };
                tube(e, 0.05 + 0.14 * (s || 0), hb, _a, _b); K.shaftPose(_a, _b); grips(e, _a, _b);
                const bp = K.shaftPt(_a, _b, _c.set(0, -0.04, A().shaft.blade[2]), _l); look(e, bp);
                if (J.st === 'cut') {
                  const pet = animalNear(zone(e), 1.9); if (pet) { J.wait = 0; J.clear = 0; go('wait'); break; }
                  if (hb < 0.08 && K.eng.spin > 30) { const n = meadow.cutAt(bp.x, bp.z, 0.36);   // ô cỏ dưới lưỡi
                    if (n || (Math.random() < dt * 14 && meadow.grassNear(bp.x, bp.z, 0.45))) { _f.set(_b.x, 0, _b.z).normalize(); _d.set(_f.z, 0, -_f.x); K.emit(bp, _d, _f, n ? 4 + 3 * n : 1); } }   // _d: trái của hướng ống
                  e.spd = 0.22; const wp = seg[J.wi];
                  if (engStep(e, wp, dt, t, pf, FIRE_AVOID_R) || Math.hypot(wp.x - e.g.position.x, wp.z - e.g.position.z) < 0.3) { J.wi++; if (J.wi >= seg.length) { J.si++; go(J.si < J.segs.length ? 'go' : 'back'); } }
                } else {   // đợi con vật đi khỏi (nhìn nó); quá 6 s thì bỏ qua đoạn này
                  stand(e); J.wait += dt; const pet = animalNear(zone(e), 2.4); if (pet) { look(e, pet.position); J.clear = 0; } else J.clear += dt;
                  if (J.clear > 1.0) go('cut'); else if (J.wait > 6) { J.wi += 5; if (J.wi >= seg.length) { J.si++; go(J.si < J.segs.length ? 'go' : 'back'); } else go('go2'); }   // bỏ ~2 m đường cắt, đi vòng tới điểm sau
                }
                break;
              }
              case 'back': {   // về chỗ để máy (lưỡi nhấc, ga nhỏ)
                E.thr = 0.12; e.spd = 0.75; tube(e, 0.05, 0.36, _a, _b); K.shaftPose(_a, _b); grips(e, _a, _b); e.spineT = { x: 0.04, y: 0 };
                if (engStep(e, spot.grab, dt, t, pf, FIRE_AVOID_R, F.grab)) { e.g.position.x = spot.grab.x; e.g.position.z = spot.grab.z; go('stop'); }
                break;
              }
              case 'stop': {   // nhả ga, ngón cái bấm công tắc tắt máy trên tay ga, chờ lưỡi dừng
                stand(e); face(e, spot.grabYaw, dt); E.thr = 0; tube(e, 0.05, 0.36, _a, _b); K.shaftPose(_a, _b); grips(e, _a, _b);
                const bp = K.shaftPt(_a, _b, _c.set(0, 0, A().shaft.grip[2]), _l); look(e, bp); if (k > 0.6 && E.on) { E.on = false; K.puff(true); }
                if (k > 1.6 && K.eng.spin < 3) go('lay');
                break;
              }
              case 'toDoff': if (engStep(e, spot.don, dt, t, pf, FIRE_AVOID_R, F.kit)) { e.g.position.x = spot.don.x; e.g.position.z = spot.don.z; go('doff'); } break;
              case 'doff': {   // quay lưng về chỗ để, ngồi xuống đặt ba lô xuống cỏ, rút tay khỏi quai, đứng lên
                stand(e); face(e, 0, dt); const down = ease(k / 1.1), up = ease((k - 1.6) / 0.8), sq = down * (1 - up); crouch(e, sq, 0.3); e.lean = 0.22 * sq;
                K.packMode = 'don'; K.packU = 1 - down;
                if (k < 1.2) { R[0] = engBodyW(e, -0.13, 1.7, 0.2, new THREE.Vector3()); R[1] = engBodyW(e, 0.13, 1.7, 0.2, new THREE.Vector3()); }   // tay giữ quai trước ngực khi ngồi xuống
                if (k > 1.15) { K.packMode = 'home'; K.packU = 0; } if (k > 2.5) { e.noFootIK = false; go('wipe'); }
                break;
              }
              case 'wipe': {   // lau mồ hôi trán bằng mu bàn tay phải (2 lượt), ngẩng nhìn vòng cỏ vừa cắt
                stand(e); const w = Math.min(ease(k / 0.4), 1 - ease((k - 1.7) / 0.4)), sw = Math.sin(k * 5.2);
                e.head.updateWorldMatrix(true, false); R[0] = e.head.localToWorld(new THREE.Vector3(0.06 * sw, 0.14, 0.2)).lerp(engBodyW(e, -0.3, 1.2, 0.05, _d), 1 - w); e.head.rotation.x = -0.12 * w;
                if (k > 2.2) { go('done'); }
                break;
              }
            }
            if (J.st === 'done') { J.st = 'idle'; K.setHome(); TRIM.pend = false; e.hold.pole = false; return true; }
            return false;
          }
          function idle() {   // bị cắt ngang: máy về chỗ ngay
            if (J.st === 'idle') return; J.st = 'idle'; K.setHome(); const e = engObj; e.noFootIK = false; if (e.hold) e.hold.pole = false;
          }
          function cutFrac() { return meadow.cutFrac(pf.x, pf.z, 3.2, 7.4); }
          return { update, idle, busy: () => J.st !== 'idle', cutFrac, state: J };
        })();
