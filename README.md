# anxinrui 的个人博客

线上站点：https://anxinrui.github.io/

基于 [Fuwari](https://github.com/saicaca/fuwari) 主题（Astro 5 + Svelte 5 + Tailwind CSS）搭建的纯中文静态博客，托管在 GitHub Pages，push 到 `main` 自动构建部署。

## 功能

- 博文（长文）与碎碎念（短动态）两种内容形态
- 私密碎碎念：本地 AES-256-GCM 加密，页面上输密码解锁，密文才入库
- 亮暗色切换、主题色调节、响应式布局
- Pagefind 全文搜索、RSS 订阅、站点地图
- Markdown 扩展：提示块、GitHub 卡片、剧透、LaTeX 公式、Expressive Code 代码块

## 快速开始

```bash
pnpm install   # 安装依赖（仅支持 pnpm）
pnpm dev       # 本地开发 http://localhost:4321
```

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm build` | 构建到 `dist/` 并生成搜索索引 |
| `pnpm preview` | 预览构建结果 |
| `pnpm check` | 类型与内容检查 |
| `pnpm new-post <名>` | 新建博文 |
| `pnpm new-moment <名>` | 新建碎碎念 |
| `pnpm new-moment <名> --secret` | 新建私密碎碎念（明文存 `private/`，不入库） |
| `pnpm encrypt-moments` | 加密私密碎碎念并发布（密码读 `.env` 的 `MOMENT_PASSWORD`） |

## 目录速览

```
src/
├── config.ts               # 站点配置（标题、Banner、导航、头像）
├── content/posts/          # 博文
├── content/moments/        # 碎碎念（密文）
├── content/spec/about.md   # 关于页
└── components/             # UI 组件
private/moments/            # 私密碎碎念明文（gitignore，不入库）
docs/使用指南.md             # 详细写作与运维指南
```

## 文档

详细的写作、图片处理、部署说明见 [docs/使用指南.md](docs/使用指南.md)。

## 许可

- 站点内容：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-4.0/)
- 代码基于 Fuwari（MIT License）修改
