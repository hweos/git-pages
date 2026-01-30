# BFS/DFS 遍历详解

BFS（广度优先搜索）和 DFS（深度优先搜索）是图和树遍历的两种基本算法。

## 核心区别

| 特性 | BFS | DFS |
|------|-----|-----|
| 数据结构 | 队列 | 栈/递归 |
| 遍历顺序 | 层级遍历 | 一条路走到底 |
| 空间复杂度 | O(宽度) | O(深度) |
| 适用场景 | 最短路径 | 路径探索、回溯 |

## BFS 模板

### 基础模板

```javascript
function bfs(start) {
  const queue = [start];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    // 处理当前节点
    process(node);
    
    // 遍历邻居
    for (const neighbor of getNeighbors(node)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}
```

### 层级遍历模板

```javascript
function bfsWithLevel(start) {
  const queue = [start];
  const visited = new Set([start]);
  let level = 0;
  
  while (queue.length > 0) {
    const size = queue.length; // 当前层的节点数
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      
      // 处理当前节点（知道它在第几层）
      process(node, level);
      
      for (const neighbor of getNeighbors(node)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    
    level++;
  }
}
```

## DFS 模板

### 递归模板

```javascript
function dfs(node, visited = new Set()) {
  if (visited.has(node)) return;
  
  visited.add(node);
  process(node);
  
  for (const neighbor of getNeighbors(node)) {
    dfs(neighbor, visited);
  }
}
```

### 迭代模板

```javascript
function dfsIterative(start) {
  const stack = [start];
  const visited = new Set();
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (visited.has(node)) continue;
    visited.add(node);
    
    process(node);
    
    for (const neighbor of getNeighbors(node)) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }
}
```

## 二叉树遍历

### BFS - 层序遍历

```javascript
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const size = queue.length;
    const level = [];
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    result.push(level);
  }
  
  return result;
}
```

### DFS - 前中后序遍历

```javascript
// 前序遍历：根 -> 左 -> 右
function preorder(root, result = []) {
  if (!root) return result;
  
  result.push(root.val);     // 根
  preorder(root.left, result);  // 左
  preorder(root.right, result); // 右
  
  return result;
}

// 中序遍历：左 -> 根 -> 右
function inorder(root, result = []) {
  if (!root) return result;
  
  inorder(root.left, result);   // 左
  result.push(root.val);     // 根
  inorder(root.right, result);  // 右
  
  return result;
}

// 后序遍历：左 -> 右 -> 根
function postorder(root, result = []) {
  if (!root) return result;
  
  postorder(root.left, result);  // 左
  postorder(root.right, result); // 右
  result.push(root.val);      // 根
  
  return result;
}
```

## 经典题目

### 1. 二叉树的最大深度

```javascript
// DFS 解法
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// BFS 解法
function maxDepthBFS(root) {
  if (!root) return 0;
  
  const queue = [root];
  let depth = 0;
  
  while (queue.length > 0) {
    const size = queue.length;
    depth++;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return depth;
}
```

### 2. 二叉树的最小深度

```javascript
// BFS 更适合（找到第一个叶子节点就返回）
function minDepth(root) {
  if (!root) return 0;
  
  const queue = [root];
  let depth = 1;
  
  while (queue.length > 0) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      
      // 找到叶子节点
      if (!node.left && !node.right) {
        return depth;
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    
    depth++;
  }
  
  return depth;
}
```

### 3. 岛屿数量

```javascript
/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  if (!grid.length) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;
  
  function dfs(r, c) {
    // 边界检查
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    // 不是陆地
    if (grid[r][c] !== '1') return;
    
    // 标记为已访问
    grid[r][c] = '0';
    
    // 四个方向 DFS
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++;
        dfs(r, c);
      }
    }
  }
  
  return count;
}
```

### 4. 岛屿最大面积

```javascript
function maxAreaOfIsland(grid) {
  if (!grid.length) return 0;
  
  const rows = grid.length;
  const cols = grid[0].length;
  let maxArea = 0;
  
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return 0;
    if (grid[r][c] !== 1) return 0;
    
    grid[r][c] = 0; // 标记已访问
    
    return 1 + dfs(r - 1, c) + dfs(r + 1, c) + dfs(r, c - 1) + dfs(r, c + 1);
  }
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 1) {
        maxArea = Math.max(maxArea, dfs(r, c));
      }
    }
  }
  
  return maxArea;
}
```

### 5. 腐烂的橘子（多源 BFS）

```javascript
/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue = [];
  let fresh = 0;
  
  // 找出所有腐烂的橘子和新鲜橘子数量
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) {
        queue.push([r, c]);
      } else if (grid[r][c] === 1) {
        fresh++;
      }
    }
  }
  
  if (fresh === 0) return 0;
  
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let minutes = 0;
  
  while (queue.length > 0 && fresh > 0) {
    const size = queue.length;
    minutes++;
    
    for (let i = 0; i < size; i++) {
      const [r, c] = queue.shift();
      
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2;
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
  }
  
  return fresh === 0 ? minutes : -1;
}
```

### 6. 单词接龙（最短转换序列）

```javascript
/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
function ladderLength(beginWord, endWord, wordList) {
  const wordSet = new Set(wordList);
  if (!wordSet.has(endWord)) return 0;
  
  const queue = [[beginWord, 1]];
  const visited = new Set([beginWord]);
  
  while (queue.length > 0) {
    const [word, level] = queue.shift();
    
    if (word === endWord) return level;
    
    // 尝试改变每个位置的字母
    for (let i = 0; i < word.length; i++) {
      for (let c = 97; c <= 122; c++) { // a-z
        const newWord = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        
        if (wordSet.has(newWord) && !visited.has(newWord)) {
          visited.add(newWord);
          queue.push([newWord, level + 1]);
        }
      }
    }
  }
  
  return 0;
}
```

### 7. 被围绕的区域

```javascript
/**
 * @param {character[][]} board
 * @return {void}
 */
function solve(board) {
  if (!board.length) return;
  
  const rows = board.length;
  const cols = board[0].length;
  
  // 从边界开始 DFS，标记不会被围绕的 O
  function dfs(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (board[r][c] !== 'O') return;
    
    board[r][c] = 'A'; // 临时标记
    
    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }
  
  // 处理边界
  for (let r = 0; r < rows; r++) {
    dfs(r, 0);
    dfs(r, cols - 1);
  }
  for (let c = 0; c < cols; c++) {
    dfs(0, c);
    dfs(rows - 1, c);
  }
  
  // 还原
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] === 'O') {
        board[r][c] = 'X'; // 被围绕的 O
      } else if (board[r][c] === 'A') {
        board[r][c] = 'O'; // 未被围绕的 O
      }
    }
  }
}
```

### 8. 课程表（拓扑排序）

```javascript
/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  // 构建邻接表和入度数组
  const graph = Array.from({ length: numCourses }, () => []);
  const inDegree = new Array(numCourses).fill(0);
  
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course);
    inDegree[course]++;
  }
  
  // BFS - 从入度为 0 的节点开始
  const queue = [];
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  
  let count = 0;
  while (queue.length > 0) {
    const course = queue.shift();
    count++;
    
    for (const next of graph[course]) {
      inDegree[next]--;
      if (inDegree[next] === 0) {
        queue.push(next);
      }
    }
  }
  
  return count === numCourses;
}
```

### 9. 克隆图

```javascript
/**
 * @param {Node} node
 * @return {Node}
 */
function cloneGraph(node) {
  if (!node) return null;
  
  const visited = new Map();
  
  function dfs(node) {
    if (visited.has(node)) {
      return visited.get(node);
    }
    
    const clone = new Node(node.val);
    visited.set(node, clone);
    
    for (const neighbor of node.neighbors) {
      clone.neighbors.push(dfs(neighbor));
    }
    
    return clone;
  }
  
  return dfs(node);
}
```

### 10. 二叉树的右视图

```javascript
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const size = queue.length;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      
      // 每层最后一个节点
      if (i === size - 1) {
        result.push(node.val);
      }
      
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}
```

## 使用场景

| 场景 | 推荐算法 | 原因 |
|------|----------|------|
| 最短路径 | BFS | 层级遍历保证最短 |
| 路径存在性 | DFS/BFS | 都可以 |
| 所有路径 | DFS | 便于回溯记录 |
| 拓扑排序 | BFS | 入度为 0 开始 |
| 连通分量 | DFS | 递归更简洁 |
| 层级遍历 | BFS | 天然支持 |

## 常见技巧

### 方向数组

```javascript
// 四个方向
const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// 八个方向
const directions8 = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

// 使用
for (const [dr, dc] of directions) {
  const nr = r + dr;
  const nc = c + dc;
  // ...
}
```

### 边界检查

```javascript
function isValid(r, c, rows, cols) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}
```

## 总结

| 算法 | 数据结构 | 模板关键 |
|------|----------|----------|
| BFS | 队列 | 入队 → 出队 → 处理 → 邻居入队 |
| DFS | 栈/递归 | 访问 → 标记 → 递归邻居 |
