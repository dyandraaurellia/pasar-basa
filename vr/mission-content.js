// Materi VR masih berupa draf dan perlu diverifikasi oleh penutur bahasa Jawa.
const vrTransactions = {
  "bu-sari": [
    {
      line: "Sugeng enjang, Mbak. Pados menapa?",
      translation: "Selamat pagi, Mbak. Cari apa?",
      goal: "Sapa Bu Sari dan pesan cabai dengan krama.",
      words: [["Sugeng enjang", "Selamat pagi"], ["Tumbas", "Membeli"], ["Lombok", "Cabai"]],
      options: [
        ["Sugeng enjang, Bu. Kula badhe tumbas lombok.", "Kamu menyapa Bu Sari dan menggunakan tumbas (membeli) serta lombok (cabai)."],
        ["Heh, aku arep tuku lombok.", "Pesanannya sesuai. Untuk latihan ini, sapa Bu Sari dan gunakan ragam krama."],
        ["Lombok pira?", "Kalimat ini menanyakan harga cabai. Sampaikan dulu barang yang ingin kamu beli."],
      ],
      answer: 0,
      reply: ["Inggih, lombokipun kula pendhetaken.", "Baik, saya ambilkan cabainya."],
    },
    {
      line: "Menapa wonten tambahan, Mbak?",
      translation: "Ada tambahan, Mbak?",
      goal: "Tambahkan tomat ke pesanan.",
      words: [["Tambahan", "Tambahan"], ["Ugi", "Juga"], ["Tomat", "Tomat"]],
      options: [
        ["Boten, Bu. Sampun cekap.", "Kamu mengatakan pesanan sudah cukup. Ibu juga menitipkan tomat."],
        ["Tomatipun ugi, Bu.", "Ugi berarti juga. Kamu menambahkan tomat ke pesanan cabai."],
        ["Gedhangipun ugi, Bu.", "Gedhang berarti pisang. Tambahkan tomat saat berbelanja di kios sayur."],
      ],
      answer: 1,
      reply: ["Inggih, kula tambahaken tomat.", "Baik, saya tambahkan tomat."],
    },
    {
      line: "Lombok saha tomat sampun siap, Mbak.",
      translation: "Cabai dan tomat sudah siap, Mbak.",
      goal: "Tanyakan total harga cabai dan tomat.",
      words: [["Pinten", "Berapa (krama)"], ["Reginipun", "Harganya"], ["Sedaya", "Semua"]],
      options: [
        ["Kula badhe tumbas lombok, Bu.", "Kalimat ini memesan cabai. Pesanan sudah siap, jadi sekarang tanyakan total harganya."],
        ["Pinten reginipun tomat, Bu?", "Kamu sudah memakai ungkapan untuk bertanya harga, tetapi baru menanyakan harga tomat."],
        ["Pinten reginipun sedaya, Bu?", "Pinten reginipun menanyakan harga. Sedaya mencakup semua barang dalam pesanan."],
      ],
      answer: 2,
      reply: ["Sedayanipun Rp15.000, Mbak.", "Totalnya Rp15.000, Mbak."],
    },
    {
      line: "Sedayanipun Rp15.000. Badhe mbayar sapunika, Mbak?",
      translation: "Totalnya Rp15.000. Mau membayar sekarang, Mbak?",
      goal: "Setujui pembayaran dan ucapkan terima kasih.",
      words: [["Inggih", "Iya"], ["Menika artanipun", "Ini uangnya"], ["Matur nuwun", "Terima kasih"]],
      options: [
        ["Boten tumbas, Bu.", "Boten tumbas berarti tidak jadi membeli. Misi Nadia meminta cabai dan tomat."],
        ["Inggih, Bu. Menika artanipun. Matur nuwun.", "Kamu menyetujui pembelian, menyerahkan uang, dan menutup transaksi dengan sopan."],
        ["Pados menapa, Bu?", "Kalimat ini bertanya apa yang sedang dicari. Bu Sari sedang menunggu pembayaran."],
      ],
      answer: 1,
      reply: ["Matur nuwun, Mbak. Menika lombok saha tomatipun.", "Terima kasih, Mbak. Ini cabai dan tomatnya."],
    },
  ],
  "pak-budi": [
    {
      line: "Badhe tumbas menapa, Mbak?",
      translation: "Ingin membeli apa, Mbak?",
      goal: "Pesan pisang dengan krama.",
      words: [["Badhe", "Ingin"], ["Tumbas", "Membeli"], ["Gedhang", "Pisang"]],
      options: [
        ["Kula badhe tumbas lombok, Pak.", "Lombok berarti cabai. Gunakan gedhang untuk memesan pisang."],
        ["Kula badhe tumbas gedhang, Pak.", "Gedhang berarti pisang. Kamu sudah memesan barang yang tepat dengan krama."],
        ["Aku arep tuku gedhang.", "Barangnya tepat. Untuk latihan krama, gunakan kula badhe tumbas."],
      ],
      answer: 1,
      reply: ["Inggih, wonten gedhang, Mbak.", "Baik, ada pisang, Mbak."],
    },
    {
      line: "Badhe tumbas gedhang pinten, Mbak?",
      translation: "Mau membeli berapa buah pisang, Mbak?",
      goal: "Pilih jumlah pisang sesuai daftar belanja.",
      words: [["Pinten", "Berapa (krama)"], ["Telu", "Tiga (ngoko)"], ["Tiga", "Tiga (krama)"]],
      quantity: 3,
      reply: ["Inggih, gedhang tiga.", "Baik, tiga buah pisang."],
    },
    {
      line: "Gedhangipun badhe dipunbungkus, Mbak?",
      translation: "Pisangnya mau dibungkus, Mbak?",
      goal: "Minta pisang dibungkus untuk dibawa pulang.",
      words: [["Dipunbungkus", "Dibungkus"], ["Inggih", "Iya"], ["Boten", "Tidak"]],
      options: [
        ["Inggih, dipunbungkus, Pak.", "Kamu menyetujui dan meminta pisangnya dibungkus dengan sopan."],
        ["Boten, Pak.", "Boten berarti tidak. Nadia ingin membawa pulang pesanannya dalam bungkusan."],
        ["Gedhang tiga, Pak.", "Kamu mengulangi jumlah pisang. Pak Budi sedang menanyakan apakah pisangnya perlu dibungkus."],
      ],
      answer: 0,
      reply: ["Inggih, kula bungkus rumiyin.", "Baik, saya bungkus dulu."],
    },
    {
      line: "Sampun kula bungkus. Sedayanipun Rp9.000, Mbak.",
      translation: "Sudah saya bungkus. Totalnya Rp9.000, Mbak.",
      goal: "Bayar sesuai total harga dan berterima kasih.",
      words: [["Sedayanipun", "Totalnya"], ["Menika artanipun", "Ini uangnya"], ["Matur nuwun", "Terima kasih"]],
      options: [
        ["Pinten reginipun, Pak?", "Ini cara menanyakan harga. Pak Budi sudah menyebut total Rp9.000, jadi kamu bisa membayar."],
        ["Boten tumbas, Pak.", "Kamu mengatakan tidak jadi membeli. Selesaikan pesanan tiga pisang dengan membayar."],
        ["Inggih, Pak. Menika artanipun. Matur nuwun.", "Kamu menerima harga yang disebutkan, membayar, dan mengucapkan terima kasih."],
      ],
      answer: 2,
      reply: ["Menika gedhangipun. Matur nuwun, Mbak.", "Ini pisangnya. Terima kasih, Mbak."],
    },
  ],
};

const vrQuestions = [
  {
    question: "Apa arti gedhang dalam bahasa Indonesia?",
    options: ["Cabai", "Pisang", "Tomat"],
    answer: 1,
    explanation: "Gedhang berarti pisang. Kamu memakai kata ini saat memesan di kios Pak Budi.",
  },
  {
    question: "Kata mana yang berarti membeli dalam ragam krama?",
    options: ["Tumbas", "Pinten", "Lombok"],
    answer: 0,
    explanation: "Tumbas berarti membeli dalam krama. Bentuk ngokonya adalah tuku.",
  },
  {
    question: "Apa padanan telu dalam ragam krama?",
    options: ["Telu", "Pinten", "Tiga"],
    answer: 2,
    explanation: "Telu adalah bentuk ngoko dan tiga adalah bentuk krama untuk angka 3.",
  },
  {
    question: "Apa yang kamu ucapkan untuk menanyakan total harga?",
    options: ["Matur nuwun.", "Pinten reginipun sedaya?", "Badhe tumbas menapa?"],
    answer: 1,
    explanation: "Pinten berarti berapa, reginipun berarti harganya, dan sedaya berarti semua.",
  },
  {
    question: "Bagaimana kamu mengucapkan terima kasih setelah membayar?",
    options: ["Menika artanipun.", "Sugeng enjang.", "Matur nuwun."],
    answer: 2,
    explanation: "Matur nuwun berarti terima kasih dan dipakai untuk menutup transaksi dengan sopan.",
  },
];
