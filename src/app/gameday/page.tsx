import FAQ from "@/components/gameday/FAQ";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Info, Car, Ticket } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Game Day Info | Birmingham Stallions",
    description: "Everything you need to know for game day at Protective Stadium.",
};

export default function GameDayPage() {
    return (
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl min-h-screen py-12 md:py-20">

            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Game Day Guide</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Your home for Stallions football: <span className="text-white font-bold">Protective Stadium</span>.
                </p>
            </div>

            {/* Main Stadium Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

                {/* Left: Stadium Visual/Info */}
                <Card className="bg-card border-white/10 overflow-hidden group">
                    <div className="h-64 bg-neutral-800 relative flex items-center justify-center overflow-hidden">
                        {/* Placeholder for Stadium Image */}
                        <div className="absolute inset-0 bg-secondary/5 group-hover:bg-secondary/10 transition-colors" />
                        <MapPin className="w-16 h-16 text-muted-foreground/30" />
                        <span className="absolute bottom-4 left-4 font-bold text-white uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-md">Protective Stadium</span>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-2xl font-black uppercase text-white">Getting There</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground">
                            Located in the Uptown District, Protective Stadium offers a world-class fan experience with modern amenities and easy access.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="flex-1 bg-white text-black hover:bg-white/90 font-bold uppercase" asChild>
                                <Link href="https://maps.google.com" target="_blank">
                                    <MapPin className="mr-2 w-4 h-4" /> Get Directions
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="flex-1 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-bold uppercase" asChild>
                                <Link href="#">
                                    <Car className="mr-2 w-4 h-4" /> Parking Maps
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Quick Policies */}
                <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg flex items-start gap-4">
                        <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase mb-2">Clear Bag Policy</h3>
                            <p className="text-sm text-muted-foreground">
                                Protective Stadium enforces a clear bag policy. Approved bags clearly visible.
                                <br /><span className="text-white underline cursor-pointer">Read full policy</span>.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card border border-white/5 p-6 rounded-lg flex items-start gap-4">
                        <Ticket className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase mb-2">Mobile Ticketing</h3>
                            <p className="text-sm text-muted-foreground">
                                All tickets are digital. Please download your tickets to your mobile wallet before arriving at the gate.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-black uppercase text-white mb-8 text-center">Frequently Asked Questions</h2>
                <FAQ />
            </div>
        </div>
    );
}
