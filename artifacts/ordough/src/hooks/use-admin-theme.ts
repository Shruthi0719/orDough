import { useState } from "react";

const STORAGE_KEY = "ordough-admin-theme";

export function useAdminTheme() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
      } catch {}
      return next;
    });
  };

  return { isDark, toggle };
}
