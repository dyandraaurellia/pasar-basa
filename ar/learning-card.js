// Kartu pembelajaran tetap bisa dibaca ketika marker sesaat keluar dari kamera.
window.PasarBasa = window.PasarBasa || {};
(function () {
  const card = document.getElementById('learning-card');
  const byId = id => document.getElementById(id);
  const listenButtons = Array.from(card.querySelectorAll('[data-register]'));
  const cardImages = {
    cabai: 'assets/markers/kartu-cabai.png',
    tomat: 'assets/markers/Learning Card AR.png',
    pisang: 'assets/markers/kartu-pisang.png',
  };
  let currentId = null;
  let trackedId = null;
  let request = 0;

  function updateTracking() {
    if (PasarBasa.pin.isPinned() && PasarBasa.pin.getId() === currentId) {
      byId('learning-tracking').textContent = 'Objek dikunci di layar · kartu boleh disimpan';
      return;
    }
    byId('learning-tracking').textContent = trackedId === currentId
      ? 'Kartu terdeteksi · amati juga objek 3D-nya'
      : 'Kartu keluar dari kamera. Kamu tetap bisa belajar di sini.';
  }

  function compact(value) {
    card.classList.toggle('is-compact', value);
    byId('learning-toggle').textContent = value ? 'Buka materi belajar' : 'Ringkas kartu';
    byId('learning-toggle').setAttribute('aria-expanded', String(!value));
  }
  byId('learning-toggle').onclick = () => compact(!card.classList.contains('is-compact'));
  window.addEventListener('ar:pinned', () => { compact(true); updateTracking(); });
  window.addEventListener('ar:unpinned', () => { compact(false); updateTracking(); });

  function updateProgress() {
    const done = PasarBasa.progress.get().done.includes('vocab:' + currentId);
    byId('learning-done').textContent = done ? '✓ Sudah dipelajari' : 'Tandai sudah dipelajari';
    byId('learning-done').disabled = done;
  }

  async function show(id) {
    compact(false);
    const version = ++request;
    try {
      await PasarBasa.data.loadVocab();
      if (version !== request) return;
      const vocab = PasarBasa.data.getVocab(id);
      if (!vocab) return;
      const changed = currentId !== id;
      if (changed && PasarBasa.audio.stop) PasarBasa.audio.stop();
      currentId = id;
      byId('learning-name').textContent = vocab.indonesia;
      byId('learning-ngoko').textContent = vocab.ngoko || vocab.jawa;
      const pronunciation = vocab.jawa[0].toUpperCase() + vocab.jawa.slice(1);
      const listen = card.querySelector('[data-register="ngoko"]');
      listen.setAttribute('aria-label', `Dengarkan ${pronunciation} (ngoko)`);
      listen.title = listen.getAttribute('aria-label');
      listen.disabled = !vocab.audio || !PasarBasa.audio.isEnabled();
      byId('learning-krama').textContent = vocab.krama || 'Belum tersedia';
      byId('learning-image').src = (window.BASE || '') + (vocab.image || cardImages[id]);
      byId('learning-image').alt = 'Ilustrasi ' + vocab.indonesia;
      byId('learning-note').textContent = vocab.ngoko === vocab.krama
        ? 'Kata benda ini memiliki bentuk yang sama dalam ngoko dan krama.'
        : 'Ngoko untuk percakapan akrab; krama untuk percakapan yang lebih sopan.';
      if (changed) byId('learning-audio-status').textContent = 'Tekan Dengarkan untuk memutar pelafalan.';
      updateTracking();
      updateProgress();
      card.hidden = false;
    } catch (error) {
      console.error('Gagal memuat kartu belajar:', error);
      window.dispatchEvent(new CustomEvent('ar:learning-error'));
    }
  }

  window.addEventListener('ar:found', e => {
    trackedId = e.detail.id;
    show(trackedId);
  });
  window.addEventListener('ar:lost', e => {
    if (trackedId === e.detail.id) trackedId = null;
    if (currentId === e.detail.id) PasarBasa.audio.stop();
    if (currentId) updateTracking();
  });
  byId('learning-close').onclick = () => { ++request; card.hidden = true; PasarBasa.audio.stop(); };
  listenButtons.forEach(button => {
    button.onclick = () => currentId && PasarBasa.audio.play(currentId, button.dataset.register);
  });
  byId('learning-done').onclick = () => {
    if (!currentId) return;
    PasarBasa.progress.mark('vocab:' + currentId);
    updateProgress();
    window.dispatchEvent(new CustomEvent('ar:learned', { detail: { id: currentId } }));
  };
  window.addEventListener('pb:audio', e => {
    const { id, register, state, message } = e.detail;
    if (id && id !== currentId) return;
    listenButtons.forEach(button => {
      if (button.dataset.register === 'ngoko' && currentId) {
        button.disabled = !PasarBasa.audio.isEnabled() || !PasarBasa.data.getVocab(currentId)?.audio;
      }
      const playing = state === 'playing' && button.dataset.register === register;
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
    });
    if (message) byId('learning-audio-status').textContent = message;
  });
  PasarBasa.learningCard = { show, refresh: updateProgress };
})();
