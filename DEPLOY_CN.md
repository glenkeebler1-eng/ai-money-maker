# 国内部署说明

这个项目已经补齐了自托管所需的 Docker、Nginx 和生产环境配置，适合部署到阿里云、腾讯云、华为云等 Linux 服务器。

## 推荐路径

### 路线 A：先用中国香港服务器上线

适合先把站点跑起来，优点是不用 ICP 备案，步骤最短。

- 服务器建议：2C2G、Ubuntu 22.04
- 域名：任意已实名域名
- 部署方式：Docker + Nginx + HTTPS
- 注意：项目里的 Supabase、OpenRouter、Stripe 都是海外服务，这条路线兼容性最好

### 路线 B：部署到中国大陆服务器

适合追求大陆访问速度，但前置条件更多。

- 域名需要实名
- 站点上公网前通常需要 ICP 备案
- 如果启用微信/支付宝支付，回调地址必须是公网 HTTPS 域名
- 如果继续使用 Supabase、OpenRouter、Stripe，仍然属于跨境依赖，稳定性取决于网络环境

如果你主要做中文用户，建议保留虎皮椒支付，并评估把 AI 和数据库逐步替换成国内可达服务。

## 需要准备的东西

- 一台 Ubuntu 22.04 服务器
- 一个域名，并把 `A` 记录指向服务器公网 IP
- 一份生产环境变量文件 `.env.production`
- Supabase 项目和数据库表
- OpenRouter API Key
- Stripe 配置（可选）
- 虎皮椒应用和回调地址

## 环境变量

先复制：

```bash
cp .env.example .env.production
```

重点修改这些值：

- `NEXT_PUBLIC_APP_URL=https://你的域名`
- `SERVER_ACTIONS_ALLOWED_ORIGINS=你的域名,www.你的域名`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`
- `XUNHUPAY_APP_ID`
- `XUNHUPAY_APP_SECRET`

## 首次服务器部署

### 1. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

重新登录后确认：

```bash
docker --version
docker compose version
```

### 2. 上传代码

可以用 `git clone`，也可以把现有仓库推到 GitHub 后在服务器拉取。

```bash
git clone <your-repo-url>
cd ai-money-maker
```

### 3. 放置生产环境文件

```bash
cp .env.example .env.production
vim .env.production
```

### 4. 启动应用容器

```bash
cp deploy/docker-compose.yml.example deploy/docker-compose.yml
docker compose -f deploy/docker-compose.yml up -d --build
```

应用会监听 `127.0.0.1:3000`。

### 5. 配置 Nginx

把 [deploy/nginx.ai-money-maker.conf.example](/Users/zizi/code/ai-money-maker/deploy/nginx.ai-money-maker.conf.example) 复制到服务器的 Nginx 配置目录，替换成你的域名和证书路径后启用。

### 6. 申请 HTTPS 证书

如果服务器能直接访问公网，可以用 Certbot：

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 7. 验证站点

检查这几个地址：

- `https://你的域名/api/health`
- `https://你的域名/zh`
- `https://你的域名/en`

## 第三方平台需要同步修改

### Supabase

- Authentication -> URL Configuration
- Site URL：`https://你的域名`
- Redirect URLs：
  - `https://你的域名/auth/callback`

### Stripe

- Webhook URL：`https://你的域名/api/stripe/webhook`
- 监听事件：
  - `checkout.session.completed`
  - `customer.subscription.deleted`

### 虎皮椒

- 支付回调地址：`https://你的域名/api/xunhupay/callback`
- 当前代码按 V3 文档生成 `hash`，并要求回调返回 `success`

## 更新发布

```bash
git pull
docker compose -f deploy/docker-compose.yml up -d --build
```

## 常见问题

### 1. 登录后跳不回站点

优先检查：

- `NEXT_PUBLIC_APP_URL`
- Supabase 的 `Site URL`
- Supabase 的 `Redirect URLs`

### 2. 付款成功但会员没到账

优先检查：

- Stripe webhook 是否收到事件
- 虎皮椒回调地址是否可公网访问
- `.env.production` 里的密钥是否和线上应用一致

### 3. 大陆服务器访问慢

这是当前架构的已知风险，因为它依赖海外服务：

- Supabase
- OpenRouter
- Stripe

如果你决定长期做大陆站，下一步应该是把 AI 和数据库链路逐步做“国内可达”替换。
