"use client";

import * as React from 'react';
import { motion } from 'framer-motion';

export type TestimonialCardItem = {
  id: number;
  author: string;
  testimonial: string;
  avatar?: string;
};

type CardPosition = 'front' | 'middle' | 'back';

type TestimonialCardProps = {
  handleShuffle: () => void;
  testimonial: string;
  position: CardPosition;
  id: number;
  author: string;
  avatar?: string;
};

type TestimonialCardsProps = {
  items: TestimonialCardItem[];
  autoPlayInterval?: number;
  className?: string;
};

export function TestimonialCard({ handleShuffle, testimonial, position, id, author, avatar }: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";

  return (
    <motion.div
      style={{
        zIndex: position === "front" ? "3" : position === "middle" ? "2" : "1"
      }}
      animate={{
        rotate: position === "front" ? "-7deg" : position === "middle" ? "0deg" : "7deg",
        x: position === "front" ? "0%" : position === "middle" ? "30%" : "60%",
        y: position === "front" ? "0%" : position === "middle" ? "-3%" : "-6%",
        scale: position === "front" ? 1 : position === "middle" ? 0.97 : 0.94,
        opacity: position === "front" ? 1 : position === "middle" ? 0.9 : 0.8,
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(_, info) => {
        dragRef.current = info.point.x;
      }}
      onDragEnd={(_, info) => {
        if (dragRef.current - info.point.x > 150) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      className={`absolute left-0 top-0 grid h-[280px] w-[220px] select-none place-content-center space-y-4 rounded-2xl border-2 border-slate-700 bg-slate-800/25 p-5 shadow-xl backdrop-blur-md sm:h-[340px] sm:w-[260px] sm:space-y-5 md:h-[420px] md:w-[320px] md:space-y-6 ${
        isFront ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={avatar ?? `https://i.pravatar.cc/128?img=${id}`}
        alt={`Avatar of ${author}`}
        className="pointer-events-none mx-auto h-16 w-16 rounded-full border-2 border-slate-700 bg-slate-200 object-cover sm:h-20 sm:w-20 md:h-28 md:w-28"
      />
      <span className="line-clamp-4 text-center text-sm italic text-slate-300 sm:text-base md:text-lg">&quot;{testimonial}&quot;</span>
      <span className="text-center text-xs font-medium text-indigo-300 sm:text-sm md:text-base">{author}</span>
    </motion.div>
  );
}

export function TestimonialCards({
  items,
  autoPlayInterval = 3800,
  className = '',
}: TestimonialCardsProps) {
  const [stack, setStack] = React.useState(items);

  const handleShuffle = React.useCallback(() => {
    setStack((prev) => {
      if (prev.length < 2) {
        return prev;
      }

      return [...prev.slice(1), prev[0]];
    });
  }, []);

  React.useEffect(() => {
    setStack(items);
  }, [items]);

  React.useEffect(() => {
    if (stack.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      handleShuffle();
    }, autoPlayInterval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoPlayInterval, handleShuffle, stack.length]);

  if (stack.length === 0) {
    return null;
  }

  return (
    <div className={`relative mx-auto h-[300px] w-[360px] sm:h-[380px] sm:w-[500px] md:h-[460px] md:w-[620px] ${className}`}>
      {stack.slice(0, 3).map((item, index) => {
        const position: CardPosition = index === 0 ? 'front' : index === 1 ? 'middle' : 'back';

        return (
          <TestimonialCard
            key={item.id}
            handleShuffle={handleShuffle}
            testimonial={item.testimonial}
            position={position}
            id={item.id}
            author={item.author}
            avatar={item.avatar}
          />
        );
      })}
    </div>
  );
}