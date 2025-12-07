import Branding from "./Branding";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/50 py-12">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Column 1: Brand & Socials */}
                <div className="space-y-4">
                    <Branding />
                    <p className="text-sm text-muted-foreground">
                        The premier professional football team of Birmingham, Alabama. 3x Champions.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                            <Facebook className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h3 className="font-bold text-white uppercase tracking-wider mb-4">Team</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/roster" className="hover:text-primary">Roster</Link></li>
                        <li><Link href="/schedule" className="hover:text-primary">Schedule</Link></li>
                        <li><Link href="/history" className="hover:text-primary">History</Link></li>
                        <li><Link href="/partners" className="hover:text-primary">Partners</Link></li>
                    </ul>
                </div>

                {/* Column 3: Fan Zone */}
                <div>
                    <h3 className="font-bold text-white uppercase tracking-wider mb-4">Gameday</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><Link href="/gameday" className="hover:text-primary">Stadium Guide</Link></li>
                        <li><Link href="#" className="hover:text-primary">Tickets</Link></li>
                        <li><Link href="#" className="hover:text-primary">Shop</Link></li>
                        <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Column 4: Newsletter placeholder or logo */}
                <div className="flex flex-col justify-end">
                    <p className="text-xs text-muted-foreground text-right border-t border-white/10 pt-4 mt-auto">
                        &copy; {new Date().getFullYear()} Birmingham Stallions Fan Site.
                        <br />
                        <span className="opacity-50">Unofficial concept. Not affiliated with UFL.</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
