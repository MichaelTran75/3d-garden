        const SHADER_TIME_LOOP = 1140 * Math.PI;              // ≈ 3581 s: ω = 3,0 · 2,2 · 7,5 (nước) và 3,5 (cỏ cây) đều quay số nguyên vòng
        const STAR_TIME_LOOP = 670 * 2 * Math.PI / 1.17;      // ≈ 3598 s: nhịp lấp lánh ω = 1,17 quay đúng 670 vòng
        function loop() {
          if (disposed || suspended) { frameId = 0; return; }
          frameId = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05);
          const insectsAwake = liveWeather.wildlifeAwake;
          if (insectsAwake) flightNav.update();
          if (autoRotate) tTheta += 0.0008; theta += (tTheta - theta) * 0.08; phi += (tPhi - phi) * 0.08;
          const panSpd = 65 * dt / camera.zoom;
          if (keys['w'] || keys['arrowup']) { target.x += Math.cos(theta) * panSpd; target.z += Math.sin(theta) * panSpd; autoRotate = false; }
          if (keys['s'] || keys['arrowdown']) { target.x -= Math.cos(theta) * panSpd; target.z -= Math.sin(theta) * panSpd; autoRotate = false; }
          if (keys['a'] || keys['arrowleft']) { target.x += Math.sin(theta) * panSpd; target.z -= Math.cos(theta) * panSpd; autoRotate = false; }
          if (keys['d'] || keys['arrowright']) { target.x -= Math.sin(theta) * panSpd; target.z += Math.cos(theta) * panSpd; autoRotate = false; }
          camera.position.set(target.x + radius * Math.sin(phi) * Math.cos(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.sin(theta)); camera.lookAt(target);
          const t = clock.elapsedTime;
          if (starsGroup) starsGroup.rotation.y = t * 0.0012;
          // thời gian đưa vào shader quay vòng ở chu kỳ chung của các tần số đang dùng → liền mạch, và giữ độ chính xác float32 dù trang mở nhiều ngày
          if (starMaterial) starMaterial.uniforms.uTime.value = t % STAR_TIME_LOOP;
          updateSceneWind(dt, t);   // hướng + tốc độ gió thật, cơn giật, lò xo thân cây (trước khi cây/lá/khói dùng)
          for (const u of windUniforms.values()) u.uTime.value = t % SHADER_TIME_LOOP;
          // tua-bin: quay theo gió TẠI ĐỘ CAO TRỤC (profile log + cơn giật) kiểu đường công suất — dưới 2,5 m/s chạy không tải chậm,
          // tăng dần tới định mức ~11 m/s, trên 25 m/s cắt (xoay cánh tránh gió, dừng); rô-to nặng nên đổi tốc độ chậm (quán tính ~5 s)
          for (const r of rotors) {
            if (!r.hub) { r.hub = r.rotor.getWorldPosition(new THREE.Vector3()); r.hubZ = Math.max(2, r.hub.y - cowY(r.hub.x, r.hub.z)); r.w = r.sp * 0.5; }
            windAt(r.hub.x, r.hub.y, r.hub.z, r.hubZ, _rotW);
            const V = sceneWind.ms * Math.hypot(_rotW.x, _rotW.z) / sceneWind.U;   // m/s tại trục
            const g = V > 25 ? 0 : V < 2.5 ? 0.12 : 0.12 + 1.6 * Math.min(1, (V - 2.5) / 8.5);
            r.w += (r.sp * g - r.w) * (1 - Math.exp(-dt / 5)); r.rotor.rotation.z += r.w * dt;
          }
          const dox = damMist.length ? damMist[0].wx : 0, doz = damMist.length ? damMist[0].wz : 0;
          for (const f of fallBlocks) {   // bọt/màn nước = instance: compose ma trận vào scratch rồi setMatrixAt (85 mesh lẻ → 4 draw call)
            const p = (t * 0.16 + f.ph) % 1;
            if (p < 0.62) {
              const k = p / 0.62, smK = k * k * (3 - 2 * k);
              _dmP.set(f.x, f.chuteTop - (f.chuteTop - f.chuteBot) * smK, f.z0 + f.dz * smK);
              _dmQ.setFromEuler(_dmE.set(0.55, 0, 0)); _dmS.set(1, 1 + smK * 0.25, 1);
            } else {
              const k = (p - 0.62) / 0.38, smK = Math.sin(k * Math.PI * 0.5);
              windAt(dox + f.x, f.chuteBot + 2, doz + f.z0 + f.dz, 2, _plA);   // bọt văng khỏi mũi phóng: bay trong gió nên dạt theo chiều gió
              _dmP.set(f.x + _plA.x * k * 0.7, f.chuteBot + Math.sin(k * Math.PI * 0.75) * 2.2 - k * 0.8, f.z0 + f.dz + k * 4.2 + _plA.z * k * 0.7);
              _dmQ.setFromEuler(_dmE.set(-0.45 + k * 0.95, 0, 0)); _dmS.set(1 + smK * 0.2, 1 - smK * 0.25, 1 + smK * 0.2);
            }
            f.im.setMatrixAt(f.id, _dmM.compose(_dmP, _dmQ, _dmS));
          }
          _dmQ.identity();
          // bọt mặt nước trôi lệch theo gió mặt nước
          for (const j of tailJets) { const p = (t * (j.sp * 0.5) + j.ph) % 1; windAt(dox + j.x, j.y, doz + j.z0 + p * j.len, 0.5, _plA); _dmP.set(j.x + Math.sin(t * 1.0 + j.ph * 6) * 0.5 + _plA.x * p * 1.2, j.y + Math.sin(p * 3.14159) * 0.25, j.z0 + p * j.len + _plA.z * p * 1.2); _dmS.setScalar(j.sc * Math.max(0.08, Math.sin(p * 3.14159))); j.im.setMatrixAt(j.id, _dmM.compose(_dmP, _dmQ, _dmS)); }   // nước xả hạ lưu chậm 1/2
          // màn hơi chân đập & bụi nước: bị gió (độ cao ~3 đv, gồm cơn giật) đẩy lệch; đập không xoay nên trục cục bộ = thế giới

          for (const s of sprayBits) { const a = (t * (s.sp * 0.5) + s.ph) % 1, kk = Math.sin(a * 3.14159); windAt(dox + s.x, s.y0 + kk * s.h, doz + s.z, 1 + kk * s.h, _plA); _dmP.set(s.x + Math.sin(t * 1.2 + s.ph * 7) * 0.3 + _plA.x * a * 1.4, s.y0 + kk * s.h + _plA.y * a * 0.5, s.z + _plA.z * a * 1.4); _dmS.setScalar(s.r * (0.5 + 0.7 * kk)); s.im.setMatrixAt(s.id, _dmM.compose(_dmP, _dmQ, _dmS)); }
          for (const im of damIMs) im.instanceMatrix.needsUpdate = true;
          const cowWantHut = cowHutWanted();
          for (const c of cows) {
            if (cowHome(c, dt, t, cowWantHut)) continue;   // đang về chuồng / ở trong ô / rời chuồng ra bãi
            c.tmr -= dt;
            if (c.tmr <= 0) {
              if (c.state === 'graze') { c.state = Math.random() < 0.5 ? 'walk' : 'rest'; c.tmr = c.state === 'walk' ? 2 + Math.random() * 3.5 : 18 + Math.random() * 22; if (c.state === 'walk') c.ang += (Math.random() - 0.5) * 1.7; }
              else if (c.state === 'walk') { c.state = Math.random() < 0.6 ? 'graze' : 'rest'; c.tmr = c.state === 'graze' ? 6 + Math.random() * 10 : 18 + Math.random() * 20; }
              else { c.state = 'graze'; c.tmr = 5 + Math.random() * 10; }
            }                                              // nghỉ lâu hơn, thư giãn hơn
            const _gY = cowY(c.x, c.z);
            // gập 4 chân: chân trước gối hướng trước · chân sau gối hướng sau → cuộn gọn dưới bụng
            const foldLegs = (amt) => {
              if (!c.legs) return; for (let li = 0; li < 4; li++) {
                const L = c.legs[li], fr = li < 2;
                L.hip.rotation.z = (fr ? 1.5 : -1.5) * amt; L.knee.rotation.z = (fr ? -1.5 : 1.5) * amt;
              }
            };
            if (c.state === 'rest') {
              c.restY = Math.min(1, c.restY + dt * 0.85);                                                          // hạ người xuống từ từ
              c.g.position.set(c.x, _gY - c.restY * 0.8 * NATURE_SCALE, c.z);
              c.head.rotation.z = -0.24 + Math.sin(t * 0.7 + c.ph) * 0.05; c.head.rotation.x = Math.sin(t * 0.45 + c.ph) * 0.04;  // đầu lim dim, thở khẽ
              foldLegs(c.restY);
              if (c.tail) c.tail.rotation.z = 0.22 + Math.sin(t * 1.1 + c.ph) * 0.08;
            } else if (c.state === 'graze') {
              c.restY = Math.max(0, c.restY - dt * 1.3);                                                           // đứng dậy mượt
              c.g.position.set(c.x, _gY - c.restY * 0.8 * NATURE_SCALE, c.z);
              c.head.rotation.z = -0.62 + Math.sin(t * 2.5 + c.ph) * 0.14; c.head.rotation.x = 0;
              foldLegs(c.restY);
              if (c.tail) c.tail.rotation.z = 0.22 + Math.sin(t * 2.0 + c.ph) * 0.16;
            } else {
              c.restY = Math.max(0, c.restY - dt * 1.8);
              const nx = c.x + Math.cos(c.ang) * c.spd * dt, nz = c.z + Math.sin(c.ang) * c.spd * dt;
              if (cowOK(nx, nz)) { c.x = nx; c.z = nz; } else c.ang += 2.3;
              c.g.position.set(c.x, _gY - c.restY * 0.8 * NATURE_SCALE, c.z); c.g.rotation.y = -c.ang;
              c.head.rotation.z = -0.18 + Math.sin(t * 4 + c.ph) * 0.05; c.head.rotation.x = 0;
              if (c.legs) {
                const sw = Math.sin(cowGait(c, 1) + c.ph) * 0.34;
                c.legs[0].hip.rotation.z = sw; c.legs[3].hip.rotation.z = sw; c.legs[1].hip.rotation.z = -sw; c.legs[2].hip.rotation.z = -sw;
                for (const L of c.legs) L.knee.rotation.z = Math.max(0, -Math.sin(c.gph + c.ph + 0.6)) * 0.32;
              }            // gối khẽ co khi bước
              if (c.tail) c.tail.rotation.z = 0.22 + Math.sin(t * 3.0 + c.ph) * 0.12;
            }
          }
          // ---- chú hươu hoạt cảnh ----
          if (stag) {
            stag.tmr -= dt;
            if (stag.state === 'walk') {
              const dx = stag.targetX - stag.x;
              const dz = stag.targetZ - stag.z;
              const dist = Math.hypot(dx, dz);
              if (dist < 0.6 || stag.tmr <= 0) {                                 // ngưỡng đến đích > bán kính quay (v/ω≈0.46) để không lượn vòng quanh đích
                stag.state = 'eat';
                stag.tmr = 30.0;
                stag.g.position.set(stag.x, cowY(stag.x, stag.z), stag.z);   // đáp chân xuống đất khi dừng ăn (bỏ độ nhún)
              } else {
                // ---- xoay TRƯỚC · bước SAU: hươu chỉ tiến về phía trước theo hướng mặt, không đi lùi/đi ngang ----
                const desired = Math.atan2(-dz, dx);                                                             // đầu hươu ở trục +x local → góc đúng là atan2(-dz, dx), không phải atan2(dx, dz) (bug đi ngang cũ)
                let dturn = desired - stag.g.rotation.y;
                while (dturn > 3.14159) dturn -= 6.28318; while (dturn < -3.14159) dturn += 6.28318;
                stag.g.rotation.y += Math.sign(dturn) * Math.min(Math.abs(dturn), 2.4 * dt);                     // xoay tại chỗ với tốc độ giới hạn
                stag.ang = stag.g.rotation.y;
                if (Math.abs(dturn) < 0.4) {                                                                     // đã hướng gần đúng → mới bước
                  const speed = 1.1, freq = 7.0, phase = t * freq;
                  const fx = Math.cos(stag.g.rotation.y), fz = -Math.sin(stag.g.rotation.y);                     // vector phía trước theo hướng mặt
                  stag.x += fx * speed * dt; stag.z += fz * speed * dt;
                  stag.g.position.set(stag.x, cowY(stag.x, stag.z) + Math.abs(Math.sin(phase)) * 0.06, stag.z);  // bám địa hình + thân nhún theo nhịp
                  const swing = Math.sin(phase) * 0.5;
                  for (let li = 0; li < 4; li++) {
                    const s = (li === 0 || li === 3) ? swing : -swing;                                           // cặp chân chéo (diagonal gait chuẩn 4 chân)
                    stag.legs[li].hip.rotation.z = s;
                    stag.legs[li].knee.rotation.z = s > 0 ? -s * 0.9 : -0.05;                                    // gập gối nhấc cao khi vung tới
                  }
                } else {                                                                                          // đang xoay tại chỗ: đứng yên, chân thả lỏng
                  stag.g.position.set(stag.x, cowY(stag.x, stag.z), stag.z);
                  for (const lg of stag.legs) { lg.hip.rotation.z *= 1 - Math.min(1, 6 * dt); lg.knee.rotation.z *= 1 - Math.min(1, 6 * dt); }
                }
              }
              stag.neck.rotation.z = THREE.MathUtils.lerp(stag.neck.rotation.z, -0.42, 4 * dt);
            } else if (stag.state === 'eat') {
              for (const lg of stag.legs) { lg.hip.rotation.z = THREE.MathUtils.lerp(lg.hip.rotation.z, 0, 5 * dt); lg.knee.rotation.z = THREE.MathUtils.lerp(lg.knee.rotation.z, -0.1, 5 * dt); }   // duỗi thẳng cả 4 chân về tư thế đứng

              // Vươn cao cổ lên để ăn lá cây (tilted up to 0.18 rad)
              stag.neck.rotation.z = THREE.MathUtils.lerp(stag.neck.rotation.z, 0.18, 2 * dt);
              const chew = Math.sin(t * 8.0) * 0.08;
              if (stag.neck.children[1]) {
                stag.neck.children[1].rotation.z = chew;
              }
              if (stag.tmr <= 0) {
                stag.state = 'walk';
                stag.tmr = 15.0;
                // Tìm một cây gần đồi của hươu để đi tới
                const candidates = typeof treeCoords !== 'undefined' ? treeCoords.filter(tc => Math.hypot(tc.x - (X0 + 176), tc.z - (Z0 + 171)) < 25.0) : [];
                if (candidates.length > 0) {
                  const targetTree = candidates[Math.floor(Math.random() * candidates.length)];
                  const ang = Math.random() * 6.28;
                  stag.targetX = targetTree.x + Math.cos(ang) * 1.15;
                  stag.targetZ = targetTree.z + Math.sin(ang) * 1.15;
                } else {
                  stag.targetX = X0 + 176 + (Math.random() - 0.5) * 16.0;
                  stag.targetZ = Z0 + 171 + (Math.random() - 0.5) * 16.0;
                }
              }
            }
          }
          // ---- chú hươu hoạt cảnh kết thúc ----

          // ---- chú cua hoạt cảnh bò ngang ----
          if (crab) {
            crab.tmr -= dt;
            if (crab.state === 'walk') {
              const speed = 0.22;
              const moveDirX = Math.cos(crab.ang);
              const moveDirZ = -Math.sin(crab.ang);
              const testX = crab.x + moveDirX * speed * dt;
              const testZ = crab.z + moveDirZ * speed * dt;
              if (Math.hypot(testX - crab.baseX, testZ - crab.baseZ) < 3.2) {
                crab.x = testX; crab.z = testZ;
              } else {
                crab.tmr = 0;
              }
              crab.g.position.set(crab.x, crab.y, crab.z);
              for (let i = 0; i < crab.legs.length; i++) {
                crab.legs[i].leg.rotation.z = Math.sin(t * 7.0 + i * 1.2) * 0.22;
              }
              if (crab.tmr <= 0) {
                crab.state = 'turn';
                crab.targetAng = crab.ang + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
                crab.tmr = 2.2;
              }
            } else if (crab.state === 'turn') {
              crab.ang = THREE.MathUtils.lerp(crab.ang, crab.targetAng, 3 * dt);
              crab.g.rotation.y = crab.ang;
              for (let i = 0; i < crab.legs.length; i++) {
                crab.legs[i].leg.rotation.z = Math.sin(t * 3.5 + i * 1.2) * 0.08;
              }
              if (crab.tmr <= 0) {
                crab.ang = crab.targetAng; crab.g.rotation.y = crab.ang;
                crab.state = 'walk';
                crab.tmr = 3.5 + Math.random() * 3.5;
              }
            }
            for (const c of crab.claws) {
              c.arm.rotation.z = 0.2 + Math.sin(t * 3.0 + c.sz) * 0.06;
              c.thumb.rotation.y = -0.3 * c.sz + Math.sin(t * 4.0) * 0.1 * c.sz;
            }
          }
          for (const l of lotuses) {   // lá sen nổi đúng mặt nước mô phỏng: dâng/hạ theo sóng, nghiêng theo độ dốc mặt nước (gốc cắm đáy nên không trôi)
            const p = l.g.position, y = waterSurfaceY(p.x, p.z), gx = waterSurfaceY(p.x + 0.4, p.z) - y, gz = waterSurfaceY(p.x, p.z + 0.4) - y;
            p.y = y + 0.01 + Math.sin(t * 1.2 + l.ph) * 0.012; l.g.rotation.z = Math.max(-0.2, Math.min(0.2, -gx * 2.5)) + Math.sin(t * 0.8 + l.ph) * 0.015; l.g.rotation.x = Math.max(-0.2, Math.min(0.2, gz * 2.5));
          }
          if (cherryCtl) updateLeafFall(cherryCtl, dt, t);           // cánh hoa anh đào rụng theo gió, rơi xuống sông thì nổi, trôi, có chiếc chìm
          if (oldTreeLeafCtl) updateLeafFall(oldTreeLeafCtl, dt, t);   // lá vàng cây cổ thụ
          waterFx.update(dt, t);                                     // gợn nước nhỏ (lá chạm nước, cá đớp) + bọt khí
          for (const lamp of streetLamps) {   // đèn đường: tắt ban ngày, sáng ấm ban đêm
            lamp.light.intensity = 60 * nightFactor; lamp.ledMat.color.setRGB(0.37 + 0.63 * nightFactor, 0.38 + 0.55 * nightFactor, 0.4 + 0.32 * nightFactor);
            const lit = nightFactor > 0.05; lamp.beam.visible = lamp.pool.visible = lit;   // vệt sáng + chùm sáng chỉ khi trời tối
            if (lit) { lamp.beamMat.uniforms.uOpacity.value = 0.14 * nightFactor; lamp.pool.userData.mat.uniforms.uOpacity.value = 0.34 * nightFactor; }
          }
          cowHut.light.intensity = 3.2 * nightFactor; cowHut.bulbMat.color.setRGB(0.47 + 0.53 * nightFactor, 0.45 + 0.42 * nightFactor, 0.42 + 0.18 * nightFactor);   // bóng đèn chuồng bò
          if (wmast) {
            const w = liveWeather.state;
            // phong kế: tốc độ quay ∝ gió TẠI CHỖ (gồm cơn giật) — cánh quạt ~1,6·V, chén gió ~1·V rad/s (thu chậm cho mắt theo kịp);
            // quán tính theo "hằng số quãng đường" ~2,5 m: gió càng mạnh rô-to càng bắt nhịp nhanh
            for (const [obj, k, cap] of [[wmast.prop, 1.6, 18], [wmini.anem, 1.0, 12]]) {
              const u = obj.userData; if (!u.hub) { u.hub = obj.getWorldPosition(new THREE.Vector3()); u.hubZ = Math.max(1, u.hub.y - cowY(u.hub.x, u.hub.z)); u.w = 0; }
              windAt(u.hub.x, u.hub.y, u.hub.z, u.hubZ, _rotW);
              const V = sceneWind.ms * Math.hypot(_rotW.x, _rotW.z) / sceneWind.U;
              u.w += (Math.min(cap, k * V) - u.w) * (1 - Math.exp(-dt * Math.max(0.5, V) / 2.5));
            }
            wmast.prop.rotation.x += wmast.prop.userData.w * dt;
            wmini.anem.rotation.y += wmini.anem.userData.w * dt;
            if (w.fresh && w.windDirection !== null) wmast.vane.rotation.y = Math.PI / 2 - w.windDirection * Math.PI / 180;
            wmast.setWindBadge(w.fresh && w.windDirection !== null ? w.windDirection : NaN, w.windSpeed);   // nhãn hướng gió (chỉ vẽ lại khi số đổi)
            wmast.light.visible = Math.sin(t * 4) > 0;
          }
          if (substationAnim) substationAnim.update(t);
          if (waterMat.userData.shader) { waterMat.userData.shader.uniforms.uTime.value = t % SHADER_TIME_LOOP; }
          causticU.uCTime.value = t % SHADER_TIME_LOOP; updateWaterLook(rainK);   // mặt nước: trời phản chiếu, bọt, gió, mưa · vân đáy
          if (!waterFlowFilled) fillWaterFlow();
          if (rainbowMats.length && damRainbow) {
            // CẦU VỒNG = ánh nắng khúc xạ–phản xạ trong giọt bụi nước, cung tròn 42° quanh điểm ĐỐI MẶT TRỜI: chỉ có khi có nắng trực tiếp,
            // đậm nhất lúc mặt trời thấp (sáng/chiều), nhạt dần khi mặt trời lên cao và biến mất khi cao hơn 42° (đỉnh cung chìm dưới chân trời);
            // mây dày che nắng thì nhạt. Mặt cung luôn quay về phía mặt trời, tâm cung hạ thấp khi mặt trời lên cao (cung còn nửa vòng nhỏ hơn).
            const e = Math.asin(Math.max(-1, Math.min(1, sunElevSin))) * 180 / Math.PI, sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
            const w = liveWeather.state, cur = w.fresh ? w.data?.current : null, cloud = cur && Number.isFinite(cur.cloud_cover) ? cur.cloud_cover / 100 : 0.3;
            const vis = sm(0, 4, e) * (1 - sm(30, 42, e)) * (1 - 0.85 * cloud) * (w.thunder ? 0.3 : 1) * (0.7 + 0.3 * Math.min(1, sceneWind.k + 0.4));
            for (const mat of rainbowMats) mat.opacity = 0.45 * vis;
            damRainbow.visible = vis > 0.01;
            const sx = _wp.x, sz = _wp.z; if (Math.hypot(sx, sz) > 1e-3) damRainbow.rotation.y = Math.atan2(sx, sz);
            damRainbow.position.y = damRainbow.userData.baseY - 5.6 * Math.max(0, e) / 42;
          }
          const cGrp = campCupSteam.length ? campCupSteam[0].m.parent : null; if (cGrp) cGrp.localToWorld(_plS.set(0, 0, 0));
          for (const p of campCupSteam) {   // khói ca trà: luồng nổi rất yếu, dưới mái bạt nên gió chỉ ~½
            const k = (t * 0.22 + p.ph) % 1;
            plumeOffset(_plS, k / 0.22, CUP_PLUME, _plA); windInLocal(cGrp, _plA, _cupW);
            p.m.position.set(_cupW.x + Math.sin(t * 1.3 + p.ph * 9) * 0.02 * k, Math.max(_cupW.y, k * 0.05), _cupW.z + Math.cos(t * 1.1 + p.ph * 7) * 0.015 * k);
            p.m.scale.setScalar(0.6 + k * 2.2); p.m.material.opacity = 0.32 * Math.sin(k * Math.PI);
          }
          if (campObj) {
            const fireScale = campfireLevel(liveWeather.localHour);   // 100% lúc 19:00 → 5% lúc 07:00, ban ngày 5%
            const steamAmt = Math.min(1, Math.max(0, (fireScale - 0.2) / 0.55));   // lửa lớn → ấm sôi phụt hơi qua còi; lửa ngày 5% → không có hơi
            const kGrp = kettleSteam.length ? kettleSteam[0].m.parent : null; if (kGrp) kGrp.localToWorld(_plS.set(0, 0, 0));
            if (campPlume) for (const p of kettleSteam) p.m.visible = false;   // hơi ấm reo nằm trong mô phỏng khói (nguồn thứ 2)
            else for (const p of kettleSteam) {   // tia hơi phụt khỏi còi, chậm dần, rồi bốc lên (nổi yếu, trần thấp) và bị gió tại độ cao vòi cuốn đi
              const k = (t * 0.45 + p.ph) % 1, a = k / 0.45, jet = 0.16 * (1 - Math.exp(-a * 4));
              plumeOffset(_plS, a, KETTLE_PLUME, _plA); windInLocal(kGrp, _plA, _steamW);
              p.m.position.set(p.dir.x * jet + _steamW.x, 0.02 + _steamW.y, p.dir.z * jet + _steamW.z);
              p.m.scale.setScalar(0.5 + k * 2.8); p.m.material.opacity = steamAmt * 0.4 * Math.sin(k * Math.PI);
            }
            for (const fl of campObj.flames) { fl.m.scale.y = fireScale * Math.max(0.6, 0.92 + 0.24 * Math.sin(t * 7 + fl.ph) + 0.12 * Math.sin(t * 13 + fl.ph * 1.6)); fl.m.scale.x = fl.m.scale.z = fireScale * (0.82 + 0.2 * Math.sin(t * 7 + fl.ph * 1.3)); fl.m.material.opacity = 0.72 + 0.26 * Math.sin(t * 12 + fl.ph); }
            if (campPlume) {   // khói + hơi = mô phỏng chất lỏng 2D: lửa cấp nhiệt & khói theo cỡ lửa, ấm reo phụt hơi theo hướng vòi
              for (const sm of campObj.smoke) sm.m.visible = false;
              const F = campPlume.sources[0], K = campPlume.sources[1];
              campObj.g.localToWorld(campPlume.base.set(0, 0, 0)); campObj.g.localToWorld(F.p.set(0, 0.75, 0));
              F.smoke = 2.2 + 10 * fireScale; F.heat = 1.0 + 2.4 * fireScale; F.vel.set(0, 0.4 + 0.8 * fireScale, 0);
              if (kGrp) { kGrp.localToWorld(K.p.set(0, 0, 0)); K.vel.copy(kettleSteam[0].dir).applyQuaternion(kGrp.getWorldQuaternion(_plumeQ)).multiplyScalar(0.9); K.vel.y += 0.3; }
              K.steam = 2.6 * steamAmt; K.heat = 0.5 * steamAmt;
              plumeWind(campPlume, 1, 5); plumeLight(campPlume, PLUME_COL.smoke, PLUME_COL.steam, _plumeGlow.copy(PLUME_COL.glow).multiplyScalar(0.25 + 0.75 * fireScale));
            } else campObj.g.localToWorld(_plS.set(0, 0.9, 0));
            // khói bếp lửa kiểu cũ (dự phòng): luồng nổi Briggs (xem plumeOffset) — cụm khói nở theo độ cao bốc, loãng dần; trời ổn định thì dẹt ra như quạt
            if (!campPlume) for (const sm of campObj.smoke) {
              const life = 6, a = ((t / life + sm.ph) % 1) * life, pr = a / life;
              const z = plumeOffset(_plS, a, CAMP_PLUME, _plA); windInLocal(campObj.g, _plA, _smokeW);
              sm.m.position.set(_smokeW.x, 0.9 + _smokeW.y, _smokeW.z);
              const r = 0.6 + 0.5 * z + 0.12 * a, fan = Math.max(0, sceneWind.stab);
              sm.m.scale.set(r * (1 + 0.6 * fan), r * (1 - 0.45 * fan), r * (1 + 0.6 * fan)); sm.m.rotation.y = sm.ph * 6 + t * 0.2;
              sm.m.material.opacity = 0.24 * Math.min(1, a / 0.5) * Math.pow(1 - pr, 1.3) * Math.min(1, 1.2 / r);
            }
            if (campObj.sparks) {
              for (const sp of campObj.sparks) {
                sp.m.position.y += dt * sp.spd; if (sp.m.position.y > 2.2) { sp.m.position.y = 0.4; sp.m.position.x = (Math.random() - 0.5) * 0.3; sp.m.position.z = (Math.random() - 0.5) * 0.3; }
                const pr = (sp.m.position.y - 0.4) / 1.8; sp.m.material.opacity = Math.sin((1 - pr) * 3.14159) * 0.95 * fireScale; sp.m.position.x += Math.sin(t * 3.5 + sp.ph) * 0.006;   // tia lửa mờ theo cỡ lửa ngày/đêm
              }
            }
            const flicker = 0.55 + 0.28 * Math.sin(t * 12) + 0.14 * Math.sin(t * 23.7);
            campObj.light.intensity = 6.0 * flicker * fireScale;
            campObj.light.distance = 6.0 + 11.0 * fireScale;
            campObj.logMat.emissiveIntensity = (0.35 + 1.45 * fireScale) * (0.85 + 0.25 * Math.sin(t * 3.1));   // vết nứt than đỏ, thở theo lửa; ban ngày vẫn âm ỉ
            campObj.cutMat.emissiveIntensity = 0.6 * fireScale;
            campObj.emberMat.color.setRGB(0.15 + 0.76 * fireScale, 0.1 + 0.25 * fireScale, 0.06 + 0.03 * fireScale);
            const glowLv = (0.45 + 0.55 * fireScale) * (0.88 + 0.12 * Math.sin(t * 1.7) + 0.05 * Math.sin(t * 4.3));   // than tâm: dư âm vẫn hồng khi lửa 5%
            campObj.glowMat.opacity = glowLv; campObj.hotMat.color.setRGB(1, 0.22 + 0.2 * glowLv, 0.04).multiplyScalar(0.55 + 0.45 * glowLv);
            campObj.dimMat.emissiveIntensity = 0.5 + 0.6 * glowLv;
          }
          if (lanternObj) { lanternObj.light.intensity = 0.5 + nightFactor * 2.6 + (0.2 + nightFactor * 0.4) * Math.sin(t * 8.5) + 0.12 * Math.sin(t * 18.3); lanternObj.light.distance = 8 + nightFactor * 7; lanternObj.lan.rotation.z = Math.sin(t * 1.1) * 0.04; }
          if (awLight && awLan) { awLight.intensity = 0.5 + nightFactor * 2.6 + (0.2 + nightFactor * 0.4) * Math.sin(t * 8.5 + 1.2) + 0.12 * Math.sin(t * 18.3); awLight.distance = 8 + nightFactor * 7; awLan.rotation.z = Math.sin(t * 1.1 + 1.2) * 0.04; }
          updateStudyLamp();
          if (studyLaptop.hinge) {   // nắp laptop mở/đóng mượt; màn hình sáng dần khi đã mở
            studyLaptop.open += (studyLaptop.target - studyLaptop.open) * Math.min(1, dt * 2.2);
            const o = studyLaptop.open; studyLaptop.hinge.rotation.x = -1.85 * o;
            const lit = Math.max(0, (o - 0.6) / 0.4); studyLaptop.screen.color.setScalar(0.06 + 0.94 * lit); studyLaptop.light.intensity = 0.7 * lit;
          }
