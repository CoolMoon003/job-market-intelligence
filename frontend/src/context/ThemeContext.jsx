import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
    theme: "dark",
    toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem("careerpilot-theme") || "dark";
        } catch {
            return "dark";
        }
    });

    useEffect(() => {
        document.documentElement.classList.toggle("light", theme === "light");
        try {
            localStorage.setItem("careerpilot-theme", theme);
        } catch {
            // localStorage unavailable - not critical, theme just won't persist
        }
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}