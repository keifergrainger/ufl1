"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import InsiderPreviewModal from "./InsiderPreviewModal";

const ROSTER_PAGE_DELAY_MS = 5000; // 5 seconds after landing on roster page
const COOLDOWN_DAYS = 3; // Show popup again after 3 days
const STORAGE_KEY = "stallions_email_popup_last_action";

export default function InsiderPreviewEntryPoint() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const shouldShowPopup = (): boolean => {
        const lastActionStr = localStorage.getItem(STORAGE_KEY);

        if (!lastActionStr) {
            return true; // First time - show popup
        }

        try {
            const lastActionTime = new Date(lastActionStr).getTime();
            const now = Date.now();
            const daysSinceLastAction = (now - lastActionTime) / (1000 * 60 * 60 * 24);

            return daysSinceLastAction >= COOLDOWN_DAYS; // Show if 3+ days have passed
        } catch (error) {
            return true; // Invalid date - show popup
        }
    };

    useEffect(() => {
        // Check if enough time has passed since last interaction
        if (!shouldShowPopup()) {
            return; // Still in cooldown period
        }

        // TRIGGER 1: Scroll detection for "Join the Herd" section (EmailCapture component)
        const handleScroll = () => {
            // Find the EmailCapture section by looking for the "Join The Herd" heading
            const joinTheHerdSection = Array.from(document.querySelectorAll('h2')).find(
                (h2) => h2.textContent?.includes('Join The Herd')
            );

            if (!joinTheHerdSection) return;

            const rect = joinTheHerdSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

            if (isVisible && shouldShowPopup()) {
                setIsOpen(true);
                window.removeEventListener('scroll', handleScroll);
            }
        };

        // TRIGGER 2: 5 seconds after visiting roster page
        const isRosterPage = pathname?.includes('/roster');

        if (isRosterPage) {
            const timer = setTimeout(() => {
                if (shouldShowPopup()) {
                    setIsOpen(true);
                }
            }, ROSTER_PAGE_DELAY_MS);

            return () => clearTimeout(timer);
        } else {
            // On non-roster pages, set up scroll listener
            window.addEventListener('scroll', handleScroll);
            // Check once on mount in case section is already visible
            handleScroll();

            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [pathname]);

    const handleClose = () => {
        // Record the interaction timestamp - will show again after 3 days
        localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        setIsOpen(false);
    };

    return <InsiderPreviewModal open={isOpen} onClose={handleClose} />;
}
