        // ===== GÀ MÁI THẢ VƯỜN × 3 (G 18/10 "add 3 chickens" + mẫu GLB; "add chicken behaviour and back to chuồng gà khi mặt trời lặn, và ra ngoài kiếm ăn khi
        //  mặt trời mọc, biết kiếm chỗ tránh mưa near by under cover") =====
        //  Mẫu "Chicken - rigged" (Maf'j Alvarez, CC-BY-4.0) dựng lại bằng src/tools/chicken/ → src/models/chicken.glb 152 KB: 1 lưới da màu đỉnh (736 tam giác,
        //  17 xương), mét, đầu về +Z, 6 hoạt cảnh (walking · pecking · idle · sitting-down · sitting-idle · standing-up). Mỗi con 1 bản sao (SkeletonUtils) + 1 bộ trộn.
        //  ĐI KHÔNG TRƯỢT CHÂN: hoạt cảnh 'walking' của mẫu có sẵn chuyển động gốc (cả thân tiến 0,23 m mỗi chu kỳ 1,58 s) ⇒ trừ dời tuyến tính khỏi các rãnh vị
        //  trí cho vòng lặp tại chỗ, rồi đẩy con gà tiến đúng 0,145 m/s × tốc độ phát ⇒ bàn chân trụ đứng yên trên đất như hoạt cảnh gốc.
        //  TẬP TÍNH (gà thả vườn: kiếm ăn = đi vài bước – dừng mổ – ngó quanh; đàn giữ gần nhau; sợ người lại gần, sợ tiếng máy; trú mưa; ngủ sớm):
        //   · KIẾM ĂN (G 18/10 "mổ xuống đất chỉ nên 1 hoặc 2 cái mỗi lần"; nghiên cứu): gà kiếm ăn = CÀO đất (chuỗi 4 nhát cố định, 2 chân xen kẽ — preprint
        //     Research Square rs-10362834 "fixed four-stroke scratching sequence") → LÙI 1 bước → CÚI NHÌN chỗ vừa bới → MỔ; hễ mổ được mồi là NGẨNG đầu nuốt /
        //     canh chừng (Cresswell & cs. 2003, Proc R Soc B 270: chim kiếm ăn dưới đất gần như lần nào nhặt được hạt cũng ngẩng đầu) và xác suất ngẩng sau mỗi
        //     cú mổ là hằng số, đàn càng nhỏ càng hay ngẩng (Caraco 1982, Condor 84) ⇒ đàn 3 con: mỗi lượt chỉ 1 cú (60%) hoặc 2 cú (40%), rồi ngẩng 0,7–2,2 s.
        //     Kiếm ăn ~61% thời gian thức (ACES, Alabama Extension); đàn canh gác luân phiên — không con nào đang ngẩng thì con vừa ngẩng đứng canh lâu hơn.
        //     Hoạt cảnh 'pecking' của mẫu = 1 cú mổ / vòng 0,875 s (mỏ hạ từ 0,3 s, chạm đất 0,47 và 0,62 s, ngẩng lại 0,875 s — đo) ⇒ phát đúng 1–2 vòng.
        //     Cào: xương chân mẫu (đùi · cẳng · bàn) quay quanh trục x cục bộ (đo: +0,6 rad đùi ⇒ bàn chân lùi 6 cm), cộng sau bộ trộn hoạt cảnh; đất văng ra sau.
        //   · NGÀY: kiếm ăn trên bãi cỏ trước CHUỒNG (camp/chicken-coop.js — tâm vùng cách cửa chuồng 3,5 m, bán kính 4 m): phần lớn thời gian kiếm ăn (chu trình
        //     cào – lùi – nhìn – mổ 1–2 cú – ngẩng ở trên), mỗi lượt đi 0,3–1,6 m chậm 0,12–0,22 m/s; xa đàn > 2,6 m thì đi về phía đàn; cách nhau ≥ 0,35 m; né
        //     vật cản, bếp lửa, mép nước; chui được gầm chuồng (chỉ né 4 chân). Sau mưa (đất ướt, giun lên) mổ nhiều hơn; cỏ vừa phát thì ra chỗ đã cắt;
        //   · SỢ: người < 1,4 m (đứng yên 1,0), máy cắt cỏ nổ < 4,5 m quanh người và < 3,2 m quanh lưỡi, chó chạy < 2 m, gấu mèo < 2,5 m ⇒ chạy tránh;
        //   · MẶT TRỜI LẶN (độ cao mặt trời < ~3,4° buổi chiều): lần lượt về chân cầu thang (con trước lên xong con sau mới lên), leo ván, chui cửa, nhảy lên sào,
        //     ngồi ngủ; cả 3 lên sào thì cửa tự động hạ. MẶT TRỜI MỌC (> ~1,7° buổi sáng): cửa mở, từng con (cách nhau ~4 s) đứng dậy, nhảy xuống sàn, ra cửa,
        //     xuống ván rồi đi kiếm ăn. Mở trang lúc đêm thì gà đã ở trên sào;
        //   · MƯA (ban ngày): mỗi con chạy tới chỗ TRÚ gần nhất — gầm chuồng, gốc 2 cây táo (tán che); bạt hiên xe thôi (18/10: bàn ghế trà dời vào dưới bạt, hết chỗ đứng ngoài vòng né đồ đạc) — đứng / ngồi xù lông chờ tạnh rồi ra;
        //   · trưa 12:00–13:30 ra gầm chuồng (bóng mát) ngồi nghỉ.
        //  CÁNH + NHẢY (G 23/10 "gà không có cánh, không vỗ cánh được… add thêm xương; thi thoảng nhảy lên, vỗ cánh, nhất là nhảy lên bậc / từ bậc trên xuống"):
        //   · mẫu gốc 17 xương: spine_00 (thân dưới) → head_01 (lưng trên) → bone_02 (gốc cổ, ngực) → bone_end_013; chuỗi "tail_011" thật ra là ĐẦU (tên gốc lệch,
        //     mào theo nó); 2 chân 5 đốt (đùi dài 0,061 · 3 đốt dưới ~0,018). Thân 1 khối liền, KHÔNG có cánh ⇒ thêm mỗi bên 1 lưới cánh skin (tấm trong: bao cánh + lông
        //     thứ cấp · tấm ngoài: sơ cấp mép răng cưa) với bộ xương đại diện riêng — xem "CÁNH = lưới skin" bên dưới. Thân hình quả lê ⇒ cánh khép nghiêng 36° ôm sườn.
        //   · vỗ ~8–9 nhát/giây (gà thịt 10–17 nhát/s, giảm theo tuổi — ASABE), cổ tay trễ nhịp; nhảy XUỐNG cao: dang cánh vỗ hãm nhưng gà mái vẫn đáp nặng
        //     (nhảy từ bệ 1,5 m đáp nhanh gấp 2–3 lần loài bay giỏi, cánh đã dùng hết công suất — León & cs. 2021) ⇒ nhún sâu khi đáp; nhảy LÊN: vỗ cánh đẩy thân (wing-assisted incline
        //     running — Dial 2003; bài tập WAIR cho gà mái, Hong & cs.); chơi: chạy xổng rồi nhảy vỗ cánh ("frolicking" / running-with-flapping — nhóm chơi vận
        //     động của gà, Sci Rep 2022); vỗ cánh + rũ lông khi đứng nghỉ (hành vi thoải mái).
        //   · bậc đất voxel quanh trại 0,1 / 0,6 / 1,2 m: nhìn trước 0,24 m thấy chênh > 0,12 ⇒ NGẮM (đứng mép; xuống thì ngó lâu hơn) → NHÚN (gập chân thật) → BAY
        //     (lên: bốc cao trước rồi mới tiến qua mép, co chân; xuống: bước ra rồi rơi, vỗ hãm) → ĐÁP (nhún, dang cánh giữ thăng bằng, khép). Lên > 0,95 m / xuống > 2,2 m: vật cản.
        //  Mỗi khung: chickens.update (loop/main-loop-rest.js) ----
        const chickens = (() => {
          const CHICK_GLB = window.__chickGlb || 'https://michaeltran75.github.io/3d-garden/models/chicken.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
          const C = { list: [], ready: false }, CO = chickenCoop;
          const HOME = new THREE.Vector3(CO.g.position.x + Math.sin(CO.YAW) * 3.5, 0, CO.g.position.z + Math.cos(CO.YAW) * 3.5), HOME_R = 4.0, V_CLIP = 0.23 / 1.583;   // V_CLIP: m/s ở tốc độ phát 1
          const LOOPS = ['walking', 'pecking', 'idle', 'sitting-idle'], ONCE = ['sitting-down', 'standing-up'];
          const PECK_T = 0.875, PECK_LOW = 0.3, STROKE = 0.3, _X = new THREE.Vector3(1, 0, 0), _qa = new THREE.Quaternion();   // vòng mổ (s) · lúc mỏ bắt đầu hạ · 1 nhát cào (s)
          const _a = new THREE.Vector3(), rnd = mulberry32(2718);
          function free(x, z, pad = 0.25) {   // chỗ đứng được: không nước, không trong vật cản / đồ đạc / bếp lửa (gầm chuồng thì được)
            if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z)))) return false;
            if (Math.hypot(x - pf.x, z - pf.z) < FIRE_AVOID_R + 0.2) return false;
            for (const o of obstacleCoords) if (!o.coop && Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
            for (const o of ENG_PROPS) if (Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
            return true;
          }
          function pick(h, cx, cz, r0, r1, tries = 12) {   // điểm ngẫu nhiên đi được trong vành r0–r1 quanh (cx, cz)
            for (let i = 0; i < tries; i++) { const a = rnd() * 6.2832, r = r0 + (r1 - r0) * rnd(), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
              if (free(x, z) && Math.hypot(x - HOME.x, z - HOME.z) < HOME_R + 2.5) return h.tgt.set(x, 0, z); }
            return h.tgt.set(h.g.position.x, 0, h.g.position.z);
          }
          // ---- CÁNH: mỗi bên tấm trong (bao cánh + lông thứ cấp) + tấm ngoài (sơ cấp); đường viền (u lùi về đuôi, v xuống dưới, mét) → hệ cánh: x pháp tuyến ra ngoài, y mép trước, z = −u ----
          //  dáng gốc = KHÉP: uốn dọc theo sườn (bán kính 0,16 m — đo bằng tia chiếu lên da); morph = DANG: phẳng, khum về −x (khi dang mặt đó hướng lên). Khép thì tấm ngoài lùa dưới
          //  tấm trong (cổ tay dời lên WR_F), chỉ lòi chóp lông sơ cấp ở đuôi cánh; dang thì cổ tay ra mép tấm trong (WR_S) ⇒ sải cánh dài gần gấp đôi lúc khép
          const WS = 1.2, TAU2 = Math.PI * 2, WR_F = 0.015, WR_S = 0.088, BEND = 0.32;
          const W_IN = [[0, 0], [0.03, 0.006], [0.09, 0.001], [0.09, -0.07], [0.075, -0.08], [0.06, -0.072], [0.045, -0.082], [0.03, -0.072], [0.012, -0.06], [0, -0.025]];   // mép dưới so le: đầu lông thứ cấp
          const W_OUT = [[0, 0], [0.05, -0.004], [0.1, -0.02], [0.088, -0.036], [0.075, -0.03], [0.062, -0.05], [0.048, -0.044], [0.034, -0.064], [0.02, -0.058], [0.005, -0.07], [0, -0.07]];   // răng cưa: đầu lông sơ cấp
          function wingGeo(pts, uf, us) {   // uf: chỗ tấm nằm dọc thân lúc khép (để uốn) · us: chỗ trên sải lúc dang (để ngả xám về đầu cánh)
            const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts.map(([u, v]) => new THREE.Vector2(u * WS, v * WS))), { depth: 0.005, bevelEnabled: false });   // vốn không đánh chỉ số: mỗi tam giác 3 đỉnh riêng
            const P = g.attributes.position, M = P.clone(), col = [];
            for (let i = 0; i < P.count; i++) { const u = P.getX(i), v = P.getY(i), w = P.getZ(i) - 0.0025, cv = Math.min(1, Math.max(0, -v / (0.085 * WS))), du = u + (uf - 0.055) * WS;
              P.setXYZ(i, w - du * du / BEND, v, -u); M.setXYZ(i, w - 0.009 * WS * Math.sin(Math.PI * cv), v, -u);
              const c = 0.97 - 0.13 * THREE.MathUtils.smoothstep(us + u / WS, 0.09, 0.17) - 0.06 * Math.max(0, cv - 0.6); col.push(c, c, c * 0.97); }
            g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.deleteAttribute('uv'); g.computeVertexNormals();
            const t = new THREE.BufferGeometry(); t.setAttribute('position', M); t.computeVertexNormals(); g.morphAttributes.position = [M]; g.morphAttributes.normal = [t.attributes.normal]; return g;
          }
          const WING_IN = wingGeo(W_IN, 0, 0), WING_OUT = wingGeo(W_OUT, WR_F, WR_S);
          const inPoly = (pts, u, v) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [ui, vi] = pts[i], [uj, vj] = pts[j]; if ((vi > v) !== (vj > v) && u < (uj - ui) * (v - vi) / (vj - vi) + ui) c = !c; } return c; };
          const _Y = new THREE.Vector3(0, 1, 0), _Z = new THREE.Vector3(0, 0, 1);
          const QS = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0)));   // dang: dọc cánh ra ngang, mép trước về đầu
          // khép (hệ con gà, bên trái, đứng ở khung 0 của 'idle'): góc trước-trên tấm + hướng — mặt phẳng ôm sườn đo bằng tia chiếu (sườn phình dưới ⇒ nghiêng ra 36°, đuôi cánh chụm vào + chúc xuống)
          const QD = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0.728, 0.595, -0.341), new THREE.Vector3(-0.646, 0.762, -0.05), new THREE.Vector3(0.23, 0.256, 0.939))), PD = new THREE.Vector3(0.068, 0.275, 0.05);
          // CÁNH = lưới skin, mỗi bên 1 bộ XƯƠNG ĐẠI DIỆN (tấm × xương thân): da mẫu này biến dạng mạnh (ngồi: sườn trên tụt 18 cm; đi: gốc cổ nhấp 3 cm) nên vật cứng không bám nổi.
          //  · đỉnh cánh chép trọng số của 4 đỉnh da gần nhất (weight transfer); xương đại diện (tấm k, xương thân b) dời đúng như b đã dời kể từ lúc tạo ⇒ cánh KHÉP biến dạng y như sườn dưới nó
          //  · DANG: mỗi xương đại diện nội suy (lerp vị trí · slerp hướng) về xương VAI (tấm trong) / CỔ TAY (tấm ngoài) theo độ dang s ⇒ s = 1 thì cả tấm cứng; khung gấp lúc này = trung bình
          //    quaternion các xương đại diện tấm trong theo trọng số, góc vai = điểm skin ở gốc tấm ⇒ dang / vỗ tính trong hệ lúc tạo rồi xoay theo Δ — chuyển khép ↔ dang liền mạch
          //  · bên phải: tính trong toạ độ lật sang trái rồi lật gương (vị trí x → −x, quaternion (x, −y, −z, w), lưới lật + đảo chiều tam giác) — không dùng scale âm
          const ONE = new THREE.Vector3(1, 1, 1), mirQ = (q, sd) => sd > 0 ? q : _wq.set(q.x, -q.y, -q.z, q.w);
          const _wa = new THREE.Vector3(), _wv = new THREE.Vector3(), _wx = new THREE.Vector3(), _wy = new THREE.Vector3(), _wp = new THREE.Vector3(), _ws = new THREE.Vector3(), _wpb = new THREE.Vector3(), _wsb = new THREE.Vector3();
          const _wq = new THREE.Quaternion(), _wq2 = new THREE.Quaternion(), _wqb = new THREE.Quaternion(), _wd = new THREE.Quaternion(), _wg = new THREE.Quaternion(), _wm = new THREE.Matrix4(), _wi = new THREE.Matrix4(), _wt = [new THREE.Matrix4(), new THREE.Matrix4()];
          function skinOf(h, V, p) {   // trọng số da tại p (hệ con gà, tư thế lúc tạo): 4 đỉnh thân gần nhất trộn theo nghịch khoảng cách, giữ 4 xương nặng nhất
            const near = []; for (let i = 0; i < V.length; i++) { const d = V[i].distanceToSquared(p); if (near.length < 4 || d < near[3][0]) { near.push([d, i]); near.sort((a, b) => a[0] - b[0]); if (near.length > 4) near.pop(); } }
            const SI = h.sk.geometry.attributes.skinIndex, SW = h.sk.geometry.attributes.skinWeight, acc = new Map();
            for (const [d, i] of near) { const k = 1 / (Math.sqrt(d) + 0.004); for (let c = 0; c < 4; c++) { const w = SW.getComponent(i, c); if (w > 0) { const b = SI.getComponent(i, c); acc.set(b, (acc.get(b) || 0) + w * k); } } }
            const top = [...acc].sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((t, e) => t + e[1], 0);
            while (top.length < 4) top.push([0, 0]); return [top.map(e => e[0]), top.map(e => e[1] / sum)];
          }
          function addWings(h, body, mat) {   // lúc tạo, gà đứng ở khung 0 của 'idle': đo độ hở với sườn, dựng lưới skin + xương đại diện mỗi bên
            body.traverse(o => { if (o.isSkinnedMesh) h.sk = o; }); h.body = body; h.g.updateMatrixWorld(true);
            const MG = new THREE.Matrix4().copy(h.g.matrixWorld).invert().multiply(h.sk.matrixWorld), bones = h.sk.skeleton.bones, G0 = h.g.matrixWorld;   // hệ mesh → hệ con gà
            const V = []; for (let i = 0; i < h.sk.geometry.attributes.position.count; i++) V.push(h.sk.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(MG));
            const iqd = QD.clone().invert(), qw = new THREE.Quaternion().setFromAxisAngle(_X, -0.08); h.wing = { s: 0, sT: 0, a: 0, aT: 0, ph: rnd() * TAU2, f: 8.5, sides: [] };
            for (const sd of [1, -1]) {   // +1 trái (+x) · −1 phải (thân lệch tâm x = −0,006)
              const pd = PD.clone(); if (sd < 0) pd.x += 0.012;
              let off = -1;   // độ hở: mọi đỉnh thân nằm dưới đường viền 2 tấm phải thấp hơn mặt trong tấm (đã uốn) ≥ 3 mm
              for (const p of V) { _wv.set(p.x * sd, p.y, p.z).sub(pd).applyQuaternion(iqd); const u = -_wv.z, v = _wv.y, du = u - 0.055 * WS, b = du * du / BEND;
                if (inPoly(W_IN, u / WS, v / WS)) off = Math.max(off, _wv.x + 0.0025 + b + 0.003);
                if (inPoly(W_OUT, u / WS - WR_F, v / WS)) off = Math.max(off, _wv.x + 0.0075 + b + 0.003); }
              const A = pd.addScaledVector(_wx.set(1, 0, 0).applyQuaternion(QD), off);   // góc trước-trên tấm khép (lật sang trái)
              const Fin = new THREE.Matrix4().compose(_wv.set(A.x * sd, A.y, A.z), mirQ(QD, sd), ONE);   // hệ tấm trong lúc tạo (hệ con gà thật)
              const Fout = Fin.clone().multiply(_wm.compose(_wy.set(-0.005 * sd, 0, -WR_F * WS), mirQ(qw, sd), ONE));   // hệ tấm ngoài (cổ tay khép, lùa dưới tấm trong)
              const prox = new Map(), skel = [], E = [], pan = [], wsum = new Map(), pos = [], nor = [], col = [], mpos = [], mnor = [], si = [], swt = [];
              const proxOf = (k, b, F) => { const key = k * 64 + b; let x = prox.get(key); if (x !== undefined) return x; x = skel.length; prox.set(key, x);
                const o = new THREE.Bone(); o.name = (sd > 0 ? 'left' : 'right') + '-wing-' + (k ? 'wrist' : 'shoulder') + '@' + bones[b].name; o.matrixAutoUpdate = false; skel.push(o); pan.push(k);
                E.push([bones[b], new THREE.Matrix4().copy(bones[b].matrixWorld).invert().multiply(G0).multiply(F)]); return x; };   // P = B(t)·B(t0)⁻¹·G0·F
              for (const [k, G, F] of [[0, WING_IN, Fin], [1, WING_OUT, Fout]]) {
                const P = G.attributes.position, N = G.attributes.normal, Cc = G.attributes.color, MP = G.morphAttributes.position[0], MN = G.morphAttributes.normal[0];
                for (let t = 0; t < P.count; t += 3) for (const j of sd > 0 ? [t, t + 1, t + 2] : [t, t + 2, t + 1]) {
                  pos.push(P.getX(j) * sd, P.getY(j), P.getZ(j)); nor.push(N.getX(j) * sd, N.getY(j), N.getZ(j)); mpos.push(MP.getX(j) * sd, MP.getY(j), MP.getZ(j)); mnor.push(MN.getX(j) * sd, MN.getY(j), MN.getZ(j));
                  col.push(Cc.getX(j), Cc.getY(j), Cc.getZ(j)); const sw = skinOf(h, V, _wv.set(P.getX(j) * sd, P.getY(j), P.getZ(j)).applyMatrix4(F));
                  for (let c = 0; c < 4; c++) { const w = sw[1][c], x = w > 0 ? proxOf(k, sw[0][c], F) : 0; si.push(x); swt.push(w); if (w > 0 && !k && !/thigh/.test(bones[sw[0][c]].name)) wsum.set(x, (wsum.get(x) || 0) + w); }   // khung dang: chỉ cổ · lưng · thân (đùi lắc theo bước chân)
                } }
              const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
              g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(swt, 4));
              g.morphAttributes.position = [new THREE.Float32BufferAttribute(mpos, 3)]; g.morphAttributes.normal = [new THREE.Float32BufferAttribute(mnor, 3)];
              const skin = new THREE.SkinnedMesh(g, mat); skin.name = sd > 0 ? 'Cánh trái' : 'Cánh phải'; skin.castShadow = true; skin.frustumCulled = false; h.g.add(skin);
              skin.bind(new THREE.Skeleton(skel, skel.map(() => new THREE.Matrix4())), new THREE.Matrix4());   // xương đại diện ngoài cây cảnh: tự đặt matrixWorld mỗi khung
              const tw = [...wsum.values()].reduce((a, b) => a + b, 0), ow = skinOf(h, V, _wv.setFromMatrixPosition(Fin)), owp = [];
              for (let c = 0; c < 4; c++) { const x = prox.get(ow[0][c]); if (ow[1][c] > 0 && x !== undefined) owp.push([x, ow[1][c]]); }
              const ot = owp.reduce((a, e) => a + e[1], 0); owp.forEach(e => e[1] /= ot);
              h.wing.sides.push({ sd, off, skin, skel, E, pan, wbar: [...wsum].map(([x, w]) => [x, w / tw]), ow: owp });
            }
          }
          function wingTick(h, dt) {   // gọi SAU khi đặt vị trí / hướng con gà; việc đang làm đặt W.sT (dang 0–1), W.aT (biên độ vỗ), W.f (nhịp) mỗi khung
            const W = h.wing; if (!W) return;
            W.s += (W.sT - W.s) * (1 - Math.exp(-dt * (W.sT > W.s ? 16 : 7))); W.a += (W.aT - W.a) * (1 - Math.exp(-dt * 12)); W.ph += TAU2 * W.f * dt;
            const s = W.s, flap = W.a * (0.95 * Math.sin(W.ph) + 0.3), lag = -0.5 * W.a * Math.cos(W.ph);   // vỗ lên nhiều hơn xuống · lông sơ cấp uốn theo sau
            h.g.updateMatrixWorld(true); h.g.matrixWorld.decompose(_wp, _wg, _ws); _wi.copy(h.g.matrixWorld).invert();
            for (const S of W.sides) {
              for (let j = 0; j < S.skel.length; j++) S.skel[j].matrixWorld.multiplyMatrices(S.E[j][0].matrixWorld, S.E[j][1]);   // bám da: xương thân dời bao nhiêu từ lúc tạo, tấm dời bấy nhiêu
              S.skin.morphTargetInfluences[0] = s; if (s < 1e-3) continue;
              _wd.set(0, 0, 0, 0); for (const [j, w] of S.wbar) { S.skel[j].matrixWorld.decompose(_wpb, _wq2, _wsb); if (_wd.dot(_wq2) < 0) _wq2.set(-_wq2.x, -_wq2.y, -_wq2.z, -_wq2.w); _wd.set(_wd.x + w * _wq2.x, _wd.y + w * _wq2.y, _wd.z + w * _wq2.z, _wd.w + w * _wq2.w); }
              _wd.normalize().premultiply(_qa.copy(_wg).invert()); if (S.sd < 0) _wd.set(_wd.x, -_wd.y, -_wd.z, _wd.w); _wd.multiply(_qa.copy(QD).invert());   // Δ: khung gấp lúc này so với lúc tạo (hệ con gà, lật sang trái)
              _wa.set(0, 0, 0); for (const [j, w] of S.ow) _wa.addScaledVector(_wpb.setFromMatrixPosition(S.skel[j].matrixWorld), w); _wa.applyMatrix4(_wi).x *= S.sd;   // góc vai khép lúc này
              _wq.copy(QD).slerp(QS, s).premultiply(_qa.setFromAxisAngle(_Y, 0.3 * s)).premultiply(_qa.setFromAxisAngle(_Z, flap * s)).premultiply(_wd);   // dang · chéo về sau · vỗ quanh trục dọc thân
              _wx.set(-0.015 * s, 0.028 * s, -0.012 * s).applyQuaternion(_qa.copy(_wd).multiply(QD)).add(_wa);   // khép: góc trước-trên tấm · dang: khớp vai thật (cao hơn, lẩn vào thân)
              _wt[0].compose(_wx.set(_wx.x * S.sd, _wx.y, _wx.z), mirQ(_wq, S.sd), ONE).premultiply(h.g.matrixWorld);   // xương VAI (thế giới)
              _wq2.setFromAxisAngle(_X, -0.08 - 0.06 * s).multiply(_qa.setFromAxisAngle(_Y, lag * s));
              _wt[1].compose(_wy.set(-0.005 * (1 - s) * S.sd, 0, -(WR_F + (WR_S - WR_F) * s) * WS), mirQ(_wq2, S.sd), ONE).premultiply(_wt[0]);   // xương CỔ TAY
              for (let j = 0; j < S.skel.length; j++) { const M = S.skel[j].matrixWorld; M.decompose(_wp, _wq2, _ws); _wt[S.pan[j]].decompose(_wpb, _wqb, _wsb); M.compose(_wp.lerp(_wpb, s), _wq2.slerp(_wqb, s), _ws.lerp(_wsb, s)); }
            }
            W.sT = 0; W.aT = 0; W.f = 8.5;
          }
          function legTuck(h, k) {   // co chân khi bay: gập chữ Z đùi −0,5k · gối −2,4k · cổ chân +2,9k — bàn chân lên 5 cm, ra trước 4 cm dưới bụng (dò lưới; đốt đùi dài 0,061, các đốt dưới chỉ ~0,018)
            if (k < 0.01) return; for (const L of h.legs) { L[0].quaternion.multiply(_qa.setFromAxisAngle(_X, -0.5 * k)); L[1].quaternion.multiply(_qa.setFromAxisAngle(_X, -2.4 * k)); L[2].quaternion.multiply(_qa.setFromAxisAngle(_X, 2.9 * k)); }
          }
          // nhún (bật / đáp): gập chữ Z đùi +0,3k · gối −2,4k · cổ chân +2,1k (tổng 0: ngón vẫn phẳng) — dò lưới để bàn chân đứng yên (trượt ≤ 8 mm); thân hạ đúng bằng chân co ≈ 0,03·k^1,8 (đơn vị thân)
          function legCrouch(h, k) {
            if (k < 0.01) return 0; for (const L of h.legs) { L[0].quaternion.multiply(_qa.setFromAxisAngle(_X, 0.3 * k)); L[1].quaternion.multiply(_qa.setFromAxisAngle(_X, -2.4 * k)); L[2].quaternion.multiply(_qa.setFromAxisAngle(_X, 2.1 * k)); }
            return -0.03 * Math.pow(k, 1.8) * h.g.scale.x;
          }
          // ---- NHẢY: ngắm (đứng mép bậc ngó) → nhún → bay → đáp; lên bậc bốc cao trước rồi mới tiến qua mép, xuống bậc bước ra trước rồi mới rơi ----
          function jumpStart(h, x, z, y1, kind) {
            const p = h.g.position, y0 = h.gy, up = y1 - y0;
            h.jp = { p0: new THREE.Vector3(p.x, y0, p.z), p1: new THREE.Vector3(x, y1, z), up, t: 0, ph: kind === 'hop' ? 'crouch' : 'aim', kind, aim: up < 0 ? 0.3 + 0.4 * rnd() : 0.15 + 0.2 * rnd(),   // xuống: ngần ngừ lâu hơn
              T: kind === 'hop' ? 0.5 : up > 0.05 ? 0.42 + 0.25 * up : 0.34 + 0.3 * Math.sqrt(-up), arc: kind === 'hop' ? 0.24 + 0.1 * rnd() : up > 0.05 ? 0.12 + 0.15 * up : 0.06 };
          }
          function jumpTick(h, dt) {
            const J = h.jp, p = h.g.position, W = h.wing, upJ = J.up > 0.05, down = J.up < -0.05, push = upJ || J.kind === 'hop'; J.t += dt; play(h, 'idle');
            if (J.ph === 'aim') { h.pitchT = down ? 0.14 : -0.04; if (J.t >= J.aim) { J.ph = 'crouch'; J.t = 0; } }   // xuống: chúi ngó chỗ đáp
            else if (J.ph === 'crouch') { const cT = push ? 0.22 : 0.14, u = Math.min(1, J.t / cT); h.ckT = (push ? 0.85 : 0.5) * u; h.pitchT = push ? -0.15 * u : 0.14; W.sT = Math.max(W.s, 0.7 * u); W.aT = 0.3 * u;
              if (J.t >= cT) { J.ph = 'air'; J.t = 0; } }
            else if (J.ph === 'air') {
              const u = Math.min(1, J.t / J.T), hz = upJ ? Math.pow(u, 1.6) : down ? 1 - Math.pow(1 - u, 2.2) : u, vy = upJ ? 1 - Math.pow(1 - u, 2.2) : down ? Math.pow(u, 1.8) : u;
              p.x = J.p0.x + (J.p1.x - J.p0.x) * hz; p.z = J.p0.z + (J.p1.z - J.p0.z) * hz; p.y = J.p0.y + (J.p1.y - J.p0.y) * vy + J.arc * Math.sin(Math.PI * u);
              h.pitchT = upJ ? -0.15 * (1 - u) : 0.12 * Math.sin(Math.PI * u); W.sT = 1; W.aT = 1; W.f = down ? 9.5 : 8.5;   // xuống: vỗ hãm dồn dập
              h.tuck = Math.sin(Math.PI * Math.min(1, u * 1.15));
              if (J.t >= J.T) { J.ph = 'land'; J.t = 0; p.copy(J.p1); }
            } else {
              const hard = J.up < -0.3, lT = hard ? 0.45 : 0.32, u = Math.min(1, J.t / lT); h.ckT = (hard ? 1 : 0.75) * (u < 0.2 ? 1 : 1 - (u - 0.2) / 0.8); h.pitchT = 0.1 * Math.sin(Math.PI * u);   // đáp nặng (gà mái đáp nhanh gấp 2–3 chim bay giỏi): nhún sâu, chúi tới
              W.sT = u < 0.55 ? 1 : 0; W.aT = 0.5 * (1 - u); h.tuck = 0;   // dang cánh giữ thăng bằng rồi khép
              if (J.t >= lT) { h.jp = null; h.gy = J.p1.y; }
            }
          }
          let COVERS = null;
          function covers() {   // chỗ trú mưa: [tên, [3 điểm]] — gầm chuồng · gốc mỗi cây táo (cách thân 0,75 m, chỗ đứng được)
            if (COVERS) return COVERS; COVERS = [['gầm chuồng', CO.under]];
            for (const T of appleTrees) { const p = T.getWorldPosition(new THREE.Vector3()), pts = [];
              for (let k = 0; k < 12 && pts.length < 3; k++) { const a = k / 12 * 6.2832, x = p.x + Math.cos(a) * 0.75, z = p.z + Math.sin(a) * 0.75; if (free(x, z, 0.05)) pts.push(new THREE.Vector3(x, 0, z)); }
              if (pts.length === 3) COVERS.push(['gốc táo', pts]); }
            return COVERS;
          }
          function nearestCover(h) { let best = null, bd = Infinity; for (const [, pts] of covers()) { const q = pts[h.i % pts.length], d = Math.hypot(q.x - h.g.position.x, q.z - h.g.position.z); if (d < bd) { bd = d; best = q; } } return best; }
          const roostTime = () => { const hh = liveWeather.localHour; return hh >= 12 ? sunElevSin < 0.06 : sunElevSin < 0.03; };   // chiều: mặt trời thấp ~3,4° là về · sáng: lên ~1,7° mới ra
          ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/utils/SkeletonUtils.js')])
            .then(([{ GLTFLoader }, SU]) => new GLTFLoader().loadAsync(CHICK_GLB).then(gl => [gl, SU])).then(ldAfter).then(([gl, SU]) => {
              const walk = gl.animations.find(a => a.name === 'walking');
              for (const tr of walk.tracks) if (tr.name.endsWith('.position') && tr.times.length > 1) {   // bỏ chuyển động gốc: trừ dời tuyến tính đầu → cuối
                const n = tr.times.length, T0 = tr.times[0], T1 = tr.times[n - 1], d = [0, 1, 2].map(q => tr.values[(n - 1) * 3 + q] - tr.values[q]);
                for (let i = 0; i < n; i++) { const u = (tr.times[i] - T0) / (T1 - T0); for (let q = 0; q < 3; q++) tr.values[i * 3 + q] -= d[q] * u; }
              }
              const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
              for (let i = 0; i < 3; i++) {
                const body = SU.clone(gl.scene); body.traverse(o => { if (o.isSkinnedMesh) { o.material = mat; o.castShadow = true; o.frustumCulled = false; } });
                const g = new THREE.Group(); g.name = 'Gà mái #' + (i + 1); g.userData.noBatch = true; g.add(body); g.scale.setScalar((0.92 + 0.12 * rnd()) * 1.1); scene.add(g);   // G 18/10: to thêm 10% (cao 0,40 → 0,44 m)
                const mixer = new THREE.AnimationMixer(body), A = {}, W = {};
                for (const c of gl.animations) { const a = A[c.name] = mixer.clipAction(c); W[c.name] = 0; a.setEffectiveWeight(0); if (ONCE.includes(c.name)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } else a.play(); a.time = rnd() * c.duration; }
                const h = { g, mixer, A, W, anim: 'idle', st: 'look', k: 0, dur: 1 + 2 * rnd(), tgt: new THREE.Vector3(), spd: 0, v: 0, yaw: rnd() * 6.2832, i, sit: 0, gy: 0, level: 'ground', path: null, pi: 0, seg0: new THREE.Vector3(), segT: 0, np: 1, kick: 0 };
                const bn = {}; body.traverse(o => { if (o.isBone) bn[o.name] = o; });
                h.legs = [['left-thigh_03', 'left-thigh001_04', 'left-shin_05', 'left-foot_end_015'], ['right-thigh_07', 'right-thigh001_08', 'right-shin_09', 'right-foot_end_012']].map(L => L.map(n => bn[n]));   // xương chân để cào đất
                const a = i / 3 * 6.2832; g.position.set(HOME.x + Math.cos(a) * 0.8, 0, HOME.z + Math.sin(a) * 0.8); h.gy = g.position.y = cowY(g.position.x, g.position.z);
                g.rotation.order = 'YXZ'; { const t = A.idle.time; A.idle.time = 0; A.idle.setEffectiveWeight(1); mixer.update(0); addWings(h, body, mat); A.idle.setEffectiveWeight(0); A.idle.time = t; } h.nextFlap = 60 + 240 * rnd(); h.nextPlay = 120 + 360 * rnd(); h.pitch = h.pitchT = h.roll = h.tuck = h.ck = h.ckT = 0;   // cánh đo trên dáng đứng chuẩn (khung 0 'idle') · xoay: hướng → chúc / ngửa → nghiêng
                C.list.push(h);
              }
              if (roostTime()) for (const h of C.list) { const P = CO.perch[h.i]; h.g.position.copy(P.on); h.yaw = P.yaw; h.st = 'roost'; h.level = 'perch'; h.sit = 1; h.anim = 'sitting-idle'; h.k = 99; }   // mở trang lúc đêm: gà đã lên sào
              C.ready = true;
            }).catch(err => console.warn('Chicken GLB:', err)));
          function play(h, name, ts = 1) {   // hoạt cảnh chính: lặp ⇒ hoà trọng số; 1 lần ⇒ phát lại từ đầu, giữ khung cuối
            if (h.anim !== name) { h.anim = name; if (ONCE.includes(name)) { const a = h.A[name]; a.reset(); a.play(); } }
            h.A[name].timeScale = ts;
          }
          // ---- chu trình kiếm ăn: cào 4 nhát → lùi 1 bước → cúi nhìn → mổ 1–2 cú → ngẩng (nuốt, canh chừng) ----
          function peckStart(h, from) {   // from: 'inspect' (mỏ đã hạ nửa chừng) hoặc vào thẳng
            h.st = 'peck'; h.k = 0; h.np = rnd() < 0.6 ? 1 : 2; h.ts = 1.15 + 0.25 * rnd();
            const t0 = from === 'inspect' ? PECK_LOW : 0; h.A.pecking.time = t0; h.dur = (PECK_T - t0 + (h.np - 1) * PECK_T) / h.ts;
          }
          function lookStart(h, heads, extra = 0) {   // ngẩng: nuốt mồi + canh chừng; cả đàn đang cúi thì con này canh lâu hơn (canh gác luân phiên)
            h.st = 'look'; h.k = 0; h.dur = (0.7 + 1.5 * rnd()) * (heads ? 1 : 1.6) + extra;
          }
          function forageNext(h, wet) {   // sau khi ngẩng: cào tiếp · mổ lại chỗ cũ · đi chỗ khác (đất ướt: giun lên ⇒ cào / mổ nhiều hơn)
            const r = rnd();
            if (r < (wet ? 0.38 : 0.3)) { h.st = 'scratch'; h.k = 0; h.dur = 4 * STROKE + 0.15; h.side = rnd() < 0.5 ? 0 : 1; return true; }
            if (r < (wet ? 0.66 : 0.5)) { h.st = 'inspect'; h.k = 0; h.dur = 0.35 + 0.4 * rnd(); return true; }
            return false;
          }
          function scratchLegs(h) {   // cộng góc cào vào xương chân (sau bộ trộn): nhát n dùng chân (side + n) % 2 — với trước–lên · cào lùi sát đất · thu về
            const u = h.k / STROKE, n = Math.floor(u); if (n > 3) return; const p = u - n, L = h.legs[(h.side + n) % 2];
            const s = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
            let a, b, c;
            if (p < 0.3) { const k = s(p / 0.3); a = -0.35 * k; b = -0.9 * k; c = 1.8 * k; }
            else if (p < 0.75) { const k = s((p - 0.3) / 0.45); a = -0.35 + 0.95 * k; b = -0.9 * (1 - k); c = 1.8 * (1 - k); }
            else { const k = s((p - 0.75) / 0.25); a = 0.6 * (1 - k); b = -0.3 * Math.sin(Math.PI * k); c = 0.6 * Math.sin(Math.PI * k); }
            L[0].quaternion.multiply(_qa.setFromAxisAngle(_X, a)); L[1].quaternion.multiply(_qa.setFromAxisAngle(_X, b)); L[2].quaternion.multiply(_qa.setFromAxisAngle(_X, c));
            if (p > 0.45 && p < 0.7 && h.kick !== n + 1) { h.kick = n + 1; h.g.updateMatrixWorld(true); dirtKick(L[3].getWorldPosition(_a), h.yaw); }   // giữa nhát cào: đất văng ra sau
          }
          // đất văng khi cào: 24 hạt dùng chung cả đàn, bay ngược hướng gà nhìn, rơi theo trọng lực 0,45 s
          const dirt = new THREE.InstancedMesh(new THREE.SphereGeometry(0.009, 4, 3), new THREE.MeshLambertMaterial({ color: 0x5a4330 }), 24); dirt.name = 'Đất gà bới'; dirt.frustumCulled = false; dirt.count = 24;
          dirt.userData.noBatch = dirt.userData.noBake = dirt.userData.noCollide = true; scene.add(dirt);
          const DP = Array.from({ length: 24 }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), t: 9 })), _dm = new THREE.Matrix4(), _dz = new THREE.Matrix4().makeScale(0, 0, 0);
          let dirtI = 0;
          function dirtKick(p, yaw) { for (let k = 0; k < 3; k++) { const d = DP[dirtI++ % 24]; d.p.copy(p); d.t = 0; const s = 0.35 + 0.3 * rnd(), sp = (rnd() - 0.5) * 0.8; d.v.set(-Math.sin(yaw + sp) * s, 0.5 + 0.4 * rnd(), -Math.cos(yaw + sp) * s); } }
          function dirtTick(dt) {
            for (let k = 0; k < 24; k++) { const d = DP[k]; if (d.t < 0.45) { d.t += dt; d.v.y -= 6 * dt; d.p.addScaledVector(d.v, dt); _dm.makeTranslation(d.p.x, d.p.y, d.p.z); dirt.setMatrixAt(k, _dm); } else dirt.setMatrixAt(k, _dz); }
            dirt.instanceMatrix.needsUpdate = true;
          }
          function threat(h) {   // vật đáng sợ gần nhất (người, máy cắt cỏ đang nổ, lưỡi cắt, chó chạy, gấu mèo)
            const p = h.g.position, e = engObj, out = [];
            if (e.g.parent === scene && !e.inVan) out.push([e.g.position, trimKit.eng.on ? 4.5 : e.walking ? 1.4 : 1.0]);
            if (trimKit.eng.on && trimKit.shaftMode === 'pose') out.push([trimKit.bladeW(_a), 3.2]);   // lưỡi đang quay: sợ chính cái lưỡi (người đứng sau, lưỡi lia trước mặt)
            if (dogObj.visible !== false) out.push([dogObj.position, C.dogV > 0.6 ? 2.0 : 0.8]);   // chó chạy lại gần mới sợ
            if (raccoonObj.visible) out.push([raccoonObj.position, 2.5]);
            let best = null, bd = Infinity; for (const [q, r] of out) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < r && d < bd) { bd = d; best = q; } }
            return best;
          }
          let CIRC = null;
          function circles() {   // vật cản tròn quanh vùng gà đi (xe, cây, lò, đống củi, ghế, bàn, bếp lửa, 4 chân chuồng…) — gom 1 lần; vòng của chuồng bỏ (gà chui gầm)
            if (CIRC) return CIRC; CIRC = [];
            for (const o of [...obstacleCoords, ...ENG_PROPS]) if (!o.coop && Math.hypot(o.x - HOME.x, o.z - HOME.z) < 18) CIRC.push([o.x, o.z, o.r]);
            CIRC.push([pf.x, pf.z, FIRE_AVOID_R], ...CO.legs); return CIRC;
          }
          function steer(h, dt, turn) {   // quay dần về đích, né đàn / vật cản (đẩy ra + trượt vòng quanh), tiến theo hướng thân; không bao giờ lọt vào trong vật cản
            const p = h.g.position; let dx = h.tgt.x - p.x, dz = h.tgt.z - p.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d; const gx = dx, gz = dz;
            for (const o of C.list) if (o !== h && o.level === 'ground') { const ox = p.x - o.g.position.x, oz = p.z - o.g.position.z, od = Math.hypot(ox, oz); if (od < 0.35 && od > 1e-4) { dx += ox / od * 1.5 * (0.35 - od) / 0.35; dz += oz / od * 1.5 * (0.35 - od) / 0.35; } }
            for (const [x, z, r] of circles()) { const ox = p.x - x, oz = p.z - z, od = Math.hypot(ox, oz), rr = r + 0.45; if (od >= rr || od < 1e-4) continue;
              const k = (rr - od) / 0.45, nx = ox / od, nz = oz / od, side = (gx * -nz + gz * nx) >= 0 ? 1 : -1;   // đích lệch phía nào thì vòng phía đó
              dx += nx * k * 2.2 - nz * side * k * 2.6; dz += nz * k * 2.2 + nx * side * k * 2.6; }
            const want = Math.atan2(dx, dz); let dy = Math.atan2(Math.sin(want - h.yaw), Math.cos(want - h.yaw)); h.yaw += Math.max(-turn * dt, Math.min(turn * dt, dy));
            h.v += (h.spd * Math.max(0, Math.cos(dy)) - h.v) * Math.min(1, dt * 5);
            let nx = p.x + Math.sin(h.yaw) * h.v * dt, nz = p.z + Math.cos(h.yaw) * h.v * dt;
            if (isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { h.v = 0; return true; }   // mép nước: coi như tới
            if (h.level === 'ground' && h.wing && h.v > 0.02) {   // mép bậc đất phía trước (nhìn trước 0,24 m ≈ nửa thân + 1 bước; xuống thì ra sát mép 0,12 m): nhảy — lên ≤ 0,95 m · xuống ≤ 2,2 m
              const fx = Math.sin(h.yaw), fz = Math.cos(h.yaw);
              for (let e = 0.06; e < 0.25; e += 0.06) { const g1 = cowY(p.x + fx * e, p.z + fz * e), d = g1 - h.gy; if (Math.abs(d) <= 0.12) continue;
                if (d < 0 && e > 0.13) break;
                const L = e + (d > 0 ? 0.14 : 0.2), lx = p.x + fx * L, lz = p.z + fz * L;   // chỗ đáp: qua mép đủ cả thân
                if (d > 0.95 || d < -2.2 || !free(lx, lz, 0.12) || Math.abs(cowY(lx, lz) - g1) > 0.05) { h.v = 0; return true; }   // cao quá / chỗ đáp không đứng được: coi như vật cản
                jumpStart(h, lx, lz, g1, 'step'); h.v = 0; return false;
              }
            }
            for (const [x, z, r] of circles()) { const ox = nx - x, oz = nz - z, od = Math.hypot(ox, oz), rr = r + 0.14; if (od < rr && od > 1e-4) { nx = x + ox / od * rr; nz = z + oz / od * rr; } }   // chặn cứng
            p.x = nx; p.z = nz; return d < 0.15;
          }
          // ---- đi theo lối định sẵn (cầu thang, trong chuồng, lên / xuống sào): quay xong mới bước, đi thẳng 0,16 m/s, độ cao nội suy (ván dốc), đoạn hop = nhảy vồng 0,4 s ----
          function startPath(h, pts, then) { h.path = pts; h.pi = 0; h.seg0.copy(h.g.position); h.segT = 0; h.st = 'path'; h.then = then; h.level = 'path'; }
          function followPath(h, dt) {
            const P = h.path[h.pi], p = h.g.position;
            if (P.hop) { h.segT += dt / 0.45; const u = Math.min(1, h.segT); p.lerpVectors(h.seg0, P.p, u); p.y += 0.12 * Math.sin(Math.PI * u); play(h, 'idle'); if (P.yaw !== undefined) h.yaw = P.yaw;
              const W = h.wing; if (W) { W.sT = 1; W.aT = 1; W.f = P.p.y < h.seg0.y ? 9.5 : 8.5; } h.tuck = Math.sin(Math.PI * u); h.pitchT = P.p.y > h.seg0.y ? -0.12 * (1 - u) : 0.1 * Math.sin(Math.PI * u); if (u > 0.8) { h.tuck = 0; h.ckT = 0.7; } }   // lên / xuống sào: vỗ cánh, co chân, nhún khi đáp
            else {
              const want = Math.atan2(P.p.x - h.seg0.x, P.p.z - h.seg0.z), dy = Math.atan2(Math.sin(want - h.yaw), Math.cos(want - h.yaw)); h.yaw += Math.max(-6 * dt, Math.min(6 * dt, dy));
              const L = Math.max(0.01, Math.hypot(P.p.x - h.seg0.x, P.p.z - h.seg0.z)), go = Math.abs(dy) < 0.6 ? 0.16 : 0;
              h.segT += dt * go / L; p.lerpVectors(h.seg0, P.p, Math.min(1, h.segT)); play(h, go ? 'walking' : 'idle', Math.max(0.35, go / (V_CLIP * h.g.scale.x)));
            }
            if (h.segT >= 1) { h.pi++; h.seg0.copy(p); h.segT = 0; if (h.pi >= h.path.length) { h.path = null; h.k = 0; h.then(h); } }
          }
          const intoCoop = h => [{ p: CO.rampTop }, { p: CO.entry }, { p: CO.perch[h.i].below }, { p: CO.perch[h.i].on, hop: true, yaw: CO.perch[h.i].yaw }];
          const outOfCoop = h => [{ p: CO.perch[h.i].below, hop: true }, { p: CO.entry }, { p: CO.rampTop }, { p: CO.rampFoot }];
          const toRoost = q => { q.level = 'perch'; q.st = 'sitDown'; q.k = 0; };
          function update(dt, t) {
            if (!C.ready) { CO.tick(dt); return; } dt = Math.min(dt, 0.05);
            const dp = C.dogP || (C.dogP = dogObj.position.clone()); C.dogV = Math.hypot(dogObj.position.x - dp.x, dogObj.position.z - dp.z) / Math.max(dt, 1e-3); dp.copy(dogObj.position);
            if (!(t < C.mownT)) { C.mownT = t + 30; C.mownK = !trimJob.busy() && meadow.cutFrac(HOME.x, HOME.z, 0, HOME_R) > 0.3; }   // cỏ quanh vùng kiếm ăn đã phát? (30 s kiểm 1 lần)
            const mown = !!C.mownK, hh = liveWeather.localHour, rain = liveWeather.state.raining, roost = roostTime(), nap = hh >= 12 && hh < 13.5 && !roost;
            const wet = sceneWet > 0.05 || footprints.soil > 0.3, ground = C.list.filter(h => h.level === 'ground');
            const cx = ground.reduce((s, h) => s + h.g.position.x, 0) / Math.max(1, ground.length), cz = ground.reduce((s, h) => s + h.g.position.z, 0) / Math.max(1, ground.length);
            const rampBusy = C.list.some(h => h.st === 'path' && h.pi < 2);   // đang có con trên ván / ở cửa
            CO.want = roost && C.list.every(h => h.st === 'roost') ? 0 : 1; CO.tick(dt);   // cả đàn lên sào ⇒ cửa hạ
            for (const h of C.list) {
              const p = h.g.position; h.k += dt;
              // ---- chọn việc theo giờ / thời tiết / mối đe doạ (chỉ khi đang ở dưới đất) ----
              if (h.jp) { /* đang nhảy: giữ việc cũ, nhảy xong làm tiếp */ }
              else if (h.level === 'ground') {
                const th = h.st === 'sit' || h.st === 'sitDown' ? null : threat(h);
                if (th && h.st !== 'flee') { const ax = p.x - th.x, az = p.z - th.z, ad = Math.hypot(ax, az) || 1, fd = trimKit.eng.on ? 3.5 + rnd() : 2.5 + rnd();
                  h.tgt.set(p.x + ax / ad * fd, 0, p.z + az / ad * fd); if (!free(h.tgt.x, h.tgt.z)) pick(h, p.x + ax / ad * fd, p.z + az / ad * fd, 0, 1.5);
                  h.st = 'flee'; h.k = 0; h.spd = 0.42 + 0.08 * rnd(); }
                else if (roost && !['flee', 'toCoop', 'queue', 'standUp'].includes(h.st)) { if (h.sit) { h.st = 'standUp'; h.k = 0; } else { h.st = 'toCoop'; h.k = 0; h.tgt.copy(CO.rampFoot); h.spd = 0.24; } }
                else if (!roost && rain && !['flee', 'toCover', 'cover', 'sitDown', 'sit', 'standUp'].includes(h.st)) { const q = nearestCover(h); h.tgt.set(q.x, 0, q.z); h.st = 'toCover'; h.k = 0; h.spd = 0.34; }
                else if (!roost && !rain && (h.st === 'cover' || (h.st === 'sit' && !nap))) { h.st = h.sit ? 'standUp' : 'look'; h.k = 0; h.dur = 1 + rnd(); }
              } else if (h.st === 'roost' && !roost) { h.wk = (h.wk || 0) + dt; if (h.wk > 4 * h.i + 1.5) { h.st = 'wake'; h.k = 0; h.wk = 0; } }   // sáng: cửa mở rồi từng con một (cách ~4 s)
              h.nextFlap -= dt; h.nextPlay -= dt;
              if (h.jp) jumpTick(h, dt);
              else switch (h.st) {
                case 'look': play(h, 'idle'); h.spd = 0; steer(h, dt, 0);
                  if (!rain && h.level === 'ground' && h.k > 0.4) {   // thỉnh thoảng: vỗ cánh rũ lông · chạy xổng rồi nhảy vỗ cánh (chơi — buổi sáng nhiều hơn)
                    if (h.nextFlap <= 0) { h.nextFlap = 180 + 240 * rnd(); h.st = 'flap'; h.k = 0; break; }
                    if (h.nextPlay <= 0) { h.nextPlay = (hh < 10 ? 150 : 300) + 360 * rnd(); h.st = 'frolic'; h.k = 0; h.yaw += (rnd() - 0.5) * 2.4; h.tgt.set(p.x + Math.sin(h.yaw) * 2, 0, p.z + Math.cos(h.yaw) * 2); h.spd = 0.55; break; }
                  }
                  if (h.k > h.dur) { h.k = 0; if (nap && !h.sit && rnd() < 0.5) { const q = CO.under[h.i]; h.tgt.set(q.x, 0, q.z); h.st = 'toCover'; h.spd = 0.16; h.napGo = 1; }
                    else if (forageNext(h, wet)) { /* cào / cúi nhìn rồi mổ */ } else { h.st = 'walk'; const far = Math.hypot(p.x - cx, p.z - cz) > 2.6 || Math.hypot(p.x - HOME.x, p.z - HOME.z) > HOME_R;
                    if (far) pick(h, (cx + HOME.x) / 2, (cz + HOME.z) / 2, 0, 1.0); else pick(h, p.x, p.z, 0.4, 1.6);
                    if (mown) for (let k = 0; k < 6 && meadow.cutFrac(h.tgt.x, h.tgt.z, 0, 0.45) < 0.5; k++) pick(h, p.x, p.z, 0.6, 2.8);   // cỏ vừa phát: ra chỗ đã cắt bới sâu bọ
                    h.spd = 0.12 + 0.1 * rnd(); } }
                  break;
                case 'peck': play(h, 'pecking', h.ts); h.spd = 0; steer(h, dt, 0);   // đúng 1–2 vòng hoạt cảnh = 1–2 cú mổ
                  if (h.k > h.dur) lookStart(h, ground.some(o => o !== h && o.st === 'look'));   // ngẩng nuốt mồi, canh chừng
                  break;
                case 'inspect': play(h, 'pecking', 0); if (h.k < 0.05) h.A.pecking.time = PECK_LOW; h.spd = 0; steer(h, dt, 0);   // cúi nhìn chỗ đất vừa bới (mỏ dừng nửa chừng)
                  if (h.k > h.dur) peckStart(h, 'inspect');
                  break;
                case 'scratch': play(h, 'idle', 0.5); h.spd = 0; steer(h, dt, 0);   // chân cào ở scratchLegs (sau bộ trộn)
                  if (h.k > h.dur) { h.st = 'back'; h.k = 0; h.kick = 0; }
                  break;
                case 'back': {   // lùi 1 bước (~7 cm) để nhìn chỗ vừa bới
                  play(h, 'walking', -0.55); const nx = p.x - Math.sin(h.yaw) * 0.16 * dt, nz = p.z - Math.cos(h.yaw) * 0.16 * dt; if (free(nx, nz, 0.15)) { p.x = nx; p.z = nz; }
                  if (h.k > 0.45) { h.st = 'inspect'; h.k = 0; h.dur = 0.4 + 0.4 * rnd(); }
                  break;
                }
                case 'walk': case 'flee': case 'toCover': case 'toCoop': {
                  const turn = h.st === 'flee' ? 8 : 3.5, done = steer(h, dt, turn); play(h, 'walking', Math.max(0.35, h.v / (V_CLIP * h.g.scale.x)));   // sải theo cỡ con
                  if (h.st === 'flee' && h.k < 1.0 && h.wing) { h.wing.sT = 0.65; h.wing.aT = 0.8; h.wing.f = 8; }   // giật mình chạy: vừa chạy vừa vỗ cánh
                  if (h.st === 'toCoop') { if (done || h.k > 40) { if (rampBusy) { h.st = 'queue'; h.k = 0; } else startPath(h, intoCoop(h), toRoost); } break; }
                  if (h.st === 'toCover') { if (done || h.k > 30) { h.k = 0; h.st = h.napGo || rnd() < 0.4 ? 'sitDown' : 'cover'; h.napGo = 0; } break; }
                  if (done || h.k > (h.st === 'flee' ? 6 : 14)) { if (h.st === 'flee') lookStart(h, true, 0.5); else if (!forageNext(h, wet)) lookStart(h, true); }   // tới chỗ mới: cào / cúi nhìn ngay, hoặc ngẩng ngó quanh
                  break;
                }
                case 'queue': { const q = h.k % 4; if (q < dt * 1.5) h.A.pecking.time = 0; play(h, q < PECK_T / 1.2 ? 'pecking' : 'idle', 1.2); } h.spd = 0; steer(h, dt, 0); if (!rampBusy && h.k > 0.8 * h.i) startPath(h, intoCoop(h), toRoost); break;   // chờ lượt (4 s mổ 1 cú) tới khi con trước lên xong
                case 'cover': play(h, 'idle', 0.7); h.spd = 0; steer(h, dt, 0); break;   // đứng xù lông dưới chỗ trú, chờ tạnh
                case 'flap': {   // vỗ cánh thoải mái: vươn người · dang cánh vỗ ~4 nhát · khép · rũ lông (lắc thân)
                  play(h, 'idle'); h.spd = 0; steer(h, dt, 0); const W = h.wing, k = h.k;
                  h.pitchT = -0.12 * Math.sin(Math.PI * Math.min(1, k / 1.0));   // vươn ngực
                  if (k > 0.12 && k < 0.9) { W.sT = 1; W.aT = 0.9; W.f = 6; }
                  h.roll = k > 1.0 && k < 1.45 ? 0.14 * Math.sin((k - 1.0) * TAU2 * 11) * Math.sin(Math.PI * (k - 1.0) / 0.45) : 0;
                  if (k > 1.6) { h.roll = 0; lookStart(h, true); }
                  break;
                }
                case 'frolic': {   // chạy xổng vài bước, vỗ cánh nửa chừng, rồi nhảy vồng vỗ cánh tại chỗ
                  const done = steer(h, dt, 6); play(h, 'walking', Math.max(0.35, h.v / (V_CLIP * h.g.scale.x))); const W = h.wing; W.sT = 0.55; W.aT = 0.6; W.f = 8;
                  if (h.k > 0.55 || done) { const fx = Math.sin(h.yaw), fz = Math.cos(h.yaw), x = p.x + fx * 0.28, z = p.z + fz * 0.28; if (free(x, z) && Math.abs(cowY(x, z) - h.gy) < 0.12) jumpStart(h, x, z, cowY(x, z), 'hop'); lookStart(h, true, 0.4); }
                  break;
                }
                case 'path': followPath(h, dt); break;
                case 'sitDown': play(h, 'sitting-down'); h.spd = 0; if (h.level === 'ground') steer(h, dt, 0); if (h.k > 1.15) { h.st = h.level === 'perch' ? 'roost' : 'sit'; h.sit = 1; h.k = 0; } break;
                case 'sit': play(h, 'sitting-idle', 0.6); if (nap && !rain && h.k > 300 + 400 * rnd()) { h.st = 'standUp'; h.k = 0; } break;
                case 'roost': play(h, 'sitting-idle', 0.4); break;
                case 'wake': play(h, 'standing-up'); if (h.k > 1.25) { h.sit = 0; startPath(h, outOfCoop(h), q => { q.level = 'ground'; q.gy = q.g.position.y; q.st = 'look'; q.dur = 1 + rnd(); }); } break;
                case 'standUp': play(h, 'standing-up'); if (h.k > 1.25) { h.st = 'look'; h.sit = 0; h.k = 0; h.dur = 1 + rnd(); } break;
              }
              // ---- hoà hoạt cảnh lặp · đặt thân (dưới đất: độ cao địa hình làm mượt — bậc voxel 0,6 m thành cú nhảy ngắn) ----
              const kw = Math.min(1, dt * 7);
              for (const n of LOOPS) { h.W[n] += ((h.anim === n ? 1 : 0) - h.W[n]) * kw; h.A[n].setEffectiveWeight(h.W[n]); }
              for (const n of ONCE) { h.W[n] += ((h.anim === n ? 1 : 0) - h.W[n]) * kw; h.A[n].setEffectiveWeight(h.W[n]); }
              h.mixer.update(dt);
              if (h.st === 'scratch' && !h.jp) scratchLegs(h);
              h.tuck *= h.jp || h.st === 'path' ? 1 : Math.max(0, 1 - dt * 8); legTuck(h, h.tuck); h.ck += (h.ckT - h.ck) * Math.min(1, dt * 14); h.ckT = 0; const dip = legCrouch(h, h.ck);
              if (h.level === 'ground' && !h.jp) { h.gy += (cowY(p.x, p.z) - h.gy) * Math.min(1, dt * 12); p.y = h.gy + dip; }
              else if (h.jp && h.jp.ph !== 'air') p.y = (h.jp.ph === 'land' ? h.jp.p1.y : h.jp.p0.y) + dip;   // đứng mép / nhún / đáp: hạ thân đúng bằng chân gập
              else if (h.st === 'path') p.y += dip;
              h.pitch += (h.pitchT - h.pitch) * Math.min(1, dt * 10); h.pitchT = 0; if (h.st !== 'flap') h.roll *= Math.max(0, 1 - dt * 10);
              h.g.rotation.set(h.pitch, h.yaw, h.roll); wingTick(h, dt);
            }
          }
          return Object.assign(C, { update(dt, t) { update(dt, t); if (C.ready) dirtTick(Math.min(dt, 0.05)); }, roostTime });
        })();
