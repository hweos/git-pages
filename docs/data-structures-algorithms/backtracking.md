# 回溯算法详解

回溯是一种通过探索所有可能解来找出满足条件的解的算法。

## 核心思想

回溯 = DFS + 剪枝 + 状态重置

```
做选择 → 递归 → 撤销选择
```

## 通用模板

```javascript
function backtrack(path, choices) {
  // 终止条件
  if (满足结束条件) {
    result.push([...path]); // 收集结果
    return;
  }
  
  for (const choice of choices) {
    // 剪枝（可选）
    if (不满足条件) continue;
    
    // 做选择
    path.push(choice);
    
    // 递归
    backtrack(path, 新的选择列表);
    
    // 撤销选择
    path.pop();
  }
}
```

## 经典题目

### 1. 全排列

给定一个不含重复数字的数组，返回所有可能的全排列。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  
  function backtrack(path) {
    // 终止条件：路径长度等于数组长度
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      // 跳过已使用的元素
      if (used[i]) continue;
      
      // 做选择
      path.push(nums[i]);
      used[i] = true;
      
      // 递归
      backtrack(path);
      
      // 撤销选择
      path.pop();
      used[i] = false;
    }
  }
  
  backtrack([]);
  return result;
}

// 示例
permute([1, 2, 3]);
// [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]
```

### 2. 全排列 II（含重复元素）

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permuteUnique(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  
  // 排序，便于去重
  nums.sort((a, b) => a - b);
  
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      
      // 去重：相同元素，前一个未使用时跳过
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        continue;
      }
      
      path.push(nums[i]);
      used[i] = true;
      backtrack(path);
      path.pop();
      used[i] = false;
    }
  }
  
  backtrack([]);
  return result;
}
```

### 3. 子集

给定一个不含重复元素的数组，返回所有可能的子集。

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsets(nums) {
  const result = [];
  
  function backtrack(start, path) {
    // 每个节点都是一个子集
    result.push([...path]);
    
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path); // 从 i+1 开始，避免重复
      path.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

// 示例
subsets([1, 2, 3]);
// [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
```

### 4. 子集 II（含重复元素）

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function subsetsWithDup(nums) {
  const result = [];
  nums.sort((a, b) => a - b); // 排序
  
  function backtrack(start, path) {
    result.push([...path]);
    
    for (let i = start; i < nums.length; i++) {
      // 同层去重
      if (i > start && nums[i] === nums[i - 1]) {
        continue;
      }
      
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}
```

### 5. 组合

给定 n 和 k，返回 1 到 n 中所有可能的 k 个数的组合。

```javascript
/**
 * @param {number} n
 * @param {number} k
 * @return {number[][]}
 */
function combine(n, k) {
  const result = [];
  
  function backtrack(start, path) {
    if (path.length === k) {
      result.push([...path]);
      return;
    }
    
    // 剪枝：剩余元素不足以凑齐 k 个
    const remaining = k - path.length;
    const available = n - start + 1;
    if (available < remaining) return;
    
    for (let i = start; i <= n; i++) {
      path.push(i);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  
  backtrack(1, []);
  return result;
}

// 示例
combine(4, 2);
// [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]
```

### 6. 组合总和

找出所有相加之和为 target 的组合（可重复使用）。

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum(candidates, target) {
  const result = [];
  
  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    
    if (sum > target) return; // 剪枝
    
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      // 可以重复使用，所以从 i 开始
      backtrack(i, path, sum + candidates[i]);
      path.pop();
    }
  }
  
  backtrack(0, [], 0);
  return result;
}

// 示例
combinationSum([2, 3, 6, 7], 7);
// [[2,2,3], [7]]
```

### 7. 组合总和 II（不可重复）

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
function combinationSum2(candidates, target) {
  const result = [];
  candidates.sort((a, b) => a - b);
  
  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push([...path]);
      return;
    }
    
    for (let i = start; i < candidates.length; i++) {
      // 剪枝：超过目标
      if (sum + candidates[i] > target) break;
      
      // 同层去重
      if (i > start && candidates[i] === candidates[i - 1]) {
        continue;
      }
      
      path.push(candidates[i]);
      backtrack(i + 1, path, sum + candidates[i]);
      path.pop();
    }
  }
  
  backtrack(0, [], 0);
  return result;
}
```

### 8. N 皇后

```javascript
/**
 * @param {number} n
 * @return {string[][]}
 */
function solveNQueens(n) {
  const result = [];
  const board = Array.from({ length: n }, () => '.'.repeat(n));
  
  // 检查是否可以放置皇后
  function isValid(row, col) {
    // 检查列
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false;
    }
    
    // 检查左上对角线
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false;
    }
    
    // 检查右上对角线
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false;
    }
    
    return true;
  }
  
  function backtrack(row) {
    if (row === n) {
      result.push([...board]);
      return;
    }
    
    for (let col = 0; col < n; col++) {
      if (!isValid(row, col)) continue;
      
      // 放置皇后
      board[row] = board[row].substring(0, col) + 'Q' + board[row].substring(col + 1);
      
      backtrack(row + 1);
      
      // 撤销
      board[row] = board[row].substring(0, col) + '.' + board[row].substring(col + 1);
    }
  }
  
  backtrack(0);
  return result;
}
```

### 9. 电话号码的字母组合

```javascript
/**
 * @param {string} digits
 * @return {string[]}
 */
function letterCombinations(digits) {
  if (!digits) return [];
  
  const map = {
    '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
    '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
  };
  
  const result = [];
  
  function backtrack(index, path) {
    if (index === digits.length) {
      result.push(path);
      return;
    }
    
    const letters = map[digits[index]];
    for (const letter of letters) {
      backtrack(index + 1, path + letter);
    }
  }
  
  backtrack(0, '');
  return result;
}

// 示例
letterCombinations('23');
// ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']
```

### 10. 分割回文串

```javascript
/**
 * @param {string} s
 * @return {string[][]}
 */
function partition(s) {
  const result = [];
  
  function isPalindrome(str, left, right) {
    while (left < right) {
      if (str[left] !== str[right]) return false;
      left++;
      right--;
    }
    return true;
  }
  
  function backtrack(start, path) {
    if (start === s.length) {
      result.push([...path]);
      return;
    }
    
    for (let end = start; end < s.length; end++) {
      if (isPalindrome(s, start, end)) {
        path.push(s.substring(start, end + 1));
        backtrack(end + 1, path);
        path.pop();
      }
    }
  }
  
  backtrack(0, []);
  return result;
}

// 示例
partition('aab');
// [['a', 'a', 'b'], ['aa', 'b']]
```

## 回溯三问

在写回溯前问自己：

1. **路径**：已经做出的选择
2. **选择列表**：当前可以做的选择
3. **结束条件**：到达决策树底层，无法再做选择

## 剪枝技巧

```javascript
// 1. 排序 + 跳过重复
nums.sort((a, b) => a - b);
if (i > start && nums[i] === nums[i - 1]) continue;

// 2. 提前终止
if (sum > target) return;

// 3. 可行性剪枝
if (remaining > available) return;
```

## 时间复杂度

| 问题 | 时间复杂度 |
|------|-----------|
| 全排列 | O(n! × n) |
| 子集 | O(2^n × n) |
| 组合 | O(C(n,k) × k) |
| N 皇后 | O(n!) |

## 总结

| 场景 | 关键点 |
|------|--------|
| 排列 | 使用 `used` 数组标记已选元素 |
| 组合/子集 | 使用 `start` 参数避免重复 |
| 去重 | 排序 + 跳过相同元素 |
| 剪枝 | 提前判断不可能的分支 |
