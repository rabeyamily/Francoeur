/* app.js — main controller for Francoeur */

(() => {
  /* ── State ─────────────────────────────────────── */
  let loadedImage = null;
  let currentOpts = {
    toothR:      13,
    borderW:     28,
    borderColor: '#f5e8c8',
  };

  /* ── Elements ──────────────────────────────────── */
  const imgUpload   = document.getElementById('img-upload');
  const uploadZone  = document.getElementById('upload-zone');
  const uploadText  = document.getElementById('upload-text');
  const stampCanvas = document.getElementById('stamp-canvas');
  const placeholder = document.getElementById('canvas-placeholder');
  const photoReplaceWrap = document.getElementById('photo-replace-wrap');
  const toothSlider = document.getElementById('tooth');
  const borderSlider= document.getElementById('border');
  const toothOut    = document.getElementById('tooth-out');
  const borderOut   = document.getElementById('border-out');
  const swatches    = document.querySelectorAll('.swatch');
  const borderColor = document.getElementById('border-color');
  const dlFront     = document.getElementById('dl-front');
  const dlBack      = document.getElementById('dl-back');
  const noteText    = document.getElementById('note-text');
  const charCount   = document.getElementById('char-count');

  /* Don’t flip the card when opening the file picker from the front face */
  uploadZone.addEventListener('click', (e) => e.stopPropagation());

  /* ── Image upload ──────────────────────────────── */
  imgUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    uploadText.textContent = 'loading…';
    uploadZone.classList.add('uploading');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        loadedImage = img;
        const shortName = file.name.length > 22
          ? file.name.slice(0, 20) + '…'
          : file.name;
        uploadText.textContent = shortName;
        photoReplaceWrap.classList.add('is-visible');
        photoReplaceWrap.setAttribute('aria-hidden', 'false');
        uploadZone.classList.remove('uploading');
        placeholder.classList.add('hidden');
        dlFront.disabled = false;
        dlBack.disabled  = false;
        redraw();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* Drag-and-drop */
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.background = '#e0d5c2';
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.background = '';
  });
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.background = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const dt = new DataTransfer();
      dt.items.add(file);
      imgUpload.files = dt.files;
      imgUpload.dispatchEvent(new Event('change'));
    }
  });

  /* ── Sliders ───────────────────────────────────── */
  toothSlider.addEventListener('input', () => {
    currentOpts.toothR = parseInt(toothSlider.value);
    toothOut.textContent = toothSlider.value;
    redraw();
  });

  borderSlider.addEventListener('input', () => {
    currentOpts.borderW = parseInt(borderSlider.value);
    borderOut.textContent = borderSlider.value;
    redraw();
  });

  /* ── Color swatches ────────────────────────────── */
  swatches.forEach(sw => {
    sw.addEventListener('click', (e) => {
      // If clicking the custom swatch, let color input open
      if (sw.classList.contains('swatch-custom')) return;
      setColor(sw.dataset.color);
      setActiveSwatchEl(sw);
    });
  });

  borderColor.addEventListener('input', () => {
    setColor(borderColor.value);
    setActiveSwatchEl(borderColor.closest('.swatch'));
  });

  function setColor(hex) {
    currentOpts.borderColor = hex;
    redraw();
  }

  function setActiveSwatchEl(el) {
    swatches.forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }

  /* ── Note text ─────────────────────────────────── */
  noteText.addEventListener('input', () => {
    charCount.textContent = noteText.value.length;
  });

  /* ── Redraw ────────────────────────────────────── */
  function redraw() {
    if (!loadedImage) return;
    StampRenderer.render(stampCanvas, loadedImage, currentOpts);
  }

  /* ── Downloads ─────────────────────────────────── */
  dlFront.addEventListener('click', () => {
    if (!loadedImage) return;
    // Ensure latest render
    StampRenderer.render(stampCanvas, loadedImage, currentOpts);
    const link = document.createElement('a');
    link.download = 'francoeur-stamp.png';
    link.href = stampCanvas.toDataURL('image/png');
    link.click();
  });

  dlBack.addEventListener('click', () => {
    const dataURL = StampRenderer.renderNote(noteText.value, {
      toothR:      currentOpts.toothR,
      borderColor: currentOpts.borderColor,
    });
    const link = document.createElement('a');
    link.download = 'francoeur-note.png';
    link.href = dataURL;
    link.click();
  });

  /* ── Init ──────────────────────────────────────── */
  FlipController.init();
})();
