"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { subscribeToMailingList } from "@/app/actions";
import { X, Mail, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InsiderPreviewModalProps {
    open: boolean;
    onClose: () => void;
}

export default function InsiderPreviewModal({ open, onClose }: InsiderPreviewModalProps) {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setStatus('idle');
            setErrorMessage('');
            setEmail('');
        }
    }, [open]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    // Focus trap
    useEffect(() => {
        if (open && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            const handleTab = (e: KeyboardEvent) => {
                if (e.key !== 'Tab') return;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            };

            window.addEventListener('keydown', handleTab);
            firstElement?.focus();

            return () => window.removeEventListener('keydown', handleTab);
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setErrorMessage('Please enter a valid email address');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('source', 'insider_preview_popup');

        startTransition(async () => {
            const result = await subscribeToMailingList(formData);
            if (result.error) {
                setStatus('error');
                setErrorMessage(result.error);
            } else {
                setStatus('success');
                // Auto-close after 2 seconds
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        });
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-4xl mx-auto rounded-xl border bg-card text-card-foreground shadow-2xl overflow-hidden animate-scale-in flex flex-col md:grid md:grid-cols-[1.4fr_1fr]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/20"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Column: Main Content */}
                <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center relative order-1">
                    {status === 'success' ? (
                        <div className="text-center py-10 animate-fade-in-up space-y-6">
                            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-secondary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">
                                    You're on the list.
                                </h3>
                                <p className="text-muted-foreground">Watch your inbox before kickoff.</p>
                            </div>
                            <Button
                                onClick={onClose}
                                className="w-full sm:w-auto min-w-[140px] font-bold"
                            >
                                Got it
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <div className="h-1 w-12 bg-secondary rounded-full" />
                                    <div className="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">
                                        Stallions Email Scout
                                    </div>
                                </div>

                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                                    Get the breakdown before you sit down.
                                </h2>

                                <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-lg">
                                    One short email before each Stallions game — the line in plain English, who’s banged up, and the one thing that actually matters before kickoff.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 mt-8 max-w-md w-full">
                                <Input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="h-11"
                                    required
                                    disabled={isPending}
                                    autoFocus
                                />

                                {status === 'error' && (
                                    <p className="text-destructive text-xs flex items-center gap-1.5 font-medium">
                                        <span className="w-1.5 h-1.5 bg-destructive rounded-full" />
                                        {errorMessage}
                                    </p>
                                )}

                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 font-bold text-base shadow-sm"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            "Send me this week’s scout"
                                        )}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full text-center text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors py-1"
                                    >
                                        I’ll figure it out myself
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-border w-full">
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Fan-made site. Not affiliated with the UFL or the Birmingham Stallions.
                                    <br />
                                    1–2 emails per week max. Unsubscribe anytime.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column / Bottom Mobile: "What you get" */}
                {/* Desktop: Right Col, Mobile: Order 2 (below content) */}
                <div className="bg-muted/30 border-t md:border-t-0 md:border-l border-border p-6 md:p-8 flex flex-col justify-center order-2">
                    <div className="space-y-6 max-w-sm mx-auto md:mx-0">
                        <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-widest border-b border-border pb-2">
                            Today’s email gives you:
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-foreground/80">
                                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                <span>Matchup context in under 90 seconds</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-foreground/80">
                                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                <span>Key injuries and who’s trending up or down</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-foreground/80">
                                <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                                <span>One “if you only know one thing, know this” note before kickoff</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
