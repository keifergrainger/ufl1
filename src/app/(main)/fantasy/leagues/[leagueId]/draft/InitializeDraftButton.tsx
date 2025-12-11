'use client';

import { useState } from 'react';
import { initializeDraft } from './actions';

export default function InitializeDraftButton({ leagueId, label = 'Initialize Draft Board' }: { leagueId: string, label?: string }) {
    const [loading, setLoading] = useState(false);

    const handleInit = async () => {
        if (!confirm('Are you sure? This will generate (or reset) the draft order for all teams.')) return;

        setLoading(true);
        try {
            await initializeDraft(leagueId);
            // Router refresh handled by server action revalidatePath, but explicit reload helps ensure state
            window.location.reload();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleInit}
            disabled={loading}
            className="bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-wider py-2 px-4 rounded transition disabled:opacity-50 text-xs"
        >
            {loading ? 'Processing...' : label}
        </button>
    );
}
