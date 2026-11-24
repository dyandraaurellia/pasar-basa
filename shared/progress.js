// Pemilik: Maulidya
// Progres bersama VR dan AR

window.PasarBasa = window.PasarBasa || {};

(function () {
  const KEY = "pasarbasa:progress";

  const REQUIRED = ["vocab:cabai", "vocab:tomat", "vocab:pisang", "dialog:beli-cabai"];

  const EMPTY = () => ({
    done: [],
    dialogResults: [],
  });

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));

      if (!data || !Array.isArray(data.done) || !Array.isArray(data.dialogResults)) {
        return EMPTY();
      }

      return data;
    } catch (error) {
      console.warn("Gagal membaca progres:", error);
      return EMPTY();
    }
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Gagal menyimpan progres:", error);
    }
  }

  PasarBasa.progress = {
    REQUIRED,

    mark(activityId) {
      const state = read();

      if (!state.done.includes(activityId)) {
        state.done.push(activityId);
      }

      write(state);
    },

    recordDialog(result) {
      const state = read();

      state.dialogResults.push(result);

      write(state);
    },

    get: read,

    reset() {
      write(EMPTY());
    },

    summary() {
      const state = read();

      const correct = state.dialogResults.filter((result) => result.benar).length;

      return {
        total: REQUIRED.length,

        done: REQUIRED.filter((activity) => state.done.includes(activity)).length,

        correct,

        wrong: state.dialogResults.length - correct,
      };
    },
  };
})();
