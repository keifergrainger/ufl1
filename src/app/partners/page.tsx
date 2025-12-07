import PartnerForm from "@/components/partners/PartnerForm";
import { partners, PartnerTier } from "@/data/partners";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Partners | Birmingham Stallions",
    description: "Official partners of the 3-time Champion Birmingham Stallions.",
};

export default function PartnersPage() {
    const tiers: PartnerTier[] = ["Premier", "Official", "Supporting"];

    return (
        <div className="container min-h-screen py-12 md:py-20">
            <div className="text-center mb-20">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Our Partners</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Champions on the field. Champions in the community. Powered by world-class organizations.
                </p>
            </div>

            {/* Partner Logos */}
            <div className="space-y-20 mb-32">
                {tiers.map((tier) => {
                    const tierPartners = partners.filter(p => p.tier === tier);
                    if (tierPartners.length === 0) return null;

                    return (
                        <div key={tier} className="text-center">
                            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-12 border-b border-white/5 pb-4 inline-block">
                                {tier} Partners
                            </h2>
                            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                                {tierPartners.map((partner) => (
                                    <div key={partner.id} className="group flex flex-col items-center">
                                        {/* Logo Placeholder */}
                                        <div className="w-48 h-24 bg-white/5 rounded flex items-center justify-center border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500 hover:bg-white/10 hover:border-white/10 hover:scale-105">
                                            <span className="text-white/30 font-bold uppercase group-hover:text-white transition-colors">
                                                {partner.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CTA Section */}
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black uppercase text-white mb-2">Become a Partner</h2>
                    <p className="text-muted-foreground">Join the herd and grow your brand with the UFL&apos;s most dominant franchise.</p>
                </div>
                <PartnerForm />
            </div>
        </div>
    );
}
