'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Custom coffee roaster icon - looks like a drum roaster with flames
const RoasterIcon = ({ active }: { active?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`w-6 h-6 ${active ? 'text-coffee-800' : 'text-current'}`}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Roaster drum body */}
    <ellipse cx="12" cy="11" rx="7" ry="4" />
    <path d="M5 11v3c0 2.2 3.1 4 7 4s7-1.8 7-4v-3" />
    {/* Drum window/porthole */}
    <circle cx="12" cy="11" r="2" strokeWidth="1.5" />
    {/* Handle/crank */}
    <path d="M19 11h2.5M21.5 9v4" />
    {/* Flames underneath */}
    <path d="M8 20c0-1 .5-1.5 1-2s-.2-1.5 0-2" className={active ? 'text-amber-500' : ''} />
    <path d="M12 20c0-1 .5-1.5 1-2s-.2-1.5 0-2" className={active ? 'text-amber-500' : ''} />
    <path d="M16 20c0-1 .5-1.5 1-2s-.2-1.5 0-2" className={active ? 'text-amber-500' : ''} />
    {/* Stand/legs */}
    <path d="M7 18l-1 3M17 18l1 3" strokeWidth="1.5" />
  </svg>
);

const navItems = [
  { href: '/', label: 'Home', icon: '☕', activeIcon: '☕' },
  { href: '/analytics', label: 'Explore', icon: '🌍', activeIcon: '🌍' },
  { href: '/beans', label: 'Beans', icon: '🫘', activeIcon: '🫘' },
  { href: '/roasters', label: 'Roasters', icon: 'roaster', activeIcon: 'roaster' },
];

export function Navigation() {
  const pathname = usePathname();

  // Don't show nav on onboarding or specific pages
  if (pathname === '/onboarding' || pathname.startsWith('/brew') || pathname.startsWith('/rate')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Gradient fade effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
      
      {/* Navigation bar */}
      <div className="relative bg-white/80 backdrop-blur-lg border-t border-coffee-100/50 safe-area-pb">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => {
            const isActive = 
              item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-2.5 sm:py-3 transition-all duration-200 ${
                  isActive 
                    ? 'text-coffee-900' 
                    : 'text-coffee-400 hover:text-coffee-600'
                }`}
              >
                <div className={`relative transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}>
                  {item.icon === 'roaster' ? (
                    <RoasterIcon active={isActive} />
                  ) : (
                    <span className="text-xl sm:text-2xl">{isActive ? item.activeIcon : item.icon}</span>
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-coffee-800" />
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${
                  isActive ? 'text-coffee-800' : ''
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
