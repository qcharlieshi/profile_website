"use client";

import { useEffect, useRef, CSSProperties } from "react";
import { throttle } from "@/lib/utils";
import type { ParallaxProps } from "@/types";

export default function Parallax({
  speed = 1,
  height = "100%",
  top = "0%",
  left,
  right,
  maxTop = null,
  zindex = "0",
  color = null,
  image,
  children,
}: ParallaxProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const topValueRef = useRef<number>(0);

  useEffect(() => {
    // Convert top to px value
    const getTopValue = (topStr: string): number => {
      if (topStr.indexOf("%") > -1) {
        return window.innerHeight * (parseFloat(topStr.replace("%", "")) / 100);
      }
      return parseInt(topStr, 10);
    };

    topValueRef.current = getTopValue(top);

    const handleScroll = throttle(() => {
      if (!parallaxRef.current) return;

      const speedNum = typeof speed === "string" ? parseFloat(speed) : speed;
      const pageTop = window.scrollY;
      const newTop = topValueRef.current - pageTop * speedNum;

      parallaxRef.current.style.transform = `translate3d(0, ${newTop}px, 0)`;
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, top]);

  const style: CSSProperties = {
    position: "absolute",
    width: "100%",
    height,
    top,
    left,
    right,
    zIndex: typeof zindex === "string" ? parseInt(zindex) : zindex,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: color || undefined,
    backgroundImage: image ? `url(${image})` : undefined,
  };

  return (
    <div ref={parallaxRef} style={style}>
      {children}
    </div>
  );
}
