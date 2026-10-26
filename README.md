# legacy-remote

Legacy remote on React 18 + React Router 7, shares nothing: the host mounts it through MF Bridge.
Exposes `./RemoteRoot`, `./RemoteBridge`, `./runtime`, `./preload`. Builds with `@portal-poc/vite-config`.

## What it demonstrates

An app on another React that keeps its stack and its identity provider:

| What | File |
|---|---|
| Bridge mount: own React 18 root and router inside the host, `navigateToHost`, leave guards through the contract (no runtime package) | `src/exposes/RemoteBridge.tsx`, `RemoteRoot.tsx` |
| One login: the host's token for `api://legacy-bff/Legacy.Read`, exchanged on-behalf-of by the BFF for a legacy-auth token (ADR 0027) | `src/fake-legacy-bff.ts`, `LegacyProfileCard` in `RemoteRoot.tsx` |
| Build: `createRemoteViteConfig({ isolated: true })` — shares nothing, bridge only | `vite.config.ts` |

Trunk is `main` (no develop). Platform docs: [`docs/playbook.md`](https://github.com/portal-poc/platform/blob/main/docs/playbook.md).

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

## Deploy

Nothing deploys by itself: **Actions → Deploy → Run workflow**, pick the stand and the branch or tag. Rules (checked
before the build, see platform `docs/branching.md`): `dev3` takes any branch and is overwritten in place; `dev2` the
newest `release/X.Y` or its tags, `dev1` the pilot line; `tst` only via "Promote" in the registry.

The pipeline runs `pnpm dlx @portal-poc/cli@2 deploy --stand <stand> --ref <ref> --push`; uploads need the Nexus
deploy credentials, which only the pipeline has. Locally run the same checks without uploading: `pnpm build &&
pnpm verify` (gate 1) and `pnpm check` in the registry (gate 2 against every stand's host).
