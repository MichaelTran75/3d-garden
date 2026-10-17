        // ---- bò gặm cỏ dưới tua-bin ----
        const cows = [];
        // ---- BÒ — khung khớp (toạ độ cục bộ: +x mũi, +y lên): THÂN NGANG HÔNG (torso: cao, chúc/ngóc) → khối thân bò (lắc ngang theo nhịp chân)
        //      + đầu + bầu vú + ĐUÔI MỀM (chuỗi hạt XPBD như đuôi chó) · 4 chân 2 đoạn IK (animals/quadruped.js): gối chân trước chĩa TRƯỚC (khớp cổ
        //      tay), khuỷu chân sau chĩa SAU (khớp cổ chân), bàn móng giữ phẳng trên đất. Dáng đi, nằm/đứng dậy: cowPose ----
        const COW_H0 = 0.975, COW_SPAN = 1.22, COW_PIV = 0.25;   // độ cao mặt bụng khi đứng · khoảng cách hông trước–sau · khớp vai/hông nằm trong thân, cao hơn mặt bụng
        // ---- MÓNG BÒ (G 16/10: "cục đen nhỏ như đi guốc"): trước là khối đen "khuỷu" 0,1 chồng lên 2 khối móng cao 0,14, rộng ngang 0,22 > ống chân 0,17
        //      ⇒ cục đen cao 0,24 to hơn chân. Móng thật: 2 MÓNG CHẺ thấp (~6% chiều cao vai), mặt trước vát ~50° (mũi móng ló trước cổ chân), đế dài hơn
        //      vành móng, gót thấp; trên móng là cổ chân lông trắng; 2 móng huyền nhỏ sau cổ chân. Đế giữ ở −0,15 (ankleH: IK nhắm cổ chân). Gộp 1 lưới dùng chung.
        const cowHoof = new THREE.MeshLambertMaterial({ color: 0x35312c });
        // MÓNG CHẺ dùng chung (bò, hươu): 2 móng hình nêm (đế dài hơn vành, mặt trước vát, mũi thon dần về khe chẻ) + 2 móng huyền sau cổ chân, gộp 1 lưới.
        //   o: top/sole = y vành / đế · toe/heel = x mũi / gót ở đế · tToe/tHeel = x mũi / gót ở vành · zc = tâm mỗi móng · out/inn = nửa rộng ra ngoài / vào khe
        //      · tb/tt = độ thon mũi ở đế / vành · dew = [rộng, cao, x, y] móng huyền
        function cloveHoofGeo(o) {
          const claw = (zc) => {
            const g = new THREE.BoxGeometry(1, 1, 1), p = g.attributes.position, sz = Math.sign(zc);
            for (let v = 0; v < p.count; v++) {
              const sx = Math.sign(p.getX(v)), sy = Math.sign(p.getY(v)), out = Math.sign(p.getZ(v)) === sz, top = sy > 0, toe = sx > 0;
              const x = top ? (toe ? o.tToe : o.tHeel) : (toe ? o.toe : o.heel), y = top ? o.top : o.sole;
              const z = zc + (out ? sz * o.out : -sz * o.inn) - (out && toe ? sz * (top ? o.tt : o.tb) : 0);
              p.setXYZ(v, x, y, z);
            }
            g.computeVertexNormals(); return g;
          };
          const dew = (zc) => new THREE.BoxGeometry(o.dew[0], o.dew[1], o.dew[1]).translate(o.dew[2], o.dew[3], zc);
          return mergeGeometries([claw(o.zc), claw(-o.zc), dew(o.zc), dew(-o.zc)], false);
        }
        const COW_HOOF_GEO = cloveHoofGeo({ top: -0.065, sole: -0.15, toe: 0.115, heel: -0.075, tToe: 0.055, tHeel: -0.065, zc: 0.045, out: 0.039, inn: 0.033, tb: 0.022, tt: 0.01, dew: [0.04, 0.035, -0.095, -0.035] });
        function cow(k) {
          const g = new THREE.Group();
          const P = (par, w, h, d, mat, x, y, z, o) => { const m = bx(w, h, d, mat, true, o !== false); m.position.set(x, y, z); par.add(m); return m; };
          const torso = new THREE.Group(); torso.position.y = COW_H0; g.add(torso);
          const body = new THREE.Group(); body.position.y = -0.95; torso.add(body);   // khối thân giữ toạ độ cũ (mặt bụng ở 0,95)
          // ---- THÂN đơn giản ----
          P(body, 1.7, 0.95, 0.85, cowWhite, 0, 1.4, 0);               // thân
          P(body, 0.5, 0.5, 0.87, cowDark, 0.45, 1.55, 0, false);       // đốm đen
          P(body, 0.42, 0.44, 0.88, cowDark, -0.5, 1.3, 0, false);      // đốm đen
          // ---- CỔ + ĐẦU: khớp cổ N trong ngực (dưới–trước thân), đầu ở đầu cổ. Đứng: đầu đúng chỗ cũ; cúi gặm / uống: cổ xoay xuống tới 68°,
          //      quét trái–phải quanh N — mõm chạm cỏ / mặt nước thật (cowPose), không còn lơ lửng ~0,6 m như khi chỉ gật đầu ----
          const neck = new THREE.Group(); neck.position.set(0.656, 0.976, 0); neck.rotation.order = 'YZX'; body.add(neck);
          P(neck, 0.64, 0.44, 0.4, cowWhite, 0.159, 0.152, 0).rotation.z = 0.76;   // khối cổ dọc trục N → gáy (0,54 m + 0,1 lẹm vào ngực)
          const hg = new THREE.Group(); hg.position.set(0.394, 0.374, 0); hg.rotation.z = -0.55; neck.add(hg);
          P(hg, 0.6, 0.6, 0.6, cowWhite, 0.25, 0, 0);               // đầu
          const muzzle = P(hg, 0.42, 0.3, 0.46, cowPink, 0.62, 0, 0);          // mõm (hàm trên)
          const jaw = new THREE.Group(); jaw.position.set(0.41, -0.15, 0); hg.add(jaw); P(jaw, 0.38, 0.1, 0.4, cowPink, 0.19, -0.05, 0, false);   // hàm dưới: bản lề sau, nhai = há–ngậm + nghiến ngang
          const ears = [-1, 1].map(e => { const ep = new THREE.Group(); ep.position.set(0.05, 0.28, e * 0.2); hg.add(ep); P(ep, 0.16, 0.12, 0.3, cowDark, 0, 0, e * 0.15, false); return ep; });   // tai (giật đuổi ruồi)
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
            // cổ chân lông trắng (khớp hơi phình) · móng chẻ + móng huyền
            P(paw, 0.18, 0.085, 0.18, cowWhite, 0, -0.02, 0, false);
            { const h = new THREE.Mesh(COW_HOOF_GEO, cowHoof); h.castShadow = h.receiveShadow = true; paw.add(h); }
            legs.push({ hip, knee, paw, front: lp[0] > 0, side: Math.sign(lp[1]), L1: 0.5 + COW_PIV, L2: 0.38, ankleH: 0.15, bend: lp[0] > 0 ? 1 : -1, x0: lp[0] });
          }
          // ---- ĐUÔI MỀM: 5 đoạn buông từ mép sau lưng, chùm lông đen ở ngọn ----
          const tail = makeSoftTail(body, { base: new THREE.Vector3(-0.86, 1.72, 0), dir: new THREE.Vector3(-0.14, -1, 0).normalize(), n: 5, len: 0.15, w: 0.085, mat: cowWhite, stiff: [0.1, 0.025] });
          const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), cowDark); tuft.scale.set(1.3, 0.85, 0.85); tuft.position.x = 0.11; tail.segs[4].add(tuft);
          // ---- BẦU VÚ ----
          const udder = P(body, 0.34, 0.26, 0.46, cowPink, -0.18, 0.95, 0, false);
          g.scale.setScalar((k || 1.053) * NATURE_SCALE); g.userData = { torso, body, neck, head: hg, muzzle, legs, tail, jaw, ears, udder }; return g;
        }
        const cowCells = [[16, 5], [27, 6], [45, 5], [21, 8], [41, 6]];
        const x2gi = x => x / BLOCK + cx - 0.5, z2gj = z => z / BLOCK + cz - 0.5;
        let cowHutRect = null;   // khung chuồng bò (đặt khi dựng chuồng): bò gặm cỏ tự do không đi xuyên vách
        const cowOK = (x, z) => { const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z)); return gi > 4 && gi < GX - 4 && gj > 4 && gj < DAM_J + 6 && !isRiver(gi, gj) && padH(gi, gj) === null && damWalkAt(x, z) === null && !(cowHutRect && x > cowHutRect.x0 && x < cowHutRect.x1 && z > cowHutRect.z0 && z < cowHutRect.z1); };
        // độ cao mặt đứng cho mọi con vật + kỹ sư: trên đập/dốc nối = mặt đường đập · trên đường nội bộ = mặt đường (đắp cao hơn ô đất tới 1,3 m —
        // G 16/10: chim đứng mép đường bị lún; roadSurfaceAt ở world/street-lamps.js) · còn lại = ô đất
        const cowY = (x, z) => { const d = damDeckY(x, z); if (d !== null) return d; const s = surfaceY(Math.round(x2gi(x)), Math.round(z2gj(z))); if (!roadContains(x, z)) return s; const r = roadSurfaceAt(x, z).y; return r > s ? r : s; };
        // ---- LƯỚI MÔI TRƯỜNG cho thú nhỏ (G 16/10 "không bị va chạm"): ô 0,25 m, 1 = bị chắn (vật cản đã đăng ký: thân cây, cột, nhà, đồ trại; nước) —
        //      dựng 1 lần ở lần hỏi đầu (lúc đó mọi vật cản đã đăng ký); hỏi = tra bảng ----
        let envG = null;
        function envFree(x, z) {
          if (!envG || envG.n !== obstacleCoords.length + ENG_PROPS.length) {   // vật cản đăng ký thêm sau lần dựng trước → dựng lại
            const C = 0.25, x0 = wx(-MX) - BLOCK / 2, z0 = wz(-MZ) - BLOCK / 2, nx = Math.ceil((GX + 2 * MX) * BLOCK / C), nz = Math.ceil((GZ + 2 * MZ) * BLOCK / C), a = new Uint8Array(nx * nz);
            const disc = (x, z, r) => { const i0 = Math.max(0, Math.floor((x - r - x0) / C)), i1 = Math.min(nx - 1, Math.floor((x + r - x0) / C)), j0 = Math.max(0, Math.floor((z - r - z0) / C)), j1 = Math.min(nz - 1, Math.floor((z + r - z0) / C));
              for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const cx = x0 + (i + 0.5) * C - x, cz = z0 + (j + 0.5) * C - z; if (cx * cx + cz * cz <= r * r) a[i * nz + j] = 1; } };
            for (const o of obstacleCoords) disc(o.x, o.z, o.r);
            for (const o of ENG_PROPS) disc(o.x, o.z, o.r);
            for (let gi = -MX; gi < GX + MX; gi++) for (let gj = -MZ; gj < GZ + MZ; gj++) if (isWater(gi, gj)) disc(wx(gi), wz(gj), BLOCK * 0.71);
            envG = { a, C, x0, z0, nx, nz, n: obstacleCoords.length + ENG_PROPS.length };
          }
          const G = envG, i = Math.floor((x - G.x0) / G.C), j = Math.floor((z - G.z0) / G.C);
          return i >= 0 && j >= 0 && i < G.nx && j < G.nz && !G.a[i * G.nz + j];
        }
        for (const c of cowCells) {
          const i = c[0] * S, j = c[1] * S; if (isRiver(i, j) || padH(i, j) !== null) continue;
          const m = cow((1.053 + Math.random() * 0.2835) * 0.9), x = wx(i), z = wz(j), ang = Math.random() * 6.28; m.position.set(x, surfaceY(i, j), z); m.rotation.y = -ang; scene.add(m);
          const _cs = ['graze', 'rest', 'walk'][Math.floor(Math.random() * 3)];
          const cw = { g: m, head: m.userData.head, legs: m.userData.legs, tail: m.userData.tail, x, z, ang, spd: 0.65 + Math.random() * 0.45, ph: Math.random() * 6, tmr: 2 + Math.random() * 5, state: _cs, restY: 0 };
          cowRig(cw); cows.push(cw);
        }
        function cowRig(cw) {
          const Sc = cw.g.scale.y;
          cw.rig = quadRig(cw.g, { legs: cw.legs, gaits: {   // đi bộ 4 phách trình tự bên (sau-T → trước-T → sau-P → trước-P), chạm đất ~65%; nước kiệu khi vội
            walk: { off: [0.27, 0.77, 0, 0.5], duty: 0.65, stride: 1.15 * Sc, lift: 0.085, vRef: 1.0 },
            trot: { off: [0, 0.5, 0.5, 0], duty: 0.45, stride: 1.9 * Sc, lift: 0.12, vRef: 1.8 } },
            home: (L, out) => out.set(L.hip.position.x, 0, L.hip.position.z), ground: (x, z) => colWalkY(x, z, cowY(cw.x, cw.z), 0.3 * Sc), size: Sc, settleT: 0.45, settleLift: 0.07 });   // mặt đứng: đất hoặc sàn chuồng / bậc thấp (core/collide.js)
        }
        // ---- BÊ CON (G 17/10 "mở rộng chuồng bò cho thêm bò con"): 2 bê theo 2 bò mẹ; chuồng thêm 2 ô (dựng theo số con), ô bê sát ô mẹ.
        //  Tập tính bê (BCRC / UNL Beef, Jensen 2011, von Keyserlingk & Weary 2007): bám mẹ 1–3 m, đi cạnh hông / sau mẹ; nằm nghỉ 60–80% thời gian, cạnh
        //  mẹ; BÚ 5–8 lần/ngày, mỗi lần 5–10 phút — đứng song song NGƯỢC CHIỀU bên hông mẹ, đầu tới bầu vú, HÚC lên từng đợt, đuôi ngoe nguẩy; mẹ đứng yên
        //  ngoảnh lại ngửi con; CHƠI từng đợt ngắn (chạy vòng, nhảy hất chân sau), hay vào chiều muộn; tập gặm cỏ theo mẹ. Nhịp trong cảnh dồn lại
        //  cho người xem kịp thấy (đói sữa ~15 phút, bú 2–4 phút). Mô hình: bò thu 0,5, đầu to hơn tỉ lệ, không bầu vú ----
        for (const mi of [1, 3]) {
          const dam = cows[mi]; if (!dam) continue;
          const m = cow(dam.g.scale.y / NATURE_SCALE * 0.5); m.userData.udder.visible = false; m.userData.head.scale.setScalar(1.22);
          let x = dam.x + 1.5, z = dam.z; for (const a of [1.6, -1.6, 2.6, -2.6]) { const tx = dam.x + Math.cos(dam.ang + a) * 1.6, tz = dam.z + Math.sin(dam.ang + a) * 1.6; if (cowOK(tx, tz)) { x = tx; z = tz; break; } }
          m.position.set(x, cowY(x, z), z); m.rotation.y = -dam.ang; scene.add(m);
          const cw = { g: m, head: m.userData.head, legs: m.userData.legs, tail: m.userData.tail, x, z, ang: dam.ang, spd: 0.8, ph: Math.random() * 6, tmr: 3, state: 'follow', restY: 0, dam, side: Math.random() < 0.5 ? 1 : -1, milk: Math.random() * 0.7 };
          cowRig(cw); dam.calf = cw; cows.push(cw);
        }

        // ---- CHUỒNG BÒ tại ghim (54, 7, 49): khung cột gỗ, mái tôn một mái dốc ra sau, mặt trước mở hướng nam (+Z) để nhìn thấy bò bên trong;
        //      mỗi con một ô (vách ngăn 2 thanh), máng cỏ dọc vách sau, rơm lót nền, máng nước + cây rơm + chĩa cỏ bên hông, đèn sợi đốt treo trước chuồng.
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
          const postWood = new THREE.MeshLambertMaterial({ color: 0x6e5236, map: grain }), concrete = surfaceStyle(new THREE.MeshLambertMaterial({ color: 0x9a948a }), 'concrete');
          for (const m of [...wood, postWood]) surfaceStyle(m, 'woodAO');   // chân ván / cột tối dần, ám bẩn (core/surface-style.js)
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
          // mái kéo dài sang TÂY 0,8 m (G 14/10) che hộp tổ chim sẻ bắt ở vách tây (animals/songbird.js). Kết cấu phần chìa (sửa 15/10 theo ảnh G: 2 thanh chống
          // cũ lơ lửng, thanh trước đâm ra ngoài mép mái 0,3 m, kèo mép không có gì đỡ): xà đầu trước / sau VƯƠN sang tây tới kèo mép mái, mỗi đầu
          // vươn có 1 thanh chống góc từ cột góc tây lên đỡ dưới xà (tam giác cứng cột – xà – chống)
          const EXT = 0.8, xW = -W / 2 - 0.35 - EXT - 0.06, xE = W / 2 + 0.2;   // mép tây xà = qua kèo mép mái 1 chút
          add(bx(xE - xW, 0.16, 0.14, wood[1], true, true, lineDark), (xE + xW) / 2, Hf - 0.08, D / 2);    // xà đầu trước
          add(bx(xE - xW, 0.16, 0.14, wood[1], true, true, lineDark), (xE + xW) / 2, Hb - 0.08, -D / 2);   // xà đầu sau
          for (const [z, H] of [[D / 2, Hf], [-D / 2, Hb]]) {   // thanh chống góc: chân ở mặt tây cột góc (thấp hơn xà 0,95 m) → đầu đỡ dưới xà, cách cột 0,65 m
            const ax = -W / 2 - 0.09, ay = H - 0.95, bx2 = -W / 2 - 0.09 - 0.65, by = H - 0.16, br = add(bx(Math.hypot(bx2 - ax, by - ay), 0.07, 0.06, wood[1], true, false), (ax + bx2) / 2, (ay + by) / 2, z);
            br.rotation.z = Math.atan2(by - ay, bx2 - ax);
          }
          // kèo + mái tôn dốc về sau (nước mưa chảy ra sau chuồng); kèo mép mái tây gác lên 2 đầu xà vươn
          const pitch = Math.atan((Hf - Hb) / D), rz = 0.1, ry = Hb + (Hf - Hb) * (rz + D / 2) / D;
          for (let k = 0; k <= n; k += (n > 4 ? 2 : 1)) { const r = add(bx(0.09, 0.12, D + 0.8, wood[2], true, false), -W / 2 + k * SW, ry + 0.02, rz); r.rotation.x = -pitch; }
          { const r = add(bx(0.09, 0.12, D + 0.8, wood[2], true, false), -W / 2 - 0.35 - EXT, ry + 0.02, rz); r.rotation.x = -pitch; }
          const roof = add(bx(W + 0.9 + EXT, 0.035, D + 1.0, tin, true, true, lineDark), -EXT / 2, ry + 0.1, rz); roof.rotation.x = -pitch;
          const fascia = add(bx(W + 0.9 + EXT, 0.12, 0.04, wood[0], true, false), -EXT / 2, Hf + 0.06 + Math.tan(pitch) * 0.45, D / 2 + 0.47); fascia.rotation.x = -pitch;
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
          // máng cỏ dọc vách sau, cỏ khô mỗi ô vun cao thấp khác nhau, nhô quá tấm chắn (bò ăn trên đống cỏ, không phải chọc mõm qua ván)
          add(bx(W - 0.1, 0.5, 0.06, wood[1], true, true, lineDark), 0, 0.39, -D / 2 + 0.62);
          add(bx(W - 0.1, 0.06, 0.5, wood[2], true, false), 0, 0.3, -D / 2 + 0.37);
          const hayTop = [];
          for (let k = 0; k < n; k++) { const hh = 0.3 + Math.random() * 0.08; add(bx(SW - 0.22, hh, 0.42, hay, false, false), -W / 2 + (k + 0.5) * SW, 0.33 + hh / 2, -D / 2 + 0.37); hayTop.push(0.33 + hh); }
          // máng nước bê tông bên đông: lòng rỗng (đáy + 4 thành dày 7 cm), mặt nước thấp hơn miệng 8 cm — bò dúi mõm xuống uống
          const trX = W / 2 + 0.95;
          add(bx(0.7, 0.08, 1.6, concrete, true, true, lineDark), trX, 0.04, 0.75);
          for (const s of [-1, 1]) { add(bx(0.07, 0.5, 1.6, concrete, true, true, lineDark), trX + s * 0.315, 0.25, 0.75); add(bx(0.56, 0.5, 0.07, concrete, true, true, lineDark), trX, 0.25, 0.75 + s * 0.765); }
          const wtr = add(new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.46), water), trX, 0.42, 0.75); wtr.rotation.x = -Math.PI / 2; wtr.userData.noBake = true;
          // cây rơm vuông bên tây: 2 kiện dưới, 1 kiện trên lệch, buộc dây
          const bale = (x, y, z, ry) => { const b = add(bx(1.0, 0.45, 0.5, hay, true, true, lineDark), x, y, z); b.rotation.y = ry; for (const o of [-0.25, 0.25]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.47, 0.52), rope); t.position.x = o; b.add(t); } };
          const blX = -W / 2 - 1.05;
          bale(blX, 0.37, 0.15, Math.PI / 2); bale(blX, 0.37, 1.25, Math.PI / 2 + 0.06); bale(blX + 0.04, 0.83, 0.7, Math.PI / 2 - 0.12);
          // chĩa cỏ dựng nghiêng vào vách tây
          const fork = new THREE.Group(); fork.position.set(-W / 2 - 0.24, 0.14, D / 2 - 0.4); fork.rotation.z = -0.16; g.add(fork);
          const handle = cyl(0.022, 0.022, 1.55, wood[0], true, false, null, 6); handle.position.y = 0.78; fork.add(handle);
          for (const o of [-0.07, 0, 0.07]) { const tine = cyl(0.008, 0.012, 0.32, iron, true, false, null, 5); tine.position.set(0, 1.68, o); fork.add(tine); }
          const forkBar = bx(0.02, 0.03, 0.16, iron, true, false); forkBar.position.y = 1.53; fork.add(forkBar);
          // ---- ĐÈN SỢI ĐỐT treo trước chuồng (G 15/10 khoanh ảnh: giữa cột giữa và cột thứ 4, dưới xà trước; thay đèn chao cũ) — dựng theo số đo mẫu
          //      "Incandescent Light Bulb" (AleixoAlonso, CC-BY-4.0 — chỉ đo): bóng quả lê A19 (cao ≈ 1,65 × rộng, cổ ≈ 0,46 × bụng), đui xoáy E27 ren kim loại,
          //      trụ thuỷ tinh, 2 dây đỡ + sợi tóc vắt ngang; treo bằng dây điện + đui bakelite. Đêm: sợi tóc rực cam, vỏ bóng ửng sáng, quầng sáng ấm +
          //      đèn điểm ~2.700 K; dây đung đưa nhẹ theo gió (con lắc) ----
          const CORD = 0.3, LS = 1.1;   // bóng to hơn thật ~10% cho dễ thấy
          const lamp = new THREE.Group(); lamp.name = 'Đèn sợi đốt chuồng bò'; lamp.userData.noBake = true; lamp.position.set(0.75, Hf - 0.16, D / 2); g.add(lamp);
          const bake = new THREE.MeshLambertMaterial({ color: 0x2b2420 }), metal = new THREE.MeshLambertMaterial({ color: 0xc8b98e });
          lamp.add(cyl(0.028, 0.028, 0.025, bake, true, false, null, 10));   // đế treo bắt dưới xà
          const cord = cyl(0.0045, 0.0045, CORD, bake, true, false, null, 5); cord.position.y = -CORD / 2; lamp.add(cord);
          const bulbG = new THREE.Group(); bulbG.position.y = -CORD - 0.046 * LS; bulbG.rotation.x = Math.PI; bulbG.scale.setScalar(LS); lamp.add(bulbG);   // dựng đứng (đui dưới) rồi lật: đui trên, bầu kính chúc xuống
          const sock = cyl(0.024, 0.026, 0.056, bake, true, false, null, 12); sock.position.y = -0.016; bulbG.add(sock);
          { const p = []; for (let k = 0; k <= 12; k++) p.push(new THREE.Vector2(k % 2 ? 0.0186 : 0.0208, 0.012 + k * 0.0018)); bulbG.add(new THREE.Mesh(new THREE.LatheGeometry(p, 12), metal)); }   // ren E27
          const glassM = new THREE.MeshLambertMaterial({ color: 0xf2efe6, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
          const glass = new THREE.Mesh(new THREE.LatheGeometry([[0.021, 0.031], [0.022, 0.045], [0.026, 0.058], [0.034, 0.072], [0.042, 0.088], [0.046, 0.104], [0.046, 0.118], [0.042, 0.132], [0.032, 0.145], [0.018, 0.151], [0, 0.153]].map(([r, y]) => new THREE.Vector2(r, y)), 16), glassM); glass.renderOrder = 2; bulbG.add(glass);
          const stemM = new THREE.MeshLambertMaterial({ color: 0xe9e6dc, transparent: true, opacity: 0.55, depthWrite: false }), wireM = new THREE.MeshLambertMaterial({ color: 0x55504a });
          const stem = cyl(0.004, 0.008, 0.05, stemM, false, false, null, 8); stem.position.y = 0.056; bulbG.add(stem);
          for (const sx of [-1, 1]) rodBetween(bulbG, new THREE.Vector3(sx * 0.004, 0.075, 0), new THREE.Vector3(sx * 0.016, 0.101, 0), 0.0009, wireM, 3, false);   // 2 dây đỡ
          const filM = new THREE.MeshBasicMaterial({ color: 0x4a4744 });
          bulbG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.016, 0.101, 0), new THREE.Vector3(0, 0.096, 0), new THREE.Vector3(0.016, 0.101, 0)), 8, 0.0016, 4), filM));   // sợi tóc
          const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,150,1)'); gr.addColorStop(0.25, 'rgba(255,170,90,0.45)'); gr.addColorStop(1, 'rgba(255,150,70,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })(), color: 0xffc27a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
          halo.position.y = 0.1; halo.scale.setScalar(0.8 / LS); halo.visible = false; bulbG.add(halo);
          const light = new THREE.PointLight(0xffc58a, 0, 9, 2); light.position.y = 0.1; bulbG.add(light);
          lamp.traverse(o => { o.userData.noBatch = true; });
          const lsw = { x: 0, z: 0, vx: 0, vz: 0 }, _lw = new THREE.Vector3(), lampW = new THREE.Vector3();
          const lampTick = (dt, n) => {   // n = độ tối (0 ngày → 1 đêm) · con lắc dây 0,4 m (ω₀ ≈ 5 rad/s), gió dưới mái yếu đi còn ~40%
            filM.color.setRGB(0.29 + 0.71 * n, 0.28 + 0.45 * n, 0.27 + 0.1 * n); glassM.emissive.setRGB(0.48 * n, 0.29 * n, 0.13 * n); glassM.opacity = 0.3 + 0.2 * n;   // G 15/10: sáng giảm 50%
            halo.visible = n > 0.02; halo.material.opacity = 0.4 * n;
            if (!lampW.lengthSq()) lamp.getWorldPosition(lampW);
            windAt(lampW.x, lampW.y, lampW.z, 2.6, _lw); const ex = 0.012 * Math.abs(_lw.x) * _lw.x, ez = 0.012 * Math.abs(_lw.z) * _lw.z;
            for (let h = Math.min(dt, 0.05), k = Math.ceil(h / 0.0167), st = h / k, i = 0; i < k; i++) {
              lsw.vx += (-25 * (lsw.x - ex) - 0.8 * lsw.vx) * st; lsw.x += lsw.vx * st; lsw.vz += (-25 * (lsw.z - ez) - 0.8 * lsw.vz) * st; lsw.z += lsw.vz * st;
            }
            lamp.rotation.set(-lsw.z, 0, lsw.x);
          };
          bakeStatic(g); scene.add(g);
          const stalls = [];
          for (let k = 0; k < n; k++) { const sx = hx - W / 2 + (k + 0.5) * SW; stalls.push({ x: sx, z: hz + 0.2, ex: sx, ez: hz + D / 2 + 1.3, hay: hayTop[k] }); }
          cowHutRect = { x0: hx - W / 2 - 1.7, x1: hx + W / 2 + 1.45, z0: hz - D / 2 - 0.35, z1: hz + D / 2 + 0.25 };
          return { g, x: hx, z: hz, y: y0, W, D, Hf, Hb, stalls, light, lampTick, door: { x: hx, z: hz + D / 2 + 2.2 } };
        })();
        { let k = 0; for (const c of cows) if (!c.dam) { c.stall = k++; if (c.calf) c.calf.stall = k++; } }   // bê nằm ô sát ô mẹ
        cows.forEach(c => { c.mode = 'free'; c.leg = ''; c.sub = 'stand'; });
        const cowHutWanted = () => { const h = liveWeather.localHour; return liveWeather.state.raining || h >= 17.9 || h < 6.2; };   // chiều tối hoặc mưa → về chuồng
        let hutField = null;   // trường dòng chảy về cửa chuồng (dựng sau khi lưới cấm sẵn sàng); mỗi con có thêm c.homeField về bãi quen
        const COW_SLIDE = [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1, 1.5, -1.5];
        function cowSteer(c, tx, tz, dt, field) {   // đi về (tx,tz): xa thì theo trường dòng chảy (vòng qua nước, chuồng), gần thì đi thẳng
          const dx = tx - c.x, dz = tz - c.z, dist = Math.hypot(dx, dz);
          if (dist < 0.1) return true;
          let ux = dx / dist, uz = dz / dist;
          if (field && dist > 3) { const f = ffDir(field, c.x, c.z); if (f) { ux = f.x; uz = f.z; } }
          // nhìn trước 1,2 m theo hướng muốn đi (kiểu "obstacle avoidance" của Reynolds): thân cây / cột chắn thì lái vòng sang phía thoáng (±29° / ±57°),
          // khỏi húc vào rồi mới trượt / đi xuyên. Dò lại mỗi 0,3 s; nhìn trước tối đa tới cách đích 0,5 m, còn cách đích < 1,5 m thì thôi (đích sát vật: máng, chỗ gãi)
          const K = c.col;
          if (K && COL.ready && !(K.ghost > 0) && dist > 1.5) {
            if ((K.avT = (K.avT || 0) - dt) <= 0) {
              K.avT = 0.3; K.avA = null;
              const mk = K.mask(), la = Math.min(1.2, dist - 0.5), th = Math.atan2(uz, ux), sg = Math.sin(c.ang - th) >= 0 ? 1 : -1, pr = (a) => colFootHits(c.x + Math.cos(a) * la, c.z + Math.sin(a) * la, a, K.a, K.b, K.lo, K.hi, mk);
              if (pr(th) > 0) { let bh = Infinity; for (const o of [0.5 * sg, -0.5 * sg, sg, -sg]) { const h = pr(th + o); if (h < bh) { bh = h; K.avA = th + o; } if (h <= 0) break; } }
            }
            if (K.avA != null) { ux = Math.cos(K.avA); uz = Math.sin(K.avA); }
          } else if (K) K.avA = null;
          let da = Math.atan2(uz, ux) - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          const mt = 1.4 * dt, na = c.ang + Math.max(-mt, Math.min(mt, dist < 1 ? da : da * Math.min(1, dt * 3)));   // quay đầu mượt (bò quay chậm, ≤ 80°/giây), sát đích thì nhắm thẳng
          const turnOK = !K || colTurnOK(K, c.x, c.z, c.ang, na); if (turnOK) c.ang = na;   // xoay mà quét thân vào cây / con bên cạnh thì chưa xoay (đi tiếp / trượt ra đã)
          c.vk = Math.min(1, (c.vk || 0) + dt / 0.9);   // nhấc bước tăng tốc dần ~0,9 s
          const step = dist < 0.6 && Math.abs(da) > 0.8 ? 0 : Math.min(dist, c.spd * c.vk * dt * (Math.abs(da) > 1.2 ? 0.25 : Math.abs(da) > 0.5 ? 0.6 : 1));   // ngoặt gắt sát đích: quay tại chỗ trước
          // bước thử theo hướng mặt; vướng thì trượt lệch dần ±20°/40°/63° (men theo lan can, vách chuồng, mép nước), chặn thẳng mặt thì nhích ngang ±86°
          const freeHere = !cowBlocked[Math.round(x2gi(c.x)) + Math.round(z2gj(c.z)) * GX];
          let moved = step <= 0;
          for (const off of COW_SLIDE) {
            const a = c.ang + off, sk = Math.abs(off) > 1.2 ? 0.4 : 1, nx = c.x + Math.cos(a) * step * sk, nz = c.z + Math.sin(a) * step * sk, ni = Math.round(x2gi(nx)), nj = Math.round(z2gj(nz));
            if (isWater(ni, nj) && damDeckY(nx, nz) === null) continue;                      // không bao giờ lội sông: chỉ qua bằng mặt đập
            if (field && dist > 3 && freeHere && cowBlocked[ni + nj * GX]) continue;      // không cắt góc xuyên lan can / vách
            if (c.col && !(c.col.ghost > 0) && !colStepOK(c.col, c.x, c.z, nx, nz, c.ang)) continue;   // thân cây, cột, vách thật (core/collide.js)
            c.x = nx; c.z = nz; moved = true;
            if (off) { const na2 = c.ang + off * Math.min(1, dt * 4); if (!K || colTurnOK(K, c.x, c.z, c.ang, na2)) c.ang = na2; }
            break;
          }
          if (K) { if (moved) K.stuck = 0; else if (Math.abs(da) < 0.5 || !turnOK) colStuck(K, dt); }   // đang quay về hướng mới (ra khỏi ô chuồng quay ~180°) thì chưa tính là kẹt
          return false;
        }
        function cowHome(c, dt, t, want) {   // true = bò đang trong lộ trình chuồng (tự lo vị trí + dáng), false = để hành vi gặm cỏ cũ chạy
          if (want && c.mode !== 'home') { c.mode = 'home'; c.leg = c.leg === 'back' ? 'stall' : 'door'; }
          else if (!want && c.mode === 'home') { if (c.leg === 'door' && !damWalkAt(c.x, c.z)) c.mode = 'free'; else if (c.leg === 'door') { c.mode = 'leave'; c.leg = 'pasture'; } else { c.mode = 'leave'; c.leg = 'back'; c.backW = undefined; } }   // hết mưa giữa đường về chuồng: thả tại chỗ — trừ khi đang trên mặt đập (về bãi quen, không gặm cỏ giữa cầu sát lan can)
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
          } else if (c.leg === 'back') {   // lùi thẳng ra khỏi ô, mặt vẫn hướng máng — LẦN LƯỢT từng con (~4,5 s / ô): ra cùng lúc thì 3–4 con đứng sát nhau 1,5 m
            // trước cửa ô, thân dài 1,9 m không con nào xoay được (lớp va chạm chặn xoay quét vào con bên cạnh) ⇒ kẹt rồi đi xuyên nhau
            // lùi tới khi đầu ra khỏi mép ô ~0,9 m (trước chỉ tới mép: quay người là đầu quét vào cột ô ⇒ bị chặn xoay, kẹt)
            if ((c.backW = (c.backW ?? cows.filter(o => o.mode === 'leave' && o.leg === 'back' && o.stall < c.stall).length * 4.5) - dt) > 0) { c.vk = 0; }
            else if (cows.some(o => o !== c && o.leg !== 'back' && o.mode !== 'home' && Math.abs(o.x - st.x) < 1.3 && o.z > c.z - 1.2 && o.z < st.ez + 2)) c.vk = 0;   // con khác (đã ra) đang đi ngang sau đuôi: chờ
            else if (!rising) { gait = -1; c.vk = Math.min(1, (c.vk || 0) + dt / 0.9); const ez = st.ez + 0.6; c.z = Math.min(ez, c.z + c.spd * 0.45 * c.vk * dt); c.x += (st.x - c.x) * Math.min(1, dt * 2); if (c.z >= ez - 1e-3) { c.leg = 'pasture'; c.backW = undefined; } }
          } else {   // về bãi gặm quen của từng con theo trường dòng chảy riêng (vòng qua chuồng, sông), tới nơi thì thả tự do
            gait = 1;
            if (cowSteer(c, c.homeX, c.homeZ, dt, c.homeField) || Math.hypot(c.homeX - c.x, c.homeZ - c.z) < 2.5) { c.mode = 'free'; c.leg = ''; c.state = 'graze'; c.tmr = 4 + Math.random() * 6; }
          }
          // ---- dáng đích (cowPose dựng thân, chân, đầu, đuôi): đi / lùi / nằm / gặm máng / đứng ----
          const lie = c.mode === 'home' && c.leg === 'in' && c.sub === 'rest';
          c.restY = lie ? Math.min(1, c.restY + dt * 0.38) : Math.max(0, c.restY - dt * 0.5);
          if (!gait) c.vk = 0;
          c.chew = 0;
          if (gait) { c.hz = -0.18; c.hx = 0; }
          else if (lie) { c.hz = -0.24 + Math.sin(t * 0.7 + c.ph) * 0.05; c.hx = Math.sin(t * 0.45 + c.ph) * 0.04; c.chew = (t + c.ph * 9) % 55 < 52.5 ? 1 : 0; }   // nằm nhai lại
          else if (c.sub === 'eat' && c.leg === 'in') { c.hz = -0.42 + Math.sin(t * 2.5 + c.ph) * 0.1; c.hx = 0.1 * Math.sin(t * 0.7 + c.ph); c.chew = 0.7; c.reachY = cowHut.y + st.hay + 0.01; }   // dúi mõm vào máng cỏ khô
          else { c.hz = -0.2 + Math.sin(t * 0.9 + c.ph) * 0.06; c.hx = Math.sin(t * 0.5 + c.ph) * 0.12; c.chew = 0.5; }
          return true;
        }
        // ---- HÀNH VI BÒ NGOÀI BÃI (G 15/10 "research and improve the cow behaviour movements") ----
        //  Nghiên cứu: gặm ~8 h/ngày, dồn vào bình minh, chiều muộn, chạng vạng; nóng thì gặm ít, nằm / đứng dưới bóng cây (UMN Extension);
        //  nhịp cắn ~48–54 lần/phút (Hay & Forage); nhai lại 15–20 đợt/ngày, mỗi đợt 20–30 phút, phần lớn khi NẰM; ~60 lần nhai / viên mồi
        //  ~55 s rồi nuốt – ợ viên mới (SmartCow; Mendel Univ.); ĐỒNG BỘ BẦY: ~70% đàn cùng tư thế 93% thời gian, đồng bộ nhất sáng / chiều,
        //  bò bắt chước con ĐỨNG GẦN hơn là cả đàn (Stoye 2012). ⇒ chọn việc theo giờ + theo con gần nhất; gặm: đầu quét trái–phải trong "ô ăn",
        //  giật cắn ~0,85 lần/s, nhích 1–2 bước sang búi kế, thỉnh thoảng ngẩng canh chừng; nhai lại: hàm há–ngậm + nghiến ngang ~1,1 lần/s,
        //  ~55 s nuốt – ợ viên mới (cổ vươn nhẹ); trước khi nằm cúi đánh hơi, quét đầu; bầy giữ gần nhau, cách nhau ≥ 1,8 m; người / chó tới
        //  gần < 3,5 m thì đứng dậy, quay đi; ra máng 2–5 lần/ngày, mỗi lần 1–4 phút (OSU Extension) ⇒ cữ uống ~4 giờ, theo lối về chuồng ra máng,
        //  uống từng đợt, giữa chừng ngẩng lên, xong về bãi; trưa nóng ≥ 28 °C tìm bóng cây gần nằm.
        const cowGrazeDrive = h => h < 9.5 ? 0.85 : h < 11 ? 0.5 : h < 14.5 ? 0.1 : h < 16 ? 0.45 : 0.85;   // mức muốn gặm theo giờ (sáng / chiều cao, trưa thấp)
        const _cwT = new THREE.Vector3(), _cwM = new THREE.Vector3();
        function cowNear(c) { let best = null, bd = 1e9; for (const o of cows) { if (o === c || o.mode !== 'free' || o.dam) continue; const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; best = o; } } return [best, bd]; }
        function cowThreat(c) {   // người / chó tới gần (vùng bỏ chạy ~3,5 m)
          const e = engObj && !engObj.inVan && engObj.g.parent === scene ? engObj.g.position : null;
          if (e && Math.hypot(e.x - c.x, e.z - c.z) < 3.5) return e;
          if (!dogRain.st && Math.hypot(dogObj.position.x - c.x, dogObj.position.z - c.z) < 3.5) return dogObj.position;
          return null;
        }
        function cowShadeSpot(c) {   // bóng cây gần nhất (≤ 15 m), phía khuất nắng của thân cây — cách tâm thân 2,2 m: bò dài 1,9 m xoay hướng nào cũng không chạm thân
          // cây (1,6 m cũ: mõm / mông tì vào gốc to); chỗ đứng trống thật trên lớp va chạm (cây rừng khác, cột)
          let best = null, bd = 15; const sx = sun.position.x - sun.target.position.x, sz = sun.position.z - sun.target.position.z, sl = Math.hypot(sx, sz) || 1, K = c.col;
          for (const tc of treeCoords) { const d = Math.hypot(tc.x - c.x, tc.z - c.z); if (d < bd) { const x = tc.x - sx / sl * 2.2, z = tc.z - sz / sl * 2.2; if (cowOK(x, z) && !(K && colFootHits(x, z, 0, K.a, K.a, K.lo, K.hi, 13) > 0)) { bd = d; best = { x, z }; } } }
          return best;
        }
        // ---- NGƯỜI XEM ZOOM CẬN (G 15/10): cữ uống thật thưa ⇒ hiếm khi trùng lúc có người xem. Zoom cận 1 con (camera.zoom ≥ 7, con đó gần giữa
        //      khung ≥ 1,2 s, đang đứng hẳn / nằm hẳn): nó ngẩng lên quay đầu nhìn người xem 2,5–4 s (bò quen người quay mặt nhìn người tới gần —
        //      Highland Cattle USA), rồi nếu sắp tới cữ uống (khát ≥ 0,35, máng ≤ 35 m) thì đi uống luôn = dồn cữ sắp tới lên sớm, số lần uống trong
        //      ngày vẫn như thật. Zoom cận máng nước ≥ 1,5 s (không con nào đang uống): con gần máng nhất trong số con sắp tới cữ (≤ 35 m) ra uống. Mỗi lần nhìn chỉ 1 phản
        //      ứng; rời khung ≥ 8 s mới tính lại.
        const _cwV = new THREE.Vector3(), cowSeen = { tr: 0, trOff: 99, trDone: false };
        const cowTroughDist = c => Math.hypot(cowHut.x + cowHut.W / 2 + 2.3 - c.x, cowHut.z + 0.75 - c.z);
        function cowGoDrink(c) { c.state = 'drink'; c.slot = null; c.sub2 = 'go'; c.tmr = 999; c.lieIn = 3; c.watch = 0; }
        function cowWatch(dt) {
          const close = camera.zoom >= 7; let best = null, bd = 0.6;
          if (close) for (const c of cows) { if (c.mode !== 'free') continue; const v = _cwV.copy(c.g.position).project(camera), d = Math.max(Math.abs(v.x), Math.abs(v.y)); if (d < bd) { bd = d; best = c; } }
          for (const c of cows) {
            if (c !== best) { c.seen = 0; if ((c.unseen = (c.unseen || 0) + dt) > 8) c.seenDone = false; continue; }
            c.seen = (c.seen || 0) + dt; c.unseen = 0;
            if (c.seen > 1.2 && !c.seenDone && ['graze', 'rest', 'stand', 'walk'].includes(c.state) && (c.restY < 0.02 || c.restY > 0.98)) { c.seenDone = true; c.watch = 2.5 + Math.random() * 1.5; }
          }
          const v = _cwV.set(cowHut.x + cowHut.W / 2 + 0.95, cowHut.y + 0.4, cowHut.z + 0.75).project(camera), S = cowSeen;
          if (close && Math.abs(v.x) < 0.5 && Math.abs(v.y) < 0.5) {
            S.trOff = 0;
            if ((S.tr += dt) > 1.5 && !S.trDone) {
              S.trDone = true; let pick = null;
              if (!cows.some(c => c.mode === 'free' && c.state === 'drink')) for (const c of cows) if (c.mode === 'free' && c.state !== 'flee' && c.thirst >= 0.35 && cowTroughDist(c) < 35 && (!pick || cowTroughDist(c) < cowTroughDist(pick))) pick = c;
              if (pick) cowGoDrink(pick);
            }
          } else { S.tr = 0; if ((S.trOff += dt) > 8) S.trDone = false; }
        }
        // cây gần (≤ 14 m, cùng bờ, đi thẳng tới được) để gãi ngứa: bán kính thân đo ở độ cao vai trên lớp va chạm (core/collide.js); chỗ đứng P = vai sát
        // thân cây. Tới điểm chờ Q cách P 1,7 m dọc tiếp tuyến, xoay song song rồi mới đi dọc thân cây vào P (đi thẳng vào P thì đầu húc xuyên thân cây lúc quay)
        function cowRubTree(c) {
          if (!COL.ready || !c.col) return null;
          let best = null, bd = 14;
          for (const T of treeCoords) { const d = Math.hypot(T.x - c.x, T.z - c.z); if (d < bd && d > 1.5 && !cows.some(o => o !== c && o.rub && o.rub.tree === T)) { bd = d; best = T; } }   // mỗi cây 1 con
          if (!best) return null;
          // bán kính thân: vòng đầu tiên KHÔNG chạm sau khi đã gặp vỏ — thân cây trên lớp va chạm RỖNG (chỉ voxel hoá mặt vỏ), vòng nhỏ trong lõi thân to
          // cũng không chạm (bản đầu lấy luôn 0,15 m ⇒ chỗ đứng nằm trong thân cây gốc to)
          const S = c.g.scale.y, g = cowY(best.x, best.z); let rT = 0, seen = false;
          for (let r = 0.1; r <= 1.2 && !rT; r += 0.05) { let n = 0; for (let k = 0; k < 12; k++) if (colHit(1, best.x + Math.cos(k / 12 * TAU) * r, best.z + Math.sin(k / 12 * TAU) * r, g + 0.6 * S, g + 1.2 * S)) n++; if (n >= 3) seen = true; else if (seen && n <= 1) rT = r; }
          if (!rT) return null;
          const nx0 = c.x - best.x, nz0 = c.z - best.z, nl = Math.hypot(nx0, nz0), nx = nx0 / nl, nz = nz0 / nl, K = c.col, off = rT + K.b * 0.92, sh = 0.35 * K.a;
          let t0x = -nz, t0z = nx; if (t0x * Math.cos(c.ang) + t0z * Math.sin(c.ang) < 0) { t0x = -t0x; t0z = -t0z; }   // ưu tiên chiều xuôi theo hướng đang đứng
          for (const sg of [1, -1]) {
            const tx = t0x * sg, tz = t0z * sg, ang = Math.atan2(tz, tx), Px = best.x + nx * off - tx * sh, Pz = best.z + nz * off - tz * sh, Qx = Px - tx * 1.7, Qz = Pz - tz * 1.7;
            if (!cowOK(Qx, Qz) || colFootHits(Qx, Qz, ang, K.a, K.b, K.lo, K.hi, 13) > 0) continue;   // điểm chờ thoáng (không vướng cây khác, cành thấp, vách, cột)
            let ok = true;
            for (let k = 1; k <= 10 && ok; k++) ok = cowOK(c.x + (Qx - c.x) * k / 10, c.z + (Qz - c.z) * k / 10) && cowOK(Qx + (Px - Qx) * k / 10, Qz + (Pz - Qz) * k / 10);   // đường thẳng tới (không qua sông, chuồng, mép bãi)
            if (!ok) continue;
            const side = Math.sign((best.x - Px) * -tz + (best.z - Pz) * tx) || 1;   // cây ở bên trái (+1) / phải (−1) thân bò
            return { st: 'go', k: 0, P: new THREE.Vector3(Px, 0, Pz), Q: new THREE.Vector3(Qx, 0, Qz), ang, side, tree: best };
          }
          return null;
        }
        function cowChoose(c) {
          const h = liveWeather.localHour, G = cowGrazeDrive(h), hot = (liveWeather.state.temperature ?? 24) >= 28 && sunElevSin > 0.55;
          if ((c.thirst || 0) > 1) { c.slot = null; return 'drink'; }
          const w = { graze: G, rest: (1 - G) * 0.7, stand: (1 - G) * 0.3, walk: 0.12 }, [nb, nd] = cowNear(c);
          if (nb && nd < 7) { if (nb.state === 'rest' || nb.state === 'shade') w.rest += 0.4 * (1.3 - G); else if (nb.state === 'graze') w.graze += 0.4 * (G + 0.3); }   // bắt chước con gần — mạnh hay yếu theo nhịp giờ (nhịp giờ vẫn thắng về lâu)
          if (hot) { w.rest += 0.4; w.graze *= 0.5; }
          if (Math.random() < 0.07) { const R = cowRubTree(c); if (R) { c.rub = R; return 'scratch'; } }   // gãi ngứa: cọ vai / cổ vào thân cây gần (G 17/10, bước 3)
          let r = Math.random() * (w.graze + w.rest + w.stand + w.walk), pick = 'walk';
          for (const k of ['graze', 'rest', 'stand', 'walk']) { if ((r -= w[k]) <= 0) { pick = k; break; } }
          if (pick === 'rest' && hot) { const sp = cowShadeSpot(c); if (sp) { c.goal = sp; return 'shade'; } }
          return pick;
        }
        function cowFreeTick(c, dt, t) {
          if (c.dam) return calfFree(c, dt, t);
          if (c.calf && c.calf.suck) {   // bê đang bú: đứng yên, ngoảnh đầu về phía bê ngửi / liếm
            c.vk = 0; c.restY = Math.max(0, c.restY - dt * 0.5); const B = c.calf, lz = (B.x - c.x) * -Math.sin(c.ang) + (B.z - c.z) * Math.cos(c.ang);
            c.hz = -0.16 + 0.05 * Math.sin(t * 1.3); c.hx = -0.85 * Math.sign(lz); c.chew = 0.3; return;
          }
          c.thirst = (c.thirst ?? Math.random() * 0.9) + dt / 14400;   // cữ uống ~4 giờ thả bãi ⇒ 2–3 lần/ngày (OSU: 2–5 lần)
          const thr = cowThreat(c);
          if (thr && c.state !== 'flee') { c.state = 'flee'; c.rub = null; c.slot = null; c.tmr = 4 + Math.random() * 2; c.angT = Math.atan2(c.z - thr.z, c.x - thr.x); }
          c.tmr -= dt;
          if (c.tmr <= 0 && !(c.state === 'drink' || c.state === 'shade' || c.state === 'scratch') || (c.state === 'shade' && c.tmr <= 0 && c.sub2 === 'do')) {
            c.state = cowChoose(c); c.sub2 = 'go'; c.lieIn = 3;
            c.tmr = { graze: 40 + Math.random() * 80, rest: 60 + Math.random() * 120, stand: 25 + Math.random() * 35, walk: 4 + Math.random() * 6, drink: 999, shade: 999, scratch: 999 }[c.state];
            if (c.state === 'walk') {   // đi tiếp tới chỗ khác — lạc xa bầy (> 9 m) thì đi về phía tâm bầy
              let mx = 0, mz = 0, n = 0; for (const o of cows) if (o.mode === 'free') { mx += o.x; mz += o.z; n++; }
              c.angT = n > 1 && Math.hypot(mx / n - c.x, mz / n - c.z) > 9 ? Math.atan2(mz / n - c.z, mx / n - c.x) + (Math.random() - 0.5) * 0.6 : c.ang + (Math.random() - 0.5) * 1.7;
            }
          }
          c.chew = 0;
          const up = () => { c.restY = Math.max(0, c.restY - dt * 0.5); return c.restY <= 0; };   // đang nằm thì đứng dậy xong mới đi
          const rum = (lying) => {   // nhai lại: ~55 s mỗi viên, 2,5 s cuối ngừng nhai, cổ vươn nhẹ (nuốt – ợ viên mới)
            const b = (t + c.ph * 9) % 55, swallow = b > 52.5; c.chew = swallow ? 0 : 1;
            c.hz = (lying ? -0.24 : -0.16) + (swallow ? 0.14 * Math.sin(Math.PI * (b - 52.5) / 2.5) : 0) + Math.sin(t * 0.7 + c.ph) * 0.03; c.hx = Math.sin(t * 0.45 + c.ph) * 0.05;
          };
          if (c.watch > 0 && c.state !== 'flee') {   // có người zoom cận: ngẩng đầu quay mặt về phía người xem (đứng thì xoay dần cả thân cho cổ với tới), vẫn nhai
            c.watch -= dt; c.vk = 0;
            camera.getWorldDirection(_cwV); let d = Math.atan2(-_cwV.z, -_cwV.x) - c.ang; d = Math.atan2(Math.sin(d), Math.cos(d));
            if (c.restY < 0.05 && Math.abs(d) > 0.9) c.ang += Math.sign(d) * Math.min(Math.abs(d) - 0.9, 0.7 * dt);
            if (c.restY > 0.5) rum(true); else c.chew = 0.5;
            c.hz = c.restY > 0.5 ? -0.12 : -0.04; c.hx = Math.max(-1, Math.min(1, -d / 0.9));
            if (c.watch <= 0 && c.thirst >= 0.35 && cowTroughDist(c) < 35) cowGoDrink(c);
            return;
          }
          switch (c.state) {
            case 'rest': {   // cúi đánh hơi, quét đầu vài giây → quỳ, nằm (cowPose) → nhai lại
              if ((c.lieIn -= dt) > 0) { up(); c.vk = 0; c.hz = -0.15; c.reach = 0.08; c.hx = 0.3 * Math.sin(t * 1.4 + c.ph); break; }
              c.restY = Math.min(1, c.restY + dt * 0.38); c.vk = 0; rum(true); break;
            }
            case 'stand': up(); c.vk = 0; rum(false); break;   // đứng nhai lại, đổi chân
            case 'scratch': {   // GÃI NGỨA vào thân cây: tới điểm chờ Q → xoay song song thân cây → đi dọc vào chỗ vai chạm thân → cọ tới lui (bỏ va chạm tĩnh), nghiêng mình, cổ ngoảnh vào cây
              const R = c.rub; if (!R) { c.state = 'stand'; c.tmr = 3; break; } if (!up()) { c.vk = 0; break; }
              R.k += dt; c.hz = -0.08; c.hx = 0;
              const quit = () => { c.state = 'stand'; c.tmr = 5; c.rub = null; };
              if (R.st === 'go') { if (cowSteer(c, R.Q.x, R.Q.z, dt, null)) { R.st = 'turn'; R.k = 0; } else if (R.k > 60) quit(); }   // tới điểm chờ Q
              else if (R.st === 'turn') {   // xoay song song thân cây
                c.vk = 0; let da = R.ang - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); const na = c.ang + Math.sign(da) * Math.min(Math.abs(da), 1.1 * dt);
                if (colTurnOK(c.col, c.x, c.z, c.ang, na)) c.ang = na; else if (R.k > 6) { quit(); break; }
                if (Math.abs(da) < 0.03) { R.st = 'in'; R.k = 0; }
              }
              else if (R.st === 'in') {   // đi thẳng dọc thân cây (theo tiếp tuyến) vào chỗ vai chạm — va chạm vẫn bật: chạm vỏ cây trước P thì dừng ngay đó mà cọ
                const K = c.col, sp = 0.35 * Math.min(1, R.k / 0.8), ca = Math.cos(R.ang), sa = Math.sin(R.ang), nx = c.x + ca * sp * dt, nz = c.z + sa * sp * dt;
                if ((R.P.x - c.x) * ca + (R.P.z - c.z) * sa <= 0.02 || colFootHits(nx, nz, R.ang, K.a, K.b, K.lo, K.hi, 13) > 0 || colMoverHits(K, nx, nz, R.ang) > 1e-3) { R.st = 'rub'; R.k = 0; R.dur = 12 + Math.random() * 13; R.P.set(c.x, 0, c.z); }
                else if (R.k > 12) quit(); else { c.x = nx; c.z = nz; c.vk = 0.4; }
              }
              else {   // cọ: thân trượt tới lui dọc thân cây ~0,33 lần/s, ép nhẹ vào cây, đầu ngẩng ngoảnh về phía cây
                c.vk = 0; const s = Math.sin(2 * Math.PI * 0.33 * R.k) * 0.15 * Math.min(1, R.k / 1.5) * Math.min(1, (R.dur - R.k) / 1.5);
                c.x = R.P.x + Math.cos(R.ang) * s; c.z = R.P.z + Math.sin(R.ang) * s; c.hz = 0.02 + 0.05 * Math.sin(2 * Math.PI * 0.33 * R.k + 1); c.hx = -0.45 * R.side;
                if (R.k > R.dur) { c.state = 'stand'; c.tmr = 4 + Math.random() * 4; c.rub = null; }
              }
              break;
            }
            case 'graze': {   // ô ăn: đầu quét trái–phải, giật cắn ~0,85 lần/s; nhích 1–2 bước sang búi kế; ~30–50 s ngẩng canh chừng + nhai
              if (!up()) { c.vk = 0; break; }
              c.look = (c.look ?? 30 + Math.random() * 20) - dt;
              if (c.look < 0) { c.hz = -0.12; c.hx = 0.25 * Math.sin(t * 0.8 + c.ph); c.chew = 1; c.vk = 0; if (c.look < -(3 + Math.random() * 2)) c.look = 30 + Math.random() * 20; break; }
              const bp = (t * 0.85 + c.ph) % 1; c.hz = -0.1; c.reach = 0.02; c.bite = bp < 0.25 ? Math.sin(Math.PI * bp / 0.25) : 0; c.hx = 0.22 * Math.sin(t * 0.9 + c.ph); c.chew = bp > 0.3 ? 0.5 : 0;
              if ((c.gstep = (c.gstep ?? 2 + Math.random() * 5) - dt) <= 0) { c.gwalk = 1.4 + Math.random() * 1.6; c.gstep = 5 + Math.random() * 8; c.angT = c.ang + (Math.random() - 0.5) * 0.8; }
              if (c.gwalk > 0) { c.gwalk -= dt; cowWander(c, dt, 0.22); } else c.vk = 0;
              break;
            }
            case 'flee': if (up()) cowWander(c, dt, c.spd * 1.3); else c.vk = 0; c.hz = -0.1; c.hx = 0; break;
            case 'drink': case 'shade': {   // đi tới máng nước (đứng phía đông máng, mặt quay vào) / bóng cây
              // máng dài 1,6 m ⇒ 2 chỗ uống cạnh nhau; hết chỗ thì đứng chờ cách máng ~3 m (trước đây cả bầy nhắm cùng 1 điểm ⇒ chồng lên nhau)
              if (c.state === 'drink' && c.slot == null) { const used = cows.filter(o => o !== c && o.state === 'drink' && o.slot != null).map(o => o.slot); c.slot = [0, 1].find(k => !used.includes(k)) ?? null; }
              const tgt = c.state === 'drink' ? _cwT.set(cowHut.x + cowHut.W / 2 + 0.95 + 1.45 * c.g.scale.y + (c.slot == null ? 2.9 : 0), 0, cowHut.z + 0.75 + (c.slot == null ? 0 : c.slot ? 0.43 : -0.43)) : c.goal;
              if (c.sub2 === 'go') {
                c.hz = -0.18; c.hx = 0;
                const far = c.state === 'drink' && Math.hypot(tgt.x - c.x, tgt.z - c.z) > 7;   // xa máng: theo trường về cửa chuồng (vòng qua sông, vách) rồi mới đi thẳng
                if (up() && cowSteer(c, tgt.x, tgt.z, dt, far ? hutField : null)) { if (c.state === 'drink' && c.slot == null) c.vk = 0; else { c.sub2 = 'do'; c.tmr = c.state === 'drink' ? 60 + Math.random() * 90 : 120 + Math.random() * 120; c.lieIn = 3; } }   // chờ tới lượt
                else if (c.tmr < 999 - 240) { c.state = 'stand'; c.slot = null; c.tmr = 5; c.thirst = Math.min(c.thirst, 0.6); }   // 4 phút chưa tới (kẹt) → thôi, lát nữa khát lại
              }
              else if (c.state === 'drink') {   // uống từng đợt hút 15–25 s, giữa các đợt ngẩng lên nhìn quanh ~2,5 s; cả lần 1–2,5 phút
                c.vk = 0; let da = Math.PI - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); c.ang += da * Math.min(1, dt * 2);
                c.sip = (c.sip ?? 15 + Math.random() * 10) - dt;
                if (c.sip < 0) { c.hz = -0.1; c.hx = 0.3 * Math.sin(t * 0.9 + c.ph); if (c.sip < -2.5) c.sip = 15 + Math.random() * 10; }
                else { c.hz = -0.32 + 0.04 * Math.sin(t * 3.2); c.hx = 0; c.chew = 0.3; c.reachY = cowHut.y + 0.39; }   // mõm ngập ~3 cm, hút từng ngụm
                if (c.tmr <= 0) { c.thirst = 0; c.state = 'stand'; c.slot = null; c.mode = 'leave'; c.leg = 'pasture'; }   // uống xong: theo trường dòng chảy về bãi gặm quen (cowHome)
              } else { if ((c.lieIn -= dt) > 0) { c.vk = 0; c.hz = -0.15; c.reach = 0.08; c.hx = 0.3 * Math.sin(t * 1.4 + c.ph); } else { c.restY = Math.min(1, c.restY + dt * 0.38); c.vk = 0; rum(true); } }
              break;
            }
            default: if (up()) cowWander(c, dt, c.spd); else c.vk = 0; c.hz = -0.18; c.hx = 0;
          }
        }
        function calfFree(c, dt, t) {   // bê ngoài bãi: theo mẹ · bú · nằm cạnh mẹ · chơi · tập gặm
          const M = c.dam, Sd = M.g.scale.y, Sc = c.g.scale.y, ca = Math.cos(M.ang), sa = Math.sin(M.ang), s = c.side;
          const up = () => { c.restY = Math.max(0, c.restY - dt * 0.6); return c.restY <= 0; };
          const at = (f, l) => _cwT.set(M.x + ca * f - sa * l * s, 0, M.z + sa * f + ca * l * s);   // điểm trong hệ mẹ: f tới trước, l sang bên bê
          c.tmr -= dt; c.chew = 0; c.suck = false; c.milk = (c.milk || 0) + dt / 900;
          const mStill = M.mode === 'free' && M.restY < 0.05 && (M.vk || 0) < 0.2 && !['flee', 'drink', 'scratch', 'walk'].includes(M.state), mLie = M.restY > 0.5;
          if (cowThreat(c) || M.state === 'flee') { if (c.state === 'nurse' || c.state === 'lie') c.tmr = 0; c.state = 'follow'; }
          if (c.tmr <= 0 && c.state !== 'nurse') {
            const h = liveWeather.localHour, r = Math.random();
            c.state = c.milk >= 1 && mStill ? 'nurse' : mLie && r < 0.75 ? 'lie' : r < (h > 15 && h < 18.5 ? 0.3 : 0.1) ? 'play' : r < 0.45 ? 'lie' : 'follow';
            c.tmr = { nurse: 120 + Math.random() * 120, lie: 60 + Math.random() * 120, play: 6 + Math.random() * 5, follow: 15 + Math.random() * 25 }[c.state]; c.pa = Math.atan2(c.z - M.z, c.x - M.x);
          }
          if (c.state === 'nurse') {   // tới hông sau của mẹ, đứng song song ngược chiều, đầu ngoảnh vào bầu vú, húc lên từng đợt, đuôi ngoe nguẩy
            if (!mStill) { c.state = 'follow'; c.tmr = 5; return; }
            const P = at(0.1 * Sd, 0.62 * Sd + 0.3 * Sc).clone(), d = Math.hypot(P.x - c.x, P.z - c.z);
            if (c.col) c.col.ghost = Math.max(c.col.ghost || 0, d < 1.5 ? 0.3 : 0);
            if (d > 0.1) { if (up()) { c.spd = 0.6; cowSteer(c, P.x, P.z, dt, null); } c.hz = -0.15; c.hx = 0; return; }
            c.x = P.x; c.z = P.z; c.vk = 0; let da = M.ang + Math.PI - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); c.ang += da * Math.min(1, dt * 3);
            if (Math.abs(da) > 0.25) return;
            c.suck = true; const bump = Math.pow(Math.max(0, Math.sin(t * 2.3 + c.ph)), 6);
            c.hz = 0.02 + 0.16 * bump; c.hx = -0.75 * s; c.chew = 0.6;   // đầu ngoảnh về phía mẹ: bê đứng ngược chiều ⇒ mẹ ở phía +z của bê khi s = 1 (hx > 0 quay đầu về −z)
            if (c.ps) c.ps.swat = Math.min(c.ps.swat, 0.28);   // đuôi ngoe nguẩy liên tục
            if (c.tmr <= 0) { c.milk = 0; c.state = Math.random() < 0.5 ? 'lie' : 'follow'; c.tmr = 40 + Math.random() * 60; }
            return;
          }
          if (c.state === 'lie') {   // nằm sát bên mẹ (mẹ nằm hay đứng gặm gần đó), đầu gục; mẹ đi xa thì dậy theo
            const P = at(-0.2 * Sd, 1.35 * Sd), d = Math.hypot(P.x - c.x, P.z - c.z);
            if (d > 3.5 && c.restY > 0.5) { c.state = 'follow'; c.tmr = 10; return; }
            if (d > 0.3 && c.restY < 0.05) { c.spd = 0.7; cowSteer(c, P.x, P.z, dt, null); c.hz = -0.15; c.hx = 0; return; }
            c.vk = 0; c.restY = Math.min(1, c.restY + dt * 0.45); c.hz = -0.3 + Math.sin(t * 0.6 + c.ph) * 0.04; c.hx = 0.3 * s; return;
          }
          if (!up()) { c.vk = 0; return; }
          if (c.state === 'play') {   // chạy vòng quanh mẹ (nước kiệu), thỉnh thoảng nhảy hất chân sau (cowPose: c.buck)
            const R = 3.2 * Sd; c.pa += 1.9 / R * dt; c.spd = 1.9;
            const gx = M.x + Math.cos(c.pa) * R, gz = M.z + Math.sin(c.pa) * R;
            if (cowOK(gx, gz)) cowSteer(c, gx, gz, dt, null); else c.pa += 0.6;
            if ((c.bk = (c.bk ?? 1) - dt) <= 0) { c.bk = 1.2 + Math.random() * 1.8; c.buck = 0.45; }
            c.hz = -0.05; c.hx = 0.2 * Math.sin(t * 3); return;
          }
          // theo mẹ: giữ chỗ cạnh hông / sau mẹ; xa thì chạy nước kiệu tới; gần mà mẹ gặm thì tập gặm theo
          const P = at(-0.75 * Sd, 1.25 * Sd), d = Math.hypot(P.x - c.x, P.z - c.z);
          if (d > 0.45) { c.spd = d > 4 ? 1.9 : 0.8; cowSteer(c, P.x, P.z, dt, null); c.hz = -0.15; c.hx = 0; return; }
          c.vk = 0;
          if (M.state === 'graze') { const bp = (t * 0.7 + c.ph) % 1; c.hz = -0.1; c.reach = 0.02; c.bite = bp < 0.25 ? Math.sin(Math.PI * bp / 0.25) : 0; c.hx = 0.2 * Math.sin(t * 0.8 + c.ph); c.chew = 0.4; }
          else { c.hz = -0.12; c.hx = 0.35 * Math.sin(t * 0.5 + c.ph); }
        }
        function cowWander(c, dt, sp) {   // đi theo hướng c.angT (quay dần ≤ 1,2 rad/s); vướng (nước, chuồng, mép bãi) thì quay sang hướng khác; né con khác (cách ≥ 1,8 m)
          if (c.angT === undefined) c.angT = c.ang;
          for (const o of cows) { if (o === c) continue; const dx = o.x - c.x, dz = o.z - c.z, d = Math.hypot(dx, dz); if (d < 1.8 && dx * Math.cos(c.ang) + dz * Math.sin(c.ang) > 0) { c.angT = c.ang + (dx * Math.sin(c.ang) - dz * Math.cos(c.ang) > 0 ? 0.6 : -0.6); break; } }
          let da = c.angT - c.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
          const mt = 1.2 * dt, na = c.ang + Math.max(-mt, Math.min(mt, da)), turnOK = !c.col || colTurnOK(c.col, c.x, c.z, c.ang, na);
          if (turnOK) c.ang = na;   // xoay quét thân vào cây bên cạnh: đi tiếp đã
          c.vk = Math.min(1, (c.vk || 0) + dt / 0.9);
          const v = sp * c.vk * (Math.abs(da) > 0.9 ? 0.3 : 1), nx = c.x + Math.cos(c.ang) * v * dt, nz = c.z + Math.sin(c.ang) * v * dt;
          if (cowOK(nx, nz) && (!c.col || c.col.ghost > 0 || colStepOK(c.col, c.x, c.z, nx, nz, c.ang))) { c.x = nx; c.z = nz; if (c.col) c.col.stuck = 0; }
          else if (sp < 0.3 && c.gwalk > 0) c.gwalk = 0;   // nhích gặm cỏ mà vướng (thân cây, bệ tua-bin): thôi nhích, gặm tại chỗ
          else {   // vướng (nước, chuồng, mép bãi, thân cây): quay sang hướng khác — đang quay thì chưa tính là kẹt (quay 130° mất ~2 s ⇒ trước đây thành "kẹt" rồi đi xuyên)
            if (Math.abs(da) < 0.3) c.angT = c.ang + (Math.random() < 0.5 ? 2.3 : -2.3);
            if (c.col && (Math.abs(da) < 0.3 || !turnOK)) colStuck(c.col, dt);
          }
        }
        function cowUnstick(c, dt) {   // thân lỡ lấn vào vật (sau lượt xuyên khi kẹt, mở trang có cây mọc chỗ bò đứng…) ⇒ đẩy dần ra chỗ thoáng (core/collide.js)
          if (!c.col || c.state === 'scratch' || c.suck) return;
          const p = colPushOut(c.col, c.x, c.z, c.ang, dt); if (p && cowOK(p[0], p[1])) { c.x = p[0]; c.z = p[1]; }
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
            c.ps = { y: { x: g.position.y, v: 0 }, p: { x: 0, v: 0 }, hz: { x: c.hz ?? -0.2, v: 0 }, hx: { x: 0, v: 0 }, nk: 0, v: 0, px: c.x, pz: c.z, r0: c.restY, up: false, swat: 2 + Math.random() * 6, side: 1, lieSide: Math.random() < 0.5 ? -1 : 1 };
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
          let bk = 0; if (c.buck > 0) { c.buck = Math.max(0, c.buck - dt); bk = Math.sin(Math.PI * c.buck / 0.45); }   // bê nhảy hất chân sau: mông bật lên, đầu chúc
          U.torso.position.y = h + 0.1 * bk; U.torso.rotation.z = pitch - 0.38 * bk;
          for (let i = 0; i < 4; i++) {   // quỳ / nằm: khớp vai/hông lùi vào gần giữa thân, ngang mặt bụng; góc khớp gập sẵn hoà với IK
            const fr = i < 2, L = c.legs[i], w = fr ? fF : fH, K = rig.fk[i] || (rig.fk[i] = { a: 0, b: 0, p: 0, w: 0 });   // trước: gối ló trước ngực, cẳng gập ra sau · sau: khuỷu ló sau mông, móng thu dưới bụng
            L.hip.position.x = L.x0 + ((fr ? 0.25 : -0.3) - L.x0) * w; L.hip.position.y = COW_PIV * (1 - w);
            K.a = fr ? 1.45 : -1.45; K.b = fr ? -2.9 : 2.9; K.p = 0; K.w = w;
          }
          rig.step(dt, dist, P.v, c.gait, h, pitch - 0.38 * bk, fF + fH > 0.02);
          // khối thân lắc ngang về phía 2 chân cùng bên đang trụ (1 lần/chu kỳ); nằm thì nghiêng về bên gập chân sau
          const lat = Math.sin(2 * Math.PI * (psi + 0.055)) * walkA;
          P.rb = (P.rb || 0) + ((c.rub && c.rub.st === 'rub' ? 0.07 * c.rub.side : 0) - (P.rb || 0)) * Math.min(1, dt * 2);   // gãi ngứa: ép mình vào thân cây
          U.body.position.z = 0.022 * lat; U.body.rotation.x = 0.035 * lat + 0.1 * fH * P.lieSide + P.rb;
          // đầu: dáng đích của hành vi (lò xo) + gật 2 lần/chu kỳ (thấp nhất ngay sau khi mỗi chân trước chạm đất) + bù chúc/ngóc của thân
          cowDamp(P.hz, c.hz ?? -0.2, 5, dt); cowDamp(P.hx, c.hx ?? 0, 5, dt);
          // cổ: có đích mõm thì hạ dần tới khi mõm vừa chạm (c.reach = cao trên mặt đất ngay dưới mõm · c.reachY = cao độ tuyệt đối: mặt nước máng,
          // cỏ khô trong máng) — tự khớp cỡ con, dốc đất; không có đích thì ngóc lên. Quét trái–phải (hx) = xoay cổ quanh khớp N, đầu chỉ nghiêng nhẹ
          const mz = _cwM.set(0.21, -0.15, 0).applyMatrix4(U.muzzle.matrixWorld), tgtY = c.reachY ?? (c.reach != null ? cowY(mz.x, mz.z) + c.reach : null);
          P.nk = tgtY === null ? Math.max(0, P.nk - dt * 1.6) : Math.max(0, Math.min(1, P.nk + Math.max(-1.2, Math.min(1.2, (mz.y - tgtY) * 4)) * dt));
          c.reach = c.reachY = null;
          U.neck.rotation.z = -1.19 * P.nk; U.neck.rotation.y = 0.9 * P.hx.x;
          U.head.rotation.z = P.hz.x - 0.07 * walkA * Math.cos(4 * Math.PI * (psi - 0.28)) - 0.6 * pitch + 1.1 * Math.max(0, fF - fH) + 0.09 * (c.bite || 0); U.head.rotation.x = 0.35 * P.hx.x;   // đang quỳ (trước thấp, sau cao): ngóc đầu giữ thăng bằng
          c.bite = 0;   // giật cắn (dứt cỏ) đi thẳng, không qua lò xo — hành vi đặt lại mỗi khung
          // hàm: nhai = há–ngậm ~1,1 lần/s + nghiến ngang (nhai lại / nhai cỏ) — lò xo biên độ cho khỏi giật khi đổi việc
          P.cw = (P.cw || 0) + ((c.chew || 0) - (P.cw || 0)) * Math.min(1, dt * 3); const ch = 2 * Math.PI * 1.1 * t + c.ph;
          U.jaw.rotation.z = -P.cw * 0.13 * (0.5 - 0.5 * Math.cos(ch)); U.jaw.position.z = P.cw * 0.022 * Math.sin(ch);
          // ruồi: trưa nóng ruồi nhiều ⇒ vẫy đuôi, giật tai dày hơn
          const fly = Math.max(0, Math.min(1, ((liveWeather.state.temperature ?? 24) - 18) / 12)) * Math.max(0, sunElevSin);
          if ((P.ear = (P.ear ?? 3) - dt) <= 0) { P.ear = 2 + Math.random() * (6 - 4 * fly); P.ei = Math.random() < 0.5 ? 0 : 1; P.et = 0; }
          P.et = (P.et ?? 1) + dt; U.ears.forEach((ep, i) => { ep.rotation.x = i === P.ei && P.et < 0.3 ? (i ? 1 : -1) * 0.7 * Math.sin(Math.PI * P.et / 0.3) : 0; });
          // đuôi: chuỗi hạt mềm tự đung theo thân; vài giây phẩy ruồi một lần, đổi bên
          if ((P.swat -= dt) <= 0) {
            P.swat = ((r > 0.5 ? 6 : 2.5) + Math.random() * 6) * (1 - 0.55 * fly); P.side = -P.side;
            const m = 1.3 + Math.random() * 0.9; c.tail.kick = (c.tail.kv || (c.tail.kv = new THREE.Vector3())).set(-Math.sin(c.ang) * P.side * m, 0.35 * m, Math.cos(c.ang) * P.side * m);
          }
          updateSoftTail(c.tail, dt, 0, 0);
        }
