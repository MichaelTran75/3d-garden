        // ===== KHUNG GẦM + 2 CẦU + NHÍP + CÁC-ĐĂNG (G 24/10 "@gaz-69_vehicle_chassis__frame.glb em do research and study these glb files then modify to fit to the van") =====
        //  Mẫu "GAZ-69 Vehicle Chassis / Frame" (Peter Gatchev, CC-BY-4.0: khung thang 2 thanh dọc, cầu trước + cầu sau dầm liền, 4 nhíp lá, hộp số phụ 4×4, các-đăng
        //  + khớp chữ thập, giảm xóc, moay-ơ tang trống — 526k tam giác, ảnh vân gỉ sét). Xe nhà di động kiểu overland hay độ 4×4 cầu liền (kiểu Quigley cho Ford van)
        //  ⇒ lắp nguyên bộ gầm GAZ. Sửa bằng src/tools/chassis/ → models/chassis.glb 62 KB (12k tam giác, màu đỉnh từ ảnh vân, không pháp tuyến ⇒ tô phẳng):
        //  bỏ lốp, vành, cản trước, cần số; chèn 1,26 m vào đoạn thanh dọc trống ở giữa (cơ sở GAZ 2,51 m → Transit 3,77 m, ống các-đăng sau giãn theo); thanh dọc
        //  + nhíp trước nở ±0,12 m chừa động cơ V6; hạ khung 9 cm (nóc thanh dọc 0,82 < sàn trong xe 0,83), nhíp + giảm xóc bẹt dần; lật trái–phải (hộp lái về
        //  bên phải −Z, xe tay lái nghịch). Toạ độ GLB = đv xe (mũi −X, cửa lùa +Z, cầu trước x −2,12, cầu sau x 2,03, tâm bánh y 0,44) ⇒ gắn thẳng vào xe.
        //  Thay cầu tạm (van/caravan.js 'Cầu bánh xe'). Xem xuyên: giữ (keep). HỘP SỐ (dựng bằng code): chuông ly hợp + thân + đuôi, từ đuôi động cơ (x −2,31,
        //  tâm trục khuỷu y 0,71) tới khớp các-đăng đầu vào hộp số phụ (x −1,17, y 0,54, z 0,15 — số đo GLB GAZ sau khi sửa).
        const CHASSIS_GLB = window.__chassisGlb || 'https://michaeltran75.github.io/3d-garden/models/chassis.glb';
        const chassis = { g: null, gear: null };
        {
          const A = new THREE.Vector3(-2.306, 0.712, 0), B = new THREE.Vector3(-1.17, 0.54, 0.146), L = A.distanceTo(B);
          const prof = [[0, 0.04], [0.2, 0], [0.2, 0.03], [0.14, 0.26], [0.13, 0.27], [0.13, 0.76], [0.08, 0.79], [0.07, 1.06], [0.075, 1.09], [0.075, 1.12], [0, L]].map(([r, y]) => new THREE.Vector2(r, Math.min(y, L)));
          const geo = new THREE.LatheGeometry(prof, 12), mat = new THREE.MeshLambertMaterial({ color: 0x48443f, flatShading: true });
          const m = new THREE.Mesh(geo, mat); m.name = 'Hộp số (chuông ly hợp + thân + đuôi)'; m.position.copy(A); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
          m.castShadow = true; m.userData.xray = 'keep'; m.userData.noBake = true; caravanObj.add(m); chassis.gear = m;
        }
        ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
          .then(([{ GLTFLoader }, { MeshoptDecoder }]) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CHASSIS_GLB)).then(ldAfter).then(gl => {
            const root = gl.scene.getObjectByName('chassis'), mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
            root.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = o.receiveShadow = true; } });
            root.name = 'Khung gầm + 2 cầu + nhíp (GAZ-69)'; root.userData.xray = 'keep'; root.userData.noBake = true; caravanObj.add(root); chassis.g = root;
            const X = root.userData; if (Math.abs((X.axleF ?? -2.12) - TR.xF) > 0.01 || Math.abs((X.axleR ?? 2.03) - TR.xR) > 0.01) console.warn('chassis.glb: cầu lệch bánh xe — dựng lại bằng src/tools/chassis/');
            const old = caravanObj.getObjectByName('Cầu bánh xe'); if (old) old.visible = false;   // cầu tạm (2 ống + bầu vi sai) — đã có cầu thật
          }).catch(err => console.warn('Chassis GLB:', err)));
