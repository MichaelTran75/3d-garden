simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, S = __dbg.scene, out = {}, H = +window.__hourOverride, sleep = ms => new Promise(r => setTimeout(r, ms));
runFor(3, H); for (let i = 0; i < 60; i++) { __dbg.frames(1); await sleep(8); }
out.info = { geo: R.info.memory.geometries, tex: R.info.memory.textures, programs: R.info.programs.length, pr: R.getPixelRatio(), size: R.getSize(new THREE.Vector2()).toArray() };
const geos = new Map(); let nMesh = 0; S.traverse(o => { if (o.geometry) { nMesh++; if (!geos.has(o.geometry)) geos.set(o.geometry, o); } });
let gpuB = 0, cpuB = 0; const rows = [];
for (const [g, o] of geos) { let gb = 0, cb = 0; const at = Object.values(g.attributes).concat(g.index ? [g.index] : []); const seen = new Set();
  for (const a of at) { const src = a.isInterleavedBufferAttribute ? a.data : a; if (seen.has(src)) continue; seen.add(src); const arr = src.array; const bpe = arr ? arr.BYTES_PER_ELEMENT : 4, n = src.count * (src.stride || src.itemSize); gb += n * bpe; if (arr && arr.length >= n) cb += arr.byteLength; }
  gpuB += gb; cpuB += cb; let nm = o.name, p = o; while (!nm && p.parent) { p = p.parent; nm = p.name; } rows.push([gb, cb, (nm || '?').slice(0, 26)]); }
const by = {}; for (const [gb, cb, nm] of rows) { (by[nm] = by[nm] || [0, 0, 0])[0] += gb; by[nm][1] += cb; by[nm][2]++; }
out.geo = { n: geos.size, objs: nMesh, gpuMB: +(gpuB / 1048576).toFixed(1), cpuHeldMB: +(cpuB / 1048576).toFixed(1), top: Object.entries(by).sort((a, b) => b[1][0] - a[1][0]).slice(0, 22).map(([k, v]) => [k, +(v[0] / 1048576).toFixed(2), +(v[1] / 1048576).toFixed(2), v[2]]) };
const cv = new Set(), cvL = []; let cvB = 0, cvT = 0; const texs = new Set(); S.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { for (const k in m) { const t = m[k]; if (t && t.isTexture) texs.add(t); } if (m.uniforms) for (const k in m.uniforms) { const t = m.uniforms[k] && m.uniforms[k].value; if (t && t.isTexture) texs.add(t); } } });
const tl = []; for (const t of texs) { const im = t.image; if (!im) continue; const w = im.width || 0, h = im.height || 0; if (im instanceof HTMLCanvasElement && !cv.has(im)) { cv.add(im); if (im.__mt) cvT++; else { cvB += w * h * 4; cvL.push(w + 'x' + h + ' v' + t.version + ' ' + (t.name || '')); } } tl.push([w * h * 4, w + 'x' + h + ' ' + (im instanceof HTMLCanvasElement ? 'canvas' : im.data ? 'data' : im.constructor ? im.constructor.name : '?') + ' ' + (t.name || '')]); }
out.tex = { n: texs.size, canvasN: cv.size, canvasCpuMB: +(cvB / 1048576).toFixed(1), top: tl.sort((a, b) => b[0] - a[0]).slice(0, 14).map(x => x[1] + ' ' + (x[0] / 1048576).toFixed(1)) };
out.cvTrim = cvT; out.cvLive = cvL.sort((a, b) => { const f = x => { const m = x.match(/^(\d+)x(\d+)/); return m[1] * m[2]; }; return f(b) - f(a); }).slice(0, 30); try { out.memTrim = __ev('memTrim.n'); } catch (e) { out.memTrim = String(e).slice(0, 80); }
out.allCanvas = [...document.querySelectorAll('canvas')].map(c => c.width + 'x' + c.height);
out.jsHeap = performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null;
let mN = 0, mFree = 0, mInst = 0; S.traverse(o => { if (o.name === 'Thảm rêu (lá cỏ)') { mN++; mInst += o.geometry.instanceCount; if (!o.geometry.attributes.aRoot.array) mFree++; } }); out.moss = { meshes: mN, freed: mFree, blades: mInst };
return { shots: [], out };
