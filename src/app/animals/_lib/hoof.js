        // MÓNG CHẺ dùng chung (bò, hươu): 2 móng hình nêm (đế dài hơn vành, mặt trước vát, mũi thon dần về khe chẻ) + 2 móng huyền sau cổ chân, gộp 1 lưới.
        //   o: top/sole = y vành / đế · toe/heel = x mũi / gót ở đế · tToe/tHeel = x mũi / gót ở vành · zc = tâm mỗi móng · out/inn = nửa rộng ra ngoài / vào khe
        //      · tb/tt = độ thon mũi ở đế / vành · dew = [rộng, cao, x, y] móng huyền
        function cloveHoofGeo(o) {
          const claw = (zc) => {
            const g = new THREE.BoxGeometry(1, 1, 1), p = g.attributes.position, sz = Math.sign(zc);
            for (let v = 0; v < p.count; v++) {
              const sx = Math.sign(p.getX(v)), sy = Math.sign(p.getY(v)), out = Math.sign(p.getZ(v)) === sz, top = sy > 0, toe = sx > 0;
              const x = top ? (toe ? o.tToe : o.tHeel) : (toe ? o.toe : o.heel), y = top ? o.top : o.sole;
              const z = zc + (out ? sz * o.out : -sz * o.inn) - (out && toe ? sz * (top ? o.tt : o.tb) : 0);
              p.setXYZ(v, x, y, z);
            }
            g.computeVertexNormals(); return g;
          };
          const dew = (zc) => new THREE.BoxGeometry(o.dew[0], o.dew[1], o.dew[1]).translate(o.dew[2], o.dew[3], zc);
          return mergeGeometries([claw(o.zc), claw(-o.zc), dew(o.zc), dew(-o.zc)], false);
        }
