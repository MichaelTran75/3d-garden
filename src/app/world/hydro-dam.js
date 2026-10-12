        // ---- DETAILED hydro power station (spans the river) ----
        const fallBlocks = [], tailJets = [], sprayBits = [], rainbowMats = [], damIMs = [], damMist = [];
        let damRainbow = null;   // cầu vồng chân đập (đậm nhạt theo mặt trời)
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
          const wall = bx(Wd, Hd, Zd, concreteMat); wall.position.set(ox, Hd / 2, 0); g.add(wall);                  // tường đập bắc qua sông
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
            const endWidth = side < 0 ? 3.2 : deckWidth, endZ = side < 0 ? -3 : 0;
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
          const nBays = 5, Wf = Wd, x0 = ox - Wf / 2, bayPitch = Wf / nBays, pierW = 1.5, bayW = bayPitch - pierW;
          const faceZ = Zd / 2, sillY = downY + 0.3, gateTopY = Hd - 0.4;
          // ---- trụ pin phân khoang (nBays+1) nhô ra hạ lưu, mũi bo tròn ----
          for (let p = 0; p <= nBays; p++) {
            const px = x0 + bayPitch * p, pierH = gateTopY - sillY + 1.0;
            const pier = bx(pierW, pierH, 3.0, concreteMat); pier.position.set(px, sillY + pierH / 2, faceZ + 1.0); g.add(pier);
            const cap = bx(pierW + 0.3, 0.5, 3.4, concreteDark); cap.position.set(px, sillY + pierH + 0.05, faceZ + 1.0); g.add(cap);
          }
          // ---- mỗi khoang: máng xả nghiêng + cửa van cung cam + mố nhảy hất nước ----
          const midBays = [1, 2, 3];   // chỉ giữ thiết kế cửa van ở 3 khoang giữa
          for (const bI of midBays) {
            const cx = x0 + bayPitch * (bI + 0.5);
            const chuteTop = gateTopY - 0.4, chuteBot = sillY + 0.2, dy = chuteTop - chuteBot, dz = 3.2, len = Math.hypot(dy, dz), ang = Math.atan2(dy, dz);
            const chute = bx(bayW, 0.4, len, concreteMat, true, true, lineDark); chute.rotation.x = ang; chute.position.set(cx, (chuteTop + chuteBot) / 2, faceZ + dz / 2 + 0.1); g.add(chute);
            const gate = bx(bayW, 2.6, 0.3, warningMat, true, true, lineDark); gate.rotation.x = -0.32; gate.position.set(cx, gateTopY - 0.9, faceZ + 0.55); g.add(gate);   // cửa van cung (tainter)
            for (let r = 0; r < 2; r++) { const rib = bx(bayW + 0.1, 0.18, 0.42, gateMat, true, false); rib.rotation.x = -0.32; rib.position.set(cx, gateTopY - 0.4 - r * 1.2, faceZ + 0.62); g.add(rib); }   // gân ngang
            for (const sx of [-1, 1]) { const arm = bx(0.16, 2.4, 0.16, metalMat, true, false); arm.rotation.x = 0.5; arm.position.set(cx + sx * bayW / 2, gateTopY - 0.6, faceZ + 1.2); g.add(arm); }   // tay cung + gối quay
            // ---- mố nhảy (flip bucket) tiêu năng hất nước — nhỏ gọn mỏng ở chân đập dưới mỗi khoang ----
            const bucketLen = 0.88, bucketThick = 0.16, bucketLipY = chuteBot + 0.16;
            const bucket = bx(bayW - 0.08, bucketThick, bucketLen, concreteDark, true, true, lineDark);
            bucket.rotation.x = -0.44;   // góc hất cong ngược lên trên của mố nhảy
            bucket.position.set(cx, bucketLipY, faceZ + dz + 0.38); g.add(bucket);
            for (const sx of [-1, 1]) {
              const bWall = bx(0.12, 0.46, bucketLen + 0.08, concreteMat, true, true, lineDark);
              bWall.position.set(cx + sx * (bayW / 2 - 0.06), bucketLipY + 0.12, faceZ + dz + 0.38); g.add(bWall);
            }
          }
          // ---- cẩu trục (gantry crane) cam chạy trên đỉnh đập ----
          (function gantry() {
            const cg = new THREE.Group(); cg.position.set(ox - 7, Hd + 0.6, 0); g.add(cg);
            const ez = Zd / 2 + 0.7, legH = 2.4;
            for (const lz of [-ez, ez]) for (const lx of [-1.4, 1.4]) { const leg = bx(0.28, legH, 0.28, warningMat, true, true, lineDark); leg.position.set(lx, legH / 2, lz); cg.add(leg); }
            for (const lx of [-1.4, 1.4]) { const beam = bx(0.3, 0.3, ez * 2 + 0.6, warningMat, true, false); beam.position.set(lx, legH, 0); cg.add(beam); }
            const topBeam = bx(3.2, 0.32, 0.6, warningMat, true, true, lineDark); topBeam.position.set(0, legH + 0.3, 0); cg.add(topBeam);
            const trolley = bx(0.9, 0.6, 0.9, gateMat, true, true, lineDark); trolley.position.set(0, legH - 0.1, 0); cg.add(trolley);
            const hook = bx(0.12, 1.4, 0.12, metalMat, true, false); hook.position.set(0, legH - 1.0, 0); cg.add(hook);
          })();
          for (let s = -1; s <= 1; s += 2) {
            const it = bx(1.5, Hd * 0.5, 1.5, concreteMat); it.position.set(ox + s * 9, Hd * 0.6, -Zd / 2 - 0.9); g.add(it);
            const cap = bx(1.75, 0.4, 1.75, concreteDark); cap.position.set(ox + s * 9, Hd * 0.85, -Zd / 2 - 0.9); g.add(cap);
            const tr = cyl(0.1, 0.1, 1.4, metalMat, true, false, null, 8); tr.position.set(ox + s * 9, Hd + 0.7, -Zd / 2 - 0.9); g.add(tr);
          }    // tháp lấy nước + cột
          // ---- MÀN NƯỚC TRÀN + NƯỚC XẢ + BỌT MỐ NHẢY — 85 mesh lẻ gộp thành 4 InstancedMesh (ma trận per-instance ghi lại mỗi frame trong loop) ----
          const sheetIM = new THREE.InstancedMesh(new THREE.BoxGeometry(bayW * 0.84, 0.75, 0.38), sheetMat, 30);
          const foamIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.26, 0), foamMat, 15);
          const tailIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), foamMat, 16);    // bán kính 1 → cỡ thật nằm trong scale per-instance
          const sprayIM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), foamMat, 24);
          for (const im of [sheetIM, foamIM, tailIM, sprayIM]) { im.frustumCulled = false; g.add(im); damIMs.push(im); }   // instance chạy khắp mặt đập → tắt culling theo bounding gốc
          let _si = 0, _fi = 0;
          for (const bI of midBays) {
            const cx = x0 + bayPitch * (bI + 0.5);
            const chuteTop = gateTopY - 0.4, chuteBot = sillY + 0.2;
            for (let n = 0; n < 15; n++) {
              const isFoam = n % 3 === 0;
              fallBlocks.push({ im: isFoam ? foamIM : sheetIM, id: isFoam ? _fi++ : _si++, x: cx, chuteTop, chuteBot, z0: faceZ + 0.1, dz: 3.1, ph: n / 15 + bI * 0.1 });
            }
          }
          // nước xả hạ lưu (tailrace foam): sc = bán kính icosahedron cũ × hệ số cũ (gộp vào scale)
          for (let n = 0; n < 16; n++) tailJets.push({ im: tailIM, id: n, x: ox + (Math.random() - 0.5) * 7.5, y: downY + 0.35, z0: dsZ + 0.9, len: 8 + Math.random() * 5, sp: 0.24 + Math.random() * 0.195, ph: Math.random(), sc: (0.236 + Math.random() * 0.225) * (0.55 + Math.random() * 0.7) });
          // bọt bắn vọt ở mố nhảy: r = bán kính icosahedron cũ (gộp vào scale)
          for (let n = 0; n < 24; n++) sprayBits.push({ im: sprayIM, id: n, x: ox + (Math.random() - 0.5) * 14, z: Zd / 2 + 3.2 + Math.random() * 2.5, y0: sillY + 0.4, h: 1.5 + Math.random() * 2.2, sp: 0.7 + Math.random() * 0.6, ph: Math.random(), r: 0.14 + Math.random() * 0.15 });
          // ---- hơi nước mù ở chân đập ----
          for (let m = 0; m < 3; m++) { const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistMap, color: 0xE2D6C0, transparent: true, opacity: 0.3, depthWrite: false })); sprite.position.set(ox + (m - 1) * 7, downY + 1.4, Zd / 2 + 2.2); sprite.scale.set(11, 7, 1); sprite.renderOrder = 4; g.add(sprite); damMist.push({ s: sprite, x: sprite.position.x, y: sprite.position.y, z: sprite.position.z, wx: dcx, wz: dz, ph: m * 2.1 }); }   // màn hơi bị gió đẩy lệch (cập nhật trong vòng lặp)
          // ---- CẦU VỒNG 7 MÀU THÁC NƯỚC (Spillway Rainbow Arc) ----
          const rainbowGroup = new THREE.Group(); rainbowGroup.userData.noBake = true;   // opacity từng cung animate riêng
          rainbowGroup.position.set(ox, downY + 3.8, Zd / 2 + 4.2);
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

