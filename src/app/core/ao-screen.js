        // ==== BÓNG GÓC MÀN HÌNH (hạ tầng, sau core/lens.js — dùng khung tạm + ảnh độ sâu của ống kính): GTAO (Jimenez và cs. 2016, như XeGTAO) cho camera trực giao ====
        //  Ánh trời / ánh hắt (hemi, amb, LightProbe của core/atmosphere.js) không có bóng ⇒ chân ghế, khe giữa khối đất, gầm xe, gốc cây sáng như mặt đất trống.
        //  (0) ảnh độ sâu nửa phân giải = khoảng cách XA NHẤT trong 2 × 2 điểm (R32F) ⇒ cọng cỏ, sợi dây mảnh ≤ 1 điểm ảnh biến mất: không còn là vật che, không
        //  làm nhiễu pháp tuyến (thử ×10 ở trại: không lọc ⇒ thảm cỏ loang lổ từng mảng). Mỗi điểm ảnh nửa phân giải: vị trí (x, y theo điểm ảnh, z từ (0)), pháp tuyến
        //  từ 4 ô quanh (bên gần hơn mỗi trục, Turánszki 2019), 2 lát
        //  nửa cầu nhìn xoay theo mẫu Bayer 4 × 4; mỗi lát đi 2 phía 6 bước tìm chân trời cao nhất trong bán kính AO.r (m), mẫu xa hơn 40 % bán kính mờ dần (vật
        //  phía trước xa không che), tích phân phần trời có trọng số cos giữa 2 chân trời đúng công thức. Camera trực giao ⇒ hướng nhìn V = (0, 0, 1) mọi điểm,
        //  bán kính điểm ảnh không đổi theo độ sâu (= AO.r × điểm ảnh / m, trần AO.maxPx). Làm mờ 4 × 4 theo mặt phẳng tiếp tuyến (độ sâu dự đoán từ độ dốc —
        //  mặt đất nghiêng không bị coi là mép) ⇒ hết hoa văn Bayer, giữ mép vật; ghép ở core/lens.js (lnPre, lnOut: phóng theo độ sâu).
        //  Thảm cỏ (nature/meadow.js, lá dày 20 / ô 0,6 m): lọc 2 × 2 chưa đủ khi lá rộng ≥ 2 điểm ảnh (×20: cỏ lốm đốm trong khi đất trống AO mượt) ⇒ khi
        //  AO bật (AO_MARK = 1) lá ghi ĐỘ CAO TRÊN ĐẤT vào alpha khung tạm (1 − h / (2 AO_GH)); (0) và phóng cộng h / sin góc cúi vào khoảng cách = mặt đất dưới lá
        //  theo tia nhìn ⇒ lá không che, không nhiễu pháp tuyến, nhận AO của đất dưới nó. Vẽ cùng lượt (1) như cũ (thử lượt cỏ riêng: cỏ đè lên tán cây bán trong
        //  suốt). Bẫy MSAA: màu (alpha) gộp trung bình 4 mẫu, độ sâu lấy 1 mẫu ⇒ mép lá hạ sai (hố / gò giả ⇒ thảm cỏ loang lổ, hết khi tắt MSAA) ⇒ (0) ô 2 × 2
        //  có điểm alpha = 1 thì chỉ dùng điểm đó (xa nhất), cả 4 có lá thì chỉ hạ điểm alpha thấp nhất (phủ kín nhất). Vật trong suốt đè lên cỏ trộn alpha về 1.
        //  Bẫy: ShaderMaterial đục tự ghi alpha < 1 ⇒ bị coi là lá (đã quét: không có); vẽ thẳng ra màn hình AO_MARK = 0 (alpha < 1 ⇒ canvas trong suốt).
        //  AO chỉ che ÁNH GIÁN TIẾP: màu cuối = ánh trời × ao + nắng ⇒ nhân màu với mix(1, ao, fr), fr = ánh trời / (ánh trời + nắng) tại điểm đó — nắng lấy từ bản đồ
        //  bóng của đèn chính (1 mẫu, RGBA nén như three r160 texture2DCompare; ngoài khung bóng ⇒ coi như nắng) × cos góc tới theo pháp tuyến dựng lại; ánh trời =
        //  độ chói hemi (đất → trời theo pháp tuyến) + amb ⇒ đất trống giữa nắng tối ~½ phần AO, bóng râm / đêm đủ (đúng tuyến tính trước tone map). Sương thấp
        //  (core/atmosphere.js, cùng công thức tích phân) phía trước ⇒ AO mờ theo; sương xa (fog near → far) ⇒ về 1; nền trời = 1.
        //  Chỉ chạy khi ống kính bật (khung tạm đã có): độ mạnh = AO.k × min(bán kính AO_PX0 → AO_PX1 điểm ảnh khung vẽ, LENS.s) ⇒ hiện dần ×2 → ×3, nhìn gần thẳng
        //  xuống (ống kính tắt) không có. Đo (bộ đệm 1979 × 1117, vẽ + chờ GPU): +0,2–0,6 ms khi ống kính bật; vẽ qua khung tạm chỉ để AO ở ×1,5 tốn +4 ms ⇒ bỏ.
        //  RAM thêm ~3,5 MB (hz + ha + hb). Đầu dò: AO.k = 0 ⇒ tắt (so cùng khung).
        //  TẮT MẶC ĐỊNH (k = 0 ⇒ không lượt nào, không RAM, cỏ không ghi alpha): camera trượt ⇒ nhấp nháy. Đo dời camera đúng 1 px / khung, so khung đã dời khớp
        //  (‰ điểm ảnh lệch > 6/255 mỗi khung, ống kính bật): cỏ ×10 1,3 → 5,3, cây táo già ×14 2,6 → 8,7, xe ×20 2,1 → 3,7. Nguồn: lưới nửa phân giải + mẫu Bayer
        //  khoá theo màn hình, lọc xa nhất 2 × 2 ⇒ lá, thân mảnh, nét viền lúc có lúc không trong ảnh độ sâu AO; không có tích luỹ theo thời gian (TAA) để san.
        //  Bật lại cần tích luỹ AO theo khung trước (chiếu lại theo độ sâu) + kẹp lân cận, đo lại bằng phép dời 1 px.
        const AO = { k: 0, power: 1.3, r: 0.9, maxPx: 40, hz: null, ha: null, hb: null, w: 0, h: 0 };
        const AO_PX0 = 6, AO_PX1 = 12, AO_GH = 0.6, AO_MARK = { value: 0 }, _aoS = new THREE.Vector2(), _aoD = new THREE.Vector3();   // AO_GH: độ cao lá lớn nhất ghi được (m) · AO_MARK: lá ghi alpha (nature/meadow.js)
        const aoPrep = lnMat({ tD: { value: null }, tC: { value: null }, uFull: { value: new THREE.Vector2(1, 1) } },   // (0) xa nhất 2 × 2 → khoảng cách tuyến tính (m), điểm ảnh lá hạ về đất
          ' uniform sampler2D tD, tC; uniform vec2 uFull; void main() { vec2 b = floor(gl_FragCoord.xy) * 2.0 + 0.5; float m = -1.0, am = 2.0, zm = 0.0;'
          + ' for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) { vec2 q = (b + vec2(float(i), float(j))) / uFull; float z = lnZ(texture2D(tD, q).x), a = texture2D(tC, q).a;'
          + ' if (a > 0.998) m = max(m, z); else if (a < am) { am = a; zm = z + (1.0 - a) * uAoE; } }'   // không lá: xa nhất · cả 4 có lá: điểm phủ nhiều nhất hạ về đất
          + ' gl_FragColor = vec4(m >= 0.0 ? m : zm, 0.0, 0.0, 1.0); }');
        const aoRaw = lnMat({ tZ: { value: null }, uHalf: { value: new THREE.Vector2(1, 1) }, uXY: { value: new THREE.Vector4() }, uRPx: { value: 1 }, uRad: { value: 1 }, uPow: { value: 1 }, uFog: { value: new THREE.Vector2(1e9, 2e9) },
            uCW: { value: new THREE.Matrix4() }, uShM: { value: new THREE.Matrix4() }, tSh: { value: null }, uShOn: { value: 0 }, uShB: { value: new THREE.Vector2() }, uSunL: { value: new THREE.Vector3(0, 1, 0) },
            uAmb: { value: new THREE.Vector3(1, 1, 0) }, uSunE: { value: 0 }, fogH: { value: ATM.fogH }, fogV: { value: ATM.fogV } },
          ` uniform sampler2D tZ, tSh; uniform vec2 uHalf, uFog, uShB; uniform vec4 uXY, fogH, fogV; uniform float uRPx, uRad, uPow, uShOn, uSunE; uniform mat4 uCW, uShM; uniform vec3 uSunL, uAmb; const float HPI = 1.5707963;
          vec3 aoV(vec2 q) { return vec3((q * 2.0 - 1.0) * uXY.xy + uXY.zw, -texture2D(tZ, q).r); }
          void main() {
            vec2 tx = 1.0 / uHalf, uv = gl_FragCoord.xy * tx; vec3 P = aoV(uv);
            if (-P.z >= uFr * 0.9999) { gl_FragColor = vec4(1.0); return; }
            float fog = smoothstep(uFog.x, uFog.y, -P.z);
            if (fog >= 1.0) { gl_FragColor = vec4(1.0); return; }
            vec3 pr = aoV(uv + vec2(tx.x, 0.0)), pl = aoV(uv - vec2(tx.x, 0.0)), pu = aoV(uv + vec2(0.0, tx.y)), pd = aoV(uv - vec2(0.0, tx.y));
            vec3 dx = abs(pr.z - P.z) < abs(P.z - pl.z) ? pr - P : P - pl, dy = abs(pu.z - P.z) < abs(P.z - pd.z) ? pu - P : P - pd;
            vec3 N = normalize(cross(dx, dy)), V = vec3(0.0, 0.0, 1.0);
            vec2 c = mod(floor(gl_FragCoord.xy), 4.0), c1 = mod(c, 2.0), c2 = floor(c / 2.0);
            float n0 = (4.0 * mod(2.0 * c1.x + 3.0 * c1.y, 4.0) + mod(2.0 * c2.x + 3.0 * c2.y, 4.0) + 0.5) / 16.0, jit = fract(n0 * 5.0 + 0.1875);
            float fR = 0.6 * uRad, fMul = -1.0 / fR, fAdd = (uRad - fR) / fR + 1.0, vis = 0.0;
            for (int s = 0; s < 2; s++) {
              float phi = (float(s) + n0) * HPI; vec2 om = vec2(cos(phi), sin(phi));
              vec3 dir = vec3(om, 0.0), axis = normalize(cross(dir, V)), pn = N - axis * dot(N, axis);
              float pnl = length(pn), cosN = clamp(dot(pn, V) / max(pnl, 1e-4), 0.0, 1.0), n = sign(dot(dir, pn)) * acos(cosN);
              float lo0 = cos(n + HPI), lo1 = cos(n - HPI), h0 = lo0, h1 = lo1;
              for (int j = 0; j < 6; j++) {
                float t = (float(j) + jit) / 6.0; vec2 off = om * (t * t * uRPx + 1.0) * tx;
                vec3 s0 = aoV(uv + off) - P, s1 = aoV(uv - off) - P; float l0 = length(s0), l1 = length(s1);
                h0 = max(h0, mix(lo0, s0.z / max(l0, 1e-5), clamp(l0 * fMul + fAdd, 0.0, 1.0)));
                h1 = max(h1, mix(lo1, s1.z / max(l1, 1e-5), clamp(l1 * fMul + fAdd, 0.0, 1.0)));
              }
              float a0 = -acos(clamp(h1, -1.0, 1.0)), a1 = acos(clamp(h0, -1.0, 1.0)), sn = sin(n);
              a0 = n + clamp(a0 - n, -HPI, HPI); a1 = n + clamp(a1 - n, -HPI, HPI);
              vis += mix(pnl, 1.0, 0.05) * ((cosN + 2.0 * a0 * sn - cos(2.0 * a0 - n)) + (cosN + 2.0 * a1 * sn - cos(2.0 * a1 - n))) * 0.25;
            }
            vec3 W = (uCW * vec4(P, 1.0)).xyz, Nw = normalize(mat3(uCW) * N); float ndl = max(dot(Nw, uSunL), 0.0), lit = 1.0, mist = 0.0;
            if (uShOn > 0.5 && ndl > 0.0) { vec4 sc = uShM * vec4(W + Nw * uShB.y, 1.0); sc.xyz /= sc.w; sc.z += uShB.x;
              if (sc.x >= 0.0 && sc.x <= 1.0 && sc.y >= 0.0 && sc.y <= 1.0 && sc.z <= 1.0) lit = step(sc.z, unpackRGBAToDepth(texture2D(tSh, sc.xy))); }
            float am = mix(uAmb.x, uAmb.y, 0.5 + 0.5 * Nw.y) + uAmb.z, fr = am / max(am + lit * ndl * uSunE, 1e-4);   // phần ánh gián tiếp
            if (fogV.w > 0.0 && fogH.x > 0.0) { float a = max(-fogV.y, 0.05), dy = W.y - fogH.z;   // sương thấp trước điểm này (như fog_fragment của core/atmosphere.js)
              mist = fogH.w * (1.0 - exp(-max(fogH.x * (exp(-fogH.y * max(dy, -2.0)) - exp(-fogH.y * (dy + a * (-P.z)))) / (fogH.y * a), 0.0))); }
            gl_FragColor = vec4(mix(1.0, pow(clamp(vis * 0.5, 0.03, 1.0), uPow), fr * (1.0 - mist) * (1.0 - fog)), 1.0, 1.0, 1.0);
          }`);
        //  làm mờ 4 × 4 (mỗi ô của mẫu Bayer 1 lần): trọng số theo độ lệch so với mặt phẳng qua tâm (độ dốc lấy bên gần hơn mỗi trục) ⇒ đất nghiêng mờ đều, mép vật giữ
        const aoBlur = lnMat({ tZ: { value: null }, tR: { value: null }, uHalf: { value: new THREE.Vector2(1, 1) }, uZk: { value: 1 } },
          ` uniform sampler2D tZ, tR; uniform vec2 uHalf; uniform float uZk;
          float aoZ(vec2 fc) { return texture2D(tZ, fc / uHalf).r; }
          void main() {
            vec2 fc = gl_FragCoord.xy; float zc = aoZ(fc), zr = aoZ(fc + vec2(1.0, 0.0)), zl = aoZ(fc - vec2(1.0, 0.0)), zu = aoZ(fc + vec2(0.0, 1.0)), zd = aoZ(fc - vec2(0.0, 1.0));
            float gx = abs(zr - zc) < abs(zc - zl) ? zr - zc : zc - zl, gy = abs(zu - zc) < abs(zc - zd) ? zu - zc : zc - zd, s = 0.0, w = 0.0;
            for (int j = -2; j <= 1; j++) for (int i = -2; i <= 1; i++) { vec2 o = vec2(float(i), float(j));
              float k = exp(-abs(aoZ(fc + o) - zc - gx * o.x - gy * o.y) * uZk); s += texture2D(tR, (fc + o) / uHalf).r * k; w += k; }
            gl_FragColor = vec4(s / max(w, 1e-4), 1.0, 1.0, 1.0);
          }`);
        function aoPxPerM(h) { return camera.projectionMatrix.elements[5] * h / 2; }   // camera trực giao: điểm ảnh (cao h) mỗi mét
        function aoWeight() {   // 0..1: bán kính AO trên màn hình AO_PX0 → AO_PX1 điểm ảnh khung vẽ
          if (!(AO.k > 0) || !renderer.capabilities.isWebGL2) return 0;   // ảnh độ sâu R32F cần WebGL2
          renderer.getDrawingBufferSize(_aoS); return THREE.MathUtils.smoothstep(AO.r * aoPxPerM(_aoS.y), AO_PX0, AO_PX1);
        }
        function aoFree() { for (const k of ['hz', 'ha', 'hb']) if (AO[k]) { AO[k].dispose(); AO[k] = null; } lnU.uAoK.value = 0; lnU.tAO.value = lnU.tAZ.value = null; }
        listen(renderer.domElement, 'webglcontextrestored', () => { AO.hz = AO.ha = AO.hb = null; });
        function aoRun(wt) {   // sau lượt (1) của lensRender: LENS.rt có màu + độ sâu (alpha: độ cao lá cỏ)
          const w = LENS.w, h = LENS.h, hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1);
          if (!AO.ha || AO.w !== hw || AO.h !== hh) {
            for (const k of ['hz', 'ha', 'hb']) if (AO[k]) AO[k].dispose();
            const o = { depthBuffer: false, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
            AO.hz = new THREE.WebGLRenderTarget(hw, hh, { ...o, type: THREE.FloatType });   // 4 byte / điểm (~2,3 MB ở trần 2K)
            AO.ha = new THREE.WebGLRenderTarget(hw, hh, o); AO.hb = new THREE.WebGLRenderTarget(hw, hh, o); AO.w = hw; AO.h = hh;   // 1 byte / điểm (~0,6 MB mỗi ảnh)
          }
          const pm = aoPxPerM(h), rp = Math.min(AO.r * pm / 2, AO.maxPx), Z = aoPrep.uniforms, R = aoRaw.uniforms, B = aoBlur.uniforms, F = scene.fog, e = camera.projectionMatrixInverse.elements;
          Z.tD.value = LENS.rt.depthTexture; Z.uFull.value.set(w, h); Z.tC.value = LENS.rt.texture;
          camera.getWorldDirection(_aoD); lnU.uAoE.value = 2 * AO_GH / Math.max(0.2, -_aoD.y);   // alpha lá → thêm khoảng cách tới đất theo tia nhìn
          R.tZ.value = B.tZ.value = AO.hz.texture; R.uHalf.value.set(hw, hh); R.uXY.value.set(e[0], e[5], e[12], e[13]);   // camera trực giao: x, y theo điểm ảnh, không theo độ sâu
          R.uRPx.value = rp; R.uRad.value = rp * 2 / pm; R.uPow.value = AO.power; R.uFog.value.set(F ? F.near : 1e9, F ? F.far : 2e9);   // trần điểm ảnh ⇒ bán kính mét co theo
          const sm = sun.castShadow && sun.shadow.map, lum = c => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;   // nắng: bản đồ bóng đèn chính (vẽ trong lượt (1) khung này)
          R.uCW.value.copy(camera.matrixWorld); R.uShOn.value = sm ? 1 : 0; R.tSh.value = sm ? sm.texture : null; if (sm) R.uShM.value.copy(sun.shadow.matrix); R.uShB.value.set(sun.shadow.bias, sun.shadow.normalBias);
          R.uSunL.value.copy(sun.position).sub(sun.target.position).normalize(); R.uSunE.value = lum(sun.color) * sun.intensity;
          R.uAmb.value.set(lum(hemi.groundColor) * hemi.intensity, lum(hemi.color) * hemi.intensity, lum(amb.color) * amb.intensity);
          B.tR.value = AO.ha.texture; B.uHalf.value.set(hw, hh); B.uZk.value = 1 / (0.15 + 4 / pm);   // dung sai lệch mặt phẳng: 15 cm + 2 điểm nửa phân giải
          lnPass(aoPrep, AO.hz); lnPass(aoRaw, AO.ha); lnPass(aoBlur, AO.hb);
          lnU.tAO.value = AO.hb.texture; lnU.tAZ.value = AO.hz.texture; lnU.uAoT.value.set(1 / hw, 1 / hh); lnU.uAoK.value = AO.k * wt; lnU.uAoZ.value = 1 / (0.1 + 3 / pm);   // phóng: dung sai 10 cm + 3 điểm ảnh
        }
