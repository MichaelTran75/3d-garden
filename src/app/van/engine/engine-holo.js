        // ===== HÌNH ĐỘNG CƠ NỔI TRÊN ĐẦU KỸ SƯ (G 22/10 "khi kỹ sư đang sửa máy xe van thì trên đầu kỹ sư hiện ra 3D của engine, to gấp 3 lần, sau đó engine tự
        //  breakdown thành những species (bộ phận), engineer analyze") =====
        //  G 24/10 khuya "research and study ford engine to improve: khi tách và tô màu hologram, các bộ phận part bị gãy hoặc mất, màu bị tô sai, các chi tiết nhỏ hơn
        //  bị vẽ thiếu": bản cũ cắt LƯỚI QUÉT liền khối (mẫu GLB "Nelson Racing Engine B", 36k tam giác) theo vùng toạ độ ⇒ mép cắt răng cưa, mảnh vụn bay lơ lửng,
        //  một chi tiết thật bị chia cho 2 vùng (tô 2 màu), chi tiết nhỏ mất khi giảm lưới. Nay DỰNG LẠI BẰNG CODE từng chi tiết rời (mỗi chi tiết con = 1 khối
        //  kín, 1 màu hệ, nét viền kỹ thuật) theo động cơ Ford 3.5L EcoBoost V6 thế hệ 2 (2017+) — máy xăng tăng áp kép Ford lắp cho Transit dẫn động cầu sau,
        //  cùng kiểu V6 60° 2 turbo với máy trong khoang (van/engine/engine-run.js):
        //  · V6 60° thân + nắp nhôm, xi-lanh 92,5 × 86,6 mm, nén 10,5 : 1; Ford đánh số hàng 1 (bên phải, x < 0) 1-2-3, hàng 2 (trái) 4-5-6, thứ tự nổ 1-4-2-5-3-6
        //    (= thứ tự k của ENG_V ⇒ khớp máy chạy); trục khuỷu rèn đủ đối trọng, nắp cổ trục chính 6 bu-lông.
        //  · DOHC 24 xupap: trục cam rỗng, cò mổ con lăn + con đội thuỷ lực, xupap nạp thân rỗng, xupap xả chứa natri; 4 bộ chỉnh cam VCT; XÍCH CAM SƠ CẤP KÉP
        //    (mỗi hàng 1 xích, bánh xích trục khuỷu kép), thanh dẫn nhựa.
        //  · PHUN KÉP: 6 kim phun trực tiếp (bơm cao áp dẫn bằng cam, ở nắp máy phải) + 6 kim phun cửa nạp; bô-bin trên từng bugi.
        //  · 2 turbo (1 / hàng) đặt thấp 2 bên, van xả điều khiển điện; cổ góp xả gang dạng ống góp; khí nén ra két làm mát khí nạp phía trước, về bướm ga điện tử
        //    đầu hộp góp hút; bơm dầu biến thiên, cacte nhôm.
        //  (Nguồn: Full-Race "3.5L EcoBoost generations explained", 8020 Automotive "3.5 EcoBoost guide", EngineLabs "Gen II 3.5L EcoBoost", CS Monitor 2016.)
        //  14 bộ phận × 3–7 chi tiết con (67), toạ độ = toạ độ mẫu cũ (m, Y lên, đầu máy +Z, gốc giữa đáy cacte; trục khuỷu y ENG_V.yc) ⇒ đặt / tỉ lệ / diễn như cũ.
        //  Diễn (engineer/tasks/engine-check.js pha 'holo'): hiện dần + quay bàn xoay 3 s → TÁCH RỜI (exploded view) 3 s → mỗi bộ phận T_HI + T_SIN + n × T_SUB +
        //  T_SOUT (chi tiết con toả ra như cành từ tâm bộ phận, soi lần lượt: sáng trắng, nhãn rõ, kỹ sư nhìn + chỉ tay) → lắp lại 3 s → tắt dần (cả lượt ~89 s).
        //  G 24/10 (2) "tăng độ visible của Engine parts lên 50%; và tô màu; nghiên cứu sao cho label ko đè lên hologram": độ đục + phát sáng ×1,5; TÔ MÀU theo hệ (khí
        //  xả nóng đỏ cam, khí nạp xanh dương, dầu vàng hổ phách, đánh lửa + điện tím / hồng, nhiên liệu xanh lá, dàn xupap vàng đồng, chi tiết quay màu thép, nước
        //  làm mát xanh ngọc, thân máy xám xanh); NHÃN NGOÀI (Ali, Hartmann & Strothotte 2005; Stein & Décoret): 2 cột trái / phải ngoài hộp bao hình, cỡ cố định theo
        //  điểm ảnh, đường dẫn mảnh từ tâm chi tiết, xếp theo độ cao điểm neo, giữ cột cũ + trượt êm.
        //  G 24/10 (3) "hide all the other label and leader lines even engineer thought": declutter() — lúc hình hiện, mọi nhãn vẽ đè khác chuyển sang LỚP 31 (camera
        //  không vẽ), dò lại mỗi 2 s; tắt hình thì trả lớp cũ ----
        const engHolo = (() => {
          const H = { g: null, parts: [], t: 0, on: false, cur: -1, sub: -1, base: new THREE.Vector3(), yaw: 0, done: false, tl: [], span: 0 };
          const WHITE = new THREE.Color(0xffffff), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _box = new THREE.Box3(), _tb = new THREE.Box3();
          const C_EXH = 0xff6a33, C_EXH2 = 0xff9a3c, C_EXH3 = 0xe8452a, C_AIR = 0x3f8cff, C_AIR2 = 0x7cbcff, C_AC = 0x9fe3ff, C_OIL = 0xffbe2e, C_OIL2 = 0xd9962a, C_IGN = 0xb27cff, C_IGN2 = 0xdcc6ff,
            C_IGN3 = 0x9b6fe0, C_ELEC = 0xe07ad8, C_FUEL = 0x7ed957, C_FUEL2 = 0xb8f08f, C_VALVE = 0xe6c34a, C_VALVE2 = 0xf2dd8a, C_VALVE3 = 0xd9a441, C_STEEL = 0xc3ccd6, C_STEEL2 = 0x8e9aa8,
            C_GUIDE = 0xaab6c2, C_ROD = 0x86aee0, C_PISTON = 0xe8eef3, C_BLOCK = 0x8fa6b8, C_BLOCK2 = 0xa9bccb, C_COOL = 0x2ec4a8, C_COOL2 = 0x7fe3cf, C_BELT = 0x6d7c8c;   // màu theo hệ (ghi chú đầu tệp)
          const LAB_H = 34, SUBLAB_H = 28, LAB_GAP = 6, LAB_MARGIN = 26;   // nhãn ngoài: cao (px CSS), giãn cách, cách mép hình
          const T_IN = 3, T_EX = 3, T_HI = 0.7, T_SIN = 0.6, T_SUB = 0.8, T_SOUT = 0.5, T_BACK = 3, T_OUT = 1.2, SUB_D = 0.24;
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const back = x => { x = Math.max(0, Math.min(1, x)); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };   // vọt nhẹ rồi về (bay ra có đà)
          function label(text, small) {   // nhãn tên: chữ trắng trên nền xanh đậm mờ, viền xanh hologram · small: nhãn chi tiết con (viền mảnh) · canvas 384 × 72 (81 nhãn — tiết kiệm bộ nhớ đồ hoạ)
            const c = document.createElement('canvas'); c.width = 384; c.height = 72; const x = c.getContext('2d');
            x.fillStyle = 'rgba(8,30,48,0.82)'; x.strokeStyle = 'rgba(120,220,255,0.95)'; x.lineWidth = small ? 2.2 : 3; x.beginPath(); x.roundRect(3, 3, 378, 66, 14); x.fill(); x.stroke();
            x.font = '600 ' + (small ? 28 : 33) + 'px Outfit, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#eaf8ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 192, 38, 364);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); s.renderOrder = small ? 13 : 12; s.scale.set(small ? 0.42 : 0.64, small ? 0.08 : 0.12, 1); return s;
          }
          function holoMat(col) { const m = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, color: col, emissive: col, emissiveIntensity: 0.22 }); m.userData.base = new THREE.Color(col); return m; }
          // ---- dựng hình: mỗi mảnh → BufferGeometry không chỉ mục, chỉ vị trí + pháp tuyến (gộp được bằng mergeGeometries) ----
          const Y1 = new THREE.Vector3(0, 1, 0), _q = new THREE.Quaternion(), _m = new THREE.Matrix4(), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
          function prep(g) { if (g.index) g = g.toNonIndexed(); for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal') g.deleteAttribute(n); if (!g.attributes.normal) g.computeVertexNormals(); g.clearGroups(); return g; }
          function flip(g) { for (const n of ['position', 'normal']) { const a = g.attributes[n].array; for (let i = 0; i < a.length; i += 9) for (let k = 3; k < 6; k++) { const t = a[i + k]; a[i + k] = a[i + k + 3]; a[i + k + 3] = t; } } return g; }   // đảo chiều tam giác (sau phép gương)
          const merge = list => mergeGeometries(list.map(prep), false);
          function cyl(r0, r1, a, b, seg = 16, open = false) { const d = _c.subVectors(b, a), L = d.length(), g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, open); g.applyQuaternion(_q.setFromUnitVectors(Y1, d.normalize())); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); return prep(g); }   // trụ / nón cụt a (r0) → b (r1)
          function box(w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) { const g = new THREE.BoxGeometry(w, h, d); if (rx || ry || rz) g.applyQuaternion(_q.setFromEuler(new THREE.Euler(rx, ry, rz))); g.translate(x, y, z); return prep(g); }
          function bar(a, b, w, t, up = V3(0, 0, 1)) {   // thanh tiết diện w × t nối a → b (cạnh t theo hướng gần 'up')
            const Y = b.clone().sub(a), L = Y.length(); Y.normalize(); const Z = up.clone().addScaledVector(Y, -up.dot(Y)); if (Z.lengthSq() < 1e-8) Z.set(1, 0, 0).addScaledVector(Y, -Y.x); Z.normalize();
            const g = new THREE.BoxGeometry(w, L, t); g.applyMatrix4(_m.makeBasis(Y.clone().cross(Z), Y, Z).setPosition((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)); return prep(g);
          }
          function lathe(prof, a, dir, seg = 18) { const g = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-4), y)), seg); g.applyQuaternion(_q.setFromUnitVectors(Y1, _c.copy(dir).normalize())); g.translate(a.x, a.y, a.z); return prep(g); }   // tiện tròn: [bán kính, dọc trục] từ a theo dir
          function sweep(pts, rad, seg = 24, radial = 10, closed = false) {   // ống theo đường cong qua các điểm; rad: số hoặc hàm theo u ∈ [0, 1]
            const cv = new THREE.CatmullRomCurve3(pts, closed, 'centripetal'), g = new THREE.TubeGeometry(cv, seg, 1, radial, closed), P = g.attributes.position, c = new THREE.Vector3();
            for (let i = 0; i <= seg; i++) { cv.getPointAt(Math.min(1, i / seg), c); const r = typeof rad === 'function' ? rad(i / seg) : rad;
              for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; P.setXYZ(k, c.x + (P.getX(k) - c.x) * r, c.y + (P.getY(k) - c.y) * r, c.z + (P.getZ(k) - c.z) * r); } }
            return prep(g);
          }
          function ext(shape, depth, z0 = 0) { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 16 }); g.translate(0, 0, z0); return prep(g); }   // đùn hình phẳng (x, y) dọc z
          const poly = (pts, holes = []) => { const s = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))); for (const h of holes) s.holes.push(h); return s; };
          const hole = (x, y, r) => new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true);
          function teeth(n, r, tw, th, depth, cx, cy, z) { const L = []; for (let i = 0; i < n; i++) { const g = new THREE.BoxGeometry(tw, th, depth); g.translate(0, r + th / 2, 0); g.rotateZ(-i / n * Math.PI * 2); g.translate(cx, cy, z); L.push(g); } return merge(L); }   // răng quanh vành (mặt phẳng xy)
          function spring(a, dir, rs, h, turns, wire) { const pts = [], n = Math.round(turns * 10); for (let i = 0; i <= n; i++) { const t = i / n, an = t * turns * Math.PI * 2; pts.push(V3(rs * Math.cos(an), t * h, rs * Math.sin(an))); }
            const g = sweep(pts, wire, n, 4); g.applyQuaternion(_q.setFromUnitVectors(Y1, _c.copy(dir).normalize())); g.translate(a.x, a.y, a.z); return g; }   // lò xo xoắn
          function beltPts(P) {   // đường dây / xích kín qua các puli theo thứ tự đi NGƯỢC chiều kim đồng hồ (nhìn từ trước): s +1 = puli bên trái hướng đi (dây ôm mặt ngoài), −1 = bên phải (puli căng tì lưng dây)
            const n = P.length, segs = [], pts = [], TAU = Math.PI * 2;
            for (let i = 0; i < n; i++) { const A = P[i], Bp = P[(i + 1) % n], dx = Bp.x - A.x, dy = Bp.y - A.y, L = Math.hypot(dx, dy), ph = Math.atan2(dy, dx) - Math.asin(Math.max(-1, Math.min(1, (Bp.s * Bp.r - A.s * A.r) / L))), rx = Math.sin(ph), ry = -Math.cos(ph);
              segs.push([[A.x + A.s * A.r * rx, A.y + A.s * A.r * ry], [Bp.x + Bp.s * Bp.r * rx, Bp.y + Bp.s * Bp.r * ry]]); }   // tiếp tuyến chung: điểm chạm = tâm + s·r·(bên phải hướng đi)
            for (let i = 0; i < n; i++) { const [p0, p1] = segs[i], C = P[(i + 1) % n], q0 = segs[(i + 1) % n][0], m = Math.max(1, Math.ceil(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 0.02));
              for (let j = 0; j < m; j++) pts.push([p0[0] + (p1[0] - p0[0]) * j / m, p0[1] + (p1[1] - p0[1]) * j / m]);
              const a0 = Math.atan2(p1[1] - C.y, p1[0] - C.x); let d = Math.atan2(q0[1] - C.y, q0[0] - C.x) - a0; d = C.s > 0 ? ((d % TAU) + TAU) % TAU : -((((-d) % TAU) + TAU) % TAU);
              const k = Math.max(1, Math.ceil(Math.abs(d) / 0.12)); for (let j = 0; j < k; j++) { const a = a0 + d * j / k; pts.push([C.x + C.r * Math.cos(a), C.y + C.r * Math.sin(a)]); } }
            return { pts, segs };
          }
          function ribbon(pts, z, w, th) {   // dây / xích kín tiết diện chữ nhật: w dọc trục máy × th, theo đường gấp khúc kín trong mặt phẳng z
            const n = pts.length, pos = [], P = [];
            for (let i = 0; i < n; i++) { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L, [x, y] = pts[i], hx = nx * th / 2, hy = ny * th / 2;
              P.push({ c: [[x + hx, y + hy, z + w / 2], [x + hx, y + hy, z - w / 2], [x - hx, y - hy, z - w / 2], [x - hx, y - hy, z + w / 2]], n: [nx, ny] }); }
            const tri = (a, b, c, o) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
              if ((uy * vz - uz * vy) * o[0] + (uz * vx - ux * vz) * o[1] + (ux * vy - uy * vx) * o[2] < 0) pos.push(...a, ...c, ...b); else pos.push(...a, ...b, ...c); };   // quay mặt ra ngoài
            for (let i = 0; i < n; i++) { const A = P[i].c, Bq = P[(i + 1) % n].c, [nx, ny] = P[i].n;
              for (const [p, q, o] of [[0, 1, [nx, ny, 0]], [3, 2, [-nx, -ny, 0]], [0, 3, [0, 0, 1]], [1, 2, [0, 0, -1]]]) { tri(A[p], A[q], Bq[q], o); tri(A[p], Bq[q], Bq[p], o); } }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g;
          }
          function chainLinks(pts, z, w, pitch = 0.0125) {   // má xích: mỗi mắt 2 má ở 2 mép (z ± w/2)
            const n = pts.length, seg = [], L = []; let tot = 0;
            for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], d = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push([a, b, tot, d]); tot += d; }
            const at = s => { s = ((s % tot) + tot) % tot; for (const [a, b, s0, d] of seg) if (s <= s0 + d) { const k = d ? (s - s0) / d : 0; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; } return pts[0]; };
            const m = Math.floor(tot / pitch);
            for (let i = 0; i < m; i++) { const p = at(i * tot / m), q = at((i + 0.8) * tot / m); for (const dz of [-w / 2, w / 2]) L.push(bar(V3(p[0], p[1], z + dz), V3(q[0], q[1], z + dz), 0.008, 0.0022)); }
            return merge(L);
          }
          function rrect(cx, cy, w, h, r) { const s = new THREE.Shape(), x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
            s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s; }
          function addSub(p, name, sg, mats, ctr, line) { p.g.add(sg); const lab = label(name, true); H.labG.add(lab); p.subs.push({ name, g: sg, mats, ctr, dir: null, lab, line }); }
          function finish(p) {   // tâm bộ phận = trung bình tâm chi tiết con · hướng toả của mỗi chi tiết = từ tâm bộ phận tới tâm nó (+ chếch lên), chi tiết nằm sát tâm thì toả đều quanh trục đứng
            p.ctr = p.subs.reduce((s, q) => s.add(q.ctr), new THREE.Vector3()).multiplyScalar(1 / Math.max(1, p.subs.length));
            p.subs.forEach((q, j) => { const d = q.ctr.clone().sub(p.ctr); if (d.length() < 0.03) { const a = j / p.subs.length * Math.PI * 2; d.set(Math.cos(a), 0, Math.sin(a)); } d.normalize(); d.y += 0.35; q.dir = d.normalize(); });
            p.mats = p.subs.flatMap(q => q.mats); p.lab = label(p.name, false);
            p.br = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(p.subs.length * 6), 3)), new THREE.LineBasicMaterial({ color: 0xbfe9ff, transparent: true, opacity: 0, depthWrite: false }));
            p.br.frustumCulled = false; p.g.add(p.br);   // cành: tâm bộ phận → tâm từng chi tiết con
          }
          function* steps() {   // dựng từng bộ phận một (yield sau mỗi bộ phận) — warm() gọi mỗi khung trong lúc kỹ sư ra đầu xe
            const g = new THREE.Group(); g.name = 'Hình động cơ nổi Ford 3.5L EcoBoost (hologram)'; g.visible = false; g.userData.noBatch = g.userData.noBake = true; scene.add(g);
            H.labG = new THREE.Group(); H.labG.name = 'Nhãn ngoài hình động cơ nổi'; H.labG.visible = false; H.labG.userData.noBatch = H.labG.userData.noBake = true; scene.add(H.labG);   // nhãn + đường dẫn (toạ độ thế giới, đặt mỗi khung)
            H.lead = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(96 * 6), 3)), new THREE.LineBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.75, depthTest: false, depthWrite: false }));
            H.lead.renderOrder = 11; H.lead.frustumCulled = false; H.labG.add(H.lead);
            H.title = label('Ford 3.5L EcoBoost V6 · 2 turbo', false); H.labG.add(H.title);
            // ---- số đo chung (hệ mẫu, m): trục khuỷu y YC dọc z · hàng ±30° · mặt boong DECK · đỉnh nắp máy HT · trục cam CAMY · đỉnh nắp dàn cò CVT (tính dọc trục xi-lanh từ tâm trục khuỷu) ----
            const V = ENG_V, YC = V.yc, CS = Math.cos(Math.PI / 6), TH0 = 0.5, DECK = 0.255, HT = 0.355, CAMY = 0.385, CVT = 0.432;   // TH0: góc quay trục khuỷu lúc dựng (piston nằm đủ kiểu)
            const CYL = V.cyl.map(([b, z], k) => { const br = b * Math.PI / 180, ang = TH0 + (b - 120 * k) * Math.PI / 180, a = ang - br, u = V3(Math.sin(br), Math.cos(br), 0), sp = V.r * Math.cos(a) + Math.sqrt(V.l * V.l - V.r * V.r * Math.sin(a) ** 2);
              return { s: Math.sign(b), z, k, no: [1, 4, 2, 5, 3, 6][k], u, ang, pin: V3(V.r * Math.sin(ang), YC + V.r * Math.cos(ang), z), pp: V3(0, YC, z).addScaledVector(u, sp) }; });   // chốt khuỷu + chốt piston như engine-run (cùng công thức)
            const ZS = s => CYL.filter(c => c.s === s).map(c => c.z), ZF = 0.115, ZR = -0.295, ZB = s => ZS(s)[2] - 0.07, ZCH = s => (s < 0 ? 0.122 : 0.136);   // mặt trước thân / nắp máy · đuôi thân · đuôi từng hàng · mặt phẳng xích từng hàng
            const B = (s, xo, yb, z) => V3(s * (0.5 * yb + CS * xo), YC + CS * yb - 0.5 * xo, z);   // điểm trong hệ hàng s (−1 phải / +1 trái): xo ra ngoài, yb dọc trục xi-lanh
            const BM = s => new THREE.Matrix4().makeBasis(V3(s * CS, -0.5, 0), V3(s * 0.5, CS, 0), V3(0, 0, 1)).setPosition(0, YC, 0);
            const bank = (s, list) => { const geo = merge(list).applyMatrix4(BM(s)); return s < 0 ? flip(geo) : geo; };   // dựng trong hệ hàng (x ra ngoài) → hệ mẫu; hàng phải là ảnh gương ⇒ đảo chiều tam giác
            const banks = f => merge([bank(-1, f(-1)), bank(1, f(1))]);
            const mk = (k, name, off, subs) => { const p = { k, name, g: new THREE.Group(), subs: [], off: V3(...off) }; g.add(p.g);
              for (const [sn, list] of subs) { const sg = new THREE.Group(), mats = [], lm = new THREE.LineBasicMaterial({ color: new THREE.Color(list[0][1]).lerp(WHITE, 0.55), transparent: true, opacity: 0, depthWrite: false });
                for (const [geo, col] of list) { const m = holoMat(col); mats.push(m); sg.add(new THREE.Mesh(geo, m)); sg.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), lm)); }   // khối + nét viền kỹ thuật (cạnh gãy ≥ 28°, mép hở)
                addSub(p, sn, sg, mats, new THREE.Box3().setFromObject(sg).getCenter(new THREE.Vector3()), lm); }
              finish(p); H.parts.push(p); };
            // ================= THÂN MÁY =================
            mk('block', 'Thân máy nhôm V6 60°', [0, 0, 0], [
              ['Hộp trục khuỷu (váy sâu)', [[merge([ext(poly([[-0.165, 0.1], [0.165, 0.1], [0.178, 0.23], [0.13, 0.285], [0, 0.35], [-0.13, 0.285], [-0.178, 0.23]]), ZF - ZR, ZR),
                ...[-1, 1].flatMap(s => [-0.2, -0.08, 0.04].map(z => bar(V3(s * 0.166, 0.11, z), V3(s * 0.179, 0.225, z), 0.008, 0.01, V3(s, 0, 0)))), ...[-1, 1].map(s => box(0.03, 0.05, 0.07, s * 0.19, 0.2, -0.05))]), C_BLOCK]]],
              ...[-1, 1].map(s => ['Khối xi-lanh hàng ' + (s < 0 ? '1 (phải)' : '2 (trái)'), [[bank(s, [box(0.14, DECK - 0.15, ZF - ZB(s), 0, (0.15 + DECK) / 2, (ZF + ZB(s)) / 2),
                ...ZS(s).map(z => cyl(0.012, 0.012, V3(0.069, 0.2, z), V3(0.075, 0.2, z), 14))]), C_BLOCK2]]]),   // nút chặn áo nước ở vách ngoài
              ['Ống lót xi-lanh gang ×6', [[banks(s => ZS(s).map(z => cyl(V.bore + 0.003, V.bore + 0.003, V3(0, 0.14, z), V3(0, DECK, z), 22, true))), C_STEEL2]]],
              ['Cảm biến kích nổ ×2 + trục khuỷu', [[merge([...[-0.04, -0.16].flatMap(z => [cyl(0.013, 0.013, V3(0, 0.345, z), V3(0, 0.357, z), 14), box(0.012, 0.01, 0.022, 0.016, 0.352, z), cyl(0.004, 0.004, V3(0, 0.357, z), V3(0, 0.364, z), 6)]),
                cyl(0.008, 0.008, V3(0.168, 0.14, -0.282), V3(0.2, 0.14, -0.282), 10), box(0.016, 0.014, 0.018, 0.208, 0.14, -0.282)]), C_IGN]]]]);
            yield;
            // ================= TRỤC KHUỶU =================
            const web = (ang, z0, d) => { const sh = new THREE.Shape(); sh.moveTo(0.026, 0); sh.lineTo(0.026, V.r); sh.absarc(0, V.r, 0.026, 0, Math.PI, false); sh.lineTo(-0.026, 0); sh.absarc(0, 0, 0.072, Math.PI * 1.11, Math.PI * 1.89, false); sh.closePath();
              const geo = ext(sh, d, z0); geo.rotateZ(-ang); geo.translate(0, YC, 0); return geo; };   // má khuỷu: tay nối chốt + đối trọng hình quạt phía đối diện
            const crankL = [cyl(0.02, 0.02, V3(0, YC, 0.11), V3(0, YC, 0.225), 16), cyl(0.048, 0.048, V3(0, YC, -0.3), V3(0, YC, -0.29), 24)];   // đầu trục trước · mặt bích đuôi
            for (const z of [0.09, -0.03, -0.15, -0.27]) crankL.push(cyl(0.03, 0.03, V3(0, YC, z - 0.02), V3(0, YC, z + 0.02), 20));   // 4 cổ trục chính
            for (const c of CYL) crankL.push(cyl(0.024, 0.024, V3(c.pin.x, c.pin.y, c.z - 0.013), V3(c.pin.x, c.pin.y, c.z + 0.013), 18));   // 6 chốt khuỷu
            for (let j = 0; j < 3; j++) { const c0 = CYL[2 * j], c1 = CYL[2 * j + 1], zm = (c0.z + c1.z) / 2;   // cặp chốt lệch 60° (split-pin) + má trước / sau + má mỏng giữa
              crankL.push(web(c0.ang, c0.z + 0.013, 0.012), web(c1.ang, c1.z - 0.025, 0.012), bar(V3(c0.pin.x, c0.pin.y, zm), V3(c1.pin.x, c1.pin.y, zm), 0.046, 0.004), ...[c0, c1].map(c => cyl(0.024, 0.024, V3(c.pin.x, c.pin.y, zm - 0.002), V3(c.pin.x, c.pin.y, zm + 0.002), 18))); }
            const capSh = (() => { const sh = new THREE.Shape(); sh.moveTo(-0.065, 0.105); sh.lineTo(0.065, 0.105); sh.lineTo(0.065, YC); sh.lineTo(0.032, YC); sh.absarc(0, YC, 0.032, 0, -Math.PI, true); sh.lineTo(-0.065, YC); sh.closePath(); return sh; })();
            const fp = new THREE.Shape(); fp.absarc(0, 0, 0.125, 0, Math.PI * 2, false); fp.holes.push(hole(0, 0, 0.022)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; fp.holes.push(hole(0.075 * Math.cos(a), 0.075 * Math.sin(a), 0.013)); }
            mk('crank', 'Trục khuỷu rèn + bánh đà', [0, -0.19, 0], [
              ['Trục khuỷu rèn (4 cổ trục, chốt lệch 60°)', [[merge(crankL), C_STEEL]]],
              ['Nắp cổ trục chính 6 bu-lông ×4', [[merge([0.09, -0.03, -0.15, -0.27].flatMap(z => [ext(capSh, 0.03, z - 0.015),
                ...[-0.045, 0.045].flatMap(x => [-0.008, 0.008].flatMap(dz => [cyl(0.0055, 0.0055, V3(x, 0.099, z + dz), V3(x, 0.17, z + dz), 6), cyl(0.009, 0.009, V3(x, 0.092, z + dz), V3(x, 0.099, z + dz), 6)])),
                ...[-1, 1].flatMap(s => [cyl(0.005, 0.005, V3(s * 0.065, 0.135, z), V3(s * 0.172, 0.135, z), 6), cyl(0.0085, 0.0085, V3(s * 0.172, 0.135, z), V3(s * 0.18, 0.135, z), 6)])])), C_STEEL2]]],   // 4 bu-lông đứng + 2 bu-lông ngang xuyên váy
              ['Đĩa truyền lực + vành răng khởi động', [[merge([ext(fp, 0.004, -0.32).translate(0, YC, 0), teeth(72, 0.125, 0.0055, 0.009, 0.012, 0, YC, -0.318), cyl(0.03, 0.03, V3(0, YC, -0.316), V3(0, YC, -0.305), 16),
                ...Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return cyl(0.007, 0.007, V3(0.1 * Math.cos(a), YC + 0.1 * Math.sin(a), -0.316), V3(0.1 * Math.cos(a), YC + 0.1 * Math.sin(a), -0.31), 6); })]), C_STEEL2]]],
              ['Củ đề (máy khởi động)', [[merge([cyl(0.034, 0.034, V3(0.205, 0.13, -0.27), V3(0.205, 0.13, -0.15), 18), cyl(0.03, 0.026, V3(0.205, 0.13, -0.15), V3(0.205, 0.13, -0.138), 18),
                cyl(0.016, 0.016, V3(0.205, 0.176, -0.255), V3(0.205, 0.176, -0.165), 12), cyl(0.004, 0.004, V3(0.205, 0.19, -0.2), V3(0.205, 0.205, -0.2), 6), cyl(0.022, 0.022, V3(0.205, 0.13, -0.27), V3(0.17, 0.142, -0.305), 14),
                teeth(10, 0.012, 0.004, 0.005, 0.012, 0.15, 0.148, -0.316), cyl(0.012, 0.012, V3(0.15, 0.148, -0.322), V3(0.15, 0.148, -0.31), 10)]), C_ELEC]]]]);
            yield;
            // ================= PISTON + TAY BIÊN (theo số Ford) =================
            mk('pistons', 'Piston + tay biên ×6', [0, 0.11, 0], CYL.slice().sort((a, b) => a.no - b.no).map(c => {
              const pp = c.pp, base = pp.clone().addScaledVector(c.u, -0.02), cp = c.pin, d = pp.clone().sub(cp).normalize(), pr = d.clone().cross(V3(0, 0, 1));
              return ['Piston + tay biên ' + c.no + ' (hàng ' + (c.s < 0 ? 1 : 2) + ')', [[lathe([[0, 0], [0.0435, 0], [0.0435, 0.062], [0.036, 0.0655], [0, 0.0665]], base, c.u, 24), C_PISTON],
                [merge([0.045, 0.052, 0.058].map(o => cyl(0.0445, 0.0445, base.clone().addScaledVector(c.u, o), base.clone().addScaledVector(c.u, o + 0.0024), 24))), C_STEEL2],   // 3 xéc-măng
                [merge([bar(cp, pp, 0.017, 0.013), cyl(0.015, 0.015, V3(pp.x, pp.y, c.z - 0.01), V3(pp.x, pp.y, c.z + 0.01), 16), cyl(0.031, 0.031, V3(cp.x, cp.y, c.z - 0.012), V3(cp.x, cp.y, c.z + 0.012), 20),
                  ...[-1, 1].map(k => cyl(0.0042, 0.0042, cp.clone().addScaledVector(pr, k * 0.025).addScaledVector(d, -0.03), cp.clone().addScaledVector(pr, k * 0.025).addScaledVector(d, 0.012), 6)),   // bu-lông nắp đầu to
                  cyl(0.0095, 0.0095, V3(pp.x, pp.y, c.z - 0.034), V3(pp.x, pp.y, c.z + 0.034), 12)]), C_ROD]]]; }));   // chốt piston
            yield;
            // ================= CACTE + BƠM DẦU =================
            const opChain = beltPts([{ x: 0, y: YC, r: 0.017, s: 1 }, { x: 0, y: 0.118, r: 0.022, s: 1 }]);
            mk('oil', 'Cacte + bơm dầu', [0, -0.34, 0], [
              ['Cacte trên (nhôm)', [[merge([ext(poly([[-0.155, 0.05], [0.155, 0.05], [0.165, 0.1], [-0.165, 0.1]]), ZF - ZR - 0.005, ZR + 0.002), box(0.346, 0.006, ZF - ZR, 0, 0.097, (ZF + ZR) / 2),
                ...[-1, 1].flatMap(s => [-0.27, -0.19, -0.11, -0.03, 0.05].map(z => cyl(0.0045, 0.0045, V3(s * 0.168, 0.092, z), V3(s * 0.168, 0.104, z), 6)))]), C_OIL2]]],
              ['Cacte dưới (chứa dầu) + ốc xả', [[merge([ext(poly([[-0.13, 0.004], [0.13, 0.004], [0.145, 0.052], [-0.145, 0.052]]), 0.3, -0.23), cyl(0.009, 0.009, V3(0.06, 0.004, -0.17), V3(0.06, -0.008, -0.17), 6),
                cyl(0.013, 0.013, V3(0.06, 0.007, -0.17), V3(0.06, 0.003, -0.17), 16)]), C_OIL]]],
              ['Lọc dầu', [[merge([cyl(0.028, 0.028, V3(0.17, 0.165, 0.05), V3(0.2, 0.15, 0.05), 16), lathe([[0, 0], [0.034, 0], [0.037, 0.008], [0.037, 0.088], [0.032, 0.095], [0, 0.096]], V3(0.2, 0.15, 0.05), V3(0.45, -0.89, 0), 24),
                ...[0.03, 0.06].map(o => cyl(0.0385, 0.0385, V3(0.2 + 0.45 * o, 0.15 - 0.89 * o, 0.05), V3(0.2 + 0.45 * (o + 0.004), 0.15 - 0.89 * (o + 0.004), 0.05), 24))]), C_OIL]]],
              ['Bơm dầu biến thiên + ống hút + xích bơm', [[merge([cyl(0.034, 0.034, V3(0, 0.118, 0.117), V3(0, 0.118, 0.142), 20), box(0.06, 0.03, 0.025, 0.03, 0.105, 0.13),
                sweep([V3(0.035, 0.1, 0.13), V3(0.05, 0.07, 0.11), V3(0.04, 0.035, 0.03), V3(0, 0.03, -0.06), V3(0, 0.028, -0.09)], 0.0075, 30, 8), cyl(0.034, 0.03, V3(0, 0.014, -0.1), V3(0, 0.024, -0.1), 20)]), C_OIL2],
                [merge([ribbon(opChain.pts, 0.147, 0.005, 0.004), teeth(14, 0.017, 0.004, 0.004, 0.005, 0, YC, 0.147), teeth(18, 0.022, 0.004, 0.004, 0.005, 0, 0.118, 0.147)]), C_STEEL2]]],
              ['Que thăm dầu', [[merge([sweep([V3(0.172, 0.12, 0), V3(0.2, 0.28, 0.035), V3(0.245, 0.46, 0.07), V3(0.25, 0.575, 0.08)], 0.0045, 40, 6), prep(new THREE.TorusGeometry(0.014, 0.0035, 6, 18)).translate(0.25, 0.592, 0.08),
                cyl(0.007, 0.007, V3(0.25, 0.57, 0.08), V3(0.25, 0.58, 0.08), 8)]), C_OIL]]]]);
            yield;
            // ================= XÍCH CAM KÉP (mặt trước) =================
            const chains = [-1, 1].map(s => { const ci = B(s, -0.035, CAMY, 0), ce = B(s, 0.035, CAMY, 0); return { s, z: ZCH(s), ...beltPts([{ x: 0, y: YC, r: 0.028, s: 1 }, ...(s < 0 ? [ci, ce] : [ce, ci]).map(p => ({ x: p.x, y: p.y, r: 0.04, s: 1 }))]) }; });
            const guide = (sg, off, f0, f1, z) => { const [p0, p1] = sg, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), nx = dy / L * off, ny = -dx / L * off;
              return bar(V3(p0[0] + dx * f0 + nx, p0[1] + dy * f0 + ny, z), V3(p0[0] + dx * f1 + nx, p0[1] + dy * f1 + ny, z), 0.007, 0.012); };   // thanh dẫn song song nhịp xích, phía ngoài vòng
            const OUT = [[-0.165, 0.1], [0.165, 0.1], [0.178, 0.23], [0.1968, 0.3608], [0.2853, 0.5141], [0.1467, 0.5941], [0.06, 0.475], [0, 0.452], [-0.06, 0.475], [-0.1467, 0.5941], [-0.2853, 0.5141], [-0.1968, 0.3608], [-0.178, 0.23]];   // viền nắp xích: thân + 2 nắp máy, khuyết chữ V giữa
            mk('timing', 'Xích cam kép + nắp xích', [0, 0.02, 0.27], [
              ['Bánh xích trục khuỷu kép', [[merge([cyl(0.02, 0.02, V3(0, YC, 0.115), V3(0, YC, 0.142), 16), ...chains.flatMap(C => [cyl(0.028, 0.028, V3(0, YC, C.z - 0.0045), V3(0, YC, C.z + 0.0045), 20), teeth(18, 0.028, 0.006, 0.006, 0.009, 0, YC, C.z)])]), C_STEEL]]],
              ['Xích cam sơ cấp ×2 (mỗi hàng 1 xích)', [[merge(chains.flatMap(C => [ribbon(C.pts, C.z, 0.006, 0.005), chainLinks(C.pts, C.z, 0.011)])), C_STEEL2]]],
              ['Thanh dẫn nhựa + bộ căng xích thuỷ lực', [[merge(chains.flatMap(C => { const [p0, p1] = C.segs[2], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), nx = (p1[1] - p0[1]) / L, ny = -(p1[0] - p0[0]) / L, an = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
                return [guide(C.segs[0], 0.009, 0.12, 0.88, C.z), guide(C.segs[2], 0.01, 0.15, 0.85, C.z), box(0.03, 0.022, 0.014, mx + nx * 0.034, my + ny * 0.034, C.z, 0, 0, an), cyl(0.005, 0.005, V3(mx + nx * 0.024, my + ny * 0.024, C.z), V3(mx + nx * 0.014, my + ny * 0.014, C.z), 8)]; })), C_GUIDE]]],
              ['Nắp xích cam (nhôm đúc)', [[merge([ext(poly(OUT, [hole(0, YC, 0.03)]), 0.008, 0.15), ext(poly(OUT, [new THREE.Path(OUT.map(([x, y]) => new THREE.Vector2(x * 0.95, 0.33 + (y - 0.33) * 0.95)))]), 0.035, 0.115),
                cyl(0.034, 0.034, V3(0, YC, 0.158), V3(0, YC, 0.165), 20), ...OUT.map(([x, y]) => cyl(0.0055, 0.0055, V3(x * 0.97, 0.33 + (y - 0.33) * 0.97, 0.158), V3(x * 0.97, 0.33 + (y - 0.33) * 0.97, 0.164), 6))]), C_BLOCK]]],
              ['Cảm biến vị trí trục cam ×4', [[merge([-1, 1].flatMap(s => [-0.035, 0.035].flatMap(xo => { const p = B(s, xo, CAMY, 0); return [cyl(0.008, 0.008, V3(p.x, p.y, 0.158), V3(p.x, p.y, 0.176), 10), box(0.014, 0.012, 0.016, p.x + s * 0.012, p.y + 0.01, 0.17)]; }))), C_IGN]]]]);
            yield;
            // ================= DÂY CUROA + PHỤ TẢI TRƯỚC (puli mặt phẳng z ZP) =================
            const ZP = 0.205, PUL = [{ x: 0, y: YC, r: 0.072, s: 1 }, { x: 0.178, y: 0.233, r: 0.026, s: -1 }, { x: 0.29, y: 0.4, r: 0.03, s: 1 }, { x: 0, y: 0.4, r: 0.045, s: 1 }, { x: -0.15, y: 0.37, r: 0.03, s: 1 }, { x: -0.255, y: 0.22, r: 0.05, s: 1 }];   // trục khuỷu · căng (tì lưng dây vào trong 12 mm) · máy phát · bơm nước (đỉnh vòng) · dẫn hướng · điều hoà
            const pulley = (p, w = 0.024) => [cyl(p.r, p.r, V3(p.x, p.y, ZP - w / 2), V3(p.x, p.y, ZP + w / 2), 24), ...[-1, 1].map(k => cyl(p.r + 0.004, p.r + 0.004, V3(p.x, p.y, ZP + k * w / 2), V3(p.x, p.y, ZP + k * (w / 2 + 0.003)), 24)),
              cyl(p.r * 0.45, p.r * 0.45, V3(p.x, p.y, ZP + w / 2 + 0.003), V3(p.x, p.y, ZP + w / 2 + 0.009), 16), cyl(0.006, 0.006, V3(p.x, p.y, ZP + w / 2 + 0.009), V3(p.x, p.y, ZP + w / 2 + 0.015), 6)];   // puli có gờ 2 mép + moay-ơ + ốc giữa
            mk('fead', 'Dây curoa + phụ tải trước', [0, 0.02, 0.5], [
              ['Puli giảm chấn trục khuỷu', [[merge([cyl(0.03, 0.03, V3(0, YC, 0.165), V3(0, YC, ZP - 0.012), 20), ...pulley(PUL[0], 0.026), cyl(0.06, 0.06, V3(0, YC, ZP - 0.02), V3(0, YC, ZP - 0.014), 24), box(0.004, 0.012, 0.004, 0, YC + 0.07, ZP + 0.017)]), C_STEEL]]],
              ['Máy phát điện', [[merge([cyl(0.055, 0.055, V3(0.29, 0.4, 0.085), V3(0.29, 0.4, 0.175), 22), cyl(0.05, 0.05, V3(0.29, 0.4, 0.175), V3(0.29, 0.4, 0.188), 22), cyl(0.045, 0.045, V3(0.29, 0.4, 0.075), V3(0.29, 0.4, 0.085), 20),
                ...Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return box(0.006, 0.02, 0.012, 0.29 + 0.052 * Math.cos(a), 0.4 + 0.052 * Math.sin(a), 0.181, 0, 0, a - Math.PI / 2); }),   // khe gió
                bar(V3(0.29, 0.4, 0.13), V3(0.23, 0.45, 0.13), 0.02, 0.03), bar(V3(0.29, 0.4, 0.13), V3(0.24, 0.34, 0.13), 0.02, 0.03), cyl(0.005, 0.005, V3(0.32, 0.43, 0.075), V3(0.32, 0.43, 0.06), 6)]), C_ELEC], [merge(pulley(PUL[2])), C_STEEL]]],
              ['Máy nén điều hoà', [[merge([cyl(0.058, 0.058, V3(-0.255, 0.22, 0.07), V3(-0.255, 0.22, 0.17), 22), cyl(0.052, 0.052, V3(-0.255, 0.22, 0.17), V3(-0.255, 0.22, 0.19), 22), ...[0.09, 0.14].map(z => cyl(0.009, 0.009, V3(-0.255, 0.27, z), V3(-0.255, 0.3, z), 10)),
                bar(V3(-0.255, 0.22, 0.1), V3(-0.19, 0.25, 0.1), 0.02, 0.03), bar(V3(-0.255, 0.22, 0.15), V3(-0.19, 0.2, 0.15), 0.02, 0.03)]), C_AC], [merge([...pulley(PUL[5]), cyl(0.04, 0.04, V3(-0.255, 0.22, ZP + 0.012), V3(-0.255, 0.22, ZP + 0.017), 20)]), C_STEEL]]],
              ['Bơm nước + vỏ van hằng nhiệt', [[merge([cyl(0.04, 0.04, V3(0, 0.4, 0.158), V3(0, 0.4, ZP - 0.012), 20), cyl(0.016, 0.016, V3(-0.035, 0.37, 0.168), V3(-0.075, 0.345, 0.168), 12), box(0.045, 0.035, 0.03, 0.08, 0.35, 0.175),
                cyl(0.017, 0.017, V3(0.082, 0.365, 0.185), V3(0.09, 0.4, 0.25), 14)]), C_COOL], [merge(pulley(PUL[3])), C_STEEL]]],
              ['Puli căng + puli dẫn hướng', [[merge([...pulley(PUL[1], 0.022), bar(V3(0.178, 0.233, ZP - 0.016), V3(0.12, 0.29, ZP - 0.016), 0.02, 0.01), cyl(0.024, 0.024, V3(0.12, 0.29, 0.165), V3(0.12, 0.29, ZP - 0.012), 18),
                ...pulley(PUL[4], 0.022), bar(V3(-0.15, 0.37, ZP - 0.016), V3(-0.12, 0.33, ZP - 0.016), 0.018, 0.01)]), C_STEEL2]]],
              ['Dây curoa nhiều rãnh (serpentine)', [[ribbon(beltPts(PUL).pts, ZP, 0.022, 0.006), C_BELT]]],
              ['Ống nước làm mát (két ↔ máy, sưởi)', [[merge([sweep([V3(0.09, 0.4, 0.25), V3(0.11, 0.42, 0.32), V3(0.15, 0.4, 0.37)], 0.016, 16, 10), sweep([V3(-0.075, 0.345, 0.168), V3(-0.1, 0.32, 0.23), V3(-0.11, 0.3, 0.3), V3(-0.12, 0.28, 0.36)], 0.017, 20, 10),
                ...[[0.09, 0.4, 0.25], [0.15, 0.4, 0.37], [-0.075, 0.345, 0.168], [-0.12, 0.28, 0.36]].map(([x, y, z]) => cyl(0.021, 0.021, V3(x, y, z - 0.006), V3(x, y, z + 0.006), 14)),   // đai kẹp
                ...[-1, 1].map(s => sweep([V3(s * 0.03, 0.43, ZR + 0.02), V3(s * 0.05, 0.47, ZR - 0.04), V3(s * 0.08, 0.45, ZR - 0.1)], 0.008, 12, 8))]), C_COOL2]]]]);
            yield;
            // ================= CỔ HÚT + BƯỚM GA =================
            const bfly = new THREE.CylinderGeometry(0.031, 0.031, 0.002, 20); bfly.rotateX(Math.PI / 2 - 0.35); bfly.translate(0, 0.655, 0.1);
            const tbEnd = V3(-0.11, 0.48, 0.365), tbDir = tbEnd.clone().sub(V3(-0.09, 0.55, 0.33)).normalize();
            mk('intake', 'Cổ hút + bướm ga điện tử', [0, 0.5, 0.06], [
              ['Hộp góp hút (plenum) + cảm biến MAP', [[merge([ext(rrect(0, 0.655, 0.17, 0.1, 0.03), 0.34, -0.265), ...[-0.04, 0, 0.04].map(x => bar(V3(x, 0.705, -0.24), V3(x, 0.705, 0.05), 0.006, 0.008, V3(0, 1, 0))),
                ...[-1, 1].map(s => cyl(0.006, 0.006, V3(s * 0.085, 0.67, -0.2), V3(s * 0.1, 0.67, -0.2), 8))]), C_AIR2], [merge([box(0.024, 0.014, 0.03, 0.04, 0.712, 0.03), box(0.012, 0.012, 0.014, 0.04, 0.722, 0.045)]), C_IGN]]],
              ['Ống nhánh hút ×6', [[merge([...CYL.map(c => sweep([V3(c.s * 0.04, 0.625, c.z), V3(c.s * 0.045, 0.57, c.z), B(c.s, -0.13, 0.33, c.z), B(c.s, -0.1, 0.315, c.z), B(c.s, -0.085, 0.31, c.z)], 0.017, 24, 12)),
                ...[-1, 1].map(s => bank(s, ZS(s).map(z => box(0.008, 0.048, 0.046, -0.088, 0.31, z))))]), C_AIR]]],
              ['Bướm ga điện tử', [[merge([lathe([[0.032, 0], [0.042, 0], [0.042, 0.05], [0.032, 0.05], [0.032, 0]], V3(0, 0.655, 0.075), V3(0, 0, 1), 24), box(0.095, 0.09, 0.008, 0, 0.655, 0.079), prep(bfly),
                cyl(0.003, 0.003, V3(-0.042, 0.655, 0.1), V3(0.042, 0.655, 0.1), 6)]), C_AIR], [merge([box(0.03, 0.06, 0.04, 0.058, 0.64, 0.1), cyl(0.014, 0.014, V3(0.058, 0.615, 0.08), V3(0.058, 0.615, 0.12), 14), box(0.016, 0.014, 0.012, 0.075, 0.66, 0.1)]), C_ELEC]]],
              ['Ống gió nén từ két làm mát khí nạp', [[merge([sweep([V3(0, 0.655, 0.122), V3(0, 0.66, 0.19), V3(-0.04, 0.63, 0.27), V3(-0.09, 0.55, 0.33), tbEnd], 0.03, 40, 14), cyl(0.034, 0.034, V3(0, 0.655, 0.118), V3(0, 0.655, 0.14), 18),
                cyl(0.034, 0.034, tbEnd.clone().addScaledVector(tbDir, -0.012), tbEnd.clone().addScaledVector(tbDir, 0.01), 18)]), C_AIR2]]]]);
            yield;
            // ================= NHIÊN LIỆU PHUN KÉP =================
            const zp = ZB(-1) + 0.04, PO = B(-1, 0, CVT + 0.03, zp);   // bơm cao áp trên nắp máy phải, cuối hàng (dẫn bằng vấu cam nạp)
            mk('fuel', 'Nhiên liệu phun kép (trực tiếp + cửa nạp)', [0, 0.3, 0.34], [
              ['Bơm cao áp (dẫn bằng cam)', [[merge([bank(-1, [cyl(0.021, 0.021, V3(-0.035, CVT - 0.004, zp), V3(-0.035, CVT + 0.05, zp), 18), box(0.06, 0.006, 0.04, -0.035, CVT, zp), cyl(0.006, 0.006, V3(-0.035, CVT + 0.03, zp), V3(0, CVT + 0.03, zp), 8),
                cyl(0.007, 0.007, V3(-0.035, CVT + 0.03, zp), V3(-0.068, CVT + 0.03, zp), 8), box(0.016, 0.012, 0.02, -0.035, CVT + 0.056, zp)]),
                sweep([PO, B(-1, -0.01, CVT + 0.04, ZB(-1) - 0.02), B(-1, -0.09, 0.36, ZB(-1) - 0.02), B(-1, -0.1, 0.295, ZB(-1) + 0.012)], 0.0035, 30, 6),   // ống cao áp → ống phân phối phải
                sweep([PO, V3(-0.03, 0.52, -0.31), V3(0.06, 0.5, -0.315), B(1, -0.09, 0.36, ZB(1) - 0.02), B(1, -0.1, 0.295, ZB(1) + 0.012)], 0.0035, 40, 6)]), C_FUEL]]],   // ống cao áp vòng sau hộp góp → ống phân phối trái
              ['Ống phân phối cao áp ×2 + cảm biến áp suất', [[banks(s => [cyl(0.009, 0.009, V3(-0.1, 0.295, ZB(s) + 0.012), V3(-0.1, 0.295, ZF - 0.015), 14), cyl(0.011, 0.011, V3(-0.1, 0.295, ZF - 0.015), V3(-0.1, 0.295, ZF - 0.005), 14),
                ...ZS(s).map(z => box(0.016, 0.012, 0.012, -0.093, 0.288, z - 0.035)), cyl(0.0065, 0.0065, V3(-0.1, 0.295, ZF - 0.005), V3(-0.1, 0.295, ZF + 0.02), 10), box(0.014, 0.012, 0.014, -0.1, 0.307, ZF + 0.014)]), C_FUEL]]],
              ['Kim phun trực tiếp ×6', [[banks(s => ZS(s).flatMap(z => [cyl(0.0045, 0.0045, V3(-0.052, 0.272, z), V3(-0.075, 0.282, z), 8), cyl(0.0085, 0.0085, V3(-0.075, 0.282, z), V3(-0.094, 0.29, z), 12), box(0.012, 0.014, 0.012, -0.084, 0.296, z)])), C_FUEL2]]],
              ['Kim phun cửa nạp ×6 + ống thấp áp', [[banks(s => ZS(s).flatMap(z => [cyl(0.0065, 0.0065, V3(-0.125, 0.36, z), V3(-0.106, 0.336, z), 10), box(0.012, 0.01, 0.014, -0.132, 0.37, z)])), C_FUEL2],
                [banks(s => [cyl(0.007, 0.007, V3(-0.13, 0.372, ZB(s) + 0.03), V3(-0.13, 0.372, ZF + 0.005), 12)]), C_FUEL]]]]);
            yield;
            // ================= ĐÁNH LỬA =================
            mk('ignition', 'Đánh lửa (bô-bin trên bugi)', [0, 0.36, -0.12], [
              ['Bô-bin đánh lửa ×6', [[banks(s => ZS(s).flatMap(z => [cyl(0.0105, 0.0105, V3(0, 0.33, z), V3(0, 0.418, z), 12), lathe([[0, 0], [0.017, 0], [0.017, 0.044], [0.013, 0.05], [0, 0.05]], V3(0, 0.418, z), Y1, 18),
                box(0.02, 0.016, 0.026, 0.014, 0.474, z), box(0.026, 0.005, 0.012, -0.024, 0.452, z), cyl(0.005, 0.005, V3(-0.03, 0.455, z), V3(-0.03, 0.462, z), 6)])), C_IGN]]],
              ['Bugi ×6', [[banks(s => ZS(s).flatMap(z => [cyl(0.0015, 0.0015, V3(0, 0.256, z), V3(0, 0.263, z), 6), cyl(0.006, 0.006, V3(0, 0.262, z), V3(0, 0.286, z), 10), cyl(0.0095, 0.0095, V3(0, 0.286, z), V3(0, 0.297, z), 6),
                cyl(0.0058, 0.0045, V3(0, 0.297, z), V3(0, 0.33, z), 10), cyl(0.003, 0.003, V3(0, 0.33, z), V3(0, 0.337, z), 6)])), C_IGN2]]],
              ['Bó dây điện đánh lửa', [[merge([banks(s => [sweep([V3(0.04, 0.45, ZB(s) - 0.01), V3(0.04, 0.45, ZB(s) + 0.1), V3(0.042, 0.452, ZF - 0.05), V3(0.04, 0.45, ZF + 0.01)], 0.0055, 40, 8),
                ...ZS(s).map(z => sweep([V3(0.04, 0.45, z), V3(0.036, 0.465, z), V3(0.024, 0.474, z)], 0.0038, 8, 6))]),
                ...[-1, 1].map(s => sweep([B(s, 0.04, 0.45, ZB(s) - 0.01), B(s, 0.02, 0.46, ZB(s) - 0.05), V3(s * 0.07, 0.6, -0.33), V3(0, 0.62, -0.35)], 0.006, 20, 8)), sweep([V3(0, 0.62, -0.35), V3(0, 0.615, -0.38), V3(0, 0.6, -0.41)], 0.008, 6, 8)]), C_IGN3]]]]);   // 2 bó gặp nhau sau hộp góp → về hộp điều khiển
            yield;
            // ================= NẮP MÁY 2 HÀNG =================
            const coverSh = (() => { const sh = new THREE.Shape(); sh.moveTo(-0.073, HT); sh.lineTo(0.073, HT); sh.lineTo(0.073, CVT - 0.022); sh.quadraticCurveTo(0.073, CVT, 0.05, CVT); sh.lineTo(-0.05, CVT); sh.quadraticCurveTo(-0.073, CVT, -0.073, CVT - 0.022); sh.closePath(); return sh; })();
            const bz = s => [ZF - 0.01, ...ZS(s).map(z => z - 0.06)];   // vị trí bu-lông nắp máy / cầu trục cam dọc hàng
            const gasket = s => { const geo = ext(poly([[-0.075, -ZF], [0.075, -ZF], [0.075, -ZB(s)], [-0.075, -ZB(s)]], [...ZS(s).map(z => hole(0, -z, V.bore + 0.003)), ...[-0.062, 0.062].flatMap(x => bz(s).map(z => hole(x, -z, 0.006))),
              ...ZS(s).flatMap(z => [-1, 1].map(k => hole(k * 0.06, -z - 0.03, 0.004)))]), 0.004, 0); geo.rotateX(-Math.PI / 2); geo.translate(0, DECK, 0); return geo; };   // tấm thép: lỗ xi-lanh, bu-lông, nước
            for (const s of [-1, 1]) { mk(s < 0 ? 'headR' : 'headL', 'Nắp máy hàng ' + (s < 0 ? '1 (phải)' : '2 (trái)'), [s * 0.15, 0.24, -0.02], [
              ['Nắp quy-lát nhôm (cửa nạp / xả)', [[bank(s, [box(0.15, HT - DECK - 0.004, ZF - ZB(s), 0, (HT + DECK + 0.004) / 2, (ZF + ZB(s)) / 2), ...ZS(s).flatMap(z => [box(0.012, 0.042, 0.042, -0.081, 0.31, z), box(0.01, 0.036, 0.036, 0.08, 0.305, z)]),
                ...bz(s).map(z => box(0.11, 0.02, 0.012, 0, HT + 0.01, z)), ...[-0.062, 0.062].flatMap(x => bz(s).map(z => cyl(0.009, 0.009, V3(x, HT, z), V3(x, HT + 0.008, z), 6)))]), C_BLOCK2]]],
              ['Nắp dàn cò ' + (s < 0 ? '+ nắp châm dầu' : '+ van thông hơi PCV'), [[bank(s, [ext(coverSh, ZF - ZB(s) + 0.01, ZB(s) - 0.006), ...[-0.045, 0.045].map(x => bar(V3(x, CVT + 0.002, ZB(s) + 0.03), V3(x, CVT + 0.002, ZF - 0.03), 0.006, 0.006, Y1)),
                ...[-0.074, 0.074].flatMap(x => [ZB(s) + 0.02, ...ZS(s), ZF - 0.02].map(z => cyl(0.005, 0.005, V3(x, HT + 0.004, z), V3(x, HT + 0.012, z), 6)))]), C_VALVE],
                [bank(s, s < 0 ? [cyl(0.024, 0.024, V3(-0.035, CVT - 0.002, ZF - 0.045), V3(-0.035, CVT + 0.014, ZF - 0.045), 20), cyl(0.02, 0.02, V3(-0.035, CVT + 0.014, ZF - 0.045), V3(-0.035, CVT + 0.018, ZF - 0.045), 20),
                  ...Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2; return box(0.006, 0.014, 0.006, -0.035 + 0.024 * Math.cos(a), CVT + 0.007, ZF - 0.045 + 0.024 * Math.sin(a)); })]
                  : [cyl(0.009, 0.009, V3(-0.03, CVT - 0.002, ZB(s) + 0.05), V3(-0.03, CVT + 0.02, ZB(s) + 0.05), 12), sweep([V3(-0.03, CVT + 0.02, ZB(s) + 0.05), V3(-0.03, CVT + 0.034, ZB(s) + 0.04), V3(-0.03, CVT + 0.036, ZB(s) + 0.01), V3(-0.03, CVT + 0.03, ZB(s) - 0.02)], 0.006, 16, 8)]), s < 0 ? C_OIL : C_OIL2]]],
              ['Gioăng nắp máy thép nhiều lớp', [[bank(s, [gasket(s)]), C_STEEL2]]]]); yield; }
            // ================= TRỤC CAM + XUPAP (DOHC 24 xupap, 2 hàng) =================
            const lobe = (() => { const sh = new THREE.Shape(); sh.absarc(0, 0, 0.0125, Math.PI * 0.9, Math.PI * 2.1, false); sh.absarc(0, 0.0155, 0.0055, Math.PI * 0.1, Math.PI * 0.9, false); sh.closePath(); return sh; })();   // vấu cam: vòng cơ sở + mũi
            const cam = (s, xo, ph0) => [cyl(0.011, 0.011, V3(xo, CAMY, ZB(s) + 0.012), V3(xo, CAMY, ZF + 0.004), 14), ...bz(s).map(z => cyl(0.0135, 0.0135, V3(xo, CAMY, z - 0.005), V3(xo, CAMY, z + 0.005), 14)),
              ...CYL.filter(c => c.s === s).flatMap(c => [-0.016, 0.016].map(dz => { const geo = ext(lobe, 0.009, c.z + dz - 0.0045); geo.rotateZ(c.k * Math.PI / 3 + ph0); geo.translate(xo, CAMY, 0); return geo; }))];
            const vlv = (s, sg, rv) => ZS(s).flatMap(z => [-0.016, 0.016].map(dz => { const hd = V3(sg * 0.017, 0.262, z + dz), tip = V3(sg * 0.03, 0.352, z + dz), d = tip.clone().sub(hd), L = d.length(); d.normalize(); return { hd, d, L, rv }; }));   // xupap: tâm nấm → đuôi, nghiêng theo phía
            const valveG = (s, sg, rv) => vlv(s, sg, rv).map(v => lathe([[0, 0], [v.rv, 0], [v.rv, 0.0025], [0.0042, 0.012], [0.0035, 0.018], [0.0035, v.L], [0, v.L]], v.hd, v.d, 16));
            const springG = (s, sg) => vlv(s, sg, 0).flatMap(v => [spring(v.hd.clone().addScaledVector(v.d, 0.05), v.d, 0.0085, 0.026, 4.5, 0.0014), cyl(0.008, 0.0055, v.hd.clone().addScaledVector(v.d, 0.077), v.hd.clone().addScaledVector(v.d, 0.082), 12)]);
            mk('valvetrain', 'Trục cam kép + 24 xupap', [0, 0.28, -0.46], [
              ['Trục cam nạp ×2 (rỗng)', [[banks(s => cam(s, -0.035, 0)), C_VALVE]]],
              ['Trục cam xả ×2', [[banks(s => cam(s, 0.035, 1.9)), C_VALVE3]]],
              ['Bộ chỉnh cam VCT ×4', [[banks(s => [-0.035, 0.035].flatMap(xo => [cyl(0.03, 0.03, V3(xo, CAMY, ZF), V3(xo, CAMY, ZCH(s) - 0.004), 20), cyl(0.037, 0.037, V3(xo, CAMY, ZCH(s) - 0.004), V3(xo, CAMY, ZCH(s) + 0.004), 24),
                teeth(28, 0.037, 0.0045, 0.005, 0.008, xo, CAMY, ZCH(s)), cyl(0.009, 0.009, V3(xo, CAMY, ZCH(s) + 0.004), V3(xo, CAMY, ZCH(s) + 0.012), 6)])), C_STEEL]]],
              ['Xupap nạp ×12 (thân rỗng) + lò xo', [[banks(s => valveG(s, -1, 0.0135)), C_AIR2], [banks(s => springG(s, -1)), C_STEEL2]]],
              ['Xupap xả ×12 (chứa natri) + lò xo', [[banks(s => valveG(s, 1, 0.0115)), C_EXH2], [banks(s => springG(s, 1)), C_STEEL2]]],
              ['Cò mổ con lăn + con đội thuỷ lực ×24', [[banks(s => ZS(s).flatMap(z => [-1, 1].flatMap(sg => [-0.016, 0.016].flatMap(dz => [bar(V3(sg * 0.03, 0.356, z + dz), V3(sg * 0.058, 0.36, z + dz), 0.006, 0.008),
                cyl(0.0042, 0.0042, V3(sg * 0.036, 0.364, z + dz - 0.004), V3(sg * 0.036, 0.364, z + dz + 0.004), 10), cyl(0.0055, 0.0055, V3(sg * 0.058, 0.325, z + dz), V3(sg * 0.058, 0.357, z + dz), 10)])))), C_VALVE2]]]]);
            yield;
            // ================= 2 TURBO (1 / hàng, đặt thấp 2 bên) =================
            for (const s of [-1, 1]) {
              const TX = s * 0.315, TY = 0.215, TZT = -0.2, TZC = -0.065, zm = (TZT + TZC) / 2, zs = ZS(s);
              const vol = (zp, R0, R1, aEnd) => { const pts = []; for (let i = 0; i <= 22; i++) { const t = i / 22, a = aEnd - s * (1 - t) * 1.75 * Math.PI, R = R0 + (R1 - R0) * t; pts.push(V3(TX + R * Math.cos(a), TY + R * Math.sin(a), zp)); } return pts; };   // vỏ ốc: xoắn quanh trục turbo, to dần
              const tp = vol(TZT, 0.03, 0.05, Math.PI / 2), tEnd = tp[tp.length - 1], TI = tEnd.clone().add(V3(-s * 0.03, 0.022, 0)); tp.push(tEnd.clone().add(V3(-s * 0.018, 0.004, 0)), TI);   // tua-bin: miệng vào phía trên, hướng vào trong (đón cổ góp)
              const cp = vol(TZC, 0.04, 0.062, -Math.PI / 2), cEnd = cp[cp.length - 1], EC = cEnd.clone().add(V3(s * 0.025, 0, 0)); cp.push(EC);   // máy nén: miệng ra phía dưới, hướng ra ngoài
              const blades = Array.from({ length: 8 }, (_, i) => { const geo = new THREE.BoxGeometry(0.0025, 0.022, 0.018); geo.rotateY(0.5); geo.translate(0, 0.016, 0); geo.rotateZ(i * Math.PI / 4); geo.translate(TX, TY, TZC + 0.03); return prep(geo); });   // bánh nén nhìn qua cổ hút
              mk(s < 0 ? 'turboR' : 'turboL', 'Turbo hàng ' + (s < 0 ? '1 (phải)' : '2 (trái)'), [s * 0.32, -0.05, -0.04], [
                ['Cổ góp xả gang', [[merge([bank(s, [cyl(0.021, 0.021, V3(0.108, 0.29, zs[0] + 0.035), V3(0.108, 0.29, zs[2] - 0.035), 16), ...zs.flatMap(z => [cyl(0.015, 0.015, V3(0.08, 0.305, z), V3(0.108, 0.292, z), 12),
                  box(0.008, 0.05, 0.05, 0.079, 0.305, z), ...[-1, 1].map(k => cyl(0.004, 0.004, V3(0.083, 0.305 + k * 0.02, z + k * 0.02), V3(0.092, 0.305 + k * 0.02, z + k * 0.02), 6))])]),
                  sweep([B(s, 0.108, 0.29, zs[2] - 0.03), B(s, 0.13, 0.25, zs[2] - 0.04), TI.clone().add(V3(0, 0.03, -0.012)), TI.clone().add(V3(0, 0.006, 0))], 0.019, 24, 12)]), C_EXH3]]],
                ['Vỏ tua-bin + van xả điện tử', [[merge([sweep(tp, u => 0.01 + 0.016 * Math.min(1, u * 1.08), 48, 12), cyl(0.03, 0.03, V3(TX, TY, TZT - 0.025), V3(TX, TY, TZT + 0.02), 20), cyl(0.028, 0.028, V3(TX, TY, TZT - 0.045), V3(TX, TY, TZT - 0.025), 20),
                  cyl(0.04, 0.04, V3(TX, TY, TZT - 0.051), V3(TX, TY, TZT - 0.045), 20), cyl(0.012, 0.012, V3(TX + s * 0.03, TY + 0.022, TZT - 0.04), V3(TX + s * 0.03, TY + 0.022, TZT - 0.01), 10)]), C_EXH],
                  [merge([box(0.04, 0.034, 0.05, TX + s * 0.072, TY + 0.06, TZC - 0.04), cyl(0.012, 0.012, V3(TX + s * 0.072, TY + 0.06, TZC - 0.065), V3(TX + s * 0.072, TY + 0.06, TZC - 0.09), 12), box(0.014, 0.016, 0.018, TX + s * 0.072, TY + 0.084, TZC - 0.04)]), C_ELEC],
                  [merge([bar(V3(TX + s * 0.072, TY + 0.045, TZC - 0.065), V3(TX + s * 0.045, TY + 0.03, TZT - 0.01), 0.004, 0.004, Y1), box(0.006, 0.02, 0.006, TX + s * 0.045, TY + 0.025, TZT - 0.01)]), C_STEEL2]]],   // cần nối → tay van xả
                ['Vỏ máy nén + cổ hút gió', [[merge([sweep(cp, u => 0.012 + 0.018 * Math.min(1, u * 1.08), 48, 12), cyl(0.034, 0.034, V3(TX, TY, TZC + 0.012), V3(TX, TY, TZC + 0.07), 20, true), cyl(0.038, 0.038, V3(TX, TY, TZC + 0.056), V3(TX, TY, TZC + 0.072), 20, true),
                  cyl(0.05, 0.05, V3(TX, TY, TZC - 0.03), V3(TX, TY, TZC - 0.022), 22), cyl(0.032, 0.032, V3(TX, TY, TZC - 0.022), V3(TX, TY, TZC + 0.012), 20)]), C_AIR]]],
                ['Lõi trục + bánh nén, ống dầu / nước (CHRA)', [[merge([cyl(0.024, 0.024, V3(TX, TY, TZT + 0.02), V3(TX, TY, TZC - 0.03), 18), cyl(0.03, 0.03, V3(TX, TY, TZT + 0.02), V3(TX, TY, TZT + 0.03), 18), cyl(0.03, 0.03, V3(TX, TY, TZC - 0.04), V3(TX, TY, TZC - 0.03), 18),
                  ...blades, cyl(0.008, 0.008, V3(TX, TY, TZC + 0.02), V3(TX, TY, TZC + 0.045), 10), cyl(0.008, 0.008, V3(TX, TY + 0.022, zm), V3(TX, TY + 0.04, zm), 10)]), C_STEEL],
                  [merge([sweep([V3(TX, TY + 0.04, zm), V3(TX - s * 0.02, TY + 0.08, zm + 0.01), V3(s * 0.21, 0.31, zm + 0.02), V3(s * 0.185, 0.31, zm + 0.02)], 0.0035, 20, 6),
                    sweep([V3(TX, TY - 0.024, zm), V3(TX - s * 0.01, TY - 0.07, zm), V3(s * 0.2, 0.09, zm - 0.01), V3(s * 0.165, 0.085, zm - 0.01)], 0.007, 20, 8)]), C_OIL2],   // ống dầu vào (trên) · dầu hồi về cacte (dưới)
                  [merge([-1, 1].map(k => sweep([V3(TX - s * 0.02, TY + 0.014, zm + k * 0.012), V3(s * 0.25, 0.28, zm + k * 0.015), V3(s * 0.195, 0.33, zm + k * 0.015)], 0.003, 14, 6))), C_COOL]]],
                ['Ống xả xuống + cảm biến ô-xy', [[merge([cyl(0.038, 0.038, V3(TX, TY, TZT - 0.058), V3(TX, TY, TZT - 0.051), 20), sweep([V3(TX, TY, TZT - 0.056), V3(TX, TY - 0.005, TZT - 0.1), V3(TX - s * 0.02, TY - 0.08, TZT - 0.15), V3(TX - s * 0.04, TY - 0.17, TZT - 0.2),
                  V3(TX - s * 0.05, TY - 0.24, TZT - 0.26)], 0.026, 40, 14)]), C_EXH2], [merge([cyl(0.0075, 0.0075, V3(TX + s * 0.012, TY - 0.06, TZT - 0.13), V3(TX + s * 0.05, TY - 0.05, TZT - 0.13), 10),
                  cyl(0.011, 0.011, V3(TX + s * 0.028, TY - 0.056, TZT - 0.13), V3(TX + s * 0.036, TY - 0.054, TZT - 0.13), 6)]), C_IGN]]],
                ['Ống gió nén ra két làm mát khí nạp', [[merge([sweep([EC, EC.clone().add(V3(s * 0.03, -0.015, 0.01)), V3(s * 0.385, 0.115, TZC + 0.07), V3(s * 0.385, 0.105, 0.2), V3(s * 0.36, 0.11, 0.33)], 0.024, 40, 12),
                  cyl(0.028, 0.028, V3(s * 0.362, 0.11, 0.315), V3(s * 0.358, 0.11, 0.345), 16)]), C_AIR2]]]]);
              yield;
            }
            for (const p of H.parts) H.labG.add(p.lab);
            H.g = g; H.order = ['intake', 'fuel', 'ignition', 'turboR', 'turboL', 'fead', 'timing', 'headR', 'headL', 'valvetrain', 'pistons', 'crank', 'oil', 'block'].map(k => H.parts.findIndex(p => p.k === k)).filter(i => i >= 0);   // thứ tự tháo máy: ngoài → trong
            let t0 = 0; H.tl = H.order.map(i => { const d = T_HI + T_SIN + H.parts[i].subs.length * T_SUB + T_SOUT, x = { i, t0, t1: t0 + d }; t0 += d; return x; }); H.span = t0;   // lịch soi: mỗi bộ phận dài theo số chi tiết con
          }
          let gen = null;
          function warm() { if (H.ready) return true; if (!gen) gen = steps(); if (gen.next().done) H.ready = true; return !!H.ready; }   // 1 bộ phận / lần gọi
          const dur = () => T_IN + T_EX + H.span + T_BACK + T_OUT;
          const DCL = new Map();   // nhãn khác đang giấu → lớp cũ
          function declutter(on) {
            if (!on) { for (const [o, m] of DCL) o.layers.mask = m; DCL.clear(); return; }
            scene.traverse(o => { if (DCL.has(o) || !(o.isSprite || o.isLine) || !o.material || !(o.material.depthTest === false || o.userData.label)) return;
              for (let p = o; p; p = p.parent) if (p === H.g || p === H.labG) return;
              DCL.set(o, o.layers.mask); o.layers.set(31); });
          }
          // ---- NHÃN NGOÀI: 2 cột ngoài hộp bao hình trên màn hình, đường dẫn từ tâm chi tiết, xếp theo độ cao điểm neo, trượt êm · tên máy giữa trên đỉnh ----
          const toPx = (v, out) => { const n = _c.copy(v).project(camera); out.x = (n.x + 1) / 2 * W(); out.y = (1 - n.y) / 2 * Hv(); out.z = n.z; return out; };
          const toW = (x, y, z, out) => out.set(x / W() * 2 - 1, 1 - y / Hv() * 2, z).unproject(camera);
          function layout(dt) {
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), act = [], tOp = H.title.userData.op || 0;
            for (const p of H.parts) { if (p.lab.userData.op > 0.01) act.push({ lab: p.lab, anc: p.g.localToWorld(new THREE.Vector3().copy(p.ctr)), h: LAB_H });
              for (const q of p.subs) if (q.lab.userData.op > 0.01) act.push({ lab: q.lab, anc: p.g.localToWorld(new THREE.Vector3().copy(q.ctr).addScaledVector(q.dir, SUB_D * (q.ks || 0))), h: SUBLAB_H }); }
            for (const p of H.parts) for (const l of [p.lab, ...p.subs.map(q => q.lab)]) if (!act.some(a => a.lab === l)) { l.material.opacity = 0; l.visible = false; }
            const LP = H.lead.geometry.attributes.position; let nl = 0;
            if (act.length || tOp > 0.01) {
              _box.makeEmpty(); H.g.traverse(o => { if (o.isMesh && o.material.opacity > 0.05) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); _box.union(_tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); } });   // hộp bao phần đang hiện
              let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, zc = 0; const pt = { x: 0, y: 0, z: 0 };
              if (!_box.isEmpty()) for (let i = 0; i < 8; i++) { toPx(_b.set(i & 1 ? _box.max.x : _box.min.x, i & 2 ? _box.max.y : _box.min.y, i & 4 ? _box.max.z : _box.min.z), pt); x0 = Math.min(x0, pt.x); x1 = Math.max(x1, pt.x); y0 = Math.min(y0, pt.y); y1 = Math.max(y1, pt.y); zc += pt.z / 8; }
              else { toPx(H.g.position, pt); x0 = x1 = pt.x; y0 = y1 = pt.y; zc = pt.z; }
              const cx = (x0 + x1) / 2, cols = { L: [], R: [] };
              if (tOp > 0.01) { const w = LAB_H * 1.15 * 384 / 72, U = H.title.userData; toW(Math.max(w / 2 + 8, Math.min(W() - w / 2 - 8, cx)), Math.max(LAB_H, y0 - 30), zc, H.title.position); H.title.scale.set(w * upp, LAB_H * 1.15 * upp, 1); H.title.material.opacity = tOp; H.title.visible = true; U.sx = undefined; }
              for (const a of act) { toPx(a.anc, a.px = {}); const U = a.lab.userData; let side = U.side || (a.px.x < cx ? 'L' : 'R'); if (side === 'L' && a.px.x > cx + 40) side = 'R'; else if (side === 'R' && a.px.x < cx - 40) side = 'L'; U.side = side; cols[side].push(a); }   // giữ cột cũ (không nhảy qua lại)
              for (const [A, Bc, sB] of [['L', 'R', 'R'], ['R', 'L', 'L']]) while (cols[A].length - cols[Bc].length > 2) {   // cân 2 cột: chuyển nhãn có neo gần giữa nhất sang cột ít hơn
                let bi = 0; cols[A].forEach((a, i) => { if (Math.abs(a.px.x - cx) < Math.abs(cols[A][bi].px.x - cx)) bi = i; }); const a = cols[A].splice(bi, 1)[0]; a.lab.userData.side = sB; cols[Bc].push(a); }
              for (const sd of ['L', 'R']) { const C = cols[sd].sort((a, b) => a.px.y - b.px.y); let y = -1e9;
                for (const a of C) { a.y = Math.max(a.px.y, y + a.h / 2 + LAB_GAP); y = a.y + a.h / 2; }   // xếp xuống theo độ cao neo, không chồng
                const over = y - Math.min(Hv() - 8, y1 + 80); if (over > 0) for (const a of C) a.y -= over;   // tràn đáy: dồn cả cột lên
                for (const a of C) { const w = a.h * 384 / 72, U = a.lab.userData, tx = sd === 'L' ? Math.max(w / 2 + 8, x0 - LAB_MARGIN - w / 2) : Math.min(W() - w / 2 - 8, x1 + LAB_MARGIN + w / 2), ty = Math.max(a.h / 2 + 8, a.y);
                  const k = U.sx === undefined || U.op0 < 0.02 ? 1 : 1 - Math.exp(-dt * 10); U.sx = (U.sx ?? tx) + (tx - (U.sx ?? tx)) * k; U.sy = (U.sy ?? ty) + (ty - (U.sy ?? ty)) * k; U.op0 = U.op;   // trượt êm
                  toW(U.sx, U.sy, zc, a.lab.position); a.lab.scale.set(w * upp, a.h * upp, 1); a.lab.material.opacity = U.op; a.lab.visible = true;
                  if (nl < 96) { const ex = sd === 'L' ? U.sx + w / 2 : U.sx - w / 2; toW(ex, U.sy, zc, _b); LP.setXYZ(nl * 2, a.anc.x, a.anc.y, a.anc.z); LP.setXYZ(nl * 2 + 1, _b.x, _b.y, _b.z); nl++; } } }
            }
            if (tOp <= 0.01) { H.title.material.opacity = 0; H.title.visible = false; }
            for (let i = nl * 2; i < 192; i++) LP.setXYZ(i, 0, -1e4, 0);   // đường dẫn thừa: giấu dưới đất
            LP.needsUpdate = true; H.lead.geometry.setDrawRange(0, nl * 2); H.lead.material.opacity = 0.7 * Math.min(1, act.reduce((m, a) => Math.max(m, a.lab.userData.op), 0));
          }
          function start(e) {   // gọi 1 lần khi vào pha 'holo': đặt hình trên đầu, hơi về phía xe; trục dài của máy nằm ngang tầm nhìn
            while (!warm());   // chưa dựng xong (lệnh tới sớm): dựng nốt ngay
            const S = caravanObj.scale.x * ENG_AT.s * 3, hd = e.head.getWorldPosition(_a), y = e.g.rotation.y;
            H.yaw = y + Math.PI / 2; H.base.set(hd.x + Math.sin(y) * 0.2, hd.y + 1.55, hd.z + Math.cos(y) * 0.2);   // trên hẳn bong bóng suy nghĩ (24/10: 0,75 → 1,55 — bong bóng không đè đáy hình)
            H.g.scale.setScalar(S); H.g.position.copy(H.base); H.g.rotation.set(0, H.yaw, 0); H.t = 0; H.on = true; H.done = false; H.cur = H.sub = -1; H.g.visible = H.labG.visible = true; H.dclT = -9;
            return true;
          }
          function stop() { H.on = false; if (H.g) H.g.visible = H.labG.visible = false; declutter(false); if (H.lgv !== undefined) { labelGroup.visible = H.lgv; H.lgv = undefined; } }
          function tick(e, dt, t) {   // → { look: điểm nhìn, point: điểm chỉ tay | null, part, idx, sub: chi tiết con đang soi | null, sidx } ; H.done khi diễn xong
            if (!H.on) return null; H.t += dt; const u = H.t, D = dur();
            if (H.t - H.dclT > 2) { H.dclT = H.t; declutter(true); }   // giấu nhãn khác (dò lại mỗi 2 s)
            if (H.lgv === undefined) H.lgv = labelGroup.visible; labelGroup.visible = false;   // nhóm nhãn cảnh tắt mỗi khung (nhãn tạo giữa chừng — 'Click' khi zoom gần — cũng ẩn); tắt hình thì trả nút "Nhãn" như cũ
            const tEx = T_IN, tAn = T_IN + T_EX, tBk = tAn + H.span, tOut = tBk + T_BACK;
            const fade = u < tEx ? ease(u / 1.2) : u > tOut ? 1 - ease((u - tOut) / T_OUT) : 1, xk = u < tEx ? 0 : u < tAn ? back((u - tEx) / T_EX) : u < tBk ? 1 : 1 - ease((u - tBk) / T_BACK);
            const E = u >= tAn && u < tBk ? H.tl.find(x => u - tAn >= x.t0 && u - tAn < x.t1) : null, cur = E ? E.i : -1, lu = E ? u - tAn - E.t0 : 0, dP = E ? E.t1 - E.t0 : 0, P = cur >= 0 ? H.parts[cur] : null;
            const ks = P ? ease((lu - T_HI) / T_SIN) * (1 - ease((lu - (dP - T_SOUT)) / T_SOUT)) : 0;   // chi tiết con toả ra → thu về
            const si = P && lu >= T_HI + T_SIN && lu < dP - T_SOUT ? Math.min(P.subs.length - 1, Math.floor((lu - T_HI - T_SIN) / T_SUB)) : -1;
            H.cur = cur; H.sub = si; H.title.userData.op = fade * (cur < 0 ? 0.95 : 0);   // tên máy: lúc hiện, tách, lắp lại
            // bàn xoay: quay chậm lúc hiện, rồi dừng ở góc ¾ cho dễ nhìn lúc tách
            const spin = u < tEx ? 1.1 * (1 - u / tEx) * u : 1.1 * tEx / 2; H.g.rotation.y = H.yaw - 0.5 + spin + 0.04 * Math.sin(t * 0.6);
            H.g.position.copy(H.base).setY(H.base.y + 0.04 * Math.sin(t * 1.3) + 0.25 * (1 - fade));   // lơ lửng nhấp nhô; hiện lên từ thấp
            for (const [i, p] of H.parts.entries()) {
              const hi = i === cur, dim = cur < 0 ? 1 : hi ? 1 : 0.5 - 0.25 * ks;   // bộ phận khác mờ đi, mờ hơn lúc đang tách chi tiết
              p.g.position.copy(p.off).multiplyScalar(xk); p.g.rotation.y = 0.15 * xk * Math.sign(p.off.x || p.off.z || 1) * (p.k === 'block' ? 0 : 1);
              p.subs.forEach((q, j) => { const on = hi && j === si; q.ks = hi ? ks : 0;
                q.g.position.copy(q.dir).multiplyScalar(SUB_D * q.ks);
                for (const m of q.mats) { m.opacity = fade * Math.min(1, 1.5 * (hi ? 0.95 : 0.85 * dim)); m.emissiveIntensity = hi ? (on ? 0.6 : 0.34) : 0.22; m.color.copy(m.userData.base).lerp(WHITE, on ? 0.35 : 0); }   // ×1,5 rõ hơn (G 24/10), màu theo hệ, sáng đều không nhấp nháy
                q.line.opacity = fade * (hi ? (on ? 1 : 0.8) : 0.6 * dim);   // nét viền theo độ rõ của khối
                q.lab.userData.op = fade * (hi ? ks * (on ? 1 : 0.55) : 0); q.lab.userData.on = on; });
              if (hi || p.br.material.opacity > 0) { const A = p.br.geometry.attributes.position; p.subs.forEach((q, j) => { A.setXYZ(j * 2, p.ctr.x, p.ctr.y, p.ctr.z); _b.copy(q.ctr).addScaledVector(q.dir, SUB_D * ks); A.setXYZ(j * 2 + 1, _b.x, _b.y, _b.z); }); A.needsUpdate = true; }
              p.br.material.opacity = fade * (hi ? 0.55 * ks : 0);
              p.lab.userData.op = fade * (hi ? 1 - ks : cur < 0 && xk > 0.95 && u < tAn + 1.6 ? 0.9 : 0);   // tách xong: hiện hết nhãn 1,6 s, rồi chỉ nhãn bộ phận đang soi (ẩn khi chi tiết con toả ra)
            }
            H.g.updateMatrixWorld(true); layout(dt);
            if (u >= D) { stop(); H.done = true; }
            const Q = si >= 0 ? P.subs[si] : null;
            const look = Q ? P.g.localToWorld(_a.copy(Q.ctr).addScaledVector(Q.dir, SUB_D * ks)) : P ? H.g.localToWorld(_a.copy(P.ctr).add(_b.copy(P.off).multiplyScalar(xk))) : H.g.localToWorld(_a.set(0, 0.35, 0));
            return { look, point: Q ? look : null, part: P, idx: cur, sub: Q, sidx: si };
          }
          return { start, stop, tick, warm, state: H, dur };
        })();
