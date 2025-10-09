import { ReactNode } from 'react';

interface BlogContentProps {
  children: ReactNode;
}

/**
 * BlogContent wrapper component
 * Provides consistent styling for blog post content using @tailwindcss/typography
 */
export default function BlogContent({ children }: BlogContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-lg">
      {children}
    </div>
  );
}
