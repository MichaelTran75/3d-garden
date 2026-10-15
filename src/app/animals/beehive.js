        // ===== TỔ ONG GIỎ RƠM (skep) treo cành cây con của cây cổ thụ (G 15/10: "study hive.glb and improve · 75% transparent · border line art visible ·
        //      inner hive complex structure") — dựng theo số đo mẫu "Hive" (Matt LeMoine, Sketchfab, CC-BY-4.0; chỉ đo): giỏ 13 vòng rơm xếp chồng,
        //      cao/rộng ≈ 1,22, bụng to nhất ở 42% chiều cao (r ≈ 0,405·H), miệng đáy r ≈ 0,30·H, chỏm vòm dẹt; bánh sáp ô lục giác bên trong.
        //  · Vỏ rơm trong 75%; nét viền: rãnh giữa các vòng rơm, miệng giỏ, đường biên từng bánh sáp.
        //  · Bên trong (như giỏ thật): 5 bánh sáp song song treo từ chỏm, mép dưới cong lưỡi; ô lục giác 2 mặt mỗi bánh — giữa bánh là vùng NHỘNG
        //    (nắp nâu vàng + ô ấu trùng trắng), vòng PHẤN HOA (cam/vàng/đỏ) bao quanh, MẬT ở vòm trên và 2 bánh ngoài (nắp sáp trắng ngà + mật hở óng);
        //    2 que chống bắt chéo xuyên vách; ong thợ bò trên mặt bánh, vài con gác miệng giỏ quạt cánh. Ong đi / về ở miệng đáy ----
        const beehive = (() => {
          const H = 1.0, NC = 13, ROPE = 0.22;
          const st = scene.getObjectByName('Cây con (Small Sub-Tree)'), A = new THREE.Vector3(-25.5, 9.9, 19.713);
          if (st && st.userData.hiveAnchor) { st.updateMatrixWorld(true); st.userData.hiveAnchor.getWorldPosition(A); }
          const g = new THREE.Group(); g.name = 'Tổ ong giỏ rơm (Skep)'; g.position.set(A.x, A.y - ROPE - H, A.z); scene.add(g);
          // ---- vỏ: bao ngoài đo từ mẫu (y/H → r/H) + gờ từng vòng rơm (rãnh sắc ⇒ nét vòng; đỉnh gờ tròn ⇒ không thành nét) ----
          const ENV = [[0, 0.3], [0.1, 0.302], [0.2, 0.33], [0.3, 0.37], [0.42, 0.405], [0.52, 0.398], [0.62, 0.37], [0.72, 0.34], [0.82, 0.305], [0.88, 0.28], [0.93, 0.235], [0.97, 0.15], [0.995, 0.06], [1, 0]];
          const env = y => { for (let i = 1; i < ENV.length; i++) if (y <= ENV[i][0]) { const [y0, r0] = ENV[i - 1], [y1, r1] = ENV[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; };
          const prof = [], cH = 0.9 / NC;
          for (let k = 0; k < NC; k++) for (const [f, d] of [[0, -0.012], [0.15, 0.002], [0.35, 0.01], [0.5, 0.012], [0.65, 0.01], [0.85, 0.002]]) { const y = (k + f) * cH; prof.push(new THREE.Vector2((env(y) + d) * H, y * H)); }
          for (const y of [0.9, 0.93, 0.96, 0.98, 0.995, 1]) prof.push(new THREE.Vector2(env(y) * H, y * H));
          const straw = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#d2a65a'; x.fillRect(0, 0, 256, 64);
            for (let k = 0; k < 420; k++) { const y = Math.random() * 64, x0 = Math.random() * 256; x.strokeStyle = ['#e8c47a', '#b8873e', '#c99a4c', '#f0d48e'][k & 3]; x.lineWidth = 0.6 + Math.random() * 0.8; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + 10 + Math.random() * 26, y + (Math.random() - 0.5) * 1.5); x.stroke(); }
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, NC); return t; })();
          const shellGeo = new THREE.LatheGeometry(prof, 20);
          const shell = new THREE.Mesh(shellGeo, new THREE.MeshLambertMaterial({ map: straw, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }));
          shell.renderOrder = 3; g.add(shell); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(shellGeo, 35), lineDark));
          // ---- dây treo: từ cành xuống núm chỏm + khoen ----
          const ropeM = new THREE.MeshLambertMaterial({ color: 0x6b5232 });
          const rope = cyl(0.011, 0.011, ROPE + 0.02, ropeM, true, false, null, 5); rope.position.y = H + ROPE / 2; g.add(rope);
          const knot = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.01, 5, 10), ropeM); knot.position.y = H + 0.015; knot.rotation.y = 0.7; g.add(knot);
          // ---- 2 que chống bắt chéo (xuyên vách, ló 4 cm mỗi bên) ----
          const stickM = new THREE.MeshLambertMaterial({ color: 0x8a6a45 });
          for (const [y, ax] of [[0.38, 'x'], [0.6, 'z']]) { const L = 2 * env(y) * H + 0.08, s = cyl(0.012, 0.012, L, stickM, true, false, null, 6); s.position.y = y * H; if (ax === 'x') s.rotation.z = Math.PI / 2; else s.rotation.x = Math.PI / 2; g.add(s); }
          // ---- 5 bánh sáp: mặt phẳng song song trục x, cách nhau 0,12·H; biên = vách trong (lùi 2,5 cm) ∩ mép dưới cong lưỡi ----
          const rIn = y => Math.max(0, env(y) - 0.035), CR = 0.026, cells = [], combs = [], combEdges = [];
          const midM = new THREE.MeshLambertMaterial({ color: 0x8a5a1e, side: THREE.DoubleSide, transparent: true, opacity: 0.5, depthWrite: false });   // G 15/10: cấu trúc trong tổ trong 50%
          for (let k = 0; k < 5; k++) {
            const zc = (k - 2) * 0.12, bot = x => 0.17 + (Math.abs(k - 2) * 0.05) + 0.42 * x * x;   // mép dưới: giữa thấp, 2 bên cao; bánh ngoài ngắn hơn
            const half = y => { const r = rIn(y); return r > Math.abs(zc) ? Math.sqrt(r * r - zc * zc) - 0.012 : 0; };
            const inside = (x, y) => y <= 0.94 && Math.abs(x) <= half(y) && y >= bot(x);
            const sh = new THREE.Shape(), pts = [];
            for (let y = 0.94; y >= 0.1; y -= 0.02) { const w = half(y); if (w > 0 && y >= bot(w)) pts.push([w, y]); }   // vách phải đi xuống
            const xr = pts.length ? pts[pts.length - 1][0] : 0.1;
            for (let i = 0; i <= 16; i++) { const x = xr - 2 * xr * i / 16; pts.push([x, bot(x)]); }   // mép dưới phải → trái
            for (let i = pts.length - 18; i >= 0; i--) pts.push([-pts[i][0], pts[i][1]]);   // vách trái đi lên (gương)
            pts.forEach(([x, y], i) => i ? sh.lineTo(x * H, y * H) : sh.moveTo(x * H, y * H));
            const cg = new THREE.ShapeGeometry(sh); cg.translate(0, 0, zc * H);
            const comb = new THREE.Mesh(cg, midM); g.add(comb); combs.push({ zc, inside });
            combEdges.push(new THREE.EdgesGeometry(cg));
            // ô lục giác (lưới tổ ong: hàng ngang, cột so le) trên cả 2 mặt
            for (let row = 0; row * CR * 1.5 < 0.95; row++) for (let col = -14; col <= 14; col++) {
              const x = (col + (row & 1) * 0.5) * CR * Math.sqrt(3), y = 0.1 + row * CR * 1.5;
              if (!inside(x, y) || !inside(x + CR, y) || !inside(x - CR, y) || !inside(x, y - CR) || !inside(x, y + CR)) continue;
              const db = Math.hypot(x / 0.3, (y - 0.42) / 0.26), outer = Math.abs(k - 2) === 2, r = Math.random();
              let c;   // màu nắp / ruột ô theo vùng thật của bánh tổ
              if (r < 0.07) c = 0x5b3a14;   // ô trống (sáp sẫm)
              else if (!outer && db < 0.75) c = r < 0.72 ? 0xc89a58 : 0xf2ead8;   // nhộng: nắp nâu vàng · ấu trùng trắng
              else if (!outer && db < 0.98) c = [0xe8901f, 0xf2c230, 0xc8452a, 0xe8b23a][(r * 40 | 0) & 3];   // phấn hoa
              else c = r < 0.6 ? 0xf3e7b8 : 0xe8a21e;   // mật: nắp sáp trắng ngà · mật hở óng
              for (const sd of [-1, 1]) cells.push([x * H, y * H, (zc + sd * 0.014) * H, sd, c]);
            }
          }
          g.add(new THREE.LineSegments(mergeGeometries(combEdges), lineDark));
          const cellGeo = new THREE.CylinderGeometry(CR * 0.86 * H, CR * 0.86 * H, 0.026 * H, 6, 1, false); cellGeo.rotateX(Math.PI / 2); cellGeo.rotateZ(Math.PI / 6);   // lăng trụ lục giác dọc trục z (mặt đầu = nắp ô)
          const cellM = new THREE.MeshPhongMaterial({ shininess: 40, specular: 0x5a4a30, transparent: true, opacity: 0.5, depthWrite: false });
          const cellIM = new THREE.InstancedMesh(cellGeo, cellM, cells.length), _m = new THREE.Matrix4(), _c = new THREE.Color();
          cells.forEach(([x, y, z, sd, c], i) => { _m.makeTranslation(x, y, z); cellIM.setMatrixAt(i, _m); cellIM.setColorAt(i, _c.setHex(c)); });
          cellIM.instanceMatrix.needsUpdate = true; cellIM.instanceColor.needsUpdate = true; g.add(cellIM);
          // ---- ong thợ: bò trên mặt bánh (đi chậm, đổi hướng ngẫu nhiên, quay đầu ở mép) + 4 con gác miệng giỏ quạt cánh ----
          const beeGeo = (() => {
            const parts = [], add = (geo, f) => { geo = geo.index ? geo.toNonIndexed() : geo; const p = geo.attributes.position, col = []; for (let i = 0; i < p.count; i++) { const k = new THREE.Color(f(p.getX(i), p.getY(i), p.getZ(i))); col.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.deleteAttribute('uv'); parts.push(geo); };
            const ab = new THREE.SphereGeometry(0.5, 8, 6); ab.scale(0.011, 0.01, 0.017); ab.translate(0, 0, -0.013); add(ab, (x, y, z) => Math.sin((z + 0.03) * 520) > 0 ? 0xe0a82e : 0x2a2016);
            const th = new THREE.SphereGeometry(0.5, 7, 5); th.scale(0.011, 0.01, 0.011); add(th, () => 0x8a6a30);
            const hd = new THREE.SphereGeometry(0.5, 7, 5); hd.scale(0.009, 0.008, 0.008); hd.translate(0, 0, 0.01); add(hd, () => 0x1e1812);
            for (const s of [-1, 1]) { const w = new THREE.PlaneGeometry(0.008, 0.016); w.rotateX(-Math.PI / 2); w.rotateY(s * 0.35); w.translate(s * 0.005, 0.006, -0.008); add(w, () => 0xd8dde0); }
            const m = mergeGeometries(parts); m.scale(H * 1.8, H * 1.8, H * 1.8); return m;   // ong trong tổ to thêm 20% (G 15/10)
          })();
          const NB = 26, beeIM = new THREE.InstancedMesh(beeGeo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), NB);
          const crawl = [];
          for (let i = 0; i < NB; i++) {
            if (i < 22) { const k = i % 5, C = combs[k]; let x = 0, y = 0.5; for (let t = 0; t < 30; t++) { x = (Math.random() - 0.5) * 0.6; y = 0.2 + Math.random() * 0.7; if (C.inside(x, y)) break; } crawl.push({ k, sd: Math.random() < 0.5 ? -1 : 1, x, y, a: Math.random() * TAU, v: 0.02 + Math.random() * 0.03, turn: 0, dance: k === 2 && i < 13 ? { o: i * 0.7, cx: (i - 7) * 0.07, cy: 0.52 } : null }); }   // 3 con trên bánh giữa nhảy lắc đuôi
            else { const a = (i - 22) / 4 * TAU + 0.4; crawl.push({ guard: true, a, x: Math.cos(a) * (env(0) - 0.01), z: Math.sin(a) * (env(0) - 0.01) }); }
          }
          g.add(beeIM);
          const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
          g.traverse(o => { o.userData.noBatch = true; });
          const mouth = new THREE.Vector3(g.position.x, g.position.y, g.position.z);
          let danceA = 0, danceAt = -9;   // góc nhảy: hướng đồng hoa trừ hướng mặt trời (ong báo đường: "lên" trên mặt bánh = phía mặt trời)
          return {
            g, mouth, cells: cells.length, rimR: (env(0) - 0.02) * H,
            update(dt, t) {
              dt = Math.min(dt, 0.05);
              if (t - danceAt > 5 && safeFlowerCoords) { danceAt = t; let fx = 0, fz = 0; for (const f of safeFlowerCoords) { fx += f.x - g.position.x; fz += f.z - g.position.z; } danceA = Math.atan2(fx, fz) - Math.atan2(sun.position.x - sun.target.position.x, sun.position.z - sun.target.position.z); }
              crawl.forEach((b, i) => {
                if (b.dance) {   // NHẢY LẮC ĐUÔI (von Frisch): chạy thẳng lắc bụng ~13 Hz theo góc báo đường, vòng nửa tròn về điểm đầu, lần lượt trái / phải
                  const D = b.dance, T = 1.9, q = (t + D.o) % (2 * T), side = q < T ? 1 : -1, u = (q % T) / T, dx = Math.sin(danceA), dy = Math.cos(danceA), R = 0.0375, C = combs[b.k];
                  let x, y, hx, hy;
                  if (u < 0.4) { const s = u / 0.4, w = 0.5 * Math.sin(t * 82); x = D.cx + dx * (s - 0.5) * 2 * R; y = D.cy + dy * (s - 0.5) * 2 * R; hx = dx * Math.cos(w) - dy * Math.sin(w); hy = dx * Math.sin(w) + dy * Math.cos(w); }
                  else { const f = (u - 0.4) / 0.6 * Math.PI, nx = dy * side, ny = -dx * side; x = D.cx + R * (dx * Math.cos(f) + nx * Math.sin(f)); y = D.cy + R * (dy * Math.cos(f) + ny * Math.sin(f)); hx = -dx * Math.sin(f) + nx * Math.cos(f); hy = -dy * Math.sin(f) + ny * Math.cos(f); }
                  beeIM.setMatrixAt(i, _m.makeBasis(_x.set(-b.sd * hy, b.sd * hx, 0), _y.set(0, 0, b.sd), _z.set(hx, hy, 0)).setPosition(x * H, y * H, (C.zc + b.sd * 0.03) * H)); return;
                }
                if (b.guard) {   // gác miệng giỏ, đầu hướng ra ngoài, thân rung khi quạt cánh
                  const c = Math.cos(b.a), s = Math.sin(b.a); beeIM.setMatrixAt(i, _m.makeBasis(_x.set(s, 0, -c), _y.set(0, 1, 0), _z.set(c, 0, s)).setPosition(b.x * H, 0.012 + 0.002 * Math.sin(t * 40 + i), b.z * H)); return;
                }
                const C = combs[b.k]; if ((b.turn -= dt) <= 0) { b.turn = 0.5 + Math.random() * 1.5; b.da = (Math.random() - 0.5) * 2.4; }
                b.a += b.da * dt; const nx = b.x + Math.cos(b.a) * b.v * dt, ny = b.y + Math.sin(b.a) * b.v * dt;
                if (C.inside(nx, ny) && C.inside(nx + 0.03 * Math.cos(b.a), ny + 0.03 * Math.sin(b.a))) { b.x = nx; b.y = ny; } else b.a += Math.PI * (0.6 + Math.random() * 0.8);
                const c = Math.cos(b.a), s = Math.sin(b.a);   // lưng = pháp tuyến mặt bánh (0, 0, sd), đầu theo hướng bò trong mặt bánh
                beeIM.setMatrixAt(i, _m.makeBasis(_x.set(-b.sd * s, b.sd * c, 0), _y.set(0, 0, b.sd), _z.set(c, s, 0)).setPosition(b.x * H, b.y * H, (C.zc + b.sd * 0.03) * H));
              });
              beeIM.instanceMatrix.needsUpdate = true;
            }
          };
        })();
