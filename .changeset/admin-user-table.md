---
'@neuronection/assistant-ui': minor
---

`admin-user-table` gains `AdminUserTable`, a presentational + controlled admin user management table (identity-auth §12): email with `"(you)"` marker, activity count, role/status badges and per-row promote/demote, activate/deactivate, inline password reset (min-length gate) and force logout, with loading/empty/error states and guard-rail 403s surfaced through label-driven messages (`describeAdminUserError`). Strings and icons pass in as props with English defaults, tokens only. First consumer is study's admin Users tab (just-in-time exception); career adopts in Phase 3.
