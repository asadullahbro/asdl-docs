---
title: Install and upgrade
description: Install ASDL Hub on a server, upgrade it, and know what to back up.
sidebar:
  order: 2
---

## Requirements

- A server running **Ubuntu or Debian** (amd64 or arm64) with a public IP.
- Root access (`sudo`).
- Optional but recommended: a domain name pointing at the server (an `A`
  record), so the dashboard gets HTTPS.
- Open ports: **TCP 80 and 443** (web) and the **UDP port for WireGuard**
  that the installer prints. If your cloud provider has its own firewall
  (AWS security groups, Oracle security lists, Hetzner firewall…), open them
  there too.

## Install

```bash
curl -fsSL https://get.asdl.website/asdl-hub | sudo bash
```

The installer asks for a domain (you can leave it empty to use the server's
IP), then sets up everything: PostgreSQL, WireGuard, nginx, the firewall, a
systemd service, HTTPS for the dashboard, and the Hub itself. At the end it
prints the dashboard URL and the admin login.

:::tip
Keep the admin password it prints somewhere safe.
:::

### Install a specific version

Put the version before the project name:

```bash
curl -fsSL https://get.asdl.website/v0.6.0/asdl-hub | sudo bash
```

Releases are listed on [GitHub](https://github.com/asadullahbro/ASDL-Hub/releases).

## Upgrade

Run the same command again. The installer detects the existing install and
upgrades it in place, keeping your database, secrets, WireGuard network and
settings. Pin a version (above) to upgrade to exactly that release.

The Hub restarts during the upgrade, so the dashboard is unavailable for a
few seconds. **Apps keep running** — they live on the nodes, and their
routes are rebuilt when the Hub starts.

## What gets installed where

| Path | What it is |
|---|---|
| `/opt/asdl-hub/` | The Hub binary, dashboard and `.env` configuration |
| `/opt/asdl-hub/.env` | All settings and secrets — see [Configuration](/hub/reference/configuration/) |
| `/etc/nginx/asdl-hub.d/routes.conf` | Routes for your apps' domains, written by the Hub |
| `/etc/letsencrypt/live/<domain>/` | Certificates for your apps' domains |
| `asdl-hub` (systemd service) | `systemctl status asdl-hub`, logs with `journalctl -u asdl-hub` |

## Back up

Back up these two things regularly:

1. **The database**:
   ```bash
   sudo -u postgres pg_dump -Fc asdl_hub > asdl_hub.dump
   ```
2. **`/opt/asdl-hub/.env`** — it contains `SECRETS_KEY`, which is needed to
   decrypt your projects' secrets. A database backup without it cannot
   restore your apps' environment variables.

:::caution
Never change `SECRETS_KEY` on an existing Hub: stored secrets would become
unreadable. Changing `JWT_SECRET` is fine (it logs everyone out) as long as
`SECRETS_KEY` is set, which the installer does for you.
:::
