/**
 * ============================================================
 *  data.js  — Application Data Layer
 *  Prompt 4: Array Methods & Dynamic Rendering
 * ============================================================
 *
 *  All content that was previously hardcoded in HTML is now
 *  stored as plain JavaScript arrays of objects.
 *
 *  Why separate this into its own file?
 *    • Single source of truth — edit here, DOM updates everywhere.
 *    • Separation of concerns — data vs. rendering logic vs. UI.
 *    • Easy to swap with a real API fetch() in a future prompt.
 *
 *  Loaded via <script src="data.js"> BEFORE app.js, so these
 *  variables are on the global scope when app.js runs.
 * ============================================================
 */

'use strict';

/* ============================================================
   FEATURES  (used by renderFeatures)
   ============================================================
   Each object represents one feature card.
   Properties:
     id          — becomes the article's id attribute
     iconColor   — maps to CSS class  feature-icon--{iconColor}
     icon        — raw SVG string rendered inside the icon div
     title       — card heading
     desc        — card body text
     tags        — array of pill labels
     wide        — true → gets the grid-column: span 2 class
     hidden      — true → filtered OUT by .filter() before render
============================================================ */
const FEATURES = [
  {
    id: 'feature-ai',
    iconColor: 'purple',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <path d="M12 2L2 7l10 5 10-5-10-5z"/>
             <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
           </svg>`,
    title: 'AI-Powered Automation',
    desc: 'Eliminate repetitive tasks with intelligent workflows. Our AI learns your patterns and automates up to 80% of your daily operations — no code required.',
    tags: ['Smart Triggers', 'Auto-Routing', 'ML Insights'],
    wide: true,
    hidden: false,
  },
  {
    id: 'feature-analytics',
    iconColor: 'blue',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
           </svg>`,
    title: 'Real-Time Analytics',
    desc: 'Live dashboards with sub-second updates. Drill into any metric, segment by any dimension, and share interactive reports.',
    tags: ['Live Data', 'Custom KPIs'],
    wide: false,
    hidden: false,
  },
  {
    id: 'feature-collab',
    iconColor: 'cyan',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
             <circle cx="9" cy="7" r="4"/>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
           </svg>`,
    title: 'Team Collaboration',
    desc: 'Bring your entire org onto one platform. Real-time editing, threaded comments, and role-based permissions built-in.',
    tags: ['Multiplayer', 'RBAC'],
    wide: false,
    hidden: false,
  },
  {
    id: 'feature-security',
    iconColor: 'green',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
           </svg>`,
    title: 'Enterprise Security',
    desc: 'SOC 2 Type II certified. End-to-end encryption, SSO, MFA, audit logs, and customizable data residency controls.',
    tags: ['SOC 2', 'SSO / SAML'],
    wide: false,
    hidden: false,
  },
  {
    id: 'feature-integrations',
    iconColor: 'orange',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <circle cx="18" cy="18" r="3"/>
             <circle cx="6" cy="6" r="3"/>
             <path d="M13 6h3a2 2 0 0 1 2 2v7M11 18H8a2 2 0 0 1-2-2V9"/>
           </svg>`,
    title: '300+ Integrations',
    desc: 'Connect your entire stack. Native integrations with Slack, Salesforce, HubSpot, GitHub, Zapier, and hundreds more.',
    tags: ['REST API', 'Webhooks'],
    wide: false,
    hidden: false,
  },
  {
    id: 'feature-scale',
    iconColor: 'pink',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5">
             <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
             <polyline points="17 6 23 6 23 12"/>
           </svg>`,
    title: 'Infinite Scale, Zero Ops',
    desc: 'Built on a globally distributed infrastructure that scales automatically from 1 to 1 million users. No capacity planning, no server management — ever.',
    tags: ['Auto-Scale', '99.9% Uptime', 'CDN Edge'],
    wide: true,
    hidden: false,
  },
];


/* ============================================================
   PLANS  (used by renderPlans)
   ============================================================
   Each object represents one pricing tier.
   Properties:
     id            — article id
     icon          — emoji
     name / desc   — plan title and subtitle
     monthlyPrice  — number shown in Monthly billing mode
                     null = "Custom" (no price displayed)
     annualPrice   — number shown in Annual billing mode
     features      — array of { text, included } objects;
                     .filter(f => f.included) → green list
                     .filter(f => !f.included) → struck-out list
     isPopular     — true → adds "Most Popular" badge + card style
     ctaText       — button label
     ctaStyle      — 'primary' | 'outline'
     ctaHref       — button href
     hidden        — true → excluded by .filter() from render
============================================================ */
const PLANS = [
  {
    id: 'plan-starter',
    icon: '⚡',
    name: 'Starter',
    desc: 'Perfect for solo makers and side projects.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { text: 'Up to 3 projects',   included: true  },
      { text: '5 team members',     included: true  },
      { text: '10,000 events/mo',   included: true  },
      { text: 'Basic analytics',    included: true  },
      { text: 'AI Automation',      included: false },
      { text: 'Priority support',   included: false },
      { text: 'SSO & SAML',         included: false },
    ],
    isPopular: false,
    ctaText: 'Get Started Free',
    ctaStyle: 'outline',
    ctaHref: '#',
    hidden: false,
  },
  {
    id: 'plan-pro',
    icon: '🚀',
    name: 'Pro',
    desc: 'For growing teams who need more power.',
    monthlyPrice: 49,
    annualPrice: 39,          // 20% annual discount
    features: [
      { text: 'Unlimited projects',  included: true  },
      { text: '25 team members',     included: true  },
      { text: '1M events/mo',        included: true  },
      { text: 'Advanced analytics',  included: true  },
      { text: 'AI Automation',       included: true  },
      { text: 'Priority support',    included: true  },
      { text: 'SSO & SAML',          included: false },
    ],
    isPopular: true,
    ctaText: 'Start Pro Trial',
    ctaStyle: 'primary',
    ctaHref: '#',
    hidden: false,
  },
  {
    id: 'plan-enterprise',
    icon: '🏢',
    name: 'Enterprise',
    desc: 'For large organizations with custom needs.',
    monthlyPrice: null,       // null → renders "Custom" instead of a price
    annualPrice: null,
    features: [
      { text: 'Unlimited projects',      included: true },
      { text: 'Unlimited members',       included: true },
      { text: 'Unlimited events',        included: true },
      { text: 'Custom analytics',        included: true },
      { text: 'AI Automation',           included: true },
      { text: '24/7 dedicated support',  included: true },
      { text: 'SSO & SAML',              included: true },
    ],
    isPopular: false,
    ctaText: 'Contact Sales',
    ctaStyle: 'outline',
    ctaHref: '#footer',
    hidden: false,
  },
];


/* ============================================================
   TESTIMONIALS  (used by renderTestimonials)
   ============================================================
   Each object represents one review card.
   Properties:
     id          — article id
     stars       — numeric rating (used by reduce for avg + filter)
     quote       — review text (no outer quotes — template adds them)
     name        — reviewer full name
     role        — job title · company
     initials    — 2-letter avatar label
     avatarColor — '' = default purple | 'blue'|'green'|etc.
     featured    — true → card gets testimonial-card--featured class
                   (wide, highlighted) — used by .filter()
============================================================ */
const TESTIMONIALS = [
  {
    id: 'testimonial-1',
    stars: 5,
    quote: 'NovaSaaS completely replaced our stack of six different tools. The AI automation alone saved us 30+ hours per week. The ROI was visible within the first month — genuinely astounding.',
    name: 'Sarah Rodriguez',
    role: 'Head of Operations · Acme Corp',
    initials: 'SR',
    avatarColor: '',
    featured: true,
  },
  {
    id: 'testimonial-2',
    stars: 5,
    quote: 'The analytics dashboard is addictive. I check it every morning and it genuinely informs every decision we make as a company.',
    name: 'James Kim',
    role: 'CTO · Nexum',
    initials: 'JK',
    avatarColor: 'blue',
    featured: false,
  },
  {
    id: 'testimonial-3',
    stars: 5,
    quote: 'Onboarding a 200-person team took less than a week. The enterprise security features gave our compliance team peace of mind from day one.',
    name: 'Maya Patel',
    role: 'VP Engineering · Pulse Labs',
    initials: 'MP',
    avatarColor: 'green',
    featured: false,
  },
  {
    id: 'testimonial-4',
    stars: 5,
    quote: 'We scaled from 5 to 500 employees without ever worrying about infrastructure. NovaSaaS just handles it — zero ops overhead is a game changer.',
    name: 'David Lee',
    role: 'Founder & CEO · Vanta',
    initials: 'DL',
    avatarColor: 'orange',
    featured: false,
  },
  {
    id: 'testimonial-5',
    stars: 5,
    quote: 'The integration with our existing tools was seamless. We were live in 48 hours. The support team is exceptional — they feel like an extension of our own team.',
    name: 'Aisha Thompson',
    role: 'Product Lead · Drift',
    initials: 'AT',
    avatarColor: 'pink',
    featured: false,
  },
  {
    id: 'testimonial-6',
    stars: 5,
    quote: "I've used a lot of SaaS products over 20 years in tech. NovaSaaS is genuinely in a different league. The product quality and velocity of iteration is remarkable.",
    name: 'Robert Nguyen',
    role: 'Director of Tech · Horizon',
    initials: 'RN',
    avatarColor: 'cyan',
    featured: false,
  },
];
