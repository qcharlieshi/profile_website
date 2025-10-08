// Common type definitions for the portfolio website

export interface NavbarProps {
  scroll?: number;
}

export interface InfoboxProps {
  name: string;
}

export interface ParallaxProps {
  speed?: string | number;
  height?: string;
  top?: string;
  left?: string;
  right?: string;
  maxTop?: string | null;
  zindex?: string | number;
  color?: string;
  image?: string;
  children?: React.ReactNode;
}

export interface YellowHeaderProps {
  yellowCardStyle?: React.CSSProperties;
}

// Re-export all types
export * from "./portfolio";
export * from "./blog";
