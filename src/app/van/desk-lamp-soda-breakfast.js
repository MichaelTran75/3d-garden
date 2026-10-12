        // ---- ĐÈN BÀN HỌC dựng bằng code (cao 0,45 m, gốc ở tâm đáy đế, tay đèn vươn theo +Z): đế gỗ tròn vát mép, khớp chân,
        //      tay đứng + tay ngang mảnh, chụp trụ hở đáy — mặt LED nằm lõm trong lòng chụp; dây điện luồn trong tay đèn ----
        const WORK_LAMP_HEAD = { x: -0.002, z: 0.219, radius: 0.039, ledY: 0.43 };
        function workLamp(parent) {
          const lamp = new THREE.Group(); lamp.name = 'Đèn bàn học';
          const body = new THREE.MeshLambertMaterial({ color: 0x26282b, side: THREE.DoubleSide }), wood = new THREE.MeshLambertMaterial({ color: 0x2f3134 });
          const add = (geo, mat, x, y, z, name) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.name = name; m.castShadow = m.receiveShadow = true; lamp.add(m); return m; };
          const H = WORK_LAMP_HEAD, armZ = -.079, armY = .4085;
          // đế gỗ: đĩa Ø 0,2 m có khe ở mép cho khối khớp chân ngồi vào, vát mép dưới; 2 miếng đệm chân hình viên phân lót dưới
          const disc = new THREE.Shape(), nh = .013, a0 = Math.asin(nh / .1);
          disc.absarc(0, 0, .1, -Math.PI / 2 + a0, Math.PI * 1.5 - a0, false); disc.lineTo(-nh, -.088); disc.lineTo(nh, -.088); disc.closePath();   // khe ở phía −z (dưới chân tay đèn)
          add(new THREE.ExtrudeGeometry(disc, { depth: .013, bevelEnabled: false, curveSegments: 40 }).rotateX(Math.PI / 2).translate(0, .021, 0), wood, 0, 0, 0, 'Đế gỗ');
          add(new THREE.LatheGeometry([[0, .002], [.094, .002], [.1, .008], [0, .008]].map(p => new THREE.Vector2(...p)), 36), wood, 0, 0, 0, 'Vát đáy đế');
          const pad = new THREE.Shape(), arc = (t0, t1) => { for (let i = 0; i <= 6; i++) { const t = t0 + (t1 - t0) * i / 6; pad.lineTo(.098 * Math.cos(t), .098 * Math.sin(t)); } };
          pad.moveTo(.025, -.08); arc(Math.atan2(-.08, Math.sqrt(.098 ** 2 - .08 ** 2)), Math.atan2(-.0431, .088)); pad.lineTo(.088, .0431); arc(Math.atan2(.0431, .088), Math.atan2(.08, Math.sqrt(.098 ** 2 - .08 ** 2))); pad.lineTo(.025, .08); pad.closePath();
          const padGeo = new THREE.ExtrudeGeometry(pad, { depth: .002, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, .002, 0);
          add(padGeo, wood, 0, 0, 0, 'Chân đế'); add(padGeo.clone().rotateY(Math.PI), wood, 0, 0, 0, 'Chân đế');   // xoay 180° (đệm đối xứng theo z) để giữ chiều mặt
          add(new THREE.BoxGeometry(.024, .052, .024), body, .001, .032, armZ, 'Chân khớp');
          for (const y of [.058, .407]) add(new THREE.CylinderGeometry(.013, .013, .026, 14).rotateZ(Math.PI / 2), body, 0, y, armZ, 'Khớp xoay');
          add(new THREE.CylinderGeometry(.0062, .0062, .33, 10), body, .001, .236, armZ, 'Tay đứng');
          add(new THREE.CylinderGeometry(.0065, .0065, H.z - H.radius - armZ, 10).rotateX(Math.PI / 2), body, 0, armY, (armZ + H.z - H.radius) / 2, 'Tay ngang');
          add(new THREE.CylinderGeometry(H.radius, H.radius, .113, 24, 1, true), body, H.x, .3935, H.z, 'Chụp đèn');
          add(new THREE.CircleGeometry(H.radius, 24).rotateX(-Math.PI / 2), body, H.x, .45, H.z, 'Nắp chụp');
          parent.add(lamp);
          return lamp;
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
        // ---- 3 MÓN ĂN SÁNG trên bàn vuông caravan, dựng bằng code + nhãn tự vẽ canvas: hộp ngũ cốc, hộp cà phê (2 hộp nằm như sách), chai sữa thuỷ tinh.
        //      Mỗi món: gốc ở tâm đáy, mặt nhãn hướng +z, kích thước (rộng, cao, dày) theo BREAKFAST_SIZE ----
        const BREAKFAST_SIZE = { cereal: [0.155, 0.186, 0.035], coffee: [0.126, 0.2155, 0.0295], milk: [0.089, 0.234, 0.089] };
        function breakfastLabel(w, h, paint) {
          const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h);
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
        }
        function breakfastItem(key) {
          const [w, h, d] = BREAKFAST_SIZE[key], lam = o => new THREE.MeshLambertMaterial(o);
          const text = (k, s, x, y, font, fill) => { k.font = font; k.fillStyle = fill; k.textAlign = 'center'; k.textBaseline = 'middle'; k.fillText(s, x, y); };
          if (key === 'milk') {
            const g = new THREE.Group(); g.name = key;
            const glass = new THREE.LatheGeometry([[0, 0], [.04, 0], [.0445, .006], [.0445, .125], [.042, .15], [.034, .178], [.027, .2], [.026, .212], [.029, .216], [.029, .22]].map(p => new THREE.Vector2(...p)), 28);
            const milk = new THREE.Mesh(glass, lam({ color: 0xf3f1ea })); milk.name = 'Chai sữa'; g.add(milk);
            const tex = breakfastLabel(512, 128, (k, W, H) => {
              k.fillStyle = '#f4ecd8'; k.fillRect(0, 0, W, H); k.fillStyle = '#2f6fa8'; k.fillRect(0, 0, W, 10); k.fillRect(0, H - 10, W, 10);
              for (const x of [128, 384]) {
                text(k, 'SỮA TƯƠI', x, 50, '800 34px Arial, sans-serif', '#2f6fa8'); text(k, 'Gia Lai · 500 ml', x, 88, '600 18px Arial, sans-serif', '#4b5d6b');
              }
              k.fillStyle = '#3b3a37'; for (const [x, y, r] of [[250, 40, 9], [262, 78, 7], [12, 70, 8], [500, 46, 7]]) { k.beginPath(); k.ellipse(x, y, r * 1.4, r, .4, 0, Math.PI * 2); k.fill(); }   // đốm bò sữa
            });
            const band = new THREE.Mesh(new THREE.CylinderGeometry(.0449, .0449, .075, 28, 1, true), lam({ map: tex })); band.position.y = .095; band.rotation.y = Math.PI; g.add(band);
            const cap = cyl(.0305, .0305, .016, lam({ color: 0x4a7fb5 }), true, false, null, 20); cap.position.y = .226; g.add(cap);
            g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
            return g;
          }
          const cereal = key === 'cereal', PX = 1650;   // ~1650 px/m cho mặt nhãn
          const frontTex = breakfastLabel(Math.round(w * PX), Math.round(h * PX), (k, W, H) => {
            if (cereal) {
              const bg = k.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#f6e7bd'); bg.addColorStop(1, '#ecc97c'); k.fillStyle = bg; k.fillRect(0, 0, W, H);
              k.strokeStyle = 'rgba(232,150,60,.35)'; k.lineWidth = 6; for (let i = 0; i < 11; i++) { const t = Math.PI * (1.05 + i * .09); k.beginPath(); k.moveTo(W / 2, H * .72); k.lineTo(W / 2 + Math.cos(t) * H, H * .72 + Math.sin(t) * H); k.stroke(); }
              text(k, 'NGŨ CỐC', W / 2, H * .13, '900 40px Arial, sans-serif', '#7a3b12'); text(k, 'Cao Nguyên', W / 2, H * .23, 'italic 700 22px Georgia, serif', '#a0521d');
              k.fillStyle = '#eef1f2'; k.beginPath(); k.ellipse(W / 2, H * .64, W * .34, H * .05, 0, 0, Math.PI * 2); k.fill();   // bát
              k.fillStyle = '#d9e2e6'; k.beginPath(); k.moveTo(W / 2 - W * .34, H * .64); k.quadraticCurveTo(W / 2, H * .86, W / 2 + W * .34, H * .64); k.fill();
              const cols = ['#e8a33c', '#d9822b', '#f2c65a', '#c8562f']; for (let i = 0; i < 26; i++) { k.fillStyle = cols[i % 4]; k.beginPath(); k.arc(W / 2 + (Math.sin(i * 7.3) * .3) * W, H * .62 - Math.abs(Math.cos(i * 3.1)) * H * .05, 7, 0, Math.PI * 2); k.fill(); }
              k.fillStyle = '#6f9a5b'; k.fillRect(0, H * .86, W, H * .14); text(k, 'Bữa sáng · 375 g', W / 2, H * .93, '700 17px Arial, sans-serif', '#ffffff');
            } else {
              const bg = k.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#4a2c1b'); bg.addColorStop(1, '#2a170d'); k.fillStyle = bg; k.fillRect(0, 0, W, H);
              k.fillStyle = '#e8d6b5'; k.fillRect(0, 0, W, H * .09); text(k, 'PLEIKU', W / 2, H * .047, '800 18px Arial, sans-serif', '#4a2c1b');
              text(k, 'CÀ PHÊ', W / 2, H * .22, '900 40px Arial, sans-serif', '#f1e3c6'); text(k, 'rang xay', W / 2, H * .3, 'italic 600 20px Georgia, serif', '#d9b98a');
              k.fillStyle = '#f4efe6'; k.beginPath(); k.ellipse(W / 2, H * .72, W * .34, H * .025, 0, 0, Math.PI * 2); k.fill();   // đĩa lót
              k.beginPath(); k.moveTo(W * .28, H * .52); k.lineTo(W * .72, H * .52); k.quadraticCurveTo(W * .7, H * .7, W / 2, H * .71); k.quadraticCurveTo(W * .3, H * .7, W * .28, H * .52); k.fill();   // tách
              k.strokeStyle = '#f4efe6'; k.lineWidth = 6; k.beginPath(); k.arc(W * .74, H * .59, 14, -1.3, 1.3); k.stroke();
              k.fillStyle = '#5a3420'; k.beginPath(); k.ellipse(W / 2, H * .52, W * .22, H * .012, 0, 0, Math.PI * 2); k.fill();
              k.strokeStyle = 'rgba(241,227,198,.6)'; k.lineWidth = 3; for (const dx of [-14, 0, 14]) { k.beginPath(); k.moveTo(W / 2 + dx, H * .49); k.bezierCurveTo(W / 2 + dx - 10, H * .45, W / 2 + dx + 10, H * .42, W / 2 + dx, H * .38); k.stroke(); }
              k.fillStyle = '#7b4a2a'; for (const [x, y] of [[.15, .45], [.86, .4], [.2, .84], [.8, .86]]) { k.beginPath(); k.ellipse(W * x, H * y, 10, 7, .6, 0, Math.PI * 2); k.fill(); }
              text(k, 'Robusta · 500 g', W / 2, H * .93, '700 15px Arial, sans-serif', '#e8d6b5');
            }
          });
          const backTex = breakfastLabel(Math.round(w * PX), Math.round(h * PX), (k, W, H) => {
            k.fillStyle = cereal ? '#f3e4bf' : '#3a2214'; k.fillRect(0, 0, W, H); const ink = cereal ? '#8a5a2b' : '#d9c4a0';
            text(k, cereal ? 'Thành phần' : 'Cách pha', W / 2, H * .1, '700 18px Arial, sans-serif', ink);
            k.fillStyle = ink; for (let i = 0; i < 9; i++) k.fillRect(W * .12, H * (.2 + i * .07), W * (.5 + (i * 37 % 30) / 100), 4);
          });
          const sideCol = cereal ? 0xd6a24e : 0x5a3420, capCol = cereal ? 0xead7a6 : 0x3a2214;
          const mats = [lam({ color: sideCol }), lam({ color: sideCol }), lam({ color: capCol }), lam({ color: capCol }), lam({ map: frontTex }), lam({ map: backTex })];
          const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0);
          const m = new THREE.Mesh(geo, mats); m.name = key; m.castShadow = m.receiveShadow = true; return m;
        }

