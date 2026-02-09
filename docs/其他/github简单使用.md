<!-- markdownlint-disable -->

Q：vs code怎么导出设置？我在工作机上用vs code写代码，各种环境跟插件我都配置好了。 我现在想在另一台电脑上配置一模一样的环境，有没有什么便捷的方案？

```
使用官方自带的 Settings Sync，配合github账号
```

前提：两台电脑都能上网，最好都能登录同一个 GitHub / Microsoft 账号。

### 1. 在工作机上开启同步

1. 打开 VS Code（工作机）。
2. 右下角/左下角有个齿轮 ⚙ → 点击 `Turn on Settings Sync...`（开启设置同步）。
    如果没看到，可以：
   - `Ctrl + Shift + P` → 搜索 `Settings Sync: Turn On`
3. 选择用 **GitHub** 或 **Microsoft** 账号登录一下。
4. VS Code 会问你：要同步啥？
   - ✅ Settings（设置）
   - ✅ Keybindings（快捷键）
   - ✅ Extensions（扩展）
   - ✅ UI State / Snippets 等等
      基本都勾上就行。

之后你在这台机子上：

- 安装的扩展
- 修改的设置（包括工作台主题、字体、格式化规则等）

都会自动同步到云端。

------

### 2. 在另一台电脑上“复刻”环境

1. 在新电脑上安装 VS Code。
2. 打开 VS Code，用同样的方法：
   - `Ctrl + Shift + P` → `Settings Sync: Turn On`
3. 用**同一个账号**登录（GitHub 或 Microsoft）。
4. 选择 `Merge` 或 `Replace`：
   - 如果新电脑几乎是空白，直接选 **Replace Local**（用云端覆盖本地）。
   - 如果本地已经有一些设置，就选 **Merge**。

VS Code 会自动帮你：

- 安装你在工作机上的那些插件
- 同步你的 `settings.json`、快捷键、主题等等

等它自己装完扩展就基本一模一样了。

> ✅ 这是最省心的方案：以后你在任意一台电脑改设置、装插件，其他电脑都会自动跟着变。

好，我们来搞“用 GitHub 搬家项目”这件事。
 你就把 GitHub 当成：**一个帮你在两台电脑之间同步项目的网盘，但带版本控制。**

整体分两步：

1. 电脑 A：把现有项目“推”到 GitHub
2. 电脑 B：从 GitHub “拉”下来，以后两个来回 `push / pull` 就能同步

我按这种场景一步步写，你照抄命令就行。

------

## 0. 先准备好三个东西

### ① 注册 GitHub 账号

去 github.com 注册一个账号（如果已经有就跳过）。

### ② 安装 Git

在两台电脑都装：

- Windows：去 Git 官网装 `Git for Windows`，装完以后终端里可以 `git --version`。

- 在 VS Code 里：`终端 → 新建终端`，输入：

  ```bash
  git --version
  ```

  能看到版本号就 OK。

### ③ 给 git 写上你的名字 & 邮箱（只需要做一次）

在任意一个终端执行（两台电脑都做一遍）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

邮箱可以用你的 GitHub 邮箱。

------

## 1. 在电脑 A：把本地项目上传到 GitHub

假设你在电脑 A 上已经有一个项目文件夹，比如 `D:\projects\my-app`。

### 1.1 在项目里初始化 git 仓库

1. 用 VS Code 打开这个项目文件夹。
2. 打开 VS Code 终端：`Ctrl + Shift + ~`（或菜单“终端 → 新建终端”）。
3. 确认当前目录是项目根目录（能看到 `package.json` / `README` 那种位置），然后执行：

```bash
git init
git status
```

这时应该能看到一堆 `Untracked files`（未跟踪文件）。

> 说明：这个项目现在已经变成 git 仓库了，但还没任何“快照”。

------

### 1.2 第一次提交（commit）

先把所有文件加入版本控制：

```bash
git add .
```

然后做一次提交：

```bash
git commit -m "Initial commit"
```

到这里为止：

- 你的项目已经在本地有了一份完整的历史记录（第一个版本）。
- 但还只在你电脑 A 上，还没上 GitHub。

------

### 1.3 在 GitHub 网站上创建一个仓库

1. 打开浏览器 → 登录 GitHub。
2. 右上角 `+` → `New repository`。
3. 填：
   - Repository name: 比如 `my-app`
   - Visibility: 建议选 `Private`（私有），不想公开就用这个。
   - **不要勾选** “Initialize this repository with a README”等（避免跟本地冲突）。
4. 点 `Create repository`。

创建成功后，会看到 GitHub 给你一串提示命令，大概长这样：

```bash
git remote add origin https://github.com/你的用户名/my-app.git
git branch -M main
git push -u origin main
```

------

### 1.4 在电脑 A 上把代码推到 GitHub

回 VS Code 终端，在项目根目录执行刚才那几行（按顺序）：

```bash
git remote add origin https://github.com/你的用户名/my-app.git
git branch -M main
git push -u origin main
```

第一次 `git push` 的时候：

- 可能会弹出一个浏览器，让你登录 GitHub / 授权。
- 或 VS Code 右下角弹出 “Sign in to GitHub” 对话框，你点允许就行。

成功后，你刷新 GitHub 仓库页面，就能看到你所有项目文件了。

> ✅ 到这里：
>  电脑 A → GitHub 上传成功。
>  现在 GitHub 上有一份完整项目。

------

## 2. 在电脑 B：从 GitHub 拉取（clone）

接下来在另一台电脑 B 上，把这个项目拉下来。

### 2.1 在电脑 B 上安装 Git & VS Code

同样：

- 安装 Git（`git --version` 能用）。
- 安装 VS Code（如果还没装的话）。
- `git config --global user.name / user.email` 配一下（只需一次）。

### 2.2 用 `git clone` 把仓库拉下来

1. 在 GitHub 仓库页面，点绿色按钮 **“Code”** → 选择 `HTTPS`，复制那串地址，比如：

   ```text
   https://github.com/你的用户名/my-app.git
   ```

2. 在电脑 B 上打开一个终端（VS Code 或系统终端都行），先切到你想放项目的目录，比如：

```bash
cd D:\projects
```

1. 运行：

```bash
git clone https://github.com/你的用户名/my-app.git
```

1. 执行完会多一个 `my-app` 文件夹，进到里面：

```bash
cd my-app
```

然后你就可以用 VS Code 打开这个文件夹开始开发了。

> ✅ 现在：
>  电脑 B 上有一份跟 GitHub、电脑 A 一模一样的项目。

------

## 3. 以后日常怎么同步？（push / pull）

假设你在电脑 B 上改了代码，想同步回 GitHub，再让电脑 A 拉下来。

### 3.1 在电脑 B：提交 + 推送

在项目根目录里，按顺序执行：

```bash
git status                 # 看看改了什么
git add .                  # 把修改加入暂存区
git commit -m "描述本次改动"   # 做一个提交
git push                   # 推到 GitHub（因为第一次已经 -u 过了，可以直接 git push）
```

### 3.2 在电脑 A：拉取最新修改

在电脑 A 的同一个项目目录：

```bash
git pull
```

这样就把电脑 B 的改动拉下来了，两边就同步了。

以后你只要记住这两套命令：

- **有改动的一端：**

  ```bash
  git add .
  git commit -m "说明你干了啥"
  git push
  ```

- **想更新的一端：**

  ```bash
  git pull
  ```

就能在两台机器之间来回同步了。

------

## 4. 不想敲命令的话，VS Code 也有图形界面

你习惯 VS Code 的话，可以这么玩（概念一样，只是点点点）：

### 初始化 & 首次上传（电脑 A）

1. 左侧边栏点“Source Control”（源码管理，那个树枝图标）。
2. 如果没有 git 仓库，会有个按钮 `Initialize Repository` → 点一下 = `git init`。
3. 上面会列出所有改动文件，点顶部的 `+` 可以 `git add`。
4. 在上方输入框里写提交说明，比如 `Initial commit`，点右侧的勾 = `git commit`。
5. 右下角可能有 `Publish to GitHub` 之类的按钮，点一下按提示操作，就会帮你：
   - 在 GitHub 上创建仓库
   - 配置远程
   - 做第一次 `git push`

### 以后日常提交 & 推送（两边都一样）

- `Source Control` 视图里：
  - 使用 `+` 把改动加入暂存区（等价 `git add`）
  - 输入 commit message，点 √（等价 `git commit`）
  - 顶部会有 `Sync Changes` / `Push` / `Pull` 图标，点一下即可。

你愿意的话，可以混搭：
 有时候用命令，有时候用 VS Code GUI，本质是同一套 git 操作。

------

## 5. 下一步可以这么玩

如果你愿意，可以把你现在的具体状态告诉我一句，比如：

- “我现在在电脑 A，本地项目路径是 D:\xxx\xxx，已经装好 git 和 VS Code”
- “我已经在 GitHub 上建了一个空仓库 / 还没建仓库”

我就可以直接给你一份**完全贴合你当前情况**的命令清单（不用思考，直接复制粘贴到终端就能完成上传 / 拉取）。如果你中间遇到什么报错，把报错复制给我，我帮你逐条拆。



先把核心区别说清楚，再给你一份可以直接照抄的“日常操作小抄”。

------

## 一、`git clone` 和 `git pull` 到底啥区别？

可以把 **GitHub 仓库** 想象成“云端总仓库”，你本地每一个项目文件夹就是“一家分店”。

### 1. `git clone`：开新分店 🏪

- 用途：**第一次在某个地方把仓库搬下来**。
- 会做的事情（自动帮你干四件事）：
  1. 在当前目录里新建一个文件夹（比如 `gejiao/`）
  2. 在里面建好 `.git`，初始化本地仓库
  3. 把 GitHub 上的所有提交历史拉下来
  4. 设置好远端 `origin`，并把 `main`（或 `master`）设为跟踪分支

命令例子：

```bash
cd D:\
git clone https://github.com/wuzongliang/gejiao.git
cd gejiao
```

> 结论：**一台新电脑 / 一个新的路径想要第一次拿到代码，应该用 `git clone`，而不是 `git pull`。**

------

### 2. `git pull`：同步更新 📥

- 用途：**在已经存在的本地仓库里，从远端拉最新的变化下来并合并进当前分支。**
- 前提条件：
  - 当前目录已经是一个仓库（有 `.git`）
  - 已经设置好了远端 `origin`
  - 当前分支知道自己对应远端哪个分支（上次 `git clone` 或 `git push -u` 已经弄好了）

命令例子（在项目目录里）：

```bash
cd D:\gejiao
git pull           # 从 origin/main 拉最新代码并合并
```

可以理解为：

> `git pull = git fetch + git merge`（帮你一步到位）

------

### 3. 一句话总结给你背

- **新地方第一次拿仓库 → 用 `git clone`**
- **已经有这个仓库了，只是想更新 → 用 `git pull`**

你之前在空目录 `git init` 再 `git pull`，就相当于：
 开了个“空分店”，却没告诉它总仓库在哪儿，它当然懵。

------

## 二、给你一份「常用操作指南」小抄

我按“第一次建立仓库 / 新电脑拉取 / 日常开发”三块给你。

------

### 场景 1：第一次把本地项目推到 GitHub（在 A 电脑）

> 前提：你已经在 GitHub 上创建好了一个空仓库，比如 `gejiao`。

在你的项目目录里（比如 `D:\gejiao`）：

```bash
cd D:\gejiao

# 1. 初始化本地仓库（只在第一次建仓库的时候需要）
git init

# 2. 把所有文件加入暂存区
git add .

# 3. 提交一次
git commit -m "初始化项目"

# 4. 关联远端仓库（把 origin 指向 GitHub 上那个地址）
git remote add origin https://github.com/wuzongliang/gejiao.git

# 5. 把本地 main 分支推上去，并建立跟踪关系
git branch -M main          # 把当前分支改名为 main（如果还不是的话）
git push -u origin main
```

之后这台 A 电脑上就不用再 `init` / `remote add` 了。

------

### 场景 2：在 B 电脑上拉代码开始干活（标准姿势）

> 正确做法：**永远先 `git clone`，不要手贱 `git init`。**

```bash
cd D:\           # 选一个你想放项目的地方
git clone https://github.com/wuzongliang/gejiao.git

cd gejiao        # 进入项目
```

此时已经自动帮你配置好：

- 远端：`origin -> 你的 GitHub 仓库`
- 当前分支：`main`，并跟踪 `origin/main`

以后在 B 电脑上日常只需要：

```bash
git pull   # 拉最新
git push   # 推上去
```

------

### 场景 3：日常开发最常用的那几条命令

#### 1. 查看当前状态

```bash
git status
```

能告诉你：

- 当前在哪个分支
- 哪些文件改了 / 哪些已暂存 / 哪些没跟踪

------

#### 2. 更新远端最新代码到本地

```bash
git pull
```

推荐习惯：**每天写代码前先来一发 `git pull`**，避免你改的是旧版本。

------

#### 3. 把修改提交到本地仓库

```bash
# 1）看看改了啥
git status

# 2）把想要提交的文件加到暂存区
git add 文件名
# 或者全加：
git add .

# 3）提交
git commit -m "描述一下你做了什么，比如：实现crc校验 & 修复串口bug"
```

------

#### 4. 把本地提交推到 GitHub

```bash
git push
```

如果是第一次推这个分支，可能会提示你用：

```bash
git push -u origin main
```

带 `-u` 的好处是：以后你在这个分支上就可以直接 `git push`，不用每次写远端和分支名。

------

#### 5. 查看当前分支 / 新建分支（简单版）

```bash
# 查看所有本地分支
git branch

# 新建并切换到新分支，比如 feature/d180-crc
git checkout -b feature/d180-crc

# 回到 main 分支
git checkout main
```

**简单用法建议：**
 你可以先不玩分支，所有东西先在 `main` 上搞，等熟悉了再慢慢用分支开发。

------

### 场景 4：偶尔用得到的检查命令

```bash
# 看远端列表
git remote -v

# 看最近的提交记录
git log --oneline

# 看具体文件改了什么
git diff              # 看工作区 vs 暂存区/HEAD 的区别
git diff --staged     # 看已经 add 的内容会提交什么
```

------

## 三、给你一个「最小日常工作流」模板

你可以把下面这几步当成“标准流程”，不想记太多就记这个：

### 新电脑 / 新目录：

```bash
git clone <GitHub地址>
cd <仓库名>
```

### 每天写代码时：

```bash
git pull            # 先拉别人/自己之前的最新代码

# ... 修改代码 ...

git status          # 看看改了哪些
git add .           # 全部加入暂存区（熟练后再精细控制）
git commit -m "说明你干了啥"
git push            # 推到 GitHub
```

------

如果你愿意，下一步你可以告诉我：
 你现在 A 电脑的项目路径、GitHub 仓库地址、B 电脑上打算放在哪个路径，我可以给你写一段 **完全针对你项目的“从零到完整同步”的命令清单**，照着打一遍就行。



# 我现在已经为这个项目建好仓库了，也有了几次提交，现在我想看看提交记录，或者恢复到某次提交时候的镜像，怎么做？



很好，这一步已经到“玩 Git 的好玩部分”了 😄

你现在想做两件事：

1. 看历史提交记录
2. 让当前代码“回到某一次提交时的样子”

我分成三种“力度”来讲：**只看**、**临时切回去看看**、**真的把项目回退到某次提交**。

------

## 一、查看提交记录（认人）

在项目目录里（VS Code 终端 / PowerShell 都行）：

```bash
git log
```

会看到类似：

```text
commit a1b2c3d4e5f6...
Author: xxx
Date:   2025-12-05 ...

    第三次提交：修复 CRC 计算

commit 7890abcd1234...
Author: xxx
Date:   2025-12-04 ...

    第二次提交：添加串口发送

commit 1122aabbccdd...
Author: xxx
Date:   2025-12-03 ...

    第一次提交：初始化工程
```

### 更简洁一点的查看方式（推荐你用这个）：

```bash
git log --oneline
```

例子：

```text
a1b2c3d 修复 CRC 计算
7890abc 添加串口发送
1122aab 初始化工程
```

- 前面那一串 `a1b2c3d` 就是 **commit id（哈希）**，后面是你写的 `-m` 描述。
- 之后我们说“回到某次提交”，就是用这个哈希。

再高级一点的（可以先记住，有兴趣再玩）：

```bash
git log --oneline --graph --decorate
```

能看到分支小树状结构。

------

## 二、临时“穿越回去看一眼”某次提交（不改历史）

> 适合：**我就想看当时代码是啥样，不一定要真的回退。**

1. 用 `git log --oneline` 找到目标提交的哈希，比如：

   ```text
   a1b2c3d 修复 CRC 计算
   7890abc 添加串口发送
   1122aab 初始化工程
   ```

   假设你想看看 `7890abc` 的那一版。

2. 临时切到这次提交（使用“分离头指针”模式）：

   ```bash
   git switch --detach 7890abc
   # 老一点的 Git 版本可以用：
   # git checkout 7890abc
   ```

   此时你的工作区文件会完全变成当时的样子，你可以随便打开看。

3. 看完以后，切回正常分支（比如 `main`）：

   ```bash
   git switch main
   # 或 git checkout main
   ```

> 这种操作是 **安全的**，不会动历史记录，只是“时光回放”。

------

## 三、真的把项目“回退”到某次提交

这里要先问自己一句：**这些后面的提交是不是已经 push 到 GitHub 给别人用了？**

- 如果 **只你自己在用 / 还没 push**，可以用“硬核回退”。
- 如果 **已经 push 到 GitHub**，更推荐用 `revert`，而不是 `reset --hard`。

我两种都给你，你自己选。

------

### 方案 A：重写历史（`git reset --hard`）

> 适合：**你后面几次提交都不想要了，直接当没发生过。**

1. 用 `git log --oneline` 找到你想“停住”的那次提交，比如：

   ```text
   a1b2c3d 修复 CRC 计算
   7890abc 添加串口发送   ← 想回到这一版
   1122aab 初始化工程
   ```

2. 让当前分支强行指向它，并把工作区文件也改成那时的样子：

   ```bash
   git reset --hard 7890abc
   ```

   执行完之后：

   - 当前分支（比如 `main`）就停在 `7890abc` 上
   - `a1b2c3d` 那个提交在当前分支历史里就“消失”了

3. 如果你之前已经把那些“多出来的提交”推到 GitHub 了，并且你 **确认只有你自己用这个仓库**，可以强推上去让远端也回退：

   ```bash
   git push -f origin main
   ```

⚠️ 注意：

- `reset --hard + push -f` 会改远端历史，如果有别人基于你之前的提交开发，会很痛苦。
- 自己玩的小仓库没问题，大项目就要谨慎了。

------

### 方案 B：保留历史，用“反向提交”（`git revert`，更安全）

> 适合：**已经 push 上去了，也可能有别人用；不想篡改历史，只是想让代码回到某个状态。**

`git revert` 的意思是：
 **“生成一个新的提交，用来抵消某次提交的修改”。**

假设你 commit 记录是：

```text
a1b2c3d 修复 CRC 计算   ← 最新
7890abc 添加串口发送
1122aab 初始化工程
```

你觉得 `a1b2c3d` 这次修复反而搞坏了东西，想撤销它：

```bash
git revert a1b2c3d
```

Git 会自动生成一个新的提交，比如：

```text
e5f6g7h Revert "修复 CRC 计算"
a1b2c3d 修复 CRC 计算
7890abc 添加串口发送
1122aab 初始化工程
```

- 好处：整个历史是“完整可追踪”的，任何人都能看到你先改错了又撤回。
- 适合已经 push 上去的情况。

你也可以对一段区间 revert（之后你熟悉了可以再玩）。

------

## 四、你可以这样先练一练（不怕搞坏）

1. 在你当前项目里运行：

   ```bash
   git log --oneline
   ```

2. 把输出复制给我，我可以帮你一起分析：

   - 哪几次是“可以回去看看的”
   - 哪几次是“你可能不想要的提交”

3. 如果你只是想 **看一下某次提交时的完整代码**，我建议你先用最安全那套：

   ```bash
   git log --oneline           # 找到哈希
   git switch --detach <hash>  # 回到那次提交
   # ...随便看...
   git switch main             # 回来
   ```

等你确认 “嗯，我就要回到某次提交，后面都不要了”，再上 `git reset --hard`，我可以帮你写一条完全对你仓库量身定制的命令。

