# 🏨 易宿酒店预订平台 — 管理系统

> 面向商户与平台管理员的酒店信息管理、审核、发布一站式系统。  
> **前端** React 19 + Ant Design 6 · **后端** NestJS 11 + TypeORM · **实时通信** WebSocket + SSE

---

## ✨ 更适合面试展开的亮点

- **审核状态机和权限边界放在服务端**：`HotelsService` 收敛 `DRAFT → PENDING → APPROVED / REJECTED → OFFLINE`，并在后端同时校验角色、酒店所有权和“审核中不可编辑”，避免只靠前端守卫。
- **订单、库存与支付回调是一条一致性链路**：`createOrder` 在事务中完成“预占库存 → 创建订单”，库存通过原子 SQL `UPDATE ... WHERE available >= :qty` 防超卖；`PaymentEvent(eventId)` 唯一约束 + 订单终态检查保证回调幂等。
- **实时链路职责分清**：公开端价格 / 上下线变更走 SSE，商户 / 管理员操作通知走 Socket.IO；审核结果同时触发通知、SSE 事件与缓存失效，保证不同端看到的状态一致。
- **认证与鉴权不是只做 JWT 登录**：双 Token、RBAC、角色白名单、商户资源所有权校验、支付回调签名校验都落在服务端，能清楚回答“为什么前端守卫不够”。
- **缓存与可观测性服务于排障**：公开查询使用 Cache Aside，写操作后主动失效；后端同时提供 Prometheus 指标、健康检查和 requestId 结构化日志，便于把问题从告警追到具体请求。
- **工程化证据完整**：当前本地可复跑 `144` 项自动化测试（后端单测 116 + E2E 2 + 前端 26），并接入 GitHub Actions CI、k6 压测脚本和 Docker 构建校验。

## 🔍 补充能力

- Swagger / OpenAPI 文档、分级限流、统一异常过滤器、容器化部署、万级种子数据生成。

---

## 📐 架构与关键设计

- **架构与关键设计**：[`docs/架构与关键设计.md`](./docs/架构与关键设计.md)
- **文档中心**：[`docs/README.md`](./docs/README.md)

### 关键设计概览

- **防超卖与预订闭环**：`Orders + Inventory + Payments` 模块设计订单状态机与日历库存，保证在并发场景下 `reserved + sold <= total` 恒成立。并发争抢测试验证"最后一间房"场景。
- **订单自动过期**：`@nestjs/schedule` 每分钟 Cron 扫描，过期未支付订单自动释放库存，防止恶意占房。
- **支付回调幂等与乱序安全**：`PaymentEvent(eventId)` 唯一约束 + HMAC-SHA256 签名校验 + 5 分钟时间窗口防重放，拒绝伪造/重复回调。
- **实时链路设计**：公开端用 SSE 推价格变更流，管理端用 WebSocket + JWT 握手推审核/订单结果，小程序/RN 端用轮询兜底。
- **可观测性与排障**：`/metrics` + `/healthz` + 结构化日志（`requestId`），可以从告警一路追到具体请求与 SQL。
- **安全纵深**：注册角色白名单 + JWT Secret 启动校验 + DB 角色优先 + Helmet 安全头 + 分级限流 + ValidationPipe 白名单 + TypeORM 参数化 + AuditLog 审计 + 双 Token 认证。
- **缓存一致性**：Cache Aside 模式，写操作后主动失效缓存，避免返回过期数据。
- **异常统一处理**：`AllExceptionsFilter` 统一错误响应格式，业务异常保留状态码，系统异常不暴露内部细节。
- **缓存与索引**：`@nestjs/cache-manager` 内存缓存热点查询 + 关键实体复合索引 + TypeORM 迁移体系，读写性能兼顾。
- **容器化部署**：多阶段 Docker 构建 + docker-compose 编排（PostgreSQL + Redis + NestJS + Nginx），一键部署生产环境。
- **测试与 CI**：后端单测（审核状态机全覆盖 + 订单/支付幂等 + 并发争抢 + DTO 验证）+ E2E + 前端 Redux 单测；GitHub Actions CI。TypeScript `strict: true`。
- **补充材料**：`backend/contract` 提供 OpenAPI 片段，`backend/perf` 提供 k6 压测脚本，用于接口契约与容量评估。

---

## ✅ 质量与验证

| 维度 | 当前口径 |
|------|----------|
| 自动化测试 | `144` 项（后端单测 116 + 后端 E2E 2 + 前端 26） |
| CI | `.github/workflows/ci.yml` 自动执行 Lint + TypeCheck + Test + Build + Docker 校验 |
| 压测 | `backend/perf/k6-orders-reserve.js`、`backend/perf/k6-payments-callback.js` |
| 可观测性 | `/api/v1/metrics`、`/api/v1/healthz`、requestId 结构化日志 |

---

## 🛠️ 技术栈

### 前端
- ⚛️ **React 19** + **TypeScript 5.9** — 类型安全的现代化 UI
- ⚡ **Vite 7** — 毫秒级 HMR
- 🎨 **Ant Design 6** — 定制 Token 主题（圆角 12px / PingFang SC 字体 / 蓝色主色调）
- 🔄 **Redux Toolkit** — 全局状态管理（auth / hotels / notifications slices）
- 🛣️ **React Router 7** — 嵌套路由 + AuthRoute 守卫
- 🔔 **Socket.IO Client** — 实时接收审核通知（NotificationBell 组件）

### 后端
- 🦅 **NestJS 11** — 模块化企业级框架
- 🗃️ **TypeORM 0.3** — 实体关联 + 级联加载 + 复合索引 + Migration 迁移
- 🐘 **PostgreSQL**（生产）/ **SQLite**（开发零配置）
- 🔐 **Passport + JWT** — 认证与授权（DB 角色优先 + 启动校验）
- 📡 **Socket.IO** — WebSocket 网关，按角色/用户房间推送
- 📈 **RxJS** — 服务端 SSE 价格变更流
- ⚡ **cache-manager** — 内存缓存层（公开查询 TTL 15–30s）
- ⏰ **@nestjs/schedule** — 订单过期 Cron + 库存释放
- 📝 **Swagger** — 自动 OpenAPI 文档（`/api/v1/docs`）
- 🌱 **Seed 系统** — 一键初始化 / 批量生成 / 清空 / 更新图片
- 🛡️ **Helmet + @nestjs/throttler** — 安全 HTTP 头 + 分级限流
- 📊 **prom-client** — Prometheus 指标采集（QPS / 延迟直方图）
- 🐳 **Docker** — 多阶段构建 + docker-compose 编排
- ✅ **Jest 30** — 单测 + E2E + 并发争抢测试，`strict: true` TypeScript

---

## 📁 项目结构

```
hotel-management/
├── frontend/                 # 前端 — React 19 PC 管理后台
│   ├── src/
│   │   ├── components/       # AuthRoute / ErrorBoundary / Layout / NotificationBell
│   │   ├── pages/
│   │   │   ├── auth/         # 登录 / 注册（可选商户 or 用户角色）
│   │   │   ├── merchant/     # 商户：酒店列表 / 编辑 / 提审
│   │   │   ├── admin/        # 管理员：审核列表 / 通过 / 驳回 / 上下线
│   │   │   └── Home/         # 数据看板
│   │   ├── store/slices/     # Redux Slices（auth / hotels）+ 单测
│   │   ├── services/         # Axios API 封装（baseURL: /api/v1）
│   │   └── router/           # 路由配置 + 角色守卫
│   ├── Dockerfile            # 多阶段构建 → Nginx
│   └── package.json
├── backend/                  # 后端 — NestJS 11 API
│   ├── src/
│   │   ├── auth/             # Passport + JWT + bcrypt 认证模块（角色白名单 + 启动校验）
│   │   ├── users/            # 用户 CRUD
│   │   ├── hotels/           # 酒店 CRUD + 审核 + SSE 价格流 + 缓存
│   │   ├── admin/            # 管理员专属接口
│   │   ├── orders/           # 订单状态机 + 自动过期 Cron
│   │   ├── inventory/        # 日历库存（reserve / commit / release）
│   │   ├── payments/         # 支付回调 + 签名校验 Guard
│   │   ├── cache/            # 全局缓存模块
│   │   ├── notifications/    # WebSocket 网关 + 通知持久化
│   │   ├── seeds/            # 种子数据（10 000 酒店生成器）
│   │   ├── migrations/       # TypeORM 迁移
│   │   └── config/           # 数据库 & 环境 & TypeORM CLI 配置
│   ├── Dockerfile            # 多阶段构建
│   └── package.json
├── docker-compose.yml        # PostgreSQL + Redis + Backend + Frontend
└── docs/                     # 需求规格说明书
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18　·　**npm** ≥ 9
- **PostgreSQL** ≥ 14（或使用 SQLite 零配置启动）

### 1. 启动后端

```bash
cd backend
npm install
# 创建 .env.local
# 最小本地配置只需提供 JWT_SECRET，数据库可直接走 SQLite 默认值
npm run seed                 # 初始化测试用户 + 20 家精选酒店
npm run start:dev            # http://localhost:3000
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### 3. 批量生成万级酒店（可选）

```bash
cd backend
npm run generate-hotels      # 生成 10 000 家酒店
```

### 4. Docker 一键部署（可选）

```bash
docker compose up -d         # PostgreSQL + Redis + Backend + Frontend
# 前端：http://localhost:80
# 后端：http://localhost:3000/api/v1/docs
```

---

## 🔄 酒店状态流转

```
草稿(DRAFT) ──提交──▶ 待审核(PENDING)
    ▲                      │
    │              ┌───────┴───────┐
    │              ▼               ▼
    │         已通过(APPROVED) ◀──▶ 已下线(OFFLINE)
    │              
    └─── 已驳回(REJECTED) ◀─── 驳回
```

---

## 📚 API 概览

> 完整文档：启动后端后访问 **http://localhost:3000/api/v1/docs**

| 模块 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 认证 | POST | `/api/v1/auth/register` | 注册（可选 merchant / customer） |
| 认证 | POST | `/api/v1/auth/login` | 登录（5/min 限流） |
| 订单 | POST | `/api/v1/orders` | 创建订单（customer） |
| 订单 | GET | `/api/v1/orders/mine` | 我的订单列表（customer） |
| 订单 | POST | `/api/v1/orders/:id/cancel` | 取消订单（customer，仅待支付） |
| 支付 | POST | `/api/v1/payments/callback` | 模拟支付回调（HMAC 签名校验 + 幂等） |
| 商户 | POST | `/api/v1/hotels` | 创建酒店 |
| 商户 | PATCH | `/api/v1/hotels/:id` | 编辑酒店（事务化更新） |
| 商户 | POST | `/api/v1/hotels/:id/submit` | 提交审核 |
| 管理员 | POST | `/api/v1/admin/hotels/:id/approve` | 审核通过 |
| 管理员 | POST | `/api/v1/admin/hotels/:id/reject` | 审核驳回 |
| 管理员 | POST | `/api/v1/admin/hotels/:id/offline` | 下线 |
| 管理员 | POST | `/api/v1/admin/hotels/:id/online` | 恢复上线 |
| 通知 | GET | `/api/v1/notifications/mine` | 获取当前用户未读通知 |
| 通知 | PATCH | `/api/v1/notifications/read-all` | 标记所有通知为已读 |
| 公开 | GET | `/api/v1/public/hotels` | 酒店列表（缓存 15s） |
| 公开 | GET | `/api/v1/public/hotels/:id` | 酒店详情（缓存 30s） |
| 公开 | GET | `/api/v1/public/hotels/price-updates` | SSE 价格变更流 |

---

## 👥 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 商户 | merchant01 | Test123456 |
| 商户 | merchant02 | Test123456 |
| 管理员 | admin01 | Admin123456 |
| 用户 | customer01 | Cust123456 |

---

## 🌱 种子数据

```bash
npm run seed              # 基础数据：测试用户 + 20 家精选酒店
npm run generate-hotels   # 批量：10 000 家酒店（50 城市 × 5 星级 × 150+ 图片）
npm run clear-hotels      # 清空酒店数据
npm run update-images     # 更新酒店图片
```

| 维度 | 分布 |
|------|------|
| 城市 | 50 个（北京、上海、广州、深圳、杭州、成都、三亚…） |
| 星级 | 1–5 星各 ~20% |
| 标签 | 亲子 / 豪华 / 免费停车场 / 含早餐 / 健身房 各 ~20% |
| 图片 | 150+ 张 Unsplash 精选，hotelId 种子算法确保唯一 |

---

## 📝 环境变量（后端 `.env.local`）

```env
JWT_SECRET=your_jwt_secret_key
DB_TYPE=sqlite
DB_DATABASE=hotel_management.sqlite
PORT=3000
```

使用 PostgreSQL 时可继续补充：

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hotel_management
```

---

## 🔗 相关项目

| 项目 | 说明 | 仓库 |
|------|------|------|
| **hotel-mobile-taro** | 用户端 — Taro 多端（H5 / 微信小程序 / RN） | [GitHub](https://github.com/lwayne7/hotel-mobile-taro) |
| **hotel-mobile** | 用户端 — 纯 H5 轻量版（Vite + Ant Design） | [GitHub](https://github.com/lwayne7/hotel-mobile) |

---

## 📄 许可证

本项目仅供学习使用。

⭐ 如果这个项目对你有帮助，请给一个 Star！
