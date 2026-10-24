        // ===== CHÓ: HÀNH VI + VẬN ĐỘNG (G 13/10: "research and improve dog behaviour and movement") =====
        //  Tập tính chó nhà: ngủ / nằm nghỉ 12–14 giờ mỗi ngày, xen kẽ đánh hơi khám phá (mũi sát đất, đi chậm, dừng hít lâu chỗ có mùi), đi theo chủ
        //  (giữ khoảng 1–3 m, chủ dừng thì ngồi nhìn), uống nước, chơi đùa ngắn (chạy vòng "zoomies"); dậy thì VƯƠN VAI kiểu cúi chào (chân trước duỗi,
        //  mông cao) rồi GIŨ LÔNG (~4–5 lần/giây); tới chỗ nằm chỉ xoay ngắn quay mặt về bếp lửa (G 17/10 bỏ xoay 1–2 vòng tại chỗ); đuôi cao vẫy nhanh = vui (chủ tới gần, được vuốt), thấp chậm = thư giãn.
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
          // chỗ đứng uống phải cách ghế cắm trại / bàn trà ≥ 0,4 m: chỗ cũ (phía nam bậc cửa) chỉ cách vòng ghế 11 cm — mông chó tì lưng ghế, đường tới bát
          // cắt qua góc ghế (lớp va chạm chặn ⇒ kẹt rồi đi xuyên) ⇒ vướng thì sang phía bắc bậc cửa
          const bowlP = new THREE.Vector3(), drinkP = new THREE.Vector3(), toBowl = new THREE.Vector3();
          { const vo = dogDoorFar.clone().sub(dogDoorStep).setY(0).normalize();
            const free = () => !ENG_PROPS.some(o => Math.hypot(drinkP.x - o.x, drinkP.z - o.z) < o.r + 0.4 || Math.hypot(bowlP.x - o.x, bowlP.z - o.z) < o.r + 0.2) && !obstacleCoords.some(o => Math.hypot(drinkP.x - o.x, drinkP.z - o.z) < o.r + 0.25);
            for (const lx of [1.05, -0.75, -0.95, 1.05]) { bowlP.copy(vanPt(lx, 0, 1.72)); drinkP.copy(bowlP).addScaledVector(vo, 0.42); if (free()) break; }
            bowlP.y = drinkP.y = cowY(bowlP.x, bowlP.z); toBowl.copy(bowlP).sub(drinkP).setY(0).normalize(); }
          bowl.position.copy(bowlP); scene.add(bowl);
          let drinkF = null;   // bảng DP tới chỗ uống (dựng lần đầu chó đi uống)
          // ---- trạng thái thân + chân ----
          const P = { h: spr(0.12 * s), pitch: spr(0), hp: spr(0.1), hy: spr(0), fold: spr(1), sit: spr(0), bow: spr(0), roll: spr(0), ear: spr(0), wag: spr(0), tilt: spr(0), eye: spr(1), wagB: spr(0) };
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
            const T = { h: H0 * 0.95, pitch: 0, fold: 0, sit: 0, bow: 0 };   // đứng: hông ~92% chiều dài chân (trước 99% — chân duỗi thẳng, bước nào cũng hết tầm với)
            if (mode === 'lie') { T.h = 0.12 * s; T.fold = 1; }
            else if (mode === 'sit') { T.h = 0.215 * s; T.pitch = 0.5; T.sit = 1; }
            else if (mode === 'bow') { T.h = 0.24 * s; T.pitch = -0.35; T.bow = 1; }
            else if (mode === 'crouch') { T.h = H0 * 0.72; T.pitch = 0.08; }   // nhún trước khi bật nhảy (4 chân gập)
            else if (mode === 'stalk') { T.h = H0 * 0.62; T.pitch = -0.16; }   // rình đàn bò (border collie "eye"): thân hạ thấp, vai thấp hơn hông
            return T;
          }
          for (const L of U.legs) { L.L1 = L1; L.L2 = L2; }
          const rig = quadRig(dogObj, { legs: U.legs, gaits: GAITS, home: (L, out) => homeLocal(L, out), ground: (x, z) => ground(x, z) });
          // ---- vận động: lái về đích (né vật cản · lửa · ghế · người · mép nước), tăng/giảm tốc, giới hạn tốc độ quay ----
          const B = { st: 'lie', t: 60, k: 0, mode: 'lie', want: 0, tgt: new THREE.Vector3(), n: 0, doze: 0, look: null, wagAmp: 0.08, wagF: 1.5, sniff: 0, shake: 0, patAt: null, patReady: false };
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
            const f = fwdOf(dogObj.rotation.y), p = dogObj.position; let nx = p.x + f.x * v * dt, nz = p.z + f.z * v * dt;
            if (!B.inside && isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz))) && damDeckY(nx, nz) === null) { v = 0; return 0; }   // mặt đập = cầu (lùa bò bên kia sông)
            const D = dogRain.st, far = D === 'herd' || (D === 'toDoor' && Math.hypot(p.x - dogDoorFar.x, p.z - dogDoorFar.z) > 4);   // đang lùa bò / còn xa cửa xe: vẫn tránh vật thật
            if (!B.inside && (!D || far) && COL_M.dog) {   // vướng đồ trại, thân cây, cột thật: men theo; kẹt thì chậm lại (core/collide.js)
              const mv = colSlide(COL_M.dog, p.x, p.z, -dogObj.rotation.y, v * dt, dt);
              if (!mv) { v *= 0.4; return 0; }
              nx = mv[0]; nz = mv[1]; if (mv[2]) dogObj.rotation.y -= mv[2] * Math.min(1, dt * 4);
            }
            const d = Math.hypot(nx - p.x, nz - p.z); p.x = nx; p.z = nz; return d;
          }
          // ---- thân, đầu, tai, đuôi ----
          function body(dt, t) {
            const T = poseTargets(B.mode), psi = rig.psi, c2 = Math.cos(4 * Math.PI * psi), s1 = Math.sin(2 * Math.PI * psi);
            const bob = v > 0.06 ? (gait === 'trot' ? 0.012 * s * c2 : gait === 'gallop' ? 0.03 * s * s1 : 0.006 * s * c2) : 0;
            damp(P.fold, T.fold, 4, dt); damp(P.sit, T.sit, 4.5, dt); damp(P.bow, T.bow, 5, dt);
            damp(P.h, T.h + bob, 9, dt); damp(P.pitch, T.pitch + (gait === 'gallop' && v > 0.06 ? 0.12 * Math.cos(2 * Math.PI * psi) : 0) + (B.slope || 0), 9, dt);
            U.torso.position.y = P.h.x; U.torso.rotation.z = P.pitch.x;
            let yr = dogObj.rotation.y - prevYaw; yr = Math.atan2(Math.sin(yr), Math.cos(yr)); prevYaw = dogObj.rotation.y; turnRate += (yr / Math.max(dt, 1e-3) - turnRate) * Math.min(1, dt * 6);
            damp(P.roll, Math.max(-0.14, Math.min(0.14, -turnRate * v * 0.05)), 8, dt); dogObj.rotation.x = P.roll.x;   // nghiêng vào khúc cua khi chạy
            // đầu: nhìn đích (chủ, chỗ đánh hơi) · đánh hơi cúi sát · nhấp theo nhịp chân trước khi đi bộ
            let hp = B.headP != null ? B.headP : 0.1, hy = 0;
            if (B.look) { dogObj.worldToLocal(_b.copy(B.look)); const lx = _b.x - 0.3 * s, ly = _b.y - P.h.x - 0.2 * s; hy = Math.max(-0.9, Math.min(0.9, Math.atan2(-_b.z, Math.max(0.05, lx)))); if (B.headP == null) hp = Math.max(-0.5, Math.min(0.6, Math.atan2(ly, Math.hypot(lx, _b.z)))); }
            if (v > 0.06 && gait === 'walk') hp += 0.05 * c2;
            if (B.barkK > 0.4) hp += 0.45 * Math.sin(Math.PI * (0.7 - B.barkK) / 0.3);   // sủa: hất đầu lên 0,3 s
            hp -= P.pitch.x * 0.85;   // giữ đầu gần thẳng khi thân chúc/ngóc
            damp(P.hp, hp, 7, dt); damp(P.hy, hy + (B.sniff ? 0.25 * Math.sin(t * 5.3) : 0), 6, dt);
            damp(P.tilt, B.tilt || 0, 7, dt);   // nghiêng đầu (quanh trục mõm)
            U.neck.rotation.set(0, P.hy.x * 0.6, P.hp.x * 0.7); U.head.rotation.set(P.tilt.x, P.hy.x * 0.4, P.hp.x * 0.3);
            // tai cụp: lò xo theo nhịp nảy + gió khi chạy (bay ra sau); chú ý thì gốc tai nhích ra trước (B.earT > 0), xoa dịu thì cụp ra sau + dạt 2 bên; giật 1 tai khi đang ngủ
            damp(P.ear, -bob / s * 6 - Math.min(0.7, v * 0.22) + (B.earT || 0) + (B.earH || 0), 14, dt);   // earH: chú ý khi lùa bò (watchTick xoá earT mỗi khung)
            U.ears.forEach((ep, i) => { const sd = i ? 1 : -1; ep.rotation.set(sd * (0.12 + 0.12 * B.shake * Math.sin(t * 28) + Math.max(0, -(B.earT || 0)) * 0.5), 0, P.ear.x + (!i && B.earF ? 0.45 * Math.sin(t * 31) : 0)); });
            // giũ lông: thân xoắn quanh trục dọc ~4,5 lần/giây, đầu theo trước
            if (B.shake > 0) { U.torso.rotation.x = 0.35 * B.shake * Math.sin(t * 28); U.head.rotation.x = P.tilt.x + 0.6 * B.shake * Math.sin(t * 28 + 0.6); } else U.torso.rotation.x = 0;
            // đuôi: lệnh vẫy cho đuôi mềm XPBD (+ lệch sang phải thân khi vui với người quen: B.wagB < 0)
            damp(P.wag, B.wagAmp, 4, dt); damp(P.wagB, B.wagB || 0, 3, dt); U.tail.rotation.y = P.wag.x * Math.sin(t * B.wagF * 6.2832) + P.wagB.x;
            // mắt: chớp 2,5–6,5 s một lần, nhắm khi lim dim / ngủ (trừ lúc hé mắt nhìn người xem) · lưỡi liếm mép (DW.lick)
            if ((DW.blink -= dt) < 0) DW.blink = 2.5 + Math.random() * 4;
            damp(P.eye, B.dozing && !B.wake ? 0.12 : DW.blink < 0.14 ? 0.15 : 1, 30, dt); U.eyes[0].scale.y = U.eyes[1].scale.y = Math.max(0.1, P.eye.x);
            const lk = DW.lick; U.tongue.visible = lk > 0; if (lk > 0) { const u = Math.sin(Math.PI * (1 - lk / 0.45)); U.tongue.position.x = (0.2 + 0.035 * u) * s; U.tongue.rotation.z = 0.9 * u; }
            U.body.scale.y = B.mode === 'lie' && B.doze ? 1 + 0.04 * Math.sin(t * 1.6) : 1;   // thở chậm khi lim dim
          }
          // ---- NGƯỜI XEM ZOOM CẬN CHÓ (G 17/10 "khi close up vào chú chó, research dog behaviour so what it should react then improve") ----
          //  Nghiên cứu: chó nhận ra người đang CHÚ Ý tới mình (hướng mặt, ánh nhìn — Call et al. 2003; Gácsi et al. 2004) và cử động mặt nhiều hơn khi
          //  được nhìn (Kaminski et al. 2017). Với người quen đang nhìn: khựng lại, DỰNG TAI quay đầu nhìn (phản xạ định hướng) → NGHIÊNG ĐẦU (hay gặp khi
          //  chó tập trung vào kích thích có nghĩa — Sommese et al. 2022) → đuôi vẫy LỆCH SANG PHẢI thân (cảm xúc tích cực — Quaranta et al. 2007) →
          //  ngồi nhìn chờ, CÚI CHÀO mời chơi (chó chỉ cúi chào khi bạn chơi đang nhìn mình — Horowitz 2009) hoặc bước lại gần. Bị nhìn chằm chằm lâu:
          //  DẤU HIỆU XOA DỊU — nhìn tránh đi, liếm mép, cụp tai (Firnkes et al. 2017), rồi lại nhìn mềm (nhìn nhau với chủ ⇒ oxytocin — Nagasawa
          //  et al. 2015). Đang ngủ: giật 1 tai, hé mắt ngóc đầu nhìn rồi ngủ tiếp (14 s một lần). Đang chạy vòng / uống / đậu đống củi / dậy: chỉ liếc.
          //  "Cận" = chó dài ≥ 120 px trên màn hình và đầu trong 60% giữa khung ≥ 0,5 s; rời khung > 1,2 s thì thôi ----
          const DW = { seen: 0, off: 9, ep: null, blink: 3, lick: 0 }, _vw = new THREE.Vector3(), _wl = new THREE.Vector3(), _vu = new THREE.Vector3(0, 1, 0);
          let dogLen = 0;
          function watchSeen() {
            if (!dogLen) { const b = new THREE.Box3().setFromObject(dogObj).getSize(_vw); dogLen = Math.max(b.x, b.z); }
            if (!dogObj.visible || dogLen / ((camera.right - camera.left) / camera.zoom / W()) < 120) return false;
            U.head.getWorldPosition(_vw).project(camera); return Math.abs(_vw.x) < 0.6 && Math.abs(_vw.y) < 0.6;
          }
          function viewerPt(away, out) {   // điểm "người xem" cho chó nhìn: từ đầu chó ngược hướng nhìn của máy ảnh (trực giao); away: lệch ngang (rad) để nhìn tránh
            U.head.getWorldPosition(out); camera.getWorldDirection(_vw).negate(); if (away) _vw.applyAxisAngle(_vu, away); return out.addScaledVector(_vw, 3);
          }
          function watchTick(dt, t) {
            B.tilt = 0; B.earT = 0; B.wagB = 0; B.earF = 0; B.wake = false; DW.lick = Math.max(0, DW.lick - dt);
            if (watchSeen()) { DW.seen += dt; DW.off = 0; } else if ((DW.off += dt) > 1.2) { DW.seen = 0; DW.ep = null; }
            const D = dogRain, inBed = D.st === 'in';
            if (D.st && !inBed) { if (DW.ep) DW.ep.kind = 'none'; }   // đang vào / ra xe tránh mưa, tối: không đối đáp
            else if (!DW.ep && DW.seen > 0.5) DW.ep = { kind: inBed || B.st === 'lie' ? (B.dozing ? 'peek' : 'lie') : B.st === 'zoom' || B.st === 'perch' || B.st === 'drink' || B.st === 'getup' || (B.st === 'follow' && B.patAt) ? 'glance' : 'stand',
              k: 0, side: Math.random() < 0.5 ? 1 : -1, act: null, A: dogObj.position.clone(), lk: -1 };
            const E = DW.ep; if (!E || E.kind === 'none') return;
            E.k += dt; const k = E.k;
            if (E.kind === 'glance') { if (k < 1.4 && !B.air) { B.look = viewerPt(0, _wl); B.earT = 0.3; } return; }
            if (E.kind === 'peek') {   // đang ngủ: giật tai → hé mắt → ngóc đầu nhìn → gục xuống ngủ tiếp
              const c = k % 14; B.earF = c < 0.4 ? 1 : 0; B.wake = c > 0.35 && c < 3.6;
              if (c > 0.6 && c < 3.3) { B.headP = -0.12; B.look = viewerPt(0, _wl); B.wagAmp = 0.12; B.wagF = 1.2; dogZzzGroup.visible = false; }
              return;
            }
            // xoa dịu khi bị nhìn lâu (> 9 s): mỗi 7 s nhìn tránh 2,2 s + liếm mép + cụp tai, rồi lại nhìn mềm
            const ap = DW.seen > 9 ? (DW.seen - 9) % 7 : 9, away = ap < 2.2 ? E.side * 0.9 : 0, cyc = DW.seen > 9 ? Math.floor((DW.seen - 9) / 7) : -1;
            if (ap > 0.35 && ap < 2.2 && E.lk !== cyc) { E.lk = cyc; DW.lick = 0.45; }
            const tiltNow = (k > 0.7 && k < 2.2) ? E.side * (k < 1.45 ? 0.34 : -0.34) : (k % 4.5 > 3.6 && ap >= 2.2 ? E.side * 0.3 : 0);   // nghiêng đầu dò xét (trái rồi phải), về sau thỉnh thoảng nghiêng lại
            B.look = viewerPt(away, _wl); B.earT = ap < 2.2 ? -0.3 : 0.3; B.tilt = tiltNow;
            if (E.kind === 'lie') { B.headP = null; B.wake = true; B.wagAmp = ap < 2.2 ? 0.1 : 0.3; B.wagF = 1.8; B.wagB = -0.1; return; }   // nằm: ngẩng nhìn (còn bị nhìn thì không lim dim), đuôi đập đất
            // đứng: khựng lại 0,7 s (đuôi gần như ngừng), dò xét 1,5 s, rồi ngồi chờ / cúi chào mời chơi / bước lại gần
            B.sniff = 0; B.headP = null; B.want = 0; B.shake = Math.max(0, B.shake - dt * 1.2);   // việc chính đang tạm dừng: tự tắt giũ lông
            camera.getWorldDirection(_vw); const vy = yawOf(-_vw.x, -_vw.z);
            if (k < 0.7) { B.mode = 'stand'; B.wagAmp = 0.04; B.wagF = 1; }
            else if (k < 2.2) { B.mode = 'stand'; B.wagAmp = 0.3; B.wagF = 2.2; }
            else {
              if (!E.act) E.act = Math.random() < 0.55 ? 'sit' : Math.random() < 0.55 ? 'bow' : 'come';
              if (E.act === 'come') {   // bước lại gần người xem ~0,9 m rồi ngồi
                B.mode = 'stand'; B.wagAmp = 0.45; B.wagF = 2.6; B.wagB = -0.12;
                if (steer(E.A.x - _vw.x * 0.9, E.A.z - _vw.z * 0.9, 0.6, dt, null, 0.12) || k > 6) E.act = 'sit';
              } else if (E.act === 'bow' && (E.bk = (E.bk || 0) + dt) < 1.5) { B.mode = 'bow'; B.wagAmp = 0.6; B.wagF = 3.4; B.wagB = -0.12; B.earT = 0.35; }   // cúi chào: ngực sát đất, mông cao, đuôi vẫy nhanh
              else { E.act = 'sit'; B.mode = 'sit'; B.wagAmp = ap < 2.2 ? 0.12 : 0.45; B.wagF = 2.6; B.wagB = ap < 2.2 ? 0 : -0.12; }
            }
            if (E.act !== 'come') { let dy = vy - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); if (Math.abs(dy) > 0.7) dogTurn(vy, dt * 2.5); }   // người xem ở sau lưng: xoay cả thân
          }
          // ---- HÀNH VI ----
          const restP = dogLie.clone();
          if (!dogRain.st) { dogObj.position.set(restP.x, cowY(restP.x, restP.z), restP.z); dogObj.rotation.y = yawOf(pf.x - restP.x, pf.z - restP.z) + 0.4; }
          const eng = () => engObj && !engObj.inVan && engObj.phase !== 'van' && engObj.g.parent === scene ? engObj : null;
          const randPt = (r0, r1) => { for (let k = 0; k < 14; k++) { const a = Math.random() * 6.2832, r = r0 + Math.random() * (r1 - r0), x = restP.x + Math.cos(a) * r, z = restP.z + Math.sin(a) * r; if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z)))) continue; if (obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.4) || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3)) continue; if (Math.abs(cowY(x, z) - cowY(restP.x, restP.z)) > 0.7) continue; if (COL.ready && COL_M.dog && colFootHits(x, z, 0, COL_M.dog.a + 0.15, COL_M.dog.a + 0.15, COL_M.dog.lo, COL_M.dog.hi, 7) > 0) continue; return _a.set(x, 0, z).clone(); } return restP.clone(); };   // điểm trống thật trên lớp va chạm (lò chiminea, đống củi… không có trong bảng né)
          function setSt(st, t) { B.st = st; B.k = 0; B.t = t || 0; B.yt = undefined; if (st !== 'perch') { B.pc = null; B.air = false; } }
          let perchS;
          // ---- BẢNG ĐƯỜNG ĐI RIÊNG CỦA CHÓ (G 17/10 "remove its motion đứng 1 chỗ xoay vòng"): bảng DP chung ô 0,6 m dẫn chó về chỗ nằm qua khe 12 cm giữa
          //      lò chiminea và đống củi (cả 2 chưa có trong lưới cấm; chỗ nằm sát vòng tránh bếp lửa nên vùng luôn-mở quanh đích nới tới 2,2 m, trùm cả khe)
          //      ⇒ chó kẹt ở khe, xoay 2 vòng / 6 s. Lớp va chạm dựng xong thì quanh trại (± 40 m) dựng LƯỚI CẤM TỪ VA CHẠM THẬT: ô có ≥ 2/5 điểm chạm vật ở
          //      tầm thân chó (+ nước, nền san) bị cấm, vòng an toàn bếp lửa thì không; quanh đích chỉ mở 0,5 m ⇒ dựng lại bảng về chỗ nằm; bảng tới bát nước /
          //      bãi chạy vòng dựng sau cũng theo lưới này ----
          let dogBlk = null;
          function dogNavBuild() {
            dogBlk = ffBlocked.slice(); const M = COL_M.dog, R0 = 40, i0 = Math.max(0, Math.floor(x2gi(restP.x - R0))), i1 = Math.min(GX - 1, Math.ceil(x2gi(restP.x + R0))), j0 = Math.max(0, Math.floor(z2gj(restP.z - R0))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(restP.z + R0)));
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
              const n = i + j * GX, x = wx(i), z = wz(j), g = cowY(x, z); let k = 0;
              for (const [dx, dz] of [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]]) if (colHit(7, x + dx, z + dz, g + M.lo, g + M.hi)) k++;
              dogBlk[n] = k >= 2 || isWater(i, j) || padH(i, j) !== null ? 1 : 0;
            }
            dogFireField.set(buildFlowField(dogLie.x, dogLie.z, dogBlk, 0.5)); zoomF = drinkF = null;
          }
          function dogPerchSpot() {
            if (perchS !== undefined || !COL.ready) return perchS || null;
            perchS = null; let best = 1e9; const tb = scene.getObjectByName('Bàn trà (Camp Table)'), perchNo = [CAMP_SEAT.pos, FISH_SEAT.pos].concat(tb ? [tb.position] : []);
            for (let dx = -8; dx <= 8; dx += 0.25) for (let dz = -8; dz <= 8; dz += 0.25) {
              const x = restP.x + dx, z = restP.z + dz, y = colTopAt(x, z, 0.3, 0.6, 0.6, 1); if (y === null) continue;
              if (perchNo.some(q => Math.hypot(x - q.x, z - q.z) < 1.0)) continue;   // không nhảy lên ghế, bàn trà của kỹ sư
              // đống củi dựng ngẫu nhiên (khúc gỗ tròn xếp chồng): chọn chỗ 4 góc dấu chân chênh ÍT NHẤT (≤ 25 cm), gần chỗ nằm; mỗi chân tự đặt đúng mặt gỗ
              let dev = 0; for (const [u, w] of [[-0.15, -0.08], [0.15, -0.08], [-0.15, 0.08], [0.15, 0.08]]) { const y2 = colTopAt(x + u, z + w, 0.15, 0.65, 0.6, 1); dev = Math.max(dev, y2 === null ? 9 : Math.abs(y2 - y)); }
              const sc = dev + 0.01 * Math.hypot(dx, dz); if (dev <= 0.25 && sc < best) { best = sc; perchS = new THREE.Vector3(x, y, z); }
            }
            return perchS;
          }
          // xoay tại chỗ có kiểm va chạm: xoay mà thân lấn sâu hơn vào vật (ghế, bàn, xe) thì thôi (core/collide.js)
          function dogTurn(yt, k) {
            let dy = yt - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); const ny = dogObj.rotation.y + dy * Math.min(1, k), M = COL_M.dog;
            if (M && COL.ready && !B.inside) { const p = dogObj.position, mk = M.mask(), h0 = colFH(M, p.x, p.z, -dogObj.rotation.y, mk, 0.08), h1 = colFH(M, p.x, p.z, -ny, mk, 0.08); if (h1 > h0 + 1e-6) return; }
            dogObj.rotation.y = ny;
          }
          // chỗ nằm trống quanh chủ đang ngồi: thử các hướng 2 bên–trước rồi sau, bán kính 1,1–1,7 m; dấu chân lúc nằm (dài thêm 12 cm) không vướng gì
          function dogLieSpot(ep, ey) {
            const M = COL_M.dog; if (!M || !COL.ready) return null;
            for (const R of [1.1, 1.4, 1.7]) for (const a of [0.8, -0.8, 1.3, -1.3, 0.4, -0.4, 1.9, -1.9]) {
              const x = ep.x + Math.sin(ey + a) * R, z = ep.z + Math.cos(ey + a) * R;
              if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || Math.abs(cowY(x, z) - cowY(ep.x, ep.z)) > 0.3) continue;
              if (colFH(M, x, z, Math.atan2(ep.z - z, ep.x - x), 7, 0.12, 0.05, 0.03) > 0 || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r * 0.6)) continue;   // nằm sát đất: thử từ 3 cm (chân lò, thanh ngang ghế)
              return new THREE.Vector3(x, 0, z);
            }
            return null;
          }
          // CHỖ CHẠY VÒNG (zoomies) — G 16/10: vòng cũ quanh bếp lửa luồn qua khe 0,9 m giữa lò chiminea và đống củi, trông như chó xoay mãi một chỗ.
          // Giờ: bãi cỏ trống quanh chỗ nằm (dò 3,5–14 m): dải chạy (bán kính ZR ± 0,6 m) trống trên lưới môi trường (envFree: không vật cản, không nước),
          // ngoài đường, đất chênh ≤ 0,7 m (quanh trại là đất bậc thang: cho qua 1 bậc voxel); TRONG vòng không có vật gì (bản đầu chỉ dò các vòng ⇒ tâm
          // cách gốc táo 0,98 m, chó chạy quanh gốc cây); cách gốc táo ≥ ZR + 1,8, ngoài tán anh đào. Chọn chỗ ít bậc, gần, ngồi ghế cắm trại nhìn
          // thấy (lệch hướng ghế ≤ 1,3 rad), xa tán táo (< 5,4 m thì bị trừ điểm). Tìm 1 lần; không có thì quanh bếp lửa như cũ.
          const ZR = 2.2; let zoomC = null, zoomF = null, starF = null;
          const toStars = () => { B.sg = 0; setSt('stars'); };
          function zoomCenter() {
            if (zoomC) return zoomC;
            const cw = cherryWind && cherryWind.active ? cherryWind : null, obs = [...obstacleCoords, ...ENG_PROPS]; let best = Infinity;
            for (let ring = 3.5; ring <= 14; ring += 0.5) for (let k = 0; k < 36; k++) {
              const a = k / 36 * TAU, cx = restP.x + Math.cos(a) * ring, cz = restP.z + Math.sin(a) * ring, y0 = cowY(cx, cz);
              const ap = appleTrees.reduce((m, T) => Math.min(m, Math.hypot(cx - T.position.x, cz - T.position.z)), 99);
              if (ap < ZR + 1.8 || (cw && Math.hypot(cx - cw.crown.x, cz - cw.crown.z) < ZR + cw.R) || obs.some(o => Math.hypot(cx - o.x, cz - o.z) < o.r + ZR - 0.6)) continue;
              let steps = 0, ok = true;
              for (let q = 0; q < 24 && ok; q++) { const b = q / 24 * TAU; for (const rr of [ZR - 0.6, ZR, ZR + 0.6]) { const x = cx + Math.cos(b) * rr, z = cz + Math.sin(b) * rr, dy = Math.abs(cowY(x, z) - y0); if (!envFree(x, z) || roadContains(x, z, 0.3) || dy > 0.7) { ok = false; break; } if (dy > 0.3) steps++; } }
              if (!ok) continue;
              let rel = Math.atan2(cx - CAMP_SEAT.pos.x, cz - CAMP_SEAT.pos.z) - CAMP_SEAT.yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
              const cost = ring + 0.12 * steps + (Math.abs(rel) < 1.3 ? 0 : 3) + Math.max(0, 5.4 - ap) * 1.2;
              if (cost < best) { best = cost; zoomC = new THREE.Vector3(cx, y0, cz); }
            }
            return zoomC || (zoomC = pf.clone());
          }
          function chooseNext() {
            const E = eng(), hh = liveWeather.localHour;
            if (E && E.walking && Math.random() < 0.6) return setSt('follow', 50 + Math.random() * 60);
            const r = Math.random();
            if (r < 0.22) return setSt('drink');
            if (r < 0.36 && (hh < 9 || hh > 16)) return setSt('zoom', 7 + Math.random() * 3);
            if (r > 0.9 && dogPerchSpot()) return setSt('perch');   // nhảy lên đống củi đứng ngó (G 17/10, bước 3)
            B.n = 3 + Math.floor(Math.random() * 4); setSt('sniff');
          }
          // ---- LÊN / XUỐNG BẬC CỬA XE (G 17/10 "improve dog physic, correct step and movement"): bậc dưới cao 0,25 m (lộ ra chỉ sâu 0,21 m), bậc trên
          //      0,48 m (sâu 0,45 m), sàn xe 0,96 m so với đất — chân chó chỉ dài 0,26 m, mỗi bậc ≈ cả chân. Bản cũ: đứng chờ NGAY CHỖ BẬC (thân xuyên 2 bậc)
          //      rồi 1 vòng cung đất → sàn (bay xuyên bậc). Thử đi bộ lên (mỗi chân đáp đúng mặt bậc): thân dựng ~50°, ngực xuyên mép sàn ⇒ chó nhỏ thật thì
          //      NHẢY: đứng cách mép bậc dưới 0,42 m, quay vào cửa, nhún → BẬT lên bậc trên (đáp gọn 4 chân) → đứng ngó vào → nhún → bật vào sàn xe. Quỹ đạo lên
          //      bậc: LÊN TRƯỚC – TỚI SAU (cao theo 1 − (1 − u)², ngang theo u²) cho bàn chân trước vượt mép bậc / ngưỡng cửa ngay trước mũi; xuống: TỚI TRƯỚC – RƠI SAU
          //      (chân sau qua ngưỡng rồi mới hạ). Thân ngóc khi bật, chúc khi rơi; chân co trong lúc bay. Mặt bậc cho từng bàn chân: stairY ----
          const STEPS = caravanObj.getObjectByName('Bậc cửa có khung đỡ').userData, DOOR = STEPS.door, _sv = new THREE.Vector3();
          const treadTop = STEPS.treads.map(tr => caravanObj.localToWorld(_sv.set(0, tr.y + tr.height / 2, 0)).y);
          function stairY(x, z) {   // mặt đặt chân quanh cửa hông (toạ độ thế giới): đất · bậc dưới · bậc trên · sàn xe
            caravanObj.worldToLocal(_sv.set(x, 0, z));
            if (_sv.z < DOOR.wall + 0.03 && _sv.x > DOOR.x0 && _sv.x < DOOR.x1) return dogInside.y;   // trong xe + ngưỡng cửa
            let y = cowY(x, z);
            if (Math.abs(_sv.x - DOOR.cx) < DOOR.w / 2) STEPS.treads.forEach((tr, i) => { if (Math.abs(_sv.z - tr.z) <= tr.depth / 2) y = Math.max(y, treadTop[i]); });
            return y;
          }
          const doorAxis = m => vanPt(DOOR.cx, 0, DOOR.wall + m / caravanObj.scale.z);   // m: mét tính từ vách cửa ra ngoài, trên trục cửa
          const topTr = STEPS.treads.reduce((a, b) => (b.y + b.height > a.y + a.height ? b : a)), outEdge = STEPS.treads.reduce((m, tr) => Math.max(m, tr.z + tr.depth / 2), 0);
          const dogStairA = doorAxis((outEdge - DOOR.wall) * caravanObj.scale.z + 0.42), dogStairT = doorAxis((topTr.z - DOOR.wall) * caravanObj.scale.z);   // chỗ đứng bật · chỗ đáp trên bậc trên
          function stairHop(D, A, Bp, up, T, dt) {   // 1 cú nhảy A → Bp (đáp đúng mặt bậc / sàn), trả true khi đáp
            const p = dogObj.position; D.t = Math.min(1, D.t + dt / T); const u = D.t, ya = stairY(A.x, A.z), yb = stairY(Bp.x, Bp.z);
            const ux = up ? u * u : 1 - (1 - u) * (1 - u), uy = up ? 1 - (1 - u) * (1 - u) : u * u;
            p.x = A.x + (Bp.x - A.x) * ux; p.z = A.z + (Bp.z - A.z) * ux; p.y = ya + (yb - ya) * uy + Math.sin(Math.PI * u) * (up ? 0.2 : 0.28);   // xuống: vồng cao hơn — chân sau qua mép ngưỡng / bậc rồi mới hạ
            dogObj.rotation.y = yawOf(Bp.x - A.x, Bp.z - A.z); B.want = 0; v = 0; B.air = true; B.mode = 'stand';
            B.slope = up ? 0.55 * (1 - u) * (1 - u) : -0.45 * Math.sin(Math.PI * u);   // ngóc lúc bật · chúc lúc rơi
            dogObj.updateMatrixWorld(true); rig.plant(() => p.y + 0.04 * Math.sin(Math.PI * u));   // chân co lên trong lúc bay
            if (u >= 1) { B.air = false; B.slope = 0; D.t = 0; ground = stairY; rig.plant(stairY); return true; }
            return false;
          }
          function faceTo(q, dt) { let dy = yawOf(q.x - dogObj.position.x, q.z - dogObj.position.z) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dogObj.rotation.y += dy * Math.min(1, dt * 7); return Math.abs(dy) < 0.06; }
          // ---- LÙA BÒ VỀ CHUỒNG KHI MƯA (G 21/10 "Em do research dog behaviour khi trời mưa em cho chó ra lùa bò về chuồng") ----
          //  Nghiên cứu (thi chó chăn gia súc — AKC; Grandin: vùng bỏ chạy + điểm cân bằng; chó trang trại NZ — Te Ara): chó gom đàn 3 bước —
          //   · OUTRUN: chạy vòng RỘNG ra sau đàn, ngoài vùng bỏ chạy của bò (đàn không hoảng); vòng phía ít vướng (sông) hơn.
          //   · LIFT: dừng ở ĐIỂM CÂN BẰNG — phía đối diện chỗ muốn đưa đàn về — khom người, cúi đầu "nhìn" đàn (border collie "eye"), rồi bước vào ⇒ đàn khởi đi êm.
          //   · FETCH: bám sau con cuối đoàn ở mép vùng bỏ chạy (~5 m), lắc qua lại 2 bên (wearing) giữ đàn gọn; ép sát ⇒ bò bước nhanh hơn, lùi ra ⇒ chậm lại
          //     (Grandin: người / chó đứng sau điểm cân bằng ở vai thì bò tiến; vào quá sâu thì bò quay đầu chạy loạn ⇒ cách vai < 2,2 m thì đứng lại). Bò đi theo
          //     con trước (nhìn nhau mà đi) ⇒ con đứng gần đoàn đang đi / bị chó lấn < 4 m thì nhập đoàn. Chó huntaway SỦA đẩy đàn (heading dog thì im): chó
          //     nhỏ ở đây sủa khi con cuối chững lại / còn nằm, thỉnh thoảng sủa giục ("Gâu!" bay lên, hất đầu).
          //  Xong: nằm canh trước chuồng tới khi bò vào ô, rồi chạy về xe; tới bậc cửa GIŨ NƯỚC (~4,5 lần/giây, 1,4 s — chó cỡ Labrador lắc ~4,3 Hz, Dickerson & Hu,
          //  Georgia Tech) rồi mới nhảy vào. Đường xa: bảng DP trên lưới của bò (mặt đập = cầu) ⇒ sang được bãi bên kia sông; vòng 2 phút chưa tới nhóm /
          //  8 phút cả lượt ⇒ để bò tự về. Mưa tạnh giữa chừng: thôi, về chỗ nằm (herdHome) ----
          const H = { ph: null, k: 0, tot: 0, grp: [], C: new THREE.Vector3(), Bp: new THREE.Vector3(), Rg: 0, R: 0, dir: 0, F: null, FB: null, fb: 0, pt: 0, px: 0, pz: 0, L: null, LF: null, sx: 0, sz: 0, st: 0, push: 0, nb: 0, used: false, homeF: null, vanF: null };
          const herdIdx = (x, z) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return i < 0 || j < 0 || i >= GX || j >= GZ ? -1 : i + j * GX; };
          const herdWalk = (x, z) => { const n = herdIdx(x, z); return n >= 0 && !cowBlocked[n]; };
          const herdOut = c => !c.dam && !c.herd && c.mode !== 'home' && Math.hypot(c.x - cowHut.door.x, c.z - cowHut.door.z) >= 10;
          const hutD = c => { const n = herdIdx(c.x, c.z); return n < 0 ? 65535 : hutField[n]; };
          const herdClear = (ax, az, bx, bz) => { const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5); for (let k = 1; k < n; k++) if (!herdWalk(ax + (bx - ax) * k / n, az + (bz - az) * k / n)) return false; return true; };
          const wetLine = (ax, az, bx, bz) => { const n = Math.ceil(Math.hypot(bx - ax, bz - az) / 1.5); for (let k = 1; k < n; k++) if (isWater(Math.round(x2gi(ax + (bx - ax) * k / n)), Math.round(z2gj(az + (bz - az) * k / n)))) return true; return false; };
          cowHerd.avail = () => liveWeather.wildlifeAwake && !skyWatch.dogWant() && (!dogRain.st || dogRain.st === 'toFire' || dogRain.st === 'toDoor' || dogRain.st === 'herd') && cows.some(herdOut);
          const barkSp = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d');
            x.font = 'bold 40px Outfit, sans-serif'; x.fillStyle = '#E2D6C0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#243240'; x.shadowBlur = 6; x.fillText('Gâu!', 64, 34);
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, depthWrite: false })); sp.name = 'Gâu (chó sủa)'; sp.visible = false; sp.userData.noBatch = true; scene.add(sp); return sp; })();
          function herdBark() { if ((B.barkK || 0) > 0) return; B.barkK = 0.7; H.nb = 7 + Math.random() * 7; }
          function herdStart() { H.used = true; H.tot = 0; H.ph = 'alert'; H.k = 0; H.L = null; H.nb = 4 + Math.random() * 4; cowHerd.on = true; }
          function herdEnd() { H.used = false; H.ph = null; H.F = H.FB = H.LF = null; cowHerd.on = cowHerd.done = false; for (const c of cows) { c.herd = false; c.push = 1; c.htr = null; } }   // mưa tạnh: bò lại tự do
          function herdDone() { H.ph = null; H.F = H.FB = H.LF = null; cowHerd.on = false; cowHerd.done = true; for (const c of cows) { c.herd = true; c.push = 1; c.htr = null; } dogRain.st = 'toDoor'; dogRain.wet = true; }
          function herdPick() {   // nhóm kế: con ngoài bãi gần chó nhất (khác bờ sông thì cộng 60 m) + các con cùng bờ cách nó ≤ 16 m
            const p = dogObj.position, out = cows.filter(herdOut); if (!out.length) return false;
            let S = out[0], bd = Infinity; for (const c of out) { const d = Math.hypot(c.x - p.x, c.z - p.z) + (wetLine(p.x, p.z, c.x, c.z) ? 60 : 0); if (d < bd) { bd = d; S = c; } }
            const G = H.grp = out.filter(c => c === S || (Math.hypot(c.x - S.x, c.z - S.z) <= 16 && !wetLine(c.x, c.z, S.x, S.z))), C = H.C.set(0, 0, 0);
            for (const c of G) { C.x += c.x / G.length; C.z += c.z / G.length; }
            H.Rg = Math.max(2, ...G.map(c => Math.hypot(c.x - C.x, c.z - C.z)));
            const f = ffDir(hutField, C.x, C.z), fx = f ? f.x : cowHut.door.x - C.x, fz = f ? f.z : cowHut.door.z - C.z, fl = Math.hypot(fx, fz) || 1;   // hướng đàn sẽ đi (về chuồng)
            for (const r of [H.Rg + 6, H.Rg + 4, H.Rg + 2.5]) { H.Bp.set(C.x - fx / fl * r, 0, C.z - fz / fl * r); if (herdWalk(H.Bp.x, H.Bp.z)) break; }   // điểm cân bằng: sau đàn, ngược hướng về
            H.R = Math.min(22, H.Rg + 7); H.dir = 0; H.F = buildFlowField(C.x, C.z, cowBlocked); H.FB = null; H.fb = H.pt = 0; H.px = p.x; H.pz = p.z; H.ph = 'outrun'; H.k = 0;
            return true;
          }
          function herdLift() { for (const c of H.grp) { c.herd = true; c.htr = [c.x, c.z]; if (c.restY > 0.3) herdBark(); } H.ph = 'fetch'; H.k = 0; H.F = H.FB = null; }   // cả nhóm khởi đi (bê theo mẹ: c.dam.herd)
          function herdTick(dt, t) {
            const p = dogObj.position; H.k += dt; H.tot += dt; ground = cowY; B.inside = false; B.earH = 0.25; B.wagAmp = 0.08; B.wagF = 1.3;
            if (H.tot > 480) { herdDone(); return; }
            if (H.ph !== 'alert') for (const c of cows) if (herdOut(c) && Math.hypot(c.x - p.x, c.z - p.z) < 4) { c.herd = true; c.htr = [c.x, c.z]; }   // chó lấn vào vùng bỏ chạy ⇒ con đó khởi đi
            if (H.ph === 'alert') {   // nghe mưa: đứng dậy, dỏng tai nhìn về phía bãi bò
              B.want = 0; B.earH = 0.45; let q = null, qd = Infinity; for (const c of cows) if (herdOut(c)) { const d = Math.hypot(c.x - p.x, c.z - p.z); if (d < qd) { qd = d; q = c; } }
              if (q) B.look = _hp.set(q.x, cowY(q.x, q.z) + 1, q.z);
              if (H.k > 0.9 && !herdPick()) { H.ph = 'fetch'; H.k = 0; }
              return;
            }
            if (H.ph === 'outrun') {
              const C = H.C, dc = Math.hypot(p.x - C.x, p.z - C.z);
              B.look = _hp.set(C.x, cowY(C.x, C.z) + 0.8, C.z); B.wagAmp = 0.1; B.wagF = 1.2;
              if (H.grp.some(c => c.herd || c.mode === 'home') || H.k > 120) { herdLift(); return; }   // nhóm đã khởi đi / vòng mãi không tới: cho đi luôn
              if (dc > H.R + 5) { steer(C.x, C.z, 3.0, dt, H.F, 0.5); return; }
              const a = Math.atan2(p.z - C.z, p.x - C.x), ab = Math.atan2(H.Bp.z - C.z, H.Bp.x - C.x), da = Math.atan2(Math.sin(ab - a), Math.cos(ab - a));
              if (Math.abs(da) < 0.3 || Math.hypot(p.x - H.Bp.x, p.z - H.Bp.z) < 2.5) { H.ph = 'lift'; H.k = 0; return; }
              const span = s => s * da > 0 ? Math.abs(da) : TAU - Math.abs(da);
              if (!H.dir) { const cost = s => { let n = 0; for (let q = 1; q <= 8; q++) { const b = a + s * span(s) * q / 8; if (!herdWalk(C.x + Math.cos(b) * H.R, C.z + Math.sin(b) * H.R)) n++; } return n * 10 + span(s); }; H.dir = cost(1) <= cost(-1) ? 1 : -1; }   // vòng phía ít vướng, bằng thì cung ngắn
              if ((H.pt += dt) > 3) { if (Math.hypot(p.x - H.px, p.z - H.pz) < 1) H.fb = 5; H.px = p.x; H.pz = p.z; H.pt = 0; }   // 3 s không tiến được (vướng chuồng, máng) ⇒ đi theo bảng DP 5 s
              const b0 = a + H.dir * Math.min(0.75, span(H.dir)); let tx = 0, tz = 0, ok = false;
              if ((H.fb = Math.max(0, H.fb - dt)) <= 0) for (const st of [0, 0.35, 0.7]) { for (const r of [H.R, H.R * 0.75, H.R * 1.25]) { const b = b0 + H.dir * st; tx = C.x + Math.cos(b) * r; tz = C.z + Math.sin(b) * r; if (herdWalk(tx, tz) && herdClear(p.x, p.z, tx, tz)) { ok = true; break; } } if (ok) break; }
              if (ok) steer(tx, tz, 2.8, dt, null, 0.3);
              else steer(H.Bp.x, H.Bp.z, 2.8, dt, H.FB || (H.FB = buildFlowField(H.Bp.x, H.Bp.z, cowBlocked)), 0.3);   // vòng cung bị chặn: bảng DP tới điểm cân bằng
              return;
            }
            if (H.ph === 'lift') {   // khom người, cúi đầu nhìn đàn ~1 s, rồi bước vào
              B.want = 0; B.mode = 'stalk'; B.headP = -0.42; B.wagAmp = 0.02; B.earH = 0.45; B.look = _hp.set(H.C.x, cowY(H.C.x, H.C.z) + 0.6, H.C.z); dogTurn(yawOf(H.C.x - p.x, H.C.z - p.z), dt * 4);
              if (H.k > 1.1) herdLift();
              return;
            }
            if (H.ph === 'hold') {   // nằm canh trước chuồng, mặt nhìn cửa, tới khi bò vào ô hết (≤ 40 s); sát con nào thì lùi ra trước
              B.look = _hp.set(cowHut.door.x, cowHut.y + 0.8, cowHut.door.z); B.headP = 0.02; B.wagAmp = 0.06; B.wagF = 1.2;
              let nc = null, nd = 4; for (const c of cows) { const d = Math.hypot(c.x - p.x, c.z - p.z); if (d < nd) { nd = d; nc = c; } }
              if (nc) { B.mode = 'stand'; steer(p.x + (p.x - nc.x) / (nd || 1) * 3, p.z + (p.z - nc.z) / (nd || 1) * 3, 1.0, dt, null, 0.2); H.k = Math.min(H.k, 0.5); }
              else { B.want = 0; B.mode = H.k > 0.8 ? 'lie' : 'stand'; }
              if (cows.some(herdOut)) { if (!herdPick()) H.ph = 'fetch'; return; }
              if (H.k > 40 || !cows.some(c => c.mode === 'home' && c.leg !== 'in')) herdDone();
              return;
            }
            // ---- FETCH: bám sau con cuối đoàn theo vết chân của nó ----
            const go = cows.filter(c => (c.herd || (c.dam && c.dam.herd)) && c.mode === 'home' && c.leg === 'door');
            for (const c of cows) if (herdOut(c) && go.some(o => Math.hypot(o.x - c.x, o.z - c.z) < 9)) { c.herd = true; c.htr = [c.x, c.z]; }   // đứng gần đoàn đang đi ⇒ nhập đoàn
            for (const c of go) { const tr = c.htr || (c.htr = [c.x, c.z]), n = tr.length; if (Math.hypot(c.x - tr[n - 2], c.z - tr[n - 1]) > 0.5) { tr.push(c.x, c.z); if (tr.length > 60) tr.splice(0, 2); } }   // vết chân (≤ 15 m)
            for (const c of cows) if (!go.includes(c)) c.push = 1;
            if (!go.length) { if (!herdPick()) { H.ph = 'hold'; H.k = 0; } return; }
            let L = go.includes(H.L) ? H.L : go[0]; for (const c of go) if (hutD(c) > hutD(L) + (L === H.L ? 5 : 0)) L = c;   // con xa chuồng nhất theo đường đi = cuối đoàn (đổi con khi xa hơn hẳn 3 m — khỏi chạy qua lại)
            if (H.L !== L) { H.L = L; H.LF = null; H.sx = L.x; H.sz = L.z; H.st = 0; }
            if ((H.st += dt) > 3) { if (Math.hypot(L.x - H.sx, L.z - H.sz) < 0.4 && L.restY < 0.05) { herdBark(); H.push = 2.5; } H.sx = L.x; H.sz = L.z; H.st = 0; }   // chững lại ⇒ sủa + áp sát
            if ((H.nb -= dt) <= 0) herdBark();   // sủa giục
            H.push = Math.max(0, H.push - dt);
            const db = H.push > 0 ? 2.8 : 5, tr = L.htr;   // điểm bám: lùi theo vết chân con cuối db mét
            let px = L.x, pz = L.z, acc = 0, tx = L.x, tz = L.z, dx = 0, dz = 0;
            for (let i = tr.length - 2; i >= 0; i -= 2) { const qx = tr[i], qz = tr[i + 1], sl = Math.hypot(px - qx, pz - qz); if (sl < 1e-3) continue; dx = px - qx; dz = pz - qz;
              if (acc + sl >= db) { const u = (db - acc) / sl; tx = px + (qx - px) * u; tz = pz + (qz - pz) * u; acc = db; break; } acc += sl; tx = qx; tz = qz; px = qx; pz = qz; }
            if (acc < db) { const f = ffDir(hutField, L.x, L.z); if (f) { const ex = tx - f.x * (db - acc), ez = tz - f.z * (db - acc); if (herdWalk(ex, ez)) { tx = ex; tz = ez; } if (!dx && !dz) { dx = f.x; dz = f.z; } } }   // vết còn ngắn: lùi thêm ngược hướng về chuồng
            const dl = Math.hypot(dx, dz);
            if (dl > 1e-3 && !damWalkAt(tx, tz)) { const w = 1.6 * Math.sin(t * 0.7), wx2 = tx - dz / dl * w, wz2 = tz + dx / dl * w; if (herdWalk(wx2, wz2)) { tx = wx2; tz = wz2; } }   // lắc 2 bên (wearing), trên mặt đập thì thôi
            const dT = Math.hypot(tx - p.x, tz - p.z), dL = Math.hypot(L.x - p.x, L.z - p.z), vL = L.spd * (L.push || 1);
            for (const c of go) { const d = Math.hypot(c.x - p.x, c.z - p.z); c.push = 1 + 0.45 * Math.max(0, Math.min(1, (8 - d) / 4)); }   // áp lực: chó trong 8 m ⇒ bò bước nhanh dần
            B.look = _hp.copy(L.g.position).setY(L.g.position.y + 0.9); B.headP = -0.12; B.mode = 'stand';
            if (dL < 2.2) { B.want = 0; dogTurn(yawOf(L.x - p.x, L.z - p.z), dt * 3); return; }   // sát vai bò: đứng lại cho bò đi
            steer(tx, tz, dT > 4 ? 2.6 : dT > 1.5 ? Math.max(1.0, vL * 1.3) : Math.max(0.4, vL * 0.9), dt, dT > 14 ? (H.LF || (H.LF = buildFlowField(L.x, L.z, cowBlocked))) : null, 0.3);
          }
          function shelterTick(dt, t) {   // mưa / tối: vào xe nằm gầm bàn vuông (tới cửa → đứng trước bậc → đi bộ lên bậc → giường)
            const D = dogRain, p = dogObj.position, rain = liveWeather.state.raining, night = !liveWeather.wildlifeAwake, want = rain || (night && !skyWatch.dogWant());   // chủ nằm ngắm sao: đêm cũng ra nằm cạnh
            B.earH = 0;
            if (!rain && H.used) herdEnd();
            if (rain && !night && (!D.st || D.st === 'toFire' || D.st === 'toDoor') && !cowHerd.done && cowHerd.avail()) { D.st = 'herd'; herdStart(); }   // mưa ban ngày, bò còn ngoài bãi: đi lùa trước
            if (want && (!D.st || D.st === 'toFire')) D.st = 'toDoor';
            else if (!want && D.st) { if (D.st === 'toDoor') D.st = 'toFire'; else if (D.st === 'toBed' || D.st === 'in') D.st = 'toExit'; else if (D.st === 'herd') { D.st = null; setSt('herdHome'); } }
            if (!D.st) { dogZzzGroup.visible = false; B.inside = false; return false; }
            B.look = null; B.headP = null; B.sniff = 0; B.shake = 0; B.mode = 'stand';
            if (D.st === 'herd') { dogZzzGroup.visible = false; B.doze = B.dozing = false; herdTick(dt, t); return true; }
            const floorY = dogInside.y;
            if (D.st === 'toDoor') { B.inside = false; ground = cowY; const dd = Math.hypot(p.x - dogDoorFar.x, p.z - dogDoorFar.z), n = herdIdx(p.x, p.z);   // từ chuồng bò về: chạy nước kiệu; ngoài vùng bảng về cửa (bên kia sông) ⇒ bảng trên lưới của bò
              if (steer(dogDoorFar.x, dogDoorFar.z, dd > 8 ? 2.4 : 1.5, dt, n >= 0 && dogDoorField[n] < 65535 ? dogDoorField : (H.vanF || (H.vanF = buildFlowField(dogDoorFar.x, dogDoorFar.z, cowBlocked))), 0.1)) D.st = 'toStep'; }
            else if (D.st === 'toStep') { if (steer(dogStairA.x, dogStairA.z, 0.8, dt, null, 0.06)) { if (D.wet) { D.st = 'shakeOff'; D.t = 0; D.wet = false; } else { D.st = 'stairIn'; D.ph = 'face'; D.t = 0; } } }
            else if (D.st === 'shakeOff') { B.want = 0; D.t += dt; B.shake = D.t < 1.4 ? 1.2 * Math.min(1, D.t * 5) : 0; B.headP = -0.05; if (D.t > 1.7) { D.st = 'stairIn'; D.ph = 'face'; D.t = 0; } }   // lùa bò về ướt sũng: giũ nước trước bậc cửa
            else if (D.st === 'stairIn' || D.st === 'stairOut') {   // quay vào trục cửa → nhún → bật → đáp bậc trên, ngó → nhún → bật (lên: vào sàn · xuống: ra đất)
              const inn = D.st === 'stairIn', Tg = [dogStairT, inn ? dogInside : dogStairA], k = D.ph;
              B.want = 0; v = 0; ground = stairY; B.inside = !inn ? (k === 'face' || k === 'crouch1' || k === 'hop1') : (k === 'hop2' && D.t > 0.4);
              if (k === 'face') { B.mode = 'stand'; D.t += dt; if (faceTo(inn ? dogInside : dogStairA, dt) || D.t > 0.8) { D.ph = 'crouch1'; D.t = 0; } }
              else if (k === 'crouch1' || k === 'crouch2') { B.mode = 'crouch'; D.t += dt; if (D.t > (k === 'crouch1' ? 0.32 : 0.24)) { D.ph = k === 'crouch1' ? 'hop1' : 'hop2'; D.t = 0; D.A = p.clone(); } }
              else if (k === 'hop1' || k === 'hop2') { if (stairHop(D, D.A, Tg[k === 'hop1' ? 0 : 1], inn, inn ? (k === 'hop1' ? 0.42 : 0.46) : (k === 'hop1' ? 0.38 : 0.4), dt)) { if (k === 'hop1') { D.ph = 'look'; D.t = 0; } else { D.st = inn ? 'toBed' : 'toFire'; ground = inn ? () => floorY : cowY; B.inside = inn; } } return true; }
              else { B.mode = 'stand'; D.t += dt; B.look = _hp.copy(inn ? dogInside : dogStairA).setY(inn ? dogInside.y + 0.3 : cowY(dogStairA.x, dogStairA.z) + 0.2); faceTo(inn ? dogInside : dogStairA, dt); if (D.t > 0.42) { D.ph = 'crouch2'; D.t = 0; } }   // đứng trên bậc trên ngó vào / ngó xuống
            }
            else if (D.st === 'toBed') { B.inside = true; ground = () => floorY; if (steer(dogBed.x, dogBed.z, 0.6, dt, null, 0.08)) D.st = 'in'; }
            else if (D.st === 'toExit') { B.inside = true; ground = () => floorY; if (steer(dogInside.x, dogInside.z, 0.6, dt, null, 0.08)) { D.st = 'stairOut'; D.ph = 'face'; D.t = 0; } }
            else if (D.st === 'toFire') { B.inside = false; ground = cowY; if (skyWatch.dogWant()) { D.st = null; toStars(); return false; } if (steer(dogLie.x, dogLie.z, 1.2, dt, dogFireField, 0.1)) { D.st = null; setSt('circle'); return false; } }
            else {   // 'in': nằm gầm bàn vuông, mặt nhìn ra cửa; tối thì ngủ (gục mõm, thở chậm, Zzz)
              B.inside = true; ground = () => floorY; B.want = 0; B.mode = 'lie';
              let dy = yawOf(dogInside.x - dogBed.x, dogInside.z - dogBed.z) - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); dogObj.rotation.y += dy * Math.min(1, dt * 2);
            }
            const sleeping = D.st === 'in' && night;
            B.doze = sleeping; B.dozing = sleeping; B.headP = sleeping ? -0.5 : D.st === 'in' ? 0.05 : null; B.wagAmp = sleeping ? 0.25 : 0.2; B.wagF = sleeping ? 0 : 3;
            dogZzzGroup.visible = sleeping;
            if (sleeping) { U.head.getWorldPosition(_dogHead); for (const z of dogZzz) { const k = (t * 0.32 + z.ph) % 1; z.m.position.set(_dogHead.x + Math.sin(t * 1.7 + z.ph * 6) * 0.07, _dogHead.y + 0.12 + k * 1.3, _dogHead.z); z.m.material.opacity = 0.9 * Math.min(1, (1 - k) * 2.6); z.m.scale.setScalar(0.15 + k * 0.28); } }
            if (B.want > 0 && v < 0.9 && gait !== 'walk') gait = 'walk';
            return true;
          }
          function behave(dt, t) {
            const E = eng(), p = dogObj.position; B.k += dt; B.t -= dt; B.look = null; B.headP = null; B.sniff = 0; B.dozing = false; B.shake = Math.max(0, B.shake - dt * 1.2);
            const petting = engObj && (engObj.phase === 'toDog' || engObj.phase === 'pet');
            if (B.st !== 'stars' && !B.pc && skyWatch.dogWant()) toStars();
            switch (B.st) {
              case 'stars': {   // chủ nằm ngắm sao (engineer/tasks/sky-watch.js): tới chỗ sát thảm phía không có kính → quay song song chủ → nằm lim dim; sao băng thì ngẩng nhìn theo, đuôi đập đất
                const Q = skyWatch.dogSpot(); if (!Q || !skyWatch.dogWant()) { setSt('return'); break; }
                if (!B.sg) { const d = Math.hypot(Q.x - p.x, Q.z - p.z); B.mode = 'stand'; B.wagAmp = 0.35; B.wagF = 2.4; if (E) B.look = _hp.copy(E.g.position).setY(E.g.position.y + 0.4);
                  if (steer(Q.x, Q.z, d > 3 ? 1.5 : 0.7, dt, d > 2 ? (starF && starF.q === Q ? starF.f : (starF = { q: Q, f: dogBlk ? buildFlowField(Q.x, Q.z, dogBlk, 0.5) : buildFlowField(Q.x, Q.z) }).f) : null, 0.1) || B.k > 60) { B.sg = 1; B.k = 0; }
                  break; }
                if (B.sg === 1) { B.mode = 'stand'; B.want = 0; dogTurn(Q.yaw, dt * 3); let dy = Q.yaw - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); if (Math.abs(dy) < 0.12 || B.k > 2) { B.sg = 2; B.k = 0; B.doze = 4; } break; }
                B.mode = 'lie'; B.want = 0;
                if ((B.doze -= dt) < -9 - Math.random() * 8) B.doze = 14 + Math.random() * 22;
                const pt = skyWatch.state.pt;
                if (pt && pt.dir) { B.look = _hp.copy(p).addScaledVector(pt.dir, 6); B.wagAmp = 0.35; B.wagF = 2.6; }
                else if (B.doze > 0) { B.headP = -0.45; B.wagAmp = 0.03; B.wagF = 1; B.dozing = true; }
                else { if (E) B.look = E.head.getWorldPosition(_hp); B.wagAmp = 0.18; B.wagF = 1.8; }
                break;
              }
              case 'lie': {   // nằm sưởi cạnh bếp lửa: lúc ngẩng nhìn quanh / nhìn chủ, lúc gục mõm lim dim
                B.mode = 'lie'; B.want = 0;
                if ((B.doze -= dt) < -14 - Math.random() * 10) B.doze = 8 + Math.random() * 14;
                const near = E && E.g.position.distanceTo(p) < 5;
                if (B.doze > 0 && !near && !petting) { B.headP = -0.45; B.wagAmp = 0.03; B.wagF = 1; B.dozing = true; }
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
                if (!B.hasTgt) { B.tgt.copy(randPt(1.5, 6)); B.hasTgt = true; B.pause = 0; B.tk = 0; }
                if (B.pause <= 0 && (B.tk += dt) > 12) { B.hasTgt = false; if (--B.n <= 0) setSt('return'); }   // 12 s chưa tới (bị vật chắn): đánh hơi chỗ khác — trước đây xoay mãi cạnh lò chiminea
                else if (B.pause > 0) { B.pause -= dt; B.want = 0; B.headP = -0.75; if (B.pause <= 0) { B.hasTgt = false; if (--B.n <= 0) setSt('return'); } }
                else if (steer(B.tgt.x + Math.sin(t * 1.3) * 0.25, B.tgt.z + Math.cos(t * 1.1) * 0.25, 0.5, dt, null, 0.3)) B.pause = 1.5 + Math.random() * 2.5;
                if (E && E.walking && E.g.position.distanceTo(p) < 4 && Math.random() < dt * 0.05) setSt('follow', 40 + Math.random() * 40);
                break;
              }
              case 'drink': {   // tới bát nước cạnh bậc cửa xe, cúi uống (liếm nước ~3 lần/giây)
                B.mode = 'stand';
                if (B.k < 60 && !B.atBowl) { if (steer(drinkP.x, drinkP.z, 1.0, dt, drinkF || (drinkF = dogBlk ? buildFlowField(drinkP.x, drinkP.z, dogBlk, 0.5) : buildFlowField(drinkP.x, drinkP.z)), 0.08)) { B.atBowl = true; B.k = 0; } B.wagAmp = 0.15; B.wagF = 2; }
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
                // còn xa bãi: theo bảng DP tới tâm vòng (vòng qua ghế, bàn trà — đi thẳng thì lách vào khe 10 cm giữa ghế và bàn, kẹt ở đó cả phút)
                if (dc > ZR + 1.5) steer(C.x, C.z, 2.9, dt, zoomF || (zoomF = dogBlk ? buildFlowField(C.x, C.z, dogBlk, 0.6) : buildFlowField(C.x, C.z)), 0.05);
                if (B.k < dt * 1.5 || dc < B.zd - 0.3) { B.zd = dc; B.zt = 0; } else if ((B.zt += dt) > 4 && dc > ZR + 1.5) { setSt('return'); break; }   // 4 s chạy ra mà không lại gần bãi (kẹt cạnh xe, bậc cửa): thôi chơi
                else steer(C.x + Math.cos(a) * ZR, C.z + Math.sin(a) * ZR, 2.9, dt, null, 0.05);
                if (B.t <= 0 || B.k > 25) setSt('return');
                break;
              }
              case 'follow': {   // đi theo chủ: giữ ~1,6 m phía sau–bên; xa thì chạy nước kiệu / phi; chủ đứng yên thì ngồi nhìn
                if (!E || B.t <= 0) { B.patAt = null; setSt('return'); break; }
                const ep = E.g.position, ey = E.g.rotation.y, fx = Math.sin(ey), fz = Math.cos(ey), d = Math.hypot(ep.x - p.x, ep.z - p.z);
                if (B.patAt) {   // chủ gọi lại xoa đầu (engineer/mind/reactions.js): tới trước mặt chủ, ngồi ngẩng nhìn, đuôi vẫy tít
                  B.t = Math.max(B.t, 3); B.look = _hp.copy(ep).setY(ep.y + 1.2); B.wagAmp = engPetting ? 0.75 : 0.55; B.wagF = engPetting ? 3.4 : 2.8;
                  B.patReady = steer(B.patAt.x, B.patAt.z, 0.9, dt, null, 0.12);
                  if (B.patReady) { B.want = 0; B.mode = 'sit'; dogTurn(yawOf(ep.x - p.x, ep.z - p.z), dt * 4); }
                  else B.mode = 'stand';
                  break;
                }
                // chủ ngồi ghế: nằm ở 1 chỗ TRỐNG quanh chủ (trước đây nằm theo chủ 1,3 m sau lưng = sau ghế cắm trại ⇒ nằm đè ghế, bàn trà — G 17/10 đo 284 lần)
                let tx = ep.x - fx * 1.3 + fz * 0.55, tz = ep.z - fz * 1.3 - fx * 0.55;
                const seated = !!E.seat && E.seat.st === 'seated';
                if (seated) { if (B.lieAt === null || B.lieAt === undefined) B.lieAt = dogLieSpot(ep, ey) || false; if (B.lieAt) { tx = B.lieAt.x; tz = B.lieAt.z; } } else B.lieAt = null;
                B.look = _hp.copy(ep).setY(ep.y + 1.2); B.wagAmp = 0.45; B.wagF = 2.6;
                if (E.walking || d > 2.2 || (B.lieAt && Math.hypot(tx - p.x, tz - p.z) > 0.25)) { B.mode = 'stand'; steer(tx, tz, d > 4.5 ? 2.6 : d > 2.4 ? 1.6 : Math.max(0.5, E.vel || 0.7), dt, null, B.lieAt ? 0.1 : 0.25); }
                else { B.want = 0; B.mode = E.seat ? 'lie' : 'sit'; dogTurn(yawOf(ep.x - p.x, ep.z - p.z), dt * 3); }
                break;
              }
              case 'herdHome': {   // mưa tạnh giữa lúc lùa bò: về trại theo bảng DP trên lưới của bò (qua được mặt đập), gần trại thì như 'return'
                B.mode = 'stand'; B.wagAmp = 0.25; B.wagF = 2;
                if (p.distanceTo(restP) < 12 || B.k > 180) { setSt('return'); break; }
                steer(restP.x, restP.z, 1.8, dt, H.homeF || (H.homeF = buildFlowField(restP.x, restP.z, cowBlocked)), 0.5);
                break;
              }
              case 'return': {   // về chỗ nằm cạnh bếp lửa
                B.mode = 'stand'; B.wagAmp = 0.15; B.wagF = 2;
                if (steer(restP.x, restP.z, p.distanceTo(restP) > 3 ? 1.3 : 0.7, dt, p.distanceTo(restP) > 2 ? dogFireField : null, 0.12)) { setSt('circle'); }
                break;
              }
              case 'perch': {   // NHẢY LÊN ĐỐNG CỦI: tới mép, nhún, bật vòng cung lên đỉnh (mặt đứng đo trên lớp va chạm), đứng / ngồi ngó quanh, nhảy xuống bên kia
                const S0 = dogPerchSpot(); if (!S0) { setSt('return'); break; }
                const Q = B.pc || (B.pc = { st: 'go', k: 0, A: new THREE.Vector3(), Bp: new THREE.Vector3() });
                Q.k += dt; B.wagAmp = 0.35; B.wagF = 2.4;
                if (Q.st === 'go') {   // điểm bật: cách tâm đỉnh 0,6 m về phía chó đang đứng
                  if (Q.k < dt * 1.5) {   // điểm bật = chỗ gần nhất (từ 0,45 m ra) mà thân chó quay vào đống củi không vướng
                    const dx = p.x - S0.x, dz = p.z - S0.z, l = Math.hypot(dx, dz) || 1, M = COL_M.dog; let r = 0.45;
                    while (r < 1.6 && M && colFH(M, S0.x + dx / l * r, S0.z + dz / l * r, Math.atan2(-dz, -dx), 7) > 0) r += 0.05;
                    Q.A.set(S0.x + dx / l * r, 0, S0.z + dz / l * r);
                  }
                  B.mode = 'stand'; B.look = _hp.set(S0.x, S0.y + 0.2, S0.z);
                  if (steer(Q.A.x, Q.A.z, 0.8, dt, null, 0.08)) { Q.st = 'aim'; Q.k = 0; }
                  else if (Q.k > 25) { B.pc = null; setSt('return'); }
                } else if (Q.st === 'aim') { B.want = 0; dogTurn(yawOf(S0.x - p.x, S0.z - p.z), dt * 6); B.mode = Q.k > 0.25 ? 'bow' : 'stand'; if (Q.k > 0.5) { Q.st = 'jump'; Q.k = 0; Q.A.copy(p); Q.y0 = p.y; } }   // nhún trước khi bật
                // bay: vòng cung từ điểm bật tới đỉnh (lên) / từ đỉnh xuống đất; đáp lên đỉnh thì mỗi bàn chân đặt đúng mặt khúc gỗ dưới nó (colWalkY)
                else if (Q.st === 'jump' || Q.st === 'down') {
                  const T = Q.st === 'jump' ? 0.5 : 0.45, u = Math.min(1, Q.k / T), Ap = Q.A, Bt = Q.st === 'jump' ? S0 : Q.Bp, ya = Q.y0, yb = Q.st === 'jump' ? S0.y : cowY(Bt.x, Bt.z);
                  p.x = Ap.x + (Bt.x - Ap.x) * u; p.z = Ap.z + (Bt.z - Ap.z) * u; p.y = ya + (yb - ya) * u + Math.sin(Math.PI * u) * 0.28;
                  B.want = 0; v = 0; B.mode = 'stand'; B.air = true; dogObj.rotation.y = yawOf(Bt.x - Ap.x, Bt.z - Ap.z);
                  dogObj.updateMatrixWorld(true); rig.plant(() => p.y - 0.01);
                  if (u >= 1) { B.air = false; if (Q.st === 'jump') { Q.st = 'on'; Q.k = 0; Q.dur = 4 + Math.random() * 4; ground = (x, z) => colWalkY(x, z, S0.y - 0.12, 0.22); } else { B.pc = null; ground = cowY; setSt('return'); } }
                } else {   // trên đỉnh: đứng ngó quanh, rồi ngồi; hết giờ: nhảy xuống phía trước (vướng thì quay lại chỗ bật)
                  B.want = 0; B.mode = Q.k > 1.6 ? 'sit' : 'stand';
                  const a = Q.k * 0.7; B.look = _hp.set(p.x + Math.cos(a) * 4, p.y + 0.4, p.z + Math.sin(a) * 4);
                  if (Q.k > Q.dur) {
                    const f = fwdOf(dogObj.rotation.y); Q.Bp.set(S0.x + f.x * 0.7, 0, S0.z + f.z * 0.7);
                    if (COL_M.dog && colFH(COL_M.dog, Q.Bp.x, Q.Bp.z, -dogObj.rotation.y, 7) > 0) Q.Bp.set(Q.A.x, 0, Q.A.z);
                    Q.st = 'down'; Q.k = 0; Q.A.copy(p); Q.y0 = p.y;
                  }
                }
                break;
              }
              case 'circle': {   // tới chỗ nằm: chỉ xoay ngắn cho mặt quay về bếp lửa rồi nằm — G 17/10 bỏ cảnh xoay 1–2 vòng tại chỗ (giẫm ổ) trông như chó đứng 1 chỗ
                // xoay vòng; trước đây xong vòng còn giật hướng tức thì lúc nằm. Xoay có kiểm va chạm (dogTurn), tối đa 2 s
                B.mode = 'stand'; B.want = 0; B.wagAmp = 0.1;
                if (B.yt === undefined) { const toFire = yawOf(pf.x - p.x, pf.z - p.z); B.yt = toFire + Math.atan2(Math.sin(dogObj.rotation.y - toFire), Math.cos(dogObj.rotation.y - toFire)) * 0.3; }
                dogTurn(B.yt, dt * 3);
                let dy = B.yt - dogObj.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
                if (Math.abs(dy) < 0.12 || B.k > 2) { setSt('lie', 50 + Math.random() * 100); B.doze = 0; }
                break;
              }
            }
            if (E && B.st !== 'follow' && B.st !== 'lie' && E.walking && E.g.position.distanceTo(p) < 1.6) B.look = _hp.copy(E.g.position).setY(E.g.position.y + 1.2);
          }
          return {
            update(dt, t) {
              dt = Math.min(dt, 0.05);
              if (!dogBlk && COL.ready && COL_M.dog) dogNavBuild();
              if (!shelterTick(dt, t) && !(DW.ep && DW.ep.kind === 'stand')) behave(dt, t);   // đang "đối đáp" với người xem (đứng): tạm dừng việc đang làm
              watchTick(dt, t);
              // lưới an toàn: đứng 1 chỗ (< 0,4 m / 3 s) mà thân xoay > 5,5 rad ⇒ đang kẹt giữa vật (khe lọt lưới) — cho đi xuyên 1,5 s thoát ra
              { const y = dogObj.rotation.y, p = dogObj.position; let d = y - (B.spinY ?? y); d = Math.atan2(Math.sin(d), Math.cos(d)); B.spinY = y; B.spin = (B.spin || 0) * Math.exp(-dt / 3) + Math.abs(d);
                if (!B.spinP || (B.spinT = (B.spinT || 0) + dt) > 3) { B.spinP = p.clone(); B.spinT = 0; }
                if (B.spin > 5.5 && p.distanceTo(B.spinP) < 0.4 && COL_M.dog && !(B.st === 'zoom' || B.st === 'perch' || B.inside)) { COL_M.dog.ghost = 1.5; B.spin = 0; } }
              // chọn dáng đi theo tốc độ (có trễ để khỏi đổi qua lại)
              if (gait === 'walk' && v > 1.0) gait = 'trot'; else if (gait === 'trot' && v < 0.8) gait = 'walk'; else if (gait === 'trot' && v > 2.3) gait = 'gallop'; else if (gait === 'gallop' && v < 2.0) gait = 'trot';
              const dist = move(dt);
              if (!B.air) { B.slope = 0; dogObj.position.y = ground(dogObj.position.x, dogObj.position.z); }
              body(dt, t); rig.step(dt, dist, v, gait, P.h.x, P.pitch.x, P.fold.x + P.sit.x + P.bow.x > 0.05);
              if (B.barkK > 0) { B.barkK = Math.max(0, B.barkK - dt); const k = 1 - B.barkK / 0.7; U.head.getWorldPosition(_dogHead); barkSp.visible = true;   // "Gâu!" bay lên trên đầu, mờ dần
                barkSp.position.set(_dogHead.x, _dogHead.y + 0.25 + k * 0.4, _dogHead.z); barkSp.material.opacity = 0.95 * Math.min(1, B.barkK * 4); barkSp.scale.set(0.7 + 0.2 * k, 0.35 + 0.1 * k, 1); }
              else barkSp.visible = false;
              updateSoftTail(dogTail, dt, U.tail.rotation.y, dogZzzGroup.visible ? 1 : 0);
            },
            pettable: () => !dogRain.st && B.st === 'lie' && dogObj.position.distanceTo(restP) < 0.8,
            perchSpot: () => dogPerchSpot(), zoomSpot: () => zoomCenter(),
            state: B, rig, stairY, watch: DW, herd: H
          };
        })();
        const dogPettable = () => dogBrain.pettable();
