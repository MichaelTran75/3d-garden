        // ---- DETAILED hydro power station (spans the river) ----
        const fallBlocks = [], tailJets = [], sprayBits = [], rainbowMats = [], damIMs = [], damMist = [];
        let damRainbow = null;   // cầu vồng chân đập (đậm nhạt theo mặt trời)
        let damPH = null;   // nhà máy (khoang 4): nhóm vỏ mờ 25% + số đo cục bộ đập — tổ máy thủy điện dựng trong đó (world/hydro-turbine.js)
        // Mặt đi được trên đập (toạ độ thế giới): đỉnh đập + 2 dốc nối bờ + chiếu nghỉ. Mỗi đoạn: x0..x1, at(x) → tâm z, nửa bề rộng, cao độ mặt.
        // Bò dùng làm cầu qua sông; ngoài mép (lan can) có dải cấm để không ai "xuyên lan can" nhảy xuống bờ.
        const damWalk = [], damExits = [];
        function damWalkAt(x, z) {   // null = không ở trên/sát đập; off ≤ 0: trên mặt đi, 0 < off ≤ 0.9: dải lan can
          for (const p of damWalk) { if (x < p.x0 || x > p.x1) continue; const a = p.at(x), off = Math.abs(z - a.zc) - a.hw; if (off <= 0.9) return { y: a.y, off }; }
          return null;
        }
        const damDeckY = (x, z) => { const w = damWalkAt(x, z); return w && w.off <= 0 ? w.y : null; };
        const _dmP = new THREE.Vector3(), _dmQ = new THREE.Quaternion(), _dmE = new THREE.Euler(), _dmS = new THREE.Vector3(1, 1, 1), _dmM = new THREE.Matrix4();   // scratch ghi ma trận bọt nước mỗi frame
        (function buildDam() {
          const g = new THREE.Group();
          const dcx = wx(riverC(DAM_J)), dz = (wz(DAM_J) + wz(DAM_J + 2 * S - 1)) / 2;
          g.position.set(dcx, 0, dz); g.name = 'Trạm thủy điện (Hydro Dam)'; scene.add(g);
          const Wd = 34, ox = 5, Hd = resTopY + 1.2, Zd = 2 * S * BLOCK, dsZ = Zd / 2;                                    // ox=lệch phải · dsZ=mặt hạ lưu
          const crest = bx(Wd + 0.8, 0.6, Zd + 1.6, concreteDark); crest.position.set(ox, Hd + 0.3, 0); g.add(crest);   // đường trên đỉnh
          { const crestAt = { zc: dz, hw: (Zd + 1.6) / 2 - 0.3, y: Hd + 0.6 };   // lan can ở ±(Zd/2 + 0,7)
            damWalk.push({ x0: dcx + ox - (Wd + 0.8) / 2, x1: dcx + ox + (Wd + 0.8) / 2, at: () => crestAt }); }
          for (const zz of [-1, 1]) {
            for (let i = -8; i <= 8; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 6), metalMat); post.position.set(ox + i * 2.0, Hd + 0.9, zz * (Zd / 2 + 0.7)); g.add(post); }
            const rail = bx(Wd + 0.8, 0.08, 0.08, metalMat, true, false); rail.position.set(ox, Hd + 1.2, zz * (Zd / 2 + 0.7)); g.add(rail);
          }                       // lan can hai mép đỉnh
          // ===== MẶT TRƯỚC (hạ lưu) thủy điện: trụ pin · cửa van cung · máng xả bậc · bể tiêu năng · cẩu trục =====
          // Sloped, solid abutment approaches join the crest to the actual voxel bank.
          g.userData.damApproaches = [];
          for (const side of [-1, 1]) {
            const approach = new THREE.Group(); approach.name = side < 0 ? 'Dốc nối bờ trái (Dam Approach)' : 'Dốc nối bờ phải (Dam Approach)';
            const crestTop = Hd + .6, rampRun = 7.2, landingRun = 2.2, deckWidth = Zd + 1.6;
            const startX = ox + side * (Wd + .8) / 2, endX = startX + side * rampRun;
            const bankAt = (x, z) => surfaceY(Math.round((g.position.x + x) / BLOCK + cx - .5), Math.round((g.position.z + z) / BLOCK + cz - .5));
            const endWidth = side < 0 ? 3.2 : deckWidth, endZ = side < 0 ? wz(23.5 * S) - dz : 0;   // bờ trái: chiếu nghỉ thẳng trục đường nội bộ (roadCornerZ ở world/solar-buildings-road.js) ⇒ nhánh đường nối khớp mép nhựa (G 18/10 "Connect the road")
            const fractionAt = x => Math.min(1, Math.abs(x - startX) / rampRun);
            const centerZAt = x => endZ * fractionAt(x);
            const halfWidthAt = x => (deckWidth + (endWidth - deckWidth) * fractionAt(x)) / 2;
            const groundY = Math.max(...[-endWidth / 2, 0, endWidth / 2].map(z => bankAt(endX, endZ + z)));
            const landingY = groundY + .04;
            const bedY = Math.min(...[startX, (startX + endX) / 2, endX].flatMap(x => [-halfWidthAt(x), 0, halfWidthAt(x)].map(z => bankAt(x, centerZAt(x) + z)))) - .15;
            const xLo = Math.min(startX, endX), xHi = Math.max(startX, endX), yLo = side < 0 ? landingY : crestTop, yHi = side < 0 ? crestTop : landingY, zLo = -deckWidth / 2, zHi = deckWidth / 2;
            const zLowAt = x => centerZAt(x) - halfWidthAt(x), zHighAt = x => centerZAt(x) + halfWidthAt(x);
            const vertices = [xLo, bedY, zLowAt(xLo), xHi, bedY, zLowAt(xHi), xHi, yHi, zLowAt(xHi), xLo, yLo, zLowAt(xLo),
              xLo, bedY, zHighAt(xLo), xHi, bedY, zHighAt(xHi), xHi, yHi, zHighAt(xHi), xLo, yLo, zHighAt(xLo)];
            const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(vertices.length / 3 * 2), 2));
            geometry.setIndex([0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5]); geometry.computeVertexNormals();
            const ramp = new THREE.Mesh(geometry, concreteDark); ramp.castShadow = ramp.receiveShadow = true; ramp.name = 'Solid sloped approach'; approach.add(ramp); edge(ramp, geometry, lineDark);
            const landing = bx(landingRun, landingY - bedY, endWidth, concreteDark); landing.position.set(endX + side * landingRun / 2, (landingY + bedY) / 2, endZ); approach.add(landing);
            const deckYAt = x => crestTop + (landingY - crestTop) * Math.min(1, Math.abs(x - startX) / rampRun);
            const railY = .6, railZ = Zd / 2 + .7;
            function railZAt(x, edge) { return centerZAt(x) + edge * (halfWidthAt(x) - .1); }
            function approachRail(a, b, edge) {
              const p = new THREE.Vector3(a, deckYAt(a) + railY, railZAt(a, edge)), q = new THREE.Vector3(b, deckYAt(b) + railY, railZAt(b, edge)), delta = q.clone().sub(p);
              const rail = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, delta.length(), 6), metalMat);
              rail.position.copy(p).add(q).multiplyScalar(.5); rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); rail.castShadow = true; approach.add(rail);
            }
            for (const edge of [-1, 1]) {
              approachRail(startX, endX, edge); approachRail(endX, endX + side * landingRun, edge);
              for (const run of [0, 1.8, 3.6, 5.4, 7.2, 9.4]) {
                const x = startX + side * run, post = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, railY, 6), metalMat);
                post.position.set(x, deckYAt(x) + railY / 2, railZAt(x, edge)); post.castShadow = true; approach.add(post);
              }
            }
            bakeStatic(approach); approach.userData.noBake = true; g.add(approach);
            g.userData.damApproaches.push({ side, startX, endX, crestTop, landingY, groundY, bedY, rampRun, landingRun, deckWidth, endWidth, endZ, grade: (crestTop - landingY) / rampRun });
            { const rampAt = { zc: 0, hw: 0, y: 0 }, landAt = { zc: dz + endZ, hw: endWidth / 2 - 0.25, y: landingY }, ex = endX + side * landingRun;
              damWalk.push({ x0: dcx + Math.min(startX, endX), x1: dcx + Math.max(startX, endX), at: x => { const lx = x - dcx; rampAt.zc = dz + centerZAt(lx); rampAt.hw = halfWidthAt(lx) - 0.25; rampAt.y = deckYAt(lx); return rampAt; } });
              damWalk.push({ x0: dcx + Math.min(endX, ex), x1: dcx + Math.max(endX, ex), at: () => landAt });
              damExits.push({ x: dcx + ex + side * 1.2, z: dz + endZ }); }   // bãi đất ngay đầu chiếu nghỉ (bò bước xuống bờ ở đây)
          }
          // ===== ĐẬP BÊ TÔNG TRỌNG LỰC + TRÀN CÓ CỬA VAN CUNG + BỂ TIÊU NĂNG + NHÀ MÁY LÒNG SÔNG (G 18/10 "do the research, study and improve the dam
          //  structure"). Theo USBR "Design of Small Dams" / EM 1110-2-1603 và các đập thật (Lower Granite, Thompson Falls, Canyon Ferry): mặt cắt trọng lực
          //  — thượng lưu thẳng đứng, hạ lưu dốc 0,75 : 1 dưới vai đỉnh; tràn đỉnh OGEE chuẩn WES y = x^1,85 / (2·Hs^0,85) (Hs = cột nước thiết kế 1,6 m),
          //  mặt cong thượng lưu là 1/4 elip; cửa van CUNG (tainter): bản mặt cong bán kính R = khoảng cách gối quay → ngưỡng, 2 tay cung mỗi bên chụm về
          //  GỐI QUAY neo vào trụ pin phía hạ lưu, dầm ngang sau bản mặt, tời trên cầu công tác; TRỤ PIN mũi tròn rẽ dòng + khe phai (phai sửa chữa trước
          //  cửa van); chân tràn = BỂ TIÊU NĂNG có mố nhám + ngưỡng cuối, tường hướng dòng nối dài trụ pin (đầu nước chỉ ~3,2 m ⇒ không dùng mũi phóng).
          //  Đầu nước thấp ⇒ NHÀ MÁY LÒNG SÔNG kiểu tổ máy bóng đèn đặt ngay trong tuyến đập (khoang phải): cửa lấy nước có lưới chắn rác phía thượng lưu,
          //  gian máy + cầu trục, cửa ống hút xả ra kênh hạ lưu. Toạ độ cục bộ đập: +z hạ lưu, y thế giới ----
          const nBays = 5, x0 = ox - Wd / 2, bayPitch = Wd / nBays, pierW = 1.5, bayW = bayPitch - pierW, faceZ = Zd / 2, sillY = downY + 0.3;
          const yC = resTopY - 1.9, gateTopY = resTopY + 0.3, zc = -0.8, Hs = 1.6, yF = 2.7, zE = 8.6, twY = downY + 0.95;   // ngưỡng tràn · đỉnh van · đáy bể (trên đáy sông cao nhất 2,64) · cuối bể · đỉnh tường hướng dòng
          const midBays = [1, 2, 3], PH = 4;   // 3 khoang tràn giữa · khoang 4 = nhà máy (khoang 0 = đập không tràn trên bờ trái)
          function prism(pts, xa, xb, mat) {   // mặt cắt (z, y) đùn dọc x từ xa tới xb
            const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(-z, y)));
            const geo = new THREE.ExtrudeGeometry(sh, { depth: xb - xa, bevelEnabled: false }); geo.rotateY(Math.PI / 2); geo.translate(xa, 0, 0);
            const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; edge(m, geo, lineDark); g.add(m); return m;
          }
          const ndPts = [[-faceZ, 0], [-faceZ, Hd], [faceZ, Hd], [faceZ, Hd - 1.2], [faceZ + 0.75 * (Hd - 1.2), 0]];   // mặt cắt không tràn
          prism(ndPts, x0, x0 + bayPitch, concreteMat);                                    // khoang 0: thân đập không tràn (bờ trái)
          // mặt cắt tràn: mặt thượng lưu đứng → 1/4 elip → đỉnh ogee → đường cong WES tới đáy bể → đáy bể → ngưỡng cuối
          const prof = [];   // đường mặt tràn (z, y) từ ngưỡng xuống đáy bể — nước chảy bám theo
          for (let k = 0; k <= 6; k++) { const t = k / 6 * Math.PI / 2; prof.push([zc - (zc + faceZ) * Math.cos(t), yC - 0.9 + 0.9 * Math.sin(t)]); }
          prof.shift();
          for (let xx = 0.2; ; xx += 0.2) { const y = yC - Math.pow(xx, 1.85) / (2 * Math.pow(Hs, 0.85)); if (y <= yF + 0.12) { prof.push([zc + xx + 0.25, yF]); break; } prof.push([zc + xx, y]); }
          const toeZ = prof[prof.length - 1][0], spill = prof.filter(q => q[0] >= zc), spPts = [[-faceZ, 0], [-faceZ, yC - 0.9], ...prof, [zE - 0.7, yF], [zE - 0.35, yF + 0.5], [zE, yF + 0.5], [zE, 0]];
          for (const bI of midBays) {
            const cx = x0 + bayPitch * bI + pierW, w = bayW;   // lòng khoang: giữa 2 trụ pin
            prism(spPts, cx, cx + w, concreteMat);
            for (let r = 0; r < 4; r++) { const blk = bx(0.45, 0.42, 0.55, concreteDark, true, true, lineDark); blk.position.set(cx + w * (r + 0.5) / 4, yF + 0.21, toeZ + 2.4 + (r % 2) * 0.4); g.add(blk); }   // mố nhám so le giữa bể
          }
          // ---- trụ pin (biên các khoang tràn + nhà máy): thân chữ nhật + mũi bán trụ thượng lưu, khe phai, gối quay, tường hướng dòng nối dài trong bể ----
          const zT = 2.1, yT = yC + 1.42, R = Math.hypot(yC - yT, zc - zT);
          for (let pI = 1; pI <= PH; pI++) {
            const px = x0 + bayPitch * pI + pierW / 2;
            const pier = bx(pierW, Hd, 6.2, concreteMat, true, true, lineDark); pier.position.set(px, Hd / 2, 0.1); g.add(pier);
            const nose = new THREE.Mesh(new THREE.CylinderGeometry(pierW / 2, pierW / 2, Hd, 10, 1, false, Math.PI / 2, Math.PI), concreteMat); nose.position.set(px, Hd / 2, -3.0); nose.castShadow = true; edge(nose, nose.geometry, lineDark); g.add(nose);
            { const tw = bx(0.6, twY - yF + 0.5, zE - 3.2, concreteDark, true, true, lineDark); tw.position.set(px, (twY + yF - 0.5) / 2, (zE + 3.2) / 2); g.add(tw); }   // tường hướng dòng
            for (const sx of [-1, 1]) {
              const slot = bx(0.06, Hd - yC + 0.2, 0.16, lineDark, false, false); slot.position.set(px + sx * (pierW / 2 + 0.005), (Hd + yC) / 2, -2.0); g.add(slot);   // khe phai
              if (pI <= 3 || sx < 0) { const tr = cyl(0.22, 0.22, 0.18, gateMat, true, false, null, 10); tr.rotation.z = Math.PI / 2; tr.position.set(px + sx * (pierW / 2 + 0.08), yT, zT); g.add(tr);   // gối quay
                const anc = bx(0.1, 0.9, 1.1, concreteDark, true, false); anc.position.set(px + sx * (pierW / 2 + 0.03), yT, zT + 0.25); g.add(anc); }
            }
          }
          // ---- cửa van cung: bản mặt cong (cung tròn tâm = gối quay) + 3 dầm ngang + 2 cặp tay cung; mở hé 0,12 rad (nước chảy dưới mép) ----
          const OPEN = 0.12, aS = Math.atan2(yC - yT, zc - zT), aT = Math.atan2(gateTopY - yT, -Math.sqrt(R * R - (gateTopY - yT) ** 2)) - 2 * Math.PI;   // cung ngắn qua −180° (bản mặt quay về thượng lưu), không vòng 320°
          const gateLip = [];   // mép dưới cửa van sau khi mở (z, y) — chỗ dòng nước bắt đầu
          for (const bI of midBays) {
            const cx = x0 + bayPitch * (bI + 0.5) + pierW / 2, gw = bayW - 0.06;   // tâm lòng khoang
            const gv = new THREE.Group(); gv.position.set(cx, yT, zT); gv.rotation.x = OPEN; g.add(gv);
            const N = 16, vtx = [], idx = [];
            for (let k = 0; k <= N; k++) { const a = aS + (aT - aS) * k / N, z = R * Math.cos(a), y = R * Math.sin(a); vtx.push(-gw / 2, y, z, gw / 2, y, z); if (k) { const i = 2 * k; idx.push(i - 2, i - 1, i, i - 1, i + 1, i); } }
            const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(vtx, 3)); sg.setIndex(idx); sg.computeVertexNormals();
            const skin = new THREE.Mesh(sg, warningMat); skin.material.side = THREE.DoubleSide; skin.castShadow = true; edge(skin, sg, lineDark); gv.add(skin);
            for (const f of [0.15, 0.5, 0.85]) { const a = aS + (aT - aS) * f, rib = bx(gw, 0.2, 0.22, gateMat, true, false); rib.position.set(0, (R - 0.14) * Math.sin(a), (R - 0.14) * Math.cos(a)); rib.rotation.x = -a; gv.add(rib); }
            for (const sx of [-1, 1]) for (const f of [0.08, 0.92]) {   // tay cung: từ gối quay tới dầm biên
              const a = aS + (aT - aS) * f, L = R - 0.2, arm = bx(0.16, 0.2, L, gateMat, true, false); arm.position.set(sx * (gw / 2 - 0.25), L / 2 * Math.sin(a), L / 2 * Math.cos(a)); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, Math.sin(a), Math.cos(a))); gv.add(arm); }
            const ca = Math.cos(OPEN), sa = Math.sin(OPEN), lz = R * Math.cos(aS), ly = R * Math.sin(aS);
            gateLip.push([zT + ly * sa + lz * ca, yT + ly * ca - lz * sa]);
            // tời trên cầu công tác (hạ lưu mặt đường) + 2 dây cáp xuống tai cửa van
            const house = bx(2.4, 1.5, 1.5, concreteDark, true, true, lineDark); house.position.set(cx, Hd + 0.6 + 0.75, 2.3); g.add(house);
            const roofH = bx(2.7, 0.12, 1.8, gateMat, true, false); roofH.position.set(cx, Hd + 0.6 + 1.56, 2.3); g.add(roofH);
            const tz = R * Math.cos(aT), ty = R * Math.sin(aT), topW = new THREE.Vector3(0, ty * ca - tz * sa, ty * sa + tz * ca);
            for (const sx of [-1, 1]) { const A = new THREE.Vector3(cx + sx * (gw / 2 - 0.15), Hd, 1.9), B = new THREE.Vector3(cx + sx * (gw / 2 - 0.15), yT + topW.y, zT + topW.z), d = A.clone().sub(B);
              const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, d.length(), 4), metalMat); rope.position.copy(A).add(B).multiplyScalar(0.5); rope.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(rope); }
          }
          // ---- NHÀ MÁY LÒNG SÔNG (khoang 4): khối cửa lấy nước + gian máy, lưới chắn rác thượng lưu, cửa ống hút hạ lưu, cầu trục gian máy ----
          //  G 31/10 tối "đặt turbine vào đập nước, simulate cách turbine chạy; chỗ building structure để turbine: làm cho vùng đó 75% transparent": khối cửa lấy nước,
          //  phần dưới (buồng xoắn / ống hút), gian máy, mái, kính, cửa ra nhóm riêng 'ph' — vật liệu riêng mờ 25% (không ghi độ sâu, không đổ bóng, không gộp / bake),
          //  nét viền giữ 100%. Tổ máy Francis trục đứng + buồng xoắn + ống áp lực + ống hút dựng trong đó (world/hydro-turbine.js). Cửa ống hút hạ xuống chìm
          //  dưới mực nước hạ lưu (miệng ống hút thật luôn ngập): y 1,4…2,4 (cũ 3,19…4,19 nhô trên mặt nước 3,0)
          {
            const xa = x0 + bayPitch * PH + pierW, xb = x0 + Wd, w = xb - xa, xm = (xa + xb) / 2;
            const ph = new THREE.Group(); ph.name = 'Nhà máy thủy điện (Powerhouse)'; ph.userData.noBake = ph.userData.noBatch = true; g.add(ph);
            const seeM = c => new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: 0.25, depthWrite: false });
            const phConc = seeM(concreteMat.color), phDark = seeM(concreteDark.color), phGlass = seeM(0x7d93a6), phDoor = seeM(warningMat.color), phHole = seeM(0x10161c);
            phGlass.opacity = phDoor.opacity = 0.35;
            const see = m => { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 1; ph.add(m); return m; };
            const intake = prism([[-faceZ, 0], [-faceZ, Hd], [faceZ, Hd], [faceZ, 0]], xa, xb, phConc); see(intake); intake.name = 'Khối cửa lấy nước (Intake)';   // khối cửa lấy nước
            const sub = bx(w, sillY + 0.6, 5.6, phConc, false, true, lineDark); sub.position.set(xm, (sillY + 0.6) / 2, faceZ + 2.8); see(sub); sub.name = 'Phần dưới nhà máy (Substructure)';   // phần dưới nước: buồng xoắn / ống hút
            const hall = bx(w - 0.4, 4.2, 5.0, phConc, false, true, lineDark); hall.position.set(xm, sillY + 0.6 + 2.1, faceZ + 2.7); see(hall); hall.name = 'Gian máy (Generator Hall)';
            const roof = bx(w + 0.2, 0.3, 5.6, phDark, false, true, lineDark); roof.position.set(xm, sillY + 0.6 + 4.35, faceZ + 2.7); see(roof);
            for (let k = 0; k < 4; k++) { const win = bx(0.9, 1.6, 0.05, phGlass, false, false); win.position.set(xa + 0.9 + k * (w - 1.8) / 3, sillY + 0.6 + 2.6, faceZ + 5.21); see(win); }   // dải cửa kính gian máy
            const door = bx(2.2, 2.6, 0.06, phDoor, false, false, lineDark); door.position.set(xm, sillY + 0.6 + 1.3, faceZ + 0.21 + 5.0 - 5.0); see(door);
            for (const sx of [-1, 1]) { const dt = bx(1.7, 1.0, 0.08, phHole, false, false); dt.position.set(xm + sx * w / 4, 1.9, faceZ + 5.61); see(dt); }   // 2 cửa ống hút (ống hút chia đôi bởi trụ giữa), chìm dưới mặt nước hạ lưu
            damPH = { g, ph, xa, xb, xm, w, faceZ, zAx: faceZ + 2.7, sillY, Hd, subTop: sillY + 0.6, outY: 1.9, outZ: faceZ + 5.6, outX: w / 4, z0: -faceZ, z1: faceZ + 5.6, mats: [phConc, phDark, phGlass, phDoor, phHole] };
            const rack = new THREE.Group(); rack.position.set(xm, 0, -faceZ - 0.06); g.add(rack);   // lưới chắn rác: khung + thanh đứng dày
            const fr = bx(w - 0.6, 0.18, 0.12, gateMat, true, false); fr.position.y = resTopY - 0.1; rack.add(fr); const fr2 = fr.clone(); fr2.position.y = 1.4; rack.add(fr2);
            for (let k = 0; k <= 22; k++) { const bar = bx(0.04, resTopY - 1.5, 0.1, gateMat, false, false); bar.position.set(-(w - 0.8) / 2 + k * (w - 0.8) / 22, (resTopY + 1.3) / 2, 0); rack.add(bar); }
            const tf = bx(1.6, 1.4, 1.1, gateMat, true, true, lineDark); tf.position.set(xa + 1.2, Hd + 0.6 + 0.7, -1.4); g.add(tf);   // máy biến áp tăng áp trên đỉnh
            for (let k = 0; k < 3; k++) { const bu = cyl(0.07, 0.1, 0.7, concreteDark, false, false, null, 6); bu.position.set(xa + 0.75 + k * 0.45, Hd + 0.6 + 1.75, -1.4); g.add(bu); }
          }
          // ---- đèn trên đỉnh đập (lan can hạ lưu) ----
          for (let k = 0; k < 5; k++) { const lx = x0 + 3 + k * (Wd - 6) / 4, pole = cyl(0.05, 0.06, 2.4, metalMat, true, false, null, 6); pole.position.set(lx, Hd + 0.6 + 1.2, faceZ + 0.5); g.add(pole);
            const head = bx(0.5, 0.12, 0.22, gateMat, true, false); head.position.set(lx, Hd + 0.6 + 2.4, faceZ + 0.3); g.add(head); }
          // ---- MÀN NƯỚC TRÀN + NƯỚC XẢ + BỌT MỐ NHẢY — 85 mesh lẻ gộp thành 4 InstancedMesh (ma trận per-instance ghi lại mỗi frame trong loop) ----
          const sheetIM = new THREE.InstancedMesh(new THREE.BoxGeometry(bayW * 0.84, 0.75, 0.38), sheetMat, 30);
          const foamIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.26, 0), foamMat, 15);
          const tailIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), foamMat, 16);    // bán kính 1 → cỡ thật nằm trong scale per-instance
          const sprayIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), foamMat, 24);
          for (const im of [sheetIM, foamIM, tailIM, sprayIM]) { im.frustumCulled = false; g.add(im); damIMs.push(im); }   // instance chạy khắp mặt đập → tắt culling theo bounding gốc
          let _si = 0, _fi = 0;
          midBays.forEach((bI, q) => {   // nước tràn bám mặt ogee: từ mép cửa van hé xuống đáy bể (path = dãy (z, y) cách mặt bê tông 0,12) rồi cuộn bọt nước nhảy
            const cx = x0 + bayPitch * (bI + 0.5) + pierW / 2, lip = gateLip[q], path = [[lip[0] + 0.05, lip[1] - 0.1], ...spill.filter(p => p[0] > lip[0] + 0.1).map(([z, y]) => [z + 0.04, y + 0.12])];
            for (let n = 0; n < 15; n++) { const isFoam = n % 3 === 0; fallBlocks.push({ im: isFoam ? foamIM : sheetIM, id: isFoam ? _fi++ : _si++, x: cx, path, toeZ, foam: isFoam, ph: n / 15 + bI * 0.1 }); }
            const sv = [], si = [];   // màn nước liền phủ mặt tràn (trong mờ) — các khối trôi trên nó cho cảm giác chảy
            path.forEach(([z, y], k) => { sv.push(cx - bayW / 2 + 0.05, y - 0.04, z, cx + bayW / 2 - 0.05, y - 0.04, z); if (k) { const i = 2 * k; si.push(i - 2, i, i - 1, i - 1, i, i + 1); } });
            const shg = new THREE.BufferGeometry(); shg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3)); shg.setIndex(si); shg.computeVertexNormals();
            const sheet = new THREE.Mesh(shg, sheetMat); sheet.userData.noBake = true; sheet.renderOrder = 2; g.add(sheet);
          });
          // nước xả hạ lưu (tailrace foam): sc = bán kính icosahedron cũ × hệ số cũ (gộp vào scale)
          for (let n = 0; n < 16; n++) tailJets.push({ im: tailIM, id: n, x: n < 12 ? ox + (Math.random() - 0.5) * 18 : x0 + bayPitch * (PH + 0.5) + pierW / 2 + (n % 2 ? 1 : -1) * bayW / 4, y: downY + 0.35, z0: n < 12 ? zE + 0.3 : faceZ + 5.9, len: 8 + Math.random() * 5, sp: 0.24 + Math.random() * 0.195, ph: Math.random(), sc: (0.236 + Math.random() * 0.225) * (0.55 + Math.random() * 0.7) });
          // bọt bắn vọt ở mố nhảy: r = bán kính icosahedron cũ (gộp vào scale)
          for (let n = 0; n < 24; n++) sprayBits.push({ im: sprayIM, id: n, x: ox + (Math.random() - 0.5) * 14, z: toeZ + 0.3 + Math.random() * 2.2, y0: downY, h: 0.5 + Math.random() * 0.9, sp: 0.7 + Math.random() * 0.6, ph: Math.random(), r: 0.14 + Math.random() * 0.15 });
          // ---- hơi nước mù ở chân đập ----
          for (let m = 0; m < 3; m++) { const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistMap, color: 0xE2D6C0, transparent: true, opacity: 0.3, depthWrite: false })); sprite.position.set(ox + (m - 1) * 7, downY + 1.0, toeZ + 1.6); sprite.scale.set(11, 7, 1); sprite.renderOrder = 4; sprite.visible = false; g.add(sprite); damMist.push({ s: sprite, x: sprite.position.x, y: sprite.position.y, z: sprite.position.z, wx: dcx, wz: dz, ph: m * 2.1 }); }   // màn hơi bị gió đẩy lệch (cập nhật trong vòng lặp)
          // ---- CẦU VỒNG 7 MÀU THÁC NƯỚC (Spillway Rainbow Arc) ----
          const rainbowGroup = new THREE.Group(); rainbowGroup.userData.noBake = true;   // opacity từng cung animate riêng
          rainbowGroup.position.set(ox, downY + 3.0, toeZ + 2.6);
          rainbowGroup.rotation.y = -0.35; g.add(rainbowGroup); damRainbow = rainbowGroup; rainbowGroup.userData.baseY = rainbowGroup.position.y;
          const rainbowCols = [0xff2222, 0xff7f00, 0xffee00, 0x22ff55, 0x0088ff, 0x4b0082, 0x9400d3];
          for (let i = 0; i < rainbowCols.length; i++) {
            const r = 5.2 + i * 0.14;
            const geo = new THREE.RingGeometry(r, r + 0.13, 32, 1, 0, Math.PI);
            const mat = new THREE.MeshBasicMaterial({ color: rainbowCols[i], transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
            const arc = new THREE.Mesh(geo, mat); rainbowGroup.add(arc); rainbowMats.push(mat);
          }
          bakeStatic(g);   // gộp ~100 mesh tĩnh của đập (tường·trụ pin·lan can·cẩu trục·tháp lấy nước) — nước/cầu vồng noBake giữ động
        })();

        // MỖI KHUNG (loop/main-loop.js, sau rô-to tua-bin): nước tràn mặt ogee, màn nước, bọt bể tiêu năng, tia xả + bụi nước hạ lưu theo gió — dời nguyên văn khỏi vòng lặp (G 01/11)
        function damWaterTick(t) {
          const dox = damMist.length ? damMist[0].wx : 0, doz = damMist.length ? damMist[0].wz : 0;
          for (const f of fallBlocks) {   // bọt/màn nước = instance: compose ma trận vào scratch rồi setMatrixAt (85 mesh lẻ → 4 draw call)
            const p = (t * 0.16 + f.ph) % 1, P = f.path;
            if (p < 0.62) {   // trượt bám mặt tràn ogee (world/hydro-dam.js path: dãy (z, y) từ mép cửa van tới đáy bể), nghiêng theo độ dốc mặt
              const u = (p / 0.62) ** 1.35 * (P.length - 1), i = Math.min(P.length - 2, u | 0), k = u - i, A = P[i], B = P[i + 1];
              _dmP.set(f.x, A[1] + (B[1] - A[1]) * k, A[0] + (B[0] - A[0]) * k);
              _dmQ.setFromEuler(_dmE.set(Math.atan2(A[1] - B[1], B[0] - A[0]), 0, 0)); _dmS.set(1, 1 + k * 0.1, 1);
            } else if (!f.foam) {   // màn nước: trườn phẳng dưới mặt nước hạ lưu về ngưỡng cuối, mỏng dần
              const k = (p - 0.62) / 0.38; _dmP.set(f.x, downY - 0.32, f.toeZ + 0.3 + k * 4.8); _dmQ.identity(); _dmS.set(1, Math.max(0.05, 0.45 * (1 - k)), 1);
            } else {   // bọt: nước nhảy trong bể tiêu năng: cuộn lên mặt nước hạ lưu rồi trôi về ngưỡng cuối, gió làm dạt bọt
              const k = (p - 0.62) / 0.38, smK = Math.sin(k * Math.PI * 0.5);
              windAt(dox + f.x, downY + 1, doz + f.toeZ, 1, _plA);
              _dmP.set(f.x + _plA.x * k * 0.4 + Math.sin(f.ph * 40 + k * 6) * 0.3, downY - 0.25 + Math.sin(k * Math.PI) * 0.75, f.toeZ + 0.4 + k * 4.6 + _plA.z * k * 0.4);
              _dmQ.setFromEuler(_dmE.set(-0.6 + k * 1.4, k * 2, 0)); _dmS.set(1 + smK * 0.3, 1 - smK * 0.35, 1 + smK * 0.3);
            }
            f.im.setMatrixAt(f.id, _dmM.compose(_dmP, _dmQ, _dmS));
          }
          _dmQ.identity();
          // bọt mặt nước trôi lệch theo gió mặt nước
          for (const j of tailJets) { const p = (t * (j.sp * 0.5) + j.ph) % 1; windAt(dox + j.x, j.y, doz + j.z0 + p * j.len, 0.5, _plA); _dmP.set(j.x + Math.sin(t * 1.0 + j.ph * 6) * 0.5 + _plA.x * p * 1.2, j.y + Math.sin(p * 3.14159) * 0.25, j.z0 + p * j.len + _plA.z * p * 1.2); _dmS.setScalar(j.sc * Math.max(0.08, Math.sin(p * 3.14159))); j.im.setMatrixAt(j.id, _dmM.compose(_dmP, _dmQ, _dmS)); }   // nước xả hạ lưu chậm 1/2
          // màn hơi chân đập & bụi nước: bị gió (độ cao ~3 đv, gồm cơn giật) đẩy lệch; đập không xoay nên trục cục bộ = thế giới
          for (const s of sprayBits) { const a = (t * (s.sp * 0.5) + s.ph) % 1, kk = Math.sin(a * 3.14159); windAt(dox + s.x, s.y0 + kk * s.h, doz + s.z, 1 + kk * s.h, _plA); _dmP.set(s.x + Math.sin(t * 1.2 + s.ph * 7) * 0.3 + _plA.x * a * 1.4, s.y0 + kk * s.h + _plA.y * a * 0.5, s.z + _plA.z * a * 1.4); _dmS.setScalar(s.r * (0.5 + 0.7 * kk)); s.im.setMatrixAt(s.id, _dmM.compose(_dmP, _dmQ, _dmS)); }
          for (const im of damIMs) im.instanceMatrix.needsUpdate = true;
        }

        // MỖI KHUNG (loop/main-loop.js, sau mặt nước): cầu vồng bụi nước chân đập theo độ cao mặt trời, mây, sét, gió — dời nguyên văn khỏi vòng lặp (G 01/11)
        function damRainbowTick() {
          if (rainbowMats.length && damRainbow) {
            // CẦU VỒNG = ánh nắng khúc xạ–phản xạ trong giọt bụi nước, cung tròn 42° quanh điểm ĐỐI MẶT TRỜI: chỉ có khi có nắng trực tiếp,
            // đậm nhất lúc mặt trời thấp (sáng/chiều), nhạt dần khi mặt trời lên cao và biến mất khi cao hơn 42° (đỉnh cung chìm dưới chân trời);
            // mây dày che nắng thì nhạt. Mặt cung luôn quay về phía mặt trời, tâm cung hạ thấp khi mặt trời lên cao (cung còn nửa vòng nhỏ hơn).
            const e = Math.asin(Math.max(-1, Math.min(1, sunElevSin))) * 180 / Math.PI, sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
            const w = liveWeather.state, cur = w.fresh ? w.data?.current : null, cloud = cur && Number.isFinite(cur.cloud_cover) ? cur.cloud_cover / 100 : 0.3;
            const vis = sm(0, 4, e) * (1 - sm(30, 42, e)) * (1 - 0.85 * cloud) * (w.thunder ? 0.3 : 1) * (0.7 + 0.3 * Math.min(1, sceneWind.k + 0.4));
            for (const mat of rainbowMats) mat.opacity = 0.45 * vis;
            damRainbow.visible = vis > 0.01;
            const sx = _wp.x, sz = _wp.z; if (Math.hypot(sx, sz) > 1e-3) damRainbow.rotation.y = Math.atan2(sx, sz);
            damRainbow.position.y = damRainbow.userData.baseY - 5.6 * Math.max(0, e) / 42;
          }
        }
