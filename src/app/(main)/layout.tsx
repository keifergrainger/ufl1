import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DisclaimerModal from "@/components/disclaimer/DisclaimerModal";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";
import { Suspense } from "react";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <Suspense fallback={null}>
                <AnalyticsTracker />
            </Suspense>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <DisclaimerModal />
        </div>
    );
}
