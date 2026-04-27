"use client";

import { useEffect, useState } from "react";

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: 1000,
    height: 1000,
  });

  useEffect(() => {
    function handleResize() {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenSize;
}