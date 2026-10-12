        // ---- mặt trời / mặt trăng theo GIỜ THẬT + quỹ đạo chấm ----
        const sky = new THREE.Group(); sky.rotation.set(0, -0.8, 0.2); scene.add(sky);  // quỹ đạo song song trục X thế giới
        const ORB = 150;
        const pathPts = [];
        {
          const tilt = -30 * Math.PI / 180;
          const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
          for (let k = 0; k <= 84; k++) {
            const a = k / 84 * 6.283;
            pathPts.push(new THREE.Vector3(Math.cos(a) * ORB, Math.sin(a) * ORB * cosT, Math.sin(a) * ORB * sinT));
          }
        }
        const pathLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPts), new THREE.LineDashedMaterial({ color: 0x000000, dashSize: 1.1, gapSize: 1.9, transparent: true, opacity: 0.7 })); pathLine.computeLineDistances(); sky.add(pathLine);  // nét đứt 1px
        function glowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const gr = x.createRadialGradient(64, 64, 3, 64, 64, 64); gr.addColorStop(0, 'rgba(255,226,135,0.95)'); gr.addColorStop(0.4, 'rgba(255,200,80,0.4)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }
        const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); sunGlow.scale.set(24, 24, 1); sky.add(sunGlow);
        const skySun = new THREE.Mesh(new THREE.SphereGeometry(5, 18, 18), new THREE.MeshBasicMaterial({ color: 0xffd34a, transparent: true, opacity: 0.5 })); sky.add(skySun);
        // ---- PHA TRĂNG THẬT theo ngày (live realistic moon phases): tính tuổi trăng từ trăng non chuẩn 06/01/2000 18:14 UTC,
        //      chu kỳ giao hội 29.53 ngày → vẽ đĩa trăng per-pixel (phần sáng/terminator/earthshine + biển trăng mờ) lên canvas ----
        const MOON_SYNODIC = 29.53058867, MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14, 0);
        function moonPhase(ms) { const age = ((ms - MOON_EPOCH) / 86400000) % MOON_SYNODIC; return (age < 0 ? age + MOON_SYNODIC : age) / MOON_SYNODIC; }   // 0=trăng non · 0.25=thượng huyền · 0.5=trăng tròn · 0.75=hạ huyền
        const moonCanvas = document.createElement('canvas'); moonCanvas.width = moonCanvas.height = 160;
        const moonTex = new THREE.CanvasTexture(moonCanvas); moonTex.colorSpace = THREE.SRGBColorSpace;
        const _maria = [[-0.32, -0.18, 0.34], [0.18, -0.3, 0.26], [0.05, 0.24, 0.3], [-0.08, 0.04, 0.17]];   // vùng biển trăng (maria) cố định
        function drawMoonPhase(p) {
          const ctx = moonCanvas.getContext('2d'), Sz = 160, R = 74, cx = Sz / 2, cy = Sz / 2;
          ctx.clearRect(0, 0, Sz, Sz);
          const img = ctx.createImageData(Sz, Sz), d = img.data;
          const a = p * 6.283185307, sx = Math.sin(a), szn = -Math.cos(a);   // hướng mặt trời trong hệ toạ độ trăng
          for (let y = 0; y < Sz; y++) for (let x = 0; x < Sz; x++) {
            const dx = (x - cx) / R, dy = (y - cy) / R, rr = dx * dx + dy * dy;
            if (rr > 1) continue;
            const z = Math.sqrt(1 - rr);
            const lit = dx * sx + z * szn > 0;
            let v = lit ? 1 : 0.16;                                          // phần khuất vẫn mờ nhẹ (earthshine)
            if (lit) for (const m of _maria) { const mx = dx - m[0], my = dy - m[1]; if (mx * mx + my * my < m[2] * m[2]) { v = 0.8; break; } }
            const edge = Math.min(1, (1 - Math.sqrt(rr)) * R * 0.9);         // viền mềm ~1px
            const i = (y * Sz + x) * 4;
            d[i] = Math.min(255, 233 * v + 18); d[i + 1] = Math.min(255, 238 * v + 18); d[i + 2] = Math.min(255, 246 * v + 20);
            d[i + 3] = Math.round(255 * edge * (lit ? 0.92 : 0.5));
          }
          ctx.putImageData(img, 0, 0); moonTex.needsUpdate = true;
        }
        let _moonBucket = -1;
        const skyMoon = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonTex, color: 0xE2D6C0, transparent: true, opacity: 0.92, depthWrite: false })); skyMoon.scale.set(9.5, 9.5, 1); sky.add(skyMoon);
        const _wp = new THREE.Vector3(), _mp = new THREE.Vector3(), _sunV = new THREE.Vector3(), _liC = new THREE.Color(), _bgC = new THREE.Color();   // scratch: updateSky chạy mỗi frame, không clone() mới
        const dayBg = new THREE.Color(0xE2D6C0), nightBg = new THREE.Color(0x44547d).multiplyScalar(0.8), duskBg = new THREE.Color(0xc89c74).multiplyScalar(0.8);
        const dayLi = new THREE.Color(0xfff4e0), duskLi = new THREE.Color(0xffb066), nightLi = new THREE.Color(0x8fa6cf);
        const liveWeather = window.gardenWeather; let nightFactor = 0, skyDusk = 0, sunElevSin = 0.5;   // skyDusk: 1 khi mặt trời sát chân trời (mây nhuộm cam)
        const starsGroup = new THREE.Group(); scene.add(starsGroup);
        let starMaterial = null;
        // ---- vị trí mặt trời thật (thuật toán thiên văn rút gọn của Almanac/NOAA, sai số ~0,01°) tại Pleiku 13,98°B · 108,0°Đ, UTC+7 ----
        //      Hướng trong cảnh giữ như quỹ đạo cũ: mọc phía −x của nhóm bầu trời, lặn phía +x, trưa nghiêng về phía nam (−z) ⇒ đông/bắc/đỉnh trời thế giới.
        const SUN_LAT = 13.98333 * Math.PI / 180, SUN_LON = 108.0, SUN_TZ = 7;
        sky.updateMatrixWorld();
        const SKY_UP = new THREE.Vector3(0, 1, 0), SKY_EAST = new THREE.Vector3(-1, 0, 0).applyQuaternion(sky.quaternion).setY(0).normalize(), SKY_NORTH = new THREE.Vector3().crossVectors(SKY_UP, SKY_EAST);
        function solarPosition(hh) {   // → { el, az } (rad; az tính từ hướng bắc theo chiều kim đồng hồ) cho ngày hôm nay ở Pleiku lúc hh giờ địa phương
          const d = new Date(Date.now() + SUN_TZ * 3600000), t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + (hh - SUN_TZ) * 3600000;
          const n = t / 86400000 + 2440587.5 - 2451545, rd = Math.PI / 180;
          const L = 280.46 + 0.9856474 * n, g = (357.528 + 0.9856003 * n) * rd, lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rd, eps = (23.439 - 4e-7 * n) * rd;
          const ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)), dec = Math.asin(Math.sin(eps) * Math.sin(lam));
          const gmst = 18.697374558 + 24.06570982441908 * n, H = ((gmst + SUN_LON / 15) * 15) * rd - ra;
          const el = Math.asin(Math.sin(SUN_LAT) * Math.sin(dec) + Math.cos(SUN_LAT) * Math.cos(dec) * Math.cos(H));
          const az = Math.atan2(-Math.sin(H), Math.tan(dec) * Math.cos(SUN_LAT) - Math.sin(SUN_LAT) * Math.cos(H));
          return { el, az, dec };
        }
        function updateSky() {
          const now = Date.now(); const hh = liveWeather.localHour;
          const mp = moonPhase(now), mb = Math.round(mp * 240);   // vẽ lại pha trăng khi tuổi trăng đổi ~3h (240 bậc/chu kỳ)
          if (mb !== _moonBucket) { _moonBucket = mb; drawMoonPhase(mp); }
          // vị trí mặt trời THẬT ở Pleiku theo ngày + giờ cảnh (mọc/lặn, độ cao giữa trưa, hướng đổi theo mùa); mặt trăng đối diện như cũ
          const sp = solarPosition(hh);
          const ce = Math.cos(sp.el);
          _wp.copy(SKY_EAST).multiplyScalar(ce * Math.sin(sp.az)).addScaledVector(SKY_NORTH, ce * Math.cos(sp.az)).addScaledVector(SKY_UP, Math.sin(sp.el)).multiplyScalar(ORB);
          sky.updateMatrixWorld(); skySun.position.copy(sky.worldToLocal(_mp.copy(_wp)));
          skyMoon.position.copy(skySun.position).negate();
          skySun.getWorldPosition(_wp); skyMoon.getWorldPosition(_mp);
          const elev = _wp.y / ORB, dayF = Math.min(1, Math.max(0, (elev + 0.04) / 0.34)), dusk = Math.max(0, 1 - Math.abs(elev) / 0.2); nightFactor = 1 - dayF; skyDusk = dusk; sunElevSin = elev;
          sun.position.copy(_sunV.copy(elev >= -0.02 ? _wp : _mp).normalize().multiplyScalar(150));
          sun.intensity = 0.36 + dayF * 0.74;
          sun.color.copy(_liC.copy(dayLi).lerp(nightLi, 1 - dayF).lerp(duskLi, dusk * 0.75));
          hemi.intensity = 0.46 + dayF * 0.46; amb.intensity = 0.26 + dayF * 0.12;
          const bg = _bgC.copy(dayBg).lerp(nightBg, 1 - dayF).lerp(duskBg, dusk * 0.55); scene.background.copy(bg); if (scene.fog) scene.fog.color.copy(bg);
          skySun.visible = elev > -0.16; skyMoon.visible = elev < 0.16; sunGlow.position.copy(skySun.position); sunGlow.visible = skySun.visible;
          if (starMaterial) { const so = Math.max(0, (nightFactor - 0.2) / 0.8) * 0.95; starMaterial.uniforms.uOpacity.value = so; starsGroup.visible = so > 0; }   // ban ngày ẩn hẳn 6000 sao thay vì vẽ với opacity 0
        }
        updateSky();
        function buildStarrySky() {
          const starsCount = 6000, radius = 650;
          const positions = [], sizes = [], phases = [];
          for (let i = 0; i < starsCount; i++) {
            const u = Math.random(), v = Math.random(), theta = u * 2 * Math.PI, phi = Math.acos(2 * v - 1);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = Math.abs(radius * Math.cos(phi));
            const z = radius * Math.sin(phi) * Math.sin(theta);
            positions.push(x, y, z);
            sizes.push(1.2 + Math.random() * 4.3); // max size 5.5
            phases.push(Math.random());
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          geo.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
          geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
          function starTexture() {
            const c = document.createElement('canvas'); c.width = c.height = 16;
            const x = c.getContext('2d');
            x.fillStyle = '#E2D6C0'; x.beginPath(); x.arc(8, 8, 5, 0, Math.PI * 2); x.fill();
            return new THREE.CanvasTexture(c);
          }
          const mat = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uMap: { value: starTexture() },
              uOpacity: { value: 0 }
            },
            vertexShader: `
              uniform float uTime;
              attribute float aSize;
              attribute float aPhase;
              varying float vTwinkle;
              void main() {
                // Twinkling speed slowed down 3x (3.5 -> 1.17)
                float twinkle = 0.5 + 0.5 * sin(uTime * 1.17 + aPhase * 12.0);
                vTwinkle = twinkle;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = aSize * (0.35 + 0.65 * twinkle);
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
            fragmentShader: `
              uniform sampler2D uMap;
              uniform float uOpacity;
              varying float vTwinkle;
              void main() {
                vec4 texColor = texture2D(uMap, gl_PointCoord);
                gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity * (0.45 + 0.55 * vTwinkle));
              }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false
          });
          const points = new THREE.Points(geo, mat); starsGroup.add(points); return mat;
        }
        starMaterial = buildStarrySky();

        /* ============ TUNABLE ============ */
        const S = 4;                       // mật độ: 1 khối gốc = S^3 khối nhỏ (S=4 → 64)
        const BLOCK = 2.4 / S;               // cạnh 1 khối (0.6)
        const GX = (62 + 30) * S, GZ = (52 + 30) * S; // mở rộng mỗi chiều 30 cubes length (92x82 khối gốc)
        const DAM_J = 24 * S;
        const RES = 2.7, DOWN = 1.35, VALLEY = 3.2;   // mực nước hồ / hạ lưu & bề rộng thung lũng (đơn vị khối gốc)
        const riverC = (j) => (32 + Math.sin((j / S) * 0.26) * 5 + Math.sin((j / S) * 0.08 + 1.2) * 1.1) * S;
        const RHALF = 2.25 * S;
        /* ================================= */

        const cx = GX / 2, cz = GZ / 2;
        const wx = i => (i - cx + 0.5) * BLOCK, wz = j => (j - cz + 0.5) * BLOCK, wy = k => k * BLOCK + BLOCK / 2;
        const riverDist = (i, j) => { const dx = i - riverC(j); return dx > 0 ? dx / 1.65 : Math.abs(dx); };
        const riverHalf = (j) => {
          const oj = j / S, below = Math.max(0, 1 - Math.abs(oj - 28) / 7);
          let lake = 0; if (oj < 24) { const a = Math.min(1, (24 - oj) / 4), b = Math.min(1, (oj - 6) / 4); lake = Math.max(0, Math.min(a, b)); lake = lake * lake * (3 - 2 * lake); }  // hồ chứa thượng lưu phình rộng
          return RHALF + below * 1.55 * S + lake * 2.6 * S;
        };
        const poolMetric = (i, j) => { const oi = i / S, oj = j / S, ci = 33.2 + Math.sin((oj - 25) * 0.55) * 0.9, cj = 29.4; return Math.hypot((oi - ci) / 5.4, (oj - cj) / 5.7); };
        const plungePool = (i, j) => j > DAM_J + 1.4 * S && j < 35 * S && poolMetric(i, j) < 1;
        const isRiver = (i, j) => riverDist(i, j) <= riverHalf(j);
        const isWater = (i, j) => isRiver(i, j) || plungePool(i, j);
        const resTopY = RES * S * BLOCK, downY = DOWN * S * BLOCK, lakeY = Math.round(DOWN * S) * BLOCK;   // lakeY = mặt nước hồ hạ lưu (làm tròn theo lưới khối)

        function tex(base, spots) {
          const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
          x.fillStyle = base; x.fillRect(0, 0, 16, 16); for (let n = 0; n < 22; n++) { x.fillStyle = spots[n % spots.length]; x.fillRect((Math.random() * 16) | 0, (Math.random() * 16) | 0, 1, 1); }
          const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
        }
        const TM = (t, o = {}) => new THREE.MeshLambertMaterial(Object.assign({ map: t }, o));
        const grassMat = TM(tex('#dedbce', ['#cfccbc', '#e8e5d6', '#c6c3b2', '#d6d3c2']));   // nền trung tính sáng → MÀU BẬC (instanceColor) hiện đúng
        const shoreMat = TM(tex('#dedbce', ['#cfccbc', '#e8e5d6', '#c6c3b2', '#d6d3c2']));
        const dirtMat = TM(tex('#7d5a38', ['#8a6642', '#6b4c2e', '#92704a']));
        const sandMat = TM(tex('#857149', ['#968057', '#73613e', '#a08a5c', '#6a5a3a']));   // đáy sông (riverbed)
        // vân sáng nắng hội tụ (caustics) trên đáy sông/hồ: chỉ mặt trên của khối đáy, trôi chậm, mạnh theo nắng, tắt dần khi mưa/đêm
        const causticU = { uCTime: { value: 0 }, uCaust: { value: new THREE.Color(0, 0, 0) } };
        sandMat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, causticU);
          shader.vertexShader = 'varying vec3 vCaustP;\n' + shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
            vec4 cWp = vec4(transformed, 1.0);
            #ifdef USE_INSTANCING
              cWp = instanceMatrix * cWp;
            #endif
            vCaustP = (modelMatrix * cWp).xyz;`);
          shader.fragmentShader = `uniform float uCTime; uniform vec3 uCaust; varying vec3 vCaustP;
            float causticPat(vec2 uv, float t) {   // vân caustic lặp tuần hoàn (kiểu "water turbulence")
              vec2 p = mod(uv * 6.28318, 6.28318) - 250.0, i = p; float c = 1.0;
              for (int n = 0; n < 4; n++) {
                float tt = t * (1.0 - 3.5 / float(n + 1));
                i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
                c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / 0.005), p.y / (cos(i.y + tt) / 0.005)));
              }
              c = 1.17 - pow(c / 4.0, 1.4);
              return clamp(pow(abs(c), 8.0), 0.0, 1.5);
            }
          ` + shader.fragmentShader.replace('#include <opaque_fragment>', `
            float cUp = clamp(dot(normal, normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz)), 0.0, 1.0);
            outgoingLight += uCaust * causticPat(vCaustP.xz * 0.11 + vec2(0.0, uCTime * 0.01), uCTime * 0.4) * cUp * cUp;
            #include <opaque_fragment>`);
        };
        const dcx = wx(riverC(DAM_J)), dz = (wz(DAM_J) + wz(DAM_J + 2 * S - 1)) / 2;
        const dsZ = (2 * S * BLOCK) / 2;
        // ---- MẶT NƯỚC: độ cao mặt + vận tốc + bọt lấy từ MÔ PHỎNG NƯỚC NÔNG (nature/fluids.js, texture uSim; lá, cá, phao đọc cùng số liệu trên CPU):
        //  · sóng lớn (dội bờ, vệt sau đá, tia cửa xả, sóng do cá/cò/phao/giọt mưa) = dời đỉnh theo uSim, pháp tuyến theo độ dốc uSim từng điểm ảnh;
        //  · gợn lăn tăn nhỏ hơn ô lưới = nhiễu có đạo hàm, TRÔI THEO DÒNG mô phỏng (flow map 2 pha), mạnh lên theo gió;
        //  · màu theo ĐỘ SÂU: ven bờ trong, thấy đáy cát · lòng sâu xanh đậm, đục hơn; phản chiếu màu trời theo Fresnel; lấp lánh nắng/trăng (Phong);
        //  · BỌT trắng ven bờ (theo khoảng cách tới bờ) + bọt của mô phỏng (chỗ nước xiết, cửa xả, chỗ bị khuấy) trôi theo dòng; MƯA: vòng gợn giọt mưa.
        const waterMat = new THREE.MeshPhongMaterial({ color: 0x3f86c4, specular: 0xd8ecff, shininess: 70, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const waterU = { uRain: { value: 0 }, uWindK: { value: 0.5 }, uSky: { value: new THREE.Color(0xa8d4f2) }, uFoamCol: { value: new THREE.Color(0.85, 0.88, 0.9) },
          uShallow: { value: new THREE.Color(0x5cb0d4) }, uDeep: { value: new THREE.Color(0x2b6aa8) },
          uSim: { value: null }, uSimBox: { value: new THREE.Vector4(0, 0, 1, 1) }, uSimTexel: { value: new THREE.Vector2(1, 1) }, uSimDx: { value: BLOCK }, uSimOn: { value: 0 } };
        const WATER_SKY = { day: new THREE.Color(0xa8d4f2), dusk: new THREE.Color(0xe8b48c), night: new THREE.Color(0x1a2640), rain: new THREE.Color(0x8b99a8) }, _wsC = new THREE.Color();
        const WATER_COL = { shallow: waterU.uShallow.value.clone(), deep: waterU.uDeep.value.clone(), spec: waterMat.specular.clone() };
        let waterSurfMesh = null;   // lưới mặt nước gộp (dựng ở phần địa hình), thuộc tính aWater: dòng chảy xz · độ sâu · gần bờ
        waterMat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = { value: 0 };
          Object.assign(shader.uniforms, waterU);
          shader.vertexShader = `
            uniform float uTime, uSimOn; uniform sampler2D uSim; uniform vec4 uSimBox;
            attribute vec4 aWater;
            varying vec4 vWater; varying vec3 vWPos; varying vec2 vSimUv;
          ` + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>
            vSimUv = vec2((position.x - uSimBox.x) * uSimBox.z, (position.z - uSimBox.y) * uSimBox.w);
            vec4 wSim = texture2D(uSim, vSimUv) * uSimOn;   // r: độ cao mặt so với mực tĩnh · gb: vận tốc · a: bọt
            transformed.y += wSim.r;
            vWater = vec4(mix(aWater.xy, wSim.gb, uSimOn), aWater.zw); vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
            `
          );
          shader.fragmentShader = `
            uniform float uTime, uRain, uWindK, uSimOn, uSimDx;
            uniform vec3 uSky, uFoamCol, uShallow, uDeep;
            uniform sampler2D uSim; uniform vec2 uSimTexel;
            varying vec4 vWater; varying vec3 vWPos; varying vec2 vSimUv;
            float wHash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
            vec3 wNoised(vec2 p) {   // nhiễu giá trị + đạo hàm giải tích
              vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f), du = 6.0 * f * (1.0 - f);
              float a = wHash(i), b = wHash(i + vec2(1.0, 0.0)), c = wHash(i + vec2(0.0, 1.0)), d = wHash(i + vec2(1.0, 1.0)), k = a - b - c + d;
              return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * vec2(b - a + k * u.y, c - a + k * u.x));
            }
            vec2 wSlope(vec2 p, vec2 flow, float t) {   // độ dốc mặt gợn (∂h/∂x, ∂h/∂z): 2 pha cuốn theo dòng, đổi pha trước khi giãn méo
              vec2 g = vec2(0.0);
              for (int k = 0; k < 2; k++) {
                float ph = fract(t * 0.16 + float(k) * 0.5), w = 1.0 - abs(2.0 * ph - 1.0);
                vec2 q = p - flow * (ph * 6.0) + float(k) * 13.7;
                g += w * (wNoised(q * 1.25 + vec2(t * 0.05, -t * 0.04)).yz * 0.66 + wNoised(q * 3.2 + vec2(-t * 0.13, t * 0.09)).yz * 0.55);
              }
              return g;
            }
            vec2 wRain(vec2 p, float t, float rain) {   // vòng gợn giọt mưa: mỗi ô lưới 1 giọt lệch pha; tỉ lệ ô có giọt = cường độ mưa
              vec2 g = vec2(0.0);
              for (int l = 0; l < 3; l++) {
                float sc = 2.1 + float(l) * 0.9;
                vec2 q = p * sc + float(l) * 5.17, id = floor(q), f = fract(q);
                float h = wHash(id * 1.37 + float(l) * 11.0);
                if (h > rain) continue;
                vec2 c = 0.25 + 0.5 * vec2(wHash(id + 3.1), wHash(id + 7.7));
                float tt = fract(t * (0.9 + 0.5 * h) + h * 9.0), d = length(f - c), x = (d - tt * 0.42) * 30.0;
                float env = exp(-x * x * 0.3) * (1.0 - tt) * (1.0 - tt);
                g += (f - c) / max(d, 1e-3) * (-sin(x) * env) * sc * 0.35;
              }
              return g;
            }
          ` + shader.fragmentShader
            .replace('#include <color_fragment>', `#include <color_fragment>
            vec2 wFlow = vWater.xy; float wDepth = vWater.z, wShore = vWater.w, wFlowS = length(wFlow);
            vec2 wSl = wSlope(vWPos.xz, wFlow, uTime) * (0.05 + 0.12 * uWindK + 0.35 * min(wFlowS, 0.6)) + wRain(vWPos.xz, uTime, uRain) * uRain;
            vec2 wTx = vec2(uSimTexel.x, 0.0), wTz = vec2(0.0, uSimTexel.y);   // độ dốc sóng mô phỏng tại từng điểm ảnh (sai phân trung tâm)
            wSl += uSimOn * vec2(texture2D(uSim, vSimUv + wTx).r - texture2D(uSim, vSimUv - wTx).r, texture2D(uSim, vSimUv + wTz).r - texture2D(uSim, vSimUv - wTz).r) / (2.0 * uSimDx) * 4.0;   // sóng vài cm → nhấn độ dốc khi tô sáng cho thấy rõ ở góc nhìn mô hình
            float wN = wNoised(vWPos.xz * 1.9 - wFlow * uTime * 1.7).x * 0.6 + wNoised(vWPos.xz * 4.7 - wFlow * uTime * 2.3).x * 0.4;
            float wFoam = smoothstep(0.62, 0.98, wShore + (wN - 0.5) * 0.6) * 0.62;   // bọt ven bờ
            float wSimFoam = texture2D(uSim, vSimUv).a * uSimOn;
            wFoam = max(wFoam, smoothstep(0.12, 0.95, wSimFoam * (0.45 + 1.1 * wN)) * 0.85);   // bọt mô phỏng: nước xiết, cửa xả, chỗ bị khuấy — vỡ vụn theo nhiễu
            float wDk = smoothstep(0.15, 2.4, wDepth);
            diffuseColor.rgb = mix(uShallow, uDeep, wDk);
            diffuseColor.a = mix(0.50, 0.80, wDk);`)
            .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
            normal = normalize((viewMatrix * vec4(normalize(vec3(-wSl.x, 1.0, -wSl.y)), 0.0)).xyz);`)
            .replace('#include <opaque_fragment>', `
            vec3 wV = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vViewPosition);
            float wFres = 0.04 + 0.96 * pow(1.0 - clamp(dot(normal, wV), 0.0, 1.0), 5.0);
            outgoingLight = mix(outgoingLight, uSky, clamp(0.04 + wFres * 1.4, 0.0, 0.32));   // phản chiếu trời
            outgoingLight = mix(outgoingLight, uFoamCol, wFoam);
            diffuseColor.a = clamp(max(diffuseColor.a + wFres * 0.4, wFoam), 0.0, 1.0);
            #include <opaque_fragment>`);
          waterMat.userData.shader = shader;
        };
        function updateWaterLook(rain) {   // màu trời phản chiếu + bọt theo ánh sáng cảnh; gió → gợn mạnh; mưa → vòng gợn
          waterU.uSky.value.copy(WATER_SKY.day).lerp(WATER_SKY.night, nightFactor).lerp(WATER_SKY.dusk, skyDusk * 0.7).lerp(_wsC.copy(WATER_SKY.rain).multiplyScalar(1 - 0.8 * nightFactor), 0.7 * rain);
          const lit = Math.min(1.05, hemi.intensity * 0.55 + amb.intensity * 0.6 + sun.intensity * 0.45);
          waterU.uFoamCol.value.setRGB(0.80, 0.84, 0.86).multiplyScalar(lit);
          waterU.uWindK.value = Math.min(1.6, 0.25 + (liveWeather.state.windSpeed ?? 8) / 22); waterU.uRain.value = rain;
          causticU.uCaust.value.copy(sun.color).multiplyScalar(sun.intensity * 0.42 * (1 - nightFactor) * (1 - 0.8 * rain));
          const nk = 1 - 0.62 * nightFactor;   // đêm: nước sẫm hơn bờ (phản chiếu trời tối), lấp lánh trăng/đèn nhẹ hơn; mưa làm mờ ánh phản chiếu
          waterU.uShallow.value.copy(WATER_COL.shallow).multiplyScalar(nk); waterU.uDeep.value.copy(WATER_COL.deep).multiplyScalar(nk);
          waterMat.specular.copy(WATER_COL.spec).multiplyScalar((1 - 0.72 * nightFactor) * (1 - 0.4 * rain));
        }

        const boxGeo = new THREE.BoxGeometry(BLOCK, BLOCK, BLOCK);
        const terrainMeshes = [];   // các lưới mặt địa hình dùng cho raycast tọa độ khi hover
        // BẢNG MÀU BẬC ĐỊA HÌNH (hypsometric) — port từ 3D garden: trũng tối → cao sáng (dải xanh cỏ)
        const TERR_LAYERS = [0x244d18, 0x2c5a1d, 0x356822, 0x3f7628, 0x4a842e, 0x569234, 0x64a03c, 0x74ad46, 0x86ba52, 0x99c661, 0xadd072, 0xc2da86].map(h => new THREE.Color(h));
        // ô đất PHẲNG (4 ô bên cạnh đều cao bằng/hơn): 4 mặt bên luôn bị che → chỉ giữ mặt trên (lượt vẽ màu) + mặt đáy (lượt đổ bóng vẽ mặt sau,
        // nên bóng đổ y như khối hộp cũ) → 4 tam giác thay vì 12. Ô sát mép dốc/nước vẫn là hộp đủ 6 mặt.
        const flatTopGeo = (() => {
          const g = boxGeo.clone(), idx = g.index.array, keep = [];
          for (const gr of g.groups) if (gr.materialIndex === 2 || gr.materialIndex === 3) for (let i = gr.start; i < gr.start + gr.count; i++) keep.push(idx[i]);
          g.setIndex(keep); g.clearGroups(); return g;
        })();
        // instanced unit cubes (with optional per-instance tint) — mục có p[3] = true (ô phẳng) dùng hình chỉ mặt trên + đáy
        function instanced(positions, mat, tint, collect) {
          if (!positions.length) return;
          if (tint) for (const p of positions) p[4] = 0.94 + Math.random() * 0.10;   // sắc độ ngẫu nhiên lấy theo thứ tự ô như cũ, rồi mới tách 2 lưới
          const flat = positions.filter(p => p[3]), full = positions.filter(p => !p[3]);
          if (flat.length && full.length) { instancedOne(flat, mat, tint, collect, flatTopGeo); instancedOne(full, mat, tint, collect, boxGeo); return; }
          instancedOne(positions, mat, tint, collect, flat.length ? flatTopGeo : boxGeo);
        }
        function instancedOne(positions, mat, tint, collect, geo) {
          const im = new THREE.InstancedMesh(geo, mat, positions.length); const mm = new THREE.Matrix4();
          const col = new THREE.Color();
          for (let k = 0; k < positions.length; k++) {
            const p = positions[k];
            mm.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(k, mm);
            if (tint) {
              const e = Math.min(0.999, Math.max(0, (p[1] - 1.2) / 6.5));   // độ cao → vị trí trong bảng màu bậc
              const _f = e * (TERR_LAYERS.length - 1), _bi = _f | 0, _bt = _f - _bi;
              col.copy(TERR_LAYERS[_bi]).lerp(TERR_LAYERS[Math.min(_bi + 1, TERR_LAYERS.length - 1)], _bt);   // nội suy mượt giữa 2 bậc
              col.multiplyScalar(p[4]);
              im.setColorAt(k, col);
            }
          }
          im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; scene.add(im);
          if (collect) terrainMeshes.push(im);
        }
        // instanced boxes with per-instance Y-scale (merged column bodies → huge perf win)
        function instancedScaled(items, mat, collect) {
          if (!items.length) return;
          const im = new THREE.InstancedMesh(boxGeo, mat, items.length); const mm = new THREE.Matrix4();
          for (let k = 0; k < items.length; k++) { const p = items[k]; mm.makeScale(1, p.sy, 1); mm.setPosition(p.x, p.y, p.z); im.setMatrixAt(k, mm); }
          im.castShadow = true; im.receiveShadow = true; im.instanceMatrix.needsUpdate = true; scene.add(im);
          if (collect) terrainMeshes.push(im);
        }

        function landH(i, j) { const fi = i / S, fj = j / S; const dhi = fi - 85.4, dhj = fj + 4.2, hill = 10 * Math.exp(-(dhi * dhi / (2 * 18 * 18) + dhj * dhj / (2 * 15 * 15))); const dhi2 = fi - 42.5, dhj2 = fj - 52.5, hill2 = 2.2 * Math.exp(-(dhi2 * dhi2 / 32 + dhj2 * dhj2 / 32)); return 2.9 + Math.sin(fi * 0.4) * Math.cos(fj * 0.33) * 0.6 + Math.sin((fi + fj) * 0.21) * 0.4 + Math.sin(fi * 1.17 + fj * 0.61) * 0.12 - (fj / 45) * 0.7 + hill + hill2; }   // hill: đỉnh tại corner (217,2), độ cao 10 · bán kính dốc 18/15; hill2: đồi nhỏ tại x102 z126 (ngoài solar farm), độ cao 2.2
        function terr(i, j) {
          const d = riverDist(i, j); const surf = (j < DAM_J ? RES : DOWN);
          const half = riverHalf(j);
          if (d <= half) return Math.max(1, Math.round(surf * S));
          const base = Math.max(1.5, landH(i, j)); const VW = VALLEY * S;
          if (d < half + VW) { const t = (d - half) / VW, sm = t * t * (3 - 2 * t); return Math.max(1, Math.round((surf + (base - surf) * sm) * S)); }
          const pm = poolMetric(i, j);
          if (pm < 1.42) { const t = Math.max(0, (pm - 1) / 0.42), sm = t * t * (3 - 2 * t); return Math.max(1, Math.round((DOWN + (base - DOWN) * sm) * S)); }
          return Math.max(1, Math.round(base * S));
        }
        const pads = [{ i0: 28, i1: 113, j0: 24, j1: 50, h: 3 }, { i0: 4, i1: 19, j0: 16, j1: 33, h: 3 }, { i0: 20, i1: 27, j0: 24, j1: 30, h: 3 }]; // OLD grid coords · bệ solar farm + bệ san phẳng trạm biến áp (h=3 khớp solar → sân trạm phẳng đều)
        function padH(i, j) { const oi = i / S, oj = j / S; for (const p of pads) if (oi >= p.i0 && oi <= p.i1 && oj >= p.j0 && oj <= p.j1) return p.h * S; return null; }
        function padHeight(i, j) {
          const oi = i / S, oj = j / S; let maxH = null;
          for (const p of pads) {
            const cx = (p.i0 + p.i1) / 2, cy = (p.j0 + p.j1) / 2, hx = (p.i1 - p.i0) / 2, hy = (p.j1 - p.j0) / 2;
            const dx = Math.abs(oi - cx), dy = Math.abs(oj - cy), distX = Math.max(0, dx - hx), distY = Math.max(0, dy - hy);
            const dist = Math.sqrt(distX * distX + distY * distY);
            if (dist === 0) {
              const h = p.h * S; if (maxH === null || h > maxH) maxH = h;
            } else if (dist < 5.0) {
              const t = dist / 5.0, sm = 1 - (t * t * (3 - 2 * t)), h = Math.round(p.h * S * sm + terr(i, j) * (1 - sm));
              if (maxH === null || h > maxH) maxH = h;
            }
          }
          return maxH;
        }
        const VOXEL_H_OVERRIDES = {   // hoisted: getVoxelHeight chạy ~120k lần lúc build + mỗi frame qua cowY — không tạo object mới mỗi lần gọi
          '74,103': 6, '73,103': 6, '75,103': 6, '74,102': 6, '74,104': 6,
          '63,98': 7, '62,98': 7, '64,98': 7, '63,97': 7, '63,99': 7, '62,97': 7, '64,99': 7
        };
        function getVoxelHeight(i, j) {
          const o = VOXEL_H_OVERRIDES[i + ',' + j];
          if (o !== undefined) return o;

          // --- San phẳng khu vực lún quanh xe caravan & bếp lửa lên độ cao 11 (bằng bếp lửa) ---
          if (i >= 84 && i <= 104 && j >= 140 && j <= 159) {
            return 11;
          }

          // --- San phẳng đất quanh 2 gốc cây táo (bán kính 5 voxels) lên độ cao 11 ---
          const d1_sq = (i - 86) * (i - 86) + (j - 126) * (j - 126);
          const d2_sq = (i - 98) * (i - 98) + (j - 138) * (j - 138);
          if (d1_sq <= 25 || d2_sq <= 25) {
            return 11;
          }

          const h = padHeight(i, j);
          return h === null ? terr(i, j) : h;
        }
        const MX = 20, MZ = 20;  // nới biên đất quanh đảo (nội dung giữ nguyên vì cx,cz không đổi)
        const gridW = GX + 2 * MX, gridD = GZ + 2 * MZ;
        let gridH = new Int16Array(gridW * gridD);
        let gridWater = new Uint8Array(gridW * gridD);

        for (let i = -MX; i < GX + MX; i++) {
          const gi = (i + MX) * gridD;
          for (let j = -MZ; j < GZ + MZ; j++) {
            const idx = gi + (j + MZ);
            if (isWater(i, j)) {
              gridWater[idx] = 1;
            } else {
              gridH[idx] = getVoxelHeight(i, j);
            }
          }
        }

        function surfaceY(i, j) {
          if (surfaceHeights && Number.isInteger(i) && Number.isInteger(j) && i >= -MX && i < GX + MX && j >= -MZ && j < GZ + MZ) {
            return surfaceHeights[(i + MX) * gridD + j + MZ] * BLOCK;
          }
          return getVoxelHeight(i, j) * BLOCK;
        }

