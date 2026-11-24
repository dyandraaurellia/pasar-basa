// Pemilik: Dyan — scene panorama + navigasi. Jangan taruh logika belajar di sini (itu learning.js).
// Ganti pitch/yaw hotspot sesuai foto asli (cara cari: klik panorama, lihat console -> viewer.mouseEventToCoords).
const FIRST = "pintu";
const P = (n) => "../assets/panorama/" + n + ".jpg";
const nav = (text, sceneId, pitch, yaw) => ({ type: "scene", text, sceneId, pitch, yaw });

const viewer = pannellum.viewer("panorama", {
  default: {
    firstScene: FIRST,
    sceneFadeDuration: 800,
    autoLoad: true,
    hfov: 90,
    pitch: 5,
    minPitch: -45,
    maxPitch: 85,
  },

  scenes: {
    pintu: {
      type: "equirectangular",
      panorama: P("pintu"),
      hotSpots: [nav("Masuk ke lorong", "lorong", -5.79, 15.14)],
    },

    lorong: {
      type: "equirectangular",
      panorama: P("lorong"),
      hotSpots: [nav("Kios sayur", "kios-sayur", 3.11, 7.09), nav("Ke pintu", "pintu", -9.99, 178.66)],
    },

    "kios-sayur": {
      type: "equirectangular",
      panorama: P("kios-sayur"),
      hotSpots: [nav("Kios buah", "kios-buah", -1.76, -90.8), nav("Ke lorong", "lorong", -4.2, 85.78)],
    },

    "kios-buah": {
      type: "equirectangular",
      panorama: P("kios-buah"),
      hotSpots: [nav("Kios sayur", "kios-sayur", -2.09, -161.0)],
    },
  },
});

// riwayat untuk tombol Kembali (KF-VR-06)
let stack = [FIRST],
  goingBack = false;
viewer.on("scenechange", (id) => {
  if (goingBack) {
    goingBack = false;
    return;
  }
  stack.push(id);
});
document.getElementById("btn-back").onclick = () => {
  if (stack.length > 1) {
    stack.pop();
    goingBack = true;
    viewer.loadScene(stack[stack.length - 1]);
  }
};
// bantu cari koordinat hotspot: klik panorama -> lihat console
document.getElementById("panorama").addEventListener("dblclick", (e) => console.log("pitch,yaw =", viewer.mouseEventToCoords(e)));

window.PasarBasaVR = { viewer }; // dipakai learning.js
