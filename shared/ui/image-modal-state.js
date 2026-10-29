// All animation intervals use frame timestamps. open() never samples another clock.
export class ImageModalState {
  constructor(){this.activations=0;this.reset();}
  get active(){return this.phase!=='idle';}
  get expanded(){return this.phase==='opening'||this.phase==='open';}
  open(){
    if(this.active)return false;
    this.phase='opening';this.last=null;this.activations++;return true;
  }
  close(){
    if(!this.expanded)return false;
    this.phase='closing';return true;
  }
  reset(){this.phase='idle';this.progress=0;this.last=null;}
  advance(time){
    if(!this.active)return;
    const dt=this.last===null?0:Math.max(0,Math.min(time-this.last,80));
    this.last=time;
    if(this.phase==='opening'){
      this.progress=Math.min(1,this.progress+dt/320);
      if(this.progress===1)this.phase='open';
    }else if(this.phase==='closing'){
      this.progress=Math.max(0,this.progress-dt/320);
      if(this.progress===0)this.reset();
    }
  }
}
