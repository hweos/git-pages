---
slug: state-management
title: React 状态管理方案对比
authors: mason
tags: [React, 状态管理, Redux, Zustand]
---

React 状态管理方案众多，如何选择？本文对比主流方案的优缺点和适用场景。

<!--truncate-->

## 🎯 方案概览

| 方案 | 包大小 | 学习曲线 | 适用场景 |
|------|--------|----------|----------|
| React Context | 内置 | 低 | 简单状态 |
| Redux Toolkit | ~11kb | 中 | 大型应用 |
| Zustand | ~1kb | 低 | 中小型应用 |
| Jotai | ~2kb | 低 | 原子化状态 |
| Recoil | ~20kb | 中 | 复杂依赖 |

---

## 📦 React Context

### 基本使用

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 定义类型
interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// 创建 Context
const AuthContext = createContext<AuthState | null>(null);

// Provider 组件
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### 优化重渲染

```tsx
// 拆分 Context
const UserContext = createContext<User | null>(null);
const UserActionsContext = createContext<{
  login: (user: User) => void;
  logout: () => void;
} | null>(null);

// 使用 useMemo 优化
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const actions = useMemo(() => ({
    login: (user: User) => setUser(user),
    logout: () => setUser(null),
  }), []);

  return (
    <UserContext.Provider value={user}>
      <UserActionsContext.Provider value={actions}>
        {children}
      </UserActionsContext.Provider>
    </UserContext.Provider>
  );
}
```

### 优缺点

```markdown
✅ 优点：
- 内置，无需额外依赖
- 简单易用
- 适合主题、语言等低频更新状态

❌ 缺点：
- 无法选择性订阅
- 性能优化需要手动处理
- 不适合频繁更新的状态
```

---

## 🔧 Redux Toolkit

### 基本使用

```tsx
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';

// 创建 Slice
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// 创建 Store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// 类型化 Hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) => 
  useSelector(selector);

// 使用
function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

### 异步操作 (createAsyncThunk)

```tsx
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// 异步 Action
export const fetchUser = createAsyncThunk(
  'user/fetch',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null as User | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed';
      });
  },
});
```

### 优缺点

```markdown
✅ 优点：
- 成熟稳定，生态丰富
- DevTools 强大
- 适合大型团队协作
- RTK Query 处理数据获取

❌ 缺点：
- 样板代码较多
- 学习曲线较陡
- 包体积较大
```

---

## 🐻 Zustand

### 基本使用

```tsx
import { create } from 'zustand';

interface BearState {
  bears: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  decrease: () => set((state) => ({ bears: state.bears - 1 })),
  reset: () => set({ bears: 0 }),
}));

// 使用
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);

  return (
    <div>
      <span>{bears} bears</span>
      <button onClick={increase}>Add bear</button>
    </div>
  );
}
```

### 异步操作

```tsx
const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  
  fetchUser: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users/${id}`);
      const user = await res.json();
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 持久化

```tsx
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

### 优缺点

```markdown
✅ 优点：
- 极简 API，学习成本低
- 包体积小 (~1kb)
- 无需 Provider
- 选择性订阅，性能好

❌ 缺点：
- DevTools 功能较弱
- 生态不如 Redux 丰富
```

---

## ⚛️ Jotai

### 基本使用

```tsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 创建原子
const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 使用
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);

  return (
    <div>
      <span>{count} (double: {doubleCount})</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
}
```

### 派生原子

```tsx
const usersAtom = atom<User[]>([]);
const userCountAtom = atom((get) => get(usersAtom).length);
const activeUsersAtom = atom((get) => 
  get(usersAtom).filter((u) => u.active)
);

// 可写派生原子
const uppercaseAtom = atom(
  (get) => get(textAtom).toUpperCase(),
  (get, set, newValue: string) => {
    set(textAtom, newValue.toLowerCase());
  }
);
```

### 异步原子

```tsx
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

function User() {
  const user = useAtomValue(userAtom); // 自动 Suspense
  return <div>{user.name}</div>;
}

// 配合 Suspense
<Suspense fallback={<Loading />}>
  <User />
</Suspense>
```

### 优缺点

```markdown
✅ 优点：
- 原子化，细粒度更新
- 与 Suspense 配合好
- 派生状态简洁
- TypeScript 友好

❌ 缺点：
- 原子太多时管理复杂
- Debug 不如 Redux 方便
```

---

## 🔍 如何选择

### 决策流程

```markdown
1. 状态简单，更新不频繁？
   → React Context

2. 需要强大的 DevTools 和中间件？
   → Redux Toolkit

3. 追求简洁和小体积？
   → Zustand

4. 需要原子化和派生状态？
   → Jotai

5. 需要异步依赖和数据流？
   → Recoil 或 Jotai
```

### 场景推荐

| 场景 | 推荐方案 |
|------|----------|
| 主题/语言切换 | Context |
| 用户认证状态 | Zustand / Context |
| 复杂表单状态 | Jotai |
| 大型企业应用 | Redux Toolkit |
| 中小型应用 | Zustand |
| 服务端数据缓存 | React Query + 简单状态管理 |

---

## 💡 最佳实践

### 1. 分离服务端和客户端状态

```tsx
// 服务端状态用 React Query
const { data: user } = useQuery(['user', id], fetchUser);

// 客户端状态用 Zustand
const { theme, setTheme } = useThemeStore();
```

### 2. 按领域拆分 Store

```tsx
// 不要一个巨大的 Store
// 按功能拆分
const useAuthStore = create(...);
const useCartStore = create(...);
const useUIStore = create(...);
```

### 3. 选择性订阅

```tsx
// ❌ 订阅整个 store
const store = useBearStore();

// ✅ 只订阅需要的部分
const bears = useBearStore((state) => state.bears);
```

---

没有银弹，选择适合项目规模和团队的方案最重要。
