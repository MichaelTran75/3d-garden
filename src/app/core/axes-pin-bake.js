        // ---- trục tọa độ đặt tại 1 GÓC địa hình (X đỏ / Y lục / Z lam) ----
        const AXC = { x: 0xc0473a, y: 0x3a7d44, z: 0x2f6fb0 };
        const X0 = wx(-MX), Z0 = wz(-MZ);                                    // góc gốc = (min X, min Z) → mọi tọa độ đều dương
        const axLenX = wx(GX + MX - 1) - X0, axLenZ = wz(GZ + MZ - 1) - Z0;  // độ dài bằng cạnh địa hình
        const axesGroup = new THREE.Group(); axesGroup.position.set(X0, 0, Z0); scene.add(axesGroup);
        (function buildAxes() {
          const AX = axLenX * 1.12, AY = 52, AZ = axLenZ * 1.12, O = new THREE.Vector3(0, 0, 0);   // X/Z dài hơn 1 chút
          const line = (from, to, color, op) => { const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op })); ln.renderOrder = 18; axesGroup.add(ln); };
          line(O, new THREE.Vector3(AX, 0, 0), AXC.x, 0.9);   // X chạy dọc cạnh địa hình
          line(O, new THREE.Vector3(0, AY, 0), AXC.y, 0.9);   // Y hướng lên
          line(O, new THREE.Vector3(0, 0, AZ), AXC.z, 0.9);   // Z chạy dọc cạnh địa hình
          const cone = (color, pos, rot) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 14), new THREE.MeshBasicMaterial({ color })); c.position.copy(pos); if (rot) c.rotation.copy(rot); axesGroup.add(c); };   // mũi tên nhỏ đi 1/2
          cone(AXC.x, new THREE.Vector3(AX, 0, 0), new THREE.Euler(0, 0, -Math.PI / 2));
          cone(AXC.y, new THREE.Vector3(0, AY, 0));
          cone(AXC.z, new THREE.Vector3(0, 0, AZ), new THREE.Euler(Math.PI / 2, 0, 0));
          const axLabel = (text, color, pos) => {
            const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            x.font = 'bold 46px Inter, system-ui, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = color; x.fillText(text, 32, 35);
            const t = new THREE.CanvasTexture(c); t.anisotropy = 4; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); sp.renderOrder = 22; sp.scale.set(7, 7, 1); sp.position.copy(pos); axesGroup.add(sp);
          };
          axLabel('X', '#c0473a', new THREE.Vector3(AX + 7, 0, 0));
          axLabel('Y', '#3a7d44', new THREE.Vector3(0, AY + 7, 0));
          axLabel('Z', '#2f6fb0', new THREE.Vector3(0, 0, AZ + 7));
        })();

        // ---- ghim thả (drop-pin) khi hover địa hình ----
        const pinH = 7;
        const pin = new THREE.Group(); pin.visible = false; scene.add(pin);
        const PIN_OP = 0.65;   // ghim trong suốt 35%
        const pinLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, pinH, 0)]), new THREE.LineBasicMaterial({ color: 0xE2D6C0, transparent: true, opacity: PIN_OP })); pin.add(pinLine);
        const pinHead = new THREE.Group(); pinHead.position.y = 0; pin.add(pinHead);   // mũi tên đậu ở mặt đất (mũi chạm điểm)
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xE2D6C0, transparent: true, opacity: PIN_OP });
        const pinArrow = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 16), pinMat); pinArrow.rotation.x = Math.PI; pinArrow.position.y = 0.55; pinHead.add(pinArrow);   // mũi tên nhỏ chúc xuống điểm
        const pinShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.2, 10), pinMat); pinShaft.position.y = 1.7; pinHead.add(pinShaft);   // cán mũi tên
        const pinRing = new THREE.Mesh(new THREE.RingGeometry(0.7, 1.15, 22), new THREE.MeshBasicMaterial({ color: 0xE2D6C0, transparent: true, opacity: PIN_OP, side: THREE.DoubleSide })); pinRing.rotation.x = -Math.PI / 2; pinRing.position.y = pinH; pin.add(pinRing);   // vòng tròn ở ĐỈNH cột
        // ---- phát sáng khối địa hình ngay dưới mũi tên (hover glow) ----
        const _glowCol = new THREE.Color().setRGB(2.0, 1.9, 1.25), _prevCol = new THREE.Color();   // màu overbright ấm → sáng rực
        let glowMesh = null, glowId = -1;
        function clearGlow() { if (glowMesh && glowId >= 0 && glowMesh.instanceColor) { glowMesh.setColorAt(glowId, _prevCol); glowMesh.instanceColor.needsUpdate = true; } glowMesh = null; glowId = -1; }
        function setGlow(mesh, id) {
          if (mesh === glowMesh && id === glowId) return;
          clearGlow();
          if (!mesh || !mesh.instanceColor || id == null || id < 0) return;
          mesh.getColorAt(id, _prevCol); glowMesh = mesh; glowId = id;
          mesh.setColorAt(id, _glowCol); mesh.instanceColor.needsUpdate = true;   // khối ngay dưới mũi tên bừng sáng
        }
        let pinDropStart = -1;
        const _tailV = new THREE.Vector3();   // chiếu đuôi mũi tên (đỉnh cán) ra màn hình để neo nhãn toạ độ

        /* ===== LINE-ART structures ===== */
        const OUT = 0x4b4a46, lineMat = new THREE.LineBasicMaterial({ color: OUT }), lineDark = new THREE.LineBasicMaterial({ color: 0x243240 });
        function edge(mesh, geo, lm) { mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), lm || lineMat)); }
        function cellTex() {
          const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#33414f'; x.fillRect(0, 0, 256, 256); const n = 8, g = 3, cs = 256 / n;
          for (let i = 0; i < n; i++)for (let j = 0; j < n; j++) { x.fillStyle = '#2c3e50'; x.fillRect(i * cs + g, j * cs + g, cs - 2 * g, cs - 2 * g); x.strokeStyle = '#46586a'; x.lineWidth = 1; x.beginPath(); x.moveTo(i * cs + cs * .4, j * cs + g); x.lineTo(i * cs + cs * .4, j * cs + cs - g); x.moveTo(i * cs + cs * .7, j * cs + g); x.lineTo(i * cs + cs * .7, j * cs + cs - g); x.stroke(); }
          const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace; return t;
        }
        const cellRep = cellTex();
        const towerMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
        const bladeMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
        const hubMat = new THREE.MeshLambertMaterial({ color: 0xd9d7d0 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x8b9197 });
        const wallMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0xd9d6cd });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0xffffff, map: cellRep });
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0xd2cebf });
        const concreteDark = new THREE.MeshLambertMaterial({ color: 0xc3bdac });
        const gateMat = new THREE.MeshLambertMaterial({ color: 0x6f7a85 });
        const pipeMat = new THREE.MeshLambertMaterial({ color: 0xb7b3a8 });
        const foamMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.75 });
        const sheetMat = new THREE.MeshLambertMaterial({ color: 0x8fc1e3, transparent: true, opacity: 0.6 });
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7f6243, transparent: true, opacity: 0.5, depthWrite: false });
        const leafMats = [0x78935b, 0x6e8754, 0x86a364, 0x61784a].map(co => new THREE.MeshLambertMaterial({ color: co, transparent: true, opacity: 0.5, depthWrite: false }));
        const cowWhite = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), cowDark = new THREE.MeshLambertMaterial({ color: 0x3b3a37 }), cowPink = new THREE.MeshLambertMaterial({ color: 0xd7a39b }), cowLeg = new THREE.MeshLambertMaterial({ color: 0x55514b }), cowHorn = new THREE.MeshLambertMaterial({ color: 0xddd2b8 });
        // cá KOI realistic: thân fusiform shading MƯỢT + đốm Kohaku/Sumi vertex-color mép mềm · vây màng trắng 2 lớp — vật liệu share cho cả đàn
        const koiWhiteM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, side: THREE.DoubleSide }),
          koiSkinM = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }),   // da cá tô màu theo ĐỈNH (mép đốm pha mềm) — đốm nằm trên da, không lồi khối
          koiEyeM = new THREE.MeshBasicMaterial({ color: 0x1e1c1a });
        const _koiC = { white: new THREE.Color(0xE2D6C0), red: new THREE.Color(0xd8492f), black: new THREE.Color(0x2b2724) };
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x7b858c });
        const cableMat = new THREE.LineBasicMaterial({ color: 0x20262b, transparent: true, opacity: 0.72 });
        const ceramicMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
        const warningMat = new THREE.MeshLambertMaterial({ color: 0xd7aa3f });
        function mistTex() { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(226,214,192,0.72)'); g.addColorStop(0.52, 'rgba(226,214,192,0.34)'); g.addColorStop(1, 'rgba(226,214,192,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
        const mistMap = mistTex();
        function bx(w, h, d, mat, cast, out, lm) { const geo = new THREE.BoxGeometry(w, h, d); const m = new THREE.Mesh(geo, mat); m.castShadow = cast !== false; m.receiveShadow = true; if (out !== false) edge(m, geo, lm); return m; }
        function cyl(rt, rb, h, mat, cast, out, lm, segs = 7) { const geo = new THREE.CylinderGeometry(rt, rb, h, segs); const m = new THREE.Mesh(geo, mat); m.castShadow = cast !== false; m.receiveShadow = true; if (out !== false) edge(m, geo, lm); return m; }
        const _rbUp = new THREE.Vector3(0, 1, 0), _rbD = new THREE.Vector3();
        function rodBetween(parent, a, b, r, mat, segs = 6, cast = true) {   // ống tròn nối 2 điểm: giằng, thanh néo, ống, thanh thang
          _rbD.subVectors(b, a); const m = cyl(r, r, _rbD.length(), mat, cast, false, null, segs);
          m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(_rbUp, _rbD.normalize()); parent.add(m); return m;
        }
        function sph(r, mat, cast, out, lm, segs = 8) { const geo = new THREE.SphereGeometry(r, segs, segs); const m = new THREE.Mesh(geo, mat); m.castShadow = cast !== false; m.receiveShadow = true; if (out !== false) edge(m, geo, lm); return m; }
        function cone(r, h, mat, cast, out, lm, segs = 9) { const geo = new THREE.ConeGeometry(r, h, segs); const m = new THREE.Mesh(geo, mat); m.castShadow = cast !== false; m.receiveShadow = true; if (out !== false) edge(m, geo, lm); return m; }
        function torus(r, tube, mat, cast, out, lm, radSegs = 6, tubSegs = 12) { const geo = new THREE.TorusGeometry(r, tube, radSegs, tubSegs); const m = new THREE.Mesh(geo, mat); m.castShadow = cast !== false; m.receiveShadow = true; if (out !== false) edge(m, geo, lm); return m; }
        // Đèn lồng dựng bằng code (kiểu đèn bão cổ):
        // hộp vuông khung đen 4 ô kính có giằng chữ X, ống thông hơi + nắp vòm, quai đôi uốn vòm theo đường chéo, bóng cầu trên đế trụ.
        // Số đo theo đơn vị mẫu (nhân LANTERN_SCALE); gốc nhóm = đỉnh quai (điểm treo), thân treo xuống −Y. Hình học gộp 1 lần, mọi đèn lồng dùng chung.
        const LANTERN_SCALE = 0.022;
        let lanternKit = null;
        function buildLanternKit() {
          const s = LANTERN_SCALE, top = 31.69, h = 6, Y = v => (v - top) * s;
          const parts = { frame: [], glass: [], bulb: [] };
          const put = (list, geo, x, y, z, ry = 0, rz = 0) => { if (rz) geo.rotateZ(rz); if (ry) geo.rotateY(ry); geo.translate(x * s, Y(y), z * s); list.push(geo); };
          for (const y of [0.5, 14.5]) put(parts.frame, new THREE.BoxGeometry(2 * h * s, s, 2 * h * s), 0, y, 0);                                   // hộp đế · hộp nóc
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(parts.frame, new THREE.BoxGeometry(.55 * s, 13 * s, .55 * s), sx * (h - .275), 7.5, sz * (h - .275));   // cột góc
          const brace = Math.hypot(11, 13), lean = Math.atan2(13, 11);
          for (let face = 0; face < 4; face++) {
            const ry = face * Math.PI / 2, nx = Math.sin(ry), nz = Math.cos(ry);
            put(parts.glass, new THREE.BoxGeometry(11 * s, 13 * s, .04 * s), nx * (h - .15), 7.5, nz * (h - .15), ry);                              // ô kính
            for (const sign of [-1, 1]) put(parts.frame, new THREE.BoxGeometry(brace * s, .22 * s, .22 * s), nx * (h - .04), 7.5, nz * (h - .04), ry, sign * lean);   // giằng chữ X
          }
          put(parts.frame, new THREE.CylinderGeometry(3.2 * s, 3.2 * s, 2 * s, 16), 0, 1.29, 0);                                                     // đế bóng
          put(parts.bulb, new THREE.SphereGeometry(3.22 * s, 16, 12), 0, 5.235, 0);                                                                 // bóng cầu
          const cap = [[3.2, 15], [3.2, 16.64], [3.6, 17.5], [4, 17.55], [4, 17.62], [3.7, 17.8], [2.8, 18.17], [1.5, 18.42], [0, 18.49]];
          put(parts.frame, new THREE.LatheGeometry(cap.map(([r, y]) => new THREE.Vector2(r * s, (y - 15) * s)), 20), 0, 15, 0);                   // ống thông hơi + nắp vòm
          const arc = [[6.05, 15], [6.03, 19], [5.97, 22.5], [5.85, 24.6], [5.55, 26.4], [5, 27.95], [4.5, 29], [3.5, 30.3], [2, 31.2], [0, 31.57]];
          const handle = [...arc, ...arc.slice(0, -1).reverse().map(([u, y]) => [-u, y])].map(([u, y]) => new THREE.Vector3(u * s * Math.SQRT1_2, Y(y), u * s * Math.SQRT1_2));
          parts.frame.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(handle), 48, .28 * s, 6, false));                                     // quai theo đường chéo hộp
          const merge = list => { const geo = mergeGeometries(list, false); for (const g of list) g.dispose(); return geo; };
          return {
            frame: merge(parts.frame), glass: merge(parts.glass), bulb: merge(parts.bulb), bulbY: Y(5.235),
            frameMat: new THREE.MeshLambertMaterial({ color: 0x34363a }),
            glassMat: new THREE.MeshLambertMaterial({ color: 0xe6eef0, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
            bulbMat: new THREE.MeshBasicMaterial({ color: 0xffd571 })
          };
        }
        function lanBody(parent, name) {
          lanternKit ??= buildLanternKit();
          const l = new THREE.Group(); if (name) l.name = name; parent.add(l);
          const part = (geo, mat, cast) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; if (name) m.name = name; l.add(m); return m; };
          part(lanternKit.frame, lanternKit.frameMat, true); part(lanternKit.glass, lanternKit.glassMat, false);
          const glow = part(lanternKit.bulb, lanternKit.bulbMat, false);
          const light = new THREE.PointLight(0xffce6a, 0.7, 8, 2); light.position.y = lanternKit.bulbY; l.add(light);
          return { lan: l, light, glow };
        }



        // ---- gộp hình TĨNH trong 1 group theo (vật liệu · cờ đổ bóng) thành 1 mesh/1 viền → giảm draw call.
        //      Chỉ chạm Mesh & LineSegments; giữ nguyên Sprite · Line thường · InstancedMesh · đèn · nhóm động. Chỉ dùng cho group KHÔNG có chi tiết động. ----
        // vai trò khi xem xuyên (x-ray): tag userData.xray gần nhất trên chuỗi cha ('shell' = vỏ, 'keep' = giữ nguyên), dừng ở nhóm stop
        function xrayRole(o, stop) { for (let p = o; p; p = p.parent) { if (p.userData.xray) return p.userData.xray; if (p === stop) break; } return ''; }
        function bakeStatic(group) {
          if (!mergeGeometries) return group;
          group.updateMatrixWorld(true);
          const inv = new THREE.Matrix4().copy(group.matrixWorld).invert(), rel = new THREE.Matrix4();
          const bins = new Map();
          group.traverse(o => {
            if (o.name === 'awLan' || (o.parent && o.parent.name === 'awLan')) return;
            for (let p = o; p && p !== group; p = p.parent) if (p.userData.noBake) return;
            const mesh = o.isMesh && !o.isInstancedMesh, seg = o.isLineSegments;
            if (!(mesh || seg) || !o.geometry || Array.isArray(o.material)) return;
            const role = seg ? '' : xrayRole(o, group);   // vỏ & nội thất cùng vật liệu vẫn gộp riêng để còn ẩn được vỏ
            const key = (seg ? 'L' : 'M') + '|' + o.material.uuid + '|' + (o.castShadow ? 1 : 0) + '|' + (o.receiveShadow ? 1 : 0) + '|' + role;
            let bin = bins.get(key);
            if (!bin) { bin = { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, seg, role, origs: [] }; bins.set(key, bin); }
            bin.origs.push(o);
          });
          for (const bin of bins.values()) {
            if (bin.origs.length < 2) continue;
            const mixed = bin.origs.some(o => !o.geometry.index) && bin.origs.some(o => o.geometry.index);
            const geos = bin.origs.map(o => {
              let geo = o.geometry.clone(); geo.applyMatrix4(rel.multiplyMatrices(inv, o.matrixWorld));
              if (mixed && geo.index) { const indexed = geo; geo = indexed.toNonIndexed(); indexed.dispose(); }
              return geo;
            });
            const flightBounds = bin.seg ? null : new Float64Array(geos.length * 6);
            if (flightBounds) geos.forEach((geo, i) => {
              geo.computeBoundingBox();
              const box = geo.boundingBox, k = i * 6;
              flightBounds.set([box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z], k);
            });
            const merged = mergeGeometries(geos, false);
            for (const geo of geos) geo.dispose();
            if (!merged) continue;
            merged.computeBoundingBox();
            const ctr = new THREE.Vector3(); merged.boundingBox.getCenter(ctr); merged.translate(-ctr.x, -ctr.y, -ctr.z);
            for (const o of bin.origs) o.parent && o.parent.remove(o);
            const m = bin.seg ? new THREE.LineSegments(merged, bin.mat) : new THREE.Mesh(merged, bin.mat);
            m.position.copy(ctr); m.castShadow = bin.cast; m.receiveShadow = bin.recv;
            if (bin.role) m.userData.xray = bin.role;
            if (flightBounds) {
              for (let i = 0; i < flightBounds.length; i += 3) { flightBounds[i] -= ctr.x; flightBounds[i + 1] -= ctr.y; flightBounds[i + 2] -= ctr.z; }
              bakedFlightBounds.set(merged, flightBounds);
            }
            group.add(m);
          }
          return group;
        }

