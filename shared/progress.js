// KONTRAK — pemilik: Maulidya. State bersama VR & AR via localStorage (origin sama).
window.PasarBasa = window.PasarBasa || {};
(function () {
  const KEY = 'pasarbasa:progress';
  const EMPTY = () => ({ done: [], dialogResults: [] });
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || EMPTY(); } catch (e) { return EMPTY(); } };
  const write = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const REQUIRED = ['vocab:cabai', 'vocab:tomat', 'vocab:pisang', 'dialog:beli-cabai'];
  PasarBasa.progress = {
    REQUIRED,
    mark(a) { const s = read(); if (!s.done.includes(a)) s.done.push(a); write(s); },
    recordDialog(r) { const s = read(); s.dialogResults.push(r); write(s); },
    get: read,
    reset() { write(EMPTY()); },
    summary() {
      const s = read();
      const c = s.dialogResults.filter(r => r.benar).length;
      return {
        total: REQUIRED.length,
        done: REQUIRED.filter(a => s.done.includes(a)).length,
        correct: c, wrong: s.dialogResults.length - c
      };
    }
  };
})();
