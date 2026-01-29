---
slug: functional-programming
title: 函数式编程实践
authors: mason
tags: [函数式编程, JavaScript, 编程范式]
---

函数式编程让代码更简洁、可预测。本文介绍 JavaScript 中的函数式编程核心概念和实践。

<!--truncate-->

## 🎯 函数式编程核心概念

| 概念 | 说明 |
|------|------|
| 纯函数 | 相同输入总是相同输出，无副作用 |
| 不可变性 | 数据不可修改，只能创建新数据 |
| 函数组合 | 将小函数组合成复杂功能 |
| 高阶函数 | 接收或返回函数的函数 |
| 声明式 | 描述要做什么，而非怎么做 |

---

## ✨ 纯函数

### 什么是纯函数

```javascript
// ✅ 纯函数
function add(a, b) {
  return a + b;
}

function double(arr) {
  return arr.map(x => x * 2);
}

// ❌ 非纯函数
let total = 0;
function addToTotal(value) {
  total += value;  // 修改外部状态
  return total;
}

function getRandomNumber() {
  return Math.random();  // 不确定的输出
}

function logMessage(msg) {
  console.log(msg);  // 副作用
  return msg;
}
```

### 纯函数的好处

```markdown
- 可测试：相同输入相同输出
- 可缓存：结果可以被 memoize
- 可并行：无共享状态
- 可推理：易于理解
```

---

## 🔒 不可变性

### 避免修改数据

```javascript
// ❌ 修改原数组
function addItem(arr, item) {
  arr.push(item);
  return arr;
}

// ✅ 返回新数组
function addItem(arr, item) {
  return [...arr, item];
}

// ❌ 修改原对象
function updateUser(user, name) {
  user.name = name;
  return user;
}

// ✅ 返回新对象
function updateUser(user, name) {
  return { ...user, name };
}
```

### 深层更新

```javascript
const state = {
  user: {
    profile: {
      name: 'John',
      age: 25,
    },
  },
};

// 更新嵌套属性
const newState = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      name: 'Jane',
    },
  },
};

// 使用 immer 简化
import { produce } from 'immer';

const newState = produce(state, (draft) => {
  draft.user.profile.name = 'Jane';
});
```

---

## 🔧 高阶函数

### 函数作为参数

```javascript
// 内置高阶函数
const numbers = [1, 2, 3, 4, 5];

numbers.map(x => x * 2);        // [2, 4, 6, 8, 10]
numbers.filter(x => x > 2);     // [3, 4, 5]
numbers.reduce((a, b) => a + b); // 15
numbers.find(x => x > 3);       // 4
numbers.every(x => x > 0);      // true
numbers.some(x => x > 4);       // true
```

### 函数作为返回值

```javascript
// 柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6
curriedAdd(1)(2, 3);    // 6
```

### 偏函数应用

```javascript
function partial(fn, ...presetArgs) {
  return function (...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

const multiply = (a, b) => a * b;
const double = partial(multiply, 2);
const triple = partial(multiply, 3);

double(5);  // 10
triple(5);  // 15
```

---

## 🔗 函数组合

### compose 和 pipe

```javascript
// 从右到左执行
const compose = (...fns) => (x) =>
  fns.reduceRight((acc, fn) => fn(acc), x);

// 从左到右执行
const pipe = (...fns) => (x) =>
  fns.reduce((acc, fn) => fn(acc), x);

// 示例
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const composed = compose(square, double, addOne);
composed(2);  // (2 + 1) * 2 = 6, 6 * 6 = 36

const piped = pipe(addOne, double, square);
piped(2);    // 同样结果
```

### 实际应用

```javascript
// 数据处理管道
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true },
];

const getActiveUsers = users => users.filter(u => u.active);
const getNames = users => users.map(u => u.name);
const sortNames = names => [...names].sort();
const formatList = names => names.join(', ');

const getActiveUserList = pipe(
  getActiveUsers,
  getNames,
  sortNames,
  formatList
);

getActiveUserList(users);  // "Bob, John"
```

---

## 📦 常用函数式工具

### map 实现

```javascript
const map = (fn) => (arr) => arr.map(fn);

const double = map(x => x * 2);
double([1, 2, 3]);  // [2, 4, 6]
```

### filter 实现

```javascript
const filter = (predicate) => (arr) => arr.filter(predicate);

const isEven = filter(x => x % 2 === 0);
isEven([1, 2, 3, 4]);  // [2, 4]
```

### reduce 实现

```javascript
const reduce = (fn, initial) => (arr) => arr.reduce(fn, initial);

const sum = reduce((a, b) => a + b, 0);
sum([1, 2, 3, 4]);  // 10
```

### 组合使用

```javascript
const processNumbers = pipe(
  filter(x => x > 0),
  map(x => x * 2),
  reduce((a, b) => a + b, 0)
);

processNumbers([-1, 1, 2, 3]);  // 12
```

---

## 🎭 函子和 Monad

### Maybe 函子

```javascript
class Maybe {
  constructor(value) {
    this.value = value;
  }

  static of(value) {
    return new Maybe(value);
  }

  isNothing() {
    return this.value === null || this.value === undefined;
  }

  map(fn) {
    return this.isNothing() ? this : Maybe.of(fn(this.value));
  }

  getOrElse(defaultValue) {
    return this.isNothing() ? defaultValue : this.value;
  }
}

// 安全的属性访问
const user = { profile: { name: 'John' } };

Maybe.of(user)
  .map(u => u.profile)
  .map(p => p.name)
  .getOrElse('Unknown');  // 'John'

Maybe.of(null)
  .map(u => u.profile)
  .map(p => p.name)
  .getOrElse('Unknown');  // 'Unknown'
```

### Either 函子

```javascript
class Either {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  static left(value) {
    return new Either(value, null);
  }

  static right(value) {
    return new Either(null, value);
  }

  map(fn) {
    return this.right !== null
      ? Either.right(fn(this.right))
      : this;
  }

  fold(leftFn, rightFn) {
    return this.right !== null
      ? rightFn(this.right)
      : leftFn(this.left);
  }
}

// 错误处理
function divide(a, b) {
  return b === 0
    ? Either.left('Cannot divide by zero')
    : Either.right(a / b);
}

divide(10, 2)
  .map(x => x * 2)
  .fold(
    error => console.log('Error:', error),
    result => console.log('Result:', result)
  );
```

---

## 📋 React 中的函数式

```tsx
// 纯组件
const UserCard = ({ name, avatar }: { name: string; avatar: string }) => (
  <div className="card">
    <img src={avatar} alt={name} />
    <h3>{name}</h3>
  </div>
);

// 组合 Hooks
const useUser = (id: string) => {
  const user = useQuery(['user', id], () => fetchUser(id));
  return user;
};

const useFormattedUser = (id: string) => {
  const user = useUser(id);
  return useMemo(() => formatUser(user.data), [user.data]);
};

// 高阶组件
const withLoading = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
    if (isLoading) return <Loading />;
    return <Component {...(props as P)} />;
  };
};
```

---

## ✅ 最佳实践

```markdown
1. 优先使用纯函数
2. 避免修改参数
3. 使用 const 和不可变数据
4. 将副作用隔离到边界
5. 使用小而专注的函数
6. 通过组合构建复杂功能
```

---

函数式编程不是全有或全无。在合适的地方使用函数式技术，可以让代码更清晰可维护。
