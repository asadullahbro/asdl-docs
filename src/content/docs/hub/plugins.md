---
title: Plugins
description: Companion services (like Redis or a search engine) that run next to a project and move with it.
sidebar:
  order: 5.5
---

:::note
This page is about **app plugins**. Plugins that send alerts to Discord,
Slack, email and more are on the [Notifications](/hub/notifications/) page.
:::

A **plugin** is a companion service attached to a project, such as a cache
or a search engine. The Hub runs it:

- on the **same node** as the project,
- in a **private Docker network** only the project and its plugins share, so
  the project reaches it by name and nothing is published on the node,
- and gives the project **environment variables** to reach it (for example
  `REDIS_URL`), which take precedence over the project's own variable with
  the same name.

Every deploy of the project runs its plugins too, so they **move with it** on
moves, failovers and maintenance, and the old node's copies are removed. A
plugin whose settings and image haven't changed is left running across
redeploys. Deleting the project removes its plugins.

:::caution
A plugin's data lives in its container and **doesn't move** between nodes:
plugins are for things that can start empty, like caches and search. Keep
data you can't lose in a database.
:::

## Built-in plugins

| Plugin | Runs | Gives the project |
|---|---|---|
| **Redis** | `redis:7-alpine`, with a generated password, nothing saved to disk | `REDIS_URL` |
| **SearXNG** | `searxng/searxng`, with JSON results enabled | `SEARXNG_URL` |

| **Supabase REST API** | PostgREST, as Supabase serves `/rest/v1/` (public) | `SUPABASE_REST_URL` |

## Public plugins

Most plugins are private: only their project reaches them. A **public**
plugin (`"public": true`) is also served by the Hub at a **domain and path**
you choose when you attach it, like a project. The node publishes its port,
and the Hub routes the domain to wherever the project runs; the route follows
it when it moves. See [Self-hosted Supabase](/hub/supabase/) for a full
example.

## Add one to a project

In **Plugins**, pick a project under the plugin and click **Add** (plugins
that need settings, or a domain for public ones, ask for them). The project
is redeployed with it. Project cards list their plugins; the **×**
removes one (and redeploys the project without it).

Or with the API: `POST /api/v1/projects/:id/plugins` with
`{"plugin_id": "redis"}` (plus `"vars"`, and `"domain"`/`"route_path"` for
public plugins); `PUT /api/v1/projects/:id/plugins/:plugin` to change its
settings or route; `DELETE /api/v1/projects/:id/plugins/:plugin` to remove it.

## Custom plugins

Admins can add their own under **Plugins → Custom plugin**, as JSON:

```json
{
  "id": "memcached",
  "name": "Memcached",
  "description": "A small in-memory cache next to the app.",
  "image": "memcached:1.6-alpine",
  "port": 11211,
  "command": ["memcached", "-m", "64"],
  "vars": [{ "key": "password", "label": "Password", "secret": true, "generate": 32 }],
  "env": {},
  "files": [{ "path": "/etc/app/config.yml", "content": "port: {{port}}" }],
  "provides": { "MEMCACHED_URL": "{{host}}:{{port}}" }
}
```

- `provides` is the variables the project gets (required unless `public`).
- `"public": true` makes it servable at a domain and path chosen on attach.
- In `command`, `env`, `files` and `provides` you can use `{{host}}` (the
  plugin's name in the project's network, which is its `id`), `{{port}}`, and
  `{{var.KEY}}` for settings declared in `vars`.
- A var with `generate` gets a random value of that length if none is given;
  `secret` values are stored encrypted and never shown again.
- `files` are written on the node and mounted read-only at `path`.

The Hub only stores the description; the image is downloaded only on the
nodes that run it.
