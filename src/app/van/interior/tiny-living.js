        // ===== BỒN CẦU + KỆ TREO ẤM TRÀ (lấy các món này từ tệp GLB — tinylivingpack.glb; không dùng bộ sách kẹp chậu cây) =====
        //  Mẫu tham khảo là đồ tách từ The Sims 4 ⇒ CHỈ ĐO (kích thước + màu); hình dựng lại bằng khối ở src/tools/tinyliving/ → models/tinyliving.glb 20 KB.
        //  Bồn cầu: thay hình cũ trong buồng tắm (bệ côn, vành, két sát vách, nút xả trên nắp két; mẫu sâu 0,74 rút còn 0,59 cho trong rèm) — nắp mới gắn vào
        //  nhóm bản lề cũ (engineer/tasks/van-nav.js vẫn lật mở 1,62 rad), bản lề trước mặt két 3 cm để nắp dựng không xuyên két. Kệ treo 2 tầng (ván lưng + tờ
        //  ghi chú, dây treo có tua, ấm đun xanh ngọc, sách, hộp bánh, hũ, hộp trà) trên tường bếp ngay trên tấm bảng đục lỗ, sát vách; mui ở đó chỉ cao 2,58
        //  ⇒ kệ thu còn 0,55 (đỉnh 2,56), bỏ tấm lót nồi treo, che một phần cửa sổ bếp. Tải chưa xong / lỗi: giữ bồn cầu cũ ----
        {
          const TL_GLB = window.__tlGlb || 'https://michaeltran75.github.io/3d-garden/models/tinyliving.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
            .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(TL_GLB)).then(ldAfter).then(gl => {
              const mat = roomLitMat(new THREE.MeshLambertMaterial({ vertexColors: true })), part = n => { const o = gl.scene.getObjectByName(n); o.userData.xray = 'keep';
                o.traverse(m => { m.userData.noBatch = m.userData.noBake = true; if (m.isMesh) { m.material = mat; m.castShadow = m.receiveShadow = true; edge(m, m.geometry, lineDark); } }); return o; };
              const T = caravanObj.getObjectByName('Bồn cầu hướng cửa phòng tắm'), H = caravanObj.getObjectByName('Bản lề nắp bồn cầu');
              for (const o of T.children) if (o !== H) o.visible = false;
              H.clear(); H.position.set(0.047, TR.yIn + 0.466, 0); H.add(part('lid'));
              const lav = part('lav'); lav.position.set(0.052, TR.yIn, 0); T.add(lav);   // lưng két trùng lưng két cũ (sát vách)
              // kệ treo trong toạ độ tủ bếp (lưng sát vách, giữa tấm bảng đục lỗ), cỡ ×0,9 × 0,95 so với cỡ gốc, chia cho cỡ tủ bếp (đã thu nhỏ) vì kệ là con
              //  của tủ; gốc ở lưng kệ ⇒ vẫn sát vách. (Lần sửa trước lệnh add bị lọt vào chú thích cuối dòng ⇒ kệ mất khỏi bếp)
              //  ⇒ ×0,9 nữa (0,77 cỡ gốc), SH_UP nâng trong toạ độ tủ bếp
              //  (gốc kệ thấp ⇒ thu nhỏ kéo đỉnh xuống; nâng 0,12 ⇒ đáy kệ lên 11 cm, đỉnh lên 6 cm, mui còn cách ~40 cm)
              const sh = part('shelf'), K = caravanObj.getObjectByName('Bếp dọc vách cửa hông'), SH_UP = 0.12;
              sh.position.set(2.9, 2.25 + SH_UP, -0.1075); sh.rotation.y = -Math.PI / 2; sh.scale.setScalar(0.9 * 0.95 * 0.9 / K.scale.x);
              K.add(sh);
            }).catch(err => console.warn('bồn cầu / kệ treo:', err)));
        }
