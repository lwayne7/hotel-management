# 🏨 易宿酒店预订平台 — 管理系统

> 面向商户与平台管理员的酒店信息管理、审核、发布一站式系统。  
> **前端** React 19 + Ant Design 6 · **后端** NestJS 11 + TypeORM · **实时通信** WebSocket + SSE

---

## ✨ 项目亮点

| 亮点 | 说明 |
|------|------|
| 🔄 **完整审核工作流** | DRAFT → PENDING → APPROVED / REJECTED → OFFLINE，覆盖酒店全生命周期 |
| 📡 **WebSocket 实时通知** | 基于 Socket.IO，商户提交/管理员审核操作秒级推送，按角色精准投递 |
| 📈 **SSE 价格流** | RxJS Subject + interval 合并流，30s keepalive，客户端零丢失 |
| 🧾 **预订闭环（订单+库存）** | 用户端下单/取消/查询，日历库存 `total/reserved/sold` + 事务化 reserve/commit/release，演示“防超卖”与状态机约束 |
| 🔁 **支付回调幂等** | `PaymentEvent(eventId)` 唯一约束，重复/乱序回调不会二次扣库存或重复迁移订单状态 |
| 🔐 **JWT + RBAC** | Passport.js 认证、RolesGuard 鉴权、bcrypt 密码哈希，商户/管理员双角色隔离 |
| 🗂️ **万级种子数据** | 一键生成 10 000 家酒店 × 50 城市 × 5 星级 × 150+ 张 Unsplash 高质量图片 |
| 📝 **Swagger 文档** | 自动生成 OpenAPI 文档，开箱即用 |
| 🎨 **企业级 UI** | Ant Design 6 定制主题、深色侧边栏、响应式布局、ErrorBoundary 兜底 |

---

## 📐 架构与关键设计（面试友好）

- **架构与关键设计**：[`docs/架构与关键设计.md`](./docs/架构与关键设计.md)
- **文档中心**：[`docs/README.md`](./docs/README.md)

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
- 🗃️ **TypeORM 0.3** — 实体关联 + 级联加载（Hotel → RoomType → HotelImage）
- 🐘 **PostgreSQL**（生产）/ **SQLite**（开发零配置）
- 🔐 **Passport + JWT** — 认证与授权
- 📡 **Socket.IO** — WebSocket 网关，按角色/用户房间推送
- 📈 **RxJS** — 服务端 SSE 价格变更流
- 📝 **Swagger** — 自动 OpenAPI 文档
- 🌱 **Seed 系统** — 一键初始化 / 批量生成 / 清空 / 更新图片

---

## 📁 项目结构

```
hotel-management/
├── frontend/                 # 前端 — React 19 PC 管理后台
│   ├── src/
│   │   ├── components/       # AuthRoute / ErrorBoundary / Layout / NotificationBell
│   │   ├── pages/
│   │   │   ├── auth/         # 登录 / 注册（可选商户 or 管理员角色）
│   │   │   ├── merchant/     # 商户：酒店列表 / 编辑 / 提审
│   │   │   ├── admin/        # 管理员：审核列表 / 通过 / 驳回 / 上下线
│   │   │   └── Home/         # 数据看板
│   │   ├── store/slices/     # Redux Slices（auth / hotels）
│   │   ├── services/         # Axios API 封装
│   │   └── router/           # 路由配置 + 角色守卫
│   └── package.json
├── backend/                  # 后端 — NestJS 11 API
│   ├── src/
│   │   ├── auth/             # Passport + JWT + bcrypt 认证模块
│   │   ├── users/            # 用户 CRUD
│   │   ├── hotels/           # 酒店 CRUD + 审核 + SSE 价格流
│   │   ├── admin/            # 管理员专属接口
│   │   ├── notifications/    # WebSocket 网关 + 通知持久化（Socket.IO + TypeORM）
│   │   ├── seeds/            # 种子数据（10 000 酒店生成器）
│   │   └── config/           # 数据库 & 环境配置
│   └── package.json
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

> 完整文档：启动后端后访问 **http://localhost:3000/api/docs**

| 模块 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 认证 | POST | `/api/auth/register` | 注册（可选 merchant / admin / customer） |
| 认证 | POST | `/api/auth/login` | 登录 |
| 订单 | POST | `/api/orders` | 创建订单（customer） |
| 订单 | GET | `/api/orders/mine` | 我的订单列表（customer） |
| 订单 | POST | `/api/orders/:id/cancel` | 取消订单（customer，仅待支付） |
| 支付 | POST | `/api/payments/callback` | 模拟支付回调（幂等） |
| 商户 | POST | `/api/hotels` | 创建酒店 |
| 商户 | PATCH | `/api/hotels/:id` | 编辑酒店 |
| 商户 | POST | `/api/hotels/:id/submit` | 提交审核 |
| 管理员 | POST | `/api/admin/hotels/:id/approve` | 审核通过 |
| 管理员 | POST | `/api/admin/hotels/:id/reject` | 审核驳回 |
| 管理员 | POST | `/api/admin/hotels/:id/offline` | 下线 |
| 管理员 | POST | `/api/admin/hotels/:id/online` | 恢复上线 |
| 通知 | GET | `/api/notifications/mine` | 获取当前用户未读通知 |
| 通知 | PATCH | `/api/notifications/read-all` | 标记所有通知为已读 |
| 公开 | GET | `/api/public/hotels` | 酒店列表（keyword / city / star / price / tags） |
| 公开 | GET | `/api/public/hotels/:id` | 酒店详情 |
| 公开 | GET | `/api/public/hotels/price-updates` | SSE 价格变更流 |

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
