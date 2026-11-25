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

interface RunwayPose {
  xPct: number;
  yPct: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
  interactive: boolean;
}

const RUNWAY_EASE = [0.65, 0, 0.2, 1] as const;
const TRANSITION_SEC = 0.85;

function getPoseForOffset(offset: number): RunwayPose {
  switch (offset) {
    case -1:
      return { xPct: 30, yPct: 3, scale: 1.12, opacity: 0, blur: 2, zIndex: 25, interactive: false };
    case 0:
      return { xPct: 11, yPct: 0, scale: 1, opacity: 1, blur: 0, zIndex: 20, interactive: true };
    case 1:
      return { xPct: -5, yPct: -4.5, scale: 0.74, opacity: 0.94, blur: 0.5, zIndex: 16, interactive: true };
    case 2:
      return { xPct: -17, yPct: -8.5, scale: 0.55, opacity: 0.72, blur: 1.8, zIndex: 12, interactive: true };
    case 3:
      return { xPct: -27, yPct: -11.5, scale: 0.41, opacity: 0.42, blur: 3.4, zIndex: 8, interactive: true };
    case 4:
      return { xPct: -35, yPct: -14, scale: 0.31, opacity: 0.16, blur: 5.2, zIndex: 4, interactive: false };
    default:
      return offset < -1
        ? { xPct: 38, yPct: 5, scale: 1.18, opacity: 0, blur: 4, zIndex: 26, interactive: false }
        : { xPct: -42, yPct: -16, scale: 0.24, opacity: 0, blur: 7, zIndex: 1, interactive: false };
  }
}

const runwayCardVariants = {
  enter: (dir: number) => {
    const pose = getPoseForOffset(dir > 0 ? 5 : -2);
    return {
      x: `${pose.xPct}vw`,
      y: `${pose.yPct}%`,
      scale: pose.scale,
      opacity: 0,
      filter: `blur(${pose.blur}px)`,
    };
  },
  pose: (pose: RunwayPose) => ({
    x: `${pose.xPct}vw`,
    y: `${pose.yPct}%`,
    scale: pose.scale,
    opacity: pose.opacity,
    filter: `blur(${pose.blur}px)`,
    transition: { duration: TRANSITION_SEC, ease: RUNWAY_EASE },
  }),
  exit: (dir: number) => {
    const pose = getPoseForOffset(dir > 0 ? -2 : 5);
    return {
      x: `${pose.xPct}vw`,
      y: `${pose.yPct}%`,
      scale: pose.scale,
      opacity: 0,
      filter: `blur(${pose.blur}px)`,
      transition: { duration: 0.7, ease: RUNWAY_EASE },
    };
  },
};

const VISIBLE_OFFSETS = [-1, 0, 1, 2, 3, 4, 5] as const;

export function HomePage() {
  const [searchParams] = useSearchParams();
  const initialLookParam = Number(searchParams.get("look") || 1);
  const initialLookIndex =
    Number.isFinite(initialLookParam) && initialLookParam >= 1 && initialLookParam <= RUNWAY_LOOKS_META.length
      ? initialLookParam - 1
      : 0;

  const totalLooks = RUNWAY_LOOKS_META.length;
  const [virtualIndex, setVirtualIndex] = useState(initialLookIndex);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const lockUntilRef = useRef<number>(0);
  const wheelAccumRef = useRef<number>(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  useEffect(() => {
    setVirtualIndex((prev) => {
      const currentMod = ((prev % totalLooks) + totalLooks) % totalLooks;
      if (currentMod === initialLookIndex) return prev;
      return prev + (initialLookIndex - currentMod);
    });
  }, [initialLookIndex, totalLooks]);

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
        pieces: matched.length > 0 ? matched.slice(0, 3) : fallback,
      };
    });
  }, [products]);

  const activeLook = ((virtualIndex % totalLooks) + totalLooks) % totalLooks;
  const active = looks[activeLook];

  const stepBy = useCallback((delta: number) => {
    if (delta === 0) return;
    const now = Date.now();
    if (now < lockUntilRef.current) return;
    lockUntilRef.current = now + 460;
    setDirection(delta > 0 ? 1 : -1);
    setVirtualIndex((prev) => prev + delta);
  }, []);

  const jumpToLook = useCallback(
    (targetIdx: number) => {
      const rawDiff = targetIdx - activeLook;
      if (rawDiff === 0) return;
      const shortest =
        Math.abs(rawDiff) <= totalLooks / 2
          ? rawDiff
          : rawDiff > 0
          ? rawDiff - totalLooks
          : rawDiff + totalLooks;
      stepBy(shortest);
    },
    [activeLook, stepBy, totalLooks],
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
    // Let the right-hand "Shop the Look" panel scroll natively if the user scrolls over it
    if ((event.target as HTMLElement).closest("aside")) return;

    const dominant = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelAccumRef.current += dominant;

    if (wheelResetTimerRef.current) window.clearTimeout(wheelResetTimerRef.current);
    wheelResetTimerRef.current = window.setTimeout(() => {
      wheelAccumRef.current = 0;
    }, 140);

    if (Math.abs(wheelAccumRef.current) >= 18) {
      const dir = wheelAccumRef.current > 0 ? 1 : -1;
      wheelAccumRef.current = 0;
      stepBy(dir);
    }
  };

  return (
    <div
      id="runway"
      onWheel={handleWheel}
      className="relative min-h-[calc(100dvh-54px)] overflow-hidden bg-[radial-gradient(ellipse_at_52%_44%,#faf8f2,#f3efe5)] text-[#2b2a26] lg:h-[calc(100dvh-85px)]"
    >
      {/* Full-stage runway layer: explicit z-10 keeps its stacking context below left text & right panel (z-30) */}
      <section
        aria-label="Interactive runway lookbook. Drag, scroll, click a look, or use arrow buttons."
        tabIndex={0}
        onPointerDown={(event) => {
          didDragRef.current = false;
          pointerStartRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          if (!pointerStartRef.current) return;
          if (Math.abs(event.clientX - pointerStartRef.current.x) > 10) {
            didDragRef.current = true;
          }
        }}
        onPointerUp={(event) => {
          if (!pointerStartRef.current) return;
          const dx = event.clientX - pointerStartRef.current.x;
          pointerStartRef.current = null;
          if (Math.abs(dx) >= 32) {
            stepBy(dx < 0 ? 1 : -1);
          }
        }}
        className="relative z-10 h-[56vh] w-full cursor-grab select-none overflow-hidden outline-none active:cursor-grabbing lg:absolute lg:inset-0 lg:h-full"
      >
        <div className="pointer-events-none absolute bottom-[6%] left-[22%] right-[22%] h-14 rounded-[50%] bg-[#c8bfa9]/25 blur-3xl" />

        <div className="relative mx-auto h-full max-w-[1720px]">
          <AnimatePresence initial={false} custom={direction}>
            {VISIBLE_OFFSETS.map((offset) => {
              const step = virtualIndex + offset;
              const lookIdx = ((step % totalLooks) + totalLooks) % totalLooks;
              const runwayLook = looks[lookIdx];
              const pose = getPoseForOffset(offset);

              return (
                <motion.div
                  key={step}
                  custom={direction}
                  variants={runwayCardVariants}
                  initial="enter"
                  animate={runwayCardVariants.pose(pose)}
                  exit="exit"
                  onClick={() => {
                    if (didDragRef.current) return;
                    if (pose.interactive && offset !== 0) {
                      stepBy(offset);
                    }
                  }}
                  style={{
                    left: "50%",
                    marginLeft: "-230px",
                    zIndex: pose.zIndex,
                    pointerEvents: pose.interactive ? "auto" : "none",
                    transformOrigin: "50% 100%",
                    willChange: "transform, opacity, filter",
                  }}
                  className={`absolute bottom-[3%] flex h-[86%] w-[460px] items-end justify-center ${
                    offset === 0 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                  }`}
                >
                  <img
                    src={runwayLook.model}
                    alt={`${runwayLook.title} — ${runwayLook.subtitle}`}
                    draggable={false}
                    style={{
                      objectPosition: runwayLook.modelPosition,
                      transform: "scale(1.16)",
                      transformOrigin: "50% 62%",
                      WebkitMaskImage:
                        "radial-gradient(ellipse 68% 92% at 50% 52%, #000 68%, transparent 98%)",
                      maskImage:
                        "radial-gradient(ellipse 68% 92% at 50% 52%, #000 68%, transparent 98%)",
                    }}
                    className="h-full w-full object-contain mix-blend-multiply"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Left editorial title & odometer look counter (z-30) */}
      <div className="pointer-events-none relative z-30 mx-auto flex max-w-[1720px] flex-col justify-between px-5 pb-5 pt-3 sm:px-8 lg:h-full lg:px-10 lg:py-7">
        <div className="pointer-events-auto max-w-[270px]">
          <h1 className="font-display text-[13px] uppercase leading-6 tracking-[0.18em] text-[#2b2a26] sm:text-[15px]">
            THE TIBEB COLLECTION
          </h1>
          <p className="mt-2.5 text-[10.5px] font-light leading-relaxed tracking-[0.03em] text-[#8d887b]">
            A study in heritage and grace. Handwoven Ethiopian cotton and intricate tilet borders, crafted in Addis Ababa.
          </p>
        </div>

        <div className="pointer-events-auto mt-4 flex items-end justify-between lg:mt-0 lg:max-w-[260px] lg:block">
          <div>
            <div className="flex items-baseline gap-2.5 font-display text-[18px] tracking-[0.15em] text-[#2b2a26] sm:text-[21px]">
              <span>LOOK</span>
              <span
                aria-live="polite"
                className="relative inline-block h-[1.3em] w-[1.15em] overflow-hidden align-baseline"
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

            <div className="mt-2 flex items-center gap-3">
              <Link
                to="/shop"
                className="text-[8px] uppercase tracking-[0.22em] text-[#8d887b] transition-colors hover:text-[#2b2a26]"
              >
                SHOP THE LOOK
              </Link>
              <div className="flex items-center gap-1" aria-label="Select runway look">
                {looks.map((item, idx) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => jumpToLook(idx)}
                    aria-label={`Go to Look ${item.lookNumber}`}
                    aria-current={idx === activeLook ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeLook
                        ? "w-4 bg-[#2b2a26]"
                        : "w-1.5 bg-[#cbc4b5] hover:bg-[#8d887b]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => stepBy(-1)}
              aria-label="Previous look"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d6cebe] bg-[#faf8f2]/85 text-[#5b554c]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => stepBy(1)}
              aria-label="Next look"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#d6cebe] bg-[#faf8f2]/85 text-[#5b554c]"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop mouse controls for runway navigation (z-30, never overlapped by stage) */}
      <div className="pointer-events-none absolute bottom-6 right-[275px] z-30 hidden items-center gap-2 lg:flex">
        <button
          type="button"
          onClick={() => stepBy(-1)}
          aria-label="Previous look"
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-[#d6cebe] bg-[#faf8f2]/85 text-[#5b554c] shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:border-[#2b2a26] hover:text-[#2b2a26]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => stepBy(1)}
          aria-label="Next look"
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border border-[#d6cebe] bg-[#faf8f2]/85 text-[#5b554c] shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:border-[#2b2a26] hover:text-[#2b2a26]"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right synchronized "Shop the Look" panel: z-30, fits cleanly in viewport with native scroll fallback */}
      <aside
        aria-label="Pieces in this look"
        className="relative z-30 mx-5 mb-6 flex flex-col border-t border-[#e2dbd0]/80 pt-4 sm:mx-8 lg:absolute lg:bottom-3 lg:right-8 lg:top-3 lg:mx-0 lg:mb-0 lg:w-[232px] lg:overflow-y-auto lg:border-t-0 lg:pt-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3 lg:gap-1"
          >
            {active.pieces.map((piece, idx) => {
              const liked = isWishlisted(piece.id);
              const isSvg = piece.image.endsWith(".svg");
              return (
                <motion.div
                  key={piece.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{
                    duration: 0.55,
                    delay: idx * 0.07,
                    ease: RUNWAY_EASE,
                  }}
                  className="group relative flex min-h-0 flex-col items-center justify-center rounded-sm px-2 py-2 transition-colors hover:bg-[#ebe5d9]/45"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(piece);
                    }}
                    aria-label={liked ? `Remove ${piece.name} from wishlist` : `Save ${piece.name} to wishlist`}
                    aria-pressed={liked}
                    className="absolute left-1.5 top-1.5 z-10 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[#9c9689] transition-colors hover:bg-[#e4ddd1]/80 hover:text-[#8d4a39]"
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${liked ? "fill-[#8d4a39] text-[#8d4a39]" : ""}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(piece)}
                    aria-label={`Inspect ${piece.name}`}
                    className="flex h-[108px] w-full cursor-pointer items-center justify-center overflow-hidden px-4 xl:h-[132px]"
                  >
                    <img
                      src={piece.image}
                      alt={piece.name}
                      style={
                        isSvg
                          ? undefined
                          : {
                              WebkitMaskImage:
                                "radial-gradient(ellipse 76% 80% at 50% 50%, #000 56%, transparent 98%)",
                              maskImage:
                                "radial-gradient(ellipse 76% 80% at 50% 50%, #000 56%, transparent 98%)",
                            }
                      }
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(piece)}
                    className="mt-1 max-w-[180px] cursor-pointer text-center"
                  >
                    <p className="truncate text-[8px] font-medium uppercase tracking-[0.15em] text-[#2b2a26] transition-colors group-hover:text-[#8d4a39]">
                      {piece.name}
                    </p>
                    <p className="mt-0.5 text-[9px] text-[#8d887b]">
                      ${Number(piece.price).toFixed(0)}
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={piece.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(piece);
                    }}
                    aria-label={`Add ${piece.name} to bag`}
                    className="absolute bottom-1.5 right-1.5 z-10 grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[#7a7468] transition-colors hover:bg-[#e4ddd1]/80 hover:text-[#2b2a26] disabled:opacity-35"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </aside>

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
