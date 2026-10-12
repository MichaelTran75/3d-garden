        // ---- build terrain (cull hidden underground voxels -> 98% bodies reduced, zero lag) ----
        const grass = [], shore = [], bodies = [], waters = [], riverbed = [];
        for (let i = -MX; i < GX + MX; i++) {
          const gi = (i + MX) * gridD;
          for (let j = -MZ; j < GZ + MZ; j++) {
            if (i === 158 && j === 103) continue; // xóa cột block theo yêu cầu
            const idx = gi + (j + MZ);

            if (gridWater[idx]) {
              if (j >= DAM_J && j < DAM_J + 2 * S) continue;              // dam gap (smooth dam covers)
              const surf = Math.round((j < DAM_J ? RES : DOWN) * S);
              const dd = riverDist(i, j), hh = Math.max(1, riverHalf(j)), tt = Math.min(1, dd / hh);              // 0 giữa lòng → 1 mép bờ
              let bed = Math.round(surf - (1 + 2.6 * (1 - tt * tt)) + Math.sin(i * 0.5) * Math.sin(j * 0.4 + 1.1) * 0.8);    // đáy nhấp nhô, sâu ở giữa
              bed = Math.max(0, Math.min(surf - 1, bed));
              if (bed > 0) riverbed.push({ x: wx(i), y: (bed - 0.5) * BLOCK, z: wz(j), sy: 1 });                        // lớp đáy sông nhìn thấy qua nước
              const wh = surf - bed;
              waters.push({ x: wx(i), y: (bed + wh / 2) * BLOCK, z: wz(j), sy: wh });                                // cột nước nằm trên đáy
              continue;
            }

            const h = gridH[idx];
            const top = h - 1;
            const nearWater = (i + 1 < GX + MX && gridWater[gi + gridD + (j + MZ)]) ||
              (i - 1 >= -MX && gridWater[gi - gridD + (j + MZ)]) ||
              (j + 1 < GZ + MZ && gridWater[gi + (j + 1 + MZ)]) ||
              (j - 1 >= -MZ && gridWater[gi + (j - 1 + MZ)]) ||
              poolMetric(i, j) < 1.55;

            (nearWater ? shore : grass).push([wx(i), wy(top), wz(j)]);

            // CULL CÁC VOXEL CHÌM KHÔNG NHÌN THẤY:
            // Cột thân đất (bodies) chỉ nhìn thấy khi có ít nhất 1 mặt bên lộ ra (giáp nước, mép bản đồ, hoặc hàng xóm thấp hơn)
            if (top > 0) {
              let minH = top;
              if (i + 1 >= GX + MX || gridWater[gi + gridD + (j + MZ)]) minH = 0;
              else if (gridH[gi + gridD + (j + MZ)] < minH) minH = gridH[gi + gridD + (j + MZ)];

              if (minH > 0) {
                if (i - 1 < -MX || gridWater[gi - gridD + (j + MZ)]) minH = 0;
                else if (gridH[gi - gridD + (j + MZ)] < minH) minH = gridH[gi - gridD + (j + MZ)];
              }

              if (minH > 0) {
                if (j + 1 >= GZ + MZ || gridWater[gi + (j + 1 + MZ)]) minH = 0;
                else if (gridH[gi + (j + 1 + MZ)] < minH) minH = gridH[gi + (j + 1 + MZ)];
              }

              if (minH > 0) {
                if (j - 1 < -MZ || gridWater[gi + (j - 1 + MZ)]) minH = 0;
                else if (gridH[gi + (j - 1 + MZ)] < minH) minH = gridH[gi + (j - 1 + MZ)];
              }

              if (minH < top) {
                bodies.push({ x: wx(i), y: (minH + top) * BLOCK / 2, z: wz(j), sy: top - minH });
              }
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
        if (waters.length > 0 && typeof mergeGeometries !== 'undefined' && mergeGeometries) {
          const waterGeos = [];
          for (const w of waters) {
            const topY = w.y + (w.sy * BLOCK) / 2;
            const plane = new THREE.PlaneGeometry(BLOCK * 1.02, BLOCK * 1.02);
            plane.rotateX(-Math.PI / 2);
            plane.translate(w.x, topY, w.z);
            waterGeos.push(plane);
          }
          const waterSurfGeo = mergeGeometries(waterGeos, false);
          for (const geometry of waterGeos) geometry.dispose();
          waterGeos.length = 0;
          const waterMesh = new THREE.Mesh(waterSurfGeo, waterMat);
          waterMesh.receiveShadow = true;
          scene.add(waterMesh);
          terrainMeshes.push(waterMesh);
        } else {
          instancedScaled(waters, waterMat, true);
        }
        waters.length = 0; // Giải phóng mảng RAM lập tức
        // Keep the compact height grid, including water cells, for exact allocation-free runtime queries.
        for (let i = -MX; i < GX + MX; i++) for (let j = -MZ; j < GZ + MZ; j++) {
          const idx = (i + MX) * gridD + j + MZ;
          if (gridWater[idx]) gridH[idx] = getVoxelHeight(i, j);
        }
        surfaceHeights = gridH;
        gridH = gridWater = null;

