        // ===== NẤM: dưới gốc cổ thụ + nấm giá trên thân cổ thụ, gốc cây cưa, gỗ chết (G 21/10 "cho 1-2 loại nấm ở dưới gốc cây, 1 ít cỏ, compress bigmushroom
        //  và gắn vài cái lên thân cây cổ thụ, cây bị chặt gốc và gỗ chết") =====
        //  models/fungi.bin (src/tools/fungi/, 83 KB, XOR như transit.bin — 2 mẫu Sketchfab Standard): 'bracket' nấm giá chụp quét (Zacxophone) đã bỏ mảnh vỏ,
        //  2,6k tam giác, ngang 0,3 m · 'fly' nấm đỏ chấm trắng + 'cluster' cụm nấm nâu mọc chùm (gói EarlyMorrow3D). Mỗi loại 1 InstancedMesh màu đỉnh.
        //  Chỗ đặt tính lúc dựng cảnh (lưới vỏ còn nguyên, trước mem-trim), ngẫu nhiên tất định:
        //   · DƯỚI GỐC: điểm trên vòng 0,9–3,2 quanh gốc, tia từ +1,2 m chiếu xuống thân / rễ / đá / cây con — trúng nền đất nâu hoặc không trúng gì ⇒ đất trống:
        //     6 cụm nấm nâu sát rễ (+5 cụm ra đất trống r 2–3,6 — G 21/10 nấm phát quang), 4 nấm đỏ xa hơn (to 1,3–2 lần thật cho hợp cây ×2,76), 18 búi cỏ (addGrassTuft, world/street-lamps.js — gió lay như cỏ khác);
        //   · NẤM GIÁ: tia ngang nhắm vào trục (thân cổ thụ nghiêng 0,62 rad ⇒ trục lệch −0,72 m theo X mỗi 1 m cao; gốc cưa, khúc gỗ đứng thẳng; khúc gỗ chết
        //     nằm ngang — tia từ 2 bên hông + 1 tia từ trên lưng); mặt trúng có pháp tuyến gần ngang ⇒ mũ nằm ngang, tâm cách mặt vỏ 0,35 bán kính (1/3 lún vào vỏ):
        //     thân cổ thụ 4 (~0,6 m) · gốc cưa lớn 2 · gốc nhỏ rải rác 1 cái mỗi gốc thứ 2 · khúc gỗ đứng 2 · khúc gỗ chết 3 (thay 3 nấm hộp cũ — nature/forest.js);
        //     màu ảnh quét nhạt, dưới nắng cảnh thành xám ⇒ vật liệu nhân 0xd2a878 (nâu vàng) ----
        const fungi = (() => {
          const rnd = mulberry32(8181), M = { bracket: [], fly: [], cluster: [] }, R_B = 0.15;   // bán kính nấm giá ở tỉ lệ 1 (extras.r)
          const _m = new THREE.Matrix4(), _m2 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _a = new THREE.Vector3();
          const put = (k, p, s, yaw = rnd() * TAU, tilt = 0) => { _e.set((rnd() - 0.5) * tilt, yaw, (rnd() - 0.5) * tilt); M[k].push(_m.compose(p, _q.setFromEuler(_e), _s.setScalar(s)).clone()); };
          const meshesOf = objs => { const L = []; for (const o of objs) if (o) o.traverse(m => { if (m.isMesh && !m.isInstancedMesh) L.push(m); }); return L; };
          const rc = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0);
          // ---- dưới gốc cổ thụ: nấm + cỏ trên đất trống giữa các rễ ----
          const C = new THREE.Vector3(X0 + 89, 7, Z0 + 117), tree = scene.getObjectByName('Cây cổ thụ (Old Tree)');
          const ringG = scene.children.find(o => o.isGroup && !o.name && o.position.distanceTo(C) < 0.01);   // đá cuội + nền đất nâu (old-tree.js stoneRing)
          const base = meshesOf([tree, scene.getObjectByName('Rễ cây cổ thụ'), scene.getObjectByName('Cây con (Small Sub-Tree)'), ringG]);
          function ground(x, z) {   // mặt đất trống tại (x, z), hoặc null nếu vướng thân / rễ / đá
            rc.set(_a.set(x, C.y + 1.2, z), DOWN); rc.far = 2; const h = rc.intersectObjects(base, false)[0];
            return !h ? cowY(x, z) : h.object.material && h.object.material.color && h.object.material.color.getHex() === 0x3d3024 ? h.point.y : null;
          }
          const used = [], spots = (n, r0, r1, sep) => { const k0 = used.length; for (let k = 0; k < 500 && used.length < k0 + n; k++) {
            const a = rnd() * TAU, r = r0 + (r1 - r0) * rnd(), x = C.x + Math.cos(a) * r, z = C.z + Math.sin(a) * r, y = ground(x, z);
            if (y !== null && used.every(p => Math.hypot(p.x - x, p.z - z) > sep)) used.push(new THREE.Vector3(x, y, z)); } return used.slice(k0); };
          for (const p of spots(6, 0.9, 2.0, 0.45)) put('cluster', p, 1.4 + 0.6 * rnd());   // cây cổ thụ ×2,76 ⇒ nấm to hơn thật 1,5–2 lần cho thấy rõ
          for (const p of spots(4, 1.3, 3.0, 0.45)) put('fly', p, 1.3 + 0.5 * rnd());
          for (const p of spots(18, 1.0, 3.2, 0.25)) addGrassTuft(p.x, p.y, p.z, rnd() * TAU, 0.7 + 0.4 * rnd());
          // ---- nấm giá: tia ngang vào trục vật, mặt trúng gần thẳng đứng ⇒ đặt mũ ngang, 1/3 lún vào vỏ ----
          function side(objs, axisAt, y0, y1, n, sMul, sep = 0.5) {   // axisAt(y) → điểm trục ở cao độ y
            const tg = meshesOf(objs), got = []; if (!tg.length) return;
            for (let k = 0; k < n * 8 && got.length < n; k++) {
              const y = y0 + (y1 - y0) * rnd(), a = rnd() * TAU, o = axisAt(y), d = _s.set(Math.cos(a), 0, Math.sin(a));
              rc.set(o.clone().addScaledVector(d, 4), d.clone().negate()); rc.far = 4.5; const h = rc.intersectObjects(tg, false)[0]; if (!h || !h.face) continue;
              const nw = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (Math.abs(nw.y) > 0.6 || got.some(p => p.distanceTo(h.point) < sep)) continue;
              const nh = nw.setY(0).normalize(), s = sMul * (0.85 + 0.35 * rnd()); got.push(h.point.clone());
              put('bracket', h.point.clone().addScaledVector(nh, 0.35 * R_B * s).setY(h.point.y - 0.03), s, Math.atan2(nh.x, nh.z) + (rnd() - 0.5), 0.12);
            }
          }
          side([tree], y => new THREE.Vector3(C.x - 0.72 * (y - C.y), y, C.z), C.y + 0.7, C.y + 2.3, 4, 2.0, 0.9);   // thân cổ thụ: nấm giá ~0,6 m (cây cổ thụ lớn)
          const stumpTop = o => new THREE.Box3().setFromObject(o).max.y;
          for (const [o, n, s] of (() => { const L = []; let i = 0; scene.traverse(o => { if (o.name === 'Gốc cây nhỏ rải rác (Small Stump)' && i++ % 2 === 0) L.push([o, 1, 1.0]); }); return L; })())
            side([o], y => new THREE.Vector3(o.position.x, y, o.position.z), stumpTop(o) - 0.16, stumpTop(o) - 0.08, n, s);   // gốc nhỏ rải rác
          { const big = scene.children.find(o => o.isGroup && Math.hypot(o.position.x - (X0 + 102), o.position.z - (Z0 + 115)) < 0.01);   // gốc cưa lớn (forest.js)
            if (big) side([big], y => new THREE.Vector3(X0 + 102, y, Z0 + 115), 7.25, 7.34, 2, 1.45, 0.9); }
          { const wp = scene.getObjectByName('Khúc gỗ đứng (Wood Post)'); if (wp) { const b = new THREE.Box3().setFromObject(wp); side([wp], y => new THREE.Vector3(wp.position.x, y, wp.position.z), b.min.y + 0.45 * (b.max.y - b.min.y), b.min.y + 0.8 * (b.max.y - b.min.y), 2, 1.2, 0.5); } }
          { const log = scene.getObjectByName('Khúc gỗ chết (Dead Log)'), D = deadLog; if (log && D) {   // khúc gỗ chết: 2 bên hông (tia ngang vuông góc trục) + 1 trên lưng
            const tg = meshesOf([log]), ax = D.bx - D.ax, az = D.bz - D.az, len = Math.hypot(ax, az), px = -az / len, pz = ax / len, yc = log.position.y;
            for (const [t, sd] of [[0.3, 1], [0.62, -1]]) { const o = new THREE.Vector3(D.ax + ax * t + px * sd * 3, yc, D.az + az * t + pz * sd * 3); rc.set(o, _s.set(-px * sd, 0, -pz * sd)); rc.far = 4;
              const h = rc.intersectObjects(tg, false)[0]; if (h) { const s = 1.6 + 0.3 * rnd(); put('bracket', h.point.clone().add(_a.set(px * sd, 0, pz * sd).multiplyScalar(0.35 * R_B * s)).setY(h.point.y - 0.03), s, Math.atan2(px * sd, pz * sd), 0.1); } }
            { rc.set(new THREE.Vector3(D.ax + ax * 0.82, yc + 3, D.az + az * 0.82), DOWN); rc.far = 4; const h = rc.intersectObjects(tg, false)[0]; if (h) put('bracket', h.point.clone().setY(h.point.y - 0.02), 1.5, rnd() * TAU, 0.15); } } }
          { const r2 = mulberry32(8282); let n = 0;   // nấm phát quang (dưới): thêm 5 cụm nấm nâu ra đất trống quanh gốc (r 2–3,6) — 6 cụm cũ nép giữa rễ, từ trên cao khó thấy ánh xanh
            for (let k = 0; k < 300 && n < 5; k++) { const a = r2() * TAU, r = 2.0 + 1.6 * r2(), x = C.x + Math.cos(a) * r, z = C.z + Math.sin(a) * r, y = ground(x, z);
              if (y !== null && used.every(p => Math.hypot(p.x - x, p.z - z) > 0.6)) { const p = new THREE.Vector3(x, y, z); used.push(p); put('cluster', p, 1.3 + 0.5 * r2()); n++; } } }
          // ---- NẤM PHÁT QUANG BAN ĐÊM (G 21/10 "nấm ban đêm noctilucent"): nấm phát quang thật (Mycena chlorophos / M. noctilucens, Panellus stipticus,
          //  Omphalotus) phát ánh XANH LỤC đỉnh ~520–530 nm, SÁNG ĐỀU (không nhấp nháy như đom đóm), từ mũ + phiến + sợi nấm — rất yếu, chỉ thấy trong bóng tối.
          //  ⇒ cụm nấm nâu (kiểu Mycena / Omphalotus mọc chùm) + nấm giá trên gỗ (kiểu Panellus) có emissive xanh lục theo độ tối (từ chạng vạng, đậm nhất nửa đêm)
          //  + quầng sáng cộng màu mỗi cây (billboard trong 1 InstancedMesh); nấm đỏ chấm trắng (Amanita muscaria) ngoài đời không phát quang ⇒ giữ nguyên.
          //  Gọi fungi.glow(nightFactor, t) mỗi khung (loop/main-loop-rest.js) ----
          const GLOW = new THREE.Color(0x7cff70), G = { mats: null, halo: null };
          function glow(nf, t) {
            if (!G.mats) return; const k = Math.max(0, (nf - 0.35) / 0.65), e = k * k * (0.95 + 0.05 * Math.sin(t * 0.6));   // thở rất chậm ±5% (sợi nấm sống), không chớp
            G.mats[0].emissiveIntensity = 0.275 * e; G.mats[1].emissiveIntensity = 0.425 * e; G.halo.material.uniforms.uA.value = 0.225 * e; G.halo.visible = e > 0.01;   // G 21/10: giảm 50%
          }
          // ---- nạp mẫu (XOR → GLB) · 1 InstancedMesh mỗi loại; ma trận mỗi bản = chỗ đặt × phép giải lượng tử của nút lưới ----
          const FUNGI_BIN = window.__fungiBin || 'https://michaeltran75.github.io/3d-garden/models/fungi.bin';
          Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js'),
            fetch(FUNGI_BIN).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status)))]).then(([{ GLTFLoader }, { MeshoptDecoder }, buf]) => {
            const b = new Uint8Array(buf); let s = 0x2545F491; for (let i = 0; i < b.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; b[i] ^= s & 255; }
            new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(b.buffer, '', gl => {
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true }), NAME = { bracket: 'Nấm giá trên gỗ (Bracket Fungus)', fly: 'Nấm đỏ chấm trắng (Fly Agaric)', cluster: 'Cụm nấm nâu (Mushroom Cluster)' };
              const matB = new THREE.MeshLambertMaterial({ vertexColors: true, color: 0xd2a878, emissive: GLOW, emissiveIntensity: 0 }), matC = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: GLOW, emissiveIntensity: 0 });
              const MAT = { bracket: matB, cluster: matC, fly: mat }, halos = [];   // nấm giá: màu ảnh quét nhạt ⇒ nhân nâu vàng (matB)
              for (const k in M) { const node = gl.scene.getObjectByName(k), mesh = node && node.children[0]; if (!mesh || !M[k].length) continue; mesh.updateMatrix();
                const im = new THREE.InstancedMesh(mesh.geometry, MAT[k], M[k].length); M[k].forEach((m, i) => im.setMatrixAt(i, _m2.multiplyMatrices(m, mesh.matrix))); im.computeBoundingSphere();
                im.castShadow = im.receiveShadow = true; im.name = NAME[k]; im.userData.noBatch = im.userData.noBake = im.userData.noCollide = true; scene.add(im);
                if (k !== 'fly') { const X = node.userData, r = X.r || 0.1, h = X.h || 0.1;   // tâm quầng: giữa bề dày nấm giá / 0,6 chiều cao cụm nấm; ngang ~1,6–2 lần bề rộng nấm
                  for (const m of M[k]) { _a.setFromMatrixPosition(m); const sc = _s.setFromMatrixScale(m).x; halos.push([_a.x, _a.y + (k === 'bracket' ? 0.4 : 0.6) * h * sc, _a.z, (k === 'bracket' ? 3.2 : 5) * r * sc]); } } }
              const haloMat = new THREE.ShaderMaterial({ uniforms: { uC: { value: GLOW.clone() }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
                vertexShader: 'varying vec2 vU; void main() { vU = uv; vec4 mv = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * length(instanceMatrix[0].xyz); gl_Position = projectionMatrix * mv; }',
                fragmentShader: 'uniform vec3 uC; uniform float uA; varying vec2 vU; void main() { float d = length(vU - 0.5) * 2.0, a = uA * pow(max(0.0, 1.0 - d), 2.2); gl_FragColor = vec4(uC, a);\n#include <colorspace_fragment>\n}' });
              const hm = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), haloMat, Math.max(1, halos.length)); halos.forEach(([x, y, z, d], i) => hm.setMatrixAt(i, _m.compose(_a.set(x, y, z), _q.identity(), _s.setScalar(d)))); hm.count = halos.length;
              hm.computeBoundingSphere(); hm.name = 'Quầng sáng nấm phát quang'; hm.renderOrder = 3; hm.visible = false; hm.userData.noBatch = hm.userData.noBake = hm.userData.noCollide = true; scene.add(hm);   // billboard: dời đỉnh trong hệ nhìn ⇒ luôn quay về camera
              G.mats = [matB, matC]; G.halo = hm;
            }, err => console.warn('Fungi:', err));
          }).catch(err => console.warn('Fungi:', err));
          return { M, glow };
        })();
