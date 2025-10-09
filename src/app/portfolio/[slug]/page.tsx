import { notFound } from "next/navigation";
import { portfolioProjects } from "@/data/portfolio";
import Image from "next/image";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths at build time
export async function generateStaticParams() {
  return portfolioProjects.map((item) => ({
    slug: item.id,
  }));
}

export default async function PortfolioItemPage({ params }: PageProps) {
  const { slug } = await params;
  const item = portfolioProjects.find((i) => i.id === slug);

  if (!item) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12">
      <h1 className="text-5xl font-bold mb-4">{item.title}</h1>
      {item.image && (
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={630}
          className="rounded-lg"
        />
      )}
      <p className="text-lg mt-6">{item.description}</p>
      <div className="flex gap-2 mt-4">
        {item.tags.map((tech) => (
          <span key={tech} className="px-3 py-1 bg-blue-100 rounded">
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}
