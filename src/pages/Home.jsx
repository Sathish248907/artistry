import HeroSection from '../components/home/HeroSection';
import GoldRateTicker from '../components/home/GoldRateTicker';
import CategoryGrid from '../components/home/CategoryGrid';
import OccasionSection from '../components/home/OccasionSection';
import TrendingSection from '../components/home/TrendingSection';
import NewArrivalsBanner from '../components/home/NewArrivalsBanner';
import BridalSection from '../components/home/BridalSection';
import CustomizeSection from '../components/home/CustomizeSection';
import GoldCoinSection from '../components/goldCoins/GoldCoinSection';
import GoldSavingsSection from '../components/home/GoldSavingsSection';
import JewelleryFinder from '../components/home/JewelleryFinder';
import GiftingSection from '../components/home/GiftingSection';
import { AppointmentSection, StoreSection } from '../components/home/StoreAppointmentSections';
import WhyUs from '../components/home/WhyUs';
import ReviewCarousel from '../components/home/ReviewCarousel';
import JournalSection from '../components/home/JournalSection';
import InstagramGallery from '../components/home/InstagramGallery';
import Newsletter from '../components/home/Newsletter';

export default function Home() {
  return (
    <>
      <HeroSection />
      <GoldRateTicker />
      <CategoryGrid />
      <OccasionSection />
      <TrendingSection />
      <NewArrivalsBanner />
      <BridalSection />
      <CustomizeSection />
      <GoldCoinSection />
      <GoldSavingsSection />
      <JewelleryFinder />
      <GiftingSection />
      <StoreSection />
      <AppointmentSection />
      <WhyUs />
      <ReviewCarousel />
      <JournalSection />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
