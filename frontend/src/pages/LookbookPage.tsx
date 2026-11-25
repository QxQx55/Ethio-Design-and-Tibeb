import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { FALLBACK_PRODUCTS, RUNWAY_LOOKS_META } from "@/data";
import { getAllProducts } from "@/lib/supabase";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { ProductQuickView } from "@/components/shop/ProductQuickView";

export function LookbookPage() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    getAllProducts()
      .then((live) => {
        if (live.length > 0) setProducts(live);
      })
      .catch(() => {
        /* fallback already populated */
      });
  }, []);

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

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-5 py-12 text-[#2b2a26] sm:px-8 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1580px]">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-[#e1dbd1] pb-10 md:flex-row md:items-end">
          <div>
            <p className="text-[9px] uppercase tracking-[0.26em] text-[#8d887b]">
              Season Editorial · 08 Looks
            </p>
            <h1 className="mt-3 font-display text-xl uppercase tracking-[0.18em] sm:text-2xl">
              The Tibeb Lookbook
            </h1>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[#716a60]">
            Every silhouette in the collection pairs traditional hand-loomed Ethiopian cotton with contemporary tailoring. Select any look to step onto the interactive runway.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
          {looks.map((look) => (
            <article key={look.title} className="flex flex-col">
              <Link
                to={`/?look=${look.lookNumber}`}
                className="group relative aspect-[3/4] overflow-hidden bg-[#efeae0]"
              >
                <img
                  src={look.model}
                  alt={`${look.title} — ${look.subtitle}`}
                  className="h-full w-full object-cover object-top mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 border border-[#d8d0c2] bg-[#f7f5f0]/90 px-2.5 py-1 font-display text-[8px] uppercase tracking-[0.2em]">
                  Look 0{look.lookNumber}
                </span>
                <span className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#2b2a26] px-3 py-1.5 font-display text-[8px] uppercase tracking-[0.18em] text-[#f7f5f0] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Runway <ArrowUpRight className="h-3 w-3" />
                </span>
              </Link>

              <div className="mt-4 flex items-baseline justify-between gap-2">
                <h2 className="font-display text-[11px] uppercase tracking-[0.16em]">
                  {look.subtitle}
                </h2>
                <Link
                  to={`/?look=${look.lookNumber}`}
                  className="text-[8px] uppercase tracking-[0.2em] text-[#8d4a39] hover:underline"
                >
                  Open look
                </Link>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#7a7367]">
                {look.description}
              </p>

              <div className="mt-4 space-y-2 border-t border-[#e5dfd3] pt-3">
                {look.pieces.map((piece) => (
                  <div key={piece.id} className="flex items-center justify-between gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(piece)}
                      className="truncate text-left uppercase tracking-[0.12em] text-[#433e36] hover:text-[#8d4a39]"
                    >
                      {piece.name}
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[#8d887b]">${Number(piece.price).toFixed(0)}</span>
                      <button
                        type="button"
                        onClick={() => addToCart(piece)}
                        aria-label={`Add ${piece.name} to bag`}
                        className="text-[#433e36] hover:text-[#8d4a39]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
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
