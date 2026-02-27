import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="
        w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center
        transition-all duration-300
        bg-gray-200 hover:bg-gray-300
        dark:bg-gray-700 dark:hover:bg-gray-600
      "
            aria-label="Toggle theme"
        >
            {isDark
                ? <Sun size={18} className="text-yellow-400 focus:outline-none" />
                : <Moon size={18} className="text-indigo-600 focus:outline-none" />
            }
        </button>
    );
}
