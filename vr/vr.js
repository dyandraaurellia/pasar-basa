// Pemilik: Dyan — scene panorama + navigasi. Jangan taruh logika belajar di sini (itu learning.js).
// Ganti pitch/yaw hotspot sesuai foto asli (cara cari: klik panorama, lihat console -> viewer.mouseEventToCoords).
const FIRST = 'pintu';
const P = n => '../assets/panorama/' + n + '.jpg';
const nav = (text, sceneId, pitch, yaw) => ({ type: 'scene', text, sceneId, pitch, yaw });

const viewer = pannellum.viewer('panorama', {
  default: { firstScene: FIRST, sceneFadeDuration: 800, autoLoad: true, hfov: 100 },
  scenes: {
    'pintu':      { type: 'equirectangular', panorama: P('pintu'),      hotSpots: [ nav('Masuk ke lorong', 'lorong', -5, 20) ] },
    'lorong':     { type: 'equirectangular', panorama: P('lorong'),     hotSpots: [ nav('Kios sayur', 'kios-sayur', -5, -30), nav('Ke pintu', 'pintu', -5, 160) ] },
    'kios-sayur': { type: 'equirectangular', panorama: P('kios-sayur'), hotSpots: [ nav('Kios buah', 'kios-buah', -5, 120), nav('Ke lorong', 'lorong', -5, -150) ] },
    'kios-buah':  { type: 'equirectangular', panorama: P('kios-buah'),  hotSpots: [ nav('Kios sayur', 'kios-sayur', -5, -120) ] }
  }
});

// riwayat untuk tombol Kembali (KF-VR-06)
let stack = [FIRST], goingBack = false;
viewer.on('scenechange', id => { if (goingBack) { goingBack = false; return; } stack.push(id); });
document.getElementById('btn-back').onclick = () => {
  if (stack.length > 1) { stack.pop(); goingBack = true; viewer.loadScene(stack[stack.length - 1]); }
};
// bantu cari koordinat hotspot: klik panorama -> lihat console
document.getElementById('panorama').addEventListener('dblclick', e => console.log('pitch,yaw =', viewer.mouseEventToCoords(e)));

window.PasarBasaVR = { viewer };   // dipakai learning.js
