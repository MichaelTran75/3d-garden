        // ===== RÊU VÁCH BỜ DƯƠNG XỈ + CỬA XẢ. Rêu trên vách đất ven sông
        //  (theo nghiên cứu): cần ẩm liên tục + râm ⇒ mảng loang dồn ở (1) dải sát mép nước (sóng vỗ, ẩm mao dẫn) trừ vạch ngập ngay mép nước, (2) dưới mép cỏ đỉnh
        //  bờ (nước rỉ theo rễ cỏ), (3) đường rỉ nước ngầm chạy ngang vách ở ranh lớp đất, (4) quanh gốc dương xỉ (cùng chỗ ẩm), (5) quanh cửa xả (nước bắn, hơi ẩm).
        //  Tường đầu bê-tông: đệm rêu ở mép dưới (giáp đá hộc), 2 mép giáp vách đất (rêu bò sang), khe nối quanh miệng ống, mặt trước + mặt trên gờ đỉnh; dưới miệng
        //  ống là VỆT TẢO lục đen theo nước rỉ chảy xuống. Đá hộc lớp mặt: mũ rêu mặt trên, nhiều hơn khi gần miệng cống, không mọc phần ngập.
        //  BẢN ĐỒ RÊU ô 4 cm theo z × y trên mặt vách hướng +x: kênh R = lượng rêu (vách đất + tường đầu + mặt trước gờ), G = vệt tảo trên tường đầu. Dựng 1 lần trên
        //  CPU; shader vách đất (dirtMat) + tường đầu đọc ảnh, lá rêu (nature/moss-lawn.js) đọc cùng mảng nội suy y hệt ⇒ lá mọc đúng chỗ màu rêu. Vách đất phủ ~18%
        //  (ngưỡng tự chỉnh theo phân vị). Màu + đệm + gồ = thảm rêu dùng chung (core/surface-style.js mossCoat) ----
        const bankMoss = (() => {
          const { zE, OUT, faceX } = stormDrain.net, yP = OUT.inv + 0.15, yHB = OUT.inv - 0.45, yCF = OUT.inv + 1.05, yCT = OUT.inv + 1.14, ss = THREE.MathUtils.smoothstep;   // tâm ống · đáy tường đầu · gờ đỉnh: mặt trước từ yCF tới mặt trên yCT
          const j0 = Math.round(z2gj(Z0 + 74.6)), j1 = Math.round(z2gj(Z0 + 87.4)), NR = j1 - j0 + 1, FX = new Float32Array(NR), DT = new Float32Array(NR);   // mỗi hàng ô z: mặt vách x · đỉnh thân đất (trên là khối mặt cỏ)
          for (let j = j0; j <= j1; j++) { let i = Math.round(x2gi(X0 + 74)); while (i < GX - 1 && !isWater(i, j)) i++; FX[j - j0] = wx(i) - BLOCK / 2; DT[j - j0] = surfaceY(i - 1, j) - BLOCK; }
          const row = z => Math.min(NR - 1, Math.max(0, Math.round((z - wz(j0)) / BLOCK)));
          const RS = 0.04, zA = wz(j0) - BLOCK / 2, zB = wz(j1) + BLOCK / 2, yA = lakeY - 0.04, yB = Math.max(yCT, ...DT) + 0.04, NZ = Math.ceil((zB - zA) / RS), NY = Math.ceil((yB - yA) / RS);
          const cz = a => zA + (a + 0.5) * (zB - zA) / NZ, cy = b => yA + (b + 0.5) * (yB - yA) / NY;   // tâm ô ảnh (lọc tuyến tính ⇒ đọc trên CPU nội suy y hệt GPU)
          const hs = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
          const vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
            return (hs(i, j) * (1 - a) + hs(i + 1, j) * a) * (1 - b) + (hs(i, j + 1) * (1 - a) + hs(i + 1, j + 1) * a) * b; };
          // mật độ gốc dương xỉ (nature/ferns.js) làm mờ σ 10 cm
          const FD = new Float32Array(NZ * NY), SG = 0.1, RR = Math.ceil(2.5 * SG / RS);
          for (const f of ferns.P) { const kz = Math.round((f.z - zA) / (zB - zA) * NZ - 0.5), ky = Math.round((f.y - yA) / (yB - yA) * NY - 0.5);
            for (let a = Math.max(0, kz - RR); a <= Math.min(NZ - 1, kz + RR); a++) for (let b = Math.max(0, ky - RR); b <= Math.min(NY - 1, ky + RR); b++) { const dz = cz(a) - f.z, dy = cy(b) - f.y; FD[a + NZ * b] += Math.exp(-(dz * dz + dy * dy) / (2 * SG * SG)); } }
          const bankScore = (z, y, dt, fd) => {   // điểm ẩm vách đất (cao = dễ có rêu)
            const hw = y - lakeY, ht = dt - y, n1 = vn(z * 1.4 + 5.3, y * 1.4 + 2.1), n2 = vn(z * 3.3 + 11.7, y * 3.3 + 7.9), n3 = vn(z * 0.45 + 21.0, 0.7);
            const wl = ss(hw, 0.03, 0.08) * (1 - ss(hw, 0.24 + 0.2 * n3, 0.5 + 0.2 * n3));   // dải sát mép nước
            const lip = ss(ht, 0.02, 0.06) * (1 - ss(ht, 0.16, 0.38));   // dưới mép cỏ đỉnh bờ
            const ys = lakeY + 0.7 + 0.35 * (n3 - 0.5), sp = Math.exp(-(((y - ys) / 0.07) ** 2)) * ss(vn(z * 1.1 + 31.0, 4.2), 0.35, 0.65);   // đường rỉ nước ngầm
            return 0.62 * n1 + 0.38 * n2 + 0.45 * wl + 0.25 * lip + 0.35 * sp + 0.3 * ss(fd, 2, 8) + 0.35 * (1 - ss(Math.abs(z - zE), 0.9, 2.6));   // + quanh dương xỉ + gần cửa xả
          };
          const headVal = (z, y) => {   // tường đầu + mặt trước gờ đỉnh → [lượng rêu, vệt tảo]
            const dz = Math.abs(z - zE), n1 = vn(z * 2.3 + 41.0, y * 2.3 + 3.0), n2 = vn(z * 6.1 + 47.0, y * 6.1 + 9.0);
            let v = ss(n1, 0.3, 0.55) * (1 - ss(y - yHB + 0.1 * (n2 - 0.5), 0.07, 0.22));   // mép dưới giáp đá hộc
            v = Math.max(v, ss(dz + 0.1 * (n2 - 0.5), 0.68, 0.84) * ss(n1, 0.35, 0.6));   // 2 mép giáp vách đất
            const d = Math.hypot(z - zE, y - yP); v = Math.max(v, (1 - ss(Math.abs(d - 0.225), 0.012, 0.04)) * ss(vn(Math.atan2(y - yP, z - zE) * 2.4 + 50.0, 1.5), 0.42, 0.62));   // khe nối quanh miệng ống
            if (y > yCF - 0.03) v = Math.max(v, ss(n1 + 0.15 * n2, 0.42, 0.62));   // mặt trước gờ đỉnh
            const w = 0.09 + 0.08 * (yP - y), al = y < yP - 0.16 && dz < 0.85 ? (1 - ss(dz + 0.03 * (vn(y * 9.0, 3.0) - 0.5), 0.55 * w, w)) * (0.55 + 0.45 * vn(z * 9.0 + 3.0, y * 3.0)) : 0;   // vệt tảo: nước rỉ dưới miệng ống loe dần xuống
            return [0.7 * v, Math.min(1, al)];
          };
          const MAP = new Uint8Array(NZ * NY * 2), SC = new Float32Array(NZ * NY), sv = [];
          for (let b = 0; b < NY; b++) for (let a = 0; a < NZ; a++) {
            const z = cz(a), y = cy(b), k = a + NZ * b, dt = DT[row(z)];
            if (Math.abs(z - zE) <= 0.92 && y >= yHB && y <= yCT + 0.01) { const [v, al] = headVal(z, y); MAP[2 * k] = Math.round(255 * v); MAP[2 * k + 1] = Math.round(255 * al); SC[k] = NaN; continue; }
            if (y > dt + 0.02) { SC[k] = NaN; continue; }   // khối mặt cỏ (không phải thân đất)
            SC[k] = bankScore(z, y, dt, FD[k]); if (y > lakeY) sv.push(SC[k]);
          }
          sv.sort((p, q) => p - q); const thr = sv.length ? sv[Math.floor(0.82 * sv.length)] : 9;   // ~18% vách đất trên mặt nước có rêu
          for (let k = 0; k < NZ * NY; k++) if (SC[k] === SC[k]) MAP[2 * k] = Math.round(255 * Math.min(1, Math.max(0, 0.47 + 1.8 * (SC[k] - thr))));
          const tex = new THREE.DataTexture(MAP, NZ, NY, THREE.RGFormat); tex.minFilter = tex.magFilter = THREE.LinearFilter; tex.unpackAlignment = 1; tex.needsUpdate = true;
          const at = (z, y, ch) => {   // nội suy song tuyến như GPU (tâm ô, kẹp mép)
            const fz = Math.min(NZ - 1, Math.max(0, (z - zA) / (zB - zA) * NZ - 0.5)), fy = Math.min(NY - 1, Math.max(0, (y - yA) / (yB - yA) * NY - 0.5)), a = Math.min(NZ - 2, Math.floor(fz)), b = Math.min(NY - 2, Math.floor(fy)), u = fz - a, v = fy - b;
            const Q = (p, q) => MAP[2 * (p + NZ * q) + ch] / 255; return (Q(a, b) * (1 - u) + Q(a + 1, b) * u) * (1 - v) + (Q(a, b + 1) * (1 - u) + Q(a + 1, b + 1) * u) * v; };
          const topMo = (x, z) => at(z, yCF + 0.045, 0) * (1 - ss(faceX + 0.09 - x, 0.1, 0.36));   // mặt trên gờ đỉnh: theo mép trước, lan vào 10–36 cm
          const U = { uBmMap: { value: tex }, uBmBox: { value: new THREE.Vector4(zA, yA, 1 / (zB - zA), 1 / (yB - yA)) }, uBmR: { value: new THREE.Vector2(wz(j0), 1 / BLOCK) }, uBmX: { value: Array.from(FX) }, uBmHw: { value: new THREE.Vector3(faceX + 0.09, yCF + 0.045, 0) } };
          const MAPGL = `
            uniform sampler2D uBmMap; uniform vec4 uBmBox; uniform vec2 uBmR; uniform float uBmX[${NR}]; uniform vec3 uBmHw;
            vec2 bmAt(vec2 zy) { return texture2D(uBmMap, clamp(vec2((zy.x - uBmBox.x) * uBmBox.z, (zy.y - uBmBox.y) * uBmBox.w), 0.0, 1.0)).rg; }
            float bmCov(float v, vec2 q, float f) { return smoothstep(0.32, 0.62, v + 0.25 * (sfMossCu(q, f) - 0.45)); }   // mép mảng lồi lõm theo đệm rêu`;
          // vách đất: chỉ mặt +x đúng mặt vách của hàng (thân cột đất cuối trước nước), trong vùng bản đồ
          mossCoat(dirtMat, 'bank1', { uniforms: U, sq: 'vMcP.zy', fHead: MAPGL + `
            float bankMo(vec2 q, float f) {
              if (vMcN.x < 0.7 || vMcP.z < uBmBox.x || vMcP.z > uBmBox.x + 1.0 / uBmBox.z || vMcP.y < uBmBox.y || vMcP.y > uBmBox.y + 1.0 / uBmBox.w) return 0.0;
              int ri = int(floor((vMcP.z - uBmR.x) * uBmR.y + 0.5)); if (ri < 0 || ri >= ${NR} || abs(vMcP.x - uBmX[ri]) > 0.05) return 0.0;
              return bmCov(bmAt(vMcP.zy).r, q, f); }`, mo: 'bankMo(mcQ, mcF)' });
          // tường đầu + gờ đỉnh: bản riêng của bê-tông đúc sẵn (M.conc dùng chung giếng, hố thu) — mặt trước đọc bản đồ, mặt trên gờ theo mép trước; vệt tảo trước lớp rêu
          const headM = mossCoat(stormDrain.mats.conc.clone(), 'head1', { uniforms: U, sq: '(vMcN.y > 0.7 ? vMcP.zx : vMcP.zy)', fHead: MAPGL + `
            float headMo(vec2 q, float f) {
              if (vMcN.x > 0.7) return bmCov(bmAt(vMcP.zy).r, q, f);
              if (vMcN.y > 0.7) return bmCov(bmAt(vec2(vMcP.z, uBmHw.y)).r * (1.0 - smoothstep(0.1, 0.36, uBmHw.x - vMcP.x)), q, f);
              return 0.0; }`, tint: 'diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.42, 0.5, 0.36), vMcN.x > 0.7 ? 0.75 * bmAt(vMcP.zy).g : 0.0);', mo: 'headMo(mcQ, mcF)' });
          stormDrain.outfall.traverse(o => { if (o.isMesh && o.material === stormDrain.mats.conc) o.material = headM; });
          // đá hộc lớp mặt: lượng rêu từng đỉnh (mặt hướng trời · trên mặt nước · gần miệng cống · loang) ⇒ thuộc tính aMk
          const rip = stormDrain.rip.children.find(o => o.isMesh && o.material === stormDrain.mats.stone);
          if (rip) {
            const g = rip.geometry, P = g.attributes.position, N = g.attributes.normal, A = new Float32Array(P.count), v = new THREE.Vector3(), n = new THREE.Vector3();
            rip.updateWorldMatrix(true, false); const M = rip.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M);
            for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k).applyMatrix4(M); n.fromBufferAttribute(N, k).applyMatrix3(NM).normalize();
              const near = 1 - ss(Math.hypot(v.x - faceX, (v.z - zE) * 0.7), 0.4, 1.6), nz = vn(v.x * 5.1 + v.y * 3.7, v.z * 5.1 + 13.0);
              A[k] = ss(n.y, 0.15, 0.7) * ss(v.y, lakeY + 0.01, lakeY + 0.07) * ss(nz + 0.35 * near, 0.45, 0.75); }
            g.setAttribute('aMk', new THREE.BufferAttribute(A, 1));
            rip.material = mossCoat(stormDrain.mats.stone.clone(), 'rip1', { vHead: 'attribute float aMk; varying float vMk;', vMain: ' vMk = aMk;', fHead: 'varying float vMk;',
              sq: '(abs(vMcN.y) > 0.6 ? vMcP.xz : abs(vMcN.x) > abs(vMcN.z) ? vMcP.zy : vMcP.xy)', mo: 'smoothstep(0.3, 0.6, vMk + 0.25 * (sfMossCu(mcQ, mcF) - 0.45))' });
            rip.userData.noBatch = true;
          }
          // ---- lá rêu (nature/moss-lawn.js gọi lúc dựng thảm): rải theo diện tích, lượng rêu đọc lại đúng bản đồ / thuộc tính ----
          mossBladeSrc.push((push, DENS) => {
            const r = mulberry32(6161);
            for (let ri = 0; ri < NR; ri++) {   // mặt vách hướng +x: vách đất · tường đầu · mặt trước gờ đỉnh
              const zc = wz(j0 + ri), y1 = Math.abs(zc - zE) < 1.3 ? Math.max(DT[ri], yCT) : DT[ri], k = Math.floor(BLOCK * (y1 - lakeY) * DENS);
              for (let q = 0; q < k; q++) {
                const z = zc + (r() - 0.5) * BLOCK, y = lakeY + (y1 - lakeY) * r(), dz = Math.abs(z - zE), head = dz <= 0.92 && y >= yHB && y <= yCT;
                if (!head && y > DT[ri]) continue;
                const m = ss(at(z, y, 0), 0.32, 0.62); if (m < 0.02) continue;
                push((head ? (y >= yCF ? faceX + 0.09 : dz <= 0.85 ? faceX + 0.03 : FX[ri]) : FX[ri]) + 0.003, y, z, 1, 0, 0, m, head ? 0.3 : 0.4, head ? 0.5 : 0.75);
              }
            }
            for (let q = Math.floor(0.48 * 1.84 * DENS); q-- > 0;) { const z = zE + (r() - 0.5) * 1.84, x = faceX + 0.09 - 0.48 * r(), m = ss(topMo(x, z), 0.32, 0.62); if (m > 0.02) push(x, yCT + 0.002, z, 0, 1, 0, m, 0.3, 0.5); }   // mặt trên gờ đỉnh
            if (rip) {   // đá hộc: tam giác (lưới gộp không chỉ mục) theo diện tích, lượng rêu nội suy aMk
              const g = rip.geometry, P = g.attributes.position, N = g.attributes.normal, A = g.attributes.aMk, M = rip.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M);
              const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();
              for (let t = 0; t + 2 < P.count; t += 3) {
                const ma = A.getX(t), mb = A.getX(t + 1), mc = A.getX(t + 2); if (Math.max(ma, mb, mc) < 0.3) continue;
                a.fromBufferAttribute(P, t).applyMatrix4(M); b.fromBufferAttribute(P, t + 1).applyMatrix4(M); c.fromBufferAttribute(P, t + 2).applyMatrix4(M); n.fromBufferAttribute(N, t).applyMatrix3(NM).normalize();
                e1.subVectors(b, a); e2.subVectors(c, a); let k = Math.floor(e1.clone().cross(e2).length() / 2 * DENS + r());
                while (k-- > 0) { let u = r(), w = r(); if (u + w > 1) { u = 1 - u; w = 1 - w; } const m = ss(ma * (1 - u - w) + mb * u + mc * w, 0.3, 0.6);
                  if (m > 0.02) push(a.x + e1.x * u + e2.x * w, a.y + e1.y * u + e2.y * w, a.z + e1.z * u + e2.z * w, n.x, n.y, n.z, m, 0.3, 0.55); }
              }
            }
          });
          return { tex, at, rows: NR, thr };
        })();
