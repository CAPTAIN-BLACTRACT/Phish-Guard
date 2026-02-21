## 2025-05-15 - [Securing Admin Access]
**Vulnerability:** Hardcoded administrative credentials in multiple frontend components (`src/App.jsx` and `src/pages/Admin/index.jsx`).
**Learning:** Legacy development often leaves "demo" or placeholder credentials in the code, which can be easily discovered in the client-side bundle if not moved to environment variables. Redundant auth checks across layers can lead to inconsistent security if not unified.
**Prevention:** Always use environment variables for any access control logic, even if it's just a UI-level gate. Implement `maxLength` constraints on all user-facing inputs to prevent large-payload attacks.
