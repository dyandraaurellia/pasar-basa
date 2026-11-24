// Pemilik: Maulidya — hotspot kosakata, dialog, misi, hasil (KF-VR-07..16).
(async () => {
  await PasarBasa.data.loadVocab();
  const v = PasarBasaVR.viewer;
  const panel = document.getElementById('vr-panel');
  const bar = document.getElementById('mission-bar');

  // Titik dari Dyan (ganti sesuai foto). type 'penjual' -> dialog.
  const spots = [
    { scene: 'kios-sayur', pitch: -10, yaw: 40, id: 'cabai',  icon: '🌶️' },
    { scene: 'kios-sayur', pitch: -12, yaw: 80, id: 'tomat',  icon: '🍅' },
    { scene: 'kios-buah',  pitch: -10, yaw: 20, id: 'pisang', icon: '🍌' },
    { scene: 'kios-sayur', pitch: 0,   yaw: 0,  id: 'penjual', icon: '🧑‍🌾', penjual: true }
  ];
  spots.forEach(s => v.addHotSpot({
    pitch: s.pitch, yaw: s.yaw, type: 'custom',
    createTooltipFunc: (div) => { div.className = 'pb-hotspot'; div.textContent = s.icon; },
    clickHandlerFunc: () => (s.penjual ? openDialog() : openVocab(s.id))
  }, s.scene));

  function closeBtn() { return '<button class="close">✕</button>'; }
  function show(html) { panel.innerHTML = html; panel.hidden = false; const c = panel.querySelector('.close'); if (c) c.onclick = () => panel.hidden = true; }

  function openVocab(id) {
    const d = PasarBasa.data.getVocab(id);
    show(closeBtn() + `<h3>${d.jawa}</h3><p>Artinya: <b>${d.indonesia}</b></p><button class="act" id="pb-audio">🔊 Dengarkan</button>`);
    panel.querySelector('.close').onclick = () => panel.hidden = true;
    document.getElementById('pb-audio').onclick = () => PasarBasa.audio.play(id);
    PasarBasa.progress.mark('vocab:' + id); updateBar();
  }

  function openDialog() {
    show(closeBtn() + '<div id="pb-dlg"></div>');
    PasarBasa.dialog.mount(document.getElementById('pb-dlg'), 'beli-cabai', { onFinish: () => { updateBar(); showSummary(); } });
  }

  function showSummary() {
    const s = PasarBasa.progress.summary();
    show(closeBtn() + `<h3>Hasil Belajar</h3><p>Aktivitas selesai: <b>${s.done}/${s.total}</b><br>Jawaban benar: ${s.correct} · salah: ${s.wrong}</p>
      <button class="act" id="pb-reset">↺ Ulangi Misi</button>`);
    document.getElementById('pb-reset').onclick = () => { PasarBasa.progress.reset(); updateBar(); panel.hidden = true; };
  }

  function updateBar() {
    const done = PasarBasa.progress.get().done;
    const label = { 'vocab:cabai': 'Cabai', 'vocab:tomat': 'Tomat', 'vocab:pisang': 'Pisang', 'dialog:beli-cabai': 'Dialog' };
    bar.innerHTML = '<b>Misi:</b> ' + PasarBasa.progress.REQUIRED.map(a => (done.includes(a) ? '✅' : '⬜') + ' ' + label[a]).join(' · ');
  }

  // toggle audio (KF-VR-16)
  const ab = document.getElementById('btn-audio');
  ab.onclick = () => { PasarBasa.audio.setEnabled(!PasarBasa.audio.isEnabled()); ab.textContent = PasarBasa.audio.isEnabled() ? '🔊' : '🔇'; };

  updateBar();
})();
