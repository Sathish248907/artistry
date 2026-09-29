import EmptyState from '../components/common/EmptyState';

export default function NotFound() {
  return (
    <section className="w-full bg-gradient-to-b from-ivory to-ivory py-24">
      <div className="shell">
        <EmptyState title="This page has wandered off" copy="The link may be old, or the piece may have found its forever home." action={{ label: 'Back to home', to: '/' }} secondary={{ label: 'Shop gold', to: '/products' }} />
      </div>
    </section>
  );
}
