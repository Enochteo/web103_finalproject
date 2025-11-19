# Milestone 4

This document should be completed and submitted during **Unit 8** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [x] Update the completion percentage of each GitHub Milestone. The milestone for this unit (Milestone 4 - Unit 8) should be 100% completed when you submit for full points.
- [x] In `readme.md`, check off the features you have completed in this unit by adding a ✅ emoji in front of the feature's name.
  - [x] Under each feature you have completed, include a GIF showing feature functionality.
- [x] In this document, complete all five questions in the **Reflection** section below.

## Reflection

### 1. What went well during this unit?

Several things went well this unit:

- Backend stabilization: I fixed database connection handling to support both local PG env vars and hosted `DATABASE_URL` (with SSL options), made the pool resilient to idle errors, and added a small script to seed an initial admin user.
- Authentication hardening: I updated the registration/login flow to hash passwords with `bcrypt`, improved the passport-local configuration, and added server endpoints (`/api/login`, `/api/logout`, `/api/me`) so the client can manage session state reliably.
- Role-based workflows: I implemented technician and admin controllers and routes (assigning requests, updating status, creating resolutions, deleting categories), and protected admin-only endpoints with role middleware.
- Frontend polish and consistency: I added an `AuthProvider`, wired role-aware navigation, implemented technician and admin dashboard pages, and introduced a tokenized global stylesheet so pages have a consistent, professional look.
- File upload & resolutions: Integrated Supabase storage for resolution images, created server endpoints to record resolution metadata, and made the technician UI upload and display resolution photos.

These changes made local dev flows and the app's core features much more reliable and testable.

### 2. What were some challenges your group faced in this unit?

Key challenges:

- Environment mismatches: Vite's required `VITE_` env prefix and server `DATABASE_URL` vs PG\_\* naming caused several connection and runtime errors until standardized.
- DB SSL and hosted database behavior: hosted Postgres instances required special SSL config (`rejectUnauthorized: false`) and caused intermittent connection issues during development.
- Password migration: existing plaintext or legacy hashed passwords in the DB required a careful migration approach and a script to re-hash credentials safely.
- Broken/overwritten files during iteractive edits: a few iterative patches corrupted files (e.g., `App.jsx` / `CreateRequest.jsx`) at one point and needed careful recovery.
- Dev proxy and CORS: without the Vite dev proxy configured, the client returned 404s for `/api` and sessions weren't shared; that required updating `vite.config.js` (and server CORS) and instructing teammates to restart dev servers.
- Supabase storage shape: changes between Supabase SDK versions required updating upload/getPublicUrl handling to use the v2 return shapes.

These challenges were mostly resolved but highlighted the importance of environment parity and careful patching.

### Did you finish all of your tasks in your sprint plan for this week? If you did not finish all of the planned tasks, how would you prioritize the remaining tasks on your list?

Status: Mostly finished, with a few remaining polish tasks.

Completed:

- Backend: dotenv/db improvements, password hashing for new users, admin creation script, role middleware and controllers for technician/admin actions, pagination support on GET `/api/requests`.
- Frontend: `AuthProvider`, login/logout flows, CreateRequest mockup, global CSS tokens, technician & admin dashboards scaffolded and wired to the API, resolution upload UI.

Remaining / partially complete:

- Full admin UI (request detail page, category management) — scaffolded but needs UX polish.
- Pagination controls and sorting UI across dashboards — API returns `meta` but the UI needs Prev/Next controls.
- End-to-end tests and user acceptance testing across roles.

Prioritization plan:

1. Add pagination controls and server-side joins for human-friendly fields (category name, technician username) to improve admin usability.
2. Finish admin request-detail & category CRUD UI (high priority for project completeness).
3. Add basic E2E smoke tests (Cypress or Playwright) for the login → create request → assign → resolve flows.
4. Address any remaining accessibility/usability issues (focus states, keyboard nav).

This order prioritizes functionality that affects instructors' ability to review role-based flows and data correctness.

### Which features and user stories would you consider “at risk”? How will you change your plan if those items remain “at risk”?

At-risk features:

- Admin management UI (full CRUD for categories, user management) — currently scaffolded but not fully polished.
- Robust pagination/filtering UI — server supports filters and meta, but the client needs pagination controls and better server joins for display fields.
- Deployment-related tasks (Render configuration, environment secrets, Supabase bucket permissions) — these are operational and require careful verification.

If items remain at risk:

- De-scope advanced UI polish (animations, deep UX improvements) and deliver working CRUD and pagination controls first.
- Provide clear runbook for instructors to exercise role flows manually (seeded admin account, sample requests) so grading can proceed even if the admin UX is rough.
- Schedule a short pairing session to resolve any remaining deployment or DB migration issues quickly.

### 5. What additional support will you need in upcoming units as you continue to work on your final project?

Additional support requested:

- Quick review of production DB migrations and backup steps before attempting a destructive migration (I can provide migration SQL and would appreciate a second set of eyes).
- Help configuring Render (or another host) with the correct environment variables and secrets (especially for Supabase and Postgres SSL settings).
- Assistance writing a small set of E2E tests to validate the role-based workflows (login, create, assign, resolve), or guidance on a minimal testing setup.
- UX feedback on the admin/technician pages (what information should be most prominent on each card, expected filters/sorts).

With this support I can prioritize finishing the admin UX and verifying the deployment flow.
