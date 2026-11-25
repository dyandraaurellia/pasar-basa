const vrDialogueAudio = (() => {
  const sellers = {
    "bu-sari": { folder: "Bu Sari", prefix: "bu-sari", nadia: "nadia-sayur" },
    "pak-budi": { folder: "Pak Budi", prefix: "pak-budi", nadia: "nadia-buah" },
  };
  const sharedAudio = PasarBasa.audio;
  const player = new Audio();
  player.preload = "none";
  let queue = null;

  function clips(seller, turnIndex) {
    const { folder, prefix, nadia } = sellers[seller];
    const file = (directory, name, take) =>
      `../assets/audio/${encodeURIComponent(directory)}/${name}-${String(take).padStart(2, "0")}.mp3`;
    return {
      question: file(folder, prefix, turnIndex * 2 + 1),
      answer: file("Nadia", nadia, turnIndex + 1),
      reply: file(folder, prefix, turnIndex * 2 + 2),
    };
  }

  function stop() {
    if (!queue) return;
    queue.abort();
    queue = null;
    player.pause();
    player.removeAttribute("src");
    player.load();
  }

  function play(paths, report) {
    stop();
    report("");
    if (!sharedAudio.isEnabled()) return;
    queue = new AbortController();
    const { signal } = queue;
    let index = 0;

    function fail(message) {
      if (signal.aborted) return;
      stop();
      report(message);
    }

    function advance() {
      if (!sharedAudio.isEnabled() || index >= paths.length) {
        stop();
        return;
      }
      player.src = paths[index++];
      player.play().catch((error) => fail(error.name === "NotAllowedError"
        ? "Ketuk tombol putar untuk mendengarkan rekaman."
        : "Rekaman gagal diputar. Percakapan bisa dilanjutkan."));
    }

    player.addEventListener("ended", advance, { signal });
    player.addEventListener("error", () => fail("Rekaman gagal dimuat. Percakapan bisa dilanjutkan."), { signal });
    advance();
  }

  window.addEventListener("pagehide", stop);
  return { clips, play, stop };
})();
