import test from 'node:test';
import assert from 'node:assert/strict';
import {circularOrbit,launchSample} from '../sites/katherine-johnson/orbit.js';
test('circular model preserves radius, returns after a period, and matches v²/r = μ/r²',()=>{
 for(const radius of [.8,1.35,2.4])for(const mu of [.5,1,4]){
  const p=circularOrbit(0,{radius,mu,timeScale:1});
  for(const t of [0,3,27,100]){const q=circularOrbit(t,{radius,mu,timeScale:1});assert.ok(Math.abs(Math.hypot(q.x,q.y)-radius)<1e-12);assert.ok(Math.abs(q.speed**2/radius-mu/radius**2)<1e-12);}
  const end=circularOrbit(p.period,{radius,mu,timeScale:1});assert.ok(Math.hypot(end.x-p.x,end.y-p.y)<1e-12);
 }
});
test('launch ignites, ascends continuously, fades, resets without visible teleport, then restores',()=>{
 assert.equal(launchSample(-1).phase,'idle');assert.equal(launchSample(.4).phase,'ignition');assert.equal(launchSample(2).phase,'ascent');assert.ok(launchSample(4).height>launchSample(2).height);
 assert.ok(Math.abs(launchSample(4.8-1e-7).height-launchSample(4.8).height)<1e-6);
 assert.ok(launchSample(5.5-1e-7).opacity<1e-5);assert.equal(launchSample(5.5).opacity,0);
 assert.deepEqual(launchSample(7),{phase:'idle',height:0,opacity:1,thrust:0});
 for(let t=0;t<8;t+=.01){const p=launchSample(t);assert.ok(p.opacity>=0&&p.opacity<=1);assert.ok(p.thrust>=0&&p.thrust<=1);assert.ok(p.height>=0&&p.height<=2.4);}
});
