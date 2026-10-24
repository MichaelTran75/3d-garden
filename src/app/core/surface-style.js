        // ===== CHẤT LIỆU CÔNG TRÌNH (G 17/10 "study these glb and improve our building and structure render style"; mẫu: nhà hàng "Inakaya" — Jellepostma,
        //  CC-BY-4.0 · "Forest House" — peachyroyalty, CC-BY-NC-4.0; chỉ xem để học, không nhúng). Khác biệt lớn nhất với khối phẳng của mình nằm ở CHẤT LIỆU
        //  vẽ trên bề mặt: ván dọc có mạch, tông từng tấm lệch nhau, thớ gỗ · bê tông có mạch cốp pha, loang ố, vệt chảy · tường vữa lốm đốm, VỆT NƯỚC MƯA
        //  dọc tường · chân tường BẨN + TỐI DẦN như vẽ bóng sẵn (painted AO), cao lên sáng dần · rêu xanh ở chân bê tông. Làm bằng shader thủ tục theo toạ
        //  độ thế giới (không ảnh, không thêm lưới): độ cao trên mặt đất đọc từ ẢNH ĐỘ CAO ĐỊA HÌNH (1 điểm ảnh = 1 ô lưới 0,6 m, dựng 1 lần từ cowY lúc
        //  biên dịch shader đầu tiên) ⇒ 1 vật liệu dùng chung nhiều nhà vẫn đúng chân tường từng nhà; mạch ván / cốp pha lõm thật (bump theo đạo hàm màn
        //  hình). Vật liệu có shader riêng thì lớp gộp lượt vẽ để riêng (vẽ thẳng, nhà đã gộp tĩnh theo vật liệu nên chỉ thêm vài lượt) ----
        let SF_H = null;
        // ảnh vân vỏ THẬT cắt từ bản quét "Tree 3D Scan - Retopo" (grafi, CC-BY-4.0; G 17/10 "nếu 3D thì apply vào luôn"): 4 dải vỏ thân ghép ngang
        // (160 × 480, src/models/bark-scan.jpg, tải sau khi cảnh chạy, địa chỉ tuyệt đối Pages như mẫu drone). Chỉ vật liệu có userData.sfTex dùng ảnh;
        // chưa tải xong / tải lỗi (bản 1 tệp ngoại tuyến) thì vẫn vân thủ tục bên dưới
        const SF_BT = { value: null }, SF_BTK = { value: 0 }, SF_WET = { value: 0 }, SF_NO = { value: new THREE.Vector2(0, -1) };   // SF_WET: độ ẩm rêu (nature/clouds-rain.js) · SF_NO: hướng bắc (xz)
        function sfBarkTex() {
          if (SF_BT.loading) return; SF_BT.loading = 1;
          ldTrack(new Promise(ldR => new THREE.TextureLoader().load(window.__barkTex || 'https://michaeltran75.github.io/3d-garden/models/bark-scan.jpg', t => {
            t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 4; SF_BT.value = t; SF_BTK.value = 1; ldR(); }, undefined, ldR)));
        }
        const SF_KIND = { concrete: 1, stucco: 2, boards: 3, woodAO: 4, bark: 5 };
        const SF_WALL_T = [0, 1.31, 0.64, 0.94, 0.98];   // ngưỡng mảng rêu tường theo loại (bê tông · vữa · ván · gỗ chuồng) ⇒ mỗi loại phủ ~5% mặt đứng (lấy mẫu theo diện tích trên tường thật trong cảnh)
        function sfHeightTex() {   // cowY tại tâm từng ô lưới GX × GZ (nước: mặt nước) — đọc lân cận gần nhất trong shader
          const d = new Float32Array(GX * GZ);
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) d[i + j * GX] = cowY(wx(i), wz(j));
          const t = new THREE.DataTexture(d, GX, GZ, THREE.RedFormat, THREE.FloatType); t.magFilter = t.minFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
        }
        const SF_GLSL = `
          uniform sampler2D uSfH; uniform vec4 uSfG; uniform float uSfL; uniform vec3 uSfLC; uniform sampler2D uSfT; uniform float uSfTk; uniform vec3 uSfTt; uniform float uSfDk; uniform float uSfOld; uniform float uSfMs; uniform float uSfTm; uniform float uSfTw; uniform float uSfSh; uniform float uSfWet; uniform vec2 uSfNo; varying vec3 vSfP; varying vec3 vSfN;
          #ifdef SF_SHELL
          uniform float uShW; varying float vShL;
          #endif
          float sfR(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float sfN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(sfR(i), sfR(i + vec2(1.0, 0.0)), f.x), mix(sfR(i + vec2(0.0, 1.0)), sfR(i + vec2(1.0, 1.0)), f.x), f.y); }
          float sfNw(vec2 p, float P) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float i0 = mod(i.x, P), i1 = mod(i.x + 1.0, P);   // nhiễu tuần hoàn theo x (chu kỳ P ô) — vòng quanh thân không lộ đường may
            return mix(mix(sfR(vec2(i0, i.y)), sfR(vec2(i1, i.y)), f.x), mix(sfR(vec2(i0, i.y + 1.0)), sfR(vec2(i1, i.y + 1.0)), f.x), f.y); }
          vec3 sfBump(vec3 n, vec3 sp, float h) { vec3 dx = dFdx(sp), dy = dFdy(sp), r1 = cross(dy, n), r2 = cross(n, dx); float det = dot(dx, r1);
            return normalize(abs(det) * n - sign(det) * (dFdx(h) * r1 + dFdy(h) * r2)); }`;
        function surfaceStyle(mat, kind) {
          const K = SF_KIND[kind], prev = mat.onBeforeCompile;
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r);
            SF_H = SF_H || sfHeightTex();
            sh.uniforms.uSfH = { value: SF_H }; sh.uniforms.uSfG = { value: new THREE.Vector4(1 / BLOCK, cx, cz, 0) }; sh.uniforms.uSfL = { value: mat.userData.sfL ?? 1 }; const U = mat.userData; if (K === 5 && U.sfTex) sfBarkTex(); sh.uniforms.uSfT = SF_BT; sh.uniforms.uSfTk = U.sfTex ? SF_BTK : { value: 0 }; sh.uniforms.uSfSh = { value: U.sfShell ? 1 : 0 }; sh.uniforms.uSfWet = SF_WET; sh.uniforms.uSfNo = SF_NO; SF_NO.value.set(SKY_NORTH.x, SKY_NORTH.z).normalize(); sh.uniforms.uSfTt = { value: U.sfTint || new THREE.Vector3(1, 1, 1) }; sh.uniforms.uSfDk = { value: U.sfDk || 0 }; sh.uniforms.uSfOld = { value: U.sfOld ? 1 : 0 }; sh.uniforms.uSfMs = { value: U.sfMoss ?? 1 }; sh.uniforms.uSfTm = { value: U.sfTop ?? (U.sfOld ? 1 : 0) }; sh.uniforms.uSfTw = { value: U.sfTopW ? 1 : 0 }; sh.uniforms.uSfLC = { value: mat.userData.sfLC || new THREE.Color(0.58, 0.6, 0.53) };   // màu mảng loang (địa y) theo cây
            // chèn ở fog_vertex (cuối shader): vị trí thế giới lấy ngược từ mvPosition ⇒ đúng cả khi shader gió đã thay project_vertex (cây đung đưa)
            sh.vertexShader = 'varying vec3 vSfP; varying vec3 vSfN;\n#ifdef SF_SHELL\nuniform float uShL, uShS; varying float vShL;\n#endif\n' + (K === 5 ? 'attribute vec3 aBk; varying vec3 vSfB; attribute float aBd; varying float vSfD;\n' : '') + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef SF_SHELL\n vShL = (float(gl_InstanceID) + 1.0) * uShS; transformed += objectNormal * (vShL * uShL);\n#endif').replace('#include <fog_vertex>', `#include <fog_vertex>${K === 5 ? '\n vSfB = aBk; vSfD = aBd;' : ''}
              vec3 sfN3 = objectNormal;
              #ifdef USE_INSTANCING
                sfN3 = mat3(instanceMatrix) * sfN3;
              #endif
              vSfP = (inverse(viewMatrix) * vec4(mvPosition.xyz, 1.0)).xyz; vSfN = normalize(mat3(modelMatrix) * sfN3);`);
            sh.fragmentShader = SF_GLSL + (K === 5 ? '\nvarying vec3 vSfB; varying float vSfD;' : '') + '\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
              float sfHg = 0.0, sfMo = 0.0;   // sfMo: lượng rêu 0–1 (thảm rêu nhung — nature/moss-shells.js)
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
                  // G 17/10 học bản quét "Tree 3D Scan - Retopo" (grafi, CC-BY-4.0, chỉ xem): nền xám nâu nứt sâu tối · ĐỊA Y VẢY xám trắng–xanh nhạt loang
                  // MẢNG LỚN mép lấm tấm (phủ ~30–40% mặt vỏ, không vào rãnh) · CHẤM ĐỊA Y VÀNG cam (Xanthoria) thưa · loang tảo lục mờ · cành non xám
                  // sáng, nhẵn, ít rãnh. uSfL = độ phủ địa y theo cây (mat.userData.sfL: cổ thụ nhiều, anh đào ít).
                  float bm = max(1.0, floor(vSfB.z + 0.5)), tR = vSfB.z > 0.5 ? clamp(vSfB.z - bm + 0.49, 0.0, 1.0) : 0.4, thin = 1.0 - smoothstep(0.08, 0.3, tR);
                  float ba = vSfB.x * 12.0, bl = vSfB.y * 1.6, bw = 1.4 * sfNw(vec2(ba * 0.5, bl * 0.7), 6.0 * bm);
                  float cr = max(1.0 - smoothstep(0.015, 0.085, abs(sfNw(vec2(ba + bw, bl * 0.45), 12.0 * bm) - 0.5)), 0.75 * (1.0 - smoothstep(0.01, 0.06, abs(sfNw(vec2(ba * 2.0 + bw + 4.0, bl * 0.8), 24.0 * bm) - 0.5))));
                  float hc = (1.0 - smoothstep(0.015, 0.05, abs(sfNw(vec2(ba * 0.5 + 3.0, bl * 2.4), 6.0 * bm) - 0.5))) * step(0.5, sfNw(vec2(ba * 0.5, bl * 0.8) + 9.0, 6.0 * bm));
                  float gv = max(cr, 0.7 * hc) * (1.0 - 0.6 * thin), pl = sfNw(vec2(ba, bl * 1.1) + 2.0, 12.0 * bm);
                  float mG = gv, mC = 0.0;   // rãnh · lòng hốc (rêu mặt trên)
                  if (uSfOld > 0.5) {   // G 17/10 "cây cổ thụ render tệ, nhìn giả, sửa lại về render cũ": vân thủ tục BẢN TRƯỚC (rãnh nứt + đốm địa y nhỏ + rêu gốc)
                    float g0 = max(cr, 0.7 * hc); c *= mix(0.95 + 0.14 * pl, 0.4, g0);
                    float rope = step(0.01, vSfD), gr = max(0.0, vSfD - 0.02) / 0.98, gd = smoothstep(0.22, 0.85, gr), crown = 1.0 - smoothstep(0.0, 0.18, gr), cav = smoothstep(1.05, 1.4, gr);   // sợi bện (barkTubes rope, vSfD > 0,01)
                    c *= mix(1.0, mix(1.06 + 0.24 * crown + 0.08 * pl, 0.28, gd) * (1.0 - 0.7 * cav), rope);   // chỉ đáy rãnh giữa 2 sợi tối · sống sợi mòn sáng · lòng hốc mục gần đen
                    float fb = rope * (1.0 - smoothstep(0.015, 0.07, abs(sfNw(vec2(ba * 3.0 + 0.6 * bw, bl * 0.35), 36.0 * bm) - 0.5)));   // thớ sợi dài mảnh chạy xoắn theo sợi (vSfB.x đã cộng độ xoắn)
                    c *= 1.0 - 0.14 * fb * (1.0 - gd); sfHg -= 0.003 * fb;
                    c = mix(c, vec3(0.40, 0.46, 0.34), 0.3 * smoothstep(0.78, 0.92, sfNw(vec2(ba * 2.0, bl * 12.0) + 11.0, 24.0 * bm)) * (1.0 - g0));
                    sfMo = uSfMs * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));   // rêu chân thân (uSfMs = mat.userData.sfMoss: cành chết 0,35 · rễ 1,35) — màu tô chung bên dưới
                    sfHg = -0.012 * g0 + 0.003 * pl; mG = gd; mC = cav;
                  } else {
                  c *= mix(0.95 + 0.14 * pl, 0.3, gv);
                  c = mix(c, c * 1.3 + vec3(0.05, 0.05, 0.045), 0.7 * thin);   // cành non: xám sáng
                  float lm = 0.62 * sfNw(vec2(ba * 0.5, bl * 4.0) + 13.0, 6.0 * bm) + 0.38 * sfNw(vec2(ba * 1.5, bl * 12.0) + 17.0, 18.0 * bm);   // mảng gần tròn (hơi dài theo thân)
                  float lp = smoothstep(0.6 - 0.08 * uSfL, 0.68 - 0.06 * uSfL, lm) * (1.0 - gv) * (0.68 + 0.32 * sfNw(vec2(ba * 6.0, bl * 40.0), 72.0 * bm));
                  c = mix(c, uSfLC * (0.9 + 0.2 * pl), min(1.0, 0.7 * uSfL) * lp);   // địa y vảy (mặc định xám trắng–xanh; cổ thụ: nâu đen)
                  c = mix(c, vec3(0.86, 0.6, 0.12), 0.9 * smoothstep(0.955, 0.985, sfNw(vec2(ba * 3.0, bl * 30.0) + 23.0, 36.0 * bm)) * (1.0 - gv) * min(1.0, uSfL));   // địa y vàng
                  c = mix(c, c * vec3(0.84, 0.95, 0.66), 0.4 * uSfL * smoothstep(0.45, 0.8, sfNw(vec2(ba * 0.25, bl * 0.5) + 29.0, 3.0 * bm)));   // tảo lục
                  sfMo = uSfMs * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm));   // rêu chân thân
                  sfHg = -0.014 * gv + 0.003 * pl + 0.0025 * lp;
                  if (uSfTk > 0.5) {   // ảnh vỏ quét: 3 ô quanh mỗi bm, ~0,75 m dọc / ô (lặp gương dọc) · nhuộm theo cây · cổ thụ: mảng địa y sáng → nâu đen (uSfDk)
                    vec3 bt = texture2D(uSfT, vec2(vSfB.x * 3.0, vSfB.y * 1.2)).rgb; float bL = dot(bt, vec3(0.3, 0.59, 0.11));
                    vec3 ct = bt * uSfTt * (1.0 + 0.25 * thin); ct = mix(ct, ct * vec3(0.34, 0.23, 0.15) + uSfLC * 0.3, uSfDk * smoothstep(0.14, 0.3, bL));   // nhuộm nâu đen, giữ vân
                    ct = mix(ct, vec3(0.30, 0.40, 0.18), 0.5 * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfNw(vec2(ba * 0.5, bl * 3.0) + 5.0, 6.0 * bm)));   // rêu gốc
                    c = ct; sfHg = 0.03 * (bL - 0.2);   // mảng địa y nổi, khe vỏ lõm
                  }
                  }
                  // RÊU MẶT TRÊN — G 19/10 học bản quét "Tree Scan Free" (Epic_Tree_Store, CC-BY-4.0, chỉ đo màu theo pháp tuyến): rêu chỉ ở mặt hướng trời — mặt dưới ~0%,
                  // sườn trên thân ngả ~10%, nóc chạc ~26%, cành nhỏ ít; mặt dưới cành tối hơn mặt trên ~35% (bóng sẵn trong ảnh quét). uSfTm = mat.userData.sfTop
                  // (độ phủ: cổ thụ / cây con / rễ 1 · khúc gỗ chết nằm 1,8 · cây táo, anh đào 0 = không rêu); uSfMs = độ đậm (rễ 0,45, cành chết 0,35);
                  // uSfTw = userData.sfTopW: hạt đệm rêu theo toạ độ thế giới (vật đứng yên có vân vỏ thưa — khúc gỗ bm 1 thì hạt theo vân bị kéo thành sọc ngang)
                  // RÊU THEO NGHIÊN CỨU (G 20/10 "do research về cách rêu phủ như thế nào, màu sắc"): rêu chiếm hốc khuất ẩm — gốc thân + ~3 m dưới, phía khuất nắng;
                  //  địa y lên cao + phía nắng (Killarney NP, 75 cây; cây lá kim BC: rêu phủ 3 m dưới thân) · nước mưa chảy dọc thân theo rãnh vỏ (stemflow) nuôi vệt rêu
                  //  xuống gốc · rêu hút ẩm thụ động (poikilohydric): màu + dáng đổi mạnh theo độ ẩm — ướt xanh thẫm tươi, khô xỉn ô liu, sợi co lại · mảng theo loài:
                  //  thảm bóng vàng xanh (rêu bò, pleurocarp), đệm xanh thẫm có cuống bào tử đỏ nâu (rêu mọc thẳng, acrocarp), đệm xám trắng (kiểu Leucobryum)
                  float nf = dot(normalize(wn.xz + 1e-4), uSfNo) * (1.0 - abs(wn.y)), pz = sfN(vSfP.xz * 0.35 + 3.7);
                  float sfl = smoothstep(0.66, 0.82, sfNw(vec2(ba * 1.2 + 0.7 * bw, bl * 0.12) + 41.0, 12.0 * bm)) * (0.5 + 0.5 * mG) * (1.0 - smoothstep(0.6, 7.0, hA)) * smoothstep(0.1, 0.5, tR);   // vệt nước chảy dọc thân
                  sfMo = max(sfMo * (1.0 + 0.35 * nf), 0.85 * sfl * uSfMs * step(0.01, uSfTm));
                  vec3 mT = pz < 0.4 ? vec3(0.36, 0.46, 0.07) : pz < 0.75 ? vec3(0.15, 0.33, 0.06) : vec3(0.4, 0.48, 0.34);   // màu ngọn theo loài
                  mT = mix(mix(mT, vec3(dot(mT, vec3(0.3, 0.59, 0.11))) * vec3(1.15, 1.0, 0.62), 0.32), mT * vec3(0.85, 1.05, 0.9), uSfWet);   // khô xỉn ô liu · ướt thẫm tươi
                  c = mix(c, mT * 0.6, min(1.0, 0.55 * sfMo));
                  if (uSfTm > 0.0) {
                    float mf = mix(sfNw(vec2(ba * 1.5, bl * 12.0), 18.0 * bm), sfN(vSfP.xz * 24.0 + vSfP.y * 5.0), uSfTw), mu = smoothstep(0.3, 0.9, wn.y) * smoothstep(0.08, 0.6, tR) * (1.0 - mC) * smoothstep(0.55, 0.68, 0.65 * sfNw(vec2(ba * 0.5, bl * 0.8) + 31.0, 6.0 * bm) + 0.35 * sfNw(vec2(ba * 2.0, bl * 3.0) + 37.0, 24.0 * bm) + 0.25 * wn.y + 0.12 * mG + 0.2 * mf + 0.25 * uSfTm + 0.12 * (1.0 - smoothstep(0.6, 8.0, hA)) + 0.08 * nf - 0.51);   // mf: đệm rêu ~5 cm ⇒ mép mảng lấm tấm · rêu bám rãnh (ẩm)
                    c = mix(c * mix(0.8, 1.04, smoothstep(-0.7, 0.4, wn.y)), mix(mT * 0.3, mT * 0.85, mf), min(1.0, 0.9 * mu * uSfMs));
                    sfHg += 0.003 * mu; sfMo = max(sfMo, mu * min(1.0, uSfMs * 1.1));
                  }
                  c = mix(c, mT * 0.12, 0.6 * uSfSh * smoothstep(0.25, 0.75, sfMo));   // có thảm sợi phủ trên: nền rêu là đáy thảm, tối
                  #ifdef SF_SHELL
                  {   // THẢM RÊU NHUNG — lớp vỏ thứ vShL (0–1 chiều cao thảm): mỗi ô ~1,3 cm 1 sợi, cao ngẫu nhiên theo lượng rêu, thon dần lên ngọn; gốc tối, ngọn vàng xanh, ánh nhung khi nhìn xiên
                    vec3 an = abs(wn), sp = vSfP - wn * (vShL * uShW); vec2 fq = (an.y > max(an.x, an.z) ? sp.xz : an.x > an.z ? sp.yz : sp.xy) * 75.0, fi = floor(fq);
                    bool st = pz >= 0.4 && pz < 0.75 && sfR(fi + 9.1) < 0.08 && sfMo > 0.4;   // cuống bào tử (rêu đệm): sợi mảnh cao hết thảm, nang ở ngọn
                    float fh = st ? 1.0 : (0.4 + 0.6 * sfR(fi)) * smoothstep(0.12, 0.7, sfMo) * (0.72 + 0.28 * uSfWet), k = vShL / max(fh, 1e-3);   // khô: sợi co lại
                    if (k > 1.0 || length(fract(fq) - 0.5 - 0.3 * (vec2(sfR(fi + 7.3), sfR(fi + 1.9)) - 0.5)) > (st ? (k > 0.78 ? 0.3 : 0.15) : 0.48 - 0.3 * k)) discard;
                    c = st ? (k > 0.78 ? vec3(0.3, 0.16, 0.05) : vec3(0.42, 0.12, 0.04)) : mix(mT * 0.12, mix(mT * 0.55, mT, k * k), 0.3 + 0.7 * k) * (0.85 + 0.3 * sfR(fi + 3.3));
                    c += vec3(0.08, 0.1, 0.02) * pow(1.0 - abs(dot(wn, normalize(cameraPosition - vSfP))), 3.0) * k * (0.5 + 0.5 * uSfWet);   // ánh nhung — ướt bóng hơn
                  }
                  #endif
                #endif
                #if ${K} < 5
                {   // RÊU TƯỜNG (G 23/10 "add 5% rêu lên tường building"): rêu / tảo bám chỗ ẩm lâu khô — mặt khuất nắng hướng bắc, chân tường (mưa bắn, ẩm leo),
                    // vệt nước chảy dọc tường, mặt thoát nước kém; rêu cần bề mặt xốp ẩm liên tục. Mảng loang theo các yếu tố đó, mép lấm tấm ⇒ phủ ~5% mặt đứng (SF_WALL_T)
                  float nfw = dot(normalize(wn.xz + 1e-4), uSfNo) * wf, spl = 1.0 - smoothstep(0.05, 0.9, hA);
                  float drp = smoothstep(0.62, 0.8, sfN(vec2(u * 2.6, y * 0.11) + 51.0)) * (1.0 - smoothstep(0.4, 3.5, hA));   // vệt nước chảy, nhạt dần lên cao
                  float pat = 0.42 * sfN(vec2(u, y) * 1.7 + 61.0) + 0.28 * sfN(vec2(u, y) * 5.3 + 67.0) + 0.6 * spl + 0.15 * nfw + 0.38 * drp;   // dồn ở chân tường + vệt nước (vữa: 65% rêu dưới 1,2 m)
                  float wm = smoothstep(${SF_WALL_T[K < 5 ? K : 0].toFixed(3)}, ${(SF_WALL_T[K < 5 ? K : 0] + 0.1).toFixed(3)}, pat) * wf * (0.55 + 0.45 * smoothstep(0.25, 0.6, sfN(vec2(u, y) * 19.0 + 71.0)));
                  vec3 mW = mix(vec3(0.27, 0.36, 0.09), vec3(0.15, 0.3, 0.07), sfN(vec2(u, y) * 0.8 + 77.0));   // thảm bóng vàng xanh ↔ đệm xanh thẫm
                  mW = mix(mix(mW, vec3(dot(mW, vec3(0.3, 0.59, 0.11))) * vec3(1.15, 1.0, 0.62), 0.32), mW * vec3(0.85, 1.05, 0.9), uSfWet);   // khô xỉn ô liu · ướt thẫm tươi
                  c = mix(c, mW, 0.8 * wm); sfHg += 0.0015 * wm;
                }
                #endif
                float ao = mix(0.56, 1.0, smoothstep(0.0, 1.3, hA));   // chân tường tối dần + ám bẩn nâu
                c *= mix(1.0, ao, wf); c = mix(c, c * vec3(0.86, 0.77, 0.64), (1.0 - smoothstep(0.0, 0.8, hA)) * 0.6 * wf);
                c *= 1.0 + 0.08 * smoothstep(1.5, 6.0, hA) * wf;   // cao lên sáng dần
                diffuseColor.rgb = c;
              }`).replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n              normal = sfBump(normal, -vViewPosition, sfHg);');
          };
          const prevKey = mat.customProgramCacheKey.bind(mat); mat.customProgramCacheKey = () => prevKey() + '|sf' + K;
          return mat;
        }
        surfaceStyle(concreteMat, 'concrete');
