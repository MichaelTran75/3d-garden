        // ===== KỆ SÁCH NHỎ cạnh màn hình phụ =====
        //  Kệ gỗ 2 tầng treo vào khung xe trên cửa sổ (2 ke nhôm như màn hình phụ), bên trái màn: x 1,35 … 1,75, mép dưới ngang mép dưới màn (y 2,20), sâu 0,17.
        //  Sách: "Books and magazines" của Naira (CC-BY-4.0) → src/tools/books/ → models/books.glb 192 KB → nén meshopt 155 KB (src/tools/glb-compress, 04/11), mỗi cuốn 1 nút gốc giữa đáy; cỡ ×BOOK_K (mẫu gốc nhỏ,
        //  sách cao 9–12 cm). Tầng dưới: 1 hàng sách đứng + tạp chí, cuốn nghiêng cuối hàng · tầng trên: chồng tạp chí nằm + vài cuốn đứng.
        //  Bấm kệ / 2 hộp sách trên bàn ⇒ bảng việc "Đọc sách" (ui/tools-panel.js). Tải chưa xong / lỗi: kệ trống ----
        const bookShelf = (() => {
          const study = caravanObj.getObjectByName('Góc học tập trong xe'), g = new THREE.Group(); g.name = 'Kệ sách cạnh màn hình phụ';
          g.userData.noBake = true;   // ván, ke: gộp vào lô xe; sách nạp sau tự đánh dấu noBatch
          const X0 = 1.35, W = 0.40, ZB = -0.85, D = 0.17, Y0 = 2.20, H = 0.44, T = 0.018, BACK = 0.008, TIER = (H - 3 * T) / 2, BOOK_K = 1.5;
          const wood = new THREE.MeshLambertMaterial({ color: 0xa47e52 }), ply = new THREE.MeshLambertMaterial({ color: 0x8a6a45 }), alu = new THREE.MeshLambertMaterial({ color: 0x8d9196 }); wood.userData.vk = ply.userData.vk = 1;
          const part = (w, h, d, x, y, z, mat, name, outlined = true) => { const m = bx(w, h, d, mat, true, outlined, lineDark); m.name = name; m.position.set(x, y, z); g.add(m); return m; };
          const cx = X0 + W / 2, cz = ZB + D / 2;
          for (const k of [0, 1, 2]) part(W - 2 * T, T, D, cx, Y0 + T / 2 + k * (TIER + T), cz, wood, 'Ván kệ sách');
          for (const s of [-1, 1]) part(T, H, D, cx + s * (W - T) / 2, Y0 + H / 2, cz, wood, 'Hông kệ sách');
          part(W - 2 * T, H - 2 * T, BACK, cx, Y0 + H / 2, ZB + BACK / 2, ply, 'Lưng kệ sách', false);
          for (const s of [-1, 1]) part(.06, .05, .012, cx + s * .13, 2.675, -.862 + .006, alu, 'Ke bắt khung xe (kệ sách)');   // cùng thanh khung với ke màn hình phụ
          for (const s of [-1, 1]) part(.02, 2.675 - (Y0 + H) + .02, .012, cx + s * .13, (2.675 + Y0 + H) / 2 - .01, ZB - .006 + .012, alu, 'Thanh treo kệ sách', false);
          study.add(g);
          const BOOK_GLB = window.__booksGlb || (location.protocol === 'file:' ? '3d-garden/src/models/books.glb' : /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? 'models/books.glb' : 'https://michaeltran75.github.io/3d-garden/models/books.glb');
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')]).then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(BOOK_GLB)).then(ldAfter).then(gl => {
            const src = {}; gl.scene.traverse(o => { if (o.isMesh) { const M = o.material; o.material = roomLitMat(new THREE.MeshLambertMaterial({ map: M.map, side: THREE.DoubleSide })); M.dispose(); src[o.name || o.parent.name] = o; } });
            for (const k of Object.keys(src)) { const o = src[k]; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); }
            const zIn = ZB + BACK + (D - BACK) / 2;
            const row = (names, y, x, gap = 0.002) => { for (const n of names) { const o = src[n].clone(), b = o.geometry.boundingBox, w = (b.max.x - b.min.x) * BOOK_K;
              o.scale.setScalar(BOOK_K); o.position.set(x - b.min.x * BOOK_K, y, zIn); o.rotation.set(0, 0, 0); o.name = 'Sách ' + n; o.castShadow = o.receiveShadow = true;
              o.userData.noBake = o.userData.noBatch = true; o.userData.xray = 'keep'; g.add(o); x += w + gap; } return x; };
            const yLo = Y0 + T, yHi = Y0 + 2 * T + TIER, xL = X0 + T + 0.006;
            row(['book01', 'book003', 'book005', 'magaz1', 'book002', 'book006', 'book01', 'book005', 'book003', 'book002', 'book004'], yLo, xL);
            const st = src.magazstack1.clone(); st.scale.setScalar(BOOK_K * 0.98); st.position.set(xL + 0.141 * BOOK_K * 0.98 / 2, yHi, zIn); st.name = 'Chồng tạp chí'; st.receiveShadow = true; st.userData.noBake = st.userData.noBatch = true; st.userData.xray = 'keep'; g.add(st);
            row(['book006', 'book003', 'book01'], yHi, xL + 0.141 * BOOK_K + 0.03);
          }).catch(err => console.warn('kệ sách:', err)));
          return g;
        })();
