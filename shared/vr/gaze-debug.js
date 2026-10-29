// Temporary, opt-in development diagnostics. Silent in production and normal use.
export function gazeDebug(event, detail = {}) {
  if (!import.meta.env?.DEV || !globalThis.__VR_GAZE_DEBUG__) return;
  const entry = {event, time:performance.now(), ...detail};
  (globalThis.__VR_GAZE_TRACE__ ??= []).push(entry);
  console.debug('[VR gaze]', JSON.stringify(entry));
}
export function gazeTarget(target) {
  return target ? {target:target.uuid ?? null, role:target.userData?.uiRole ?? null, image:target.userData?.imageId ?? null} : {target:null};
}
