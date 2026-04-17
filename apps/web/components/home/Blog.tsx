import { IBlogPost } from '@/interface';
import RevealAnimation from '../animation/RevealAnimation';
import BlogCardV2 from '../shared/card/BlogCardV2';
import BlogCardV3 from '../shared/card/BlogCardV3';
import LinkButton from '../ui/button/LinkButton';

const blogs: IBlogPost[] = [
  {
    tag: 'Product',
    author: 'Face-AI Team',
    authorImage: '/images/ns-avatar-1.png',
    publishDate: 'Apr 12, 2026',
    title: 'How Face Clustering Improves Search Accuracy in Large Photo Libraries',
    description:
      'Learn practical strategies for reducing duplicate identities and improving confidence scores across millions of photos.',
    thumbnail: '/images/ns-img-401.jpg',
    readTime: '6 min read',
    slug: 'face-clustering-search-accuracy',
    content: '',
  },
  {
    tag: 'Engineering',
    author: 'Platform Engineering',
    authorImage: '/images/ns-avatar-2.png',
    publishDate: 'Apr 07, 2026',
    title: 'Building Fast Identity Lookup APIs with Face-AI',
    description:
      'A behind-the-scenes look at indexing strategies and response-time optimizations for face search endpoints.',
    thumbnail: '/images/ns-img-402.jpg',
    readTime: '5 min read',
    slug: 'fast-identity-lookup-apis',
    content: '',
  },
  {
    tag: 'Operations',
    author: 'Customer Success',
    authorImage: '/images/ns-avatar-3.png',
    publishDate: 'Apr 02, 2026',
    title: 'Operational Playbook for Reviewing AI Match Confidence',
    description:
      'Set practical thresholds for approvals, manual reviews, and escalations with reliable human-in-the-loop workflows.',
    thumbnail: '/images/ns-img-404.jpg',
    readTime: '7 min read',
    slug: 'ai-match-confidence-playbook',
    content: '',
  },
];

const Blog = () => {
  return (
    <section className="bg-background-2 dark:bg-background-7 py-[100px]">
      <div className="main-container">
        <div className="mb-[70px] space-y-3 text-center">
          <RevealAnimation delay={0.1}>
            <h2 className="mx-auto max-w-[881px]">
              Stay ahead in the
              <span className="text-primary-500"> property management </span>
              industry
            </h2>
          </RevealAnimation>
          <RevealAnimation delay={0.2}>
            <p className="mx-auto max-w-[492px]">
              A collection of thoughts, experiments, and insights around design, technology, and creativity.
            </p>
          </RevealAnimation>
        </div>
        <div>
          <div className="grid grid-cols-12 items-start gap-y-8 lg:gap-x-8 xl:items-center">
            {/* blog one  */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-6">
              <RevealAnimation delay={0.3}>
                <BlogCardV2 blog={blogs[0]} className="dark:bg-background-8 bg-white" />
              </RevealAnimation>
            </div>

            <div className="col-span-12 lg:col-span-7 xl:col-span-6">
              <div className="space-y-8 lg:space-y-[38px] xl:space-y-8">
                <RevealAnimation delay={0.4}>
                  <BlogCardV3 blog={blogs[1]} className="dark:bg-background-8 bg-white" />
                </RevealAnimation>

                <RevealAnimation delay={0.5}>
                  <BlogCardV3 blog={blogs[2]} className="dark:bg-background-8 bg-white" />
                </RevealAnimation>
              </div>
            </div>
          </div>
          <RevealAnimation delay={0.6}>
            <div className="mt-10 flex justify-center md:mt-14">
              <LinkButton
                href="/blog"
                className="btn btn-md btn-secondary hover:btn-white dark:btn-transparent dark:hover:btn-accent inline-block w-[85%] md:w-auto">
                Visit our blog
              </LinkButton>
            </div>
          </RevealAnimation>
        </div>
      </div>
    </section>
  );
};

export default Blog;
