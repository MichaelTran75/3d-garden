        // ==== MẶT CÔNG KHAI CỦA HƯƠU (core/world.js): worldSee('deer') ----
        worldFace('deer', {
          get object() { return stag ? stag.g : null; },               // thân hươu đực (Object3D) | null khi chưa dựng
        });
