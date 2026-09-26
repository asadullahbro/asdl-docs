---
title: ASDL Agent
description: What the ASDL Agent does on each node.
sidebar:
  label: Overview
  order: 50
---

<img src="/asdl-agent.svg" alt="" width="56" height="56" style="border-radius:12px" />

The ASDL Agent is a small program that runs on every node. It:

- joins the Hub's private WireGuard network,
- sends a **heartbeat** every 30 seconds with CPU, memory, disk and network
  latency,
- checks for **jobs** every 5 seconds and runs them — mostly starting and
  stopping Docker containers,
- **updates itself** when a new version is released.

It never opens ports to the internet; it only makes outgoing connections to
the Hub.

## Installing

Nodes are added from the Hub — see [Add a node](/hub/add-a-node/). The
install script sets up everything; there's nothing to configure by hand.

## Where things are

| Path | What it is |
|---|---|
| `/usr/local/bin/asdl-agent-<hub>` | The agent binary (one per Hub the node belongs to) |
| `/etc/asdl/<hub>/` | Its configuration |
| `asdl-agent-<hub>` (systemd service) | `systemctl status 'asdl-agent-*'` |

## Updating

The agent checks for new releases every 5 minutes and updates itself. To
update all nodes right away, use **Settings → Agent update → Deploy agents**
in the Hub (or `POST /api/v1/agents/deploy`).

### The agent's dashboard

Each node has a small dashboard of its own at `http://localhost:<port>` on
that machine: the installer picks the first free port from 8081 (find it
with `sudo ss -ltnp | grep asdl-agent`). It shows:

- **Updates**: the agent's version, whether a newer release is out, progress
  while it updates, **Check now**, and **Install now** (which works even with
  automatic updates off).
- **Maintenance mode**: start or end [maintenance](/hub/maintenance/) for
  this node.
- **Connection to Hub**: the last successful heartbeat, the last error, the
  WireGuard handshake and ping, with a plain verdict ("No contact with the
  Hub…", "The tunnel is up but heartbeats fail…").
- **Apps on this node**: every container, with its logs. Logs are only
  shown on the machine itself, as they can contain secrets.
- Resources and recent jobs.

Buttons that change something only work from the machine itself.

### Turning automatic updates off

The **Automatic updates** switch on the node's dashboard stops the agent
from updating itself, for example to keep a node on a known version. The
setting is saved in `agent-state.json` next to the agent's config, and can
only be changed from the node itself (`localhost`).

:::caution
The switch only covers the agent's own updates. When the Hub sends an
update (**Deploy agents**), the node installs it even with automatic
updates off.
:::

## Requirements

- Linux (amd64) or macOS
- Docker
- Outbound access to the Hub's WireGuard UDP port
