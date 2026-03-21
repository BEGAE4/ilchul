export interface FeedPost {
  id: string;
  username: string;
  avatar?: string;
  images: string[];
  location: string;
  description: string;
  currentImageIndex?: number;
}

export interface FeedBannerProps {
  image: string;
  title: string;
  subtitle: string;
}

