import { Metadata } from 'next';
import Link from 'next/link';
import { getAllCategories, getPostsByCategory } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';

interface PageProps {
  params: Promise<{ category: string }>;
}

// Generate static paths for all categories
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({
    category: category.toLowerCase(),
  }));
}

// Generate metadata for each category
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${formattedCategory} Posts | Charlie Shi`,
    description: `Blog posts about ${formattedCategory}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const posts = getPostsByCategory(category);
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Back to blog link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          ← Back to All Posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {formattedCategory}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this category
          </p>
        </header>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No posts found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
