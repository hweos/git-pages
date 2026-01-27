import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

import styles from './404.module.css';

export default function NotFound(): ReactNode {
  return (
    <Layout title="页面未找到">
      <main className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorCode}>
            <span className={styles.four}>4</span>
            <span className={styles.zero}>0</span>
            <span className={styles.four}>4</span>
          </div>
          
          <h1 className={styles.title}>哎呀，页面走丢了！</h1>
          
          <p className={styles.description}>
            你访问的页面可能已被移动、删除，或者从未存在过。
            <br />
            别担心，让我们帮你找到正确的方向。
          </p>
          
          <div className={styles.actions}>
            <Link className={styles.primaryButton} to="/">
              🏠 返回首页
            </Link>
            <Link className={styles.secondaryButton} to="/docs/">
              📚 浏览文档
            </Link>
          </div>
          
          <div className={styles.suggestions}>
            <p className={styles.suggestTitle}>你可能想找：</p>
            <ul className={styles.suggestList}>
              <li><Link to="/docs/misc/pm2-guide">PM2 使用指南</Link></li>
              <li><Link to="/docs/misc/react-performance">React 性能优化</Link></li>
              <li><Link to="/blog">最新博客文章</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.decoration}>
          <div className={styles.planet}></div>
          <div className={styles.stars}></div>
        </div>
      </main>
    </Layout>
  );
}
