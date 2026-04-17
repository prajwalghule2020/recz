import RevealAnimation from '@/components/animation/RevealAnimation';
import { cn } from '@/utils/cn';
import linkedin from '@public/images/icons/linkedin.svg';
import xIcon from '@public/images/icons/x.svg';
import youtube from '@public/images/icons/youtube.svg';
import gradientImg from '@public/images/ns-img-532.png';
import appLogo from '@public/logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '../ThemeToggle';
import FooterDivider from './FooterDivider';

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Dashboard', href: '/' },
      { label: 'Search', href: '/search' },
      { label: 'People', href: '/people' },
      { label: 'Photos', href: '/photos' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/auth/signin' },
      { label: 'Create Account', href: '/auth/signup' },
      { label: 'Forgot Password', href: '/auth/forgot-password' },
      { label: 'Verify Email', href: '/auth/verify-email' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'API Health Check', href: '/api/health' },
      { label: 'Request Access', href: '/auth/signup' },
      { label: 'Reset Password', href: '/auth/reset-password' },
      { label: 'Portal Home', href: '/' },
    ],
  },
];

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={cn('bg-secondary dark:bg-background-8 relative z-0 overflow-hidden', className)}>
      <RevealAnimation delay={0.3} offset={50} direction="up">
        <figure className="pointer-events-none absolute -top-[1320px] left-1/2 -z-1 size-[1635px] -translate-x-1/2 select-none">
          <Image src={gradientImg} alt="footer-four-gradient" className="size-full object-cover" />
        </figure>
      </RevealAnimation>
      <div className="main-container px-5">
        <div className="grid grid-cols-12 justify-between gap-x-0 gap-y-10 pt-10 pb-8 xl:pt-16">
          <RevealAnimation delay={0.1}>
            <div className="col-span-12 xl:col-span-4">
              <div className="max-w-[306px]">
                <figure>
                  <span className="inline-flex size-14 items-center justify-center rounded-full bg-white p-2 shadow-sm">
                    <Image src={appLogo} alt="Face-AI Logo" className="size-full object-contain" />
                  </span>
                </figure>
                <p className="text-accent/60 text-tagline-1 mt-4 mb-5 font-normal">
                  Face-AI helps teams search, analyze, and monitor people, places, events, and photos from one
                  intelligent workspace.
                </p>
                <div className="flex items-center gap-3">
                  <Link target="_blank" href="https://www.youtube.com">
                    <span className="sr-only">Youtube</span>
                    <Image className="size-6" src={youtube} alt="Youtube" />
                  </Link>
                  <div className="bg-stroke-1/20 h-6 w-px" />
                  <Link target="_blank" href="https://www.linkedin.com">
                    <span className="sr-only">LinkedIn</span>
                    <Image className="size-6" src={linkedin} alt="LinkedIn" />
                  </Link>
                  <div className="bg-stroke-1/20 h-6 w-px" />
                  <Link target="_blank" href="https://x.com">
                    <span className="sr-only">X</span>
                    <Image className="size-6" src={xIcon} alt="X" />
                  </Link>
                </div>
              </div>
            </div>
          </RevealAnimation>
          <div className="col-span-12 grid grid-cols-12 gap-x-0 gap-y-6 xl:col-span-8">
            {footerSections.map(({ title, links }, index) => (
              <div className="col-span-12 md:col-span-4" key={title}>
                <RevealAnimation delay={0.2 + index * 0.1}>
                  <div className="space-y-5">
                    <p className="sm:text-heading-6 text-tagline-1 text-primary-50 font-normal">{title}</p>
                    <ul className="space-y-3">
                      {links.map(({ label, href }) => (
                        <li key={label}>
                          <Link href={href} className="footer-link">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealAnimation>
              </div>
            ))}
          </div>
        </div>
        <div className="relative pt-4 pb-6 text-center">
          <FooterDivider className="bg-accent/10 dark:bg-stroke-6" />
          <RevealAnimation delay={0.7} offset={10} start="top 105%">
            <p className="text-tagline-1 text-primary-50 font-normal">
              Copyright © {new Date().getFullYear()} Face-AI. Intelligent visual analysis platform.
            </p>
          </RevealAnimation>
        </div>
      </div>
      <ThemeToggle />
    </footer>
  );
};

Footer.displayName = 'Footer';
export default Footer;
