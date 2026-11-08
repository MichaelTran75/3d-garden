        // ===== CHẤT LIỆU CÔNG TRÌNH (mẫu: nhà hàng "Inakaya" — Jellepostma,
        //  CC-BY-4.0 · "Forest House" — peachyroyalty, CC-BY-NC-4.0; chỉ xem để học, không nhúng). Khác biệt lớn nhất với khối phẳng của mình nằm ở CHẤT LIỆU
        //  vẽ trên bề mặt: ván dọc có mạch, tông từng tấm lệch nhau, thớ gỗ · bê tông có mạch cốp pha, loang ố, vệt chảy · tường vữa lốm đốm, VỆT NƯỚC MƯA
        //  dọc tường · chân tường BẨN + TỐI DẦN như vẽ bóng sẵn (painted AO), cao lên sáng dần · rêu xanh ở chân bê tông. Làm bằng shader thủ tục theo toạ
        //  độ thế giới (không ảnh, không thêm lưới): độ cao trên mặt đất đọc từ ẢNH ĐỘ CAO ĐỊA HÌNH (1 điểm ảnh = 1 ô lưới 0,6 m, dựng 1 lần từ cowY lúc
        //  biên dịch shader đầu tiên) ⇒ 1 vật liệu dùng chung nhiều nhà vẫn đúng chân tường từng nhà; mạch ván / cốp pha lõm thật (bump theo đạo hàm màn
        //  hình). Vật liệu có shader riêng thì lớp gộp lượt vẽ để riêng (vẽ thẳng, nhà đã gộp tĩnh theo vật liệu nên chỉ thêm vài lượt) ----
        let SF_H = null;
        // ảnh vân vỏ THẬT cắt từ bản quét "Tree 3D Scan - Retopo" (grafi, CC-BY-4.0): 4 dải vỏ thân ghép ngang
        // (160 × 480, src/models/bark-scan.jpg, tải sau khi cảnh chạy, địa chỉ tuyệt đối Pages như mẫu drone). Chỉ vật liệu có userData.sfTex dùng ảnh;
        // chưa tải xong / tải lỗi (bản 1 tệp ngoại tuyến) thì vẫn vân thủ tục bên dưới
        const SF_BT = { value: null }, SF_BTK = { value: 0 }, SF_WET = { value: 0 }, SF_NO = { value: new THREE.Vector2(0, -1) };
        const SF_WALL_T = [0, 1.31, 0.64, 0.94, 0.98];   // ngưỡng mảng rêu tường cũ theo loại (23/10, ~5% mặt đứng) — nay chỉ đập dùng (sfOldMo)
        const SF_CV = { value: null }, SF_CV0 = { value: new THREE.Vector3() }, SF_CV1 = { value: new THREE.Vector3() };   // ảnh 3D mật độ vật rắn quanh gốc cổ thụ (hốc khuất ⇒ rêu): nature/moss-lawn.js mossCrevice · góc hộp · 1 / cỡ hộp   // SF_WET: độ ẩm rêu (nature/clouds-rain.js) · SF_NO: hướng bắc (xz)
        function sfBarkTex() {
          if (SF_BT.loading) return; SF_BT.loading = 1;
          ldTrack(new Promise(ldR => new THREE.TextureLoader().load(window.__barkTex || 'https://michaeltran75.github.io/3d-garden/models/bark-scan.jpg', t => {
            t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 4; SF_BT.value = t; SF_BTK.value = 1; ldR(); }, undefined, ldR)));
        }
        const SF_KIND = { concrete: 1, stucco: 2, boards: 3, woodAO: 4, bark: 5 };
        function sfHeightTex() {   // cowY tại tâm từng ô lưới GX × GZ (nước: mặt nước) — đọc lân cận gần nhất trong shader
          const d = new Float32Array(GX * GZ);
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) d[i + j * GX] = cowY(wx(i), wz(j));
          const t = new THREE.DataTexture(d, GX, GZ, THREE.RedFormat, THREE.FloatType); t.magFilter = t.minFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
        }
        const SF_NOISE = `
          float sfR(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float sfN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(sfR(i), sfR(i + vec2(1.0, 0.0)), f.x), mix(sfR(i + vec2(0.0, 1.0)), sfR(i + vec2(1.0, 1.0)), f.x), f.y); }
          float sfNw(vec2 p, float P) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float i0 = mod(i.x, P), i1 = mod(i.x + 1.0, P);   // nhiễu tuần hoàn theo x (chu kỳ P ô) — vòng quanh thân không lộ đường may
            return mix(mix(sfR(vec2(i0, i.y)), sfR(vec2(i1, i.y)), f.x), mix(sfR(vec2(i0, i.y + 1.0)), sfR(vec2(i1, i.y + 1.0)), f.x), f.y); }`;   // băm · nhiễu trơn · nhiễu tuần hoàn quanh thân — dùng chung với shader đỉnh lá rêu (nature/moss-lawn.js)
        // THẢM RÊU dùng chung (vỏ cây, chân tường, vách bờ, tường đầu cửa xả, đá hộc): đệm rêu · màu thảm (= rêu trên vỏ cây, nature/moss-lawn.js tô lá cùng màu) · gồ theo đạo hàm
        const SF_MOSS = `
          float sfCush(vec2 q) { vec2 i = floor(q); float h = 0.0;   // ĐỆM RÊU: mỗi ô 1 vòm tròn lệch tâm, to nhỏ / cao thấp ngẫu nhiên, vòm kề chồng nhau ⇒ cục không đều; 0 = kẽ giữa các đệm
            for (int dx = -1; dx <= 1; dx++) for (int dy = -1; dy <= 1; dy++) { vec2 o = i + vec2(float(dx), float(dy)), d = (q - o - 0.2 - 0.6 * vec2(fract(sin(dot(o, vec2(127.1, 311.7))) * 43758.5453), fract(sin(dot(o + 3.7, vec2(127.1, 311.7))) * 43758.5453))) / (0.5 + 0.45 * fract(sin(dot(o + 7.1, vec2(127.1, 311.7))) * 43758.5453));
              h = max(h, (0.45 + 0.55 * fract(sin(dot(o + 1.3, vec2(127.1, 311.7))) * 43758.5453)) * (1.0 - dot(d, d))); }
            return h; }
          float sfMossCu(vec2 q, float f) { return 0.8 * mix(sfCush(q * 8.0), 0.3, smoothstep(0.04, 0.1, f)) + 0.2 * mix(sfCush(q * 26.0 + 11.0), 0.3, smoothstep(0.012, 0.03, f)); }   // đệm ~12 cm + gợn ~4 cm, nhỏ hơn ~1 điểm ảnh thì về trung bình; f = length(fwidth(q)) tính NGOÀI nhánh
          vec3 sfMossT(vec3 P, float wet) { return vec3(0.2, 0.3, 0.07) * (0.94 + 0.12 * sfN(P.xz * 0.35 + 3.7)) * mix(vec3(1.05, 1.0, 0.86), vec3(0.92, 1.02, 0.96), wet); }   // khô ngả vàng nhẹ · ướt thẫm nhẹ
          vec3 sfBump(vec3 n, vec3 sp, float h) { vec3 dx = dFdx(sp), dy = dFdy(sp), r1 = cross(dy, n), r2 = cross(n, dx); float det = dot(dx, r1);
            return normalize(abs(det) * n - sign(det) * (dFdx(h) * r1 + dFdy(h) * r2)); }`;
        // RÊU CHÂN TƯỜNG (bản 23/10 là mảng loang lốm đốm khắp mặt tường, trông như vết sơn rằn ri). Theo nghiên cứu rêu
        //  trên công trình: rêu cần chỗ ẩm lâu khô + mặt sần giữ được bào tử ⇒ mọc thành DẢI ĐỆM sát chân tường (mưa bắn, ẩm leo từ đất), dày + cao hơn ở mặt khuất
        //  nắng hướng bắc, đứt đoạn theo chỗ khô / ẩm dọc tường, mép trên lồi lõm theo từng đệm, vài đệm lẻ bám ngay trên dải; mặt tường phẳng cao hơn chỉ có MÀNG
        //  TẢO lục mờ dần lên trên dải rêu (vùng mưa bắn) + vệt tảo theo nước chảy dọc tường. Dùng chung cho tô màu (SF_GLSL) và lượt GPU tính lượng rêu tại gốc
        //  lá rêu (nature/moss-lawn.js) ⇒ lá mọc đúng chỗ có rêu. Trả về lượng rêu 0–1; al = độ đậm màng tảo
        const SF_WALLMO = `
          float sfWallMo(vec3 P, vec3 wn, float hA, vec2 no, out float al) {
            vec2 tg = normalize(vec2(-wn.z, wn.x) + 1e-5); float u = dot(P.xz, tg), nf = dot(normalize(wn.xz + 1e-4), no);   // u: dọc tường · nf: 1 = mặt hướng bắc
            float pres = smoothstep(0.28, 0.5, sfN(vec2(u * 0.7, 3.0) + 61.0) + 0.16 * nf);   // đoạn tường ẩm có rêu (~1,4 m)
            float tq = smoothstep(0.68, 0.88, sfN(vec2(u * 1.9, 11.0) + 91.0));   // lưỡi rêu leo theo vệt ẩm (nước bắn dồn, ống xối rỉ) ~35 cm ngang
            float H = pres * (0.1 + 0.3 * sfN(vec2(u * 1.1, 5.0) + 7.0) + 0.2 * sfN(vec2(u * 3.7, 2.0) + 17.0) + 0.25 * max(nf, 0.0) + 0.85 * tq);   // cao dải rêu 10–85 cm, lưỡi tới ~1,7 m
            float e = H - hA + (0.04 + 0.15 * H) * (sfN(vec2(u, P.y) * 6.0 + 71.0) - 0.5) + 0.03 * (sfN(vec2(u, P.y) * 18.0 + 73.0) - 0.5);   // mép trên lồi lõm (dải cao lồi lõm nhiều hơn)
            float cs = smoothstep(0.86, 0.91, sfN(vec2(u, P.y) * 9.0 + 79.0)) * (1.0 - smoothstep(0.05, 0.45, hA - H)) * pres;   // đệm lẻ ngay trên dải
            al = 0.7 * pres * (1.0 - smoothstep(H, H + 0.45 + 0.5 * sfN(vec2(u * 1.3, 9.0) + 83.0), hA))
               + 0.35 * smoothstep(0.66, 0.82, sfN(vec2(u * 2.6, P.y * 0.11) + 51.0)) * (1.0 - smoothstep(0.4, 3.5, hA)) * (0.6 + 0.4 * max(nf, 0.0));
            return max(smoothstep(-0.03, 0.05, e) * step(0.015, H), cs) * step(-0.02, hA); }   // độ phủ thô: ×0,7 + đệm rêu rồi smoothstep(0,32; 0,62) như rêu vách bờ ⇒ mép mảng vỡ theo từng đệm
          // RÊU TƯỜNG CŨ (23/10 thêm 5 % rêu lên tường công trình: mảng = nhiễu lớn + vừa + chân tường + hướng bắc + vệt nước, ngưỡng SF_WALL_T theo loại) — ĐẬP giữ đúng
          //  vị trí rêu cũ, chỉ đổi sang rêu mới (không phủ rêu mặt đường trên đập, chỉ thay rêu cũ bằng rêu mới): mặt đứng
          //  bê tông thân đập, không có rêu mặt trên; mép mảng theo đệm rêu thay mép lấm tấm
          float sfOldMo(vec3 P, vec3 wn, float hA, vec2 no, float T) {
            vec2 tg = normalize(vec2(-wn.z, wn.x) + 1e-5); float u = dot(P.xz, tg), y = P.y, nfw = dot(normalize(wn.xz + 1e-4), no), spl = 1.0 - smoothstep(0.05, 0.9, hA);
            float drp = smoothstep(0.62, 0.8, sfN(vec2(u * 2.6, y * 0.11) + 51.0)) * (1.0 - smoothstep(0.4, 3.5, hA));   // vệt nước chảy, nhạt dần lên cao
            return smoothstep(T, T + 0.1, 0.42 * sfN(vec2(u, y) * 1.7 + 61.0) + 0.28 * sfN(vec2(u, y) * 5.3 + 67.0) + 0.6 * spl + 0.15 * nfw + 0.38 * drp); }`;
        const SF_GLSL = `
          uniform sampler2D uSfH; uniform vec4 uSfG; uniform float uSfL; uniform vec3 uSfLC; uniform sampler2D uSfT; uniform float uSfTk; uniform vec3 uSfTt; uniform float uSfDk; uniform float uSfOld; uniform float uSfMs; uniform float uSfTm; uniform float uSfTw; uniform float uSfWet; uniform vec2 uSfNo; uniform float uSfOM; varying vec3 vSfP; varying vec3 vSfN; uniform highp sampler3D uSfCv; uniform vec3 uSfCv0; uniform vec3 uSfCv1;
` + SF_NOISE + SF_MOSS + SF_WALLMO + `
          // vỏ táo nứt vảy — Y HỆT appleBark (nature/flowers-trees.js): băm số nguyên 32 bit ⇒ cùng mảng với khe khoét trên lưới
          // nét vân mảnh hơn 1 điểm ảnh (khe nứt ~7 mm, thớ ~3 mm, đốm địa y) cắt cứng ⇒ nhảy khi camera dịch dưới 1 điểm
          //  ảnh. Lọc theo cỡ điểm ảnh: sfLn = nét |n − 0,5| < a…b mở rộng thêm fwidth(n) và giảm đậm cho bằng diện tích nét (xa: vệt nhạt mịn, không lấm tấm) ·
          //  sfSp = đốm n > a…b mép mềm theo fwidth · sfNwF = nhiễu tuần hoàn mịn hơn ~½ điểm ảnh về trung bình 0,5 (đạo hàm x trừ bước chu kỳ P ở đường may)
          float sfLn(float n, float a, float b) { float w = fwidth(n); return (1.0 - smoothstep(a - w, b + w, abs(n - 0.5))) * (a + b) / (a + b + 2.0 * w); }
          float sfSp(float n, float a, float b) { float w = fwidth(n); return smoothstep(a - w, b + w, n); }
          float sfFp(vec2 p, float P) { vec2 dx = dFdx(p), dy = dFdy(p); dx.x -= P * floor(dx.x / P + 0.5); dy.x -= P * floor(dy.x / P + 0.5); return max(length(dx), length(dy)); }
          float sfNwF(vec2 p, float P) { return mix(sfNw(p, P), 0.5, smoothstep(0.3, 0.8, sfFp(p, P))); }
          float sfAH(int x, int y) { uint h = uint(x) * 0x27d4eb2du ^ uint(y) * 0x165667b1u; h = (h ^ (h >> 15u)) * 0x85ebca6bu; h = (h ^ (h >> 13u)) * 0xc2b2ae35u; return float(h ^ (h >> 16u)) / 4294967296.0; }
          float sfAV(vec2 p, float P) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); int x0 = int(mod(i.x, P)), x1 = int(mod(i.x + 1.0, P)), y0 = int(i.y) + 4096, y1 = y0 + 1;
            return mix(mix(sfAH(x0, y0), sfAH(x1, y0), f.x), mix(sfAH(x0, y1), sfAH(x1, y1), f.x), f.y); }
          float sfARidge(float bx, float by, float bm) { return sfAV(vec2(bx * 8.0, by * 1.6 + 3.0), 8.0 * bm); }   // gờ / rãnh dọc lớn = appleRidge (thấp = lòng rãnh)
          vec4 sfApple(float bx, float by, float bm) {   // VẢY: ô Voronoi so le (20 ô / đv vân quanh × 6 / đv dọc ≈ 5 × 15 cm), mép uốn lượn + lởm chởm → (e: tới mép, hid, hid2, w: khe hở 1 / liền 0)
            float P = 20.0 * bm; vec2 q = vec2(bx * 20.0, by * 6.0), w = q * vec2(0.25, 0.35);
            q += vec2(0.6, 0.4) * (vec2(sfAV(w, P * 0.25), sfAV(w + vec2(0.0, 17.0), P * 0.25)) - 0.5);
            q += vec2(0.2, 0.1) * (vec2(sfAV(q * 3.0, P * 3.0), sfAV(q * 3.0 + vec2(0.0, 29.0), P * 3.0)) - 0.5) + vec2(0.07, 0.035) * (vec2(sfAV(q * 9.0, P * 9.0), sfAV(q * 9.0 + vec2(0.0, 41.0), P * 9.0)) - 0.5);   // mép khe uốn lượn + lởm chởm
            float cx0 = floor(q.x), f1 = 9.0, f2 = 9.0; int ax = 0, ay = 0, bx2 = 0, by2 = 0; vec2 p1 = vec2(0.0), p2 = vec2(0.0);
            for (int dx = -1; dx <= 1; dx++) { float cx = cx0 + float(dx); int ix = int(mod(cx, P)); float off = mod(float(ix), 2.0) * 0.5;
              for (int dy = -1; dy <= 1; dy++) { float cy = floor(q.y - off) + float(dy); int iy = int(cy) + 4096;
                vec2 pt = vec2(cx + 0.5 + 0.8 * (sfAH(ix, iy) - 0.5), cy + off + 0.5 + 0.8 * (sfAH(ix + 7919, iy) - 0.5)), d = (pt - q) * vec2(1.0, 3.1); float dd = dot(d, d);
                if (dd < f1) { f2 = f1; bx2 = ax; by2 = ay; p2 = p1; f1 = dd; ax = ix; ay = iy; p1 = pt; } else if (dd < f2) { f2 = dd; bx2 = ix; by2 = iy; p2 = pt; } } }
            vec2 sep = (p2 - p1) * vec2(1.0, 3.1); float pr = sfAH(ax + bx2 + 101, ay + by2 + (ax - bx2) * (ax - bx2) * 977 + 13);   // băm đối xứng theo cặp mảng
            float hz = step(abs(sep.x), abs(sep.y)), wg = step(hz > 0.5 ? 0.55 : 0.12, pr) * (hz > 0.5 ? 0.45 : 1.0);   // khe NGANG (2 mảng trên – dưới): hay liền (vảy dài dính nhau), hở thì mảnh · khe dọc hiếm khi liền, hở rộng
            return vec4(sqrt(f2) - sqrt(f1), sfAH(ax + 31, ay), sfAH(ax + 53, ay + 7), wg); }
          `;
        function surfaceStyle(mat, kind) {
          const K = SF_KIND[kind], prev = mat.onBeforeCompile; mat.userData.sfK = K;   // loại (lá rêu chân tường chỉ mọc trên tường 1–4 — nature/moss-lawn.js)
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r);
            SF_H = SF_H || sfHeightTex();
            sh.uniforms.uSfH = { value: SF_H }; sh.uniforms.uSfG = { value: new THREE.Vector4(1 / BLOCK, cx, cz, 0) }; sh.uniforms.uSfL = { value: mat.userData.sfL ?? 1 }; const U = mat.userData; if (K === 5 && U.sfTex) sfBarkTex(); sh.uniforms.uSfT = SF_BT; sh.uniforms.uSfTk = U.sfTex ? SF_BTK : { value: 0 }; sh.uniforms.uSfWet = SF_WET; sh.uniforms.uSfCv = SF_CV; sh.uniforms.uSfCv0 = SF_CV0; sh.uniforms.uSfCv1 = SF_CV1; sh.uniforms.uSfNo = SF_NO; sh.uniforms.uSfOM = { value: U.sfOldMo ? 1 : 0 }; SF_NO.value.set(SKY_NORTH.x, SKY_NORTH.z).normalize(); sh.uniforms.uSfTt = { value: U.sfTint || new THREE.Vector3(1, 1, 1) }; sh.uniforms.uSfDk = { value: U.sfDk || 0 }; sh.uniforms.uSfOld = { value: U.sfOld ? 1 : 0 }; sh.uniforms.uSfMs = { value: U.sfMoss ?? 1 }; sh.uniforms.uSfTm = { value: U.sfTop ?? (U.sfOld ? 1 : 0) }; sh.uniforms.uSfTw = { value: U.sfTopW ? 1 : 0 }; sh.uniforms.uSfLC = { value: mat.userData.sfLC || new THREE.Color(0.58, 0.6, 0.53) };   // màu mảng loang (địa y) theo cây
            // chèn ở fog_vertex (cuối shader): vị trí thế giới lấy ngược từ mvPosition ⇒ đúng cả khi shader gió đã thay project_vertex (cây đung đưa)
            sh.vertexShader = 'varying vec3 vSfP; varying vec3 vSfN;\n' + (K === 5 ? 'attribute vec3 aBk; varying vec3 vSfB; attribute float aBd; varying float vSfD;\n' : '') + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>${K === 5 ? '\n vSfB = aBk; vSfD = aBd;' : ''}
              vec3 sfN3 = objectNormal;
              #ifdef USE_INSTANCING
                sfN3 = mat3(instanceMatrix) * sfN3;
              #endif
              vSfP = (inverse(viewMatrix) * vec4(mvPosition.xyz, 1.0)).xyz; vSfN = normalize(mat3(modelMatrix) * sfN3);`);
            sh.fragmentShader = (U.sfApple ? '#define SF_APPLE\n' : '') + SF_GLSL + (K === 5 ? '\nvarying vec3 vSfB; varying float vSfD;' : '') + '\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
              float sfHg = 0.0, sfMo = 0.0, sfCv = 0.0;   // sfMo: lượng rêu 0–1 (lá rêu mọc theo — nature/moss-lawn.js) · sfCv: mật độ hốc khuất của vỏ (bóng hốc — core/sky-shade.js cav)
              {
                vec3 wn = normalize(vSfN); float wf = 1.0 - smoothstep(0.55, 0.85, abs(wn.y));   // mặt đứng
                vec2 tg = abs(wn.y) < 0.9 ? normalize(vec2(-wn.z, wn.x) + 1e-5) : vec2(1.0, 0.0);
                float u = dot(vSfP.xz, tg), y = vSfP.y;
                vec2 gq = vec2((vSfP.x * uSfG.x + uSfG.y) / ${GX}.0, (vSfP.z * uSfG.x + uSfG.z) / ${GZ}.0);
                float hA = y - texture2D(uSfH, gq).r;   // độ cao trên mặt đất
                vec3 c = diffuseColor.rgb;
                c *= 0.92 + 0.14 * sfN(vec2(u, y) * 0.45 + 7.0);   // loang tông lớn (kiểu vẽ tay)
                #if ${K} == 1
                  float pu = fract(u / 1.2), pv = fract(y / 0.6), sl = min(min(pu, 1.0 - pu) * 1.2, min(pv, 1.0 - pv) * 0.6), ln = 1.0 - smoothstep(0.0, 0.018, sl);
                  c *= (1.0 - 0.18 * ln) * (0.93 + 0.12 * sfN(vec2(u, y) * 1.3)) * (1.0 - 0.13 * smoothstep(0.6, 0.9, sfN(vec2(u * 3.2, y * 0.3))));   // mạch cốp pha · ố · vệt chảy
                  c += 0.025 * (sfN(vec2(u, y) * 22.0) - 0.5);
                  float moss = (1.0 - smoothstep(0.0, 0.45, hA)) * smoothstep(0.35, 0.75, sfN(vec2(u, y) * 2.2 + 3.0)) * wf;
                  c = mix(c, c * vec3(0.62, 0.78, 0.46), 0.55 * moss);   // rêu chân bê tông
                  sfHg = -0.004 * ln + 0.0007 * sfN(vec2(u, y) * 30.0);
                #elif ${K} == 2
                  c *= (0.96 + 0.08 * sfN(vec2(u, y) * 2.4)) * (1.0 - 0.16 * smoothstep(0.55, 0.88, sfN(vec2(u * 2.0, y * 0.2))) * wf);   // lốm đốm · vệt nước mưa
                  c += 0.02 * (sfN(vec2(u, y) * 11.0) - 0.5);
                  sfHg = 0.0006 * sfN(vec2(u, y) * 16.0);
                #elif ${K} == 3
                  float bw = 0.15, bi = floor(u / bw), bf = fract(u / bw), ln = 1.0 - smoothstep(0.0, 0.07, min(bf, 1.0 - bf));
                  c *= (0.86 + 0.16 * sfR(vec2(bi, 3.1))) * (0.93 + 0.09 * sfN(vec2(u * 42.0, y * 1.5 + bi * 5.0))) * (1.0 - 0.38 * ln * wf);   // tông từng tấm · thớ · mạch ván
                  sfHg = -0.004 * ln * wf + 0.0005 * sfN(vec2(u * 60.0, y * 2.0));
                #elif ${K} == 5
                  // VỎ CÂY: rãnh nứt DỌC thân = đường đồng mức của nhiễu kéo dài theo thân (~12 ô quanh thân, uốn lượn) ⇒ rãnh hẹp tối, mảng vỏ ở giữa; nứt
                  // ngang thưa chia mảng; rêu ở gốc. Rãnh lõm thật (bump). Nhiễu quanh thân đều TUẦN HOÀN (sfNw, chu kỳ = số ô quanh thân) ⇒ không đường may.
                  // aBk.z = bm (số lần lặp 12 rãnh quanh thân) + phần lẻ = bán kính (× 0,5 m, barkTubes) — lưới cũ không có ⇒ coi như cành vừa.
                  // học bản quét "Tree 3D Scan - Retopo" (grafi, CC-BY-4.0, chỉ xem): nền xám nâu nứt sâu tối · ĐỊA Y VẢY xám trắng–xanh nhạt loang
                  // MẢNG LỚN mép lấm tấm (phủ ~30–40% mặt vỏ, không vào rãnh) · CHẤM ĐỊA Y VÀNG cam (Xanthoria) thưa · loang tảo lục mờ · cành non xám
                  // sáng, nhẵn, ít rãnh. uSfL = độ phủ địa y theo cây (mat.userData.sfL: cổ thụ nhiều, anh đào ít).
                  float bm = max(1.0, floor(vSfB.z + 0.5)), tR = vSfB.z > 0.5 ? clamp(vSfB.z - bm + 0.49, 0.0, 1.0) : 0.4, thin = 1.0 - smoothstep(0.08, 0.3, tR);
                  float ba = vSfB.x * 12.0, bl = vSfB.y * 1.6, bw = 1.4 * sfNw(vec2(ba * 0.5, bl * 0.7), 6.0 * bm);
                  float cr = max(sfLn(sfNw(vec2(ba + bw, bl * 0.45), 12.0 * bm), 0.015, 0.085), 0.75 * sfLn(sfNw(vec2(ba * 2.0 + bw + 4.0, bl * 0.8), 24.0 * bm), 0.01, 0.06));
                  float hc = sfLn(sfNw(vec2(ba * 0.5 + 3.0, bl * 2.4), 6.0 * bm), 0.015, 0.05) * step(0.5, sfNw(vec2(ba * 0.5, bl * 0.8) + 9.0, 6.0 * bm));
                  float gv = max(cr, 0.7 * hc) * (1.0 - 0.6 * thin), pl = sfNw(vec2(ba, bl * 1.1) + 2.0, 12.0 * bm);
                  float mG = gv, mC = 0.0;   // rãnh · lòng hốc (rêu mặt trên)
                  if (uSfOld > 0.5) {   // cổ thụ bản mới trông giả, trả về bản cũ: vân thủ tục BẢN TRƯỚC (rãnh nứt + đốm địa y nhỏ + rêu gốc)
                    float g0 = max(cr, 0.7 * hc); c *= mix(0.95 + 0.14 * pl, 0.4, g0);
                    float rope = step(0.01, vSfD), gr = max(0.0, vSfD - 0.02) / 0.98, gd = smoothstep(0.22, 0.85, gr), crown = 1.0 - smoothstep(0.0, 0.18, gr), cav = smoothstep(1.05, 1.4, gr);   // sợi bện (barkTubes rope, vSfD > 0,01)
                    c *= mix(1.0, mix(1.06 + 0.24 * crown + 0.08 * pl, 0.28, gd) * (1.0 - 0.7 * cav), rope);   // chỉ đáy rãnh giữa 2 sợi tối · sống sợi mòn sáng · lòng hốc mục gần đen
                    float fb = rope * sfLn(sfNw(vec2(ba * 3.0 + 0.6 * bw, bl * 0.35), 36.0 * bm), 0.015, 0.07);   // thớ sợi dài mảnh chạy xoắn theo sợi (vSfB.x đã cộng độ xoắn)
                    c *= 1.0 - 0.14 * fb * (1.0 - gd); sfHg -= 0.003 * fb;
                    c = mix(c, vec3(0.40, 0.46, 0.34), 0.3 * sfSp(sfNwF(vec2(ba * 2.0, bl * 12.0) + 11.0, 24.0 * bm), 0.78, 0.92) * (1.0 - g0));
                    sfMo = uSfMs * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));   // rêu chân thân (uSfMs = mat.userData.sfMoss: cành chết 0,35 · rễ 1,35) — màu tô chung bên dưới
                    sfHg = -0.012 * g0 + 0.003 * pl; mG = gd; mC = cav;
                  } else {
                  #ifdef SF_APPLE
                  {   // VỎ TÁO NỨT VẢY: GỜ + RÃNH DỌC lớn (trùng rãnh khoét trên lưới — nature/flowers-trees.js appleRidge), trên đó vảy dài: gờ phong hoá xám sáng,
                      // lòng rãnh tối nâu · khe giữa vảy rộng hẹp theo đoạn, khe ngang hay đứt (vảy dính nhau): thành khe vỏ trong nâu đỏ, đáy gần đen · mép vảy cong
                      // bắt sáng · vảy bong một phần (mép lởm chởm) lộ vỏ trong nâu cam · cành nhỏ nhẵn xám · địa y thưa ngoài khe · rêu gốc như cũ
                    vec4 ap = sfApple(vSfB.x, vSfB.y, bm); vec3 c0 = c; float e = ap.x, gA = smoothstep(0.06, 0.3, tR), fur = 1.0 - smoothstep(0.22, 0.5, sfARidge(vSfB.x, vSfB.y, bm));
                    float n1 = sfNw(vec2(ba * 16.0, bl * 60.0), 192.0 * bm), n2 = sfNw(vec2(ba * 5.0, bl * 18.0) + 7.0, 60.0 * bm);   // sần vảy ~1 cm · loang ~3 cm
                    float wv = ap.w * (0.35 + 1.1 * sfNw(vec2(ba * 1.5, bl * 2.0) + 3.0, 18.0 * bm)) * (0.7 + 0.8 * fur), op = step(0.04, wv) * gA;   // độ mở khe: dọc rộng, ngang mảnh, theo đoạn · lòng rãnh mở rộng
                    float H = 0.02 + 0.16 * min(wv, 1.2);   // nửa bề rộng khe (đv ô ≈ 5 cm ⇒ 1–9 mm)
                    float crk = (1.0 - smoothstep(0.55 * H, H, e)) * op, deep = (1.0 - smoothstep(0.0, 0.45 * H, e)) * op;   // lòng khe · đáy khe
                    float ao = (1.0 - smoothstep(H, 2.2 * H + 0.03, e)) * op;   // thành khe dốc: tối dần từ mép vảy xuống
                    float wall = ao * (1.0 - crk) * smoothstep(0.3, 0.55, n2);   // thành khe vừa bong: vệt vỏ trong cam dọc mép khe
                    float rim = smoothstep(2.2 * H + 0.03, 2.2 * H + 0.07, e) * (1.0 - smoothstep(2.2 * H + 0.08, 2.2 * H + 0.2, e)) * op * (0.4 + 0.6 * fract(ap.y * 13.7));   // mép vảy cong lên bắt sáng
                    float fl = step(ap.y, 0.22) * smoothstep(0.5, 0.66, 0.6 * sfNw(vec2(ba * 3.0, bl * 20.0) + ap.y * 40.0, 36.0 * bm) + 0.4 * sfNw(vec2(ba * 9.0, bl * 60.0) + 5.0, 108.0 * bm)) * gA * smoothstep(0.04, 0.12, e);   // vảy bong một phần
                    vec3 plate = c0 * mix(vec3(1.22, 1.18, 1.14), vec3(1.02, 0.86, 0.88), ap.z) * (0.94 + 0.12 * fract(ap.y * 7.31));
                    plate *= mix(1.22, 0.62, fur) * (0.86 + 0.14 * smoothstep(0.05, 0.45, e)) * (0.8 + 0.26 * n1) * (0.9 + 0.2 * n2) * (0.93 + 0.14 * sfNw(vec2(ba * 8.0, bl * 40.0), 96.0 * bm));   // gờ phong hoá xám sáng · rãnh tối · sần · thớ dọc
                    plate = mix(plate, vec3(dot(plate, vec3(0.3, 0.59, 0.11))) * 1.08, 0.35 * (1.0 - fur) * smoothstep(0.4, 0.7, n2));   // mặt gờ bạc màu xám
                    plate = mix(plate, c0 * vec3(1.65, 1.0, 0.64) * (0.8 + 0.35 * n1), max(fl, 0.75 * wall));   // vỏ trong nâu cam: chỗ vảy bong + thành khe
                    c = mix(c0 * vec3(1.28, 1.24, 1.2) * (0.94 + 0.12 * pl), plate, gA);   // cành non nhẵn xám ↔ thân nứt vảy
                    c = mix(c, c * 1.25 + c0 * 0.08, 0.6 * rim * (1.0 - fl)); c *= 1.0 - 0.55 * ao * (1.0 - crk);   // thành khe khuất sáng
                    c = mix(c, c0 * vec3(0.5, 0.27, 0.2), crk); c = mix(c, c0 * 0.06, 0.92 * deep);   // lòng khe nâu đỏ · đáy gần đen
                    float lm = 0.62 * sfNw(vec2(ba * 0.5, bl * 4.0) + 13.0, 6.0 * bm) + 0.38 * sfNw(vec2(ba * 1.5, bl * 12.0) + 17.0, 18.0 * bm);
                    float lp = smoothstep(0.66 - 0.06 * uSfL, 0.73 - 0.05 * uSfL, lm) * (1.0 - crk) * (1.0 - 0.6 * fur) * (0.68 + 0.32 * sfNwF(vec2(ba * 6.0, bl * 40.0), 72.0 * bm));
                    c = mix(c, uSfLC * c0 * 4.2, 0.45 * min(1.0, uSfL) * lp);   // địa y xám xanh thưa trên gờ
                    sfMo = uSfMs * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));   // rêu chân thân
                    sfHg = -0.006 * ao - 0.005 * crk - 0.004 * deep + 0.0014 * smoothstep(0.05, 0.4, e) * gA + 0.0012 * rim - 0.0012 * fl + 0.0008 * n1 * gA + 0.0015 * lp; mG = max(crk, fur * gA);
                  }
                  #else
                  c *= mix(0.95 + 0.14 * pl, 0.3, gv);
                  c = mix(c, c * 1.3 + vec3(0.05, 0.05, 0.045), 0.7 * thin);   // cành non: xám sáng
                  float lm = 0.62 * sfNw(vec2(ba * 0.5, bl * 4.0) + 13.0, 6.0 * bm) + 0.38 * sfNw(vec2(ba * 1.5, bl * 12.0) + 17.0, 18.0 * bm);   // mảng gần tròn (hơi dài theo thân)
                  float lp = smoothstep(0.6 - 0.08 * uSfL, 0.68 - 0.06 * uSfL, lm) * (1.0 - gv) * (0.68 + 0.32 * sfNwF(vec2(ba * 6.0, bl * 40.0), 72.0 * bm));
                  c = mix(c, uSfLC * (0.9 + 0.2 * pl), min(1.0, 0.7 * uSfL) * lp);   // địa y vảy (mặc định xám trắng–xanh; cổ thụ: nâu đen)
                  c = mix(c, vec3(0.86, 0.6, 0.12), 0.9 * sfSp(sfNwF(vec2(ba * 3.0, bl * 30.0) + 23.0, 36.0 * bm), 0.955, 0.985) * (1.0 - gv) * min(1.0, uSfL));   // địa y vàng
                  c = mix(c, c * vec3(0.84, 0.95, 0.66), 0.4 * uSfL * smoothstep(0.45, 0.8, sfNw(vec2(ba * 0.25, bl * 0.5) + 29.0, 3.0 * bm)));   // tảo lục
                  sfMo = uSfMs * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));   // rêu chân thân
                  sfHg = -0.014 * gv + 0.003 * pl + 0.0025 * lp;
                  if (uSfTk > 0.5) {   // ảnh vỏ quét: 3 ô quanh mỗi bm, ~0,75 m dọc / ô (lặp gương dọc) · nhuộm theo cây · cổ thụ: mảng địa y sáng → nâu đen (uSfDk)
                    vec3 bt = texture2D(uSfT, vec2(vSfB.x * 3.0, vSfB.y * 1.2)).rgb; float bL = dot(bt, vec3(0.3, 0.59, 0.11));
                    vec3 ct = bt * uSfTt * (1.0 + 0.25 * thin); ct = mix(ct, ct * vec3(0.34, 0.23, 0.15) + uSfLC * 0.3, uSfDk * smoothstep(0.14, 0.3, bL));   // nhuộm nâu đen, giữ vân
                    ct = mix(ct, vec3(0.30, 0.40, 0.18), 0.5 * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm)));   // rêu gốc
                    c = ct; sfHg = 0.03 * (bL - 0.2);   // mảng địa y nổi, khe vỏ lõm
                  }
                  #endif
                  }
                  // RÊU MẶT TRÊN — học bản quét "Tree Scan Free" (Epic_Tree_Store, CC-BY-4.0, chỉ đo màu theo pháp tuyến): rêu chỉ ở mặt hướng trời — mặt dưới ~0%,
                  // sườn trên thân ngả ~10%, nóc chạc ~26%, cành nhỏ ít; mặt dưới cành tối hơn mặt trên ~35% (bóng sẵn trong ảnh quét). uSfTm = mat.userData.sfTop
                  // (độ phủ: cổ thụ / cây con / rễ 1 · khúc gỗ chết nằm 1,8 · cây táo, anh đào 0 = không rêu); uSfMs = độ đậm (rễ 0,45, cành chết 0,35);
                  // uSfTw = userData.sfTopW: hạt đệm rêu theo toạ độ thế giới (vật đứng yên có vân vỏ thưa — khúc gỗ bm 1 thì hạt theo vân bị kéo thành sọc ngang)
                  // RÊU THEO NGHIÊN CỨU (nghiên cứu cách rêu phủ và màu rêu): rêu chiếm hốc khuất ẩm — gốc thân + ~3 m dưới, phía khuất nắng;
                  //  địa y lên cao + phía nắng (Killarney NP, 75 cây; cây lá kim BC: rêu phủ 3 m dưới thân) · nước mưa chảy dọc thân theo rãnh vỏ (stemflow) nuôi vệt rêu
                  //  xuống gốc · rêu hút ẩm thụ động (poikilohydric): màu + dáng đổi mạnh theo độ ẩm — ướt xanh thẫm tươi, khô xỉn ô liu, sợi co lại · mảng theo loài:
                  //  thảm bóng vàng xanh (rêu bò, pleurocarp), đệm xanh thẫm có cuống bào tử đỏ nâu (rêu mọc thẳng, acrocarp), đệm xám trắng (kiểu Leucobryum)
                  float nf = dot(normalize(wn.xz + 1e-4), uSfNo) * (1.0 - abs(wn.y)), pz = sfN(vSfP.xz * 0.35 + 3.7);
                  float sfl = smoothstep(0.66, 0.82, sfNw(vec2(ba * 1.2 + 0.7 * bw, bl * 0.12) + 41.0, 12.0 * bm)) * (0.5 + 0.5 * mG) * (1.0 - smoothstep(0.6, 7.0, hA)) * smoothstep(0.1, 0.5, tR);   // vệt nước chảy dọc thân
                  sfMo = max(sfMo * (1.0 + 0.35 * nf), 0.85 * sfl * uSfMs * step(0.01, uSfTm));
                  // rêu lan từ HỐC KHUẤT (kẽ 2 rễ, chân rễ sát đất, rễ ôm đá, nách thân) ra ngoài
                  //  thành thuỳ loang không đều — mật độ vật rắn quanh điểm (uSfCv: mặt trống ~0,5, kẽ ~0,7) + nhiễu thuỳ ~0,7 m và ~20 cm làm mép lan lồi lõm
                  vec3 cq = (vSfP + wn * 0.06 - uSfCv0) * uSfCv1; float cv = all(greaterThan(cq, vec3(0.02))) && all(lessThan(cq, vec3(0.98))) ? texture(uSfCv, cq).r : 0.0; sfCv = cv;
                  float cvM = smoothstep(0.0, 0.12, cv - 0.47 + 0.3 * (sfN(vSfP.xz * 1.4 + vSfP.y * 0.8 + 51.0) - 0.5) + 0.14 * (sfN(vSfP.xz * 5.0 + vSfP.y * 3.3 + 9.0) - 0.5)) * step(0.01, cv) * (1.0 - smoothstep(1.4, 3.2, hA)) * step(0.01, uSfTm);
                  vec3 an = abs(wn); vec2 sq = an.y > max(an.x, an.z) ? vSfP.xz : an.x > an.z ? vSfP.yz : vSfP.xy;
                  sfMo = max(sfMo, cvM * min(1.0, uSfMs));
                  // (thảm cỏ ngắn quanh 2 gốc cây x104 z107 — nature/meadow.js): rêu = thảm xanh vàng tươi
                  //  mịn, tương phản thấp (gốc sợi ~0,8 ngọn như gốc lá cỏ = màu đất, ngọn sáng ấm hơn), sáng theo mặt nền, không in vân vỏ; trước: 3 loài ô liu / thẫm / xám
                  //  gốc sợi gần đen ⇒ lấm tấm tối
                  vec3 mT = vec3(0.2, 0.3, 0.07) * (0.94 + 0.12 * pz) * mix(vec3(1.05, 1.0, 0.86), vec3(0.92, 1.02, 0.96), uSfWet);   // khô ngả vàng nhẹ · ướt thẫm nhẹ
                  c = mix(c, mT * 0.85, min(1.0, 0.8 * sfMo));
                  if (uSfTm > 0.0) {
                    float mf = mix(sfNwF(vec2(ba * 1.5, bl * 12.0), 18.0 * bm), mix(sfN(vSfP.xz * 24.0 + vSfP.y * 5.0), 0.5, smoothstep(0.3, 0.8, 24.0 * length(fwidth(vSfP)))), uSfTw), mu = smoothstep(0.3, 0.9, wn.y) * smoothstep(0.08, 0.6, tR) * (1.0 - mC) * smoothstep(0.55, 0.68, 0.65 * sfNw(vec2(ba * 0.5, bl * 0.8) + 31.0, 6.0 * bm) + 0.35 * sfNw(vec2(ba * 2.0, bl * 3.0) + 37.0, 24.0 * bm) + 0.25 * wn.y + 0.12 * mG + 0.2 * mf + 0.25 * uSfTm + 0.12 * (1.0 - smoothstep(0.6, 8.0, hA)) + 0.08 * nf - 0.51);   // mf: đệm rêu ~5 cm ⇒ mép mảng lấm tấm · rêu bám rãnh (ẩm)
                    c = mix(c * mix(0.8, 1.04, smoothstep(-0.7, 0.4, wn.y)), mix(mT * 0.8, mT * 0.97, mf), min(1.0, 0.9 * mu * uSfMs));
                    sfHg += 0.003 * mu; sfMo = max(sfMo, mu * min(1.0, uSfMs * 1.1));
                  }
                  float cuF = length(fwidth(sq)), cu = sfMo > 0.1 ? 0.8 * mix(sfCush(sq * 8.0), 0.3, smoothstep(0.04, 0.1, cuF)) + 0.2 * mix(sfCush(sq * 26.0 + 11.0), 0.3, smoothstep(0.012, 0.03, cuF)) : 0.0;   // gợn 4 cm / đệm 12 cm nhỏ hơn ~1 điểm ảnh ⇒ về trung bình (không nhấp nháy)   // đệm ~12 cm + gợn ~4 cm (cùng toạ độ với sợi thảm; chỉ tính chỗ có rêu — mọi vỏ cây trong rừng chạy đoạn này)
                  c = mix(c, mix(mT * 0.82, mT, cu), min(1.0, 0.92 * cvM * uSfMs));   // rêu hốc khuất phủ dày
                  float cuM = smoothstep(0.2, 0.6, sfMo); c *= mix(1.0, 0.9 + 0.16 * cu, cuM); sfHg = sfHg * (1.0 - 0.8 * cuM) + 0.004 * cu * cuM;   // đệm rêu: cục hơi sáng, kẽ hơi tối, gồ nhẹ (bump) · rêu phủ thì vân vỏ bên dưới mờ đi
                #endif
                #if ${K} < 5
                float wAl, wMo = sfWallMo(vSfP, wn, hA, uSfNo, wAl) * wf;   // RÊU CHÂN TƯỜNG (SF_WALLMO): lượng rêu · màng tảo
                if (uSfOM > 0.5) { wMo = sfOldMo(vSfP, wn, hA, uSfNo, ${SF_WALL_T[K < 5 ? K : 0].toFixed(2)}) * wf; wAl = 0.0; }   // đập: vị trí rêu cũ (nature/dam-moss.js)
                #endif
                float ao = mix(0.56, 1.0, smoothstep(0.0, 1.3, hA));   // chân tường tối dần + ám bẩn nâu
                c *= mix(1.0, ao, wf); c = mix(c, c * vec3(0.86, 0.77, 0.64), (1.0 - smoothstep(0.0, 0.8, hA)) * 0.6 * wf);
                c *= 1.0 + 0.08 * smoothstep(1.5, 6.0, hA) * wf;   // cao lên sáng dần
                #if ${K} < 5
                {   // tảo lục mờ trên dải · thảm rêu = màu + đệm như rêu trên vỏ cây (sau lớp tối chân tường: lá rêu mọc trên đó không tối theo), gồ nhẹ, vân tường bên dưới mờ đi
                  vec2 wq = vec2(u, y); float wcF = length(fwidth(wq)), wcu = wMo > 0.002 ? sfMossCu(wq, wcF) : 0.0; wMo = smoothstep(0.32, 0.62, 0.7 * wMo + 0.25 * (wcu - 0.45)) * step(0.002, wMo);
                  c = mix(c, c * vec3(0.74, 0.83, 0.64), min(1.0, wAl) * wf);
                  vec3 mW = sfMossT(vSfP, uSfWet) * (0.8 + 0.2 * smoothstep(0.0, 0.3, hA));   // sát đất hơi tối
                  c = mix(c, mix(mW * 0.8, mW, wcu), wMo); sfHg = sfHg * (1.0 - 0.8 * wMo) + 0.004 * wcu * wMo;
                }
                #endif
                diffuseColor.rgb = c;
              }`).replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n              normal = sfBump(normal, -vViewPosition, sfHg);');
          };
          const prevKey = mat.customProgramCacheKey.bind(mat); mat.customProgramCacheKey = () => prevKey() + '|sf' + K + (mat.userData.sfApple ? 'a' : '');
          return mat;
        }
        // THẢM RÊU PHỦ LÊN VẬT LIỆU THƯỜNG (vách đất bờ sông, tường đầu cửa xả, đá hộc — nature/bank-moss.js): cùng màu + đệm + gồ như rêu trên vỏ cây và chân tường.
        //  o.mo = biểu thức GLSL lượng rêu 0–1 (đọc vMcP / vMcN: vị trí, pháp tuyến thế giới; mcQ / mcF: toạ độ đệm + cỡ điểm ảnh), o.sq = toạ độ đệm (GLSL),
        //  o.fHead / o.vHead / o.vMain: khai báo + dòng thêm ở shader điểm ảnh / đỉnh, o.tint: dòng GLSL tô trước lớp rêu (vd. vệt tảo), o.uniforms
        const mossBladeSrc = [];   // nguồn lá rêu thêm: hàm (push, DENS) gọi lúc dựng thảm rêu (nature/moss-lawn.js); push(x, y, z, nx, ny, nz, lượng rêu, hệ số cao min, max)
        function mossCoat(mat, key, o) {
          const prev = mat.onBeforeCompile;
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r); Object.assign(sh.uniforms, o.uniforms || {}, { uSfWet: SF_WET });
            sh.vertexShader = 'varying vec3 vMcP; varying vec3 vMcN;\n' + (o.vHead || '') + '\n' + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
              vec3 mcN = objectNormal;
              #ifdef USE_INSTANCING
                mcN = mat3(instanceMatrix) * mcN;
              #endif
              vMcP = (inverse(viewMatrix) * vec4(mvPosition.xyz, 1.0)).xyz; vMcN = normalize(mat3(modelMatrix) * mcN);${o.vMain || ''}`);
            sh.fragmentShader = 'varying vec3 vMcP; varying vec3 vMcN; uniform float uSfWet;\n' + SF_NOISE + SF_MOSS + (o.fHead || '') + '\n' + sh.fragmentShader
              .replace('#include <color_fragment>', `#include <color_fragment>
                vec2 mcQ = ${o.sq}; float mcF = length(fwidth(mcQ)), mcHg = 0.0;   // đạo hàm tính ngoài nhánh (luồng đều)
                ${o.tint || ''}
                { float mo = ${o.mo}; if (mo > 0.002) { float cu = sfMossCu(mcQ, mcF); vec3 mT = sfMossT(vMcP, uSfWet); diffuseColor.rgb = mix(diffuseColor.rgb, mix(mT * 0.8, mT, cu), mo); mcHg = 0.004 * cu * mo; } }`)
              .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n                normal = sfBump(normal, -vViewPosition, mcHg);');
          };
          const pk = mat.customProgramCacheKey.bind(mat); mat.customProgramCacheKey = () => pk() + '|moss:' + key; mat.needsUpdate = true;
          return mat;
        }
        surfaceStyle(concreteMat, 'concrete');
