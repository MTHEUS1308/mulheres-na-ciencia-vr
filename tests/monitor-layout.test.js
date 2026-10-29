import {test} from 'node:test';
import assert from 'node:assert/strict';
import {monitorLayout} from '../shared/ui/monitor-station.js';

test('compact station keeps screen width and 5% clear edge gaps for 2, 3 and 4 pages',()=>{
 for(const count of [2,3,4]){
  const layout=monitorLayout(count),angles=layout.angles.slice().sort((a,b)=>a-b);
  assert.equal(angles.length,count);assert.equal(layout.width,1.32*1.03);
  assert.ok(Math.abs(angles[0]+angles.at(-1))<1e-12);
  for(let i=1;i<count;i++){
   const half=(angles[i]-angles[i-1])/2;
   const edgeGap=2*layout.radius*Math.sin(half)-layout.width*Math.cos(half);
   assert.ok(Math.abs(edgeGap/layout.width-.05)<1e-12);
   // Neighboring screens have a positive projected angular gap, too.
   assert.ok(angles[i]-angles[i-1]>2*Math.atan(layout.width/(2*layout.radius)));
  }
  assert.ok(layout.step<56*Math.PI/180);
 }
});
