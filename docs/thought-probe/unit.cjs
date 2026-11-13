// node --test docs/thought-probe/unit.cjs — lõi nhận xét thời tiết (WXN) chạy ngoài trình duyệt
const assert = require('node:assert/strict'), { test } = require('node:test'), { load, rng, base } = require('./load.cjs');
const ACTS = ['fish', 'tea', 'read', 'wander', 'walk', 'explore', 'trim', 'garden', 'apple', 'check', 'research', 'general', 'stars', 'breakfast', 'study', 'cook'];
const MIN = 60000;
const say = (W, o, act, rnd, opt) => W.say(W.plan(o, act), Object.assign({ rnd }, opt));
test('quét ngẫu nhiên: câu trọn vẹn, không sót ngoặc nhọn, không quá dài', () => {
  const rnd = rng(7); let n = 0, long = 0;
  for (let i = 0; i < 6000; i++) {
    const W = load.W || (load.W = load()); W.reset();
    const night = rnd() < 0.3, sun = night ? -10 - rnd() * 50 : 2 + rnd() * 75, miss = rnd() < 0.15;
    const o = base({ h: night ? 20 + rnd() * 8 : 6 + rnd() * 12, sun, out: rnd() < 0.8, sunlit: rnd() < 0.6, rain: rnd() < 0.1, temp: 4 + rnd() * 34, wind: rnd() * 60, gust: miss ? null : rnd() * 90, dir: miss ? null : rnd() * 360,
      cloud: miss && rnd() < 0.5 ? null : rnd() * 100, rh: miss && rnd() < 0.5 ? null : 20 + rnd() * 80, rad: night ? 0 : rnd() * 1000, t2: rnd() < 0.5 ? 4 + rnd() * 34 : null, w1: rnd() < 0.5 ? rnd() * 60 : null, c1: rnd() < 0.5 ? rnd() * 100 : null,
      tm: rnd() < 0.5 ? 4 + rnd() * 34 : null, hotK: rnd() < 0.2 ? 1 : 0, coldK: rnd() < 0.1 ? 1 : 0 });
    o.h %= 24;
    const act = ACTS[Math.floor(rnd() * ACTS.length)], r = say(W, o, act, rnd, { station: act === 'check', min: 0.3 });
    if (!r) continue; n++;
    const t = r.text;
    assert.ok(!/[{}]|undefined|NaN|null|Infinity/.test(t), t);
    assert.ok(/^[A-ZÀ-Ỹ0-9]/.test(t) && t.endsWith('.'), t);
    assert.ok(!/ ,|,,|\.\.| {2}/.test(t), t);
    assert.ok(t.length <= 118, t.length + ' ' + t); if (t.length > 105) long++;
    assert.ok(r.picks.length >= 1 && r.picks.length <= 2);
  }
  assert.ok(n > 3000, 'số câu ' + n);
});
test('ngày thường: uống trà / đi dạo không nói gì về thời tiết', () => {
  const W = load(), rnd = rng(1);
  for (const act of ['tea', 'wander', 'trim', 'read']) assert.equal(say(W, base({}), act, rnd), null, act);
});
test('trong xe: chỉ nhiệt + gió mạnh', () => {
  const W = load(), rnd = rng(2);
  assert.equal(say(W, base({ out: false, sunlit: false, rad: 900, cloud: 0, rh: 30 }), 'breakfast', rnd), null);
  const r = say(W, base({ out: false, sunlit: false, wind: 45, gust: 70 }), 'cook', rnd);
  assert.equal(r.picks[0].k, 'wind');
});
test('độ quen: nói rồi thì im, lâu sau nhắc kiểu "vẫn", đổi mức thì nói kiểu tăng / giảm', () => {
  const W = load(), rnd = rng(3), hot = { temp: 33, wind: 12, rad: 500, cloud: 30, rh: 55, sunlit: false };
  const a = say(W, base(hot), 'tea', rnd); assert.equal(a.picks[0].k, 'temp'); assert.equal(a.picks[0].st, 'new');
  const P1 = W.plan(base({ ...hot, now: 10 * MIN }), 'tea'); assert.ok(!P1.find(p => p.k === 'temp'), 'sau 10 phút còn nhắc nhiệt');
  const P2 = W.plan(base({ ...hot, now: 80 * MIN }), 'tea'), t2 = P2.find(p => p.k === 'temp'); assert.equal(t2.st, 'still'); assert.ok(t2.s > 0.5 && t2.s < 1.2);
  const b = W.say(W.plan(base({ ...hot, now: 80 * MIN }), 'tea'), { rnd, min: 0.3 }); assert.match(b.text, /[Vv]ẫn|chưa|mãi/);
  const P3 = W.plan(base({ ...hot, temp: 28, now: 100 * MIN }), 'tea'), t3 = P3.find(p => p.k === 'temp'); assert.equal(t3.st, 'down'); assert.equal(t3.lv, 'am');
  const c = W.say(P3, { rnd }); assert.match(c.text, /[Bb]ớt|[Đđ]ỡ|còn/);
});
test('câu cặp: lạnh + gió ra cảm giác; nắng to + trời mát; mây kéo tới + gió nổi', () => {
  const rnd = rng(4);
  assert.match(say(load(), base({ h: 7, sun: 15, temp: 12, wind: 22, rad: 180, cloud: 20, rh: 70 }), 'wander', rnd).text, /cảm giác|lạnh như/);
  assert.match(say(load(), base({ temp: 22, wind: 12, rad: 850, cloud: 8, rh: 50 }), 'tea', rnd).text, /mát/);
  assert.match(say(load(), base({ h: 14, sun: 48, temp: 27, wind: 16, rad: 160, cloud: 88, c1: 35, w1: 5 }), 'wander', rnd).text, /mưa/);
});
test('thiếu số đo: không lỗi', () => {
  const W = load(), rnd = rng(5);
  for (const act of ACTS) { W.reset(); const r = say(W, { now: 0, h: 12, sun: 50, out: true, sunlit: true, temp: 33, wind: null, gust: null, dir: null, cloud: null, rh: null, rad: null }, act, rnd, { min: 0.3 }); if (r) assert.ok(!/[{}]|NaN|undefined/.test(r.text), r.text); }
});
test('số suy ra: điểm sương, pin, tua-bin trong khoảng hợp lý', () => {
  const W = load(), d = W.derive(base({ temp: 30, rh: 60, rad: 1000, wind: 43 }));
  assert.ok(Math.abs(d.dew - 21.4) < 0.5, 'điểm sương ' + d.dew); assert.ok(Math.abs(d.cell - 61.25) < 0.01); assert.ok(Math.abs(d.pv - 85.5) < 0.1, 'pin ' + d.pv); assert.equal(d.tb, 100);
  assert.equal(W.derive(base({ wind: 11 })).tb, 0);
});
