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

Tokens from **Settings → Tokens** don't ask for a two-factor code; the
[security page](/hub/security/) explains what that means.

Roles decide what a token's user can do: **viewer** can read, **operator**
can also deploy and change projects, **admin** can also manage users,
tokens and settings, and open a node's terminal.

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
| `DELETE /nodes/:id` | Admin: remove a node (WireGuard access, keys, history). Refused with `409` while apps run on it. |
| `GET /nodes/:id/connection` | Last heartbeat, WireGuard handshake, ping and agent version. |
| `GET /nodes/:id/terminal` | Admin: a WebSocket to a shell on the node, which is what the dashboard's **Terminal** button uses. The token goes in the query (`?token=`), because a browser can't set headers on a WebSocket. |
| `PUT /nodes/:id/maintenance` | `{"enabled": true\|false}`: start or end [maintenance](/hub/maintenance/). Returns which apps are moving and which stay. |
| `POST /nodes/:id/containers/:name/logs?lines=N` | Fetch a container's logs; returns a `job_id` to follow with `GET /jobs/:id/logs`. |
| `POST /nodes/:id/containers/:name/restart` | Restart a container; returns a `job_id`. |
| `GET /jobs`, `GET /jobs/:id/logs` | Jobs sent to nodes and their output. Environment values are masked. |
| `GET /migrations` | Failovers and moves. |
| `POST /agents/deploy` | Update the agent on all online nodes. |
| `POST /nginx/update` | Rebuild app routes and certificates now. |

### Routes for agents

Agents call these over the WireGuard network; from anywhere else they answer
`403`. They take no token. The Hub knows which node is calling from the
private address the request came from (WireGuard lets a node send only from
its own), and it ignores any node ID in the URL or query: agents send `self`
where an ID would go.

| Request | Does |
|---|---|
| `POST /nodes` | A node announces itself when its agent starts. |
| `POST /nodes/self/heartbeat` | The heartbeat, every 30 seconds. |
| `POST /nodes/self/maintenance` | A node asks to start or end maintenance for itself. |
| `POST /jobs/claim` | A node asks for its next waiting job. |
| `POST /jobs/:id/complete` | A node reports how a job ended. Only the node the job belongs to can. |

## Notifications

Admin only; see [Notifications](/hub/notifications/#api).

| Request | Does |
|---|---|
| `GET /notifications/types` | Channel types (Discord, Slack, Telegram, ntfy, email, webhook) and events. |
| `GET/POST /notifications`, `PUT/DELETE /notifications/:id` | Channels; secrets are masked. |
| `POST /notifications/:id/test` | Send a test message now. |

## Other

| Request | Does |
|---|---|
| `GET /system/version` | Running and latest version; `?refresh=1` checks GitHub now. |
| `POST /system/update` | Admin: upgrade to the latest release. |
| `GET /health` (no `/api/v1`) | Is the Hub up. |
| `POST /auth/login` | `{"username","password"}` → `{"token","user"}` (dashboard login). If the user has two-factor on, → `{"mfa_required":true,"mfa_token"}` instead. Too many failures from an address or for an account → `429` with `Retry-After`. |
| `POST /auth/2fa/login` | `{"mfa_token","code"}` → `{"token","user"}`. The code is a 6-digit app code or a recovery code; `mfa_token` lasts 5 minutes and is not a session. |
| `POST /auth/2fa/setup` | Start setting up two-factor → `{"secret","uri"}` (the `otpauth://` URI for a QR code). |
| `POST /auth/2fa/enable` | `{"code"}` confirms the app and turns it on → `{"recovery_codes"}`, shown once. |
| `POST /auth/2fa/disable` | `{"password","code"}` turns it off. |
| `POST /auth/cli/start` | `{"machine"}` → `{"code","poll_secret","expires_in","path"}`: a login request for `asdl-hub login` (no sign-in needed; limited per address). |
| `POST /auth/cli/poll` | `{"code","poll_secret"}` → `202` while waiting, `200 {"token","user"}` once approved (once only), `410` if turned down or expired. |
| `GET /auth/cli/request?code=` | Signed in: who asked and from where. |
| `POST /auth/cli/approve`, `POST /auth/cli/deny` | Signed in: `{"code"}` answers the request. Approving gives admins a permanent token and others a day-long session. |
| `DELETE /settings/users/:id/2fa` | Admin: turn two-factor off for a user who lost their device. |
