"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { subscribeToMailingList } from "@/app/actions";

export default function EmailCapture() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await subscribeToMailingList(formData);
            if (result.error) {
                setStatus('error');
                setErrorMessage(result.error);
            } else {
                setStatus('success');
            }
        });
    };

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background color block */}
            <div className="absolute inset-0 bg-primary/20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 to-background -z-10" />

            <div className="container max-w-3xl text-center">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6">Join The Herd</h2>
                <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-xl mx-auto">
                    Get ticket offers, gameday alerts, and team news — <span className="text-white font-bold">no spam</span>.
                </p>

                {status === 'success' ? (
                    <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-8 animate-fade-in-up">
                        <CheckCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
                        <span className="text-secondary font-bold text-xl block mb-2">Welcome to the Family!</span>
                        <p className="text-muted-foreground">You are now subscribed to team updates.</p>
                    </div>
                ) : (
                    <div className="w-full max-w-md mx-auto">
                        <form action={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative flex-grow w-full">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email address"
                                    className="pl-10 h-14 bg-black/50 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-secondary w-full"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="h-14 w-full sm:w-auto px-8 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wide"
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
                            </Button>
                        </form>
                        {status === 'error' && (
                            <div className="text-red-500 text-sm mt-4 flex items-center justify-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errorMessage}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-4">
                            1–2 emails per week. Unsubscribe anytime.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
