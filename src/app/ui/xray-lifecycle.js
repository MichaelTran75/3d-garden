        // ---- bấm vào caravan → xem xuyên: mặt vỏ xe ẩn đi, chỉ còn nét line-art; nội thất (giường, toilet, lavabo, bếp, bàn học, bàn…) giữ nguyên.
        //      Bấm lại vào xe hoặc bấm ra chỗ khác để trả về; không kích hoạt khi đang ở chế độ Chọn. ----
        const caravanRole = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.xray) return p.userData.xray; return ''; };
        const caravanShell = [];
        caravanObj.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') caravanShell.push(o); });
        const shellHidden = new THREE.MeshBasicMaterial({ visible: false });   // ẩn mặt nhưng nét viền con vẫn vẽ, và vẫn bấm trúng được
        // G 18/10 "van border art line 100% visible + 75% transparent; interior 100 visible": xem xuyên = mặt vỏ còn 25% (thấy dáng xe), nét viền giữ 100%,
        //  vỏ trong khoang hàng (userData.xrayHide) ẩn hẳn ⇒ nội thất rõ; mỗi vật liệu vỏ 1 bản mờ dùng chung
        // G 18/10 "thanh trượt về 0 thì vỏ xe và border line cũng invisible, chỉ còn nội thất và walls": thanh nét viền (VAN_LINES.k, ui/labels-controls.js)
        //  làm mờ luôn mặt vỏ — độ mờ = min(xem xuyên ? 0,25 : 1, k); vách phòng tắm (userData.vanWall) không theo thanh; 0 ⇒ ẩn mặt nhưng vẫn bấm trúng
        const xrayMats = new Map(), xrayOf = m => { let x = xrayMats.get(m); if (!x) { x = m.clone(); x.transparent = true; x.depthWrite = false; x.userData.op0 = m.opacity ?? 1; xrayMats.set(m, x); } return x; };
        const vanWall = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.vanWall) return true; return false; };
        let caravanXray = false;
        function shellLook(m) {
          const base = m.userData.xrayMaterial || m.material, a = Math.min(caravanXray ? 0.25 : 1, vanWall(m) ? 1 : VAN_LINES.k);
          if (a >= 1) { if (m.userData.xrayMaterial) { m.material = base; delete m.userData.xrayMaterial; } return; }
          m.userData.xrayMaterial = base;
          if (a <= 0 || m.userData.xrayHide || !base.color) { m.material = shellHidden; return; }
          const x = xrayOf(base); x.opacity = Math.min(a, x.userData.op0); m.material = x;
        }
        function xrayAdopt(root) {   // vỏ nạp sau (mẫu GLB Transit): đưa vào danh sách vỏ, đang xem xuyên / thanh trượt < 100 thì đổi luôn
          root.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') { caravanShell.push(o); shellLook(o); } });
        }
        function setCaravanXray(on) { if (on === caravanXray) return; caravanXray = on; for (const m of caravanShell) shellLook(m); }
        VAN_LINES.onShell = () => { for (const m of caravanShell) shellLook(m); }; VAN_LINES.onShell();
        listen(dom, 'pointerup', e => {
          if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
          if (hovClick(e)) return;   // tay nắm cửa trước / logo Ford ⇒ mở – đóng cửa, ca-pô (ui/hover-select.js → van/van-doors.js)
          const r = dom.getBoundingClientRect();
          pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
          const hits = pickRay.intersectObjects([caravanObj, ...TOOLS.flatMap(T => T.objs)], true), h = hits[0];   // dụng cụ (drone, giỏ, sào) đứng trước xe: bấm là mở bảng việc, không bật xem xuyên
          if (engineClick(hits)) return;   // tia chạm động cơ đang thấy ⇒ bảng "Khởi động máy" (listener bảng dụng cụ bên dưới), không đổi xem xuyên
          let onVan = false; for (let p = h && h.object; p; p = p.parent) if (p === caravanObj) { onVan = true; break; }
          setCaravanXray(onVan ? !caravanXray : false);
        });
        // ---- BẤM DỤNG CỤ → bảng nhỏ gọi kỹ sư làm việc đó, rồi về lịch cũ (engForceAct — engineer/schedule.js; kỹ sư bỏ việc đang làm như khi đổi việc thường):
        //      drone / tay cầm → "▶ Chơi" (G 17/10 "click to the drone/rc to select play"): lấy drone ở bàn trà bay 1 vòng quanh đảo, cất về
        //      giỏ / sào hái trái → "Hái táo" (G 17/10 "làm tương tự cho hái táo"): giỏ đang ở bàn trà thì xách ra gốc cây trước, hái ≤ 4 quả, xách giỏ về
        //      Không làm được thì ghi lý do: ngủ, mưa, gió > 9 m/s (drone), đang làm việc khác vừa gọi, hết táo trong tầm sào / giỏ đầy, mẫu drone chưa tải ----
        const tPop = document.getElementById('toolPop'), tTitle = document.getElementById('toolPopTitle'), tMsg = document.getElementById('toolPopMsg'), tGo = document.getElementById('toolPopGo'), tClose = document.getElementById('toolPopClose');
        const toolBusy = () => liveWeather.localHour >= ENG_SLEEP_H || liveWeather.localHour < 6 ? 'Engineer đang ngủ (21:45 – 6:00).' : liveWeather.localHour > ENG_SLEEP_H - 0.1 ? 'Sắp tới giờ ngủ (21:45).'
          : engForceAct === 'drone' || droneToy.state.st !== 'idle' ? 'Engineer đang bay drone.' : engForceAct === 'apples' || applePick.busy ? 'Engineer đang hái táo.' : applePick.eating ? 'Engineer đang ăn táo.'
          : engForceAct === 'engine' || engineJob.busy() ? 'Engineer đang kiểm tra máy.' : engForceAct === 'trim' || trimJob.busy() ? 'Engineer đang cắt cỏ.'
          : engForceAct ? 'Engineer đang ' + ENG_ACTS[engForceAct].label.toLowerCase() + '.' : '';   // việc khác theo lệnh bảng Tools (ui/tools-panel.js): ngắm sao, câu cá, chăm luống, ngồi ghế, bỏ củi
        // G 18/10 "click to the engine show the button start engine": động cơ (thêm vào objs khi mẫu nạp — van/transit-glb.js), chỉ bấm được khi đang thấy (engineSeen)
        const engineTool = { objs: [], vis: () => engineSeen(), title: 'Động cơ V6 · Ford Transit', go: '▶ Khởi động máy', act: 'engine', ok: () => 'Gọi Engineer ra ' + (VPART.hoodBtn && VPART.hoodBtn.part.open ? '' : 'mở ca-pô, ') + 'kiểm tra máy rồi nổ máy 30 giây.',
          why: () => toolBusy() || (liveWeather.state.raining ? 'Đang mưa, không mở ca-pô.' : ENGR.on ? 'Máy đang chạy.' : '') };
        const TOOLS = [
          { objs: [droneToy.g, droneToy.rc], title: 'Drone DJI Mini 3', go: '▶ Chơi', act: 'drone', ok: () => 'Gọi Engineer ra bàn trà lấy drone bay 1 vòng quanh đảo.',
            why: () => { const w = liveWeather.state; return toolBusy() || (w.raining ? 'Đang mưa, drone không bay được.' : (w.windSpeed || 0) / 3.6 > 9 ? 'Gió mạnh quá (> 9 m/s).' : !droneToy.ready() ? 'Mẫu drone đang tải…' : ''); } },
          engineTool,
          // G 18/10 máy cắt cỏ đeo lưng (camp/trimmer.js): bấm ⇒ kỹ sư giật nổ máy, đeo ba lô, phát cỏ các vòng quanh bếp lửa rồi cất máy (engineer/trim-grass.js)
          { objs: [trimKit.g], vis: () => trimKit.ready && !trimJob.busy(), title: 'Máy cắt cỏ đeo lưng', go: '▶ Cắt cỏ', act: 'trim',
            ok: () => 'Gọi Engineer giật nổ máy, đeo ba lô máy, lia lưỡi phát cỏ các vòng quanh bếp lửa (~6 phút) rồi cất máy về cạnh đống củi.',
            why: () => { const hh = liveWeather.localHour; return toolBusy() || (liveWeather.state.raining ? 'Đang mưa, đợi tạnh và cỏ ráo đã.' : sceneWet > 0.3 ? 'Cỏ còn ướt, đợi ráo bớt rồi cắt.'
              : hh < 6.5 || hh > 18.2 ? 'Trời tối, để mai cắt.' : !trimKit.ready ? 'Mẫu máy cắt cỏ đang tải…' : trimJob.cutFrac() > 0.85 ? 'Cỏ quanh trại vừa cắt xong.' : ''); } },
          { objs: [applePick.pole, applePick.basket], title: 'Sào hái trái · giỏ táo', go: '🍎 Hái táo', act: 'apples',
            ok: () => 'Gọi Engineer ra gốc cây hái ' + applePick.avail() + ' quả táo bằng sào' + (applePick.state && applePick.state.basketAt === 'table' ? ' (lấy giỏ ở bàn trà mang ra trước).' : '.'),
            why: () => toolBusy() || (liveWeather.state.raining ? 'Đang mưa, đợi tạnh rồi hái.' : applePick.left() || applePick.eating ? 'Giỏ còn ' + Math.max(1, applePick.left()) + ' quả táo chưa ăn — táo hái phải ăn trong ngày, ăn hết rồi mới hái tiếp.' : !applePick.avail() ? 'Táo trong tầm sào đã hái hết; 5:00 sáng cây đủ quả lại.' : '') },
        ];
        const toolOf = o => { for (let p = o; p; p = p.parent) for (const T of TOOLS) if (T.objs.includes(p)) return T; return null; };
        let tCur = null;
        function showToolPop(T, x, y) {
          const r = dom.getBoundingClientRect(), why = T.why(); tCur = T;
          tTitle.textContent = T.title; tGo.textContent = T.go; tMsg.textContent = why || T.ok(); tGo.disabled = !!why; tGo.style.opacity = why ? '0.45' : '1';
          tPop.style.left = Math.max(8, Math.min(r.width - 222, x - r.left + 14)) + 'px'; tPop.style.top = Math.max(8, Math.min(r.height - 130, y - r.top - 24)) + 'px'; tPop.style.display = 'block';
        }
        if (tPop) {
          listen(dom, 'pointerup', e => {
            if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
            const r = dom.getBoundingClientRect();
            pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
            const h = pickRay.intersectObjects(TOOLS.filter(T => !T.vis || T.vis()).flatMap(T => T.objs), true)[0], T = h && toolOf(h.object);
            if (T) showToolPop(T, e.clientX, e.clientY); else { tPop.style.display = 'none'; tCur = null; }
          });
          listen(tGo, 'click', () => { if (!tCur || tCur.why()) return; engForceAct = tCur.act; tPop.style.display = 'none'; tCur = null; });
          listen(tClose, 'click', () => { tPop.style.display = 'none'; tCur = null; });
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
        if (bS) listen(bS, 'click', () => { skyOn = !skyOn; if (skyOn) { sky.visible = true; } else setSkyDefault(); tbIcon(bS, skyOn ? 'sun-moon' : 'sun', skyOn ? 'Trời theo giờ thật' : 'Trời cố định (ban ngày)'); });
        function resize() { const w = W(), h = Hv(), pc = pxCap(w, h); if (renderer.getPixelRatio() > pc) renderer.setPixelRatio(pc); renderer.setSize(w, h);   // trần điểm ảnh (core/boot.js)
          const a = w / h, d = 90; camera.left = -d * a; camera.right = d * a; camera.top = d; camera.bottom = -d; camera.updateProjectionMatrix(); }
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
