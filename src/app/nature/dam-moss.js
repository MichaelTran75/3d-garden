        // ===== RÊU ĐẬP THUỶ ĐIỆN (G 31/10 tối "sao a ko thấy rêu mới trên building bao gồm cả đập nước vậy?" → "em đừng làm rêu trên bề mặt đường của đập
        //  nước, chỉ thay rêu cũ thành rêu mới của đập nước"). Đập dùng chung concreteMat với nhà ⇒ đập có bản sao riêng (userData.sfOldMo): rêu đúng vị trí rêu
        //  tường cũ 23/10 trên mặt đứng bê tông thân đập (core/surface-style.js sfOldMo), vẽ bằng rêu mới (màu thảm rêu, đệm, gồ) + lá rêu (nature/moss-lawn.js,
        //  cờ 16 + loại, không mọc dưới mặt nước). concreteDark (mặt đường đỉnh, dốc lên đập, nhà van, tường hướng dòng) giữ nguyên: không rêu ----
        const damMoss = (() => {
          const g = scene.getObjectByName('Trạm thủy điện (Hydro Dam)'); if (!g) return null;
          const m = surfaceStyle(concreteMat.clone(), 'concrete'); m.userData.sfOldMo = true;
          m.userData.sfWater = [g.position.z, resTopY, lakeY];   // trục đập · mặt hồ chứa (phía −z) · mặt nước hạ lưu (phía +z): lá rêu không mọc dưới nước
          let n = 0; g.traverse(o => { if (o.isMesh && o.material === concreteMat) { o.material = m; n++; } });
          return { mat: m, meshes: n };
        })();
