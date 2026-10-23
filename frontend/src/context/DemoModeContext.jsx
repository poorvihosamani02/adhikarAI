import React, { createContext, useContext, useState, useEffect } from 'react';

const DemoModeContext = createContext();

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('adhikar_demo_mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('adhikar_demo_mode', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => setIsDemoMode((prev) => !prev);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, setIsDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
