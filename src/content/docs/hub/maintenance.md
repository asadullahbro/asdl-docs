---
title: Maintenance mode
description: Take a node out of service without downtime before rebooting or working on it.
sidebar:
  order: 7.5
---

Before you reboot a machine, update its OS or unplug it, put its node into
**maintenance mode**. The Hub moves its apps to other nodes without
downtime and sends it nothing new until you're done.

## Turn it on

Either:

- in the Hub dashboard, open **Nodes → the node → Start maintenance**, or
- on the machine itself, open the agent's dashboard (`http://localhost:<port>`)
  and click **Start maintenance**.

## What happens

1. The node is marked **Maintenance** in the Nodes list.
2. Each app on it is redeployed on the healthiest other available node, with
   the same image, secrets and settings. The new copy starts first; once it
   runs, the domain switches over and the old copy is removed. In testing,
   a probe sending 4 requests a second saw no failed requests during a move.
3. While it's on, the node gets no new apps, isn't used for failover, and
   apps can't be moved onto it.

If there is no other node to move an app to, the app **stays where it is**
and the dashboard says so. It keeps running; it just isn't protected while
you work on the machine.

## Turn it off

Click **End maintenance** in the same place. The node takes apps again.
Apps that were moved away **stay where they are**; move them back from the
project's **Edit** dialog if you want to. (If the node is your
[master node](/hub/failover/#master-node), the Hub moves apps back to it by
itself.)

## Things to know

- Maintenance mode doesn't stop the agent: the node still reports its health
  and still receives agent updates.
- A node that goes offline without maintenance mode is handled by
  [failover](/hub/failover/) instead, which involves about 30 seconds of
  downtime.
