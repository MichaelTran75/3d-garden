        // ===== BỒN CẦU + KỆ TREO ẤM TRÀ (G 20/10 "lấy từ glb file và add những item này vào" — tinylivingpack.glb; bộ sách kẹp chậu cây: G bỏ qua) =====
        //  Mẫu tham khảo là đồ tách từ The Sims 4 ⇒ CHỈ ĐO (kích thước + màu); hình dựng lại bằng khối ở src/tools/tinyliving/ → models/tinyliving.glb 20 KB.
        //  Bồn cầu: thay hình cũ trong buồng tắm (bệ côn, vành, két sát vách, nút xả trên nắp két; mẫu sâu 0,74 rút còn 0,59 cho trong rèm) — nắp mới gắn vào
        //  nhóm bản lề cũ (engineer/tasks/van-nav.js vẫn lật mở 1,62 rad), bản lề trước mặt két 3 cm để nắp dựng không xuyên két. Kệ treo 2 tầng (ván lưng + tờ
        //  ghi chú, dây treo có tua, ấm đun xanh ngọc, sách, hộp bánh, hũ, hộp trà) trên tường bếp ngay trên tấm bảng đục lỗ, sát vách; mui ở đó chỉ cao 2,58
        //  ⇒ kệ thu còn 0,55 (đỉnh 2,56), bỏ tấm lót nồi treo, che một phần cửa sổ bếp (G chọn). Tải chưa xong / lỗi: giữ bồn cầu cũ ----
        {
          const TL_GLB = window.__tlGlb || 'https://michaeltran75.github.io/3d-garden/models/tinyliving.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
            .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(TL_GLB)).then(ldAfter).then(gl => {
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true }), part = n => { const o = gl.scene.getObjectByName(n); o.userData.xray = 'keep';
                o.traverse(m => { m.userData.noBatch = m.userData.noBake = true; if (m.isMesh) { m.material = mat; m.castShadow = m.receiveShadow = true; edge(m, m.geometry, lineDark); } }); return o; };
              const T = caravanObj.getObjectByName('Bồn cầu hướng cửa phòng tắm'), H = caravanObj.getObjectByName('Bản lề nắp bồn cầu');
              for (const o of T.children) if (o !== H) o.visible = false;
              H.clear(); H.position.set(0.047, TR.yIn + 0.466, 0); H.add(part('lid'));
              const lav = part('lav'); lav.position.set(0.052, TR.yIn, 0); T.add(lav);   // lưng két trùng lưng két cũ (sát vách)
              const sh = part('shelf'); sh.position.set(2.9, 2.25, -0.1075); sh.rotation.y = -Math.PI / 2; caravanObj.getObjectByName('Bếp dọc vách cửa hông').add(sh);   // toạ độ tủ bếp: lưng sát vách, giữa tấm bảng đục lỗ
            }).catch(err => console.warn('bồn cầu / kệ treo:', err)));
        }
