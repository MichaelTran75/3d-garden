        // ===== HÌNH ĐỘNG CƠ NỔI TRÊN ĐẦU KỸ SƯ (G 22/10 "khi kỹ sư đang sửa máy xe van thì trên đầu kỹ sư hiện ra 3D của engine, to gấp 3 lần, sau đó engine tự
        //  breakdown thành những species (bộ phận), engineer analyze") =====
        //  Bản sao động cơ (mẫu GLB "Nelson Racing Engine B") × 3 cỡ thật trong khoang, nổi trên đầu, hơi về phía xe, màu đỉnh + ánh xanh hologram, chiếu lên từ bảng
        //  ghi chép (tia sáng nón). Mẫu là 1 lưới quét liền khối ⇒ tách theo VÙNG của V6 60° tăng áp kép (toạ độ mẫu: m, Y lên, đầu máy +Z, gốc giữa đáy cacte;
        //  nắp xupap x ±0,15 y 0,52 — van/engine-run.js): đầu máy (puli, dây curoa) z > 0,22 · cacte y < 0,14 · turbo + cổ xả 2 bên |x| > 0,3 · cổ hút y > 0,56
        //  |x| < 0,12 · nắp máy 2 bên y > 0,38 · còn lại là thân máy; mỗi khối 1 lưới dùng chung bộ đỉnh (chỉ khác chỉ mục). Thêm cơ cấu trong dựng bằng code theo
        //  số đo ENG_V: trục khuỷu + bánh đà + puli · 6 piston + tay biên (giữa hành trình) · 2 trục cam · 12 xupap.
        //  Diễn (engineer/engine-check.js pha 'holo', ~26 s): hiện dần + quay bàn xoay 3 s → TÁCH RỜI (exploded view) 3 s: mỗi khối bay ra theo hướng lắp ráp → lần
        //  lượt soi từng bộ phận (sáng lên + nhãn tên, kỹ sư nhìn theo, giơ tay chỉ, nảy 1 ý nhận xét) → lắp lại 3 s → tắt dần ----
        const engHolo = (() => {
          const H = { g: null, parts: [], beam: null, t: 0, on: false, a: 0, cur: -1, base: new THREE.Vector3(), yaw: 0, done: false, said: -1 };
          const CYAN = new THREE.Color(0x46c8ff), TINT = new THREE.Color(0x9fd6ff), WHITE = new THREE.Color(0xffffff), UP = new THREE.Vector3(0, 1, 0), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
          const T_IN = 3, T_EX = 3, T_PART = 2.2, T_BACK = 3, T_OUT = 1.2;
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const back = x => { x = Math.max(0, Math.min(1, x)); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };   // vọt nhẹ rồi về (bay ra có đà)
          function label(text) {   // nhãn tên bộ phận: chữ trắng trên nền xanh đậm mờ, viền xanh hologram
            const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
            x.fillStyle = 'rgba(8,30,48,0.82)'; x.strokeStyle = 'rgba(120,220,255,0.95)'; x.lineWidth = 4; x.beginPath(); x.roundRect(4, 4, 504, 88, 18); x.fill(); x.stroke();
            x.font = '600 44px Outfit, "Helvetica Neue", Arial, sans-serif'; x.fillStyle = '#eaf8ff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 50);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); s.renderOrder = 12; s.scale.set(0.64, 0.12, 1); return s;   // G 22/10: nhỏ lại 20% (0,8 × 0,15 → 0,64 × 0,12)
          }
          function holoMat(o = {}) { return new THREE.MeshLambertMaterial({ transparent: true, opacity: 0, emissive: CYAN, emissiveIntensity: 0.15, ...o }); }
          function build() {
            const src = vanGlb.engineSrc; let mesh = null; src.traverse(o => { if (o.isMesh && !mesh && o.geometry.attributes.position.count > 1000) mesh = o; }); if (!mesh) return false;
            const G = mesh.geometry, P = G.attributes.position, I = G.index, M = new THREE.Matrix4().copy(src.matrixWorld).invert().multiply(mesh.matrixWorld);   // lưới → hệ mẫu
            const g = new THREE.Group(); g.name = 'Hình động cơ nổi (hologram)'; g.visible = false; g.userData.noBatch = g.userData.noBake = true; scene.add(g);
            // ---- vỏ máy: phân tam giác theo vùng (tâm tam giác trong hệ mẫu) ----
            const DEF = [   // khoá · nhãn · hướng tách (m, hệ mẫu)
              ['front', 'Puli + dây curoa', [0, 0.04, 0.42]], ['pan', 'Cacte dầu', [0, -0.26, 0]], ['turboL', 'Turbo + cổ xả trái', [-0.42, 0.06, 0]], ['turboR', 'Turbo + cổ xả phải', [0.42, 0.06, 0]],
              ['intake', 'Cổ hút + bướm ga', [0, 0.46, 0]], ['headL', 'Nắp máy trái', [-0.2, 0.3, 0]], ['headR', 'Nắp máy phải', [0.2, 0.3, 0]], ['block', 'Thân máy (block)', [0, 0, 0]]];
            const sets = Object.fromEntries(DEF.map(d => [d[0], []])), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
            for (let t = 0; t < I.count; t += 3) {
              a.fromBufferAttribute(P, I.getX(t)).applyMatrix4(M); b.fromBufferAttribute(P, I.getX(t + 1)).applyMatrix4(M); c.fromBufferAttribute(P, I.getX(t + 2)).applyMatrix4(M); a.add(b).add(c).multiplyScalar(1 / 3);
              const k = a.z > 0.22 ? 'front' : a.y < 0.14 ? 'pan' : Math.abs(a.x) > 0.3 ? (a.x < 0 ? 'turboL' : 'turboR') : a.y > 0.56 && Math.abs(a.x) < 0.12 ? 'intake' : a.y > 0.38 && Math.abs(a.x) > 0.06 ? (a.x < 0 ? 'headL' : 'headR') : 'block';
              sets[k].push(I.getX(t), I.getX(t + 1), I.getX(t + 2));
            }
            for (const [k, name, off] of DEF) {
              if (!sets[k].length) continue;
              const geo = new THREE.BufferGeometry(); for (const n in G.attributes) geo.setAttribute(n, G.attributes[n]); geo.setIndex(sets[k]); geo.computeBoundingSphere();   // dùng chung bộ đỉnh
              const pg = new THREE.Group(), m = new THREE.Mesh(geo, holoMat({ vertexColors: true, color: TINT })); m.matrixAutoUpdate = false; m.matrix.copy(M); pg.add(m); g.add(pg);
              const ctr = geo.boundingSphere.center.clone().applyMatrix4(M);
              H.parts.push({ k, name, g: pg, mats: [m.material], off: new THREE.Vector3(...off), ctr, lab: label(name) });
            }
            // ---- cơ cấu trong (số đo ENG_V — van/engine-run.js) ----
            const V = ENG_V, mk = (k, name, off, build) => { const pg = new THREE.Group(), mats = []; build(pg, col => { const m = holoMat({ color: col }); mats.push(m); return m; }); g.add(pg);
              const bs = new THREE.Box3().setFromObject(pg).getCenter(new THREE.Vector3()); H.parts.push({ k, name, g: pg, mats, off: new THREE.Vector3(...off), ctr: bs, lab: label(name) }); };
            mk('crank', 'Trục khuỷu + bánh đà', [0, -0.13, 0], (pg, L) => { const mc = L(0x9aa3aa), mw = L(0x7a8288);
              const main = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.56, 14), mc); main.rotation.x = Math.PI / 2; main.position.set(0, V.yc, -0.06); pg.add(main);
              for (const [b0, z] of V.cyl) { const ps = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.034, 12), mc), a0 = (b0 - 120 * V.cyl.findIndex(q => q[1] === z)) * Math.PI / 180; ps.rotation.x = Math.PI / 2; ps.position.set(V.r * Math.sin(a0), V.yc + V.r * Math.cos(a0), z); pg.add(ps); }
              for (const [z, r] of [[-0.33, 0.13], [0.2, 0.075]]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.024, 28), mw); d.rotation.x = Math.PI / 2; d.position.set(0, V.yc, z); pg.add(d); } });
            mk('pistons', 'Piston + tay biên ×6', [0, 0.22, 0], (pg, L) => { const mp = L(0xd8dde0), mr = L(0xa3a9ad);
              for (const [b0, z] of V.cyl) { const u = new THREE.Vector3(Math.sin(b0 * Math.PI / 180), Math.cos(b0 * Math.PI / 180), 0), s = V.l + 0.01;
                const pis = new THREE.Mesh(new THREE.CylinderGeometry(V.bore, V.bore, 0.055, 18), mp); pis.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), u); pis.position.set(0, V.yc, z).addScaledVector(u, s + V.hc); pg.add(pis);
                const rod = new THREE.Mesh(new THREE.BoxGeometry(0.022, V.l, 0.016), mr); rod.quaternion.copy(pis.quaternion); rod.position.set(0, V.yc, z).addScaledVector(u, s * 0.5); pg.add(rod); } });
            mk('cams', 'Trục cam + xupap', [0, 0.62, 0], (pg, L) => { const mc = L(0x9aa3aa), mv = L(0xc9cdd0);
              for (const b0 of [-30, 30]) { const a0 = b0 * Math.PI / 180, d = V.r + V.l + V.hc + 0.16, sh = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), mc); sh.rotation.x = Math.PI / 2; sh.position.set(Math.sin(a0) * d, V.yc + Math.cos(a0) * d, -0.09); pg.add(sh);
                for (const [b1, z] of V.cyl) if (Math.sign(b1) === Math.sign(b0)) for (const dz of [-0.016, 0.016]) { const u = new THREE.Vector3(Math.sin(a0), Math.cos(a0), 0), v = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), mv); v.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), u); v.position.set(0, V.yc, z + dz).addScaledVector(u, V.r + V.l + V.hc + 0.09); pg.add(v); } } });
            for (const p of H.parts) { p.lab.position.copy(p.ctr).add(p.off).addScaledVector(_a.copy(p.off).setY(0).normalize(), 0.12).setY(p.ctr.y + p.off.y + 0.16); g.add(p.lab); }
            // ---- đường trục lắp ráp: từ tâm bộ phận ở chỗ lắp tới chỗ đang tách ra (như bản vẽ exploded view) ----
            H.lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(H.parts.length * 6), 3)), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0, depthWrite: false }));
            H.lines.frustumCulled = false; g.add(H.lines);
            // ---- tia chiếu nón từ bảng ghi chép lên đáy hình (cộng màu) ----
            const bm = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
            H.beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.04, 1, 24, 1, true), bm); H.beam.name = 'Tia chiếu hologram động cơ'; H.beam.visible = false; H.beam.userData.noBatch = true; scene.add(H.beam);
            H.g = g; H.order = ['turboL', 'headL', 'intake', 'cams', 'headR', 'turboR', 'front', 'pistons', 'crank', 'block', 'pan'].map(k => H.parts.findIndex(p => p.k === k)).filter(i => i >= 0);
            return true;
          }
          const dur = () => T_IN + T_EX + H.order.length * T_PART + T_BACK + T_OUT;
          function start(e) {   // gọi 1 lần khi vào pha 'holo': đặt hình trên đầu, hơi về phía xe; trục dài của máy nằm ngang tầm nhìn
            if (!H.g && !build()) return false;
            const S = caravanObj.scale.x * ENG_AT.s * 3, hd = e.head.getWorldPosition(_a), y = e.g.rotation.y;
            H.yaw = y + Math.PI / 2; H.base.set(hd.x + Math.sin(y) * 0.2, hd.y + 0.75, hd.z + Math.cos(y) * 0.2);
            H.g.scale.setScalar(S); H.g.position.copy(H.base); H.g.rotation.set(0, H.yaw, 0); H.t = 0; H.on = true; H.done = false; H.cur = -1; H.said = -1; H.g.visible = true;
            return true;
          }
          function stop() { H.on = false; if (H.g) H.g.visible = false; if (H.beam) H.beam.visible = false; }
          function tick(e, dt, t) {   // → { look: điểm nhìn, point: điểm chỉ tay | null, beam: true khi đang chiếu } ; H.done khi diễn xong
            if (!H.on) return null; H.t += dt; const u = H.t, D = dur();
            const tEx = T_IN, tAn = T_IN + T_EX, tBk = tAn + H.order.length * T_PART, tOut = tBk + T_BACK;
            const fade = u < tEx ? ease(u / 1.2) : u > tOut ? 1 - ease((u - tOut) / T_OUT) : 1, xk = u < tEx ? 0 : u < tAn ? back((u - tEx) / T_EX) : u < tBk ? 1 : 1 - ease((u - tBk) / T_BACK);
            H.cur = u >= tAn && u < tBk ? H.order[Math.floor((u - tAn) / T_PART)] : -1;
            // bàn xoay: quay chậm lúc hiện, rồi dừng ở góc ¾ cho dễ nhìn lúc tách
            const spin = u < tEx ? 1.1 * (1 - u / tEx) * u : 1.1 * tEx / 2; H.g.rotation.y = H.yaw - 0.5 + spin + 0.04 * Math.sin(t * 0.6);
            H.g.position.copy(H.base).setY(H.base.y + 0.04 * Math.sin(t * 1.3) + 0.25 * (1 - fade));   // lơ lửng nhấp nhô; hiện lên từ thấp
            for (const [i, p] of H.parts.entries()) {
              const hi = i === H.cur ? 1 : 0, dim = H.cur >= 0 && !hi ? 0.55 : 1;
              p.g.position.copy(p.off).multiplyScalar(xk); p.g.scale.setScalar(1 + 0.08 * hi * (0.6 + 0.4 * Math.sin(t * 9))); p.g.rotation.y = 0.15 * xk * Math.sign(p.off.x || p.off.z || 1) * (p.k === 'block' ? 0 : 1);   // bộ phận đang soi: phồng nhẹ theo nhịp sáng
              for (const m of p.mats) { m.opacity = fade * (0.85 * dim + 0.15 * hi); m.emissiveIntensity = 0.15 + 0.95 * hi * (0.7 + 0.3 * Math.sin(t * 9)); if (m.vertexColors) m.color.copy(hi ? WHITE : TINT); }
              p.lab.material.opacity = fade * (hi ? 1 : H.cur < 0 && xk > 0.95 && u < tAn + 0.8 ? 0.85 : 0);   // tách xong: hiện hết nhãn thoáng qua, rồi chỉ nhãn bộ phận đang soi
            }
            { const A = H.lines.geometry.attributes.position; H.parts.forEach((p, i) => { A.setXYZ(i * 2, p.ctr.x, p.ctr.y, p.ctr.z); A.setXYZ(i * 2 + 1, p.ctr.x + p.off.x * xk, p.ctr.y + p.off.y * xk, p.ctr.z + p.off.z * xk); }); A.needsUpdate = true; H.lines.material.opacity = 0.55 * fade * Math.min(1, xk * 1.5); }
            // tia chiếu: từ bảng ghi chép (tay trái) lên đáy hình
            const B = H.beam, clip = e.clip && e.clip.visible ? e.clip.getWorldPosition(_b) : e.wrists[1].getWorldPosition(_b), top = _c.copy(H.g.position).setY(H.g.position.y + 0.05);
            const L = clip.distanceTo(top); B.visible = fade > 0.02; B.position.copy(clip).add(top).multiplyScalar(0.5); B.quaternion.setFromUnitVectors(UP, _a.copy(top).sub(clip).normalize());
            B.scale.set(0.55 * H.g.scale.x, L, 0.55 * H.g.scale.x); B.material.opacity = 0.16 * fade * (0.85 + 0.15 * Math.sin(t * 13));
            if (u >= D) { stop(); H.done = true; }
            const P = H.cur >= 0 ? H.parts[H.cur] : null, look = P ? H.g.localToWorld(_a.copy(P.ctr).add(_b.copy(P.off).multiplyScalar(xk))) : H.g.localToWorld(_a.set(0, 0.35, 0));
            return { look, point: P && (u - tAn) % T_PART > 0.25 ? look : null, part: P, idx: H.cur };
          }
          return { start, stop, tick, state: H, dur };
        })();
