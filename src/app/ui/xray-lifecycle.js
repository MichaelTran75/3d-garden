        // ---- bấm vào caravan → xem xuyên: mặt vỏ xe ẩn đi, chỉ còn nét line-art; nội thất (giường, toilet, lavabo, bếp, bàn học, bàn…) giữ nguyên.
        //      Bấm lại vào xe hoặc bấm ra chỗ khác để trả về; không kích hoạt khi đang ở chế độ Chọn. ----
        const caravanRole = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.xray) return p.userData.xray; return ''; };
        const caravanShell = [];
        caravanObj.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') caravanShell.push(o); });
        const shellHidden = new THREE.MeshBasicMaterial({ visible: false });   // ẩn mặt nhưng nét viền con vẫn vẽ, và vẫn bấm trúng được
        let caravanXray = false;
        function setCaravanXray(on) {
          if (on === caravanXray) return;
          caravanXray = on;
          for (const m of caravanShell) {
            if (on) { m.userData.xrayMaterial = m.material; m.material = shellHidden; }
            else { m.material = m.userData.xrayMaterial; delete m.userData.xrayMaterial; }
          }
        }
        listen(dom, 'pointerup', e => {
          if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
          const r = dom.getBoundingClientRect();
          pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
          const h = pickRay.intersectObjects([caravanObj, droneToy.g, droneToy.rc], true)[0];   // drone / tay cầm đứng trước xe: bấm là mở bảng "Chơi", không bật xem xuyên
          let onVan = false; for (let p = h && h.object; p; p = p.parent) if (p === caravanObj) { onVan = true; break; }
          setCaravanXray(onVan ? !caravanXray : false);
        });
        // ---- BẤM DRONE / TAY CẦM → bảng nhỏ "▶ Chơi" (G 17/10 "add option to click to the drone/rc to select 'play' then engineer will come and use drone"):
        //      kỹ sư bỏ việc đang làm như khi đổi việc thường (đứng dậy, ra khỏi xe…), tới bàn trà lấy drone bay 1 vòng quanh đảo, cất về, rồi về lịch cũ
        //      (engForceAct — engineer/schedule.js). Không chơi được thì ghi lý do: ngủ, mưa, gió > 9 m/s, đang bay, mẫu drone chưa tải ----
        const dPop = document.getElementById('dronePop'), dMsg = document.getElementById('dronePopMsg'), dPlay = document.getElementById('dronePlay'), dClose = document.getElementById('dronePopClose');
        const droneWhyNot = () => { const h = liveWeather.localHour, w = liveWeather.state;
          return h >= 21 || h < 6 ? 'Kỹ sư đang ngủ (21:00 – 6:00).' : w.raining ? 'Đang mưa, drone không bay được.' : (w.windSpeed || 0) / 3.6 > 9 ? 'Gió mạnh quá (> 9 m/s).'
            : droneToy.state.st !== 'idle' || engForceAct ? 'Kỹ sư đang bay drone.' : !droneToy.ready() ? 'Mẫu drone đang tải…' : ''; };
        function showDronePop(x, y) {
          const r = dom.getBoundingClientRect(), why = droneWhyNot();
          dMsg.textContent = why || 'Gọi kỹ sư ra bàn trà lấy drone bay 1 vòng quanh đảo.'; dPlay.disabled = !!why; dPlay.style.opacity = why ? '0.45' : '1';
          dPop.style.left = Math.max(8, Math.min(r.width - 222, x - r.left + 14)) + 'px'; dPop.style.top = Math.max(8, Math.min(r.height - 130, y - r.top - 24)) + 'px'; dPop.style.display = 'block';
        }
        if (dPop) {
          listen(dom, 'pointerup', e => {
            if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
            const r = dom.getBoundingClientRect();
            pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
            if (pickRay.intersectObjects([droneToy.g, droneToy.rc], true).length) showDronePop(e.clientX, e.clientY); else dPop.style.display = 'none';
          });
          listen(dPlay, 'click', () => { if (droneWhyNot()) return; engForceAct = 'drone'; dPop.style.display = 'none'; });
          listen(dClose, 'click', () => { dPop.style.display = 'none'; });
        }
        const pickCopyBtn = document.getElementById('pickCopy'), pickCloseBtn = document.getElementById('pickClose');
        function copyFallback(txt) {   // execCommand dự phòng khi Clipboard API bị chặn (mở file cục bộ file://, không có HTTPS)
          const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta);
          ta.focus(); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } document.body.removeChild(ta); return ok;
        }
        function flashCopied(ok) { if (disposed) return; if (copyTimer !== null) clearTimeout(copyTimer); pickCopyBtn.textContent = ok ? 'Đã chép ✓' : 'Không chép được'; copyTimer = setTimeout(() => { copyTimer = null; if (!disposed) pickCopyBtn.textContent = 'Sao chép'; }, 1200); }
        if (pickCopyBtn) listen(pickCopyBtn, 'click', () => {
          const txt = pickTitle.textContent + '\n' + pickBody.textContent;
          if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => flashCopied(true)).catch(() => flashCopied(copyFallback(txt)));
          else flashCopied(copyFallback(txt));
        });
        if (pickCloseBtn) listen(pickCloseBtn, 'click', clearPickHighlight);
        let skyOn = true;
        function setSkyDefault() { scene.background.copy(dayBg); if (scene.fog) scene.fog.color.copy(dayBg); sun.position.set(72, 112, 52).add(sun.target.position); sun.intensity = 0.98; sun.color.copy(dayLi); hemi.intensity = 0.82; amb.intensity = 0.28; sky.visible = false; sunGlow.visible = false; nightFactor = 0; skyDusk = 0; }
        const bS = document.getElementById('btnSky');
        if (bS) listen(bS, 'click', () => { skyOn = !skyOn; if (skyOn) { sky.visible = true; } else setSkyDefault(); bS.innerHTML = '<i class="ti ti-' + (skyOn ? 'sun-moon' : 'sun') + '"></i>' + (skyOn ? 'Trời' : 'Cố định'); });
        function resize() { const w = W(), h = Hv(); renderer.setSize(w, h); const a = w / h, d = 90; camera.left = -d * a; camera.right = d * a; camera.top = d; camera.bottom = -d; camera.updateProjectionMatrix(); }
        listen(window, 'resize', resize); resize();

        function pauseScene() {
          suspended = true; if (frameId) cancelAnimationFrame(frameId); frameId = 0;
          clock.stop();
        }
        function resumeScene() {
          if (disposed || document.hidden || offscreen || !suspended) return;   // khung 3D bị cuộn khuất (nhúng Wix) thì giữ nghỉ
          suspended = false;
          const elapsed = clock.elapsedTime; clock.start(); clock.elapsedTime = elapsed;
          frameId = requestAnimationFrame(loop);
        }
        function destroyGarden() {
          if (disposed) return;
          pauseScene();
          birds.length = 0; storkDefinition = null;
          releaseScene();
        }
        listen(document, 'visibilitychange', () => document.hidden ? pauseScene() : resumeScene());
        if ('IntersectionObserver' in window) {   // khung 3D ra khỏi màn hình (người xem cuộn trang) → dừng vẽ, tiết kiệm GPU/CPU; cuộn vào lại → chạy tiếp
          viewObserver = new IntersectionObserver(entries => { offscreen = !entries[entries.length - 1].isIntersecting; if (offscreen) pauseScene(); else resumeScene(); }, { threshold: 0 });
          viewObserver.observe(container);
        }
        listen(window, 'pagehide', e => e.persisted ? pauseScene() : destroyGarden());
        listen(window, 'pageshow', resumeScene);
        window.__disposeGarden = destroyGarden;
        let started = false;
        window.__info = () => renderer.info.render;   // đầu dò hiệu năng: __info().calls = draw call/frame · .triangles
