import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { FALLBACK_PRODUCTS, RUNWAY_LOOKS_META } from "@/data";
import { getAllProducts, subscribeToProducts, supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { ProductQuickView } from "@/components/shop/ProductQuickView";

interface RunwaySlotStyle {
  left: string;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
  interactive: boolean;
}

const SLOT_BY_OFFSET: Record<number, RunwaySlotStyle> = {
  [-1]: { left: "96%", scale: 1.04, opacity: 0, blur: 0, zIndex: 14, interactive: false },
  [0]: { left: "65%", scale: 1, opacity: 1, blur: 0, zIndex: 12, interactive: true },
  [1]: { left: "44%", scale: 0.78, opacity: 0.96, blur: 0.6, zIndex: 10, interactive: true },
  [2]: { left: "29%", scale: 0.61, opacity: 0.82, blur: 2, zIndex: 8, interactive: true },
  [3]: { left: "17%", scale: 0.48, opacity: 0.58, blur: 3.6, zIndex: 6, interactive: true },
  [4]: { left: "7%", scale: 0.38, opacity: 0.32, blur: 5.2, zIndex: 4, interactive: false },
};

const HIDDEN_SLOT: RunwaySlotStyle = {
  left: "-6%",
  scale: 0.3,
  opacity: 0,
  blur: 7,
  zIndex: 1,
  interactive: false,
};

function getRelativeOffset(index: number, active: number, total: number): number {
  const forward = (index - active + total) % total;
  if (forward === total - 1) return -1;
  return forward;
}

export function HomePage() {
  const [searchParams] = useSearchParams();
  const initialLookParam = Number(searchParams.get("look") || 1);
  const initialLookIndex =
    Number.isFinite(initialLookParam) && initialLookParam >= 1 && initialLookParam <= RUNWAY_LOOKS_META.length
      ? initialLookParam - 1
      : 0;

  const [activeLook, setActiveLook] = useState(initialLookIndex);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const lockUntilRef = useRef<number>(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    setActiveLook(initialLookIndex);
  }, [initialLookIndex]);

  const loadCatalog = useCallback(async () => {
    try {
      const live = await getAllProducts();
      if (live.length > 0) setProducts(live);
    } catch {
      /* keep local runway fallback when API is offline */
    }
  }, []);

  useEffect(() => {
    loadCatalog();
    const channel = subscribeToProducts(() => loadCatalog());
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadCatalog]);

  const looks = useMemo(() => {
    return RUNWAY_LOOKS_META.map((meta) => {
      const matched = products.filter((p) => p.event === meta.event);
      const fallback = FALLBACK_PRODUCTS.filter((p) => p.event === meta.event);
      return {
        ...meta,
        pieces: matched.length > 0 ? matched.slice(0, 4) : fallback,
      };
    });
  }, [products]);

  const totalLooks = looks.length;
  const active = looks[activeLook];

  const stepToLook = useCallback(
    (nextIndex: number) => {
      const now = Date.now();
      if (now < lockUntilRef.current) return;
      const normalized = (nextIndex + totalLooks) % totalLooks;
      if (normalized === activeLook) return;
      lockUntilRef.current = now + 720;
      setActiveLook(normalized);
    },
    [activeLook, totalLooks],
  );

  const stepBy = useCallback(
    (delta: number) => {
      stepToLook(activeLook + delta);
    },
    [activeLook, stepToLook],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (quickViewProduct) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        stepBy(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        stepBy(-1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickViewProduct, stepBy]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (quickViewProduct) return;
    const dominant = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominant) < 10) return;
    stepBy(dominant > 0 ? 1 : -1);
  };

  return (
    <div
      id="runway"
      onWheel={handleWheel}
      className="relative min-h-[calc(100dvh-54px)] overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#faf8f2,#f3efe5)] text-[#2b2a26] lg:h-[calc(100dvh-85px)]"
    >
      <div className="relative mx-auto grid h-full max-w-[1720px] grid-cols-1 px-5 pb-6 pt-5 sm:px-8 lg:grid-cols-[270px_1fr_250px] lg:gap-4 lg:px-10 lg:py-6">
        {/* Left editorial column: Collection intro + Odometer Look Counter */}
        <section className="relative z-20 flex flex-col justify-between pb-4 lg:py-4">
          <div>
            <h1 className="font-display text-[13px] uppercase leading-6 tracking-[0.18em] text-[#2b2a26] sm:text-[15px]">
              THE TIBEB COLLECTION
            </h1>
            <p className="mt-3 max-w-[260px] text-[11px] font-light leading-relaxed tracking-[0.02em] text-[#8d887b]">
              A study in heritage and grace. Handwoven Ethiopian cotton and intricate tilet borders, crafted in Addis Ababa.
            </p>
          </div>

          <div className="mt-6 flex items-end justify-between lg:mt-0 lg:block">
            <div>
              <div className="flex items-baseline gap-2.5 font-display text-[19px] tracking-[0.16em] text-[#2b2a26] sm:text-[22px]">
                <span>LOOK</span>
                <span
                  aria-live="polite"
                  className="relative inline-block h-[1.3em] w-[1.2em] overflow-hidden align-baseline text-[#2b2a26]"
                >
                  {looks.map((item, idx) => (
                    <span
                      key={item.title}
                      style={{
                        transform: `translateY(${(idx - activeLook) * 100}%)`,
                        transition: "transform 700ms cubic-bezier(0.65, 0, 0.2, 1)",
                      }}
                      className="absolute left-0 top-0 leading-[1.3em]"
                    >
                      {item.lookNumber}
                    </span>
                  ))}
                </span>
              </div>
              <p className="mt-1.5 text-[9px] uppercase tracking-[0.22em] text-[#8d887b]">
                {active.subtitle}
              </p>
              <Link
                to="/shop"
                className="mt-3 inline-block text-[8px] uppercase tracking-[0.22em] text-[#6d675d] underline underline-offset-4 transition-colors hover:text-[#8d4a39]"
              >
                Shop the collection
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:mt-6">
              <button
                type="button"
                onClick={() => stepBy(-1)}
                aria-label="Previous look"
                className="grid h-8 w-8 place-items-center rounded-full border border-[#d9d1c2] text-[#5b554c] transition-colors hover:border-[#2b2a26] hover:text-[#2b2a26]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => stepBy(1)}
                aria-label="Next look"
                className="grid h-8 w-8 place-items-center rounded-full border border-[#d9d1c2] text-[#5b554c] transition-colors hover:border-[#2b2a26] hover:text-[#2b2a26]"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Center perspective runway stage */}
        <section
          aria-label="Interactive runway lookbook. Scroll, swipe, click a look, or use arrow keys."
          tabIndex={0}
          onPointerDown={(event) => {
            pointerStartRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            if (!pointerStartRef.current) return;
            const dx = event.clientX - pointerStartRef.current.x;
            pointerStartRef.current = null;
            if (Math.abs(dx) > 45) {
              stepBy(dx < 0 ? 1 : -1);
            }
          }}
          className="relative min-h-[54vh] select-none overflow-hidden outline-none lg:h-full lg:min-h-0"
        >
          {/* Soft runway floor shadow */}
          <div className="pointer-events-none absolute inset-x-[12%] bottom-[5%] h-12 rounded-[50%] bg-[#c8bfa9]/30 blur-2xl" />

          {looks.map((runwayLook, index) => {
            const offset = getRelativeOffset(index, activeLook, totalLooks);
            const slot = SLOT_BY_OFFSET[offset] ?? HIDDEN_SLOT;
            const isActive = offset === 0;

            return (
              <div
                key={runwayLook.title}
                onClick={() => {
                  if (slot.interactive) stepToLook(index);
                }}
                style={{
                  left: slot.left,
                  transform: `translateX(-50%) scale(${slot.scale})`,
                  opacity: slot.opacity,
                  filter: `blur(${slot.blur}px)`,
                  zIndex: slot.zIndex,
                  pointerEvents: slot.interactive ? "auto" : "none",
                  transformOrigin: "50% 100%",
                  transition:
                    "left 950ms cubic-bezier(0.65, 0, 0.2, 1), transform 950ms cubic-bezier(0.65, 0, 0.2, 1), opacity 950ms cubic-bezier(0.65, 0, 0.2, 1), filter 950ms cubic-bezier(0.65, 0, 0.2, 1)",
                }}
                className={`absolute bottom-[4%] flex h-[88%] w-[320px] items-end justify-center sm:w-[390px] lg:w-[440px] ${
                  isActive ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <img
                  src={runwayLook.model}
                  alt={`${runwayLook.title} — ${runwayLook.subtitle}`}
                  draggable={false}
                  style={{
                    objectPosition: runwayLook.modelPosition,
                    WebkitMaskImage:
                      "radial-gradient(ellipse 72% 94% at 50% 52%, #000 72%, transparent 99%)",
                    maskImage:
                      "radial-gradient(ellipse 72% 94% at 50% 52%, #000 72%, transparent 99%)",
                  }}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
            );
          })}

          {/* Subtle circular stage advance button on bottom-right like video */}
          <button
            type="button"
            onClick={() => stepBy(1)}
            aria-label="Advance to next runway look"
            className="absolute bottom-3 right-2 z-20 hidden h-8 w-8 place-items-center rounded-full border border-[#d6cebe] bg-[#faf8f2]/80 text-[#6e675d] backdrop-blur-sm transition-colors hover:border-[#2b2a26] hover:text-[#2b2a26] lg:grid"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </section>

        {/* Right synchronized "Shop the Look" piece breakdown */}
        <aside
          aria-label="Pieces in this look"
          className="relative z-20 flex flex-col border-t border-[#e2dbd0] pt-4 lg:min-h-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[8px] uppercase tracking-[0.22em] text-[#8d887b]">
              Shop the look
            </span>
            <span className="font-display text-[8px] tracking-[0.18em] text-[#8d887b]">
              0{active.lookNumber} / 0{totalLooks}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3"
            >
              {active.pieces.map((piece, idx) => {
                const liked = isWishlisted(piece.id);
                return (
                  <motion.div
                    key={piece.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative flex flex-col justify-between border-b border-[#e5dfd3] pb-2.5 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => toggleWishlist(piece)}
                      aria-label={liked ? `Remove ${piece.name} from wishlist` : `Save ${piece.name} to wishlist`}
                      aria-pressed={liked}
                      className="absolute left-0 top-0 z-10 grid h-7 w-7 place-items-center text-[#8d887b] transition-colors hover:text-[#8d4a39]"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${liked ? "fill-[#8d4a39] text-[#8d4a39]" : ""}`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(piece)}
                      aria-label={`Inspect ${piece.name}`}
                      className="flex h-[118px] w-full items-center justify-center overflow-hidden bg-transparent px-4 pt-2 lg:h-full lg:max-h-[135px]"
                    >
                      <img
                        src={piece.image}
                        alt={piece.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    </button>

                    <div className="mt-1.5 flex items-end justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(piece)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-[8px] font-medium uppercase tracking-[0.16em] text-[#2b2a26] group-hover:text-[#8d4a39]">
                          {piece.name}
                        </p>
                        <p className="mt-0.5 text-[9px] text-[#8d887b]">
                          ${Number(piece.price).toFixed(2)}
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={piece.stock === 0}
                        onClick={() => addToCart(piece)}
                        aria-label={`Add ${piece.name} to bag`}
                        className="grid h-7 w-7 shrink-0 place-items-center text-[#433e36] transition-colors hover:text-[#8d4a39] disabled:opacity-35"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>

      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          open={Boolean(quickViewProduct)}
          onOpenChange={(open) => {
            if (!open) setQuickViewProduct(null);
          }}
        />
      )}
    </div>
  );
}
