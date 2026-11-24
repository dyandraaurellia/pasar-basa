// KONTRAK — pemilik: Maulidya. Audio hanya diputar dari event klik (aturan browser).
window.PasarBasa = window.PasarBasa || {};
(function () {
  let enabled = true, cur = null;
  PasarBasa.audio = {
    play(id) {
      if (!enabled) return;
      const v = PasarBasa.data.getVocab(id); if (!v) return;
      if (cur) cur.pause();
      cur = new Audio((window.BASE || '') + v.audio);
      cur.play().catch(() => {});
    },
    setEnabled(b) { enabled = !!b; if (!b && cur) cur.pause(); },
    isEnabled() { return enabled; }
  };
})();
