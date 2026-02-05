# 易宿酒店管理系统 - 前端（管理端 SPA）

基于 React 19 + TypeScript + Vite 的酒店管理后台，提供商户和管理员使用的 **PC 端管理界面**：登录/注册、酒店信息管理、审核与上下线等功能。

## 技术栈

- **框架**: React 19、TypeScript 5.9、Vite 7
- **UI 组件库**: Ant Design 6
- **状态管理**: Redux Toolkit + React Redux
- **路由**: React Router 7（`createBrowserRouter`）
- **网络**: Axios（统一封装 `src/services/api.ts`）

## 目录结构

```text
frontend/
├── src/
│   ├── components/        # 公共组件（布局、鉴权路由等）
│   ├── pages/
│   │   ├── auth/          # 登录、注册
│   │   ├── merchant/      # 商户端酒店列表、表单等
│   │   └── admin/         # 管理员审核列表等
│   ├── router/            # 路由配置（`createBrowserRouter`）
│   ├── services/          # API 封装（Axios 实例、酒店/用户等接口）
│   ├── store/             # Redux Store & Slices
│   └── types/             # 类型定义
└── package.json
```

## 快速开始

### 1. 启动后端（必需）

前端默认请求 `http://localhost:3000/api`，请先在 `hotel-management/backend` 启动后端（可使用 SQLite 或 PostgreSQL）：

```bash
cd ../backend
npm install
cp .env.example .env.local  # 或 .env，按需配置 DB_TYPE / 数据库信息
npm run seed                # 可选：初始化测试账号和演示酒店数据
npm run start:dev           # 后端运行在 http://localhost:3000
```

### 2. 安装依赖并启动前端

```bash
cd ../frontend
npm install
npm run dev
```

访问 `http://localhost:5173` 打开管理端。

### 3. 配置后端地址（可选）

如需连接非本机或线上后端，可在前端根目录创建 `.env` 或 `.env.local`：

```env
VITE_API_URL=http://your-api-host:3000/api
```

> 注意：`VITE_API_URL` 需要包含 `/api` 前缀，例如 `http://localhost:3000/api`。

## 路由概览

主要路由见 `src/router/index.tsx`：

- `/login`：登录页
- `/register`：注册页（可选择商户或管理员）
- `/`：登录后首页（按角色显示不同内容）
  - `/merchant/hotels`：商户酒店列表
  - `/merchant/hotels/create`：创建酒店
  - `/merchant/hotels/:id/edit`：编辑酒店
  - `/admin/review`：管理员审核列表
- `/403`：无权限页面
- `*`：404 页面

所有受保护路由均通过 `AuthRoute` 组件校验登录状态与角色，并自动处理 401 跳转。

## 常用脚本

```bash
npm run dev       # 启动开发服务器（默认端口 5173）
npm run build     # 生产构建，输出至 dist/
npm run preview   # 本地预览构建产物
npm run lint      # 运行 ESLint
```

前端更多整体说明，可参考仓库根目录的 `README.md` 与 `docs/README.md`。 
