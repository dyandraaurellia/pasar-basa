// Pemilik: Zaidan — UI + alur belajar AR. Mendengarkan event Wyena, memakai PasarBasa.* (Maulidya).
const $ = id => document.getElementById(id);
let activeId = null;

(async () => {
  await PasarBasa.data.loadVocab();
  updateBar();
})();

$('btn-start').onclick = () => { $('intro').hidden = true; window.dispatchEvent(new CustomEvent('ar:start')); };

window.addEventListener('ar:found', e => {
  activeId = e.detail.id;
  const v = PasarBasa.data.getVocab(activeId);
  $('hint').hidden = true;
  $('badge').textContent = '✅ Kartu terdeteksi: ' + (v ? v.indonesia : activeId);
  enable(true);
});
window.addEventListener('ar:lost', () => { $('badge').textContent = 'Arahkan kamera ke kartu'; enable(false); });
window.addEventListener('ar:hint', () => showHint('Belum terdeteksi. Dekatkan kartu 20–40 cm, pastikan terang dan tanpa pantulan.'));
window.addEventListener('ar:error', () => showHint('Kamera tidak bisa diakses. Izinkan kamera di pengaturan browser lalu muat ulang halaman.'));

function enable(on) { ['btn-info','btn-audio','btn-rot-l','btn-rot-r','btn-plus','btn-minus'].forEach(id => $(id).disabled = !on); }
function showHint(t) { $('hint').textContent = t; $('hint').hidden = false; }
function openPanel(html) { $('panel').innerHTML = '<button class="close">✕</button>' + html; $('panel').hidden = false; $('panel').querySelector('.close').onclick = () => $('panel').hidden = true; }

$('btn-info').onclick = () => {
  if (!activeId) return;
  const v = PasarBasa.data.getVocab(activeId);
  openPanel(`<h3>${v.jawa}</h3><p>Artinya: <b>${v.indonesia}</b></p><button class="ar-btn primary" id="pb-play">🔊 Dengarkan</button>`);
  $('pb-play').onclick = () => PasarBasa.audio.play(activeId);
  PasarBasa.progress.mark('vocab:' + activeId); updateBar();
};
$('btn-audio').onclick = () => activeId && PasarBasa.audio.play(activeId);

// kontrol objek (model punya id "obj-<id>")
function obj() { return activeId && $('obj-' + activeId); }
function rotate(d) { const o = obj(); if (!o) return; const r = o.getAttribute('rotation'); o.setAttribute('rotation', { x: r.x, y: r.y + d * 30, z: r.z }); }
function scaleBy(f) { const o = obj(); if (!o) return; const s = o.getAttribute('scale'); o.setAttribute('scale', { x: s.x * f, y: s.y * f, z: s.z * f }); }
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
  $('pb-reset').onclick = () => { PasarBasa.progress.reset(); updateBar(); $('panel').hidden = true; };
}

$('btn-sound').onclick = () => { PasarBasa.audio.setEnabled(!PasarBasa.audio.isEnabled()); $('btn-sound').textContent = PasarBasa.audio.isEnabled() ? '🔊' : '🔇'; };

function updateBar() {
  const done = PasarBasa.progress.get().done;
  const label = { 'vocab:cabai': 'Cabai', 'vocab:tomat': 'Tomat', 'vocab:pisang': 'Pisang', 'dialog:beli-cabai': 'Dialog' };
  $('mission-bar').innerHTML = PasarBasa.progress.REQUIRED.map(a => (done.includes(a) ? '✅' : '⬜') + label[a]).join(' ');
}
