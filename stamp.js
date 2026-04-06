/* stamp.js — canvas rendering for Francoeur */

const StampRenderer = (() => {
  const W = 900, H = 600;

  function render(canvas, image, opts = {}) {
    const {
      toothR    = 13,
      borderW   = 28,
      borderColor = '#f5e8c8',
    } = opts;

    const spacing = toothR * 2.4;
    const ctx = canvas.getContext('2d');

    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    // 1 — fill border color
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, W, H);

    // 2 — cut perforations
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';

    function cutEdge(edge) {
      const step = spacing;
      if (edge === 'top') {
        for (let x = step / 2; x < W; x += step) {
          ctx.beginPath(); ctx.arc(x, 0, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'bottom') {
        for (let x = step / 2; x < W; x += step) {
          ctx.beginPath(); ctx.arc(x, H, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'left') {
        for (let y = step / 2; y < H; y += step) {
          ctx.beginPath(); ctx.arc(0, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'right') {
        for (let y = step / 2; y < H; y += step) {
          ctx.beginPath(); ctx.arc(W, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    cutEdge('top');
    cutEdge('bottom');
    cutEdge('left');
    cutEdge('right');
    ctx.restore();

    // 3 — draw image cover-fitted into inner rect
    if (image) {
      const iX = borderW, iY = borderW;
      const iW = W - borderW * 2, iH = H - borderW * 2;

      const imgAR = image.width / image.height;
      const frmAR = iW / iH;
      let sx, sy, sw, sh;

      if (imgAR > frmAR) {
        sh = image.height; sw = sh * frmAR;
        sx = (image.width - sw) / 2; sy = 0;
      } else {
        sw = image.width; sh = sw / frmAR;
        sx = 0; sy = (image.height - sh) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(iX, iY, iW, iH);
      ctx.clip();
      ctx.drawImage(image, sx, sy, sw, sh, iX, iY, iW, iH);
      ctx.restore();
    }
  }

  /**
   * Render the note card back to a canvas and return a data URL.
   * Draws lined paper + Caveat text.
   */
  function renderNote(text, opts = {}) {
    const {
      bgColor   = '#faf6ee',
      lineColor = '#ede4d0',
      inkColor  = '#2e1f0f',
      font      = '28px Caveat, cursive',
      toothR    = 10,
      borderColor = '#f5e8c8',
    } = opts;

    const offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');
    const spacing = toothR * 2.4;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Ruled lines
    const lineSpacing = 72;
    const startY = 90;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    for (let y = startY; y < H - 50; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(W - 50, y);
      ctx.stroke();
    }

    // Decorative left margin line
    ctx.strokeStyle = '#d4b896';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(90, 40);
    ctx.lineTo(90, H - 40);
    ctx.stroke();

    // Small stamp icon top-right
    ctx.fillStyle = '#d4b896';
    ctx.font = '28px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('✦', W - 55, 65);

    // Note text in Caveat
    ctx.fillStyle = inkColor;
    ctx.font = font;
    ctx.textAlign = 'left';

    const lines = wrapText(ctx, text || '', 110, lineSpacing, W - 160);
    lines.forEach((line, i) => {
      const y = startY + (i * lineSpacing) - 12;
      if (y < H - 60) ctx.fillText(line, 110, y);
    });

    // Perforations (same as front)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';

    function cutEdge(edge) {
      if (edge === 'top') {
        for (let x = spacing / 2; x < W; x += spacing) {
          ctx.beginPath(); ctx.arc(x, 0, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'bottom') {
        for (let x = spacing / 2; x < W; x += spacing) {
          ctx.beginPath(); ctx.arc(x, H, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'left') {
        for (let y = spacing / 2; y < H; y += spacing) {
          ctx.beginPath(); ctx.arc(0, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'right') {
        for (let y = spacing / 2; y < H; y += spacing) {
          ctx.beginPath(); ctx.arc(W, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    cutEdge('top'); cutEdge('bottom'); cutEdge('left'); cutEdge('right');
    ctx.restore();

    // Border color overlay (thin frame)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    return offscreen.toDataURL('image/png');
  }

  function wrapText(ctx, text, x, lineHeight, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      const { width } = ctx.measureText(test);
      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  return { render, renderNote };
})();
