# 易宿酒店预订平台 - 管理系统

智慧出行酒店预订平台的商户端管理系统（PC站点），为酒店商家与管理员提供专业化的酒店信息管理能力。

## 项目架构

```
hotel-management/
├── frontend/          # React 前端项目
│   ├── src/
│   │   ├── components/   # 通用组件
│   │   ├── pages/        # 页面组件
│   │   ├── store/        # Redux 状态管理
│   │   ├── services/     # API 服务
│   │   └── utils/        # 工具函数
│   └── ...
├── backend/           # NestJS 后端项目
│   ├── src/
│   │   ├── auth/         # 认证模块
│   │   ├── users/        # 用户模块
│   │   ├── hotels/       # 酒店模块
│   │   └── upload/       # 文件上传模块
│   └── ...
└── README.md
```

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design 5.x
- Redux Toolkit + RTK Query
- React Router 6
- Vite

### 后端
- NestJS + TypeScript
- TypeORM + PostgreSQL
- JWT + Passport 认证
- Swagger API 文档

## 功能模块

### 用户认证
- 商户/管理员注册
- 登录与角色识别
- JWT Token 认证

### 商户端
- 酒店信息录入/编辑/保存
- 酒店图片上传管理
- 房型与价格管理
- 提交审核

### 管理员端
- 酒店信息审核（通过/驳回）
- 酒店发布/下线管理
- 审核状态追踪

## 快速开始

### 环境要求
- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

### 后端启动

```bash
cd backend
npm install
# 配置数据库连接（参考 .env.example）
npm run start:dev
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

### API 文档

启动后端后访问: http://localhost:3000/api/docs

## 开发规范

- 使用 ESLint + Prettier 保持代码风格一致
- Git 提交遵循 Conventional Commits 规范
- 每个功能模块完成后进行独立提交

## License

MIT
