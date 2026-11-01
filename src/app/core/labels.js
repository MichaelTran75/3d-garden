        // ==== LỚP NHÃN (hạ tầng — dời nguyên văn từ ui/labels-controls.js 01/11 đợt 10, G "mọi tương tác là độc lập"): nhóm labelGroup + addLabel (thẻ bo màu be,
        //      chấm màu, đường dẫn mảnh, vẽ đè lên mọi thứ) — đơn vị nào cũng gắn nhãn của mình vào (drone, radio, động cơ nổi, chòm sao, nhãn theo con vật…);
        //      nút "Nhãn" (ui/labels-controls.js) bật / tắt cả lớp, bong bóng kỹ sư đọc labelGroup.visible. Đứng ngay trước ui/labels-controls.js ⇒ thứ tự dựng
        //      cảnh không đổi ====
        // ---- labels ----
        const labelGroup = new THREE.Group(); scene.add(labelGroup);
        function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
        const annotationLabelScale = 0.65; // Same text size as the Gia Lai weather label.
        // emoji trong nhãn (👷🏻‍♂️ của kỹ sư): texture nhãn không gắn sRGB ⇒ bộ vẽ mã hoá sRGB thêm lần nữa, chữ đen không sao nhưng emoji bạc màu — vẽ emoji
        //  qua canvas phụ, đổi điểm ảnh sRGB → tuyến tính trước để ra đúng màu, giữ nguyên màu nền các nhãn khác
        const LBL_EMO = /(\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|️|‍\p{Extended_Pictographic})*️?)/u;
        const LBL_LIN = Uint8Array.from({ length: 256 }, (_, i) => { const c = i / 255; return Math.round(255 * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); });
        function fillLabelText(x, s, px, py, maxW) {
          if (!LBL_EMO.test(s)) { x.fillText(s, px, py, maxW); return; }
          const o = document.createElement('canvas'), ox = o.getContext('2d', { willReadFrequently: true });
          s.split(LBL_EMO).forEach((part, i) => { if (!part) return; const w = x.measureText(part).width;
            if (i % 2) { o.width = Math.ceil(w) + 8; o.height = 96; ox.font = x.font; ox.textBaseline = 'middle'; ox.fillText(part, 4, 48);
              const d = ox.getImageData(0, 0, o.width, o.height), a = d.data; for (let j = 0; j < a.length; j += 4) { a[j] = LBL_LIN[a[j]]; a[j + 1] = LBL_LIN[a[j + 1]]; a[j + 2] = LBL_LIN[a[j + 2]]; }
              ox.putImageData(d, 0, 0); x.drawImage(o, px - 4, py - 48); } else x.fillText(part, px, py);
            px += w; });
        }
        function addLabel(text, dot, pos, to, dynamic = false, labelScale = annotationLabelScale, solid = false) {   // solid: nền + viền + đường dẫn 100% (nhãn gắn nhân vật / vật trên xe — G 19/10)
          const c = document.createElement('canvas'), f = '600 46px Inter, system-ui, Arial', pad = 92, h = 108, k = 0.052 * labelScale;
          const measure = c.getContext('2d'); measure.font = f;
          // A dynamic label reuses one fixed-size texture. Only its UV crop and sprite width change.
          c.width = dynamic ? 1536 : Math.ceil(measure.measureText(text).width + pad + 40); c.height = h;
          const x = c.getContext('2d'), t = new THREE.CanvasTexture(c); t.anisotropy = 4;
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 1, depthTest: false, depthWrite: false }));
          sp.renderOrder = 20; sp.position.copy(pos); labelGroup.add(sp);
          const lg = new THREE.BufferGeometry().setFromPoints([pos.clone().add(new THREE.Vector3(0, -h * k * 0.5, 0)), to]);
          const ln = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x3a3530, transparent: true, opacity: solid ? 1 : 0.5, depthTest: false })); ln.renderOrder = 19; labelGroup.add(ln);
          let currentText = null;
          function update(nextText) {
            if (nextText === currentText) return;
            currentText = nextText; x.clearRect(0, 0, c.width, h); x.font = f;
            const width = Math.min(c.width, Math.ceil(x.measureText(nextText).width + pad + 40));
            rr(x, 3, 3, width - 6, h - 6, 40); x.fillStyle = solid ? '#e2d6c0' : 'rgba(226,214,192,0.5)'; x.fill();
            x.lineWidth = 3; x.strokeStyle = solid ? '#4b4a46' : 'rgba(75,74,70,0.5)'; x.stroke();
            x.beginPath(); x.arc(54, h / 2, 16, 0, 7); x.fillStyle = dot; x.fill();
            x.fillStyle = '#000000'; x.globalAlpha = 1; x.textBaseline = 'middle'; fillLabelText(x, nextText, pad, h / 2 + 2, width - pad - 40);
            t.repeat.set(width / c.width, 1); t.needsUpdate = true; sp.scale.set(width * k, h * k, 1);
            sp.name = 'Nhãn: ' + nextText;
          }
          update(text);
          return { sprite: sp, line: ln, texture: t, canvas: c, update, get text() { return currentText; } };
        }
