// cột điện + cây: vị trí, chiều cao (hộp bao) ⇒ chọn góc nhìn có cột đứng TRƯỚC cây
simSetup(); const THREE = __ev('THREE'), sc = __ev('scene'), out = { poles: [], trees: [] }, B = new THREE.Box3();
runFor(2, 10);
sc.traverse(o => {
  const n = o.name || '';
  if (/^Cột điện #/.test(n)) { B.setFromObject(o); out.poles.push({ n, x: +o.position.x.toFixed(1), z: +o.position.z.toFixed(1), y0: +B.min.y.toFixed(1), y1: +B.max.y.toFixed(1) }); }
  else if (/tree|Tree|Cây|cây|anh đào|cổ thụ/i.test(n) && o.parent === sc) { B.setFromObject(o); if (B.isEmpty()) return; const c = B.getCenter(new THREE.Vector3()); out.trees.push({ n: n.slice(0, 40), x: +c.x.toFixed(1), z: +c.z.toFixed(1), y0: +B.min.y.toFixed(1), y1: +B.max.y.toFixed(1), r: +((B.max.x - B.min.x + B.max.z - B.min.z) / 4).toFixed(1) }); }
});
const at = __ev('appleTrees'); out.apple = at.map(t => ({ x: +t.position.x.toFixed(1), y: +t.position.y.toFixed(1), z: +t.position.z.toFixed(1) }));
return out;
