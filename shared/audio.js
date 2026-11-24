// Pemilik: Maulidya
// Modul audio bersama VR dan AR

window.PasarBasa = window.PasarBasa || {};

(function () {
  let enabled = true;
  let cur = null;

  PasarBasa.audio = {
    play(id) {
      if (!enabled) return;

      const vocab = PasarBasa.data.getVocab(id);

      if (!vocab || !vocab.audio) {
        console.warn("Audio tidak ditemukan:", id);
        return;
      }

      // Hentikan audio sebelumnya
      if (cur) {
        cur.pause();
        cur.currentTime = 0;
      }

      const path = (window.BASE || "") + vocab.audio;

      cur = new Audio(path);

      cur.play().catch((error) => {
        console.error("Gagal memutar audio:", path, error);
      });
    },

    setEnabled(value) {
      enabled = Boolean(value);

      if (!enabled && cur) {
        cur.pause();
      }
    },

    isEnabled() {
      return enabled;
    },
  };
})();
