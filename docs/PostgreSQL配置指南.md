# PostgreSQL 配置指南

## 📋 概述

本项目已配置为使用 PostgreSQL 数据库，适合团队协作和生产环境。

---

## ✅ 当前配置状态

### 数据库信息
- **类型**：PostgreSQL
- **主机**：localhost
- **端口**：5432
- **用户名**：postgres
- **密码**：123456
- **数据库名**：hotel_management

### 数据状态
- ✅ 数据库已创建
- ✅ 表结构已生成
- ✅ 种子数据已导入
- ✅ 3个测试账号
- ✅ 2个演示酒店

---

## 🔧 配置文件

### .env 文件
位置：`backend/.env`

```env
# Database - PostgreSQL
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=hotel_management

# JWT
JWT_SECRET=hotel_management_secret_key_2026
JWT_EXPIRES_IN=7d

# Server
PORT=3000
```

---

## 🚀 快速开始

### 1. 确保 PostgreSQL 已安装并运行

**检查服务状态**：
- Windows：打开"服务"，查找 postgresql-x64-xx
- 确保服务状态为"正在运行"

### 2. 创建数据库（如果还没创建）

```bash
cd hotel-management/backend
node create-postgres-db.js
```

### 3. 导入种子数据

```bash
npm run seed
```

### 4. 启动后端服务

```bash
npm run start:dev
```

---

## 🔑 测试账号

### 商户账号
```
用户名：merchant01
密码：Test123456
角色：商户
```

```
用户名：merchant02
密码：Test123456
角色：商户
```

### 管理员账号
```
用户名：admin01
密码：Admin123456
角色：管理员
```

---

## 🗄️ 数据库管理

### 使用 pgAdmin（推荐）

1. 打开 pgAdmin
2. 连接到 localhost
3. 展开 Databases → hotel_management
4. 查看表和数据

### 使用命令行

```bash
# 连接到数据库
psql -U postgres -d hotel_management

# 查看所有表
\dt

# 查看用户
SELECT id, username, role, nickname FROM users;

# 查看酒店
SELECT id, "nameCn", status, "merchantId" FROM hotels;

# 退出
\q
```

---

## 📊 数据库结构

### 表列表

1. **users** - 用户表
   - 存储商户和管理员账号
   - 密码使用 bcrypt 加密

2. **hotels** - 酒店表
   - 存储酒店基本信息
   - 关联商户（merchantId）

3. **room_types** - 房型表
   - 存储房型信息
   - 关联酒店（hotelId）

4. **hotel_images** - 图片表
   - 存储酒店图片
   - 关联酒店（hotelId）

---

## 🔄 常用操作

### 重新导入种子数据

```bash
cd hotel-management/backend
npm run seed
```

**注意**：种子数据脚本会检查是否已有数据，不会重复导入。

### 清空数据库

```sql
-- 使用 psql 或 pgAdmin 执行
TRUNCATE TABLE hotel_images CASCADE;
TRUNCATE TABLE room_types CASCADE;
TRUNCATE TABLE hotels CASCADE;
TRUNCATE TABLE users CASCADE;
```

### 重置数据库

```bash
# 删除并重建数据库
psql -U postgres -c "DROP DATABASE hotel_management;"
psql -U postgres -c "CREATE DATABASE hotel_management;"

# 重启后端（会自动创建表结构）
npm run start:dev

# 导入种子数据
npm run seed
```

---

## 🔀 切换到 SQLite

如果需要切换回 SQLite：

### 1. 修改 .env 文件

```env
# 改为 SQLite
DB_TYPE=sqlite
DB_DATABASE=hotel_management.sqlite

# 注释掉 PostgreSQL 配置
# DB_TYPE=postgres
# DB_HOST=localhost
# ...
```

### 2. 重启后端

```bash
npm run start:dev
```

### 3. 导入种子数据

```bash
npm run seed
```

---

## 🌐 团队协作配置

### 共享数据库设置

如果团队需要共享数据库：

#### 1. 设置 PostgreSQL 允许远程连接

编辑 `postgresql.conf`：
```
listen_addresses = '*'
```

编辑 `pg_hba.conf`：
```
host    all    all    0.0.0.0/0    md5
```

#### 2. 团队成员修改 .env

```env
DB_HOST=192.168.1.100  # 数据库服务器 IP
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=hotel_management
```

#### 3. 重启后端

所有团队成员连接到同一个数据库。

---

## 🔐 安全建议

### 开发环境
- ✅ 使用简单密码（如 123456）
- ✅ 本地访问即可

### 生产环境
- ⚠️ 使用强密码
- ⚠️ 限制访问 IP
- ⚠️ 启用 SSL 连接
- ⚠️ 定期备份数据

---

## 📝 备份与恢复

### 备份数据库

```bash
# 备份整个数据库
pg_dump -U postgres -d hotel_management > backup.sql

# 备份特定表
pg_dump -U postgres -d hotel_management -t users > users_backup.sql
```

### 恢复数据库

```bash
# 恢复数据库
psql -U postgres -d hotel_management < backup.sql
```

---

## ❓ 常见问题

### Q1：无法连接到数据库

**检查清单**：
1. PostgreSQL 服务是否启动？
2. 端口 5432 是否正确？
3. 密码是否正确？
4. 数据库 hotel_management 是否存在？

### Q2：种子数据导入失败

**可能原因**：
- 数据库连接失败
- 表结构未创建

**解决方法**：
1. 确保后端至少启动过一次（会自动创建表）
2. 检查 .env 配置是否正确

### Q3：如何查看数据库日志？

**PostgreSQL 日志位置**：
- Windows：`C:\Program Files\PostgreSQL\xx\data\log\`
- Linux：`/var/log/postgresql/`

### Q4：端口 5432 被占用

**解决方法**：
1. 修改 PostgreSQL 端口
2. 或停止占用端口的程序

---

## 🎓 学习资源

### PostgreSQL 官方文档
- https://www.postgresql.org/docs/

### pgAdmin 使用指南
- https://www.pgadmin.org/docs/

### TypeORM 文档
- https://typeorm.io/

---

## 📞 获取帮助

如遇到问题：
1. 查看本文档的"常见问题"部分
2. 查看后端日志（终端输出）
3. 查看 PostgreSQL 日志
4. 使用 pgAdmin 检查数据库状态

---

**文档版本**：v1.0  
**最后更新**：2026-02-01  
**数据库类型**：PostgreSQL  
**状态**：✅ 已配置并运行
