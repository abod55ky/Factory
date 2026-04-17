"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobileOpen: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Default collapsed on mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsCollapsed(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsCollapsed(e.matches);
      if (e.matches) setIsMobileOpen(false);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  const toggleMobileOpen = () => setIsMobileOpen(prev => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobileOpen,
      toggleCollapse,
      toggleMobileOpen,
      closeMobile
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
