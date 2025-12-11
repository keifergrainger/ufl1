import Link from 'next/link';
// import { createLeague } from '../actions'; // No longer used directly here
import CreateLeagueForm from './CreateLeagueForm';
import FantasyShell from '@/components/fantasy/FantasyShell';

export default function CreateLeaguePage() {
    return (
        <FantasyShell>
            <div className="container mx-auto px-4 max-w-2xl py-12">
                <div className="mb-8">
                    <Link href="/fantasy" className="text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-wider">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                <div className="bg-neutral-900 border border-white/10 rounded-xl p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-white mb-2 uppercase italic">Create League</h1>
                    <p className="text-gray-400 mb-8 border-b border-white/5 pb-6">
                        Set up your new league. You will be assigned as the Commissioner.
                    </p>

                    <CreateLeagueForm />
                </div>
            </div>
        </FantasyShell>
    );
}
