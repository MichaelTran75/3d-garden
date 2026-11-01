        // G 24/10: bảng Engineer + bảng Tools gộp thành 1 khung #engPanel có 2 thẻ (Tools · Nhu cầu) — bỏ nút Tools nhỏ ở đầu bảng Engineer (đã có thẻ)
        // ===== TOOLS CỦA ENGINEER (G 20/10 "khi hover vào engineer button, hiện thêm Tools: khi click vào tool thì 1 bảng size giống như danh sách giống
        //  'Engineer nhu cầu': Kính thiên văn, máy cắt cỏ, cần câu cá, drone; và khi click vào thì engineer sẽ thực hiện task đó. vd: click vào kính thiên văn
        //  thì ra nằm ngắm sao"): rê chuột vào nút Engineer ⇒ nút Tools bật lên ngay phía trên (css .tb-eng; màn cảm ứng không rê chuột được: nút Tools nhỏ ở đầu
        //  bảng Engineer). Bảng Tools cùng chỗ, cùng cỡ bảng Engineer (mở bảng này thì đóng bảng kia; nút Engineer sáng như đang chọn), mỗi dòng
        //  1 dụng cụ: việc sẽ làm, hoặc lý do chưa làm được (ngủ, mưa, gió, trời chưa tối / nhiều mây, đang làm việc vừa gọi) — làm mới mỗi giây. Bấm dòng ⇒
        //  ENGINEER.ask(k) (mặt kỹ sư → engForceAct, engineer/mind/schedule.js) như bấm dụng cụ trong cảnh (ui/xray-lifecycle.js): kỹ sư bỏ việc đang làm, làm việc đó, xong thì về lịch; camera theo kỹ sư.
        //  Kính thiên văn ⇒ 'stars': lấy thảm + kính trong xe, dựng kính, nằm ngắm tới khi trời đổi / sắp giờ ngủ / đủ ~1 tiếng rồi cất (engineer/tasks/sky-watch.js) ·
        //  cần câu ⇒ 'fish': ra ghế câu bên hồ câu 15 phút · máy cắt cỏ, drone: lý do lấy của bảng dụng cụ (TOOLS).
        //  G 20/10 khuya thêm 3 dòng: "Farming" ⇒ 'garden' (trồng hố trống / nhổ củ chín trồng lại, tưới — engineer/tasks/carrot-garden.js) · Ghế cắm trại ⇒ 'chair'
        //  (đọc sách xen nhấp trà 10 phút) · Lò chiminea ⇒ 'wood' (ôm củi bỏ vào lò — engineer/tasks/tool-jobs.js). Ghế, lò, cần câu bấm được cả trong cảnh (bảng #toolPop) ----
        const TLS = { open: false, built: false, last: 0 };
        const TL_ITEMS = [   // việc · icon Tabler · tên · nút — việc sẽ làm + lý do chưa làm được: kỹ sư tự nói (ENGINEER.offer(k) — engineer/mind/offers.js, 01/11 đợt 10)
          // G 26/10 "trong tools: thêm hái táo; nấu ăn, nướng cá trong lò chiminea, research = use laptop; read books; check engine": thêm 5 dòng (đọc sách = dòng ghế cắm trại,
          //  đổi tên), xếp theo nhóm: ngoài trời → bếp núc → trong xe → máy móc
          ['stars', 'telescope', 'Kính thiên văn', 'Ngắm sao'], ['fish', 'fish-hook', 'Cần câu cá', 'Câu cá'], ['smoke', 'fish', 'Lò nướng CHIMINEA', 'Nướng cá'],
          ['apples', 'apple', 'Hái táo', 'Hái táo'], ['garden', 'carrot', 'Farming', 'Trồng cà rốt'], ['trim', 'lawn-mower', 'Máy cắt cỏ', 'Cắt cỏ'],
          ['cook', 'tools-kitchen-2', 'Nấu ăn', 'Nấu ăn'], ['chair', 'book', 'Đọc sách', 'Đọc sách'], ['research', 'device-laptop', 'Laptop', 'Nghiên cứu'],
          ['drone', 'drone', 'Drone', 'Bay'], ['wood', 'flame', 'Lò CHIMINEA', 'Bỏ củi'], ['engine', 'engine', 'Động cơ xe', 'Kiểm tra máy']
        ].map(([k, ic, n, go]) => ({ k, ic, n, go, ok: () => ENGINEER.offer(k).plan(), why: () => ENGINEER.offer(k).why() }));
        // G 31/10 "add separate line và chia tools theo sessions": 4 nhóm, mỗi nhóm 1 tiêu đề + đường kẻ ngăn (.tl-sec); thứ tự dòng theo nhóm, không theo TL_ITEMS
        const TL_GROUPS = [['Ngoài trời', ['stars', 'fish', 'apples', 'garden']], ['Bếp núc', ['cook', 'smoke', 'wood']], ['Đọc · làm việc', ['chair', 'research']], ['Máy móc', ['trim', 'drone', 'engine']]];
        { const ch = scene.getObjectByName('Ghế cắm trại (Camp Chair)'); hovAdd(ch);   // bấm ghế / lò / cần câu trong cảnh ⇒ bảng #toolPop (ui/xray-lifecycle.js) cùng việc, cùng lý do
          const box = o => { const b = new THREE.Box3().setFromObject(o), m = new THREE.Mesh(new THREE.BoxGeometry(...b.getSize(new THREE.Vector3()).addScalar(0.06).toArray()), new THREE.MeshBasicMaterial({ visible: false }));
            b.getCenter(m.position); m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; scene.add(m); return m; };   // hộp bấm vô hình: lưới ghế / cần câu đã gộp lượt vẽ nằm ở lớp 31, tia bấm (lớp 0) không trúng
          for (const [k, objs, title, vis] of [['chair', [box(ch)], 'Ghế cắm trại'], ['wood', [CHIMINEA.g], 'Lò sưởi CHIMINEA'], ['fish', [box(CAMP.groundRod)], 'Cần câu cá', () => CAMP.groundRod.visible]]) {
            const it = TL_ITEMS.find(i => i.k === k); TOOLS.push({ objs, vis, title, go: '▶ ' + it.go, act: k }); } }   // việc sẽ làm + lý do: ENGINEER.offer(k)
        function toolsBuild() {   // dựng các dòng 1 lần (lần đầu mở bảng)
          const L = document.getElementById('toolsList'); if (!L) return false;
          for (const [title, keys] of TL_GROUPS) {
            const h = document.createElement('div'); h.className = 'ph tl-sec'; h.textContent = title; L.append(h);
            for (const it of keys.map(k => TL_ITEMS.find(i => i.k === k))) {
              const row = it.row = document.createElement('div'); row.className = 'sim-bar sim-cmd tl-row';
              row.innerHTML = `<i class="ti ti-${it.ic}"></i><span class="sim-lab">${it.n}</span><span class="sim-r"></span><span class="tl-msg"></span>`;
              it.r = row.querySelector('.sim-r'); it.m = row.querySelector('.tl-msg'); L.append(row);
              listen(row, 'click', () => { if (it.why()) return; ENGINEER.ask(it.k); camFollow(ENGINEER.object); toolsRender(); });
            }
          }
          listen(document.getElementById('toolsClose'), 'click', () => { toolsShow(false); CAMF.o = null; });
          return true;
        }
        function toolsRender() {
          document.getElementById('toolsDoing').textContent = ENGINEER.needs.doing() + (ENGINEER.asked ? ' · theo lệnh' : '');
          for (const it of TL_ITEMS) {
            const on = ENGINEER.asked === it.k, why = on ? '' : it.why();
            it.r.textContent = on ? 'Đang làm…' : why ? '' : '▶ ' + it.go; it.m.textContent = why || it.ok();
            it.row.classList.toggle('sim-go', on); it.row.classList.toggle('tl-off', !!why);
          }
        }
        function toolsShow(on = !TLS.open) {
          const P = document.getElementById('toolsPanel'); if (!P || (on && !TLS.built && !(TLS.built = toolsBuild()))) return;
          TLS.open = on; P.hidden = !on; document.getElementById('btnTools').classList.toggle('active', on); document.getElementById('btnSim').classList.toggle('tl-on', on);
          if (on) { if (simUI.open) simToggle(false); toolsRender(); camFollow(ENGINEER.object); } engTabs();
        }
        function engTabs() {   // G 24/10 "2 tabs: Tools · Nhu cầu": khung #engPanel hiện khi 1 trong 2 thẻ mở; thẻ đang mở sáng
          const O = document.getElementById('engPanel'); if (!O) return; O.hidden = !(simUI.open || TLS.open);
          for (const [id, on] of [['tabTools', TLS.open], ['tabNeeds', simUI.open]]) { const b = document.getElementById(id); if (b) { b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; } }
        }
        { const b = document.getElementById('tabTools'); if (b) listen(b, 'click', () => toolsShow(true)); }
        { const b = document.getElementById('tabNeeds'); if (b) listen(b, 'click', () => { if (TLS.open) toolsShow(false); simToggle(true); camFollow(ENGINEER.object); }); }
        { const L = document.querySelector('#engPanel .eng-tabs'); if (L) listen(L, 'keydown', e => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault();   // ← → đổi thẻ (bàn phím)
          const toTools = !TLS.open; if (toTools) toolsShow(true); else { toolsShow(false); simToggle(true); } document.getElementById(toTools ? 'tabTools' : 'tabNeeds')?.focus(); }); }
        { const b = document.getElementById('btnTools'); if (b) listen(b, 'click', () => { toolsShow(); if (!TLS.open) CAMF.o = null; }); }
        { const b = document.getElementById('btnSim'); if (b) listen(b, 'click', () => { if (simUI.open) toolsShow(false); }); }   // mở bảng Engineer ⇒ đóng bảng Tools (2 bảng cùng chỗ)
        function toolsTick(t) { if (TLS.open && t - TLS.last >= 1) { TLS.last = t; toolsRender(); } }   // mỗi khung (sổ tick lượt afterRender 2): làm mới 1 lần / giây
        worldTick('afterRender', 2, (dt, t) => toolsTick(t));
