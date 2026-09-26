---
title: Domains and HTTPS
description: Give an app a domain; the Hub routes it and gets a certificate.
sidebar:
  order: 6
---

## Give an app a domain

1. Create a DNS **`A` record** for the domain pointing at your **Hub's
   server IP** (not the node's). For example `app.example.com → 203.0.113.10`.
2. In the dashboard, **Edit** the project and set **Domain** to
   `app.example.com`.

Within a few seconds the Hub:

- adds a route for the domain to nginx on the Hub server,
- requests a free [Let's Encrypt](https://letsencrypt.org/) certificate,
- switches the domain to HTTPS and redirects `http://` to `https://`.

Traffic then flows: visitor → Hub (nginx) → private network → the node
running the app. When the app moves to another node, the route follows it.

:::note
Until the certificate is issued, the domain works over plain HTTP. If DNS
isn't pointing at the Hub yet, the Hub retries at most every 10 minutes
(Let's Encrypt limits failed attempts).
:::

## Renewals

Certificates last 90 days. `certbot` on the Hub server renews them
automatically and nginx reloads to use the new one. To check renewals work:

```bash
sudo certbot renew --dry-run
```

(Older certbot versions wait a random few minutes before starting — that is
normal.)

## Checking a domain

```bash
# Does DNS point at the Hub?
dig +short app.example.com

# Which certificate is served, and until when?
echo | openssl s_client -connect app.example.com:443 -servername app.example.com 2>/dev/null \
  | openssl x509 -noout -subject -enddate
```

On the Hub server, the generated routes are in
`/etc/nginx/asdl-hub.d/routes.conf` and the Hub logs every change:

```bash
journalctl -u asdl-hub | grep -E "Nginx|Certificate"
```

:::caution
Don't also add your own nginx site for a domain that a project uses — two
sites for one domain conflict. Let the Hub manage it.
:::
