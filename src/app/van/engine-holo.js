        // ===== HÌNH ĐỘNG CƠ NỔI TRÊN ĐẦU KỸ SƯ (G 22/10 "khi kỹ sư đang sửa máy xe van thì trên đầu kỹ sư hiện ra 3D của engine, to gấp 3 lần, sau đó engine tự
        //  breakdown thành những species (bộ phận), engineer analyze") =====
        //  Bản sao động cơ (mẫu GLB "Nelson Racing Engine B") × 3 cỡ thật trong khoang, nổi trên đầu, hơi về phía xe, màu đỉnh + ánh xanh hologram. Mẫu là 1 lưới
        //  quét liền khối ⇒ tách theo VÙNG của V6 60° tăng áp kép (toạ độ mẫu: m, Y lên, đầu máy +Z, gốc giữa đáy cacte; nắp xupap x ±0,15 y 0,52 — van/engine-run.js):
        //  đầu máy (2 turbo + puli, dây curoa) z > 0,22 · cacte y < 0,14 · cổ góp xả 2 bên |x| > 0,3 · cổ hút y > 0,56 |x| < 0,12 · nắp máy 2 bên y > 0,38 · còn lại
        //  là thân máy; mỗi khối 1 nhóm dùng chung bộ đỉnh (chỉ khác chỉ mục). Thêm cơ cấu trong dựng bằng code theo số đo ENG_V: trục khuỷu + bánh đà + puli ·
        //  6 piston + tay biên (giữa hành trình) · 2 trục cam · 12 xupap.
        //  G 24/10 "remove the hologram lightning only show the hologram engine parts, then when engineer check each part it will break into small parts branches":
        //  bỏ tia chiếu nón từ bảng ghi chép, bỏ đường trục lắp ráp toả ra từ tâm, bỏ nhấp nháy (sáng / phồng theo nhịp) ⇒ chỉ còn các bộ phận. Mỗi bộ phận chia
        //  CHI TIẾT CON (SUB: vùng nhỏ của lưới quét theo hình dạng thật — xem ảnh vùng tô màu 24/10; cơ cấu trong theo từng chi tiết dựng): tới lượt soi, bộ phận sáng
        //  lên → các chi tiết con TOẢ RA như cành từ tâm bộ phận (mỗi chi tiết theo hướng tâm nó so với tâm bộ phận; cành = nét mảnh tĩnh từ tâm bộ phận tới tâm
        //  chi tiết, không cộng sáng; nhãn nhỏ ở đầu cành, nhãn bộ phận cha ẩn lúc tách) → kỹ sư soi lần lượt từng chi tiết
        //  (sáng trắng, nhãn rõ, nhìn + giơ tay chỉ) → thu về → bộ phận kế. Bộ phận khác mờ đi khi đang tách chi tiết.
        //  Diễn (engineer/tasks/engine-check.js pha 'holo'): hiện dần + quay bàn xoay 3 s → TÁCH RỜI (exploded view) 3 s → mỗi bộ phận T_HI + T_SIN + n × T_SUB + T_SOUT
        //  → lắp lại 3 s → tắt dần (cả lượt ~80 s).
        //  G 24/10 (2) "tăng độ visible của Engine parts lên 50%; và tô màu; nghiên cứu sao cho label ko đè lên hologram": độ đục + phát sáng ×1,5 (bộ phận thường đục
        //  hẳn); TÔ MÀU theo hệ (không có chuẩn chung — chọn theo nhiệt, dễ đọc): khí xả nóng đỏ cam, khí nạp xanh dương, dầu vàng hổ phách, đánh lửa + điện tím,
        //  nắp dàn cò / trục cam vàng đồng, chi tiết quay màu thép, thân máy xám xanh; chi tiết đang soi sáng hơn (pha trắng 35%). NHÃN NGOÀI (external labels —
        //  Ali, Hartmann & Strothotte 2005 'Label layout for interactive 3D illustrations'; khung nhãn ở chỗ trống không che vật — Stein & Décoret): nhãn ra khỏi
        //  hình, xếp 2 cột trái / phải ngoài hộp bao hình trên màn hình, cỡ cố định theo điểm ảnh, đường dẫn mảnh từ tâm chi tiết tới mép nhãn; mỗi cột xếp theo
        //  độ cao điểm neo (đường dẫn không cắt nhau), giãn cách tối thiểu, giữ cột cũ + trượt êm giữa các khung (không nhảy) ----
        const engHolo = (() => {
          const H = { g: null, parts: [], t: 0, on: false, cur: -1, sub: -1, base: new THREE.Vector3(), yaw: 0, done: false, tl: [], span: 0 };
          const CYAN = new THREE.Color(0x46c8ff), WHITE = new THREE.Color(0xffffff), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _box = new THREE.Box3(), _tb = new THREE.Box3();
          const C_EXH = 0xff6a33, C_EXH2 = 0xff9a3c, C_EXH3 = 0xe8452a, C_AIR = 0x3f8cff, C_AIR2 = 0x7cbcff, C_OIL = 0xffbe2e, C_OIL2 = 0xd9962a, C_IGN = 0xb27cff, C_VALVE = 0xe6c34a, C_STEEL = 0xc3ccd6, C_STEEL2 = 0x8e9aa8, C_BLOCK = 0x8fa6b8, C_BLOCK2 = 0xa9bccb, C_COOL = 0x2ec4a8;   // màu theo hệ (ghi chú đầu tệp)
          const LAB_H = 34, SUBLAB_H = 28, LAB_GAP = 6, LAB_MARGIN = 26;   // nhãn ngoài: cao (px CSS), giãn cách, cách mép hình
          const T_IN = 3, T_EX = 3, T_HI = 0.9, T_SIN = 0.7, T_SUB = 0.95, T_SOUT = 0.6, T_BACK = 3, T_OUT = 1.2, SUB_D = 0.28;
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const back = x => { x = Math.max(0, Math.min(1, x)); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };   // vọt nhẹ rồi về (bay ra có đà)
          function label(text, small) {   // nhãn tên: chữ trắng trên nền xanh đậm mờ, viền xanh hologram · small: nhãn chi tiết con (nhỏ, viền mảnh)
            const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
            x.fillStyle = 'rgba(8,30,48,0.82)'; x.strokeStyle = 'rgba(120,220,255,0.95)'; x.lineWidth = small ? 3 : 4; x.beginPath(); x.roundRect(4, 4, 504, 88, 18); x.fill(); x.stroke();
            x.font = '600 ' + (small ? 38 : 44) + 'px Outfit, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#eaf8ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 50, 488);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); s.renderOrder = small ? 13 : 12; s.scale.set(small ? 0.42 : 0.64, small ? 0.08 : 0.12, 1); return s;   // G 22/10: nhãn bộ phận nhỏ lại 20% (0,8 × 0,15 → 0,64 × 0,12)
          }
          function holoMat(col, o = {}) { const m = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, color: col, emissive: col, emissiveIntensity: 0.22, ...o }); m.userData.base = new THREE.Color(col); return m; }
          // chi tiết con của từng vùng vỏ máy: [tên, điều kiện theo tâm tam giác (hệ mẫu)] — điều kiện đầu tiên đúng thì vào chi tiết đó (tô màu kiểm 24/10: ảnh shots/eng-*.png)
          const HEAD = [['Bô-bin đánh lửa', c => c.y > 0.56, C_IGN], ['Nắp dàn cò', c => Math.abs(c.x) > 0.17, C_VALVE], ['Cổ hút nhánh + bu-lông', () => true, C_AIR2]];
          const MANI = [['Ống xả lên turbo', c => c.z > 0.02, C_EXH3], ['Ống góp nhánh xi-lanh', c => c.z > -0.17, C_EXH], ['Đuôi cổ góp xả', () => true, C_EXH2]];
          const SUB = {
            front: [['Vỏ máy nén turbo trái', c => c.x < -0.22 && c.y > 0.45, C_AIR], ['Vỏ tua-bin + van xả trái', c => c.x < -0.22, C_EXH], ['Vỏ máy nén turbo phải', c => c.x > 0.22 && c.y > 0.45, C_AIR],
              ['Vỏ tua-bin + van xả phải', c => c.x > 0.22, C_EXH], ['Puli trục khuỷu + máy nén lạnh', c => c.y < 0.3, C_STEEL], ['Máy phát + bơm nước + puli căng', c => c.y < 0.45, C_COOL], ['Ống gió nạp từ turbo', () => true, C_AIR2]],
            turboL: MANI, turboR: MANI, headL: HEAD, headR: HEAD,
            pan: [['Đáy cacte (chứa dầu)', c => c.y < 0.07, C_OIL], ['Mép cacte + gioăng', () => true, C_OIL2]],
            intake: [['Ống chữ Y + bướm ga', c => c.z > 0.05, C_AIR], ['Hộp góp hút (plenum)', c => c.z > -0.15, C_AIR2], ['Cảm biến + dây', () => true, C_IGN]],
            block: [['Hộp trục khuỷu (nửa dưới)', c => c.y < 0.25, C_BLOCK], ['Khối xi-lanh trái', c => c.x < -0.04, C_BLOCK2], ['Khối xi-lanh phải', c => c.x > 0.04, C_BLOCK2], ['Lòng chữ V + dây điện', () => true, C_IGN]] };
          function addSub(p, name, sg, mats, ctr) { p.g.add(sg); const lab = label(name, true); H.labG.add(lab); p.subs.push({ name, g: sg, mats, ctr, dir: null, lab }); }
          function finish(p) {   // tâm bộ phận = trung bình tâm chi tiết con · hướng toả của mỗi chi tiết = từ tâm bộ phận tới tâm nó (+ chếch lên), chi tiết nằm sát tâm thì toả đều quanh trục đứng
            p.ctr = p.subs.reduce((s, q) => s.add(q.ctr), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, p.subs.length));
            p.subs.forEach((q, j) => { const d = q.ctr.clone().sub(p.ctr); if (d.length() < 0.03) { const a = j / p.subs.length * Math.PI * 2; d.set(Math.cos(a), 0, Math.sin(a)); } d.normalize(); d.y += 0.35; q.dir = d.normalize(); });
            p.mats = p.subs.flatMap(q => q.mats); p.lab = label(p.name, false);
            p.br = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(p.subs.length * 6), 3)), new THREE.LineBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0, depthWrite: false }));
            p.br.frustumCulled = false; p.g.add(p.br);   // cành: tâm bộ phận → tâm từng chi tiết con
          }
          function build() {
            const src = vanGlb.engineSrc; let mesh = null; src.traverse(o => { if (o.isMesh && !mesh && o.geometry.attributes.position.count > 1000) mesh = o; }); if (!mesh) return false;
            const G = mesh.geometry, P = G.attributes.position, I = G.index, M = new THREE.Matrix4().copy(src.matrixWorld).invert().multiply(mesh.matrixWorld);   // lưới → hệ mẫu
            const g = new THREE.Group(); g.name = 'Hình động cơ nổi (hologram)'; g.visible = false; g.userData.noBatch = g.userData.noBake = true; scene.add(g);
            H.labG = new THREE.Group(); H.labG.name = 'Nhãn ngoài hình động cơ nổi'; H.labG.visible = false; H.labG.userData.noBatch = H.labG.userData.noBake = true; scene.add(H.labG);   // nhãn + đường dẫn (toạ độ thế giới, đặt mỗi khung)
            H.lead = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(64 * 6), 3)), new THREE.LineBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }));
            H.lead.renderOrder = 11; H.lead.frustumCulled = false; H.labG.add(H.lead);
            // ---- vỏ máy: phân tam giác theo vùng rồi theo chi tiết con (tâm tam giác trong hệ mẫu) ----
            const DEF = [   // khoá · nhãn · hướng tách (m, hệ mẫu)
              ['front', 'Đầu máy: 2 turbo + puli', [0, 0.04, 0.42]], ['pan', 'Cacte dầu', [0, -0.26, 0]], ['turboL', 'Cổ góp xả trái', [-0.42, 0.06, 0]], ['turboR', 'Cổ góp xả phải', [0.42, 0.06, 0]],
              ['intake', 'Cổ hút + bướm ga', [0, 0.46, 0]], ['headL', 'Nắp máy trái', [-0.2, 0.3, 0]], ['headR', 'Nắp máy phải', [0.2, 0.3, 0]], ['block', 'Thân máy (block)', [0, 0, 0]]];
            const sets = Object.fromEntries(DEF.map(d => [d[0], SUB[d[0]].map(() => [])])), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
            for (let t = 0; t < I.count; t += 3) {
              a.fromBufferAttribute(P, I.getX(t)).applyMatrix4(M); b.fromBufferAttribute(P, I.getX(t + 1)).applyMatrix4(M); c.fromBufferAttribute(P, I.getX(t + 2)).applyMatrix4(M); a.add(b).add(c).multiplyScalar(1 / 3);
              const k = a.z > 0.22 ? 'front' : a.y < 0.14 ? 'pan' : Math.abs(a.x) > 0.3 ? (a.x < 0 ? 'turboL' : 'turboR') : a.y > 0.56 && Math.abs(a.x) < 0.12 ? 'intake' : a.y > 0.38 && Math.abs(a.x) > 0.06 ? (a.x < 0 ? 'headL' : 'headR') : 'block';
              sets[k][SUB[k].findIndex(([, f]) => f(a))].push(I.getX(t), I.getX(t + 1), I.getX(t + 2));
            }
            for (const [k, name, off] of DEF) {
              const p = { k, name, g: new THREE.Group(), subs: [], off: new THREE.Vector3(...off) }; g.add(p.g);
              SUB[k].forEach(([sn, , col], j) => { if (!sets[k][j].length) return;
                const geo = new THREE.BufferGeometry(); for (const n in G.attributes) geo.setAttribute(n, G.attributes[n]); geo.setIndex(sets[k][j]); geo.computeBoundingSphere();   // dùng chung bộ đỉnh
                const sg = new THREE.Group(), m = new THREE.Mesh(geo, holoMat(col, { vertexColors: true })); m.matrixAutoUpdate = false; m.matrix.copy(M); sg.add(m);
                addSub(p, sn, sg, [m.material], geo.boundingSphere.center.clone().applyMatrix4(M)); });
              if (p.subs.length) { finish(p); H.parts.push(p); } else g.remove(p.g);
            }
            // ---- cơ cấu trong (số đo ENG_V — van/engine-run.js): mỗi chi tiết dựng là 1 chi tiết con ----
            const V = ENG_V, mk = (k, name, off, build) => { const p = { k, name, g: new THREE.Group(), subs: [], off: new THREE.Vector3(...off) }; g.add(p.g);
              build((sn, fill) => { const sg = new THREE.Group(), mats = []; fill(sg, col => { const m = holoMat(col); mats.push(m); return m; }); addSub(p, sn, sg, mats, new THREE.Box3().setFromObject(sg).getCenter(new THREE.Vector3())); });
              finish(p); H.parts.push(p); };
            const cyl = (r0, r1, h, n, m) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, n), m);
            mk('crank', 'Trục khuỷu + bánh đà', [0, -0.13, 0], sub => {
              sub('Trục chính + cổ trục', (sg, L) => { const s = cyl(0.028, 0.028, 0.56, 14, L(C_STEEL)); s.rotation.x = Math.PI / 2; s.position.set(0, V.yc, -0.06); sg.add(s); });
              sub('Chốt khuỷu ×6', (sg, L) => { const mc = L(0xd9a066); for (const [b0, z] of V.cyl) { const ps = cyl(0.022, 0.022, 0.034, 12, mc), a0 = (b0 - 120 * V.cyl.findIndex(q => q[1] === z)) * Math.PI / 180; ps.rotation.x = Math.PI / 2; ps.position.set(V.r * Math.sin(a0), V.yc + V.r * Math.cos(a0), z); sg.add(ps); } });
              sub('Bánh đà', (sg, L) => { const d = cyl(0.13, 0.13, 0.024, 28, L(C_STEEL2)); d.rotation.x = Math.PI / 2; d.position.set(0, V.yc, -0.33); sg.add(d); });
              sub('Puli giảm chấn đầu trục', (sg, L) => { const d = cyl(0.075, 0.075, 0.024, 28, L(C_COOL)); d.rotation.x = Math.PI / 2; d.position.set(0, V.yc, 0.2); sg.add(d); }); });
            mk('pistons', 'Piston + tay biên ×6', [0, 0.22, 0], sub => V.cyl.forEach(([b0, z], i) => sub('Piston + tay biên ' + (i + 1), (sg, L) => {
              const u = new THREE.Vector3(Math.sin(b0 * Math.PI / 180), Math.cos(b0 * Math.PI / 180), 0), s = V.l + 0.01;
              const pis = cyl(V.bore, V.bore, 0.055, 18, L(0xe4eaef)); pis.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), u); pis.position.set(0, V.yc, z).addScaledVector(u, s + V.hc); sg.add(pis);
              const rod = new THREE.Mesh(new THREE.BoxGeometry(0.022, V.l, 0.016), L(0x6f9fd8)); rod.quaternion.copy(pis.quaternion); rod.position.set(0, V.yc, z).addScaledVector(u, s * 0.5); sg.add(rod); })));
            mk('cams', 'Trục cam + xupap', [0, 0.62, 0], sub => { for (const b0 of [-30, 30]) { const a0 = b0 * Math.PI / 180, d = V.r + V.l + V.hc + 0.16, side = b0 < 0 ? 'trái' : 'phải', u = new THREE.Vector3(Math.sin(a0), Math.cos(a0), 0);
              sub('Trục cam ' + side, (sg, L) => { const sh = cyl(0.012, 0.012, 0.36, 8, L(C_VALVE)); sh.rotation.x = Math.PI / 2; sh.position.set(Math.sin(a0) * d, V.yc + Math.cos(a0) * d, -0.09); sg.add(sh); });
              sub('Xupap hàng ' + side + ' ×6', (sg, L) => { const mv = L(0xf2dd8a); for (const [b1, z] of V.cyl) if (Math.sign(b1) === Math.sign(b0)) for (const dz of [-0.016, 0.016]) {
                const v = cyl(0.008, 0.008, 0.09, 6, mv); v.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), u); v.position.set(0, V.yc, z + dz).addScaledVector(u, V.r + V.l + V.hc + 0.09); sg.add(v); } }); } });
            for (const p of H.parts) H.labG.add(p.lab);
            H.g = g; H.order = ['turboL', 'headL', 'intake', 'cams', 'headR', 'turboR', 'front', 'pistons', 'crank', 'block', 'pan'].map(k => H.parts.findIndex(p => p.k === k)).filter(i => i >= 0);
            let t0 = 0; H.tl = H.order.map(i => { const d = T_HI + T_SIN + H.parts[i].subs.length * T_SUB + T_SOUT, x = { i, t0, t1: t0 + d }; t0 += d; return x; }); H.span = t0;   // lịch soi: mỗi bộ phận dài theo số chi tiết con
            return true;
          }
          const dur = () => T_IN + T_EX + H.span + T_BACK + T_OUT;
          // ---- NHÃN NGOÀI: 2 cột ngoài hộp bao hình trên màn hình, đường dẫn từ tâm chi tiết, xếp theo độ cao điểm neo, trượt êm ----
          const toPx = (v, out) => { const n = _c.copy(v).project(camera); out.x = (n.x + 1) / 2 * W(); out.y = (1 - n.y) / 2 * Hv(); out.z = n.z; return out; };
          const toW = (x, y, z, out) => out.set(x / W() * 2 - 1, 1 - y / Hv() * 2, z).unproject(camera);
          function layout(dt, P, ks) {
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), act = [];
            for (const p of H.parts) { if (p.lab.userData.op > 0.01) act.push({ lab: p.lab, anc: p.g.localToWorld(new THREE.Vector3().copy(p.ctr)), h: LAB_H });
              for (const q of p.subs) if (q.lab.userData.op > 0.01) act.push({ lab: q.lab, anc: p.g.localToWorld(new THREE.Vector3().copy(q.ctr).addScaledVector(q.dir, SUB_D * ks)), h: SUBLAB_H }); }
            for (const p of H.parts) for (const l of [p.lab, ...p.subs.map(q => q.lab)]) if (!act.some(a => a.lab === l)) { l.material.opacity = 0; l.visible = false; }
            const LP = H.lead.geometry.attributes.position; let nl = 0;
            if (act.length) {
              _box.makeEmpty(); H.g.traverse(o => { if (o.isMesh && o.material.opacity > 0.05) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); _box.union(_tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); } });   // hộp bao phần đang hiện
              let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, zc = 0; const pt = { x: 0, y: 0, z: 0 };
              for (let i = 0; i < 8; i++) { toPx(_b.set(i & 1 ? _box.max.x : _box.min.x, i & 2 ? _box.max.y : _box.min.y, i & 4 ? _box.max.z : _box.min.z), pt); x0 = Math.min(x0, pt.x); x1 = Math.max(x1, pt.x); y0 = Math.min(y0, pt.y); y1 = Math.max(y1, pt.y); zc += pt.z / 8; }
              const cx = (x0 + x1) / 2, cols = { L: [], R: [] };
              for (const a of act) { toPx(a.anc, a.px = {}); const U = a.lab.userData; let side = U.side || (a.px.x < cx ? 'L' : 'R'); if (side === 'L' && a.px.x > cx + 40) side = 'R'; else if (side === 'R' && a.px.x < cx - 40) side = 'L'; U.side = side; cols[side].push(a); }   // giữ cột cũ (không nhảy qua lại)
              for (const [A, B, sB] of [['L', 'R', 'R'], ['R', 'L', 'L']]) while (cols[A].length - cols[B].length > 2) {   // cân 2 cột: chuyển nhãn có neo gần giữa nhất sang cột ít hơn
                let bi = 0; cols[A].forEach((a, i) => { if (Math.abs(a.px.x - cx) < Math.abs(cols[A][bi].px.x - cx)) bi = i; }); const a = cols[A].splice(bi, 1)[0]; a.lab.userData.side = sB; cols[B].push(a); }
              for (const sd of ['L', 'R']) { const C = cols[sd].sort((a, b) => a.px.y - b.px.y); let y = -1e9;
                for (const a of C) { a.y = Math.max(a.px.y, y + a.h / 2 + LAB_GAP); y = a.y + a.h / 2; }   // xếp xuống theo độ cao neo, không chồng
                const over = y - Math.min(Hv() - 8, y1 + 80); if (over > 0) for (const a of C) a.y -= over;   // tràn đáy: dồn cả cột lên
                for (const a of C) { const w = a.h * 512 / 96, U = a.lab.userData, tx = sd === 'L' ? Math.max(w / 2 + 8, x0 - LAB_MARGIN - w / 2) : Math.min(W() - w / 2 - 8, x1 + LAB_MARGIN + w / 2), ty = Math.max(a.h / 2 + 8, a.y);
                  const k = U.sx === undefined || U.op0 < 0.02 ? 1 : 1 - Math.exp(-dt * 10); U.sx = (U.sx ?? tx) + (tx - (U.sx ?? tx)) * k; U.sy = (U.sy ?? ty) + (ty - (U.sy ?? ty)) * k; U.op0 = U.op;   // trượt êm
                  toW(U.sx, U.sy, zc, a.lab.position); a.lab.scale.set(w * upp, a.h * upp, 1); a.lab.material.opacity = U.op; a.lab.visible = true;
                  if (nl < 64) { const ex = sd === 'L' ? U.sx + w / 2 : U.sx - w / 2; toW(ex, U.sy, zc, _b); LP.setXYZ(nl * 2, a.anc.x, a.anc.y, a.anc.z); LP.setXYZ(nl * 2 + 1, _b.x, _b.y, _b.z); nl++; } } }
            }
            for (let i = nl * 2; i < 128; i++) LP.setXYZ(i, 0, -1e4, 0);   // đường dẫn thừa: giấu dưới đất
            LP.needsUpdate = true; H.lead.geometry.setDrawRange(0, nl * 2); H.lead.material.opacity = 0.7 * Math.min(1, act.reduce((m, a) => Math.max(m, a.lab.userData.op), 0));
          }
          function start(e) {   // gọi 1 lần khi vào pha 'holo': đặt hình trên đầu, hơi về phía xe; trục dài của máy nằm ngang tầm nhìn
            if (!H.g && !build()) return false;
            const S = caravanObj.scale.x * ENG_AT.s * 3, hd = e.head.getWorldPosition(_a), y = e.g.rotation.y;
            H.yaw = y + Math.PI / 2; H.base.set(hd.x + Math.sin(y) * 0.2, hd.y + 1.55, hd.z + Math.cos(y) * 0.2);   // trên hẳn bong bóng suy nghĩ (24/10: 0,75 → 1,55 — bong bóng không đè đáy hình)
            H.g.scale.setScalar(S); H.g.position.copy(H.base); H.g.rotation.set(0, H.yaw, 0); H.t = 0; H.on = true; H.done = false; H.cur = H.sub = -1; H.g.visible = H.labG.visible = true;
            return true;
          }
          function stop() { H.on = false; if (H.g) H.g.visible = H.labG.visible = false; }
          function tick(e, dt, t) {   // → { look: điểm nhìn, point: điểm chỉ tay | null, part, idx, sub: chi tiết con đang soi | null, sidx } ; H.done khi diễn xong
            if (!H.on) return null; H.t += dt; const u = H.t, D = dur();
            const tEx = T_IN, tAn = T_IN + T_EX, tBk = tAn + H.span, tOut = tBk + T_BACK;
            const fade = u < tEx ? ease(u / 1.2) : u > tOut ? 1 - ease((u - tOut) / T_OUT) : 1, xk = u < tEx ? 0 : u < tAn ? back((u - tEx) / T_EX) : u < tBk ? 1 : 1 - ease((u - tBk) / T_BACK);
            const E = u >= tAn && u < tBk ? H.tl.find(x => u - tAn >= x.t0 && u - tAn < x.t1) : null, cur = E ? E.i : -1, lu = E ? u - tAn - E.t0 : 0, dP = E ? E.t1 - E.t0 : 0, P = cur >= 0 ? H.parts[cur] : null;
            const ks = P ? ease((lu - T_HI) / T_SIN) * (1 - ease((lu - (dP - T_SOUT)) / T_SOUT)) : 0;   // chi tiết con toả ra → thu về
            const si = P && lu >= T_HI + T_SIN && lu < dP - T_SOUT ? Math.min(P.subs.length - 1, Math.floor((lu - T_HI - T_SIN) / T_SUB)) : -1;
            H.cur = cur; H.sub = si;
            // bàn xoay: quay chậm lúc hiện, rồi dừng ở góc ¾ cho dễ nhìn lúc tách
            const spin = u < tEx ? 1.1 * (1 - u / tEx) * u : 1.1 * tEx / 2; H.g.rotation.y = H.yaw - 0.5 + spin + 0.04 * Math.sin(t * 0.6);
            H.g.position.copy(H.base).setY(H.base.y + 0.04 * Math.sin(t * 1.3) + 0.25 * (1 - fade));   // lơ lửng nhấp nhô; hiện lên từ thấp
            for (const [i, p] of H.parts.entries()) {
              const hi = i === cur, dim = cur < 0 ? 1 : hi ? 1 : 0.5 - 0.25 * ks;   // bộ phận khác mờ đi, mờ hơn lúc đang tách chi tiết
              p.g.position.copy(p.off).multiplyScalar(xk); p.g.rotation.y = 0.15 * xk * Math.sign(p.off.x || p.off.z || 1) * (p.k === 'block' ? 0 : 1);
              p.subs.forEach((q, j) => { const on = hi && j === si;
                q.g.position.copy(q.dir).multiplyScalar(SUB_D * (hi ? ks : 0));
                for (const m of q.mats) { m.opacity = fade * Math.min(1, 1.5 * (hi ? 0.95 : 0.85 * dim)); m.emissiveIntensity = hi ? (on ? 0.6 : 0.34) : 0.22; m.color.copy(m.userData.base).lerp(WHITE, on ? 0.35 : 0); }   // ×1,5 rõ hơn (G 24/10), màu theo hệ, sáng đều không nhấp nháy
                q.lab.userData.op = fade * (hi ? ks * (on ? 1 : 0.55) : 0); q.lab.userData.on = on; });
              if (hi || p.br.material.opacity > 0) { const A = p.br.geometry.attributes.position; p.subs.forEach((q, j) => { A.setXYZ(j * 2, p.ctr.x, p.ctr.y, p.ctr.z); _b.copy(q.ctr).addScaledVector(q.dir, SUB_D * ks); A.setXYZ(j * 2 + 1, _b.x, _b.y, _b.z); }); A.needsUpdate = true; }
              p.br.material.opacity = fade * (hi ? 0.55 * ks : 0);
              p.lab.userData.op = fade * (hi ? 1 - ks : cur < 0 && xk > 0.95 && u < tAn + 1.6 ? 0.9 : 0);   // tách xong: hiện hết nhãn 1,6 s, rồi chỉ nhãn bộ phận đang soi (ẩn khi chi tiết con toả ra)
            }
            H.g.updateMatrixWorld(true); layout(dt, P, ks);
            if (u >= D) { stop(); H.done = true; }
            const Q = si >= 0 ? P.subs[si] : null;
            const look = Q ? P.g.localToWorld(_a.copy(Q.ctr).addScaledVector(Q.dir, SUB_D * ks)) : P ? H.g.localToWorld(_a.copy(P.ctr).add(_b.copy(P.off).multiplyScalar(xk))) : H.g.localToWorld(_a.set(0, 0.35, 0));
            return { look, point: Q ? look : null, part: P, idx: cur, sub: Q, sidx: si };
          }
          return { start, stop, tick, state: H, dur };
        })();
