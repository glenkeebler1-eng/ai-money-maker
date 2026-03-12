# AI 赚钱案例库 | AI Money Maker

一个面向中英文用户的 AI 变现案例 SaaS 平台，支持 Stripe 国际支付和虎皮椒国内支付。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase (PostgreSQL + Auth)
- **国际支付**: Stripe
- **国内支付**: 虎皮椒 (xunhupay.com)
- **国际化**: next-intl (中文/英文)
- **样式**: Tailwind CSS v4
- **AI**: Google Gemini API

---

## 快速开始

### 1. 克隆 & 安装依赖

```bash
git clone <your-repo>
cd ai-money-maker
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

按照 `.env.example` 中的说明填入所有 API Keys。

### 3. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 创建新项目
2. 进入 **SQL Editor**，运行 `supabase/schema.sql` 中的所有 SQL
3. 在 **Authentication → Providers** 中启用 Google OAuth（可选）
4. 将 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` 填入 `.env.local`

### 4. 配置 Stripe（国际支付）

1. 注册 [stripe.com](https://stripe.com) 账号
2. 在 **Dashboard → Products** 创建两个订阅产品：
   - Pro 月付：$9.9/月
   - Pro 年付：$88/年
3. 将对应的 Price ID 填入 `.env.local`
4. 设置 Webhook：`https://你的域名/api/stripe/webhook`
   - 订阅事件：`checkout.session.completed`、`customer.subscription.deleted`

### 5. 配置虎皮椒（国内支付）

1. 注册 [xunhupay.com](https://www.xunhupay.com/) 账号（**个人开发者可用**，无需营业执照）
2. 创建应用，获取 `APP_ID` 和 `APP_SECRET`
3. 设置回调地址：`https://你的域名/api/xunhupay/callback`
4. 将配置填入 `.env.local`

### 6. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000（自动重定向到 /zh）

---

## 部署到 Vercel

### 方式一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. 将代码推送到 GitHub
2. 在 Vercel 导入仓库
3. 在 **Settings → Environment Variables** 中添加所有 `.env.example` 中的变量
4. 部署完成后，更新 `.env.local` 中的 `NEXT_PUBLIC_APP_URL` 为你的 Vercel 域名
5. 同时更新 Stripe webhook URL 和虎皮椒回调 URL

### 方式二：CLI 部署

```bash
npm install -g vercel
vercel --prod
```

---

## 项目结构

```
app/
├── [locale]/           # 中英文路由 (/zh, /en)
│   ├── page.tsx        # 主页（案例库 + AI生成器）
│   ├── pricing/        # 定价页面
│   ├── dashboard/      # 用户仪表盘
│   └── auth/           # 登录/注册
├── api/
│   ├── generate-idea/  # Gemini AI 接口（服务端，保护 API Key）
│   ├── stripe/         # Stripe 支付 + Webhook
│   └── xunhupay/       # 虎皮椒支付 + 回调
components/             # React 组件
messages/               # i18n 翻译文件 (zh.json, en.json)
supabase/schema.sql     # 数据库建表 SQL
```

---

## 功能说明

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 浏览案例摘要 | ✅ | ✅ |
| 案例深度解析 | 仅第1个 | ✅ 全部 |
| AI 变现方案生成 | 每天3次 | ✅ 无限 |
| 优先支持 | ❌ | ✅ |

---

## 定价

- **免费版**: 永久免费，基础功能
- **Pro 月付**: ¥68/月 或 $9.9/月
- **Pro 年付**: ¥588/年 或 $88/年（节省30%）
