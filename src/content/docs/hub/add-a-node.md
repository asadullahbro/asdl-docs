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

Move its apps elsewhere first (see [Configure an app](/hub/configure-an-app/#move-an-app-to-another-node)),
then delete the node in the dashboard and uninstall the agent on the machine.
If a node simply goes offline, its apps are moved automatically — see
[Failover](/hub/failover/).
