import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateToken(length: number = 8): string {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}
