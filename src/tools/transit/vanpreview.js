// xem thử transit.bin trong study.html: vanPreview() nạp window.__vanGlb (chưa XOR) → nhóm 'vanNew'; mẫu gốc đặt vào đv xe (lật, chưa kéo dài) → 'vanOld'
window.vanPreview = async (o = {}) => {
  const THREE = S.THREE, { GLTFLoader } = await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js');
  const { MeshoptDecoder } = await import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js');
  const g = await new Promise((res, rej) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(window.__vanGlb.slice().buffer, '', res, rej));
  const COL = { paint: 0xE2D6C0, black: 0x3a3f41, chrome: 0xc9cdd0, glass: 0x8fc1e3, frost: 0xdfe9ec, lens: 0xdde4e6, bulb: 0xf2f6ff, red: 0xb8322a, blue: 0x1f3f7a, steel: 0x9a9d9f,
    tire: 0x2b2925, trim: 0xcfccc4, dash: 0x5d6163, dashTop: 0x46494b, ctrl: 0x3e4244, seat: 0x6f706c, yellow: 0xe8cf3a };
  const op = { glass: 0.35, lens: 0.5, frost: 0.7, paint: o.paintOp ?? 1 };
  g.scene.traverse(m => { if (m.isMesh) { const c = m.material.name; m.material = new THREE.MeshLambertMaterial({ color: COL[c] ?? 0xff00ff, side: THREE.DoubleSide, transparent: (op[c] ?? 1) < 1, opacity: op[c] ?? 1, depthWrite: (op[c] ?? 1) >= 1 }); m.userData.cls = c; } });
  const old = S.scene.getObjectByName('vanNew'); if (old) S.scene.remove(old);
  g.scene.name = 'vanNew'; S.scene.add(g.scene);
  // mẫu gốc → đv xe (lật trái–phải như xe mình, không kéo dài)
  const r = S.root; r.matrixAutoUpdate = false; r.matrix.set(0, 0, -1.1, 0.0272, 0, 1.1, 0, 0.1128, -1.1, 0, 0, 0, 0, 0, 0, 1); r.updateMatrixWorld(true);
  return g.scene.children.map(c => c.name).join(',');
};
// chụp lưới ảnh: views [{ p: [x,y,z], t: [x,y,z], fov, label, show: 'new'|'old' }]
window.vanShots2 = async (name, views, cols = 3, cw = 600, ch = 450) => {
  const THREE = S.THREE, R = S.renderer, cam = S.cam, cv = document.createElement('canvas'), rows = Math.ceil(views.length / cols); cv.width = cols * cw; cv.height = rows * ch; const c = cv.getContext('2d');
  const vn = S.scene.getObjectByName('vanNew'), vo = S.root; R.setSize(cw, ch); cam.aspect = cw / ch;
  for (let k = 0; k < views.length; k++) { const v = views[k];
    if (vn) vn.visible = v.show !== 'old'; vo.visible = v.show === 'old';
    cam.fov = v.fov || 30; cam.near = 0.05; cam.far = 100; cam.position.set(...v.p); cam.up.set(0, 1, 0); cam.lookAt(new THREE.Vector3(...v.t)); cam.updateProjectionMatrix();
    R.render(S.scene, cam); c.drawImage(R.domElement, (k % cols) * cw, Math.floor(k / cols) * ch, cw, ch); c.fillStyle = '#000'; c.font = 'bold 18px sans-serif'; c.fillText(v.label || String(k), (k % cols) * cw + 6, Math.floor(k / cols) * ch + 20); }
  if (vn) vn.visible = true; vo.visible = true;
  const blob = await new Promise(r => cv.toBlob(r, 'image/png')); await fetch('/upload?name=' + name + '.png', { method: 'POST', body: blob }); return name;
};
window.vanpreviewReady = true;
