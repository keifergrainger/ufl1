'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const STORAGE_KEY = 'bhamstallions_disclaimer_v1';

export default function DisclaimerModal() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const hasSeenDisclaimer = localStorage.getItem(STORAGE_KEY);
        if (!hasSeenDisclaimer) {
            setOpen(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setOpen(false);
    };

    if (!mounted) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            // Prevent closing by clicking outside or pressing ESC unless explicitly handled if desired.
            // But per requirements: "ESC key closes the modal, sets the flag"
            if (!val) {
                // If the user tries to close it (e.g. ESC or backdrop), we interpret that as "I understand"/Dismiss
                // per the prompt: "Secondary: “Close” or an “X” icon... treat it the same as “I Understand” and set the flag"
                handleAccept();
            }
        }}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white" onInteractOutside={(e) => {
                // Optional: strictly enforce button click? Prompt says specific behaviors.
                // "Focus should be trapped... ESC key closes... sets the flag"
                // shadcn Dialog handles focus trap and ESC by default.
            }}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-tight">Unofficial Fan Site Disclaimer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 text-neutral-300 text-sm leading-relaxed">
                    <p>
                        This website is an independent, fan-made project and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the United Football League (UFL), the Birmingham Stallions, or any related organization.
                    </p>
                    <p>
                        All trademarks, service marks, and team names referenced on this site belong to their respective owners.
                    </p>
                    <p>
                        Information provided here is for entertainment and informational purposes only and may not always reflect official league data.
                    </p>
                    <p>
                        If you are a rights holder and want any content updated or removed, please contact us.
                    </p>
                    <p className="text-xs text-neutral-500">
                        By continuing to use this website, you agree to standard cookies and analytics used to improve site performance.
                    </p>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        onClick={handleAccept}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest"
                    >
                        I Understand
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
