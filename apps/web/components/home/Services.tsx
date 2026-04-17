import { cn } from '@/utils/cn';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

interface ServiceCard {
  id: number;
  icon: string;
  title: string;
  description: string;
}

const servicesData: ServiceCard[] = [
  {
    id: 1,
    icon: 'ns-shape-9',
    title: 'Smart face analysis',
    description: 'Detect faces, generate embeddings, and extract searchable metadata from every upload.',
  },
  {
    id: 2,
    icon: 'ns-shape-3',
    title: 'Similarity search',
    description: 'Find matching or visually similar faces instantly with vector-powered search.',
  },
  {
    id: 3,
    icon: 'ns-shape-12',
    title: 'Automated clustering',
    description: 'Group recurring identities automatically to speed up review and tagging workflows.',
  },
];

const Services = () => {
  return (
    <section className="bg-background-2 dark:bg-background-7 py-[50px] lg:py-[100px]">
      <div className="main-container">
        <div className="mb-[70px] space-y-5 text-center">
          <RevealAnimation delay={0.1}>
            <span className="badge badge-green">Services</span>
          </RevealAnimation>
          <div className="space-y-3">
            <RevealAnimation delay={0.2}>
              <h2>
                Core Face-AI <span className="text-primary-500">features</span>
              </h2>
            </RevealAnimation>
            <RevealAnimation delay={0.3}>
              <p className="mx-auto max-w-[490px]">
                From upload to searchable intelligence, Face-AI helps your team process, organize,
                and explore image data at scale.
              </p>
            </RevealAnimation>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-y-6 md:gap-8">
          {servicesData.map((service, index) => (
            <RevealAnimation delay={0.4 + index * 0.1} key={service.id}>
              <div
                className={cn(index !== 2 ? 'col-span-12 md:col-span-6 lg:col-span-4' : 'col-span-12 lg:col-span-4')}>
                <div className="dark:bg-background-9 space-y-4 rounded-[20px] bg-white p-6 text-center duration-500 ease-in-out hover:-translate-y-2 sm:space-y-6 sm:p-8">
                  <div className="mx-auto w-fit">
                    <span className={`${service.icon} text-secondary dark:text-accent text-[40px] md:text-[52px]`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="xl:text-heading-5 text-heading-6">{service.title}</h3>
                    <p className="line-clamp-2">{service.description}</p>
                  </div>
                  <div>
                    <LinkButton
                      href="/services"
                      className="btn btn-white dark:btn-transparent hover:btn-secondary dark:hover:btn-accent btn-md">
                      Explore feature
                    </LinkButton>
                  </div>
                </div>
              </div>
            </RevealAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
