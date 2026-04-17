import RevealAnimation from '../animation/RevealAnimation';
import IntroAnimation from '../scroll-morph-hero';
import LinkButton from '../ui/button/LinkButton';
import GradientAnimation from './GradientAnimation';

const Hero = () => {
  return (
    <section className="dark:bg-background-5 relative bg-white pt-[180px] pb-[100px] lg:pt-[230px] lg:pb-[200px]">
      <div className="main-container relative z-10">
        <div className="space-y-5 text-center">
          <RevealAnimation delay={0.1} downOnly>
            <span className="badge badge-gray-light">Recognize every face in seconds</span>
          </RevealAnimation>
          <div className="space-y-3">
            <RevealAnimation delay={0.2} downOnly>
              <h1 className="mx-auto max-w-[400px] leading-[1.3] sm:max-w-[600px] md:max-w-[900px] xl:max-w-[1110px]">
                <span className="hero-text-gradient hero-text-color-2 block">
                  Elevate your photo intelligence workflow with Face AI!
                </span>
              </h1>
            </RevealAnimation>
            <RevealAnimation delay={0.3} downOnly>
              <p className="mx-auto max-w-[400px] md:max-w-[600px] lg:max-w-full">
                All-in-one AI platform to detect faces, cluster identities, and search people across your photo library effortlessly.
              </p>
            </RevealAnimation>
          </div>
        </div>
        <RevealAnimation delay={0.4} downOnly>
          <div className="flex justify-center py-[72px]">
            <LinkButton
              href="/auth/signin"
              className="btn dark:btn-accent hover:btn-white dark:hover:btn-white-dark btn-secondary btn-xl">
              Start organizing photos
            </LinkButton>
          </div>
        </RevealAnimation>
        <RevealAnimation delay={0.45} downOnly>
          <div className="mx-auto mb-6 h-[420px] w-full max-w-[1200px] overflow-hidden md:mb-10 md:h-[520px]">
            <IntroAnimation className="h-full w-full" />
          </div>
        </RevealAnimation>
      </div>
      <RevealAnimation delay={0.6} offset={0} downOnly>
        <figure className="absolute top-0 left-1/2 z-0 h-full w-full max-w-[1390px] -translate-x-1/2">
          <GradientAnimation />
        </figure>
      </RevealAnimation>
    </section>
  );
};

export default Hero;
