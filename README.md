# renovate-config

SakuraPuare 个人仓库的 Renovate 中央配置 + self-hosted runner。

一处改，17 个仓库同时生效。目标仓库里**不放任何配置文件**。

## 怎么跑的

- `.github/workflows/renovate.yml` — ⚠️ **定时触发已停用**（2026-08-03），只留
  `workflow_dispatch` 作应急手动入口。

## 真正的 runner 在哪

**家里 K8s 集群**，不在 GitHub Actions：`homelab-gitops` 仓库 `apps/renovate/`，
CronJob `17 2,3 * * *` + `timeZone: Asia/Shanghai`。

挪进集群的原因：① 本账号免费 Actions 配额耗尽（3000/3000），runner 不再分配；
② token 只需存 Infisical 一处（Actions 读不到 Infisical，那条路要在两边各存一份 PAT）。

⚠️ **两边不能同时定时跑** —— 实测两个 Renovate 实例用同一个 token 并发操作同一批仓库时，
会 `FATAL: Initialization error / Authentication failure`。要恢复 Actions 定时必须先停集群 CronJob。

⚠️ 改任何一侧的排期时间，都必须确认新时间落在 `default.json` 的 `schedule` 窗口内
（现为 `after 2am and before 7am`, Asia/Shanghai）。窗口外的 run 对普通更新完全无事可做 ——
只有 `vulnerabilityAlerts`（显式 `schedule: null`）能穿过。2026-08-02 实测踩过：窗口外那轮
在 Hive 上看到 115 个依赖，却只产出 4 个 vulnerability 分支。
- `config.js` — runner 全局配置：仓库清单 + `requireConfig: 'optional'`（目标仓库无配置也照跑）
  + `extends` 指向本仓库 `default.json`。
- `default.json` — 共享规则本体，也是可被别人 `extends` 的标准 preset。

目标仓库要单独微调时，往它根目录放 `renovate.json`，会与 `default.json` merge 并覆盖：

```json
{ "extends": ["github>SakuraPuare/renovate-config"], "schedule": ["on monday"] }
```

## 合并策略

| 更新类型 | 冷却 | automerge |
|---|---|---|
| digest（actions / 容器镜像） | 1 天 | ✅ |
| patch | 3 天 | ✅ |
| minor | 3 天 | ✅ |
| minor（当前版本 0.x） | 7 天 | ❌ 人工 |
| major | 7 天 | ❌ 人工 |
| 语言运行时（go / node / python / setup-*） | — | ❌ 人工 |
| 安全告警 | 无冷却，插队 | ✅ |

`devDependencies` 的 minor+patch 合成一个 `dev-dependencies` PR 降噪。
每月 1 号做一次 lock file maintenance。

⚠️ **这 17 个仓库里只有 6 个有 GitHub Actions**，其余没有任何 CI。
`automergeType: pr` 会等 PR 检查变绿再合，**没有检查的仓库等于立刻合** ——
即 minor 升级无验证直接进默认分支。这是明确选择的取舍，靠 3 天冷却让上游先踩坑兜底。
想收紧就把 `default.json` 的顶层 `automerge` 改 `false`，或给某仓库单独放 `renovate.json`。

⚠️ 目标仓库的 `allow_auto_merge` 全为 `false`，GitHub 原生 auto-merge 不可用，
故设 `platformAutomerge: false`，由 Renovate 自己调 API 合。代价是 PR 变绿后要等**下一轮** run
才被合，所以 runner 一天跑两轮。

## 覆盖范围

17 个自有、非 archive、非 fork、且有依赖清单的仓库（2026-07-30 盘点）。清单见 `config.js`。

另有 10 个活跃仓库无任何依赖清单（`mihomo-config` `commitron` `dotfiles` `csharp-hmi-skills`
`aem-silicon` `apollo-config` `OpenGLJourney` `CompilersPrinciple` `SecondTierSurvivalManual`
`Leetcode_Solution`），接了无事可做，未列入。64 个已 archive 仓库和 14 个 fork 一并排除。

## RENOVATE_TOKEN

需要一个有权限读写这 17 个仓库的 PAT，存为本仓库的 Actions secret `RENOVATE_TOKEN`。

- Classic PAT：勾 `repo` + `workflow`（`workflow` 是改 `.github/workflows/` 下 action 版本必需的）。
- Fine-grained PAT：选中这 17 个仓库，权限给 Contents:RW、Pull requests:RW、Issues:RW、Workflows:RW、
  Metadata:RO；要 `vulnerabilityAlerts` 生效再加 Dependabot alerts:RO。

## 加/减仓库

改 `config.js` 的 `repositories` 数组即可，不用动目标仓库。

## 手动触发

```bash
# dry-run（不开 PR、不合并）
gh workflow run renovate.yml -R SakuraPuare/renovate-config -f dryRun=true -f logLevel=debug
# 真跑
gh workflow run renovate.yml -R SakuraPuare/renovate-config
```
