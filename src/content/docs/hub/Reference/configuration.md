---
title: Configuration
description: Settings in /opt/asdl-hub/.env.
sidebar:
  order: 100
---

The Hub reads its settings from `/opt/asdl-hub/.env`. The installer writes
this file; you rarely need to edit it. Restart after changes:

```bash
sudo systemctl restart asdl-hub
```

## Core

| Setting | Meaning |
|---|---|
| `PUBLIC_URL` | The Hub's public URL, e.g. `https://hub.example.com`. Also the audience GitHub OIDC tokens must use. |
| `SERVER_PORT` | Local port the Hub listens on (nginx forwards to it). Default `8080`. |
| `JWT_SECRET` | Signs dashboard logins and API tokens. Changing it logs everyone out. |
| `SECRETS_KEY` | Encrypts project secrets and registry tokens. **Never change it** on an existing Hub. If unset, the Hub derives the key from `JWT_SECRET`. |
| `ADMIN_PASSWORD` | Password for the initial `admin` user, used only when the database is first created. |

## Database

`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSLMODE` —
the PostgreSQL connection. The installer creates a local database named
`asdl_hub`.

## WireGuard

| Setting | Meaning |
|---|---|
| `WG_INTERFACE` | Interface name on the Hub, default `asdl0`. |
| `WG_PORT` | UDP port nodes connect to. |
| `WG_HUB_IP`, `WG_NETWORK` | The Hub's private address and the private network, e.g. `10.101.0.1` in `10.101.0.0/24`. |
| `WG_ENDPOINT` | Address nodes use to reach the Hub, `host:port`. |
| `VPN_NETWORKS` | Networks allowed to call the node-only API (heartbeats, jobs). |

## Optional

| Setting | Meaning |
|---|---|
| `LOG_LEVEL` | `debug` logs every database query. Default: warnings and errors only. |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins allowed to call the API from a browser. |
| `NGINX_ROUTES_DIR` | Where app routes are written. Default `/etc/nginx/asdl-hub.d`. |
| `ACME_WEBROOT` | Folder used for certificate challenges. Default `/var/www/asdl-acme`. |
| `CERT_HELPER` | Script the Hub runs (via sudo) to get certificates. Default `/usr/local/lib/asdl-hub/issue-cert`. |
