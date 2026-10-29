import * as THREE from 'three';
export function label(text, width = 2.4, height = .55, color = '#e6d5af') {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = Math.round(1024 * height / width);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#29251f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#bda87e'; ctx.lineWidth = 5; ctx.strokeRect(4,4,canvas.width-8,canvas.height-8);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${Math.min(46, canvas.height * .34)}px Georgia`;
  text.split('\n').forEach((line,i,lines) => ctx.fillText(line,512,canvas.height/2+(i-(lines.length-1)/2)*58,950));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
}
export function infoPanel(scene, camera, targets) {
  const group = new THREE.Group(); scene.add(group); group.visible = false;
  let content = null, close = null;
  function clear() {
    for (const mesh of [content,close]) if (mesh) { group.remove(mesh); mesh.geometry.dispose(); mesh.material.map.dispose(); mesh.material.dispose(); const i=targets.indexOf(mesh); if(i>=0) targets.splice(i,1); }
    content = close = null;
  }
  return {
    group,
    close() { group.visible = false; },
    show(title, lines, onClose = () => {}) {
      clear();
      group.position.copy(camera.position).add(new THREE.Vector3(0,0,-2.7).applyQuaternion(camera.quaternion));
      group.quaternion.copy(camera.quaternion);
      content = label(`${title}\n\n${lines.join('\n')}`, 3.3, 1.9); content.position.y = .25; group.add(content);
      close = label('Fechar / interromper', 1.8,.35); close.position.y = -.95;
      close.userData.activate = () => { group.visible = false; onClose(); };
      group.add(close); targets.push(close); group.visible = true;
    },
  };
}
