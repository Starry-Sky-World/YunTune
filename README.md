# 云听（YunTune）

一个可部署到 Vercel 的 Web 音乐客户端（Next.js App Router + TypeScript + Tailwind + PWA）。

## 环境变量

优先使用 `config.json`（仓库根目录，优先级高于环境变量）；没有配置项时再回退到 `.env.local` / Vercel 环境变量。

复制 `config.example.json` 为 `config.json`（建议不要提交真实密钥；已在 `.gitignore` 忽略）：

```bash
cp config.example.json config.json
```

也可以使用交互式命令生成/更新 `config.json`：

```bash
npm run config
```

或使用环境变量：复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

并填写：

- `NETEASE_API_BASE_URL=https://YOUR_NETEASE_API_DOMAIN`（自建 NeteaseMusicAPI base）
- `SESSION_SECRET=长随机字符串`（用于加密本站 HttpOnly 会话 Cookie）
- `NEXT_PUBLIC_APP_NAME=YunTune`

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 构建验证

```bash
npm run build
npm run start
```

可选（CI/本地更严格）：`npm run typecheck`。

## 部署到 Vercel

1. 将仓库导入 Vercel（Framework: Next.js）。
2. 在 Vercel 项目设置里添加上述 3 个环境变量。
3. 部署完成后，确保站点使用 HTTPS（生产环境 Cookie 会自动设置 `Secure`）。

## 安全设计（要点）

- 前端不会直连 `NETEASE_API_BASE_URL`，所有请求走本站 `/api/*` BFF。
- 网易 Cookie 不会明文暴露给前端 JS：仅在服务端保存到加密后的 HttpOnly Cookie（`__Host-yuntune_s1/s2...`）。
- 会话 Cookie 自动按体积分片（最多 10 片）；服务端会自动拼装、解密并注入上游请求头。
