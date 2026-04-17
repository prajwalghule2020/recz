"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import appLogo from "@public/logo.svg";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";

import React, { useState } from "react";


interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      className={cn(
        "fixed top-5 left-1/2 z-50 mx-auto w-full max-w-[350px] -translate-x-1/2 transition-all duration-500 min-[425px]:max-w-[375px] min-[500px]:max-w-[450px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px]",
        visible && "top-2",
        className,
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        width: visible ? "90%" : "100%",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 40,
      }}
      className={cn(
        "border-stroke-2 dark:border-stroke-6 bg-accent dark:bg-background-9 relative z-60 mx-auto hidden w-full items-center justify-between rounded-full border px-2.5 py-3.5 xl:flex xl:py-1.5",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  return (
    <motion.div
      className={cn(
        "hidden items-center xl:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onClick={onItemClick}
          className="hover:border-stroke-2 dark:hover:border-stroke-7 text-tagline-1 text-secondary/60 hover:text-secondary dark:text-accent/60 dark:hover:text-accent flex items-center gap-1 rounded-full border border-transparent px-4 py-2 font-normal transition-all duration-200"
          key={`link-${idx}`}
          href={item.link}
        >
          <span>{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "blur(0px)",
        width: visible ? "94%" : "100%",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 40,
      }}
      className={cn(
        "border-stroke-2 dark:border-stroke-6 bg-accent dark:bg-background-9 relative z-50 mx-auto flex w-full flex-col items-center justify-between rounded-full border px-2.5 py-3 xl:hidden",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "border-stroke-2 dark:border-stroke-6 bg-accent dark:bg-background-9 absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-2xl border px-4 py-6",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-secondary dark:text-accent" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-secondary dark:text-accent" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link href="/" className="inline-flex items-center">
      <span className="sr-only">Home</span>
      <figure className="flex size-10 items-center justify-center rounded-full bg-white p-1 shadow-sm">
        <Image src={appLogo} alt="Face-AI Logo" className="h-full w-full object-contain" priority />
      </figure>
      <span className="text-heading-6 text-secondary dark:text-accent ml-2 hidden font-semibold xl:inline">Face-AI</span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "inline-flex items-center justify-center transition-all duration-200";

  const variantStyles = {
    primary: "btn btn-md btn-primary hover:btn-white-dark dark:hover:btn-white",
    secondary:
      "hover:border-stroke-2 dark:hover:border-stroke-7 text-tagline-1 text-secondary/60 hover:text-secondary dark:text-accent/60 dark:hover:text-accent rounded-full border border-transparent px-4 py-2 font-normal",
    dark: "btn btn-md btn-primary hover:btn-white-dark dark:hover:btn-white",
    gradient: "btn btn-md btn-primary hover:btn-white-dark dark:hover:btn-white",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
