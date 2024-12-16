import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "StarryBlog",
  description: "Don’t be so hard on yourself.",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
});
