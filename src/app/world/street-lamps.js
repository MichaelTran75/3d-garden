        // ---- mặt đường nội bộ: cao độ + khoảng cách ngang tới tim tuyến (nội suy theo các trạm lúc dựng đường) ----
        function roadSurfaceAt(x, z) {
          const st = campusRoad.userData.road.stations; let best = null;
          for (let i = 1; i < st.length; i++) {
            const a = st[i - 1], b = st[i], abx = b.x - a.x, abz = b.z - a.z, L2 = abx * abx + abz * abz;
            const k = L2 ? Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / L2)) : 0, d = Math.hypot(x - (a.x + abx * k), z - (a.z + abz * k));
            if (!best || d < best.d) best = { d, y: a.y + (b.y - a.y) * k, tx: abx / Math.sqrt(L2 || 1), tz: abz / Math.sqrt(L2 || 1) };
          }
          return best;
        }
        // vệt sáng đèn đường in trên mặt nhựa: lưới 30×30 phủ bám cao độ đường, độ sáng elip quanh điểm ngắm (kéo dài dọc tim đường, lệch nhẹ về phía chân cột),
        // tắt dần ở mép nhựa (lề đất sáng nhờ đèn chiếu thật), cộng sáng — không ghi chiều sâu nên không che gì
        function roadLightPool(c, headW, R) {
          const n = 30, geo = new THREE.PlaneGeometry(2 * R, 2 * R, n, n); geo.rotateX(-Math.PI / 2);
          const pos = geo.attributes.position, aIn = new Float32Array(pos.count), aD = new Float32Array(pos.count), half = roadWidth / 2, info = roadSurfaceAt(c.x, c.z);
          const lx = headW.x - c.x, lz = headW.z - c.z, lean = Math.hypot(lx, lz) || 1;   // phía chân cột: sáng hơn chút (gần nguồn)
          for (let i = 0; i < pos.count; i++) {
            const x = c.x + pos.getX(i), z = c.z + pos.getZ(i), r = roadSurfaceAt(x, z);
            pos.setY(i, r.y + 0.012 - c.y);
            aIn[i] = 1 - THREE.MathUtils.smoothstep(r.d, half - 0.18, half + 0.02);
            const along = (x - c.x) * info.tx + (z - c.z) * info.tz, across = Math.hypot(x - c.x, z - c.z) ** 2 - along * along;
            const toward = ((x - c.x) * lx + (z - c.z) * lz) / lean;
            aD[i] = Math.sqrt(along * along / (R * R) + Math.max(0, across) / (R * R * 0.42)) * (1 - 0.12 * Math.max(-1, Math.min(1, toward / R)));
          }
          geo.setAttribute('aIn', new THREE.BufferAttribute(aIn, 1)); geo.setAttribute('aD', new THREE.BufferAttribute(aD, 1)); geo.computeBoundingSphere();
          const mat = new THREE.ShaderMaterial({
            uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0xffcf8a) } },
            vertexShader: 'attribute float aIn; attribute float aD; varying float vIn; varying float vD;\n' +
              'void main() { vIn = aIn; vD = aD; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
            fragmentShader: 'varying float vIn; varying float vD; uniform float uOpacity; uniform vec3 uColor;\n' +
              'void main() { float f = 1.0 - smoothstep(0.0, 1.0, vD); float a = uOpacity * vIn * f * f; if (a < 0.002) discard; gl_FragColor = vec4(uColor, a); }',
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2
          });
          const m = new THREE.Mesh(geo, mat); m.position.copy(c); m.name = 'Vệt sáng đèn trên mặt đường'; m.renderOrder = 2; m.visible = false; m.userData.mat = mat;
          return m;
        }
        // ---- đèn đường: đế bê tông, cột thép thon ~5 m, cần cong, đầu LED dẹt; sáng ban đêm, tắt ban ngày ----
        function streetLamp(px, pz) {
          const x = X0 + px, z = Z0 + pz, g = new THREE.Group(); g.position.set(x, stationGround(x, z), z); g.name = 'Đèn đường (Street Lamp)';
          const V = (px, py, pz) => new THREE.Vector3(px, py, pz), poleH = 4.9, armR = 0.55;
          const base = cyl(0.2, 0.24, 0.3, concreteDark, true, true, lineMat, 16); base.position.y = 0.1; g.add(base);
          const pole = cyl(0.055, 0.085, poleH, gateMat, true, false, null, 12); pole.position.y = poleH / 2 + 0.25; g.add(pole);
          const door = bx(0.06, 0.28, 0.12, gateMat, false, true, lineDark); door.position.set(0.075, 0.75, 0); g.add(door);   // nắp hộp điện chân cột
          const top = poleH + 0.25, curve = new THREE.CatmullRomCurve3([V(0, top - 0.05, 0), V(0, top + armR * 0.55, 0), V(armR * 0.45, top + armR * 0.85, 0), V(armR, top + armR * 0.8, 0), V(armR * 1.55, top + armR * 0.6, 0)]);
          const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.035, 8, false), gateMat); arm.castShadow = true; g.add(arm);
          const head = bx(0.52, 0.07, 0.24, gateMat, true, true, lineDark); head.position.set(armR * 1.55 + 0.2, top + armR * 0.6 - 0.02, 0); head.rotation.z = -0.08; g.add(head);
          const ledMat = new THREE.MeshBasicMaterial({ color: 0x5f6266 });
          const led = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.18), ledMat); led.rotation.x = Math.PI / 2; led.position.set(head.position.x, head.position.y - 0.037, 0); led.userData.noBake = true; g.add(led);
          const headX = head.position.x, headY = head.position.y - 0.04;
          // cần đèn (trục +X cục bộ) quay về điểm gần nhất trên đường nội bộ chữ L (nhánh dọc X tại roadCornerZ · nhánh dọc Z tại roadCornerX)
          const near = [[Math.min(Math.max(x, Math.min(roadStartX, roadCornerX)), Math.max(roadStartX, roadCornerX)), roadCornerZ], [roadCornerX, Math.min(Math.max(z, Math.min(roadCornerZ, roadEndZ)), Math.max(roadCornerZ, roadEndZ))]]
            .reduce((a, b) => Math.hypot(a[0] - x, a[1] - z) <= Math.hypot(b[0] - x, b[1] - z) ? a : b);
          g.rotation.y = Math.atan2(-(near[1] - z), near[0] - x);
          bakeStatic(g); scene.add(g);
          obstacleCoords.push({ x, y: g.position.y, z, r: 0.6, h: top + 0.6 });
          // ---- ánh sáng: nhóm riêng (không gộp lưới, không tính là vật cản bay) cùng toạ độ với đèn ----
          const glowG = new THREE.Group(); glowG.name = 'Ánh đèn đường'; glowG.position.copy(g.position); glowG.rotation.y = g.rotation.y; scene.add(glowG); glowG.updateMatrixWorld(true);
          // điểm ngắm: tim đường gần đầu đèn nhất, cách hai đầu tuyến ≥ 2,2 m (đèn đứng sát cuối đường thì chiếu chếch vào lòng đường, không rọi ra cỏ)
          const headW = glowG.localToWorld(V(headX, headY, 0)), END = 2.2;
          const aim2 = [[Math.min(Math.max(headW.x, roadStartX + END), roadCornerX), roadCornerZ], [roadCornerX, Math.min(Math.max(headW.z, roadCornerZ), roadEndZ - END)]]
            .reduce((a, b) => Math.hypot(a[0] - headW.x, a[1] - headW.z) <= Math.hypot(b[0] - headW.x, b[1] - headW.z) ? a : b);
          const aimW = V(aim2[0], roadSurfaceAt(aim2[0], aim2[1]).y, aim2[1]), aim = glowG.worldToLocal(aimW.clone());
          // đèn chiếu LED ~4000 lm treo 5,5 m: mặt đường ngay dưới sáng gấp ~3 lần ánh sáng nền ban đêm; mép mềm (penumbra) loang ra lề, cỏ
          const light = new THREE.SpotLight(0xffd9a0, 0, 0, 0.56, 0.7, 2); light.position.set(headX, headY, 0); light.castShadow = false;
          light.target.position.copy(aim); glowG.add(light, light.target);
          // vệt sáng trên mặt nhựa: lưới phủ bám đúng cao độ đường (theo các trạm của tuyến), chỉ trong bề rộng nhựa, elip kéo dọc tim đường, cộng sáng
          const pool = roadLightPool(aimW, headW, 4.2); scene.add(pool);
          // chùm sáng: nón hở đáy, cộng sáng, đậm ở chao đèn, nhạt dần xuống đất, mờ ở mép nón theo góc nhìn
          const beamDir = aim.clone().sub(V(headX, headY, 0)), beamH = beamDir.length() * 0.97, beamR = beamH * Math.tan(0.45);
          const beamGeo = new THREE.ConeGeometry(beamR, beamH, 40, 1, true); beamGeo.translate(0, -beamH / 2, 0);   // đỉnh nón ở gốc toạ độ = mặt LED
          const beamMat = new THREE.ShaderMaterial({
            uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0xffd59a) } },
            vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV;\n' +
              'void main() { vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
            fragmentShader: 'varying float vY; varying vec3 vN; varying vec3 vV; uniform float uOpacity; uniform vec3 uColor;\n' +
              'void main() { float face = abs(dot(normalize(vN), normalize(vV))); float a = uOpacity * pow(vY, 1.6) * smoothstep(0.0, 0.6, face); gl_FragColor = vec4(uColor, a); }',
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false
          });
          const beam = new THREE.Mesh(beamGeo, beamMat); beam.name = 'Chùm sáng đèn đường'; beam.position.set(headX, headY, 0); beam.renderOrder = 3;
          beam.quaternion.setFromUnitVectors(V(0, -1, 0), beamDir.normalize()); beam.visible = false; glowG.add(beam);
          return { g, light, ledMat, beam, beamMat, pool };
        }
        const streetLamps = [streetLamp(50, 92), streetLamp(31, 66)];   // toạ độ ghim (x, z); chân đèn theo mặt đất
        const mastReadout = document.getElementById('weather-mast');
        let mastLabel = null;
        function updateMastReadout() {
          if (!mastLabel) return;
          const state = window.gardenWeather.state;
          const saved = !!state.data && (!state.fresh || state.phase !== 'ready');
          const text = state.city.name + ' · ' + document.getElementById('weather-temperature').textContent + ' · Gió ' + document.getElementById('weather-wind').textContent + (saved ? ' · bản lưu' : '');
          const current = state.data?.current, units = state.data?.current_units, hourly = state.data?.hourly;
          const hourIndex = current && Array.isArray(hourly?.time) ? hourly.time.findIndex(time => time.slice(0, 13) === current.time.slice(0, 13)) : -1;
          const format = (value, unit, expected, digits = 1) => typeof value === 'number' && Number.isFinite(value) && unit === expected ? value.toLocaleString('vi-VN', { maximumFractionDigits: digits }) : '—';
          const minutes = current?.interval > 0 ? current.interval / 60 : null;
          mastLabel.update([text,
            '• Lượng mưa' + (minutes ? ' (' + minutes + ' phút)' : '') + ': ' + format(current?.precipitation, units?.precipitation, 'mm') + ' mm',
            '• Độ ẩm: ' + format(current?.relative_humidity_2m, units?.relative_humidity_2m, '%', 0) + ' %',
            '• Độ phủ mây: ' + format(current?.cloud_cover, units?.cloud_cover, '%', 0) + ' %',
            '• Áp suất tại mặt đất: ' + format(current?.surface_pressure, units?.surface_pressure, 'hPa') + ' hPa',
            '• UV (giờ): ' + format(hourly?.uv_index?.[hourIndex], state.data?.hourly_units?.uv_index, ''),
            '• Bức xạ (TB 1 giờ): ' + format(hourly?.shortwave_radiation?.[hourIndex], state.data?.hourly_units?.shortwave_radiation, 'W/m²', 0) + ' W/m²',
            document.getElementById('weather-mast-status').textContent]);
        }
        {
          const p0 = gridPoles[0];
          const p2 = wmast.g.localToWorld(wmast.feed.clone());   // cáp điện lưới vào lưng tủ datalogger
          const p1 = p0.clone().lerp(p2, 0.5); p1.y -= 0.6;
          const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
          scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(18)), cableMat));
        }

        /* ===== VEGETATION INSTANCING — gom cỏ/cây/hoa tĩnh thành InstancedMesh (≈2000 mesh → 7 draw call).
           Hình học gốc chuẩn hoá (bán kính/cao ~1) rồi đặt qua ma trận per-instance; màu lá/cỏ/cánh hoa qua instanceColor. */
        const NATURE_SCALE = 0.90; // Whole-object size; world scatter and flight/walk paths stay independent.
        const flowerMats = [0xe8556d, 0xf2c14e, 0xE2D6C0, 0xb07fd4, 0xe8843a].map(c => new THREE.MeshLambertMaterial({ color: c }));
        const flCen = new THREE.MeshLambertMaterial({ color: 0xf4d24f }), flStem = new THREE.MeshLambertMaterial({ color: 0x4f7a34 });
        const bladeGreenCols = [0x5d8f34, 0x6fa343, 0x7ab84e, 0x53842f].map(c => new THREE.Color(c));
        const leafMatInst = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false, flatShading: true });   // triangle-ball flat shading — CÂY RỪNG luôn trong suốt 50%
        const vegPools = {
          trunk: { geo: new THREE.CylinderGeometry(0.18, 0.28, 1, 7), mat: trunkMat, color: false, cast: false, list: [] },
          cone: { geo: new THREE.ConeGeometry(1, 2.1, 9), mat: leafMatInst, color: true, cast: true, list: [] },   // tán lá kim (cây type 0)
          blob: { geo: new THREE.IcosahedronGeometry(1, 0), mat: leafMatInst, color: true, cast: true, list: [] },  // tán lá TRIANGLE BALL (icosahedron thô)
          blade: { geo: (() => { const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute([-0.035, -0.5, 0, 0.035, -0.5, 0, 0, 0.5, 0], 3)); bg.computeVertexNormals(); return bg; })(), mat: new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), color: true, cast: false, list: [] },  // lá cỏ PHẲNG mỏng tuyệt đối: tam giác dẹt 1 mặt phẳng (thay trụ nhọn), DoubleSide để nhìn 2 phía
          stem: { geo: new THREE.CylinderGeometry(0.0125, 0.015, 0.7, 5), mat: flStem, color: false, cast: false, list: [] },

          petal: { geo: new THREE.SphereGeometry(0.17, 6, 5), mat: new THREE.MeshLambertMaterial({ color: 0xffffff }), color: true, cast: false, list: [] },
          fcen: { geo: new THREE.SphereGeometry(0.12, 6, 6), mat: flCen, color: false, cast: false, list: [] },
          fcube: { geo: new THREE.BoxGeometry(1, 1, 1), mat: new THREE.MeshLambertMaterial({ color: 0xffffff }), color: true, cast: false, list: [] }   // cube đơn vị — mọi cánh hoa Minecraft đều scale từ đây
        };
        const _vgm = new THREE.Matrix4(), _vlm = new THREE.Matrix4(), _vp = new THREE.Vector3(), _vs = new THREE.Vector3(), _ve = new THREE.Euler(), _vq = new THREE.Quaternion(), _vqI = new THREE.Quaternion();
        function vegGroup(px, py, pz, rotY, scl) { _vgm.makeRotationY(rotY); if (scl !== 1) _vgm.scale(_vs.set(scl, scl, scl)); _vgm.setPosition(px, py, pz); }   // ma trận cụm (T·Ry·S)
        function vegPush(pool, pos, quat, scl, color, sway) { if ((pool === vegPools.blade || pool === vegPools.stem || pool === vegPools.petal || pool === vegPools.fcen || pool === vegPools.fcube) && roadContains(_vgm.elements[12], _vgm.elements[14], .35)) return; _vlm.compose(pos, quat, scl); const m = new THREE.Matrix4().multiplyMatrices(_vgm, _vlm); const e = color ? { m, c: color } : { m };
          if (!sway && pool.autoSway) { const gs = Math.hypot(_vgm.elements[4], _vgm.elements[5], _vgm.elements[6]); sway = [pool.autoSway === 'vertex' ? -pos.y * gs : pos.y * gs, 0]; }   // hoa: độ cao trên gốc cụm
          if (sway) e.s = sway; pool.list.push(e); }   // sway = [độ cao trên gốc, chiều cao cây] cho gió rừng
        function buildVegPool(pool) {
          if (!pool.list.length) return;
          const im = new THREE.InstancedMesh(pool.geo, pool.mat, pool.list.length); im.castShadow = pool.cast; im.receiveShadow = false;
          for (let k = 0; k < pool.list.length; k++) { const e = pool.list[k]; im.setMatrixAt(k, e.m); if (pool.color) im.setColorAt(k, e.c); }
          if (pool.list.some(e => e.s)) {   // thuộc tính từng cây cho shader gió rừng (aSway)
            const sw = new Float32Array(pool.list.length * 2); pool.list.forEach((e, k) => { if (e.s) { sw[k * 2] = e.s[0]; sw[k * 2 + 1] = e.s[1]; } });
            pool.geo.setAttribute('aSway', new THREE.InstancedBufferAttribute(sw, 2));
          }
          im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; scene.add(im);
          if (pool === vegPools.blob || _forestVariants.some(v => pool === vegPools[v.key])) flightRoots.push(im);
          pool.list.length = 0; // Release thousands of Matrix4 objects from RAM
        }
        const _blobDefs = [[0, 3.2, 0, 1.7], [0.85, 2.7, 0.42, 1.25], [-0.75, 2.8, -0.4, 1.3], [0.3, 3.8, -0.25, 1.1]];
        const _forestVariants = [];   // mẫu nhánh đệ quy dùng chung (điền sau khi recTree sẵn sàng)
        function addTreeInst(s, px, py, pz, rotY) {   // 1 cây rừng: thân + NHÁNH ĐỆ QUY (instanced) + tán lá triangle-ball ở đầu cành
          s *= NATURE_SCALE; // Scale branches, tip offsets and canopy together around this tree's ground root.
          const lc = leafMats[(Math.random() * leafMats.length) | 0].color; vegGroup(px, py, pz, rotY, 1);
          const V0 = _forestVariants[(Math.random() * _forestVariants.length) | 0];
          const Href = V0.top * s * 0.875;   // chiều cao cây (để gió uốn ∝ (độ cao/H)²)
          vegPush(vegPools[V0.key], _vp.set(0, 0, 0), _vqI, _vs.set(s, s * 0.875, s), undefined, [0, Href]);   // Tăng chiều cao thêm 25% (0.7 * 1.25 = 0.875)
          for (const tp of V0.tips) vegPush(vegPools.blob, _vp.set(tp.x * s, tp.y * s * 0.875, tp.z * s), _vqI, _vs.set(0.62 * s, 0.62 * s * 1.012, 0.62 * s), lc, [Math.max(0.01, tp.y * s * 0.875), Href]);
          return V0;
        }
        function addGrassTuft(px, py, pz, rotY, s) {
          const n = 4 + (Math.random() * 4 | 0); vegGroup(px, py, pz, rotY, 1);
          for (let b = 0; b < n; b++) {
            const h = (0.45 + Math.random() * 0.55) * s, a = Math.random() * 6.283, r = Math.random() * 0.16 * s;
            _ve.set((Math.random() - 0.5) * 0.55, Math.random() * 6.283, (Math.random() - 0.5) * 0.55); _vq.setFromEuler(_ve);
            vegPush(vegPools.blade, _vp.set(Math.cos(a) * r, h / 2, Math.sin(a) * r), _vq, _vs.set(s * 0.95, h * 0.95, s * 0.95), bladeGreenCols[(Math.random() * bladeGreenCols.length) | 0]);
          }
        }
        const flowerCoords = [];
