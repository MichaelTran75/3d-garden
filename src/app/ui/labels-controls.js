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
        function addMastWeatherCard(pos, to, labelScale = annotationLabelScale) {
          const cardWidth = 1536, cardHeight = 118, resolution = 2;
          const c = document.createElement('canvas'); c.width = cardWidth * resolution; c.height = cardHeight * resolution;
          const x = c.getContext('2d'), texture = new THREE.CanvasTexture(c), k = .052 * labelScale;
          x.setTransform(resolution, 0, 0, resolution, 0, 0);
          texture.anisotropy = 4;
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
          sprite.position.copy(pos); sprite.renderOrder = 20; sprite.visible = false; labelGroup.add(sprite);
          // A DOM backdrop blurs the scene behind the card; its canvas text stays sharp.
          mastGlass = document.createElement('div'); mastGlass.className = 'mast-glass';
          mastGlass.setAttribute('aria-label', 'Thông tin khí tượng'); mastGlass.appendChild(c); container.appendChild(mastGlass);
          const screenPoint = new THREE.Vector3(); let screenSignature = '';
          const geometry = new THREE.BufferGeometry().setFromPoints([pos.clone().add(new THREE.Vector3(0, -cardHeight * k / 2, 0)), to]);
          const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x3a3530, transparent: true, opacity: .5, depthTest: false }));
          line.renderOrder = 19; labelGroup.add(line);
          let signature = '';
          return {
            sprite, line, texture, canvas: c, updateScreen() {
              if (!mastGlass) return;
              screenPoint.copy(sprite.position).project(camera);
              const visible = screenPoint.z >= -1 && screenPoint.z <= 1;
              const width = sprite.scale.x * camera.zoom * W() / (camera.right - camera.left);
              const height = sprite.scale.y * camera.zoom * Hv() / (camera.top - camera.bottom);
              const left = (screenPoint.x + 1) * W() / 2 - width / 2;
              const top = (1 - screenPoint.y) * Hv() / 2 - height / 2;
              const signature = [visible, left, top, width, height].map(v => typeof v === 'number' ? v.toFixed(2) : v).join('|');
              if (signature === screenSignature) return; screenSignature = signature;
              mastGlass.style.display = visible ? 'block' : 'none';
              mastGlass.style.left = left + 'px'; mastGlass.style.top = top + 'px';
              mastGlass.style.width = width + 'px'; mastGlass.style.height = height + 'px';
            }, update(rows) {
              const next = JSON.stringify(rows); if (next === signature) return; signature = next;
              x.font = '400 11.5px Inter, system-ui, Arial';
              const width = Math.min(cardWidth, Math.ceil(Math.max(...rows.map(row => x.measureText(row).width)) + 18));
              x.clearRect(0, 0, cardWidth, cardHeight);
              rr(x, 3, 3, width - 6, cardHeight - 6, 7); x.fillStyle = 'rgba(226,214,192,0.25)'; x.fill();
              x.fillStyle = '#000000'; x.textBaseline = 'middle';
              rows.forEach((row, i) => {
                x.font = i === 7 ? '400 7.5px Inter, system-ui, Arial' : '400 11.5px Inter, system-ui, Arial';
                const y = i === 7 ? 109 : 12.5 + i * 13.5;
                let left = 9;
                for (const part of row.split(/(-?\d+(?:[,.]\d+)*(?::\d+)?)/g)) {
                  x.fillStyle = '#000000';
                  x.fillText(part, left, y); left += x.measureText(part).width;
                }
              });
              texture.repeat.set(width / cardWidth, 1); texture.needsUpdate = true; sprite.scale.set(width * k, cardHeight * k, 1);
              mastGlass.style.setProperty?.('--card-crop', String(width / cardWidth));
              if (c.style) { c.style.setProperty('width', (cardWidth / width * 100) + '%', 'important'); c.style.setProperty('max-width', 'none'); }
              mastGlass.setAttribute('aria-label', rows.join('. '));
              sprite.name = 'Khí tượng: ' + rows.join(' | ');
            }
          };
        }
        // Attach the wind leader to the actual moved turbine #3, above its swept blade envelope.
        const windLabelTurbine = scene.getObjectByName('Tua-bin gió #3 (Wind Turbine)');
        const windLabelRotor = rotors.find(r => r.rotor.parent === windLabelTurbine).rotor;
        const windLabelTo = windLabelTurbine.localToWorld(new THREE.Vector3(0, windLabelRotor.position.y + 0.38 * windLabelRotor.scale.x, 0));
        const windLabelPosition = windLabelTo.clone().add(new THREE.Vector3(0, 9 * windLabelRotor.scale.x + 108 * 0.052 * annotationLabelScale / 2, 0));
        const windLabel = addLabel('Điện gió liên kết · 80 MW', '#3a6ea5', windLabelPosition, windLabelTo);
        addLabel('Mặt trời trực tiếp · 51,58 MWp', '#c98a3a', new THREE.Vector3(X0 + 152, 26 - 108 * 0.052 * (1 - annotationLabelScale) / 2, Z0 + 70), new THREE.Vector3(X0 + 152, 8, Z0 + 70));
        const hydroLabelTo = new THREE.Vector3(wx(33 * S), resTopY + 5, wz(DAM_J));
        const hydroLabelHalfHeight = 108 * 0.052 * annotationLabelScale / 2;
        const hydroLabelY = hydroLabelTo.y + hydroLabelHalfHeight + (28 - 108 * 0.052 / 2 - hydroLabelTo.y) * 0.5;
        addLabel('Thủy điện trực tiếp · 28,2 MW', '#5a8f7b', new THREE.Vector3(wx(33 * S), hydroLabelY, wz(DAM_J)), hydroLabelTo);

        const rooftopWarehouse = scene.getObjectByName('Nhà kho mái pin mặt trời (Solar Warehouse)');
        const rooftopLabelTo = rooftopWarehouse.localToWorld(new THREE.Vector3(0, 6.525, 0));
        const rooftopLabelPosition = rooftopLabelTo.clone().add(new THREE.Vector3(0, 10 + 108 * 0.052 * annotationLabelScale / 2, 0));
        const rooftopLabel = addLabel('Điện mặt trời áp mái', '#c98a3a', rooftopLabelPosition, rooftopLabelTo);

        // Same rounded CanvasTexture label and world-space leader as the energy labels.
        const mastLabelTo = wmini.g.localToWorld(wmini.top.clone());   // nhãn khí tượng neo vào trạm mini
        const mastLabelScale = annotationLabelScale * 0.5;   // thẻ khí tượng: chữ nhỏ còn 1/2
        const mastLeaderLength = (20 - 108 * 0.052 / 2) * 0.25 * 0.5;   // đường dẫn ngắn còn 1/2
        const mastLabelPosition = mastLabelTo.clone().add(new THREE.Vector3(0, mastLeaderLength + 118 * 0.052 * mastLabelScale / 2, 0));
        mastLabel = addMastWeatherCard(mastLabelPosition, mastLabelTo, mastLabelScale);
        const unsubscribeMastWeather = window.gardenWeather.subscribe(updateMastReadout);
        sceneEvents.signal.addEventListener('abort', unsubscribeMastWeather, { once: true });

        // ---- controls ----
        let theta = Math.PI * 0.27, phi = 0.9, tTheta = theta, tPhi = phi, radius = 400, autoRotate = true;
        const target = new THREE.Vector3(0, 5, 0);
        const keys = {};
        listen(window, 'keydown', e => { if (e.target && (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(e.target.tagName) || e.target.isContentEditable)) return; if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) keys[e.key.toLowerCase()] = true; });   // đang gõ ô nhập X/Y/Z (panel Chọn) → không pan camera
        listen(window, 'keyup', e => { if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) keys[e.key.toLowerCase()] = false; });
        listen(document.getElementById('weather-city'), 'focus', () => { for (const key in keys) keys[key] = false; });
        const dom = renderer.domElement;
        let drag = false, dragMode = null, dragPointerId = null, lx = 0, ly = 0, cursorBeforeDrag = '';
        dom.style.touchAction = 'none';
        function finishDrag(e) {
          if (dragPointerId === null) return;
          if (e && e.pointerId !== undefined && e.pointerId !== dragPointerId) return;
          const id = dragPointerId;
          drag = false; dragMode = null; dragPointerId = null; dom.style.cursor = cursorBeforeDrag;
          if (id !== null && dom.hasPointerCapture && dom.hasPointerCapture(id)) dom.releasePointerCapture(id);
        }
        listen(dom, 'contextmenu', e => e.preventDefault());
        listen(dom, 'pointerdown', e => {
          if (dragPointerId !== null || e.isPrimary === false || (e.button !== 0 && e.button !== 2)) return;
          e.preventDefault();
          drag = true; dragMode = e.button === 2 ? 'pan' : 'orbit'; dragPointerId = e.pointerId;
          autoRotate = false; tTheta = theta; tPhi = phi;
          lx = e.clientX; ly = e.clientY; cursorBeforeDrag = dom.style.cursor;
          dom.style.cursor = 'grabbing';
          const rotateButton = document.getElementById('btnRotate');
          if (rotateButton) tbIcon(rotateButton, 'player-play', 'Tự xoay (đang dừng)');
          if (dom.setPointerCapture) dom.setPointerCapture(e.pointerId);
        });
        listen(dom, 'pointermove', e => {
          if (!drag || e.pointerId !== dragPointerId) return;
          if (e.buttons === 0) { finishDrag(e); return; }
          const dx = e.clientX - lx, dy = e.clientY - ly;
          if (dragMode === 'pan') {
            const rect = dom.getBoundingClientRect();
            const ux = (camera.right - camera.left) / (camera.zoom * Math.max(1, rect.width));
            const uy = (camera.top - camera.bottom) / (camera.zoom * Math.max(1, rect.height));
            const groundY = dy * uy / Math.max(0.12, Math.cos(phi));
            target.x -= Math.sin(theta) * dx * ux + Math.cos(theta) * groundY;
            target.z += Math.cos(theta) * dx * ux - Math.sin(theta) * groundY;
            // Move the camera target on the XZ ground plane; keep object coordinates and target.y fixed.
          } else {
            tTheta -= dx * 0.005; tPhi = Math.max(0.16, Math.min(1.45, tPhi - dy * 0.005));
          }
          lx = e.clientX; ly = e.clientY;
        });
        listen(window, 'pointerup', finishDrag);
        listen(window, 'pointercancel', finishDrag);
        listen(dom, 'lostpointercapture', finishDrag);
        listen(window, 'blur', () => { finishDrag(); for (const key in keys) keys[key] = false; });
        // ---- hover → hiển thị tọa độ (x,y,z) trên địa hình ----
        const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2(); let coordOn = true, coordMoved = false;
        const coordTip = document.getElementById('coordTip');
        listen(dom, 'pointermove', e => {
          const r = dom.getBoundingClientRect();
          ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
          coordMoved = true;
        });
        listen(dom, 'pointerleave', () => { coordTip.style.display = 'none'; coordMoved = false; });
        listen(dom, 'wheel', e => { e.preventDefault(); const z0 = camera.zoom; camera.zoom *= (e.deltaY > 0 ? 0.92 : 1.08); camera.zoom = Math.max(0.5, Math.min(Math.max(30.0, z0), camera.zoom)); camera.updateProjectionMatrix(); }, { passive: false });   // đang cận cảnh > 30 (bám drone) ⇒ lăn ra êm, không giật về 30
        const bR = document.getElementById('btnRotate'), bL = document.getElementById('btnLabels'), bRe = document.getElementById('btnReset');
        function tbIcon(b, icon, label) { b.innerHTML = '<i class="ti ti-' + icon + '"></i>'; b.title = label; b.setAttribute('aria-label', label); }   // thanh nút tối giản (G 18/10): chỉ biểu tượng, tên ở chú thích
        if (bR) listen(bR, 'click', () => { autoRotate = !autoRotate; tbIcon(bR, 'player-' + (autoRotate ? 'pause' : 'play'), autoRotate ? 'Tự xoay' : 'Tự xoay (đang dừng)'); });
        if (bL) listen(bL, 'click', () => { labelGroup.visible = !labelGroup.visible; tbIcon(bL, labelGroup.visible ? 'tag' : 'tag-off', labelGroup.visible ? 'Nhãn' : 'Nhãn (đang ẩn)'); });
        if (bRe) listen(bRe, 'click', () => { tTheta = Math.PI * 0.27; tPhi = 0.9; camera.zoom = 0.5; target.set(0, 5, 0); camera.updateProjectionMatrix(); autoRotate = true; if (bR) tbIcon(bR, 'player-pause', 'Tự xoay'); });
        // ---- % zoom: 100% = góc nhìn mặc định (camera.zoom 0.5); bấm để về 100% ----
        const ZOOM_BASE = 0.5, zoomBtn = document.getElementById('zoomPct'), zoomText = zoomBtn?.querySelector('span');
        let shownZoom = -1;
        function updateZoomPct() { if (!zoomText || camera.zoom === shownZoom) return; shownZoom = camera.zoom; const z = Math.round(camera.zoom / ZOOM_BASE * 100) + '%'; zoomText.textContent = z; zoomBtn.title = 'Zoom ' + z + ' · bấm để về 100%'; zoomBtn.setAttribute('aria-label', 'Zoom ' + z + ', bấm để về 100%'); }
        if (zoomBtn) listen(zoomBtn, 'click', () => { camera.zoom = ZOOM_BASE; camera.updateProjectionMatrix(); updateZoomPct(); });
        const bA = document.getElementById('btnAxes');
        if (bA) listen(bA, 'click', () => { coordOn = !coordOn; axesGroup.visible = coordOn; bA.style.opacity = coordOn ? '1' : '0.5'; numSprites.forEach(s => s.visible = coordOn); if (!coordOn) { coordTip.style.display = 'none'; pin.visible = false; } });

        // ---- THANH TRƯỢT NÉT VIỀN XE (G 18/10 "0 = complete 100% transparent border line, 100 = 100% border line visible"): độ mờ các vật liệu nét riêng
        //      của xe (vanLine, core/axes-pin-bake.js) + mặt vỏ xe (VAN_LINES.onShell); 0 thì tắt hẳn vật liệu nét (khỏi tốn lượt vẽ) ----
        const vlR = document.getElementById('vanLineRange'), vlV = document.getElementById('vanLineVal');
        function setVanLines(v) {
          v = Math.max(0, Math.min(100, Math.round(+v || 0))); VAN_LINES.k = v / 100;
          for (const m of vanLineMats.values()) { m.opacity = VAN_LINES.k; m.visible = v > 0; } if (VAN_LINES.onShell) VAN_LINES.onShell();   // mặt vỏ mờ theo (ui/xray-lifecycle.js)
          if (vlR && +vlR.value !== v) vlR.value = v; if (vlV) vlV.textContent = v; return v;
        }
        if (vlR) { setVanLines(100); listen(vlR, 'input', () => setVanLines(vlR.value)); }   // G 18/10: mở trang luôn ở 100 (không nhớ mức cũ)
        const vlBar = document.getElementById('vanLineBar'); let vlNight = null;
        function vanLineTone(night) { if (vlBar && night !== vlNight) { vlNight = night; vlBar.classList.toggle('night', night); } }   // đêm: thanh trắng sáng · ngày: đen

        // ═══════ CHỌN OBJECT (click-to-inspect): click bất kỳ vật thể nào (kể cả 1 instance riêng lẻ trong cụm hoa/cỏ)
        //          → hiện bảng toạ độ · xoay · scale · màu · hình học, có nút Sao chép để gửi cho Jade ═══════
        const bP = document.getElementById('btnPick'), pickPanel = document.getElementById('pickPanel'), pickBody = document.getElementById('pickBody'), pickTitle = document.getElementById('pickTitle');
        const pickEditRow = document.getElementById('pickEditRow'), pickXIn = document.getElementById('pickX'), pickYIn = document.getElementById('pickY'), pickZIn = document.getElementById('pickZ');
        let pickMode = false, pickDownX = 0, pickDownY = 0, pickTarget = null;
        const pickRay = new THREE.Raycaster(); pickRay.layers.enableAll();   // mảnh hình đã gộp vẽ nằm ở lớp ẩn HIDE_LAYER — vẫn chọn được
        const pickBox = new THREE.Box3Helper(new THREE.Box3(), 0xff2d55); pickBox.visible = false; pickBox.renderOrder = 30; scene.add(pickBox);
        // G 24/10 "research and study để improve chọn vật thể button" — theo Unity Scene picking (bấm chọn; bấm lặp chỗ chồng lấn ⇒ xoay vòng các vật; khung vật
        //  chọn khác màu phần con; phím F khung camera vào vật chọn): RÊ CHUỘT ⇒ khung trắng + tên vật dưới con trỏ (trễ 0,12 s, 1 tia mỗi lần dừng tay) · BẤM ⇒
        //  chọn CẢ VẬT (tổ tiên có tên cao nhất: cả kính, cả cây, cả xe) · bấm lại đúng chỗ ⇒ sâu 1 cấp (phần có tên → mảnh → bản sao trong cụm hoa / cỏ) · Alt +
        //  bấm ⇒ vật phía sau dọc tia (xoay vòng) · bấm đúp / F / nút "Tới" ⇒ camera lướt tới, zoom vừa vật, bám theo nếu vật di chuyển · Esc ⇒ bỏ chọn, lần nữa ⇒
        //  thoát chế độ. Khung đỏ bám vật đang di chuyển (10 lần / giây). Bảng có thêm kích thước + cấp đang chọn + dòng hướng dẫn.
        const pickHovBox = new THREE.Box3Helper(new THREE.Box3(), 0xffffff); pickHovBox.visible = false; pickHovBox.renderOrder = 29; pickHovBox.material.transparent = true; pickHovBox.material.opacity = 0.75; scene.add(pickHovBox);
        const pickHov = document.createElement('div'); pickHov.style.cssText = 'position:fixed;z-index:40;pointer-events:none;display:none;padding:3px 7px;border-radius:6px;font:600 11.5px/1.3 system-ui,sans-serif;color:#2b2922;background:rgba(246,240,228,.93);border:1px solid rgba(75,74,70,.25);box-shadow:0 2px 6px rgba(60,50,30,.18);white-space:nowrap';
        document.body.appendChild(pickHov); sceneEvents.signal.addEventListener('abort', () => pickHov.remove());
        const PK = { lvl: 0, ti: 0, x: -1e9, y: -1e9, t: 0, top: null, sel: null, hovH: 0, upT: 0, boxT: 0, pv: { ti: 0, lvl: 0 } };
        function pickHits(cx, cy) {   // mọi vật dọc tia (bỏ ghim, trục, khung chọn)
          const r = dom.getBoundingClientRect(); pickRay.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
          return pickRay.intersectObjects(scene.children, true).filter(h => { let o = h.object; if (o.userData.pickSkip) return false; while (o) { if (o === pin || o === axesGroup || o === pickBox || o === pickHovBox) return false; o = o.parent; } return true; });
        }
        function pickLevels(hit) {   // cấp chọn: cả vật (tên cao nhất) → phần có tên gần nhất → mảnh (bỏ cấp này với cụm instanced — trải cả bản đồ) → bản sao
          const ch = []; for (let p = hit.object; p && p !== scene; p = p.parent) ch.push(p);
          const named = ch.filter(o => o.name), lv = [], add = (o, inst = null) => { if (o && !lv.some(l => l.o === o && l.inst === inst)) lv.push({ o, inst }); };
          add(named[named.length - 1] || hit.object); add(named[0]); if (!hit.object.isInstancedMesh) add(hit.object); else if (hit.instanceId != null) add(hit.object, hit.instanceId);   // không tổ tiên nào có tên (nhóm chung của cảnh, địa hình): chọn ngay mảnh trúng tia, khỏi chọn cả khối lớn vô danh
          return lv;
        }
        function pickBoxOf(L) { return L.inst != null ? worldBoxOf(L.o, L.inst) : L.o.isMesh ? worldBoxOf(L.o) : new THREE.Box3().setFromObject(L.o); }
        function pickHover(cx, cy) {
          if (!pickMode) return; const hits = pickHits(cx, cy); if (!hits.length) { pickHovBox.visible = false; pickHov.style.display = 'none'; return; }
          const top = pickLevels(hits[0])[0].o; if (PK.sel && PK.top === top) { pickHovBox.visible = false; pickHov.style.display = 'none'; return; }
          pickHovBox.box.setFromObject(top); pickHovBox.visible = !pickHovBox.box.isEmpty();
          pickHov.textContent = (top.name || top.type) + ' · bấm để chọn'; pickHov.style.left = (cx + 14) + 'px'; pickHov.style.top = (cy + 16) + 'px'; pickHov.style.display = 'block';
        }
        function pickFrame() {   // camera lướt tới vật đang chọn, zoom vừa (vật cao ~40% khung), bám theo
          if (!PK.sel) return; const box = pickBoxOf(PK.sel); if (box.isEmpty()) return; const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
          let o = PK.sel.o; if (PK.sel.inst != null) { o = PK.anc || (PK.anc = new THREE.Object3D()); o.position.copy(c); o.updateMatrixWorld(); }   // bản sao trong cụm: mốc đứng yên ở tâm
          camFollow(o, Math.max(0.5, Math.min(30, 72 / Math.max(0.3, s.x, s.y, s.z))), { exact: true, off: c.sub(o.getWorldPosition(new THREE.Vector3())) });
        }
        function pickTick(t) {   // mỗi khung: khung đỏ bám vật đang di chuyển (10 lần / giây)
          if (!PK.sel || !pickBox.visible || t - PK.boxT < 0.1) return; PK.boxT = t; const b = pickBoxOf(PK.sel); if (!b.isEmpty()) pickBox.box.copy(b);
        }
        listen(dom, 'pointermove', e => { if (!pickMode) return; clearTimeout(PK.hovH); PK.hovH = setTimeout(() => pickHover(e.clientX, e.clientY), 120); });
        listen(dom, 'pointerleave', () => { clearTimeout(PK.hovH); pickHovBox.visible = false; pickHov.style.display = 'none'; });
        listen(window, 'keydown', e => {
          if (!pickMode || (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName))) return;
          if (e.key === 'Escape') { if (PK.sel) clearPickHighlight(); else bP?.click(); }
          else if (e.key === 'f' || e.key === 'F') pickFrame();
        });
        function clearPickHighlight() { pickBox.visible = false; pickPanel.style.display = 'none'; pickEditRow.style.display = 'none'; pickTarget = null; PK.sel = PK.top = null; }
        function fmtN(n) { return (Math.round(n * 1000) / 1000).toString(); }
        function worldBoxOf(obj, instanceId) {   // Box3 thế giới của mesh (hoặc đúng 1 instance riêng) — dùng vẽ khung viền đỏ
          const box = new THREE.Box3();
          if (obj.isInstancedMesh && instanceId != null) {
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            const instMat = new THREE.Matrix4(); obj.getMatrixAt(instanceId, instMat);
            box.copy(obj.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(obj.matrixWorld, instMat));
          } else if (obj.geometry) {
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            obj.updateWorldMatrix(true, false);
            box.copy(obj.geometry.boundingBox).applyMatrix4(obj.matrixWorld);
          } else box.setFromObject(obj);
          return box;
        }
        function showPickInfo(hit, L = { o: hit.object, inst: hit.instanceId ?? null }, lvl = 0, nLvl = 1, ti = 0, nTop = 1) {
          const obj = L.o;
          const lines = [];
          const posW = new THREE.Vector3(), quatW = new THREE.Quaternion(), scaleW = new THREE.Vector3();
          const isInst = obj.isInstancedMesh && L.inst != null;
          if (isInst) {
            const id = L.inst;
            const instMat = new THREE.Matrix4(); obj.getMatrixAt(id, instMat);
            new THREE.Matrix4().multiplyMatrices(obj.matrixWorld, instMat).decompose(posW, quatW, scaleW);
            lines.push(`Loại: InstancedMesh — instance #${id} / ${obj.count}`);
            if (obj.instanceColor) { const cc = new THREE.Color(); obj.getColorAt(id, cc); lines.push(`Màu instance: #${cc.getHexString()}`); }
            pickTarget = { obj, isInstanced: true, instanceId: id, origInstMat: instMat.clone(), origWorld: posW.clone() };
          } else {
            obj.updateWorldMatrix(true, false);
            obj.matrixWorld.decompose(posW, quatW, scaleW);
            lines.push(`Loại: ${obj.type}`);
            pickTarget = { obj, isInstanced: false, origLocal: obj.position.clone(), origWorld: posW.clone() };
          }
          const eulerW = new THREE.Euler().setFromQuaternion(quatW);
          let p = obj, groupName = null; while (p) { if (p.name) { groupName = p.name; break; } p = p.parent; }
          lines.push(`Nhóm: ${groupName || '(chưa đặt tên)'}`);
          if (obj.geometry && obj.geometry.parameters) lines.push(`Hình học: ${obj.geometry.type} ${JSON.stringify(obj.geometry.parameters)}`);
          if (obj.material && obj.material.color) lines.push(`Màu vật liệu: #${obj.material.color.getHexString()}`);
          lines.push(`Vị trí (World): x=${fmtN(posW.x)}  y=${fmtN(posW.y)}  z=${fmtN(posW.z)}`);
          lines.push(`Vị trí (Ghim): X=${fmtN(posW.x - X0)}  Y=${fmtN(posW.y)}  Z=${fmtN(posW.z - Z0)}`);
          lines.push(`Xoay (rad): x=${fmtN(eulerW.x)}  y=${fmtN(eulerW.y)}  z=${fmtN(eulerW.z)}`);
          lines.push(`Scale: x=${fmtN(scaleW.x)}  y=${fmtN(scaleW.y)}  z=${fmtN(scaleW.z)}`);
          const box = pickBoxOf(L), sz = box.getSize(new THREE.Vector3()); lines.push(`Kích thước: ${fmtN(sz.x)} × ${fmtN(sz.y)} × ${fmtN(sz.z)} (rộng × cao × sâu)`);
          if (!obj.isMesh && obj.children.length) lines.push(`Gồm: ${obj.children.length} phần`);
          lines.push(`Cấp chọn: ${['cả vật', 'phần', 'mảnh', 'bản sao'][Math.min(3, lvl + (lvl && isInst && nLvl - 1 === lvl ? 3 - lvl : 0))]} (${lvl + 1}/${nLvl})` + (nTop > 1 ? ` · vật ${ti + 1}/${nTop} dọc tia` : ''));
          lines.push('Bấm lại đúng chỗ: cấp nhỏ hơn · Alt + bấm: vật phía sau · F / bấm đúp / Tới: camera tới vật · Esc: bỏ chọn');
          PK.sel = { o: obj, inst: isInst ? L.inst : null };
          pickTitle.textContent = groupName || obj.type;
          pickBody.textContent = lines.join('\n');
          pickPanel.style.display = 'block';
          pickEditRow.style.display = 'block';
          pickXIn.value = fmtN(posW.x - X0); pickYIn.value = fmtN(posW.y); pickZIn.value = fmtN(posW.z - Z0);
          pickBox.box.copy(box); pickBox.visible = true; pickHovBox.visible = false; pickHov.style.display = 'none';
        }
        // ---- sửa X/Y/Z (toạ độ Ghim) trực tiếp trên ô nhập → object di chuyển ngay để xem trước, không cần tải lại trang ----
        function applyPickPosition() {
          if (!pickTarget) return;
          const rx = parseFloat(pickXIn.value), y = parseFloat(pickYIn.value), rz = parseFloat(pickZIn.value);
          if (!isFinite(rx) || !isFinite(y) || !isFinite(rz)) return;
          const x = rx + X0, z = rz + Z0;
          const worldTarget = new THREE.Vector3(x, y, z), obj = pickTarget.obj;
          if (pickTarget.isInstanced) {
            const localPos = worldTarget.clone().applyMatrix4(new THREE.Matrix4().copy(obj.matrixWorld).invert());
            const q = new THREE.Quaternion(), s = new THREE.Vector3(); pickTarget.origInstMat.decompose(new THREE.Vector3(), q, s);
            obj.setMatrixAt(pickTarget.instanceId, new THREE.Matrix4().compose(localPos, q, s)); obj.instanceMatrix.needsUpdate = true;
          } else {
            obj.position.copy(obj.parent ? obj.parent.worldToLocal(worldTarget.clone()) : worldTarget); obj.updateMatrixWorld(true);
          }
          pickBox.box.copy(worldBoxOf(obj, pickTarget.isInstanced ? pickTarget.instanceId : null));
          refreshFlightNavigation();
          pickBody.textContent = pickBody.textContent
            .replace(/Vị trí \(World\):.*/, `Vị trí (World): x=${fmtN(x)}  y=${fmtN(y)}  z=${fmtN(z)}`)
            .replace(/Vị trí \(Ghim\):.*/, `Vị trí (Ghim): X=${fmtN(rx)}  Y=${fmtN(y)}  Z=${fmtN(rz)}`);
        }
        [pickXIn, pickYIn, pickZIn].forEach(el => listen(el, 'input', applyPickPosition));
        const pickResetBtn = document.getElementById('pickReset');
        if (pickResetBtn) listen(pickResetBtn, 'click', () => {
          if (!pickTarget) return;
          const obj = pickTarget.obj;
          if (pickTarget.isInstanced) { obj.setMatrixAt(pickTarget.instanceId, pickTarget.origInstMat); obj.instanceMatrix.needsUpdate = true; }
          else obj.position.copy(pickTarget.origLocal);
          pickXIn.value = fmtN(pickTarget.origWorld.x - X0); pickYIn.value = fmtN(pickTarget.origWorld.y); pickZIn.value = fmtN(pickTarget.origWorld.z - Z0);
          pickBody.textContent = pickBody.textContent
            .replace(/Vị trí \(World\):.*/, `Vị trí (World): x=${fmtN(pickTarget.origWorld.x)}  y=${fmtN(pickTarget.origWorld.y)}  z=${fmtN(pickTarget.origWorld.z)}`)
            .replace(/Vị trí \(Ghim\):.*/, `Vị trí (Ghim): X=${fmtN(pickTarget.origWorld.x - X0)}  Y=${fmtN(pickTarget.origWorld.y)}  Z=${fmtN(pickTarget.origWorld.z - Z0)}`);
          pickBox.box.copy(worldBoxOf(obj, pickTarget.isInstanced ? pickTarget.instanceId : null));
          refreshFlightNavigation();
        });
        function doPick(clientX, clientY, alt) {
          const hits = pickHits(clientX, clientY), now = performance.now();
          if (!hits.length) { clearPickHighlight(); return; }
          const same = PK.top && Math.hypot(clientX - PK.x, clientY - PK.y) < 8 && now - PK.t < 2500, dbl = same && now - PK.upT < 320 && !alt;
          const tops = []; for (const h of hits) { const L = pickLevels(h); if (!tops.some(x => x.L[0].o === L[0].o)) tops.push({ h, L }); }   // mỗi vật 1 lần (nhiều mảnh cùng vật dọc tia)
          if (dbl) { PK.ti = PK.pv.ti; PK.lvl = PK.pv.lvl; }   // bấm đúp: trả lại cấp trước lần bấm thứ nhất của cặp rồi đưa camera tới vật đó
          else { PK.pv = same ? { ti: PK.ti, lvl: PK.lvl } : { ti: 0, lvl: 0 }; if (same && alt) { PK.ti = (PK.ti + 1) % tops.length; PK.lvl = 0; } else if (same) PK.lvl++; else { PK.ti = 0; PK.lvl = 0; } }
          PK.upT = dbl ? 0 : now;
          const T = tops[Math.min(PK.ti, tops.length - 1)]; PK.lvl %= T.L.length; PK.x = clientX; PK.y = clientY; PK.t = now; PK.top = T.L[0].o;
          showPickInfo(T.h, T.L[PK.lvl], PK.lvl, T.L.length, PK.ti, tops.length); if (dbl) pickFrame();
        }
        listen(dom, 'pointerdown', e => { if (e.button !== 0) return; pickDownX = e.clientX; pickDownY = e.clientY; });
        listen(dom, 'pointerup', e => { if (e.button !== 0 || !pickMode) return; if (Math.hypot(e.clientX - pickDownX, e.clientY - pickDownY) > 6) return; doPick(e.clientX, e.clientY, e.altKey); });
        { const f = document.getElementById('pickFocus'); if (f) listen(f, 'click', pickFrame); }
        if (bP) listen(bP, 'click', () => { pickMode = !pickMode; bP.classList.toggle('active', pickMode); dom.style.cursor = pickMode ? 'crosshair' : ''; if (!pickMode) { clearPickHighlight(); clearTimeout(PK.hovH); pickHovBox.visible = false; pickHov.style.display = 'none'; } });

