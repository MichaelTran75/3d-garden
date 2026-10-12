        // ---- electrical substation and distribution lines ----
        let substationAnim = null;
        function worldCell(oi, oj, y = 0) { const i = oi * S, j = oj * S; return new THREE.Vector3(wx(i), surfaceY(i, j) + y, wz(j)); }
        function poleBadgeTex(txt) {
          const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d');
          x.clearRect(0, 0, 128, 128);
          x.font = '500 64px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.lineWidth = 7; x.strokeStyle = 'rgba(12, 18, 26, 0.95)'; x.strokeText(txt, 64, 64);
          x.fillStyle = '#E2D6C0'; x.fillText(txt, 64, 64);
          const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
        }
        let poleCounter = 0;
        function poleAt(oi, oj, h = 6.72, label = null) {
          poleCounter++; const numStr = label || ('' + poleCounter);
          const p = worldCell(oi, oj), g = new THREE.Group(); g.position.copy(p); g.name = 'Cột điện #' + poleCounter + ' (Power Pole)'; scene.add(g);
          obstacleCoords.push({ x: p.x, y: p.y, z: p.z, r: 1.5, h: h + 1.5 });
          let rotY = 0;
          if (poleCounter === 1 || poleCounter === 2 || poleCounter === 3 || poleCounter === 5) rotY = Math.PI / 2;        // cột 1, 2, 3 & 5 xoay 90°
          else if (poleCounter === 6) rotY = Math.PI / 6;                        // cột 6 xoay ngược chiều kim đồng hồ 30°
          g.rotation.y = rotY;
          const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, h, 8), metalMat); mast.position.y = h / 2; mast.castShadow = true; g.add(mast);
          const arm = bx(2.7, 0.12, 0.16, metalMat, true, true, lineDark); arm.position.y = h * 0.88; g.add(arm);
          for (const x of [-1.05, 0, 1.05]) { const ins = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.34, 8), ceramicMat); ins.position.set(x, arm.position.y + 0.23, 0); ins.castShadow = true; g.add(ins); }
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: poleBadgeTex(numStr), transparent: true, opacity: 0.95, depthTest: false, depthWrite: false }));
          sp.scale.set(2.2, 2.2, 1); sp.position.set(0, h + 1.25, 0); sp.renderOrder = 25; g.add(sp); numSprites.push(sp);
          const conn = p.clone().add(new THREE.Vector3(0, arm.position.y + 0.4, 0));
          conn.crossarmDir = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY));
          return conn;
        }
        function wire(a, b, sag = 0.55) {
          const dir = new THREE.Vector3().subVectors(b, a); dir.y = 0; dir.normalize();
          const perp = new THREE.Vector3(-dir.z, 0, dir.x);
          const perpA = a.crossarmDir || perp;
          const perpB = b.crossarmDir || perp;
          for (const off of [-1.05, 0, 1.05]) {
            const p0 = a.clone().addScaledVector(perpA, off), p2 = b.clone().addScaledVector(perpB, off);
            const p1 = p0.clone().lerp(p2, 0.5); p1.y -= sag;
            const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(18)), cableMat));
          }
        }
        function substation(oi, oj) {
          const p = worldCell(oi, oj), g = new THREE.Group(); g.position.copy(p); g.name = 'Trạm biến áp (Substation)'; g.scale.setScalar(ARCHITECTURE_SCALE); scene.add(g);
          const steel = metalMat, gx = -4.6, gantryH = 13.5;   // trạm mở rộng: giàn néo dời ra mép, cao hơn
          obstacleCoords.push({ x: p.x, y: p.y, z: p.z, r: 7.2 * ARCHITECTURE_SCALE, h: gantryH * ARCHITECTURE_SCALE });   // vùng cấm bay lớn hơn theo sân trạm
          const curb = bx(12.0, 0.14, 8.4, concreteMat, true, true, lineMat); curb.position.y = 0.07; g.add(curb);
          const pad = bx(11.6, 0.24, 8.0, concreteDark, true, true, lineMat); pad.position.y = 0.14; g.add(pad);
          for (const tz of [-2.7, 0, 2.7]) { const tr = bx(9.8, 0.05, 0.36, concreteMat, false, true, lineMat); tr.position.set(0, 0.27, tz); g.add(tr); }   // rãnh cáp (cable trench)
          // trụ sứ đứng / chống sét (post insulator stack)
          function insStack(x, z, h) {
            const ig = new THREE.Group(); ig.position.set(x, 0.24, z); g.add(ig);
            const b = bx(0.26, 0.22, 0.26, steel, true, true, lineDark); b.position.y = 0.11; ig.add(b);
            const n = Math.max(4, Math.round(h / 0.26)); for (let k = 0; k < n; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.15, 10), ceramicMat); d.position.y = 0.26 + k * (h / n); d.castShadow = true; ig.add(d); }
            const cap = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), steel); cap.position.y = 0.26 + h; ig.add(cap);
          }
          // ---- máy biến áp lực (power transformer) ----
          {
            const tg = new THREE.Group(); tg.position.set(1.6, 0.24, -0.35); g.add(tg);
            const tank = bx(1.5, 1.5, 1.7, steel, true, true, lineDark); tank.position.y = 0.85; tg.add(tank);
            for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) { const fin = bx(0.05, 1.12, 0.16, gateMat, true, false); fin.position.set(sx * 0.83, 0.85, -0.62 + k * 0.25); tg.add(fin); }      // cánh tản nhiệt
            const cons = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.2, 12), steel); cons.rotation.z = Math.PI / 2; cons.position.set(0, 1.82, 0.42); cons.castShadow = true; tg.add(cons);  // bình dầu phụ: nằm NGANG mặt trên, trong footprint, trước hàng sứ (không lồi ra ngoài khối)
            for (let k = 0; k < 3; k++) {
              const bu = new THREE.Group(); bu.position.set(-0.5 + k * 0.5, 1.6, -0.15); bu.rotation.z = 0; tg.add(bu);                                                     // sứ xuyên cao áp
              for (let m = 0; m < 4; m++) { const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.14, 8), ceramicMat); disc.position.y = m * 0.16; disc.castShadow = true; bu.add(disc); }
              const t = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), steel); t.position.y = 0.7; bu.add(t);
            }
            const cb = bx(0.42, 0.72, 0.5, gateMat, true, true, lineDark); cb.position.set(-0.96, 0.58, 0.72); tg.add(cb);
          }                                                                       // tủ điều khiển
          // ---- giàn thép (gantry) đỡ thanh cái + chuỗi sứ ----
          {
            function tower(z) {
              const lg = new THREE.Group(); lg.position.set(gx, 0.24, z); g.add(lg);
              for (const sx of [-0.34, 0.34]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, gantryH, 6), steel); leg.position.set(sx, gantryH / 2, 0); leg.castShadow = true; lg.add(leg); }
              for (let k = 0; 0.5 + k * 0.9 < gantryH; k++) { const br = bx(0.74, 0.05, 0.05, steel, true, false); br.position.set(0, 0.5 + k * 0.9, 0); lg.add(br); }
              for (let k = 0; 0.95 + k * 0.9 < gantryH; k++) { const d = bx(0.84, 0.04, 0.04, steel, true, false); d.position.set(0, 0.95 + k * 0.9, 0); d.rotation.z = (k % 2 ? 1 : -1) * 0.8; lg.add(d); }
            }
            tower(-1.45); tower(1.45);
            const beam = bx(0.14, 0.16, 3.5, steel, true, true, lineDark); beam.position.set(gx, 0.24 + gantryH, 0); g.add(beam);
            for (const z of [-1.1, 0, 1.1]) {
              const st = new THREE.Group(); st.position.set(gx, 0.24 + gantryH - 0.08, z); g.add(st);
              for (let m = 0; m < 4; m++) { const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.1, 8), ceramicMat); disc.position.y = -0.16 - m * 0.12; disc.castShadow = true; st.add(disc); }
            }
          }
          // ---- hàng trụ sứ / chống sét ----
          insStack(-0.3, 1.5, 1.5); insStack(0.4, 1.5, 1.5); insStack(1.1, 1.5, 1.5);
          // ---- nhà điều khiển nhỏ kiểu công nghiệp (KHÔNG phải nhà ở) ----
          {
            const kg = new THREE.Group(); kg.position.set(-2.25, 0.24, -1.15); g.add(kg);
            const body = bx(1.3, 1.25, 1.1, wallMat, true, true, lineMat); body.position.y = 0.62; kg.add(body);
            const rk = bx(1.42, 0.12, 1.22, concreteDark, true, true, lineMat); rk.position.y = 1.31; kg.add(rk);
            const door = bx(0.44, 0.92, 0.06, gateMat, true, true, lineDark); door.position.set(-0.3, 0.48, 0.56); kg.add(door);
            for (let k = 0; k < 3; k++) { const lv = bx(0.5, 0.05, 0.05, gateMat, true, false); lv.position.set(0.25, 1.0 - k * 0.13, 0.56); kg.add(lv); }
          }
          // ---- tủ đóng cắt (switchgear) ----
          for (let k = 0; k < 3; k++) { const cab = bx(0.42, 0.95, 0.5, gateMat, true, true, lineDark); cab.position.set(-2.55 + k * 0.5, 0.71, 0.95); g.add(cab); }
          // ================= MỞ RỘNG: ngăn lộ đầy đủ (bay) — thêm nhiều thiết bị =================
          const insPost = (host, py, h) => { const n = Math.max(4, Math.round(h / 0.26)); for (let k = 0; k < n; k++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.15, 10), ceramicMat); d.position.y = py + k * (h / n); d.castShadow = true; host.add(d); } const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), steel); cap.position.y = py + h; host.add(cap); };
          const latticeTower = (x, z, h, span) => {   // cột giàn thép mắt cáo
            const lg = new THREE.Group(); lg.position.set(x, 0.24, z); g.add(lg);
            for (const sx of [-span, span]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 6), steel); leg.position.set(sx, h / 2, 0); leg.castShadow = true; lg.add(leg); }
            for (let k = 0; 0.5 + k * 0.85 < h; k++) { const br = bx(span * 2, 0.05, 0.05, steel, true, false); br.position.set(0, 0.5 + k * 0.85, 0); lg.add(br); }
            for (let k = 0; 0.9 + k * 0.85 < h; k++) { const d = bx(span * 2.1, 0.04, 0.04, steel, true, false); d.position.set(0, 0.9 + k * 0.85, 0); d.rotation.z = (k % 2 ? 1 : -1) * 0.82; lg.add(d); }
          };
          const breaker = (x, z) => {   // máy cắt dead-tank: bồn + 2 sứ xuyên có đầu ngắt
            const bg = new THREE.Group(); bg.position.set(x, 0.24, z); g.add(bg);
            const tank = bx(0.85, 0.6, 1.7, steel, true, true, lineDark); tank.position.y = 0.5; bg.add(tank);
            const cab = bx(0.44, 0.74, 0.38, gateMat, true, true, lineDark); cab.position.set(0, 0.62, 1.1); bg.add(cab);
            for (const bz of [-0.55, 0.55]) { const c2 = new THREE.Group(); c2.position.set(0, 0.8, bz); bg.add(c2); insPost(c2, 0, 1.6); const head = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.36, 10), steel); head.position.y = 1.8; head.castShadow = true; c2.add(head); }
          };
          const disconnect = (x, z) => {   // dao cách ly: bệ + 2 trụ sứ + lưỡi dao nghiêng
            const dg = new THREE.Group(); dg.position.set(x, 0.24, z); g.add(dg);
            const base = bx(0.5, 0.3, 1.5, steel, true, true, lineDark); base.position.y = 0.15; dg.add(base);
            for (const bz of [-0.55, 0.55]) { const c2 = new THREE.Group(); c2.position.set(0, 0.3, bz); dg.add(c2); insPost(c2, 0, 1.2); }
            const blade = bx(0.06, 0.06, 1.0, steel, true, false); blade.position.set(0, 1.55, 0); blade.rotation.x = 0.55; dg.add(blade);
          };
          const ct = (x, z) => {   // biến dòng: hộp đế + trụ sứ + đầu bành
            const cg = new THREE.Group(); cg.position.set(x, 0.24, z); g.add(cg);
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.5, 12), steel); base.position.y = 0.25; base.castShadow = true; cg.add(base);
            insPost(cg, 0.5, 1.7);
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.42, 12), steel); top.position.y = 2.41; top.castShadow = true; cg.add(top);
          };
          const arrester = (x, z) => {   // chống sét van + vòng grading
            const ag = new THREE.Group(); ag.position.set(x, 0.24, z); g.add(ag); insPost(ag, 0.1, 2.3);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 16), steel); ring.rotation.x = Math.PI / 2; ring.position.y = 2.25; ag.add(ring);
          };
          const bigXfmr = (x, z) => {   // máy biến áp lực thứ 2 (lớn hơn máy gốc)
            const tg = new THREE.Group(); tg.position.set(x, 0.24, z); g.add(tg);
            const tank = bx(1.8, 1.8, 2.0, steel, true, true, lineDark); tank.position.y = 1.0; tg.add(tank);
            for (const sx of [-1, 1]) for (let k = 0; k < 8; k++) { const fin = bx(0.05, 1.35, 0.18, gateMat, true, false); fin.position.set(sx * 1.0, 1.0, -0.75 + k * 0.21); tg.add(fin); }
            const cons = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 1.5, 12), steel); cons.rotation.z = Math.PI / 2; cons.position.set(0, 2.16, 0.5); cons.castShadow = true; tg.add(cons);   // bình dầu phụ: nằm NGANG trong footprint mặt trên, trước hàng sứ
            for (let k = 0; k < 3; k++) { const bu = new THREE.Group(); bu.position.set(-0.6 + k * 0.6, 1.9, -0.2); bu.rotation.z = 0; tg.add(bu); insPost(bu, 0, 0.75); }
            const rad = bx(0.5, 0.85, 0.6, gateMat, true, true, lineDark); rad.position.set(-1.25, 0.65, 0.9); tg.add(rad);
          };
          // --- bố trí ---
          latticeTower(-0.2, -3.2, 9.5, 0.34); latticeTower(-0.2, 3.2, 9.5, 0.34);   // giàn thanh cái (busbar)
          for (const dy of [0, 0.7]) { const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 6.8, 10), steel); bus.rotation.x = Math.PI / 2; bus.position.set(-0.2, 0.24 + 9.5 - dy, 0); g.add(bus); }   // thanh cái chính + dự phòng
          disconnect(-3.7, 2.9); breaker(-2.6, 2.9); ct(-1.4, 2.9);        // ngăn lộ 1 đầy đủ
          disconnect(-3.7, -2.9); breaker(-2.6, -2.9); ct(-1.4, -2.9);     // ngăn lộ 2 đầy đủ
          arrester(2.0, -3.3); arrester(2.0, 3.3);
          bigXfmr(4.0, -1.9);                                              // máy biến áp thứ 2 → thành cụm 2 máy
          { const capG = new THREE.Group(); capG.position.set(4.6, 0.24, 2.7); g.add(capG); const rack = bx(1.7, 0.1, 0.7, steel, true, true, lineDark); rack.position.y = 0.6; capG.add(rack); for (let k = 0; k < 5; k++) { const can = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.0, 12), ceramicMat); can.position.set(-0.65 + k * 0.32, 1.1, 0); can.castShadow = true; capG.add(can); } }   // giàn tụ bù
          { const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8), steel); lp.position.set(-4.9, 2.34, 3.3); lp.castShadow = true; g.add(lp); const lamp = bx(0.42, 0.14, 0.24, warningMat, true, true, lineDark); lamp.position.set(-4.65, 4.3, 3.3); g.add(lamp); }   // cột đèn sân trạm
          // (đã gỡ nhà điều khiển phụ/annex ở góc +x,-z theo yêu cầu)
          // ================= HẾT MỞ RỘNG =================
          // ---- hàng rào lưới lớn + cổng + biển cảnh báo ----
          {
            const fy = 0.24, fh = 1.05, hw = 5.6, hd = 3.7;
            const fpost = (x, z) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, fh, 6), steel); m.position.set(x, fy + fh / 2, z); g.add(m); };
            for (let x = -hw; x <= hw + 0.01; x += 1.2) { fpost(x, -hd); fpost(x, hd); }
            for (let z = -hd + 0.55; z < hd; z += 1.1) { fpost(-hw, z); fpost(hw, z); }
            for (const z of [-hd, hd]) { const r = bx(hw * 2, 0.04, 0.04, steel, true, false); r.position.set(0, fy + fh, z); g.add(r); }
            for (const x of [-hw, hw]) { const r = bx(0.04, 0.04, hd * 2, steel, true, false); r.position.set(x, fy + fh, 0); g.add(r); }
            for (const sx of [-1, 1]) { const gate = bx(hw * 0.48, fh, 0.05, gateMat, true, true, lineDark); gate.position.set(sx * hw * 0.5, fy + fh / 2, -hd); g.add(gate); }   // cổng đôi mép -z
          }
          for (const s of [[-3.2, 3.72], [2.6, -3.72]]) { const sign = bx(0.6, 0.46, 0.05, warningMat, true, true, lineDark); sign.position.set(s[0], 0.82, s[1]); g.add(sign); }

          // ---- Hiệu ứng ký hiệu điện ⚡ bay lên ----
          const electSymbols = [];
          const electGroup = new THREE.Group();
          g.add(electGroup);
          {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const ctx = c.getContext('2d');
            ctx.font = 'bold 52px Outfit, sans-serif';
            ctx.fillStyle = '#00bfff'; // neon blue (xanh dương sáng)
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = '#0033aa'; // darker blue shadow
            ctx.shadowBlur = 6;
            ctx.fillText('⚡', 32, 32);
            const eTex = new THREE.CanvasTexture(c);
            for (let n = 0; n < 3; n++) {
              const sp = new THREE.Sprite(new THREE.SpriteMaterial({
                map: eTex,
                transparent: true,
                opacity: 0,
                depthWrite: false
              }));
              sp.scale.setScalar(1.08); // Nhỏ lại 10% (1.2 * 0.9 = 1.08)
              electGroup.add(sp);
              electSymbols.push({ m: sp, ph: n * 1.6 });
            }
          }

          substationAnim = {
            update: (time) => {
              // Ký hiệu điện ⚡ bay lên mềm mại như bong bóng (Chậm lại 20%)
              for (const sym of electSymbols) {
                const p = (time * 0.304 + sym.ph) % 1.0; // 0.38 * 0.8 = 0.304
                sym.m.position.set(
                  1.6 + Math.sin(time * 1.2 + sym.ph) * 0.3, // 1.5 * 0.8 = 1.2
                  1.8 + p * 3.8,
                  -0.35 + Math.cos(time * 0.96 + sym.ph) * 0.3 // 1.2 * 0.8 = 0.96
                );
                sym.m.material.opacity = p < 0.15 ? (p / 0.15) * 0.85 : (1 - p) * 0.85;
                sym.m.scale.setScalar((0.6 + p * 0.8) * 1.17); // Nhỏ lại 10% (1.3 * 0.9 = 1.17)
              }
            }
          };

          bakeStatic(g);
          return p.clone().add(new THREE.Vector3(gx, 0.24 + gantryH, 0).multiplyScalar(ARCHITECTURE_SCALE));
        }
        const subTie = substation(23.5, 27.2);
        const gridDefs = [[26, 27, 10.8], [18.5, 26.8, 10.8], [12.5, 27.0, 10.8], [8.1, 22.0, 10.8], [7.0, 29.0, 10.8]];
        const gridPoles = gridDefs.map(c => poleAt(c[0], c[1], c[2]));
        const buildingTies = [worldCell(13, 27, 7.6 * ARCHITECTURE_SCALE), worldCell(7, 19, 8.5 * ARCHITECTURE_SCALE), worldCell(6, 29, 7.5 * ARCHITECTURE_SCALE)];
        wire(gridPoles[0], subTie, 0.5); wire(subTie, gridPoles[1], 0.5); wire(gridPoles[1], gridPoles[2], 0.55); wire(gridPoles[2], buildingTies[0], 0.45); wire(gridPoles[2], gridPoles[3], 0.7); wire(gridPoles[3], buildingTies[1], 0.45); wire(gridPoles[2], gridPoles[4], 0.65);

        // ---- pin lưu trữ (battery storage / BESS) cạnh cánh đồng pin mặt trời + cột điện nối lưới ----
        function batteryBank() {
          const g = new THREE.Group();
          const padB = bx(5.7, 0.2, 3.0, concreteDark, true, true, lineMat); padB.position.y = 0.1; g.add(padB);
          const contMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), accent = new THREE.MeshLambertMaterial({ color: 0x3f7d8a });
          function container(cxp) {
            const cg = new THREE.Group(); cg.position.set(cxp, 0.2, 0); g.add(cg);
            const body = bx(2.3, 1.7, 2.5, contMat, true, true, lineDark); body.position.y = 0.85; cg.add(body);
            const band = bx(2.32, 0.3, 2.52, accent, true, false); band.position.y = 1.42; cg.add(band);
            const door = bx(0.06, 1.42, 2.0, gateMat, true, true, lineDark); door.position.set(1.18, 0.82, 0); cg.add(door);
            const hvac = bx(0.9, 0.26, 0.8, accent, true, true, lineDark); hvac.position.set(0.3, 1.85, 0.2); cg.add(hvac);
            return cg;
          }
          container(-1.25); container(1.25);
          const term = new THREE.Group(); term.position.set(1.25, 1.92, -0.65); g.add(term);   // sứ đấu nối trên nóc
          for (let k = 0; k < 3; k++) {
            const bu = new THREE.Group(); bu.position.set(-0.35 + k * 0.35, 0, 0); term.add(bu);
            for (let m = 0; m < 3; m++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 8), ceramicMat); d.position.y = m * 0.12; d.castShadow = true; bu.add(d); }
            const t = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), metalMat); t.position.y = 0.36; bu.add(t);
          }
          return bakeStatic(g);
        }
        const BATTERY_CELL = [43, 31];
        {
          const bat = batteryBank(), bp = worldCell(BATTERY_CELL[0], BATTERY_CELL[1]); bat.position.copy(bp); bat.scale.setScalar(ARCHITECTURE_SCALE); bat.name = 'Cụm pin lưu trữ (Battery Storage)'; scene.add(bat);
          obstacleCoords.push({ x: bp.x, y: bp.y, z: bp.z, r: 3.5 * ARCHITECTURE_SCALE, h: 3.0 * ARCHITECTURE_SCALE });
          const batTerm = bp.clone().add(new THREE.Vector3(1.25, 2.3, -0.65).multiplyScalar(ARCHITECTURE_SCALE));
          const batPole = poleAt(44, 30, 10.8);             // cột điện số 6 kế bên pin (cao 10.8m)
          wire(gridPoles[0], batPole, 1.5);              // nối với lưới điện hiện có
          const angle = Math.PI / 4;
          const perpPole = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle));
          const offsetsPole = [-1.05, 0, 1.05];
          const offsetsBat = [-0.35, 0, 0.35];
          for (let k = 0; k < 3; k++) {
            const p0 = batPole.clone().addScaledVector(perpPole, offsetsPole[k]);
            const p2 = bp.clone().add(new THREE.Vector3(1.25 + offsetsBat[k], 2.28, -0.65).multiplyScalar(ARCHITECTURE_SCALE));
            const p1 = p0.clone().lerp(p2, 0.5); p1.y -= 0.2;
            const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
            scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(18)), cableMat));
          }
        }                   // dây hạ xuống pin lưu trữ

