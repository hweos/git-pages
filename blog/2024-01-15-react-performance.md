---
slug: react-performance
title: React 性能优化实战指南
authors: mason
tags: [React, 性能优化, 前端]
---

React 应用的性能优化是一个永恒的话题。本文总结了我在实际项目中使用的优化策略，帮助你打造流畅的用户体验。

<!--truncate-->

## 🎯 性能优化的核心原则

在开始优化之前，记住这些原则：

1. **先测量，后优化** - 不要过早优化
2. **找到瓶颈** - 使用 React DevTools Profiler
3. **权衡取舍** - 优化有成本，适度即可

## 📊 识别性能问题

### 使用 React DevTools Profiler

```javascript
// 开发环境自动可用
// 生产环境需要启用 profiling build
```

### 常见的性能问题信号

- 输入框打字卡顿
- 滚动不流畅
- 组件频繁闪烁
- 初次渲染时间过长

---

## 🔧 优化策略一：减少不必要的重渲染

### 1. React.memo

对于纯展示组件，使用 `React.memo` 包裹：

```jsx
// ❌ 每次父组件更新都会重渲染
const UserCard = ({ user }) => {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};

// ✅ 只有 props 变化时才重渲染
const UserCard = React.memo(({ user }) => {
  return (
    <div className="card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});
```

### 2. useMemo - 缓存计算结果

```jsx
// ❌ 每次渲染都会重新计算
const ExpensiveComponent = ({ items, filter }) => {
  const filteredItems = items.filter(item => 
    item.name.includes(filter)
  );
  
  return <List items={filteredItems} />;
};

// ✅ 只有依赖变化时才重新计算
const ExpensiveComponent = ({ items, filter }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => item.name.includes(filter)),
    [items, filter]
  );
  
  return <List items={filteredItems} />;
};
```

### 3. useCallback - 缓存函数引用

```jsx
// ❌ 每次渲染都创建新函数，导致子组件重渲染
const Parent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <Child onClick={handleClick} />;
};

// ✅ 函数引用保持稳定
const Parent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
};
```

:::tip 使用时机
`useMemo` 和 `useCallback` 不是银弹，只在以下情况使用：
- 计算确实昂贵
- 作为 props 传递给 `React.memo` 组件
- 作为其他 Hook 的依赖
:::

---

## 🔧 优化策略二：列表优化

### 1. 使用正确的 key

```jsx
// ❌ 使用 index 作为 key（列表会变化时）
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ 使用唯一标识
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

### 2. 虚拟列表

对于大量数据，使用虚拟列表只渲染可见区域：

```jsx
import { FixedSizeList } from 'react-window';

const VirtualList = ({ items }) => (
  <FixedSizeList
    height={400}
    itemCount={items.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        {items[index].name}
      </div>
    )}
  </FixedSizeList>
);
```

---

## 🔧 优化策略三：状态管理优化

### 1. 状态下沉

将状态放在需要它的最近组件中：

```jsx
// ❌ 状态提升过高，导致整个列表重渲染
const TodoList = () => {
  const [editingId, setEditingId] = useState(null);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          isEditing={editingId === todo.id}
          onEdit={setEditingId}
        />
      ))}
    </ul>
  );
};

// ✅ 每个 item 管理自己的编辑状态
const TodoItem = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  // ...
};
```

### 2. 状态拆分

```jsx
// ❌ 一个大状态对象
const [state, setState] = useState({
  user: null,
  posts: [],
  comments: [],
  loading: false
});

// ✅ 拆分成独立状态
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [comments, setComments] = useState([]);
const [loading, setLoading] = useState(false);
```

---

## 🔧 优化策略四：代码分割

### 1. React.lazy + Suspense

```jsx
// 路由级别的代码分割
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. 组件级别的懒加载

```jsx
// 大型组件按需加载
const HeavyChart = React.lazy(() => import('./components/HeavyChart'));

const Analytics = () => {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        显示图表
      </button>
      {showChart && (
        <Suspense fallback={<Skeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
};
```

---

## 🔧 优化策略五：避免常见陷阱

### 1. 避免在渲染中创建对象

```jsx
// ❌ 每次渲染创建新对象
<Component style={{ color: 'red' }} />
<Component data={{ id: 1, name: 'test' }} />

// ✅ 使用常量或 useMemo
const style = { color: 'red' };
<Component style={style} />

// 或
const data = useMemo(() => ({ id: 1, name: 'test' }), []);
<Component data={data} />
```

### 2. 避免匿名函数

```jsx
// ❌ 内联匿名函数
<button onClick={() => handleClick(id)}>Click</button>

// ✅ 使用 useCallback 或提取组件
const handleItemClick = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

<button onClick={handleItemClick}>Click</button>
```

---

## 📈 性能优化检查清单

| 检查项 | 说明 |
|--------|------|
| ✅ 使用 React DevTools 分析 | 找到真正的瓶颈 |
| ✅ 大列表使用虚拟化 | react-window / react-virtualized |
| ✅ 合理使用 memo/useMemo/useCallback | 避免不必要的重渲染 |
| ✅ 代码分割 | 减少首屏加载时间 |
| ✅ 状态管理优化 | 状态下沉、拆分 |
| ✅ 避免渲染中创建对象/函数 | 保持引用稳定 |

---

## 🔗 推荐资源

- [React 官方性能优化文档](https://react.dev/learn/render-and-commit)
- [use-what-changed](https://github.com/simbathesailor/use-what-changed) - 调试 Hook 依赖
- [why-did-you-render](https://github.com/welldone-software/why-did-you-render) - 追踪重渲染原因

---

性能优化是一个持续的过程。记住：**先让它工作，再让它快**。不要过早优化，但也不要忽视明显的性能问题。

你在项目中遇到过哪些性能问题？欢迎在评论区分享你的经验！
