        // ---- MŨ BẢO HỘ kiểu LEGO (hàm dựng thuần, gốc ở tâm đầu): vỏ vòm + vành quanh + lưỡi trai trước + gờ dọc đỉnh + 2 ốp tai chống ồn —
        //      mũ trên đầu kỹ sư (engineer/body/model.js), mũ trên kệ + trên giường trong xe (van/interior/caravan.js) ----
        function legoHelmet(shellM, padM) {
          const h = new THREE.Group();
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.235, 20, 10, 0, Math.PI * 2, 0, 1.5), shellM); dome.position.y = 0.1; dome.castShadow = true; h.add(dome);
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.024, 28), shellM); brim.position.y = 0.105; h.add(brim);
          const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.022, 0.12), shellM); visor.position.set(0, 0.098, 0.25); visor.rotation.x = 0.12; h.add(visor);
          const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.42), shellM); ridge.position.y = 0.318; h.add(ridge);
          for (const sx of [-1, 1]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 14), padM); pad.rotation.z = Math.PI / 2; pad.position.set(sx * 0.215, 0.0, 0); h.add(pad); }
          return h;
        }
