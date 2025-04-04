import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "StarryBlog",
  description: "Don‘t be so hard on yourself.",
  head: [
    // 设置 favor.ico，.vuepress/public 下
    [
        'link', { rel: 'icon', href: './assets/images/blog-avatar.png' }
    ]
],
  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
