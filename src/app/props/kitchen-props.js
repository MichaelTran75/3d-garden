        // ---- ĐỒ BẾP dựng bằng code (đv xe): bát udon (sợi, nước dùng, hành lá, chả cá narutomaki) · chảo rán (có món cơm chiên ẩn sẵn) ----
        let narutoTex = null, steamGeo = null;
        function udonBowl() {
          const g = new THREE.Group(); g.name = 'Bát udon';
          const ceramic = new THREE.MeshLambertMaterial({ color: 0xf2efe8, side: THREE.DoubleSide });
          const shell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.035, 0], [0.038, 0.006], [0.08, 0.05], [0.088, 0.072], [0.083, 0.073], [0.074, 0.05], [0.033, 0.01], [0, 0.01]].map(([r, y]) => new THREE.Vector2(r, y)), 20), ceramic);
          shell.castShadow = true; g.add(shell);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0855, 0.0035, 4, 24), new THREE.MeshLambertMaterial({ color: 0x2f4f7c })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.067; g.add(rim);   // viền men xanh
          const food = new THREE.Group(); food.name = 'Udon trong bát'; food.position.y = 0.058; g.add(food); g.userData.food = food;
          steamGeo = steamGeo || new THREE.IcosahedronGeometry(0.026, 1);   // hơi nóng (G 15/10): 4 cụm nhỏ, cập nhật bằng udonSteam (dưới) — tô trong xe: xe, tô trên tay: người
          g.userData.steam = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(steamGeo, new THREE.MeshBasicMaterial({ color: 0xf4f6f8, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; m.userData.noBatch = true; m.raycast = () => {}; m.renderOrder = 3; g.add(m); return { m, ph: i / 4 }; });
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
        // ---- LON NƯỚC NGỌT 330 ml dựng bằng code: thân tiện theo biên dạng lon nhôm chuẩn (Ø 66 mm, cao 115,7 mm, cổ thắt, đáy vòm),
        //      nhãn tự vẽ trên canvas; phiStart = π để giữa nhãn (u = 0,5) quay về +z cục bộ ----
        function sodaCan() {
          const g = new THREE.Group(); g.name = 'Lon nước ngọt';
          const lathe = pts => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 32, Math.PI, Math.PI * 2);
          const W = 512, Hc = 256, c = document.createElement('canvas'); c.width = W; c.height = Hc; const k = c.getContext('2d');
          k.fillStyle = '#c3202b'; k.fillRect(0, 0, W, Hc);
          k.fillStyle = '#e8e2d6'; k.fillRect(0, 0, W, 14); k.fillRect(0, Hc - 14, W, 14);   // 2 viền nhôm trơn trên/dưới
          k.fillStyle = '#f6f1e7'; k.beginPath(); k.moveTo(0, 168);   // dải lượn trắng chạy quanh lon (tuần hoàn để không lộ đường nối)
          for (let x = 0; x <= W; x += 8) k.lineTo(x, 160 + Math.sin(x / W * Math.PI * 4) * 22);
          for (let x = W; x >= 0; x -= 8) k.lineTo(x, 182 + Math.sin(x / W * Math.PI * 4 + .6) * 22);
          k.fill();
          k.fillStyle = '#ffffff'; k.textAlign = 'center'; k.textBaseline = 'middle';
          k.font = 'italic 900 78px Georgia, serif'; k.fillText('Cola', 256, 92);
          k.font = '700 20px Arial, sans-serif'; k.fillText('PLEIKU', 256, 38);
          k.fillStyle = '#7a1218'; k.font = '700 16px Arial, sans-serif'; k.fillText('330 ml', 256, 214);
          k.fillStyle = '#ffffff'; k.font = '700 22px Arial, sans-serif'; k.fillText('Cola', 64, 100); k.fillText('Cola', 448, 100);
          const label = new THREE.CanvasTexture(c); label.colorSpace = THREE.SRGBColorSpace; label.anisotropy = 4;
          const body = [[.0331, .0095], [.0331, .1035], [.031, .1085], [.0275, .1135], [.0272, .1148]];
          const bodyGeo = lathe(body), uv = bodyGeo.attributes.uv, pos = bodyGeo.attributes.position;
          for (let i = 0; i < uv.count; i++) uv.setY(i, (pos.getY(i) - .0095) / (.1148 - .0095));   // v theo chiều cao (nhãn phủ từ đáy thẳng tới cổ)
          const metal = new THREE.MeshLambertMaterial({ color: 0xb9bcbf });
          const parts = [[bodyGeo, new THREE.MeshLambertMaterial({ map: label }), 'Thân lon'],
            [lathe([[.0272, .1148], [.0278, .1156], [.0268, .1159], [.0255, .1151], [0, .1149]]), metal, 'Nắp lon'],
            [lathe([[0, .0045], [.021, .0028], [.0265, 0], [.0295, .0012], [.0322, .0055], [.0331, .0095]]), metal, 'Đáy lon']];
          for (const [geo, mat, name] of parts) { const m = new THREE.Mesh(geo, mat); m.name = name; m.castShadow = m.receiveShadow = true; g.add(m); }
          const tab = bx(.022, .0008, .015, metal, false, false); tab.name = 'Khoen lon'; tab.position.set(-.004, .1155, 0); tab.rotation.z = .08; g.add(tab);
          return g;
        }
        function setFood(food, k, drop) {   // phần thức ăn vơi dần (k 0–1): thu nhỏ + hạ mặt nước dùng / sữa — bát, chảo của ai cũng dùng (kỹ sư cầm tay, bàn trong xe, bàn trà)
          if (food.userData.y0 === undefined) food.userData.y0 = food.position.y;
          food.visible = k > 0.04; if (!food.visible) return;
          const s = 0.55 + 0.45 * k; food.scale.set(s, 0.5 + 0.5 * k, s); food.position.y = food.userData.y0 - (1 - k) * drop;
        }
        const _usA = new THREE.Vector3(), _usS = new THREE.Vector3();
        function udonSteam(t, bowl, heat) {   // hơi nóng tô udon: 4 cụm nhỏ bốc THẲNG LÊN (trục đứng thế giới, kể cả lúc bát nghiêng trên tay), uốn lượn, nở to, nhạt dần; nguội dần khi ăn
          const S = bowl && bowl.userData.steam; if (!S) return; const on = bowl.visible && heat > 0.03;
          if (on) { bowl.updateWorldMatrix(true, false); bowl.getWorldScale(_usS); }
          for (const p of S) {
            p.m.visible = on; if (!on) continue;
            const k = (t * 0.38 + p.ph) % 1, s = _usS.y; bowl.localToWorld(_usA.set(0, 0.058, 0));
            _usA.x += Math.sin(t * 1.3 + p.ph * 6) * 0.018 * s * (0.4 + k); _usA.z += Math.cos(t * 1.1 + p.ph * 5) * 0.018 * s * (0.4 + k); _usA.y += (0.015 + k * 0.26) * s;
            p.m.position.copy(bowl.worldToLocal(_usA)); p.m.scale.setScalar(0.55 + k * 1.7); p.m.material.opacity = 0.2 * heat * Math.sin(Math.PI * k);
          }
        }
