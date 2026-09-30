import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { useSidebarContent } from '../hooks/useSidebarContent';
import type { NavSection } from './Header';

interface SiteFooterProps {
  onNavigate: (section: NavSection) => void;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ onNavigate }) => {
  const { content } = useSidebarContent();

  const contacts = [
    { icon: Phone, label: 'Call us', value: content.contactPhone, href: `tel:${content.contactPhone}` },
    { icon: MessageCircle, label: 'Message us', value: content.contactMessage, href: undefined },
    { icon: Mail, label: 'Email us', value: content.contactEmail, href: `mailto:${content.contactEmail}` }
  ].filter((c) => c.value);

  return (
    <footer id="contact" className="scroll-mt-24 border-t border-broger-orange/30 bg-broger-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpg" alt="Bro-Ger logo" className="h-14 w-14 rounded-full neon-ring" />
              <div>
                <p className="font-display font-black text-2xl tracking-[0.12em] text-broger-cream">BRO-GER</p>
                <p className="font-display font-bold text-[11px] tracking-[0.18em] neon-text">NOT YOUR ORDINARY BURGER</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
              Est. 2022. Order online for delivery or pickup.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-extrabold text-sm tracking-[0.2em] neon-text mb-4">GET IN TOUCH</h3>
            <ul className="space-y-3">
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-broger-coal border border-broger-line flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-broger-orange" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-stone-500">{label}</span>
                    {href ? (
                      <a href={href} className="block text-sm text-broger-cream hover:text-broger-orange break-all transition-colors">{value}</a>
                    ) : (
                      <span className="block text-sm text-broger-cream break-all">{value}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-extrabold text-sm tracking-[0.2em] neon-text mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              {([['home', 'Home'], ['menu', 'Menu'], ['about', 'About Us']] as [NavSection, string][]).map(([id, label]) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="text-sm text-stone-400 hover:text-broger-orange transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-broger-line text-xs text-stone-500 flex flex-col sm:flex-row gap-2 justify-between">
          <p>© {new Date().getFullYear()} Bro-Ger. All rights reserved.</p>
          <p>Not your ordinary burger.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
