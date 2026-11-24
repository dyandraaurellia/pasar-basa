// Pemilik: Maulidya
// Modul data bersama VR dan AR

window.PasarBasa = window.PasarBasa || {};

(function () {
  let vocab = [];
  let dialog = [];

  const base = () => window.BASE || "";

  async function loadJSON(path) {
    const response = await fetch(base() + path);

    if (!response.ok) {
      throw new Error(`Gagal memuat ${path}: HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!Array.isArray(result)) {
      throw new Error(`Format JSON tidak valid: ${path}`);
    }

    return result;
  }

  PasarBasa.data = {
    async loadVocab() {
      if (!vocab.length) {
        vocab = await loadJSON("shared/kosakata.json");
      }

      return vocab;
    },

    getVocab(id) {
      return vocab.find((v) => v.id === id);
    },

    async loadDialog() {
      if (!dialog.length) {
        dialog = await loadJSON("shared/dialog.json");
      }

      return dialog;
    },
  };
})();
