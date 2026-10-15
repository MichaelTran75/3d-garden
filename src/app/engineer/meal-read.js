        // ===== ĂN · ĐỌC SÁCH · CÁ NƯỚNG — tay mềm theo nghiên cứu động học (G 13/10: "cùi chỏ, cổ tay… cầm cá nướng ăn, câu cá thay cá nướng") =====
        //  · Ăn bằng thìa khi ngồi (Nakatake & cs., PLoS ONE 2021, 16(10): e0259184, 45 người lớn): 4 nhịp với → xúc → đưa lên → vào miệng. Gần miệng khuỷu gập ~116–129°,
        //    vai dạng ≤30°, cẳng tay ngửa tới ~50°, cổ tay ngửa ~32°; lúc xúc cổ cúi nhiều nhất, lúc vào miệng cổ thẳng nhất, thân đổ tới đón thìa.
        //    ⇒ bàn tay đặt bằng điểm đích thật (thìa trong chảo / ở môi) cho IK tự gập khuỷu; hướng thìa đặt bằng e.handQ (cổ tay + sấp/ngửa).
        //  · Đọc sách: sách cách mắt ~40–50 cm, hai tay đỡ hai mép, ngả lưng nhẹ (đỡ mỏi cổ); tay phải lật trang, tay trái bốc khoai.
        //  · Cá nướng xiên que: que xuyên đuôi → miệng dọc xương sống, cắm xiên xuống đất cạnh than (không vào lửa), ~15–20 phút; ăn: cầm que hai đầu
        //    như bắp ngô, cắn thịt dọc thân từng bên, chừa xương — ăn xong quăng que vào lửa. Tối đi câu được cá rô thì mang về xiên, cắm nướng cho bữa sau.
        const _mrA = new THREE.Vector3(), _mrB = new THREE.Vector3(), _mrC = new THREE.Vector3(), _mrD = new THREE.Vector3(), _mrE = new THREE.Vector3(), _mrF = new THREE.Vector3();
        const _mrM = new THREE.Matrix4(), _mrQ = new THREE.Quaternion(), _mrQ2 = new THREE.Quaternion(), _mrUp = new THREE.Vector3(0, 1, 0);
        const mrHand = [[new THREE.Vector3(), new THREE.Quaternion()], [new THREE.Vector3(), new THREE.Quaternion()]];   // đích tay (vị trí · hướng) cấp sẵn
        function engMouthW(e, out) { e.head.updateWorldMatrix(true, false); return e.head.localToWorld(out.set(0, -0.03, 0.2)); }
        function engBodyW(e, x, y, z, out) { e.spine.updateWorldMatrix(true, false); return e.spine.localToWorld(out.set(x, y - 1.255, z)); }   // toạ độ kỹ sư, theo eo
        const _axR = new THREE.Vector3(), _axF = new THREE.Vector3(), _axM = new THREE.Matrix4(), _aqX = new THREE.Vector3(), _aqY = new THREE.Vector3(), _aqZ = new THREE.Vector3(), _aqM = new THREE.Matrix4();
        function engAxesW(e) { e.spine.updateWorldMatrix(true, false); _axM.extractRotation(e.spine.matrixWorld); return { r: _axR.set(-1, 0, 0).applyMatrix4(_axM), f: _axF.set(0, 0, 1).applyMatrix4(_axM) }; }   // phải · trước (thế giới)
        const _wuA = new THREE.Vector3(), _wuB = new THREE.Vector3();
        function engWristUp(e, i, dir) {   // "trục +y" cho khung cổ tay giữ CỔ TAY THẲNG: hướng tay → khuỷu (cẳng tay của lần giải IK trước), không phải trời —
          //                                 ép +y lên trời khi khuỷu ở dưới tay (đưa thìa lên miệng) làm bàn tay lật gập ngược ~170° (G 15/10 khoanh ảnh)
          const f = e.foreW && e.foreW[i]; if (!f || f.lengthSq() < 0.5) return _mrUp;
          _wuA.copy(f).negate(); if (_wuB.crossVectors(_wuA, dir).lengthSq() < 0.04) _wuA.lerp(_mrUp, 0.5).normalize();   // thìa gần song song cẳng tay: kéo về trời cho khỏi lật
          return _wuA;
        }
        function aimQ(out, dir, up) {   // trục +z → dir, trục +y gần up nhất
          const z = _aqZ.copy(dir).normalize(), x = _aqX.crossVectors(up, z); if (x.lengthSq() < 1e-8) x.set(1, 0, 0); x.normalize();
          return out.setFromRotationMatrix(_aqM.makeBasis(x, _aqY.crossVectors(z, x), z));
        }
        function engHandSet(e, i, pos, q) {   // đặt đích tay i: vị trí thế giới của tâm bàn tay + hướng khung cổ tay
          const R = e.reachT || (e.reachT = [null, null]), Q = e.handQ || (e.handQ = [null, null]);
          R[i] = mrHand[i][0].copy(pos); Q[i] = mrHand[i][1].copy(q);
        }
        function engHandFor(e, i, q, local, worldP) {   // tay i cầm vật có điểm `local` (khung cổ tay) phải nằm ở worldP, khung cổ tay hướng q
          engHandSet(e, i, _mrC.copy(local).multiplyScalar(e.g.scale.y).applyQuaternion(q).negate().add(worldP), q);
        }

        // ---------- CÁ NƯỚNG: trạng thái + màu sống → chín, bị cắn dần, cầm / quăng / xiên / cắm ----------
        //  ready · cooking (trên que cạnh lửa) · held (tay phải) · fly (quăng vào lửa) · empty · swim (cá rô dưới hồ đang cắn câu) · bucket · carried (tay trái) · plant
        const grill = (() => {
          const F = campObj.fish, S = F.stick, home = { p: S.position.clone(), q: S.quaternion.clone() }, fgP = F.fg.position.clone(), fgQ = F.fg.quaternion.clone();
          const cCook = F.fMat.color.clone(), cRaw = new THREE.Color(0x8b979c), finCook = F.finMat.color.clone(), finRaw = new THREE.Color(0x66767c), cBone = new THREE.Color(0xe2d5b5);
          const W = 1.44 * CAMP_SCALE, GRIP = 0.5, TOP = 1.12, MID = 0.78;   // cỡ que thế giới · điểm cầm · đầu que (qua miệng cá) · tâm cá (đv que)
          const qGrip = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2));   // que (+y) luồn qua nắm tay chữ C (trục x cổ tay)
          const keep = { g: new THREE.Group(), wig: new THREE.Group(), mouth: new THREE.Vector3(0.25, 0, 0), keeper: true };
          keep.g.name = 'Cá rô cắn câu'; keep.g.visible = false; keep.g.scale.setScalar(W); keep.g.add(keep.wig); scene.add(keep.g);
          const qSwim = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));   // đầu cá +x, lưng lên
          keep.swim = (t, s) => { keep.wig.rotation.y = Math.sin(t * 9) * (0.08 + 0.3 * s); };
          const G = { st: 'ready', cook: 1, eat: 0, fly: null, kept: false, home, keep };
          S.traverse(o => { o.userData.noBatch = true; });   // que + cá di chuyển, đổi cha lúc chạy: vẽ riêng, không gộp vào khối tĩnh của bếp (bị cắt khung theo bếp)
          function paint() {
            const k = G.cook, b = G.eat;
            F.fMat.color.copy(cRaw).lerp(cCook, k).lerp(cBone, Math.max(0, (b - 0.75) / 0.25) * 0.85); F.finMat.color.copy(finRaw).lerp(finCook, k);
            F.marks.visible = k > 0.55 && b < 0.6; F.body.scale.set(0.5 * (1 - 0.72 * b), 1, 1 - 0.25 * b);   // cắn dần: thân mỏng đi, cuối còn xương
          }
          function put(o, parent, p, q, s) { parent.add(o); o.position.copy(p); o.quaternion.copy(q); o.scale.setScalar(s); }
          G.set = st => { G.st = st; S.visible = !['empty', 'swim', 'bucket', 'carried'].includes(st); F.fg.visible = !['empty', 'bucket'].includes(st); };
          G.atHome = () => { put(S, campObj.g, home.p, home.q, 1.44); put(F.fg, S, fgP, fgQ, 1); };
          G.grab = (e, i) => { const s = W / e.g.scale.y; put(S, e.wrists[i], _mrA.set(0, -GRIP, 0).applyQuaternion(qGrip).multiplyScalar(s), qGrip, s); G.set('held'); };   // que trong tay i
          G.handQ = (stickQ, out) => out.copy(stickQ).multiply(_mrQ2.copy(qGrip).invert());   // hướng cổ tay để que có hướng stickQ
          G.point = (y, out) => S.localToWorld(out.set(0, y, 0));   // điểm trên que (đv que)
          G.homeW = (y, out) => { campObj.g.updateWorldMatrix(true, false); return campObj.g.localToWorld(out.set(0, y * 1.44, 0).applyQuaternion(home.q).add(home.p)); };
          G.homeQ = out => { campObj.g.getWorldQuaternion(out); return out.multiply(home.q); };
          G.stand = out => { G.homeW(0, out); const dx = out.x - pf.x, dz = out.z - pf.z, d = Math.hypot(dx, dz) || 1; out.x += dx / d * 0.52; out.z += dz / d * 0.52; out.y = 0; return out; };   // chỗ đứng lấy/cắm que (vẫn ngoài vòng tránh lửa)
          G.toss = (v) => { S.updateWorldMatrix(true, false); const p = new THREE.Vector3(), q = new THREE.Quaternion(); S.getWorldPosition(p); S.getWorldQuaternion(q); put(S, scene, p, q, W); G.fly = { v, t: 0, spin: 7 }; G.set('fly'); };
          G.toKeeper = () => { put(F.fg, keep.wig, _mrA.set(0, 0, 0), qSwim, 1); G.eat = 0; G.cook = 0; paint(); keep.g.visible = true; G.set('swim'); return keep; };
          G.lost = () => { keep.g.visible = false; G.atHome(); G.set('empty'); };   // cá rô sổng lưỡi: lại không có cá nướng
          G.toBucket = () => { keep.g.visible = false; G.set('bucket'); G.kept = true; };
          G.toHand = (e) => { const s = W / e.g.scale.y; put(F.fg, e.wrists[1], _mrA.set(0, -0.06, 0.12), _mrQ.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), s); G.set('carried'); };
          G.skewer = () => { put(F.fg, S, fgP, fgQ, 1); };
          G.update = (dt, h) => {
            const jump = G.lastH === undefined || Math.abs(((h - G.lastH + 36) % 24) - 12) > 0.5; G.lastH = h;
            if (jump && !['held', 'fly', 'swim', 'bucket', 'carried', 'plant'].includes(G.st)) { G.keep.g.visible = false; G.atHome(); G.cook = 1; G.eat = 0; G.set(h >= 17.25 && h < 19.6 ? 'empty' : 'ready'); paint(); }   // mở trang / tua giờ: sau bữa tối tới lúc câu về thì que trống
            if (G.st === 'cooking') { G.cook = Math.min(1, G.cook + dt / (17 * 60)); if (G.cook >= 1) G.set('ready'); paint(); }   // ~17 phút cạnh than thì chín vàng
            if (G.fly) {   // que bay theo đường đạn vào lòng bếp (~0,7 s), chạm than thì cháy mất
              const f = G.fly; f.t += dt; f.v.y -= 9.81 * dt; S.position.addScaledVector(f.v, dt); S.rotateX(f.spin * dt);
              if (f.t >= 0.7) { G.fly = null; G.atHome(); G.eat = 0; paint(); G.set('empty'); }
            }
          };
          G.paint = paint;
          return G;
        })();

        // ---------- ĂN CƠM CHIÊN: tay trái giữ cán chảo trước bụng (mặt chảo ngang), tay phải xúc thìa → đưa lên → vào miệng → nhai ----------
        const SPOON_TIP = new THREE.Vector3(0, -0.03, 0.28), PAN_IN = new THREE.Vector3(0, 0.03, 0);
        function engEatRice(e, dt, t) {
          const H = e.hold, D = e.dish, P = e.props; H.spoon = true; e.armsBusy = true; e.elbowPole = EAT_POLE; if (D) D.at = 'hand';
          const c = (t + (e.readPh || 0)) % 6.2, up = minJerk(segK(c, 1.4, 2.3)) * (1 - minJerk(segK(c, 2.8, 3.4))), chew = c > 2.6;   // 1 miếng ~6 s
          const ax = engAxesW(e), right = _mrD.copy(ax.r), fwd = _mrF.copy(ax.f);
          // chảo: trước bụng lệch trái, cán quay về tay trái
          const pan = engBodyW(e, 0.06, 1.42, 0.42, new THREE.Vector3()), hx = _mrA.copy(right).multiplyScalar(-0.85).addScaledVector(fwd, -0.5).normalize();
          const qPan = _mrQ.setFromRotationMatrix(_mrM.makeBasis(hx, _mrUp, _mrB.crossVectors(hx, _mrUp))), qL = new THREE.Quaternion().copy(qPan).multiply(_mrQ2.copy(P.handPan.quaternion).invert());
          engHandFor(e, 1, qL, P.handPan.position, pan);
          // thìa: trong lòng chảo (khoắng tròn khi xúc) ↔ chạm môi; đi theo cung vồng ra trước cho khỏi quệt chảo
          const sc = e.g.scale.y;
          // lòng chảo = đích chảo trong khung này (chảo ngang tại `pan`). Bản cũ đọc P.handPan.localToWorld lúc tay trái còn ở góc ước lượng trước IK
          // (tay duỗi giơ ra trước) ⇒ "lòng chảo" nằm ngang miệng, thìa không bao giờ xuống chảo, tay phải kẹt trên mặt (G 15/10)
          const inPan = _mrC.copy(PAN_IN).multiplyScalar(sc / ENGINEER_BASE_SCALE).applyQuaternion(qPan).add(pan).addScaledVector(right, Math.cos(c * 4) * 0.02 * sc).addScaledVector(fwd, Math.sin(c * 4) * 0.02 * sc);
          const mouth = engMouthW(e, new THREE.Vector3()).addScaledVector(fwd, 0.02 * sc), tip = new THREE.Vector3().lerpVectors(inPan, mouth, up).addScaledVector(fwd, 0.12 * sc * Math.sin(Math.PI * up));
          tip.y += 0.06 * sc * Math.sin(Math.PI * up);
          const dIn = _mrA.subVectors(inPan, engBodyW(e, -0.34, 1.86, 0, _mrB)).add(_mrB.set(0, -0.35, 0)).normalize(), dMo = _mrB.copy(fwd).multiplyScalar(-0.9).addScaledVector(right, -0.35).add(_mrE.set(0, 0.15, 0)).normalize();
          const dS = dIn.lerp(dMo, minJerk(Math.min(1, up * 1.6))).normalize();   // thìa quay về phía miệng sớm hơn quãng đưa lên (giữ lòng thìa ngang, không chúc theo chảo)
          engHandFor(e, 0, aimQ(new THREE.Quaternion(), dS, engWristUp(e, 0, dS)), SPOON_TIP, tip);
          e.seatLean = 0.06 + 0.12 * up; e.seatSwing = 0;   // đổ người đón thìa
          e.head.rotation.x = 0.04 + 0.34 * (1 - up) + (chew ? Math.abs(Math.sin(t * 9)) * 0.04 : 0);   // xúc: cúi nhìn chảo · vào miệng: cổ thẳng · nhai gật gù
        }

        // ---------- ĂN Ở BÀN VUÔNG TRONG XE (G 15/10 "research and improve eating movements more fine grain and correctly flexible") ----------
        //  Theo động học ăn bằng thìa khi ngồi (PLoS ONE 2021, đã dùng cho cơm chiên): mỗi miếng ngũ cốc ~5,6 s chia pha nhỏ — VỚI vào bát 0,6 s →
        //  XÚC 0,6 s (chấm thìa xuống sữa chỗ khác nhau mỗi miếng, kéo về mép gần, lòng thìa từ chúc → ngang) → ĐƯA LÊN 0,7 s theo cung vồng ra trước,
        //  thìa giữ ngang, khuỷu gập dần (IK) → VÀO MIỆNG 0,35 s (thân đổ tới đón, cổ thẳng nhất) → RÚT RA 0,35 s (thìa chúc, hạ nhẹ) → VỀ trên bát
        //  0,8 s → NHAI ~2 s (gật rất nhẹ ~1,4 Hz — nhịp nhai 1–2 Hz), thỉnh thoảng liếc ra cửa sổ. Lúc xúc cổ cúi nhìn bát nhiều nhất.
        //  Tay trái cầm cốc cà phê tựa đáy trên mặt bàn cạnh bát; ~21 s nhấc lên (0,9 s), nhấp 1,5 s (cốc nghiêng dần, ngửa đầu), đặt xuống — lúc ấy thìa nghỉ.
        //  Udon: đũa gắp (chấm xuống 2 lần) → kéo sợi lên cao → đưa tới miệng → húp sột soạt (đầu gật nhanh) → về; ~22 s hai tay bưng bát húp nước dùng.
        const CUP_BASE = new THREE.Vector3(0, -0.135, 0.08), CUP_LIP = new THREE.Vector3(0, -0.025, 0.142), CHOP_TIP = new THREE.Vector3(0, -0.06, 0.35);
        const _eA = new THREE.Vector3(), _eB = new THREE.Vector3(), _eC = new THREE.Vector3(), _eD = new THREE.Vector3(), _eQ = new THREE.Quaternion(), _eQ2 = new THREE.Quaternion();
        const hash01 = (n, k) => { const x = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
        const EAT_POLE = [new THREE.Vector3(-0.22, -1, 0.08), new THREE.Vector3(0.28, -1, 0.02)];   // khuỷu khép sát thân khi ăn (vai dạng ≤ 30° — PLoS ONE 2021), mặc định IK chĩa ra ngoài 0,6
        function arcTo(a, b, k, up, fwd, hUp, hFwd, out) { const s = Math.sin(Math.PI * k); return out.lerpVectors(a, b, k).addScaledVector(up, hUp * s).addScaledVector(fwd, hFwd * s); }   // cung vồng (lên + ra trước) giữa 2 điểm
        function engEatAtTable(e, t, ph, meal) {
          const H = e.hold, P = e.props, sc = e.g.scale.y, food = e.dish ? e.dish.food : 1; e.armsBusy = true; e.elbowPole = EAT_POLE;
          const ax = engAxesW(e), right = _mrD.copy(ax.r), fwd = _mrF.copy(ax.f), UP = _mrUp;
          const bowl = meal === 'udon' ? VTUDON : VCEREAL; bowl.updateWorldMatrix(true, false);
          const mouth = engMouthW(e, new THREE.Vector3()), shoulderR = engBodyW(e, -0.34, 1.86, 0, new THREE.Vector3());
          // --- tay trái: cốc cà phê (sáng) — tựa bàn / nhấc lên nhấp; trưa: bưng bát húp (2 tay) ---
          const sp = (t + ph * 1.7) % (meal === 'udon' ? 22 : 21), sipU = minJerk(segK(sp, 0, 0.9)) * (1 - minJerk(segK(sp, 2.4, 3.3))), sipping = sipU > 0.02;
          const bowlC = bowl.getWorldPosition(new THREE.Vector3()), dirF = _eD.copy(fwd).setY(0).normalize();
          if (meal !== 'udon') {
            H.spoon = H.cup = true;
            const restCup = bowlC.clone().addScaledVector(right, -0.2 * sc).addScaledVector(dirF, 0.02 * sc), tilt = 0.25 + 0.55 * minJerk(segK(sp, 1.0, 2.3));
            const qUp = aimQ(_eQ, dirF, UP), qSip = aimQ(new THREE.Quaternion(), dirF, _eA.copy(UP).multiplyScalar(Math.cos(tilt)).addScaledVector(dirF, -Math.sin(tilt)));
            const lip = mouth.clone().addScaledVector(fwd, 0.015 * sc), qL = new THREE.Quaternion().slerpQuaternions(qUp, qSip, sipU);
            const restLip = restCup.addScaledVector(UP, (CUP_LIP.y - CUP_BASE.y) * sc).addScaledVector(dirF, (CUP_LIP.z - CUP_BASE.z) * sc);   // vành cốc khi đáy cốc tựa mặt bàn
            engHandFor(e, 1, qL, CUP_LIP, arcTo(restLip, lip, sipU, UP, fwd, 0.04 * sc, 0.03 * sc, _eB));   // 1 đường liền: vành cốc từ chỗ nghỉ → môi
          } else { H.chop = true; const rim = bowl.localToWorld(new THREE.Vector3(0.1, 0.05, -0.012)); engHandSet(e, 1, rim, aimQ(_eQ, _eA.subVectors(bowlC, rim).setY(0).normalize(), UP)); }   // udon: tay trái giữ vành bát bên trái cho vững (ăn mì đũa)
          // --- tay phải: 1 miếng ---
          const T = meal === 'udon' ? 4.4 : 5.6, n = Math.floor((t + ph) / T), c = sipping ? 9 : (t + ph) % T;
          const surf = meal === 'udon' ? 0.05 : 0.022 + 0.021 * food;
          const dip = bowl.localToWorld(new THREE.Vector3((hash01(n, 1) - 0.5) * 0.06, surf - 0.006, (hash01(n, 2) - 0.35) * 0.05)), near = bowl.localToWorld(new THREE.Vector3(0, surf + 0.01, -0.045));
          const rest = bowl.localToWorld(new THREE.Vector3(-0.035, meal === 'udon' ? 0.11 : 0.085, -0.055)), front = mouth.clone().addScaledVector(fwd, 0.035 * sc), inside = mouth.clone().addScaledVector(fwd, 0.004 * sc);
          const out = mouth.clone().addScaledVector(fwd, 0.055 * sc).addScaledVector(UP, -0.02 * sc);
          let tip, u, pitch = 0;
          if (meal !== 'udon') {
            if (c < 0.6) { const k = minJerk(c / 0.6); tip = arcTo(rest, dip, k, UP, fwd, 0.03 * sc, 0, _eB); u = 0; pitch = -0.3 * k; }
            else if (c < 1.2) { const k = (c - 0.6) / 0.6; tip = _eB.lerpVectors(dip, near, k).addScaledVector(UP, 0.012 * sc * k); u = 0; pitch = -0.3 + 0.45 * k; }   // xúc: kéo về mép gần, lòng thìa ngửa dần
            else if (c < 1.9) { const k = minJerk((c - 1.2) / 0.7); tip = arcTo(near, front, k, UP, fwd, 0.08 * sc, 0.07 * sc, _eB); u = k; pitch = 0.15 * (1 - k); }
            else if (c < 2.25) { tip = _eB.lerpVectors(front, inside, minJerk((c - 1.9) / 0.35)); u = 1; }
            else if (c < 2.6) { const k = minJerk((c - 2.25) / 0.35); tip = _eB.lerpVectors(inside, out, k); u = 1; pitch = -0.25 * k; }   // rút ra: thìa chúc xuống
            else if (c < 3.4) { const k = minJerk((c - 2.6) / 0.8); tip = arcTo(out, rest, k, UP, fwd, 0.03 * sc, 0.03 * sc, _eB); u = 1 - k; pitch = -0.25 * (1 - k); }
            else { tip = _eB.copy(rest).addScaledVector(right, 0.006 * sc * Math.sin(t * 1.3)); u = 0; }   // nhai: thìa nghỉ trên bát
          } else {   // đũa: chấm gắp 2 lần → kéo sợi lên → tới miệng → húp → về
            if (c < 0.5) { tip = arcTo(rest, dip, minJerk(c / 0.5), UP, fwd, 0.04 * sc, 0, _eB); u = 0; }
            else if (c < 1.2) { const k = (c - 0.5) / 0.7; tip = _eB.copy(dip).addScaledVector(UP, (0.015 + 0.015 * Math.cos(k * TAU * 2)) * sc); u = 0; }
            else if (c < 1.6) { const k = minJerk((c - 1.2) / 0.4); tip = _eB.copy(dip).addScaledVector(UP, (0.015 + 0.13 * k) * sc); u = 0.2 * k; }   // kéo sợi lên cao
            else if (c < 2.2) { const a = _eA.copy(dip).addScaledVector(UP, 0.145 * sc); tip = arcTo(a, inside, minJerk((c - 1.6) / 0.6), UP, fwd, 0.03 * sc, 0.05 * sc, _eB); u = 0.2 + 0.8 * minJerk((c - 1.6) / 0.6); }
            else if (c < 3.1) { tip = _eB.copy(inside).addScaledVector(UP, -0.006 * sc * Math.abs(Math.sin(t * 16))); u = 1; }   // húp sột soạt
            else if (c < 3.8) { const k = minJerk((c - 3.1) / 0.7); tip = arcTo(out, rest, k, UP, fwd, 0.03 * sc, 0, _eB); u = 1 - k; }
            else { tip = _eB.copy(rest); u = 0; }
          }
          if (sipping) { tip = _eB.copy(rest); u = 0; pitch = 0; }
          // hướng dụng cụ: ở bát chĩa từ vai xuống bát · ở miệng chĩa ngược về mặt từ phía phải; chúc / ngửa lòng thìa quanh trục ngang
          const dIn = _eA.subVectors(dip, shoulderR).add(_eC.set(0, -0.3 * sc, 0)).normalize(), dMo = _eC.copy(fwd).multiplyScalar(-0.9).addScaledVector(right, -0.35).addScaledVector(UP, 0.12).normalize();
          const dir = dIn.lerp(dMo, u).normalize(); dir.y += pitch; dir.normalize();
          engHandFor(e, 0, aimQ(_eQ2, dir, engWristUp(e, 0, dir)), meal === 'udon' ? CHOP_TIP : SPOON_TIP, tip);   // cổ tay thẳng theo cẳng tay
          // --- thân, đầu ---
          const chew = !sipping && c > (meal === 'udon' ? 3.8 : 2.4), slurp = meal === 'udon' && c >= 2.2 && c < 3.1 && !sipping;
          const glance = chew ? Math.max(0, Math.sin(Math.PI * segK((t + ph * 2.3) % 13, 0, 3.5))) : 0;   // thỉnh thoảng liếc ra cửa sổ khi nhai
          e.seatLean = 0.08 + 0.12 * u + (u === 0 && !chew ? 0.04 : 0);   // xúc: đổ nhẹ nhìn bát · đưa lên: đổ tới đón thìa
          e.head.rotation.x = 0.36 * (1 - u) + 0.06 * u - 0.14 * sipU + (chew ? 0.025 * Math.sin(t * 8.8) : 0) + (slurp ? 0.03 * Math.sin(t * 15) : 0);
          e.head.rotation.y = 0.4 * glance;
        }

        // ---------- ĐỌC SÁCH: sách to gấp đôi trước ngực, 2 tay giữ 2 mép; ~40 s lật 1 trang bằng tay phải; ~20 s tay trái bốc khoai ----------
        const BOOK_Q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0.6, -0.8), new THREE.Vector3(0, -0.8, -0.6)));   // mặt sách ngửa về phía mắt
        const CHIP_AT = new THREE.Vector3(0, -0.01, 0.11);
        function engRead(e, dt, t) {
          const H = e.hold, P = e.props, B = P.book; H.book = true; e.armsBusy = true;
          if (B.parent !== e.spine) { e.spine.add(B); B.scale.setScalar(2); }
          const tt = t + (e.readPh || 0) * 3;
          B.position.set(Math.sin(tt * 0.31) * 0.01, 0.42 + Math.sin(tt * 0.23) * 0.012, 0.5); B.quaternion.copy(BOOK_Q);
          B.updateWorldMatrix(true, true);
          const bx = _mrA.set(1, 0, 0).transformDirection(B.matrixWorld).clone();   // trục ngang sách (thế giới, về phía mép phải người đọc)
          const edge = (s, out) => B.localToWorld(out.set(s * 0.15, 0.02, -0.02));
          const qR = aimQ(new THREE.Quaternion(), bx.clone().negate(), _mrUp), qLh = aimQ(new THREE.Quaternion(), bx, _mrUp);   // miệng chữ C kẹp mép sách
          // lật trang (tay phải): tới góc trang → theo trang quay quanh gáy sang trái → về mép phải
          const pt = (tt + 10) % 40, pk = minJerk(segK(pt, 0.5, 1.4));
          P.bookLeaf.visible = pt > 0.4 && pt < 1.5; P.bookLeaf.rotation.z = 0.22 + (Math.PI - 0.44) * pk;
          const corner = P.bookLeaf.localToWorld(new THREE.Vector3(0.15, 0.03, 0)), rEdge = edge(1, new THREE.Vector3());
          const toLeaf = segK(pt, 0, 0.5) * (1 - segK(pt, 1.4, 2.0));
          engHandSet(e, 0, rEdge.lerp(corner, toLeaf), qR);
          // bốc khoai (tay trái): với gói trên bàn trà → lên miệng → về mép trái sách
          const ct = tt % 20, reach = minJerk(segK(ct, 0, 0.9)) * (1 - minJerk(segK(ct, 1.1, 1.6))), toM = minJerk(segK(ct, 1.3, 2.2)) * (1 - minJerk(segK(ct, 2.7, 3.6)));
          const lEdge = edge(-1, new THREE.Vector3());
          let lp = lEdge, lq = qLh;
          if (reach > 0) { chipsBag.updateWorldMatrix(true, false); const bag = chipsBag.getWorldPosition(new THREE.Vector3()); bag.y += 0.12; lp = lEdge.clone().lerp(bag, reach); lq = qLh.clone().slerp(aimQ(_mrQ, _mrE.set(0, -1, 0), _mrB.copy(bx).negate()), reach); }
          if (toM > 0) { const fwd = engAxesW(e).f, m = engMouthW(e, new THREE.Vector3()), qm = aimQ(new THREE.Quaternion(), _mrB.copy(fwd).negate().addScaledVector(bx, 0.45).normalize(), _mrUp);   // từ trước–trái hướng vào miệng
            const hm = _mrC.copy(CHIP_AT).multiplyScalar(e.g.scale.y).applyQuaternion(qm).negate().add(m); lp = lp.clone().lerp(hm, toM); lq = lq.clone().slerp(qm, toM); }
          engHandSet(e, 1, lp, lq);
          H.chip = (reach > 0.6 && ct > 0.6) || (toM > 0.05 && ct < 2.85);
          const chew = ct > 2.2 && ct < 4.6;
          e.seatLean = -0.05; e.seatSwing = 0.02;   // ngả lưng nhẹ: đỡ mỏi cổ khi đọc lâu
          e.head.rotation.x = 0.34 - toM * 0.2 + Math.sin(tt * 0.4) * 0.02 + (chew ? Math.abs(Math.sin(t * 10)) * 0.035 : 0); e.headYawT = 0.12 * toM;
        }

        // ---------- LẤY CÁ NƯỚNG · ĂN CÁ · QUĂNG QUE · XIÊN & CẮM CÁ MỚI ----------
        const _grT = new THREE.Vector3();
        function engGrillPhase(e, dt, t) {   // toGrill → grab → (toChair) · toPlant → plant → (toChair) — trả true khi xong
          const G = grill;
          if (e.phase === 'toGrill' || e.phase === 'toPlant') {
            if (engStep(e, G.stand(_grT), dt, t, pf, FIRE_AVOID_R, null)) { e.phase = e.phase === 'toGrill' ? 'grab' : 'plant'; e.timer = 0; }
            return;
          }
          e.timer += dt; const k = e.timer, base = G.homeW(0, _mrE), grip = G.homeW(0.5, _mrD);
          e.g.rotation.y = Math.atan2(base.x - e.g.position.x, base.z - e.g.position.z);
          if (k < 0.7) { const dx = grip.x - e.g.position.x, dz = grip.z - e.g.position.z, d = Math.hypot(dx, dz), m = Math.min(0.5 * dt, Math.max(0, d - 0.42)); if (d > 1e-3) { e.g.position.x += dx / d * m; e.g.position.z += dz / d * m; } }   // nhích nửa bước tới que trước khi cúi
          if (e.phase === 'grab') {   // cúi xuống nắm que (~2/5 thân que), rút lên, đứng thẳng dựng que trước ngực
            const bend = minJerk(segK(k, 0, 0.8)) * (1 - minJerk(segK(k, 1.3, 2.2)));
            e.spineT = { x: 0.85 * bend, y: 0 }; e.lean = 0.04 * bend; e.head.rotation.x = 0.2 * bend + 0.1; engCrouch(e, 0.95 * bend);   // gập eo + khuỵu gối, không nghiêng cả người
            if (k < 1.0) engHandSet(e, 0, G.homeW(0.5, _grT), G.handQ(G.homeQ(_mrQ), new THREE.Quaternion()));
            else { if (G.st !== 'held') G.grab(e, 0); engCarryFish(e, minJerk(segK(k, 1.0, 2.2))); }
            if (k >= 2.4) { e.phase = 'toChair'; e.timer = 0; }
          } else {   // 'plant': que mới tay phải, cá tay trái → xiên cá vào que → cúi cắm que xiên xuống đất cạnh than
            if (G.st === 'carried') { G.grab(e, 0); G.set('plant'); G.fishOnLeft = true; }   // que mới vào tay phải, cá vẫn ở tay trái
            const bend = minJerk(segK(k, 1.3, 2.1)) * (1 - minJerk(segK(k, 2.9, 3.6)));
            e.spineT = { x: 0.85 * bend, y: 0 }; e.lean = 0.04 * bend; e.head.rotation.x = 0.3 + 0.1 * bend; engCrouch(e, 0.95 * bend);
            if (k < 1.4) {   // trước ngực: tay phải dựng que, tay trái đưa cá luồn vào đầu que
              const ax = engAxesW(e), q = aimQ(new THREE.Quaternion(), ax.f, _mrUp);
              const sq = _mrQ2.setFromRotationMatrix(_mrM.makeBasis(_mrA.copy(ax.r).negate(), _mrUp, ax.f));
              engHandSet(e, 0, engBodyW(e, -0.2, 1.4, 0.45, _grT), G.handQ(sq, new THREE.Quaternion()));
              if (k > 0.3) { G.point(0.78 + 0.25 * (1 - minJerk(segK(k, 0.4, 1.3))), _mrC); engHandSet(e, 1, _mrC, q); }
              if (k >= 1.3 && G.fishOnLeft) { G.skewer(); G.fishOnLeft = false; }
            } else if (k < 2.9) engHandSet(e, 0, G.homeW(0.5, _grT), G.handQ(G.homeQ(_mrQ), new THREE.Quaternion()));   // cúi cắm que đúng chỗ cũ, nghiêng về phía lửa
            else if (G.st === 'plant') { G.atHome(); G.cook = 0; G.eat = 0; G.paint(); G.set('cooking'); }
            if (k >= 3.6) { e.phase = engPhaseFor(e.act); if (e.phase === 'toPlant') e.phase = 'toChair'; e.timer = 0; }
          }
        }
        function engCrouch(e, k) {   // khuỵu gối hạ người (như ngồi xổm vuốt chó, mức k)
          e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.28 * CAMP_SCALE * ENGINEER_SIZE * k;
          e.legs[0].rotation.x = -1.3 * k; e.legs[1].rotation.x = -1.2 * k; e.knees[0].rotation.x = 2.0 * k; e.knees[1].rotation.x = 1.9 * k;
        }
        function engCarryFish(e, k = 1) {   // đi đường: tay phải cầm que dựng đứng trước ngực bên phải
          const ax = engAxesW(e), sq = _mrQ.setFromRotationMatrix(_mrM.makeBasis(_mrA.copy(ax.r).negate(), _mrUp, ax.f));
          const p = engBodyW(e, -0.3, 1.45, 0.38, _grT); if (k < 1) p.lerp(grill.homeW(0.5, _mrC), 1 - k);
          engHandSet(e, 0, p, grill.handQ(sq, new THREE.Quaternion()));
        }
        function engEatFish(e, dt, t) {   // ngồi ghế: 2 tay cầm que nằm ngang như bắp ngô, đưa sườn cá lên miệng cắn, giật nhẹ, nhai — 8 miếng
          const G = grill; e.timer -= dt; e.armsBusy = true; e.hold.fish = true;
          const n = 8, T = 9, el = Math.max(0, e.eatLen - e.timer), bite = Math.floor(el / T), c = el % T;
          const up = minJerk(segK(c, 0.2, 1.1)) * (1 - minJerk(segK(c, 1.9, 2.6))), pull = minJerk(segK(c, 1.4, 1.8)) * (1 - segK(c, 1.9, 2.6));
          G.eat = Math.min(1, (bite + segK(c, 1.1, 1.5)) / n); G.paint();
          const ax = engAxesW(e), right = _mrD.copy(ax.r), fwd = _mrF.copy(ax.f), sc = e.g.scale.y;
          const lap = engBodyW(e, 0.05, 1.55, 0.5, new THREE.Vector3()), m = engMouthW(e, new THREE.Vector3()).addScaledVector(fwd, (0.1 + 0.06 * pull) * sc);
          const slide = ((bite % 4) - 1.5) * 0.06;   // mỗi miếng cắn một khúc khác dọc thân
          const ctr = lap.lerp(m, up).addScaledVector(right, -slide * sc);
          // que nằm ngang theo vai: +y que (đuôi → miệng cá) về bên trái người, mặt sườn cá quay vào miệng
          const yq = _mrA.copy(right).negate(), xq = _mrB.copy(fwd).negate(), sq = _mrQ.setFromRotationMatrix(_mrM.makeBasis(xq, yq, _mrC.crossVectors(xq, yq)));
          const W = 1.44 * CAMP_SCALE, grip = ctr.clone().addScaledVector(yq, (0.5 - 0.78) * W), top = ctr.clone().addScaledVector(yq, (1.12 - 0.78) * W);
          const hq = G.handQ(sq, new THREE.Quaternion());
          engHandSet(e, 0, grip, hq); engHandSet(e, 1, top, hq);
          e.seatLean = 0.05 + 0.1 * up; e.seatSwing = 0;
          e.head.rotation.x = 0.12 * (1 - up) - 0.05 * pull + (c > 2.6 ? Math.abs(Math.sin(t * 9)) * 0.045 : 0);
          if (e.timer <= 0 || bite >= n) { e.phase = 'tossFish'; e.timer = 0; }
        }
        function engTossFish(e, dt, t) {   // vung tay phải quăng que + xương cá vào lòng bếp (đường đạn ~0,7 s)
          const G = grill; e.timer += dt; const k = e.timer; e.armsBusy = true;
          const ax = engAxesW(e), toFire = _mrC.set(pf.x - e.g.position.x, 0, pf.z - e.g.position.z).normalize();
          if (G.st === 'held') {
            const back = minJerk(segK(k, 0, 0.5)), fw = minJerk(segK(k, 0.5, 0.75)), p = engBodyW(e, -0.32, 1.75, 0.25, _grT);   // vung ra sau–lên rồi phất tới về phía bếp
            p.addScaledVector(toFire, (fw * 1.2 - back * 0.7) * 0.4 * e.g.scale.y).y += (0.35 * back - 0.1 * fw) * e.g.scale.y;
            const sq = _mrQ.setFromRotationMatrix(_mrM.makeBasis(_mrA.copy(ax.r).negate(), _mrUp, ax.f));
            engHandSet(e, 0, p, G.handQ(sq, new THREE.Quaternion()));
            if (k >= 0.72) { const p0 = G.point(0.78, _mrD), T = 0.7, v = new THREE.Vector3(pf.x - p0.x, 0, pf.z - p0.z).divideScalar(T); v.y = (pf.y + 0.15 - p0.y) / T + 0.5 * 9.81 * T; G.toss(v); }
          }
          e.seatLean = 0.04; e.head.rotation.x = 0.1; e.headYawT = 0.25;
          if (k >= 1.6) { e.phase = 'eat'; e.timer = Math.max(60, Math.min(900, e.actLeft - 900)); e.eatT0 = e.timer; }   // rồi ăn cơm chiên
        }
