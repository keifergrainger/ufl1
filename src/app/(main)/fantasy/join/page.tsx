import FantasyShell from '@/components/fantasy/FantasyShell';

export default function JoinLeaguePage() {
    return (
        <FantasyShell>
            <div className="container mx-auto px-4 max-w-2xl py-40 text-center">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">
                    Join League
                </h1>
                <p className="text-xl text-gray-500 mb-8">
                    Joining via invite code is coming soon.
                </p>
                <p className="text-gray-400">
                    For now, ask your commissioner to add you manually, or check out the public Demo League.
                </p>
            </div>
        </FantasyShell>
    );
}
