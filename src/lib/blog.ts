import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { BlogPost, BlogFrontmatter } from '@/types/blog';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllPosts(): BlogPost[] {
  // Check if the content directory exists
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);

  const posts = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      // Extract slug from filename (e.g., "2024-01-15-first-post.mdx" -> "first-post")
      const slug = fileName.replace(/\.mdx$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      const { data, content } = matter(fileContents);
      const frontmatter = data as BlogFrontmatter;

      // Calculate reading time
      const stats = readingTime(content);

      return {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        author: frontmatter.author,
        category: frontmatter.category,
        tags: frontmatter.tags,
        image: frontmatter.image,
        readingTime: stats.text,
        content,
        featured: frontmatter.featured,
      } as BlogPost;
    })
    .sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

/**
 * Get a single blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | null {
  // Check if the content directory exists
  if (!fs.existsSync(contentDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(contentDirectory);

  // Find the file that matches the slug
  const fileName = fileNames.find((name) => {
    const fileSlug = name.replace(/\.mdx$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return fileSlug === slug;
  });

  if (!fileName) {
    return null;
  }

  const fullPath = path.join(contentDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);
  const frontmatter = data as BlogFrontmatter;

  // Calculate reading time
  const stats = readingTime(content);

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    author: frontmatter.author,
    category: frontmatter.category,
    tags: frontmatter.tags,
    image: frontmatter.image,
    readingTime: stats.text,
    content,
    featured: frontmatter.featured,
  };
}

/**
 * Get all posts filtered by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) =>
    post.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get all posts filtered by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const allPosts = getAllPosts();
  const categories = allPosts.map((post) => post.category);
  return Array.from(new Set(categories));
}

/**
 * Get all unique tags
 */
export function getAllTags(): string[] {
  const allPosts = getAllPosts();
  const tags = allPosts.flatMap((post) => post.tags);
  return Array.from(new Set(tags));
}

/**
 * Get featured posts only
 */
export function getFeaturedPosts(): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.filter((post) => post.featured === true);
}

/**
 * Get recent posts (limit specified)
 */
export function getRecentPosts(limit: number = 5): BlogPost[] {
  const allPosts = getAllPosts();
  return allPosts.slice(0, limit);
}

/**
 * Get posts count by category
 */
export function getPostCountByCategory(): Record<string, number> {
  const allPosts = getAllPosts();
  const counts: Record<string, number> = {};

  allPosts.forEach((post) => {
    counts[post.category] = (counts[post.category] || 0) + 1;
  });

  return counts;
}

/**
 * Get posts count by tag
 */
export function getPostCountByTag(): Record<string, number> {
  const allPosts = getAllPosts();
  const counts: Record<string, number> = {};

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return counts;
}
