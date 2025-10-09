import { Metadata } from 'next';
import Link from 'next/link';
import { getAllTags, getPostsByTag } from '@/lib/blog';
import BlogCard from '@/components/blog/BlogCard';

interface PageProps {
  params: Promise<{ tag: string }>;
}

// Generate static paths for all tags
export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

// Generate metadata for each tag
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return {
    title: `#${formattedTag} Posts | Charlie Shi`,
    description: `Blog posts tagged with ${formattedTag}`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);
  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

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
            #{formattedTag}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} with this tag
          </p>
        </header>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No posts found with this tag.
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
