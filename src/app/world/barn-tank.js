        // ---- 1 NHÀ KHO LỚN + một mái gable lớn phủ kín điện mặt trời áp mái — từ góc x202, z76→127 ----
        (function warehouse() {
          const xA = X0 + 202, xB = X0 + 220, zA = Z0 + 76, zB = Z0 + 127;
          const W = Math.abs(xB - xA), L = Math.abs(zB - zA), cX = (xA + xB) / 2, cZ = (zA + zB) / 2;
          const gY = surfaceY(Math.round(x2gi(cX)), Math.round(z2gj(cZ)));
          const g = new THREE.Group(); g.position.set(cX, gY, cZ); g.scale.setScalar(ARCHITECTURE_SCALE); g.name = 'Nhà kho mái pin mặt trời (Solar Warehouse)'; scene.add(g);
          const eaveH = 3.4, ridgeH = 3.0, halfW = W / 2, slope = halfW, slabLen = Math.hypot(slope, ridgeH), ang = Math.atan2(ridgeH, slope);
          const roofHAt = (x) => eaveH + ridgeH * (1 - Math.abs(x) / halfW);   // cao độ đáy mái tại vị trí x (giữa = nóc, mép = diềm)
          const base = bx(W + 0.4, 0.3, L + 0.4, concreteMat); base.position.y = 0.15; g.add(base);                    // nền bê-tông

          // ---- TƯỜNG BAO (knee wall) quanh chu vi, chừa dải hở trên để lộ kết cấu ----
          const kneeH = 1.6;
          for (const sx of [-1, 1]) { const w = bx(0.28, kneeH, L, wallMat, true, true, lineDark); w.position.set(sx * halfW, kneeH / 2, 0); g.add(w); }       // 2 tường dọc (giữ lại)
          for (const sx of [-1, 1]) { const s2 = bx(0.28, 0.18, L + 0.2, concreteDark); s2.position.set(sx * halfW, kneeH, 0); g.add(s2); }                     // giằng đỉnh tường dọc

          // ---- CỘT CHỐNG đúng độ cao tới mái (giữa cao tới nóc, mép tới diềm) ----
          const nCol = 11, colXf = [-0.92, 0, 0.92];
          for (let c = 0; c <= nCol; c++) { const cz = -L / 2 + (L / nCol) * c; for (const f of colXf) { const fx = f * halfW, h = roofHAt(fx); const col = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, h, 10), legMat); col.castShadow = true; col.position.set(fx, h / 2, cz); g.add(col); } }

          // ---- KẾT CẤU BÊN TRONG: vì kèo thép tại mỗi hàng cột (tie beam · rafter · king/queen post) ----
          for (let c = 0; c <= nCol; c++) {
            const cz = -L / 2 + (L / nCol) * c;
            const tie = bx(W * 0.97, 0.16, 0.14, metalMat, true, false); tie.position.set(0, eaveH, cz); g.add(tie);                                            // thanh giằng ngang
            for (const sx of [-1, 1]) { const raf = bx(slabLen * 0.97, 0.12, 0.12, metalMat, true, false); raf.rotation.z = -sx * ang; raf.position.set(sx * slope / 2, eaveH + ridgeH / 2, cz); g.add(raf); }   // 2 kèo nghiêng
            const kp = bx(0.12, ridgeH, 0.12, metalMat, true, false); kp.position.set(0, eaveH + ridgeH / 2, cz); g.add(kp);                                    // king post
            for (const sx of [-1, 1]) { const qp = bx(0.1, ridgeH * 0.5, 0.1, metalMat, true, false); qp.position.set(sx * halfW * 0.5, eaveH + ridgeH * 0.25, cz); g.add(qp); }   // queen posts
          }
          // xà gồ dọc (purlins) dưới hai mái + dầm nóc
          for (const sx of [-1, 1]) for (const t of [0.34, 0.67]) { const px = sx * halfW * (1 - t), py = eaveH + ridgeH * t; const pur = bx(0.1, 0.1, L * 0.99, metalMat, true, false); pur.position.set(px, py - 0.12, 0); g.add(pur); }
          const ridgeBeam = bx(0.14, 0.14, L * 0.99, metalMat, true, false); ridgeBeam.position.set(0, eaveH + ridgeH - 0.12, 0); g.add(ridgeBeam);

          // ---- MÁI gable lớn + pin áp mái phủ kín ----
          const pvMat = glassMat.clone(); pvMat.map = cellRep.clone(); pvMat.map.repeat.set(6, Math.round(L / 2.4)); pvMat.map.needsUpdate = true;
          for (const sx of [-1, 1]) {
            const roof = bx(slabLen, 0.16, L, roofMat, true, true, lineDark); roof.rotation.z = -sx * ang; roof.position.set(sx * slope / 2, eaveH + ridgeH / 2, 0); g.add(roof);   // mặt mái dốc
            const pv = new THREE.Mesh(new THREE.BoxGeometry(slabLen * 0.97, 0.08, L * 0.98), pvMat); pv.castShadow = true; pv.rotation.z = -sx * ang; pv.position.set(sx * slope / 2, eaveH + ridgeH / 2 + 0.14, 0); g.add(pv);   // pin áp mái phủ kín toàn mái (share pvMat → bake gộp 2 mái thành 1)
          }
          const cap = bx(0.4, 0.25, L, concreteDark); cap.position.set(0, eaveH + ridgeH, 0); g.add(cap);              // nóc mái (ridge)
          for (let z = -L / 2 + 6; z <= L / 2 - 6; z += 12) obstacleCoords.push({ x: cX, y: gY, z: cZ + z * ARCHITECTURE_SCALE, r: (W / 2 + 1.5) * ARCHITECTURE_SCALE, h: (eaveH + ridgeH + 1.0) * ARCHITECTURE_SCALE });   // nhà kho DÀI → capsule vài vòng dọc trục Z để ong/bướm né trọn
          bakeStatic(g);
        })();

        // ---- BỒN NƯỚC nông thôn (thân lượn sóng + bệ đá) tại góc (192, 7, 80) ----
        (function waterTank() {
          const g = new THREE.Group(); g.position.set(X0 + 192, 7, Z0 + 80); g.scale.setScalar(ARCHITECTURE_SCALE); g.name = 'Bồn nước nông thôn (Rural Water Tank)'; scene.add(g);
          const R = 2.6, bodyH = 3.2, baseTop = 0.8;
          const tankMat = surfaceStyle(new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), 'stucco');   // kem
          const stoneMat = surfaceStyle(new THREE.MeshLambertMaterial({ color: 0x9a8f7e }), 'concrete');
          const stone = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.9, R + 1.15, baseTop, 22), stoneMat); stone.position.y = baseTop / 2; stone.castShadow = true; stone.receiveShadow = true; g.add(stone);   // bệ đá
          const bodyGeo = new THREE.CylinderGeometry(R, R, bodyH, 30); const body = new THREE.Mesh(bodyGeo, tankMat); body.position.y = baseTop + bodyH / 2; body.castShadow = true; body.receiveShadow = true; g.add(body); edge(body, bodyGeo);   // thân bồn
          const nRib = 9; for (let r = 0; r < nRib; r++) { const ry = baseTop + (bodyH / nRib) * (r + 0.5); const rib = new THREE.Mesh(new THREE.TorusGeometry(R + 0.04, 0.075, 6, 30), tankMat); rib.rotation.x = Math.PI / 2; rib.position.y = ry; rib.castShadow = true; g.add(rib); }   // gân lượn sóng
          const roofGeo = new THREE.ConeGeometry(R + 0.1, 0.95, 30); const roof = new THREE.Mesh(roofGeo, tankMat); roof.position.y = baseTop + bodyH + 0.47; roof.castShadow = true; g.add(roof); edge(roof, roofGeo);   // mái chóp thấp
          const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 10), tankMat); vent.position.y = baseTop + bodyH + 0.95; g.add(vent);   // nắp/ống thông hơi
          const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, bodyH + 0.5, 8), new THREE.MeshLambertMaterial({ color: 0x6b6b66 })); pipe.position.set(R + 0.14, baseTop + bodyH / 2 - 0.1, 0.4); pipe.castShadow = true; g.add(pipe);   // ống dẫn bên hông
          bakeStatic(g);
        })();

