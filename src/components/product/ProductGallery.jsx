import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Rotate3d, ZoomIn } from 'lucide-react';
import SmartImage from '../common/SmartImage';
import { imageUrl } from '../../data/images';
import { classNames } from '../../utils/format';

// One photograph per product; alternate views are framed crops of that same piece, plus video and 360° slots.
const VIEWS = [
  { kind: 'image', label: 'Front', pos: 'center', scale: 1 },
  { kind: 'image', label: 'Detail', pos: '35% 40%', scale: 1.7 },
  { kind: 'image', label: 'Macro', pos: '65% 60%', scale: 2.4 },
  { kind: 'video', label: 'Video' },
  { kind: 'spin', label: '360°' },
];

function ZoomView({ image, view }) {
  const [lens, setLens] = useState(null);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  return (
    <div className="relative h-full w-full cursor-zoom-in" onMouseMove={onMove} onMouseLeave={() => setLens(null)}>
      <div className="h-full w-full" style={{ transform: `scale(${view.scale})`, transformOrigin: view.pos }}>
        <SmartImage name={image} width={1400} priority sizes="(min-width:1024px) 50vw, 100vw" className="h-full w-full" />
      </div>
      {lens && (
        <div
          className="pointer-events-none absolute inset-0 hidden md:block"
          style={{
            backgroundImage: `url(${imageUrl(image, 2000)})`,
            backgroundSize: `${220 * view.scale}%`,
            backgroundPosition: `${lens.x}% ${lens.y}%`,
          }}
        />
      )}
      {!lens && (
        <span className="pointer-events-none absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-rose-deep md:flex">
          <ZoomIn size={13} /> Hover to zoom
        </span>
      )}
    </div>
  );
}

function VideoView({ image }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div className="h-full w-full" animate={playing ? { scale: [1, 1.18, 1.05], x: ['0%', '-4%', '3%'] } : { scale: 1 }} transition={{ duration: 9, repeat: playing ? Infinity : 0, ease: 'easeInOut' }}>
        <SmartImage name={image} width={1400} className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-0 bg-rose-blush/30" />
      <button onClick={() => setPlaying((p) => !p)} className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/90 text-rose-deep shadow-rose-lg transition hover:scale-105" aria-label={playing ? 'Pause video' : 'Play video'}>
        {playing ? <span className="flex gap-1.5"><span className="h-6 w-1.5 rounded bg-rose-deep" /><span className="h-6 w-1.5 rounded bg-rose-deep" /></span> : <Play size={28} fill="currentColor" className="ml-1" />}
      </button>
      <span className="absolute bottom-4 left-4 rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-rose-deep">Styling film · 0:24</span>
    </div>
  );
}

function SpinView({ image }) {
  const [angle, setAngle] = useState(0);
  const start = useRef(null);
  return (
    <div
      className="relative flex h-full w-full cursor-grab touch-none items-center justify-center overflow-hidden bg-gradient-to-br from-ivory to-champagne/50 active:cursor-grabbing"
      onPointerDown={(e) => (start.current = { x: e.clientX, a: angle })}
      onPointerMove={(e) => start.current && setAngle(start.current.a + (e.clientX - start.current.x) * 0.6)}
      onPointerUp={() => (start.current = null)}
      onPointerLeave={() => (start.current = null)}
    >
      <div className="h-[78%] w-[78%] overflow-hidden rounded-full shadow-rose-lg" style={{ transform: `perspective(900px) rotateY(${Math.sin((angle * Math.PI) / 180) * 28}deg) rotate(${angle * 0.15}deg)` }}>
        <SmartImage name={image} width={1000} className="h-full w-full" position={`${50 + Math.sin((angle * Math.PI) / 180) * 30}% 50%`} />
      </div>
      <span className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-rose-deep">
        <Rotate3d size={13} /> Drag to rotate · 360° preview
      </span>
    </div>
  );
}

export default function ProductGallery({ product }) {
  const [i, setI] = useState(0);
  const view = VIEWS[i];

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto lg:w-20 lg:flex-col">
        {VIEWS.map((v, idx) => (
          <button key={v.label} onClick={() => setI(idx)} className={classNames('relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition', idx === i ? 'border-rose' : 'border-transparent opacity-70 hover:opacity-100')} aria-label={v.label}>
            {v.kind === 'image' ? (
              <div className="h-full w-full" style={{ transform: `scale(${v.scale})`, transformOrigin: v.pos }}>
                <SmartImage name={product.image} width={200} sizes="80px" className="h-full w-full" />
              </div>
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-ivory to-champagne/60 text-rose-deep">
                {v.kind === 'video' ? <Play size={18} /> : <Rotate3d size={18} />}
                <span className="text-[9px] uppercase tracking-[0.14em]">{v.label}</span>
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-[28px] border border-rose-light/50 bg-ivory">
        <motion.div
          className="aspect-square w-full lg:aspect-[4/5]"
          drag={view.kind === 'image' ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) setI((x) => Math.min(VIEWS.length - 1, x + 1));
            if (info.offset.x > 60) setI((x) => Math.max(0, x - 1));
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div key={i} className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {view.kind === 'image' && <ZoomView image={product.image} view={view} />}
              {view.kind === 'video' && <VideoView image={product.image} />}
              {view.kind === 'spin' && <SpinView image={product.image} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
          {VIEWS.map((v, idx) => (
            <span key={v.label} className={classNames('h-1.5 rounded-full transition-all', idx === i ? 'w-6 bg-rose' : 'w-1.5 bg-rose-light')} />
          ))}
        </div>
      </div>
    </div>
  );
}
