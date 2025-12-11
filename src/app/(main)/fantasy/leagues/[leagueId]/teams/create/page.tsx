import FantasyShell from '@/components/fantasy/FantasyShell';
import CreateTeamForm from './CreateTeamForm';
import { createClient } from '@/lib/supabase-server';

export default async function CreateTeamPage({ params }: { params: Promise<{ leagueId: string }> }) {
    const supabase = await createClient();
    const { leagueId } = await params;

    return (
        <FantasyShell>
            <div className="container mx-auto px-4 max-w-2xl py-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">
                        Create Your Team
                    </h1>
                    <p className="text-gray-400">
                        Name your franchise and join the competition.
                    </p>
                </div>

                <CreateTeamForm leagueId={leagueId} />
            </div>
        </FantasyShell>
    );
}
