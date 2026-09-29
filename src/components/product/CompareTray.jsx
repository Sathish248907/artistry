import { AnimatePresence, motion } from 'framer-motion';
import { GitCompareArrows, X } from 'lucide-react';
import Modal from '../common/Modal';
import SmartImage from '../common/SmartImage';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';
import { productById } from '../../data/products';
import { formatINR } from '../../utils/format';
import { priceBreakup } from '../../utils/pricing';

const AVAIL = { 'in-stock': 'In stock', 'low-stock': 'Few left', 'made-to-order': 'Made to order (21 days)' };

export default function CompareTray() {
  const { compare, toggleCompare, clearCompare, addToCart } = useShop();
  const { compareOpen, setCompareOpen } = useUI();
  const items = compare.map(productById).filter(Boolean);

  const rows = [
    ['Price', (p) => formatINR(priceBreakup(p).total)],
    ['Gold Purity', (p) => p.purity],
    ['Weight', (p) => `${p.weight} g`],
    ['Making Charges', (p) => `${formatINR(priceBreakup(p).making)} (${p.makingPct}%)`],
    ['Certification', (p) => p.certification],
    ['Availability', (p) => AVAIL[p.availability]],
    ['Rating', (p) => `${p.rating} ★ (${p.reviews})`],
  ];

  return (
    <>
      <AnimatePresence>
        {items.length > 0 && !compareOpen && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-rose-light bg-ivory/95 p-2 pl-4 shadow-rose-lg backdrop-blur md:bottom-6"
          >
            <GitCompareArrows size={18} className="shrink-0 text-rose" />
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              {items.map((p) => (
                <div key={p.id} className="relative shrink-0">
                  <SmartImage name={p.image} width={120} sizes="44px" className="h-11 w-11 rounded-full border-2 border-white" />
                  <button onClick={() => toggleCompare(p.id)} className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-white" aria-label={`Remove ${p.name}`}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <span className="ml-1 hidden text-xs text-ink-soft sm:inline">{items.length} of 4 selected</span>
            </div>
            <button onClick={clearCompare} className="hidden px-2 text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep sm:block">
              Clear
            </button>
            <button onClick={() => setCompareOpen(true)} disabled={items.length < 2} className="btn-primary !px-5 !py-3">
              Compare
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} size="xl" title="Compare jewellery">
        <div className="overflow-auto p-6 md:p-10">
          <p className="eyebrow">Side by side</p>
          <h3 className="mt-2 font-display text-4xl">Compare jewellery</h3>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className="w-40" />
                  {items.map((p) => (
                    <th key={p.id} className="p-3 text-left align-top font-normal">
                      <SmartImage name={p.image} width={400} sizes="200px" className="aspect-square w-full rounded-2xl" />
                      <p className="mt-3 font-display text-xl text-ink">{p.name}</p>
                      <button onClick={() => toggleCompare(p.id)} className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink-faint hover:text-rose-deep">
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, fn], i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-rose-blush/50' : ''}>
                    <td className="rounded-l-xl p-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">{label}</td>
                    {items.map((p, j) => (
                      <td key={p.id} className={`p-3 text-ink ${j === items.length - 1 ? 'rounded-r-xl' : ''}`}>
                        {fn(p)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td />
                  {items.map((p) => (
                    <td key={p.id} className="p-3">
                      <button onClick={() => addToCart(p.id)} className="btn-primary w-full !px-3">
                        Add to Cart
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </>
  );
}
