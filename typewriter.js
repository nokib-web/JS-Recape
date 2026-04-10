/**
 * ============================================================
 *  typewriter.js — Revealing Module Pattern
 *  Prompt 8: Modules & Design Patterns
 * ============================================================
 */

'use strict';

const Typewriter = (() => {
  // Private variables (State)
  let _textElement = null;
  let _phrases = [];
  let _phraseIdx = 0;
  let _charIdx = 0;
  let _isDeleting = false;
  let _typingSpeed = 150;
  let _timer = null;

  // Private method: The core logic loop
  function _tick() {
    const currentFullText = _phrases[_phraseIdx];
    
    if (_isDeleting) {
      _charIdx--;
      _typingSpeed = 50;
    } else {
      _charIdx++;
      _typingSpeed = 150;
    }

    _textElement.textContent = currentFullText.substring(0, _charIdx);

    if (!_isDeleting && _charIdx === currentFullText.length) {
      _isDeleting = true;
      _typingSpeed = 2000; // Pause at end
    } else if (_isDeleting && _charIdx === 0) {
      _isDeleting = false;
      _phraseIdx = (_phraseIdx + 1) % _phrases.length;
      _typingSpeed = 500; // Pause before next phrase
    }

    _timer = setTimeout(_tick, _typingSpeed);
  }

  // Public API (The "Revealed" interface)
  return {
    init(elementId, phrases) {
      _textElement = document.getElementById(elementId);
      _phrases = phrases;
      if (_textElement && _phrases.length > 0) {
        _tick();
      }
    },
    
    stop() {
      clearTimeout(_timer);
    }
  };
})();

export default Typewriter;
