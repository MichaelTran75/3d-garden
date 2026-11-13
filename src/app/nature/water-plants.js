        // ---- CÂY THUỶ SINH QUANH ĐẦM SEN (vùng cá koi hồ dưới) ----
        //  Mọc chìm, rễ ở bùn đáy: rong lá hẹ (Vallisneria — dải lá dài, dài hơn mực nước thì ngả nằm theo dòng dưới mặt nước), rong đuôi chồn (Ceratophyllum — thân + vòng lá kim),
        //  rau dừa đỏ (Ludwigia — lá mọc đối, ngọn đỏ), ráy nước (Cryptocoryne — hoa thị lá mác sát đáy), cỏ lá ngắn làm nền quanh gốc
        //  · 1 lưới + 1 vật liệu Lambert màu đỉnh; đung đưa ở shader đỉnh — aSw = (độ mềm m, pha, số cụm, cao trên gốc m); sóng chạy từ gốc lên ngọn
        //  · mỗi cụm báo cho cá qua worldSee('fish').spot (animals/fish/cruise.js): cá ghé rỉa (nudge ⇒ uNudge[cụm] rung rồi tắt), lách qua khi bơi ngang tầng; lá sen nổi ghi kind 'pad' (cá nghỉ dưới bóng lá)
        //  · mặt nước mờ dần theo độ sâu (0,5 → 0,8): cụm đặt ở thềm sâu 0,6–1,2 m mới thấy rõ, màu lá đậm hơn màu thật để còn tương phản sau lớp nước
        //  · đỉnh cây ≤ lakeY − 0,03 (dưới đáy gợn sóng): không chọc qua mặt nước
        const waterPlants = (() => {
          const rnd = mulberry32(7741), C0x = X0 + 73, C0z = Z0 + 113, col = h => new THREE.Color(h), NCL = 20, TOP = lakeY - 0.03;
          const pos = [], nor = [], colr = [], sw = [], idx = [], clumps = [], FW = worldSee('fish'), spot = S => { if (FW) FW.spot(S); }, _c = new THREE.Color(), _f = { x: 0, z: 0 }, _sp = [];
          const bedAt = (x, z) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return waterCell(i, j) ? riverBedY(i, j) : null; };
          let cid = 0, cph = 0, topY = -1e9;
          function vert(x, y, z, nx, nz, c, flex, s) {   // pháp tuyến ngả lên trời: lá dựng đứng vẫn sáng như đáy hồ
            if (y > TOP) y = TOP; pos.push(x, y, z); nor.push(nx * 0.6, 0.8, nz * 0.6); colr.push(c.r, c.g, c.b); sw.push(flex, cph, cid, s);
            if (y > topY) topY = y; return pos.length / 3 - 1;
          }
          // sống lá / thân: dài L, N đốt, ngả về hướng a; cl = phần đứng lúc đầu, cap = trần cao (dài hơn thì ngả nằm dần — đỉnh ≈ 0,88 cap)
          function spine(x, y, z, L, N, a, cl, cap) {
            const ds = L / N, ca = Math.cos(a), sa = Math.sin(a); let h = 0, yy = 0; _sp.length = 0; _sp.push({ x, y, z, s: 0 });
            for (let i = 1; i <= N; i++) { const v = Math.min(cl, 1.8 * Math.exp(-1.8 * (i - 0.5) * ds / cap)); yy += v * ds; h += Math.sqrt(1 - v * v) * ds; _sp.push({ x: x + ca * h, y: y + yy, z: z + sa * h, s: i * ds }); }
            return _sp;
          }
          // dải lá dọc sống: form 0 = dải (rong lá hẹ, cỏ, thân) · 1 = phiến mác có cuống (ráy nước); tw = xoắn dọc lá; K = độ mềm
          function ribbon(x, y, z, L, w, a, cl, cap, form, c0, c1, K, tw, shade) {
            const N = Math.max(3, Math.min(12, Math.ceil(L / 0.15))), S = spine(x, y, z, L, N, a, cl, cap); let pa = -1, pb = -1;
            for (let i = 0; i <= N; i++) {
              const u = i / N, p = S[i], ta = a + tw * u, wx = -Math.sin(ta), wz = Math.cos(ta); let ww;
              if (form) { const b = (u - 0.28) / 0.72; ww = u < 0.28 ? 0.1 : 0.1 + 0.9 * Math.pow(Math.sin(Math.PI * Math.pow(b, 0.75)), 0.8); }
              else ww = Math.min(1, 0.4 + u * 5) * (u > 0.8 ? 1 - (u - 0.8) / 0.2 * 0.75 : 1);
              ww *= w * 0.5; _c.copy(c0).lerp(c1, Math.pow(u, 0.8)).multiplyScalar(shade);
              const fx = K * Math.pow(u, 1.6) * L, ia = vert(p.x - wx * ww, p.y, p.z - wz * ww, Math.cos(ta), Math.sin(ta), _c, fx, p.s), ib = vert(p.x + wx * ww, p.y, p.z + wz * ww, Math.cos(ta), Math.sin(ta), _c, fx, p.s);
              if (i) idx.push(pa, pb, ia, pb, ib, ia); pa = ia; pb = ib;
            }
          }
          // lá nhỏ gắn trên thân tại p: hướng az, ngóc el, dài l, rộng w (w = 0: lá kim 3 đỉnh; w > 0: lá hình thoi 4 đỉnh); rung theo thân (fx) + ngọn lá hơn chút
          function leaflet(p, az, el, l, w, c0, c1, fx) {
            const ce = Math.cos(el), dx = Math.cos(az) * ce, dz = Math.sin(az) * ce, dy = Math.sin(el), wx = -Math.sin(az), wz = Math.cos(az), nx = Math.cos(az), nz = Math.sin(az);
            if (!w) {
              const a = vert(p.x - wx * 0.01, p.y, p.z - wz * 0.01, nx, nz, c0, fx, p.s), b = vert(p.x + wx * 0.01, p.y, p.z + wz * 0.01, nx, nz, c0, fx, p.s);
              idx.push(a, b, vert(p.x + dx * l, p.y + dy * l, p.z + dz * l, nx, nz, c1, fx + 0.01, p.s + dy * l)); return;
            }
            const a = vert(p.x, p.y, p.z, nx, nz, c0, fx, p.s), m = 0.45 * l, h = w * 0.5, e = vert(p.x + dx * l, p.y + dy * l, p.z + dz * l, nx, nz, c1, fx + 0.012, p.s + dy * l);
            const b = vert(p.x + dx * m - wx * h, p.y + dy * m, p.z + dz * m - wz * h, nx, nz, c1, fx + 0.006, p.s + dy * m), c = vert(p.x + dx * m + wx * h, p.y + dy * m, p.z + dz * m + wz * h, nx, nz, c1, fx + 0.006, p.s + dy * m);
            idx.push(a, b, c, b, e, c);
          }
          function stem(x, y, z, L, a, cl, cap, kind, shade) {   // thân mảnh + lá theo đốt: 'horn' vòng 6 lá kim, xoay dần · 'lud' 2 lá đối, đốt sau vuông góc đốt trước, lên ngọn đỏ dần
            const gap = kind === 'horn' ? 0.075 : 0.085, N = Math.max(3, Math.round(L / gap)), K = kind === 'horn' ? 0.09 : 0.06, a0 = rnd() * TAU;
            ribbon(x, y, z, L, 0.02, a, cl, cap, 0, kind === 'horn' ? C.hornS : C.ludS, kind === 'horn' ? C.horn1 : C.ludT, K, 0, shade);
            const S = spine(x, y, z, L, N, a, cl, cap).map(p => ({ x: p.x, y: p.y, z: p.z, s: p.s }));
            for (let i = 1; i <= N; i++) {
              const u = i / N, p = S[i], fx = K * Math.pow(u, 1.6) * L;
              if (kind === 'horn') {
                const l = (0.065 + 0.055 * Math.sin(Math.PI * Math.min(1, u * 1.15))) * (u > 0.93 ? 0.6 : 1);
                _c.copy(C.horn0).lerp(C.horn1, u).multiplyScalar(shade); const c0 = _c.clone(), c1 = _c.clone().lerp(C.hornT, 0.5);
                for (let k = 0; k < 6; k++) leaflet(p, a0 + i * 0.52 + k * TAU / 6, 0.5 + 0.35 * u + (rnd() - 0.5) * 0.3, l * (0.85 + rnd() * 0.3), 0, c0, c1, fx);
              } else {
                const l = (0.1 + 0.04 * rnd()) * (0.75 + 0.35 * Math.sin(Math.PI * u)), c0 = _c.copy(C.lud0).lerp(C.ludT, Math.pow(u, 1.8)).multiplyScalar(shade).clone(), c1 = _c.lerp(C.ludT, 0.25 * u).clone();
                for (let k = 0; k < 2; k++) leaflet(p, a0 + i * Math.PI / 2 + k * Math.PI + (rnd() - 0.5) * 0.4, 0.3 + 0.5 * u * u, l, l * 0.52, c0, c1, fx);
                if (i === N) for (let k = 0; k < 3; k++) leaflet(p, a0 + k * TAU / 3 + 0.5, 1, l * 0.6, l * 0.34, c1, c1, fx);
              }
            }
          }
          const C = { val0: col(0x163f10), val1: col(0x4a941e), valOld: col(0x7a7424), hornS: col(0x2c4a1a), horn0: col(0x1a4818), horn1: col(0x3a8424), hornT: col(0x78bc40),
            ludS: col(0x5a3420), lud0: col(0x2f6c1a), ludT: col(0xb01830), cry0: col(0x163814), cry1: col(0x38741f), cryB: col(0x5c3816), gr0: col(0x1f5218), gr1: col(0x5aa02c) };
          // một cụm quanh (dx, dz) so với tâm đầm; r = bán kính gốc, n = số cây / dải
          function clump(dx, dz, kind, r, n) {
            const x0 = C0x + dx, z0 = C0z + dz; if (cid >= NCL || bedAt(x0, z0) === null) return;
            waterFlow(x0, z0, 0, _f); const fa = Math.hypot(_f.x, _f.z) > 1e-3 ? Math.atan2(_f.z, _f.x) : rnd() * TAU, v0 = pos.length;
            cph = rnd() * TAU; topY = -1e9;
            for (let k = 0; k < n; k++) {
              const ra = rnd() * TAU, rr = r * Math.sqrt(rnd()), x = x0 + Math.cos(ra) * rr, z = z0 + Math.sin(ra) * rr, bed = bedAt(x, z); if (bed === null) continue;
              const depth = TOP - bed, y = bed - 0.02, shade = 0.82 + rnd() * 0.36; if (depth < 0.2) continue;
              if (kind === 'val') { const old = rnd() < 0.12; ribbon(x, y, z, depth * (0.7 + 0.6 * rnd()), 0.04 + rnd() * 0.02, fa + (rnd() - 0.5) * 1.3, 0.995 - rnd() * 0.04, depth, 0, C.val0, old ? C.valOld : C.val1, 0.11, (rnd() - 0.5) * 3, shade); }
              else if (kind === 'horn') stem(x, y, z, Math.min(depth * 0.92, 0.55 + rnd() * 0.75), fa + (rnd() - 0.5) * 2, 0.99 - rnd() * 0.05, depth * 1.4, 'horn', shade);
              else if (kind === 'lud') stem(x, y, z, Math.min(depth * 0.88, 0.32 + rnd() * 0.4), ra, 0.99 - rnd() * 0.04, depth * 2, 'lud', shade);
              else if (kind === 'cryp') {   // hoa thị: lá mác toả quanh gốc, vài lá ngả nâu
                const nl = 8 + (rnd() * 4 | 0), a0 = rnd() * TAU;
                for (let q = 0; q < nl; q++) { const L = Math.min(depth * 0.9, 0.22 + rnd() * 0.16); ribbon(x, y, z, L, 0.08 + rnd() * 0.04, a0 + q / nl * TAU + (rnd() - 0.5) * 0.5, 0.86 - rnd() * 0.3, L * 1.5, 1, C.cry0, rnd() < 0.2 ? C.cryB : C.cry1, 0.05, (rnd() - 0.5) * 0.8, shade); }
              } else ribbon(x, y, z, Math.min(depth * 0.8, 0.1 + rnd() * 0.14), 0.018 + rnd() * 0.008, ra, 0.96 - rnd() * 0.2, 9, 0, C.gr0, C.gr1, 0.07, (rnd() - 0.5) * 2, shade);
            }
            if (pos.length === v0) return;
            const S = { x: x0, z: z0, r: Math.min(r, 0.32) + 0.06, top: topY, kind: 'plant', sort: kind, by: null, id: cid, sh: 0, nudge(k = 1) { S.sh = Math.min(1, S.sh + 0.6 * k); } };
            clumps.push(S); cid++; if (kind !== 'grass') spot(S);   // cỏ nền thấp sát đáy: không tính là chỗ ghé / vật cản
          }
          // bố cục (dx, dz so với góc 73, 113 — cùng gốc với đầm sen): thềm nông ven bờ −x và hai đầu đầm, gò ngầm phía +x; 1 bụi rong cao ở chỗ sâu giữa đàn cá; tránh gốc sen
          for (const [dx, dz, kind, r, n] of [
            [-3.6, -0.6, 'cryp', 0.3, 4], [-3.5, -0.1, 'grass', 0.7, 60], [-3.2, -2.1, 'lud', 0.28, 12], [-2.1, -3.3, 'horn', 0.3, 10], [-1.5, -4.8, 'val', 0.35, 26],
            [0.3, -5.5, 'cryp', 0.3, 4], [1.2, -6, 'lud', 0.26, 10], [-3.4, 1.4, 'val', 0.26, 18], [-3.4, 3.1, 'horn', 0.25, 8], [-2.6, 4.7, 'lud', 0.26, 10],
            [-1.4, 6, 'val', 0.32, 22], [-1.6, 5.5, 'grass', 0.6, 45], [-2.2, 5.8, 'cryp', 0.25, 3], [5.5, -1.1, 'val', 0.38, 24], [6, -0.4, 'lud', 0.25, 9],
            [5, -1.3, 'horn', 0.26, 8], [0, -3.9, 'val', 0.35, 20]]) clump(dx, dz, kind, r, n);

          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
          geo.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); geo.setAttribute('aSw', new THREE.Float32BufferAttribute(sw, 4));
          geo.setIndex(pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
          geo.computeBoundingSphere(); geo.boundingSphere.radius += 0.5;
          const U = { uNudge: { value: new Float32Array(NCL) } };
          const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, vertexColors: true, side: THREE.DoubleSide }); mat.name = 'cây thuỷ sinh';
          mat.onBeforeCompile = sh => {
            Object.assign(sh.uniforms, U, { uTime: { value: 0 } }); windUniforms.set(mat.uuid, sh.uniforms);   // uTime: vòng lặp chính đặt cho mọi vật liệu trong windUniforms
            sh.vertexShader = `attribute vec4 aSw; uniform float uTime; uniform float uNudge[${NCL}];\n` + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
              { float wpP = aSw.y - aSw.w * 2.2;   // tần số là bội của 0,1: chu kỳ thời gian shader (SHADER_TIME_LOOP) quay số nguyên vòng
                vec2 wpD = vec2(sin(uTime * 0.9 + wpP) + 0.45 * sin(uTime * 2.1 + wpP * 1.7), cos(uTime * 0.7 + wpP * 1.3) + 0.45 * sin(uTime * 1.6 + wpP * 0.6));
                wpD += uNudge[int(aSw.z + 0.5)] * 2.5 * vec2(sin(uTime * 11.0 + wpP * 3.0), cos(uTime * 9.0 + wpP * 2.0));   // cá rỉa: rung nhanh
                wpD *= aSw.x; transformed.xz += wpD; transformed.y -= dot(wpD, wpD) / max(0.25, 2.0 * aSw.w); }`);
            sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n              normal = normalize( vNormal );   // không lật theo mặt sau: 2 mặt lá sáng như nhau');
          };
          mat.customProgramCacheKey = () => 'waterplants1';
          const mesh = new THREE.Mesh(geo, mat); mesh.name = 'Cây thuỷ sinh'; mesh.receiveShadow = true;
          mesh.userData.noBake = mesh.userData.noBatch = mesh.userData.noCollide = mesh.userData.noFlight = mesh.userData.noRainOcc = true; scene.add(mesh);
          for (const p of lotusPond.pads) if (!p.L) { const g = p.top.parent; spot({ x: g.position.x, z: g.position.z, r: p.R, top: lakeY, kind: 'pad', by: null }); }   // lá sen nổi: bóng râm
          function update(dt) { for (const S of clumps) if (S.sh > 0) { S.sh = Math.max(0, S.sh - dt * 1.5); U.uNudge.value[S.id] = S.sh * S.sh; } }
          worldTick('late', 21, update);   // ngay sau lượt cá (fishWanderTick): cú rỉa vừa xong rung luôn trong khung
          return { mesh, clumps, update };
        })();
