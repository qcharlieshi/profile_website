import { XMLParser } from 'fast-xml-parser';
import type { MediumPost } from '../types/index';

const MEDIUM_FEED_URL = 'https://medium.com/feed/@qcharlieshi';

function extractSlug(link: string): string {
  try {
    const url = new URL(link);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1] || '';
    // Medium URLs end with a hash ID after the last hyphen
    const segments = lastPart.split('-');
    segments.pop(); // remove the hash
    return segments.join('-') || lastPart;
  } catch {
    return link.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  }
}

function extractThumbnail(content: string): string {
  const match = content.match(/<img[^>]+src="([^"]+)"/);
  return match?.[1] || '';
}

function stripHtmlForExcerpt(html: string, maxLength = 200): string {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export async function getMediumPosts(): Promise<MediumPost[]> {
  try {
    const response = await fetch(MEDIUM_FEED_URL);
    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: (name) => name === 'item' || name === 'category',
    });
    const feed = parser.parse(xml);
    const items = feed?.rss?.channel?.item || [];

    return items.map((item: any) => ({
      title: item.title || '',
      slug: extractSlug(item.link || ''),
      description: stripHtmlForExcerpt(item['content:encoded'] || item.description || ''),
      pubDate: item.pubDate || '',
      categories: (item.category || []).map((c: any) => (typeof c === 'string' ? c : c['#text'] || '')),
      thumbnail: extractThumbnail(item['content:encoded'] || ''),
      content: item['content:encoded'] || item.description || '',
      link: item.link || '',
    }));
  } catch (error) {
    console.error('Failed to fetch Medium RSS feed:', error);
    return [];
  }
}
