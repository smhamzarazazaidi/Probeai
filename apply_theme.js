import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directory = path.join(__dirname, 'src');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // A mapping from their exact hardcoded classes to exactly what the user asked for

    // 1. Pages Backgrounds
    content = content.replace(/bg-\[#f7f8f6\]/g, 'bg-gray-50');
    content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-gray-900');
    content = content.replace(/dark:bg-\[#0a0a0a\]/g, 'dark:bg-gray-900');

    // Muted text
    content = content.replace(/text-zinc-500/g, 'text-gray-500 dark:text-gray-400');
    content = content.replace(/text-zinc-400/g, 'text-gray-500 dark:text-gray-400');
    content = content.replace(/text-zinc-600/g, 'text-gray-600 dark:text-gray-400');
    content = content.replace(/text-zinc-300/g, 'text-gray-700 dark:text-gray-300');

    // Cards / bg-zinc-900 -> bg-white dark:bg-gray-800
    content = content.replace(/bg-zinc-900\/50/g, 'bg-white dark:bg-gray-800');
    content = content.replace(/bg-zinc-900/g, 'bg-white dark:bg-gray-800');
    content = content.replace(/bg-zinc-950\/50/g, 'bg-gray-50 dark:bg-gray-900');
    content = content.replace(/bg-zinc-950/g, 'bg-gray-50 dark:bg-gray-900');
    content = content.replace(/bg-zinc-800/g, 'bg-gray-100 dark:bg-gray-700');

    // Primary Text
    content = content.replace(/text-\[#111111\]/g, 'text-gray-900');

    // Borders
    content = content.replace(/border-white\/5/g, 'border-gray-200 dark:border-gray-700');
    content = content.replace(/border-white\/10/g, 'border-gray-200 dark:border-gray-700');
    content = content.replace(/border-emerald-500\/20/g, 'border-emerald-500/20 dark:border-emerald-500/10');

    // Muted backgrounds
    content = content.replace(/bg-black\/50/g, 'bg-white/80 dark:bg-gray-900/80');


    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') && !fullPath.includes('ThemeContext.tsx') && !fullPath.includes('ThemeToggle.tsx')) {
            processFile(fullPath);
        }
    }
}

processDirectory(directory);
console.log("Done");
