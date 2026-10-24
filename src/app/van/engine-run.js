        // ===== ĐỘNG CƠ CHẠY (G 18/10 "khi click vào engine thì engine running animation, 75% engine transparent để nhìn thấy v6 engine"; sau đó "click to the engine show
        //  the button start engine"): bấm động cơ (đang thấy: xem xuyên / ca-pô mở) → bảng "▶ Khởi động máy" → kỹ sư mở ca-pô, kiểm tra, nổ máy 30 s
        //  (engineer/tasks/engine-check.js gọi engineToggle) → vỏ máy (mẫu GLB) mờ còn 25% để thấy CƠ CẤU BÊN TRONG dựng bằng code theo số đo
        //  mẫu: V6 60° — mỗi hàng 3 xi-lanh (đúng 3 cổ xả / bugi mỗi bên của mẫu); nắp xupap đo ở x ±0,15 y 0,52 ⇒ trục khuỷu y 0,18, hàng xi-lanh ±30° so với
        //  phương đứng. Trục khuỷu 6 chốt lệch nhau 60° (split-pin của V6 60° nổ đều): chốt ψ = β − θnổ ⇒ thứ tự nổ 1-2-3-4-5-6 cách 120°; tay biên + piston theo
        //  động học tay quay – thanh truyền s = r cos a + √(l² − r² sin² a) (r 43 mm · l 150 mm · lỗ 90 mm); 2 trục cam trên nắp quay ½ vòng tua, 12 xupap mở theo
        //  kỳ (xả 170–370° · nạp 350–550° của chu kỳ 720°); bánh đà + puli trước quay theo trục khuỷu; chớp lửa ở buồng đốt đúng kỳ nổ. Quay chậm ~3 vòng/s để mắt
        //  theo kịp; đề máy: quay đề 1,4 vòng/s → nổ → vọt 5 vòng/s → về 3 vòng/s; máy rung theo nhịp nổ. Tắt máy: giảm dần, vỏ máy đục lại.
        //  Toạ độ = toạ độ mẫu (m, Y lên, đầu máy +Z, gốc giữa đáy cacte) — con của nhóm mẫu nên theo đúng góc / tỉ lệ đặt trong khoang ----
        const ENGR = { on: false, k: 0, th: 0, w: 0, t0: 0, parts: null, base: null, autoX: false };
        const ENG_V = { yc: 0.18, r: 0.043, l: 0.15, hc: 0.03, bore: 0.045, cyl: [[-30, 0.045], [30, 0.015], [-30, -0.075], [30, -0.105], [-30, -0.195], [30, -0.225]] };   // [β°, z] xi-lanh 1…6 (lẻ hàng trái)
        function engineParts() {
          const V = ENG_V, g = new THREE.Group(); g.name = 'Cơ cấu trong động cơ V6 (dựng bằng code)'; g.visible = false;
          const L = c => new THREE.MeshLambertMaterial({ color: c }), mPis = L(0xc9cdd0), mRod = L(0x8a8f93), mCr = L(0x6e7378), mVal = L(0xb8bcc0), mFw = L(0x5a5f63);
          const mLin = new THREE.MeshLambertMaterial({ color: 0xd8dcdf, transparent: true, opacity: 0.22, depthWrite: false });
          const mFire = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
          const cyl = V.cyl.map(([b, z], k) => { const a = b * Math.PI / 180, thF = 120 * k; return { b: a, z, u: new THREE.Vector3(Math.sin(a), Math.cos(a), 0), psi: (b - thF) * Math.PI / 180, f: thF * Math.PI / 180 }; });
          // trục khuỷu: cổ trục + 6 chốt + má khuỷu + đối trọng, quay quanh trục z qua (0, yc)
          const crank = new THREE.Group(); crank.position.set(0, V.yc, 0); g.add(crank);
          const main = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.56, 14), mCr); main.rotation.x = Math.PI / 2; main.position.z = -0.06; crank.add(main);
          for (const c of cyl) {
            const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.034, 12), mCr); pin.rotation.x = Math.PI / 2; pin.position.set(V.r * Math.sin(c.psi), V.r * Math.cos(c.psi), c.z); crank.add(pin);
            for (const dz of [-0.022, 0.022]) { const web = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.11, 0.012), mCr); web.position.set(0.5 * V.r * Math.sin(c.psi) - 0.012 * Math.sin(c.psi), 0.5 * V.r * Math.cos(c.psi) - 0.012 * Math.cos(c.psi), c.z + dz); web.rotation.z = -c.psi; crank.add(web); }
          }
          const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.024, 28), mFw); fly.rotation.x = Math.PI / 2; fly.position.z = -0.33; crank.add(fly);
          const bal = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.04, 22), mFw); bal.rotation.x = Math.PI / 2; bal.position.z = 0.2; crank.add(bal);
          for (const m of [fly, bal]) { const mark = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.03), mVal); mark.position.set(0, m === fly ? 0.1 : 0.05, m.position.z); crank.add(mark); }   // vạch trên bánh đà / puli: thấy quay
          // xi-lanh (ống lót mờ, tĩnh) · piston · tay biên · lửa nổ · xupap: InstancedMesh (6 · 6 · 6 · 6 · 12)
          const lin = new THREE.InstancedMesh(new THREE.CylinderGeometry(V.bore + 0.003, V.bore + 0.003, 0.13, 18, 1, true), mLin, 6);
          const pis = new THREE.InstancedMesh(new THREE.CylinderGeometry(V.bore, V.bore, 0.055, 18), mPis, 6), rod = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 1, 0.016), mRod, 6);
          const fire = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 12, 8), mFire, 6), val = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), mVal, 12);
          const q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), M4 = new THREE.Matrix4(), S1 = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
          cyl.forEach((c, k) => { q.setFromUnitVectors(Y, c.u); p.set(0, V.yc, c.z).addScaledVector(c.u, V.r + V.l + 0.01); lin.setMatrixAt(k, M4.compose(p, q, S1)); });
          lin.instanceMatrix.needsUpdate = true; for (const m of [lin, pis, rod, fire, val]) { m.frustumCulled = false; g.add(m); }
          // 2 trục cam (1 / hàng) trên nắp máy, quay ½ tốc độ trục khuỷu
          const cams = [-30, 30].map(b => { const a = b * Math.PI / 180, cg = new THREE.Group(), d = V.r + V.l + V.hc + 0.16; cg.position.set(Math.sin(a) * d, V.yc + Math.cos(a) * d, 0); g.add(cg);
            const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), mCr); sh.rotation.x = Math.PI / 2; sh.position.z = -0.09; cg.add(sh);
            for (const c of cyl) if (Math.sign(c.b) === Math.sign(a)) for (const dz of [-0.016, 0.016]) { const lobe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.018, 0.012), mCr); lobe.position.set(0.006, 0, c.z + dz); cg.add(lobe); }
            return cg; });
          return { g, crank, cyl, lin, pis, rod, fire, val, cams, q, Y, M4, S1, p, mFire };
        }
        // máy đang thấy được: xem xuyên hoặc ca-pô mở > 17° (rê chuột có viền — ui/hover-select.js; bấm ra bảng "Khởi động máy" — bảng dụng cụ ở ui/xray-lifecycle.js)
        const engineSeen = () => !!vanGlb.engine && (caravanXray || VPART.parts.some(P => P.kind === 'hood' && P.a > 0.3));
        function engineClick(hits) {   // G 18/10 "click to the engine show the button start engine": tia chạm động cơ (đang thấy) trước đồ nội thất ⇒ chặn bật/tắt xem xuyên
          const E = vanGlb.engine; if (!E || !engineSeen()) return false;
          for (const h of hits) {
            let inEng = false; for (let o = h.object; o; o = o.parent) if (o === E) { inEng = true; break; }
            if (inEng) return true;
            if (h.object.isLine || h.object.isLineSegments || h.object.userData.pickSkip || caravanRole(h.object) === 'shell') continue;
            return false;
          }
          return false;
        }
        function engineToggle(on = !ENGR.on, noX = false) {   // đề máy ⇒ tự xem xuyên (vỏ 25% + nét viền) để thấy máy — trừ khi ca-pô đã mở (noX: kỹ sư nổ máy khi kiểm tra)
          ENGR.on = on; if (on && !ENGR.parts && vanGlb.engineSrc) { ENGR.parts = engineParts(); vanGlb.engineSrc.add(ENGR.parts.g); ENGR.base = vanGlb.engine.position.clone(); }
          if (on) { ENGR.t0 = 0; ENGR.autoX = !noX && !caravanXray; if (ENGR.autoX) setCaravanXray(true); } else if (ENGR.autoX) { ENGR.autoX = false; setCaravanXray(false); }
        }
        function engineTick(dt, t) {
          const P = ENGR.parts; if (!P) return;
          ENGR.k += ((ENGR.on ? 1 : 0) - ENGR.k) * Math.min(1, dt * 3); const k = ENGR.k;
          const mat = vanGlb.engineMat; if (mat) { const tr = k > 0.01; if (mat.transparent !== tr) { mat.transparent = tr; mat.needsUpdate = true; } mat.opacity = 1 - 0.75 * k; mat.depthWrite = k < 0.5; }
          P.g.visible = k > 0.01; if (!P.g.visible) { vanGlb.engine.position.copy(ENGR.base); return; }
          // tốc độ: đề 1,4 vòng/s (0,9 s) → nổ, vọt 5 vòng/s → về 3 vòng/s · tắt: giảm dần về 0
          if (ENGR.on) { ENGR.t0 += dt; const tt = ENGR.t0, want = tt < 0.9 ? 1.4 : tt < 1.6 ? 5 : 3; ENGR.w += (want * 6.2832 - ENGR.w) * Math.min(1, dt * (tt < 0.9 ? 6 : 2.5)); }
          else ENGR.w *= Math.exp(-dt * 2.2);
          ENGR.th += ENGR.w * dt; const th = ENGR.th, V = ENG_V, { q, Y, M4, S1, p } = P, fired = ENGR.on && ENGR.t0 >= 0.9;
          P.crank.rotation.z = -th;   // chiều quay: chốt đi từ +y sang +x (khớp công thức góc chốt θ + ψ đo từ phương đứng)
          for (const cg of P.cams) cg.rotation.z = -th / 2;
          const pin = new THREE.Vector3(), pp = new THREE.Vector3(), d = new THREE.Vector3(), sc = new THREE.Vector3();
          P.cyl.forEach((c, k2) => {
            const ang = th + c.psi, a = ang - c.b;
            pin.set(V.r * Math.sin(ang), V.yc + V.r * Math.cos(ang), c.z);
            const s = V.r * Math.cos(a) + Math.sqrt(V.l * V.l - V.r * V.r * Math.sin(a) ** 2);
            pp.set(0, V.yc, c.z).addScaledVector(c.u, s);   // chốt piston
            q.setFromUnitVectors(Y, c.u); p.copy(pp).addScaledVector(c.u, V.hc); P.pis.setMatrixAt(k2, M4.compose(p, q, S1));
            d.subVectors(pp, pin); const len = d.length(); q.setFromUnitVectors(Y, d.normalize()); p.addVectors(pin, pp).multiplyScalar(0.5); sc.set(1, len, 1); P.rod.setMatrixAt(k2, M4.compose(p, q, sc));
            const cyc = (((th - c.f) % 12.566) + 12.566) % 12.566 * 57.2958;   // chu kỳ 720°: 0 = điểm chết trên kỳ nổ
            const fl = fired && cyc < 55 ? 1 - cyc / 55 : 0; q.setFromUnitVectors(Y, c.u); p.set(0, V.yc, c.z).addScaledVector(c.u, V.r + V.l + V.hc + 0.035); sc.setScalar(0.4 + 0.8 * fl); P.fire.setMatrixAt(k2, M4.compose(p, q, sc));
            [[170, 370], [350, 550]].forEach(([o, cl], j) => { const lift = cyc > o && cyc < cl ? 0.011 * Math.sin(Math.PI * (cyc - o) / (cl - o)) : 0;
              p.set(0, V.yc, c.z + (j ? 0.016 : -0.016)).addScaledVector(c.u, V.r + V.l + V.hc + 0.09 - lift); P.val.setMatrixAt(k2 * 2 + j, M4.compose(p, q, S1)); });
          });
          for (const m of [P.pis, P.rod, P.fire, P.val]) m.instanceMatrix.needsUpdate = true;
          P.mFire.opacity = 0.85 * k;
          // máy rung theo nhịp nổ (3 lần / vòng của V6) + lắc nhẹ quanh trục khuỷu — đơn vị xe
          const rev = ENGR.w / 6.2832, amp = (fired ? 0.0018 : 0.0008) * k * Math.min(1, rev / 2);
          vanGlb.engine.position.set(ENGR.base.x + amp * Math.sin(th * 3), ENGR.base.y + amp * 0.6 * Math.sin(th * 3 + 1.3), ENGR.base.z + amp * 0.5 * Math.sin(th * 1.5));
        }
