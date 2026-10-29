import * as THREE from 'three';
import './style.css';

const canvas = document.querySelector('#scene');
const instructions = document.querySelector('#instructions');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (error) {
  instructions.textContent = 'Não foi possível iniciar o 3D. Use um navegador com WebGL habilitado.';
  document.querySelector('#explore').disabled = true;
  throw error;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b9c6b9');
// O centro da sala é (0, 0, 0); apenas a rotação da câmera muda.
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 60);
camera.position.set(0, 0, 0);
camera.rotation.order = 'YXZ';
const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra });
const plaster = material('#d6d6bc');
const green = material('#43675b');
const wood = material('#9c7550');
const dark = material('#263b32');
const cream = material('#ede3c9');
function box(width, height, depth, mat, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}
// Sala fechada de 10 × 4 × 10 metros.
box(10, 0.15, 10, wood, 0, -2.075, 0);
box(10, 0.15, 10, cream, 0, 2.075, 0);
box(10, 4, 0.15, green, 0, 0, -5.075);
box(10, 4, 0.15, plaster, 0, 0, 5.075);
box(0.15, 4, 10, plaster, -5.075, 0, 0);
box(0.15, 4, 10, plaster, 5.075, 0, 0);
for (let x = -4.5; x < 5; x += 0.5) box(0.012, 0.006, 10, dark, x, -1.997, 0);
for (const z of [-4.98, 4.98]) box(10, 0.13, 0.06, cream, 0, -1.92, z);
for (const x of [-4.98, 4.98]) box(0.06, 0.13, 10, cream, x, -1.92, 0);
// Sofá e mesa junto à parede verde, deixando o centro livre.
box(3.5, 0.45, 1.15, cream, 0, -1.45, -3.8);
box(3.5, 0.85, 0.25, cream, 0, -0.9, -4.3);
for (const x of [-1.65, 1.65]) box(0.25, 0.65, 1.25, cream, x, -1.15, -3.8);
for (const x of [-0.95, 0, 0.95]) box(0.85, 0.18, 0.9, material('#c6c6a6'), x, -1.15, -3.7);
box(1.9, 0.12, 0.85, wood, 0, -1.35, -2.1);
for (const x of [-0.75, 0.75]) for (const z of [-2.35, -1.85]) box(0.07, 0.6, 0.07, dark, x, -1.7, z);
box(2.3, 1.25, 0.1, wood, 0, 0.7, -4.88);
box(2.1, 1.05, 0.04, cream, 0, 0.7, -4.8);
const art = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), material('#cc794e'));
art.position.set(0.3, 0.7, -4.765);
scene.add(art);
box(0.65, 0.65, 0.035, green, -0.5, 0.55, -4.76);
// Janela luminosa, estante e porta ajudam a reconhecer cada direção.
box(0.12, 2.4, 3.4, wood, -4.88, 0.3, -0.4);
box(0.04, 2.15, 3.15, material('#b7d8d9', { emissive: '#a3cfd0', emissiveIntensity: 0.5 }), -4.79, 0.3, -0.4);
box(0.08, 2.2, 0.06, cream, -4.74, 0.3, -0.4);
box(0.08, 0.06, 3.2, cream, -4.74, 0.3, -0.4);
for (const y of [-1.4, -0.5, 0.4, 1.3]) box(0.65, 0.1, 2.6, wood, 4.6, y, 0);
for (const z of [-1.3, 1.3]) box(0.65, 3.1, 0.1, wood, 4.6, -0.15, z);
for (let i = 0; i < 9; i++) box(0.38, 0.4 + (i % 3) * 0.12, 0.13, [green, cream, dark][i % 3], 4.55, -1.1, -1 + i * 0.23);
box(1.6, 3.2, 0.12, wood, 1.8, -0.4, 4.89);
box(0.12, 0.12, 0.16, material('#bca56b', { metalness: 0.7 }), 1.2, -0.5, 4.77);
const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.23, 0.6, 24), material('#bc7756'));
pot.position.set(-3.5, -1.7, -3.8);
scene.add(pot);
for (let i = 0; i < 7; i++) {
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), green);
  leaf.scale.set(0.65, 2.2, 0.5);
  leaf.position.set(-3.5 + Math.sin(i * 2) * 0.3, -0.95 + (i % 3) * 0.15, -3.8 + Math.cos(i * 2) * 0.3);
  leaf.rotation.z = Math.sin(i) * 0.65;
  scene.add(leaf);
}
scene.add(new THREE.HemisphereLight('#f1f6e6', '#77705d', 2));
const light = new THREE.PointLight('#fff1d3', 65, 18, 2);
light.position.set(-2.7, 1.5, -0.7);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
scene.add(light);
box(1.2, 0.08, 1.2, material('#fff5da', { emissive: '#fff2cd', emissiveIntensity: 2 }), 0, 1.94, 0);

let yaw = 0;
let pitch = 0;
let dragging = false;
let lastX = 0;
let lastY = 0;
const limit = Math.PI / 2 - 0.01;
function look(dx, dy) {
  yaw -= dx * 0.003;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.003, -limit, limit);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
  document.querySelector('#heading').textContent = `${String(Math.round(THREE.MathUtils.radToDeg(-yaw) % 360 + 360) % 360).padStart(3, '0')}°`;
}
canvas.addEventListener('pointerdown', (event) => {
  if (document.pointerLockElement === canvas) return;
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging || document.pointerLockElement === canvas) return;
  look(event.clientX - lastX, event.clientY - lastY);
  lastX = event.clientX;
  lastY = event.clientY;
});
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, () => { dragging = false; });
document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) look(event.movementX, event.movementY);
});
document.querySelector('#explore').addEventListener('click', async () => {
  try {
    if (!canvas.requestPointerLock) throw new Error('Pointer Lock indisponível');
    await canvas.requestPointerLock();
  } catch {
    instructions.textContent = 'Clique e arraste na sala para olhar ao redor.';
    canvas.focus();
  }
});
document.addEventListener('pointerlockchange', () => {
  dragging = false;
  instructions.textContent = document.pointerLockElement === canvas
    ? 'Mova o mouse para olhar · pressione Esc para liberar'
    : 'Clique e arraste para olhar · ou use as setas';
});
document.querySelector('#reset').addEventListener('click', () => { yaw = pitch = 0; look(0, 0); });
canvas.addEventListener('keydown', (event) => {
  const offsets = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
  if (offsets[event.key]) { event.preventDefault(); look(...offsets[event.key]); }
});
function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();
renderer.setAnimationLoop(() => renderer.render(scene, camera));
