---
sidebar_position: 4
slug: dynamic-programming
title: 动态规划入门
description: 动态规划的核心思想、解题模板与经典例题
---

# 动态规划入门

动态规划（Dynamic Programming，简称 DP）是算法中最重要的思想之一，掌握它能解决大量面试题。

## 🧠 核心思想

动态规划的本质是**记忆化搜索**，通过保存子问题的解来避免重复计算。

### DP 问题的特征

1. **最优子结构**：问题的最优解包含子问题的最优解
2. **重叠子问题**：相同的子问题会被重复计算
3. **无后效性**：当前状态确定后，不受之后决策影响

---

## 📝 解题模板

```
1. 定义状态：dp[i] 表示什么？
2. 状态转移方程：dp[i] 与 dp[i-1]... 的关系
3. 初始条件：dp[0] = ?
4. 遍历顺序：从小到大 or 从大到小
5. 返回结果：dp[n] or max(dp[...])
```

---

## 1. 斐波那契数列

最经典的 DP 入门题，帮助理解 DP 的本质。

### 问题

求第 n 个斐波那契数：`F(n) = F(n-1) + F(n-2)`

### 递归（会超时）

```java
public int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);  // 大量重复计算
}
```

### 记忆化搜索

```java
public int fib(int n) {
    int[] memo = new int[n + 1];
    Arrays.fill(memo, -1);
    return helper(n, memo);
}

private int helper(int n, int[] memo) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];
    
    memo[n] = helper(n - 1, memo) + helper(n - 2, memo);
    return memo[n];
}
```

### 动态规划

```java
public int fib(int n) {
    if (n <= 1) return n;
    
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}
```

### 空间优化

```java
public int fib(int n) {
    if (n <= 1) return n;
    
    int prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```

---

## 2. 爬楼梯

### 问题

每次可以爬 1 或 2 个台阶，爬到第 n 阶有多少种方法？

### 分析

- 到达第 n 阶，可以从第 n-1 阶爬 1 步，或从第 n-2 阶爬 2 步
- `dp[n] = dp[n-1] + dp[n-2]`

### 实现

```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```

```javascript
function climbStairs(n) {
    if (n <= 2) return n;
    
    let prev2 = 1, prev1 = 2;
    for (let i = 3; i <= n; i++) {
        const curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```

---

## 3. 最大子数组和

### 问题

找到数组中和最大的连续子数组。

### 分析

- `dp[i]` 表示以 `nums[i]` 结尾的最大子数组和
- `dp[i] = max(dp[i-1] + nums[i], nums[i])`

### 实现

```java
public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currSum = nums[0];
    
    for (int i = 1; i < nums.length; i++) {
        currSum = Math.max(currSum + nums[i], nums[i]);
        maxSum = Math.max(maxSum, currSum);
    }
    
    return maxSum;
}
```

```javascript
function maxSubArray(nums) {
    let maxSum = nums[0];
    let currSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currSum = Math.max(currSum + nums[i], nums[i]);
        maxSum = Math.max(maxSum, currSum);
    }
    
    return maxSum;
}
```

---

## 4. 打家劫舍

### 问题

不能偷相邻的房屋，求能偷到的最大金额。

### 分析

- `dp[i]` 表示偷到第 i 个房屋时的最大金额
- 对于第 i 个房屋，可以选择偷或不偷：
  - 偷：`dp[i-2] + nums[i]`
  - 不偷：`dp[i-1]`
- `dp[i] = max(dp[i-2] + nums[i], dp[i-1])`

### 实现

```java
public int rob(int[] nums) {
    if (nums.length == 1) return nums[0];
    
    int prev2 = 0, prev1 = 0;
    
    for (int num : nums) {
        int curr = Math.max(prev2 + num, prev1);
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```

```javascript
function rob(nums) {
    let prev2 = 0, prev1 = 0;
    
    for (const num of nums) {
        const curr = Math.max(prev2 + num, prev1);
        prev2 = prev1;
        prev1 = curr;
    }
    
    return prev1;
}
```

---

## 5. 0-1 背包问题

### 问题

有 n 个物品，每个物品有重量 `w[i]` 和价值 `v[i]`。背包容量为 W，每个物品只能选一次，求最大价值。

### 分析

- `dp[i][j]` 表示前 i 个物品、容量为 j 时的最大价值
- 对于第 i 个物品：
  - 不选：`dp[i][j] = dp[i-1][j]`
  - 选（需要 `j >= w[i]`）：`dp[i][j] = dp[i-1][j-w[i]] + v[i]`

### 实现

```java
public int knapsack(int[] w, int[] v, int W) {
    int n = w.length;
    int[][] dp = new int[n + 1][W + 1];
    
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= W; j++) {
            // 不选第 i 个物品
            dp[i][j] = dp[i - 1][j];
            
            // 选第 i 个物品
            if (j >= w[i - 1]) {
                dp[i][j] = Math.max(dp[i][j], 
                    dp[i - 1][j - w[i - 1]] + v[i - 1]);
            }
        }
    }
    
    return dp[n][W];
}
```

### 空间优化（一维数组）

```java
public int knapsack(int[] w, int[] v, int W) {
    int[] dp = new int[W + 1];
    
    for (int i = 0; i < w.length; i++) {
        // 必须逆序遍历，避免重复使用同一物品
        for (int j = W; j >= w[i]; j--) {
            dp[j] = Math.max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    
    return dp[W];
}
```

:::warning 注意
0-1 背包一维优化时，必须**逆序**遍历容量！否则会重复选择同一物品。
:::

---

## 6. 最长递增子序列 (LIS)

### 问题

找到数组中最长的严格递增子序列的长度。

### 分析

- `dp[i]` 表示以 `nums[i]` 结尾的 LIS 长度
- `dp[i] = max(dp[j] + 1)`，其中 `j < i` 且 `nums[j] < nums[i]`

### O(n²) 实现

```java
public int lengthOfLIS(int[] nums) {
    int n = nums.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[j] < nums[i]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    
    return maxLen;
}
```

### O(n log n) 优化

```java
public int lengthOfLIS(int[] nums) {
    List<Integer> tails = new ArrayList<>();
    
    for (int num : nums) {
        int pos = Collections.binarySearch(tails, num);
        if (pos < 0) pos = -(pos + 1);
        
        if (pos == tails.size()) {
            tails.add(num);
        } else {
            tails.set(pos, num);
        }
    }
    
    return tails.size();
}
```

---

## 🎯 DP 问题分类

| 类型 | 经典题目 |
|-----|---------|
| 线性 DP | 爬楼梯、打家劫舍、最大子数组和 |
| 背包 DP | 0-1 背包、完全背包、零钱兑换 |
| 区间 DP | 最长回文子串、戳气球 |
| 树形 DP | 打家劫舍 III、二叉树最大路径和 |
| 状态压缩 DP | 旅行商问题、N 皇后 |

---

## 📚 推荐练习

| 题目 | 难度 | 类型 |
|-----|------|------|
| [爬楼梯](https://leetcode.cn/problems/climbing-stairs/) | 简单 | 入门 |
| [打家劫舍](https://leetcode.cn/problems/house-robber/) | 中等 | 线性 DP |
| [零钱兑换](https://leetcode.cn/problems/coin-change/) | 中等 | 完全背包 |
| [最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/) | 中等 | 线性 DP |
| [编辑距离](https://leetcode.cn/problems/edit-distance/) | 困难 | 二维 DP |

---

## 💡 解题心法

1. **先暴力递归**：想清楚递归关系
2. **画递归树**：找到重复子问题
3. **加备忘录**：记忆化搜索
4. **改成 DP**：自底向上迭代
5. **空间优化**：观察状态转移，减少数组维度
