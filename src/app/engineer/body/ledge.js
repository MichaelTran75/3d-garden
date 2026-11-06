        // ---- LÊN / XUỐNG BẬC VOXEL (G 02/11 "more detail how to climb up and down a voxel step"): bậc 1 khối cao 0,6 = 86% chiều dài chân kỹ sư (hông cách
        //      đất 0,70) — với người thật là gờ ngang giữa đùi ~0,8 m, không bước qua trong nhịp đi được. Trước: cứ đi tiếp chậm 15 – 25%, bàn chân đặt
        //      vắt ngang mép bậc (đo 30% lần qua bậc), thân nảy 0,6 trong ~0,3 s. Nay engStep thấy mép bậc trước mặt (0,3 – 0,7 cao, hướng đi cắt mép
        //      ≥ 60°, hai mặt bậc đủ rộng, chỗ đáp thông) thì bỏ nhịp đi, tự vẽ đường 2 bàn chân (e.footPlan, IK chân bám đúng điểm) + hông:
        //      LÊN (bước kê chân — step-up, như leo gờ cao ngang đùi): hãm dần tới sát mép, quay vuông góc mép · chân sau nhấc cao, gối gập sâu đặt cả bàn
        //      lên mặt bậc (nhấc thẳng lên trước rồi mới đưa tới, mũi giày qua mép) · chồm người ~0,45 rad, tay cùng bên tì đùi trên gối, mắt nhìn chỗ đặt
        //      chân · chân trên duỗi đẩy người lên, chân dưới nhón gót đạp rồi rời đất sớm (hông lên là hết tầm với), treo dưới hông rồi đưa lên đặt cạnh.
        //      XUỐNG (gờ ngang đùi: người thật nhảy nhẹ xuống, không bước được — chân dưới với không tới): dừng mũi giày ở mép, khuỵu gối lấy đà, tay vung ra
        //      sau · bật nhẹ, bay theo quỹ đạo rơi thật (g = 9,81), hai chân co · đáp mũi chân trước, gối khuỵu hãm (hông thấp 0,15), tay vung ra trước giữ
        //      thăng bằng rồi đứng lên. Thời gian theo căn độ cao. Pha nào không gọi engStep nữa (đổi việc, phản ứng mưa) ⇒ khung sau tự huỷ ----
        const LEDGE_MIN = 0.3, LEDGE_SO_UP = 0.30, LEDGE_SO_DN = 0.16;   // độ cao tối thiểu coi là gờ · khoảng hông – mép lúc đứng trước gờ (lên / xuống)
        const _lgA = new THREE.Vector3(), _lgB = new THREE.Vector3(), _lgC = new THREE.Vector3(), _lgD = new THREE.Vector3();
        const lgEase = x => minJerk(x), lgSeg = (u, a, b) => Math.max(0, Math.min(1, (u - a) / (b - a))), lgBump = (u, a, b) => { const s = lgSeg(u, a, b); return Math.sin(Math.PI * s); };
        function engLedgeCheck(e, ux, uz, t) {   // thấy gờ trước mặt và đã đủ gần ⇒ dựng kế hoạch, true
          const p = e.g.position, h0 = cowY(p.x, p.z); let d = 0.1, g = h0;
          for (; d <= 0.75; d += 0.05) { g = cowY(p.x + ux * d, p.z + uz * d); if (Math.abs(g - h0) > LEDGE_MIN) break; }
          const dh = g - h0; if (d > 0.75 || Math.abs(dh) > ENG_STEP_MAX + 0.05) return false;
          // mép giữa 2 ô voxel: ô trước / sau điểm vượt; đổi cả 2 trục (cắt góc) thì chọn mặt mà ô kề cùng cao với bên kia — không rõ thì thôi
          const i0 = Math.round(x2gi(p.x + ux * (d - 0.05))), j0 = Math.round(z2gj(p.z + uz * (d - 0.05))), i1 = Math.round(x2gi(p.x + ux * d)), j1 = Math.round(z2gj(p.z + uz * d));
          let nx = 0, nz = 0, ex = 0, ez = 0;
          const yAt = (i, j) => cowY(wx(i), wz(j));
          if (i1 !== i0 && (j1 === j0 || Math.abs(yAt(i1, j0) - g) < 0.05)) { nx = Math.sign(i1 - i0); ex = (wx(i0) + wx(i1)) / 2; }
          else if (j1 !== j0 && (i1 === i0 || Math.abs(yAt(i0, j1) - g) < 0.05)) { nz = Math.sign(j1 - j0); ez = (wz(j0) + wz(j1)) / 2; }
          else return false;
          if (ux * nx + uz * nz < 0.5) return false;   // đi men theo mép (lệch > 60°): để bảng đường dẫn đi tiếp
          const s = nx ? (ex - p.x) * nx : (ez - p.z) * nz, up = dh > 0, so = up ? LEDGE_SO_UP : LEDGE_SO_DN;
          if (s > so + 0.3 || s < so - 0.12) return false;   // còn xa: đi tiếp (engStep đã chậm lại) · lố qua chỗ đứng: thôi
          // điểm trên mép ngang hông (dọc mép giữ nguyên toạ độ ngang hiện tại); hai mặt bậc đủ rộng cho cả 2 bàn chân, chỗ đáp không vướng vật
          const lx = nx ? 0 : 1, lz = nx ? 1 : 0, cx = nx ? ex : p.x, cz = nx ? p.z : ez, S = e.g.scale.y;
          for (const k of [-0.2, 0, 0.2]) {
            if (Math.abs(cowY(cx - nx * so + lx * k, cz - nz * so + lz * k) - h0) > 0.05) return false;
            for (const f of [0.2, 0.45]) if (Math.abs(cowY(cx + nx * f + lx * k, cz + nz * f + lz * k) - g) > 0.05) return false;
          }
          const land = up ? 0.2 : 0.38;
          if (COL.ready && (colHit(7, cx + nx * land, cz + nz * land, g + 0.25, g + 1.85) || colHit(7, cx - nx * so, cz - nz * so, h0 + 0.25, h0 + 1.85))) return false;
          const yaw = Math.atan2(nx, nz), rx = Math.cos(yaw), rz = -Math.sin(yaw), T = (up ? 1.75 : 1.45) * Math.sqrt(Math.abs(dh) / 0.6);
          const L = { up, nx, nz, rx, rz, cx, cz, hLo: up ? h0 : g, hHi: up ? g : h0, t: 0, T, yaw0: e.g.rotation.y, yaw, so, land, live: true,
            p0: new THREE.Vector3(p.x, 0, p.z), v0: Math.min(e.vel || 0, 1.5 * Math.max(0, s - so) / (0.26 * T)), f0: [new THREE.Vector3(), new THREE.Vector3()] };
          // chỗ bàn chân lúc bắt đầu (điểm đất dưới cổ chân): theo nhịp đi đang có, không thì chỗ đứng
          for (let i = 0; i < 2; i++) { const F = e.wk && e.wk.on ? e.wk.feet[i] : null, o = (i ? 0.15 : -0.15) * S;
            if (F) L.f0[i].set(F.a.x, 0, F.a.z); else L.f0[i].set(p.x + Math.cos(e.g.rotation.y) * o, 0, p.z - Math.sin(e.g.rotation.y) * o); L.f0[i].y = cowY(L.f0[i].x, L.f0[i].z); }
          const back = i => (L.f0[i].x - p.x) * nx + (L.f0[i].z - p.z) * nz;
          L.lead = back(0) < back(1) ? 0 : 1;   // lên: chân đang ở sau là chân nhấc lên gờ trước
          e.ledge = L; e.footPlan = { p: [new THREE.Vector3(), new THREE.Vector3()], fp: [0, 0], ledge: true };
          rxLook('ledge', 2.6, T * 0.6, _lgA.set(cx + nx * land, g + 0.1, cz + nz * land));
          return true;
        }
        function engLedgeAbort(e) {   // pha không gọi engStep nữa giữa chừng: bỏ kế hoạch chân, đặt người xuống mặt đất dưới hông
          if (e.footPlan && e.footPlan.ledge) e.footPlan = null;
          e.ledge = null; if (e.wk) e.wk.on = false;
          if (e.g.parent === scene) e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET;
        }
        // chỗ bàn chân i khi đứng thẳng với hông tại (x, z) mặt đất y, mặt nhìn theo hướng gờ
        const lgHome = (L, i, x, z, y, S, out) => out.set(x + L.rx * (i ? 0.15 : -0.15) * S, y, z + L.rz * (i ? 0.15 : -0.15) * S);
        function engLedgeStep(e, dt) {   // chạy 1 khung kế hoạch; true = xong (đứng trên mặt mới, 2 chân cạnh nhau)
          const L = e.ledge, g = e.g, S = g.scale.y, FP = e.footPlan; L.live = true; L.t += dt;
          const u = Math.min(1, L.t / L.T), n = [L.nx, L.nz], so = L.so;
          const lat = (L.p0.x - L.cx) * L.nz * L.nz + (L.p0.z - L.cz) * L.nx * L.nx;   // toạ độ dọc mép của hông lúc bắt đầu
          const ptN = (along, out) => out.set(L.cx + n[0] * along + (L.nx ? 0 : lat), 0, L.cz + n[1] * along + (L.nx ? lat : 0));   // điểm cách mép "along" theo pháp tuyến
          engStandStill(e); e.vel = 0; e.walking = true;
          // hãm tới chỗ đứng trước gờ (Hermite: vận tốc đầu = vận tốc đang đi, cuối = 0) · quay vuông góc mép
          const tA = 0.26, sA = lgSeg(u, 0, tA), Ps = ptN(-so, _lgB), TA = tA * L.T;
          const h00 = 2 * sA ** 3 - 3 * sA ** 2 + 1, h10 = sA ** 3 - 2 * sA ** 2 + sA, h01 = -2 * sA ** 3 + 3 * sA ** 2;
          let px = h00 * L.p0.x + h10 * TA * L.v0 * L.nx + h01 * Ps.x, pz = h00 * L.p0.z + h10 * TA * L.v0 * L.nz + h01 * Ps.z;
          let dyaw = Math.atan2(Math.sin(L.yaw - L.yaw0), Math.cos(L.yaw - L.yaw0)); g.rotation.y = L.yaw0 + dyaw * lgEase(lgSeg(u, 0, 0.3));
          const P = FP.p, fp = FP.fp, D = L.hHi - L.hLo, arms = e.arms, R = e.reachT || (e.reachT = [null, null]);
          let base, lean = 0;
          if (L.up) {
            const ld = L.lead, tr = 1 - ld;
            // chân sau (trước khi trèo đã ở phía trước): bước nốt tới chỗ đứng sát gờ
            const hs = lgHome(L, tr, Ps.x, Ps.z, L.hLo, S, _lgC), sT = lgSeg(u, 0.04, 0.26);
            // chân trước: đặt lên gờ — nhấc thẳng lên trước (vượt mép + 7 cm) rồi mới đưa tới, cả bàn trên mặt bậc
            const top = ptN(0.2, _lgA), lt = lgHome(L, ld, top.x, top.z, L.hHi, S, new THREE.Vector3()), sL = lgSeg(u, 0.1, 0.5);
            { const a = L.f0[ld], hz = lgEase(lgSeg(sL, 0.15, 1)), hy = lgEase(lgSeg(sL, 0, 0.55));
              P[ld].set(a.x + (lt.x - a.x) * hz, a.y + (L.hHi - a.y) * hy + 0.07 * lgBump(sL, 0, 0.95), a.z + (lt.z - a.z) * hz);
              fp[ld] = sL <= 0 ? 0 : sL < 0.3 ? 0.35 * lgSeg(sL, 0, 0.12) : -0.12 * lgBump(sL, 0.3, 1); }   // đạp mũi rời đất → hếch mũi qua mép → đặt phẳng
            // chân dưới: nhón gót đạp (0,40 – 0,52) → rời đất theo hông, gối co, treo sau gờ → nhấc qua mép đặt cạnh chân trên (0,70 – 0,93)
            const rise = lgEase(lgSeg(u, 0.46, 0.86)), tt = lgHome(L, tr, top.x, top.z, L.hHi, S, new THREE.Vector3());
            if (u < 0.5) { P[tr].set(L.f0[tr].x + (hs.x - L.f0[tr].x) * lgEase(sT), L.hLo + 0.06 * lgBump(sT, 0, 1) * (sT > 0 && sT < 1 ? 1 : 0), L.f0[tr].z + (hs.z - L.f0[tr].z) * lgEase(sT)); fp[tr] = 0.5 * lgEase(lgSeg(u, 0.38, 0.5)); }
            else {
              const s2 = lgSeg(u, 0.68, 0.93), hang = Math.min(D, D * rise * 1.05) + 0.03 * lgSeg(u, 0.5, 0.58);
              const kq = lgEase(lgSeg(u, 0.5, 0.7)), qa = ptN(-0.18, _lgD), qx = hs.x + (qa.x + (hs.x - Ps.x) - hs.x) * kq, qz = hs.z + (qa.z + (hs.z - Ps.z) - hs.z) * kq, qy = L.hLo + hang;   // chân treo co gối, kéo sát vách gờ (mũi giày cách vách ~3 cm) chứ không duỗi dài ra sau
              const hz = lgEase(lgSeg(s2, 0.3, 1)), hy = lgEase(lgSeg(s2, 0, 0.5));
              P[tr].set(qx + (tt.x - qx) * hz, qy + (L.hHi + 0.08 - qy) * hy - 0.08 * lgEase(lgSeg(s2, 0.7, 1)), qz + (tt.z - qz) * hz);
              fp[tr] = 0.5 * (1 - lgSeg(u, 0.5, 0.62)) - 0.15 * lgBump(s2, 0.2, 1);
            }
            // hông: tới chỗ đứng (A), nhón theo đà (B), chuyển lên trên chân trước và duỗi lên (C)
            const sC = lgEase(lgSeg(u, 0.46, 0.9)); px += (top.x - Ps.x) * sC; pz += (top.z - Ps.z) * sC;
            base = L.hLo + 0.04 * lgSeg(u, 0.3, 0.46) * (1 - rise) + D * rise;
            lean = 0.34 * lgEase(lgSeg(u, 0.14, 0.42)) * (1 - lgEase(lgSeg(u, 0.72, 1)));
            // tay cùng bên chân trên tì đùi ngay trên gối · tay kia đưa ra trước giữ thăng bằng
            const hk = lgBump(u, 0.4, 0.84);
            if (hk > 0.15) { e.knees[ld].getWorldPosition(_lgC); R[ld] = _lgC.addScaledVector(_lgA.set(n[0], 0, n[1]), -0.07 * S).add(_lgA.set(0, 0.06, 0)).clone(); }
            arms[tr].rotation.x = -0.45 * lgBump(u, 0.3, 0.95);
            e.head.rotation.x = 0.28 * lgBump(u, 0.05, 0.8);
          } else {
            // xuống: 2 chân bước tới mép (mũi giày ngang mép), khuỵu lấy đà, bật nhẹ, bay, đáp mũi trước, khuỵu hãm, đứng lên
            const sF = lgSeg(u, 0.44, 0.64), TF = 0.2 * L.T, tau = sF * TF, vy0 = (-D + 9.81 * TF * TF / 2) / TF;
            const landC = ptN(L.land, _lgA);
            for (let i = 0; i < 2; i++) {
              const hs = lgHome(L, i, Ps.x, Ps.z, L.hHi, S, _lgC), w = lgSeg(u, i === L.lead ? 0.02 : 0.12, i === L.lead ? 0.16 : 0.26), a = L.f0[i];
              const hl = lgHome(L, i, landC.x, landC.z, L.hLo, S, new THREE.Vector3());
              if (u < 0.44) { P[i].set(a.x + (hs.x - a.x) * lgEase(w), L.hHi + 0.05 * lgBump(w, 0, 1) * (w > 0 && w < 1 ? 1 : 0), a.z + (hs.z - a.z) * lgEase(w)); fp[i] = 0.35 * lgEase(lgSeg(u, 0.36, 0.44)); }
              else if (u < 0.64) { const yb = L.hHi - 0.12 + vy0 * tau - 4.905 * tau * tau; P[i].set(hs.x + (hl.x - hs.x) * sF, yb + 0.12 + 0.1 * Math.sin(Math.PI * sF), hs.z + (hl.z - hs.z) * sF); fp[i] = 0.35 * (1 - sF) + 0.3 * sF; }   // bay: chân co dưới hông, mũi chúc đón đất
              else { P[i].copy(hl); fp[i] = 0.3 * (1 - lgSeg(u, 0.64, 0.72)); }
            }
            const crouch = 0.12 * lgEase(lgSeg(u, 0.26, 0.44)), absorb = 0.15 * (u < 0.7 ? 0.8 + 0.2 * lgSeg(u, 0.64, 0.7) : 1 - lgEase(lgSeg(u, 0.7, 0.98)));
            if (u < 0.44) base = L.hHi - crouch;
            else if (u < 0.64) { base = L.hHi - 0.12 + vy0 * tau - 4.905 * tau * tau; px = Ps.x + (landC.x - Ps.x) * sF; pz = Ps.z + (landC.z - Ps.z) * sF; }
            else { base = L.hLo - absorb; px = landC.x; pz = landC.z; }   // đáp ở hông thấp 0,12 → khuỵu tới 0,15 → đứng lên
            lean = 0.25 * lgBump(u, 0.2, 0.5) + 0.2 * lgBump(u, 0.6, 1);
            const sw = -0.7 * lgBump(u, 0.2, 0.5) + 0.6 * lgBump(u, 0.45, 0.95);   // tay vung ra sau lấy đà → ra trước giữ thăng bằng
            arms[0].rotation.x = arms[1].rotation.x = -sw;
            e.head.rotation.x = 0.35 * lgBump(u, 0.05, 0.7);
          }
          g.position.set(px, base - ENG_FEET, pz); e.lean = lean;
          if (u >= 1) { e.footPlan = null; e.ledge = null; if (e.wk) e.wk.on = false; g.rotation.y = L.yaw; return true; }
          return false;
        }
        // ---- LÊN / XUỐNG BẬC CỬA XE (G 02/11 "improve the stepping motion khi bước lên xe"): trước là 1 cú trượt thẳng 0,8 s từ đất lên sàn (chân vung FK, không
        //      chạm bậc). Nay đi đúng 2 bậc thép + sàn như người lên cầu thang: mỗi bước 1 chân đặt cả bàn lên mặt bậc, chân kia làm trụ. Lên: nhấc thẳng lên trước
        //      rồi mới đưa tới (mũi giày qua mép bậc), hông chỉ lên tới mặt chân trụ — chân sau rời bậc mới lên tiếp; xuống: đưa chân ra trước rồi mới hạ, chạm
        //      mũi trước, hông hạ theo chân trụ khuỵu. Tay phía tay vịn trụ B nắm tay vịn suốt mấy bậc đầu, cúi đầu + chồm qua khung cửa.
        //      pts = [{ i: chân, to: điểm đất dưới cổ chân (thế giới) }…] theo thứ tự bước; xong: hông giữa 2 bàn chân cuối ----
        function engStairsStart(e, pts, yaw, stepT, hand) {
          const S = e.g.scale.y, p = e.g.position, f = [new THREE.Vector3(), new THREE.Vector3()];
          for (let i = 0; i < 2; i++) { const F = e.wk && e.wk.on ? e.wk.feet[i] : null, o = (i ? 0.15 : -0.15) * S;
            if (F) f[i].set(F.a.x, 0, F.a.z); else f[i].set(p.x + Math.cos(e.g.rotation.y) * o, 0, p.z - Math.sin(e.g.rotation.y) * o);
            f[i].y = p.y + ENG_FEET; }   // đang đứng: mặt đỡ = mặt dưới chân theo hông
          e.ledge = { stairs: true, pts, k: 0, t: 0, stepT, yaw, yaw0: e.g.rotation.y, feet: f, from: f[pts[0].i].clone(), b0: new THREE.Vector3(p.x, p.y + ENG_FEET, p.z), hand, live: true };
          e.footPlan = { p: [f[0].clone(), f[1].clone()], fp: [0, 0], ledge: true };
        }
        function engStairsStep(e, dt) {   // true = xong bước cuối
          const Q = e.ledge, g = e.g, FP = e.footPlan; Q.live = true; Q.t += dt;
          const st = Q.pts[Q.k], i = st.i, o = 1 - i, s = Math.min(1, Q.t / Q.stepT), A = Q.from, B = st.to, sup = Q.feet[o];
          engStandStill(e); e.vel = 0; e.walking = true;
          const up = B.y > A.y + 0.04, dn = B.y < A.y - 0.04, sw = lgSeg(s, 0.08, 0.92);
          const hz = lgEase(up ? lgSeg(sw, 0.25, 1) : dn ? lgSeg(sw, 0, 0.7) : sw), hy = lgEase(up ? lgSeg(sw, 0, 0.6) : dn ? lgSeg(sw, 0.35, 1) : sw);
          FP.p[i].set(A.x + (B.x - A.x) * hz, A.y + (B.y - A.y) * hy + (up ? 0.06 : 0.04) * Math.sin(Math.PI * sw), A.z + (B.z - A.z) * hz);
          FP.fp[i] = 0.35 * lgBump(s, 0, 0.3) + (dn ? 0.25 * lgSeg(sw, 0.75, 0.95) * (1 - lgSeg(s, 0.95, 1)) : -0.12 * lgBump(sw, 0.3, 1));   // đạp gót rời · lên: hếch mũi qua mép · xuống: chạm mũi trước
          FP.p[o].copy(sup); FP.fp[o] = 0;
          // hông: tới giữa chân trụ và chỗ đặt, độ cao = mặt thấp hơn trong 2 mặt (lên: mặt chân trụ, chân sau còn kéo · xuống: chân trụ khuỵu hạ người)
          const bT = _lgA.set((B.x + sup.x) / 2, Math.min(sup.y, B.y), (B.z + sup.z) / 2), k = lgEase(lgSeg(s, 0.1, 0.9));
          g.position.set(Q.b0.x + (bT.x - Q.b0.x) * k, Q.b0.y + (bT.y - Q.b0.y) * lgEase(lgSeg(s, up ? 0.3 : 0.15, 0.95)) - ENG_FEET, Q.b0.z + (bT.z - Q.b0.z) * k);
          const dy = Math.atan2(Math.sin(Q.yaw - Q.yaw0), Math.cos(Q.yaw - Q.yaw0)); g.rotation.y = Q.yaw0 + dy * lgEase(Math.min(1, (Q.k + s) / 1.2));
          const n = Q.pts.length, u = (Q.k + s) / n;   // tiến độ cả lượt
          e.lean = (up ? 0.16 : 0.08) * lgBump(u, 0.1, 1); e.head.rotation.x = 0.32 * lgBump(u, 0.15, 1);   // cúi đầu, chồm qua khung cửa
          if (Q.hand && u < Q.hand.till && Math.hypot(Q.hand.p.x - g.position.x, Q.hand.p.z - g.position.z) < 0.62) { const R = e.reachT || (e.reachT = [null, null]); R[Q.hand.i] = Q.hand.p; }   // buông khi tay vịn ngoài tầm với
          else e.arms[0].rotation.x = e.arms[1].rotation.x = -0.12;
          if (s >= 1) {
            Q.feet[i].copy(B); Q.from = null; Q.k++; Q.t = 0; Q.b0.set(g.position.x, g.position.y + ENG_FEET, g.position.z);
            if (Q.k >= n) { const a = Q.feet[0], b = Q.feet[1]; g.position.set((a.x + b.x) / 2, Math.min(a.y, b.y) - ENG_FEET, (a.z + b.z) / 2); g.rotation.y = Q.yaw; e.footPlan = null; e.ledge = null; if (e.wk) e.wk.on = false; return true; }
            Q.from = Q.feet[Q.pts[Q.k].i].clone();
          }
          return false;
        }
        function engVanStairs(e, out) {   // dựng lượt lên (out = false: đất → bậc 1 → bậc 2 → sàn → doorIn) / xuống xe (ngược lại, tới doorStep)
          const St = VAN.steps, T = St.treads, D = St.door, yIn = VAN.dims.yIn, S = e.g.scale.y;
          const c = (z, y) => VAN.toWorld(D.cx, y, z), top = t => t.y + t.height / 2 + 0.009;
          const A = VAN.doorStep, B = VAN.doorIn, yaw = out ? Math.atan2(A.x - B.x, A.z - B.z) : Math.atan2(B.x - A.x, B.z - A.z), rx = Math.cos(yaw), rz = -Math.sin(yaw);
          const home = (i, P) => new THREE.Vector3(P.x + rx * (i ? 0.15 : -0.15) * S, P.y, P.z + rz * (i ? 0.15 : -0.15) * S);
          const t1 = c(T[1].z, top(T[1])), t2 = c(T[0].z, top(T[0])), fl = c(D.wall - 0.21, yIn), gr = c(T[1].z + 0.42, 0);
          gr.y = cowY(gr.x, gr.z); const gIn = B.clone(), gOut = A.clone(); gOut.y = cowY(A.x, A.z);
          const hp = VAN.toWorld(St.grab[0], St.grab[1], St.grab[2]), side = (hp.x - e.g.position.x) * rx + (hp.z - e.g.position.z) * rz > 0 ? 1 : 0;
          const L = side, R = 1 - L;   // chân phía tay vịn bước trước (tay cùng bên nắm tay vịn)
          const pts = out ? [{ i: L, to: home(L, t2) }, { i: R, to: home(R, t1) }, { i: L, to: home(L, gr) }, { i: R, to: home(R, gOut) }, { i: L, to: home(L, gOut) }]
            : [{ i: L, to: home(L, t1) }, { i: R, to: home(R, t2) }, { i: L, to: home(L, fl) }, { i: R, to: home(R, gIn) }, { i: L, to: home(L, gIn) }];
          engStairsStart(e, pts, yaw, out ? 0.6 : 0.55, { i: side, p: hp, till: 0.62 });
        }
