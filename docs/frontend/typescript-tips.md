---
sidebar_position: 1
slug: typescript-tips
title: TypeScript 实战技巧
description: TypeScript 类型体操、工具类型与常见陷阱
---

# TypeScript 实战技巧

本文总结 TypeScript 开发中的实用技巧，帮助你写出更安全、更优雅的代码。

## 📚 基础类型技巧

### 类型推断

```typescript
// ✅ 让 TS 自动推断
const numbers = [1, 2, 3];  // number[]
const user = { name: 'Tom', age: 18 };  // { name: string; age: number }

// ✅ 使用 as const 获取字面量类型
const colors = ['red', 'green', 'blue'] as const;
// type: readonly ["red", "green", "blue"]

const config = {
  api: '/api',
  timeout: 3000
} as const;
// type: { readonly api: "/api"; readonly timeout: 3000 }
```

### 类型断言

```typescript
// 使用 as 断言
const input = document.getElementById('input') as HTMLInputElement;
input.value = 'hello';

// 非空断言 (谨慎使用)
function process(value: string | null) {
  console.log(value!.toUpperCase());  // 确定不为 null
}

// 更安全的方式
function processSafe(value: string | null) {
  if (value) {
    console.log(value.toUpperCase());
  }
}
```

---

## 🔧 常用工具类型

### Partial & Required

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// 所有属性变为可选
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// 所有属性变为必选
type RequiredUser = Required<PartialUser>;
// { id: number; name: string; email: string }
```

### Pick & Omit

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// 选取部分属性
type UserInfo = Pick<User, 'id' | 'name' | 'email'>;
// { id: number; name: string; email: string }

// 排除部分属性
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string }
```

### Record

```typescript
// 创建键值对类型
type Status = 'pending' | 'success' | 'error';
type StatusMap = Record<Status, string>;

const statusText: StatusMap = {
  pending: '处理中',
  success: '成功',
  error: '失败'
};
```

### ReturnType & Parameters

```typescript
function fetchUser(id: number): Promise<User> {
  return fetch(`/api/user/${id}`).then(r => r.json());
}

// 获取函数返回类型
type FetchUserReturn = ReturnType<typeof fetchUser>;
// Promise<User>

// 获取函数参数类型
type FetchUserParams = Parameters<typeof fetchUser>;
// [id: number]
```

---

## 🎯 类型体操实战

### 从数组提取类型

```typescript
const fruits = ['apple', 'banana', 'orange'] as const;
type Fruit = typeof fruits[number];
// 'apple' | 'banana' | 'orange'
```

### 获取对象的键/值类型

```typescript
const userMap = {
  admin: { role: 'admin', level: 10 },
  guest: { role: 'guest', level: 1 }
};

type UserKey = keyof typeof userMap;  // 'admin' | 'guest'
type UserValue = typeof userMap[UserKey];  // { role: string; level: number }
```

### 条件类型

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;  // true
type B = IsString<123>;      // false

// 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type C = UnwrapPromise<Promise<string>>;  // string
type D = UnwrapPromise<number>;           // number
```

### 模板字面量类型

```typescript
type EventName = 'click' | 'focus' | 'blur';
type Handler = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/api/${string}`;
type Request = `${HTTPMethod} ${Endpoint}`;
// 'GET /api/...' | 'POST /api/...' | ...
```

---

## ⚠️ 常见陷阱

### 1. 对象字面量的多余属性检查

```typescript
interface Config {
  url: string;
  timeout: number;
}

// ❌ 报错：多余的属性
const config: Config = {
  url: '/api',
  timeout: 3000,
  retry: 3  // Error!
};

// ✅ 使用变量绕过检查
const options = { url: '/api', timeout: 3000, retry: 3 };
const config2: Config = options;  // OK
```

### 2. 类型收窄

```typescript
function process(value: string | number) {
  // ❌ 错误
  // value.toUpperCase();  // Error!
  
  // ✅ 正确：先检查类型
  if (typeof value === 'string') {
    value.toUpperCase();  // OK
  }
}
```

### 3. 数组方法的类型问题

```typescript
const arr = [1, 2, 3];

// ❌ find 可能返回 undefined
const found = arr.find(x => x > 2);
// found: number | undefined

// ✅ 使用非空断言或条件判断
const found2 = arr.find(x => x > 2)!;  // number
// 或
if (found !== undefined) {
  console.log(found * 2);
}
```

### 4. 泛型约束

```typescript
// ❌ 过于宽松
function getLength<T>(value: T) {
  return value.length;  // Error: length 不存在
}

// ✅ 添加约束
function getLength<T extends { length: number }>(value: T) {
  return value.length;  // OK
}

getLength('hello');   // 5
getLength([1, 2, 3]); // 3
```

---

## 💡 最佳实践

### 1. 优先使用 interface

```typescript
// ✅ 推荐：可扩展
interface User {
  name: string;
}

interface User {
  age: number;  // 声明合并
}

// type 不能声明合并
```

### 2. 使用 unknown 替代 any

```typescript
// ❌ any 跳过类型检查
function process(value: any) {
  value.foo.bar;  // 不报错，但运行时可能出错
}

// ✅ unknown 强制类型检查
function processSafe(value: unknown) {
  if (typeof value === 'object' && value !== null) {
    // 安全操作
  }
}
```

### 3. 使用 satisfies 操作符

```typescript
// TypeScript 4.9+
const palette = {
  red: [255, 0, 0],
  green: '#00ff00'
} satisfies Record<string, string | number[]>;

// palette.red 仍然是 number[] 类型，而不是 string | number[]
palette.red.map(x => x * 2);  // OK
```

---

## 📚 推荐资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
