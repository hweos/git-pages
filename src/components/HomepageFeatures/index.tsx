import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
  link: string;
  color: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '数据结构与算法',
    emoji: '🧮',
    description: (
      <>
        深入理解数据结构的本质，掌握常见算法的设计思想。
        从索引优先队列到图算法，一步步构建扎实的基础。
      </>
    ),
    link: '/docs/data-structures-algorithms/indexed-priority-queue',
    color: '#0891b2',
  },
  {
    title: '开发工具指南',
    emoji: '🛠️',
    description: (
      <>
        PM2 进程管理、SSH 配置、NPM 发包流程...
        提升开发效率的实用工具和技巧都在这里。
      </>
    ),
    link: '/docs/misc/pm2-guide',
    color: '#8b5cf6',
  },
  {
    title: 'React 性能优化',
    emoji: '⚡',
    description: (
      <>
        useMemo、useCallback、memo 的正确使用姿势。
        通过实战案例学习如何让你的 React 应用飞起来。
      </>
    ),
    link: '/docs/misc/react-performance',
    color: '#f59e0b',
  },
];

function Feature({title, emoji, description, link, color}: FeatureItem) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon} style={{'--feature-color': color} as React.CSSProperties}>
        <span className={styles.emoji}>{emoji}</span>
      </div>
      <div className={styles.featureContent}>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
        <Link to={link} className={styles.featureLink}>
          了解更多 →
        </Link>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.sectionTitle}>
            <span className={styles.sectionEmoji}>✨</span> 精选内容
          </Heading>
          <p className={styles.sectionSubtitle}>
            这里汇集了我在学习和工作中的经验总结，希望对你有所帮助
          </p>
        </div>
        <div className={styles.featureGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
