        // ===== GẤU MÈO = MẪU GLB THẬT (G 24/10 tối "mang chính xác glb racoon vào trong, thay thế cho racoon hiện tại") =====
        //  "Low-poly Racoon Run Animation" (avatrass, Sketchfab, CC-BY-4.0) → src/models/raccoon.glb NGUYÊN BYTE: lưới skin 2 430 đỉnh, 63 khớp, ảnh màu bảng.
        //  Hành vi (kiếm ăn, cào bới, đứng 2 chân, ôm táo, phi nhảy, chui hang) vẫn do khung xương gấu mèo cũ chạy (animals/raccoon-brain.js + bộ chân IK
        //  animals/quadruped.js) ⇒ GẮN DA mẫu vào khung đó thay cho khung của mẫu:
        //  · toạ độ BIND của mẫu (đứng 4 chân, cm, mặt +z, đất y 0) → toạ độ gấu mèo (mặt +x): quay −90° quanh trục đứng, tỉ lệ K = khoảng hông trước–sau cũ
        //    (0,27 s) / khoảng tương ứng của mẫu; giữa 2 hông trùng chỗ cũ. Hông, dài đùi / cẳng (L1, L2), cổ chân trên đất (ankleH), cổ, đầu, gốc đuôi
        //    lấy theo khớp mẫu ⇒ IK đặt bàn chân đúng đất với chân của mẫu.
        //  · dáng bind: khung cũ xoay hông / gối / bàn chân cho trùng hướng xương mẫu lúc bind ⇒ lúc IK chạy, da theo khung y như mẫu.
        //  · mỗi khớp mẫu → 1 nhóm của khung cũ (xương sống → aft / torso / fore, vai → torso, chân → hip · knee · paw, ngón → paw, đầu + hàm → head,
        //    đuôi → đuôi mềm: gốc theo aft, các khúc theo đoạn đuôi mềm gần nhất — đuôi mềm đổi hướng + dài theo đuôi mẫu). Trọng số giữ của mẫu.
        //  · lưới cũ ẩn (khung giữ để chạy hành vi); mắt phản quang ban đêm dời tới mắt mẫu. Chưa nạp xong thì gấu mèo cũ vẫn hiện.
        //  Đoạn "Run" 0,79 s của mẫu không dùng: phi nhảy của khung cũ đã dựng theo đoạn này (G 15/10) ----
        (() => {
          const RAC_GLB = window.__racGlb || 'https://michaeltran75.github.io/3d-garden/models/raccoon.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          const O = raccoonObj, U = O.userData, s = U.s;
          ldTrack(import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync(RAC_GLB)).then(ldAfter).then(gl => {
            let src = null; gl.scene.traverse(o => { if (o.isSkinnedMesh) src = o; });
            const sk = src.skeleton, J = {}, M4 = new THREE.Matrix4();
            sk.bones.forEach((b, j) => { J[b.name.replace(/_\d+$/, '')] = new THREE.Vector3().setFromMatrixPosition(M4.copy(sk.boneInverses[j]).invert()); });   // khớp lúc bind (cùng hệ với đỉnh)
            // ---- hệ mẫu (x trái, y lên, z trước, cm) → hệ gấu mèo (x trước, y lên, z = −x mẫu) ----
            const K = 0.27 * s / (J.front_thigh_L.z - J.thigh_L.z), OX = -0.015 * s - K * (J.front_thigh_L.z + J.thigh_L.z) / 2;
            const T = p => new THREE.Vector3(K * p.z + OX, K * p.y, -K * p.x);
            const TP = U.torso.position.clone().set(0, U.H0, 0), loc = p => T(p).sub(TP);   // toạ độ trong thân (thân ở độ cao đứng H0)
            // ---- khung cũ theo khớp mẫu ----
            const legJ = [['front_thigh_R', 'front_shin_R', 'front_foot_R'], ['front_thigh_L', 'front_shin_L', 'front_foot_L'], ['thigh_R', 'shin_R', 'foot_00_R'], ['thigh_L', 'shin_L', 'foot_00_L']];   // chân cũ: z > 0 = phải mẫu
            U.legs.forEach((L, i) => {
              const [h, k, a] = legJ[i].map(n => J[n]), H = loc(h), Kn = loc(k), A = loc(a);
              L.hip.position.copy(H); L.L1 = Kn.distanceTo(H); L.L2 = A.distanceTo(Kn); L.knee.position.set(0, -L.L1, 0); L.paw.position.set(0, -L.L2, 0);
              L.ankleH = K * a.y; L.bindK = Kn; L.bindA = A;
            });
            U.neck.position.copy(loc(J.neck)); U.head.position.copy(T(J.head).sub(T(J.neck)));
            U.fore.position.set(0, 0, 0); U.aft.position.set(0, 0, 0);
            const brain = raccoonBrain, tail = brain.tail;
            if (tail) {   // đuôi mềm: gốc = tail_00, hướng + dài theo đuôi mẫu (tail_00 → tail_04 + khúc ngọn)
              const t0 = loc(J.tail_00), t4 = loc(J.tail_04), d = t4.clone().sub(t0); U.tailHost.position.copy(t0);
              tail.o.dir.copy(d).normalize(); tail.o.len = d.length() * 1.15 / tail.o.n; tail.init = false;
            }
            // ---- DÁNG BIND: thân thẳng ở H0, chân xoay trùng hướng xương mẫu ----
            U.torso.position.copy(TP); U.torso.rotation.set(0, 0, 0); U.fore.rotation.set(0, 0, 0); U.aft.rotation.set(0, 0, 0); U.neck.rotation.set(0, 0, 0); U.head.rotation.set(0, 0, 0);
            const _d = new THREE.Vector3(), _q = new THREE.Quaternion();
            U.legs.forEach(L => {
              _d.copy(L.bindK).sub(L.hip.position).normalize();
              const a = Math.atan2(_d.x, Math.hypot(_d.y, _d.z)), b = Math.atan2(-_d.z, -_d.y); L.hip.rotation.set(b, 0, a);
              _d.copy(L.bindA).sub(L.bindK).applyQuaternion(_q.copy(L.hip.quaternion).invert()).normalize();
              const kz = Math.atan2(_d.x, -_d.y); L.knee.rotation.set(0, 0, kz); L.paw.rotation.set(0, 0, -(a + kz));   // bàn chân phẳng như IK
            });
            O.updateMatrixWorld(true);
            if (tail) updateSoftTail(tail, 1 / 60, 0, 0);
            O.updateMatrixWorld(true);
            // ---- xương mới = các nhóm khung cũ; khớp mẫu → nhóm ----
            const bones = [U.torso, U.fore, U.aft, U.neck, U.head, ...U.legs.flatMap(L => [L.hip, L.knee, L.paw]), ...(tail ? tail.segs : [])], idx = o => bones.indexOf(o);
            const segOf = p => { if (!tail) return U.aft; let best = tail.segs[0], bd = 1e9; const w = O.localToWorld(T(p)); for (const m of tail.segs) { const d = m.getWorldPosition(_d).distanceTo(w); if (d < bd) { bd = d; best = m; } } return best; };
            const legOf = n => U.legs[(/^(front|f_)/.test(n) ? 0 : 2) + (/_L$/.test(n) ? 1 : 0)];
            const map = sk.bones.map(bn => {
              const n = bn.name.replace(/_\d+$/, '');
              if (/^(spine_00|spine_01|tail_00)$/.test(n)) return U.aft;
              if (/^(spine_02|shoulder_[LR]|_rootJoint|Root)$/.test(n) || n === 'Root_01') return U.torso;
              if (/^(spine_03|ribcage)$/.test(n)) return U.fore;
              if (n === 'neck') return U.neck;
              if (/^(head|jaw_lower)$/.test(n)) return U.head;
              if (/^tail_0[1-4]$/.test(n)) return segOf(J[n]);
              const L = legOf(n);
              if (/thigh/.test(n)) return L.hip;
              if (/shin/.test(n)) return L.knee;
              return L.paw;   // bàn chân, ngón, foot_00 / foot_01
            }).map(idx);
            // ---- lưới: đỉnh bind của mẫu → hệ gấu mèo; chỉ số xương đổi theo bảng, trọng số giữ, gộp xương trùng ----
            const g0 = src.geometry, P0 = g0.attributes.position, N0 = g0.attributes.normal, SI = g0.attributes.skinIndex, SW = g0.attributes.skinWeight, n = P0.count;
            const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4), v = new THREE.Vector3(), nm = new THREE.Matrix3().getNormalMatrix(src.bindMatrix);
            for (let i = 0; i < n; i++) {
              v.fromBufferAttribute(P0, i).applyMatrix4(src.bindMatrix); T(v).toArray(pos, i * 3);
              v.fromBufferAttribute(N0, i).applyMatrix3(nm); nor[i * 3] = v.z; nor[i * 3 + 1] = v.y; nor[i * 3 + 2] = -v.x;
              const acc = new Map(); for (let k = 0; k < 4; k++) { const w = SW.getComponent(i, k); if (w > 0) { const b = map[SI.getComponent(i, k)]; acc.set(b, (acc.get(b) || 0) + w); } }
              const e = [...acc].sort((p, q) => q[1] - p[1]).slice(0, 4), tw = e.reduce((t, x) => t + x[1], 0) || 1;
              e.forEach(([b, w], k) => { si[i * 4 + k] = b; sw[i * 4 + k] = w / tw; });
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', g0.attributes.uv);
            geo.setAttribute('skinIndex', new THREE.BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4)); if (g0.index) geo.setIndex(g0.index); geo.computeBoundingSphere();
            const sm0 = src.material, mat = new THREE.MeshLambertMaterial({ map: sm0.map, side: THREE.DoubleSide });
            const mesh = new THREE.SkinnedMesh(geo, mat); mesh.name = 'Gấu mèo (mẫu GLB avatrass)'; mesh.castShadow = true; mesh.frustumCulled = false; mesh.userData.noBatch = mesh.userData.noBake = true;
            O.add(mesh); O.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones), mesh.matrixWorld);
            // ---- lưới cũ ẩn; mắt phản quang tới mắt mẫu ----
            O.traverse(o => { if (o.isMesh && o !== mesh && !U.eyes.includes(o)) o.visible = false; o.userData.noBatch = true; });
            for (const ob of [O, ...O.children]) ob.userData.noBatch = true;
            { const ray = new THREE.Raycaster(); mesh.skeleton.update();   // mắt mẫu (vòng trắng trên mặt nạ) ~ đầu + (·, 0,024, ±0,026): chiếu tia từ trước mặt vào, đặt đốm sát mặt da
              U.eyes.forEach((e, i) => { const ey = 0.024 * s, ez = (i ? 1 : -1) * 0.026 * s, from = U.head.localToWorld(new THREE.Vector3(0.5 * s, ey, ez)), to = U.head.localToWorld(new THREE.Vector3(0, ey, ez));
                ray.set(from, to.sub(from).normalize()); const h = ray.intersectObject(mesh, false)[0]; e.position.set(h ? U.head.worldToLocal(h.point).x + 0.004 * s : 0.09 * s, ey, ez); e.scale.setScalar(0.7); }); }
            U.torso.position.y = U.H0; brain.rig.reset();   // góc khớp: khung hành vi đặt lại ngay khung sau
            U.glb = mesh;
          }).catch(err => console.warn('Raccoon GLB:', err)));
        })();
