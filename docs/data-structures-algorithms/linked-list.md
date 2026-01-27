---
sidebar_position: 7
slug: linked-list
title: 链表操作大全
description: 链表的反转、合并、环检测等常见操作
---

# 链表操作大全

链表是面试高频考点，本文总结常见的链表操作技巧。

## 🔗 链表节点定义

```javascript
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

// 辅助函数：数组转链表
function arrayToList(arr) {
    const dummy = new ListNode();
    let curr = dummy;
    for (const val of arr) {
        curr.next = new ListNode(val);
        curr = curr.next;
    }
    return dummy.next;
}

// 辅助函数：链表转数组
function listToArray(head) {
    const result = [];
    while (head) {
        result.push(head.val);
        head = head.next;
    }
    return result;
}
```

---

## 1. 反转链表

### 迭代法

```javascript
function reverseList(head) {
    let prev = null;
    let curr = head;
    
    while (curr) {
        const next = curr.next;  // 保存下一个节点
        curr.next = prev;        // 反转指针
        prev = curr;             // 移动 prev
        curr = next;             // 移动 curr
    }
    
    return prev;
}
```

### 递归法

```javascript
function reverseList(head) {
    if (!head || !head.next) {
        return head;
    }
    
    const newHead = reverseList(head.next);
    head.next.next = head;
    head.next = null;
    
    return newHead;
}
```

### 反转前 N 个节点

```javascript
function reverseN(head, n) {
    if (n === 1) {
        return head;
    }
    
    let prev = null;
    let curr = head;
    let tail = head;  // 记录原头节点，最后会变成尾节点
    
    for (let i = 0; i < n && curr; i++) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    
    tail.next = curr;  // 连接剩余部分
    return prev;
}
```

### 反转区间 [m, n]

```javascript
function reverseBetween(head, m, n) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    
    // 找到第 m-1 个节点
    for (let i = 0; i < m - 1; i++) {
        prev = prev.next;
    }
    
    // 反转 m 到 n 的部分
    let curr = prev.next;
    for (let i = 0; i < n - m; i++) {
        const next = curr.next;
        curr.next = next.next;
        next.next = prev.next;
        prev.next = next;
    }
    
    return dummy.next;
}
```

---

## 2. 合并链表

### 合并两个有序链表

```javascript
function mergeTwoLists(l1, l2) {
    const dummy = new ListNode();
    let curr = dummy;
    
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            curr.next = l1;
            l1 = l1.next;
        } else {
            curr.next = l2;
            l2 = l2.next;
        }
        curr = curr.next;
    }
    
    curr.next = l1 || l2;
    return dummy.next;
}
```

### 合并 K 个有序链表

```javascript
function mergeKLists(lists) {
    if (!lists.length) return null;
    
    // 分治合并
    function merge(left, right) {
        if (left === right) return lists[left];
        
        const mid = Math.floor((left + right) / 2);
        const l1 = merge(left, mid);
        const l2 = merge(mid + 1, right);
        
        return mergeTwoLists(l1, l2);
    }
    
    return merge(0, lists.length - 1);
}
```

---

## 3. 环形链表

### 判断是否有环

```javascript
function hasCycle(head) {
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            return true;
        }
    }
    
    return false;
}
```

### 找到环的入口

```javascript
function detectCycle(head) {
    let slow = head;
    let fast = head;
    
    // 找到相遇点
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            // 从头开始，与慢指针同速前进
            let ptr = head;
            while (ptr !== slow) {
                ptr = ptr.next;
                slow = slow.next;
            }
            return ptr;
        }
    }
    
    return null;
}
```

---

## 4. 删除节点

### 删除指定值的节点

```javascript
function removeElements(head, val) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    let curr = head;
    
    while (curr) {
        if (curr.val === val) {
            prev.next = curr.next;
        } else {
            prev = curr;
        }
        curr = curr.next;
    }
    
    return dummy.next;
}
```

### 删除倒数第 N 个节点

```javascript
function removeNthFromEnd(head, n) {
    const dummy = new ListNode(0, head);
    let fast = dummy;
    let slow = dummy;
    
    // 快指针先走 n+1 步
    for (let i = 0; i <= n; i++) {
        fast = fast.next;
    }
    
    // 同时移动
    while (fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    slow.next = slow.next.next;
    return dummy.next;
}
```

### 删除重复元素

```javascript
// 保留一个
function deleteDuplicates(head) {
    let curr = head;
    
    while (curr && curr.next) {
        if (curr.val === curr.next.val) {
            curr.next = curr.next.next;
        } else {
            curr = curr.next;
        }
    }
    
    return head;
}

// 全部删除
function deleteDuplicatesAll(head) {
    const dummy = new ListNode(0, head);
    let prev = dummy;
    
    while (prev.next) {
        let curr = prev.next;
        
        if (curr.next && curr.val === curr.next.val) {
            // 跳过所有重复节点
            while (curr.next && curr.val === curr.next.val) {
                curr = curr.next;
            }
            prev.next = curr.next;
        } else {
            prev = prev.next;
        }
    }
    
    return dummy.next;
}
```

---

## 5. 其他常见操作

### 找中间节点

```javascript
function middleNode(head) {
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return slow;
}
```

### 判断回文链表

```javascript
function isPalindrome(head) {
    if (!head || !head.next) return true;
    
    // 找中点
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // 反转后半部分
    let secondHalf = reverseList(slow.next);
    
    // 比较
    let p1 = head, p2 = secondHalf;
    let result = true;
    while (p2) {
        if (p1.val !== p2.val) {
            result = false;
            break;
        }
        p1 = p1.next;
        p2 = p2.next;
    }
    
    // 恢复链表（可选）
    slow.next = reverseList(secondHalf);
    
    return result;
}
```

### 相交链表

```javascript
function getIntersectionNode(headA, headB) {
    if (!headA || !headB) return null;
    
    let pA = headA;
    let pB = headB;
    
    // 两个指针会在交点相遇，或同时到达 null
    while (pA !== pB) {
        pA = pA ? pA.next : headB;
        pB = pB ? pB.next : headA;
    }
    
    return pA;
}
```

### 两数相加

```javascript
function addTwoNumbers(l1, l2) {
    const dummy = new ListNode();
    let curr = dummy;
    let carry = 0;
    
    while (l1 || l2 || carry) {
        const sum = (l1?.val || 0) + (l2?.val || 0) + carry;
        carry = Math.floor(sum / 10);
        curr.next = new ListNode(sum % 10);
        curr = curr.next;
        
        l1 = l1?.next;
        l2 = l2?.next;
    }
    
    return dummy.next;
}
```

---

## 💡 常用技巧

### 1. 虚拟头节点 (Dummy Node)

```javascript
// 避免处理头节点的特殊情况
const dummy = new ListNode(0, head);
// ... 操作 ...
return dummy.next;
```

### 2. 快慢指针

- 找中点
- 检测环
- 找倒数第 N 个节点

### 3. 递归思维

链表天然适合递归，每个节点都是一个子链表的头。

---

## 📝 LeetCode 练习

| 题目 | 难度 | 类型 |
|-----|------|------|
| [反转链表](https://leetcode.cn/problems/reverse-linked-list/) | 简单 | 反转 |
| [反转链表 II](https://leetcode.cn/problems/reverse-linked-list-ii/) | 中等 | 反转 |
| [合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/) | 简单 | 合并 |
| [合并K个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/) | 困难 | 合并 |
| [环形链表](https://leetcode.cn/problems/linked-list-cycle/) | 简单 | 环 |
| [环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/) | 中等 | 环 |
| [相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/) | 简单 | 相交 |
| [回文链表](https://leetcode.cn/problems/palindrome-linked-list/) | 简单 | 回文 |
| [删除链表的倒数第N个节点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) | 中等 | 删除 |
