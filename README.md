# HoYoShadeHub-Glasses-Edgeone

Developed from [handy-oss/edgeone-proxy](https://github.com/handy-oss/edgeone-proxy) and [6Kmfi6HP/edgeone-proxy](https://github.com/6Kmfi6HP/edgeone-proxy), thanks you.

HoYoShadeHub Glasses will continue to be released under the MIT License used by Original Project.

## Keeping a fork in sync

Forks can automatically follow this repository with the [Sync Upstream](.github/workflows/sync-upstream.yml) workflow. It is off by default.

To turn it on in your fork:

1. Open the **Actions** tab and enable workflows (GitHub disables them in new forks).
2. Go to **Settings > Secrets and variables > Actions > Variables** and add `UPSTREAM_SYNC_ENABLED` = `true`.

Every 6 hours (or on a manual run) it compares your branch with upstream. If upstream has new commits, your branch is fast-forwarded to the exact upstream commits, so no merge or "sync" commit is created. If nothing changed, it does nothing. Delete the variable or set it to anything other than `true` to turn it off.

Optional settings:

| Name | Type | Purpose |
| --- | --- | --- |
| `UPSTREAM_REPO` | variable | Upstream `owner/name`. Defaults to the fork's parent. |
| `UPSTREAM_BRANCH` | variable | Upstream branch to follow. Defaults to upstream's default branch. |
| `UPSTREAM_SYNC_BRANCH` | variable | Branch in your fork to update. Defaults to your default branch. |
| `UPSTREAM_SYNC_FORCE` | variable | `true` resets your branch to upstream when it has diverged. This discards your own commits on that branch. |
| `UPSTREAM_SYNC_TOKEN` | secret | Personal access token with Contents and Workflows write access. Needed only when upstream changes files in `.github/workflows`, which the default token cannot push. |

If your branch has commits that upstream doesn't, and `UPSTREAM_SYNC_FORCE` is not set, the run fails instead of creating a merge commit.
