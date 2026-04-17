import Blog from '@/components/home/Blog';
import CTA from '@/components/home/CTA';
import Features from '@/components/home/Features';
import FeaturesV2 from '@/components/home/FeaturesV2';
import FeaturesV3 from '@/components/home/FeaturesV3';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import SocialActivity from '@/components/home/SocialActivity';
import Testimonial from '@/components/home/Testimonial';
import { defaultMetadata } from '@/utils/generateMetaData';
import { Metadata } from 'next';

export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Social Media Marketing || NextSaaS',
};

const page = () => {
  return (
    <main className="bg-background-2 dark:bg-background-5 overflow-x-hidden">
      <Hero />
      <Services />
      <Features />
      <FeaturesV2 />
      <FeaturesV3 />
      <SocialActivity />
      <Testimonial />
      {/* <Blog /> */}
      <CTA />
    </main>
  );
};

export default page;
