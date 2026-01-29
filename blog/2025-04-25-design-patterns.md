---
slug: design-patterns-frontend
title: 设计模式在前端的应用
authors: mason
tags: [设计模式, 架构, JavaScript]
---

设计模式是解决常见问题的经典方案。本文介绍在前端开发中最实用的设计模式。

<!--truncate-->

## 🎯 为什么学习设计模式

```markdown
- 提供通用的解决方案
- 提高代码可维护性
- 便于团队沟通
- 理解框架源码
```

---

## 🏭 单例模式

确保一个类只有一个实例。

```typescript
// 基础实现
class Singleton {
  private static instance: Singleton;

  private constructor() {}

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

// 使用
const a = Singleton.getInstance();
const b = Singleton.getInstance();
console.log(a === b); // true
```

### 实际应用

```typescript
// 全局状态管理
class Store {
  private static instance: Store;
  private state: Record<string, any> = {};

  private constructor() {}

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  get(key: string) {
    return this.state[key];
  }

  set(key: string, value: any) {
    this.state[key] = value;
  }
}

// 模态框管理
class ModalManager {
  private static instance: ModalManager;
  private modals: Map<string, boolean> = new Map();

  static getInstance() {
    if (!ModalManager.instance) {
      ModalManager.instance = new ModalManager();
    }
    return ModalManager.instance;
  }

  open(id: string) {
    this.modals.set(id, true);
  }

  close(id: string) {
    this.modals.set(id, false);
  }
}
```

---

## 👀 观察者模式

定义对象间的一对多依赖，当一个对象改变时，所有依赖者都会收到通知。

```typescript
// 事件发射器
class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }

  once(event: string, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用
const emitter = new EventEmitter();

emitter.on('userLogin', (user) => {
  console.log(`${user.name} logged in`);
});

emitter.emit('userLogin', { name: 'John' });
```

### React 中的观察者

```tsx
// 自定义 Hook
function useObservable<T>(observable: Observable<T>) {
  const [value, setValue] = useState<T>();

  useEffect(() => {
    const subscription = observable.subscribe(setValue);
    return () => subscription.unsubscribe();
  }, [observable]);

  return value;
}
```

---

## 🎨 工厂模式

将对象创建逻辑封装，根据条件创建不同对象。

```typescript
// 简单工厂
interface Button {
  render(): void;
}

class PrimaryButton implements Button {
  render() {
    console.log('Rendering primary button');
  }
}

class SecondaryButton implements Button {
  render() {
    console.log('Rendering secondary button');
  }
}

class ButtonFactory {
  static create(type: 'primary' | 'secondary'): Button {
    switch (type) {
      case 'primary':
        return new PrimaryButton();
      case 'secondary':
        return new SecondaryButton();
      default:
        throw new Error(`Unknown button type: ${type}`);
    }
  }
}

// 使用
const button = ButtonFactory.create('primary');
button.render();
```

### React 组件工厂

```tsx
// 图标工厂
const icons = {
  home: HomeIcon,
  user: UserIcon,
  settings: SettingsIcon,
};

function IconFactory({ name, ...props }: { name: keyof typeof icons }) {
  const Icon = icons[name];
  return Icon ? <Icon {...props} /> : null;
}

// 表单控件工厂
const formControls = {
  text: TextInput,
  select: SelectInput,
  checkbox: CheckboxInput,
};

function FormField({ type, ...props }: { type: keyof typeof formControls }) {
  const Control = formControls[type];
  return <Control {...props} />;
}
```

---

## 🎭 策略模式

定义一系列算法，将每个算法封装起来，使它们可以互换。

```typescript
// 表单验证策略
interface ValidationStrategy {
  validate(value: string): boolean;
  message: string;
}

const strategies: Record<string, ValidationStrategy> = {
  required: {
    validate: (value) => value.length > 0,
    message: '此字段必填',
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: '请输入有效的邮箱',
  },
  minLength: {
    validate: (value) => value.length >= 6,
    message: '长度至少 6 个字符',
  },
};

class Validator {
  private rules: string[] = [];

  addRule(rule: string) {
    this.rules.push(rule);
    return this;
  }

  validate(value: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of this.rules) {
      const strategy = strategies[rule];
      if (strategy && !strategy.validate(value)) {
        errors.push(strategy.message);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

// 使用
const validator = new Validator()
  .addRule('required')
  .addRule('email');

console.log(validator.validate('test@example.com'));
```

### 价格计算策略

```typescript
type PriceStrategy = (price: number) => number;

const priceStrategies: Record<string, PriceStrategy> = {
  normal: (price) => price,
  member: (price) => price * 0.9,
  vip: (price) => price * 0.8,
  superVip: (price) => price * 0.7,
};

function calculatePrice(price: number, userType: string): number {
  const strategy = priceStrategies[userType] || priceStrategies.normal;
  return strategy(price);
}
```

---

## 🔌 适配器模式

将一个接口转换成另一个接口。

```typescript
// 旧的 API
class OldApi {
  request(url: string, callback: (data: any) => void) {
    // 回调形式
    setTimeout(() => callback({ data: 'old api' }), 100);
  }
}

// 适配器
class ApiAdapter {
  private oldApi: OldApi;

  constructor(oldApi: OldApi) {
    this.oldApi = oldApi;
  }

  // 转换为 Promise
  async fetch(url: string): Promise<any> {
    return new Promise((resolve) => {
      this.oldApi.request(url, resolve);
    });
  }
}

// 使用
const adapter = new ApiAdapter(new OldApi());
const data = await adapter.fetch('/api/users');
```

### 第三方库适配

```typescript
// 适配不同的存储
interface Storage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

class LocalStorageAdapter implements Storage {
  async get(key: string) {
    return localStorage.getItem(key);
  }
  async set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  async remove(key: string) {
    localStorage.removeItem(key);
  }
}

class IndexedDBAdapter implements Storage {
  // IndexedDB 实现
}

class AsyncStorageAdapter implements Storage {
  // React Native AsyncStorage 实现
}
```

---

## 🎁 装饰器模式

动态地给对象添加新功能。

```typescript
// 函数装饰器
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timer: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  } as T;
}

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  return function (...args: Parameters<T>) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

// 使用
const search = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
```

### TypeScript 装饰器

```typescript
// 方法装饰器
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}
```

---

## 🔗 代理模式

为对象提供一个代理，控制对原对象的访问。

```typescript
// 图片懒加载代理
class ImageProxy {
  private realImage: HTMLImageElement | null = null;
  private src: string;
  private placeholder: string;

  constructor(src: string, placeholder: string) {
    this.src = src;
    this.placeholder = placeholder;
  }

  display(container: HTMLElement) {
    // 先显示占位图
    const img = document.createElement('img');
    img.src = this.placeholder;
    container.appendChild(img);

    // 异步加载真实图片
    const realImg = new Image();
    realImg.onload = () => {
      img.src = this.src;
    };
    realImg.src = this.src;
  }
}

// 使用 Proxy 实现
const createReactiveObject = <T extends object>(obj: T, onChange: () => void) => {
  return new Proxy(obj, {
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      onChange();
      return result;
    },
  });
};
```

---

## 📋 模式选择

| 场景 | 推荐模式 |
|------|----------|
| 全局唯一实例 | 单例 |
| 事件处理 | 观察者 |
| 条件创建对象 | 工厂 |
| 算法替换 | 策略 |
| 接口转换 | 适配器 |
| 功能增强 | 装饰器 |
| 访问控制 | 代理 |

---

设计模式不是万能的，过度使用会增加复杂度。在合适的场景使用合适的模式。
