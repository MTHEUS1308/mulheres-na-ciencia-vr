// Portals deliberately require a longer dwell; every other interaction stays fast.
export const DEFAULT_GAZE_DURATION = 1200;
export const PORTAL_GAZE_DURATION = 3000;
// Compatibility name used by the existing panel, image and gaze components.
export const GAZE_DURATION_MS = DEFAULT_GAZE_DURATION;
export const GAZE_TIME_LABEL = `${DEFAULT_GAZE_DURATION / 1000}`.replace('.', ',') + ' s';
export const PORTAL_GAZE_TIME_LABEL = `${PORTAL_GAZE_DURATION / 1000}`.replace('.', ',') + ' s';
export const DEFAULT_QUALITY = 2;
