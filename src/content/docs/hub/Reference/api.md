---
title: API
description: The Hub's HTTP API, for scripts and automation.
sidebar:
  order: 101
---

Everything the dashboard does goes through this API, under
`https://<your-hub>/api/v1`.

## Authentication

Send a token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer $TOKEN" https://hub.example.com/api/v1/projects
```

For scripts, create a long-lived token in **Settings → Permanent tokens**
(admin only). Revoke it there when it is no longer needed.

Roles decide what a token's user can do: **viewer** can read, **operator**
can also deploy and change projects, **admin** can also manage users,
tokens and settings.

## Projects

| Request | Does |
|---|---|
| `GET /projects` | List projects (paginated: `?page=1&limit=20`). Env var values are masked. |
| `GET /projects/:id` | One project. |
| `POST /projects` | Create a project: `{"name", "node_id", "image", "domain", "ports", "env_vars", "volumes"}`. Deploys it if an image is given. |
| `PUT /projects/:id` | Change a project. Send only the fields to change. `env_vars` values of `********` keep the stored value; `"ports": []` switches to automatic ports; a different `node_id` moves the app. |
| `POST /projects/:id/redeploy` | Restart the app with its current image and settings. |
| `DELETE /projects/:id` | Delete a project. |
| `GET /projects/:id/health` | Run a health check now. |

Example — set env vars, keeping `DB_PASSWORD` as it is:

```bash
curl -X PUT https://hub.example.com/api/v1/projects/$ID \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"env_vars":[{"key":"DB_PASSWORD","value":"********"},{"key":"DEBUG","value":"false"}]}'
```

## Deploys

| Request | Does |
|---|---|
| `POST /deploy` | Deploy from GitHub Actions (OIDC, no API token) — see [Deploy from GitHub](/hub/deploy-from-github/). |
| `GET /deploy/history` | Recent GitHub deploys. |
| `GET/POST/DELETE /deploy/allowed` | Repos allowed to deploy. |
| `GET/POST/DELETE /deploy/tokens` | Registry tokens for pulling private images (stored encrypted, shown masked). |

## Nodes, jobs, migrations

| Request | Does |
|---|---|
| `GET /nodes`, `GET /nodes/:id` | Nodes and their health. |
| `GET /jobs`, `GET /jobs/:id/logs` | Jobs sent to nodes and their output. Environment values are masked. |
| `GET /migrations` | Failovers and moves. |
| `POST /agents/deploy` | Update the agent on all online nodes. |
| `POST /nginx/update` | Rebuild app routes and certificates now. |

## Other

| Request | Does |
|---|---|
| `GET /health` (no `/api/v1`) | Is the Hub up. |
| `POST /auth/login` | `{"username","password"}` → `{"token"}` (dashboard login). |
