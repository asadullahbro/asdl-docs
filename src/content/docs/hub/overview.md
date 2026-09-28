---
title: Overview
description: What ASDL Hub does and how its pieces fit together.
sidebar:
  order: 1
---

ASDL Hub runs your apps (Docker containers) on machines you own — a VPS, a
desktop, a laptop — and takes care of the work around them:

- **Deploys from GitHub Actions**: push to your repo, the app updates.
- **Secrets**: environment variables are stored encrypted and handed to the app when it starts.
- **Ports**: picked automatically, so apps on the same machine never clash.
- **Domains and HTTPS**: set a domain on an app and the Hub routes it and gets a certificate.
- **Failover**: if a machine goes down, the app is moved to a healthy one in about 30 seconds.
- **Maintenance mode**: before working on a machine, move its apps away without downtime.
- **Plugins**: companion services like Redis or a Supabase REST API that run next to an app and move with it.
- **[Notifications](/hub/notifications/)**: hear about failed deploys, apps going down and nodes going offline on Discord, Slack, Telegram, ntfy, email or a webhook.
- **One-click updates**: the dashboard tells you when a new release is out and installs it.
- **[Command line](/hub/cli/)**: `asdl-hub` and `asdl-agent` do the same from a terminal.

## How it fits together

```text
                 Internet
                    │  https://your-app.example.com
                    ▼
        ┌──────────────────────────┐
        │         ASDL Hub         │   dashboard + API, PostgreSQL,
        │  (your VPS, public IP)   │   nginx (routes + certificates)
        └────────────┬─────────────┘
                     │  WireGuard mesh (private network)
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  Node   │  │  Node   │  │  Node   │   each runs the ASDL Agent
   │ (agent) │  │ (agent) │  │ (agent) │   and Docker
   └─────────┘  └─────────┘  └─────────┘
```

- The **Hub** is installed on one server with a public IP. It holds the
  database, serves the dashboard, and is the only thing exposed to the
  internet.
- **Nodes** are the machines that run your apps. Each one runs the
  [ASDL Agent](/hub/agent/overview/), which joins a private WireGuard network
  with the Hub, reports its health, and runs jobs the Hub gives it.
- Traffic for your domains arrives at the Hub's nginx, which forwards it over
  the private network to whichever node currently runs the app. Node ports
  are never exposed to the internet.

## Words used in these docs

| Term | Meaning |
|---|---|
| **Node** | A machine running the ASDL Agent. |
| **Project** | One app: a container image plus its settings (env vars, ports, domain). |
| **Deploy** | Starting (or restarting) a project's container on a node. |
| **Failover** | Automatically redeploying a project on another node because its node or app stopped responding. |
| **Master node** | An optional preferred node that projects are kept on while it is online. |

## Where to start

1. [Install the Hub](/hub/install/) on your server.
2. [Add a node](/hub/add-a-node/) — the Hub's own server can be one.
3. [Deploy from GitHub](/hub/deploy-from-github/) or create a project in the dashboard.
