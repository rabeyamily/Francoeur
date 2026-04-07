/* stamp.js */

const StampRenderer = (() => {
  const W = 900, H = 600;
  const STAMP_EXPORT_BG = '#f7f0e3';

  function hexToRgb(hex) {
    const n = hex.replace('#', '');
    return {
      r: parseInt(n.slice(0, 2), 16),
      g: parseInt(n.slice(2, 4), 16),
      b: parseInt(n.slice(4, 6), 16),
    };
  }

  function fillFullyTransparent(ctx, w, h, hex) {
    const { r, g, b } = hexToRgb(hex);
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) {
        d[i] = r;
        d[i + 1] = g;
        d[i + 2] = b;
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  function cutPerforations(ctx, cw, ch, toothR, spacing) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    const step = spacing;
    const cutEdge = (edge) => {
      if (edge === 'top') {
        for (let x = step / 2; x < cw; x += step) {
          ctx.beginPath(); ctx.arc(x, 0, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'bottom') {
        for (let x = step / 2; x < cw; x += step) {
          ctx.beginPath(); ctx.arc(x, ch, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'left') {
        for (let y = step / 2; y < ch; y += step) {
          ctx.beginPath(); ctx.arc(0, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      } else if (edge === 'right') {
        for (let y = step / 2; y < ch; y += step) {
          ctx.beginPath(); ctx.arc(cw, y, toothR, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
    cutEdge('top');
    cutEdge('bottom');
    cutEdge('left');
    cutEdge('right');
    ctx.restore();
  }

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

    const iX = borderW;
    const iY = borderW;
    const iW = W - borderW * 2;
    const iH = H - borderW * 2;

    ctx.fillStyle = STAMP_EXPORT_BG;
    ctx.fillRect(0, 0, W, H);

    if (image) {
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
    } else {
      ctx.fillStyle = '#ede4d0';
      ctx.fillRect(iX, iY, iW, iH);
    }

    const rim = Math.min(
      borderW,
      Math.max(Math.ceil(spacing * 0.45) + toothR, Math.ceil(toothR * 2.2)),
    );
    const inner = Math.max(0, rim);

    const borderLayer = document.createElement('canvas');
    borderLayer.width = W;
    borderLayer.height = H;
    const bx = borderLayer.getContext('2d');
    bx.fillStyle = borderColor;
    bx.fillRect(0, 0, W, H);
    cutPerforations(bx, W, H, toothR, spacing);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(inner, inner, W - 2 * inner, H - 2 * inner);
    ctx.clip('evenodd');
    ctx.drawImage(borderLayer, 0, 0);
    ctx.restore();

    fillFullyTransparent(ctx, W, H, STAMP_EXPORT_BG);
  }

  function clipRoundRect(ctx, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  }

  async function renderNote(text, opts = {}) {
    const bgColor = opts.bgColor ?? '#faf6ee';
    const lineColor = opts.lineColor ?? '#ede4d0';
    const inkColor = opts.inkColor ?? '#2e1f0f';

    const previewW = 340;
    const previewH = (previewW * 2) / 3;
    const scale = H / previewH;
    const rem = 16;
    const PAD_X = Math.round(1.25 * rem * W / previewW);
    const LINE_GAP = Math.round(2 * rem * scale);
    const FIRST_RULE_Y = Math.round(2 * rem * scale);
    const FOOTER_H = Math.round(2 * rem * scale);
    const CORNER_R = Math.max(8, Math.round(6 * W / previewW));
    const FONT_SIZE = Math.max(26, Math.round(1.2 * rem * scale));
    const SPARKLE_SIZE = Math.max(16, Math.round(1 * rem * scale));

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    try {
      await document.fonts.load(`400 ${FONT_SIZE}px Caveat`);
    } catch (_) {}

    const offscreen = document.createElement('canvas');
    offscreen.width = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    clipRoundRect(ctx, W, H, CORNER_R);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const footerTop = H - FOOTER_H;

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    for (let y = FIRST_RULE_Y; y < footerTop - 2; y += LINE_GAP) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.font = `400 ${FONT_SIZE}px Caveat, cursive`;
    ctx.fillStyle = inkColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const maxTextW = W - 2 * PAD_X;
    const lines = wrapNoteLines(ctx, text || '', maxTextW);
    const textStartY = FIRST_RULE_Y + Math.round(FONT_SIZE * 0.92);

    lines.forEach((line, i) => {
      const y = textStartY + i * LINE_GAP;
      if (y >= footerTop - 8) return;
      if (line) ctx.fillText(line, PAD_X, y);
    });

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_X, footerTop);
    ctx.lineTo(W - PAD_X, footerTop);
    ctx.stroke();

    const footerMidY = footerTop + (H - footerTop) / 2;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(160, 113, 74, 0.5)';
    ctx.font = `${SPARKLE_SIZE}px Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.fillText('✦', PAD_X, footerMidY);

    ctx.restore();

    return offscreen.toDataURL('image/png');
  }

  function wrapNoteLines(ctx, text, maxWidth) {
    const blocks = text.split(/\r?\n/);
    const lines = [];
    for (let b = 0; b < blocks.length; b++) {
      const block = blocks[b];
      if (block === '') {
        lines.push('');
        continue;
      }
      const words = block.split(/ +/).filter(Boolean);
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }

  return { render, renderNote };
})();
