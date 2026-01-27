import React, {useState, useEffect} from 'react';

export default function GiscusComments(): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setMounted(true);
    // 检测当前主题
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'dark' : 'light');

    // 监听主题变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {attributes: true});

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return <div style={{marginTop: '2rem'}}>Loading comments...</div>;
  }

  // 动态导入 Giscus
  const Giscus = require('@giscus/react').default;

  return (
    <div style={{marginTop: '2rem'}}>
      <Giscus
        id="comments"
        repo="hweos/git-pages"
        repoId="R_kgDONqKNrg"
        category="Announcements"
        categoryId="DIC_kwDONqKNrs4CmSRc"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
