import feat01 from '@public/images/ns-img-57.png';
import feat02 from '@public/images/ns-img-58.svg';
import feat03 from '@public/images/ns-img-59.svg';
import feat01Dark from '@public/images/ns-img-dark-35.png';
import feat02Dark from '@public/images/ns-img-dark-36.svg';
import feat04 from '@public/images/ns-img-dark-37.svg';
import Image from 'next/image';
import RevealAnimation from '../animation/RevealAnimation';
import LinkButton from '../ui/button/LinkButton';

const FeaturesV3 = () => {
  return (
    <section className="bg-background-1 dark:bg-background-5 pt-[60px] pb-[50px] md:pt-[120px] md:pb-[100px] xl:pt-[242px] xl:pb-[200px]">
      <div className="main-container">
        <div className="grid grid-cols-12 items-center gap-y-16 lg:gap-20 xl:gap-[100px]">
          <div className="col-span-12 lg:col-span-6">
            <div className="relative z-10 inline-block max-lg:left-1/2 max-lg:-translate-x-1/2">
              <RevealAnimation delay={0.2} direction="left" offset={100}>
                <figure className="max-w-[358px] rounded-[20px]">
                  <Image
                    src={feat01}
                    alt="about-data-integration"
                    className="size-full rounded-[20px] object-cover dark:hidden"
                  />
                  <Image
                    src={feat01Dark}
                    alt="about-data-integration"
                    className="hidden size-full rounded-[20px] object-cover dark:inline-block"
                  />
                </figure>
              </RevealAnimation>
              <RevealAnimation delay={0.3} direction="right">
                <figure className="absolute -top-12 -right-14 overflow-hidden rounded-2xl max-sm:w-[200px] sm:-top-[90px] sm:-right-[200px] md:-right-[150px] md:w-[250px] lg:-right-[150px] lg:w-[260px] xl:-right-[200px] xl:w-auto">
                  <Image
                    src={feat02}
                    alt="about-data-integration"
                    className="block size-full object-cover dark:hidden"
                  />
                  <Image src={feat02Dark} alt="about-data" className="hidden size-full object-cover dark:block" />
                </figure>
              </RevealAnimation>
              <RevealAnimation delay={0.4} direction="right">
                <figure className="absolute -right-14 bottom-12 -z-10 overflow-hidden rounded-2xl max-sm:w-[130px] sm:-right-[200px] sm:bottom-[85px] md:-right-[150px] lg:-right-[150px] xl:-right-[200px]">
                  <Image
                    src={feat03}
                    alt="about-data-integration"
                    className="block size-full object-cover dark:hidden"
                  />
                  <Image
                    src={feat04}
                    alt="about-data-integration"
                    className="hidden size-full object-cover dark:inline-block"
                  />
                </figure>
              </RevealAnimation>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6">
            <div className="space-y-3 text-center lg:text-left">
              <RevealAnimation delay={0.1}>
                <span className="badge badge-green">Scale smarter</span>
              </RevealAnimation>
              <RevealAnimation delay={0.2}>
                <h2 className="mx-auto w-full max-w-[592px] lg:mx-0">
                  Deploy your <br />
                  face workflows <span className="text-primary-500">like a pro</span>
                </h2>
              </RevealAnimation>
              <RevealAnimation delay={0.3}>
                <p className="mx-auto w-full max-w-[450px] lg:mx-0 lg:max-w-[592px]">
                  Use Face-AI&apos;s built-in automation tools to process detections, score confidence, and turn
                  real-time face data into faster, safer product decisions.
                </p>
              </RevealAnimation>
            </div>
            <div className="pt-8 pb-14">
              <ul className="flex flex-wrap items-center justify-center gap-4 lg:justify-start xl:gap-6">
                <RevealAnimation delay={0.4}>
                  <li className="flex items-center gap-2">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={15}
                        height={11}
                        viewBox="0 0 15 11"
                        fill="none"
                        className="shrink-0">
                        <path
                          d="M13.1875 1.79102L5.3125 9.66567L1.375 5.72852"
                          className="stroke-secondary dark:stroke-accent"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="lg:text-tagline-1 text-tagline-2 text-secondary dark:text-accent font-medium">
                      Real-time face detection
                    </span>
                  </li>
                </RevealAnimation>
                <RevealAnimation delay={0.5}>
                  <li className="flex items-center gap-2">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={15}
                        height={11}
                        viewBox="0 0 15 11"
                        fill="none"
                        className="shrink-0">
                        <path
                          d="M13.1875 1.79102L5.3125 9.66567L1.375 5.72852"
                          className="stroke-secondary dark:stroke-accent"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="lg:text-tagline-1 text-tagline-2 text-secondary dark:text-accent font-medium">
                      AI confidence scoring
                    </span>
                  </li>
                </RevealAnimation>
                <RevealAnimation delay={0.6}>
                  <li className="flex items-center gap-2">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={15}
                        height={11}
                        viewBox="0 0 15 11"
                        fill="none"
                        className="shrink-0">
                        <path
                          d="M13.1875 1.79102L5.3125 9.66567L1.375 5.72852"
                          className="stroke-secondary dark:stroke-accent"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="lg:text-tagline-1 text-tagline-2 text-secondary dark:text-accent font-medium">
                      Performance analytics
                    </span>
                  </li>
                </RevealAnimation>
              </ul>
            </div>
            <RevealAnimation delay={0.7}>
              <div className="text-center lg:text-left">
                <LinkButton
                  href="/features"
                  className="btn btn-secondary btn-xl hover:btn-white dark:btn-accent dark:hover:btn-white-dark">
                  Explore features
                </LinkButton>
              </div>
            </RevealAnimation>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesV3;
