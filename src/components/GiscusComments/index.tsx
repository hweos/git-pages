import React from 'react';
import Giscus from '@giscus/react';
import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';

function GiscusComponent(): JSX.Element {
  const {colorMode} = useColorMode();

  return (
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
      theme={colorMode === 'dark' ? 'dark' : 'light'}
      lang="zh-CN"
      loading="lazy"
    />
  );
}

export default function GiscusComments(): JSX.Element {
  return (
    <div style={{marginTop: '2rem'}}>
      <BrowserOnly fallback={<div>Loading comments...</div>}>
        {() => <GiscusComponent />}
      </BrowserOnly>
    </div>
  );
}
