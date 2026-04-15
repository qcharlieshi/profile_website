export interface MediumPost {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  categories: string[];
  thumbnail: string;
  content: string;
  link: string;
}

export interface PortfolioProject {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  image?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
}
