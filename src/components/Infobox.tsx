"use client";

import Image from "next/image";
import type { InfoboxProps } from "@/types";

export default function Infobox({ name }: InfoboxProps) {
  const technologies = [
    { src: "/images/icons/postgres.png", alt: "PostgreSQL" },
    { src: "/images/icons/node.png", alt: "Node.js" },
    { src: "/images/icons/javascript.png", alt: "JavaScript" },
    { src: "/images/icons/react.png", alt: "React" },
    { src: "/images/icons/redux.png", alt: "Redux" },
    { src: "/images/icons/webpack.png", alt: "Webpack" },
    { src: "/images/icons/git.png", alt: "Git" },
    // Repeat for looping animation effect
    { src: "/images/icons/postgres.png", alt: "PostgreSQL" },
    { src: "/images/icons/node.png", alt: "Node.js" },
    { src: "/images/icons/javascript.png", alt: "JavaScript" },
    { src: "/images/icons/react.png", alt: "React" },
  ];

  return (
    <div className="homepageInfobox">
      <div
        style={{
          margin: "-20px",
          backgroundColor: "#D9B310",
          height: "50px",
        }}
      >
        <h3 className="infoboxText">{name}</h3>
      </div>

      <div style={{ margin: "20px", marginTop: "40px" }}>
        <div style={{ width: "1400px", height: "200px", overflow: "hidden" }}>
          {technologies.map((tech, index) => (
            <img
              key={`${tech.alt}-${index}`}
              src={tech.src}
              alt={tech.alt}
              className={index === 0 ? "first" : ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
