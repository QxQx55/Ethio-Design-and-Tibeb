import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "../shop/CartDrawer";
import { WishlistDrawer } from "../shop/WishlistDrawer";
import { AuthDialog } from "../auth/AuthDialog";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router-dom";

const MAIN_LINKS = [
  { label: "Runway", to: "/" },
  { label: "The Makers", to: "/makers" },
  { label: "Look Book", to: "/lookbook" },
  { label: "Shop", to: "/shop" },
];

const SUB_LINKS = [
  { label: "Collections", to: "/shop" },
  { label: "Dresses", to: "/shop?category=Dresses" },
  { label: "Outerwear", to: "/shop?category=Outerwear" },
  { label: "Shawls", to: "/shop?category=Shawls" },
  { label: "Accessories", to: "/shop?category=Accessories" },
  { label: "Jewelry", to: "/shop?category=Jewelry" },
];

export function Navbar() {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[#e6e1d8]/80 bg-[#f7f5f0]/95 backdrop-blur-md transition-shadow ${
        isScrolled ? "shadow-[0_8px_24px_rgba(54,45,33,0.06)]" : ""
      }`}
    >
      <div className="mx-auto grid h-[54px] max-w-[1720px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 sm:px-8 lg:px-10">
        <Link to="/" className="group flex w-fit items-center gap-2.5 leading-none">
          <span className="font-display text-[10px] uppercase tracking-[0.24em] text-[#2b2a26] transition-colors group-hover:text-[#8d4a39] sm:text-[11px]">
            TEBEB DESIGN
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex lg:gap-8">
          {MAIN_LINKS.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`font-display text-[9px] uppercase tracking-[0.22em] transition-colors ${
                  isActive
                    ? "text-[#2b2a26]"
                    : "text-[#b6b0a3] hover:text-[#2b2a26]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Account menu"
                  className="h-9 gap-1.5 rounded-full px-2.5 font-display text-[8px] uppercase tracking-[0.18em] text-[#433e36] hover:bg-[#ece7de]"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{user?.name?.split(" ")[0] || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-none border border-[#e2dbd0] bg-[#fbfaf7] p-2.5 shadow-xl">
                <DropdownMenuLabel className="pb-2.5 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium tracking-tight text-[#2b2a26]">{user?.name}</p>
                    <p className="text-[10px] text-[#716a60]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e6e1d8]" />
                <DropdownMenuItem asChild className="rounded-none py-2.5 focus:bg-[#eee9e0]">
                  <Link
                    to={isAdmin ? "/admin" : "/dashboard"}
                    className="flex w-full items-center text-[10px] uppercase tracking-[0.18em]"
                  >
                    <LayoutDashboard className="mr-2.5 h-3.5 w-3.5 text-[#8d4a39]" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#e6e1d8]" />
                <DropdownMenuItem
                  className="cursor-pointer rounded-none py-2.5 text-destructive focus:bg-destructive/5 focus:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2.5 h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-[0.18em]">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Login"
                className="h-9 rounded-full px-2.5 font-display text-[8px] uppercase tracking-[0.18em] text-[#433e36] hover:bg-[#ece7de]"
              >
                <span className="hidden sm:inline">Login</span>
                <User className="h-4 w-4 sm:hidden" />
              </Button>
            </AuthDialog>
          )}

          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Search collection"
            className="h-9 w-9 rounded-full text-[#433e36] hover:bg-[#ece7de]"
          >
            <Link to="/shop">
              <Search className="h-[15px] w-[15px]" />
            </Link>
          </Button>

          <WishlistDrawer>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Saved pieces${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
              className="relative h-9 w-9 rounded-full text-[#433e36] hover:bg-[#ece7de]"
            >
              <Heart className="h-[15px] w-[15px]" />
              {wishlistCount > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#8d4a39] px-1 text-[8px] font-medium text-white">
                  {wishlistCount}
                </span>
              )}
            </Button>
          </WishlistDrawer>

          <CartDrawer>
            <Button
              variant="ghost"
              aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ""}`}
              className="h-9 gap-1.5 rounded-full px-2.5 font-display text-[8px] uppercase tracking-[0.18em] text-[#433e36] hover:bg-[#ece7de]"
            >
              <ShoppingBag className="h-[15px] w-[15px]" />
              <span className="hidden sm:inline">Cart ({cartCount})</span>
              {cartCount > 0 && (
                <span className="text-[9px] font-medium text-[#8d4a39] sm:hidden">
                  {cartCount}
                </span>
              )}
            </Button>
          </CartDrawer>

          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="h-9 w-9 rounded-full text-[#433e36] hover:bg-[#ece7de] md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav
        aria-label="Collection categories"
        className="hidden h-[30px] items-center justify-center gap-7 border-t border-[#e6e1d8]/60 md:flex"
      >
        {SUB_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.to}
            className="text-[8px] uppercase tracking-[0.22em] text-[#8d887b] transition-colors hover:text-[#2b2a26]"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-[#e6e1d8] bg-[#f7f5f0] px-5 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {MAIN_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2.5 font-display text-[10px] uppercase tracking-[0.2em] ${
                  pathname === link.to ? "text-[#2b2a26]" : "text-[#7c766b]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
