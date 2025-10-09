import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = format(new Date(post.date), 'MMM d, yyyy');

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      {/* Featured image */}
      {post.image && (
        <Link href={`/blog/${post.slug}`} className="relative h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      )}

      {/* Card content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Category badge */}
        <Link
          href={`/blog/category/${post.category.toLowerCase()}`}
          className="inline-flex items-center w-fit px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded mb-3 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
        >
          {post.category}
        </Link>

        {/* Title */}
        <h2 className="text-xl font-bold mb-2">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
          {post.description}
        </p>

        {/* Meta information */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
          <time dateTime={post.date}>{formattedDate}</time>
          <span>{post.readingTime}</span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {post.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag.toLowerCase()}`}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                #{tag}
              </Link>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Featured badge */}
      {post.featured && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded shadow">
          Featured
        </div>
      )}
    </article>
  );
}
