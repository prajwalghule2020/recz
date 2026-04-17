import { ArcGalleryHero } from '../arc-gallery-hero-component';

const SocialActivity = () => {
  return (
    <section className="dark:bg-background-7 bg-white py-[50px] md:py-[100px] xl:py-[200px]">
      <div className="mx-5 max-w-full min-[425px]:max-w-[380px] min-[475px]:max-w-[450px] sm:mx-auto sm:max-w-[600px] md:max-w-[700px] lg:max-w-[980px] xl:max-w-[1240px] 2xl:max-w-[1440px]">
        <div className="relative rounded-[25px] bg-[url('/images/ns-img-242.png')] bg-cover bg-bottom px-3 py-[100px] sm:px-0">
          <div className="mx-auto max-w-[980px] px-3 sm:px-0">
            <ArcGalleryHero
              embedded
              startAngle={12}
              endAngle={168}
              radiusLg={420}
              radiusMd={310}
              radiusSm={220}
              cardSizeLg={112}
              cardSizeMd={94}
              cardSizeSm={74}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialActivity;
