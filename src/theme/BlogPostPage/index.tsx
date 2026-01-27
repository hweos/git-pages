import type {ReactNode} from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';
import type BlogPostPageType from '@theme/BlogPostPage';
import type {WrapperProps} from '@docusaurus/types';
import GiscusComments from '@site/src/components/GiscusComments';

type Props = WrapperProps<typeof BlogPostPageType>;

export default function BlogPostPageWrapper(props: Props): ReactNode {
  return (
    <>
      <BlogPostPage {...props} />
      <div className="container margin-top--xl margin-bottom--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <GiscusComments />
          </div>
        </div>
      </div>
    </>
  );
}
