        // ---- build terrain (cull hidden underground voxels -> 98% bodies reduced, zero lag) ----
        const grass = [], shore = [], bodies = [], waters = [], riverbed = [];
        // G 16/10 (bước 5): CHỈ DỰNG MẶT LỘ RA. Ô mặt đất: mặt trên + mặt bên giáp ô thấp hơn / nước / ngoài bản đồ. Thân cột: chỉ mặt bên giáp cột
        // thấp hơn đỉnh thân (giữ nguyên chiều cao thân cũ ⇒ texture y hệt; phần chìm trong cột cạnh bị che). Đáy sông: mặt trên + mặt bên giáp ô nước
        // có đáy thấp hơn / khe thân đập / mép bản đồ (giáp bờ: thân cột bờ xuống tới 0 che kín). Không vẽ mặt đáy nào.
        // lớp đáy sông của ô nước (dùng cả khi xét mặt bên giáp ô nước cạnh)
        const bedOf = (i, j) => {
          const surf = Math.round((j < DAM_J ? RES : DOWN) * S);
          // 0 giữa lòng → 1 mép bờ
          const dd = riverDist(i, j), hh = Math.max(1, riverHalf(j)), tt = Math.min(1, dd / hh);
          // đáy nhấp nhô, sâu ở giữa
          const bed = Math.round(surf - (1 + 2.6 * (1 - tt * tt)) + Math.sin(i * 0.5) * Math.sin(j * 0.4 + 1.1) * 0.8);
          return Math.max(0, Math.min(surf - 1, bed));
        };
        // cột cạnh: nước / ngoài bản đồ = 0
        const colH = (ni, nj) => (ni < -MX || ni >= GX + MX || nj < -MZ || nj >= GZ + MZ || gridWater[(ni + MX) * gridD + nj + MZ]) ? 0 : gridH[(ni + MX) * gridD + nj + MZ];
        // −1: nước / ngoài bản đồ / cột đã xoá
        const cellTop = (ni, nj) => (ni < -MX || nj < -MZ || ni >= GX + MX || nj >= GZ + MZ || (ni === 158 && nj === 103) || gridWater[(ni + MX) * gridD + nj + MZ]) ? -1 : gridH[(ni + MX) * gridD + nj + MZ];
        for (let i = -MX; i < GX + MX; i++) {
          const gi = (i + MX) * gridD;
          for (let j = -MZ; j < GZ + MZ; j++) {
            if (i === 158 && j === 103) continue; // xóa cột block theo yêu cầu
            const idx = gi + (j + MZ);

            if (gridWater[idx]) {
              // dam gap (smooth dam covers)
              if (j >= DAM_J && j < DAM_J + 2 * S) continue;
              const surf = Math.round((j < DAM_J ? RES : DOWN) * S), bed = bedOf(i, j);
              // mặt bên khối đáy lộ ra?
              const bedSide = (ni, nj) => {
                if (ni < -MX || ni >= GX + MX || nj < -MZ || nj >= GZ + MZ) return true;
                const n = (ni + MX) * gridD + nj + MZ; if (!gridWater[n]) return gridH[n] < bed;
                return (nj >= DAM_J && nj < DAM_J + 2 * S) || bedOf(ni, nj) < bed;
              };
              // lớp đáy sông nhìn thấy qua nước
              if (bed > 0) riverbed.push({ x: wx(i), y: (bed - 0.5) * BLOCK, z: wz(j), sy: 1, m: 4 | (bedSide(i + 1, j) ? 1 : 0) | (bedSide(i - 1, j) ? 2 : 0) | (bedSide(i, j + 1) ? 16 : 0) | (bedSide(i, j - 1) ? 32 : 0) });
              const wh = surf - bed;
              // cột nước nằm trên đáy
              waters.push({ x: wx(i), y: (bed + wh / 2) * BLOCK, z: wz(j), sy: wh, i, j });
              continue;
            }

            const h = gridH[idx];
            const top = h - 1;
            const nearWater = (i + 1 < GX + MX && gridWater[gi + gridD + (j + MZ)]) ||
              (i - 1 >= -MX && gridWater[gi - gridD + (j + MZ)]) ||
              (j + 1 < GZ + MZ && gridWater[gi + (j + 1 + MZ)]) ||
              (j - 1 >= -MZ && gridWater[gi + (j - 1 + MZ)]) ||
              poolMetric(i, j) < 1.55;

            // mặt bên lộ ra (bit +x 1 · −x 2 · +z 4 · −z 8); 0 = ô phẳng (4 mặt bên bị ô cạnh che hết)
            const sides = (cellTop(i + 1, j) < h ? 1 : 0) | (cellTop(i - 1, j) < h ? 2 : 0) | (cellTop(i, j + 1) < h ? 4 : 0) | (cellTop(i, j - 1) < h ? 8 : 0);
            (nearWater ? shore : grass).push([wx(i), wy(top), wz(j), sides]);

            // CULL CÁC VOXEL CHÌM KHÔNG NHÌN THẤY:
            // Cột thân đất (bodies) chỉ nhìn thấy khi có ít nhất 1 mặt bên lộ ra (giáp nước, mép bản đồ, hoặc hàng xóm thấp hơn)
            if (top > 0) {
              const a = colH(i + 1, j), b = colH(i - 1, j), c = colH(i, j + 1), d = colH(i, j - 1), minH = Math.min(top, a, b, c, d);
              // thân từ cột cạnh thấp nhất tới đỉnh như cũ; chỉ vẽ mặt bên giáp cột thấp hơn đỉnh thân
              if (minH < top) bodies.push({ x: wx(i), y: (minH + top) * BLOCK / 2, z: wz(j), sy: top - minH, m: (a < top ? 1 : 0) | (b < top ? 2 : 0) | (c < top ? 16 : 0) | (d < top ? 32 : 0) });
            }
          }
        }
        instanced(grass, grassMat, true, true);
        grass.length = 0; // Giải phóng mảng RAM lập tức
        instanced(shore, shoreMat, true, true);
        shore.length = 0;
        instancedScaled(bodies, dirtMat);
        bodies.length = 0;
        instancedScaled(riverbed, sandMat);
        riverbed.length = 0;
        if (waters.length > 0) {
          // khoảng cách (ô) từ mỗi ô nước tới bờ gần nhất (≤ 6) — loang BFS từ các ô đất giáp nước (kể cả khe thân đập) → bọt + nước nông ven bờ
          const NC = gridW * gridD, shoreD = new Uint8Array(NC).fill(255), cellDepth = new Float32Array(NC), qu = new Int32Array(NC); let qh = 0, qt = 0;
          const isLandIdx = (ii, jj) => { const idx = ii * gridD + jj; return !gridWater[idx] || (jj - MZ >= DAM_J && jj - MZ < DAM_J + 2 * S); };
          for (let ii = 0; ii < gridW; ii++) for (let jj = 0; jj < gridD; jj++) {
            if (!isLandIdx(ii, jj)) continue;
            const idx = ii * gridD + jj; shoreD[idx] = 0;
            if ((ii + 1 < gridW && !isLandIdx(ii + 1, jj)) || (ii > 0 && !isLandIdx(ii - 1, jj)) || (jj + 1 < gridD && !isLandIdx(ii, jj + 1)) || (jj > 0 && !isLandIdx(ii, jj - 1))) qu[qt++] = idx;
          }
          while (qh < qt) {
            const idx = qu[qh++], d = shoreD[idx]; if (d >= 6) continue;
            const ii = (idx / gridD) | 0, jj = idx - ii * gridD;
            if (ii + 1 < gridW && shoreD[idx + gridD] > d + 1) { shoreD[idx + gridD] = d + 1; qu[qt++] = idx + gridD; }
            if (ii > 0 && shoreD[idx - gridD] > d + 1) { shoreD[idx - gridD] = d + 1; qu[qt++] = idx - gridD; }
            if (jj + 1 < gridD && shoreD[idx + 1] > d + 1) { shoreD[idx + 1] = d + 1; qu[qt++] = idx + 1; }
            if (jj > 0 && shoreD[idx - 1] > d + 1) { shoreD[idx - 1] = d + 1; qu[qt++] = idx - 1; }
          }
          for (const w of waters) cellDepth[(w.i + MX) * gridD + w.j + MZ] = w.sy * BLOCK;
          // mặt nước = 1 ô vuông phẳng (rộng 1,02 khối) trên mỗi cột nước, ghi thẳng vào mảng (nhanh hơn dựng hàng nghìn PlaneGeometry rồi gộp)
          const nW = waters.length, wPos = new Float32Array(nW * 12), wNrm = new Float32Array(nW * 12), wAttr = new Float32Array(nW * 16), wIdx = new Uint32Array(nW * 6), a = BLOCK * 0.51;
          const cellD = (i, j) => (i < -MX || j < -MZ || i >= GX + MX || j >= GZ + MZ) ? 0 : cellDepth[(i + MX) * gridD + j + MZ];
          const cellS = (i, j) => (i < -MX || j < -MZ || i >= GX + MX || j >= GZ + MZ) ? 0 : Math.min(6, shoreD[(i + MX) * gridD + j + MZ]);
          waters.forEach((w, wi) => {
            const topY = w.y + (w.sy * BLOCK) / 2, i = w.i, j = w.j;
            for (let v = 0; v < 4; v++) {   // góc (−,−) (+,−) (−,+) (+,+): trung bình 4 ô quanh góc → độ sâu, độ gần bờ chuyển mượt qua các ô
              const si = v & 1 ? 1 : -1, sj = v & 2 ? 1 : -1, o = (wi * 4 + v);
              wPos[o * 3] = w.x + si * a; wPos[o * 3 + 1] = topY; wPos[o * 3 + 2] = w.z + sj * a; wNrm[o * 3 + 1] = 1;
              const dd = (cellD(i, j) + cellD(i + si, j) + cellD(i, j + sj) + cellD(i + si, j + sj)) / 4;
              const sd = (cellS(i, j) + cellS(i + si, j) + cellS(i, j + sj) + cellS(i + si, j + sj)) / 4, k = Math.min(1, Math.max(0, (sd - 0.4) / 2.4));
              wAttr[o * 4 + 2] = dd; wAttr[o * 4 + 3] = 1 - k * k * (3 - 2 * k);   // xy = dòng chảy (điền ở khung đầu) · z = độ sâu · w = gần bờ
            }
            const b = wi * 4; wIdx.set([b, b + 2, b + 1, b + 2, b + 3, b + 1], wi * 6);   // mặt hướng lên như PlaneGeometry xoay −90° quanh X
          });
          const waterSurfGeo = new THREE.BufferGeometry();
          waterSurfGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); waterSurfGeo.setAttribute('normal', new THREE.BufferAttribute(wNrm, 3));
          waterSurfGeo.setAttribute('aWater', new THREE.BufferAttribute(wAttr, 4)); waterSurfGeo.setIndex(new THREE.BufferAttribute(wIdx, 1));
          waterSurfGeo.computeBoundingSphere(); waterSurfGeo.computeBoundingBox();
          const waterMesh = new THREE.Mesh(waterSurfGeo, waterMat);
          waterMesh.name = 'Mặt nước (Water Surface)';
          waterMesh.receiveShadow = true;
          scene.add(waterMesh);
          terrainMeshes.push(waterMesh); waterSurfMesh = waterMesh;
        }
        waters.length = 0; // Giải phóng mảng RAM lập tức
        // Keep the compact height grid, including water cells, for exact allocation-free runtime queries.
        for (let i = -MX; i < GX + MX; i++) for (let j = -MZ; j < GZ + MZ; j++) {
          const idx = (i + MX) * gridD + j + MZ;
          if (gridWater[idx]) gridH[idx] = getVoxelHeight(i, j);
        }
        surfaceHeights = gridH;
        gridH = gridWater = null;

