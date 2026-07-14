// ar/ar.js
let xrSession = null;
let referenceSpace = null;
let hitTestSource = null;
let placedModel = null;

async function startARSession() {
  if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
    alert("❌ WebXR AR não suportado neste navegador/dispositivo.");
    return;
  }

  try {
    xrSession = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['plane-detection']
    });

    document.getElementById('ar-container').style.display = 'block';

    xrSession.addEventListener('end', () => {
      document.getElementById('ar-container').style.display = 'none';
    });

    const canvas = document.getElementById('ar-canvas');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.xr.enabled = true;
    renderer.xr.setSession(xrSession);

    referenceSpace = await xrSession.requestReferenceSpace('local-floor');
    const viewerSpace = await xrSession.requestReferenceSpace('viewer');
    hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

    if (!loadedModel) await loadModel('../modelos/elefante.glb');

    animateAR();
  } catch (e) {
    console.error(e);
    alert("Erro ao iniciar AR: " + e.message);
  }
}

function exitAR() {
  if (xrSession) xrSession.end();
}

function animateAR() {
  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame && hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0 && !placedModel) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        if (pose) {
          placedModel = loadedModel.clone();
          placedModel.matrixAutoUpdate = false;
          placedModel.matrix.fromArray(pose.transform.matrix);
          scene.add(placedModel);
        }
      }
    }
    renderer.render(scene, camera);
  });
}