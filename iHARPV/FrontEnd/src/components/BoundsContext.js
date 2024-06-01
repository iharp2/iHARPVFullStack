import React, { createContext, useState } from "react";

export const BoundsContext = createContext();

export const BoundsProvider = ({ children }) => {
  const [drawnShapeBounds, setDrawnShapeBounds] = useState(null);

  return (
    <BoundsContext.Provider value={{ drawnShapeBounds, setDrawnShapeBounds }}>
      {children}
    </BoundsContext.Provider>
  );
};
