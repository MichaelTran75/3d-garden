        // ===== CHÓ: HÀNH VI + VẬN ĐỘNG (G 13/10: "research and improve dog behaviour and movement") =====
        //  Tập tính chó nhà: ngủ / nằm nghỉ 12–14 giờ mỗi ngày, xen kẽ đánh hơi khám phá (mũi sát đất, đi chậm, dừng hít lâu chỗ có mùi), đi theo chủ
        //  (giữ khoảng 1–3 m, chủ dừng thì ngồi nhìn), uống nước, chơi đùa ngắn (chạy vòng "zoomies"); dậy thì VƯƠN VAI kiểu cúi chào (chân trước duỗi,
        //  mông cao) rồi GIŨ LÔNG (~4–5 lần/giây); XOAY 1–2 vòng trước khi nằm; đuôi cao vẫy nhanh = vui (chủ tới gần, được vuốt), thấp chậm = thư giãn.
        //  Dáng đi (Hildebrand, cơ sinh học dáng đi tứ chi):
        //   · ĐI BỘ 4 phách, trình tự bên: sau-T → trước-T → sau-P → trước-P; mỗi chân chạm đất ~65% chu kỳ; đầu nhấp theo nhịp chân trước.
        //   · NƯỚC KIỆU 2 phách, chân CHÉO cùng nhịp (trước-T + sau-P), chạm đất ~45%; thân nảy 2 lần/chu kỳ.
        //   · PHI NƯỚC ĐẠI xoay: 2 chân sau rồi 2 chân trước, có pha bay; thân cong–duỗi, ngóc–chúc theo nhịp.
        //  Bàn chân ĐẠP ĐẤT CỐ ĐỊNH tại chỗ (giải IK 2 đoạn cho từng chân), chân vung theo cung nhấc lên — không trượt; đứng yên mà lệch thì nhích từng chân.
        //  Đêm (18:30–06:00) / mưa: vào xe nằm gầm bàn như trước (chung bộ vận động mới).
        const dogBrain = (() => {
          const U = dogObj.userData, s = U.s, L1 = U.L1, L2 = U.L2, H0 = U.H0;
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _hp = new THREE.Vector3();
          const spr = x => ({ x, v: 0 });
          function damp(S, target, w, dt) { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - target, tmp = (S.v + w * c) * dt; S.v = (S.v - w * tmp) * ex; S.x = target + (c + tmp) * ex; return S.x; }
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
          const fwdOf = yaw => _c.set(Math.cos(yaw), 0, -Math.sin(yaw));
          const yawOf = (dx, dz) => Math.atan2(-dz, dx);
          // ---- bát nước của chó cạnh bậc cửa xe ----
          const bowl = new THREE.Group(); bowl.name = 'Bát nước của chó';
          { const steel = new THREE.MeshLambertMaterial({ color: 0xb7bdc2 }), water = new THREE.MeshLambertMaterial({ color: 0x5f8fae });
            const b = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.002], [0.1, 0.002], [0.13, 0.06], [0.14, 0.065]].map(([r, y]) => new THREE.Vector2(r, y)), 18), steel); b.castShadow = true; bowl.add(b);
            const w = new THREE.Mesh(new THREE.CircleGeometry(0.115, 18), water); w.rotation.x = -Math.PI / 2; w.position.y = 0.045; bowl.add(w); }
          const bowlP = vanPt(1.05, 0, 2.15); bowlP.y = cowY(bowlP.x, bowlP.z); bowl.position.copy(bowlP); scene.add(bowl);
          const drinkP = bowlP.clone(), toBowl = new THREE.Vector3(); { const vo = dogDoorFar.clone().sub(dogDoorStep).setY(0).normalize(); drinkP.addScaledVector(vo, 0.42); toBowl.copy(bowlP).sub(drinkP).setY(0).normalize(); }
          // ---- trạng thái thân + chân ----
          const P = { h: spr(0.12 * s), pitch: spr(0), hp: spr(0.1), hy: spr(0), fold: spr(1), sit: spr(0), bow: spr(0), roll: spr(0), ear: spr(0), wag: spr(0) };
          let v = 0, gait = 'walk', ground = (x, z) => cowY(x, z), turnRate = 0, prevYaw = 0;
          const GAITS = {   // độ lệch pha 4 chân [trước-T, trước-P, sau-T, sau-P] · tỉ lệ chạm đất · sải (đv thế giới) · biên độ nhấc chân
            walk: { off: [0.25, 0.75, 0, 0.5], duty: 0.65, stride: 0.42, lift: 0.05 },
            trot: { off: [0, 0.5, 0.5, 0], duty: 0.45, stride: 0.72, lift: 0.07 },
            gallop: { off: [0.5, 0.6, 0, 0.1], duty: 0.32, stride: 1.15, lift: 0.09 }
          };
          function homeLocal(L, out) {   // vị trí bàn chân "nhà" (toạ độ gốc chó) theo pha trộn dáng: đứng · nằm sấp · ngồi · cúi vươn vai
            const hx = L.hip.position.x, hz = L.hip.position.z, f = P.fold.x, si = P.sit.x, bw = P.bow.x, st = Math.max(0, 1 - f - si - bw);
            let x = hx * st + (hx + (L.front ? 0.17 : 0.03) * s) * f + (hx + (L.front ? 0.02 : 0.1) * s) * si + (hx + (L.front ? 0.2 : 0) * s) * bw;
            let z = hz * st + hz * (L.front ? 1.05 : 1.55) * f + hz * (L.front ? 1 : 1.25) * si + hz * bw;
            return out.set(x, 0, z);
          }
          function poseTargets(mode) {   // dáng đích (thân cao, chúc/ngóc) cho từng chế độ
            const T = { h: H0, pitch: 0, fold: 0, sit: 0, bow: 0 };
            if (mode === 'lie') { T.h = 0.12 * s; T.fold = 1; }
            else if (mode === 'sit') { T.h = 0.215 * s; T.pitch = 0.5; T.sit = 1; }
            else if (mode === 'bow') { T.h = 0.24 * s; T.pitch = -0.35; T.bow = 1; }
            return T;
          }
          for (const L of U.legs) { L.L1 = L1; L.L2 = L2; }
          const rig = quadRig(dogObj, { legs: U.legs, gaits: GAITS, home: (L, out) => homeLocal(L, out), ground: (x, z) => ground(x, z) });
          // ---- vận động: lái về đích (né vật cản · lửa · ghế · người · mép nước), tăng/giảm tốc, giới hạn tốc độ quay ----
          const B = { st: 'lie', t: 60, k: 0, mode: 'lie', want: 0, tgt: new THREE.Vector3(), n: 0, doze: 0, look: null, wagAmp: 0.08, wagF: 1.5, sniff: 0, shake: 0 };
          function steer(tx, tz, speed, dt, field, stopR = 0.08) {
            const p = dogObj.position, dx = tx - p.x, dz = tz - p.z, dd = Math.hypot(dx, dz);
            if (dd < stopR) { B.want = 0; return true; }
            let ux = dx / dd, uz = dz / dd;
            if (field && dd > 1.2) { const f = ffDir(field, p.x, p.z); if (f) { ux = f.x; uz = f.z; } }
            const rep = (ox, oz, rr) => { const fx = p.x - ox, fz = p.z - oz, fd = Math.hypot(fx, fz); if (fd >= rr || fd < 1e-4) return; const k = (rr - fd) / rr; ux += fx / fd * k * 2.5 - fz / fd * k * 1.5; uz += fz / fd * k * 2.5 + fx / fd * k * 1.5; };
            if (!B.inside) {
              rep(pf.x, pf.z, FIRE_AVOID_R * 0.75);
              for (const o of obstacleCoords) if (Math.hypot(tx - o.x, tz - o.z) > o.r + 0.5) rep(o.x, o.z, o.r + 0.3);
              for (const o of ENG_PROPS) if (Math.hypot(tx - o.x, tz - o.z) > o.r + 0.3) rep(o.x, o.z, o.r + 0.12);
              if (engObj && !engObj.inVan) { const ep = engObj.g.position; rep(ep.x, ep.z, 0.55); }
            }
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
            let dy = yawOf(ux, uz) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
            const maxTurn = (v < 0.4 ? 5 : 3.2) * dt; dogObj.rotation.y += Math.max(-maxTurn, Math.min(maxTurn, dy * Math.min(1, dt * 8)));
            B.want = speed * Math.max(0.25, Math.cos(dy)) * Math.min(1, 0.3 + dd / 0.8);   // ngoặt gắt / sắp tới thì chậm lại
            return false;
          }
          function move(dt) {   // tích phân tốc độ + vị trí theo HƯỚNG THÂN (không trượt ngang); chặn bước xuống nước
            const acc = B.want > v ? 3.2 : 5; v += Math.max(-acc * dt, Math.min(acc * dt, B.want - v));
            if (v < 1e-3) { v = 0; return 0; }
            const f = fwdOf(dogObj.rotation.y), p = dogObj.position, nx = p.x + f.x * v * dt, nz = p.z + f.z * v * dt;
            if (!B.inside && isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { v = 0; return 0; }
            p.x = nx; p.z = nz; return v * dt;
          }
          // ---- thân, đầu, tai, đuôi ----
          function body(dt, t) {
            const T = poseTargets(B.mode), psi = rig.psi, c2 = Math.cos(4 * Math.PI * psi), s1 = Math.sin(2 * Math.PI * psi);
            const bob = v > 0.06 ? (gait === 'trot' ? 0.012 * s * c2 : gait === 'gallop' ? 0.03 * s * s1 : 0.006 * s * c2) : 0;
            damp(P.fold, T.fold, 4, dt); damp(P.sit, T.sit, 4.5, dt); damp(P.bow, T.bow, 5, dt);
            damp(P.h, T.h + bob, 9, dt); damp(P.pitch, T.pitch + (gait === 'gallop' && v > 0.06 ? 0.12 * Math.cos(2 * Math.PI * psi) : 0), 9, dt);
            U.torso.position.y = P.h.x; U.torso.rotation.z = P.pitch.x;
            let yr = dogObj.rotation.y - prevYaw; yr = Math.atan2(Math.sin(yr), Math.cos(yr)); prevYaw = dogObj.rotation.y; turnRate += (yr / Math.max(dt, 1e-3) - turnRate) * Math.min(1, dt * 6);
            damp(P.roll, Math.max(-0.14, Math.min(0.14, -turnRate * v * 0.05)), 8, dt); dogObj.rotation.x = P.roll.x;   // nghiêng vào khúc cua khi chạy
            // đầu: nhìn đích (chủ, chỗ đánh hơi) · đánh hơi cúi sát · nhấp theo nhịp chân trước khi đi bộ
            let hp = B.headP != null ? B.headP : 0.1, hy = 0;
            if (B.look) { dogObj.worldToLocal(_b.copy(B.look)); const lx = _b.x - 0.3 * s, ly = _b.y - P.h.x - 0.2 * s; hy = Math.max(-0.9, Math.min(0.9, Math.atan2(-_b.z, Math.max(0.05, lx)))); if (B.headP == null) hp = Math.max(-0.5, Math.min(0.6, Math.atan2(ly, Math.hypot(lx, _b.z)))); }
            if (v > 0.06 && gait === 'walk') hp += 0.05 * c2;
            hp -= P.pitch.x * 0.85;   // giữ đầu gần thẳng khi thân chúc/ngóc
            damp(P.hp, hp, 7, dt); damp(P.hy, hy + (B.sniff ? 0.25 * Math.sin(t * 5.3) : 0), 6, dt);
            U.neck.rotation.set(0, P.hy.x * 0.6, P.hp.x * 0.7); U.head.rotation.set(0, P.hy.x * 0.4, P.hp.x * 0.3);
            // tai cụp: lò xo theo nhịp nảy + gió khi chạy (bay ra sau)
            damp(P.ear, -bob / s * 6 - Math.min(0.7, v * 0.22), 14, dt);
            U.ears.forEach((ep, i) => { const sd = i ? 1 : -1; ep.rotation.set(sd * (0.12 + 0.12 * B.shake * Math.sin(t * 28)), 0, P.ear.x); });
            // giũ lông: thân xoắn quanh trục dọc ~4,5 lần/giây, đầu theo trước
            if (B.shake > 0) { U.torso.rotation.x = 0.35 * B.shake * Math.sin(t * 28); U.head.rotation.x = 0.6 * B.shake * Math.sin(t * 28 + 0.6); } else U.torso.rotation.x = 0;
            // đuôi: lệnh vẫy cho đuôi mềm XPBD
            damp(P.wag, B.wagAmp, 4, dt); U.tail.rotation.y = P.wag.x * Math.sin(t * B.wagF * 6.2832);
            U.body.scale.y = B.mode === 'lie' && B.doze ? 1 + 0.04 * Math.sin(t * 1.6) : 1;   // thở chậm khi lim dim
          }
          // ---- HÀNH VI ----
          const restP = dogLie.clone();
          if (!dogRain.st) { dogObj.position.set(restP.x, cowY(restP.x, restP.z), restP.z); dogObj.rotation.y = yawOf(pf.x - restP.x, pf.z - restP.z) + 0.4; }
          const eng = () => engObj && !engObj.inVan && engObj.phase !== 'van' && engObj.g.parent === scene ? engObj : null;
          const randPt = (r0, r1) => { for (let k = 0; k < 14; k++) { const a = Math.random() * 6.2832, r = r0 + Math.random() * (r1 - r0), x = restP.x + Math.cos(a) * r, z = restP.z + Math.sin(a) * r; if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z)))) continue; if (obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.4) || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3)) continue; if (Math.abs(cowY(x, z) - cowY(restP.x, restP.z)) > 0.7) continue; return _a.set(x, 0, z).clone(); } return restP.clone(); };
          function setSt(st, t) { B.st = st; B.k = 0; B.t = t || 0; }
          // CHỖ CHẠY VÒNG (zoomies) — G 16/10: vòng cũ quanh bếp lửa luồn qua khe 0,9 m giữa lò chiminea và đống củi, trông như chó xoay mãi một chỗ.
          // Giờ: bãi cỏ trống gần chỗ nằm nhất mà cả vòng (bán kính ZR, lề ±0,6 m) đều trống trên lưới môi trường (envFree: không vật cản, không nước),
          // không trên đường, đất phẳng (chênh ≤ 0,5 m). Tìm 1 lần; không có thì quanh bếp lửa như cũ.
          const ZR = 2.2; let zoomC = null;
          function zoomCenter() {
            if (zoomC) return zoomC;
            for (let ring = 3.5; ring <= 12 && !zoomC; ring += 1) for (let k = 0; k < 24 && !zoomC; k++) {
              const a = k / 24 * TAU, cx = restP.x + Math.cos(a) * ring, cz = restP.z + Math.sin(a) * ring, y0 = cowY(cx, cz); let ok = envFree(cx, cz) && !roadContains(cx, cz, 0.5);
              for (let q = 0; q < 16 && ok; q++) { const b = q / 16 * TAU; for (const rr of [ZR - 0.6, ZR, ZR + 0.6]) { const x = cx + Math.cos(b) * rr, z = cz + Math.sin(b) * rr; if (!envFree(x, z) || roadContains(x, z, 0.3) || Math.abs(cowY(x, z) - y0) > 0.5) { ok = false; break; } } }
              if (ok) zoomC = new THREE.Vector3(cx, y0, cz);
            }
            return zoomC || (zoomC = pf.clone());
          }
          function chooseNext() {
            const E = eng(), hh = liveWeather.localHour;
            if (E && E.walking && Math.random() < 0.6) return setSt('follow', 50 + Math.random() * 60);
            const r = Math.random();
            if (r < 0.22) return setSt('drink');
            if (r < 0.36 && (hh < 9 || hh > 16)) return setSt('zoom', 7 + Math.random() * 3);
            B.n = 3 + Math.floor(Math.random() * 4); setSt('sniff');
          }
          function shelterTick(dt, t) {   // mưa / tối: vào xe nằm gầm bàn vuông (giữ nguyên lộ trình cũ: tới cửa → bậc → nhảy lên → giường)
            const D = dogRain, p = dogObj.position, rain = liveWeather.state.raining, night = !liveWeather.wildlifeAwake, want = rain || night;
            if (want && (!D.st || D.st === 'toFire')) D.st = 'toDoor';
            else if (!want && D.st) { if (D.st === 'toDoor') D.st = 'toFire'; else if (D.st === 'toBed' || D.st === 'in') D.st = 'toExit'; }
            if (!D.st) { dogZzzGroup.visible = false; B.inside = false; return false; }
            B.look = null; B.headP = null; B.sniff = 0; B.shake = 0; B.mode = 'stand';
            const floorY = dogInside.y;
            if (D.st === 'toDoor') { B.inside = false; ground = cowY; if (steer(dogDoorFar.x, dogDoorFar.z, 1.5, dt, dogDoorField, 0.1)) D.st = 'toStep'; }
            else if (D.st === 'toStep') { if (steer(dogDoorStep.x, dogDoorStep.z, 0.8, dt, null, 0.06)) { D.st = 'hopIn'; D.t = 0; } }
            else if (D.st === 'hopIn' || D.st === 'hopOut') {   // nhảy lên / xuống bậc cửa hông: co chân, bật, duỗi chân trước đáp
              D.t = Math.min(1, D.t + dt / 0.55); const inn = D.st === 'hopIn', A = inn ? dogDoorStep : dogInside, Bp = inn ? dogInside : dogDoorStep;
              const ya = inn ? cowY(A.x, A.z) : floorY, yb = inn ? floorY : cowY(Bp.x, Bp.z);
              p.x = A.x + (Bp.x - A.x) * D.t; p.z = A.z + (Bp.z - A.z) * D.t; p.y = ya + (yb - ya) * D.t + Math.sin(Math.PI * D.t) * 0.3;
              dogObj.rotation.y = yawOf(Bp.x - A.x, Bp.z - A.z); B.want = 0; v = 0;
              B.inside = D.t > 0.5 ? inn : !inn; ground = B.inside ? () => floorY : cowY;
              dogObj.updateMatrixWorld(true); rig.plant(() => p.y - 0.01);
              if (D.t >= 1) D.st = inn ? 'toBed' : 'toFire';
              return true;
            }
            else if (D.st === 'toBed') { B.inside = true; ground = () => floorY; if (steer(dogBed.x, dogBed.z, 0.6, dt, null, 0.08)) D.st = 'in'; }
            else if (D.st === 'toExit') { B.inside = true; ground = () => floorY; if (steer(dogInside.x, dogInside.z, 0.6, dt, null, 0.08)) { D.st = 'hopOut'; D.t = 0; } }
            else if (D.st === 'toFire') { B.inside = false; ground = cowY; if (steer(dogLie.x, dogLie.z, 1.2, dt, dogFireField, 0.1)) { D.st = null; setSt('circle'); B.n = 1.2 + Math.random(); return false; } }
            else {   // 'in': nằm gầm bàn vuông, mặt nhìn ra cửa; tối thì ngủ (gục mõm, thở chậm, Zzz)
              B.inside = true; ground = () => floorY; B.want = 0; B.mode = 'lie';
              let dy = yawOf(dogInside.x - dogBed.x, dogInside.z - dogBed.z) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dogObj.rotation.y += dy * Math.min(1, dt * 2);
            }
            const sleeping = D.st === 'in' && night;
            B.doze = sleeping; B.headP = sleeping ? -0.5 : D.st === 'in' ? 0.05 : null; B.wagAmp = sleeping ? 0.25 : 0.2; B.wagF = sleeping ? 0 : 3;
            dogZzzGroup.visible = sleeping;
            if (sleeping) { U.head.getWorldPosition(_dogHead); for (const z of dogZzz) { const k = (t * 0.32 + z.ph) % 1; z.m.position.set(_dogHead.x + Math.sin(t * 1.7 + z.ph * 6) * 0.07, _dogHead.y + 0.12 + k * 1.3, _dogHead.z); z.m.material.opacity = 0.9 * Math.min(1, (1 - k) * 2.6); z.m.scale.setScalar(0.15 + k * 0.28); } }
            if (B.want > 0 && v < 0.9 && gait !== 'walk') gait = 'walk';
            return true;
          }
          function behave(dt, t) {
            const E = eng(), p = dogObj.position; B.k += dt; B.t -= dt; B.look = null; B.headP = null; B.sniff = 0; B.shake = Math.max(0, B.shake - dt * 1.2);
            const petting = engObj && (engObj.phase === 'toDog' || engObj.phase === 'pet');
            switch (B.st) {
              case 'lie': {   // nằm sưởi cạnh bếp lửa: lúc ngẩng nhìn quanh / nhìn chủ, lúc gục mõm lim dim
                B.mode = 'lie'; B.want = 0;
                if ((B.doze -= dt) < -14 - Math.random() * 10) B.doze = 8 + Math.random() * 14;
                const near = E && E.g.position.distanceTo(p) < 5;
                if (B.doze > 0 && !near && !petting) { B.headP = -0.45; B.wagAmp = 0.03; B.wagF = 1; }
                else { if (E) B.look = _hp.copy(E.g.position).setY(E.g.position.y + 1.2); B.wagAmp = engPetting ? 0.6 : near ? 0.3 : 0.08; B.wagF = engPetting ? 2.8 : near ? 2 : 1.5; }
                if (petting) B.t = Math.max(B.t, 6);
                if (B.t <= 0) setSt('getup');
                break;
              }
              case 'getup': {   // vươn vai kiểu cúi chào → đứng → (có khi) giũ lông
                B.mode = B.k < 1.3 ? (B.k < 0.25 ? 'lie' : 'bow') : 'stand'; B.want = 0; B.wagAmp = 0.15; B.wagF = 1.5;
                if (B.k > 1.6 && B.k < 1.65 && Math.random() < 0.6) B.shake = 1.2;
                if (B.k > 2.8) chooseNext();
                break;
              }
              case 'sniff': {   // đánh hơi: đi chậm mũi sát đất tới chỗ có mùi, dừng hít, đi tiếp
                B.mode = 'stand'; B.sniff = 1; B.headP = -0.42; B.wagAmp = 0.2; B.wagF = 2.2;
                if (!B.hasTgt) { B.tgt.copy(randPt(1.5, 6)); B.hasTgt = true; B.pause = 0; }
                if (B.pause > 0) { B.pause -= dt; B.want = 0; B.headP = -0.75; if (B.pause <= 0) { B.hasTgt = false; if (--B.n <= 0) setSt('return'); } }
                else if (steer(B.tgt.x + Math.sin(t * 1.3) * 0.25, B.tgt.z + Math.cos(t * 1.1) * 0.25, 0.5, dt, null, 0.3)) B.pause = 1.5 + Math.random() * 2.5;
                if (E && E.walking && E.g.position.distanceTo(p) < 4 && Math.random() < dt * 0.05) setSt('follow', 40 + Math.random() * 40);
                break;
              }
              case 'drink': {   // tới bát nước cạnh bậc cửa xe, cúi uống (liếm nước ~3 lần/giây)
                B.mode = 'stand';
                if (B.k < 60 && !B.atBowl) { if (steer(drinkP.x, drinkP.z, 1.0, dt, null, 0.08)) { B.atBowl = true; B.k = 0; } B.wagAmp = 0.15; B.wagF = 2; }
                else {
                  B.want = 0; let dy = yawOf(toBowl.x, toBowl.z) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dogObj.rotation.y += dy * Math.min(1, dt * 5);
                  B.headP = -0.95 + 0.07 * Math.sin(t * 19); B.wagAmp = 0.1; B.wagF = 1.2;
                  if (B.k > 5.5) { B.atBowl = false; B.shake = Math.random() < 0.3 ? 1 : 0; setSt('return'); }
                }
                break;
              }
              case 'zoom': {   // chạy vòng hưng phấn (phi nước đại) trên bãi cỏ trống gần trại, rồi thở dốc chạy chậm về chỗ nằm
                B.mode = 'stand'; B.wagAmp = 0.5; B.wagF = 3;
                const C = zoomCenter(), dc = Math.hypot(p.x - C.x, p.z - C.z), a = Math.atan2(p.z - C.z, p.x - C.x) + 0.9;
                // đang chạy ra bãi: chưa tính giờ chạy vòng (tối đa 25 s cả lượt)
                if (dc > ZR + 0.8) B.t += dt;
                steer(C.x + Math.cos(a) * ZR, C.z + Math.sin(a) * ZR, 2.9, dt, null, 0.05);
                if (B.t <= 0 || B.k > 25) setSt('return');
                break;
              }
              case 'follow': {   // đi theo chủ: giữ ~1,6 m phía sau–bên; xa thì chạy nước kiệu / phi; chủ đứng yên thì ngồi nhìn
                if (!E || B.t <= 0) { setSt('return'); break; }
                const ep = E.g.position, ey = E.g.rotation.y, fx = Math.sin(ey), fz = Math.cos(ey), d = Math.hypot(ep.x - p.x, ep.z - p.z);
                const tx = ep.x - fx * 1.3 + fz * 0.55, tz = ep.z - fz * 1.3 - fx * 0.55;
                B.look = _hp.copy(ep).setY(ep.y + 1.2); B.wagAmp = 0.45; B.wagF = 2.6;
                if (E.walking || d > 2.2) { B.mode = 'stand'; steer(tx, tz, d > 4.5 ? 2.6 : d > 2.4 ? 1.6 : Math.max(0.5, E.vel || 0.7), dt, null, 0.25); }
                else { B.want = 0; B.mode = E.seat ? 'lie' : 'sit'; let dy = yawOf(ep.x - p.x, ep.z - p.z) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dogObj.rotation.y += dy * Math.min(1, dt * 3); }
                break;
              }
              case 'return': {   // về chỗ nằm cạnh bếp lửa
                B.mode = 'stand'; B.wagAmp = 0.15; B.wagF = 2;
                if (steer(restP.x, restP.z, p.distanceTo(restP) > 3 ? 1.3 : 0.7, dt, p.distanceTo(restP) > 2 ? dogFireField : null, 0.12)) { setSt('circle'); B.n = 1 + Math.random() * 0.8; }
                break;
              }
              case 'circle': {   // xoay 1–2 vòng tại chỗ trước khi nằm (tập tính giẫm ổ)
                B.mode = 'stand'; B.want = 0.25; const turn = 4.2 * dt; dogObj.rotation.y += turn; B.n -= turn / 6.2832; B.wagAmp = 0.1;
                p.x += (restP.x - p.x) * Math.min(1, dt * 2); p.z += (restP.z - p.z) * Math.min(1, dt * 2);
                if (B.n <= 0) { setSt('lie', 50 + Math.random() * 100); B.doze = 0; const toFire = yawOf(pf.x - p.x, pf.z - p.z); dogObj.rotation.y = toFire + Math.atan2(Math.sin(dogObj.rotation.y - toFire), Math.cos(dogObj.rotation.y - toFire)) * 0.3; }
                break;
              }
            }
            if (E && B.st !== 'follow' && B.st !== 'lie' && E.walking && E.g.position.distanceTo(p) < 1.6) B.look = _hp.copy(E.g.position).setY(E.g.position.y + 1.2);
          }
          return {
            update(dt, t) {
              dt = Math.min(dt, 0.05);
              if (!shelterTick(dt, t)) behave(dt, t);
              // chọn dáng đi theo tốc độ (có trễ để khỏi đổi qua lại)
              if (gait === 'walk' && v > 1.0) gait = 'trot'; else if (gait === 'trot' && v < 0.8) gait = 'walk'; else if (gait === 'trot' && v > 2.3) gait = 'gallop'; else if (gait === 'gallop' && v < 2.0) gait = 'trot';
              const dist = move(dt);
              if (dogRain.st !== 'hopIn' && dogRain.st !== 'hopOut') dogObj.position.y = ground(dogObj.position.x, dogObj.position.z);
              body(dt, t); rig.step(dt, dist, v, gait, P.h.x, P.pitch.x, P.fold.x + P.sit.x + P.bow.x > 0.05);
              updateSoftTail(dogTail, dt, U.tail.rotation.y, dogZzzGroup.visible ? 1 : 0);
            },
            pettable: () => !dogRain.st && B.st === 'lie' && dogObj.position.distanceTo(restP) < 0.8,
            state: B, rig
          };
        })();
        const dogPettable = () => dogBrain.pettable();
