        // ==== BÓNG TRỜI DƯỚI TÁN — chỉ ÁNH TRỜI (hemi + amb) bị che: tán lá dày, kẽ rễ, chân đá (hạ tầng) ----
        //  · Trong bóng râm dưới tán, ánh khuếch tán của bầu trời là phần chính; tán càng dày (độ thấy trời nhỏ) bóng càng sâu. Nắng lọt qua kẽ lá (bóng đổ đã có)
        //    thì sáng như ngoài trống ⇒ chỉ nhân hệ số vào reflectedLight.indirectDiffuse, không đụng nắng trực tiếp: đốm nắng giữ nguyên, bóng râm sâu như thật.
        //  · 2 lớp ảnh RG8 trên mặt bằng thế giới (x, z): R = hệ số ánh trời, G = độ cao đất của ô (y + 255·m·G — bờ sông dốc 3 → 7,2 m dưới tán cổ thụ).
        //    A = TÁN (ô 0,5 m — độ thấy trời qua lá: mật độ lá từ điểm lá, 64 tia nửa cầu phân bố cos, suy giảm Beer–Lambert với hệ số chiếu 0,5 của lá xoay
        //    ngẫu nhiên), B = SÁT ĐẤT (ô 5 cm — bóng góc kẽ rễ, chân đá: core/ao-bake.js floor). Vật cao hơn đất: lớp A tắt dần 3 → 9 m (trong tán), lớp B tắt
        //    dần 5 → 35 cm (chỉ dải sát đất). Lớp mới lên thì hiện dần trong 1,5 s (khỏi bật đột ngột khi đang nhìn).
        //  · skyShadeMat(mat, tag, { cav, cavP, vtx, skA }): nối vào vật liệu Lambert / Standard (chuỗi onBeforeCompile + khoá chương trình riêng theo tag). cav:
        //    thêm bóng góc HỐC KHUẤT từ ảnh 3D mật độ vật rắn quanh gốc cổ thụ (uSfCv — nature/moss-lawn.js mossCrevice: mặt trống ~0,5, kẽ ~0,7) — vỏ cây dùng
        //    mật độ shader vỏ đã đọc ở + 6 cm theo pháp tuyến (sfCv, core/surface-style.js), cavP (đá) đọc ngay tại điểm. vtx: 2 lớp tính ở ĐỈNH thay vì điểm ảnh
        //    (lá cỏ: ảnh 5 cm ≫ bề ngang lá, lá chồng nhiều lớp; vỏ cây: shader vỏ nặng, lưới thưa), hốc vỏ vẫn ở điểm ảnh. skA = tên thuộc tính vec2 TÍNH SẴN
        //    từng bản (lá rêu: skyOnLayer + skyAt — x = lớp A × hốc, y = lớp B) ⇒ shader không đọc ảnh. Mặt đất (grassMat, dirtMat, shoreMat) nối ở đây; cỏ,
        //    lá rêu, vỏ cây, đá tự nối ở tệp của mình. Ngoài hộp hệ số = 1 (không đọc ảnh). Vị trí thế giới: vSfP của vỏ / công trình (core/surface-style.js) ở
        //    điểm ảnh, không thì lấy ngược từ mvPosition bằng ma trận nhìn cứng (xoay + dời: chuyển vị, ~30 phép tính / đỉnh thay cho inverse()).
        //  · Dịch vụ 'skyShade': S.canopy({ pts, k, floor }) — pts = Float32Array (x, y, z, diện tích lá) toạ độ thế giới; tính dần ≤ 4 ms / khung rồi lên lớp A ·
        //    S.layer('A' | 'B', { px (RG8), NX, NZ, x0, z0, x1, z1, y, m }). Ảnh nhỏ (A ~10 KB, B ~90 KB), giữ bản RAM (mất ngữ cảnh WebGL thì three tự tải lại).
        //  · skyOnLayer(f): f(id) khi 1 lớp lên (ảnh + hộp đã đặt, chưa hiện) ⇒ trả generator tính sẵn (chạy ≤ 4 ms / khung); lớp chỉ bắt đầu hiện dần khi mọi
        //    việc tính sẵn đã xong (khỏi chỗ đã tính chỗ chưa) · skyAt(id, x, y, z, w): hệ số 1 lớp tại điểm trên CPU, như shader.
        const SKY_U = { uSkA: { value: null }, uSkB: { value: null }, uSkAB: { value: new THREE.Vector4(1e9, 1e9, 0, 0) }, uSkBB: { value: new THREE.Vector4(1e9, 1e9, 0, 0) },
          uSkY: { value: new THREE.Vector4() }, uSkK: { value: new THREE.Vector2() } };   // uSkY: (yA, mA, yB, mB) · uSkK: độ đậm 2 lớp (hiện dần 0 → 1)
        //  w (skyShade): phần bóng TÁN theo hướng mặt — mặt ngửa, mặt úp 1; mặt đứng 0,75: còn thấy dải trời sát chân trời ngoài mép tán (tán chắn từ ~15–30°
        //    trở lên ⇒ mặt đứng mất 70–80 % phần ánh trời mặt ngửa mất) — thân cây dưới tán khỏi tối đen lúc chiều.
        const SKY_GLSL = `uniform sampler2D uSkA, uSkB; uniform vec4 uSkAB, uSkBB, uSkY; uniform vec2 uSkK;
          float skyShade(vec3 p, float w) {
            float s = 1.0; vec2 a = (p.xz - uSkAB.xy) * uSkAB.zw, b = (p.xz - uSkBB.xy) * uSkBB.zw;
            if (a.x > 0.0 && a.y > 0.0 && a.x < 1.0 && a.y < 1.0) { vec2 t = texture2D(uSkA, a).rg; s *= 1.0 - w * uSkK.x * (1.0 - t.r) * (1.0 - smoothstep(3.0, 9.0, p.y - uSkY.x - 255.0 * uSkY.y * t.g)); }
            if (b.x > 0.0 && b.y > 0.0 && b.x < 1.0 && b.y < 1.0) { vec2 t = texture2D(uSkB, b).rg; s *= 1.0 - uSkK.y * (1.0 - t.r) * (1.0 - smoothstep(0.05, 0.35, p.y - uSkY.z - 255.0 * uSkY.w * t.g)); }
            return s;
          }`;
        function skyShadeMat(mat, tag, o = {}) {   // o.vtx: lớp A + B tính ở ĐỈNH (lá cỏ — ảnh 5 cm ≫ bề ngang lá, lá chồng nhiều lớp ⇒ đọc ảnh mỗi điểm ảnh tốn ~1,7 ms ở
          //  zoom ×30; vỏ cây — shader vỏ rất nặng, thêm 2 lần đọc ảnh mỗi điểm ảnh thì rễ cận cảnh chậm ~1,5 ms; lưới vỏ thưa ⇒ rẻ), hốc khuất của vỏ vẫn ở điểm ảnh
          const prev = mat.onBeforeCompile, cav = o.cav || 0, vtx = !!o.vtx;
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r); Object.assign(sh.uniforms, SKY_U);
            if (o.skA) {   // hệ số tính sẵn từng bản: chỉ hiện dần theo uSkK
              sh.vertexShader = `attribute vec2 ${o.skA}; uniform vec2 uSkK; varying float vSkS;\n` + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
                vSkS = (1.0 - uSkK.x * (1.0 - ${o.skA}.x)) * (1.0 - uSkK.y * (1.0 - ${o.skA}.y));`);
              sh.fragmentShader = 'varying float vSkS;\n' + sh.fragmentShader.replace('#include <aomap_fragment>', '#include <aomap_fragment>\n              reflectedLight.indirectDiffuse *= vSkS;');
              return;
            }
            const sf = sh.vertexShader.includes('varying vec3 vSfP');   // vỏ cây / công trình (core/surface-style.js) đã có vị trí thế giới, uSfCv + mật độ hốc sfCv
            if (cav && !sf) Object.assign(sh.uniforms, { uSfCv: SF_CV, uSfCv0: SF_CV0, uSfCv1: SF_CV1 });
            const cvU = cav && !sf ? 'uniform highp sampler3D uSfCv; uniform vec3 uSfCv0; uniform vec3 uSfCv1;\n' : '', skP = 'transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz)';
            const skW = n => `0.75 + 0.25 * abs(inverseTransformDirection(${n}, viewMatrix).y)`;   // pháp tuyến nhìn → thế giới (lá cỏ: pháp tuyến đất)
            const cv = !cav ? '' : sf && !o.cavP ? `skS *= 1.0 - ${cav.toFixed(3)} * smoothstep(0.45, 0.85, sfCv);`   // vỏ: khỏi đọc ảnh 3D lần 2
              : `{ vec3 skQ = (vSkP - uSfCv0) * uSfCv1;
                if (all(greaterThan(skQ, vec3(0.02))) && all(lessThan(skQ, vec3(0.98)))) skS *= 1.0 - ${cav.toFixed(3)} * smoothstep(0.45, 0.85, texture(uSfCv, skQ).r); }`;
            if (vtx) {   // hốc khuất (chỉ vỏ: sfCv của shader vỏ) vẫn ở điểm ảnh
              sh.vertexShader = SKY_GLSL + '\nvarying float vSkS;\n' + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
                vSkS = skyShade(${skP}, ${skW('transformedNormal')});`);
              sh.fragmentShader = 'varying float vSkS;\n' + sh.fragmentShader.replace('#include <aomap_fragment>', `#include <aomap_fragment>
              reflectedLight.indirectDiffuse *= vSkS${cav && sf ? ` * (1.0 - ${cav.toFixed(3)} * smoothstep(0.45, 0.85, sfCv))` : ''};`);
              return;
            }
            if (!sf) sh.vertexShader = 'varying vec3 vSkP;\n' + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>\n vSkP = ${skP};`);
            sh.fragmentShader = (sf ? '#define vSkP vSfP\n' : 'varying vec3 vSkP;\n' + cvU) + SKY_GLSL + '\n'
              + sh.fragmentShader.replace('#include <aomap_fragment>', `#include <aomap_fragment>
              { float skS = skyShade(vSkP, ${skW('normal')}); ${cv} reflectedLight.indirectDiffuse *= skS; }`);
          };
          const pk = mat.customProgramCacheKey.bind(mat); mat.customProgramCacheKey = () => pk() + '|sky:' + tag + (cav ? 'c' : '') + (vtx ? 'v' : '') + (o.skA ? 'a' : ''); mat.needsUpdate = true; return mat;
        }
        for (const [m, t] of [[grassMat, 'grass'], [dirtMat, 'dirt'], [shoreMat, 'shore']]) skyShadeMat(m, t);   // mặt đất (core/sky-sun-moon.js)
        const SKY = { job: null, q: [], fade: [], pre: [], pend: [], cb: [], rnd: mulberry32(0x5EED5C1) };   // rnd: dãy ngẫu nhiên riêng cho uuid ảnh mới (giữ dãy chung của cảnh tất định, như core/ao-bake.js) · pre: việc tính sẵn của lớp mới, pend: lớp chờ hiện
        function skyLayer(id, F) {   // lên 1 lớp: ảnh RG8 NX × NZ phủ [x0, x1] × [z0, z1] (hàng = z) · R hệ số ánh trời, G độ cao đất = y + 255·m·G
          const U = SKY_U['uSk' + id], old = U.value, R0 = Math.random; let t; Math.random = SKY.rnd;
          try { t = new THREE.DataTexture(F.px, F.NX, F.NZ, THREE.RGFormat, THREE.UnsignedByteType); } finally { Math.random = R0; }
          t.magFilter = t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; t.unpackAlignment = 1; t.needsUpdate = true; U.value = t; if (old) old.dispose();
          SKY_U['uSk' + id + 'B'].value.set(F.x0, F.z0, 1 / (F.x1 - F.x0), 1 / (F.z1 - F.z0));
          const c = id === 'A' ? 'x' : 'y'; if (id === 'A') SKY_U.uSkY.value.setX(F.y).setY(F.m); else SKY_U.uSkY.value.setZ(F.y).setW(F.m);
          SKY_U.uSkK.value[c] = 0; SKY.pend.push(c); for (const f of SKY.cb) { const g = f(id); if (g) SKY.pre.push(g); }
        }
        function skyOnLayer(f) { SKY.cb.push(f); }
        function skyAt(id, x, y, z, w = 1) {   // hệ số 1 lớp tại điểm thế giới trên CPU: lọc 2 chiều (kẹp mép) + tắt dần theo độ cao trên đất như skyShade
          const t = SKY_U['uSk' + id].value; if (!t) return 1;
          const B = SKY_U['uSk' + id + 'B'].value, u = (x - B.x) * B.z, v = (z - B.y) * B.w; if (!(u > 0 && v > 0 && u < 1 && v < 1)) return 1;
          const D = t.image.data, NX = t.image.width, NZ = t.image.height, fx = u * NX - 0.5, fz = v * NZ - 0.5, i = Math.floor(fx), k = Math.floor(fz), ax = fx - i, az = fz - k;
          const i0 = Math.max(0, i), i1 = Math.min(NX - 1, i + 1), k0 = Math.max(0, k) * NX, k1 = Math.min(NZ - 1, k + 1) * NX;
          const bil = c => ((D[(k0 + i0) * 2 + c] * (1 - ax) + D[(k0 + i1) * 2 + c] * ax) * (1 - az) + (D[(k1 + i0) * 2 + c] * (1 - ax) + D[(k1 + i1) * 2 + c] * ax) * az) / 255;
          const Y = SKY_U.uSkY.value, A = id === 'A', h = y - (A ? Y.x : Y.z) - 255 * (A ? Y.y : Y.w) * bil(1), e0 = A ? 3 : 0.05, e1 = A ? 9 : 0.35, q = Math.min(1, Math.max(0, (h - e0) / (e1 - e0)));
          return 1 - (A ? w : 1) * (1 - bil(0)) * (1 - q * q * (3 - 2 * q));
        }
        function* skyCanopyJob(o) {   // độ thấy trời qua lá tại mặt đất (ô 0,5 m) ⇒ hệ số ánh trời max(floor, 1 − k·(1 − thấy))
          const T0 = performance.now(), P = o.pts, k = o.k ?? 1, fl = o.floor ?? 0.3, ps = 0.5, mg = 4, NDIR = 64, mA = 0.04; let busy = 0;
          let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9;
          for (let i = 0; i < P.length; i += 4) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); z0 = Math.min(z0, P[i + 2]); z1 = Math.max(z1, P[i + 2]); }
          const gx0 = Math.floor(x0) - 1, gy0 = Math.floor(y0) - 1, gz0 = Math.floor(z0) - 1, NX = Math.ceil(x1 - gx0) + 2, NY = Math.ceil(y1 - gy0) + 2, NZ = Math.ceil(z1 - gz0) + 2, D = new Float32Array(NX * NY * NZ);
          for (let i = 0; i < P.length; i += 4) D[Math.floor(P[i] - gx0) + NX * (Math.floor(P[i + 1] - gy0) + NY * Math.floor(P[i + 2] - gz0))] += 0.5 * P[i + 3];   // ô 1 m³: hệ số tắt / m = 0,5 × diện tích lá
          const DIR = new Float32Array(NDIR * 3); for (let i = 0; i < NDIR; i++) { const u = (i + 0.5) / NDIR, r = Math.sqrt(u), t = i * 2.39996; DIR.set([r * Math.cos(t), Math.sqrt(1 - u), r * Math.sin(t)], i * 3); }
          const vx0 = gx0 - mg, vz0 = gz0 - mg, VNX = Math.ceil((NX + 2 * mg) / ps), VNZ = Math.ceil((NZ + 2 * mg) / ps), px = new Uint8Array(VNX * VNZ * 2), G = new Float32Array(VNX * VNZ);
          let gMin = 1e9; for (let kk = 0; kk < VNZ; kk++) for (let i = 0; i < VNX; i++) { const y = cowY(vx0 + (i + 0.5) * ps, vz0 + (kk + 0.5) * ps); G[kk * VNX + i] = y; gMin = Math.min(gMin, y); }
          for (let kk = 0; kk < VNZ; kk++) {
            for (let i = 0; i < VNX; i++) {
              const x = vx0 + (i + 0.5) * ps, z = vz0 + (kk + 0.5) * ps, y = G[kk * VNX + i] + 0.1; let vis = 0;
              for (let d = 0; d < NDIR * 3; d += 3) { const dx = DIR[d], dy = DIR[d + 1], dz = DIR[d + 2]; let tau = 0;
                for (let s = 0.25; ; s += 0.5) { const a = Math.floor(x + dx * s - gx0), b = Math.floor(y + dy * s - gy0), c = Math.floor(z + dz * s - gz0);
                  if (b >= NY || (a < 0 && dx <= 0) || (a >= NX && dx >= 0) || (c < 0 && dz <= 0) || (c >= NZ && dz >= 0)) break;   // tia đã ra khỏi hộp lá và đi xa dần
                  if (a >= 0 && b >= 0 && c >= 0 && a < NX && c < NZ) tau += 0.5 * D[a + NX * (b + NY * c)]; }
                vis += Math.exp(-tau); }
              const e = Math.min(1, Math.min(i, kk, VNX - 1 - i, VNZ - 1 - kk) / 2), q = (kk * VNX + i) * 2;   // mép ảnh = 1 (khỏi lộ hộp)
              px[q] = Math.round(255 * (1 - (1 - Math.max(fl, 1 - k * (1 - vis / NDIR))) * e)); px[q + 1] = Math.min(255, Math.round((G[kk * VNX + i] - gMin) / mA));
            }
            if ((busy += VNX) > 60) { busy = 0; yield; }
          }
          skyLayer('A', { px, NX: VNX, NZ: VNZ, x0: vx0, z0: vz0, x1: vx0 + VNX * ps, z1: vz0 + VNZ * ps, y: gMin, m: mA });
          let mn = 255; for (let i = 0; i < px.length; i += 2) mn = Math.min(mn, px[i]);
          SKY.stat = { ms: Math.round(performance.now() - T0), leaves: P.length / 4, grid: [NX, NY, NZ], px: [VNX, VNZ], min: mn };
        }
        worldTick('afterRender', 96, () => {   // tính dần sau khi vẽ, ≤ 4 ms / khung · lớp mới hiện dần khi việc tính sẵn của nó đã xong
          for (let i = SKY.fade.length - 1; i >= 0; i--) { const [c, t0] = SKY.fade[i], f = Math.min(1, (performance.now() - t0) / 1500); SKY_U.uSkK.value[c] = f * f * (3 - 2 * f); if (f >= 1) SKY.fade.splice(i, 1); }
          const t0 = performance.now(); while (SKY.pre.length && performance.now() - t0 < 4) if (SKY.pre[0].next().done) SKY.pre.shift();
          if (!SKY.pre.length && SKY.pend.length) { for (const c of SKY.pend) SKY.fade.push([c, performance.now()]); SKY.pend.length = 0; }
          if (!SKY.job) { if (!SKY.q.length) return; SKY.job = skyCanopyJob(SKY.q.shift()); }
          while (performance.now() - t0 < 4) if (SKY.job.next().done) { SKY.job = null; break; }
        });
        worldServe('skyShade', { canopy: o => SKY.q.push(o), layer: skyLayer });
