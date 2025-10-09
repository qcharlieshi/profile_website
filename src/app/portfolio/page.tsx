import type { Metadata } from "next";
import { portfolioProjects } from "@/data/portfolio";
import PortfolioCard from "@/components/PortfolioCard";

export const metadata: Metadata = {
  title: "Portfolio | Charlie Shi",
  description: "Explore my software engineering projects and technical work",
  openGraph: {
    title: "Portfolio | Charlie Shi",
    description: "Explore my software engineering projects and technical work",
  },
};

export default function PortfolioPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">Portfolio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioProjects.map((item) => (
          <PortfolioCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
