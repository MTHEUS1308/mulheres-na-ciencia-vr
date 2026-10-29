import { GAZE_DURATION_MS } from './config.js';
import { Raycaster, Vector2 } from 'three';
import { gazeDebug, gazeTarget } from './gaze-debug.js';
export class DwellSelection {
  constructor(duration = GAZE_DURATION_MS) { this.duration = duration; this.reset(); }
  reset() { this.target = null; this.since = 0; this.fired = false; }
  update(target, now) {
    if (target !== this.target) {
      if(this.target?.userData.uiRole==='image-hotspot')gazeDebug('gaze-target-left',gazeTarget(this.target));
      this.target = target; this.since = now; this.fired = false;
      if(target?.userData.uiRole==='image-hotspot'){gazeDebug('image-detected',gazeTarget(target));gazeDebug('gaze-start',gazeTarget(target));}
    }
    if (target?.userData.gazeHold || target?.userData.gazeDisabled) return 0;
    const progress = target ? Math.min(Math.max(0,now - this.since) / (target?.userData.dwellDuration ?? this.duration), 1) : 0;
    if (target && progress === 1 && !this.fired) { this.fired = true;
      if(target.userData.uiRole==='image-hotspot'){gazeDebug('gaze-complete',gazeTarget(target));gazeDebug('activation-callback',gazeTarget(target));}
      target.userData.activate(); }
    return progress;
  }
}
export function gazeControls(camera, targets, duration) {
  const raycaster = new Raycaster();
  const selection = new DwellSelection(duration);
  return {
    selection,
    hit(point = new Vector2()) {
      raycaster.setFromCamera(point, camera);
      return raycaster.intersectObjects(targets.filter(t => t.visible && t.parent?.visible), false)[0]?.object ?? null;
    },
    update(now) { return selection.update(this.hit(), now); },
  };
}
