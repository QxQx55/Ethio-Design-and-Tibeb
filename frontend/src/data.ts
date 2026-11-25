import { Category, Product, Review } from "@/types";

export interface RunwayLookMeta {
  lookNumber: number;
  event: string;
  title: string;
  subtitle: string;
  description: string;
  model: string;
  modelPosition: string;
  silhouetteNote: string;
}

export const RUNWAY_LOOKS_META: RunwayLookMeta[] = [
  {
    lookNumber: 1,
    event: "Look 01",
    title: "Look 01",
    subtitle: "The Kemis Heirloom",
    description: "A modern heirloom in ivory handwoven cotton with warm terracotta-gold Tibeb.",
    model: "/runway-models/ethiopian-look-01.png",
    modelPosition: "center top",
    silhouetteNote: "Hand-loomed shemma cotton with draped Netela.",
  },
  {
    lookNumber: 2,
    event: "Look 02",
    title: "Look 02",
    subtitle: "Olive Tilet Study",
    description: "Crisp ivory cotton accented by olive-green and gold geometric Tibeb cuffs.",
    model: "/runway-models/ethiopian-look-02.png",
    modelPosition: "center top",
    silhouetteNote: "Tailored cuff sleeves and woven skirt hem.",
  },
  {
    lookNumber: 3,
    event: "Look 03",
    title: "Look 03",
    subtitle: "Addis Tailoring",
    description: "Tailored two-piece ivory suit finished with an olive-gold woven collar.",
    model: "/runway-models/ethiopian-look-03.png",
    modelPosition: "center top",
    silhouetteNote: "Cropped architectural jacket & wide-leg trousers.",
  },
  {
    lookNumber: 4,
    event: "Look 04",
    title: "Look 04",
    subtitle: "Indigo Structure",
    description: "Structured ivory tailoring layered over deep indigo and gold Tibeb trim.",
    model: "/runway-models/ethiopian-look-04.png",
    modelPosition: "center top",
    silhouetteNote: "Sharp lapel blazer paired with woven skirt.",
  },
  {
    lookNumber: 5,
    event: "Look 05",
    title: "Look 05",
    subtitle: "Asymmetric Shemma",
    description: "One-shoulder ivory cotton dress paired with a woven crimson Mesob tote.",
    model: "/runway-models/ethiopian-look-05.png",
    modelPosition: "center top",
    silhouetteNote: "Fluid asymmetric drape and basketry craft.",
  },
  {
    lookNumber: 6,
    event: "Look 06",
    title: "Look 06",
    subtitle: "Menen Diamond Weave",
    description: "Deep indigo pleated couture featuring intricate gold and ivory diamond Tibeb.",
    model: "/runway-models/ethiopian-look-06.png",
    modelPosition: "center top",
    silhouetteNote: "Full-skirted indigo jacquard weaving.",
  },
  {
    lookNumber: 7,
    event: "Look 07",
    title: "Look 07",
    subtitle: "Nocturne Pleats",
    description: "Sculptural charcoal evening gown cinched with a metallic woven belt.",
    model: "/runway-models/ethiopian-look-07.png",
    modelPosition: "center top",
    silhouetteNote: "Sheer black silk Netela and pleated drape.",
  },
  {
    lookNumber: 8,
    event: "Look 08",
    title: "Look 08",
    subtitle: "Ceremonial Crimson",
    description: "Regal ivory Habesha Kemis woven with crimson, emerald, and gold Tibeb.",
    model: "/runway-models/ethiopian-look-08.png",
    modelPosition: "center top",
    silhouetteNote: "Celebratory ceremonial border woven by hand.",
  },
];

const FALLBACK_PIECE_DEFINITIONS: Record<
  string,
  [name: string, price: number, category: string, image: string][]
> = {
  "Look 01": [
    ["Kemis Embroidered Jacket", 165, "Outerwear", "/pieces/piece-jacket-brown.png"],
    ["Netela Woven Shawl", 95, "Shawls", "/pieces/piece-shawl-ivory.png"],
    ["Terracotta Border Skirt", 185, "Skirts", "/pieces/piece-skirt-brown.png"],
  ],
  "Look 02": [
    ["Olive Cuff Cotton Blouse", 145, "Tops", "/pieces/piece-blouse-olive.png"],
    ["Olive Hem Midi Skirt", 175, "Skirts", "/pieces/piece-skirt-olive.png"],
    ["Tilet Border Gown", 240, "Dresses", "/pieces/piece-dress-olive.png"],
  ],
  "Look 03": [
    ["Tibeb Collar Tunic Jacket", 195, "Outerwear", "/pieces/piece-jacket-ivory.png"],
    ["Wide-Leg Cotton Trousers", 155, "Trousers", "/pieces/piece-trousers-ivory.png"],
    ["Woven Trim Clutch", 115, "Accessories", "/pieces/piece-bag-ivory.svg"],
  ],
  "Look 04": [
    ["Navy Trim Cropped Top", 125, "Tops", "/pieces/piece-top-navy-trim.png"],
    ["Tailored Tibeb Blazer", 220, "Outerwear", "/pieces/piece-blazer-ivory.png"],
    ["Indigo Border Mini Skirt", 160, "Skirts", "/pieces/piece-skirt-navy-trim.png"],
  ],
  "Look 05": [
    ["One-Shoulder Shemma Dress", 260, "Dresses", "/pieces/piece-dress-oneshoulder.png"],
    ["Mesob Crimson Basket Tote", 180, "Accessories", "/pieces/piece-bag-red.png"],
    ["Hand-Strung Beaded Necklace", 85, "Jewelry", "/pieces/piece-necklace-beaded.svg"],
  ],
  "Look 06": [
    ["Indigo Diamond Weave Shawl", 135, "Shawls", "/pieces/piece-shawl-indigo.png"],
    ["Navy & Gold Pleated Skirt", 195, "Skirts", "/pieces/piece-skirt-indigo.png"],
    ["Artisan Silver Pendant", 90, "Jewelry", "/pieces/piece-necklace-silver.svg"],
  ],
  "Look 07": [
    ["Charcoal Pleated Evening Gown", 310, "Dresses", "/pieces/piece-dress-black.png"],
    ["Braided Gold & Leather Belt", 95, "Accessories", "/pieces/piece-belt-gold.png"],
    ["Sheer Silk Evening Netela", 110, "Shawls", "/pieces/piece-shawl-black.png"],
  ],
  "Look 08": [
    ["Crimson Heritage Kemis Gown", 290, "Dresses", "/pieces/piece-dress-crimson.png"],
    ["Woven Crimson Crossbody Bag", 145, "Accessories", "/pieces/piece-bag-crimson.svg"],
    ["Gold Filigree Drop Earrings", 80, "Jewelry", "/pieces/piece-earrings-gold.svg"],
  ],
};

/**
 * Local showcase data used when the live API cannot be reached.
 */
export const FALLBACK_PRODUCTS: Product[] = RUNWAY_LOOKS_META.flatMap((look, lookIndex) => {
  const pieces = FALLBACK_PIECE_DEFINITIONS[look.event] || [];
  return pieces.map(([name, price, category, image], pieceIndex) => ({
    id: `runway-${lookIndex + 1}-${pieceIndex + 1}`,
    name,
    description: `${look.description} Handwoven in Addis Ababa.`,
    price,
    category,
    image,
    rating: 5,
    reviews: 8 + lookIndex,
    stock: 6,
    event: look.event,
    created_at: new Date(Date.UTC(2026, 3, 20 - lookIndex)).toISOString(),
  }));
});

export const FALLBACK_CATEGORIES: Category[] = [
  "Dresses",
  "Outerwear",
  "Tops",
  "Skirts",
  "Trousers",
  "Shawls",
  "Accessories",
  "Jewelry",
].map((name, index) => ({
  id: `cat-${index + 1}`,
  name,
  created_at: "2026-01-01T00:00:00.000Z",
}));

export const FALLBACK_REVIEWS: Review[] = [
  {
    id: "sample-r1",
    userName: "Selamawit Tadesse",
    userImage: "/avatar-1.svg",
    rating: 5,
    comment: "The Kemis Embroidered Jacket and Netela Shawl arrived beautifully packed. The handwoven Tibeb border is extraordinary.",
    date: "2 days ago",
    productName: "Kemis Embroidered Jacket",
    created_at: "2026-04-16T10:00:00.000Z",
  },
  {
    id: "sample-r2",
    userName: "Dawit Girma",
    userImage: "/avatar-2.svg",
    rating: 5,
    comment: "Ordered the Tailored Tibeb Blazer for a family celebration—impeccable cotton weight and tailoring.",
    date: "1 week ago",
    productName: "Tailored Tibeb Blazer",
    created_at: "2026-04-11T10:00:00.000Z",
  },
];
