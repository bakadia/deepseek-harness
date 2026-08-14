# 本仓库 Git 工作规范

本文件定义本仓库（DeepSeek Harness 的本地开发副本）的 remote 布局、推送红线、分支约定与常用操作。**所有协作方（包括 AI 助手）必须遵守。**

## 1. Remote 布局

| Remote | 地址 | 用途 |
| --- | --- | --- |
| `origin` | `git@codeup.aliyun.com:6a01444afa2a62bc8595e789/custom-harness.git` | **私有仓库**。日常所有修改的默认推送目标，可包含私有/可能商用的代码 |
| `upstream` | `git@github.com:bakadia/deepseek-harness.git` | **GitHub 侧仓库**。仅用于两件事：同步官方代码；按明确指示推送修复分支以便向官方仓库提 PR |

## 2. 推送红线（最高优先级）

1. **默认只推 `origin`（私有库）**。日常开发、私有功能、可能商用的代码，一律 `git push origin ...`。
2. **推送到 `upstream`（GitHub fork）必须由仓库主人明确开口**。收到"上传到 fork""提 PR""提交到官方"这类明确指示之前，一律不推。
3. **永远不直接推送到官方源库**。官方仓库不接受直接 push；回馈上游只能走"fork 分支 → Pull Request"。
4. **绝不提交敏感信息**：API Key、Token、密码、内网地址、个人配置。推送到任何 remote 之前都要自查，`.gitignore` 兜底，`git diff --cached --check` 复查。
5. 不确定该推哪个 remote 时：**默认 `origin`**。

## 3. 分支约定

- `master`：仓库默认分支，跟踪 `origin/master`（私有库）。内容 = 官方基线 + 本规范等少量仓库级文档；不在上面直接堆业务代码。在 master 上执行裸 `git push` 只会推送到私有库，不会误推 fork。
- `private/*`：私有功能、可能商用的代码。推 `origin`。
- `fix/*`：bug 修复（含打算回馈上游的修复）。默认推 `origin`；只有明确要求时才推 `upstream` 并提 PR。
- `feature/*`：功能开发（可选）。默认推 `origin`。

## 4. 常用操作

### 同步官方更新

```bash
git fetch upstream
git merge upstream/master        # 或 git rebase upstream/master
git push origin master           # 同步结果推回私有库
```

### 开始一项私有修改

```bash
git checkout -b private/xxx master
# ...开发、提交...
git push -u origin private/xxx
```

### 修复一个官方 bug（可能回馈上游）

```bash
git checkout -b fix/xxx master
# ...修复、提交...
git push -u origin fix/xxx       # 先存私有库
# 只有仓库主人明确说"提 PR"时才执行下面两步：
git push upstream fix/xxx        # 推到 GitHub fork
# 然后在 GitHub 上对该分支向官方仓库发起 Pull Request
```

### 查看当前推送目标，避免手滑

```bash
git remote -v
git branch -vv                   # 查看每个本地分支跟踪的是哪个 remote
```

## 5. 提交信息规范

- 格式：`<type>(<scope>): <subject>`，例如 `fix(web): 修复 xxx`、`feat(cli): 新增 xxx`、`docs: 更新工作规范`。
- 一个提交只做一件事；涉及敏感信息的改动单独提交、单独审查。
- 文件以单个换行符结尾，提交前 `git diff --cached --check` 通过。

## 6. 协作约定

- 任何 `git push` 动作执行前，先说明目标 remote 和分支，再执行。
- 对 `upstream`（fork）的任何写操作，必须先得到仓库主人的明确指示。
- 本规范变更本身走 `private/*` 分支推 `origin`；如需让官方仓库也采纳，按第 4 节 fix 流程处理。
