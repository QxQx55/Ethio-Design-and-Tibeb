import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Heart, Plus } from "lucide-react";
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
    `${look.title} Tibeb blouse`,
    `${look.title} Handwoven skirt`,
    `${look.title} Cotton shawl`,
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

const runwaySlots = [
  { left: "-8%", width: "36%", height: "72%", scale: 0.32, opacity: 0.12, blur: 5 },
  { left: "13%", width: "34%", height: "76%", scale: 0.44, opacity: 0.3, blur: 3.8 },
  { left: "34%", width: "33%", height: "80%", scale: 0.6, opacity: 0.64, blur: 2 },
  { left: "57%", width: "34%", height: "82%", scale: 0.8, opacity: 1, blur: 0 },
  { left: "85%", width: "34%", height: "78%", scale: 0.48, opacity: 0.24, blur: 3.5 },
];

export function HomePage() {
  const [activeLook, setActiveLook] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedPiece, setSelectedPiece] = useState(collection[0].pieces[0].id);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const pointerStart = useRef<number | null>(null);
  const ignoreStageClick = useRef(false);
  const { addToCart } = useCart();
  const look = collection[activeLook];
  const visibleLooks = [-3, -2, -1, 0, 1].map((offset) => ({
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
    <div id="runway" className="relative min-h-[calc(100dvh-58px)] overflow-hidden bg-[#f7f5f0] text-[#29251f] md:min-h-[calc(100dvh-92px)] lg:h-[calc(100dvh-92px)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_48%,rgba(224,215,198,0.28),transparent_58%)]" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-58px)] max-w-[1700px] grid-cols-1 items-stretch px-5 pb-8 pt-5 sm:px-8 md:min-h-[calc(100dvh-92px)] lg:h-full lg:min-h-0 lg:grid-cols-[0.85fr_2.45fr_0.7fr] lg:gap-5 lg:px-10 lg:pb-6 lg:pt-3">
        <section className="flex flex-col justify-between pb-3 pt-2 lg:pb-12 lg:pt-10">
          <div>
            <h1 className="max-w-[310px] text-[16px] font-medium uppercase leading-6 tracking-[0.16em] sm:text-[18px]">
              The Tibeb Collection
            </h1>
            <p className="mt-5 max-w-[270px] text-[11px] leading-6 text-[#81796d]">
              A celebration of Ethiopian heritage, craftsmanship, and the art of dressing with intention.
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between lg:block">
            <div>
              <p className="font-serif text-2xl tracking-[0.08em] text-[#4c463d] lg:text-[27px]">
                LOOK <span className="text-[#a3947d]">{String(activeLook + 1).padStart(2, "0")}</span>
              </p>
              <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-[#9b9386]">The runway</p>
              <p className="mt-3 max-w-[220px] text-[7px] leading-3 text-[#81796d]">
                Photo:{" "}
                <a href={look.modelSource} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Ethiopian Fashion by eschipul
                </a>{" "}
                ·{" "}
                <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  CC BY-SA 2.0
                </a>
                {" "}· cropped
              </p>
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
          aria-label="Interactive runway. Click a runway position or use the arrow keys to browse looks."
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              changeLook(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              changeLook(1);
            }
          }}
          onClick={(event) => {
            if (ignoreStageClick.current) return;
            const position = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth;
            const offset = position < 0.2 ? -3 : position < 0.4 ? -2 : position < 0.59 ? -1 : position < 0.82 ? 0 : 1;
            selectLook(activeLook + offset);
          }}
          onPointerDown={(event) => { pointerStart.current = event.clientX; }}
          onPointerUp={(event) => {
            if (pointerStart.current === null) return;
            const distance = event.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(distance) > 70) {
              ignoreStageClick.current = true;
              changeLook(distance > 0 ? -1 : 1);
              window.setTimeout(() => { ignoreStageClick.current = false; }, 0);
            }
          }}
          className="relative min-h-[55vh] overflow-hidden outline-none focus-visible:ring-1 focus-visible:ring-[#b4a68f] lg:h-full lg:min-h-0"
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-[13%] h-20 rounded-[50%] bg-[#c4b8a6]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 bottom-[12%] h-px bg-gradient-to-r from-transparent via-[#c8beaf] to-transparent" />
          <div className="absolute inset-0 z-10">
            <AnimatePresence initial={false} custom={direction}>
              {visibleLooks.map(({ offset, index, look: runwayLook }, slotIndex) => {
                const slot = runwaySlots[slotIndex];
                const isActive = offset === 0;
                return (
                  <motion.div
                    key={index}
                    aria-hidden="true"
                    className="absolute bottom-[12%] flex items-end justify-center overflow-hidden"
                    style={{
                      left: slot.left,
                      width: slot.width,
                      height: slot.height,
                      zIndex: isActive ? 10 : 5 - Math.abs(offset),
                      pointerEvents: "none",
                      transformOrigin: "center bottom",
                    }}
                    initial={{
                      left: direction > 0 ? "110%" : "-15%",
                      opacity: 0,
                      scale: 0.42,
                      x: "-50%",
                    }}
                    animate={{
                      left: slot.left,
                      width: slot.width,
                      height: slot.height,
                      opacity: slot.opacity,
                      scale: slot.scale,
                      filter: `blur(${slot.blur}px)`,
                      x: "-50%",
                    }}
                    exit={{
                      left: direction > 0 ? "-15%" : "110%",
                      opacity: 0,
                      scale: 0.42,
                      transition: { duration: 0.82, ease: [0.22, 1, 0.36, 1] },
                    }}
                    transition={{ duration: 1.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <img
                      src={runwayLook.model}
                      alt=""
                      draggable={false}
                      style={{ objectPosition: runwayLook.modelPosition }}
                      className="h-full w-full select-none object-cover mix-blend-multiply"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </section>

        <aside id="collection" className="border-t border-[#e1dbd1] pt-5 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:border-l lg:border-t-0 lg:pl-4 lg:pt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#81796d]">Pieces in this look</p>
              <p className="mt-1 font-serif text-sm">{look.title}</p>
            </div>
            <span className="text-[9px] tracking-[0.16em] text-[#9b9386]">{String(activeLook + 1).padStart(2, "0")} / 08</span>
          </div>
          <div className="space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={look.title}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                {look.pieces.map((piece, pieceIndex) => {
                  const isFavorite = favorites.has(piece.id);
                  return (
                    <div
                      key={piece.id}
                      className="group relative border-b border-[#e5dfd5] pb-3"
                      onMouseEnter={() => setSelectedPiece(piece.id)}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedPiece(piece.id)}
                        aria-label={`View ${piece.name}`}
                        aria-pressed={selectedPiece === piece.id}
                        className={`relative block h-[140px] w-full overflow-hidden bg-[#f0ede6] sm:h-[170px] lg:h-[min(17vh,155px)] ${
                          selectedPiece === piece.id ? "ring-1 ring-inset ring-[#9b8a73]" : ""
                        }`}
                      >
                        <img
                          src={piece.image}
                          alt=""
                          style={{
                            transform: "scale(1.2)",
                            transformOrigin: ["center 18%", "center 55%", "center 82%"][pieceIndex],
                          }}
                          className="h-full w-full object-cover mix-blend-multiply"
                        />
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <button type="button" onClick={() => setSelectedPiece(piece.id)} className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-[8px] uppercase tracking-[0.12em] text-[#514a40]">{piece.name}</span>
                          <span className="mt-1 block text-[9px] text-[#8a8378]">${piece.price.toFixed(2)}</span>
                        </button>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(piece.id)}
                            aria-label={isFavorite ? `Remove ${piece.name} from favorites` : `Add ${piece.name} to favorites`}
                            aria-pressed={isFavorite}
                            className="grid h-8 w-7 place-items-center text-[#8e8579] hover:text-[#9b3e31]"
                          >
                            <Heart className={`h-3.5 w-3.5 ${isFavorite ? "fill-[#9b3e31] text-[#9b3e31]" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => addToCart(piece)}
                            disabled={piece.stock === 0}
                            aria-label={`Add ${piece.name} to bag`}
                            className="grid h-8 w-7 place-items-center text-[#514a40] transition-colors hover:text-[#9b3e31] disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
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
