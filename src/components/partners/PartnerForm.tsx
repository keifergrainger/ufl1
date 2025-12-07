"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
// Textarea likely not installed in shadcn default add list unless I picked it? I didn't. I'll use a normal textarea or Input.
// Wait, I didn't install textarea. I'll use a standard <textarea> styled with tailwind or just multiple inputs.
// Better: standard textarea with shadcn-like styles.

export default function PartnerForm() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Partner Inquiry Submitted");
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-lg text-center animate-fade-in-up">
                <h3 className="text-2xl font-bold text-green-500 mb-2">Inquiry Received</h3>
                <p className="text-muted-foreground">Thank you for your interest. Our corporate partnerships team will be in touch shortly.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-white/5 p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold uppercase text-muted-foreground">Full Name</label>
                    <Input id="name" placeholder="John Doe" className="bg-black/50 border-white/10 text-white" required />
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold uppercase text-muted-foreground">Email Address</label>
                    <Input id="email" type="email" placeholder="john@company.com" className="bg-black/50 border-white/10 text-white" required />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="company" className="text-sm font-bold uppercase text-muted-foreground">Company Name</label>
                <Input id="company" placeholder="Acme Corp" className="bg-black/50 border-white/10 text-white" required />
            </div>

            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold uppercase text-muted-foreground">Message</label>
                <textarea
                    id="message"
                    rows={4}
                    className="flex w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about your brand goals..."
                    required
                />
            </div>

            <Button type="submit" size="lg" className="w-full bg-secondary text-secondary-foreground font-bold uppercase">
                Submit Inquiry
            </Button>
        </form>
    );
}
