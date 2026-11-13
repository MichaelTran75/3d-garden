// ĐẦU DÒ BƯỚC ĐI + VA CHẠM (kỹ sư, chó): thân có lấn / xuyên vật không — nạp sau harness.js: node run.cjs --probe stepprobe.js
//  Mỗi khung: độ lấn dấu chân (colFH mọi lớp ÷ colFootW), lượt xuyên (ghost), khung bị chặn (stuck), chồng con khác, nhảy vị trí.
//  10 lần / giây khi đang đi (1 lần / giây khi đứng): lưới điểm trong từng khối thân (thân, đầu, cổ, chân, tay, đồ cầm, đuôi) có nằm trong khoảng đặc
//  (đúng ô con 3,1 cm, lớp 0–2) của vật nhô ≥ 10 cm trên mặt đang đứng, thấp hơn đỉnh vật ≥ 4 cm.
//  Gom thành ĐỢT theo loại: fp (dấu chân > 15 %) · body (thân / đầu / cổ) · leg · arm · item · tail · pair (chồng con khác > 6 cm)
//  + tổng theo trạng thái + sự kiện (ghost, jump) + vết đi 1 Hz. Đợt fp / body khi đang đi ⇒ chụp 2 góc (chéo theo camera, cắt bỏ mọi thứ gần camera hơn thân 1,4 m; từ trên, cắt ngang đầu).
//  Vết chi tiết từng khung quanh 1 điểm: đoạn có probe: { fine: { a: 'eng' | 'dog', x, z, r, max } } ⇒ fine: [giây, x, z, hướng, tốc độ, độ lấn, ghost, stuck, mask, lớp chạm ở tâm, trạng thái, + kỹ sư: x, z, độ lấn, hướng của vị trí ĐÍCH (trước lò xo làm mượt)].
//  probeInit(o) sau audInit() · probeReport() cuối đoạn (run.cjs ghi <out>/step/<đoạn>.json + ảnh). Xem: stepsum.py <out>/step
(() => {
  const r2 = v => Math.round(v * 100) / 100, r3 = v => Math.round(v * 1000) / 1000;
  let P = null;
  window.probeInit = (o = {}) => {
    const T = __dbg.THREE, E = __ev, e = __dbg.engObj, dog = __dbg.dogObj, scene = __dbg.scene;
    const COL = E('COL'), colFH = E('colFH'), colFootW = E('colFootW'), colHit = E('colHit'), cowY = E('cowY'), VAN = E('VAN'), B = E('dogBrain').state, DR = E('dogRain'), face = E("worldSee('engineer')");
    // đỉnh khoảng đặc chứa điểm (x, y, z) — vật nhô ≥ 10 cm trên mặt đứng fy, điểm thấp hơn đỉnh ≥ 4 cm; null: thoáng
    const inSolid = E(`((x, z, y, mask, fy) => { const bit = colBit(x, z), c = y * 100, f = fy * 100 + 10; let top = null;
      for (let L = 0; L < 3; L++) { if (!(mask >> L & 1) || !colCell(L, x, z)) continue; const Y = _colT.y, M = _colT.m;
        for (let k = _colT.off[_colI], n = _colT.off[_colI + 1]; k < n; k += 2) if ((M[k >> 1] & bit) && Y[k] <= c + 2 && Y[k + 1] >= c + 4 && Y[k + 1] > f) { const t = Y[k + 1] / 100; if (top === null || t > top) top = t; } }
      return top; })`);
    // lưới điểm trong hộp bao từng khối (co 80 %, bước ≤ 7 cm), hệ riêng của khối
    const grid = (root, classify) => {
      root.updateWorldMatrix(true, true); const L = [], c = new T.Vector3(), h = new T.Vector3(); let np = 0;
      root.traverse(m => {
        if (!m.isMesh || m.isInstancedMesh || !m.geometry || !m.geometry.attributes.position) return;
        const part = classify(m); if (!part) return; const g = m.geometry; if (!g.boundingBox) g.computeBoundingBox();
        g.boundingBox.getCenter(c); g.boundingBox.getSize(h).multiplyScalar(0.5); const sc = m.matrixWorld.getMaxScaleOnAxis();
        if (!isFinite(h.x + h.y + h.z) || Math.max(h.x, h.y, h.z) * sc < 0.03) return;
        const n = k => Math.max(2, Math.min(7, Math.ceil(1.6 * h.getComponent(k) * sc / 0.07) + 1)), nx = n(0), ny = n(1), nz = n(2), A = [];
        for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) A.push(c.x + (2 * i / (nx - 1) - 1) * h.x * 0.8, c.y + (2 * j / (ny - 1) - 1) * h.y * 0.8, c.z + (2 * k / (nz - 1) - 1) * h.z * 0.8);
        L.push({ m, part, A: new Float32Array(A), on: false, o: 0 }); np += A.length;
      });
      L.W = new Float32Array(np); return L;
    };
    const up = (m, root, f) => { for (let q = m; q && q !== root; q = q.parent) { const r = f(q); if (r) return r; } return null; };
    const U = e.g.userData, items = new Set([...Object.values(U.props || {}), U.rodGrp, U.rod, U.clip].filter(x => x && x.isObject3D)), arms = new Set(U.arms), legs = new Set(U.legs);
    const DU = dog.userData, dLegs = new Set(DU.legs.map(l => l.hip)), tails = new Set([DU.tail]); { const dt = E('dogTail'); if (dt) for (const v of Object.values(dt)) { if (v && v.isObject3D) tails.add(v); else if (Array.isArray(v)) for (const w of v) if (w && w.isObject3D) tails.add(w); } }
    const engPart = m => up(m, e.g, q => items.has(q) ? 'item' : q === U.head ? 'head' : arms.has(q) ? 'arm' : legs.has(q) ? 'leg' : null) || 'torso';
    const dogPart = m => up(m, dog, q => tails.has(q) ? 'tail' : q === DU.head ? 'head' : q === DU.neck ? 'neck' : dLegs.has(q) ? 'leg' : null) || 'torso';
    // điểm thân trong vật: { hit: { khối: số điểm }, pt: điểm sâu nhất [x, y, z, khối, đỉnh vật], fy: mặt đứng (điểm chân thấp nhất) }
    const sample = (root, L) => {
      root.updateWorldMatrix(true, true); const W = L.W; let n = 0, fy = 1e9;
      for (const S of L) {
        let ok = true; for (let q = S.m; q !== root; q = q.parent) if (!q || !q.visible) { ok = false; break; }
        S.on = ok; if (!ok) continue; const me = S.m.matrixWorld.elements, A = S.A, leg = S.part === 'leg'; S.o = n;
        for (let k = 0; k < A.length; k += 3) { const x = A[k], y = A[k + 1], z = A[k + 2], wy = me[1] * x + me[5] * y + me[9] * z + me[13];
          W[n] = me[0] * x + me[4] * y + me[8] * z + me[12]; W[n + 1] = wy; W[n + 2] = me[2] * x + me[6] * y + me[10] * z + me[14]; n += 3; if (leg && wy < fy) fy = wy; }
      }
      if (fy > 1e8) fy = root.position.y;
      const hit = {}; let pt = null, deep = 0;
      for (const S of L) {
        if (!S.on) continue; let c = 0;
        for (let k = S.o, end = S.o + S.A.length; k < end; k += 3) { const top = inSolid(W[k], W[k + 2], W[k + 1], 7, fy); if (top === null) continue; c++; const d = top - W[k + 1]; if (d > deep) { deep = d; pt = [r2(W[k]), r2(W[k + 1]), r2(W[k + 2]), S.part, r2(top)]; } }
        if (c) hit[S.part] = (hit[S.part] || 0) + c;
      }
      return { hit, pt, fy };
    };
    // chồng với con khác: [độ lấn lớn nhất, loại con kia] (mỗi thân = 3 hình tròn dọc thân, như colMoverHits; không xét ignore)
    const pair = (M, x, z, ang) => {
      const ca = Math.cos(ang), sa = Math.sin(ang), rS = M.b, dS = Math.max(0, M.a - M.b); x += ca * (M.ox || 0); z += sa * (M.ox || 0); let best = 0, kind = null;
      for (const q of COL.movers) {
        if (q === M || !q.on()) continue; const ox = q.x(), oz = q.z(); if (Math.abs(ox - x) > M.a + q.a + 0.1 || Math.abs(oz - z) > M.a + q.a + 0.1) continue;
        const oa = q.ang(), co = Math.cos(oa), so = Math.sin(oa), rO = q.b, dO = Math.max(0, q.a - q.b), cx = ox + co * (q.ox || 0), cz = oz + so * (q.ox || 0);
        for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) { const p = rS + rO - Math.hypot(x + ca * u * dS - (cx + co * v * dO), z + sa * u * dS - (cz + so * v * dO)); if (p > best) { best = p; kind = q.kind || '?'; } }
      }
      return [best, kind];
    };
    // ảnh: 2 góc quanh điểm (x, y mặt đứng, z) — chéo theo hướng camera chính, từ trên xuống (mặt cắt gần ngay trên đầu ⇒ tán cây, mái không che)
    const Rn = __dbg.renderer, render0 = Rn.render, cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.05, 400), dir = new T.Vector3();
    const snap = (x, y, z) => {
      const asp = Rn.domElement.width / Rn.domElement.height, out = [], rt = Rn.getRenderTarget(); Rn.setRenderTarget(null); scene.updateMatrixWorld();
      for (const mode of ['iso', 'top']) {
        const hh = mode === 'iso' ? 1.7 : 1.4; cam.left = -hh * asp; cam.right = hh * asp; cam.top = hh; cam.bottom = -hh; cam.layers.mask = __dbg.camera.layers.mask;
        if (mode === 'iso') { __dbg.camera.getWorldDirection(dir); cam.up.set(0, 1, 0); cam.position.set(x - dir.x * 60, y + 0.9 - dir.y * 60, z - dir.z * 60); cam.near = 58.6; cam.far = 200; cam.lookAt(x, y + 0.9, z); }
        else { cam.up.set(0, 0, -1); cam.position.set(x, y + 2.2, z); cam.near = 0.05; cam.far = 6; cam.lookAt(x, y, z); }
        cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
        try { render0.call(Rn, scene, cam); out.push(Rn.domElement.toDataURL('image/jpeg', 0.82)); } catch (err) { out.push('LỖI ' + err.message); }
      }
      Rn.setRenderTarget(rt); return out;
    };
    const actor = (name, root, M, L, st, jump) => ({ name, root, M, L, st, jump, px: null, pz: null, sp: 0, wasOut: false, tick: 0, gh: false, run: {}, runs: [], ev: [], cells: new Set(), shots: 0, fy: null,
      tot: { fr: 0, out: 0, mov: 0, fp2: 0, fp15: 0, fp40: 0, fp15still: 0, fpMax: 0, ghostFr: 0, ghostMov: 0, ghostEv: 0, stuckFr: 0, samples: 0, jumps: 0, pts: L.W.length / 3, parts: L.length }, by: new Map() });
    const engSt = () => {
      const p = e.g.position, out = !e.inVan && e.phase !== 'van' && e.g.parent === scene && e.g.visible, sub = audSub(e, AUD.R);
      const sit = !!(e.seat && !['go', 'stood', 'leave', 'path'].includes(e.seat.st)), door = Math.hypot(p.x - VAN.doorStep.x, p.z - VAN.doorStep.z) < 1.3;
      return { out, key: e.act + ' ' + e.phase + (sub ? ' ' + sub : '') + (e.seat ? ' ghế:' + e.seat.st : '') + (door ? ' [cửa xe]' : '') + (e.ledge ? ' [bậc]' : '') + (sit ? ' [ngồi]' : ''), wd: !!(face && face.withDog) };
    };
    const dogSt = () => {
      const D = DR.st, out = !B.inside && D !== 'in' && dog.visible && dog.parent === scene;
      return { out, key: B.st + '/' + B.mode + (D ? ' trú:' + D : '') + (B.air ? ' [nhảy]' : ''), wd: !!(face && face.withDog) };
    };
    P = window.STEP = { o, frames: 0, err: null, trace: [], shots: [], fine: [], tr: 0,
      A: [actor('eng', e.g, E('engCol'), grid(e.g, engPart), engSt, 0.5), actor('dog', dog, E('dogCol'), grid(dog, dogPart), dogSt, 0.6)] };
    const hm = h => { const s = Math.round(h * 3600); return Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
    const close = (a, k) => { const c = a.run[k]; if (!c) return; a.run[k] = null; c.dur = r2((c.h1 - c.h) * 3600); c.t = hm(c.h); c.h = +c.h.toFixed(5); c.mx = r3(c.mx); c.len = r2(c.len); delete c.h1; delete c.gap; delete c.lx; delete c.lz; if (a.runs.length < 1500) a.runs.push(c); };
    const runUpd = (a, k, on, val, h, S, mov, x, z, pnt, endGap, extra) => {
      let c = a.run[k];
      if (on) {
        if (!c) c = a.run[k] = { k, h, h1: h, n: 0, mov: 0, gh: 0, mx: 0, st0: S.key, st: S.key, at: [r2(x), r2(z)], len: 0, lx: x, lz: z, gap: 0 };
        c.n++; if (mov) c.mov++; if (a.M.ghost > 0) c.gh++; if (S.wd) c.wd = 1; if (extra) c.x = extra; c.gap = 0; c.h1 = h;
        if (val > c.mx) { c.mx = val; c.st = S.key; c.atMax = [r2(x), r2(z)]; if (pnt) c.pt = pnt; }
        if ((k === 'fp' || k === 'body') && c.mov === 4 && !c.shot && a.shots < (o.shots ?? 6)) {
          const cell = Math.round(x / 2) + ',' + Math.round(z / 2) + k; if (!a.cells.has(cell)) { a.cells.add(cell); a.shots++; c.shot = a.name + '-' + k + '-' + a.shots; P.shots.push({ id: c.shot, t: hm(h), st: S.key, at: [r2(x), r2(z)], img: snap(x, a.fy ?? a.root.position.y, z) }); }
        }
      } else if (c && ++c.gap > endGap) { close(a, k); c = null; }
      if (c) { c.len += Math.hypot(x - c.lx, z - c.lz); c.lx = x; c.lz = z; }
    };
    const one = (a, h, dt) => {
      const M = a.M, x = M.x(), z = M.z(), S = a.st(), Tt = a.tot, d = a.px === null ? 0 : Math.hypot(x - a.px, z - a.pz); a.px = x; a.pz = z;
      a.sp += (d / dt - a.sp) * 0.3; const mov = a.sp > 0.12; Tt.fr++;
      if (!S.out) { a.wasOut = false; a.gh = false; for (const k of Object.keys(a.run)) close(a, k); return [x, z, 0]; }
      Tt.out++; if (mov) Tt.mov++;
      if (a.wasOut && d > a.jump) { Tt.jumps++; if (a.ev.length < 300) a.ev.push({ t: hm(h), k: 'jump', st: S.key, d: r2(d), at: [r2(x), r2(z)] }); } a.wasOut = true;
      const ang = M.ang(), fp = COL.ready ? colFH(M, x, z, ang, 7) / colFootW(M) : 0, gh = M.ghost > 0;
      if (fp > Tt.fpMax) Tt.fpMax = r3(fp);
      let b = a.by.get(S.key); if (!b) a.by.set(S.key, b = { fr: 0, mov: 0, fp2: 0, fp15: 0, fp40: 0, gh: 0, sm: 0, body: 0, leg: 0, arm: 0, item: 0, tail: 0, pair: 0 });
      b.fr++; if (mov) { b.mov++; if (fp > 0.02) { b.fp2++; Tt.fp2++; } if (fp > 0.15) { b.fp15++; Tt.fp15++; } if (fp > 0.4) { b.fp40++; Tt.fp40++; } } else if (fp > 0.15) Tt.fp15still++;
      if (gh) { Tt.ghostFr++; b.gh++; if (mov) Tt.ghostMov++; if (!a.gh) { Tt.ghostEv++; if (a.ev.length < 300) a.ev.push({ t: hm(h), k: 'ghost', st: S.key, g: r2(M.ghost), fp: r3(fp), at: [r2(x), r2(z)] }); } } a.gh = gh;
      if (M.stuck > 0) Tt.stuckFr++;
      runUpd(a, 'fp', fp > 0.15, fp, h, S, mov, x, z, null, 6);
      const pr = pair(M, x, z, ang); if (pr[0] > 0.06) b.pair++; runUpd(a, 'pair', pr[0] > 0.06, pr[0], h, S, mov, x, z, null, 6, pr[1]);
      if (++a.tick >= (mov ? 2 : 20) && COL.ready) {
        a.tick = 0; Tt.samples++; b.sm++; const R = sample(a.root, a.L), H = R.hit; a.fy = R.fy;
        const body = (H.torso || 0) + (H.head || 0) + (H.neck || 0), gap = mov ? 3 : 1;
        for (const [k, n] of [['body', body], ['leg', H.leg || 0], ['arm', H.arm || 0], ['item', H.item || 0], ['tail', H.tail || 0]]) { if (n >= 2) b[k]++; runUpd(a, k, n >= 2, n, h, S, mov, x, z, n >= 2 && R.pt, gap); }
      }
      const F = o.fine; if (F && F.a === a.name && P.fine.length < (F.max || 6000) && Math.hypot(x - F.x, z - F.z) < F.r) { const g = cowY(x, z); let lay = 0; for (let L = 0; L < 3; L++) if (colHit(1 << L, x, z, g + M.lo, g + M.hi)) lay |= 1 << L;
        P.fine.push([+(h * 3600).toFixed(2), r3(x), r3(z), r3(a.root.rotation.y), r2(a.sp), r3(fp), r2(M.ghost || 0), r2(M.stuck || 0), M.mask(), lay, S.key, ...(a.name === 'eng' && e.pose ? [r3(e.pose.rawPos.x), r3(e.pose.rawPos.z), r3(colFH(M, e.pose.rawPos.x, e.pose.rawPos.z, 0, 7) / colFootW(M)), r3(e.pose.rawYaw)] : [])]); }
      return [x, z, (mov ? 1 : 0) + (gh ? 2 : 0) + (fp > 0.15 ? 4 : 0)];
    };
    const f0 = __dbg.frames; P.f0 = f0;
    __dbg.frames = n => {
      const r = f0(n);
      try { const h = window.__hourOverride ?? 0, dt = __dbg.clock.__dt || 1 / 20; P.frames++; const a = one(P.A[0], h, dt), c = one(P.A[1], h, dt);
        if (++P.tr >= 20) { P.tr = 0; P.trace.push([+h.toFixed(4), r2(a[0]), r2(a[1]), a[2], r2(c[0]), r2(c[1]), c[2]]); } } catch (err) { if (!P.err) P.err = String(err && err.stack || err).slice(0, 600); }
      return r;
    };
    return P.A.map(a => a.name + ': ' + a.tot.parts + ' khối, ' + a.tot.pts + ' điểm').join(' · ');
  };
  // tên vật quanh 1 điểm: hộp bao (thế giới) nhỏ nhất chứa điểm, tên = các tên gần nhất trên đường lên gốc
  const labeler = () => {
    const T = __dbg.THREE, scene = __dbg.scene, skip = new Set([__dbg.engObj.g, __dbg.dogObj]), boxes = [], bb = new T.Box3(), m4 = new T.Matrix4(), sz = new T.Vector3();
    const nameOf = m => { const N = []; for (let q = m; q && q !== scene && N.length < 3; q = q.parent) if (q.name && N[N.length - 1] !== q.name) N.push(q.name); return N.reverse().join(' › ') || (m.geometry && m.geometry.type) || '?'; };
    const add = (m, mat) => { bb.copy(m.geometry.boundingBox).applyMatrix4(mat); bb.getSize(sz); if (!isFinite(sz.x + sz.y + sz.z) || sz.x > 40 || sz.z > 40) return; boxes.push([bb.min.x, bb.min.y, bb.min.z, bb.max.x, bb.max.y, bb.max.z, sz.x * sz.y * sz.z, m]); };
    const walk = q => { if (skip.has(q) || !q.visible) return;
      if (q.isMesh && q.geometry && q.geometry.attributes.position) { if (!q.geometry.boundingBox) q.geometry.computeBoundingBox();
        if (q.isInstancedMesh) { if (q.count <= 400) for (let i = 0; i < q.count; i++) { q.getMatrixAt(i, m4); add(q, m4.premultiply(q.matrixWorld)); } } else add(q, q.matrixWorld); }
      for (const c of q.children) walk(c); };
    scene.updateMatrixWorld(); walk(scene);
    return (x, y, z, pad = 0.08) => { const hit = []; for (const b of boxes) if (x > b[0] - pad && x < b[3] + pad && y > b[1] - pad && y < b[4] + pad && z > b[2] - pad && z < b[5] + pad) hit.push(b);
      hit.sort((a, c) => a[6] - c[6]); return hit.slice(0, 2).map(b => nameOf(b[7])); };
  };
  window.probeReport = () => {
    if (!P) return null; const lab = labeler(), gY = __ev('cowY');
    const out = { frames: P.frames, err: P.err, trace: P.trace, shots: P.shots, fine: P.fine, actors: {} };
    for (const a of P.A) {
      for (const k of Object.keys(a.run)) { const c = a.run[k]; if (c) { a.run[k] = null; c.dur = r2((c.h1 - c.h) * 3600); c.mx = r3(c.mx); c.len = r2(c.len); const s = Math.round(c.h * 3600); c.t = Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); c.h = +c.h.toFixed(5); delete c.h1; delete c.gap; delete c.lx; delete c.lz; a.runs.push(c); } }
      for (const c of a.runs) { const q = c.pt ? [c.pt[0], c.pt[1], c.pt[2]] : c.atMax ? [c.atMax[0], gY(c.atMax[0], c.atMax[1]) + 0.6, c.atMax[1]] : null; if (q) c.obj = lab(q[0], q[1], q[2], c.pt ? 0.08 : 0.3); }
      for (const v of a.ev) if (v.k === 'ghost') v.obj = lab(v.at[0], gY(v.at[0], v.at[1]) + 0.6, v.at[1], 0.35);
      out.actors[a.name] = { tot: a.tot, by: [...a.by].map(([k, v]) => Object.assign({ st: k }, v)), runs: a.runs, ev: a.ev };
    }
    return out;
  };
})();
