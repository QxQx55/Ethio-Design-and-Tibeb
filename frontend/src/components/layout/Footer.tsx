import { Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer id="story" className="border-t border-[#e1dbd1] bg-[#f7f5f0] py-14 text-[#29251f] sm:py-18">
      <div className="mx-auto max-w-[1580px] px-5 sm:px-8 lg:px-12">
        <div className="mb-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr] lg:gap-14">
          <div className="space-y-5">
            <div className="font-display text-xs tracking-[0.2em]">TEBEB DESIGN</div>
            <p className="max-w-xs text-sm leading-6 text-[#716a60]">
              Ethiopian craftsmanship, reimagined for the modern wardrobe. Made with care in Addis Ababa.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Instagram" className="rounded-full text-[#655e54] hover:bg-[#ece7de] hover:text-[#8d4a39]">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter" className="rounded-full text-[#655e54] hover:bg-[#ece7de] hover:text-[#8d4a39]">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Facebook" className="rounded-full text-[#655e54] hover:bg-[#ece7de] hover:text-[#8d4a39]">
                <Facebook className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em]">Explore</h4>
            <ul className="space-y-3 text-sm text-[#716a60]">
              <li><Link to="/" className="transition-colors hover:text-[#8d4a39]">Runway</Link></li>
              <li><Link to="/lookbook" className="transition-colors hover:text-[#8d4a39]">Look Book</Link></li>
              <li><Link to="/makers" className="transition-colors hover:text-[#8d4a39]">The Makers</Link></li>
              <li><Link to="/shop" className="transition-colors hover:text-[#8d4a39]">Shop All</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em]">Information</h4>
            <ul className="space-y-3 text-sm text-[#716a60]">
              <li><Link to="/makers" className="transition-colors hover:text-[#8d4a39]">Craft & care</Link></li>
              <li><a href="mailto:hello@tebebdesign.com" className="transition-colors hover:text-[#8d4a39]">Contact the atelier</a></li>
              <li><Link to="/cart" className="transition-colors hover:text-[#8d4a39]">Your bag</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em]">Letters from the atelier</h4>
            <p className="mb-5 text-sm leading-6 text-[#716a60]">New collections, studio stories and notes on craft.</p>
            <div className="space-y-3">
              <Input placeholder="Your email address" className="h-11 rounded-none border-[#d9d2c7] bg-transparent text-sm focus-visible:ring-[#8d4a39]" />
              <Button className="h-11 w-full gap-2 rounded-none bg-[#29251f] text-[9px] uppercase tracking-[0.18em] text-white hover:bg-[#8d4a39]">
                <Mail className="w-4 h-4" /> Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#e1dbd1] pt-6 text-[10px] uppercase tracking-[0.14em] text-[#81796d] md:flex-row">
          <p>&copy; 2025 TEBEB DESIGN. Made in Ethiopia.</p>
          <div className="flex gap-6">
            <a href="#story" className="hover:text-[#8d4a39]">Privacy</a>
            <a href="#story" className="hover:text-[#8d4a39]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}