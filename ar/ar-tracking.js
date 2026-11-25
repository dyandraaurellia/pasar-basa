// Pemilik: Wyena — tracking. Kontrak event ke Zaidan: ar:found {id}, ar:lost {id}, ar:error {type}, ar:hint
const IDS = ['cabai', 'tomat', 'pisang'];
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const sceneEl = document.getElementById('scene');

IDS.forEach(id => {
  const t = document.getElementById('t-' + id);
  const model = document.getElementById('obj-' + id);
  model.addEventListener('model-error', () => {
    model.removeAttribute('gltf-model');
    emit('ar:model-error', { id });
  });
  t.addEventListener('targetFound', () => {
    if (!model.hasAttribute('gltf-model')) model.setAttribute('gltf-model', `url(../assets/models/${id}.glb)`);
    emit('ar:tracking', { id, visible: true });
    if (!window.PasarBasa?.pin?.isPinned()) emit('ar:found', { id });
  });
  t.addEventListener('targetLost', () => {
    emit('ar:tracking', { id, visible: false });
    if (!window.PasarBasa?.pin?.isPinned()) emit('ar:lost', { id });
  });
});

const intro = document.getElementById('intro');
const startButton = document.getElementById('btn-start');
const retry = document.getElementById('btn-ar-retry');
const status = document.getElementById('ar-start-status');
let phase = 'preparing';
let system;
let targetURL;
let foundAny = false;

function releaseTargetURL() {
  if (targetURL) URL.revokeObjectURL(targetURL);
  targetURL = undefined;
}

function failStart(type) {
  if (phase === 'failed') return;
  phase = 'failed';
  releaseTargetURL();
  const video = system?.video;
  video?.srcObject?.getTracks().forEach(track => track.stop());
  video?.remove();
  system?.controller?.dispose();
  startButton.disabled = true;
  retry.hidden = false;
  intro.hidden = false;
  status.textContent = {
    camera: 'Kamera tidak bisa diakses. Periksa izin kamera dan muat ulang AR untuk mencoba kembali.',
    network: 'Berkas penanda gagal diunduh. Periksa koneksi dan muat ulang AR.',
    initialization: 'Komponen AR gagal disiapkan. Periksa koneksi dan muat ulang AR.',
    tracking: 'Pelacak kartu gagal dimulai. Muat ulang AR untuk mencoba kembali.',
  }[type];
  emit('ar:error', { type });
}

async function prepareAR() {
  if (phase !== 'preparing' || !sceneEl.hasLoaded) return;
  const component = sceneEl.components['mindar-image'];
  system = sceneEl.systems['mindar-image-system'];
  if (!component || typeof system?.ui?.showLoading !== 'function') return;
  phase = 'fetching';
  let bytes;
  try {
    const response = await fetch(component.data.imageTargetSrc);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    bytes = await response.arrayBuffer();
  } catch {
    failStart('network');
    return;
  }

  try {
    // MindAR 1.2.5 does not reliably reject its internal target fetch promise.
    // Validate the download and let the engine read the same bytes from memory.
    const compiler = new window.MINDAR.IMAGE.Compiler();
    if (compiler.importData(bytes).length < IDS.length) throw new Error('Invalid image targets');
    targetURL = URL.createObjectURL(new Blob([bytes]));
    system.imageTargetSrc = targetURL;

    // The 1.2.5 video metadata callback starts this async method without awaiting it.
    const startTracking = system._startAR.bind(system);
    system._startAR = () => startTracking().catch(() => failStart('tracking'));
  } catch {
    failStart('tracking');
    return;
  }

  phase = 'ready';
  retry.hidden = true;
  startButton.disabled = false;
  status.textContent = 'AR siap dimulai. Tekan Mulai AR untuk mengaktifkan kamera.';
}

sceneEl.addEventListener('arReady', () => {
  if (phase !== 'starting') return;
  phase = 'running';
  releaseTargetURL();
  intro.hidden = true;
  setTimeout(() => { if (!foundAny) emit('ar:hint'); }, 8000);
});
sceneEl.addEventListener('arError', () => {
  if (phase === 'starting') failStart('camera');
});

window.addEventListener('ar:found', () => { foundAny = true; });
startButton.onclick = () => emit('ar:start');
window.addEventListener('ar:start', () => {
  if (phase !== 'ready') return;
  phase = 'starting';
  startButton.disabled = true;
  retry.hidden = false;
  status.textContent = 'Mengaktifkan kamera dan pelacak kartu...';
  try {
    system.start();
  } catch {
    failStart('initialization');
  }
});

if (!window.AFRAME?.components['mindar-image']) {
  failStart('initialization');
} else {
  sceneEl.addEventListener('loaded', prepareAR, { once: true });
  sceneEl.addEventListener('componentinitialized', event => {
    if (event.target === sceneEl && event.detail.name === 'mindar-image') prepareAR();
  });
  prepareAR();
}
