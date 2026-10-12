        // ===== GỘP LƯỢT VẼ ("skinning cứng") — vật có cử động vẫn chỉ tốn vài draw call =====
        //  · Mỗi mảnh hình (Mesh · nét viền LineSegments · dây Line) VẪN NẰM NGUYÊN trong cây đối tượng: code hoạt ảnh xoay, dời, ẩn/hiện, đổi chỗ cha như cũ;
        //    công cụ Chọn và lưới tránh vật cản của ong bướm vẫn đọc đúng mảnh gốc. Nhưng mảnh gốc không tự vẽ nữa (chuyển sang lớp ẩn HIDE_LAYER).
        //  · Hình vẽ thật: các mảnh cùng kiểu vật liệu gộp thành 1 lưới da (SkinnedMesh) — mỗi mảnh là 1 "xương" = ma trận thế giới của chính nó,
        //    renderer đọc lại sau khi cập nhật ma trận (đúng khung hình, không trễ); màu từng mảnh ghi vào màu đỉnh. Mảnh nhiều vật liệu tách theo nhóm mặt.
        //  · Mảnh (hoặc nhánh cha) bị ẩn → xương co về 1 điểm ngoài khung nhìn. Ma trận không đổi thì không tải lại texture xương.
        //  · Tự TÁCH mảnh ra vẽ riêng khi code đổi nó lúc chạy: đổi màu/độ mờ/needsUpdate vật liệu, đổi hoặc biến dạng hình (tách hẳn);
        //    tạm thay vật liệu (vd. xem xuyên xe) hoặc bật trong suốt (tạm tự vẽ, trả lại khi hết).
        //  · Không gộp: mặt trong suốt (để renderer còn xếp thứ tự xa–gần), vật phát sáng, shader riêng, Sprite, InstancedMesh,
        //    mảnh đánh dấu userData.noBatch (hình biến dạng mỗi khung). Dây/nét trong suốt thì gộp được.
        const HIDE_LAYER = 31, drawBatches = [];
        const _defBeforeCompile = THREE.Material.prototype.onBeforeCompile, _defBeforeRender = THREE.Object3D.prototype.onBeforeRender;
        const BATCH_MAT_PROPS = ['type', 'side', 'flatShading', 'fog', 'toneMapped', 'depthTest', 'depthWrite', 'alphaTest', 'transparent', 'opacity', 'shininess', 'roughness', 'metalness',
          'reflectivity', 'wireframe', 'blending', 'colorWrite', 'polygonOffset', 'polygonOffsetFactor', 'polygonOffsetUnits', 'dithering', 'shadowSide', 'combine'];
        const BATCH_MAT_MAPS = ['map', 'normalMap', 'bumpMap', 'alphaMap', 'aoMap', 'lightMap', 'specularMap', 'envMap', 'roughnessMap', 'metalnessMap'];
        const batchNeedsUv = m => !!(m.map || m.normalMap || m.bumpMap || m.alphaMap || m.aoMap || m.lightMap || m.specularMap || m.roughnessMap || m.metalnessMap);
        function batchMatKey(m) {
          let k = '';
          for (const p of BATCH_MAT_PROPS) k += m[p] + '|';
          for (const p of BATCH_MAT_MAPS) k += (m[p] ? m[p].uuid : '') + '|';
          return k + (m.specular ? m.specular.getHex() : '');
        }
        function batchableMat(m, isLine) {
          if (!m || !m.visible || !m.color || m.onBeforeCompile !== _defBeforeCompile || (m.transparent && !isLine)) return false;
          if (isLine ? !m.isLineBasicMaterial || m.isLineDashedMaterial : !(m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isMeshToonMaterial)) return false;
          if (!isLine && m.wireframe) return false;
          return !(m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0);   // vật phát sáng (đèn, than hồng) thường đổi cường độ lúc chạy
        }
        function batchable(o) {
          if (!(o.isMesh || o.isLine) || o.isInstancedMesh || o.isSkinnedMesh || o.isBatchedMesh || o.isLineLoop || o.isSprite) return false;
          const g = o.geometry, P = g && g.attributes.position, isLine = !o.isMesh;
          if (!P || P.isInterleavedBufferAttribute || P.itemSize !== 3 || P.usage === THREE.DynamicDrawUsage || P.count < 2) return false;
          if (o.layers.mask !== 1 || o.onBeforeRender !== _defBeforeRender || o.customDepthMaterial || o.customDistanceMaterial) return false;
          if (g.morphAttributes.position || g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          if (Array.isArray(o.material) && (isLine || !g.groups.length)) return false;
          for (const m of mats) if (!batchableMat(m, isLine) || (batchNeedsUv(m) && !g.attributes.uv)) return false;
          return true;
        }
        function collectBatchParts(o, out) {
          if (o.userData.noBatch || o.userData.batchRoot) return;
          if (!o.userData.batched && batchable(o)) out.push(o);
          for (const c of o.children) collectBatchParts(c, out);
        }
        class SkinnedLines extends THREE.LineSegments {   // nét viền dùng chung cơ chế skinning của renderer (shader 'basic' đã có sẵn đoạn skinning)
          constructor(geometry, material, skeleton) {
            super(geometry, material);
            this.isSkinnedMesh = true; this.skeleton = skeleton; this.bindMode = 'attached';
            this.bindMatrix = new THREE.Matrix4(); this.bindMatrixInverse = new THREE.Matrix4();
          }
        }
        const _bIdentity = new THREE.Matrix4(), _bNrm = new THREE.Vector3(), _bPos = new THREE.Vector3(), _bBox = new THREE.Box3(), _bTmp = new THREE.Box3(), _bM = new THREE.Matrix4(), _bN3 = new THREE.Matrix3();
        const unorm16 = x => Math.round(Math.min(1, Math.max(0, x)) * 65535);
        function freeAfterUpload() { this.array = null; }   // đã nằm trên GPU → bỏ bản sao trong RAM (dựng lại khi mất ngữ cảnh WebGL)
        function buildBatchGeometry(recs, isLine, withUv, skeleton) {   // rec = 1 mảnh (hoặc 1 nhóm mặt của mảnh đa vật liệu) · xương dùng chung cả nhóm
          let nv = 0, ni = 0;
          for (const r of recs) {
            const g = r.o.geometry, n = g.attributes.position.count;
            r.v0 = nv; nv += n;
            ni += isLine && !r.o.isLineSegments ? (n - 1) * 2 : r.count;
          }
          const pos = new Float32Array(nv * 3), col = new Uint16Array(nv * 3), nrm = isLine ? null : new Int16Array(nv * 3), uv = withUv ? new Float32Array(nv * 2) : null;
          const big = skeleton.bones.length > 255, sIdx = big ? new Uint16Array(nv * 4) : new Uint8Array(nv * 4), sW = new Uint8Array(nv * 4);
          const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
          let k = 0;
          _bBox.makeEmpty();
          for (const r of recs) {
            const o = r.o, m = r.mat, g = o.geometry, P = g.attributes.position, n = P.count, v0 = r.v0, bone = r.bone, bi = bone.i, L = bone.L;
            if (L) _bN3.getNormalMatrix(L);
            let N = g.attributes.normal;
            if (!isLine && !N && !m.isMeshBasicMaterial) { const tmp = g.clone(); tmp.computeVertexNormals(); N = tmp.attributes.normal; }
            const C = m.vertexColors && g.attributes.color, U = withUv ? g.attributes.uv : null, cr = m.color.r, cg = m.color.g, cb = m.color.b;
            for (let i = 0; i < n; i++) {   // cả bộ đỉnh của hình (nhóm mặt chỉ chọn tam giác) — đỉnh thừa không vẽ
              const v = v0 + i;
              _bPos.fromBufferAttribute(P, i); if (L) _bPos.applyMatrix4(L);
              pos[v * 3] = _bPos.x; pos[v * 3 + 1] = _bPos.y; pos[v * 3 + 2] = _bPos.z;
              col[v * 3] = unorm16(cr * (C ? C.getX(i) : 1)); col[v * 3 + 1] = unorm16(cg * (C ? C.getY(i) : 1)); col[v * 3 + 2] = unorm16(cb * (C ? C.getZ(i) : 1));
              if (nrm && N) { _bNrm.fromBufferAttribute(N, i); if (L) _bNrm.applyMatrix3(_bN3); _bNrm.normalize(); nrm[v * 3] = Math.round(_bNrm.x * 32767); nrm[v * 3 + 1] = Math.round(_bNrm.y * 32767); nrm[v * 3 + 2] = Math.round(_bNrm.z * 32767); }
              if (uv) { uv[v * 2] = U.getX(i); uv[v * 2 + 1] = U.getY(i); }
              sIdx[v * 4] = sIdx[v * 4 + 1] = sIdx[v * 4 + 2] = sIdx[v * 4 + 3] = bi; sW[v * 4] = 255;
            }
            const I = g.index;
            if (isLine && !o.isLineSegments) { for (let i = 0; i < n - 1; i++) { idx[k++] = v0 + i; idx[k++] = v0 + i + 1; } }   // dây Line liền → các đoạn rời
            else {
              const flip = !isLine && m.side !== THREE.DoubleSide && o.matrixWorld.determinant() < 0;   // mảnh soi gương (scale âm) → đảo chiều tam giác
              for (let i = r.start, e = r.start + r.count; i < e; i += isLine ? 2 : 3) {
                const a = I ? I.getX(i) : i, b = I ? I.getX(i + 1) : i + 1;
                if (isLine) { idx[k++] = v0 + a; idx[k++] = v0 + b; continue; }
                const c = I ? I.getX(i + 2) : i + 2;
                idx[k++] = v0 + a; idx[k++] = v0 + (flip ? c : b); idx[k++] = v0 + (flip ? b : c);
              }
            }
            if (!g.boundingBox) g.computeBoundingBox();
            _bBox.union(_bTmp.copy(g.boundingBox).applyMatrix4(o.matrixWorld));
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          geo.setAttribute('color', new THREE.BufferAttribute(col, 3, true));
          if (nrm) geo.setAttribute('normal', new THREE.BufferAttribute(nrm, 3, true));
          if (uv) geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
          geo.setAttribute('skinIndex', new THREE.BufferAttribute(sIdx, 4));
          geo.setAttribute('skinWeight', new THREE.BufferAttribute(sW, 4, true));
          geo.setIndex(new THREE.BufferAttribute(k === ni ? idx : idx.slice(0, k), 1));
          const sphere = _bBox.getBoundingSphere(new THREE.Sphere()); sphere.radius += 50;   // vật còn đi lại → nới rộng (chỉ dùng xếp thứ tự vẽ)
          geo.boundingSphere = sphere; geo.boundingBox = _bBox.clone().expandByScalar(50);
          for (const a of Object.values(geo.attributes)) a.onUpload(freeAfterUpload);
          geo.index.onUpload(freeAfterUpload);
          return geo;
        }
        function buildBatchMesh(recs, isLine, withUv, sampleMat, sample, name, skeleton) {
          const geo = buildBatchGeometry(recs, isLine, withUv, skeleton), sphere = geo.boundingSphere;
          const mat = sampleMat.clone(); mat.color.setRGB(1, 1, 1); mat.vertexColors = true; mat.name = 'gộp: ' + (sampleMat.name || sampleMat.type);
          let mesh;
          if (isLine) mesh = new SkinnedLines(geo, mat, skeleton);
          else {
            mesh = new THREE.SkinnedMesh(geo, mat); mesh.bind(skeleton, _bIdentity);
            mesh.boundingSphere = sphere.clone(); mesh.boundingBox = geo.boundingBox.clone();
          }
          mesh.name = name; mesh.frustumCulled = false; mesh.raycast = () => {};
          mesh.castShadow = sample.castShadow; mesh.receiveShadow = sample.receiveShadow; mesh.renderOrder = sample.renderOrder;
          mesh.userData.batchSrc = { recs, isLine, withUv, skeleton };
          return mesh;
        }
        listen(renderer.domElement, 'webglcontextrestored', () => {   // GPU mất rồi có lại ngữ cảnh: dựng lại bộ đệm từ các mảnh gốc (bản RAM đã bỏ)
          for (const b of drawBatches) for (const m of b.meshes) { const S = m.userData.batchSrc, old = m.geometry; m.geometry = buildBatchGeometry(S.recs, S.isLine, S.withUv, S.skeleton); old.dispose(); }
        });
        function batchEject(c) { c.state = 2; c.o.layers.set(0); return 2; }
        function batchCtlState(c) {   // trạng thái 1 mảnh gốc: 0 trong lô · 1 tạm tự vẽ · 2 tách hẳn
          if (c.state === 2) return 2;
          const o = c.o;
          if (o.geometry !== c.geo || c.geo.attributes.position.version !== c.ver) return batchEject(c);
          let own = o.material !== c.mref;
          for (let i = 0; i < c.mats.length; i++) {
            const m = c.mats[i], s = c.snap[i];
            if (m.version !== s.v || m.color.r !== s.r || m.color.g !== s.g || m.color.b !== s.b || m.opacity !== s.op) return batchEject(c);
            if (m.transparent !== s.tr || m.visible !== s.vis) own = true;   // bật trong suốt / ẩn riêng 1 vật liệu → mảnh gốc tự vẽ cho đúng
          }
          if (own !== (c.state === 1)) { c.state = own ? 1 : 0; o.layers.set(own ? 0 : HIDE_LAYER); }
          return c.state;
        }
        function batchSkeletonUpdate() {   // this = Skeleton dùng chung cả nhóm · renderer gọi 1 lần/khung SAU khi đã cập nhật ma trận thế giới
          const bones = this.batchBones, M = this.boneMatrices; let dirty = false;
          for (let i = 0, n = bones.length; i < n; i++) {
            const B = bones[i], o = B.o, b = i * 16;
            let show = batchCtlState(B) === 0;
            if (show) for (let p = o; ; p = p.parent) { if (!p || !p.visible) { show = false; break; } if (p === scene) break; }
            if (show) {
              const e = o.matrixWorld.elements, last = B.inv ? B.lw : M, base = B.inv ? 0 : b;   // mảnh đã nướng co giãn: so với ma trận thế giới lần trước
              let ch = B.hid !== false;
              if (!ch) for (let q = 0; q < 16; q++) if (last[base + q] !== Math.fround(e[q])) { ch = true; break; }
              if (ch) {
                if (B.inv) { B.lw.set(e); const f = _bM.multiplyMatrices(o.matrixWorld, B.inv).elements; for (let q = 0; q < 16; q++) M[b + q] = f[q]; }
                else for (let q = 0; q < 16; q++) M[b + q] = e[q];
                B.hid = false; dirty = true;
              }
            } else if (B.hid !== true) {
              M.fill(0, b, b + 16); M[b + 13] = -1e5; M[b + 15] = 1; B.hid = true; dirty = true;   // co về 1 điểm dưới đáy cảnh, ngoài khung nhìn
            }
          }
          if (dirty && this.boneTexture) this.boneTexture.needsUpdate = true;
        }
        function batchDraws(name, roots) {
          roots = roots.filter(Boolean);
          const parts = []; for (const root of roots) collectBatchParts(root, parts);
          scene.updateMatrixWorld(true);
          const groups = new Map(), add = (o, bone, mat, start, count) => {
            const key = (o.isMesh ? 'M' : 'L') + '|' + batchMatKey(mat) + '|' + o.castShadow + o.receiveShadow + '|' + o.renderOrder;
            let list = groups.get(key); if (!list) groups.set(key, list = []);
            list.push({ o, bone, mat, start, count });
          };
          for (const o of parts) {
            const g = o.geometry, total = g.index ? g.index.count : g.attributes.position.count;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            // 1 "xương"/mảnh gốc (cả khi mảnh có nhiều vật liệu). Mảnh co giãn KHÔNG đều (scale riêng hoặc của cha): nướng phần tuyến tính L lúc gộp
            // vào hình, xương = ma trận hiện tại × L⁻¹ → pháp tuyến đúng như khi tự vẽ (skinning chỉ xoay pháp tuyến bằng ma trận xương)
            const e = o.matrixWorld.elements, sx = Math.hypot(e[0], e[1], e[2]), sy = Math.hypot(e[4], e[5], e[6]), sz = Math.hypot(e[8], e[9], e[10]), lo = Math.min(sx, sy, sz);
            const L = lo > 1e-6 && Math.max(sx, sy, sz) / lo > 1.001 ? new THREE.Matrix4().copy(o.matrixWorld).setPosition(0, 0, 0) : null;
            const bone = { o, state: 0, geo: g, ver: g.attributes.position.version, mref: o.material, mats, i: -1, hid: undefined, L, inv: L ? L.clone().invert() : null, lw: L ? new Float32Array(16) : null,
              snap: mats.map(m => ({ v: m.version, r: m.color.r, g: m.color.g, b: m.color.b, op: m.opacity, tr: m.transparent, vis: m.visible })) };
            if (Array.isArray(o.material)) {
              for (const gr of g.groups) { const m = o.material[gr.materialIndex], s = Math.max(0, gr.start), e2 = Math.min(total, gr.start + gr.count); if (m && e2 > s) add(o, bone, m, s, e2 - s); }
            } else add(o, bone, o.material, 0, total);
          }
          // mảnh không ghép được với mảnh nào khác ở MỌI phần của nó → để nguyên tự vẽ (gộp 1 mình không bớt được lượt vẽ)
          const paired = new Set(); for (const list of groups.values()) if (list.length > 1) for (const r of list) paired.add(r.o);
          const out = { name, roots, meshes: [], parts: 0, bones: [] };
          for (const list of groups.values()) for (const r of list) if (paired.has(r.o) && r.bone.i < 0) { r.bone.i = out.bones.length; out.bones.push(r.bone); }
          if (out.bones.length) {
            const skeleton = new THREE.Skeleton(out.bones.map(B => B.o), out.bones.map(() => _bIdentity));
            skeleton.batchBones = out.bones; skeleton.update = batchSkeletonUpdate; out.skeleton = skeleton;
            for (const list of groups.values()) {
              const recs = list.filter(r => paired.has(r.o)); if (!recs.length) continue;
              const mesh = buildBatchMesh(recs, !recs[0].o.isMesh, batchNeedsUv(recs[0].mat), recs[0].mat, recs[0].o, 'Gộp vẽ · ' + name, skeleton);
              scene.add(mesh); out.meshes.push(mesh);
            }
          }
          for (const o of paired) { o.layers.set(HIDE_LAYER); o.userData.batched = true; out.parts++; }
          for (const root of roots) root.userData.batchRoot = true;
          drawBatches.push(out);
          return out;
        }
        function rootShown(o) { for (let p = o; ; p = p.parent) { if (!p || !p.visible) return false; if (p === scene) return true; } }
        function updateDrawBatches() {   // mỗi khung, trước khi vẽ: cả nhóm gốc đều ẩn (vd. thú ban ngày lúc đêm) → bỏ luôn lượt vẽ của lô
          for (const b of drawBatches) { const on = b.roots.some(rootShown); for (const m of b.meshes) m.visible = on; }
        }

        // ---- áp dụng: mỗi nhóm 1 bộ xương (1 texture) riêng → khung hình chỉ tải lại ma trận của nhóm đang cử động ----
        {
          const named = (...prefixes) => scene.children.filter(o => o.name && prefixes.some(p => o.name.startsWith(p)));
          for (const o of [pin, axesGroup, pickBox, ...named('Ba con cò')]) o.userData.noBatch = true;   // công cụ giao diện + cò (thân biến dạng theo nhịp vỗ cánh)
          batchDraws('Kỹ sư', [engObj?.g]);
          batchDraws('Chó', [dogObj]);
          batchDraws('Đàn bò', cows.map(c => c.g));
          batchDraws('Động vật ban ngày', [daytimeAnimals]);
          batchDraws('Xe caravan', [caravanObj]);
          batchDraws('Khu cắm trại', named('Ghế câu cá', 'Ghế cắm trại', 'Bếp lửa trại', 'Bàn trà', 'Giá treo nồi', 'Cần câu để dưới đất', 'Xô nhỏ', 'Đống củi', 'Khúc gỗ đứng'));
          batchDraws('Tua-bin & khí tượng', [...named('Tua-bin gió #'), wmast?.g, wmini?.g]);
          batchDraws('Cảnh tĩnh', scene.children.filter(o => !o.userData.batchRoot && !o.userData.noBatch && !o.isSkinnedMesh));
        }
