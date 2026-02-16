import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";
import { LightTheme, DarkTheme, AppTheme } from "../theme/theme"

/* ---------- Types ---------- */
export type ThemeMode = "light" | "dark" | "system";

export type ThemeContextType = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

/* ---------- Context ---------- */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/* ---------- Provider ---------- */
export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const systemScheme = useColorScheme(); // "light" | "dark" | null
  const [mode, setMode] = useState<ThemeMode>("system");

//   console.log("System scheme:", systemScheme);
// console.log("Active mode:", mode);


  const theme: AppTheme =
    mode === "system"
      ? systemScheme === "dark"
        ? DarkTheme
        : LightTheme
      : mode === "dark"
      ? DarkTheme
      : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ---------- Hook ---------- */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
