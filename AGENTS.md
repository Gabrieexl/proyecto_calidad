# Code Review Rules (GGA)

## Project Architecture (CRM)
- Pages/routes must live under `/app`
- API routes must live under `/app/api`
- Reusable UI components must live under `/app/components`
- Do not create duplicate components with similar purpose (reuse existing components)

## Debugging / Logging (STRICT)
- PROHIBITED: `console.log`, `console.debug`, `console.warn`, `console.error` in *.ts and *.tsx
- If any `console.*` is detected, the commit must FAIL

