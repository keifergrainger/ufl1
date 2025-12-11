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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-6 h-6" />
                </button>

                {status === 'success' ? (
                    // Success State
                    <div className="text-center py-4 animate-fade-in-up">
                        <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Preview is on the way.
                        </h3>
                        <p className="text-gray-400">Check your inbox.</p>
                    </div>
                ) : (
                    // Form State
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                                Get Your Stallions Insider Preview — Instantly.
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                                Unlock this week's matchup breakdown, key players to watch, injury updates,
                                and bold predictions — instantly delivered to your inbox.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-10 h-12 bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-secondary focus-visible:border-secondary w-full"
                                    required
                                    disabled={isPending}
                                    autoFocus
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-red-400 text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                                    {errorMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-secondary hover:bg-secondary/90 text-black font-bold uppercase tracking-wide text-sm transition-all hover:scale-[1.02]"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Send My Insider Preview"
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                            >
                                Not now
                            </button>
                        </form>

                        <div className="pt-4 border-t border-white/10 space-y-1">
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Fan-made site. Not affiliated with the UFL or the Birmingham Stallions.
                            </p>
                            <p className="text-xs text-gray-500">
                                1–2 emails per week max. Unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
