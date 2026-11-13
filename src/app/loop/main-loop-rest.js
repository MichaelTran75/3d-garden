          worldRun('late', dt, t);   // phần đi sau người (sổ tick, core/world.js) — ngay sau lượt kỹ sư
          worldRun('insects', dt, t, insectsAwake);   // côn trùng ban ngày (sổ tick) — x = trời cho côn trùng ra; đêm / gió / lạnh thì mỗi con tự dừng
          fungi.glow(nightFactor, t);   // nấm phát quang xanh lục khi trời tối (nature/fungi.js)
          worldRun('glow', dt, t);   // thú phát sáng ban đêm (sổ tick)
          // ---- Mây trôi và mưa hiện tại dưới toàn bộ mây. ----
          updateClouds(dt, t);
          updateWeatherRain(dt, t);
          stormDrain.tick(dt, t);
          hydroTurbine?.tick(dt, t);   // tổ máy thủy điện: mô phỏng + rotor quay + cánh hướng nước + hạt nước (world/hydro-turbine.js)   // cửa xả cống: lưu lượng theo mưa → tia nước, van lật, bọt (world/storm-drain.js)
          worldRun('wild', dt, t);   // chim, thú nhỏ quanh trại (sổ tick)
          worldRun('pointer', dt, t);   // ô toạ độ + ghim khi rê chuột trên địa hình (sổ tick — ui/labels-controls.js)
          updateAnimalVisibility(); updateDrawBatches();
          fluids.update(dt, t, rainK);   // gửi bước mô phỏng nước + khói cho luồng phụ (kèm các cú chạm nước trong khung này), nhận kết quả bước trước
          if (skyOn) updateSky(); nightSky.update(dt, t, skyOn); atmTick(); constellations.tick(dt); fitSunShadow(); updateCloseLod(); worldRun('tools', dt, t); waterPump.tick(dt, t); soilTick(dt); worldRun('ground', dt, t); worldRun('viewer', dt, t); worldRun('sound', dt, t); mossTick(); lensRender(dt); mastLabel?.updateScreen(); worldRun('afterRender', dt, t);   // sổ tick: phần chạy sau khi vẽ
          if (!started) { started = true; const l = document.getElementById('loading'); if (window.__ld) window.__ld(100); else if (l) l.style.display = 'none'; }   // 100% rồi mờ dần
        }
        // biên dịch shader SONG SONG (KHR_parallel_shader_compile) trước khung đầu → luồng chính không khựng lúc mở trang; trình duyệt không hỗ trợ thì như cũ.
        //  Trước đó chờ mẫu 3D / ảnh đang tải (ldTrack, 68 → 85%; tối đa 6 s — mạng chậm thì hiện cảnh trước, mẫu hiện sau như cũ) ⇒ shader của mẫu biên dịch luôn,
        //  không hiện dần từng mẫu · biên dịch: 85 → 99% theo số chương trình shader đã xong (isReady, không chặn luồng)
        const startLoop = () => { if (!disposed && !suspended && !frameId) loop(); };
        ldOpen(); let ldN = 0; window.__ld?.(68, 70, 'Đang tải mẫu 3D…');   // mở cổng: mọi biến của dựng cảnh đã khai báo xong
        for (const p of ldNeed) p.then(() => { ldN++; window.__ld?.(68 + 17 * ldN / ldNeed.length, 68 + 17 * Math.min(1, (ldN + 1) / ldNeed.length)); });
        await Promise.race([Promise.all(ldNeed), new Promise(r => setTimeout(r, 6000))]);
        if (disposed) return;
        window.__ld?.(85, 86, 'Đang biên dịch shader…');
        if (renderer.compileAsync) {
          const progs = renderer.info.programs || []; let cDone = false;
          const fin = () => { cDone = true; startLoop(); }, poll = () => { if (cDone) return; const n = progs.length, k = progs.filter(p => !p.isReady || p.isReady()).length; window.__ld?.(85 + 14 * k / Math.max(1, n), 85 + 14 * Math.min(1, (k + 1) / Math.max(1, n))); requestAnimationFrame(poll); };
          renderer.compileAsync(scene, camera).then(fin, fin); poll();
        } else startLoop();
      }
    })();
