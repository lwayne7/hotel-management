# Seeds 模块

种子数据和测试数据生成模块。

## 目录结构

```
seeds/
├── config/                 # 配置模块
│   ├── database.ts        # 共享数据库连接
│   ├── constants.ts       # 城市、设施、房型常量
│   └── types.ts           # TypeScript 类型定义
├── data/                   # 数据模块
│   ├── users.ts           # 用户种子数据
│   └── featured-hotels.ts # 精选演示酒店
├── generators/             # 生成器模块
│   └── hotel-generator.ts # 酒店批量生成器
├── images/                 # 图片模块
│   └── hotel-images.ts    # Unsplash 图片库
├── scripts/                # 执行脚本
│   ├── seed.ts            # 基础种子脚本
│   ├── generate-hotels.ts # 批量生成1000家酒店
│   └── update-images.ts   # 更新图片
└── README.md              # 本文件
```

## 使用方法

### 初始化基础数据
```bash
npm run seed
```
创建测试用户和10家精选酒店。

### 批量生成测试酒店
```bash
npx ts-node src/seeds/scripts/generate-hotels.ts
```
生成1000家酒店，确保筛选标签均匀分布（每个标签约200家）。

### 更新图片
```bash
npx ts-node src/seeds/scripts/update-images.ts
```
将数据库中的图片更新为精选 Unsplash 酒店图片。

## 筛选测试覆盖

| 标签 | 分布 | 备注 |
|------|------|------|
| 亲子 | ~20% | 儿童乐园、亲子房等 |
| 豪华 | ~20% | 管家服务、VIP等 |
| 免费停车场 | ~20% | 停车场相关 |
| 含早餐 | ~20% | 早餐相关 |
| 健身房 | ~20% | 健身相关设施 |

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 商户 | merchant01 | Test123456 |
| 商户 | merchant02 | Test123456 |
| 管理员 | admin01 | Admin123456 |
