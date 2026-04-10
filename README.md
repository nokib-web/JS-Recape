# NovaSaaS — Premium Landing Page

A modern, high-performance SaaS landing page built with **Vanilla JavaScript (ES6+)**, **CSS3**, and **Semantic HTML5**. 

This project was built as a deep dive into modern JavaScript patterns, Browser APIs, and performance optimizations.

## 🚀 Technical Highlights

- **Dynamic Data Rendering**: Completely data-driven architecture. All features, pricing, and testimonials are stored in JS objects and rendered using `.map()`, `.filter()`, and `.reduce()`.
- **Async API Simulation**: Implements a mock Promise-based API layer (`api.js`) with skeleton loaders and robust error handling (`try/catch`).
- **Performance Optimized**: 
  - **Debounced** scroll handlers for smooth glassmorphism transitions.
  - **Throttled** mousemove parallax effects for the hero section background.
  - **Event Delegation** on all grid components to minimize memory overhead.
- **Modern Browser APIs**: 
  - **IntersectionObserver** for scroll-reveal animations.
  - **localStorage** for persistent pricing toggle preferences.
  - **URLSearchParams** for deep-linking into specific pricing plans.
- **Design Excellence**: Dark mode glassmorphism aesthetic with vibrant gradients, custom typography, and responsive mobile-first architecture.

## 🛠️ Project Structure

- `index.html`: Semantic structure and SEO-optimized markup.
- `style.css`: Design system, utility classes, and custom animations.
- `app.js`: Core logic, rendering modules, and event orchestration.
- `data.js`: The application's data layer (source of truth).
- `api.js`: Mock network layer for async pattern practice.

## 📦 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/nokib-web/JS-Recape.git
   ```
2. Open `index.html` in any modern browser.
3. No build tools or dependencies required — pure Vanilla JS.

---
Built with ❤️ by [Nokib]
