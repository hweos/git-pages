import {useState, useEffect, useRef, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

// 打字机效果 Hook
function useTypewriter(texts: string[], speed = 100, pause = 2000) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setDisplayText(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        if (charIndex > 0) {
          setDisplayText(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return displayText;
}

// 滚动触发动画 Hook
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Hero 区域
function HeroSection() {
  const typedText = useTypewriter([
    'Build Together',
    'Learn Together',
    'Grow Together',
    'Share Knowledge',
  ], 80, 1500);

  return (
    <section className={styles.hero}>
      <div className={styles.heroBackground}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gradientOrb3} />
      </div>
      
      <div className={styles.heroContent}>
        <div className={styles.greeting}>Hello World 👋</div>
        <Heading as="h1" className={styles.heroTitle}>
          Embrace <span className={styles.name}>Open Source</span>
        </Heading>
        <div className={styles.typewriter}>
          <span className={styles.typedText}>{typedText}</span>
          <span className={styles.cursor}>|</span>
        </div>
        <p className={styles.heroDescription}>
          一个开放的技术知识库，汇集团队的智慧与经验。
          <br />算法笔记、开发指南、最佳实践，共建共享。
        </p>
        
        <div className={styles.heroButtons}>
          <Link className={styles.primaryBtn} to="/docs/">
            <span>🚀</span> 开始探索
          </Link>
          <Link className={styles.secondaryBtn} to="/blog">
            <span>📝</span> 阅读博客
          </Link>
          <a 
            className={styles.iconBtn} 
            href="https://github.com/hweos" 
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>

        <div className={styles.scrollIndicator}>
          <span>向下滚动</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </div>
    </section>
  );
}

// 技术栈展示区域
function SkillsSection() {
  const { ref, isVisible } = useScrollAnimation();
  
  const skills = [
    { name: 'React / Vue / Next.js', level: 90, color: '#61dafb' },
    { name: 'TypeScript / JavaScript', level: 85, color: '#3178c6' },
    { name: 'Node.js / Python', level: 80, color: '#339933' },
    { name: 'Docker / K8s', level: 75, color: '#2496ed' },
    { name: 'Algorithms & DS', level: 80, color: '#f59e0b' },
    { name: 'System Design', level: 75, color: '#8b5cf6' },
  ];

  return (
    <section className={styles.skillsSection} ref={ref}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>⚡</span> 技术栈
        </Heading>
        <p className={styles.sectionSubtitle}>团队技术能力覆盖</p>
        
        <div className={styles.skillsGrid}>
          {skills.map((skill, index) => (
            <div 
              key={skill.name} 
              className={styles.skillItem}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.skillHeader}>
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.skillPercent}>{skill.level}%</span>
              </div>
              <div className={styles.skillBar}>
                <div 
                  className={clsx(styles.skillProgress, isVisible && styles.animate)}
                  style={{ 
                    '--skill-level': `${skill.level}%`,
                    '--skill-color': skill.color,
                    animationDelay: `${index * 0.1 + 0.3}s`
                  } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 内容展示区域
function ContentSection() {
  const { ref, isVisible } = useScrollAnimation();
  
  const contents = [
    {
      icon: '📚',
      title: 'Docs',
      count: '17+',
      description: '技术文档',
      link: '/docs/',
      color: '#0891b2',
    },
    {
      icon: '✍️',
      title: 'Blog',
      count: '7+',
      description: '博客文章',
      link: '/blog',
      color: '#8b5cf6',
    },
    {
      icon: '🧮',
      title: 'Algorithm',
      count: '10+',
      description: '算法笔记',
      link: '/docs/data-structures-algorithms/sorting-algorithms',
      color: '#f59e0b',
    },
    {
      icon: '🛠️',
      title: 'Tools',
      count: '5+',
      description: '工具指南',
      link: '/docs/misc/pm2-guide',
      color: '#10b981',
    },
  ];

  return (
    <section className={styles.contentSection} ref={ref}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📂</span> 内容导航
        </Heading>
        <p className={styles.sectionSubtitle}>探索知识库</p>
        
        <div className={styles.contentGrid}>
          {contents.map((item, index) => (
            <Link 
              key={item.title}
              to={item.link}
              className={clsx(styles.contentCard, isVisible && styles.animate)}
              style={{ 
                '--card-color': item.color,
                animationDelay: `${index * 0.1}s`
              } as React.CSSProperties}
            >
              <div className={styles.cardIcon}>{item.icon}</div>
              <div className={styles.cardCount}>{item.count}</div>
              <div className={styles.cardTitle}>{item.title}</div>
              <div className={styles.cardDesc}>{item.description}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// 最新文章区域
function LatestPostsSection() {
  const { ref, isVisible } = useScrollAnimation();
  
  const posts = [
    { title: '2025 前端技术趋势回顾', date: '2025-11-01', slug: '/blog/frontend-trends-2025' },
    { title: 'Web Components 实践指南', date: '2025-10-01', slug: '/blog/web-components' },
    { title: '消息队列入门指南', date: '2025-09-01', slug: '/blog/message-queue-intro' },
    { title: '移动端 H5 开发技巧', date: '2025-08-01', slug: '/blog/h5-mobile-development' },
  ];

  return (
    <section className={styles.postsSection} ref={ref}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🔥</span> 最新文章
        </Heading>
        <p className={styles.sectionSubtitle}>保持学习，持续输出</p>
        
        <div className={styles.postsList}>
          {posts.map((post, index) => (
            <Link 
              key={post.slug}
              to={post.slug}
              className={clsx(styles.postItem, isVisible && styles.animate)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className={styles.postDate}>{post.date}</span>
              <span className={styles.postTitle}>{post.title}</span>
              <span className={styles.postArrow}>→</span>
            </Link>
          ))}
        </div>
        
        <div className={styles.viewAll}>
          <Link to="/blog" className={styles.viewAllBtn}>
            查看全部文章 →
          </Link>
        </div>
      </div>
    </section>
  );
}

// 页脚 CTA
function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>
            加入我们，一起成长
          </Heading>
          <p className={styles.ctaDescription}>
            开源的力量在于共享与协作。无论你是想学习新技术，还是想分享你的经验，这里都欢迎你的参与。
          </p>
          <div className={styles.ctaButtons}>
            <Link className={styles.ctaButton} to="/docs/">
              浏览文档 📚
            </Link>
            <a 
              className={styles.ctaButtonOutline} 
              href="https://github.com/hweos/git-pages"
              target="_blank"
              rel="noopener noreferrer"
            >
              参与贡献 ⭐
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <Layout
      title="首页"
      description="Hweos 的技术博客 - 算法笔记、开发指南和最佳实践">
      <main className={styles.main}>
        <HeroSection />
        <SkillsSection />
        <ContentSection />
        <LatestPostsSection />
        <CTASection />
      </main>
    </Layout>
  );
}
