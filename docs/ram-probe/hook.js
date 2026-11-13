(() => {
  const G = window.__gpu = { buf: new Map(), tex: new Map(), rb: new Map() }, st = new WeakMap(), S = gl => { let s = st.get(gl); if (!s) st.set(gl, s = { unit: 0, tb: {}, bb: {}, rb: null }); return s; };
  const wrap = (P, n, f) => { const o = P[n]; if (!o) return; P[n] = function (...a) { try { f(this, a); } catch (e) {} return o.apply(this, a); }; };
  const cube = t => t >= 0x8515 && t <= 0x851A ? 0x8513 : t, cur = (gl, t) => S(gl).tb[S(gl).unit + ':' + cube(t)];
  for (const P of [window.WebGL2RenderingContext && WebGL2RenderingContext.prototype, window.WebGLRenderingContext && WebGLRenderingContext.prototype]) { if (!P) continue;
    wrap(P, 'bindBuffer', (gl, a) => { S(gl).bb[a[0]] = a[1]; });
    wrap(P, 'bufferData', (gl, a) => { const b = S(gl).bb[a[0]], x = a[1]; if (b) G.buf.set(b, { size: typeof x === 'number' ? x : x ? (a[4] ? a[4] * (x.BYTES_PER_ELEMENT || 1) : x.byteLength) : 0, target: a[0] }); });
    wrap(P, 'deleteBuffer', (gl, a) => { G.buf.delete(a[0]); });
    wrap(P, 'activeTexture', (gl, a) => { S(gl).unit = a[0]; });
    wrap(P, 'bindTexture', (gl, a) => { S(gl).tb[S(gl).unit + ':' + a[0]] = a[1]; });
    wrap(P, 'texImage2D', (gl, a) => { const t = cur(gl, a[0]); if (!t) return; let w, h; if (a.length >= 8) { w = a[3]; h = a[4]; } else { const s = a[5]; w = s.videoWidth || s.naturalWidth || s.width; h = s.videoHeight || s.naturalHeight || s.height; }
      const r = G.tex.get(t) || { mip: false }; if (a[1] === 0) { r.w = w; r.h = h; r.f = a[2]; r.faces = cube(a[0]) === 0x8513 ? 6 : 1; r.d = 1; } else r.mip = true; G.tex.set(t, r); });
    wrap(P, 'texStorage2D', (gl, a) => { const t = cur(gl, a[0]); if (t) G.tex.set(t, { w: a[3], h: a[4], f: a[2], mip: a[1] > 1, faces: a[0] === 0x8513 ? 6 : 1, d: 1 }); });
    wrap(P, 'texImage3D', (gl, a) => { const t = cur(gl, a[0]); if (t && a[1] === 0) G.tex.set(t, { w: a[3], h: a[4], d: a[5], f: a[2], mip: false, faces: 1 }); });
    wrap(P, 'texStorage3D', (gl, a) => { const t = cur(gl, a[0]); if (t) G.tex.set(t, { w: a[3], h: a[4], d: a[5], f: a[2], mip: a[1] > 1, faces: 1 }); });
    wrap(P, 'generateMipmap', (gl, a) => { const t = cur(gl, a[0]), r = t && G.tex.get(t); if (r) r.mip = true; });
    wrap(P, 'deleteTexture', (gl, a) => { G.tex.delete(a[0]); });
    wrap(P, 'bindRenderbuffer', (gl, a) => { S(gl).rb = a[1]; });
    wrap(P, 'renderbufferStorage', (gl, a) => { const b = S(gl).rb; if (b) G.rb.set(b, { w: a[2], h: a[3], f: a[1], s: 1 }); });
    wrap(P, 'renderbufferStorageMultisample', (gl, a) => { const b = S(gl).rb; if (b) G.rb.set(b, { w: a[3], h: a[4], f: a[2], s: Math.max(1, a[1]) }); });
    wrap(P, 'deleteRenderbuffer', (gl, a) => { G.rb.delete(a[0]); });
  }
  const BPP = { 0x8058: 4, 0x8051: 4, 0x1908: 4, 0x1907: 4, 0x8C43: 4, 0x8C41: 4, 0x881A: 8, 0x8814: 16, 0x8229: 1, 0x822B: 2, 0x822D: 2, 0x822E: 4, 0x822F: 4, 0x8230: 8, 0x8C3A: 4, 0x81A5: 2, 0x81A6: 4, 0x88F0: 4, 0x8CAC: 4, 0x1902: 4, 0x1909: 1, 0x1906: 1, 0x190A: 2, 0x8D48: 1, 0x8D62: 2, 0x8056: 2, 0x881B: 8, 0x8815: 16, 0x8D8E: 4 };
  window.__gpuSum = () => { const tb = r => r.w * r.h * (r.d || 1) * (r.faces || 1) * (BPP[r.f] || 4) * (r.mip ? 4 / 3 : 1); let b = 0, t = 0, rb = 0; for (const x of G.buf.values()) b += x.size; const T = [...G.tex.values()].filter(r => r.w); for (const r of T) t += tb(r); for (const r of G.rb.values()) rb += r.w * r.h * r.s * (BPP[r.f] || 4);
    const grp = {}; for (const r of T) { const k = r.w + 'x' + r.h + (r.d > 1 ? 'x' + r.d : '') + (r.faces > 1 ? ' cube' : '') + ' f' + r.f.toString(16) + (r.mip ? ' mip' : ''); (grp[k] = grp[k] || [0, 0])[0]++; grp[k][1] += tb(r); }
    const big = [...G.buf.values()].map(x => x.size).sort((a, c) => c - a);
    return { bufN: G.buf.size, bufMB: +(b / 1048576).toFixed(1), bufTop: big.slice(0, 12).map(x => +(x / 1048576).toFixed(2)), texN: T.length, texMB: +(t / 1048576).toFixed(1), texTop: Object.entries(grp).sort((a, c) => c[1][1] - a[1][1]).slice(0, 28).map(([k, v]) => k + ' ×' + v[0] + ' = ' + (v[1] / 1048576).toFixed(1)), rbN: G.rb.size, rbMB: +(rb / 1048576).toFixed(1), rbList: [...G.rb.values()].map(r => r.w + 'x' + r.h + ' s' + r.s + ' f' + r.f.toString(16)) }; };
  // mảng kiểu ≥ 64 KB: chỗ cấp + còn sống không
  const A = window.__arr = [], MIN = 65536;
  const note = (obj, bytes, kind) => { if (bytes < MIN) return; const st = (new Error().stack || '').split('\n').slice(3, 7).map(l => (l.match(/:(\d+):(\d+)\)?$/) || [])[1] || '?').join('<'); A.push({ r: new WeakRef(obj), bytes, kind, st }); };
  for (const n of ['Float32Array', 'Float64Array', 'Uint8Array', 'Uint8ClampedArray', 'Int8Array', 'Uint16Array', 'Int16Array', 'Uint32Array', 'Int32Array']) { const C = window[n];
    window[n] = new Proxy(C, { construct(t, a, nt) { const o = Reflect.construct(t, a, nt); if (!(a[0] instanceof ArrayBuffer) && !(window.SharedArrayBuffer && a[0] instanceof SharedArrayBuffer)) note(o, o.byteLength, n); return o; } }); try { C.prototype.constructor = window[n]; } catch (e) {} }
  { const C = window.ArrayBuffer; window.ArrayBuffer = new Proxy(C, { construct(t, a, nt) { const o = Reflect.construct(t, a, nt); note(o, o.byteLength, 'ArrayBuffer'); return o; } }); }
  window.__arrSum = () => { const live = A.map(x => ({ o: x.r.deref(), x })).filter(e => e.o && e.o.byteLength > 0), by = {}; let tot = 0; for (const { x } of live) { tot += x.bytes; const k = x.st; (by[k] = by[k] || { n: 0, b: 0, kind: x.kind }).n++; by[k].b += x.bytes; }
    return { allocs: A.length, live: live.length, liveMB: +(tot / 1048576).toFixed(1), top: Object.entries(by).sort((a, c) => c[1].b - a[1].b).slice(0, 45).map(([k, v]) => [+(v.b / 1048576).toFixed(2), v.n, v.kind, k]) }; };
})();
