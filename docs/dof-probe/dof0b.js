simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, cam = __dbg.camera, scene = __dbg.scene, out = {};
runFor(2, +window.__hourOverride); __dbg.view(100, 3, 103, Math.PI * 0.27, 0.9, 9); __dbg.frames(2);
const W = dom.width, H = dom.height, gl = R.getContext();
const rd = () => { const o = []; for (const [x, y] of [[0.5, 0.5], [0.2, 0.3], [0.8, 0.7]]) { const p = new Uint8Array(4); gl.readPixels(W * x | 0, H * y | 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); o.push([...p].join(',')); } return o.join(' | '); };
R.render(scene, cam); out.direct = rd();
const mk = (tm, cs) => new THREE.ShaderMaterial({ uniforms: { tC: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
  fragmentShader: 'uniform sampler2D tC; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tC, vUv); \n' + (tm ? '#include <tonemapping_fragment>\n' : '') + (cs ? '#include <colorspace_fragment>\n' : '') + ' }', depthTest: false, depthWrite: false, toneMapped: tm });
const qs = new THREE.Scene(), qc = new THREE.Camera(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); quad.frustumCulled = false; qs.add(quad);
{ const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 }); rt.isXRRenderTarget = true; rt.depthTexture = new THREE.DepthTexture(W, H); rt.depthTexture.type = THREE.UnsignedIntType;
  R.setRenderTarget(rt); R.setRenderTarget(null); rt.texture.colorSpace = THREE.SRGBColorSpace;   // định dạng cấp lúc khởi tạo (RGBA8 cả renderbuffer MSAA lẫn texture) ⇒ đổi colorSpace sau: shader mã hoá sRGB, định dạng vẫn khớp
  quad.material = mk(0, 0); const bg = scene.background, bgL = bg.clone(); bgL.setRGB(bg.r, bg.g, bg.b, THREE.LinearSRGBColorSpace); const c = scene.background.clone().convertLinearToSRGB(); scene.background = c;
  R.setRenderTarget(rt); R.render(scene, cam); R.setRenderTarget(null); scene.background = bg; quad.material.uniforms.tC.value = rt.texture; R.render(qs, qc); out.s4xr_late = rd() + ' e' + gl.getError(); }
return out;
