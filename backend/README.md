# 易宿酒店预订平台 - 后端服务

## 项目简介

基于 NestJS 11 + TypeScript + TypeORM 的后端服务，负责认证、酒店审核、订单 / 库存、支付回调、实时通知、缓存与可观测性等核心能力。
这个服务的重点不在“接口数量”，而在把 **审核状态机、库存一致性、权限边界、实时链路与工程质量** 真正放到服务端落地。

## 更适合面试展开的亮点

- **审核状态机与权限边界放在服务端**：`HotelsService` 收敛 `DRAFT → PENDING → APPROVED / REJECTED → OFFLINE`，并同时校验角色、酒店所有权与“审核中不可编辑”。
- **订单、库存与支付回调是一条一致性链路**：`createOrder` 在事务中完成“预占库存 → 创建订单”，库存通过原子 SQL `UPDATE ... WHERE available >= :qty` 防超卖；`PaymentEvent(eventId)` 唯一约束 + 订单终态检查保证幂等。
- **实时链路职责分清**：公开端价格 / 上下线变更走 SSE，商户 / 管理员通知走 Socket.IO；审核结果同时触发通知、SSE 事件与缓存失效。
- **安全不是只做 JWT 登录**：RBAC、角色白名单、商户资源所有权校验、支付回调 HMAC 签名校验和限流都落在服务端。
- **质量与排障有证据**：当前本地可复跑 `125` 项测试（单测 123 + E2E 2），并提供 k6 压测脚本、Prometheus 指标、健康检查和 requestId 结构化日志。

## 技术栈

- **框架**: NestJS + TypeScript
- **ORM**: TypeORM
- **数据库**: 
  - 开发环境: SQLite (better-sqlite3)
  - 生产环境: PostgreSQL
- **认证**: Passport + JWT
- **文档**: Swagger

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local`：

### 3. 数据库配置

#### 开发环境 (SQLite - 默认)

默认使用 SQLite，无需额外配置，启动后会自动创建 `hotel_management.sqlite` 文件。

```env
# .env.local
DB_TYPE=sqlite
DB_DATABASE=hotel_management.sqlite
JWT_SECRET=your_jwt_secret_key_here
```

#### 生产环境 (PostgreSQL - 推荐)

生产环境建议使用 PostgreSQL：

```env
# .env.local
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=hotel_management
JWT_SECRET=your_jwt_secret_key_here
```

确保 PostgreSQL 服务已启动，并创建数据库：

```sql
CREATE DATABASE hotel_management;
```

### 4. 启动服务

```bash
# 开发模式
npm run seed
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务将在 `http://localhost:3000` 启动。

## API 文档

启动服务后访问 Swagger 文档：

```
http://localhost:3000/api/v1/docs
```

## API 接口概览

所有接口都带有 `/api/v1` 前缀。

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/v1/auth/register | 用户注册 |
| POST | /api/v1/auth/login | 用户登录 |
| POST | /api/v1/auth/refresh | 刷新 Token |
| GET | /api/v1/auth/profile | 获取当前用户信息 |

### 商户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/hotels/my | 获取我的酒店列表 |
| GET | /api/v1/hotels/statistics | 获取商户统计数据 |
| GET | /api/v1/hotels/:id | 获取酒店详情 |
| POST | /api/v1/hotels | 创建酒店 |
| PATCH | /api/v1/hotels/:id | 更新酒店 |
| DELETE | /api/v1/hotels/:id | 删除酒店 |
| POST | /api/v1/hotels/:id/submit | 提交审核 |

### 管理员接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/admin/hotels | 获取所有酒店列表 |
| GET | /api/v1/admin/statistics | 获取管理员统计数据 |
| GET | /api/v1/admin/hotels/:id | 获取酒店详情 |
| POST | /api/v1/admin/hotels/:id/approve | 审核通过 |
| POST | /api/v1/admin/hotels/:id/reject | 审核驳回 |
| POST | /api/v1/admin/hotels/:id/offline | 酒店下线 |
| POST | /api/v1/admin/hotels/:id/online | 酒店上线 |

### 公开 / 订单 / 支付接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/v1/public/hotels | 公开酒店列表 |
| GET | /api/v1/public/hotels/:id | 公开酒店详情 |
| GET | /api/v1/public/hotels/price-updates | SSE 价格变更流 |
| POST | /api/v1/orders | 创建订单 |
| GET | /api/v1/orders/mine | 我的订单 |
| POST | /api/v1/orders/:id/cancel | 取消订单 |
| POST | /api/v1/payments/callback | 模拟支付回调（签名校验 + 幂等） |

## 关于数据库选择

| 特性 | SQLite | PostgreSQL |
|------|--------|------------|
| 适用场景 | 开发、测试 | 生产环境 |
| 并发支持 | 有限 | 高并发 |
| 数据持久化 | 单文件 | 独立服务 |
| 部署复杂度 | 零配置 | 需要安装服务 |

**建议**：
- 本地开发使用 SQLite，快速启动无需配置
- 生产部署切换到 PostgreSQL，确保数据安全和性能

## 种子数据

### 初始化测试数据

```bash
npm run seed
```

创建 3 个测试用户和 20 家精选演示酒店。

### 批量生成测试酒店

```bash
npm run generate-hotels
```

生成 10000 家酒店，用于测试筛选功能，特性：
- 5 个筛选标签均匀分布（各 ~20%）
- 5 个星级均匀分布（各 ~20%）
- 50 个城市覆盖
- 使用事务批量写入，支持进度显示和耗时统计

### 清空酒店数据

```bash
npm run clear-hotels
```

清空所有酒店数据，用于重新导入种子数据。

### 更新酒店图片

```bash
npm run update-images
```

将数据库中的酒店图片更新为精选 Unsplash 图片。

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 商户 | merchant01 | Test123456 |
| 商户 | merchant02 | Test123456 |
| 管理员 | admin01 | Admin123456 |
| 用户 | customer01 | Cust123456 |

更多详情请参考 [seeds/README.md](src/seeds/README.md)。

## 质量与验证

| 维度 | 当前口径 |
|------|----------|
| 自动化测试 | `125` 项（单测 123 + E2E 2） |
| 构建验证 | `npm run build` |
| 压测脚本 | `perf/k6-orders-reserve.js`、`perf/k6-payments-callback.js` |
| 可观测性 | `/api/v1/metrics`、`/api/v1/healthz`、requestId 结构化日志 |
