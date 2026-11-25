// Pemilik: Maulidya — hotspot kosakata, dialog, misi, hasil (KF-VR-07..16).
(() => {
  const { viewer, locations, showFirstHelp, updateGuidance } = PasarBasaVR;
  const { data, audio, progress } = PasarBasa;
  const byId = (id) => document.getElementById(id);
  const panorama = byId("panorama");
  const panel = byId("vr-panel");
  const panelContent = byId("vr-panel-content");
  const story = byId("vr-story");
  const conversation = byId("vr-conversation");
  const speech = byId("vr-seller-line");
  const art = byId("vr-seller-art");
  const responseSlot = byId("vr-response-slot");
  const glossary = byId("vr-glossary");
  const audioToggle = byId("vr-audio-toggle");
  const questionReplay = byId("vr-play-question");
  const audioStatus = byId("vr-audio-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const missionKey = "pasarbasa:vr-mission";
  let activeConversation = null;

  function volumeIcon(muted = false) {
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      '<path d="M11 5 6 9H3v6h3l5 4V5Z"/>' + (muted
        ? '<path d="m16 9 5 6m0-6-5 6"/>'
        : '<path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9.2 9.2 0 0 1 0 13"/>') + '</svg>';
  }

  const items = {
    cabai: { label: "Cabai", term: "lombok", seller: "bu-sari", quantity: 1 },
    tomat: { label: "Tomat", term: "tomat", seller: "bu-sari", quantity: 1 },
    pisang: { label: "3 buah pisang", term: "pisang", seller: "pak-budi", quantity: 3 },
  };
  const itemIds = Object.keys(items);

  const sellers = {
    "bu-sari": { scene: "kios-sayur", pitch: -4.58, yaw: -0.80, id: "bu-sari", seller: "Bu Sari", label: "Bicara dengan Bu Sari", scenario: "beli-cabai" },
    "pak-budi": { scene: "kios-buah", pitch: -19.11, yaw: 15.12, id: "pak-budi", seller: "Pak Budi", label: "Bicara dengan Pak Budi", scenario: "beli-pisang" },
  };

  const practicedVocabulary = {
    "bu-sari": ["sugeng enjing", "tumbas", "lombok", "tomat", "ugi", "pinten reginipun sedaya", "menika artanipun", "matur nuwun"],
    "pak-budi": ["sugeng enjing", "tumbas", "pisang", "tiga", "nyuwun dipunbungkus", "menika artanipun", "matur nuwun"],
  };

  const spots = [
    { scene: "kios-sayur", pitch: -23.12, yaw: -45.18, id: "cabai", label: "Belajar cabai" },
    { scene: "kios-sayur", pitch: -29.55, yaw: -28.77, id: "tomat", label: "Belajar tomat" },
    { scene: "kios-buah", pitch: -21.83, yaw: 39.76, id: "pisang", label: "Belajar pisang" },
    ...Object.values(sellers),
  ];

  const lessons = {
    cabai: {
      sentence: "Kula badhe tumbas lombok.",
      meaning: "Saya ingin membeli cabai.",
      words: [["Kula", "Saya"], ["Badhe", "Ingin"], ["Tumbas", "Membeli"], ["Lombok", "Cabai"]],
      ngoko: "Aku arep tuku lombok.",
      use: "Pakai lombok saat memesan cabai kepada Bu Sari.",
    },
    tomat: {
      sentence: "Kula badhe tumbas tomat ugi, Bu.",
      meaning: "Saya ingin membeli tomat juga, Bu.",
      words: [["Tomat", "Tomat"], ["Uga", "Juga (ngoko)"], ["Ugi", "Juga (krama)"], ["Tumbas", "Membeli"]],
      ngoko: "Aku arep tuku tomat uga, Bu.",
      use: "Gunakan ugi untuk menambahkan tomat. Tanyakan Pinten reginipun sedaya? untuk mengetahui total harga.",
    },
    pisang: {
      sentence: "Kula badhe tumbas pisang tiga.",
      meaning: "Saya ingin membeli tiga pisang.",
      words: [["Gedhang", "Pisang (ngoko)"], ["Pisang", "Pisang (krama)"], ["Telu", "Tiga (ngoko)"], ["Tiga", "Tiga (krama)"], ["Tumbas", "Membeli"]],
      ngoko: "Aku arep tuku gedhang telu.",
      use: "Gunakan pisang dan tiga dalam basa krama saat memesan kepada Pak Budi.",
    },
  };

  function freshMission() {
    return {
      version: 1,
      introSeen: false,
      briefingDone: false,
      arOpened: false,
      scene: "pintu",
      learned: [],
      transactions: {
        "bu-sari": { turn: 0, selected: null, completed: false },
        "pak-budi": { turn: 0, selected: null, quantity: 1, completed: false },
      },
      purchased: {},
      attempts: [],
      quiz: { started: false, index: 0, answers: [] },
      completed: false,
    };
  }

  function readMission() {
    try {
      const saved = JSON.parse(localStorage.getItem(missionKey));
      if (saved?.version === 1) return saved;
    } catch {
      // Tur dapat dijalankan di memori saat penyimpanan tidak tersedia.
    }
    return freshMission();
  }

  let mission = readMission();

  function saveMission() {
    try {
      localStorage.setItem(missionKey, JSON.stringify(mission));
    } catch {
      // Progres sesi saat ini tetap dapat digunakan.
    }
  }

  function markShared(activity) {
    if (!progress.get().done.includes(activity)) progress.mark(activity);
  }

  function wordRows(words) {
    return words.map(([word, meaning]) => '<div><dt lang="jv">' + word + "</dt><dd>" + meaning + "</dd></div>").join("");
  }

  function buyingCount() {
    return itemIds.filter((id) => mission.purchased[id] === items[id].quantity).length;
  }

  function canStartQuiz() {
    return buyingCount() === itemIds.length;
  }

  function canShowResults() {
    return mission.completed && canStartQuiz() && mission.quiz.index === vrQuestions.length;
  }

  function shoppingList(showLearned = false) {
    return '<ul class="vr-activity-list">' + itemIds.map((id) => {
      const item = items[id];
      const bought = mission.purchased[id] === item.quantity;
      const studyStatus = mission.learned.includes(id) ? "Sudah dipelajari" : "Belum dipelajari";
      return '<li><span>' + item.label + (showLearned ? '<small>' + studyStatus + '</small>' : '')
        + '</span><strong data-complete="' + bought + '">' + (bought ? "Sudah dibeli" : "Belum dibeli") + "</strong></li>";
    }).join("") + "</ul>";
  }

  function showStory(html, phase) {
    story.dataset.phase = phase;
    story.innerHTML = html;
    if (!story.open) story.showModal();
    byId("vr-story-title").focus({ preventScroll: true });
    story.scrollTop = 0;
  }

  function showIntroduction() {
    showStory(
      '<div class="vr-story-grid">' +
        '<div class="vr-story-copy">' +
          '<p class="vr-story-kicker">Tugas belanja dari Ibu</p>' +
          '<h1 id="vr-story-title" tabindex="-1">Misi Belanja <span lang="jv">ing</span> Pasar Basa</h1>' +
          '<blockquote>“Nadia, tolong belikan Ibu cabai, tomat, dan tiga buah pisang di pasar, ya.”</blockquote>' +
          '<div class="vr-actions"><button class="vr-btn vr-action" id="vr-start-adventure" type="button">Mulai Petualangan</button>' +
          '<a class="vr-btn vr-secondary" href="../index.html">Kembali ke Beranda</a></div>' +
        '</div>' +
        '<img class="vr-nadia" src="../assets/nadia.webp" alt="" width="600" height="800">' +
      '</div>', "intro");
    byId("vr-start-adventure").onclick = () => {
      mission.introSeen = true;
      saveMission();
      showBriefing();
    };
  }

  function showBriefing() {
    showStory(
      '<div class="vr-briefing">' +
        '<p class="vr-story-kicker">Misi Belanja <span lang="jv">ing</span> Pasar Basa</p>' +
        '<h1 id="vr-story-title" tabindex="-1">Briefing misi</h1>' +
        '<p>Kenali nama barang, lalu praktikkan bahasa Jawa krama untuk memesan, menanyakan harga, dan membayar.</p>' +
        '<p class="vr-ar-note">Materi bahasa Jawa masih berupa draf dan menunggu validasi.</p>' +
        '<div class="vr-briefing-grid">' +
          '<section><h2>Daftar belanja</h2>' + shoppingList() + '</section>' +
          '<section><h2>Cara menjelajahi pasar</h2>' +
            '<ul><li>Geser panorama untuk melihat sekeliling. Gunakan + dan − untuk zoom.</li>' +
              '<li>Pilih panah untuk pindah lokasi atau gunakan tombol Kembali.</li>' +
              '<li>Ikon barang membuka kosakata. Balon percakapan memulai transaksi dengan penjual.</li></ul></section>' +
        '</div>' +
        '<p class="vr-ar-note">Kartu AR membantu mengenalkan kata. AR terbuka di tab baru. Kamu juga bisa langsung berlatih di pasar VR.</p>' +
        '<div class="vr-actions">' +
          '<a class="vr-btn vr-secondary" id="vr-open-ar" href="../ar/index.html" target="_blank" rel="noopener">Pelajari Kosakata dengan AR</a>' +
          '<button class="vr-btn vr-action" id="vr-enter-market" type="button">Langsung Masuk Pasar VR</button>' +
        '</div>' +
      '</div>', "briefing");
    byId("vr-open-ar").onclick = () => {
      mission.arOpened = true;
      saveMission();
    };
    byId("vr-enter-market").onclick = () => {
      mission.briefingDone = true;
      saveMission();
      story.close();
      panorama.focus({ preventScroll: true });
      showFirstHelp();
    };
  }

  spots.forEach((spot) => viewer.addHotSpot({
    id: spot.id,
    pitch: spot.pitch,
    yaw: spot.yaw,
    type: "info",
    cssClass: "pb-hotspot",
    createTooltipFunc: (container) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vr-hotspot-button";
      button.textContent = spot.seller ? "💬" : "📖";
      button.dataset.hotspot = spot.id;
      button.title = spot.label;
      button.setAttribute("aria-label", spot.label);
      button.setAttribute("aria-haspopup", "dialog");
      if (spot.seller) {
        button.dataset.seller = spot.seller;
        button.dataset.label = spot.seller;
      } else {
        button.dataset.label = spot.label;
      }
      button.onclick = () => {
        if (spot.seller) openConversation(spot, button);
        else openVocab(spot.id);
      };
      container.append(button);
    },
  }, spot.scene));

  function showPanel(html, kind = "mission") {
    if (panel.dataset.kind === "vocab") audio.stop();
    panel.dataset.kind = kind;
    panelContent.innerHTML = html;
    if (!panel.open) panel.showModal();
    panel.scrollTop = 0;
  }

  async function openVocab(id) {
    const lesson = lessons[id];
    const seller = sellers[items[id].seller];
    showPanel('<div class="vr-vocab-body"><h2 id="vr-panel-title">Kosakata pasar</h2><p role="status">Memuat kosakata…</p></div>', "vocab");
    const status = panel.querySelector('[role="status"]');
    try {
      await data.loadVocab();
    } catch {
      if (panel.open && status.isConnected) status.textContent = "Kosakata gagal dimuat. Tutup panel dan coba lagi.";
      return;
    }
    if (!panel.open || !status.isConnected) return;
    const vocab = data.getVocab(id);
    if (!vocab) {
      status.textContent = "Kosakata ini belum tersedia.";
      return;
    }

    const learned = mission.learned.includes(id);
    const hasAudio = Boolean(vocab.audio);
    showPanel(`
      <header class="vr-vocab-header">
        <img src="../assets/illustrations/${id}.svg" width="56" height="56" alt="">
        <div class="vr-vocab-names">
          <span class="vr-vocab-register">Ngoko</span>
          <h2 id="vr-panel-title" lang="jv"></h2>
          <p class="vr-vocab-meaning"></p>
        </div>
        <div class="vr-pronunciation" role="group" aria-label="Kontrol pelafalan">
          <button class="vr-btn" id="vr-pronunciation" type="button" ${hasAudio ? '' : 'disabled'}>${volumeIcon()}</button>
          <button class="vr-btn vr-secondary" id="vr-vocab-toggle" type="button" aria-label="Audio kosakata"></button>
        </div>
        <span id="vr-audio-note" class="vr-vocab-audio-status" role="status">${hasAudio ? '' : 'Rekaman belum tersedia.'}</span>
      </header>
      <div class="vr-vocab-body">
        <section>
          <h3>Contoh percakapan</h3>
          <p class="vr-example-meaning">${lesson.meaning}</p>
          <dl class="vr-registers" aria-label="Perbandingan krama dan ngoko">
            <div class="vr-register-krama"><dt>Krama</dt><dd lang="jv">${lesson.sentence}</dd></div>
            <div class="vr-register-ngoko"><dt>Ngoko</dt><dd lang="jv">${lesson.ngoko}</dd></div>
          </dl>
        </section>
        <section>
          <h3>Arti kata</h3>
          <dl class="vr-words">${wordRows(lesson.words)}</dl>
        </section>
        <section class="vr-vocab-tip">
          <h3>Tips belanja</h3>
          <p>${lesson.use}</p>
        </section>
      </div>
      <footer class="vr-actions vr-vocab-actions">
        <button class="vr-btn vr-action" id="pb-learned" type="button" ${learned ? 'disabled' : ''}>Sudah Dipelajari</button>
        <button class="vr-btn vr-secondary" id="vr-practice" type="button">Praktik Bersama Penjual</button>
      </footer>`, "vocab");

    const word = vocab.jawa[0].toUpperCase() + vocab.jawa.slice(1);
    byId("vr-panel-title").textContent = word;
    panelContent.querySelector(".vr-vocab-meaning").textContent = "Bahasa Indonesia · " + vocab.indonesia[0].toUpperCase() + vocab.indonesia.slice(1);
    const pronunciation = byId("vr-pronunciation");
    pronunciation.title = hasAudio ? `Dengarkan ${word} (ngoko)` : "Rekaman belum tersedia";
    pronunciation.setAttribute("aria-label", pronunciation.title);
    if (hasAudio) pronunciation.dataset.available = "true";
    pronunciation.onclick = () => {
      vrDialogueAudio.stop();
      audio.play(id);
    };
    byId("vr-vocab-toggle").onclick = toggleAudio;
    updateAudioControls();
    byId("pb-learned").onclick = (event) => {
      if (mission.learned.includes(id)) return;
      mission.learned.push(id);
      saveMission();
      markShared("vocab:" + id);
      updateBar();
      event.currentTarget.disabled = true;
      byId("vr-practice").focus();
    };
    byId("vr-practice").onclick = () => {
      panel.close();
      openConversation(seller, document.activeElement);
    };
  }

  function openConversation(spot, trigger) {
    if (activeConversation || !viewer.isLoaded() || viewer.getScene() !== spot.scene) return;
    if (mission.transactions[spot.id].completed) {
      showShoppingList();
      return;
    }
    const session = { spot, trigger, restoreOrientation: viewer.isOrientationActive() };
    activeConversation = session;

    byId("vr-seller-name").textContent = spot.seller;
    byId("vr-conversation-location").textContent = locations[spot.scene];
    art.src = "../assets/" + spot.id + ".webp";
    renderTurn(session);

    conversation.showModal();
    panorama.classList.add("vr-conversing");
    if (session.restoreOrientation) viewer.stopOrientation();
    viewer.stopMovement();
    viewer.lookAt(spot.pitch, spot.yaw, undefined, reducedMotion.matches ? false : 520);
  }

  function renderTurn(session, focusTarget) {
    const { spot } = session;
    const transaction = mission.transactions[spot.id];
    const turns = vrTransactions[spot.id];
    const turn = turns[transaction.turn];
    byId("vr-turn").textContent = "Giliran " + (transaction.turn + 1) + "/" + turns.length;
    byId("vr-transaction-goal").textContent = turn.goal;
    byId("vr-transaction-progress").textContent = "Belanja " + buyingCount() + "/" + itemIds.length;
    speech.innerHTML = '<div class="pb-seller" lang="jv">' + turn.line + '</div><div class="pb-arti">' + turn.translation + "</div>";
    glossary.open = false;
    glossary.parentElement.scrollTop = 0;
    const words = spot.id === "pak-budi" && transaction.turn === 0
      ? [...turn.words, ["Gedhang", "Pisang (ngoko)"]]
      : turn.words;
    byId("vr-glossary-words").innerHTML = wordRows(words);
    renderResponses(session, focusTarget);
    playDialogueAudio(vrDialogueAudio.clips(spot.id, transaction.turn).question);
  }

  function playDialogueAudio(...paths) {
    audio.stop();
    vrDialogueAudio.play(paths, (message) => { audioStatus.textContent = message; });
  }

  function updateAudioControls() {
    const enabled = audio.isEnabled();
    audioToggle.setAttribute("aria-pressed", String(enabled));
    audioToggle.textContent = enabled ? "Aktif" : "Mati";
    questionReplay.disabled = !enabled;
    responseSlot.querySelectorAll("[data-vr-replay]").forEach((button) => { button.disabled = !enabled; });
    const vocabToggle = byId("vr-vocab-toggle");
    if (vocabToggle) {
      vocabToggle.setAttribute("aria-pressed", String(enabled));
      vocabToggle.title = enabled ? "Bisukan audio kosakata" : "Aktifkan audio kosakata";
      vocabToggle.innerHTML = volumeIcon(enabled) + `<span aria-hidden="true">${enabled ? "Bisukan" : "Aktifkan"}</span>`;
      const pronunciation = byId("vr-pronunciation");
      pronunciation.disabled = !enabled || pronunciation.dataset.available !== "true";
    }
  }

  function renderResponses(session, focusTarget) {
    const { spot } = session;
    const transaction = mission.transactions[spot.id];
    const turnIndex = transaction.turn;
    const turns = vrTransactions[spot.id];
    const turn = turns[turnIndex];
    const clips = vrDialogueAudio.clips(spot.id, turnIndex);
    const selected = transaction.selected;
    const answered = selected !== null;
    const correct = selected === (turn.quantity ?? turn.answer);
    const lastTurn = turnIndex === turns.length - 1;
    const feedback = answered ? (turn.quantity
      ? (correct ? "Kamu memilih tiga pisang. Telu adalah ngoko dan tiga adalah krama."
        : "Kamu memilih " + selected + " buah. Ibu meminta tiga pisang. Telu dalam ngoko dan tiga dalam krama.")
      : turn.options[selected][1]) : "";

    byId("vr-response-title").textContent = turn.quantity ? "Jumlah pisang" : "Jawaban Nadia";
    const controls = turn.quantity
      ? '<div class="vr-quantity">' +
          '<button type="button" data-delta="-1" aria-label="Kurangi jumlah pisang">−</button>' +
          '<output id="vr-quantity" aria-live="polite">' + transaction.quantity + '</output>' +
          '<button type="button" data-delta="1" aria-label="Tambah jumlah pisang">+</button>' +
        '</div><p class="vr-number-note" id="vr-number-note"></p>' +
        '<button type="button" class="pb-next" id="vr-confirm-quantity"' + (answered ? " disabled" : "") + '>Konfirmasi jumlah</button>'
      : turn.options.map(([text], index) => '<button type="button" lang="jv" data-choice="' + index + '"' +
        (answered ? " disabled" : "") + (selected === index ? ' class="' + (correct ? "ok" : "bad") + '"' : "") + ">" + text + "</button>").join("");

    responseSlot.innerHTML = '<div class="pb-dialog">' + controls + (answered
      ? '<div class="pb-fb" id="vr-turn-feedback" data-outcome="' + (correct ? "correct" : "incorrect") + '" role="status">' +
          '<strong>' + (correct ? "Tepat" : "Kurang tepat") + '</strong>' + feedback +
          (correct ? '<p class="vr-seller-reply"><strong>' + spot.seller + '</strong><span lang="jv">' + turn.reply[0] +
            '</span><small>' + turn.reply[1] + '</small></p>' : '') +
        '</div>' + (correct ? '<div class="vr-replays" role="group" aria-label="Putar ulang rekaman jawaban">' +
          '<button type="button" data-vr-replay="answer">Putar jawaban Nadia</button>' +
          '<button type="button" data-vr-replay="reply">Putar respons penjual</button></div>' : '') +
        '<button class="pb-next" id="vr-next-turn" type="button" aria-describedby="vr-turn-feedback">' +
          (correct ? (lastTurn ? "Selesaikan Transaksi" : "Lanjutkan Percakapan") : "Coba Lagi") + "</button>"
      : '') + '</div>';

    function submit(value, text) {
      if (activeConversation !== session || transaction.turn !== turnIndex || transaction.selected !== null) return;
      const isCorrect = value === (turn.quantity ?? turn.answer);
      transaction.selected = value;
      mission.attempts.push({ seller: spot.id, turn: turnIndex, choice: value, correct: isCorrect });
      saveMission();
      progress.recordDialog({ id: spot.scenario, teks: text, benar: isCorrect });
      renderResponses(session, "#vr-next-turn");
      if (isCorrect) playDialogueAudio(clips.answer, clips.reply);
    }

    responseSlot.querySelectorAll("[data-vr-replay]").forEach((button) => {
      button.onclick = () => playDialogueAudio(clips[button.dataset.vrReplay]);
    });
    updateAudioControls();

    if (turn.quantity) {
      const less = responseSlot.querySelector('[data-delta="-1"]');
      const more = responseSlot.querySelector('[data-delta="1"]');
      function displayQuantity() {
        const count = transaction.quantity;
        byId("vr-quantity").textContent = count;
        byId("vr-number-note").textContent = count === turn.quantity ? "Telu (ngoko) · tiga (krama)" : "buah pisang";
        less.disabled = answered || count <= 1;
        more.disabled = answered || count >= 9;
      }
      for (const button of [less, more]) {
        button.onclick = () => {
          if (activeConversation !== session || transaction.turn !== turnIndex || transaction.selected !== null || button.disabled) return;
          transaction.quantity += Number(button.dataset.delta);
          saveMission();
          displayQuantity();
          if (button.disabled) (button === less ? more : less).focus();
        };
      }
      displayQuantity();
      byId("vr-confirm-quantity").onclick = () => submit(transaction.quantity, transaction.quantity + " buah pisang");
    } else {
      responseSlot.querySelectorAll("[data-choice]").forEach((button) => {
        button.onclick = () => submit(Number(button.dataset.choice), button.textContent);
      });
    }

    if (answered) {
      byId("vr-next-turn").onclick = () => {
        if (activeConversation !== session || transaction.turn !== turnIndex || transaction.selected !== selected) return;
        transaction.selected = null;
        if (correct) transaction.turn += 1;
        if (correct && lastTurn) {
          finishTransaction(spot);
          return;
        }
        saveMission();
        if (correct) renderTurn(session, turnFocus(turns[transaction.turn]));
        else renderResponses(session, turnFocus(turn));
      };
    }

    const responses = responseSlot.parentElement;
    if (focusTarget) {
      responses.scrollTop = 0;
      responseSlot.querySelector(focusTarget)?.focus();
    }
  }

  function turnFocus(turn) {
    return turn.quantity ? '[data-delta="1"]' : "[data-choice]";
  }

  function closeConversation() {
    if (!activeConversation) return;
    const { trigger, restoreOrientation } = activeConversation;
    activeConversation = null;
    vrDialogueAudio.stop();
    viewer.stopMovement();
    panorama.classList.remove("vr-conversing");
    conversation.close();
    responseSlot.replaceChildren();
    speech.replaceChildren();
    art.removeAttribute("src");
    if (restoreOrientation) viewer.startOrientation();
    const focus = trigger?.isConnected && getComputedStyle(trigger).visibility === "visible" ? trigger : panorama;
    focus.focus({ preventScroll: true });
    updateBar();
  }

  function finishTransaction(spot) {
    mission.transactions[spot.id].completed = true;
    for (const id of itemIds) {
      const item = items[id];
      if (item.seller === spot.id) mission.purchased[id] = item.quantity;
    }
    saveMission();
    markShared("dialog:" + spot.scenario);
    closeConversation();
    if (canStartQuiz()) {
      showShoppingList();
      return;
    }

    const bought = spot.id === "bu-sari" ? "Cabai dan tomat sudah dibeli." : "Tiga buah pisang sudah dibeli.";
    showPanel('<h2 id="vr-panel-title">Transaksi selesai</h2><p>' + bought + '</p><p>' + nextObjective() +
      '</p><button class="vr-btn vr-action" id="vr-resume-exploration" type="button">Lanjut Eksplorasi</button>');
    byId("vr-resume-exploration").onclick = () => panel.close();
  }

  function nextSeller() {
    const localSeller = Object.values(sellers).find((spot) => spot.scene === viewer.getScene());
    if (localSeller && !mission.transactions[localSeller.id].completed) return localSeller;
    return mission.transactions["bu-sari"].completed ? sellers["pak-budi"] : sellers["bu-sari"];
  }

  function hasTurnToResume(spot) {
    const transaction = mission.transactions[spot.id];
    return transaction.turn > 0 || transaction.selected !== null;
  }

  function nextObjective() {
    if (canShowResults()) return "Lihat hasil misi.";
    if (canStartQuiz()) return mission.quiz.started ? "Lanjutkan tantangan bahasa." : "Mulai tantangan bahasa.";

    const scene = viewer.getScene();
    if (scene === "pintu") return "Masuk ke lorong pasar.";
    if (scene === "lorong") return "Menuju kios sayur.";
    const spot = nextSeller();
    if (scene !== spot.scene) {
      return spot.id === "bu-sari" ? "Temukan kios sayur." : "Lanjutkan ke kios buah.";
    }
    if (hasTurnToResume(spot)) return "Lanjutkan percakapan dengan " + spot.seller + ".";
    if (spot.id === "pak-budi") return "Bicara dengan Pak Budi untuk membeli tiga pisang.";
    return nextVegetable()
      ? "Pelajari cabai dan tomat, lalu bicara dengan Bu Sari."
      : "Ajak Bu Sari bicara.";
  }

  function nextVegetable() {
    return ["cabai", "tomat"].find((id) => !mission.learned.includes(id));
  }

  function guidanceSpot() {
    if (canStartQuiz()) return null;
    const seller = nextSeller();
    if (seller.id === "bu-sari" && viewer.getScene() === seller.scene && !hasTurnToResume(seller)) {
      const id = nextVegetable();
      if (id) return spots.find((spot) => spot.id === id);
    }
    return seller;
  }

  function showShoppingList() {
    const ready = canStartQuiz();
    const results = canShowResults();
    const spot = nextSeller();
    const action = results ? "Lihat Hasil Misi" : mission.quiz.started ? "Lanjutkan Tantangan Bahasa" : "Lanjut ke Tantangan Bahasa";
    const canTalk = !ready && viewer.isLoaded() && viewer.getScene() === spot.scene;
    const talkLabel = (hasTurnToResume(spot) ? "Lanjutkan Percakapan dengan " : "Bicara dengan ") + spot.seller;
    showPanel('<h2 id="vr-panel-title">' + (ready ? "Daftar Belanja Terpenuhi" : "Daftar belanja") + '</h2><p><strong>' +
      buyingCount() + "/" + itemIds.length + ' barang terkumpul</strong></p>' + shoppingList(!ready) +
      (ready ? '<button class="vr-btn vr-action" id="vr-shopping-action" type="button">' + action + '</button>'
        : '<p>' + nextObjective() + '</p>' + (canTalk
          ? '<button class="vr-btn vr-action" id="vr-shopping-action" type="button">' + talkLabel + '</button>' : '')));
    const button = byId("vr-shopping-action");
    if (button) button.onclick = () => {
      panel.close();
      if (results) showResults();
      else if (ready) startQuiz();
      else openConversation(spot, document.activeElement);
    };
  }

  function quizScore() {
    return mission.quiz.answers.filter((answer, index) => answer === vrQuestions[index].answer).length * 20;
  }

  function startQuiz() {
    if (!canStartQuiz() || canShowResults()) return;
    mission.quiz.started = true;
    saveMission();
    updateBar();
    renderQuiz();
  }

  function renderQuiz(focusNext = false) {
    const quiz = mission.quiz;
    const index = quiz.index;
    const question = vrQuestions[index];
    const answered = quiz.answers.length > index;
    const selected = quiz.answers[index];
    const correct = selected === question.answer;
    const last = index === vrQuestions.length - 1;

    showStory('<div class="vr-quiz">' +
      '<p class="vr-story-kicker">Soal ' + (index + 1) + "/" + vrQuestions.length + '</p>' +
      '<h1 id="vr-story-title" tabindex="-1">Tantangan Bahasa Akhir</h1>' +
      '<p class="vr-quiz-score">Skor <strong>' + quizScore() + '/100</strong></p>' +
      '<h2>' + question.question + '</h2><div class="vr-quiz-options">' +
      question.options.map((text, choice) => '<button type="button" data-answer="' + choice + '"' +
        (answered ? " disabled" : "") +
        (answered && choice === question.answer ? ' data-result="correct"' : (choice === selected ? ' data-result="incorrect"' : "")) +
        ">" + text + "</button>").join("") + "</div>" +
      (answered ? '<p class="vr-quiz-feedback" role="status" id="vr-quiz-feedback" data-result="' + (correct ? "correct" : "incorrect") +
        '"><strong>' + (correct ? "Tepat · +20 poin" : "Kurang tepat · 0 poin") + '</strong> ' + question.explanation + "</p>" : "") +
      '<div class="vr-actions">' +
      (answered ? '<button class="vr-btn vr-action" type="button" id="vr-next-question" aria-describedby="vr-quiz-feedback">' +
        (last ? "Lihat Hasil Misi" : "Soal Berikutnya") + "</button>" : "") +
      '<button class="vr-btn vr-secondary" id="vr-pause-quiz" type="button">Kembali ke Panorama</button></div></div>', "quiz");

    story.querySelectorAll("[data-answer]").forEach((button) => {
      button.onclick = () => {
        if (quiz.index !== index || quiz.answers.length !== index) return;
        quiz.answers.push(Number(button.dataset.answer));
        saveMission();
        renderQuiz(true);
      };
    });
    byId("vr-pause-quiz").onclick = () => story.close();
    if (answered) {
      const button = byId("vr-next-question");
      button.onclick = () => {
        if (quiz.index !== index || quiz.answers.length !== index + 1) return;
        quiz.index += 1;
        if (last) mission.completed = true;
        saveMission();
        if (last) {
          updateBar();
          showResults();
        } else renderQuiz();
      };
      if (focusNext) button.focus();
    }
  }

  function showResults() {
    if (!canShowResults()) return;
    const correct = mission.attempts.filter((attempt) => attempt.correct).length;
    const completed = Object.values(mission.transactions).filter((transaction) => transaction.completed).length;
    const learned = itemIds.filter((id) => mission.learned.includes(id))
      .map((id) => id === "pisang"
        ? '<span lang="jv">gedhang</span> (ngoko) / <span lang="jv">pisang</span> (krama)'
        : '<span lang="jv">' + items[id].term + '</span>').join(", ") || "Belum ada materi yang ditandai.";
    const practiced = new Set(Object.keys(practicedVocabulary)
      .filter((id) => mission.transactions[id].completed)
      .flatMap((id) => practicedVocabulary[id]));
    showStory('<div class="vr-story-grid vr-result"><div class="vr-story-copy">' +
      '<p class="vr-story-kicker">Misi Belanja <span lang="jv">ing</span> Pasar Basa</p>' +
      '<h1 id="vr-story-title" tabindex="-1">Misi Rampung</h1>' +
      '<div class="vr-result-totals"><strong>Daftar belanja ' + buyingCount() + "/" + itemIds.length +
      '</strong><strong>Skor tantangan ' + quizScore() + '/100</strong></div>' + shoppingList() +
      '<dl class="vr-result-details">' +
        '<div><dt>Transaksi</dt><dd>Bu Sari dan Pak Budi selesai</dd></div>' +
        '<div><dt>Percakapan selesai</dt><dd>' + completed + '</dd></div>' +
        '<div><dt>Materi hotspot dipelajari</dt><dd>' + learned + '</dd></div>' +
        '<div><dt>Kosakata dipraktikkan lewat dialog</dt><dd lang="jv">' + [...practiced].join(", ") + '</dd></div>' +
        '<div><dt>Jawaban latihan</dt><dd>' + correct + ' benar · ' + (mission.attempts.length - correct) + ' salah</dd></div>' +
      '</dl><div class="vr-actions">' +
        '<button class="vr-btn vr-action" id="pb-reset" type="button">Ulangi Misi</button>' +
        '<a class="vr-btn vr-secondary" href="../index.html">Kembali ke Beranda</a>' +
      '</div></div><img class="vr-nadia" src="../assets/nadia.webp" alt="" width="600" height="800"></div>', "result");
    byId("pb-reset").onclick = () => {
      vrDialogueAudio.stop();
      mission = freshMission();
      saveMission();
      window.location.reload();
    };
  }

  function updateBar() {
    const count = buyingCount();
    byId("vr-mission-count").textContent = count + "/" + itemIds.length;
    byId("vr-mission-meter").value = count;
    byId("vr-next-goal").textContent = nextObjective();
    updateGuidance(guidanceSpot());
  }

  byId("mission-bar").onclick = showShoppingList;
  byId("vr-close-panel").onclick = () => panel.close();
  panel.addEventListener("close", () => {
    if (!panel.open && panel.dataset.kind === "vocab") audio.stop();
  });
  byId("vr-end-conversation").onclick = closeConversation;
  questionReplay.onclick = () => {
    if (!activeConversation) return;
    const id = activeConversation.spot.id;
    playDialogueAudio(vrDialogueAudio.clips(id, mission.transactions[id].turn).question);
  };
  function toggleAudio() {
    audio.setEnabled(!audio.isEnabled());
    if (!audio.isEnabled()) {
      vrDialogueAudio.stop();
      audioStatus.textContent = "";
    }
    updateAudioControls();
  }
  audioToggle.onclick = toggleAudio;
  window.addEventListener("pb:audio", (event) => {
    const note = byId("vr-audio-note");
    if (!panel.open || !note) return;
    if (event.detail.message) note.textContent = event.detail.message;
    byId("vr-pronunciation").classList.toggle("is-playing", event.detail.state === "playing");
  });
  story.addEventListener("cancel", (event) => {
    if (story.dataset.phase === "intro" || story.dataset.phase === "briefing") event.preventDefault();
  });
  conversation.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeConversation();
  });
  viewer.on("scenechange", (id) => {
    audio.stop();
    closeConversation();
    if (panel.open && panel.dataset.kind === "vocab") panel.close();
    mission.scene = id;
    saveMission();
    updateBar();
  });

  const resumeScene = mission.scene;
  if (mission.briefingDone && Object.hasOwn(locations, resumeScene) && resumeScene !== viewer.getScene()) {
    if (viewer.isLoaded()) viewer.loadScene(resumeScene);
    else {
      const restoreScene = () => {
        viewer.off("load", restoreScene);
        viewer.loadScene(resumeScene);
      };
      viewer.on("load", restoreScene);
    }
  }

  updateBar();
  if (!mission.introSeen) showIntroduction();
  else if (!mission.briefingDone) showBriefing();
  else if (canShowResults()) showResults();
  else if (canStartQuiz() && mission.quiz.started) renderQuiz();
  else if (canStartQuiz()) showShoppingList();
})();
