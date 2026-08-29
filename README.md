# Sonic Topography

**中文** | [English](./README.en.md) | [日本語](./README_ja.md)

[下载最新版 Release](https://github.com/yin-yizhen/sonic-topography/releases/tag/1.1.1) | [Windows 版](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-Setup.exe) | [macOS Apple 芯片版](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-mac-arm64.dmg) | [macOS Intel 芯片版](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-mac-x64.dmg)

Sonic Topography 是一个桌面音乐播放器和 3D 音乐可视化应用。它会把音乐里的低频、中频、高频转换成会起伏、发光、闪烁的立体地形，让听歌变成一块正在呼吸的声音地图。

> 使用限制：本项目仅供学习、研究和个人非商业体验使用。未经作者明确许可，不得用于商业项目、商业演出、商业展示、付费服务、二次销售或任何营利用途。

![Sonic Topography 桌面端主界面](./public/screenshots/desktop-visualizer.png)

## 主要功能

- 桌面应用端：基于 Electron，打开后就是独立窗口，不需要一直挂着浏览器页面。
- 3D 音乐地形：音乐频段会驱动地面柱体、光效、涟漪、流星和歌词显示。
- 本地音乐播放：支持上传本地音频，也可以搭配 `.lrc` 歌词文件。
- 内置 Demo：第一次打开不用准备音乐，也能直接看到可视化效果。
- 网易云音乐：支持在桌面端打开官方登录窗口，扫码后读取本机 Cookie，用于搜索、歌单、每日推荐和播放。
- QQ 音乐：支持在桌面端打开官方登录窗口，扫码后读取 QQ 音乐 Cookie，用于搜索、播放和歌词。
- 本地歌单：可以把喜欢的歌曲保存到本地歌单。
- 更人性化的地面 EQ：用 8 个频段推子分别控制不同声音对地形的影响。
- 时间显示和番茄钟：可以把视觉画面切换成更适合专注、工作和休息的显示方式。
- 预设迁移：支持导入、导出歌单、特效、地面 EQ、自定义主题和浏览器设置。

## OS 版本

- Windows：下载 [SonicTopography-1.1.1-Setup.exe](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-Setup.exe)。
- macOS Apple 芯片：下载 [SonicTopography-1.1.1-mac-arm64.dmg](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-mac-arm64.dmg)，适用于 M1/M2/M3/M4 等 Apple 芯片。
- macOS Intel 芯片：下载 [SonicTopography-1.1.1-mac-x64.dmg](https://github.com/yin-yizhen/sonic-topography/releases/download/1.1.1/SonicTopography-1.1.1-mac-x64.dmg)，适用于 Intel 芯片 Mac。
- macOS DMG 是独立应用，已内置运行环境；新电脑不需要安装 Python、Node 或项目依赖。
- macOS 第一次打开时，先打开 DMG，把 `Sonic Topography.app` 拖到 `Applications` 后再运行。
- 第一次使用麦克风功能时，macOS 会弹出系统麦克风权限确认，请选择允许。

## 快速开始

如果你只是使用应用：

1. 下载并安装 Windows 安装包。
2. 打开 `Sonic Topography`。
3. 点击左上角 `AJIN.` 打开侧边栏。
4. 可以先点 `示例` 播放内置 Demo，确认画面和声音正常。
5. 想播放自己的音乐时，点击 `上传` 选择本地音频文件。
6. 想使用网易云或 QQ 音乐时，进入 `设置 -> 账号登录`，按提示打开官方窗口扫码登录。

## 界面入口

点击左上角 `AJIN.` 可以打开侧边栏。

- `可视化`：关闭面板，回到 3D 音乐地形画面。
- `设置`：打开可视化、地面 EQ、主题、账号登录和显示相关设置。
- `搜索`：搜索网易云音乐和 QQ 音乐。
- `网易云`：保存有效网易云 Cookie 后出现，可进入喜欢、歌单和每日推荐。
- `歌单`：打开本地保存的歌单。
- `示例`：播放内置 Demo。
- `上传`：选择本地音频或 `.lrc` 歌词。
- `全屏`：进入或退出全屏显示。

## 地面 EQ

地面 EQ 用来控制音乐的不同频段如何影响 3D 地形。它不是传统意义上只改变声音的均衡器，而是一个面向视觉效果的“地面特效混音台”。

![更人性化的自定义地面 EQ](./public/screenshots/ground-eq.png)

每个推子对应一种视觉性格：

- `SUB BASS / 中心抬升`：让低频更集中地推动地面中心。
- `BASS / 低频重量`：控制低频带来的厚重感。
- `LOW MID / 慢波流动`：让地形出现更缓慢的波动。
- `MID / 方向流`：控制中频带来的方向性起伏。
- `HIGH MID / 尖峰`：让节奏和亮点更容易形成凸起。
- `PRESENCE / 闪光触发`：控制局部闪光和高亮。
- `BRILLIANCE / 边缘微闪`：增强细碎、轻盈的边缘闪烁。
- `AIR / 空气颗粒`：控制更高频、更轻的颗粒感。

上方的 `起伏速度` 会影响地形升起和回落的速度。数值越高，地面越敏捷；数值越低，视觉会更柔和。

## 时间显示和番茄钟

Sonic Topography 也可以作为桌面专注背景使用。开启时间显示后，画面会在 3D 地形上叠加大号时间；配合番茄钟，可以用于工作、学习、阅读或休息计时。

![时间显示和番茄钟](./public/screenshots/focus-clock.png)

推荐用法：

1. 播放一首适合专注的音乐或环境音。
2. 打开时间显示。
3. 按自己的节奏启动番茄钟。
4. 进入全屏，让它成为一个轻量的专注桌面。

## 账号登录

打开 `设置 -> 账号登录`，选择 `网易云` 或 `QQ 音乐`。

在 Electron 桌面版里，点击 `打开官方窗口扫码` 会弹出官方网页登录窗口。扫码成功后，应用会自动读取当前登录窗口的 Cookie，并同步到本地代理服务。

在普通浏览器开发页面里，扫码登录不可用；手动 Cookie 文本框只作为降级调试入口。

Cookie 是敏感登录凭据，只保存在本机。不要导出、上传或分享自己的 Cookie。

## 预设导入导出

在设置中可以导入或导出预设。预设适合在不同电脑之间迁移自己的视觉习惯。

可以迁移的内容包括：

- 歌单
- 脉冲特效
- 流星特效
- 地面 EQ
- 自定义主题
- 浏览器设置

导出时可以选择是否包含 Cookie。一般不建议包含 Cookie，除非你非常清楚自己在做什么，并且只在自己的设备之间迁移。

## 本地数据

- 主题、特效、地面 EQ、账号 Cookie 和多数设置保存在浏览器 localStorage。
- 本地歌单保存在浏览器 localStorage（key `sonic-topography-playlists-v1`），不依赖任何后端。
- 上传的真实音频文件不会写入预设文件，也不会被打包。

## 网页版静态部署

Sonic Topography 可以构建成纯静态网页，部署到任意支持静态文件托管的平台（GitHub Pages、Cloudflare Pages/Workers、EdgeOne、Vercel、对象存储 + Nginx 等），**无需后端服务器**。

### 构建

```powershell
npm install
npm run build
```

构建产物在 `dist/`，所有资源使用相对路径（`base: './'`），可直接放到站点根目录或子目录。

### 配置 Meting 接口

网页版默认使用 **Meting API**（初叶 Meting 实现：`/?server=&type=&id=`，Base 路径为 `/api`，例如 `https://meting.yufish.cn/api`）来搜索、播放和获取歌词，不再依赖网易云 / QQ 的 Cookie 代理。接口地址有三种配置方式，按优先级生效：

1. **运行时填写**：打开 `设置 → 账号登录 → Meting 接口`，在界面里填好地址并保存（存到浏览器 localStorage，便于临时切换）。
2. **站点配置文件**：部署时在 `meting-config.json` 里写入 `"base": "https://你的-meting-地址/api"`。该文件随站点一起发布，是推荐的固定配置方式（仓库已内置 `https://meting.yufish.cn/api`）。
3. **构建变量**：构建前设置环境变量 `VITE_METING_API=https://你的-meting-地址/api`。

另外，也可以在页面加载脚本前注入全局变量（适合网关 / 反代统一注入）：

```html
<script>window.__SONIC_METING_API__ = 'https://你的-meting-地址';</script>
```

### 本地歌单与设置

静态网页版没有后端，本地歌单、设置等全部保存在浏览器 localStorage，不会上传到服务器。`dist/`、`release/`、`.workbuddy/` 等目录均已被 `.gitignore` 忽略，请不要把账号 Cookie 或记忆文件提交进仓库。

### 部署注意事项

- 部署到子目录时，只要托管服务能正确返回 `dist/` 下的 `index.html` 及其相对资源即可；`meting-config.json` 需放在站点根（与 `index.html` 同级）。
- 跨域（CORS）：你自建的 Meting API 需要在**所有响应（含 `type=url` 的 302 跳转）**上返回 `Access-Control-Allow-Origin`，否则浏览器会拦截搜索 / 歌词调用，且音频元素因 `crossOrigin="anonymous"` 无法被 Web Audio 可视化分析。
- 该 Meting 实例的 `type=url` 对 **netease 普遍返回 404**（服务端 netease 解析异常），播放默认音源已设为 **tencent**；如需 netease 播放，请先修复服务端的 netease 解析模块（通常需要正确的 Cookie / API 令牌）。
- 该实例**不支持 `br` 码率参数**（带 `br` 会 404），播放链接不附带码率。

### EdgeOne Makers 反代（可选）

如果在网页版需要使用网易云 / QQ 音乐的 `/sonic/*` 反代能力（搜索 / 播放 / 歌词 / 歌单），需要在 EdgeOne Makers 部署一个代理服务（边缘函数按项目分目录组织，详见下方结构），并在前端 `设置 → 账号登录 → API 代理` 里填写代理地址（如 `https://proxy-api.x1anyu.cn`），或构建时设置 `VITE_API_PROXY` 环境变量。

EdgeOne Makers 代理按项目分目录组织，结构如下：

```
edgeone/                      # 独立 EdgeOne Makers 项目（不在本仓库内）
  edge-functions/
    sonic/          # Sonic Topography 代理（网易云 / QQ 音乐），路由 /sonic/*
      [[default]].js
    qq-lyric/       # Meting 歌词代理（@meting/core LYRIC_PROXY），路由 /lyric/*
      [[default]].js
```

EdgeOne Makers 代理配置步骤：

1. 在 EO 控制台新建一个 EdgeOne Makers 项目。
2. 创建 `sonic/[[default]].js` 边缘函数（catch-all 路由，按 pathname `/sonic/netease/*`、`/sonic/qq/*` 分发）。
3. 发布项目，获得一个 `.edgeone.app` 域名（如 `https://sonic-proxy.edgeone.app`）。
4. 在前端设置面板填入该域名，或设置 `VITE_API_PROXY=https://sonic-proxy.edgeone.app`。

前端 `/sonic/netease/*` 和 `/sonic/qq/*` 调用会自动转发到代理地址，代理再将请求转发到网易云 / QQ 上游。Cookie 通过请求头 `X-Netease-Cookie` / `X-QQ-Music-Cookie` 传递，用户在 `设置 → 账号登录` 网页端手填 / 粘贴 cookie 即可（无需弹窗登录）。

### 桌面端功能差异

- 网页端**不支持**网易云 / QQ 应用内登录窗口（Electron-only，需网页端手动填 cookie）。
- 网页端**不支持**应用内自动更新（Electron-only）。
- 网页端**不支持**自定义窗口控制栏（最小化 / 最大化 / 关闭 / 拖拽），由浏览器标题栏接管。
- 网页端不支持网易云 / QQ 音乐音源后端（除非部署上述 EdgeOne Makers 代理）。
- 网页端不支持系统音频采集（麦克风 / 系统环回），只支持本地文件上传播放。
- 本地歌单已改为浏览器 localStorage（`sonic-topography-playlists-v1`），不再依赖 `/api/playlists` 后端。

## 开发运行

安装依赖：

```powershell
npm install
```

日常开发建议使用 Electron 模式：

```powershell
npm run dev:electron
```

这个命令会启动 Vite dev server，然后打开 Electron 窗口。修改 `src/`、CSS、React 组件和设置页 UI 时，一般会热更新。

如果只想在浏览器里调 UI：

```powershell
npm run dev
```

浏览器地址：

```text
http://127.0.0.1:3000
```

修改这些内容后通常需要重启 Electron：

- `desktop/main.js`
- `desktop/preload.cjs`
- Electron 打包配置、窗口行为、IPC 登录桥接
- 本地服务和代理相关代码

## 打包

发布前运行：

```powershell
npm run build:electron
```

生成的 Windows 安装包位于：

```text
release/
```

如果只想生成可运行目录、不生成安装器：

```powershell
npm run build:electron:dir
```

## 常用命令

```powershell
npm run dev:electron
npm run lint
npm run build
npm run build:electron:dir
npm run build:electron
```

## 注意事项

- 网易云和 QQ 音乐播放结果可能受版权、会员、地区和账号状态影响。
- 搜索结果只会展示当前匿名状态或当前 Cookie 权限下可访问的内容。
- 不要提交 `dist/`、`release/`、本地 `data/`、更新下载目录或账号 Cookie。
- 如果遇到音乐能搜到但不能播，优先检查账号状态、歌曲版权和当前音质是否可用。

## 请作者喝杯咖啡

如果你觉得 Sonic Topography 还不错，或者它刚好陪你完成了一段工作、学习或创作，可以请作者喝杯咖啡。

全部收益都会用于购买 token 和相关服务，继续优化应用、修 bug、做新功能和改善体验。

![请作者喝杯咖啡](./public/screenshots/coffee-qr.png)

感谢每一次支持。这个项目会继续慢慢长大。
