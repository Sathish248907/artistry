import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, Truck } from 'lucide-react';
import Modal from '../common/Modal';
import SmartImage from '../common/SmartImage';
import Rating from '../common/Rating';
import QuantityStepper from '../common/QuantityStepper';
import WishlistButton from './WishlistButton';
import PriceBreakup from './PriceBreakup';
import { useUI } from '../../context/UIContext';
import { useShop } from '../../context/ShopContext';
import { productById } from '../../data/products';

export default function QuickViewModal() {
  const { quickViewId, closeQuickView } = useUI();
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const p = quickViewId ? productById(quickViewId) : null;

  return (
    <Modal open={Boolean(p)} onClose={() => { closeQuickView(); setQty(1); }} size="lg" title={p?.name}>
      {p && (
        <div className="grid overflow-y-auto md:grid-cols-2">
          <div className="relative bg-rose-blush">
            <motion.div initial={{ scale: 1.06, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
              <SmartImage name={p.image} width={900} sizes="(min-width:768px) 50vw, 100vw" className="aspect-square w-full md:aspect-[4/5]" />
            </motion.div>
          </div>
          <div className="flex flex-col p-6 md:p-9">
            <p className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">Code {p.code}</p>
            <h3 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{p.name}</h3>
            <div className="mt-2">
              <Rating value={p.rating} showValue count={p.reviews} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="chip">{p.purity} Gold</span>
              <span className="chip">{p.weight} g</span>
              <span className="chip">{p.certification}</span>
            </div>
            <div className="mt-6">
              <PriceBreakup product={p} compact />
            </div>
            <div className="mt-7 flex items-center gap-3">
              <QuantityStepper value={qty} onChange={setQty} />
              <WishlistButton id={p.id} className="border border-rose-light" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  addToCart(p.id, qty);
                  closeQuickView();
                }}
                className="btn-outline"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(p.id, qty, { silent: true });
                  closeQuickView();
                  navigate('/checkout');
                }}
                className="btn-primary"
              >
                Buy Now
              </button>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
              <span className="flex flex-col items-center gap-1.5"><BadgeCheck size={18} className="text-rose" />BIS Hallmark</span>
              <span className="flex flex-col items-center gap-1.5"><Truck size={18} className="text-rose" />Free Shipping</span>
              <span className="flex flex-col items-center gap-1.5"><ShieldCheck size={18} className="text-rose" />Insured</span>
            </div>
            <Link to={`/product/${p.slug}`} onClick={closeQuickView} className="mt-6 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-rose-deep underline-offset-4 hover:underline">
              View full details
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
