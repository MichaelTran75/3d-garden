        // ---- trú mưa: thỏ nhảy về khoảng khô dưới mái hiên caravan (sát vách, xa ghế và lối cửa); chó chạy vào trong xe nằm giữa lối đi ----
        caravanObj.updateMatrixWorld(true);
        const vanPt = (x, y, z) => caravanObj.localToWorld(new THREE.Vector3(x, y, z)), vanOut = new THREE.Vector3(Math.sin(caravanObj.rotation.y), 0, Math.cos(caravanObj.rotation.y));
        const bunnyShelter = vanPt(2.25, 0, 1.95), bunnyField = buildFlowField(bunnyShelter.x, bunnyShelter.z), bunnyShelterAng = Math.atan2(vanOut.z, vanOut.x);
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
          for (let i = 0; i < 2; i++) {
            const om = TAU * (i ? 2.4 : 2.0), rest = 0.1 + Math.sin(t * 4 + b.ph + i * 2.1) * 0.06;   // hơi ngả sau + khẽ ngoe nguẩy
            const acc = -om * om * (E.th[i] - rest) - 2 * 0.25 * om * E.w[i] + 0.15 * (fwd * Math.cos(E.th[i]) + up * Math.sin(E.th[i])) / 0.26;
            E.w[i] += acc * h; E.th[i] = Math.max(-0.6, Math.min(0.9, E.th[i] + E.w[i] * h));
            b.ears[i].rotation.z = E.th[i];
          }
        }
        function bunnyRain(b, dt, t, rain) {   // true = thỏ đang đi trú / ngồi trú (tự lo dáng)
          if (rain && !b.shelter) {
            b.shelter = 'go'; b.carrot.visible = b.mound.visible = false; b.carrot.position.y = -0.1; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0;
            if (b.state === 'dig' || b.state === 'eatCarrot') { b.state = 'sniff'; b.digTmr = 30; }
          } else if (!rain && b.shelter) { b.shelter = null; b.state = 'sniff'; b.tmr = 2 + Math.random() * 3; }
          if (!b.shelter) return false;
          if (b.shelter === 'go') {
            const dx = bunnyShelter.x - b.x, dz = bunnyShelter.z - b.z, dd = Math.hypot(dx, dz);
            if (dd < 0.15) { b.shelter = 'under'; b.hop = 0; }
            else {
              let ux = dx / dd, uz = dz / dd;
              if (dd > 1.5) { const f = ffDir(bunnyField, b.x, b.z); if (f) { ux = f.x; uz = f.z; } }
              let da = Math.atan2(uz, ux) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += dd < 1 ? da : da * Math.min(1, dt * 6);
              b.hop = (b.hop + dt * 3.6) % 1; const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5, step = Math.min(dd, b.spd * 1.25 * dt * (0.5 + lift));
              b.x += Math.cos(b.ang) * step; b.z += Math.sin(b.ang) * step;
              b.g.position.set(b.x, cowY(b.x, b.z) + lift, b.z); b.g.rotation.y = -b.ang;
              b.paws[0].rotation.z = b.paws[1].rotation.z = -0.45 - lift * 0.4; b.head.rotation.z = 0;
            }
          } else {   // ngồi thu lu dưới hiên, quay mặt ra phía mưa, mũi khụt khịt
            let da = bunnyShelterAng - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += da * Math.min(1, dt * 3);
            b.g.position.set(b.x, cowY(b.x, b.z), b.z); b.g.rotation.y = -b.ang;
            b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = -0.08 + Math.sin(t * 11 + b.ph) * 0.025;
          }
          bunnyEars(b, dt, t);
          return true;
        }
        const dogDoorFar = vanPt(0.33, 0, 3.2), dogDoorStep = vanPt(0.33, 0, 1.9), dogInside = vanPt(0.33, 1.07, 1.0), dogBed = vanPt(-0.5, 1.07, 1.12);
        const dogLie = campObj.g.position.clone().add(new THREE.Vector3(Math.cos(-0.5) * 1.55, 0, Math.sin(-0.5) * 1.55));
        const dogDoorField = buildFlowField(dogDoorFar.x, dogDoorFar.z), dogFireField = buildFlowField(dogLie.x, dogLie.z);
        const dogRain = { st: null, t: 0, yaw: 0 };
        let engPetting = false; const _petTgt = new THREE.Vector3();   // kỹ sư đang vuốt chó → chó vẫy đuôi
        const dogPettable = () => !dogRain.st && (clock.elapsedTime % 190) >= 10 && (clock.elapsedTime % 190) < 180;   // chó đang nằm cạnh lửa, không sắp chạy vòng
        // Zzz của chó: 3 chữ z nhỏ bay ngắn ngay trên đầu chó đang ngủ (nhìn qua vách xe mờ, rõ nhất ở chế độ xem xuyên)
        const dogZzzGroup = new THREE.Group(); dogZzzGroup.visible = false; dogZzzGroup.name = 'Zzz của chó'; scene.add(dogZzzGroup);
        const dogZzz = [], _dogHead = new THREE.Vector3();
        {
          const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
          ctx.font = 'bold 48px Outfit, sans-serif'; ctx.fillStyle = '#E2D6C0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#243240'; ctx.shadowBlur = 6; ctx.fillText('z', 32, 34);
          const zTex = new THREE.CanvasTexture(c);
          for (let n = 0; n < 3; n++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthWrite: false })); dogZzzGroup.add(sp); dogZzz.push({ m: sp, ph: n / 3 }); }
        }
        if (!liveWeather.wildlifeAwake) {   // mở trang lúc tối: chó đã nằm ngủ sẵn trong xe
          dogRain.st = 'in'; dogObj.position.set(dogBed.x, dogInside.y + 0.02 * CAMP_SCALE, dogBed.z); dogObj.rotation.y = Math.atan2(-vanOut.z, vanOut.x);
        }
        function dogShelterTick(dt, t) {   // true = chó đang vào xe / nằm trong xe / ra lại bếp lửa (thay vòng chạy quanh lửa) — khi mưa hoặc tối (18:30–06:00)
          const rain = liveWeather.state.raining, night = !liveWeather.wildlifeAwake, want = rain || night, D = dogRain, p = dogObj.position, u = dogObj.userData;
          if (want && (!D.st || D.st === 'toFire')) D.st = 'toDoor';
          else if (!want && D.st) { if (D.st === 'toDoor') D.st = 'toFire'; else if (D.st === 'toBed' || D.st === 'in') D.st = 'toExit'; }
          if (!D.st) { dogZzzGroup.visible = false; return false; }
          let walk = false, hx = 0, hz = 0;
          const go = (tx, tz, field, spd) => {
            const dx = tx - p.x, dz = tz - p.z, dd = Math.hypot(dx, dz);
            if (dd < 0.06) return true;
            let ux = dx / dd, uz = dz / dd;
            if (field && dd > 1.2) { const f = ffDir(field, p.x, p.z); if (f) { ux = f.x; uz = f.z; } }
            const s = Math.min(dd, spd * dt); p.x += ux * s; p.z += uz * s; hx = ux; hz = uz; walk = true; return false;
          };
          const floorY = dogInside.y, groundAt = () => cowY(p.x, p.z);
          if (D.st === 'toDoor') { if (go(dogDoorFar.x, dogDoorFar.z, dogDoorField, 2.2)) D.st = 'toStep'; p.y = groundAt() + 0.12 * CAMP_SCALE; }
          else if (D.st === 'toStep') { if (go(dogDoorStep.x, dogDoorStep.z, null, 1.4)) { D.st = 'hopIn'; D.t = 0; } p.y = groundAt() + 0.12 * CAMP_SCALE; }
          else if (D.st === 'hopIn' || D.st === 'hopOut') {   // nhảy lên / xuống bậc cửa hông
            D.t = Math.min(1, D.t + dt / 0.55); const inn = D.st === 'hopIn', A = inn ? dogDoorStep : dogInside, B = inn ? dogInside : dogDoorStep;
            const ya = (inn ? cowY(A.x, A.z) : floorY) + 0.12 * CAMP_SCALE, yb = (inn ? floorY : cowY(B.x, B.z)) + 0.12 * CAMP_SCALE;
            p.x = A.x + (B.x - A.x) * D.t; p.z = A.z + (B.z - A.z) * D.t; p.y = ya + (yb - ya) * D.t + Math.sin(Math.PI * D.t) * 0.3;
            hx = B.x - A.x; hz = B.z - A.z; walk = true;
            if (D.t >= 1) D.st = inn ? 'toBed' : 'toFire';
          }
          else if (D.st === 'toBed') { if (go(dogBed.x, dogBed.z, null, 0.9)) D.st = 'in'; p.y = floorY + 0.12 * CAMP_SCALE; }
          else if (D.st === 'toExit') { if (go(dogInside.x, dogInside.z, null, 0.9)) { D.st = 'hopOut'; D.t = 0; } p.y = floorY + 0.12 * CAMP_SCALE; }
          else if (D.st === 'toFire') { if (go(dogLie.x, dogLie.z, dogFireField, 2.0)) { D.st = null; return false; } p.y = groundAt() + 0.12 * CAMP_SCALE; }
          else { p.y = floorY + (night ? 0.02 : 0.04) * CAMP_SCALE; hx = dogInside.x - dogBed.x; hz = dogInside.z - dogBed.z; }   // 'in': nằm dưới gầm bàn vuông, mặt nhìn ra cửa (tối thì nằm ép sát sàn ngủ)
          const sleeping = D.st === 'in' && night;
          dogObj.rotation.z += ((sleeping ? -0.12 : 0) - dogObj.rotation.z) * Math.min(1, dt * 2);   // ngủ: gục mõm xuống sàn
          u.body.scale.y = sleeping ? 1 + 0.05 * Math.sin(t * 1.6) : 1;                               // thở chậm đều
          dogZzzGroup.visible = sleeping;
          if (sleeping) {
            u.head.getWorldPosition(_dogHead);
            for (const z of dogZzz) {   // 3 chữ z nhỏ hơn của kỹ sư, lắc nhẹ, mờ dần khi lên cao
              const k = (t * 0.32 + z.ph) % 1;
              z.m.position.set(_dogHead.x + Math.sin(t * 1.7 + z.ph * 6) * 0.07, _dogHead.y + 0.12 + k * 1.3, _dogHead.z);   // nhỏ & bay ngắn: lơ lửng ngay trên đầu chó
              z.m.material.opacity = 0.9 * Math.min(1, (1 - k) * 2.6); z.m.scale.setScalar(0.15 + k * 0.28);
            }
          }
          if (hx || hz) { D.yaw = Math.atan2(-hz, hx); let turn = D.yaw - dogObj.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); dogObj.rotation.y += turn * Math.min(1, dt * (walk ? 8 : 3)); }
          const sw = walk ? Math.sin(dogGaitPh) * 0.4 : 0;
          u.frontPaws[0].rotation.z = sw; u.frontPaws[1].rotation.z = -sw; u.rearPaws[0].rotation.z = -sw; u.rearPaws[1].rotation.z = sw;
          u.frontPaws[0].position.y = u.frontPaws[1].position.y = (walk ? -0.04 : 0.04) * 1.1;
          u.rearPaws[0].position.y = u.rearPaws[1].position.y = (walk ? -0.02 : 0.06) * 1.1;
          u.tail.rotation.y = walk ? Math.sin(t * 18) * 0.35 : sleeping ? 0.25 : Math.sin(t * 1.5) * 0.1;   // ngủ: đuôi cuộn sát thân
          return true;
        }
