import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/blogpost/": [
    "",
    {
      text: "解题报告",
      icon: "lightbulb",
      prefix: "solutionReport/",
      link: "solutionReport/",
      children: "structure",
    },
  ],

});
