"use client";

import { useEffect, useState } from "react";

export function useDevice() {
  const [device, setDevice] = useState<"mobile" | "pc">("pc");

  useEffect(() => {
    function checkDevice() {
      if (window.innerWidth <= 768) {
        setDevice("mobile");
      } else {
        setDevice("pc");
      }
    }

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return device;
}