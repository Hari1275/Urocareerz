"use client";

import { useEffect, useState } from "react";

export function usePortalSelect() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Ensure all select dropdowns have proper z-index
    const style = document.createElement("style");
    style.textContent = `
      [data-radix-popper-content-wrapper] {
        z-index: 9999 !important;
      }
      [data-slot="select-content"] {
        z-index: 9999 !important;
      }
      [data-radix-portal] {
        z-index: 9999 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return mounted;
}
