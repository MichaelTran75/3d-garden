        // ===== KỸ SƯ NGỦ (G 17/10 "do research and change engineer sleeping motion" + ảnh LEGO nằm nghiêng đắp chăn) =====
        //  Nghiên cứu: người lớn ngủ NGHIÊNG nhiều nhất (Skarpsno et al. 2017, gia tốc kế đo tại nhà: nghiêng ~54%, ngửa ~38%, sấp ~7% thời gian trên giường),
        //  trở mình ~1,6 lần/giờ (thường lúc chuyển giai đoạn ngủ); thở chậm đều 12–14 lần/phút khi ngủ sâu (NREM, nửa đầu đêm), nhanh và không đều hơn
        //  khi REM (chu kỳ ~90 phút, REM dài dần về sáng — cơ duỗi, chân tay giật nhẹ); xen giữa là cử động nhỏ: co duỗi chân, rúc gối, đổi chỗ tay.
        //  Dáng NẰM NGHIÊNG: co gối (chân dưới gập ít, chân trên gập nhiều hơn, chìa ra trước), lưng hơi cong, tay dưới đưa ra trước gần mặt, tay trên
        //  gác lên chăn trước bụng · NẰM NGỬA: gối hơi co, 2 tay đặt trên bụng. Mắt nhắm (mặt in "ngủ"), chăn đỏ trải đắp tới vai: lưới vải phủ theo
        //  khối thân / đùi / cẳng chân (mặt trên của từng khối, làm mềm), mép trước buông rủ xuống thành giường, phồng xẹp theo nhịp thở.
        //  Lịch tư thế: mỗi đêm 1 dãy ngẫu nhiên cố định theo ngày (35–70 phút/lần, bắt đầu nằm nghiêng quay mặt ra phòng) — mở trang giữa đêm vẫn đúng
        //  tư thế; trở mình mượt 4 s (lăn quanh trục thân, chân tay qua dáng giữa, thân nhấc lên rồi hạ xuống) ----
        const SLEEP_POSE = {   // phi: lăn quanh trục thân (0 nghiêng TRÁI mặt ra phòng · −π/2 ngửa · −π nghiêng PHẢI mặt vào vách); [chân/tay phải, trái]; tay: điểm đặt bàn tay (hệ kỹ sư)
          L: { phi: 0, hip: [-0.95, -0.5], knee: [1.3, 0.8], curl: 0.2, tilt: -0.12, side: 1, dz: -0.13, hand: [[0.26, 1.42, 0.44], [0.12, 2.02, 0.3]] },
          B: { phi: -Math.PI / 2, hip: [-0.2, -0.12], knee: [0.38, 0.26], curl: 0.03, tilt: 0, side: 0, dz: 0, hand: [[-0.08, 1.4, 0.24], [0.1, 1.5, 0.23]] },
          R: { phi: -Math.PI, hip: [-0.5, -0.95], knee: [0.8, 1.3], curl: 0.2, tilt: 0.12, side: 1, dz: 0.13, hand: [[-0.12, 2.02, 0.3], [-0.26, 1.42, 0.44]] }
        };
        const SLEEP = { day: -1, plan: null, blanket: null, H: null, _v: new THREE.Vector3(), _w: new THREE.Vector3() };
        function sleepPlan(day) {   // [giờ bắt đầu (0–33 = 21:00 → 06:00 hôm sau tính tiếp 24+), tư thế]
          let a = (day * 2654435761) >>> 0; const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let z = Math.imul(a ^ a >>> 15, 1 | a); z = (z + Math.imul(z ^ z >>> 7, 61 | z)) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; };
          const out = [[21, 'L']]; let h = 21;
          while (h < 30.2) { h += (35 + 35 * rnd()) / 60; const prev = out[out.length - 1][1], r = rnd(); out.push([h, prev === 'B' ? (r < 0.55 ? 'L' : 'R') : r < 0.5 ? 'B' : prev === 'L' ? 'R' : 'L']); }   // nghiêng ~2/3 thời gian; nghiêng ↔ nghiêng lăn qua ngửa
          return out;
        }
        function sleepBlend(A, B, s, q) {   // tư thế giữa A → B (s: tiến độ 0–1), q: mức "dáng giữa" lúc đang lăn (duỗi bớt chân, tay thu về thân)
          const L = (a, b) => a + (b - a) * s, N = SLEEP_POSE.B;
          const mix = (a, b, n) => L(a, b) * (1 - q) + n * q;
          return { phi: L(A.phi, B.phi), hip: [0, 1].map(i => mix(A.hip[i], B.hip[i], N.hip[i])), knee: [0, 1].map(i => mix(A.knee[i], B.knee[i], N.knee[i])), curl: L(A.curl, B.curl), tilt: L(A.tilt, B.tilt),
            side: L(A.side, B.side), dz: L(A.dz, B.dz), hand: [0, 1].map(i => [0, 1, 2].map(k => mix(A.hand[i][k], B.hand[i][k], N.hand[i][k]))) };
        }
        // mỗi khung khi ngủ (trước engPoseEnd): đích khớp, gốc nằm trên nệm, tay đặt theo điểm, thở, cử động nhỏ, mặt ngủ
        function engSleepTick(e, dt, t, hh) {
          const I = caravanObj.userData.interior, S = e.g.scale.x, night = hh >= 21 ? hh : hh + 24, day = Math.floor(Date.now() / 864e5) - (hh < 12 ? 1 : 0);   // 1 dãy tư thế cho cả đêm (qua nửa đêm vẫn là đêm hôm trước)
          if (SLEEP.day !== day) { SLEEP.day = day; SLEEP.plan = sleepPlan(day); }
          const P = SLEEP.plan; let i = 0; while (i + 1 < P.length && P[i + 1][0] <= night) i++;
          const cur = SLEEP_POSE[P[i][1]], prev = SLEEP_POSE[i ? P[i - 1][1] : P[i][1]], k = Math.min(1, (night - P[i][0]) * 900);   // trở mình 4 s
          const s = k * k * (3 - 2 * k), q = Math.sin(Math.PI * k) * 0.7, Q = k < 1 ? sleepBlend(prev, cur, s, q) : cur;
          // nhịp thở: ngủ sâu nửa đầu đêm 12/phút đều · REM (25 phút cuối mỗi chu kỳ 90 phút, dài dần về sáng) 15/phút hơi không đều
          const cyc = ((night - 21) * 60) % 90, rem = cyc > 90 - 18 - 4 * (night - 21) / 9 * 2, f = rem ? 0.25 + 0.03 * Math.sin(t * 0.37) : 0.2;
          SLEEP.ph = (SLEEP.ph || 0) + dt * f * TAU; const br = Math.sin(SLEEP.ph); SLEEP.br = br;
          // cử động nhỏ ~4 phút/lần (2 s): co thêm gối trên, dịch tay trên, rúc đầu
          const mv = (t % 240) < 2 ? Math.sin(Math.PI * (t % 240) / 2) : 0, mk = Math.floor(t / 240) % 3;
          // gốc: chân ở cuối giường, đầu gác gối; nằm nghiêng thì trục thân cao hơn mặt nệm nửa bề ngang thân (0,25), ngửa nửa bề dày (0,15); lăn nhấc thân lên
          const sp = I.sleepPosition, side = Math.abs(Math.cos(Q.phi));
          e.g.position.set(sp[0], I.bedTop + S * (0.15 + 0.1 * side) + 0.06 * q, I.bed.center[1] + Q.dz);
          e.g.rotation.set(Q.phi, 0, -Math.PI / 2 + 0.05);
          const up = (mk === 0 ? 0.25 : 0) * mv;
          for (let j = 0; j < 2; j++) { e.legs[j].rotation.set(Q.hip[j] - (j === (Q.phi < -1.6 ? 1 : 0) ? up : 0), 0, 0); e.knees[j].rotation.x = Q.knee[j] + (j === (Q.phi < -1.6 ? 1 : 0) ? up * 1.4 : 0); }
          e.arms[0].rotation.x = e.arms[1].rotation.x = -0.6;
          e.head.rotation.set(0.1 + 0.03 * br, (mk === 2 ? 0.25 : 0) * mv, Q.tilt);
          e.spineT = { x: Q.curl + 0.012 * br, y: 0 };
          // REM: giật nhẹ cổ chân / bàn tay mỗi 6–14 s
          const tw = rem && (t % 9.7) < 0.22 ? Math.sin(Math.PI * (t % 9.7) / 0.22) : 0;
          e.ankles[0].rotation.x = 0.25 + 0.2 * tw; e.ankles[1].rotation.x = 0.25;
          const R = e.reachT || (e.reachT = [null, null]), H = SLEEP.H || (SLEEP.H = [new THREE.Vector3(), new THREE.Vector3()]);
          for (let j = 0; j < 2; j++) { const h = Q.hand[j]; H[j].set(h[0], h[1] + 0.015 * br + (mk === 1 && j === 0 ? 0.08 * mv : 0) + (j === 1 ? 0.03 * tw : 0), h[2]); e.g.localToWorld(H[j]); R[j] = H[j]; }
          const U = e.g.userData; if (U.face && U.face.mat.map !== U.face.sleep) { U.face.mat.map = U.face.sleep; U.face.mat.needsUpdate = true; }
          if (U.torso) { U.torso.scale.set(1 + 0.012 * br, 1, 1 + 0.03 * br); }
          if (I.duvet.visible) I.duvet.visible = false;
        }
        // cuối khung khi ngủ (sau IK tay): chăn phủ theo thân đã hiển thị
        function engSleepPost(e) {
          const I = caravanObj.userData.interior, B = SLEEP.blanket || (SLEEP.blanket = sleepBlanket(I));
          B.mesh.visible = true; e.g.updateMatrixWorld(true);
          const S = e.g.scale.x, v = SLEEP._v, side = Math.abs(Math.cos(e.g.rotation.x)), lp = (o) => caravanObj.worldToLocal(o.getWorldPosition(new THREE.Vector3()));
          const hipC = lp(e.legs[0]).add(lp(e.legs[1])).multiplyScalar(0.5), shC = lp(e.arms[0]).add(lp(e.arms[1])).multiplyScalar(0.5);
          const brk = 1 + 0.035 * (SLEEP.br || 0);
          const caps = [[hipC, shC, S * (0.15 + 0.1 * side) * brk, S * (0.27 - 0.12 * side)]];   // thân: [A, B, nửa cao, nửa rộng]
          for (let j = 0; j < 2; j++) {   // chân khối vuông 0,26 × 0,27: góc khối cách trục 0,19 ⇒ bán kính phủ 0,19 · giày: cổ chân → mũi giày
            const kn = lp(e.knees[j]), an = lp(e.ankles[j]), toe = caravanObj.worldToLocal(e.ankles[j].localToWorld(new THREE.Vector3(0, -0.04, 0.22)));
            caps.push([lp(e.legs[j]), kn, 0.19 * S, 0.19 * S], [kn, an, 0.185 * S, 0.185 * S], [an, toe, 0.13 * S, 0.15 * S]);
          }
          const { NX, NZ, x0, z0, zF, Wb, OV } = B, pos = B.geo.attributes.position, hgt = B.h, x1 = shC.x + 0.04;
          for (let iz = 0; iz <= NZ; iz++) for (let ix = 0; ix <= NX; ix++) {
            const x = x0 + (x1 - x0) * ix / NX, sArc = (Wb + OV) * iz / NZ, z = z0 + Math.min(sArc, Wb);
            let y = I.bedTop + 0.018;
            for (const [A, C, rv, rh] of caps) {
              const dx = C.x - A.x, dz = C.z - A.z, L2 = dx * dx + dz * dz || 1e-6, u = Math.max(0, Math.min(1, ((x - A.x) * dx + (z - A.z) * dz) / L2));
              const px = A.x + dx * u - x, pz = A.z + dz * u - z, d = Math.hypot(px, pz);
              if (d < rh + 0.07) { const yy = A.y + (C.y - A.y) * u + (rv + 0.02) * Math.sqrt(Math.max(0, 1 - Math.min(1, d / (rh + 0.07)) ** 2)) + 0.025; if (yy > y) y = yy; }
            }
            hgt[iz * (NX + 1) + ix] = y;
          }
          for (let pass = 0; pass < 2; pass++) for (let iz = 1; iz < NZ; iz++) for (let ix = 1; ix < NX; ix++) { const n = iz * (NX + 1) + ix; hgt[n] = 0.4 * hgt[n] + 0.15 * (hgt[n - 1] + hgt[n + 1] + hgt[n - NX - 1] + hgt[n + NX + 1]); }
          for (let iz = 0; iz <= NZ; iz++) for (let ix = 0; ix <= NX; ix++) {
            const n = iz * (NX + 1) + ix, x = x0 + (x1 - x0) * ix / NX, sArc = (Wb + OV) * iz / NZ, over = sArc - Wb;
            if (over > 0) { const ye = hgt[Math.round(Wb / (Wb + OV) * NZ) * (NX + 1) + ix]; pos.setXYZ(n, x, ye - over, zF + 0.012 + 0.01 * Math.sin(ix * 1.7)); }   // mép trước buông rủ, gợn nếp
            else pos.setXYZ(n, x, hgt[n], z0 + sArc);
          }
          pos.needsUpdate = true; B.geo.computeVertexNormals(); B.geo.computeBoundingSphere();
        }
        function sleepBlanket(I) {   // lưới chăn (đv xe): dọc giường × ngang (nệm + phần rủ mép trước)
          const NX = 26, NZ = 16, b = I.bed, x0 = b.center[0] - b.size[0] / 2 + 0.05, z0 = b.center[1] - b.size[1] / 2 + 0.04, zF = b.center[1] + b.size[1] / 2 - 0.02, Wb = zF - z0, OV = 0.2;
          const geo = new THREE.BufferGeometry(), idx = [];
          geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array((NX + 1) * (NZ + 1) * 3), 3));
          for (let iz = 0; iz < NZ; iz++) for (let ix = 0; ix < NX; ix++) { const a = iz * (NX + 1) + ix; idx.push(a, a + NX + 1, a + 1, a + 1, a + NX + 1, a + NX + 2); }
          geo.setIndex(idx);
          const mat = I.duvetMat.clone(); mat.side = THREE.DoubleSide;
          const mesh = new THREE.Mesh(geo, mat); mesh.name = 'Chăn đắp khi ngủ'; mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; mesh.userData.noBatch = mesh.userData.noBake = true; mesh.visible = false;
          caravanObj.add(mesh);
          return { mesh, geo, NX, NZ, x0, z0, zF, Wb, OV, h: new Float32Array((NX + 1) * (NZ + 1)) };
        }
        function engSleepEnd(e) {   // dậy (06:00) hoặc rời giường: mặt thức, thân thở về 1, chăn gấp lại cuối giường
          const I = caravanObj.userData.interior, U = e.g.userData;
          if (U.face && U.face.mat.map !== U.face.awake) { U.face.mat.map = U.face.awake; U.face.mat.needsUpdate = true; }
          if (U.torso) U.torso.scale.set(1, 1, 1);
          e.ankles[0].rotation.x = e.ankles[1].rotation.x = 0;
          if (SLEEP.blanket) SLEEP.blanket.mesh.visible = false;
          I.duvet.visible = true;
        }
