import { createContext, useContext, useEffect, useLayoutEffect, useState, useMemo } from "react";
const ThemeContext = createContext(void 0);
const THEME_STORAGE_KEY = "fitsync-theme";
function applyThemeToDOM(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
    root.style.colorScheme = "light";
  }
}
function getInitialTheme() {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
  } catch {
  }
  return "dark";
}
if (typeof window !== "undefined") {
  applyThemeToDOM(getInitialTheme());
}
const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const initial = getInitialTheme();
    applyThemeToDOM(initial);
    return initial;
  });
  useLayoutEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          const sysTheme = e.matches ? "dark" : "light";
          applyThemeToDOM(sysTheme);
          setThemeState(sysTheme);
        }
      } catch {
      }
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);
  const setTheme = (newTheme) => {
    applyThemeToDOM(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Unable to persist theme to localStorage", e);
    }
    setThemeState(newTheme);
  };
  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const nextTheme = prevTheme === "dark" ? "light" : "dark";
      applyThemeToDOM(nextTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch (e) {
        console.warn("Unable to persist theme to localStorage", e);
      }
      return nextTheme;
    });
  };
  const isDark = theme === "dark";
  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme
    }),
    [theme, isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
export {
  THEME_STORAGE_KEY,
  ThemeProvider,
  applyThemeToDOM,
  getInitialTheme,
  useTheme
};
