import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollProvider from "@/components/ScrollProvider";

export const metadata: Metadata = {
  title: "Charlie Shi - Portfolio",
  description: "Full Stack Software Engineer & Designer portfolio website",
  openGraph: {
    title: "Charlie Shi - Portfolio",
    description:
      "Full Stack Software Engineer & Designer specializing in web development",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ScrollProvider>
          <Navbar />
          <main>{children}</main>
        </ScrollProvider>
      </body>
    </html>
  );
}
