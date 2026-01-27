---
sidebar_position: 2
slug: sorting-algorithms
title: 排序算法合集
description: 常见排序算法的原理、实现与复杂度分析
---

# 排序算法合集

本文介绍常见的排序算法，包括原理分析、代码实现和复杂度对比。

## 📊 复杂度对比

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|-----|---------|---------|------|--------|
| 冒泡排序 | O(n²) | O(n²) | O(1) | ✅ 稳定 |
| 选择排序 | O(n²) | O(n²) | O(1) | ❌ 不稳定 |
| 插入排序 | O(n²) | O(n²) | O(1) | ✅ 稳定 |
| 快速排序 | O(n log n) | O(n²) | O(log n) | ❌ 不稳定 |
| 归并排序 | O(n log n) | O(n log n) | O(n) | ✅ 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | ❌ 不稳定 |

---

## 1. 冒泡排序 (Bubble Sort)

### 原理

重复遍历数组，比较相邻元素，如果顺序错误就交换。每轮遍历将最大元素"冒泡"到末尾。

### 实现

```javascript
function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        // 如果没有交换，说明已经有序
        if (!swapped) break;
    }
    return arr;
}
```

---

## 2. 快速排序 (Quick Sort)

### 原理

选择一个基准元素（pivot），将数组分为两部分：小于基准的放左边，大于基准的放右边，然后递归处理左右两部分。

### 实现

```javascript
function quickSort(arr, left = 0, right = arr.length - 1) {
    if (left >= right) return arr;
    
    const pivotIndex = partition(arr, left, right);
    quickSort(arr, left, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, right);
    return arr;
}

function partition(arr, left, right) {
    const pivot = arr[right];  // 选择最右边的元素作为基准
    let i = left - 1;
    
    for (let j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}
```

:::tip 优化技巧
- **三数取中**：选择首、中、尾三个数的中位数作为基准，避免最坏情况
- **小数组切换**：当子数组较小时（如 < 10），切换到插入排序
:::

---

## 3. 归并排序 (Merge Sort)

### 原理

采用分治策略，将数组递归地分成两半，分别排序后再合并。

### 实现

```javascript
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}
```

---

## 4. 堆排序 (Heap Sort)

### 原理

利用堆这种数据结构，先建立大顶堆，然后依次将堆顶元素（最大值）与末尾交换，并调整堆。

### 实现

```javascript
function heapSort(arr) {
    const n = arr.length;
    
    // 建立大顶堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // 依次取出堆顶
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}
```

---

## 5. 插入排序 (Insertion Sort)

### 原理

将数组分为已排序和未排序两部分，每次从未排序部分取一个元素，插入到已排序部分的正确位置。

### 实现

```javascript
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        // 将大于 key 的元素后移
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}
```

:::info 适用场景
插入排序在数据量小或基本有序时效率很高，常用于快速排序的优化。
:::

---

## 6. 选择排序 (Selection Sort)

### 原理

每次从未排序部分找到最小元素，放到已排序部分的末尾。

### 实现

```javascript
function selectionSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        // 找到未排序部分的最小值
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }
        
        // 交换
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
        }
    }
    
    return arr;
}
```

---

## 🎯 如何选择排序算法？

| 场景 | 推荐算法 |
|-----|---------|
| 数据量小（< 50） | 插入排序 |
| 数据基本有序 | 插入排序 |
| 需要稳定排序 | 归并排序 |
| 内存受限 | 堆排序 |
| 一般情况 | 快速排序 |
| 需要最坏情况保证 | 归并排序 / 堆排序 |

---

## 📚 相关资源

- [可视化排序算法](https://visualgo.net/en/sorting)
- [LeetCode 排序题目](https://leetcode.cn/tag/sorting/)
