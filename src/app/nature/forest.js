        // ---- MẪU NHÁNH ĐỆ QUY DÙNG CHUNG cho rừng: 12 biến thể ngẫu nhiên để tăng tính đa dạng ----
        const forestBark = new THREE.MeshLambertMaterial({ color: 0xcbb488, transparent: true, opacity: 0.5 });   // gỗ tan sáng — CÂY RỪNG luôn trong suốt 50%
        forestWindShader(forestBark); surfaceStyle(forestBark, 'bark');   // cành cây rừng nghiêng theo gió cùng khối tán · vân vỏ cây (core/surface-style.js)
        for (let v = 0; v < 12; v++) {
          const tmp = new THREE.Group();
          // cành tự nhiên (học mẫu GLB): thân chính tới ngọn cao ~4,2 · gốc trơn 18–26% · 10–13 cành bên: dưới xoè ~70° gần ngang rồi uốn cong lên,
          // trên xoè ~40° · mỗi cành bên 3–4 cành con xoè ~34° · cành con chẻ đôi ở đầu · gấp khúc rõ; gốc to 0,165 như cũ
          const { tips, segs } = recTree(tmp, { natural: true, seed: 20260708 + v * 9173, barkMat: forestBark, height: 4.2, trunkR: 0.165, bole: 0.18 + 0.08 * (v % 3) / 2,
            nLat0: [10, 13], ang0: 0.95, angTaper: 0.5, latLen: 0.55, bend: 0.55, nLat1: [3, 4], ang1: 0.6, subLen: 0.5, maxDepth: 3, tipK: 0.15, childK: 0.6, gnarl: 0.26, leafP: 0.12 });   // ~16 khối tán / cây (cũ 8–18)
          tmp.updateMatrixWorld(true);
          const geos = []; tmp.traverse(o => { if (o.isMesh && o.geometry) { const g2 = o.geometry.clone(); g2.applyMatrix4(o.matrixWorld); geos.push(g2); } });
          const merged = mergeGeometries ? mergeGeometries(geos, false) : geos[0];
          for (const geo of geos) if (geo !== merged) geo.dispose();
          tmp.traverse(o => { if (o.geometry) o.geometry.dispose(); });
          tmp.clear();
          vegPools['recbranch' + v] = { geo: merged, mat: forestBark, color: false, cast: true, list: [] };
          _forestVariants.push({ key: 'recbranch' + v, tips: tips.map(t => t.clone()), top: Math.max(...tips.map(t => t.y)), segs });
        }
        // ---- đặt cây rừng (bỏ cây thông → cây nhánh đệ quy) ----
        {
          let tn = 0, tt = 0;
          while (tn < 138 && tt < 14000) {
            tt++; const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
            if (!freeTree(i, j)) continue;
            const tx = wx(i), ty = surfaceY(i, j), tz = wz(j);
            const ts = 1.575 + Math.random() * 1.05, rot = Math.random() * 6.28, V = addTreeInst(ts, tx, ty, tz, rot);   // to thêm 75% (0.9→1.575)
            treeCoords.push({ x: tx, y: ty, z: tz, s: ts, V, rot }); tn++;
          }
          let bn = 0, bt = 0;
          while (bn < 3 && bt < 4000) {
            bt++; const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
            if (!freeTree(i, j)) continue;
            const tx = wx(i), ty = surfaceY(i, j), tz = wz(j);
            const ts = 3.5 + Math.random() * 1.4, rot = Math.random() * 6.28, V = addTreeInst(ts, tx, ty, tz, rot);   // to thêm 75% (2.0→3.5)
            treeCoords.push({ x: tx, y: ty, z: tz, s: ts, V, rot }); bn++;
          }
        }
        // ---- 2 cây táo (ĐỆ QUY) cạnh caravan ----
        const _ftPlain = new THREE.MeshBasicMaterial();
        function fruitTree(s, seed, o = {}) {   // o (cây táo thứ 3): trunkK thân to × · rootK cành cấp 1 / thân · firstSplitN cành chính · nMax rẽ tối đa · leafK chùm lá giữa × · reach cành vươn (recTree) · keepBark ⇒ userData.barkGeo(): dựng lại lưới vỏ trên CPU (mảng đỉnh đã giải phóng sau khi nạp GPU)
          const g = new THREE.Group();
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x5f5347, transparent: true, opacity: 0.90 }); barkMat.userData.sfApple = 1;
          // xương cành gọn: thân + cành cấp 1–2 (cành nhỏ, lá, quả đi cứng theo); thân không ngả (lean 0) ⇒ đường leo, rêu, viền chọn giữ nguyên chỗ
          const rig = TREE_RIG_ON, tw = rig ? makeTreeWind({ freq: 0.8, zeta: 0.1, lean: 0, branchAmp: 0, sway: 0.5, rig: { amp: 0.09, grow: 1.5, freq: 2.2 } }) : null;
          if (rig) windShader(barkMat, tw, 0);
          surfaceStyle(barkMat, 'bark');   // vỏ táo nứt vảy thủ tục (core/surface-style.js sfApple) thay ảnh vỏ quét   // thân cây rõ hơn 20% (0.75 * 1.2 = 0.90) · vân vỏ cây · nâu xám như bản quét
          const ro = { seed, s, barkMat, appleBark: true, trunkLen: 1.7 * s, trunkR: 0.125 * s * (o.trunkK || 1), maxDepth: 4, nMin: 2, nMax: o.nMax || 3, lenK: 0.74, radK: 0.6, spread: 0.72, upBias: 0.22, firstSplitN: o.firstSplitN || 4, rootK: o.rootK, reach: o.reach };
          const { tips, rnd, segs, bones, tipW, bindAt } = recTree(g, rig ? Object.assign({ rig: true, rigDepth: 2 }, ro) : ro);
          const pts = []; for (const tp of tips) cloudPts(rnd, tp.x, tp.y + 0.08 * s, tp.z, 0.62 * s, 40, pts);
          cloudPts(rnd, 0, 2.7 * s, 0, 1.05 * s, Math.round(130 * (o.leafK || 1)), pts);   // chùm trung tâm cho tán dày ruột
          const imL = tuftInstanced(g, rnd, pts, leafHexGeo(0.09 * s), [0x86a364, 0x78935b, 0x6e8754, 0x61784a], 0.60, 1, tw); g.userData.leafPts = Float32Array.from(pts.flat());
          if (rig) { const nT = tips.length * 40; imL.geometry.setAttribute('aBr', rigAttr(pts.map((pt, k) => k < nT ? tipW[(k / 40) | 0] : bindAt(pt[0], pt[1], pt[2])))); }   // chùm lá đầu cành theo xương của cành đó; chùm giữa tán theo cành gần nhất   // điểm lá: lá rụng theo cơn giật (nature/wind-field.js)   // lá cây trong suốt hơn 20% (0.75 * 0.8 = 0.60)
          // táo đỏ treo dưới ~1/3 số cành tận cùng
          function deformApple(geom) {
            const pos = geom.attributes.position;
            for (let i = 0; i < pos.count; i++) {
              let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
              const ny = y / (0.12 * s);
              const scaleXz = 1.0 - 0.18 * ny - 0.15 * Math.cos(ny * Math.PI * 0.5);
              x *= scaleXz; z *= scaleXz;
              const horizR = Math.sqrt(x * x + z * z);
              if (ny > 0) {
                y -= 0.16 * (0.12 * s) * Math.exp(-horizR * horizR * 5.0);
              } else {
                y += 0.10 * (0.12 * s) * Math.exp(-horizR * horizR * 4.0);
              }
              pos.setXYZ(i, x, y, z);
            }
            geom.computeVertexNormals();
          }

          const AK = 0.56;   // quả táo nhỏ đi 20% · nhỏ thêm 30% (0,8 × 0,7)
          const bodyGeom = new THREE.SphereGeometry(0.12 * s, 8, 8); deformApple(bodyGeom); bodyGeom.scale(AK, AK, AK);
          const leftGeom = new THREE.SphereGeometry(0.12 * s, 8, 8, 0, Math.PI); deformApple(leftGeom); leftGeom.scale(AK, AK, AK);
          const rightGeom = new THREE.SphereGeometry(0.12 * s, 8, 8, Math.PI, Math.PI); deformApple(rightGeom); rightGeom.scale(AK, AK, AK);

          const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd93d2b, flatShading: true });
          const yellowMat = new THREE.MeshLambertMaterial({ color: 0xe5b82c, flatShading: true });
          const greenMat = new THREE.MeshLambertMaterial({ color: 0x6e8e3d, flatShading: true }); // xanh lá táo tươi
          const stemGeom = new THREE.CylinderGeometry(0.005 * s * AK, 0.008 * s * AK, 0.09 * s * AK, 4);
          const stemMat = new THREE.MeshLambertMaterial({ color: 0x5a3e29, flatShading: true });

          const fruit = new THREE.Group(), apples = []; fruit.name = 'Quả táo';   // quả RIÊNG (không gộp tĩnh) ⇒ kỹ sư hái được từng quả
          for (let i = 0; i < tips.length; i += 3) {
            const tp = tips[i], apple = new THREE.Group();
            const rVal = rnd();
            if (rVal < 0.1) {
              const body = new THREE.Mesh(bodyGeom, yellowMat); body.castShadow = true; apple.add(body);
            } else if (rVal < 0.22) {
              // táo xanh vàng (hai nửa ghép lại)
              const leftHalf = new THREE.Mesh(leftGeom, greenMat); leftHalf.castShadow = true; apple.add(leftHalf);
              const rightHalf = new THREE.Mesh(rightGeom, yellowMat); rightHalf.castShadow = true; apple.add(rightHalf);
            } else if (rVal < 0.34) {
              // táo đỏ xanh (hai nửa ghép lại)
              const leftHalf = new THREE.Mesh(leftGeom, bodyMat); leftHalf.castShadow = true; apple.add(leftHalf);
              const rightHalf = new THREE.Mesh(rightGeom, greenMat); rightHalf.castShadow = true; apple.add(rightHalf);
            } else {
              const body = new THREE.Mesh(bodyGeom, bodyMat); body.castShadow = true; apple.add(body);
            }

            const stem = new THREE.Mesh(stemGeom, stemMat);
            stem.position.y = 0.11 * s * AK;
            stem.rotation.set(0.12, 0, -0.18);
            stem.castShadow = true; apple.add(stem);

            apple.position.set(tp.x + (rnd() - 0.5) * 0.4 * s, tp.y - 0.28 * s, tp.z + (rnd() - 0.5) * 0.4 * s);
            apple.rotation.y = rnd() * 6.28;
            fruit.add(apple); apples.push({ g: apple, home: apple.position.clone(), rot: apple.rotation.y, on: true, sw: 0, sv: 0, swy: 0, svy: 0, bind: rig ? tipW[i] : null });
          }
          const out = bakeStatic(g);   // gộp toàn bộ cành theo vật liệu → vài draw call/cây
          out.add(fruit); out.userData.apples = apples; out.userData.appleR = 0.12 * s * AK; out.userData.limbs = segs;
          if (rig) { out.userData.treeWind = tw; out.userData.rigBind = bindAt; out.userData.rigLimbs = bones.map(l => ({ o: l.P[0], t: l.P[l.P.length - 1], par: l.bp, d: l.d })); }
          if (o.keepBark) out.userData.barkGeo = () => { const t = new THREE.Group(); recTree(t, Object.assign({}, ro, { barkMat: _ftPlain })); return t.children[t.children.length - 1].geometry; };   // lưới vỏ dựng lại trên CPU (cùng hạt ⇒ trùng lưới đang vẽ; mảng đỉnh bản vẽ đã giải phóng sau khi nạp GPU): người gọi tự bỏ khi xong, không nạp GPU   // quả gắn SAU khi gộp: lô vẽ chung (draw-batch) vẫn gom chung 1 lượt vẽ
          return out;
        }

        // (mũi tên từ tán chĩa qua chuồng): cây táo cạnh chuồng (x62 z90) thêm 3 cành cấp 1
        //  dài ×1,8, nghiêng 72° chĩa qua chuồng gà (x61,4 z91) vượt hẳn ra phía hang thỏ (x60,4 z92,6) — nhìn từ trên cao phía đông nam, tán phủ cả chuồng;
        //  rẽ tiếp như cành thường ⇒ tán xoè trên mái chuồng (mái cao ~1,3 m, lá thấp nhất ~2,3 m) ·: lenK 1,8 → 0,9
        const FT1_YAW = -1.852, FT1_REACH = new THREE.Vector3(60.4 - 62, 0, 92.6 - 90).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), -FT1_YAW);   // hướng vươn trong toạ độ cây
        const ft1 = fruitTree(1.25, 1337, { reach: { dir: FT1_REACH, n: 3, lenK: 0.9, tilt: 1.25 } }), ft2 = fruitTree(1.35, 2024);
        ft1.scale.multiplyScalar(NATURE_SCALE); ft2.scale.multiplyScalar(NATURE_SCALE);
        ft1.position.copy(worldCell(21.5, 31.5)); ft1.rotation.y = FT1_YAW; scene.add(ft1);
        ft1.position.set(X0 + 62, surfaceY(Math.round((20 + 5 / 6) * S), 32.5 * S), Z0 + 90);   // (toạ độ trang X = x − X0, Z = z − Z0): sát góc sau–phải chuồng gà (camp/chicken-coop.js) — bóng mát + chỗ trú cho gà
        ft2.position.copy(worldCell(24.5, 34.5)); ft2.rotation.y = -0.794; scene.add(ft2);
        // ---- CÂY TÁO THỨ 3 (thêm cây táo ở (100; 103), gốc to ×3, cành lá ×2): cây táo già cách trại ~33 m —
        //      thân to ×3 (Ø ~0,9 m; cành cấp 1 nhỏ hẳn so với thân kiểu cây cổ thụ: rootK 0,27), 5 cành chính (cũ 4) + mỗi nhánh rẽ 2–4 (cũ 2–3) ⇒ ~2× số cành,
        //      chùm lá theo đầu cành nên lá cũng ~2×, chùm lá giữa ×2; quả theo đầu cành (1/3). Không phải cây hái (noPick): việc hái táo giữ chỗ cạnh trại ----
        // tán lá rộng thêm phía lối ra vào của gấu mèo (mũi tên từ tán chĩa về đầu rỗng khúc gỗ chết = hang gấu mèo): 2 cành vươn dài ×1,35,
        //  nghiêng 57°, chĩa về giữa miệng hang (x 102 z 102) và chỗ gấu mèo ra vào (x 103 z 98) — animals/dog-raccoon.js racMouth / racApproach
        const FT3_X = 99.81, FT3_Z = 102.95, FT3_YAW = 3.2, FT3_REACH = new THREE.Vector3(102.5 - FT3_X, 0, 100 - FT3_Z).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), -FT3_YAW);   // hướng vươn trong toạ độ cây
        // thêm 2 cành vươn ×1,25 chĩa vuông góc qua khúc gỗ chết (từ gốc ra trục khúc gỗ rồi vượt qua)
        const FT3_LOG = new THREE.Vector3(0.961, 0, 0.275).applyAxisAngle(new THREE.Vector3(0, 1, 0), -FT3_YAW);   // hướng gốc → trục khúc gỗ (toạ độ cây)
        const ft3 = fruitTree(1.35, 7171, { keepBark: true, trunkK: 3, rootK: 0.27, firstSplitN: 5, nMax: 4, leafK: 2, reach: [{ dir: FT3_REACH, n: 2, lenK: 1.35, tilt: 1.0 }, { dir: FT3_LOG, n: 2, lenK: 1.25, tilt: 1.0 }] }); ft3.scale.multiplyScalar(NATURE_SCALE); ft3.userData.noPick = true; ft3.userData.colR = 1.0;   // colR: core/collide.js giữ tam giác thân trong 1 m quanh gốc (rễ choãi tới ~0,9 m; cây cũ 0,7)
        // (cây táo già — gấu mèo leo): vỏ táo bật rêu mặt trên + vệt nước chảy ở
        //  độ phủ thấp (sfTop 0,5; cổ thụ 1) ⇒ thảm rêu lá cỏ (nature/moss-lawn.js) tự mọc đúng chỗ có màu rêu trên thân ≤ 3,2 m; 2 cây táo cạnh trại giữ vỏ sạch
        ft3.traverse(o => { if (o.isMesh && o.material && o.material.userData && o.material.userData.sfApple) o.material.userData.sfTop = 0.5; });
        { const X = X0 + FT3_X, Z = Z0 + FT3_Z; ft3.position.set(X, surfaceY(Math.round(X / BLOCK + cx - 0.5), Math.round(Z / BLOCK + cz - 0.5)), Z); ft3.rotation.y = FT3_YAW; scene.add(ft3); }   // ô lưới = nghịch đảo wx / wz (viết tay từ khi x2gi còn khai báo sau tệp này; nay ở core/helpers.js) · lùi 0,2 m khỏi khúc gỗ chết (x 101 z 104,5) + xoay 3,2 cho rễ choãi né: đúng x100 z103 thì cành cụt của khúc gỗ đâm vào chân rễ ~5 cm — giờ hở 0,23 m
        flightRoots.push(ft1, ft2, ft3);
        for (const T of [ft1, ft2, ft3]) worldJoin('groundContact', 10, S => S.add(T));   // bóng tiếp đất quanh gốc (world/ground-contact.js)
        for (const T of [ft1, ft2, ft3]) if (T.userData.treeWind) finalizeTreeWind(T.userData.treeWind, T);   // xương cành: đo gốc + tán sau khi đặt cây
        const appleTrees = [ft1, ft2, ft3];   // kỹ sư hái táo (engineer/tasks/apple-pick.js — trừ cây noPick)
        for (const T of appleTrees) obstacleCoords.push({ x: T.position.x, y: T.position.y, z: T.position.z, r: T === ft3 ? 0.75 : 0.35, h: 3 });   // thân cây: người & chó đi vòng (cây 3 thân to ×3)
        // (ảnh cây táo già trên khúc gỗ chết). Rê chuột ⇒ viền trắng
        //  chỉ quanh THÂN (bản sao vô hình phần vỏ dưới chạc — ft3Trunk; vỏ cây là 1 lưới gộp cả cành nên không bỏ riêng được), bấm bất kỳ chỗ nào trên cây ⇒ bảng việc
        //  "Cây táo già" (dịch vụ 'jobs') có lựa chọn "Gấu mèo ăn táo" ⇒ camera lướt tới giữa thân – tán (zoom ≥ ×16) + tin 'appleTreeTap'. Cây không biết ai nghe:
        //  gấu mèo (animals/raccoon/brain.js) tự quyết ra khỏi hang, tới gốc, trèo, hái 1 quả ngồi gặm rồi chúc đầu xuống (animals/raccoon/climb.js).
        //  Ô NHÌN XUYÊN TÁN: con gì đang trèo cây này (mặt gấu mèo: climbing) ⇒ lá Ở TRƯỚC nó trong vòng 0,9 m quanh nó trên màn hình mờ dần, giữa bỏ hẳn — tán vẫn
        //  nguyên, chỉ mở một ô tròn theo con vật; xuống đất thì ô khép lại (0,6 s). Vá vào shader lá của riêng cây này (bóng đổ của lá giữ nguyên) ----
        const ft3Trunk = (() => {   // tam giác vỏ nằm hẳn dưới chạc đầu tiên (đường thân userData.limbs: từ gốc, đoạn nối đoạn khi chỉ có 1 con)
          const bark = ft3.children.find(o => o.isMesh && !o.isInstancedMesh && o.name !== 'Vỏ cây (lượt độ sâu)'), L = ft3.userData.limbs; if (!bark || !L) return null;
          const key = (g, o) => g[o].toFixed(4) + ',' + g[o + 1].toFixed(4) + ',' + g[o + 2].toFixed(4), from = new Map();
          for (const g of L) { const k = key(g, 0); from.set(k, (from.get(k) || []).concat([g])); }
          const ends = new Set(L.map(g => key(g, 3))); let g = L.find(h => !ends.has(key(h, 0))); if (!g) return null;
          while ((from.get(key(g, 3)) || []).length === 1) g = from.get(key(g, 3))[0];
          const top = g[4], src = bark.geometry, P = src.attributes.position, I = src.index, v = new THREE.Vector3(), keep = [];
          bark.updateMatrix(); const yOf = i => v.fromBufferAttribute(P, i).applyMatrix4(bark.matrix).y, n = I ? I.count : P.count;
          for (let t = 0; t < n; t += 3) { const a = I ? I.getX(t) : t, b = I ? I.getX(t + 1) : t + 1, c = I ? I.getX(t + 2) : t + 2; if (Math.max(yOf(a), yOf(b), yOf(c)) < top) keep.push(a, b, c); }
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', P); geo.setIndex(keep);
          const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));   // không vẽ gì: chỉ để bộ chọn lấy hình viền
          m.name = 'Thân cây táo già (viền chọn)'; m.matrix.copy(bark.matrix); m.matrix.decompose(m.position, m.quaternion, m.scale); m.raycast = () => {};
          Object.assign(m.userData, { noBatch: true, noBake: true, noCollide: true, pickSkip: true }); ft3.add(m); return m;
        })();
        const ft3Hole = (() => {
          const leaf = ft3.children.find(o => o.isInstancedMesh), M = leaf && leaf.material; if (!M) return null;
          const U = { value: new THREE.Vector4() }, base = M.onBeforeCompile, key = M.customProgramCacheKey(), P = new THREE.Vector3(), buf = new THREE.Vector2(); let k = 0;
          M.onBeforeCompile = (sh, r) => { base.call(M, sh, r); sh.uniforms.uHole = U;   // uHole: xy tâm (điểm ảnh khung vẽ), z bán kính (điểm ảnh, 0 = tắt), w độ sâu của con vật
            sh.fragmentShader = 'uniform vec4 uHole;\n' + sh.fragmentShader
              .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n float holeK = 1.0; if (uHole.z > 0.0 && gl_FragCoord.z < uHole.w) { holeK = smoothstep(0.5, 1.0, length(gl_FragCoord.xy - uHole.xy) / uHole.z); if (holeK < 0.02) discard; }')
              .replace('#include <dithering_fragment>', 'gl_FragColor.a *= holeK;\n#include <dithering_fragment>'); };
          M.customProgramCacheKey = () => key + '+hole'; M.needsUpdate = true;
          return dt => {   // mỗi khung (lượt người xem): tâm ô = con vật chiếu lên màn hình
            const R = worldSee('raccoon'), on = !!R && R.climbing === ft3; k = Math.max(0, Math.min(1, k + (on ? dt : -dt) / 0.6));
            if (!k) { U.value.z = 0; return; }
            if (on) { camera.updateMatrixWorld(); P.copy(R.pos); P.y += 0.15; P.project(camera); }
            renderer.getDrawingBufferSize(buf);
            U.value.set((P.x + 1) / 2 * buf.x, (P.y + 1) / 2 * buf.y, k * 0.9 * buf.y * camera.zoom / (camera.top - camera.bottom), (P.z + 1) / 2);
          };
        })();
        //  Camera còn bám cây (từ lựa chọn "Gấu mèo ăn táo") mà con vật đã bám lên thân ⇒ chuyển sang bám con vật, zoom ≥ ×30 (×16 thì gấu mèo ngồi gặm trên cành chỉ ~15 điểm ảnh;
        //  ×30 ở khung cao ~760 điểm ảnh: gấu mèo đi dài ~90 — cỡ "nhìn cận" của climb.js closeUp) —
        //  theo nó lên cành, ăn, xuống, về hang; kéo phải / phím W/A/S/D / nút về mặc định là thôi bám như mọi vật (ui/follow-tags.js)
        const ft3CamOff = new THREE.Vector3(0, 0.3, 0);
        worldPlace('oldAppleTree', {
          hover: { root: ft3, skip: m => ft3Trunk ? m !== ft3Trunk : !!(m.parent && m.parent.parent && m.parent.parent.name === 'Quả táo') },
          job: { objs: [ft3], title: 'Cây táo già', msg: 'Chọn:', choices: [{ lab: 'Gấu mèo ăn táo', plan: () => 'Gấu mèo ra khỏi hang, trèo cây hái một quả ngồi gặm',
            why: () => { const R = worldSee('raccoon'); return R && R.climbing === ft3 ? 'Gấu mèo đang ở trên cây' : ''; },
            run: () => { camFollow(ft3, 16, { off: new THREE.Vector3(0, 2.6, 0) }); worldTell('appleTreeTap', ft3); } }] },
          tick: [['viewer', 45, dt => {   // MỖI KHUNG (sổ tick, lượt người xem — sau camera bám vật): ô nhìn xuyên tán + chuyển camera sang con vật đang trèo
            if (ft3Hole) ft3Hole(dt);
            const R = CAMF.o === ft3 && worldSee('raccoon'); if (R && R.climbing === ft3) camFollow(R.object, 30, { off: ft3CamOff, rate: 2 });
          }]],
        });

        function deadLogOut(x, z, m) {   // (x, z) nằm dưới thân khúc gỗ chết (cách trục < bán kính + m) → điểm dời ra mép gần nhất; ở ngoài → null
          const L = deadLog; if (!L) return null;
          const ux = L.bx - L.ax, uz = L.bz - L.az, ll = ux * ux + uz * uz, k = Math.max(0, Math.min(1, ((x - L.ax) * ux + (z - L.az) * uz) / ll));
          const cx = L.ax + ux * k, cz = L.az + uz * k, r = L.ra + (L.rb - L.ra) * k + m; let dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
          if (d >= r) return null;
          if (d < 1e-4) { dx = -uz; dz = ux; d = Math.sqrt(ll); }
          return [cx + dx / d * r, cz + dz / d * r];
        }
        // ---- Khúc gỗ chết (Dead Log) + Gốc cây bị cưa (Sawed Stump) ----
        let deadWood = null;   // { stump: deadStump, mat } — gỗ chết nứt dùng chung (gốc cưa + khúc gỗ đứng), dựng trong environmentalDetails
        let deadLog = null;   // trục thân gỗ chết trên mặt đất (đầu a to r 0,70 · đầu b nhỏ r 0,56) — cỏ / hoa không mọc xuyên (nature/grass-scatter.js)
        // ---- CHÚT RÊU + LÁ CỎ THẢM trên gỗ đứng yên (gốc cưa lớn x102 z115, khúc gỗ đứng x106 z109):
        //  lượng rêu tính sẵn ở từng đỉnh (aMk, như đá hộc cửa xả — nature/bank-moss.js): dải sát đất ~0,4 m + mặt hướng trời, cắt thành mảng loang theo nhiễu ⇒
        //  màu rêu phủ (core/surface-style.js mossCoat, đệm + gồ như rêu trên vỏ cổ thụ) + lá rêu cỏ thảm mọc đúng chỗ đó (mossBladeSrc → nature/moss-lawn.js), lá thấp ----
        function woodMossDab(root, mat, key, seed, k = 1.35, band = 0.42) {   // k: độ đậm · band: cao dải rêu sát đất
          const ss = THREE.MathUtils.smoothstep, v = new THREE.Vector3(), n = new THREE.Vector3(), L = [];
          root.updateMatrixWorld(true);
          root.traverse(o => { const arr = Array.isArray(o.material), mi = arr ? o.material.indexOf(mat) : 0; if (!o.isMesh || (arr ? mi < 0 : o.material !== mat)) return;   // nhiều vật liệu (gốc cưa: thân + mặt cưa): chỉ đỉnh của nhóm vật liệu này
            const g = o.geometry, P = g.attributes.position, N = g.attributes.normal, A = new Float32Array(P.count), M = o.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M), own = new Uint8Array(P.count).fill(arr ? 0 : 1);
            if (arr) for (const G of g.groups) if (G.materialIndex === mi) for (let t = G.start; t < G.start + G.count; t++) own[g.index ? g.index.array[t] : t] = 1;
            for (let i = 0; i < P.count; i++) { if (!own[i]) continue; v.fromBufferAttribute(P, i).applyMatrix4(M); n.fromBufferAttribute(N, i).applyMatrix3(NM).normalize();
              const hA = v.y - cowY(v.x, v.z), nz = 0.5 + 0.22 * Math.sin(v.x * 7.1 + v.y * 3.3 + seed) + 0.18 * Math.sin(v.z * 6.3 - v.y * 4.7 + 1.3 * seed) + 0.1 * Math.sin((v.x + v.z) * 17.0 + v.y * 9.0);
              A[i] = k * Math.min(1, 0.85 * (1 - ss(hA, 0.04, band)) * (n.y > -0.3 ? 1 : 0) + 0.55 * ss(n.y, 0.55, 0.95)) * ss(nz, 0.38, 0.72); }
            g.setAttribute('aMk', new THREE.BufferAttribute(A, 1)); o.userData.noBatch = true; L.push(o); });
          const mm = mossCoat(mat.clone(), key, { vHead: 'attribute float aMk; varying float vMk;', vMain: ' vMk = aMk;', fHead: 'varying float vMk;',
            sq: '(abs(vMcN.y) > 0.6 ? vMcP.xz : abs(vMcN.x) > abs(vMcN.z) ? vMcP.zy : vMcP.xy)', mo: 'smoothstep(0.3, 0.6, vMk + 0.25 * (sfMossCu(mcQ, mcF) - 0.45))' });
          for (const o of L) o.material = Array.isArray(o.material) ? o.material.map(x => x === mat ? mm : x) : mm;
          mossBladeSrc.push((push, DENS) => {   // lá rêu: rải theo diện tích tam giác, lượng rêu nội suy aMk (cùng luật mép thưa)
            const r = mulberry32(seed * 7919), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nn = new THREE.Vector3();
            for (const o of L) { const g = o.geometry, P = g.attributes.position, N = g.attributes.normal, A = g.attributes.aMk, I = g.index ? g.index.array : null, M = o.matrixWorld, NM = new THREE.Matrix3().getNormalMatrix(M), nt = I ? I.length : P.count;
              for (let t = 0; t + 2 < nt; t += 3) { const ia = I ? I[t] : t, ib = I ? I[t + 1] : t + 1, ic = I ? I[t + 2] : t + 2, ma = A.getX(ia), mb = A.getX(ib), mc = A.getX(ic); if (Math.max(ma, mb, mc) < 0.3) continue;
                a.fromBufferAttribute(P, ia).applyMatrix4(M); b.fromBufferAttribute(P, ib).applyMatrix4(M); c.fromBufferAttribute(P, ic).applyMatrix4(M); e1.subVectors(b, a); e2.subVectors(c, a);
                let q = Math.floor(e1.clone().cross(e2).length() / 2 * DENS + r());
                while (q-- > 0) { let u = r(), w = r(); if (u + w > 1) { u = 1 - u; w = 1 - w; } const m = ss(ma * (1 - u - w) + mb * u + mc * w, 0.3, 0.6); if (m < 0.02) continue;
                  nn.fromBufferAttribute(N, ia).multiplyScalar(1 - u - w).addScaledVector(v.fromBufferAttribute(N, ib), u).addScaledVector(n.fromBufferAttribute(N, ic), w).applyMatrix3(NM).normalize(); if (nn.y < -0.4) continue;
                  push(a.x + e1.x * u + e2.x * w, a.y + e1.y * u + e2.y * w, a.z + e1.z * u + e2.z * w, nn.x, nn.y, nn.z, m, 0.3, 0.55); } } }
          });
        }
        (function environmentalDetails() {
          const logBarkMat = surfaceStyle(new THREE.MeshLambertMaterial({ color: 0x2d251d, flatShading: true, side: THREE.DoubleSide }), 'bark');
          logBarkMat.userData.sfTop = 1.8; logBarkMat.userData.sfTopW = 1;   // thêm rêu lên khúc gỗ khúc gỗ chết: rêu phủ dày mặt trên thân nằm + cành chĩa (core/surface-style.js, rêu mặt trên)

          // 1. Khúc gỗ chết lớn (Dead Log) rỗng x2 tại x 101, y 7, z 105
          const logGroup = new THREE.Group();
          logGroup.position.set(X0 + 101.0, 7.0 + 0.50, Z0 + 104.5); logGroup.name = 'Khúc gỗ chết (Dead Log)';   // Hạ thấp hơn một chút theo yêu cầu · tên để nature/fungi.js tìm
          logGroup.rotation.set(0.08, -Math.atan2(101.0 - 108.0, 102.0 - 100.0), Math.PI / 2); // Nằm ngang hơi xiên góc
          logGroup.updateMatrixWorld(true);
          { const a = new THREE.Vector3(0, -3.8, 0).applyMatrix4(logGroup.matrixWorld), b = new THREE.Vector3(0, 3.8, 0).applyMatrix4(logGroup.matrixWorld); deadLog = { ax: a.x, az: a.z, bx: b.x, bz: b.z, ra: 0.70, rb: 0.56 }; }

          // Vỏ ngoài của khúc gỗ lớn x2 (openEnded = true)
          const logMain = new THREE.Mesh(bkAttr(new THREE.CylinderGeometry(0.56, 0.70, 7.6, 8, 1, true), 7.6), logBarkMat);
          logMain.castShadow = true; logMain.receiveShadow = true; logGroup.add(logMain);

          // Lớp lõi rỗng bên trong x2 (openEnded = true) — (ảnh: miệng gỗ như 1 mặt gỗ đặc
          //  màu be + 1 tam giác xanh): lòng gỗ sáng đều như mặt ngoài ⇒ nhìn vào miệng thấy vách trong phía xa như mặt cắt đặc; trục dốc 0,08 rad, đầu nhỏ (b) thấp hơn
          //  0,58 m nên mặt đất cỏ (y 7,2) lấn vào lòng gỗ thành mảng xanh. Nay: lòng gỗ (vách + đáy) tối dần theo độ sâu kể từ miệng gần nhất (khuất sáng: 1 ở miệng →
          //  ~0,1 sau ~1 m), vành gỗ dày 12 cm ở 2 đầu (thớ gỗ mục), đáy lót đất mục đúng chỗ mặt đất cắt lòng gỗ (che cỏ) ⇒ miệng gỗ thành hốc tối; gấu mèo bò trên
          //  đáy này (animals/dog-raccoon.js racMouth / racInside)
          const hollowMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true, side: THREE.DoubleSide });
          const cWood = new THREE.Color(0xd7b889), cEnd = new THREE.Color(0x8a7457), cSoil = new THREE.Color(0x3b2d20), HL = 3.82;
          const shade = y => 0.09 + 0.91 * Math.exp(-(HL - Math.abs(y)) / 0.4);   // khuất sáng theo độ sâu kể từ miệng gần nhất (y dọc trục, ±3,82 = 2 miệng)
          const paint = (geo, col, f) => { const P = geo.attributes.position, C = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const k = f(P.getY(i)); C[i * 3] = col.r * k; C[i * 3 + 1] = col.g * k; C[i * 3 + 2] = col.b * k; }
            geo.deleteAttribute('uv'); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); return geo; };
          const innerR = y => 0.58 + (0.44 - 0.58) * (y + HL) / (2 * HL);
          const logInner = new THREE.Mesh(paint(new THREE.CylinderGeometry(0.44, 0.58, 2 * HL, 8, 64, true), cWood, shade), hollowMat);
          logInner.castShadow = true; logInner.receiveShadow = true; logGroup.add(logInner);
          for (const [y, r1] of [[-3.8, 0.70], [3.8, 0.56]]) {   // vành gỗ 2 đầu (giữa vỏ và lõi): mặt thớ gỗ mục
            const ring = new THREE.Mesh(paint(new THREE.RingGeometry(innerR(y), r1, 8, 1), cEnd, () => 1), hollowMat);
            ring.position.y = y; ring.rotation.x = Math.PI / 2; ring.receiveShadow = true; logGroup.add(ring);
          }
          {   // đáy lót đất mục: dải trên mặt đất trong lòng gỗ, rộng = dây cung tiết diện 8 cạnh ở độ cao mặt đất (dưới đáy gỗ thì bề rộng 0)
            const P = [], C = [], I = [], up = new THREE.Vector3(1, 0, 0).transformDirection(logGroup.matrixWorld), lat = new THREE.Vector3(0, 0, 1).transformDirection(logGroup.matrixWorld).setY(0).normalize();
            const chord = (h, r) => { let w = 0; for (let k = 0; k < 8; k++) { const a0 = k * Math.PI / 4, x0 = r * Math.sin(a0), z0 = r * Math.cos(a0), x1 = r * Math.sin(a0 + Math.PI / 4), z1 = r * Math.cos(a0 + Math.PI / 4);
              if ((x0 - h) * (x1 - h) <= 0 && x0 !== x1) w = Math.max(w, Math.abs(z0 + (z1 - z0) * (h - x0) / (x1 - x0))); } return w; };
            const c = new THREE.Vector3(), q = new THREE.Vector3();
            for (let n = 0; n <= 76; n++) {
              const y = -3.8 + 0.1 * n; logGroup.localToWorld(c.set(0, y, 0));
              const gy = surfaceY(Math.round(c.x / BLOCK + cx - 0.5), Math.round(c.z / BLOCK + cz - 0.5)) + 0.012, w = 0.96 * chord((gy - c.y) / up.y, innerR(y)), k = shade(y);
              for (const sd of [-1, 1]) { logGroup.worldToLocal(q.set(c.x + lat.x * sd * w, gy, c.z + lat.z * sd * w)); P.push(q.x, q.y, q.z); C.push(cSoil.r * k, cSoil.g * k, cSoil.b * k); }
              if (n) I.push(2 * n - 2, 2 * n - 1, 2 * n, 2 * n - 1, 2 * n + 1, 2 * n);
            }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.setIndex(I); geo.computeVertexNormals();
            const floor = new THREE.Mesh(geo, hollowMat); floor.receiveShadow = true; logGroup.add(floor);
          }

          // Các nhánh gỗ mọc tủa ra đệ quy (3 nhánh đệ quy bằng recTree)
          const branch1 = new THREE.Group();
          branch1.position.set(0.3, 1.2, 0.4);
          branch1.rotation.set(0.5, 0.2, 0.9);
          recTree(branch1, { seed: 101, s: 1.0, barkMat: logBarkMat, trunkLen: 1.6, trunkR: 0.28, maxDepth: 2, nMin: 3, nMax: 3, lenK: 0.65, radK: 0.57, spread: 0.65, upBias: 0.1, recursiveLeaves: false });
          logGroup.add(branch1);

          const branch2 = new THREE.Group();
          branch2.position.set(-0.3, -1.4, -0.4);
          branch2.rotation.set(-0.4, -0.3, -1.0);
          recTree(branch2, { seed: 202, s: 1.0, barkMat: logBarkMat, trunkLen: 1.2, trunkR: 0.22, maxDepth: 2, nMin: 3, nMax: 3, lenK: 0.65, radK: 0.55, spread: 0.65, upBias: 0.1, recursiveLeaves: false });
          logGroup.add(branch2);

          const branch3 = new THREE.Group();
          branch3.position.set(0.5, 2.2, 0.8);
          branch3.rotation.set(0.2, 0.1, 0.5);
          recTree(branch3, { seed: 303, s: 1.0, barkMat: logBarkMat, trunkLen: 0.8, trunkR: 0.12, maxDepth: 2, nMin: 3, nMax: 3, lenK: 0.65, radK: 0.50, spread: 0.65, upBias: 0.1, recursiveLeaves: false });
          logGroup.add(branch3);

          // Thêm 3 chiếc lá xanh nhỏ (leafs) tủa ra từ các đầu cành đệ quy
          const logLeafMat = new THREE.MeshLambertMaterial({ color: 0x4e703f, flatShading: true, side: THREE.DoubleSide });
          const logLeafGeo = new THREE.BoxGeometry(0.18, 0.02, 0.26);

          const leaf1 = new THREE.Mesh(logLeafGeo, logLeafMat);
          leaf1.position.set(0.2, 1.8, 0.1);
          leaf1.rotation.set(0.4, 0.8, -0.2);
          leaf1.castShadow = true;
          branch1.add(leaf1);

          const leaf2 = new THREE.Mesh(logLeafGeo, logLeafMat);
          leaf2.position.set(-0.15, 1.4, 0.2);
          leaf2.rotation.set(-0.3, -0.6, 0.4);
          leaf2.castShadow = true;
          branch2.add(leaf2);

          const leaf3 = new THREE.Mesh(logLeafGeo, logLeafMat);
          leaf3.position.set(0.1, 1.0, -0.15);
          leaf3.rotation.set(0.2, 0.5, -0.1);
          leaf3.castShadow = true;
          branch3.add(leaf3);

          // (3 nấm hộp cũ trên thân gỗ đã thay bằng nấm giá quét 3D — nature/fungi.js)
          scene.add(bakeStatic(logGroup));

          // 2. Gốc cây bị cưa (Sawed Stump) tại x 102, y 7, z 115
          const stumpGroup = new THREE.Group();
          stumpGroup.position.set(X0 + 102, 7.0, Z0 + 115);

          // Tạo texture vân tròn cho lát cắt mặt gốc cây
          const stumpCanvas = document.createElement('canvas');
          stumpCanvas.width = 256; stumpCanvas.height = 256;
          const sCtx = stumpCanvas.getContext('2d');
          sCtx.fillStyle = '#c8a576'; sCtx.fillRect(0, 0, 256, 256);
          sCtx.lineWidth = 3.2;                                                      // nét vân gỗ đậm hơn (2.2 -> 3.2)
          const sRnd = mulberry32(8888);
          for (let r = 8; r < 128; r += 8) {
            sCtx.strokeStyle = `rgba(75, 48, 28, ${0.75 + sRnd() * 0.25})`;        // sắc độ tối hơn và opacity cao hơn
            sCtx.beginPath();
            const cx = 128 + (sRnd() - 0.5) * 5;
            const cy = 128 + (sRnd() - 0.5) * 5;
            const steps = 36;
            for (let j = 0; j <= steps; j++) {
              const theta = (j / steps) * Math.PI * 2;
              const radOffset = (Math.sin(theta * 3) + Math.cos(theta * 5)) * 1.5;
              const px = cx + Math.cos(theta) * (r + radOffset);
              const py = cy + Math.sin(theta) * (r + radOffset);
              if (j === 0) sCtx.moveTo(px, py); else sCtx.lineTo(px, py);
            }
            sCtx.stroke();
          }
          const sGrad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 35);
          sGrad.addColorStop(0, 'rgba(60, 40, 25, 0.65)');                           // tâm tối màu hơn
          sGrad.addColorStop(1, 'rgba(60, 40, 25, 0)');
          sCtx.fillStyle = sGrad; sCtx.beginPath(); sCtx.arc(128, 128, 35, 0, Math.PI * 2); sCtx.fill();

          const stumpRingTex = new THREE.CanvasTexture(stumpCanvas);
          const stumpTopMat = new THREE.MeshLambertMaterial({ color: 0xc8a576, map: stumpRingTex }); // màu nền mặt cắt tối dã dặn hơn
          // ---- GỖ CHẾT NỨT (gốc cây khô phong hoá): thay vỏ trụ trơn của mọi gốc cưa bằng 1 khối liền:
          //  · thân: chân bè ra thành 5 rễ chống (to ×1,4 sát đất, hết ở ~0,7 cao), 9–13 VẾT NỨT dọc khoét vào 7–15% bán kính (rộng 0,07–0,14 rad, dài ngẫu nhiên,
          //    loe ra giữa đoạn), lòng nứt tối (màu đỉnh), chân thân sẫm ẩm
          //  · mép trên gãy DẰM lởm chởm: vài mảnh dằm nhọn nhô lên cạnh vết nứt, mặt vát từ mép dằm xuống mặt cưa phơi gỗ nâu cam tươi; mặt cưa vân tròn giữ như cũ
          //  · màu: ảnh thủ tục chung (canvas 512²) gỗ xám bạc phong hoá, vệt nâu cam dọc thớ, thớ sợi mảnh, khe nứt nhỏ đen — lặp quanh thân theo chu vi ~0,7 m
          const deadWoodTex = (() => {
            const W = 512, c = document.createElement('canvas'); c.width = c.height = W; const x = c.getContext('2d'), r = mulberry32(31337);
            x.fillStyle = '#857766'; x.fillRect(0, 0, W, W);
            const vline = (x0, w, col, a, wob, y0 = 0, y1 = W) => { for (const dx of [0, -W, W]) { x.strokeStyle = col; x.globalAlpha = a; x.lineWidth = w; x.beginPath();   // nét dọc lượn nhẹ, vẽ 3 lần ⇒ lặp liền ngang
              for (let y = y0; y <= y1; y += 8) { const px = x0 + dx + wob * Math.sin(y * 0.021 + x0) + wob * 0.5 * Math.sin(y * 0.067 + x0 * 3); y === y0 ? x.moveTo(px, y) : x.lineTo(px, y); } x.stroke(); } x.globalAlpha = 1; };
            for (let k = 0; k < 26; k++) vline(r() * W, 10 + 40 * r(), r() < 0.55 ? '#b4aa9b' : '#6c5d4e', 0.35 + 0.3 * r(), 6 + 10 * r());   // mảng xám bạc · nâu xám
            for (let k = 0; k < 14; k++) { const y0 = r() * W * 0.7; vline(r() * W, 6 + 22 * r(), r() < 0.6 ? '#a8622f' : '#8c4e2a', 0.45 + 0.35 * r(), 4 + 6 * r(), y0, y0 + 120 + 300 * r()); }   // vệt nâu cam (vỏ bong lộ gỗ)
            for (let k = 0; k < 160; k++) vline(r() * W, 0.8 + 1.4 * r(), r() < 0.5 ? '#4a3c30' : '#cfc6b8', 0.25 + 0.35 * r(), 2 + 4 * r());   // thớ sợi mảnh tối / sáng
            for (let k = 0; k < 22; k++) { const y0 = r() * W * 0.8; vline(r() * W, 2 + 3 * r(), '#1f1610', 0.85, 3 + 4 * r(), y0, y0 + 60 + 260 * r()); }   // khe nứt nhỏ đen
            for (let k = 0; k < 4; k++) { const cx = r() * W, cy = r() * W, rr = 8 + 10 * r(); for (let q = 3; q > 0; q--) { x.fillStyle = q === 1 ? '#2a1d14' : q === 2 ? '#6b4a30' : '#9a8670'; x.beginPath(); x.ellipse(cx, cy, rr * q / 3, rr * q / 2.2, 0, 0, 6.283); x.fill(); } }   // mắt gỗ
            const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
          })();
          const DEAD_TONE = 0x8a8580;   // nhân ảnh vỏ ~0,53 ⇒ gỗ chết sẫm ẩm
          const deadWoodMat = new THREE.MeshLambertMaterial({ color: DEAD_TONE, map: deadWoodTex, vertexColors: true });
          // vệt đất sẫm quanh chân (đĩa mờ dần, không ghi chiều sâu) — gỗ như lún vào đất
          const sinkTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
            gr.addColorStop(0, 'rgba(20,14,8,0.95)'); gr.addColorStop(0.55, 'rgba(20,14,8,0.85)'); gr.addColorStop(0.68, 'rgba(26,18,10,0.45)'); gr.addColorStop(1, 'rgba(26,18,10,0)');
            x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
          const sinkMat = new THREE.MeshBasicMaterial({ map: sinkTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
          function deadStump(R0, R1, h, seed, topM = stumpTopMat, NA = 96, flat = false) {   // flat: mép trên phẳng, không dằm   // R0 bán kính đỉnh, R1 đáy, h cao mặt cưa → Mesh 2 nhóm: [0] thân + mặt vát dằm (deadWoodMat), [1] mặt cưa (topM)
            const SINK = Math.min(0.08, 0.12 * h + 0.02), r = mulberry32(seed), NY = 12, ph = r() * 6.283, hf = Math.min(h * 0.7, R1 * 1.2), rep = Math.max(1, Math.round(6.283 * R1 / 0.7));
            const cracks = Array.from({ length: 9 + (r() * 5 | 0) }, () => ({ a: r() * 6.283, w: 0.07 + 0.07 * r(), d: (0.07 + 0.08 * r()) * R1, y0: r() * 0.3, y1: 0.55 + 0.45 * r() }));
            // 2–3 KHE NỨT CHÍNH hình chữ V ăn sâu 30–48% bán kính, chạy từ gần chân lên hết đỉnh (cắt cả mặt cưa thành rãnh)
            for (let q = 2 + (r() * 2 | 0); q-- > 0;) cracks.push({ a: r() * 6.283, w: 0.1 + 0.05 * r(), d: (0.3 + 0.18 * r()) * R1, y0: 0.02 + 0.15 * r(), y1: 1.01, V: 1 });
            const crackAt = (a, v) => { let d = 0; for (const C of cracks) { let da = Math.abs(((a - C.a) % 6.283 + 9.425) % 6.283 - 3.1416); const span = C.y1 - C.y0, u = (v - C.y0) / span; if (u <= 0 || u >= 1) continue;
              if (C.V) { const w = C.w * Math.min(1, 0.4 + u * 3); if (da < w) d = Math.max(d, C.d * (1 - da / w) * Math.min(1, u * 5)); continue; }   // khe chính: chữ V nhọn, sâu đều tới đỉnh
              const w = C.w * (0.5 + 0.5 * Math.sin(u * 3.1416)); if (da < w) d = Math.max(d, C.d * (1 - (da / w) ** 2) * Math.min(1, Math.sin(u * 3.1416) * 2)); } return d; };
            const spl = Array.from({ length: 5 + (r() * 4 | 0) }, () => ({ a: r() < 0.6 ? cracks[(r() * cracks.length) | 0].a + (r() - 0.5) * 0.3 : r() * 6.283, w: 0.12 + 0.2 * r(), hh: (0.1 + 0.2 * r()) * Math.max(h, R0 * 0.6) }));
            const rim = flat ? () => 0 : a => { let y = 0.012 * Math.sin(a * 7 + ph) * R0; for (const S of spl) { const da = Math.abs(((a - S.a) % 6.283 + 9.425) % 6.283 - 3.1416); if (da < S.w) y = Math.max(y, S.hh * (1 - da / S.w)); } return y; };   // dằm nhọn
            const P = [], U = [], Cl = [], I = [], gi = [], top = [];
            for (let j = 0; j <= NY; j++) for (let i = 0; i <= NA; i++) {
              const a = i / NA * 6.283, v = j / NY, cr = crackAt(a, v), y = -0.06 - SINK + (h + 0.06 + SINK) * v + rim(a) * v ** 3;
              const lobe = Math.max(0, Math.cos(5 * a + ph)) ** 2, f = y < hf ? (1 - Math.max(0, y) / hf) ** 2 : 0, R = (R1 + (R0 - R1) * v) * (1 + 0.4 * f * (0.35 + 0.65 * lobe)) - cr;
              P.push(Math.cos(a) * R, y, Math.sin(a) * R); U.push(i / NA * rep, y / 0.7);
              const ao = 1 - 0.85 * THREE.MathUtils.smoothstep(cr, 0.02 * R1, 0.2 * R1), damp = (0.62 + 0.38 * Math.min(1, Math.max(0, y) / (0.3 * Math.max(h, 0.3)))) * (0.45 + 0.55 * THREE.MathUtils.smoothstep(y, 0, 0.07));   // đường bóng sát đất
              Cl.push(ao * damp, ao * damp, ao * damp);
            }
            for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) { const p = j * (NA + 1) + i, q = p + NA + 1; I.push(p, q, p + 1, p + 1, q, q + 1); }
            const b0 = P.length / 3;   // mặt vát: từ mép dằm (hàng trên cùng) xuống vòng trong ở mặt cưa — gỗ nâu cam tươi chỗ gãy
            const capR = a => Math.max(0.04 * R0, 0.86 * R0 - crackAt(a, 1));   // vòng trong mặt cưa lõm theo khe chính ⇒ rãnh nứt cắt vào mặt cưa
            for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283, ri = capR(a), dk = crackAt(a, 1) > 0.05 * R0; P.push(Math.cos(a) * ri, h, Math.sin(a) * ri); U.push(i / NA * rep, (h + 0.04) / 0.7); dk ? Cl.push(0.25, 0.2, 0.17) : Cl.push(1.15, 0.82, 0.6); }
            for (let i = 0; i <= NA; i++) Cl[(NY * (NA + 1) + i) * 3 + 1] *= 0.92, Cl[(NY * (NA + 1) + i) * 3 + 2] *= 0.85;
            for (let i = 0; i < NA; i++) { const p = NY * (NA + 1) + i, q = b0 + i; I.push(p, q, p + 1, p + 1, q, q + 1); }
            const nSide = I.length, c0 = P.length / 3;   // mặt cưa: quạt vòng trong → tâm, UV phẳng theo vân tròn
            P.push(0, h, 0); U.push(0.5, 0.5); Cl.push(1, 1, 1);
            for (let i = 0; i <= NA; i++) { const a = i / NA * 6.283, ri = capR(a), k = ri / (0.86 * R0); P.push(Math.cos(a) * ri, h, Math.sin(a) * ri); U.push(0.5 + 0.5 * k * Math.cos(a), 0.5 - 0.5 * k * Math.sin(a)); Cl.push(1, 1, 1); }
            for (let i = 0; i < NA; i++) I.push(c0, c0 + 2 + i, c0 + 1 + i);
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
            g.setAttribute('color', new THREE.Float32BufferAttribute(Cl, 3)); g.setIndex(I); g.addGroup(0, nSide, 0); g.addGroup(nSide, I.length - nSide, 1); g.computeVertexNormals();
            const m = new THREE.Mesh(g, [deadWoodMat, topM]); m.castShadow = m.receiveShadow = true;
            const sk = new THREE.Mesh(new THREE.CircleGeometry(R1 * 1.75, 40), sinkMat); sk.rotation.x = -Math.PI / 2; sk.position.y = 0.012; sk.renderOrder = 1; sk.name = 'Vệt lún chân gỗ'; m.add(sk);
            return m;
          }
          const _sw = new THREE.Vector3(), _sl = new THREE.Vector3();
          const seatSink = grp => { grp.updateMatrixWorld(true); grp.traverse(o => { if (o.name !== 'Vệt lún chân gỗ') return;   // vệt lún nằm đúng mặt đất (nền ô có thể cao hơn gốc nhóm)
            o.getWorldPosition(_sw); _sw.y = cowY(_sw.x, _sw.z) + 0.012; o.parent.worldToLocal(_sl.copy(_sw)); o.position.y = _sl.y; }); return grp; };
          deadWood = { seat: seatSink, stump: deadStump, mat: deadWoodMat, tex: deadWoodTex, tone: DEAD_TONE };

          // gỗ chết nứt (deadStump — trước: vỏ trụ trơn R 0,96 → 1,12 cao 0,45 + lõi R 0,92): cùng cỡ, mặt cưa cao 0,44
          stumpGroup.add(deadStump(0.96, 1.12, 0.44, 1150));
          scene.add(bakeStatic(seatSink(stumpGroup))); woodMossDab(stumpGroup, deadWoodMat, 'stump1', 115, 1.0, 0.16);   // gốc thấp 0,44 m: dải rêu chỉ sát đất   // chút rêu + lá cỏ thảm

          // Tạo thêm 10 gốc cây bị cưa nhỏ (đường kính < 1/2 gốc gốc ban đầu: R < 0.46) rải rác trong rừng
          const smRnd = mulberry32(54321);
          let scCount = 0, scTries = 0;
          while (scCount < 10 && scTries < 3000) {
            scTries++;
            const i = 3 + (smRnd() * (GX - 6) | 0), j = 3 + (smRnd() * (GZ - 6) | 0);
            if (!freeTree(i, j)) continue;
            const tx = wx(i) + (smRnd() - 0.5) * BLOCK;
            const tz = wz(j) + (smRnd() - 0.5) * BLOCK;
            // Tránh xa xe caravan để giữ thăng bằng bố cục
            if (Math.hypot(tx - (X0 + 74), tz - (Z0 + 103)) < 20) continue;

            const ty = surfaceY(i, j);
            const r = 0.26 + smRnd() * 0.16; // bán kính từ 0.26 đến 0.42 (nhỏ hơn một nửa của 0.92)
            const h = (0.18 + smRnd() * 0.16) * (1.0 + smRnd() * 2.0); // chiều cao ngẫu nhiên, tối đa gấp 3 lần baseline

            const sg = new THREE.Group();
            sg.position.set(tx, ty, tz);
            sg.rotation.y = smRnd() * 6.28;
            sg.name = 'Gốc cây nhỏ rải rác (Small Stump)';

            sg.add(deadStump(r * 1.04, r * 1.2, h * 0.98, 2000 + scCount));   // gỗ chết nứt (trước: vỏ trụ trơn r ×1,04 → ×1,2 + lõi r)

            scene.add(bakeStatic(seatSink(sg)));
            scCount++;
          }
        })();

        // ---- Khúc gỗ đứng (Wood Post) tại x 106, y 7, z 109 — thân gỗ cụt, mặt cắt vân tròn + 2 mấu cành ----
        (function woodPost() {
          const g = new THREE.Group();
          g.position.set(X0 + 106, 7.0, Z0 + 109); g.rotation.set(0.03, 0.6, 0.04); g.name = 'Khúc gỗ đứng (Wood Post)';
          const innerMat = new THREE.MeshLambertMaterial({ color: 0xd2af82, flatShading: true });    // gỗ sáng ở mặt cắt (đậm hơn một chút)
          // mặt cắt vân tròn (tree rings) vẽ lên canvas
          const rc = document.createElement('canvas'); rc.width = rc.height = 128; const rx = rc.getContext('2d');
          rx.fillStyle = '#d2af82'; rx.fillRect(0, 0, 128, 128); rx.lineWidth = 2.2;                 // nét vẽ vân to hơn
          const rnd = mulberry32(106109);
          for (let r = 5; r < 60; r += 5) {
            rx.strokeStyle = `rgba(85, 55, 30, ${0.75 + rnd() * 0.25})`; rx.beginPath();           // vân màu đậm hơn, rõ nét hơn
            const cx = 64 + (rnd() - 0.5) * 4, cy = 64 + (rnd() - 0.5) * 4, steps = 30;
            for (let j = 0; j <= steps; j++) { const th = j / steps * 6.283, off = (Math.sin(th * 3) + Math.cos(th * 5)) * 1.1, px = cx + Math.cos(th) * (r + off), py = cy + Math.sin(th) * (r + off); j ? rx.lineTo(px, py) : rx.moveTo(px, py); }
            rx.stroke();
          }
          const topMat = new THREE.MeshLambertMaterial({ color: 0xd2af82, map: new THREE.CanvasTexture(rc) });
          const postEdgeMat = new THREE.LineBasicMaterial({ color: 0x14100d });
          // thân gỗ đứng (side=vỏ, top=vân tròn, bottom=vỏ)
          // thân = gỗ chết nứt như gốc cưa (deadStump: chân bè rễ, khe chính chữ V ăn sâu vào lõi,
          //  cắt cả mặt cưa, (bỏ dằm, mép trên phẳng), gỗ xám bạc + vệt cam) thay trụ vỏ đen trơn; cùng cỡ R 0,5 → 0,6, cao 1,9; mấu cành cùng gỗ (ảnh, không màu đỉnh)
          const H = 1.9, body = deadWood.stump(0.5, 0.6, H, 106109, topMat, 128, true); g.add(body);
          const stubMat = new THREE.MeshLambertMaterial({ color: deadWood.tone, map: deadWood.tex });
          // 2 mấu cành cụt: đầu bị cưa lộ gỗ sáng
          function stub(px, py, pz, rz, ry, len) {
            const s = new THREE.Group(); s.position.set(px, py, pz); s.rotation.set(0, ry, rz); g.add(s);
            const geo = new THREE.CylinderGeometry(0.1, 0.16, len, 8);
            const m = new THREE.Mesh(geo, stubMat); m.position.y = len / 2; m.castShadow = true; edge(m, geo, postEdgeMat); s.add(m);
            const cap = new THREE.Mesh(new THREE.CircleGeometry(0.092, 8), innerMat); cap.rotation.x = -Math.PI / 2; cap.position.y = len + 0.002; s.add(cap);
          }
          stub(0.44, 1.16, 0.05, -1.15, 0.05, 0.55);    // mấu trên, chĩa phải-lên
          stub(-0.44, 0.58, -0.06, 1.2, -0.35, 0.46);   // mấu dưới, chĩa trái-lên
          scene.add(bakeStatic(deadWood.seat(g))); woodMossDab(g, deadWood.mat, 'post1', 109); woodMossDab(g, stubMat, 'post2', 110);   // chút rêu + lá cỏ thảm
        })();

        // ---- cây HOA ANH ĐÀO (cherry blossom) — tán hoa hồng dày bằng hàng trăm cube tí hon ----
        const cherryBark = new THREE.MeshLambertMaterial({ color: 0x6b4f3a, transparent: true, opacity: 0.75 }); cherryBark.userData.sfL = 0.55; Object.assign(cherryBark.userData, { sfTex: 1, sfTint: new THREE.Vector3(1.12, 0.9, 0.8), sfTop: 0.15 });   // rêu chân thân sẵn có + rêu mặt trên 0,15 (táo già 0,5) ⇒ thảm rêu lá cỏ (nature/moss-lawn.js) tự mọc   // anh đào: ảnh vỏ quét nhuộm nâu đỏ
        const cherryPinks = [0xffd1dc, 0xffb7c5, 0xffc0cb, 0xf6a5c0, 0xffe3ec, 0xff9fb6];
        function cherryTree(s) {   // cây anh đào ĐỆ QUY — tán hoa cube instanced ở cành tận cùng + chùm trung tâm
          const g = new THREE.Group();
          const rig = TREE_RIG_ON, { tips, rnd, flowerPts, flowerW, limbs } = recTree(g, { rig, seed: 4242, s, barkMat: cherryBark, trunkLen: 2.53 * s, trunkR: 0.33 * s, maxDepth: 4, nMin: 3, nMax: 3, lenK: 0.78, radK: 0.55, spread: 1.05, upBias: 0.05, recursiveLeaves: true, firstSplitN: 4 });
          const blossomPts = [], leafPts = [], blossomW = [], leafW = [];
          flowerPts.forEach((pt, i) => { const lf = rnd() < 0.25; (lf ? leafPts : blossomPts).push(pt); if (rig) (lf ? leafW : blossomW).push(flowerW[i]); });
          // anh đào: thân mảnh, tán nhẹ → tần số riêng ~0,55 Hz, nghiêng nhiều hơn cây cổ thụ; hoa rung mạnh hơn lá
          // rig: xương cành (161 cành ≤ 256 xương) — amp = góc cành cấp 1 khi gió 30 km/h (× TREE_SWAY_K), grow = cành con mềm hơn mẹ, freq / dài cành = Hz
          const tw = makeTreeWind({ freq: 0.55, zeta: 0.1, lean: 0.3, branchAmp: 0.06, sway: 0.5, rig: rig ? { amp: 0.055, grow: 1.35, freq: 2 } : null });
          windShader(cherryBark, tw, 0); surfaceStyle(cherryBark, 'bark');   // vân vỏ cây SAU shader gió (surfaceStyle nối tiếp onBeforeCompile; windShader thì ghi đè)
          const imB = tuftInstanced(g, rnd, blossomPts, new THREE.BoxGeometry(0.17 * s, 0.17 * s, 0.17 * s), cherryPinks, 0.75, 1, tw, 0.035);
          const imL = tuftInstanced(g, rnd, leafPts, leafHexGeo(0.09 * s), [0x86a364, 0x78935b, 0x6e8754, 0x61784a], 0.90, 1, tw, 0.03);
          if (rig) { imB.geometry.setAttribute('aBr', rigAttr(blossomW)); imL.geometry.setAttribute('aBr', rigAttr(leafW)); g.userData.rigLimbs = limbs.map(l => ({ o: l.P[0], t: l.P[l.P.length - 1], par: l.par ? l.par.bi : 0, d: l.d })); }
          const _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _sc = new THREE.Vector3(1, 1, 1), _mm = new THREE.Matrix4(), _col = new THREE.Color();
          // vài cánh hoa rụng dưới gốc
          const fallen = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13 * s, 0.002 * s, 0.13 * s), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.75 }), 26);
          for (let k = 0; k < 26; k++) {
            const a = rnd() * 6.283, r = rnd() * 2.2 * s; _q.setFromEuler(new THREE.Euler(0, rnd() * 3.14, 0)); _p.set(Math.cos(a) * r, 0.03 * s, Math.sin(a) * r); _mm.compose(_p, _q, _sc); fallen.setMatrixAt(k, _mm);
            _col.setHex(cherryPinks[(rnd() * cherryPinks.length) | 0]); fallen.setColorAt(k, _col);
          }
          fallen.instanceMatrix.needsUpdate = true; if (fallen.instanceColor) fallen.instanceColor.needsUpdate = true; g.add(fallen); fallen.name = 'Cánh hoa rụng dưới gốc';
          bakeStatic(g);   // gộp cành cherryBark thành 1 mesh (các InstancedMesh hoa được bake bỏ qua, giữ nguyên)
          g.userData.treeWind = tw; g.userData.blossomPts = Float32Array.from(blossomPts.flat()); g.userData.fallen = fallen;   // cánh hoa rơi sinh từ chính các chùm hoa (toạ độ cục bộ)
          return g;
        }
