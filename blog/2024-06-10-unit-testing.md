---
slug: unit-testing-guide
title: 单元测试入门指南
authors: mason
tags: [测试, Jest, 代码质量]
---

单元测试是保证代码质量的重要手段。本文介绍 Jest 的使用方法和测试最佳实践。

<!--truncate-->

## 🎯 为什么需要单元测试

| 收益 | 说明 |
|------|------|
| 保证正确性 | 验证代码按预期工作 |
| 防止回归 | 修改代码时发现破坏 |
| 文档作用 | 测试即文档 |
| 改进设计 | 可测试的代码通常设计更好 |
| 重构信心 | 有测试保护，大胆重构 |

---

## 🚀 Jest 快速开始

### 安装

```bash
npm install -D jest @types/jest ts-jest
```

### 配置

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
```

### 第一个测试

```javascript
// sum.ts
export function sum(a: number, b: number): number {
  return a + b;
}

// sum.test.ts
import { sum } from './sum';

describe('sum', () => {
  it('should add two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });

  it('should handle negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });
});
```

### 运行测试

```bash
npx jest
npx jest --watch        # 监听模式
npx jest --coverage     # 覆盖率报告
```

---

## 📝 常用断言

### 基础断言

```javascript
// 相等
expect(value).toBe(3);           // 严格相等 ===
expect(obj).toEqual({ a: 1 });   // 深度相等

// 真假
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// 数字
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3);  // 浮点数
```

### 字符串

```javascript
expect(str).toMatch(/regex/);
expect(str).toContain('hello');
expect(str).toHaveLength(5);
```

### 数组

```javascript
expect(arr).toContain('item');
expect(arr).toHaveLength(3);
expect(arr).toEqual(expect.arrayContaining([1, 2]));
```

### 对象

```javascript
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ a: 1 });
```

### 异常

```javascript
expect(() => {
  throw new Error('error');
}).toThrow();

expect(() => {
  throw new Error('specific error');
}).toThrow('specific error');
```

---

## 🔄 异步测试

### Promise

```javascript
// 返回 Promise
it('fetches data', () => {
  return fetchData().then(data => {
    expect(data).toBe('data');
  });
});

// async/await
it('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBe('data');
});
```

### 回调

```javascript
it('calls callback', done => {
  fetchData(data => {
    expect(data).toBe('data');
    done();
  });
});
```

### 定时器

```javascript
jest.useFakeTimers();

it('waits 1 second', () => {
  const callback = jest.fn();
  
  setTimeout(callback, 1000);
  
  expect(callback).not.toBeCalled();
  
  jest.advanceTimersByTime(1000);
  
  expect(callback).toBeCalled();
});
```

---

## 🎭 Mock 技术

### Mock 函数

```javascript
const mockFn = jest.fn();

mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Mock 返回值

```javascript
const mockFn = jest.fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second');

mockFn(); // 'first'
mockFn(); // 'second'
mockFn(); // 'default'
```

### Mock 模块

```javascript
// 自动 Mock
jest.mock('./api');

// 手动 Mock
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ name: 'John' }),
}));

// 部分 Mock
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn(),
}));
```

### Mock 实现

```javascript
const mockFn = jest.fn().mockImplementation((a, b) => a + b);

// 或
const mockFn = jest.fn((a, b) => a + b);
```

---

## 🧪 测试组织

### describe 分组

```javascript
describe('User', () => {
  describe('create', () => {
    it('creates user with valid data', () => {});
    it('throws error with invalid email', () => {});
  });

  describe('update', () => {
    it('updates user name', () => {});
    it('updates user email', () => {});
  });
});
```

### 生命周期

```javascript
describe('Database', () => {
  beforeAll(async () => {
    // 所有测试前执行一次
    await db.connect();
  });

  afterAll(async () => {
    // 所有测试后执行一次
    await db.disconnect();
  });

  beforeEach(() => {
    // 每个测试前执行
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // 每个测试后执行
    await db.cleanup();
  });
});
```

---

## 📊 覆盖率

### 指标说明

| 指标 | 说明 |
|------|------|
| Statements | 语句覆盖率 |
| Branches | 分支覆盖率 (if/else) |
| Functions | 函数覆盖率 |
| Lines | 行覆盖率 |

### 查看报告

```bash
npx jest --coverage

# 生成 HTML 报告
# 打开 coverage/lcov-report/index.html
```

---

## ✅ 最佳实践

### 1. 测试命名

```javascript
// ✅ 好的命名
it('should return user when id is valid', () => {});
it('should throw error when email is invalid', () => {});

// ❌ 不好的命名
it('test 1', () => {});
it('works', () => {});
```

### 2. AAA 模式

```javascript
it('calculates total price', () => {
  // Arrange - 准备
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act - 执行
  const total = calculateTotal(items);
  
  // Assert - 断言
  expect(total).toBe(30);
});
```

### 3. 一个测试一个断言

```javascript
// ✅ 单一职责
it('validates email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

it('rejects invalid email', () => {
  expect(isValidEmail('invalid')).toBe(false);
});

// ⚠️ 多个断言时确保相关
it('creates user correctly', () => {
  const user = createUser({ name: 'John', age: 25 });
  expect(user.name).toBe('John');
  expect(user.age).toBe(25);
  expect(user.id).toBeDefined();
});
```

### 4. 避免测试实现细节

```javascript
// ❌ 测试实现
it('calls internal method', () => {
  const user = new User();
  const spy = jest.spyOn(user, '_privateMethod');
  user.save();
  expect(spy).toHaveBeenCalled();
});

// ✅ 测试行为
it('saves user to database', async () => {
  const user = new User({ name: 'John' });
  await user.save();
  expect(await db.findUser(user.id)).toBeDefined();
});
```

---

## 🛠️ React 测试

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    fireEvent.click(screen.getByText('Click'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📚 推荐资源

- [Jest 官方文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)

---

测试是一种习惯，从小项目开始培养。写测试的时间，远比修 Bug 的时间少。
