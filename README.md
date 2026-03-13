# 🏨 易宿酒店预订平台 — 管理系统

> 面向商户与平台管理员的酒店信息管理、审核、发布一站式系统。  
> **前端** React 19 + Ant Design 6 · **后端** NestJS 11 + TypeORM · **实时通信** WebSocket + SSE

---

## ✨ 项目亮点

| 亮点 | 说明 |
|------|------|
| 🔄 **完整审核工作流** | DRAFT → PENDING → APPROVED / REJECTED → OFFLINE，覆盖酒店全生命周期 |
| 📡 **WebSocket 实时通知** | 基于 Socket.IO，商户提交/管理员审核操作秒级推送，按角色精准投递 |
| 📈 **SSE 价格流** | RxJS Subject + interval 合并流，30s keepalive，H5 端实时感知并在重连后走 REST 对齐 |
| 🧾 **预订闭环（订单+库存）** | 用户端下单/取消/查询，日历库存 `total/reserved/sold` + 事务化 reserve/commit/release，演示“防超卖”与状态机约束 |
| 🔁 **支付回调幂等** | `PaymentEvent(eventId)` 唯一约束，重复/乱序回调不会二次扣库存或重复迁移订单状态 |
| 🔐 **JWT 双 Token + RBAC** | access_token（15min）+ refresh_token（7d）双 Token 机制；Passport.js 认证、RolesGuard 鉴权、bcrypt 密码哈希；注册接口白名单限制角色；JWT 解析后从 DB 取角色，防篡改 |
| 🛡️ **支付签名校验** | HMAC-SHA256 签名守护 + 5 分钟时间窗口防重放 + timing-safe 比较，拒绝伪造回调 |
| ⚡ **缓存层 + 主动失效** | `@nestjs/cache-manager` 内存缓存，公开酒店列表 15s / 详情 30s TTL；写操作后主动清除缓存（Cache Aside 模式），保证数据一致性 |
| 🛡️ **全局统一异常过滤器** | `AllExceptionsFilter` 统一错误响应格式 `{ statusCode, message, error, requestId, timestamp }`；业务异常保留原始状态，系统异常不暴露内部细节 |
| 🔧 **原子化库存操作** | 库存 reserve/commit/release 使用原子 SQL `UPDATE ... WHERE available >= :qty`，通过 affected rows 判断成败，避免 TOCTOU 竞态 |
| ⏰ **订单自动过期** | `@nestjs/schedule` 每分钟扫描过期订单，自动释放库存（reserve → release），防止恶意占房 |
| 🗂️ **万级种子数据** | 一键生成 10 000 家酒店 × 50 城市 × 5 星级 × 150+ 张 Unsplash 高质量图片 |
| 📝 **Swagger 文档** | 自动生成 OpenAPI 文档，开箱即用 |
| 🎨 **企业级 UI** | Ant Design 6 定制主题、深色侧边栏、响应式布局、ErrorBoundary 兜底 |
| 🛡️ **分级限流** | 全局 60req/min + 登录 5/min + 注册 3/min + 支付回调 30/min，按接口敏感度精细化 |
| 🐳 **Docker 容器化** | 多阶段构建（Backend + Frontend Nginx）+ docker-compose 一键编排（PostgreSQL + Redis + Backend + Frontend） |
| 🔢 **API 版本化** | 全局 `/api/v1` 前缀，前后端统一，便于后续平滑升级 |
| 🗃️ **数据库索引 + 迁移** | 关键实体复合索引（hotel/room_type/order）+ TypeORM CLI 迁移体系 |
| ✅ **CI + 测试** | GitHub Actions CI（Lint + TypeCheck + Test + Build + Docker 校验）；后端单测 + E2E + 并发争抢测试 + 前端 Redux 单测 |
| 📊 **可观测性** | Prometheus 指标（QPS / 延迟分布）+ 结构化日志 + 健康检查端点 |

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
cp .env.example .env        # 编辑数据库连接等
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

## 📝 环境变量（后端 `.env`）

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hotel_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
PORT=3000
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
