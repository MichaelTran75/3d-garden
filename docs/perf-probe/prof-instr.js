(() => {
  const R = renderer, gl = R.getContext(), ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const P = { on: false, hooks: new Map(), frames: 0, ft: [], calls: 0, tris: 0, renders: 0, cpuRender: 0, gpuNs: 0, gpuN: 0, pend: [], active: null, issued: 0, ext: !!ext };
  for (const [slot, L] of WORLD_TICKS) L.forEach(e => { const f = e.fn, key = slot + ':' + e.at + ':' + (f.name || f.toString().slice(0, 60).replace(/\s+/g, ' ')); e.fn = function (a, b, c) { if (!P.on) return f.call(this, a, b, c); const t0 = performance.now(); const r = f.call(this, a, b, c); P.hooks.set(key, (P.hooks.get(key) || 0) + performance.now() - t0); return r; }; });
  const SM = R.shadowMap, smOrig = SM.render.bind(SM); P.sm = 0; P.smN = 0; SM.render = function (...a) { if (!P.on) return smOrig(...a); P.inSM = true; const t0 = performance.now(), c0 = R.info.render.calls, t0r = R.info.render.triangles; smOrig(...a); P.sm += performance.now() - t0; P.smN++; P.smCalls = (P.smCalls || 0) + R.info.render.calls - c0; P.smTris = (P.smTris || 0) + R.info.render.triangles - t0r; P.inSM = false; };
  const umOrig = scene.updateMatrixWorld.bind(scene); P.um = 0; scene.updateMatrixWorld = function (f) { if (!P.on) return umOrig(f); const t0 = performance.now(); umOrig(f); P.um += performance.now() - t0; };
  const rbd = R.renderBufferDirect.bind(R); P.dk = new Map(); P.dn = new Map(); P.sz = new Map(); P.tn = new Map(); const _sp = new THREE.Sphere();
  R.renderBufferDirect = function (cam, sc, geo, mat, obj, grp) {
    if (P.on) { const pass = P.inSM ? 'shadow' : 'main', kind = obj.isSkinnedMesh ? 'batch(skinned)' : obj.isInstancedMesh ? 'instanced' : geo.isInstancedBufferGeometry ? 'instancedBuf' : obj.isSprite ? 'sprite' : obj.isLineSegments || obj.isLine ? 'line' : obj.isPoints ? 'points' : mat.transparent ? 'mesh(transparent)' : 'mesh';
      const k = pass + ':' + kind; P.dk.set(k, (P.dk.get(k) || 0) + 1);
      { const ic = geo.index ? geo.index.count : geo.attributes.position ? geo.attributes.position.count : 0, dr = geo.drawRange, c = Math.min(ic, dr.count === Infinity ? ic : dr.count), gc = grp ? Math.min(grp.count, c) : c, inst = obj.isInstancedMesh ? obj.count : geo.isInstancedBufferGeometry ? Math.min(geo.instanceCount, 1e9) : 1, t = (obj.isMesh ? gc / 3 : gc) * inst;
        let nm = obj.name, q = obj; while (!nm && q.parent) { q = q.parent; nm = q.name; } nm = pass + ' · ' + kind + ' · ' + (nm || '?').slice(0, 40); P.tn.set(nm, (P.tn.get(nm) || 0) + t); }
      if (!obj.isInstancedMesh && !geo.isInstancedBufferGeometry && !obj.isSkinnedMesh && !obj.isSprite) { if (!geo.boundingSphere) geo.computeBoundingSphere(); _sp.copy(geo.boundingSphere).applyMatrix4(obj.matrixWorld); const ppu = R.domElement.clientHeight / ((camera.top - camera.bottom) / camera.zoom), r = _sp.radius * ppu, b = r < 1 ? '<1px' : r < 2 ? '<2px' : r < 4 ? '<4px' : r < 8 ? '<8px' : '>=8px'; const kk = pass + ':' + b; P.sz.set(kk, (P.sz.get(kk) || 0) + 1); }
      if (pass === 'main' && (kind === 'mesh' || kind === 'mesh(transparent)' || kind === 'line' || kind === 'sprite')) { let nm = obj.name, p = obj; while (!nm && p.parent) { p = p.parent; nm = p.name; } nm = kind + ' · ' + (nm || '?').slice(0, 34); P.dn.set(nm, (P.dn.get(nm) || 0) + 1); } }
    return rbd(cam, sc, geo, mat, obj, grp);
  };
  const orig = R.render.bind(R);
  R.render = function (s, c) {
    if (!P.on) return orig(s, c);
    const t0 = performance.now(); let q = null;
    if (ext && !P.active) { q = gl.createQuery(); P.issued++; gl.beginQuery(ext.TIME_ELAPSED_EXT, q); P.active = q; }
    orig(s, c);
    if (q) { gl.endQuery(ext.TIME_ELAPSED_EXT); P.pend.push(q); P.active = null; }
    P.cpuRender += performance.now() - t0; P.calls += R.info.render.calls; P.tris += R.info.render.triangles; P.renders++;
  };
  const poll = () => { for (let i = P.pend.length - 1; i >= 0; i--) { const q = P.pend[i]; if (gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) { if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) { P.gpuNs += gl.getQueryParameter(q, gl.QUERY_RESULT); P.gpuN++; } gl.deleteQuery(q); P.pend.splice(i, 1); } } };
  let last = 0; const raf = t => { if (!P.on) return; if (last) P.ft.push(t - last); last = t; P.frames++; if (ext) poll(); requestAnimationFrame(raf); };
  function census() {
    const L = {}, mats = new Set(), geos = new Set(); let lightsOn = 0, meshes = 0, vis = 0, inst = 0, instN = 0, skinned = 0, casters = 0, sprites = 0, pts = 0, lines = 0;
    scene.traverse(o => {
      if (o.isLight) { const k = o.type + (o.castShadow ? '*' : ''); let lv = true; for (let p = o; p; p = p.parent) if (!p.visible) { lv = false; break; } if (lv) L[k] = (L[k] || 0) + 1; if (o.intensity > 0 && lv) lightsOn++; }
      if (o.isMesh || o.isPoints || o.isLine || o.isSprite) {
        meshes++; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) { v = false; break; }
        if (v) { vis++; if (o.castShadow) casters++; }
        if (o.isInstancedMesh) { inst++; instN += o.count; } if (o.isSkinnedMesh) skinned++; if (o.isSprite) sprites++; if (o.isPoints) pts++; if (o.isLine) lines++;
        geos.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m && mats.add(m));
      }
    });
    let geoB = 0, gpuGeoB = 0, trimmed = 0; const add = a => { if (!a) return; const n = (a.count || 0) * (a.itemSize || 1) * ((a.array && a.array.BYTES_PER_ELEMENT) || 4); gpuGeoB += n; if (a.array && a.array.length) geoB += a.array.byteLength; else trimmed++; };
    for (const g of geos) { if (!g) continue; for (const k in g.attributes) add(g.attributes[k]); add(g.index); }
    const tex = new Set(); mats.forEach(m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) tex.add(v); } if (m.uniforms) for (const k in m.uniforms) { const v = m.uniforms[k] && m.uniforms[k].value; if (v && v.isTexture) tex.add(v); } });
    let texB = 0; const big = []; for (const t of tex) { const im = t.image || {}; const w = im.width || im.videoWidth || 0, h = im.height || im.videoHeight || 0, d = im.depth || 1; const b = w * h * d * 4 * (t.generateMipmaps !== false && t.minFilter !== THREE.LinearFilter && t.minFilter !== THREE.NearestFilter ? 1.33 : 1); texB += b; big.push([t.name || (im.constructor && im.constructor.name) || '?', w + 'x' + h + (d > 1 ? 'x' + d : ''), +(b / 1e6).toFixed(2)]); }
    big.sort((a, b) => b[2] - a[2]);
    return { lights: L, lightsOn, meshes, visible: vis, instanced: inst, instances: instN, skinned, shadowCasters: casters, sprites, points: pts, lines, materials: mats.size, geometries: geos.size, cpuGeoMB: +(geoB / 1e6).toFixed(1), gpuGeoMB: +(gpuGeoB / 1e6).toFixed(1), trimmedAttrs: trimmed, textures: tex.size, texMB: +(texB / 1e6).toFixed(1), bigTex: big.slice(0, 8), programs: (R.info.programs || []).length, mem: { ...R.info.memory }, drawBuf: [gl.drawingBufferWidth, gl.drawingBufferHeight, gl.getParameter(gl.SAMPLES)], pr: +R.getPixelRatio().toFixed(2), heapMB: performance.memory && +(performance.memory.usedJSHeapSize / 1e6).toFixed(1) };
  }
  const tri = o => { const g = o.geometry; if (!g) return 0; const n = g.index ? g.index.count : (g.attributes.position ? g.attributes.position.count : 0); const per = (g.drawRange && g.drawRange.count !== Infinity ? Math.min(g.drawRange.count, n) : n) / (o.isMesh ? 3 : 1); return per * (o.isInstancedMesh ? o.count : g.isInstancedBufferGeometry ? Math.min(g.instanceCount, 1e9) : 1); };
  function heavy() { const L = []; scene.traverse(o => { if (!(o.isMesh)) return; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) { v = false; break; } if (!v) return; const t = tri(o); if (t > 20000) L.push([o.name || (o.parent && o.parent.name) || '?', o.isInstancedMesh ? 'I' + o.count : o.geometry.isInstancedBufferGeometry ? 'IB' + o.geometry.instanceCount : o.isSkinnedMesh ? 'S' : 'M', (Array.isArray(o.material) ? o.material[0] : o.material).type.replace('Material', ''), Math.round(t / 1000), o.castShadow ? 'cast' : '', o.frustumCulled ? '' : 'noCull']); }); return L.sort((a, b) => b[2] - a[2]).slice(0, 25); }
  let PR0 = 1, GR = [], FERN = [];
  const setLights = on => scene.traverse(o => { if (o.isPointLight || o.isSpotLight) { if (!on) { if (o.userData.__v === undefined) o.userData.__v = o.visible; o.visible = false; } else if (o.userData.__v !== undefined) { o.visible = o.userData.__v; delete o.userData.__v; } } });
  const setShadow = on => { sun.castShadow = on; };
  const setGrass = on => GR.forEach(o => o.visible = on);
  window.PROF = {
    heavy,
    statics() { const A = []; scene.traverse(o => A.push([o, o.matrixWorld.clone()])); window.__ST = A; return A.length; },
    statics2() { let tot = 0, auto = 0, still = 0, stillAuto = 0, meshStillAuto = 0; for (const [o, m] of window.__ST) { tot++; if (o.matrixAutoUpdate) auto++; if (o.matrixWorld.equals(m)) { still++; if (o.matrixAutoUpdate) { stillAuto++; if (o.isMesh) meshStillAuto++; } } } const mats = new Set(), castMats = new Set(); let plain = 0, cast = 0; for (const [o, m] of window.__ST) { if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || (o.geometry && o.geometry.isInstancedBufferGeometry) || !o.matrixWorld.equals(m)) continue; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) { v = false; break; } if (!v) continue; plain++; const mm = Array.isArray(o.material) ? o.material.map(x => x.uuid).join() : o.material.uuid; mats.add(mm); if (o.castShadow) { cast++; castMats.add(mm); } }
      return { objects: tot, autoUpdate: auto, unmoved10s: still, unmovedButAuto: stillAuto, meshesUnmovedButAuto: meshStillAuto, staticVisiblePlainMeshes: plain, theirDistinctMaterials: mats.size, staticCasters: cast, casterDistinctMaterials: castMats.size }; },
    tiny() {   // vật trong khung nhìn: bán kính trên màn hình (px CSS) — camera trực giao
      const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
      const ppu = renderer.domElement.clientHeight / ((camera.top - camera.bottom) / camera.zoom), sph = new THREE.Sphere(), B = { '<1': 0, '<2': 0, '<4': 0, '<8': 0, '>=8': 0 }, C = { '<1': 0, '<2': 0, '<4': 0, '<8': 0, '>=8': 0 }; let n = 0; const ex = {};
      scene.traverse(o => { if (!(o.isMesh || o.isLine || o.isPoints || o.isSprite)) return; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) { v = false; break; } if (!v) return; if (o.isInstancedMesh || (o.geometry && o.geometry.isInstancedBufferGeometry) || o.frustumCulled === false || o.isSprite) return;
        const g = o.geometry; if (!g) return; if (!g.boundingSphere) g.computeBoundingSphere(); sph.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); if (!fr.intersectsSphere(sph)) return; n++;
        const r = sph.radius * ppu, k = r < 1 ? '<1' : r < 2 ? '<2' : r < 4 ? '<4' : r < 8 ? '<8' : '>=8'; B[k]++; if (o.castShadow) C[k]++; if (r < 2) { const nm = (o.name || (o.parent && o.parent.name) || '?').slice(0, 30); ex[nm] = (ex[nm] || 0) + 1; } });
      return { inFrustumPlainDraws: n, byScreenRadiusPx: B, castersByRadius: C, tinyExamples: Object.entries(ex).sort((a, b) => b[1] - a[1]).slice(0, 15), ppu: +ppu.toFixed(2) }; },
    cullTiny(px) {   // ẩn mesh / nét đang thật sự vẽ (lớp 0) có bán kính màn hình < px — thử nghiệm "cull theo cỡ màn hình"
      const ppu = renderer.domElement.clientHeight / ((camera.top - camera.bottom) / camera.zoom), sp = new THREE.Sphere(); window.__CULLED = []; let shadowOnly = 0;
      scene.traverse(o => { if (!(o.isMesh || o.isLine) || o.isInstancedMesh || o.isSkinnedMesh || !o.visible || !o.layers.test(camera.layers) || (o.geometry && o.geometry.isInstancedBufferGeometry)) return; const g = o.geometry; if (!g) return; if (!g.boundingSphere) g.computeBoundingSphere(); sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld); if (sp.radius * ppu < px) { o.visible = false; window.__CULLED.push(o); } });
      return window.__CULLED.length; },
    uncull() { for (const o of window.__CULLED || []) o.visible = true; window.__CULLED = []; },
    vegList() { const L = []; scene.traverse(o => { if (!o.isInstancedMesh) return; let nm = o.name, q = o; while (!nm && q.parent) { q = q.parent; nm = q.name; } if (nm) return; const g = o.geometry, per = (g.index ? g.index.count : g.attributes.position.count) / 3, m = Array.isArray(o.material) ? o.material[0] : o.material; g.computeBoundingBox && !o.boundingBox && o.computeBoundingBox && o.computeBoundingBox(); const bb = o.boundingBox; L.push([o.count, per, Math.round(o.count * per / 1000) + 'k', m.type.replace('Material', ''), m.color ? '#' + m.color.getHexString() : '', o.castShadow ? 'cast' : '', o.receiveShadow ? 'recv' : '', bb ? [bb.min.x, bb.min.z, bb.max.x, bb.max.z].map(v => Math.round(v)).join(',') : '', (m.userData && Object.keys(m.userData).join('|')) || '', g.attributes.position.count]); }); return L.sort((a, b) => b[0] * b[1] - a[0] * a[1]); },
    vegShadow(on) { scene.traverse(o => { if (!o.isInstancedMesh) return; let nm = o.name, q = o; while (!nm && q.parent) { q = q.parent; nm = q.name; } if (nm) return; if (o.userData.__cs === undefined) o.userData.__cs = o.castShadow; o.castShadow = on ? o.userData.__cs : false; }); },
    vegHide(on) { scene.traverse(o => { if (!o.isInstancedMesh) return; let nm = o.name, q = o; while (!nm && q.parent) { q = q.parent; nm = q.name; } if (nm) return; if (o.userData.__vv === undefined) o.userData.__vv = o.visible; o.visible = on ? o.userData.__vv : false; }); },
    fix() { __dbg.view(target.x, target.y, target.z, theta, phi, camera.zoom); return [theta, phi, camera.zoom]; },
    abInit() { window.__resLock = true; PR0 = renderer.getPixelRatio(); GR = []; scene.traverse(o => { if ((o.isInstancedMesh && o.count > 3000) || (o.geometry && o.geometry.isInstancedBufferGeometry && o.geometry.instanceCount > 3000)) GR.push(o); }); FERN = []; scene.traverse(o => { if (o.isMesh && /Dương xỉ|Fern/.test(o.name || '')) FERN.push(o); }); return { grass: GR.map(o => [o.name, o.isInstancedMesh ? o.count : o.geometry.instanceCount]), fern: FERN.length, matTypes: (() => { const M = {}; scene.traverse(o => { if (!o.isMesh) return; let v = true; for (let p = o; p; p = p.parent) if (!p.visible) { v = false; break; } if (!v) return; const t = (Array.isArray(o.material) ? o.material[0] : o.material).type; M[t] = (M[t] || 0) + 1; }); return M; })() }; },
    ab(v) { setLights(true); setShadow(true); setGrass(true); renderer.setPixelRatio(PR0); if (v === 'lights') setLights(false); if (v === 'shadow') setShadow(false); if (v === 'grass') setGrass(false); if (v === 'pr1') renderer.setPixelRatio(1); if (v === 'lights+pr1') { setLights(false); renderer.setPixelRatio(1); } if (v === 'fern') FERN.forEach(o => o.visible = false); else FERN.forEach(o => o.visible = true); },
    camp(k) { const E = engObj.g.position; __dbg.view(E.x, E.y + 1, E.z, theta, phi, (window.__z0 ??= camera.zoom) * k); },
    start() { Object.assign(P, { on: true, frames: 0, ft: [], calls: 0, tris: 0, renders: 0, cpuRender: 0, gpuNs: 0, gpuN: 0, issued: 0, sm: 0, smN: 0, um: 0, smCalls: 0, smTris: 0 }); P.hooks.clear(); P.dk.clear(); P.dn.clear(); P.sz.clear(); P.tn.clear(); last = 0; requestAnimationFrame(raf); },
    stop() {
      P.on = false; const f = Math.max(1, P.frames), ft = P.ft.slice().sort((a, b) => a - b), q = p => +(ft[Math.floor(p * (ft.length - 1))] || 0).toFixed(1);
      const hooks = [...P.hooks.entries()].map(([k, v]) => [k, +(v / f).toFixed(3)]).sort((a, b) => b[1] - a[1]);
      const hookTot = hooks.reduce((s, h) => s + h[1], 0);
      return { frames: P.frames, fps: +(1000 / (ft.reduce((s, x) => s + x, 0) / Math.max(1, ft.length))).toFixed(1), ms50: q(0.5), ms95: q(0.95), ms99: q(0.99), calls: Math.round(P.calls / f), tris: Math.round(P.tris / f), renders: +(P.renders / f).toFixed(2), cpuRenderMs: +(P.cpuRender / f).toFixed(2), gpuMs: P.gpuN ? +(P.gpuNs / 1e6 / f * (P.issued / P.gpuN)).toFixed(2) : null, gpuQ: [P.issued, P.gpuN], gpuExt: P.ext, hookMs: +hookTot.toFixed(2), triNames: [...P.tn.entries()].map(([k, v]) => [k, Math.round(v / f / 1000)]).sort((a, b) => b[1] - a[1]).slice(0, 40), drawSizes: Object.fromEntries([...P.sz.entries()].map(([k, v]) => [k, Math.round(v / f)]).sort()), drawKinds: Object.fromEntries([...P.dk.entries()].map(([k, v]) => [k, Math.round(v / f)]).sort((a, b) => b[1] - a[1])), drawNames: [...P.dn.entries()].map(([k, v]) => [k, +(v / f).toFixed(1)]).sort((a, b) => b[1] - a[1]).slice(0, 30), shadowPassMs: +(P.sm / f).toFixed(2), shadowCalls: Math.round(P.smCalls / f), shadowTris: Math.round(P.smTris / f), matrixMs: +(P.um / f).toFixed(2), hooks: hooks.slice(0, 25), census: census(), heavy: heavy() };
    }
  };
})();
