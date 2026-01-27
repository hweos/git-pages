---
sidebar_position: 6
slug: binary-search
title: 二分查找变体
description: 二分查找的多种变体与边界处理技巧
---

# 二分查找变体

二分查找看似简单，但边界处理容易出错。本文总结常见变体及其模板。

## 📋 二分查找类型

| 类型 | 说明 |
|-----|------|
| 标准二分 | 查找目标值是否存在 |
| 左边界 | 查找第一个大于等于 target 的位置 |
| 右边界 | 查找最后一个小于等于 target 的位置 |
| 旋转数组 | 部分有序数组查找 |
| 答案二分 | 在答案空间上二分 |

---

## 1. 标准二分查找

### 模板

```javascript
function binarySearch(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;  // 未找到
}
```

### 关键点

- 循环条件：`left <= right`
- 中点计算：`Math.floor((left + right) / 2)` 或 `left + Math.floor((right - left) / 2)`
- 搜索区间：`[left, right]` 闭区间

---

## 2. 查找左边界

查找第一个 **大于等于** target 的位置（lower_bound）。

### 模板

```javascript
function lowerBound(nums, target) {
    let left = 0;
    let right = nums.length;  // 注意：右边界是 length
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;  // 可能是答案，保留
        }
    }
    
    return left;  // 返回第一个 >= target 的索引
}
```

### 变体：查找第一个等于 target

```javascript
function searchFirst(nums, target) {
    const idx = lowerBound(nums, target);
    
    if (idx < nums.length && nums[idx] === target) {
        return idx;
    }
    return -1;
}
```

---

## 3. 查找右边界

查找最后一个 **小于等于** target 的位置。

### 模板

```javascript
function upperBound(nums, target) {
    let left = 0;
    let right = nums.length;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] <= target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left - 1;  // 返回最后一个 <= target 的索引
}
```

### 变体：查找最后一个等于 target

```javascript
function searchLast(nums, target) {
    const idx = upperBound(nums, target);
    
    if (idx >= 0 && nums[idx] === target) {
        return idx;
    }
    return -1;
}
```

---

## 4. 查找区间

同时找到 target 的第一个和最后一个位置。

```javascript
function searchRange(nums, target) {
    const first = searchFirst(nums, target);
    
    if (first === -1) {
        return [-1, -1];
    }
    
    const last = searchLast(nums, target);
    return [first, last];
}

// 或者使用统一的 lowerBound
function searchRange2(nums, target) {
    const left = lowerBound(nums, target);
    
    if (left >= nums.length || nums[left] !== target) {
        return [-1, -1];
    }
    
    // 查找 target+1 的位置，减 1 就是最后一个 target
    const right = lowerBound(nums, target + 1) - 1;
    return [left, right];
}
```

---

## 5. 旋转排序数组

### 查找最小值

```javascript
function findMin(nums) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            // 最小值在右半部分
            left = mid + 1;
        } else {
            // 最小值在左半部分（包括 mid）
            right = mid;
        }
    }
    
    return nums[left];
}
```

### 搜索目标值

```javascript
function searchRotated(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        }
        
        // 判断哪半部分是有序的
        if (nums[left] <= nums[mid]) {
            // 左半部分有序
            if (nums[left] <= target && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            // 右半部分有序
            if (nums[mid] < target && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}
```

---

## 6. 答案二分

当答案满足单调性时，可以在答案空间上进行二分。

### 模板

```javascript
function binarySearchAnswer(nums, condition) {
    let left = MIN_ANSWER;
    let right = MAX_ANSWER;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (isValid(mid)) {
            right = mid;  // 找最小满足条件的值
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}
```

### 经典例题：在 D 天内送达包裹的最低运力

```javascript
function shipWithinDays(weights, days) {
    // 最小运力：最重的包裹
    let left = Math.max(...weights);
    // 最大运力：所有包裹一天运完
    let right = weights.reduce((a, b) => a + b, 0);
    
    function canShip(capacity) {
        let daysNeeded = 1;
        let currentWeight = 0;
        
        for (const weight of weights) {
            if (currentWeight + weight > capacity) {
                daysNeeded++;
                currentWeight = 0;
            }
            currentWeight += weight;
        }
        
        return daysNeeded <= days;
    }
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (canShip(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}
```

### 经典例题：分割数组的最大值

```javascript
function splitArray(nums, k) {
    let left = Math.max(...nums);
    let right = nums.reduce((a, b) => a + b, 0);
    
    function canSplit(maxSum) {
        let count = 1;
        let currentSum = 0;
        
        for (const num of nums) {
            if (currentSum + num > maxSum) {
                count++;
                currentSum = 0;
            }
            currentSum += num;
        }
        
        return count <= k;
    }
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (canSplit(mid)) {
            right = mid;
        } else {
            left = mid + 1;
        }
    }
    
    return left;
}
```

---

## 7. 求平方根

```javascript
function mySqrt(x) {
    if (x < 2) return x;
    
    let left = 1;
    let right = Math.floor(x / 2);
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const square = mid * mid;
        
        if (square === x) {
            return mid;
        } else if (square < x) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return right;
}
```

---

## 📝 LeetCode 练习

| 题目 | 难度 | 类型 |
|-----|------|------|
| [二分查找](https://leetcode.cn/problems/binary-search/) | 简单 | 标准 |
| [搜索插入位置](https://leetcode.cn/problems/search-insert-position/) | 简单 | 左边界 |
| [在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) | 中等 | 左右边界 |
| [搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/) | 中等 | 旋转数组 |
| [寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) | 中等 | 旋转数组 |
| [在 D 天内送达包裹的能力](https://leetcode.cn/problems/capacity-to-ship-packages-within-d-days/) | 中等 | 答案二分 |

---

## 🎯 边界总结

| 写法 | 循环条件 | 区间 | 返回值 |
|-----|---------|------|--------|
| `left ≤ right` | 闭区间 `[left, right]` | left 或 -1 |
| `left < right` | 左闭右开 `[left, right)` | left |

:::tip 记忆技巧
- 找确切值：`left <= right`，返回 mid
- 找边界：`left < right`，返回 left
- 左边界：`right = mid`
- 右边界：`left = mid + 1`，最后 `left - 1`
:::
