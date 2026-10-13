        // ====== TRỜI ĐÊM THẬT: sao theo danh mục + Ngân Hà + chạng vạng + mây thật + sao băng ======
        //  Lớp nền vẽ TRƯỚC cả cảnh, không ghi độ sâu (đảo che lên trên). Mỗi điểm ảnh nền = một hướng trên trời nhìn từ đảo, chiếu nổi (stereographic:
        //  giữ đúng hình chòm sao) với tâm chiếu đặt ĐÚNG chân trời theo hướng camera ⇒ chân trời là đường thẳng; hạ chân trời xuống thấp hơn khi camera
        //  nhìn chúc xuống (thấy nhiều trời hơn). Xoay cảnh = quay người nhìn trời; không đổi theo zoom/kéo cảnh vì trời ở rất xa. Sao dời theo giờ sao địa phương (giờ thật Pleiku): mọc phía đông, lặn phía tây, quay quanh thiên cực bắc ~14°.
        //  Nghiên cứu: độ rọi sao ∝ 10^(−0,4m) → kích thước/độ sáng theo log độ rọi, sao rất sáng thêm quầng (Gaia Sky, OpenSpace); màu theo nhiệt độ
        //  màu của danh mục (B−V → K), mắt đêm kém thấy màu nên chỉ sao sáng mới rõ màu; tắt dần qua khí quyển ~0,22 cấp/khối khí (khối khí Kasten–Young);
        //  lấp lánh mạnh và chậm hơn khi gần chân trời, sao sáng sát chân trời chớp đổi màu; cấp sao giới hạn theo chạng vạng (mặt trời −6° thấy tới
        //  cấp ~3, −12° ~5, −18° ~6,2 — trời vùng quê Pleiku), trăng sáng làm mất tới ~2 cấp và che Ngân Hà; mây che theo độ phủ mây thật (Open-Meteo).
        //  Sao mờ hơn cấp 5,5 (ngoài danh mục đóng gói) sinh ngẫu nhiên cố định, dày dần về mặt phẳng Ngân Hà.
        //  Sao băng: thường (sporadic) + các trận mưa sao băng lớn theo lịch IMO — bay ra xa tâm phát xạ, chỉ khi tâm đã mọc; nhanh (Orionids 66 km/s)
        //  thì đầu trắng ngả lục và hay để lại vệt sáng lục mờ dần vài giây; chậm (Taurids, Geminids) thì vàng cam. Tần suất dày hơn thật để người xem kịp thấy.
        const nightSky = (() => {
          const LAYER = 2; camera.layers.enable(LAYER);   // lớp riêng: lượt vẽ phụ (bản đồ mặt chắn mưa…) không vẽ nền trời
          const L0 = Math.log(2400), L1 = Math.log(42000);
          const kelvinRGB = (K, out) => {   // xấp xỉ màu vật đen (Tanner Helland) → sRGB 0..1 → tuyến tính, chuẩn hoá kênh lớn nhất = 1
            const t = K / 100, r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332), g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755), b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305;
            const c = [r, g, b].map(v => Math.pow(Math.max(0, Math.min(255, v)) / 255, 2.2)), m = Math.max(...c); out.push(c[0] / m, c[1] / m, c[2] / m);
          };
          // ---- sao: danh mục (cấp ≤ 5,5) + sao mờ sinh ngẫu nhiên (5,5–6,6) ----
          const pos = [], mag = [], col = [], seed = [], rnd = mulberry32(90417);
          { const raw = atob(STAR_BSC5); let p = 0, q = 0;
            while (p < raw.length) {
              let dl = 0, sh = 0, c; do { c = raw.charCodeAt(p++); dl |= (c & 127) << sh; sh += 7; } while (c & 128);
              q += dl; const y = raw.charCodeAt(p) | raw.charCodeAt(p + 1) << 8 | raw.charCodeAt(p + 2) << 16 | raw.charCodeAt(p + 3) << 24; p += 4;
              const ra = q / 16384 * 2 * Math.PI, de = ((y & 8191) / 8191 * 180 - 90) * RD;
              pos.push(Math.cos(de) * Math.cos(ra), Math.cos(de) * Math.sin(ra), Math.sin(de)); mag.push((y >>> 13 & 255) * 0.05 - 1.5);
              kelvinRGB(Math.exp(L0 + (y >>> 21 & 31) / 31 * (L1 - L0)), col); seed.push(rnd());
            }
          }
          const GAL = new THREE.Matrix3().set(-0.0548755604, -0.8734370902, -0.4838350155, 0.4941094279, -0.4448296300, 0.7469822445, -0.8676661490, -0.1980763734, 0.4559837762);   // xích đạo J2000 → thiên hà
          { const v = new THREE.Vector3(), a = 0.44, A0 = Math.pow(10, a * 5.5), A1 = Math.pow(10, a * 6.6);   // số sao tăng ~×2,75 mỗi cấp
            for (let n = 0; n < 3600;) {
              const z = rnd() * 2 - 1, f = rnd() * 2 * Math.PI, s = Math.sqrt(1 - z * z); v.set(s * Math.cos(f), s * Math.sin(f), z);
              const gb = Math.abs(v.clone().applyMatrix3(GAL).z);   // |sin vĩ độ thiên hà|
              if (rnd() > 0.3 + 0.7 * Math.exp(-gb / 0.22)) continue;
              pos.push(v.x, v.y, v.z); mag.push(Math.log10(A0 + rnd() * (A1 - A0)) / a);
              const u = rnd(); kelvinRGB(u < 0.55 ? 4200 + rnd() * 1800 : u < 0.88 ? 6000 + rnd() * 3500 : 9500 + rnd() * 12000, col); seed.push(rnd()); n++;
            }
          }
          const SKY_GLSL = `
            uniform vec3 uR, uU, uF; uniform vec2 uK, uDrift; uniform float uTime, uCloud, uOff;
            float sh3(vec3 p) { p = fract(p * 0.3183099 + 0.1) * 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
            float sn3(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
              return mix(mix(mix(sh3(i), sh3(i + vec3(1, 0, 0)), f.x), mix(sh3(i + vec3(0, 1, 0)), sh3(i + vec3(1, 1, 0)), f.x), f.y),
                         mix(mix(sh3(i + vec3(0, 0, 1)), sh3(i + vec3(1, 0, 1)), f.x), mix(sh3(i + vec3(0, 1, 1)), sh3(i + 1.0), f.x), f.y), f.z); }
            float sfbm(vec3 p) { float s = 0.0, a = 0.5; for (int k = 0; k < 4; k++) { s += a * sn3(p); p = p * 2.03 + 7.1; a *= 0.5; } return s * 1.0667; }
            float skyCloud(vec3 d) {   // mây theo độ phủ thật: lớp phẳng trên đầu nhìn phối cảnh (dồn dày về chân trời), trôi theo gió
              if (uCloud < 0.02) return 0.0;
              float th = mix(0.72, 0.3, uCloud);
              return smoothstep(th - 0.08, th + 0.08, sfbm(vec3(d.xz / (max(d.y, 0.0) + 0.1) * 0.8 + uDrift, 0.5)));
            }`;
          const U = { uR: { value: new THREE.Vector3() }, uU: { value: new THREE.Vector3(0, 1, 0) }, uF: { value: new THREE.Vector3() }, uK: { value: new THREE.Vector2(1, 1) }, uOff: { value: -0.4 }, uDrift: { value: new THREE.Vector2() },
            uTime: { value: 0 }, uCloud: { value: 0 }, uEq: { value: new THREE.Matrix3() }, uGal: { value: new THREE.Matrix3() }, uLim: { value: 6 }, uPx: { value: 1 },
            uBg: { value: new THREE.Color() }, uZen: { value: new THREE.Color() }, uHor: { value: new THREE.Color() }, uGround: { value: new THREE.Color() }, uCloudCol: { value: new THREE.Color() },
            uGlow: { value: new THREE.Color() }, uTwi: { value: 0 }, uMW: { value: 0 }, uMix: { value: 0 }, uSun: { value: new THREE.Vector4() } };
          const mk = (o, ord) => { o.frustumCulled = false; o.renderOrder = ord; o.layers.set(LAYER); o.userData.noBatch = true; o.raycast = () => {}; scene.add(o); return o; };   // để hiện lúc dựng: compileAsync biên dịch sẵn shader, khung đầu update() đặt lại
          // ---- nền trời: dải màu đêm/chạng vạng + Ngân Hà + mây (tam giác phủ kín màn hình) ----
          const quadGeo = new THREE.BufferGeometry(); quadGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
          const back = mk(new THREE.Mesh(quadGeo, new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
            vertexShader: 'varying vec2 vNdc; void main() { vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }',
            fragmentShader: SKY_GLSL + `
              uniform vec3 uBg, uZen, uHor, uGround, uCloudCol, uGlow; uniform float uMix, uMW, uTwi; uniform vec4 uSun; uniform mat3 uGal;
              varying vec2 vNdc;
              void main() {
                vec2 p = (vNdc - vec2(0.0, uOff)) / uK; vec3 d = normalize(uR * (4.0 * p.x) + uU * (4.0 * p.y) + uF * (4.0 - dot(p, p)));   // chiếu nổi ngược: điểm ảnh → hướng
                float el = d.y, h = max(el, 0.0), hz = exp(-h / 0.13);
                vec3 c = mix(uHor, uZen, sqrt(h));
                float ca = dot(normalize(d.xz + 1e-5), uSun.xz);
                c += uGlow * pow(0.5 + 0.5 * ca, 3.0) * hz;                                       // ráng chiều phía mặt trời vừa lặn, sát chân trời
                c += uTwi * (1.0 - 0.6 * pow(h, 0.6)) * vec3(0.06, 0.11, 0.24);                    // trời xanh chạng vạng
                c += uTwi * pow(0.5 - 0.5 * ca, 3.0) * exp(-pow((el - 0.1) / 0.07, 2.0)) * vec3(0.16, 0.07, 0.1) * step(-4.0, uSun.w);   // đai Venus hồng phía đối diện
                if (uMW > 0.003 && el > -0.05) {   // NGÂN HÀ trong toạ độ thiên hà: phình sáng ở tâm (Nhân Mã), dải bụi tối Great Rift (Thiên Ưng → Thiên Nga)
                  vec3 g = uGal * d; float b = asin(clamp(g.z, -1.0, 1.0)), l = atan(g.y, g.x);
                  float bul = exp(-l * l / 0.2), sg = 0.11 + 0.12 * bul, band = exp(-b * b / (sg * sg));
                  if (band > 0.01) {
                    float cl = sfbm(g * 5.0), cl2 = sfbm(g * 13.0 + 3.0), dk = smoothstep(0.42, 0.62, sfbm(g * 9.0 + 7.0));   // đám mây sao + vệt bụi tối
                    float lon = 0.3 + 0.7 * pow(0.5 + 0.5 * cos(l), 1.5) + 0.45 * bul * exp(-b * b / 0.012);
                    float rb = b - 0.03 + 0.04 * (cl - 0.5), rift = exp(-rb * rb / 0.0012) * smoothstep(-0.55, -0.25, l) * smoothstep(1.55, 1.15, l);
                    c += uMW * band * lon * pow(0.25 + 0.95 * cl, 1.6) * (0.7 + 0.6 * cl2) * (1.0 - 0.8 * rift) * (1.0 - 0.45 * dk * band) * mix(vec3(0.5, 0.58, 0.78), vec3(0.95, 0.8, 0.58), bul) * 0.085 * smoothstep(-0.05, 0.15, el);
                  }
                }
                c = mix(c, uCloudCol * (0.8 + 0.5 * hz), skyCloud(d) * smoothstep(-0.03, 0.03, el) * 0.94);
                c = mix(c, uGround, smoothstep(0.004, -0.05, el));                                   // dưới chân trời: không sao, sương tối
                gl_FragColor = vec4(mix(uBg, c, uMix), 1.0);
                #include <colorspace_fragment>
              }` })), -1003);
          // ---- sao: điểm theo độ rọi, vị trí xích đạo J2000 → thế giới bằng uEq (giờ sao địa phương) ----
          const sg = new THREE.BufferGeometry();
          sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('aMag', new THREE.Float32BufferAttribute(mag, 1));
          sg.setAttribute('aCol', new THREE.Float32BufferAttribute(col, 3)); sg.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
          const stars = mk(new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: SKY_GLSL + `
              attribute float aMag, aSeed; attribute vec3 aCol; uniform mat3 uEq; uniform float uLim, uPx;
              varying vec3 vCol; varying float vHalo;
              void main() {
                gl_PointSize = 0.0; gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                vec3 d = uEq * position; float el = d.y;
                if (el < -0.01) return;
                float X = 1.0 / (max(el, 0.0) + 0.50572 * pow(max(96.07995 - acos(clamp(el, -1.0, 1.0)) * 57.29578, 1.0), -1.6364));   // khối khí Kasten–Young
                float lo = smoothstep(1.3, 7.0, X), fq = mix(7.0, 3.0, lo), ph = aSeed * 50.0;
                float m = aMag + 0.22 * (X - 1.0) + (0.06 + 0.45 * lo) * (0.6 * sin(uTime * fq + ph) + 0.4 * sin(uTime * fq * 1.71 + ph * 1.3));   // tắt dần + lấp lánh
                float b = exp2(-1.329 * (m - uLim)) * (1.0 - skyCloud(d));   // = 10^(−0,4(m − cấp giới hạn)) · phần không bị mây che
                if (b < 0.7) return;
                gl_Position = vec4(2.0 * vec2(dot(d, uR), dot(d, uU)) / max(1.0 + dot(d, uF), 0.02) * uK + vec2(0.0, uOff), 0.0, 1.0);
                float lb = log(b);
                gl_PointSize = uPx * (1.7 + 0.6 * lb + 2.6 * smoothstep(5.0, 9.0, lb));
                vHalo = smoothstep(4.0, 8.0, lb);
                vec3 c = mix(vec3(1.0), aCol, 0.3 + 0.5 * smoothstep(2.0, 6.0, lb));
                c *= 1.0 + lo * smoothstep(3.0, 6.0, lb) * 0.35 * vec3(sin(uTime * 11.0 + ph), sin(uTime * 13.0 + ph * 2.0), sin(uTime * 17.0 + ph * 3.0));
                vCol = c * clamp((b - 0.7) * 0.55, 0.0, 1.0) * (1.0 + 0.6 * smoothstep(3.0, 7.0, lb));
              }`,
            fragmentShader: `
              varying vec3 vCol; varying float vHalo;
              void main() {
                vec2 q = gl_PointCoord * 2.0 - 1.0; float r2 = dot(q, q); if (r2 > 1.0) discard;
                gl_FragColor = vec4(vCol * (exp(-r2 * 6.0 * mix(1.0, 5.0, vHalo)) + vHalo * 0.22 * exp(-r2 * 3.0) * (1.0 - r2)), 1.0);
                #include <colorspace_fragment>
              }` })), -1002);
          // ---- sao băng: tối đa 3 cùng lúc + vệt sáng lưu lại; mỗi cái 1 dải chữ nhật dựng trên màn hình mỗi khung ----
          const MQ = 6, mPos = new Float32Array(MQ * 12), mC = new Float32Array(MQ * 16), mT = new Float32Array(MQ * 12), mIdx = [];
          for (let k = 0; k < MQ; k++) mIdx.push(4 * k, 4 * k + 1, 4 * k + 2, 4 * k + 2, 4 * k + 1, 4 * k + 3);
          const mg = new THREE.BufferGeometry(); mg.setIndex(mIdx);
          mg.setAttribute('position', new THREE.BufferAttribute(mPos, 3)); mg.setAttribute('aC', new THREE.BufferAttribute(mC, 4)); mg.setAttribute('aT', new THREE.BufferAttribute(mT, 3));
          const meteorMesh = mk(new THREE.Mesh(mg, new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
            vertexShader: 'attribute vec4 aC; attribute vec3 aT; varying vec4 vC; varying vec3 vT; void main() { vC = aC; vT = aT; gl_Position = vec4(position.xy, 0.0, 1.0); }',
            fragmentShader: `
              varying vec4 vC; varying vec3 vT;
              void main() {
                float u = clamp(vT.x, 0.0, 1.0), w = vT.y * vT.y, k;
                if (vT.z > 0.5) k = (0.55 + 0.45 * sin(u * 37.0 + vT.z * 9.0)) * exp(-w * 3.0) * (1.0 - pow(2.0 * u - 1.0, 8.0));   // vệt lưu lại: dải lục đứt quãng
                else k = pow(u, 2.6) * exp(-w * 5.0) + 1.6 * exp(-pow((1.0 - u) / 0.05, 2.0) - w * 1.5);   // đuôi mảnh dần + đầu sáng
                gl_FragColor = vec4(vC.rgb * vC.a * k * smoothstep(1.04, 0.995, vT.x), 1.0);   // mũi đầu tròn dần, không cụt vuông
                #include <colorspace_fragment>
              }` })), -1001);
          // ---- trận mưa sao băng lớn (IMO): [tháng, ngày cực đại, nửa bề rộng (ngày), ZHR, xích kinh tâm (°), xích vĩ tâm (°), vận tốc km/s] ----
          const SHOWERS = [[1, 3.6, 0.6, 110, 230, 49, 41], [4, 22.5, 1.5, 18, 271, 34, 49], [5, 6, 4, 50, 338, -1, 66], [7, 30, 6, 25, 340, -16, 41], [8, 12.5, 3, 100, 48, 58, 59],
            [10, 8.5, 0.5, 10, 262, 54, 20], [10, 10, 15, 5, 32, 9, 27], [10, 21.5, 6, 20, 95, 16, 66], [11, 12, 15, 5, 58, 22, 29], [11, 17.5, 2, 15, 152, 22, 71], [12, 14, 2.5, 150, 112, 33, 35], [12, 22, 1, 10, 217, 76, 33]];
          const meteors = [], _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _e = new THREE.Vector3(), _f = new THREE.Vector3();
          const M = new THREE.Matrix3(), Mt = new THREE.Matrix3(), _cv = new THREE.Color();
          let mix = 0, lim = -2, drift = 0, nq = 0;
          const toNdc = (d, out) => { const z = Math.max(1 + d.dot(U.uF.value), 0.02); out.x = 2 * d.dot(U.uR.value) / z * U.uK.value.x; out.y = 2 * d.dot(U.uU.value) / z * U.uK.value.y + U.uOff.value; return out; };
          const fromNdc = (x, y, out) => { const px = x / U.uK.value.x, py = (y - U.uOff.value) / U.uK.value.y; return out.copy(U.uR.value).multiplyScalar(4 * px).addScaledVector(U.uU.value, 4 * py).addScaledVector(U.uF.value, 4 - px * px - py * py).normalize(); };
          const eqDir = (raDeg, deDeg, out) => out.set(Math.cos(deDeg * RD) * Math.cos(raDeg * RD), Math.cos(deDeg * RD) * Math.sin(raDeg * RD), Math.sin(deDeg * RD)).applyMatrix3(M);
          function spawnMeteor(sh) {   // sh: trận mưa (hoặc null = sao băng lẻ)
            const W = renderer.domElement.width, H = renderer.domElement.height;
            for (let tries = 0; tries < 8; tries++) {
              const d0 = fromNdc(rnd() * 1.8 - 0.9, U.uOff.value + 0.2 + rnd() * (0.75 - U.uOff.value), new THREE.Vector3());
              if (d0.y < 0.17) continue;   // cao trên ~10°
              let v, ang, tn = new THREE.Vector3();
              if (sh) {
                eqDir(sh[4], sh[5], _a); const cpsi = d0.dot(_a); if (cpsi > 0.97) continue;   // quá gần tâm: vệt ngắn, bỏ
                tn.copy(d0).multiplyScalar(cpsi).sub(_a).normalize(); v = sh[6]; ang = (6 + 20 * Math.sqrt(1 - cpsi * cpsi)) * (0.5 + 0.7 * rnd());
              } else {
                _a.set(0, 1, 0).cross(d0).normalize(); _b.crossVectors(d0, _a); const th = rnd() * 2 * Math.PI;
                tn.copy(_a).multiplyScalar(Math.cos(th)).addScaledVector(_b, Math.sin(th) - 0.35).normalize(); tn.addScaledVector(d0, -tn.dot(d0)).normalize();   // nghiêng nhẹ xuống
                v = 20 + rnd() * 50; ang = 5 + rnd() * 15;
              }
              const r = rnd(), m = r < 0.03 ? -4 - rnd() * 2 : 2.6 - Math.log(1 + rnd() * (Math.pow(2.6, 5) - 1)) / Math.log(2.6);   // phân bố độ sáng (chỉ số r ≈ 2,6) + quả cầu lửa hiếm
              if (m > lim - 0.3) continue;
              const d1 = d0.clone().multiplyScalar(Math.cos(ang * RD)).addScaledVector(tn, Math.sin(ang * RD));
              const fast = Math.min(1, Math.max(0, (v - 35) / 30));
              meteors.push({ d0, d1, t: 0, dur: Math.min(1.6, Math.max(0.15, ang / (v * 0.45 * (0.8 + 0.4 * rnd())))), m, fast, train: v > 50 && m < -0.5 && rnd() < 0.45 ? 1.5 + rnd() * 2.5 : 0, tr: 0, s: rnd() });
              return;
            }
          }
          function quad(T, Hd, wPx, cr, cg, cb, a, kind) {   // dải từ T (đuôi) tới Hd (đầu), toạ độ NDC, rộng wPx điểm ảnh
            if (nq >= MQ) return;
            const W = renderer.domElement.width / 2, H = renderer.domElement.height / 2;
            let dx = (Hd.x - T.x) * W, dy = (Hd.y - T.y) * H; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
            const nx = -dy * wPx / W, ny = dx * wPx / H, ex = dx * wPx * 1.5 / W, ey = dy * wPx * 1.5 / H, o = nq * 12, oc = nq * 16;
            const P = [T.x + nx, T.y + ny, T.x - nx, T.y - ny, Hd.x + nx + ex, Hd.y + ny + ey, Hd.x - nx + ex, Hd.y - ny + ey];
            for (let i = 0; i < 4; i++) { mPos[o + 3 * i] = P[2 * i]; mPos[o + 3 * i + 1] = P[2 * i + 1]; mPos[o + 3 * i + 2] = 0; mC[oc + 4 * i] = cr; mC[oc + 4 * i + 1] = cg; mC[oc + 4 * i + 2] = cb; mC[oc + 4 * i + 3] = a;
              mT[o + 3 * i] = i < 2 ? 0 : 1.04; mT[o + 3 * i + 1] = i % 2 ? -1 : 1; mT[o + 3 * i + 2] = kind; }
            nq++;
          }
          const TW = [[-1, 0], [-4, 1.8], [-6, 3], [-9, 4.3], [-12, 5.2], [-15, 5.8], [-18, 6.2]];
          function update(dt, t, on) {
            const n = sceneDay(liveWeather.localHour), sq = sunEq(n), hs = horiz(hourAngle(n, sq.ra), sq.dec, 0), se = hs.el / RD;
            mix = on ? smooth01(3, -3, se) : 0;
            back.visible = mix > 0.002; stars.visible = meteorMesh.visible = back.visible && se < 0;
            if (!back.visible) { meteors.length = 0; return; }
            // cấp sao giới hạn: chạng vạng → trăng → (mây xử lý từng sao)
            lim = se >= -1 ? -1.5 * (se + 1) : 6.2;
            for (let i = 1; i < TW.length; i++) if (se >= TW[i][0]) { const a = TW[i - 1], b = TW[i], k = (se - a[0]) / (b[0] - a[0]); lim = a[1] + (b[1] - a[1]) * k; break; }
            const mq = moonEq(n), hm = horiz(hourAngle(n, mq.ra), mq.dec, mq.par);
            const cpsi = Math.sin(sq.dec) * Math.sin(mq.dec) + Math.cos(sq.dec) * Math.cos(mq.dec) * Math.cos(sq.ra - mq.ra), moonB = (1 - cpsi) / 2 * Math.sqrt(Math.max(0, Math.sin(hm.el)));
            lim -= 2.1 * moonB; U.uLim.value = lim;
            const w = liveWeather.state, cur = w.fresh ? w.data?.current : null, cloud = w.raining ? 1 : cur && Number.isFinite(cur.cloud_cover) ? cur.cloud_cover / 100 : 0.3;
            U.uCloud.value = cloud;
            drift = (drift + dt * (0.02 + 0.004 * (sceneWind.speed || 8))) % 5000; U.uDrift.value.set(sceneWind.dir.x, sceneWind.dir.y).multiplyScalar(-drift);
            // camera ảo: tâm chiếu = điểm chân trời theo hướng nhìn ngang của camera; chân trời hạ thấp dần khi camera chúc xuống
            camera.getWorldDirection(_a); const camEl = Math.asin(Math.max(-1, Math.min(1, -_a.y))) / RD;
            _a.y = 0; if (_a.lengthSq() < 1e-6) _a.set(0, 0, -1); _a.normalize();
            U.uF.value.copy(_a); U.uR.value.crossVectors(_a, SKY_UP).normalize();
            U.uOff.value = -0.2 - 0.5 * Math.min(1, Math.max(0, camEl / 81));
            U.uK.value.set(1.05 * (camera.top - camera.bottom) / (camera.right - camera.left), 1.05);
            U.uPx.value = renderer.getPixelRatio(); U.uTime.value = t % 3600;
            // xích đạo J2000 → chân trời (đông, bắc, thiên đỉnh) theo giờ sao địa phương → thế giới
            const lst = (18.697374558 + 24.06570982441908 * n + SUN_LON / 15) * 15 * RD, cl = Math.cos(lst), sl = Math.sin(lst), cp = Math.cos(SUN_LAT), sp = Math.sin(SUN_LAT);
            M.set(-sl, cl, 0, -sp * cl, -sp * sl, cp, cp * cl, cp * sl, sp);   // hàng: đông · bắc · thiên đỉnh
            Mt.set(SKY_EAST.x, SKY_NORTH.x, SKY_UP.x, SKY_EAST.y, SKY_NORTH.y, SKY_UP.y, SKY_EAST.z, SKY_NORTH.z, SKY_UP.z); M.premultiply(Mt); U.uEq.value.copy(M);
            U.uGal.value.copy(GAL).multiply(Mt.copy(M).transpose());
            // màu trời: đêm tối dần lên đỉnh, trăng làm sáng xanh; ráng chiều + trời xanh chạng vạng theo độ cao mặt trời
            U.uZen.value.setRGB(0.0027 + 0.012 * moonB, 0.004 + 0.022 * moonB, 0.012 + 0.05 * moonB); U.uHor.value.setRGB(0.011 + 0.02 * moonB, 0.018 + 0.03 * moonB, 0.045 + 0.06 * moonB);
            U.uGround.value.copy(U.uHor.value).multiplyScalar(0.5);
            const gl = smooth01(-14, -2, se); U.uGlow.value.setRGB(0.35, 0.08, 0.1).lerp(_cv.setRGB(1, 0.45, 0.15), smooth01(-8, 0, se)).multiplyScalar(gl * 0.6);
            U.uTwi.value = smooth01(-16, 0, se) * 0.9;
            skyDir(hs, _b); _b.y = 0; _b.normalize(); U.uSun.value.set(_b.x, 0, _b.z, se);
            U.uCloudCol.value.setRGB(0.016 + 0.03 * moonB, 0.018 + 0.035 * moonB, 0.026 + 0.045 * moonB).add(_cv.copy(U.uGlow.value).multiplyScalar(0.6)).add(_cv.setRGB(0.05, 0.06, 0.09).multiplyScalar(U.uTwi.value));
            U.uMW.value = smooth01(5, 6.1, lim); U.uMix.value = mix; U.uBg.value.copy(scene.background);
            if (scene.fog) scene.fog.color.lerp(_cv.copy(U.uHor.value).multiplyScalar(1.6), mix * 0.85);   // sương xa hoà vào chân trời đêm
            // sao băng: tần suất (/giây) — lẻ + các trận đang hoạt động có tâm đã mọc; trời sáng/mây ít thấy hơn
            const D = new Date(Date.now() + SUN_TZ * 3600000), y0 = Date.UTC(D.getUTCFullYear(), 0, 1), doy = (Date.UTC(D.getUTCFullYear(), D.getUTCMonth(), D.getUTCDate()) - y0) / 864e5 + liveWeather.localHour / 24;
            let base = 1 / 45; const act = [];
            for (const s of SHOWERS) {
              let dd = doy - ((Date.UTC(D.getUTCFullYear(), s[0] - 1, 1) - y0) / 864e5 + s[1] - 1); dd -= 365.25 * Math.round(dd / 365.25);
              if (Math.abs(dd) > 3 * s[2]) continue;
              const rel = eqDir(s[4], s[5], _c).y; if (rel <= 0) continue;
              const r = Math.pow(s[3] / 20, 0.6) * Math.exp(-0.5 * dd * dd / (s[2] * s[2])) * rel / 30; base += r; act.push([s, r]);
            }
            if (meteors.length < 3 && rnd() < base * smooth01(2.5, 5, lim) * (1 - cloud) * dt) {   // chọn lẻ hay trận nào theo tỉ lệ tần suất
              let pick = null, u = rnd() * base - 1 / 45;
              if (u >= 0) for (const [s, r] of act) { if (u < r) { pick = s; break; } u -= r; }
              spawnMeteor(pick);
            }
            nq = 0;
            for (let i = meteors.length - 1; i >= 0; i--) {
              const e = meteors[i]; e.t += dt;
              const k = Math.min(1, e.t / e.dur), fl = Math.sin(Math.PI * Math.pow(k, 1.4)), b = Math.pow(10, -0.4 * (e.m - lim)) * (1 - cloud * 0.8);
              if (k < 1) {
                const ah = k, at = Math.max(0, k - 0.35 - 0.25 * e.fast);
                _d.copy(e.d0).lerp(e.d1, ah).normalize(); _e.copy(e.d0).lerp(e.d1, at).normalize();
                toNdc(_e, _a); toNdc(_d, _f);
                const I = Math.min(1.6, 0.08 * Math.sqrt(b)) * fl * (e.m < -3 ? 1 + 0.6 * Math.max(0, Math.sin(e.t * 40 + e.s * 9)) : 1);
                quad(_a, _f, U.uPx.value * (0.9 + 0.35 * Math.min(4, Math.max(0, lim - e.m) / 2)), 0.95 - 0.25 * e.fast, 0.9 + 0.08 * e.fast, 0.7 + 0.25 * e.fast, I, 0);
              } else if (e.train && e.tr < e.train) {
                e.tr += dt; toNdc(e.d0, _a); toNdc(_d.copy(e.d0).lerp(e.d1, 0.95).normalize(), _f);
                quad(_a, _f, U.uPx.value * (1.2 + 1.5 * e.tr), 0.35, 0.85, 0.5, 0.35 * Math.exp(-2.2 * e.tr / e.train) * Math.min(1, b * 0.01), 1 + e.s);
              } else meteors.splice(i, 1);
            }
            mg.setDrawRange(0, nq * 6); meteorMesh.visible = nq > 0 && stars.visible;
            if (nq) { mg.attributes.position.needsUpdate = mg.attributes.aC.needsUpdate = mg.attributes.aT.needsUpdate = true; }
          }
          return { update, U, meteors, spawn: spawnMeteor, get lim() { return lim; } };
        })();
