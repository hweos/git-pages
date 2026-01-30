# 贪心算法入门

贪心算法在每一步选择中都采取当前状态下最优的选择，希望导致全局最优解。

## 核心思想

- 每一步都做出**局部最优**选择
- 期望通过局部最优达到**全局最优**
- 不回退，不考虑未来

## 贪心 vs 动态规划

| 特点 | 贪心 | 动态规划 |
|------|------|----------|
| 决策方式 | 每步最优 | 考虑所有子问题 |
| 回溯 | 不回溯 | 可能回溯 |
| 时间复杂度 | 通常更低 | 通常更高 |
| 适用条件 | 贪心选择性质 + 最优子结构 | 最优子结构 + 重叠子问题 |

## 经典题目

### 1. 分发饼干

每个孩子有一个满足度，每块饼干有一个尺寸，求最多能满足多少孩子。

```javascript
/**
 * @param {number[]} g - 孩子的满足度
 * @param {number[]} s - 饼干尺寸
 * @return {number}
 */
function findContentChildren(g, s) {
  // 排序
  g.sort((a, b) => a - b);
  s.sort((a, b) => a - b);
  
  let child = 0;
  let cookie = 0;
  
  // 尽量用小饼干满足胃口小的孩子
  while (child < g.length && cookie < s.length) {
    if (s[cookie] >= g[child]) {
      child++; // 满足了一个孩子
    }
    cookie++; // 尝试下一块饼干
  }
  
  return child;
}
```

### 2. 买卖股票的最佳时机 II

可以多次买卖，求最大利润。

```javascript
/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  let profit = 0;
  
  // 贪心：只要今天比昨天贵，就在昨天买今天卖
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      profit += prices[i] - prices[i - 1];
    }
  }
  
  return profit;
}

// 示例
maxProfit([7, 1, 5, 3, 6, 4]); // 7
// 第2天买，第3天卖：5-1=4
// 第4天买，第5天卖：6-3=3
```

### 3. 跳跃游戏

数组中每个元素表示你在该位置可以跳跃的最大长度，判断能否到达最后一个位置。

```javascript
/**
 * @param {number[]} nums
 * @return {boolean}
 */
function canJump(nums) {
  let maxReach = 0;
  
  for (let i = 0; i < nums.length; i++) {
    // 如果当前位置超过了能到达的最远位置
    if (i > maxReach) return false;
    
    // 更新能到达的最远位置
    maxReach = Math.max(maxReach, i + nums[i]);
    
    // 如果已经能到达终点
    if (maxReach >= nums.length - 1) return true;
  }
  
  return true;
}
```

### 4. 跳跃游戏 II

求到达最后位置的最少跳跃次数。

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function jump(nums) {
  if (nums.length <= 1) return 0;
  
  let jumps = 0;
  let currentEnd = 0;   // 当前跳跃能到达的边界
  let farthest = 0;     // 能到达的最远位置
  
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    
    // 到达当前跳跃的边界，必须跳跃
    if (i === currentEnd) {
      jumps++;
      currentEnd = farthest;
      
      if (currentEnd >= nums.length - 1) break;
    }
  }
  
  return jumps;
}
```

### 5. 加油站

环形路线上有 n 个加油站，每个站有油 gas[i]，到下一站需要 cost[i]，求能跑完全程的起点。

```javascript
/**
 * @param {number[]} gas
 * @param {number[]} cost
 * @return {number}
 */
function canCompleteCircuit(gas, cost) {
  let totalGas = 0;
  let currentGas = 0;
  let startStation = 0;
  
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    totalGas += diff;
    currentGas += diff;
    
    // 如果当前油量为负，从下一站重新开始
    if (currentGas < 0) {
      startStation = i + 1;
      currentGas = 0;
    }
  }
  
  // 如果总油量大于等于总消耗，一定有解
  return totalGas >= 0 ? startStation : -1;
}
```

### 6. 分发糖果

每个孩子有一个评分，相邻的孩子评分高的要多分糖果，每人至少一个，求最少需要多少糖果。

```javascript
/**
 * @param {number[]} ratings
 * @return {number}
 */
function candy(ratings) {
  const n = ratings.length;
  const candies = new Array(n).fill(1);
  
  // 从左到右：右边比左边评分高，糖果+1
  for (let i = 1; i < n; i++) {
    if (ratings[i] > ratings[i - 1]) {
      candies[i] = candies[i - 1] + 1;
    }
  }
  
  // 从右到左：左边比右边评分高，取较大值
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) {
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);
    }
  }
  
  return candies.reduce((a, b) => a + b, 0);
}
```

### 7. 无重叠区间

给定区间集合，求最少删除多少个区间使得剩余区间不重叠。

```javascript
/**
 * @param {number[][]} intervals
 * @return {number}
 */
function eraseOverlapIntervals(intervals) {
  if (intervals.length === 0) return 0;
  
  // 按结束时间排序
  intervals.sort((a, b) => a[1] - b[1]);
  
  let count = 1;          // 不重叠的区间数
  let end = intervals[0][1]; // 当前区间的结束时间
  
  for (let i = 1; i < intervals.length; i++) {
    // 如果当前区间的开始时间 >= 上一个区间的结束时间
    if (intervals[i][0] >= end) {
      count++;
      end = intervals[i][1];
    }
    // 否则删除当前区间（贪心：保留结束时间早的）
  }
  
  return intervals.length - count;
}
```

### 8. 用最少数量的箭引爆气球

```javascript
/**
 * @param {number[][]} points
 * @return {number}
 */
function findMinArrowPoints(points) {
  if (points.length === 0) return 0;
  
  // 按结束位置排序
  points.sort((a, b) => a[1] - b[1]);
  
  let arrows = 1;
  let end = points[0][1];
  
  for (let i = 1; i < points.length; i++) {
    // 如果当前气球的开始位置 > 上一支箭的位置
    if (points[i][0] > end) {
      arrows++;
      end = points[i][1];
    }
  }
  
  return arrows;
}
```

### 9. 合并区间

```javascript
/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  if (intervals.length <= 1) return intervals;
  
  // 按开始时间排序
  intervals.sort((a, b) => a[0] - b[0]);
  
  const result = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const last = result[result.length - 1];
    const current = intervals[i];
    
    if (current[0] <= last[1]) {
      // 重叠，合并
      last[1] = Math.max(last[1], current[1]);
    } else {
      // 不重叠，添加新区间
      result.push(current);
    }
  }
  
  return result;
}
```

### 10. 划分字母区间

把字符串划分为尽量多的片段，同一字母最多出现在一个片段中。

```javascript
/**
 * @param {string} s
 * @return {number[]}
 */
function partitionLabels(s) {
  // 记录每个字母最后出现的位置
  const last = {};
  for (let i = 0; i < s.length; i++) {
    last[s[i]] = i;
  }
  
  const result = [];
  let start = 0;
  let end = 0;
  
  for (let i = 0; i < s.length; i++) {
    // 更新当前片段的结束位置
    end = Math.max(end, last[s[i]]);
    
    // 到达片段结束位置
    if (i === end) {
      result.push(end - start + 1);
      start = i + 1;
    }
  }
  
  return result;
}

// 示例
partitionLabels('ababcbacadefegdehijhklij');
// [9, 7, 8]
```

### 11. 最大子数组和

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    // 贪心：如果之前的和为负数，从当前位置重新开始
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
}
```

### 12. 会议室 II

求同时进行的会议最大数量（需要的会议室数量）。

```javascript
/**
 * @param {number[][]} intervals
 * @return {number}
 */
function minMeetingRooms(intervals) {
  if (intervals.length === 0) return 0;
  
  // 分别提取开始和结束时间
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);
  
  let rooms = 0;
  let endIdx = 0;
  
  for (let i = 0; i < intervals.length; i++) {
    if (starts[i] < ends[endIdx]) {
      // 需要新会议室
      rooms++;
    } else {
      // 可以复用会议室
      endIdx++;
    }
  }
  
  return rooms;
}
```

## 贪心适用条件

### 贪心选择性质

做出贪心选择后，只需要解决剩下的子问题，不需要重新考虑之前的选择。

### 最优子结构

问题的最优解包含子问题的最优解。

## 如何验证贪心

1. **数学证明**：证明局部最优 → 全局最优
2. **反证法**：假设贪心解不是最优，推导矛盾
3. **举反例**：尝试找出反例，找不到可能是贪心

## 常见贪心策略

| 策略 | 示例 |
|------|------|
| 排序 + 贪心 | 区间调度、分发饼干 |
| 从两端开始 | 接雨水、盛水容器 |
| 局部最优 | 跳跃游戏、股票买卖 |
| 两次遍历 | 分发糖果（左右各一次） |

## 总结

贪心算法适用于：

1. 问题可以分解为子问题
2. 子问题的最优解能递推到最终问题
3. 贪心选择是安全的（不会影响最终结果）

不适用时考虑动态规划或回溯。
