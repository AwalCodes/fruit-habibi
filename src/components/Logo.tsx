'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  href?: string;
}

export default function Logo({ 
  size = 'md', 
  showText = true, 
  className = '',
  href = '/'
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const LogoContent = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image */}
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-emerald-500/20 rounded-lg blur-sm"></div>
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg border border-yellow-400/30 bg-slate-900">
          <Image
            src="/images/fruit-habibi-logo.svg"
            alt="Fruit Habibi Logo"
            width={200}
            height={200}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 ${textSizes[size]} leading-tight`}>
            Fruit Habibi
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-xs text-emerald-300 font-medium tracking-wide">
              Global Harvest Solutions
            </span>
          ) : null}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity duration-300">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
