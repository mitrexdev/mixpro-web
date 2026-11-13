"use client";
import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
const key = "mixpro.theme";
function preference() {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
export default function ThemeToggle() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      document.documentElement.dataset.theme =
        preference() || (media.matches ? "dark" : "light");
    };
    const storage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) sync();
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", storage);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", storage);
    };
  }, []);
  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={() => {
        const theme =
          document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = theme;
        try {
          localStorage.setItem(key, theme);
        } catch {}
      }}
    >
      <Moon className="theme-moon" size={19} aria-hidden="true" />
      <Sun className="theme-sun" size={19} aria-hidden="true" />
      <span className="sr-only theme-to-dark">Switch to dark mode</span>
      <span className="sr-only theme-to-light">Switch to light mode</span>
    </button>
  );
}
