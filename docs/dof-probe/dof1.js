// thử mờ hậu cảnh kiểu điện ảnh lúc camera bám gấu mèo ×30: (0) không, (1) theo độ sâu thật (CoC = |z − zf|·k, gom đĩa 48 mẫu, scatter-as-gather), (2) tilt-shift theo dải màn hình
simSetup(); const THREE = __dbg.THREE, RB = __ev('raccoonBrain'), B = RB.state, T = __ev('appleTrees')[2], O = __ev('raccoonObj');
const R = __dbg.renderer, orig = R.render, dom = R.domElement, cam = __dbg.camera, scene = __dbg.scene, H = +window.__hourOverride, shots = [];
runFor(3, H);
const tp = T.position; __dbg.view(tp.x, tp.y + 2, tp.z, Math.PI * 0.27, 0.9, 9); __dbg.frames(2);
const r = dom.getBoundingClientRect(), q = new THREE.Vector3(tp.x, tp.y + 4.2, tp.z).project(cam), cx = r.left + (q.x + 1) / 2 * r.width, cy = r.top + (1 - q.y) / 2 * r.height;
const pe = (type, x, y) => dom.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, buttons: type === 'pointerdown' ? 1 : 0, bubbles: true, pointerId: 1, isPrimary: true, pointerType: 'mouse' }));
pe('pointerdown', cx, cy); pe('pointerup', cx, cy); __dbg.frames(1); document.querySelector('#toolPopList button').click();
R.render = () => {}; const dt = __dbg.clock.__dt; let tt = 0, tc = -1;
try { for (; tt < 90; tt += dt) { __dbg.frames(1); if (B.st === 'climb' && tc < 0) tc = tt; if (tc >= 0 && tt - tc > +(window.__dofWait || 34)) break; } } finally { R.render = orig; }
__dbg.frames(3);
const W = dom.width, Hh = dom.height;
const rt = new THREE.WebGLRenderTarget(W, Hh, { samples: 4 }); rt.isXRRenderTarget = true; rt.depthTexture = new THREE.DepthTexture(W, Hh); rt.depthTexture.type = THREE.UnsignedIntType;
R.setRenderTarget(rt); R.setRenderTarget(null); rt.texture.colorSpace = THREE.SRGBColorSpace;
const mat = new THREE.ShaderMaterial({ uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, res: { value: new THREE.Vector2(W, Hh) }, nr: { value: cam.near }, fr: { value: cam.far }, zf: { value: 0 }, rg: { value: +(window.__dofRange || 0.6) }, k: { value: 0 }, maxR: { value: 0 }, mode: { value: 0 }, ty: { value: 0.5 }, band: { value: 0.1 }, k2: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: `uniform sampler2D tC, tD; uniform vec2 res; uniform float rg, nr, fr, zf, k, maxR, mode, ty, band, k2; varying vec2 vUv;
    float vz(vec2 uv){ return nr + texture2D(tD, uv).x * (fr - nr); }
    float coc(vec2 uv, float z){ if (mode < 0.5) return 0.; if (mode < 1.5) return clamp((abs(z - zf) - rg) * k, 0., maxR); return clamp((abs(uv.y - ty) - band) * k2, 0., maxR); }
    void main(){ float zc = vz(vUv), c0 = coc(vUv, zc); vec4 acc = vec4(texture2D(tC, vUv).rgb, 1.);
      if (mode > 0.5) for (int i = 0; i < 64; i++) { float rr = sqrt((float(i) + .5) / 64.) * maxR, a = float(i) * 2.39996; vec2 uv2 = vUv + vec2(cos(a), sin(a)) * rr / res;
        float zs = vz(uv2), cs = coc(uv2, zs); if (zs > zc) cs = min(cs, c0); float w = smoothstep(rr - 1., rr + .5, cs); acc += vec4(texture2D(tC, uv2).rgb * w, w); }
      gl_FragColor = vec4(acc.rgb / acc.a, 1.);
                }`, depthTest: false, depthWrite: false, toneMapped: false });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat), qs = new THREE.Scene(), qc = new THREE.Camera(); quad.frustumCulled = false; qs.add(quad);
const dir = cam.getWorldDirection(new THREE.Vector3()), P = O.getWorldPosition(new THREE.Vector3());
mat.uniforms.zf.value = P.clone().sub(cam.position).dot(dir);
const pxm = Hh * cam.zoom / (cam.top - cam.bottom);   // điểm ảnh / mét trên màn hình
const sp = P.clone().project(cam); mat.uniforms.ty.value = (sp.y + 1) / 2;
const shot = (nm, mode, kPerM, maxF) => { mat.uniforms.mode.value = mode; mat.uniforms.k.value = kPerM; mat.uniforms.maxR.value = maxF * Hh; mat.uniforms.k2.value = Hh * 0.08;
  const bg = scene.background; scene.background = bg.clone().convertLinearToSRGB(); R.setRenderTarget(rt); orig.call(R, scene, cam); R.setRenderTarget(null); scene.background = bg; orig.call(R, qs, qc); shots.push([nm, dom.toDataURL('image/png')]); };
const K = 0.010 * Hh;   // 1 m lệch tiêu cự ⇒ 1% chiều cao khung
orig.call(R, scene, cam); shots.push(['d_direct.png', dom.toDataURL('image/png')]); shot('d0_none.png', 0, 0, 0.02); shot('d1_depth.png', 1, K, 0.016); shot('d2_depth_strong.png', 1, K * 2, 0.022); shot('d3_tilt.png', 2, 0, 0.016);
return { tm: R.toneMapping, cs: R.outputColorSpace, fog: !!scene.fog, alpha: R.getClearAlpha(), st: B.st, zoom: cam.zoom, zf: mat.uniforms.zf.value, pxm, W, Hh, rev: THREE.REVISION, shots };
