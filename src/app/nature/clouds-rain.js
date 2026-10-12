        // ---- MÂY TÍCH (cumulus): mỗi đám là 20–60 "bông" billboard dùng atlas normal-map dựng từ hợp mềm của nhiều quả cầu nhỏ
        //      + nhiễu fbm (mép xơ, mặt súp-lơ) → chiếu sáng theo hướng nắng thật; các bông che nắng lẫn nhau (tính trên CPU),
        //      đáy phẳng, chân xám-lam, viền bạc khi ngược sáng; đổ bóng mềm xuống địa hình qua shadow map (dither theo độ dày);
        //      trôi theo hướng/tốc độ gió thật, tự hình thành rồi tan; số đám theo độ phủ mây Open-Meteo; mưa → mây dày, xám chì ----
        function cloudAtlasPixels() {   // 2×2 ô 256²: RG = pháp tuyến (hệ billboard) · B = độ dày · A = độ phủ — JS thuần (chạy được trong Web Worker)
          const TS = 256, N = TS * 2, data = new Uint8Array(N * N * 4), Hf = new Float32Array(TS * TS);
          let seed = 20261007;
          const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let q = Math.imul(seed ^ (seed >>> 15), 1 | seed); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };
          const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
          const vnoise = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
          const fbm = (x, y, s) => { let sum = 0, amp = 0.5, f = 1; for (let o = 0; o < 4; o++) { sum += amp * vnoise(x * f, y * f, s + o * 17); f *= 2.03; amp *= 0.5; } return sum / 0.9375; };
          for (let tile = 0; tile < 4; tile++) {
            // khối chính + vành bông phụ (nới viền) + các múi nổi trên mặt (z lún 0,7r → nhô 0,3r, tạo nếp gấp súp-lơ)
            const R0 = 0.35 + rnd() * 0.05, sph = [[0, -0.04, 0, R0]], nRim = 9 + (rnd() * 5 | 0), nFace = 8 + (rnd() * 5 | 0);
            for (let i = 0; i < nRim; i++) { const a = rnd() * Math.PI * 2, dd = R0 * (0.72 + rnd() * 0.5), r = 0.15 + rnd() * 0.12; sph.push([Math.cos(a) * dd, Math.sin(a) * dd * 0.9 - 0.02, 0, r]); }
            for (let i = 0; i < nFace; i++) { const a = rnd() * Math.PI * 2, dd = Math.sqrt(rnd()) * R0 * 0.85, x = Math.cos(a) * dd, y = Math.sin(a) * dd - 0.04, r = 0.11 + rnd() * 0.11; sph.push([x, y, Math.sqrt(Math.max(0, R0 * R0 - dd * dd)) - r * 0.7, r]); }
            for (let j = 0; j < TS; j++) for (let i = 0; i < TS; i++) {
              const u = (i + 0.5) / TS * 2 - 1, v = (j + 0.5) / TS * 2 - 1;
              let s6 = 0; for (const s of sph) { const dx = u - s[0], dy = v - s[1], q = s[3] * s[3] - dx * dx - dy * dy; if (q > 0) { const hh = s[2] + Math.sqrt(q); if (hh > 0) s6 += hh * hh * hh * hh * hh * hh; } }
              let h = Math.pow(s6, 1 / 6);                                                          // p-norm p=6: hợp mềm, ngoài mọi cầu = 0
              if (h > 0) h = Math.max(0, h + ((fbm(u * 5 + tile * 3.1, v * 5, 11) - 0.5) * 0.04 + (vnoise(u * 14, v * 14, 29 + tile) - 0.5) * 0.012) * Math.min(1, h * 6));   // gợn mặt mây
              Hf[j * TS + i] = h;
            }
            const ox = (tile & 1) * TS, oy = (tile >> 1) * TS, k = TS / 4;   // đạo hàm trung tâm: Δh / (2 · 2/TS)
            for (let j = 0; j < TS; j++) for (let i = 0; i < TS; i++) {
              const h = Hf[j * TS + i], u = (i + 0.5) / TS * 2 - 1, v = (j + 0.5) / TS * 2 - 1;
              let nx = -(Hf[j * TS + Math.min(TS - 1, i + 1)] - Hf[j * TS + Math.max(0, i - 1)]) * k, ny = -(Hf[Math.min(TS - 1, j + 1) * TS + i] - Hf[Math.max(0, j - 1) * TS + i]) * k;
              const inv = 1 / Math.hypot(nx, ny, 1); nx *= inv; ny *= inv;
              const rim = Math.min(1, Math.max(0, (0.97 - Math.hypot(u, v)) / 0.2));   // về 0 trước mép ô atlas
              let a = (h - 0.02 + (fbm(u * 3.4 + 40 + tile * 7, v * 3.4, 5) - 0.5) * 0.2 * rim) / 0.24; a = a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a);   // mép xơ mềm
              const o = ((oy + j) * N + ox + i) * 4;
              data[o] = Math.round((nx * 0.5 + 0.5) * 255); data[o + 1] = Math.round((ny * 0.5 + 0.5) * 255); data[o + 2] = Math.round(Math.min(1, h / 0.62) * 255); data[o + 3] = Math.round(a * rim * 255);
            }
          }
          return data;
        }
        function makeCloudAtlas() {   // ~0,1 s tính toán → làm ở LUỒNG PHỤ (Worker từ Blob, không cần tệp ngoài); trang hiện ngay, mây hiện dần khi xong
          const N = 512, tex = new THREE.DataTexture(new Uint8Array(N * N * 4), N, N, THREE.RGBAFormat);
          tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true; tex.needsUpdate = true;
          const fill = data => { if (disposed) return; tex.image.data = data; tex.needsUpdate = true; };
          let worker = null, url = null;
          const done = () => { worker?.terminate(); worker = null; if (url) URL.revokeObjectURL(url); url = null; };
          try {
            url = URL.createObjectURL(new Blob(['onmessage = () => { const d = (' + cloudAtlasPixels.toString() + ')(); postMessage(d, [d.buffer]); };'], { type: 'text/javascript' }));
            worker = new Worker(url);
            worker.onmessage = e => { done(); fill(e.data); };
            worker.onerror = e => { e.preventDefault?.(); done(); fill(cloudAtlasPixels()); };
            worker.postMessage(0);
            sceneEvents.signal.addEventListener('abort', done);
          } catch (e) { done(); fill(cloudAtlasPixels()); }   // trình duyệt chặn Worker → tính ngay trên luồng chính như trước
          return tex;
        }
        function cloudShape(size, wet) {   // đáy phẳng y=0, 2–5 tháp đối lưu, đỉnh vòm súp-lơ; trục dài theo x cục bộ
          const R = Math.random, L = size * (2.0 + R() * 1.0), Wd = size * (0.95 + R() * 0.4), Hm = size * (wet ? 0.75 : 0.7 + R() * 0.5), puffs = [];
          const add = (x, y, z, r) => { if (puffs.length < 60) puffs.push({ x, y, z, r, tile: (R() * 4) | 0, rot: R() * 6.283, spin: (R() - 0.5) * 0.016, ph: R() * 6.283 }); };
          const nb = 7 + (R() * 4 | 0);
          for (let i = 0; i < nb; i++) { const a = R() * 6.283, rr = Math.sqrt(R()) * 0.9, r = size * (0.46 + R() * 0.16) * (1 - 0.3 * rr); add(Math.cos(a) * rr * L * 0.5, r * 0.5, Math.sin(a) * rr * Wd * 0.5, r); }
          const nt = 2 + (R() * (wet ? 2 : 4) | 0);
          for (let t = 0; t < nt; t++) {
            const tx = (R() - 0.5) * L * 0.65, tz = (R() - 0.5) * Wd * 0.45, top = Hm * (0.5 + R() * 0.5) * (1 - 0.6 * Math.abs(tx) / L);
            let y = size * 0.45, r = size * (0.52 + R() * 0.12);
            while (y < top) { add(tx + (R() - 0.5) * r * 0.5, y, tz + (R() - 0.5) * r * 0.5, r); y += r * 0.55; r *= 0.87; }
            const nc = 3 + (R() * 3 | 0);
            for (let c = 0; c < nc; c++) { const a = R() * 6.283; add(tx + Math.cos(a) * r * 0.75, y - r * 0.25 + R() * r * 0.35, tz + Math.sin(a) * r * 0.6, r * (0.55 + R() * 0.25)); }
          }
          return { puffs, L, W: Wd, H: Hm + size * 0.6 };
        }
        const CLOUD_VS = `
          attribute vec4 aCenter; attribute vec4 aPuff; attribute vec4 aMisc;   // tâm + cao độ đáy · bán kính, nắng lọt, che khuất trời, độ hiện · ô atlas, góc, tốc xoay, pha
          uniform vec3 uSunDir;
          varying vec2 vUv; varying vec4 vPuff; varying vec3 vSunV; varying vec3 vUpV; varying vec3 vGeo; varying vec3 vTile;
          #include <fog_pars_vertex>
          void main() {
            float s = aPuff.x * 1.6;   // bán kính đã gồm nhịp "thở" (tính trên CPU, double — không phụ thuộc thời gian float32 của GPU)
            vec4 mvPosition = viewMatrix * vec4(aCenter.xyz, 1.0);
            mvPosition.xy += position.xy * 2.0 * s;                                   // billboard quay mặt về camera (hoặc về nắng ở lượt đổ bóng)
            gl_Position = projectionMatrix * mvPosition;
            vUv = position.xy * 2.0; vPuff = aPuff; vGeo = vec3(aCenter.y, aCenter.w, s);
            vSunV = normalize(mat3(viewMatrix) * uSunDir); vUpV = mat3(viewMatrix) * vec3(0.0, 1.0, 0.0);
            vTile = vec3(mod(aMisc.x, 2.0) * 0.5, floor(aMisc.x * 0.5) * 0.5, aMisc.y);   // góc xoay đã cộng tốc xoay × thời gian trên CPU
            #include <fog_vertex>
          }`;
        const CLOUD_SAMPLE = `
          uniform sampler2D uAtlas;
          varying vec2 vUv; varying vec4 vPuff; varying vec3 vSunV; varying vec3 vUpV; varying vec3 vGeo; varying vec3 vTile;
          float puff(out vec3 n, out float h) {   // độ phủ đã cắt đáy phẳng · n = pháp tuyến hệ billboard · h = độ dày
            float c = cos(vTile.z), s = sin(vTile.z);
            vec2 tc = vec2(c * vUv.x - s * vUv.y, s * vUv.x + c * vUv.y);
            vec4 tx = texture2D(uAtlas, vTile.xy + (tc * 0.5 + 0.5) * 0.5);
            vec2 tn = tx.rg * 2.0 - 1.0, bn = vec2(c * tn.x + s * tn.y, -s * tn.x + c * tn.y);
            bn *= 0.7; n = vec3(bn, sqrt(max(0.0, 1.0 - dot(bn, bn)))); h = tx.b * 0.62;   // nắn pháp tuyến bớt nghiêng: tán xạ nhiều lần làm mép múi mây mềm
            float y = vGeo.x + vGeo.z * dot(vec3(vUv, h), vUpV);
            return tx.a * smoothstep(vGeo.y - 0.15, vGeo.y + 0.45, y);
          }`;
        const cloudU = { uAtlas: { value: makeCloudAtlas() }, uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.4) } };
        const cloudMat = new THREE.ShaderMaterial({
          uniforms: Object.assign({ uLit: { value: new THREE.Color() }, uShade: { value: new THREE.Color() }, uBase: { value: new THREE.Color() }, uOpacity: { value: 1 },
            fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 2000 }, fogDensity: { value: 0.00025 } }, cloudU),
          vertexShader: CLOUD_VS,
          fragmentShader: `
          uniform vec3 uLit; uniform vec3 uShade; uniform vec3 uBase; uniform float uOpacity;
          ${CLOUD_SAMPLE}
          #include <fog_pars_fragment>
          void main() {
            if (dot(vUv, vUv) > 1.0) discard;
            vec3 n; float h; float a = puff(n, h) * vPuff.w * uOpacity;
            if (a < 0.004) discard;
            float ndl = dot(n, vSunV);
            float ao = smoothstep(0.04, 0.42, h);                                          // khe giữa các múi (mỏng) tối hơn → khối có chiều sâu
            float direct = vPuff.y * clamp(0.45 + 0.55 * ndl, 0.0, 1.0) * (0.82 + 0.18 * ao);   // tán xạ mềm × nắng lọt qua các bông chắn phía trước
            float ambK = clamp(0.12 + 0.62 * vPuff.z + 0.3 * dot(n, vUpV), 0.0, 1.0);   // mặt trên sáng trời, chân mây tối xám-lam
            vec3 col = mix(uBase, uShade, ambK) * (0.8 + 0.2 * ao) + uLit * direct;
            col += uLit * (1.0 - smoothstep(0.02, 0.3, h)) * pow(max(0.0, -vSunV.z), 3.0) * vPuff.y * 0.7;   // viền bạc khi ngược sáng
            gl_FragColor = vec4(col, a);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
          }`,
          transparent: true, depthWrite: false, fog: true, toneMapped: false, shadowSide: THREE.DoubleSide
        });
        const cloudDepthMat = new THREE.ShaderMaterial({   // lượt đổ bóng: dither Bayer 4×4 theo độ phủ → bóng mây loang mềm trên địa hình
          uniforms: Object.assign({ uShadow: { value: 0.6 } }, cloudU),
          vertexShader: CLOUD_VS,
          fragmentShader: `
          #include <packing>
          uniform float uShadow;
          ${CLOUD_SAMPLE}
          void main() {
            if (dot(vUv, vUv) > 1.0) discard;
            vec3 n; float h; float a = puff(n, h) * vPuff.w * uShadow;
            vec2 b = floor(gl_FragCoord.xy), b2 = floor(b * 0.5);
            if (a <= fract(b2.x * 0.5 + b2.y * b2.y * 0.75) * 0.25 + fract(b.x * 0.5 + b.y * b.y * 0.75)) discard;
            gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
          }`
        });
        const MAX_CLOUDS = 11, PUFF_CAP = 64, MAX_PUFFS = MAX_CLOUDS * PUFF_CAP;
        const cloudGeo = new THREE.InstancedBufferGeometry();
        { const q = new THREE.PlaneGeometry(1, 1); cloudGeo.index = q.index; cloudGeo.setAttribute('position', q.attributes.position); }
        const cloudBuf = [0, 1, 2].map(() => new Float32Array(MAX_PUFFS * 4));
        const cloudAttr = ['aCenter', 'aPuff', 'aMisc'].map((name, i) => { const a = new THREE.InstancedBufferAttribute(cloudBuf[i], 4).setUsage(THREE.DynamicDrawUsage); cloudGeo.setAttribute(name, a); return a; });
        cloudGeo.instanceCount = 0;
        const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat); cloudMesh.name = 'Mây tích (Cumulus Clouds)';
        cloudMesh.frustumCulled = false; cloudMesh.castShadow = true; cloudMesh.receiveShadow = false; cloudMesh.renderOrder = 6; cloudMesh.raycast = () => {};
        cloudMesh.customDepthMaterial = cloudDepthMat; scene.add(cloudMesh);
        let cloudDraw = 0;
        cloudMesh.onBeforeRender = () => { if (cloudMat.uniforms.uOpacity.value < 0.01) cloudGeo.instanceCount = 0; };   // zoom sát: bỏ lượt vẽ màu, vẫn giữ bóng mây trên đất
        cloudMesh.onAfterRender = () => { cloudGeo.instanceCount = cloudDraw; };
        const cloudSlots = new Array(MAX_CLOUDS).fill(null);
        const CLOUD_RX = 128, CLOUD_RZ = 118;   // vùng mây trôi, bao trọn sa bàn
        const cloudDrift = new THREE.Vector2(0.55, 0.12), cloudSunKey = new THREE.Vector3(), _cSun = new THREE.Vector3(), _cView = new THREE.Vector3(), _cTmp = new THREE.Color();
        const cloudKeys = [], cloudDepth = new Float32Array(MAX_PUFFS);
        let cloudSpawnT = 0, cloudWet = 0;
        const CLOUD_PAL = {   // màu tuyến tính [nắng chiếu, bóng mát, chân mây]
          day: [new THREE.Color(0.64, 0.62, 0.56), new THREE.Color(0.48, 0.52, 0.60), new THREE.Color(0.28, 0.31, 0.37)],
          dusk: [new THREE.Color(0.85, 0.44, 0.20), new THREE.Color(0.36, 0.29, 0.36), new THREE.Color(0.20, 0.15, 0.19)],
          night: [new THREE.Color(0.085, 0.095, 0.130), new THREE.Color(0.048, 0.056, 0.082), new THREE.Color(0.026, 0.031, 0.048)],
          rain: [new THREE.Color(0.30, 0.31, 0.32), new THREE.Color(0.23, 0.25, 0.28), new THREE.Color(0.11, 0.12, 0.14)]
        };
        function cloudTarget() {
          const w = liveWeather.state, cc = w.fresh ? w.data?.current?.cloud_cover : null;
          let n = Number.isFinite(cc) ? Math.round(2 + cc / 100 * 7) : 5;   // độ phủ mây thật 0–100 % → 2–9 đám
          if (w.raining) n = Math.max(n, 9);
          return Math.min(MAX_CLOUDS, n);
        }
        function cloudLight(c, sd) {   // sd = hướng tới nắng (đêm là trăng)
          const P = c.puffs, n = P.length;
          for (let i = 0; i < n; i++) {
            const p = P[i]; let tau = 0, occ = 0;
            for (let k = 1; k <= 6; k++) {   // từ tâm bông đi về phía nắng, cộng mật độ các bông chắn đường
              const st = k * p.r * 0.7, x = p.x + sd.x * st, y = p.y + sd.y * st, z = p.z + sd.z * st;
              for (let j = 0; j < n; j++) { if (j === i) continue; const q = P[j], dx = x - q.x, dy = y - q.y, dz = z - q.z, f = 1 - (dx * dx + dy * dy + dz * dz) / (q.r * q.r); if (f > 0) tau += f * f; }
            }
            for (let k = 1; k <= 3; k++) {   // bị các bông phía trên che bớt ánh trời
              const y = p.y + k * p.r * 0.8;
              for (let j = 0; j < n; j++) { if (j === i) continue; const q = P[j], dx = p.x - q.x, dy = y - q.y, dz = p.z - q.z, f = 1 - (dx * dx + dy * dy + dz * dz) / (q.r * q.r); if (f > 0) occ += f; }
            }
            c.sun[i] = Math.max(0.22, Math.exp(-tau * 0.35));
            c.amb[i] = Math.min(1, Math.max(0, 0.45 + 0.55 * p.y / c.H - occ * 0.06));
          }
        }
        function spawnCloud(initial) {
          const slot = cloudSlots.indexOf(null); if (slot < 0) return;
          const wet = liveWeather.state.raining, size = (wet ? 8.0 : 6.2) + Math.random() * 2.6, sh = cloudShape(size, wet);
          const dl = Math.hypot(cloudDrift.x, cloudDrift.y) || 1, ang = Math.atan2(cloudDrift.y, cloudDrift.x) + (Math.random() - 0.5) * 0.7, ax = Math.cos(ang), az = Math.sin(ang);   // trục dài xuôi gió
          for (const p of sh.puffs) { const x = p.x, z = p.z; p.x = x * ax - z * az; p.z = x * az + z * ax; }
          let px = 0, pz = 0;
          for (let tries = 0; tries < 8; tries++) {
            px = (Math.random() * 2 - 1) * CLOUD_RX * 0.8; pz = (Math.random() * 2 - 1) * CLOUD_RZ * 0.8;
            if (!initial) { const ux = cloudDrift.x / dl, uz = cloudDrift.y / dl, al = px * ux + pz * uz; if (al > 0 && Math.random() < 0.75) { px -= 2 * al * ux; pz -= 2 * al * uz; } }   // ưu tiên sinh ở nửa đầu gió
            if (cloudSlots.every(o => !o || Math.hypot(o.pos.x - px, o.pos.z - pz) > (o.L + sh.L) * 0.45)) break;
          }
          const life = 300 + Math.random() * 300, n = sh.puffs.length;
          cloudSlots[slot] = { pos: new THREE.Vector3(px, (wet ? 82 : 86) + Math.random() * 10, pz), puffs: sh.puffs, L: sh.L, W: sh.W, H: sh.H, ax, az, spd: 0.85 + Math.random() * 0.3,
            age: initial ? 40 + Math.random() * life * 0.55 : 0, life, alpha: 0, g: 1, sun: new Float32Array(n).fill(1), amb: new Float32Array(n).fill(0.5), dirty: true };
        }
        for (let i = 0, n = cloudTarget(); i < n; i++) spawnCloud(true);
        function updateClouds(dt, t) {
          const w = liveWeather.state, U = cloudMat.uniforms;
          // gió khí tượng = hướng gió THỔI TỚI (0° = từ bắc, bắc = −Z) → mây trôi theo chiều ngược lại; tầng mây trôi nhanh hơn gió mặt đất
          let tx = 0.55, tz = 0.12;
          if (w.fresh && w.windDirection !== null) { const a = w.windDirection * Math.PI / 180, sp = Math.min(2.2, 0.35 + (w.windSpeed || 0) * 0.045); tx = -Math.sin(a) * sp; tz = Math.cos(a) * sp; }
          const kd = Math.min(1, dt * 0.08); cloudDrift.x += (tx - cloudDrift.x) * kd; cloudDrift.y += (tz - cloudDrift.y) * kd;
          cloudWet += ((w.raining ? 1 : 0) - cloudWet) * Math.min(1, dt * 0.4);
          // số đám bám độ phủ mây thật: thiếu → sinh dần, thừa → cho đám già nhất tan sớm
          const target = cloudTarget(); let alive = 0;
          for (const c of cloudSlots) if (c) alive++;
          cloudSpawnT -= dt;
          if (alive < target && cloudSpawnT <= 0) { spawnCloud(false); cloudSpawnT = 6 + Math.random() * 6; }
          if (alive > target) { let old = null; for (const c of cloudSlots) if (c && c.life - c.age > 60 && (!old || c.age > old.age)) old = c; if (old) old.life = old.age + 60; }
          _cSun.copy(sun.position).sub(sun.target.position).normalize(); U.uSunDir.value.copy(_cSun);
          const relight = _cSun.dot(cloudSunKey) < 0.9997; if (relight) cloudSunKey.copy(_cSun);   // nắng lệch > ~1,4° → tính lại độ che nắng
          const e = camera.matrixWorld.elements; _cView.set(e[8], e[9], e[10]);   // trục +Z camera: hướng về phía người xem
          cloudKeys.length = 0;
          for (let s = 0; s < MAX_CLOUDS; s++) {
            const c = cloudSlots[s]; if (!c) continue;
            c.age += dt; c.pos.x += cloudDrift.x * c.spd * dt; c.pos.z += cloudDrift.y * c.spd * dt;
            const ex = Math.max(Math.abs(c.pos.x) / CLOUD_RX, Math.abs(c.pos.z) / CLOUD_RZ);
            if (c.age >= c.life || ex > 1.02) { cloudSlots[s] = null; continue; }
            const sm = v => { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); }, fin = sm(c.age / 40), fout = sm((c.life - c.age) / 45);
            c.alpha = fin * fout * (1 - sm((ex - 0.8) / 0.2));   // hình thành · tan · mờ dần ở rìa vùng trôi
            c.g = 0.72 + 0.28 * fin + 0.1 * (1 - fout);          // lớn dần khi hình thành, bung loãng khi tan
            if (relight || c.dirty) { cloudLight(c, _cSun); c.dirty = false; }
            if (c.alpha <= 0.003) continue;
            for (let i = 0; i < c.puffs.length; i++) { const p = c.puffs[i], key = s * PUFF_CAP + i; cloudDepth[key] = (c.pos.x + p.x * c.g) * _cView.x + (c.pos.y + p.y * c.g) * _cView.y + (c.pos.z + p.z * c.g) * _cView.z; cloudKeys.push(key); }
          }
          cloudKeys.sort((a, b) => cloudDepth[a] - cloudDepth[b]);   // xa vẽ trước, gần vẽ sau → alpha chồng đúng thứ tự
          const [A, P, M] = cloudBuf;
          for (let n = 0; n < cloudKeys.length; n++) {
            const key = cloudKeys[n], c = cloudSlots[(key / PUFF_CAP) | 0], i = key % PUFF_CAP, p = c.puffs[i], o = n * 4;
            A[o] = c.pos.x + p.x * c.g; A[o + 1] = c.pos.y + p.y * c.g; A[o + 2] = c.pos.z + p.z * c.g; A[o + 3] = c.pos.y;
            P[o] = p.r * c.g * (1 + 0.035 * Math.sin(t * 0.21 + p.ph)); P[o + 1] = c.sun[i]; P[o + 2] = c.amb[i]; P[o + 3] = c.alpha;   // bông "thở" chậm như mây đang cuộn
            M[o] = p.tile; M[o + 1] = (p.rot + p.spin * t) % (Math.PI * 2); M[o + 2] = p.spin; M[o + 3] = p.ph;   // xoay chậm, quy về [0, 2π) bằng double
          }
          cloudGeo.instanceCount = cloudDraw = cloudKeys.length; for (const a of cloudAttr) a.needsUpdate = true;
          // màu theo giờ thật: ngày trắng ngà → chạng vạng cam hồng → đêm xám lam; mưa phủ xám chì; chớp loé sáng trong lòng mây
          const pal = CLOUD_PAL, dw = skyDusk * 0.85, rw = cloudWet * 0.85, rk = 1 - 0.85 * nightFactor, out = [U.uLit.value, U.uShade.value, U.uBase.value], flash = lightning.visible ? 0.4 * lightningMat.opacity : 0;
          for (let k = 0; k < 3; k++) out[k].copy(pal.day[k]).lerp(pal.night[k], nightFactor).lerp(pal.dusk[k], dw).lerp(_cTmp.copy(pal.rain[k]).multiplyScalar(rk), rw).addScalar(flash);
          U.uOpacity.value = (0.94 + 0.06 * cloudWet) * (1 - THREE.MathUtils.smoothstep(camera.zoom, 1.3, 2.6));   // zoom sát → như đã xuống dưới tầng mây
          cloudDepthMat.uniforms.uShadow.value = 0.95 + 0.1 * cloudWet;   // lõi mây dày chặn gần hết nắng, mép thưa → bóng loang
        }

        // ===== MƯA trên GPU — mỗi hạt là 1 vệt mảnh (instance 4 đỉnh); vị trí tính trong shader theo thời gian → CPU không cập nhật từng hạt =====
        //  · Hạt rơi từ đáy đám mây đang hiện (vị trí · trục dài · độ hiện của từng đám), xiên theo gió thật, tốc độ rơi ~14–22 đv/s.
        //  · Dừng ở MẶT CHẮN THẬT: bản đồ độ cao nhìn từ trên xuống (mái nhà, tán cây, xe, người, mặt nước, đất) vẽ lại ~15 giây/lần khi đang mưa,
        //    chạm mặt thì bắn 1 vòng tia nhỏ (~0,13 s). Thêm 1 lớp hạt quanh khung nhìn khi phóng to để mưa không thưa đi.
        //  · Cường độ theo mã thời tiết WMO + lượng mưa Open-Meteo (mưa phùn thưa, mưa rào/dông dày); vệt dài/rộng tính theo pixel → nét ở mọi mức zoom.
        const RAIN_PER_CLOUD = 520, RAIN_NEAR = 3600, RAIN_N = MAX_CLOUDS * RAIN_PER_CLOUD + RAIN_NEAR, RAIN_PERIOD = 7.2, RAIN_SPLASH = 0.13;
        function rainTarget() {   // 0–1: cường độ mưa hiện tại (chỉ thời tiết lúc này, không theo dự báo)
          const w = liveWeather.state; if (!w.raining) return 0;
          const c = w.data?.current || {}, code = c.weather_code;
          let k = code >= 51 && code <= 57 ? 0.28 : code === 61 || code === 80 ? 0.5 : code === 63 || code === 66 || code === 81 ? 0.72 : code === 65 || code === 67 || code === 82 ? 0.95 : code >= 95 ? 0.9 : 0.5;
          const mm = Math.max(c.precipitation || 0, (c.rain || 0) + (c.showers || 0));
          if (mm > 0) k = Math.max(k, Math.min(1, 0.32 + mm / 7));   // ~7 mm/h trở lên → mưa to
          return k;
        }
        const rainOcc = (() => {   // bản đồ độ cao MẶT CHẮN MƯA: vẽ độ sâu từ trên xuống (camera trực giao) vào texture RGBA (độ sâu nén)
          const N = 512, X0 = -134, X1 = 134, Z0 = -124, Z1 = 124, TOP = 120, NEAR = 0.5, FAR = 175;
          const rt = new THREE.WebGLRenderTarget(N, N, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, depthBuffer: true });
          rt.texture.name = 'Bản đồ mặt chắn mưa';
          const cam = new THREE.OrthographicCamera(X0, X1, -Z0, -Z1, NEAR, FAR); cam.position.set(0, TOP, 0); cam.up.set(0, 0, -1); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true);
          const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }), white = new THREE.Color(1, 1, 1), _cc = new THREE.Color();
          let ready = false, lastT = -1e9;
          function render(t, skip) {   // skip(o) = true → ẩn trong lượt vẽ này (mây, chính hạt mưa, nhãn, chùm đèn…)
            const hidden = [];
            scene.traverseVisible(o => { if (o.isSprite || o.isPoints || skip(o)) hidden.push(o); });
            for (const o of hidden) o.visible = false;
            const bg = scene.background, auto = renderer.shadowMap.autoUpdate, a = renderer.getClearAlpha(); renderer.getClearColor(_cc);
            scene.background = null; scene.overrideMaterial = depthMat; renderer.shadowMap.autoUpdate = false;
            renderer.setRenderTarget(rt); renderer.setClearColor(white, 1); renderer.clear(); renderer.render(scene, cam);
            renderer.setRenderTarget(null); renderer.setClearColor(_cc, a);
            scene.overrideMaterial = null; scene.background = bg; renderer.shadowMap.autoUpdate = auto;
            for (const o of hidden) o.visible = true;
            ready = true; lastT = t;
          }
          return { rt, tex: rt.texture, box: new THREE.Vector4(X0, Z1, 1 / (X1 - X0), 1 / (Z1 - Z0)), ys: new THREE.Vector3(TOP, NEAR, FAR), render, get ready() { return ready; }, get lastT() { return lastT; }, dispose() { rt.dispose(); depthMat.dispose(); } };
        })();
        sceneEvents.signal.addEventListener('abort', () => rainOcc.dispose());
        const rainU = {
          uTime: { value: 0 }, uPx: { value: 0.1 }, uCloud: { value: Array.from({ length: MAX_CLOUDS }, () => new THREE.Vector4(0, 0, 0, 0)) },
          uCloudAx: { value: Array.from({ length: MAX_CLOUDS }, () => new THREE.Vector4(1, 0, 1, 1)) }, uWind: { value: new THREE.Vector2() }, uDrift: { value: new THREE.Vector2() },
          uNear: { value: 0 }, uView: { value: new THREE.Vector4() }, uCamF: { value: new THREE.Vector3(0, -1, 0) },
          uOcc: { value: rainOcc.tex }, uOccBox: { value: rainOcc.box }, uOccY: { value: rainOcc.ys }, uOccOn: { value: 0 },
          uCol: { value: new THREE.Color(0.62, 0.68, 0.74) }, uAlpha: { value: 0.5 }
        };
        const rainMat = new THREE.ShaderMaterial({
          uniforms: rainU, transparent: true, depthWrite: false, toneMapped: false,
          vertexShader: `
            #include <packing>
            attribute vec4 aSeed; attribute vec2 aMeta;   // aSeed: u, v (đĩa đơn vị / hộp) · pha · tốc độ ngẫu nhiên — aMeta: ô mây (−1 = lớp quanh khung nhìn) · ngưỡng dày
            uniform float uTime, uPx, uNear, uOccOn; uniform vec4 uCloud[${MAX_CLOUDS}], uCloudAx[${MAX_CLOUDS}], uView, uOccBox;
            uniform vec2 uWind, uDrift; uniform vec3 uCamF, uOccY; uniform sampler2D uOcc;
            varying vec2 vUv; varying float vA; varying float vMode;
            float groundY(vec2 xz) {   // độ cao mặt chắn (mái, tán, mặt nước, đất) tại xz
              vec2 uv = vec2((xz.x - uOccBox.x) * uOccBox.z, (uOccBox.y - xz.y) * uOccBox.w);
              if (uOccOn < 0.5 || uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return 1.0;
              return uOccY.x - (uOccY.y + unpackRGBAToDepth(texture2D(uOcc, uv)) * (uOccY.z - uOccY.y));
            }
            void main() {
              float speed = 14.0 + 8.0 * aSeed.w, on; vec3 p;
              if (aMeta.x >= 0.0) {   // hạt rơi từ đáy 1 đám mây: chu kỳ cố định → không giật pha khi mây trôi qua chỗ cao/thấp
                vec4 C = uCloud[int(aMeta.x + 0.5)], X = uCloudAx[int(aMeta.x + 0.5)];
                on = step(aMeta.y, C.w);
                vec2 o = aSeed.xy * X.zw;
                float tau = fract(aSeed.z + uTime / ${RAIN_PERIOD.toFixed(1)}) * ${RAIN_PERIOD.toFixed(1)};
                p = vec3(C.x + o.x * X.x - o.y * X.y + uWind.x * tau, C.y - speed * tau, C.z + o.x * X.y + o.y * X.x + uWind.y * tau);
              } else {   // lớp quanh khung nhìn: hộp 2R quanh tâm nhìn, hạt cố định trong thế giới, cuộn vòng qua mép hộp
                on = step(aMeta.y, uNear);
                float R = uView.w, L = 2.0 * R; vec3 c0 = uView.xyz - vec3(R, 0.6 * R, R);   // hộp lệch lên: ít hạt nằm dưới mặt đất
                vec3 w = vec3(aSeed.x * L + uDrift.x, aSeed.z * L - speed * uTime, aSeed.y * L + uDrift.y);
                p = c0 + mod(w - c0, L);
              }
              float g = groundY(p.xz), h = p.y - g;   // h < 0: đã chạm mặt (−h/speed giây trước)
              vec3 vel = normalize(vec3(uWind.x, -speed, uWind.y));
              vA = on * (0.55 + 0.45 * fract(aSeed.z * 7.13));
              if (h >= 0.0) {   // vệt rơi: đầu ở dưới, đuôi kéo ngược chiều bay; dài ≤ 36 px, rộng ~1,3 px
                vMode = 0.0;
                float len = min(2.4, 52.0 * uPx) * (0.7 + 0.3 * aSeed.w);
                vec3 side = normalize(cross(vel, uCamF)) * uPx * 1.0;
                p += -vel * len * position.y + side * position.x;
                vUv = vec2(position.x, position.y);
              } else {   // chạm mặt: vòng tia nhỏ nằm ngang, nở ra rồi tắt
                float age = -h / speed;
                vMode = 1.0; vA *= step(age, ${RAIN_SPLASH.toFixed(2)}) * (1.0 - age / ${RAIN_SPLASH.toFixed(2)});
                float r = max(0.04 + 1.25 * age, uPx * 1.6);
                p = vec3(p.x, g + 0.02, p.z) + vec3(position.x, 0.0, position.y * 2.0 - 1.0) * r;
                vUv = vec2(position.x, position.y * 2.0 - 1.0);
              }
              gl_Position = vA > 0.002 ? projectionMatrix * viewMatrix * vec4(p, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
            }`,
          fragmentShader: `
            uniform vec3 uCol; uniform float uAlpha;
            varying vec2 vUv; varying float vA; varying float vMode;
            void main() {
              float a; vec3 col = uCol;
              if (vMode < 0.5) a = (1.0 - abs(vUv.x)) * (1.0 - vUv.y * 0.6);   // giữa vệt đậm, đuôi nhạt dần
              else { float r = length(vUv); a = smoothstep(1.0, 0.78, r) * smoothstep(0.3, 0.75, r) * 1.5; col = mix(uCol, vec3(0.8, 0.86, 0.92), 0.55); }   // vòng tia bắn sáng hơn
              gl_FragColor = vec4(col, min(1.0, a * vA * uAlpha));
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
            }`
        });
        const rainGeo = new THREE.InstancedBufferGeometry();
        rainGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0], 3)); rainGeo.setIndex([0, 1, 2, 0, 2, 3]);
        {
          const seed = new Float32Array(RAIN_N * 4), meta = new Float32Array(RAIN_N * 2);
          for (let i = 0; i < RAIN_N; i++) {
            const cloud = i < MAX_CLOUDS * RAIN_PER_CLOUD, a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
            seed.set(cloud ? [Math.cos(a) * r, Math.sin(a) * r, Math.random(), Math.random()] : [Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
            meta.set([cloud ? Math.floor(i / RAIN_PER_CLOUD) : -1, Math.random()], i * 2);
          }
          rainGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4)); rainGeo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(meta, 2));
          rainGeo.instanceCount = RAIN_N;
        }
        const rainMesh = new THREE.Mesh(rainGeo, rainMat); rainMesh.name = 'Mưa (GPU)'; rainMesh.visible = false; rainMesh.frustumCulled = false; rainMesh.renderOrder = 5; rainMesh.raycast = () => {};
        rainMesh.userData.noBatch = true; scene.add(rainMesh);
        let rainK = 0, sceneWet = 0;   // cường độ mưa đang hiện (mượt) · độ ướt mặt đất 0–1 (thấm dần khi mưa, khô dần khi tạnh)
        const wetMats = [grassMat, shoreMat, dirtMat].map(m => [m, m.color.clone()]), _rainNight = new THREE.Color(0.33, 0.40, 0.50);
        const lightningMat = new THREE.LineBasicMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.75, depthWrite: false });
        const lightning = new THREE.Line(new THREE.BufferGeometry(), lightningMat); lightning.visible = false; lightning.frustumCulled = false; scene.add(lightning);
        lightning.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(7 * 3), 3).setUsage(THREE.DynamicDrawUsage));   // 7 điểm cấp sẵn, mỗi lần sét chỉ ghi đè
        const _boltP = new THREE.Vector3(), _boltA = new THREE.Vector3(), _boltB = new THREE.Vector3();
        const storm = { next: 18, until: -1 };
        const reducedFlashes = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        function updateWeatherRain(dt, t) {
          const w = liveWeather.state, want = rainTarget();
          rainK += (want - rainK) * Math.min(1, dt * 0.35);   // vào/ra mưa mượt trong vài giây
          sceneWet = Math.min(1, Math.max(0, sceneWet + (want > 0 ? dt * (0.004 + 0.012 * want) : -dt * (0.0011 + 0.0016 * (1 - nightFactor)))));
          const wetK = 1 - 0.24 * sceneWet; for (const [m, c] of wetMats) m.color.copy(c).multiplyScalar(wetK);   // đất cỏ thẫm lại khi ướt
          if (scene.fog) { scene.fog.near = 280 - 30 * rainK; scene.fog.far = 700 - 70 * rainK; }   // mưa → không khí mờ hơn
          rainMesh.visible = rainK > 0.01;
          if (rainMesh.visible) {
            const U = rainU, wd = sceneWind.dir, ws = Math.min(9, 1.2 + sceneWind.ms * 0.9);   // hạt xiên theo gió (đv/s ngang)
            U.uTime.value = t % 3600; U.uWind.value.set(wd.x * ws, wd.y * ws); U.uDrift.value.addScaledVector(U.uWind.value, dt);
            for (let s = 0; s < MAX_CLOUDS; s++) {
              const c = cloudSlots[s], C = U.uCloud.value[s], X = U.uCloudAx.value[s];
              if (!c) { C.w = 0; continue; }
              C.set(c.pos.x, c.pos.y + 0.4, c.pos.z, c.alpha * rainK); X.set(c.ax, c.az, c.L * 0.42, c.W * 0.42);
            }
            const vh = (camera.top - camera.bottom) / camera.zoom, px = vh / Math.max(1, renderer.domElement.height);   // đv thế giới / pixel
            U.uPx.value = px; U.uNear.value = rainK * THREE.MathUtils.smoothstep(camera.zoom, 1.4, 3.5);
            U.uView.value.set(target.x, target.y, target.z, vh * 0.75);
            camera.getWorldDirection(U.uCamF.value);
            U.uCol.value.setRGB(0.21, 0.29, 0.39).lerp(_rainNight, nightFactor); U.uAlpha.value = 0.85 - 0.25 * nightFactor;   // ngày: vệt xám lam trên nền sáng · đêm: vệt sáng nhẹ
            if (t - rainOcc.lastT > 15) { rainOcc.render(t, o => o === rainMesh || o === cloudMesh || o === lightning || o.name === 'Ánh đèn đường' || o.userData.noRainOcc); U.uOccOn.value = 1; }
          }
          if (w.thunder && !reducedFlashes && t > storm.next) {
            const live = cloudSlots.filter(c => c && c.alpha > 0.5);
            if (live.length) {
              const c = live[(Math.random() * live.length) | 0];
              const start = _boltA.copy(c.pos), end = _boltB.set(start.x + (Math.random() - 0.5) * 5, downY + 0.6, start.z + (Math.random() - 0.5) * 6), la = lightning.geometry.attributes.position;
              for (let i = 0; i <= 6; i++) { _boltP.copy(start).lerp(end, i / 6); la.setXYZ(i, _boltP.x + (Math.random() - 0.5) * 1.2, _boltP.y, _boltP.z + (Math.random() - 0.5) * 1.2); }
              la.needsUpdate = true; storm.until = t + 0.24;   // ghi đè bộ đệm cũ thay vì tạo bộ đệm GPU mới mỗi lần sét đánh
            }
            storm.next = t + 18 + Math.random() * 16;
          }
          lightning.visible = w.thunder && !reducedFlashes && t < storm.until;
          if (lightning.visible) lightningMat.opacity = 0.75 * Math.max(0, (storm.until - t) / 0.24);
        }

        // ---- distant corner mist ----
        const mistDefs = [[-46, 10, -39, 38, 15, 0.105], [43, 12, -35, 34, 13, 0.09], [-44, 8, 36, 32, 12, 0.08], [45, 11, 34, 30, 12, 0.075]];
        for (const m of mistDefs) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistMap, color: 0xE2D6C0, transparent: true, opacity: m[5], depthWrite: false })); sp.position.set(m[0], m[1], m[2]); sp.scale.set(m[3], m[4], 1); sp.renderOrder = 3; scene.add(sp); }

