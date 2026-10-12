        // ---- CẦN CÂU & XÔ dựng bằng code theo số đo bộ đồ câu spinning:
        //      cần dài 114 đv gốc → 3,1 m: chuôi sau bần · ống gắn máy kim loại + vòng chặn · chuôi trước ngắn · thân than đen thon dần,
        //      5 khoen dẫn dây + khoen ngọn treo phía dưới đúng vị trí đo (41,6 · 60,7 · 77,2 · 92,1 · 102 · 113,9), máy câu đứng (spinning) dưới ống gắn.
        //      Bề dày ×1,4 so với tỉ lệ gốc để còn đọc được ở tỉ lệ cảnh. Trục cần = +y cục bộ, phía dưới cần = +z ----
        const ROD_K = 3.1 / 114, ROD_R = ROD_K * 1.4;
        let rodMats = null;
        // Cần đang cầm (flex): thân cần chia 6 đoạn đúng tại các nút đổi độ thon của cần, mỗi đoạn là 1 khớp uốn (2 mặt phẳng) → cần cong theo lực dây
        // (lý thuyết elastica: độ cong κ = M/EI, thân rỗng thon I ∝ r³ ⇒ đỉnh uốn ~80% chiều dài, kiểu cần "fast action"); tay quay máy quay được.
        const ROD_CUTS = [25.2, 41.4, 60.5, 77.4, 91.9, 101.9, 114], ROD_RADS = [0.54, 0.47, 0.33, 0.26, 0.18, 0.1, 0.06];
        const ROD_EI0 = 290;   // độ cứng uốn gốc thân cần (N·đv², đv cục bộ của cần): lực ngang 10 N ở ngọn → ngọn lệch ~45° (cỡ cần phao cacbon), 14 N (ngưỡng phanh) cong hình chữ C
        function fishingRod(opts = {}) {
          if (!rodMats) rodMats = { cork: new THREE.MeshLambertMaterial({ color: 0x8b6341 }), blank: new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), seat: new THREE.MeshLambertMaterial({ color: 0x868482 }), reel: new THREE.MeshLambertMaterial({ color: 0x2c2824 }), guide: new THREE.MeshLambertMaterial({ color: 0xb8bcc0 }) };
          const M = rodMats, g = new THREE.Group(); g.name = 'Cần câu (Fishing Rod)';
          const Y = v => -0.4 + v * ROD_K;   // vị trí dọc cần theo số đo mẫu (0 = nắp chuôi, 114 = ngọn); chuôi nhô 0,4 ra sau tay nắm
          const lathe = (pts, mat, seg = 10, par = g, base = null) => {   // base ≠ null: toạ độ cục bộ của 1 đoạn cần bắt đầu ở mốc base
            const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r * ROD_R, base === null ? Y(y) : (y - base) * ROD_K)), seg), mat); m.castShadow = true; par.add(m); return m;
          };
          lathe([[0, 0], [0.71, 0], [0.87, 0.2], [0.93, 1.2], [0.93, 11.6], [0.87, 12.3], [0.74, 12.7], [0, 12.7]], M.cork);            // chuôi sau bằng bần + nắp đuôi
          lathe([[0, 12.6], [0.8, 12.6], [0.82, 15.7], [0.8, 21], [0.9, 21.2], [0.9, 21.6], [0, 21.6]], M.seat);                      // ống gắn máy + vòng chặn
          lathe([[0, 21.5], [0.84, 21.5], [0.75, 22], [0.72, 25.1], [0.55, 25.3], [0, 25.3]], M.cork);                                // chuôi trước ngắn
          const guides = [];
          const addGuide = (par, base, gy, gr, gc) => {   // khoen nằm vuông góc trục cần, dây luồn qua + chân khoen bám thân
            const y = base === null ? Y(gy) : (gy - base) * ROD_K;
            const ring = new THREE.Mesh(new THREE.TorusGeometry(gr * ROD_R, 0.12 * ROD_R, 5, 12), M.guide); ring.rotation.x = Math.PI / 2; ring.position.set(0, y, gc * ROD_R); par.add(ring);
            const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * ROD_R, 0.1 * ROD_R, (gc - gr) * ROD_R, 4), M.guide); foot.rotation.x = Math.PI / 2; foot.position.set(0, y, (gc - gr) * ROD_R / 2); par.add(foot);
            guides.push(ring);
          };
          const GUIDES = [[41.6, 0.62, 1.54], [60.7, 0.5, 1.07], [77.2, 0.46, 0.94], [92.1, 0.42, 0.87], [102, 0.36, 0.62], [113.9, 0.24, 0.4]];
          const tip = new THREE.Object3D();
          if (!opts.flex) {
            lathe([[0, 25.2], [0.54, 25.2], [0.47, 41.4], [0.33, 60.5], [0.26, 77.4], [0.18, 91.9], [0.1, 101.9], [0.06, 113.9], [0, 114]], M.blank, 8);   // thân cần thon dần
            for (const gd of GUIDES) addGuide(g, null, ...gd);
            tip.position.y = Y(113.9); g.add(tip);
          } else {
            let par = g; const segs = []; let mSum = 0;
            for (let k = 0; k < 6; k++) {
              const sg = new THREE.Group(); sg.name = 'Đoạn thân cần ' + (k + 1);
              sg.position.y = k ? (ROD_CUTS[k] - ROD_CUTS[k - 1]) * ROD_K : Y(ROD_CUTS[0]); par.add(sg);
              const pts = [[0, ROD_CUTS[k]], [ROD_RADS[k], ROD_CUTS[k]], [ROD_RADS[k + 1], ROD_CUTS[k + 1]]]; if (k === 5) pts.push([0, ROD_CUTS[6]]);
              lathe(pts, M.blank, 8, sg, ROD_CUTS[k]);
              const len = (ROD_CUTS[k + 1] - ROD_CUTS[k]) * ROD_K, rm = (ROD_RADS[k] + ROD_RADS[k + 1]) / 2, m = rm * rm * len;
              segs.push({ g: sg, len, ei: ROD_EI0 * Math.pow(Math.max(0.15, rm) / 0.54, 3), m }); mSum += m; par = sg;
            }
            for (const s of segs) s.m *= 0.11 / mSum;   // thân cần cacbon ~110 g
            for (const gd of GUIDES) { const k = Math.max(0, ROD_CUTS.findIndex((c, i) => i < 6 && gd[0] >= c && gd[0] < ROD_CUTS[i + 1])); addGuide(segs[k].g, ROD_CUTS[k], ...gd); }
            tip.position.y = (113.9 - ROD_CUTS[5]) * ROD_K; segs[5].g.add(tip);
            g.userData.flex = { segs, th: new Float32Array(12), vel: new Float32Array(12), pm: segs.map(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]), acc: segs.map(() => new THREE.Vector3()), n: 0, F: new THREE.Vector3() };
          }
          const reel = new THREE.Group(); reel.position.y = Y(18.5); g.add(reel);   // máy câu đứng: chân · hộp số · lô dây (trục song song cần) · càng gạt · tay quay bên hông
          const part = (geo, mat, x, y, z, rx = 0, rz = 0, p = reel) => { const m = new THREE.Mesh(geo, mat); m.position.set(x * ROD_R, y * ROD_R, z * ROD_R); m.rotation.set(rx, 0, rz); m.castShadow = true; p.add(m); return m; };
          part(new THREE.BoxGeometry(0.35 * ROD_R, 1.6 * ROD_R, 2.1 * ROD_R), M.reel, 0, 0, 1.55);
          part(new THREE.SphereGeometry(1.3 * ROD_R, 10, 8), M.reel, 0, -0.3, 3.45).scale.set(1, 1.05, 0.85);
          part(new THREE.CylinderGeometry(1.15 * ROD_R, 1.3 * ROD_R, 1.4 * ROD_R, 14), M.seat, 0, 1.6, 3.45);
          part(new THREE.TorusGeometry(1.35 * ROD_R, 0.1 * ROD_R, 4, 16, Math.PI), M.guide, 0, 2.35, 3.45, Math.PI / 2);
          part(new THREE.CylinderGeometry(0.22 * ROD_R, 0.22 * ROD_R, 2.6 * ROD_R, 6), M.seat, 2.2, -0.3, 3.45, 0, Math.PI / 2);
          const crank = new THREE.Group(); crank.position.set(3.5 * ROD_R, -0.3 * ROD_R, 3.45 * ROD_R); reel.add(crank);   // tay quay xoay quanh trục ngang
          part(new THREE.BoxGeometry(0.3 * ROD_R, 2.2 * ROD_R, 0.3 * ROD_R), M.reel, 0, -1.0, 0, 0, 0, crank);
          const knob = part(new THREE.SphereGeometry(0.55 * ROD_R, 8, 6), M.reel, 0.35, -2.05, 0, 0, 0, crank);
          const spool = new THREE.Object3D(); spool.position.set(0, 2.3 * ROD_R, 3.45 * ROD_R); reel.add(spool);   // mép lô dây: dây đi lên khoen đầu tiên
          const butt = new THREE.Object3D(); butt.position.y = Y(0.6); g.add(butt);
          g.userData.tip = tip; g.userData.guides = guides; g.userData.crank = crank; g.userData.knob = knob; g.userData.spool = spool; g.userData.butt = butt;   // ngọn cần: dây câu xuất phát từ đây
          return g;
        }
        function metalBucket() {   // xô tôn nhỏ (rỗng) theo "Metal Bucket (Empty)": đáy Ø1,95 · miệng loe Ø2,4 · cao 2,6 đv gốc · gờ cuộn miệng · 2 tai + quai dây thép buông dọc thân
          const g = new THREE.Group(); g.name = 'Xô nhỏ (Metal Bucket)';
          const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
          x.fillStyle = '#5c5a55'; x.fillRect(0, 0, 128, 128);
          for (let k = 0; k < 260; k++) { const v = 70 + Math.random() * 40 | 0; x.fillStyle = `rgba(${v},${v - 2},${v - 6},0.35)`; x.fillRect(Math.random() * 128, Math.random() * 128, 2 + Math.random() * 6, 2 + Math.random() * 4); }   // tôn kẽm loang lổ
          for (let k = 0; k < 26; k++) { const px = Math.random() * 128, l = 20 + Math.random() * 70, gr = x.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(66,74,56,0.65)'); gr.addColorStop(1, 'rgba(66,74,56,0)'); x.fillStyle = gr; x.fillRect(px, 0, 1.5 + Math.random() * 3, l); }   // vệt rêu ố chảy từ miệng xuống
          x.fillStyle = 'rgba(40,40,36,0.35)'; for (const yy of [40, 86]) x.fillRect(0, yy, 128, 2);   // 2 gân dập quanh thân
          const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 4;
          const tin = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), wire = new THREE.MeshLambertMaterial({ color: 0x8a8c8e });
          // 1 biên dạng liền: đáy ngoài → thành ngoài loe → miệng → thành trong → đáy trong (2 mặt nên nhìn được lòng xô rỗng)
          const prof = [[0, 0], [0.9, 0], [0.97, 0.03], [0.985, 0.2], [0.99, 0.22], [1.2, 2.55], [1.23, 2.6], [1.18, 2.6], [1.16, 2.5], [0.95, 0.26], [0, 0.26]];
          const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 20), tin); body.castShadow = true; body.receiveShadow = true; g.add(body);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(1.215, 0.045, 6, 24), wire); rim.rotation.x = Math.PI / 2; rim.position.y = 2.6; g.add(rim);
          for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.36, 0.22), tin); ear.position.set(sx * 1.2, 2.36, 0); ear.rotation.z = sx * 0.09; g.add(ear); }
          const bailPath = new THREE.CatmullRomCurve3([[-1.26, 2.33, 0], [-1.12, 1.75, 0.62], [-0.6, 1.4, 1.08], [0, 1.3, 1.25], [0.6, 1.4, 1.08], [1.12, 1.75, 0.62], [1.26, 2.33, 0]].map(p => new THREE.Vector3(...p)));
          const bail = new THREE.Mesh(new THREE.TubeGeometry(bailPath, 32, 0.035, 5, false), wire); bail.castShadow = true; g.add(bail);   // quai buông xuôi một bên như mẫu
          return g;
        }
