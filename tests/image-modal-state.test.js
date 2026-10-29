import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ImageModalState} from '../shared/ui/image-modal-state.js';

test('quadro inicial com progresso zero mantém o modal ativo e bloqueia nova ativação',()=>{
 const modal=new ImageModalState();assert.equal(modal.open(),true);
 modal.advance(1000);assert.equal(modal.progress,0);assert.equal(modal.phase,'opening');assert.equal(modal.active,true);
 assert.equal(modal.open(),false);assert.equal(modal.activations,1);
 modal.advance(1016);assert.ok(modal.progress>0);
 for(let t=1032;t<1500;t+=16)modal.advance(t);
 assert.equal(modal.phase,'open');assert.equal(modal.progress,1);
 for(let t=1500;t<8000;t+=16)modal.advance(t);
 assert.equal(modal.phase,'open');assert.equal(modal.activations,1);
});
test('fechamento explícito bloqueia reabertura durante a transição e libera ao terminar',()=>{
 const modal=new ImageModalState();modal.open();for(let t=0;t<=400;t+=20)modal.advance(t);
 assert.equal(modal.close(),true);assert.equal(modal.close(),false);assert.equal(modal.open(),false);
 for(let t=420;t<=900;t+=20)modal.advance(t);
 assert.equal(modal.active,false);assert.equal(modal.progress,0);
 assert.equal(modal.open(),true);assert.equal(modal.activations,2);
 modal.reset();assert.equal(modal.active,false);
});
