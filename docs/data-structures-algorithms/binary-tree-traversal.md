---
sidebar_position: 3
slug: binary-tree-traversal
title: 二叉树遍历
description: 二叉树的前序、中序、后序和层序遍历详解
---

# 二叉树遍历

二叉树遍历是算法面试的高频考点，本文详细介绍四种遍历方式及其递归与迭代实现。

## 🌲 二叉树节点定义

```java
public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    
    TreeNode(int val) {
        this.val = val;
    }
}
```

```javascript
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}
```

---

## 📋 遍历顺序对比

以下面这棵树为例：

```
        1
       / \
      2   3
     / \
    4   5
```

| 遍历方式 | 顺序 | 结果 |
|---------|------|------|
| 前序遍历 | 根 → 左 → 右 | [1, 2, 4, 5, 3] |
| 中序遍历 | 左 → 根 → 右 | [4, 2, 5, 1, 3] |
| 后序遍历 | 左 → 右 → 根 | [4, 5, 2, 3, 1] |
| 层序遍历 | 逐层从左到右 | [1, 2, 3, 4, 5] |

---

## 1. 前序遍历 (Preorder)

**顺序**：根节点 → 左子树 → 右子树

### 递归实现

```java
public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    preorder(root, result);
    return result;
}

private void preorder(TreeNode node, List<Integer> result) {
    if (node == null) return;
    
    result.add(node.val);        // 访问根节点
    preorder(node.left, result);  // 遍历左子树
    preorder(node.right, result); // 遍历右子树
}
```

### 迭代实现

```java
public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    
    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.add(node.val);
        
        // 先压右子节点，再压左子节点（后进先出）
        if (node.right != null) stack.push(node.right);
        if (node.left != null) stack.push(node.left);
    }
    
    return result;
}
```

```javascript
function preorderTraversal(root) {
    const result = [];
    if (!root) return result;
    
    const stack = [root];
    
    while (stack.length) {
        const node = stack.pop();
        result.push(node.val);
        
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    
    return result;
}
```

---

## 2. 中序遍历 (Inorder)

**顺序**：左子树 → 根节点 → 右子树

:::tip 重要性质
对于**二叉搜索树 (BST)**，中序遍历的结果是有序的！
:::

### 递归实现

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    inorder(root, result);
    return result;
}

private void inorder(TreeNode node, List<Integer> result) {
    if (node == null) return;
    
    inorder(node.left, result);   // 遍历左子树
    result.add(node.val);         // 访问根节点
    inorder(node.right, result);  // 遍历右子树
}
```

### 迭代实现

```java
public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode curr = root;
    
    while (curr != null || !stack.isEmpty()) {
        // 一直往左走，将所有左节点压栈
        while (curr != null) {
            stack.push(curr);
            curr = curr.left;
        }
        
        // 弹出栈顶节点
        curr = stack.pop();
        result.add(curr.val);
        
        // 转向右子树
        curr = curr.right;
    }
    
    return result;
}
```

```javascript
function inorderTraversal(root) {
    const result = [];
    const stack = [];
    let curr = root;
    
    while (curr || stack.length) {
        while (curr) {
            stack.push(curr);
            curr = curr.left;
        }
        
        curr = stack.pop();
        result.push(curr.val);
        curr = curr.right;
    }
    
    return result;
}
```

---

## 3. 后序遍历 (Postorder)

**顺序**：左子树 → 右子树 → 根节点

### 递归实现

```java
public List<Integer> postorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    postorder(root, result);
    return result;
}

private void postorder(TreeNode node, List<Integer> result) {
    if (node == null) return;
    
    postorder(node.left, result);  // 遍历左子树
    postorder(node.right, result); // 遍历右子树
    result.add(node.val);          // 访问根节点
}
```

### 迭代实现

```java
// 技巧：后序 = 前序（根右左）的逆序
public List<Integer> postorderTraversal(TreeNode root) {
    LinkedList<Integer> result = new LinkedList<>();
    if (root == null) return result;
    
    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.addFirst(node.val);  // 头插法
        
        // 先压左，再压右
        if (node.left != null) stack.push(node.left);
        if (node.right != null) stack.push(node.right);
    }
    
    return result;
}
```

```javascript
function postorderTraversal(root) {
    const result = [];
    if (!root) return result;
    
    const stack = [root];
    
    while (stack.length) {
        const node = stack.pop();
        result.unshift(node.val);  // 头部插入
        
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    
    return result;
}
```

---

## 4. 层序遍历 (Level Order)

**顺序**：逐层从左到右遍历

### BFS 实现

```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    
    while (!queue.isEmpty()) {
        int levelSize = queue.size();
        List<Integer> level = new ArrayList<>();
        
        for (int i = 0; i < levelSize; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        
        result.add(level);
    }
    
    return result;
}
```

```javascript
function levelOrder(root) {
    const result = [];
    if (!root) return result;
    
    const queue = [root];
    
    while (queue.length) {
        const levelSize = queue.length;
        const level = [];
        
        for (let i = 0; i < levelSize; i++) {
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

---

## 🔄 Morris 遍历（进阶）

Morris 遍历可以实现 **O(1) 空间复杂度**的遍历，利用叶子节点的空指针。

```java
// Morris 中序遍历
public List<Integer> morrisInorder(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    TreeNode curr = root;
    
    while (curr != null) {
        if (curr.left == null) {
            result.add(curr.val);
            curr = curr.right;
        } else {
            // 找到左子树的最右节点
            TreeNode predecessor = curr.left;
            while (predecessor.right != null && predecessor.right != curr) {
                predecessor = predecessor.right;
            }
            
            if (predecessor.right == null) {
                // 建立线索
                predecessor.right = curr;
                curr = curr.left;
            } else {
                // 恢复树结构
                predecessor.right = null;
                result.add(curr.val);
                curr = curr.right;
            }
        }
    }
    
    return result;
}
```

---

## 📝 常见面试题

| 题目 | 难度 | 链接 |
|-----|------|------|
| 二叉树的前序遍历 | 简单 | [LeetCode 144](https://leetcode.cn/problems/binary-tree-preorder-traversal/) |
| 二叉树的中序遍历 | 简单 | [LeetCode 94](https://leetcode.cn/problems/binary-tree-inorder-traversal/) |
| 二叉树的后序遍历 | 简单 | [LeetCode 145](https://leetcode.cn/problems/binary-tree-postorder-traversal/) |
| 二叉树的层序遍历 | 中等 | [LeetCode 102](https://leetcode.cn/problems/binary-tree-level-order-traversal/) |
| 验证二叉搜索树 | 中等 | [LeetCode 98](https://leetcode.cn/problems/validate-binary-search-tree/) |
| 二叉树的最大深度 | 简单 | [LeetCode 104](https://leetcode.cn/problems/maximum-depth-of-binary-tree/) |

---

## 🎯 记忆技巧

```
前序：根左右 → 根在前
中序：左根右 → 根在中
后序：左右根 → 根在后
```

迭代实现关键：
- **前序**：栈，先右后左入栈
- **中序**：栈，一直往左走
- **后序**：栈 + 头插法（或双栈）
- **层序**：队列
