# 易宿酒店预订平台

智慧出行酒店预订平台，面向商户与终端用户：**用户端**为移动端预定流程（查询/列表/详情），**管理端**为 PC 端酒店信息管理与审核。

## 📋 项目简介

本项目分为两部分，与「第五期前端训练营大作业」要求对齐：

- **用户端预定流程（移动端）**：独立项目 [hotel-mobile](../hotel-mobile)，与后端公开 API 对接。
  - 酒店查询页（首页）、酒店列表页（上滑加载）、酒店详情页；入口为 `hotel-mobile` 的 `/`、`/hotels`、`/hotels/:id`。
- **管理酒店信息系统（PC 站点）**
  - 用户登录/注册（商户、管理员角色；注册可选角色，登录自动判断）
  - 酒店信息录入/编辑/修改（商户）；保存后实时更新到端侧
  - 酒店信息审核/发布/下线（管理员）；审核状态通过/不通过/审核中，不通过显示原因；下线可恢复

## 🛠 技术栈

### 前端
- ⚛️ **React 18** - 现代化 UI 框架
- 📘 **TypeScript** - 类型安全
- ⚡ **Vite** - 快速构建工具
- 🎨 **Ant Design 5.x** - 企业级 UI 组件库
- 🔄 **Redux Toolkit** - 状态管理
- 🛣️ **React Router 6** - 路由管理
- 📡 **Axios** - HTTP 客户端

### 后端
- 🦅 **NestJS** - 企业级 Node.js 框架
- 📘 **TypeScript** - 类型安全
- 🗃️ **TypeORM** - ORM 框架
- 🐘 **PostgreSQL** - 关系型数据库
- 🔐 **Passport + JWT** - 身份认证
- 📝 **Swagger** - API 文档

## 📁 项目结构

```
hotel-management/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── auth/        # 认证页面
│   │   │   ├── merchant/    # 商户页面
│   │   │   └── admin/       # 管理员页面
│   │   ├── store/           # Redux Store
│   │   │   └── slices/      # Redux Slices
│   │   ├── services/        # API 服务
│   │   ├── router/          # 路由配置
│   │   └── types/           # 类型定义
│   └── package.json
├── backend/                  # 后端项目
│   ├── src/
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   ├── hotels/          # 酒店模块
│   │   ├── admin/           # 管理员模块
│   │   └── config/          # 配置
│   └── package.json
└── docs/                     # 项目文档
    └── REQUIREMENTS.md      # 需求规格说明书
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 1. 克隆项目

```bash
git clone https://github.com/lwayne7/hotel-management.git
cd hotel-management
```

### 2. 安装 PostgreSQL

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)

### 3. 创建数据库

```bash
# 进入 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE hotel_management;

# 退出
\q
```

### 4. 配置后端

```bash
cd backend

# 安装依赖
npm install

# 复制环境配置
cp .env.example .env

# 编辑 .env 文件，配置数据库连接信息
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your_password
# DB_DATABASE=hotel_management
# JWT_SECRET=your_jwt_secret
```

### 5. 启动后端

```bash
cd backend
npm run start:dev

# 后端服务将运行在 http://localhost:3000
# Swagger 文档: http://localhost:3000/api/docs
```

### 6. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 前端服务将运行在 http://localhost:5173
```

## 📚 API 文档

启动后端后，访问 Swagger 文档：
```
http://localhost:3000/api/docs
```

### 主要接口

#### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/profile | 获取当前用户 |

#### 商户接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/hotels | 获取我的酒店列表 |
| POST | /api/hotels | 创建酒店 |
| PUT | /api/hotels/:id | 更新酒店 |
| DELETE | /api/hotels/:id | 删除酒店 |
| POST | /api/hotels/:id/submit | 提交审核 |

#### 管理员接口
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/admin/hotels | 获取所有酒店 |
| POST | /api/admin/hotels/:id/approve | 审核通过 |
| POST | /api/admin/hotels/:id/reject | 审核驳回 |
| POST | /api/admin/hotels/:id/offline | 酒店下线 |
| POST | /api/admin/hotels/:id/online | 酒店上线 |

#### 用户端公开接口（无需登录，仅已发布酒店）
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/public/hotels | 酒店列表（支持 keyword/city/starRating/minPrice/maxPrice） |
| GET | /api/public/hotels/:id | 酒店详情 |

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

## 👥 用户角色

| 角色 | 描述 | 权限 |
|------|------|------|
| 商户 (merchant) | 酒店经营者 | 管理自己的酒店信息 |
| 管理员 (admin) | 平台运营 | 审核、上下线所有酒店 |

## 🔧 开发命令

### 后端
```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 运行测试
npm run test

# 代码格式化
npm run format
```

### 前端
```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 预览构建结果
npm run preview
```

## 📝 环境变量

### 后端 (.env)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hotel_management

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 服务端口
PORT=3000

# OSS 配置（可选）
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your_access_key
OSS_ACCESS_KEY_SECRET=your_secret
OSS_BUCKET=your_bucket
```

## 🌱 种子数据

后端提供种子脚本，可初始化测试用户与演示酒店（见 `backend/src/seeds/seed.ts`）。运行：

```bash
cd backend
npm run seed
# 或 npx ts-node -r tsconfig-paths/register src/seeds/seed.ts
```

测试账号见控制台输出（商户 merchant01/merchant02、管理员 admin01 等）。种子数据仅插入到**当前配置的数据库**，每人运行后得到的是各自库里的副本。

## 🧪 测试账号

首次运行后，可执行上述种子脚本，或手动在数据库中创建管理员账号：

```sql
-- 创建管理员账号（密码需要是 bcrypt 加密后的值）
INSERT INTO users (username, password, role, "createdAt", "updatedAt")
VALUES ('admin', '$2b$10$...', 'admin', NOW(), NOW());
```

或者先注册一个商户，然后修改角色为管理员：
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_username';
```

## 📄 项目文档

- [需求规格说明书](docs/REQUIREMENTS.md) - 详细功能需求文档

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📜 许可证

本项目仅供学习使用。

## 📧 联系方式

如有问题，请提交 Issue。

---

⭐ 如果这个项目对你有帮助，请给一个 Star！
