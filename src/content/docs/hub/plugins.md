---
title: Plugins
description: Companion services (like Redis or a search engine) that run next to a project and move with it.
sidebar:
  order: 5.5
---

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

## Add one to a project

In **Plugins**, pick a project under the plugin and click **Add**. The
project is redeployed with it. Project cards list their plugins; the **×**
removes one (and redeploys the project without it).

Or with the API: `POST /api/v1/projects/:id/plugins` with
`{"plugin_id": "redis"}`, and `DELETE /api/v1/projects/:id/plugins/redis`.

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

- `provides` is required: the variables the project gets.
- In `command`, `env`, `files` and `provides` you can use `{{host}}` (the
  plugin's name in the project's network, which is its `id`), `{{port}}`, and
  `{{var.KEY}}` for settings declared in `vars`.
- A var with `generate` gets a random value of that length if none is given;
  `secret` values are stored encrypted and never shown again.
- `files` are written on the node and mounted read-only at `path`.

The Hub only stores the description; the image is downloaded only on the
nodes that run it.
