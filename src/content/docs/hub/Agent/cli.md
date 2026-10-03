---
title: Command line
description: Check on a node and act on it from its own terminal with asdl-agent.
sidebar:
  order: 51
---

On every node, `asdl-agent` is also a command line for the agent running
there: whether it reaches the Hub, what runs on the node, logs, maintenance and
updates. It talks to the agent's local dashboard, so it only works on the node
itself, and needs no login.

```console
$ asdl-agent status
Node         node-1 (10.101.0.3)
Hub          http://10.101.0.1:8080, connected, last heartbeat 12s ago
Mesh         handshake 26s ago
Maintenance  off
Agent        v2026.09.28-1a2b3c4, up to date (auto-update on)
Apps         4 running of 4 containers
CPU          12%, load 0.41 0.35 0.30
Memory       4.6 / 7.1 GB
Disk         99.9 / 115.8 GB
Up           14h55m10s
```

The agent keeps `/usr/local/bin/asdl-agent` pointing at its own binary, so the
command is there on every node and updates with the agent.

## Commands

| Command | Does |
|---|---|
| `status` | The node, its connection to the Hub and the mesh, maintenance, the agent's version and updates, and CPU, memory and disk. |
| `apps` | Containers on the node, and which the Hub started. |
| `logs <app> [-n 100]` | A container's last lines of output. |
| `restart <app>` | Restart a container. |
| `jobs` | Jobs the Hub sent since the agent started. |
| `maintenance on\|off` | Start [maintenance](/hub/maintenance/) for this node (its apps move to other nodes) or end it, e.g. before a reboot. |
| `update` | Check for a new agent release now. |
| `update install` | Install it now and wait until the agent runs it. |
| `auto-update on\|off` | Let new releases install by themselves, or not. |
| `version` | The program's version. |
| `run` | Run the agent; this is what the service runs. |

Add `--json` to print the agent's answer. On a machine that runs agents for
more than one Hub, choose one with `--hub <name>` (the folder name in
`/etc/asdl/`).

Changes (`restart`, `maintenance`, updates) are only accepted from the node
itself, like the local dashboard's buttons. `logs` and `restart` use Docker
through the agent, so they work without `sudo`.

For the whole Hub (every node and app), use [`asdl-hub`](/hub/cli/).

## When something doesn't work

Every error the command line prints, and what to do about it, is in
[Troubleshooting → Command line](/hub/troubleshooting/#command-line).
