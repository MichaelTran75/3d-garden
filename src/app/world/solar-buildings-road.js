        // ---- solar field ----
        function solarRow(len, glass) {   // glass share chung giữa các hàng cùng kích thước — không clone texture/material mỗi hàng
          const g = new THREE.Group();
          const pgeo = new THREE.BoxGeometry(len, 0.1, 2.4); const panel = new THREE.Mesh(pgeo, glass); panel.castShadow = true; panel.receiveShadow = true; edge(panel, pgeo, lineDark);
          const tilt = new THREE.Group(); tilt.add(panel); tilt.rotation.x = -0.5; tilt.position.y = 1.7; g.add(tilt);
          for (let i = -1; i <= 1; i++) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8), legMat); leg.castShadow = true; leg.position.set(i * len * 0.36, 0.75, 0.3); g.add(leg); } return g;
        }
        // 16 hàng pin liền mạch — gấp đôi diện tích · bake cả cánh đồng thành ~3 mesh (mặt kính · viền · chân)
        {
          const lo = 6, hi = 110, len = (hi - lo) * BLOCK, gi = ((lo + hi) / 2) * S;   // gấp đôi diện tích sang phải (mép trái giữ ở 30)
          const glass = glassMat.clone(); glass.map = cellRep.clone(); glass.map.repeat.set(Math.round(len / 2), 1); glass.map.needsUpdate = true;
          const farm = new THREE.Group(); farm.name = 'Cánh đồng pin mặt trời (Solar Farm)';
          const farmMidJ = (26 + 15 * 1.45 / 2) * S;
          farm.position.set(wx(gi), surfaceY(gi, farmMidJ), wz(farmMidJ));
          farm.scale.setScalar(ARCHITECTURE_SCALE); scene.add(farm);
          for (let r = 0; r < 16; r++) {
            const gj = (26 + r * 1.45) * S;
            const row = solarRow(len, glass); row.position.set(wx(gi), surfaceY(gi, gj), wz(gj)).sub(farm.position); farm.add(row);
          }
          bakeStatic(farm);
        }

        // ---- buildings ----
        // One campus palette and one reusable primitive; static parts merge by material.
        const campusMaterials = {
          wall: new THREE.MeshLambertMaterial({ color: 0xe2d6c0 }),
          steel: new THREE.MeshLambertMaterial({ color: 0x39494d }),
          glazing: new THREE.MeshLambertMaterial({ color: 0x547a83 }),
          timber: new THREE.MeshLambertMaterial({ color: 0x8b694c }),
          solar: new THREE.MeshLambertMaterial({ color: 0x263d49, map: cellRep }),
          interior: new THREE.MeshLambertMaterial({ color: 0x77756a })
        };
        surfaceStyle(campusMaterials.wall, 'stucco'); surfaceStyle(campusMaterials.timber, 'boards');   // core/surface-style.js
        const campusBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        function building(w, h, d, solar, unit = 0, yaw = 0) {
          const g = new THREE.Group(), M = campusMaterials, floorY = .44, topY = h + floorY, wallT = .24;
          g.name = ['Nhà điều hành hai tầng', 'Xưởng bảo trì', 'Nhà thiết bị & dịch vụ'][unit];
          const openingAudit = [], roofEquipment = [], edgePoints = [];
          const box = (name, sx, sy, sz, x, y, z, mat = M.wall, parent = g) => {
            const m = new THREE.Mesh(campusBoxGeometry, mat); m.name = name;
            m.scale.set(sx, sy, sz); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
            parent.add(m); return m;
          };
          const line = (a, b) => edgePoints.push(...a, ...b);
          const rectangle = (x0, x1, y, z0, z1) => {
            line([x0, y, z0], [x1, y, z0]); line([x1, y, z0], [x1, y, z1]);
            line([x1, y, z1], [x0, y, z1]); line([x0, y, z1], [x0, y, z0]);
          };
          // Merge each horizontal wall band around apertures: no solid wall behind glass or doors.
          function punchedPlane(width, height, holes, place) {
            const levels = [...new Set([0, height, ...holes.flatMap(q => [q.y, q.y + q.h])])].sort((a, b) => a - b);
            for (let j = 1; j < levels.length; j++) {
              const lo = levels[j - 1], hi = levels[j], mid = (lo + hi) / 2;
              const spans = holes.filter(q => mid > q.y && mid < q.y + q.h).sort((a, b) => a.x - b.x);
              let left = -width / 2;
              for (const q of [...spans, { x: width / 2, w: 0 }]) {
                if (q.x - left > .0001) place((left + q.x) / 2, mid, q.x - left, hi - lo);
                left = Math.max(left, q.x + q.w);
              }
            }
          }
          const front = [], back = [], sides = [];
          const win = (x, y, ww, hh, kind = 'window') => ({ x: x - ww / 2, y, w: ww, h: hh, kind });
          let entryX, entryW = 1.12, entryH = 2.38;
          if (unit === 0) {
            entryX = -w * .31;
            front.push(win(entryX, 0, entryW, entryH, 'door'));
            for (const x of [-w * .01, w * .29]) front.push(win(x, .92, w * .205, 1.6));
            for (const x of [-w * .31, -w * .01, w * .29]) front.push(win(x, h * .59, w * .205, 1.58));
            for (const side of [-1, 1]) for (const y of [.95, h * .59]) sides.push({ side, ...win(0, y, d * .43, 1.55) });
            back.push(win(-w * .2, .95, w * .22, 1.5), win(w * .2, h * .59, w * .22, 1.5));
          } else if (unit === 1) {
            entryX = -w * .34;
            front.push(win(entryX, 0, entryW, entryH, 'door'), win(w * .12, 0, w * .43, 3.55, 'roller'));
            for (const x of [-w * .31, 0, w * .31]) front.push(win(x, h * .76, w * .22, .67));
            for (const side of [-1, 1]) sides.push({ side, ...win(0, h * .62, d * .55, 1.05) });
            back.push(win(0, h * .7, w * .57, .8));
          } else {
            entryX = -w * .23; entryW = 1.25;
            front.push(win(entryX, 0, entryW, entryH, 'door'), win(w * .22, 1.9, w * .27, 1.12));
            for (const side of [-1, 1]) sides.push({ side, ...win(-d * .08, 1.0, d * .37, 2.08, 'louver') });
            back.push(win(0, 1.5, w * .5, 1.3, 'louver'));
          }
          // A separate rear entrance; keep clear of the existing windows, vents and downpipes.
          const rearEntryX = unit === 0 ? w * .27 : unit === 1 ? -w * .28 : -w * .30;
          const rearEntryW = 1.12, rearEntryH = 2.38;
          back.push(win(rearEntryX, 0, rearEntryW, rearEntryH, 'door'));
          const openingScale = 0.80, originalEntryW = entryW;
          for (const q of [...front, ...back, ...sides]) {
            const oldW = q.w, oldH = q.h;
            q.w *= openingScale; q.h *= openingScale;
            q.x += (oldW - q.w) / 2;
            if (q.kind !== 'door' && q.kind !== 'roller') q.y += (oldH - q.h) / 2;
          }
          entryW *= openingScale; entryH *= openingScale;
          box('Foundation apron', w + .9, .16, d + .9, 0, .08, 0, concreteDark);
          box('Raised structural floor', w + .14, .28, d + .14, 0, .30, 0, concreteMat);
          if (unit === 0) box('Upper floor diaphragm', w - wallT * 2, .2, d - wallT * 2, 0, floorY + h * .47, 0, M.interior);
          function facade(face, width, holes, fixed, side = 1) {
            const oriented = (name, sx, sy, sz, x, y, depth, mat) => face === 'z'
              ? box(name, sx, sy, sz, x, floorY + y, fixed + side * depth, mat)
              : box(name, sz, sy, sx, fixed + side * depth, floorY + y, x, mat);
            punchedPlane(width, h, holes, (x, y, sx, sy) => oriented('Pier / lintel', sx, sy, wallT, x, y, 0, M.wall));
            for (const q of holes) {
              const cx = q.x + q.w / 2, cy = q.y + q.h / 2, t = .075 * openingScale;
              openingAudit.push({ face, fixed, side, x: cx, y: floorY + cy, w: q.w, h: q.h, kind: q.kind });
              for (const xx of [q.x + t / 2, q.x + q.w - t / 2]) oriented('Recessed jamb', t, q.h, .19, xx, cy, .012, M.steel);
              for (const yy of [q.y + t / 2, q.y + q.h - t / 2]) oriented('Head / sill frame', q.w - 2 * t, t, .19, cx, yy, .012, M.steel);
              const finish = q.kind === 'window' ? M.glazing : M.steel;
              oriented(q.kind + ' recessed infill', q.w - 2 * t, q.h - 2 * t, .055, cx, cy, -.065, finish);
              if (q.kind === 'window') {
                oriented('Window mullion', .045 * openingScale, q.h - 2 * t, .1, cx, cy, -.01, M.steel);
                oriented('Projecting drip sill', q.w + .14 * openingScale, .075 * openingScale, .39, cx, q.y - .035 * openingScale, .065, M.wall);
              } else if (q.kind === 'louver' || q.kind === 'roller') {
                const pitch = (q.kind === 'louver' ? .22 : .28) * openingScale;
                for (let y = q.y + .16 * openingScale; y < q.y + q.h - .1 * openingScale; y += pitch) oriented('Vent / shutter rib', q.w - .16 * openingScale, .045 * openingScale, .06, cx, y, -.01, metalMat);
              } else {
                oriented('Door kick plate', q.w - .2 * openingScale, .26 * openingScale, .035, cx, q.y + .2 * openingScale, -.025, metalMat);
                oriented('Door pull handle', .045 * openingScale, .35 * openingScale, .08, q.x + q.w - .22 * openingScale, q.y + 1.07 * openingScale, .001, M.timber);
                oriented('Door vision panel', q.w * .49, .66 * openingScale, .018, cx, q.y + 1.65 * openingScale, -.035, M.glazing);
              }
            }
          }
          facade('z', w, front, d / 2 - wallT / 2, 1);
          facade('z', w, back, -d / 2 + wallT / 2, -1);
          for (const side of [-1, 1]) facade('x', d - wallT * 2, sides.filter(q => q.side === side), side * (w / 2 - wallT / 2), side);
          // A continuous ring beam ties the four walls together beneath the roof deck.
          for (const z of [-1, 1]) box('Ring beam', w + .06, .18, .3, 0, topY - .09, z * (d / 2 - .12), M.steel);
          for (const x of [-1, 1]) box('Ring beam', .3, .18, d - .4, x * (w / 2 - .12), topY - .09, 0, M.steel);
          const roofHole = { x: w * .16, y: d * .14 + d / 2, w: w * .18, h: d * .19 };
          // Feed poles remain fixed in world space, so compensate only the penetration fittings.
          const mastWorldOffset = unit === 1 ? -1.2 : unit === 2 ? 2.4 : null;
          const roofMast = mastWorldOffset === null ? null : {
            x: mastWorldOffset * Math.cos(yaw) / ARCHITECTURE_SCALE,
            z: mastWorldOffset * Math.sin(yaw) / ARCHITECTURE_SCALE
          };
          const mastHalf = .14 / ARCHITECTURE_SCALE, mastTrim = .11 / ARCHITECTURE_SCALE, mastOuter = mastHalf + mastTrim;
          const roofApertures = [{ ...roofHole, y: roofHole.y + .14 }];
          if (roofMast) roofApertures.push({ x: roofMast.x - mastHalf, y: (d + .28) / 2 + roofMast.z - mastHalf, w: 2 * mastHalf, h: 2 * mastHalf });
          punchedPlane(w + .28, d + .28, roofApertures, (x, z, sx, sz) =>
            box('Roof slab around rooflight', sx, .22, sz, x, topY + .11, z - (d + .28) / 2, M.wall));
          const deckY = topY + .22, curbX = roofHole.x + roofHole.w / 2, curbZ = d * .14 + roofHole.h / 2;
          if (roofMast) {
            for (const sign of [-1, 1]) {
              box('Service mast flashing', 2 * mastOuter, .09, mastTrim, roofMast.x, deckY + .025, roofMast.z + sign * (mastHalf + mastTrim / 2), M.steel);
              box('Service mast flashing', mastTrim, .09, 2 * mastHalf, roofMast.x + sign * (mastHalf + mastTrim / 2), deckY + .025, roofMast.z, M.steel);
            }
            roofEquipment.push({ kind: 'serviceMast', x0: roofMast.x - mastOuter, x1: roofMast.x + mastOuter, z0: roofMast.z - mastOuter, z1: roofMast.z + mastOuter });
          }
          // Raised rooflight / maintenance hatch has an actual opening through the slab.
          for (const z of [-1, 1]) box('Rooflight curb', roofHole.w + .16, .24, .09, curbX, deckY + .12, curbZ + z * roofHole.h / 2, M.steel);
          for (const x of [-1, 1]) box('Rooflight curb', .09, .24, roofHole.h, curbX + x * roofHole.w / 2, deckY + .12, curbZ, M.steel);
          box(unit === 1 ? 'Access hatch' : 'Rooflight glazing', roofHole.w, .07, roofHole.h, curbX, deckY + .245, curbZ, unit === 1 ? M.steel : M.glazing);
          const parapetY = deckY + .19;
          box('Front parapet', w + .28, .38, .18, 0, parapetY, d / 2 + .03);
          for (const x of [-1, 1]) box('Side parapet', .18, .38, d + .06, x * (w / 2 + .05), parapetY, 0);
          // Two rear scuppers open through the parapet directly above the downpipes.
          const drainX = w * .39, rearZ = -d / 2 - .035;
          const scupperHoles = [-drainX, drainX].map(x => ({ x: x - .11, y: 0, w: .22, h: .14 }));
          punchedPlane(w + .28, .38, scupperHoles, (x, y, sx, sy) => box('Rear parapet / scupper', sx, sy, .18, x, deckY + y, rearZ));
          for (const z of [-1, 1]) box('Parapet coping', w + .43, .07, .29, 0, deckY + .415, z * (d / 2 + .035));
          for (const x of [-1, 1]) box('Parapet coping', .29, .07, d + .08, x * (w / 2 + .06), deckY + .415, 0);
          for (const x of [-drainX, drainX]) {
            box('Scupper outlet', .19, .12, .43, x, deckY + .055, -d / 2 - .18, M.steel);
            box('Rainwater downpipe', .12, deckY - .25, .12, x, (deckY + .25) / 2, -d / 2 - .35, M.steel);
            box('Drain shoe to grade', .12, .12, .38, x, .28, -d / 2 - .46, M.steel);
            for (const y of [1.1, h * .55, h - .2]) box('Downpipe bracket', .24, .035, .4, x, y, -d / 2 - .16, metalMat);
          }
          // Roof equipment has separate solar, access and ventilation zones.
          const hvacX = w * .31, hvacZ = -d * .23, hvacW = 1.2, hvacD = .93;
          box('HVAC isolator curb', hvacW + .14, .14, hvacD + .14, hvacX, deckY + .07, hvacZ, M.steel);
          box('Packaged ventilation unit', hvacW, .47, hvacD, hvacX, deckY + .375, hvacZ, metalMat);
          for (let i = 0; i < 5; i++) box('HVAC exhaust grille', hvacW - .15, .032, .055, hvacX, deckY + .22 + i * .067, hvacZ + hvacD / 2 + .025, M.steel);
          roofEquipment.push({ kind: 'hvac', x0: hvacX - hvacW / 2 - .07, x1: hvacX + hvacW / 2 + .07, z0: hvacZ - hvacD / 2 - .07, z1: hvacZ + hvacD / 2 + .07 });
          roofEquipment.push({ kind: 'rooflight', x0: curbX - roofHole.w / 2 - .1, x1: curbX + roofHole.w / 2 + .1, z0: curbZ - roofHole.h / 2 - .1, z1: curbZ + roofHole.h / 2 + .1 });
          if (solar) {
            const arrayX = -w * .18, arrayZ = unit === 1 ? -d * .27 : -d * .07, arrayW = w * .48, arrayD = d * (unit === 1 ? .30 : .46);
            const rack = new THREE.Group(); rack.position.set(arrayX, deckY + .36, arrayZ); rack.rotation.x = -.11; g.add(rack);
            for (const xx of [-1, 1]) for (const zz of [-1, 1]) {
              const localZ = zz * arrayD * .36, legH = .35 - localZ * Math.sin(rack.rotation.x);
              box('Solar stanchion', .075, legH, .075, arrayX + xx * arrayW * .4, deckY + legH / 2, arrayZ + localZ, M.steel);
            }
            for (const z of [-1, 1]) box('Solar rail', arrayW + .12, .07, .075, 0, -.065, z * arrayD * .36, metalMat, rack);
            for (let col = 0; col < 3; col++) for (let row = 0; row < 2; row++) {
              const pw = arrayW / 3 - .08, pd = arrayD / 2 - .075, px = (col - 1) * arrayW / 3, pz = (row - .5) * arrayD / 2;
              box('Solar module aluminium frame', pw, .065, pd, px, 0, pz, metalMat, rack);
              box('Solar cell module', pw - .055, .018, pd - .055, px, .041, pz, M.solar, rack);
            }
            roofEquipment.push({ kind: 'solar', x0: arrayX - arrayW / 2 - .06, x1: arrayX + arrayW / 2 + .06, z0: arrayZ - arrayD / 2, z1: arrayZ + arrayD / 2 });
          } else {
            // Low-profile service roof has a screened exhaust bank, leaving the rooflight clear.
            const sx = -w * .23, sz = -.15 * d;
            for (const x of [-.36, .36]) {
              box('Exhaust plenum', .47, .43, .65, sx + x, deckY + .215, sz, metalMat);
              box('Weather hood', .63, .065, .85, sx + x, deckY + .445, sz, M.steel);
            }
            roofEquipment.push({ kind: 'exhaust', x0: sx - .72, x1: sx + .72, z0: sz - .46, z1: sz + .46 });
          }
          // Entrances are framed, sheltered, and connected to grade by two broad steps.
          const stepW = unit === 0 ? originalEntryW + 1.1 : originalEntryW + .65;
          const canopyW = stepW * openingScale, canopyD = (unit === 0 ? 1.13 : .84) * openingScale;
          box('Entrance canopy', canopyW, .13 * openingScale, canopyD, entryX, floorY + entryH + .2 * openingScale, d / 2 + canopyD / 2 - .1, M.steel);
          box('Upper entrance step', stepW, .22, .64, entryX, .33, d / 2 + .34, concreteMat);
          box('Lower entrance step', stepW + .17, .11, .94, entryX, .165, d / 2 + .48, concreteDark);
          for (const x of [-1, 1]) {
            const postX = entryX + x * (entryW / 2 + .21 * openingScale);
            box('Entrance timber jamb', .13 * openingScale, entryH + .12 * openingScale, .19, postX, floorY + (entryH + .12 * openingScale) / 2, d / 2 + .04, M.timber);
          }
          if (unit === 0) {
            for (const x of [-w * .16, w * .14]) box('Facade vertical sun fin', .085, h * .33, .5, x, floorY + h * .72, d / 2 + .2, M.timber);
            box('Upper-storey reveal', w - .08, .12, .09, 0, floorY + h * .47, d / 2 + .025, M.steel);
          }
          if (unit === 1) {
            const ramp = box('Workshop loading ramp', w * .45, .15, 1.11, w * .12, .23, d / 2 + .52, concreteMat);
            ramp.rotation.x = .20;
            for (const x of [-1, 1]) box('Loading-bay steel bollard', .12, .78, .12, w * .12 + x * w * .245, .55, d / 2 + .36, M.steel);
          }
          // The rear door uses the same 80% opening size as the other doors, with steps to grade.
          const rearW = rearEntryW * openingScale, rearH = rearEntryH * openingScale;
          const rearStepW = rearEntryW + .55, rearCanopyD = .70 * openingScale;
          box('Rear door rain hood', rearStepW * openingScale, .13 * openingScale, rearCanopyD,
            rearEntryX, floorY + rearH + .2 * openingScale, -d / 2 - rearCanopyD / 2 + .1, M.steel);
          box('Rear door upper step', rearStepW, .22, .64, rearEntryX, .33, -d / 2 - .34, concreteMat);
          box('Rear door lower step', rearStepW + .17, .11, .94, rearEntryX, .165, -d / 2 - .48, concreteDark);
          for (const sign of [-1, 1]) box('Rear door timber jamb', .13 * openingScale, rearH + .12 * openingScale, .19,
            rearEntryX + sign * (rearW / 2 + .21 * openingScale), floorY + (rearH + .12 * openingScale) / 2, -d / 2 - .04, M.timber);
          const meterX = w * .43;
          box('Exterior metering cabinet', .42, .63, .18, meterX, 1.06, d / 2 + .07, M.steel);
          box('Protected electrical conduit', .055, 1.12, .055, meterX, .65, d / 2 + .18, metalMat);
          rectangle(-w / 2, w / 2, floorY, -d / 2, d / 2);
          rectangle(-w / 2 - .19, w / 2 + .19, deckY + .45, -d / 2 - .17, d / 2 + .17);
          for (const x of [-1, 1]) for (const z of [-1, 1]) line([x * w / 2, floorY, z * d / 2], [x * w / 2, topY, z * d / 2]);
          const edges = new THREE.BufferGeometry(); edges.setAttribute('position', new THREE.Float32BufferAttribute(edgePoints, 3));
          g.add(new THREE.LineSegments(edges, lineMat));
          g.userData.architecture = { unit, width: w, height: h, depth: d, wallThickness: wallT, openings: openingAudit, roofEquipment, yaw };
          return bakeStatic(g);
        }
        const bdefs = [[7, 19, 11, 7, 6, true, 0], [13, 27, 9, 6, 5, true, 1], [6, 29, 8, 5, 7, false, 2]]; // preserved campus footprints
        for (const b of bdefs) {
          // The office is north of the road; the workshop and service house are south of it.
          const yaw = b[6] === 0 ? 0 : Math.PI;
          const o = building(b[2], b[3], b[4], b[5], b[6], yaw);
          o.rotation.y = yaw; o.scale.setScalar(ARCHITECTURE_SCALE);
          o.position.set(wx(b[0] * S), surfaceY(b[0] * S, b[1] * S), wz(b[1] * S)); scene.add(o);
        }
        for (const b of bdefs) obstacleCoords.push({ x: wx(b[0] * S), y: surfaceY(b[0] * S, b[1] * S), z: wz(b[1] * S), r: (Math.max(b[2], b[4]) / 2 + 1.2) * ARCHITECTURE_SCALE, h: (b[3] + 1.8) * ARCHITECTURE_SCALE });   // nhà → vật cản: ong/bướm vọt qua mái thay vì xuyên tường
        // Screenshot route: across the campus, then along the workshop's right side.
        const campusRoad = new THREE.Group(); campusRoad.name = 'Đường nội bộ (Campus Access Road)';
        const roadWidth = 3.2, roadShoulder = .24, roadHalf = roadWidth / 2 + roadShoulder;
        const roadStartX = wx(-MX) - BLOCK / 2, roadCornerX = wx(17 * S);
        const roadCornerZ = wz(23.5 * S), roadEndZ = wz(33.5 * S);
        function roadContains(x, z, margin = 0) {
          const h = roadHalf + margin;
          return (x >= roadStartX - margin && x <= roadCornerX + h && Math.abs(z - roadCornerZ) <= h)
            || (Math.abs(x - roadCornerX) <= h && z >= roadCornerZ - h && z <= roadEndZ + margin);
        }
        {
          const stations = [], firstRun = roadCornerX - roadStartX, secondRun = roadEndZ - roadCornerZ;
          const turnGap = Math.ceil((roadHalf + .3) / BLOCK) * BLOCK;
          const station = (x, z, nx, nz, s) => stations.push({ x, z, nx, nz, s, y: -Infinity });
          const firstSteps = Math.ceil((firstRun - turnGap) / BLOCK);
          for (let i = 0; i <= firstSteps; i++) {
            const d = (firstRun - turnGap) * i / firstSteps;
            station(roadStartX + d, roadCornerZ, 0, 1, d);
          }
          // Miter meets both legs with the same vertices; no seam or overlapping road slabs.
          station(roadCornerX, roadCornerZ, -1, 1, firstRun);
          const secondSteps = Math.ceil((secondRun - turnGap) / BLOCK);
          for (let i = 0; i <= secondSteps; i++) {
            const d = turnGap + (secondRun - turnGap) * i / secondSteps;
            station(roadCornerX, roadCornerZ + d, -1, 0, firstRun + d);
          }
          const point = (p, offset) => ({ x: p.x + p.nx * offset, z: p.z + p.nz * offset });
          let bedY = Infinity;
          // Cover every terrain voxel under each road cross-section, including the miter.
          for (let i = 1; i < stations.length; i++) {
            const a = stations[i - 1], b = stations[i], q = [point(a, -roadHalf), point(a, roadHalf), point(b, -roadHalf), point(b, roadHalf)];
            const loI = Math.floor(Math.min(...q.map(p => p.x)) / BLOCK + cx), hiI = Math.floor(Math.max(...q.map(p => p.x)) / BLOCK + cx);
            const loJ = Math.floor(Math.min(...q.map(p => p.z)) / BLOCK + cz), hiJ = Math.floor(Math.max(...q.map(p => p.z)) / BLOCK + cz);
            let hi = -Infinity;
            for (let gi = loI; gi <= hiI; gi++) for (let gj = loJ; gj <= hiJ; gj++) {
              const y = surfaceY(gi, gj); hi = Math.max(hi, y); bedY = Math.min(bedY, y);
            }
            a.y = Math.max(a.y, hi + .07); b.y = Math.max(b.y, hi + .07);
          }
          // Grade above the existing stepped ground without modifying its height data.
          const maxGrade = .12;
          for (let i = 1; i < stations.length; i++) stations[i].y = Math.max(stations[i].y, stations[i - 1].y - maxGrade * (stations[i].s - stations[i - 1].s));
          for (let i = stations.length - 2; i >= 0; i--) stations[i].y = Math.max(stations[i].y, stations[i + 1].y - maxGrade * (stations[i + 1].s - stations[i].s));
          bedY -= .15;
          const asphalt = new THREE.MeshLambertMaterial({ color: 0x73786f, flatShading: true });
          const shoulder = new THREE.MeshLambertMaterial({ color: 0xb4a58a, flatShading: true });
          const earth = new THREE.MeshLambertMaterial({ color: 0x867558, flatShading: true });
          function strip(offset0, offset1, material, name, edgeDrop = false) {
            const vertices = [], indices = [];
            for (const p of stations) for (const offset of [offset0, offset1]) {
              const q = point(p, offset), drop = edgeDrop && Math.abs(offset) > roadWidth / 2 ? .02 : 0;
              vertices.push(q.x, p.y - drop, q.z);
            }
            for (let i = 1; i < stations.length; i++) { const a = (i - 1) * 2, b = i * 2; indices.push(a, a + 1, b, a + 1, b + 1, b); }
            const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
            const mesh = new THREE.Mesh(geometry, material); mesh.name = name; mesh.receiveShadow = true; campusRoad.add(mesh);
          }
          strip(-roadWidth / 2, roadWidth / 2, asphalt, 'Mặt đường liên tục');
          strip(-roadHalf, -roadWidth / 2, shoulder, 'Lề đường bên phải', true);
          strip(roadWidth / 2, roadHalf, shoulder, 'Lề đường bên trái', true);
          const vertices = [], indices = [], packed = new Float32Array((stations.length - 1) * 6);
          const quad = (a, b, c, d) => { const k = vertices.length / 3; vertices.push(...a, ...b, ...c, ...d); indices.push(k, k + 1, k + 2, k, k + 2, k + 3); };
          for (let i = 1; i < stations.length; i++) {
            const a = stations[i - 1], b = stations[i], al = point(a, roadHalf), ar = point(a, -roadHalf), bl = point(b, roadHalf), br = point(b, -roadHalf);
            const at = a.y - .021, bt = b.y - .021;
            quad([al.x, bedY, al.z], [bl.x, bedY, bl.z], [bl.x, bt, bl.z], [al.x, at, al.z]);
            quad([ar.x, bedY, ar.z], [ar.x, at, ar.z], [br.x, bt, br.z], [br.x, bedY, br.z]);
            // Filled top sits below the asphalt/shoulders; the bank always supports the surface.
            quad([al.x, at, al.z], [bl.x, bt, bl.z], [br.x, bt, br.z], [ar.x, at, ar.z]);
            if (i === 1) quad([al.x, bedY, al.z], [al.x, at, al.z], [ar.x, at, ar.z], [ar.x, bedY, ar.z]);
            if (i === stations.length - 1) quad([bl.x, bedY, bl.z], [br.x, bedY, br.z], [br.x, bt, br.z], [bl.x, bt, bl.z]);
            packed.set([Math.min(al.x, ar.x, bl.x, br.x), bedY, Math.min(al.z, ar.z, bl.z, br.z), Math.max(al.x, ar.x, bl.x, br.x), Math.max(a.y, b.y), Math.max(al.z, ar.z, bl.z, br.z)], (i - 1) * 6);
          }
          const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setIndex(indices); geometry.computeVertexNormals();
          const fill = new THREE.Mesh(geometry, earth); fill.name = 'Nền đường bám đất'; fill.receiveShadow = true; campusRoad.add(fill);
          bakedFlightBounds.set(geometry, packed); flightRoots.push(fill);
          campusRoad.userData.road = {
            width: roadWidth, shoulder: roadShoulder, maxGrade, bedY, stations,
            route: [[roadStartX, roadCornerZ], [roadCornerX, roadCornerZ], [roadCornerX, roadEndZ]]
          };
          bakeStatic(campusRoad); scene.add(campusRoad);
        }
        // ---- THÁP NƯỚC thép cạnh cụm 3 nhà — dựng theo tháp nước thật (bồn tôn sóng trên tháp 4 cột):
        //      4 cột ống choãi chân trên móng bê-tông, 2 tầng giằng ngang + thanh giằng chéo chữ X ở mọi ô, ống đứng giữa (riser) có thanh néo;
        //      sàn dầm + ban công vòng có lan can 2 tầng; bồn tôn sóng (gân ngang thật bằng LatheGeometry), đai mối ghép, mái nón tôn có gân,
        //      ống thông hơi kiểu nấm, nắp thăm; thang có lồng an toàn lên ban công + thang lên mái, ống tràn xuống đất, thước đo mực nước ----
        function waterSilo() {
          const g = new THREE.Group(), v3 = (x, y, z) => new THREE.Vector3(x, y, z);
          const tankMat = new THREE.MeshLambertMaterial({ color: 0xc4c8cd }), tankDark = new THREE.MeshLambertMaterial({ color: 0xa6abb1 });
          const TH = 3.0, R = 1.45, SH = 2.6, y0 = TH + 0.12, yTop = y0 + SH, RB = 1.55, RT = 1.06, RD = R + 0.4, roofH = 0.52;
          const add = (m, x, y, z) => { m.position.set(x, y, z); g.add(m); return m; };
          const rod = (a, b, r, mat = legMat, segs = 6) => rodBetween(g, a, b, r, mat, segs, r > 0.02);
          const C = (r0, r1, h, mat, x, y, z, segs, out) => add(cyl(r0, r1, h, mat, true, !!out, lineMat, segs), x, y, z);
          const ring = (rad, tube, y) => { add(new THREE.Mesh(new THREE.TorusGeometry(rad, tube, 4, 48), legMat), 0, y, 0).rotation.x = Math.PI / 2; };
          // 4 cột choãi (chân r 1,55 → đỉnh r 1,06) + móng; at(k, f) = điểm trên cột k ở tỉ lệ cao f
          const at = (k, f) => { const a = Math.PI / 4 + (k % 4) * Math.PI / 2, c = Math.cos(a), s = Math.sin(a); return v3(RB * c, 0.12, RB * s).lerp(v3(RT * c, TH, RT * s), f); };
          for (let k = 0; k < 4; k++) { rod(at(k, 0), at(k, 1), 0.075, legMat, 8); const b = at(k, 0); add(bx(0.44, 0.26, 0.44, concreteMat, true, true), b.x, 0.02, b.z); }
          const lv = [0, 0.36, 0.7, 1];
          for (let k = 0; k < 4; k++) for (let i = 0; i < 3; i++) {
            if (i) rod(at(k, lv[i]), at(k + 1, lv[i]), 0.045);                                                                        // giằng ngang
            rod(at(k, lv[i]), at(k + 1, lv[i + 1]), 0.014, legMat, 4); rod(at(k + 1, lv[i]), at(k, lv[i + 1]), 0.014, legMat, 4);   // giằng chéo X (thanh néo gió)
          }
          // ống đứng giữa (riser) + thanh néo về cột ở 2 tầng giằng; chân có mặt bích + tay van
          C(0.13, 0.13, TH, legMat, 0, TH / 2, 0, 12); C(0.2, 0.2, 0.08, legMat, 0, 0.3, 0, 12);
          for (const f of [0.36, 0.7]) for (let k = 0; k < 4; k++) rod(v3(0, 0.12 + (TH - 0.12) * f, 0), at(k, f), 0.012, legMat, 4);
          add(new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 4, 14), tankDark), 0.2, 0.55, 0).rotation.y = Math.PI / 2;
          // sàn: khung dầm vuông trên đỉnh cột + dầm chữ thập, mặt sàn tròn rộng hơn bồn làm ban công, lan can 2 tầng
          for (let k = 0; k < 4; k++) rod(at(k, 1), at(k + 1, 1), 0.06);
          rod(v3(-RD + 0.1, TH - 0.04, 0), v3(RD - 0.1, TH - 0.04, 0), 0.05); rod(v3(0, TH - 0.04, -RD + 0.1), v3(0, TH - 0.04, RD - 0.1), 0.05);
          C(RD, RD, 0.12, tankDark, 0, TH + 0.06, 0, 40, true);
          for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; add(cyl(0.018, 0.018, 0.56, legMat, false, false, null, 4), (RD - 0.05) * Math.cos(a), y0 + 0.28, (RD - 0.05) * Math.sin(a)); }
          ring(RD - 0.05, 0.022, y0 + 0.56); ring(RD - 0.05, 0.014, y0 + 0.3);
          // bồn tôn sóng: biên dạng gợn sin theo chiều cao (~8 sóng / 1 m), đai đáy · 2 mối ghép · đai đỉnh
          const pr = [new THREE.Vector2(R, 0)], NW = 21;
          for (let i = 0; i <= NW * 4; i++) pr.push(new THREE.Vector2(R + 0.022 * Math.sin(i * Math.PI / 2), 0.08 + (SH - 0.16) * i / (NW * 4)));
          pr.push(new THREE.Vector2(R, SH));
          const shell = add(new THREE.Mesh(new THREE.LatheGeometry(pr, 40), tankMat), 0, y0, 0); shell.castShadow = shell.receiveShadow = true;
          for (const y of [y0 + 0.04, y0 + SH * 0.36, y0 + SH * 0.7, yTop - 0.03]) C(R + 0.03, R + 0.03, 0.06, tankDark, 0, y, 0, 40);
          // mái nón tôn có 20 gân, ống thông hơi nấm ở đỉnh, nắp thăm cạnh đầu thang
          C(0.12, R + 0.1, roofH, tankMat, 0, yTop + roofH / 2, 0, 40, true);
          for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); rod(v3(0.14 * c, yTop + roofH - 0.01, 0.14 * s), v3((R + 0.09) * c, yTop + 0.01, (R + 0.09) * s), 0.014, tankDark, 4); }
          C(0.09, 0.09, 0.26, tankDark, 0, yTop + roofH + 0.12, 0, 10); C(0.03, 0.22, 0.12, tankMat, 0, yTop + roofH + 0.3, 0, 12, true);
          const hatch = new THREE.Group(), hr = 0.86; hatch.position.set(hr * Math.SQRT1_2, yTop + roofH * (1 - (hr - 0.12) / (R - 0.02)) + 0.03, hr * Math.SQRT1_2); hatch.rotation.y = -Math.PI / 4; g.add(hatch);
          const hb = bx(0.34, 0.07, 0.34, tankDark, true, true); hb.rotation.z = -Math.atan2(roofH, R - 0.02); hatch.add(hb);
          // thang ở hướng 45° (phía camera): thang đất → ban công có lồng an toàn, thang bồn → mái; P(r, y, t) = bán kính r, cao y, lệch ngang t
          const P = (r, y, t) => v3((r - t) * Math.SQRT1_2, y, (r + t) * Math.SQRT1_2);
          const ladder = (r, y1, y2, cage, cageTop) => {
            for (const t of [-0.17, 0.17]) rod(P(r, y1, t), P(r, y2, t), 0.018, legMat, 5);
            for (let y = y1 + 0.2; y < y2 - 0.05; y += 0.28) rod(P(r, y, -0.17), P(r, y, 0.17), 0.011, legMat, 4);
            if (!cage) return;
            for (let y = cage; y < cageTop; y += 0.5) { const h = add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 4, 12, Math.PI), legMat), ...P(r, y, 0).toArray()); h.rotation.set(-Math.PI / 2, -3 * Math.PI / 4, 0, 'YXZ'); }
            for (const q of [0.25, 0.5, 0.75]) { const a = q * Math.PI; rod(P(r + 0.3 * Math.sin(a), cage, 0.3 * Math.cos(a)), P(r + 0.3 * Math.sin(a), cageTop, 0.3 * Math.cos(a)), 0.01, legMat, 4); }
          };
          ladder(RB + 0.22, 0.1, y0 + 0.9, 1.7, TH - 0.08); ladder(R + 0.16, y0 + 0.05, yTop + 0.3, 0);
          for (const f of [0.36, 0.7]) rod(P(RB + 0.22, 0.12 + (TH - 0.12) * f, 0), at(0, f), 0.016, legMat, 4);   // chân đỡ thang vào cột
          // ống tràn (hướng 120°): cút ngang ra khỏi bồn → dọc thành bồn → xiên theo cột xuống tấm đỡ
          const oc = Math.cos(2.09), os = Math.sin(2.09);
          rod(v3(R * oc, yTop - 0.12, R * os), v3((R + 0.12) * oc, yTop - 0.12, (R + 0.12) * os), 0.04);
          rod(v3((R + 0.12) * oc, yTop - 0.12, (R + 0.12) * os), v3((R + 0.12) * oc, TH - 0.05, (R + 0.12) * os), 0.04);
          rod(v3((R + 0.12) * oc, TH - 0.05, (R + 0.12) * os), v3(-1.28, 0.16, 1.28), 0.04); add(bx(0.32, 0.06, 0.32, concreteMat, true, true), -1.32, 0.03, 1.32);
          // thước đo mực nước (hướng −20°): bảng trắng + kim vàng, dây phao vắt qua mép mái
          const gg = new THREE.Group(), ga = -0.35; gg.position.set((R + 0.05) * Math.cos(ga), y0 + SH / 2, (R + 0.05) * Math.sin(ga)); gg.rotation.y = -ga; g.add(gg);
          gg.add(bx(0.03, SH * 0.82, 0.16, wallMat, true, true)); const nd = bx(0.06, 0.05, 0.22, warningMat, true, true); nd.position.y = 0.32; gg.add(nd);
          rod(v3((R + 0.06) * Math.cos(ga), yTop - 0.2, (R + 0.06) * Math.sin(ga)), v3((R + 0.06) * Math.cos(ga), yTop + 0.06, (R + 0.06) * Math.sin(ga)), 0.008, legMat, 4);
          return bakeStatic(g);
        }
        { const silo = waterSilo(); silo.position.set(X0 + 43, 7, Z0 + 57); silo.scale.setScalar(1.25 * ARCHITECTURE_SCALE); silo.name = 'Bồn chứa nước (Water Silo)'; scene.add(silo); }

