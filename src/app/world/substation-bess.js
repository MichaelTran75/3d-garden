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
        // ---- CỘT ĐIỆN (G 17/10 "improve cột điện structure", học cột điện trong GLB "Inakaya" — Jellepostma, CC-BY-4.0, chỉ xem để đo: cột bê tông thuôn có
        //      nắp đỉnh, khung xà kẹp cột, sứ, đai ôm cột, máy biến áp trụ có cánh tản nhiệt, bu lông leo so le, biển trên cột). Cột bê tông ly tâm thuôn
        //      Ø 0,36 → 0,2 m + mố chân · xà thép 2,7 m + 2 thanh chống chéo + đai ôm · 2 pha trên sứ đứng có tán ở 2 đầu xà, pha giữa trên sứ ĐỈNH CỘT
        //      (bản cũ: thân cột vươn qua xà, xuyên sứ giữa ⇒ dây pha giữa chui qua thân) · bu lông leo so le từ 2,6 m · biển "cấm trèo" · cột cấp điện nhà
        //      (opts.tx): máy biến áp treo cột nối 2 pha · cột lệch lực (cuối tuyến / góc): dây néo + ống bảo vệ vàng (poleGuys, sau khi nối hết dây).
        //      Điểm nối dây (conn) giữ y như cũ: tim cột, 0,88·h + 0,4 ----
        const poleConc = new THREE.MeshLambertMaterial({ color: 0xaaa69d }), poleConcD = new THREE.MeshLambertMaterial({ color: 0x8c8880 });
        const poleGuardM = new THREE.MeshLambertMaterial({ color: 0xe6c02a }), poleStripeM = new THREE.MeshLambertMaterial({ color: 0x1d1f22 }), poleTxM = new THREE.MeshLambertMaterial({ color: 0x8b959a }), poleConns = [];
        const _pV = (x, y, z) => new THREE.Vector3(x, y, z);
        let _pIns = null, _pSign = null;
        function poleInsGeo() {   // sứ đứng có 3 tán xoè (lathe), cao 0,3 m, gốc ở đáy
          if (_pIns) return _pIns; const V2 = (x, y) => new THREE.Vector2(x, y), pts = [V2(0.001, 0), V2(0.045, 0), V2(0.04, 0.03)];
          for (let i = 0; i < 3; i++) { const y = 0.05 + i * 0.075; pts.push(V2(0.036, y), V2(0.086 - i * 0.01, y + 0.018), V2(0.08 - i * 0.01, y + 0.03), V2(0.035, y + 0.042)); }
          pts.push(V2(0.033, 0.27), V2(0.028, 0.3), V2(0.001, 0.3)); return (_pIns = new THREE.LatheGeometry(pts, 12));
        }
        function poleSignTex() {   // biển cấm trèo: viền đỏ, tia sét đỏ, chữ
          if (_pSign) return _pSign; const c = document.createElement('canvas'); c.width = 128; c.height = 172; const x = c.getContext('2d');
          x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, 128, 172); x.strokeStyle = '#c8261d'; x.lineWidth = 9; x.strokeRect(6, 6, 116, 160);
          x.fillStyle = '#c8261d'; x.beginPath(); x.moveTo(74, 22); x.lineTo(44, 74); x.lineTo(64, 74); x.lineTo(50, 112); x.lineTo(86, 62); x.lineTo(66, 62); x.lineTo(80, 22); x.closePath(); x.fill();
          x.textAlign = 'center'; x.font = 'bold 19px Arial, sans-serif'; x.fillText('CẤM TRÈO', 64, 136); x.font = 'bold 12px Arial, sans-serif'; x.fillStyle = '#1d1d1d'; x.fillText('NGUY HIỂM', 64, 155);
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (_pSign = t);
        }
        let poleCounter = 0;
        function poleAt(oi, oj, h = 6.72, label = null, opts = {}) {
          poleCounter++; const numStr = label || ('' + poleCounter);
          const p = worldCell(oi, oj), g = new THREE.Group(); g.position.copy(p); g.name = 'Cột điện #' + poleCounter + ' (Power Pole)'; scene.add(g);
          obstacleCoords.push({ x: p.x, y: p.y, z: p.z, r: 1.5, h: h + 1.5 });
          let rotY = 0;
          if (poleCounter === 1 || poleCounter === 2 || poleCounter === 3 || poleCounter === 5) rotY = Math.PI / 2;        // cột 1, 2, 3 & 5 xoay 90°
          else if (poleCounter === 6) rotY = Math.PI / 6;                        // cột 6 xoay ngược chiều kim đồng hồ 30°
          g.rotation.y = rotY;
          const add = (m, x, y, z, cast = true) => { m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
          const band = (y, r, hh = 0.07) => add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, hh, 14, 1, true), metalMat), 0, y, 0, false);   // đai ôm cột
          const yA = h * 0.88, top = yA + 0.12, RB = 0.18, RT = 0.1, rAt = y => RB + (RT - RB) * y / top;
          // thân bê tông thuôn + mố chân + nắp đỉnh
          add(new THREE.Mesh(new THREE.CylinderGeometry(RT, RB, top, 14), poleConc), 0, top / 2, 0);
          add(new THREE.Mesh(new THREE.CylinderGeometry(RB + 0.05, RB + 0.12, 0.24, 14), poleConcD), 0, 0.06, 0);
          add(new THREE.Mesh(new THREE.CylinderGeometry(RT + 0.03, RT + 0.02, 0.06, 14), poleConcD), 0, top + 0.03, 0);
          // xà thép + 2 thanh chống chéo xuống thân + đai ôm ở 2 chỗ kẹp
          add(bx(2.7, 0.08, 0.09, metalMat, true, true, lineDark), 0, yA, 0);
          for (const sx of [-1, 1]) rodBetween(g, _pV(sx * rAt(yA - 0.62), yA - 0.62, 0), _pV(sx * 0.8, yA - 0.04, 0), 0.016, metalMat, 5, true);
          band(yA, rAt(yA) + 0.012, 0.1); band(yA - 0.62, rAt(yA - 0.62) + 0.012);
          // sứ: 2 đầu xà + đỉnh cột — đỉnh sứ (kẹp dây) đúng conn (yA + 0.4)
          for (const [x, y0] of [[-1.05, yA + 0.045], [1.05, yA + 0.045], [0, top + 0.06]]) {
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 6), metalMat), x, y0 + 0.02, 0, false);   // chân sứ
            const ins = add(new THREE.Mesh(poleInsGeo(), ceramicMat), x, y0 + 0.045, 0); ins.scale.y = (yA + 0.375 - (y0 + 0.045)) / 0.3;
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.03, 8), metalMat), x, yA + 0.39, 0, false);   // kẹp dây đỉnh sứ
          }
          // bu lông leo so le 2 phía (vuông góc xà) từ 2,6 m tới dưới chỗ chống xà
          for (let y = 2.6, sz = 1; y < yA - 0.8; y += 0.42, sz = -sz) rodBetween(g, _pV(0, y, sz * (rAt(y) - 0.01)), _pV(0, y + 0.015, sz * (rAt(y) + 0.17)), 0.011, metalMat, 5, false);
          // biển cấm trèo + 2 đai giữ (mặt +z)
          { const yS = 2.25, r = rAt(yS); add(bx(0.3, 0.4, 0.012, poleConcD, false, false), 0, yS, r + 0.008, false);
            const face = add(new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.39), new THREE.MeshLambertMaterial({ map: poleSignTex(), polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 })), 0, yS, r + 0.0145, false);
            band(yS + 0.16, r + 0.008, 0.03); band(yS - 0.16, r + 0.008, 0.03); face.name = 'Biển cấm trèo'; }
          // máy biến áp treo cột (cột có nhánh vào nhà): 2 giá ngang ôm cột phía −z · bồn dầu có 16 cánh tản nhiệt · nắp · 2 sứ cao thế nối dây lên 2 pha đầu xà · hộp hạ thế
          if (opts.tx) {
            const yT = yA - 2.7, tz = -(rAt(yT) + 0.34);
            for (const y of [yT - 0.32, yT + 0.28]) { add(bx(0.12, 0.06, 0.62, metalMat, true, true, lineDark), 0, y, tz / 2 - 0.02); band(y, rAt(y) + 0.012); }
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.66, 20), poleTxM), 0, yT, tz);
            for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, f = add(bx(0.01, 0.52, 0.07, poleTxM, true, false), Math.cos(a) * 0.29, yT - 0.03, tz + Math.sin(a) * 0.29); f.rotation.y = Math.PI / 2 - a; }
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.29, 0.05, 20), poleTxM), 0, yT + 0.355, tz);
            add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.07, 20), poleTxM), 0, yT + 0.415, tz);
            add(bx(0.22, 0.16, 0.1, poleTxM, true, true, lineDark), 0, yT - 0.1, tz - 0.3);   // hộp đấu hạ thế
            for (const sx of [-1, 1]) { const bu = add(new THREE.Mesh(poleInsGeo(), ceramicMat), sx * 0.11, yT + 0.45, tz); bu.scale.set(0.55, 0.5, 0.55);
              const a0 = _pV(sx * 0.11, yT + 0.6, tz), a2 = _pV(sx * 1.05, yA + 0.39, 0), a1 = a0.clone().lerp(a2, 0.5); a1.y -= 0.25;
              g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a0, a1, a2).getPoints(10)), cableMat)); }
          }
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: poleBadgeTex(numStr), transparent: true, opacity: 0.95, depthTest: false, depthWrite: false }));
          sp.scale.set(2.2, 2.2, 1); sp.position.set(0, h + 1.25, 0); sp.renderOrder = 25; g.add(sp); numSprites.push(sp);
          const conn = p.clone().add(new THREE.Vector3(0, yA + 0.4, 0));
          conn.crossarmDir = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY)); conn.pole = g; conn.yA = yA; conn.rAt = rAt; conn.links = []; poleConns.push(conn);
          return conn;
        }
        // dây néo cho cột lệch lực: tổng hướng (ngang) các dây nối dài ⇒ néo ngược lại, neo cách cột 3,2 m (né mặt nước, đường; thử lệch ±20°, ±40°)
        function poleGuys() {
          for (const c of poleConns) {
            const R = new THREE.Vector3(); for (const q of c.links) R.add(_pV(q.x - c.x, 0, q.z - c.z).normalize());
            if (R.length() < 0.7) continue;
            const base = c.pole.position, d0 = R.normalize().negate();
            for (const da of [0, 0.35, -0.35, 0.7, -0.7]) {
              const d = d0.clone().applyAxisAngle(_pV(0, 1, 0), da), ax = base.x + d.x * 3.2, az = base.z + d.z * 3.2, i = Math.round(ax / BLOCK + cx - 0.5), j = Math.round(az / BLOCK + cz - 0.5);
              if (i < 1 || j < 1 || i >= GX - 1 || j >= GZ - 1 || isWater(i, j) || roadContains(ax, az, 0.4) || Math.abs(surfaceY(i, j) - base.y) > 0.7) continue;
              const gy = surfaceY(i, j), gg = new THREE.Group(); gg.name = 'Dây néo ' + c.pole.name; scene.add(gg);
              const A = _pV(base.x + d.x * 0.12, base.y + c.yA - 0.35, base.z + d.z * 0.12), B = _pV(ax, gy + 0.05, az), u = A.clone().sub(B).normalize();
              rodBetween(gg, A, B, 0.009, metalMat, 4, false);
              rodBetween(gg, B, B.clone().addScaledVector(u, 1.9), 0.04, poleGuardM, 10, true);   // ống bảo vệ vàng
              for (const k of [0.45, 0.95, 1.45]) { rodBetween(gg, B.clone().addScaledVector(u, k), B.clone().addScaledVector(u, k + 0.12), 0.042, poleStripeM, 10, false); }
              const blk = bx(0.3, 0.12, 0.3, poleConcD, true, false); blk.position.set(ax, gy + 0.03, az); gg.add(blk);
              const band = new THREE.Mesh(new THREE.CylinderGeometry(c.rAt(c.yA - 0.35) + 0.012, c.rAt(c.yA - 0.35) + 0.012, 0.06, 14, 1, true), metalMat); band.position.set(0, c.yA - 0.35, 0); c.pole.add(band);
              break;
            }
          }
        }
        function wire(a, b, sag = 0.55) {
          if (a.links) a.links.push(b); if (b.links) b.links.push(a);   // cho dây néo (poleGuys)
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
        // ---- TRẠM BIẾN ÁP 110 kV sơ đồ "cầu H" (2 lộ đường dây + 2 máy biến áp — kiểu phổ biến ở trạm nông thôn / nhà máy thuỷ điện nhỏ):
        //      đường dây vào 2 CỔNG NÉO mắt cáo ở 2 đầu, thẳng hàng cột 1 & cột 2 → mỗi lộ đủ 3 pha: chống sét van → dao cách ly quay giữa
        //      → biến dòng → máy cắt SF6 → nút sứ đỡ có thanh cái ống; giữa 2 nút là dao phân đoạn; mỗi nút rẽ xuống 1 máy biến áp
        //      (thùng dầu, dàn tản nhiệt + quạt, bình dầu phụ + rơ-le hơi + bình hút ẩm, sứ cao/hạ/trung tính, hố thu dầu).
        //      Dây dẫn mềm nối đúng đầu cực từng pha; sân rải đá dăm, mương cáp, nhà điều khiển, hàng rào lưới + dây gai, cột thu sét, đèn pha ----
        function substation(oi, oj) {
          const p = worldCell(oi, oj), g = new THREE.Group(); g.position.copy(p); g.name = 'Trạm biến áp (Substation)'; g.scale.setScalar(ARCHITECTURE_SCALE); scene.add(g);
          const Y0 = 0.26, ZC = -0.55, GH = 10.8, steel = metalMat, v3 = (x, y, z) => new THREE.Vector3(x, y, z), V2 = (x, y) => new THREE.Vector2(x, y);   // mặt đá dăm · tim tuyến (thẳng hàng cột 1) · cao xà cổng néo ≈ xà cột điện
          const zs = [-0.8, 0, 0.8].map(d => ZC + d);   // 3 pha
          obstacleCoords.push({ x: p.x, y: p.y, z: p.z, r: 7.2 * ARCHITECTURE_SCALE, h: (GH + 1.3) * ARCHITECTURE_SCALE });
          const paint = new THREE.MeshLambertMaterial({ color: 0x8a949a }), glassD = new THREE.MeshLambertMaterial({ color: 0x3a4650 });
          const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
          const B = (w, h, d, mat, x, y, z, out = false) => add(bx(w, h, d, mat, true, out, lineDark), x, y, z);
          const C = (r0, r1, h, mat, x, y, z, segs = 10) => add(cyl(r0, r1, h, mat, true, false, null, segs), x, y, z);
          const R = (a, b, r, mat = steel, segs = 4) => rodBetween(g, a, b, r, mat, segs, r > 0.02);
          const insC = new Map(), ins = (h, r, x, y, z) => {   // sứ có tán lớn/nhỏ xen kẽ (lathe), hình dùng chung theo cỡ
            const k = h + '|' + r; let geo = insC.get(k);
            if (!geo) { const n = Math.max(3, Math.round(h / 0.11)), pts = [V2(0.001, 0), V2(r * 0.6, 0)]; for (let i = 0; i < n; i++) { const y0 = h * i / n, d = h / n; pts.push(V2(r * 0.42, y0 + d * 0.2), V2(r * (i % 2 ? 0.78 : 1), y0 + d * 0.45), V2(r * 0.42, y0 + d * 0.7)); } pts.push(V2(r * 0.5, h), V2(0.001, h)); insC.set(k, geo = new THREE.LatheGeometry(pts, 9)); }
            const m = new THREE.Mesh(geo, ceramicMat); m.castShadow = true; return add(m, x, y, z);
          };
          // ---- nền: bó vỉa + sân rải đá dăm màu trơn (G 20/10 "remove texture nền sỏi" — trước là vân sỏi vẽ canvas 64², lặp 10 × 7), mương cáp có nắp ----
          const gravel = new THREE.MeshLambertMaterial({ color: 0xa4a198 });
          add(bx(12.0, 0.14, 8.4, concreteMat, true, true, lineMat), 0, 0.07, 0); add(bx(11.6, 0.24, 8.0, gravel, false, true, lineMat), 0, 0.14, 0);
          B(9.2, 0.05, 0.38, concreteMat, 0, Y0 + 0.005, -2.55, true); B(0.38, 0.05, 3.8, concreteMat, 0.75, Y0 + 0.005, -0.55, true);
          // ---- thiết bị 3 pha (mỗi hàm trả đầu cực từng pha) ----
          const ped = (x, z, h) => { B(0.3, 0.12, 0.3, concreteMat, x, Y0 + 0.02, z); C(0.05, 0.07, h, steel, x, Y0 + h / 2, z, 8); B(0.22, 0.04, 0.22, steel, x, Y0 + h, z); return Y0 + h + 0.02; };   // trụ thép trên móng
          const SA = x => zs.map(z => { const y = ped(x, z, 1.55); ins(1.05, 0.1, x, y, z); add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.018, 4, 18), steel), x, y + 0.92, z).rotation.x = Math.PI / 2; C(0.05, 0.05, 0.12, steel, x, y + 1.1, z, 8); B(0.1, 0.14, 0.08, gateMat, x + 0.08, Y0 + 0.9, z); return v3(x, y + 1.16, z); });   // chống sét van: vòng phân áp + bộ đếm sét
          const CT = x => zs.map(z => { const y = ped(x, z, 1.3), hy = y + 1.44; C(0.17, 0.19, 0.32, paint, x, y + 0.16, z, 12); ins(0.95, 0.12, x, y + 0.32, z); C(0.22, 0.2, 0.3, paint, x, hy, z, 12); add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 5, 0, Math.PI * 2, 0, 1.3), paint), x, hy + 0.08, z).castShadow = true; B(0.52, 0.06, 0.08, steel, x, hy, z); return v3(x, hy, z); });   // biến dòng dầu kiểu đầu bầu
          const DS = x => zs.map(z => { const y = ped(x, z, 1.3), ty = y + 1.05; B(0.8, 0.1, 0.12, steel, x, y + 0.05, z); for (const d of [-0.3, 0.3]) { C(0.07, 0.07, 0.06, steel, x + d, y + 0.13, z, 8); ins(0.85, 0.1, x + d, y + 0.16, z); } B(0.64, 0.035, 0.035, steel, x, ty + 0.03, z); B(0.08, 0.07, 0.08, steel, x, ty + 0.03, z); B(0.12, 0.2, 0.1, gateMat, x - 0.06, Y0 + 0.75, z + 0.1); R(v3(x + 0.38, y + 0.12, z), v3(x + 0.04, y + 0.2, z), 0.012); return [v3(x - 0.3, ty, z), v3(x + 0.3, ty, z)]; });   // dao cách ly quay giữa + dao tiếp địa gập
          const CB = x => { for (const d of [-1.0, 1.0]) { C(0.06, 0.08, 1.25, steel, x, Y0 + 0.625, ZC + d, 8); B(0.32, 0.12, 0.32, concreteMat, x, Y0 + 0.04, ZC + d); } B(0.14, 0.1, 2.1, steel, x, Y0 + 1.25, ZC); B(0.42, 0.6, 0.32, gateMat, x + 0.32, Y0 + 0.9, ZC, true);   // khung chung + tủ truyền động lò xo
            return zs.map(z => { const y = Y0 + 1.3; C(0.1, 0.12, 0.14, steel, x, y + 0.07, z, 8); ins(0.75, 0.12, x, y + 0.14, z); C(0.11, 0.11, 0.16, steel, x, y + 0.97, z, 10); ins(0.6, 0.11, x, y + 1.05, z); C(0.12, 0.1, 0.12, steel, x, y + 1.71, z, 10); B(0.46, 0.05, 0.1, steel, x, y + 1.73, z); return v3(x, y + 1.73, z); }); };   // máy cắt SF6 sứ đứng: sứ đỡ + buồng dập hồ quang
          const node = x => { for (const d of [-1.15, 1.15]) { C(0.06, 0.08, 1.9, steel, x, Y0 + 0.95, ZC + d, 8); B(0.32, 0.12, 0.32, concreteMat, x, Y0 + 0.04, ZC + d); } B(0.12, 0.12, 2.5, steel, x, Y0 + 1.9, ZC);
            return zs.map(z => { ins(1.0, 0.11, x, Y0 + 1.96, z); add(cyl(0.045, 0.045, 0.9, steel, true, false, null, 8), x, Y0 + 3.0, z).rotation.z = Math.PI / 2; return v3(x, Y0 + 3.0, z); }); };   // giá + sứ đỡ + đoạn thanh cái ống
          // ---- cổng néo Π: 2 cột thép mắt cáo (nhô đỉnh làm cột dây chống sét) + xà dàn hộp; chuỗi sứ néo chĩa ra phía đường dây (dir = ±1) ----
          const cs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
          const lattice = (x, z, h, w0, w1) => { const n = Math.round(h / 0.85), P = (c, y) => { const w = (w0 + (w1 - w0) * y / h) / 2; return v3(x + c[0] * w, Y0 + y, z + c[1] * w); };
            for (const c of cs) R(P(c, 0), P(c, h), 0.032, steel, 5);
            for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a = cs[k], b = cs[(k + 1) % 4], y0 = h * i / n, y1 = h * (i + 1) / n; R(P(a, y1), P(b, y1), 0.013); R(P(a, y0), P(b, y1), 0.01); R(P(b, y0), P(a, y1), 0.01); } };
          const gantry = (x, dir) => {
            for (const d of [-1.55, 1.55]) { lattice(x, ZC + d, GH + 1.3, 0.56, 0.26); B(0.75, 0.14, 0.75, concreteMat, x, Y0 + 0.05, ZC + d); }
            const z0 = ZC - 1.55, z1 = ZC + 1.55, n = 7, P = (c, z) => v3(x + c[0] * 0.18, Y0 + GH + c[1] * 0.18, z);
            for (const c of cs) R(P(c, z0), P(c, z1), 0.026, steel, 5);
            for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a = cs[k], b = cs[(k + 1) % 4], za = z0 + (z1 - z0) * i / n, zb = z0 + (z1 - z0) * (i + 1) / n; R(P(a, zb), P(b, zb), 0.012); R(P(a, za), P(b, zb), 0.009); }
            return [-1.17, 0, 1.17].map(d => { const z = ZC + d, a = v3(x + dir * 0.2, Y0 + GH, z), b = v3(x + dir * 0.95, Y0 + GH - 0.1, z), st = ins(0.72, 0.085, 0, 0, 0);   // 3 pha cách 1,05 m (= khoảng pha trên xà cột)
              st.position.copy(a); st.quaternion.setFromUnitVectors(v3(0, 1, 0), b.clone().sub(a).normalize()); return [b, a]; });
          };
          // ---- máy biến áp lực ngâm dầu; s = +1 khi phía sứ cao áp quay về +x ----
          const xfmr = (x, z, s) => { const X = d => x + s * d, top = Y0 + 1.53;
            for (const d of [-1.25, 1.25]) { B(2.6, 0.2, 0.1, concreteMat, x, Y0 + 0.08, z + d); B(0.1, 0.2, 2.6, concreteMat, x + d, Y0 + 0.08, z); }   // tường hố thu dầu
            for (const d of [-0.38, 0.38]) B(0.18, 0.18, 1.7, concreteMat, X(d), Y0 + 0.09, z);
            B(1.2, 1.35, 1.75, paint, x, Y0 + 0.855, z, true); B(1.3, 0.07, 1.85, paint, x, top + 0.035, z, true);
            for (const d of [-0.55, 0, 0.55]) B(0.05, 1.22, 0.07, paint, X(0.62), Y0 + 0.86, z + d);   // gân tăng cứng
            for (const bz of [-0.45, 0.45]) {   // 2 dàn tản nhiệt (7 lá) + ống góp trên/dưới + quạt gió dưới đáy
              for (let i = 0; i < 7; i++) B(0.52, 1.05, 0.025, paint, X(-0.92), Y0 + 0.86, z + bz + (i - 3) * 0.055);
              for (const yy of [0.42, 1.3]) R(v3(X(-0.7), Y0 + yy, z + bz - 0.21), v3(X(-0.7), Y0 + yy, z + bz + 0.21), 0.035, paint, 6);
              C(0.16, 0.16, 0.07, gateMat, X(-0.92), Y0 + 0.28, z + bz, 12);
            }
            const cx = X(-0.3), cy = top + 0.62;   // bình dầu phụ trên giá + ống rơ-le hơi + bình hút ẩm (hạt silica vàng)
            R(v3(cx, cy, z - 0.78), v3(cx, cy, z + 0.78), 0.19, paint, 14);
            for (const d of [-0.55, 0.55]) R(v3(cx, top + 0.05, z + d), v3(cx, cy - 0.16, z + d), 0.025);
            R(v3(cx, cy - 0.18, z + 0.3), v3(X(0.05), top + 0.07, z + 0.3), 0.025); B(0.1, 0.08, 0.08, gateMat, (cx + X(0.05)) / 2, (cy + top) / 2 - 0.05, z + 0.3);
            R(v3(cx, cy - 0.15, z - 0.75), v3(cx, cy - 0.5, z - 0.75), 0.015); C(0.05, 0.05, 0.2, warningMat, cx, cy - 0.6, z - 0.75, 8);
            for (const d of [-0.35, 0, 0.35]) { ins(0.35, 0.07, X(-0.08), top + 0.07, z + d); C(0.03, 0.03, 0.1, steel, X(-0.08), top + 0.47, z + d, 6); }   // sứ hạ áp
            ins(0.45, 0.07, X(0.42), top + 0.07, z + 0.82); C(0.06, 0.06, 0.08, steel, X(0.15), top + 0.11, z - 0.6, 8);   // sứ trung tính · van an toàn
            B(0.12, 0.55, 0.42, gateMat, X(0.66), Y0 + 0.75, z + 0.45, true);   // tủ điều khiển trên thành thùng
            return [-0.55, 0, 0.55].map(d => { C(0.11, 0.13, 0.12, paint, X(0.42), top + 0.13, z + d); ins(0.95, 0.105, X(0.42), top + 0.19, z + d); C(0.035, 0.035, 0.14, steel, X(0.42), top + 1.21, z + d, 6); return v3(X(0.42), top + 1.28, z + d); });   // sứ cao áp
          };
          // ---- bố trí: cổng W · CSV · DCL · TI · MC · nút A · DCL phân đoạn · nút B · MC · TI · DCL · CSV · cổng E; 2 máy rẽ từ nút A, B ----
          const gW = gantry(-5.2, -1), gE = gantry(5.2, 1), sW = SA(-4.55), sE = SA(4.55), dW = DS(-3.75), dE = DS(3.75), cW = CT(-2.95), cE = CT(2.95);
          const bW = CB(-2.15), bE = CB(2.15), nA = node(-1.3), nB = node(1.3), dM = DS(0), t1 = xfmr(-2.6, 2.35, 1), t2 = xfmr(2.6, 2.35, -1);
          const wires = [], span = (a, b, sag = 0.08) => { let q = a; for (let i = 1; i <= 8; i++) { const f = i / 8, r = a.clone().lerp(b, f); r.y -= sag * 4 * f * (1 - f); wires.push(q, r); q = r; } };
          const dx = v3(0.45, 0, 0);
          for (let k = 0; k < 3; k++) {
            span(gW[k][1], sW[k], 0.3); span(sW[k], dW[k][0]); span(dW[k][1], cW[k]); span(cW[k], bW[k]); span(bW[k], nA[k].clone().sub(dx)); span(nA[k].clone().add(dx), dM[k][0]); span(dM[k][1], nB[k].clone().sub(dx));
            span(nB[k].clone().add(dx), bE[k]); span(bE[k], cE[k]); span(cE[k], dE[k][0]); span(dE[k][1], sE[k]); span(sE[k], gE[k][1], 0.3); span(nA[k], t1[k], 0.22); span(nB[k], t2[k], 0.22);
          }
          g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires), cableMat));
          // ---- nhà điều khiển giữa 2 máy (cửa + mái che quay về phía thiết bị), tụ bù, cột thu sét, đèn pha ----
          { const z0 = 2.45; B(1.9, 0.12, 1.9, concreteMat, 0, Y0 + 0.06, z0, true); B(1.7, 1.3, 1.7, wallMat, 0, Y0 + 0.77, z0, true); B(1.84, 0.12, 1.84, concreteDark, 0, Y0 + 1.48, z0, true);
            B(0.46, 0.9, 0.05, gateMat, -0.42, Y0 + 0.57, z0 - 0.86, true); B(0.62, 0.04, 0.32, concreteDark, -0.42, Y0 + 1.08, z0 - 1.0, true);
            for (const d of [0.12, 0.52]) B(0.3, 0.32, 0.04, glassD, d, Y0 + 0.85, z0 - 0.86, true);
            for (const d of [-0.45, 0.15]) B(0.42, 0.32, 0.04, glassD, d, Y0 + 0.85, z0 + 0.86, true);   // cửa sổ mặt sau
            B(0.04, 0.3, 0.5, gateMat, 0.86, Y0 + 1.0, z0 - 0.35, true);   // cửa thông gió (lá sách)
            B(0.14, 0.3, 0.46, legMat, 0.92, Y0 + 0.5, z0, true); }
          { B(1.5, 0.08, 0.45, steel, 3.3, Y0 + 0.7, -3.05); for (const d of [-0.6, 0.6]) C(0.04, 0.04, 0.7, steel, 3.3 + d, Y0 + 0.35, -3.05, 6);
            for (let k = 0; k < 5; k++) { B(0.2, 0.42, 0.3, paint, 2.75 + k * 0.275, Y0 + 0.95, -3.05, true); ins(0.16, 0.05, 2.75 + k * 0.275, Y0 + 1.16, -3.05); } }   // dàn tụ bù
          for (const [x, z] of [[4.95, 3.25], [-4.95, -3.25]]) { B(0.4, 0.14, 0.4, concreteMat, x, Y0 + 0.05, z); C(0.03, 0.11, 9.5, steel, x, Y0 + 4.75, z, 8); C(0.004, 0.025, 0.9, steel, x, Y0 + 9.95, z, 6); }   // cột thu sét
          for (const [x, z] of [[-4.95, 3.25], [4.95, -3.25]]) { C(0.05, 0.07, 4.2, steel, x, Y0 + 2.1, z, 8); B(0.42, 0.14, 0.24, warningMat, x, Y0 + 4.2, z + (z > 0 ? -0.12 : 0.12), true); }   // đèn pha sân trạm
          // ---- hàng rào lưới (tấm lưới mờ) + trụ + thanh đỉnh + 3 sợi dây gai, cổng đôi mép −z, biển cảnh báo ----
          { const fh = 1.05, hw = 5.6, hd = 3.7, fy = Y0 - 0.02, meshMat = new THREE.MeshLambertMaterial({ color: 0x59646d, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }), barb = [];
            const side = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 1.0));
              for (let i = 0; i <= n; i++) { const f = i / n; C(0.028, 0.028, fh + 0.2, steel, x0 + (x1 - x0) * f, fy + (fh + 0.2) / 2, z0 + (z1 - z0) * f, 6); }
              add(new THREE.Mesh(new THREE.PlaneGeometry(L, fh * 0.92), meshMat), (x0 + x1) / 2, fy + fh * 0.5, (z0 + z1) / 2).rotation.y = -Math.atan2(z1 - z0, x1 - x0);
              R(v3(x0, fy + fh, z0), v3(x1, fy + fh, z1), 0.018);
              for (let k = 1; k <= 3; k++) barb.push(v3(x0, fy + fh + k * 0.06, z0), v3(x1, fy + fh + k * 0.06, z1)); };
            side(-hw, -hd, -1.25, -hd); side(1.25, -hd, hw, -hd); side(-hw, hd, hw, hd); side(-hw, -hd, -hw, hd); side(hw, -hd, hw, hd);
            for (const sx of [-1, 1]) { const x0 = sx * 1.22, x1 = sx * 0.03; for (const y of [fy + 0.06, fy + fh]) R(v3(x0, y, -hd), v3(x1, y, -hd), 0.022); for (const x of [x0, x1]) R(v3(x, fy + 0.06, -hd), v3(x, fy + fh, -hd), 0.022); R(v3(x0, fy + 0.06, -hd), v3(x1, fy + fh, -hd), 0.014); add(new THREE.Mesh(new THREE.PlaneGeometry(1.19, fh * 0.9), meshMat), (x0 + x1) / 2, fy + fh * 0.53, -hd); }   // cánh cổng
            g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(barb), cableMat));
            for (const [x, z] of [[-3.2, -hd - 0.03], [2.6, -hd - 0.03], [-0.62, -hd - 0.03]]) B(0.5, 0.38, 0.03, warningMat, x, Y0 + 0.62, z, true); }
          // ---- Hiệu ứng ký hiệu điện ⚡ bay lên trên máy biến áp 1 ----
          const electSymbols = [], electGroup = new THREE.Group(); g.add(electGroup);
          {
            const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
            ctx.font = 'bold 52px Outfit, sans-serif'; ctx.fillStyle = '#00bfff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#0033aa'; ctx.shadowBlur = 6; ctx.fillText('⚡', 32, 32);
            const eTex = new THREE.CanvasTexture(c);
            for (let n = 0; n < 3; n++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: eTex, transparent: true, opacity: 0, depthWrite: false })); sp.scale.setScalar(1.08); electGroup.add(sp); electSymbols.push({ m: sp, ph: n * 1.6 }); }
          }
          substationAnim = {
            update: (time) => {   // ⚡ bay lên mềm như bong bóng
              for (const sym of electSymbols) {
                const q = (time * 0.304 + sym.ph) % 1.0;
                sym.m.position.set(-2.6 + Math.sin(time * 1.2 + sym.ph) * 0.3, 2.2 + q * 3.8, 2.35 + Math.cos(time * 0.96 + sym.ph) * 0.3);
                sym.m.material.opacity = q < 0.15 ? (q / 0.15) * 0.85 : (1 - q) * 0.85;
                sym.m.scale.setScalar((0.6 + q * 0.8) * 1.17);
              }
            }
          };
          bakeStatic(g);
          const tie = q => { const w = p.clone().addScaledVector(q, ARCHITECTURE_SCALE); w.crossarmDir = v3(0, 0, -1); return w; };   // điểm néo pha giữa (hướng xà như cột 1, 2 ⇒ 3 dây không bắt chéo)
          return { w: tie(gW[1][0]), e: tie(gE[1][0]) };
        }
        const subTie = substation(23.5, 27.2);
        const gridDefs = [[27, 27, 10.8], [18.5, 26.8, 10.8], [15.4, 27.0, 10.8], [8.1, 22.0, 10.8], [8.25, 29.0, 10.8]];   // 17/10: cột 3, 5 dời ra mép đông 2 nhà (bản cũ cắm trong nền Xưởng bảo trì / Nhà thiết bị ⇒ cột xuyên mái)
        const gridPoles = gridDefs.map((c, k) => poleAt(c[0], c[1], c[2], null, { tx: k >= 2 }));   // cột 3, 4, 5 có nhánh vào nhà ⇒ máy biến áp treo cột
        const buildingTies = [worldCell(13, 27, 7.6 * ARCHITECTURE_SCALE), worldCell(7, 19, 8.5 * ARCHITECTURE_SCALE), worldCell(6, 29, 7.5 * ARCHITECTURE_SCALE)];
        wire(gridPoles[0], subTie.e, 0.3); wire(subTie.w, gridPoles[1], 0.5); wire(gridPoles[1], gridPoles[2], 0.55); wire(gridPoles[2], buildingTies[0], 0.45); wire(gridPoles[2], gridPoles[3], 0.7); wire(gridPoles[3], buildingTies[1], 0.45); wire(gridPoles[2], gridPoles[4], 0.65); wire(gridPoles[4], buildingTies[2], 0.45);   // 2 lộ 110 kV vào 2 cổng néo của trạm · cột 5 cấp điện Nhà thiết bị (trước bỏ trống)

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
          batPole.links.push(bp);
        }                   // dây hạ xuống pin lưu trữ
        poleGuys();   // sau khi mọi dây đã nối

