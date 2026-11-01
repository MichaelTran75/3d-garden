        // ===== NHÃN + ĐƯỜNG DẪN theo con vật / người (G 18/10 "add leader và label vào engineer, racoon, con hươu"): như nhãn drone (engineer/tasks/drone.js) — thẻ cỡ cố định
        //  trên màn hình (34 px, ngang nhãn cảnh), đường dẫn 64 px chỉ xuống đỉnh đầu, đi theo mỗi khung; ẩn khi vật ẩn (gấu mèo chỉ ra chạng vạng – đêm). Kỹ sư: G 23/10 gộp
        //  vào bong bóng suy nghĩ (dòng đầu = việc đang làm — engineer/mind/thought-bubble.js). Nằm trong labelGroup ⇒ nút "Nhãn" tắt cùng các nhãn khác. Mỗi khung: followTagsTick (loop/main-loop-rest.js) ----
        //  G 01/11 "add leader line và lable "drainage" vào cống thoát nước mưa": nhãn Drainage chỉ xuống giữa gờ đỉnh tường đầu cửa xả (world/storm-drain.js)
        const _ftP = new THREE.Vector3(), _ftB = new THREE.Box3();
        const _ftDr = (({ faceX, OUT, zE }) => new THREE.Vector3(faceX - 0.15, OUT.inv + 1.14, zE))(stormDrain.net);
        const FTAGS = [
          { o: worldSee('raccoon').object, col: '#6b6f78', txt: () => 'Gấu mèo' },
          { o: worldSee('deer').object, col: '#9b6e43', txt: () => 'Hươu' },
          { o: stormDrain.outfall, col: '#3f7fb0', txt: () => 'Drainage', top: () => _ftDr }];
        worldTick('viewer', 40, () => followTagsTick()); worldTick('viewer', 50, () => btnTagsTick());   // MỖI KHUNG (sổ tick, lượt người xem — sau camera bám vật)
        function followTagsTick() {
          const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), h = 34 * upp, lead = 64 * upp;   // đơn vị thế giới / 1 px CSS (camera trực giao)
          for (const T of FTAGS) {
            if (!T.o) continue; const on = shownInScene(T.o);
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
          _btR.set(1, 0, 0).applyQuaternion(camera.quaternion); _btF.set(0, 0, -1).applyQuaternion(camera.quaternion); VAN.object.getWorldPosition(_btC);
          for (const it of HOV.items) {
            if (!it.tag) continue; let on = near && shownInScene(it.root);
            if (on && it.rp.n) { it.root.getWorldQuaternion(_btQ); on = _btP.copy(it.rp.n).applyQuaternion(_btQ).dot(_btF) < -0.1; }
            if (!it.btag) { if (!on) continue; it.btag = addLabel('Click', '#e0662b', new THREE.Vector3(), new THREE.Vector3(), true, undefined, true); it.btk = it.btag.sprite.scale.x / it.btag.sprite.scale.y; }
            const T = it.btag; T.sprite.visible = T.line.visible = on; if (!on) continue;
            const p = hovBox(it, it.rp).getCenter(_btP).applyMatrix4(it.root.matrixWorld), s = Math.sign(_btC.sub(p).dot(_btR)) || 1, w = h * it.btk;   // thẻ phía ngược tâm xe
            VAN.object.getWorldPosition(_btC);
            T.sprite.scale.set(w, h, 1); T.sprite.position.copy(p).addScaledVector(_btR, -s * (lead + w / 2));
            const pa = T.line.geometry.attributes.position; pa.setXYZ(0, p.x - s * _btR.x * 5 * upp, p.y - s * _btR.y * 5 * upp, p.z - s * _btR.z * 5 * upp);
            pa.setXYZ(1, p.x - s * _btR.x * lead, p.y - s * _btR.y * lead, p.z - s * _btR.z * lead); pa.needsUpdate = true; T.line.geometry.computeBoundingSphere();
          }
        }
        // bám vật (CAMF / camFollow — core/view.js): kéo phải, phím W/A/S/D / mũi tên, nút về mặc định ⇒ thôi theo
        listen(dom, 'pointerdown', e => { if (e.button === 2) CAMF.o = null; });
        listen(window, 'keydown', e => { if (/^(w|a|s|d|arrow)/i.test(e.key)) CAMF.o = null; });
        { const r = document.getElementById('btnReset'); if (r) listen(r, 'click', () => { CAMF.o = null; }); }
