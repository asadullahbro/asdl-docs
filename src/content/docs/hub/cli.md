---
title: Command line
description: "Run the Hub from a terminal with asdl-hub: status, apps, logs, deploys, moves and maintenance."
sidebar:
  order: 5.9
---

The `asdl-hub` program is also a command line for the Hub. What the dashboard
does day to day works from a terminal too: checking on nodes and apps, reading
logs, redeploying, moving apps and maintenance.

```console
$ sudo asdl-hub status
Hub         http://127.0.0.1:8080  v0.10.0 (up to date)
Nodes       2/3 online
Apps        2                      2 healthy
Jobs today  12                     12 succeeded
```

## Where to run it

**On the Hub's server**, it's installed as `/usr/local/bin/asdl-hub`. Run
commands with `sudo`; nothing else to set up. The Hub keeps an admin token for
the command line in `/opt/asdl-hub/.cli-token`, readable only by the Hub's
user and root, and renews it daily.

**On another machine**, copy the `asdl-hub` binary from a
[release](https://github.com/asadullahbro/ASDL-Hub/releases) (it's in the
`.tar.gz` under `bin/`) and log in:

```console
$ asdl-hub login https://hub.example.com
Username: admin
Password:
Logged in to https://hub.example.com as admin, token "asdl-hub CLI (admin@laptop)" (revoke it in Settings → Tokens) (admin).
```

For admins, logging in creates a permanent token named after the machine,
which you can revoke in **Settings → Tokens**; `asdl-hub logout` revokes it and
forgets the login. Other users get a session that lasts a day. To use a token
you already have, run `asdl-hub login <url> --token <token>`. The login is saved
in `~/.config/asdl-hub/cli.json`, readable only by you.

In scripts and CI, set `ASDL_HUB_URL` and `ASDL_HUB_TOKEN` instead; they come
before a saved login.

## Commands

| Command | Does |
|---|---|
| `status` | Hub version and whether an update is out, nodes online, app health, today's jobs. |
| `doctor` | Check everything and say what to fix: see [below](#doctor). |
| `nodes` | Each node's state (online, offline, maintenance), address, agent version, memory, disk, apps and last heartbeat. |
| `apps` | Each app's node, status, health, address and when it was last deployed. |
| `app <app>` | One app: node, image, ports, repository, environment variable names (never values) and plugins. |
| `deploy <app>` | Redeploy with the current image and settings, and wait for it. |
| `move <app> <node>` | Move an app to another node, and wait for it. |
| `restart <app>` | Restart the app's container. |
| `logs <app> [-n 100]` | The app's last lines of output. |
| `node remove <node>` | [Remove a node](/hub/add-a-node/#remove-a-node) for good, after its apps have moved. Asks first; `--yes` skips the question. |
| `maintenance <node> on\|off` | Start [maintenance](/hub/maintenance/) (apps move off the node) or end it. |
| `jobs [-n 15]` | Recent jobs with their node, status and duration. |
| `job <id>` | A job's details and output. The short IDs `jobs` prints work. |
| `notify` | [Notification](/hub/notifications/) channels, with when they last sent and their last error. |
| `notify test <channel>` | Send a test notification. |
| `update` | Check for a new Hub release. |
| `update install` | Install it (like **Update now** in the dashboard) and wait until the Hub runs it. |
| `login`, `logout`, `whoami` | Sign in to a Hub, sign out, show which Hub and user commands go to. |
| `version` | The program's version. |
| `serve` | Run the Hub server; this is what the service runs. |

Apps and nodes are named by name or ID, or any start of one that is
unambiguous: `macbook` for `macbook-pro.local`, `web` for `website`. Add
`--json` to any command to print the API's answer, e.g. `asdl-hub apps --json | jq '.[].name'`.

Commands need the role the dashboard would: anyone can look, operators and
admins can deploy, move, restart and read logs, and only admins manage
notifications and updates.

## Doctor

`asdl-hub doctor` checks the whole setup and prints what's wrong with the
command or step that fixes it. It exits with 1 if it found a problem, so it
also works in scripts and cron.

```console
$ sudo asdl-hub doctor
ASDL Hub doctor

Hub
  ✓ Hub answers at http://127.0.0.1:8080, signed in as admin (admin)
  ✓ Running v0.11.0, the latest release

This server
  ✓ The asdl-hub service is running
  ✓ nginx's config is valid
  ✓ Disk: 31.2 GB (64%) free

Nodes
  ✓ node-1 is online (agent v2026.10.03-1a2b3c4, 2 apps)
  ! laptop is offline (last seen 2d ago)
      → If the machine is on: run asdl-agent doctor on it. If it's gone for good, remove it in the dashboard.

Apps
  ✓ api is healthy on node-1

Domains
  ✗ api.example.com (api): points at 203.0.113.9, not the Hub (198.51.100.4)
      → Point api.example.com at the Hub server (DNS A record 198.51.100.4; proxy off if it's on Cloudflare)

Jobs
  ✓ No failed jobs in the last 24 hours

Notifications
  ✓ Discord (discord) works

8 ok, 1 warning, 1 problem
```

| Section | Checks |
|---|---|
| Hub | The Hub answers and accepts your login; it's on the latest release. |
| This server | Only on the Hub's server: the service, `nginx -t`, nginx running, free disk, and whether the last update finished. |
| Nodes | Offline nodes (worse if apps are still on them), WireGuard handshakes, nodes left in maintenance, nearly full disks, outdated agents, and whether there's a second node to fail over to. |
| Apps | Failed, unhealthy or degraded apps. |
| Domains | Every app and public plugin domain resolves to the Hub and answers over HTTPS, and its certificate has more than 10 days left. |
| Jobs | Failed jobs in the last 24 hours, and jobs stuck waiting for an online node. |
| Notifications | Admins: channels whose last send failed, or none set up. |

Add `--json` for the findings as a list, each with `section`, `level`
(`ok`, `info`, `warning`, `problem`), `message` and `fix`.

## Examples

```console
$ sudo asdl-hub apps
APP                    NODE           STATUS   HEALTH   ADDRESS                             DEPLOYED
api                    node-1         running  healthy  api.example.com                     2h ago
web                    node-2         running  healthy  example.com                         1d ago

$ sudo asdl-hub move api node-2
Moving api to node-2…
Done.

$ sudo asdl-hub logs api -n 3
2026-09-28T08:20:42Z GET /health 200
2026-09-28T08:20:55Z GET /users 200
2026-09-28T08:20:56Z POST /login 401
```

On the nodes themselves, the agent has a command line of its own:
[`asdl-agent`](/hub/agent/cli/).

## When something doesn't work

Every error the command line prints, and what to do about it, is in
[Troubleshooting → Command line](/hub/troubleshooting/#command-line).
