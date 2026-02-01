# PostgreSQL 配置完成说明

## ✅ 配置状态

### 1. 环境配置文件（.env）

已成功配置为 PostgreSQL：

```env
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=hotel_management
```

### 2. 数据库信息

- **数据库类型**：PostgreSQL
- **主机地址**：localhost
- **端口**：5432
- **用户名**：postgres
- **密码**：123456
- **数据库名**：hotel_management

---

## 🔍 验证配置

### 方法 1：查看后端日志

等待后端服务完全启动（约 10-15 秒），查看终端输出：

**成功标志**：
```
🚀 Server running on http://localhost:3000
📚 Swagger docs: http://localhost:3000/api/docs
```

**如果看到数据库连接错误**，可能的原因：
1. PostgreSQL 服务未启动
2. 数据库 `hotel_management` 不存在
3. 密码不正确

### 方法 2：访问后端 API

打开浏览器访问：http://localhost:3000

应该看到：
```json
{
  "message": "Welcome to Hotel Management API"
}
```

### 方法 3：访问前端页面

打开浏览器访问：http://localhost:5173

应该能看到登录页面。

---

## 🗄️ 关于你的数据库文件

你提到已经有一个包含数据的数据库文件。

### 如果是 PostgreSQL 数据库

**情况 1：数据库已经在 PostgreSQL 服务器中**
- ✅ 配置已完成
- ✅ 后端会自动连接
- ✅ 可以直接使用现有的账号登录

**情况 2：有 PostgreSQL 的备份文件（.sql 或 .dump）**

需要导入到 PostgreSQL：

```bash
# 使用 psql 导入
psql -U postgres -d hotel_management -f backup.sql

# 或使用 pg_restore（如果是 .dump 文件）
pg_restore -U postgres -d hotel_management backup.dump
```

### 如果是 SQLite 数据库文件

如果你的数据库文件是 SQLite 格式（.sqlite），需要迁移到 PostgreSQL。

**迁移步骤**：

#### 方法 1：使用工具迁移
- pgLoader：https://pgloader.io/
- SQLite to PostgreSQL 转换工具

#### 方法 2：手动导出导入

```bash
# 1. 从 SQLite 导出数据
sqlite3 hotel_management.sqlite .dump > data.sql

# 2. 编辑 data.sql 文件，修改 SQLite 特有的语法为 PostgreSQL 语法

# 3. 导入到 PostgreSQL
psql -U postgres -d hotel_management -f data.sql
```

#### 方法 3：使用我创建的迁移脚本

我可以帮你创建一个 Node.js 脚本来迁移数据。

---

## 🚀 下一步操作

### 1. 确认后端启动成功

查看后端终端，等待看到：
```
🚀 Server running on http://localhost:3000
```

### 2. 测试登录

使用你数据库中已有的账号密码登录。

### 3. 如果无法登录

**可能原因**：
- 数据库中没有用户数据
- 数据还在 SQLite 文件中，没有迁移到 PostgreSQL

**解决方法**：
1. 检查 PostgreSQL 数据库中是否有数据
2. 如果没有，需要迁移 SQLite 数据
3. 或者使用我之前创建的测试账号

---

## 🔧 检查 PostgreSQL 数据库

### 使用 pgAdmin（推荐）

1. 打开 pgAdmin（PostgreSQL 自带的管理工具）
2. 连接到 localhost
3. 查看 `hotel_management` 数据库
4. 查看 `users` 表中是否有数据

### 使用命令行

```bash
# 连接到数据库
psql -U postgres -d hotel_management

# 查看所有表
\dt

# 查看用户数据
SELECT * FROM users;

# 退出
\q
```

---

## ⚠️ 常见问题

### Q1：后端启动失败，提示数据库连接错误

**检查清单**：
1. ✅ PostgreSQL 服务是否启动？
   - Windows：打开"服务"，查找 postgresql-x64-xx
2. ✅ 数据库 `hotel_management` 是否存在？
3. ✅ 密码是否正确（123456）？
4. ✅ 端口 5432 是否被占用？

**创建数据库**：
```sql
-- 使用 pgAdmin 或 psql 执行
CREATE DATABASE hotel_management;
```

### Q2：数据库连接成功，但没有数据

**原因**：PostgreSQL 数据库是新建的，还没有数据。

**解决方法**：
1. 迁移 SQLite 数据到 PostgreSQL
2. 或使用测试账号（merchant/merchant123, admin/admin123）

### Q3：如何确认使用的是 PostgreSQL 而不是 SQLite？

查看后端启动日志，应该看到类似：
```
query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public'
```

如果看到 SQLite 相关的日志，说明配置没有生效。

---

## 📝 配置文件位置

```
hotel-management/
└── backend/
    └── .env  ← PostgreSQL 配置在这里
```

**当前配置**：
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=hotel_management
```

---

## 🎉 配置完成

PostgreSQL 配置已完成！

**下一步**：
1. 等待后端启动完成
2. 访问 http://localhost:3000 验证
3. 使用数据库中的账号登录
4. 如果需要迁移数据，请告诉我

---

**配置时间**：2026-02-01  
**数据库类型**：PostgreSQL  
**状态**：✅ 已配置
