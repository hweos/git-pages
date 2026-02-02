# 前端测试入门

测试是保证代码质量的重要手段，本文介绍 Jest 和 Vitest 的使用。

## 为什么要测试

1. **保证质量** - 减少 bug，提高代码可靠性
2. **重构信心** - 有测试覆盖才敢大胆重构
3. **文档作用** - 测试即文档，展示代码用法
4. **设计驱动** - TDD 帮助设计更好的 API

## 测试类型

| 类型 | 说明 | 工具 |
|------|------|------|
| 单元测试 | 测试最小单元（函数/组件） | Jest, Vitest |
| 集成测试 | 测试模块间交互 | Jest, Vitest |
| E2E 测试 | 模拟用户操作 | Playwright, Cypress |

## Vitest 快速开始

### 安装

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 基础语法

### 测试结构

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // 清理
  });

  it('should add two numbers', () => {
    expect(calculator.add(1, 2)).toBe(3);
  });

  it('should subtract two numbers', () => {
    expect(calculator.subtract(5, 3)).toBe(2);
  });

  describe('division', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(6, 2)).toBe(3);
    });

    it('should throw on division by zero', () => {
      expect(() => calculator.divide(1, 0)).toThrow('Division by zero');
    });
  });
});
```

### 常用断言

```typescript
// 相等
expect(1 + 1).toBe(2);           // 严格相等 ===
expect({ a: 1 }).toEqual({ a: 1 });  // 深度相等

// 真假
expect(true).toBeTruthy();
expect(false).toBeFalsy();
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect(value).toBeDefined();

// 数字
expect(10).toBeGreaterThan(5);
expect(10).toBeGreaterThanOrEqual(10);
expect(5).toBeLessThan(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);  // 浮点数

// 字符串
expect('hello world').toContain('world');
expect('hello').toMatch(/ell/);

// 数组
expect([1, 2, 3]).toContain(2);
expect([1, 2, 3]).toHaveLength(3);
expect(['a', 'b']).toEqual(expect.arrayContaining(['a']));

// 对象
expect({ a: 1, b: 2 }).toHaveProperty('a');
expect({ a: 1, b: 2 }).toHaveProperty('a', 1);
expect({ a: 1 }).toMatchObject({ a: 1 });

// 异常
expect(() => throw new Error('error')).toThrow();
expect(() => throw new Error('error')).toThrow('error');
expect(() => throw new Error('error')).toThrow(Error);

// 否定
expect(1).not.toBe(2);
```

## 异步测试

### Promise

```typescript
// async/await
it('should fetch user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
});

// 返回 Promise
it('should fetch user', () => {
  return fetchUser(1).then(user => {
    expect(user.name).toBe('John');
  });
});

// resolves/rejects
it('should resolve with user', async () => {
  await expect(fetchUser(1)).resolves.toEqual({ name: 'John' });
});

it('should reject with error', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('Not found');
});
```

### 定时器

```typescript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should call callback after delay', () => {
  const callback = vi.fn();
  
  setTimeout(callback, 1000);
  
  expect(callback).not.toBeCalled();
  
  vi.advanceTimersByTime(1000);
  
  expect(callback).toBeCalled();
});
```

## Mock

### 函数 Mock

```typescript
import { vi } from 'vitest';

// 创建 mock 函数
const mockFn = vi.fn();

// 设置返回值
mockFn.mockReturnValue(42);
mockFn.mockReturnValueOnce(1).mockReturnValueOnce(2);

// 设置实现
mockFn.mockImplementation((a, b) => a + b);

// 断言调用
expect(mockFn).toBeCalled();
expect(mockFn).toBeCalledTimes(2);
expect(mockFn).toBeCalledWith(1, 2);
expect(mockFn).lastCalledWith(3, 4);

// 清除
mockFn.mockClear();  // 清除调用记录
mockFn.mockReset();  // 清除调用记录和返回值
```

### 模块 Mock

```typescript
// 自动 mock 整个模块
vi.mock('./api');

// 手动 mock
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'John' }),
  fetchPosts: vi.fn().mockResolvedValue([]),
}));

// 部分 mock
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    formatDate: vi.fn().mockReturnValue('2024-01-01'),
  };
});

// 使用
import { fetchUser } from './api';

it('should fetch user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('John');
  expect(fetchUser).toBeCalledWith(1);
});
```

### Spy

```typescript
const obj = {
  method: (a: number) => a * 2,
};

// 监视方法
const spy = vi.spyOn(obj, 'method');

obj.method(5);

expect(spy).toBeCalledWith(5);
expect(spy).toReturnWith(10);

// 替换实现
spy.mockImplementation((a) => a * 3);
expect(obj.method(5)).toBe(15);

// 恢复原始
spy.mockRestore();
```

## React 组件测试

### 安装

```bash
npm install -D @testing-library/react @testing-library/user-event
```

### 基础测试

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toBeCalledTimes(1);
  });

  it('should be disabled', () => {
    render(<Button disabled>Click me</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 查询方法

```typescript
// getBy - 找不到抛错
screen.getByText('Hello');
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');
screen.getByTestId('custom-element');

// queryBy - 找不到返回 null
screen.queryByText('Hello');

// findBy - 异步查找
await screen.findByText('Hello');  // 返回 Promise

// 多个元素
screen.getAllByRole('listitem');
screen.queryAllByRole('listitem');
await screen.findAllByRole('listitem');
```

### 用户交互

```tsx
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  const user = userEvent.setup();
  
  render(<LoginForm onSubmit={handleSubmit} />);
  
  // 输入
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  
  // 点击
  await user.click(screen.getByRole('button', { name: 'Login' }));
  
  expect(handleSubmit).toBeCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});

// 其他交互
await user.hover(element);
await user.unhover(element);
await user.selectOptions(select, ['option1']);
await user.upload(fileInput, file);
await user.keyboard('{Enter}');
await user.tab();
```

### 测试 Hooks

```tsx
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    expect(result.current.count).toBe(0);
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('should accept initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    expect(result.current.count).toBe(10);
  });
});
```

### 测试异步组件

```tsx
it('should fetch and display data', async () => {
  vi.mocked(fetchUser).mockResolvedValue({ name: 'John' });
  
  render(<UserProfile userId={1} />);
  
  // 等待加载完成
  expect(await screen.findByText('John')).toBeInTheDocument();
  
  // 或者
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

## 测试最佳实践

### AAA 模式

```typescript
it('should add item to cart', () => {
  // Arrange - 准备
  const cart = new Cart();
  const item = { id: 1, name: 'Product', price: 100 };
  
  // Act - 执行
  cart.addItem(item);
  
  // Assert - 断言
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(100);
});
```

### 测试行为而非实现

```tsx
// ❌ 测试实现细节
it('should set state', () => {
  const { result } = renderHook(() => useState(0));
  expect(result.current[0]).toBe(0);
});

// ✅ 测试行为
it('should display count when incremented', async () => {
  render(<Counter />);
  
  await user.click(screen.getByRole('button', { name: '+' }));
  
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 一个测试一个断言点

```typescript
// ❌ 多个不相关的断言
it('should work', () => {
  expect(add(1, 2)).toBe(3);
  expect(subtract(5, 3)).toBe(2);
  expect(multiply(2, 3)).toBe(6);
});

// ✅ 分开测试
it('should add numbers', () => {
  expect(add(1, 2)).toBe(3);
});

it('should subtract numbers', () => {
  expect(subtract(5, 3)).toBe(2);
});
```

### 使用 Test ID 作为最后手段

```tsx
// ✅ 优先使用语义化查询
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');
screen.getByText('Welcome');

// ⚠️ 次选
screen.getByTestId('submit-button');
```

## 覆盖率

```bash
# 生成覆盖率报告
npm run test:coverage
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## 总结

| 场景 | 建议 |
|------|------|
| 纯函数 | 直接测试输入输出 |
| 组件 | Testing Library + userEvent |
| Hooks | renderHook + act |
| 异步 | async/await + findBy |
| 外部依赖 | Mock |
| 定时器 | Fake Timers |
| 覆盖率 | 目标 80%，关注核心逻辑 |
