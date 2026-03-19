# 易宿酒店管理系统 - 前端（管理端 SPA）

基于 React 19 + TypeScript + Vite 的 PC 管理端，负责承接商户录入 / 提审和管理员审核 / 上下线等后台流程。
它的重点不是页面数量，而是把 **角色路由、鉴权体验、实时通知和后台链路** 做成可追问的完整前端实现。

## 更适合面试展开的点

- **前端守卫只负责体验，真实权限在服务端**：`AuthRoute` 根据登录态和角色做路由拦截，但真正的 RBAC 和资源所有权校验仍交给后端。
- **并发 401 的静默刷新做了队列保护**：Axios 响应拦截器使用 `failedQueue` 串行化 refresh token 流程，避免多个请求同时失效时重复刷新。
- **实时通知走独立链路**：`NotificationBell` 通过 Socket.IO 连接 `/notifications`，结合未读通知拉取与已读回写，形成“推送 + 持久化”闭环。
- **路由级懒加载和测试都有证据**：页面通过 `createBrowserRouter + lazy + Suspense` 做拆分，当前本地可复跑 `26` 条测试。

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

前端默认请求 `http://localhost:3000/api/v1`，请先在 `hotel-management/backend` 启动后端（可使用 SQLite 或 PostgreSQL）：

```bash
cd ../backend
npm install
# 创建 .env.local，最小配置只需提供 JWT_SECRET
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
VITE_API_URL=http://your-api-host:3000/api/v1
```

> 注意：`VITE_API_URL` 需要包含 `/api/v1` 前缀，例如 `http://localhost:3000/api/v1`。

## 路由概览

主要路由见 `src/router/index.tsx`：

- `/login`：登录页
- `/register`：注册页（可选择商户或普通用户；管理员使用种子账号）
- `/`：登录后首页（按角色显示不同内容）
  - `/merchant/hotels`：商户酒店列表
  - `/merchant/hotels/create`：创建酒店
  - `/merchant/hotels/:id/edit`：编辑酒店
  - `/admin/review`：管理员审核列表
- `/403`：无权限页面
- `*`：404 页面

所有受保护路由均通过 `AuthRoute` 组件校验登录状态与角色，并自动处理 401 跳转。

## 质量与验证

| 维度 | 当前口径 |
|------|----------|
| 自动化测试 | `26` 条（认证切片、酒店切片、AuthRoute、登录页、商户列表、审核列表） |
| 构建验证 | `npm run build` |
| 关键链路 | 登录 / 注册、商户提审、管理员审核、通知展示 |

## 常用脚本

```bash
npm run dev       # 启动开发服务器（默认端口 5173）
npm run build     # 生产构建，输出至 dist/
npm run preview   # 本地预览构建产物
npm run lint      # 运行 ESLint
```

前端更多整体说明，可参考仓库根目录的 `README.md` 与 `docs/README.md`。
