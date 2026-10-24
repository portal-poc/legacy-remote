# legacy-remote

Legacy remote on React 18 + React Router 7, shares nothing: the host mounts it through MF Bridge.
Exposes `./RemoteRoot`, `./RemoteBridge`, `./runtime`, `./preload`. Builds with `@portal-poc/vite-config`.

## Local setup

One-time (see the platform repository for the full guide):

```sh
# ~/.npmrc — internal scope from GitHub Packages (token needs read:packages)
@portal-poc:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<token>
```

All repositories side by side: `~/projects/portal-poc/{platform,registry,host,tasks-remote,legacy-remote}`.

## Run

```sh
pnpm install
pnpm dev     # :5175
```

## Release (PoC stands)

```sh
export PORTAL_NEXUS_DIR=~/projects/portal-poc/platform/.infra/nexus   # artifact store (Nexus stand-in)
export PORTAL_REGISTRY_DIR=~/projects/portal-poc/registry             # clone of the registry repository
pnpm release:uat   # build → verify → publish immutable version → PR to the registry (gate against the uat host)
```

Merge the registry PR, then deploy the stand config from the registry repository (`pnpm deploy:uat`).
