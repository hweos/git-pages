# JavaScript 核心概念

掌握 JavaScript 核心概念是成为优秀前端工程师的基础。

## 数据类型

### 基本类型 vs 引用类型

```javascript
// 7 种基本类型
const str = 'hello';        // string
const num = 42;             // number
const bool = true;          // boolean
const n = null;             // null
const u = undefined;        // undefined
const sym = Symbol('id');   // symbol
const big = 9007199254740991n; // bigint

// 引用类型
const obj = { name: 'Tom' };
const arr = [1, 2, 3];
const fn = () => {};
```

### 类型判断

```javascript
// typeof - 适用于基本类型
typeof 'hello'      // 'string'
typeof 42           // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof Symbol()     // 'symbol'
typeof 10n          // 'bigint'
typeof null         // 'object' (历史遗留 bug)
typeof {}           // 'object'
typeof []           // 'object'
typeof function(){} // 'function'

// instanceof - 判断原型链
[] instanceof Array    // true
{} instanceof Object   // true

// Object.prototype.toString - 最准确
Object.prototype.toString.call([])      // '[object Array]'
Object.prototype.toString.call(null)    // '[object Null]'
Object.prototype.toString.call(/regex/) // '[object RegExp]'

// 实用工具函数
const getType = (value) => 
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

getType([]);      // 'array'
getType(null);    // 'null'
getType(new Map); // 'map'
```

## 作用域与闭包

### 作用域类型

```javascript
// 全局作用域
var globalVar = 'global';

// 函数作用域
function foo() {
  var functionVar = 'function';
  console.log(globalVar);     // 可访问
}

// 块级作用域 (let/const)
if (true) {
  let blockVar = 'block';
  const CONST_VAR = 'const';
}
// console.log(blockVar); // ReferenceError
```

### 闭包

```javascript
// 闭包：函数可以访问其词法作用域外的变量
function createCounter() {
  let count = 0; // 被闭包"捕获"
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2

// 经典闭包问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 输出: 3, 3, 3
}

// 解决方案 1: let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 输出: 0, 1, 2
}

// 解决方案 2: IIFE
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100);
  })(i); // 输出: 0, 1, 2
}
```

### 闭包应用场景

```javascript
// 1. 数据私有化
function createPerson(name) {
  let _age = 0; // 私有变量
  
  return {
    getName: () => name,
    getAge: () => _age,
    setAge: (age) => { if (age > 0) _age = age; }
  };
}

// 2. 函数柯里化
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6

// 3. 防抖
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 4. 节流
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
```

## this 指向

### this 绑定规则

```javascript
// 1. 默认绑定 - 独立调用指向全局/undefined(严格模式)
function standalone() {
  console.log(this); // window (非严格) / undefined (严格)
}

// 2. 隐式绑定 - 被对象调用时指向该对象
const obj = {
  name: 'obj',
  sayName() { console.log(this.name); }
};
obj.sayName(); // 'obj'

// 隐式丢失
const fn = obj.sayName;
fn(); // undefined (this 指向全局)

// 3. 显式绑定 - call/apply/bind
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}
const person = { name: 'Tom' };

greet.call(person, 'Hello');    // 'Hello, Tom'
greet.apply(person, ['Hi']);    // 'Hi, Tom'
const boundGreet = greet.bind(person);
boundGreet('Hey');              // 'Hey, Tom'

// 4. new 绑定 - 指向新创建的对象
function Person(name) {
  this.name = name;
}
const p = new Person('Tom'); // this -> p

// 5. 箭头函数 - 继承外层 this
const obj2 = {
  name: 'obj2',
  sayName: () => console.log(this.name),      // 外层 this
  sayNameNormal() {
    const inner = () => console.log(this.name); // obj2
    inner();
  }
};
```

### 手写 call/apply/bind

```javascript
// 手写 call
Function.prototype.myCall = function(context, ...args) {
  context = context ?? globalThis;
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// 手写 apply
Function.prototype.myApply = function(context, args = []) {
  context = context ?? globalThis;
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// 手写 bind
Function.prototype.myBind = function(context, ...args) {
  const fn = this;
  return function(...innerArgs) {
    return fn.apply(
      this instanceof fn ? this : context,
      [...args, ...innerArgs]
    );
  };
};
```

## 原型与继承

### 原型链

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

const tom = new Person('Tom');

// 原型链关系
tom.__proto__ === Person.prototype;           // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;          // true

// 原型链查找
tom.sayHello();     // 在 Person.prototype 上找到
tom.toString();     // 在 Object.prototype 上找到
```

### ES6 Class

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
  
  static isAnimal(obj) {
    return obj instanceof Animal;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 必须先调用 super
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Buddy', 'Labrador');
dog.speak();           // 'Buddy barks'
Animal.isAnimal(dog);  // true
```

### 手写 new

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建新对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);
  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);
  // 3. 如果构造函数返回对象则使用该对象，否则返回新对象
  return result instanceof Object ? result : obj;
}
```

## 事件循环

### 宏任务与微任务

```javascript
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(() => console.log('promise1'))
  .then(() => console.log('promise2'));

console.log('script end');

// 输出顺序:
// script start
// script end
// promise1
// promise2
// setTimeout
```

### 任务分类

```javascript
// 宏任务 (Macro Task)
// - script 整体代码
// - setTimeout / setInterval
// - setImmediate (Node.js)
// - I/O
// - UI rendering

// 微任务 (Micro Task)
// - Promise.then/catch/finally
// - MutationObserver
// - queueMicrotask
// - process.nextTick (Node.js)

// 执行顺序: 同步代码 -> 微任务队列(清空) -> 宏任务(一个) -> 微任务队列...
```

### 复杂示例

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => console.log('setTimeout'), 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));

console.log('script end');

// 输出:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

## ES6+ 常用特性

### 解构与展开

```javascript
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const [first, , third] = [1, 2, 3]; // 跳过元素

// 对象解构
const { name, age, city = 'Unknown' } = { name: 'Tom', age: 20 };
const { name: userName } = { name: 'Tom' }; // 重命名

// 展开运算符
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

const obj1 = { a: 1 };
const obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }

// 函数参数
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}
```

### 常用方法

```javascript
// 数组方法
const nums = [1, 2, 3, 4, 5];

nums.map(x => x * 2);           // [2, 4, 6, 8, 10]
nums.filter(x => x > 2);        // [3, 4, 5]
nums.reduce((acc, x) => acc + x, 0); // 15
nums.find(x => x > 3);          // 4
nums.findIndex(x => x > 3);     // 3
nums.some(x => x > 4);          // true
nums.every(x => x > 0);         // true
nums.includes(3);               // true
[1, [2, [3]]].flat(2);          // [1, 2, 3]

// 对象方法
const obj = { a: 1, b: 2 };
Object.keys(obj);               // ['a', 'b']
Object.values(obj);             // [1, 2]
Object.entries(obj);            // [['a', 1], ['b', 2]]
Object.fromEntries([['a', 1]]); // { a: 1 }
Object.assign({}, obj, { c: 3 }); // { a: 1, b: 2, c: 3 }

// 字符串方法
'hello'.includes('ell');        // true
'hello'.startsWith('he');       // true
'hello'.endsWith('lo');         // true
'hello'.padStart(10, '0');      // '00000hello'
'  hello  '.trim();             // 'hello'
'hello'.repeat(2);              // 'hellohello'
```

### 可选链与空值合并

```javascript
const user = {
  name: 'Tom',
  address: {
    city: 'Beijing'
  }
};

// 可选链 ?.
user?.address?.city;      // 'Beijing'
user?.contact?.phone;     // undefined (不报错)
user?.getName?.();        // undefined (不报错)
user?.friends?.[0];       // undefined (不报错)

// 空值合并 ??
const value = null ?? 'default';     // 'default'
const value2 = undefined ?? 'default'; // 'default'
const value3 = 0 ?? 'default';       // 0 (0 不是 null/undefined)
const value4 = '' ?? 'default';      // '' (空字符串不是 null/undefined)

// 对比 ||
const value5 = 0 || 'default';       // 'default' (0 是假值)
const value6 = '' || 'default';      // 'default' ('' 是假值)
```

## 总结

| 概念 | 要点 |
|------|------|
| 数据类型 | 7 种基本类型 + 引用类型，`typeof` + `instanceof` + `toString` |
| 作用域 | 全局、函数、块级作用域，作用域链 |
| 闭包 | 函数访问外部变量，用于私有化、柯里化、防抖节流 |
| this | 默认、隐式、显式、new、箭头函数五种绑定规则 |
| 原型链 | `__proto__` 链接原型，实现继承 |
| 事件循环 | 同步 → 微任务(清空) → 宏任务(一个) → 循环 |
| ES6+ | 解构、展开、箭头函数、可选链、空值合并 |
