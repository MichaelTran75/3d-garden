        // ===== THẢM RÊU = LÁ CỎ THẢM: thay lớp vỏ sợi nhung (shell, 20/10) bằng LÁ THẬT dựng y như thảm cỏ ngắn quanh 2 gốc cây x104 z107 (nature/meadow.js):
        //  lá 9–15 cm × 0,55–1, gốc rộng ~1,9 cm thon về ngọn, cong ngả ngẫu nhiên, bề ngang nửa theo lá nửa xoay theo
        //  hướng nhìn, gió như cỏ, gốc = màu rêu trên vỏ ⇒ ngọn sáng ấm. Rải đều theo diện tích trên vỏ rễ, thân cổ thụ, cây con, cành chết, khúc gỗ chết (vật liệu có rêu
        //  mặt trên) trong 3,2 m sát đất, ~1000 lá / m² (gấp 6 thảm cỏ: thảm nhìn xiên lá chồng nhau dày).
        //  LƯỢNG RÊU tại gốc từng lá tính 1 lần lúc dựng cảnh trên GPU (đọc về) — cùng công thức tô rêu trên vỏ (core/surface-style.js: rêu chân thân,
        //  vệt nước chảy, hốc khuất, rêu mặt trên; cùng hàm nhiễu SF_NOISE, cùng GPU) ⇒ lá chỉ mọc đúng chỗ có màu rêu; mép mảng thưa + thấp dần như mép thảm cỏ.
        //  Lá mọc theo pháp tuyến vỏ rồi uốn lên trời. Ẩn / thưa theo mức zoom y như thảm cỏ (mossTick, loop/main-loop-rest.js) ----
        // ---- HỐC KHUẤT quanh gốc cổ thụ (kẽ rễ, chân rễ sát đất, rễ ôm đá): rêu ưa chỗ
        //  khuất ẩm. Đo bằng MẬT ĐỘ VẬT RẮN quanh mỗi điểm: hộp 14,4 × 4 × 14,4 m quanh gốc chia ô 8 cm; đánh dấu ô dưới đất + ô có mặt lưới (rễ, thân, cây
        //  con, đá, tổ ong: lưới thường r 0,3–40 m, bỏ lượt độ sâu); loang KHÔNG KHÍ từ 4 vách hộp ⇒ ô không loang tới = lòng vật rắn (thân cắt ngang nóc hộp vẫn
        //  kín); làm mờ hộp ±4 ô rồi ±2 ô ⇒ tỉ lệ rắn: mặt trống ~0,5, kẽ / chân rễ ~0,6–0,75, sống rễ lồi < 0,45. Ảnh 3D ô 16 cm (SF_CV, core/surface-style.js) ----
        const mossCrevice = (() => {
          const V = 0.08, cx = X0 + 89, cz = Z0 + 117, gy = cowY(cx, cz), nx = 180, ny = 50, nz = 180, x0 = cx - 7.2, y0 = gy - 0.6, z0 = cz - 7.2, NN = nx * ny * nz; let S = new Uint8Array(NN);
          for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) { const h = cowY(x0 + (i + 0.5) * V, z0 + (k + 0.5) * V); for (let j = 0; j < ny && y0 + (j + 0.5) * V < h; j++) S[i + nx * (j + ny * k)] = 1; }   // dưới đất
          const bx = new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x0 + nx * V, y0 + ny * V, z0 + nz * V)), bs = new THREE.Sphere(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
          scene.traverse(o => {
            const g = o.geometry, P = g && g.attributes.position; if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !P || !o.material || o.material.colorWrite === false) return;
            if (!g.boundingSphere) g.computeBoundingSphere(); o.updateWorldMatrix(true, false); bs.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); if (bs.radius < 0.3 || bs.radius > 40 || !bx.intersectsSphere(bs)) return;
            const I = g.index ? g.index.array : null, n = I ? I.length : P.count, M = o.matrixWorld;
            for (let t = 0; t < n; t += 3) {
              a.fromBufferAttribute(P, I ? I[t] : t).applyMatrix4(M); b.fromBufferAttribute(P, I ? I[t + 1] : t + 1).applyMatrix4(M); c.fromBufferAttribute(P, I ? I[t + 2] : t + 2).applyMatrix4(M);
              if (Math.max(a.x, b.x, c.x) < x0 || Math.min(a.x, b.x, c.x) > bx.max.x || Math.max(a.y, b.y, c.y) < y0 || Math.min(a.y, b.y, c.y) > bx.max.y || Math.max(a.z, b.z, c.z) < z0 || Math.min(a.z, b.z, c.z) > bx.max.z) continue;
              const m = Math.ceil(Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)) / (0.6 * V));   // chấm dày hơn ô ⇒ mặt kín (không lọt khí)
              for (let u = 0; u <= m; u++) for (let w = 0; w <= m - u; w++) { const p = u / m, q = w / m, r = 1 - p - q, i = Math.floor((a.x * r + b.x * p + c.x * q - x0) / V), j = Math.floor((a.y * r + b.y * p + c.y * q - y0) / V), k = Math.floor((a.z * r + b.z * p + c.z * q - z0) / V);
                if (i >= 0 && i < nx && j >= 0 && j < ny && k >= 0 && k < nz) S[i + nx * (j + ny * k)] = 1; }
            }
          });
          let Q = new Int32Array(NN), qh = 0, qt = 0; const push = e => { if (!S[e]) { S[e] = 2; Q[qt++] = e; } };   // loang khí (2) từ 4 vách
          for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) { push(nx * (j + ny * k)); push(nx - 1 + nx * (j + ny * k)); }
          for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { push(i + nx * j); push(i + nx * (j + ny * (nz - 1))); }
          while (qh < qt) { const e = Q[qh++], i = e % nx, j = ((e / nx) | 0) % ny, k = (e / (nx * ny)) | 0;
            if (i > 0) push(e - 1); if (i < nx - 1) push(e + 1); if (j > 0) push(e - nx); if (j < ny - 1) push(e + nx); if (k > 0) push(e - nx * ny); if (k < nz - 1) push(e + nx * ny); }
          let D = new Float32Array(NN), T = new Float32Array(NN); for (let e = 0; e < NN; e++) D[e] = S[e] === 2 ? 0 : 1;
          const blur = (r, st, len, cnt) => { for (let e0 = 0; e0 < NN; e0++) { if (((e0 / st) | 0) % len) continue;   // trung bình trượt ±r ô theo 1 trục (mép: kẹp)
              let sum = 0; for (let t = -r; t <= r; t++) sum += D[e0 + st * Math.min(len - 1, Math.max(0, t))];
              for (let t = 0; t < len; t++) { T[e0 + st * t] = sum / (2 * r + 1); sum += D[e0 + st * Math.min(len - 1, t + r + 1)] - D[e0 + st * Math.max(0, t - r)]; } } [D, T] = [T, D]; };
          for (const r of [4, 2]) { blur(r, 1, nx); blur(r, nx, ny); blur(r, nx * ny, nz); }
          const tx = nx / 2, ty = ny / 2, tz = nz / 2, td = new Uint8Array(tx * ty * tz);   // ảnh 3D ô 16 cm (trung bình 2 × 2 × 2)
          for (let k = 0; k < tz; k++) for (let j = 0; j < ty; j++) for (let i = 0; i < tx; i++) { let s = 0; for (let d = 0; d < 8; d++) s += D[2 * i + (d & 1) + nx * (2 * j + (d >> 1 & 1) + ny * (2 * k + (d >> 2)))]; td[i + tx * (j + ty * k)] = Math.round(s * 31.875); }
          const tex = new THREE.Data3DTexture(td, tx, ty, tz); tex.format = THREE.RedFormat; tex.minFilter = tex.magFilter = THREE.LinearFilter; tex.unpackAlignment = 1; tex.needsUpdate = true;
          SF_CV.value = tex; SF_CV0.value.set(x0, y0, z0); SF_CV1.value.set(1 / (nx * V), 1 / (ny * V), 1 / (nz * V));
          S = Q = D = T = null;   // 4 mảng dựng trường (≈ 20 MB): hàm trả về giữ cả ngữ cảnh của khối này ⇒ không bỏ tay thì sống suốt phiên
          return (x, y, z) => { const i = Math.floor((x - x0) / (2 * V)), j = Math.floor((y - y0) / (2 * V)), k = Math.floor((z - z0) / (2 * V)); return i >= 0 && i < tx && j >= 0 && j < ty && k >= 0 && k < tz ? td[i + tx * (j + ty * k)] / 255 : 0; };   // đọc ảnh 3D ô 16 cm
        })();
        const mossLawn = (() => {
          const DENS = 6 * 60 / (0.6 * 0.6), HMAX = 3.2, rnd = mulberry32(3131);   // lá / m²: gấp 6 thảm cỏ (thảm nhìn xiên lá chồng nhau dày, mặt vỏ quay về camera lá chĩa vào mắt nên thưa ⇒ cần dày hơn — đo: 111k lá, +2,6 MB RAM đồ hoạ, khung không đổi) · cao nhất trên đất (hốc khuất tới 3,2 m) · RNG riêng
          const src = []; scene.traverse(o => { const U = o.isMesh && !o.isInstancedMesh && o.material && o.material.userData; if (U && (U.sfTop ?? (U.sfOld ? 1 : 0)) > 0 && o.geometry.attributes.normal) src.push(o); });   // = uSfTm > 0: cổ thụ, cành chết, cây con, rễ (sfOld) + khúc gỗ chết (sfTop 1,8)
          const R = [], Nn = [], Bk = [], Q = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
          const na = new THREE.Vector3(), nb = new THREE.Vector3(), nc = new THREE.Vector3(), p = new THREE.Vector3(), n = new THREE.Vector3();
          for (const m of src) {
            const g = m.geometry, P = g.attributes.position, Nr = g.attributes.normal, B = g.attributes.aBk, D = g.attributes.aBd, I = g.index ? g.index.array : null, nt = I ? I.length / 3 : P.count / 3;
            const U = m.material.userData, Ms = U.sfMoss ?? 1, Tm = U.sfTop ?? 1, fl = (U.sfOld ? 1 : 0) + (U.sfTopW ? 2 : 0);   // cờ: vân cổ thụ · hạt rêu mặt trên theo toạ độ thế giới
            m.updateWorldMatrix(true, false); const M = m.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M);
            for (let t = 0; t < nt; t++) {
              const ia = I ? I[t * 3] : t * 3, ib = I ? I[t * 3 + 1] : t * 3 + 1, ic = I ? I[t * 3 + 2] : t * 3 + 2;
              a.fromBufferAttribute(P, ia).applyMatrix4(M); b.fromBufferAttribute(P, ib).applyMatrix4(M); c.fromBufferAttribute(P, ic).applyMatrix4(M);
              if (Math.min(a.y, b.y, c.y) - cowY((a.x + b.x + c.x) / 3, (a.z + b.z + c.z) / 3) > HMAX) continue;
              let k = Math.floor(e1.subVectors(b, a).cross(e2.subVectors(c, a)).length() / 2 * DENS + rnd()); if (!k) continue;
              na.fromBufferAttribute(Nr, ia).applyMatrix3(NM).normalize(); nb.fromBufferAttribute(Nr, ib).applyMatrix3(NM).normalize(); nc.fromBufferAttribute(Nr, ic).applyMatrix3(NM).normalize();
              const bm = B ? Math.max(1, Math.floor(B.getZ(ia) + 0.5)) : 1, xa = B ? B.getX(ia) : 0, wrap = x => x - bm * Math.round((x - xa) / bm);   // toạ độ quanh thân tuần hoàn chu kỳ bm: tam giác vắt qua đường may thì nối liền
              const xb = B ? wrap(B.getX(ib)) : 0, xc = B ? wrap(B.getX(ic)) : 0;
              while (k-- > 0) {
                let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w = 1 - u - v;
                p.set(0, 0, 0).addScaledVector(a, w).addScaledVector(b, u).addScaledVector(c, v); n.set(0, 0, 0).addScaledVector(na, w).addScaledVector(nb, u).addScaledVector(nc, v).normalize();
                if (n.y < -0.4 || p.y - cowY(p.x, p.z) > HMAX) continue;   // mặt úp xuống: rêu không mọc
                R.push(p.x, p.y, p.z); Nn.push(n.x, n.y, n.z);
                Bk.push(xa * w + xb * u + xc * v, B ? B.getY(ia) * w + B.getY(ib) * u + B.getY(ic) * v : 0, B ? B.getZ(ia) * w + B.getZ(ib) * u + B.getZ(ic) * v : 0);
                Q.push(D ? D.getX(ia) * w + D.getX(ib) * u + D.getX(ic) * v : 0, Ms, Tm, fl);
              }
            }
          }
          // ---- RÊU CHÂN TƯỜNG CÔNG TRÌNH (rêu mái đã bỏ theo
          //  bỏ các mảng rêu trên mái — core/surface-style.js sfWallMo): ứng viên trên mặt đứng vật liệu tường (bê tông · vữa · ván · gỗ chuồng) trong
          //  dải 2 m sát đất (lưỡi rêu cao nhất) — cắt tam giác bằng mặt y = đất cao nhất dưới tam giác + 2 rồi rải theo diện tích phần dưới (tường cao không tốn
          //  ứng viên). Đập (userData.sfOldMo — nature/dam-moss.js): rêu tường cũ trên mặt đứng mọi độ cao trên mặt nước. Lượng rêu tính trên GPU cùng lượt với vỏ
          //  (cờ 8 + loại, đập 16 + loại), lá ngắn hơn (đệm rêu). RNG riêng ⇒ lá rêu trên cây giữ y nguyên ----
          const nBark = R.length / 3, rw = mulberry32(8181), DW = DENS * 0.6, WB = 2.0, cut = [], d1 = new THREE.Vector3(), d2 = new THREE.Vector3();
          scene.traverse(o => {
            const K = o.isMesh && !o.isInstancedMesh && o.material && !Array.isArray(o.material) && o.material.userData.sfK; if (!(K >= 1 && K <= 4) || !o.geometry.attributes.normal) return;
            const OM = o.material.userData.sfOldMo ? o.material.userData.sfWater : null, fl = (OM ? 16 : 8) + K;   // OM: trục đập · mặt hồ chứa · mặt nước hạ lưu
            const g = o.geometry, P = g.attributes.position, Nr = g.attributes.normal, I = g.index ? g.index.array : null, n3 = I ? I.length : P.count;
            o.updateWorldMatrix(true, false); const M = o.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M);
            for (let t = 0; t < n3; t += 3) {
              const ia = I ? I[t] : t, ib = I ? I[t + 1] : t + 1, ic = I ? I[t + 2] : t + 2;
              a.fromBufferAttribute(P, ia).applyMatrix4(M); b.fromBufferAttribute(P, ib).applyMatrix4(M); c.fromBufferAttribute(P, ic).applyMatrix4(M);
              n.fromBufferAttribute(Nr, ia).add(na.fromBufferAttribute(Nr, ib)).add(na.fromBufferAttribute(Nr, ic)).applyMatrix3(NM).normalize();
              if (OM && Math.abs(n.y) <= 0.85) {   // mặt đứng thân đập: cả mặt, trừ phần dưới nước
                d1.subVectors(b, a); d2.subVectors(c, a); let k = Math.floor(e1.crossVectors(d1, d2).length() / 2 * DW * 0.6 + rw());
                while (k-- > 0) { let u = rw(), v = rw(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
                  p.copy(a).addScaledVector(d1, u).addScaledVector(d2, v); if (p.y < (p.z < OM[0] ? OM[1] : OM[2]) + 0.03) continue;
                  R.push(p.x, p.y, p.z); Nn.push(n.x, n.y, n.z); Bk.push(0, 0, 0); Q.push(0, 1, 1, fl); }
                continue;
              }
              const yb = Math.max(cowY(a.x, a.z), cowY(b.x, b.z), cowY(c.x, c.z)) + WB; if (OM || Math.min(a.y, b.y, c.y) >= yb || Math.abs(n.y) > 0.85) continue;   // mặt đứng trong dải sát đất
              cut.length = 0; const V = [a, b, c];   // Sutherland–Hodgman với 1 mặt phẳng: giữ phần y < yb
              for (let e = 0; e < 3; e++) { const p0 = V[e], p1 = V[(e + 1) % 3], i0 = p0.y < yb, i1 = p1.y < yb; if (i0) cut.push(p0.clone()); if (i0 !== i1) cut.push(new THREE.Vector3().lerpVectors(p0, p1, (yb - p0.y) / (p1.y - p0.y))); }
              for (let f = 1; f + 1 < cut.length; f++) {
                d1.subVectors(cut[f], cut[0]); d2.subVectors(cut[f + 1], cut[0]); let k = Math.floor(e1.crossVectors(d1, d2).length() / 2 * DW + rw());
                while (k-- > 0) { let u = rw(), v = rw(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
                  p.copy(cut[0]).addScaledVector(d1, u).addScaledVector(d2, v); const hA = p.y - cowY(p.x, p.z); if (hA < -0.02 || hA > WB) continue;
                  R.push(p.x, p.y, p.z); Nn.push(n.x, n.y, n.z); Bk.push(0, 0, 0); Q.push(0, 1, 1, fl); }
              }
            }
          });
          // ---- LƯỢNG RÊU tại gốc từng lá: tính 1 lần lúc dựng cảnh TRÊN GPU (mỗi lá 1 điểm ảnh, đọc về) — cùng công thức + hàm nhiễu + GPU với shader vỏ ⇒ khớp
          //  màu rêu (nhiễu băm sin trên CPU lệch số với GPU). Rồi chỉ giữ lá chỗ có rêu, mép mảng thưa dần ⇒ mỗi khung không phải tính lại, không vẽ lá thừa ----
          const nC = R.length / 3, BW = 1024, BH = Math.max(1, Math.ceil(nC / BW)), mo = new Uint8Array(BW * BH * 4);
          if (nC) {
            SF_H = SF_H || sfHeightTex();
            const pg = new THREE.BufferGeometry(), ba = (arr, k) => new THREE.Float32BufferAttribute(arr, k);
            pg.setAttribute('position', ba(new Float32Array(nC * 3), 3)); pg.setAttribute('aRoot', ba(R, 3)); pg.setAttribute('aNrm', ba(Nn, 3)); pg.setAttribute('aMk', ba(Bk, 3)); pg.setAttribute('aMq', ba(Q, 4));
            const pm = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false,
              uniforms: { uSfH: { value: SF_H }, uSfG: { value: new THREE.Vector4(1 / BLOCK, cx, cz, 0) }, uSfCv: SF_CV, uSfCv0: SF_CV0, uSfCv1: SF_CV1, uSfNo: SF_NO },
              vertexShader: SF_NOISE + SF_WALLMO + `
                attribute vec3 aRoot, aNrm, aMk; attribute vec4 aMq;
                float sfL(float n, float a, float b) { return 1.0 - smoothstep(a, b, abs(n - 0.5)); }   // = sfLn chưa lọc điểm ảnh
                uniform vec3 uSfCv0, uSfCv1; uniform vec4 uSfG; uniform vec2 uSfNo; uniform highp sampler2D uSfH; uniform highp sampler3D uSfCv;
                varying float vMo;
                void main() {   // = sfMo của vỏ (core/surface-style.js, nhánh cổ thụ uSfOld / vỏ thường): chân thân · vệt nước chảy · hốc khuất · rêu mặt trên
                  vec3 P = aRoot, wn = normalize(aNrm); float id = float(gl_VertexID);
                  float hA = P.y - texture(uSfH, vec2((P.x * uSfG.x + uSfG.y) / ${GX}.0, (P.z * uSfG.x + uSfG.z) / ${GZ}.0)).r, Ms = aMq.y, Tm = aMq.z;
                  float bm = max(1.0, floor(aMk.z + 0.5)), tR = aMk.z > 0.5 ? clamp(aMk.z - bm + 0.49, 0.0, 1.0) : 0.4, ba = aMk.x * 12.0, bl = aMk.y * 1.6, bw = 1.4 * sfNw(vec2(ba * 0.5, bl * 0.7), 6.0 * bm);
                  float Tw = floor(aMq.w * 0.5 + 0.01), mG, mC = 0.0;
                  if (mod(aMq.w, 2.0) > 0.5) { float gr = max(0.0, aMq.x - 0.02) / 0.98; mG = smoothstep(0.22, 0.85, gr); mC = smoothstep(1.05, 1.4, gr); }   // cổ thụ: đáy rãnh giữa 2 sợi bện · lòng hốc
                  else { float cr = max(sfL(sfNw(vec2(ba + bw, bl * 0.45), 12.0 * bm), 0.015, 0.085), 0.75 * sfL(sfNw(vec2(ba * 2.0 + bw + 4.0, bl * 0.8), 24.0 * bm), 0.01, 0.06));   // vỏ thường: rãnh nứt (gv)
                    float hc = sfL(sfNw(vec2(ba * 0.5 + 3.0, bl * 2.4), 6.0 * bm), 0.015, 0.05) * step(0.5, sfNw(vec2(ba * 0.5, bl * 0.8) + 9.0, 6.0 * bm)); mG = max(cr, 0.7 * hc) * (1.0 - 0.6 * (1.0 - smoothstep(0.08, 0.3, tR))); }
                  float mo = Ms * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));
                  float nf = dot(normalize(wn.xz + 1e-4), uSfNo) * (1.0 - abs(wn.y));
                  float sfl = smoothstep(0.66, 0.82, sfNw(vec2(ba * 1.2 + 0.7 * bw, bl * 0.12) + 41.0, 12.0 * bm)) * (0.5 + 0.5 * mG) * (1.0 - smoothstep(0.6, 7.0, hA)) * smoothstep(0.1, 0.5, tR);
                  mo = max(mo * (1.0 + 0.35 * nf), 0.85 * sfl * Ms * step(0.01, Tm));
                  vec3 cq = (P + wn * 0.06 - uSfCv0) * uSfCv1; float cv = all(greaterThan(cq, vec3(0.02))) && all(lessThan(cq, vec3(0.98))) ? texture(uSfCv, cq).r : 0.0;
                  float cvM = smoothstep(0.0, 0.12, cv - 0.47 + 0.3 * (sfN(P.xz * 1.4 + P.y * 0.8 + 51.0) - 0.5) + 0.14 * (sfN(P.xz * 5.0 + P.y * 3.3 + 9.0) - 0.5)) * step(0.01, cv) * (1.0 - smoothstep(1.4, 3.2, hA)) * step(0.01, Tm);
                  mo = max(mo, cvM * min(1.0, Ms));
                  float mu = smoothstep(0.3, 0.9, wn.y) * smoothstep(0.08, 0.6, tR) * (1.0 - mC) * smoothstep(0.55, 0.68, 0.65 * sfNw(vec2(ba * 0.5, bl * 0.8) + 31.0, 6.0 * bm) + 0.35 * sfNw(vec2(ba * 2.0, bl * 3.0) + 37.0, 24.0 * bm) + 0.25 * wn.y + 0.12 * mG + 0.2 * mix(sfNw(vec2(ba * 1.5, bl * 12.0), 18.0 * bm), sfN(P.xz * 24.0 + P.y * 5.0), Tw) + 0.25 * Tm + 0.12 * (1.0 - smoothstep(0.6, 8.0, hA)) + 0.08 * nf - 0.51);
                  vMo = max(mo, mu * min(1.0, Ms * 1.1) * step(0.01, Tm));
                  if (aMq.w > 7.5) { float al, kT = aMq.w - 16.0;   // công trình (cờ 8 + loại): chân tường · đập (16 + loại): rêu tường cũ
                    vMo = smoothstep(0.32, 0.62, 0.7 * (aMq.w > 15.5 ? sfOldMo(P, wn, hA, uSfNo, kT < 1.5 ? ${SF_WALL_T[1]} : kT < 2.5 ? ${SF_WALL_T[2]} : kT < 3.5 ? ${SF_WALL_T[3]} : ${SF_WALL_T[4]})
                      : sfWallMo(P, wn, hA, uSfNo, al))) * (1.0 - smoothstep(0.55, 0.85, abs(wn.y))); }
                  gl_Position = vec4((mod(id, ${BW}.0) + 0.5) / ${BW}.0 * 2.0 - 1.0, (floor(id / ${BW}.0) + 0.5) / ${BH}.0 * 2.0 - 1.0, 0.0, 1.0); gl_PointSize = 1.0;
                }`,
              fragmentShader: 'varying float vMo;\nvoid main() { gl_FragColor = vec4(clamp(vMo * 0.5, 0.0, 1.0), 0.0, 0.0, 1.0); }' });
            const pts = new THREE.Points(pg, pm), sc = new THREE.Scene(), rt = new THREE.WebGLRenderTarget(BW, BH, { depthBuffer: false }), r0 = renderer.getRenderTarget(); pts.frustumCulled = false; sc.add(pts);
            renderer.setRenderTarget(rt); renderer.render(sc, new THREE.Camera()); renderer.readRenderTargetPixels(rt, 0, 0, BW, BH, mo); renderer.setRenderTarget(r0);
            rt.dispose(); pg.dispose(); pm.dispose();
          }
          const KR = [], KN = [], KM = [], KQ = [], st = { wall: 0, dam: 0 };   // lá giữ lại: gốc · pháp tuyến · (hướng ngả, hệ số cao, độ cong, hạt) · (lượng rêu, chỉ số mức zoom) · số lá theo chỗ
          for (let i = 0; i < nC; i++) {
            const m = mo[i * 4] / 127.5;
            if (i >= nBark) { if (rw() < THREE.MathUtils.smoothstep(m, 0.1, 0.4)) { st[Q[i * 4 + 3] > 15.5 ? 'dam' : 'wall']++; KR.push(R[i * 3], R[i * 3 + 1], R[i * 3 + 2]); KN.push(Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2]); KM.push(rw() * 6.2832, 0.3 + 0.25 * rw(), 0.12 + 0.4 * rw(), rw()); KQ.push(m, rw()); } continue; }   // chân tường: đệm rêu ngắn 3–8 cm
            if (rnd() >= THREE.MathUtils.smoothstep(m, 0.1, 0.4)) continue;   // ít rêu: không mọc · mép mảng thưa dần
            KR.push(R[i * 3], R[i * 3 + 1], R[i * 3 + 2]); KN.push(Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2]);
            KM.push(rnd() * 6.2832, rnd() < 0.05 ? 1 : 0.55 + 0.45 * rnd(), 0.12 + 0.4 * rnd(), rnd()); KQ.push(m, rnd());   // hệ số cao như patchGeo: 1 lá / ô cao hết
          }
          // ĐÁ HỘC quanh gốc (nature/old-tree.js stoneRing — giống đá hộc cửa xả): lượng rêu tính sẵn ở từng đỉnh (aRk) ⇒ lá rêu
          //  mọc đúng chỗ màu rêu, cùng mật độ, cùng luật mép thưa; lá thấp hơn ~40% (đệm rêu trên đá ngắn hơn rêu chân thân)
          scene.traverse(o => {
            const g = o.isMesh && o.userData.rockMoss ? o.geometry : null, A = g && g.attributes.aRk; if (!A) return;
            const P = g.attributes.position, Nr = g.attributes.normal, I = g.index.array; o.updateWorldMatrix(true, false); const M = o.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M);
            for (let t = 0; t < I.length; t += 3) {
              const ia = I[t], ib = I[t + 1], ic = I[t + 2], ma = A.getX(ia), mb = A.getX(ib), mc = A.getX(ic); if (Math.max(ma, mb, mc) < 0.1) continue;
              a.fromBufferAttribute(P, ia).applyMatrix4(M); b.fromBufferAttribute(P, ib).applyMatrix4(M); c.fromBufferAttribute(P, ic).applyMatrix4(M);
              let k = Math.floor(e1.subVectors(b, a).cross(e2.subVectors(c, a)).length() / 2 * DENS + rnd()); if (!k) continue;
              na.fromBufferAttribute(Nr, ia).applyMatrix3(NM).normalize(); nb.fromBufferAttribute(Nr, ib).applyMatrix3(NM).normalize(); nc.fromBufferAttribute(Nr, ic).applyMatrix3(NM).normalize();
              while (k-- > 0) {
                let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; } const w = 1 - u - v, m = ma * w + mb * u + mc * v;
                n.set(0, 0, 0).addScaledVector(na, w).addScaledVector(nb, u).addScaledVector(nc, v).normalize(); if (n.y < -0.4 || rnd() >= THREE.MathUtils.smoothstep(m, 0.1, 0.4)) continue;
                p.set(0, 0, 0).addScaledVector(a, w).addScaledVector(b, u).addScaledVector(c, v);
                KR.push(p.x, p.y, p.z); KN.push(n.x, n.y, n.z); KM.push(rnd() * 6.2832, 0.35 + 0.3 * rnd(), 0.12 + 0.4 * rnd(), rnd()); KQ.push(m, rnd());
              }
            }
          });
          // NGUỒN THÊM (core/surface-style.js mossBladeSrc — vách bờ dương xỉ, tường đầu cửa xả, đá hộc: nature/bank-moss.js): lượng rêu tính sẵn, cùng luật mép thưa
          const pushB = (x, y, z, nx, ny, nz, m, h0, h1) => { if (rw() >= THREE.MathUtils.smoothstep(m, 0.1, 0.4)) return; KR.push(x, y, z); KN.push(nx, ny, nz); KM.push(rw() * 6.2832, h0 + (h1 - h0) * rw(), 0.12 + 0.4 * rw(), rw()); KQ.push(m, rw()); };
          for (const f of mossBladeSrc) f(pushB, DENS);
          const nB = KR.length / 3, NS = 4, Pp = [], Sd = [], Ix = [];   // 1 lá: 4 đoạn (dải thuôn + đỉnh ngọn) như thảm cỏ cận cảnh
          // BÓNG HỐC KHUẤT ở gốc từng lá (core/sky-shade.js): mật độ vật rắn SF_CV (lọc 3 chiều như GPU) ở gốc + 6 cm theo pháp tuyến, tính 1 lần lúc dựng
          //  ⇒ hệ số 1 − 0,6·smoothstep(0,45, 0,85, mật độ) vào aSk.x (đọc ảnh 3D ở cả 9 đỉnh / lá tốn ~0,8 ms ở zoom ×30)
          const KC = new Uint8Array(nB).fill(255), CVI = SF_CV.value && SF_CV.value.image;
          if (CVI) { const c0 = SF_CV0.value, c1 = SF_CV1.value, TX = CVI.width, TY = CVI.height, TZ = CVI.depth, TD = CVI.data, L = (p, q, t) => p + (q - p) * t;
            const at = (i, j, k) => TD[Math.min(TX - 1, Math.max(0, i)) + TX * (Math.min(TY - 1, Math.max(0, j)) + TY * Math.min(TZ - 1, Math.max(0, k)))];
            for (let b = 0; b < nB; b++) {
              const u = (KR[b * 3] + KN[b * 3] * 0.06 - c0.x) * c1.x, v = (KR[b * 3 + 1] + KN[b * 3 + 1] * 0.06 - c0.y) * c1.y, w = (KR[b * 3 + 2] + KN[b * 3 + 2] * 0.06 - c0.z) * c1.z;
              if (!(u > 0.02 && v > 0.02 && w > 0.02 && u < 0.98 && v < 0.98 && w < 0.98)) continue;
              const x = u * TX - 0.5, y = v * TY - 0.5, z = w * TZ - 0.5, i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k;
              const d = L(L(L(at(i, j, k), at(i + 1, j, k), fx), L(at(i, j + 1, k), at(i + 1, j + 1, k), fx), fy), L(L(at(i, j, k + 1), at(i + 1, j, k + 1), fx), L(at(i, j + 1, k + 1), at(i + 1, j + 1, k + 1), fx), fy), fz) / 255;
              const q = Math.min(1, Math.max(0, (d - 0.45) / 0.4)); KC[b] = Math.round(255 * (1 - 0.6 * q * q * (3 - 2 * q)));
            }
          }
          for (let r = 0; r < NS; r++) for (const sd of [-1, 1]) { Pp.push(0, r / NS, 0); Sd.push(sd); }
          Pp.push(0, 1, 0); Sd.push(0);
          for (let r = 0; r < NS - 1; r++) { const v = r * 2; Ix.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
          Ix.push((NS - 1) * 2, (NS - 1) * 2 + 1, NS * 2);
          // CHIA Ô 16 m (rêu trên cây, chân tường các nhà, vách bờ nằm xa nhau): mỗi ô 1 lưới có khung bao riêng ⇒ nhìn cận chỗ khác thì ô ngoài khung nhìn không vẽ;
          //  chung hình lá + vật liệu
          const base = { position: new THREE.Float32BufferAttribute(Pp, 3), aSd: new THREE.Float32BufferAttribute(Sd, 1) }, bins = new Map();
          for (let i = 0; i < nB; i++) { const key = Math.floor(KR[i * 3] / 16) + ':' + Math.floor(KR[i * 3 + 2] / 16); (bins.get(key) || bins.set(key, []).get(key)).push(i); }
          const geos = [...bins.values()].map(L => {
            const geo = new THREE.InstancedBufferGeometry(), pick = (A, k) => { const o = new Float32Array(L.length * k); L.forEach((i, j) => { for (let q = 0; q < k; q++) o[j * k + q] = A[i * k + q]; }); return new THREE.InstancedBufferAttribute(o, k); };
            geo.setAttribute('position', base.position); geo.setAttribute('aSd', base.aSd); geo.setIndex(Ix);
            geo.setAttribute('aRoot', pick(KR, 3)); geo.setAttribute('aNrm', pick(KN, 3)); geo.setAttribute('aMr', pick(KM, 4)); geo.setAttribute('aMo', pick(KQ, 2));
            const sk = new Uint8Array(L.length * 2).fill(255); L.forEach((i, j) => { sk[j * 2] = KC[i]; });
            geo.setAttribute('aSk', new THREE.InstancedBufferAttribute(sk, 2, true)); geo.instanceCount = L.length;   // x = hốc × lớp TÁN, y = lớp SÁT ĐẤT (1 = sáng)
            geo.boundingBox = new THREE.Box3().setFromBufferAttribute(geo.attributes.aRoot).expandByScalar(0.3); geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere()); return geo;
          });
          // BÓNG TRỜI tính sẵn từng lá (core/sky-shade.js skyOnLayer + skyAt): lớp lên ⇒ lấy mẫu ở gốc lá + 6 cm theo pháp tuyến (mặt đứng 0,75 như shader), xong
          //  mới hiện dần; shader lá không đọc ảnh — đọc 2 ảnh ở cả 9 đỉnh / lá tốn ~1 ms ở góc nhìn cả cây
          const skDone = {};
          skyOnLayer(id => (function* () {
            const c = id === 'A' ? 0 : 1; let n = 0;
            for (const geo of geos) {
              if (geo.userData['sk' + id]) continue; geo.userData['sk' + id] = 1;   // lớp TÁN nhân vào hệ số hốc ⇒ chỉ 1 lần
              const S = geo.attributes.aSk, D = S.array, R = geo.attributes.aRoot.array, N = geo.attributes.aNrm.array;
              for (let j = 0; j < S.count; j++) {
                const nx = N[j * 3], ny = N[j * 3 + 1], nz = N[j * 3 + 2], l = Math.hypot(nx, ny, nz) || 1, f = skyAt(id, R[j * 3] + nx / l * 0.06, R[j * 3 + 1] + ny / l * 0.06, R[j * 3 + 2] + nz / l * 0.06, 0.75 + 0.25 * Math.abs(ny / l));
                D[j * 2 + c] = Math.round((c ? 255 : D[j * 2]) * f);
                if (++n % 8192 === 0) yield;
              }
              S.needsUpdate = true;
            }
            skDone[id] = 1; if (!skDone.A || !skDone.B) return;   // cả 2 lớp đã ghi vào aSk ⇒ mảng từng lá hết việc trên CPU (lá không bắt tia): tải lần cuối rồi bỏ
            for (const geo of geos) for (const k of ['aRoot', 'aNrm', 'aMr', 'aMo', 'aSk']) { const a = geo.attributes[k]; if (a.array) { a.onUpload(freeAfterUpload); a.needsUpdate = true; } }
          })());
          const U = { uFade: { value: 0 }, uDensity: { value: 1 }, uCamRight: { value: new THREE.Vector3(1, 0, 0) } };
          const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          mat.onBeforeCompile = sh => {
            Object.assign(sh.uniforms, sceneWind.u, U, { uSfWet: SF_WET }); windUniforms.set(mat.uuid, sh.uniforms);
            sh.vertexShader = WIND_GLSL_COMMON + '\n' + GRASS_GLSL + '\n' + SF_NOISE + `
              attribute float aSd; attribute vec3 aRoot, aNrm; attribute vec4 aMr; attribute vec2 aMo;
              uniform float uFade, uDensity, uSfWet; uniform vec3 uCamRight;
              varying float vT, vShade; varying vec3 vBase;
              ` + sh.vertexShader
              .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = aNrm;   // sáng theo mặt vỏ bên dưới (như lá cỏ sáng theo mặt đất)')
              .replace('#include <begin_vertex>', `
                vec3 wn = normalize(aNrm); float t = position.y, r = aMr.w, id = aMo.y;
                float h = (0.09 + 0.06 * r) * (0.45 + 0.55 * smoothstep(0.15, 0.6, aMo.x)) * aMr.y * uFade * step(id, uDensity - 1e-4);   // như lá thảm (9–15 cm, mép mảng thấp dần)
                vec3 up = vec3(0.0, 1.0, 0.0), g = normalize(wn + 0.3 * up), e1 = normalize(cross(g, abs(g.y) < 0.99 ? up : vec3(1.0, 0.0, 0.0))), e2 = cross(g, e1);
                vec3 fwd = cos(aMr.x) * e1 + sin(aMr.x) * e2, s0 = cross(g, fwd); s0 *= dot(s0, uCamRight) >= 0.0 ? 1.0 : -1.0;
                vec3 sc = uCamRight - g * dot(uCamRight, g), sv = normalize(mix(s0, sc / max(length(sc), 1e-4), 0.55) + 1e-5);   // bề ngang lá: nửa theo lá, nửa vuông góc hướng nhìn
                float w = 0.0096 * (1.0 - 0.86 * t) * aSd * (0.8 + 0.4 * fract(r * 7.13)) * step(1e-5, h), bend = aMr.z * t * t * h;   // ẩn theo mức zoom: dồn cả lá về 1 điểm (khỏi vệt 2 cm trên vỏ)
                vec3 p = aRoot + (g * t + (up - g) * (0.4 * t * t)) * (h * (1.0 - 0.22 * aMr.z * t)) + fwd * bend + sv * w;   // mọc theo pháp tuyến vỏ rồi uốn lên trời
                p += grassWind(aRoot, t, h);
                vec3 mT = vec3(0.2, 0.3, 0.07) * (0.94 + 0.12 * sfN(aRoot.xz * 0.35 + 3.7)) * mix(vec3(1.05, 1.0, 0.86), vec3(0.92, 1.02, 0.96), uSfWet);   // = màu rêu trên vỏ
                vT = t; vBase = mT * 0.85; vShade = 0.94 + 0.12 * fract(r * 91.7 + id * 47.3);
                vec3 transformed = p;`);
            sh.fragmentShader = 'varying float vT, vShade; varying vec3 vBase;\n' + sh.fragmentShader
              .replace('#include <color_fragment>', `
                vec3 gBase = vBase * 0.84, gTip = mix(vBase * vec3(1.26, 1.2, 0.84), vBase * vec3(1.2, 1.3, 1.04) + vec3(0.01, 0.02, 0.0), 0.75) * 1.12;   // = lá thảm cỏ ngắn (meadow.js: vLawn 1, độ tươi 0,75)
                diffuseColor.rgb *= mix(gBase, gTip, smoothstep(0.0, 1.0, vT)) * vShade;`)
              .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n                normal = normalize( vNormal );   // 2 mặt lá sáng như mặt vỏ bên dưới');
          };
          mat.customProgramCacheKey = () => 'mossLawn2'; skyShadeMat(mat, 'moss', { skA: 'aSk' });   // bóng trời dưới tán + kẽ rễ + hốc khuất, tính sẵn từng lá (core/sky-shade.js)
          const meshes = geos.map(geo => { const mesh = new THREE.Mesh(geo, mat); mesh.name = 'Thảm rêu (lá cỏ)'; mesh.receiveShadow = true; mesh.raycast = () => {}; mesh.visible = false;
            Object.assign(mesh.userData, { noBatch: true, noBake: true, noCollide: true, noFlight: true, noRainOcc: true }); scene.add(mesh); return mesh; }), mesh = meshes[0] || null;
          const _cr = new THREE.Vector3(); let lost = false;
          listen(renderer.domElement, 'webglcontextrestored', () => { lost = geos.some(g => !g.attributes.aRoot.array); });   // mảng từng lá đã bỏ ⇒ không tải lại được: ẩn lá rêu tới khi mở lại trang
          R.length = Nn.length = Bk.length = Q.length = KR.length = KN.length = KM.length = KQ.length = 0;   // danh sách dựng (mảng số thường, ≈ 100 MB): tick() giữ ngữ cảnh của khối này ⇒ phải xoá tay
          return { blades: nB, cand: nC, st, mesh, meshes, tick() {
            const ppu = renderer.domElement.height / ((camera.top - camera.bottom) / camera.zoom), f = Math.max(0, Math.min(1, (ppu - 9) / 8));   // y như thảm cỏ (meadow.js update)
            U.uFade.value = f * f * (3 - 2 * f); const on = !lost && f > 0.001 && nB > 0; for (const m of meshes) m.visible = on; if (!on) return;
            U.uDensity.value = ppu >= 60 ? 1 : ppu >= 24 ? 0.4 : 0.25;   // số lá / ô của thảm cỏ theo mức zoom: 20 · 8 · 5
            camera.updateMatrixWorld(); _cr.setFromMatrixColumn(camera.matrixWorld, 0); U.uCamRight.value.copy(_cr);
          } };
        })();
        const mossTick = () => mossLawn.tick();
