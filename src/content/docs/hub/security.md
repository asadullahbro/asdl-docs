---
title: Sign-in and security
description: Two-factor sign-in, the login rate limit, roles and tokens.
sidebar:
  order: 7.95
---

The dashboard signs people in with a username and password. This page covers
what protects that, and how to add a second factor.

## Two-factor sign-in

Two-factor sign-in asks for a 6-digit code from an authenticator app (Google
Authenticator, Aegis, 1Password, Authy…) as well as your password. It works
for every user, on their own account, and needs Hub v0.13.8 or later.

### Turn it on

1. Open **Settings → Two-factor sign-in** and click **Set up**.
2. Scan the QR code with your authenticator app. If you can't scan it, type the
   key shown under it into the app instead.
3. Enter the 6-digit code the app shows and click **Turn on**.
4. Save the **ten recovery codes** that appear. They are shown once.

From then on, signing in asks for the password, then a code. The code is
checked within 30 seconds either side of the Hub's clock, and each code works
once.

:::tip
Open a second browser window and sign in once before you close the first. That
proves the app and the recovery codes work while you can still turn it off.
:::

### Recovery codes

Each recovery code (like `k3f9x-2mq8a`) signs you in once, in place of the 6-digit
code. Capitals and the dash don't matter. Keep them somewhere other than the
phone that holds the authenticator, such as a password manager.

### Turn it off

In **Settings → Two-factor sign-in**, click **Turn off** and enter your
password and a current code (or a recovery code). Asking for both means that
someone using your open browser can't switch it off.

### Someone lost their phone and recovery codes

An admin can reset it: **Settings → Users → Reset 2FA** next to their name.
They then sign in with just their password and can set it up again. Users
with two-factor on show a **2FA** mark in that list.

If the only admin is locked out, run `asdl-hub` on the Hub server instead.
The server's own login doesn't go through the dashboard, so it keeps working:

```console
$ sudo asdl-hub whoami
```

then reset the account from a signed-in dashboard session, or from the API with
that token (`DELETE /api/v1/settings/users/<id>/2fa`).

### Command line

`asdl-hub login` asks for the code after the password when two-factor is on:

```console
$ asdl-hub login https://hub.example.com
Username: alice
Password:
Two-factor code (or a recovery code): 123456
```

### What it doesn't cover

Two-factor protects **signing in with a password**. These skip it, because they
are made to work without a person:

- **Permanent tokens** from **Settings → Tokens**, and the token `asdl-hub`
  saves when an admin logs in. Treat them like passwords, and revoke the ones
  you no longer use.
- **The Hub server's own CLI token**, readable only by root on that machine.
- **Agents**, which authenticate by their WireGuard address, not by a user.

:::caution
The authenticator secrets are encrypted with a key derived from the Hub's
`JWT_SECRET`. If you change `JWT_SECRET`, everyone's stored secret becomes
unreadable and each user with two-factor needs an admin reset.
:::

## Limits on failed logins

To stop password guessing, the Hub refuses further attempts for 15 minutes
after:

- **8 wrong passwords or codes from one address**, or
- **20 wrong passwords or codes for one account**, from any addresses.

A refused attempt gets HTTP `429` with a `Retry-After` header, and the
dashboard says how long to wait. While a limit is active, even the right
password is refused from that address. The counts are kept in memory, so
restarting the Hub clears them. A successful sign-in clears the account's
count but not the address's.

Someone who knows a username can make the 20-per-account limit refuse that
account's sign-ins for up to 15 minutes. If that happens to an admin, use
`sudo asdl-hub` on the server, which doesn't depend on the login.

The Hub works out each caller's address from the connection, and believes
`X-Forwarded-For` only when it comes from the nginx in front of it. See
`TRUSTED_PROXIES` in the [configuration reference](/hub/reference/configuration/).

## Roles and tokens

- **viewer** can look, **operator** can also deploy and change apps, and
  **admin** can also manage users, tokens and settings, and open a node's
  terminal.
- Sessions from signing in last 24 hours.
- Permanent tokens last until you revoke them in **Settings → Tokens**.
- Changing someone's role or deleting them takes effect on their next request.
