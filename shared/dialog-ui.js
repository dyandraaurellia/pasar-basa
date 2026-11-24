// KONTRAK — pemilik: Maulidya. PasarBasa.dialog.mount(el, scenarioId, { onFinish })
window.PasarBasa = window.PasarBasa || {};
(function () {
  const css = `.pb-dialog{font-family:system-ui,sans-serif;background:#fff;color:#222;border-radius:12px;padding:16px;max-width:440px}
.pb-dialog .pb-seller{font-weight:600}.pb-dialog .pb-arti{color:#666;font-size:.9em;margin-bottom:12px}
.pb-dialog button{display:block;width:100%;text-align:left;margin:6px 0;padding:12px;border:1px solid #ccc;border-radius:8px;background:#f7f7f7;font-size:15px;min-height:44px;color:#222}
.pb-dialog button.ok{background:#d9f2d9;border-color:#5cb85c}.pb-dialog button.bad{background:#fadadd;border-color:#d9534f}
.pb-dialog .pb-fb{margin:8px 0;font-size:.95em}.pb-dialog .pb-next{background:#b5532f;color:#fff;text-align:center;border:0}`;
  function injectCss() {
    if (document.getElementById('pb-dialog-css')) return;
    const st = document.createElement('style'); st.id = 'pb-dialog-css'; st.textContent = css; document.head.appendChild(st);
  }
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

  PasarBasa.dialog = {
    async mount(container, scenarioId, opts) {
      opts = opts || {}; injectCss();
      const list = await PasarBasa.data.loadDialog();
      const sc = list.find(s => s.id === scenarioId);
      container.innerHTML = '';
      if (!sc) { container.textContent = 'Skenario tidak ditemukan.'; return; }
      const box = el('div', 'pb-dialog'); container.appendChild(box);

      function render() {
        box.innerHTML = '';
        box.appendChild(el('div', 'pb-seller', '🧑‍🌾 ' + sc.penjual));
        box.appendChild(el('div', 'pb-arti', sc.arti));
        const fb = el('div', 'pb-fb');
        sc.pilihan.forEach(p => {
          const b = el('button', '', p.teks);
          b.onclick = () => {
            box.querySelectorAll('button').forEach(x => x.disabled = true);
            PasarBasa.progress.recordDialog({ id: sc.id, teks: p.teks, benar: !!p.benar });
            b.className = p.benar ? 'ok' : 'bad';
            fb.textContent = p.umpanBalik;
            const next = el('button', 'pb-next', p.benar ? 'Lanjut →' : 'Coba lagi');
            next.onclick = () => {
              if (p.benar) { PasarBasa.progress.mark('dialog:' + sc.id); if (opts.onFinish) opts.onFinish(); }
              else render();
            };
            box.appendChild(next);
          };
          box.appendChild(b);
        });
        box.appendChild(fb);
      }
      render();
    }
  };
})();
