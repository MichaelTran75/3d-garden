        // ===== CHẤT LIỆU CÔNG TRÌNH (G 17/10 "study these glb and improve our building and structure render style"; mẫu: nhà hàng "Inakaya" — Jellepostma,
        //  CC-BY-4.0 · "Forest House" — peachyroyalty, CC-BY-NC-4.0; chỉ xem để học, không nhúng). Khác biệt lớn nhất với khối phẳng của mình nằm ở CHẤT LIỆU
        //  vẽ trên bề mặt: ván dọc có mạch, tông từng tấm lệch nhau, thớ gỗ · bê tông có mạch cốp pha, loang ố, vệt chảy · tường vữa lốm đốm, VỆT NƯỚC MƯA
        //  dọc tường · chân tường BẨN + TỐI DẦN như vẽ bóng sẵn (painted AO), cao lên sáng dần · rêu xanh ở chân bê tông. Làm bằng shader thủ tục theo toạ
        //  độ thế giới (không ảnh, không thêm lưới): độ cao trên mặt đất đọc từ ẢNH ĐỘ CAO ĐỊA HÌNH (1 điểm ảnh = 1 ô lưới 0,6 m, dựng 1 lần từ cowY lúc
        //  biên dịch shader đầu tiên) ⇒ 1 vật liệu dùng chung nhiều nhà vẫn đúng chân tường từng nhà; mạch ván / cốp pha lõm thật (bump theo đạo hàm màn
        //  hình). Vật liệu có shader riêng thì lớp gộp lượt vẽ để riêng (vẽ thẳng, nhà đã gộp tĩnh theo vật liệu nên chỉ thêm vài lượt) ----
        let SF_H = null;
        const SF_KIND = { concrete: 1, stucco: 2, boards: 3, woodAO: 4, bark: 5 };
        function sfHeightTex() {   // cowY tại tâm từng ô lưới GX × GZ (nước: mặt nước) — đọc lân cận gần nhất trong shader
          const d = new Float32Array(GX * GZ);
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) d[i + j * GX] = cowY(wx(i), wz(j));
          const t = new THREE.DataTexture(d, GX, GZ, THREE.RedFormat, THREE.FloatType); t.magFilter = t.minFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
        }
        const SF_GLSL = `
          uniform sampler2D uSfH; uniform vec4 uSfG; varying vec3 vSfP; varying vec3 vSfN;
          float sfR(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float sfN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(sfR(i), sfR(i + vec2(1.0, 0.0)), f.x), mix(sfR(i + vec2(0.0, 1.0)), sfR(i + vec2(1.0, 1.0)), f.x), f.y); }
          vec3 sfBump(vec3 n, vec3 sp, float h) { vec3 dx = dFdx(sp), dy = dFdy(sp), r1 = cross(dy, n), r2 = cross(n, dx); float det = dot(dx, r1);
            return normalize(abs(det) * n - sign(det) * (dFdx(h) * r1 + dFdy(h) * r2)); }`;
        function surfaceStyle(mat, kind) {
          const K = SF_KIND[kind], prev = mat.onBeforeCompile;
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r);
            SF_H = SF_H || sfHeightTex();
            sh.uniforms.uSfH = { value: SF_H }; sh.uniforms.uSfG = { value: new THREE.Vector4(1 / BLOCK, cx, cz, 0) };
            // chèn ở fog_vertex (cuối shader): vị trí thế giới lấy ngược từ mvPosition ⇒ đúng cả khi shader gió đã thay project_vertex (cây đung đưa)
            sh.vertexShader = 'varying vec3 vSfP; varying vec3 vSfN;\n' + (K === 5 ? 'attribute vec2 aBk; varying vec2 vSfB;\n' : '') + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>${K === 5 ? '\n vSfB = aBk;' : ''}
              vec3 sfN3 = objectNormal;
              #ifdef USE_INSTANCING
                sfN3 = mat3(instanceMatrix) * sfN3;
              #endif
              vSfP = (inverse(viewMatrix) * vec4(mvPosition.xyz, 1.0)).xyz; vSfN = normalize(mat3(modelMatrix) * sfN3);`);
            sh.fragmentShader = SF_GLSL + (K === 5 ? '\nvarying vec2 vSfB;' : '') + '\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
              float sfHg = 0.0;
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
                  // ngang thưa chia mảng; địa y bạc xanh trên mảng; rêu ở gốc. Rãnh lõm thật (bump)
                  float ba = vSfB.x * 12.0, bl = vSfB.y * 1.6, bw = 1.4 * sfN(vec2(ba * 0.45, bl * 0.7));
                  float cr = max(1.0 - smoothstep(0.015, 0.085, abs(sfN(vec2(ba + bw, bl * 0.45)) - 0.5)), 0.75 * (1.0 - smoothstep(0.01, 0.06, abs(sfN(vec2(ba * 2.1 + bw + 4.0, bl * 0.8)) - 0.5))));
                  float hc = (1.0 - smoothstep(0.015, 0.05, abs(sfN(vec2(ba * 0.6 + 3.0, bl * 2.4)) - 0.5))) * step(0.5, sfN(vec2(ba * 0.6, bl * 0.8) + 9.0));
                  float gv = max(cr, 0.7 * hc), pl = sfN(vec2(ba * 0.8, bl * 1.1) + 2.0);
                  c *= mix(0.95 + 0.14 * pl, 0.4, gv);
                  c = mix(c, vec3(0.62, 0.66, 0.55), 0.28 * smoothstep(0.82, 0.95, sfN(vec2(ba * 2.4, bl * 3.0) + 11.0)) * (1.0 - gv));
                  c = mix(c, vec3(0.30, 0.40, 0.18), 0.5 * (1.0 - smoothstep(0.0, 0.9, hA)) * smoothstep(0.3, 0.7, sfN(vec2(ba * 0.6, bl * 3.0) + 5.0)));
                  sfHg = -0.012 * gv + 0.003 * pl;
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
