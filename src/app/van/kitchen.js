        // ===== BẾP THEO MẪU (toạ độ cục bộ galley: mặt tủ x ≈ 2,40 quay ra lối đi, vách xe x ≈ 2,97, mặt đá y = 1,865; z −0,91 → 0,91 = trái → phải nhìn từ lối đi)
        //  · tủ chậu: chậu inox, vòi cổ ngỗng + cần gạt, khay xà phòng, miếng rửa bát hồng, gờ chắn sau + gờ đầu tủ
        //  · bàn sơ chế: thớt xanh nhạt trên mặt đá; tấm bảng đục lỗ (pegboard) phía sau, móc treo thớt xanh ngọc, dao, chảo rán
        //  · khối bếp riêng: mặt bếp đen 4 họng lửa, 2 vỉ gang (khung + nan toả vào họng lửa), nắp dựng phía sau, tấm chắn gió bên phải mở chếch
        //  Đồ động (lửa, nồi, chảo, dao, bát, hành, nước vòi) để riêng, không gộp lưới; trả về cho lịch nấu ăn của kỹ sư điều khiển ----
        function motorhomeKitchen(galley, ceilY = 3.56) {   // ceilY: trần xe trong toạ độ tủ bếp (ống gió máy hút mùi chạy tới đó)
          const lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
          const M = { counter: lam(0xd8d0bc), steel: lam(0x98a7a4), dark: lam(0x2e3436), iron: lam(0x1f2224), peg: lam(0xd9c49a), hole: lam(0x5a4a33), boardG: lam(0x9fd6a4),
            boardT: lam(0x6fb0a0), wood: lam(0x7a4a2a), blade: lam(0xc8ced2), cap: lam(0x3b3f42), sponge: lam(0xe36f9a), soap: lam(0xe9e6dc), lid: lam(0x9aa5a8) };
          const S = new THREE.Group(); S.name = 'Bếp: phần cố định';
          const P = new THREE.Group(); P.name = 'Bếp: đồ dùng'; P.userData.noBake = true;
          const box = (par, w, h, d, x, y, z, mat, out = false) => { const m = bx(w, h, d, mat, true, out, lineDark); m.position.set(x, y, z); par.add(m); return m; };
          const TOP = 1.865;
          // mặt đá liền (tủ chậu + bàn sơ chế) có lỗ chậu
          const shape = new THREE.Shape(); shape.moveTo(2.37, -0.91); shape.lineTo(2.97, -0.91); shape.lineTo(2.97, 0.255); shape.lineTo(2.37, 0.255); shape.closePath();
          const hole = new THREE.Path(); hole.moveTo(2.47, -0.86); hole.lineTo(2.47, -0.5); hole.lineTo(2.81, -0.5); hole.lineTo(2.81, -0.86); hole.closePath(); shape.holes.push(hole);
          const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false });
          const top = new THREE.Mesh(geo, M.counter); top.rotation.x = Math.PI / 2; top.position.y = TOP; top.name = 'Mặt đá có lỗ chậu'; top.castShadow = top.receiveShadow = true; edge(top, geo, lineDark); S.add(top);
          // chậu inox sâu 13 cm + lỗ thoát
          box(S, 0.34, 0.02, 0.36, 2.64, 1.745, -0.68, M.steel);
          for (const x of [2.47, 2.81]) box(S, 0.02, 0.13, 0.36, x, 1.8, -0.68, M.steel);
          for (const z of [-0.86, -0.5]) box(S, 0.34, 0.13, 0.02, 2.64, 1.8, z, M.steel);
          const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 12), M.dark); drain.position.set(2.64, 1.757, -0.68); S.add(drain);
          // vòi cổ ngỗng + cần gạt, khay xà phòng (trái), khay + miếng rửa bát hồng (phải)
          const fBase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.02, 12), M.steel); fBase.position.set(2.9, TOP + 0.01, -0.68); S.add(fBase);
          const faucet = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2.9, TOP, -0.68), new THREE.Vector3(2.9, 2.08, -0.68), new THREE.Vector3(2.86, 2.13, -0.68), new THREE.Vector3(2.8, 2.11, -0.68), new THREE.Vector3(2.775, 2.05, -0.68)]), 16, 0.012, 7, false), M.steel);
          faucet.castShadow = true; S.add(faucet);
          const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 8), M.steel); lever.rotation.x = Math.PI / 2; lever.position.set(2.9, 1.96, -0.655); S.add(lever);
          box(S, 0.016, 0.012, 0.07, 2.9, 1.97, -0.62, M.steel);
          box(S, 0.06, 0.01, 0.085, 2.885, TOP + 0.005, -0.84, M.soap, true); box(S, 0.04, 0.018, 0.06, 2.885, TOP + 0.019, -0.84, lam(0xf5e9b8));
          box(S, 0.055, 0.008, 0.09, 2.885, TOP + 0.004, -0.545, M.steel); box(S, 0.042, 0.026, 0.07, 2.885, TOP + 0.021, -0.545, M.sponge, true);
          // gờ chắn sau chậu + gờ đầu tủ (phía phòng tắm)
          box(S, 0.035, 0.135, 0.44, 2.952, TOP + 0.0675, -0.69, M.counter, true);
          box(S, 0.6, 0.135, 0.025, 2.67, TOP + 0.0675, -0.8975, M.counter, true);
          // thớt nhựa xanh nhạt trên bàn sơ chế
          box(S, 0.3, 0.022, 0.46, 2.63, TOP + 0.011, -0.15, M.boardG, true);
          // tấm bảng đục lỗ (thấp dưới bậu cửa sổ 2,27): 2 hàng lỗ, móc treo
          box(S, 0.025, 0.38, 0.725, 2.9425, TOP + 0.19, -0.1075, M.peg, true);
          const holeGeo = new THREE.CylinderGeometry(0.0085, 0.0085, 0.003, 8);
          for (const y of [2.03, 2.12]) for (let i = 0; i < 8; i++) { const h = new THREE.Mesh(holeGeo, M.hole); h.rotation.z = Math.PI / 2; h.position.set(2.929, y, -0.1 + i * 0.047); S.add(h); }
          for (const z of [-0.32, -0.19, 0.0, 0.12, 0.22]) { box(S, 0.035, 0.008, 0.008, 2.912, 2.215, z, M.steel); box(S, 0.008, 0.02, 0.008, 2.897, 2.225, z, M.steel); }
          // thớt xanh ngọc treo móc (tai thớt có lỗ)
          box(S, 0.012, 0.2, 0.16, 2.918, 2.09, -0.32, M.boardT, true); box(S, 0.012, 0.04, 0.07, 2.918, 2.205, -0.32, M.boardT, true); box(S, 0.013, 0.014, 0.026, 2.917, 2.21, -0.32, M.hole);
          // khối bếp: mặt đen 4 họng lửa, viền inox
          box(S, 0.56, 0.03, 0.63, 2.67, 1.835, 0.59, M.dark, true);
          box(S, 0.012, 0.016, 0.63, 2.392, 1.857, 0.59, M.steel); box(S, 0.012, 0.016, 0.63, 2.948, 1.857, 0.59, M.steel);
          for (const z of [0.278, 0.902]) box(S, 0.56, 0.016, 0.012, 2.67, 1.857, z, M.steel);
          const BURN = [[2.55, 0.43], [2.79, 0.43], [2.55, 0.75], [2.79, 0.75]];   // [x, z]: trước–trái, sau–trái, trước–phải, sau–phải
          for (const [x, z] of BURN) {
            const r = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.048, 0.012, 16), M.steel); r.position.set(x, 1.856, z); S.add(r);
            const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), M.cap); c.position.set(x, 1.866, z); S.add(c);
          }
          for (const zc of [0.43, 0.75]) {   // vỉ gang: khung chữ nhật + nan toả vào 2 họng lửa + chân
            const z0 = zc - 0.145, z1 = zc + 0.145, x0 = 2.42, x1 = 2.92, y = 1.888;
            box(S, x1 - x0, 0.012, 0.012, (x0 + x1) / 2, y, z0, M.iron); box(S, x1 - x0, 0.012, 0.012, (x0 + x1) / 2, y, z1, M.iron);
            box(S, 0.012, 0.012, z1 - z0, x0, y, zc, M.iron); box(S, 0.012, 0.012, z1 - z0, x1, y, zc, M.iron); box(S, 0.012, 0.012, z1 - z0, 2.67, y, zc, M.iron);
            for (const bxp of [2.55, 2.79]) {
              for (const s of [-1, 1]) { box(S, 0.012, 0.012, 0.1, bxp, y, zc + s * 0.095, M.iron); }
              for (const s of [-1, 1]) { const f = box(S, 0.085, 0.012, 0.012, bxp + s * 0.08, y, zc, M.iron); }
              for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const d = box(S, 0.012, 0.012, 0.11, bxp + sx * 0.06, y, zc + sz * 0.06, M.iron); d.rotation.y = sx * sz * Math.PI / 4; }
            }
            for (const x of [x0, x1]) for (const z of [z0, z1]) box(S, 0.014, 0.034, 0.014, x, 1.866, z, M.iron);
          }
          // nắp dựng phía sau + tấm chắn gió bên phải mở chếch ra ngoài
          box(S, 0.012, 0.37, 0.63, 2.957, 1.85 + 0.185, 0.59, M.lid, true);
          const flap = new THREE.Group(); flap.position.set(2.957, 1.85, 0.905); flap.rotation.y = 0.5; S.add(flap);
          box(flap, 0.42, 0.26, 0.012, -0.21, 0.13, 0.006, M.lid, true);
          // máy hút mùi inox trên vách sau bếp: thân hút + gờ trước vát, lưới lọc dầu, đèn; ỐNG GIÓ đứng dẫn lên trần → ống khói trên mái xe (van/caravan.js)
          //  (G 14/10: nâng thêm nửa ống gió ⇒ đáy máy cao 2,88 — cách mặt bếp ~1 m, đầu người đứng nấu không vướng)
          const HY = 0.58;
          box(S, 0.33, 0.1, 0.6, 2.79, 2.35 + HY, 0.59, M.steel, true);
          const lip = box(S, 0.05, 0.12, 0.6, 2.62, 2.34 + HY, 0.59, M.steel, true); lip.rotation.z = 0.35;
          box(S, 0.27, 0.006, 0.52, 2.8, 2.297 + HY, 0.59, M.dark);
          for (let k = 0; k < 7; k++) box(S, 0.27, 0.004, 0.006, 2.8, 2.293 + HY, 0.37 + k * 0.073, M.steel);   // nan lưới lọc
          box(S, 0.12, ceilY - 2.40 - HY, 0.12, 2.79, (2.40 + HY + ceilY) / 2, 0.47, M.steel, true);   // ống gió lên trần
          box(S, 0.16, 0.025, 0.16, 2.79, ceilY - 0.015, 0.47, M.steel);   // mặt bích trần
          // dải núm vặn ga ở mép trước mặt bếp
          box(S, 0.014, 0.045, 0.6, 2.384, 1.812, 0.59, M.dark, true);
          bakeStatic(S); galley.add(S);

          // ---- đồ động ----
          galley.add(P);
          const flames = BURN.map(([x, z], i) => {   // ngọn lửa ga: vành xanh + lõi sáng, nhảy nhẹ
            const f = new THREE.Group(); f.position.set(x, 1.873, z); f.visible = false; f.name = 'Lửa họng ' + (i + 1); P.add(f);
            const outer = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 5, 18), new THREE.MeshBasicMaterial({ color: 0x4f9dff, transparent: true, opacity: 0.85, depthWrite: false })); outer.rotation.x = Math.PI / 2; f.add(outer);
            const inner = new THREE.Mesh(new THREE.TorusGeometry(0.033, 0.004, 4, 18), new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: 0.9, depthWrite: false })); inner.rotation.x = Math.PI / 2; inner.position.y = 0.004; f.add(inner);
            return f;
          });
          // 4 núm vặn ga (xoay khi bật / tắt): thứ tự theo họng lửa BURN · đèn máy hút mùi (sáng khi nấu)
          const KNOB_Z = [0.47, 0.37, 0.71, 0.81];
          const knobs = KNOB_Z.map(z => {
            const k = new THREE.Group(); k.position.set(2.372, 1.812, z); k.rotation.order = 'ZYX'; P.add(k);
            const c = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.022, 12), M.iron); c.rotation.z = Math.PI / 2; k.add(c);
            const nb = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.026, 0.006), M.steel); nb.position.x = -0.012; k.add(nb);   // gờ chỉ vạch
            return k;
          });
          const hoodLamp = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.006, 0.04), new THREE.MeshBasicMaterial({ color: 0x8a8578 })); hoodLamp.position.set(2.7, 2.292 + 0.58, 0.59); P.add(hoodLamp);
          // nồi inox để sẵn trên họng sau–trái: nước, sợi udon, hơi nước
          const pot = new THREE.Group(); pot.name = 'Nồi luộc udon'; pot.position.set(BURN[1][0], 1.894, BURN[1][1]); P.add(pot);
          const potM = new THREE.MeshLambertMaterial({ color: 0xa9b4b6, side: THREE.DoubleSide });
          const potLathe = pts => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 20), potM); m.castShadow = true; pot.add(m); };
          potLathe([[0, 0], [0.085, 0], [0.09, 0.006], [0.09, 0.11], [0.094, 0.114], [0.085, 0.11], [0.085, 0.012], [0, 0.012]]);
          for (const s of [-1, 1]) { const hdl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.014, 0.05), M.dark); hdl.position.set(0, 0.098, s * 0.11); pot.add(hdl); }
          const potWater = new THREE.Mesh(new THREE.CircleGeometry(0.083, 20), new THREE.MeshLambertMaterial({ color: 0x9cc7d8 })); potWater.rotation.x = -Math.PI / 2; potWater.position.y = 0.08; potWater.visible = false; pot.add(potWater);
          const potNoodles = new THREE.Group(); potNoodles.position.y = 0.083; potNoodles.visible = false; pot.add(potNoodles);
          for (let k = 0; k < 10; k++) { const n = new THREE.Mesh(new THREE.TorusGeometry(0.025 + (k % 3) * 0.013, 0.0075, 4, 10, 2.4 + (k % 4) * 0.6), new THREE.MeshLambertMaterial({ color: 0xf4ecd4 })); n.rotation.set(-Math.PI / 2, 0, k * 1.9); n.position.set(Math.cos(k * 2.3) * 0.02, (k % 3) * 0.003, Math.sin(k * 2.3) * 0.02); potNoodles.add(n); }
          const potSteam = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), new THREE.MeshBasicMaterial({ color: 0xf4f6f8, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; pot.add(m); return { m, ph: i / 4 }; });
          // chảo: treo móc trên bảng (bình thường) · đặt trên họng trước–phải (lúc chiên cơm)
          const pegPan = fryPan(); pegPan.rotation.z = Math.PI / 2; pegPan.position.set(2.926, 2.215 - 0.215, 0.12); P.add(pegPan);
          const stovePan = fryPan(); stovePan.rotation.y = Math.PI; stovePan.position.set(BURN[0][0], 1.894, BURN[0][1]); stovePan.visible = false; P.add(stovePan);   // họng trước–trái: tay trái nắm cán (quay ra lối đi), tay phải cầm xẻng
          // dao treo trên bảng (cán lên)
          const pegKnife = new THREE.Group(); pegKnife.position.set(2.916, 2.205, -0.19); P.add(pegKnife);
          box(pegKnife, 0.022, 0.075, 0.024, 0, -0.04, 0, M.wood); box(pegKnife, 0.006, 0.15, 0.036, 0, -0.15, 0.004, M.blade);
          // hành lá đã thái trên thớt (hiện dần khi thái)
          const scallions = [];
          for (let k = 0; k < 26; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.01, 6), lam(k % 4 ? 0x5fb04a : 0xdfeec4)); s.rotation.z = Math.PI / 2; s.position.set(2.6 + Math.sin(k * 1.7) * 0.05, TOP + 0.027, -0.02 + Math.cos(k * 2.3) * 0.06); s.visible = false; P.add(s); scallions.push(s); }
          // bát udon múc ra mặt đá cạnh bếp · dòng nước vòi chậu
          const counterBowl = udonBowl(); counterBowl.position.set(2.6, TOP, 0.17); counterBowl.scale.setScalar(1.2); counterBowl.visible = false; P.add(counterBowl);   // tô udon to thêm 20% (G 15/10)
          const tapWater = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.01, 0.2, 6), new THREE.MeshLambertMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.7, depthWrite: false }));
          tapWater.position.set(2.775, 1.94, -0.68); tapWater.visible = false; P.add(tapWater);
          return { flames, knobs, hoodLamp, pot, potWater, potNoodles, potSteam, pegPan, stovePan, pegKnife, scallions, counterBowl, tapWater, burners: BURN, steam: 0, TOP };
        }

