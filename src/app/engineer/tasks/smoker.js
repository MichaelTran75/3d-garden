        // ===== HUN KHÓI CÁ trong lò nướng ghép bên lò chiminea (G 24/10 khuya "có thể để smoke fish inside khi câu cá xong") =====
        //  Câu xong (cá rô trong xô ⇒ cầm tay trái) mà vỉ lò nướng còn chỗ (≤ 3 cá): ra trước cửa lò nướng thay vì cắm que nướng ở bếp lửa — ngồi xổm, tay phải mở
        //  cửa (bản lề mép ngoài), tay trái đặt cá lên vỉ, đóng cửa; lò chưa cháy (nhiên liệu < 5 phút) thì đẩy thêm củi vào buồng đốt cho lò nướng nóng. Cá xông
        //  theo nhiệt lò (camp/chiminea.js oven.fish). Bữa tối: que cá ngoài bếp chưa có mà vỉ có cá đã chín khói ⇒ ra lò lấy cá (xiên vào que, cầm tay phải) rồi về
        //  ghế ăn như cá nướng (engEatFish). Pha: toSmoker → smokeIn · toSmokerOut → smokeOut (engineer/tasks/camp-routine.js gọi) ----
        const _skA = new THREE.Vector3(), _skB = new THREE.Vector3(), _skC = new THREE.Vector3(), _skQ = new THREE.Quaternion(), _skQ2 = new THREE.Quaternion(), _skUp = new THREE.Vector3(0, 1, 0);
        const smokerStand = out => { chiminea.oven.door(out); const y = chiminea.g.rotation.y; out.x += Math.sin(y) * 0.6; out.z += Math.cos(y) * 0.6; out.y = 0; return out; };   // trước cửa lò nướng 0,6 m
        const skSm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
        function engSmokerPhase(e, dt, t) {
          const O = chiminea.oven, G = grill;
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
          const doorHand = input ? 0 : 1, fishHand = input ? 1 : 0;   // cất: tay phải mở cửa, tay trái cầm cá · lấy: tay phải lấy cá, tay trái mở cửa
          if (k < 1.3 || k > 2.2) engHandSet(e, doorHand, O.handle(_skC), q);   // nắm tay cửa: mở (0,6–1,3 s) · đóng (2,3–3,0 s)
          else engHandSet(e, doorHand, engBodyW(e, (doorHand ? 0.2 : -0.2), 1.05, 0.3, _skC), q);
          if (k > 1.2 && k < 2.4) {   // tay kia: vào lòng lò tới vỉ
            O.fish.slot(e.skSlot, _skA); const u = skSm((k - 1.2) / 0.5) * (1 - skSm((k - 1.9) / 0.5)); engHandSet(e, fishHand, engBodyW(e, (fishHand ? 0.15 : -0.15), 1.1, 0.35, _skC).lerp(_skA, u), _skQ2.copy(q));
          }
          if (input && k >= 1.75 && G.st === 'carried') { O.fish.add(); G.atHome(); G.set('empty'); }   // thả cá lên vỉ
          if (!input && k >= 1.75 && G.st !== 'held') { O.fish.take(e.skSlot); G.skewer(); G.cook = 1; G.eat = 0; G.smoked = 1; G.paint(); G.grab(e, 0); }   // lấy cá khói: xiên que, cầm tay phải
          if (!input && G.st === 'held' && k > 1.9) engCarryFish(e, skSm((k - 1.9) / 1.0));
          if (k >= 3.6) {
            O.open(0);
            if (input && chiminea.fuel() < 300 && !e.skWood) { e.skWood = true; e.timer = 3.0; chiminea.addWood(); return; }   // lò chưa cháy: đẩy củi vào buồng đốt (lặp nhịp cúi ngắn)
            e.skWood = false; e.phase = 'toChair'; e.timer = 0;
          }
        }
