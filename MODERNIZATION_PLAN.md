# Portfolio Website Modernization Plan (Next.js + TypeScript)

## Current State Analysis

- React 15.3.2 (2016) with class components
- Webpack 1.x with Babel
- Full Express/Sequelize/PostgreSQL backend (unnecessary for portfolio)
- Auth system (passport, OAuth) - overkill for portfolio site
- Redux with redux-thunk for state management
- HashRouter for client-side routing
- Bootstrap 4 alpha / Reactstrap for UI

## Modernization Goals

1. Migrate to Next.js 14+ for SSR, SSG, and modern React patterns
2. Full TypeScript for type safety and better DX
3. Remove backend entirely - use Next.js API routes if needed
4. Modern state management with Zustand (lighter than Redux)
5. Tailwind CSS for utility-first styling
6. Deploy to Vercel with zero-config (Next.js native platform)
7. **MDX-based blog system** - Git-based content management with version control

---

## Phase 1: Next.js + TypeScript Setup

### 1.1 Install Next.js with TypeScript

```bash
# Create new Next.js app with TypeScript in a separate directory
npx create-next-app@latest portfolio-next --typescript --tailwind --app --src-dir --import-alias "@/*"

# Or install dependencies directly:
npm install next@latest react@latest react-dom@latest
npm install -D typescript @types/react @types/node @types/react-dom
npm install zustand reselect
npm install -D tailwindcss postcss autoprefixer

# MDX blog dependencies:
npm install next-mdx-remote gray-matter reading-time date-fns
npm install -D @types/mdx rehype-highlight rehype-slug rehype-autolink-headings remark-gfm
```

**Options selected:**

- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router (not Pages Router)
- ✅ `src/` directory
- ✅ Import alias `@/*`
- ✅ ESLint

### 1.2 Configure Next.js

**Update `package.json` scripts:**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Create/Update `next.config.js`:**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add any external image domains
  },
};

module.exports = nextConfig;
```

**Create `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.3 Setup Tailwind CSS

Tailwind is auto-configured by create-next-app, but verify:

**`tailwind.config.ts`:**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
```

**`src/app/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Phase 2: Migrate Components to Next.js + TypeScript

### 2.1 Project Structure

```
portfolio-next/
├── public/                    # Static assets (images, favicon, etc.)
│   ├── images/
│   └── portfolio/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout (replaces _app, _document)
│   │   ├── page.tsx           # Home page (/)
│   │   ├── globals.css        # Global styles with Tailwind
│   │   ├── about/
│   │   │   └── page.tsx       # About page (/about)
│   │   ├── portfolio/
│   │   │   ├── page.tsx       # Portfolio listing (/portfolio)
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Portfolio item detail
│   │   └── blog/              # 📝 Blog section
│   │       ├── page.tsx       # Blog listing page
│   │       ├── [slug]/
│   │       │   └── page.tsx   # Individual blog post
│   │       ├── category/
│   │       │   └── [category]/
│   │       │       └── page.tsx   # Category pages
│   │       └── tag/
│   │           └── [tag]/
│   │               └── page.tsx   # Tag pages
│   ├── components/            # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Infobox.tsx
│   │   ├── Parallax.tsx
│   │   ├── PortfolioCard.tsx
│   │   ├── YellowHeader.tsx
│   │   └── blog/              # 📝 Blog components
│   │       ├── BlogCard.tsx
│   │       ├── BlogContent.tsx
│   │       ├── TableOfContents.tsx
│   │       └── ReadingProgress.tsx
│   ├── content/               # 📝 MDX blog posts
│   │   └── blog/
│   │       ├── 2024-01-15-first-post.mdx
│   │       ├── 2024-02-20-second-post.mdx
│   │       └── ...
│   ├── lib/                   # Utilities and helpers
│   │   ├── store.ts           # Zustand store
│   │   ├── selectors.ts       # Reselect selectors
│   │   ├── utils.ts           # Helper functions
│   │   ├── blog.ts            # 📝 Blog MDX utilities
│   │   └── mdx.ts             # 📝 MDX configuration
│   ├── data/                  # Static data (JSON, constants)
│   │   ├── portfolio.ts
│   │   └── about.ts
│   └── types/                 # TypeScript type definitions
│       ├── portfolio.ts
│       ├── blog.ts            # 📝 Blog post types
│       └── index.ts
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 Convert Components to TypeScript

**Example: Navbar Component**

```tsx
// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  scroll?: number;
}

export default function Navbar({ scroll = 0 }: NavbarProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Handle scroll-based visibility
    if (scroll > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [scroll]);

  return (
    <nav
      className={`fixed w-full transition-all ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Home
      </Link>
      <Link
        href="/portfolio"
        className={pathname.startsWith("/portfolio") ? "active" : ""}
      >
        Portfolio
      </Link>
      <Link href="/about" className={pathname === "/about" ? "active" : ""}>
        About
      </Link>
    </nav>
  );
}
```

**Example: Root Layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Charlie Shi - Portfolio",
  description: "Personal portfolio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Example: Home Page**

```tsx
// src/app/page.tsx
import Parallax from "@/components/Parallax";
import Infobox from "@/components/Infobox";

export default function HomePage() {
  return (
    <div className="container mx-auto">
      <Parallax>
        <h1 className="text-6xl font-bold">Charlie Shi</h1>
        <p className="text-xl">Full Stack Engineer</p>
      </Parallax>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
        <Infobox title="Design" icon="🎨" />
        <Infobox title="Development" icon="💻" />
        <Infobox title="Deployment" icon="🚀" />
      </section>
    </div>
  );
}
```

### 2.3 State Management with Zustand

**Create Zustand store:**

```tsx
// src/lib/store.ts
import { create } from "zustand";

interface AppState {
  scroll: number;
  setScroll: (scroll: number) => void;
  // Add other global state as needed
}

export const useStore = create<AppState>((set) => ({
  scroll: 0,
  setScroll: (scroll) => set({ scroll }),
}));
```

**Use Reselect for complex selectors:**

```tsx
// src/lib/selectors.ts
import { createSelector } from "reselect";
import type { PortfolioItem } from "@/types/portfolio";

const selectPortfolioItems = (state: { items: PortfolioItem[] }) => state.items;
const selectFilter = (state: { filter: string }) => state.filter;

export const selectFilteredPortfolio = createSelector(
  [selectPortfolioItems, selectFilter],
  (items, filter) =>
    items.filter((item) =>
      item.title.toLowerCase().includes(filter.toLowerCase()),
    ),
);
```

### 2.4 TypeScript Type Definitions

```tsx
// src/types/portfolio.ts
export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

// src/types/blog.ts
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  readingTime: string;
  content: string;
  featured?: boolean;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

// src/types/index.ts
export * from "./portfolio";
export * from "./blog";
```

---

## Phase 3: Handle Scroll State in Next.js

Since Next.js uses SSR, we need client-side scroll tracking:

```tsx
// src/components/ScrollProvider.tsx
"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { throttle } from "@/lib/utils";

export default function ScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setScroll = useStore((state) => state.setScroll);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScroll(window.scrollY);
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScroll]);

  return <>{children}</>;
}
```

Update layout:

```tsx
// src/app/layout.tsx
import ScrollProvider from "@/components/ScrollProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ScrollProvider>
          <Navbar />
          <main>{children}</main>
        </ScrollProvider>
      </body>
    </html>
  );
}
```

---

## Phase 4: Static Data Migration

### 4.1 Convert Backend Data to TypeScript Modules

```tsx
// src/data/portfolio.ts
import type { PortfolioItem } from "@/tpes/portfolio";

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    slug: "project-one",
    title: "Project One",
    description: "An amazing project",
    image: "/images/portfolio/project-one.jpg",
    technologies: ["React", "Node.js", "PostgreSQL"],
    githubUrl: "https://github.com/...",
    liveUrl: "https://...",
    featured: true,
  },
  // ... more items
];
```

### 4.2 Use Static Data in Pages

```tsx
// src/app/portfolio/page.tsx
import { portfolioItems } from "@/data/portfolio";
import PortfolioCard from "@/components/PortfolioCard";

export default function PortfolioPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map((item) => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 4.3 Dynamic Routes for Portfolio Items

```tsx
// src/app/portfolio/[slug]/page.tsx
import { notFound } from "next/navigation";
import { portfolioItems } from "@/data/portfolio";
import Image from "next/image";

interface PageProps {
  params: { slug: string };
}

// Generate static paths at build time
export async function generateStaticParams() {
  return portfolioItems.map((item) => ({
    slug: item.slug,
  }));
}

export default function PortfolioItemPage({ params }: PageProps) {
  const item = portfolioItems.find((i) => i.slug === params.slug);

  if (!item) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12">
      <h1 className="text-5xl font-bold mb-4">{item.title}</h1>
      <Image
        src={item.image}
        alt={item.title}
        width={1200}
        height={630}
        className="rounded-lg"
      />
      <p className="text-lg mt-6">{item.description}</p>
      <div className="flex gap-2 mt-4">
        {item.technologies.map((tech) => (
          <span key={tech} className="px-3 py-1 bg-blue-100 rounded">
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}
```

---

## Phase 5: MDX Blog Implementation

### 5.1 Install Blog Dependencies

- `next-mdx-remote` - MDX rendering with RSC support
- `gray-matter` - Parse frontmatter from MDX files
- `reading-time` - Calculate reading time
- `date-fns` - Date formatting
- `rehype-highlight` - Code syntax highlighting
- `remark-gfm` - GitHub Flavored Markdown support
- `@tailwindcss/typography` - Prose styling for blog content

### 5.2 Content Structure

Create `src/content/blog/` directory for MDX files:

- Filename format: `YYYY-MM-DD-slug.mdx`
- Frontmatter fields: title, description, date, author, category, tags, image, featured
- MDX allows embedding React components directly in markdown

### 5.3 Blog Utilities (`src/lib/blog.ts`)

Create utility functions:

- `getAllPosts()` - Get all blog posts sorted by date
- `getPostBySlug(slug)` - Get single post with metadata and content
- `getPostsByCategory(category)` - Filter by category
- `getPostsByTag(tag)` - Filter by tag
- `getAllCategories()` / `getAllTags()` - Get unique categories/tags
- `getFeaturedPosts()` - Get featured posts only

### 5.4 MDX Configuration (`src/lib/mdx.ts`)

Configure MDX compiler with:

- Remark plugins: GitHub Flavored Markdown
- Rehype plugins: syntax highlighting, auto-generate heading IDs, autolink headings
- Type-safe frontmatter parsing

### 5.5 Blog Routes

Create App Router pages:

- `/blog` - Blog listing with all posts
- `/blog/[slug]` - Individual post with full content
- `/blog/category/[category]` - Posts filtered by category
- `/blog/tag/[tag]` - Posts filtered by tag (optional)
- Use `generateStaticParams()` for SSG at build time

### 5.6 Blog Components

- `BlogCard` - Post preview card for listings
- `BlogContent` - Styled MDX content wrapper with prose classes
- `BlogSearch` - Client-side search/filter (optional)
- `TableOfContents` - Auto-generated from headings (optional)
- `ReadingProgress` - Scroll progress indicator (optional)

### 5.7 SEO & Metadata

- Generate metadata per post using `generateMetadata()`
- Include OpenGraph tags for social sharing
- Add structured data for articles
- Optional: RSS feed via API route at `/blog/rss.xml`

### 5.8 Styling

- Use `@tailwindcss/typography` for prose styling
- Import syntax highlighting CSS (e.g., `highlight.js/styles/github-dark.css`)
- Customize prose styles in Tailwind config if needed

---

## Phase 6: Remove Old Backend & Dependencies

### 6.1 Delete Backend Code

- Remove entire `/server` directory
- Remove entire `/db` directory
- Remove `/bin` directory
- Remove `webpack.config.js`
- Remove old `app/` directory after migration

### 6.2 Clean package.json

**Remove ALL old dependencies:**

- express, body-parser, passport\*, cookie-session
- sequelize, pg, bcryptjs
- nodemon, volleyball
- All babel packages
- webpack, webpack-related
- react-router (Next.js handles routing)
- redux, redux-thunk, redux-logger (replaced by Zustand)
- enzyme, chai, mocha, sinon (update testing later)
- reactstrap, bootstrap

**Final minimal dependencies:**

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "reselect": "^5.0.0",
    "next-mdx-remote": "^4.4.1",
    "gray-matter": "^4.0.3",
    "reading-time": "^1.5.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/mdx": "^2.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0",
    "@tailwindcss/typography": "^0.5.0",
    "typescript": "^5.0.0",
    "rehype-highlight": "^6.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-autolink-headings": "^7.0.0",
    "remark-gfm": "^3.0.1"
  }
}
```

---

## Phase 7: Vercel Deployment

### 7.1 Deploy to Vercel

Next.js is built by Vercel, so deployment is seamless:

```bash
npm install -g vercel
vercel login
vercel --prod
```

Or connect GitHub repo to Vercel dashboard for automatic deployments.

**No configuration needed** - Vercel auto-detects Next.js and configures:

- Build command: `next build`
- Output directory: `.next`
- Development command: `next dev`

### 7.2 Environment Variables (if needed)

Create `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://yoursite.com
```

Add to Vercel dashboard under Settings → Environment Variables

### 7.3 Custom Domain

Add custom domain in Vercel dashboard → Settings → Domains

---

## Phase 8: Modern Optimizations

### 8.1 Image Optimization

Use Next.js `<Image>` component:

```tsx
import Image from "next/image";

<Image
  src="/images/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // for above-fold images
/>;
```

### 8.2 Font Optimization

Use `next/font`:

```tsx
// src/app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### 8.3 Metadata & SEO

```tsx
// src/app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charlie Shi - Full Stack Engineer",
  description: "Portfolio showcasing web development projects",
  openGraph: {
    title: "Charlie Shi - Portfolio",
    description:
      "Full Stack Engineer specializing in React, Node.js, and TypeScript",
    images: ["/og-image.jpg"],
  },
};
```

### 8.4 Loading States

```tsx
// src/app/portfolio/loading.tsx
export default function Loading() {
  return <div>Loading portfolio...</div>;
}
```

### 8.5 Error Handling

```tsx
// src/app/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

---

## Migration Checklist

### Setup

- [ ] Create new Next.js app with TypeScript and Tailwind
- [ ] Configure `next.config.js`
- [ ] Setup `tsconfig.json`
- [ ] Verify Tailwind configuration

### Code Migration

- [ ] Create TypeScript type definitions
- [ ] Migrate components to TypeScript functional components
- [ ] Create Next.js App Router pages (home, portfolio, about)
- [ ] Setup Zustand store with TypeScript
- [ ] Create Reselect selectors if needed
- [ ] Implement scroll tracking with client component
- [ ] Convert static data to TypeScript modules
- [ ] Setup dynamic routes for portfolio items

### Components

- [ ] Navbar → TypeScript + Next.js Link
- [ ] InfoboxComponent → TypeScript + Tailwind
- [ ] ParallaxComponent → TypeScript + Tailwind
- [ ] PortfolioCard → TypeScript + Tailwind + Next Image
- [ ] YellowHeaderComponent → TypeScript + Tailwind

### Cleanup

- [ ] Remove `/server` directory
- [ ] Remove `/db` directory
- [ ] Remove `/bin` directory
- [ ] Remove old `/app` directory
- [ ] Clean up `package.json` dependencies
- [ ] Remove `webpack.config.js`
- [ ] Remove babel configs
- [ ] Remove old auth files

### Deployment

- [ ] Test local build: `npm run build && npm start`
- [ ] Deploy to Vercel
- [ ] Verify all routes work in production
- [ ] Setup custom domain (optional)
- [ ] Configure environment variables if needed

### Blog Implementation

- [ ] Install MDX dependencies
- [ ] Create content structure (`src/content/blog/`)
- [ ] Implement blog utility functions
- [ ] Configure MDX compiler with plugins
- [ ] Create blog routes (listing, post, category, tag)
- [ ] Build blog components (BlogCard, etc.)
- [ ] Add blog types to TypeScript definitions
- [ ] Style blog content with typography plugin
- [ ] Add RSS feed (optional)

### Enhancements

- [ ] Add metadata/SEO to all pages
- [ ] Optimize images with Next/Image
- [ ] Add loading and error states
- [ ] Setup Google Fonts with next/font
- [ ] Add analytics (Vercel Analytics)
- [ ] Add blog search functionality (optional)

---

## Expected Benefits

1. **SSR/SSG**: Server-side rendering and static generation for better SEO and performance
2. **TypeScript**: Full type safety, better DX, fewer runtime errors
3. **Performance**: Automatic code splitting, image optimization, font optimization
4. **Modern React**: React 18+ with Server Components support
5. **Zero Config**: Next.js handles routing, bundling, optimization
6. **Vercel Native**: Seamless deployment, edge functions, analytics
7. **Better DX**: Fast Refresh, TypeScript intellisense, better errors
8. **Smaller Bundle**: Next.js tree-shaking and optimization
9. **SEO**: Built-in metadata API, automatic sitemap generation
10. **Future-Proof**: App Router is the future of Next.js

---

## Migration Strategy

**Option 1: Clean Slate (Recommended)**

1. Create new Next.js app with `create-next-app`
2. Copy components one-by-one, converting to TypeScript
3. Test each component as you go
4. Delete old repo when done

**Option 2: In-Place Migration**

1. Install Next.js in current repo
2. Gradually migrate components
3. Run both old and new in parallel
4. Switch over when ready
5. Delete old code

**Recommended: Option 1** - Cleaner, faster, avoids dependency conflicts

---

## Estimated Timeline

- **Phase 1** (Next.js Setup): 30 minutes
- **Phase 2** (Component Migration): 6-8 hours
- **Phase 3** (Scroll State): 1 hour
- **Phase 4** (Data Migration): 2-3 hours
- **Phase 5** (MDX Blog): 3-4 hours
- **Phase 6** (Cleanup): 1 hour
- **Phase 7** (Deployment): 30 minutes
- **Phase 8** (Optimizations): 2-3 hours

**Total**: 3-4 days of focused work

---

## Next.js App Router Benefits

- **Server Components**: Reduce JavaScript bundle size
- **Streaming**: Progressive rendering for faster perceived performance
- **Data Fetching**: Simplified async components
- **Nested Layouts**: Share UI across routes
- **Loading UI**: Built-in loading states
- **Error Handling**: Automatic error boundaries
- **Route Groups**: Organize routes without affecting URL structure
