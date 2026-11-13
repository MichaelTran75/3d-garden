// node --test docs/physics-probe/unit.cjs — vật lý dùng chung chạy ngoài trình duyệt: core/gravity.js + core/fixed-step.js + worldRun (core/world.js)
// trong node:vm, THREE tối giản, địa hình giả (đất phẳng / dốc / bậc bàn / vách / hồ). Va chạm thật của cảnh: drop.cjs.
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), { test } = require('node:test');
const SRC = path.join(__dirname, '..', '..', 'src', 'app', 'core'), read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(a) { this.x = a.x; this.y = a.y; this.z = a.z; return this; }
  length() { return Math.hypot(this.x, this.y, this.z); }
  multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  lerpVectors(a, b, t) { this.x = a.x + (b.x - a.x) * t; this.y = a.y + (b.y - a.y) * t; this.z = a.z + (b.z - a.z) * t; return this; }
}
class Quaternion {
  constructor() { this.x = 0; this.y = 0; this.z = 0; this.w = 1; }
  copy(q) { this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w; return this; }
  setFromAxisAngle(a, t) { const s = Math.sin(t / 2); this.x = a.x * s; this.y = a.y * s; this.z = a.z * s; this.w = Math.cos(t / 2); return this; }
  premultiply(a) { const b = this, ax = a.x, ay = a.y, az = a.z, aw = a.w, bx = b.x, by = b.y, bz = b.z, bw = b.w;
    this.x = ax * bw + aw * bx + ay * bz - az * by; this.y = ay * bw + aw * by + az * bx - ax * bz; this.z = az * bw + aw * bz + ax * by - ay * bx; this.w = aw * bw - ax * bx - ay * by - az * bz; return this; }
  normalize() { const l = Math.hypot(this.x, this.y, this.z, this.w) || 1; this.x /= l; this.y /= l; this.z /= l; this.w /= l; return this; }
  slerpQuaternions(a, b, t) { return this.copy(t < 0.5 ? a : b); }
}
function world(W = {}) {   // W: { ground(x, z), blocks: [{ x0, x1, z0, z1, y0, y1 }], water(i, j) → ô nước?, waterY }
  const ground = W.ground || (() => 0), blocks = W.blocks || [], water = W.water || (() => false), rings = [];
  const inB = (b, x, z) => x >= b.x0 && x < b.x1 && z >= b.z0 && z < b.z1;
  const ctx = vm.createContext({ Math, Number, Object, THREE: { Vector3, Quaternion }, COL: { ready: true, C: 0.125 },
    cowY: ground, colBit: () => 1, x2gi: x => x, z2gj: z => z, rings,
    colRestY(x, z, ref, up) { let y = ground(x, z); for (const b of blocks) if (inB(b, x, z) && b.y1 > y && b.y1 <= ref + up) y = b.y1; return y; },
    colSub(mask, x, z, y0, y1) { for (const b of blocks) if (inB(b, x, z) && y1 > b.y0 && y0 < b.y1) return 0xffff; return 0; },
    isWater: (i, j) => water(i, j), waterSurfaceY: () => W.waterY, waterFx: { ring: (x, y, z, s) => rings.push({ x, y, z, s }) } });
  vm.runInContext(read('fixed-step.js') + '\n' + read('gravity.js') + '\nthis.api = { GRAV, fallStep, launchV, hopLift, looseBody, looseStep, looseTick, PHYS_H, fixedSteps };', ctx);
  return Object.assign(ctx.api, { rings, ctx });
}
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg || ''} ${a} vs ${b} (±${tol})`);
function run(P, B, dt, secs, each) {   // chạy looseTick ở nhịp khung dt · each(t, obj) sau mỗi khung
  const obj = { position: new Vector3(), quaternion: new Quaternion() }, n = Math.round(secs / dt);
  for (let i = 1; i <= n; i++) { P.looseTick(B, dt, obj); each && each(i * dt, obj); }
  return obj;
}
const drop = (P, x, y, z, vx = 0, vy = 0, vz = 0, o) => { const B = P.looseBody(0.03, o); B.p.set(x, y, z); B.p0.copy(B.p); B.v.set(vx, vy, vz); return B; };

test('fallStep: không cản — đúng nghiệm ở mọi cỡ bước', () => {
  const P = world(), g = P.GRAV, T = 0.7;
  for (const n of [1, 7, 14, 42, 101]) {
    const p = new Vector3(1, 2, -3), v = new Vector3(1.5, 3, -0.5); for (let i = 0; i < n; i++) P.fallStep(p, v, T / n);
    near(p.x, 1 + 1.5 * T, 1e-9); near(p.z, -3 - 0.5 * T, 1e-9); near(p.y, 2 + 3 * T - 0.5 * g * T * T, 1e-9, `y, ${n} bước`); near(v.y, 3 - g * T, 1e-9);
  }
});
test('fallStep: có cản — đúng nghiệm, tới vận tốc tới hạn g / drag', () => {
  const P = world(), g = P.GRAV, k = 2.6, T = 0.9, vt = g / k;
  for (const n of [1, 9, 54, 130]) {
    const p = new Vector3(0, 1, 0), v = new Vector3(2, 1.2, 0); for (let i = 0; i < n; i++) P.fallStep(p, v, T / n, k);
    const e = Math.exp(-k * T);
    near(p.x, 2 * (1 - e) / k, 1e-9); near(v.x, 2 * e, 1e-9); near(v.y, (1.2 + vt) * e - vt, 1e-9); near(p.y, 1 + (1.2 + vt) * (1 - e) / k - vt * T, 1e-9, `y, ${n} bước`);
  }
  const p = new Vector3(), v = new Vector3(); for (let i = 0; i < 600; i++) P.fallStep(p, v, 1 / 60, k); near(v.y, -vt, 1e-6, 'vận tốc tới hạn');
});
test('launchV + fallStep: ném T giây thì tới đúng đích ở 15 / 60 / 144 khung/giây', () => {
  const P = world(), from = new Vector3(0.4, 1.1, -2), to = new Vector3(2.3, 0.6, -0.4), T = 0.7;
  for (const fps of [15, 20, 60, 144]) {
    const p = new Vector3().copy(from), v = P.launchV(from, to, T, new Vector3()); let t = 0;
    while (t < T - 1e-12) { const h = Math.min(1 / fps, T - t); P.fallStep(p, v, h); t += h; }
    near(p.x, to.x, 1e-9); near(p.y, to.y, 1e-9, `y @${fps}`); near(p.z, to.z, 1e-9);
  }
  near(P.hopLift(0.5, 0.4), P.GRAV * 0.16 / 8, 1e-12, 'đỉnh cú nhảy');
});
test('vật rời trên đất phẳng: nảy thấp dần, lăn, nằm yên đúng trên mặt', () => {
  const P = world(), B = drop(P, 0, 2, 0, 1, 0, 0.3), g = P.GRAV;
  let E0 = Infinity, apex = [], up = false, top = 0, minY = Infinity;
  for (let i = 0; i < 12 * 120 && !B.rest; i++) {
    B.p0.copy(B.p); P.looseStep(B, P.PHYS_H); minY = Math.min(minY, B.p.y - B.r);
    const E = g * (B.p.y - B.r) + 0.5 * (B.v.x ** 2 + B.v.y ** 2 + B.v.z ** 2); assert.ok(E <= E0 + 1e-6, `năng lượng không tăng (bước ${i}: ${E0} → ${E})`); E0 = E;
    if (B.v.y > 0) { up = true; top = Math.max(top, B.p.y - B.r); } else if (up) { apex.push(top); up = false; top = 0; }
  }
  assert.ok(B.rest, 'nằm yên trong 12 s'); assert.ok(B.hits >= 2, `nảy ≥ 2 lần (${B.hits})`); near(B.p.y, B.r, 1e-9, 'tâm cách mặt đúng r'); assert.ok(minY >= -1e-9, 'không lún dưới mặt');
  near(apex[0], 2 * B.e * B.e, 0.01, 'đỉnh nảy 1 = e² × độ cao thả'); for (let i = 1; i < apex.length; i++) assert.ok(apex[i] < apex[i - 1], 'đỉnh nảy giảm dần');
  assert.ok(B.p.x > 0.6 && B.p.x < 3, `đi tới theo hướng ném (${B.p.x.toFixed(2)} m)`); assert.equal(B.v.length(), 0);
});
test('looseTick: cùng chỗ nằm và cùng quỹ đạo ở 20 / 60 / 144 khung/giây', () => {
  const res = [20, 60, 144].map(fps => { const P = world(), B = drop(P, 0, 1.6, 0, 0.8, 0.4, -0.5); const at = {};
    const obj = run(P, B, 1 / fps, 8, (t, o) => { for (const m of [0.25, 0.5, 1]) if (Math.abs(t - m) < 1e-9) at[m] = { ...o.position }; }); return { B, at, obj }; });
  for (const r of res) { assert.ok(r.B.rest); for (const a of 'xyz') { near(r.B.p[a], res[0].B.p[a], 1e-9, `chỗ nằm ${a}`); near(r.obj.position[a], r.B.p[a], 0, 'vật vẽ = chỗ nằm'); }
    for (const m of [0.25, 0.5, 1]) for (const a of 'xyz') near(r.at[m][a], res[1].at[m][a], 0.004, `vị trí vẽ lúc ${m} s (${a})`); }
});
test('dốc: thoải thì nằm lại, dốc hơn ngưỡng cản lăn thì lăn xuống', () => {
  for (const [slope, rolls] of [[0.05, false], [0.35, true]]) {
    const P = world({ ground: x => slope * x }), B = drop(P, 0, 0.04, 0);
    run(P, B, 1 / 60, 3);
    if (rolls) { assert.ok(!B.rest && B.p.x < -0.5, `dốc ${slope}: lăn xuống (${B.p.x.toFixed(2)})`); near(B.p.y - B.r, slope * B.p.x, 1e-6, 'bám mặt dốc'); const a = (5 / 7 * slope - B.rr) * P.GRAV; near(-B.v.x, a * (B.age - 0.09), 0.25 * a * B.age, 'gia tốc lăn'); }
    else assert.ok(B.rest && Math.abs(B.p.x) < 0.02, `dốc ${slope}: nằm lại`);
  }
});
test('vách + bậc: dội lại, không chui vào khối · lăn hết mép bàn thì rơi xuống đất', () => {
  let P = world({ blocks: [{ x0: 1, x1: 2, z0: -5, z1: 5, y0: 0, y1: 1 }] }), B = drop(P, 0, 0.5, 0, 3, 0, 0.4), maxX = -1e9, back = false;
  run(P, B, 1 / 60, 10, () => { maxX = Math.max(maxX, B.p.x); if (B.v.x < 0) back = true; });
  assert.ok(maxX < 1, `không vào vách (${maxX})`); assert.ok(back, 'dội lại'); assert.ok(B.rest); near(B.p.y, B.r, 1e-9);
  P = world({ blocks: [{ x0: -0.5, x1: 0.5, z0: -0.5, z1: 0.5, y0: 0, y1: 0.75 }] }); B = drop(P, 0, 1.2, 0, 0.9, 0, 0); let onTop = false, inside = false;
  run(P, B, 1 / 60, 10, () => { const b = B.p.y - B.r; if (Math.abs(B.p.x) < 0.5) { if (Math.abs(b - 0.75) < 1e-6) onTop = true; if (b < 0.75 - 1e-6) inside = true; } });
  assert.ok(onTop, 'đáp lên mặt bàn'); assert.ok(!inside, 'không lọt vào trong bàn'); assert.ok(B.rest && B.p.x > 0.5, `rơi khỏi mép (${B.p.x.toFixed(2)})`); near(B.p.y, B.r, 1e-9);
});
test('trần: ném lên dưới 1 tấm đặc thì dội xuống, không chui qua', () => {
  const P = world({ blocks: [{ x0: -1, x1: 1, z0: -1, z1: 1, y0: 1, y1: 1.2 }] }), B = drop(P, 0, 0.5, 0, 0.2, 5, 0); let top = -9, inside = false;
  run(P, B, 1 / 60, 6, () => { const t = B.p.y + B.r; top = Math.max(top, t); if (Math.abs(B.p.x) < 1 && t > 1 + 1e-9 && B.p.y - B.r < 1.2) inside = true; });
  assert.ok(top <= 1 + 1e-9, `đỉnh thân không vượt đáy tấm (${top})`); assert.ok(!inside, 'không nằm trong tấm'); assert.ok(B.rest); near(B.p.y, B.r, 1e-9, 'nằm lại trên đất');
  const Q = world(), C = drop(Q, 0, 0.5, 0, 0.2, 5, 0); let free = -9; run(Q, C, 1 / 60, 6, () => { free = Math.max(free, C.p.y + C.r); }); assert.ok(free > 1.5, `không có tấm thì bay cao hơn (${free.toFixed(2)})`);
});
test('nước: toé 1 lần rồi nổi, không nằm yên, không lên bờ', () => {
  const P = world({ ground: x => Math.round(x) < 0 ? -0.5 : 0, water: i => i < 0, waterY: -0.1 }), B = drop(P, -2, 0.8, 0, 1.5, 0, 0);
  run(P, B, 1 / 60, 6);
  assert.ok(B.wet && !B.rest, 'nổi'); assert.equal(P.rings.length, 1); near(P.rings[0].y, -0.1, 1e-9); near(B.p.y, -0.1 - 0.2 * B.r, 2e-3, 'nổi: tâm dưới mặt nước 0,2 r');
  B.v.x = 3; let maxX = -9; run(P, B, 1 / 60, 4, () => { maxX = Math.max(maxX, B.p.x); }); assert.ok(maxX < -0.5, `không lên bờ (${maxX})`); near(B.p.y, -0.1 - 0.2 * B.r, 2e-3);
});
test('số hỏng: tự nằm lại chỗ cũ', () => {
  const P = world(), B = drop(P, 0, 1, 0); run(P, B, 1 / 60, 0.1); B.v.x = NaN; run(P, B, 1 / 60, 0.1);
  assert.ok(B.rest && Number.isFinite(B.p.x + B.p.y + B.p.z) && B.v.length() === 0);
});
test('worldRun: 1 phần hỏng không chặn phần khác, lỗi báo đúng 1 lần', () => {
  const src = read('world.js'), pick = n => src.match(new RegExp('^\\s*function ' + n + '\\([\\s\\S]*?\\n(?=\\s*function |\\s*//)', 'm'))[0], thrown = [];
  const ctx = vm.createContext({ Map, queueMicrotask: fn => { try { fn(); } catch (e) { thrown.push(e); } } });
  vm.runInContext('const WORLD_TICKS = new Map();\n' + pick('worldHook') + pick('worldTick') + pick('worldRun') + '\nthis.api = { worldTick, worldRun };', ctx);
  const seen = []; ctx.api.worldTick('s', 10, () => seen.push('a')); ctx.api.worldTick('s', 20, () => { throw new Error('hỏng'); }); ctx.api.worldTick('s', 30, dt => seen.push('c' + dt));
  for (let i = 0; i < 5; i++) ctx.api.worldRun('s', 2, 0);
  assert.equal(seen.join(''), 'ac2'.repeat(5)); assert.equal(thrown.length, 1); assert.equal(thrown[0].message, 'hỏng'); ctx.api.worldRun('none', 1, 0);
});

// —— Nước (nature/fluids.js): nhân chạy trong Worker ⇒ thử trong ngữ cảnh chỉ có tên được chèn vào Blob (GRAV)
function kernel(extra) {
  const src = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'app', 'nature', 'fluids.js'), 'utf8').split('\n');
  const a = src.findIndex(l => /^\s*function fluidKernel\(\)/.test(l)), ind = src[a].match(/^\s*/)[0]; let b = a + 1; while (src[b] !== ind + '}') b++;
  return vm.runInContext('(' + src.slice(a, b + 1).join('\n') + ')()', vm.createContext(Object.assign({ GRAV: 9.81, performance }, extra)));
}
function pond(nx, nz, edge) {   // edge: ô nước nằm cả trên hàng / cột biên của lưới (sông ra khỏi bản đồ)
  const N = nx * nz, mask = new Uint8Array(N), kind = new Uint8Array(N), faces = [], speeds = [], e = edge ? 0 : 1;
  for (let j = e; j < nz - e; j++) for (let i = e; i < nx - e; i++) mask[j * nx + i] = 1;
  if (edge) for (let i = 0; i < nx; i++) { kind[(nz - 1) * nx + i] = 1; if (Math.abs(i - (nx >> 1)) < 3) { kind[i] = 2; faces.push(nx + i); speeds.push(2.2); } }
  const target = new Float32Array(N); if (edge) for (let i = 0; i < nx; i++) if (kind[i] === 2) target[i] = 0.1;
  return { nx, nz, dx: 0.6, mask, kind, bed: new Float32Array(N).fill(-1), target, rest: new Float32Array(N), jets: { faces, speeds }, u0: null, v0: null, x0: 0, z0: 0 };
}
function flow(K, steps, imp, extra) {
  let out = null;
  for (let s = 0; s < steps; s++) {
    const im = imp && imp(s), r = K.handle(Object.assign({ t: 'step', dt: 1 / 60, time: s / 60, wind: [0, 0], wind2: [1, 0], imp: im ? Float32Array.from(im.flat()) : new Float32Array(4), nImp: im ? im.length : 0, bufs: { water: null } }, extra));
    if (r && r.msg && r.msg.water) out = new Uint16Array(r.msg.water);
  }
  return out;
}
const half = h => { const s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 31, f = h & 1023; return e === 31 ? (f ? NaN : s * Infinity) : e === 0 ? s * f * 2 ** -24 : s * (1 + f / 1024) * 2 ** (e - 15); };
test('nước: nhân chỉ đọc tên có trong Blob (GRAV), thiếu thì dừng ngay', () => {
  const K = kernel(), g = pond(21, 21); K.handle({ t: 'water', warm: 0, grid: g }); assert.ok(flow(K, 30));
  assert.throws(() => { const B = kernel({ GRAV: undefined }); B.handle({ t: 'water', warm: 0, grid: pond(21, 21) }); const o = flow(B, 30); for (let c = 0; c < o.length; c++) if (!Number.isFinite(half(o[c]))) throw new Error('hỏng'); });
});
test('nước: cú chạm giữ thể tích (hố + gờ), 10 s sau vẫn giữ', () => {
  const K = kernel(), g = pond(61, 61); K.handle({ t: 'water', warm: 0, grid: g });
  const vol = o => { let s = 0; for (let c = 0; c < g.mask.length; c++) if (g.mask[c]) s += half(o[c * 4]); return s * 1000; };
  const a = vol(flow(K, 1, () => [[30.5, 30.5, 1.5, 0.05]])), b = vol(flow(K, 600));
  assert.ok(Math.abs(a) < 1, 'ngay sau chạm ' + a); assert.ok(Math.abs(b) < 1, '10 s sau ' + b);
});
test('nước: sông chạm hàng / cột biên lưới, có cửa xả + lũ: mọi ô hữu hạn', () => {
  const K = kernel(), g = pond(31, 81, true); K.handle({ t: 'water', warm: 0, grid: g });
  const o = flow(K, 900, s => s % 20 ? null : [[15, 40, 1.2, 0.03]], { flood: 1 }); let bad = 0, top = 0;
  for (let c = 0; c < o.length; c++) { const v = half(o[c]); if (!Number.isFinite(v)) bad++; else if (Math.abs(v) > top) top = Math.abs(v); }
  assert.equal(bad, 0); assert.ok(top < 20, 'trị lớn nhất ' + top);
});
