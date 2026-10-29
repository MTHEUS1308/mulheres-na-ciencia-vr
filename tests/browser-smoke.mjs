// Current smoke entry: all four environments in one renderer/session.
// Full gaze, image, fullscreen and repeated resource validation:
// node tests/lobby-session-review.mjs
process.argv.push('--all');
await import('./lobby-progress-review.mjs');
