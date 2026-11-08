        // ==== XEM XUYÊN XE (01/11 đợt 11 — dời nguyên văn từ ui/xray-lifecycle.js: xem xuyên là một trạng thái của xe, như cửa mở): mặt vỏ xe mờ đi, chỉ còn
        //      nét line-art; nội thất (giường, toilet, lavabo, bếp, bàn học, bàn…) giữ nguyên. Bên ngoài chỉ hỏi / bật qua mặt xe: VAN.xray, VAN.setXray(on) —
        //      người xem bấm xe (ui/xray-lifecycle.js); đề máy tự xem xuyên để thấy máy (van/engine/engine-run.js); vỏ GLB nạp sau tự vào danh sách (xrayAdopt,
        //      van/body/transit-glb.js) ----
        const caravanRole = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.xray) return p.userData.xray; return ''; };
        const caravanShell = [];
        caravanObj.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') caravanShell.push(o); });
        const shellHidden = new THREE.MeshBasicMaterial({ visible: false });   // ẩn mặt nhưng nét viền con vẫn vẽ, và vẫn bấm trúng được
        // xem xuyên = mặt vỏ còn 25% (thấy dáng xe), nét viền giữ 100%,
        //  vỏ trong khoang hàng (userData.xrayHide) ẩn hẳn ⇒ nội thất rõ; mỗi vật liệu vỏ 1 bản mờ dùng chung
        // thanh nét viền (VAN_LINES.k — core/axes-pin-bake.js; thanh trượt ở ui/labels-controls.js)
        //  làm mờ luôn mặt vỏ — độ mờ = min(xem xuyên ? 0,25 : 1, k); vách phòng tắm (userData.vanWall) không theo thanh; 0 ⇒ ẩn mặt nhưng vẫn bấm trúng
        const xrayMats = new Map(), xrayOf = m => { let x = xrayMats.get(m); if (!x) { x = m.clone(); x.transparent = true; x.depthWrite = false; x.userData.op0 = m.opacity ?? 1; xrayMats.set(m, x); } return x; };
        const vanWall = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.vanWall) return true; return false; };
        let caravanXray = false;
        function shellLook(m) {
          const base = m.userData.xrayMaterial || m.material, a = Math.min(caravanXray ? 0.25 : 1, vanWall(m) ? 1 : VAN_LINES.k);
          if (a >= 1) { if (m.userData.xrayMaterial) { m.material = base; delete m.userData.xrayMaterial; } return; }
          m.userData.xrayMaterial = base;
          if (a <= 0 || m.userData.xrayHide || !base.color) { m.material = shellHidden; return; }
          const x = xrayOf(base); x.opacity = Math.min(a, x.userData.op0); m.material = x;
        }
        function xrayAdopt(root) {   // vỏ nạp sau (mẫu GLB Transit): đưa vào danh sách vỏ, đang xem xuyên / thanh trượt < 100 thì đổi luôn
          root.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') { caravanShell.push(o); shellLook(o); } });
        }
        function setCaravanXray(on) { if (on === caravanXray) return; caravanXray = on; for (const m of caravanShell) shellLook(m); }
        VAN_LINES.onShell = () => { for (const m of caravanShell) shellLook(m); }; VAN_LINES.onShell();
