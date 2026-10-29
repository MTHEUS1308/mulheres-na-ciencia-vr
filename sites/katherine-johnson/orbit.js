// Normalized two-body circular orbit. Display time and physical scales are educational.
export const orbitRadius=1.35;
export function circularOrbit(time,{radius=orbitRadius,mu=1,timeScale=.25}={}){
 const omega=Math.sqrt(mu/radius**3),theta=time*timeScale*omega;
 return {x:radius*Math.cos(theta),y:radius*Math.sin(theta),theta,speed:Math.sqrt(mu/radius),period:2*Math.PI/omega};
}
export function launchSample(t){
 if(t<0)return{phase:'idle',height:0,opacity:1,thrust:0};
 if(t<.8)return{phase:'ignition',height:0,opacity:1,thrust:t/.8};
 if(t<4.8){const p=(t-.8)/4;return{phase:'ascent',height:2.4*p*p,opacity:1,thrust:1};}
 if(t<5.5)return{phase:'coast',height:2.4,opacity:1-(t-4.8)/.7,thrust:Math.max(0,1-(t-4.8)/.7)};
 if(t<6.3)return{phase:'reset',height:0,opacity:(t-5.5)/.8,thrust:0};
 return{phase:'idle',height:0,opacity:1,thrust:0};
}
