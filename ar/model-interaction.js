// Mengunci salinan model terhadap kamera, bukan membuat jangkar pada ruang nyata.
window.PasarBasa = window.PasarBasa || {};
(function () {
  const THREE = AFRAME.THREE;
  const scene = document.getElementById('scene');
  const stage = document.getElementById('model-stage');
  const byId = id => document.getElementById(id);
  const tracked = new Set();
  const pointers = new Map();
  const sources = ['cabai', 'tomat', 'pisang'].map(id => byId('obj-' + id));
  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
  let locked = null;
  let mode = 'move';

  function candidate() { return Array.from(tracked).pop() || null; }
  function updateButton() {
    const source = byId('obj-' + candidate());
    byId('btn-pin').disabled = !locked && (!source || !source.getObject3D('mesh'));
    byId('btn-pin').textContent = locked ? 'Pindai ulang' : 'Kunci objek';
  }

  function setMode(value) {
    mode = value;
    byId('btn-move').setAttribute('aria-pressed', String(mode === 'move'));
    byId('btn-turn').setAttribute('aria-pressed', String(mode === 'turn'));
    byId('gesture-help').textContent = mode === 'move'
      ? 'Seret untuk menggeser · dua jari untuk ukuran dan putaran'
      : 'Seret untuk memutar · cubit untuk mengubah ukuran';
    stage.setAttribute('aria-label', mode === 'move'
      ? 'Geser objek: seret atau gunakan tombol panah. Plus dan minus mengubah ukuran.'
      : 'Putar objek: seret atau gunakan tombol panah. Plus dan minus mengubah ukuran.');
  }

  function pin() {
    const id = candidate();
    const source = byId('obj-' + id);
    const mesh = source && source.getObject3D('mesh');
    const camera = scene.camera;
    if (!id || !mesh || !camera) return;
    scene.object3D.updateMatrixWorld(true);
    const relative = new THREE.Matrix4().copy(camera.matrixWorld).invert().multiply(source.object3D.matrixWorld);
    // Kartu baru boleh dikunci setelah pelacak memberi posisi yang valid.
    if (!Number.isFinite(relative.determinant()) || Math.abs(relative.determinant()) < 1e-12) {
      emit('ar:pin-error', { message: 'Tahan kartu sebentar sampai objek terlihat jelas, lalu tekan Kunci objek lagi.' });
      return;
    }
    const root = new THREE.Group();
    root.name = 'pasarbasa-pinned-model';
    relative.decompose(root.position, root.quaternion, root.scale);
    if (root.position.z >= -camera.near) {
      emit('ar:pin-error', { message: 'Posisikan kartu di depan kamera sampai objek terlihat, lalu coba lagi.' });
      return;
    }
    root.add(mesh.clone(true));
    camera.add(root);
    locked = {
      id, root, zoom: 1,
      initial: { position: root.position.clone(), quaternion: root.quaternion.clone(), scale: root.scale.clone() },
      visibility: sources.map(el => el.object3D.visible)
    };
    sources.forEach(el => { el.object3D.visible = false; });
    stage.hidden = false;
    byId('controls').classList.add('is-pinned');
    byId('pin-tools').hidden = false;
    setMode('move');
    updateButton();
    stage.focus({ preventScroll: true });
    emit('ar:pinned', { id });
  }

  function release() {
    if (!locked) return;
    const previous = locked;
    previous.root.removeFromParent();
    // Geometri/material dipakai bersama model sumber; jangan dispose di sini.
    sources.forEach((el, i) => { el.object3D.visible = previous.visibility[i]; });
    locked = null;
    pointers.clear();
    stage.classList.remove('is-dragging');
    stage.hidden = true;
    byId('controls').classList.remove('is-pinned');
    byId('pin-tools').hidden = true;
    updateButton();
    const id = candidate();
    emit('ar:unpinned', { id });
    if (id) emit('ar:found', { id });
    else emit('ar:lost', { id: previous.id });
    byId('btn-pin').focus({ preventScroll: true });
  }

  function rotate(dx, dy = 0, roll = 0) {
    if (!locked) return;
    const turn = new THREE.Quaternion().setFromEuler(new THREE.Euler(dy, dx, roll, 'XYZ'));
    locked.root.quaternion.premultiply(turn).normalize();
  }

  function zoomBy(factor) {
    if (!locked || !Number.isFinite(factor) || factor <= 0) return;
    locked.zoom = Math.max(0.5, Math.min(2, locked.zoom * factor));
    locked.root.scale.copy(locked.initial.scale).multiplyScalar(locked.zoom);
  }

  function move(dx, dy) {
    if (!locked) return;
    const camera = scene.camera;
    const rect = stage.getBoundingClientRect();
    const height = 2 * Math.abs(locked.root.position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const width = height * camera.aspect;
    if (!rect.width || !rect.height) return;
    const position = locked.root.position;
    position.x = THREE.MathUtils.clamp(position.x + dx * width / rect.width, -width * 0.45, width * 0.45);
    position.y = THREE.MathUtils.clamp(position.y - dy * height / rect.height, -height * 0.45, height * 0.45);
  }

  function reset() {
    if (!locked) return;
    locked.root.position.copy(locked.initial.position);
    locked.root.quaternion.copy(locked.initial.quaternion);
    locked.root.scale.copy(locked.initial.scale);
    locked.zoom = 1;
    pointers.clear();
    stage.classList.remove('is-dragging');
  }

  window.addEventListener('ar:tracking', e => {
    if (e.detail.visible) { tracked.delete(e.detail.id); tracked.add(e.detail.id); }
    else tracked.delete(e.detail.id);
    requestAnimationFrame(updateButton);
  });
  sources.forEach(el => el.addEventListener('model-fitted', updateButton));
  byId('btn-pin').onclick = () => locked ? release() : pin();
  byId('btn-move').onclick = () => setMode('move');
  byId('btn-turn').onclick = () => setMode('turn');
  byId('btn-pose-reset').onclick = reset;

  stage.addEventListener('pointerdown', e => {
    if (!locked || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', e => {
    if (!locked || !pointers.has(e.pointerId)) return;
    e.preventDefault();
    const before = Array.from(pointers.values());
    const previous = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      const dx = e.clientX - previous.x, dy = e.clientY - previous.y;
      if (mode === 'move') move(dx, dy);
      else rotate(dx * 0.008, dy * 0.008);
    } else if (pointers.size === 2) {
      const after = Array.from(pointers.values());
      const distance = points => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
      if (distance(before) > 2) zoomBy(distance(after) / distance(before));
      const angle = points => Math.atan2(points[1].y - points[0].y, points[1].x - points[0].x);
      let turn = angle(after) - angle(before);
      turn = Math.atan2(Math.sin(turn), Math.cos(turn));
      rotate(0, 0, -turn);
      move((after[0].x + after[1].x - before[0].x - before[1].x) / 2,
        (after[0].y + after[1].y - before[0].y - before[1].y) / 2);
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (!pointers.size) stage.classList.remove('is-dragging');
  }
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => stage.addEventListener(name, endPointer));
  window.addEventListener('blur', () => { pointers.clear(); stage.classList.remove('is-dragging'); });
  stage.addEventListener('wheel', e => { if (locked) { e.preventDefault(); zoomBy(Math.exp(-e.deltaY * 0.001)); } }, { passive: false });
  stage.addEventListener('keydown', e => {
    if (!locked) return;
    const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
    if (directions[e.key]) {
      e.preventDefault();
      const [dx, dy] = directions[e.key];
      if (mode === 'move') move(dx, dy); else rotate(dx * 0.015, dy * 0.015);
    } else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(1.2); }
    else if (e.key === '-') { e.preventDefault(); zoomBy(1 / 1.2); }
    else if (e.key === 'Home') { e.preventDefault(); reset(); }
    else if (e.key === 'Escape') { e.preventDefault(); release(); }
  });

  // Kartu belajar menyesuaikan ruang di atas toolbar, termasuk ketika tombol membungkus di HP.
  if (window.ResizeObserver) new ResizeObserver(entries => {
    document.documentElement.style.setProperty('--ar-controls-height', entries[0].target.getBoundingClientRect().height + 'px');
  }).observe(byId('controls'));

  PasarBasa.pin = { isPinned: () => !!locked, getId: () => locked && locked.id, rotate, zoomBy, reset, release };
})();
