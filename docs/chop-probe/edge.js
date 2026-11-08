const d = __dbg, T = d.THREE, e = d.engObj, ev = __ev; simSetup();
ev(`(() => { const e = engObj; engForceAct = 'lunch'; engSpawn(e, 'lunch'); const V = e.van; e.seat = null; e.seatCtl = null;
  V.node = 'board'; V.station = 'stove'; V.idx = 0; V.plan = ['stove']; V.recipe = 'udon'; V.T = 900; V.chopped = false; V.st = 'boardFace'; V.k = 0;
  e.g.position.set(VN.board.x, VAN_FLOOR - ENG_FEET, VN.board.z); e.g.rotation.set(0, VY.pz, 0); if (e.pose) { e.pose.rawPos.copy(e.g.position); e.pose.pos.copy(e.g.position); e.pose.rawYaw = e.pose.yaw = VY.pz; e.pose.pv = [0, 0, 0]; e.pose.yv = 0; } })()`);
const blade = e.props.knife.children[1], KP = ev('VAN_FLOOR') !== undefined ? d.caravanObj.userData.interior.kitchen.pot.parent : null, C = ev('VKIT.CUT'), lo = [], dirs = [];
runFor(20, 12.6, () => { const V = e.van; if (!V || V.st !== 'chop' || V.k < 1) return; d.scene.updateMatrixWorld(true);
  const a = new T.Vector3(0, -0.03, -0.1).applyMatrix4(blade.matrixWorld), b = new T.Vector3(0, -0.03, 0.1).applyMatrix4(blade.matrixWorld); KP.worldToLocal(a); KP.worldToLocal(b);
  lo.push(Math.min(a.y, b.y) - C.y); dirs.push([b.x - a.x, b.y - a.y, b.z - a.z]); });
const s = [...lo].sort((x, y) => x - y); return { edgeAboveBoard_cm_local: { min: +(s[0] * 100).toFixed(1), p50: +(s[s.length >> 1] * 100).toFixed(1), max: +(s[s.length - 1] * 100).toFixed(1) }, dirSample: dirs[5].map(v => +v.toFixed(3)) };
