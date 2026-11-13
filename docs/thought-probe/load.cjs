// nạp lõi WXN (src/app/engineer/mind/weather-notice.js) trong node:vm — phần nối vào cảnh ở cuối tệp không chạy tới
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const SRC = path.join(__dirname, '..', '..', 'src', 'app', 'engineer', 'mind', 'weather-notice.js');
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function load() {
  const code = fs.readFileSync(SRC, 'utf8').split('// ---- nối vào cảnh ----')[0];
  const ctx = vm.createContext({ Math, Number, Object, Set });
  vm.runInContext(code + '\nthis.WXN = WXN;', ctx);
  return ctx.WXN;
}
// số đo mẫu: trưa quang ở cao nguyên, mọi thứ ở mức thường
const base = o => Object.assign({ now: 0, h: 12.5, sun: 60, out: true, sunlit: true, rain: false, temp: 24, wind: 10, gust: 14, dir: 45, cloud: 30, rh: 65, rad: 600, hotK: 0, coldK: 0 }, o);
module.exports = { load, rng, base };
