# React Hooks 详解

Hooks 是 React 16.8 引入的特性，让函数组件也能使用状态和生命周期。

## 基础 Hooks

### useState

```tsx
import { useState } from 'react';

function Counter() {
  // 基本用法
  const [count, setCount] = useState(0);
  
  // 函数式更新 - 基于前一个状态
  const increment = () => setCount(prev => prev + 1);
  
  // 惰性初始化 - 只在首次渲染执行
  const [data, setData] = useState(() => {
    return expensiveComputation();
  });
  
  return (
    <button onClick={increment}>Count: {count}</button>
  );
}
```

:::warning 注意事项
- `setState` 是异步的，不会立即更新
- 对象/数组需要返回新引用才会触发重渲染
- 函数式更新适用于依赖前一个状态的场景
:::

### useEffect

```tsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // 副作用：数据获取
    let cancelled = false;
    
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      if (!cancelled) {
        setUser(data);
      }
    }
    
    fetchUser();
    
    // 清理函数
    return () => {
      cancelled = true;
    };
  }, [userId]); // 依赖数组
  
  return <div>{user?.name}</div>;
}
```

#### 依赖数组规则

```tsx
// 每次渲染都执行
useEffect(() => {
  console.log('每次渲染');
});

// 仅挂载时执行
useEffect(() => {
  console.log('挂载');
  return () => console.log('卸载');
}, []);

// 依赖变化时执行
useEffect(() => {
  console.log('userId 变化');
}, [userId]);
```

### useContext

```tsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// 2. 创建 Provider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 自定义 Hook (推荐)
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 4. 使用
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
    >
      Toggle Theme
    </button>
  );
}
```

## 性能优化 Hooks

### useMemo

```tsx
import { useMemo } from 'react';

function ExpensiveList({ items, filter }: { items: Item[]; filter: string }) {
  // 仅当 items 或 filter 变化时重新计算
  const filteredItems = useMemo(() => {
    console.log('计算过滤结果');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  // 缓存复杂对象，避免子组件不必要的重渲染
  const config = useMemo(() => ({
    pageSize: 10,
    showHeader: true,
  }), []);
  
  return (
    <ul>
      {filteredItems.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### useCallback

```tsx
import { useCallback, useState, memo } from 'react';

// 子组件使用 memo 包裹
const Button = memo(function Button({ 
  onClick, 
  children 
}: { 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  console.log('Button rendered');
  return <button onClick={onClick}>{children}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // 不使用 useCallback - 每次都创建新函数
  // const handleClick = () => setCount(c => c + 1);
  
  // 使用 useCallback - 函数引用稳定
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <Button onClick={handleClick}>Count: {count}</Button>
    </>
  );
}
```

:::tip 何时使用
- `useMemo`: 计算结果作为 props 传递，或计算成本高
- `useCallback`: 函数作为 props 传递给 `memo` 包裹的子组件
- 不要过度优化，先确认有性能问题再使用
:::

### useRef

```tsx
import { useRef, useEffect } from 'react';

function TextInput() {
  // 1. 访问 DOM 元素
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // 2. 存储可变值（不触发重渲染）
  const renderCount = useRef(0);
  renderCount.current += 1;
  
  // 3. 保存前一个值
  const prevValueRef = useRef<string>();
  const [value, setValue] = useState('');
  
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);
  
  return (
    <>
      <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />
      <p>Previous: {prevValueRef.current}</p>
      <p>Render count: {renderCount.current}</p>
    </>
  );
}
```

## 高级 Hooks

### useReducer

```tsx
import { useReducer } from 'react';

interface State {
  count: number;
  step: number;
}

type Action = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' };

const initialState: State = { count: 0, step: 1 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.payload };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <input 
        type="number" 
        value={state.step}
        onChange={e => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      />
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### useImperativeHandle

```tsx
import { useRef, useImperativeHandle, forwardRef } from 'react';

interface InputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const FancyInput = forwardRef<InputHandle, { placeholder?: string }>(
  function FancyInput(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus();
      },
      clear() {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      },
      getValue() {
        return inputRef.current?.value ?? '';
      }
    }), []);
    
    return <input ref={inputRef} placeholder={props.placeholder} />;
  }
);

// 使用
function Parent() {
  const inputRef = useRef<InputHandle>(null);
  
  return (
    <>
      <FancyInput ref={inputRef} placeholder="Enter text" />
      <button onClick={() => inputRef.current?.focus()}>Focus</button>
      <button onClick={() => inputRef.current?.clear()}>Clear</button>
    </>
  );
}
```

### useLayoutEffect

```tsx
import { useLayoutEffect, useRef, useState } from 'react';

function Tooltip({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // 在 DOM 更新后、浏览器绘制前同步执行
  // 适用于需要在绘制前读取/修改 DOM 的场景
  useLayoutEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2,
      });
    }
  }, []);
  
  return (
    <div ref={ref}>
      Hover me
      <div style={{ position: 'absolute', ...position }}>{text}</div>
    </div>
  );
}
```

:::warning useEffect vs useLayoutEffect
- `useEffect`: 异步执行，不阻塞绘制（大多数情况使用）
- `useLayoutEffect`: 同步执行，阻塞绘制（测量 DOM、防止闪烁）
:::

## 自定义 Hooks

### useLocalStorage

```tsx
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue] as const;
}

// 使用
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return (
    <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  );
}
```

### useDebounce

```tsx
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 使用
function Search() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    if (debouncedQuery) {
      // 执行搜索
      console.log('Searching:', debouncedQuery);
    }
  }, [debouncedQuery]);
  
  return (
    <input 
      value={query} 
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useFetch

```tsx
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [trigger, setTrigger] = useState(0);
  
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, [url, trigger]);
  
  const refetch = () => setTrigger(t => t + 1);
  
  return { data, loading, error, refetch };
}

// 使用
function UserList() {
  const { data, loading, error, refetch } = useFetch<User[]>('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {data?.map(user => <li key={user.id}>{user.name}</li>)}
      </ul>
    </>
  );
}
```

### useOnClickOutside

```tsx
import { useEffect, RefObject } from 'react';

function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 使用
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(ref, () => setIsOpen(false));
  
  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && <div>Dropdown content</div>}
    </div>
  );
}
```

## Hooks 规则

### 两条核心规则

1. **只在顶层调用 Hooks** - 不在循环、条件、嵌套函数中调用
2. **只在 React 函数组件/自定义 Hook 中调用**

```tsx
// ❌ 错误：条件语句中调用
function Bad({ condition }) {
  if (condition) {
    const [state, setState] = useState(0); // 错误！
  }
}

// ✅ 正确：顶层调用
function Good({ condition }) {
  const [state, setState] = useState(0);
  
  if (condition) {
    // 在这里使用 state
  }
}
```

### ESLint 插件

```bash
npm install eslint-plugin-react-hooks --save-dev
```

```json
{
  "plugins": ["react-hooks"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 总结

| Hook | 用途 | 使用场景 |
|------|------|----------|
| useState | 状态管理 | 简单状态 |
| useEffect | 副作用 | 数据获取、订阅、DOM 操作 |
| useContext | 跨层级通信 | 主题、用户信息、语言 |
| useMemo | 缓存计算结果 | 昂贵计算、引用稳定 |
| useCallback | 缓存函数 | 传递给 memo 组件的回调 |
| useRef | 可变引用 | DOM 引用、保存可变值 |
| useReducer | 复杂状态 | 多个关联状态、复杂更新逻辑 |
| useLayoutEffect | 同步副作用 | DOM 测量、防止闪烁 |
