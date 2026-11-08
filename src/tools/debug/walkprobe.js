// ĐO CHẤT LƯỢNG ĐI BỘ CỦA KỸ SƯ ngoài trời: tốc độ, nhịp bước, đặt chân trên mép bậc, IK hụt, chạm vật cản
window.walkInit = () => {
  const e = __dbg.engObj, THREE = __dbg.THREE; __dbg.scene.updateMatrixWorld(true);
  const hp = e.head.getWorldPosition(new THREE.Vector3()), gy = __ev("engGroundY")(e.g.position.x, e.g.position.z); window.WP = { H: (hp.y - gy) * 1.08, headRaw: hp.y - gy, S: e.g.scale.y, fr: 0, wt: 0, v: [], strikes: 0, land: [], ikErr: [], body: 0, bodyAt: {}, foot: 0, footAt: {}, props: 0, propAt: {}, stuck: 0, lastLook: 0, prev: [false, false], stepEv: [], yPrev: null, vy: [], turns: 0 };
  return { H: WP.H, S: WP.S };
};
window.walkRun = (h0, sec) => { simSetup();
  const A = WP, e = __dbg.engObj, THREE = __dbg.THREE, gY = __ev('engGroundY'), colHit = __ev('colHit'), COL = __ev('COL'), PROPS = __ev('PROPS'), dt = __dbg.clock.__dt, R = __dbg.renderer, orig = R.render; R.render = () => {};
  const HEEL = 0.135, BALL = 0.13, v = new THREE.Vector3(); let h = h0;
  try {
    for (let k = 0; k * dt < sec; k++) {
      window.__hourOverride = h; __dbg.frames(1); h += dt / 3600; A.fr++;
      if (e.ledge && !A.lg) { A.lgN = (A.lgN || 0) + 1; A.lgUp = (A.lgUp || 0) + (e.ledge.up ? 1 : 0); A.lgAt = A.lgAt || []; if (A.lgAt.length < 12) A.lgAt.push([e.ledge.up ? 'up' : 'dn', +e.g.position.x.toFixed(2), +e.g.position.z.toFixed(2), +(h).toFixed(4)]); } if (!e.ledge && A.lg && A.lg.t < A.lg.T - 0.06) A.lgAbort = (A.lgAbort || 0) + 1; A.lg = e.ledge;
      if (e.ledge && e.wk) { __dbg.scene.updateMatrixWorld(true); e.wk.feet.forEach((F, i) => { e.ankles[i].getWorldPosition(v); const d = v.distanceTo(F.a); A.lgErr = Math.max(A.lgErr || 0, d); (A.lgE || (A.lgE = [])).push(d); }); }
      const p = e.g.position, out = !e.inVan && e.g.parent === __dbg.scene && e.phase !== 'van' && !e.seatCtl;
      const lk = e.nav ? e.nav.look : 0; if (lk > 0 && A.lastLook <= 0) A.stuck++; A.lastLook = lk;
      if (!out || !e.walking || !(e.vel > 0.05) || !e.wk || !e.wk.on || e.footPlan) { A.yPrev = null; A.prev = [false, false]; continue; }
      A.wt += dt; A.v.push(e.vel);
      const S = e.g.scale.y;
      // chạm bàn chân xuống
      e.wk.feet.forEach((F, i) => {
        if (A.prev[i] && !F.sw) { A.strikes++;
          const hx = F.w.x - F.fx * HEEL * S, hz = F.w.z - F.fz * HEEL * S, tx = F.w.x + F.fx * (BALL + 0.06) * S, tz = F.w.z + F.fz * (BALL + 0.06) * S;
          const gh = gY(hx, hz), gt = gY(tx, tz), gm = gY(F.w.x, F.w.z), o = e.wk.feet[1 - i], go = gY(o.w.x, o.w.z);
          A.land.push({ str: +Math.abs(gh - gt).toFixed(2), rise: +(gm - go).toFixed(2), at: [+F.w.x.toFixed(2), +F.w.z.toFixed(2)] }); }
        A.prev[i] = F.sw;
      });
      // IK hụt: cổ chân thật so với đích (chân trụ)
      __dbg.scene.updateMatrixWorld(true);
      { const g0 = gY(p.x, p.z); let near = false; for (let a = 0; a < 8; a++) if (Math.abs(gY(p.x + Math.cos(a * .785) * .6, p.z + Math.sin(a * .785) * .6) - g0) > .25) near = true;
        e.wk.feet.forEach((F, i) => { if (F.sw) return; e.ankles[i].getWorldPosition(v); const d = v.distanceTo(F.a); (near ? (A.ikStep || (A.ikStep = [])) : A.ikErr).push(d); if (!near && d > 0.08) { const kk = e.act + ' tw' + (Math.abs(e.legs[i].rotation.y) > 0.3 ? 1 : 0) + ' v' + (e.vel > 0.8 ? 'f' : 's') + ' dy' + (v.y - F.a.y > 0 ? '+' : '-'); (A.ikWhy || (A.ikWhy = {}))[kk] = ((A.ikWhy || {})[kk] || 0) + 1; } }); }
      // thân chạm vật (vòng 0,22 quanh tâm, tầm 0,3–1,6) · bàn chân đang vung xuyên vật thấp · đồ nhỏ PROPS
      if (COL.ready) { const g = gY(p.x, p.z); let hit = 0; for (let a = 0; a < 8; a++) { const x = p.x + Math.cos(a * Math.PI / 4) * 0.22, z = p.z + Math.sin(a * Math.PI / 4) * 0.22; if (colHit(7, x, z, g + 0.3, g + 1.6)) hit++; }
        if (hit) { A.body++; const kk = e.act + '/' + e.phase + (e.seat ? ':' + e.seat.st : '') + ' ' + Math.round(p.x) + ',' + Math.round(p.z); A.bodyAt[kk] = (A.bodyAt[kk] || 0) + 1; }
        for (const F of e.wk.feet) if (F.sw && colHit(7, F.a.x, F.a.z, F.a.y - 0.02, F.a.y + 0.12)) { A.foot++; const kk = Math.round(F.a.x) + ',' + Math.round(F.a.z); A.footAt[kk] = (A.footAt[kk] || 0) + 1; } }
      for (const ob of PROPS) if (Math.hypot(p.x - ob.x, p.z - ob.z) < ob.r + 0.12) { A.props++; const kk = e.act + '/' + e.phase + (e.seat ? ':' + e.seat.st : '') + ' r' + ob.r + '@' + ob.x.toFixed(1) + ',' + ob.z.toFixed(1); A.propAt[kk] = (A.propAt[kk] || 0) + 1; }
      // chiều cao thân (đã qua lò xo) — vận tốc dọc
      if (A.yPrev !== null) A.vy.push(Math.abs(p.y - A.yPrev) / dt); A.yPrev = p.y;
    }
  } finally { R.render = orig; window.__hourOverride = undefined; }
  return h;
};
window.walkReport = () => {
  const A = WP, q = (arr, f) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); return +s[Math.min(s.length - 1, Math.floor(f * s.length))].toFixed(3); };
  const steps = A.land.filter(l => Math.abs(l.rise) > 0.25), strad = A.land.filter(l => l.str > 0.1);
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { H: +A.H.toFixed(3), walkSec: +A.wt.toFixed(1), vel: { p10: q(A.v, .1), p50: q(A.v, .5), p90: q(A.v, .9) }, realMs_p50: +(q(A.v, .5) / A.H * 1.75).toFixed(2),
    cadence_spm: +(A.strikes / A.wt * 60).toFixed(1), strikes: A.strikes, stepLandings: steps.length, straddle: strad.length, straddleOnSteps: steps.filter(l => l.str > 0.1).length, straddleEx: strad.slice(0, 6),
    ikStep: A.ikStep ? { p50: q(A.ikStep, .5), p95: q(A.ikStep, .95), n: A.ikStep.length } : null, ikWhy: A.ikWhy ? top(A.ikWhy) : null, ikErr: { p50: q(A.ikErr, .5), p95: q(A.ikErr, .95), p99: q(A.ikErr, .99), over4cm: A.ikErr.filter(x => x > 0.04).length, n: A.ikErr.length },
    vy: { p95: q(A.vy, .95), p99: q(A.vy, .99), max: q(A.vy, 1) }, bodyHitFrames: A.body, bodyAt: top(A.bodyAt), swingFootInObj: A.foot, footAt: top(A.footAt), propOverlap: A.props, propAt: top(A.propAt), stuck: A.stuck, ledges: A.lgN || 0, ledgeUp: A.lgUp || 0, ledgeAbort: A.lgAbort || 0, ledgeIkMax: A.lgErr, ledgeIk: A.lgE ? { p50: q(A.lgE, .5), p95: q(A.lgE, .95) } : null, ledgeAt: A.lgAt };
};
