        // ==== MẶT CÔNG KHAI CỦA XE (core/world.js · G 01/11 "các object cũng độc lập"): đơn vị khác chỉ đọc qua VAN (= worldSee('van')) — không đụng caravanObj,
        //      vanPt, lối cửa… Đổi toạ độ xe → thế giới (vanPt), hướng ra cửa lùa (vanOut), lối cửa lùa (xa — bậc — trong xe) + khe sàn cabin giữa 2 ghế trước —
        //      chó và kỹ sư cùng đi lối này (tách từ animals/rain-shelter.js). Đăng ký ngay sau khi dựng xong xe: trại đặt ghế, bàn theo thân xe ----
        caravanObj.updateMatrixWorld(true);
        const vanPt = (x, y, z) => caravanObj.localToWorld(new THREE.Vector3(x, y, z)), vanOut = new THREE.Vector3(Math.sin(caravanObj.rotation.y), 0, Math.cos(caravanObj.rotation.y));
        const dogDoorFar = vanPt(0.345, 0, 2.8), dogDoorStep = vanPt(0.345, 0, 1.85), dogInside = vanPt(0.345, TR.yIn, 0.66), dogBed = vanPt(-1.18, TR.yIn, 0.0);   // ổ chó: sàn cabin giữa 2 đế ghế trước (khe 0,58)
        // ---- BÀN HỌC trong xe (van/interior/caravan.js) — mỗi món một mặt riêng: người dùng đọc chỗ / dáng, đổi bằng chỗ chạm; xe tự diễn (nắp mở mượt, màn sáng) ----
        const VAN_LAPTOP = {   // laptop: toạ độ MacBook (spec: gốc giữa đáy, +x bên phải người ngồi, +z phía người ngồi) × k (to thêm 30%)
          get group() { return studyLaptop.group; },                  // thân máy (Object3D)
          get open() { return studyLaptop.open; },                    // nắp đang mở 0…1
          get ctx() { return studyLaptop.ctx; },                      // bút vẽ màn hình (canvas 2D spec.CW × spec.CH) — vẽ xong gọi shown()
          get spec() { return MBP; }, get k() { return LAP_K; },
          lid: v => { studyLaptop.target = v; },                      // chỗ chạm: đích nắp 0 gập · 1 mở — xe tự mở / gập mượt (studyLaptopTick)
          lidNow: v => { studyLaptop.open = v; },                     //   — mở ngay (vào giữa giờ làm)
          shown: () => { studyLaptop.tex.needsUpdate = true; },       // chỗ chạm: màn hình vừa vẽ lại — đẩy lên đồ hoạ (cả màn phụ)
        };
        const VAN_STUDY_CHAIR = {   // ghế văn phòng: lăn trước–sau off · ngang sx (đv xe) · xoay mâm sw (rad) · tay vịn crôm ±arm.x, cao arm.y trên mâm
          get off() { return studyChairRig.off; }, get sx() { return studyChairRig.sx; }, get sw() { return studyChairRig.sw; },
          get swivel() { return studyChairRig.swivel; }, get arm() { return studyChairRig.arm; },
          roll: (off, sx, sw) => { const R = studyChairRig; R.off = off; R.sx = sx; R.sw = sw; if (R.obj) { R.obj.position.z = R.home + off; R.obj.position.x = sx; R.swivel.rotation.y = sw; } },   // chỗ chạm: lăn + xoay ghế
          recline: (to, k) => { const b = studyChairRig.back; b.rotation.x += (to - b.rotation.x) * k; },   // chỗ chạm: lưng ghế ngả dần về to (rad), k phần mỗi khung
        };
        const VAN_BOARD = {   // bảng ghim cạnh bàn: toạ độ bảng +x dọc bảng, +y lên, +z ra khỏi vách · 4 tờ dán vàng ghim xoay vòng
          get g() { return studyBoard.g; }, get slots() { return studyBoard.slots; }, get next() { return studyBoard.next; },   // khung bảng (Object3D) · chỗ ghim [x, y] · tờ kế tiếp
          get padP() { return studyBoard.padP; },                     // tập giấy dán trên bàn (toạ độ xe)
          get hasHeld() { return !!studyBoard.held; },
          pin: (i, sl, rz) => { const B = studyBoard, p = B.notes[i % B.notes.length]; p.n.position.set(sl[0], sl[1], 0.016); p.n.rotation.z = rz; p.n.visible = true; p.pn.position.set(sl[0], sl[1] + 0.025, 0.022); p.pn.visible = true; B.next++; },   // chỗ chạm: ghim tờ i vào chỗ sl, nghiêng rz
          carry: (on, p) => { const H = studyBoard.held; H.visible = on; if (on) { H.parent.worldToLocal(p); H.position.copy(p); } },   // chỗ chạm: tờ đang cầm hiện ở p (thế giới; p bị đổi sang toạ độ bàn) · on = false: cất
        };
        // ==== NỘI THẤT (01/11 "các object cũng độc lập"): người trong xe đọc số đo qua VAN.inside, đổi đồ trong xe qua chỗ chạm — phòng tắm VAN.bath,
        //      ghế đẩu VAN.stool, giường VAN.bed, lon coke trên bàn học VAN.deskCoke. Cửa lùa phòng tắm + nắp bồn cầu là của xe: người chỉ nói muốn mở / đóng
        //      (bath.door.want, bath.lid), xe tự trượt cửa / nâng nắp mỗi khung (vanBathTick cuối vanFrameTick, ngay trước lượt người — dời nguyên văn từ
        //      engineer/tasks/van-nav.js vanDoorsTick). Vòi sen (tia nước, hơi nước, sàn ướt tự khô) cũng của xe: van/interior/bath-fx.js ----
        const VIN = caravanObj.userData.interior, VBR = VIN.bath;
        const VAN_INSIDE = { kitDx: VIN.kitDx, bed: VIN.bed, table: VIN.table, study: VIN.study, sleepPosition: VIN.sleepPosition, sleepHead: VIN.sleepHead, bedTop: VIN.bedTop };
        const VBATH_DOOR = { g: VBR.entryDoor, axis: 'z', slide: -0.56, c: null, k: 0, target: 0, shown: -1 };   // trượt vào sau vách đặc phía bàn học (rèm kính buồng tắm bỏ 31/10)
        const VBATH_LID = { k: 0, target: 0, shown: -1 };   // nắp bồn cầu: 0 đậy · 1 dựng vào két
        function vanBathTick(dt) {
          for (const d of [VBATH_DOOR]) {
            d.k += Math.sign(d.target - d.k) * Math.min(Math.abs(d.target - d.k), dt / 0.9);
            if (d.k !== d.shown) { d.shown = d.k; d.g.position[d.axis] = d.slide * d.k * d.k * (3 - 2 * d.k); }
          }
          VBATH_LID.k += Math.sign(VBATH_LID.target - VBATH_LID.k) * Math.min(Math.abs(VBATH_LID.target - VBATH_LID.k), dt / 0.7);
          if (VBATH_LID.k !== VBATH_LID.shown) { VBATH_LID.shown = VBATH_LID.k; VBR.lid.rotation.z = -1.62 * minJerk(VBATH_LID.k); }
        }
        const VAN_BATH_DOOR = { get k() { return VBATH_DOOR.k; }, get c() { return VBATH_DOOR.c; }, want: v => { VBATH_DOOR.target = v; } };   // k 0 đóng → 1 mở · c tâm khe cửa (thế giới)
        const VAN_BATH = {
          get x1() { return VBR.x1; }, get xB() { return VBR.xB; }, get twcX() { return VBR.twcX; }, get snkX() { return VBR.snkX; }, get towelX() { return VBR.towelX; }, get towelZ() { return VBR.towelZ; },   // số đo (toạ độ xe)
          get door() { if (!VBATH_DOOR.c) VBATH_DOOR.c = vanPt(VBR.x1, TR.yIn, 0.0); return VAN_BATH_DOOR; },   // cửa lùa (tâm khe đo lúc người hỏi lần đầu)
          lid: v => { VBATH_LID.target = v; }, get lidK() { return VBATH_LID.k; },   // nắp bồn cầu: muốn 0 đậy / 1 mở · đang mở tới đâu
          lidNow: v => { VBATH_LID.k = VBATH_LID.target = v; },          // đặt nắp ngay (mở trang giữa lúc đang ngồi bồn cầu)
          tap: (on, t) => { VBR.tapWater.visible = on; if (on) VBR.tapWater.scale.set(1 + Math.sin(t * 40) * 0.15, 1, 1 + Math.cos(t * 37) * 0.15); },   // vòi lavabo
          towel: v => { VBR.towel.visible = v; },                      // khăn trên giá (người lấy khăn thì khăn trên giá ẩn)
          get helmetOn() { return VBR.shelfHelmet.visible; }, helmet: v => { VBR.shelfHelmet.visible = v; },   // mũ trên kệ
          shower: v => { bathShower.on = v; },                         // vòi sen mở / tắt
          airOut: d => { bathShower.steam = Math.max(0, bathShower.steam - d); },   // mở cửa, gạt kính: hơi nước tan bớt d
          steamNow: v => { bathShower.steam = v; },                    // đặt độ hơi nước ngay (mở trang giữa lúc đang tắm)
          soak: () => { VBR.wet = 1; }, mop: d => { VBR.wet = Math.max(0, VBR.wet - d); },   // sàn ướt hẳn · gạt bớt nước d
          held: name => VBR[name].parent !== VBR.group,                // 'brush' | 'squee' đang ở tay ai đó
          hand: (name, wrist) => { const o = VBR[name]; if (wrist) { wrist.attach(o); o.position.set(0, -0.3, 0.03); o.rotation.set(0, 0, 0); } else { VBR.group.attach(o); o.position.copy(o.userData.home.p); o.quaternion.copy(o.userData.home.q); } },   // trao chổi / gạt nước vào cổ tay (null: về chỗ)
        };
        const VAN_STOOL = { get x() { return VIN.stool.x; }, get rest() { return VIN.stool.rest; }, get in() { return VIN.stool.in; }, slide: z => { VIN.stool.obj.position.z = z - VIN.stool.rest; } };   // ghế đẩu bàn ăn: kéo ra / đẩy vào tới z
        const VAN_BED = { get duvetOn() { return VIN.duvet.visible; }, duvet: v => { VIN.duvet.visible = v; }, get duvetMat() { return VIN.duvetMat; }, helmet: v => { VIN.bedHelmet.visible = v; } };   // chăn gấp cuối giường · vải chăn (để may chăn đắp riêng) · mũ cuối giường
        // ---- BẾP (01/11 đợt 7b): người nấu đọc chỗ qua VAN.kitchen, đổi đồ bếp bằng chỗ chạm — núm ga, nồi, chảo, dao, hành, vòi chậu. Lửa là của bếp:
        //      núm vặn quá nửa vòng thì họng tự bén lửa, về dưới nửa thì tắt. Lửa nhảy, hơi nồi + tô udon, đèn + quạt máy hút mùi, khói ống bếp xe tự chạy theo
        //      lửa đang cháy (van/interior/galley-fx.js). Món ăn: người báo món đang ở đâu (VAN.dish) — xe tự hiện bát ngũ cốc / tô udon trên bàn ăn, tô trên
        //      mặt đá, chảo trên bếp; chảo trên móc ẩn khi đã lấy. Người ăn ở bàn đọc bát qua VAN.tableBowl ----
        const VK = VIN.kitchen, VKP = VK.pot.parent;   // khung tủ bếp: mặt tủ x ≈ 2,40 quay ra lối đi, vách 2,97, mặt đá y = TOP
        VK.stovePan.userData.home = VK.stovePan.position.clone(); VK.pot.userData.home = VK.pot.position.clone();
        const VAN_KITCHEN = {
          get TOP() { return VK.TOP; },                                // mặt đá (toạ độ tủ bếp)
          toWorld: (x, y, z, out) => VKP.localToWorld(out.set(x, y, z)),   // toạ độ tủ bếp → thế giới (ghi vào out)
          knobZ: i => VK.knobs[i].position.z, knobAt: (i, out) => VK.knobs[i].getWorldPosition(out),   // núm ga i (0 họng trước, 1 họng sau): chỗ dọc mặt bếp · chỗ thế giới
          knob: (i, v) => { VK.knobs[i].rotation.x = -1.4 * v; VK.flames[i].visible = v > 0.5; },   // chỗ chạm: vặn núm i tới v (0 tắt → 1 mở ¼ vòng) — quá nửa thì bén lửa
          potAt: out => VK.pot.getWorldPosition(out), waterAt: out => VK.potWater.getWorldPosition(out),   // tâm nồi · mặt nước (thế giới)
          potHandle: (i, out) => VK.pot.localToWorld(out.set(0, 0.098, i ? -0.11 : 0.11)),   // quai nồi i (0 bên phải người đứng bếp, 1 bên trái)
          fillPot: () => { VK.potWater.visible = true; VK.potWater.material.color.set(0x9cc7d8); },   // chỗ chạm: nồi có nước
          steam: v => { VK.steam = v; },                               // chỗ chạm: nồi sôi tới đâu (0–1) — hơi bốc theo
          get noodlesIn() { return VK.potNoodles.visible; }, noodles: v => { VK.potNoodles.visible = v; },   // sợi udon trong nồi
          pourOut: () => { VK.potNoodles.visible = false; VK.potWater.visible = false; },   // chỗ chạm: rót hết nồi ra bát
          potLift: (up, tilt) => { const h = VK.pot.userData.home; VK.pot.position.set(h.x - 0.04 * up, h.y + 0.12 * up, h.z - 0.16 * up); VK.pot.rotation.x = -0.9 * tilt; VK.pot.updateWorldMatrix(true, false); },   // nhấc nồi up (0–1) + nghiêng rót tilt
          potHome: () => { VK.pot.position.copy(VK.pot.userData.home); VK.pot.rotation.set(0, 0, 0); },   // đặt nồi lại họng sau
          panAt: out => VK.stovePan.getWorldPosition(out), panHandle: out => VK.stovePan.localToWorld(out.set(0.175, 0.045, 0)),   // tâm chảo · chỗ nắm cán (thế giới)
          panAxis: out => out.set(1, 0, 0).transformDirection(VK.stovePan.matrixWorld),   // hướng cán chảo (thế giới)
          panToss: ph => {   // chỗ chạm: nhịp hất chảo ph — < 1 đang hất: chảo nảy lên, nghiêng, cơm bay lên rơi xuống · ≥ 1 nằm yên trên họng
            const P = VK.stovePan, home = P.userData.home, food = P.userData.food;
            if (ph < 1) {
              const s = Math.sin(Math.PI * ph);
              P.position.set(home.x - 0.02 * s, home.y + 0.04 * s, home.z); P.rotation.set(0, Math.PI, 0.25 * s); food.position.y = 0.035 * Math.sin(Math.PI * Math.min(1, ph * 1.3));
            } else { P.position.copy(home); P.rotation.set(0, Math.PI, 0); food.position.y = 0; }
            P.updateWorldMatrix(true, false);
          },
          panHome: () => { const P = VK.stovePan; P.position.copy(P.userData.home); P.rotation.set(0, Math.PI, 0); P.userData.food.position.y = 0; },   // chảo nằm yên, cơm lắng
          knifeOnPeg: v => { VK.pegKnife.visible = v; },               // dao trên móc (người cầm dao thì dao trên móc ẩn)
          get scallionN() { return VK.scallions.length; }, chopped: n => { VK.scallions.forEach((s, i) => { s.visible = i < n; }); },   // hành lá trên thớt: n khúc đã thái
          tap: (on, t) => { VK.tapWater.visible = on; if (on) VK.tapWater.scale.set(1 + Math.sin(t * 40) * 0.15, 1, 1 + Math.cos(t * 37) * 0.15); },   // vòi chậu bếp
          reset: () => {   // chỗ chạm: dọn bếp — tắt lửa, đổ nước nồi, dao về móc, nồi + chảo về chỗ (bỏ dở việc nấu / đi ngủ)
            for (const f of VK.flames) f.visible = false;
            for (const k of VK.knobs) k.rotation.x = 0;
            VK.potWater.visible = VK.potNoodles.visible = VK.tapWater.visible = false; VK.steam = 0; VK.pegKnife.visible = true;
            for (const s of VK.scallions) s.visible = false;
            VK.pot.position.copy(VK.pot.userData.home); VK.pot.rotation.set(0, 0, 0);
            VK.stovePan.position.copy(VK.stovePan.userData.home); VK.stovePan.rotation.set(0, Math.PI, 0);
          },
        };
        const VDISH = { kind: null, food: 0 };   // món người vừa báo: loại + phần còn lại (tô càng vơi càng nguội — galley-fx.js)
        function vanDish(kind, at, f, sip) {   // chỗ chạm: món kind đang ở at, còn f — xe hiện đúng một chỗ trong xe; sip: đang bưng tô húp (tô trên bàn ẩn)
          VDISH.kind = kind; VDISH.food = f;
          const C = VIN.cerealBowl, U = VIN.tableUdon;
          C.visible = at === 'table' && kind === 'cereal'; if (C.visible) setFood(C.userData.food, f, 0.012);
          U.visible = at === 'table' && kind === 'udon' && !sip; if (U.visible) setFood(U.userData.food, f, 0.022);
          VK.counterBowl.visible = at === 'counter'; if (VK.counterBowl.visible) setFood(VK.counterBowl.userData.food, f, 0.022);
          VK.stovePan.visible = at === 'stove'; if (VK.stovePan.visible) setFood(VK.stovePan.userData.food, f, 0);
          VK.pegPan.visible = kind !== 'pan';
        }
        const vanBowlRead = b => ({ pos: v => b.getWorldPosition(v), pt: v => b.localToWorld(v) });   // bát: tâm · điểm trên bát (toạ độ bát → thế giới, ghi vào v)
        const VAN_TABLE_BOWL = { udon: vanBowlRead(VIN.tableUdon), cereal: vanBowlRead(VIN.cerealBowl) };
        let VAN_AW;   // mái bạt hiên dò 1 lần lúc có người hỏi (dời nguyên văn từ engineer/mind/reactions.js RX_AW, 01/11)
        function vanAwning() {
          if (VAN_AW !== undefined) return VAN_AW;
          let a = null; caravanObj.traverse(o => { const p = o.isMesh && o.geometry.parameters; if (p && (p.height === 0.014 || p.height === 0.04) && p.depth === 2.4) a = o; });   // tấm bạt (18/10 mỏng còn 1,4 cm — trước đó dò 4 cm nên hụt, rxDry luôn sai)
          if (!a) return (VAN_AW = null); const w = a.geometry.parameters.width / 2;
          return (VAN_AW = { x0: a.position.x - w + 0.1, x1: a.position.x + w - 0.1, z0: a.position.z - 1.2, z1: a.position.z + 1.05 });
        }
        worldFace('van', {
          get object() { return caravanObj; },                         // thân xe (Object3D): đổi toạ độ xe ↔ thế giới; vào xe = tự gắn thân mình vào đây
          get yaw() { return caravanObj.rotation.y; },
          toWorld: (x, y, z) => vanPt(x, y, z),                        // toạ độ xe → thế giới (Vector3 mới)
          get out() { return vanOut; },                                // hướng từ xe ra phía cửa lùa (+z cục bộ)
          get doorFar() { return dogDoorFar; },                        // lối cửa lùa: điểm xa 2,8 đv trước cửa
          get doorStep() { return dogDoorStep; },                      //   — trước bậc
          get doorIn() { return dogInside; },                          //   — trong xe (y = mặt sàn)
          get dogBed() { return dogBed; },                             // ổ chó: sàn cabin giữa 2 ghế trước
          get doorField() { return vanDoorField; },                    // bảng đường tới lối cửa (van/door-field.js — dựng sau khi đủ vật cản)
          get dims() { return TR; },                                   // số đo Transit (đv xe): yIn = mặt sàn trong xe, …
          get awningLamp() { return awLan; },                          // đèn lồng treo mép bạt hiên (Object3D)
          get awning() { return vanAwning(); },                        // mái bạt hiên (toạ độ xe) { x0, x1, z0, z1 }: đứng trong vùng này là khỏi mưa | null
          get awPoles() { return caravanObj.userData.awPoles; },       // 2 chân chống bạt [[x, z], …] (toạ độ xe)
          get inside() { return VAN_INSIDE; },                         // số đo nội thất (toạ độ xe): kitDx, bed, table, study, sleepPosition, sleepHead, bedTop
          get bath() { return VAN_BATH; },                             // phòng tắm (trên)
          get stool() { return VAN_STOOL; },                           // ghế đẩu bàn ăn
          get bed() { return VAN_BED; },                               // giường
          deskCoke: v => { if (VIN.studyCoke) VIN.studyCoke.visible = v; },   // lon coke trên bàn học (ẩn khi đang có người cầm)
          get kitchen() { return VAN_KITCHEN; },                       // bếp (trên)
          dish: vanDish,                                               // chỗ chạm: món đang ở đâu (kind, at, food, sip) — xe tự hiện bát / chảo trong xe
          tableBowl: meal => { const b = meal === 'udon' ? VIN.tableUdon : VIN.cerealBowl; b.updateWorldMatrix(true, false); return meal === 'udon' ? VAN_TABLE_BOWL.udon : VAN_TABLE_BOWL.cereal; },   // bát trên bàn ăn { pos(v), pt(v) }
          get steps() { return caravanObj.getObjectByName('Bậc cửa có khung đỡ').userData; },   // bậc cửa lùa { treads [{ y, height, z… }], door { cx, wall, w… } } (toạ độ xe)
          get engineOn() { return ENGR.on; },                          // máy đang nổ
          mount: o => { caravanObj.add(o); return o; },                // chỗ chạm: gắn đồ của mình vào thân xe (đi theo xe, toạ độ xe) — Zzz của kỹ sư
          get laptop() { return VAN_LAPTOP; },                         // laptop bàn học (trên)
          get studyChair() { return VAN_STUDY_CHAIR; },                // ghế xoay bàn học
          get board() { return VAN_BOARD; },                           // bảng ghim cạnh bàn học
          get hood() { return VPART.hoodBtn && VPART.hoodBtn.part; },  // ca-pô { g, open, a = góc mở } | null (van/body/van-doors.js)
          openHood: v => { if (VPART.hoodBtn) vanPartToggle(VPART.hoodBtn, v); },   // chỗ chạm: mở / đóng ca-pô (bật chốt — ca-pô tự nâng / sập)
          get engineModel() { return vanGlb.engine; },                 // khối máy GLB (chưa nạp: undefined)
          engineSeen: () => engineSeen(),                              // máy đang thấy được: xem xuyên hoặc ca-pô mở > 17° (van/engine/engine-run.js)
          engineClick: hits => engineClick(hits),                      // tia bấm (hits) chạm máy đang thấy, trước đồ nội thất ⇒ true (bảng "Khởi động máy", không đổi xem xuyên)
          get xray() { return caravanXray; },                          // đang xem xuyên (vỏ 25 %, nét viền giữ — van/body/xray.js)
          setXray: on => setCaravanXray(on),                           // chỗ chạm: bật / tắt xem xuyên (người xem bấm xe)
          runEngine: (on, noX) => engineToggle(on, noX),               // chỗ chạm: nổ / tắt máy (chìa từ xa) · noX: không tự xem xuyên vỏ
          get holo() { return engHolo; },                              // hình động cơ nổi (van/engine/engine-holo.js): warm() dựng dần · start(mặt người xem) · tick(dt, t) · stop() · state { on, done }
        });
