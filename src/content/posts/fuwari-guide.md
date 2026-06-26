---
title: Fuwari 博客写作指南
published: 2026-06-26
description: 本博客使用说明：Markdown 语法、扩展功能、代码块与视频嵌入，一文汇总。
tags: [Fuwari, 博客, Markdown]
category: 指南
draft: false
---

欢迎来到 **anxinrui** 的个人博客。本站基于 [Fuwari](https://github.com/saicaca/fuwari) 与 [Astro](https://astro.build/) 搭建，本文汇总了写作与排版所需的全部说明。

:::tip
新建文章命令：`pnpm new-post <文件名>`，文件默认生成在 `src/content/posts/`。
:::

## 一、文章 Front-matter

每篇文章开头用 YAML 描述元信息：

```yaml
---
title: 文章标题
published: 2026-06-26
description: 摘要，显示在首页卡片上
image: ./cover.jpg
tags: [标签一, 标签二]
category: 分类名
draft: false
---
```

| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `published` | 发布日期 |
| `description` | 摘要 |
| `image` | 封面图（网络 URL、`/public` 路径或相对路径） |
| `tags` | 标签列表 |
| `category` | 分类 |
| `draft` | `true` 时为草稿，不会公开显示 |

文件可放在 `src/content/posts/` 下，也支持子目录：

```
src/content/posts/
├── my-post.md
└── my-post/
    ├── cover.png
    └── index.md
```

## 二、Markdown 基础语法

段落之间空一行。支持 _斜体_、**粗体**、`行内代码`。

无序列表：

- 第一项
- 第二项

有序列表：

1. 第一步
2. 第二步

> 引用块可以跨越多段。

[链接](https://github.com/anxinrui)与脚注[^1]均支持。

[^1]: 脚注内容。

| 列 A | 列 B |
|------|------|
| 内容 | 内容 |

行内公式 $\omega = d\phi / dt$，独立公式：

$$I = \int \rho R^{2} dV$$

## 三、扩展功能

### GitHub 仓库卡片

::github{repo="anxinrui/anxinrui.github.io"}

语法：`::github{repo="<owner>/<repo>"}`

### 提示块

:::note
需要留意的信息。
:::

:::tip
实用小技巧。
:::

:::important
关键信息。
:::

:::warning
潜在风险。
:::

:::caution
操作后果提醒。
:::

自定义标题：`:::note[标题]`，也支持 GitHub 的 `> [!NOTE]` 语法。

### 剧透

点击展开：:spoiler[隐藏内容 **支持 Markdown**]！

## 四、代码块（Expressive Code）

Fuwari 使用 [Expressive Code](https://expressive-code.com/) 渲染代码，支持语法高亮、Diff、行标记、折叠与行号。

**语法高亮：**

```js
console.log('Hello, anxinrui!')
```

**带标题的编辑器边框：**

```js title="example.js"
export function greet(name) {
  return `Hello, ${name}`
}
```

**Diff 对比：**

```diff lang="js"
  function demo() {
-   console.log('old')
+   console.log('new')
  }
```

**行标记（删除 / 插入 / 高亮）：**

```js del={2} ins={3} {5}
function demo() {
  console.log('deleted')
  console.log('inserted')
  return true
}
```

**可折叠长代码：**

```js collapse={1-3}
import { setup } from './boilerplate'
const app = setup()
app.run()
```

**行号：**

```js showLineNumbers startLineNumber=10
console.log('line 10')
console.log('line 11')
```

## 五、嵌入视频

从 YouTube 或 Bilibili 复制 `<iframe>` 嵌入代码，直接粘贴到 Markdown 正文中即可。

```html
<iframe width="100%" height="468"
  src="https://www.youtube.com/embed/VIDEO_ID"
  allowfullscreen></iframe>
```

## 六、站点配置速查

| 配置项 | 文件 | 作用 |
|--------|------|------|
| 站点标题、Banner、主题色 | `src/config.ts` | 全局外观 |
| 导航与个人信息 | `src/config.ts` | 侧栏与导航 |
| 关于页 | `src/content/spec/about.md` | `/about/` 页面 |
| 界面文案 | `src/i18n/languages/zh_CN.ts` | 中文翻译 |

---

后续文章会在这里持续更新。如有问题，欢迎到 [GitHub](https://github.com/anxinrui/anxinrui.github.io) 提 Issue。
