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
          const tp = E.tp || (E.tp = [E.th[0], E.th[1]]);
          const al = fixedSteps(E, dt, PHYS_H, (hh) => {   // con lắc tai: bước cố định 120 Hz (gia tốc thân giữ nguyên trong khung), vẽ nội suy
            for (let i = 0; i < 2; i++) {
              const om = TAU * (i ? 2.4 : 2.0), rest = 0.1 + Math.sin(t * 4 + b.ph + i * 2.1) * 0.06;   // hơi ngả sau + khẽ ngoe nguẩy
              const acc = -om * om * (E.th[i] - rest) - 2 * 0.25 * om * E.w[i] + 0.15 * (fwd * Math.cos(E.th[i]) + up * Math.sin(E.th[i])) / 0.26;
              tp[i] = E.th[i]; E.w[i] += acc * hh; E.th[i] = Math.max(-0.6, Math.min(0.9, E.th[i] + E.w[i] * hh));
            }
          });
          for (let i = 0; i < 2; i++) b.ears[i].rotation.z = tp[i] + (E.th[i] - tp[i]) * al;
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
              const mv = b.col ? colSlide(b.col, b.x, b.z, b.ang, step, dt) : [b.x + Math.cos(b.ang) * step, b.z + Math.sin(b.ang) * step]; if (mv) { b.x = mv[0]; b.z = mv[1]; }   // vật cản thật (core/collide.js)
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
        // (chó vào xe khi mưa / tối: animals/dog-brain.js — shelterTick)
