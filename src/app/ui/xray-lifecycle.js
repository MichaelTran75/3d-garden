        // ---- bấm vào xe → xem xuyên (01/11 đợt 11: xem xuyên là trạng thái của xe — van/body/xray.js; ở đây chỉ hỏi / bật qua mặt xe VAN.xray, VAN.setXray).
        //      Bấm lại vào xe hoặc bấm ra chỗ khác để trả về; không kích hoạt khi đang ở chế độ Chọn. ----
        listen(dom, 'pointerup', e => {
          if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
          if (hovClick(e)) return;   // tay nắm cửa trước / logo Ford ⇒ mở – đóng cửa, ca-pô (ui/hover-select.js → van/body/van-doors.js)
          const r = dom.getBoundingClientRect();
          pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
          const hits = pickRay.intersectObjects([VAN.object, ...TOOLS.flatMap(T => T.objs)], true), h = hits[0];   // dụng cụ (drone, giỏ, sào) đứng trước xe: bấm là mở bảng việc, không bật xem xuyên
          if (VAN.engineClick(hits)) return;   // tia chạm động cơ đang thấy ⇒ bảng "Khởi động máy" (listener bảng dụng cụ bên dưới), không đổi xem xuyên
          let onVan = false; for (let p = h && h.object; p; p = p.parent) if (p === VAN.object) { onVan = true; break; }
          VAN.setXray(onVan ? !VAN.xray : false);
        });
        // ---- BẤM DỤNG CỤ → bảng nhỏ gọi kỹ sư làm việc đó, rồi về lịch cũ (ENGINEER.ask → engForceAct, engineer/mind/schedule.js; kỹ sư bỏ việc đang làm như khi đổi việc thường):
        //      drone / tay cầm → "▶ Chơi" (G 17/10 "click to the drone/rc to select play"): lấy drone ở bàn trà bay 1 vòng quanh đảo, cất về
        //      giỏ / sào hái trái → "Hái táo" (G 17/10 "làm tương tự cho hái táo"): giỏ đang ở bàn trà thì xách ra gốc cây trước, hái ≤ 4 quả, xách giỏ về
        //      Không làm được thì ghi lý do: ngủ, mưa, gió > 9 m/s (drone), đang làm việc khác vừa gọi, hết táo trong tầm sào / giỏ đầy, mẫu drone chưa tải ----
        const tPop = document.getElementById('toolPop'), tTitle = document.getElementById('toolPopTitle'), tMsg = document.getElementById('toolPopMsg'), tGo = document.getElementById('toolPopGo'), tClose = document.getElementById('toolPopClose');
        // lý do chưa làm được (ngủ, sắp ngủ, đang làm việc vừa giao, mưa…) + việc sẽ làm: kỹ sư tự nói — ENGINEER.offer(act) (engineer/mind/offers.js, 01/11 đợt 10)
        // G 18/10 "click to the engine show the button start engine": động cơ (objs = khối máy VAN.engineModel khi mẫu đã nạp — van/body/transit-glb.js), chỉ bấm được
        //  khi đang thấy (VAN.engineSeen: xem xuyên hoặc ca-pô mở)
        const engineTool = { get objs() { const g = VAN.engineModel; return g ? [g] : []; }, vis: () => VAN.engineSeen(), title: 'Động cơ V6 · Ford Transit', go: '▶ Khởi động máy', act: 'engine' };
        const TOOLS = [
          { objs: [DRONE.object, DRONE.rc], title: 'Drone DJI Mini 3', go: '▶ Chơi', act: 'drone' },
          engineTool,
          // G 18/10 máy cắt cỏ đeo lưng (camp/trimmer.js): bấm ⇒ kỹ sư giật nổ máy, đeo ba lô, phát cỏ các vòng quanh bếp lửa rồi cất máy (engineer/tasks/trim-grass.js)
          { objs: [TRIMMER.g], vis: () => TRIMMER.ready && !ENGINEER.trimming, title: 'Máy cắt cỏ đeo lưng', go: '▶ Cắt cỏ', act: 'trim' },
          { objs: [ENGINEER.applePole, ENGINEER.appleBasket], title: 'Sào hái trái · giỏ táo', go: '🍎 Hái táo', act: 'apples' },
        ];
        const toolOf = o => { for (let p = o; p; p = p.parent) for (const T of TOOLS) if (T.objs.includes(p)) return T; return null; }, _dcP = new THREE.Vector3(), _dcO = new THREE.Vector3();
        let tCur = null;
        function showToolPop(T, x, y) {
          const r = dom.getBoundingClientRect(), O = ENGINEER.offer(T.act), why = O.why(); tCur = T;
          tTitle.textContent = T.title; tGo.textContent = T.go; tMsg.textContent = why || (O.call || O.plan)(); tGo.disabled = !!why; tGo.style.opacity = why ? '0.45' : '1';
          tPop.style.left = Math.max(8, Math.min(r.width - 222, x - r.left + 14)) + 'px'; tPop.style.top = Math.max(8, Math.min(r.height - 130, y - r.top - 24)) + 'px'; tPop.style.display = 'block';
        }
        if (tPop) {
          listen(dom, 'pointerup', e => {
            if (e.button !== 0 || pickMode || Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return;
            const r = dom.getBoundingClientRect();
            pickRay.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
            if (DRONE.flying) {   // G 24/10 "khi chơi drone, click vào drone ⇒ camera close up và tự động follow drone": drone nhỏ, bay nhanh ⇒ bấm trúng = trong 48 điểm ảnh quanh hình chiếu
              const q = DRONE.object.getWorldPosition(_dcP).project(camera), sx = r.left + (q.x + 1) / 2 * r.width, sy = r.top + (1 - q.y) / 2 * r.height;
              if (q.z < 1 && Math.hypot(e.clientX - sx, e.clientY - sy) < 48) { tPop.style.display = 'none'; tCur = null; camFollow(DRONE.object, 55, { exact: true, off: _dcO.set(0, 0.12, 0), rate: 7 }); return; }   // ×55 (drone 25 cm: ×30 vẫn chỉ ~50 điểm ảnh) — lăn chuột thì về giới hạn ×30 như thường
            }
            const h = pickRay.intersectObjects(TOOLS.filter(T => !T.vis || T.vis()).flatMap(T => T.objs), true)[0], T = h && toolOf(h.object);
            if (T && T.act === 'wood') CHIMINEA.see();   // bấm lò chiminea: vỏ trong 50% / trả lại (camp/chiminea.js)
            if (T) showToolPop(T, e.clientX, e.clientY); else { tPop.style.display = 'none'; tCur = null; }
          });
          listen(tGo, 'click', () => { if (!tCur || ENGINEER.offer(tCur.act).why()) return; ENGINEER.ask(tCur.act); tPop.style.display = 'none'; tCur = null; });
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
        const bS = document.getElementById('btnSky');
        if (bS) listen(bS, 'click', () => { skyOn = !skyOn; if (skyOn) { sky.visible = true; } else setSkyDefault(); tbIcon(bS, skyOn ? 'sun-moon' : 'sun', skyOn ? 'Trời theo giờ thật' : 'Trời cố định (ban ngày)'); });
        function resize() { const w = W(), h = Hv(), pc = pxCap(w, h); if (renderer.getPixelRatio() > pc) renderer.setPixelRatio(pc); renderer.setSize(w, h);   // trần điểm ảnh (core/boot.js)
          const a = w / h, d = 90; camera.left = -d * a; camera.right = d * a; camera.top = d; camera.bottom = -d; camera.updateProjectionMatrix(); }
        listen(window, 'resize', resize); resize();
