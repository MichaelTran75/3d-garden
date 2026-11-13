        // ===== CÁ NƯỚNG XIÊN QUE (đồ của trại — 01/11 đợt 12, dời nguyên văn từ engineer/tasks/meal-read.js): que + cá của bếp lửa (CAMP.fire.fish) tự giữ trạng
        //  thái, tự chín cạnh than, tự bay khi bị quăng. Người cầm / cắn / quăng / xiên / cắm qua CHỖ CHẠM trên mặt trại (CAMP.grill): người đưa khung cổ tay
        //  + cỡ người của mình (grab, toHand) hoặc khung lắc cá rô (toKeeper) — không tự gắn đồ của trại, không ghi màu / cỡ cá. Mỗi khung chạy ở lượt 'awake'
        //  của sổ tick (trong lượt kỹ sư, sau khi chọn việc, chỉ khi kỹ sư thức — đúng nhịp cũ). Mở trang / tua giờ đặt lại cá ⇒ báo tin 'grillReset'.
        //  Đứng ngay trước engineer/tasks/meal-read.js trong manifest ⇒ thứ tự dựng không đổi. =====
        const _gfA = new THREE.Vector3(), _gfQ = new THREE.Quaternion(), _gfQ2 = new THREE.Quaternion();
        // ---------- CÁ NƯỚNG: trạng thái + màu sống → chín, bị cắn dần, cầm / quăng / xiên / cắm ----------
        //  ready · cooking (trên que cạnh lửa) · held (tay phải) · fly (quăng vào lửa) · empty · swim (cá rô dưới hồ đang cắn câu) · bucket · carried (tay trái) · plant
        const grill = (() => {
          const F = CAMP.fire.fish, S = F.stick, home = { p: S.position.clone(), q: S.quaternion.clone() }, fgP = F.fg.position.clone(), fgQ = F.fg.quaternion.clone();
          const cCook = F.fMat.color.clone(), cSmoked = new THREE.Color(0x8a5226), cRaw = new THREE.Color(0x8b979c), finCook = F.finMat.color.clone(), finRaw = new THREE.Color(0x66767c), cBone = new THREE.Color(0xe2d5b5);
          const W = CAMP.fishK * CAMP_SCALE, GRIP = 0.5, TOP = 1.12, MID = 0.78;   // cỡ que thế giới · điểm cầm · đầu que (qua miệng cá) · tâm cá (đv que)
          const qGrip = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.PI / 2));   // que (+y) luồn qua nắm tay chữ C (trục x cổ tay)
          const qSwim = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0)));   // đầu cá +x, lưng lên
          const G = { st: 'ready', cook: 1, eat: 0, fly: null, kept: false, home };
          S.traverse(o => { o.userData.noBatch = true; });   // que + cá di chuyển, đổi cha lúc chạy: vẽ riêng, không gộp vào khối tĩnh của bếp (bị cắt khung theo bếp)
          function paint() {
            const k = G.cook, b = G.eat;
            F.fMat.color.copy(cRaw).lerp(cCook, k).lerp(cSmoked, G.smoked || 0).lerp(cBone, Math.max(0, (b - 0.75) / 0.25) * 0.85); F.finMat.color.copy(finRaw).lerp(finCook, k);
            F.marks.visible = k > 0.55 && b < 0.6; F.body.scale.set(0.5 * (1 - 0.72 * b), 1, 1 - 0.25 * b);   // cắn dần: thân mỏng đi, cuối còn xương
          }
          function put(o, parent, p, q, s) { parent.add(o); o.position.copy(p); o.quaternion.copy(q); o.scale.setScalar(s); }
          G.set = st => { G.st = st; S.visible = !['empty', 'swim', 'bucket', 'carried'].includes(st); F.fg.visible = !['empty', 'bucket'].includes(st); };
          G.atHome = () => { put(S, CAMP.fire.g, home.p, home.q, CAMP.fishK); put(F.fg, S, fgP, fgQ, 1); };
          G.grab = (hand, sc) => { const s = W / sc; put(S, hand, _gfA.set(0, -GRIP, 0).applyQuaternion(qGrip).multiplyScalar(s), qGrip, s); G.set('held'); };   // CHỖ CHẠM: que vào tay (khung cổ tay hand, cỡ người sc)
          G.handQ = (stickQ, out) => out.copy(stickQ).multiply(_gfQ2.copy(qGrip).invert());   // hướng cổ tay để que có hướng stickQ
          G.point = (y, out) => S.localToWorld(out.set(0, y, 0));   // điểm trên que (đv que)
          G.homeW = (y, out) => { CAMP.fire.g.updateWorldMatrix(true, false); return CAMP.fire.g.localToWorld(out.set(0, y * CAMP.fishK, 0).applyQuaternion(home.q).add(home.p)); };
          G.homeQ = out => { CAMP.fire.g.getWorldQuaternion(out); return out.multiply(home.q); };
          // chỗ đặt chân lúc cúi lấy / cắm que: CẠNH que theo tiếp tuyến vòng bếp, lửa bên tay phải (tay cầm que), cách điểm cầm 0,26 m + lùi 0,12 m ra ngoài.
          //  Đứng đối diện lửa rồi cúi ⇒ thân vươn qua tâm bếp: mũ chạm thanh ngang, vai chạm khung chữ A của giá treo, dời que đi đâu trên vòng cũng vậy.
          let reach = null;
          G.reach = out => { if (!reach) { const h = G.homeW(0, new THREE.Vector3()), g = G.homeW(GRIP, new THREE.Vector3()), d = Math.hypot(h.x - pf.x, h.z - pf.z) || 1, rx = (h.x - pf.x) / d, rz = (h.z - pf.z) / d; reach = new THREE.Vector3(g.x + rz * 0.26 + rx * 0.12, 0, g.z - rx * 0.26 + rz * 0.12); } return out.copy(reach); };
          G.stand = out => { G.reach(out); const dx = out.x - pf.x, dz = out.z - pf.z, d = Math.hypot(dx, dz) || 1, k = Math.max(0, FIRE_AVOID_R + 0.04 - d); out.x += dx / d * k; out.z += dz / d * k; return out; };   // đích đi tới: chỗ đặt chân lùi ra ngoài vòng tránh lửa (bước cuối nhích vào: engineer/tasks/meal-read.js)
          G.toss = (v) => { S.updateWorldMatrix(true, false); const p = new THREE.Vector3(), q = new THREE.Quaternion(); S.getWorldPosition(p); S.getWorldQuaternion(q); put(S, scene, p, q, W); G.fly = { v, t: 0, spin: 7 }; G.set('fly'); };
          G.toKeeper = wig => { put(F.fg, wig, _gfA.set(0, 0, 0), qSwim, 1); G.eat = 0; G.cook = 0; G.smoked = 0; paint(); G.set('swim'); };   // CHỖ CHẠM: thân cá vào khung lắc của người câu (cá rô trên lưỡi)
          G.lost = () => { G.atHome(); G.set('empty'); };   // cá rô sổng lưỡi: lại không có cá nướng
          G.toBucket = () => { G.set('bucket'); G.kept = true; };   // cá rô vào xô
          G.toHand = (hand, sc) => { const s = W / sc; put(F.fg, hand, _gfA.set(0, -0.06, 0.12), _gfQ.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)), s); G.set('carried'); };   // CHỖ CHẠM: cá rô sống vào tay (khung cổ tay, cỡ người)
          G.skewer = () => { put(F.fg, S, fgP, fgQ, 1); };
          G.replant = () => { G.atHome(); G.cook = 0; G.eat = 0; paint(); G.set('cooking'); };   // CHỖ CHẠM: cắm que cá mới cạnh lửa — sống, chưa cắn, bắt đầu nướng
          G.bite = b => { G.eat = b; paint(); };   // CHỖ CHẠM: cắn tới mức b (0–1) — thân mỏng dần, cuối còn xương
          G.smokedOn = () => { G.skewer(); G.cook = 1; G.eat = 0; G.smoked = 1; paint(); };   // CHỖ CHẠM: cá hun khói lấy từ lò xiên lại que — chín, màu khói
          G.update = (dt, h) => {
            const jump = G.lastH === undefined || Math.abs(((h - G.lastH + 36) % 24) - 12) > 0.5; G.lastH = h;
            if (jump && !['held', 'fly', 'swim', 'bucket', 'carried', 'plant'].includes(G.st)) { worldTell('grillReset'); G.atHome(); G.cook = 1; G.eat = 0; G.set(h >= 17.25 && h < 19.6 ? 'empty' : 'ready'); paint(); }   // mở trang / tua giờ: sau bữa tối tới lúc câu về thì que trống
            if (G.st === 'cooking') { G.cook = Math.min(1, G.cook + dt / (17 * 60) * (CAMP.fireRain.emberK > 0.2 ? 1 : 0)); if (G.cook >= 1) G.set('ready'); paint(); }   // ~17 phút cạnh than thì chín vàng (bếp đã dập: chờ kỹ sư nhóm lửa nhỏ)
            if (G.fly) {   // que bay theo đường đạn vào lòng bếp (~0,7 s), chạm than thì cháy mất
              const f = G.fly; f.t += dt; fallStep(S.position, f.v, dt); S.rotateX(f.spin * dt);
              if (f.t >= 0.7) { G.fly = null; G.atHome(); G.eat = 0; G.smoked = 0; paint(); G.set('empty'); }
            }
          };
          G.paint = paint;
          return G;
        })();
        worldTick('awake', 10, (dt, t, h) => grill.update(dt, h));   // MỖI KHUNG (sổ tick core/world.js, lượt 'awake' trong lượt kỹ sư — engineer/mind/loop-update.js): chín dần, que bay
