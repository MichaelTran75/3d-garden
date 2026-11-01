        // ===== DƯƠNG XỈ BÁM VÁCH BỜ (G 31/10 "em phân tích cây dương sĩ và add khu vực đó" — ô khoanh: vách bờ tây dưới trạm biến áp, quanh cửa xả cống)
        //  Mẫu "Realistic HD Common polypody fern (2555)" — PlantCatalog (Sketchfab), CC BY 4.0: dương xỉ đa túc Polypodium vulgare — loài mọc trên tường đá,
        //  vách đất, gốc cây ẩm (thân rễ bò sát mặt vách, lá lẻ cánh dài 10–40 cm mọc rải dọc thân rễ, cuống ngắn, lá rủ chĩa ra ngoài). Mẫu gốc 6,5 MB: 1 thân rễ
        //  (8 889 tam giác) + 3 lưới lá (10 224 tam giác), 8 ảnh PNG ⇒ src/tools/fern/ (Blender: bỏ thân rễ — nằm khuất sát vách, giảm lưới lá còn 45%; fernpack.py: 1 ảnh WebP 512 dùng chung vì 3 ảnh lá có
        //  cùng mặt nạ alpha, màu từng lá thành màu đỉnh, lượng tử hoá ⇒ models/fern.glb 164 KB, 4 262 đỉnh / 4 600 tam giác).
        //  Hệ mẫu: mặt phẳng lưng (gốc cuống) z ≈ −0,05…0, lá chĩa ra +z tới 0,34 m và rủ xuống ⇒ xoay +z ra phía nước (mặt bờ quay đông).
        //  G 31/10 tối "giảm số lượng cây dương sỉ 70%, thay vì tạo nhóm cây dương sỉ, em hãy lấy lá cây dương sỉ tạo giống như cỏ": bỏ 24 cụm nguyên mẫu. Mẫu tách
        //  thành 213 LÁ RỜI (mỗi lá 1 mảnh lưới liền: cuống + lá chét, dài 7–38 cm, gốc cuống = đỉnh sát mặt phẳng lưng nhất) rồi rải TỪNG LÁ lên vách như cỏ mọc:
        //  30% số lá cũ (24 cụm × 213 ⇒ 7 × 213 = 1 491 lá), mật độ loang theo nhiễu (chỗ dày, chỗ thưa, chỗ trống như thảm cỏ), mỗi lá 1 dáng ngẫu nhiên trong 213,
        //  nghiêng về dáng lá dài, lật gương nửa số, cỡ 0,8–1,15; mọc như lá cỏ trên vách: trục gốc → ngọn vươn dọc mặt vách (78% hướng lên ±69°, 22% rủ
        //  xuống) và chĩa ra khỏi vách 13–38°, mặt lá quay ra ngoài + ngửa lên đón sáng, xoắn ±23° (nhìn từ trên vẫn thấy cả bản lá); tránh tường đầu cửa xả (world/storm-drain.js).
        //  Gộp 1 lưới tĩnh (1 lượt vẽ, ~30k đỉnh).
        //  Gió: mỗi lá lệch ∝ (khoảng cách tới gốc / chiều dài lá)² theo trường gió chung (nature/wind-physics.js) tại gốc lá + rung lan từ gốc ra ngọn;
        //  viền lá mịn = alpha-to-coverage có làm nét theo fwidth (MSAA), không ghi alpha của canvas (canvas trong suốt); ướt thẫm màu khi mưa như đất cỏ ----
        const ferns = (() => {
          const FERN_GLB = window.__fernGlb || (location.protocol === 'file:' ? '3d-garden/src/models/fern.glb' : /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'models/fern.glb' : 'https://michaeltran75.github.io/3d-garden/models/fern.glb');   // máy G: mẫu mới chưa lên Pages vẫn nạp được
          const { zE, OUT } = stormDrain.net, rnd = mulberry32(25550), N_FROND = 7 * 213;
          // ---- mặt vách: mỗi hàng ô z, cột đất cuối trước nước ⇒ mặt vách x, gốc lá từ trên mép nước 0,32 tới dưới mép bờ 0,05 ----
          const rows = [];
          for (let j = Math.round(z2gj(Z0 + 74.6)); j <= Math.round(z2gj(Z0 + 87.4)); j++) {
            let i = Math.round(x2gi(X0 + 74)); while (i < GX - 1 && !isWater(i, j)) i++;
            const top = surfaceY(i - 1, j), y0 = lakeY + 0.32, h = top - 0.05 - y0; if (h > 0.1) rows.push({ x: wx(i) - BLOCK / 2, z: wz(j), y0, h });
          }
          // ---- rải gốc lá: theo diện tích vách, giữ theo mật độ loang (nhiễu trơn 2 tầng ~0,9 m và ~0,35 m) ----
          const hs = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return s - Math.floor(s); };
          const vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = x - i, v = y - j, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v);
            return (hs(i, j) * (1 - a) + hs(i + 1, j) * a) * (1 - b) + (hs(i, j + 1) * (1 - a) + hs(i + 1, j + 1) * a) * b; };
          const P = [], Ht = rows.reduce((a, r) => a + r.h, 0);
          for (let tries = 0; tries < 40 * N_FROND && P.length < N_FROND && Ht > 0; tries++) {
            let u = rnd() * Ht, r = rows[0]; for (const q of rows) { r = q; if ((u -= q.h) <= 0) break; }
            const z = r.z + (rnd() - 0.5) * BLOCK, y = r.y0 + r.h * Math.pow(rnd(), 0.9);   // hơi dồn xuống nửa dưới — gần nước ẩm hơn
            const n = 0.7 * vn(z * 1.1 + 3.1, y * 1.4) + 0.3 * vn(z * 2.9 + 7.7, y * 3.1 + 1.3), keep = 0.12 + 0.88 * THREE.MathUtils.smoothstep(n, 0.36, 0.66);
            if (rnd() > keep) continue;
            if (Math.abs(z - zE) < 1.12 && y < OUT.inv + 1.38) continue;   // tường đầu cửa xả (rộng 1,84) + tầm lá rủ
            P.push({ x: r.x + 0.01, y, z, u: rnd(), sc: 0.8 + 0.35 * rnd(), mir: rnd() < 0.5 ? -1 : 1, out: 0.22 + 0.45 * rnd(), al: rnd() < 0.22 ? (rnd() < 0.5 ? -1 : 1) * (1.9 + 1.1 * rnd()) : (rnd() - 0.5) * 2.4, tw: (rnd() - 0.5) * 0.8, tint: rnd() });
          }
          // ---- nạp mẫu · tách lá rời · dựng 1 lưới ----
          const FERN_GLSL = `
            attribute vec4 aFw;   // gốc lá (thế giới) · khoảng cách tới gốc / chiều dài lá
            vec3 fernWind() {
              float k = aFw.w * aFw.w;   // gốc cuống bám vách đứng yên, ngọn lá lệch nhiều nhất
              vec3 w = windVec(aFw.xyz + vec3(0.0, 0.2, 0.0), 0.4);
              float f = sin(uTime * 6.3 + dot(aFw.xyz, vec3(9.1, 13.7, 7.3)) - 3.0 * aFw.w) * (0.004 + 0.01 * length(w));   // lá rung, sóng lan từ gốc ra ngọn
              return k * (vec3(w.x, 0.12 * w.y, w.z) * 0.045 + vec3(0.3 * f, f, 0.3 * f));
            }`;
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'),
            fetch(FERN_GLB).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status))), ldGate]).then(([{ GLTFLoader }, buf]) => {
            new GLTFLoader().parse(buf, '', gl => {
              let src = null; gl.scene.traverse(o => { if (o.isMesh && !src) src = o; }); if (!src || !P.length) return;
              src.updateMatrix();
              const G0 = src.geometry, Pa = G0.attributes.position, Na = G0.attributes.normal, Ua = G0.attributes.uv, Ca = G0.attributes.color, I0 = G0.index.array, nV = Pa.count;
              // lá rời = mảnh lưới liền (hợp nhất đỉnh theo tam giác); gốc = đỉnh sát mặt phẳng lưng nhất (z nhỏ nhất, hệ mẫu đã giải lượng tử)
              const MP = new Float32Array(nV * 3), v = new THREE.Vector3(), n = new THREE.Vector3(), par = new Int32Array(nV);
              for (let i = 0; i < nV; i++) { v.fromBufferAttribute(Pa, i).applyMatrix4(src.matrix); MP[i * 3] = v.x; MP[i * 3 + 1] = v.y; MP[i * 3 + 2] = v.z; par[i] = i; }
              const find = a => { while (par[a] !== a) a = par[a] = par[par[a]]; return a; };
              for (let t = 0; t < I0.length; t += 3) { const a = find(I0[t]); par[find(I0[t + 1])] = a; par[find(I0[t + 2])] = a; }
              const byRoot = new Map(), FR = [];
              for (let i = 0; i < nV; i++) { const r = find(i); let f = byRoot.get(r); if (!f) { f = { v: [], t: [], loc: new Map() }; byRoot.set(r, f); FR.push(f); } f.loc.set(i, f.v.length); f.v.push(i); }
              for (let t = 0; t < I0.length; t += 3) { const f = byRoot.get(find(I0[t])); f.t.push(f.loc.get(I0[t]), f.loc.get(I0[t + 1]), f.loc.get(I0[t + 2])); }
              const nA = new THREE.Vector3();
              for (const f of FR) { let b = f.v[0]; for (const i of f.v) if (MP[i * 3 + 2] < MP[b * 3 + 2]) b = i;
                f.b = new THREE.Vector3(MP[b * 3], MP[b * 3 + 1], MP[b * 3 + 2]); f.L = 1e-3; let tp = b;
                for (const i of f.v) { const d = v.set(MP[i * 3], MP[i * 3 + 1], MP[i * 3 + 2]).distanceTo(f.b); if (d > f.L) { f.L = d; tp = i; } }
                // hệ riêng của lá: trục gốc → ngọn · pháp tuyến mặt lá (trung bình pháp tuyến đỉnh, bỏ phần dọc trục) · trục ngang
                const dir = new THREE.Vector3(MP[tp * 3], MP[tp * 3 + 1], MP[tp * 3 + 2]).sub(f.b).normalize(); nA.set(0, 0, 0); for (const i of f.v) nA.add(n.fromBufferAttribute(Na, i));
                nA.addScaledVector(dir, -nA.dot(dir)); if (nA.lengthSq() < 1e-8) nA.set(0, 1, 0).addScaledVector(dir, -dir.y); nA.normalize();
                f.F = new THREE.Matrix4().makeBasis(dir, nA, new THREE.Vector3().crossVectors(dir, nA)); }
              FR.sort((a, b) => b.L - a.L); let nVt = 0, nIt = 0; for (const p of P) { p.f = FR[Math.min(FR.length - 1, Math.floor(p.u ** 1.5 * FR.length))]; nVt += p.f.v.length; nIt += p.f.t.length; }   // nghiêng về lá dài (lá 7–12 cm nhìn như vụn)
              const pos = new Float32Array(nVt * 3), nor = new Float32Array(nVt * 3), uv = new Float32Array(nVt * 2), col = new Float32Array(nVt * 3), fw = new Float32Array(nVt * 4), idx = nVt > 65535 ? new Uint32Array(nIt) : new Uint16Array(nIt);
              const M = new THREE.Matrix4(), S = new THREE.Matrix4(), W = new THREE.Matrix4(), RF = new THREE.Matrix4(), T0 = new THREE.Matrix4(), NM = new THREE.Matrix3(), dt = new THREE.Vector3(), nt = new THREE.Vector3(), c = new THREE.Color();
              let ov = 0, oi = 0;
              for (const p of P) {
                const f = p.f, flip = p.mir < 0;
                // như lá cỏ mọc trên vách: gốc → ngọn vươn dọc mặt vách (78% hướng lên ±69°, 22% rủ xuống) và chĩa ra khỏi vách 13–38°; mặt lá quay ra ngoài + ngửa lên đón sáng, xoắn ±23°
                const co = Math.cos(p.out); dt.set(Math.sin(p.out), co * Math.cos(p.al), co * Math.sin(p.al)); nt.set(1, 0.7, 0).addScaledVector(dt, -(dt.x + 0.7 * dt.y)).normalize().applyAxisAngle(dt, p.tw);   // mặt lá quay ra ngoài, ngửa lên đón sáng
                W.makeBasis(dt, nt, v.crossVectors(dt, nt)).multiply(S.copy(f.F).transpose());   // hệ lá → hệ đích
                if (flip) W.multiply(RF.copy(f.F).multiply(S.makeScale(1, 1, -1)).multiply(T0.copy(f.F).transpose()));   // lật gương qua mặt (trục, pháp tuyến) của lá
                M.makeTranslation(p.x, p.y, p.z).multiply(W).multiply(S.makeScale(p.sc, p.sc, p.sc)).multiply(T0.makeTranslation(-f.b.x, -f.b.y, -f.b.z)); NM.getNormalMatrix(M);
                c.setHSL(0.25 + 0.05 * p.tint, 0.3, 0.93 + 0.07 * p.tint);   // lá này xanh vàng, lá kia xanh thẫm hơn
                for (let k = 0; k < f.v.length; k++) {
                  const i = f.v[k], o = ov + k;
                  v.set(MP[i * 3], MP[i * 3 + 1], MP[i * 3 + 2]); const d = v.distanceTo(f.b) / f.L; v.applyMatrix4(M); pos.set([v.x, v.y, v.z], o * 3);
                  n.fromBufferAttribute(Na, i).applyMatrix3(NM).normalize(); nor.set([n.x, n.y, n.z], o * 3);
                  uv.set([Ua.getX(i), Ua.getY(i)], o * 2); col.set(Ca ? [Ca.getX(i) * c.r, Ca.getY(i) * c.g, Ca.getZ(i) * c.b] : [c.r, c.g, c.b], o * 3);
                  fw.set([p.x, p.y, p.z, d], o * 4);
                }
                for (let k = 0; k < f.t.length; k += 3) { idx[oi++] = ov + f.t[k]; idx[oi++] = ov + f.t[k + (flip ? 2 : 1)]; idx[oi++] = ov + f.t[k + (flip ? 1 : 2)]; }   // lật gương ⇒ đảo chiều tam giác (mặt trước / sau đúng)
                ov += f.v.length;
              }
              const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
              geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aFw', new THREE.BufferAttribute(fw, 4));
              geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere(); geo.computeBoundingBox();
              const mat = new THREE.MeshLambertMaterial({ map: src.material.map, vertexColors: true, side: THREE.DoubleSide, alphaTest: 0.5, alphaToCoverage: true });
              injectWorldWind(mat, {}, FERN_GLSL, 'fernWind()', 'fernFronds1');
              const ob = mat.onBeforeCompile;
              mat.onBeforeCompile = (sh, r) => { ob(sh, r);   // viền lá: alpha → độ phủ mẫu MSAA, làm nét theo fwidth (≈ 1 điểm ảnh chuyển tiếp)
                sh.fragmentShader = sh.fragmentShader.replace('#include <alphatest_fragment>', 'diffuseColor.a = clamp((diffuseColor.a - alphaTest) / max(fwidth(diffuseColor.a), 1e-4) + 0.5, 0.0, 1.0);\n if (diffuseColor.a < 0.002) discard;')
                  .replace('#include <opaque_fragment>', 'gl_FragColor = vec4(outgoingLight, diffuseColor.a);'); };
              wetMats.push([mat, mat.color.clone()]);
              const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = mesh.receiveShadow = true; mesh.name = 'Dương xỉ đa túc trên vách bờ (Polypody Fern)';
              mesh.onBeforeRender = r => r.getContext().colorMask(true, true, true, false);   // A2C: giữ alpha canvas = 1 (mép lá không làm thủng nền trang)
              mesh.onAfterRender = r => r.getContext().colorMask(true, true, true, true);
              Object.assign(mesh.userData, { noBatch: true, noBake: true, noCollide: true, noFlight: true, noRainOcc: true }); scene.add(mesh); F.mesh = mesh; F.fronds = FR.length;
              worldJoin('smallShadow', 10, S => S.add(mesh));   // bóng lá chỉ khi zoom gần (dịch vụ 'smallShadow' — loop/close-up.js mục 4) — zoom xa bóng lá nhỏ hơn 1 điểm ảnh
              G0.dispose();
            }, err => console.warn('Fern:', err));
          }).catch(err => console.warn('Fern:', err)));
          const F = { P, rows, mesh: null, fronds: 0 };
          return F;
        })();
