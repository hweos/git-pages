import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title} <span className={styles.heroEmoji}>🚀</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            探索技术的无限可能，记录成长的每一步。<br/>
            这里有算法笔记、开发指南和最佳实践。
          </p>
          <div className={styles.buttons}>
            <Link className={styles.primaryButton} to="/docs/">
              📚 开始阅读
            </Link>
            <Link className={styles.secondaryButton} to="/blog">
              ✍️ 查看博客
            </Link>
          </div>
          
          <div className={styles.statsSection}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10+</span>
              <span className={styles.statLabel}>技术文档</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>博客文章</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>∞</span>
              <span className={styles.statLabel}>学习热情</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="首页"
      description="Hweos 的技术博客 - 算法笔记、开发指南和最佳实践">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
