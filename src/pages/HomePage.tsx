import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowLeft, ArrowRight, Heart, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

interface RunwayLook {
  title: string;
  description: string;
  model: string;
  modelPosition: string;
  modelSource: string;
  pieces: Product[];
}

const lookDetails = [
  { title: "Look 01", description: "A modern heirloom in ivory and woven gold.", model: "/runway-models/ethiopian-look-01.jpg", modelPosition: "47% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2459478591" },
  { title: "Look 02", description: "Soft cotton and intricate hand-finished Tibeb.", model: "/runway-models/ethiopian-look-02.jpg", modelPosition: "40% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2460315030" },
  { title: "Look 03", description: "A fluid silhouette with a deep indigo border.", model: "/runway-models/ethiopian-look-03.jpg", modelPosition: "38% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2459478117" },
  { title: "Look 04", description: "A statement of red, white and woven pattern.", model: "/runway-models/ethiopian-look-04.jpg", modelPosition: "50% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2460315710" },
  { title: "Look 05", description: "A contemporary take on the traditional shemma.", model: "/runway-models/ethiopian-look-05.jpg", modelPosition: "49% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2459479547" },
  { title: "Look 06", description: "Warm earth tones, finished by hand in Addis.", model: "/runway-models/ethiopian-look-06.jpg", modelPosition: "50% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2459478351" },
  { title: "Look 07", description: "Lightweight layers with a signature woven edge.", model: "/runway-models/ethiopian-look-07.jpg", modelPosition: "52% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2460315524" },
  { title: "Look 08", description: "A sculptural occasion look made for the runway.", model: "/runway-models/ethiopian-look-08.jpg", modelPosition: "51% center", modelSource: "https://www.flickr.com/photos/16638697@N00/2460315232" },
];

const collection: RunwayLook[] = lookDetails.map((look, index) => {
  const names = [
    `${look.title} Embroidered Top`,
    `${look.title} Woven Skirt`,
    `${look.title} Handcrafted Bag`,
  ];
  const prices = [145 + index * 7, 185 + index * 9, 95 + index * 5];

  return {
    title: look.title,
    description: look.description,
    model: look.model,
    modelPosition: look.modelPosition,
    modelSource: look.modelSource,
    pieces: names.map((name, pieceIndex) => ({
      id: `runway-${index + 1}-${pieceIndex + 1}`,
      name,
      description: `${look.description} Made in Ethiopia.`,
      price: prices[pieceIndex],
      category: "Tibeb Collection",
      image: look.model,
      rating: 5,
      reviews: 8 + index,
      stock: 6,
      event: look.title,
    })),
  };
});

export function HomePage() {
  const [activeLook, setActiveLook] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedPiece, setSelectedPiece] = useState(collection[0].pieces[0].id);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const pointerStart = useRef<number | null>(null);
  const { addToCart } = useCart();
  const look = collection[activeLook];
  const visibleLooks = [-2, -1, 0, 1, 2].map((offset) => ({
    offset,
    index: (activeLook + offset + collection.length) % collection.length,
    look: collection[(activeLook + offset + collection.length) % collection.length],
  }));

  const selectLook = (index: number) => {
    const nextIndex = (index + collection.length) % collection.length;
    const forwardDistance = (nextIndex - activeLook + collection.length) % collection.length;
    if (forwardDistance !== 0) setDirection(forwardDistance <= collection.length / 2 ? 1 : -1);
    setActiveLook(nextIndex);
    setSelectedPiece(collection[nextIndex].pieces[0].id);
  };
  const changeLook = (delta: number) => selectLook(activeLook + delta);
  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div id="runway" className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-[#f7f5f0] text-[#29251f]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_48%,rgba(224,215,198,0.28),transparent_58%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1700px] grid-cols-1 items-stretch px-5 pb-8 pt-5 sm:px-8 lg:grid-cols-[0.86fr_1.8fr_0.78fr] lg:gap-5 lg:px-10 lg:pb-7 lg:pt-3">
        <section className="flex flex-col justify-between pb-3 pt-2 lg:pb-12 lg:pt-10">
          <div>
            <h1 className="max-w-[310px] text-[16px] font-medium uppercase leading-6 tracking-[0.16em] sm:text-[18px]">
              The Tibeb Collection
            </h1>
            <p className="mt-5 max-w-[270px] text-[11px] leading-6 text-[#81796d]">
              {look.description} Select a model to explore the look.
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between lg:block">
            <div>
              <p className="font-serif text-2xl tracking-[0.08em] text-[#4c463d] lg:text-[27px]">
                LOOK <span className="text-[#a3947d]">{String(activeLook + 1).padStart(2, "0")}</span>
              </p>
              <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-[#9b9386]">The runway</p>
            </div>
            <button
              type="button"
              onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}
              className="hidden items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#81796d] transition-colors hover:text-[#8d4a39] lg:flex"
            >
              Explore pieces <ArrowDown className="h-3 w-3" />
            </button>
          </div>
        </section>

        <section
          aria-label="Interactive runway"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") changeLook(-1);
            if (event.key === "ArrowRight") changeLook(1);
          }}
          onPointerDown={(event) => { pointerStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            if (Math.abs(distance) > 70) changeLook(distance > 0 ? -1 : 1);
            pointerStart.current = null;
          }}
          className="relative min-h-[55vh] overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-[#b4a68f] lg:min-h-0"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-[13%] h-20 rounded-[50%] bg-[#c4b8a6]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-[12%] h-px bg-gradient-to-r from-transparent via-[#c8beaf] to-transparent" />
          <div className="absolute inset-0">
            <AnimatePresence initial={false} custom={direction}>
              {visibleLooks.map(({ offset, index, look: runwayLook }) => {
                const isActive = offset === 0;
                const left = 55 + offset * 18;
                const width = isActive ? "50%" : Math.abs(offset) === 1 ? "36%" : "28%";
                return (
                  <motion.button
                    type="button"
                    key={index}
                    onClick={() => selectLook(index)}
                    aria-label={`Select ${runwayLook.title}`}
                    aria-pressed={isActive}
                    className="absolute bottom-[11%] flex h-[82%] items-end justify-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8d4a39]"
                    style={{
                      left: `${left}%`,
                      width,
                      zIndex: isActive ? 10 : 5 - Math.abs(offset),
                      pointerEvents: isActive ? "none" : "auto",
                    }}
                    initial={{
                      left: direction > 0 ? "110%" : "-15%",
                      opacity: 0,
                      scale: 0.72,
                      x: "-50%",
                    }}
                    animate={{
                      left: `${left}%`,
                      width,
                      opacity: isActive ? 1 : Math.abs(offset) === 1 ? 0.62 : 0.28,
                      scale: isActive ? 1 : Math.abs(offset) === 1 ? 0.77 : 0.58,
                      filter: isActive ? "blur(0px)" : `blur(${Math.abs(offset) * 1.15}px)`,
                      x: "-50%",
                    }}
                    exit={{
                      left: direction > 0 ? "-15%" : "110%",
                      opacity: 0,
                      scale: 0.72,
                      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                    }}
                    transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <img
                      src={runwayLook.model}
                      alt=""
                      draggable={false}
                      style={{ objectPosition: runwayLook.modelPosition }}
                      className="h-full w-full select-none object-cover"
                    />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          <p className="absolute bottom-[4.25rem] left-3 z-20 rounded-sm bg-[#f7f5f0]/80 px-2 py-1 text-[8px] leading-4 text-[#514a40] sm:left-5">
            Photo:{" "}
            <a href={look.modelSource} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Ethiopian Fashion by eschipul
            </a>{" "}
            ·{" "}
            <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
              CC BY-SA 2.0
            </a>
            {" "}· cropped to fit
          </p>

          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:bottom-7">
            {collection.map((item, index) => (
              <button
                type="button"
                key={item.title}
                onClick={() => selectLook(index)}
                aria-label={`Go to ${item.title}`}
                aria-current={index === activeLook ? "step" : undefined}
                className={`h-1 rounded-full transition-all ${index === activeLook ? "w-7 bg-[#786b58]" : "w-1.5 bg-[#c8beaf] hover:bg-[#8d4a39]"}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 right-0 z-20 flex gap-2 lg:bottom-5">
            <button type="button" onClick={() => changeLook(-1)} aria-label="Previous look" className="grid h-9 w-9 place-items-center rounded-full border border-[#d6cfc3] bg-[#f7f5f0]/80 transition-colors hover:bg-[#29251f] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => changeLook(1)} aria-label="Next look" className="grid h-9 w-9 place-items-center rounded-full border border-[#d6cfc3] bg-[#f7f5f0]/80 transition-colors hover:bg-[#29251f] hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside id="collection" className="border-t border-[#e1dbd1] pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#81796d]">Pieces in this look</p>
              <p className="mt-1 font-serif text-sm">{look.title}</p>
            </div>
            <span className="text-[9px] tracking-[0.16em] text-[#9b9386]">{String(activeLook + 1).padStart(2, "0")} / 08</span>
          </div>
          <div className="space-y-2 lg:max-h-[68vh] lg:overflow-y-auto lg:pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={look.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {look.pieces.map((piece, pieceIndex) => {
                  const isFavorite = favorites.has(piece.id);
                  return (
                    <div
                      key={piece.id}
                      className={`group flex items-center gap-2 border-b border-[#e5dfd5] pb-2 ${
                        selectedPiece === piece.id ? "bg-[#eee9e0]/65" : ""
                      }`}
                      onMouseEnter={() => setSelectedPiece(piece.id)}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPiece(piece.id)}
                        aria-label={`View ${piece.name}`}
                        className="h-[66px] w-[56px] shrink-0 overflow-hidden bg-[#eeeae2]"
                      >
                        <img
                          src={piece.image}
                          alt=""
                          style={{
                            transform: "scale(1.45)",
                            transformOrigin: ["center 30%", "center 58%", "center 82%"][pieceIndex],
                          }}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <button type="button" onClick={() => setSelectedPiece(piece.id)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[9px] uppercase tracking-[0.08em] text-[#514a40]">{piece.name}</span>
                        <span className="mt-1 block text-[9px] text-[#8a8378]">${piece.price.toFixed(2)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(piece.id)}
                        aria-label={isFavorite ? `Remove ${piece.name} from favorites` : `Add ${piece.name} to favorites`}
                        aria-pressed={isFavorite}
                        className="grid h-8 w-7 shrink-0 place-items-center text-[#8e8579] hover:text-[#9b3e31]"
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-[#9b3e31] text-[#9b3e31]" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(piece)}
                        disabled={piece.stock === 0}
                        aria-label={`Add ${piece.name} to bag`}
                        className="grid h-8 w-7 shrink-0 place-items-center text-[#514a40] transition-colors hover:text-[#9b3e31] disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}
