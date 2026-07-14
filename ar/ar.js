// ar.js
let xrSession = null;
let referenceSpace = null;
let hitTestSource = null;

async function startARSession() {
  if (!navigator.xr || !navigator.xr.isSessionSupported('immersive-ar')) {
    alert("WebXR AR não é suportado neste dispositivo/navegador.");
    return;
  }

  try {
    xrSession = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test', 'plane-detection'],
      optionalFeatures: ['dom-overlay']
    });

    document.getElementById('ar-container').style.display = 'block';
    document.getElementById('ar-overlay').classList.remove('hidden');

    xrSession.addEventListener('end', onSessionEnded);

    referenceSpace = await xrSession.requestReferenceSpace('local-floor');
    
    const viewerSpace = await xrSession.requestReferenceSpace('viewer');
    hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

    renderer.xr.setSession(xrSession);
    animate();
  } catch (error) {
    console.error(error);
    alert("Erro ao iniciar AR: " + error.message);
  }
}

function onSessionEnded() {
  document.getElementById('ar-container').style.display = 'none';
  document.getElementById('ar-overlay').classList.add('hidden');
  xrSession = null;
}

function exitAR() {
  if (xrSession) xrSession.end();
}