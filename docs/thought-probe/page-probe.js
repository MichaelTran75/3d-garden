// thân hàm đầu dò (page.cjs): khoá thời tiết theo kịch bản, đọc nhận xét của kỹ sư trong trang thật
simSetup();
const E = __ev, eng = __dbg.engObj, out = { scen: [], seq: [] }, shots = [];
const day = new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10), pad = n => String(n).padStart(2, '0');
const mk = (h, c) => {
  const hh = Math.floor(h), time = [], fill = (v, a) => time.map((_, i) => a && a[i - hh] !== undefined ? a[i - hh] : v);
  for (let d = 0; d < 2; d++) for (let k = 0; k < 24; k++) time.push(new Date(Date.parse(day + 'T00:00:00Z') + d * 86400000).toISOString().slice(0, 10) + 'T' + pad(k) + ':00');
  return { utc_offset_seconds: 25200, current: { time: day + 'T' + pad(hh) + ':15', cloud_cover: c.cloud, relative_humidity_2m: c.rh, weather_code: 1, temperature_2m: c.temp, wind_speed_10m: c.wind },
    current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
    hourly: { time, shortwave_radiation: fill(c.rad), uv_index: fill(5), temperature_2m: fill(c.temp, { '-2': c.t2 ?? c.temp, 24: c.tm ?? c.temp }), wind_speed_10m: fill(c.wind, { '-1': c.w1 ?? c.wind }), cloud_cover: fill(c.cloud, { '-1': c.c1 ?? c.cloud }) } };
};
const lock = (h, c) => { window.__hourOverride = h; wxLock({ temperature: c.temp, windSpeed: c.wind, windGusts: c.gust ?? c.wind + 4, windDirection: c.dir ?? 45, raining: false, thunder: false, fresh: true, data: mk(h, c) }); runFor(3, h); };
const S = [
  ['trưa nắng gắt, nóng', 12.5, { temp: 33, wind: 3, rad: 880, cloud: 5, rh: 55 }],
  ['nắng to mà mát', 12.5, { temp: 22, wind: 12, rad: 850, cloud: 8, rh: 50 }],
  ['mây kéo tới, gió nổi', 14, { temp: 27, wind: 16, rad: 160, cloud: 88, c1: 35, w1: 5, rh: 70 }],
  ['sáng lạnh có gió', 7.5, { temp: 12, wind: 22, rad: 180, cloud: 20, rh: 70, tm: 17 }],
  ['ngày thường', 15, { temp: 24, wind: 10, rad: 450, cloud: 30, rh: 65 }]
];
for (const [name, h, c] of S) {
  lock(h, c); E('WXN.reset()');
  const ctx = E('engContext')(), o = E('wxnObs')(ctx, eng), P = E('WXN').plan(o, 'check');
  out.scen.push({ name, phase: eng.phase, out: o.out, sunlit: o.sunlit, sun: +o.sun.toFixed(1), sunR: +o.sunR.toFixed(1), rad: o.rad, t2: o.t2, w1: o.w1, c1: o.c1, tm: o.tm, v: +o.v.toFixed(2),
    plan: P.map(p => p.k + ':' + p.lv + ':' + p.st + ' ' + p.s.toFixed(2)), check: E('wxnThought')('check', ctx, eng, Date.now(), true) });
}
// đường thật: ép nảy ý liên tiếp ở kịch bản đầu → nhận xét thời tiết trước, quen rồi thì về câu theo việc
lock(15, S[0][2]); E('WXN.reset()');
const sp = E('checkBubbleSprite');
for (let i = 0; i < 10; i++) { E('idleThoughtAt = 0; thoughtUntil = 0'); const r0 = sp.userData.thought && sp.userData.thought.revision; for (let k = 0; k < 40 && (sp.userData.thought && sp.userData.thought.revision) === r0; k++) { E('idleThoughtAt = 0'); __dbg.frames(1); }
  const t = sp.userData.thought; out.seq.push(t ? t.header + ' | ' + t.message : null);
 }
// để lại trên màn hình 1 nhận xét thời tiết mới (page.cjs SHOT chụp cả trang)
E('WXN.reset()'); { const p = eng.g.getWorldPosition(new __dbg.THREE.Vector3()); __dbg.view(p.x, p.y + 2.2, p.z, 0.7, 1.05, 40); }
for (let i = 0; i < 6 && !Object.keys(E('WXN').mem).length; i++) { E('idleThoughtAt = 0; thoughtUntil = 0'); __dbg.frames(2); }
__dbg.frames(4); out.last = sp.userData.thought && sp.userData.thought.message;
out.mem = Object.fromEntries(Object.entries(E('WXN').mem).map(([k, m]) => [k, m.lv]));
return { shots, out };
