/**
 * ============================================================
 *  api.js  — Mock API Layer
 *  Prompt 5: Promises & Async/Await
 * ============================================================
 *
 *  Simulates a real network API using Promise + setTimeout.
 *  Load order: data.js → api.js → app.js
 *
 *  In a real app this file would:
 *    fetch('/api/plans').then(res => res.json())
 *  Here we wrap our in-memory data in a timed Promise so every
 *  async/await, try/catch, and loading-state pattern works
 *  exactly as it would against a real server.
 * ============================================================
 */

'use strict';

/* ----------------------------------------------------------
   mockFetch  — core Promise factory
   ----------------------------------------------------------
   new Promise((resolve, reject) => { ... })
     The executor function runs IMMEDIATELY (synchronously).
     Inside it we start a setTimeout to simulate latency.
     • resolve(value) → promise fulfils → .then() / await returns value
     • reject(error)  → promise rejects  → .catch() / try/catch fires

   JSON.parse(JSON.stringify(data))
     Produces a deep clone, exactly what fetch().json() does —
     the caller can't accidentally mutate the "server" data.

   @param {*}       data
   @param {object}  [opts]
   @param {number}  [opts.delayMs=1200]  — simulated latency
   @param {boolean} [opts.shouldFail]    — flip to true to demo errors
---------------------------------------------------------- */
const mockFetch = (data, { delayMs = 1200, shouldFail = false } = {}) => {
  return new Promise((resolve, reject) => {   // ← new Promise ★

    setTimeout(() => {

      if (shouldFail) {
        reject(new Error('503 Service Unavailable — please try again'));
      } else {
        resolve(JSON.parse(JSON.stringify(data)));  // deep clone
      }

    }, delayMs);

  });
};


/* ----------------------------------------------------------
   Public API endpoints
   ↓ Flip shouldFail: true on either to see the error UI.
---------------------------------------------------------- */

/**
 * Simulates  GET /api/plans
 * Resolves after ~1.2 s with an array of plan objects.
 */
const fetchPricingPlans = () =>
  mockFetch(PLANS,         { delayMs: 1200, shouldFail: false });  // ← PLANS from data.js

/**
 * Simulates  GET /api/testimonials
 * Resolves after ~1.8 s — intentionally slower to show
 * both grids loading independently at different speeds.
 */
const fetchTestimonials = () =>
  mockFetch(TESTIMONIALS,  { delayMs: 1800, shouldFail: false });  // ← TESTIMONIALS from data.js
