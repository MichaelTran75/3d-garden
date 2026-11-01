        function loop(ts) {
          if (disposed || suspended) { frameId = 0; return; }
          if (ts !== undefined) adaptResolution(ts);   // độ phân giải tự điều chỉnh (loop/close-up.js)
          frameId = requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), 0.05) || 1 / 60;   // khung đầu: Clock.getDelta() trả 0 (mô phỏng chia cho dt sẽ ra NaN)
          if (!COL.ready) { colBuildTick(4); if (COL.ready) memTrim(); } else { colTick(dt); colMeshTick(dt); }   // lớp va chạm dựng dần sau khi mở trang · đồng hồ lượt xuyên khi kẹt (core/collide.js)
          const insectsAwake = liveWeather.wildlifeAwake;
          if (insectsAwake) flightNav.update();
          viewTick(dt);   // tầm nhìn: xoay êm tới góc đích, phím W/A/S/D dời điểm nhìn, đặt camera (core/view.js)
          const t = clock.elapsedTime;
          // thời gian đưa vào shader quay vòng ở chu kỳ chung của các tần số đang dùng → liền mạch, và giữ độ chính xác float32 dù trang mở nhiều ngày
          updateSceneWind(dt, t);   // hướng + tốc độ gió thật, cơn giật, lò xo thân cây (trước khi cây/lá/khói dùng)
          for (const u of windUniforms.values()) u.uTime.value = t % SHADER_TIME_LOOP;
          updateRotors(dt);   // tua-bin quay theo gió tại độ cao trục, quán tính ~5 s (world/wind-turbines.js)
          damWaterTick(t);   // đập: nước tràn, màn nước, bọt, tia xả, bụi nước = instance (world/hydro-dam.js)
          worldRun('beasts', dt, t);   // SỔ TICK (core/world.js): thú lớn tự chạy phần mình — mỗi đơn vị tự ghi vào lượt, vòng lặp không biết trong lượt có ai
          lotusPond.update(dt, t);
          meadow.update(dt, t);   // thảm cỏ: LOD theo mức phóng, cắt khung nhìn, gió, giẫm, ráng chiều   // đầm sen: lá nổi theo sóng, cuống ngả theo gió, hoa nở/khép theo giờ, giọt sương
          if (cherryCtl) updateLeafFall(cherryCtl, dt, t);           // cánh hoa anh đào rụng theo gió, rơi xuống sông thì nổi, trôi, có chiếc chìm
          if (oldTreeLeafCtl) updateLeafFall(oldTreeLeafCtl, dt, t);
          if (forestLeafCtl) updateLeafFall(forestLeafCtl, dt, t);   // lá rừng + cây táo bứt theo cơn giật trong vùng đang nhìn   // lá vàng cây cổ thụ
          waterFx.update(dt, t);                                     // gợn nước nhỏ (lá chạm nước, cá đớp) + bọt khí
          streetLampsTick();   // đèn đường: tắt ban ngày, sáng ấm ban đêm (world/street-lamps.js)
          worldRun('lamps', dt, t);   // đèn riêng của các đơn vị, sáng theo đêm (sổ tick)
          weatherMastTick(dt, t);   // cột khí tượng + trạm mini (world/weather-mast.js)
          if (substationAnim) substationAnim.update(t);
          if (waterMat.userData.shader) { waterMat.userData.shader.uniforms.uTime.value = t % SHADER_TIME_LOOP; }
          causticU.uCTime.value = t % SHADER_TIME_LOOP; updateWaterLook(rainK);   // mặt nước: trời phản chiếu, bọt, gió, mưa · vân đáy
          if (!waterFlowFilled) fillWaterFlow();
          damRainbowTick();   // cầu vồng chân đập (world/hydro-dam.js)
          worldRun('things', dt, t);   // đồ vật quanh trại + xe tự chạy phần mình (sổ tick) — ngay trước lượt kỹ sư
