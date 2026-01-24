'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const sizes = {
  sm: { image: 80 },
  md: { image: 120 },
  lg: { image: 180 },
  xl: { image: 240 },
};

export function Logo({ size = 'md', animate = false }: LogoProps) {
  const { image } = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center ${animate ? 'animate-pulse-soft' : ''}`}>
      <div 
        className="relative drop-shadow-2xl"
        style={{ width: image, height: image }}
      >
        <Image
          src="/logo.png"
          alt="Kissa Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
