        // ==== KHÍ QUYỂN (hạ tầng, dựng trước mọi vật liệu): ÁNH TRỜI theo hướng + SƯƠNG THẤP theo độ cao + NẮNG TRONG SƯƠNG XA ====
        //  · Ánh trời: hemi + amb (core/boot.js) như nhau theo mọi hướng ngang ⇒ mặt khuất nắng xám phẳng. LightProbe (SH bậc 2, 9 hệ số) cộng PHẦN CHÊNH
        //    giữa trời mô hình (atmProbe: thiên đỉnh xanh, chân trời nhạt, quầng quanh mặt trời, ráng phía mặt trời thấp, đất hắt nắng) và hemi + amb ⇒ ánh
        //    gián tiếp = trời mô hình. Chuẩn hoá: độ chói mặt ngửa = hemi + amb (độ sáng chung như cũ), chỉ đổi màu + hướng: mặt về phía mặt trời ấm, phía
        //    ngược xanh, mặt úp nhận đất hắt nắng. hemi / amb giữ nguyên (xe env-map, khói, mây đọc cường độ). Mọi vật liệu có ánh sáng nhận, cả lô gộp;
        //    bóng trời dưới tán (core/sky-shade.js) nhân indirectDiffuse ⇒ che luôn phần này. Chiếu trời lên SH chỉ khi đèn trời đổi (~0,05 ms).
        //  · Sương: thay mảnh shader fog_* của three (toàn cục, trước lần biên dịch đầu). Vị trí thế giới lấy ngược từ mvPosition (ma trận nhìn cứng, như
        //    sky-shade). SƯƠNG THẤP: mật độ giảm mũ theo độ cao trên mặt hồ hạ lưu (lakeY), tích phân đúng dọc tia camera trực giao ⇒ mặt sông, thung lũng
        //    mờ hơn cao nguyên (lúc dày nhất: mặt sông ~23 %, sườn cao hơn 2 m ~5 %, cao nguyên ~1 %); đọng dần từ tối, dày nhất rạng sáng, tan khi nắng
        //    lên, theo độ ẩm thật; màu = mặt trắng (mistA) dưới ánh trời + mistSun × nắng, qua ACES như màn hình ⇒ sáng sớm trắng hồng, trưa trắng, đêm xám
        //    xanh. SƯƠNG XA (near / far cũ, màu nền giữ nguyên để hoà vào nền) sáng ấm thêm khi nhìn về phía mặt trời thấp (khớp ráng chiều core/night-sky.js).
        //  · Uniform chung bằng THAM CHIẾU: giá trị là đối tượng thường {x, y, z, w} — cloneUniforms của three chỉ sao chép Vector / Color / mảng, đối tượng
        //    khác giữ tham chiếu ⇒ atmTick ghi 1 lần mỗi khung cho mọi vật liệu, không biên dịch lại. ShaderMaterial tự khai fogColor (trăng, mây) không
        //    có uniform mới ⇒ 0 ⇒ sương cũ y như trước. Đầu dò: ATM.k (sky / mist / sun = 0 ⇒ như cũ, so cùng khung).
        const ATM = { k: { sky: 1, mist: 1, sun: 1 }, probe: new THREE.LightProbe(), sig: new Float32Array(12).fill(-9),
          fogH: { x: 0, y: 1, z: 0, w: 0 }, fogV: { x: 0, y: -1, z: 0, w: 0 }, fogM: { x: 0, y: 0, z: 0 }, fogS: { x: 0, y: 0, z: 0 },
          // trời mô hình (tuyến tính, tương đối — chuẩn hoá sau): thiên đỉnh / chân trời ngày, chạng vạng (phía mặt trời / phía ngược), đêm; sat: độ đậm màu
          p: { sat: 0.55, glow: 0.8, bounce: 0.8, night: 0.7, zen: [0.50, 0.68, 1.00], hor: [0.92, 0.94, 1.00], dZen: [0.40, 0.46, 0.80], dSun: [1.00, 0.62, 0.40], dAway: [0.60, 0.58, 0.78],
            nZen: [0.26, 0.34, 0.60], nHor: [0.40, 0.45, 0.62],
            // sương thấp: mật độ / m ở mặt hồ hạ lưu lúc dày nhất, bề dày đặc trưng (m) · nắng trong sương xa: độ mạnh
            mist: 0.2, mistH: 1.2, mistA: 0.8, mistSun: 0.4, haze: 0.35 } };
        scene.add(ATM.probe);
        {
          const U = { fogH: { value: ATM.fogH }, fogV: { value: ATM.fogV }, fogM: { value: ATM.fogM }, fogS: { value: ATM.fogS } }, SC = THREE.ShaderChunk;
          Object.assign(THREE.UniformsLib.fog, U);   // ShaderMaterial gộp UniformsLib.fog sau tệp này (khói) cũng nhận
          for (const k in THREE.ShaderLib) { const u = THREE.ShaderLib[k].uniforms; if (u && u.fogColor) Object.assign(u, U); }
          const rep = (s, a, b) => { if (!s.includes(a)) throw new Error('atmosphere: mảnh fog của three đã đổi: ' + a); return s.replace(a, b); };
          SC.fog_pars_vertex = rep(SC.fog_pars_vertex, 'varying float vFogDepth;', 'varying float vFogDepth;\n\tvarying vec3 vFogW;');
          SC.fog_vertex = rep(SC.fog_vertex, 'vFogDepth = - mvPosition.z;', 'vFogDepth = - mvPosition.z;\n\tvFogW = transpose( mat3( viewMatrix ) ) * ( mvPosition.xyz - viewMatrix[ 3 ].xyz );');
          SC.fog_pars_fragment = rep(SC.fog_pars_fragment, 'varying float vFogDepth;', 'varying float vFogDepth;\n\tvarying vec3 vFogW;\n\tuniform vec4 fogH, fogV;\n\tuniform vec3 fogM, fogS;');
          //  fogV: hướng nhìn (thế giới), w = 1 khi vật liệu có uniform mới · fogH: x mật độ ở mặt hồ, y = 1 / bề dày, z độ cao mặt hồ, w độ mạnh.
          //  Tia trực giao vào điểm từ mặt phẳng camera: cao yc = y + a·D (a = −hướng.y, D = độ sâu) ⇒ τ = ρ0 (e^(−k(y−y0)) − e^(−k(yc−y0))) / (k a);
          //  dưới mặt hồ (đáy sông) kẹp −2 m. Trộn trong không gian ra màn hình như sương cũ của three.
          SC.fog_fragment = rep(SC.fog_fragment, 'gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );', `vec3 fogTint = fogColor;
	if ( fogV.w > 0.0 ) {
		float fogA = max( - fogV.y, 0.05 ), fogDy = vFogW.y - fogH.z;
		float fogTau = fogH.x * ( exp( - fogH.y * max( fogDy, - 2.0 ) ) - exp( - fogH.y * ( fogDy + fogA * vFogDepth ) ) ) / ( fogH.y * fogA );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogM, fogH.w * ( 1.0 - exp( - max( fogTau, 0.0 ) ) ) );
		fogTint += fogS;
	}
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogTint, fogFactor );`);
        }
        //  trời mô hình → SH: 32 × 16 hướng (trọng số góc khối), cơ sở Y_lm của three (SphericalHarmonics3.getBasisAt — cùng quy ước với shader) tính sẵn
        const ATM_N = 512, ATM_D = new Float32Array(ATM_N * 3), ATM_Y = new Float32Array(ATM_N * 9), ATM_W = new Float32Array(ATM_N), ATM_T = new Float64Array(27), ATM_G = new Float64Array(27);
        { const b = [], v = new THREE.Vector3(); let i = 0;
          for (let r = 0; r < 16; r++) { const th = (r + 0.5) / 16 * Math.PI, st = Math.sin(th);
            for (let q = 0; q < 32; q++, i++) { const ph = (q + 0.5) / 32 * 2 * Math.PI; v.set(st * Math.cos(ph), Math.cos(th), st * Math.sin(ph));
              ATM_D[i * 3] = v.x; ATM_D[i * 3 + 1] = v.y; ATM_D[i * 3 + 2] = v.z; THREE.SphericalHarmonics3.getBasisAt(v, b); for (let j = 0; j < 9; j++) ATM_Y[i * 9 + j] = b[j];
              ATM_W[i] = st * (Math.PI / 16) * (2 * Math.PI / 32); } } }
        const atmLum = (T, j) => 0.2126 * T[j] + 0.7152 * T[j + 1] + 0.0722 * T[j + 2];
        //  bức xạ mặt ngửa (n = +y) từ SH như shader three (shGetIrradianceAt): band 2 còn hệ số 6 (z² − ⅓ ở n.z = 0) và 8 (x² − y²)
        const atmUp = (T, c) => 0.886227 * T[c] + 1.023328 * T[3 + c] - 0.247708 * T[18 + c] - 0.429043 * T[24 + c];
        const _atL = new THREE.Vector3(), _atV = new THREE.Vector3(), _atC = new THREE.Color(), _atS = new THREE.Color(), ATM_SIG = new Float32Array(12);
        function atmProbe() {   // đèn trời đổi (atmTick so chữ ký) ⇒ chiếu lại; ATM.k.sky = 0 ⇒ probe 0 (y như hemi + amb)
          const sh = ATM.probe.sh.coefficients, P = ATM.p, k = ATM.k.sky * (1 - (1 - P.night) * nightFactor);
          if (!k) { for (const c of sh) c.set(0, 0, 0); return; }
          _atL.copy(sun.position).sub(sun.target.position).normalize();   // đèn chính: mặt trời, đêm là trăng / phía đối diện (core/sky-sun-moon.js)
          const lx = _atL.x, ly = _atL.y, lz = _atL.z, lh = Math.hypot(lx, lz) || 1, dayF = 1 - nightFactor, dk = skyDusk * Math.min(1, dayF * 2.5), sc = sun.color, si = sun.intensity;
          const nd = (n, d) => n + (d - n) * dayF;   // đêm → ngày
          const Zr = nd(P.nZen[0], P.zen[0]), Zg = nd(P.nZen[1], P.zen[1]), Zb = nd(P.nZen[2], P.zen[2]), Hr = nd(P.nHor[0], P.hor[0]), Hg = nd(P.nHor[1], P.hor[1]), Hb = nd(P.nHor[2], P.hor[2]);
          ATM_T.fill(0); ATM_G.fill(0);
          for (let i = 0; i < ATM_N; i++) {
            const x = ATM_D[i * 3], y = ATM_D[i * 3 + 1], z = ATM_D[i * 3 + 2], w = ATM_W[i], Y = i * 9;
            let r, g, b, A;
            if (y >= 0) {   // trời: thiên đỉnh → chân trời; chạng vạng: chân trời phía mặt trời cam, phía ngược tím xanh; quầng quanh đèn chính
              const hz = (1 - y) * (1 - y), ch = (x * lx + z * lz) / (lh * (Math.hypot(x, z) || 1)), toward = ((1 + ch) / 2) ** 2;
              const dHr = P.dAway[0] + (P.dSun[0] - P.dAway[0]) * toward, dHg = P.dAway[1] + (P.dSun[1] - P.dAway[1]) * toward, dHb = P.dAway[2] + (P.dSun[2] - P.dAway[2]) * toward;
              const zr = Zr + (P.dZen[0] - Zr) * dk, zg = Zg + (P.dZen[1] - Zg) * dk, zb = Zb + (P.dZen[2] - Zb) * dk, hr = Hr + (dHr - Hr) * dk, hg = Hg + (dHg - Hg) * dk, hb = Hb + (dHb - Hb) * dk;
              const cg = x * lx + y * ly + z * lz, gl = P.glow * (0.9 * Math.exp((cg - 1) / 0.12) + 0.35 * ((1 + cg) / 2) ** 2) * (0.25 + 0.75 * dayF);
              r = zr + (hr - zr) * hz + gl * sc.r; g = zg + (hg - zg) * hz + gl * sc.g; b = zb + (hb - zb) * hz + gl * sc.b; A = ATM_T;
            } else {   // đất hắt: màu đất của hemi × (nắng trên mặt đất + trời) / π — tuyệt đối, cộng sau khi chuẩn hoá trời
              const e = P.bounce * (si * Math.max(ly, 0) + hemi.intensity + amb.intensity) / Math.PI, G = hemi.groundColor;
              r = G.r * e * sc.r; g = G.g * e * sc.g; b = G.b * e * sc.b; A = ATM_G;
            }
            for (let j = 0; j < 9; j++) { const yw = ATM_Y[Y + j] * w; A[j * 3] += r * yw; A[j * 3 + 1] += g * yw; A[j * 3 + 2] += b * yw; }
          }
          for (let j = 0; j < 27; j += 3) { const L = atmLum(ATM_T, j); for (let c = 0; c < 3; c++) ATM_T[j + c] = L + P.sat * (ATM_T[j + c] - L); }   // độ đậm màu quanh độ chói
          //  hemi + amb hiện tại: E(n) = A + B n.y ⇒ SH c0 = A / 0,886227, c1 (y) = B / 1,023328
          const hi = hemi.intensity, S = hemi.color, Gc = hemi.groundColor, ai = amb.intensity, AC = amb.color;
          const Cr0 = (ai * AC.r + hi * (S.r + Gc.r) / 2) / 0.886227, Cg0 = (ai * AC.g + hi * (S.g + Gc.g) / 2) / 0.886227, Cb0 = (ai * AC.b + hi * (S.b + Gc.b) / 2) / 0.886227;
          const Cr1 = hi * (S.r - Gc.r) / 2 / 1.023328, Cg1 = hi * (S.g - Gc.g) / 2 / 1.023328, Cb1 = hi * (S.b - Gc.b) / 2 / 1.023328;
          const eUp = 0.2126 * (ai * AC.r + hi * S.r) + 0.7152 * (ai * AC.g + hi * S.g) + 0.0722 * (ai * AC.b + hi * S.b);
          const tUp = 0.2126 * atmUp(ATM_T, 0) + 0.7152 * atmUp(ATM_T, 1) + 0.0722 * atmUp(ATM_T, 2);
          const s1 = tUp > 1e-6 ? eUp / tUp : 0; for (let j = 0; j < 27; j++) ATM_T[j] = ATM_T[j] * s1 + ATM_G[j];
          const tUp2 = 0.2126 * atmUp(ATM_T, 0) + 0.7152 * atmUp(ATM_T, 1) + 0.0722 * atmUp(ATM_T, 2), s2 = tUp2 > 1e-6 ? eUp / tUp2 : 0;   // đất hắt rò sang mặt ngửa (SH bậc 2) ⇒ chuẩn hoá lại
          for (let j = 0; j < 9; j++) {
            const r = ATM_T[j * 3] * s2, g = ATM_T[j * 3 + 1] * s2, b = ATM_T[j * 3 + 2] * s2;
            sh[j].set(k * (r - (j === 0 ? Cr0 : j === 1 ? Cr1 : 0)), k * (g - (j === 0 ? Cg0 : j === 1 ? Cg1 : 0)), k * (b - (j === 0 ? Cb0 : j === 1 ? Cb1 : 0)));
          }
        }
        function atmAces(c, ex) {   // ACESFilmicToneMapping của three r160 (tonemapping_pars_fragment) trên CPU: màu tuyến tính → tuyến tính 0..1
          const r = c.r * ex / 0.6, g = c.g * ex / 0.6, b = c.b * ex / 0.6, f = v => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
          const X = f(0.59719 * r + 0.35458 * g + 0.04823 * b), Y = f(0.076 * r + 0.90834 * g + 0.01566 * b), Z = f(0.0284 * r + 0.13383 * g + 0.83777 * b), k = v => Math.min(1, Math.max(0, v));
          c.r = k(1.60475 * X - 0.53108 * Y - 0.07367 * Z); c.g = k(-0.10208 * X + 1.10813 * Y - 0.00605 * Z); c.b = k(-0.00327 * X - 0.07276 * Y + 1.07602 * Z); return c;
        }
        function atmTick() {   // mỗi khung sau updateSky (loop/main-loop-rest.js): probe khi đèn trời đổi · uniform sương theo camera, giờ, độ ẩm
          const g = ATM.sig, v = ATM_SIG, L = _atL.copy(sun.position).sub(sun.target.position).normalize(), sc = sun.color;
          v[0] = L.x; v[1] = L.y; v[2] = L.z; v[3] = sc.r; v[4] = sc.g; v[5] = sc.b; v[6] = sun.intensity; v[7] = hemi.intensity; v[8] = amb.intensity; v[9] = nightFactor; v[10] = skyDusk; v[11] = ATM.k.sky;
          let ch = false; for (let i = 0; i < 12; i++) if (Math.abs(v[i] - g[i]) > 2e-3) { ch = true; break; }
          if (ch) { g.set(v); atmProbe(); }
          const P = ATM.p, dayF = 1 - nightFactor;
          camera.getWorldDirection(_atV); const F = ATM.fogV; F.x = _atV.x; F.y = _atV.y; F.z = _atV.z; F.w = 1;
          //  sương thấp theo giờ: đọng dần 18:30 → 23:00 (½), giữ qua đêm, dày nhất 5:00 → 7:00, tan 7:00 → 9:30 · × độ ẩm thật (65 → 95 %), mưa thêm
          const h = liveWeather.localHour, w = liveWeather.state, cur = w.fresh ? w.data?.current : null, rh = cur && Number.isFinite(cur.relative_humidity_2m) ? cur.relative_humidity_2m : 85;
          const nightM = h >= 12 ? 0.5 * smooth01(18.5, 23, h) : 0.5, dawn = smooth01(4.2, 5.4, h) * (1 - smooth01(7, 9.5, h)), m = h < 12 ? Math.max(nightM * (1 - smooth01(7, 9.5, h)), dawn) : nightM;
          const wet = (0.3 + 0.7 * smooth01(65, 95, rh)) * (w.raining ? 1.3 : 1);
          const H = ATM.fogH; H.x = P.mist * m * wet; H.y = 1 / P.mistH; H.z = lakeY; H.w = ATM.k.mist;
          //  màu sương thấp: mặt trắng mistA dưới ánh trời (hemi + amb, mặt ngửa) + mistSun × nắng (đèn chính) ⇒ ACES như màn hình ⇒ sRGB (sương trộn sau tone map)
          _atC.copy(hemi.color).multiplyScalar(hemi.intensity).add(_atS.copy(amb.color).multiplyScalar(amb.intensity)).add(_atS.copy(sc).multiplyScalar(sun.intensity * P.mistSun));
          atmAces(_atC.multiplyScalar(P.mistA / Math.PI), renderer.toneMappingExposure).convertLinearToSRGB(); const M = ATM.fogM; M.x = _atC.r; M.y = _atC.g; M.z = _atC.b;
          //  nắng trong sương xa: nhìn về phía mặt trời thấp (tia trực giao song song ⇒ cả khung cùng một hệ số; xoay camera đổi theo) · màu đèn chính
          const se = sunElevSin, low = smooth01(-0.12, 0.0, se) * (1 - smooth01(0.2, 0.5, se)), cs = skyOn ? Math.max(0, _atV.dot(_wp)) : 0, sk = ATM.k.sun * P.haze * low * cs * cs * cs;
          _atS.copy(sc).convertLinearToSRGB(); const S = ATM.fogS; S.x = _atS.r * sk; S.y = _atS.g * sk; S.z = _atS.b * sk;
        }
