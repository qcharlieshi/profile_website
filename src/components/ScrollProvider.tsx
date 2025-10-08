"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { throttle } from "@/lib/utils";

export default function ScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setScroll = useStore((state) => state.setScroll);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setScroll(window.scrollY);
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScroll]);

  return <>{children}</>;
}
