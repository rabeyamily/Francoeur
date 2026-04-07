/* app.js */

(() => {
  let loadedImage = null;
  let currentOpts = {
    toothR:      14,
    borderW:     35,
    borderColor: '#d4c4aa',
  };

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
  const dlPdf       = document.getElementById('dl-pdf');
  const noteText    = document.getElementById('note-text');
  const charCount   = document.getElementById('char-count');
  const appToast    = document.getElementById('app-toast');
  const appToastBody = document.getElementById('app-toast-body');
  const appToastTitle = document.getElementById('app-toast-title');
  const appToastClose = document.getElementById('app-toast-close');
  const appToastBackdrop = appToast.querySelector('.app-toast-backdrop');

  function showAppToast(message, title = 'Almost there') {
    appToastTitle.textContent = title;
    appToastBody.innerHTML = '';
    message.split(/\n\n/).forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para.trim();
      if (p.textContent) appToastBody.appendChild(p);
    });
    appToast.hidden = false;
    document.body.style.overflow = 'hidden';
    appToastClose.focus();
  }

  function hideAppToast() {
    appToast.hidden = true;
    appToastBody.innerHTML = '';
    document.body.style.overflow = '';
  }

  appToastClose.addEventListener('click', hideAppToast);
  appToastBackdrop.addEventListener('click', hideAppToast);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !appToast.hidden) hideAppToast();
  });

  uploadZone.addEventListener('click', (e) => e.stopPropagation());

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
        dlPdf.disabled   = false;
        redraw();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

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

  swatches.forEach(sw => {
    sw.addEventListener('click', (e) => {
      if (sw.classList.contains('swatch-custom')) return;
      setActiveSwatchEl(sw);
      setColor(sw.dataset.color);
    });
  });

  borderColor.addEventListener('input', () => {
    setActiveSwatchEl(borderColor.closest('.swatch'));
    setColor(borderColor.value);
  });

  function setColor(hex) {
    currentOpts.borderColor = hex;
    redraw();
  }

  function setActiveSwatchEl(el) {
    swatches.forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }

  noteText.addEventListener('input', () => {
    charCount.textContent = noteText.value.length;
  });

  function syncOptsFromDom() {
    currentOpts.toothR = parseInt(toothSlider.value, 10);
    currentOpts.borderW = parseInt(borderSlider.value, 10);
    const presetActive = document.querySelector('.swatch.active[data-color]');
    currentOpts.borderColor = presetActive && presetActive.dataset.color
      ? presetActive.dataset.color
      : borderColor.value;
  }

  function redraw() {
    StampRenderer.render(stampCanvas, loadedImage, currentOpts);
  }

  const EMPTY_NOTE_MSG =
    "Your little note is still blank — we couldn’t bear to send an empty card!\n\n" +
    "Flip to the back, scribble something (even one line counts), then try again. ✦";

  function noteIsEmpty() {
    return !noteText.value.trim();
  }

  dlFront.addEventListener('click', () => {
    if (!loadedImage) return;
    StampRenderer.render(stampCanvas, loadedImage, currentOpts);
    const link = document.createElement('a');
    link.download = 'francoeur-stamp.png';
    link.href = stampCanvas.toDataURL('image/png');
    link.click();
  });

  dlBack.addEventListener('click', async () => {
    if (noteIsEmpty()) {
      showAppToast(EMPTY_NOTE_MSG);
      return;
    }
    const dataURL = await StampRenderer.renderNote(noteText.value);
    const link = document.createElement('a');
    link.download = 'francoeur-note.png';
    link.href = dataURL;
    link.click();
  });

  const IMG_W = 900;
  const IMG_H = 600;

  function fitImageOnPage(doc, dataUrl, mime) {
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const margin = 12;
    const maxW = pw - 2 * margin;
    const maxH = ph - 2 * margin;
    let w = maxW;
    let h = w * (IMG_H / IMG_W);
    if (h > maxH) {
      h = maxH;
      w = h * (IMG_W / IMG_H);
    }
    const x = (pw - w) / 2;
    const y = (ph - h) / 2;
    doc.addImage(dataUrl, mime, x, y, w, h);
  }

  dlPdf.addEventListener('click', async () => {
    if (!loadedImage) return;
    const jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) {
      showAppToast(
        'We couldn’t load the PDF helper. Check your connection and refresh the page, then try again.',
        'Small snag',
      );
      return;
    }
    if (noteIsEmpty()) {
      showAppToast(EMPTY_NOTE_MSG);
      return;
    }
    StampRenderer.render(stampCanvas, loadedImage, currentOpts);
    const stampPng = stampCanvas.toDataURL('image/png');
    const notePng = await StampRenderer.renderNote(noteText.value);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    fitImageOnPage(doc, stampPng, 'PNG');
    doc.addPage('a4', 'landscape');
    fitImageOnPage(doc, notePng, 'PNG');
    doc.save('francoeur-stamp-and-note.pdf');
  });

  syncOptsFromDom();
  redraw();
  FlipController.init();
})();
