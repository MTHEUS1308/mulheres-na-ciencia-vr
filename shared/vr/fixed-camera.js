import { PerspectiveCamera } from 'three';
export function fixedCamera() {
  const camera = new PerspectiveCamera(72, 1, 0.08, 40);
  camera.position.set(0, 0, 0);
  camera.rotation.order = 'YXZ';
  camera.focus = 3;
  return camera;
}
