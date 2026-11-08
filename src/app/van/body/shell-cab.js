        // ---- mobile home van (xe nhà di động): cabin lái + thân ở + cửa lùa MỞ + nội thất ----
        //      (xám tối caravanDark + khung ghế chairFrame: bảng chung core/palette.js · vải ghế, khung gỗ trại: camp/materials.js — tách 01/11)
        const caravanBody = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.5, depthWrite: false }), caravanRoofM = new THREE.MeshLambertMaterial({ color: 0xd8d3c6 }),
          caravanStripe = new THREE.MeshLambertMaterial({ color: 0xc0744a }),
          tyreMat = new THREE.MeshLambertMaterial({ color: 0x2b2925 }), rimMat = new THREE.MeshLambertMaterial({ color: 0xb9b3a6 }),
          awningMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
