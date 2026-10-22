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
          carrotBed.update(dt, t);   // luống cà rốt lớn dần, đất ướt sau tưới / mưa (engineer/carrot-garden.js)
          for (const b of bunnies) {                                  // chú thỏ: random-walk + mỗi 60s đào 1 củ cà rốt lên ăn
            if (b.bed && (liveWeather.state.raining || !daytimeAnimals.visible)) carrotBed.bunnyCancel(b);
            if (bunnyRain(b, dt, t, liveWeather.state.raining)) continue;   // mưa: trú dưới hiên caravan
            if (carrotBed.bunny(b, dt, t)) { bunnyEars(b, dt, t); continue; }   // có khóm chín ở luống: nhảy tới nhổ ăn
            if (bunnyLife(b, dt, t, cowY(b.x, b.z))) { bunnyEars(b, dt, t); continue; }   // tập tính: cảnh giác, sợ – dậm chân – chạy, rửa mặt, nghỉ trưa, flop, binky (animals/bunny-life.js)
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
                b.hop = (b.hop + dt * 3.2) % 1;
                const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5;          // lift when jumping
                const nx = b.x + Math.cos(b.ang) * b.spd * dt * (0.5 + lift), nz = b.z + Math.sin(b.ang) * b.spd * dt * (0.5 + lift);
                if (bunOK(nx, nz) && (!b.col || b.col.ghost > 0 || colStepOK(b.col, b.x, b.z, nx, nz, b.ang))) { b.x = nx; b.z = nz; if (b.col) b.col.stuck = 0; }
                else { b.ang += 2.3 + Math.random(); if (b.col) colStuck(b.col, dt); }   // vướng (nước, gốc cây, đồ vật thật — core/collide.js): nhảy hướng khác
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
              if (bf.mode === 'hand' && envBflyHand(bf, dt, t)) continue;   // đang bay tới / đậu trên tay kỹ sư (engineer/env-react.js)
              if (bflyShelter(bf, dt, t, rainNow)) continue;   // mưa: đậu cành cây cổ thụ
              if (animateInsectFlight(bf, dt) === 'arrived') nextButterflyTarget(bf);
              const beat = bflyFlap(bf, dt), bobY = Math.sin(t * 3.5 + bf.ph) * 0.18 + beat, bobX = Math.cos(t * 2.0 + bf.ph) * 0.12;   // vỗ – lượn theo loài, thân nhấp nhô theo nhịp
              setInsectVisualPosition(bf, bobX, bobY);
            }
            const beeOK = beeWeatherOK();   // ong ra tổ khi khô, ban ngày, gió < 24 km/h, ≥ 12 °C (animals/beehive.js)
            for (const b of bees) beeTick(b, dt, t, beeOK);   // bay · đáp chạm hoa / vành tổ · hút mật · bò vào / ra tổ (animals/insects.js)
          } else {
            // Disappearing at night interrupts feeding without spending a flower's nectar.
            for (const b of bees) cancelBeeNectar(b);
          }
          beehive.update(dt, t);   // ong thợ bò trên bánh sáp trong tổ giỏ rơm
          // ---- đom đóm hoạt cảnh ----
          fungi.glow(nightFactor, t);   // nấm phát quang xanh lục khi trời tối (nature/fungi.js)
          for (const ff of fireflies) {
            const fly = !ff.perch;   // con cái đậu trên cỏ (đom đóm quanh cây cổ thụ): cánh xếp, chỉ nháy
            ff.wL.rotation.z = ff.wR.rotation.z = fly ? 0.35 + Math.sin(t * 60 + ff.ph) * 0.6 : 0;   // cánh màng vỗ (2 bên đối xứng gương: cùng góc)
            if (fly) ff.elL.rotation.set(0, -0.3, 0.55 + 0.04 * Math.sin(t * 30 + ff.ph)); else ff.elL.rotation.set(0, 0, 0); ff.elR.rotation.copy(ff.elL.rotation);   // cánh cứng nâng chếch, toả 2 bên
            ff.fp += dt / ff.per; ff.fl += dt;
            if (ff.fp >= 1) {   // tới nhịp ⇒ chớp; con trong bán kính 5 bị kéo pha lên (ghép xung) ⇒ dần chớp cùng nhịp
              ff.fp -= 1; ff.fl = 0;
              for (const o of fireflies) if (o !== ff && o.fl > 0.6 && o.g.position.distanceToSquared(ff.g.position) < 25) o.fp = Math.min(0.999, o.fp * 1.07 + 0.015);
            }
            const I = ff.fl < 0.08 ? ff.fl / 0.08 : ff.fl < 0.23 ? 1 : Math.max(0, 1 - (ff.fl - 0.23) / 0.3), L = 0.06 + 0.94 * I;   // sáng: lên 0,08 s · giữ 0,15 s · tắt dần 0,3 s
            ff.lampM.color.setRGB(0.85 + 0.05 * L, 0.82 + 0.18 * L, 0.66 - 0.3 * L); ff.sp.material.opacity = (0.12 + 0.88 * I) * (ff.dim || 1); ff.sp.scale.setScalar(0.22 + 0.4 * I * (ff.dim || 1));
            if (!fly) continue;
            ff.g.position.y += 0.35 * I * dt;   // nét "J": vọt lên khi chớp
            ff.timer -= dt;

            if (ff.state === 'paused') {
              ff.currentSpd = Math.max(0, ff.currentSpd - ff.spd * dt * 2.5);
              if (ff.timer <= 0) {
                ff.state = 'moving';
                ff.timer = 3.0 + Math.random() * 4.0;
                const angle = Math.random() * Math.PI * 2;
                const dist = 3.0 + Math.random() * 6.0;
                let tx = Math.max(X0 + 10, Math.min(X0 + 210, ff.g.position.x + Math.cos(angle) * dist));
                let tz = Math.max(Z0 + 10, Math.min(Z0 + 210, ff.g.position.z + Math.sin(angle) * dist));
                if (ff.home) { const rr = ff.rad * Math.sqrt(Math.random()); tx = ff.home.x + Math.cos(angle) * rr; tz = ff.home.z + Math.sin(angle) * rr; }   // đom đóm cây cổ thụ: lượn quanh gốc, lên tới tán
                const ty = cowY(tx, tz) + (ff.home ? 0.5 + Math.random() * 3.2 : 0.8 + Math.random() * 1.5);
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
          updateStorkLife(dt, t); updateSparrows(dt, t);
          if (digMarks.length && (t | 0) !== _digTick) {   // kiểm 1 lần/giây là đủ cho fade 20 phút
            _digTick = t | 0;
            for (let i = digMarks.length - 1; i >= 0; i--) {
              const dm2 = digMarks[i], age = t - dm2.born;
              if (age > 1200) { dropDigMark(dm2); digMarks.splice(i, 1); }
              else if (age > 960) dm2.m.material.opacity = 1 - (age - 960) / 240;   // 4 phút cuối mờ dần về 0
            }
          }
          if (dogObj) dogBrain.update(dt, t);   // chó: hành vi (nằm sưởi · vươn vai · đánh hơi · theo chủ · uống nước · chạy vòng · vào xe khi mưa/tối) + dáng đi IK (animals/dog-brain.js)
          if (raccoonObj) raccoonBrain.update(dt, t);   // gấu mèo: chạng vạng → đêm, kiếm ăn, cào bới, đứng 2 chân, trộm táo, bỏ chạy về hang (animals/raccoon-brain.js)
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
          fluids.update(dt, t, rainK);   // gửi bước mô phỏng nước + khói cho luồng phụ (kèm các cú chạm nước trong khung này), nhận kết quả bước trước
          if (skyOn) updateSky(); vanLineTone(nightFactor > 0.5); nightSky.update(dt, t, skyOn); fitSunShadow(); updateCloseLod(); droneToy.render(); vanPartsTick(dt); trimWatch(dt); trimKit.tick(dt, t); waterPump.tick(dt, t); footprints.tick(dt); chickens.update(dt, t); hovTick(); camFollowTick(dt); followTagsTick(); btnTagsTick(); radio.tick(dt); mossTick(); renderer.render(scene, camera); mastLabel?.updateScreen(); updateZoomPct(); simNeedsTick(t); toolsTick(t); engineTick(dt, t);
          if (!started) { started = true; const l = document.getElementById('loading'); if (l) l.style.display = 'none'; }
        }
        // biên dịch shader SONG SONG (KHR_parallel_shader_compile) trước khung đầu → luồng chính không khựng lúc mở trang; trình duyệt không hỗ trợ thì như cũ
        const startLoop = () => { if (!disposed && !suspended && !frameId) loop(); };
        if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(startLoop, startLoop); else startLoop();
      }
    })();
