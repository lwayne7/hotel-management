# 易宿酒店预订平台 - 后端服务

## 项目简介

本项目是易宿酒店预订平台的后端服务，基于 NestJS 框架开发，提供酒店管理、用户认证、审核流程等 API 接口。

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

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

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
npm run start:dev

# 生产模式
npm run build
npm run start:prod
```

服务将在 `http://localhost:3000` 启动。

## API 文档

启动服务后访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

## API 接口概览

所有接口都带有 `/api` 前缀。

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取当前用户信息 |

### 商户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/hotels | 获取我的酒店列表 |
| GET | /api/hotels/statistics | 获取商户统计数据 |
| GET | /api/hotels/:id | 获取酒店详情 |
| POST | /api/hotels | 创建酒店 |
| PUT | /api/hotels/:id | 更新酒店 |
| DELETE | /api/hotels/:id | 删除酒店 |
| POST | /api/hotels/:id/submit | 提交审核 |

### 管理员接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/hotels | 获取所有酒店列表 |
| GET | /api/admin/statistics | 获取管理员统计数据 |
| GET | /api/admin/hotels/:id | 获取酒店详情 |
| POST | /api/admin/hotels/:id/approve | 审核通过 |
| POST | /api/admin/hotels/:id/reject | 审核驳回 |
| POST | /api/admin/hotels/:id/offline | 酒店下线 |
| POST | /api/admin/hotels/:id/online | 酒店上线 |

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

更多详情请参考 [seeds/README.md](src/seeds/README.md)。

## 更新日志

### 2026-02-03
- ✨ 新增清空酒店数据脚本 (clear-hotels)
- 📊 支持生成 10000 家测试酒店
- 🏨 50 个城市、5 个筛选标签、5 个星级均匀分布
- 🗑️ 清理冗余临时脚本和文档
- 📝 完善项目文档
