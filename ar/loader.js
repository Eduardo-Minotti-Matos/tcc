// ar/loader.js
let loadedModel = null;

async function loadModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.GLTFLoader();
    loader.load(url, (gltf) => {
      loadedModel = gltf.scene;
      loadedModel.scale.set(0.8, 0.8, 0.8); // Ajuste conforme necessário
      loadedModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      resolve(loadedModel);
    }, undefined, reject);
  });
}