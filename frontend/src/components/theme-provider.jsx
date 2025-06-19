import { createContext, useContext, useEffect, useState } from "react";
import useUserPreferencesStore from "../store/useUserPreferencesStore";
import useAuthStore from "../store/useAuthStore";

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => null,
});

export function ThemeProvider({ children }) {
  const { preferences, getPreferences } = useUserPreferencesStore();
  const { isAuthenticated } = useAuthStore();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Only load preferences if user is authenticated
    if (isAuthenticated) {
      getPreferences();
    } else {
      // Reset to default theme when logged out
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, [isAuthenticated, getPreferences]);

  useEffect(() => {
    // Update theme when preferences change
    if (preferences?.theme) {
      setTheme(preferences.theme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(preferences.theme);
    }
  }, [preferences?.theme]);

  // Handle system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(e.matches ? "dark" : "light");
      };

      // Set initial theme
      handleChange(mediaQuery);

      // Listen for changes
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}; 