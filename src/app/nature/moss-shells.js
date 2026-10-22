        // ===== THẢM RÊU NHUNG (G 20/10 "em cho rêu cũng giống như thảm rêu đc ko? sợi rêu nhung thay vì render flat") =====
        //  Kỹ thuật LỚP VỎ (shell texturing — như vẽ lông thú): vẽ lại phần lưới có thể mọc rêu thêm N lớp phồng dần theo pháp tuyến (thảm cao 3 cm),
        //  mỗi lớp chỉ giữ các chấm SỢI RÊU (ô ~1,3 cm theo toạ độ thế giới, mỗi ô 1 sợi lệch tâm, cao ngẫu nhiên, thon dần lên ngọn) nằm trong vùng rêu tính
        //  ở core/surface-style.js (cùng hàm rêu mặt trên + rêu gốc, biến sfMo; thảm dày theo lượng rêu ⇒ mép thảm thấp dần). Gốc sợi tối (bóng trong
        //  thảm), ngọn vàng xanh, ánh nhung sáng lên khi nhìn xiên; nền rêu dưới thảm tối lại (userData.sfShell). 1 lượt vẽ / lưới: InstancedMesh N bản
        //  (gl_InstanceID = số lớp), con của lưới gốc, DÙNG CHUNG bộ đỉnh (chỉ thêm chỉ số các tam giác có thể có rêu: mặt hướng lên của thân / cành to,
        //  hoặc sát đất ≤ 1 m) ⇒ gió lắc thảm cùng cành, không thêm RAM đỉnh. Chạy lúc dựng cảnh (trước mem-trim bỏ mảng đỉnh). 5 lớp × ~90k tam giác ⇒ chỉ
        //  bật khi zoom gần (mossTick, loop/main-loop-rest.js); đo SwiftShader: nhìn gần cây cổ thụ khung +33% (6 lớp), nhìn rộng không tốn ----
        function mossShells(m, N = 5, H = 0.03) {
          const g = m.geometry, P = g.attributes.position, Nr = g.attributes.normal, B = g.attributes.aBk, I = g.index ? g.index.array : null, n = I ? I.length / 3 : P.count / 3;
          m.updateWorldMatrix(true, false); const M = m.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M), sc = new THREE.Vector3().setFromMatrixScale(M).x;
          const keep = [], a = new THREE.Vector3(), nn = new THREE.Vector3(), c = new THREE.Vector3();
          for (let t = 0; t < n; t++) {
            let ny = 0, rr = 0; c.set(0, 0, 0);
            for (let k = 0; k < 3; k++) { const i = I ? I[t * 3 + k] : t * 3 + k; c.add(a.fromBufferAttribute(P, i).applyMatrix4(M)); ny += nn.fromBufferAttribute(Nr, i).applyMatrix3(NM).normalize().y;
              const z = B ? B.getZ(i) : 0, bm = Math.max(1, Math.floor(z + 0.5)); rr += z > 0.5 ? Math.min(1, Math.max(0, z - bm + 0.49)) : 0.4; }   // bán kính cành (aBk.z, như shader)
            c.divideScalar(3);
            if ((ny > 0.75 && rr > 0.24) || c.y - cowY(c.x, c.z) < 1) for (let k = 0; k < 3; k++) keep.push(I ? I[t * 3 + k] : t * 3 + k);
          }
          if (!keep.length) return 0;
          const sg = new THREE.BufferGeometry(); for (const k in g.attributes) sg.setAttribute(k, g.attributes[k]); sg.setIndex(keep);
          if (!g.boundingSphere) g.computeBoundingSphere(); sg.boundingSphere = g.boundingSphere.clone();
          const bm = m.material, sm = new THREE.MeshLambertMaterial({ color: bm.color, flatShading: bm.flatShading }); bm.userData.sfShell = 1; sm.defines = { SF_SHELL: '' };
          sm.onBeforeCompile = (sh, r) => { bm.onBeforeCompile(sh, r); Object.assign(sh.uniforms, { uShL: { value: H / sc }, uShS: { value: 1 / N }, uShW: { value: H } }); };
          sm.customProgramCacheKey = () => bm.customProgramCacheKey() + '|shell';
          const im = new THREE.InstancedMesh(sg, sm, N); im.name = 'Thảm rêu nhung'; im.receiveShadow = true; im.raycast = () => {};
          im.userData.noBatch = im.userData.noBake = im.userData.noCollide = true; im.visible = false; m.add(im); MOSS_IM.push(im);
          return keep.length / 3;
        }
        const MOSS_IM = [], mossTick = () => { const v = (camera.right - camera.left) / camera.zoom / Math.max(1, renderer.domElement.clientWidth) < 0.03; if (MOSS_IM[0] && MOSS_IM[0].visible !== v) for (const o of MOSS_IM) o.visible = v; };   // chỉ khi zoom gần (1 điểm ảnh < 3 cm): xa thì sợi nhỏ hơn điểm ảnh, vẽ phí
        const mossShellTris = [];
        scene.traverse(o => { const U = o.isMesh && !o.isInstancedMesh && o.material && o.material.userData; if (U && ((U.sfTop ?? (U.sfOld ? 1 : 0)) > 0)) mossShellTris.push(o); });
        for (const o of mossShellTris.splice(0)) mossShellTris.push([o.name || o.parent.name, mossShells(o)]);
