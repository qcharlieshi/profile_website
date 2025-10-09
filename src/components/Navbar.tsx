"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Navbar() {
  const pathname = usePathname();
  const scroll = useStore((state) => state.scroll);
  const [position, setPosition] = useState<"static" | "fixed">("static");

  useEffect(() => {
    // Handle scroll-based positioning for home page
    if (pathname === "/" || pathname === "/home") {
      if (scroll > 450) {
        setPosition("fixed");
      } else {
        setPosition("static");
      }
    }
  }, [scroll, pathname]);

  const getBackgroundColors = () => {
    const defaultColor = "#1D2731";

    const colors = {
      home: defaultColor,
      portfolio: defaultColor,
      blog: defaultColor,
      about: defaultColor,
    };

    switch (pathname) {
      case "/":
      case "/home":
        colors.home = "#328CC1";
        break;
      case "/portfolio":
        colors.portfolio = "#D9B310";
        break;
      case "/blog":
        colors.blog = "#5d8209";
        break;
      case "/about":
        colors.about = "#ad3f0c";
        break;
      default:
        if (pathname.startsWith("/portfolio")) {
          colors.portfolio = "#D9B310";
        } else if (pathname.startsWith("/blog")) {
          colors.blog = "#5d8209";
        }
    }

    return colors;
  };

  const backgroundColors = getBackgroundColors();

  const glyphiconStyle: React.CSSProperties = {
    fontSize: "20px",
    verticalAlign: "10px",
    paddingRight: "10px",
  };

  return (
    <div className="navContainer highlightTextIn" style={{ position }}>
      <Link href="/" style={{ backgroundColor: backgroundColors.home }}>
        <span className="glyphicon glyphicon-home" style={glyphiconStyle} />
        HOME
      </Link>
      <Link
        href="/portfolio"
        style={{ backgroundColor: backgroundColors.portfolio }}
      >
        <span className="glyphicon glyphicon-picture" style={glyphiconStyle} />
        PORTFOLIO
      </Link>
      <Link href="/blog" style={{ backgroundColor: backgroundColors.blog }}>
        <span className="glyphicon glyphicon-list-alt" style={glyphiconStyle} />
        BLOG
      </Link>
      <Link href="/about" style={{ backgroundColor: backgroundColors.about }}>
        <span className="glyphicon glyphicon-user" style={glyphiconStyle} />
        ABOUT
      </Link>
    </div>
  );
}
