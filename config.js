// Renovate runner 全局配置（self-hosted，跑在本仓库的 GitHub Actions 里）。
//
// 设计要点：目标仓库里【不放任何 renovate 配置文件】。
//   - autodiscover:false + repositories 显式清单 —— 新仓库要接就往下面加一行，
//     不会因为 autodiscover 把 64 个 archive 仓库和 14 个 fork 全扫进来。
//   - requireConfig:'optional' —— 目标仓库没有 renovate.json 也照跑。
//   - onboarding:false —— 不去各仓库开"Configure Renovate"引导 PR。
//   - extends —— 共享规则从本仓库 default.json 取；某个仓库要微调，
//     往它根目录放 renovate.json，会与这份 merge 并覆盖。
module.exports = {
  platform: 'github',
  token: process.env.RENOVATE_TOKEN,

  autodiscover: false,
  onboarding: false,
  requireConfig: 'optional',

  // 共享规则（本仓库 default.json）。目标仓库自带 renovate.json 时会在此之上覆盖。
  extends: ['github>SakuraPuare/renovate-config'],

  // Dependency Dashboard 汇总到各仓库的 issue，便于一眼看待办与被 ignore 的项。
  dependencyDashboard: true,

  // 全部 17 个有依赖清单的自有非 archive 非 fork 仓库（2026-07-30 盘点）。
  // 另 10 个活跃仓库无任何依赖清单（mihomo-config / commitron / dotfiles /
  // csharp-hmi-skills / aem-silicon / apollo-config / OpenGLJourney /
  // CompilersPrinciple / SecondTierSurvivalManual / Leetcode_Solution），接了无事可做，未列入。
  repositories: [
    // —— 2026 年有 push ——
    'SakuraPuare/SakuraPuare',                  // profile，默认分支 anime，gh-actions
    'SakuraPuare/Hive',                         // compose+docker+gh-actions+gomod+npm
    'SakuraPuare/fontawesome-converter',        // gh-actions+pip
    'SakuraPuare/apollo-map-studio',            // gh-actions+npm
    'SakuraPuare/apollo-miku-planner',          // pep621+poetry/uv lock
    'SakuraPuare/Ink',                          // private：compose+gomod+pep621
    'SakuraPuare/access-guard',                 // gh-actions+npm
    'SakuraPuare/gitlab-search',                // gomod
    'SakuraPuare/Hydra',                        // compose+docker
    'SakuraPuare/commitlog',                    // gomod
    'SakuraPuare/apollo-map-offsets',           // pip
    // —— 2025 及更早，仍未 archive ——
    'SakuraPuare/apollo-neo-env-manager-dev',   // gh-actions
    'SakuraPuare/ApolloDatabase',               // npm
    'SakuraPuare/github-stats-analyzer',        // gh-actions+pep621+pip
    'SakuraPuare/RL-2048',                      // pip
    'SakuraPuare/Bilibili-Emoji-Downloader',    // pip
    'SakuraPuare/ZhiHu_Spider',                 // pip，默认分支 master
  ],
};
