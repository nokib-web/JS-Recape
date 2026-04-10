/**
 * ============================================================
 *  NovaSaaS — app.js
 *  Prompt 2: DOM Manipulation & Events
 * ============================================================
 *
 *  Concepts practiced:
 *    • document.querySelector / querySelectorAll
 *    • element.addEventListener(event, handler)
 *    • element.classList.add / .remove / .toggle
 *    • window scroll event + scrollY
 *    • window.scrollTo({ behavior: 'smooth' })
 *    • ARIA attribute updates for accessibility
 * ============================================================
 */

'use strict';

/* ============================================================
   PERFORMANCE UTILITIES (Prompt 7)
   ============================================================ */

/**
 * debounce
 * Limits the execution of a function until after N ms have
 * passed since the last time it was invoked.
 * Perfect for: window resize, back-to-top button visibility.
 */
const debounce = (fn, delay = 200) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * throttle
 * Ensures a function is called at most once every N ms.
 * Perfect for: window scroll, mousemove parallax.
 */
const throttle = (fn, limit = 16) => {
  let lastFunc;
  let lastRan;
  return (...args) => {
    if (!lastRan) {
      fn.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          fn.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/* ----------------------------------------------------------
   1. ELEMENT REFERENCES
   querySelector returns the FIRST matching element (or null).
   We cache them once at the top so we don't query the DOM
   repeatedly inside event handlers (better performance).
---------------------------------------------------------- */

/** The sticky <header> element */
const navbar = document.querySelector('#navbar');

/** The three-bar hamburger <button> */
const hamburgerBtn = document.querySelector('#hamburger-btn');

/** The sliding mobile nav <div> */
const mobileMenu = document.querySelector('#mobile-menu');

/** All nav links inside the mobile drawer */
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

/** The floating scroll-to-top <button> */
const scrollTopBtn = document.querySelector('#scroll-top-btn');


/* ----------------------------------------------------------
   GUARD: stop the script if any key element is missing.
   This prevents "Cannot read properties of null" crashes if
   someone removes an element from the HTML.
---------------------------------------------------------- */
if (!navbar || !hamburgerBtn || !mobileMenu || !scrollTopBtn) {
  console.warn('app.js: One or more required elements not found. Aborting.');
  // Use a throw inside a function so the rest of the module
  // still parses correctly in older environments.
  (function abort() { return; })();
}


/* ============================================================
   FEATURE 1 — HAMBURGER MENU TOGGLE
   ============================================================
   Goal:
     Click the ☰ button → mobile menu slides down, bars morph → ×
     Click it again     → menu collapses, bars morph back to ☰
     Click any nav link → same collapse (close on navigate)

   DOM APIs used:
     • addEventListener('click', handler)
     • classList.toggle(className)    — adds if absent, removes if present
     • classList.remove(className)    — always removes
     • setAttribute / getAttribute    — ARIA for accessibility
============================================================ */

/**
 * Toggles the hamburger open/closed state.
 * Keeping the logic in its own named function makes it
 * reusable (we call it from both the button AND the links).
 *
 * @param {boolean} [forceClose=false] - Pass true to always close.
 */
function toggleMobileMenu(forceClose = false) {

  if (forceClose) {
    // ---- CLOSE ----
    // classList.remove() removes the class only if it exists.
    hamburgerBtn.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');

    // Update ARIA so screen-readers know the menu is now closed.
    hamburgerBtn.setAttribute('aria-expanded', 'false');

  } else {
    // ---- TOGGLE ----
    // classList.toggle() returns true if the class was ADDED,
    // false if it was REMOVED.
    const isNowOpen = hamburgerBtn.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');

    // Keep aria-expanded in sync with the visual state.
    hamburgerBtn.setAttribute('aria-expanded', String(isNowOpen));
  }
}

// Wire up the hamburger button click.
// addEventListener(eventType, callbackFunction)
hamburgerBtn.addEventListener('click', function () {
  toggleMobileMenu(); // no argument → toggle
});

// Close the menu when any mobile nav link is clicked.
// querySelectorAll returns a NodeList; forEach works on it directly.
mobileNavLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    toggleMobileMenu(true); // forceClose = true
  });
});

// Also close if the user clicks the CTA buttons inside the drawer.
const mobileCtaBtns = document.querySelectorAll('#mobile-signin, #mobile-cta');
mobileCtaBtns.forEach(function (btn) {
  btn.addEventListener('click', function () {
    toggleMobileMenu(true);
  });
});


/* ============================================================
   FEATURE 2 — NAVBAR BACKGROUND CHANGE ON SCROLL
   ============================================================
   Goal:
     At the very top (scrollY ≤ 80px)  → glass pill is semi-transparent
     Once scrolled past 80px            → add .scrolled class to #navbar
                                           making the glass denser & compact

   DOM APIs used:
     • window.addEventListener('scroll', handler)
     • window.scrollY               — current vertical scroll position
     • classList.add(className)     — adds class (no-op if already there)
     • classList.remove(className)  — removes class (no-op if not there)

   Performance note:
     'scroll' fires very frequently. We use a simple threshold
     check. For heavy work you'd debounce or use requestAnimationFrame,
     but for a classList toggle this is perfectly fine.
============================================================ */

/** Pixel threshold after which the navbar "solidifies" */
const SCROLL_THRESHOLD = 80;

/**
 * Called on every scroll event.
 * Adds or removes the '.scrolled' class from #navbar.
 */
function handleNavbarScroll() {

  if (window.scrollY > SCROLL_THRESHOLD) {
    // classList.add() — safe to call even if already present
    navbar.classList.add('scrolled');
  } else {
    // classList.remove() — safe to call even if not present
    navbar.classList.remove('scrolled');
  }
}

/**
 * handleCombinedScroll
 * Debounced wrapper that runs both navbar and back-to-top logic.
 * Better for performance as it reduces DOM checks to once every 50ms.
 */
const handleCombinedScroll = debounce(() => {
  handleNavbarScroll();
  handleScrollTopVisibility();
}, 50);

// Prompt 7 — Using debounce instead of raw listener
window.addEventListener('scroll', handleCombinedScroll);

// Run once immediately so correct state is set on load
handleCombinedScroll();


/* ============================================================
   FEATURE 3 — SCROLL-TO-TOP BUTTON
   ============================================================
   Goal:
     Hidden at the top of the page.
     Appears (fades up) once the user scrolls past 400px.
     Clicking it smoothly scrolls the page back to the top.

   DOM APIs used:
     • window.scrollY
     • classList.add / classList.remove  ← same pattern as above
     • window.scrollTo({ top, behavior })
     • addEventListener('click', handler)
============================================================ */

/** Pixel threshold after which the scroll-top button appears */
const SCROLL_TOP_THRESHOLD = 400;

/**
 * Shows or hides the scroll-to-top button based on current
 * scroll position.
 */
function handleScrollTopVisibility() {

  if (window.scrollY > SCROLL_TOP_THRESHOLD) {
    // Make the button visible + interactive
    scrollTopBtn.classList.add('visible');
  } else {
    // Hide and disable pointer events
    scrollTopBtn.classList.remove('visible');
  }
}

/**
 * Smoothly scrolls the viewport back to the very top.
 * window.scrollTo() accepts an options object:
 *   top:      target scroll position in pixels
 *   behavior: 'smooth' | 'instant' | 'auto'
 */
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

// Removed raw listener here (now handled by handleCombinedScroll above)
window.addEventListener('scroll', handleCombinedScroll);

// Set correct initial state on page load.
handleScrollTopVisibility();

// Clicking the FAB fires the scroll.
scrollTopBtn.addEventListener('click', scrollToTop);


/* ============================================================
   BONUS — CLOSE MOBILE MENU ON RESIZE TO DESKTOP
   ============================================================
   If the user opens the mobile menu then resizes the window
   to desktop width, the menu stays open visually but the
   hamburger is hidden. This cleans up that edge case.
============================================================ */
window.addEventListener('resize', function () {
  // innerWidth > 768px = desktop breakpoint (matches CSS media query)
  if (window.innerWidth > 768) {
    toggleMobileMenu(true); // forceClose
  }
});


/* ============================================================
   SUMMARY — classList API quick reference
   ============================================================

   element.classList.add('foo')
     → adds 'foo' to the class list. No duplicate added.

   element.classList.remove('foo')
     → removes 'foo'. No error if not present.

   element.classList.toggle('foo')
     → adds 'foo' if absent, removes if present.
       Returns boolean: true = it was added.

   element.classList.toggle('foo', condition)
     → forces add (true) or remove (false) based on condition.

   element.classList.contains('foo')
     → returns true/false. Useful for conditional logic.

   element.classList.replace('foo', 'bar')
     → swaps one class for another atomically.

============================================================ */


/* ============================================================
   FEATURE 4 — TYPEWRITER EFFECT
   ============================================================
   Prompt 3 — ES6+ & Closures

   Concepts demonstrated:
     const          — all variable declarations
     Arrow function — createTypewriter, tick, startInterval,
                      cursorTimer callback
     Destructuring  — unpack config object in the parameter list
     Template literal — build the visible string with `${…}`
     setInterval    — two independent intervals:
                        1. typeInterval  → drives character animation
                        2. cursorInterval → drives cursor blink
     Closure        — tick() + cursorTimer callback both READ and
                      WRITE the private variables (wordIndex,
                      charIndex, isDeleting, timerId) that live
                      in createTypewriter's scope. Those variables
                      are NOT accessible from anywhere outside.
============================================================ */

/**
 * createTypewriter
 *
 * A CLOSURE FACTORY — it is a function that:
 *   1. Declares private state variables.
 *   2. Returns (or starts) inner functions that "close over"
 *      those private variables, keeping them alive between calls.
 *
 * DESTRUCTURING in the parameter list:   ← ES6 destructuring
 * Instead of accepting a plain `config` object and writing
 * `config.targetEl`, we unpack the keys directly in the signature
 * and supply defaults with `= value` where sensible.
 *
 * @param {object}   config
 * @param {Element}  config.targetEl    - element whose textContent we animate
 * @param {Element}  config.cursorEl    - the cursor bar element
 * @param {string[]} config.words       - array of phrases to cycle through
 * @param {number}   [config.typeSpeed=90]     - ms between typed characters
 * @param {number}   [config.deleteSpeed=48]   - ms between deleted characters
 * @param {number}   [config.holdMs=1800]      - ms to pause on a complete word
 * @returns {Function} cleanup — call this to stop all timers
 */
const createTypewriter = ({          // ← arrow function           ← destructuring
  targetEl,
  cursorEl,
  words,
  typeSpeed   = 90,
  deleteSpeed = 48,
  holdMs      = 1800,
}) => {

  /* ----------------------------------------------------------
     PRIVATE CLOSURE STATE
     These `let` variables are declared inside createTypewriter.
     They are invisible to the outside world, yet every inner
     function below can read and mutate them — that is a closure.
  ---------------------------------------------------------- */
  let wordIndex  = 0;       // which word in `words` we're on
  let charIndex  = 0;       // how many chars are currently visible
  let isDeleting = false;   // typing forward or deleting backward?
  let timerId    = null;    // holds the id returned by setInterval

  /* ----------------------------------------------------------
     HELPER — (re)start the typing interval at a given speed.
     Calling setInterval while one already runs would create a
     duplicate, so we always clearInterval first.
  ---------------------------------------------------------- */
  const startInterval = (speed) => {        // ← arrow function
    clearInterval(timerId);                 // stop the previous one
    timerId = setInterval(tick, speed);     // ← setInterval ★
  };

  /* ----------------------------------------------------------
     TICK — the core typing state machine.
     This arrow function CLOSES OVER wordIndex, charIndex,
     isDeleting, and timerId — reading and mutating them each
     time setInterval fires it.
  ---------------------------------------------------------- */
  const tick = () => {                              // ← arrow function

    // `const` inside a function — block-scoped, re-evaluated
    // on every call; does NOT hoist like `var`.
    const currentWord = words[wordIndex];           // ← const

    // Advance or retreat the visible character count
    charIndex += isDeleting ? -1 : +1;

    // Template literal ★ — backtick string with ${} interpolation.
    // Equivalent to: currentWord.substring(0, charIndex)
    targetEl.textContent = `${currentWord.slice(0, charIndex)}`; // ← template literal

    /* ---- State transitions ---- */
    if (!isDeleting && charIndex === currentWord.length) {
      // Word fully typed → hold, then switch to delete mode
      clearInterval(timerId);
      timerId = setTimeout(() => {       // ← arrow fn in setTimeout
        isDeleting = true;
        startInterval(deleteSpeed);      // restart at delete speed
      }, holdMs);

    } else if (isDeleting && charIndex === 0) {
      // Word fully deleted → jump to next word, switch to type mode
      isDeleting = false;
      // Modulo wraps the index back to 0 after the last word
      wordIndex = (wordIndex + 1) % words.length;
      startInterval(typeSpeed);          // restart at type speed
    }
  };

  /* ----------------------------------------------------------
     CURSOR BLINK — second independent setInterval.
     A fixed 530 ms interval simply toggles the cursor's opacity.
     The CSS `animation: cursorBlink` was the no-JS fallback;
     once JS runs, this interval takes ownership of opacity.
  ---------------------------------------------------------- */
  let cursorVisible = true;                         // closure variable

  const cursorInterval = setInterval(() => {        // ← setInterval ★  ← arrow fn
    cursorVisible = !cursorVisible;
    cursorEl.style.opacity = cursorVisible ? '1' : '0';
    // Also disable the CSS animation now that JS is in control
    cursorEl.style.animation = 'none';
  }, 530);

  /* ----------------------------------------------------------
     KICK OFF the typewriter
  ---------------------------------------------------------- */
  startInterval(typeSpeed);

  /* ----------------------------------------------------------
     RETURN A CLEANUP FUNCTION
     Whoever calls createTypewriter can call cleanup() later
     (e.g. on a route change in a SPA) to stop all timers and
     prevent memory leaks.  Good practice even if we don't need
     it on a static page.
  ---------------------------------------------------------- */
  return () => {                                    // ← arrow fn
    clearInterval(timerId);
    clearInterval(cursorInterval);
  };
};


/* ============================================================
   INVOKE createTypewriter
   ============================================================
   We grab both DOM elements, define our word list, and pass
   them in as a config object. The factory returns a `cleanup`
   function we could call later if needed.
============================================================ */

// querySelector — same pattern as Feature 1 & 2
const typewriterTarget = document.querySelector('#typewriter-target');
const typewriterCursor = document.querySelector('.typewriter-cursor');

// Only run if both elements exist in the DOM
if (typewriterTarget && typewriterCursor) {

  // Word list — the phrases that will cycle in the hero headline.
  // Each is a const-declared array literal.   ← const
  const typewriterWords = [             // ← const
    'Without Limits',
    '10× Faster',
    'With AI Power',
    'At Any Scale',
    'With Confidence',
    'From Day One',
  ];

  // Start the typewriter — store cleanup in case we need it.
  const stopTypewriter = createTypewriter({   // ← const, destructuring used inside
    targetEl   : typewriterTarget,
    cursorEl   : typewriterCursor,
    words      : typewriterWords,
    typeSpeed  : 90,
    deleteSpeed: 48,
    holdMs     : 1900,
  });

  // stopTypewriter() would halt both intervals if called.
  // e.g.: document.addEventListener('visibilitychange', () => {
  //         document.hidden ? stopTypewriter() : location.reload();
  //       });
}


/* ============================================================
   ES6+ QUICK REFERENCE — concepts used above
   ============================================================

   const
     Block-scoped, must be initialised, cannot be reassigned.
     Use for values that should not change (DOM refs, config).

   Arrow function  =>
     Shorter syntax. Does NOT bind its own `this` — useful in
     callbacks where you want the outer `this`.
     const fn = (a, b) => a + b;

   Destructuring
     Unpack values from objects or arrays:
       const { a, b = 10 } = obj;  // object, with default
       const [x, y] = arr;         // array

   Template literal  `…${expr}…`
     Backtick strings. Embed any expression with ${ }.
     Multiline without \n. Tagged templates also possible.

   setInterval(fn, ms)
     Calls fn repeatedly every ms milliseconds.
     Returns a numeric id → store it to clearInterval(id) later.

   Closure
     A function that "closes over" variables from its outer scope,
     keeping them alive even after the outer function returns.
     The private state pattern:
       const makeCounter = () => {
         let count = 0;               // private
         return () => ++count;        // inner fn closes over count
       };
       const counter = makeCounter();
       counter(); // 1
       counter(); // 2  — count persists!

============================================================ */


/* ============================================================
   FEATURE 5 — DYNAMIC RENDERING
   ============================================================
   Prompt 4: Array Methods & Dynamic Rendering

   Data lives in data.js (FEATURES, PLANS, TESTIMONIALS).
   This module transforms that data → HTML strings and writes
   them into the DOM using innerHTML.

   Array methods practiced:
     .filter()  — decide WHICH items to render
     .map()     — transform each item into an HTML string
     .reduce()  — aggregate values (savings, avg rating)
     .join('')  — collapse the .map() array into one string

   DOM method:
     element.innerHTML = html  — inject the built string
============================================================ */


/* ----------------------------------------------------------
   RENDER FEATURES
   ----------------------------------------------------------
   .filter() — removes any feature with hidden: true.
               Useful for A/B tests / feature flags without
               touching HTML at all — just flip a data prop.

   .map()    — converts each feature object into an <article>
               string.  Destructuring in the arrow-function
               param unpacks only the keys we need.

   .join('') — array.map() returns a NEW array; .join('')
               concatenates every string element into one.

   innerHTML — write the entire rendered block in one shot.
---------------------------------------------------------- */
const renderFeatures = () => {                   // ← arrow fn, const
  const grid = document.querySelector('#features-grid');
  if (!grid) return;

  const html = FEATURES                          // global from data.js
    .filter(f => !f.hidden)                      // ← .filter() ★
    .map(({ id, iconColor, icon, title, desc, tags, wide }) =>  // ← .map() ★
      `<article class="feature-card ${wide ? 'feature-card--wide' : ''}" id="${id}">
        <div class="feature-icon feature-icon--${iconColor}">
          ${icon}
        </div>
        <h3 class="feature-title">${title}</h3>
        <p  class="feature-desc">${desc}</p>
        <div class="feature-tags">
          ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </article>`
    )
    .join('');                                   // collapse array → string

  grid.innerHTML = html;                         // ← innerHTML ★
};


/* ----------------------------------------------------------
   RENDER PLANS
   ----------------------------------------------------------
   @param {string} billing — 'monthly' | 'annual'

   .filter() ×2
     (a) Remove plans where hidden === true
     (b) Inside each plan: split feature list into
         included (✓) vs excluded (✕) sub-lists

   .reduce()
     Compute how much money the user saves per year if they
     choose annual billing across all paid plans.
     Accumulator pattern:  (acc, currentValue) => acc + ...

   .map()
     Transform each plan object → a full <article> string.
     Template literals handle conditional rendering (popular
     badge, custom vs numeric price, primary vs outline btn).

   Side-effect: updates the "Save X%" badge in the toggle UI.
---------------------------------------------------------- */
const renderPlans = (billing = 'monthly') => {   // ← const, default param
  const grid = document.querySelector('#pricing-grid');
  if (!grid) return;

  const visiblePlans = PLANS.filter(p => !p.hidden); // ← .filter() ★

  /* ---- .reduce() ★ — total annual savings across paid plans ---- */
  const annualSavings = visiblePlans.reduce((acc, plan) => {
    if (plan.monthlyPrice === null) return acc;    // skip custom-priced plans
    const yearlyIfMonthly = plan.monthlyPrice * 12;
    const yearlyIfAnnual  = plan.annualPrice  * 12;
    return acc + (yearlyIfMonthly - yearlyIfAnnual);
  }, 0);                                           // initial accumulator = 0

  // Reflect computed savings in the "Save X%" badge
  const saveBadge = document.querySelector('#billing-annual .save-badge');
  if (saveBadge && annualSavings > 0) {
    saveBadge.textContent = `Save $${annualSavings}/yr`;
  }

  /* ---- .map() ★ — each plan → HTML string ---- */
  const params = new URLSearchParams(window.location.search); // Prompt 6: URL params
  const highlightedPlan = params.get('plan');                 // e.g. ?plan=pro

  const html = visiblePlans
    .map(plan => {
      const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
      
      // Prompt 6: Check for deep-link highlighting
      const isHighlighted = highlightedPlan === plan.id.replace('plan-', '');
      const highlightClass = isHighlighted ? 'pricing-card--highlighted' : '';

      // .filter() inside .map() — split feature list into two groups
      const yesFeatures = plan.features              // ← .filter() ★
        .filter(f => f.included)
        .map(f => `<li class="plan-feature plan-feature--yes">${f.text}</li>`)
        .join('');

      const noFeatures = plan.features               // ← .filter() ★
        .filter(f => !f.included)
        .map(f => `<li class="plan-feature plan-feature--no">${f.text}</li>`)
        .join('');

      // Price block: numeric or "Custom"
      const priceBlock = price === null
        ? `<span class="price-amount price-custom">Custom</span>`
        : `<span class="price-currency">$</span>
           <span class="price-amount">${price}</span>
           <span class="price-period">/ ${billing === 'annual' ? 'mo, billed annually' : 'month'}</span>`;

      // CTA button
      const btnClass = plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-outline';
      const arrow    = plan.ctaStyle === 'primary' ? '<span aria-hidden="true">→</span>' : '';

      return `
        <article class="pricing-card ${plan.isPopular ? 'pricing-card--popular' : ''} ${highlightClass}"
                 id="${plan.id}">
          ${plan.isPopular ? '<div class="popular-badge">Most Popular</div>' : ''}
          <div class="plan-header">
            <span class="plan-icon">${plan.icon}</span>
            <h3 class="plan-name">${plan.name}</h3>
            <p  class="plan-desc">${plan.desc}</p>
          </div>
          <div class="plan-price">${priceBlock}</div>
          <ul class="plan-features" role="list">
            ${yesFeatures}
            ${noFeatures}
          </ul>
          <a href="${plan.ctaHref}"
             class="btn ${btnClass} plan-btn"
             id="${plan.id}-cta">
            ${plan.ctaText} ${arrow}
          </a>
        </article>`;
    })
    .join('');

  grid.innerHTML = html;                           // ← innerHTML ★
};


/* ----------------------------------------------------------
   RENDER TESTIMONIALS
   ----------------------------------------------------------
   .filter()  — show only reviews with stars >= MIN_STARS.
                Set MIN_STARS = 4 to demonstrate that a 3★
                review in the data would be excluded.

   .reduce()  — compute average star rating across ALL reviews
                (before the filter), then update #hero-avg-rating
                so the hero stat reflects real data.

   .map()     — each TESTIMONIAL object → <article> string.
                featured: true → gets the wide card class.
                '★'.repeat(stars) builds the star string.
---------------------------------------------------------- */
const renderTestimonials = () => {               // ← const + arrow fn
  const grid = document.querySelector('#testimonials-grid');
  if (!grid) return;

  const MIN_STARS = 4;

  /* ---- .reduce() ★ — average rating (uses ALL data, pre-filter) ---- */
  const totalStars = TESTIMONIALS.reduce((acc, t) => acc + t.stars, 0);
  const avgRating  = (totalStars / TESTIMONIALS.length).toFixed(1);

  // Update the live hero stat that the user sees
  const ratingEl = document.querySelector('#hero-avg-rating');
  if (ratingEl) ratingEl.textContent = `${avgRating}★`;

  /* ---- .filter() ★ — only show reviews that meet the threshold ---- */
  const html = TESTIMONIALS
    .filter(t => t.stars >= MIN_STARS)           // ← .filter() ★
    .map(({ id, stars, quote, name, role, initials, avatarColor, featured }) =>
      `<article class="testimonial-card ${featured ? 'testimonial-card--featured' : ''}"
                id="${id}">
        <div class="testimonial-stars" aria-label="${stars} out of 5 stars">
          ${'★'.repeat(stars)}
        </div>
        <blockquote class="testimonial-quote">"${quote}"</blockquote>
        <footer class="testimonial-author">
          <div class="author-avatar ${avatarColor ? `author-avatar--${avatarColor}` : ''}"
               aria-hidden="true">
            ${initials}
          </div>
          <div class="author-info">
            <cite class="author-name">${name}</cite>
            <span class="author-role">${role}</span>
          </div>
        </footer>
      </article>`
    )
    .join('');                                   // ← collapse → one string

  grid.innerHTML = html;                         // ← innerHTML ★
};


/* ----------------------------------------------------------
   BILLING TOGGLE — wires the existing toggle UI to re-render
   the pricing grid with the current billing mode.
   Uses the elements already in HTML from Prompt 1.
---------------------------------------------------------- */
const initBillingToggle = () => {               // ← const + arrow fn
  const toggleSwitch  = document.querySelector('.toggle-switch');
  const labelMonthly  = document.querySelector('#billing-monthly');
  const labelAnnual   = document.querySelector('#billing-annual');

  if (!toggleSwitch) return;

  // Prompt 6: Read from localStorage or default to monthly
  let currentBilling = localStorage.getItem('billingPref') || 'monthly';
  
  // Apply initial visual state based on preference
  const applyToggleState = (mode) => {
    labelMonthly.classList.toggle('toggle-label--active', mode === 'monthly');
    labelAnnual.classList.toggle('toggle-label--active',  mode === 'annual');
    const thumb = toggleSwitch.querySelector('.toggle-thumb');
    if (thumb) {
      thumb.style.transform = mode === 'annual' ? 'translateX(22px)' : '';
    }
  };

  applyToggleState(currentBilling);

  toggleSwitch.addEventListener('click', () => {
    // Toggle billing mode
    currentBilling = currentBilling === 'monthly' ? 'annual' : 'monthly';

    // Prompt 6: Persist choice
    localStorage.setItem('billingPref', currentBilling);

    // Visually activate the right state
    applyToggleState(currentBilling);

    // Re-render pricing cards with updated billing
    renderPlans(currentBilling);                // ← re-uses renderPlans
  });

  return currentBilling; // return choice for init
};



/* ----------------------------------------------------------
   INITIALISE — logic moved to end of file (Prompt 5)
---------------------------------------------------------- */


/* ============================================================
   ARRAY METHODS QUICK REFERENCE
   ============================================================

   arr.filter(fn)
     Returns a NEW array containing only elements where fn
     returns truthy.  Does NOT mutate the original.
     [1,2,3,4].filter(n => n > 2)  →  [3, 4]

   arr.map(fn)
     Returns a NEW array where every element is the return
     value of fn(element, index, array).
     [1,2,3].map(n => n * 2)  →  [2, 4, 6]

   arr.reduce(fn, initialValue)
     Iterates the array, passing an accumulator (acc) and the
     current element to fn.  Returns the final accumulator.
     [1,2,3].reduce((acc, n) => acc + n, 0)  →  6

   arr.join(separator)
     Joins all elements into a single string.
     ['a','b','c'].join('-')  →  'a-b-c'
     Use .join('') after .map() to build HTML strings.

   CHAINING — methods can be chained because each returns
   an array (or primitive for reduce/join):
     data
       .filter(x => x.active)   // → filtered array
       .map(x => x.name)        // → names array
       .join(', ')              // → 'Alice, Bob, ...'

   innerHTML vs textContent
     element.innerHTML  — parses string as HTML; NEVER use
                          with user input (XSS risk).
     element.textContent — sets plain text, always safe.
     Our data is static so innerHTML is fine here.

============================================================ */


/* ============================================================
   FEATURE 8 — EVENT DELEGATION & PERFORMANCE
   ============================================================
   Prompt 7: Refactor listeners to delegation, add debounce/throttle,
   and implement mousemove parallax with requestAnimationFrame.
============================================================ */

/* ----------------------------------------------------------
   MOUSEMOVE PARALLAX — HERO BLOBS
   ----------------------------------------------------------
   Uses throttle() to limit calculations to 60fps (16ms).
   Uses requestAnimationFrame to sync with browser refresh cycle.
---------------------------------------------------------- */
const initHeroParallax = () => {
  const blobs = document.querySelectorAll('.blob');
  if (blobs.length === 0) return;

  const handleMouseMove = throttle((e) => {
    // Determine cursor position relative to center
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (e.clientX - centerX) / 50;  // Subtle movement
    const moveY = (e.clientY - centerY) / 50;

    // Apply movement safely using translate
    blobs.forEach((blob, i) => {
      // Each blob moves at a slightly different speed based on index
      const speed = (i + 1) * 0.5;
      requestAnimationFrame(() => {
        blob.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });
    });
  }, 16);

  window.addEventListener('mousemove', handleMouseMove);
};


/* ----------------------------------------------------------
   EVENT DELEGATION — CARD INTERACTIONS
   ----------------------------------------------------------
   Instead of 20 separate click listeners (one per card), we add
   one listener to each parent grid.
   
   Benefits:
     • Lower memory usage.
     • No need to re-bind when grids are re-rendered.
     • Cleaner code (logical branching).
---------------------------------------------------------- */
const initGridDelegation = () => {
  const grids = [
    '#features-grid', 
    '#pricing-grid', 
    '#testimonials-grid'
  ];

  grids.forEach(selector => {
    const parent = document.querySelector(selector);
    if (!parent) return;

    // Use delegation on the parent container
    parent.addEventListener('click', (e) => {
      // Find the closest card component
      const card = e.target.closest('.feature-card, .pricing-card, .testimonial-card');
      if (!card) return;

      // Handle CTA button clicks specifically
      const btn = e.target.closest('.btn');
      if (btn) {
        // Logging for demo purposes — in real app, might track analytics here
        console.group('Event Delegation: CTA Click');
        console.info(`Card ID: ${card.id}`);
        console.info(`Button Text: ${btn.textContent.trim()}`);
        console.groupEnd();
        
        // Let natural link navigation happen unless it's a dummy href
        if (btn.getAttribute('href') === '#') {
          e.preventDefault();
          alert(`You selected the ${card.id.split('-').pop()} plan!`);
        }
        return;
      }

      // Handle general card click (e.g. highlight it)
      console.info(`Interaction: Card ${card.id} selected`);
      
      // Visual feedback via temporary class
      card.style.transition = 'transform 0.2s ease';
      card.style.transform = 'scale(0.98)';
      setTimeout(() => card.style.transform = '', 200);
    });
  });
};


// Initialization
initHeroParallax();
initGridDelegation();


/* ============================================================
   FEATURE 7 — INTERSECTIONOBSERVER & BROWSER APIs
   ============================================================
   Prompt 6: IntersectionObserver for scroll animations,
   localStorage for persistence, URLSearchParams for deep links.
============================================================ */

/**
 * initScrollReveal
 * Uses IntersectionObserver to detect when .reveal elements
 * enter the viewport and add the .reveal--visible class.
 */
const initScrollReveal = () => {
  const options = {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px' // Slightly offset bottom for better feel
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        // Once revealed, we can stop observing this specific element
        observer.unobserve(entry.target);
      }
    });
  }, options);

  // Start observing all elements with the .reveal class
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// Start scroll reveal logic immediately
initScrollReveal();


/* ============================================================
   FEATURE 6 — PROMISES & ASYNC/AWAIT
   ============================================================
   Prompt 5: Simulate an API call, show skeleton loaders,
   render on resolve, handle errors with try/catch.

   Concepts demonstrated:
     Promise          — new Promise((resolve, reject) => ...)
     async function   — declares a function that always returns a Promise
     await            — pauses execution inside an async fn until
                        the Promise settles
     try / catch      — catches rejected Promises (network errors)
     Skeleton loaders — placeholder UI shown while data is in-flight
     Retry pattern    — event delegation + a registry of loader fns
============================================================ */


/* ----------------------------------------------------------
   SKELETON BUILDERS
   Pure functions that return placeholder HTML strings.
   Called BEFORE the API resolves to give instant visual feedback.
   The shimmer animation is defined in style.css.
---------------------------------------------------------- */

/**
 * buildTestimonialSkeletons
 * Returns 6 skeleton cards matching the real testimonials grid,
 * with the first card spanning 2 columns (like the featured card).
 */
const buildTestimonialSkeletons = () =>
  TESTIMONIALS.map((_, i) => `
    <div class="skeleton-testimonial ${i === 0 ? 'testimonial-card--featured' : ''}">
      <span class="skel skel-stars"></span>
      <span class="skel skel-line skel-full"></span>
      <span class="skel skel-line skel-medium"></span>
      <span class="skel skel-line skel-short"></span>
      <div class="skel-author">
        <span class="skel skel-avatar"></span>
        <div class="skel-text-block">
          <span class="skel skel-line" style="width:52%"></span>
          <span class="skel skel-line" style="width:70%"></span>
        </div>
      </div>
    </div>`
  ).join('');


/**
 * buildPricingSkeletons
 * Returns 3 skeleton pricing cards.
 * Middle card gets the popular border for visual continuity.
 */
const buildPricingSkeletons = () => {
  const featureWidths = ['full', 'full', 'medium', 'full', 'short', 'full', 'medium'];
  return Array.from({ length: 3 }, (_, i) => `
    <div class="skeleton-pricing ${i === 1 ? 'pricing-card--popular' : ''}">
      <span class="skel skel-line" style="width:35%;height:13px"></span>
      <span class="skel skel-price"></span>
      ${featureWidths.map(w =>
        `<span class="skel skel-line skel-${w}"></span>`
      ).join('')}
      <span class="skel skel-btn"></span>
    </div>`
  ).join('');
};


/**
 * buildErrorState
 * Returns an error card with a retry button.
 * The button carries a data-retry key so the delegation
 * listener below can fire the correct loader.
 *
 * @param {string} message  — error.message from the catch block
 * @param {string} retryKey — key into RETRY_REGISTRY
 */
const buildErrorState = (message, retryKey) =>
  `<div class="error-state">
    <span class="error-icon" aria-hidden="true">⚠️</span>
    <p class="error-message">${message}</p>
    <button class="btn btn-outline" data-retry="${retryKey}">
      Try Again
    </button>
  </div>`;


/* ----------------------------------------------------------
   RETRY REGISTRY + EVENT DELEGATION
   ----------------------------------------------------------
   Instead of embedding an onclick="fn()" in the HTML (bad
   practice), we store loader functions in a plain object
   keyed by name, then use one delegated click listener on
   document to dispatch to the right function.
   This is safe because retry buttons are dynamically
   injected and may not exist at page-load time.
---------------------------------------------------------- */
const RETRY_REGISTRY = {};   // { 'pricing': fn, 'testimonials': fn }

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-retry]');
  if (!btn) return;
  const key = btn.getAttribute('data-retry');
  if (typeof RETRY_REGISTRY[key] === 'function') {
    RETRY_REGISTRY[key]();
  }
});


/* ----------------------------------------------------------
   ASYNC LOADER — PRICING PLANS
   ----------------------------------------------------------
   async keyword   → this function implicitly returns a Promise.
   await keyword   → pauses here until fetchPricingPlans() settles.
                     Only valid INSIDE an async function.
   try { }         → runs the happy-path code.
   catch (error)   → runs if the awaited Promise rejects.

   Loading sequence:
     1. Insert skeleton HTML immediately (synchronous)
     2. await the mock API (pauses ~1.2 s)
     3a. Resolve → renderPlans() + wire billing toggle
     3b. Reject  → show error card with retry button
---------------------------------------------------------- */
const loadPricingAsync = async () => {           // ← async function ★
  const grid = document.querySelector('#pricing-grid');
  if (!grid) return;

  // Step 1 — skeleton (instant, before any async work)
  grid.innerHTML = buildPricingSkeletons();

  try {                                          // ← try ★

    // Step 2 — await the Promise (pauses here ~1.2 s)
    const plans = await fetchPricingPlans();     // ← await ★

    // Step 3a — data arrived; plans is the resolved array
    // We still let renderPlans() read from the global PLANS
    // (same data, but the round-trip through mockFetch proves
    // the async pipeline works end-to-end).
    const pref = initBillingToggle(); // Prompt 6: read stored pref
    renderPlans(pref);
    // initBillingToggle is called above now

    console.info(`✓ Pricing loaded: ${plans.length} plans`);

  } catch (error) {                              // ← catch ★

    // Step 3b — Promise rejected (shouldFail: true in api.js)
    grid.innerHTML = buildErrorState(error.message, 'pricing');
    console.error('Pricing load failed:', error.message);

  }
};

// Register retry function
RETRY_REGISTRY['pricing'] = loadPricingAsync;


/* ----------------------------------------------------------
   ASYNC LOADER — TESTIMONIALS
   ----------------------------------------------------------
   Same pattern as loadPricingAsync but with a longer simulated
   delay (1.8 s) so you can see both grids loading at different
   speeds — demonstrating that async operations run independently
   without blocking each other.
---------------------------------------------------------- */
const loadTestimonialsAsync = async () => {      // ← async function ★
  const grid = document.querySelector('#testimonials-grid');
  if (!grid) return;

  // Step 1 — skeleton
  grid.innerHTML = buildTestimonialSkeletons();

  try {                                          // ← try ★

    // Step 2 — await (pauses ~1.8 s)
    const data = await fetchTestimonials();      // ← await ★

    // Step 3a — render using resolved data
    renderTestimonials();

    // .reduce() computed the average rating; update hero stat too
    const avg = (data.reduce((s, t) => s + t.stars, 0) / data.length).toFixed(1);
    const ratingEl = document.querySelector('#hero-avg-rating');
    if (ratingEl) ratingEl.textContent = `${avg}★`;

    console.info(`✓ Testimonials loaded: ${data.length} reviews, avg ${avg}★`);

  } catch (error) {                              // ← catch ★

    grid.innerHTML = buildErrorState(error.message, 'testimonials');
    console.error('Testimonials load failed:', error.message);

  }
};

// Register retry function
RETRY_REGISTRY['testimonials'] = loadTestimonialsAsync;


/* ----------------------------------------------------------
   ASYNC INIT — replaces the synchronous initRendering() call
   ----------------------------------------------------------
   Features are still rendered synchronously (data is already
   in memory, no network involved).
   Pricing and testimonials now go through the async loaders.
   They run in parallel — Promise.all is NOT used here
   intentionally so you can see them resolve independently.
   Use Promise.all([loadPricingAsync(), loadTestimonialsAsync()])
   if you want to wait for both before doing something else.
---------------------------------------------------------- */
const initRenderingAsync = async () => {         // ← async function ★

  // Synchronous — no loading state needed
  renderFeatures();

  // These two fire simultaneously but settle at different times
  // (1.2 s and 1.8 s respectively) — no await here means they
  // run concurrently.  Each manages its own skeleton + render.
  loadPricingAsync();        // NOT awaited → runs concurrently
  loadTestimonialsAsync();   // NOT awaited → runs concurrently
};

// Entry point
initRenderingAsync();


/* ============================================================
   ASYNC/AWAIT QUICK REFERENCE
   ============================================================

   Promise
     Represents a value not yet known. Has 3 states:
       pending   → neither fulfilled nor rejected
       fulfilled → resolved with a value  (resolve(val))
       rejected  → failed with a reason   (reject(err))

   new Promise((resolve, reject) => { ... })
     Manually construct a Promise. Pass resolve/reject to the
     executor and call whichever is appropriate.

   async function
     • Always returns a Promise (auto-wraps the return value).
     • Enables the await keyword inside its body.
     async function greet() { return 'hi'; }
     // greet() returns Promise<'hi'>

   await expression
     • Pauses the async function until the Promise settles.
     • Resumes with the resolved value on success.
     • Throws the rejection reason on failure → caught by catch.
     const data = await fetch(url).then(r => r.json());

   try / catch
     Wraps await expressions to handle rejections cleanly:
       try {
         const result = await somePromise();
       } catch (err) {
         console.error(err.message);
       }

   Running in parallel (vs sequential)
     SEQUENTIAL (each waits for the previous):
       await loadPricing();       // 1.2 s
       await loadTestimonials();  // then 1.8 s → total 3.0 s

     PARALLEL (both start immediately):
       loadPricing();             // starts, does NOT block
       loadTestimonials();        // starts immediately
       // → both finish in ~1.8 s (dominated by slower one)

     PARALLEL + wait-for-all:
       await Promise.all([loadPricing(), loadTestimonials()]);
       // → both must fulfil; if either rejects, catch fires

============================================================ */
