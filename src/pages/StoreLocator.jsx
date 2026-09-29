import PageBanner from '../components/common/PageBanner';
import StoreLocator from '../components/store/StoreLocator';

export default function StoreLocatorPage() {
  return (
    <>
      <PageBanner image="pageBanner_stores" eyebrow="40+ boutiques across India" title="Find a Store" copy="Search by city or pincode, or share your location to find the nearest boutique with bridal lounges, custom design desks and gold exchange." crumbs={[['Stores']]} />
      <section className="w-full bg-gradient-to-b from-cream to-ivory section-y">
        <div className="shell">
          <StoreLocator />
        </div>
      </section>
    </>
  );
}
