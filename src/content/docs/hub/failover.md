---
title: Failover
description: How the Hub notices a dead node or app and moves it, and what it does when nowhere is left.
sidebar:
  order: 7
---

When a node dies or an app stops responding, the Hub moves the app to
another node by itself. In testing, an app on a node that was switched off
was reachable again from another node **about 40 seconds** later.

## How it works

1. **Health checks.** Every 10 seconds the Hub requests `/health` from each
   running app over the private network. Any answer below 500 counts as up
   (so an app without a `/health` route, answering 404, is fine). No answer
   within 3 seconds, a 5xx error, or an offline node counts as a failure.
2. **Three strikes.** After 3 failures in a row (about 30 seconds) the app
   is failed over. One slow response or a quick restart does not move it.
   Meanwhile the project shows **degraded**.
3. **Pick a node.** The Hub picks the [master node](#master-node) if it is
   eligible, otherwise the healthiest online node other than the current
   one.
4. **Redeploy.** The app is deployed there the normal way — same image,
   secrets and settings. While this happens the project shows **migrating**.
5. **Switch.** Once the new copy runs, the domain route points at it.

## If the new node fails too

A node that fails to take over the app (the deploy fails, or it doesn't
pick up the job within a minute) is skipped for that app for 30 minutes, and
the next health check failure tries the next node.

When **no node is left**, the project is marked **failed**. It is not
retried automatically after that; deploy or **Redeploy** it once a node is
available.

## When the dead node comes back

The Hub queues removal of the app's old container on the dead node. As soon
as that node is back online, it removes the stale copy — so the app never
ends up running twice. The app stays on its new node.

## Master node

In **Settings → Master node** you can choose a preferred node. While it is
online, projects are kept on it (moved there if they run elsewhere) and it
is the first choice for failovers. When it goes offline, the healthiest
other node is used instead.

## What failover doesn't do

- **It isn't zero-downtime.** Only one copy of an app runs at a time, so
  expect about 30–60 seconds of downtime while it moves.
- **It doesn't move data** stored on the node's disk (volumes). Keep data in
  an external database or storage.
- **It can't protect against the Hub server going down.** All traffic comes
  in through the Hub, so if its server is down, every app is unreachable.
  Nodes keep running their containers, and routing resumes when the Hub is
  back.
