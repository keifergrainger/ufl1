import ContactForm from "@/components/contact/ContactForm";
import { Mail, Newspaper } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us | Birmingham Stallions",
    description: "Get in touch with the team. General and Media inquiries.",
};

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 lg:px-6 max-w-6xl min-h-screen py-12 md:py-20">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Contact Us</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We want to hear from you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

                {/* General Contact */}
                <div className="bg-card border border-white/10 rounded-lg p-8">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-white">General Inquiries</h2>
                            <p className="text-sm text-muted-foreground">Fan feedback, ticket questions, and general info.</p>
                        </div>
                    </div>
                    <ContactForm type="general" />
                </div>

                {/* Media Contact */}
                <div className="bg-card border border-white/10 rounded-lg p-8">
                    <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <Newspaper className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-white">Media Requests</h2>
                            <p className="text-sm text-muted-foreground">Press credentials, interview requests, and PR.</p>
                        </div>
                    </div>
                    <ContactForm type="media" />
                </div>

            </div>
        </div>
    );
}
