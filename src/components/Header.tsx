import React, { useState } from 'react';
import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';

export type NavSection = 'home' | 'menu' | 'about' | 'contact';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onNavigate: (section: NavSection) => void;
}

const NAV_LINKS: { id: NavSection; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'menu', label: 'Menu' },
  { id: 'about', label: 'About Us' },
  { id: 'contact', label: 'Contact' }
];

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (section: NavSection) => {
    setMobileOpen(false);
    onNavigate(section);
  };

  return (
    <header className="sticky top-0 z-50 bg-broger-ink/95 backdrop-blur-md border-b border-broger-orange/30 shadow-[0_1px_12px_rgba(255,138,31,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-3 group"
            onClick={() => handleNavigate('home')}
            aria-label="Bro-Ger home"
          >
            <img
              src="/logo.jpg"
              alt="Bro-Ger logo"
              className="h-11 w-11 md:h-12 md:w-12 rounded-full neon-ring transition-transform duration-300 group-hover:scale-105"
            />
            <span className="flex flex-col items-start leading-none">
              <span className="font-display font-black text-xl md:text-2xl tracking-[0.12em] text-broger-cream">
                BRO-GER
              </span>
              <span className="hidden sm:block font-display font-bold text-[10px] md:text-[11px] tracking-[0.18em] neon-text mt-1">
                NOT YOUR ORDINARY BURGER
              </span>
            </span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className="font-display font-bold text-sm tracking-[0.12em] uppercase text-stone-300 hover:text-broger-orange transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Cart + mobile menu toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 px-3 py-2 md:px-4 rounded-full border border-broger-orange/50 text-broger-cream hover:bg-broger-orange hover:text-broger-ink transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden md:inline font-display font-bold text-sm tracking-wider">CART</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-broger-orange text-broger-ink text-xs font-bold rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-broger-cream hover:text-broger-orange transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.id)}
                className="py-3 rounded-xl bg-broger-coal border border-broger-line font-display font-bold text-sm tracking-[0.12em] uppercase text-stone-300 hover:text-broger-orange hover:border-broger-orange/60 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
