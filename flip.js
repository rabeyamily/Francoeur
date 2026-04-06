/* flip.js — card flip controller for Francoeur */

const FlipController = (() => {
  let isFlipped = false;
  let flipCard, flipBtn, flipLabel;

  function init() {
    flipCard  = document.getElementById('flip-card');
    flipBtn   = document.getElementById('flip-btn');
    flipLabel = document.getElementById('flip-label');

    flipBtn.addEventListener('click', toggle);
    flipCard.addEventListener('click', () => {
      // clicking the card itself also flips
      toggle();
    });
  }

  function toggle() {
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);
    flipBtn.classList.toggle('active', isFlipped);
    flipLabel.textContent = isFlipped ? 'see the front' : 'see the back';

    // Haptic on mobile
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function getState() { return isFlipped; }

  return { init, toggle, getState };
})();
