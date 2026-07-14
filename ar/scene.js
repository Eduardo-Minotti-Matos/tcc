// scene.js
let scene, camera, renderer;
let currentPlacedModel = null;
let isDragging = false;
let previousTouch = null;

function initScene(container) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  
  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('ar-canvas'),
    antialias: true,
    alpha: true 
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = true;

  // Iluminação
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7);
  directional.castShadow = true;
  scene.add(directional);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}