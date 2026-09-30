import React from 'react';
import { Flame, Truck, Clock } from 'lucide-react';
import { useSidebarContent } from '../hooks/useSidebarContent';

const HIGHLIGHTS = [
  { icon: Flame, title: 'Made Fresh', text: 'Grilled to order, never sitting around.' },
  { icon: Truck, title: 'Delivery & Pickup', text: 'Get it delivered or grab it yourself.' },
  { icon: Clock, title: 'Since 2022', text: 'Serving not-so-ordinary burgers.' }
];

const AboutSection: React.FC = () => {
  const { content, loading } = useSidebarContent();

  return (
    <section id="about" className="scroll-mt-24 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="flex justify-center">
          <img
            src="/logo.jpg"
            alt="Bro-Ger logo"
            className="w-56 h-56 md:w-80 md:h-80 rounded-full neon-ring"
          />
        </div>

        <div>
          <p className="font-display font-bold text-xs tracking-[0.3em] neon-text mb-3">ABOUT US</p>
          <h2 className="font-display font-black text-3xl md:text-4xl tracking-wide text-broger-cream mb-5">
            NOT YOUR ORDINARY <span className="neon-text">BURGER</span>
          </h2>
          <p className="text-stone-400 text-base md:text-lg leading-relaxed mb-8">
            {loading ? 'Loading...' : content.aboutUs}
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-broger-coal border border-broger-line rounded-2xl p-4">
                <Icon className="h-6 w-6 text-broger-orange mb-3" />
                <p className="font-display font-bold text-sm text-broger-cream mb-1">{title}</p>
                <p className="text-xs text-stone-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
