        // ---- MẪU NHÁNH ĐỆ QUY DÙNG CHUNG cho rừng: 12 biến thể ngẫu nhiên để tăng tính đa dạng ----
        const forestBark = new THREE.MeshLambertMaterial({ color: 0xcbb488, transparent: true, opacity: 0.5 });   // gỗ tan sáng — CÂY RỪNG luôn trong suốt 50%
        forestWindShader(forestBark);   // cành cây rừng nghiêng theo gió cùng khối tán
        for (let v = 0; v < 12; v++) {
          const tmp = new THREE.Group();
          // cành tự nhiên (G 15/10, học mẫu GLB): thân chính tới ngọn cao ~4,2 · gốc trơn 18–26% · 10–13 cành bên: dưới xoè ~70° gần ngang rồi uốn cong lên,
          // trên xoè ~40° · mỗi cành bên 3–4 cành con xoè ~34° · cành con chẻ đôi ở đầu · gấp khúc rõ; gốc to 0,165 như cũ
          const { tips } = recTree(tmp, { natural: true, seed: 20260708 + v * 9173, barkMat: forestBark, height: 4.2, trunkR: 0.165, bole: 0.18 + 0.08 * (v % 3) / 2,
            nLat0: [10, 13], ang0: 0.95, angTaper: 0.5, latLen: 0.55, bend: 0.55, nLat1: [3, 4], ang1: 0.6, subLen: 0.5, maxDepth: 3, tipK: 0.15, childK: 0.6, gnarl: 0.26, leafP: 0.12 });   // ~16 khối tán / cây (cũ 8–18)
          tmp.updateMatrixWorld(true);
          const geos = []; tmp.traverse(o => { if (o.isMesh && o.geometry) { const g2 = o.geometry.clone(); g2.applyMatrix4(o.matrixWorld); geos.push(g2); } });
          const merged = mergeGeometries ? mergeGeometries(geos, false) : geos[0];
          for (const geo of geos) if (geo !== merged) geo.dispose();
          tmp.traverse(o => { if (o.geometry) o.geometry.dispose(); });
          tmp.clear();
          vegPools['recbranch' + v] = { geo: merged, mat: forestBark, color: false, cast: true, list: [] };
          _forestVariants.push({ key: 'recbranch' + v, tips: tips.map(t => t.clone()), top: Math.max(...tips.map(t => t.y)) });
        }
        // ---- đặt cây rừng (bỏ cây thông → cây nhánh đệ quy) ----
        {
          let tn = 0, tt = 0;
          while (tn < 138 && tt < 14000) {
            tt++; const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
            if (!freeTree(i, j)) continue;
            const tx = wx(i), ty = surfaceY(i, j), tz = wz(j);
            addTreeInst(1.575 + Math.random() * 1.05, tx, ty, tz, Math.random() * 6.28);   // to thêm 75% (0.9→1.575)
            treeCoords.push({ x: tx, y: ty, z: tz }); tn++;
          }
          let bn = 0, bt = 0;
          while (bn < 3 && bt < 4000) {
            bt++; const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
            if (!freeTree(i, j)) continue;
            const tx = wx(i), ty = surfaceY(i, j), tz = wz(j);
            addTreeInst(3.5 + Math.random() * 1.4, tx, ty, tz, Math.random() * 6.28);   // to thêm 75% (2.0→3.5)
            treeCoords.push({ x: tx, y: ty, z: tz }); bn++;
          }
        }
        // ---- 2 cây táo (ĐỆ QUY) cạnh caravan ----
        function fruitTree(s, seed) {
          const g = new THREE.Group();
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x6b4f3a, transparent: true, opacity: 0.90 });   // thân cây rõ hơn 20% (0.75 * 1.2 = 0.90)
          const { tips, rnd } = recTree(g, { seed, s, barkMat, trunkLen: 1.7 * s, trunkR: 0.125 * s, maxDepth: 4, nMin: 2, nMax: 3, lenK: 0.74, radK: 0.6, spread: 0.72, upBias: 0.22, firstSplitN: 4 });
          const pts = []; for (const tp of tips) cloudPts(rnd, tp.x, tp.y + 0.08 * s, tp.z, 0.62 * s, 40, pts);
          cloudPts(rnd, 0, 2.7 * s, 0, 1.05 * s, 130, pts);   // chùm trung tâm cho tán dày ruột
          tuftInstanced(g, rnd, pts, new THREE.CylinderGeometry(0.09 * s, 0.09 * s, 0.003 * s, 6), [0x86a364, 0x78935b, 0x6e8754, 0x61784a], 0.60); g.userData.leafPts = pts;   // điểm lá: lá rụng theo cơn giật (nature/wind-field.js)   // lá cây trong suốt hơn 20% (0.75 * 0.8 = 0.60)
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

          const AK = 0.8;   // G 14/10: quả táo nhỏ đi 20%
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
            fruit.add(apple); apples.push({ g: apple, home: apple.position.clone(), rot: apple.rotation.y, on: true, sw: 0, sv: 0, swy: 0, svy: 0 });
          }
          const out = bakeStatic(g);   // gộp toàn bộ cành theo vật liệu → vài draw call/cây
          out.add(fruit); out.userData.apples = apples; out.userData.appleR = 0.12 * s * AK;   // quả gắn SAU khi gộp: lô vẽ chung (draw-batch) vẫn gom chung 1 lượt vẽ
          return out;
        }

        const ft1 = fruitTree(1.25, 1337), ft2 = fruitTree(1.35, 2024);
        ft1.scale.multiplyScalar(NATURE_SCALE); ft2.scale.multiplyScalar(NATURE_SCALE);
        ft1.position.copy(worldCell(21.5, 31.5)); ft1.rotation.y = -1.852; scene.add(ft1);
        ft2.position.copy(worldCell(24.5, 34.5)); ft2.rotation.y = -0.794; scene.add(ft2);
        flightRoots.push(ft1, ft2);
        const appleTrees = [ft1, ft2];   // kỹ sư hái táo (engineer/apple-pick.js)
        for (const T of appleTrees) obstacleCoords.push({ x: T.position.x, y: T.position.y, z: T.position.z, r: 0.35, h: 3 });   // thân cây: người & chó đi vòng

        function deadLogOut(x, z, m) {   // (x, z) nằm dưới thân khúc gỗ chết (cách trục < bán kính + m) → điểm dời ra mép gần nhất; ở ngoài → null
          const L = deadLog; if (!L) return null;
          const ux = L.bx - L.ax, uz = L.bz - L.az, ll = ux * ux + uz * uz, k = Math.max(0, Math.min(1, ((x - L.ax) * ux + (z - L.az) * uz) / ll));
          const cx = L.ax + ux * k, cz = L.az + uz * k, r = L.ra + (L.rb - L.ra) * k + m; let dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
          if (d >= r) return null;
          if (d < 1e-4) { dx = -uz; dz = ux; d = Math.sqrt(ll); }
          return [cx + dx / d * r, cz + dz / d * r];
        }
        // ---- Khúc gỗ chết (Dead Log) + Gốc cây bị cưa (Sawed Stump) ----
        let deadLog = null;   // trục thân gỗ chết trên mặt đất (đầu a to r 0,70 · đầu b nhỏ r 0,56) — cỏ / hoa không mọc xuyên (nature/grass-scatter.js)
        (function environmentalDetails() {
          const logBarkMat = new THREE.MeshLambertMaterial({ color: 0x2d251d, flatShading: true, side: THREE.DoubleSide });
          const stumpBarkMat = new THREE.MeshLambertMaterial({ color: 0x6e5744 });
          const innerWoodMat = new THREE.MeshLambertMaterial({ color: 0xd7b889, flatShading: true, side: THREE.DoubleSide });

          // 1. Khúc gỗ chết lớn (Dead Log) rỗng x2 tại x 101, y 7, z 105
          const logGroup = new THREE.Group();
          logGroup.position.set(X0 + 101.0, 7.0 + 0.50, Z0 + 104.5); // Hạ thấp hơn một chút theo yêu cầu
          logGroup.rotation.set(0.08, -Math.atan2(101.0 - 108.0, 102.0 - 100.0), Math.PI / 2); // Nằm ngang hơi xiên góc
          logGroup.updateMatrixWorld(true);
          { const a = new THREE.Vector3(0, -3.8, 0).applyMatrix4(logGroup.matrixWorld), b = new THREE.Vector3(0, 3.8, 0).applyMatrix4(logGroup.matrixWorld); deadLog = { ax: a.x, az: a.z, bx: b.x, bz: b.z, ra: 0.70, rb: 0.56 }; }

          // Vỏ ngoài của khúc gỗ lớn x2 (openEnded = true)
          const logMain = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.70, 7.6, 8, 1, true), logBarkMat);
          logMain.castShadow = true; logMain.receiveShadow = true; logGroup.add(logMain);

          // Lớp lõi rỗng bên trong x2 (openEnded = true)
          const logInner = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.58, 7.64, 8, 1, true), innerWoodMat);
          logInner.castShadow = true; logInner.receiveShadow = true; logGroup.add(logInner);

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

          // Thêm 3 cây nấm kích thước khác nhau trên khúc gỗ rỗng (growing on the bark)
          function createMushroom(s) {
            const mGroup = new THREE.Group();
            const stalkMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }); // thân nấm trắng ngà
            const capMat = new THREE.MeshLambertMaterial({ color: 0xd84a3a, flatShading: true }); // mũ nấm đỏ cam

            const stalk = bx(0.04 * s, 0.14 * s, 0.04 * s, stalkMat, false, false);
            stalk.position.y = 0.07 * s; mGroup.add(stalk);

            const cap = bx(0.12 * s, 0.06 * s, 0.12 * s, capMat, false, false);
            cap.position.y = 0.14 * s; mGroup.add(cap);
            return mGroup;
          }

          const mush1 = createMushroom(1.3);
          mush1.position.set(0.15, -1.2, 0.65); mush1.rotation.set(0.1, 0, -0.2); logGroup.add(mush1);

          const mush2 = createMushroom(0.85);
          mush2.position.set(-0.2, 0.2, 0.60); mush2.rotation.set(-0.15, 0.1, 0.15); logGroup.add(mush2);

          const mush3 = createMushroom(1.05);
          mush3.position.set(0.05, 1.6, 0.62); mush3.rotation.set(0.05, -0.15, -0.05); logGroup.add(mush3);

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

          // Vỏ cây xù xì bên ngoài (Đường kính tăng 4 lần: R_top = 0.96, R_bottom = 1.12)
          const stumpBark = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.12, 0.45, 12, 1, true), stumpBarkMat);
          stumpBark.position.y = 0.225; stumpBark.castShadow = true; stumpBark.receiveShadow = true; stumpGroup.add(stumpBark);

          // Lõi gỗ bên trong (Đường kính tăng 4 lần: R = 0.92)
          const stumpInner = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.44, 12), [innerWoodMat, stumpTopMat, innerWoodMat]);
          stumpInner.position.y = 0.22; stumpInner.castShadow = true; stumpInner.receiveShadow = true; stumpGroup.add(stumpInner);
          scene.add(bakeStatic(stumpGroup));

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

            // Vỏ ngoài của gốc nhỏ
            const sBark = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.04, r * 1.2, h, 8, 1, true), stumpBarkMat);
            sBark.position.y = h / 2; sBark.castShadow = true; sBark.receiveShadow = true; sg.add(sBark);

            // Lõi gỗ bên trong
            const sInner = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h * 0.98, 8), [innerWoodMat, stumpTopMat, innerWoodMat]);
            sInner.position.y = h * 0.49; sInner.castShadow = true; sInner.receiveShadow = true; sg.add(sInner);

            scene.add(bakeStatic(sg));
            scCount++;
          }
        })();

        // ---- Khúc gỗ đứng (Wood Post) tại x 106, y 7, z 109 — thân gỗ cụt, mặt cắt vân tròn + 2 mấu cành ----
        (function woodPost() {
          const g = new THREE.Group();
          g.position.set(X0 + 106, 7.0, Z0 + 109); g.rotation.set(0.03, 0.6, 0.04); g.name = 'Khúc gỗ đứng (Wood Post)';
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x2d251d });                        // vỏ nâu xám tối cùng tông khúc gỗ chết
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
          const H = 1.9, bodyGeo = new THREE.CylinderGeometry(0.5, 0.6, H, 12);
          const body = new THREE.Mesh(bodyGeo, [barkMat, topMat, barkMat]); body.position.y = H / 2; body.castShadow = true; body.receiveShadow = true; edge(body, bodyGeo, postEdgeMat); g.add(body);
          // 2 mấu cành cụt: đầu bị cưa lộ gỗ sáng
          function stub(px, py, pz, rz, ry, len) {
            const s = new THREE.Group(); s.position.set(px, py, pz); s.rotation.set(0, ry, rz); g.add(s);
            const geo = new THREE.CylinderGeometry(0.1, 0.16, len, 8);
            const m = new THREE.Mesh(geo, barkMat); m.position.y = len / 2; m.castShadow = true; edge(m, geo, postEdgeMat); s.add(m);
            const cap = new THREE.Mesh(new THREE.CircleGeometry(0.092, 8), innerMat); cap.rotation.x = -Math.PI / 2; cap.position.y = len + 0.002; s.add(cap);
          }
          stub(0.44, 1.16, 0.05, -1.15, 0.05, 0.55);    // mấu trên, chĩa phải-lên
          stub(-0.44, 0.58, -0.06, 1.2, -0.35, 0.46);   // mấu dưới, chĩa trái-lên
          scene.add(bakeStatic(g));
        })();

        // ---- cây HOA ANH ĐÀO (cherry blossom) — tán hoa hồng dày bằng hàng trăm cube tí hon ----
        const cherryBark = new THREE.MeshLambertMaterial({ color: 0x6b4f3a, transparent: true, opacity: 0.75 });
        const cherryPinks = [0xffd1dc, 0xffb7c5, 0xffc0cb, 0xf6a5c0, 0xffe3ec, 0xff9fb6];
        function cherryTree(s) {   // cây anh đào ĐỆ QUY — tán hoa cube instanced ở cành tận cùng + chùm trung tâm
          const g = new THREE.Group();
          const { tips, rnd, flowerPts } = recTree(g, { seed: 4242, s, barkMat: cherryBark, trunkLen: 2.53 * s, trunkR: 0.33 * s, maxDepth: 4, nMin: 3, nMax: 3, lenK: 0.78, radK: 0.55, spread: 1.05, upBias: 0.05, recursiveLeaves: true, firstSplitN: 4 });
          const blossomPts = [], leafPts = [];
          for (const pt of flowerPts) {
            if (rnd() < 0.25) leafPts.push(pt); else blossomPts.push(pt);
          }
          // anh đào: thân mảnh, tán nhẹ → tần số riêng ~0,55 Hz, nghiêng nhiều hơn cây cổ thụ; hoa rung mạnh hơn lá
          const tw = makeTreeWind({ freq: 0.55, zeta: 0.1, lean: 0.3, branchAmp: 0.06 });
          windShader(cherryBark, tw, 0);
          tuftInstanced(g, rnd, blossomPts, new THREE.BoxGeometry(0.17 * s, 0.17 * s, 0.17 * s), cherryPinks, 0.75, 1, tw, 0.035);
          tuftInstanced(g, rnd, leafPts, new THREE.CylinderGeometry(0.09 * s, 0.09 * s, 0.003 * s, 6), [0x86a364, 0x78935b, 0x6e8754, 0x61784a], 0.90, 1, tw, 0.03);
          const _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _sc = new THREE.Vector3(1, 1, 1), _mm = new THREE.Matrix4(), _col = new THREE.Color();
          // vài cánh hoa rụng dưới gốc
          const fallen = new THREE.InstancedMesh(new THREE.BoxGeometry(0.13 * s, 0.002 * s, 0.13 * s), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.75 }), 26);
          for (let k = 0; k < 26; k++) {
            const a = rnd() * 6.283, r = rnd() * 2.2 * s; _q.setFromEuler(new THREE.Euler(0, rnd() * 3.14, 0)); _p.set(Math.cos(a) * r, 0.03 * s, Math.sin(a) * r); _mm.compose(_p, _q, _sc); fallen.setMatrixAt(k, _mm);
            _col.setHex(cherryPinks[(rnd() * cherryPinks.length) | 0]); fallen.setColorAt(k, _col);
          }
          fallen.instanceMatrix.needsUpdate = true; if (fallen.instanceColor) fallen.instanceColor.needsUpdate = true; g.add(fallen); fallen.name = 'Cánh hoa rụng dưới gốc';
          bakeStatic(g);   // gộp cành cherryBark thành 1 mesh (các InstancedMesh hoa được bake bỏ qua, giữ nguyên)
          g.userData.treeWind = tw; g.userData.blossomPts = blossomPts; g.userData.fallen = fallen;   // cánh hoa rơi sinh từ chính các chùm hoa (toạ độ cục bộ)
          return g;
        }
