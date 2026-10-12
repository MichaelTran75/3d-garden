          for (const f of fishies) {                                            // cá bơi lang thang ngẫu nhiên (wander)
            if (f.leafCool > 0) f.leafCool -= dt;
            if (f === angling.fish) { if (f.leafT) endLeafChase(f); f.dy = f.pitch = 0; continue; } // Its existing mesh is controlled by the bait/hook for this visit.
            if (f === returningFishingFish) { updateReturningFishingFish(f, dt, t); continue; }
            if (f.ang === undefined) { f.ang = Math.random() * 6.283; f.cx = f.base.x; f.cz = f.base.z; f.vmag = 0.7 + Math.random() * 0.7; f.wob = (Math.random() - 0.5) * 0.8; f.rad = Math.max(f.rx, f.rz) + 1.6; }
            if (f.leafT && fishChaseLeaf(f, dt, t)) continue;   // đang đuổi đớp một chiếc lá
            f.wob += (Math.random() - 0.5) * 2.2 * dt; f.wob = Math.max(-1.1, Math.min(1.1, f.wob)); f.ang += f.wob * dt;   // hướng đổi ngẫu nhiên, mượt
            const bx = f.base.x - f.cx, bz = f.base.z - f.cz, distB = Math.hypot(bx, bz);
            if (distB > f.rad) { let d = Math.atan2(bz, bx) - f.ang; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283; f.ang += d * Math.min(1, (distB - f.rad) * 0.9) * dt * 3.0; }   // lượn về khi đi quá xa
            f.cx += Math.cos(f.ang) * f.vmag * dt; f.cz += Math.sin(f.ang) * f.vmag * dt;
            f.dy = (f.dy || 0) * Math.exp(-dt / 1.2); f.pitch = (f.pitch || 0) * Math.exp(-dt / 0.6);   // sau cú đớp: về dần độ sâu & tư thế bơi thường
            f.g.position.set(f.cx, f.base.y + Math.sin(t * 0.9 + f.ph) * 0.05 + f.dy, f.cz);
            f.g.rotation.set(0, -f.ang, f.pitch);
            f.swT = (f.swT ?? t) + dt; f.swim(f.swT, f.wob);   // sóng thân chạy đầu→đuôi + uốn theo hướng rẽ (đồng hồ riêng: đuổi lá thì quẫy nhanh hơn)
          }
          for (const b of bunnies) {                                  // chú thỏ: random-walk + mỗi 60s đào 1 củ cà rốt lên ăn
            if (bunnyRain(b, dt, t, liveWeather.state.raining)) continue;   // mưa: trú dưới hiên caravan
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
                if (b.state === 'sniff') { b.state = 'hop'; b.tmr = 1.4 + Math.random() * 2.2; b.ang += (Math.random() - 0.5) * 2.4; }
                else { b.state = 'sniff'; b.tmr = (1.2 + Math.random() * 2.6) * 3; } // dừng ăn cỏ lâu gấp 3 lần (3.6s - 11.4s)
              }
              if (b.state === 'hop') {
                b.hop = (b.hop + dt * 3.2) % 1;
                const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5;          // lift when jumping
                const nx = b.x + Math.cos(b.ang) * b.spd * dt * (0.5 + lift), nz = b.z + Math.sin(b.ang) * b.spd * dt * (0.5 + lift);
                if (bunOK(nx, nz)) { b.x = nx; b.z = nz; } else b.ang += 2.3 + Math.random();
                b.g.position.set(b.x, gy + lift, b.z); b.g.rotation.y = -b.ang; b.g.rotation.x = 0; // vertical posture
                b.paws[0].rotation.z = b.paws[1].rotation.z = -0.45 - lift * 0.4;   // arms retracted when jumping
                b.head.rotation.z = 0;
              } else if (b.state === 'sniff') {                                     // chỉ chạy pose gặm cỏ khi đúng là sniff (không đè 1 frame lên dig vừa kích hoạt)
                b.hop = 0; b.g.position.set(b.x, gy, b.z); b.g.rotation.x = 0;
                b.paws[0].rotation.z = b.paws[1].rotation.z = 0;
                b.head.rotation.z = -0.32 + Math.sin(t * 10 + b.ph) * 0.1;          // cúi đầu nhai gặm cỏ (pitch đúng trục — trước dùng .x là roll)
              }
            }
            bunnyEars(b, dt, t);   // tai có quán tính theo cú nhảy
          }
          const rainNow = liveWeather.state.raining;
          if (insectsAwake) {
            for (const bf of butterflies) {
              if (bflyShelter(bf, dt, t, rainNow)) continue;   // mưa: đậu cành cây cổ thụ
              if (animateInsectFlight(bf, dt) === 'arrived') nextButterflyTarget(bf);
              const bobY = Math.sin(t * 3.5 + bf.ph) * 0.18, bobX = Math.cos(t * 2.0 + bf.ph) * 0.12;
              setInsectVisualPosition(bf, bobX, bobY);
              const flap = Math.sin(t * 7.7 + bf.ph) * 0.68; bf.wL.rotation.z = flap; bf.wR.rotation.z = -flap;
            }
            for (const b of bees) {
              if (rainNow) {   // mưa: bỏ dở hoa đang hút, bay thẳng về tổ rồi chui vào trong
                if (b.state === 'sheltered') continue;
                if (b.state !== 'returning' && b.state !== 'depositing') { cancelBeeNectar(b); b.hoverTmr = 0; b.state = 'returning'; b.target.copy(hiveWorldPos); }
              } else if (b.state === 'sheltered') { b.g.visible = true; b.state = 'foraging'; pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 0; setBeePct(b); }   // tạnh: chui ra đi kiếm mật tiếp
              b.wL.rotation.z = Math.sin(t * 32 + b.ph) * 0.35; b.wR.rotation.z = -b.wL.rotation.z;
              if (b.hoverTmr > 0) {
                b.hoverTmr -= dt; setInsectVisualPosition(b, Math.sin(t * 5) * 0.04, Math.cos(t * 4) * 0.04);
                if (b.state === 'depositing') {
                  setBeePct(b, (b.hoverTmr / 2.5) * 100);
                } else {
                  setBeePct(b, b.flowersVisited * 10 + (1 - b.hoverTmr / 3.6) * 10);
                }
                if (b.hoverTmr <= 0) {
                  if (b.state === 'depositing') {
                    b.flowersVisited = 0;
                    b.state = 'foraging';
                    hiveHoneyPct = Math.min(100, hiveHoneyPct + 1); // mỗi lượt ong về tăng 1% mật tổ
                    updateHiveLoadingBar();
                  }
                  else { if (finishBeeNectar(b)) b.flowersVisited++; b.state = b.flowersVisited >= 10 ? 'returning' : 'foraging'; }
                  if (b.state === 'returning') b.target.copy(hiveWorldPos);
                  else pickBeeFlowerTarget(b.pos, b.target);
                  setBeePct(b);
                }
              } else {
                if (b.state === 'foraging' && !b.target.nectarFlower) {
                  // If every flower is resting, hover and retry once per second instead of scanning each frame.
                  b.flowerRetryTmr -= dt;
                  if (b.flowerRetryTmr <= 0) { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; }
                } else if (animateInsectFlight(b, dt) === 'arrived') {
                  if (b.state === 'returning' && rainNow) { b.state = 'sheltered'; b.g.visible = false; }   // vào tổ trú mưa
                  else if (b.state === 'returning') { b.hoverTmr = 2.5; b.state = 'depositing'; }
                  else if (reserveBeeNectar(b)) b.hoverTmr = 3.6;
                  else { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; }
                }
                setInsectVisualPosition(b, 0, Math.sin(t * 6 + b.ph) * 0.08);
              }
            }
          } else {
            // Disappearing at night interrupts feeding without spending a flower's nectar.
            for (const b of bees) cancelBeeNectar(b);
          }
          // ---- đom đóm hoạt cảnh ----
          for (const ff of fireflies) {
            ff.wL.rotation.z = Math.sin(t * 28 + ff.ph) * 0.32;
            ff.wR.rotation.z = -ff.wL.rotation.z;
            ff.sp.material.opacity = 0.55 + Math.sin(t * 3.5 + ff.ph) * 0.35;
            ff.timer -= dt;

            if (ff.state === 'paused') {
              ff.currentSpd = Math.max(0, ff.currentSpd - ff.spd * dt * 2.5);
              if (ff.timer <= 0) {
                ff.state = 'moving';
                ff.timer = 3.0 + Math.random() * 4.0;
                const angle = Math.random() * Math.PI * 2;
                const dist = 3.0 + Math.random() * 6.0;
                const tx = Math.max(X0 + 10, Math.min(X0 + 210, ff.g.position.x + Math.cos(angle) * dist));
                const tz = Math.max(Z0 + 10, Math.min(Z0 + 210, ff.g.position.z + Math.sin(angle) * dist));
                const ty = cowY(tx, tz) + 0.8 + Math.random() * 1.5;
                ff.target.set(tx, ty, tz);
              }
            } else {
              // 'moving' state
              ff.currentSpd = Math.min(ff.spd, ff.currentSpd + ff.spd * dt * 2.0);
              _flyDir.copy(ff.target).sub(ff.g.position);
              const distSq = _flyDir.lengthSq();
              if (distSq > 0.01) {
                _flyDir.normalize();
                ff.g.position.addScaledVector(_flyDir, ff.currentSpd * dt);
                // Xoay mượt về hướng bay thay vì giật cục
                let dH = Math.atan2(_flyDir.x, _flyDir.z) - ff.g.rotation.y;
                while (dH > Math.PI) dH -= 6.283;
                while (dH < -Math.PI) dH += 6.283;
                ff.g.rotation.y += dH * Math.min(1, dt * 5);
              }
              if (distSq < 0.2 || ff.timer <= 0) {
                ff.state = 'paused';
                ff.timer = 1.0 + Math.random() * 2.0;
              }
            }
            ff.g.position.y += Math.sin(t * 2.2 + ff.ph) * 0.006;
          }
          // ---- Mây trôi và mưa hiện tại dưới toàn bộ mây. ----
          updateClouds(dt, t);
          updateWeatherRain(dt, t);
          updateStorkLife(dt, t);
          if (digMarks.length && (t | 0) !== _digTick) {   // kiểm 1 lần/giây là đủ cho fade 20 phút
            _digTick = t | 0;
            for (let i = digMarks.length - 1; i >= 0; i--) {
              const dm2 = digMarks[i], age = t - dm2.born;
              if (age > 1200) { dropDigMark(dm2); digMarks.splice(i, 1); }
              else if (age > 960) dm2.m.material.opacity = 1 - (age - 960) / 240;   // 4 phút cuối mờ dần về 0
            }
          }
          if (dogObj && campObj && !dogShelterTick(dt, t)) {   // mưa: chó vào trong caravan
            const cp = campObj.g.position, circleR = 1.45, mt = t % 190;
            if (mt < 10) {
              const angle = (mt / 10) * Math.PI * 2, dx = Math.cos(angle) * circleR, dz = Math.sin(angle) * circleR;
              dogObj.position.set(cp.x + dx, cp.y + 0.12 * CAMP_SCALE, cp.z + dz); dogObj.rotation.y = -angle + Math.PI;
              const sw = Math.sin(dogGaitPh) * 0.4;
              dogObj.userData.frontPaws[0].rotation.z = sw; dogObj.userData.frontPaws[1].rotation.z = -sw;
              dogObj.userData.rearPaws[0].rotation.z = -sw; dogObj.userData.rearPaws[1].rotation.z = sw;
              dogObj.userData.frontPaws[0].position.y = dogObj.userData.frontPaws[1].position.y = -0.04 * 1.1;
              dogObj.userData.rearPaws[0].position.y = dogObj.userData.rearPaws[1].position.y = -0.02 * 1.1;
              dogObj.userData.tail.rotation.y = Math.sin(t * 18) * 0.35;
            } else {
              const layAngle = -0.5, dx = Math.cos(layAngle) * 1.55, dz = Math.sin(layAngle) * 1.55;
              dogObj.position.set(cp.x + dx, cp.y + 0.04 * CAMP_SCALE, cp.z + dz); dogObj.rotation.y = Math.atan2(-dz, -dx);
              dogObj.userData.frontPaws[0].rotation.z = 0; dogObj.userData.frontPaws[1].rotation.z = 0;
              dogObj.userData.rearPaws[0].rotation.z = 0; dogObj.userData.rearPaws[1].rotation.z = 0;
              dogObj.userData.frontPaws[0].position.y = dogObj.userData.frontPaws[1].position.y = 0.04 * 1.1;
              dogObj.userData.rearPaws[0].position.y = dogObj.userData.rearPaws[1].position.y = 0.06 * 1.1;
              dogObj.userData.tail.rotation.y = engPetting ? Math.sin(t * 17) * 0.5 : Math.sin(t * 1.5) * 0.1;   // được vuốt ve: vẫy đuôi lia lịa
            }
          }
          if (dogObj) {   // nhịp chân theo quãng đường thật + đuôi mềm XPBD (đọc lệnh vẫy từ đuôi cũ; ngủ thì cuộn đuôi)
            const md = dogObj.position.distanceTo(_dogPrev); _dogPrev.copy(dogObj.position);
            if (md < 0.5) dogGaitPh = (dogGaitPh + md * TAU / 0.36) % (TAU * 1000);
            updateSoftTail(dogTail, dt, dogObj.userData.tail.rotation.y, dogZzzGroup.visible ? 1 : 0);
          }
          if (raccoonObj) {   // state machine + FLOW FIELD: ra khỏi gỗ → chạy rông → TÌM ĐƯỜNG về hang → nghỉ trong gỗ
            const R = rac; let moving = true; R.tmr -= dt; R.chasing = false;
            if (liveWeather.state.raining) { if (R.state === 'roam') R.state = 'home'; else if (R.state === 'inside') R.tmr = Math.max(R.tmr, 2); }   // mưa: về hang khúc gỗ, ở yên trong đó tới khi tạnh
            const racOK = (x, z) => {
              const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z));
              return gi > 2 && gi < GX - 2 && gj > 2 && gj < GZ - 2 && !isWater(gi, gj);
            };
            if (R.state === 'inside') {                                        // nghỉ trong ống gỗ (nhánh này trước đây là dead code — gấu mèo không bao giờ được nghỉ)
              raccoonObj.visible = false; moving = false;
              if (R.tmr <= 0) { R.state = 'exit'; R.tmr = 5; }
            } else if (R.state === 'exit' || R.state === 'enter') {            // trườn trong lòng ống (scripted lerp)
              const A = R.state === 'exit' ? racInside : racMouth, B = R.state === 'exit' ? racMouth : racInside;
              raccoonObj.visible = true;
              const f = 1 - Math.max(0, R.tmr) / 5;
              R.x = THREE.MathUtils.lerp(A.x, B.x, f); R.z = THREE.MathUtils.lerp(A.z, B.z, f);
              raccoonObj.position.set(R.x, THREE.MathUtils.lerp(A.y, B.y, f), R.z);
              R.want = -Math.atan2(B.z - A.z, B.x - A.x);
              if (R.tmr <= 0) { if (R.state === 'exit') { R.state = 'out'; R.tmr = 5; } else { R.state = 'inside'; R.tmr = 45; } }
            } else if (R.state === 'out' || R.state === 'toMouth') {           // đi giữa miệng ống ↔ điểm tiếp cận (bám mặt đất)
              const A = R.state === 'out' ? racMouth : racApproach, B = R.state === 'out' ? racApproach : racMouth;
              const f = 1 - Math.max(0, R.tmr) / 5;
              R.x = THREE.MathUtils.lerp(A.x, B.x, f); R.z = THREE.MathUtils.lerp(A.z, B.z, f);
              raccoonObj.position.set(R.x, cowY(R.x, R.z) + 0.109 * NATURE_SCALE, R.z);
              R.want = -Math.atan2(B.z - A.z, B.x - A.x);
              if (R.tmr <= 0) { if (R.state === 'out') { R.state = 'roam'; R.tmr = 300; R.ang = Math.atan2(R.z - racHome.z, R.x - racHome.x); } else { R.state = 'enter'; R.tmr = 5; } }
            } else if (R.state === 'roam') {                                   // chạy rông random-walk mượt (thay quỹ đạo Lissajous + logic né chép đôi cũ)
              let jumpY = 0;
              if (R.jumpTmr > 0) {
                R.jumpTmr -= dt;
                const p = (0.6 - R.jumpTmr) / 0.6;
                jumpY = Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 0.45;
              }
              if (R.stopTmr > 0) {
                R.stopTmr -= dt; moving = false; R.chasing = false;
                if (R.stopTmr <= 0) { R.ang += Math.PI * 0.8 + (Math.random() - 0.5) * 1.2; }
              } else {
                // Raccoon alternates walking and sniffing (like rabbit)
                R.roamTmr -= dt;
                if (R.roamTmr <= 0) {
                  if (R.roamState === 'sniff') {
                    R.roamState = 'walk';
                    R.roamTmr = 3.0 + Math.random() * 4.0; // đi rông 3-7s
                    R.ang += (Math.random() - 0.5) * 2.0;
                  } else {
                    R.roamState = 'sniff';
                    R.roamTmr = 2.0 + Math.random() * 3.0; // hít ngửi dừng lại 2-5s
                  }
                }

                let chase = null, dMin = 3.6; // 6 voxels * 0.6 = 3.6
                if (insectsAwake) {
                  for (const bf of butterflies) { const d = Math.hypot(bf.g.position.x - R.x, bf.g.position.z - R.z); if (d < dMin) { dMin = d; chase = bf.g.position; } }
                  for (const b of bees) { const d = Math.hypot(b.g.position.x - R.x, b.g.position.z - R.z); if (d < dMin) { dMin = d; chase = b.g.position; } }
                }

                if (chase) {
                  R.ang = Math.atan2(chase.z - R.z, chase.x - R.x); R.wob = 0; R.chasing = true;
                  if (!R.wasChasing) { R.jumpCount = 0; R.wasChasing = true; }
                  if (dMin < 1.2 && R.jumpTmr <= 0 && R.jumpCount < 2) { R.jumpTmr = 0.6; R.jumpCount++; }

                  // Bắt ong bướm trong bán kính 6 voxel (3.6) -> khi chạm cự ly rất gần (< 1.0) sẽ bắt được
                  if (dMin < 1.0) {
                    for (const bf of butterflies) {
                      if (bf.g.position.distanceTo(raccoonObj.position) < 1.1 && t >= (bf.scaredUntil || 0)) {
                        bf.scaredUntil = t + 8;
                        nextButterflyTarget(bf); // đổi đích bay; mọi đoạn di chuyển vẫn được kiểm tra va chạm
                      }
                    }
                    for (const b of bees) {
                      if (b.g.position.distanceTo(raccoonObj.position) < 1.1 && t >= (b.scaredUntil || 0)) {
                        b.scaredUntil = t + 8;
                        if (b.state === 'foraging') { cancelBeeNectar(b); pickBeeFlowerTarget(b.pos, b.target); b.hoverTmr = 0; }
                      }
                    }
                  }
                } else {
                  R.wob += (Math.random() - 0.5) * 2.4 * dt; R.wob = Math.max(-1.1, Math.min(1.1, R.wob)); R.ang += R.wob * dt * 1.8; R.wasChasing = false;
                }

                if (R.roamState === 'sniff' && !R.chasing) {
                  moving = false;
                }

                if (moving) {
                  const hx = racHome.x - R.x, hz = racHome.z - R.z, hd = Math.hypot(hx, hz);
                  if (hd > 8.5) { let d2 = Math.atan2(hz, hx) - R.ang; while (d2 > 3.14159) d2 -= 6.28318; while (d2 < -3.14159) d2 += 6.28318; R.ang += d2 * Math.min(1, (hd - 8.5) * 0.8) * dt * 3; }
                  let nx = R.x + Math.cos(R.ang) * 1.55 * dt, nz = R.z + Math.sin(R.ang) * 1.55 * dt;
                  const push = racAvoidLog(nx, nz); let hit = push !== null;
                  if (push) { nx = push[0]; nz = push[1]; }
                  if (racOK(nx, nz)) { R.x = nx; R.z = nz; if (hit) R.stopTmr = 2.0; } else { R.stopTmr = 2.0; }
                }
              }
              raccoonObj.position.set(R.x, cowY(R.x, R.z) + 0.109 * NATURE_SCALE + jumpY, R.z);
              R.want = -R.ang;
              if (R.tmr <= 0) R.state = 'home';
            } else {                                                           // 'home': bảng DP dẫn về điểm tiếp cận — luồn lách qua mọi vật cản
              const dxa = racApproach.x - R.x, dza = racApproach.z - R.z, da = Math.hypot(dxa, dza);
              if (da < 0.5) { R.state = 'toMouth'; R.tmr = 5; }
              else {
                const fd = da > 1.6 ? ffDir(racField, R.x, R.z) : null;
                const vx = fd ? fd.x : dxa / da, vz = fd ? fd.z : dza / da;
                let nx = R.x + vx * 1.8 * dt, nz = R.z + vz * 1.8 * dt;
                const push = racAvoidLog(nx, nz); if (push) { nx = push[0]; nz = push[1]; }
                if (racOK(nx, nz) || fd) { R.x = nx; R.z = nz; }
                raccoonObj.position.set(R.x, cowY(R.x, R.z) + 0.109 * NATURE_SCALE, R.z);
                R.want = -Math.atan2(vz, vx);
              }
            }
            let diff = 0;
            if (moving && raccoonObj.visible) {
              diff = R.want - raccoonObj.rotation.y;
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;

              raccoonObj.rotation.y += diff * Math.min(1, dt * 3.5);             // body turns smoothly
              const sw = Math.sin(t * 12) * 0.5;
              raccoonObj.userData.legs[0].rotation.z = sw;
              raccoonObj.userData.legs[1].rotation.z = -sw;
              raccoonObj.userData.legs[2].rotation.z = -sw;
              raccoonObj.userData.legs[3].rotation.z = sw;
              raccoonObj.userData.tail.rotation.y = Math.sin(t * 8) * 0.25;
            } else {
              raccoonObj.userData.legs.forEach(l => l.rotation.z = 0);
              raccoonObj.userData.tail.rotation.y = 0;
            }
            if (raccoonObj.userData.headGroup) {
              const targetHeadZ = R.chasing ? 0.32 : 0;
              raccoonObj.userData.headGroup.rotation.z += (targetHeadZ - raccoonObj.userData.headGroup.rotation.z) * Math.min(1, dt * 6);

              // Head turns left/right (Y-axis) towards target direction before body aligns
              const targetHeadY = moving ? Math.max(-1.1, Math.min(1.1, diff)) : 0;
              raccoonObj.userData.headGroup.rotation.y += (targetHeadY - raccoonObj.userData.headGroup.rotation.y) * Math.min(1, dt * 10);
            }
          }
          if (coordMoved && coordOn && !drag) {                       // hover địa hình → cập nhật tọa độ + ghim
            coordMoved = false;
            ray.setFromCamera(ndc, camera);
            const hit = ray.intersectObjects(terrainMeshes, false)[0];
            if (hit) {
              const p = hit.point;
              const gx = Math.max(0, Math.round(p.x - X0)), gy = Math.max(0, Math.round(p.y)), gz = Math.max(0, Math.round(p.z - Z0));   // tọa độ theo góc → luôn dương, số nguyên
              coordTip.innerHTML = '<span style="color:#c0473a">X ' + gx + '</span>&nbsp;&nbsp;<span style="color:#3a7d44">Y ' + gy + '</span>&nbsp;&nbsp;<span style="color:#2f6fb0">Z ' + gz + '</span>';
              coordTip.style.display = 'block';
              if (!pin.visible) { pin.visible = true; pinDropStart = t; }   // bắt đầu hoạt ảnh thả khi vào địa hình
              pin.position.set(p.x, p.y, p.z);
              setGlow(hit.object, hit.instanceId);                          // làm sáng khối dưới mũi tên
            } else { coordTip.style.display = 'none'; pin.visible = false; clearGlow(); }
          } else if (drag) { coordTip.style.display = 'none'; pin.visible = false; clearGlow(); }
          if (!pin.visible) clearGlow();
          if (pin.visible) {                                          // mũi tên rơi từ trên xuống chạm đất (ease-out); cột & vòng tròn đỉnh cố định
            const dp = pinDropStart < 0 ? 1 : Math.min(1, (t - pinDropStart) / 0.4);
            if (dp < 1 || pinHead.position.y !== 0) pinHead.position.y = Math.pow(1 - dp, 3) * 9;
          }
          if (pin.visible && coordOn) {                               // nhãn toạ độ neo vào ĐUÔI mũi tên (đỉnh cán ~y+2.5), chiếu ra màn hình mỗi frame
            _tailV.set(pin.position.x, pin.position.y + 2.5, pin.position.z).project(camera);
            const rc = dom.getBoundingClientRect();
            coordTip.style.left = (rc.left + (_tailV.x * 0.5 + 0.5) * rc.width + 12) + 'px';
            coordTip.style.top = (rc.top + (-_tailV.y * 0.5 + 0.5) * rc.height - 10) + 'px';
          }
          updateAnimalVisibility(); updateDrawBatches();
          if (skyOn) updateSky(); renderer.render(scene, camera); mastLabel?.updateScreen(); updateZoomPct();
          if (!started) { started = true; const l = document.getElementById('loading'); if (l) l.style.display = 'none'; }
        }
        // biên dịch shader SONG SONG (KHR_parallel_shader_compile) trước khung đầu → luồng chính không khựng lúc mở trang; trình duyệt không hỗ trợ thì như cũ
        const startLoop = () => { if (!disposed && !suspended && !frameId) loop(); };
        if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(startLoop, startLoop); else startLoop();
      }
    })();
