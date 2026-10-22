        // ===== BỚT RAM sau khi cảnh đã lên GPU (G 19/10 "xoá bản lưới trong RAM với những vật không cần bấm chọn, va chạm hay cắt cỏ; xoá bản ảnh canvas tĩnh
        //  trong RAM sau khi đã đưa lên GPU"). Gọi 1 lần khi lớp va chạm dựng xong (COL.ready — loop/main-loop.js), xe van giữ nguyên.
        //  · LƯỚI VỎ CÂY (thuộc tính aBk: cây cổ thụ, rễ, cây con, táo, anh đào, khúc gỗ…): vẽ thẳng, tĩnh (gió lắc trong shader) ⇒ đánh dấu tải lại 1 lần, three gọi
        //    onUpload ngay sau khi lên GPU ⇒ bỏ mảng (freeAfterUpload — core/draw-batch.js); vật chưa từng vào khung nhìn thì bỏ khi lần đầu lên GPU. Bỏ qua bản
        //    gốc của lô gộp (lớp ẩn), vật đổi bản nhiều cạnh khi cận cảnh (userData.lodHi). Công cụ Chọn: bắt tia theo HỘP TỪNG ĐOẠN cành (bakedFlightBounds,
        //    hộp vật cản bay đã có) thay cho từng tam giác. Mất ngữ cảnh WebGL rồi có lại ⇒ không tải lại được ⇒ ẩn các lưới này (hiếm).
        //  · ẢNH CANVAS TĨNH (≥ 64 × 64, chưa vẽ lại lần nào — version 1, ngoài xe van): tải lại 1 lần, three gọi texture.onUpdate ngay sau khi lên GPU ⇒ thu canvas
        //    về 1 × 1. Lưới an toàn: canvas bị thu vẫn báo cỡ cũ (width / height), lần đầu code gọi BẤT KỲ hàm vẽ nào của context thì canvas trả về cỡ cũ +
        //    trạng thái vẽ (màu, phông, ma trận…) rồi mới vẽ ⇒ ảnh vẽ lại đúng như trước (chỉ mất nội dung cũ — mọi ảnh động đều xoá rồi vẽ lại cả tấm) ----
        const MT_MESH = [], _mtM = new THREE.Matrix4(), _mtR = new THREE.Ray(), _mtB = new THREE.Box3(), _mtP = new THREE.Vector3();
        function mtRaycast(rc, hits) {   // lưới đã bỏ bản RAM: tia trúng hộp đoạn cành gần nhất (hộp bao cả lưới nếu không có hộp đoạn)
          const g = this.geometry, F = bakedFlightBounds.get(g) || g.userData.flightBounds;
          _mtM.copy(this.matrixWorld).invert(); _mtR.copy(rc.ray).applyMatrix4(_mtM);
          let best = Infinity;
          const test = () => { if (_mtR.intersectBox(_mtB, _mtP)) { _mtP.applyMatrix4(this.matrixWorld); const d = rc.ray.origin.distanceTo(_mtP); if (d >= rc.near && d <= rc.far && d < best) best = d; } };
          if (F) for (let i = 0; i < F.length; i += 6) { _mtB.min.set(F[i], F[i + 1], F[i + 2]); _mtB.max.set(F[i + 3], F[i + 4], F[i + 5]); test(); }
          else if (g.boundingBox) { _mtB.copy(g.boundingBox); test(); }
          if (best < Infinity) hits.push({ distance: best, point: rc.ray.at(best, new THREE.Vector3()), object: this });
        }
        const CV_ST = ['fillStyle', 'strokeStyle', 'font', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'lineCap', 'lineJoin', 'miterLimit',
          'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY', 'imageSmoothingEnabled', 'filter'];
        function mtCanvasFree(t) {   // texture.onUpdate: ảnh vừa lên GPU ⇒ thu canvas 1 × 1, đặt bẫy trả lại cỡ cũ khi code vẽ lại
          t.onUpdate = null; const c = t.image, x = c && !c.__mt && c.getContext && c.getContext('2d'); if (!x) return;
          const CP = CanvasRenderingContext2D.prototype, CW = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width'), CHt = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'height');
          const fns = Object.getOwnPropertyNames(CP).filter(n => n !== 'constructor' && typeof Object.getOwnPropertyDescriptor(CP, n).value === 'function');
          const w = c.width, h = c.height;
          const keep = () => { const st = {}; for (const k of CV_ST) st[k] = x[k]; return [st, CP.getTransform.call(x)]; }, put = ([st, tf]) => { for (const k of CV_ST) try { x[k] = st[k]; } catch (e) {} CP.setTransform.call(x, tf); };
          const back = () => { if (!c.__mt) return; c.__mt = 0; const s = keep(); delete c.width; delete c.height; for (const n of fns) delete x[n]; CW.set.call(c, w); CHt.set.call(c, h); put(s); };   // trạng thái lúc vẽ lại (màu / phông đặt sau khi thu vẫn giữ)
          c.__mt = 1; const s0 = keep(); for (const n of fns) x[n] = (...a) => { back(); return CP[n].apply(x, a); };
          Object.defineProperty(c, 'width', { configurable: true, get: () => w, set: v => { back(); CW.set.call(c, v); } });
          Object.defineProperty(c, 'height', { configurable: true, get: () => h, set: v => { back(); CHt.set.call(c, v); } });
          CW.set.call(c, 1); CHt.set.call(c, 1); put(s0);   // đổi cỡ xoá trạng thái context ⇒ đặt lại như trước khi thu
        }
        function memTrim() {
          const van = new Set(); caravanObj.traverse(o => van.add(o));
          const geos = new Set(), texs = new Set();
          scene.traverse(o => {
            if (van.has(o)) return;
            const g = o.geometry;
            if (o.isMesh && !o.isInstancedMesh && o.layers.mask === 1 && o.userData.lodHi === undefined && g && g.attributes.aBk && g.attributes.position.array) {
              geos.add(g); MT_MESH.push(o); if (o.raycast === THREE.Mesh.prototype.raycast) o.raycast = mtRaycast;
            }
            const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
            for (const m of ms) for (const v of [...Object.values(m), ...Object.values(m.uniforms || {}).map(u => u && u.value)]) {
              const im = v && v.isTexture && v.image;
              if (im && im.getContext && !im.__mt && v.version <= 1 && !v.userData.live && im.width * im.height >= 4096 && !texs.has(v)) texs.add(v);   // live: canvas vẽ lại liên tục (màn kính thiên văn)
            }
          });
          for (const g of geos) {
            if (!g.boundingBox) g.computeBoundingBox(); if (!g.boundingSphere) g.computeBoundingSphere();
            for (const a of [...Object.values(g.attributes), g.index]) if (a && a.array) { a.onUpload(freeAfterUpload); a.needsUpdate = true; }
          }
          for (const t of texs) { t.onUpdate = mtCanvasFree; t.needsUpdate = true; }
          memTrim.n = [geos.size, texs.size];
        }
        listen(renderer.domElement, 'webglcontextrestored', () => { for (const o of MT_MESH) if (!o.geometry.attributes.position.array) o.visible = false; });
