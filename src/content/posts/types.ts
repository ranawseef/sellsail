export type Post = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  category: string;
  date: string; // ISO date published
  readingMinutes: number;
  cover: { src: string; alt: string };
  Body: () => React.ReactNode;
};

// Unsplash CDN handles resizing, so we pass width and quality in the URL.
export function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}
