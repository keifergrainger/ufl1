"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Branding from "./Branding";
import { Button } from "./ui/button";
import { Menu, Ticket } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { analytics } from "@/lib/analytics";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/schedule", label: "Schedule" },
    { href: "/roster", label: "Roster" },
    { href: "/fantasy", label: "Fantasy" },
    { href: "/history", label: "History" },
    { href: "/gameday", label: "Game Day" },
    { href: "/partners", label: "Partners" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleTicketClick = () => {
        analytics.logTicketClick();
        console.log("Ticket clicked");
    };

    const handleMerchClick = () => {
        analytics.logMerchClick();
        console.log("Merch clicked");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-20 items-center justify-between">
                {/* Left: Branding */}
                <div className="flex-shrink-0">
                    <Branding />
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden xl:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary",
                                pathname === link.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Merch Link (Added for Analytics Demo) */}
                    <Button
                        variant="ghost"
                        className="hidden sm:flex font-bold uppercase tracking-wider px-4 text-white hover:text-red-500 transition-colors"
                        asChild
                    >
                        <Link
                            href="https://shop.theufl.com/shop-by-team/birmingham-stallions/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleMerchClick}
                        >
                            Shop
                        </Link>
                    </Button>

                    <Button
                        className="hidden sm:flex bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold uppercase tracking-wider px-6"
                        size="lg"
                        asChild
                    >
                        <Link
                            href="https://www.theufl.com/birmingham-tickets"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleTicketClick}
                        >
                            <Ticket className="w-4 h-4 mr-2" />
                            Buy Tickets
                        </Link>
                    </Button>

                    {/* Mobile Menu Trigger */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="xl:hidden text-muted-foreground hover:text-foreground">
                                <Menu className="w-6 h-6" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-l-white/10 bg-black/95">
                            <div className="flex flex-col gap-8 mt-8">
                                <Branding />
                                <nav className="flex flex-col gap-4">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "text-lg font-medium uppercase tracking-wider transition-colors py-2 border-b border-white/5",
                                                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-white"
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-4 space-y-4">
                                    <Button
                                        className="w-full bg-neutral-800 text-white font-bold uppercase"
                                        size="lg"
                                        asChild
                                    >
                                        <Link
                                            href="https://shop.theufl.com/shop-by-team/birmingham-stallions/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleMerchClick}
                                        >
                                            Shop Merch
                                        </Link>
                                    </Button>
                                    <Button
                                        className="w-full bg-secondary text-secondary-foreground font-bold uppercase"
                                        size="lg"
                                        asChild
                                    >
                                        <Link
                                            href="https://www.theufl.com/birmingham-tickets"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={handleTicketClick}
                                        >
                                            Buy Tickets
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
