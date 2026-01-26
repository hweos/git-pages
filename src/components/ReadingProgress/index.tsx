import React, {useState, useEffect} from 'react';
import styles from './styles.module.css';

export default function ReadingProgress(): JSX.Element {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', updateProgress, {passive: true});
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className={styles.progressContainer}>
      <div 
        className={styles.progressBar} 
        style={{width: `${progress}%`}}
      />
    </div>
  );
}
