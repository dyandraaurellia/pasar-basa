// Pemilik: Dyan — scene panorama + navigasi. Logika belajar ada di learning.js.
const FIRST = "pintu";
const locations = {
  pintu: "Pintu Masuk",
  lorong: "Lorong Pasar",
  "kios-sayur": "Kios Sayur",
  "kios-buah": "Kios Buah",
};
const itinerary = Object.keys(locations);
const nav = (scene, pitch, yaw) => ({ scene, pitch, yaw, id: "arah-" + scene, label: "Ke " + locations[scene] });
const routes = {
  pintu: [nav("lorong", -5.79, 15.14)],
  lorong: [nav("kios-sayur", 3.11, 7.09), nav("pintu", -9.99, 178.66)],
  "kios-sayur": [nav("kios-buah", -1.76, -90.8), nav("lorong", -4.2, 85.78)],
  "kios-buah": [nav("kios-sayur", -2.09, -161.0)],
};

const panorama = document.getElementById("panorama");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const backButton = document.getElementById("btn-back");
const nextButton = document.getElementById("vr-next-location");
const guideButton = document.getElementById("vr-show-direction");
const journeySteps = document.querySelectorAll(".vr-journey [data-scene]");
let objectiveSpot = null;

function navigationHotspot(route) {
  return {
    id: route.id,
    type: "info",
    pitch: route.pitch,
    yaw: route.yaw,
    cssClass: "vr-nav-hotspot",
    createTooltipFunc(container) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "vr-hotspot-button vr-nav-hotspot-button";
      button.dataset.hotspot = route.id;
      button.dataset.destination = route.scene;
      button.dataset.label = locations[route.scene];
      button.setAttribute("aria-label", route.label);
      button.textContent = "↑";
      button.onclick = () => goTo(route);
      container.append(button);
    },
  };
}

const viewer = pannellum.viewer(panorama, {
  default: {
    firstScene: FIRST,
    sceneFadeDuration: reducedMotion.matches ? 0 : 800,
    autoLoad: true,
    hfov: 90,
    pitch: 5,
    minPitch: -45,
    maxPitch: 85,
  },
  scenes: Object.fromEntries(itinerary.map((scene) => [scene, {
    type: "equirectangular",
    panorama: "../assets/panorama/" + scene + ".jpg",
    hotSpots: routes[scene].map(navigationHotspot),
  }])),
});

// Kembali mengikuti riwayat jika lokasi tersebut terhubung dari panorama aktif.
const stack = [FIRST];
let goingBack = false;
let guideSpot = null;

function goTo(route, back = false) {
  if (!viewer.isLoaded() || !routes[viewer.getScene()].includes(route)) return;
  goingBack = back;
  if (back) stack.pop();
  refreshNavigation(false);
  viewer.loadScene(route.scene);
}

function refreshNavigation(loaded) {
  const scene = viewer.getScene();
  const index = itinerary.indexOf(scene);
  const adjacent = routes[scene];
  const routeTo = (id) => adjacent.find((route) => route.scene === id);
  const step = objectiveSpot ? Math.sign(itinerary.indexOf(objectiveSpot.scene) - index) : 0;
  const recommended = step ? routeTo(itinerary[index + step]) : null;
  guideSpot = step ? recommended : objectiveSpot;

  const historical = routeTo(stack.at(-2));
  const previous = routeTo(itinerary[index - 1]);
  const forward = routeTo(itinerary[index + 1]);
  const back = historical && historical !== recommended ? historical : previous;
  const next = recommended || [forward, previous].find((route) => route && route !== back);
  const showBack = Boolean(back && back !== next);

  backButton.hidden = !showBack;
  backButton.disabled = !loaded;
  if (showBack) {
    backButton.textContent = "← " + locations[back.scene];
    backButton.onclick = () => goTo(back, back === historical);
  }
  nextButton.hidden = !next;
  nextButton.disabled = !loaded;
  if (next) {
    nextButton.textContent = next.label;
    nextButton.onclick = () => goTo(next);
  }

  guideButton.disabled = !loaded || !guideSpot;
  guideButton.setAttribute("aria-label", guideSpot ? "Tunjukkan Arah: " + guideSpot.label : "Tunjukkan Arah");
  guideButton.title = guideSpot?.label ?? "";
  for (const button of panorama.querySelectorAll("[data-hotspot]")) {
    button.classList.toggle("vr-hotspot-recommended", Boolean(loaded && guideSpot?.id === button.dataset.hotspot));
  }
  for (const item of journeySteps) {
    if (item.dataset.scene === scene) item.setAttribute("aria-current", "location");
    else item.removeAttribute("aria-current");
  }
  document.getElementById("vr-location").textContent = locations[scene];
}

guideButton.onclick = () => {
  if (!guideSpot || !viewer.isLoaded()) return;
  if (viewer.isOrientationActive()) viewer.stopOrientation();
  viewer.stopMovement();
  viewer.lookAt(guideSpot.pitch, guideSpot.yaw, undefined, reducedMotion.matches ? false : 620);
};

viewer.on("scenechange", (id) => {
  if (!goingBack) stack.push(id);
  goingBack = false;
  refreshNavigation(false);
});
viewer.on("load", () => refreshNavigation(true));
viewer.on("error", () => refreshNavigation(false));
panorama.addEventListener("dblclick", (event) => console.log("pitch,yaw =", viewer.mouseEventToCoords(event)));

const help = document.getElementById("vr-help");
const helpKey = "pasarbasa:vr-help-seen";
let helpSeen = false;
function showHelp() {
  if (help.open) return;
  help.showModal();
  helpSeen = true;
  try {
    localStorage.setItem(helpKey, "1");
  } catch {
    // Bantuan tetap bisa dibuka bila penyimpanan browser dibatasi.
  }
}

document.getElementById("vr-open-help").onclick = showHelp;

function showFirstHelp() {
  try {
    helpSeen ||= localStorage.getItem(helpKey) === "1";
  } catch {
    // Gunakan status halaman saat penyimpanan browser dibatasi.
  }
  if (!helpSeen) showHelp();
}

window.PasarBasaVR = {
  viewer,
  locations,
  showFirstHelp,
  updateGuidance(spot) {
    objectiveSpot = spot;
    refreshNavigation(viewer.isLoaded());
  },
};
