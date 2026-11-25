import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductQuickViewProps {
  product: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const SIZES = ["XS", "S", "M", "L", "Custom"];

export function ProductQuickView({ product, open, onOpenChange, children }: ProductQuickViewProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("M");
  const wishlisted = isWishlisted(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="gap-0 overflow-hidden rounded-none border border-[#dfd8cb] bg-[#f7f5f0] p-0 text-[#2b2a26] shadow-2xl sm:max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative flex aspect-[4/5] items-center justify-center bg-[#f1ede3] p-8">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply"
            />
            <span className="absolute left-5 top-5 border border-[#d9d1c2] bg-[#f7f5f0]/90 px-3 py-1 font-display text-[8px] uppercase tracking-[0.2em] text-[#5b554c]">
              {product.event || product.category}
            </span>
          </div>

          <div className="flex flex-col justify-between p-7 sm:p-9">
            <div>
              <DialogHeader className="text-left">
                <p className="text-[9px] uppercase tracking-[0.24em] text-[#8d887b]">
                  {product.category}
                </p>
                <DialogTitle className="mt-2 font-display text-base uppercase tracking-[0.14em] text-[#2b2a26]">
                  {product.name}
                </DialogTitle>
                <p className="mt-3 text-lg font-medium tracking-[0.06em] text-[#8d4a39]">
                  ${Number(product.price).toFixed(2)}
                </p>
              </DialogHeader>

              <p className="mt-5 text-xs leading-relaxed text-[#6b655b]">
                {product.description}
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.22em] text-[#8d887b]">
                    Select Size
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.16em] text-[#6b655b]">
                    {product.stock > 0 ? `${product.stock} in atelier` : "Sold out"}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
                        selectedSize === size
                          ? "border-[#2b2a26] bg-[#2b2a26] text-[#f7f5f0]"
                          : "border-[#d8d0c2] bg-transparent text-[#5b554c] hover:border-[#2b2a26]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  disabled={product.stock === 0}
                  onClick={() => {
                    addToCart(product);
                    onOpenChange?.(false);
                  }}
                  className="h-11 flex-1 gap-2 rounded-none bg-[#2b2a26] font-display text-[9px] uppercase tracking-[0.2em] text-[#f7f5f0] hover:bg-[#8d4a39]"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {product.stock === 0 ? "Out of Stock" : `Add to Bag · ${selectedSize}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  onClick={() => toggleWishlist(product)}
                  className="h-11 w-11 rounded-none border-[#d8d0c2] bg-transparent hover:bg-[#ebe5d9]"
                >
                  <Heart
                    className={`h-4 w-4 ${wishlisted ? "fill-[#8d4a39] text-[#8d4a39]" : "text-[#5b554c]"}`}
                  />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[#e4ddd1] pt-4 text-center text-[8px] uppercase tracking-[0.16em] text-[#7a7367]">
                <div className="flex flex-col items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#8d4a39]" />
                  <span>Global Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8d4a39]" />
                  <span>Handwoven</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-[#8d4a39]" />
                  <span>Custom Fit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
