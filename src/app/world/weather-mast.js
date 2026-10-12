        // ---- cột khí tượng cạnh trạm biến áp — dựng theo trạm thật: ống cột kaki, phong kế cánh quạt + đuôi lái, ăng-ten Yagi,
        //      thùng đo mưa viền vàng, hộp chắn bức xạ nhiều tầng, pin mặt trời, tủ datalogger; kế bên là trạm mini chân ba (tripod) ----
        const stationTan = new THREE.MeshLambertMaterial({ color: 0xa99d80 }), stationAlu = new THREE.MeshLambertMaterial({ color: 0xb4bbbf });
        const stationBox = new THREE.MeshLambertMaterial({ color: 0xc8cdc6 }), stationDark = new THREE.MeshLambertMaterial({ color: 0x30353a });
        const stationGround = (x, z) => surfaceY(Math.round(x / BLOCK + cx - 0.5), Math.round(z / BLOCK + cz - 0.5));
        const _stUp = new THREE.Vector3(0, 1, 0), _stDir = new THREE.Vector3();
        function stationRod(parent, a, b, r, mat, segs = 8) {   // ống tròn nối 2 điểm: chân · giằng · cần · trụ
          _stDir.subVectors(b, a); const m = cyl(r, r, _stDir.length(), mat, r > 0.025, false, null, segs);
          m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(_stUp, _stDir.normalize()); parent.add(m); return m;
        }
        function stationCable(parent, pts) {   // cáp tín hiệu dạng LineSegments → bakeStatic gộp chung 1 draw call
          const seg = []; for (let k = 1; k < pts.length; k++) seg.push(pts[k - 1], pts[k]);
          parent.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(seg), cableMat));
        }
        function gillShield(parent, x, yTop, z, r, plates) {   // hộp chắn bức xạ nhiều tầng (multi-plate gill shield) che cảm biến nhiệt-ẩm
          const sg = new THREE.Group(); sg.position.set(x, yTop, z); parent.add(sg);
          const cap = cyl(r * 0.8, r * 1.06, 0.07, wallMat, true, true, lineMat, 16); cap.position.y = -0.035; sg.add(cap);
          for (let k = 1; k <= plates; k++) { const p = cyl(r, r * 1.04, 0.024, wallMat, true, true, lineMat, 16); p.position.y = -0.035 - k * 0.064; sg.add(p); }
          const stackH = plates * 0.064, core = cyl(r * 0.5, r * 0.5, stackH, stationDark, false, false, null, 10); core.position.y = -0.07 - stackH / 2; sg.add(core);
          for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.5, rod = cyl(0.012, 0.012, stackH + 0.05, stationAlu, false, false, null, 5); rod.position.set(Math.cos(a) * r * 0.78, -0.06 - stackH / 2, Math.sin(a) * r * 0.78); sg.add(rod); }
        }
        function windMonitor() {   // phong kế cánh quạt + đuôi lái (propeller wind monitor): cả cụm xoay theo hướng gió (+X = mũi đón gió), cánh quạt quay theo tốc độ gió
          const vane = new THREE.Group();
          const stub = cyl(0.04, 0.05, 0.16, stationTan, true, false, null, 10); stub.position.y = -0.1; vane.add(stub);
          const body = cyl(0.04, 0.07, 1.0, wallMat, true, false, null, 12); body.rotation.z = Math.PI / 2; body.position.x = 0.02; vane.add(body);   // thân thon dần về đuôi
          const nacelle = cyl(0.085, 0.085, 0.2, wallMat, true, true, lineMat, 14); nacelle.rotation.z = Math.PI / 2; nacelle.position.x = 0.44; vane.add(nacelle);
          const fin = bx(0.32, 0.52, 0.024, wallMat, true, true, lineMat); fin.position.set(-0.6, 0.05, 0); vane.add(fin);
          const prop = new THREE.Group(); prop.position.x = 0.6; vane.add(prop);
          const hub = cone(0.06, 0.14, stationDark, true, false, null, 10); hub.rotation.z = -Math.PI / 2; hub.position.x = 0.07; prop.add(hub);
          for (let k = 0; k < 4; k++) {   // 4 cánh xoắn (helicoid) màu tối
            const arm = new THREE.Group(); arm.rotation.x = k * Math.PI / 2; prop.add(arm);
            const blade = bx(0.018, 0.25, 0.075, stationDark, true, false); blade.position.y = 0.16; blade.rotation.y = 0.45; arm.add(blade);
          }
          prop.userData.noBake = true;
          return { vane, prop };
        }
        function weatherMast(x, z) {
          const g = new THREE.Group(); g.position.set(x, stationGround(x, z), z); g.name = 'Cột khí tượng (Weather Mast)';
          const V = (px, py, pz) => new THREE.Vector3(px, py, pz);
          const Hp = 10.3, armY = 10.0, yagiY = 9.4, postX = -0.34, rodX = 0.6, rodTop = 12.0;
          // móng bê tông + ống cột kaki thon nhẹ, khớp nối ống, đai kẹp cáp, nắp đỉnh
          const footing = cyl(0.36, 0.42, 0.24, concreteDark, true, true, lineMat, 16); footing.position.y = 0.04; g.add(footing);
          const pole = cyl(0.13, 0.165, Hp, stationTan, true, false, null, 12); pole.position.y = Hp / 2; g.add(pole);
          for (const y of [0.3, 3.5, 6.6]) { const joint = cyl(0.19, 0.19, 0.16, stationTan, true, true, lineDark, 16); joint.position.y = y; g.add(joint); }
          for (const y of [8.25, 8.95, 9.65]) { const band = cyl(0.148, 0.148, 0.05, stationDark, false, false, null, 12); band.position.y = y; g.add(band); }
          const capTop = cyl(0.15, 0.15, 0.1, stationTan, true, true, lineDark, 16); capTop.position.y = Hp + 0.05; g.add(capTop);
          // xà ngang lệch: nhánh phải dài, mút có đầu cảm biến nhỏ; kim thu sét + đèn báo cao nhất, đứng ngoài vòng quét của phong kế
          stationRod(g, V(-0.95, armY, 0), V(2.6, armY, 0), 0.05, stationTan, 10);
          const clamp = bx(0.38, 0.24, 0.36, stationTan, true, true, lineDark); clamp.position.y = armY; g.add(clamp);
          stationRod(g, V(2.52, armY, 0), V(2.52, armY + 0.28, 0), 0.025, stationAlu, 6);
          const head = cyl(0.07, 0.07, 0.14, stationDark, true, true, lineDark, 14); head.position.set(2.52, armY + 0.35, 0); g.add(head);
          const headCap = cyl(0.085, 0.085, 0.03, wallMat, true, false, null, 14); headCap.position.set(2.52, armY + 0.435, 0); g.add(headCap);
          stationRod(g, V(rodX, armY, 0), V(rodX, rodTop, 0), 0.022, stationAlu, 6);
          const rodClamp = bx(0.12, 0.14, 0.12, stationTan, true, false); rodClamp.position.set(rodX, armY, 0); g.add(rodClamp);
          // trụ phụ mang phong kế, kẹp vào xà ngang và cần ăng-ten Yagi
          stationRod(g, V(postX, yagiY - 0.1, 0), V(postX, 11.0, 0), 0.04, stationTan, 10);
          for (const y of [armY, yagiY]) { const pc = bx(0.13, 0.13, 0.13, stationTan, true, false); pc.position.set(postX, y, 0); g.add(pc); }
          stationRod(g, V(-0.1, yagiY, 0), V(postX, yagiY, 0), 0.03, stationTan);
          const wm = windMonitor(); wm.vane.position.set(postX, 11.18, 0); g.add(wm.vane);
          // la bàn cố định ngay dưới phong kế: 4 thanh B·Đ·N·T (bắc = −Z, thanh bắc sơn đỏ) — đối chiếu mũi phong kế để đọc hướng gió
          const compassY = 10.86, northMat = new THREE.MeshLambertMaterial({ color: 0xc8402f, transparent: true, opacity: 0.5, depthWrite: false }), arrowMat = new THREE.MeshLambertMaterial({ color: 0xb8bcc0, transparent: true, opacity: 0.5, depthWrite: false });   // vector hướng trong 50%
          const compassHub = cyl(0.055, 0.055, 0.07, stationDark, true, false, null, 10); compassHub.position.set(postX, compassY, 0); g.add(compassHub);
          const letterTex = (ch, col) => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.font = 'bold 44px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 7; x.strokeStyle = 'rgba(240,234,222,0.9)'; x.strokeText(ch, 32, 34); x.fillStyle = col; x.fillText(ch, 32, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
          for (const [dx, dz, ch, north] of [[0, -1, 'B', true], [1, 0, 'Đ', false], [0, 1, 'N', false], [-1, 0, 'T', false]]) {
            stationRod(g, V(postX, compassY, 0), V(postX + dx * 0.4, compassY, dz * 0.4), north ? 0.016 : 0.012, north ? northMat : arrowMat, 6);
            const tip = cone(north ? 0.04 : 0.03, 0.09, north ? northMat : arrowMat, false, false, null, 8); tip.position.set(postX + dx * 0.44, compassY, dz * 0.44); tip.rotation.set(dz * Math.PI / 2, 0, -dx * Math.PI / 2); g.add(tip);
            const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: letterTex(ch, north ? '#c8402f' : '#243240'), transparent: true, depthWrite: false }));
            lab.scale.set(0.26, 0.26, 1); lab.position.set(postX + dx * 0.6, compassY + 0.02, dz * 0.6); g.add(lab);
          }
          // nhãn hướng gió nổi ngay trên thân phong kế: "Gió Đông Bắc · 45°" — vẽ lại khi số liệu đổi
          const badgeCanvas = document.createElement('canvas'); badgeCanvas.width = 512; badgeCanvas.height = 96;
          const badgeTex = new THREE.CanvasTexture(badgeCanvas); badgeTex.colorSpace = THREE.SRGBColorSpace;
          const windBadge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTex, transparent: true, depthWrite: false, depthTest: false }));
          windBadge.name = 'Nhãn hướng gió'; windBadge.renderOrder = 20; windBadge.scale.set(2.3, 0.43, 1); windBadge.position.set(postX + 0.1, 11.82, 0); g.add(windBadge);
          let badgeKey = null;
          const setWindBadge = (deg, speed) => {
            const ok = Number.isFinite(deg), key = ok ? Math.round(deg) + '|' + Math.round(speed || 0) : '—';
            if (key === badgeKey) return; badgeKey = key;
            const names = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
            const text = ok ? 'Gió ' + names[Math.round((((deg % 360) + 360) % 360) / 45) % 8] + ' · ' + Math.round(deg) + '°' + (Number.isFinite(speed) ? ' · ' + Math.round(speed) + ' km/h' : '') : 'Gió · chưa có số liệu';
            const x = badgeCanvas.getContext('2d'); x.clearRect(0, 0, 512, 96); x.font = '600 38px Inter, system-ui, Arial';
            const w = Math.min(500, x.measureText(text).width + 56);
            x.beginPath(); x.roundRect(256 - w / 2, 10, w, 76, 34); x.fillStyle = 'rgba(226,214,192,0.82)'; x.fill();   // nền thẻ, không viền
            x.fillStyle = '#1f2a33'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 50);
            badgeTex.needsUpdate = true;
          };
          setWindBadge(NaN);
          // ăng-ten Yagi truyền số liệu (telemetry): cần ngang chĩa về tây, 5 phần tử đứng ngắn dần
          stationRod(g, V(postX, yagiY, 0), V(-2.05, yagiY, 0), 0.026, stationAlu);
          for (const [ex, len] of [[-0.55, 0.56], [-0.86, 0.5], [-1.2, 0.46], [-1.55, 0.43], [-1.9, 0.4]]) stationRod(g, V(ex, yagiY - len / 2, 0), V(ex, yagiY + len / 2, 0), 0.014, stationAlu, 6);
          const feedBox = bx(0.06, 0.09, 0.07, stationDark, false, false); feedBox.position.set(-0.86, yagiY, 0.03); g.add(feedBox);
          // pin mặt trời nhỏ bên phải, nằm ngang hướng thẳng lên trời, tựa trên cần đỡ + thanh chống chéo
          const pv = new THREE.Group(); pv.position.set(0.66, 8.67, 0); g.add(pv);
          pv.add(bx(0.8, 0.035, 0.58, stationAlu, true, true, lineDark));
          const pvCells = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.04, 0.52), glassMat); pvCells.castShadow = true; pvCells.receiveShadow = true; pv.add(pvCells);
          stationRod(g, V(0.1, 8.62, 0), V(0.9, 8.62, 0), 0.025, stationTan);
          stationRod(g, V(0.1, 8.2, 0), V(0.62, 8.6, 0), 0.02, stationTan);
          // bệ đỡ chung: tủ datalogger sát thân cột + thùng đo mưa viền vàng; hộp chắn bức xạ treo trên cần ngay bên dưới
          const plate = bx(1.16, 0.04, 0.34, stationAlu, true, true, lineDark); plate.position.set(-0.72, 7.46, 0.02); g.add(plate);
          const box = bx(0.44, 0.74, 0.3, stationBox, true, true, lineDark); box.position.set(-0.52, 7.85, 0); g.add(box);
          const door = bx(0.38, 0.64, 0.02, stationBox, false, true, lineDark); door.position.set(-0.52, 7.85, 0.16); g.add(door);
          const latch = bx(0.04, 0.1, 0.03, stationDark, false, false); latch.position.set(-0.37, 7.85, 0.175); g.add(latch);
          const hood = bx(0.5, 0.035, 0.36, stationBox, true, true, lineDark); hood.position.set(-0.52, 8.24, 0.02); g.add(hood);
          for (const y of [7.6, 8.1]) { const strap = bx(0.24, 0.06, 0.08, stationTan, true, false); strap.position.set(-0.2, y, 0); g.add(strap); }
          const gauge = cyl(0.245, 0.245, 0.62, wallMat, true, true, lineMat, 16); gauge.position.set(-1.0, 7.79, 0.02); g.add(gauge);
          const rim = cyl(0.26, 0.255, 0.26, warningMat, true, true, lineDark, 16); rim.position.set(-1.0, 8.23, 0.02); g.add(rim);
          const mouth = cyl(0.22, 0.22, 0.012, stationDark, false, false, null, 16); mouth.position.set(-1.0, 8.366, 0.02); g.add(mouth);
          stationRod(g, V(-0.12, 7.3, 0), V(-0.98, 7.3, 0), 0.032, stationTan);
          gillShield(g, -0.62, 7.27, 0, 0.29, 8);
          // cáp: phong kế → tủ, cuộn cáp dư (service loop) trước thân cột, dây tiếp địa chạy dọc cột xuống móng
          stationCable(g, [V(postX, 9.3, 0.05), V(-0.25, 9.0, 0.14), V(-0.22, 8.6, 0.17), V(-0.38, 8.27, 0.1)]);
          const loop = []; for (let k = 0; k <= 20; k++) { const a = k / 20 * Math.PI * 2; loop.push(V(0.03 + Math.sin(a) * 0.17, 7.84 + Math.cos(a) * 0.22 - k * 0.006, 0.21)); }
          stationCable(g, loop);
          stationCable(g, [V(-0.3, 7.5, 0.12), V(-0.12, 7.15, 0.2), V(0, 6.7, 0.2), V(0, 0.18, 0.2)]);
          const light = sph(0.09, new THREE.MeshBasicMaterial({ color: 0xff3b30 }), false, false, null, 10); light.position.set(rodX, rodTop + 0.06, 0); g.add(light);
          wm.vane.userData.noBake = light.userData.noBake = true;   // phong kế (kèm cánh quạt) · đèn nháy giữ động
          bakeStatic(g); bakeStatic(wm.vane); bakeStatic(wm.prop);
          return { g, vane: wm.vane, prop: wm.prop, light, setWindBadge, top: V(rodX, rodTop + 0.12, 0), feed: V(-0.52, 8.1, -0.16) };   // top: neo nhãn · feed: điểm nhận cáp điện lưới
        }
        function tripodStation(x, z) {   // trạm khí tượng mini chân ba (tripod) — thấp, đặt kế cột chính
          const g = new THREE.Group(), y0 = stationGround(x, z); g.position.set(x, y0, z); g.name = 'Trạm khí tượng mini (Tripod Weather Station)';
          const V = (px, py, pz) => new THREE.Vector3(px, py, pz);
          const topY = 2.95, armY = 2.86, collarY = 1.15, lowY = 0.32;
          stationRod(g, V(0, lowY, 0), V(0, topY, 0), 0.05, stationAlu, 10);
          const cap = cyl(0.056, 0.056, 0.035, stationDark, false, false, null, 10); cap.position.y = topY; g.add(cap);
          for (const [y, r, h] of [[collarY, 0.085, 0.14], [lowY, 0.075, 0.1]]) { const c = cyl(r, r, h, stationAlu, true, true, lineDark, 14); c.position.y = y; g.add(c); }
          // ba chân ống nhôm choãi + giằng chéo về khớp dưới; mỗi chân tự dài/ngắn theo bậc đất voxel dưới bàn chân
          for (const deg of [50, 170, 290]) {
            const a = deg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = 1.2;
            const fy = stationGround(x + ca * R, z + sa * R) - y0;
            const top = V(ca * 0.08, collarY, sa * 0.08), foot = V(ca * R, fy + 0.04, sa * R);
            stationRod(g, top, foot, 0.032, stationAlu);
            const pad = cyl(0.08, 0.095, 0.04, stationDark, true, false, null, 10); pad.position.set(foot.x, fy + 0.02, foot.z); g.add(pad);
            stationRod(g, top.clone().lerp(foot, 0.36), V(ca * 0.07, lowY, sa * 0.07), 0.018, stationAlu, 6);
          }
          // xà ngang đỉnh: pin mặt trời nằm ngang trên nhánh trái, cảm biến bức xạ + phong kế chén bên phải
          stationRod(g, V(-0.62, armY, 0), V(1.05, armY, 0), 0.03, stationAlu);
          const clamp = bx(0.15, 0.16, 0.15, stationAlu, true, true, lineDark); clamp.position.y = armY; g.add(clamp);
          const pv = new THREE.Group(); pv.position.set(-0.4, 2.909, 0); g.add(pv);   // nằm ngang, mặt pin hướng thẳng lên trời
          pv.add(bx(0.58, 0.03, 0.44, stationAlu, true, true, lineDark));
          const pvCells = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.034, 0.38), glassMat); pvCells.castShadow = true; pvCells.receiveShadow = true; pv.add(pvCells);
          stationRod(g, V(-0.05, 2.6, 0), V(-0.45, 2.84, 0), 0.014, stationAlu, 6);   // thanh chống chéo đỡ nhánh trái
          const sStem = cyl(0.018, 0.018, 0.1, stationAlu, false, false, null, 6); sStem.position.set(0.48, armY + 0.07, 0); g.add(sStem);
          const sBody = cyl(0.045, 0.05, 0.15, stationBox, true, true, lineDark, 14); sBody.position.set(0.48, armY + 0.19, 0); g.add(sBody);
          const sCap = cyl(0.055, 0.055, 0.025, stationDark, false, false, null, 10); sCap.position.set(0.48, armY + 0.28, 0); g.add(sCap);
          stationRod(g, V(1.0, armY, 0), V(1.0, armY + 0.22, 0), 0.018, stationAlu, 6);
          const anem = new THREE.Group(); anem.position.set(1.0, armY + 0.26, 0); g.add(anem);
          anem.add(cyl(0.03, 0.04, 0.07, stationDark, true, false, null, 8));
          for (let k = 0; k < 3; k++) {   // 3 chén gió: miệng chén cùng quay một chiều
            const piv = new THREE.Group(); piv.rotation.y = k / 3 * Math.PI * 2; anem.add(piv);
            const arm = cyl(0.008, 0.008, 0.16, stationAlu, false, false, null, 5); arm.rotation.z = Math.PI / 2; arm.position.x = 0.09; piv.add(arm);
            const cup = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), stationDark); cup.rotation.x = -Math.PI / 2; cup.position.x = 0.19; cup.castShadow = true; piv.add(cup);
          }
          stationRod(g, V(0.04, 2.4, 0), V(0.48, 2.4, 0), 0.02, stationAlu, 6);
          gillShield(g, 0.48, 2.37, 0, 0.19, 9);
          // tủ datalogger trước thân cột (ốc siết cáp dưới đáy) + hộp đấu nối nhỏ phía trên
          const box = bx(0.52, 0.58, 0.24, stationBox, true, true, lineDark); box.position.set(0, 1.55, 0.19); g.add(box);
          const door = bx(0.46, 0.52, 0.02, stationBox, false, true, lineDark); door.position.set(0, 1.55, 0.315); g.add(door);
          const tag = bx(0.2, 0.09, 0.006, wallMat, false, false); tag.position.set(-0.08, 1.68, 0.328); g.add(tag);
          for (const gx of [-0.14, 0, 0.14]) { const gland = cyl(0.022, 0.022, 0.05, stationDark, false, false, null, 6); gland.position.set(gx, 1.24, 0.19); g.add(gland); }
          const jbox = bx(0.24, 0.22, 0.17, stationBox, true, true, lineDark); jbox.position.set(0.1, 1.95, 0.13); g.add(jbox);
          for (const y of [1.36, 1.74]) { const strap = bx(0.12, 0.05, 0.12, stationAlu, true, false); strap.position.set(0, y, 0.06); g.add(strap); }
          // cáp: phong kế → hộp đấu nối, hộp chắn → tủ, pin mặt trời → tủ (đi men mép tủ)
          stationCable(g, [V(1.0, armY - 0.03, 0.03), V(0.6, armY - 0.06, 0.04), V(0.06, armY - 0.08, 0.06), V(0.06, 2.1, 0.06), V(0.1, 2.06, 0.13)]);
          stationCable(g, [V(0.34, 1.72, 0.1), V(0.3, 1.5, 0.2), V(0.28, 1.25, 0.2), V(0.14, 1.21, 0.19)]);
          stationCable(g, [V(-0.28, 2.88, 0.06), V(-0.27, 2.5, 0.1), V(-0.26, 2.1, 0.12), V(-0.3, 1.8, 0.12), V(-0.3, 1.25, 0.15), V(-0.14, 1.21, 0.19)]);
          anem.userData.noBake = true;
          bakeStatic(g); bakeStatic(anem);
          obstacleCoords.push({ x, y: y0, z, r: 1.4, h: 3.2 });
          return { g, anem, top: V(0, topY + 0.04, 0) };   // top: neo nhãn khí tượng (đỉnh cột trạm mini)
        }
        const wmast = weatherMast(X0 + 73, Z0 + 89); scene.add(wmast.g);   // cột khí tượng ở tọa độ góc (73, _, 89), chân cột đặt đúng mặt đất
        const wmini = tripodStation(X0 + 75.8, Z0 + 88.4); scene.add(wmini.g);   // trạm mini chân ba cách cột chính ~2,8 m về phía đông

