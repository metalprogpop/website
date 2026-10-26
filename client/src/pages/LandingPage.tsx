import { Header } from '../components/landing/Header';
import { HeroSection } from '../components/landing/HeroSection';
import { LatestEpisodes } from '../components/landing/LatestEpisodes';
import { PlatformsSection } from '../components/landing/PlatformsSection';
import { FanClubTeaser } from '../components/landing/FanClubTeaser';
import { Footer } from '../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <LatestEpisodes />
        <FanClubTeaser />
        <PlatformsSection />
      </main>
      <Footer />
    </div>
  );
}
