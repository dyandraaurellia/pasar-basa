// Pemilik: Maulidya — hotspot kosakata, dialog, misi, hasil (KF-VR-07..16).
(async () => {
  await PasarBasa.data.loadVocab();
  const v = PasarBasaVR.viewer;
  const panel = document.getElementById("vr-panel");
  const bar = document.getElementById("mission-bar");

  // Titik dari Dyan (ganti sesuai foto). type 'penjual' -> dialog.

  const spots = [
    {
      scene: "kios-sayur",
      pitch: -23.12,
      yaw: -45.18,
      id: "cabai",
      icon: "🌶️",
      label: "Belajar Cabai",
    },
    {
      scene: "kios-sayur",
      pitch: -29.55,
      yaw: -28.77,
      id: "tomat",
      icon: "🍅",
      label: "Belajar Tomat",
    },
    {
      scene: "kios-buah",
      pitch: -21.83,
      yaw: 39.76,
      id: "pisang",
      icon: "🍌",
      label: "Belajar Pisang",
    },
    {
      scene: "kios-sayur",
      pitch: -4.58,
      yaw: -0.8,
      id: "bu-sari",
      icon: "💬",
      label: "Bicara dengan Bu Sari",
      penjual: true,
      scenario: "beli-cabai",
    },
    {
      scene: "kios-buah",
      pitch: -19.11,
      yaw: 15.12,
      id: "pak-budi",
      icon: "💬",
      label: "Bicara dengan Pak Budi",
      penjual: true,
      scenario: "beli-pisang",
    },
  ];

  spots.forEach((s) =>
    v.addHotSpot(
      {
        id: s.id,
        pitch: s.pitch,
        yaw: s.yaw,
        type: "info",
        cssClass: "pb-hotspot",

        createTooltipFunc: (div) => {
          div.textContent = s.icon;
          div.title = s.label;
          div.setAttribute("aria-label", s.label);
        },

        clickHandlerFunc: () => {
          if (s.penjual) {
            openDialog(s.scenario);
          } else {
            openVocab(s.id);
          }
        },
      },
      s.scene,
    ),
  );

  spots.forEach((s) =>
    v.addHotSpot(
      {
        id: s.id,
        pitch: s.pitch,
        yaw: s.yaw,
        type: "info",
        cssClass: "pb-hotspot",

        createTooltipFunc: (div) => {
          div.textContent = s.icon;
          div.title = s.label;
          div.setAttribute("aria-label", s.label);
        },

        clickHandlerFunc: () => {
          if (s.penjual) {
            openDialog(s.scenario);
          } else {
            openVocab(s.id);
          }
        },
      },
      s.scene,
    ),
  );

  spots.forEach((s) =>
    v.addHotSpot(
      {
        pitch: s.pitch,
        yaw: s.yaw,
        type: "custom",
        createTooltipFunc: (div) => {
          div.className = "pb-hotspot";
          div.textContent = s.icon;
        },
        clickHandlerFunc: () => (s.penjual ? openDialog() : openVocab(s.id)),
      },
      s.scene,
    ),
  );

  function closeBtn() {
    return '<button class="close">✕</button>';
  }
  function show(html) {
    panel.innerHTML = html;
    panel.hidden = false;
    const c = panel.querySelector(".close");
    if (c) c.onclick = () => (panel.hidden = true);
  }

  // DRAFT materi bahasa Jawa.
  // Perlu diverifikasi oleh penutur sebelum presentasi.

  const lessons = {
    cabai: {
      icon: "🌶️",
      sentence: "Kula badhe tumbas lombok.",
      meaning: "Saya ingin membeli cabai.",
      words: [
        ["Kula", "Saya"],
        ["Badhe", "Ingin"],
        ["Tumbas", "Membeli"],
        ["Lombok", "Cabai"],
      ],
      ngoko: "Aku arep tuku lombok.",
      krama: "Kula badhe tumbas lombok.",
    },

    tomat: {
      icon: "🍅",
      sentence: "Pinten reginipun tomat?",
      meaning: "Berapa harga tomat?",
      words: [
        ["Pinten", "Berapa"],
        ["Reginipun", "Harganya"],
        ["Tomat", "Tomat"],
      ],
      ngoko: "Pira regane tomat?",
      krama: "Pinten reginipun tomat?",
    },

    pisang: {
      icon: "🍌",
      sentence: "Kula badhe tumbas gedhang tiga.",
      meaning: "Saya ingin membeli tiga pisang.",
      words: [
        ["Gedhang", "Pisang"],
        ["Telu", "Tiga (ngoko)"],
        ["Tiga", "Tiga (krama)"],
        ["Tumbas", "Membeli"],
      ],
      ngoko: "Aku arep tuku gedhang telu.",
      krama: "Kula badhe tumbas gedhang tiga.",
    },
  };

  function openVocab(id) {
    const d = PasarBasa.data.getVocab(id);
    const lesson = lessons[id];

    if (!d || !lesson) return;

    const wordList = lesson.words
      .map(
        (word) => `
        <div class="pb-word">
            <b>${word[0]}</b>
            <span>${word[1]}</span>
        </div>
    `,
      )
      .join("");

    show(
      closeBtn() +
        `
        <div class="pb-lesson">

            <small>BELAJAR DI PASAR</small>

            <h3>${lesson.icon} ${d.jawa}</h3>

            <p>Bahasa Indonesia: ${d.indonesia}</p>

            <button class="act" id="pb-audio">
                🔊 Dengarkan ${d.jawa}
            </button>

            <hr>

            <h4>Contoh Percakapan</h4>

            <div class="pb-example">
                <b>${lesson.sentence}</b>
                <p>${lesson.meaning}</p>
            </div>

            <h4>Pahami Kata-katanya</h4>

            ${wordList}

            <h4>Ngoko dan Krama</h4>

            <p>
                <b>Ngoko:</b><br>
                ${lesson.ngoko}
            </p>

            <p>
                <b>Krama:</b><br>
                ${lesson.krama}
            </p>

            <button class="act" id="pb-learned">
                ✓ Sudah Dipelajari
            </button>

        </div>
    `,
    );

    document.getElementById("pb-audio").onclick = () => {
      PasarBasa.audio.play(id);
    };

    document.getElementById("pb-learned").onclick = () => {
      PasarBasa.progress.mark("vocab:" + id);
      updateBar();
      panel.hidden = true;
    };
  }

  async function openDialog(scenarioId) {
    const isFruit = scenarioId === "beli-pisang";

    const seller = isFruit ? "Pak Budi" : "Bu Sari";

    const mission = isFruit ? "Belilah tiga pisang menggunakan bahasa Jawa yang sopan." : "Belilah cabai menggunakan bahasa Jawa yang sopan.";

    show(
      closeBtn() +
        `
        <div class="pb-conversation">

            <small>SIMULASI PERCAKAPAN</small>

            <h3>💬 ${seller}</h3>

            <div class="pb-example">
                <b>Misi Nadia</b>
                <p>${mission}</p>
            </div>

            <div id="pb-dlg"></div>

        </div>
    `,
    );

    const target = document.getElementById("pb-dlg");

    try {
      await PasarBasa.dialog.mount(target, scenarioId, {
        onFinish: () => {
          updateBar();

          const s = PasarBasa.progress.summary();

          if (s.done === s.total) {
            showSummary();
          } else {
            show(
              closeBtn() +
                `
                            <h3>✓ Percakapan Selesai!</h3>
                            <p>Bagus! Kamu berhasil
                            menjawab percakapan dengan
                            ${seller}.</p>

                            <p>Progres misi:
                            ${s.done}/${s.total}</p>

                            <button class="act"
                                id="pb-continue">
                                Lanjut Eksplorasi →
                            </button>
                        `,
            );

            document.getElementById("pb-continue").onclick = () => {
              panel.hidden = true;
            };
          }
        },
      });
    } catch (error) {
      console.error("Dialog gagal dimuat:", error);
      target.textContent = "Percakapan gagal dimuat.";
    }
  }

  function showSummary() {
    const s = PasarBasa.progress.summary();
    show(
      closeBtn() +
        `<h3>Hasil Belajar</h3><p>Aktivitas selesai: <b>${s.done}/${s.total}</b><br>Jawaban benar: ${s.correct} · salah: ${s.wrong}</p>
      <button class="act" id="pb-reset">↺ Ulangi Misi</button>`,
    );
    document.getElementById("pb-reset").onclick = () => {
      PasarBasa.progress.reset();
      updateBar();
      panel.hidden = true;
    };
  }

  function updateBar() {
    const done = PasarBasa.progress.get().done;
    const label = { "vocab:cabai": "Cabai", "vocab:tomat": "Tomat", "vocab:pisang": "Pisang", "dialog:beli-cabai": "Dialog" };
    bar.innerHTML = "<b>Misi:</b> " + PasarBasa.progress.REQUIRED.map((a) => (done.includes(a) ? "✅" : "⬜") + " " + label[a]).join(" · ");
  }

  // toggle audio (KF-VR-16)
  const ab = document.getElementById("btn-audio");
  ab.onclick = () => {
    PasarBasa.audio.setEnabled(!PasarBasa.audio.isEnabled());
    ab.textContent = PasarBasa.audio.isEnabled() ? "🔊" : "🔇";
  };

  updateBar();
})();
