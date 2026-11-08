        // ===== HUN KHÓI CÁ trong lò nướng ghép bên lò chiminea =====
        //  Câu xong (cá rô trong xô ⇒ cầm tay trái) mà vỉ lò nướng còn chỗ (≤ 3 cá): ra trước cửa lò nướng thay vì cắm que nướng ở bếp lửa — ngồi xổm, tay phải mở
        //  cửa (bản lề mép ngoài), tay trái đặt cá lên vỉ, đóng cửa; lò chưa cháy (nhiên liệu < 5 phút) thì đẩy thêm củi vào buồng đốt cho lò nướng nóng. Cá xông
        //  theo nhiệt lò (camp/chiminea.js oven.fish). Bữa tối: que cá ngoài bếp chưa có mà vỉ có cá đã chín khói ⇒ ra lò lấy cá (xiên vào que, cầm tay phải) rồi về
        //  ghế ăn như cá nướng (engEatFish). Pha: toSmoker → smokeIn · toSmokerOut → smokeOut (engineer/tasks/camp-routine.js gọi) ----
        const _skA = new THREE.Vector3(), _skB = new THREE.Vector3(), _skC = new THREE.Vector3(), _skQ = new THREE.Quaternion(), _skQ2 = new THREE.Quaternion(), _skUp = new THREE.Vector3(0, 1, 0);
        const smokerStand = out => { CHIMINEA.oven.door(out); const y = CHIMINEA.g.rotation.y; out.x += Math.sin(y) * 0.6; out.z += Math.cos(y) * 0.6; out.y = 0; return out; };   // trước cửa lò nướng 0,6 m
        const skSm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
        // LỆNH "Nướng cá" (bảng Tools, — act 'smoke'): đang cầm cá khói ⇒ về ghế ăn · lò có cá chín ⇒ mở lò lấy · đang cầm
        //  cá vừa câu ⇒ cho vào vỉ · cá đang hun ⇒ ngồi ghế uống trà chờ (45 s xem lại lò; lửa sắp tàn < 2,5 phút ⇒ ra thêm củi: 'toStoke' → 'stoke') · chưa có
        //  cá ⇒ que cá cạnh bếp lửa (đang nướng / nướng xong) thì rút que mang sang cho cá vào vỉ hun tiếp (smokeTake), bếp trống thì ra hồ câu tới khi dính 1
        //  con (engineer/tasks/camp-routine.js — cả cảnh chỉ 1 mô hình cá dùng chung: que bếp lửa có cá thì cá rô không cắn câu). Ăn xong (engTossFish) ⇒ hết lệnh.
        const smokeNeedFish = () => CAMP.grill.st !== 'held' && CAMP.grill.st !== 'carried' && CAMP.grill.st !== 'ready' && CAMP.grill.st !== 'cooking' && CHIMINEA.oven.fish.ready() < 0 && !CHIMINEA.oven.fish.n();   // lệnh Nướng cá phải ra câu
        function smokePhase() {
          const O = CHIMINEA.oven, e = engObj;
          if (CAMP.grill.st === 'held') return e.smokeTake && O.fish.free() >= 0 ? 'toSmoker' : 'toChair';
          e.smokeTake = false;
          if (O.fish.ready() >= 0) return 'toSmokerOut';
          if (CAMP.grill.st === 'carried') return O.fish.free() >= 0 ? 'toSmoker' : 'toPlant';
          if (O.fish.n() > 0) return CHIMINEA.fuel() < 150 ? 'toStoke' : 'toChair';
          if ((CAMP.grill.st === 'ready' || CAMP.grill.st === 'cooking') && O.fish.free() >= 0) { e.smokeTake = true; return 'toGrill'; }
          return 'toFish';
        }
        function engSmokerPhase(e, dt, t) {
          const O = CHIMINEA.oven, G = CAMP.grill;
          if (e.phase === 'toStoke') { if (engStep(e, smokerStand(_skA), dt, t, pf, FIRE_AVOID_R, null)) { e.phase = 'stoke'; e.timer = 0; } return; }
          if (e.phase === 'stoke') {   // thêm củi cho lò đang hun cá: ngồi xổm trước lò, đẩy 2 khúc vào buồng đốt, đứng dậy về ghế chờ tiếp
            e.timer += dt; const k = e.timer; engStandStill(e); O.door(_skB); e.g.rotation.y = Math.atan2(_skB.x - e.g.position.x, _skB.z - e.g.position.z);
            const bend = skSm(k / 0.5) * (1 - skSm((k - 1.8) / 0.5)); engCrouch(e, 0.8 * bend); e.spineT = { x: 0.4 * bend, y: 0 }; e.head.rotation.x = 0.3 * bend;
            if (k >= 1.1 && !e.stoked) { e.stoked = true; CHIMINEA.addWood(); }
            if (k >= 2.4) { e.stoked = false; e.phase = 'toChair'; e.timer = 0; }
            return;
          }
          if (e.phase === 'toSmoker' || e.phase === 'toSmokerOut') {
            if (engStep(e, smokerStand(_skA), dt, t, pf, FIRE_AVOID_R, null)) { e.phase = e.phase === 'toSmoker' ? 'smokeIn' : 'smokeOut'; e.timer = 0; e.skSlot = e.phase === 'smokeIn' ? O.fish.free() : O.fish.ready(); }
            return;
          }
          e.timer += dt; const k = e.timer, input = e.phase === 'smokeIn';
          if (e.skSlot < 0) { O.open(0); e.phase = input ? 'toPlant' : 'toChair'; e.timer = 0; return; }   // vỉ đầy / hết cá chín: như cũ
          engStandStill(e); O.door(_skB); e.g.rotation.y = Math.atan2(_skB.x - e.g.position.x, _skB.z - e.g.position.z);
          const bend = skSm(k / 0.6) * (1 - skSm((k - 3.0) / 0.6)); engCrouch(e, 0.85 * bend); e.spineT = { x: 0.45 * bend, y: 0 }; e.head.rotation.x = 0.35 * bend;
          const ax = engAxesW(e), q = aimQ(_skQ, ax.f, _skUp);
          const open = skSm((k - 0.6) / 0.7) * (1 - skSm((k - 2.3) / 0.7)); O.open(open);
          const stick = input && G.st === 'held', doorHand = input && !stick ? 0 : 1, fishHand = 1 - doorHand;   // cất: tay phải mở cửa, tay trái cầm cá · lấy / cất cá trên que (tay phải cầm que): tay trái mở cửa
          if (k < 1.3 || k > 2.2) engHandSet(e, doorHand, O.handle(_skC), q);   // nắm tay cửa: mở (0,6–1,3 s) · đóng (2,3–3,0 s)
          else engHandSet(e, doorHand, engBodyW(e, (doorHand ? 0.2 : -0.2), 1.05, 0.3, _skC), q);
          if (k > 1.2 && k < 2.4) {   // tay kia: vào lòng lò tới vỉ
            O.fish.slot(e.skSlot, _skA); const u = skSm((k - 1.2) / 0.5) * (1 - skSm((k - 1.9) / 0.5)); engHandSet(e, fishHand, engBodyW(e, (fishHand ? 0.15 : -0.15), 1.1, 0.35, _skC).lerp(_skA, u), _skQ2.copy(q));
          }
          if (input && k >= 1.75 && (G.st === 'carried' || (stick && e.smokeTake))) { O.fish.add(); G.atHome(); G.set('empty'); e.smokeTake = false; }   // thả cá lên vỉ (cá trên que: tuốt cá khỏi que, que để lại bếp)
          if (!input && k >= 1.75 && G.st !== 'held') { O.fish.take(e.skSlot); G.smokedOn(); G.grab(e.wrists[0], e.g.scale.y); }   // lấy cá khói: xiên que, cầm tay phải
          if (!input && G.st === 'held' && k > 1.9) engCarryFish(e, skSm((k - 1.9) / 1.0));
          if (k >= 3.6) {
            O.open(0);
            if (input && CHIMINEA.fuel() < (e.act === 'smoke' ? 700 : 300) && !e.skWood) { e.skWood = true; e.timer = 3.0; CHIMINEA.addWood(); return; }   // lò chưa cháy (lệnh Nướng cá: chưa đủ ~12 phút lửa): đẩy củi vào buồng đốt (lặp nhịp cúi ngắn)
            e.skWood = false; e.phase = 'toChair'; e.timer = 0;
          }
        }
