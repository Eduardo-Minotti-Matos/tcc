// main.js
let placedModel = null;

function initThreeViewer() {
  // Inicialização básica do Three.js no preview 3D (opcional)
  console.log("Three.js 3D preview inicializado");
}

async function placeModel(hitMatrix) {
  if (!model) {
    model = await loadGLBModel('../modelos/elefante.glb');
  }
  
  if (placedModel) {
    scene.remove(placedModel);
  }
  
  placedModel = model.clone();
  placedModel.matrixAutoUpdate = false;
  placedModel.matrix.copy(hitMatrix);
  scene.add(placedModel);
}

function animate() {
  renderer.setAnimationLoop(() => {
    if (hitTestSource && xrSession) {
      const frame = renderer.xr.getFrame();
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        if (pose) {
          // Posicionamento inicial
        }
      }
    }
    renderer.render(scene, camera);
  });
}

// Eventos de toque para mover (implementação básica)
document.getElementById('ar-canvas').addEventListener('touchmove', (e) => {
  if (placedModel && isDragging) {
    // Lógica simplificada de movimento
  }
});