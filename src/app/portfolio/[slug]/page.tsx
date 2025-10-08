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
