# 云部署指南（全免费档）

Better Coffee 支持全免费云端部署，使用 Vercel + Render + MongoDB Atlas 三件套。

## 整体架构

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │   Backend    │    │  Database    │
│  Vue 3 + Vite│←→ │ Express API  │←→  │ MongoDB 7   │
│  Mobile-first│    │ Mongoose ODM │    │  Atlas      │
└──────────────┘    └──────────────┘    └──────────────┘
       ↑                    ↑
       │                    │
   Vercel              Render
   (免费)              (免费)
```

---

## Part 1: MongoDB Atlas（数据库）

### 1. 注册账号

访问 https://www.mongodb.com/cloud/atlas/register 注册免费账号（可用 Google 登录）。

### 2. 创建免费集群

- 选择 **Free** 套餐（M0，512MB 存储）
- Cloud Provider 选 **AWS**
- Region 选最近的（亚洲用户选 `ap-southeast-1` 新加坡）
- Cluster Name 填 `better-coffee`
- 点击 Create Cluster（创建大约需要 1-3 分钟）

### 3. 创建数据库用户

- 左侧菜单 → **Database Access** → **Add New Database User**
- Username: `bettercoffee`
- Password: 自己设置一个强密码并记下
- Database User Privileges: 选 `Read and write to any database`
- 点击 Add User

### 4. 网络访问配置

- 左侧菜单 → **Network Access** → **Add IP Address**
- 选择 **Allow Access from Anywhere**（IP 填 `0.0.0.0/0`）
- 点击 Confirm

> ⚠️ 生产环境建议只放行 Vercel 和 Render 的出口 IP，但免费档动态 IP 多，0.0.0.0/0 最方便。

### 5. 获取连接串

- 左侧菜单 → **Database** → 点击 **Connect**
- 选择 **Connect your application**
- Driver 选 **Node.js**，Version 选 `4.0 or later`
- 复制连接串，形如：
  ```
  mongodb+srv://bettercoffee:<password>@better-coffee.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- 把 `<password>` 替换为第 3 步设置的密码

---

## Part 2: Render（后端）

### 1. 注册并连接 GitHub

- 访问 https://render.com 注册（可用 GitHub 登录）
- 授权 Render 访问你的 GitHub 账号
- 确保仓库 `dhsdyd/Better-Coffee` 已推送到 GitHub

### 2. 创建 Web Service

- 控制台 → **New +** → **Web Service**
- 选择仓库 `dhsdyd/Better-Coffee`

### 3. 配置部署参数

| 项 | 值 |
|---|---|
| Name | `better-coffee-backend` |
| Region | `Singapore`（亚洲最近） |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node src/server.js` |
| Instance Type | Free |

### 4. 配置环境变量

在 **Environment** 标签添加：

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://bettercoffee:...@better-coffee.xxxxx.mongodb.net/?retryWrites=true&w=majority`（Part 1 获取的连接串） |
| `DEMO_MODE` | `true` |
| `CORS_ORIGIN` | `*`（或填你的 Vercel 域名，更安全） |
| `PORT` | `3000` |

### 5. 部署

- 点击 **Create Web Service**
- 等待构建完成（首次约 2-3 分钟）
- 部署成功后获得域名：`https://better-coffee-backend.onrender.com`
- 记下这个域名，Part 3 会用

### 6. 验证后端

浏览器访问 `https://better-coffee-backend.onrender.com/api/beans`，应返回 JSON 豆子列表（Demo 模式下应有 4 条种子数据）。

---

## Part 3: Vercel（前端）

### 1. 注册并导入项目

- 访问 https://vercel.com 注册（可用 GitHub 登录）
- 控制台 → **Add New** → **Project**
- 选择仓库 `dhsdyd/Better-Coffee` → **Import**

### 2. 配置构建参数

| 项 | 值 |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | `18.x` 或 `20.x` |

### 3. 修改 vercel.json

进入仓库 `frontend/vercel.json`，把 `destination` 改为你的 Render 后端域名：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://better-coffee-backend.onrender.com/api/$1"
    }
  ]
}
```

### 4. 配置环境变量

在 **Settings** → **Environment Variables**：

| Key | Value |
|---|---|
| `VITE_API_BASE` | （留空，用 vercel.json rewrite） |

### 5. 部署

- 点击 **Deploy**
- 等待构建完成（约 1-2 分钟）
- 部署成功后获得域名：`https://better-coffee-xxx.vercel.app`

---

## Part 4: 验证部署

### 验证步骤

1. **访问前端域名** `https://better-coffee-xxx.vercel.app`
   - 应看到首页（带 demo 数据：4 支豆子 + 养豆分析 + 最近冲煮）

2. **进入「冲煮」tab**
   - 填写参数后点击 **AI 推荐**
   - 应返回 Demo 模拟数据（包含推荐参数、调整说明、综合分析）

3. **进入「豆子」tab**
   - 应看到 4 支种子豆子，养豆状态正确显示

4. **进入「设置」tab**
   - 不配置 API Key 也能正常使用（Demo 模式）

### 常见问题排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 首页空白 | 后端未启动或 CORS_ORIGIN 错误 | 检查 Render 日志，CORS_ORIGIN 设为 `*` |
| AI 推荐返回 500 | 后端 DEMO_MODE 未开启 | Render 环境变量加 `DEMO_MODE=true` |
| 豆子列表为空 | MongoDB 未连通或 seed 未执行 | 检查 MONGODB_URI 是否正确替换 `<password>` |
| /api 请求 404 | vercel.json destination 未改 | 改为你的 Render 后端域名 |
| 首次访问慢 | Render 免费档休眠 | 等待 30 秒唤醒 |

---

## 注意事项

### Render 免费档限制
- **15 分钟无访问会休眠**，首次唤醒需约 30 秒
- 每月 750 小时实例时间（够单个服务常驻）
- 不支持持久化磁盘（数据存 MongoDB Atlas，不受影响）

### MongoDB Atlas 免费档限制
- **512MB 存储**（足够个人使用，约可存 10 万条冲煮记录）
- 不支持指定时间备份
- 单集群最多 100 个连接

### Vercel 免费档限制
- **100GB 流量/月**（个人项目绰绰有余）
- 构建时长 45 秒以内
- 函数执行时长 10 秒以内（本项目用 rewrite 不受影响）

### 成本预估
- 全部使用免费档：**0 元/月**
- 适合个人 Demo、小范围使用
- 流量上来后建议升级 Render 付费档（$7/月起）
