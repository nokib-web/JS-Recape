'use strict';

import { PLANS, TESTIMONIALS } from './data.js';

/* ----------------------------------------------------------
   mockFetch  — core Promise factory
   ---------------------------------------------------------- */
const mockFetch = (data, { delayMs = 1200, shouldFail = false } = {}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('503 Service Unavailable — please try again'));
      } else {
        resolve(JSON.parse(JSON.stringify(data)));
      }
    }, delayMs);
  });
};

/**
 * Simulates  GET /api/plans
 */
export const fetchPricingPlans = () =>
  mockFetch(PLANS, { delayMs: 1200, shouldFail: false });

/**
 * Simulates  GET /api/testimonials
 */
export const fetchTestimonials = () =>
  mockFetch(TESTIMONIALS, { delayMs: 1800, shouldFail: false });
