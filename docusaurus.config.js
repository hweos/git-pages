// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "My Site",
  tagline: "Dinosaurs are cool",
  url: "https://endiliey.github.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  deploymentBranch: "main",
  organizationName: "huangzhe007", // Usually your GitHub org/user name.
  projectName: "huangzhe007.github.io", // Usually your repo name.

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl: "https://github.com/facebook/docusaurus/edit/main/website/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: "https://github.com/HuangZhe007/git-pages/blob/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
  plugins:[
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        // language: ["en", "zh"],
        // ```
        // When applying `zh` in language, please install `nodejieba` in your project.
      },
    ]
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Test",
        logo: {
          alt: "Test Logo",
          src: "img/docusaurus.png",
        },
        items: [
          { to: "/docs", label: "Docs", position: "left" },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/HuangZhe007/git-pages",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          // {
          //   title: 'Docs',
          //   items: [
          //     {
          //       label: 'Blog',
          //       to: '/blog',
          //     },
          //   ],
          // },
          // {
          //   title: "Community",
          //   items: [
          //     {
          //       label: "Stack Overflow",
          //       href: "https://stackoverflow.com/questions/tagged/docusaurus",
          //     },
          //     {
          //       label: "Discord",
          //       href: "https://discordapp.com/invite/docusaurus",
          //     },
          //     {
          //       label: "Twitter",
          //       href: "https://twitter.com/docusaurus",
          //     },
          //   ],
          // },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/HuangZhe007/git-pages",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
