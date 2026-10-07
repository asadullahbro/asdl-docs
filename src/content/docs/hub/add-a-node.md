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

The Hub gives the node a private address on its WireGuard network and tells
nodes apart by that address (a node can only send from its own), so a node
never has to send or remember an ID.

## Checking a node

Open **Nodes → the node** in the dashboard:

- **Connection to Hub** shows the last heartbeat, the last WireGuard
  handshake, ping and agent version, with a one-line verdict when something
  is off (for example "Tunnel up but no heartbeats: the agent may be
  stopped").
- **Apps on this node** lists every container the node's agent reports, with
  the ones the Hub started marked **Hub**. Operators can read a container's
  last 300 log lines or restart it; both run on the node as jobs.
- **Terminal** (admins only) opens a shell on the node in your browser. The
  Hub connects over the private network with an SSH key the installer added
  for the user who ran it, so the node needs an SSH server (the installer
  turns one on). If the button opens nothing, `asdl-hub doctor` says which
  node's terminal can't connect and why.

- **Online** means the Hub received a heartbeat recently. A node is marked
  offline after missing three heartbeats (about 90 seconds).
- The **health score** combines CPU, memory, disk, load and network latency.
  The Hub prefers healthier nodes for new deploys and failovers.

On the node itself:

```bash
systemctl status 'asdl-agent-*'
journalctl -u 'asdl-agent-*' -f
```

## Remove a node

1. **Move its apps off it.** Put it into [maintenance mode](/hub/maintenance/)
   so they move to other nodes without downtime, or move them one by one. A
   node that still runs apps can't be removed. (If the node is already gone,
   its apps have usually failed over by themselves; see
   [Failover](/hub/failover/).)
2. **Remove it from the Hub.** Open the node in **Nodes** and choose
   **Remove node** at the bottom of the page (admins only), or on the Hub's
   server run:

   ```bash
   sudo asdl-hub node remove <node>
   ```

   The Hub forgets the node: its WireGuard access, SSH keys, heartbeat
   history and waiting jobs. If the node is still online, its agent is cut
   off from the Hub at that moment. To use the machine again later, add it as
   a new node.
3. **Uninstall the agent on the machine**, if it still exists. Each Hub's
   agent is named after the Hub, so use the names `ls /etc/asdl/` shows.

   On Linux:

   ```bash
   HUB=hub-example-com            # the folder name in /etc/asdl/
   IFACE=$(ls /etc/wireguard/ | grep '^asdl-' | sed 's/\.conf$//')   # pick the Hub's one if there are several
   sudo systemctl disable --now "asdl-agent-$HUB" "wg-quick@$IFACE"
   sudo rm -f "/etc/systemd/system/asdl-agent-$HUB.service" "/usr/local/bin/asdl-agent-$HUB" "/etc/wireguard/$IFACE.conf"
   sudo rm -rf "/etc/asdl/$HUB"
   sudo systemctl daemon-reload
   ```

   On macOS:

   ```bash
   HUB=hub-example-com            # the folder name in /usr/local/etc/asdl/
   sudo launchctl bootout "system/website.asdl.agent.$HUB"
   sudo rm -f "/Library/LaunchDaemons/website.asdl.agent.$HUB.plist" "/usr/local/bin/asdl-agent-$HUB"
   sudo wg-quick down /usr/local/etc/wireguard/asdl-*.conf
   sudo rm -rf "/usr/local/etc/asdl/$HUB" /usr/local/etc/wireguard/asdl-*.conf
   ```

   If that was the machine's only Hub, also remove `/usr/local/bin/asdl-agent`.
