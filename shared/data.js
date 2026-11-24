// KONTRAK — pemilik: Maulidya. Set window.BASE ('../' di /vr dan /ar) sebelum memuat file ini.
window.PasarBasa = window.PasarBasa || {};
(function () {
  let vocab = [], dialog = [];
  const base = () => window.BASE || '';
  PasarBasa.data = {
    async loadVocab() {
      if (!vocab.length) vocab = await (await fetch(base() + 'shared/kosakata.json')).json();
      return vocab;
    },
    getVocab(id) { return vocab.find(v => v.id === id); },
    async loadDialog() {
      if (!dialog.length) dialog = await (await fetch(base() + 'shared/dialog.json')).json();
      return dialog;
    }
  };
})();
