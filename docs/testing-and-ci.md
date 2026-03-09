# 测试与 CI 说明（后端为主）

## 1. 测试金字塔

### 1.1 单元测试（Orders / Inventory / Payments）

- 订单与库存核心逻辑：
  - `src/orders/orders.service.spec.ts`：覆盖下单、取消、删除订单与库存预占/释放的一致性
  - `src/payments/payments.service.spec.ts`：覆盖支付回调的幂等行为

> 这两组测试基于 `better-sqlite3` 内存库构建独立的 `DataSource`，验证业务不变量：  
> - 任意路径下 `reserved + sold <= total`  
> - 支付回调重复/乱序不会导致二次扣减或错误状态迁移

### 1.2 集成测试（E2E）

- `backend/test/app.e2e-spec.ts`：验证基础路由是否正常工作。
- `backend/test/orders-flow.e2e-spec.ts`：新增 **预订闭环 E2E 用例**：
  1. 使用种子用户 `customer01 / Cust123456` 登录获取 token
  2. 调用 `/api/orders` 创建订单
  3. 调用 `/api/payments/callback` 模拟支付回调
  4. 调用 `/api/orders/mine` 校验订单状态为 `PAID`

该用例串起了 **认证 → 下单 → 库存预占 → 支付回调 → 订单完结** 的完整链路，适合在面试中用来说明“如何验证业务闭环正确性”。

## 2. 契约与前后端对齐

- 在 `backend/contract/openapi-snippet.json` 中定义了公开酒店列表接口的简化 OpenAPI 片段：
  - 描述了请求参数（城市、关键词、分页）与响应数据结构（`data/page/pageSize/total`）
  - 移动端可据此约束自身的类型定义，避免“字段名/类型不一致”的低级错误
- 后续可以基于该片段：
  - 使用 `openapi-typescript` 生成 TS 类型
  - 在前端引入契约测试或运行时 schema 校验

## 3. 示例 CI 工作流

- 在 `backend/.github-workflows-example-ci.yml` 中提供了一个 GitHub Actions 示例：
  - 触发条件：针对 `backend/**` 的 Pull Request
  - 步骤：
    - 安装依赖：`npm ci`
    - 代码检查：`npm run lint`
    - 单元测试：`npm test`
    - E2E 测试：`npm run test:e2e`
    - 构建：`npm run build`

该工作流展示了**理想的 PR 检查流程**：每一次改动都要经过 lint + 单测 + E2E + build，确保不会在「能跑」的同时牺牲质量。

---

通过以上测试与 CI 补充，你可以在面试中不仅展示“写了测试”，还能系统说明：  
**测试金字塔结构 → 业务不变量如何被验证 → CI 中如何自动执行这些检查**。***
