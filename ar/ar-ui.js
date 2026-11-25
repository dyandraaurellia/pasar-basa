// Pemilik: Zaidan — UI + alur belajar AR. Mendengarkan event Wyena, memakai PasarBasa.* (Maulidya).
const $ = id => document.getElementById(id);
let activeId = null;

(async () => {
  try {
    await PasarBasa.data.loadVocab();
  } catch {
    showHint('Kosakata gagal dimuat. Periksa koneksi dan muat ulang halaman.');
  }
  updateBar();
})();

window.addEventListener('ar:found', e => {
  activeId = e.detail.id;
  const v = PasarBasa.data.getVocab(activeId);
  $('hint').hidden = true;
  $('badge').textContent = '✅ Kartu terdeteksi: ' + (v ? v.indonesia : activeId);
  enable(true);
});
window.addEventListener('ar:lost', e => {
  if (PasarBasa.pin.isPinned()) return;
  if (activeId !== e.detail.id) return;
  activeId = null;
  $('badge').textContent = 'Arahkan kamera ke kartu';
  enable(false);
});
window.addEventListener('ar:pinned', e => {
  activeId = e.detail.id;
  $('badge').textContent = '🔒 Objek dikunci di layar · kartu boleh disimpan';
  enable(true);
});
window.addEventListener('ar:unpinned', e => {
  activeId = e.detail.id;
  $('badge').textContent = 'Arahkan kamera ke kartu';
  enable(Boolean(activeId));
});
window.addEventListener('ar:pin-error', e => showHint(e.detail.message));
window.addEventListener('ar:learned', updateBar);
window.addEventListener('ar:learning-error', () => showHint('Kartu belajar gagal dimuat. Muat ulang halaman untuk mencoba kembali.'));
window.addEventListener('ar:hint', () => showHint('Belum terdeteksi. Dekatkan kartu 20–40 cm, pastikan terang dan tanpa pantulan.'));
window.addEventListener('ar:model-error', e => {
  if (activeId === e.detail.id) showHint('Model gagal dimuat. Periksa koneksi, jauhkan kartu, lalu pindai kembali.');
});

function enable(on) {
  ['btn-info','btn-rot-l','btn-rot-r','btn-plus','btn-minus'].forEach(id => $(id).disabled = !on);
  $('btn-audio').disabled = !on || !PasarBasa.audio.isEnabled();
}
function showHint(t) { $('hint').textContent = t; $('hint').hidden = false; }
function openPanel(html) {
  PasarBasa.audio.stop();
  $('panel').innerHTML = '<button class="close">✕</button>' + html;
  $('panel').hidden = false;
  $('panel').querySelector('.close').onclick = () => {
    PasarBasa.audio.stop();
    $('panel').hidden = true;
  };
}

$('btn-info').onclick = () => {
  if (!activeId) return;
  PasarBasa.learningCard.show(activeId);
};
$('btn-audio').onclick = () => activeId && PasarBasa.audio.play(activeId);

// kontrol objek (model punya id "obj-<id>")
function obj() { return activeId && $('obj-' + activeId); }
function rotate(d) {
  if (PasarBasa.pin.isPinned()) return PasarBasa.pin.rotate(d * Math.PI / 6);
  const o = obj(); if (!o) return;
  const r = o.getAttribute('rotation'); o.setAttribute('rotation', { x: r.x, y: r.y + d * 30, z: r.z });
}
function scaleBy(f) {
  if (PasarBasa.pin.isPinned()) return PasarBasa.pin.zoomBy(f);
  const o = obj(); if (!o) return;
  const next = Math.min(2, Math.max(0.5, o.getAttribute('scale').x * f));
  o.setAttribute('scale', { x: next, y: next, z: next });
}
$('btn-rot-l').onclick = () => rotate(-1);
$('btn-rot-r').onclick = () => rotate(1);
$('btn-plus').onclick = () => scaleBy(1.2);
$('btn-minus').onclick = () => scaleBy(1 / 1.2);

$('btn-dialog').onclick = () => {
  openPanel('<div id="pb-dlg"></div>');
  PasarBasa.dialog.mount($('pb-dlg'), 'beli-cabai', { onFinish: () => { updateBar(); showSummary(); } });
};
function showSummary() {
  const s = PasarBasa.progress.summary();
  openPanel(`<h3>Hasil Belajar</h3><p>Aktivitas selesai: <b>${s.done}/${s.total}</b><br>Jawaban benar: ${s.correct} · salah: ${s.wrong}</p><button class="ar-btn primary" id="pb-reset">↺ Ulangi Misi</button>`);
  $('pb-reset').onclick = () => { PasarBasa.progress.reset(); updateBar(); PasarBasa.learningCard.refresh(); $('panel').hidden = true; };
}

$('btn-sound').onclick = () => {
  const enabled = !PasarBasa.audio.isEnabled();
  PasarBasa.audio.setEnabled(enabled);
  $('btn-sound').textContent = enabled ? '🔊' : '🔇';
  $('btn-sound').setAttribute('aria-pressed', String(enabled));
  $('btn-audio').disabled = !enabled || !activeId;
};

function updateBar() {
  const done = PasarBasa.progress.get().done;
  const label = { 'vocab:cabai': 'Cabai', 'vocab:tomat': 'Tomat', 'vocab:pisang': 'Pisang', 'dialog:beli-cabai': 'Dialog' };
  $('mission-bar').innerHTML = PasarBasa.progress.REQUIRED.map(a => (done.includes(a) ? '✅' : '⬜') + label[a]).join(' ');
}
