import { cn } from '@/utils/cn';
import RevealAnimation from '../animation/RevealAnimation';
import { TestimonialCardItem, TestimonialCards } from '../ui/testimonial-cards';

const featuresData = [
  {
    id: 1,
    icon: 'ns-shape-8',
    title: 'AI-powered face detection and analysis',
  },
  {
    id: 2,
    icon: 'ns-shape-9',
    title: 'Seamless image upload and search workflows',
  },
  {
    id: 3,
    icon: 'ns-shape-12',
    title: 'Automated embedding and identity clustering',
  },
  {
    id: 4,
    icon: 'ns-shape-21',
    title: 'Integrated web, API, and worker deployment',
  },
];

const testimonialsData: TestimonialCardItem[] = [
  
  {
    id: 1,
    author: 'Meera Verma',
    testimonial: 'Face clustering helped our newsroom locate people in thousands of images before tight editorial deadlines.',
    avatar: 'https://i.pravatar.cc/300?img=47',
  },
  {
    id: 2,
    author: 'Daniel Kim',
    testimonial: 'Search by face works across old and new batches. We finally have one reliable workflow for our archive team.',
    avatar: 'https://i.pravatar.cc/300?img=12',
  },
  {
    id: 3,
    author: 'Riya Sharma',
    testimonial: 'Face AI cut our event photo sorting time by nearly 80%. We now deliver person-specific albums much faster.',
    avatar: 'https://i.pravatar.cc/300?img=37',
  },
  {
    id: 4,
    author: 'Arjun Rao',
    testimonial: 'Confidence scores and metadata exports make quality review simple for our operations team.',
    avatar: 'https://i.pravatar.cc/300?img=56',
  },
];

const Features = () => {
  return (
    <section className="dark:bg-background-5 bg-white py-[50px] md:py-[100px] xl:py-[200px]">
      <div className="main-container">
        <div className="mx-auto grid max-w-[720px] grid-cols-12 items-center gap-y-10 lg:mx-0 lg:max-w-full lg:gap-20 xl:gap-[100px]">
          <div className="col-span-12 lg:col-span-6 xl:col-span-7">
            <RevealAnimation delay={0.2} offset={100}>
              <div className="mx-auto w-full max-w-[647px]">
                <TestimonialCards items={testimonialsData} autoPlayInterval={4200} />
              </div>
            </RevealAnimation>
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-5">
            <div className="space-y-8">
              <div className="space-y-5">
                <RevealAnimation delay={0.1}>
                  <span className="badge badge-green">Reasons to select us</span>
                </RevealAnimation>

                <div className="space-y-3">
                  <RevealAnimation delay={0.1}>
                    <h2 className="max-w-[420px] xl:max-w-full">
                      Why <span className="text-primary-500">thousands trust </span> us to build their apps
                    </h2>
                  </RevealAnimation>
                </div>
              </div>
              <div>
                <ul className="space-y-2">
                  {featuresData.map((feature, index) => (
                    <RevealAnimation delay={0.3 + index * 0.1} key={feature.id}>
                      <li className="flex items-center gap-4 py-2 xl:py-3">
                        <div>
                          <span className={cn('text-secondary dark:text-accent text-[36px]', feature.icon)} />
                        </div>
                        <span className="text-tagline-1 text-secondary dark:text-accent font-medium">
                          {feature.title}
                        </span>
                      </li>
                    </RevealAnimation>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
