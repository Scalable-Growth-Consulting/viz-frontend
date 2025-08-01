# DUFA (Demand Understanding & Forecasting Agent) Feature Documentation

## Overview
DUFA is an advanced, modular forecasting feature for the Viz BI Agent application, providing stepwise demand forecasting, AI-powered explanations, and PDF report generation. It includes robust role-based access control and a Coming Soon landing page for non-admin users.

---

## Key Features
- **Stepwise Forecasting Workflow:**
  - Dataset selection from BigQuery tables
  - Forecast configuration (algorithm, horizon, seasonality)
  - Forecast analysis (charts, best model, metrics)
  - AI-powered explanation chatbot
  - PDF report download
- **Progress Bar:**
  - Dynamic, segmented progress (0-50%: data/model, 50-75%: chat, 75-100%: PDF)
  - Tooltip with real-time step guidance
- **Role-Based Access:**
  - Only admin (creationvision03@gmail.com) can access full DUFA
  - Non-admins redirected to animated "Coming Soon" page with early access email capture
- **Modular Components:**
  - `DUFAAccessGuard`, `DUFAProgressTracker`, `DUFAPDFGenerator`, `DUFAChatbot`, `DUFAComingSoon`
- **Responsive UI:**
  - Centered DUFA button in navbar
  - Modern, animated, accessible design
- **Unit Tests:**
  - Access control, progress bar logic, modularity, and Coming Soon UX

---

## File Structure
- `src/components/dufa/DUFAAccessGuard.tsx` – Role-based access wrapper
- `src/components/dufa/DUFAProgressTracker.tsx` – Progress bar with tooltip
- `src/components/dufa/DUFAPDFGenerator.tsx` – PDF report generator
- `src/components/dufa/DUFAChatbot.tsx` – AI chatbot
- `src/pages/DUFA.tsx` – Main DUFA workflow page
- `src/pages/DUFAComingSoon.tsx` – Early access landing page
- `src/components/Header.tsx` – Navbar with centered DUFA button

## Routing
- `/dufa` – Main DUFA experience (admin only)
- `/dufa-coming-soon` – Non-admin landing/early access

## Tests
- `src/components/dufa/__tests__/DUFAAccessGuard.test.tsx`
- `src/components/dufa/__tests__/DUFAProgressTracker.test.tsx`
- `src/pages/__tests__/DUFA.test.tsx`
- `src/pages/__tests__/DUFAComingSoon.test.tsx`

Run tests with your preferred React/Vite test runner (e.g., Vitest, Jest).

---

## Deployment & Usage
1. Ensure Supabase credentials are set for auth and backend.
2. All DUFA enhancements are modular and backward compatible.
3. To add new admins, update the email logic in `DUFAAccessGuard.tsx`.
4. For production, wire up the email capture in `DUFAComingSoon.tsx` to a real backend.

---

## Contact
For issues or feature requests, contact the Viz BI Agent engineering team.
