import { StereoEffect } from 'three/addons/effects/StereoEffect.js';
export function cardboardMode(renderer, scene, camera) {
  const effect = new StereoEffect(renderer);
  effect.setEyeSeparation(0.064);
  return {
    enabled: false,
    render() {
      if (this.enabled) effect.render(scene, camera);
      else { renderer.setViewport(0, 0, innerWidth, innerHeight); renderer.render(scene, camera); }
    },
    async enter() {
      this.enabled = true;
      document.body.classList.add('cardboard');
      // Fullscreen e bloqueio são melhorias opcionais; falhas não impedem o estéreo.
      try { await document.documentElement.requestFullscreen?.(); } catch { /* indisponível */ }
      try { await screen.orientation?.lock?.('landscape'); } catch { /* gire o aparelho manualmente */ }
      window.dispatchEvent(new Event('resize'));
    },
    async exit() {
      this.enabled = false;
      document.body.classList.remove('cardboard');
      screen.orientation?.unlock?.();
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      window.dispatchEvent(new Event('resize'));
    },
  };
}
