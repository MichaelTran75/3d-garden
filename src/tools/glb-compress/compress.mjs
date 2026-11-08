// Nén mẫu 3D src/models/*.glb · *.bin bằng glTF-Transform (dùng Node nén mẫu 3D cho trang nhẹ hơn) — README.md cùng thư mục.
//  node compress.mjs <vào> <ra> [tên cấu hình]   — tên cấu hình mặc định = tên tệp không đuôi; tệp .bin = GLB đã XOR (transit.bin, fungi.bin): bỏ XOR → nén → XOR lại
//  Các bước (giữ nguyên hình): bỏ hoạt cảnh không dùng (drop) · bỏ accessor mồ côi · lượng tử hoá thuộc tính theo mẫu q (không đụng POSITION khi mã trang
//  đọc thẳng toạ độ mét của đỉnh) · ảnh → WebP (webp) · sắp lại đỉnh / tam giác cho bộ đệm GPU · nén EXT_meshopt_compression kiểu QUANTIZE (không mất dữ liệu).
//  In ra: dung lượng trước → sau, sai lệch lớn nhất từng thuộc tính đỉnh (so theo tập giá trị qua chỉ số tam giác, không phụ thuộc thứ tự), PSNR ảnh, tên nút.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { prune, quantize, reorder, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const CFG = {
  raccoon: { q: /^(NORMAL|TEXCOORD_\d+|WEIGHTS_\d+)$/, drop: true },   // app/animals/raccoon/glb.js đọc vị trí đỉnh + bindMatrix (mét); RunAnim không dùng — gấu mèo chạy bằng khung hành vi riêng
  chicken: { q: /^NORMAL$/, keepWeights: true },                        // app/animals/chickens/chickens.js đọc vị trí đỉnh (cánh morph, skin đại diện); 6 hoạt cảnh đều dùng
  books: { q: /^(NORMAL|TEXCOORD_\d+)$/ },                              // app/van/interior/bookshelf.js đọc boundingBox + tự đặt scale
  'dji-mini3': { webp: [[/baseColor/, 88], [/metallicRoughness/, 92]] },     // ảnh pháp tuyến giữ JPEG (WebP q95 lớn hơn: 94 → 118 KB)
};
const [inp, out, key = path.basename(inp).replace(/\.[^.]+$/, '')] = process.argv.slice(2), C = CFG[key] || {}, XOR = /\.bin$/i.test(inp);
const xor = b => { let s = 0x2545F491; for (let i = 0; i < b.length; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; b[i] ^= s & 255; } return b; };   // cùng dòng với app/van/body/transit-glb.js
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const raw = new Uint8Array(fs.readFileSync(inp)), read = b => io.readBinary(XOR ? xor(Uint8Array.from(b)) : b);
const doc = await read(raw), ref = await read(raw);

if (C.drop) for (const a of doc.getRoot().listAnimations()) { a.listChannels().forEach(c => c.dispose()); a.listSamplers().forEach(s => s.dispose()); a.dispose(); }
await doc.transform(prune({ propertyTypes: [PropertyType.ACCESSOR], keepLeaves: true, keepAttributes: true, keepIndices: true, keepSolidTextures: true }));
if (C.q) await doc.transform(quantize({ pattern: C.q, patternTargets: C.q, quantizeNormal: 10, quantizeTexcoord: 12, quantizeWeight: 8, normalizeWeights: !C.keepWeights, cleanup: false })), doc.createExtension(KHRMeshQuantization).setRequired(true);   // pháp tuyến / UV / trọng số nguyên chuẩn hoá cần khai báo (quantize chỉ tự thêm khi có POSITION)
for (const [slots, quality] of C.webp || []) await doc.transform(textureCompress({ encoder: sharp, targetFormat: 'webp', quality, slots }));
await doc.transform(reorder({ encoder: MeshoptEncoder, level: 'high' }));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
let bin = await io.writeBinary(doc); if (XOR) bin = xor(Uint8Array.from(bin)); fs.writeFileSync(out, bin);

// ---- kiểm: đọc lại tệp ra, so với tệp vào ----
const got = await read(new Uint8Array(fs.readFileSync(out))), log = [];
const prims = d => d.getRoot().listMeshes().flatMap(m => m.listPrimitives().map(p => [m.getName(), p]));
const A = prims(ref), B = prims(got);
if (A.length !== B.length) log.push(`SỐ PRIMITIVE ${A.length} → ${B.length}`);
for (let k = 0; k < Math.min(A.length, B.length); k++) {
  const [nm, pa] = A[k], pb = B[k][1], ia = pa.getIndices(), ib = pb.getIndices();
  if ((ia ? ia.getCount() : 0) !== (ib ? ib.getCount() : 0)) log.push(`${nm}#${k}: số chỉ số ${ia && ia.getCount()} → ${ib && ib.getCount()}`);
  for (const sem of pa.listSemantics()) {
    const xa = pa.getAttribute(sem), xb = pb.getAttribute(sem); if (!xb) { log.push(`${nm}#${k}: MẤT ${sem}`); continue; }
    const gather = (x, idx) => { const n = x.getElementSize(), cols = Array.from({ length: n }, () => []), e = [], cnt = idx ? idx.getCount() : x.getCount();
      for (let i = 0; i < cnt; i++) { x.getElement(idx ? idx.getScalar(i) : i, e); for (let c = 0; c < n; c++) cols[c].push(e[c]); } return cols.map(c => Float64Array.from(c).sort()); };
    if (sem.startsWith('JOINTS_') || sem.startsWith('WEIGHTS_')) continue;   // khớp / trọng số có thể đổi thứ tự trong 1 đỉnh (sắp theo trọng số) — so riêng bên dưới
    const ca = gather(xa, ia), cb = gather(xb, ib); let d = 0; for (let c = 0; c < ca.length; c++) for (let i = 0; i < ca[c].length; i++) d = Math.max(d, Math.abs(ca[c][i] - cb[c][i]));
    if (d > 1e-6) log.push(`${nm}#${k} ${sem}: lệch ≤ ${d.toExponential(2)}`);
  }
  const wa = pa.getAttribute('WEIGHTS_0'), wb = pb.getAttribute('WEIGHTS_0');
  if (wa && wb) { const sw = (w, idx) => { const s = new Float64Array(idx ? idx.getCount() : w.getCount()), e = []; for (let i = 0; i < s.length; i++) { w.getElement(idx ? idx.getScalar(i) : i, e); s[i] = Math.max(...e); } return s.sort(); };
    const a = sw(wa, ia), b = sw(wb, ib); let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i])); if (d > 1e-6) log.push(`${nm}#${k} trọng số lớn nhất: lệch ≤ ${d.toExponential(2)}`); }
}
const names = d => d.getRoot().listNodes().map(n => n.getName()).join('|');
if (names(ref) !== names(got)) log.push('TÊN NÚT KHÁC');
const extras = d => JSON.stringify(d.getRoot().listNodes().map(n => n.getExtras()));
if (extras(ref) !== extras(got)) log.push('EXTRAS NÚT KHÁC');
const ta = ref.getRoot().listTextures(), tb = got.getRoot().listTextures();
for (let k = 0; k < Math.min(ta.length, tb.length); k++) {
  if (ta[k].getMimeType() === tb[k].getMimeType()) continue;
  const dec = async t => sharp(Buffer.from(t.getImage())).ensureAlpha().raw().toBuffer(), a = await dec(ta[k]), b = await dec(tb[k]);
  let se = 0; for (let i = 0; i < a.length; i++) se += (a[i] - b[i]) ** 2;
  log.push(`ảnh ${k} ${ta[k].getMimeType()} ${(ta[k].getImage().length / 1024).toFixed(0)} KB → ${tb[k].getMimeType()} ${(tb[k].getImage().length / 1024).toFixed(0)} KB, PSNR ${(10 * Math.log10(255 ** 2 / (se / a.length))).toFixed(1)} dB`);
}
const anim = d => d.getRoot().listAnimations().length;
console.log(`${path.basename(inp)}: ${(raw.length / 1024).toFixed(0)} → ${(fs.statSync(out).size / 1024).toFixed(0)} KB (${(100 * fs.statSync(out).size / raw.length).toFixed(0)}%) · hoạt cảnh ${anim(ref)} → ${anim(got)}`);
for (const l of log) console.log('   ' + l);
