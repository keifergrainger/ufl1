
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabaseUrl = 'https://dxcidrdvuucenbnnxres.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y2lkcmR2dXVjZW5ibm54cmVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTA2NDc2MywiZXhwIjoyMDgwNjQwNzYzfQ.lN12vTWMXBqRJzqTW_5a5gOhUNnDdASoPZC-6roZkK4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: players, error } = await supabase
        .from('players')
        .select('id, name, stats')
        .eq('status', 'approved');

    if (error) {
        console.error(error);
        return;
    }

    if (!players || players.length === 0) {
        console.log('No approved players found.');
        return;
    }

    console.log(`Found ${players.length} approved players.`);
    const output = players.map(p => ({
        name: p.name,
        stats: p.stats
    }));

    writeFileSync('player-stats-debug.json', JSON.stringify(output, null, 2));
    console.log('Wrote to player-stats-debug.json');
}

main();
