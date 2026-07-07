# Better Coffee ☕

精品咖啡冲煮记录 Web App — TRAE 比赛 Demo 作品

为精品咖啡爱好者打造的冲煮记录与 AI 推荐应用。手机端优先，三容器 Docker 架构。

## 功能亮点

- 🏠 **首页**：AI 推荐今日该喝的豆子（基于养豆状态）、养豆分析、最近冲煮
- 🫘 **豆子管理**：记录烘焙日期/烘焙度，自动计算养豆状态（浅烘 7-14 天 / 中烘 5-10 天 / 深烘 3-7 天）
- ☕ **冲煮记录**：手冲/意式参数表单、星级评分、风味标签、AI 推荐下次冲煮参数
- 📋 **冲煮历史**：详情查看、复用参数、标记最爱
- ⚙️ **设置**：AI 服务商配置（DeepSeek / 通义千问 / OpenAI）

## 一键启动（Docker）

需要 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

```bash
git clone https://github.com/dhsdyd/Better-Coffee.git
cd Better-Coffee
docker compose up -d --build
```

启动后访问 http://localhost:8080 即可使用。

**默认开启 Demo 模式**：自动播种 4 支示例豆子和 4 条冲煮记录，AI 推荐返回模拟数据，评委无需配置 API Key 即可体验完整流程。

## 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  frontend       │     │  backend         │     │  mongo          │
│  Vue 3 + nginx  │ ←→  │  Express API    │ ←→  │  MongoDB 7      │
│  :8080 → :80    │     │  :3000 (内部)    │     │  :27017         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │
       │ /api/* 反向代理到 backend
       │ /  静态文件
```

- **frontend**：Vue 3 + Vite 打包静态文件，nginx 托管并反代 /api/*
- **backend**：Node.js + Express + Mongoose，RESTful API
- **mongo**：MongoDB 7，数据持久化到 docker volume

## Demo 模式

环境变量 DEMO_MODE=true 时：
1. 启动时自动播种示例数据（4 支豆子 + 4 条冲煮记录）
2. AI 推荐接口在未配置 API Key 时返回预设的模拟推荐结果

评委无需申请 API Key 即可体验完整流程。配置真实 Key 后自动切换为真实 AI 调用。

## NAS 反向代理（外网访问）

推荐用 [Lucky](https://github.com/gdy666/lucky) 做外层反向代理：

```
外网用户 → Lucky (HTTPS + 域名 + 自动 SSL 证书) → NAS_IP:8080 (Docker nginx)
```

Lucky 配置：
1. 添加反向代理规则，后端地址填 http://NAS_IP:8080
2. 启用 HTTPS，Lucky 自动申请 Let's Encrypt 证书
3. 配置 DDNS（如需要动态域名）

## 云部署（免费档）

详见 [docs/deploy-cloud.md](docs/deploy-cloud.md)。简要步骤：
- 前端部署到 Vercel
- 后端部署到 Render
- 数据库用 MongoDB Atlas 免费档（512MB）

## 本地开发

```bash
# 1. 启动 MongoDB
docker run -d --name mongo -p 27017:27017 mongo:7

# 2. 启动后端
cd backend && npm install && npm run dev  # http://localhost:3000

# 3. 启动前端
cd frontend && npm install && npm run dev  # http://localhost:5173
```

## 使用流程

1. 打开 App，进入「设置」配置 AI 服务商（推荐 DeepSeek，便宜效果好）
2. 「豆子」tab 添加咖啡豆
3. 「冲煮」tab 记录每次冲煮，可点 AI 推荐获取下次建议
4. 首页「今日推荐」让 AI 根据养豆状态推荐当日该喝哪款豆

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + Vue Router + Axios |
| UI | 移动优先响应式 CSS（无 UI 框架，纯手写） |
| 后端 | Node.js + Express + Mongoose |
| 数据库 | MongoDB 7（社区版，免费开源） |
| AI | DeepSeek / 通义千问 / OpenAI（兼容 OpenAI API 格式） |
| 容器 | Docker + docker-compose |
| 云部署 | Vercel + Render + MongoDB Atlas（全免费档） |

## 项目结构

```
.
├── docker-compose.yml       # 3 容器编排
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── views/          # 5 个页面
│   │   ├── components/     # 4 个组件
│   │   ├── api/            # API 封装
│   │   ├── utils/          # 格式化、养豆状态计算
│   │   └── constants/      # 产地/品种/处理法等常量
│   ├── Dockerfile          # 多阶段构建 → nginx
│   └── nginx.conf          # 静态托管 + /api 反代
├── backend/                 # Express 后端
│   ├── src/
│   │   ├── routes/         # /api/beans, /api/brewings, /api/settings, /api/ai
│   │   ├── models/         # Mongoose schema
│   │   ├── services/ai/    # AI 调用（原生 https，无外部依赖）+ demo-data
│   │   ├── seed.js         # 种子数据播种
│   │   └── server.js
│   └── Dockerfile
├── docs/
│   ├── deploy-cloud.md     # 云部署详细步骤
│   └── demo-post.md        # Demo 作品帖草稿
└── README.md
```

## License

MIT
