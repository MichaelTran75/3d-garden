        // ==== LỚP NHÃN (hạ tầng — dời nguyên văn từ ui/labels-controls.js 01/11 đợt 10): nhóm labelGroup + addLabel (thẻ bo màu be,
        //      chấm màu, đường dẫn mảnh, vẽ đè lên mọi thứ) — đơn vị nào cũng gắn nhãn của mình vào (drone, radio, động cơ nổi, chòm sao, nhãn theo con vật…);
        //      nút "Nhãn" (ui/labels-controls.js) bật / tắt cả lớp, bong bóng kỹ sư đọc labelGroup.visible. Đứng ngay trước ui/labels-controls.js ⇒ thứ tự dựng
        //      cảnh không đổi ====
        // ---- labels ----
        const labelGroup = new THREE.Group(); scene.add(labelGroup); sharpRoots.push(labelGroup);   // mọi nhãn: lớp nét (core/lens.js)
        function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
        const annotationLabelScale = 0.65; // Same text size as the Gia Lai weather label.
        function addLabel(text, dot, pos, to, dynamic = false, labelScale = annotationLabelScale, solid = false) {   // solid: nền + viền + đường dẫn 100% (nhãn gắn nhân vật / vật trên xe)
          // thẻ vẽ ở LỚP CHỮ HTML (core/html-text.js — paint theo đơn vị cũ: cao 108, rộng theo chữ) ⇒ nét như chữ trang web; sprite giữ chỗ / cỡ như cũ
          //  (đơn vị gọi vẫn đặt position / scale, đọc scale.x / scale.y để biết tỉ lệ thẻ). Màu: màu gốc của thẻ cũ qua htRaw (ảnh cũ không gắn sRGB) rồi lớp chữ
          //  tone map như WebGL (htTone) ⇒ nền / viền nhạt / chấm màu dịu y như cũ trên màn hình, chữ đen vẫn đen; emoji vẽ thẳng (bản cũ đã sửa riêng cho đúng màu)
          const c = document.createElement('canvas'), f = '600 46px Inter, system-ui, Arial', pad = 92, h = 108, k = 0.052 * labelScale, measure = c.getContext('2d'); measure.font = f;
          const maxW = dynamic ? 1536 : Math.ceil(measure.measureText(text).width + pad + 40);
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 1, depthTest: false, depthWrite: false }));
          sp.renderOrder = 20; sp.position.copy(pos); labelGroup.add(sp);
          const lg = new THREE.BufferGeometry().setFromPoints([pos.clone().add(new THREE.Vector3(0, -h * k * 0.5, 0)), to]);
          const ln = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x3a3530, transparent: true, opacity: solid ? 1 : 0.5, depthTest: false })); ln.renderOrder = 19; labelGroup.add(ln);
          let currentText = null;
          const cBg = htRaw(solid ? '#e2d6c0' : 'rgba(226,214,192,0.5)'), cLn = htRaw(solid ? '#4b4a46' : 'rgba(75,74,70,0.5)'), cDot = htRaw(dot);   // màu gốc thẻ cũ
          const paint = (x, w) => {
            rr(x, 3, 3, w - 6, h - 6, 40); x.fillStyle = cBg; x.fill();
            x.lineWidth = 3; x.strokeStyle = cLn; x.stroke();
            x.beginPath(); x.arc(54, h / 2, 16, 0, 7); x.fillStyle = cDot; x.fill();
            x.font = f; x.fillStyle = '#000000'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(currentText, pad, h / 2 + 2, w - pad - 40);
          };
          htmlSprite(sp, { paint, w: maxW, h });
          function update(nextText) {
            if (nextText === currentText) return;
            currentText = nextText; measure.font = f;
            const width = Math.min(maxW, Math.ceil(measure.measureText(nextText).width + pad + 40));
            sp.userData.html.w = width; htmlSpriteDirty(sp); sp.scale.set(width * k, h * k, 1);
            sp.name = 'Nhãn: ' + nextText;
          }
          update(text);
          return { sprite: sp, line: ln, canvas: c, update, get text() { return currentText; } };
        }
