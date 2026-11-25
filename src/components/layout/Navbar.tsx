import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "../shop/CartDrawer";
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
import { Link } from "react-router-dom";

export function Navbar() {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { label: "Runway", href: "/#runway" },
    { label: "The collection", href: "/#collection" },
    { label: "Our story", href: "/#story" },
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b border-[#e6e1d8] bg-[#f7f5f0]/95 backdrop-blur-md transition-shadow ${
      isScrolled ? "shadow-[0_8px_24px_rgba(54,45,33,0.06)]" : ""
    }`}>
      <div className="mx-auto flex h-[72px] max-w-[1580px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link to="/" className="group flex min-w-[180px] flex-col leading-none">
          <span className="font-serif text-[19px] tracking-[0.17em] text-[#29251f] transition-colors group-hover:text-[#8d4a39]">
            TEBEB DESIGN
          </span>
          <span className="mt-1.5 text-[8px] uppercase tracking-[0.26em] text-[#8a8378]">
            Ethiopian couture
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[9px] uppercase tracking-[0.2em] text-[#5b554c] transition-colors hover:text-[#8d4a39]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Browse collection" className="h-10 w-10 rounded-full text-[#433e36] hover:bg-[#ece7de]">
            <Link to="/#collection"><Search className="h-[17px] w-[17px]" /></Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu" className="h-10 w-10 rounded-full text-[#433e36] hover:bg-[#ece7de]">
                  <User className="h-[17px] w-[17px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl border border-[#e6e1d8] bg-[#fbfaf7] p-3 shadow-xl">
                <DropdownMenuLabel className="font-normal pb-3">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold tracking-tight">{user?.name}</p>
                    <p className="inline-block w-fit rounded-md bg-[#eee9e0] px-2 py-1 text-xs font-medium text-[#716a60]">{user?.role}</p>
                    <p className="text-[10px] text-[#716a60]">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e6e1d8]" />
                <DropdownMenuItem asChild className="rounded-xl py-3 focus:bg-[#eee9e0]">
                  <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex w-full items-center text-[11px] font-semibold uppercase tracking-wider">
                    <LayoutDashboard className="mr-3 h-4 w-4 text-[#8d4a39]" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-3 focus:bg-[#eee9e0]">
                  <Settings className="mr-3 h-4 w-4 text-[#8d4a39]" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#e6e1d8]" />
                <DropdownMenuItem className="cursor-pointer rounded-xl py-3 text-destructive focus:bg-destructive/5 focus:text-destructive" onClick={logout}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthDialog>
              <Button variant="ghost" size="icon" aria-label="Sign in" className="h-10 w-10 rounded-full text-[#433e36] hover:bg-[#ece7de]">
                <User className="h-[17px] w-[17px]" />
              </Button>
            </AuthDialog>
          )}
          
          <CartDrawer>
            <Button variant="ghost" aria-label={`Open shopping bag${cartCount ? `, ${cartCount} items` : ""}`} className="group relative h-10 gap-2 rounded-full px-3 text-[#433e36] hover:bg-[#ece7de]">
              <ShoppingBag className="h-[17px] w-[17px] transition-transform group-hover:scale-105" />
              <span className="hidden text-[9px] uppercase tracking-[0.16em] sm:block">Bag</span>
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center border-2 border-[#f7f5f0] bg-[#8d4a39] px-1 text-[9px] font-semibold text-white">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </CartDrawer>

          <Button
            variant="ghost"
            size="icon"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="h-10 w-10 rounded-full text-[#433e36] hover:bg-[#ece7de] md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="border-t border-[#e6e1d8] bg-[#f7f5f0] px-5 py-4 md:hidden">
          <div className="mx-auto flex max-w-[1580px] flex-col gap-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3 text-[10px] uppercase tracking-[0.2em] text-[#5b554c]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}