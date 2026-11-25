// Pemilik: Maulidya
// Modul audio bersama VR dan AR

window.PasarBasa = window.PasarBasa || {};

(function () {
  let enabled = true;
  let cur = null;
  const notify = (detail) => window.dispatchEvent(new CustomEvent("pb:audio", { detail }));

  function stop() {
    if (!cur) return;
    const player = cur;
    cur = null;
    player.pause();
    player.removeAttribute("src");
    player.load();
    notify({ state: "idle", message: "Pelafalan dihentikan." });
  }

  PasarBasa.audio = {
    play(id, register = "ngoko") {
      if (!enabled || register !== "ngoko") return;

      const vocab = PasarBasa.data.getVocab(id);

      if (!vocab || !vocab.audio) {
        console.warn("Audio tidak ditemukan:", id);
        return;
      }

      stop();
      const player = new Audio((window.BASE || "") + vocab.audio);
      cur = player;
      const report = (state, message) => notify({ id, register, state, message });
      const fail = () => {
        if (cur !== player) return;
        stop();
        report("error", "Rekaman pelafalan gagal diputar. Coba lagi.");
      };
      player.addEventListener("ended", () => {
        if (cur !== player) return;
        stop();
        report("ended", "Pelafalan selesai diputar.");
      }, { once: true });
      player.addEventListener("error", fail, { once: true });
      player.play().then(() => {
        if (cur === player) report("playing", "Memutar pelafalan.");
      }).catch(fail);
    },

    stop,

    setEnabled(value) {
      enabled = Boolean(value);

      if (!enabled) stop();
      notify({ state: "idle", message: enabled ? "Audio aktif." : "Audio dimatikan." });
    },

    isEnabled() {
      return enabled;
    },
  };
  window.addEventListener("pagehide", stop);
})();
