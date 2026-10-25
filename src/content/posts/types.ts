export type Post = {
  slug: string;
  title: string;
  /** Meta description: 140-160 characters, with the keyword near the start. */
  description: string;
  /** The main search phrase this post targets. */
  keyword: string;
  /** Supporting phrases (variants, questions) used in headings and copy. */
  secondary?: string[];
  category: string;
  /** Publish date (ISO). Posts dated in the future stay hidden until that day. */
  date: string;
  /** Last meaningful update (ISO), if after the publish date. */
  updated?: string;
  readingMinutes: number;
  /** Unsplash photo; posts without one get a branded cover. */
  cover?: { src: string; alt: string };
  /** Three to five one-line answers shown at the top (and quoted by AI assistants). */
  takeaways?: string[];
  /** Questions answered at the end, also published as FAQPage structured data. */
  faq?: { q: string; a: string }[];
  /** Slugs of the posts to suggest after this one. */
  related?: string[];
  /** Either a React body (older posts) or Markdown. */
  Body?: () => React.ReactNode;
  md?: string;
};

// Unsplash CDN handles resizing, so we pass width and quality in the URL.
export function unsplash(id: string, w = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}
