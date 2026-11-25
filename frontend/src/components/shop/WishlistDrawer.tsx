import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export function WishlistDrawer({ children }: { children: React.ReactNode }) {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 border-l border-[#e4ddd1] bg-[#f7f5f0] p-0 text-[#2b2a26] sm:max-w-md">
        <SheetHeader className="border-b border-[#e4ddd1] px-6 py-5">
          <SheetTitle className="flex items-center gap-2.5 font-serif text-base uppercase tracking-[0.2em] text-[#2b2a26]">
            <Heart className="h-4 w-4 text-[#8d4a39]" />
            Saved Pieces ({wishlist.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          {wishlist.length === 0 ? (
            <div className="flex h-[55vh] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#dfd8cb] bg-[#f1ede3]">
                <Heart className="h-5 w-5 text-[#8d887b]" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#2b2a26]">
                No saved pieces yet
              </p>
              <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-[#8d887b]">
                Tap the heart on any garment or accessory from the runway to save it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#e4ddd1] py-2">
              {wishlist.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#efeae0]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain mix-blend-multiply p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium uppercase tracking-[0.14em] text-[#2b2a26]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8d887b]">
                      {item.event || item.category}
                    </p>
                    <p className="mt-1.5 text-xs text-[#5b554c]">
                      ${Number(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={item.stock === 0}
                      aria-label={`Add ${item.name} to bag`}
                      onClick={() => addToCart(item)}
                      className="h-8 w-8 rounded-full text-[#2b2a26] hover:bg-[#eae3d6] hover:text-[#8d4a39]"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromWishlist(item.id)}
                      className="h-8 w-8 rounded-full text-[#8d887b] hover:bg-[#eae3d6] hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
