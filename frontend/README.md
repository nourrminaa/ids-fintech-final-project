# IDS Products Portal (frontend, mock data)

React + TypeScript frontend for the internal products portal, built against mock data.
No backend calls yet, all data lives in memory for the session.

## Run it

```
npm install
npm run dev
```

Then open the URL Vite prints, normally `http://localhost:5173`.

## Demo accounts

| Email                        | Password  | Role     |
|-------------------------------|-----------|----------|
| admin@idsfintech.com           | admin123  | Admin    |
| john.smith@idsfintech.com      | password  | Employee |
| layla.chami@idsfintech.com     | password  | Admin    |
| sara.khalil@idsfintech.com     | password  | Employee |

Employees start on the light theme and admins start on dark, unless you change it yourself
in Settings (gear icon in the navbar), at which point your choice is remembered from then on.

## What's included

- Login page (email + password against the mock Users table)
- Dashboard with a role-based greeting, stat cards, quick navigation
- Settings page: theme preference, account info
- Products: list with search/filter, details (modules, clients, team, repos, docs), create/edit
- Clients: list with search/filter, details (products, deployments, environments, team), create/edit
- Deployments: filterable list across product, client and status, with per-deployment module toggles
- Team Members: list with search/filter
- User Management (admin only): create user, assign role, activate/deactivate, search + status filter

## Data model

Mirrors the ERD directly:

- `User` (login account) optionally links to one `TeamMember` (the employee record) via `teamMemberId`
- `Product` owns `Module`, `Repository`, `Document` and reaches `TeamMember` through `ProductResponsibility`
- `Client` reaches `TeamMember` through `ClientResponsibility`
- `Deployment` is the Client <-> Product join (with its own version, go-live date, status, support tier)
- `DeploymentModule` is the junction saying which of a product's modules are enabled for a given deployment
- `Environment` belongs to one `Deployment`

Bonus entities from the spec (`FinancialInfo`, `ApprovalRequest`, `SecretVaultReference`) are intentionally
left out for now, per your instructions, and can be added later without disturbing this structure.

## Notes

- All data is mock data in `src/data/mockData.ts`, loaded into an in-memory store in
  `src/context/DataContext.tsx`. Creating, editing or deleting records only persists for the
  current browser session, refreshing the page resets everything.
- When the real .NET API exists, swap the mock arrays in `DataContext.tsx` for `fetch` calls,
  and swap the mock password check in `AuthContext.tsx` for a real JWT login call.
