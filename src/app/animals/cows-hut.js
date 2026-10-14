        // ---- bò gặm cỏ dưới tua-bin ----
        const cows = [];
        // ---- BÒ — khung khớp (toạ độ cục bộ: +x mũi, +y lên): THÂN NGANG HÔNG (torso: cao, chúc/ngóc) → khối thân bò (lắc ngang theo nhịp chân)
        //      + đầu + bầu vú + ĐUÔI MỀM (chuỗi hạt XPBD như đuôi chó) · 4 chân 2 đoạn IK (animals/quadruped.js): gối chân trước chĩa TRƯỚC (khớp cổ
        //      tay), khuỷu chân sau chĩa SAU (khớp cổ chân), bàn móng giữ phẳng trên đất. Dáng đi, nằm/đứng dậy: cowPose ----
        const COW_H0 = 0.975, COW_SPAN = 1.22, COW_PIV = 0.25;   // độ cao mặt bụng khi đứng · khoảng cách hông trước–sau · khớp vai/hông nằm trong thân, cao hơn mặt bụng
        function cow(k) {
          const g = new THREE.Group();
          const P = (par, w, h, d, mat, x, y, z, o) => { const m = bx(w, h, d, mat, true, o !== false); m.position.set(x, y, z); par.add(m); return m; };
          const torso = new THREE.Group(); torso.position.y = COW_H0; g.add(torso);
          const body = new THREE.Group(); body.position.y = -0.95; torso.add(body);   // khối thân giữ toạ độ cũ (mặt bụng ở 0,95)
          // ---- THÂN đơn giản ----
          P(body, 1.7, 0.95, 0.85, cowWhite, 0, 1.4, 0);               // thân
          P(body, 0.5, 0.5, 0.87, cowDark, 0.45, 1.55, 0, false);       // đốm đen
          P(body, 0.42, 0.44, 0.88, cowDark, -0.5, 1.3, 0, false);      // đốm đen
          // ---- ĐẦU ----
          const hg = new THREE.Group(); hg.position.set(1.05, 1.35, 0); hg.rotation.z = -0.55; body.add(hg);
          P(hg, 0.6, 0.6, 0.6, cowWhite, 0.25, 0, 0);               // đầu
          P(hg, 0.42, 0.4, 0.46, cowPink, 0.62, -0.05, 0);          // mõm
          for (const e of [-1, 1]) P(hg, 0.16, 0.12, 0.34, cowDark, 0.05, 0.28, e * 0.34, false);   // tai
          for (const e of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), cowDark); eye.position.set(0.44, 0.15, e * 0.22); hg.add(eye); }  // mắt
          for (const e of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), cowHorn); horn.position.set(0.16, 0.42, e * 0.18); horn.rotation.x = -e * 0.4; hg.add(horn); }   // sừng
          // ---- CHÂN: khớp vai/hông (trong thân, trên mặt bụng 0,25) → gối (0,75) → cổ chân (0,38) → đáy móng (0,15; IK nhắm cổ chân, móng phẳng ngay dưới) ----
          const legs = [];
          const legDefs = [[0.6, 0.32], [0.6, -0.32], [-0.62, 0.32], [-0.62, -0.32]];   // trước-T, trước-P, sau-T, sau-P (trái = +z)
          for (const lp of legDefs) {
            const hip = new THREE.Group(); hip.position.set(lp[0], COW_PIV, lp[1]); torso.add(hip);
            P(hip, 0.28, 0.3, 0.28, cowWhite, 0, -0.15 - COW_PIV, 0);          // đùi trên
            P(hip, 0.22, 0.22, 0.22, cowWhite, 0, -0.38 - COW_PIV, 0, false);   // đùi dưới
            const knee = new THREE.Group(); knee.position.y = -0.5 - COW_PIV; hip.add(knee);
            P(knee, 0.2, 0.16, 0.2, cowWhite, 0, -0.07, 0, false);    // gối
            P(knee, 0.17, 0.26, 0.17, cowWhite, 0, -0.24, 0);        // ống chân
            const paw = new THREE.Group(); paw.position.y = -0.38; knee.add(paw);
            P(paw, 0.17, 0.1, 0.18, cowDark, 0, 0, 0, false);    // khuỷu đen
            for (const hz of [-1, 1]) P(paw, 0.09, 0.14, 0.13, cowDark, 0, -0.08, hz * 0.045, false); // móng chẻ
            legs.push({ hip, knee, paw, front: lp[0] > 0, side: Math.sign(lp[1]), L1: 0.5 + COW_PIV, L2: 0.38, ankleH: 0.15, bend: lp[0] > 0 ? 1 : -1, x0: lp[0] });
          }
          // ---- ĐUÔI MỀM: 5 đoạn buông từ mép sau lưng, chùm lông đen ở ngọn ----
          const tail = makeSoftTail(body, { base: new THREE.Vector3(-0.86, 1.72, 0), dir: new THREE.Vector3(-0.14, -1, 0).normalize(), n: 5, len: 0.15, w: 0.085, mat: cowWhite, stiff: [0.1, 0.025] });
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cowDark); tuft.scale.set(1.3, 0.85, 0.85); tuft.position.x = 0.11; tail.segs[4].add(tuft);
          // ---- BẦU VÚ ----
          P(body, 0.34, 0.26, 0.46, cowPink, -0.18, 0.95, 0, false);
          g.scale.setScalar((k || 1.053) * NATURE_SCALE); g.userData = { torso, body, head: hg, legs, tail }; return g;
        }
        const cowCells = [[16, 5], [27, 6], [45, 5], [21, 8], [41, 6]];
        const x2gi = x => x / BLOCK + cx - 0.5, z2gj = z => z / BLOCK + cz - 0.5;
        let cowHutRect = null;   // khung chuồng bò (đặt khi dựng chuồng): bò gặm cỏ tự do không đi xuyên vách
        const cowOK = (x, z) => { const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z)); return gi > 4 && gi < GX - 4 && gj > 4 && gj < DAM_J + 6 && !isRiver(gi, gj) && padH(gi, gj) === null && damWalkAt(x, z) === null && !(cowHutRect && x > cowHutRect.x0 && x < cowHutRect.x1 && z > cowHutRect.z0 && z < cowHutRect.z1); };
        const cowY = (x, z) => { const d = damDeckY(x, z); return d !== null ? d : surfaceY(Math.round(x2gi(x)), Math.round(z2gj(z))); };   // trên đập/dốc nối: cao độ mặt đường đập
        for (const c of cowCells) {
          const i = c[0] * S, j = c[1] * S; if (isRiver(i, j) || padH(i, j) !== null) continue;
          const m = cow((1.053 + Math.random() * 0.2835) * 0.9), x = wx(i), z = wz(j), ang = Math.random() * 6.28; m.position.set(x, surfaceY(i, j), z); m.rotation.y = -ang; scene.add(m);
          const _cs = ['graze', 'rest', 'walk'][Math.floor(Math.random() * 3)];
          const cw = { g: m, head: m.userData.head, legs: m.userData.legs, tail: m.userData.tail, x, z, ang, spd: 0.65 + Math.random() * 0.45, ph: Math.random() * 6, tmr: 2 + Math.random() * 5, state: _cs, restY: 0 };
          const Sc = m.scale.y;
          cw.rig = quadRig(m, { legs: cw.legs, gaits: {   // đi bộ 4 phách trình tự bên (sau-T → trước-T → sau-P → trước-P), chạm đất ~65%; nước kiệu khi vội
            walk: { off: [0.27, 0.77, 0, 0.5], duty: 0.65, stride: 1.15 * Sc, lift: 0.085, vRef: 1.0 },
            trot: { off: [0, 0.5, 0.5, 0], duty: 0.45, stride: 1.9 * Sc, lift: 0.12, vRef: 1.8 } },
            home: (L, out) => out.set(L.hip.position.x, 0, L.hip.position.z), ground: (x, z) => cowY(x, z), size: Sc, settleT: 0.45, settleLift: 0.07 });
          cows.push(cw);
        }

        // ---- CHUỒNG BÒ tại ghim (54, 7, 49): khung cột gỗ, mái tôn một mái dốc ra sau, mặt trước mở hướng nam (+Z) để nhìn thấy bò bên trong;
        //      mỗi con một ô (vách ngăn 2 thanh), máng cỏ dọc vách sau, rơm lót nền, máng nước + cây rơm + chĩa cỏ bên hông, đèn bóng tròn ban đêm.
        //      Bò về chuồng lúc chiều tối (17:54 → 06:12) hoặc khi đang mưa; sáng / tạnh mưa thì lùi ra khỏi ô rồi về bãi cỏ ----
        const cowHut = (() => {
          const n = Math.max(4, cows.length), SW = 1.5, W = n * SW, D = 3.9, Hf = 2.95, Hb = 2.3;
          const hx = X0 + 54, hz = Z0 + 49, y0 = stationGround(hx, hz);
          const g = new THREE.Group(); g.position.set(hx, y0, hz); g.name = 'Chuồng bò (Cow Shed)';
          const tex = (w, h, draw, rx = 1, ry = 1) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };
          const strawDraw = (x, w, h) => {   // rơm: nền vàng, nhiều cọng ngắn chéo nhau
            x.fillStyle = '#c9a95a'; x.fillRect(0, 0, w, h);
            const cols = ['#e2c77a', '#b8954a', '#d8b866', '#a8843f', '#efd690'];
            for (let k = 0; k < 900; k++) { const px = Math.random() * w, py = Math.random() * h, a = (Math.random() - 0.5) * 1.4, l = 4 + Math.random() * 10; x.strokeStyle = cols[k % cols.length]; x.lineWidth = 0.8 + Math.random() * 0.8; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
          };
          const grainDraw = (x, w, h) => {   // vân gỗ sáng, nhân màu theo vật liệu
            x.fillStyle = '#d9d2c4'; x.fillRect(0, 0, w, h);
            for (let k = 0; k < 60; k++) { const yy = Math.random() * h; x.strokeStyle = `rgba(90,70,50,${0.12 + Math.random() * 0.22})`; x.lineWidth = 0.6 + Math.random() * 1.4; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(w * 0.3, yy + (Math.random() - 0.5) * 4, w * 0.7, yy + (Math.random() - 0.5) * 4, w, yy + (Math.random() - 0.5) * 3); x.stroke(); }
            for (let k = 0; k < 4; k++) { const kx = Math.random() * w, ky = Math.random() * h; x.fillStyle = 'rgba(80,58,38,0.35)'; x.beginPath(); x.ellipse(kx, ky, 3 + Math.random() * 3, 1.5 + Math.random(), 0, 0, 7); x.fill(); }   // mắt gỗ
          };
          const grain = tex(128, 32, grainDraw);
          const wood = [0x8a6a45, 0x7d5f3d, 0x94744e].map(c => new THREE.MeshLambertMaterial({ color: c, map: grain }));
          const postWood = new THREE.MeshLambertMaterial({ color: 0x6e5236, map: grain }), concrete = new THREE.MeshLambertMaterial({ color: 0x9a948a });
          const straw = new THREE.MeshLambertMaterial({ map: tex(128, 128, strawDraw, W / 1.3, D / 1.3) }), hay = new THREE.MeshLambertMaterial({ color: 0xd9dfa0, map: tex(128, 128, strawDraw) });
          const tin = new THREE.MeshLambertMaterial({ map: tex(128, 64, (x, w, h) => {   // tôn sóng mạ kẽm, gỉ loang theo dốc
            for (let px = 0; px < w; px++) { const v = Math.round(146 + 34 * Math.cos(px / w * Math.PI * 2 * 8)); x.fillStyle = `rgb(${v},${v - 1},${v - 6})`; x.fillRect(px, 0, 1, h); }
            for (let k = 0; k < 14; k++) { const px = Math.random() * w, l = 10 + Math.random() * 40; const gr = x.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(138,87,51,0.55)'); gr.addColorStop(1, 'rgba(138,87,51,0)'); x.fillStyle = gr; x.fillRect(px, 0, 2 + Math.random() * 5, l); }
          }, (W + 0.9) / 1.6, 1) });
          const rope = new THREE.MeshLambertMaterial({ color: 0x5b4a33 }), iron = new THREE.MeshLambertMaterial({ color: 0x55585c }), water = new THREE.MeshLambertMaterial({ color: 0x5f8fa8, transparent: true, opacity: 0.85 });
          const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
          // nền bê tông + rơm lót phía trước máng
          add(bx(W + 0.6, 0.14, D + 0.6, concrete, false, true, lineDark), 0, 0.07, 0);
          const bed = add(new THREE.Mesh(new THREE.PlaneGeometry(W - 0.15, D - 0.85), straw), 0, 0.142, 0.38); bed.rotation.x = -Math.PI / 2; bed.receiveShadow = true;
          // cột gỗ tròn trên chân đá ở mỗi ranh ô (trước cao, sau thấp)
          for (let k = 0; k <= n; k++) {
            const x = -W / 2 + k * SW;
            for (const [z, H] of [[D / 2, Hf], [-D / 2, Hb]]) { add(cyl(0.085, 0.1, H - 0.14, postWood, true, false, null, 8), x, 0.14 + (H - 0.14) / 2, z); add(bx(0.26, 0.12, 0.26, concrete, false, false), x, 0.2, z); }
          }
          add(bx(W + 0.4, 0.16, 0.14, wood[1], true, true, lineDark), 0, Hf - 0.08, D / 2);    // xà đầu trước
          add(bx(W + 0.4, 0.16, 0.14, wood[1], true, true, lineDark), 0, Hb - 0.08, -D / 2);   // xà đầu sau
          // kèo + mái tôn dốc về sau (nước mưa chảy ra sau chuồng)
          const pitch = Math.atan((Hf - Hb) / D), rz = 0.1, ry = Hb + (Hf - Hb) * (rz + D / 2) / D;
          for (let k = 0; k <= n; k += (n > 4 ? 2 : 1)) { const r = add(bx(0.09, 0.12, D + 0.8, wood[2], true, false), -W / 2 + k * SW, ry + 0.02, rz); r.rotation.x = -pitch; }
          const roof = add(bx(W + 0.9, 0.035, D + 1.0, tin, true, true, lineDark), 0, ry + 0.1, rz); roof.rotation.x = -pitch;
          const fascia = add(bx(W + 0.9, 0.12, 0.04, wood[0], true, false), 0, Hf + 0.06 + Math.tan(pitch) * 0.45, D / 2 + 0.47); fascia.rotation.x = -pitch;
          // vách ván: sau kín tới mái, hai hông cao 1,4 m + thanh giằng trên
          for (let y = 0.27, k = 0; y < Hb - 0.15; y += 0.25, k++) add(bx(W + 0.3, 0.22, 0.05, wood[k % 3], true, false), 0, y, -D / 2 - 0.13);
          for (const sx of [-1, 1]) {
            for (let y = 0.27, k = 0; y < 1.5; y += 0.25, k++) add(bx(0.05, 0.22, D + 0.2, wood[(k + 1) % 3], true, false), sx * (W / 2 + 0.13), y, 0);
            add(bx(0.07, 0.1, D + 0.2, wood[1], true, false), sx * (W / 2 + 0.13), 2.0, 0);
            const brace = add(bx(0.06, 0.09, 1.5, wood[2], true, false), sx * (W / 2 + 0.13), 1.75, -D / 2 + 0.55); brace.rotation.x = 0.62;
          }
          // vách ngăn giữa các ô: 2 thanh ngang + cọc cuối
          for (let k = 1; k < n; k++) {
            const x = -W / 2 + k * SW;
            for (const y of [0.62, 1.12]) add(bx(0.06, 0.08, 2.25, wood[0], true, false), x, y, -D / 2 + 1.75);
            add(cyl(0.06, 0.07, 1.2, postWood, true, false, null, 7), x, 0.74, -D / 2 + 2.85);
          }
          // máng cỏ dọc vách sau, cỏ khô mỗi ô cao thấp khác nhau
          add(bx(W - 0.1, 0.5, 0.06, wood[1], true, true, lineDark), 0, 0.39, -D / 2 + 0.62);
          add(bx(W - 0.1, 0.06, 0.5, wood[2], true, false), 0, 0.3, -D / 2 + 0.37);
          for (let k = 0; k < n; k++) add(bx(SW - 0.22, 0.14 + Math.random() * 0.08, 0.42, hay, false, false), -W / 2 + (k + 0.5) * SW, 0.42, -D / 2 + 0.37);
          // máng nước bê tông bên đông
          const trX = W / 2 + 0.95;
          add(bx(0.7, 0.5, 1.6, concrete, true, true, lineDark), trX, 0.25, 0.75);
          const wtr = add(new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.46), water), trX, 0.44, 0.75); wtr.rotation.x = -Math.PI / 2; wtr.userData.noBake = true;
          // cây rơm vuông bên tây: 2 kiện dưới, 1 kiện trên lệch, buộc dây
          const bale = (x, y, z, ry) => { const b = add(bx(1.0, 0.45, 0.5, hay, true, true, lineDark), x, y, z); b.rotation.y = ry; for (const o of [-0.25, 0.25]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.47, 0.52), rope); t.position.x = o; b.add(t); } };
          const blX = -W / 2 - 1.05;
          bale(blX, 0.37, 0.15, Math.PI / 2); bale(blX, 0.37, 1.25, Math.PI / 2 + 0.06); bale(blX + 0.04, 0.83, 0.7, Math.PI / 2 - 0.12);
          // chĩa cỏ dựng nghiêng vào vách tây
          const fork = new THREE.Group(); fork.position.set(-W / 2 - 0.24, 0.14, D / 2 - 0.4); fork.rotation.z = -0.16; g.add(fork);
          const handle = cyl(0.022, 0.022, 1.55, wood[0], true, false, null, 6); handle.position.y = 0.78; fork.add(handle);
          for (const o of [-0.07, 0, 0.07]) { const tine = cyl(0.008, 0.012, 0.32, iron, true, false, null, 5); tine.position.set(0, 1.68, o); fork.add(tine); }
          const forkBar = bx(0.02, 0.03, 0.16, iron, true, false); forkBar.position.y = 1.53; fork.add(forkBar);
          // đèn bóng tròn treo dưới xà trước: tắt ngày, sáng ấm đêm (nhìn rõ bò nằm trong chuồng)
          add(cyl(0.006, 0.006, 0.36, iron, false, false, null, 4), 0, Hf - 0.34, D / 2 - 0.05);
          add(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.09, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x55585c, side: THREE.DoubleSide })), 0, Hf - 0.55, D / 2 - 0.05);   // chao đèn
          const bulbMat = new THREE.MeshBasicMaterial({ color: 0x77736a });
          const bulb = add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), bulbMat), 0, Hf - 0.62, D / 2 - 0.05); bulb.userData.noBake = true;
          const light = new THREE.PointLight(0xffd59a, 0, 9, 2); light.position.set(0, Hf - 0.7, D / 2 - 0.2); g.add(light);
          bakeStatic(g); scene.add(g);
          const stalls = [];
          for (let k = 0; k < n; k++) { const sx = hx - W / 2 + (k + 0.5) * SW; stalls.push({ x: sx, z: hz + 0.2, ex: sx, ez: hz + D / 2 + 1.3 }); }
          cowHutRect = { x0: hx - W / 2 - 1.7, x1: hx + W / 2 + 1.45, z0: hz - D / 2 - 0.35, z1: hz + D / 2 + 0.25 };
          return { g, x: hx, z: hz, W, D, stalls, light, bulbMat, door: { x: hx, z: hz + D / 2 + 2.2 } };
        })();
        cows.forEach((c, k) => { c.stall = k; c.mode = 'free'; c.leg = ''; c.sub = 'stand'; });
        const cowHutWanted = () => { const h = liveWeather.localHour; return liveWeather.state.raining || h >= 17.9 || h < 6.2; };   // chiều tối hoặc mưa → về chuồng
        let hutField = null;   // trường dòng chảy về cửa chuồng (dựng sau khi lưới cấm sẵn sàng); mỗi con có thêm c.homeField về bãi quen
        const COW_SLIDE = [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1];
        function cowSteer(c, tx, tz, dt, field) {   // đi về (tx,tz): xa thì theo trường dòng chảy (vòng qua nước, chuồng), gần thì đi thẳng
          const dx = tx - c.x, dz = tz - c.z, dist = Math.hypot(dx, dz);
          if (dist < 0.1) return true;
          let ux = dx / dist, uz = dz / dist;
          if (field && dist > 3) { const f = ffDir(field, c.x, c.z); if (f) { ux = f.x; uz = f.z; } }
          let da = Math.atan2(uz, ux) - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          const mt = 1.4 * dt; c.ang += Math.max(-mt, Math.min(mt, dist < 1 ? da : da * Math.min(1, dt * 3)));   // quay đầu mượt (bò quay chậm, ≤ 80°/giây), sát đích thì nhắm thẳng
          c.vk = Math.min(1, (c.vk || 0) + dt / 0.9);   // nhấc bước tăng tốc dần ~0,9 s
          const step = dist < 0.6 && Math.abs(da) > 0.8 ? 0 : Math.min(dist, c.spd * c.vk * dt * (Math.abs(da) > 1.2 ? 0.25 : Math.abs(da) > 0.5 ? 0.6 : 1));   // ngoặt gắt sát đích: quay tại chỗ trước
          // bước thử theo hướng mặt; vướng thì trượt lệch dần ±20°/40°/63° (men theo lan can, vách chuồng, mép nước)
          const freeHere = !cowBlocked[Math.round(x2gi(c.x)) + Math.round(z2gj(c.z)) * GX];
          for (const off of COW_SLIDE) {
            const a = c.ang + off, nx = c.x + Math.cos(a) * step, nz = c.z + Math.sin(a) * step, ni = Math.round(x2gi(nx)), nj = Math.round(z2gj(nz));
            if (isWater(ni, nj) && damDeckY(nx, nz) === null) continue;                      // không bao giờ lội sông: chỉ qua bằng mặt đập
            if (field && dist > 3 && freeHere && cowBlocked[ni + nj * GX]) continue;      // không cắt góc xuyên lan can / vách
            c.x = nx; c.z = nz; if (off) c.ang += off * Math.min(1, dt * 4); break;
          }
          return false;
        }
        function cowHome(c, dt, t, want) {   // true = bò đang trong lộ trình chuồng (tự lo vị trí + dáng), false = để hành vi gặm cỏ cũ chạy
          if (want && c.mode !== 'home') { c.mode = 'home'; c.leg = c.leg === 'back' ? 'stall' : 'door'; }
          else if (!want && c.mode === 'home') { if (c.leg === 'door') c.mode = 'free'; else { c.mode = 'leave'; c.leg = 'back'; } }
          if (c.mode === 'free') return false;
          const st = cowHut.stalls[c.stall % cowHut.stalls.length];
          let gait = 0;   // 1 bước tới · -1 lùi · 0 đứng yên
          const rising = c.restY > 0.02;   // đang nằm → đứng dậy xong mới đi
          if (c.mode === 'home') {
            if (c.leg === 'door') { if (!rising) { gait = 1; if (cowSteer(c, st.ex, st.ez, dt, hutField)) c.leg = 'stall'; } }
            else if (c.leg === 'stall') { if (!rising) { gait = 1; if (cowSteer(c, st.x, st.z, dt, null)) { c.leg = 'in'; c.sub = 'stand'; c.tmr = 2 + Math.random() * 3; } } }
            else {
              let da = -Math.PI / 2 - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); c.ang += da * Math.min(1, dt * 2);   // quay đầu vào máng
              c.tmr -= dt;
              if (c.tmr <= 0) {
                const night = !liveWeather.wildlifeAwake, r = Math.random();
                c.sub = night ? (r < 0.7 ? 'rest' : r < 0.9 ? 'eat' : 'stand') : (r < 0.5 ? 'eat' : r < 0.75 ? 'stand' : 'rest');
                c.tmr = c.sub === 'rest' ? 40 + Math.random() * 60 : 10 + Math.random() * 16;
              }
            }
          } else if (c.leg === 'back') {   // lùi thẳng ra khỏi ô, mặt vẫn hướng máng
            if (!rising) { gait = -1; c.vk = Math.min(1, (c.vk || 0) + dt / 0.9); const ez = st.ez - 0.3; c.z = Math.min(ez, c.z + c.spd * 0.45 * c.vk * dt); c.x += (st.x - c.x) * Math.min(1, dt * 2); if (c.z >= ez - 1e-3) c.leg = 'pasture'; }
          } else {   // về bãi gặm quen của từng con theo trường dòng chảy riêng (vòng qua chuồng, sông), tới nơi thì thả tự do
            gait = 1;
            if (cowSteer(c, c.homeX, c.homeZ, dt, c.homeField) || Math.hypot(c.homeX - c.x, c.homeZ - c.z) < 2.5) { c.mode = 'free'; c.leg = ''; c.state = 'graze'; c.tmr = 4 + Math.random() * 6; }
          }
          // ---- dáng đích (cowPose dựng thân, chân, đầu, đuôi): đi / lùi / nằm / gặm máng / đứng ----
          const lie = c.mode === 'home' && c.leg === 'in' && c.sub === 'rest';
          c.restY = lie ? Math.min(1, c.restY + dt * 0.38) : Math.max(0, c.restY - dt * 0.5);
          if (!gait) c.vk = 0;
          if (gait) { c.hz = -0.18; c.hx = 0; }
          else if (lie) { c.hz = -0.24 + Math.sin(t * 0.7 + c.ph) * 0.05; c.hx = Math.sin(t * 0.45 + c.ph) * 0.04; }
          else if (c.sub === 'eat' && c.leg === 'in') { c.hz = -0.62 + Math.sin(t * 2.5 + c.ph) * 0.14; c.hx = 0; }   // dúi đầu vào máng cỏ
          else { c.hz = -0.2 + Math.sin(t * 0.9 + c.ph) * 0.06; c.hx = Math.sin(t * 0.5 + c.ph) * 0.12; }
          return true;
        }
        // ---- bãi cỏ: gặm (vài giây nhích 1–2 bước chậm tới búi cỏ kế bên) · đi dạo · nằm nhai lại ----
        function cowFreeTick(c, dt, t) {
          c.tmr -= dt;
          if (c.tmr <= 0) {
            if (c.state === 'graze') { c.state = Math.random() < 0.5 ? 'walk' : 'rest'; c.tmr = c.state === 'walk' ? 2 + Math.random() * 3.5 : 18 + Math.random() * 22; if (c.state === 'walk') c.angT = c.ang + (Math.random() - 0.5) * 1.7; }
            else if (c.state === 'walk') { c.state = Math.random() < 0.6 ? 'graze' : 'rest'; c.tmr = c.state === 'graze' ? 6 + Math.random() * 10 : 18 + Math.random() * 20; }
            else { c.state = 'graze'; c.tmr = 5 + Math.random() * 10; }
          }
          if (c.state === 'rest') {   // nằm: đầu lim dim, thở khẽ
            c.restY = Math.min(1, c.restY + dt * 0.38); c.vk = 0;
            c.hz = -0.24 + Math.sin(t * 0.7 + c.ph) * 0.05; c.hx = Math.sin(t * 0.45 + c.ph) * 0.04;
          } else if (c.state === 'graze') {
            c.restY = Math.max(0, c.restY - dt * 0.5);
            c.hz = -0.62 + Math.sin(t * 2.5 + c.ph) * 0.14; c.hx = 0;
            if (c.restY <= 0 && (c.gstep = (c.gstep ?? 2 + Math.random() * 5) - dt) <= 0) { c.gwalk = 1.4 + Math.random() * 1.6; c.gstep = 5 + Math.random() * 8; c.angT = c.ang + (Math.random() - 0.5) * 0.8; }
            if (c.gwalk > 0) { c.gwalk -= dt; cowWander(c, dt, 0.22); } else c.vk = 0;
          } else {
            c.restY = Math.max(0, c.restY - dt * 0.5);
            if (c.restY <= 0) cowWander(c, dt, c.spd); else c.vk = 0;
            c.hz = -0.18; c.hx = 0;
          }
        }
        function cowWander(c, dt, sp) {   // đi theo hướng c.angT (quay dần ≤ 1,2 rad/s); vướng (nước, chuồng, mép bãi) thì quay sang hướng khác
          if (c.angT === undefined) c.angT = c.ang;
          let da = c.angT - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          const mt = 1.2 * dt; c.ang += Math.max(-mt, Math.min(mt, da));
          c.vk = Math.min(1, (c.vk || 0) + dt / 0.9);
          const v = sp * c.vk * (Math.abs(da) > 0.9 ? 0.3 : 1), nx = c.x + Math.cos(c.ang) * v * dt, nz = c.z + Math.sin(c.ang) * v * dt;
          if (cowOK(nx, nz)) { c.x = nx; c.z = nz; } else if (Math.abs(da) < 0.3) c.angT = c.ang + 2.3;
        }
        // ---- DÁNG BÒ mỗi khung (sau hành vi): tốc độ thật từ quãng đã đi → bộ chân IK · thân theo chỗ chân đứng · nảy / lắc theo nhịp chân ·
        //      đầu gật theo chân trước · nằm xuống QUỲ CHÂN TRƯỚC trước rồi mới hạ mông, đứng dậy NHỔM MÔNG trước rồi mới duỗi chân trước · đuôi mềm phẩy ruồi ----
        const cowSm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
        function cowDamp(S, target, w, dt) { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - target, tmp = (S.v + w * c) * dt; S.v = (S.v - w * tmp) * ex; S.x = target + (c + tmp) * ex; return S.x; }
        function cowPose(c, dt, t) {
          const g = c.g, U = g.userData, S = g.scale.y, rig = c.rig;
          g.position.x = c.x; g.position.z = c.z; g.rotation.y = -c.ang;
          if (!c.ps) {   // lần đầu: đặt 4 chân tại chỗ
            g.position.y = cowY(c.x, c.z); g.updateMatrixWorld(true); rig.plant(cowY);
            c.ps = { y: { x: g.position.y, v: 0 }, p: { x: 0, v: 0 }, hz: { x: c.hz ?? -0.2, v: 0 }, hx: { x: 0, v: 0 }, v: 0, px: c.x, pz: c.z, r0: c.restY, up: false, swat: 2 + Math.random() * 6, side: 1, lieSide: Math.random() < 0.5 ? -1 : 1 };
          }
          const P = c.ps;
          let dist = Math.hypot(c.x - P.px, c.z - P.pz); if (dist > 2) dist = 0;
          const fwd = (c.x - P.px) * Math.cos(c.ang) + (c.z - P.pz) * Math.sin(c.ang); P.px = c.x; P.pz = c.z;
          P.v += ((fwd < 0 ? -dist : dist) / Math.max(dt, 1e-3) - P.v) * Math.min(1, dt * 8);
          const sp = Math.abs(P.v); c.gait = c.gait === 'trot' ? (sp < 1.3 ? 'walk' : 'trot') : (sp > 1.6 ? 'trot' : 'walk');
          if (c.restY !== P.r0) { P.up = c.restY < P.r0; if (c.restY > 0.98) P.lieSide = Math.random() < 0.5 ? -1 : 1; } P.r0 = c.restY;
          const r = c.restY, fF = P.up ? cowSm(0, 0.6, r) : cowSm(0, 0.55, r), fH = P.up ? cowSm(0.45, 1, r) : cowSm(0.4, 1, r);
          // thân theo chỗ chân đứng: đất TB dưới 2 chân trước / 2 chân sau → độ cao + chúc/ngóc (lên bậc: chân trước lên trước, thân ngóc dần, chân sau theo sau)
          const yF = (rig.support(0) + rig.support(1)) / 2, yH = (rig.support(2) + rig.support(3)) / 2;
          g.position.y = cowDamp(P.y, (yF + yH) / 2, 7, dt);
          cowDamp(P.p, Math.max(-0.42, Math.min(0.42, Math.atan2(yF - yH, COW_SPAN * S))), 6, dt);
          const psi = rig.psi, walkA = Math.min(1, sp / 0.35) * (1 - Math.max(fF, fH));
          const bF = 0.03 * walkA * Math.cos(4 * Math.PI * (psi - 0.06)), bH = 0.03 * walkA * Math.cos(4 * Math.PI * (psi - 0.33));   // con lắc ngược: vai cao lúc chân trước giữa pha trụ, hông cao lúc chân sau giữa pha trụ
          const dF = 0.86 * fF, dH = 0.86 * fH, h = COW_H0 + (bF + bH - dF - dH) / 2, pitch = P.p.x + Math.atan2((bF - dF) - (bH - dH), COW_SPAN);
          U.torso.position.y = h; U.torso.rotation.z = pitch;
          for (let i = 0; i < 4; i++) {   // quỳ / nằm: khớp vai/hông lùi vào gần giữa thân, ngang mặt bụng; góc khớp gập sẵn hoà với IK
            const fr = i < 2, L = c.legs[i], w = fr ? fF : fH, K = rig.fk[i] || (rig.fk[i] = { a: 0, b: 0, p: 0, w: 0 });   // trước: gối ló trước ngực, cẳng gập ra sau · sau: khuỷu ló sau mông, móng thu dưới bụng
            L.hip.position.x = L.x0 + ((fr ? 0.25 : -0.3) - L.x0) * w; L.hip.position.y = COW_PIV * (1 - w);
            K.a = fr ? 1.45 : -1.45; K.b = fr ? -2.9 : 2.9; K.p = 0; K.w = w;
          }
          rig.step(dt, dist, P.v, c.gait, h, pitch, fF + fH > 0.02);
          // khối thân lắc ngang về phía 2 chân cùng bên đang trụ (1 lần/chu kỳ); nằm thì nghiêng về bên gập chân sau
          const lat = Math.sin(2 * Math.PI * (psi + 0.055)) * walkA;
          U.body.position.z = 0.022 * lat; U.body.rotation.x = 0.035 * lat + 0.1 * fH * P.lieSide;
          // đầu: dáng đích của hành vi (lò xo) + gật 2 lần/chu kỳ (thấp nhất ngay sau khi mỗi chân trước chạm đất) + bù chúc/ngóc của thân
          cowDamp(P.hz, c.hz ?? -0.2, 5, dt); cowDamp(P.hx, c.hx ?? 0, 5, dt);
          U.head.rotation.z = P.hz.x - 0.07 * walkA * Math.cos(4 * Math.PI * (psi - 0.28)) - 0.6 * pitch + 1.1 * Math.max(0, fF - fH); U.head.rotation.x = P.hx.x;   // đang quỳ (trước thấp, sau cao): ngóc đầu giữ thăng bằng
          // đuôi: chuỗi hạt mềm tự đung theo thân; vài giây phẩy ruồi một lần, đổi bên
          if ((P.swat -= dt) <= 0) {
            P.swat = (r > 0.5 ? 6 : 2.5) + Math.random() * 6; P.side = -P.side;
            const m = 1.3 + Math.random() * 0.9; c.tail.kick = (c.tail.kv || (c.tail.kv = new THREE.Vector3())).set(-Math.sin(c.ang) * P.side * m, 0.35 * m, Math.cos(c.ang) * P.side * m);
          }
          updateSoftTail(c.tail, dt, 0, 0);
        }
