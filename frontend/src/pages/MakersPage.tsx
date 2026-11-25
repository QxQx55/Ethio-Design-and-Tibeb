import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PILLARS = [
  {
    number: "01",
    title: "Hand-Spun Shemma Cotton",
    text: "Our breathable cotton fabrics are spun and loomed in family workshops across Ethiopia, yielding an airy drape suited for both sunlit afternoons and formal evenings.",
  },
  {
    number: "02",
    title: "The Art of Tilet & Tibeb",
    text: "Each geometric border—whether warm terracotta, deep indigo, or emerald and crimson—is woven directly into the cloth using centuries-old Ethiopian loom patterns.",
  },
  {
    number: "03",
    title: "Addis Ababa Tailoring",
    text: "Cut in small atelier runs to honor proportion and structure, pairing traditional Habesha Kemis heritage with modern jackets, trousers, and asymmetric silhouettes.",
  },
];

export function MakersPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] px-5 py-12 text-[#2b2a26] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#8d887b]">
              The Makers · Addis Ababa Atelier
            </p>
            <h1 className="mt-4 font-display text-2xl uppercase leading-relaxed tracking-[0.16em] sm:text-3xl">
              Woven by hand, tailored for today.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#6b655b]">
              Tebeb Design collaborates directly with master weavers and patternmakers in Addis Ababa. Every piece in The Tibeb Collection begins with raw Ethiopian cotton, hand-dyed threads, and intricate loom geometry passed down through generations.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#2b2a26] px-6 py-3 font-display text-[9px] uppercase tracking-[0.2em] text-[#f7f5f0] transition-colors hover:bg-[#8d4a39]"
              >
                Explore Runway <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center border border-[#d6cebe] px-6 py-3 font-display text-[9px] uppercase tracking-[0.2em] text-[#2b2a26] transition-colors hover:border-[#2b2a26]"
              >
                Browse Pieces
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden bg-[#efeae0]">
              <img
                src="/runway-models/ethiopian-look-01.png"
                alt="Handwoven Habesha Kemis craftsmanship"
                className="h-full w-full object-cover object-top mix-blend-multiply"
              />
            </div>
            <div className="mt-8 aspect-[3/4] overflow-hidden bg-[#efeae0]">
              <img
                src="/runway-models/ethiopian-look-08.png"
                alt="Ceremonial crimson and gold Tibeb embroidery"
                className="h-full w-full object-cover object-top mix-blend-multiply"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 border-t border-[#e1dbd1] pt-12 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.number} className="space-y-3">
              <span className="font-display text-[10px] tracking-[0.2em] text-[#8d4a39]">
                {pillar.number}
              </span>
              <h2 className="font-display text-xs uppercase tracking-[0.16em]">
                {pillar.title}
              </h2>
              <p className="text-xs leading-relaxed text-[#716a60]">
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
