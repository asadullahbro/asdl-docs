---
title: Notifications
description: Get told on Discord, Slack, Telegram, ntfy, email or a webhook when a deploy fails, an app goes down or a node goes offline.
sidebar:
  order: 5.7
---

The Hub can tell you what it did or noticed: a deploy failed, an app stopped
answering and was moved, a node went offline, a new Hub release is out.

Notifications are plugins too. Open **Plugins → Notifications** in the
dashboard (admins only) and **Add** a notification plugin (Discord, Slack,
Telegram, ntfy, email, webhook, or [one of your own](#custom-notification-plugins))
to make a channel. Add the same plugin as often as you like, for example one
Discord channel per team. Each channel chooses its own events and, if you
like, which apps it hears about.

A new channel gets a test message right away, so a wrong URL shows up at once.
**Send test** sends another any time, and each channel shows when it last sent
something and the last error, if any.

## Built-in notification plugins

| Plugin | What you need |
|---|---|
| **Discord** | A webhook URL: channel settings → **Integrations** → **Webhooks** → **New Webhook** → **Copy Webhook URL**. Optionally a mention (`@here`, `<@&role id>`) added to failures. |
| **Slack** | An [incoming webhook](https://api.slack.com/messaging/webhooks) URL (`https://hooks.slack.com/services/…`). Mattermost and Rocket.Chat incoming webhooks work too. |
| **Telegram** | A bot token from [@BotFather](https://t.me/BotFather) and the chat ID. Add the bot to the chat, send it a message, then open `https://api.telegram.org/bot<token>/getUpdates` to find the chat ID. |
| **ntfy** | A topic name. Install the [ntfy app](https://ntfy.sh), subscribe to the topic and you get push notifications on your phone. Works with ntfy.sh or your own server (with an access token if it needs one). |
| **Email** | An SMTP server: host, port (587 with STARTTLS or 465 with TLS), username and password, a From address and one or more To addresses. For Gmail, use an [app password](https://myaccount.google.com/apppasswords). |
| **Webhook** | Any URL. The Hub POSTs each event as JSON, [signed](#webhook-format) if you set a secret. Use it for n8n, Zapier or your own scripts. |

:::tip
On ntfy.sh anyone who knows a topic can read it, so pick one that's hard to
guess, like `asdl-7f3k2q9`.
:::

Webhook URLs, tokens and passwords are stored encrypted and shown masked in
the dashboard and API.

## Events

| Event | Sent when |
|---|---|
| **Deploys** (`deploy.succeeded`) | An app was deployed by a push, the dashboard or a move. Says which node, image and commit, and where it moved from. |
| **Failed deploys** (`deploy.failed`) | A deploy failed. Includes the last lines of its log and a link to the job. |
| **App down** (`app.down`) | An app failed three health checks in a row (about 30 seconds). Says which node it's being moved to, or that there is no node left. |
| **App back up** (`app.recovered`) | An app that was down answers again, and how long it was down. |
| **Node offline** (`node.offline`) | A node missed its heartbeats for 90 seconds. |
| **Node back online** (`node.online`) | An offline node is back, and how long it was gone. |
| **Maintenance** (`node.maintenance`) | A node went into or out of [maintenance](/hub/maintenance/), with the apps that are moving. |
| **Hub updates** (`hub.update`) | A new ASDL Hub release is available. |

A failover sends two messages, **App down** and then **App back up**, rather
than a separate deploy message. The same message about the same thing is sent
at most once a minute, so a flapping node doesn't flood a channel.

**App events for** limits a channel to some apps: for example, one Discord
channel per team. Node and Hub events go to every channel that chose them.

## Custom notification plugins

For a service that isn't built in (Microsoft Teams, Google Chat, Gotify,
Pushover, Matrix, your own API…), describe the HTTP request it wants and add
it as a plugin: **Plugins → Custom plugin → Notification plugin**, paste the
JSON, then **Add** it like a built-in one.

```json
{
  "id": "google-chat",
  "name": "Google Chat",
  "description": "Posts to a Google Chat space through an incoming webhook.",
  "fields": [
    { "key": "url", "label": "Webhook URL", "secret": true, "required": true }
  ],
  "request": {
    "url": "{{.config.url}}",
    "body": "{\"text\": {{json .text}}}"
  }
}
```

- `fields` are the settings asked for when the plugin is added as a channel:
  `key`, `label`, and optionally `placeholder`, `help`, `default`, `secret`
  (stored encrypted, shown masked) and `required`.
- `request` has `url`, and optionally `method` (`POST` by default; `PUT`,
  `PATCH` or `GET`), `headers` and `body`. A body starting with `{` or `[` is
  sent as `application/json`; set `Content-Type` in `headers` for anything
  else. A header whose value comes out empty isn't sent.
- `url`, `headers` and `body` are [Go templates](https://pkg.go.dev/text/template).
  They can use:

| Template | Value |
|---|---|
| `{{.title}}`, `{{.message}}` | The event's title and sentence. |
| `{{.text}}` | Everything as plain text: title, message, fields, log lines and link. |
| `{{.details}}` | Log lines (failed deploys). |
| `{{.url}}` | Dashboard link. |
| `{{.event}}`, `{{.level}}` | E.g. `app.down`, `error`. |
| `{{.emoji}}`, `{{.color}}`, `{{.hex}}` | ✅ ⚠️ 🔴 ℹ️; the level's colour as a number (for Discord-style embeds) or `#rrggbb`. |
| `{{.project}}`, `{{.node}}`, `{{.time}}` | The app, the node, and when (RFC 3339). |
| `{{.fields}}` | A list of `{name, value}` to `range` over. |
| `{{.config.KEY}}` | A field's value. |
| `{{json X}}` | X as a JSON value: quoted and escaped. Use it for text inside a JSON body. |

For example, a header that is only sent when an optional token is set:
`"Authorization": "{{if .config.token}}Bearer {{.config.token}}{{end}}"`.

Adding a plugin with the same `id` again replaces it. A custom plugin can be
removed once no channel uses it. Built-in ids can't be reused.

## Webhook format

Every event is POSTed as JSON with `Content-Type: application/json` and an
`X-ASDL-Event` header naming the event:

```json
{
  "event": "app.down",
  "level": "error",
  "title": "api is down",
  "message": "api stopped answering on node-1, so it is being moved to node-2.",
  "fields": [{ "name": "Node", "value": "node-1" }],
  "details": "",
  "url": "https://hub.example.com/projects",
  "project_id": "5f0c…",
  "project": "api",
  "node": "node-1",
  "time": "2026-09-27T10:36:06Z"
}
```

`level` is `info`, `success`, `warning` or `error`. `details` holds log lines
for failed deploys.

If you set a signing secret, the request has
`X-ASDL-Signature: sha256=<hex HMAC-SHA256 of the body with the secret>`.
Check it before trusting the request, for example in Python:

```python
import hmac, hashlib

def valid(body: bytes, header: str, secret: bytes) -> bool:
    want = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(want, header)
```

## Delivery

Messages are sent in the background and retried once after 5 seconds if the
service doesn't answer. A channel that keeps failing shows the error on the
Notifications page; switch it off there without deleting it.

Links in messages point at your dashboard, using the Hub's `PUBLIC_URL`.

If a channel shows an error or nothing arrives, see
[Troubleshooting → Notifications](/hub/troubleshooting/#notifications).

## API

Admin only, under `/api/v1`:

| Request | Does |
|---|---|
| `GET /notifications/types` | Notification plugins (built-in and custom) with their settings, and the events. |
| `POST /notifications/types` | Add or replace a [custom notification plugin](#custom-notification-plugins) (the JSON above). |
| `DELETE /notifications/types/:id` | Remove a custom notification plugin no channel uses. |
| `GET /notifications` | Channels (secrets masked). |
| `POST /notifications` | `{"type", "name", "config": [{"key", "value"}], "events", "projects"}`. Without `events` it gets them all. |
| `PUT /notifications/:id` | Change any of `name`, `config`, `events`, `projects`, `enabled`. Masked values sent back unchanged keep what's stored. |
| `DELETE /notifications/:id` | Remove a channel. |
| `POST /notifications/:id/test` | Send a test now; answers `502` with the service's error if it fails. |
