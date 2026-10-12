        // ---- ĐỒ BẾP dựng bằng code (đv xe): bát udon (sợi, nước dùng, hành lá, chả cá narutomaki) · chảo rán (có món cơm chiên ẩn sẵn) ----
        let narutoTex = null;
        function udonBowl() {
          const g = new THREE.Group(); g.name = 'Bát udon';
          const ceramic = new THREE.MeshLambertMaterial({ color: 0xf2efe8, side: THREE.DoubleSide });
          const shell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.035, 0], [0.038, 0.006], [0.08, 0.05], [0.088, 0.072], [0.083, 0.073], [0.074, 0.05], [0.033, 0.01], [0, 0.01]].map(([r, y]) => new THREE.Vector2(r, y)), 20), ceramic);
          shell.castShadow = true; g.add(shell);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0855, 0.0035, 4, 24), new THREE.MeshLambertMaterial({ color: 0x2f4f7c })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.067; g.add(rim);   // viền men xanh
          const food = new THREE.Group(); food.name = 'Udon trong bát'; food.position.y = 0.058; g.add(food); g.userData.food = food;
          const broth = new THREE.Mesh(new THREE.CircleGeometry(0.077, 20), new THREE.MeshLambertMaterial({ color: 0xc89a5c })); broth.rotation.x = -Math.PI / 2; food.add(broth);
          const noodleM = new THREE.MeshLambertMaterial({ color: 0xf4ecd4 });
          for (let k = 0; k < 9; k++) {   // sợi udon to, cuộn lỏng nằm nổi trên nước dùng
            const n = new THREE.Mesh(new THREE.TorusGeometry(0.022 + (k % 3) * 0.012, 0.0075, 4, 10, 2.2 + (k % 4) * 0.6), noodleM);
            n.rotation.set(-Math.PI / 2 + 0.15 * Math.sin(k), 0, k * 1.9); n.position.set(Math.cos(k * 2.3) * 0.02, 0.004 + (k % 3) * 0.003, Math.sin(k * 2.3) * 0.02); food.add(n);
          }
          const greenM = new THREE.MeshLambertMaterial({ color: 0x5fb04a });
          for (let k = 0; k < 12; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.008, 6), greenM); s.position.set(Math.cos(k * 2.6) * (0.015 + (k % 4) * 0.012), 0.014, Math.sin(k * 2.6) * (0.015 + (k % 4) * 0.012)); s.rotation.x = Math.PI / 2; food.add(s); }
          if (!narutoTex) {   // chả cá narutomaki: trắng, xoắn ốc hồng
            const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            x.fillStyle = '#fbf7f2'; x.beginPath(); x.arc(32, 32, 31, 0, Math.PI * 2); x.fill();
            x.strokeStyle = '#e45d8c'; x.lineWidth = 4; x.beginPath(); for (let a = 0; a < 14; a += 0.2) { const r = 2 + a * 1.9; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.stroke();
            narutoTex = new THREE.CanvasTexture(c); narutoTex.colorSpace = THREE.SRGBColorSpace;
          }
          for (const [nx, nz] of [[0.032, -0.018], [-0.026, 0.03]]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.017, 16), new THREE.MeshLambertMaterial({ map: narutoTex })); d.rotation.x = -Math.PI / 2; d.position.set(nx, 0.016, nz); food.add(d); }
          return g;
        }
        function fryPan() {   // chảo rán Ø17 cm, cán gỗ dọc +x; con 'food' = cơm chiên trứng (ẩn sẵn)
          const g = new THREE.Group(); g.name = 'Chảo rán';
          const iron = new THREE.MeshLambertMaterial({ color: 0x2c2d31 }), inner = new THREE.MeshLambertMaterial({ color: 0x4a4c50 });
          const lathe = (pts, mat) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 20), mat); m.castShadow = true; g.add(m); return m; };
          lathe([[0, 0], [0.075, 0], [0.08, 0.008], [0.086, 0.04], [0.088, 0.042]], iron);
          lathe([[0.088, 0.042], [0.083, 0.039], [0.077, 0.01], [0, 0.01]], inner);
          const neck = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.018), iron); neck.position.set(0.105, 0.036, 0); neck.rotation.z = 0.15; g.add(neck);
          const grip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.016, 0.024), new THREE.MeshLambertMaterial({ color: 0x6b4426 })); grip.position.set(0.175, 0.045, 0); g.add(grip);
          const food = new THREE.Group(); food.name = 'Cơm chiên trứng'; food.visible = false; g.add(food); g.userData.food = food;
          const rice = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xead592 })); rice.scale.y = 0.38; rice.position.y = 0.01; food.add(rice);
          const bitM = [new THREE.MeshLambertMaterial({ color: 0xf2c230 }), new THREE.MeshLambertMaterial({ color: 0x5fb04a }), new THREE.MeshLambertMaterial({ color: 0xd9632f })];   // trứng · hành · cà rốt
          for (let k = 0; k < 16; k++) { const a = k * 2.4, r = 0.012 + (k % 5) * 0.011, b = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.006, 0.01), bitM[k % 3]); b.position.set(Math.cos(a) * r, 0.03 - r * 0.25, Math.sin(a) * r); b.rotation.y = a; food.add(b); }
          return g;
        }
