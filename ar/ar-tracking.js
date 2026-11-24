// Pemilik: Wyena — tracking. Kontrak event ke Zaidan: ar:found {id}, ar:lost {id}, ar:error {type}, ar:hint
const IDS = ['cabai', 'tomat', 'pisang'];
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const sceneEl = document.getElementById('scene');

IDS.forEach(id => {
  const t = document.getElementById('t-' + id);
  t.addEventListener('targetFound', () => emit('ar:found', { id }));
  t.addEventListener('targetLost',  () => emit('ar:lost',  { id }));
});

// Dipanggil Zaidan lewat event 'ar:start' (tombol Mulai AR -> user gesture -> izin kamera)
let foundAny = false;
window.addEventListener('ar:found', () => { foundAny = true; });
window.addEventListener('ar:start', () => {
  sceneEl.addEventListener('arError', () => emit('ar:error', { type: 'camera' }), { once: true });
  const mindar = sceneEl.systems['mindar-image-system'];
  mindar.start();
  setTimeout(() => { if (!foundAny) emit('ar:hint'); }, 8000);
});
