// loader.js
let model = null;

async function loadGLBModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
      model = gltf.scene;
      model.scale.set(1, 1, 1); // Escala real
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      resolve(model);
    }, undefined, reject);
  });
}