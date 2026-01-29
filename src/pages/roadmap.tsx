import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './roadmap.module.css';

interface RoadmapNode {
  title: string;
  description: string;
  duration: string;
  skills: string[];
  resources: { label: string; link: string }[];
}

interface Roadmap {
  id: string;
  title: string;
  icon: string;
  description: string;
  stages: RoadmapNode[];
}

const roadmaps: Roadmap[] = [
  {
    id: 'frontend',
    title: '前端开发',
    icon: '🎨',
    description: '从零基础到资深前端工程师的完整学习路径',
    stages: [
      {
        title: '第一阶段：基础入门',
        description: '掌握 Web 开发的三大基石',
        duration: '2-3 个月',
        skills: ['HTML5 语义化', 'CSS3 布局与动画', 'JavaScript 基础', 'DOM 操作', 'Git 版本控制'],
        resources: [
          { label: 'CSS 布局技巧', link: '/docs/frontend/css-layout' },
          { label: 'Git 工作流', link: '/blog/git-workflow' },
        ],
      },
      {
        title: '第二阶段：框架学习',
        description: '掌握现代前端框架和生态',
        duration: '3-4 个月',
        skills: ['React / Vue 核心', '组件化开发', '状态管理', '路由管理', 'TypeScript'],
        resources: [
          { label: 'TypeScript 技巧', link: '/docs/frontend/typescript-tips' },
          { label: '状态管理对比', link: '/blog/state-management' },
          { label: 'React 性能优化', link: '/blog/react-performance' },
        ],
      },
      {
        title: '第三阶段：工程化',
        description: '理解现代前端工程化体系',
        duration: '2-3 个月',
        skills: ['Webpack / Vite', '代码规范', '自动化测试', 'CI/CD', 'Monorepo'],
        resources: [
          { label: '前端工程化', link: '/docs/frontend/engineering' },
          { label: 'CI/CD 流水线', link: '/blog/cicd-pipeline' },
          { label: 'Monorepo 实践', link: '/blog/monorepo-guide' },
          { label: '单元测试入门', link: '/blog/unit-testing-guide' },
        ],
      },
      {
        title: '第四阶段：性能与体验',
        description: '优化应用性能，提升用户体验',
        duration: '2-3 个月',
        skills: ['性能指标', '加载优化', '渲染优化', '无障碍', '国际化'],
        resources: [
          { label: 'Web 性能指标', link: '/blog/web-vitals' },
          { label: '浏览器渲染原理', link: '/blog/browser-rendering' },
          { label: '无障碍开发', link: '/blog/accessibility-guide' },
          { label: '国际化实践', link: '/blog/i18n-guide' },
        ],
      },
      {
        title: '第五阶段：架构与进阶',
        description: '掌握高级技术，具备架构能力',
        duration: '持续学习',
        skills: ['微前端', 'SSR/SSG', '设计模式', '技术选型', '团队协作'],
        resources: [
          { label: '微前端架构', link: '/blog/micro-frontend' },
          { label: 'SSR vs SSG', link: '/blog/ssr-ssg-isr' },
          { label: '设计模式', link: '/blog/design-patterns-frontend' },
          { label: '代码评审', link: '/blog/code-review' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    title: '后端开发',
    icon: '⚙️',
    description: '从语言基础到系统架构的后端成长之路',
    stages: [
      {
        title: '第一阶段：语言基础',
        description: '选择一门后端语言并深入学习',
        duration: '2-3 个月',
        skills: ['Node.js / Go / Java', '语法与特性', '包管理', '异步编程', '错误处理'],
        resources: [
          { label: 'JavaScript 异步编程', link: '/blog/async-javascript' },
          { label: 'npm/pnpm 实践', link: '/blog/npm-pnpm-guide' },
        ],
      },
      {
        title: '第二阶段：数据库',
        description: '掌握数据存储与查询',
        duration: '2-3 个月',
        skills: ['SQL 基础', 'MySQL / PostgreSQL', 'Redis 缓存', 'MongoDB', '数据库设计'],
        resources: [
          { label: '数据库索引优化', link: '/blog/database-index' },
        ],
      },
      {
        title: '第三阶段：API 开发',
        description: '构建可靠的后端服务',
        duration: '2-3 个月',
        skills: ['RESTful API', 'GraphQL', '认证授权', '接口文档', '错误处理'],
        resources: [
          { label: 'RESTful API 设计', link: '/blog/restful-api-design' },
          { label: 'GraphQL 入门', link: '/blog/graphql-intro' },
        ],
      },
      {
        title: '第四阶段：部署运维',
        description: '让服务稳定运行',
        duration: '2-3 个月',
        skills: ['Linux 基础', 'Docker', 'Nginx', 'CI/CD', '监控告警'],
        resources: [
          { label: 'Docker 指南', link: '/docs/misc/docker-guide' },
          { label: 'Nginx 配置', link: '/docs/misc/nginx-guide' },
          { label: 'Linux 命令', link: '/docs/misc/linux-commands' },
          { label: 'PM2 使用', link: '/docs/misc/pm2-guide' },
        ],
      },
      {
        title: '第五阶段：架构进阶',
        description: '设计高可用、可扩展的系统',
        duration: '持续学习',
        skills: ['微服务', '消息队列', '分布式系统', '高可用设计', '性能优化'],
        resources: [
          { label: '消息队列入门', link: '/blog/message-queue-intro' },
          { label: 'Serverless 开发', link: '/blog/serverless-guide' },
          { label: 'WebSocket 通信', link: '/blog/websocket-guide' },
        ],
      },
    ],
  },
  {
    id: 'algorithm',
    title: '算法修炼',
    icon: '🧮',
    description: '系统学习数据结构与算法，提升编程内功',
    stages: [
      {
        title: '第一阶段：基础数据结构',
        description: '掌握常用数据结构的实现与应用',
        duration: '1-2 个月',
        skills: ['数组与链表', '栈与队列', '哈希表', '树与图', '堆'],
        resources: [
          { label: '链表操作', link: '/docs/data-structures-algorithms/linked-list' },
          { label: '二叉树遍历', link: '/docs/data-structures-algorithms/binary-tree-traversal' },
          { label: '索引优先队列', link: '/docs/data-structures-algorithms/indexed-priority-queue' },
        ],
      },
      {
        title: '第二阶段：基础算法',
        description: '学习经典算法思想',
        duration: '2-3 个月',
        skills: ['排序算法', '二分查找', '递归与回溯', '贪心算法', 'BFS/DFS'],
        resources: [
          { label: '排序算法', link: '/docs/data-structures-algorithms/sorting-algorithms' },
          { label: '二分查找', link: '/docs/data-structures-algorithms/binary-search' },
        ],
      },
      {
        title: '第三阶段：进阶技巧',
        description: '掌握高频算法模式',
        duration: '2-3 个月',
        skills: ['双指针', '滑动窗口', '动态规划', '单调栈/队列', '并查集'],
        resources: [
          { label: '双指针技巧', link: '/docs/data-structures-algorithms/two-pointers' },
          { label: '动态规划', link: '/docs/data-structures-algorithms/dynamic-programming' },
        ],
      },
      {
        title: '第四阶段：刷题冲刺',
        description: '高强度刷题，准备面试',
        duration: '1-2 个月',
        skills: ['LeetCode Hot 100', '剑指 Offer', '周赛训练', '限时练习', '题目总结'],
        resources: [
          { label: '正则表达式', link: '/blog/regex-practical-guide' },
        ],
      },
    ],
  },
  {
    id: 'interview',
    title: '面试准备',
    icon: '💼',
    description: '从简历到 Offer 的完整面试准备指南',
    stages: [
      {
        title: '第一阶段：简历准备',
        description: '打造亮眼的技术简历',
        duration: '1-2 周',
        skills: ['项目梳理', 'STAR 法则', '简历排版', '亮点提炼', '自我介绍'],
        resources: [
          { label: '技术写作', link: '/blog/tech-writing' },
        ],
      },
      {
        title: '第二阶段：技术面试',
        description: '准备技术面的各个环节',
        duration: '2-4 周',
        skills: ['算法手写', '八股文复习', '项目深挖', '系统设计', '代码风格'],
        resources: [
          { label: '浏览器渲染', link: '/blog/browser-rendering' },
          { label: '前端安全', link: '/blog/frontend-security' },
          { label: 'CSS 动画', link: '/blog/css-animation' },
        ],
      },
      {
        title: '第三阶段：项目面试',
        description: '展示项目经验和技术深度',
        duration: '1-2 周',
        skills: ['项目介绍', '技术选型', '难点突破', '性能优化', '团队协作'],
        resources: [
          { label: '代码评审', link: '/blog/code-review' },
          { label: '开源贡献', link: '/blog/open-source-contribution' },
        ],
      },
      {
        title: '第四阶段：HR 面与谈薪',
        description: '顺利拿到心仪 Offer',
        duration: '准备中',
        skills: ['离职原因', '职业规划', '优缺点', '薪资谈判', 'Offer 选择'],
        resources: [
          { label: '技术成长路线', link: '/blog/tech-career-growth' },
        ],
      },
    ],
  },
];

function RoadmapNode({ node, index, isLast }: { node: RoadmapNode; index: number; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <h3 className={styles.nodeTitle}>{node.title}</h3>
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
            
            {node.resources.length > 0 && (
              <div className={styles.resourcesSection}>
                <h4>📚 推荐资源</h4>
                <div className={styles.resources}>
                  {node.resources.map((resource, i) => (
                    <Link key={i} to={resource.link} className={styles.resource}>
                      {resource.label} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.expandHint}>
          {isExpanded ? '点击收起' : '点击展开详情'}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage(): React.ReactNode {
  const [activeRoadmap, setActiveRoadmap] = useState('frontend');
  const currentRoadmap = roadmaps.find(r => r.id === activeRoadmap)!;

  return (
    <Layout
      title="学习路线"
      description="前端、后端、算法、面试完整学习路线图"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>🗺️ 学习路线图</h1>
          <p className={styles.subtitle}>
            系统化的学习路径，助你从入门到精通
          </p>
        </header>

        <div className={styles.tabs}>
          {roadmaps.map((roadmap) => (
            <button
              key={roadmap.id}
              className={`${styles.tab} ${activeRoadmap === roadmap.id ? styles.tabActive : ''}`}
              onClick={() => setActiveRoadmap(roadmap.id)}
            >
              <span className={styles.tabIcon}>{roadmap.icon}</span>
              <span className={styles.tabTitle}>{roadmap.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.roadmapContent}>
          <div className={styles.roadmapHeader}>
            <span className={styles.roadmapIcon}>{currentRoadmap.icon}</span>
            <div>
              <h2 className={styles.roadmapTitle}>{currentRoadmap.title}</h2>
              <p className={styles.roadmapDescription}>{currentRoadmap.description}</p>
            </div>
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
          <p>💡 提示：学习路线仅供参考，请根据自身情况调整</p>
          <div className={styles.footerLinks}>
            <Link to="/docs" className={styles.footerLink}>📖 查看文档</Link>
            <Link to="/blog" className={styles.footerLink}>✍️ 阅读博客</Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
