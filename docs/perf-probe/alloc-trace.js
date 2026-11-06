(() => {   // ghi mọi mảng kiểu ≥ 256 KB: chỗ tạo (dòng:cột trong trang) · FinalizationRegistry trừ đi khi bị thu gom ⇒ còn sống bao nhiêu
  const REC = window.__ALLOC = new Map(), MIN = 1 << 18, FR = new FinalizationRegistry(([k, b]) => { const r = REC.get(k); if (r) { r.live -= b; r.nl--; } });
  const site = () => { const s = new Error().stack.split('\n'); for (let i = 2; i < s.length; i++) { const m = s[i].match(/\.html[^:]*:(\d+):(\d+)/); if (m) return m[1] + ':' + m[2]; } return 'ext'; };
  for (const name of ['Float32Array', 'Float64Array', 'Uint8Array', 'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'Int8Array', 'Int16Array', 'Int32Array']) {
    const B = window[name];
    const C = class extends B { constructor(...a) { super(...a); if (this.byteLength >= MIN && !(a[0] instanceof ArrayBuffer) && !(typeof SharedArrayBuffer !== 'undefined' && a[0] instanceof SharedArrayBuffer)) { const k = name + '@' + site(), b = this.byteLength; const r = REC.get(k) || { n: 0, b: 0, live: 0, nl: 0 }; r.n++; r.b += b; r.live += b; r.nl++; REC.set(k, r); FR.register(this, [k, b]); } } };
    Object.defineProperty(C, 'name', { value: name }); window[name] = C;
  }
})();
