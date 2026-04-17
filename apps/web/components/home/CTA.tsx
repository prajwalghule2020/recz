import RevealAnimation from '@/components/animation/RevealAnimation';
import CTACheckList from '@/components/shared/cta/CTACheckList';
import CtaInputForm from '@/components/shared/cta/CtaInputForm';

const CTA = () => {
  return (
    <section className="dark:bg-background-6 bg-white py-[50px] md:py-20 lg:py-28" aria-label="cta section">
      <div className="main-container">
        <div className="xl :gap-0 flex flex-col items-center justify-between gap-8 xl:flex-row">
          <div className="mx-3 max-w-[649px] space-y-3 text-center sm:mx-0 md:w-full xl:text-left">
            <RevealAnimation delay={0.3}>
              <span className="badge badge-green">Get started</span>
            </RevealAnimation>

            <div className="space-y-3">
              <RevealAnimation delay={0.4}>
                <h2
                  className="ext-secondary dark:text-accent text-heading-4 lg:text-heading-2 mx-auto max-w-[449px] lg:mx-0 lg:text-left"
                  aria-label="cta-heading">
                  Ready to scale your
                  <span className="text-primary-500"> Face-AI product</span>
                </h2>
              </RevealAnimation>
              <RevealAnimation delay={0.5}>
                <p aria-label="cta-description">
                  Start your free trial today and launch secure, high-performance face intelligence workflows.
                </p>
              </RevealAnimation>
            </div>
          </div>
          {/* newsletter form  */}
          <div className="mt-[40px] w-full max-w-[562px] space-y-6 lg:mt-[67px] lg:pl-9 xl:pl-[96px]">
            <CtaInputForm />
            <CTACheckList
              className="gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-0 xl:justify-start"
              ctaCheckListData={[
                {
                  id: '1',
                  text: 'No credit card required',
                },
                {
                  id: '2',
                  text: '14-Day free trial',
                },
              ]}
              checkListVariant="default"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
