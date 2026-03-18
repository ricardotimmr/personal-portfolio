# Ricardo Timm – Portfolio

Personal portfolio website showcasing selected frontend and UX/UI projects.

The goal of this project is to present case studies, design thinking, and technical implementation in a clean, structured, and interactive format suitable for professional applications.

---

## Overview

This portfolio is designed to:

- Present selected projects with a clear problem–solution structure  
- Highlight UX/UI thinking and frontend implementation skills  
- Demonstrate interaction design and animation concepts  
- Provide recruiters with a focused and accessible overview of my work  

The visual direction is minimal, structured, and typography-driven, with subtle interactive elements.

---

## Objectives

- Create a clean and performance-oriented portfolio  
- Integrate purposeful animations without compromising usability  
- Structure projects as case studies rather than simple galleries  
- Reflect my personal design and development philosophy  

---

## Design Principles

- Clarity over decoration  
- Strong typography and spacing  
- Intentional motion  
- Accessibility-first approach  
- Responsive by default  

---

## Target Audience

- Recruiters  
- Hiring managers  
- Design leads  
- Technical leads  

---

## Tech Stack

- React  
- TypeScript  
- Vite  
- CSS

---

## Testing

- Unit tests: `npm run test:unit`
- Unit tests (watch): `npm run test:unit:watch`
- E2E (Chromium + WebKit/Safari): `npm run test:e2e`
- E2E (Edge): `npm run test:e2e:edge`
- E2E (all configured browsers): `npm run test:e2e:all`
- All tests (unit + Chromium/WebKit): `npm run test:all`

The E2E suite covers cross-platform-sensitive behavior such as:

- Route transition completion
- Info page river reveal progression
- Reduced-motion fallback behavior
- Wheel `deltaMode` normalization for scroll consistency
- Theming persistence and toggle behavior
- Hover and interaction states for key navigation/gallery elements
- Route layout checks for horizontal overflow regressions

---

## Security & Trust Hardening

This project is configured with strict response headers (CSP, HSTS, anti-framing, MIME sniffing protection),
local font hosting, and restricted outbound resource policies.

Operational checks that should stay enabled in production:

- Use `ricardo-timm.com` as canonical domain and redirect `www` to apex
- Keep DNS records and TLS certificate ownership stable over time
- Enable DNSSEC and CAA records at DNS provider level (outside this repository)
- Keep privacy/legal content aligned with actual external resource usage

---

## Status

Currently in design and conceptual development phase.

---

## License

This project is for personal portfolio use.  
All projects and assets belong to their respective owners unless stated otherwise.
