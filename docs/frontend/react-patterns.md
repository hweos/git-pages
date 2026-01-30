# React 组件设计模式

掌握常用设计模式，写出更优雅、可维护的 React 代码。

## 组合模式 (Compound Components)

将相关组件组合在一起，通过 Context 共享状态。

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// Context
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within Tabs');
  }
  return context;
}

// 父组件
interface TabsProps {
  defaultTab: string;
  children: ReactNode;
}

function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// 子组件
function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  
  return (
    <button
      className={`tab ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }: { children: ReactNode }) {
  return <div className="tab-panels">{children}</div>;
}

function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useTabs();
  
  if (activeTab !== id) return null;
  return <div className="tab-panel">{children}</div>;
}

// 组合导出
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用
function App() {
  return (
    <Tabs defaultTab="tab1">
      <Tabs.List>
        <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
        <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
        <Tabs.Tab id="tab3">Tab 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panels>
        <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
        <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
        <Tabs.Panel id="tab3">Content 3</Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## 渲染属性模式 (Render Props)

通过函数 prop 传递渲染逻辑，实现逻辑复用。

```tsx
import { useState, ReactNode } from 'react';

// 鼠标位置追踪器
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (position: MousePosition) => ReactNode;
}

function MouseTracker({ children }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  
  return (
    <div onMouseMove={handleMouseMove} style={{ height: '100vh' }}>
      {children(position)}
    </div>
  );
}

// 使用
function App() {
  return (
    <MouseTracker>
      {({ x, y }) => (
        <div>
          Mouse position: ({x}, {y})
        </div>
      )}
    </MouseTracker>
  );
}

// 更实用的例子：Toggle
interface ToggleProps {
  children: (props: {
    on: boolean;
    toggle: () => void;
    setOn: (on: boolean) => void;
  }) => ReactNode;
}

function Toggle({ children }: ToggleProps) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(prev => !prev);
  
  return <>{children({ on, toggle, setOn })}</>;
}

// 使用
function App() {
  return (
    <Toggle>
      {({ on, toggle }) => (
        <>
          <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
          {on && <div>Content is visible!</div>}
        </>
      )}
    </Toggle>
  );
}
```

## 高阶组件 (HOC)

函数接收组件，返回增强后的新组件。

```tsx
import { ComponentType, useEffect, useState } from 'react';

// withLoading HOC
interface WithLoadingProps {
  loading: boolean;
}

function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithLoading(props: P & WithLoadingProps) {
    const { loading, ...rest } = props;
    
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
    
    return <WrappedComponent {...(rest as P)} />;
  };
}

// withAuth HOC
interface User {
  id: string;
  name: string;
}

interface WithAuthProps {
  user: User | null;
}

function withAuth<P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>
) {
  return function WithAuth(props: Omit<P, 'user'>) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      // 模拟获取用户信息
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        });
    }, []);
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>Please login</div>;
    
    return <WrappedComponent {...(props as P)} user={user} />;
  };
}

// 使用
interface ProfileProps extends WithAuthProps {
  showEmail?: boolean;
}

function Profile({ user, showEmail }: ProfileProps) {
  return (
    <div>
      <h1>{user.name}</h1>
      {showEmail && <p>{user.email}</p>}
    </div>
  );
}

const ProtectedProfile = withAuth(Profile);

function App() {
  return <ProtectedProfile showEmail />;
}
```

:::tip HOC 注意事项
- 不要在 render 中创建 HOC
- 复制静态方法 (使用 hoist-non-react-statics)
- 传递 ref 需要使用 forwardRef
- 现代 React 更推荐使用 Hooks 替代 HOC
:::

## 容器/展示组件模式

分离数据逻辑和 UI 展示。

```tsx
// 展示组件 - 只负责 UI
interface UserListProps {
  users: User[];
  onUserClick: (user: User) => void;
  loading: boolean;
}

function UserList({ users, onUserClick, loading }: UserListProps) {
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// 容器组件 - 处理数据逻辑
function UserListContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);
  
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };
  
  return (
    <>
      <UserList 
        users={users} 
        onUserClick={handleUserClick}
        loading={loading}
      />
      {selectedUser && <UserDetail user={selectedUser} />}
    </>
  );
}
```

:::note 现代替代方案
现在更推荐使用自定义 Hooks 提取逻辑：

```tsx
function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);
  
  return { users, loading };
}

function UserPage() {
  const { users, loading } = useUsers();
  return <UserList users={users} loading={loading} />;
}
```
:::

## 受控与非受控组件

### 受控组件

```tsx
function ControlledInput() {
  const [value, setValue] = useState('');
  
  return (
    <input
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
```

### 非受控组件

```tsx
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = () => {
    console.log(inputRef.current?.value);
  };
  
  return (
    <>
      <input ref={inputRef} defaultValue="default" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

### 支持两种模式的组件

```tsx
interface InputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function FlexibleInput({ value, defaultValue, onChange }: InputProps) {
  // 判断是否受控
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  
  const currentValue = isControlled ? value : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };
  
  return <input value={currentValue} onChange={handleChange} />;
}

// 受控使用
function Controlled() {
  const [value, setValue] = useState('');
  return <FlexibleInput value={value} onChange={setValue} />;
}

// 非受控使用
function Uncontrolled() {
  return <FlexibleInput defaultValue="hello" onChange={console.log} />;
}
```

## State Reducer 模式

让使用者可以控制组件内部状态变化。

```tsx
import { useReducer, Reducer } from 'react';

// 状态和 Action 类型
interface ToggleState {
  on: boolean;
}

type ToggleAction = 
  | { type: 'toggle' }
  | { type: 'on' }
  | { type: 'off' };

// 默认 reducer
const defaultReducer: Reducer<ToggleState, ToggleAction> = (state, action) => {
  switch (action.type) {
    case 'toggle':
      return { on: !state.on };
    case 'on':
      return { on: true };
    case 'off':
      return { on: false };
    default:
      return state;
  }
};

// 组件
interface UseToggleProps {
  initialOn?: boolean;
  reducer?: Reducer<ToggleState, ToggleAction>;
}

function useToggle({ 
  initialOn = false, 
  reducer = defaultReducer 
}: UseToggleProps = {}) {
  const [{ on }, dispatch] = useReducer(reducer, { on: initialOn });
  
  return {
    on,
    toggle: () => dispatch({ type: 'toggle' }),
    setOn: () => dispatch({ type: 'on' }),
    setOff: () => dispatch({ type: 'off' }),
  };
}

// 使用 - 自定义 reducer 限制行为
function App() {
  // 最多只能点击 4 次
  const [clickCount, setClickCount] = useState(0);
  
  const customReducer: Reducer<ToggleState, ToggleAction> = (state, action) => {
    if (action.type === 'toggle' && clickCount >= 4) {
      return state; // 不改变状态
    }
    setClickCount(c => c + 1);
    return defaultReducer(state, action);
  };
  
  const { on, toggle } = useToggle({ reducer: customReducer });
  
  return (
    <div>
      <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
      <p>Clicks: {clickCount}</p>
      {clickCount >= 4 && <p>Maximum clicks reached!</p>}
    </div>
  );
}
```

## Props Getter 模式

返回可组合的 props 对象。

```tsx
interface UseToggleReturn {
  on: boolean;
  toggle: () => void;
  getTogglerProps: <T extends object>(props?: T) => T & {
    'aria-pressed': boolean;
    onClick: () => void;
  };
}

function useToggle(): UseToggleReturn {
  const [on, setOn] = useState(false);
  
  const toggle = () => setOn(prev => !prev);
  
  const getTogglerProps = <T extends object>(props: T = {} as T) => {
    return {
      'aria-pressed': on,
      onClick: () => {
        toggle();
        // 调用用户传入的 onClick
        (props as any).onClick?.();
      },
      ...props,
    };
  };
  
  return { on, toggle, getTogglerProps };
}

// 使用
function App() {
  const { on, getTogglerProps } = useToggle();
  
  return (
    <>
      <button
        {...getTogglerProps({
          id: 'toggle-btn',
          onClick: () => console.log('Custom click handler'),
        })}
      >
        {on ? 'ON' : 'OFF'}
      </button>
    </>
  );
}
```

## 最佳实践总结

| 模式 | 适用场景 | 示例 |
|------|----------|------|
| 组合模式 | 相关组件共享状态 | Tabs, Menu, Accordion |
| Render Props | 共享逻辑到多个组件 | Mouse Tracker, Toggle |
| HOC | 横切关注点 | withAuth, withLoading |
| 容器/展示 | 分离关注点 | 数据获取与 UI 分离 |
| 受控/非受控 | 表单组件 | Input, Select |
| State Reducer | 控制反转 | 可定制的状态逻辑 |
| Props Getter | 灵活的 props 组合 | 无障碍属性、事件处理 |

### 选择建议

1. **优先使用 Hooks** - 大多数场景下最简洁
2. **组合模式** - 构建组件库时必备
3. **Render Props** - 需要动态渲染时
4. **HOC** - 遗留代码或特定场景
5. **受控组件** - 表单验证、复杂交互
6. **State Reducer** - 需要高度可定制时
