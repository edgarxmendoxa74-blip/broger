import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeroProps {
  onOrderNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderNow }) => {
  const { siteSettings } = useSiteSettings();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const heroImageUrl = siteSettings?.hero_image || '';
  const showImage = heroImageUrl !== '' && failedUrl !== heroImageUrl;

  return (
    <section className="relative w-full pt-6">
      <div className="relative w-full h-[26rem] md:h-[30rem] overflow-hidden rounded-3xl border border-broger-orange/30 bg-broger-coal">
        {showImage ? (
          <img
            src={heroImageUrl}
            alt="Bro-Ger banner"
            className="w-full h-full object-cover object-center"
            onError={() => setFailedUrl(heroImageUrl)}
          />
        ) : (
          // Branded fallback when no banner is set or it fails to load
          <div className="absolute inset-0 hidden md:flex items-center justify-end pr-16 lg:pr-24 bg-[radial-gradient(ellipse_at_75%_45%,rgba(255,138,31,0.2),transparent_60%)]">
            <img
              src="/logo.jpg"
              alt=""
              aria-hidden="true"
              className="h-72 w-72 lg:h-80 lg:w-80 rounded-full neon-ring"
            />
          </div>
        )}
        {/* Dark fade so the text reads on any banner */}
        <div className="absolute inset-0 bg-gradient-to-r from-broger-ink via-broger-ink/80 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-12 max-w-xl">
            <p className="font-display font-bold text-xs md:text-sm tracking-[0.3em] neon-text mb-4">EST — 2022</p>
            <h1 className="font-display font-black text-4xl md:text-6xl leading-[1.05] tracking-wide text-broger-cream">
              NOT YOUR<br />ORDINARY <span className="neon-text">BURGER</span>
            </h1>
            <p className="text-stone-400 text-sm md:text-base mt-5 max-w-md">
              Juicy, loaded and made fresh. Order online for delivery or pickup.
            </p>
            <button
              onClick={onOrderNow}
              className="mt-8 inline-flex items-center gap-2 bg-broger-orange text-broger-ink font-display font-extrabold tracking-wider px-7 py-3.5 rounded-full hover:bg-broger-glow hover:shadow-neon transition-all"
            >
              ORDER NOW
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
