---
title: Deploy from GitHub
description: Build your app in GitHub Actions and deploy it to your nodes on every push.
sidebar:
  order: 4
---

Your repo builds a Docker image in GitHub Actions, pushes it to the GitHub
Container Registry (ghcr.io), and tells the Hub to run it. The Hub checks
the request really comes from that repo's workflow (GitHub OIDC), so no
passwords or API keys are stored in GitHub.

## 1. Allow the repo

In the dashboard, open **GitHub → Authorized Repositories** and add the
repository as `owner/repo`. Only authorized repos can deploy.

## 2. Add a registry token (private images)

If the image is private, the nodes need permission to pull it. Create a
GitHub personal access token with the **`read:packages`** scope and add it
under **GitHub → GitHub Tokens**. It is stored encrypted and only handed to a node
while it pulls the image.

## 3. Add the workflow

Save this as `.github/workflows/deploy.yml` in your repo and replace
`https://hub.example.com` with your Hub's URL (the dashboard's **GitHub**
page shows it filled in):

```yaml
name: Deploy

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  id-token: write    # lets the workflow prove to the Hub which repo it is
  packages: write    # lets it push the image to ghcr.io

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        id: build
        run: |
          IMAGE=ghcr.io/$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
          docker build -t $IMAGE:${{ github.sha }} .
          docker push $IMAGE:${{ github.sha }}
          echo "image=$IMAGE:${{ github.sha }}" >> $GITHUB_OUTPUT

      - name: Get OIDC token
        id: oidc
        run: |
          TOKEN=$(curl -sSL \
            -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
            -H "Accept: application/json; api-version=2.0" \
            "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=https://hub.example.com" \
            | jq -r '.value')
          echo "token=$TOKEN" >> $GITHUB_OUTPUT

      - name: Deploy to ASDL Hub
        run: |
          curl -sSf -X POST https://hub.example.com/api/v1/deploy \
            -H "Content-Type: application/json" \
            -d "{
              \"oidc_token\": \"${{ steps.oidc.outputs.token }}\",
              \"image\": \"${{ steps.build.outputs.image }}\"
            }"
```

Push to `main` (or run the workflow by hand from the **Actions** tab). The
first deploy creates a project named after the repo.

## What happens on a deploy

1. The Hub verifies the OIDC token and that the repo is allowed.
2. It checks the image belongs to the repo (see below).
3. It picks a node: the project's current node if it is online, otherwise
   the healthiest online node.
4. The node pulls the image, replaces the old container, and checks the new
   one is still running a few seconds later.
5. If it is, the project is marked **running** and its domain route is
   updated. If it isn't, the deploy is marked failed and the job log shows
   the container's last output.

Watch it under **Jobs** or on the project in **Projects**.

## Rules for the image

A repo can only deploy **its own package**: `ghcr.io/<owner>/<repo>` or a
path under it (such as `ghcr.io/<owner>/<repo>/api`), with any tag. This
stops a workflow from running some other image on your nodes. Owner and repo
are compared case-insensitively.

## Your app's port

The Hub reads the port from your image's `EXPOSE` line, so make sure your
`Dockerfile` has one:

```dockerfile
EXPOSE 8000
```

Without it, the Hub assumes port 8000. See [Ports](/hub/configure-an-app/#ports).

## Troubleshooting

| Response from `/api/v1/deploy` | Meaning |
|---|---|
| `401 token verification failed` | The `audience` in the workflow doesn't match your Hub's URL, or `id-token: write` is missing. |
| `403 repository … is not authorized` | Add the repo under **GitHub → Authorized Repositories**. |
| `403 image … must be ghcr.io/<owner>/<repo>` | The image name doesn't match the repo — see the rules above. |
| `503 no available nodes` | No node is online. |
