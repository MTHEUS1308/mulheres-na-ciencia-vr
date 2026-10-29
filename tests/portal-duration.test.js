import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DwellSelection} from '../shared/vr/gaze-controls.js';
import {DEFAULT_GAZE_DURATION,PORTAL_GAZE_DURATION,GAZE_DURATION_MS} from '../shared/vr/config.js';
test('all three portal timers take 3000ms, reset on looking away, activate once',()=>{
 assert.equal(PORTAL_GAZE_DURATION,3000);assert.equal(DEFAULT_GAZE_DURATION,1200);assert.equal(GAZE_DURATION_MS,1200);
 for(const id of ['marie-curie','hedy-lamarr','katherine-johnson']){
  let calls=0;const p={userData:{portal:id,dwellDuration:PORTAL_GAZE_DURATION,activate(){calls++;}}},selection=new DwellSelection();
  selection.update(p,0);assert.equal(selection.update(p,1200),.4);assert.equal(selection.update(p,1500),.5);assert.equal(calls,0);assert.ok(selection.update(p,2999)<1);assert.equal(calls,0);
  selection.update(null,2999.5);assert.equal(selection.update(p,3000),0);assert.equal(selection.update(p,4500),.5);assert.ok(selection.update(p,5999)<1);assert.equal(calls,0);assert.equal(selection.update(p,6000),1);assert.equal(calls,1);selection.update(p,14000);assert.equal(calls,1);
 }
});
test('panels, image close, ordinary buttons and lobby return keep 1200ms',()=>{
 for(const role of ['panel-close','image-return','vr-settings','lobby-return','image-hotspot']){
  let calls=0;const selection=new DwellSelection(),target={userData:{uiRole:role,activate(){calls++;}}};if(role==='image-hotspot')target.userData.dwellDuration=GAZE_DURATION_MS;
  selection.update(target,0);assert.ok(selection.update(target,1199)<1);assert.equal(calls,0);assert.equal(selection.update(target,1200),1);assert.equal(calls,1);
 }
});
