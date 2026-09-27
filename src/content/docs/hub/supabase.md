---
title: Self-hosted Supabase
description: Run an app on the Hub that uses a self-hosted Supabase, with its API moving between nodes along with the app.
sidebar:
  order: 7.9
---

This is how Gamer AK runs on ASDL Hub: a Discord bot with an admin panel, a
website on Vercel, and a self-hosted Supabase for its data. The bot and the
Supabase REST API move between nodes together, and the website keeps working
wherever they run. You can set up the same thing for your own app.

## What runs where

| Piece | Where | Moves between nodes? |
|---|---|---|
| **Postgres** (Supabase's database) | One node, started with the Supabase CLI | No: it's the one stateful part; see [Databases and failover](/hub/databases/) for a live copy on another node |
| **The app** (e.g. a bot) | A Hub project | Yes |
| **Supabase REST API** (`/rest/v1/`) | A [public plugin](/hub/plugins/#public-plugins) of the app | Yes, with the app |
| **Your API domain** (e.g. `db.example.com`) | The Hub, which routes `/rest/v1/` to wherever the plugin runs | Follows the plugin |

The website (or any Supabase client) keeps using `https://db.example.com` with
its usual keys. It doesn't know or care which node answers.

## 1. Secure the Supabase install

The Supabase CLI starts with **public default keys**. Anyone who knows them
has full access to an API you expose. Before exposing anything, set your own
in `supabase/config.toml`:

```toml
[auth]
jwt_secret = "<64 random hex characters>"     # openssl rand -hex 32
publishable_key = "sb_publishable_<random>"
secret_key = "sb_secret_<random>"
```

Restart (`supabase stop && supabase start`) and take the new `ANON_KEY` and
`SERVICE_ROLE_KEY` from `supabase status -o env`. Give those to your clients.

Keep the database port (`54322`) reachable only from the ASDL mesh and the
machine itself, and the other Supabase ports (`54321`, `54323`, …) from the
machine only.

## 2. Point the app at the database over the mesh

In the app's project settings, use the database node's **mesh address**, not
a Docker container name that only works on that machine:

```bash
DB_HOST=10.101.0.4     # the database node's ASDL mesh address
DB_PORT=54322
```

Now the app can run on any node.

## 3. Attach the Supabase REST API plugin

In **Plugins → Supabase REST API**, pick your app and **Add**, then fill in:

| Setting | Value |
|---|---|
| Database URL | `postgresql://authenticator:postgres@10.101.0.4:54322/postgres` (the mesh address again; the CLI sets this role's password to `postgres`) |
| JWT secret | the `jwt_secret` from step 1 |
| Domain | your API domain, e.g. `db.example.com` |
| Path | `/rest/v1/` |

Point the domain's DNS at the Hub server. The Hub gets a certificate and
serves `https://db.example.com/rest/v1/` from the plugin. Supabase clients
(`supabase-js` etc.) work unchanged with `SUPABASE_URL=https://db.example.com`.

Or with the API:

```bash
curl -X POST https://hub.example.com/api/v1/projects/$APP_ID/plugins \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"plugin_id": "supabase-rest", "domain": "db.example.com", "route_path": "/rest/v1/",
       "vars": [{"key": "db_uri", "value": "postgresql://authenticator:postgres@10.101.0.4:54322/postgres"},
                {"key": "jwt_secret", "value": "..."}]}'
```

:::note
Only the REST API (`/rest/v1/`) is served this way. If your clients also use
Supabase Auth, Storage or Realtime, check which paths they call first. In
Gamer AK's case the website only used `/rest/v1/`.
:::

## 4. Give the app's own web UI a domain

If the app has its own web interface (Gamer AK's admin panel listens on port
3000), set **Domain** on the app's project (e.g. `admin.example.com`) and
point its DNS at the Hub. It follows the app between nodes too.

## What moving looks like

Move the app (**Projects → Edit → Node**, maintenance mode, or failover):

1. The app, its REST API plugin and any other plugins start on the new node,
   in their private network.
2. The Hub switches `db.example.com/rest/v1/` and the app's domain to the new
   node.
3. The old node's copies are removed.

For Gamer AK this took 25–47 seconds, and the website kept working on both
nodes.

## If the database's node goes down

The app and its API move, but the database doesn't. Keep a **live copy** on
another node and switch to it when needed: promote the copy, then change the
app's `DB_HOST` and the plugin's **Database URL** to the copy's address. The
Hub redeploys both. See [Databases and failover](/hub/databases/).
