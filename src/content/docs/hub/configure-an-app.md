---
title: Configure an app
description: Environment variables, ports, volumes, redeploying and moving apps between nodes.
sidebar:
  order: 5
---

Each app is a **project** in the dashboard. Open **Projects** and click
**Edit** on its card.

:::note
Changing environment variables, ports or volumes **redeploys the app** so
it picks them up — containers only read their settings when they start.
Editing the name, description or domain does not restart it.
:::

## Environment variables (secrets)

Paste them into **Environment variables** in the usual `.env` format:

```bash
DATABASE_URL=postgres://user:pass@db.example.com/app
SECRET_KEY="a value with spaces"
# comments and blank lines are ignored
export SMTP_HOST=smtp.example.com
```

- Values are **stored encrypted** and are never shown again: reopening the
  editor shows `KEY=********`.
- Leave a line as `KEY=********` to keep its current value. Delete the line
  to remove the variable. Type a new value to replace it.
- The node receives the values only while starting the container; they are
  not written into commands or job logs.
- If the same key appears twice, the last one wins.

## Ports

Leave **Ports** empty and the Hub handles it: it reads the port your image
exposes (`EXPOSE` in the Dockerfile, 8000 if there is none) and publishes it
on a free port on the node, starting at 20000. The card shows the result
with **(auto)**, for example `20000:8000 (auto)`. An app keeps its port
across redeploys.

To choose the port yourself, enter `host:container`, for example
`8080:8000`. You rarely need to: traffic from your domain reaches the app
whatever the node port is.

## Volumes

Volumes use Docker's `host-path:container-path` form, for example
`/srv/myapp/data:/data`.

:::caution
Volumes live on one node's disk. If the app fails over to another node, the
data does not move with it. Keep important data in a database or storage
service outside the nodes.
:::

## Redeploy

Click **Redeploy** on the project card to restart the app with its current
image and settings — useful after changing something outside the Hub, such
as a database password the app reads at startup.

## Move an app to another node

In **Edit**, pick another **Node** and save. The Hub starts the app on the
new node first; only once it is running does it switch the domain over and
remove the old copy. If the new node fails to start it, the app stays where
it was.

## Create an app without GitHub

Use the API: `POST /api/v1/projects` with a name, a node and an image — for
example a public image such as `traefik/whoami:v1.10` (see
[API](/hub/reference/api/#projects)). The Hub deploys it straight away; it
shows **deploying** until it is running, and then appears in the dashboard
like any other project.

## Status meanings

| Status | Meaning |
|---|---|
| `deploying` | Being deployed for the first time. |
| `running` | Running on a node. The dot next to it shows the health check result. |
| `failed` | Could not be started anywhere — see [Failover](/hub/failover/). |
| `stopped` | Created without an image, or stopped. |
