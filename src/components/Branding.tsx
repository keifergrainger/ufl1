import { Shield } from "lucide-react";
import Link from "next/link";

export default function Branding({ className, showText = true }: { className?: string; showText?: boolean }) {
    return (
        <Link href="/" className={`flex items-center gap-2 group ${className}`}>
            {/* Placeholder Logo - A simple shield combining the colors */}
            <div className="relative flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full border border-secondary/20 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary fill-primary/20" />
            </div>

            {showText && (
                <div className="flex flex-col leading-none uppercase font-bold tracking-tighter">
                    <span className="text-sm text-secondary">Birmingham</span>
                    <span className="text-xl text-foreground">Stallions</span>
                </div>
            )}
        </Link>
    );
}
