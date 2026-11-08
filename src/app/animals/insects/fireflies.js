        // ---- ĐOM ĐÓM (theo mẫu "Metal FireFly Final" của PJ/jpvamp, Sketchfab, CC-BY-4.0; chỉ đo + họ Lampyridae thật):
        //      thân thon dẹt; khiên ngực che đầu (cam, đốm sẫm giữa); mắt hổ phách to (mắt "đá quý" của mẫu); râu dài 2 đốt; cánh cứng sẫm viền vàng nhạt có
        //      2 gân đồng (gợi lồng cánh kim loại của mẫu) nâng chếch khi bay; cánh màng trong ~30% vỗ nhanh; 2 đốt bụng cuối là ĐÈN (ngà khi tắt → vàng
        //      xanh rực khi chớp); 6 chân mảnh. Nháy kiểu Luciola: chớp ~0,5 s, giữa các lần chỉ le lói; lúc chớp bay vọt nhẹ lên (nét "J").
        //      bỏ ghép pha xung (Mirollo–Strogatz) — mỗi con 1 nhịp riêng
        //      1,4–4 s, mỗi lần chớp lệch ngẫu nhiên ±15% ⇒ pha trôi dần, không bao giờ khớp; ~30% con chớp ĐÔI; con cái đậu cỏ đáp lời con đực gần đó sau 1,2–2 s ----
        const fireflies = [];
        function fireflyTex() { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(228,255,150,1)'); g.addColorStop(0.4, 'rgba(186,240,96,0.55)'); g.addColorStop(1, 'rgba(186,240,96,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }
        const ffMap = fireflyTex();
        function createFirefly() {
          const g = new THREE.Group(), dark = new THREE.MeshLambertMaterial({ color: 0x1f1913, flatShading: true }), vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = new THREE.Color(f(p.getX(i), p.getY(i), p.getZ(i))); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          const ab = new THREE.SphereGeometry(1, 10, 6); ab.scale(0.034, 0.02, 0.072); ab.translate(0, -0.004, -0.045); g.add(new THREE.Mesh(paint(ab, (x, y, z) => (Math.floor((z + 0.12) / 0.018) & 1) ? 0x3a2c1c : 0x2a2016), vc));   // bụng đốt
          const lampM = new THREE.MeshBasicMaterial({ color: 0xd9d2a8 });
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), lampM); lamp.scale.set(0.031, 0.018, 0.034); lamp.position.set(0, -0.007, -0.098); g.add(lamp);   // 2 đốt đèn cuối bụng
          const pr = new THREE.SphereGeometry(1, 10, 5, 0, TAU, 0, Math.PI / 2); pr.scale(0.04, 0.017, 0.036); pr.translate(0, 0.004, 0.058);
          g.add(new THREE.Mesh(paint(pr, (x, y, z) => Math.hypot(x / 0.4, (z - 0.06) / 0.5) < 0.03 ? 0x2a1d14 : 0xe8823a), vc));   // khiên ngực cam, đốm sẫm giữa
          const hd = new THREE.Mesh(new THREE.SphereGeometry(0.017, 7, 5), dark); hd.position.set(0, -0.004, 0.092); g.add(hd);
          const eyeM = new THREE.MeshPhongMaterial({ color: 0xc8902c, shininess: 90, specular: 0x887755 });
          for (const sx of [-1, 1]) {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.011, 7, 5), eyeM); e.position.set(sx * 0.015, -0.002, 0.097); g.add(e);   // mắt hổ phách
            rodBetween(g, new THREE.Vector3(sx * 0.007, 0.002, 0.108), new THREE.Vector3(sx * 0.026, 0.024, 0.15), 0.0028, dark, 4, false);
            rodBetween(g, new THREE.Vector3(sx * 0.026, 0.024, 0.15), new THREE.Vector3(sx * 0.04, 0.03, 0.2), 0.0022, dark, 4, false);   // râu
            for (const z of [0.06, 0.035, 0.01]) { const k = new THREE.Vector3(sx * 0.05, -0.022, z - 0.008); rodBetween(g, new THREE.Vector3(sx * 0.015, -0.012, z), k, 0.0032, dark, 3, false); rodBetween(g, k, new THREE.Vector3(sx * 0.06, -0.05, z - 0.03), 0.0024, dark, 3, false); }   // 6 chân
          }
          const elyG = new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, Math.PI / 2); elyG.scale(0.022, 0.011, 0.082); elyG.translate(0.02, 0, -0.072);   // cánh cứng: vỏ nửa elip, khớp ở gốc (z = 0)
          paint(elyG, (x) => { const u = (x - 0.002) / 0.04; return u > 0.86 || u < 0.05 ? 0xd9c27a : Math.abs(u - 0.35) < 0.05 || Math.abs(u - 0.62) < 0.05 ? 0xb07a3a : 0x2a2218; });   // viền vàng nhạt + 2 gân đồng
          const wingM = new THREE.MeshLambertMaterial({ color: 0xc8d0d6, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
          const blade = (len, w) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(len * 0.3, w, len * 0.9, w * 0.8, len, 0); sh.bezierCurveTo(len * 0.85, -w * 0.45, len * 0.3, -w * 0.4, 0, 0); const gg = new THREE.ShapeGeometry(sh, 6); gg.rotateX(Math.PI / 2); return gg; };
          const side = (sx) => { const s = new THREE.Group(); s.scale.x = sx; s.position.y = 0.014; g.add(s); return s; };
          const els = [], wings = [];
          for (const sx of [1, -1]) {
            const S = side(sx), el = new THREE.Group(); el.position.set(0.004, 0, 0.03); S.add(el); el.add(new THREE.Mesh(elyG, vc)); els.push(el);   // nâng chếch khi bay
            const w = new THREE.Group(); w.position.set(0.01, 0, 0.012); S.add(w); const m = new THREE.Mesh(blade(0.13, 0.04), wingM); m.rotation.y = 0.55; w.add(m); wings.push(w);
          }
          const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ffMap, color: 0xe4ff88, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
          glowSprite.scale.set(0.5, 0.5, 1); glowSprite.position.set(0, -0.01, -0.105); g.add(glowSprite);
          for (const o of [...els, ...wings, glowSprite, lamp]) o.userData.noBake = true;
          bakeStatic(g);   // thân + khiên + chân + râu gộp; cánh cứng, cánh màng, đèn, quầng sáng giữ động
          g.scale.setScalar(0.62 * NATURE_SCALE); return { g, wingL: wings[0], wingR: wings[1], elL: els[0], elR: els[1], lampM, glowSprite };
        }
        for (let n = 0; n < 9; n++) {   // 9 con rải 3 cụm trên bãi cỏ (trước chỉ 3)
          const ff = createFirefly(), i = (12 + (n % 3) * 9 + Math.random() * 3) * S, j = (32 + ((n / 3) | 0) * 3 + Math.random() * 2) * S, base = new THREE.Vector3(wx(i), surfaceY(i, j) + 1.2 + Math.random() * 1.2, wz(j));
          ff.g.position.copy(base); scene.add(ff.g);
          fireflies.push({ g: ff.g, wL: ff.wingL, wR: ff.wingR, elL: ff.elL, elR: ff.elR, lampM: ff.lampM, sp: ff.glowSprite, base: base.clone(), target: base.clone(), timer: 2.0 + Math.random() * 3.0, ph: Math.random() * 6.28, r: 1.7 + Math.random() * 1.3, spd: 0.35 + Math.random() * 0.3, state: 'moving', currentSpd: 0,
            per: 1.4 + Math.random() * 2.6, fp: Math.random(), fl: 9, dbl: Math.random() < 0.3 });   // nhịp riêng 1,4–4 s · ~30% chớp đôi
        }
        // ĐOM ĐÓM QUANH CÂY CỔ THỤ: đom đóm ưa chỗ ẩm có cây gần nước, bay thấp 0,5–3 m; vài loài (Pteroptyx — rừng ngập
        //  mặn Đông Nam Á) tụ trên 1 cây và nháy đồng loạt; con cái thường đậu trên cỏ, nháy đáp lời con đực. ⇒ 12 con quanh gốc (89, 117) bờ sông: 9 con đực lượn
        //  trong vòng 7 m (lên tới tán), 3 con cái đậu trên thảm cỏ quanh gốc (không bay, đèn yếu hơn, nhịp chậm hơn); không đồng loạt nữa (xem đầu tệp)
        { const OT = new THREE.Vector3(X0 + 89, 0, Z0 + 117), rr = mulberry32(9393);
          for (let n = 0; n < 12; n++) {
            const ff = createFirefly(), perch = n < 3, a = n / 12 * TAU + rr() * 0.4, r = perch ? 1.6 + rr() * 2.2 : 1.5 + rr() * 5, x = OT.x + Math.cos(a) * r, z = OT.z + Math.sin(a) * r;
            const base = new THREE.Vector3(x, cowY(x, z) + (perch ? 0.12 : 0.6 + rr() * 2.4), z); ff.g.position.copy(base); ff.g.rotation.y = rr() * TAU; scene.add(ff.g);
            fireflies.push({ g: ff.g, wL: ff.wingL, wR: ff.wingR, elL: ff.elL, elR: ff.elR, lampM: ff.lampM, sp: ff.glowSprite, base: base.clone(), target: base.clone(), timer: 1 + rr() * 3, ph: rr() * 6.28, r: 1.5, spd: 0.3 + rr() * 0.25, state: 'paused', currentSpd: 0,
              per: perch ? 3 + rr() * 1.5 : 1.4 + rr() * 2.6, fp: rr(), fl: 9, home: OT, rad: 7, perch, dim: perch ? 0.65 : 1, dbl: !perch && rr() < 0.3 });
          } }

        // MỖI KHUNG (loop/main-loop-rest.js, sau nấm phát quang): đom đóm cánh vỗ, chớp theo nhịp riêng, con cái đáp lời, bay – dừng, nét "J" — dời nguyên văn khỏi vòng lặp
        worldTick('glow', 10, firefliesTick);   // MỖI KHUNG (sổ tick core/world.js): đom đóm
        function firefliesTick(dt, t) {
          // ---- đom đóm hoạt cảnh ----
          for (const ff of fireflies) {
            const fly = !ff.perch;   // con cái đậu trên cỏ (đom đóm quanh cây cổ thụ): cánh xếp, chỉ nháy
            ff.wL.rotation.z = ff.wR.rotation.z = fly ? 0.35 + Math.sin(t * 60 + ff.ph) * 0.6 : 0;   // cánh màng vỗ (2 bên đối xứng gương: cùng góc)
            if (fly) ff.elL.rotation.set(0, -0.3, 0.55 + 0.04 * Math.sin(t * 30 + ff.ph)); else ff.elL.rotation.set(0, 0, 0); ff.elR.rotation.copy(ff.elL.rotation);   // cánh cứng nâng chếch, toả 2 bên
            ff.fp += dt / ff.per; ff.fl += dt;
            if (ff.reply > 0 && (ff.reply -= dt) <= 0) { ff.reply = 0; ff.fl = 0; ff.fp = 0.3 * Math.random(); }   // con cái đáp lời
            if (ff.fp >= 1) {   // tới nhịp riêng ⇒ chớp; lệch ngẫu nhiên ±15% mỗi lần ⇒ không con nào giữ mãi cùng pha (bỏ ghép xung đồng bộ)
              ff.fp -= 1 + (Math.random() - 0.5) * 0.3; ff.fl = 0;
              if (!ff.perch) for (const o of fireflies) if (o.perch && !(o.reply > 0) && o.fl > 1 && Math.random() < 0.5 && o.g.position.distanceToSquared(ff.g.position) < 16) o.reply = 1.2 + 0.8 * Math.random();   // con cái gần đó đáp sau 1,2–2 s
            }
            const pulse = x => x < 0 ? 0 : x < 0.08 ? x / 0.08 : x < 0.23 ? 1 : Math.max(0, 1 - (x - 0.23) / 0.3);   // sáng: lên 0,08 s · giữ 0,15 s · tắt dần 0,3 s
            const I = Math.min(1, pulse(ff.fl) + (ff.dbl ? 0.85 * pulse(ff.fl - 0.42) : 0)), L = 0.06 + 0.94 * I;   // chớp đôi: nhát thứ 2 sau 0,42 s
            ff.lampM.color.setRGB(0.85 + 0.05 * L, 0.82 + 0.18 * L, 0.66 - 0.3 * L); ff.sp.material.opacity = (0.12 + 0.88 * I) * (ff.dim || 1); ff.sp.scale.setScalar(0.22 + 0.4 * I * (ff.dim || 1));
            if (!fly) continue;
            ff.g.position.y += 0.35 * I * dt;   // nét "J": vọt lên khi chớp
            ff.timer -= dt;
            if (ff.state === 'paused') {
              ff.currentSpd = Math.max(0, ff.currentSpd - ff.spd * dt * 2.5);
              if (ff.timer <= 0) {
                ff.state = 'moving';
                ff.timer = 3.0 + Math.random() * 4.0;
                const angle = Math.random() * Math.PI * 2;
                const dist = 3.0 + Math.random() * 6.0;
                let tx = Math.max(X0 + 10, Math.min(X0 + 210, ff.g.position.x + Math.cos(angle) * dist));
                let tz = Math.max(Z0 + 10, Math.min(Z0 + 210, ff.g.position.z + Math.sin(angle) * dist));
                if (ff.home) { const rr = ff.rad * Math.sqrt(Math.random()); tx = ff.home.x + Math.cos(angle) * rr; tz = ff.home.z + Math.sin(angle) * rr; }   // đom đóm cây cổ thụ: lượn quanh gốc, lên tới tán
                const ty = cowY(tx, tz) + (ff.home ? 0.5 + Math.random() * 3.2 : 0.8 + Math.random() * 1.5);
                ff.target.set(tx, ty, tz);
              }
            } else {
              // 'moving' state
              ff.currentSpd = Math.min(ff.spd, ff.currentSpd + ff.spd * dt * 2.0);
              _flyDir.copy(ff.target).sub(ff.g.position);
              const distSq = _flyDir.lengthSq();
              if (distSq > 0.01) {
                _flyDir.normalize();
                ff.g.position.addScaledVector(_flyDir, ff.currentSpd * dt);
                // Xoay mượt về hướng bay thay vì giật cục
                let dH = Math.atan2(_flyDir.x, _flyDir.z) - ff.g.rotation.y;
                while (dH > Math.PI) dH -= 6.283;
                while (dH < -Math.PI) dH += 6.283;
                ff.g.rotation.y += dH * Math.min(1, dt * 5);
              }
              if (distSq < 0.2 || ff.timer <= 0) {
                ff.state = 'paused';
                ff.timer = 1.0 + Math.random() * 2.0;
              }
            }
            ff.g.position.y += Math.sin(t * 2.2 + ff.ph) * 0.006;
          }
        }
        worldJoin('dayNight', 40, G => { for (const f of fireflies) G.night.add(f.g); });   // đom đóm: nhóm ban đêm (core/day-night.js)
