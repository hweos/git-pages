import type {ReactNode} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ReadingProgress from '@site/src/components/ReadingProgress';
import BackToTop from '@site/src/components/BackToTop';

interface Props {
  children: ReactNode;
}

export default function Root({children}: Props): ReactNode {
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
