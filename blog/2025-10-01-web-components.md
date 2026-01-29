---
slug: web-components
title: Web Components 实践指南
authors: mason
tags: [Web Components, 前端, 组件]
---

Web Components 是浏览器原生支持的组件化方案。本文介绍 Web Components 的核心技术和实践方法。

<!--truncate-->

## 🎯 什么是 Web Components

Web Components 由三项技术组成：

| 技术 | 说明 |
|------|------|
| Custom Elements | 自定义 HTML 元素 |
| Shadow DOM | 封装的 DOM 和样式 |
| HTML Templates | 可复用的 HTML 模板 |

### 优势

```markdown
- 浏览器原生支持
- 框架无关
- 真正的样式隔离
- 可复用性强
```

---

## 🧩 Custom Elements

### 定义组件

```javascript
class MyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #2563eb;
        }
      </style>
      <button>
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('my-button', MyButton);
```

### 使用

```html
<my-button>Click Me</my-button>
```

### 生命周期

```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    // 元素创建时调用
  }

  connectedCallback() {
    // 元素添加到 DOM 时调用
  }

  disconnectedCallback() {
    // 元素从 DOM 移除时调用
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // 属性变化时调用
  }

  adoptedCallback() {
    // 元素被移动到新文档时调用
  }

  static get observedAttributes() {
    // 声明要监听的属性
    return ['disabled', 'size'];
  }
}
```

---

## 🌑 Shadow DOM

### 创建 Shadow DOM

```javascript
class MyCard extends HTMLElement {
  constructor() {
    super();
    // open: 可通过 JavaScript 访问
    // closed: 不可访问
    const shadow = this.attachShadow({ mode: 'open' });
    
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        :host([theme="dark"]) {
          background: #1f2937;
          color: white;
        }
        ::slotted(h2) {
          margin-top: 0;
        }
      </style>
      <slot></slot>
    `;
  }
}
```

### 样式选择器

```css
/* 宿主元素 */
:host {
  display: block;
}

/* 带条件的宿主 */
:host([disabled]) {
  opacity: 0.5;
}

:host(:hover) {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 宿主上下文 */
:host-context(.dark-theme) {
  background: #333;
}

/* 插槽内容 */
::slotted(*) {
  margin: 0;
}

::slotted(p) {
  color: gray;
}
```

---

## 📝 HTML Templates

### 使用模板

```html
<template id="my-template">
  <style>
    .card {
      padding: 16px;
      border: 1px solid #ddd;
    }
  </style>
  <div class="card">
    <slot name="title"></slot>
    <slot></slot>
  </div>
</template>

<script>
class TemplateCard extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const template = document.getElementById('my-template');
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('template-card', TemplateCard);
</script>
```

### 命名插槽

```html
<template-card>
  <h2 slot="title">Card Title</h2>
  <p>This is the card content.</p>
</template-card>
```

---

## 🔧 属性和事件

### 属性处理

```javascript
class MyInput extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  // Getter/Setter 属性
  get value() {
    return this.getAttribute('value') || '';
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        input:disabled {
          background: #f5f5f5;
        }
      </style>
      <input 
        type="text" 
        value="${this.value}"
        placeholder="${this.getAttribute('placeholder') || ''}"
        ${this.disabled ? 'disabled' : ''}
      >
    `;

    this.shadowRoot.querySelector('input').addEventListener('input', (e) => {
      this.value = e.target.value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
      }));
    });
  }
}
```

### 自定义事件

```javascript
// 组件内触发
this.dispatchEvent(new CustomEvent('item-selected', {
  detail: { id: itemId, name: itemName },
  bubbles: true,
  composed: true, // 穿透 Shadow DOM
}));

// 外部监听
document.querySelector('my-list').addEventListener('item-selected', (e) => {
  console.log('Selected:', e.detail);
});
```

---

## 🎨 样式定制

### CSS 变量

```javascript
class ThemedButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: var(--btn-padding, 8px 16px);
          background: var(--btn-bg, #3b82f6);
          color: var(--btn-color, white);
          border: none;
          border-radius: var(--btn-radius, 4px);
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}
```

```html
<style>
  themed-button {
    --btn-bg: #10b981;
    --btn-radius: 20px;
  }
</style>

<themed-button>Custom Button</themed-button>
```

### CSS Parts

```javascript
this.shadowRoot.innerHTML = `
  <style>
    .container {
      display: flex;
    }
  </style>
  <div class="container">
    <span part="label">Label</span>
    <span part="value">Value</span>
  </div>
`;
```

```css
/* 外部可以通过 part 选择器修改样式 */
my-component::part(label) {
  font-weight: bold;
}

my-component::part(value) {
  color: blue;
}
```

---

## 📦 实用组件示例

### Modal 组件

```javascript
class MyModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback() {
    this.render();
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(val) {
    if (val) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.open ? 'block' : 'none'};
        }
        .backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal {
          background: white;
          padding: 24px;
          border-radius: 8px;
          min-width: 300px;
        }
      </style>
      <div class="backdrop">
        <div class="modal">
          <slot></slot>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.backdrop').addEventListener('click', (e) => {
      if (e.target.classList.contains('backdrop')) {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close'));
      }
    });
  }
}

customElements.define('my-modal', MyModal);
```

---

## 📋 与框架集成

### React

```tsx
import { useRef, useEffect } from 'react';

function App() {
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    const handleClose = () => console.log('Modal closed');
    modal?.addEventListener('close', handleClose);
    return () => modal?.removeEventListener('close', handleClose);
  }, []);

  return (
    <my-modal ref={modalRef} open>
      <h2>Hello!</h2>
    </my-modal>
  );
}
```

### Vue

```vue
<template>
  <my-modal :open="isOpen" @close="isOpen = false">
    <h2>Hello!</h2>
  </my-modal>
</template>
```

---

## ✅ 最佳实践

```markdown
1. 使用语义化的组件名（带连字符）
2. 提供合理的默认样式
3. 使用 CSS 变量支持主题定制
4. 文档化属性、事件和插槽
5. 注意无障碍访问
```

---

Web Components 是构建可复用 UI 组件的标准方案，特别适合跨框架共享的场景。
