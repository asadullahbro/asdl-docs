---
title: Troubleshooting
description: Where to look when something doesn't work.
sidebar:
  order: 8
---

## First places to look

| Where | What it tells you |
|---|---|
| Dashboard → **Jobs** → a job's logs | The exact output of a deploy on the node, including why a container exited. |
| Dashboard → **Projects** | Status and health of each app, and which node runs it. |
| Dashboard → **Nodes → a node** | Connection to the Hub, and every container on the node with its logs. |
| The node's own dashboard (`http://localhost:8081` on the node) | The same from the node's side, including the last error talking to the Hub. |
| `journalctl -u asdl-hub -f` (Hub server) | Hub decisions: deploys, failovers, nginx and certificate updates. |
| `journalctl -u 'asdl-agent-*' -f` (node) | What the agent is doing on that node. |

For more detail from the Hub, add `LOG_LEVEL=debug` to `/opt/asdl-hub/.env`
and restart it (`sudo systemctl restart asdl-hub`). This logs every database
query, so turn it off again afterwards.

## Common problems

### The deploy job says "container exited after start"

The app crashed on startup. The job log includes its last 50 lines of
output. Usually a missing environment variable or a wrong port — check the
project's [environment variables](/hub/configure-an-app/#environment-variables-secrets).

### The domain shows the wrong certificate or doesn't load

- Check DNS points at the **Hub server**, not a node: `dig +short your.domain`.
- Check the Hub wrote a route: `grep -A3 your.domain /etc/nginx/asdl-hub.d/routes.conf`.
- Look for `Could not get a certificate` in `journalctl -u asdl-hub`.
- Remove any hand-written nginx site for the same domain in
  `/etc/nginx/sites-enabled/`.

### "nginx rejected the generated config"

The Hub checks every config with `nginx -t` before using it and keeps the
previous one if it fails. Run `sudo nginx -t` to see the error — usually a
hand-written site elsewhere in nginx.

### An app keeps moving between nodes

It is failing health checks. Check it answers on `/health` (or any path
below 500) quickly, and that it doesn't take longer than ~30 seconds to
start.

### A node shows offline but the machine is on

- Check **Connection to Hub** on the node's page in the dashboard, or on the
  node's own dashboard: its verdict says whether the tunnel or the agent is
  the problem.
- Is the agent running? `systemctl status 'asdl-agent-*'`
- Can it reach the Hub's WireGuard port? Check UDP is open on the Hub's
  cloud firewall, and `sudo wg show` on the node shows a recent handshake.

### Secrets show as empty after a restore

The database was restored with a different `SECRETS_KEY` than it was
encrypted with. Restore the original `/opt/asdl-hub/.env` (see
[Back up](/hub/install/#back-up)).
