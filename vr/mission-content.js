// Pasar Basa - Materi Pembelajaran Unggah-Ungguh Basa
// Dialog utama menggunakan basa krama.
// Basa ngoko digunakan sebagai pengecoh edukatif.
// Draf: materi perlu divalidasi sebelum perekaman audio.

const vrTransactions = {
  "bu-sari": [
    {
      line: "Sugeng enjing, Mbak. Badhe tumbas menapa?",
      translation: "Selamat pagi, Mbak. Ingin membeli apa?",
      goal: "Sapa Bu Sari dan pesan cabai menggunakan basa krama.",
      words: [
        ["Sugeng enjing", "Selamat pagi"],
        ["Tumbas", "Membeli"],
        ["Lombok", "Cabai"]
      ],
      options: [
        [
          "Sugeng enjing, Bu. Kula badhe tumbas lombok.",
          "Benar! Kamu menyapa Bu Sari dan memesan cabai menggunakan basa krama."
        ],
        [
          "Aku arep tuku lombok, Bu.",
          "Barang yang kamu pesan sudah benar, tetapi kalimat tersebut menggunakan basa ngoko. Gunakan kula badhe tumbas."
        ],
        [
          "Kula badhe tumbas pisang, Bu.",
          "Bahasamu sudah sopan, tetapi barang yang harus dibeli adalah cabai."
        ]
      ],
      answer: 0,
      reply: [
        "Inggih, sekedhap, Mbak.",
        "Baik, sebentar, Mbak."
      ]
    },
    {
      line: "Badhe tumbas menapa malih, Mbak?",
      translation: "Ingin membeli apa lagi, Mbak?",
      goal: "Tambahkan tomat ke pesanan menggunakan basa krama.",
      words: [
        ["Menapa", "Apa"],
        ["Malih", "Lagi"],
        ["Ugi", "Juga"]
      ],
      options: [
        [
          "Aku arep tuku tomat uga, Bu.",
          "Pesananmu benar, tetapi kalimat tersebut menggunakan basa ngoko."
        ],
        [
          "Kula badhe tumbas tomat ugi, Bu.",
          "Benar! Kamu menambahkan tomat ke pesanan menggunakan basa krama."
        ],
        [
          "Boten, Bu. Sampun cekap.",
          "Bahasamu sudah sopan, tetapi kamu masih perlu membeli tomat."
        ]
      ],
      answer: 1,
      reply: [
        "Inggih, Mbak.",
        "Baik, Mbak."
      ]
    },
    {
      line: "Sampun, Mbak.",
      translation: "Sudah, Mbak.",
      goal: "Tanyakan total harga cabai dan tomat.",
      words: [
        ["Pinten", "Berapa"],
        ["Reginipun", "Harganya"],
        ["Sedaya", "Semua"]
      ],
      options: [
        [
          "Pira regane kabeh, Bu?",
          "Maksud pertanyaanmu benar, tetapi masih menggunakan basa ngoko."
        ],
        [
          "Pinten reginipun tomat, Bu?",
          "Kamu hanya menanyakan harga tomat, bukan seluruh pesanan."
        ],
        [
          "Pinten reginipun sedaya, Bu?",
          "Benar! Kamu menanyakan total harga seluruh pesanan menggunakan basa krama."
        ]
      ],
      answer: 2,
      reply: [
        "Gangsal welas ewu rupiyah, Mbak.",
        "Lima belas ribu rupiah, Mbak."
      ]
    },
    {
      line: "Sedayanipun gangsal welas ewu rupiyah, Mbak.",
      translation: "Totalnya lima belas ribu rupiah, Mbak.",
      goal: "Bayar pesanan dan ucapkan terima kasih.",
      words: [
        ["Inggih", "Iya"],
        ["Menika artanipun", "Ini uangnya"],
        ["Matur nuwun", "Terima kasih"]
      ],
      options: [
        [
          "Iyo, Bu. Iki dhuwite. Matur nuwun.",
          "Maksudmu sudah benar, tetapi gunakan inggih dan menika artanipun agar sesuai dengan basa krama."
        ],
        [
          "Inggih, Bu. Menika artanipun. Matur nuwun.",
          "Benar! Kamu membayar pesanan dan mengucapkan terima kasih dengan sopan."
        ],
        [
          "Boten tumbas, Bu.",
          "Kalimat tersebut berarti tidak jadi membeli. Selesaikan transaksi dengan membayar."
        ]
      ],
      answer: 1,
      reply: [
        "Inggih, sami-sami, Mbak.",
        "Iya, sama-sama, Mbak."
      ]
    }
  ],

  "pak-budi": [
    {
      line: "Sugeng enjing, Mbak. Badhe tumbas menapa?",
      translation: "Selamat pagi, Mbak. Ingin membeli apa?",
      goal: "Sapa Pak Budi dan pesan pisang menggunakan basa krama.",
      words: [
        ["Badhe", "Ingin"],
        ["Tumbas", "Membeli"],
        ["Pisang", "Pisang (krama)"]
      ],
      options: [
        [
          "Aku arep tuku gedhang, Pak.",
          "Barangnya sudah benar, tetapi kalimat tersebut menggunakan basa ngoko."
        ],
        [
          "Sugeng enjing, Pak. Kula badhe tumbas pisang.",
          "Benar! Kamu menyapa dan memesan pisang menggunakan basa krama."
        ],
        [
          "Kula badhe tumbas lombok, Pak.",
          "Bahasamu sudah sopan, tetapi barang yang harus dibeli adalah pisang."
        ]
      ],
      answer: 1,
      reply: [
        "Inggih, Mbak.",
        "Baik, Mbak."
      ]
    },
    {
      line: "Badhe tumbas pinten, Mbak?",
      translation: "Ingin membeli berapa, Mbak?",
      goal: "Pilih tiga buah pisang sesuai daftar belanja.",
      words: [
        ["Pinten", "Berapa"],
        ["Telu", "Tiga (ngoko)"],
        ["Tiga", "Tiga (krama)"]
      ],
      quantity: 3,
      reply: [
        "Inggih, pisang tiga.",
        "Baik, tiga buah pisang."
      ]
    },
    {
      line: "Badhe dipunbungkus, Mbak?",
      translation: "Ingin dibungkus, Mbak?",
      goal: "Minta Pak Budi membungkus pisang.",
      words: [
        ["Dipunbungkus", "Dibungkus"],
        ["Nyuwun", "Meminta"],
        ["Inggih", "Iya"]
      ],
      options: [
        [
          "Inggih, Pak. Nyuwun dipunbungkus.",
          "Benar! Kamu meminta pesanan dibungkus menggunakan basa krama."
        ],
        [
          "Iyo, Pak. Dibungkus wae.",
          "Maksudmu benar, tetapi kalimat tersebut menggunakan basa ngoko."
        ],
        [
          "Boten, Pak.",
          "Boten berarti tidak. Kamu perlu meminta pesanan dibungkus."
        ]
      ],
      answer: 0,
      reply: [
        "Inggih, sekedhap, Mbak.",
        "Baik, sebentar, Mbak."
      ]
    },
    {
      line: "Sampun, Mbak. Sedayanipun sangang ewu rupiyah.",
      translation: "Sudah, Mbak. Totalnya sembilan ribu rupiah.",
      goal: "Bayar pesanan dan ucapkan terima kasih.",
      words: [
        ["Sedayanipun", "Semuanya"],
        ["Menika artanipun", "Ini uangnya"],
        ["Matur nuwun", "Terima kasih"]
      ],
      options: [
        [
          "Iyo, Pak. Iki dhuwite. Matur nuwun.",
          "Maksudmu benar, tetapi gunakan basa krama ketika berbicara dengan Pak Budi."
        ],
        [
          "Pinten reginipun, Pak?",
          "Pak Budi sudah menyampaikan harga. Sekarang lakukan pembayaran."
        ],
        [
          "Inggih, Pak. Menika artanipun. Matur nuwun.",
          "Benar! Kamu membayar pesanan dan mengucapkan terima kasih dengan sopan."
        ]
      ],
      answer: 2,
      reply: [
        "Inggih, sami-sami, Mbak.",
        "Iya, sama-sama, Mbak."
      ]
    }
  ]
};

const vrQuestions = [
  {
    question: "Apa padanan kata gedhang dalam basa krama?",
    options: ["Lombok", "Pisang", "Tomat"],
    answer: 1,
    explanation:
      "Gedhang merupakan bentuk ngoko, sedangkan pisang merupakan bentuk krama."
  },
  {
    question: "Apa bahasa krama dari kata tuku?",
    options: ["Tumbas", "Pinten", "Nyuwun"],
    answer: 0,
    explanation:
      "Tuku berarti membeli dalam basa ngoko. Bentuk kramanya adalah tumbas."
  },
  {
    question: "Apa padanan kata telu dalam basa krama?",
    options: ["Telu", "Kalih", "Tiga"],
    answer: 2,
    explanation:
      "Telu merupakan bentuk ngoko dan tiga merupakan bentuk krama untuk angka tiga."
  },
  {
    question: "Bagaimana menanyakan total harga menggunakan basa krama?",
    options: [
      "Pira regane kabeh?",
      "Pinten reginipun sedaya?",
      "Badhe tumbas menapa?"
    ],
    answer: 1,
    explanation:
      "Pinten reginipun sedaya berarti berapa harga semuanya dalam basa krama."
  },
  {
    question: "Bagaimana membayar pesanan dengan sopan?",
    options: [
      "Iki dhuwite.",
      "Pinten reginipun?",
      "Menika artanipun. Matur nuwun."
    ],
    answer: 2,
    explanation:
      "Menika artanipun berarti ini uangnya, sedangkan matur nuwun berarti terima kasih."
  }
];
