        // ===== CỬA TRƯỚC + CA-PÔ MỞ BẰNG NÚT (G 18/10 "các điểm này là các nút, khi hover over thì white border outline, khi click vào cửa thì cửa mở, khi click
        //  vào logo ford thì nắp capo mở, tất cả rất nhịp nhàng"). Nút = tay nắm ngoài 2 cửa trước + logo Ford ở ga-lăng: nhóm bộ phận tách sẵn trong transit.bin
        //  (src/tools/transit: nút bản lề extras.pivot, nút bấm extras.btn), dựng ở van/body/transit-glb.js. Rê chuột + bấm qua bộ chọn chung ui/hover-select.js (viền trắng
        //  3 px, con trỏ bàn tay, vùng bấm rộng hơn nút 3 cm, bỏ nút quay lưng camera; logo chỉ viền ô xanh + chữ mạ — đế đen khuất sau nan ga-lăng làm viền phình).
        //  Bấm tay nắm: tay nắm bật ra 7 mm → cửa mở 66° (lò xo hơi dư như dây hãm cửa, ~0,9 s) · bấm lại: cửa khép, chạm khung nảy nhẹ rồi nằm. Bấm logo: logo lún
        //  4 mm → ca-pô bật chốt ~3° → nâng lên 52° (lò xo êm như ty chống, ~1,3 s) · bấm lại: hạ, chạm, nảy rồi nằm (kỹ sư đang kiểm tra máy thì logo không nhận —
        //  engineer/tasks/engine-check.js). Ca-pô mở ⇒ thấy máy V6: rê lên máy có viền, bấm ra bảng "Khởi động máy". Mỗi khung: vanPartsTick (loop/main-loop-rest.js) ----
        const VPART = { parts: [], btns: [], hoodBtn: null, led: null };
        const VP_OPEN = { door: 66 * Math.PI / 180, hood: 52 * Math.PI / 180 };
        const VP_NAME = { FrontDoorR: 'Cửa lái (cửa trước phải)', FrontDoorL: 'Cửa phụ (cửa trước trái)', Hood: 'Ca-pô', HandleR: 'Tay nắm cửa lái', HandleL: 'Tay nắm cửa phụ', Logo: 'Logo Ford (bấm mở ca-pô)' };
        function vanPartsInit(groups) {
          const byName = {}; for (const G of groups) byName[G.name] = G;
          for (const G of groups) { const u = G.userData.glb || {}; if (u.pivot) VPART.parts.push(G.userData.vp = { g: G, kind: u.pivot, side: Math.sign(G.position.z) || 1, a: 0, v: 0, tgt: 0, w: 6, z: 1, open: false, t: 0, seq: [] }); }
          for (const G of groups) {
            const u = G.userData.glb || {}, P = u.btn && byName[u.btn] && byName[u.btn].userData.vp; if (!P) continue;
            const hood = P.kind === 'hood', B = { g: G, part: P, push: new THREE.Vector3(hood ? 0.004 : 0, 0, hood ? 0 : 0.007 * P.side), tp: 9 };
            VPART.btns.push(B); if (hood) VPART.hoodBtn = B;
            const n = new THREE.Vector3(hood ? -1 : 0, 0, hood ? 0 : P.side);   // G 18/10: rê lên CẢ cánh cửa ⇒ viền tay nắm · rê lên nắp ca-pô (đang đóng) ⇒ viền logo + LED trước sáng
            hovAdd(G, { pad: 0.03, skip: hood ? m => m.name === 'Transit · black' : null, led: hood, tag: true, click: () => { if (!(hood && engineJob.busy())) vanPartToggle(B); },
              picks: [{ n }, { o: P.g, n: hood ? new THREE.Vector3(-0.5, 0.85, 0).normalize() : n, on: hood ? () => P.a < 0.05 : null }] });
          }
          for (const G of groups) G.name = VP_NAME[G.name] || G.name;
        }
        function vanPartToggle(B, open = !B.part.open) {
          const P = B.part; P.open = open; P.t = 0; P.seq = [];
          if (open) { B.tp = 0;   // tay nắm bật ra / logo lún xuống trước, rồi bộ phận mới chuyển động
            if (P.kind === 'door') P.seq = [{ at: 0.12, set: { tgt: VP_OPEN.door, w: 5.2, z: 0.72 } }];
            else P.seq = [{ at: 0.1, set: { tgt: 0.055, w: 15, z: 0.55 } }, { at: 0.48, set: { tgt: VP_OPEN.hood, w: 3.5, z: 0.92 } }];   // bật chốt → nâng
          } else Object.assign(P, P.kind === 'door' ? { tgt: -0.15, w: 6.4, z: 0.9 } : { tgt: -0.12, w: 4.6, z: 0.85 });   // đích lố vào trong khung ⇒ chạm khung còn đà, nảy nhẹ
        }
        function vanPartsTick(dt) {
          if (!VPART.parts.length) return;
          dt = Math.min(dt, 0.05);
          for (const P of VPART.parts) {
            P.t += dt; while (P.seq.length && P.t >= P.seq[0].at) Object.assign(P, P.seq.shift().set);
            for (let s = 0, n = Math.ceil(dt * 240); s < n; s++) { const h = dt / n;   // lò xo tắt dần: a'' = w²(đích − a) − 2zw·a'
              P.v += (P.w * P.w * (P.tgt - P.a) - 2 * P.z * P.w * P.v) * h; P.a += P.v * h;
              if (P.a < 0) { P.a = 0; P.v = P.v < -0.3 ? -0.22 * P.v : 0; if (!P.open) Object.assign(P, { tgt: 0, w: 9, z: 1 }); }   // chạm khung: nảy 22% rồi nằm êm
            }
            if (P.kind === 'door') P.g.rotation.y = -P.side * P.a; else P.g.rotation.z = -P.a;   // cửa: mép sau ra ngoài · ca-pô: mép trước lên
            if (Math.abs(P.v) > 1e-4 || P.seq.length) HOV.moved = true;   // bộ phận đang chạy: dò lại vật dưới con trỏ
          }
          for (const B of VPART.btns) { if (B.tp > 0.32) continue; B.tp += dt; B.g.position.copy(B.push).multiplyScalar(B.tp < 0.32 ? Math.sin(Math.PI * B.tp / 0.32) : 0); }
          const L = VPART.led; if (L) {   // LED trước: xám (tắt) → trắng sáng + quầng khi rê chuột lên ca-pô / logo
            L.k += ((HOV.hover && HOV.hover.led ? 1 : 0) - L.k) * Math.min(1, dt * 7);
            L.mat.color.copy(L.off).lerp(L.on, L.k); L.sm.opacity = 0.45 * L.k; for (const s of L.halos) s.visible = L.k > 0.01; }   // quầng dùng chung 1 vật liệu
        }
