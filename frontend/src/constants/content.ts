export interface HeroContent {
  videoUrl: string;
  fallbackImageUrl: string;
  tagline: string;
  titleTop: string;
  titleBottom: string;
  titleBottomBgUrl: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface ConsultingContent {
  title: string;
  description: string;
  imageUrl: string;
  primaryCta: string;
  secondaryCta: string;
}

export const HERO_CONTENT: HeroContent = {
  videoUrl: "https://player.vimeo.com/external/494252666.hd.mp4?s=2f8146747d79679199d7a2f5888d3e6913e618e4&profile_id=175",
  fallbackImageUrl: "/hero-fallback.svg",
  tagline: "The Art of Giving",
  titleTop: "ወንዳየሁ",
  titleBottom: "Gift Shop",
  titleBottomBgUrl: "/title-highlight.svg",
  description: "Curated elegance for life's most precious moments. Experience a new standard of luxury gifting with our premium selection of hand-picked treasures.",
  primaryCta: "Explore Collection",
  secondaryCta: "Our Services"
};

export const CONSULTING_CONTENT: ConsultingContent = {
  title: "Personalized Consulting",
  description: "Our expert gift consultants are dedicated to helping you find the perfect expression of your sentiment, from corporate gifting to intimate celebrations.",
  imageUrl: "/consulting.svg",
  primaryCta: "Book Now",
  secondaryCta: "Corporate"
};

