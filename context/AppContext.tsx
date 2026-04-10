"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AppContextType {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  userStats: {
    views: number;
    engagement: number;
    followers: number;
  };
  setUserStats: (stats: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userStats, setUserStats] = useState({
    views: 124800,
    engagement: 8.42,
    followers: 1204,
  });

  return (
    <AppContext.Provider
      value={{
        activeNav,
        setActiveNav,
        isDarkMode,
        setIsDarkMode,
        userStats,
        setUserStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
