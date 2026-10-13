        // ===== ĐẦM SEN (Nelumbo nucifera) — hồ hạ lưu, quanh góc (73, _, 113) =====
        // Dựng theo mô tả thực vật (Flora of China · Kew POWO · các nghiên cứu sinh nhiệt ở hoa sen):
        //  · LÁ hình khiên: cuống đính giữa phiến, phiến tròn nguyên (không có khía như lá súng); ~20 gân chính toả từ rốn lá, rẽ đôi gần mép.
        //    Lá non nổi sát mặt nước; lá trưởng thành vươn cao trên cuống, phiến lõm hình phễu, mép lượn sóng, rủ một bên;
        //    mặt lá phủ sáp xanh lơ, không thấm nước → sương/mưa đọng thành giọt tròn lăn về lòng lá.
        //  · HOA đơn độc trên cuống dài vượt khỏi tán lá: vài đài ngoài giống lá + ~18 cánh xếp 3 vòng, hình thìa lõm lòng thuyền,
        //    gốc trắng kem → giữa hồng phấn → đầu hồng sen đậm, gân dọc.
        //  · NHỊ (200–400 ở hoa thật, ở đây 40): chỉ nhị vàng mảnh, bao phấn vàng cam, đầu có phần phụ hình chuỳ màu kem.
        //    ĐẾ HOA (gương sen) nón ngược, mặt trên phẳng, lá noãn rời chìm trong đế thành các chấm nổi.
        //  · NHỊP NỞ ~3 ngày: rạng sáng hé nở (đế hoa toả nhiệt, toả hương), chiều khép lại; ngày 2 nở rộng nhất;
        //    ngày 3 bung hết, không khép kín được nữa, cánh rụng trôi trên mặt nước. Sau đó gương sen lớn dần, xanh rồi nâu, gục đầu.
        const lotusPond = (() => {
          const rnd = mulberry32(5150), C0x = X0 + 73, C0z = Z0 + 113, pond = new THREE.Group(); pond.name = 'Đầm sen';
          const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
          const clampA = (x, m) => Math.max(-m, Math.min(m, x));
          const col = h => new THREE.Color(h);

          // --- vân lá: vẽ canvas 1 lần, dùng chung (mỗi lá xoay một góc khác) ---
          const leafTex = (() => {
            const N = 256, R = N / 2, c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d'), r2 = mulberry32(31);
            const g = x.createRadialGradient(R, R, 0, R, R, R);
            g.addColorStop(0, '#d6dc93'); g.addColorStop(0.05, '#a9c47c'); g.addColorStop(0.11, '#5f9867'); g.addColorStop(0.6, '#4f8b5c'); g.addColorStop(0.93, '#437d4f'); g.addColorStop(1, '#6f8c4a');
            x.fillStyle = g; x.fillRect(0, 0, N, N);
            for (let i = 0; i < 320; i++) {   // lớp sáp xanh lơ loang lổ
              const a = r2() * 6.2832, r = Math.sqrt(r2()) * R * 0.96;
              x.fillStyle = `rgba(${(150 + r2() * 40) | 0},${(185 + r2() * 30) | 0},${(175 + r2() * 35) | 0},${(0.04 + r2() * 0.06).toFixed(3)})`;
              x.beginPath(); x.arc(R + Math.cos(a) * r, R + Math.sin(a) * r, 3 + r2() * 10, 0, 6.2832); x.fill();
            }
            x.lineCap = 'round';
            const seg = (a0, a1, r0, r1, w, c) => {
              const am = (a0 + a1) / 2 + 0.02, rm = (r0 + r1) / 2;   // gân hơi cong
              x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(R + Math.cos(a0) * r0, R + Math.sin(a0) * r0);
              x.quadraticCurveTo(R + Math.cos(am) * rm, R + Math.sin(am) * rm, R + Math.cos(a1) * r1, R + Math.sin(a1) * r1); x.stroke();
            };
            const NV = 21, ang = Array.from({ length: NV }, (_, k) => (k + (r2() - 0.5) * 0.35) / NV * 6.2832);
            for (const dark of [1, 0]) {   // rãnh gân sẫm (lệch 1 px) rồi gân sáng: gân chính → rẽ đôi ở 58% → rẽ đôi lần nữa sát mép
              const c = dark ? 'rgba(38,78,44,0.28)' : 'rgba(205,226,165,0.42)', s = dark ? 1.4 : 0.85;
              x.save(); if (dark) x.translate(1.2, 1.2);
              for (const a of ang) {
                seg(a, a, R * 0.07, R * 0.58, 2.6 * s, c);
                for (const d of [-1, 1]) { const a1 = a + d * 0.07; seg(a, a1, R * 0.58, R * 0.82, 1.6 * s, c); for (const e of [-1, 1]) seg(a1, a1 + e * 0.035, R * 0.82, R * 0.97, 0.9 * s, c); }
              }
              x.restore();
            }
            x.fillStyle = '#e4e2a4'; x.beginPath(); x.arc(R, R, R * 0.045, 0, 6.2832); x.fill();   // rốn lá (chỗ cuống đính bên dưới)
            x.strokeStyle = 'rgba(70,110,60,0.5)'; x.lineWidth = 1.5; x.beginPath(); x.arc(R, R, R * 0.065, 0, 6.2832); x.stroke();
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
          })();

          const M = {
            leaf: new THREE.MeshLambertMaterial({ map: leafTex }),
            under: new THREE.MeshLambertMaterial({ color: 0x8aa784, side: THREE.BackSide }),   // mặt dưới lá nhạt, xám xanh
            stem: new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }),
            petal: new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }),
            core: new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true }),
            bead: new THREE.MeshPhongMaterial({ color: 0xe4f4ea, specular: 0xffffff, shininess: 160, transparent: true }),   // giọt nước trên lá sáp: tròn như bi thuỷ tinh — lòng trong, viền tối, đốm phản chiếu trắng
          };
          for (const k in M) M[k].name = 'sen: ' + k;
          M.bead.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
            float fr = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 1.5);   // giữa giọt: thấu kính hội tụ → sáng, thấy lá · mép: khúc xạ nền tối → viền sẫm
            vec3 dif = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
            gl_FragColor = vec4(mix(dif * 1.12, dif * 0.32, smoothstep(0.35, 0.9, fr)) + reflectedLight.directSpecular * 1.7 + reflectedLight.indirectSpecular, mix(0.4, 0.95, fr));`); };

          // --- tiện ích hình học ---
          function paint(geo, f) {   // màu đỉnh: f(x, y, z) → THREE.Color
            const P = geo.attributes.position, a = new Float32Array(P.count * 3);
            for (let i = 0; i < P.count; i++) { const c = f(P.getX(i), P.getY(i), P.getZ(i)); a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
            geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo;
          }
          const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
          const at = (geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) => geo.applyMatrix4(_m4.compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz)));
          const merge = list => { const g = mergeGeometries(list, false); for (const q of list) q.dispose(); return g; };

          function leafGeo(R, aerial) {   // phiến khiên tròn: lưới cực 7 vòng × 44 tia · lá vươn lõm phễu + rủ 1 bên · mép lượn sóng
            const RS = 7, AS = 44, pos = [0, 0, 0], uv = [0.5, 0.5], idx = [];
            const p1 = rnd() * 6.28, p2 = rnd() * 6.28, nw = 5 + ((rnd() * 4) | 0), wa = aerial ? 0.05 + rnd() * 0.04 : 0.014, tilt = rnd() * 6.28, droop = aerial ? 0.06 + rnd() * 0.12 : 0;
            const hf = (f, th, lip = 1) => lip * (aerial ? R * 0.3 * Math.pow(f, 1.5) : R * 0.06 * Math.pow(f, 6))   // lòng phễu · lá nổi chỉ vểnh mép
              + wa * R * Math.pow(f, 3) * (Math.sin(th * nw + p1) + 0.5 * Math.sin(th * (nw + 3) + p2)) - droop * R * Math.pow(f, 2.5) * Math.max(0, Math.cos(th - tilt));
            for (let r = 1; r <= RS; r++) {
              const f = r / RS;
              for (let a = 0; a < AS; a++) { const th = a / AS * 6.2832; pos.push(Math.cos(th) * R * f, hf(f, th), Math.sin(th) * R * f); uv.push(0.5 + 0.5 * f * Math.cos(th), 0.5 + 0.5 * f * Math.sin(th)); }
            }
            const V = (r, a) => 1 + (r - 1) * AS + (a % AS);
            for (let a = 0; a < AS; a++) idx.push(0, V(1, a + 1), V(1, a));
            for (let r = 2; r <= RS; r++) for (let a = 0; a < AS; a++) idx.push(V(r - 1, a), V(r - 1, a + 1), V(r, a), V(r - 1, a + 1), V(r, a + 1), V(r, a));
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
            g.userData.leaf = { tilt, h: (x, z, lip) => hf(Math.min(1, Math.hypot(x, z) / R), Math.atan2(z, x), lip) };   // độ cao mặt lá tại (x, z) hệ lá · hướng mép rủ
            return g;
          }

          const cCream = col(0xf7f1d0), cBlush = col(0xf9d3df), cPink = col(0xf09bbd), cDeep = col(0xd8407f), cSep0 = col(0x8fae5a), cSep1 = col(0xb98a7a);
          const petalStops = (t, e, c) => {   // gốc kem → hồng phấn → đầu hồng sen; mép đậm hơn lòng cánh
            if (t < 0.3) c.copy(cCream).lerp(cBlush, sm(0.04, 0.3, t)); else if (t < 0.7) c.copy(cBlush).lerp(cPink, sm(0.3, 0.7, t)); else c.copy(cPink).lerp(cDeep, sm(0.7, 1, t));
            c.lerp(cDeep, 0.22 * e * e * sm(0.35, 1, t));
          };
          const sepalStops = (t, e, c) => c.copy(cSep0).lerp(cSep1, sm(0.3, 1, t));
          function petalGeo(inc, cup, stops) {   // dài 1 theo +y, rộng nhất ~55% chiều dài (trứng ngược), lòng thuyền + đầu cong vào phía tâm hoa (−z)
            const NL = 10, NW = 8, pos = [], cl = [], idx = [], c = new THREE.Color();
            for (let i = 0; i <= NL; i++) {
              const t = i / NL, hw = 0.3 * Math.pow(Math.sin(Math.PI * Math.pow(t, 1.15)), 0.62) + 0.05 * (1 - t);
              for (let j = 0; j <= NW; j++) {
                const s = j / NW * 2 - 1, e = Math.abs(s);
                pos.push(s * hw, t, -(cup * hw * s * s + inc * Math.pow(t, 2.5)));
                stops(t, e, c); if (j % 2 === 0 && t > 0.15 && t < 0.95 && e < 0.85) c.multiplyScalar(0.94);   // gân dọc
                cl.push(c.r, c.g, c.b);
              }
            }
            for (let i = 0; i < NL; i++) for (let j = 0; j < NW; j++) { const a = i * (NW + 1) + j, b = a + 1, d = a + NW + 1; idx.push(a, b, d, b, d + 1, d); }
            const g = new THREE.BufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3)); g.setIndex(idx); g.computeVertexNormals();
            return g;
          }
          function coreGeo(k, fresh) {   // gương sen: nón ngược, mặt phẳng + lá noãn chìm (fresh: vàng lúc hoa nở · không: gương xanh, hạt sẫm trong lỗ)
            const side = fresh ? col(0xe6cd3e) : col(0x6f9a3e), top = fresh ? col(0xd9dc6a) : col(0x86ad4c), dot = fresh ? col(0xf2e88a) : col(0x3f4f22);
            const prof = [[0.02, 0], [0.03, 0.02], [0.055, 0.06], [0.08, 0.1], [0.092, 0.118], [0.088, 0.128], [0.07, 0.132], [0, 0.132]].map(([r, y]) => new THREE.Vector2(r * k, y * k));
            const parts = [paint(new THREE.LatheGeometry(prof, 18), (x, y) => y > 0.13 * k ? top : side)];
            for (const [r, n] of [[0, 1], [0.035, 6], [0.064, 10]]) for (let i = 0; i < n; i++) {
              const a = i / n * 6.2832 + r * 20;
              parts.push(at(paint(new THREE.SphereGeometry(0.011 * k, 6, 4), () => dot), Math.cos(a) * r * k, 0.132 * k, Math.sin(a) * r * k, 0, 0, 0, 1, fresh ? 0.6 : 0.35, 1));
            }
            return merge(parts);
          }
          function stamenGeo() {   // 40 nhị quanh chân đế: chỉ vàng mảnh ngả ra ngoài, bao phấn vàng cam, phần phụ hình chuỳ màu kem
            const fil = col(0xf3d055), anth = col(0xeeb23a), app = col(0xfaf3da), parts = [];
            for (let i = 0; i < 40; i++) {
              const a = i / 40 * 6.2832 + rnd() * 0.1, r0 = 0.05 + (i % 2) * 0.012, lean = 0.55 + rnd() * 0.25, L = 0.075 + rnd() * 0.02, x = Math.cos(a) * r0, z = Math.sin(a) * r0;
              parts.push(at(paint(new THREE.CylinderGeometry(0.0035, 0.0045, L, 3).translate(0, L / 2, 0), () => fil), x, 0, z, 0, -a, -lean));
              parts.push(at(paint(new THREE.CylinderGeometry(0.007, 0.006, 0.035, 4).translate(0, L + 0.0175, 0), () => anth), x, 0, z, 0, -a, -lean));
              parts.push(at(paint(new THREE.SphereGeometry(0.0075, 5, 3).scale(1, 1.7, 1).translate(0, L + 0.045, 0), () => app), x, 0, z, 0, -a, -lean + 0.25));
            }
            return merge(parts);
          }

          const geoPetal = [petalGeo(0.08, 0.55, petalStops), petalGeo(0.16, 0.6, petalStops), petalGeo(0.26, 0.65, petalStops)], geoSepal = petalGeo(0.02, 0.4, sepalStops);
          const geoCore = coreGeo(0.78, true), geoPod = coreGeo(1.3, false), geoStamen = stamenGeo(), geoBead = new THREE.SphereGeometry(1, 12, 8);
          const WHORL = [   // vòng: số cánh · bán kính chân · độ cao chân · dài · hệ số rộng · góc nghiêng khép (a0) / nở (a1)
            { n: 3, r: 0.045, y: 0, L: 0.17, w: 0.85, a0: 0.9, a1: 2.0, g: geoSepal },   // đài ngoài: luôn ngả ra
            { n: 6, r: 0.06, y: 0.005, L: 0.44, w: 1, a0: 0.13, a1: 1.32, g: geoPetal[0] },
            { n: 6, r: 0.05, y: 0.015, L: 0.42, w: 0.95, a0: 0.07, a1: 1.1, g: geoPetal[1] },
            { n: 6, r: 0.04, y: 0.025, L: 0.36, w: 0.9, a0: 0.03, a1: 0.88, g: geoPetal[2] }   // nở hẳn: lộ gương sen + vòng nhị,
          ];
          const cStem = col(0x5d8c3c), cPrick = col(0x3d5a26);

          // --- dựng cây ---
          const floats = [], stalks = [], flowers = [], pads = [];   // pads: lá hứng được giọt nước
          const inWater = (dx, dz, r) => { for (let k = 0; k <= 8; k++) { const a = k / 8 * 6.2832, rr = k ? r : 0, x = C0x + dx + Math.cos(a) * rr, z = C0z + dz + Math.sin(a) * rr; if (!waterCell(Math.round(x2gi(x)), Math.round(z2gj(z)))) return false; } return true; };
          function stalk(dx, dz, H, r, lean, k) {   // cuống mọc từ bùn đáy: cong nhẹ, gai li ti (đốm sẫm), phần chìm thấy mờ qua nước; gốc lắc quanh mặt nước theo gió
            const g = new THREE.Group(); g.position.set(C0x + dx, lakeY, C0z + dz); pond.add(g);
            const la = rnd() * 6.2832, lx = Math.cos(la) * lean, lz = Math.sin(la) * lean;
            const top = new THREE.Vector3(lx, H, lz), pts = [new THREE.Vector3(-lx * 0.4, -0.6, -lz * 0.4), new THREE.Vector3(0, 0, 0), new THREE.Vector3(lx * 0.4, H * 0.55, lz * 0.4), top];
            const m = new THREE.Mesh(paint(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, r, 5, false), () => rnd() < 0.08 ? cPrick : cStem), M.stem); m.castShadow = true; g.add(m);
            const s = { g, H, k, sx: 0, sz: 0, f: 1.3 + rnd() * 0.9, ph: rnd() * 6.28 }; stalks.push(s);
            return { g, top, lx, lz };
          }
          function flowerHead(kind) {   // 'bud' búp · 'flower' hoa · 'pod' gương sen
            const head = new THREE.Group(), petals = [];
            if (kind === 'pod') { const p = new THREE.Mesh(geoPod, M.core); p.castShadow = true; head.add(p); return { head, petals }; }
            WHORL.forEach((W, wi) => {
              if (kind === 'bud' && wi === 3) return;   // búp: vòng trong khuất hẳn
              const off = wi * 0.52 + rnd() * 0.3;
              for (let i = 0; i < W.n; i++) {
                const pv = new THREE.Group(), m = new THREE.Mesh(W.g, M.petal), L = W.L * (0.92 + rnd() * 0.16);
                pv.rotation.y = off + i / W.n * 6.2832 + (rnd() - 0.5) * 0.12; pv.position.y = W.y; head.add(pv);
                m.position.z = W.r; m.scale.set(L * W.w, L, L); m.castShadow = true; pv.add(m);
                petals.push({ m, wi, a0: W.a0 + (rnd() - 0.5) * 0.08, a1: W.a1 + (rnd() - 0.5) * 0.18 });
              }
            });
            if (kind !== 'flower') return { head, petals };
            const core = new THREE.Mesh(geoCore, M.core); core.castShadow = true; head.add(core);
            const st = new THREE.Mesh(geoStamen, M.core); st.position.y = 0.01; head.add(st);
            return { head, petals, stamen: st };
          }
          function plantFlower(dx, dz, H, kind, age) {
            if (!inWater(dx, dz, 0.3)) return null;
            const S = stalk(dx, dz, H, kind === 'pod' ? 0.021 : 0.026, kind === 'pod' ? 0.35 : 0.08 + rnd() * 0.14, 0.03), F = flowerHead(kind);
            F.head.position.copy(S.top); F.head.scale.setScalar(kind === 'bud' ? 0.72 : 0.9);
            F.head.rotation.set(S.lz / H * 0.6, 0, -S.lx / H * 0.6);
            if (kind === 'pod') F.head.rotation.set(S.lz / H * 2.2, 0, -S.lx / H * 2.2);   // gương già nặng hạt: gục đầu theo hướng cuống ngả
            S.g.add(F.head);
            if (kind === 'flower' && age === 2) F.petals.splice(3 + ((rnd() * 6) | 0), 1)[0].m.visible = false;   // ngày 3: đã rụng 1 cánh vòng ngoài (sau 3 đài) (trôi trên mặt nước)
            const fl = { ...F, kind, age, o: null }; flowers.push(fl); return fl;
          }
          function plantLeaf(dx, dz, R, H) {   // H = 0: lá nổi · H > 0: lá vươn trên cuống
            if (!inWater(dx, dz, H ? 0.3 : R * 0.9)) return;
            const geo = leafGeo(R, H > 0), top = new THREE.Mesh(geo, M.leaf); top.rotation.y = rnd() * 6.28; top.receiveShadow = true;
            if (!H) {   // nổi: theo mặt nước mô phỏng; cuống chìm cong xuống bùn
              const g = new THREE.Group(); g.position.set(C0x + dx, lakeY, C0z + dz); pond.add(g); top.position.y = 0.03; g.add(top);   // cao hơn đỉnh gợn sóng của shader nước
              const a = rnd() * 6.28, pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.1, -0.3, Math.sin(a) * 0.1), new THREE.Vector3(Math.cos(a) * 0.3, -0.9, Math.sin(a) * 0.3)];
              g.add(new THREE.Mesh(paint(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.02, 4, false), () => cStem), M.stem));
              floats.push({ g, ph: rnd() * 6.28 });
              pads.push({ top, R, L: null, h: geo.userData.leaf.h, beads: [], seed: [[0, 0, 0.02]], Vd: Math.pow(0.04 * R / 0.5, 3), V: 0, bt: 0, bv: 0, dump: 0 }); return;
            }
            const S = stalk(dx, dz, H, 0.024, 0.06 + rnd() * 0.1, 0.022), L = new THREE.Group();
            L.position.copy(S.top).y += 0.025; L.rotation.set((rnd() - 0.5) * 0.5, 0, (rnd() - 0.5) * 0.5); S.g.add(L);
            top.castShadow = true; L.add(top); const un = new THREE.Mesh(geo, M.under); un.rotation.y = top.rotation.y; un.castShadow = true; L.add(un);
            const seed = [];
            for (let i = 0; i < 1 + ((rnd() * 3) | 0); i++) {   // chỗ giọt sương / mưa còn đọng khi mở trang: giọt lớn ở rốn, giọt nhỏ quanh
              const a = rnd() * 6.28, r = i ? R * (0.12 + rnd() * 0.25) : R * 0.03, s = i ? 0.012 + rnd() * 0.01 : 0.03 + rnd() * 0.012;
              seed.push([Math.cos(a) * r, Math.sin(a) * r, s]);
            }
            const az = geo.userData.leaf.tilt - top.rotation.y;   // hướng mép rủ trong hệ nhóm lá L: phía lá nghiêng đổ nước
            pads.push({ top, R, L, rx0: L.rotation.x, rz0: L.rotation.z, dx: Math.cos(az), dz: Math.sin(az), h: geo.userData.leaf.h, beads: [], seed, Vd: Math.pow((0.06 + 0.02 * Math.random()) * Math.max(0.75, R / 0.8), 3), V: 0, bt: 0, bv: 0, dump: 0 });
          }

          // bố cục quanh tâm (dx, dz so với góc 73, 113): lá nổi · lá vươn · hoa (tuổi 0–2 = ngày nở 1–3) · búp · gương sen · cánh rụng
          for (const [dx, dz, R] of [[-0.6, 0, 0.72], [2.5, 1.4, 0.6], [-2.4, 2.6, 0.66], [1, 3.9, 0.55], [4.1, 3, 0.62], [-1.5, -1.4, 0.5], [0.9, -1, 0.42], [4.6, 0.6, 0.48], [-2.9, 0.4, 0.52], [3, 4.8, 0.45], [-0.4, 5.3, 0.5]]) plantLeaf(dx, dz, R, 0);
          for (const [dx, dz, R, H] of [[1, 1.7, 0.85, 0.8], [-1.1, 1.9, 0.95, 1.1], [3, 2.5, 0.72, 0.55], [-2.3, 4.3, 0.8, 0.85], [0.3, 4.6, 0.68, 0.6], [1.6, -1.6, 0.6, 0.5]]) plantLeaf(dx, dz, R, H);
          for (const [dx, dz, H, age] of [[0.2, 0.9, 1.5, 1], [-1.8, 1, 1.3, 0], [2.1, 3.4, 1.35, 2], [-0.7, 3.4, 1.65, 1]]) plantFlower(dx, dz, H, 'flower', age);
          for (const [dx, dz, H] of [[1.6, 0.2, 1.25], [-3.3, 1.6, 1.05], [3.5, 4, 0.95]]) plantFlower(dx, dz, H, 'bud', 0);
          plantFlower(-1.4, 4.6, 1.35, 'pod', 0);
          for (const [dx, dz] of [[2.6, 3.9], [1.7, 4.4], [2.9, 3.1]]) {   // cánh rụng nổi ngửa như con thuyền
            if (!inWater(dx, dz, 0.2)) continue;
            const g = new THREE.Group(); g.position.set(C0x + dx, lakeY, C0z + dz); pond.add(g);
            const m = new THREE.Mesh(geoPetal[0], M.petal), L = 0.38 + rnd() * 0.06; m.scale.set(L, L, L); m.rotation.set(Math.PI / 2 - 0.08, rnd() * 6.28, 0, 'YXZ'); m.position.y = 0.035; g.add(m);
            floats.push({ g, ph: rnd() * 6.28 });
          }
          scene.add(pond);

          // --- GIỌT NƯỚC TRÊN LÁ (hiệu ứng lá sen) ---
          //  Mặt lá: gai thịt 10–20 µm phủ sáp → giọt chỉ chạm đỉnh gai (trạng thái Cassie), góc tiếp xúc >160°, giọt cỡ 1 cm nghiêng ~2° đã lăn.
          //  · góc trượt theo Furmidge: lực bám mép giọt ∝ r, trọng lượng ∝ r³ ⇒ sin(góc trượt) ∝ 1/r² — giọt li ti đọng lại, giọt nặng mới lăn.
          //  · hạt mưa chạm lá: nảy rồi đậu lại, ~1/3 vỡ toé thành 3 giọt nhỏ; trúng giọt có sẵn thì nhập vào, giọt đó rung + giật nhẹ.
          //  · giọt lăn theo dốc thật của mặt lá (gia tốc lăn 5/7·g·sinα), gió đẩy giọt nhỏ; chạm nhau thì gộp (cộng thể tích, rung rồi tắt).
          //  · giọt nhỏ tròn như bi; giọt lớn dẹt thành vũng, dày tối đa ≈ 2 lần độ dài mao dẫn (ở đây phóng to ~6 lần cho dễ thấy).
          //  · lá vươn: nước dồn về rốn làm lá trĩu dần; đủ nặng thì lá nghiêng hẳn về phía mép rủ, cuống cong — vũng lăn khỏi mép rơi
          //    xuống hồ (gợn sóng thật) rồi lá bật về, nhún vài nhịp. Lá nổi: giọt trôi theo dốc sóng, đầy thì tràn qua mép.
          //  · sương đêm ngưng thành hạt li ti lớn dần; trời khô thì bay hơi (nắng nhanh hơn).
          const BEAD_MAX = 700, PAD_MAX = 36, RAIN_R = 0.011, HMAX = 0.045, G7 = 9.81 * 5 / 7;   // cỡ giọt phóng to theo lá (lá trong cảnh ~3 lần lá thật)
          const dropMesh = (geo, n, name) => { const m = new THREE.InstancedMesh(geo, M.bead, n); m.count = 0; m.visible = false; m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.name = name; m.userData.noBatch = m.userData.noRainOcc = true; pond.add(m); return m; };
          const beadMesh = dropMesh(geoBead, BEAD_MAX, 'Giọt nước trên lá sen'), poolMesh = dropMesh(new THREE.SphereGeometry(1, 32, 14), 64, 'Vũng nước lòng lá sen');   // vũng lớn: lưới mịn cho mép tròn
          const falls = [], _inv = new THREE.Matrix4(), _rl = new THREE.Matrix3(), _rw = new THREE.Matrix3(), _mb = new THREE.Matrix4(), _qb = new THREE.Quaternion();
          const _gl = new THREE.Vector3(), _wl = new THREE.Vector3(), _n = new THREE.Vector3(), _p = new THREE.Vector3(), _sc = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
          const shape = b => { b.c = Math.min(b.r, HMAX / 2); b.a = Math.sqrt(b.r * b.r * b.r / b.c); };   // giữ thể tích: giọt lớn dẹt ra, bề dày chặn ở HMAX
          function addBead(P, x, z, r, vx = 0, vz = 0) {
            const B = P.beads;
            if (B.length >= PAD_MAX) { let q = B[0], d = 1e9; for (const b of B) { const e = (b.x - x) ** 2 + (b.z - z) ** 2; if (e < d) { d = e; q = b; } } q.r = Math.cbrt(q.r ** 3 + r ** 3); q.w = 1; shape(q); return; }
            const b = { x, z, vx, vz, r, w: 0.7, nx: 0, nz: 0, a: 0, c: 0 }; shape(b); B.push(b);
          }
          function seedPad(P, wet) {   // gieo lại theo độ ướt hiện tại (lúc mở trang / tua giờ): giọt lớn ở rốn + vài giọt nhỏ
            P.beads.length = 0; P.bt = P.bv = 0; P.dump = 0;
            if (wet > 0.15) for (const [x, z, s] of P.seed) addBead(P, x, z, s * Math.min(1, wet) * 0.75);
          }
          function impact(P) {   // 1 hạt mưa rơi trúng lá
            const rr = P.R * 0.96 * Math.sqrt(Math.random()), th = Math.random() * 6.2832, x = Math.cos(th) * rr, z = Math.sin(th) * rr, r = RAIN_R * (0.8 + Math.random() * 0.4);
            const hit = P.beads.find(b => (b.x - x) ** 2 + (b.z - z) ** 2 < b.a * b.a);
            if (hit) { hit.r = Math.cbrt(hit.r ** 3 + r ** 3); shape(hit); hit.w = 1; hit.vx += (Math.random() - 0.5) * 0.25; hit.vz += (Math.random() - 0.5) * 0.25; return; }
            const n = Math.random() < 0.35 ? 3 : 1;
            for (let k = 0; k < n; k++) { const a = Math.random() * 6.2832, sp = n > 1 ? 0.2 + Math.random() * 0.3 : 0.03; addBead(P, x, z, n > 1 ? r * 0.7 : r, Math.cos(a) * sp, Math.sin(a) * sp); }
          }
          function stepPad(P, dt, dtr, dew, dry) {   // dt: bước chuyển động (kẹp ≤ 0,05 s) · dtr: thời gian thật cho mưa / sương / bay hơi
            const T = P.top, B = P.beads, e = 0.015, lip = P.L ? 1 : 0.3;   // lá nổi: mép vểnh ít cản giọt hơn (sóng đã làm lá chao)
            T.updateWorldMatrix(true, false); _inv.copy(T.matrixWorld).invert(); _rl.setFromMatrix4(_inv); _rw.setFromMatrix4(T.matrixWorld);
            _gl.set(0, -1, 0).applyMatrix3(_rl);   // trọng lực trong hệ lá
            T.getWorldPosition(_p); windAt(_p.x, _p.y, _p.z, 1, _wl); _wl.y = 0; _wl.applyMatrix3(_rl); const ws = _wl.length();
            for (let lam = rainK * 12 * P.R * P.R * dtr; lam > 0; lam--) if (Math.random() < lam) impact(P);   // số hạt trúng lá ~ cường độ mưa × diện tích (Poisson)
            const cond = dew > 0.5 && rainK < 0.05 && P.V < P.Vd * 0.35;   // sương ngưng (chỉ tới ~1/3 ngưỡng đổ: sương không đủ làm lá nghiêng)
            if (cond && Math.random() < dtr * 0.012 * dew * P.R * P.R) { const rr = P.R * 0.9 * Math.sqrt(Math.random()), th = Math.random() * 6.2832; addBead(P, Math.cos(th) * rr, Math.sin(th) * rr, 0.004 + Math.random() * 0.002); }
            const dr = cond ? dtr * 1.2e-6 * dew : dew > 0.5 ? 0 : dry * dtr;   // sương làm giọt lớn dần · trời khô thì bay hơi
            for (let i = B.length - 1; i >= 0; i--) {
              const b = B[i];
              if (dr) { b.r += dr; if (b.r < 0.0022) { B.splice(i, 1); continue; } shape(b); }
              const hx = (P.h(b.x + e, b.z, lip) - P.h(b.x - e, b.z, lip)) / (2 * e), hz = (P.h(b.x, b.z + e, lip) - P.h(b.x, b.z - e, lip)) / (2 * e);
              _n.set(-hx, 1, -hz).normalize(); b.nx = _n.x; b.nz = _n.z;
              const gn = _gl.dot(_n), tx = _gl.x - gn * _n.x, tz = _gl.z - gn * _n.z, kw = 0.00025 * ws / b.r, sl = Math.min(0.6, 0.035 * (0.012 / b.r) ** 2);
              if (tx * tx + tz * tz < sl * sl && b.vx * b.vx + b.vz * b.vz < 4e-4 && kw * ws < sl * G7) b.vx = b.vz = 0;   // dốc dưới góc trượt của cỡ giọt này: nằm yên
              else { const d = Math.exp(-dt * 1.4); b.vx = (b.vx + (tx * G7 + kw * _wl.x) * dt) * d; b.vz = (b.vz + (tz * G7 + kw * _wl.z) * dt) * d; b.x += b.vx * dt; b.z += b.vz * dt; }
              b.w *= Math.exp(-dt * 4);
              if (b.x * b.x + b.z * b.z > (P.R * 0.975) ** 2 && b.x * b.vx + b.z * b.vz > 0) {   // lăn qua mép lá → rơi tự do
                falls.push({ p: new THREE.Vector3(b.x, P.h(b.x, b.z, 1) + b.c, b.z).applyMatrix4(T.matrixWorld), v: new THREE.Vector3(b.vx, hx * b.vx + hz * b.vz, b.vz).applyMatrix3(_rw), r: b.r });
                B.splice(i, 1);
              }
            }
            for (let i = 0; i < B.length; i++) for (let j = B.length - 1; j > i; j--) {   // giọt chạm nhau thì gộp
              const p = B[i], q = B[j], dx = p.x - q.x, dz = p.z - q.z, s = (p.a + q.a) * 0.85;
              if (dx * dx + dz * dz > s * s) continue;
              const vp = p.r ** 3, vq = q.r ** 3, k = vq / (vp + vq);
              p.x += (q.x - p.x) * k; p.z += (q.z - p.z) * k; p.vx += (q.vx - p.vx) * k; p.vz += (q.vz - p.vz) * k; p.r = Math.cbrt(vp + vq); p.w = 1; shape(p); B.splice(j, 1);
            }
            let V = 0; for (const b of B) V += b.r * b.r * b.r; P.V = V;
            if (P.L) {   // lá vươn trĩu theo lượng nước; quá ngưỡng thì nghiêng đổ, xong bật về nhún vài nhịp
              if (!P.dump && V > P.Vd) P.dump = 1e-3; else if (P.dump && ((P.dump += dt) > 3.5 || V < P.Vd * 0.12)) P.dump = 0;
              const tgt = P.dump ? 0.5 : 0.14 * Math.min(1, V / P.Vd), k = P.dump ? 26 : 34, c = P.dump ? 7 : 3.6;   // đổ ~29° · bật về vọt ~25% rồi tắt
              P.bv += (k * (tgt - P.bt) - c * P.bv) * dt; P.bt += P.bv * dt;
              P.L.rotation.x = P.rx0 + P.bt * P.dz; P.L.rotation.z = P.rz0 - P.bt * P.dx;
            } else if (V > P.Vd && B.length) {   // lá nổi đầy: giọt lớn nhất trôi về phía thấp, tràn qua mép xuống nước
              let q = B[0]; for (const b of B) if (b.r > q.r) q = b;
              const gl = Math.hypot(_gl.x, _gl.z) || 1; q.vx += _gl.x / gl * 0.9 * dt; q.vz += _gl.z / gl * 0.9 * dt;
            }
          }
          let lastH = null;
          function drops(dtr, t, h, dew) {
            const dt = Math.min(dtr, 0.05); dtr = Math.min(dtr, 2);
            if (lastH === null || Math.abs(((h - lastH + 36) % 24) - 12) > 0.5) { const wet = Math.min(1, Math.max(dew, sceneWet * 1.5, rainK)); for (const P of pads) seedPad(P, P.L ? wet : wet * 0.4); falls.length = 0; }   // mở trang / tua giờ (tính vòng 24 h: qua nửa đêm không phải tua)
            lastH = h;
            const dry = rainK < 0.02 && dew < 0.35 ? -(5e-6 + 1.6e-5 * Math.max(0, sunElevSin)) : 0;   // tốc độ bay hơi (bán kính, đv/s)
            for (const P of pads) stepPad(P, dt, dtr, dew, dry);
            for (let i = falls.length - 1; i >= 0; i--) {   // giọt rơi: trọng lực → chạm mặt hồ thì tạo gợn (vũng lớn: vòng sóng thấy rõ)
              const f = falls[i]; f.v.y -= 9.81 * dt; f.p.addScaledVector(f.v, dt);
              const wy = waterSurfaceY(f.p.x, f.p.z);
              if (f.p.y - f.r > wy && f.p.y > lakeY - 1) continue;
              if (f.r > 0.02) waterFx.ring(f.p.x, wy, f.p.z, Math.min(0.35, f.r * 4)); else fluids?.splash(f.p.x, f.p.z, 0.45, 0.006 + f.r);
              falls.splice(i, 1);
            }
            let n = 0, np = 0;
            if (renderer.domElement.height * camera.zoom / (camera.top - camera.bottom) > 40) {   // xa quá thì giọt nhỏ hơn 1 điểm ảnh: khỏi dựng
              for (const P of pads) {
                const T = P.top; _rw.setFromMatrix4(T.matrixWorld);
                for (const b of P.beads) {
                  const big = b.a > 0.03 && np < 64; if (!big && n >= BEAD_MAX) continue;
                  const wob = b.w * Math.sin(t * 26 + b.x * 40);   // rung sau va chạm / gộp
                  _p.set(b.x, P.h(b.x, b.z, 1) + b.c * 0.92, b.z).applyMatrix4(T.matrixWorld);
                  _n.set(b.nx, Math.sqrt(Math.max(0, 1 - b.nx * b.nx - b.nz * b.nz)), b.nz).applyMatrix3(_rw).normalize();
                  _mb.compose(_p, _qb.setFromUnitVectors(_up, _n), _sc.set(b.a * (1 + 0.12 * wob), b.c * (1 - 0.2 * wob), b.a * (1 + 0.12 * wob)));
                  if (big) poolMesh.setMatrixAt(np++, _mb); else beadMesh.setMatrixAt(n++, _mb);
                }
              }
              for (const f of falls) if (n < BEAD_MAX) beadMesh.setMatrixAt(n++, _mb.compose(f.p, _qb.identity(), _sc.set(f.r, f.r * 1.3, f.r)));
            }
            for (const [m, c] of [[beadMesh, n], [poolMesh, np]]) { m.count = c; m.visible = c > 0; if (c) m.instanceMatrix.needsUpdate = true; }
          }

          function lotusOpen(h, age) {   // độ nở theo giờ Pleiku: hé từ ~5 giờ, rộ nhất buổi sáng, khép dần sau trưa; ngày 3 không khép kín được nữa
            const day = sm(5.0, 7.8, h) * (1 - sm(13.5, 17.5, h)), lo = [0.04, 0.12, 0.7][age], hi = [0.6, 1, 1.3][age];
            return lo + (hi - lo) * day;
          }
          const _w = new THREE.Vector3();
          function update(dt, t) {
            const h = liveWeather.localHour, ks = 1 - Math.exp(-dt * 1.5);
            for (const f of floats) {   // lá nổi + cánh rụng: nằm đúng mặt nước mô phỏng, nghiêng theo dốc sóng (cuống cắm đáy nên không trôi)
              const p = f.g.position, y = waterSurfaceY(p.x, p.z), gx = waterSurfaceY(p.x + 0.4, p.z) - y, gz = waterSurfaceY(p.x, p.z + 0.4) - y;
              p.y = y + Math.sin(t * 1.2 + f.ph) * 0.01;
              f.g.rotation.z = clampA(-gx * 2.5, 0.2) + Math.sin(t * 0.8 + f.ph) * 0.015; f.g.rotation.x = clampA(gz * 2.5, 0.2);
            }
            for (const s of stalks) {   // cuống ngả theo gió tại ngọn (lọc mượt) + rung nhẹ theo cơn giật
              const p = s.g.position; windAt(p.x, p.y + s.H, p.z, s.H + 0.3, _w);
              s.sx += (_w.z * s.k - s.sx) * ks; s.sz += (-_w.x * s.k - s.sz) * ks;
              const fl = Math.sin(t * s.f + s.ph) * (0.006 + 0.02 * Math.min(1, Math.hypot(_w.x, _w.z) / 6));
              s.g.rotation.set(clampA(s.sx + fl, 0.35), 0, clampA(s.sz + fl * 0.7, 0.35));
            }
            for (const fl of flowers) {   // khép/mở chậm (~vài giây cảnh) cho mượt khi tua giờ
              if (fl.kind === 'pod') continue;
              const o = fl.kind === 'bud' ? 0 : lotusOpen(h, fl.age);
              if (fl.o !== null && Math.abs(o - fl.o) < 1e-4) continue;
              fl.o = fl.o === null ? o : fl.o + (o - fl.o) * (1 - Math.exp(-dt * 0.8));
              for (const p of fl.petals) p.m.rotation.x = p.a0 + (p.a1 - p.a0) * fl.o;
              if (fl.stamen) { const s = 0.55 + 0.45 * Math.min(1, fl.o); fl.stamen.scale.set(s, 0.9 + 0.1 * s, s); }
            }
            drops(dt, t, h, h < 12 ? 1 - sm(8, 10.5, h) : sm(19, 23.5, h));   // giọt mưa / sương (độ sương: đêm–sáng sớm)
          }
          return { group: pond, flowers, pads, update };
        })();
