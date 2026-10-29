import { Euler, Quaternion, Vector3, MathUtils } from 'three';
export function orientationControls(camera, status) {
  let enabled = false, sample = null, offset = 0, needsCenter = true, timer;
  let received = false;
  let yaw = 0, pitch = 0, drag = null;
  const axis = new Vector3(0, 0, 1);
  const correction = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  const raw = new Quaternion(), angles = new Euler(0, 0, 0, 'YXZ');
  function update() {
    if (enabled && sample) {
      const screen = MathUtils.degToRad(window.screen.orientation?.angle ?? window.orientation ?? 0);
      raw.setFromEuler(new Euler(MathUtils.degToRad(sample.beta), MathUtils.degToRad(sample.alpha), -MathUtils.degToRad(sample.gamma), 'YXZ'));
      raw.multiply(correction).multiply(new Quaternion().setFromAxisAngle(axis, -screen));
      if (needsCenter) { angles.setFromQuaternion(raw, 'YXZ'); offset = -angles.y; needsCenter = false; }
      camera.quaternion.copy(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), offset)).multiply(raw);
    } else camera.rotation.set(pitch, yaw, 0, 'YXZ');
    camera.position.set(0, 0, 0);
  }
  window.addEventListener('deviceorientation', event => {
    if (![event.alpha, event.beta, event.gamma].every(Number.isFinite)) return;
    sample = event;
    if (enabled) { clearTimeout(timer); if (!received) { received=true; status('Sensores ativos. Olhe por 2 segundos para selecionar.'); } }
  });
  return {
    update,
    recenter() { yaw = pitch = 0; needsCenter = true; update(); },
    get enabled() { return enabled; },
    async enable() {
      if (!window.isSecureContext) throw new Error('Sensores exigem HTTPS no celular. Toque e arraste continua disponível.');
      if (!window.DeviceOrientationEvent) throw new Error('Este navegador não oferece sensores de orientação.');
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') throw new Error('Permissão dos sensores negada. Você pode usar toque e arraste.');
      }
      enabled = true; needsCenter = true; received=false; sample=null;
      status('Aguardando sensores: mova o celular suavemente.');
      clearTimeout(timer);
      timer = setTimeout(() => { if (!sample) { enabled = false; status('Sem dados dos sensores. Use toque e arraste ou verifique as permissões.'); } }, 4000);
    },
    disable() { enabled = false; clearTimeout(timer); angles.setFromQuaternion(camera.quaternion, 'YXZ'); yaw = angles.y; pitch = angles.x; },
    bind(canvas) {
      canvas.addEventListener('pointerdown', e => { drag = { x:e.clientX, y:e.clientY }; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => {
        if (!drag || enabled) return;
        yaw -= (e.clientX - drag.x) * 0.004;
        pitch = MathUtils.clamp(pitch - (e.clientY - drag.y) * 0.004, -Math.PI/2 + .01, Math.PI/2 - .01);
        drag = { x:e.clientX, y:e.clientY };
      });
      for (const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event, () => { drag = null; });
      canvas.addEventListener('keydown', e => {
        const step = { ArrowLeft:[.08,0], ArrowRight:[-.08,0], ArrowUp:[0,.08], ArrowDown:[0,-.08] }[e.key];
        if (step && !enabled) { e.preventDefault(); yaw += step[0]; pitch = MathUtils.clamp(pitch+step[1], -1.56, 1.56); }
      });
    },
  };
}
