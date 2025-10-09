import Image from "next/image";
import Link from "next/link";
import { PortfolioProject } from "@/data/portfolio";

interface PortfolioCardProps {
  item: PortfolioProject;
}

export default function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link href={`/portfolio/${item.id}`} className="block group">
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        {item.image && (
          <div className="relative h-48 w-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
