import React, {useState, useEffect} from 'react';
import styles from './styles.module.css';

export default function BackToTop(): JSX.Element {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility, {passive: true});
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`${styles.backToTop} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="返回顶部"
      title="返回顶部"
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6"/>
      </svg>
    </button>
  );
}
