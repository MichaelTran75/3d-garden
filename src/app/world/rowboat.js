        // ===== XUỒNG GỖ ở mép hồ thượng lưu, toạ độ góc (68, _, 50) (G 14/10) — dựng bằng code theo số đo mẫu "Boat" (DJMaesen, Sketchfab, CC-BY-4.0;
        //      chỉ đo): dài 4,3 · rộng 1,35 (0,31 dài) · mạn cao 0,55 giữa, 2 đầu nhọn vểnh lên 0,71 (sống mũi = sống lái, xuồng 2 đầu) · đáy cong
        //      (sống thuyền giữa thấp nhất, cong lên 2 đầu) · sàn ván ~0,26 trên đáy · băng ngồi ~0,43 · ván ghép phong hoá nâu sẫm có đinh,
        //      sống đáy sẫm hơn. Ở đây thu lại dài 3,6 đv cho hợp cỡ người; kéo nửa lên bờ: mũi gác bãi, lái nổi trên nước, dây buộc vào cọc ----
        {
          const L = 3.6, X = X0 + 68, Z = Z0 + 50;
          const bU = u => 0.156 * Math.pow(Math.sin(Math.PI * u), 0.7), ysU = u => 0.128 + 0.037 * Math.pow(Math.abs(2 * u - 1), 6), ykU = u => -0.026 + 0.14 * Math.pow(Math.abs(2 * u - 1), 2.4);
          // ván ghép: canvas 512×256 (x = dọc thân, y = từ sống đáy lên mạn) — 6 dải ván, mạch ván sẫm, đinh dọc mạch, vân gỗ, mảng phong hoá xám, rêu sát đáy
          const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
          c.fillStyle = '#5b4632'; c.fillRect(0, 0, 512, 256);
          for (let k = 0; k < 900; k++) { const y = Math.random() * 256, x = Math.random() * 512, l = 20 + Math.random() * 80; c.strokeStyle = `rgba(${Math.random() < 0.5 ? '40,28,18' : '120,96,70'},${0.15 + Math.random() * 0.2})`; c.lineWidth = 0.6 + Math.random(); c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + (Math.random() - 0.5) * 2); c.stroke(); }   // vân gỗ dọc ván
          for (let k = 0; k < 26; k++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, 'rgba(150,140,125,0.35)'); g.addColorStop(1, 'rgba(150,140,125,0)'); c.save(); c.translate(Math.random() * 512, Math.random() * 256); c.scale(30 + Math.random() * 70, 10 + Math.random() * 20); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 7); c.fill(); c.restore(); }   // phong hoá
          for (let s = 1; s < 6; s++) {   // mạch ván + đinh
            const y = 256 - s * 256 / 6; c.fillStyle = 'rgba(25,17,10,0.85)'; c.fillRect(0, y - 1.5, 512, 3); c.fillStyle = 'rgba(160,150,140,0.55)'; c.fillRect(0, y + 1.5, 512, 1);
            c.fillStyle = 'rgba(30,26,24,0.9)'; for (let x = 6; x < 512; x += 22) { c.beginPath(); c.arc(x, y + 4, 1.4, 0, 7); c.fill(); }
          }
          const gb = c.createLinearGradient(0, 256, 0, 190); gb.addColorStop(0, 'rgba(35,40,22,0.75)'); gb.addColorStop(1, 'rgba(35,40,22,0)'); c.fillStyle = gb; c.fillRect(0, 190, 512, 66);   // rêu, nước ngấm sát đáy
          c.fillStyle = 'rgba(20,14,9,0.9)'; c.fillRect(0, 248, 512, 8);   // sống đáy
          const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
          const hullM = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), woodM = new THREE.MeshLambertMaterial({ color: 0x6b5238 }), darkM = new THREE.MeshLambertMaterial({ color: 0x3e2f22 });
          // vỏ: lưới quét theo các mặt cắt (NU đốt dọc × 2·NT−1 điểm từ mạn trái qua sống đáy sang mạn phải)
          const NU = 28, NT = 9, pos = [], uv = [], idx = [], W = 2 * NT - 1;
          for (let i = 0; i <= NU; i++) {
            const u = i / NU, b = bU(u), ys = ysU(u), yk = ykU(u);
            for (let j = 0; j < W; j++) {
              const t = Math.abs(j - (NT - 1)) / (NT - 1), sd = j < NT - 1 ? -1 : 1;
              pos.push((u - 0.5) * L, (yk + (ys - yk) * Math.pow(1 - Math.cos(Math.PI / 2 * t), 0.85)) * L, sd * b * Math.sin(Math.PI / 2 * t) * L);
              uv.push(u * 2.2, t);   // CanvasTexture lật dọc: t = 0 sống đáy (đáy canvas) → 1 mạn
            }
          }
          for (let i = 0; i < NU; i++) for (let j = 0; j < W - 1; j++) { const a = i * W + j, b = a + W; idx.push(a, b, a + 1, a + 1, b, b + 1); }
          const hg = new THREE.BufferGeometry(); hg.setIndex(idx); hg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); hg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); hg.computeVertexNormals();
          tex.wrapS = THREE.RepeatWrapping;
          const boat = new THREE.Group(); boat.name = 'Xuồng gỗ (Rowboat)';
          const hull = new THREE.Mesh(hg, hullM); hull.castShadow = hull.receiveShadow = true; boat.add(hull);
          const at = (u, k) => new THREE.Vector3((u - 0.5) * L, (ykU(u) + (ysU(u) - ykU(u)) * k) * L, 0);
          // sống mũi / sống lái nhô cao 2 đầu · cạp mạn (thanh gỗ chạy dọc mép) · sàn ván · 3 băng ngồi · cọc chèo
          for (const u of [0, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.07, (0.165 - ykU(u)) * L + 0.05, 0.06), darkM); st.position.set((u - 0.5) * L * 0.995, ((0.165 + ykU(u)) / 2) * L, 0); st.rotation.z = (u ? -1 : 1) * 0.12; st.castShadow = true; boat.add(st); }
          for (const sd of [-1, 1]) {
            const pts = []; for (let i = 0; i <= 20; i++) { const u = 0.02 + i / 20 * 0.96; pts.push(new THREE.Vector3((u - 0.5) * L, ysU(u) * L + 0.012, sd * bU(u) * L)); }
            const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.028, 5), woodM); rail.castShadow = true; boat.add(rail);
          }
          const fl = new THREE.Mesh(new THREE.BoxGeometry(0.5 * L, 0.025, 0.11 * L), woodM); fl.position.set(0, (ykU(0.5) + 0.06) * L, 0); fl.receiveShadow = true; boat.add(fl);
          for (const u of [0.3, 0.5, 0.72]) { const th = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 2 * bU(u) * L * 0.9), woodM); th.position.set((u - 0.5) * L, 0.1 * L, 0); th.castShadow = th.receiveShadow = true; boat.add(th); }
          for (const sd of [-1, 1]) for (const dx of [-0.07, 0.07]) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.12, 5), darkM); pin.position.set(0.05 + dx, ysU(0.52) * L + 0.07, sd * bU(0.52) * L); boat.add(pin); }
          for (const sd of [-1, 1]) {   // 2 mái chèo để nằm dọc trong xuồng, gác lên băng ngồi
            const oar = new THREE.Group(); oar.position.set(-0.05, 0.1 * L + 0.04, sd * 0.13); oar.rotation.set(sd * 0.05, sd * 0.06, 0.04); boat.add(oar);
            const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 2.1, 6), woodM); sh.rotation.z = Math.PI / 2; sh.castShadow = true; oar.add(sh);
            const bl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.13), woodM); bl.position.x = 1.15; bl.castShadow = true; oar.add(bl);
          }
          // đặt: mũi hướng vào bờ (phía đất cao), lái ra mặt nước; gác theo mặt đất / mặt nước dưới mũi và lái
          let bx = 0, bz = 0; for (let a = 0; a < 16; a++) { const ang = a / 16 * TAU, px = X + Math.cos(ang) * 2.5, pz = Z + Math.sin(ang) * 2.5; if (!isWater(Math.round(x2gi(px)), Math.round(z2gj(pz)))) { bx += Math.cos(ang); bz += Math.sin(ang); } }
          const yaw = Math.atan2(-bz, bx), fx = Math.cos(yaw), fz = -Math.sin(yaw);   // +x cục bộ (mũi u = 1) chĩa về phía đất
          const sup = d => { const x = X + fx * d, z = Z + fz * d, gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z)); return isWater(gi, gj) ? waterSurfaceY(x, z) - 0.05 : cowY(x, z) - 0.02; };
          const yB = sup(0.32 * L), yS = sup(-0.32 * L), pitch = Math.atan2(yB - yS, 0.64 * L);
          boat.position.set(X, (yB + yS) / 2 - ykU(0.5) * L, Z); boat.rotation.order = 'YZX'; boat.rotation.set(0.04, yaw, pitch);
          scene.add(boat); obstacleCoords.push({ x: X, y: boat.position.y, z: Z, r: 1.6, h: 0.8 });
          // dây buộc mũi xuồng vào cọc trên bờ
          boat.updateMatrixWorld(true);
          const bow = boat.localToWorld(new THREE.Vector3(0.48 * L, 0.16 * L, 0)), sx = bow.x + fx * 1.1, sz = bow.z + fz * 1.1, sy = cowY(sx, sz);
          const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.55, 6), darkM); stake.position.set(sx, sy + 0.24, sz); stake.rotation.z = 0.15; stake.castShadow = true; stake.name = 'Cọc buộc xuồng'; scene.add(stake);
          const mid = bow.clone().lerp(new THREE.Vector3(sx, sy + 0.42, sz), 0.5); mid.y -= 0.18;
          const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(bow, mid, new THREE.Vector3(sx, sy + 0.42, sz)), 14, 0.012, 4), new THREE.MeshLambertMaterial({ color: 0xb59a6a })); rope.name = 'Dây buộc xuồng'; scene.add(rope);
        }
