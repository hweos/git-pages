import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './roadmap.module.css';

interface Resource {
  label: string;
  link: string;
  type?: 'internal' | 'external';
}

interface RoadmapNode {
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  resources: Resource[];
  tips?: string[];
  projects?: string[];
}

interface Roadmap {
  id: string;
  title: string;
  icon: string;
  description: string;
  color: string;
  totalDuration: string;
  stages: RoadmapNode[];
}

const roadmaps: Roadmap[] = [
  {
    id: 'frontend',
    title: '前端开发',
    icon: '🎨',
    color: '#667eea',
    description: '从零基础到资深前端工程师的完整学习路径',
    totalDuration: '12-18 个月',
    stages: [
      {
        title: '第一阶段：基础入门',
        description: '掌握 Web 开发的三大基石，建立扎实的基础',
        duration: '2-3 个月',
        difficulty: 'beginner',
        skills: ['HTML5 语义化标签', 'CSS3 选择器与盒模型', 'Flexbox 与 Grid 布局', 'CSS 动画与过渡', 'JavaScript ES6+ 语法', 'DOM 操作与事件', 'Git 版本控制', '浏览器开发者工具'],
        resources: [
          { label: 'JavaScript 核心概念', link: '/docs/frontend/javascript-core' },
          { label: 'CSS 布局技巧', link: '/docs/frontend/css-layout' },
          { label: 'CSS 动画与过渡', link: '/blog/css-animation' },
          { label: 'Git 工作流', link: '/blog/git-workflow' },
          { label: 'Chrome DevTools', link: '/docs/misc/chrome-devtools' },
          { label: 'MDN Web Docs', link: 'https://developer.mozilla.org/', type: 'external' },
        ],
        tips: [
          '不要急于学框架，先把 JS 基础打牢',
          '多动手写项目，从静态页面开始',
          '学会使用浏览器开发者工具调试',
        ],
        projects: ['个人简历页面', '响应式博客首页', 'TodoList 应用'],
      },
      {
        title: '第二阶段：框架学习',
        description: '掌握现代前端框架和 TypeScript，提升开发效率',
        duration: '3-4 个月',
        difficulty: 'intermediate',
        skills: ['React 核心概念', 'Hooks 深入理解', '组件设计模式', '状态管理方案', 'React Router', 'TypeScript 类型系统', 'Next.js / Vite', 'CSS Modules / Tailwind'],
        resources: [
          { label: 'React Hooks 详解', link: '/docs/frontend/react-hooks' },
          { label: 'React 组件设计模式', link: '/docs/frontend/react-patterns' },
          { label: 'TypeScript 技巧', link: '/docs/frontend/typescript-tips' },
          { label: '状态管理对比', link: '/blog/state-management' },
          { label: 'React 性能优化', link: '/blog/react-performance' },
          { label: 'Tailwind CSS 实践', link: '/blog/tailwindcss-guide' },
          { label: 'Next.js App Router', link: '/blog/nextjs-app-router' },
          { label: 'React 官方文档', link: 'https://react.dev/', type: 'external' },
        ],
        tips: [
          '理解 React 的心智模型，而不只是 API',
          'TypeScript 从项目开始就用，不要后期迁移',
          '多看优秀开源项目的代码',
        ],
        projects: ['电商商品列表', '后台管理系统', '在线 Markdown 编辑器'],
      },
      {
        title: '第三阶段：工程化',
        description: '理解现代前端工程化体系，提升团队协作效率',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['Vite / Webpack 配置', 'ESLint + Prettier', 'Husky + lint-staged', 'Jest / Vitest 测试', 'E2E 测试 (Playwright)', 'CI/CD 流水线', 'Monorepo 管理', 'npm/pnpm 包管理'],
        resources: [
          { label: 'Vite 配置指南', link: '/docs/frontend/vite-guide' },
          { label: '前端工程化配置', link: '/docs/frontend/engineering' },
          { label: 'CI/CD 流水线', link: '/blog/cicd-pipeline' },
          { label: 'Monorepo 实践', link: '/blog/monorepo-guide' },
          { label: '单元测试入门', link: '/blog/unit-testing-guide' },
          { label: 'npm/pnpm 实践', link: '/blog/npm-pnpm-guide' },
        ],
        tips: [
          '从简单配置开始，逐步添加复杂功能',
          '测试覆盖率不是越高越好，关注核心逻辑',
          'CI/CD 自动化能大幅提升效率',
        ],
        projects: ['搭建团队脚手架', '配置完整 CI 流程', '发布 npm 包'],
      },
      {
        title: '第四阶段：性能与体验',
        description: '优化应用性能，提升用户体验，打造极致产品',
        duration: '2-3 个月',
        difficulty: 'advanced',
        skills: ['Core Web Vitals', '加载性能优化', '运行时性能优化', '图片/字体优化', '代码分割与懒加载', '无障碍 (a11y)', '国际化 (i18n)', '前端监控'],
        resources: [
          { label: 'Web 性能指标', link: '/blog/web-vitals' },
          { label: '浏览器渲染原理', link: '/blog/browser-rendering' },
          { label: '无障碍开发', link: '/blog/accessibility-guide' },
          { label: '国际化实践', link: '/blog/i18n-guide' },
          { label: '前端监控埋点', link: '/blog/frontend-monitoring' },
          { label: '响应式设计', link: '/blog/responsive-design' },
        ],
        tips: [
          '性能优化要有数据支撑，先测量再优化',
          '无障碍不是可选项，是基本要求',
          '建立监控体系，线上问题及时发现',
        ],
        projects: ['性能优化专项', '监控 SDK 开发', 'PWA 改造'],
      },
      {
        title: '第五阶段：架构与进阶',
        description: '掌握高级技术，具备架构设计能力',
        duration: '持续学习',
        difficulty: 'advanced',
        skills: ['微前端架构', 'SSR/SSG/ISR', '设计模式应用', '函数式编程', '跨端开发', '低代码平台', '技术选型能力', '团队技术建设'],
        resources: [
          { label: '微前端架构', link: '/blog/micro-frontend' },
          { label: 'SSR vs SSG vs ISR', link: '/blog/ssr-ssg-isr' },
          { label: '设计模式', link: '/blog/design-patterns-frontend' },
          { label: '函数式编程', link: '/blog/functional-programming' },
          { label: '代码评审最佳实践', link: '/blog/code-review' },
          { label: 'Electron 桌面应用', link: '/blog/electron-guide' },
        ],
        tips: [
          '架构没有银弹，适合的才是最好的',
          '多参与技术分享，输出倒逼输入',
          '关注业务价值，技术服务于业务',
        ],
        projects: ['微前端落地实践', '组件库建设', '技术方案设计'],
      },
    ],
  },
  {
    id: 'backend',
    title: '后端开发',
    icon: '⚙️',
    color: '#f59e0b',
    description: '从语言基础到系统架构的后端成长之路',
    totalDuration: '12-18 个月',
    stages: [
      {
        title: '第一阶段：语言基础',
        description: '选择一门后端语言并深入学习其核心特性',
        duration: '2-3 个月',
        difficulty: 'beginner',
        skills: ['Node.js 运行时', 'JavaScript/TypeScript', 'Go / Java / Python', '异步编程模型', '错误处理', '包管理工具', '调试技巧', '代码规范'],
        resources: [
          { label: 'Node.js 入门指南', link: '/docs/backend/nodejs-intro' },
          { label: 'JavaScript 异步编程', link: '/blog/async-javascript' },
          { label: 'npm/pnpm 实践', link: '/blog/npm-pnpm-guide' },
          { label: 'Node.js CLI 开发', link: '/blog/nodejs-cli' },
          { label: 'Node.js 官方文档', link: 'https://nodejs.org/docs/', type: 'external' },
        ],
        tips: [
          '先精通一门语言，再学习其他语言',
          '理解异步编程是 Node.js 的关键',
          '养成写单元测试的习惯',
        ],
        projects: ['CLI 工具', '文件处理脚本', '简单 HTTP 服务'],
      },
      {
        title: '第二阶段：数据库',
        description: '掌握数据存储、查询与优化',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['SQL 基础语法', 'MySQL / PostgreSQL', '索引原理与优化', 'Redis 缓存', 'MongoDB 文档数据库', '数据库设计范式', 'ORM 框架', '事务与锁'],
        resources: [
          { label: '数据库设计基础', link: '/docs/backend/database-design' },
          { label: '数据库索引优化', link: '/blog/database-index' },
        ],
        tips: [
          '先学好 SQL，再学 ORM',
          '索引不是越多越好，要根据查询优化',
          'Redis 不只是缓存，还有很多数据结构',
        ],
        projects: ['博客数据库设计', '缓存层封装', '数据迁移脚本'],
      },
      {
        title: '第三阶段：API 开发',
        description: '构建可靠、安全、易用的后端服务',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['RESTful API 设计', 'GraphQL', 'JWT 认证', 'OAuth 2.0', 'API 文档 (OpenAPI)', '输入验证', '错误处理规范', '限流与防刷'],
        resources: [
          { label: 'RESTful API 设计规范', link: '/docs/backend/restful-api' },
          { label: 'RESTful API 实践', link: '/blog/restful-api-design' },
          { label: 'GraphQL 入门', link: '/blog/graphql-intro' },
          { label: '前端安全实践', link: '/blog/frontend-security' },
        ],
        tips: [
          'API 设计要考虑向后兼容',
          '安全永远是第一位的',
          '好的文档能减少大量沟通成本',
        ],
        projects: ['用户认证系统', 'API 网关', '开放平台接口'],
      },
      {
        title: '第四阶段：部署运维',
        description: '让服务稳定、高效地运行',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['Linux 基础命令', 'Docker 容器化', 'Docker Compose', 'Nginx 配置', 'CI/CD 流水线', '日志管理', '监控告警', 'PM2 进程管理'],
        resources: [
          { label: 'Docker Compose 实践', link: '/docs/devops/docker-compose' },
          { label: 'GitHub Actions 入门', link: '/docs/devops/github-actions' },
          { label: 'Docker 指南', link: '/docs/misc/docker-guide' },
          { label: 'Nginx 配置', link: '/docs/misc/nginx-guide' },
          { label: 'Linux 常用命令', link: '/docs/misc/linux-commands' },
          { label: 'PM2 进程管理', link: '/docs/misc/pm2-guide' },
        ],
        tips: [
          'Docker 是现代部署的基础技能',
          '自动化一切可以自动化的事情',
          '完善的监控能提前发现问题',
        ],
        projects: ['Docker 化部署', '自动化发布流程', '监控告警系统'],
      },
      {
        title: '第五阶段：架构进阶',
        description: '设计高可用、可扩展的分布式系统',
        duration: '持续学习',
        difficulty: 'advanced',
        skills: ['微服务架构', '消息队列', '分布式事务', '服务注册发现', '负载均衡', '高可用设计', '性能调优', 'Serverless'],
        resources: [
          { label: '消息队列入门', link: '/blog/message-queue-intro' },
          { label: 'Serverless 开发', link: '/blog/serverless-guide' },
          { label: 'WebSocket 实时通信', link: '/blog/websocket-guide' },
        ],
        tips: [
          '不要为了微服务而微服务',
          '分布式系统的复杂性远超想象',
          '读优秀的开源项目源码',
        ],
        projects: ['消息队列实践', '分布式任务调度', '服务拆分改造'],
      },
    ],
  },
  {
    id: 'fullstack',
    title: '全栈开发',
    icon: '🚀',
    color: '#10b981',
    description: '前后端通吃，独立交付完整产品',
    totalDuration: '18-24 个月',
    stages: [
      {
        title: '第一阶段：前端基础',
        description: '掌握现代前端开发技术栈',
        duration: '3-4 个月',
        difficulty: 'beginner',
        skills: ['HTML/CSS/JavaScript', 'React + TypeScript', 'Tailwind CSS', '响应式设计', '前端工程化', 'Git 协作'],
        resources: [
          { label: 'CSS 布局技巧', link: '/docs/frontend/css-layout' },
          { label: 'TypeScript 技巧', link: '/docs/frontend/typescript-tips' },
          { label: 'React 性能优化', link: '/blog/react-performance' },
          { label: 'Tailwind CSS', link: '/blog/tailwindcss-guide' },
        ],
        tips: [
          '全栈不是什么都会，而是能独立交付',
          '先专精一端，再拓展另一端',
        ],
        projects: ['个人作品集网站', 'UI 组件库'],
      },
      {
        title: '第二阶段：后端入门',
        description: '学习服务端开发和数据库',
        duration: '3-4 个月',
        difficulty: 'intermediate',
        skills: ['Node.js/Express', 'RESTful API', 'PostgreSQL/MySQL', 'Redis 缓存', 'JWT 认证', 'API 文档'],
        resources: [
          { label: 'RESTful API 设计', link: '/blog/restful-api-design' },
          { label: '数据库索引优化', link: '/blog/database-index' },
          { label: 'JavaScript 异步', link: '/blog/async-javascript' },
        ],
        tips: [
          'Node.js 让前端工程师更容易入门后端',
          '数据库设计是后端的核心技能',
        ],
        projects: ['博客后端 API', '用户认证服务'],
      },
      {
        title: '第三阶段：全栈框架',
        description: '使用全栈框架提升开发效率',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['Next.js App Router', 'Server Components', 'Server Actions', 'Prisma ORM', 'tRPC', 'Vercel 部署'],
        resources: [
          { label: 'Next.js App Router', link: '/blog/nextjs-app-router' },
          { label: 'SSR/SSG/ISR 对比', link: '/blog/ssr-ssg-isr' },
          { label: 'Serverless 开发', link: '/blog/serverless-guide' },
        ],
        tips: [
          'Next.js 是全栈开发的最佳选择之一',
          '善用 Serverless 降低运维成本',
        ],
        projects: ['全栈 SaaS 应用', '实时协作工具'],
      },
      {
        title: '第四阶段：DevOps 基础',
        description: '掌握部署和运维技能',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['Docker 容器化', 'CI/CD 自动化', '域名与 HTTPS', '云服务基础', '监控与日志', '性能优化'],
        resources: [
          { label: 'Docker Compose 实践', link: '/docs/devops/docker-compose' },
          { label: 'GitHub Actions 入门', link: '/docs/devops/github-actions' },
          { label: 'Docker 指南', link: '/docs/misc/docker-guide' },
          { label: 'Nginx 配置', link: '/docs/misc/nginx-guide' },
          { label: '前端监控', link: '/blog/frontend-monitoring' },
        ],
        tips: [
          'Vercel/Railway 等平台大幅降低运维门槛',
          '生产环境一定要有监控',
        ],
        projects: ['完整部署流程', '监控大盘搭建'],
      },
      {
        title: '第五阶段：产品思维',
        description: '从技术到产品，独立交付价值',
        duration: '持续提升',
        difficulty: 'advanced',
        skills: ['产品设计思维', '用户体验设计', '数据分析', 'SEO 优化', '技术选型', '成本控制'],
        resources: [
          { label: '技术写作指南', link: '/blog/tech-writing' },
          { label: '技术成长路线', link: '/blog/tech-career-growth' },
          { label: '开源贡献指南', link: '/blog/open-source-contribution' },
        ],
        tips: [
          '技术是手段，产品价值是目的',
          '独立开发者要学会做减法',
          '打造自己的作品集',
        ],
        projects: ['独立产品上线', '开源项目维护'],
      },
    ],
  },
  {
    id: 'algorithm',
    title: '算法修炼',
    icon: '🧮',
    color: '#8b5cf6',
    description: '系统学习数据结构与算法，提升编程内功',
    totalDuration: '6-12 个月',
    stages: [
      {
        title: '第一阶段：基础数据结构',
        description: '掌握常用数据结构的实现与应用场景',
        duration: '1-2 个月',
        difficulty: 'beginner',
        skills: ['数组与字符串', '链表 (单向/双向/循环)', '栈与队列', '哈希表', '集合与映射', '树的基础', '图的表示'],
        resources: [
          { label: '链表常见操作', link: '/docs/data-structures-algorithms/linked-list' },
          { label: '二叉树遍历', link: '/docs/data-structures-algorithms/binary-tree-traversal' },
          { label: '索引优先队列', link: '/docs/data-structures-algorithms/indexed-priority-queue' },
        ],
        tips: [
          '理解数据结构的时间复杂度',
          '手写实现加深理解',
          '用画图辅助理解',
        ],
        projects: ['手写 LRU Cache', '实现简易哈希表'],
      },
      {
        title: '第二阶段：基础算法',
        description: '学习经典算法思想和模板',
        duration: '2-3 个月',
        difficulty: 'intermediate',
        skills: ['排序算法', '二分查找', '递归与回溯', '贪心算法', 'BFS/DFS', '分治思想', '位运算'],
        resources: [
          { label: '排序算法总结', link: '/docs/data-structures-algorithms/sorting-algorithms' },
          { label: '二分查找变体', link: '/docs/data-structures-algorithms/binary-search' },
          { label: '回溯算法详解', link: '/docs/data-structures-algorithms/backtracking' },
          { label: 'BFS/DFS 遍历', link: '/docs/data-structures-algorithms/bfs-dfs' },
          { label: '贪心算法入门', link: '/docs/data-structures-algorithms/greedy' },
        ],
        tips: [
          '每种算法都要手写多遍',
          '理解算法的适用场景',
          '总结算法模板',
        ],
        projects: ['排序可视化', 'N 皇后求解器'],
      },
      {
        title: '第三阶段：进阶技巧',
        description: '掌握面试高频算法模式',
        duration: '2-3 个月',
        difficulty: 'advanced',
        skills: ['双指针', '滑动窗口', '动态规划', '单调栈/队列', '前缀和/差分', '并查集', '拓扑排序', '字典树'],
        resources: [
          { label: '双指针技巧', link: '/docs/data-structures-algorithms/two-pointers' },
          { label: '动态规划详解', link: '/docs/data-structures-algorithms/dynamic-programming' },
          { label: '回溯算法详解', link: '/docs/data-structures-algorithms/backtracking' },
        ],
        tips: [
          '动态规划是重中之重',
          '总结题型分类和解题套路',
          '每道题思考多种解法',
        ],
        projects: ['DP 题型总结', '自己出题并解答'],
      },
      {
        title: '第四阶段：刷题冲刺',
        description: '高强度刷题，准备面试',
        duration: '1-2 个月',
        difficulty: 'advanced',
        skills: ['LeetCode Hot 100', '剑指 Offer', '周赛训练', '限时练习', '题目复盘', '代码规范'],
        resources: [
          { label: '正则表达式', link: '/blog/regex-practical-guide' },
          { label: 'LeetCode', link: 'https://leetcode.cn/', type: 'external' },
        ],
        tips: [
          '限时练习培养手感',
          '错题要多复习几遍',
          '面试前一周重点复习高频题',
        ],
        projects: ['刷完 Hot 100', '周赛稳定 2-3 题'],
      },
    ],
  },
  {
    id: 'interview',
    title: '面试准备',
    icon: '💼',
    color: '#ef4444',
    description: '从简历到 Offer 的完整面试准备指南',
    totalDuration: '1-2 个月',
    stages: [
      {
        title: '第一阶段：简历准备',
        description: '打造亮眼的技术简历，获取面试机会',
        duration: '1-2 周',
        difficulty: 'beginner',
        skills: ['项目经历梳理', 'STAR 法则', '简历排版', '亮点数据化', '自我介绍', '求职渠道'],
        resources: [
          { label: '技术写作指南', link: '/blog/tech-writing' },
        ],
        tips: [
          '简历是敲门砖，要精心打磨',
          '用数据量化你的成果',
          '针对不同公司调整简历',
          '准备 1 分钟和 3 分钟两版自我介绍',
        ],
        projects: ['完善简历', '准备自我介绍'],
      },
      {
        title: '第二阶段：技术面试',
        description: '准备技术面试的各个环节',
        duration: '2-4 周',
        difficulty: 'intermediate',
        skills: ['算法手写', '八股文复习', '项目深挖', '系统设计基础', '代码规范', '沟通表达'],
        resources: [
          { label: '浏览器渲染原理', link: '/blog/browser-rendering' },
          { label: '前端安全实践', link: '/blog/frontend-security' },
          { label: 'CSS 动画技巧', link: '/blog/css-animation' },
          { label: 'JavaScript 异步', link: '/blog/async-javascript' },
          { label: 'React 性能优化', link: '/blog/react-performance' },
        ],
        tips: [
          '算法是硬门槛，必须过关',
          '八股文要理解原理，不只是背诵',
          '项目要准备好被深挖的问题',
          '现场编码要边写边说思路',
        ],
        projects: ['刷 100 道算法题', '整理八股文笔记'],
      },
      {
        title: '第三阶段：项目面试',
        description: '展示项目经验和技术深度',
        duration: '1-2 周',
        difficulty: 'intermediate',
        skills: ['项目背景介绍', '技术选型决策', '难点与解决方案', '性能优化经验', '团队协作', '复盘总结'],
        resources: [
          { label: '代码评审最佳实践', link: '/blog/code-review' },
          { label: '开源贡献指南', link: '/blog/open-source-contribution' },
          { label: '微前端架构', link: '/blog/micro-frontend' },
          { label: 'Web 性能指标', link: '/blog/web-vitals' },
        ],
        tips: [
          '准备 2-3 个有深度的项目',
          '每个项目准备好难点和解决方案',
          '从业务价值角度讲述项目',
          '主动引导面试官问你擅长的部分',
        ],
        projects: ['项目复盘文档', '模拟面试练习'],
      },
      {
        title: '第四阶段：HR 面与谈薪',
        description: '顺利拿到心仪的 Offer',
        duration: '1 周',
        difficulty: 'beginner',
        skills: ['离职原因', '职业规划', '优缺点', '期望薪资', '薪资谈判', 'Offer 比较'],
        resources: [
          { label: '技术成长路线', link: '/blog/tech-career-growth' },
        ],
        tips: [
          '离职原因要正面积极',
          '职业规划要清晰且与岗位匹配',
          '薪资谈判不要先报价',
          '拿到 Offer 不急着接，可以争取更好条件',
        ],
        projects: ['准备常见问题答案', 'Offer 评估表'],
      },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps',
    icon: '🔧',
    color: '#06b6d4',
    description: '掌握云原生时代的开发运维一体化技能',
    totalDuration: '6-12 个月',
    stages: [
      {
        title: '第一阶段：Linux 基础',
        description: '熟练使用 Linux 系统和命令行',
        duration: '1-2 个月',
        difficulty: 'beginner',
        skills: ['Linux 文件系统', '常用命令', 'Shell 脚本', '用户权限', '进程管理', '网络配置', 'SSH 远程', 'Vim 编辑'],
        resources: [
          { label: 'Linux 常用命令', link: '/docs/misc/linux-commands' },
        ],
        tips: [
          '命令行是 DevOps 的基础',
          '多用多记，熟能生巧',
          '学会写 Shell 脚本自动化',
        ],
        projects: ['搭建 Linux 开发环境', '编写自动化脚本'],
      },
      {
        title: '第二阶段：容器化',
        description: '掌握 Docker 容器技术',
        duration: '1-2 个月',
        difficulty: 'intermediate',
        skills: ['Docker 基础', 'Dockerfile 编写', 'Docker Compose', '镜像优化', '容器网络', '数据卷', '私有仓库'],
        resources: [
          { label: 'Docker 完整指南', link: '/docs/misc/docker-guide' },
        ],
        tips: [
          'Docker 是容器化的入门必备',
          '多练习编写 Dockerfile',
          '理解容器与虚拟机的区别',
        ],
        projects: ['应用容器化', '多容器编排'],
      },
      {
        title: '第三阶段：CI/CD',
        description: '构建自动化流水线',
        duration: '1-2 个月',
        difficulty: 'intermediate',
        skills: ['GitHub Actions', 'GitLab CI', 'Jenkins', '自动化测试', '自动化部署', '环境管理', 'Secrets 管理'],
        resources: [
          { label: 'CI/CD 流水线搭建', link: '/blog/cicd-pipeline' },
          { label: 'Git 工作流', link: '/blog/git-workflow' },
        ],
        tips: [
          'CI/CD 是 DevOps 的核心实践',
          '从简单流程开始，逐步完善',
          '失败的流水线要能快速定位问题',
        ],
        projects: ['搭建完整 CI/CD', '蓝绿部署/金丝雀发布'],
      },
      {
        title: '第四阶段：Kubernetes',
        description: '容器编排与集群管理',
        duration: '2-3 个月',
        difficulty: 'advanced',
        skills: ['K8s 核心概念', 'Pod/Deployment/Service', 'ConfigMap/Secret', 'Ingress', 'Helm', '监控告警', '日志收集'],
        resources: [
          { label: 'Kubernetes 官方文档', link: 'https://kubernetes.io/zh-cn/docs/', type: 'external' },
        ],
        tips: [
          'K8s 学习曲线陡峭，要有耐心',
          '先用 minikube 本地练习',
          '理解声明式配置的思想',
        ],
        projects: ['K8s 部署应用', 'Helm Chart 编写'],
      },
      {
        title: '第五阶段：云原生进阶',
        description: '深入云原生生态',
        duration: '持续学习',
        difficulty: 'advanced',
        skills: ['服务网格 (Istio)', '可观测性', 'GitOps', '基础设施即代码', '多云管理', '安全加固'],
        resources: [],
        tips: [
          '云原生是一个庞大的生态',
          '根据实际需求选择性学习',
          '关注 CNCF 生态发展',
        ],
        projects: ['可观测性体系', 'GitOps 实践'],
      },
    ],
  },
];

const difficultyConfig = {
  beginner: { label: '入门', color: '#10b981' },
  intermediate: { label: '进阶', color: '#f59e0b' },
  advanced: { label: '高级', color: '#ef4444' },
};

function ProgressTracker({ roadmapId, stageCount }: { roadmapId: string; stageCount: number }) {
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`roadmap-${roadmapId}`);
    if (saved) {
      setCompleted(JSON.parse(saved));
    }
  }, [roadmapId]);

  const toggleStage = (index: number) => {
    const newCompleted = completed.includes(index)
      ? completed.filter(i => i !== index)
      : [...completed, index];
    setCompleted(newCompleted);
    localStorage.setItem(`roadmap-${roadmapId}`, JSON.stringify(newCompleted));
  };

  const progress = Math.round((completed.length / stageCount) * 100);

  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressHeader}>
        <span>学习进度</span>
        <span className={styles.progressPercent}>{progress}%</span>
      </div>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.progressStages}>
        {Array.from({ length: stageCount }).map((_, i) => (
          <button
            key={i}
            className={`${styles.progressDot} ${completed.includes(i) ? styles.progressDotActive : ''}`}
            onClick={() => toggleStage(i)}
            title={`阶段 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function RoadmapNode({ 
  node, 
  index, 
  isLast 
}: { 
  node: RoadmapNode; 
  index: number; 
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const difficulty = difficultyConfig[node.difficulty];

  return (
    <div className={styles.nodeWrapper}>
      <div className={styles.nodeConnector}>
        <div className={styles.nodeNumber}>{index + 1}</div>
        {!isLast && <div className={styles.nodeLine} />}
      </div>
      <div 
        className={`${styles.node} ${isExpanded ? styles.nodeExpanded : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.nodeHeader}>
          <div className={styles.nodeTitleRow}>
            <h3 className={styles.nodeTitle}>{node.title}</h3>
            <span 
              className={styles.difficultyBadge}
              style={{ background: difficulty.color }}
            >
              {difficulty.label}
            </span>
          </div>
          <span className={styles.nodeDuration}>{node.duration}</span>
        </div>
        <p className={styles.nodeDescription}>{node.description}</p>
        
        {isExpanded && (
          <div className={styles.nodeDetails}>
            <div className={styles.skillsSection}>
              <h4>🎯 核心技能</h4>
              <div className={styles.skills}>
                {node.skills.map((skill, i) => (
                  <span key={i} className={styles.skill}>{skill}</span>
                ))}
              </div>
            </div>

            {node.tips && node.tips.length > 0 && (
              <div className={styles.tipsSection}>
                <h4>💡 学习建议</h4>
                <ul className={styles.tips}>
                  {node.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {node.projects && node.projects.length > 0 && (
              <div className={styles.projectsSection}>
                <h4>🛠️ 实战项目</h4>
                <div className={styles.projects}>
                  {node.projects.map((project, i) => (
                    <span key={i} className={styles.project}>{project}</span>
                  ))}
                </div>
              </div>
            )}
            
            {node.resources.length > 0 && (
              <div className={styles.resourcesSection}>
                <h4>📚 推荐资源</h4>
                <div className={styles.resources}>
                  {node.resources.map((resource, i) => (
                    <Link 
                      key={i} 
                      to={resource.link} 
                      className={`${styles.resource} ${resource.type === 'external' ? styles.resourceExternal : ''}`}
                      target={resource.type === 'external' ? '_blank' : undefined}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {resource.label} {resource.type === 'external' ? '↗' : '→'}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.expandHint}>
          {isExpanded ? '▲ 点击收起' : '▼ 点击展开详情'}
        </div>
      </div>
    </div>
  );
}

function RoadmapContent() {
  const [activeRoadmap, setActiveRoadmap] = useState('frontend');
  const currentRoadmap = roadmaps.find(r => r.id === activeRoadmap)!;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🗺️ 学习路线图</h1>
        <p className={styles.subtitle}>
          系统化的学习路径，助你从入门到精通
        </p>
        <div className={styles.stats}>
          <span>📚 {roadmaps.length} 条路线</span>
          <span>📖 {roadmaps.reduce((acc, r) => acc + r.stages.length, 0)} 个阶段</span>
          <span>🎯 {roadmaps.reduce((acc, r) => acc + r.stages.reduce((a, s) => a + s.skills.length, 0), 0)}+ 技能点</span>
        </div>
      </header>

      <div className={styles.tabs}>
        {roadmaps.map((roadmap) => (
          <button
            key={roadmap.id}
            className={`${styles.tab} ${activeRoadmap === roadmap.id ? styles.tabActive : ''}`}
            onClick={() => setActiveRoadmap(roadmap.id)}
            style={activeRoadmap === roadmap.id ? { borderColor: roadmap.color, color: roadmap.color } : {}}
          >
            <span className={styles.tabIcon}>{roadmap.icon}</span>
            <span className={styles.tabTitle}>{roadmap.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.roadmapContent}>
        <div className={styles.roadmapHeader}>
          <div className={styles.roadmapInfo}>
            <span className={styles.roadmapIcon}>{currentRoadmap.icon}</span>
            <div>
              <h2 className={styles.roadmapTitle}>{currentRoadmap.title}</h2>
              <p className={styles.roadmapDescription}>{currentRoadmap.description}</p>
              <div className={styles.roadmapMeta}>
                <span>⏱️ 预计时长：{currentRoadmap.totalDuration}</span>
                <span>📊 共 {currentRoadmap.stages.length} 个阶段</span>
              </div>
            </div>
          </div>
          <ProgressTracker roadmapId={currentRoadmap.id} stageCount={currentRoadmap.stages.length} />
        </div>

        <div className={styles.stages}>
          {currentRoadmap.stages.map((stage, index) => (
            <RoadmapNode 
              key={index} 
              node={stage} 
              index={index}
              isLast={index === currentRoadmap.stages.length - 1}
            />
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerTip}>
          <h3>💡 使用提示</h3>
          <ul>
            <li>点击阶段卡片展开查看详细技能和资源</li>
            <li>点击进度条下方的圆点标记已完成的阶段</li>
            <li>学习进度会自动保存到浏览器</li>
            <li>路线仅供参考，请根据自身情况调整</li>
          </ul>
        </div>
        <div className={styles.footerLinks}>
          <Link to="/docs" className={styles.footerLink}>📖 查看文档</Link>
          <Link to="/blog" className={styles.footerLink}>✍️ 阅读博客</Link>
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage(): React.ReactNode {
  return (
    <Layout
      title="学习路线"
      description="前端、后端、全栈、算法、面试、DevOps 完整学习路线图"
    >
      <BrowserOnly fallback={<div className={styles.loading}>加载中...</div>}>
        {() => <RoadmapContent />}
      </BrowserOnly>
    </Layout>
  );
}
