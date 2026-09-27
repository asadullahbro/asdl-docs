---
title: Databases and failover
description: How an app's database fits with moving apps between nodes, and ways to keep it available.
sidebar:
  order: 7.8
---

The Hub moves **apps** between nodes: failover, maintenance, or you changing
a project's node. It does not move **data stored on a node**. So where an
app keeps its database decides what failover can do for it.

## The app reaches its database over the mesh

However you run the database, give the app an address it can reach from
**every** node, not a Docker container name that only works on one machine.
Nodes reach each other over the private WireGuard network, so a database on
a node is reachable at that node's mesh address, for example
`DB_HOST=10.101.0.4`. Keep the database port closed to everything else.

Queries between nodes go through the Hub server, so they're slower than on
the same machine (e.g. ~180 ms instead of ~1 ms). Keep an app on the node
with its database normally; running elsewhere works, just slower.

## Options

| Where the database lives | If that node goes down | Effort |
|---|---|---|
| **A hosted database** (Supabase, Neon, RDS…) | Nothing happens; apps fail over and keep working. | Lowest. |
| **On one node** | Apps fail over, but can't reach their data until the node is back. | Low, but a single point of failure. |
| **On one node, with a live copy on another** | Promote the copy and point the app at it; switch back later. | Medium: a standby to run, and a switch-over to do. |

## A live copy (Postgres streaming replication)

Postgres can keep a read-only copy on another node that follows every change
within about a second and catches up by itself after being offline:

- The copy must use the **same Postgres image/version** as the original.
- The original keeps changes for the copy while it's offline; **cap it**
  (`max_slot_wal_keep_size`) so it can't fill the disk.
- It copies mistakes too: a deleted table is gone on the copy a second later.
  **Keep nightly backups** as well, stored off the machine.
- **Switching is a deliberate step**, not automatic: promote the copy, point
  the app's `DB_HOST` at it in the project's settings (the Hub redeploys it),
  and when the original returns, copy the data back and rebuild the copy.
  Automatic switching risks two databases taking writes.

If a website talks to the database through an API (for example Supabase's
REST API), run that API as a Hub project too, with the database's mesh
address, so it moves between nodes like the app and its domain follows it.

Point the app at the new database by editing its environment variables in
the dashboard (**Projects → Edit**) or with `PUT /api/v1/projects/:id`; the
Hub redeploys it with the new settings.
