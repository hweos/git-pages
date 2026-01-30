# 数据库设计基础

数据库设计是后端开发的核心能力，良好的设计决定了系统的性能和可维护性。

## 设计流程

1. **需求分析** - 理解业务需求
2. **概念设计** - 绘制 ER 图
3. **逻辑设计** - 转换为表结构
4. **物理设计** - 索引、分区优化
5. **实施维护** - 建表、迁移、优化

## 范式理论

### 第一范式 (1NF)

**每列都是原子性的，不可再分。**

```sql
-- ❌ 不符合 1NF
CREATE TABLE orders (
  id INT,
  products VARCHAR(255)  -- '手机,电脑,耳机'
);

-- ✅ 符合 1NF
CREATE TABLE orders (
  id INT PRIMARY KEY
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT
);
```

### 第二范式 (2NF)

**满足 1NF，且非主键列完全依赖于主键（消除部分依赖）。**

```sql
-- ❌ 不符合 2NF（复合主键场景）
CREATE TABLE order_items (
  order_id INT,
  product_id INT,
  product_name VARCHAR(100),  -- 只依赖 product_id
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);

-- ✅ 符合 2NF - 拆分
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE order_items (
  order_id INT,
  product_id INT,
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);
```

### 第三范式 (3NF)

**满足 2NF，且非主键列之间没有传递依赖。**

```sql
-- ❌ 不符合 3NF
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  dept_id INT,
  dept_name VARCHAR(100),  -- 依赖 dept_id，不是直接依赖主键
  dept_location VARCHAR(100)
);

-- ✅ 符合 3NF - 拆分
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100)
);

CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  dept_id INT,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);
```

### 反范式化

有时为了性能，适当违反范式：

```sql
-- 冗余字段，避免 JOIN
CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  user_name VARCHAR(100),  -- 冗余，便于查询
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP
);
```

## 表结构设计

### 命名规范

```sql
-- 表名：小写下划线，复数形式
users, order_items, user_addresses

-- 字段名：小写下划线
user_id, created_at, is_deleted

-- 索引名：idx_表名_字段名
idx_users_email, idx_orders_user_id_created_at

-- 外键名：fk_当前表_关联表
fk_orders_users
```

### 通用字段

```sql
CREATE TABLE users (
  -- 主键
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- 业务字段
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- 状态字段
  status TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
  
  -- 软删除
  is_deleted TINYINT DEFAULT 0,
  deleted_at TIMESTAMP NULL,
  
  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 索引
  UNIQUE KEY uk_email (email),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 数据类型选择

| 类型 | 场景 | 说明 |
|------|------|------|
| BIGINT | 主键、ID | 8 字节，推荐无符号 |
| INT | 数量、计数 | 4 字节 |
| TINYINT | 状态、布尔 | 1 字节，0-255 |
| DECIMAL(M,D) | 金额 | 精确计算 |
| VARCHAR(N) | 变长字符串 | N 为最大字符数 |
| TEXT | 长文本 | 不参与索引 |
| TIMESTAMP | 时间 | 4 字节，自动时区转换 |
| DATETIME | 时间 | 8 字节，原样存储 |
| JSON | JSON 数据 | MySQL 5.7+ |

### 字段设计原则

```sql
-- 1. 字段尽量 NOT NULL
name VARCHAR(100) NOT NULL DEFAULT ''

-- 2. 使用合适的长度
phone VARCHAR(20)      -- 不要 VARCHAR(255)
status TINYINT         -- 不要 INT

-- 3. 金额使用 DECIMAL
price DECIMAL(10, 2)   -- 不要 FLOAT/DOUBLE

-- 4. 时间用 TIMESTAMP 或 DATETIME
created_at TIMESTAMP   -- 有时区需求
birth_date DATE        -- 纯日期

-- 5. 布尔用 TINYINT
is_active TINYINT(1) DEFAULT 1

-- 6. 枚举考虑用 TINYINT + 注释
status TINYINT COMMENT '1:待支付 2:已支付 3:已发货 4:已完成 5:已取消'
```

## 关系设计

### 一对一 (1:1)

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username VARCHAR(50) NOT NULL
);

-- 用户详情表（拆分大字段）
CREATE TABLE user_profiles (
  user_id BIGINT PRIMARY KEY,
  bio TEXT,
  avatar_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 一对多 (1:N)

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100)
);

-- 订单表
CREATE TABLE orders (
  id BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  total_amount DECIMAL(10, 2),
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_user_id (user_id)
);
```

### 多对多 (M:N)

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  name VARCHAR(100)
);

-- 角色表
CREATE TABLE roles (
  id BIGINT PRIMARY KEY,
  name VARCHAR(50)
);

-- 关联表
CREATE TABLE user_roles (
  user_id BIGINT,
  role_id BIGINT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

## 索引设计

### 索引类型

```sql
-- 主键索引
PRIMARY KEY (id)

-- 唯一索引
UNIQUE KEY uk_email (email)

-- 普通索引
KEY idx_name (name)

-- 复合索引
KEY idx_user_created (user_id, created_at)

-- 前缀索引
KEY idx_title (title(20))

-- 全文索引
FULLTEXT KEY ft_content (content)
```

### 索引原则

```sql
-- 1. 为 WHERE/ORDER BY/JOIN 的字段建索引
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at;
-- 需要索引: (user_id, created_at)

-- 2. 复合索引注意顺序（最左前缀）
KEY idx_a_b_c (a, b, c)
-- 可用: WHERE a=1, WHERE a=1 AND b=2, WHERE a=1 AND b=2 AND c=3
-- 不可用: WHERE b=2, WHERE c=3

-- 3. 选择性高的字段优先
-- email 选择性高，status 选择性低
KEY idx_email_status (email, status)  -- ✅
KEY idx_status_email (status, email)  -- ❌

-- 4. 覆盖索引
SELECT user_id, created_at FROM orders WHERE user_id = 1;
KEY idx_user_created (user_id, created_at)
-- 可直接从索引获取数据，无需回表
```

### 索引失效场景

```sql
-- 1. 函数操作
❌ WHERE YEAR(created_at) = 2024
✅ WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

-- 2. 隐式类型转换
❌ WHERE phone = 13800138000  -- phone 是 VARCHAR
✅ WHERE phone = '13800138000'

-- 3. 前导模糊查询
❌ WHERE name LIKE '%tom%'
✅ WHERE name LIKE 'tom%'

-- 4. OR 条件（部分）
❌ WHERE user_id = 1 OR status = 1  -- 如果 status 没索引
✅ WHERE user_id = 1 
   UNION
   WHERE status = 1

-- 5. NOT IN / NOT EXISTS
❌ WHERE status NOT IN (1, 2)
✅ WHERE status IN (0, 3, 4, 5)

-- 6. 范围查询后的列
idx_a_b_c (a, b, c)
WHERE a = 1 AND b > 10 AND c = 100  -- c 用不到索引
```

## 实战案例

### 电商订单系统

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_email (email),
  UNIQUE KEY uk_username (username),
  KEY idx_phone (phone)
) ENGINE=InnoDB;

-- 收货地址
CREATE TABLE user_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  receiver_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province VARCHAR(50),
  city VARCHAR(50),
  district VARCHAR(50),
  address VARCHAR(255) NOT NULL,
  is_default TINYINT DEFAULT 0,
  KEY idx_user_id (user_id)
) ENGINE=InnoDB;

-- 商品分类
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED DEFAULT 0,
  name VARCHAR(100) NOT NULL,
  level TINYINT NOT NULL,
  sort_order INT DEFAULT 0,
  KEY idx_parent (parent_id)
) ENGINE=InnoDB;

-- 商品
CREATE TABLE products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT UNSIGNED DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_category (category_id),
  KEY idx_status_created (status, created_at)
) ENGINE=InnoDB;

-- 订单
CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(32) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  status TINYINT DEFAULT 1 COMMENT '1:待支付 2:已支付 3:已发货 4:已完成 5:已取消',
  total_amount DECIMAL(10, 2) NOT NULL,
  pay_amount DECIMAL(10, 2),
  receiver_name VARCHAR(50),
  receiver_phone VARCHAR(20),
  receiver_address VARCHAR(500),
  pay_time TIMESTAMP NULL,
  ship_time TIMESTAMP NULL,
  complete_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_status (user_id, status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB;

-- 订单项
CREATE TABLE order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  KEY idx_order (order_id),
  KEY idx_product (product_id)
) ENGINE=InnoDB;

-- 支付记录
CREATE TABLE payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  payment_no VARCHAR(64),
  channel VARCHAR(20) COMMENT 'alipay/wechat/card',
  amount DECIMAL(10, 2) NOT NULL,
  status TINYINT DEFAULT 0 COMMENT '0:待支付 1:成功 2:失败',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_order (order_id),
  UNIQUE KEY uk_payment_no (payment_no)
) ENGINE=InnoDB;
```

### 查询优化示例

```sql
-- 用户订单列表（带分页）
SELECT 
  o.id,
  o.order_no,
  o.status,
  o.total_amount,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 123
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10 OFFSET 0;

-- 需要索引: orders(user_id, created_at), order_items(order_id)

-- 销量排行
SELECT 
  p.id,
  p.name,
  SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN (2, 3, 4)  -- 已支付及之后状态
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id
ORDER BY total_sold DESC
LIMIT 10;
```

## 常见问题

### 主键选择

```sql
-- 自增主键（推荐）
id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY

-- UUID（分布式场景）
id CHAR(36) PRIMARY KEY
-- 或使用有序 UUID
id BINARY(16) PRIMARY KEY

-- 雪花算法（分布式有序）
id BIGINT PRIMARY KEY
```

### 软删除

```sql
-- 方案 1: 标记字段
is_deleted TINYINT DEFAULT 0
deleted_at TIMESTAMP NULL

-- 方案 2: 状态字段
status TINYINT COMMENT '...-1:已删除'

-- 查询时过滤
SELECT * FROM users WHERE is_deleted = 0;
```

### 大表优化

```sql
-- 分表（按时间）
orders_2024_01, orders_2024_02, ...

-- 分表（按 ID 取模）
orders_0, orders_1, orders_2, orders_3

-- 归档历史数据
INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < '2023-01-01';
DELETE FROM orders WHERE created_at < '2023-01-01';
```

## 总结

| 原则 | 说明 |
|------|------|
| 适度范式化 | 通常遵循 3NF，适当反范式 |
| 合适的类型 | 选择最小满足需求的类型 |
| NOT NULL | 尽量避免 NULL |
| 索引优化 | 针对查询建立合适索引 |
| 分表策略 | 大表提前规划分表方案 |
| 软删除 | 重要数据不物理删除 |
| 审计字段 | created_at, updated_at |
