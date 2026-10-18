        // ==== MẪU GLB "Ford Transit L2H2" DÙNG NGUYÊN (G 18/10 "nếu xe van copy đc thì mang vào luôn khỏi vẽ lại rồi modified") ====
        //  src/models/transit.bin = mẫu của geyges (Sketchfab Standard) đã sửa: giữ vỏ ngoài + cabin (táp-lô, vô-lăng, ghế, dây đai), bỏ khoang hàng + băng ghế đôi;
        //  lật trái–phải ra tay lái nghịch (logo, chữ TRANSIT lật lại tại chỗ cho đọc đúng); L3 = chèn 0,45 m vào GIỮA ô cửa lùa (ô cửa 0,95 → 1,40 m, đúng ô cửa
        //  TR.door của nội thất); nâng mui 6 cm như vỏ code; khoét 2 ô kính THEO KHUNG XE ở vách −z (ô dập sẵn của bản Kombi trên vỏ ngoài; phần trên phòng tắm kính mờ) + kính cửa lùa theo khung trong của cửa (kính, viền cao su, má cửa); cửa lùa đặt ở thế mở (trượt về
        //  sau, ra ngoài 8,5 cm); 1 ghế lái dùng 2 lần (ghế phụ = ảnh gương), 1 bánh dùng 4 lần (quay, không lật — logo nắp mâm đọc đúng), bánh phóng ×1,1 cho
        //  lốp chạm đất khi tâm ở Y 0,44 (gầm nâng như cũ). 77 nghìn tam giác, lượng tử hoá + nén meshopt, 561 KB; tệp là GLB đã XOR theo dòng xorshift32
        //  (giấy phép Standard cho dùng trong trang nhưng không cho để mẫu thành 1 tệp mở được). Đơn vị + trục = đv xe (mũi −X, cửa lùa +Z).
        //  Cửa trước (1 cửa dùng 2 lần, cửa trái = ảnh gương) + tay nắm, ca-pô, logo Ford là nút GLB riêng đặt ở bản lề (extras.pivot / extras.btn) ⇒ dựng thành nhóm
        //  quay được, bấm mở ở van/van-doors.js. Nạp sau khi cảnh chạy; tới lúc đó vỏ code (transitBody — van/transit.js) làm bản tạm. Nạp xong: gộp theo (vai trò xem xuyên, lớp vật liệu) → ~20 lượt vẽ, dùng chung
        //  vật liệu vỏ code (sơn kem bán trong suốt như cũ ở khoang ở; mũi xe + 2 cửa cabin sơn đục — khoang máy không có gì để xem), ẩn vỏ + táp-lô + nội thất cabin + bánh code; giữ thảm sàn cabin, biển số Jade (dời biển sau ra cửa
        //  sau thật), thang leo nóc dời theo cửa sau. Va chạm (core/collide.js) vẫn đọc vỏ code lúc khởi động — 2 vỏ cùng số đo.
        const VAN_GLB = window.__vanBin || 'https://michaeltran75.github.io/3d-garden/models/transit.bin';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
        // ĐỘNG CƠ trong khoang máy (G 18/10 "research about new glb và apply van engine to the model"): mẫu "Nelson Racing Engine B" (Rudy, CC-BY-4.0) — lưới
        //  quét AI 1,9 triệu tam giác + màu đỉnh, gộp 20 khúc, hàn đỉnh, giảm lưới giữ màu (simplifyWithAttributes, sai lệch ~1,4 cm) → 36k tam giác,
        //  src/models/engine.glb 235 KB (công cụ src/tools/engine/). V6 60° tăng áp kép, gốc ở giữa đáy cacte, đầu máy (puli) +Z. Đặt DỌC như Transit dẫn động cầu
        //  sau: quay −90° quanh Y (đầu máy về mũi xe −X, không lật — chữ NELSON trên nắp máy đọc đúng), thu 0,82 thật (0,902 đv/đv mẫu) cho vừa khoang:
        //  X −2,98 … −2,30 (sau ga-lăng, trước vách lửa / sàn cabin) · rộng ±0,44 (giữa 2 hốc bánh trước ±0,70) · đáy cacte Y 0,55, nắp máy 1,18 dưới ca-pô 1,28.
        //  Mũi xe sơn đục ⇒ chỉ thấy khi xem xuyên (nhóm 'keep' của vỏ GLB).
        const ENG_GLB = window.__engineGlb || 'https://michaeltran75.github.io/3d-garden/models/engine.glb', ENG_AT = { x: -2.64, y: 0.55, s: 0.902 };
        const vanGlb = { ready: false }, _ledV = new THREE.Vector3();
        const LINE_CLS = new Set(['paint', 'paintO', 'black', 'glass', 'frost', 'lens', 'chrome', 'red']);   // lớp vật liệu được vẽ nét viền (G 18/10 "bring back van border art line 100% visible")
        function transitGlb(g, body) {
          const M = body.M, lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide, ...o });
          const MAT = { paint: M.body, paintO: lam(M.body.color.getHex()), paintIn: M.body, black: M.black, chrome: M.chrome, glass: M.glass, frost: M.frost, lens: lam(0xdde4e6, { transparent: true, opacity: 0.55, depthWrite: false }),
            bulb: M.led, red: M.red, blue: M.blue, steel: lam(0x9a9d9f), tire: lam(0x2b2925), trim: lam(0xcfccc4), dash: lam(0x5d6163), dashTop: lam(0x46494b), ctrl: lam(0x3e4244),
            seat: lam(0x6f706c), yellow: lam(0xe8cf3a) };
          Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js'),
            fetch(VAN_GLB).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error('HTTP ' + r.status)))]).then(([{ GLTFLoader }, { MeshoptDecoder }, buf]) => {
            const b = new Uint8Array(buf); let s = 0x2545F491;   // bỏ lớp XOR (cùng dòng với công cụ ghi tệp)
            for (let i = 0; i < b.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; b[i] ^= s & 255; }
            const ldr = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
            ldr.parse(b.buffer, '', gl => { attach(gl.scene); ldr.loadAsync(ENG_GLB).then(eg => engine(eg.scene)).catch(err => console.warn('Engine GLB:', err)); }, err => console.warn('Transit GLB:', err));
          }).catch(err => console.warn('Transit GLB:', err));
          function attach(src) {
            src.updateMatrixWorld(true);
            const bins = new Map(), m4 = new THREE.Matrix4(), nm = new THREE.Matrix3(), v = new THREE.Vector3();
            src.traverse(o => {   // mỗi lưới: vai trò xem xuyên + nút bản lề (cửa trước, ca-pô) + nút bấm (tay nắm, logo) gần nhất phía trên — lưới bộ phận ghi theo toạ độ từ bản lề
              if (!o.isMesh) return; let role = '', piv = null, btn = null;
              for (let p = o; p; p = p.parent) { const u = p.userData || {}; role = role || u.role || ''; piv = piv || (u.pivot ? p : null); btn = btn || (u.btn ? p : null); }
              role = role || 'shell';
              const cls = o.material.name, key = (piv ? piv.name : '') + '|' + (btn ? btn.name : '') + '|' + role + '|' + cls; let bin = bins.get(key);
              if (!bin) bins.set(key, bin = { role, cls, piv, btn, at: piv ? piv.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(), P: [], N: [], I: [], n: 0 });
              const geo = o.geometry, P = geo.attributes.position, N = geo.attributes.normal, I = geo.index; m4.copy(o.matrixWorld); nm.getNormalMatrix(m4); const flip = m4.determinant() < 0;
              for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m4).sub(bin.at); bin.P.push(v.x, v.y, v.z); v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); bin.N.push(v.x, v.y, v.z); }
              for (let i = 0; i < I.count; i += 3) { const a = bin.n + I.getX(i), b2 = bin.n + I.getX(i + 1), c = bin.n + I.getX(i + 2); if (flip) bin.I.push(a, c, b2); else bin.I.push(a, b2, c); }   // nút lật (ghế phụ) ⇒ đảo thứ tự đỉnh
              bin.n += P.count;
            });
            const grp = { shell: new THREE.Group(), keep: new THREE.Group() };
            grp.shell.name = 'Vỏ Ford Transit (mẫu GLB)'; grp.shell.userData.xray = 'shell'; grp.keep.name = 'Cabin + bánh Ford Transit (mẫu GLB)'; grp.keep.userData.xray = 'keep';
            const parts = new Map(), partOf = (node, par, at) => { let G = parts.get(node); if (!G) { G = new THREE.Group(); G.name = node.name; G.userData.glb = node.userData; if (at) G.position.copy(at); par.add(G); parts.set(node, G); } return G; };
            for (const bin of bins.values()) {
              const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(bin.P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(bin.N, 3)); geo.setIndex(bin.I);
              if (bin.cls === 'drl') { ledFront(geo, bin, grp.shell); continue; }   // dải LED chạy ban ngày của đèn pha (lớp riêng trong transit.bin): tắt / sáng khi rê ca-pô
              const mat = MAT[bin.cls] || M.black, mesh = new THREE.Mesh(geo, mat); mesh.name = 'Transit · ' + bin.cls; mesh.castShadow = !mat.transparent || mat === M.body; mesh.receiveShadow = true;
              let par = grp[bin.role] || grp.shell; if (bin.piv) par = partOf(bin.piv, par, bin.at); if (bin.btn) par = partOf(bin.btn, par); par.add(mesh);   // bộ phận: nhóm đặt ở bản lề, nút bấm lồng trong
              if (bin.cls === 'paintIn') mesh.userData.xrayHide = true;   // vỏ trong khoang hàng: xem xuyên thì ẩn hẳn (nội thất rõ 100% — G 18/10)
              if (bin.role === 'shell' && LINE_CLS.has(bin.cls)) edge(mesh, geo, lineDark);   // nét viền kết cấu xe (mép tấm vỏ, khung kính, gờ ≥ 30°) — con của mặt vỏ ⇒ còn khi xem xuyên
            }
            for (const nm2 of ['Vỏ Ford Transit L3H2', 'Táp-lô', 'Nội thất cabin', 'Bánh xe']) { const o = g.getObjectByName(nm2); if (o) o.visible = false; }
            const rearPlate = body.plates.children[1]; if (rearPlate) rearPlate.position.x = 3.174;   // cửa sau GLB ở X 3,162 (vỏ code 3,05)
            const lad = g.getObjectByName('Thang leo nóc'); if (lad) lad.position.x += 0.105;
            g.add(grp.shell, grp.keep); xrayAdopt(grp.shell);
            vanGlb.ready = true; vanGlb.groups = grp; vanPartsInit([...parts.values()]);   // cửa trước, ca-pô, tay nắm, logo ⇒ nút bấm mở (van/van-doors.js)
          }
          function ledFront(geo, bin, par) {   // dải LED chạy ban ngày (viền chữ C + dải cong dưới trong đèn pha — mẫu có sẵn): xám lúc tắt; rê chuột lên ca-pô / logo thì trắng sáng
            //  + chuỗi quầng nhỏ cộng sáng rải dọc chính 2 dải (mỗi bên ≤ 30 điểm cách nhau ≥ 3 cm) ⇒ cả dải toả sáng, không chỉ 1 đốm (van/van-doors.js)
            const P = bin.P, pts = [[], []];
            for (let i = 0; i < P.length; i += 3) { const s = P[i + 2] > 0 ? 1 : 0, q = _ledV.fromArray(P, i); if (pts[s].every(o => o.distanceToSquared(q) > 0.0009)) pts[s].push(q.clone()); }
            const off = new THREE.Color(0x8f979e), mat = new THREE.MeshBasicMaterial({ color: off.clone(), side: THREE.DoubleSide }), m = new THREE.Mesh(geo, mat); m.name = 'Transit · LED chạy ban ngày'; m.userData.xray = 'keep'; par.add(m);
            const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
            gr.addColorStop(0, 'rgba(240,247,255,1)'); gr.addColorStop(0.4, 'rgba(215,232,255,0.4)'); gr.addColorStop(1, 'rgba(215,232,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
            const sm = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), halos = [];
            for (const L of pts) { const step = Math.max(1, Math.ceil(L.length / 30)); L.sort((a, b) => a.x - b.x || a.y - b.y);
              for (let i = 0; i < L.length; i += step) { const sp = new THREE.Sprite(sm); sp.position.copy(L[i]); sp.position.x -= 0.02; sp.scale.setScalar(0.12); sp.visible = false; par.add(sp); halos.push(sp); } }
            VPART.led = { mat, off, on: new THREE.Color(0xffffff), halos, sm, k: 0 };
          }
          function engine(src) {   // động cơ: màu đỉnh của mẫu, Lambert như cảnh; trong khoang kín ⇒ không đổ bóng
            const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
            src.traverse(o => { if (o.isMesh) { o.material = mat; o.castShadow = false; o.receiveShadow = true; } });
            const g2 = new THREE.Group(); g2.name = 'Động cơ V6 tăng áp kép (mẫu GLB)'; g2.rotation.y = -Math.PI / 2; g2.scale.setScalar(ENG_AT.s); g2.position.set(ENG_AT.x, ENG_AT.y, 0);
            g2.add(src); vanGlb.groups.keep.add(g2); vanGlb.engine = g2; vanGlb.engineSrc = src; vanGlb.engineMat = mat;
            engineTool.objs.push(g2); hovAdd(g2, { on: engineSeen, skip: m => m.material !== mat });   // rê: viền (chỉ vỏ máy) · bấm: bảng "Khởi động máy" (ui/xray-lifecycle.js)
          }
        }
