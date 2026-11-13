        // ===== ÁNH SÁNG + VÂN VẬT LIỆU TRONG PHÒNG KÍN — tính trong shader theo HỘP phòng, không thêm đèn, không thêm ảnh
        //  · Mọi vật liệu có đèn của lô gộp (core/draw-batch.js buildBatchMesh) nhận roomLitMat: điểm nằm trong phòng (vlIn > 0, toạ độ phòng = uVlInv × thế giới)
        //    thì đổi ánh sáng gián tiếp; ngoài phòng hệ số = 0 ⇒ cảnh ngoài y nguyên. Người, vật nuôi bước vào phòng tự nhận theo.
        //  · Ngày: trần + vách chắn trời ⇒ ánh trời trong phòng còn uVlK.x, sáng dần về các ô mở (vlOpen); ngả ấm. Nắng trực tiếp giữ nguyên ⇒ vệt nắng nổi hơn.
        //  · Đèn phòng bật (uVlK.y): cộng ánh ấm hắt, mạnh gần đèn (uVlLamp), yếu dần theo khoảng cách; nhân màu vật ⇒ bóng góc nướng sẵn (màu đỉnh của lô) tự áp.
        //  · Vân (userData.vk của vật liệu gốc, vào khoá gộp ⇒ mỗi kiểu một lô): 1 gỗ (thớ dọc theo mặt), 2 sàn ván (ván dọc trục x phòng, khe, tông từng ván),
        //    3 vải / da (loang + sợi dệt), 4 gạch (mạch 10 cm). Toạ độ phòng ⇒ vân đứng yên theo phòng. Tần số cao mờ dần theo cỡ điểm ảnh (fwidth) ⇒ không rung.
        //  · Vật tự vẽ (không gộp: người, ghế, kệ, đèn): roomLitTree(gốc) lúc nạp — xếp hàng, core/draw-batch.js gọi roomLitReady NGAY TRƯỚC khi dựng lô ⇒ vật liệu
        //    đã vá vẫn gộp được (roomLitPure) và lô chụp version sau khi vá (vá sau ⇒ version đổi ⇒ lô tách mảnh). Vật nạp sau (GLB): roomLitMat LÚC TẠO.
        //    Trong suốt bỏ qua. clone() mất bản vá (three không chép onBeforeCompile) ⇒ sổ đã vá là WeakMap, không phải cờ userData.
        //  · Chủ phòng (xe: van/interior/van-light.js) đặt ROOM_LIT.glsl (vlIn: hệ số trong phòng, vlOpen: độ gần ô mở) lúc nạp + các uniform mỗi khung.
        //    Chưa ai đặt ⇒ vlIn = 0, không đổi gì.
        const ROOM_LIT = { glsl: 'float vlIn(vec3 q) { return 0.0; } float vlOpen(vec3 q, vec3 n) { return 1.0; }', u: { uVlInv: { value: new THREE.Matrix4() }, uVlK: { value: new THREE.Vector4(0.6, 0, 0, 0) }, uVlLamp: { value: new THREE.Vector3() } } };
        const VLIT_FN = `
          uniform mat4 uVlInv; uniform vec4 uVlK; uniform vec3 uVlLamp; varying vec3 vVlP;
          float vlH(vec2 p) { vec3 a = fract(vec3(p.xyx) * 0.1031); a += dot(a, a.yzx + 33.33); return fract((a.x + a.y) * a.z); }
          float vlN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(vlH(i), vlH(i + vec2(1.0, 0.0)), f.x), mix(vlH(i + vec2(0.0, 1.0)), vlH(i + vec2(1.0, 1.0)), f.x), f.y); }
          float vlFade(float cyc) { return 1.0 - smoothstep(0.12, 0.4, cyc); }   // cyc: số chu kỳ vân trên 1 điểm ảnh
          float vlWood(vec2 u, float fw) {   // u = (ngang thớ, dọc thớ), đv xe
            float lo = vlN(vec2(u.x * 15.0, u.y * 0.9)), wp = vlN(vec2(u.x * 9.0, u.y * 1.6));
            float ring = sin(u.x * 110.0 + 7.0 * wp + 4.0 * lo), fib = vlN(vec2(u.x * 420.0, u.y * 9.0)) - 0.5;
            return 1.0 + 0.17 * (lo - 0.5) + 0.075 * ring * vlFade(fw * 17.5) + 0.11 * fib * vlFade(fw * 210.0);
          }`;
        const VLIT_KIND = [ '',
          `g = 1.8 * vlWood(vn.y > 0.6 ? q.zx : (vn.z > vn.x ? q.xy : q.zy), fw) - 0.8;`,
          `if (vn.y > 0.6) {
            float pz = q.z / 0.14, hz = vlH(vec2(floor(pz), 3.7)), px = q.x / 1.3 + hz * 5.0, fz = fract(pz), fx = fract(px);
            float az = fwidth(q.z) / 0.14, ax = fwidth(q.x) / 1.3;
            float jz = (1.0 - smoothstep(0.018, 0.018 + 1.5 * az, min(fz, 1.0 - fz))) * vlFade(az * 0.8);
            float jx = (1.0 - smoothstep(0.002, 0.002 + 1.5 * ax, min(fx, 1.0 - fx))) * vlFade(az * 0.8);
            g = (0.88 + 0.22 * vlH(vec2(floor(pz), floor(px)))) * (1.0 - 0.34 * max(jz, jx)) * vlWood(vec2(q.z + hz * 3.0, q.x + hz * 9.0), fw);
          } else g = vlWood(vn.z > vn.x ? q.xy : q.zy, fw);`,
          `{ vec2 u = vn.y > 0.6 ? q.xz : (vn.z > vn.x ? q.xy : q.zy);
            g = 1.0 + 0.10 * (vlN(u * 13.0) - 0.5) + 0.07 * (vlN(u * 47.0) - 0.5) * vlFade(fw * 24.0) + 0.09 * sin(u.x * 1150.0) * sin(u.y * 1150.0) * vlFade(fw * 183.0); }`,
          `{ vec2 u = (vn.y > 0.6 ? q.xz : (vn.z > vn.x ? q.xy : q.zy)) / 0.11, f = fract(u); float a = max(fwidth(u.x), fwidth(u.y));
            float d = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y));
            g = (0.975 + 0.05 * vlH(floor(u))) * (1.0 - 0.20 * (1.0 - smoothstep(0.03, 0.03 + 1.5 * a, d)) * vlFade(a * 0.8)); }` ];
        const _vlOwn = new WeakMap(); var _vlWait;   // var không gán: tệp nằm trước trong manifest gọi roomLitTree được (hàng chờ đã có thì giữ); null = lô đã dựng
        const roomLitPure = m => _vlOwn.get(m) === m.onBeforeCompile;   // chỉ mang bản vá phòng kín (trước đó không có onBeforeCompile riêng, sau đó không ai vá thêm)
        const vlPlain = m => !!m.emissiveMap || (m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0) || m.isMeshStandardMaterial;   // tự sáng / PBR lẻ: ánh gián tiếp khuếch tán góp ít ⇒ để nguyên, khỏi tốn chương trình riêng
        const vlCan = m => m && !m.transparent && !vlPlain(m);
        function roomLitTree(root, skip, own) {   // root: Object3D hoặc hàm trả Object3D (gốc chưa có lúc gọi) · skip(o): mảnh ngoài phòng · own(o): mảnh có lúc tự vẽ (mặc định mọi mảnh)
          if (_vlWait !== null) { (_vlWait || (_vlWait = [])).push([root, skip, own]); return; }
          (typeof root === 'function' ? root() : root).traverse(o => { if (!o.isMesh || (skip && skip(o)) || (own && !own(o))) return; for (const m of [].concat(o.material)) if (vlCan(m)) roomLitMat(m, m.userData.vk); });
        }
        function roomLitReady() {   // 1 lần, ngay trước khi dựng lô. Chỉ vá vật liệu của mảnh có lúc tự vẽ; vật liệu còn dùng ở mảnh ngoài phòng ⇒ vá bản chép, mảnh ngoài giữ bản gốc
          const w = _vlWait; _vlWait = null; if (!w) return;
          const fam = new Set(), pick = new Set(), out = new Set(), dup = new Map(), def = THREE.Material.prototype.onBeforeCompile;
          for (const [root, skip, own] of w) (typeof root === 'function' ? root() : root).traverse(o => { if (!o.isMesh || (skip && skip(o))) return; fam.add(o); if (!own || own(o)) for (const m of [].concat(o.material)) if (vlCan(m)) pick.add(m); });
          scene.traverse(o => { if (o.material && !fam.has(o)) for (const m of [].concat(o.material)) out.add(m); });
          const fix = m => { if (!pick.has(m)) return m; if (!out.has(m)) return roomLitMat(m, m.userData.vk); if (m.onBeforeCompile !== def) return m; let c = dup.get(m); if (!c) dup.set(m, c = roomLitMat(m.clone(), m.userData.vk)); return c; };
          for (const o of fam) o.material = Array.isArray(o.material) ? o.material.map(fix) : fix(o.material);
        }
        function roomLitMat(mat, kind = 0) {
          if (!(mat.isMeshLambertMaterial || mat.isMeshPhongMaterial || mat.isMeshStandardMaterial || mat.isMeshToonMaterial) || _vlOwn.has(mat)) return mat;
          kind = VLIT_KIND[kind] ? kind : 0;
          const prev = mat.onBeforeCompile;
          mat.onBeforeCompile = (sh, r) => {
            prev.call(mat, sh, r); Object.assign(sh.uniforms, ROOM_LIT.u);
            sh.vertexShader = 'uniform mat4 uVlInv; varying vec3 vVlP;\n' + sh.vertexShader.replace('#include <fog_vertex>', `#include <fog_vertex>
              vVlP = (uVlInv * vec4(transpose(mat3(viewMatrix)) * (mvPosition.xyz - viewMatrix[3].xyz), 1.0)).xyz;`);
            let fs = VLIT_FN + ROOM_LIT.glsl + '\n' + sh.fragmentShader;
            if (kind) fs = fs.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
              { vec3 q = vVlP, vn = abs(normalize(mat3(uVlInv) * inverseTransformDirection(normal, viewMatrix)));
                float fw = max(max(fwidth(q.x), fwidth(q.y)), fwidth(q.z)), g = 1.0;
                ${VLIT_KIND[kind]}
                diffuseColor.rgb *= mix(1.0, g, vlIn(q)); }`);
            sh.fragmentShader = fs.replace('#include <aomap_fragment>', `#include <aomap_fragment>
              { vec3 q = vVlP; float vlM = vlIn(q);
                vec3 nL = normalize(mat3(uVlInv) * inverseTransformDirection(normal, viewMatrix)), L = uVlLamp - q; float d2 = dot(L, L);
                float occ = mix(uVlK.x, 1.0, clamp(vlOpen(q, nL), 0.0, 1.0));
                reflectedLight.indirectDiffuse *= mix(vec3(1.0), occ * vec3(1.04, 0.99, 0.91), vlM);
                float fill = uVlK.y * (0.16 + 1.0 / (1.0 + 0.5 * d2)) * (0.62 + 0.38 * dot(nL, L * inversesqrt(d2 + 1e-4)));
                reflectedLight.indirectDiffuse += vlM * fill * vec3(1.0, 0.76, 0.48) * RECIPROCAL_PI * material.diffuseColor; }`);
          };
          _vlOwn.set(mat, prev === THREE.Material.prototype.onBeforeCompile ? mat.onBeforeCompile : null);
          const pk = mat.customProgramCacheKey.bind(mat); mat.customProgramCacheKey = () => pk() + '|vl' + kind; mat.needsUpdate = true; return mat;
        }
