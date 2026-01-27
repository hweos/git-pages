---
sidebar_position: 5
slug: two-pointers
title: 双指针技巧
description: 快慢指针、对撞指针与滑动窗口详解
---

# 双指针技巧

双指针是一种简单高效的算法技巧，能将 O(n²) 的暴力解法优化到 O(n)。

## 📋 双指针分类

| 类型 | 特点 | 典型场景 |
|-----|------|---------|
| 对撞指针 | 从两端向中间移动 | 有序数组、回文判断 |
| 快慢指针 | 不同速度移动 | 链表环检测、找中点 |
| 滑动窗口 | 维护一个区间 | 子串问题、连续子数组 |

---

## 1. 对撞指针

### 原理

两个指针分别从数组的两端出发，向中间移动，直到相遇。

### 经典例题：两数之和（有序数组）

```javascript
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        
        if (sum === target) {
            return [left + 1, right + 1];  // 题目要求 1-indexed
        } else if (sum < target) {
            left++;   // 和太小，左指针右移
        } else {
            right--;  // 和太大，右指针左移
        }
    }
    
    return [-1, -1];
}
```

### 经典例题：验证回文串

```javascript
function isPalindrome(s) {
    // 只保留字母和数字
    s = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        if (s[left] !== s[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}
```

### 经典例题：盛最多水的容器

```javascript
function maxArea(height) {
    let left = 0;
    let right = height.length - 1;
    let maxWater = 0;
    
    while (left < right) {
        const width = right - left;
        const h = Math.min(height[left], height[right]);
        maxWater = Math.max(maxWater, width * h);
        
        // 移动较短的一边
        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }
    
    return maxWater;
}
```

### 经典例题：三数之和

```javascript
function threeSum(nums) {
    const result = [];
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < nums.length - 2; i++) {
        // 跳过重复元素
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        let left = i + 1;
        let right = nums.length - 1;
        const target = -nums[i];
        
        while (left < right) {
            const sum = nums[left] + nums[right];
            
            if (sum === target) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // 跳过重复元素
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}
```

---

## 2. 快慢指针

### 原理

两个指针从同一位置出发，但移动速度不同（通常快指针每次走2步，慢指针走1步）。

### 经典例题：环形链表检测

```javascript
function hasCycle(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            return true;  // 有环
        }
    }
    
    return false;  // 无环
}
```

### 经典例题：环形链表入口

```javascript
function detectCycle(head) {
    if (!head || !head.next) return null;
    
    let slow = head;
    let fast = head;
    
    // 第一阶段：找到相遇点
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            // 第二阶段：找环入口
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

### 经典例题：链表中点

```javascript
function middleNode(head) {
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return slow;  // 中点（偶数个节点时返回第二个中点）
}
```

### 经典例题：删除链表倒数第 N 个节点

```javascript
function removeNthFromEnd(head, n) {
    const dummy = { next: head };
    let slow = dummy;
    let fast = dummy;
    
    // 快指针先走 n+1 步
    for (let i = 0; i <= n; i++) {
        fast = fast.next;
    }
    
    // 同时移动，直到快指针到达末尾
    while (fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    // 删除节点
    slow.next = slow.next.next;
    
    return dummy.next;
}
```

---

## 3. 滑动窗口

### 原理

维护一个窗口，通过移动左右边界来遍历所有可能的子数组/子串。

### 模板

```javascript
function slidingWindow(s) {
    const window = {};  // 或 Map
    let left = 0;
    let right = 0;
    let result = 0;
    
    while (right < s.length) {
        // 扩大窗口
        const c = s[right];
        right++;
        // 更新窗口内数据...
        
        // 判断是否需要收缩窗口
        while (/* 需要收缩的条件 */) {
            const d = s[left];
            left++;
            // 更新窗口内数据...
        }
        
        // 更新结果
        result = Math.max(result, right - left);
    }
    
    return result;
}
```

### 经典例题：最长无重复子串

```javascript
function lengthOfLongestSubstring(s) {
    const set = new Set();
    let left = 0;
    let maxLen = 0;
    
    for (let right = 0; right < s.length; right++) {
        // 收缩窗口直到没有重复
        while (set.has(s[right])) {
            set.delete(s[left]);
            left++;
        }
        
        set.add(s[right]);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    
    return maxLen;
}
```

### 经典例题：最小覆盖子串

```javascript
function minWindow(s, t) {
    const need = new Map();
    const window = new Map();
    
    // 统计 t 中字符
    for (const c of t) {
        need.set(c, (need.get(c) || 0) + 1);
    }
    
    let left = 0, right = 0;
    let valid = 0;  // 满足条件的字符数
    let start = 0, minLen = Infinity;
    
    while (right < s.length) {
        const c = s[right];
        right++;
        
        // 更新窗口
        if (need.has(c)) {
            window.set(c, (window.get(c) || 0) + 1);
            if (window.get(c) === need.get(c)) {
                valid++;
            }
        }
        
        // 收缩窗口
        while (valid === need.size) {
            // 更新最小值
            if (right - left < minLen) {
                start = left;
                minLen = right - left;
            }
            
            const d = s[left];
            left++;
            
            if (need.has(d)) {
                if (window.get(d) === need.get(d)) {
                    valid--;
                }
                window.set(d, window.get(d) - 1);
            }
        }
    }
    
    return minLen === Infinity ? '' : s.substring(start, start + minLen);
}
```

### 经典例题：长度为 K 的最大子数组和

```javascript
function maxSumSubarray(nums, k) {
    let windowSum = 0;
    let maxSum = -Infinity;
    
    for (let i = 0; i < nums.length; i++) {
        windowSum += nums[i];
        
        if (i >= k - 1) {
            maxSum = Math.max(maxSum, windowSum);
            windowSum -= nums[i - k + 1];
        }
    }
    
    return maxSum;
}
```

---

## 📝 LeetCode 练习

| 题目 | 难度 | 类型 |
|-----|------|------|
| [两数之和 II](https://leetcode.cn/problems/two-sum-ii-input-array-is-sorted/) | 中等 | 对撞指针 |
| [盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/) | 中等 | 对撞指针 |
| [三数之和](https://leetcode.cn/problems/3sum/) | 中等 | 对撞指针 |
| [环形链表](https://leetcode.cn/problems/linked-list-cycle/) | 简单 | 快慢指针 |
| [环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/) | 中等 | 快慢指针 |
| [无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 中等 | 滑动窗口 |
| [最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/) | 困难 | 滑动窗口 |

---

## 🎯 总结

| 场景 | 使用技巧 |
|-----|---------|
| 有序数组查找 | 对撞指针 |
| 链表问题 | 快慢指针 |
| 连续子数组/子串 | 滑动窗口 |
| 原地修改数组 | 快慢指针 |
