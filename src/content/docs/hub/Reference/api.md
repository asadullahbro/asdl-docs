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
| `POST /projects` | Create a project: `{"name", "node_id", "image", "domain", "route_path", "ports", "env_vars", "volumes", "repository"}`. Deploys it if an image is given; otherwise it waits on that node. `repository` (`owner/repo`) links GitHub deploys to it. |
| `PUT /projects/:id` | Change a project. Send only the fields to change. `env_vars` values of `********` keep the stored value; `"ports": []` switches to automatic ports; a different `node_id` moves the app; `route_path` (e.g. `"/api/"`, or `""` for the whole domain) serves it under a path of its domain. |
| `POST /projects/:id/redeploy` | Restart the app with its current image and settings. |
| `DELETE /projects/:id` | Delete a project and remove its container from the node. |
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
| `GET /nodes`, `GET /nodes/:id` | Nodes and their health, including the containers each agent reports. |
| `GET /nodes/:id/connection` | Last heartbeat, WireGuard handshake, ping and agent version. |
| `PUT /nodes/:id/maintenance` | `{"enabled": true\|false}`: start or end [maintenance](/hub/maintenance/). Returns which apps are moving and which stay. |
| `POST /nodes/:id/containers/:name/logs?lines=N` | Fetch a container's logs; returns a `job_id` to follow with `GET /jobs/:id/logs`. |
| `POST /nodes/:id/containers/:name/restart` | Restart a container; returns a `job_id`. |
| `GET /jobs`, `GET /jobs/:id/logs` | Jobs sent to nodes and their output. Environment values are masked. |
| `GET /migrations` | Failovers and moves. |
| `POST /agents/deploy` | Update the agent on all online nodes. |
| `POST /nginx/update` | Rebuild app routes and certificates now. |

## Other

| Request | Does |
|---|---|
| `GET /system/version` | Running and latest version; `?refresh=1` checks GitHub now. |
| `POST /system/update` | Admin: upgrade to the latest release. |
| `GET /health` (no `/api/v1`) | Is the Hub up. |
| `POST /auth/login` | `{"username","password"}` → `{"token"}` (dashboard login). |
