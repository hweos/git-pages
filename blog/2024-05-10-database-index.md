---
slug: database-index
title: 数据库索引优化实战指南
authors: mason
tags: [数据库, MySQL, 性能]
---

索引是数据库性能优化的关键。本文讲解索引原理、使用技巧和常见误区。

<!--truncate-->

## 📚 索引基础

### 什么是索引

索引就像书的目录，帮助数据库快速定位数据，避免全表扫描。

### 索引类型

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| B+Tree | 最常用，范围查询 | 主键、普通查询 |
| Hash | 精确匹配 | 等值查询 |
| Full-text | 全文搜索 | 文本搜索 |
| Spatial | 空间索引 | 地理位置 |

---

## 🌳 B+Tree 索引

### 结构特点

```
                    [50]
                   /    \
           [20,30]      [60,70]
          /   |   \    /   |   \
       [10] [25] [35] [55] [65] [80]
         ↓    ↓    ↓    ↓    ↓    ↓
       data data data data data data
```

- 非叶子节点只存索引
- 叶子节点存数据，形成链表
- 支持范围查询

### 聚簇索引 vs 非聚簇索引

```sql
-- 聚簇索引 (主键)
-- 叶子节点存储完整行数据
PRIMARY KEY (id)

-- 非聚簇索引 (二级索引)
-- 叶子节点存储主键值
INDEX idx_name (name)
```

**回表查询**：二级索引找到主键 → 主键索引找到数据

---

## 🔧 索引创建

### 单列索引

```sql
-- 创建索引
CREATE INDEX idx_email ON users(email);

-- 表定义时创建
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  INDEX idx_email (email)
);
```

### 复合索引

```sql
-- 多列索引
CREATE INDEX idx_name_age ON users(name, age);

-- 遵循最左前缀原则
WHERE name = 'John'                    -- ✅ 使用索引
WHERE name = 'John' AND age = 25       -- ✅ 使用索引
WHERE age = 25                         -- ❌ 不使用索引
WHERE age = 25 AND name = 'John'       -- ✅ 优化器会调整顺序
```

### 唯一索引

```sql
CREATE UNIQUE INDEX idx_email ON users(email);
```

### 前缀索引

```sql
-- 对长字符串的前 N 个字符创建索引
CREATE INDEX idx_email ON users(email(10));
```

---

## 📊 EXPLAIN 分析

### 使用方法

```sql
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';
```

### 关键字段

| 字段 | 说明 | 关注点 |
|------|------|--------|
| type | 访问类型 | const > eq_ref > ref > range > index > ALL |
| key | 使用的索引 | NULL 表示未使用索引 |
| rows | 预估扫描行数 | 越小越好 |
| Extra | 额外信息 | Using index, Using filesort |

### type 详解

```sql
-- ALL: 全表扫描 ❌
EXPLAIN SELECT * FROM users;

-- index: 全索引扫描
EXPLAIN SELECT id FROM users;

-- range: 范围扫描 ✅
EXPLAIN SELECT * FROM users WHERE age > 20;

-- ref: 非唯一索引等值查询 ✅
EXPLAIN SELECT * FROM users WHERE name = 'John';

-- eq_ref: 唯一索引等值查询 ✅✅
EXPLAIN SELECT * FROM users WHERE id = 1;

-- const: 主键/唯一索引常量查询 ✅✅✅
EXPLAIN SELECT * FROM users WHERE id = 1;
```

### Extra 关注点

```sql
-- Using index: 覆盖索引，不需要回表 ✅
-- Using where: 需要过滤 
-- Using temporary: 使用临时表 ⚠️
-- Using filesort: 需要额外排序 ⚠️
```

---

## ⚡ 优化技巧

### 1. 覆盖索引

```sql
-- 创建复合索引
CREATE INDEX idx_name_email ON users(name, email);

-- 查询只用索引中的列，无需回表
SELECT name, email FROM users WHERE name = 'John';
```

### 2. 避免索引失效

```sql
-- ❌ 对索引列使用函数
SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- ✅ 改为范围查询
SELECT * FROM users WHERE created_at >= '2024-01-01';

-- ❌ 隐式类型转换
SELECT * FROM users WHERE phone = 13800138000;  -- phone 是 varchar
-- ✅ 使用正确类型
SELECT * FROM users WHERE phone = '13800138000';

-- ❌ LIKE 左模糊
SELECT * FROM users WHERE name LIKE '%John';
-- ✅ 右模糊可以使用索引
SELECT * FROM users WHERE name LIKE 'John%';

-- ❌ OR 条件未全部有索引
SELECT * FROM users WHERE name = 'John' OR age = 25;  -- age 无索引
-- ✅ 使用 UNION
SELECT * FROM users WHERE name = 'John'
UNION
SELECT * FROM users WHERE age = 25;

-- ❌ 使用 != 或 NOT IN
SELECT * FROM users WHERE status != 'deleted';
```

### 3. 索引选择性

```sql
-- 选择性 = 不重复值数量 / 总行数
-- 选择性越高，索引效果越好

-- ✅ 高选择性 (email, phone)
-- ❌ 低选择性 (gender, status) - 不适合单独建索引
```

### 4. 复合索引顺序

```sql
-- 原则：
-- 1. 等值查询列在前
-- 2. 范围查询列在后
-- 3. 选择性高的列在前

-- 查询: WHERE status = 'active' AND created_at > '2024-01-01'
CREATE INDEX idx_status_created ON orders(status, created_at);
```

---

## 🚫 常见误区

### 1. 不是越多越好

```sql
-- 索引需要维护，INSERT/UPDATE/DELETE 会变慢
-- 建议每张表不超过 5-6 个索引
```

### 2. 小表不需要索引

```sql
-- 几百条数据的表，全表扫描可能更快
```

### 3. 注意索引合并

```sql
-- MySQL 可能合并多个单列索引
-- 但复合索引通常效率更高
```

---

## 🛠️ 实用命令

```sql
-- 查看表索引
SHOW INDEX FROM users;

-- 查看索引使用情况
SHOW STATUS LIKE 'Handler%';

-- 删除索引
DROP INDEX idx_email ON users;

-- 强制使用索引
SELECT * FROM users FORCE INDEX(idx_email) WHERE email = 'test@example.com';

-- 忽略索引
SELECT * FROM users IGNORE INDEX(idx_email) WHERE email = 'test@example.com';
```

---

## ✅ 索引设计清单

- [ ] 为 WHERE、JOIN、ORDER BY 列创建索引
- [ ] 使用复合索引优化多条件查询
- [ ] 注意最左前缀原则
- [ ] 利用覆盖索引减少回表
- [ ] 使用 EXPLAIN 分析查询
- [ ] 避免索引失效的写法
- [ ] 定期分析和优化索引
- [ ] 监控慢查询日志

---

索引优化是一个持续的过程。先分析业务场景，再设计索引，最后用 EXPLAIN 验证效果。
