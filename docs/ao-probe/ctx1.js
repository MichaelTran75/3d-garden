// mất ngữ cảnh WebGL rồi có lại: lưới nào còn hiện mà mảng đã bỏ (three không tải lại được ⇒ lỗi byteLength)
simSetup(); const R = __dbg.renderer, gl = R.getContext(), S = __ev('scene'), out = {};
runFor(2, +window.__hourOverride);
const ext = gl.getExtension('WEBGL_lose_context');
ext.loseContext(); await new Promise(r => setTimeout(r, 100)); out.lost = gl.isContextLost();
ext.restoreContext(); let w = 0; while (gl.isContextLost() && w < 50) { await new Promise(r => setTimeout(r, 50)); w++; } await new Promise(r => setTimeout(r, 100));
const bad = new Map();
S.traverse(o => { const g = o.geometry; if (!g || !g.attributes) return; let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
  const freed = [...Object.entries(g.attributes), ['index', g.index]].filter(([k, a]) => a && a.array === null).map(([k]) => k);
  if (freed.length) { const k = (o.name || (o.parent && o.parent.name) || o.type) + (vis ? '' : ' (ẩn)') + ' · lớp ' + o.layers.mask; const e = bad.get(k) || [0, freed.join(',')]; e[0]++; bad.set(k, e); } });
out.bad = [...bad.entries()].slice(0, 40); out.n = bad.size; return out;
