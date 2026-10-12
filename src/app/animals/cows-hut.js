        // ---- bò gặm cỏ dưới tua-bin ----
        const cows = [];
        function cow(k) {
          const g = new THREE.Group();
          const P = (par, w, h, d, mat, x, y, z, o) => { const m = bx(w, h, d, mat, true, o !== false); m.position.set(x, y, z); par.add(m); return m; };
          // ---- THÂN đơn giản ----
          P(g, 1.7, 0.95, 0.85, cowWhite, 0, 1.4, 0);               // thân
          P(g, 0.5, 0.5, 0.87, cowDark, 0.45, 1.55, 0, false);       // đốm đen
          P(g, 0.42, 0.44, 0.88, cowDark, -0.5, 1.3, 0, false);      // đốm đen
          // ---- ĐẦU ----
          const hg = new THREE.Group(); hg.position.set(1.05, 1.35, 0); hg.rotation.z = -0.55; g.add(hg);
          P(hg, 0.6, 0.6, 0.6, cowWhite, 0.25, 0, 0);               // đầu
          P(hg, 0.42, 0.4, 0.46, cowPink, 0.62, -0.05, 0);          // mõm
          for (const e of [-1, 1]) P(hg, 0.16, 0.12, 0.34, cowDark, 0.05, 0.28, e * 0.34, false);   // tai
          for (const e of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), cowDark); eye.position.set(0.44, 0.15, e * 0.22); hg.add(eye); }  // mắt
          for (const e of [-1, 1]) { const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), cowHorn); horn.position.set(0.16, 0.42, e * 0.18); horn.rotation.x = -e * 0.4; hg.add(horn); }   // sừng
          // ---- CHÂN: GIỮ LẠI khớp HÔNG + GỐI (gập khi nằm) ----
          const legs = [];
          const legDefs = [[0.6, 0.32], [0.6, -0.32], [-0.62, 0.32], [-0.62, -0.32]];
          for (const lp of legDefs) {
            const hip = new THREE.Group(); hip.position.set(lp[0], 0.95, lp[1]); g.add(hip);
            P(hip, 0.28, 0.3, 0.28, cowWhite, 0, -0.15, 0);          // đùi trên
            P(hip, 0.22, 0.22, 0.22, cowWhite, 0, -0.38, 0, false);   // đùi dưới
            const knee = new THREE.Group(); knee.position.y = -0.5; hip.add(knee);
            P(knee, 0.2, 0.16, 0.2, cowWhite, 0, -0.07, 0, false);    // gối
            P(knee, 0.17, 0.26, 0.17, cowWhite, 0, -0.24, 0);        // ống chân
            P(knee, 0.17, 0.1, 0.18, cowDark, 0, -0.38, 0, false);    // khuỷu đen
            for (const hz of [-1, 1]) P(knee, 0.09, 0.14, 0.13, cowDark, 0, -0.46, hz * 0.045, false); // móng chẻ
            legs.push({ hip, knee });
          }
          // ---- ĐUÔI ----
          const tailG = new THREE.Group(); tailG.position.set(-0.9, 1.5, 0); tailG.rotation.z = 0.22; g.add(tailG);
          const tail = bx(0.1, 0.72, 0.1, cowWhite); tail.position.y = -0.36; tailG.add(tail);
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cowDark); tuft.position.y = -0.72; tailG.add(tuft);
          // ---- BẦU VÚ ----
          P(g, 0.34, 0.26, 0.46, cowPink, -0.18, 0.95, 0, false);
          g.scale.setScalar((k || 1.053) * NATURE_SCALE); g.userData.head = hg; g.userData.legs = legs; g.userData.tail = tailG; return g;
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
          cows.push({ g: m, head: m.userData.head, legs: m.userData.legs, tail: m.userData.tail, x, z, ang, spd: 0.65 + Math.random() * 0.45, ph: Math.random() * 6, tmr: 2 + Math.random() * 5, state: _cs, restY: 0 });
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
        function cowGait(c, dir) {   // pha bước bò theo QUÃNG ĐƯỜNG đã đi (1 chu kỳ 4 chân = 0,85 đv): đi chậm bước chậm, lùi thì bước ngược — chân không trượt
          const md = Math.hypot(c.x - (c.lx ?? c.x), c.z - (c.lz ?? c.z)); c.lx = c.x; c.lz = c.z;
          c.gph = ((c.gph || 0) + (md < 1 ? md : 0) * TAU / 0.85 * (dir < 0 ? -1 : 1)) % (TAU * 1000);
          return c.gph;
        }
        function cowSteer(c, tx, tz, dt, field) {   // đi về (tx,tz): xa thì theo trường dòng chảy (vòng qua nước, chuồng), gần thì đi thẳng
          const dx = tx - c.x, dz = tz - c.z, dist = Math.hypot(dx, dz);
          if (dist < 0.1) return true;
          let ux = dx / dist, uz = dz / dist;
          if (field && dist > 3) { const f = ffDir(field, c.x, c.z); if (f) { ux = f.x; uz = f.z; } }
          let da = Math.atan2(uz, ux) - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          c.ang += dist < 1 ? da : da * Math.min(1, dt * 3);                                     // quay đầu mượt, sát đích thì nhắm thẳng
          const step = Math.min(dist, c.spd * dt * (Math.abs(da) > 1.2 ? 0.35 : 1));
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
            if (!rising) { gait = -1; const ez = st.ez - 0.3; c.z = Math.min(ez, c.z + c.spd * 0.55 * dt); c.x += (st.x - c.x) * Math.min(1, dt * 2); if (c.z >= ez - 1e-3) c.leg = 'pasture'; }
          } else {   // về bãi gặm quen của từng con theo trường dòng chảy riêng (vòng qua chuồng, sông), tới nơi thì thả tự do
            gait = 1;
            if (cowSteer(c, c.homeX, c.homeZ, dt, c.homeField) || Math.hypot(c.homeX - c.x, c.homeZ - c.z) < 2.5) { c.mode = 'free'; c.leg = ''; c.state = 'graze'; c.tmr = 4 + Math.random() * 6; }
          }
          // ---- dáng: đi / lùi / nằm / gặm máng / đứng ----
          const lie = c.mode === 'home' && c.leg === 'in' && c.sub === 'rest';
          c.restY = lie ? Math.min(1, c.restY + dt * 0.85) : Math.max(0, c.restY - dt * 1.3);
          c.g.position.set(c.x, cowY(c.x, c.z) - c.restY * 0.8 * NATURE_SCALE, c.z); c.g.rotation.y = -c.ang;
          if (gait) {
            const sw = Math.sin(cowGait(c, gait) + c.ph) * 0.34;
            c.legs[0].hip.rotation.z = sw; c.legs[3].hip.rotation.z = sw; c.legs[1].hip.rotation.z = -sw; c.legs[2].hip.rotation.z = -sw;
            for (const L of c.legs) L.knee.rotation.z = Math.max(0, -Math.sin(c.gph + c.ph + 0.6)) * 0.32;
            c.head.rotation.z = -0.18 + Math.sin(t * 4 + c.ph) * 0.05; c.head.rotation.x = 0;
            if (c.tail) c.tail.rotation.z = 0.22 + Math.sin(t * 3.0 + c.ph) * 0.12;
          } else {
            for (let li = 0; li < 4; li++) { const L = c.legs[li], fr = li < 2; L.hip.rotation.z = (fr ? 1.5 : -1.5) * c.restY; L.knee.rotation.z = (fr ? -1.5 : 1.5) * c.restY; }   // gập chân khi nằm
            if (lie) { c.head.rotation.z = -0.24 + Math.sin(t * 0.7 + c.ph) * 0.05; c.head.rotation.x = Math.sin(t * 0.45 + c.ph) * 0.04; }
            else if (c.sub === 'eat' && c.leg === 'in') { c.head.rotation.z = -0.62 + Math.sin(t * 2.5 + c.ph) * 0.14; c.head.rotation.x = 0; }   // dúi đầu vào máng cỏ
            else { c.head.rotation.z = -0.2 + Math.sin(t * 0.9 + c.ph) * 0.06; c.head.rotation.x = Math.sin(t * 0.5 + c.ph) * 0.12; }
            if (c.tail) c.tail.rotation.z = 0.22 + Math.sin(t * (lie ? 1.1 : 2.2) + c.ph) * (lie ? 0.08 : 0.16);
          }
          return true;
        }

