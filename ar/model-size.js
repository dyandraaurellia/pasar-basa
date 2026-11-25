// Ukuran terpanjang model disamakan dalam satuan marker (lebar kartu = 1).
// Penskalaan seragam mempertahankan proporsi model asli.
window.AFRAME?.registerComponent('fit-model', {
  schema: { size: { type: 'number', default: 0.7 } },

  init: function () {
    this.onModelLoaded = this.fit.bind(this);
    this.el.addEventListener('model-loaded', this.onModelLoaded);
    if (this.el.getObject3D('mesh')) this.fit();
  },

  fit: function () {
    const model = this.el.getObject3D('mesh');
    if (!model || !Number.isFinite(this.data.size) || this.data.size <= 0) return;

    const THREE = AFRAME.THREE;
    // Ukur di luar parent marker: matriks marker belum terdeteksi bernilai nol.
    this.el.removeObject3D('mesh');
    const fitted = new THREE.Group();
    fitted.add(model);
    fitted.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(fitted);
    const dimensions = bounds.getSize(new THREE.Vector3());
    const longest = Math.max(dimensions.x, dimensions.y, dimensions.z);

    if (bounds.isEmpty() || !Number.isFinite(longest) || longest <= 0) {
      fitted.remove(model);
      this.el.setObject3D('mesh', model);
      console.warn('Model tidak memiliki ukuran yang dapat disesuaikan:', this.el.id);
      return;
    }

    const factor = this.data.size / longest;
    const center = bounds.getCenter(new THREE.Vector3());
    fitted.scale.setScalar(factor);
    fitted.position.copy(center).multiplyScalar(-factor);
    this.el.setObject3D('mesh', fitted);
    this.el.emit('model-fitted', { size: this.data.size });
  },

  remove: function () {
    this.el.removeEventListener('model-loaded', this.onModelLoaded);
  }
});
