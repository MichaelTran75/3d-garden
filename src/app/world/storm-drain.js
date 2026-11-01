        // ===== HỆ THỐNG THOÁT NƯỚC MƯA (G 31/10 "em do research abour drainage : em add 1 cái miệng ống thoát nước mưa, có mưa thì nước chảy ra, còn trên đường thì em add
        //  1 số gully grate, em tạo hệ thống ống cống kết nối dưới đường nhé, va kết nối với các nhánh của từng căn nhà; khi click vào miệng cống xả thì mặt đất transparent 75%
        //  quanh khu vực đường cống, để thấy đường ống"). Bố trí theo hướng dẫn thoát nước mặt của các cơ quan đường bộ / thoát nước (Anh, Hồng Kông, Mỹ — nguồn cuối ghi chú):
        //  · HỐ THU MẶT ĐƯỜNG (gully): song chắn gang D400 sát mép nhựa (≤ 50 mm tới bó vỉa, thấp hơn mặt đường ~6 mm), khe song ngang chiều xe chạy (an toàn xe đạp);
        //    1 hố đỡ ≤ ~70 m đường ⇒ 10 hố so le 2 bên cách 5–11 m, thêm hố ở ngã ba. Hố thu bê-tông Ø450 sâu ~0,9 m, ống nối D150 nhập cống bằng chạc Y 45° xuôi dòng.
        //  · CỐNG CHÍNH D300 bê-tông dưới tim đường, dốc 1:150 (tự làm sạch ≥ 0,6–0,75 m/s, đầy ≤ 80%), đỉnh ống sâu 1 m dưới mặt đường (≥ 0,9 m dưới đường xe chạy);
        //    giếng thăm (hố ga) ở đầu tuyến, chỗ đổi hướng, chỗ nhập nhánh, ≤ 30 m / giếng; nắp gang tròn chữ "SW" (surface water). Giếng cuối sát bờ là GIẾNG BẬC
        //    (backdrop): ống đứng ngoài thành giếng hạ ~1,5 m ⇒ đoạn ra cửa xả dốc thoải 1:100, khỏi xói. 2 nhánh D225 gom hố thu đoạn đường lên đập + đoạn cuối đường nam.
        //  · NHÁNH NHÀ: 2 ống xối sau mỗi nhà (có sẵn — world/solar-buildings-road.js, chân ống uốn xả sát đất) đổ vào hố thu nhỏ có song chắn; ống uPVC D150 vòng sau +
        //    hông nhà (≥ 1:80) tới hố kiểm tra nhựa PP Ø450 trước nhà (thẳng hàng giếng) rồi ống nối vuông góc vào giếng thăm (văn phòng, xưởng → G2, nhà dịch vụ → G1).
        //    Chuồng bò không nối (phải cắt qua ống nước ngầm của trạm bơm — world/water-pump.js; mái chuồng hợp hứng nước vào bồn).
        //  · CỬA XẢ ra sông (bờ tây hạ lưu đập, dưới trạm biến áp — ô G khoanh): tường đầu bê-tông ÂM vào mặt bờ (không nhô khỏi mái bờ), van lật chống nước sông dội ngược,
        //    đá hộc chân bờ chống xói (lớp dày ≥ 1,5 × cỡ đá lớn nhất, mặt bằng không dốc, xuôi theo dòng); đáy ống cao hơn mặt nước hạ lưu 0,9 m; ống ra vuông góc bờ.
        //  MƯA: lưu lượng = hồ chứa tuyến tính theo cường độ mưa đang hiện (lên ~15 s, rút ~90 s, đất còn ướt thì rỉ) ⇒ tia nước rơi theo quỹ đạo thật (dựng trong shader,
        //  vận tốc ra 0,35–1,8 m/s), van lật mở theo lưu lượng, bọt + sóng tròn chỗ rơi (nature/fluids.js). BẤM CỬA XẢ (ui/hover-select.js): bật / tắt XEM ỐNG — ô đất cách
        //  ống ≤ bán kính ống + 0,15 + 1,25 × độ sâu đỉnh ống (≤ 2,4 m — nhìn xiên vẫn thấy ống) thành đất mờ 25% (trong suốt 75%) phủ trên rãnh đất cắt quanh ống
        //  (cách làm của ống nước trạm bơm), mặt đường trong dải mờ 25%, cỏ trong dải ẩn.
        //  Nguồn: Cheshire West & Chester 7.2 Drainage · HK HyD GN035 · DMRB CD 526 · Highland SD-05-00 · Devon surface water outfalls guidance · Virginia DEQ outlet
        //  protection · TN Erosion Control Handbook · Anglian Water lateral drain guidance · CPHEEO ch.7 · Iowa SUDAS 3C-1 ----
        const DRAIN_BAND = { u: { uDrBand: { value: null }, uDrBox: { value: new THREE.Vector4(0, 0, 1, 1) }, uDrOn: { value: 0 } } };   // dải xem ống: 1 texel / ô (R = trong dải) — cỏ (nature/meadow.js) ẩn, mặt đường mờ
        { const t = new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RedFormat); t.unpackAlignment = 1; t.needsUpdate = true; DRAIN_BAND.u.uDrBand.value = t; }
        const stormDrain = (() => {
          const RD = campusRoad.userData.road, RZ = RD.route[0][1], RX = RD.route[1][0], half = RD.width / 2, BX1 = RD.branch[RD.branch.length - 1].x;
          const gY = (x, z) => surfaceY(Math.round(x2gi(x)), Math.round(z2gj(z)));
          const sY = (x, z) => roadContains(x, z) ? roadSurfaceAt(x, z).y : gY(x, z);   // mặt đường hoặc mặt ô đất
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
          const g = new THREE.Group(); g.name = 'Hệ thống thoát nước mưa (Storm Drain)'; scene.add(g);
          const under = new THREE.Group(); under.name = 'Cống ngầm (hiện khi xem ống)'; under.visible = false; under.userData.noBatch = true; g.add(under);
          const topG = new THREE.Group(); topG.name = 'Nắp hố ga + song chắn hố thu'; g.add(topG);
          // ---- vật liệu · ảnh canvas nắp gang / song chắn ----
          const cvTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
          const coverTex = cvTex(128, 128, (x, w) => {   // nắp gang tròn: gân ô vuông nổi, vành nhẵn, chữ SW, 2 lỗ móc nâng
            x.fillStyle = '#35332f'; x.fillRect(0, 0, w, w);
            for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { x.fillStyle = (i + j) % 2 ? '#4b4842' : '#423f3a'; x.fillRect(i * 8 + 1, j * 8 + 1, 6, 6); }
            x.strokeStyle = '#5c584f'; x.lineWidth = 9; x.beginPath(); x.arc(64, 64, 59, 0, TAU); x.stroke();
            x.fillStyle = '#3a3833'; x.beginPath(); x.arc(64, 64, 21, 0, TAU); x.fill();
            x.fillStyle = '#6d685d'; x.font = 'bold 22px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SW', 64, 65);
            x.fillStyle = '#17160f'; for (const a of [0.5, 0.5 + Math.PI]) x.fillRect(64 + Math.cos(a) * 42 - 6, 64 + Math.sin(a) * 42 - 2, 12, 4);
          });
          const grateTex = cvTex(128, 96, (x, w, h) => {   // song chắn hố thu D400: khung + 9 khe ngang chiều xe chạy + gân giữa
            x.fillStyle = '#3c3934'; x.fillRect(0, 0, w, h); x.fillStyle = '#4d4a43'; x.fillRect(5, 5, w - 10, h - 10);
            x.fillStyle = '#0c0c0b'; for (let i = 0; i < 9; i++) x.fillRect(11 + i * 12.2, 12, 6.5, h - 24);
            x.fillStyle = '#58544b'; x.fillRect(5, h / 2 - 2, w - 10, 4);
          });
          const inletTex = cvTex(64, 64, (x, w) => { x.fillStyle = '#2a2b2c'; x.fillRect(0, 0, w, w); x.fillStyle = '#0a0a0a'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) x.fillRect(5 + i * 9.2, 5 + j * 9.2, 6, 6); });
          const M = {
            conc: new THREE.MeshLambertMaterial({ color: 0x9b978f }),   // bê-tông đúc sẵn: thân giếng, hố thu, tường đầu
            pipe: new THREE.MeshLambertMaterial({ color: 0x8e8b84 }),   // ống cống bê-tông D300
            pvc: new THREE.MeshLambertMaterial({ color: 0xb4592c }),    // ống uPVC thoát nước ngầm màu đất nung (EN 1401)
            pp: new THREE.MeshLambertMaterial({ color: 0x2c2d2f }),     // hố kiểm tra / hố thu ống xối nhựa PP
            cover: new THREE.MeshLambertMaterial({ map: coverTex }), grate: new THREE.MeshLambertMaterial({ map: grateTex }), inlet: new THREE.MeshLambertMaterial({ map: inletTex }),
            iron: new THREE.MeshLambertMaterial({ color: 0x34322e }), pipeIn: new THREE.MeshLambertMaterial({ color: 0x5f5c56, side: THREE.BackSide }),
            hole: new THREE.MeshBasicMaterial({ color: 0x0b0b0a }), flap: new THREE.MeshLambertMaterial({ color: 0x3b3f42 }), stone: new THREE.MeshLambertMaterial({ color: 0x8d867b, flatShading: true })
          };
          // ---- dựng hình ----
          const _Y = V3(0, 1, 0), _d = new THREE.Vector3();
          const put = (geo, mat, par, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
          function tube(a, b, r, mat, par = under, seg = 12) {   // trụ tròn hở 2 đầu, tâm a → b
            _d.subVectors(b, a); const L = _d.length(); if (L < 0.005) return null;
            const m = put(new THREE.CylinderGeometry(r, r, L, seg, 1, true), mat, par, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); m.quaternion.setFromUnitVectors(_Y, _d.multiplyScalar(1 / L)); return m;
          }
          const ball = (p, r, mat) => put(new THREE.SphereGeometry(r, 12, 8), mat, under, p.x, p.y, p.z);   // cút / khớp nối chỗ gấp
          const drum = (x, z, y0, y1, r, mat, par = under, seg = 22) => put(new THREE.CylinderGeometry(r, r, y1 - y0, seg), mat, par, x, (y0 + y1) / 2, z);   // trụ đứng kín
          const SEG = [], STR = [], COVERS = [];   // nắp / song chắn trên mặt [x, z, bán kính] — cỏ không mọc xuyên (nature/meadow.js) · tuyến (cho dải xem ống): [ax, az, bx, bz, nửa bề rộng dải, đáy ngoài ống tại a, tại b] · công trình ngầm: [x, z, bán kính, đáy]
          const PIPE = { 300: [0.2, 'pipe'], 225: [0.125, 'pvc'], 150: [0.085, 'pvc'] };   // bán kính ngoài · vật liệu
          const bandW = (hw, ro, ...P) => Math.min(2.4, Math.max(hw, ro + 0.15 + 1.25 * Math.max(...P.map(p => sY(p.x, p.z) - p.y - ro))));   // nhìn xiên φ: tia tới đỉnh ống sâu d cắt mặt đất lệch d·tanφ ⇒ dải ≥ d·1,25 (φ ≤ 51°)
          function run(pts, dn, hw) {   // pts = điểm ĐÁY TRONG (invert) liên tiếp ⇒ tâm ống = đáy + DN/2; cút cầu ở điểm gấp; ống bê-tông: đai mối nối mỗi 2,44 m
            const [ro, mk] = PIPE[dn], mat = M[mk], C = pts.map(p => V3(p.x, p.y + dn / 2000, p.z));
            for (let k = 1; k < C.length; k++) {
              const a = C[k - 1], b = C[k], L = a.distanceTo(b); tube(a, b, ro, mat, under, dn >= 225 ? 16 : 10); SEG.push([a.x, a.z, b.x, b.z, bandW(hw, ro, a, b), a.y - ro, b.y - ro]);
              if (dn === 300) for (let s = 1.22; s < L - 0.3; s += 2.44) tube(a.clone().lerp(b, (s - 0.06) / L), a.clone().lerp(b, (s + 0.06) / L), ro + 0.028, mat, under, 16);
            }
            for (let k = 1; k < C.length - 1; k++) ball(C[k], ro * 1.05, mat);
            return C;
          }
          const RC = 0.6;   // giếng thăm Ø1050 (thành 75 mm)
          // NẮP TRÊN MẶT chỉ giữ 8 / 27 (G 31/10 tối "giảm 70% số lượng nắp cống"): giếng thăm G1 · G3 · G4 · G6, 2 song chắn, 1 hố kiểm tra, 1 hố thu ống xối.
          //  Phần ngầm (thân hố, ống) giữ nguyên; chỗ bỏ nắp thì cỏ mọc lại (không vào COVERS)
          const KEEP = { mh: [0, 2, 3, 5], gully: [0, 5], insp: [0], inlet: [0] }, nTop = { mh: 0, gully: 0, insp: 0, inlet: 0 }, keepTop = k => KEEP[k].includes(nTop[k]++);
          function manhole(x, z, base, s, r = RC) {   // thân bê-tông + tấm nắp giảm cỡ + cổ giếng + khung & nắp gang trên mặt
            drum(x, z, base - 0.15, s - 0.45, r, M.conc); drum(x, z, s - 0.45, s - 0.3, r + 0.05, M.conc); drum(x, z, s - 0.3, s - 0.045, 0.37, M.conc, under, 18);
            STR.push([x, z, r + 0.15, base - 0.15]); if (!keepTop('mh')) return;
            put(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 28), M.iron, topG, x, s - 0.018, z);
            put(new THREE.CircleGeometry(0.335, 28), M.cover, topG, x, s + 0.0085, z).rotation.x = -Math.PI / 2; COVERS.push([x, z, 0.4]);
          }
          function gully(x, z, s, along) {   // song chắn 0,52 × 0,42 (cạnh dài dọc mép đường) + hố thu Ø450 sâu ~1 m
            drum(x, z, s - 1.0, s - 0.06, 0.26, M.conc, under, 16); STR.push([x, z, 0.4, s - 1.05]); if (!keepTop('gully')) return;
            const gr = put(new THREE.BoxGeometry(0.52, 0.03, 0.42), M.grate, topG, x, s - 0.008, z); if (along === 'z') gr.rotation.y = Math.PI / 2; COVERS.push([x, z, 0.34]);
          }
          function inspection(x, z, inv, s) { drum(x, z, inv - 0.1, s - 0.04, 0.24, M.pp, under, 18); STR.push([x, z, 0.4, inv - 0.12]); if (keepTop('insp')) { put(new THREE.CylinderGeometry(0.27, 0.27, 0.035, 22), M.pp, topG, x, s + 0.004, z); COVERS.push([x, z, 0.27]); } }
          function inlet(x, z, s) { drum(x, z, s - 0.62, s - 0.02, 0.15, M.pp, under, 14); STR.push([x, z, 0.32, s - 0.64]); if (keepTop('inlet')) { put(new THREE.BoxGeometry(0.32, 0.03, 0.32), M.inlet, topG, x, s + 0.003, z); COVERS.push([x, z, 0.23]); } }
          function onLine(L, x, z) {   // điểm gần nhất trên tuyến L (mảng {x, z, y = đáy}) → { x, z, y, d }
            let best = null;
            for (let k = 1; k < L.length; k++) { const a = L[k - 1], b = L[k], dx = b.x - a.x, dz = b.z - a.z, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
              const px = a.x + dx * u, pz = a.z + dz * u, d = Math.hypot(x - px, z - pz); if (!best || d < best.d) best = { x: px, z: pz, y: a.y + (b.y - a.y) * u, d }; }
            return best;
          }
          // ---- CỐNG CHÍNH D300: G1 đầu tuyến → G2 → G3 góc đường (ngã ba) → G4 đổi hướng ra sông → G5 → G6 giếng bậc → cửa xả ----
          const G150 = 1 / 150, zE = Z0 + 82.8;   // tuyến ra sông song song mép nam sân trạm biến áp (z ≤ 81,1)
          let faceX; { const j = Math.round(z2gj(zE)); let i = Math.round(x2gi(X0 + 74)); while (i < GX - 1 && !isWater(i, j)) i++; faceX = wx(i) - BLOCK / 2; }   // mặt bờ dựng đứng
          const MH = [[X0 + 21.4, RZ], [X0 + 36.9, RZ], [RX, RZ], [RX, zE], [X0 + 65.4, zE], [faceX - 2.9, zE]].map(([x, z]) => ({ x, z, s: sY(x, z) }));
          MH[0].in = MH[0].inv = MH[0].s - 1.34;   // đỉnh ống (ngoài 0,4 m) sâu 1 m dưới mặt đường
          for (let k = 1; k < MH.length; k++) { const a = MH[k - 1], b = MH[k]; b.in = a.inv - Math.hypot(b.x - a.x, b.z - a.z) * G150; b.inv = b.in - 0.02; }   // 2 cm rơi qua lòng máng mỗi giếng
          const OUT = { x: faceX, z: zE, inv: lakeY + 0.9 }, MH6 = MH[5]; MH6.inv = OUT.inv + (OUT.x - MH6.x) / 100;   // giếng bậc: đáy ra hạ ~1,5 m
          const RC6 = RC + 0.08;   // giếng bậc sâu Ø1200
          for (let k = 1; k < MH.length; k++) {
            const a = MH[k - 1], b = MH[k], L = Math.hypot(b.x - a.x, b.z - a.z), ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, rb = k === 5 ? RC6 : RC;
            run([V3(a.x + ux * RC, a.inv - RC * G150, a.z + uz * RC), V3(b.x - ux * rb, b.in + rb * G150, b.z - uz * rb)], 300, 0.95);
          }
          MH.forEach((m, k) => manhole(m.x, m.z, Math.min(m.in, m.inv), m.s, k === 5 ? RC6 : RC));
          { const a = MH[4], b = MH6, L = Math.hypot(b.x - a.x, b.z - a.z), ux = (b.x - a.x) / L, uz = (b.z - a.z) / L, o = RC6 + 0.32, x = b.x - ux * o, z = b.z - uz * o;   // ống đứng giếng bậc ngoài thành giếng
            const yT = b.in + o * G150 + 0.15, yB = b.inv + 0.15;
            tube(V3(x, yT, z), V3(x, yB, z), 0.2, M.pipe, under, 16); ball(V3(x, yT, z), 0.21, M.pipe); ball(V3(x, yB, z), 0.21, M.pipe);
            tube(V3(x, yB, z), V3(b.x - ux * RC6, yB, b.z - uz * RC6), 0.2, M.pipe, under, 16); SEG.push([x, z, b.x, b.z, bandW(0.95, 0.2, V3(x, yB, z)), yB - 0.2, yB - 0.2]);
            run([V3(b.x + RC6, b.inv - RC6 / 100, b.z), V3(OUT.x - 0.36, OUT.inv + 0.36 / 100, OUT.z)], 300, 0.95);   // đoạn ra cửa xả 1:100
            SEG.push([OUT.x - 0.4, OUT.z, OUT.x - 0.05, OUT.z, 0.95, OUT.inv - 0.05, OUT.inv - 0.05]); STR.push([OUT.x - 0.2, OUT.z, 0.9, OUT.inv - 0.47]); }
          const LINES = { T: MH.map((m, k) => ({ x: m.x, z: m.z, y: k === 5 ? m.in : m.inv })) };
          // ---- 2 NHÁNH D225 (1:100): đường lên đập → G3 · đoạn cuối đường nam → G4 ----
          for (const [key, hx, hz, m] of [['B', BX1 - 1.8, RZ, MH[2]], ['S', RX, Z0 + 90.4, MH[3]]]) {
            const s = sY(hx, hz), L = Math.hypot(m.x - hx, m.z - hz), ux = (m.x - hx) / L, uz = (m.z - hz) / L, yIn = m.inv + 0.12, inv = yIn + (L - RC * 2) / 100;
            manhole(hx, hz, inv, s); run([V3(hx + ux * RC, inv, hz + uz * RC), V3(m.x - ux * RC, yIn, m.z - uz * RC)], 225, 0.75);
            LINES[key] = [{ x: hx, z: hz, y: inv }, { x: m.x, z: m.z, y: yIn }];
          }
          // ---- HỐ THU MẶT ĐƯỜNG: song chắn sát mép nhựa (tâm cách tim đường half − 0,26 ⇒ mép song chắn cách mép nhựa 5 cm), ống nối D150 chạc Y 45° xuôi dòng ----
          const e = half - 0.26, gullies = [];
          for (const [x, z, line, along, dir] of [
            [X0 + 26.0, RZ - e, 'T', 'x', 1], [X0 + 31.6, RZ + e, 'T', 'x', 1], [X0 + 42.2, RZ - e, 'T', 'x', 1], [X0 + 47.8, RZ + e, 'T', 'x', 1],   // đoạn đông–tây: so le 2 bên
            [RX - e, Z0 + 73.8, 'T', 'z', 1], [RX + e, Z0 + 79.2, 'T', 'z', 1],   // đoạn bắc–nam trước giếng đổi hướng
            [X0 + 56.4, RZ - e, 'B', 'x', -1], [X0 + 61.6, RZ + e, 'B', 'x', -1],   // đường lên đập (cặp ở ngã ba)
            [RX - e, Z0 + 86.4, 'S', 'z', -1], [RX + e, Z0 + 91.6, 'S', 'z', -1]]) {   // đoạn cuối đường nam
            const s = sY(x, z); gully(x, z, s, along); gullies.push([x, z]);
            const tx = along === 'x' ? x + dir * Math.abs(z - RZ) : RX, tz = along === 'x' ? RZ : z + dir * Math.abs(x - RX);
            const p = onLine(LINES[line], tx, tz), rdn = line === 'T' ? 0.3 : 0.225, ux = p.x - x, uz = p.z - z, l = Math.hypot(ux, uz) || 1, ro = line === 'T' ? 0.2 : 0.125;
            run([V3(x + ux / l * 0.24, s - 0.72, z + uz / l * 0.24), V3(p.x - ux / l * ro, Math.min(s - 0.8, p.y + rdn / 2 - 0.075), p.z - uz / l * ro)], 150, 0.6);
          }
          // ---- NHÁNH NHÀ: hố thu dưới 2 ống xối sau nhà → ống D150 vòng sau + hông nhà → hố kiểm tra trước nhà, thẳng hàng giếng thăm → ống nối vuông góc vào giếng ----
          //  Mọi đoạn song song tường nhà / tim đường, không ống chéo (G 31/10 "organise đường ống nước"): tuyến hông lệch giếng < 0,6 m thì dời cả tuyến cho thẳng hàng,
          //  xa hơn thì rẽ vuông dọc mặt trước nhà tới hố kiểm tra. Xưởng vòng hông tây vào G2 (hông đông vướng song chắn x 47,8)
          for (const [name, side, to] of [['Nhà điều hành hai tầng', 1, 1], ['Xưởng bảo trì', 1, 1], ['Nhà thiết bị & dịch vụ', 1, 0]]) {
            const o = scene.getObjectByName(name), A = o && o.userData.architecture; if (!A) continue;
            o.updateMatrixWorld(true); const w = A.width, d = A.depth, W = (lx, lz) => o.localToWorld(V3(lx, 0, lz)), rz = -d / 2 - 0.62;   // hệ nhà: −z = phía sau (ống xối)
            const pts = [W(-side * w * 0.39, rz), W(side * w * 0.39, rz), W(side * (w / 2 + 0.7), rz), W(side * (w / 2 + 0.7), d / 2 + 0.9)], m = MH[to];   // giếng trên đoạn đông–tây ⇒ ống nối chạy theo z
            if (Math.abs(m.x - pts[3].x) < 0.6) pts[2].x = pts[3].x = m.x; else { pts[2].x = pts[3].x; pts.push(V3(m.x, pts[3].y, pts[3].z)); }
            for (const p of pts.slice(0, 2)) inlet(p.x, p.z, gY(p.x, p.z));
            let inv = gY(pts[0].x, pts[0].z) - 0.5; const ip = [pts[0].clone().setY(inv)];
            for (let k = 1; k < pts.length; k++) { inv = Math.min(inv - pts[k].distanceTo(pts[k - 1]) / 80, gY(pts[k].x, pts[k].z) - 0.55); ip.push(pts[k].clone().setY(inv)); }
            run(ip, 150, 0.6);
            const c = pts[pts.length - 1]; inspection(c.x, c.z, inv - 0.02, gY(c.x, c.z));
            run([c.clone().setY(inv - 0.02), V3(m.x, m.inv + 0.25, m.z - Math.sign(m.z - c.z) * RC)], 150, 0.6);
          }
          bakeStatic(under); bakeStatic(topG); for (const G of [under, topG]) G.traverse(o => { o.userData.noCollide = true; o.userData.noFlight = true; });
          // ---- CỬA XẢ: tường đầu âm vào bờ + gờ đỉnh, miệng ống bê-tông nhô 14 cm, van lật trên bản lề đỉnh miệng ống ----
          const outG = new THREE.Group(); outG.name = 'Cửa xả thoát nước mưa (Stormwater Outfall)'; g.add(outG);
          const yP = OUT.inv + 0.15;   // tâm ống ra
          put(new THREE.BoxGeometry(0.4, 1.5, 1.7), M.conc, outG, faceX - 0.17, OUT.inv + 0.3, zE);   // tường đầu: mặt trước nhô 3 cm khỏi mặt bờ (khỏi chớp mặt), lưng âm 0,37 m vào bờ
          put(new THREE.BoxGeometry(0.48, 0.09, 1.84), M.conc, outG, faceX - 0.15, OUT.inv + 1.095, zE);   // gờ đỉnh
          tube(V3(faceX - 0.37, yP, zE), V3(faceX + 0.14, yP, zE), 0.2, M.pipe, outG, 28);
          tube(V3(faceX - 0.3, yP, zE), V3(faceX + 0.14, yP, zE), 0.15, M.pipeIn, outG, 28);
          { const ring = put(new THREE.RingGeometry(0.15, 0.2, 28), M.pipe, outG, faceX + 0.14, yP, zE); ring.rotation.y = Math.PI / 2;
            const hole = put(new THREE.CircleGeometry(0.15, 28), M.hole, outG, faceX - 0.28, yP, zE); hole.rotation.y = Math.PI / 2; hole.castShadow = false; }
          put(new THREE.BoxGeometry(0.07, 0.06, 0.26), M.flap, outG, faceX + 0.11, yP + 0.225, zE);   // gối bản lề
          put(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 8), M.iron, outG, faceX + 0.165, yP + 0.225, zE).rotation.x = Math.PI / 2;   // trục bản lề
          const flapP = new THREE.Group(); flapP.position.set(faceX + 0.165, yP + 0.225, zE); flapP.userData.noBake = true; outG.add(flapP);
          put(new THREE.CylinderGeometry(0.228, 0.228, 0.028, 30), M.flap, flapP, 0.014, -0.225, 0).rotation.z = Math.PI / 2;   // nắp van tròn treo dưới bản lề
          bakeStatic(outG); outG.traverse(o => { o.userData.noFlight = true; });
          // đá hộc chân bờ: 18 viên quanh chỗ nước rơi, lệch về hạ lưu (+z)
          const rip = new THREE.Group(); rip.name = 'Đá hộc chân cửa xả (Riprap)'; g.add(rip);
          { const geo = new THREE.IcosahedronGeometry(1, 1), P = geo.attributes.position;
            for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), h = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453) % 1, k = 0.8 + 0.32 * h; P.setXYZ(i, x * k, y * k * 0.7, z * k); }
            geo.computeVertexNormals(); const r = mulberry32(4417), top = [];
            for (let n = 0; n < 18; n++) { const s = 0.12 + 0.2 * r(), m = put(geo, M.stone, rip, faceX + 0.06 + 0.85 * r() ** 1.3, lakeY - 0.08 + 0.22 * r(), zE - 0.9 + 2.5 * r() ** 0.8); m.scale.set(s * (0.8 + 0.4 * r()), s, s * (0.8 + 0.4 * r())); m.rotation.set(r() * 0.5, r() * TAU, r() * 0.5); top.push(m); }
            // G 31/10 tối "cho thêm đá dưới lòng sông với size lớn hơn để đỡ những đá nằm trên mặt nước": lớp mặt nằm ngang mặt nước mà đáy sông sát bờ sâu 0,6–1,2 m ⇒
            //  trước đây đá như nổi lơ lửng. ĐỆM ĐÁ HỘC từ đáy lên (đúng đệm tiêu năng chân cửa xả: đá xếp kín từ đáy, đá to nhất ở chân ngoài): rải điểm cách nhau ≥ 0,42 m
            //  trong nửa elip 1,9 × 1,8 m trước tường đầu (lệch về hạ lưu); mỗi điểm chồng đá từ đáy (lún 10% vào bùn) tới mặt đệm T = đáy viên lớp mặt gần nhất trừ
            //  dốc 0,55 theo khoảng cách (ra xa thấp dần về đáy), tối thiểu 1 tầng; sát vách (< 0,6 m) chồng tới ngang mặt nước nên vài tảng to nhô lên đỡ lớp mặt; đá to hơn lớp mặt (bán kính 0,2–0,5, ra chân ngoài to thêm 20%), màu ngâm nước thẫm + tảo
            const bedStone = new THREE.MeshLambertMaterial({ color: 0x6d6a5c, flatShading: true }), bedAt = (x, z) => riverBedY(Math.round(x2gi(x)), Math.round(z2gj(z)));
            const sup = top.map(m => ({ x: m.position.x, z: m.position.z, yb: m.position.y - 0.78 * m.scale.y, rr: 0.8 * Math.max(m.scale.x, m.scale.z) })), pts = [];
            for (let k = 0; k < 900 && pts.length < 40; k++) {
              const dx = 0.12 + 1.78 * r(), dz = -1.3 + 3.6 * r(); if ((dx / 1.9) ** 2 + ((dz - 0.5) / 1.8) ** 2 > 1 || pts.some(p => Math.hypot(p[0] - dx, p[1] - dz) < 0.42)) continue; pts.push([dx, dz]); }
            for (const [dx, dz] of pts) {
              const x = faceX + dx, z = zE + dz, b = bedAt(x, z), out = Math.min(1, Math.hypot(dx / 1.9, (dz - 0.5) / 1.8));
              let T = b + 0.3; for (const u of sup) T = Math.max(T, u.yb - 0.55 * Math.max(0, Math.hypot(x - u.x, z - u.z) - u.rr)); T = dx < 0.6 ? Math.min(Math.max(T, lakeY - 0.02), lakeY + 0.08) : Math.min(T, lakeY - 0.1);   // sát vách: đá to nhô ngang mặt nước
              for (let y = b, lay = 0; y < T - 0.06 && lay < 3; lay++) {
                const rr = Math.min(0.5, Math.max(0.2, (T - y) * 0.62)) * (1 + 0.2 * out) * (0.9 + 0.2 * r()), cy = y + 0.72 * rr * (lay ? 0.75 : 0.9);
                const m = put(geo, bedStone, rip, Math.max(faceX + 0.75 * rr, x + (r() - 0.5) * 0.16), cy, z + (r() - 0.5) * 0.16); m.scale.set(rr * (0.85 + 0.3 * r()), rr, rr * (0.85 + 0.3 * r())); m.rotation.set(r() * 0.4, r() * TAU, r() * 0.4);
                y = cy + 0.72 * rr * 0.8;
              }
            }
            bakeStatic(rip); rip.traverse(o => { o.userData.noCollide = o.userData.noFlight = true; }); }
          // ---- DÒNG NƯỚC XẢ: ống dẹt rơi theo quỹ đạo ném ngang (dựng trong shader) + bọt nổi chỗ rơi ----
          const NOISE = 'float dh(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float dn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(dh(i), dh(i + vec2(1.0, 0.0)), f.x), mix(dh(i + vec2(0.0, 1.0)), dh(i + 1.0), f.x), f.y); }';
          const jetU = { uO: { value: V3(faceX + 0.16, yP - 0.1, zE) }, uD: { value: V3(1, 0, 0) }, uV: { value: 1 }, uT: { value: 0.45 }, uW: { value: 0.2 }, uTh: { value: 0.06 }, uK: { value: 0 }, uTime: { value: 0 }, uL: { value: 1 } };
          const jet = (() => {
            const NS = 28, NA = 12, P = [], A = [], I = [];
            for (let s = 0; s <= NS; s++) for (let a = 0; a <= NA; a++) { P.push(0, 0, 0); A.push(a / NA, s / NS); }
            for (let s = 0; s < NS; s++) for (let a = 0; a < NA; a++) { const p = s * (NA + 1) + a, q = p + NA + 1; I.push(p, q, p + 1, p + 1, q, q + 1); }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('aJ', new THREE.Float32BufferAttribute(A, 2)); geo.setIndex(I);
            const mat = new THREE.ShaderMaterial({ uniforms: jetU, transparent: true, depthWrite: false, side: THREE.DoubleSide,
              vertexShader: `uniform vec3 uO, uD; uniform float uV, uT, uW, uTh; attribute vec2 aJ; varying vec2 vJ;
                void main() {
                  float t = aJ.y * uT, a = aJ.x * 6.28318;
                  vec3 vel = normalize(uD * uV + vec3(0.0, -9.8 * t, 0.0)), sd = normalize(cross(vec3(0.0, 1.0, 0.0), uD)), nr = normalize(cross(vel, sd));
                  float w = uW * (1.0 + 0.9 * aJ.y), th = uTh * (1.0 + 0.7 * aJ.y);   // tia loe dần khi rơi
                  vec3 p = uO + uD * (uV * t) + vec3(0.0, -4.9 * t * t, 0.0) + sd * (cos(a) * 0.5 * w) + nr * (sin(a) * 0.5 * th);
                  vJ = aJ; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
                }`,
              fragmentShader: `uniform float uK, uTime, uL; varying vec2 vJ; ${NOISE}
                void main() {
                  float st = dn(vec2(vJ.x * 9.0, vJ.y * 7.0 - uTime * 5.5)) * 0.6 + dn(vec2(vJ.x * 23.0, vJ.y * 16.0 - uTime * 9.0)) * 0.4;   // vệt nước trôi dọc tia
                  float a = uK * smoothstep(0.0, 0.06, vJ.y) * (1.0 - smoothstep(0.88, 1.0, vJ.y)) * (0.4 + 0.5 * st);
                  gl_FragColor = vec4(mix(vec3(0.5, 0.6, 0.64), vec3(0.93, 0.96, 0.98), smoothstep(0.35, 0.85, st)) * uL, a);
                  #include <tonemapping_fragment>
                  #include <colorspace_fragment>
                }` });
            const m = new THREE.Mesh(geo, mat); m.name = 'Dòng nước xả (tia nước)'; m.frustumCulled = false; m.renderOrder = 3; m.visible = false; m.raycast = () => {}; g.add(m); return m;
          })();
          const foamU = { uK: { value: 0 }, uTime: { value: 0 }, uL: { value: 1 } };
          const foam = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ uniforms: foamU, transparent: true, depthWrite: false,
            vertexShader: 'varying vec2 vU; void main() { vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: `uniform float uK, uTime, uL; varying vec2 vU; ${NOISE}
              void main() { vec2 p = vU - 0.5; float r = length(p) * 2.0, n = dn(p * 9.0 + vec2(uTime * 0.7, -uTime * 0.4)) * 0.6 + dn(p * 21.0 - uTime * 1.3) * 0.4;
                float a = uK * smoothstep(1.0, 0.2, r) * smoothstep(0.35, 0.75, n + 0.4 * (1.0 - r));
                gl_FragColor = vec4(vec3(0.92, 0.95, 0.97) * uL, a * 0.85);
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
              }` }));
          foam.name = 'Bọt nước chỗ cửa xả đổ xuống'; foam.rotation.x = -Math.PI / 2; foam.renderOrder = 3; foam.visible = false; foam.raycast = () => {}; g.add(foam);
          for (const o of [jet, foam]) o.userData.noCollide = o.userData.noRainOcc = o.userData.noBatch = o.userData.noFlight = true;
          // ---- XEM ỐNG: dải ô đất mờ 25% + rãnh cắt (dựng 1 lần ở lần bấm đầu), mặt đường mờ trong dải, cỏ trong dải ẩn ----
          const R = { on: false, built: false, saved: [], ims: new Set(), see: null, wall: null, swap: [], cells: 0 };
          const Z16 = Float32Array.from(new THREE.Matrix4().makeScale(0, 0, 0).elements);
          function bandPatch(sh) {   // mặt đường: alpha × 0,25 trong dải (thế giới xz → texel ô)
            Object.assign(sh.uniforms, DRAIN_BAND.u);
            sh.vertexShader = 'varying vec3 vDrW;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n vDrW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
            sh.fragmentShader = 'uniform sampler2D uDrBand; uniform vec4 uDrBox; uniform float uDrOn; varying vec3 vDrW;\n' + sh.fragmentShader.replace('#include <opaque_fragment>',
              'diffuseColor.a *= 1.0 - 0.75 * uDrOn * texture2D(uDrBand, (vDrW.xz - uDrBox.xy) * uDrBox.zw).r;\n #include <opaque_fragment>');
          }
          function bandBuild() {
            R.built = true;
            const keys = new Map(), inMap = (i, j) => i >= 0 && j >= 0 && i < GX && j < GZ;
            const segD = (x, z, s) => { const dx = s[2] - s[0], dz = s[3] - s[1], l2 = dx * dx + dz * dz, u = l2 ? Math.max(0, Math.min(1, ((x - s[0]) * dx + (z - s[1]) * dz) / l2)) : 0; segD.u = u; return Math.hypot(x - s[0] - dx * u, z - s[1] - dz * u); };
            const keep = [], _b = new THREE.Box3(), _v = new THREE.Vector3();   // chừa: sân trạm biến áp, đập (nền thật, cột hàng rào), nền 3 nhà (tường đứng trên đất)
            for (const n of ['Trạm biến áp (Substation)', 'Trạm thủy điện (Hydro Dam)']) { const o = scene.getObjectByName(n); if (o) { _b.setFromObject(o).expandByScalar(0.25); keep.push(((a, b) => (x, z) => x > a.x && x < b.x && z > a.z && z < b.z)(_b.min.clone(), _b.max.clone())); } }
            for (const n of ['Nhà điều hành hai tầng', 'Xưởng bảo trì', 'Nhà thiết bị & dịch vụ']) { const o = scene.getObjectByName(n), A = o && o.userData.architecture; if (!A) continue; const inv = o.matrixWorld.clone().invert();
              keep.push((x, z) => { _v.set(x, 0, z).applyMatrix4(inv); return Math.abs(_v.x) < A.width / 2 + 0.1 && Math.abs(_v.z) < A.depth / 2 + 0.1; }); }
            const cell = (i, j) => { const k = i + j * GX; if (!keys.has(k) && !keep.some(f => f(wx(i), wz(j)))) keys.set(k, { i, j, s: surfaceY(i, j), fl: Infinity }); };
            for (const s of SEG) for (let i = Math.floor(x2gi(Math.min(s[0], s[2]) - s[4])); i <= Math.ceil(x2gi(Math.max(s[0], s[2]) + s[4])); i++)
              for (let j = Math.floor(z2gj(Math.min(s[1], s[3]) - s[4])); j <= Math.ceil(z2gj(Math.max(s[1], s[3]) + s[4])); j++) if (inMap(i, j) && !isWater(i, j) && segD(wx(i), wz(j), s) <= s[4]) cell(i, j);
            for (const [x, z, r] of STR) for (let i = Math.floor(x2gi(x - r)); i <= Math.ceil(x2gi(x + r)); i++) for (let j = Math.floor(z2gj(z - r)); j <= Math.ceil(z2gj(z + r)); j++)
              if (inMap(i, j) && !isWater(i, j) && Math.hypot(wx(i) - x, wz(j) - z) <= r) cell(i, j);
            for (const c of keys.values()) {   // đáy rãnh: 12 cm dưới đáy ống / công trình gần nhất — phẳng ngang cả bề rộng dải
              const x = wx(c.i), z = wz(c.j);
              for (const s of SEG) if (segD(x, z, s) <= s[4] + 0.35) c.fl = Math.min(c.fl, s[5] + (s[6] - s[5]) * segD.u - 0.12);
              for (const [sx, sz, r, b] of STR) if (Math.hypot(x - sx, z - sz) <= r + 0.35) c.fl = Math.min(c.fl, b - 0.1);
              c.fl = Math.max(0.3, Math.min(isFinite(c.fl) ? c.fl : c.s - 0.5, c.s - 0.3));
            }
            // bản đặc: mọi mặt khối đỉnh (cỏ / bờ) + thân cột đất của ô trong dải → thu về 0 khi xem (giữ ma trận gốc để trả lại); màu ô cho bản mờ
            const tops = terrainMeshes.filter(im => im.isInstancedMesh && im.instanceColor && (im.material === grassMat || im.material === shoreMat));
            const bods = scene.children.filter(o => o.isInstancedMesh && o.material === dirtMat);
            const fm = ['stem', 'petal', 'fcen', 'fcube', 'blade'].map(k => vegPools[k].mat), flw = scene.children.filter(o => o.isInstancedMesh && fm.includes(o.material));   // hoa, búi cỏ rải tay trong dải — ẩn theo (khỏi lơ lửng)
            for (const im of [...tops, ...bods, ...flw]) { const Ar = im.instanceMatrix.array, isTop = tops.includes(im);
              for (let k = 0; k < im.count; k++) { const o = k * 16, i = Math.round(x2gi(Ar[o + 12])), j = Math.round(z2gj(Ar[o + 14])); if (!inMap(i, j)) continue; const c = keys.get(i + j * GX); if (!c) continue;
                if (isTop) { if (Math.abs(Ar[o + 13] - (c.s - BLOCK / 2)) > 0.05) continue; if (!c.col) { c.col = new THREE.Color(); im.getColorAt(k, c.col); } }
                R.saved.push([im, k, Ar.slice(o, o + 16)]); R.ims.add(im); } }
            const see = [], wall = [], Mx = () => new THREE.Matrix4(), _s = new THREE.Matrix4(), DIRT = new THREE.Color(0x96704a);
            const face = (L, x, yc, z, h, f, col) => { if (h > 0.005) L.push([Mx().makeTranslation(x, yc, z).multiply(_s.makeScale(1, h / BLOCK, 1)).multiply(FACE_R[f]), col]); };
            const NB = [[1, 0, 0, 1], [-1, 0, 1, 0], [0, 1, 4, 5], [0, -1, 5, 4]];   // (di, dj, mặt của ô mình hướng sang, mặt ô bên hướng về mình)
            for (const c of keys.values()) {
              const x = wx(c.i), z = wz(c.j), col = c.col || new THREE.Color(0x4a842e), tb = c.s - BLOCK;
              if (!roadContains(x, z, -0.1)) face(see, x, c.s - BLOCK / 2, z, BLOCK, 2, col);   // mặt trên mờ (dưới mặt nhựa thì mặt đường mờ thay)
              face(wall, x, c.fl - BLOCK / 2, z, BLOCK, 2, null);   // đáy rãnh
              for (const [di, dj, fMine, fNb] of NB) {
                const ni = c.i + di, nj = c.j + dj, wet = !inMap(ni, nj) || isWater(ni, nj), n = keys.get(ni + nj * GX), ns = wet ? 0 : surfaceY(ni, nj), nx = wx(ni), nz = wz(nj);
                if (ns < c.s) {   // mặt bên lộ của cột mình (ô bên thấp hơn / nước): trên đáy rãnh mờ (khối đỉnh màu ô, thân màu đất), dưới đáy rãnh đặc
                  const a = Math.max(ns, c.fl, tb); face(see, x, (c.s + a) / 2, z, c.s - a, fMine, col);
                  const b = Math.max(ns, c.fl); if (tb > b) face(see, x, (tb + b) / 2, z, tb - b, fMine, DIRT);
                  if (!n && ns < c.fl) face(wall, x, (ns + c.fl) / 2, z, c.fl - ns, fMine, null);
                }
                if (!wet) { const t = n ? n.fl : Math.min(ns, c.s); if (t > c.fl) face(wall, nx, (t + c.fl) / 2, nz, t - c.fl, fNb, null); }   // tường đất ô bên (cắt) quay vào rãnh
              }
            }
            const mk = (L, mat, name) => { const im = new THREE.InstancedMesh(flatTopGeo, mat, Math.max(1, L.length)); L.forEach(([m, col], k) => { im.setMatrixAt(k, m); if (col) im.setColorAt(k, col); }); im.count = L.length;
              im.name = name; im.castShadow = false; im.receiveShadow = true; im.visible = false; im.userData.noBatch = im.userData.noBake = im.userData.noCollide = im.userData.noFlight = true; im.computeBoundingSphere(); scene.add(im); return im; };
            const seeM = new THREE.MeshLambertMaterial({ map: grassMat.map, transparent: true, opacity: 0.25, depthWrite: false }); wetMats.push([seeM, seeM.color.clone()]);
            const ditchM = new THREE.MeshLambertMaterial({ map: dirtMat.map, color: 0x8f8072 }); wetMats.push([ditchM, ditchM.color.clone()]);
            R.see = mk(see, seeM, 'Đất mờ trên cống (xem ống)'); R.see.renderOrder = 1;
            R.wall = mk(wall, ditchM, 'Rãnh đất quanh cống (xem ống)');
            // dải → texture 1 texel / ô (lề 1 ô = 0) cho mặt đường + cỏ
            let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9; for (const c of keys.values()) { i0 = Math.min(i0, c.i); i1 = Math.max(i1, c.i); j0 = Math.min(j0, c.j); j1 = Math.max(j1, c.j); }
            i0--; j0--; i1++; j1++; const ni = i1 - i0 + 1, nj = j1 - j0 + 1, D = new Uint8Array(ni * nj);
            for (const c of keys.values()) D[(c.j - j0) * ni + (c.i - i0)] = 255;
            const T = new THREE.DataTexture(D, ni, nj, THREE.RedFormat); T.unpackAlignment = 1; T.needsUpdate = true;
            DRAIN_BAND.u.uDrBand.value = T; DRAIN_BAND.u.uDrBox.value.set(wx(i0) - BLOCK / 2, wz(j0) - BLOCK / 2, 1 / (ni * BLOCK), 1 / (nj * BLOCK));
            const clones = new Map();   // vật liệu mặt đường → bản trong suốt có dải (lô gộp tự cho mảnh tự vẽ khi đổi vật liệu — core/draw-batch.js)
            campusRoad.traverse(o => { if (!o.isMesh || Array.isArray(o.material)) return; const m0 = o.material; let m1 = clones.get(m0);
              if (!m1) { m1 = m0.clone(); m1.transparent = true; const ob = m0.onBeforeCompile, ck = m0.customProgramCacheKey;
                m1.onBeforeCompile = (sh, r) => { ob.call(m0, sh, r); bandPatch(sh); }; m1.customProgramCacheKey = () => ck.call(m0) + '|drainBand'; clones.set(m0, m1); }
              R.swap.push([o, m0, m1, o.castShadow]); });
            R.cells = keys.size;
          }
          function reveal(on) {
            if (!R.built) bandBuild();
            R.on = on; under.visible = R.see.visible = R.wall.visible = on; DRAIN_BAND.u.uDrOn.value = on ? 1 : 0;
            for (const [im, k, m] of R.saved) im.instanceMatrix.array.set(on ? Z16 : m, k * 16);
            for (const im of R.ims) im.instanceMatrix.needsUpdate = true;
            for (const [o, m0, m1, cs] of R.swap) { o.material = on ? m1 : m0; o.castShadow = on ? false : cs; }   // mặt đường mờ thôi đổ bóng ⇒ ống dưới được nắng chiếu
            const i = terrainMeshes.indexOf(R.see); if (on && i < 0) terrainMeshes.push(R.see); else if (!on && i >= 0) terrainMeshes.splice(i, 1);   // tia rê chuột vẫn chạm mặt đất ở dải
          }
          // ---- MỖI KHUNG: lưu lượng theo mưa → tia nước, van lật, bọt, sóng ----
          const F = { q: 0, k: 0, sp: 0 };
          function tick(dt, t) {
            if (!(dt > 0)) return;
            F.q += (rainK - F.q) * Math.min(1, dt / (rainK > F.q ? 15 : 90));   // hồ chứa tuyến tính: lên ~15 s, rút ~90 s
            const k = F.k = Math.min(1, F.q * 1.15 + 0.08 * Math.max(0, sceneWet - 0.15));   // đất còn ướt ⇒ rỉ
            flapP.rotation.z += (0.62 * Math.sqrt(k) - flapP.rotation.z) * Math.min(1, dt * 3);   // van lật mở 0–35° theo lưu lượng
            const on = k > 0.015; jet.visible = foam.visible = on; if (!on) return;
            const v = 0.35 + 1.45 * k, th = 0.03 + 0.09 * k, O = jetU.uO.value.set(faceX + 0.16, OUT.inv + th * 0.5 + 0.01, zE), T = Math.sqrt(2 * Math.max(0.05, O.y - lakeY) / 9.8), L = 0.25 + 0.75 * (1 - nightFactor);
            jetU.uV.value = v; jetU.uT.value = T; jetU.uW.value = 0.1 + 0.16 * k; jetU.uTh.value = th; jetU.uK.value = THREE.MathUtils.smoothstep(k, 0.015, 0.15); jetU.uTime.value = t % 1000; jetU.uL.value = L;
            const ix = O.x + v * T, r = 0.35 + 0.45 * k; foam.position.set(ix, lakeY + 0.015, zE); foam.scale.set(r * 2, r * 2, 1); foamU.uK.value = jetU.uK.value; foamU.uTime.value = t % 1000; foamU.uL.value = L;
            if ((F.sp -= dt) <= 0) { F.sp = 0.12; fluids?.splash(ix, zE, 0.3 + 0.3 * k, 0.006 + 0.03 * k); }   // nước rơi ⇒ sóng tròn lan trên mặt sông
          }
          return { g, outfall: outG, rip, mats: M, toggle: () => reveal(!R.on), reveal, tick, state: R, flow: F, net: { MH, OUT, faceX, zE, gullies, covers: COVERS, seg: SEG.length, str: STR.length } };   // rip, mats: rêu cửa xả (nature/bank-moss.js)
        })();
