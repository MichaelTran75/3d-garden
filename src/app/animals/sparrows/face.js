        // ==== MẶT CÔNG KHAI CỦA CHIM SẺ (core/world.js): worldSee('sparrows') ----
        worldFace('sparrows', {
          all: () => [songbird, ...flock.birds, ...nestPairs.flat(), ...sparrowGang.birds],   // mọi con { root, state } — đọc, không ghi
        });
