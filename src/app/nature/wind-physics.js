        // ===== GIÓ v2 — mô hình vật lý lớp biên khí quyển, đầu vào Open-Meteo (tốc độ + hướng + gió giật ở 10 m) =====
        // 1) Gió trung bình tăng theo độ cao kiểu LOG: U(z) = U10·ln(z/z0)/ln(10/z0), z0 = 0,1 m (cỏ lẫn cây thưa) → sát đất ~½ U10, ngọn cây cổ thụ > U10.
        // 2) Nhiễu loạn 3D TỔNG HỢP từ 6 mode Fourier ngẫu nhiên (kiểu Kraichnan): biên độ ⊥ véc-tơ sóng (trường không phân kỳ), năng lượng theo phổ
        //    von Kármán–Kolmogorov (E ∝ k^−5/3 ⇒ a ∝ λ^⅓, bước sóng 3–34 đv), xoáy dẹt kéo dài 2× theo chiều gió (vệt gió). Cả trường TRÔI theo gió
        //    với vận tốc đối lưu ≈ U10 (giả thuyết "nhiễu loạn đông cứng" của Taylor) → một cơn giật lướt qua cỏ, cây, khói lần lượt, như sóng honami.
        // 3) Cường độ nhiễu loạn I = σu/U lấy từ hệ số giật G = giật/TB (G = 1 + g·I, g ≈ 3,2; thiếu số liệu → 0,22); σv = 0,8σu; σw theo ĐỘ ỔN ĐỊNH khí quyển
        //    kiểu Pasquill: trưa nắng gió nhẹ → bất ổn (đối lưu mạnh, σw lớn, khói "vòng lượn"); đêm quang gió nhẹ → ổn định (σw nhỏ, khói "dàn quạt").
        // Tốc độ hiển thị: U10_cảnh = 0,25 + 0,2·U10 (m/s) đv/s — cảnh thu nhỏ, dùng tốc độ thật thì lá bay khỏi khung trong vài giây.
        const WIND_N = 6, WIND_Z0 = 0.1, WIND_M_PER_U = 1.15, WIND_LAMS = [34, 21, 13, 8, 5, 3.2];
        const WIND_SREF = 0.25 + 0.2 * (30 / 3.6);   // U10_cảnh ở 30 km/h — mốc chuẩn hoá lực gió
        const TREE_SWAY_K = 0.25;   // cây (thân, cành, lá, rừng) rung lắc: đã giảm 2 lần × ½
        const sceneWind = {
          dir: new THREE.Vector2(0.977, 0.213), speed: 8, U: 0.69, I: 0.22, stab: 0, sig: new THREE.Vector3(0.15, 0.08, 0.12), ms: 2.2,
          k: 0.27, gust: 1, sceneSpeed: 0.69,   // giữ tên cũ cho chỗ khác đọc
          modes: [], phase: new Float64Array(WIND_N), flutPhase: 0,
          u: { uTime: { value: 0 }, uWindDir: { value: new THREE.Vector2(0.977, 0.213) }, uWindU: { value: 0.69 }, uFlutPhase: { value: 0 },
            uTk: { value: Array.from({ length: WIND_N }, () => new THREE.Vector4()) }, uTa: { value: Array.from({ length: WIND_N }, () => new THREE.Vector4()) },
            uWMap: { value: new THREE.DataTexture(new Uint16Array(4), 1, 1, THREE.RGBAFormat, THREE.HalfFloatType) }, uWBox: { value: new THREE.Vector4(0, 0, 1, 1) }, uWOn: { value: 0 } }
        };
        // ---- BẢN ĐỒ GIÓ Navier–Stokes 2D ở độ cao tán (nature/fluids.js giải ở luồng phụ, nature/wind-field.js dựng vật cản): mỗi ô RGBA half-float =
        //      gió trung bình CHUẨN HOÁ theo gió tự do (x, z — đã gồm hướng: sau nhà/xe/rừng nhỏ đi, lệch hướng vòng qua vật cản; đỉnh đồi, mặt hồ lớn hơn)
        //      · hệ số nhiễu loạn (mép vệt khuất gió cao hơn). on: 0 → 1 trong 3 s khi có kết quả đầu (khỏi giật cảnh) ----
        const windMap = { on: 0, data: null, x0: 0, z0: 0, nx: 1, nz: 1, dx: 1 };
        const _hP2 = Array.from({ length: 31 }, (_, e) => Math.pow(2, e - 15));
        const halfF = hv => { const e = (hv >> 10) & 0x1f, m = hv & 0x3ff, sg = hv & 0x8000 ? -1 : 1; return e ? sg * _hP2[e] * (1 + m / 1024) : sg * m * 5.960464477539063e-8; };
        function windMapSample(x, z, out) {   // → out (gió TB chuẩn hoá x, z · hệ số nhiễu loạn); khớp phép lấy mẫu LinearFilter trên GPU
          const M = windMap, D = sceneWind.dir; out.set(D.x, D.y, 1); if (!M.on || !M.data) return out;
          const fx = Math.min(M.nx - 1.0001, Math.max(0, (x - M.x0) / M.dx - 0.5)), fz = Math.min(M.nz - 1.0001, Math.max(0, (z - M.z0) / M.dx - 0.5));
          const a = fx | 0, b = fz | 0, tx = fx - a, tz = fz - b, c = (b * M.nx + a) * 4, r = M.nx * 4, d = M.data, k = M.on;
          const s = ch => (halfF(d[c + ch]) * (1 - tx) + halfF(d[c + 4 + ch]) * tx) * (1 - tz) + (halfF(d[c + r + ch]) * (1 - tx) + halfF(d[c + r + 4 + ch]) * tx) * tz;
          return out.set(D.x + (s(0) - D.x) * k, D.y + (s(1) - D.y) * k, 1 + (s(2) - 1) * k);
        }
        { const r = mulberry32(51423); let sum = 0;
          for (let n = 0; n < WIND_N; n++) {
            const lam = WIND_LAMS[n], k = TAU / lam, th = r() * TAU, el = (r() - 0.5) * 1.2;
            const kw = new THREE.Vector3(Math.cos(el) * Math.cos(th) * k * 0.5, Math.sin(el) * k, Math.cos(el) * Math.sin(th) * k);   // hệ (dọc gió, đứng, ngang gió); dọc gió ×0,5 = xoáy dài gấp đôi
            const kh = kw.clone().normalize(), e = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5); e.addScaledVector(kh, -e.dot(kh)).normalize();   // biên độ ⊥ k → ∇·u = 0
            const a = Math.cbrt(lam); sum += a * a / 2;
            sceneWind.modes.push({ kw, e, a, k: kw.length() }); sceneWind.phase[n] = r() * TAU;
          }
          // chuẩn hoá RIÊNG từng thành phần (dọc gió / đứng / ngang gió) về phương sai 1 — với chỉ 6 mode, chia đều ngẫu nhiên sẽ lệch tới ±30%
          const va = sceneWind.modes.reduce((v, m) => v + (m.a * m.e.x) ** 2 / 2, 0), vy = sceneWind.modes.reduce((v, m) => v + (m.a * m.e.y) ** 2 / 2, 0), vc = sceneWind.modes.reduce((v, m) => v + (m.a * m.e.z) ** 2 / 2, 0);
          for (const m of sceneWind.modes) { m.ea = m.a * m.e.x / Math.sqrt(va); m.ey = m.a * m.e.y / Math.sqrt(vy); m.ec = m.a * m.e.z / Math.sqrt(vc); }
        }
        const _wkW = Array.from({ length: WIND_N }, () => new THREE.Vector3()), _waW = Array.from({ length: WIND_N }, () => new THREE.Vector3());
        function windProfile(zu) { return Math.log(Math.max(zu * WIND_M_PER_U, 2 * WIND_Z0) / WIND_Z0) / Math.log(10 / WIND_Z0); }
        function windTurb(x, y, z, out) {
          out.set(0, 0, 0); const P = sceneWind.phase;
          for (let n = 0; n < WIND_N; n++) { const k = _wkW[n], a = _waW[n], c = Math.cos(k.x * x + k.y * y + k.z * z + P[n]); out.x += a.x * c; out.y += a.y * c; out.z += a.z * c; }
          return out;
        }
        const _wmS = new THREE.Vector3();
        function windAt(x, y, z, zAbove, out) {   // gió (đv/s) tại điểm có độ cao zAbove trên mặt đất: trung bình (bản đồ gió × profile log) + nhiễu loạn
          const f = windProfile(zAbove), g = Math.min(1.1, Math.max(0.3, 0.35 + 0.65 * f)), m = windMapSample(x, z, _wmS);
          windTurb(x, y, z, out).multiplyScalar(g * m.z);
          out.x += m.x * sceneWind.U * f; out.z += m.y * sceneWind.U * f;
          return out;
        }
        // cùng công thức trên GPU (6 cos/đỉnh) — CPU & GPU dùng chung pha/véc-tơ sóng nên vật đậu trên cành khớp đúng cành
        const WIND_GLSL_COMMON = `
          uniform float uTime; uniform vec2 uWindDir; uniform float uWindU; uniform vec4 uTk[${WIND_N}]; uniform vec4 uTa[${WIND_N}]; uniform float uFlutPhase;
          uniform sampler2D uWMap; uniform vec4 uWBox; uniform float uWOn;
          vec3 windTurb(vec3 p) { vec3 u = vec3(0.0); for (int i = 0; i < ${WIND_N}; i++) u += uTa[i].xyz * cos(dot(uTk[i].xyz, p) + uTa[i].w); return u; }
          float windProf(float zu) { return log(max(zu * ${WIND_M_PER_U.toFixed(2)}, ${(2 * WIND_Z0).toFixed(2)}) / ${WIND_Z0.toFixed(2)}) / ${Math.log(10 / WIND_Z0).toFixed(6)}; }
          vec3 windVec(vec3 p, float zu) {
            float f = windProf(zu); vec3 m = mix(vec3(uWindDir, 1.0), texture2D(uWMap, (p.xz - uWBox.xy) * uWBox.zw).xyz, uWOn);   // bản đồ gió NS: hướng + độ lớn TB · nhiễu loạn
            return vec3(m.x, 0.0, m.y) * (uWindU * f) + windTurb(p) * (clamp(0.35 + 0.65 * f, 0.3, 1.1) * m.z);
          }`;
        // Dịch đỉnh trong HỆ THẾ GIỚI (sau instanceMatrix + modelMatrix) — mọi lá/cọng dù xoay ngẫu nhiên đều theo cùng 1 trường gió
        function injectWorldWind(mat, own, header, dispExpr, key) {
          mat.onBeforeCompile = (shader) => {
            Object.assign(shader.uniforms, sceneWind.u, own);
            windUniforms.set(mat.uuid, shader.uniforms);
            shader.vertexShader = WIND_GLSL_COMMON + '\n' + header + '\n' + shader.vertexShader.replace('#include <project_vertex>', `
              vec4 mvPosition = vec4( transformed, 1.0 );
              vec3 windSeed = vec3( 0.0 ); mat4 windIM = mat4( 1.0 );
              #ifdef USE_INSTANCING
                mvPosition = instanceMatrix * mvPosition; windSeed = vec3( instanceMatrix[ 3 ] ); windIM = instanceMatrix;
              #endif
              vec4 windW = modelMatrix * mvPosition;
              vec3 windD = ${dispExpr};
              windW.xyz += windD;
              mvPosition = viewMatrix * windW;
              gl_Position = projectionMatrix * mvPosition;`).replace('#include <worldpos_vertex>', `#include <worldpos_vertex>
              #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
                worldPosition.xyz += windD;
              #endif`);
          };
          mat.customProgramCacheKey = () => key; mat.needsUpdate = true;
          return mat;
        }
        // ---- CÂY có mô hình thân riêng: thân + tán là con lắc lò xo 2 chiều tắt dần bị LỰC CẢN của gió tại tâm áp lực tán đẩy.
        //      Lực ∝ |U|^(2+V) với số mũ Vogel V ≈ −0,7 (tán và lá xếp gọn khi gió to ⇒ lực tăng chậm hơn bình phương); hệ số tắt dần = cấu trúc
        //      (lá làm tăng) + khí động (tăng theo gió); lắc ngang gió đến từ thành phần nhiễu loạn ngang chứ không phải sóng sin dựng sẵn.
        //      Cành: tần số riêng 1–3 Hz cao hơn tần số cơn giật ⇒ đáp ứng gần như tĩnh với gió ĐỊA PHƯƠNG tại chính cành (bị gió "đánh" — buffeting).
        //      Lá: rung (flutter) tần số chỉ tăng nhẹ theo gió, biên độ bão hoà — đúng quan sát gió nhẹ do lá rung chi phối, gió mạnh do cành chi phối.
        //      CÀNH CÓ QUÁN TÍNH (3 dao động riêng ghép với thân — "giảm chấn đa cộng hưởng", Spatz 2007 · "giảm chấn khối lượng", James 2003): cành lớn
        //      tần số ≈ 1,15× thân (điều hưởng gần thân để hút năng lượng), cành vừa 2,1×, cành nhỏ 3,4×; mỗi cành bị gió ĐỊA PHƯƠNG ở phía tán của nó đẩy và
        //      bị thân GIẬT (gia tốc gốc) ⇒ lắc lệch pha thân, phản lực cành làm thân tắt dần nhanh hơn. Trên GPU: 3 dạng theo hướng quanh thân
        //      (lưỡng cực, tứ cực, lục cực) ⇒ cành hai phía tán chuyển động khác nhau. Tích phân bước cố định 120 Hz + vẽ nội suy (core/fixed-step.js).
        //      tw.shake = gia tốc tuyệt đối lớn nhất của cành (giữ đỉnh, nhả 0,4 s) → lá bứt rụng khi cành giật mạnh (nature/water-leaves.js). ----
        const treeWinds = [], BR_K = [1.15, 2.1, 3.4], BR_MU = [0.18, 0.1, 0.05], BR_PH = [0, 1.7, 4.1];   // cành: tần số / tần số thân · tỉ lệ khối lượng với thân · pha quanh thân
        const TREE_GLSL = `
          uniform vec3 uTreeBase; uniform vec4 uTreeDim; uniform vec2 uBend; uniform float uFlutter; uniform float uLeafLean; uniform vec2 uBr[3];
          attribute vec4 aBr; uniform vec3 uBgh[8]; uniform vec4 uBghT;
          #ifdef TREE_RIG
          uniform highp sampler2D uRig; uniform float uRigOn;
          vec3 rigMove(vec3 p, float i) { vec4 q = texelFetch(uRig, ivec2(int(i), 0), 0); return 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p) + texelFetch(uRig, ivec2(int(i), 1), 0).xyz; }
          #endif
          vec3 treeWind(vec3 wp, vec3 seed) {
            vec3 rel = wp - uTreeBase, d = vec3(0.0);
            float h = max(0.0, rel.y) / uTreeDim.x, hb = h * h;
            d.xz += uBend * hb;                                                    // cả cây nghiêng theo lò xo (dịch chuyển ∝ h²)
            float rn = length(rel.xz) / uTreeDim.y, flex = uTreeDim.w * min(rn * rn + hb * 0.3, 1.6);
            vec3 w = windVec(wp, rel.y);
            d += 0.6 * flex * w * pow(length(w) + 1e-3, 0.3);                      // cành: lực ∝ |w|^1,3 tại chính chỗ đó (tựa tĩnh)
            float az = atan(rel.z, rel.x);                                          // + dao động riêng của cành, mỗi phía tán một pha
            d.xz += (uBr[0] * (0.5 + 0.5 * cos(az)) + uBr[1] * (0.5 + 0.5 * cos(2.0 * az + 1.7)) + uBr[2] * (0.5 + 0.5 * cos(3.0 * az + 4.1))) * min(rn * rn + hb * 0.3, 1.6);
            #ifdef TREE_RIG
            if (uRigOn > 0.5) d += mix(rigMove(rel, floor(aBr.z * 255.0 + 0.5)) * (1.0 - aBr.w), rigMove(rel, floor(aBr.x * 255.0 + 0.5)), aBr.y);   // xương cành: trộn xương mẹ (× phần cành mẹ đã đi tại chỗ cắm) → xương mình
            #endif
            if (uBghT.x > 0.5) {   // gió theo cành: cành chính (dao động riêng, CPU) + chùm cành con (pha riêng theo chùm, không trạng thái)
            float bi = floor(aBr.x * 255.0 + 0.5), zb = floor(aBr.z * 255.0 + 0.5);
            if (bi > 0.5) { float s = aBr.y; d += uBgh[int(bi) - 1] * (s * s * (1.5 - 0.5 * s)); }
            if (zb > 0.5) { float k = aBr.w * 1.5, wl = length(w) + 1e-3, ph = zb * 2.399;
              d += k * k * (uBghT.z * w * pow(wl, 0.3) + uBghT.w * pow(wl, 1.3) * (vec3(0.0, sin(uBghT.y * (0.7 + 0.01 * mod(zb, 61.0)) + ph), 0.0) + vec3(-uWindDir.y, 0.0, uWindDir.x) * (0.6 * sin(uBghT.y * (0.7 + 0.01 * mod(zb * 7.0, 61.0)) + 1.7 * ph)))); }
          }
          if (uLeafLean > 0.0) {   // LÁ NGẢ NHƯ CỎ: cả chiếc lá nghiêng theo gió tại chính nó, góc bão hoà; cơn giật qua thì ngả thêm, lặng thì co về
              vec3 wl = windVec(seed, clamp(seed.y - uTreeBase.y, 1.0, 15.0)); float sp = length(wl.xz);
              float th = 1.15 * (1.0 - exp(-0.75 * pow(sp, 1.3)));
              vec2 dl = sp > 1e-4 ? wl.xz / sp : vec2(0.0);
              d.xz += dl * (uLeafLean * th); d.y -= uLeafLean * th * th * 0.3;
            }
            if (uFlutter > 0.0) {   // rung lá tần số cao — chỉ còn rất nhẹ
              float lp = fract(sin(dot(seed, vec3(12.9898, 78.233, 37.719))) * 43758.5453) * 6.2831;
              float fA = uFlutter * clamp(0.3 + 0.4 * length(w), 0.3, 1.4), ph = uFlutPhase + lp;
              d += fA * (vec3(uWindDir.x, 0.0, uWindDir.y) * (0.35 * sin(ph)) + vec3(-uWindDir.y, 0.0, uWindDir.x) * (0.3 * sin(0.77 * ph + lp)) + vec3(0.0, 0.6 * sin(1.31 * ph + 1.3 * lp), 0.0));
            }
            d.y -= dot(uBend, uBend) * hb * 0.5 / max(uTreeDim.x * max(h, 0.2), 0.5);   // giữ chiều dài thân: ngả ra thì ngọn hạ xuống chút
            return d;
          }`;
        function windShader(mat, tw, flutter) {
          mat.userData.treeWind = tw;
          const own = { uTreeBase: tw.u.uTreeBase, uTreeDim: tw.u.uTreeDim, uBend: tw.u.uBend, uBr: tw.u.uBr, uBgh: tw.u.uBgh, uBghT: tw.u.uBghT, uFlutter: { value: flutter * TREE_SWAY_K * 0.3 * (tw.sway || 1) }, uLeafLean: { value: flutter * 3 * (tw.sway || 1) } };
          if (tw.rig) { own.uRig = tw.u.uRig; own.uRigOn = tw.u.uRigOn; }   // cây có xương cành: chương trình riêng (đọc bảng xương)
          return injectWorldWind(mat, own, (tw.rig ? '#define TREE_RIG\n' : '') + TREE_GLSL, 'treeWind( windW.xyz, ( modelMatrix * vec4( windSeed, 1.0 ) ).xyz )', tw.rig ? 'treeWind4r' : 'treeWind4');
        }
        function makeTreeWind(o) {   // o: freq (Hz), zeta (tắt dần cấu trúc), lean (đv ở ngọn khi gió 30 km/h), branchAmp (độ mềm ngọn cành), sway (hệ số biên độ riêng của cây: thân, cành, lá; mặc định 1)
          const sw = o.sway == null ? 1 : o.sway;
          const tw = Object.assign({ bx: 0, bz: 0, vx: 0, vz: 0, px: 0, pz: 0, ex: 0, ez: 0, aero: 0, H: 1, R: 1, F: 0, shake: 0, shakeRaw: 0, active: false, crown: new THREE.Vector3(), crownZ: 1, ph: {} }, o, { sway: sw, lean: o.lean * TREE_SWAY_K * sw, branchAmp: o.branchAmp * TREE_SWAY_K * sw });
          tw.br = BR_K.map(() => ({ x: 0, z: 0, vx: 0, vz: 0, px: 0, pz: 0, ex: 0, ez: 0 }));
          tw.u = { uTreeBase: { value: new THREE.Vector3(0, -1e4, 0) }, uTreeDim: { value: new THREE.Vector4(1, 1, 0, tw.branchAmp) }, uBend: { value: new THREE.Vector2() }, uBr: { value: BR_K.map(() => new THREE.Vector2()) }, uBgh: { value: Array.from({ length: 8 }, () => new THREE.Vector3()) }, uBghT: { value: new THREE.Vector4() } };
          if (tw.rig) { const d = new Float32Array(256 * 2 * 4); for (let i = 0; i < 256; i++) d[i * 4 + 3] = 1; const t = new THREE.DataTexture(d, 256, 2, THREE.RGBAFormat, THREE.FloatType); t.needsUpdate = true; tw.u.uRig = { value: t }; tw.u.uRigOn = { value: 0 }; }
          tw.depthMat = windShader(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), tw, 0);   // bóng đổ đung đưa cùng cây
          treeWinds.push(tw); return tw;
        }
        const genericFoliageWind = makeTreeWind({ freq: 1, zeta: 1, lean: 0, branchAmp: 0 });   // lá cây không có mô hình thân: chỉ rung theo gió
        function finalizeTreeWind(tw, group) {   // gốc, chiều cao, bán kính tán, tâm áp lực — đo SAU khi đặt cây vào cảnh
          group.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(group), base = group.getWorldPosition(new THREE.Vector3());
          tw.base = base; tw.H = Math.max(1, box.max.y - base.y);
          tw.R = Math.max(1, 0.8 * Math.max(...[[box.min.x, box.min.z], [box.min.x, box.max.z], [box.max.x, box.min.z], [box.max.x, box.max.z]].map(([x, z]) => Math.hypot(x - base.x, z - base.z))));
          tw.crownZ = 0.62 * tw.H; tw.crown.set((box.min.x + box.max.x) / 2, base.y + tw.crownZ, (box.min.z + box.max.z) / 2);
          tw.u.uTreeBase.value.copy(base); tw.u.uTreeDim.value.x = tw.H; tw.u.uTreeDim.value.y = tw.R; tw.active = true;
          group.traverse(o => { if (o.isMesh && o.castShadow && o.material && o.material.userData && o.material.userData.treeWind === tw) o.customDepthMaterial = tw.depthMat; });
          if (tw.bough && group.userData.boughs) boughSetup(tw, group);
          if (tw.rig && group.userData.rigLimbs) rigSetup(tw, group);
        }
        // XƯƠNG CÀNH (anh đào: mọi cành; táo: thân + cành cấp 1–2, cành nhỏ đi cứng theo — recTree rigDepth). Mỗi cành có xương = 1 xương: khớp ở gốc cành, 2 góc (ngang h, đứng n) là 2 dao động tắt dần bị gió tại ngọn
        //  đẩy + bị cành mẹ giật (gia tốc khớp + gia tốc góc của mẹ, hệ số RIG_KAPPA). Tư thế nối tiếp từ thân ra ngọn: Q = Q mẹ · δq, khớp đi theo mẹ.
        //  GPU: đỉnh mang aBr = (xương, trọng số dọc cành, xương mẹ, 0); đọc 2 hàng của uRig (256 × 2 float: quaternion, độ dời), trộn mẹ → con theo
        //  trọng số s(2 − s) ⇒ gốc cành đứng yên với mẹ, cong dần ra ngọn, tiếp tuyến liền qua chỗ nối. Xương 0 = thân (đứng yên; thân vẫn ngả bằng uBend).
        //  tw.rigOff = true ⇒ về cành mềm + 3 thuỳ (so trước – sau trong cùng trang). Bản CPU: rigAt() (quả táo, móc hộp tổ); treeWindAt() theo xương qua rigNear() khi nhóm có userData.rigLines (đường cành + trọng số; cổ thụ), không có ⇒ không kể xương. Byte thứ 4 của aBr = độ chùng (1 − trọng số cành mẹ tại chỗ cắm; xương con cắm giữa cành mẹ, l.pw); l.fq = tần số riêng của xương. treeRigHold(): giữ cây đứng yên khi có vật bám.
        const RIG_ZETA = 0.13, RIG_NOISE = 0.35, RIG_KAPPA = 0.35, RIG_QMAX = 0.35;
        const rigMix = (a, b, t) => { const w0 = a[0] === b[0] ? a[1] : 0; return [b[0], w0 + (b[1] - w0) * t, b[2], b[3] || 0, 0]; };   // qua chỗ nối: (mẹ, 1) ≡ (con, 0)
        const rigBytes = (W, out) => { out.push(W[0], Math.round(255 * W[1]), W[2], Math.round(255 * (W[3] || 0))); };   // [xương, trọng số, xương mẹ, độ chùng] → 4 byte aBr
        const _rq = new THREE.Quaternion(), _rq2 = new THREE.Quaternion(), _rv = new THREE.Vector3(), _ra = new THREE.Vector3(), _rb = new THREE.Vector3();
        const TREE_RIG_ON = (() => { try { return new URLSearchParams(location.search).get('rig') !== 'off'; } catch (e) { return true; } })();   // ?rig=off ⇒ anh đào + táo + cổ thụ không xương cành (cổ thụ về gió theo cành bough + spray)
        const rigAttr = W => { const a = new Uint8Array(W.length * 4); W.forEach((w, i) => { a[i * 4] = w[0]; a[i * 4 + 1] = Math.round(255 * w[1]); a[i * 4 + 2] = w[2]; a[i * 4 + 3] = Math.round(255 * (w[3] || 0)); }); return new THREE.InstancedBufferAttribute(a, 4, true); };   // [xương, trọng số, xương mẹ, độ chùng] mỗi bản → aBr
        function rigAt(tw, bind, p, out) {   // = rigMove() trên GPU: độ dời (thế giới) của điểm p (thế giới, tư thế nghỉ) gắn xương bind = [xương, trọng số, xương mẹ] — quả, móc treo đi theo cành
          out.set(0, 0, 0); const G = tw && tw.rg; if (!G || tw.rigOff || !bind) return out;
          const B = G[bind[0]], P = G[bind[2]], w = bind[1]; _ra.copy(p).sub(tw.base);
          if (w > 0) out.copy(_ra).sub(B.o).applyQuaternion(B.Q).add(B.o2).sub(_ra).multiplyScalar(w);
          if (w < 1) out.addScaledVector(_rb.copy(_ra).sub(P.o).applyQuaternion(P.Q).add(P.o2).sub(_ra), (1 - w) * (1 - (bind[3] || 0)));
          return out;
        }
        function treeRigHold(tree, sec = 0.5) { const tw = tree && tree.userData.treeWind; if (tw && tw.rg) tw.holdT = Math.max(tw.holdT, sec); }   // có con vật / người đang bám, hái trên cây: xương về tư thế nghỉ (0,35 s), hết giữ thì đung đưa lại
        function rigSetup(tw, group) {
          const up = new THREE.Vector3(0, 1, 0), M = group.matrixWorld, R = tw.rig;
          tw.rg = group.userData.rigLimbs.map((l, i) => {
            const o = l.o.clone().applyMatrix4(M), tip = l.t.clone().applyMatrix4(M), a = tip.clone().sub(o), L = a.length() || 1; a.divideScalar(L);
            const h = a.clone().cross(up); if (h.lengthSq() < 1e-4) h.set(1, 0, 0); h.normalize();
            const f = Math.min(3, Math.max(0.6, (l.fq || R.freq) / L)), hr = Math.max(0, o.y - tw.base.y) / tw.H;
            return { par: l.par, pw: l.pw == null ? 1 : l.pw, tip, o: o.sub(tw.base), L, h, n: h.clone().cross(a).normalize(), oh: TAU * f, on: TAU * f * 1.15, amp: i ? R.amp * TREE_SWAY_K * tw.sway * Math.pow(R.grow, l.d - 1) : 0, hb: hr * hr,
              qh: 0, qn: 0, vh: 0, vn: 0, ph: 0, pn: 0, eh: 0, en: 0, sh: 0, sn: 0, aw: new THREE.Vector3(), ao: new THREE.Vector3(), Q: new THREE.Quaternion(), o2: new THREE.Vector3() };
          });
          for (const B of tw.rg) B.o2.copy(B.o); tw.rgRng = mulberry32(7411); tw.u.uRigOn.value = 1; tw.rigK = 1; tw.holdT = 0;
          if (group.userData.rigLines) tw.rgL = group.userData.rigLines.map(l => ({ P: l.P.map(v => v.clone().applyMatrix4(M)), W: l.W }));   // đường cành có xương (thế giới) cho treeWindAt: vật đậu đi theo cành
        }
        function rigDrive(tw) {   // mỗi khung: gió tại ngọn từng cành → góc cân bằng + cường độ nhiễu
          const G = tw.rg, z = 4 * (RIG_ZETA + tw.aero) / PHYS_H;
          for (let i = 1; i < G.length; i++) {
            const B = G[i]; windAt(B.tip.x, B.tip.y, B.tip.z, B.tip.y - tw.base.y, _wtmp2);
            const s = _wtmp2.length() + 1e-6, F = Math.pow(s / WIND_SREF, 1.3), k = B.amp * F / s, xr = RIG_NOISE * B.amp * F;
            B.eh = k * _wtmp2.dot(B.h); B.en = k * _wtmp2.dot(B.n); B.sh = xr * Math.sqrt(z * B.oh * B.oh * B.oh); B.sn = xr * Math.sqrt(z * B.on * B.on * B.on);
          }
        }
        function rigStep(tw, hh, ax, az) {   // 1 bước 1/120 s, thân → ngọn: gia tốc khớp ao + gia tốc góc aw của mẹ truyền xuống con (không kể nhiễu trắng)
          const G = tw.rg, z2 = 2 * (RIG_ZETA + tw.aero), r = tw.rgRng, K = RIG_KAPPA;
          for (let i = 1; i < G.length; i++) {
            const B = G[i], P = G[B.par], h = B.h, n = B.n, aw = P.aw, ao = B.ao, pw = B.pw;
            if (B.par) { const dx = B.o.x - P.o.x, dy = B.o.y - P.o.y, dz = B.o.z - P.o.z; ao.set(P.ao.x + aw.y * dz - aw.z * dy, P.ao.y + aw.z * dx - aw.x * dz, P.ao.z + aw.x * dy - aw.y * dx).multiplyScalar(pw); }
            else ao.set(ax * B.hb, 0, az * B.hb);
            const ah = B.oh * B.oh * (B.eh - B.qh) - z2 * B.oh * B.vh - K * (1.5 * ao.dot(h) / B.L - pw * aw.dot(n));
            const an = B.on * B.on * (B.en - B.qn) - z2 * B.on * B.vn - K * (1.5 * ao.dot(n) / B.L + pw * aw.dot(h));
            B.ph = B.qh; B.pn = B.qn; B.vh += (ah + B.sh * (r() * 2 - 1) * 1.732) * hh; B.vn += (an + B.sn * (r() * 2 - 1) * 1.732) * hh; B.qh += B.vh * hh; B.qn += B.vn * hh;
            if (B.qh > RIG_QMAX || B.qh < -RIG_QMAX) { B.qh = Math.sign(B.qh) * RIG_QMAX; B.vh = 0; } if (B.qn > RIG_QMAX || B.qn < -RIG_QMAX) { B.qn = Math.sign(B.qn) * RIG_QMAX; B.vn = 0; }
            B.aw.set(pw * aw.x - ah * n.x + an * h.x, pw * aw.y - ah * n.y + an * h.y, pw * aw.z - ah * n.z + an * h.z);
          }
        }
        function rigOut(tw, al) {   // tư thế nối tiếp → bảng uRig: hàng 0 quaternion Q, hàng 1 độ dời c (đỉnh p ↦ Q p + c, toạ độ so với gốc cây)
          const G = tw.rg, D = tw.u.uRig.value.image.data, hk = 0.5 * tw.rigK;
          for (let i = 1; i < G.length; i++) {
            const B = G[i], P = G[B.par], h = B.h, n = B.n, qh = hk * (B.ph + (B.qh - B.ph) * al), qn = hk * (B.pn + (B.qn - B.pn) * al);
            _rq.set(qn * h.x - qh * n.x, qn * h.y - qh * n.y, qn * h.z - qh * n.z, 1).normalize(); B.o2.copy(B.o).sub(P.o).applyQuaternion(P.Q).add(P.o2);
            if (B.pw < 1) { B.Q.multiplyQuaternions(_rq2.identity().slerp(P.Q, B.pw), _rq); B.o2.sub(B.o).multiplyScalar(B.pw).add(B.o); } else B.Q.multiplyQuaternions(P.Q, _rq);   // cắm giữa cành mẹ: chỉ theo phần cành mẹ đã đi tại chỗ cắm
            _rv.copy(B.o).applyQuaternion(B.Q);
            const k = i * 4; D[k] = B.Q.x; D[k + 1] = B.Q.y; D[k + 2] = B.Q.z; D[k + 3] = B.Q.w; D[k + 1024] = B.o2.x - _rv.x; D[k + 1025] = B.o2.y - _rv.y; D[k + 1026] = B.o2.z - _rv.z;
          }
          tw.u.uRig.value.needsUpdate = true;
        }
        // GIÓ THEO CÀNH. Đỉnh vỏ + lá mang aBr (4 byte): cành chính 1…8 · vị trí dọc cành 0…1 · pha chùm cành con 1…255 · vị trí dọc chùm / 1,5.
        //  Cành chính: 2 dao động (ngang h, đứng n) trên CPU, tần số theo chiều dài, gió tại ngọn cành + nhiễu trắng (rung ở tần số riêng) − gia tốc thân.
        //  Dịch chuyển = uBgh[cành] · s²(1,5 − 0,5 s): 0 ở gốc cành ⇒ không rách chỗ nối. Chùm con: đẩy theo gió tại chỗ + vẫy, biên độ k².
        //  treeWindAt() = bản CPU (thân + cành chính). tw.bghOff = true ⇒ về 3 thuỳ quanh thân (so trước – sau).
        const BGH_FREQ = 6, BGH_ZETA = 0.14, BGH_NOISE = 0.35, BGH_SPRAY_HZ = 1.6;
        const brMix = (a, b, t) => [Math.max(a[0], b[0]), a[1] + (b[1] - a[1]) * t, Math.max(a[2], b[2]), a[3] + (b[3] - a[3]) * t, Math.max(a[4], b[4])];
        const brBytes = (W, out) => { out.push(W[0], Math.round(255 * Math.min(1, Math.max(0, W[1]))), W[2], Math.round(255 * Math.min(1, W[3] / 1.5))); };
        const boughW = s => s * s * (1.5 - 0.5 * s);
        function boughSetup(tw, group) {
          const up = new THREE.Vector3(0, 1, 0);
          tw.bgh = group.userData.boughs.slice(0, 8).map(line => {
            const P = line.map(v => v.clone().applyMatrix4(group.matrixWorld)), A = [0]; for (let i = 1; i < P.length; i++) A.push(A[i - 1] + P[i].distanceTo(P[i - 1]));
            const L = A[A.length - 1], tip = P[P.length - 1], a = tip.clone().sub(P[0]).normalize(), h = a.clone().cross(up); if (h.lengthSq() < 1e-4) h.set(1, 0, 0); h.normalize();
            const f = Math.min(2.2, Math.max(0.45, BGH_FREQ / L)), hr = Math.max(0, P[0].y - tw.base.y) / tw.H;
            return { P, A, L, tip, h, n: h.clone().cross(a).normalize(), oh: TAU * f, on: TAU * f * 1.2, amp: tw.bough * TREE_SWAY_K * tw.sway * L, hb: hr * hr, qh: 0, qn: 0, vh: 0, vn: 0, ph: 0, pn: 0, eh: 0, en: 0, sh: 0, sn: 0, d: new THREE.Vector3() };
          });
          tw.rng = mulberry32(9151); const sp = tw.spray || [0, 0], k = TREE_SWAY_K * tw.sway / Math.pow(WIND_SREF, 1.3);
          tw.u.uBghT.value.set(1, 0, sp[0] * k, sp[1] * k);
        }
        function boughDrive(tw, dt) {   // mỗi khung: gió tại ngọn từng cành → vị trí cân bằng + cường độ nhiễu
          const on = !tw.bghOff, T = tw.u.uBghT.value; T.x = on ? 1 : 0; T.y = (T.y + TAU * BGH_SPRAY_HZ * dt) % (TAU * 100);
          for (const B of tw.bgh) {
            windAt(B.tip.x, B.tip.y, B.tip.z, B.tip.y - tw.base.y, _wtmp2);
            const s = _wtmp2.length() + 1e-6, F = Math.pow(s / WIND_SREF, 1.3), k = B.amp * F / s, z = 4 * (BGH_ZETA + tw.aero) / PHYS_H, xr = BGH_NOISE * B.amp * F;
            B.eh = k * _wtmp2.dot(B.h); B.en = k * _wtmp2.dot(B.n); B.sh = xr * Math.sqrt(z * B.oh * B.oh * B.oh); B.sn = xr * Math.sqrt(z * B.on * B.on * B.on);
          }
        }
        function boughStep(tw, hh, ax, az) {
          const z2 = 2 * (BGH_ZETA + tw.aero), r = tw.rng;
          for (const B of tw.bgh) {
            const ah = B.oh * B.oh * (B.eh - B.qh) - z2 * B.oh * B.vh - (ax * B.h.x + az * B.h.z) * B.hb + B.sh * (r() * 2 - 1) * 1.732;
            const an = B.on * B.on * (B.en - B.qn) - z2 * B.on * B.vn - (ax * B.n.x + az * B.n.z) * B.hb + B.sn * (r() * 2 - 1) * 1.732;
            B.ph = B.qh; B.pn = B.qn; B.vh += ah * hh; B.vn += an * hh; B.qh += B.vh * hh; B.qn += B.vn * hh;
          }
        }
        function boughOut(tw, al) {
          const U = tw.u.uBgh.value;
          tw.bgh.forEach((B, i) => { const qh = B.ph + (B.qh - B.ph) * al, qn = B.pn + (B.qn - B.pn) * al; U[i].copy(B.d.set(B.h.x * qh + B.n.x * qn, B.h.y * qh + B.n.y * qn, B.h.z * qh + B.n.z * qn)); });
        }
        function boughAt(tw, p, out) {   // điểm trên / sát cành chính → cộng dịch chuyển của cành tại đó (cành gần nhất; nhánh con + bệ lá lấy theo chỗ gần nhất trên cành)
          let bd = 64, bb = null, bs = 0;
          for (const B of tw.bgh) for (let i = 0; i < B.P.length - 1; i++) {
            const a = B.P[i], b = B.P[i + 1], ex = b.x - a.x, ey = b.y - a.y, ez = b.z - a.z, l2 = ex * ex + ey * ey + ez * ez;
            const t = Math.min(1, Math.max(0, ((p.x - a.x) * ex + (p.y - a.y) * ey + (p.z - a.z) * ez) / l2)), dx = a.x + ex * t - p.x, dy = a.y + ey * t - p.y, dz = a.z + ez * t - p.z, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < bd) { bd = d2; bb = B; bs = (B.A[i] + (B.A[i + 1] - B.A[i]) * t) / B.L; }
          }
          if (bb) out.addScaledVector(bb.d, boughW(bs));
          return out;
        }
        function rigNear(tw, p, out) {   // điểm trên / sát cành có xương (tw.rgL) → cộng độ dời của xương tại chỗ gần nhất trên đường cành
          let bd = 64, bl = null, bi = 0, bt = 0;
          for (const l of tw.rgL) for (let i = 0; i < l.P.length - 1; i++) {
            const a = l.P[i], b = l.P[i + 1], ex = b.x - a.x, ey = b.y - a.y, ez = b.z - a.z, l2 = ex * ex + ey * ey + ez * ez;
            const t = Math.min(1, Math.max(0, ((p.x - a.x) * ex + (p.y - a.y) * ey + (p.z - a.z) * ez) / l2)), dx = a.x + ex * t - p.x, dy = a.y + ey * t - p.y, dz = a.z + ez * t - p.z, d2 = dx * dx + dy * dy + dz * dz;
            if (d2 < bd) { bd = d2; bl = l; bi = i; bt = t; }
          }
          if (bl) { _rnB[0] = bl.W[bi][0]; _rnB[1] = bl.W[bi][1] + (bl.W[bi + 1][1] - bl.W[bi][1]) * bt; _rnB[2] = bl.W[bi][2]; _rnB[3] = bl.W[bi][3] || 0; out.add(rigAt(tw, _rnB, p, _rnV)); }
          return out;
        }
        const _rnB = [0, 0, 0, 0], _rnV = new THREE.Vector3();
        const _wtmp = new THREE.Vector3(), _wtmp2 = new THREE.Vector3();
        function treeWindAt(tw, p, out) {   // = treeWind() trên GPU (phần thân + cành, không có lá rung) — cho cò/bướm đậu trên cành
          out.set(0, 0, 0); if (!tw || !tw.active) return out;
          const B = tw.u.uBend.value, rx = p.x - tw.base.x, ry = p.y - tw.base.y, rz = p.z - tw.base.z, h = Math.max(0, ry) / tw.H, hb = h * h;
          const flex = (tw.rgL && !tw.rigOff ? 0 : tw.branchAmp) * Math.min(Math.pow(Math.hypot(rx, rz) / tw.R, 2) + hb * 0.3, 1.6);
          windAt(p.x, p.y, p.z, ry, _wtmp2); const L = 0.6 * flex * Math.pow(_wtmp2.length() + 1e-3, 0.3);
          const az = Math.atan2(rz, rx), fb = Math.min(Math.pow(Math.hypot(rx, rz) / tw.R, 2) + hb * 0.3, 1.6), Br = tw.u.uBr.value;
          const bg = tw.bgh && !tw.bghOff, w0 = bg ? 0 : (0.5 + 0.5 * Math.cos(az)) * fb, w1 = bg ? 0 : (0.5 + 0.5 * Math.cos(2 * az + 1.7)) * fb, w2 = bg ? 0 : (0.5 + 0.5 * Math.cos(3 * az + 4.1)) * fb;
          out.set(B.x * hb + _wtmp2.x * L + Br[0].x * w0 + Br[1].x * w1 + Br[2].x * w2, _wtmp2.y * L, B.y * hb + _wtmp2.z * L + Br[0].y * w0 + Br[1].y * w1 + Br[2].y * w2);
          out.y -= (B.x * B.x + B.y * B.y) * hb * 0.5 / Math.max(tw.H * Math.max(h, 0.2), 0.5);
          return bg ? boughAt(tw, p, out) : tw.rgL && !tw.rigOff ? rigNear(tw, p, out) : out;
        }
        // ---- CỎ: mỗi cọng uốn cong theo gió SÁT ĐẤT tại gốc (profile log ⇒ ~⅓ U10) cộng nhiễu loạn — góc uốn bão hoà (cọng nằm rạp tối đa ~65°),
        //      dạng uốn ∝ t² dọc cọng; nhiễu loạn trôi theo gió ⇒ từng mảng cỏ rạp xuống rồi bật lên lan đi như sóng (honami) ----
        const GRASS_GLSL = `
          vec3 grassWind(vec3 root, float t, float L) {
            vec3 w = windVec(root, 0.5); vec2 wh = w.xz; float sp = length(wh);
            float th = 1.15 * (1.0 - exp(-0.75 * pow(sp, 1.3)));
            vec2 dr = sp > 1e-4 ? wh / sp : vec2(0.0); float tt = t * t;
            return vec3(dr.x * L * sin(th) * tt, -L * (1.0 - cos(th)) * tt, dr.y * L * sin(th) * tt);
          }`;
        function grassWindShader(mat) {
          injectWorldWind(mat, {}, GRASS_GLSL, 'grassWind( ( modelMatrix * windIM * vec4( 0.0, -0.5, 0.0, 1.0 ) ).xyz, position.y + 0.5, length( vec3( windIM[ 1 ] ) ) )', 'grassWind2');
          const base = mat.onBeforeCompile;   // + kiểu cỏ mềm (như thảm cỏ meadow.js): pháp tuyến chĩa lên như mặt đất, gốc sẫm → ngọn sáng
          mat.onBeforeCompile = shader => {
            base(shader);
            shader.vertexShader = 'varying float vGT;\n' + shader.vertexShader.replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3( 0.0, 1.0, 0.0 ); vGT = position.y + 0.5;');
            shader.fragmentShader = 'varying float vGT;\n' + shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= mix( 0.8, 1.15, smoothstep( 0.0, 1.0, vGT ) );')
              .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n normal = normalize( vNormal );');
          };
          mat.customProgramCacheKey = () => 'grassWind3';
          return mat;
        }
        // ---- RỪNG (cành instanced + khối tán): cả cây nghiêng tựa tĩnh theo gió tại tâm tán của chính nó (lực |w|^1,3), ∝ (độ cao/H)².
        //      aSway = (độ cao tâm khối tán trên gốc — 0 với cành thì tính theo từng đỉnh, chiều cao cây) ----
        const FOREST_GLSL = `
          attribute vec2 aSway;
          vec3 forestWind(vec3 wp, vec3 origin) {
            float H = max(aSway.y, 0.5), hrel = aSway.x > 0.0 ? aSway.x : wp.y - origin.y;
            vec3 root = aSway.x > 0.0 ? origin - vec3(0.0, aSway.x, 0.0) : origin;
            vec3 w = windVec(root + vec3(0.0, 0.6 * H, 0.0), 0.6 * H);
            float hn = clamp(hrel / H, 0.0, 1.3);
            return ${(0.012 * TREE_SWAY_K).toFixed(4)} * H * hn * hn * vec3(w.x, 0.15 * w.y, w.z) * pow(length(w) + 1e-3, 0.3);
          }`;
        function forestWindShader(mat) {
          return injectWorldWind(mat, {}, FOREST_GLSL, 'forestWind( windW.xyz, ( modelMatrix * windIM * vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz )', 'forestWind2');
        }
        // ---- HOA: thân mềm uốn ∝ (độ cao)², đầu hoa đi theo đỉnh thân như một khối cứng. aSway.x > 0: khối cứng ở độ cao đó trên gốc;
        //      aSway.x < 0: tính theo từng đỉnh, gốc nằm dưới tâm instance |x| đơn vị (thân hoa đặt ở giữa chiều cao) ----
        const FLOWER_GLSL = `
          attribute vec2 aSway; uniform float uSwayK;
          vec3 flowerWind(vec3 wp, vec3 origin) {
            float hrel = aSway.x > 0.0 ? aSway.x : wp.y - (origin.y + aSway.x);
            vec3 root = origin - vec3(0.0, abs(aSway.x), 0.0);
            vec3 w = windVec(root + vec3(0.0, 0.5, 0.0), 0.5);
            vec3 d = uSwayK * hrel * hrel * vec3(w.x, 0.1 * w.y, w.z) * pow(length(w) + 1e-3, 0.3);
            d.y -= dot(d.xz, d.xz) * 0.5 / max(hrel, 0.2);
            return d;
          }`;
        function flowerWindShader(mat, k) {
          return injectWorldWind(mat, { uSwayK: { value: k } }, FLOWER_GLSL, 'flowerWind( windW.xyz, ( modelMatrix * windIM * vec4( 0.0, 0.0, 0.0, 1.0 ) ).xyz )', 'flowerWind2');
        }
        function updateSceneWind(dt, t) {
          const w = liveWeather.state, cur = w.fresh ? w.data?.current : null;
          let tx = 0.977, tz = 0.213, sp = 8, gst = null;   // chưa có dữ liệu: gió nhẹ cùng hướng mây mặc định
          if (w.fresh && w.windDirection !== null) { const a = w.windDirection * Math.PI / 180; tx = -Math.sin(a); tz = Math.cos(a); sp = Math.max(0, w.windSpeed || 0); gst = Number.isFinite(w.windGusts) ? w.windGusts : null; }
          const kd = Math.min(1, dt * 0.5), D = sceneWind.dir;   // số liệu mới về → đổi hướng/tốc độ mượt trong vài giây
          D.x += (tx - D.x) * kd; D.y += (tz - D.y) * kd; const dl = Math.hypot(D.x, D.y) || 1; D.x /= dl; D.y /= dl;
          sceneWind.speed += (sp - sceneWind.speed) * kd;
          const ms = sceneWind.ms = sceneWind.speed / 3.6;
          sceneWind.U = 0.25 + 0.2 * ms;
          let I = 0.22; if (gst !== null && sp > 2) I = Math.min(0.45, Math.max(0.08, (gst / sp - 1) / 3.2));   // từ hệ số giật thật: G = 1 + g·I, hệ số đỉnh g ≈ 3–3,5 (giật lớn nhất trong giờ)
          // độ ổn định: −1 rất bất ổn (trưa nắng, gió nhẹ) · 0 trung tính (nhiều mây / gió mạnh) · +1 rất ổn định (đêm quang, gió nhẹ)
          const hr = liveWeather.localHour, cloud = cur && Number.isFinite(cur.cloud_cover) ? cur.cloud_cover / 100 : 0.5;
          const sun = Math.max(0, Math.sin(Math.PI * (hr - 6) / 12));
          const stabT = sun > 0.05 ? -sun * (1 - 0.7 * cloud) * (1 - Math.min(1, ms / 6)) : (1 - 0.8 * cloud) * (1 - Math.min(1, ms / 5));
          sceneWind.stab += (stabT - sceneWind.stab) * Math.min(1, dt * 0.2);
          const st = sceneWind.stab;
          sceneWind.I += (I * (st > 0 ? 1 - 0.4 * st : 1 - 0.35 * st) - sceneWind.I) * kd;
          const sa = sceneWind.I * sceneWind.U, rw = st > 0 ? 0.5 - 0.25 * st : 0.5 - 0.35 * st;   // σw/σu: 0,25 (ổn định) … 0,5 (trung tính) … 0,85 (đối lưu)
          sceneWind.sig.set(sa, sa * rw, sa * 0.8);
          // xoay các mode theo hướng gió · trôi theo gió (Taylor) · tự biến đổi chậm (thời gian sống xoáy ~ 1/(k σ))
          const ax = D.x, az = D.y, P = sceneWind.phase, h = Math.min(dt, 0.1);
          for (let n = 0; n < WIND_N; n++) {
            const m = sceneWind.modes[n], kW = _wkW[n], aW = _waW[n];
            kW.set(ax * m.kw.x - az * m.kw.z, m.kw.y, az * m.kw.x + ax * m.kw.z);
            const sx = m.ea * sceneWind.sig.x, sy = m.ey * sceneWind.sig.y, sz = m.ec * sceneWind.sig.z;
            aW.set(ax * sx - az * sz, sy, az * sx + ax * sz);
            P[n] = (P[n] + (-m.kw.x * sceneWind.U + 0.5 * m.k * sa) * h) % TAU; if (P[n] < 0) P[n] += TAU;
            sceneWind.u.uTk.value[n].set(kW.x, kW.y, kW.z, 0); sceneWind.u.uTa.value[n].set(aW.x, aW.y, aW.z, P[n]);
          }
          sceneWind.flutPhase = (sceneWind.flutPhase + TAU * 2.2 * (1 + 0.12 * ms) * h) % (TAU * 100);   // lá rung ~2–4 Hz, tăng nhẹ theo gió
          sceneWind.u.uWindDir.value.copy(D); sceneWind.u.uWindU.value = sceneWind.U; sceneWind.u.uFlutPhase.value = sceneWind.flutPhase;
          sceneWind.u.uTime.value = t % SHADER_TIME_LOOP;
          sceneWind.k = Math.min(2, sceneWind.speed / 30); sceneWind.sceneSpeed = sceneWind.U;
          windAt(0, 8, 0, 8, _wtmp); sceneWind.gust = Math.max(0.2, (_wtmp.x * ax + _wtmp.z * az) / Math.max(0.05, sceneWind.U * windProfile(8)));
          for (const tw of treeWinds) {
            if (!tw.active || !(tw.lean || tw.rg)) continue;   // cây chỉ có xương cành (táo: thân đứng yên, lean 0) vẫn chạy
            windAt(tw.crown.x, tw.crown.y, tw.crown.z, tw.crownZ, _wtmp);   // gió tại tâm áp lực tán
            const s = Math.hypot(_wtmp.x, _wtmp.z) + 1e-6, F = Math.pow(s / WIND_SREF, 1.3);
            tw.F = F; tw.aero = 0.12 * Math.min(2, s / WIND_SREF);          // lực chuẩn hoá · tắt dần khí động tăng theo gió
            tw.ex = _wtmp.x / s * F * tw.lean; tw.ez = _wtmp.z / s * F * tw.lean;
            for (let i = 0; i < 3; i++) {   // gió ở từng phía tán: cơn giật chạm các cành lệch nhau → cành đẩy theo PHẦN CHÊNH so với tâm tán
              const B = tw.br[i], a = BR_PH[i];
              windAt(tw.crown.x + Math.cos(a) * tw.R * 0.6, tw.crown.y, tw.crown.z + Math.sin(a) * tw.R * 0.6, tw.crownZ, _wtmp2);
              const s2 = Math.hypot(_wtmp2.x, _wtmp2.z) + 1e-6, F2 = Math.pow(s2 / WIND_SREF, 1.3) - F;
              B.ex = _wtmp2.x / s2 * F2 * tw.lean * 0.45; B.ez = _wtmp2.z / s2 * F2 * tw.lean * 0.45;
            }
            if (tw.bgh) boughDrive(tw, dt);
            if (tw.rg && !tw.rigOff) rigDrive(tw);
            tw.shakeRaw = 0; const al = fixedSteps(tw.ph, dt, PHYS_H, hh => treeStep(tw, hh));
            tw.shake = Math.max(tw.shakeRaw, tw.shake * Math.exp(-dt / 0.4));   // giữ đỉnh gia tốc cành, nhả dần
            tw.u.uBend.value.set(tw.px + (tw.bx - tw.px) * al, tw.pz + (tw.bz - tw.pz) * al);
            const lobes = (!tw.bgh || tw.bghOff) && (!tw.rg || tw.rigOff);   // cây có cành chính: 3 thuỳ vẫn tích phân (độ rung cho lá rụng) nhưng không vẽ
            for (let i = 0; i < 3; i++) { const B = tw.br[i]; if (lobes) tw.u.uBr.value[i].set(B.px + (B.x - B.px) * al, B.pz + (B.z - B.pz) * al); else tw.u.uBr.value[i].set(0, 0); }
            if (tw.bgh) boughOut(tw, al);
            if (tw.rg) { const on = !tw.rigOff; if (tw.holdT > 0) tw.holdT -= dt; tw.rigK += ((tw.holdT > 0 ? 0 : 1) - tw.rigK) * (1 - Math.exp(-dt / 0.35)); tw.u.uRigOn.value = on ? 1 : 0; tw.u.uTreeDim.value.w = on ? 0 : tw.branchAmp; if (on) rigOut(tw, al); }
          }
        }
        function treeStep(tw, hh) {   // 1 bước 1/120 s: thân (lò xo 2 chiều) + 3 cành ghép (toạ độ tương đối với thân, bị thân giật) — Euler bán ẩn
          const om = TAU * tw.freq, o2 = om * om, c2 = 2 * (tw.zeta + tw.aero) * om;
          let rx = 0, rz = 0;
          for (let i = 0; i < 3; i++) {   // phản lực lò xo + giảm chấn của cành lên thân (theo tỉ lệ khối lượng)
            const B = tw.br[i], ob = om * BR_K[i], cb = 2 * (0.07 + tw.aero) * ob;
            rx += BR_MU[i] * (cb * B.vx + ob * ob * (B.x - B.ex)); rz += BR_MU[i] * (cb * B.vz + ob * ob * (B.z - B.ez));
          }
          const ax = o2 * (tw.ex - tw.bx) - c2 * tw.vx + rx, az = o2 * (tw.ez - tw.bz) - c2 * tw.vz + rz;
          tw.px = tw.bx; tw.pz = tw.bz; tw.vx += ax * hh; tw.vz += az * hh; tw.bx += tw.vx * hh; tw.bz += tw.vz * hh;
          if (tw.bgh) boughStep(tw, hh, ax, az);
          if (tw.rg && !tw.rigOff) rigStep(tw, hh, ax, az);
          let sh = 0;
          for (let i = 0; i < 3; i++) {
            const B = tw.br[i], ob = om * BR_K[i], cb = 2 * (0.07 + tw.aero) * ob;
            const bx = ob * ob * (B.ex - B.x) - cb * B.vx - ax, bz = ob * ob * (B.ez - B.z) - cb * B.vz - az;   // cành: lò xo + giảm chấn − gia tốc thân
            B.px = B.x; B.pz = B.z; B.vx += bx * hh; B.vz += bz * hh; B.x += B.vx * hh; B.z += B.vz * hh;
            sh = Math.max(sh, Math.hypot(bx + ax, bz + az));   // gia tốc tuyệt đối của cành
          }
          tw.shakeRaw = Math.max(tw.shakeRaw, sh);
        }
        const _wq = new THREE.Quaternion(), _wpv = new THREE.Vector3(), _wsv = new THREE.Vector3(), _rotW = new THREE.Vector3();
        function windInLocal(obj, vec, out) {   // véc-tơ thế giới → hệ toạ độ của obj (độ dài theo đơn vị cục bộ)
          obj.updateWorldMatrix(true, false); obj.matrixWorld.decompose(_wpv, _wq, _wsv);
          return out.copy(vec).applyQuaternion(_wq.invert()).divideScalar(_wsv.x || 1);
        }
        const _smokeW = new THREE.Vector3(), _steamW = new THREE.Vector3(), _cupW = new THREE.Vector3();
        // ---- KHÓI / HƠI NƯỚC = luồng nổi (plume) theo Briggs ----
        //  Lặng gió: cột nổi thẳng, độ cao ∝ t^¾ (càng lên càng hút khí lạnh nên chậm dần). Có gió: khói bị uốn ngang, độ cao ∝ t^⅔/U^⅓ ("luật 2/3").
        //  Bán kính cụm khói ∝ độ cao đã bốc (hút khí ~0,5). Khí quyển ỔN ĐỊNH (đêm quang, gió nhẹ) chặn trần → khói dàn ngang thành hình quạt;
        //  BẤT ỔN (trưa nắng) → nhiễu loạn đứng mạnh làm khói vòng lượn lên xuống. Phương ngang: cụm khói được gió TẠI ĐỘ CAO CỦA NÓ tăng tốc dần
        //  từ đứng yên (τ) — gió trên cao mạnh hơn nên luồng khói cong dần; cộng nhiễu loạn tại chỗ (khuếch tán Taylor: lệch ∝ t tới ~1,6 s rồi bão hoà).
        const _plA = new THREE.Vector3(), _plT = new THREE.Vector3(), _plS = new THREE.Vector3();
        const CAMP_PLUME = { h0: 0.8, rise: 0.75, cap: 3.2, tau: 0.4, windK: 1 }, KETTLE_PLUME = { h0: 1.5, rise: 0.22, cap: 0.6, tau: 0.25, windK: 0.9 }, CUP_PLUME = { h0: 0.9, rise: 0.06, cap: 0.3, tau: 0.4, windK: 0.5 };
        function plumeRise(a, o, Us, zCap) { return zCap * (1 - Math.exp(-Math.min(o.rise * Math.pow(a, 0.75), o.rise * 0.8 * Math.pow(a, 2 / 3) / Math.cbrt(Math.max(0.08, Us) / 0.7)) / zCap)); }
        function plumeOffset(src, a, o, out) {   // src: điểm phát (thế giới), a: tuổi cụm khói (s) → out: dịch chuyển (thế giới); trả về độ cao đã bốc
          const st = sceneWind.stab, Us = sceneWind.U * windProfile(o.h0 + 0.6), zCap = o.cap * (st > 0 ? 1 - 0.55 * st : 1);
          const z = plumeRise(a, o, Us, zCap);
          let x = 0; const n = 6, da = a / n;
          for (let i = 0; i < n; i++) { const ai = (i + 0.5) * da; x += sceneWind.U * windProfile(o.h0 + plumeRise(ai, o, Us, zCap)) * (1 - Math.exp(-ai / o.tau)) * da; }
          x *= o.windK;
          windTurb(src.x + sceneWind.dir.x * x, src.y + z, src.z + sceneWind.dir.y * x, _plT);
          const tl = Math.min(a, 1.6) * o.windK;
          out.set(sceneWind.dir.x * x + _plT.x * tl, z + _plT.y * tl, sceneWind.dir.y * x + _plT.z * tl);
          return z;
        }
        grassWindShader(vegPools.blade.mat);   // cỏ (cả thảm cỏ lông heo) gợn sóng theo gió
        vegPools.stem.autoSway = 'vertex'; vegPools.fcube.autoSway = 'rigid'; vegPools.petal.autoSway = 'rigid'; vegPools.fcen.autoSway = 'rigid';
        for (const k of ['stem', 'fcube', 'petal', 'fcen']) flowerWindShader(vegPools[k].mat, 0.37);   // thân & đầu hoa đung đưa cùng gió sát đất
        forestWindShader(leafMatInst);         // khối tán cây rừng
        // LÁ PHẲNG LỤC GIÁC (đo tam giác): lá cũ là hình trụ 6 cạnh dày 2–4 mm = 24 tam giác (thành bên + 2 nắp); đĩa lục giác cùng bán kính,
        // 2 mặt = 4 tam giác — ảnh trước/sau gần như trùng (chỉ khác viền mảnh ở mép lá). Vật liệu 2 mặt + forceSinglePass (vật trong suốt 2 mặt mặc định
        // vẽ 2 lượt) nên lượt vẽ không tăng. (thử lá 1 tam giác rồi bảo về lại độ phân giải cũ — giữ lục giác 4 tam giác)
        function leafHexGeo(r) {
          const pos = [], uv = [], nrm = [];
          for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; pos.push(r * Math.cos(a), 0, r * Math.sin(a)); uv.push(0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)); nrm.push(0, 1, 0); }
          const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
          g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex([0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 5, 4]); g.userData.twoSided = true; return g;
        }
        function tuftInstanced(g, rnd, pts, geo, cols, opacity, swayScale = 1.0, tw = null, flutter = 0.025 * swayScale) {   // đám lá/hoa instanced quanh các điểm pts · rung theo gió (tw: mô hình thân cây riêng nếu có)
          const mat = windShader(new THREE.MeshLambertMaterial({ transparent: true, opacity }), tw || genericFoliageWind, flutter);
          if (geo.userData.twoSided) { mat.side = THREE.DoubleSide; mat.forceSinglePass = true; }
          const im = new THREE.InstancedMesh(geo, mat, pts.length);
          const q = new THREE.Quaternion(), eu = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(), mm = new THREE.Matrix4(), col = new THREE.Color();
          pts.forEach((pt, k) => {
            eu.set(rnd() * 3.14, rnd() * 3.14, rnd() * 3.14); q.setFromEuler(eu);
            const s2 = 0.7 + rnd() * 0.55; sc.set(s2, s2, s2); p.set(pt[0], pt[1], pt[2]); mm.compose(p, q, sc); im.setMatrixAt(k, mm);
            col.setHex(cols[(rnd() * cols.length) | 0]); col.offsetHSL(0, 0, (rnd() - 0.5) * 0.05); im.setColorAt(k, col);
          });
          im.castShadow = true; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; g.add(im);
          return im;
        }
