---
title: Add a node
description: Connect a machine to the Hub so it can run apps.
sidebar:
  order: 3
---

A node is any machine that runs your apps. It needs **Docker** installed and
must be able to reach the Hub's WireGuard port over the internet. It does not
need a public IP — a home desktop behind a router works.

## 1. Create an enrollment token

In the dashboard, open **Settings → Node enrollment** and click **Generate**.
Tokens are single-use: each node needs its own.

## 2. Run the install command on the node

**Node enrollment** also shows the command for your Hub. It looks like this:

```bash
curl -fsSL https://<your-hub>/install | sudo bash
```

Paste the enrollment token when asked. The script then:

- downloads the agent for the machine (Linux or macOS),
- sets up WireGuard and joins the Hub's private network,
- registers the node with the Hub,
- installs the agent as a service (`asdl-agent-<hub>`) and starts it.

The node appears under **Nodes** in the dashboard within a few seconds.

## Checking a node

Open **Nodes → the node** in the dashboard:

- **Connection to Hub** shows the last heartbeat, the last WireGuard
  handshake, ping and agent version, with a one-line verdict when something
  is off (for example "Tunnel up but no heartbeats: the agent may be
  stopped").
- **Apps on this node** lists every container the node's agent reports, with
  the ones the Hub started marked **Hub**. Operators can read a container's
  last 300 log lines or restart it; both run on the node as jobs.

- **Online** means the Hub received a heartbeat recently. A node is marked
  offline after missing three heartbeats (about 90 seconds).
- The **health score** combines CPU, memory, disk, load and network latency.
  The Hub prefers healthier nodes for new deploys and failovers.

On the node itself:

```bash
systemctl status 'asdl-agent-*'
journalctl -u 'asdl-agent-*' -f
```

## Removing a node

Put it into [maintenance mode](/hub/maintenance/) first so its apps move
elsewhere without downtime, then delete the node in the dashboard and uninstall the agent on the machine.
If a node simply goes offline, its apps are moved automatically — see
[Failover](/hub/failover/).
