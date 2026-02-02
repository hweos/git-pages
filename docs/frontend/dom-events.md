# DOM 操作与事件处理

DOM (Document Object Model) 是网页的编程接口，掌握 DOM 操作是前端开发的基本功。

## DOM 节点

### 节点类型

```javascript
// 常见节点类型
Node.ELEMENT_NODE      // 1 - 元素节点
Node.TEXT_NODE         // 3 - 文本节点
Node.COMMENT_NODE      // 8 - 注释节点
Node.DOCUMENT_NODE     // 9 - 文档节点

// 检查节点类型
element.nodeType === Node.ELEMENT_NODE
```

### 获取元素

```javascript
// 单个元素
document.getElementById('app')
document.querySelector('.class')
document.querySelector('#id')
document.querySelector('[data-id="1"]')

// 多个元素 (返回 NodeList)
document.querySelectorAll('.item')
document.querySelectorAll('div, span')

// 旧 API (返回 HTMLCollection，实时更新)
document.getElementsByClassName('class')
document.getElementsByTagName('div')
document.getElementsByName('name')

// 特殊元素
document.documentElement  // <html>
document.body             // <body>
document.head             // <head>
```

### 遍历 DOM

```javascript
const el = document.querySelector('.parent');

// 父节点
el.parentNode
el.parentElement

// 子节点
el.childNodes           // 包含文本节点
el.children             // 只有元素节点
el.firstChild           // 第一个子节点
el.firstElementChild    // 第一个子元素
el.lastChild
el.lastElementChild

// 兄弟节点
el.previousSibling      // 前一个节点
el.previousElementSibling  // 前一个元素
el.nextSibling
el.nextElementSibling

// 查找
el.closest('.ancestor')  // 最近的祖先元素
el.contains(child)       // 是否包含子元素
```

## 元素操作

### 创建元素

```javascript
// 创建元素
const div = document.createElement('div');
const text = document.createTextNode('Hello');
const fragment = document.createDocumentFragment();

// 克隆元素
const clone = el.cloneNode(true);  // true = 深克隆
```

### 插入元素

```javascript
// 传统方法
parent.appendChild(child);
parent.insertBefore(newChild, referenceChild);

// 现代方法 (推荐)
parent.append(child1, child2, 'text');    // 末尾添加
parent.prepend(child);                     // 开头添加
el.before(sibling);                        // 前面插入
el.after(sibling);                         // 后面插入
el.replaceWith(newEl);                     // 替换

// insertAdjacentHTML
el.insertAdjacentHTML('beforebegin', '<p>Before</p>');
el.insertAdjacentHTML('afterbegin', '<p>First child</p>');
el.insertAdjacentHTML('beforeend', '<p>Last child</p>');
el.insertAdjacentHTML('afterend', '<p>After</p>');
```

### 删除元素

```javascript
// 现代方法
el.remove();

// 传统方法
parent.removeChild(child);

// 清空内容
el.innerHTML = '';
el.textContent = '';
while (el.firstChild) {
  el.removeChild(el.firstChild);
}
```

### 属性操作

```javascript
// 标准属性
el.id = 'myId';
el.className = 'class1 class2';
el.href = 'https://example.com';

// getAttribute/setAttribute
el.getAttribute('data-id');
el.setAttribute('data-id', '123');
el.removeAttribute('data-id');
el.hasAttribute('data-id');

// dataset (data-* 属性)
el.dataset.id;        // data-id
el.dataset.userId;    // data-user-id

// classList
el.classList.add('active');
el.classList.remove('active');
el.classList.toggle('active');
el.classList.contains('active');
el.classList.replace('old', 'new');
```

### 样式操作

```javascript
// 内联样式
el.style.color = 'red';
el.style.backgroundColor = 'blue';
el.style.cssText = 'color: red; font-size: 16px;';

// 获取计算样式
const styles = getComputedStyle(el);
styles.color;
styles.getPropertyValue('background-color');

// CSS 变量
el.style.setProperty('--primary-color', '#007bff');
getComputedStyle(el).getPropertyValue('--primary-color');
```

### 内容操作

```javascript
// HTML 内容
el.innerHTML = '<p>HTML content</p>';

// 文本内容
el.textContent = 'Pure text';  // 推荐
el.innerText = 'Rendered text';  // 考虑样式

// 表单值
input.value = 'input value';
checkbox.checked = true;
select.selectedIndex = 0;
```

## 事件处理

### 事件绑定

```javascript
// addEventListener (推荐)
el.addEventListener('click', handler);
el.addEventListener('click', handler, { once: true });
el.addEventListener('click', handler, { capture: true });
el.addEventListener('click', handler, { passive: true });

// 移除事件
el.removeEventListener('click', handler);

// 旧方法
el.onclick = handler;  // 会被覆盖
```

### 事件对象

```javascript
el.addEventListener('click', (event) => {
  // 事件目标
  event.target;         // 触发事件的元素
  event.currentTarget;  // 绑定事件的元素
  
  // 事件类型
  event.type;           // 'click'
  
  // 鼠标位置
  event.clientX;        // 相对视口
  event.clientY;
  event.pageX;          // 相对文档
  event.pageY;
  event.offsetX;        // 相对目标元素
  event.offsetY;
  
  // 键盘
  event.key;            // 'Enter', 'a'
  event.code;           // 'Enter', 'KeyA'
  event.ctrlKey;        // Ctrl 是否按下
  event.shiftKey;
  event.altKey;
  event.metaKey;        // Cmd/Win
  
  // 阻止行为
  event.preventDefault();   // 阻止默认行为
  event.stopPropagation();  // 阻止冒泡
  event.stopImmediatePropagation();  // 阻止同元素其他监听器
});
```

### 事件冒泡与捕获

```javascript
// 事件流：捕获 -> 目标 -> 冒泡

// 冒泡阶段 (默认)
parent.addEventListener('click', handler);

// 捕获阶段
parent.addEventListener('click', handler, true);
parent.addEventListener('click', handler, { capture: true });

// 阻止冒泡
el.addEventListener('click', (e) => {
  e.stopPropagation();
});
```

### 事件委托

```javascript
// ❌ 为每个元素绑定事件
document.querySelectorAll('.item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ 事件委托
document.querySelector('.list').addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) {
    handleClick(item);
  }
});

// 优点：
// 1. 减少内存占用
// 2. 动态添加的元素也能响应
// 3. 方便统一管理
```

### 常见事件

```javascript
// 鼠标事件
'click'        // 点击
'dblclick'     // 双击
'mousedown'    // 按下
'mouseup'      // 松开
'mousemove'    // 移动
'mouseenter'   // 进入 (不冒泡)
'mouseleave'   // 离开 (不冒泡)
'mouseover'    // 进入 (冒泡)
'mouseout'     // 离开 (冒泡)
'contextmenu'  // 右键菜单

// 键盘事件
'keydown'      // 按下
'keyup'        // 松开
'keypress'     // 按键 (已废弃)

// 表单事件
'focus'        // 获得焦点
'blur'         // 失去焦点
'input'        // 输入
'change'       // 值改变 (失焦后)
'submit'       // 表单提交
'reset'        // 表单重置

// 滚动事件
'scroll'       // 滚动
'wheel'        // 滚轮

// 窗口事件
'load'         // 加载完成
'DOMContentLoaded'  // DOM 就绪
'resize'       // 窗口大小改变
'beforeunload' // 离开页面前

// 触摸事件
'touchstart'   // 触摸开始
'touchmove'    // 触摸移动
'touchend'     // 触摸结束

// 拖拽事件
'dragstart'    // 开始拖拽
'drag'         // 拖拽中
'dragend'      // 拖拽结束
'dragenter'    // 进入放置区
'dragleave'    // 离开放置区
'dragover'     // 在放置区上
'drop'         // 放置
```

### 自定义事件

```javascript
// 创建自定义事件
const event = new CustomEvent('myEvent', {
  detail: { message: 'Hello' },
  bubbles: true,
  cancelable: true
});

// 触发事件
el.dispatchEvent(event);

// 监听事件
el.addEventListener('myEvent', (e) => {
  console.log(e.detail.message);  // 'Hello'
});
```

## 实用技巧

### 防抖与节流

```javascript
// 防抖：延迟执行，重复触发会重置
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：固定间隔执行
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 使用
input.addEventListener('input', debounce(search, 300));
window.addEventListener('scroll', throttle(onScroll, 100));
```

### 批量 DOM 操作

```javascript
// ❌ 多次重排
items.forEach(item => {
  list.appendChild(createItem(item));
});

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
items.forEach(item => {
  fragment.appendChild(createItem(item));
});
list.appendChild(fragment);

// ✅ 或者先隐藏
list.style.display = 'none';
items.forEach(item => list.appendChild(createItem(item)));
list.style.display = '';
```

### 获取元素尺寸

```javascript
// 元素尺寸
el.offsetWidth   // 包含 border
el.offsetHeight
el.clientWidth   // 不含 border
el.clientHeight
el.scrollWidth   // 滚动内容宽度
el.scrollHeight

// 元素位置
el.offsetTop     // 相对 offsetParent
el.offsetLeft
el.scrollTop     // 滚动距离
el.scrollLeft

// getBoundingClientRect
const rect = el.getBoundingClientRect();
rect.top         // 相对视口
rect.left
rect.bottom
rect.right
rect.width
rect.height
```

### 判断元素可见

```javascript
// Intersection Observer (推荐)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('元素可见');
      // 懒加载图片
      entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1  // 10% 可见时触发
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### MutationObserver

```javascript
// 监听 DOM 变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList') {
      console.log('子节点变化');
    }
    if (mutation.type === 'attributes') {
      console.log('属性变化:', mutation.attributeName);
    }
  });
});

observer.observe(el, {
  childList: true,    // 子节点变化
  attributes: true,   // 属性变化
  subtree: true,      // 后代节点
  characterData: true // 文本内容
});

// 停止观察
observer.disconnect();
```

## 性能优化

### 减少重排重绘

```javascript
// ❌ 多次读写交替
el.style.width = '100px';
console.log(el.offsetWidth);  // 强制重排
el.style.height = '100px';

// ✅ 批量写入
el.style.cssText = 'width: 100px; height: 100px;';
// 或
el.classList.add('new-size');
```

### 使用 requestAnimationFrame

```javascript
// ❌ 直接操作
window.addEventListener('scroll', () => {
  el.style.transform = `translateY(${scrollY}px)`;
});

// ✅ 使用 rAF
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      el.style.transform = `translateY(${scrollY}px)`;
      ticking = false;
    });
    ticking = true;
  }
});
```

## 总结

| 操作 | 推荐方法 |
|------|----------|
| 获取元素 | `querySelector` / `querySelectorAll` |
| 插入元素 | `append` / `prepend` / `before` / `after` |
| 删除元素 | `remove()` |
| 绑定事件 | `addEventListener` |
| 事件委托 | 在父元素上监听 |
| 批量操作 | `DocumentFragment` |
| 动画 | `requestAnimationFrame` |
| 监听可见 | `IntersectionObserver` |
| 监听变化 | `MutationObserver` |
