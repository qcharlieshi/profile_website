"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Parallax from "@/components/Parallax";
import Infobox from "@/components/Infobox";
import YellowHeader from "@/components/YellowHeader";

export default function HomePage() {
  const scroll = useStore((state) => state.scroll);
  const [yellowCardStyle, setYellowCardStyle] = useState<React.CSSProperties>({
    opacity: 0,
  });

  useEffect(() => {
    // Scroll page slightly to correct for display errors
    window.scrollTo(50, 50);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Calculate opacity based on scroll position
    const opacity = scroll / 600;
    setYellowCardStyle({ opacity });
  }, [scroll]);

  return (
    <div>
      {/* Parallax Image Components - This would be the ParallaxContainer */}
      {/* TODO: Implement ParallaxContainer with background images */}

      {/* Main black background component with content */}
      <Parallax speed="0.5" color="#1D2731" zindex="-1" top="48%" height="120%">
        <YellowHeader yellowCardStyle={yellowCardStyle} />

        <div className="row" style={{ marginRight: "0px" }}>
          <div className="col-6">
            <Infobox name="Technology" />
          </div>

          <div className="col-6">
            <div className="homepageInfobox" id="infoboxCompanies">
              test content 2
            </div>
          </div>
        </div>

        <Parallax
          speed="0.5"
          color="#D9B310"
          zindex="1000"
          top="75%"
          height="400px"
        />

        <Parallax speed="0.5" color="#1D2731" zindex="-1" top="80%" />
      </Parallax>
    </div>
  );
}
