"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ContactForm({ type = "general" }: { type?: "general" | "media" }) {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Contact Form Submitted (${type})`);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="bg-white/5 border border-white/10 p-8 rounded-lg text-center animate-fade-in-up">
                <h3 className="text-xl font-bold text-white mb-2">Message Sent</h3>
                <p className="text-muted-foreground">
                    {type === "media" ? "Our press secretary will respond to your inquiry soon." : "Thanks for reaching out! Go Stallions!"}
                </p>
                <Button variant="link" className="text-secondary mt-4" onClick={() => setSubmitted(false)}>Send another</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Your Name</label>
                    <Input placeholder="Jane Doe" className="bg-black/40 border-white/10 text-white" required />
                </div>

                {type === "media" && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Media Outlet / Publication</label>
                        <Input placeholder="Birmingham News" className="bg-black/40 border-white/10 text-white" required />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                    <Input type="email" placeholder="jane@example.com" className="bg-black/40 border-white/10 text-white" required />
                </div>

                {type === "media" && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Deadline (Optional)</label>
                        <Input placeholder="MM/DD/YYYY" className="bg-black/40 border-white/10 text-white" />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                    {type === "media" ? "Inquiry Details" : "Message"}
                </label>
                <textarea
                    rows={4}
                    className="flex w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={type === "media" ? "Please specify interview request or credential needs..." : "How can we help?"}
                    required
                />
            </div>

            <Button type="submit" size="lg" className="w-full bg-secondary text-secondary-foreground font-bold uppercase">
                {type === "media" ? "Submit Request" : "Send Message"}
            </Button>
        </form>
    );
}
