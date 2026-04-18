import Footer from '@/components/shared/footer/Footer';
import Navbar from '@/components/shared/navbar/Navbar';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}