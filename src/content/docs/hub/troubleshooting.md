---
title: Troubleshooting
description: Where to look when something doesn't work.
sidebar:
  order: 8
---

## First places to look

Start with the doctors: they check the usual causes and say what to do.

```bash
sudo asdl-hub doctor     # on the Hub's server: Hub, nodes, apps, domains, jobs, notifications
asdl-agent doctor        # on a node: agent, Hub connection, WireGuard, Docker, disk
```

| Where | What it tells you |
|---|---|
| `sudo asdl-hub status` (Hub server) | Nodes online, unhealthy apps and failed jobs today, in one screen. Then `asdl-hub jobs` and `asdl-hub job <id>` for a job's output. See [Command line](/hub/cli/). |
| `asdl-agent status` (node) | Whether the node reaches the Hub, its last error, maintenance and updates. See [the agent's command line](/hub/agent/cli/). |
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

### A Hub update didn't finish

**Update now** and `asdl-hub update install` run the installer of the new
release in the background. Its output is in `/var/log/asdl-hub-upgrade.log`
on the Hub server. Fix what it reports and try again. If the Hub doesn't come
back up, run the [install command](/hub/install/) again; your data and settings
are kept.

### The dashboard says "too many failed logins"

After 8 wrong passwords from one address, or 20 for one account, the Hub
refuses sign-ins for up to 15 minutes, even with the right password. Wait
the time it names, or restart the Hub to clear the counts
(`sudo systemctl restart asdl-hub`). See
[limits on failed logins](/hub/security/#limits-on-failed-logins).

### I lost my authenticator and recovery codes

Another admin can reset it in **Settings → Users → Reset 2FA**. If you are the
only admin, use `sudo asdl-hub` on the Hub server, which doesn't depend on your
dashboard login, and call `DELETE /api/v1/settings/users/<id>/2fa` with its
token. See [two-factor sign-in](/hub/security/#two-factor-sign-in).

### Two-factor codes are always wrong

The codes depend on the clock. Check the time on your phone and on the Hub
server (`timedatectl`); both should sync automatically. A code works for about
30 seconds either side and only once, so wait for the next code in the app.

## Command line

### `asdl-hub`: "reading its CLI token needs root"

You're on the Hub's server without `sudo`. Run `sudo asdl-hub <command>`.
The command line uses an admin token that only root and the Hub can read.

### `asdl-hub serve`: "password authentication failed for user asdl"

`serve` runs the Hub server, which is what its service does already. Run by
hand outside `/opt/asdl-hub`, it finds no settings and tries a default
database password. Use `systemctl status asdl-hub` and `sudo asdl-hub status`
to check on the running Hub. Hub v0.12.2 and later explain this instead of
failing.

### `asdl-hub`: "no Hub to talk to"

This machine isn't the Hub's server and you haven't logged in. Run
`asdl-hub login https://your-hub`, or set `ASDL_HUB_URL` and `ASDL_HUB_TOKEN`.

### `asdl-hub`: "the Hub didn't accept your login"

The saved token was revoked in **Settings → Tokens**, or a non-admin's
one-day session ran out. Run `asdl-hub login` again. On the Hub's server with
`sudo` this doesn't happen: the token renews itself while the Hub runs.

### `asdl-hub`: "insufficient permissions"

Your user's role can't do that: viewers can only look, and notifications,
updates and the node terminal are admin only. An admin can change roles in **Settings → Users**.

### `asdl-hub`: "command not found" on the Hub server

Hub v0.10.0 linked the command into `/opt/asdl-hub`, which only root can
open. Update the Hub (`sudo /opt/asdl-hub/bin/asdl-hub update install`, or
**Update now** in the dashboard) and `/usr/local/bin/asdl-hub` is installed for
everyone. Hubs before v0.10.0 have no command line; update them from the
dashboard.

### `asdl-agent` asks for a Hub URL and an enrollment token

You ran an agent from before 2026-09-28: in some desktop terminals,
`asdl-agent` without a command started the agent itself instead of showing
help. Press Ctrl+C (nothing has changed), then update the agent:
`asdl-agent update install`, or wait for it to update itself. Newer agents
show the help, and never offer to enroll a node that is already set up.

### `asdl-agent`: "permission denied" on `/etc/asdl/…/agent.conf`

Same cause: the agent started instead of a command, and only root can read
its config. Newer agents say "the agent runs as root" and stop. Use a command
(`asdl-agent status`); the agent itself runs as the `asdl-agent-*` service.

### `asdl-agent`: "no ASDL Agent is answering on this machine"

The command line talks to the agent running on this machine, and none
answered. Check `systemctl status 'asdl-agent-*'` and
`journalctl -u 'asdl-agent-*' -n 50`. If the agent's dashboard uses a port
outside 8081-8090, run the command with `sudo` so it can read the port from
the config.

### `asdl-agent`: "agents for several Hubs"

This machine is a node of more than one Hub. Pick one with
`--hub <name>`, the folder name in `/etc/asdl/` (e.g. `--hub hub-example-com`).

### `asdl-agent`: "do this from the node itself"

Changes (maintenance, restarts, updates) are only taken from the node, like
the buttons on its local dashboard. Run the command on the node, or use
`asdl-hub` for the whole Hub from anywhere.

## Notifications

A channel's last error is on **Plugins → Notifications** and in
`asdl-hub notify`. **Send test** shows the service's answer straight away.

| Error | Fix |
|---|---|
| Discord `404 … Unknown Webhook` | The webhook was deleted in Discord. Make a new one and paste its URL into the channel. |
| Discord or Slack `401`/`403` | The URL is incomplete or was reset. Copy it again. |
| Telegram `400 … chat not found` | Wrong chat ID, or the bot isn't in the chat. Add the bot and send it a message, then check `getUpdates` again. |
| Telegram `403 … bot was blocked` | Someone blocked the bot or removed it from the group. Unblock or add it again. |
| Telegram `401 Unauthorized` | The bot token is wrong or was revoked in @BotFather. |
| ntfy `403` | The topic is protected. Set an access token in the channel. |
| `SMTP login failed` | Wrong username or password. Gmail and most others need an app password, not your account password. |
| `could not reach smtp…:25` | Cloud providers often block port 25. Use 587 or 465. |
| `could not reach …` (any service) | The Hub server can't reach the service. Check its outbound firewall and DNS (`curl -I https://discord.com` on the Hub server). |

**Nothing arrives, and there's no error:**

- Is the channel **On**, and is the event ticked for it?
- Does **App events for** leave out the app?
- The same message about the same thing is sent once a minute at most.
- **Failed deploys** and **App down** are separate from **Deploys**. A
  failover sends **App down** and **App back up**, not a deploy message.

**Links in messages point at the wrong address:** they use `PUBLIC_URL` in
`/opt/asdl-hub/.env`. Set it to the dashboard's address and restart the Hub.
