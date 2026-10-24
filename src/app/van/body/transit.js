        // ==== FORD TRANSIT L3H2 (Mk8, 2014+) làm nhà di động — vỏ thân, cabin lái, bánh xe dựng hoàn toàn bằng code (G 17/10) ====
        // Số đo lấy từ GLB "Ford Transit L2H2" (geyges, Sketchfab Standard — CHỈ ĐO, không nhúng lưới): bắn tia quanh mẫu lấy mặt cắt thân, biên dạng
        // mũi xe theo từng mức cao, kính chắn gió, kính cửa cabin, hốc bánh, mui cao H2. Đổi đơn vị: 1,1 đv/m (kỹ sư 1,95 đv kể cả mũ ≈ người 1,75 m),
        // GLB (x ngang, y cao, z dọc tới) → xe: X = 0,0272 − 1,1·z, Y = 0,1128 + 1,1·y (+ nâng mui 6 cm để khoang cao 1,88 m đúng H2), Z = 1,1·x.
        // Thân L3 = L2 + 0,45 m chèn giữa cửa lùa và hốc bánh sau ⇒ dài 5,98 m · cơ sở 3,77 m · rộng thân 2,06 m · cao ~2,7 m (lốp AT, nâng gầm 7 cm).
        // Khung xe (đv): mũi xe ở −x, cửa lùa ở +z (tay lái nghịch kiểu Úc: vô-lăng bên phải = −z), mặt sàn khoang y = 0,83.
        const TR = { yIn: 0.83, xP: -0.58, xF: -2.12, xR: 2.03, wr: 0.44, wz: 0.955, front: -3.264, rear: 3.05, rc: 0.12, sill: 0.608, T: 0.035,
          door: [-0.55, 0.83, 0.83, 2.72], archR: 0.535, archY: 0.52, inW: 0.98, ceil: 2.90 };
        const TR_SEC = [[0.608, 1.018], [0.718, 1.06], [1.015, 1.063], [1.30, 1.065], [1.543, 1.065], [1.631, 1.044], [1.72, 1.034], [1.763, 1.030], [2.093, 1.022],
          [2.319, 1.007], [2.572, 1.001], [2.697, 0.985], [2.813, 0.949]];   // y → nửa bề ngang vỏ khoang (gờ vai ở 1,54–1,63; trên vai hơi khum vào)
        const TR_ROOF = [[-1.513, 2.431], [-1.458, 2.487], [-1.348, 2.579], [-1.238, 2.665], [-1.128, 2.733], [-1.018, 2.786], [-0.908, 2.827], [-0.798, 2.858],
          [-0.578, 2.899], [-0.358, 2.921], [-0.028, 2.931], [0.52, 2.95], [1.6, 2.957], [3.1, 2.957]];   // x → đỉnh mui giữa: từ mép trên kính chắn gió lên mui cao
        const TR_DROP = [[0, 0], [0.33, 0.0123], [0.55, 0.0341], [0.715, 0.0576], [0.825, 0.08], [0.902, 0.106], [0.949, 0.143]];   // mui khum + bo góc: z → độ hạ
        const trLerp = (tab, t) => { if (t <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (t <= tab[i][0]) { const [a, va] = tab[i - 1], [b, vb] = tab[i]; return va + (vb - va) * (t - a) / (b - a); } return tab[tab.length - 1][1]; };
        const trSS = (a, b, t) => { const k = Math.max(0, Math.min(1, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
        const trS = x => 0.5 + 0.5 * trSS(-1.513, -0.9, x);                  // mui trên cabin bo góc nửa mức mui khoang
        const trRoofY = x => trLerp(TR_ROOF, x), trTop = x => trRoofY(x) - 0.143 * trS(x);   // trTop: mép trên vách hông (chân góc bo mui)
        const trSideZ = (x, y) => { const yt = trTop(x); return trLerp(TR_SEC, y) + (0.949 - trLerp(TR_SEC, yt)) * trSS(yt - 0.3, yt, y); };   // khung cửa cabin khum vào dưới mui
        const trArchFront = y => TR.xF - Math.sqrt(Math.max(0, TR.archR ** 2 - (y - TR.archY) ** 2));
        // ---- LÒNG KHOANG THEO VỎ GLB (đo transit.bin 19/10: mặt trong lớp 'paintIn', x −0,4 … 2,8, bỏ hốc bánh): vách đứng ±0,92 tới y 2,3 rồi khum vào,
        //      trần giữa 2,857 — hẹp + thấp hơn vỏ dựng bằng code (TR.inW 0,98 · TR.ceil 2,90) ⇒ nội thất dựng theo số cũ thò ra ngoài vỏ 5–13 cm
        //      (G 19/10 "organise nội thất xe van cho đúng tỷ lệ"). w: nửa bề ngang dùng cho đồ nội thất (cách mặt vỏ ~2 cm) ----
        const TR_IN = { w: 0.9, wall: [[0.83, 0.935], [2.0, 0.915], [2.3, 0.893], [2.5, 0.876], [2.6, 0.861], [2.7, 0.835], [2.77, 0.8]],
          ceil: [[0, 2.857], [0.35, 2.841], [0.5, 2.84], [0.6, 2.814], [0.75, 2.798], [0.8, 2.768], [0.85, 2.582], [0.9, 2.305]] };
        const trInW = y => trLerp(TR_IN.wall, y), trInCeil = z => trLerp(TR_IN.ceil, Math.abs(z));   // nửa bề ngang lòng xe ở độ cao y · trần lòng xe ở |z|
        const trXh = z => -1.513 + 0.10 * (z / 0.949) ** 2;                   // mép trên kính chắn gió cong lùi ra 2 bên
        const TR_ROOF_X = [-1.30, -1.20, -1.10, -1.0, -0.9, -0.8, -0.6, -0.35, 0.0, 0.5, 1.0, 1.6, 2.2, 2.93];
        // MŨI XE ĐO DÀY từ GLB (Transit bản nâng cấp 2019+: ga-lăng bát giác đen viền mạ + logo bầu dục, đèn pha mảnh vuốt ngược có viền LED, cản trên sơn
        //  màu thân, cản dưới đen, đèn sương mù chữ nhật trong hốc đen, 2 hốc gió trên ca-pô — G 18/10 "đầu xe giống glb 100%"): mỗi hàng = đường đồng mức
        //  mặt trước ở độ cao yg (m GLB), tia toả vào trục (0, yg, zc) theo K + 1 góc 0 → 90° (thẳng mũi → hông); r = khoảng cách trục → mặt vỏ (mm);
        //  c = vật liệu ở TÂM từng ô (b vỏ sơn · k nhựa đen · c mạ · l kính đèn · L bóng đèn · u logo · w kính). Đổi sang đv: X = 0,0272 − 1,1·z, Y = 0,1128 + 1,1·y, Z = 1,1·x
        const TR_MUI = { K: 24, yg: [0.4, 0.425, 0.45, 0.475, 0.5, 0.525, 0.55, 0.575, 0.6, 0.625, 0.65, 0.675, 0.7, 0.725, 0.75, 0.775, 0.8, 0.825, 0.85, 0.875, 0.9, 0.925, 0.95, 0.975, 1, 1.025, 1.05, 1.075, 1.1, 1.125, 1.15, 1.175, 1.2, 1.225, 1.25, 1.275, 1.3, 1.325, 1.35, 1.375, 1.39], zc: [2.4374, 2.4353, 2.4318, 2.4269, 2.4207, 2.4131, 2.4039, 2.3931, 2.3806, 2.3663, 2.3498, 2.331, 2.3094, 2.2846, 2.2558, 2.2216, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.2002, 2.0611, 2.0611],
          r: '431 432 435 439 446 455 467 481 549 518 624 653 683 720 763 800 845 867 888 905 919 927 931 933 940|523 523 497 443 450 459 470 484 501 521 637 665 697 735 775 813 853 875 895 913 927 934 937 939 946|529 529 532 448 455 464 475 489 505 621 551 681 712 743 788 830 862 884 903 922 936 940 943 947 954|536 537 540 454 460 469 481 495 512 621 558 698 730 766 804 848 860 874 896 919 936 947 948 953 959|545 546 549 462 468 477 488 502 520 540 566 714 740 780 820 850 862 888 908 928 939 954 952 949 967|555 556 559 565 572 583 597 613 643 664 689 715 762 796 837 853 872 882 898 930 946 960 959 959 971|581 582 586 591 599 611 625 642 671 694 719 746 777 813 849 857 875 872 889 918 953 966 966 964 976|595 596 599 605 614 625 639 657 687 710 735 763 795 831 854 864 881 873 898 927 960 972 971 969 981|611 612 615 621 630 641 656 675 704 728 752 781 814 851 860 877 895 917 939 950 965 977 976 973 986|628 629 632 638 647 659 674 693 723 746 771 801 833 862 880 898 912 928 948 965 978 983 980 977 991|646 647 650 657 666 678 694 721 743 766 792 821 852 872 897 922 940 958 971 979 985 988 984 981 994|650 650 654 660 669 681 697 716 749 779 807 837 869 887 913 937 954 970 982 989 992 992 988 985 998|638 639 643 649 657 668 683 700 715 731 808 843 877 887 916 943 965 982 993 997 999 996 992 989 1001|613 496 500 505 513 523 536 552 707 762 809 841 875 891 920 948 966 978 987 991 994 996 996 993 1004|640 526 529 535 543 677 568 585 735 789 808 842 879 899 928 954 971 976 978 979 979 984 997 719 1007|716 716 719 726 736 749 765 770 769 823 843 872 903 927 952 973 983 980 974 970 968 978 992 1005 1011|733 733 736 743 753 767 783 800 814 844 866 895 923 946 969 985 994 986 979 974 971 979 992 1002 1014|689 670 674 681 692 726 723 745 789 843 866 893 924 944 966 982 991 984 978 974 969 977 988 997 1016|686 583 586 593 602 726 629 648 787 805 863 892 920 943 962 979 989 983 977 973 964 972 983 992 1006|684 583 587 593 602 614 630 649 785 804 861 889 910 943 965 977 986 982 977 971 961 956 975 986 1001|746 738 721 731 741 754 771 790 801 824 862 887 903 931 955 976 990 982 975 970 961 951 960 979 994|740 742 748 718 728 742 759 778 798 819 861 878 897 920 944 965 980 978 975 969 960 951 945 971 987|736 737 742 697 603 615 630 649 776 796 857 872 878 889 917 954 969 972 971 966 960 950 944 954 978|732 735 725 676 603 616 631 650 673 792 849 863 851 881 910 933 949 956 968 964 959 950 944 942 964|706 706 710 716 722 735 750 768 791 798 844 851 843 874 902 926 943 950 954 951 959 949 943 942 947|698 699 702 708 718 731 746 764 784 815 838 838 836 866 895 919 936 946 950 948 944 948 942 941 944|688 646 639 666 604 616 700 651 674 808 828 827 829 859 888 912 930 940 947 945 946 947 941 940 944|668 641 634 595 604 617 702 651 674 798 815 810 818 849 881 905 924 936 943 943 943 946 940 940 944|689 689 693 699 706 717 730 748 770 792 800 805 798 833 862 891 916 931 940 940 940 945 940 940 944|678 677 680 685 693 703 718 736 759 778 782 790 803 816 843 873 898 917 933 937 938 943 937 937 942|657 657 659 664 671 682 695 713 734 757 765 771 785 807 826 855 881 901 922 928 932 928 933 931 935|629 628 631 636 643 653 666 683 703 728 745 749 758 784 812 842 865 889 912 921 925 928 930 927 928|580 579 582 586 592 601 612 626 644 666 689 713 726 741 780 820 852 881 902 914 920 925 927 924 925|529 529 530 534 539 546 556 568 584 603 626 650 675 696 714 750 807 860 888 907 919 921 917 922 923|465 464 466 469 466 473 483 494 508 527 548 573 599 628 660 680 712 770 846 888 908 917 908 919 921|398 397 398 401 406 390 399 409 422 437 456 478 505 536 566 602 644 671 730 811 877 901 911 915 919|325 325 326 328 331 336 330 317 326 336 342 358 378 402 433 466 521 599 640 688 773 850 893 910 916|253 252 253 255 257 261 267 272 264 258 268 281 297 316 339 367 403 448 505 599 649 740 824 879 911|181 181 181 182 184 187 191 196 202 210 219 229 241 256 274 296 322 354 395 448 519 615 686 802 867|177 177 177 178 180 183 187 192 198 205 214 224 237 252 271 294 319 347 384 430 492 574 833 894 914|151 151 151 152 154 157 160 165 170 176 184 193 204 216 232 251 275 303 339 385 443 515 613 859 904',
          c: 'kkkkkkkkkkkkkkbbbbbbbbbb|kkkkkkkkkkkkkbbbbbbbbbbb|kkkkkkkkkkkkkbbbbbbbbbbb|kkkkkkkkkkkkkbbbkkkkbbbb|kkkkkkkkkkkkbbbbkkkkbbbb|bbbbbbbbbbbbbbbkkllkbbbb|bbbbbbbbbbbbbbbkkllkbbbk|bbbbbbbbbbbbbbbkkllkbbbk|bbbbbbbbbbbbbbbkkkkkbbbk|bbbbbbbbbbbbbbbbbbbbbbbk|bbbbbbbbbbbbbbbbbbbbbbbk|cccccccccbbbbbbbbbbbbbbk|kkkkkkkkccbbbbbbbbbbbbbk|kkkkkkkkkcbbbbbbbbbbbbbk|kkkkkkkkkcbbbbbbbbbbbbbk|kkkkkkkkkcbbbbbbbbbbbbbk|kkkkkkkkkcbbbbbbbbbbbbbk|kkkkkkkkkcbbbbbbbbbbbbbb|kkkkkkkkkcbbbbbbbbbbbbbb|kkkkkkkkkcbbbbbbbbbbbbbb|uukkkkkkkkbbbbbbbbbbbbbb|cukkkkkkkkbbbkbbbbbbbbbb|cukkkkkkkcbbllllbbbbbbbb|kkkkkkkkkcbblllllllkbbbb|kkkkkkkkkcbbllllllllbbbb|kkkkkkkkkcbbllllllllbbbb|kkkkkkkkccbbllllllllbbbb|cccccccccbbbllllllllbbbb|bbcbbbbbbbbbllllllllkbbb|bbbbbbbbbbbbbblllllllbbb|bbbbbbbbbbbbbbbblllllbbb|bbbbbbbbbbbbbbbbbblllkbb|bbbbbbbbbbbbbbbbbbblllbb|bbbbbbbbbbbbbbbbbbbbbkbb|bbbbbbbbbbbbbbbbbbbbbbbb|bbbbbbbbbbbbbbbbbbbbbbbb|bbbbbbbkkkkkkkkkkkbbbbbb|bbbbbbbbkkkkkkkkkkkkbbbb|bbbbbbbbbbbbbbbbbbbbbkbb|kkkkkkkkkkkkkkkkkkkwwwbb' };
        const trNoseEnd = y => y < 0.98 ? trArchFront(y) : y < 1.62 ? -2.393 : -2.24;
        const TR_NR = (() => {   // → [{ Y, P: [[Z, X] × (K + 1)] }] nửa +z, từ giữa ra hông
          const K = TR_MUI.K, R = TR_MUI.r.split('|').map(s => s.split(' ').map(Number)), C = TR_MUI.c.split('|');
          // lưới MỞ (khe ga-lăng, hốc gió cản dưới): tia lọt khe chạm nền phía sau ⇒ lấy mặt trước nhất trong lân cận 3×3 (mặt các nan)
          const F = R.map((row, i) => row.map((r, k) => { if (C[Math.min(i, C.length - 1)][Math.min(k, K - 1)] !== 'k' || k > 13) return r; let m = r; for (let di = -1; di <= 1; di++) for (let dk = -1; dk <= 1; dk++) { const q = R[i + di] && R[i + di][k + dk]; if (q > m) m = q; } return m; }));
          return F.map((row, i) => ({ Y: 0.1128 + 1.1 * TR_MUI.yg[i], ax: 0.0272 - 1.1 * TR_MUI.zc[i], P: row.map((r, k) => { const f = k / K * Math.PI / 2; return [1.1 * Math.sin(f) * r / 1000, 0.0272 - 1.1 * (TR_MUI.zc[i] + Math.cos(f) * r / 1000)]; }) }));
        })();
        // kính chắn gió + trụ A: hàng Y → X tại z = 0 · 0,33 · 0,55 · 0,715 · 0,825 · 0,902, cột cuối = trụ A (mép trước vách hông)
        const TR_WS = [[[-2.393, -2.385, -2.339, -2.304, -2.275, -2.258], 1.642, [-2.24, 1.642]], [[-2.137, -2.117, -2.086, -2.054, -2.025, -2.005], 1.873, [-1.98, 1.873]],
          [[-1.88, -1.861, -1.834, -1.804, -1.778, -1.758], 2.093, [-1.735, 2.093]], [[-1.57, -1.555, -1.53, -1.505, -1.48, -1.46], [2.36, 2.36, 2.355, 2.35, 2.34, 2.33], [-1.44, 2.33]]];
        const TR_WZ = [0, 0.33, 0.55, 0.715, 0.825, 0.902];
        const trNoseX = (z, y) => {   // X mặt trước mũi xe tại (|z|, y) — nội suy lưới đo (gắn đèn, logo, biển số đúng mặt cong)
          z = Math.abs(z); const at = P => { for (let i = 1; i < P.length; i++) if (z <= P[i][0]) { const [z0, x0] = P[i - 1], [z1, x1] = P[i]; return x0 + (x1 - x0) * (z - z0) / Math.max(1e-6, z1 - z0); } return P[P.length - 1][1]; };
          for (let i = 1; i < TR_NR.length; i++) if (y <= TR_NR[i].Y) { const a = TR_NR[i - 1], b = TR_NR[i], k = Math.max(0, (y - a.Y) / (b.Y - a.Y)); return at(a.P) * (1 - k) + at(b.P) * k; }
          return at(TR_NR[TR_NR.length - 1].P);
        };
        TR_WS[0][0] = TR_WZ.map((z, i) => Math.min(trNoseX(z, 1.642), -2.25 - 0.002 * (6 - i)));   // hàng chân kính chắn gió = hàng đo trên cùng của mũi (khép đường nối)

        function transitBody(g) {
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z), V2 = (x, y) => new THREE.Vector2(x, y), lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }), two = { side: THREE.DoubleSide };
          const M = { body: lam(0xE2D6C0, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }), glass: lam(0x8fc1e3, { transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }),
            frost: lam(0xdfe9ec, { transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }), black: lam(0x3a3f41, two), grille: lam(0x24292b, two), lamp: lam(0xdde4e6, two),
            chrome: lam(0xc9cdd0, two), red: lam(0xb8322a, two), amber: lam(0xe39a32, two), mirror: lam(0xb3ccd0), blue: lam(0x1f3f7a, two), dark: lam(0x4a5052), led: new THREE.MeshBasicMaterial({ color: 0xf2f6ff, side: THREE.DoubleSide }), blackD: lam(0x2c3133, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }), lampD: lam(0x59636b, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }) };
          const shell = new THREE.Group(); shell.name = 'Vỏ Ford Transit L3H2'; shell.userData.xray = 'shell'; g.add(shell);
          const T = TR.T, IN = V3(0.4, 1.6, 0), seam = [];
          const triGeo = (p, n) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); if (n) geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); else geo.computeVertexNormals(); geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(p.length / 3 * 2), 2)); return geo; };
          const mesh = (geo, mat, name, outline = false, par = shell) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.castShadow = mat !== M.glass && mat !== M.frost; m.receiveShadow = true; if (outline) edge(m, geo, lineDark); par.add(m); return m; };
          const box = (name, w, h, d, x, y, z, mat, out = false, par = shell) => { const m = bx(w, h, d, mat, true, out, lineDark); m.name = name; m.position.set(x, y, z); par.add(m); return m; };
          const bar = (name, a, b, t, mat, round = false, par = shell) => { const v = new THREE.Vector3().subVectors(b, a), len = v.length(); const m = round ? cyl(t, t, len, mat, true, false, null, 8) : bx(t, len, t, mat, true, false);
            m.quaternion.setFromUnitVectors(V3(0, 1, 0), v.normalize()); m.position.copy(a).add(b).multiplyScalar(0.5); m.name = name; par.add(m); return m; };
          const loop = (name, pts, t, mat, closed = true) => { for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) { const q = pts[(i + 1) % pts.length]; if (q.distanceTo(pts[i]) > 0.004) bar(name, pts[i], q, t, mat); } };
          const outward = (p, n) => (n.x * (p.x - IN.x) + n.y * (p.y - IN.y) + n.z * (p.z - IN.z) < 0 ? -1 : 1);
          // lớp trong của vỏ (tôn 2 lớp như vỏ cabin cũ: đậm hơn dù vật liệu bán trong suốt): lùi T theo pháp tuyến, hướng vào lòng xe
          const insetGeo = geo => { const p = geo.attributes.position, n = geo.attributes.normal, q = new Float32Array(p.count * 3), a = V3(), b = V3();
            for (let i = 0; i < p.count; i++) { a.fromBufferAttribute(p, i); b.fromBufferAttribute(n, i); a.addScaledVector(b, -T * outward(a, b)); a.toArray(q, i * 3); }
            return triGeo(q, Array.from(n.array)); };
          // lưới hàng × cột → mỗi vật liệu 1 hình (pháp tuyến mịn tính trên cả lưới); key(r, c) = tên vật liệu của ô, null = bỏ ô
          function gridMeshes(P, key, name, inner = true) {
            const R = P.length, C = P[0].length, pos = new Float32Array(R * C * 3), idx = [];
            P.forEach((row, r) => row.forEach((p, c) => p.toArray(pos, (r * C + c) * 3)));
            for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) if (key(r, c)) { const a = r * C + c, b = a + C; idx.push(a, b, a + 1, a + 1, b, b + 1); }
            const full = new THREE.BufferGeometry(); full.setAttribute('position', new THREE.BufferAttribute(pos, 3)); full.setIndex(idx); full.computeVertexNormals();
            const N = full.attributes.normal.array, out = {};
            for (let r = 0; r < R - 1; r++) for (let c = 0; c < C - 1; c++) { const k = key(r, c); if (!k) continue; const o = out[k] || (out[k] = { p: [], n: [] }), a = r * C + c, b = a + C;
              for (const v of [a, b, a + 1, a + 1, b, b + 1]) { o.p.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); o.n.push(N[v * 3], N[v * 3 + 1], N[v * 3 + 2]); } }
            full.dispose();
            for (const k in out) { const geo = triGeo(out[k].p, out[k].n); mesh(geo, M[k], name, k === 'body' || k === 'black'); if (inner && k === 'body') mesh(insetGeo(geo), M[k], name); }
          }
          const full = (half, mk) => [...half.slice(1).reverse().map(p => mk(p, -1)), ...half.map(p => mk(p, 1))];   // nửa phải (z ≥ 0, từ giữa ra) → cả bề ngang

          // ===== MŨI XE theo lưới đo GLB (TR_MUI): vật liệu từng ô đúng mẫu — cản dưới + hốc đèn sương mù đen, cản trên sơn, ga-lăng đen viền mạ, đèn pha,
          //       2 hốc gió ca-pô, hốc gạt mưa đen. Cột cuối = mép vách hông (khép với vách) =====
          const nK = TR_MUI.K, NCL = TR_MUI.c.split('|');
          const noseRows = TR_NR.map(({ Y, P }) => { const xe = trNoseEnd(Y); return full(P.map(([z, x], k) => k === nK ? [trSideZ(xe, Y), xe] : [z, x]), ([z, x], s) => V3(x, Y, s * z)); });
          gridMeshes(noseRows, () => 'body', 'Mũi xe');   // lưới nền chỉ màu vỏ — vùng đen / kính đèn dán bám mặt bằng đề can mép trơn (dưới, sau OCT)
          // ===== KÍNH CHẮN GIÓ + TRỤ A + mép trên kính (hàng cuối = mặt cắt đầu tiên của mui) =====
          const roofSec = (x, z) => trRoofY(x) - trLerp(TR_DROP, Math.abs(z)) * trS(x), RZ = [...TR_WZ, 0.949];
          const wsRows = [...TR_WS.map(([xs, ys, end]) => full([...TR_WZ.map((z, i) => [z, xs[i], Array.isArray(ys) ? ys[i] : ys]), [trSideZ(end[0], end[1]), end[0], end[1]]], ([z, x, y], s) => V3(x, y, s * z))),
            full(RZ.map(z => [z, trXh(z), roofSec(trXh(z), z)]), ([z, x, y], s) => V3(x, y, s * z))];
          const WC = RZ.length, wKey = (r, c) => { const h = Math.abs(c - (WC - 1) + 0.5) - 0.5; return r < 3 && h < 4 ? 'glass' : 'body'; };
          gridMeshes(wsRows, wKey, 'Kính chắn gió & trụ A');
          // ===== MUI CAO H2: khum ngang, bo góc 2 bên; từ mép kính chắn gió lên mui khoang rồi phẳng ra tới đuôi =====
          const roofRows = [wsRows[wsRows.length - 1], ...TR_ROOF_X.map(x => full(RZ.map(z => [z, roofSec(x, z)]), ([z, y], s) => V3(x, y, s * z)))];
          gridMeshes(roofRows, () => 'body', 'Mui cao');
          // gân dọc mui (tôn mui H2 có gân chạy dọc) — trên đoạn mui phẳng
          for (const z of [-0.6, -0.3, 0.3, 0.6]) box('Gân mui', 2.3, 0.014, 0.05, 1.7, roofSec(1.7, z) + 0.006, z, M.body);

          // ===== VÁCH HÔNG (mỗi bên 1 tấm): viền theo mũi/trụ A/mui/đuôi, khoét hốc bánh, kính cửa cabin, cửa lùa (+z), cửa sổ nhà xe =====
          //  Tấm phẳng (x, y) chia tam giác có điểm lưới phụ (Steiner) rồi uốn theo mặt cắt thân z = trSideZ(x, y) ⇒ giữ được gờ vai và khum trên
          const arc = (cx, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + TR.archR * Math.cos(a), TR.archY + TR.archR * Math.sin(a)]; });
          const aS = Math.asin((TR.sill - TR.archY) / TR.archR), aP0 = Math.atan2(0.98 - TR.archY, -2.393 - TR.xF);
          const SY = TR_SEC.map(p => p[0]), xhE = trXh(0.949);
          // (2 hốc bánh: đi từ sau ra trước theo đáy vách ⇒ cung hốc sau quét π − aS → aS ngược chiều kim đồng hồ khi nhìn từ +z)
          const archRear = arc(TR.xR, Math.PI - aS, aS, 14), archFront = arc(TR.xF, aS, aP0, 12);
          const CONT = [[-2.393, 0.98], ...[1.0, 1.15, 1.3, 1.45, 1.543, 1.598].map(y => [-2.393, y]), [-2.24, 1.642], [-1.98, 1.873], [-1.735, 2.093], [-1.44, 2.33],
            [xhE, trTop(xhE)], ...TR_ROOF_X.map(x => [x, trTop(x)]), ...SY.slice(0, -1).reverse().map(y => [2.93, y]),
            ...archRear.slice().reverse(), ...archFront.slice(0, -1)];
          const DOOR_GLASS = [[-0.935, 2.26], [-0.941, 1.73], [-1.073, 1.642], [-1.293, 1.565], [-1.513, 1.521], [-1.733, 1.488], [-1.854, 1.499], [-1.862, 1.93], [-1.685, 2.093], [-1.535, 2.215], [-1.45, 2.285], [-1.02, 2.295]];
          const rr = (x0, y0, x1, y1, r = 0.06) => { const p = []; for (const [cx, cy, a0] of [[x1 - r, y0 + r, -Math.PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, Math.PI / 2], [x0 + r, y0 + r, Math.PI]]) for (let k = 0; k <= 3; k++) { const a = a0 + k * Math.PI / 6; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
          const WIN = { 1: [rr(2.42, 2.04, 2.82, 2.44)], [-1]: [rr(-0.30, 1.86, 1.22, 2.46), rr(1.52, 1.98, 2.16, 2.46)] };   // cửa sổ nhà xe: +z phòng tắm (kính mờ) · −z trên giường, trên bàn học
          const DOOR = TR.door, doorHole = [[DOOR[0], DOOR[2]], [DOOR[1], DOOR[2]], [DOOR[1], DOOR[3]], [DOOR[0], DOOR[3]]];
          const inPoly = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
          const segD = (x, y, P) => { let d = 9; for (let i = 0; i < P.length; i++) { const [ax, ay] = P[i], [bx2, by] = P[(i + 1) % P.length], vx = bx2 - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1))); d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t)); } return d; };
          const sideRefs = {};
          for (const s of [1, -1]) {
            const holes = [DOOR_GLASS, ...WIN[s], ...(s > 0 ? [doorHole] : [])], steiner = [];
            const YS = [0.66, 0.718, 0.85, 1.0, 1.15, 1.3, 1.45, 1.543, 1.587, 1.631, 1.70, 1.763, 1.9, 2.093, 2.2, 2.319, 2.45, 2.572, 2.697, 2.765];
            for (let x = -2.33; x < 2.92; x += 0.16) for (const y of YS) if (inPoly(x, y, CONT) && !holes.some(h => inPoly(x, y, h)) && segD(x, y, CONT) > 0.035 && holes.every(h => segD(x, y, h) > 0.035)) steiner.push([x, y]);
            const flat = [CONT, ...holes, ...steiner.map(p => [p])], faces = THREE.ShapeUtils.triangulateShape(CONT.map(p => V2(...p)), [...holes, ...steiner.map(p => [p])].map(h => h.map(p => V2(...p))));
            const P2 = flat.flat(), pos = [], idx = [];
            for (const [x, y] of P2) pos.push(x, y, s * trSideZ(x, y));
            for (const f of faces) idx.push(...f);
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
            geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(P2.length * 2), 2));
            mesh(geo, M.body, s > 0 ? 'Vách hông bên cửa lùa' : 'Vách hông bên tài', true);
            const ig = insetGeo(geo.toNonIndexed()); mesh(ig, M.body, 'Lớp trong vách hông');
            // gờ dày quanh ô kính, cửa, hốc bánh (nối lớp ngoài với lớp trong)
            const N = geo.attributes.normal, PA = geo.attributes.position, rim = [], a = V3(), n = V3();
            const inner = i => { a.fromBufferAttribute(PA, i); n.fromBufferAttribute(N, i); return a.clone().addScaledVector(n, -T * outward(a, n)); };
            const ring = (i0, len, closed) => { for (let k = 0; k < len - (closed ? 0 : 1); k++) { const i = i0 + k, j = i0 + (k + 1) % len, A = V3().fromBufferAttribute(PA, i), B = V3().fromBufferAttribute(PA, j), Ai = inner(i), Bi = inner(j); rim.push(...A.toArray(), ...B.toArray(), ...Bi.toArray(), ...A.toArray(), ...Bi.toArray(), ...Ai.toArray()); } };
            let o = CONT.length; for (const h of holes) { ring(o, h.length, true); o += h.length; }
            const bot = CONT.length - archRear.length - archFront.length + 1; ring(bot - 1, CONT.length - bot + 1, false);   // đáy vách + 2 hốc bánh
            mesh(triGeo(rim), M.body, 'Gờ vách hông');
            sideRefs[s] = { holes };
            // kính: cửa cabin (kính thường) · cửa sổ nhà xe (kính + viền cao su đen); lùi vào 1,2 cm
            const pane = (P, mat, name, frame) => { const sg = new THREE.ShapeGeometry(new THREE.Shape(P.map(p => V2(...p))), 6), q = sg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, s * (trSideZ(q.getX(i), q.getY(i)) - 0.012)); sg.computeVertexNormals(); mesh(sg, mat, name);
              if (frame) loop('Viền cao su cửa sổ', P.map(([x, y]) => V3(x, y, s * (trSideZ(x, y) + 0.004))), 0.03, M.black); };
            pane(DOOR_GLASS, M.glass, 'Kính cửa cabin', true);
            WIN[s].forEach((P, i) => pane(P, s > 0 && i === 0 ? M.frost : M.glass, 'Cửa sổ nhà xe', true));
            // ron cửa: cửa cabin (trước/sau/dưới), gân vai dọc thân
            const on = (x, y) => [x, y, s * (trSideZ(x, y) + 0.003)], ln = pts => { for (let i = 0; i < pts.length - 1; i++) seam.push(...pts[i], ...pts[i + 1]); };
            ln([0.98, 1.2, 1.5, 1.7].map(y => on(-2.03, y)).concat([on(-1.88, 1.92), on(-1.70, 2.11), on(-1.52, 2.36)]));
            ln([0.62, 1.0, 1.5, 2.0, 2.4].map(y => on(-0.70, y)).concat([on(-0.70, 2.62)])); ln([on(-2.03, 0.98), on(-1.59, 0.98)]); ln([on(-1.59, 0.62), on(-0.70, 0.62)]);
            ln([-2.3, -1.6, -0.9, -0.55].map(x => on(x, 1.587))); ln([0.83, 1.5, 2.2, 2.93].map(x => on(x, 1.587)));
            if (s < 0) ln([-0.55, 0.2, 0.83].map(x => on(x, 1.587)));
            // ốp nhựa đen chân thân (xe Transit bản thường): dải giữa 2 hốc bánh + sau hốc sau; bên cửa lùa chừa ô cửa (tấm cửa mang dải riêng)
            const band = (x0, x1, y0, y1, name) => { const g2 = new THREE.PlaneGeometry(x1 - x0, y1 - y0, Math.max(1, Math.round((x1 - x0) / 0.3)), 3); g2.translate((x0 + x1) / 2, (y0 + y1) / 2, 0); const r2 = g2.attributes.position;
              for (let i = 0; i < r2.count; i++) r2.setZ(i, s * (trSideZ(r2.getX(i), r2.getY(i)) + 0.014)); g2.computeVertexNormals(); mesh(g2, M.black, name, true); };
            const xa = TR.xF + Math.sqrt(TR.archR ** 2 - (TR.sill - TR.archY) ** 2), xb = TR.xR - Math.sqrt(TR.archR ** 2 - (TR.sill - TR.archY) ** 2), xc = TR.xR + (TR.xR - xb);
            if (s > 0) { band(xa, DOOR[0], TR.sill, 0.95, 'Ốp chân thân'); band(DOOR[0], DOOR[1], TR.sill, DOOR[2] - 0.005, 'Ốp chân thân'); band(DOOR[1], xb, TR.sill, 0.95, 'Ốp chân thân'); }
            else band(xa, xb, TR.sill, 0.95, 'Ốp chân thân');
            band(xc, 2.93, TR.sill, 1.0, 'Ốp góc đuôi');
            // ốp vòm bánh (nhựa đen) theo cung hốc, nổi 2 cm
            for (const [cx, a1] of [[TR.xF, aP0], [TR.xR, Math.PI - aS]]) { const rg = new THREE.RingGeometry(TR.archR, TR.archR + 0.075, 22, 1, aS, a1 - aS); rg.translate(cx, TR.archY, 0); const r2 = rg.attributes.position;
              for (let i = 0; i < r2.count; i++) r2.setZ(i, s * (trSideZ(r2.getX(i), Math.max(TR.sill, r2.getY(i))) + 0.02)); rg.computeVertexNormals(); mesh(rg, M.black, 'Ốp vòm bánh', true); }
            // gương chiếu hậu lớn kiểu xe tải (gắn góc trước cửa cabin): chân + hộp gương + mặt gương quay về sau; tay nắm cửa cabin
            const mz = s * 1.30, base = V3(-1.84, 1.56, s * (trSideZ(-1.84, 1.56) + 0.01));
            box('Chân gương', 0.12, 0.06, 0.16, -1.86, 1.56, s * 1.13, M.black); bar('Tay gương', base, V3(-1.9, 1.62, mz - s * 0.12), 0.035, M.black, true);
            const hg = box('Hộp gương chiếu hậu', 0.11, 0.40, 0.26, -1.92, 1.72, mz, M.black, true); hg.rotation.y = s * 0.12;
            const mg = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.34), M.mirror); mg.rotation.y = Math.PI / 2 + s * 0.12; mg.position.set(-1.862, 1.72, mz); mg.name = 'Mặt gương'; shell.add(mg);
            box('Tay nắm cửa cabin', 0.17, 0.045, 0.03, -1.05, 1.62, s * (trSideZ(-1.05, 1.62) + 0.016), M.black);
          }
          // ===== ĐUÔI XE: góc bo đứng (r 12 cm) + mép mui sau bo tròn → mặt sau phẳng có 2 cánh cửa mở (kính mờ phòng tắm), đèn hậu đứng ở 2 góc =====
          const SEC_HALF = [...SY.map(y => [trLerp(TR_SEC, y), y]), ...[0.902, 0.825, 0.715, 0.55, 0.33].map(z => [z, roofSec(2.93, z)]), [0, roofSec(2.93, 0)]];   // từ đáy vách +z lên, qua mui tới giữa
          const SEC = [...SEC_HALF, ...SEC_HALF.slice(0, -1).reverse().map(([z, y]) => [-z, y])];
          const SN = SEC.map((p, i) => { const a = SEC[Math.max(0, i - 1)], b = SEC[Math.min(SEC.length - 1, i + 1)]; let nz = b[1] - a[1], ny = -(b[0] - a[0]); const l = Math.hypot(nz, ny) || 1; nz /= l; ny /= l; if (nz * p[0] + ny * (p[1] - 1.6) < 0) { nz = -nz; ny = -ny; } return [nz, ny]; });
          const capRows = []; for (let j = 0; j <= 5; j++) { const f = j / 5 * Math.PI / 2, d = TR.rc * (1 - Math.cos(f)), x = 2.93 + TR.rc * Math.sin(f); capRows.push(SEC.map(([z, y], i) => V3(x, y - SN[i][1] * d, z - SN[i][0] * d))); }
          const nS = SY.length, L = SEC.length, cKey = (r, c) => {   // ô ở góc đứng: chân đen · đèn hậu đỏ / hổ phách / đỏ (bọc góc) · còn lại vỏ
            if (c >= nS - 1 && c < L - nS) return 'body'; const y = (SEC[c][1] + SEC[c + 1][1]) / 2; return y < 1.015 ? 'black' : y < 1.30 ? 'red' : y < 1.543 ? 'amber' : y < 1.72 ? 'red' : 'body'; };
          gridMeshes(capRows, cKey, 'Góc bo đuôi xe');
          const back = capRows[capRows.length - 1].map(p => [p.z, p.y]);   // viền mặt sau (z, y)
          const RW = [rr(0.14, 2.06, 0.62, 2.52), rr(-0.62, 2.06, -0.14, 2.52)];   // kính mờ 2 cánh cửa sau
          {
            const faces = THREE.ShapeUtils.triangulateShape(back.map(p => V2(...p)), RW.map(h => h.map(p => V2(...p)))), P2 = [...back, ...RW.flat()], p = [];
            for (const f of faces) for (const v of f) p.push(TR.rear, P2[v][1], P2[v][0]);
            const geo = triGeo(p); mesh(geo, M.body, 'Mặt sau (2 cánh cửa)', true);
            const q = p.slice(); for (let i = 0; i < q.length; i += 3) q[i] -= T; mesh(triGeo(q), M.body, 'Lớp trong cửa sau');
            for (const h of RW) { const sg = new THREE.ShapeGeometry(new THREE.Shape(h.map(([z, y]) => V2(z, y))), 4); sg.rotateY(-Math.PI / 2); sg.translate(TR.rear + 0.006, 0, 0); mesh(sg, M.frost, 'Kính mờ cửa sau'); loop('Viền kính cửa sau', h.map(([z, y]) => V3(TR.rear + 0.01, y, z)), 0.028, M.black); }
            const lnB = pts => { for (let i = 0; i < pts.length - 1; i++) seam.push(...pts[i], ...pts[i + 1]); };
            lnB([[TR.rear + 0.003, 0.64, 0], [TR.rear + 0.003, 2.86, 0]]);
            for (const s of [-1, 1]) {
              lnB([[TR.rear + 0.003, 0.64, s * 0.86], [TR.rear + 0.003, 2.80, s * 0.86]]);
              for (const [y0, y1, mat] of [[1.015, 1.30, M.red], [1.30, 1.543, M.amber], [1.543, 1.72, M.red]]) box('Đèn hậu', 0.02, y1 - y0 - 0.008, 0.12, TR.rear + 0.008, (y0 + y1) / 2, s * 0.88, mat);
              box('Phản quang sau', 0.015, 0.04, 0.14, TR.rear + 0.006, 0.80, s * 0.84, M.red);
            }
            box('Tay nắm cửa sau', 0.04, 0.05, 0.2, TR.rear + 0.02, 1.62, 0.13, M.black);
            box('Đèn phanh trên cao', 0.04, 0.05, 0.36, TR.rear + 0.015, 2.86, 0, M.red);
            // cản sau đen có bậc giẫm giữa
            box('Cản sau', 0.27, 0.22, 1.98, TR.rear + 0.12, 0.56, 0, M.black, true);
            box('Bậc giẫm cản sau', 0.2, 0.02, 0.8, TR.rear + 0.15, 0.68, 0, M.dark);
          }
          // ===== CHI TIẾT ĐẦU XE theo GLB: viền mạ bát giác ga-lăng · 4 nan ngang · logo bầu dục · đèn pha: viền LED chữ Γ (mép trong + mép trên) + 2 thấu kính ·
          //       dải LED đèn sương mù · 2 nan hốc cản dưới · biển số "Jade" trên cản sơn · gạt mưa =====
          const OCT = [[0, 0.681], [0.318, 0.681], [0.397, 0.69], [0.442, 0.709], [0.476, 0.755], [0.51, 0.838], [0.536, 0.913], [0.536, 0.954], [0.51, 0.997], [0.479, 1.043], [0.446, 1.08], [0.406, 1.109], [0.132, 1.113], [0, 1.113]];   // GLB (x, y) viền mạ, nửa phải
          const onNose = (xg, yg, d = 0.012) => { const Y = 0.1128 + 1.1 * yg, Z = 1.1 * xg; return V3(trNoseX(Z, Y) - d, Y, Z); };
          const octHalf = y => { const S2 = OCT.slice(1, 13); for (let i = 1; i < S2.length; i++) if (y <= S2[i][1]) { const [x0, y0] = S2[i - 1], [x1, y1] = S2[i]; return x0 + (x1 - x0) * (y - y0) / (y1 - y0); } return 0.406; };
          loop('Viền mạ ga-lăng', [...OCT.map(([x, y]) => onNose(x, y)), ...OCT.slice(1, -1).reverse().map(([x, y]) => onNose(-x, y))], 0.03, M.chrome);
          for (const yg of [0.775, 0.85, 1.0, 1.06]) { const hw = octHalf(yg) - 0.025; loop('Nan ga-lăng', [-1, -0.5, 0, 0.5, 1].map(f => onNose(f * hw, yg, 0.006)), 0.02, M.dark, false); }
          for (const yg of [0.44, 0.485]) loop('Nan hốc cản dưới', [-1, -0.5, 0, 0.5, 1].map(f => onNose(f * 0.4, yg, 0.006)), 0.018, M.dark, false);
          const lp = onNose(0, 0.945, 0.022), logo = new THREE.Mesh(new THREE.CircleGeometry(0.13, 24), M.blue); logo.scale.set(1, 0.4, 1); logo.rotation.y = -Math.PI / 2; logo.position.copy(lp); logo.name = 'Logo bầu dục'; shell.add(logo);
          const lr = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.009, 4, 28), M.chrome); lr.scale.set(1, 0.4, 1); lr.rotation.y = Math.PI / 2; lr.position.copy(lp); shell.add(lr);
          // ===== MẢNG VẬT LIỆU MŨI XE dán bám mặt (đề can): biên từng vùng trên bản đồ vật liệu đo (ô 24 × 40) → dò mép ô → làm trơn Chaikin ×3 → chia tam giác →
          //       đặt lên mặt lưới mũi, đẩy ra vài mm theo pháp tuyến ⇒ mép cản dưới, hốc đèn sương mù, kính đèn pha, hốc gió ca-pô, hốc gạt mưa trơn (không răng cưa ô);
          //       ga-lăng = đúng viền bát giác đo trên GLB (OCT) =====
          const nR = TR_NR.length, NP = TR_NR.map(({ Y, P }) => { const xe = trNoseEnd(Y); return P.map(([z, x], k) => k === nK ? [trSideZ(xe, Y), xe] : [z, x]); });
          const surf = (u, v) => {   // u: −K…K (cột, âm = nửa −z) · v: 0…số hàng − 1 → điểm trên lưới mũi (nội suy song tuyến)
            const s = u < 0 ? -1 : 1, a = Math.min(nK - 1e-6, Math.abs(u)), i = Math.min(nR - 2, Math.max(0, Math.floor(v))), fv = Math.min(1, Math.max(0, v - i)), k = Math.floor(a), fu = a - k, A = NP[i], B = NP[i + 1];
            const L2 = j => (A[k][j] * (1 - fu) + A[k + 1][j] * fu) * (1 - fv) + (B[k][j] * (1 - fu) + B[k + 1][j] * fu) * fv;
            return V3(L2(1), TR_NR[i].Y + (TR_NR[i + 1].Y - TR_NR[i].Y) * fv, s * L2(0)); };
          const surfN = (u, v, d) => { const e = 0.05, p = surf(u, v), n = new THREE.Vector3().crossVectors(surf(u + e, v).sub(surf(u - e, v)), surf(u, v + e).sub(surf(u, v - e))).normalize(); if (n.dot(p.clone().sub(V3(-2.0, 1.2, 0))) < 0) n.negate(); return p.addScaledVector(n, d); };
          const toUV = (xg, yg) => {   // (x, y) GLB → (u, v) tham số lưới (ngược surf — cho viền ga-lăng đo)
            const Y = 0.1128 + 1.1 * yg, Z = 1.1 * Math.abs(xg); let i = 0; while (i < nR - 2 && TR_NR[i + 1].Y < Y) i++; const fv = Math.max(0, Math.min(1, (Y - TR_NR[i].Y) / (TR_NR[i + 1].Y - TR_NR[i].Y)));
            const zAt = k => NP[i][k][0] * (1 - fv) + NP[i + 1][k][0] * fv; let k = 0; while (k < nK - 1 && zAt(k + 1) < Z) k++; return [(xg < 0 ? -1 : 1) * (k + Math.max(0, Math.min(1, (Z - zAt(k)) / Math.max(1e-6, zAt(k + 1) - zAt(k))))), i + fv]; };
          const OCTUV = [...OCT.map(([x, y]) => toUV(x, y)), ...OCT.slice(1, -1).reverse().map(([x, y]) => toUV(-x, y))];
          const inPolyUV = (u, v, P) => { let c = false; for (let a = 0, b = P.length - 1; a < P.length; b = a++) { const [ua, va] = P[a], [ub, vb] = P[b]; if ((va > v) !== (vb > v) && u < (ub - ua) * (v - va) / (vb - va) + ua) c = !c; } return c; };
          const CG = (r, c) => r < 0 || r >= nR - 1 || c < -nK || c >= nK ? '.' : NCL[r][c >= 0 ? c : -c - 1];   // ô (hàng r, cột c −K…K−1)
          function regions(test) {   // vùng ô thoả test → vòng kín (u, v) đã làm trơn; vùng ở bên trái ⇒ vòng ngoài ngược kim (A > 0), lỗ thuận kim
            const nx = new Map(), key = (u, v) => u + ',' + v, loops = [];
            for (let r = 0; r < nR - 1; r++) for (let c = -nK; c < nK; c++) { if (!test(CG(r, c), r, c)) continue;
              for (const [dr, dc, a, b] of [[-1, 0, [c, r], [c + 1, r]], [0, 1, [c + 1, r], [c + 1, r + 1]], [1, 0, [c + 1, r + 1], [c, r + 1]], [0, -1, [c, r + 1], [c, r]]])
                if (!test(CG(r + dr, c + dc), r + dr, c + dc)) { const k = key(...a); (nx.get(k) || nx.set(k, []).get(k)).push(b); } }
            for (const [k0, outs] of nx) while (outs.length) {
              const L = [k0.split(',').map(Number)]; let cur = outs.pop();
              for (let g2 = 0; g2 < 4000; g2++) { const kk = key(...cur); if (kk === k0) break; L.push(cur); const o = nx.get(kk); if (!o || !o.length) break; cur = o.pop(); }
              let P2 = L.filter((p, i) => { const a = L[(i - 1 + L.length) % L.length], b = L[(i + 1) % L.length]; return (p[0] - a[0]) * (b[1] - p[1]) !== (p[1] - a[1]) * (b[0] - p[0]); });   // bỏ điểm thẳng hàng
              for (let it = 0; it < 3; it++) P2 = P2.flatMap((p, i) => { const q = P2[(i + 1) % P2.length]; return [[0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]], [0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]]; });
              let A = 0; for (let i = 0; i < P2.length; i++) { const p = P2[i], q = P2[(i + 1) % P2.length]; A += p[0] * q[1] - q[0] * p[1]; }
              if (Math.abs(A) > 2.4 && P2.length > 3) loops.push({ P: P2, A }); }   // bỏ vùng < 1,2 ô (nhiễu)
            return loops;
          }
          function decal(loops, mat, d, name) {   // vòng ngoài + lỗ nằm trong → tam giác dán lên mặt mũi, cách d theo pháp tuyến
            const holes = loops.filter(l => l.A < 0), p = [];
            for (const o of loops) { if (o.A < 0) continue; const hs = holes.filter(h => inPolyUV(h.P[0][0], h.P[0][1], o.P)).map(h => h.P), all = [o.P, ...hs].flat().map(([u, v]) => surfN(u, v, d));
              for (const f of THREE.ShapeUtils.triangulateShape(o.P.map(q => V2(...q)), hs.map(h => h.map(q => V2(...q))))) for (const i of f) p.push(all[i].x, all[i].y, all[i].z); }
            if (p.length) mesh(triGeo(p), mat, name, true);
          }
          decal(regions((x, r, c) => x === 'k' && !inPolyUV(c + 0.5, r + 0.5, OCTUV)), M.blackD, 0.004, 'Nhựa đen mũi xe');
          decal([{ P: OCTUV, A: 1 }], M.blackD, 0.005, 'Ga-lăng bát giác');
          const lamps = regions(x => x === 'l' || x === 'L'); decal(lamps, M.lampD, 0.007, 'Kính đèn pha + sương mù');
          for (const l of lamps) if (l.A > 0) loop('Viền LED đèn', l.P.filter((_, i) => i % 3 === 0).map(([u, v]) => surfN(u, v, 0.011)), 0.012, M.led);
          // 2 thấu kính tròn trong mỗi đèn pha (hàng giữa vùng kính đèn)
          const lampRows = []; NCL.forEach((row, r) => { if (r < 16) return; const ks = [...row].map((c, k) => c === 'l' ? k : -1).filter(k => k >= 0); if (ks.length) lampRows.push([r, ks[0], ks[ks.length - 1]]); });
          if (lampRows.length) for (const s of [1, -1]) { const mid = lampRows[Math.floor(lampRows.length * 0.45)];
            for (const dk of [1.6, 4.4]) { const u = s * (mid[1] + dk), c = surfN(u, mid[0] + 0.5, 0.009), n = surfN(u, mid[0] + 0.5, 0.05).sub(c).normalize();
              const pj = new THREE.Mesh(new THREE.CircleGeometry(0.036, 16), M.chrome); pj.position.copy(c); pj.lookAt(c.clone().add(n)); pj.name = 'Thấu kính đèn pha'; shell.add(pj); } }
          const pc = document.createElement('canvas'); pc.width = 256; pc.height = 128; const pk = pc.getContext('2d');
          pk.fillStyle = '#e4dbc5'; pk.fillRect(0, 0, 256, 128); pk.strokeStyle = '#243240'; pk.lineWidth = 6; pk.strokeRect(6, 6, 244, 116);
          pk.font = '700 84px Arial, sans-serif'; pk.textAlign = 'center'; pk.textBaseline = 'middle'; pk.fillStyle = '#243240'; pk.fillText('Jade', 128, 68);
          const plateTex = new THREE.CanvasTexture(pc); plateTex.colorSpace = THREE.SRGBColorSpace; const plateM = new THREE.MeshLambertMaterial({ map: plateTex });
          const plates = new THREE.Group(); plates.name = 'Biển số · Jade'; plates.userData.xray = 'shell'; plates.userData.noBake = true; g.add(plates);   // nhóm riêng (không gộp): còn lại khi vỏ GLB thay vỏ code, biển sau dời được
          for (const [p, ry] of [[onNose(0, 0.6, 0.014), -Math.PI / 2], [V3(TR.rear + 0.012, 0.86, 0), Math.PI / 2]]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.40, 0.2), plateM); pl.rotation.y = ry; pl.position.copy(p); pl.name = 'Biển số · Jade'; plates.add(pl); }
          for (const z0 of [0.06, -0.78]) bar('Cần gạt mưa', V3(-2.37, 1.66, z0), V3(-2.12, 1.86, z0 + 0.66), 0.016, M.black);
          // đường ron: viền ca-pô · ray cửa lùa (lộ sau cửa đã mở)
          const hood = [[0, 1.122], [0.4, 1.122], [0.55, 1.15], [0.7, 1.2], [0.82, 1.25], [0.9, 1.3], [0.92, 1.37]].map(([x, y]) => onNose(x, y, -0.003));   // mép ca-pô: trên viền ga-lăng, vòng qua đỉnh đèn pha
          for (let i = 0; i < hood.length - 1; i++) for (const s of [-1, 1]) seam.push(hood[i].x, hood[i].y, s * hood[i].z, hood[i + 1].x, hood[i + 1].y, s * hood[i + 1].z);
          box('Ray cửa lùa', 1.9, 0.045, 0.03, (DOOR[1] + 2.75) / 2, 1.80, trSideZ(1.8, 1.80) + 0.012, M.black);
          const seamL = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(seam, 3)), lineDark); seamL.name = 'Ron vỏ xe'; shell.add(seamL);

          // ===== CỬA LÙA (đang mở: trượt về sau ngoài vách, trên 3 ray) có cửa sổ + ốp chân đen + tay nắm =====
          const sd = new THREE.Group(); sd.name = 'Cửa lùa (mở)'; shell.add(sd);
          {
            const L = DOOR[1] - DOOR[0] + 0.06, x0 = DOOR[1] + 0.03, y0 = 0.70, y1 = DOOR[3] + 0.03, off = 0.065, hole = rr(x0 + 0.2, 1.86, x0 + L - 0.28, 2.46);
            const sh = new THREE.Shape([V2(x0, y0), V2(x0 + L, y0), V2(x0 + L, y1), V2(x0, y1)]); sh.holes.push(new THREE.Path(hole.map(p => V2(...p))));
            for (const d of [0, T]) { const sg = new THREE.ShapeGeometry(sh, 4), q = sg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, trSideZ(q.getX(i), q.getY(i)) + off - d); sg.computeVertexNormals(); mesh(sg, M.body, 'Tấm cửa lùa', !d, sd); }
            const pg = new THREE.ShapeGeometry(new THREE.Shape(hole.map(p => V2(...p))), 4), q = pg.attributes.position; for (let i = 0; i < q.count; i++) q.setZ(i, trSideZ(q.getX(i), q.getY(i)) + off - 0.015); pg.computeVertexNormals(); mesh(pg, M.glass, 'Kính cửa lùa', false, sd);
            loop('Viền kính cửa lùa', hole.map(([x, y]) => V3(x, y, trSideZ(x, y) + off + 0.004)), 0.03, M.black);
            const cg = new THREE.PlaneGeometry(L, 0.95 - y0, 4, 2); cg.translate(x0 + L / 2, (y0 + 0.95) / 2, 0); const c2 = cg.attributes.position; for (let i = 0; i < c2.count; i++) c2.setZ(i, trSideZ(c2.getX(i), c2.getY(i)) + off + 0.012); cg.computeVertexNormals(); mesh(cg, M.black, 'Ốp chân cửa lùa', true, sd);
            box('Tay nắm cửa lùa', 0.045, 0.2, 0.03, x0 + 0.08, 1.62, trSideZ(x0, 1.62) + off + 0.02, M.black, false, sd);
            const ky = [0.75, 1.80, 2.70]; for (const y of ky) box('Giá trượt cửa lùa', 0.05, 0.04, off, x0 + 0.04, y, trSideZ(x0, y) + off / 2, M.black, false, sd);
          }
          bakeStatic(shell); shell.userData.noBake = true;   // nét viền vỏ code ở lại TRONG nhóm vỏ: bakeStatic(g) cuối caravan() gộp nét không theo vai trò ⇒ trước đây nét vỏ cũ
          return { shell, M, plates };                           // bị gộp vào nét cả xe, còn hiện sau khi vỏ GLB thay (G 18/10 "remove các line art ko liên quan tới kết cấu xe")
        }

        // ==== CABIN LÁI (tay lái nghịch: vô-lăng −z), 4 BÁNH (lốp AT 31", mâm thép đen) & TỦ BẾP — trả về nhóm tủ bếp (van/interior/kitchen.js dựng mặt bếp lên đó) ====
        function transitCab(parent) {
          const V3 = (x, y, z) => new THREE.Vector3(x, y, z), lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o }), two = { side: THREE.DoubleSide };
          const M = { mat: lam(0x43494b), dash: lam(0x5d6163), dashTop: lam(0x46494b), trim: lam(0x8a8c88), seat: lam(0x6f706c), seatBand: lam(0x55575a), seatDark: lam(0x2e3133),
            screen: lam(0x1d2326), tyre: lam(0x2b2925), tread: lam(0x232120), rim: lam(0x2f3335, two), hub: lam(0x92958e, two), cabinet: lam(0xa58e69), front: lam(0xd0ccc0), matte: lam(0x30383a, two), handle: lam(0x777b7a) };
          const cab = new THREE.Group(); cab.name = 'Cabin lái, bánh xe & tủ bếp'; cab.userData.noBake = true;
          const inner = new THREE.Group(); inner.name = 'Nội thất cabin'; inner.userData.xray = 'keep';
          const dash = new THREE.Group(); dash.name = 'Táp-lô'; dash.userData.xray = 'shell';
          const wheels = new THREE.Group(); wheels.name = 'Bánh xe'; wheels.userData.xray = 'keep';
          cab.add(inner, dash, wheels);
          const box = (par, name, w, h, d, x, y, z, mat, out = false) => { const m = bx(w, h, d, mat, true, out, lineDark); m.name = name; m.position.set(x, y, z); par.add(m); return m; };
          const bar = (par, name, a, b, t, mat, round = false) => { const v = new THREE.Vector3().subVectors(b, a), len = v.length(); const m = round ? cyl(t, t, len, mat, true, false, null, 8) : bx(t, len, t, mat, true, false);
            m.quaternion.setFromUnitVectors(V3(0, 1, 0), v.normalize()); m.position.copy(a).add(b).multiplyScalar(0.5); m.name = name; par.add(m); return m; };
          const shaped = (w, h, d, segs, fn) => { const g = new THREE.BoxGeometry(w, h, d, ...segs), p = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; };
          const Y0 = TR.yIn;
          // sàn cabin: thảm đen trên tấm sàn (tấm sàn khoang ở van/interior/caravan.js)
          box(cab, 'Thảm sàn cabin', 1.62, 0.012, 1.86, -1.43, Y0 + 0.006, 0, M.mat);   // (ngoài nhóm nội thất: còn lại khi cabin GLB thay)
          // táp-lô kiểu Transit 2014+: vách lửa dưới chân kính, mặt trên rộng phẳng, cụm đồng hồ có mái che trước ghế lái, cụm giữa có màn hình + cần số gắn táp-lô
          const prof = [[-2.33, 1.64], [-2.05, 1.715], [-1.93, 1.70], [-1.87, 1.62], [-1.85, 1.44], [-1.93, 1.26], [-2.04, 1.08], [-2.16, Y0], [-2.36, Y0]];
          const dg = new THREE.ExtrudeGeometry(new THREE.Shape(prof.map(([x, y]) => new THREE.Vector2(x, y))), { depth: 1.84, bevelEnabled: false }).translate(0, 0, -0.92);
          const dm = new THREE.Mesh(dg, M.dash); dm.name = 'Táp-lô'; dm.castShadow = dm.receiveShadow = true; edge(dm, dg, lineDark); dash.add(dm);
          box(dash, 'Mặt trên táp-lô', 0.30, 0.012, 1.80, -2.0, 1.712, 0, M.dashTop);
          box(dash, 'Mái che đồng hồ', 0.20, 0.08, 0.44, -1.98, 1.745, -0.48, M.dashTop, true);
          const gc = document.createElement('canvas'); gc.width = 192; gc.height = 64; const gk = gc.getContext('2d'); gk.fillStyle = '#15191b'; gk.fillRect(0, 0, 192, 64);
          for (const cx of [48, 144]) { gk.strokeStyle = '#d9dee0'; gk.lineWidth = 3; gk.beginPath(); gk.arc(cx, 34, 24, Math.PI * 0.8, Math.PI * 2.2); gk.stroke(); gk.strokeStyle = '#e5533b'; gk.beginPath(); gk.moveTo(cx, 34); gk.lineTo(cx + 18, 22); gk.stroke(); }
          const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace;
          const gauge = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.12), new THREE.MeshLambertMaterial({ map: gt })); gauge.rotation.y = Math.PI / 2; gauge.rotation.z = 0.25; gauge.position.set(-1.92, 1.66, -0.48); gauge.name = 'Cụm đồng hồ'; dash.add(gauge);
          box(dash, 'Màn hình giữa', 0.012, 0.13, 0.22, -1.862, 1.55, 0.0, M.screen);
          for (const z of [-0.85, -0.16, 0.16, 0.85]) box(dash, 'Cửa gió', 0.02, 0.07, 0.13, -1.875, 1.64, z, M.seatDark);
          bar(inner, 'Cần số trên táp-lô', V3(-1.86, 1.40, -0.2), V3(-1.76, 1.47, -0.2), 0.015, M.trim, true);
          const knob = sph(0.032, M.seatDark, true, false); knob.position.set(-1.755, 1.475, -0.2); inner.add(knob);
          // vô-lăng 3 chấu (bên phải xe = −z), cột lái nghiêng ~25°
          const hubP = V3(-1.70, 1.56, -0.48), colDir = V3(Math.sin(1.08), Math.cos(1.08), 0);
          bar(inner, 'Cột lái', hubP.clone().addScaledVector(colDir, -0.30), hubP.clone().addScaledVector(colDir, -0.02), 0.03, M.seatDark, true);
          const wheel = new THREE.Group(); wheel.name = 'Vô-lăng'; wheel.position.copy(hubP); wheel.quaternion.setFromUnitVectors(V3(0, 0, 1), colDir); inner.add(wheel);
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.019, 6, 18), M.seatDark); ring.castShadow = true; wheel.add(ring);
          for (const t of [0, Math.PI, -Math.PI / 2]) bar(wheel, 'Chấu vô-lăng', V3(0, 0, 0.005), V3(Math.cos(t) * 0.18, Math.sin(t) * 0.18, 0), 0.03, M.seatDark);
          const cap = cyl(0.06, 0.06, 0.04, M.seatDark, true, true, lineDark, 12); cap.rotation.x = Math.PI / 2; wheel.add(cap);
          for (const [z, l] of [[-0.36, 0.08], [-0.50, 0.07], [-0.62, 0.07]]) { const pad = box(inner, 'Bàn đạp', l, 0.015, 0.06, -2.1, 0.97, z, M.seatDark); pad.rotation.z = -1.0; }
          box(inner, 'Gương chiếu hậu trong', 0.03, 0.06, 0.24, -1.60, 2.28, 0, M.seatDark);
          for (const s of [-1, 1]) { const v = box(inner, 'Tấm che nắng', 0.24, 0.018, 0.40, -1.52, 2.31, s * 0.45, M.trim); v.rotation.z = 0.2; }
          // 2 ghế đơn xoay (captain chair): đệm bo mép trước, tựa lưng ngả, gối đầu, đế xoay, tay vịn trong
          const cushion = shaped(0.52, 0.13, 0.52, [6, 2, 6], v => { if (v.x < -0.18 && v.y > 0) v.y -= (v.x + 0.18) * (v.x + 0.18) * 1.5; const k = Math.max(0, v.y) / 0.065; v.y -= 0.02 * k * Math.max(0, 1 - (v.z / 0.2) ** 2); });
          const backG = shaped(0.12, 0.66, 0.52, [2, 6, 6], v => { if (v.x < 0) v.x += 0.03 * Math.max(0, 1 - (v.z / 0.2) ** 2); if (v.y > 0.2) v.z *= 1 - (v.y - 0.2) * 0.12; });
          for (const s of [-1, 1]) {
            const zc = s * 0.46, sg = new THREE.Group(); sg.name = s < 0 ? 'Ghế lái' : 'Ghế phụ'; sg.position.set(-1.12, Y0, zc); inner.add(sg);
            box(sg, 'Đế xoay ghế', 0.34, 0.26, 0.34, 0, 0.13, 0, M.seatDark);
            const cu = new THREE.Mesh(cushion, M.seat); cu.position.set(0.0, 0.40, 0); cu.castShadow = true; edge(cu, cushion, lineDark); cu.name = 'Đệm ghế'; sg.add(cu);
            const bk = new THREE.Mesh(backG, M.seat); bk.position.set(0.30, 0.78, 0); bk.rotation.z = 0.24; bk.castShadow = true; edge(bk, backG, lineDark); bk.name = 'Tựa lưng'; sg.add(bk);
            box(sg, 'Gối đầu', 0.10, 0.18, 0.30, 0.40, 1.22, 0, M.seat, true).rotation.z = 0.24;
            box(sg, 'Đai tựa lưng', 0.125, 0.06, 0.53, 0.2, 0.55, 0, M.seatBand).rotation.z = 0.24;
            box(sg, 'Tay vịn ghế', 0.40, 0.05, 0.06, 0.02, 0.62, -s * 0.29, M.seatDark);
          }
          // ===== BÁNH: lốp AT tiện theo biên dạng (vai vuông) + 2 hàng gai so le · mâm thép đen 16" có lòng chảo, 6 ốc, nắp trục =====
          const lathe = (pts, n = 30) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(...p)), n);
          const R = TR.wr, tyreGeo = lathe([[0.23, -0.13], [0.33, -0.134], [0.405, -0.128], [0.43, -0.11], [R - 0.012, -0.09], [R - 0.012, 0.09], [0.43, 0.11], [0.405, 0.128], [0.33, 0.134], [0.23, 0.13]]);
          const rimGeo = lathe([[0.232, 0.118], [0.222, 0.124], [0.205, 0.112], [0.175, 0.085]]), dishGeo = lathe([[0.175, 0.085], [0.11, 0.09]]), capGeo = lathe([[0.11, 0.09], [0.07, 0.115], [0, 0.118]], 16);
          for (const g of [tyreGeo, rimGeo, dishGeo, capGeo]) g.rotateX(Math.PI / 2);
          const lug = new THREE.BoxGeometry(0.075, 0.024, 0.09), nutGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.02, 6); nutGeo.rotateX(Math.PI / 2);
          const back = new THREE.CircleGeometry(0.232, 24);
          for (const [x, s, nm] of [[TR.xF, 1, 'Bánh trước'], [TR.xF, -1, 'Bánh trước'], [TR.xR, 1, 'Bánh sau'], [TR.xR, -1, 'Bánh sau']]) {
            const w = new THREE.Group(); w.name = nm; w.position.set(x, R, s * TR.wz); if (s < 0) w.rotation.y = Math.PI;
            const t = new THREE.Mesh(tyreGeo, M.tyre); t.castShadow = t.receiveShadow = true; edge(t, tyreGeo, lineDark); w.add(t);
            for (let k = 0; k < 24; k++) for (const side of [-1, 1]) { const a = (k + (side > 0 ? 0.5 : 0)) / 24 * Math.PI * 2, l = new THREE.Mesh(lug, M.tread); l.position.set(Math.cos(a) * (R - 0.004), Math.sin(a) * (R - 0.004), side * 0.05); l.rotation.z = a + Math.PI / 2; w.add(l); }
            for (const [g, m] of [[rimGeo, M.rim], [dishGeo, M.rim], [capGeo, M.hub]]) { const p = new THREE.Mesh(g, m); p.castShadow = true; w.add(p); }
            const bk = new THREE.Mesh(back, M.rim); bk.position.z = -0.12; bk.rotation.y = Math.PI; w.add(bk);
            for (let k = 0; k < 6; k++) { const n = new THREE.Mesh(nutGeo, M.hub); n.position.set(Math.cos(k * Math.PI / 3) * 0.09, Math.sin(k * Math.PI / 3) * 0.09, 0.098); w.add(n); }
            wheels.add(w);
          }
          // ===== TỦ BẾP dọc vách cửa lùa (toạ độ cục bộ như bản cũ: mặt cánh tủ quay về −x, nóc tủ 1,795 ngay dưới mặt đá) =====
          const galley = new THREE.Group(); galley.name = 'Bếp dọc vách cửa hông'; galley.userData.xray = 'keep'; galley.userData.noBake = true;
          galley.rotation.y = -Math.PI / 2;
          const cabinets = new THREE.Group(); cabinets.name = 'Thân tủ & cánh tủ';
          box(cabinets, 'Thân tủ bếp', .51, .725, 1.82, 2.665, 1.4325, 0, M.cabinet, true);
          for (const [name, h, d, y, z] of [['Cánh tủ chậu', .505, .398, 1.3325, -.69], ['Cánh tủ giữa', .65, .68, 1.405, -.11], ['Cửa lò nướng', .5, .52, 1.37, .59], ['Ngăn kéo', .13, .35, 1.685, -.677]])
            box(cabinets, name, .012, h, d, 2.403, y, z, M.front, true);
          box(cabinets, 'Ô kính cửa lò', .006, .2, .34, 2.396, 1.42, .59, M.matte);
          for (const z of [-.53, .19, .8]) box(cabinets, 'Tay nắm tủ', .018, .11, .05, 2.39, 1.42, z, M.mat);
          box(cabinets, 'Khe tách khối bếp', .55, .76, .014, 2.665, 1.45, .263, M.matte);
          for (let i = 0; i < 4; i++) {
            const k = cyl(.027, .027, .03, M.matte, true, false, null, 12); k.rotation.z = Math.PI / 2; k.position.set(2.386, 1.722, .395 + i * .13); cabinets.add(k);
            const rg = cyl(.036, .036, .006, M.mat, false, false, null, 12); rg.rotation.z = Math.PI / 2; rg.position.set(2.398, 1.722, .395 + i * .13); cabinets.add(rg);
          }
          const gasPipe = cyl(.016, .016, .08, M.handle, true, false, null, 8); gasPipe.rotation.x = Math.PI / 2; gasPipe.position.set(2.8, 1.2, .95); gasPipe.name = 'Ống ga'; cabinets.add(gasPipe);
          bakeStatic(cabinets); galley.add(cabinets); cab.add(galley);
          bakeStatic(inner); bakeStatic(dash); bakeStatic(wheels);   // gai lốp 192 mảnh: gộp sẵn theo vật liệu (để bộ gộp lượt vẽ không tách ra)
          parent.add(cab);
          return galley;
        }
