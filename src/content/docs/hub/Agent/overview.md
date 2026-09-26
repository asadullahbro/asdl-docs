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

The agent checks for new releases every few minutes and updates itself. To
update all nodes right away, use **Settings → Agent update → Deploy agents**
in the dashboard (or `POST /api/v1/agents/deploy`).

## Requirements

- Linux (amd64) or macOS
- Docker
- Outbound access to the Hub's WireGuard UDP port
