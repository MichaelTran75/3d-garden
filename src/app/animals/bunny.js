        // ===== THỎ (G 25/10 "tách mã nguồn thỏ"): hình thỏ + vòng sống mỗi khung — trước nằm chung animals/deer-crab-bunny.js + loop/main-loop-rest.js =====
        //  Thứ tự mỗi khung (bunnyTick): luống cà rốt bị huỷ (mưa / tối) → trú mưa (animals/rain-shelter.js) → chó tới gần luống → ăn ở luống
        //  (engineer/tasks/carrot-garden.js) → tập tính (animals/bunny-life.js) → mặc định: gặm – nhảy, mỗi 60 s đào 1 củ cà rốt hoang lên gặm.
        //  Củ cà rốt trước mõm (b.carrot) chỉ hiện khi đang gặm (luống 'eat' hoặc 'eatCarrot'); mọi lối bỏ dở gọi bunnyDropCarrot ----
        // ---- 1 chú thỏ random-walk ở tọa độ góc (31, _, 110) ----
        const bunnies = [], BUN_SLOW = 0.25, BUN_CAD = 0.6;   // G 24/10 tối "thỏ chạy chậm lại 50%" lần 2: 0,5 → 0,25, nhịp 0,75 → 0,6   // G 24/10 "cho thỏ chậm lại 50%": tốc độ ×0,5 mọi kiểu nhảy · nhịp nhảy ×0,75 (bước nhảy ngắn lại chút, không cuống)
        const digMarks = [];   // dấu vết ụ đất vĩnh viễn thỏ để lại: tối đa 10 hố, tự mờ sau 20 phút
        let _digTick = -1;     // throttle kiểm tra fade ~1 lần/giây
        const digMarkGeo = new THREE.SphereGeometry(0.18, 8, 6);
        extraGeometries.add(digMarkGeo);
        const dropDigMark = (e) => { scene.remove(e.m); e.m.material.dispose(); };
        const bunOK = (x, z) => { const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z)); return gi > 2 && gi < GX - 2 && gj > 2 && gj < GZ - 2 && !isWater(gi, gj) && padH(gi, gj) === null; };
        function bunny() {
          const g = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), cowWhite); body.scale.set(1.25, 0.95, 0.95); body.position.y = 0.42; body.castShadow = true; g.add(body);
          const rump = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), cowWhite); rump.position.set(-0.28, 0.46, 0); rump.castShadow = true; g.add(rump);
          const head = new THREE.Group(); head.position.set(0.4, 0.62, 0); g.add(head);
          const hd = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), cowWhite); hd.castShadow = true; head.add(hd);
          const sn = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), cowWhite); sn.position.set(0.2, -0.04, 0); head.add(sn);
          const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cowPink); nose.position.set(0.3, -0.02, 0); head.add(nose);
          for (const e of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cowDark); eye.position.set(0.14, 0.06, e * 0.13); head.add(eye); }
          const ears = [];
          for (const e of [-1, 1]) {
            const ear = new THREE.Group(); ear.position.set(-0.02, 0.18, e * 0.1); head.add(ear);
            const outer = bx(0.12, 0.46, 0.06, cowWhite, true, false); outer.position.y = 0.23; ear.add(outer);
            const inner = bx(0.07, 0.34, 0.04, cowPink, false, false); inner.position.set(0, 0.22, 0.04); ear.add(inner);
            ears.push(ear);
          }
          // chân sau: đùi tròn + bàn chân TO duỗi về trước (đặc trưng thỏ) — thay 4 chân hộp giống nhau
          for (const e of [-1, 1]) {
            const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), cowWhite); thigh.position.set(-0.26, 0.28, e * 0.2); thigh.castShadow = true; g.add(thigh);
            const foot = bx(0.3, 0.09, 0.13, cowWhite, true, false); foot.position.set(-0.16, 0.05, e * 0.2); g.add(foot);
          }
          // 2 tay trước có KHỚP VAI (group pivot) để hoạt cảnh cào đất
          const paws = [];
          for (const e of [-1, 1]) {
            const paw = new THREE.Group(); paw.position.set(0.28, 0.36, e * 0.16); g.add(paw);
            const seg = bx(0.09, 0.28, 0.09, cowWhite, true, false); seg.position.y = -0.12; paw.add(seg);
            paws.push(paw);
          }
          const tail = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), cowWhite); tail.position.set(-0.5, 0.5, 0); tail.castShadow = true; g.add(tail);
          // cà rốt + ụ đất (ẩn sẵn) ngay trước mũi — hiện ra khi đào
          const carrot = new THREE.Group(); carrot.position.set(0.62, -0.1, 0); carrot.visible = false; g.add(carrot);
          const crBody = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.32, 7), bunnyCarrotMat); crBody.rotation.x = Math.PI; crBody.position.y = 0.16; crBody.castShadow = true; carrot.add(crBody);
          for (let i = 0; i < 3; i++) { const lf = bx(0.045, 0.16, 0.045, bunnyLeafMat, false, false); lf.position.y = 0.38; lf.rotation.z = (i - 1) * 0.5; lf.rotation.y = i * 2.1; carrot.add(lf); }
          const mound = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bunnyMoundMat); mound.scale.y = 0.32; mound.position.set(0.62, 0.02, 0); mound.visible = false; g.add(mound);
          g.userData.ears = ears; g.userData.head = head; g.userData.paws = paws; g.userData.tail = tail; g.userData.nose = nose; g.userData.carrot = carrot; g.userData.mound = mound; return g;
        }
        const bunnyCarrotMat = new THREE.MeshLambertMaterial({ color: 0xe8762c }), bunnyLeafMat = new THREE.MeshLambertMaterial({ color: 0x4f8a3d }), bunnyMoundMat = new THREE.MeshLambertMaterial({ color: 0x6e5744 });
        (function () {
          const bx0 = X0 + 31, bz0 = Z0 + 110, g = bunny();
          g.scale.setScalar(0.8 * 0.8 * 0.8 * 0.9 * NATURE_SCALE); // nhỏ đi thêm 20% (G 17/10: thêm 20% nữa) · G 18/10: nhỏ thêm 10%
          g.position.set(bx0, cowY(bx0, bz0), bz0); g.rotation.y = Math.random() * 6.28; scene.add(g);
          bunnies.push({ g, ears: g.userData.ears, head: g.userData.head, paws: g.userData.paws, tail: g.userData.tail, nose: g.userData.nose, carrot: g.userData.carrot, mound: g.userData.mound, x: bx0, z: bz0, ang: Math.random() * 6.28, spd: 2.4 * BUN_SLOW, state: 'sniff', tmr: 1 + Math.random() * 2, ph: Math.random() * 6, hop: 0, digTmr: 60 });
        })();
        function bunnyDropCarrot(b) {   // bỏ dở bữa (giật mình / chó / mưa / tối): giấu củ + ụ đất tạm, tay + đầu về dáng thường
          b.carrot.visible = b.mound.visible = false; b.carrot.position.y = -0.1; b.carrot.scale.setScalar(1);
          b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0;
        }
        // dáng nhảy chung (G 25/10 "thỏ đang di chuyển bị sai, có lúc nhảy bằng đầu"): bật lên ngóc mũi, rơi xuống chúc mũi + 2 tay trước với ra trước đón đất
        //  (thỏ thật đáp bằng tay trước rồi chân sau vượt lên) — 0 khi chạm đất ⇒ liền mạch giữa các cú
        const bunnyHopPitch = b => 0.16 * Math.sin(TAU * b.hop), bunnyHopPaw = b => -0.1 - 0.45 * Math.sin(TAU * b.hop);
        function bunnyUpright(b) {   // bộ điều khiển khác (trú mưa / ra luống) giành dáng: bỏ dáng tập tính đang dở (ngồi dựng, nằm lật…), thân thẳng lại
          if (b.life && b.life.st && !/ale|thu|fle|hid|pee|avo/.test(b.life.st)) b.life.st = '';
          b.g.rotation.x = 0; b.earB = b.earY = 0; b.noseF = 3; b.tail.position.y = 0.5;
        }
        function bunnyTick(b, dt, t) {
          if (b.carrot.visible && !(b.bed && b.bed.st === 'eat') && b.state !== 'eatCarrot') bunnyDropCarrot(b);   // lưới an toàn: không bao giờ vừa nhảy vừa ngậm củ (G 25/10)
          if (b.bed && (liveWeather.state.raining || !daytimeAnimals.visible)) carrotBed.bunnyCancel(b);
          if (bunnyRain(b, dt, t, liveWeather.state.raining)) { bunnyUpright(b); return; }   // mưa: trú dưới hiên caravan
          if (b.bed && bunnyDogNear(b, dt)) { carrotBed.bunnyCancel(b); b.bedHold = t + 40; }   // chó tới: bỏ dở luống (người thì luống tự lo — kỹ sư đứng xem thỏ ăn)
          if (!(b.bedHold > t) && !(b.life && /ale|thu|fle|hid|pee|avo/.test(b.life.st)) && (b.bed || !(b.life && b.life.st)) && carrotBed.bunny(b, dt, t)) { bunnyUpright(b); bunnyEars(b, dt, t); return; }   // có khóm chín ở luống: nhảy tới nhổ ăn (đang sợ thì thôi · G 25/10: đang ngó / rửa mặt / nằm nghỉ thì chưa đi; đã đi thì thân thẳng)
          if (bunnyLife(b, dt, t, cowY(b.x, b.z))) { bunnyEars(b, dt, t); return; }   // tập tính: cảnh giác, sợ – dậm chân – chạy, rửa mặt, nghỉ trưa, flop, binky (animals/bunny-life.js)
          const gy = cowY(b.x, b.z);
          if (b.state === 'dig') {
            b.tmr -= dt;
            const mp = Math.min(1, 1 - b.tmr / 7.2), ms = 0.6 + mp * 0.7;
            b.mound.visible = true; b.mound.scale.set(ms, ms * 0.32, ms);                           // ụ đất lớn dần theo nhát cào
            if (b.tmr <= 0) {
              b.state = 'eatCarrot'; b.tmr = 12.0; b.carrot.visible = true; b.carrot.scale.setScalar(1);
              // để lại 1 ụ đất vĩnh viễn tại chỗ đào (FIFO 10 hố)
              const dm = new THREE.Mesh(digMarkGeo, bunnyMoundMat.clone()); dm.material.transparent = true;
              dm.scale.set(0.95, 0.3, 0.95).multiplyScalar(NATURE_SCALE); dm.position.set(b.x + Math.cos(b.ang) * 0.62 * NATURE_SCALE, gy + 0.02 * NATURE_SCALE, b.z + Math.sin(b.ang) * 0.62 * NATURE_SCALE); dm.receiveShadow = true; scene.add(dm);   // đặt đúng chỗ hố TRƯỚC MẶT thỏ (khớp ụ đất tạm), không phải tâm thỏ
              digMarks.push({ m: dm, born: t });
              while (digMarks.length > 10) dropDigMark(digMarks.shift());
            }
          } else if (b.state === 'eatCarrot') {
            b.tmr -= dt; b.g.position.set(b.x, gy, b.z);
            const ep = 1 - Math.max(0, b.tmr) / 12.0;
            b.carrot.position.y = -0.1 + Math.min(0.3, ep * 0.7);                                   // cà rốt nhô dần khỏi đất
            b.carrot.scale.setScalar(Math.max(0.06, 1 - ep * ep));                                  // rồi vơi dần vì bị gặm
            b.paws[0].rotation.z = b.paws[1].rotation.z = 0.9;                                      // hai tay ôm củ cà rốt
            b.head.rotation.z = -0.28 + Math.sin(t * 14) * 0.12;                                    // gật gù nhai
            if (b.tmr <= 0) {
              b.carrot.visible = false; b.mound.visible = false; b.carrot.position.y = -0.1;
              b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0;
              b.digTmr = 60; b.state = 'sniff'; b.tmr = 2 + Math.random() * 2;                       // hẹn 60s cho củ tiếp theo → vòng lặp
            }
          } else {
            b.digTmr -= dt; b.tmr -= dt;
            if (b.digTmr <= 0) { b.state = 'dig'; b.tmr = 7.2; b.hop = 0; b.g.rotation.x = 0; }      // tới giờ: dừng mọi việc, đào cà rốt (7.2s = x3)
            else if (b.tmr <= 0) {
              if (b.state === 'sniff') { b.state = 'hop'; b.tmr = 0.35 + Math.random() * 0.6; b.ang += (Math.random() - 0.5) * 1.6; }   // gặm – nhảy 1–2 cú – gặm (trước nhảy liền 1,4–3,6 s)
              else { b.state = 'sniff'; b.tmr = (1.2 + Math.random() * 2.6) * 3; } // dừng ăn cỏ lâu gấp 3 lần (3.6s - 11.4s)
            }
            if (b.state === 'hop') {
              b.hop = (b.hop + dt * 3.2 * BUN_CAD) % 1;
              const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5;          // lift when jumping
              const nx = b.x + Math.cos(b.ang) * b.spd * dt * (0.5 + lift), nz = b.z + Math.sin(b.ang) * b.spd * dt * (0.5 + lift);
              if (bunOK(nx, nz) && (!b.col || b.col.ghost > 0 || colStepOK(b.col, b.x, b.z, nx, nz, b.ang))) { b.x = nx; b.z = nz; if (b.col) b.col.stuck = 0; }
              else { b.ang += 2.3 + Math.random(); if (b.col) colStuck(b.col, dt); }   // vướng (nước, gốc cây, đồ vật thật — core/collide.js): nhảy hướng khác
              b.g.position.set(b.x, gy + lift, b.z); b.g.rotation.set(0, -b.ang, bunnyHopPitch(b));   // bật lên ngóc mũi · rơi xuống chúc mũi
              b.paws[0].rotation.z = b.paws[1].rotation.z = bunnyHopPaw(b);   // lên: tay thu sau · xuống: với trước đón đất
              b.head.rotation.z = 0;
            } else if (b.state === 'sniff') {                                     // chỉ chạy pose gặm cỏ khi đúng là sniff (không đè 1 frame lên dig vừa kích hoạt)
              b.hop = 0; b.g.position.set(b.x, gy, b.z); b.g.rotation.x = b.g.rotation.z = 0;
              b.paws[0].rotation.z = b.paws[1].rotation.z = 0;
              b.head.rotation.z = -0.32 + Math.sin(t * 10 + b.ph) * 0.1;          // cúi đầu nhai gặm cỏ (pitch đúng trục — trước dùng .x là roll)
            }
          }
          bunnyEars(b, dt, t);   // tai có quán tính theo cú nhảy
        }
        function bunnyDigFade(t) {   // kiểm 1 lần/giây là đủ cho fade 20 phút
          if (!digMarks.length || (t | 0) === _digTick) return;
          _digTick = t | 0;
          for (let i = digMarks.length - 1; i >= 0; i--) {
            const dm2 = digMarks[i], age = t - dm2.born;
            if (age > 1200) { dropDigMark(dm2); digMarks.splice(i, 1); }
            else if (age > 960) dm2.m.material.opacity = 1 - (age - 960) / 240;   // 4 phút cuối mờ dần về 0
          }
        }
