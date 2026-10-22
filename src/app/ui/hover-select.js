        // ===== RÊ CHUỘT = CHỌN (G 18/10 "hover over the engine then white border line select … drone, remote, giỏ táo, tool, cần câu, laptop, kitchen, chiminea with same
        //  hover effect"): viền trắng 3 px quanh vật bấm / chọn được — tay nắm 2 cửa trước + logo Ford (van/van-doors.js), động cơ (van/transit-glb.js), drone, tay cầm,
        //  giỏ táo, sào hái, cần câu (dưới đất / trên tay), laptop, bếp, lò chiminea. Dò: tia chuột × hộp bao của từng vật trong hệ toạ độ của chính vật (rẻ, không duyệt
        //  tam giác; đo lại mỗi giây vì vật cử động / mẫu GLB nạp sau), lấy vật gần nhất; it.on() chặn khi không thấy (đồ trong xe: chỉ lúc xem xuyên · động cơ: xem xuyên
        //  hoặc ca-pô mở), it.n = hướng mặt ngoài (nút quay lưng camera — phía bên kia xe — thì bỏ). Viền: mỗi lưới của vật thêm 2 con dùng chung hình — mặt nạ stencil (chỗ
        //  vật đang hiện) + bản sao nở trên màn hình uPx điểm ảnh ra xa đoạn trục dọc vật (shader, đầu đoạn tính theo toạ độ thế giới) ⇒ viền đều cả với vật dài / phẳng;
        //  vẽ sau cùng, bỏ kiểm độ sâu, chỉ ngoài mặt nạ ⇒ vỏ xe / nan ga-lăng xung quanh không che. Mảnh gốc đã gộp lượt vẽ (lớp ẩn) vẫn có con ở lớp thường ⇒ viền vẫn
        //  hiện; ngoài viền trắng có quầng tối mờ 1,5 px cho nổi trên sơn kem. Bỏ lưới cộng sáng (lửa), vô hình, InstancedMesh. Bấm: hovClick (ui/xray-lifecycle.js) gọi it.click nếu vật có (tay nắm, logo); bảng việc của drone, giỏ,
        //  sào, động cơ vẫn do bảng dụng cụ mở ----
        const HOV = { items: [], hover: null, mx: null, my: 0, down: false, moved: true, res: new THREE.Vector2(1, 1) };
        const _hvM = new THREE.Matrix4(), _hvR = new THREE.Ray(), _hvP = new THREE.Vector3(), _hvV = new THREE.Vector3(), _hvQ = new THREE.Quaternion(), _hvN = new THREE.Vector2(), _hvB = new THREE.Box3(), _hvM2 = new THREE.Matrix4();
        // viền: kiểm độ sâu sau khi nhích về phía camera 6 cm ⇒ vẫn đè được mặt ngay sau / sát nút (nan ga-lăng quanh logo, da cửa quanh tay nắm) nhưng vật che thật ở trước
        //  (cỏ trước giỏ, ấm trước tay cầm, nét viền vỏ xe trước động cơ) che luôn viền — không thành vệt trắng hình vật che
        const HOV_VS = 'uniform vec3 uA, uB; uniform float uPx; uniform vec2 uRes; void main() { mat4 V = projectionMatrix * viewMatrix; vec4 m = modelViewMatrix * vec4(position, 1.0); m.z += 0.06;'
          + ' vec4 p = projectionMatrix * m, a = V * vec4(uA, 1.0), b = V * vec4(uB, 1.0);'
          + ' vec2 s = p.xy / p.w * uRes, sa = a.xy / a.w * uRes, ab = b.xy / b.w * uRes - sa, d = s - sa - ab * clamp(dot(s - sa, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);'
          + ' float l = length(d); if (l > 1e-6) p.xy += d / l * uPx * 2.0 / uRes * p.w; gl_Position = p; }';
        const HOV_MASK = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4,
          stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
        function hovAdd(root, o = {}) {   // o: on · n · click · skip(lưới) · pad (đv thế giới) · picks [{o, n, on}]: vùng rê chuột (mặc định chính vật) — vd cả cánh cửa ⇒ viền tay nắm
          const it = { root, pad: 0.02, ...o, fxs: [] }; it.rp = { o: root, n: it.n, box: new THREE.Box3(), bt: -1e9 };
          it.picks = o.picks ? o.picks.map(p => p.o && p.o !== root ? { ...p, box: new THREE.Box3(), bt: -1e9 } : Object.assign(it.rp, p, { o: root })) : [it.rp];
          HOV.items.push(it); return it; }
        const hovUse = (it, m) => { if (!m.isMesh || m.isInstancedMesh || m.userData.hovFx || (it.skip && it.skip(m))) return false; const M = [].concat(m.material)[0];
          return !!M && M.visible !== false && M.blending === THREE.NormalBlending && !(M.transparent && M.opacity < 0.05); };
        const hovShown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
        function hovBox(it, p = it.rp) {   // hộp bao trong hệ của vùng p.o (+ lề pad thế giới), đo lại tối đa 1 lần/giây
          const now = performance.now(); if (now - p.bt < 1000) return p.box; p.bt = now;
          const R = p.o, b = p.box.makeEmpty(); R.updateWorldMatrix(true, true); const inv = _hvM.copy(R.matrixWorld).invert();
          R.traverse(m => { if (!(R === it.root ? hovUse(it, m) : m.isMesh && !m.userData.hovFx)) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); b.union(_hvB.copy(g.boundingBox).applyMatrix4(_hvM2.multiplyMatrices(inv, m.matrixWorld))); });
          if (!b.isEmpty()) b.expandByScalar(it.pad / R.getWorldScale(_hvV).x);
          return b;
        }
        const hovFacing = p => { p.o.getWorldQuaternion(_hvQ); return _hvV.copy(p.n).applyQuaternion(_hvQ).dot(pickRay.ray.direction) < -0.1; };   // p.n: hướng mặt ngoài trong hệ của vùng
        function hovPick(x, y) {   // vật dưới con trỏ (toạ độ màn hình), hoặc null — nhiều hộp cùng trúng: vật NHỎ nhất (laptop trong hộp bao to của bếp), bằng thì gần nhất
          if (pickMode || !HOV.items.length) return null;
          const r = dom.getBoundingClientRect(); pickRay.setFromCamera(_hvN.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1), camera);
          let best = null, bd = Infinity, bdd = Infinity;
          for (const it of HOV.items) {
            if (!hovShown(it.root) || (it.on && !it.on())) continue;
            for (const p of it.picks) {
              if (p.on && !p.on()) continue; const box = hovBox(it, p); if (box.isEmpty()) continue;
              _hvR.copy(pickRay.ray).applyMatrix4(_hvM.copy(p.o.matrixWorld).invert());
              if (!_hvR.intersectBox(box, _hvP)) continue;
              const d = _hvP.applyMatrix4(p.o.matrixWorld).distanceTo(pickRay.ray.origin), sz = box.getSize(_hvV), v = sz.x * sz.y * sz.z * p.o.getWorldScale(_hvP).x ** 3;
              if ((v < bd * 0.999 || (v < bd * 1.001 && d < bdd)) && (!p.n || hovFacing(p))) { bd = v; bdd = d; best = it; }
            }
          }
          return best;
        }
        function hovFx(it) {   // thêm mặt nạ + viền cho lưới chưa có (mẫu GLB nạp sau vẫn được) → danh sách con viền của vật
          if (!it.mats) { it.uA = { value: new THREE.Vector3() }; it.uB = { value: new THREE.Vector3() };   // viền trắng 3 px + quầng tối mờ 1,5 px ngoài cùng (nổi trên sơn kem / nền sáng)
            it.mats = [[4.5, 0.07, 0.42], [3, 1, 1]].map(([px, c, a]) => new THREE.ShaderMaterial({ uniforms: { uA: it.uA, uB: it.uB, uPx: { value: px }, uRes: { value: HOV.res }, uC: { value: new THREE.Vector4(c, c, c, a) } },
              vertexShader: HOV_VS, fragmentShader: 'uniform vec4 uC; void main() { gl_FragColor = uC; }', transparent: true, depthWrite: false, side: THREE.DoubleSide, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc })); }
          it.fxs.length = 0; const noRay = () => {};
          it.root.traverse(m => { if (!hovUse(it, m)) return;
            if (!m.userData.hovC) m.userData.hovC = [[HOV_MASK, 1e6], [it.mats[0], 1e6 + 1], [it.mats[1], 1e6 + 2]].map(([M, ord]) => { const c = new THREE.Mesh(m.geometry, M); c.renderOrder = ord; c.visible = false; c.raycast = noRay;
              Object.assign(c.userData, { hovFx: true, pickSkip: true, noBatch: true, xray: 'ui' }); m.add(c); return c; });
            it.fxs.push(...m.userData.hovC); });
        }
        function hovSet(it) {
          if (it === HOV.hover) return; if (HOV.hover) for (const c of HOV.hover.fxs) c.visible = false;
          HOV.hover = it; if (it) { hovFx(it); for (const c of it.fxs) c.visible = true; }
        }
        function hovClick(e) {   // bấm (pointerup): vật dưới con trỏ có hành động riêng (tay nắm, logo) ⇒ làm, trả true để bỏ bấm xe / máy
          if (radio.tagClick(e)) return true;   // nhãn 📻 radio táp-lô (van/radio.js)
          const it = hovPick(e.clientX, e.clientY); if (!it || !it.click) return false;
          it.click(); return true;
        }
        listen(dom, 'pointermove', e => { HOV.mx = e.clientX; HOV.my = e.clientY; HOV.down = e.buttons !== 0; HOV.moved = true; });
        listen(dom, 'pointerdown', () => { HOV.down = true; HOV.moved = true; });
        listen(dom, 'pointerup', () => { HOV.down = false; HOV.moved = true; });
        listen(dom, 'pointerleave', () => { HOV.mx = null; HOV.moved = true; });
        listen(dom, 'wheel', () => { HOV.moved = true; }, { passive: true });
        function hovTick() {   // mỗi khung (loop/main-loop-rest.js, trước khi vẽ)
          if (HOV.moved) { HOV.moved = false; const it = HOV.mx === null || HOV.down ? null : hovPick(HOV.mx, HOV.my); hovSet(it);
            if (!HOV.down && (it ? dom.style.cursor !== 'pointer' : dom.style.cursor === 'pointer')) dom.style.cursor = it ? 'pointer' : ''; }   // chỉ trả con trỏ do mình đặt
          const it = HOV.hover; if (!it) return;
          renderer.getSize(HOV.res); for (const c of it.fxs) c.geometry = c.parent.geometry;   // vật đổi bản nhiều cạnh khi zoom gần (loop/close-up.js)
          const b = hovBox(it, it.rp), c = b.getCenter(_hvP), s = b.getSize(_hvV).toArray(), k = s.indexOf(Math.max(...s)), h = Math.max(0, s[k] - [...s].sort((x, y) => y - x)[1]) / 2;
          it.uA.value.copy(c).setComponent(k, c.getComponent(k) - h).applyMatrix4(it.root.matrixWorld); it.uB.value.copy(c).setComponent(k, c.getComponent(k) + h).applyMatrix4(it.root.matrixWorld);
        }
        // vật chọn được ngoài trời + trong xe (tay nắm, logo, động cơ đăng ký khi mẫu Transit nạp xong)
        for (const o of [droneToy.g, droneToy.rc, applePick.basket, applePick.pole, groundRod, engObj.rod, chiminea.g]) if (o) hovAdd(o);
        hovAdd(studyLaptop.group, { on: () => caravanXray });
        { const k = caravanObj.getObjectByName('Bếp dọc vách cửa hông'); if (k) hovAdd(k, { on: () => caravanXray }); }
        hovAdd(cowHut.roof, { pad: 0.05, picks: [{ o: cowHut.roofSheet }], click: () => cowHut.roofToggle() });   // mái chuồng bò: bấm ⇒ mờ 50% / đặc lại (animals/cows-hut.js); vùng rê = tấm tôn (hộp mỏng theo dốc mái)
