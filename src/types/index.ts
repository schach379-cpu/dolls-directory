export interface ListingWithImage {
  id: string;
  title: string;
  slug: string;
  city: string;
  priceFrom: number | null;
  priceTo?: number | null;
  viewCount: number;
  isPremium: boolean;
  isFeatured?: boolean;
  isVerified: boolean;
  status?: string;
  createdAt?: Date;
  images: { url: string; isPrimary?: boolean }[];
}
