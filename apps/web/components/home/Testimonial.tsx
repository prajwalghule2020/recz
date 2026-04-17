import xIconImg from '@public/images/icons/x.svg';
import gradient22Img from '@public/images/ns-img-510.png';
import Image from 'next/image';
import Link from 'next/link';
import Marquee from 'react-fast-marquee';
import RevealAnimation from '../animation/RevealAnimation';

const testimonials = [
  {
    id: 1,
    quote:
      'Face AI reduced our manual photo tagging work from hours to minutes. We can now find every guest photo instantly before delivery.',
    avatar: '/images/mock-avatars/person-1.jpg',
    name: 'Riya Sharma',
    position: 'Wedding Photographer',
    rating: '4.9',
  },
  {
    id: 2,
    quote:
      'The face clustering is incredibly accurate even across old and new event albums. Searching by person has become our fastest workflow.',
    avatar: '/images/mock-avatars/person-2.jpg',
    name: 'Daniel Kim',
    position: 'Photo Archivist',
    rating: '5.0',
  },
  {
    id: 3,
    quote:
      'We integrated Face AI into our newsroom pipeline and now locate people across thousands of images without slowing down editorial deadlines.',
    avatar: '/images/mock-avatars/person-3.jpg',
    name: 'Meera Verma',
    position: 'Newsroom Editor',
    rating: '4.8',
  },
  {
    id: 4,
    quote:
      'Our operations team uses Face AI to verify identity match quality before publishing albums. The confidence scores make review decisions easy.',
    avatar: '/images/mock-avatars/person-4.jpg',
    name: 'Arjun Rao',
    position: 'Operations Lead',
    rating: '4.8',
  },
  {
    id: 5,
    quote:
      'The API docs were straightforward and we were live in a day. Face search endpoints now power our internal media library tools.',
    avatar: '/images/mock-avatars/person-5.jpg',
    name: 'Priya Nair',
    position: 'Backend Engineer',
    rating: '4.9',
  },
  {
    id: 6,
    quote:
      'I can upload bulk photo sets and immediately search for repeat visitors across locations. It has improved security investigations significantly.',
    avatar: '/images/mock-avatars/person-6.jpg',
    name: 'Lucas Meyer',
    position: 'Security Analyst',
    rating: '4.7',
  },
  {
    id: 7,
    quote:
      'My studio team stopped maintaining messy folder names. Face AI automatically groups people and keeps our catalog clean and searchable.',
    avatar: '/images/mock-avatars/person-7.jpg',
    name: 'Ana Lopez',
    position: 'Studio Manager',
    rating: '4.8',
  },
  {
    id: 8,
    quote:
      'Face AI helped our product team validate recognition quality quickly with clear metadata exports and audit-friendly results.',
    avatar: '/images/mock-avatars/person-8.jpg',
    name: 'Omar Hassan',
    position: 'Product Manager',
    rating: '4.7',
  },
  {
    id: 9,
    quote:
      'The onboarding was clean and practical. Our users started searching people in their galleries on day one without training overhead.',
    avatar: '/images/mock-avatars/person-9.jpg',
    name: 'Sophie Grant',
    position: 'Customer Success Lead',
    rating: '4.8',
  },
];

const Testimonial = () => {
  return (
    <section className="bg-background-3 dark:bg-background-5 pt-[100px] pb-[100px] xl:pb-[200px]">
      <div className="main-container">
        <div className="mx-auto mb-10 max-w-[595px] text-center md:mb-[72px]">
          <RevealAnimation delay={0.1}>
            <span className="badge badge-green mb-5">User stories</span>
          </RevealAnimation>
          <RevealAnimation delay={0.2}>
            <h2>What our users say about Face AI</h2>
          </RevealAnimation>
          <RevealAnimation delay={0.25}>
            <p className="mx-auto mt-4 max-w-[520px]">
              Real feedback from photographers, media teams, and operations users who organize large photo libraries
              with Face AI.
            </p>
          </RevealAnimation>
        </div>
      </div>
      {/* testimonial slider */}
      <RevealAnimation delay={0.3}>
        <div className="relative">
          <div className="from-background-3 dark:from-background-5 absolute top-0 left-0 z-40 h-full w-[15%] bg-gradient-to-r to-transparent" />
          <div className="from-background-3 dark:from-background-5 absolute top-0 right-0 z-40 h-full w-[15%] bg-gradient-to-l to-transparent" />
          <Marquee autoFill speed={40}>
            <div className="flex items-center gap-x-5 lg:gap-x-10">
              {testimonials.map((testimonial) => {
                return (
                  <article
                    key={testimonial.id}
                    className="bg-background-2 dark:bg-background-6 group hover:bg-secondary hover:dark:bg-background-8 relative min-w-[320px] cursor-pointer space-y-6 overflow-hidden rounded-[12px] p-5 backdrop-blur-[22px] transition-all duration-500 ease-in-out first:ml-10 sm:min-w-[400px] lg:min-w-[722px] lg:space-y-10 lg:rounded-[20px] lg:p-14">
                    {/* gradient */}
                    <div className="pointer-events-none absolute -top-[147%] -right-[56%] max-w-[500px] rotate-[295deg] opacity-0 blur-[10px] transition-all duration-500 ease-in-out select-none group-hover:opacity-100 lg:-top-[162%] lg:-right-[56%] lg:max-w-[723px]">
                      <Image src={gradient22Img} alt="gradient" className="h-full w-full object-cover" />
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <figure className="h-[60px] w-[60px] transform overflow-hidden rounded-full transition-transform duration-500 ease-in-out group-hover:scale-[102%] md:h-[84px] md:w-[84px]">
                          <Image
                            src={testimonial.avatar}
                            width={60}
                            height={60}
                            alt={`${testimonial.name} avatar`}
                            className="h-full w-full bg-linear-[156deg,#a585ff_32.92%,#A585FF_91%] object-cover"
                          />
                        </figure>
                        <div className="space-y-1">
                          <h3 className="text-tagline-2 group-hover:text-accent transform font-semibold transition-all duration-500 ease-in-out group-hover:-translate-y-0.5 group-hover:transition-transform">
                            {testimonial.name}
                          </h3>
                          <p className="text-tagline-3 group-hover:text-accent/60 transform transition-all duration-500 ease-in-out group-hover:-translate-y-0.5 group-hover:transition-transform">
                            {testimonial.position}
                          </p>
                        </div>
                      </div>
                      <Link
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${testimonial.name}'s profile on X`}
                        href="https://x.com/"
                        className="bg-background-1 dark:bg-background-6 group-hover:bg-background-1 group-hover:dark:bg-background-7 hover:shadow-4 inline-flex h-11 w-[74px] items-center justify-center rounded-[360px] px-2.5 py-1 backdrop-blur-[15px] transition-all duration-500 ease-in-out hover:scale-110">
                        <Image src={xIconImg} alt="twitter" className="dark:invert" />
                      </Link>
                    </div>
                    <blockquote>
                      <p className="group-hover:text-accent/60 line-clamp-3 max-w-[530px] transform text-wrap transition-all duration-500 ease-in-out group-hover:translate-x-1">
                        {testimonial.quote}
                      </p>
                    </blockquote>
                  </article>
                );
              })}
            </div>
          </Marquee>
        </div>
      </RevealAnimation>
    </section>
  );
};

export default Testimonial;
