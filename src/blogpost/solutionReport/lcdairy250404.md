---
title: lc1123
icon: lightbulb
order: 2
category:
  - 解题报告
tag:
  - 解题报告
date: 2025-01-01
---
# lc1123

大家好，我们来看一天今天 LeetCode 的每日一题。

这道题的题意是找到最深的叶子结点的最近公共祖先。

### 概念

首先我们了解几个概念：

- 叶子结点：没有子节点的结点，最深的叶子节点就是深度最大的叶子节点

- 祖先：根节点到当前节点路径上经过的所有节点，比如说节点 `5` 就是节点 `2` `7` `4` 的祖先

  ![](https://s3-lc-upload.s3.amazonaws.com/uploads/2018/07/01/sketch1.png)

  

### 解题思路

我们可以先思考： 一个节点是最深叶节点的公共祖先

显然：根结点肯定是最深叶节点的公共祖先，并且当一个节点的子节点的最大深度等于

首先，当一个节点的左子树的最大深度等于右子树的最大深度，并且等于这棵二叉树的最大深度时，那么这个节点一定是部分最深子节点的最近公共祖先。

在很多满足以上条件的点中，层数最低的点，就是所有最深子节点的最近公共祖先。

Java 代码如下

```java
class Solution {
    private int maxDepth = 0; // 记录树的最大深度
    private TreeNode ans; // 记录最近公共祖先节点

    public TreeNode lcaDeepestLeaves(TreeNode root) {
        dfs(root, 0); 
        return ans; 
    }

    public int dfs(TreeNode node, int depth) {
        if (node == null) {
            // 记录当前遍历到的最大深度
            maxDepth = Math.max(depth, maxDepth);
            return depth; // 空节点返回当前深度
        }
        
        // 递归计算左右子树的深度
        int lDepth = dfs(node.left, depth + 1);
        int rDepth = dfs(node.right, depth + 1);
        
        // 如果当前节点的左右子树深度相等，且深度为最大深度，则当前节点为最近公共祖先
        if (lDepth == rDepth && lDepth == maxDepth) {
            ans = node;
        }
        
        // 返回左右子树中较大的深度
        return Math.max(lDepth, rDepth);
    }
}
```





### 复杂度分析

- 时间复杂度： $O(n)$ 。遍历每一个节点
- 空间复杂度：$O(n)$。最坏情况树是单链结构（退化成链表），递归深度为 `O(n)`，则递归栈占用 `O(n)` 空间。

