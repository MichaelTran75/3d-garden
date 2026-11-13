// node docs/thought-probe/sample.cjs [hạt] — in câu mẫu của từng kịch bản thời tiết × việc để đọc bằng mắt
const { load, rng, base } = require('./load.cjs');
const S = [
  ['trưa nắng gắt, nóng, lặng gió', { temp: 33, wind: 3, rad: 880, cloud: 5, rh: 55 }],
  ['trưa nắng to mà mát', { temp: 22, wind: 12, rad: 850, cloud: 8, rh: 50 }],
  ['sáng lạnh có gió', { h: 7, sun: 15, temp: 12, wind: 22, dir: 45, rad: 180, cloud: 20, rh: 70 }],
  ['chiều gió mạnh giật', { h: 15, sun: 35, temp: 25, wind: 34, gust: 58, dir: 60, rad: 420, cloud: 55, w1: 18 }],
  ['mây kéo tới', { h: 14, sun: 48, temp: 27, wind: 16, rad: 160, cloud: 88, c1: 35, w1: 5 }],
  ['âm u, ẩm', { h: 10, sun: 45, temp: 21, wind: 6, rad: 110, cloud: 100, rh: 90 }],
  ['hanh khô có gió', { h: 13, sun: 55, temp: 27, wind: 20, rad: 700, cloud: 15, rh: 30 }],
  ['oi nồm', { h: 14, sun: 50, temp: 31, wind: 7, rad: 500, cloud: 60, rh: 78 }],
  ['đêm quang lặng gió', { h: 21, sun: -40, sunlit: false, temp: 17, wind: 3, rad: 0, cloud: 5, rh: 80 }],
  ['đêm sương', { h: 4.5, sun: -15, sunlit: false, temp: 15, wind: 2, rad: 0, cloud: 40, rh: 97 }],
  ['chiều tà nắng xiên', { h: 17, sun: 8, temp: 23, wind: 9, rad: 120, cloud: 10, rh: 60, sunR: 14 }],
  ['ngày thường (không gì nổi bật)', {}]
];
const ACTS = ['fish', 'tea', 'wander', 'trim', 'check', 'research'];
const seed = +process.argv[2] || 1, rnd = rng(seed);
for (const [name, o] of S) {
  console.log('\n## ' + name);
  for (const act of ACTS) {
    const W = load(), ob = base(o), P = W.plan(ob, act), r = W.say(P, { rnd, station: act === 'check', min: act === 'check' ? 0.3 : 0.55 });
    console.log('  ' + act.padEnd(9) + (r ? r.text + '  [' + r.picks.map(p => p.k + ':' + p.lv + ':' + p.st).join(' + ') + ' · ' + r.text.length + ']' : '— (nổi bật nhất ' + (P[0] ? P[0].k + ' ' + P[0].s.toFixed(2) : 'không') + ')'));
  }
}
