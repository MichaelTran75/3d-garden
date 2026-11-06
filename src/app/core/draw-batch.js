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
        //    Riêng mảnh trong suốt PHẲNG của 1 vật cử động (cánh ong): batchClear gộp theo TỪNG VẬT (lưới da là con của vật ⇒ vẫn xếp xa–gần theo vật).
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
        function batchableMat(m, isLine, clear) {   // clear: lô mảnh trong suốt (batchClear) — chỉ nhận mặt trong suốt, ngược với lô thường
          if (!m || !m.visible || !m.color || m.onBeforeCompile !== _defBeforeCompile || (!isLine && m.transparent !== !!clear)) return false;
          if (isLine ? !m.isLineBasicMaterial || m.isLineDashedMaterial : !(m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshStandardMaterial || m.isMeshBasicMaterial || m.isMeshToonMaterial)) return false;
          if (!isLine && m.wireframe) return false;
          return !(m.emissive && m.emissive.r + m.emissive.g + m.emissive.b > 0);   // vật phát sáng (đèn, than hồng) thường đổi cường độ lúc chạy
        }
        function batchable(o, clear) {
          if (!(o.isMesh || o.isLine) || (clear && !o.isMesh) || o.isInstancedMesh || o.isSkinnedMesh || o.isBatchedMesh || o.isLineLoop || o.isSprite) return false;
          const g = o.geometry, P = g && g.attributes.position, isLine = !o.isMesh;
          if (!P || P.isInterleavedBufferAttribute || P.itemSize !== 3 || P.usage === THREE.DynamicDrawUsage || P.count < 2) return false;
          if (o.layers.mask !== 1 || o.onBeforeRender !== _defBeforeRender || o.customDepthMaterial || o.customDistanceMaterial) return false;
          if (g.morphAttributes.position || g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          if (Array.isArray(o.material) && (isLine || !g.groups.length)) return false;
          for (const m of mats) if (!batchableMat(m, isLine, clear) || (batchNeedsUv(m) && !g.attributes.uv)) return false;
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
            const g = r.o.userData.aoGeo || r.o.geometry, n = g.attributes.position.count;   // aoGeo: hình chẻ + bóng góc nướng sẵn (core/ao-bake.js)
            r.v0 = nv; nv += n;
            ni += isLine && !r.o.isLineSegments ? (n - 1) * 2 : r.count;
          }
          const pos = new Float32Array(nv * 3), col = new Uint16Array(nv * 3), nrm = isLine ? null : new Int16Array(nv * 3), uv = withUv ? new Float32Array(nv * 2) : null;
          const big = skeleton.bones.length > 255, sIdx = big ? new Uint16Array(nv * 4) : new Uint8Array(nv * 4), sW = new Uint8Array(nv * 4);
          const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
          let k = 0;
          _bBox.makeEmpty();
          for (const r of recs) {
            const o = r.o, m = r.mat, g = o.userData.aoGeo || o.geometry, P = g.attributes.position, n = P.count, v0 = r.v0, bone = r.bone, bi = bone.i, L = bone.L;
            if (L) _bN3.getNormalMatrix(L);
            let N = g.attributes.normal;
            if (!isLine && !N && !m.isMeshBasicMaterial) { const tmp = g.clone(); tmp.computeVertexNormals(); N = tmp.attributes.normal; }
            const C = m.vertexColors && g.attributes.color, U = withUv ? g.attributes.uv : null, A = g.attributes.ao, cr = m.color.r, cg = m.color.g, cb = m.color.b;
            for (let i = 0; i < n; i++) {   // cả bộ đỉnh của hình (nhóm mặt chỉ chọn tam giác) — đỉnh thừa không vẽ
              const v = v0 + i;
              _bPos.fromBufferAttribute(P, i); if (L) _bPos.applyMatrix4(L);
              pos[v * 3] = _bPos.x; pos[v * 3 + 1] = _bPos.y; pos[v * 3 + 2] = _bPos.z;
              const ka = A ? A.getX(i) : 1;   // hệ số sáng bóng góc (1 = trống)
              col[v * 3] = unorm16(cr * ka * (C ? C.getX(i) : 1)); col[v * 3 + 1] = unorm16(cg * ka * (C ? C.getY(i) : 1)); col[v * 3 + 2] = unorm16(cb * ka * (C ? C.getZ(i) : 1));
              if (nrm && N) { _bNrm.fromBufferAttribute(N, i); if (L) _bNrm.applyMatrix3(_bN3); _bNrm.normalize(); nrm[v * 3] = Math.round(_bNrm.x * 32767); nrm[v * 3 + 1] = Math.round(_bNrm.y * 32767); nrm[v * 3 + 2] = Math.round(_bNrm.z * 32767); }
              if (uv) { uv[v * 2] = U.getX(i); uv[v * 2 + 1] = U.getY(i); }
              sIdx[v * 4] = sIdx[v * 4 + 1] = sIdx[v * 4 + 2] = sIdx[v * 4 + 3] = bi; sW[v * 4] = 255;
            }
            const I = g.index;
            if (isLine && !o.isLineSegments) { for (let i = 0; i < n - 1; i++) { idx[k++] = v0 + i; idx[k++] = v0 + i + 1; } }   // dây Line liền → các đoạn rời
            else {
              const flip = !isLine && (m.side !== THREE.DoubleSide || m.transparent) && o.matrixWorld.determinant() < 0;   // mảnh soi gương (scale âm) → đảo chiều tam giác
              // (lô trong suốt 2 mặt cũng đảo: lưới da có định thức dương ⇒ không đảo thì mặt thấy được bị coi là mặt sau, pháp tuyến lật, cánh phải sáng như mặt dưới)
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
        function batchAoRefresh(objs) {   // core/ao-bake.js: mảnh có hình chẻ + bóng góc (userData.aoGeo) ⇒ dựng lại lô chứa nó theo hình mới, rồi bỏ hình chẻ
          const S = new Set(objs), cnt = g => g.index ? g.index.count : g.attributes.position.count;   // (lô lên GPU xong bỏ bản RAM; mất ngữ cảnh ⇒ dựng từ hình gốc, ao-bake nướng lại)
          for (const b of drawBatches) for (const m of b.meshes) {
            const src = m.userData.batchSrc; if (!src || !src.recs.some(r => S.has(r.o))) continue;
            for (const r of src.recs) if (S.has(r.o)) { r.start = 0; r.count = cnt(r.o.userData.aoGeo); }
            const old = m.geometry; m.geometry = buildBatchGeometry(src.recs, src.isLine, src.withUv, src.skeleton); old.dispose();
            for (const r of src.recs) if (S.has(r.o)) r.count = cnt(r.o.geometry);
          }
          for (const o of objs) delete o.userData.aoGeo;
        }
        listen(renderer.domElement, 'webglcontextrestored', () => {   // GPU mất rồi có lại ngữ cảnh: dựng lại bộ đệm từ các mảnh gốc (bản RAM đã bỏ)
          for (const b of drawBatches) for (const m of b.meshes) { const S = m.userData.batchSrc, old = m.geometry; m.geometry = buildBatchGeometry(S.recs, S.isLine, S.withUv, S.skeleton); old.dispose(); }
        });
        function batchEject(c) { c.state = 2; c.o.layers.set(0); return 2; }
        function batchCtlState(c) {   // trạng thái 1 mảnh gốc: 0 trong lô · 1 tạm tự vẽ · 2 tách hẳn
          if (c.state === 2) return 2;
          const o = c.o;
          let own = o.material !== c.mref;
          if (o.geometry !== c.geo) { if (!o.userData.lodHi) return batchEject(c); own = true; }   // đang dùng bản nhiều cạnh cận cảnh (loop/close-up.js): tạm tự vẽ, lùi xa trả về lô
          else if (c.geo.attributes.position.version !== c.ver) return batchEject(c);
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
        function batchBone(o, mats) {   // bản ghi xương của 1 mảnh gốc (ma trận thế giới đã cập nhật)
          // 1 "xương"/mảnh gốc (cả khi mảnh có nhiều vật liệu). Mảnh co giãn KHÔNG đều (scale riêng hoặc của cha): nướng phần tuyến tính L lúc gộp
          // vào hình, xương = ma trận hiện tại × L⁻¹ → pháp tuyến đúng như khi tự vẽ (skinning chỉ xoay pháp tuyến bằng ma trận xương)
          const g = o.geometry, e = o.matrixWorld.elements, sx = Math.hypot(e[0], e[1], e[2]), sy = Math.hypot(e[4], e[5], e[6]), sz = Math.hypot(e[8], e[9], e[10]), lo = Math.min(sx, sy, sz);
          const L = lo > 1e-6 && Math.max(sx, sy, sz) / lo > 1.001 ? new THREE.Matrix4().copy(o.matrixWorld).setPosition(0, 0, 0) : null;
          return { o, state: 0, geo: g, ver: g.attributes.position.version, mref: o.material, mats, i: -1, hid: undefined, L, inv: L ? L.clone().invert() : null, lw: L ? new Float32Array(16) : null,
            snap: mats.map(m => ({ v: m.version, r: m.color.r, g: m.color.g, b: m.color.b, op: m.opacity, tr: m.transparent, vis: m.visible })) };
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
            const bone = batchBone(o, mats);
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
        // ---- LÔ MẢNH TRONG SUỐT THEO TỪNG VẬT (G 01/11, cánh ong — mỗi lá cánh từng là 2 lượt vẽ riêng): lô thường bỏ mặt trong suốt vì renderer phải xếp
        //  chúng xa → gần theo từng vật. Ở đây mảnh trong suốt PHẲNG cùng kiểu vật liệu của MỘT vật cử động (4 lá cánh 1 con ong) gộp thành 1 lưới da làm CON
        //  của vật đó ⇒ vẫn được xếp xa–gần (theo tâm cầu bao của vật), cắt theo khung nhìn, ẩn theo vật. Xương = mảnh gốc như batchDraws (lớp ẩn, tự tách khi
        //  đổi vật liệu / hình, co về 1 điểm khi ẩn); mọi vật trong 1 lần gọi dùng chung 1 bộ xương (1 texture nhỏ tải lại mỗi khung).
        //  · 1 LƯỢT: three vẽ vật trong suốt 2 mặt 2 lượt (mặt sau rồi mặt trước, đặt needsUpdate vật liệu mỗi lượt). Mảnh PHẲNG chỉ quay 1 mặt về camera nên
        //    forceSinglePass ra đúng các điểm ảnh đó — đặt cả cho vật liệu gốc: renderer.compile (dựng shader trước khung đầu) khỏi tăng version ⇒ mảnh gốc
        //    không bị tách khỏi lô. Mảnh chồng nhau TRONG 1 vật vẽ theo thứ tự trong lô thay vì xa–gần: cánh trước + cánh sau cùng mặt phẳng, cùng màu ⇒ y hệt;
        //    cánh trái chồng cánh phải (khác hướng sáng) lệch tối đa a²·Δc (a = 0,42) ở vài điểm ảnh lúc vỗ.
        //  · Cầu bao trong hệ vật: tâm = trung bình gốc cha các mảnh (vai cánh), bán kính phủ mảnh khi quay quanh gốc cha ⇒ đúng ở mọi góc vỗ. Hộp bao RỖNG:
        //    Box3.setFromObject (khung công cụ Chọn) chỉ tính mảnh gốc như cũ; tia chọn vẫn trúng mảnh gốc (lớp ẩn, tia bật mọi lớp) ----
        const _bF0 = new THREE.Vector3(), _bF1 = new THREE.Vector3(), _bF2 = new THREE.Vector3(), _bFn = new THREE.Vector3(), _bFc = new THREE.Vector3();
        function batchFlat(g) {   // mọi đỉnh trên 1 mặt phẳng (sai số 1e-5 × bán kính)
          const P = g.attributes.position, n = P.count; if (n < 3) return false;
          if (!g.boundingSphere) g.computeBoundingSphere();
          _bF0.fromBufferAttribute(P, 0); let far = 0, best = 0;
          for (let i = 1; i < n; i++) { const d = _bF1.fromBufferAttribute(P, i).distanceToSquared(_bF0); if (d > best) { best = d; far = i; } }
          _bF1.fromBufferAttribute(P, far).sub(_bF0); _bFn.set(0, 0, 0); best = 0;
          for (let i = 1; i < n; i++) { _bFc.crossVectors(_bF1, _bF2.fromBufferAttribute(P, i).sub(_bF0)); const d = _bFc.lengthSq(); if (d > best) { best = d; _bFn.copy(_bFc); } }
          if (best < 1e-20) return true;   // đỉnh thẳng hàng
          _bFn.normalize(); const eps = 1e-5 * Math.max(1e-6, g.boundingSphere.radius);
          for (let i = 0; i < n; i++) if (Math.abs(_bF2.fromBufferAttribute(P, i).sub(_bF0).dot(_bFn)) > eps) return false;
          return true;
        }
        function batchClear(name, roots) {
          // uuid mỗi vật / hình / vật liệu / texture three.js lấy từ Math.random ⇒ dựng lô bằng dãy ngẫu nhiên RIÊNG: dãy chung của cảnh (đặt cây, hành vi thú
          //  mỗi khung…) y như khi chưa có lô — bản trước / sau so được tất định (simhash). Texture xương tạo luôn lúc dựng (three tự tạo ở khung vẽ đầu tiên thì
          //  lấy 4 số của dãy chung giữa khung ⇒ ong, đom đóm, chim lệch hết)
          const RND = Math.random; let rs = 0x2545F491;
          Math.random = () => { rs = rs + 0x6D2B79F5 | 0; let t = Math.imul(rs ^ rs >>> 15, 1 | rs); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
          try { return batchClearIn(name, roots); } finally { Math.random = RND; }
        }
        function batchClearIn(name, roots) {
          roots = roots.filter(Boolean); scene.updateMatrixWorld(true);
          const out = { name, roots, meshes: [], parts: 0, bones: [] }, jobs = [];
          const walk = (o, f) => { if (o.userData.noBatch) return; f(o); for (const c of o.children) walk(c, f); };
          for (const root of roots) {
            const groups = new Map();
            walk(root, o => {
              if (o.userData.batched || !batchable(o, true) || Array.isArray(o.material) || !batchFlat(o.geometry)) return;
              const key = batchMatKey(o.material) + '|' + o.castShadow + o.receiveShadow + '|' + o.renderOrder;
              let list = groups.get(key); if (!list) groups.set(key, list = []); list.push(o);
            });
            for (const list of groups.values()) if (list.length > 1) jobs.push({ root, recs: list.map(o => {
              const g = o.geometry, B = batchBone(o, [o.material]); B.i = out.bones.length; out.bones.push(B);
              return { o, bone: B, mat: o.material, start: 0, count: g.index ? g.index.count : g.attributes.position.count };
            }) });
          }
          if (!jobs.length) return out;
          const skeleton = new THREE.Skeleton(out.bones.map(B => B.o), out.bones.map(() => _bIdentity));
          skeleton.batchBones = out.bones; skeleton.update = batchSkeletonUpdate; out.skeleton = skeleton; skeleton.computeBoneTexture();
          const inv = new THREE.Matrix4(), M = new THREE.Matrix4(), v = new THREE.Vector3();
          for (const { root, recs } of jobs) {
            for (const r of recs) r.mat.forceSinglePass = true;   // mảnh gốc phẳng: 1 lượt = 2 lượt (version vật liệu không đổi)
            const mesh = buildBatchMesh(recs, false, batchNeedsUv(recs[0].mat), recs[0].mat, recs[0].o, 'Gộp vẽ · ' + name, skeleton);
            mesh.material.forceSinglePass = true; mesh.frustumCulled = true;
            inv.copy(root.matrixWorld).invert();
            const piv = recs.map(r => new THREE.Vector3().setFromMatrixPosition(r.o.parent.matrixWorld).applyMatrix4(inv)), c = new THREE.Vector3();
            for (const p of piv) c.add(p); c.divideScalar(piv.length);
            let R = 0;
            recs.forEach((r, k) => {
              const P = r.o.geometry.attributes.position; let d = 0; M.multiplyMatrices(inv, r.o.matrixWorld);
              for (let i = 0; i < P.count; i++) d = Math.max(d, v.fromBufferAttribute(P, i).applyMatrix4(M).distanceTo(piv[k]));
              R = Math.max(R, piv[k].distanceTo(c) + d);
            });
            mesh.boundingSphere = new THREE.Sphere(c, R * 1.01); mesh.boundingBox = new THREE.Box3();
            root.add(mesh); out.meshes.push(mesh);
            for (const r of recs) { r.o.layers.set(HIDE_LAYER); r.o.userData.batched = true; out.parts++; }
          }
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
          for (const o of [pin, axesGroup, ...named('Ba con cò')]) o.userData.noBatch = true;   // ghim + trục toạ độ (khung chọn tự đánh dấu: ui/labels-controls.js) + cò (thân biến dạng theo nhịp vỗ cánh)
          worldJoin('drawBatch', 70, B => B.draws('Khu cắm trại', named('Ghế câu cá', 'Ghế cắm trại', 'Bếp lửa trại', 'Bàn trà', 'Giá treo nồi', 'Cần câu để dưới đất', 'Xô nhỏ', 'Đống củi', 'Khúc gỗ đứng')));
          worldJoin('drawBatch', 80, B => B.draws('Tua-bin & khí tượng', [...named('Tua-bin gió #'), wmast?.g, wmini?.g]));
          // đơn vị tự xin lô (worldJoin('drawBatch', thứ tự, B => …) ở tệp của nó — thứ tự = thứ tự dựng lô cũ): B.draws(tên, gốc) · B.clear(tên, gốc) ·
          //  B.skip(gốc) (tự vẽ, không gộp) · B.with(tên, gốc) (gửi thêm gốc vào lô của bên khác, xin trước khi lô dựng)
          const batchWith = new Map();
          worldServe('drawBatch', { draws: (name, roots) => batchDraws(name, [...roots, ...(batchWith.get(name) || [])]), clear: batchClear, skip: o => { o.userData.noBatch = true; },
            with: (name, roots) => batchWith.set(name, [...(batchWith.get(name) || []), ...roots]) });
          batchDraws('Cảnh tĩnh', scene.children.filter(o => !o.userData.batchRoot && !o.userData.noBatch && !o.isSkinnedMesh));
        }
