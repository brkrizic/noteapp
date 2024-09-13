import React, { createContext, useState, useContext } from 'react';
import { Appearance } from 'react-native';

// Define your light and dark theme styles here
const themes = {
  light: {
    background: '#F5F5F5',
    color: '#333',
    header: '#FFF',
    noteBackground: '#FFF',
    noteText: '#333',
  },
  dark: {
    background: '#121212',
    color: '#E0E0E0',
    header: '#333',
    noteBackground: '#1F1F1F',
    noteText: '#E0E0E0',
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(Appearance.getColorScheme() || 'light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useThemeStyles = () => {
  const { theme } = useTheme();
  return themes[theme];
};
