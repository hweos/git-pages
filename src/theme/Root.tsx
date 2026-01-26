import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReadingProgress from '@site/src/components/ReadingProgress';
import BackToTop from '@site/src/components/BackToTop';

interface Props {
  children: React.ReactNode;
}

export default function Root({children}: Props): JSX.Element {
  return (
    <>
      <BrowserOnly>
        {() => (
          <>
            <ReadingProgress />
            <BackToTop />
          </>
        )}
      </BrowserOnly>
      {children}
    </>
  );
}
