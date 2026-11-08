        // ==== ỐNG KÍNH ĐIỆN ẢNH (hạ tầng —, nghiên cứu ở docs/cinematic-closeup-dof.md, phương án A): camera bám vật (CAMF.o)
        //      và phóng ×16 → ×30 ⇒ tiền cảnh / hậu cảnh mờ dần theo độ sâu, vật đang bám nét (tiêu cự = điểm nhìn target — camFollowTick trượt nó theo vật ⇒
        //      đổi vật bám thì nét tự trượt theo). Ngoài lúc đó vẽ thẳng như cũ, khung tạm trả lại sau 3 s (MSAA 4 mẫu ở trần 2K ≈ 90 MB RAM đồ hoạ).
        //      Lượt vẽ khi bật: (1) cảnh trừ lớp LAYER_SHARP vào khung tạm MSAA + ảnh độ sâu · (1b) lấy nét tự động (dưới) · (2) nửa độ phân giải: màu + vòng nhoè có dấu (CoC, âm = trước tiêu cự)
        //      · (2b) CoC lớn nhất mỗi ô 16 × 16 điểm ảnh, rồi lớn nhất 3 × 3 ô quanh (tile max — Jimenez 2014) ⇒ bán kính gom riêng của từng điểm ảnh
        //      · (3) nửa độ phân giải: gom 48 mẫu xoắn ốc trong bán kính đó (scatter-as-gather — mẫu ở SAU tâm kẹp CoC ≤ CoC tâm ⇒ hậu cảnh không loang lên vật
        //      nét; tiền cảnh mờ đè lên được, độ phủ ghi vào alpha); bán kính < 0,5 px ⇒ bỏ qua (dải nét giữa khung gần như không tốn) · (4) ra khung vẽ: nét → mờ
        //      nhỏ → mờ lớn theo CoC từng điểm ảnh (dưới) + ghi lại độ sâu thật (gl_FragDepth) · (5) lớp LAYER_SHARP (nhãn, viền rê chuột, bong bóng — core/boot.js)
        //      vẽ đè, kiểm độ sâu với độ sâu vừa ghi ⇒ nét như cũ.
        //      Chuyển nét → mờ không biên (docs/cinematic-closeup-dof.md
        //      mục 06/11): trước đây trộn thẳng ảnh nét với ảnh gom trong dải CoC 0,75 → 2,5 px ⇒ ảnh lồng bản mờ của chính nó, thấy 1 đường ngang (GPU Gems 3
        //      ch. 28: thiếu mức mờ nhỏ ⇒ "cross-fade with a blurred version of itself"); mẫu rải trên bán kính lớn nhất của khung ⇒ CoC nhỏ chỉ trúng 1–3 mẫu.
        //      Giờ σ hiệu dụng tăng liền theo CoC: mờ nhỏ 4 mẫu song tuyến toàn phân giải (σ 0,87 px) ở CoC 0 → 1,73 px, ảnh gom ở 1,73 → 2,33 px; ảnh nửa phân
        //      giải tự có σ ≈ 1 px (co 2 × 2 + phóng song tuyến) ⇒ bán kính gom √(CoC² − 4) để tổng σ = CoC / 2 như đĩa thật. CoC qua chân bậc 2 (LENS_TOE: ¼ đầu
        //      dải) rồi mới tuyến tính ⇒ mờ bắt đầu dưới ngưỡng mắt thấy, tăng dần, không gãy.
        //      Bẫy three r160 (đo 05/11): khung tạm tuyến tính ⇒ bạc màu (shader tự viết + nền không qua tone map như lúc vẽ ra màn hình) ⇒ đánh dấu isXRRenderTarget:
        //      tone map + mã hoá sRGB y như màn hình; colorSpace sRGB đặt SAU lần setRenderTarget đầu (đặt từ đầu: renderbuffer MSAA SRGB8 ≠ texture RGBA8 ⇒ blit
        //      lỗi 1282, khung đen; đổi cỡ cũng vậy ⇒ dựng khung mới); scene.background là lệnh xoá, không qua shader ⇒ lúc vẽ vào khung tạm thay màu đã mã hoá sRGB
        //      Sa bàn (tilt-shift —, chọn kiểu dải trên + dưới, tự nhiên nhất): zoom ≥ ×3 không cần bám vật ⇒
        //      cùng các lượt trên, chỉ đổi cách tính vòng nhoè: camera nhìn chéo xuống ⇒ mặt đất qua điểm nhìn ở mép trên khung xa hơn, mép dưới gần hơn
        //      (1 m dọc khung = tan(góc nghiêng) m độ sâu) ⇒ vùng nét ± A chiều cao khung tính theo ĐỘ SÂU, không theo vị trí điểm ảnh: dải mờ uốn theo đồi,
        //      cột tua-bin / tán cây giữa khung cao lên mép trên vẫn nét đúng khoảng cách của nó. Nhìn gần thẳng xuống (mặt đất cùng độ sâu) ⇒ tắt dần.
        //      A theo zoom: ×3 → ×30 thang log, A 0,29 → 0,15 ⇒ chỗ bắt đầu thấy mờ
        //      (σ ≥ 0,3 px) lùi từ ~17 % → ~27 % chiều cao tính từ mỗi mép ⇒ vùng thấy mờ đo được 33 % → 55 % khung (+22 điểm; bản 05/11: 32 % ở ×3, 23 %
        //      ở ×30 — lb1.js + lb-prof.py); độ mờ ở mép giữ 1 % ⇒ dải chuyển rộng ra, dốc thoải hơn. Muốn tăng ít / nhiều hơn: chỉ đổi LENS_TS_A1.
        //      Mờ theo độ sâu thật (cột điện phía trước rõ hơn cây phía sau — docs/cinematic-closeup-dof.md): bỏ kẹp theo dải màn hình (05/11 → 06/11 sáng: dải giữa khung luôn nét ⇒ cây sau cột vẫn
        //      nét nếu ở dải giữa, cột vươn lên dải trên mờ theo hàng màn hình; Held 2010: dải dọc chỉ gần đúng khi cảnh gần như phẳng) ⇒ vòng nhoè chỉ theo
        //      khoảng cách tới MẶT PHẲNG NÉT ĐỨNG (vuông góc mặt đất, như ống kính tilt-shift nghiêng kiểu Scheimpflug): độ mờ theo khoảng cách NGANG tới
        //      camera ⇒ cột, cây mờ đều từ gốc tới ngọn bằng mặt đất chỗ nó đứng. Thử độ sâu theo trục nhìn (ống kính thường) trước: nhìn chéo 38° ⇒ ngọn cây
        //      10 m gần camera hơn gốc ~6 m ⇒ tán cây sau cột lọt vùng nét trong khi đất sau lưng mờ (pt2.js) — ngược ý G. Mặt đất: hai cách cho cùng dải mờ.
        //      Quá mép khung không kẹp ở tối đa nữa mà tăng tiếp, chậm dần tới LENS_FAR × (thấu kính mỏng: CoC ∝ |z − zf| / z, xa vô cùng vẫn hữu hạn)
        //      ⇒ cột < cây sau cột < đồi xa. Tiêu cự sa bàn = lấy nét tự động giữa khung (kiểu Cinemachine Auto Focus
        //      "Screen Center"): trung vị khoảng cách ngang của 5 × 5 điểm trong ô ± LENS_AF_R giữa khung, trượt êm ~LENS_AF_T s, giữ trong 2 ảnh 1 × 1 đổi qua lại (không đọc
        //      về CPU) — trước đó tiêu cự là điểm nhìn ở độ cao cố định 5 m (mặt cao nguyên 7,1 m) ⇒ ở ×24 – ×30 mặt phẳng nét nằm ~3 m sau vật giữa khung.
        //      Bám vật ×16 → ×30 ⇒ thông số trượt dần sang vùng nét ± LENS_RG quanh vật (ở trên), tiêu cự trượt sang vật bám (uFm) ====
        const LENS = { s: 0, m: 0, idle: 0, af: 1, on: false, rt: null, ha: null, hb: null, ta: null, tb: null, fa: null, fb: null, w: 0, h: 0 };   // s: độ mạnh · m: phần bám vật (0 = sa bàn) · af = 1: khung tới lấy nét thẳng, không trượt
        const LENS_RG = 0.45, LENS_K = 0.005, LENS_MAX = 0.008, LENS_TOE = 0.25, LENS_FAR = 2;   // vùng nét ± 0,45 m quanh tiêu cự (+ chân bậc 2 ⇒ thấy mờ từ ~0,73 m như 05/11) · 1 m lệch ⇒ nhoè 0,5% chiều cao khung · "tối đa" 0,8% (ở ×30; trần mờ 50% của 3,2% cũ = 1,6% khung) · chân: ¼ đầu dải · quá "tối đa" tăng chậm dần tới 2 ×
        const LENS_TS_A0 = 0.29, LENS_TS_A1 = 0.15, LENS_TS_MAX = 0.008, LENS_AF_R = 0.03, LENS_AF_T = 0.3;   // sa bàn: nét tới A chiều cao khung tính từ tâm (×3: 0,29 → ×30: 0,15), mờ dần tới mép · 0,8 % ở độ sâu mép khung (× LENS_FAR = trần 1,6 %) · lấy nét: ô ± 3 % giữa khung, trượt ~0,3 s
        const _lnS = new THREE.Vector2(), _lnD = new THREE.Vector3(), _lnT = new THREE.Vector3(), _lnBg = new THREE.Color(), _lnM = new THREE.Matrix4();
        //  VẬT MỜ ÍT HƠN: con trực tiếp của scene có userData.lensSoft = { k, b: [hộp…] } ⇒ vòng nhoè
        //  × k trong ≤ 2 hộp [x0, y0, z0, x1, y1, z1] (toạ độ cục bộ của vật), mép mềm 0,25 m. Điểm ảnh dựng lại toạ độ từ độ sâu (camera trực giao) rồi đổi về cục bộ
        //  vật bằng 1 ma trận (uSL) ⇒ không thêm lượt vẽ, không đổi lớp vật (vật đã gộp lượt vẽ vẫn gộp); vật che trước hộp vẫn mờ đủ. Chữ HTML của vật: userData.lensK
        const LENS_SOFT = { o: null };
        const LENS_AF_SPAN = 200;   // tiêu cự lấy nét tự động ghi trong ảnh 1 × 1 = lệch ngang so với điểm nhìn, ± 200 m
        const lnU = { uNr: { value: 0.1 }, uFr: { value: 4000 }, uHt: { value: 0 }, uHs: { value: LENS_AF_SPAN }, uCa: { value: 1 }, uSn: { value: 0 }, uFh: { value: 1 }, uRg: { value: LENS_RG }, uK: { value: 0 }, uMax: { value: 1 }, uCm: { value: LENS_FAR }, uFm: { value: 0 }, tF: { value: null }, uSL: { value: new THREE.Matrix4() }, uSb: { value: [0, 0, 0, 0].map(() => new THREE.Vector3(1e9, 1e9, 1e9)) }, uSk: { value: 1 } };
        const LENS_VS = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
        //  vòng nhoè có dấu (điểm ảnh khung vẽ) theo khoảng cách NGANG h tới camera (mặt phẳng nét đứng — dưới): h = độ sâu × cos góc cúi + hàng màn hình × sin góc
        //  cúi (camera trực giao) ⇒ dọc thân cột / cây h không đổi; tiêu cự hf = điểm nhìn uHt + lệch của lấy nét tự động (ảnh 1 × 1 tF, sa bàn), bám vật (uFm = 1) ⇒ đúng vật
        //  · x = chỗ trong dải mờ (1 = mép khung ở sa bàn / mức "tối đa" khi bám vật) · chân bậc 2 → tuyến tính → quá 1 tăng chậm dần tới LENS_FAR (hữu tỉ, liền đạo hàm)
        const LENS_COC = '#include <packing>\nuniform float uNr, uFr, uHt, uHs, uCa, uSn, uFh, uRg, uK, uMax, uCm, uFm; uniform sampler2D tF; uniform mat4 uSL; uniform vec3 uSb[4]; uniform float uSk; varying vec2 vUv; float lnZ(float d) { return uNr + d * (uFr - uNr); }'   // camera trực giao: độ sâu tuyến tính
          + ' float lnH(float d, float y) { return lnZ(d) * uCa + (y - 0.5) * uFh * uSn; }'
          + ' float lnSk(float d, vec2 q) { vec3 p = (uSL * vec4(q - 0.5, lnZ(d), 1.0)).xyz; return mix(uSk, 1.0, smoothstep(0.0, 0.25, min(length(max(max(uSb[0] - p, p - uSb[1]), 0.0)), length(max(max(uSb[2] - p, p - uSb[3]), 0.0))))); }'
          + ' float lnCoc(float h) { float hf = uHt + (1.0 - uFm) * (unpackRGBAToDepth(texture2D(tF, vec2(0.5))) - 0.5) * 2.0 * uHs, x = max((abs(h - hf) - uRg) * uK / uMax, 0.0);'
          + ` float t = (x < ${LENS_TOE.toFixed(3)} ? x * x / ${(2 * LENS_TOE).toFixed(3)} : x - ${(LENS_TOE / 2).toFixed(3)}) / ${(1 - LENS_TOE / 2).toFixed(3)};`
          + ` if (t > 1.0) { float u = (t - 1.0) / ${(LENS_FAR - 1).toFixed(3)}; t = 1.0 + ${(LENS_FAR - 1).toFixed(3)} * u / (1.0 + u); } return sign(h - hf) * uMax * t; }`;
        const lnMat = (u, fs, o = {}) => new THREE.ShaderMaterial({ uniforms: { ...lnU, ...u }, vertexShader: LENS_VS, fragmentShader: LENS_COC + fs, depthTest: false, depthWrite: false, toneMapped: false, ...o });
        const lnPre = lnMat({ tC: { value: null }, tD: { value: null }, uTx: { value: new THREE.Vector2() } },   // (2) nửa độ phân giải: màu lọc 2 × 2, độ sâu gần nhất trong 4 điểm
          ' uniform sampler2D tC, tD; uniform vec2 uTx; void main() { vec2 e = uTx * 0.5;'
          + ' float d = min(min(texture2D(tD, vUv - e).x, texture2D(tD, vUv + e).x), min(texture2D(tD, vUv + vec2(e.x, -e.y)).x, texture2D(tD, vUv + vec2(-e.x, e.y)).x));'
          + ' gl_FragColor = vec4(texture2D(tC, vUv).rgb, lnCoc(lnH(d, vUv.y)) * lnSk(d, vUv) / (2.0 * uCm) + 0.5); }');   // uCm = LENS_FAR × uMax: vòng nhoè lớn nhất ghi được
        const lnTile = lnMat({ tA: { value: null }, uTh: { value: new THREE.Vector2() } },   // (2b) |CoC| / uCm lớn nhất trong 8 × 8 điểm nửa phân giải (đọc đúng tâm điểm ⇒ không lẫn)
          ' uniform sampler2D tA; uniform vec2 uTh; void main() { vec2 b = floor(gl_FragCoord.xy) * 8.0 + 0.5; float m = 0.0;'
          + ' for (int j = 0; j < 8; j++) for (int i = 0; i < 8; i++) m = max(m, abs(texture2D(tA, (b + vec2(float(i), float(j))) * uTh).a - 0.5));'
          + ' gl_FragColor = vec4(2.0 * m, 0.0, 0.0, 1.0); }');
        const lnNbr = lnMat({ tT: { value: null }, uTt: { value: new THREE.Vector2() } },   // … rồi lớn nhất 3 × 3 ô quanh ⇒ tiền cảnh mờ ở ô bên vẫn loang sang được
          ' uniform sampler2D tT; uniform vec2 uTt; void main() { float m = 0.0;'
          + ' for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) m = max(m, texture2D(tT, vUv + vec2(float(i), float(j)) * uTt).r); gl_FragColor = vec4(m, 0.0, 0.0, 1.0); }');
        const lnGat = lnMat({ tA: { value: null }, tN: { value: null }, uTf: { value: new THREE.Vector2() } },   // (3) gom 48 mẫu xoắn ốc tỉ lệ vàng trong bán kính của điểm ảnh (đơn vị: điểm ảnh khung vẽ)
          ' uniform sampler2D tA, tN; uniform vec2 uTf; float dec(float a) { return (a - 0.5) * 2.0 * uCm; } float rho(float c) { return sqrt(max(c * c - 4.0, 0.0)); }'
          + ' void main() { vec4 a0 = texture2D(tA, vUv); float s0 = dec(a0.a), c0 = abs(s0), R = rho(max(c0, texture2D(tN, vUv).r * uCm)), nw = 0.0;'
          + ' if (R < 0.5) { gl_FragColor = vec4(a0.rgb, 0.0); return; } vec4 acc = vec4(a0.rgb, 1.0);'
          + ' for (int i = 0; i < 48; i++) { float r = sqrt((float(i) + 0.5) / 48.0) * R, t = float(i) * 2.39996; vec4 s = texture2D(tA, vUv + vec2(cos(t), sin(t)) * r * uTf);'
          + ' float ss = dec(s.a), cs = abs(ss); if (ss > s0) cs = min(cs, c0); float w = smoothstep(r - 1.0, r + 0.5, rho(cs)); acc += vec4(s.rgb * w, w); if (ss < -2.0) nw += w; }'
          + ' gl_FragColor = vec4(acc.rgb / acc.a, clamp(nw / 48.0, 0.0, 1.0)); }');
        const lnOut = lnMat({ tC: { value: null }, tD: { value: null }, tB: { value: null }, uBias: { value: 0 }, uTf: { value: new THREE.Vector2() } },   // (4) nét → mờ nhỏ → mờ lớn + ghi độ sâu (lớp nét kiểm độ sâu với nó)
          //  độ sâu ghi lùi 4 cm: ảnh độ sâu MSAA gộp lấy 1 mẫu lệch tâm điểm ảnh (không phải tâm) ⇒ mặt xiên lệch vài cm ⇒ mặt nạ viền rê chuột (đúng mặt vật,
          //  polygonOffset) trượt kiểm độ sâu từng chấm — viền thành vệt lấm tấm (thử 05/11). Lùi 4 cm < nhích 6 cm sẵn có của viền ⇒ vật che thật vẫn che
          ' uniform sampler2D tC, tD, tB; uniform float uBias; uniform vec2 uTf; void main() { float d = texture2D(tD, vUv).x, c = abs(lnCoc(lnH(d, vUv.y))) * lnSk(d, vUv); vec4 b = texture2D(tB, vUv);'
          + ' vec3 col = texture2D(tC, vUv).rgb; float w1 = clamp(c / 1.73, 0.0, 1.0), w2 = max(clamp((c - 1.73) / 0.6, 0.0, 1.0), b.a); vec2 e = uTf * 0.75;'
          + ' if (w1 > 0.0 && w2 < 1.0) col = mix(col, 0.25 * (texture2D(tC, vUv + e).rgb + texture2D(tC, vUv - e).rgb + texture2D(tC, vUv + vec2(e.x, -e.y)).rgb + texture2D(tC, vUv + vec2(-e.x, e.y)).rgb), w1);'
          + ' gl_FragColor = vec4(mix(col, b.rgb, w2), 1.0); gl_FragDepthEXT = min(1.0, d + uBias); }',
          { depthTest: true, depthWrite: true, depthFunc: THREE.AlwaysDepth });
        const lnAf = lnMat({ tD: { value: null }, uAfK: { value: 1 }, uAfR: { value: new THREE.Vector2() } },   // (1b) lấy nét tự động: trung vị lệch ngang (h − điểm nhìn) của 5 × 5 điểm ô giữa khung (bỏ nền trời) → trượt về đó · không có điểm nào ⇒ về điểm nhìn
          ' uniform sampler2D tD; uniform float uAfK; uniform vec2 uAfR; float lnA(int i) { float k = float(i); vec2 q = 0.5 + (vec2(mod(k, 5.0), floor(k / 5.0)) * 0.5 - 1.0) * uAfR;'
          + ' float d = texture2D(tD, q).x; return d > 0.9999 ? 1e9 : lnH(d, q.y) - uHt; }'
          + ' void main() { float n = 0.0, b = 0.0, e = 1e9; for (int i = 0; i < 25; i++) n += step(lnA(i), 1e8);'
          + ' for (int i = 0; i < 25; i++) { float hi = lnA(i), c = 0.0; if (hi > 1e8) continue; for (int j = 0; j < 25; j++) { float hj = lnA(j); if (hj < 1e8) c += hj < hi ? 1.0 : (hj == hi ? 0.5 : 0.0); }'
          + ' if (abs(c - 0.5 * n) < e) { e = abs(c - 0.5 * n); b = hi; } } float p = unpackRGBAToDepth(texture2D(tF, vec2(0.5)));'
          + ' gl_FragColor = packDepthToRGBA(clamp(mix(p, 0.5 + b / (2.0 * uHs), uAfK), 0.0, 0.9999)); }');
        const lnQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lnPre), lnCam = new THREE.Camera(); lnQuad.frustumCulled = false;
        function lnFree() { for (const k of ['rt', 'ha', 'hb', 'ta', 'tb', 'fa', 'fb']) if (LENS[k]) { if (LENS[k].depthTexture) LENS[k].depthTexture.dispose(); LENS[k].dispose(); LENS[k] = null; } }
        listen(renderer.domElement, 'webglcontextrestored', () => { LENS.rt = LENS.ha = LENS.hb = LENS.ta = LENS.tb = LENS.fa = LENS.fb = null; });   // three dựng lại khung tạm theo colorSpace sRGB đã đặt ⇒ đúng bẫy blit 1282 / khung đen (trên) ⇒ bỏ, lnMake dựng lại đúng thứ tự (không dispose: đồ của ngữ cảnh cũ)
        function lnMake(w, h) {
          lnFree(); LENS.w = w; LENS.h = h;
          const rt = LENS.rt = new THREE.WebGLRenderTarget(w, h, { samples: matchMedia('(pointer: coarse)').matches ? 2 : 4 });
          rt.depthTexture = new THREE.DepthTexture(w, h); rt.depthTexture.type = THREE.UnsignedIntType; rt.isXRRenderTarget = true;
          renderer.setRenderTarget(rt); renderer.setRenderTarget(null); rt.texture.colorSpace = THREE.SRGBColorSpace;   // cấp bộ nhớ RGBA8 trước, rồi mới đổi
          const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1), tw = Math.ceil(hw / 8), th = Math.ceil(hh / 8), nf = { depthBuffer: false, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
          LENS.ha = new THREE.WebGLRenderTarget(hw, hh, { depthBuffer: false }); LENS.hb = new THREE.WebGLRenderTarget(hw, hh, { depthBuffer: false });
          LENS.ta = new THREE.WebGLRenderTarget(tw, th, nf); LENS.tb = new THREE.WebGLRenderTarget(tw, th, nf);   // ô 16 px (~16 KB mỗi ảnh ở 1264 × 791)
          LENS.fa = new THREE.WebGLRenderTarget(1, 1, nf); LENS.fb = new THREE.WebGLRenderTarget(1, 1, nf); LENS.af = 1;   // tiêu cự (độ sâu gói RGBA): khung trước / khung này
          lnPre.uniforms.tC.value = lnOut.uniforms.tC.value = rt.texture; lnPre.uniforms.tD.value = lnOut.uniforms.tD.value = lnAf.uniforms.tD.value = rt.depthTexture;
          lnTile.uniforms.tA.value = lnGat.uniforms.tA.value = LENS.ha.texture; lnNbr.uniforms.tT.value = LENS.ta.texture; lnGat.uniforms.tN.value = LENS.tb.texture; lnOut.uniforms.tB.value = LENS.hb.texture;
          lnPre.uniforms.uTx.value.set(1 / w, 1 / h); lnTile.uniforms.uTh.value.set(1 / hw, 1 / hh); lnNbr.uniforms.uTt.value.set(1 / tw, 1 / th); lnGat.uniforms.uTf.value.set(1 / w, 1 / h); lnOut.uniforms.uTf.value.set(1 / w, 1 / h);
        }
        const lnPass = (M, rt) => { lnQuad.material = M; renderer.setRenderTarget(rt); renderer.render(lnQuad, lnCam); };
        // ---- vòng nhoè cho CPU (chữ HTML core/html-text.js không đi qua các lượt vẽ trên ⇒ tự mờ bằng CSS blur theo số này, y như shader LENS_COC) ----
        //  tiêu cự sa bàn nằm trong ảnh 1 × 1 trên GPU ⇒ đọc về KHÔNG CHỜ: readPixels vào PBO + fence, khung sau hỏi xong chưa (trễ 1–3 khung, không dừng GPU;
        //  three r160 chưa có readRenderTargetPixelsAsync). WebGL1 / chưa đọc được ⇒ lệch 0 (tiêu cự = điểm nhìn).
        const LENS_RB = { pbo: null, fence: null, buf: new Uint8Array(4), off: 0 };   // off: lệch tiêu cự so với điểm nhìn (m), như (unpackRGBAToDepth − 0,5) × 2 × uHs
        function lnReadAf() {
          const gl = renderer.getContext(), R = LENS_RB; if (!renderer.capabilities.isWebGL2) return;
          if (R.fence) {
            const st = gl.clientWaitSync(R.fence, 0, 0); if (st === gl.TIMEOUT_EXPIRED) return;
            gl.deleteSync(R.fence); R.fence = null;
            if (st !== gl.WAIT_FAILED) { gl.bindBuffer(gl.PIXEL_PACK_BUFFER, R.pbo); gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, R.buf); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
              const b = R.buf, u = 255 / 256 / 255; R.off = ((b[0] / 16777216 + b[1] / 65536 + b[2] / 256 + b[3]) * u - 0.5) * 2 * LENS_AF_SPAN; }   // packing.glsl r160: byte cao nhất ở kênh a
          }
          if (!R.pbo) { R.pbo = gl.createBuffer(); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, R.pbo); gl.bufferData(gl.PIXEL_PACK_BUFFER, 4, gl.STREAM_READ); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null); }
          renderer.setRenderTarget(LENS.fa); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, R.pbo); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, 0); gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
          R.fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); gl.flush();
        }
        listen(renderer.domElement, 'webglcontextrestored', () => { LENS_RB.pbo = LENS_RB.fence = null; });
        function lensBlurPx(d, y) {   // d: độ sâu 0..1 (như ảnh độ sâu) · y: hàng màn hình 0 dưới → 1 trên ⇒ σ px CSS (đĩa bán kính CoC ⇒ σ = CoC / 2, như lnGat / lnOut) · ống kính tắt ⇒ 0
          if (!LENS.on) return 0;
          const U = lnU, h = (U.uNr.value + d * (U.uFr.value - U.uNr.value)) * U.uCa.value + (y - 0.5) * U.uFh.value * U.uSn.value, hf = U.uHt.value + (1 - U.uFm.value) * LENS_RB.off;
          const x = Math.max((Math.abs(h - hf) - U.uRg.value) * U.uK.value / U.uMax.value, 0);
          let t = (x < LENS_TOE ? x * x / (2 * LENS_TOE) : x - LENS_TOE / 2) / (1 - LENS_TOE / 2);
          if (t > 1) { const u = (t - 1) / (LENS_FAR - 1); t = 1 + (LENS_FAR - 1) * u / (1 + u); }
          return U.uMax.value * t / 2 / renderer.getPixelRatio();
        }
        const lnSharp = o => { if (o.layers.mask === 1) o.layers.set(LAYER_SHARP); };   // chỉ vật đang ở lớp thường (giấu nhãn của hình động cơ nổi: lớp 31 — để yên)
        function lensRender(dt) {   // thay renderer.render(scene, camera) cuối khung (loop/main-loop-rest.js)
          for (const r of sharpRoots) r.traverse(lnSharp);   // nhãn / khung tạo giữa chừng cũng vào lớp nét
          camera.getWorldDirection(_lnD);
          const tn = Math.sqrt(Math.max(0, 1 - _lnD.y * _lnD.y)) / Math.max(1e-3, -_lnD.y);   // tan góc nghiêng so với phương thẳng đứng
          const fo = CAMF.o ? THREE.MathUtils.smoothstep(camera.zoom, 16, 30) : 0;
          const ts = THREE.MathUtils.smoothstep(camera.zoom, 2, 3) * THREE.MathUtils.smoothstep(tn, 0.3, 0.6);   // sa bàn: ×2 → ×3; nhìn gần thẳng xuống ⇒ tắt
          LENS.s += (Math.max(fo, ts) - LENS.s) * Math.min(1, dt / 0.3);   // vào / ra êm ~0,3 s (bám vật mới, thôi bám, lăn chuột)
          LENS.m += (fo / Math.max(1e-3, fo, ts) - LENS.m) * Math.min(1, dt / 0.5);   // chuyển nét vật ↔ sa bàn ~0,5 s (thôi bám ở ×30: không nhảy)
          if (LENS.s < 0.02) { LENS.af = 1; LENS.on = false; LENS_RB.off = 0; if (LENS.rt && (LENS.idle += dt) > 3) lnFree(); renderer.render(scene, camera); return; }
          LENS.idle = 0; LENS.on = true; renderer.getDrawingBufferSize(_lnS); if (!LENS.rt || _lnS.x !== LENS.w || _lnS.y !== LENS.h) lnMake(_lnS.x, _lnS.y);   // đổi cỡ / độ phân giải tự chỉnh
          const m = LENS.m, ca = Math.sqrt(Math.max(0, 1 - _lnD.y * _lnD.y)), sn = Math.max(0.05, -_lnD.y), fh = (camera.top - camera.bottom) / camera.zoom, hd = fh / sn;   // góc cúi: cos / sin · fh: chiều cao khung (m) · hd: mặt đất trải hết chiều cao khung, đo ngang
          lnU.uNr.value = camera.near; lnU.uFr.value = camera.far; lnU.uCa.value = ca; lnU.uSn.value = sn; lnU.uFh.value = fh; lnU.uFm.value = m;
          lnU.uHt.value = _lnT.copy(target).sub(camera.position).dot(_lnD) * ca;   // điểm nhìn ở hàng giữa khung ⇒ khoảng cách ngang = độ sâu × cos góc cúi; bám vật: tiêu cự đúng ở đây
          const L = THREE.MathUtils.lerp, mx = L(LENS_TS_MAX, LENS_MAX, m), A = L(LENS_TS_A0, LENS_TS_A1, THREE.MathUtils.smoothstep(Math.log(camera.zoom / 3) / Math.LN10, 0, 1)), cg = Math.max(0.2, ca);   // sa bàn: dải nét hẹp dần ×3 → ×30
          //  bám vật: số 05/11 đo theo độ sâu ⇒ đổi sang khoảng cách ngang cho mặt đất mờ y như cũ (mặt đất: lệch độ sâu = lệch ngang × cos góc cúi)
          lnU.uRg.value = L(A * hd, LENS_RG / cg, m); lnU.uK.value = LENS.s * L(LENS_TS_MAX / ((0.5 - A) * hd), LENS_K * cg, m) * LENS.h; lnU.uMax.value = Math.max(1, LENS.s * mx * LENS.h); lnU.uCm.value = LENS_FAR * lnU.uMax.value;
          lnAf.uniforms.uAfK.value = LENS.af ? 1 : 1 - Math.exp(-dt / LENS_AF_T); LENS.af = 0; lnAf.uniforms.uAfR.value.set(LENS_AF_R * LENS.h / LENS.w, LENS_AF_R);   // ô lấy nét vuông
          lnOut.uniforms.uBias.value = 0.04 / (camera.far - camera.near);
          if (LENS_SOFT.o === null) { const So = LENS_SOFT.o = scene.children.find(o => o.userData.lensSoft) || 0;   // tìm 1 lần (0 = không có)
            if (So) { const L = So.userData.lensSoft; L.b.forEach((b, i) => { lnU.uSb.value[2 * i].fromArray(b); lnU.uSb.value[2 * i + 1].fromArray(b, 3); }); So.traverse(c => c.userData.lensK = L.k); } }
          const So = LENS_SOFT.o; lnU.uSk.value = So && So.visible ? So.userData.lensSoft.k : 1;   // điểm ảnh (u − ½, v − ½, khoảng cách) → cục bộ vật: nghịch đảo ma trận vật × ma trận camera × co giãn khung
          if (So) lnU.uSL.value.copy(So.matrixWorld).invert().multiply(camera.matrixWorld).multiply(_lnM.makeScale((camera.right - camera.left) / camera.zoom, fh, -1));
          const bg = scene.background, mask = camera.layers.mask;
          if (bg && bg.isColor) scene.background = _lnBg.copy(bg).convertLinearToSRGB();
          camera.layers.disable(LAYER_SHARP); renderer.setRenderTarget(LENS.rt); renderer.render(scene, camera);   // (1)
          scene.background = bg; camera.layers.mask = mask;
          lnU.tF.value = LENS.fa.texture; lnPass(lnAf, LENS.fb); [LENS.fa, LENS.fb] = [LENS.fb, LENS.fa]; lnU.tF.value = LENS.fa.texture;   // (1b) đọc khung trước, ghi khung này
          lnReadAf();   // tiêu cự về CPU cho chữ HTML (lensBlurPx)
          lnPass(lnPre, LENS.ha); lnPass(lnTile, LENS.ta); lnPass(lnNbr, LENS.tb); lnPass(lnGat, LENS.hb); lnPass(lnOut, null);   // (2) (2b) (3) (4)
          const sa = renderer.shadowMap.autoUpdate, ac = renderer.autoClear, mw = scene.matrixWorldAutoUpdate;   // (5) lớp nét: không xoá, không vẽ lại bóng / ma trận
          renderer.shadowMap.autoUpdate = false; renderer.autoClear = false; scene.matrixWorldAutoUpdate = false; scene.background = null; camera.layers.set(LAYER_SHARP);
          renderer.render(scene, camera);
          renderer.shadowMap.autoUpdate = sa; renderer.autoClear = ac; scene.matrixWorldAutoUpdate = mw; scene.background = bg; camera.layers.mask = mask;
        }
