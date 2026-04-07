/* flip.js */

const FlipController = (() => {
  let isFlipped = false;
  let flipCard, flipBtn, flipLabel;

  function init() {
    flipCard  = document.getElementById('flip-card');
    flipBtn   = document.getElementById('flip-btn');
    flipLabel = document.getElementById('flip-label');

    flipBtn.addEventListener('click', toggle);
  }

  function toggle() {
    isFlipped = !isFlipped;
    flipCard.classList.toggle('flipped', isFlipped);
    flipBtn.classList.toggle('active', isFlipped);
    flipLabel.textContent = isFlipped ? 'see the front' : 'see the back';
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function getState() { return isFlipped; }

  return { init, toggle, getState };
})();
