# @ad6/web — React 19 Frontend Client

Enterprise web application frontend built with React 19, TypeScript, Tailwind CSS, and PWA capabilities.

## Domain Data Policy
In accordance with Guardrail G-1:
- Domain data (incidents, permits, CAPAs, audits) is fetched and mutated via `/api/v1/*` using `EnterpriseApiClient`.
- LocalStorage is strictly prohibited for domain records.
