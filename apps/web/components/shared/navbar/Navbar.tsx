'use client';

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/src/components/ui/resizable-navbar';
import { useState } from 'react';

const SharedNavbar = () => {
  const navItems = [
    {
      name: 'Company',
      link: '/about',
    },
    {
      name: 'Collaborate',
      link: '/services',
    },
    {
      name: 'Resources',
      link: '/blog',
    },
    {
      name: 'People & Culture',
      link: '/team',
    },
    {
      name: 'Pricing',
      link: '/pricing',
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} className="mx-auto flex-1 justify-center" />
          <div className="hidden items-center justify-center xl:flex">
            <NavbarButton href="/signup" variant="primary" className="normal-case">
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}>
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-tagline-1 text-secondary dark:text-accent block w-full rounded-full px-3 py-2 font-normal">
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full normal-case">
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
};

SharedNavbar.displayName = 'SharedNavbar';
export default SharedNavbar;
