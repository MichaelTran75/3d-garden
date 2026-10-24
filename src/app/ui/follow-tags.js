        // ===== NHÃN + ĐƯỜNG DẪN theo con vật / người (G 18/10 "add leader và label vào engineer, racoon, con hươu"): như nhãn drone (engineer/tasks/drone.js) — thẻ cỡ cố định
        //  trên màn hình (34 px, ngang nhãn cảnh), đường dẫn 64 px chỉ xuống đỉnh đầu, đi theo mỗi khung; ẩn khi vật ẩn (gấu mèo chỉ ra chạng vạng – đêm). Kỹ sư: G 23/10 gộp
        //  vào bong bóng suy nghĩ (dòng đầu = việc đang làm — engineer/mind/thought-bubble.js). Nằm trong labelGroup ⇒ nút "Nhãn" tắt cùng các nhãn khác. Mỗi khung: followTagsTick (loop/main-loop-rest.js) ----
        const _ftP = new THREE.Vector3(), _ftB = new THREE.Box3();
        const FTAGS = [
          { o: raccoonObj, col: '#6b6f78', txt: () => 'Gấu mèo' },
          { o: stag && stag.g, col: '#9b6e43', txt: () => 'Hươu' }];
        function followTagsTick() {
          const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), h = 34 * upp, lead = 64 * upp;   // đơn vị thế giới / 1 px CSS (camera trực giao)
          for (const T of FTAGS) {
            if (!T.o) continue; const on = hovShown(T.o);
            if (!T.tag) { if (!on) continue; T.tag = addLabel(T.txt(), T.col, new THREE.Vector3(), new THREE.Vector3(), true, undefined, true); T.k = T.tag.sprite.scale.x / T.tag.sprite.scale.y; }
            T.tag.sprite.visible = T.tag.line.visible = on; if (!on) continue;
            const s = T.txt(); if (s !== T.tag.text) { T.tag.update(s); T.k = T.tag.sprite.scale.x / T.tag.sprite.scale.y; }
            let p; if (T.top) p = T.top(); else { if (T.dy === undefined) { _ftB.setFromObject(T.o); T.dy = _ftB.max.y - T.o.position.y; } p = _ftP.copy(T.o.position); p.y += T.dy; }   // đỉnh vật (đo 1 lần)
            T.tag.sprite.scale.set(h * T.k, h, 1); T.tag.sprite.position.set(p.x, p.y + lead + h / 2, p.z);
            const pa = T.tag.line.geometry.attributes.position; pa.setXYZ(0, p.x, p.y + lead, p.z); pa.setXYZ(1, p.x, p.y + 4 * upp, p.z); pa.needsUpdate = true; T.tag.line.geometry.computeBoundingSphere();
          }
        }
        // ---- CHÚ THÍCH NÚT (G 18/10 "add leader horizontal line và label (click here) vào các điểm button như logo và tay cầm"): mỗi vật chọn được có it.tag (logo,
        //  2 tay nắm) có nhãn "Click" (G 19/10, trước là "Bấm vào đây") + đường dẫn NẰM NGANG trên màn hình (dọc trục phải của camera), thẻ đặt về phía ngoài thân xe; chỉ hiện khi zoom đủ gần
        //  (1 đv > ~33 px) và mặt nút quay về camera ----
        const _btP = new THREE.Vector3(), _btR = new THREE.Vector3(), _btF = new THREE.Vector3(), _btQ = new THREE.Quaternion(), _btC = new THREE.Vector3();
        function btnTagsTick() {
          const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), h = 26 * upp, lead = 64 * upp, near = upp < 0.03;
          _btR.set(1, 0, 0).applyQuaternion(camera.quaternion); _btF.set(0, 0, -1).applyQuaternion(camera.quaternion); caravanObj.getWorldPosition(_btC);
          for (const it of HOV.items) {
            if (!it.tag) continue; let on = near && hovShown(it.root);
            if (on && it.rp.n) { it.root.getWorldQuaternion(_btQ); on = _btP.copy(it.rp.n).applyQuaternion(_btQ).dot(_btF) < -0.1; }
            if (!it.btag) { if (!on) continue; it.btag = addLabel('Click', '#e0662b', new THREE.Vector3(), new THREE.Vector3(), true, undefined, true); it.btk = it.btag.sprite.scale.x / it.btag.sprite.scale.y; }
            const T = it.btag; T.sprite.visible = T.line.visible = on; if (!on) continue;
            const p = hovBox(it, it.rp).getCenter(_btP).applyMatrix4(it.root.matrixWorld), s = Math.sign(_btC.sub(p).dot(_btR)) || 1, w = h * it.btk;   // thẻ phía ngược tâm xe
            caravanObj.getWorldPosition(_btC);
            T.sprite.scale.set(w, h, 1); T.sprite.position.copy(p).addScaledVector(_btR, -s * (lead + w / 2));
            const pa = T.line.geometry.attributes.position; pa.setXYZ(0, p.x - s * _btR.x * 5 * upp, p.y - s * _btR.y * 5 * upp, p.z - s * _btR.z * 5 * upp);
            pa.setXYZ(1, p.x - s * _btR.x * lead, p.y - s * _btR.y * lead, p.z - s * _btR.z * lead); pa.needsUpdate = true; T.line.geometry.computeBoundingSphere();
          }
        }
        // ---- CAMERA THEO KỸ SƯ (G 18/10 "when click vào kỹ sư, camera will move to him"): bấm nút "Kỹ sư" mở bảng ⇒ điểm nhìn lướt tới kỹ sư 1,2 s (êm hai đầu),
        //  zoom vào ít nhất ×18, rồi bám theo kỹ sư; kéo phải (dời khung), phím W/A/S/D/mũi tên, nút về mặc định hoặc đóng bảng ⇒ thôi theo (kéo trái xoay vẫn theo) ----
        //  opt.exact: zoom đúng số (khung vừa vật — có thể zoom ra) · opt.off: điểm nhìn = gốc vật + off (thế giới; mặc định cao 1) · opt.rate: độ bám (vật bay nhanh: cao hơn)
        const CAMF = { o: null, k: 1, from: new THREE.Vector3(), z0: 1, z1: 1, off: null, rate: 3 };
        function camFollow(o, zoom = 18, opt = {}) { CAMF.o = o; CAMF.k = 0; CAMF.from.copy(target); CAMF.z0 = camera.zoom; CAMF.z1 = opt.exact ? zoom : Math.max(camera.zoom, zoom); CAMF.off = opt.off ? opt.off.clone() : null; CAMF.rate = opt.rate || 3; autoRotate = false; }
        function camFollowTick(dt) {
          if (!CAMF.o) return;
          if (CAMF.o === droneToy.g && !/^(arm|flying|land)$/.test(droneToy.state.st)) camFollow(engObj.g, Math.min(camera.zoom, 18), { exact: true });   // drone đã hạ cánh ⇒ camera lùi về theo kỹ sư (đang đem drone cất), zoom ×18 thay cho cận cảnh drone
          const p = CAMF.o.getWorldPosition(_ftP); if (CAMF.off) p.add(CAMF.off); else p.y += 1.0;
          if (CAMF.k < 1) { CAMF.k = Math.min(1, CAMF.k + dt / 1.2); const e = CAMF.k * CAMF.k * (3 - 2 * CAMF.k); target.lerpVectors(CAMF.from, p, e); camera.zoom = CAMF.z0 + (CAMF.z1 - CAMF.z0) * e; camera.updateProjectionMatrix(); }
          else target.lerp(p, Math.min(1, dt * CAMF.rate));
        }
        listen(dom, 'pointerdown', e => { if (e.button === 2) CAMF.o = null; });
        listen(window, 'keydown', e => { if (/^(w|a|s|d|arrow)/i.test(e.key)) CAMF.o = null; });
        { const r = document.getElementById('btnReset'); if (r) listen(r, 'click', () => { CAMF.o = null; }); }
