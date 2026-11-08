        // ---- THỎ TRÚ MƯA: nhảy về khoảng khô dưới mái hiên caravan (sát vách, khe sau bàn trà — 18/10 bàn ghế dời vào dưới bạt; xa lối cửa) ----
        //  chỗ cũ (toạ độ xe 2,3 · 1,45) chật hơn thân thỏ thật — viên nang 13,8 cm chạm chân + khung bàn ở cả 16 hướng thử ⇒ dời 0,27 m tới khe giữa bàn và ghế, thoáng mọi hướng
        const bunnyShelter = VAN.toWorld(2.55, 0, 1.55), bunnyField = buildFlowField(bunnyShelter.x, bunnyShelter.z), bunnyShelterAng = Math.atan2(VAN.out.z, VAN.out.x);
        // ---- TAI THỎ có quán tính: mỗi tai là con lắc lò xo tắt dần (~2 Hz) gắn trên đầu đang chuyển động — gia tốc tới/lui của thân làm tai
        //      ngả ngược chiều (bật nhảy: tai quặt ra sau; đáp đất: tai đổ về trước rồi dội lại), gia tốc đứng chỉ tạo mô-men khi tai đã nghiêng.
        //      Hai tai lệch tần số một chút nên không đung đưa như một khối ----
        function bunnyEars(b, dt, t) {
          if (!b.ears) return;
          const p = b.g.position, h = Math.max(1e-3, Math.min(dt, 0.05));
          if (!b.earS) b.earS = { px: p.x, py: p.y, pz: p.z, vx: 0, vy: 0, vz: 0, th: [0.1, 0.1], w: [0, 0] };
          const E = b.earS, vx = (p.x - E.px) / h, vy = (p.y - E.py) / h, vz = (p.z - E.pz) / h, jump = Math.hypot(p.x - E.px, p.z - E.pz) > 1;
          const ax = jump ? 0 : (vx - E.vx) / h, ay = jump ? 0 : (vy - E.vy) / h, az = jump ? 0 : (vz - E.vz) / h;
          E.px = p.x; E.py = p.y; E.pz = p.z; E.vx = vx; E.vy = vy; E.vz = vz;
          const fwd = Math.max(-40, Math.min(40, ax * Math.cos(b.ang) + az * Math.sin(b.ang))), up = Math.max(-60, Math.min(60, ay));
          const tp = E.tp || (E.tp = [E.th[0], E.th[1]]);
          const al = fixedSteps(E, dt, PHYS_H, (hh) => {   // con lắc tai: bước cố định 120 Hz (gia tốc thân giữ nguyên trong khung), vẽ nội suy
            for (let i = 0; i < 2; i++) {
              const eb = b.earB || 0, om = TAU * (i ? 2.4 : 2.0), rest = 0.1 + 0.7 * eb + Math.sin(t * 4 + b.ph + i * 2.1) * 0.06 * (1 - Math.abs(eb));   // hơi ngả sau + khẽ ngoe nguẩy · earB: 1 úp ra sau (sợ / nghỉ), −0,2 dựng (animals/bunny/life.js)
              const acc = -om * om * (E.th[i] - rest) - 2 * 0.25 * om * E.w[i] + 0.15 * (fwd * Math.cos(E.th[i]) + up * Math.sin(E.th[i])) / 0.26;
              tp[i] = E.th[i]; E.w[i] += acc * hh; E.th[i] = Math.max(-0.6, Math.min(0.9, E.th[i] + E.w[i] * hh));
            }
          });
          for (let i = 0; i < 2; i++) { b.ears[i].rotation.z = tp[i] + (E.th[i] - tp[i]) * al; b.ears[i].rotation.y = (b.earY || 0) * Math.sin(t * 1.7 + i * 2.3); }   // earY: 2 tai xoay lệch nhau dò tiếng
          if (b.nose) b.nose.scale.setScalar(1 + 0.2 * Math.max(0, Math.sin(t * TAU * (b.noseF || 3))));   // mũi hít: cảnh giác nhanh, nghỉ chậm
        }
        function bunnyRain(b, dt, t, rain) {   // true = thỏ đang đi trú / ngồi trú (tự lo dáng)
          if (rain && !b.shelter) {
            b.shelter = 'go'; b.carrot.visible = b.mound.visible = false; b.carrot.position.y = -0.1; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0;
            if (b.state === 'dig' || b.state === 'eatCarrot') { b.state = 'sniff'; b.digTmr = 30; }
          } else if (!rain && b.shelter) { b.shelter = null; b.state = 'sniff'; b.tmr = 2 + Math.random() * 3; }
          if (!b.shelter) return false;
          if (b.shelter === 'go') {
            const dx = bunnyShelter.x - b.x, dz = bunnyShelter.z - b.z, dd = Math.hypot(dx, dz);
            if ((dd < 0.15 || (dd < 0.5 && b.hp && b.hp.stuck > 1)) && !bunAir(b)) { b.shelter = 'under'; b.hop = 0; }   // sát chỗ trú mà kẹt > 1 s (khe bàn ghế chật): ngồi luôn chỗ đang đứng
            else {
              let ux = dx / dd, uz = dz / dd;
              if (dd > 1.5) { bunNav(); const f = ffDir(bunnyField, b.x, b.z); if (f) { ux = f.x; uz = f.z; } }
              const lift = bunHop(b, dt, Math.atan2(uz, ux), b.spd * 1.25 * HOP_GO, 3.6 * BUN_CAD, { dd });   // vật cản thật (core/collide.js) — né trước khi bật (animals/bunny/hop.js)
              b.g.position.set(b.x, cowY(b.x, b.z) + lift, b.z); b.g.rotation.set(0, -b.ang, bunnyHopPitch(b));
              b.paws[0].rotation.z = b.paws[1].rotation.z = bunnyHopPaw(b); b.head.rotation.z = 0;
            }
          } else {   // ngồi thu lu dưới hiên, quay mặt ra phía mưa, mũi khụt khịt
            let da = bunnyShelterAng - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += da * Math.min(1, dt * 3);
            b.g.position.set(b.x, cowY(b.x, b.z), b.z); b.g.rotation.set(0, -b.ang, 0);
            b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = -0.08 + Math.sin(t * 11 + b.ph) * 0.025;
          }
          bunnyEars(b, dt, t);
          return true;
        }
