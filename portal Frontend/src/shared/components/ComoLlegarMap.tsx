import React from "react";
import type { MapProps } from "../types/MapProps";

export const GMaps: React.FC<MapProps> = ({ origin, destination }) => {
  const url = `https://www.google.com/maps/embed/v1/directions?key=TU_API_KEY&q=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`;

  return (
    <div className="rounded overflow-hidden shadow-sm my-3">
      <iframe
        src={url}
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
};
