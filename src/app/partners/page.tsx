import PartnerForm from "@/components/partners/PartnerForm";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
    title: "Partners | Birmingham Stallions",
    description: "Official partners of the 3-time Champion Birmingham Stallions.",
};

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
    const supabase = await createClient();
    const { data: partners } = await supabase.from('partners').select('*');

    // Fallback if DB is empty or error, use empty array
    const allPartners = partners || [];
    const tiers = ["Premier", "Official", "Supporting"];

    return (
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl min-h-screen py-12 md:py-20">
            <div className="text-center mb-20">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Our Partners</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Champions on the field. Champions in the community. Powered by world-class organizations.
                </p>
            </div>

            {/* Partner Logos */}
            <div className="space-y-20 mb-32">
                {tiers.map((tier) => {
                    const tierPartners = allPartners.filter((p: any) => p.tier === tier);
                    if (tierPartners.length === 0) return null;

                    return (
                        <div key={tier} className="text-center">
                            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-12 border-b border-white/5 pb-4 inline-block">
                                {tier} Partners
                            </h2>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {tierPartners.map((partner: any) => (
                                    <div key={partner.id} className="group flex flex-col items-center">
                                        {/* Logo Placeholder */}
                                        <a
                                            href={partner.link || '#'}
                                            target={partner.link ? "_blank" : "_self"}
                                            className="w-full h-32 bg-white/5 rounded flex items-center justify-center border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-500 hover:bg-white/10 hover:border-white/10 hover:scale-105 overflow-hidden p-4"
                                        >
                                            {partner.logo_url ? (
                                                <img src={partner.logo_url} alt={partner.name} className="object-contain w-full h-full" />
                                            ) : (
                                                <span className="text-white/30 font-bold uppercase group-hover:text-white transition-colors">
                                                    {partner.name}
                                                </span>
                                            )}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {allPartners.length === 0 && (
                    <div className="text-center text-neutral-500 italic">
                        Partner applications are currently being processed. Check back soon.
                    </div>
                )}
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
