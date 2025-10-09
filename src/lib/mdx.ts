import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

/**
 * Serialize MDX content with configured plugins
 * @param content - Raw MDX content string
 * @returns Serialized MDX result
 */
export async function serializeMDX(
  content: string
): Promise<MDXRemoteSerializeResult> {
  const mdxSource = await serialize(content, {
    // MDX options
    mdxOptions: {
      // Remark plugins (markdown processing)
      remarkPlugins: [
        // GitHub Flavored Markdown support (tables, strikethrough, task lists, etc.)
        remarkGfm,
      ],
      // Rehype plugins (HTML processing)
      rehypePlugins: [
        // Add IDs to headings for anchor links
        rehypeSlug,
        // Add anchor links to headings
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: {
              className: ['anchor'],
            },
          },
        ],
        // Syntax highlighting for code blocks
        rehypeHighlight,
      ],
      format: 'mdx',
    },
    // Parse frontmatter (handled by gray-matter separately)
    parseFrontmatter: false,
  });

  return mdxSource;
}

/**
 * MDX components mapping for custom rendering
 * These can be used to customize how MDX elements are rendered
 */
export const mdxComponents = {
  // Custom component examples:
  // h1: (props: any) => <h1 className="text-4xl font-bold mb-4" {...props} />,
  // h2: (props: any) => <h2 className="text-3xl font-bold mb-3 mt-8" {...props} />,
  // p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  // a: (props: any) => <a className="text-blue-600 hover:underline" {...props} />,
  // code: (props: any) => <code className="bg-gray-100 px-1 rounded" {...props} />,
  // Add more custom components as needed
};
