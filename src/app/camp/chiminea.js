        // ===== LÒ SƯỞI CHIMINEA (G 15/10: "learn glb data, then create new one follow reference image at x 67 z 99, khi trời mưa thì chuyển sang dùng cái này") =====
        //  GLB "Rustic chimenea" (archiesmitham, CC-BY-NC-SA-4.0) chỉ để ĐO: 1 lưới quét 3D (8k đỉnh, 1 texture unlit) — bầu đất cao 1,23 m, bụng 0,6 m,
        //  cổ 0,15 m, nón 0,16 m. Dựng theo ẢNH MẪU (lò thép kiểu hộp): 4 chân thép dẹt xoè · bát hứng tro · buồng đốt hộp 0,52 × 0,42 × 0,5 m,
        //  viền đồng + đinh tán · cửa trước mở rộng, cửa lưới bản lề phải mở ra · mái chóp thấp · ống khói Ø 0,22 m cổ loe, dài 1,98 m (G: ×2, ×2
        //  rồi 17/10 thêm 50%) · nón che mưa trên 3 trụ + quai xách. Thép rèn đen vân búa (canvas lốm đốm). Cửa lò (lửa) quay về GHẾ CẮM TRẠI (G 15/10).
        //  Lòng lò = hộp lót mặt trong (BackSide) màu muội, ửng đỏ theo lửa.
        //  KHÓI = sợi khói Navier–Stokes như lửa trại (nature/fluids.js, nguồn thứ 2): đáy miền = miệng ống, NÓN là ô đặc trong lưới ⇒ khói dội
        //  vào mặt dưới nón, toả ra theo khe giữa miệng ống và nón, vòng qua mép nón rồi mới bốc lên (không xuyên qua nón).
        //  CHỈ CHÁY KHI MƯA (G 15/10): mưa thì lửa trại tắt (campRain, camp/chairs-lantern-fire.js), lửa chuyển sang lò; tạnh mưa lò tàn dần.
        //  BỎ THÊM CỦI (G 20/10 "khi click vào chiminea thì bỏ thêm củi" — engineer/tasks/tool-jobs.js woodJob): addWood() ⇒ 2 khúc mới nằm chéo trên đống than
        //  + 10 phút nhiên liệu (F, trần 15 phút) — lò cháy cả khi không mưa: lửa bùng ~8 s (thay vì bén 40 s), khúc củi mới cháy nhỏ dần theo F ----
        const chiminea = (() => {
          const W = 0.52, D = 0.5, H = 0.42, YB = 0.3, TK = 0.014, OW = 0.36, OH = 0.28, RB = 0.063;   // buồng đốt rộng (x) · sâu (z) · cao · đáy cách đất · dày thép · ô cửa · đố dưới
          const g = new THREE.Group(); g.name = 'Lò sưởi chiminea (Chiminea)';
          const X = X0 + 67, Z = Z0 + 100; g.position.set(X, cowY(X, Z), Z); g.rotation.y = Math.atan2(campChairPos.x - X, campChairPos.z - Z); g.scale.setScalar(CAMP_SCALE);   // mặt cửa (+z cục bộ) nhìn về ghế cắm trại · G 15/10: dời (67, 99) → (67, 100)
          // ---- thép rèn đen vân búa (lốm đốm sáng tối + chút gỉ đồng) ----
          const hc = document.createElement('canvas'); hc.width = hc.height = 128; const hx = hc.getContext('2d'), hr = mulberry32(6799);
          hx.fillStyle = '#2b2a28'; hx.fillRect(0, 0, 128, 128);
          for (let n = 0; n < 420; n++) {
            const l = hr(); hx.fillStyle = l < 0.45 ? `rgba(14,13,12,${0.35 + 0.4 * hr()})` : l < 0.9 ? `rgba(80,78,74,${0.25 + 0.35 * hr()})` : `rgba(122,88,50,${0.3 + 0.3 * hr()})`;
            hx.beginPath(); hx.arc(hr() * 128, hr() * 128, 1 + hr() * 3.2, 0, 6.283); hx.fill();
          }
          const hTex = new THREE.CanvasTexture(hc); hTex.colorSpace = THREE.SRGBColorSpace; hTex.wrapS = hTex.wrapT = THREE.RepeatWrapping;
          const iron = new THREE.MeshLambertMaterial({ map: hTex }), ironDS = new THREE.MeshLambertMaterial({ map: hTex, side: THREE.DoubleSide }), ironFlat = new THREE.MeshLambertMaterial({ map: hTex, flatShading: true });
          const bronze = new THREE.MeshLambertMaterial({ color: 0x86643a }), soot = new THREE.MeshLambertMaterial({ color: 0x141210, side: THREE.BackSide, emissive: 0x6a1e05, emissiveIntensity: 0 });
          const add = (o, x, y, z, par = g) => { o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
          const B = (w, h, d, m, x, y, z, par) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z, par);
          // ---- buồng đốt: lưng, 2 hông, đáy, nóc, khung mặt trước có ô cửa; lớp lót muội bên trong ----
          const yc = YB + H / 2, zf = D / 2 - TK / 2;
          B(W, H, TK, iron, 0, yc, -zf); for (const s of [-1, 1]) B(TK, H, D, iron, s * (W / 2 - TK / 2), yc, 0);
          B(W, TK, D, iron, 0, YB + TK / 2, 0); B(W, TK, D, iron, 0, YB + H - TK / 2, 0);
          for (const s of [-1, 1]) B((W - OW) / 2, H, TK, iron, s * (OW / 2 + (W - OW) / 4), yc, zf);
          const RT = H - OH - RB; B(OW, RT, TK, iron, 0, YB + H - RT / 2, zf); B(OW, RB, TK, iron, 0, YB + RB / 2, zf);
          add(new THREE.Mesh(new THREE.BoxGeometry(W - 2.4 * TK, H - 2.4 * TK, D - 2.4 * TK), soot), 0, yc, 0);   // lòng lò (mặt trong): nhìn qua ô cửa thấy vách muội
          // ---- viền đồng: 4 cạnh đứng, 2 vòng đai trên / dưới, khung quanh ô cửa · đinh tán dọc đai ----
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(0.028, H + 0.012, 0.028, bronze, sx * W / 2, yc, sz * D / 2);
          const rivet = new THREE.SphereGeometry(0.0075, 6, 4), RV = (x, y, z) => add(new THREE.Mesh(rivet, bronze), x, y, z);
          for (const y of [YB + 0.014, YB + H - 0.014]) {
            for (const s of [-1, 1]) { B(W + 0.02, 0.026, 0.02, bronze, 0, y, s * D / 2); B(0.02, 0.026, D + 0.02, bronze, s * W / 2, y, 0); }
            for (let k = 1; k < 8; k++) { const u = -W / 2 + k * W / 8; RV(u, y, D / 2 + 0.011); RV(u, y, -D / 2 - 0.011); }
            for (let k = 1; k < 8; k++) { const u = -D / 2 + k * D / 8; RV(W / 2 + 0.011, y, u); RV(-W / 2 - 0.011, y, u); }
          }
          const oy = YB + RB + OH / 2, fz = D / 2 + 0.006;
          for (const s of [-1, 1]) { B(OW + 0.04, 0.02, 0.012, bronze, 0, oy + s * (OH / 2 + 0.01), fz); B(0.02, OH + 0.04, 0.012, bronze, s * (OW / 2 + 0.01), oy, fz); }
          for (let k = 0; k <= 5; k++) for (const s of [-1, 1]) RV(s * (OW / 2 + 0.01), YB + RB - 0.01 + k * (OH + 0.02) / 5, fz + 0.007);
          // ---- mái chóp thấp → cổ loe → ống khói (thành trong thấy được) → đai đồng miệng ống → 3 trụ → nón che mưa → quai xách ----
          const roofTop = YB + H + 0.075;
          const rg = new THREE.CylinderGeometry(0.16, W / 2 * Math.SQRT2, 0.075, 4, 1); rg.rotateY(Math.PI / 4); rg.scale(1, 1, D / W);   // chóp 4 mặt khớp đúng miệng hộp W × D
          add(new THREE.Mesh(rg, ironFlat), 0, YB + H + 0.0375, 0);
          const nChim = g.children.length; add(new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.15, 0.06, 24), iron), 0, roofTop + 0.03, 0);
          const PIPE = 1.98, CH = 0.7, pipeTop = roofTop + 0.06 + PIPE, smokeTop = roofTop + CH * (0.06 + PIPE);   // G 17/10: ống cao thêm 50% (1,32 → 1,98 m); G 18/10: cả cụm ống khói nhỏ đi 30% (CH)
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.112, PIPE, 24, 1, true), ironDS), 0, roofTop + 0.06 + PIPE / 2, 0);
          const ring = add(new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.008, 6, 24), bronze), 0, pipeTop - 0.006, 0); ring.rotation.x = Math.PI / 2;
          for (let k = 0; k < 3; k++) { const a = k / 3 * 6.283; add(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.036, 5), iron), Math.cos(a) * 0.1, pipeTop + 0.018, Math.sin(a) * 0.1); }
          add(new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.05, 24, 1, true), ironDS), 0, pipeTop + 0.036 + 0.025, 0);
          add(new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 6, 14, Math.PI), iron), 0, pipeTop + 0.07, 0);   // quai: 2 chân cắm vào mặt nón
          { const chim = new THREE.Group(); chim.position.y = roofTop; chim.scale.setScalar(CH); for (const m of g.children.slice(nChim)) { chim.add(m); m.position.y -= roofTop; } g.add(chim); }   // cụm ống khói thu ×0,7 quanh chân ống trên mái
          // ---- 4 chân thép dẹt xoè từ góc đáy buồng đốt + đế chân · bát hứng tro treo dưới đáy ----
          const _up = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
            const ax = sx * (W / 2 - 0.05), az = sz * (D / 2 - 0.05), fx = sx * 0.34, fzz = sz * 0.33;
            _d.set(fx - ax, -YB, fzz - az); const L = _d.length();
            const leg = add(new THREE.Mesh(new THREE.BoxGeometry(0.036, L, 0.01), iron), (ax + fx) / 2, YB / 2, (az + fzz) / 2); leg.quaternion.setFromUnitVectors(_up, _d.multiplyScalar(-1 / L));
            B(0.06, 0.012, 0.05, iron, fx, 0.006, fzz);
          }
          add(new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.08, 0], [0.115, 0.04], [0.13, 0.08]].map(([r, y]) => new THREE.Vector2(r, y)), 20), ironDS), 0, YB - 0.08, 0);
          // ---- cửa lưới: bản lề mép phải ô cửa, mở ra ngoài ~112° (như ảnh mẫu) — khung đồng + lưới thép (canvas ô 8 điểm ảnh, alphaTest) + núm ----
          const mc = document.createElement('canvas'); mc.width = mc.height = 64; const mx = mc.getContext('2d'); mx.strokeStyle = '#1b1a18'; mx.lineWidth = 2;
          for (let k = 0; k <= 64; k += 8) { mx.beginPath(); mx.moveTo(k, 0); mx.lineTo(k, 64); mx.moveTo(0, k); mx.lineTo(64, k); mx.stroke(); }
          const mTex = new THREE.CanvasTexture(mc); mTex.wrapS = mTex.wrapT = THREE.RepeatWrapping; mTex.repeat.set(OW / 0.08, OH / 0.08);
          const meshMat = new THREE.MeshLambertMaterial({ map: mTex, transparent: false, alphaTest: 0.4, side: THREE.DoubleSide });
          const door = new THREE.Group(); door.position.set(OW / 2 + 0.012, oy, D / 2 + 0.012); door.rotation.y = 1.95; g.add(door);
          add(new THREE.Mesh(new THREE.PlaneGeometry(OW - 0.01, OH - 0.01), meshMat), -OW / 2, 0, 0, door);
          for (const s of [-1, 1]) { B(OW, 0.014, 0.01, bronze, -OW / 2, s * OH / 2, 0, door); B(0.014, OH, 0.01, bronze, -OW / 2 + s * OW / 2, 0, 0, door); }
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), bronze), -OW + 0.004, 0, 0.022, door).rotation.x = Math.PI / 2;
          // ---- lửa trong lò (động, không gộp): 3 khúc củi đan chéo, than, 4 lưỡi lửa, đèn ấm trước ô cửa ----
          const fire = new THREE.Group(); fire.userData.noBake = true; g.add(fire);
          const logMat = new THREE.MeshLambertMaterial({ color: 0x3a2a1e, emissive: 0xff5a2a, emissiveIntensity: 0 });
          for (let k = 0; k < 3; k++) { const lg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.27, 8), logMat), (k - 1) * 0.07, YB + 0.045 + (k % 2) * 0.035, 0.02, fire); lg.rotation.set(Math.PI / 2, 0, (k - 1) * 0.55); }
          const fed = [-1, 1].map(s => { const lg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.3, 8), logMat), s * 0.045, YB + 0.115 + (s > 0 ? 0.03 : 0), 0.03, fire); lg.rotation.set(Math.PI / 2, 0, s * 0.9); lg.visible = false; return lg; });   // 2 khúc bỏ thêm
          const emberMat = new THREE.MeshBasicMaterial({ color: 0x1e1410 }), emberGeo = new THREE.IcosahedronGeometry(0.022, 0);
          for (let k = 0; k < 9; k++) { const a = k * 2.4, r = 0.04 + (k % 3) * 0.05; add(new THREE.Mesh(emberGeo, emberMat), Math.cos(a) * r, YB + TK + 0.01, Math.sin(a) * r * 0.8, fire).scale.set(1, 0.5, 1); }
          const flameGeo = new THREE.LatheGeometry([[0, 0], [0.04, 0.03], [0.045, 0.07], [0.03, 0.12], [0.012, 0.17], [0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)), 8);
          const flames = [0xff5a14, 0xffa024, 0xffd24a, 0xff7a1c, 0xffb43a, 0xff6418].map((c, k) => {
            const m = new THREE.Mesh(flameGeo, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.85, depthWrite: false }));
            m.position.set((k - 2.5) * 0.045, YB + 0.05, 0.0 + (k % 3) * 0.035); m.renderOrder = 9; m.visible = false; fire.add(m); return m;
          });
          const light = new THREE.PointLight(0xff7a2a, 0, 6, 2); light.position.set(0, YB + 0.2, D / 2 + 0.1); g.add(light);
          scene.add(bakeStatic(g));
          obstacleCoords.push({ x: X, y: g.position.y, z: Z, r: 0.45, h: 3.0 });   // người, chó, côn trùng đi vòng
          // khói: miền 1,15 × 3,5 m ô 3,2 cm (khe dưới nón ~1 ô), miệng ống r 0,1 · nón r 0,17 cao 3,2 → 6,4 cm trên miệng ống (đv thế giới, đã nhân CAMP_SCALE)
          const SC = CAMP_SCALE, smoke = fluids.addSmoke({ NR: 36, NZ: 110, H: 0.032, NP: 600, NS: 0, NT: 14, buoy: 4, kNu: 0.03, nu0: 0.002, tauT: 6, iters: 30, dens: 0.8,
            inlet: { r: 0.11 * CH * SC }, lid: { r: 0.19 * CH * SC, z0: 0.036 * CH * SC, z1: 0.086 * CH * SC } }, { name: 'Khói ống khói lò chiminea (sợi khói Navier–Stokes)', opacity: 0.6 });
          smoke.on = false;
          let L = 0, init = false, F = 0;   // F: giây nhiên liệu còn lại của củi bỏ thêm
          return { g, smoke, lit: () => L, fuel: () => F, addWood() { F = Math.min(900, F + 600); }, door: out => g.localToWorld(out.set(0, YB + 0.12, D / 2)), update(dt, t) {
            // mưa ⇒ lò cháy: ít nhất 55%, tối thì theo lịch lửa trại; bén lửa ~40 s, tàn ~2,5 phút · củi bỏ thêm: 45–100% theo F, bùng ~8 s
            F = Math.max(0, F - dt); const want = Math.max(rainK > 0.05 ? Math.max(0.55, campfireLevel(liveWeather.localHour)) : 0, F > 0 ? Math.min(1, 0.45 + F / 1100) : 0);
            if (!init && liveWeather.state.data) { init = true; L = want; }   // mở trang giữa cơn mưa: lò đang cháy sẵn
            L += (want - L) * (1 - Math.exp(-dt / (want > L ? (F > 0 ? 8 : 40) : 150))); for (const lg of fed) { lg.visible = F > 0; lg.scale.setScalar(0.5 + 0.5 * Math.min(1, F / 600)); }
            const on = L > 0.02, fl = 0.85 + 0.15 * Math.sin(t * 9.3) + 0.08 * Math.sin(t * 17.1), e = THREE.MathUtils.smoothstep(L, 0, 0.5) * (0.88 + 0.12 * Math.sin(t * 2.3));
            flames.forEach((m, k) => { m.visible = on; if (!on) return; const s = 0.85 + 0.4 * L; m.scale.set(s, L * (1.05 + 0.35 * Math.sin(t * (7 + k) + k * 1.7)), s); m.material.opacity = 0.7 + 0.25 * Math.sin(t * 12 + k); });
            light.intensity = 2.4 * L * fl;
            emberMat.color.setRGB(0.12 + 0.85 * e, 0.08 + 0.3 * e, 0.05 + 0.04 * e); logMat.emissiveIntensity = 1.4 * e; soot.emissiveIntensity = 0.7 * L * fl;
            smoke.on = L > 0.02;   // khói ống khói theo cỡ lửa: nhiệt, lượng khói, sức hút ống (khí phụt lên khỏi miệng ống)
            if (smoke.on) { g.localToWorld(smoke.base.set(0, smokeTop, 0)); smoke.heat = 0.5 + 0.7 * L; smoke.smoke = 0.5 + 1.5 * L; smoke.rate = 0.15 + 0.7 * L; smoke.draft = 0.6 + 0.9 * L; plumeLight(smoke, PLUME_COL.smoke, PLUME_COL.steam, _plumeGlow.setRGB(0, 0, 0)); }
          } };
        })();
